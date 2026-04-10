"use client";
import { useState } from "react";
import { PLANS } from "@/lib/supabase";
import type { ClientPlan } from "@/lib/supabase";
import paymentLinks from "@/lib/payment-links.json";
import { Package, CreditCard } from "lucide-react";

const ADD_ONS = [
  {
    name: "Business Credit Reporting",
    price: "$249/mo",
    description: "D&B, Experian Business, Equifax Business reporting",
    stripe: paymentLinks.business_credit_addon,
  },
];

const ONE_TIME = [
  { name: "EIN Filing", price: "$100", stripe: paymentLinks.ein_filing },
  { name: "LLC / Corp Formation", price: "$599", stripe: paymentLinks.llc_formation },
  { name: "Registered Agent", price: "$159/yr", stripe: paymentLinks.registered_agent },
  { name: "Fundability Dashboard", price: "$997 one-time", stripe: paymentLinks.fundability_dashboard },
];

export default function BillingPage() {
  const currentPlan: ClientPlan = "plus";
  const plan = PLANS[currentPlan];
  const [referralName, setReferralName] = useState("");
  const [referralEmail, setReferralEmail] = useState("");
  const [referralMessage, setReferralMessage] = useState("");

  const handleReferralSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!referralName || !referralEmail) return;

    const referral = {
      name: referralName,
      email: referralEmail,
      submittedAt: new Date().toISOString(),
    };

    if (typeof window !== "undefined") {
      const existing = JSON.parse(localStorage.getItem("aibc_referrals") || "[]");
      existing.push(referral);
      localStorage.setItem("aibc_referrals", JSON.stringify(existing));
    }

    setReferralName("");
    setReferralEmail("");
    setReferralMessage("Thanks! We'll reach out to them.");
  };

  return (
    <div className="p-6 lg:p-10 max-w-4xl">
      <div className="mb-8">
        <p className="text-[#36EAEA] text-xs font-semibold uppercase tracking-widest mb-1">Billing</p>
        <h1 className="text-3xl font-bold text-white">Your Plan & Billing</h1>
      </div>

      {/* Ownership CTA */}
      <div className="glass-card rounded-3xl border border-white/10 p-6 mb-6 flex flex-col gap-3 lg:flex-row lg:items-center">
        <div className="border-l-4 border-[#36EAEA]/80 pl-4">
          <p className="text-xs uppercase tracking-widest text-[#36EAEA]/70">Deeded Units</p>
          <h2 className="text-2xl font-bold text-white mb-2">Ready to Own Your Suite?</h2>
          <p className="text-white/70 text-sm">
            Upgrade from an address plan to a deeded AI Business Center unit at 125 N 9th Street, Frederick, OK. One transaction.
            $250K commercial mortgage trade line. AI stack included.
          </p>
        </div>
        <a
          href="https://aibusinesscenters.com"
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center justify-center rounded-2xl bg-[#36EAEA] px-6 py-3 font-semibold text-[#040d1a] shadow-[0_20px_60px_rgba(54,234,234,0.35)] hover:bg-[#2fd4d4] transition-colors"
        >
          Learn More →
        </a>
      </div>

      {/* Current plan */}
      <div className="glass-card rounded-3xl border border-teal-400/30 p-6 mb-6 shadow-[0_25px_80px_rgba(4,13,26,0.45)]">
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Package className="h-4 w-4 text-[#36EAEA]" />
              <span className="text-xs text-[#36EAEA] uppercase tracking-widest">Current Plan</span>
            </div>
            <h2 className="text-xl font-bold text-white">{plan.name}</h2>
            <p className="text-[#36EAEA] font-bold text-2xl mt-1">${plan.price}<span className="text-sm font-normal text-[#E6E9ED]/50">/mo</span></p>
          </div>
          <span className="glass-pill text-[#36EAEA] text-xs font-bold px-3 py-1">Active</span>
        </div>
        <ul className="space-y-1.5">
          {plan.features.map((f) => (
            <li key={f} className="flex items-center gap-2 text-sm text-white/70">
              <span className="text-[#36EAEA]">→</span> {f}
            </li>
          ))}
        </ul>
        <div className="mt-5 flex gap-3">
          <button className="text-sm px-5 py-2 rounded-xl text-[#040d1a] bg-[#36EAEA] font-semibold hover:bg-[#2fd4d4] transition-colors">
            Upgrade Plan
          </button>
        </div>
      </div>

      {/* Add-ons */}
      <div className="mb-6">
        <p className="text-xs uppercase tracking-widest text-[#E6E9ED]/40 mb-3">Add-Ons</p>
        {ADD_ONS.map((addon) => (
          <div key={addon.name} className="glass-card rounded-2xl border-white/10 p-5 flex items-center justify-between">
            <div>
              <p className="text-white font-semibold text-sm">{addon.name}</p>
              <p className="text-white/60 text-xs mt-0.5">{addon.description}</p>
            </div>
            <div className="text-right flex-shrink-0 ml-4">
              <p className="text-[#36EAEA] font-bold text-sm">{addon.price}</p>
              <a
                href={addon.stripe}
                target="_blank"
                rel="noreferrer"
                className="text-xs text-[#36EAEA]/70 hover:text-[#36EAEA] mt-1 transition-colors"
              >
                Add →
              </a>
            </div>
          </div>
        ))}
      </div>

      {/* One-time services */}
      <div>
        <p className="text-xs uppercase tracking-widest text-[#E6E9ED]/40 mb-3">One-Time Services</p>
        <div className="grid grid-cols-2 gap-3">
          {ONE_TIME.map((svc) => (
            <a
              key={svc.name}
              href={svc.stripe}
              className="glass-card rounded-2xl border-white/10 p-4 hover:border-teal-400/30 hover:shadow-[0_15px_45px_rgba(54,234,234,0.2)] transition-all"
            >
              <div className="flex items-center gap-2 mb-1">
                <CreditCard className="h-3.5 w-3.5 text-[#36EAEA]/60" />
                <p className="text-white text-sm font-semibold">{svc.name}</p>
              </div>
              <p className="text-[#36EAEA] font-bold text-sm">{svc.price}</p>
            </a>
          ))}
        </div>
      </div>

      {/* Referral program */}
      <div className="mt-6 glass-card rounded-2xl border-white/10 p-6">
        <div className="flex flex-col gap-2 mb-4">
          <p className="text-xs uppercase tracking-widest text-[#36EAEA]/70">Growth Rewards</p>
          <h3 className="text-white text-xl font-semibold">Refer a Business, Get a Month Free</h3>
          <p className="text-white/70 text-sm">
            Know a business owner who could benefit from a professional address and business credit suite? Refer them and get one month of
            your plan free when they sign up.
          </p>
        </div>
        <form onSubmit={handleReferralSubmit} className="space-y-3">
          <input
            type="text"
            placeholder="Referral name"
            value={referralName}
            onChange={(e) => setReferralName(e.target.value)}
            className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-white/40 focus:border-[#36EAEA]/60 focus:outline-none"
            required
          />
          <input
            type="email"
            placeholder="Referral email"
            value={referralEmail}
            onChange={(e) => setReferralEmail(e.target.value)}
            className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-white/40 focus:border-[#36EAEA]/60 focus:outline-none"
            required
          />
          <button
            type="submit"
            className="w-full rounded-2xl bg-[#36EAEA] px-4 py-3 text-sm font-semibold text-[#040d1a] hover:bg-[#2fd4d4] transition-colors"
          >
            Send Referral
          </button>
          {referralMessage && <p className="text-center text-sm text-[#36EAEA]">{referralMessage}</p>}
        </form>
      </div>
    </div>
  );
}
