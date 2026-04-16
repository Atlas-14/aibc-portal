"use client";

import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, Loader2 } from "lucide-react";

type AdminTradeline = {
  id: string;
  clientId: string;
  clientName: string;
  businessName: string | null;
  email: string | null;
  tier: string;
  status: "pending_agreement" | "active" | "suspended" | "cancelled";
  creditLimit: number | null;
  monthlyFee: number | null;
  agreementUploaded: boolean;
  activatedAt: string | null;
  createdAt: string;
};

export default function AdminTradeLinesPage() {
  const [tradelines, setTradelines] = useState<AdminTradeline[]>([]);
  const [loading, setLoading] = useState(true);
  const [activatingId, setActivatingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadTradelines = async () => {
      try {
        const response = await fetch("/api/admin/tradelines");
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Unable to load trade lines");
        setTradelines(data.tradelines ?? []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unable to load trade lines");
      } finally {
        setLoading(false);
      }
    };

    loadTradelines();
  }, []);

  const readyToActivate = useMemo(
    () => tradelines.filter((item) => item.status === "pending_agreement" && item.agreementUploaded).length,
    [tradelines]
  );

  const handleActivate = async (id: string) => {
    setActivatingId(id);
    setError(null);
    try {
      const response = await fetch(`/api/admin/tradelines/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "active" }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Unable to activate trade line");

      setTradelines((current) =>
        current.map((item) =>
          item.id === id ? { ...item, status: "active", activatedAt: data.tradeline?.activated_at ?? new Date().toISOString() } : item
        )
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to activate trade line");
    } finally {
      setActivatingId(null);
    }
  };

  return (
    <div className="p-6 lg:p-10 max-w-6xl">
      <div className="mb-8 flex items-start justify-between gap-4">
        <div>
          <p className="text-red-400 text-xs font-semibold uppercase tracking-widest mb-1">Admin</p>
          <h1 className="text-3xl font-bold text-white">Trade Lines</h1>
          <p className="text-white/60 text-sm mt-1">{readyToActivate} ready for activation</p>
        </div>
      </div>

      {error ? <div className="mb-5 rounded-2xl border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm text-red-200">{error}</div> : null}

      {loading ? (
        <div className="space-y-3">{[1, 2, 3].map((i) => <div key={i} className="h-24 rounded-2xl bg-white/5 animate-pulse" />)}</div>
      ) : tradelines.length === 0 ? (
        <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-8 text-white/60">No trade line subscriptions yet.</div>
      ) : (
        <div className="overflow-hidden rounded-3xl border border-white/10 bg-black/10">
          <div className="grid grid-cols-[1.4fr_0.7fr_0.8fr_0.9fr_0.8fr] gap-4 border-b border-white/10 px-5 py-4 text-xs uppercase tracking-widest text-white/40">
            <div>Client</div>
            <div>Tier</div>
            <div>Status</div>
            <div>Agreement</div>
            <div className="text-right">Action</div>
          </div>
          {tradelines.map((item) => {
            const canActivate = item.status === "pending_agreement" && item.agreementUploaded;
            return (
              <div key={item.id} className="grid grid-cols-[1.4fr_0.7fr_0.8fr_0.9fr_0.8fr] gap-4 border-b border-white/5 px-5 py-4 text-sm text-white/80 last:border-b-0">
                <div>
                  <p className="font-semibold text-white">{item.clientName}</p>
                  <p className="text-white/50 text-xs">{item.businessName || item.email || "No company listed"}</p>
                </div>
                <div className="font-semibold text-white">${item.tier?.toUpperCase()}</div>
                <div>
                  <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                    item.status === "active" ? "bg-emerald-400/20 text-emerald-300" : "bg-amber-400/20 text-amber-200"
                  }`}>
                    {item.status === "pending_agreement" ? "Pending Agreement" : item.status}
                  </span>
                </div>
                <div className="text-white/70">{item.agreementUploaded ? "Yes" : "No"}</div>
                <div className="flex justify-end">
                  {item.status === "active" ? (
                    <span className="inline-flex items-center gap-2 text-emerald-300 text-xs font-semibold">
                      <CheckCircle2 className="h-4 w-4" /> Active
                    </span>
                  ) : canActivate ? (
                    <button
                      type="button"
                      onClick={() => handleActivate(item.id)}
                      disabled={activatingId === item.id}
                      className="inline-flex items-center gap-2 rounded-2xl bg-[#36EAEA] px-4 py-2 text-xs font-semibold text-[#040d1a] hover:bg-[#2fd4d4] disabled:cursor-not-allowed disabled:bg-[#36EAEA]/60"
                    >
                      {activatingId === item.id ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                      Activate
                    </button>
                  ) : (
                    <span className="text-xs text-white/35">Waiting</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
