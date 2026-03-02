import { NextRequest, NextResponse } from "next/server";
import { generatePolicyStream, markdownToHtml } from "@/lib/policy-generator";
import { getDb, persistDb } from "@/lib/db";
import { generateId } from "@/lib/utils";
import { checkRateLimit } from "@/lib/rate-limit";

/** Set of policyIds currently being generated — prevents concurrent duplicate AI calls */
const generating = new Set<string>();

const RATE_LIMIT = {
  name: "claim-policy",
  maxRequests: 5,
  windowMs: 60 * 60 * 1000, // 5 per IP per hour
};

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
    || req.headers.get("x-real-ip")
    || "unknown";

  const limit = checkRateLimit(RATE_LIMIT, ip);
  if (!limit.allowed) {
    return NextResponse.json(
      { error: "Too many requests. Try again later." },
      { status: 429, headers: { "Retry-After": String(Math.ceil((limit.retryAfterMs || 60000) / 1000)) } }
    );
  }

  try {
    const { policyId, email } = await req.json();

    if (!policyId || typeof policyId !== "string" || policyId.length !== 12) {
      return NextResponse.json(
        { error: "Invalid policyId" },
        { status: 400 }
      );
    }

    if (email && (typeof email !== "string" || email.length > 254)) {
      return NextResponse.json(
        { error: "Invalid email" },
        { status: 400 }
      );
    }

    const db = await getDb();

    // Idempotency check — already fulfilled, return existing content as stream
    const existing = db.exec(
      "SELECT content_md FROM policies WHERE id = ? AND paid = 1",
      [policyId]
    );
    if (existing.length && existing[0].values.length) {
      const existingMd = existing[0].values[0][0] as string;
      const encoder = new TextEncoder();
      const body = new ReadableStream({
        start(controller) {
          controller.enqueue(encoder.encode(JSON.stringify({ type: "delta", text: existingMd }) + "\n"));
          controller.enqueue(encoder.encode(JSON.stringify({ type: "done" }) + "\n"));
          controller.close();
        },
      });
      return new Response(body, {
        headers: { "Content-Type": "text/event-stream", "Cache-Control": "no-cache", "Connection": "keep-alive" },
      });
    }

    // In-memory lock — prevent concurrent AI calls for the same policy
    if (generating.has(policyId)) {
      return NextResponse.json(
        { error: "Policy is already being generated. Please wait." },
        { status: 409 }
      );
    }
    generating.add(policyId);

    // Verify policy exists and get form data
    const results = db.exec(
      "SELECT form_data_json FROM policies WHERE id = ?",
      [policyId]
    );
    if (!results.length || !results[0].values.length) {
      generating.delete(policyId);
      return NextResponse.json(
        { error: "Policy not found" },
        { status: 404 }
      );
    }

    // Save email if provided
    if (email) {
      db.run("UPDATE policies SET email = ? WHERE id = ?", [email, policyId]);
    }

    const formDataJson = results[0].values[0][0] as string;
    const formData = JSON.parse(formDataJson);

    const aiStream = generatePolicyStream(formData);
    const reader = aiStream.getReader();
    const encoder = new TextEncoder();
    let fullMarkdown = "";

    const body = new ReadableStream({
      async pull(controller) {
        try {
          const { done, value } = await reader.read();

          if (done) {
            // Stream finished — save to DB
            try {
              const html = markdownToHtml(fullMarkdown);
              const claimId = `FREE-${policyId}`;

              db.run(
                "UPDATE policies SET content_md = ?, content_html = ?, stripe_session_id = ?, paid = 1 WHERE id = ?",
                [fullMarkdown, html, claimId, policyId]
              );

              db.run(
                "INSERT OR IGNORE INTO payments (id, stripe_session_id, product_type, amount_cents, status, reference_id) VALUES (?, ?, ?, ?, ?, ?)",
                [generateId(), claimId, "policy", 0, "completed", policyId]
              );

              persistDb();
              console.log(`Policy ${policyId} claimed (free launch promotion)`);

              controller.enqueue(encoder.encode(JSON.stringify({ type: "done" }) + "\n"));
            } catch (dbErr) {
              console.error("DB save error:", dbErr);
              controller.enqueue(encoder.encode(JSON.stringify({ type: "error", message: "Failed to save policy" }) + "\n"));
            } finally {
              generating.delete(policyId);
              controller.close();
            }
            return;
          }

          fullMarkdown += value;
          controller.enqueue(encoder.encode(JSON.stringify({ type: "delta", text: value }) + "\n"));
        } catch (err) {
          console.error("Stream error:", err);
          controller.enqueue(encoder.encode(JSON.stringify({ type: "error", message: "Generation failed" }) + "\n"));
          generating.delete(policyId);
          controller.close();
        }
      },
      cancel() {
        reader.cancel();
        generating.delete(policyId);
      },
    });

    return new Response(body, {
      headers: { "Content-Type": "text/event-stream", "Cache-Control": "no-cache", "Connection": "keep-alive" },
    });
  } catch (err) {
    console.error("Claim policy error:", err);
    return NextResponse.json(
      { error: "Failed to generate policy" },
      { status: 500 }
    );
  }
}
