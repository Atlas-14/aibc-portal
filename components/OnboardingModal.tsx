"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, Mail, BadgeCheck } from "lucide-react";

const STEPS = [
  {
    title: "Your Address Is Active",
    description: "125 N 9th St, Frederick OK 73542 is now receiving mail for your business.",
    icon: CheckCircle2,
  },
  {
    title: "Managing Your Mail",
    description: "Request scans, forwards, shreds, or recycling with a tap. We handle the rest.",
    icon: Mail,
  },
  {
    title: "Your Plan",
    description: "You're on the Business Plus plan with priority handling and unlimited scans.",
    icon: BadgeCheck,
  },
];

const STORAGE_KEY = "aibc_onboarded";

export default function OnboardingModal() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const hasSeen = typeof window !== "undefined" && localStorage.getItem(STORAGE_KEY) === "true";
    if (!hasSeen) {
      setIsOpen(true);
    }
  }, []);

  const dismiss = () => {
    localStorage.setItem(STORAGE_KEY, "true");
    setIsOpen(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg rounded-3xl border border-[#36EAEA]/20 bg-[#0D2A4A] p-6 shadow-2xl">
        <p className="text-[#36EAEA] text-xs font-semibold uppercase tracking-[0.4em] mb-2">
          Welcome
        </p>
        <h2 className="text-2xl font-semibold text-white mb-6">
          Here's how to start using your AI Business Center
        </h2>
        <div className="space-y-4">
          {STEPS.map(({ title, description, icon: Icon }, index) => (
            <div key={title} className="flex gap-4 rounded-2xl border border-white/5 bg-white/5 p-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#071829] border border-[#36EAEA]/20 text-[#36EAEA]">
                <Icon className="h-6 w-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs uppercase tracking-widest text-[#E6E9ED]/40">
                    Step {index + 1}
                  </span>
                </div>
                <p className="text-white font-semibold mt-1">{title}</p>
                <p className="text-[#E6E9ED]/60 text-sm mt-1">{description}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-6 flex items-center justify-between">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#36EAEA]/30 bg-[#36EAEA]/10 px-3 py-1 text-xs text-[#36EAEA]">
            <BadgeCheck className="h-3.5 w-3.5" />
            Business Plus
          </div>
          <button
            onClick={dismiss}
            className="rounded-full bg-[#36EAEA] px-5 py-2 text-sm font-semibold text-[#071829] shadow-lg shadow-[#36EAEA]/30"
          >
            Get Started
          </button>
        </div>
      </div>
    </div>
  );
}
