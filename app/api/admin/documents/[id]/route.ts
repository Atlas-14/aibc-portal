import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
  const { id } = await params;
  const { data: doc } = await supabase.from("admin_documents").select("file_path").eq("id", id).single();
  if (doc?.file_path) {
    await supabase.storage.from("admin-documents").remove([doc.file_path]);
  }
  const { error } = await supabase.from("admin_documents").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
