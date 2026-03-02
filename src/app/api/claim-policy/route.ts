import { NextRequest, NextResponse } from "next/server";
import { generatePolicy } from "@/lib/policy-generator";
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

    // Idempotency check — already fulfilled
    const existing = db.exec(
      "SELECT paid FROM policies WHERE id = ? AND paid = 1",
      [policyId]
    );
    if (existing.length && existing[0].values.length) {
      return NextResponse.json({ success: true });
    }

    // In-memory lock — prevent concurrent AI calls for the same policy
    if (generating.has(policyId)) {
      return NextResponse.json(
        { error: "Policy is already being generated. Please wait." },
        { status: 409 }
      );
    }
    generating.add(policyId);

    try {
      // Verify policy exists and get form data
      const results = db.exec(
        "SELECT form_data_json FROM policies WHERE id = ?",
        [policyId]
      );
      if (!results.length || !results[0].values.length) {
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

      // Generate full policy with AI
      const { markdown, html } = await generatePolicy(formData);

      const claimId = `FREE-${policyId}`;

      // Update policy record
      db.run(
        "UPDATE policies SET content_md = ?, content_html = ?, stripe_session_id = ?, paid = 1 WHERE id = ?",
        [markdown, html, claimId, policyId]
      );

      // Record $0 payment
      db.run(
        "INSERT OR IGNORE INTO payments (id, stripe_session_id, product_type, amount_cents, status, reference_id) VALUES (?, ?, ?, ?, ?, ?)",
        [generateId(), claimId, "policy", 0, "completed", policyId]
      );

      persistDb();
      console.log(`Policy ${policyId} claimed (free launch promotion)`);

      return NextResponse.json({ success: true });
    } finally {
      generating.delete(policyId);
    }
  } catch (err) {
    console.error("Claim policy error:", err);
    return NextResponse.json(
      { error: "Failed to generate policy" },
      { status: 500 }
    );
  }
}
