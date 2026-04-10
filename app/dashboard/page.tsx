"use client";
import { useEffect, useMemo, useState } from "react";
import { Mail, Send, CreditCard, BarChart2, Package } from "lucide-react";
import Link from "next/link";

export default function DashboardHome() {
  const [userName, setUserName] = useState("Ricky");
  const [businessName, setBusinessName] = useState("AI Business Centers Member");
  const [unreadMail, setUnreadMail] = useState(0);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const storedName = localStorage.getItem("aibc_user_name");
    const storedBusiness = localStorage.getItem("aibc_business_name");
    const unread = Number(localStorage.getItem("aibc_unread_mail") || "0");

    if (storedName) setUserName(storedName);
    if (storedBusiness) setBusinessName(storedBusiness);
    if (!Number.isNaN(unread)) setUnreadMail(unread);
  }, []);

  const stats = useMemo(
    () => [
      {
        label: "New Mail Items",
        value: unreadMail > 0 ? unreadMail.toString() : "—",
        icon: Mail,
        href: "/dashboard/mail",
        color: "text-[#36EAEA]",
      },
      { label: "Pending Requests", value: "—", icon: Send, href: "/dashboard/requests", color: "text-amber-400" },
      { label: "Current Plan", value: "—", icon: Package, href: "/dashboard/billing", color: "text-violet-400" },
      { label: "Credit Status", value: "—", icon: BarChart2, href: "/dashboard/credit", color: "text-emerald-400" },
    ],
    [unreadMail]
  );

  const todayLabel = useMemo(
    () =>
      new Date().toLocaleDateString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
        year: "numeric",
      }),
    []
  );

  const activityItems = [
    { label: "AIBC address activated", meta: todayLabel, accent: "bg-[#36EAEA]" },
    { label: "Welcome to Business Plus", meta: todayLabel, accent: "bg-[#36EAEA]" },
    { label: "Mail item received", meta: "Awaiting first delivery", accent: "bg-white/30" },
    { label: "Scan requested", meta: "No requests yet", accent: "bg-white/30" },
  ];

  return (
    <div className="p-6 lg:p-10 max-w-5xl">
      <div className="mb-8">
        <p className="text-[#36EAEA] text-xs font-semibold uppercase tracking-widest mb-1">AIBC Client Portal</p>
        <h1 className="text-3xl font-bold text-white">Welcome back, {userName}</h1>
        <p className="text-white/70 text-sm">{businessName}</p>
        <p className="text-white/50 text-sm mt-1">{todayLabel}</p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map(({ label, value, icon: Icon, href, color }) => (
          <Link
            key={label}
            href={href}
            className="glass-card rounded-2xl border-white/10 p-5 hover:border-teal-400/30 hover:bg-white/10 transition-all"
          >
            <div className="relative w-fit mb-3">
              <Icon className={`h-5 w-5 ${color}`} />
              {label === "New Mail Items" && unreadMail > 0 && (
                <span className="absolute -top-1.5 -right-1.5 inline-flex items-center justify-center rounded-full bg-red-400 text-[10px] font-bold text-white px-1.5">
                  {unreadMail}
                </span>
              )}
            </div>
            <div className="text-2xl font-bold text-white mb-0.5">{value}</div>
            <div className="text-white/60 text-xs">{label}</div>
          </Link>
        ))}
      </div>

      {/* Mail address */}
      <div className="glass-card rounded-2xl border-l-4 border-l-[#36EAEA]/60 border-white/10 p-6 mb-6">
        <p className="text-xs uppercase tracking-widest text-[#36EAEA]/70 mb-1">Your Business Address</p>
        <p className="text-white font-semibold text-lg">125 N 9th Street</p>
        <p className="text-white/60 text-sm">Frederick, Oklahoma 73542</p>
      </div>

      {/* Quick actions */}
      <div className="mb-8">
        <p className="text-xs uppercase tracking-widest text-[#E6E9ED]/40 mb-3">Quick Actions</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: "View Mail", href: "/dashboard/mail" },
            { label: "Track Requests", href: "/dashboard/requests" },
            { label: "Credit Status", href: "/dashboard/credit" },
            { label: "Manage Billing", href: "/dashboard/billing" },
          ].map(({ label, href }) => (
            <Link
              key={label}
              href={href}
              className="rounded-xl px-4 py-3 text-sm text-teal-300 text-center bg-teal-400/10 border border-teal-400/20 hover:bg-teal-400/20 transition-all"
            >
              {label} →
            </Link>
          ))}
        </div>
      </div>

      <div className="glass-card rounded-2xl border-white/10 p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-xs uppercase tracking-widest text-[#36EAEA]/70">Recent Activity</p>
            <p className="text-white text-lg font-semibold">Status updates from your suite</p>
          </div>
        </div>
        <div className="space-y-4">
          {activityItems.map(({ label, meta, accent }) => (
            <div key={label} className="flex items-start gap-3">
              <span className={`mt-1 h-2.5 w-2.5 rounded-full ${accent}`} />
              <div>
                <p className="text-sm text-white font-semibold">{label}</p>
                <p className="text-xs text-white/50">{meta}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
