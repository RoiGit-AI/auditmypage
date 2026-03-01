import { NextRequest, NextResponse } from "next/server";
import { createPolicyCheckoutSession } from "@/lib/stripe";
import { getDb, persistDb } from "@/lib/db";
import { siteUrl } from "@/lib/utils";

export async function POST(req: NextRequest) {
  try {
    const { policyId, email } = await req.json();

    if (!policyId || !email) {
      return NextResponse.json(
        { error: "Policy ID and email are required" },
        { status: 400 }
      );
    }

    const db = await getDb();
    const results = db.exec(
      "SELECT id FROM policies WHERE id = ?",
      [policyId]
    );

    if (!results.length || !results[0].values.length) {
      return NextResponse.json({ error: "Policy not found" }, { status: 404 });
    }

    db.run("UPDATE policies SET email = ? WHERE id = ?", [email, policyId]);
    persistDb();

    const base = siteUrl();
    const checkoutUrl = await createPolicyCheckoutSession(
      policyId,
      email,
      `${base}/privacy-policy/${policyId}?success=true`,
      `${base}/privacy-policy-generator?canceled=true`
    );

    return NextResponse.json({ checkoutUrl });
  } catch (error) {
    console.error("Checkout failed:", error);
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    );
  }
}
