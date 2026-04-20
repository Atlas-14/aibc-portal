"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowUpRight,
  CheckCircle2,
  Clock3,
  DollarSign,
  FileText,
  Package,
  Users,
} from "lucide-react";
import { AdminPageHeader, EmptyState } from "@/components/admin/AdminPrimitives";

type Stats = {
  totalClients: number;
  activeClients: number;
  pendingSubmissions: number;
  unitsAvailable: number;
  unitsSold: number;
  monthlyRevenue: number;
  totalCommitted: number;
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
  recentActivity: Array<{
    id: string;
    type: string;
    title: string;
    meta: string;
    at: string;
    href: string;
  }>;
};

export default function AdminOverview() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/stats")
      .then((response) => response.json())
      .then((data) => {
        setStats(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning, Ricky";
    if (hour < 18) return "Good afternoon, Ricky";
    return "Good evening, Ricky";
  }, []);

  const metricCards = [
    {
      label: "Total clients",
      value: stats?.totalClients ?? 0,
      delta: `+${stats?.activeClients ?? 0} active`,
      icon: Users,
      tone: "border-[#36EAEA]/20 bg-[#36EAEA]/10 text-[#baf8f8]",
      href: "/admin/clients",
    },
    {
      label: "Pending submissions",
      value: stats?.pendingSubmissions ?? 0,
      delta: "Needs attention",
      icon: FileText,
      tone: "border-amber-400/20 bg-amber-400/10 text-amber-100",
      href: "/admin/submissions",
    },
    {
      label: "Units sold",
      value: stats?.unitsSold ?? 0,
      delta: `${stats?.unitsAvailable ?? 0} still open`,
      icon: Package,
      tone: "border-violet-400/20 bg-violet-400/10 text-violet-100",
      href: "/admin/units",
    },
    {
      label: "Revenue this month",
      value: `$${Number(stats?.monthlyRevenue ?? 0).toLocaleString()}`,
      delta: "Committed this month",
      icon: DollarSign,
      tone: "border-emerald-400/20 bg-emerald-400/10 text-emerald-100",
      href: "/admin/units",
    },
  ];

  return (
    <div className="mx-auto max-w-7xl p-6 lg:p-10">
      <AdminPageHeader
        eyebrow="Overview"
        title={greeting}
        description="Your admin cockpit is live. Keep client operations, compliance, and unit sales moving from one screen."
        breadcrumbs={[{ label: "Admin", href: "/admin" }, { label: "Overview" }]}
      />

      <div className="mb-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {metricCards.map(({ label, value, delta, icon: Icon, tone, href }) => (
          <Link key={label} href={href} className={`rounded-[2rem] border p-5 transition hover:-translate-y-0.5 ${tone}`}>
            <div className="flex items-center justify-between">
              <Icon className="h-5 w-5" />
              <ArrowUpRight className="h-4 w-4 text-white/40" />
            </div>
            <p className="mt-6 text-3xl font-semibold text-white">{loading ? "..." : value}</p>
            <p className="mt-1 text-sm text-white/70">{label}</p>
            <p className="mt-3 text-xs uppercase tracking-[0.25em] text-white/50">{delta}</p>
          </Link>
        ))}
      </div>

      <div className="mb-8 grid gap-4 xl:grid-cols-4">
        {[
          { label: "Revenue this month", value: `$${Number(stats?.monthlyRevenue ?? 0).toLocaleString()}` },
          { label: "Active clients", value: String(stats?.activeClients ?? 0) },
          { label: "Pending submissions", value: String(stats?.pendingSubmissions ?? 0) },
          { label: "Units available", value: String(stats?.unitsAvailable ?? 0) },
        ].map((item) => (
          <div key={item.label} className="rounded-[1.75rem] border border-white/10 bg-white/[0.04] px-5 py-4">
            <p className="text-xs uppercase tracking-[0.3em] text-white/35">{item.label}</p>
            <p className="mt-3 text-2xl font-semibold text-white">{loading ? "..." : item.value}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <section className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-6">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-white/35">Recent Activity</p>
              <h2 className="mt-2 text-xl font-semibold text-white">Last 10 admin events</h2>
            </div>
            <Clock3 className="h-5 w-5 text-white/35" />
          </div>
          {loading ? (
            <div className="space-y-3">{Array.from({ length: 6 }).map((_, index) => <div key={index} className="h-16 animate-pulse rounded-[1.5rem] border border-white/8 bg-white/5" />)}</div>
          ) : stats?.recentActivity?.length ? (
            <div className="space-y-3">
              {stats.recentActivity.map((item) => (
                <Link key={item.id} href={item.href} className="flex items-start justify-between rounded-[1.5rem] border border-white/8 bg-black/10 p-4 transition hover:border-[#36EAEA]/20 hover:bg-black/15">
                  <div>
                    <p className="text-sm font-semibold text-white">{item.title}</p>
                    <p className="mt-1 text-xs text-white/45">{item.meta}</p>
                  </div>
                  <p className="text-xs text-white/35">{new Date(item.at).toLocaleString()}</p>
                </Link>
              ))}
            </div>
          ) : (
            <EmptyState icon={<CheckCircle2 className="h-6 w-6" />} title="Nothing new yet" description="As clients join, upload files, and reserve units, activity will stream here automatically." />
          )}
        </section>

        <div className="space-y-6">
          <section className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-6">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-white/35">Needs review</p>
                <h2 className="mt-2 text-xl font-semibold text-white">Pending submissions</h2>
              </div>
              <Link href="/admin/submissions" className="text-sm text-[#9af7f7] transition hover:text-white">Open queue</Link>
            </div>
            {loading ? (
              <div className="space-y-3">{Array.from({ length: 3 }).map((_, index) => <div key={index} className="h-16 animate-pulse rounded-[1.5rem] border border-white/8 bg-white/5" />)}</div>
            ) : stats?.recentSubmissions?.length ? (
              <div className="space-y-3">
                {stats.recentSubmissions.map((submission) => (
                  <Link key={submission.id} href="/admin/submissions" className="block rounded-[1.5rem] border border-white/8 bg-black/10 p-4 transition hover:border-amber-300/20 hover:bg-black/15">
                    <p className="text-sm font-semibold text-white">{submission.clientName}</p>
                    <p className="mt-1 text-sm text-amber-100">{submission.fileName}</p>
                    <p className="mt-1 text-xs text-white/40">{new Date(submission.submittedAt).toLocaleString()}</p>
                  </Link>
                ))}
              </div>
            ) : (
              <EmptyState icon={<CheckCircle2 className="h-6 w-6" />} title="All caught up" description="There are no pending submission reviews right now." />
            )}
          </section>

          <section className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-6">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-white/35">New clients</p>
                <h2 className="mt-2 text-xl font-semibold text-white">Latest accounts</h2>
              </div>
              <Link href="/admin/clients" className="text-sm text-[#9af7f7] transition hover:text-white">Open clients</Link>
            </div>
            {loading ? (
              <div className="space-y-3">{Array.from({ length: 3 }).map((_, index) => <div key={index} className="h-16 animate-pulse rounded-[1.5rem] border border-white/8 bg-white/5" />)}</div>
            ) : stats?.recentClients?.length ? (
              <div className="space-y-3">
                {stats.recentClients.map((client) => (
                  <Link key={client.id} href={`/admin/clients/${client.id}`} className="block rounded-[1.5rem] border border-white/8 bg-black/10 p-4 transition hover:border-[#36EAEA]/20 hover:bg-black/15">
                    <p className="text-sm font-semibold text-white">{client.fullName}</p>
                    <p className="mt-1 text-xs text-white/45">{client.businessName} • {client.plan}</p>
                  </Link>
                ))}
              </div>
            ) : (
              <EmptyState icon={<Users className="h-6 w-6" />} title="No clients yet" description="Once clients are onboarded, their latest account activity will appear here." />
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
