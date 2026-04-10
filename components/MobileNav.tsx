"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Mail,
  Send,
  CreditCard,
  Settings,
} from "lucide-react";

const tabs = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/mail", label: "Mail", icon: Mail },
  { href: "/dashboard/requests", label: "Requests", icon: Send },
  { href: "/dashboard/billing", label: "Billing", icon: CreditCard },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

export default function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="lg:hidden fixed bottom-0 inset-x-0 bg-black/30 backdrop-blur-2xl border-t border-white/8 shadow-[0_-18px_45px_rgba(0,0,0,0.65)] z-40">
      <div className="grid grid-cols-5">
        {tabs.map(({ href, label, icon: Icon }) => {
          const active =
            pathname === href || (href !== "/dashboard" && pathname.startsWith(href));

          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-col items-center justify-center py-3 text-[11px] font-medium transition-colors ${
                active ? "text-teal-300" : "text-white/50"
              }`}
            >
              <Icon className={`h-5 w-5 mb-1 ${active ? "stroke-[2.2]" : "stroke-[1.8]"}`} />
              {label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
