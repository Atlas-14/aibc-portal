"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  FolderOpen,
  UploadCloud,
  FileText,
  Package,
  Settings,
  LogOut,
  ShieldCheck,
} from "lucide-react";

const navItems = [
  { href: "/admin", icon: LayoutDashboard, label: "Overview", exact: true },
  { href: "/admin/clients", icon: Users, label: "Clients" },
  { href: "/admin/submissions", icon: FileText, label: "Submissions" },
  { href: "/admin/documents", icon: FolderOpen, label: "Documents" },
  { href: "/admin/units", icon: Package, label: "Units" },
  { href: "/admin/settings", icon: Settings, label: "Settings" },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden lg:flex flex-col w-56 bg-black/20 backdrop-blur-2xl border-r border-white/8 min-h-screen p-5 text-white/80">
      <div className="flex items-center gap-3 mb-8 relative">
        <div className="absolute -inset-2 rounded-2xl bg-red-400/10 blur-2xl opacity-70" />
        <div className="w-11 h-11 rounded-2xl overflow-hidden flex-shrink-0 bg-white/5 border border-white/10 relative z-10 flex items-center justify-center">
          <ShieldCheck className="h-6 w-6 text-red-400" />
        </div>
        <div className="relative z-10">
          <div className="text-white text-xs font-bold leading-tight uppercase tracking-wider">AIBC Admin</div>
          <div className="text-white/50 text-[10px] leading-tight">Ricky Kinney</div>
        </div>
      </div>

      <nav className="flex-1 space-y-1">
        {navItems.map(({ href, icon: Icon, label, exact }) => {
          const active = exact ? pathname === href : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all border ${
                active
                  ? "bg-red-400/10 border-red-400/25 text-red-300 shadow-[0_0_25px_rgba(248,113,113,0.15)]"
                  : "border-transparent text-white/50 hover:text-white hover:bg-white/5"
              }`}
            >
              <Icon className="h-4 w-4 flex-shrink-0" />
              {label}
            </Link>
          );
        })}
      </nav>

      <Link
        href="/dashboard"
        className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-white/30 hover:text-white/60 hover:bg-white/5 transition-all"
      >
        <LogOut className="h-4 w-4" />
        Client Portal
      </Link>
    </aside>
  );
}
