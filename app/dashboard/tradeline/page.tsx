"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { CheckCircle2, FileText, Loader2, UploadCloud } from "lucide-react";

type TradelineSubscription = {
  id: string;
  tier: string;
  status: "pending_agreement" | "active" | "suspended" | "cancelled";
  creditLimit: number | null;
  monthlyFee: number | null;
  agreementUploaded: boolean;
  activatedAt: string | null;
  createdAt: string;
};

export default function TradeLinePage() {
  const [subscription, setSubscription] = useState<TradelineSubscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadComplete, setUploadComplete] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadTradeline = async () => {
      try {
        const response = await fetch("/api/tradeline");
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Unable to load trade line status");
        }

        setSubscription(data.subscription ?? null);
        setUploadComplete(Boolean(data.subscription?.agreementUploaded));
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unable to load trade line status");
      } finally {
        setLoading(false);
      }
    };

    loadTradeline();
  }, []);

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setError(null);

    if (file.type !== "application/pdf") {
      setError("Please upload a PDF copy of your signed credit agreement.");
      event.target.value = "";
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    setUploading(true);
    try {
      const response = await fetch("/api/tradeline/upload-agreement", {
        method: "POST",
        body: formData,
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Unable to upload agreement");
      }

      setUploadComplete(true);
      setSubscription((current) => (current ? { ...current, agreementUploaded: true } : current));
      event.target.value = "";
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to upload agreement");
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 lg:p-10 max-w-4xl">
        <div className="h-48 rounded-3xl bg-white/5 animate-pulse" />
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-10 max-w-4xl">
      <div className="mb-8">
        <p className="text-[#36EAEA] text-xs font-semibold uppercase tracking-widest mb-1">Trade Line</p>
        <h1 className="text-3xl font-bold text-white">Trade Line Status</h1>
      </div>

      {error ? (
        <div className="mb-6 rounded-2xl border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm text-red-200">{error}</div>
      ) : null}

      {!subscription ? (
        <div className="glass-card rounded-3xl border border-white/10 p-8">
          <FileText className="h-10 w-10 text-white/25 mb-4" />
          <h2 className="text-2xl font-semibold text-white mb-2">No trade line subscription found</h2>
          <p className="text-white/65 text-sm mb-5">You are not currently subscribed to an AIBC trade line.</p>
          <Link
            href="/dashboard/billing"
            className="inline-flex items-center rounded-2xl bg-[#36EAEA] px-5 py-3 text-sm font-semibold text-[#040d1a] hover:bg-[#2fd4d4] transition-colors"
          >
            Go to Billing
          </Link>
        </div>
      ) : subscription.status === "active" ? (
        <div className="glass-card rounded-3xl border border-emerald-400/20 p-8 shadow-[0_20px_60px_rgba(16,185,129,0.12)]">
          <div className="flex items-center gap-3 mb-5">
            <CheckCircle2 className="h-8 w-8 text-emerald-300" />
            <div>
              <h2 className="text-2xl font-semibold text-white">Trade line active</h2>
              <p className="text-sm text-emerald-200/80">Your AIBC trade line is live.</p>
            </div>
          </div>

          <dl className="grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
              <dt className="text-xs uppercase tracking-widest text-white/40">Tier</dt>
              <dd className="mt-2 text-xl font-semibold text-white">${subscription.tier?.toUpperCase()}</dd>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
              <dt className="text-xs uppercase tracking-widest text-white/40">Credit Limit</dt>
              <dd className="mt-2 text-xl font-semibold text-white">
                {typeof subscription.creditLimit === "number"
                  ? subscription.creditLimit.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 })
                  : "Pending"}
              </dd>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
              <dt className="text-xs uppercase tracking-widest text-white/40">Activated</dt>
              <dd className="mt-2 text-xl font-semibold text-white">
                {subscription.activatedAt ? new Date(subscription.activatedAt).toLocaleDateString() : "Pending"}
              </dd>
            </div>
          </dl>

          <div className="mt-5 inline-flex rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-emerald-200">
            Status: Active
          </div>
        </div>
      ) : (
        <div className="glass-card rounded-3xl border border-amber-400/20 p-8 shadow-[0_20px_60px_rgba(245,158,11,0.1)]">
          <div className="flex items-center gap-3 mb-4">
            <UploadCloud className="h-8 w-8 text-amber-300" />
            <div>
              <h2 className="text-2xl font-semibold text-white">Agreement required</h2>
              <p className="text-sm text-white/70">
                Your trade line subscription is active but requires a signed credit agreement to activate.
              </p>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3 mb-6">
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
              <p className="text-xs uppercase tracking-widest text-white/40">Tier</p>
              <p className="mt-2 text-xl font-semibold text-white">${subscription.tier?.toUpperCase()}</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
              <p className="text-xs uppercase tracking-widest text-white/40">Credit Limit</p>
              <p className="mt-2 text-xl font-semibold text-white">
                {typeof subscription.creditLimit === "number"
                  ? subscription.creditLimit.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 })
                  : "Pending"}
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
              <p className="text-xs uppercase tracking-widest text-white/40">Status</p>
              <p className="mt-2 text-xl font-semibold text-amber-200">Pending Agreement</p>
            </div>
          </div>

          {uploadComplete ? (
            <div className="rounded-2xl border border-emerald-400/20 bg-emerald-400/10 px-4 py-4 text-sm text-emerald-100">
              Agreement received. Your trade line will be activated within 1 business day.
            </div>
          ) : (
            <label className="flex cursor-pointer flex-col items-center justify-center rounded-3xl border border-dashed border-white/20 bg-white/[0.03] px-6 py-10 text-center hover:border-[#36EAEA]/50 transition-colors">
              <input type="file" accept="application/pdf" className="hidden" onChange={handleUpload} disabled={uploading} />
              {uploading ? <Loader2 className="mb-3 h-8 w-8 animate-spin text-[#36EAEA]" /> : <UploadCloud className="mb-3 h-8 w-8 text-[#36EAEA]" />}
              <span className="text-white font-medium">Upload signed credit agreement (PDF)</span>
              <span className="mt-2 text-sm text-white/55">Max 10MB. Admin review is required before activation.</span>
            </label>
          )}
        </div>
      )}
    </div>
  );
}
