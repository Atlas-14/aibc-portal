"use client";
import { Mail, Send, CreditCard, BarChart2, Package } from "lucide-react";
import Link from "next/link";

const stats = [
  { label: "New Mail Items", value: "—", icon: Mail, href: "/dashboard/mail", color: "text-[#36EAEA]" },
  { label: "Pending Requests", value: "—", icon: Send, href: "/dashboard/requests", color: "text-amber-400" },
  { label: "Current Plan", value: "—", icon: Package, href: "/dashboard/billing", color: "text-violet-400" },
  { label: "Credit Status", value: "—", icon: BarChart2, href: "/dashboard/credit", color: "text-emerald-400" },
];

export default function DashboardHome() {
  return (
    <div className="p-6 lg:p-10 max-w-5xl">
      <div className="mb-8">
        <p className="text-[#36EAEA] text-xs font-semibold uppercase tracking-widest mb-1">AIBC Client Portal</p>
        <h1 className="text-2xl font-bold text-white">Welcome back</h1>
        <p className="text-[#E6E9ED]/50 text-sm mt-1">
          {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}
        </p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map(({ label, value, icon: Icon, href, color }) => (
          <Link
            key={label}
            href={href}
            className="bg-[#0D2A4A] border border-[#36EAEA]/10 rounded-xl p-5 hover:border-[#36EAEA]/30 transition-colors"
          >
            <Icon className={`h-5 w-5 mb-3 ${color}`} />
            <div className="text-2xl font-bold text-white mb-0.5">{value}</div>
            <div className="text-[#E6E9ED]/50 text-xs">{label}</div>
          </Link>
        ))}
      </div>

      {/* Mail address */}
      <div className="bg-[#0D2A4A] border border-[#36EAEA]/10 rounded-xl p-6 mb-6">
        <p className="text-xs uppercase tracking-widest text-[#36EAEA]/70 mb-1">Your Business Address</p>
        <p className="text-white font-semibold text-lg">125 N 9th Street</p>
        <p className="text-[#E6E9ED]/60 text-sm">Frederick, Oklahoma 73542</p>
      </div>

      {/* Quick actions */}
      <div>
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
              className="bg-[#36EAEA]/5 border border-[#36EAEA]/20 rounded-lg px-4 py-3 text-sm text-[#36EAEA] text-center hover:bg-[#36EAEA]/10 transition-colors"
            >
              {label} →
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
