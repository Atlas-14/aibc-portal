import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";


const MAX_SIZE = 10 * 1024 * 1024;
const ALLOWED_TYPES = new Set(["application/pdf", "image/png", "image/jpeg", "image/jpg", "image/webp"]);

export async function POST(request: NextRequest) {
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
  const formData = await request.formData();
  const file = formData.get("file") as File | null;
  const clientId = formData.get("clientId") as string;
  const category = (formData.get("category") as string) || "General";
  const notes = (formData.get("notes") as string) || null;

  if (!file || !clientId) {
    return NextResponse.json({ error: "File and clientId are required" }, { status: 400 });
  }

  if (!ALLOWED_TYPES.has(file.type)) {
    return NextResponse.json({ error: "Unsupported file type" }, { status: 400 });
  }

  if (file.size > MAX_SIZE) {
    return NextResponse.json({ error: "File too large (max 10MB)" }, { status: 400 });
  }

  const ext = file.name.split(".").pop();
  const filePath = `${clientId}/${Date.now()}-${file.name}`;

  const arrayBuffer = await file.arrayBuffer();
  const { error: uploadError } = await supabase.storage
    .from("admin-documents")
    .upload(filePath, arrayBuffer, { contentType: file.type, upsert: false });

  if (uploadError) {
    return NextResponse.json({ error: uploadError.message }, { status: 500 });
  }

  const { data, error: dbError } = await supabase
    .from("admin_documents")
    .insert({
      client_id: clientId,
      file_name: file.name,
      file_path: filePath,
      file_size: file.size,
      file_type: file.type,
      category,
      notes,
      uploaded_by: "atlas-admin",
    })
    .select()
    .single();

  if (dbError) return NextResponse.json({ error: dbError.message }, { status: 500 });
  return NextResponse.json({ document: data }, { status: 201 });
}
