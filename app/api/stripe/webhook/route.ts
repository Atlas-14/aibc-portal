import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

const getSupabase = () =>
  createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

const TRADELINE_PRICE_MAP: Record<string, { tier: "5k" | "10k" | "25k" | "50k"; creditLimit: number; monthlyFee: number }> = {
  tradeline_5k: { tier: "5k", creditLimit: 5000, monthlyFee: 9700 },
  tradeline_10k: { tier: "10k", creditLimit: 10000, monthlyFee: 19700 },
  tradeline_25k: { tier: "25k", creditLimit: 25000, monthlyFee: 39700 },
  tradeline_50k: { tier: "50k", creditLimit: 50000, monthlyFee: 59700 },
};

export async function POST(request: NextRequest) {
  const body = await request.text();
  const sig = request.headers.get("stripe-signature");
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event: Stripe.Event;

  try {
    if (webhookSecret && sig) {
      event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
    } else {
      event = JSON.parse(body);
    }
  } catch {
    return NextResponse.json({ error: "Invalid webhook" }, { status: 400 });
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const priceKey = session.metadata?.priceKey;
      console.log("Payment completed:", session.customer_email, priceKey);

      const tradelineConfig = priceKey ? TRADELINE_PRICE_MAP[priceKey] : null;
      if (tradelineConfig) {
        const email = session.customer_email || session.customer_details?.email;
        const stripeSubscriptionId = typeof session.subscription === "string" ? session.subscription : session.subscription?.id;

        if (!email) {
          console.error("Trade line checkout missing customer email", session.id);
          break;
        }

        const supabase = getSupabase();

        const { data: clientRecord, error: clientError } = await supabase
          .from("clients")
          .select("id")
          .eq("email", email)
          .maybeSingle();

        if (clientError) {
          console.error("Unable to load client for trade line checkout", clientError.message);
          break;
        }

        if (!clientRecord) {
          console.error("No client found for trade line checkout", email);
          break;
        }

        if (stripeSubscriptionId) {
          const { data: existingSubscription, error: existingSubscriptionError } = await supabase
            .from("trade_line_subscriptions")
            .select("id")
            .eq("stripe_subscription_id", stripeSubscriptionId)
            .maybeSingle();

          if (existingSubscriptionError) {
            console.error("Unable to check existing trade line subscription", existingSubscriptionError.message);
            break;
          }

          if (existingSubscription) {
            break;
          }
        }

        const { error: insertError } = await supabase.from("trade_line_subscriptions").insert({
          client_id: clientRecord.id,
          stripe_subscription_id: stripeSubscriptionId ?? null,
          tier: tradelineConfig.tier,
          status: "pending_agreement",
          credit_limit: tradelineConfig.creditLimit,
          monthly_fee: tradelineConfig.monthlyFee,
        });

        if (insertError) {
          console.error("Unable to create trade line subscription", insertError.message);
        }
      }

      break;
    }
    case "customer.subscription.deleted": {
      const sub = event.data.object as Stripe.Subscription;
      console.log("Subscription cancelled:", sub.customer);

      const supabase = getSupabase();
      const { error } = await supabase
        .from("trade_line_subscriptions")
        .update({ status: "cancelled" })
        .eq("stripe_subscription_id", sub.id);

      if (error) {
        console.error("Unable to cancel trade line subscription", error.message);
      }
      break;
    }
  }

  return NextResponse.json({ received: true });
}
