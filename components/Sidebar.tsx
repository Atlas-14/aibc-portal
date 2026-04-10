"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Mail, Send, CreditCard, BarChart2, Settings, LayoutDashboard, LogOut } from "lucide-react";

const navItems = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/dashboard/mail", icon: Mail, label: "Mail" },
  { href: "/dashboard/requests", icon: Send, label: "Requests" },
  { href: "/dashboard/credit", icon: BarChart2, label: "Credit" },
  { href: "/dashboard/billing", icon: CreditCard, label: "Billing" },
  { href: "/dashboard/settings", icon: Settings, label: "Settings" },
];

export default function Sidebar({ businessName }: { businessName?: string }) {
  const pathname = usePathname();

  return (
    <aside className="hidden lg:flex flex-col w-56 bg-black/20 backdrop-blur-2xl border-r border-white/8 min-h-screen p-5 text-white/80">
      <div className="flex items-center gap-3 mb-8 relative">
        <div className="absolute -inset-2 rounded-2xl bg-[#36EAEA]/10 blur-2xl opacity-70" />
        <div className="w-11 h-11 rounded-2xl overflow-hidden flex-shrink-0 bg-white/5 border border-white/10 relative z-10">
          <img src="/aibc-logo-transparent.png" alt="AIBC" className="w-full h-full object-contain" />
        </div>
        <div className="relative z-10">
          <div className="text-white text-xs font-bold leading-tight uppercase tracking-wider">AIBC Portal</div>
          <div className="text-white/50 text-[10px] leading-tight truncate max-w-[100px]">{businessName || "Client"}</div>
        </div>
      </div>

      <nav className="flex-1 space-y-1">
        {navItems.map(({ href, icon: Icon, label }) => {
          const active = pathname === href || (href !== "/dashboard" && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all border ${
                active
                  ? "bg-teal-400/10 border-teal-400/25 text-teal-300 shadow-[0_0_25px_rgba(54,234,234,0.25)]"
                  : "border-transparent text-white/50 hover:text-white hover:bg-white/5"
              }`}
            >
              <Icon className="h-4 w-4 flex-shrink-0" />
              {label}
            </Link>
          );
        })}
      </nav>

      <form action="/api/auth/logout" method="POST">
        <button
          type="submit"
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-white/30 hover:text-white/60 hover:bg-white/5 transition-all w-full"
        >
          <LogOut className="h-4 w-4" />
          Sign Out
        </button>
      </form>
    </aside>
  );
}
