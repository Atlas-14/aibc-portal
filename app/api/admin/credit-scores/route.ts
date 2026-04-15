import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const getSupabase = () =>
  createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

type RawScore = {
  id: string;
  client_id: string;
  dnb_paydex: number | null;
  dnb_score_date: string | null;
  experian_score: number | null;
  experian_score_date: string | null;
  equifax_score: number | null;
  equifax_score_date: string | null;
  notes: string | null;
  updated_by: string | null;
  updated_at: string;
};

export async function GET() {
  const supabase = getSupabase();

  const [{ data: clients, error: clientsError }, { data: scores, error: scoresError }] = await Promise.all([
    supabase
      .from("clients")
      .select("id, email, full_name, business_name, credit_addon")
      .eq("credit_addon", true)
      .order("full_name", { ascending: true }),
    supabase
      .from("business_credit_scores")
      .select("*")
      .order("updated_at", { ascending: false }),
  ]);

  if (clientsError) return NextResponse.json({ error: clientsError.message }, { status: 500 });
  if (scoresError) return NextResponse.json({ error: scoresError.message }, { status: 500 });

  const latestByClient = new Map<string, RawScore>();
  for (const score of (scores ?? []) as RawScore[]) {
    if (!latestByClient.has(score.client_id)) latestByClient.set(score.client_id, score);
  }

  return NextResponse.json({
    clients: (clients ?? []).map((client) => {
      const score = latestByClient.get(client.id) ?? null;
      return {
        id: client.id,
        email: client.email,
        fullName: client.full_name,
        businessName: client.business_name,
        creditAddon: client.credit_addon,
        score,
      };
    }),
  });
}

export async function POST(request: NextRequest) {
  const supabase = getSupabase();
  const body = await request.json();

  if (!body.clientId) {
    return NextResponse.json({ error: "clientId is required" }, { status: 400 });
  }

  const payload = {
    client_id: body.clientId,
    dnb_paydex: body.dnbPaydex ?? null,
    dnb_score_date: body.dnbScoreDate || null,
    experian_score: body.experianScore ?? null,
    experian_score_date: body.experianScoreDate || null,
    equifax_score: body.equifaxScore ?? null,
    equifax_score_date: body.equifaxScoreDate || null,
    notes: body.notes ?? null,
    updated_by: body.updatedBy ?? "atlas-admin",
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from("business_credit_scores")
    .insert(payload)
    .select("*")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ score: data }, { status: 201 });
}
