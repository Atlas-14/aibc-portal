import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const getSupabase = () =>
  createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

export async function PATCH(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const supabase = getSupabase();
  const { id } = await context.params;
  const body = await request.json().catch(() => ({}));

  if (body.status !== "active") {
    return NextResponse.json({ error: "Only activation is supported" }, { status: 400 });
  }

  const { data: existing, error: existingError } = await supabase
    .from("trade_line_subscriptions")
    .select("id, agreement_file_path, status")
    .eq("id", id)
    .maybeSingle();

  if (existingError) return NextResponse.json({ error: existingError.message }, { status: 500 });
  if (!existing) return NextResponse.json({ error: "Trade line not found" }, { status: 404 });
  if (!existing.agreement_file_path) {
    return NextResponse.json({ error: "Signed agreement must be uploaded before activation" }, { status: 400 });
  }

  const activatedAt = new Date().toISOString();
  const { data, error } = await supabase
    .from("trade_line_subscriptions")
    .update({ status: "active", activated_at: activatedAt })
    .eq("id", id)
    .select("id, status, activated_at")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ tradeline: data });
}
