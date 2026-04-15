"use client";

import { useEffect, useMemo, useState } from "react";
import { CreditCard, PencilLine, Save, X } from "lucide-react";

type Score = {
  id: string;
  client_id: string;
  dnb_paydex: number | null;
  dnb_score_date: string | null;
  experian_score: number | null;
  experian_score_date: string | null;
  equifax_score: number | null;
  equifax_score_date: string | null;
  notes: string | null;
  updated_by: string | null;
  updated_at: string;
};

type CreditClient = {
  id: string;
  email: string;
  fullName: string;
  businessName: string | null;
  creditAddon: boolean;
  score: Score | null;
};

type EditState = {
  dnbPaydex: string;
  dnbScoreDate: string;
  experianScore: string;
  experianScoreDate: string;
  equifaxScore: string;
  equifaxScoreDate: string;
  notes: string;
};

const emptyForm: EditState = {
  dnbPaydex: "",
  dnbScoreDate: "",
  experianScore: "",
  experianScoreDate: "",
  equifaxScore: "",
  equifaxScoreDate: "",
  notes: "",
};

const toFormState = (score: Score | null): EditState => ({
  dnbPaydex: score?.dnb_paydex?.toString() ?? "",
  dnbScoreDate: score?.dnb_score_date ?? "",
  experianScore: score?.experian_score?.toString() ?? "",
  experianScoreDate: score?.experian_score_date ?? "",
  equifaxScore: score?.equifax_score?.toString() ?? "",
  equifaxScoreDate: score?.equifax_score_date ?? "",
  notes: score?.notes ?? "",
});

const parseNumber = (value: string) => (value.trim() === "" ? null : Number(value));
const formatDate = (value: string | null) => (value ? new Date(value).toLocaleDateString() : "—");

