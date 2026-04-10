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
    <aside className="hidden lg:flex flex-col w-56 bg-[#0D2A4A] border-r border-[#36EAEA]/10 min-h-screen p-5">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-9 h-9 rounded-lg bg-[#36EAEA]/10 border border-[#36EAEA]/30 flex items-center justify-center flex-shrink-0">
          <span className="text-[#36EAEA] font-bold text-sm">AI</span>
        </div>
        <div>
          <div className="text-white text-xs font-bold leading-tight">AIBC Portal</div>
          <div className="text-[#E6E9ED]/40 text-[10px] leading-tight truncate max-w-[100px]">{businessName || "Client"}</div>
        </div>
      </div>

      <nav className="flex-1 space-y-1">
        {navItems.map(({ href, icon: Icon, label }) => {
          const active = pathname === href || (href !== "/dashboard" && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all ${
                active
                  ? "bg-[#36EAEA]/10 text-[#36EAEA] border border-[#36EAEA]/20"
                  : "text-[#E6E9ED]/60 hover:text-white hover:bg-white/5"
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
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-[#E6E9ED]/40 hover:text-white hover:bg-white/5 transition-all w-full"
        >
          <LogOut className="h-4 w-4" />
          Sign Out
        </button>
      </form>
    </aside>
  );
}
