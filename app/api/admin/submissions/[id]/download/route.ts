import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
  const { id } = await params;

  const { data: submission, error } = await supabase
    .from("client_submissions")
    .select("file_path, file_name")
    .eq("id", id)
    .single();

  if (error || !submission?.file_path) {
    return NextResponse.json({ error: "Submission not found" }, { status: 404 });
  }

  const { data: signed, error: signedError } = await supabase.storage.from("client-submissions").createSignedUrl(submission.file_path, 60);
  if (signedError || !signed?.signedUrl) {
    return NextResponse.json({ error: signedError?.message ?? "Unable to create download link" }, { status: 500 });
  }

  return NextResponse.redirect(signed.signedUrl);
}
