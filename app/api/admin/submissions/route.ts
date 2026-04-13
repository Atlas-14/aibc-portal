import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET() {
  const { data: submissions, error } = await supabase
    .from("client_submissions")
    .select("*, clients(full_name, business_name)")
    .order("submitted_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({
    submissions: (submissions ?? []).map(s => ({
      id: s.id,
      clientId: s.client_id,
      clientName: (s.clients as { full_name: string })?.full_name ?? "Unknown",
      businessName: (s.clients as { business_name: string })?.business_name ?? "",
      fileName: s.file_name,
      fileType: s.file_type,
      fileSize: s.file_size,
      filePath: s.file_path,
      category: s.category,
      status: s.status,
      adminNotes: s.admin_notes,
      submittedAt: s.submitted_at,
      reviewedAt: s.reviewed_at,
    })),
  });
}
