"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  CreditCard,
  FileText,
  FolderOpen,
  History,
  Keyboard,
  Landmark,
  LayoutDashboard,
  MoveLeft,
  Package,
  Settings,
  Users,
} from "lucide-react";

const navItems = [
  { href: "/admin", icon: LayoutDashboard, label: "Overview", exact: true },
  { href: "/admin/clients", icon: Users, label: "Clients" },
  { href: "/admin/credit", icon: CreditCard, label: "Credit Scores" },
  { href: "/admin/tradelines", icon: Landmark, label: "Trade Lines" },
  { href: "/admin/submissions", icon: FileText, label: "Submissions", badgeKey: "pendingReview" as const },
  { href: "/admin/documents", icon: FolderOpen, label: "Documents" },
  { href: "/admin/offboarding", icon: History, label: "Offboarding Log" },
  { href: "/admin/units", icon: Package, label: "Units" },
  { href: "/admin/settings", icon: Settings, label: "Settings" },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const [pendingReview, setPendingReview] = useState(0);

  useEffect(() => {
    let active = true;
    fetch("/api/admin/stats")
      .then((response) => response.json())
      .then((data) => {
        if (active) setPendingReview(data.pendingSubmissions ?? 0);
      })
      .catch(() => undefined);
    return () => {
      active = false;
    };
  }, [pathname]);

  return (
    <aside className="hidden min-h-screen w-72 flex-col border-r border-white/8 bg-black/20 p-6 text-white/80 backdrop-blur-2xl lg:flex">
      <div className="mb-10 rounded-[2rem] border border-white/10 bg-white/[0.04] p-4 shadow-[0_0_50px_rgba(54,234,234,0.08)]">
        <div className="flex items-center gap-3">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-white/5 p-2">
            <Image src="/aibc-logo-transparent.png" alt="AIBC" width={48} height={48} className="h-full w-full object-contain" />
          </div>
          <div>
            <div className="text-xs font-bold uppercase tracking-[0.35em] text-white/55">AIBC Admin</div>
            <div className="mt-1 text-lg font-semibold text-white">Ricky&apos;s cockpit</div>
            <div className="text-xs text-white/40">Business operations hub</div>
          </div>
        </div>
      </div>

      <nav className="flex-1 space-y-1.5">
        {navItems.map(({ href, icon: Icon, label, exact, badgeKey }) => {
          const active = exact ? pathname === href : pathname.startsWith(href);
          const badgeValue = badgeKey === "pendingReview" ? pendingReview : 0;
          return (
            <Link
              key={href}
              href={href}
              className={`group flex items-center justify-between rounded-2xl border px-4 py-3 text-sm transition-all ${
                active
                  ? "border-[#36EAEA]/25 bg-[#36EAEA]/10 text-white shadow-[0_0_30px_rgba(54,234,234,0.12)]"
                  : "border-transparent text-white/55 hover:border-white/10 hover:bg-white/5 hover:text-white"
              }`}
            >
              <span className="flex items-center gap-3">
                <Icon className={`h-4 w-4 ${active ? "text-[#36EAEA]" : "text-white/35 group-hover:text-white/65"}`} />
                {label}
              </span>
              {badgeValue > 0 ? (
                <span className="rounded-full border border-amber-400/25 bg-amber-400/15 px-2 py-0.5 text-[11px] font-semibold text-amber-200">
                  {badgeValue}
                </span>
              ) : null}
            </Link>
          );
        })}
      </nav>

      <div className="space-y-3 pt-6">
        <div className="rounded-[1.75rem] border border-white/10 bg-white/[0.03] p-4">
          <div className="flex items-center gap-2 text-xs uppercase tracking-[0.3em] text-white/35">
            <Keyboard className="h-3.5 w-3.5" />
            Quick hint
          </div>
          <p className="mt-3 text-sm text-white/70">Press <span className="rounded-lg border border-white/10 bg-white/5 px-2 py-1 text-xs text-white">⌘K</span> to search clients instantly.</p>
        </div>

        <Link
          href="/dashboard"
          className="flex items-center gap-3 rounded-2xl border border-white/10 px-4 py-3 text-sm text-white/60 transition hover:bg-white/5 hover:text-white"
        >
          <MoveLeft className="h-4 w-4" />
          Back to Client Portal
        </Link>
      </div>
    </aside>
  );
}
