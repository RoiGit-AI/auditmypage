import Stripe from "stripe";

let _stripe: Stripe | null = null;

export function getStripe(): Stripe {
  if (!_stripe) {
    _stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
  }
  return _stripe;
}

export async function createPolicyCheckoutSession(
  policyId: string,
  email: string,
  successUrl: string,
  cancelUrl: string
): Promise<string> {
  const session = await getStripe().checkout.sessions.create({
    mode: "payment",
    payment_method_types: ["card"],
    customer_email: email,
    line_items: [
      {
        price_data: {
          currency: "usd",
          product_data: {
            name: "AI Privacy Policy",
            description:
              "Custom AI-generated privacy policy — HTML, Markdown, and plain text formats",
          },
          unit_amount: 1900, // $19.00
        },
        quantity: 1,
      },
    ],
    metadata: {
      policyId,
      productType: "policy",
    },
    success_url: successUrl,
    cancel_url: cancelUrl,
  });

  return session.url!;
}
