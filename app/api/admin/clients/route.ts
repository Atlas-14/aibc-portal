import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";


export async function GET() {
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
  const { data, error } = await supabase
    .from("clients")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({
    clients: (data ?? []).map(c => ({
      id: c.id,
      email: c.email,
      fullName: c.full_name,
      businessName: c.business_name,
      plan: c.plan,
      status: c.status,
      creditAddon: c.credit_addon,
      unitOwner: c.unit_owner,
      unitNumber: c.unit_number,
      createdAt: c.created_at,
    })),
  });
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
