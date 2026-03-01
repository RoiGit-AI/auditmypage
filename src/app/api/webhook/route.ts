import { NextRequest, NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { generatePolicy } from "@/lib/policy-generator";
import { getDb, persistDb } from "@/lib/db";
import { generateId } from "@/lib/utils";
import type Stripe from "stripe";

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature");

  if (!sig) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = getStripe().webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const policyId = session.metadata?.policyId;
    const productType = session.metadata?.productType;

    if (productType === "policy" && policyId) {
      await fulfillPolicy(policyId, session.id, session.amount_total || 1900);
    }
  }

  return NextResponse.json({ received: true });
}

async function fulfillPolicy(
  policyId: string,
  stripeSessionId: string,
  amountCents: number
) {
  const db = await getDb();

  // Idempotency check
  const existing = db.exec(
    "SELECT paid FROM policies WHERE id = ? AND paid = 1",
    [policyId]
  );
  if (existing.length && existing[0].values.length) return;

  // Get form data
  const results = db.exec(
    "SELECT form_data_json FROM policies WHERE id = ?",
    [policyId]
  );

  if (!results.length || !results[0].values.length) {
    console.error(`Policy ${policyId} not found for fulfillment`);
    return;
  }

  const formDataJson = results[0].values[0][0] as string;
  const formData = JSON.parse(formDataJson);

  // Generate the full policy with AI
  const { markdown, html } = await generatePolicy(formData);

  // Update policy record
  db.run(
    "UPDATE policies SET content_md = ?, content_html = ?, stripe_session_id = ?, paid = 1 WHERE id = ?",
    [markdown, html, stripeSessionId, policyId]
  );

  // Record payment
  db.run(
    "INSERT OR IGNORE INTO payments (id, stripe_session_id, product_type, amount_cents, status, reference_id) VALUES (?, ?, ?, ?, ?, ?)",
    [generateId(), stripeSessionId, "policy", amountCents, "completed", policyId]
  );

  persistDb();
  console.log(`Policy ${policyId} fulfilled successfully`);
}
