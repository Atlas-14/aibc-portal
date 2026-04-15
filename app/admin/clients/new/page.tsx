"use client";

import { FormEvent, useState } from "react";
import { ArrowLeft, Loader2, UserPlus } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function NewClientPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    businessName: "",
    plan: "essentials",
    notes: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/admin/clients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Unable to create client");
      }

      const clientId = data.client?.id;
      router.push(clientId ? `/admin/clients/${clientId}` : "/admin/clients");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to create client");
      setSubmitting(false);
    }
  };

  return (
    <div className="p-6 lg:p-10 max-w-3xl">
      <Link href="/admin/clients" className="inline-flex items-center gap-2 text-sm text-white/50 hover:text-white/80 transition-colors mb-6">
        <ArrowLeft className="h-4 w-4" />
        Back to clients
      </Link>

      <div className="mb-8">
        <p className="text-red-400 text-xs font-semibold uppercase tracking-widest mb-1">Admin</p>
        <h1 className="text-3xl font-bold text-white">Add Client</h1>
        <p className="text-white/60 text-sm mt-1">Create a new client record in Supabase.</p>
      </div>

      <form onSubmit={handleSubmit} className="glass-card rounded-3xl border border-white/10 p-6 md:p-8 space-y-5">
        <div className="grid md:grid-cols-2 gap-5">
          <div>
            <label className="block text-sm text-white/70 mb-2">Full name *</label>
            <input
              required
              value={form.fullName}
              onChange={(e) => setForm({ ...form, fullName: e.target.value })}
              className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-teal-400/40"
              placeholder="Jane Smith"
            />
          </div>

          <div>
            <label className="block text-sm text-white/70 mb-2">Email *</label>
            <input
              required
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-teal-400/40"
              placeholder="jane@company.com"
            />
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-5">
          <div>
            <label className="block text-sm text-white/70 mb-2">Business name</label>
            <input
              value={form.businessName}
              onChange={(e) => setForm({ ...form, businessName: e.target.value })}
              className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-teal-400/40"
              placeholder="Company LLC"
            />
          </div>

          <div>
            <label className="block text-sm text-white/70 mb-2">Plan</label>
            <select
              value={form.plan}
              onChange={(e) => setForm({ ...form, plan: e.target.value })}
              className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white focus:outline-none focus:border-teal-400/40"
            >
              <option value="essentials">Essentials</option>
              <option value="plus">Plus</option>
              <option value="pro">Pro</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm text-white/70 mb-2">Notes</label>
          <textarea
            rows={5}
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
            className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-teal-400/40 resize-none"
            placeholder="Optional onboarding notes, follow-ups, or internal context"
          />
        </div>

        {error && (
          <div className="rounded-2xl border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm text-red-200">
            {error}
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#36EAEA] px-5 py-3 text-sm font-semibold text-[#040d1a] hover:bg-[#2fd4d4] transition-all disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserPlus className="h-4 w-4" />}
            {submitting ? "Creating client..." : "Create client"}
          </button>

          <Link href="/admin/clients" className="inline-flex items-center justify-center rounded-2xl border border-white/10 px-5 py-3 text-sm font-semibold text-white/70 hover:bg-white/5 hover:text-white transition-all">
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
