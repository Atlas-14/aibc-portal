"use client";

import { Layers, Shield, LifeBuoy, HardDrive, FileBadge2, ExternalLink } from "lucide-react";
import Link from "next/link";

const TOOL_CARDS = [
  {
    title: "AI District",
    description: "Your AI tool suite",
    href: "https://aidistrict.com",
    icon: Layers,
    external: true,
  },
  {
    title: "Fundability Dashboard",
    description: "Business credit monitoring",
    href: "/dashboard/credit",
    icon: Shield,
  },
  {
    title: "AI Technician Support",
    description: "Get help from your AI tech",
    href: "mailto:atlas@aibusinesscenters.com",
    icon: LifeBuoy,
  },
  {
    title: "Document Vault",
    description: "Store your business formation docs",
    href: "#",
    icon: HardDrive,
    comingSoon: true,
  },
  {
    title: "Business Address Certificate",
    description: "Download your address certificate",
    href: "#",
    icon: FileBadge2,
    comingSoon: true,
  },
  {
    title: "AIBC Member Resources",
    description: "Back to main site",
    href: "https://aibusinesscenters.com",
    icon: ExternalLink,
    external: true,
  },
];

export default function ToolsPage() {
  return (
    <div className="p-6 lg:p-10 max-w-5xl">
      <div className="mb-8">
        <p className="text-[#36EAEA] text-xs font-semibold uppercase tracking-widest mb-1">Tools</p>
        <h1 className="text-3xl font-bold text-white">Your AIBC Business Suite</h1>
        <p className="text-white/60 text-sm mt-2">Launch the systems that power your address, credit, and operations.</p>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        {TOOL_CARDS.map(({ title, description, href, icon: Icon, comingSoon, external }) => {
          const inner = (
            <div className="flex h-full flex-col justify-between gap-6">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/5">
                  <Icon className="h-5 w-5 text-[#36EAEA]" />
                </div>
                <div>
                  <p className="text-white text-lg font-semibold">{title}</p>
                  <p className="text-white/50 text-sm">{description}</p>
                </div>
              </div>
              <div className="flex items-center justify-between text-xs font-semibold">
                {comingSoon ? (
                  <span className="rounded-full border border-white/15 bg-white/5 px-3 py-1 text-white/70">Coming Soon</span>
                ) : (
                  <span className="text-[#36EAEA]">Open →</span>
                )}
                {!comingSoon && external && <span className="text-white/40">External</span>}
              </div>
            </div>
          );

          const cardClass = `glass-card rounded-3xl border border-white/10 p-5 h-full hover:border-teal-400/30 hover:bg-white/10 transition-all ${
            comingSoon ? "cursor-default opacity-80" : ""
          }`;

          if (comingSoon) {
            return (
              <div key={title} className={cardClass}>
                {inner}
              </div>
            );
          }

          if (external) {
            return (
              <a key={title} href={href} target="_blank" rel="noreferrer" className="block h-full">
                <div className={cardClass}>{inner}</div>
              </a>
            );
          }

          return (
            <Link key={title} href={href} className="block h-full">
              <div className={cardClass}>{inner}</div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