export default function AdminCreditPage() {
  const [clients, setClients] = useState<CreditClient[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<EditState>(emptyForm);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/credit-scores");
      const data = await res.json();
      setClients(data.clients ?? []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (!toast) return;
    const timeout = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(timeout);
  }, [toast]);

  const sortedClients = useMemo(
    () => [...clients].sort((a, b) => a.fullName.localeCompare(b.fullName)),
    [clients]
  );

  const startEdit = (client: CreditClient) => {
    setEditingId(client.id);
    setForm(toFormState(client.score));
  };

  const cancelEdit = () => {
    setEditingId(null);
    setForm(emptyForm);
  };

  const save = async (clientId: string) => {
    setSavingId(clientId);
    const res = await fetch(`/api/admin/credit-scores/${clientId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        dnbPaydex: parseNumber(form.dnbPaydex),
        dnbScoreDate: form.dnbScoreDate || null,
        experianScore: parseNumber(form.experianScore),
        experianScoreDate: form.experianScoreDate || null,
        equifaxScore: parseNumber(form.equifaxScore),
        equifaxScoreDate: form.equifaxScoreDate || null,
        notes: form.notes,
      }),
    });

    if (res.ok) {
      const data = await res.json();
      setClients((prev) => prev.map((client) => (
        client.id === clientId ? { ...client, score: data.score } : client
      )));
      setToast("Credit scores updated");
      cancelEdit();
    } else {
      setToast("Unable to save credit scores");
    }

    setSavingId(null);
  };

  return (
    <div className="p-6 lg:p-10 max-w-6xl">
      {toast && (
        <div className="fixed top-6 right-6 z-50 bg-teal-400/20 border border-teal-400/30 text-teal-300 text-sm px-5 py-3 rounded-2xl shadow-xl">
          {toast}
        </div>
      )}

      <div className="mb-8">
        <p className="text-red-400 text-xs font-semibold uppercase tracking-widest mb-1">Admin</p>
        <h1 className="text-3xl font-bold text-white">Credit Scores</h1>
        <p className="text-white/60 text-sm mt-1">Track business credit reporting for clients with the credit add-on enabled.</p>
      </div>

      <div className="glass-card rounded-3xl border-white/10 p-6">
        {loading ? (
          <div className="space-y-3">{[1, 2, 3].map((i) => <div key={i} className="h-28 rounded-2xl bg-white/5 animate-pulse" />)}</div>
        ) : sortedClients.length === 0 ? (
          <div className="text-center py-16">
            <CreditCard className="h-10 w-10 text-white/20 mx-auto mb-3" />
            <p className="text-white/50">No clients currently have the credit add-on enabled.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {sortedClients.map((client) => {
              const score = client.score;
              const isEditing = editingId === client.id;
              const isSaving = savingId === client.id;

              return (
                <div key={client.id} className="rounded-3xl border border-white/10 bg-white/5 p-5">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <p className="text-white font-semibold text-lg">{client.fullName}</p>
                        <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-400/20 text-emerald-300 font-semibold">Credit Add-on</span>
                      </div>
                      <p className="text-white/60 text-sm">{client.businessName || "No business name"}</p>
                      <p className="text-white/40 text-xs mt-1">{client.email}</p>
                    </div>

                    {!isEditing ? (
                      <button
                        onClick={() => startEdit(client)}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-white/10 text-white/70 hover:text-white hover:bg-white/5 transition-all text-sm"
                      >
                        <PencilLine className="h-4 w-4" />
                        Edit
                      </button>
                    ) : (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => save(client.id)}
                          disabled={isSaving}
                          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#36EAEA] text-[#040d1a] font-semibold text-sm disabled:opacity-40"
                        >
                          <Save className="h-4 w-4" />
                          {isSaving ? "Saving..." : "Save"}
                        </button>
                        <button
                          onClick={cancelEdit}
                          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-white/10 text-white/60 hover:bg-white/5 text-sm"
                        >
                          <X className="h-4 w-4" />
                          Cancel
                        </button>
                      </div>
                    )}
                  </div>

                  {!isEditing ? (
                    <div className="grid md:grid-cols-4 gap-3 mt-5">
                      <div className="rounded-2xl bg-black/20 border border-white/6 p-4">
                        <p className="text-white/40 text-xs uppercase tracking-wider mb-1">D&B Paydex</p>
                        <p className="text-white text-xl font-semibold">{score?.dnb_paydex ?? "—"}</p>
                        <p className="text-white/40 text-xs mt-1">{formatDate(score?.dnb_score_date ?? null)}</p>
                      </div>
                      <div className="rounded-2xl bg-black/20 border border-white/6 p-4">
                        <p className="text-white/40 text-xs uppercase tracking-wider mb-1">Experian</p>
                        <p className="text-white text-xl font-semibold">{score?.experian_score ?? "—"}</p>
                        <p className="text-white/40 text-xs mt-1">{formatDate(score?.experian_score_date ?? null)}</p>
                      </div>
                      <div className="rounded-2xl bg-black/20 border border-white/6 p-4">
                        <p className="text-white/40 text-xs uppercase tracking-wider mb-1">Equifax</p>
                        <p className="text-white text-xl font-semibold">{score?.equifax_score ?? "—"}</p>
                        <p className="text-white/40 text-xs mt-1">{formatDate(score?.equifax_score_date ?? null)}</p>
                      </div>
                      <div className="rounded-2xl bg-black/20 border border-white/6 p-4">
                        <p className="text-white/40 text-xs uppercase tracking-wider mb-1">Last Updated</p>
                        <p className="text-white text-sm font-semibold">{score?.updated_at ? new Date(score.updated_at).toLocaleString() : "No score yet"}</p>
                        <p className="text-white/40 text-xs mt-1">{score?.updated_by ?? "—"}</p>
                      </div>
                      <div className="md:col-span-4 rounded-2xl bg-black/20 border border-white/6 p-4">
                        <p className="text-white/40 text-xs uppercase tracking-wider mb-1">Notes</p>
                        <p className="text-white/70 text-sm whitespace-pre-wrap">{score?.notes?.trim() ? score.notes : "No notes yet."}</p>
                      </div>
                    </div>
                  ) : (
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mt-5">
                      <div>
                        <label className="text-xs text-white/50 uppercase tracking-wider block mb-2">D&B Paydex</label>
                        <input
                          type="number"
                          value={form.dnbPaydex}
                          onChange={(e) => setForm((prev) => ({ ...prev, dnbPaydex: e.target.value }))}
                          className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-white/50 uppercase tracking-wider block mb-2">D&B Date</label>
                        <input
                          type="date"
                          value={form.dnbScoreDate}
                          onChange={(e) => setForm((prev) => ({ ...prev, dnbScoreDate: e.target.value }))}
                          className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-white/50 uppercase tracking-wider block mb-2">Experian Score</label>
                        <input
                          type="number"
                          value={form.experianScore}
                          onChange={(e) => setForm((prev) => ({ ...prev, experianScore: e.target.value }))}
                          className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-white/50 uppercase tracking-wider block mb-2">Experian Date</label>
                        <input
                          type="date"
                          value={form.experianScoreDate}
                          onChange={(e) => setForm((prev) => ({ ...prev, experianScoreDate: e.target.value }))}
                          className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-white/50 uppercase tracking-wider block mb-2">Equifax Score</label>
                        <input
                          type="number"
                          value={form.equifaxScore}
                          onChange={(e) => setForm((prev) => ({ ...prev, equifaxScore: e.target.value }))}
                          className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-white/50 uppercase tracking-wider block mb-2">Equifax Date</label>
                        <input
                          type="date"
                          value={form.equifaxScoreDate}
                          onChange={(e) => setForm((prev) => ({ ...prev, equifaxScoreDate: e.target.value }))}
                          className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white focus:outline-none"
                        />
                      </div>
                      <div className="lg:col-span-2">
                        <label className="text-xs text-white/50 uppercase tracking-wider block mb-2">Notes</label>
                        <textarea
                          rows={4}
                          value={form.notes}
                          onChange={(e) => setForm((prev) => ({ ...prev, notes: e.target.value }))}
                          className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white focus:outline-none"
                        />
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
