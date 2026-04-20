import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import Stripe from "stripe";
import { deactivateRenter, getRenterMailboxes, unassignMailbox } from "@/lib/anytime-mailbox";

type OffboardOptions = {
  cancelStripe?: boolean;
  deactivateMailbox?: boolean;
  deleteClient?: boolean;
  notes?: string;
};

type ActionLogEntry = {
  action: string;
  timestamp: string;
  [key: string]: unknown;
};

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

const getSupabase = () =>
  createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

function timestamp() {
  return new Date().toISOString();
}

async function cancelStripeSubscription(subscriptionId: string) {
  await fetch(`https://api.stripe.com/v1/subscriptions/${subscriptionId}/cancel`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.STRIPE_SECRET_KEY!}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({ cancel_at_period_end: "false" }).toString(),
  }).then(async (response) => {
    if (!response.ok) {
      const text = await response.text().catch(() => "");
      throw new Error(text || `Stripe cancellation failed for ${subscriptionId}`);
    }
  });
}

async function findAndCancelStripeSubscriptionsByEmail(email: string) {
  const customers = await stripe.customers.list({ email, limit: 100 });
  const activeStatuses = new Set(["active", "trialing", "past_due", "unpaid"]);
  const cancelledIds: string[] = [];

  for (const customer of customers.data) {
    const subscriptions = await stripe.subscriptions.list({ customer: customer.id, status: "all", limit: 100 });
    for (const subscription of subscriptions.data) {
      if (!activeStatuses.has(subscription.status)) continue;
      await cancelStripeSubscription(subscription.id);
      cancelledIds.push(subscription.id);
    }
  }

  return cancelledIds;
}

function extractMailboxName(mailboxes: Array<Record<string, unknown>>) {
  const mailbox = mailboxes[0] ?? null;
  if (!mailbox) return null;
  const candidates = [mailbox.name, mailbox.mailbox_name, mailbox.mailboxName, mailbox.mailbox];
  for (const candidate of candidates) {
    const value = String(candidate ?? "").trim();
    if (value) return value;
  }
  return null;
}

async function insertOffboardingLog({
  supabase,
  client,
  stripeSubscriptionId,
  actionsTaken,
  notes,
}: {
  supabase: ReturnType<typeof getSupabase>;
  client: Record<string, unknown>;
  stripeSubscriptionId: string | null;
  actionsTaken: ActionLogEntry[];
  notes?: string;
}) {
  const { error } = await supabase.from("offboarding_log").insert({
    client_id: client.id,
    client_email: client.email,
    client_name: client.full_name,
    plan: client.plan,
    mailbox_id: client.mailbox_id,
    stripe_subscription_id: stripeSubscriptionId,
    actions_taken: actionsTaken,
    notes: notes?.trim() || null,
  });

  if (error) {
    throw new Error(error.message);
  }
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const supabase = getSupabase();
  const { id } = await params;
  const body = (await request.json()) as OffboardOptions;
  const actionsTaken: ActionLogEntry[] = [];

  const { data: client, error: clientError } = await supabase
    .from("clients")
    .select("id, email, full_name, plan, mailbox_id")
    .eq("id", id)
    .single();

  if (clientError || !client) {
    return NextResponse.json({ error: clientError?.message || "Client not found" }, { status: 404 });
  }

  const { data: tradeSubscriptions } = await supabase
    .from("trade_line_subscriptions")
    .select("stripe_subscription_id, status, created_at")
    .eq("client_id", id)
    .order("created_at", { ascending: false });

  const latestStoredStripeSubscriptionId =
    tradeSubscriptions?.find((subscription) => subscription.stripe_subscription_id)?.stripe_subscription_id ?? null;

  let loggedStripeSubscriptionId = latestStoredStripeSubscriptionId;

  try {
    if (body.cancelStripe) {
      if (latestStoredStripeSubscriptionId) {
        await cancelStripeSubscription(latestStoredStripeSubscriptionId);
        actionsTaken.push({
          action: "stripe_cancelled",
          subscription_id: latestStoredStripeSubscriptionId,
          timestamp: timestamp(),
        });
      } else {
        const cancelledIds = await findAndCancelStripeSubscriptionsByEmail(client.email);
        if (cancelledIds.length) {
          loggedStripeSubscriptionId = cancelledIds[0];
          cancelledIds.forEach((subscriptionId) => {
            actionsTaken.push({
              action: "stripe_cancelled",
              subscription_id: subscriptionId,
              timestamp: timestamp(),
              source: "customer_email_lookup",
            });
          });
        } else {
          actionsTaken.push({
            action: "stripe_not_found",
            email: client.email,
            timestamp: timestamp(),
          });
        }
      }
    }

    if (body.deactivateMailbox) {
      if (client.mailbox_id) {
        await deactivateRenter(client.mailbox_id);
        actionsTaken.push({
          action: "mailbox_deactivated",
          renter_id: client.mailbox_id,
          timestamp: timestamp(),
        });

        const mailboxes = await getRenterMailboxes(client.mailbox_id);
        const mailboxName = extractMailboxName(mailboxes);

        if (mailboxName) {
          await unassignMailbox(mailboxName);
          actionsTaken.push({
            action: "mailbox_unassigned",
            renter_id: client.mailbox_id,
            mailbox_name: mailboxName,
            timestamp: timestamp(),
          });
        } else {
          actionsTaken.push({
            action: "mailbox_unassign_skipped",
            renter_id: client.mailbox_id,
            timestamp: timestamp(),
            reason: "No mailbox name returned by Anytime Mailbox",
          });
        }
      } else {
        actionsTaken.push({
          action: "mailbox_not_found",
          timestamp: timestamp(),
        });
      }
    }

    if (body.deleteClient) {
      actionsTaken.push({ action: "client_deleted", client_id: client.id, timestamp: timestamp() });
    }

    await insertOffboardingLog({
      supabase,
      client,
      stripeSubscriptionId: loggedStripeSubscriptionId,
      actionsTaken,
      notes: body.notes,
    });

    if (body.deleteClient) {
      const { error: deleteError } = await supabase.from("clients").delete().eq("id", id);
      if (deleteError) {
        throw new Error(deleteError.message);
      }
    }

    return NextResponse.json({ success: true, actionsLog: actionsTaken });
  } catch (error) {
    const failureMessage = error instanceof Error ? error.message : "Offboarding failed";
    actionsTaken.push({ action: "offboarding_failed", error: failureMessage, timestamp: timestamp() });

    try {
      await insertOffboardingLog({
        supabase,
        client,
        stripeSubscriptionId: loggedStripeSubscriptionId,
        actionsTaken,
        notes: body.notes,
      });
    } catch {
      // best effort, original error returned below
    }

    return NextResponse.json({ error: failureMessage, actionsLog: actionsTaken }, { status: 500 });
  }
}
