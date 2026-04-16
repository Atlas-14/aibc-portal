import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const getClients = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseAnonKey || !serviceRoleKey) {
    throw new Error("Supabase environment variables are not configured.");
  }

  return {
    authClient: createClient(supabaseUrl, supabaseAnonKey),
    adminClient: createClient(supabaseUrl, serviceRoleKey),
  };
};

export async function GET(request: NextRequest) {
  try {
    const { authClient, adminClient } = getClients();
    const accessToken = request.cookies.get("aibc_session")?.value;

    if (!accessToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const {
      data: { user },
      error: authError,
    } = await authClient.auth.getUser(accessToken);

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: clientRecord, error: clientError } = await adminClient
      .from("clients")
      .select("id")
      .eq("user_id", user.id)
      .maybeSingle();

    if (clientError) {
      return NextResponse.json({ error: clientError.message }, { status: 500 });
    }

    if (!clientRecord) {
      return NextResponse.json({ subscription: null });
    }

    const { data: subscription, error: subscriptionError } = await adminClient
      .from("trade_line_subscriptions")
      .select("id, tier, status, credit_limit, monthly_fee, agreement_file_path, activated_at, created_at")
      .eq("client_id", clientRecord.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (subscriptionError && subscriptionError.code !== "PGRST116") {
      return NextResponse.json({ error: subscriptionError.message }, { status: 500 });
    }

    return NextResponse.json({
      subscription: subscription
        ? {
            id: subscription.id,
            tier: subscription.tier,
            status: subscription.status,
            creditLimit: subscription.credit_limit,
            monthlyFee: subscription.monthly_fee,
            agreementUploaded: Boolean(subscription.agreement_file_path),
            activatedAt: subscription.activated_at,
            createdAt: subscription.created_at,
          }
        : null,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to load trade line subscription" },
      { status: 500 }
    );
  }
}
