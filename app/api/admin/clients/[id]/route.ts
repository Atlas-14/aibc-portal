import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { data, error } = await supabase.from("clients").select("*").eq("id", id).single();
  if (error) return NextResponse.json({ error: error.message }, { status: 404 });
  return NextResponse.json({
    client: {
      id: data.id, email: data.email, fullName: data.full_name,
      businessName: data.business_name, plan: data.plan, status: data.status,
      creditAddon: data.credit_addon, unitOwner: data.unit_owner,
      unitNumber: data.unit_number, mailboxId: data.mailbox_id,
      notes: data.notes, createdAt: data.created_at,
    }
  });
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.json();
  const { error } = await supabase.from("clients").update({
    full_name: body.fullName,
    business_name: body.businessName,
    email: body.email,
    plan: body.plan,
    status: body.status,
    credit_addon: body.creditAddon,
    unit_owner: body.unitOwner,
    unit_number: body.unitNumber,
    mailbox_id: body.mailboxId,
    notes: body.notes,
    updated_at: new Date().toISOString(),
  }).eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
