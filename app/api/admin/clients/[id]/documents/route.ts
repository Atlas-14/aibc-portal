import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
  const { id } = await params;
  const { data, error } = await supabase
    .from("admin_documents")
    .select("*")
    .eq("client_id", id)
    .order("uploaded_at", { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({
    documents: (data ?? []).map(d => ({
      id: d.id, fileName: d.file_name, category: d.category,
      fileSize: d.file_size, notes: d.notes, uploadedAt: d.uploaded_at,
    }))
  });
}
