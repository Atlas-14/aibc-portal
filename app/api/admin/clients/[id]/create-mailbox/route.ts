import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createMailboxForClient } from "@/lib/anytime-mailbox";

const getSupabase = () =>
  createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

export async function POST(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const supabase = getSupabase();
  const { id } = await params;

  const { data: client, error: clientError } = await supabase
    .from("clients")
    .select("id, email, full_name, business_name, plan, mailbox_id")
    .eq("id", id)
    .single();

  if (clientError || !client) {
    return NextResponse.json({ error: clientError?.message || "Client not found" }, { status: 404 });
  }

  if (client.mailbox_id) {
    return NextResponse.json({ success: true, mailboxId: client.mailbox_id, alreadyExists: true });
  }

  try {
    const mailbox = await createMailboxForClient({
      email: client.email,
      fullName: client.full_name || client.email,
      businessName: client.business_name,
      planTier: client.plan,
    });

    const { error: updateError } = await supabase
      .from("clients")
      .update({
        mailbox_id: mailbox.mailboxId,
        updated_at: new Date().toISOString(),
      })
      .eq("id", client.id);

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      mailboxId: mailbox.mailboxId,
      providerPath: mailbox.path,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to create mailbox" },
      { status: 500 }
    );
  }
}
