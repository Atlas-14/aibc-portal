import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const getSupabase = () =>
  createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

type TradeLineRow = {
  id: string;
  client_id: string;
  tier: string;
  status: string;
  credit_limit: number | null;
  monthly_fee: number | null;
  agreement_file_path: string | null;
  activated_at: string | null;
  created_at: string;
  clients: {
    full_name: string | null;
    business_name: string | null;
    email: string | null;
  } | null;
};

export async function GET() {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("trade_line_subscriptions")
    .select("id, client_id, tier, status, credit_limit, monthly_fee, agreement_file_path, activated_at, created_at, clients(full_name, business_name, email)")
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({
    tradelines: ((data ?? []) as unknown as TradeLineRow[]).map((row) => ({
      id: row.id,
      clientId: row.client_id,
      clientName: row.clients?.full_name || "Unknown client",
      businessName: row.clients?.business_name || null,
      email: row.clients?.email || null,
      tier: row.tier,
      status: row.status,
      creditLimit: row.credit_limit,
      monthlyFee: row.monthly_fee,
      agreementUploaded: Boolean(row.agreement_file_path),
      activatedAt: row.activated_at,
      createdAt: row.created_at,
    })),
  });
}
