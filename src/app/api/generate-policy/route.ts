import { NextRequest, NextResponse } from "next/server";
import { generatePreview, type PolicyFormData } from "@/lib/policy-generator";
import { getDb, persistDb } from "@/lib/db";
import { generateId } from "@/lib/utils";
import { checkRateLimit } from "@/lib/rate-limit";

const RATE_LIMIT = {
  name: "generate-policy",
  maxRequests: 10,
  windowMs: 60 * 60 * 1000, // 10 per IP per hour
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
    const { formData } = (await req.json()) as { formData: PolicyFormData };

    if (!formData?.businessName || !formData?.websiteUrl) {
      return NextResponse.json(
        { error: "Business name and website URL are required" },
        { status: 400 }
      );
    }

    // Validate string field lengths
    const stringFields: (keyof PolicyFormData)[] = [
      "businessName", "websiteUrl", "businessType", "country",
      "contactEmail", "changeNotification",
    ];
    for (const field of stringFields) {
      const val = formData[field];
      if (val && typeof val === "string" && val.length > 200) {
        return NextResponse.json(
          { error: `${field} is too long (max 200 characters)` },
          { status: 400 }
        );
      }
    }

    // Validate array fields — max 20 items, each max 100 chars
    const arrayFields: (keyof PolicyFormData)[] = [
      "platforms", "mobileOs", "dataTypes", "collectionMethods", "purposes",
      "analytics", "paymentProcessors", "emailMarketing", "advertising",
      "socialLogin", "hosting",
    ];
    for (const field of arrayFields) {
      const val = formData[field];
      if (val && Array.isArray(val)) {
        if (val.length > 20) {
          return NextResponse.json(
            { error: `${field} has too many items (max 20)` },
            { status: 400 }
          );
        }
        if (val.some((item) => typeof item !== "string" || item.length > 100)) {
          return NextResponse.json(
            { error: `${field} contains invalid items` },
            { status: 400 }
          );
        }
      }
    }

    const id = generateId();
    const preview = generatePreview(formData);

    const db = await getDb();
    db.run(
      "INSERT INTO policies (id, form_data_json, content_md) VALUES (?, ?, ?)",
      [id, JSON.stringify(formData), preview]
    );
    persistDb();

    return NextResponse.json({ id, preview });
  } catch (error) {
    console.error("Policy generation failed:", error);
    return NextResponse.json(
      { error: "Failed to generate policy preview" },
      { status: 500 }
    );
  }
}
