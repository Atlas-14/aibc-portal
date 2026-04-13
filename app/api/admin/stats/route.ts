import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET() {
  try {
    const [clientsRes, submissionsRes, unitsRes] = await Promise.all([
      supabase.from("clients").select("id, full_name, business_name, plan, status, created_at").order("created_at", { ascending: false }),
      supabase.from("client_submissions").select("id, client_id, file_name, status, submitted_at").eq("status", "pending_review").order("submitted_at", { ascending: false }).limit(5),
      supabase.from("units").select("status"),
    ]);

    const clients = clientsRes.data ?? [];
    const submissions = submissionsRes.data ?? [];
    const units = unitsRes.data ?? [];

    // Enrich submissions with client names
    const clientMap = Object.fromEntries(clients.map(c => [c.id, c]));
    const enrichedSubmissions = submissions.map(s => ({
      id: s.id,
      clientName: clientMap[s.client_id]?.full_name ?? "Unknown",
      businessName: clientMap[s.client_id]?.business_name ?? "",
      fileName: s.file_name,
      status: s.status,
      submittedAt: s.submitted_at,
    }));

    return NextResponse.json({
      totalClients: clients.length,
      pendingSubmissions: submissions.length,
      unitsAvailable: units.filter(u => u.status === "available").length,
      unitsSold: units.filter(u => u.status === "assigned").length,
      recentSubmissions: enrichedSubmissions,
      recentClients: clients.slice(0, 5).map(c => ({
        id: c.id,
        fullName: c.full_name,
        businessName: c.business_name,
        plan: c.plan,
        status: c.status,
        createdAt: c.created_at,
      })),
    });
  } catch {
    return NextResponse.json({ error: "Failed to load stats" }, { status: 500 });
  }
}
