import { NextRequest, NextResponse } from "next/server";
import { generatePreview, type PolicyFormData } from "@/lib/policy-generator";
import { getDb, persistDb } from "@/lib/db";
import { generateId } from "@/lib/utils";

export async function POST(req: NextRequest) {
  try {
    const { formData } = (await req.json()) as { formData: PolicyFormData };

    if (!formData?.businessName || !formData?.websiteUrl) {
      return NextResponse.json(
        { error: "Business name and website URL are required" },
        { status: 400 }
      );
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
