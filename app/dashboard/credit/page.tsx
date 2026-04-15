"use client";

import { useEffect, useMemo, useState } from "react";
import { AlertCircle, BarChart2, Building2, CheckCircle2, Clock3, Loader2, TrendingUp } from "lucide-react";

type CreditScoresResponse = {
  creditAddon: boolean;
  scores: {
    dnbPaydex: number | null;
    experianBusiness: number | null;
    equifaxBusiness: number | null;
    lastUpdatedAt: string | null;
  };
};

type ScoreCardData = {
  key: string;
  label: string;
  bureau: string;
  value: number | null;
};

const formatDate = (value: string | null) => {
  if (!value) return "Awaiting first report";

  return new Date(value).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

function UpsellState() {
  return (
    <div className="glass-card rounded-3xl border border-amber-500/30 p-8 text-center shadow-[0_25px_80px_rgba(4,13,26,0.45)]">
      <BarChart2 className="h-10 w-10 text-amber-400/40 mx-auto mb-3" />
      <h2 className="text-white font-semibold text-lg mb-2">Business Credit Reporting Not Active</h2>
      <p className="text-white/60 text-sm max-w-sm mx-auto mb-5">
        Add the Business Credit Reporting add-on to have your monthly payments reported directly to D&amp;B, Experian Business, and Equifax Business.
      </p>
      <a
        href="/dashboard/billing"
        className="inline-block bg-[#36EAEA] text-[#040d1a] font-bold px-6 py-3 rounded-xl text-sm hover:bg-[#2fd4d4] transition-colors drop-shadow-[0_12px_35px_rgba(54,234,234,0.35)]"
      >
        Add Credit Reporting — $249/mo →
      </a>
    </div>
  );
}

function ScoreCard({ label, bureau, value, lastUpdatedAt }: ScoreCardData & { lastUpdatedAt: string | null }) {
  const isActive = value !== null;

  return (
    <div className="glass-card rounded-3xl border border-white/10 p-6 shadow-[0_25px_80px_rgba(4,13,26,0.35)]">
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <p className="text-[11px] uppercase tracking-[0.25em] text-[#36EAEA]/75">{bureau}</p>
          <h2 className="text-white text-lg font-semibold mt-2">{label}</h2>
        </div>
        <span
          className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-wider ${
            isActive
              ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-300"
              : "border-amber-400/30 bg-amber-400/10 text-amber-300"
          }`}
        >
          {isActive ? <CheckCircle2 className="h-3.5 w-3.5" /> : <Clock3 className="h-3.5 w-3.5" />}
          {isActive ? "Active" : "Pending"}
        </span>
      </div>

      {isActive ? (
        <>
          <div className="flex items-end gap-2">
            <span className="text-5xl font-bold text-white leading-none">{value}</span>
            <span className="text-white/45 text-sm pb-1">score</span>
          </div>
          <p className="text-white/55 text-sm mt-4">Last updated {formatDate(lastUpdatedAt)}</p>
        </>
      ) : (
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <p className="text-amber-200 text-sm leading-relaxed">
            Pending — scores typically appear within 30 days of enrollment
          </p>
        </div>
      )}
    </div>
  );
}

export default function CreditPage() {
  const [data, setData] = useState<CreditScoresResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    const loadCreditDashboard = async () => {
      try {
        const response = await fetch("/api/credit-scores", { cache: "no-store" });
        const payload = await response.json();

        if (!response.ok) {
          throw new Error(payload?.error || "Unable to load business credit data.");
        }

        if (!cancelled) {
          setData(payload);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Unable to load business credit data.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadCreditDashboard();

    return () => {
      cancelled = true;
    };
  }, []);

  const scoreCards = useMemo<ScoreCardData[]>(() => {
    if (!data) return [];

    return [
      { key: "dnb", label: "D&B PAYDEX", bureau: "Dun & Bradstreet", value: data.scores.dnbPaydex },
      { key: "experian", label: "Experian Business", bureau: "Experian", value: data.scores.experianBusiness },
      { key: "equifax", label: "Equifax Business", bureau: "Equifax", value: data.scores.equifaxBusiness },
    ];
  }, [data]);

  return (
    <div className="p-6 lg:p-10 max-w-6xl">
      <div className="mb-8">
        <p className="text-[#36EAEA] text-xs font-semibold uppercase tracking-widest mb-1">Credit</p>
        <h1 className="text-3xl font-bold text-white">Business Credit Dashboard</h1>
        <p className="text-white/60 text-sm mt-1">Track your business credit bureau reporting from your AIBC address.</p>
      </div>

      {loading && (
        <div className="flex items-center gap-3 text-white/60 text-sm">
          <Loader2 className="h-4 w-4 animate-spin text-[#36EAEA]" />
          Loading your credit dashboard...
        </div>
      )}

      {!loading && error && (
        <div className="glass-card rounded-3xl border border-rose-400/25 p-6 text-sm text-rose-200">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-rose-300 mt-0.5" />
            <div>
              <p className="font-semibold text-white mb-1">We couldn't load your credit dashboard</p>
              <p className="text-rose-200/80">{error}</p>
            </div>
          </div>
        </div>
      )}

      {!loading && !error && data && !data.creditAddon && <UpsellState />}

      {!loading && !error && data && data.creditAddon && (
        <div className="space-y-6">
          <div className="glass-card rounded-3xl border border-[#36EAEA]/20 bg-[rgba(4,13,26,0.75)] p-5 shadow-[0_25px_80px_rgba(54,234,234,0.08)]">
            <div className="flex items-start gap-3">
              <div className="rounded-2xl border border-[#36EAEA]/20 bg-[#36EAEA]/10 p-2.5 text-[#36EAEA]">
                <AlertCircle className="h-5 w-5" />
              </div>
              <div>
                <p className="text-white font-semibold">Your scores are updated monthly by the AIBC team. Questions? Contact support.</p>
                <p className="text-white/55 text-sm mt-1">This dashboard reflects the most recent bureau data we have on file for your account.</p>
              </div>
            </div>
          </div>

          <div className="grid gap-4 lg:grid-cols-3">
            {scoreCards.map((card) => (
              <ScoreCard
                key={card.key}
                label={card.label}
                bureau={card.bureau}
                value={card.value}
                lastUpdatedAt={data.scores.lastUpdatedAt}
              />
            ))}
          </div>

          <div className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
            <section className="glass-card rounded-3xl border border-white/10 p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-2.5 text-[#36EAEA]">
                  <TrendingUp className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-white text-lg font-semibold">Score History</p>
                  <p className="text-white/50 text-sm">Track trends across all three bureaus.</p>
                </div>
              </div>
              <div className="rounded-2xl border border-dashed border-white/10 bg-white/5 px-5 py-10 text-center">
                <p className="text-white/75 font-medium">Full history coming soon</p>
                <p className="text-white/45 text-sm mt-2">We're wiring up monthly trend views next.</p>
              </div>
            </section>

            <section className="glass-card rounded-3xl border border-white/10 p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-2.5 text-[#36EAEA]">
                  <Building2 className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-white text-lg font-semibold">Reporting Status</p>
                  <p className="text-white/50 text-sm">Your current bureau setup at a glance.</p>
                </div>
              </div>
              <div className="space-y-3">
                {scoreCards.map((card) => {
                  const active = card.value !== null;

                  return (
                    <div key={`${card.key}-status`} className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                      <div>
                        <p className="text-white text-sm font-medium">{card.label}</p>
                        <p className="text-white/40 text-xs">Last updated {formatDate(data.scores.lastUpdatedAt)}</p>
                      </div>
                      <span className={`text-xs font-semibold ${active ? "text-emerald-300" : "text-amber-300"}`}>
                        {active ? "Active" : "Pending"}
                      </span>
                    </div>
                  );
                })}
              </div>
            </section>
          </div>
        </div>
      )}
    </div>
  );
}
