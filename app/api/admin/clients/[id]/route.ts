import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { sendAccountActivatedEmail } from "@/lib/notifications";

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
  const { id } = await params;
  const { data, error } = await supabase.from("clients").select("*").eq("id", id).single();
  if (error) return NextResponse.json({ error: error.message }, { status: 404 });
  return NextResponse.json({
    client: {
      id: data.id,
      email: data.email,
      fullName: data.full_name,
      businessName: data.business_name,
      plan: data.plan,
      status: data.status,
      creditAddon: data.credit_addon,
      unitOwner: data.unit_owner,
      unitNumber: data.unit_number,
      mailboxId: data.mailbox_id,
      notes: data.notes,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      lastActive: data.updated_at ?? data.created_at,
    },
  });
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
  const { id } = await params;
  const body = await request.json();

  const { data: existingClient, error: existingClientError } = await supabase
    .from("clients")
    .select("status, email, full_name")
    .eq("id", id)
    .single();

  if (existingClientError || !existingClient) {
    return NextResponse.json({ error: existingClientError?.message || "Client not found" }, { status: 404 });
  }

  const { error } = await supabase
    .from("clients")
    .update({
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
    })
    .eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  let notificationError: string | null = null;
  const becameActive = existingClient.status !== "active" && body.status === "active";

  if (becameActive) {
    try {
      await sendAccountActivatedEmail({
        clientEmail: body.email || existingClient.email,
        clientName: body.fullName || existingClient.full_name || body.email || existingClient.email,
      });
    } catch (sendError) {
      notificationError = sendError instanceof Error ? sendError.message : "Unable to send activation email";
    }
  }

  return NextResponse.json({ success: true, notificationError });
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
  const { id } = await params;
  const { error } = await supabase.from("clients").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
