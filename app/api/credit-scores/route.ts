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

type CreditScoreRow = {
  dnb_paydex?: number | null;
  experian_business?: number | null;
  equifax_business?: number | null;
  last_updated_at?: string | null;
  updated_at?: string | null;
  created_at?: string | null;
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
      .select("id, credit_addon")
      .eq("user_id", user.id)
      .maybeSingle();

    if (clientError) {
      return NextResponse.json({ error: clientError.message }, { status: 500 });
    }

    if (!clientRecord) {
      return NextResponse.json({ error: "Client record not found" }, { status: 404 });
    }

    if (!clientRecord.credit_addon) {
      return NextResponse.json({
        creditAddon: false,
        scores: {
          dnbPaydex: null,
          experianBusiness: null,
          equifaxBusiness: null,
          lastUpdatedAt: null,
        },
      });
    }

    const { data: scoreRecord, error: scoresError } = await adminClient
      .from("business_credit_scores")
      .select("dnb_paydex, experian_business, equifax_business, last_updated_at, updated_at, created_at")
      .eq("client_id", clientRecord.id)
      .order("last_updated_at", { ascending: false, nullsFirst: false })
      .order("updated_at", { ascending: false, nullsFirst: false })
      .limit(1)
      .maybeSingle<CreditScoreRow>();

    if (scoresError && scoresError.code !== "PGRST116") {
      return NextResponse.json({ error: scoresError.message }, { status: 500 });
    }

    return NextResponse.json({
      creditAddon: true,
      scores: {
        dnbPaydex: scoreRecord?.dnb_paydex ?? null,
        experianBusiness: scoreRecord?.experian_business ?? null,
        equifaxBusiness: scoreRecord?.equifax_business ?? null,
        lastUpdatedAt: scoreRecord?.last_updated_at ?? scoreRecord?.updated_at ?? scoreRecord?.created_at ?? null,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to load credit scores" },
      { status: 500 }
    );
  }
}
