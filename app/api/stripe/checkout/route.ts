import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

const PRICE_MAP: Record<string, { amount: number; name: string; mode: "payment" | "subscription" }> = {
  // Subscription plans
  plan_essentials: { amount: 5900, name: "Business Essentials", mode: "subscription" },
  plan_plus: { amount: 9900, name: "Business Plus", mode: "subscription" },
  plan_pro: { amount: 14900, name: "Business Pro", mode: "subscription" },
  // Add-ons
  addon_credit: { amount: 24900, name: "Business Credit Reporting", mode: "subscription" },
  // One-time services
  ein_filing: { amount: 10000, name: "EIN Filing", mode: "payment" },
  llc_formation: { amount: 59900, name: "LLC / Corp Formation", mode: "payment" },
  registered_agent: { amount: 15900, name: "Registered Agent (Annual)", mode: "payment" },
  fundability_dashboard: { amount: 99700, name: "Fundability Dashboard", mode: "payment" },
};

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { priceKey, email, successUrl, cancelUrl } = body;

  const priceConfig = PRICE_MAP[priceKey];
  if (!priceConfig) {
    return NextResponse.json({ error: "Invalid price key" }, { status: 400 });
  }

  const origin = request.headers.get("origin") || "https://portal.aibusinesscenters.com";

  const session = await stripe.checkout.sessions.create({
    mode: priceConfig.mode,
    customer_email: email,
    line_items: [
      {
        price_data: {
          currency: "usd",
          product_data: { name: priceConfig.name },
          unit_amount: priceConfig.amount,
          ...(priceConfig.mode === "subscription" ? { recurring: { interval: "month" } } : {}),
        },
        quantity: 1,
      },
    ],
    success_url: successUrl || `${origin}/dashboard/billing?success=true`,
    cancel_url: cancelUrl || `${origin}/dashboard/billing`,
    metadata: { priceKey },
  });

  return NextResponse.json({ url: session.url });
}
