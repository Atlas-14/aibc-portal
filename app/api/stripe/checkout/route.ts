import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

const AIBC_LOGO_URL = "https://www.aibusinesscenters.com/aibc-logo-transparent.png";

const PRICE_MAP: Record<
  string,
  {
    amount: number;
    name: string;
    description: string;
    mode: "payment" | "subscription";
  }
> = {
  // Subscription plans
  plan_essentials: {
    amount: 5900,
    name: "Business Essentials",
    description:
      "Professional business address at 125 N 9th St, Frederick OK. Includes mail handling, 30 items/mo, scans, and forwarding.",
    mode: "subscription",
  },
  plan_plus: {
    amount: 9900,
    name: "Business Plus",
    description:
      "Full-service mail management for active businesses. 75 items/mo, scans, check deposits, and shredding included.",
    mode: "subscription",
  },
  plan_pro: {
    amount: 14900,
    name: "Business Pro",
    description:
      "Concierge-level mail suite. Unlimited mail, scans, and pages. Built for high-volume operators.",
    mode: "subscription",
  },
  // Add-ons
  addon_credit: {
    amount: 24900,
    name: "Business Credit Reporting",
    description:
      "Monthly reporting to D&B, Experian Business, and Equifax Business. Builds your business credit profile every month.",
    mode: "subscription",
  },
  tradeline_5k: {
    amount: 9700,
    name: "AIBC $5,000 Business Trade Line",
    description: "AIBC $5,000 Business Trade Line — reported monthly to all 3 bureaus",
    mode: "subscription",
  },
  tradeline_10k: {
    amount: 19700,
    name: "AIBC $10,000 Business Trade Line",
    description: "AIBC $10,000 Business Trade Line — reported monthly to all 3 bureaus",
    mode: "subscription",
  },
  tradeline_25k: {
    amount: 39700,
    name: "AIBC $25,000 Business Trade Line",
    description: "AIBC $25,000 Business Trade Line — reported monthly to all 3 bureaus",
    mode: "subscription",
  },
  tradeline_50k: {
    amount: 59700,
    name: "AIBC $50,000 Business Trade Line",
    description: "AIBC $50,000 Business Trade Line — reported monthly to all 3 bureaus",
    mode: "subscription",
  },
  // One-time services
  ein_filing: {
    amount: 10000,
    name: "EIN Filing",
    description:
      "We file your EIN with the IRS so you can open business accounts and establish credit immediately.",
    mode: "payment",
  },
  llc_formation: {
    amount: 59900,
    name: "LLC / Corp Formation",
    description:
      "Full LLC or Corporation formation including state filing, registered agent setup, and operating agreement.",
    mode: "payment",
  },
  registered_agent: {
    amount: 15900,
    name: "Registered Agent (Annual)",
    description:
      "Annual registered agent service. We receive legal documents and official notices on your behalf.",
    mode: "payment",
  },
  fundability_dashboard: {
    amount: 99700,
    name: "Fundability Dashboard",
    description:
      "One-time access to your complete business fundability analysis, credit blueprint, and funding roadmap.",
    mode: "payment",
  },
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
    ...(priceConfig.mode === "payment" ? { submit_type: "pay" } : {}),
    customer_email: email,
    custom_text: {
      submit: {
        message:
          priceConfig.mode === "subscription"
            ? "Secure your AIBC membership and start building your business presence today."
            : "Complete your secure purchase and we’ll start processing your AIBC service right away.",
      },
    },
    line_items: [
      {
        price_data: {
          currency: "usd",
          product_data: {
            name: priceConfig.name,
            description: priceConfig.description,
            images: [AIBC_LOGO_URL],
          },
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
