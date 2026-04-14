import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
  const { id } = await params;
  const body = await request.json();
  const { status, adminNotes } = body;
  const { error } = await supabase
    .from("client_submissions")
    .update({ status, admin_notes: adminNotes, reviewed_at: new Date().toISOString(), reviewed_by: "atlas-admin" })
    .eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
