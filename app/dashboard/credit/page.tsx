"use client";
import { BarChart2, CheckCircle, XCircle } from "lucide-react";

const bureaus = [
  { name: "Dun & Bradstreet (PAYDEX)", abbr: "D&B", active: false },
  { name: "Experian Business", abbr: "Experian", active: false },
  { name: "Equifax Business", abbr: "Equifax", active: false },
];

export default function CreditPage() {
  const hasAddon = false; // fetched from client plan

  return (
    <div className="p-6 lg:p-10 max-w-4xl">
      <div className="mb-8">
        <p className="text-[#36EAEA] text-xs font-semibold uppercase tracking-widest mb-1">Credit</p>
        <h1 className="text-3xl font-bold text-white">Business Credit Status</h1>
        <p className="text-white/60 text-sm mt-1">Track your business credit bureau reporting from your AIBC address.</p>
      </div>

      {!hasAddon ? (
        <div className="glass-card rounded-3xl border border-amber-500/30 p-8 text-center shadow-[0_25px_80px_rgba(4,13,26,0.45)]">
          <BarChart2 className="h-10 w-10 text-amber-400/40 mx-auto mb-3" />
          <h2 className="text-white font-semibold text-lg mb-2">Business Credit Reporting Not Active</h2>
          <p className="text-white/60 text-sm max-w-sm mx-auto mb-5">
            Add the Business Credit Reporting add-on to have your monthly payments reported directly to D&B, Experian Business, and Equifax Business.
          </p>
          <a
            href="/dashboard/billing"
            className="inline-block bg-[#36EAEA] text-[#040d1a] font-bold px-6 py-3 rounded-xl text-sm hover:bg-[#2fd4d4] transition-colors drop-shadow-[0_12px_35px_rgba(54,234,234,0.35)]"
          >
            Add Credit Reporting — $249/mo →
          </a>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            {bureaus.map(({ name, abbr, active }) => (
              <div key={abbr} className={`glass-card rounded-2xl p-5 border ${active ? "border-emerald-400/40" : "border-white/10"}`}>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold text-white/60 uppercase tracking-widest">{abbr}</span>
                  {active ? (
                    <CheckCircle className="h-4 w-4 text-emerald-400" />
                  ) : (
                    <XCircle className="h-4 w-4 text-[#E6E9ED]/30" />
                  )}
                </div>
                <p className="text-white text-sm font-semibold">{name}</p>
                <p className={`text-xs mt-1 ${active ? "text-emerald-400" : "text-white/40"}`}>
                  {active ? "● Reporting" : "○ Not Active"}
                </p>
              </div>
            ))}
          </div>
          <div className="glass-card rounded-2xl border-white/10 p-5">
            <p className="text-xs uppercase tracking-widest text-white/50 mb-2">Fundability Dashboard</p>
            <a href="#" className="text-[#36EAEA] text-sm hover:underline">Open Fundability Dashboard →</a>
          </div>
        </div>
      )}
    </div>
  );
}
