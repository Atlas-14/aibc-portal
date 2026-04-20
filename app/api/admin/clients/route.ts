import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function GET(request: NextRequest) {
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
  const search = request.nextUrl.searchParams.get("search")?.trim().toLowerCase();

  const { data, error } = await supabase
    .from("clients")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const mapped = (data ?? []).map((c) => ({
    id: c.id,
    email: c.email,
    fullName: c.full_name,
    businessName: c.business_name,
    plan: c.plan,
    status: c.status,
    creditAddon: c.credit_addon,
    unitOwner: c.unit_owner,
    unitNumber: c.unit_number,
    mailboxId: c.mailbox_id,
    notes: c.notes,
    createdAt: c.created_at,
    updatedAt: c.updated_at,
    lastActive: c.updated_at ?? c.created_at,
  }));

  const clients = !search
    ? mapped
    : mapped.filter((client) =>
        [client.fullName, client.businessName, client.email].some((value) => value?.toLowerCase().includes(search)),
      );

  return NextResponse.json({ clients });
}

export async function POST(request: NextRequest) {
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
  const body = await request.json();
  const { email, fullName, businessName, plan, notes } = body;

  if (!email || !fullName) {
    return NextResponse.json({ error: "Email and name are required" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("clients")
    .insert({ email, full_name: fullName, business_name: businessName, plan: plan ?? "essentials", notes })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ client: data }, { status: 201 });
}

export async function PATCH(request: NextRequest) {
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
  const body = await request.json();
  const ids = Array.isArray(body.ids) ? body.ids : [];
  const status = body.status;

  if (!ids.length || !status) {
    return NextResponse.json({ error: "ids and status are required" }, { status: 400 });
  }

  const { error } = await supabase
    .from("clients")
    .update({ status, updated_at: new Date().toISOString() })
    .in("id", ids);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
