import { NextRequest, NextResponse } from "next/server";

// Placeholder auth — wire to Supabase Auth once SUPABASE_ANON_KEY is configured
export async function POST(req: NextRequest) {
  const { email, password } = await req.json();
  if (!email || !password) {
    return NextResponse.json({ error: "Email and password required" }, { status: 400 });
  }
  // TODO: supabase.auth.signInWithPassword({ email, password })
  return NextResponse.json({ error: "Auth not configured — add Supabase keys to .env.local" }, { status: 503 });
}
