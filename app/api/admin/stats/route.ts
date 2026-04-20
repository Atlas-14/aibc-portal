import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function GET() {
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

  try {
    const [clientsRes, submissionsRes, unitsRes, recentDocsRes] = await Promise.all([
      supabase
        .from("clients")
        .select("id, full_name, business_name, plan, status, created_at, updated_at")
        .order("created_at", { ascending: false }),
      supabase
        .from("client_submissions")
        .select("id, client_id, file_name, category, status, submitted_at, reviewed_at")
        .order("submitted_at", { ascending: false })
        .limit(20),
      supabase
        .from("units")
        .select("id, unit_number, status, owner_name, sale_price, assigned_at"),
      supabase
        .from("admin_documents")
        .select("id, client_id, file_name, category, uploaded_at")
        .order("uploaded_at", { ascending: false })
        .limit(20),
    ]);

    const clients = clientsRes.data ?? [];
    const submissions = submissionsRes.data ?? [];
    const units = unitsRes.data ?? [];
    const recentDocs = recentDocsRes.data ?? [];

    const clientMap = Object.fromEntries(
      clients.map((client) => [
        client.id,
        {
          fullName: client.full_name,
          businessName: client.business_name,
        },
      ]),
    );

    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const monthlyRevenue = units.reduce((sum, unit) => {
      if (!unit.assigned_at) return sum;
      const assignedDate = new Date(unit.assigned_at);
      if (assignedDate.getMonth() === currentMonth && assignedDate.getFullYear() === currentYear) {
        return sum + Number(unit.sale_price ?? 250000);
      }
      return sum;
    }, 0);

    const totalCommitted = units.reduce((sum, unit) => {
      if (unit.status !== "assigned") return sum;
      return sum + Number(unit.sale_price ?? 250000);
    }, 0);

    const activity = [
      ...submissions.slice(0, 10).map((submission) => ({
        id: `submission-${submission.id}`,
        type: "submission",
        title: `${clientMap[submission.client_id]?.fullName ?? "Unknown client"} submitted ${submission.file_name}`,
        meta: submission.category,
        at: submission.submitted_at,
        href: "/admin/submissions",
      })),
      ...recentDocs.slice(0, 10).map((doc) => ({
        id: `document-${doc.id}`,
        type: "document",
        title: `Document uploaded for ${clientMap[doc.client_id]?.fullName ?? "Unknown client"}`,
        meta: doc.file_name,
        at: doc.uploaded_at,
        href: `/admin/clients/${doc.client_id}`,
      })),
      ...clients.slice(0, 10).map((client) => ({
        id: `client-${client.id}`,
        type: "client",
        title: `${client.full_name} joined ${client.plan}`,
        meta: client.business_name,
        at: client.created_at,
        href: `/admin/clients/${client.id}`,
      })),
      ...units
        .filter((unit) => unit.assigned_at)
        .slice(0, 10)
        .map((unit) => ({
          id: `unit-${unit.id}`,
          type: "unit",
          title: `Unit ${unit.unit_number} ${unit.status === "assigned" ? "assigned" : "reserved"}`,
          meta: unit.owner_name ?? "No owner recorded",
          at: unit.assigned_at,
          href: "/admin/units",
        })),
    ]
      .sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime())
      .slice(0, 10);

    return NextResponse.json({
      totalClients: clients.length,
      activeClients: clients.filter((client) => client.status === "active").length,
      pendingSubmissions: submissions.filter((submission) => submission.status === "pending_review").length,
      unitsAvailable: units.filter((unit) => unit.status === "available").length,
      unitsSold: units.filter((unit) => unit.status === "assigned").length,
      monthlyRevenue,
      totalCommitted,
      recentSubmissions: submissions
        .filter((submission) => submission.status === "pending_review")
        .slice(0, 5)
        .map((submission) => ({
          id: submission.id,
          clientName: clientMap[submission.client_id]?.fullName ?? "Unknown",
          businessName: clientMap[submission.client_id]?.businessName ?? "",
          fileName: submission.file_name,
          status: submission.status,
          submittedAt: submission.submitted_at,
        })),
      recentClients: clients.slice(0, 5).map((client) => ({
        id: client.id,
        fullName: client.full_name,
        businessName: client.business_name,
        plan: client.plan,
        status: client.status,
        createdAt: client.created_at,
      })),
      recentActivity: activity,
    });
  } catch {
    return NextResponse.json({ error: "Failed to load stats" }, { status: 500 });
  }
}
