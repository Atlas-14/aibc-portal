import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET() {
  const { data, error } = await supabase
    .from("admin_documents")
    .select("*, clients(full_name, business_name)")
    .order("uploaded_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({
    documents: (data ?? []).map(d => ({
      id: d.id,
      clientId: d.client_id,
      clientName: (d.clients as { full_name: string })?.full_name ?? "Unknown",
      businessName: (d.clients as { business_name: string })?.business_name ?? "",
      fileName: d.file_name,
      fileSize: d.file_size,
      fileType: d.file_type,
      filePath: d.file_path,
      category: d.category,
      notes: d.notes,
      uploadedAt: d.uploaded_at,
    })),
  });
}
