"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Mail, Send, CreditCard, Settings, Layers, FolderOpen, BarChart2 } from "lucide-react";

const tabs = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/mail", label: "Mail", icon: Mail },
  { href: "/dashboard/requests", label: "Requests", icon: Send },
  { href: "/dashboard/credit", label: "Credit", icon: BarChart2 },
  { href: "/dashboard/tools", label: "Tools", icon: Layers },
  { href: "/dashboard/documents", label: "Documents", icon: FolderOpen },
  { href: "/dashboard/billing", label: "Billing", icon: CreditCard },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

export default function MobileNav() {
  const pathname = usePathname();
  const [unreadMail, setUnreadMail] = useState(0);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const unread = Number(localStorage.getItem("aibc_unread_mail") || "0");
    if (!Number.isNaN(unread)) setUnreadMail(unread);
  }, []);

  return (
    <nav className="lg:hidden fixed bottom-0 inset-x-0 bg-black/30 backdrop-blur-2xl border-t border-white/8 shadow-[0_-18px_45px_rgba(0,0,0,0.65)] z-40">
      <div className="grid grid-cols-4 sm:grid-cols-8">
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
              <span className="relative mb-1">
                <Icon className={`h-5 w-5 ${active ? "stroke-[2.2]" : "stroke-[1.8]"}`} />
                {label === "Mail" && unreadMail > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-red-400" />
                )}
              </span>
              {label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
