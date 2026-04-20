import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getBusinessAddress, sendWelcomeEmail } from "@/lib/notifications";

const getSupabase = () =>
  createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

export async function POST(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const supabase = getSupabase();
  const { id } = await params;

  const { data: client, error } = await supabase
    .from("clients")
    .select("email, full_name, business_name, unit_number")
    .eq("id", id)
    .single();

  if (error || !client) {
    return NextResponse.json({ error: error?.message || "Client not found" }, { status: 404 });
  }

  try {
    const result = await sendWelcomeEmail({
      clientEmail: client.email,
      clientName: client.full_name || client.email,
      businessName: client.business_name || undefined,
      businessAddress: getBusinessAddress(client.unit_number),
    });

    return NextResponse.json({ success: true, emailId: result.data?.id ?? null });
  } catch (sendError) {
    return NextResponse.json(
      { error: sendError instanceof Error ? sendError.message : "Unable to send welcome email" },
      { status: 500 }
    );
  }
}
