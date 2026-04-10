"use client";
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

  return (
    <div className="p-6 lg:p-10 max-w-4xl">
      <div className="mb-8">
        <p className="text-[#36EAEA] text-xs font-semibold uppercase tracking-widest mb-1">Billing</p>
        <h1 className="text-2xl font-bold text-white">Your Plan & Billing</h1>
      </div>

      {/* Current plan */}
      <div className="bg-[#0D2A4A] border border-[#36EAEA]/30 rounded-xl p-6 mb-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Package className="h-4 w-4 text-[#36EAEA]" />
              <span className="text-xs text-[#36EAEA] uppercase tracking-widest">Current Plan</span>
            </div>
            <h2 className="text-xl font-bold text-white">{plan.name}</h2>
            <p className="text-[#36EAEA] font-bold text-2xl mt-1">${plan.price}<span className="text-sm font-normal text-[#E6E9ED]/50">/mo</span></p>
          </div>
          <span className="bg-[#36EAEA]/10 border border-[#36EAEA]/30 text-[#36EAEA] text-xs font-bold px-3 py-1 rounded-full">Active</span>
        </div>
        <ul className="space-y-1.5">
          {plan.features.map((f) => (
            <li key={f} className="flex items-center gap-2 text-sm text-[#E6E9ED]/70">
              <span className="text-[#36EAEA]">→</span> {f}
            </li>
          ))}
        </ul>
        <div className="mt-5 flex gap-3">
          <button className="text-sm border border-[#36EAEA]/30 text-[#36EAEA] px-5 py-2 rounded-lg hover:bg-[#36EAEA]/10 transition-colors">
            Upgrade Plan
          </button>
        </div>
      </div>

      {/* Add-ons */}
      <div className="mb-6">
        <p className="text-xs uppercase tracking-widest text-[#E6E9ED]/40 mb-3">Add-Ons</p>
        {ADD_ONS.map((addon) => (
          <div key={addon.name} className="bg-[#0D2A4A] border border-[#36EAEA]/10 rounded-xl p-5 flex items-center justify-between">
            <div>
              <p className="text-white font-semibold text-sm">{addon.name}</p>
              <p className="text-[#E6E9ED]/50 text-xs mt-0.5">{addon.description}</p>
            </div>
            <div className="text-right flex-shrink-0 ml-4">
              <p className="text-[#36EAEA] font-bold text-sm">{addon.price}</p>
              <a
                href={addon.stripe}
                target="_blank"
                rel="noreferrer"
                className="text-xs text-[#36EAEA]/60 hover:text-[#36EAEA] mt-1 transition-colors"
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
              className="bg-[#0D2A4A] border border-[#36EAEA]/10 rounded-xl p-4 hover:border-[#36EAEA]/30 transition-colors"
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
    </div>
  );
}
