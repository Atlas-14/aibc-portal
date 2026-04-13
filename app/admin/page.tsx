"use client";
import { useEffect, useState } from "react";
import { Users, FileText, Package, Clock, CheckCircle, AlertTriangle } from "lucide-react";
import Link from "next/link";

type Stats = {
  totalClients: number;
  pendingSubmissions: number;
  unitsAvailable: number;
  unitsSold: number;
  recentSubmissions: Array<{
    id: string;
    clientName: string;
    businessName: string;
    fileName: string;
    status: string;
    submittedAt: string;
  }>;
  recentClients: Array<{
    id: string;
    fullName: string;
    businessName: string;
    plan: string;
    status: string;
    createdAt: string;
  }>;
};

export default function AdminOverview() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/stats")
      .then((r) => r.json())
      .then((data) => { setStats(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const metricCards = [
    { label: "Total Clients", value: stats?.totalClients ?? "—", icon: Users, color: "text-teal-400", href: "/admin/clients" },
    { label: "Pending Submissions", value: stats?.pendingSubmissions ?? "—", icon: FileText, color: "text-amber-400", href: "/admin/submissions" },
    { label: "Units Sold", value: stats?.unitsSold ?? "—", icon: Package, color: "text-violet-400", href: "/admin/units" },
    { label: "Units Available", value: stats?.unitsAvailable ?? "—", icon: Package, color: "text-emerald-400", href: "/admin/units" },
  ];

  return (
    <div className="p-6 lg:p-10 max-w-6xl">
      <div className="mb-8">
        <p className="text-red-400 text-xs font-semibold uppercase tracking-widest mb-1">Admin Dashboard</p>
        <h1 className="text-3xl font-bold text-white">AIBC Command Center</h1>
        <p className="text-white/60 text-sm mt-1">Run the day-to-day from here.</p>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {metricCards.map(({ label, value, icon: Icon, color, href }) => (
          <Link key={label} href={href} className="glass-card rounded-2xl border-white/10 p-5 hover:border-teal-400/30 transition-all">
            <Icon className={`h-5 w-5 ${color} mb-3`} />
            <div className="text-2xl font-bold text-white mb-0.5">
              {loading ? <span className="animate-pulse text-white/30">...</span> : value}
            </div>
            <div className="text-white/60 text-xs">{label}</div>
          </Link>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Submissions */}
        <div className="glass-card rounded-2xl border-white/10 p-6">
          <div className="flex items-center justify-between mb-4">
            <p className="text-xs uppercase tracking-widest text-amber-400/70">Needs Review</p>
            <Link href="/admin/submissions" className="text-xs text-white/40 hover:text-white/70 transition-colors">View all →</Link>
          </div>
          <h2 className="text-white text-lg font-semibold mb-4">Client Submissions</h2>
          {loading ? (
            <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="h-12 rounded-xl bg-white/5 animate-pulse" />)}</div>
          ) : stats?.recentSubmissions?.length ? (
            <div className="space-y-3">
              {stats.recentSubmissions.map((sub) => (
                <Link key={sub.id} href="/admin/submissions" className="flex items-center justify-between p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-all">
                  <div>
                    <p className="text-white text-sm font-semibold">{sub.clientName}</p>
                    <p className="text-white/50 text-xs">{sub.fileName}</p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full font-semibold ${
                    sub.status === "pending_review" ? "bg-amber-400/20 text-amber-300" :
                    sub.status === "approved" ? "bg-emerald-400/20 text-emerald-300" :
                    "bg-red-400/20 text-red-300"
                  }`}>
                    {sub.status.replace("_", " ")}
                  </span>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <CheckCircle className="h-8 w-8 text-emerald-400/40 mx-auto mb-2" />
              <p className="text-white/40 text-sm">All caught up — no pending submissions</p>
            </div>
          )}
        </div>

        {/* Recent Clients */}
        <div className="glass-card rounded-2xl border-white/10 p-6">
          <div className="flex items-center justify-between mb-4">
            <p className="text-xs uppercase tracking-widest text-teal-400/70">New Members</p>
            <Link href="/admin/clients" className="text-xs text-white/40 hover:text-white/70 transition-colors">View all →</Link>
          </div>
          <h2 className="text-white text-lg font-semibold mb-4">Recent Clients</h2>
          {loading ? (
            <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="h-12 rounded-xl bg-white/5 animate-pulse" />)}</div>
          ) : stats?.recentClients?.length ? (
            <div className="space-y-3">
              {stats.recentClients.map((client) => (
                <Link key={client.id} href={`/admin/clients/${client.id}`} className="flex items-center justify-between p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-all">
                  <div>
                    <p className="text-white text-sm font-semibold">{client.fullName}</p>
                    <p className="text-white/50 text-xs">{client.businessName} · {client.plan}</p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full font-semibold ${
                    client.status === "active" ? "bg-emerald-400/20 text-emerald-300" : "bg-amber-400/20 text-amber-300"
                  }`}>
                    {client.status}
                  </span>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Users className="h-8 w-8 text-teal-400/40 mx-auto mb-2" />
              <p className="text-white/40 text-sm">No clients yet — add your first one</p>
              <Link href="/admin/clients" className="mt-3 inline-block text-sm text-teal-400 hover:text-teal-300">
                Add client →
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-6 glass-card rounded-2xl border-white/10 p-6">
        <p className="text-xs uppercase tracking-widest text-white/40 mb-4">Quick Actions</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: "Add Client", href: "/admin/clients/new", icon: Users },
            { label: "Upload Document", href: "/admin/documents/upload", icon: FileText },
            { label: "Review Submissions", href: "/admin/submissions", icon: Clock },
            { label: "Manage Units", href: "/admin/units", icon: Package },
          ].map(({ label, href, icon: Icon }) => (
            <Link key={label} href={href} className="flex items-center gap-2 rounded-xl px-4 py-3 text-sm text-red-300 bg-red-400/10 border border-red-400/20 hover:bg-red-400/20 transition-all">
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
