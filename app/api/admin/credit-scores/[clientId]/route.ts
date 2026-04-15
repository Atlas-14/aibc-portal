import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const getSupabase = () =>
  createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

export async function GET(_request: NextRequest, { params }: { params: Promise<{ clientId: string }> }) {
  const supabase = getSupabase();
  const { clientId } = await params;

  const { data, error } = await supabase
    .from("business_credit_scores")
    .select("*")
    .eq("client_id", clientId)
    .order("updated_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({
    score: data?.[0] ?? null,
    scores: data ?? [],
  });
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ clientId: string }> }) {
  const supabase = getSupabase();
  const { clientId } = await params;
  const body = await request.json();

  const payload = {
    client_id: clientId,
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

  const { data: existing, error: existingError } = await supabase
    .from("business_credit_scores")
    .select("id")
    .eq("client_id", clientId)
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (existingError) return NextResponse.json({ error: existingError.message }, { status: 500 });

  if (!existing) {
    const { data, error } = await supabase
      .from("business_credit_scores")
      .insert(payload)
      .select("*")
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ score: data, created: true });
  }

  const { data, error } = await supabase
    .from("business_credit_scores")
    .update(payload)
    .eq("id", existing.id)
    .select("*")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ score: data, created: false });
}
