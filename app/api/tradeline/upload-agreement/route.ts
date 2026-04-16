import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const MAX_SIZE = 10 * 1024 * 1024;
const BUCKET = "tradeline-agreements";

const getClients = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseAnonKey || !serviceRoleKey) {
    throw new Error("Supabase environment variables are not configured.");
  }

  return {
    authClient: createClient(supabaseUrl, supabaseAnonKey),
    adminClient: createClient(supabaseUrl, serviceRoleKey),
  };
};

export async function POST(request: NextRequest) {
  try {
    const { authClient, adminClient } = getClients();
    const accessToken = request.cookies.get("aibc_session")?.value;

    if (!accessToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const {
      data: { user },
      error: authError,
    } = await authClient.auth.getUser(accessToken);

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "PDF file is required" }, { status: 400 });
    }

    if (file.type !== "application/pdf") {
      return NextResponse.json({ error: "Only PDF files are allowed" }, { status: 400 });
    }

    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: "File too large (max 10MB)" }, { status: 400 });
    }

    const { data: clientRecord, error: clientError } = await adminClient
      .from("clients")
      .select("id")
      .eq("user_id", user.id)
      .maybeSingle();

    if (clientError) {
      return NextResponse.json({ error: clientError.message }, { status: 500 });
    }

    if (!clientRecord) {
      return NextResponse.json({ error: "Client record not found" }, { status: 404 });
    }

    const { data: subscription, error: subscriptionError } = await adminClient
      .from("trade_line_subscriptions")
      .select("id, status")
      .eq("client_id", clientRecord.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (subscriptionError && subscriptionError.code !== "PGRST116") {
      return NextResponse.json({ error: subscriptionError.message }, { status: 500 });
    }

    if (!subscription) {
      return NextResponse.json({ error: "Trade line subscription not found" }, { status: 404 });
    }

    if (subscription.status !== "pending_agreement") {
      return NextResponse.json({ error: "Agreement upload is only available while activation is pending" }, { status: 400 });
    }

    const { data: bucket } = await adminClient.storage.getBucket(BUCKET);
    if (!bucket) {
      const { error: bucketError } = await adminClient.storage.createBucket(BUCKET, { public: false });
      if (bucketError && !bucketError.message.toLowerCase().includes("already")) {
        return NextResponse.json({ error: bucketError.message }, { status: 500 });
      }
    }

    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "-");
    const filePath = `${clientRecord.id}/${subscription.id}/${Date.now()}-${safeName}`;
    const arrayBuffer = await file.arrayBuffer();

    const { error: uploadError } = await adminClient.storage
      .from(BUCKET)
      .upload(filePath, arrayBuffer, { contentType: file.type, upsert: true });

    if (uploadError) {
      return NextResponse.json({ error: uploadError.message }, { status: 500 });
    }

    const { error: updateError } = await adminClient
      .from("trade_line_subscriptions")
      .update({
        agreement_file_path: filePath,
        agreement_signed_at: new Date().toISOString(),
      })
      .eq("id", subscription.id);

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true, filePath });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to upload agreement" },
      { status: 500 }
    );
  }
}
