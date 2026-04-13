"use client";
import { useEffect, useState } from "react";
import { CheckCircle, XCircle, Clock, RefreshCw, Eye, Download } from "lucide-react";

type Submission = {
  id: string;
  clientId: string;
  clientName: string;
  businessName: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  filePath: string;
  category: string;
  status: "pending_review" | "approved" | "rejected" | "needs_resubmission";
  adminNotes: string | null;
  submittedAt: string;
  reviewedAt: string | null;
};

const STATUS_CONFIG = {
  pending_review: { label: "Pending Review", color: "bg-amber-400/20 text-amber-300 border-amber-400/30", icon: Clock },
  approved: { label: "Approved", color: "bg-emerald-400/20 text-emerald-300 border-emerald-400/30", icon: CheckCircle },
  rejected: { label: "Rejected", color: "bg-red-400/20 text-red-300 border-red-400/30", icon: XCircle },
  needs_resubmission: { label: "Needs Resubmission", color: "bg-violet-400/20 text-violet-300 border-violet-400/30", icon: RefreshCw },
};

export default function AdminSubmissions() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");
  const [selected, setSelected] = useState<Submission | null>(null);
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/submissions")
      .then((r) => r.json())
      .then((data) => { setSubmissions(data.submissions ?? []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(t);
  }, [toast]);

  const filtered = filter === "all" ? submissions : submissions.filter(s => s.status === filter);

  const updateStatus = async (id: string, status: string) => {
    setSaving(true);
    const res = await fetch(`/api/admin/submissions/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status, adminNotes: notes }),
    });
    if (res.ok) {
      setSubmissions(prev => prev.map(s => s.id === id ? { ...s, status: status as Submission["status"], adminNotes: notes } : s));
      setToast(`Status updated to: ${status.replace("_", " ")}`);
      setSelected(null);
      setNotes("");
    }
    setSaving(false);
  };

  return (
    <div className="p-6 lg:p-10 max-w-5xl">
      {toast && (
        <div className="fixed top-6 right-6 z-50 bg-emerald-400/20 border border-emerald-400/30 text-emerald-300 text-sm px-5 py-3 rounded-2xl shadow-xl">
          {toast}
        </div>
      )}

      <div className="mb-8">
        <p className="text-red-400 text-xs font-semibold uppercase tracking-widest mb-1">Admin</p>
        <h1 className="text-3xl font-bold text-white">Client Submissions</h1>
        <p className="text-white/60 text-sm mt-1">Review documents submitted by clients.</p>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {["all", "pending_review", "approved", "rejected", "needs_resubmission"].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all border ${
              filter === f
                ? "bg-red-400/20 border-red-400/30 text-red-300"
                : "border-white/10 text-white/40 hover:text-white/70"
            }`}
          >
            {f === "all" ? "All" : f.replace("_", " ")}
            {f !== "all" && (
              <span className="ml-2 opacity-60">
                {submissions.filter(s => s.status === f).length}
              </span>
            )}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">{[1,2,3,4].map(i => <div key={i} className="h-20 rounded-2xl bg-white/5 animate-pulse" />)}</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20">
          <CheckCircle className="h-10 w-10 text-emerald-400/40 mx-auto mb-3" />
          <p className="text-white/40">No submissions in this category</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((sub) => {
            const cfg = STATUS_CONFIG[sub.status];
            const Icon = cfg.icon;
            return (
              <div key={sub.id} className="glass-card rounded-2xl border-white/10 p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-white font-semibold text-sm">{sub.clientName}</p>
                      <span className="text-white/40 text-xs">·</span>
                      <p className="text-white/60 text-xs">{sub.businessName}</p>
                    </div>
                    <p className="text-teal-300 text-sm font-medium">{sub.fileName}</p>
                    <p className="text-white/40 text-xs mt-1">
                      {sub.category} · {(sub.fileSize / 1024).toFixed(0)} KB · {new Date(sub.submittedAt).toLocaleDateString()}
                    </p>
                    {sub.adminNotes && (
                      <p className="text-white/50 text-xs mt-1 italic">Note: {sub.adminNotes}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border font-semibold ${cfg.color}`}>
                      <Icon className="h-3 w-3" />
                      {cfg.label}
                    </span>
                    <button
                      onClick={() => { setSelected(sub); setNotes(sub.adminNotes ?? ""); }}
                      className="p-2 rounded-xl bg-white/5 hover:bg-white/10 transition-all text-white/60 hover:text-white"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                    <a
                      href={`/api/admin/submissions/${sub.id}/download`}
                      className="p-2 rounded-xl bg-white/5 hover:bg-white/10 transition-all text-white/60 hover:text-white"
                    >
                      <Download className="h-4 w-4" />
                    </a>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Review Modal */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="glass-card rounded-3xl border-white/10 p-8 max-w-lg w-full shadow-2xl">
            <h2 className="text-white text-xl font-bold mb-1">Review Submission</h2>
            <p className="text-white/60 text-sm mb-6">{selected.clientName} · {selected.fileName}</p>

            <div className="mb-4">
              <label className="text-sm text-white/60 block mb-2">Admin Notes (optional)</label>
              <textarea
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add notes for the client or for your records..."
                className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-white/30 focus:border-teal-400/40 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3 mb-4">
              <button
                onClick={() => updateStatus(selected.id, "approved")}
                disabled={saving}
                className="py-3 rounded-2xl bg-emerald-400/20 border border-emerald-400/30 text-emerald-300 text-sm font-semibold hover:bg-emerald-400/30 transition-all disabled:opacity-50"
              >
                ✓ Approve
              </button>
              <button
                onClick={() => updateStatus(selected.id, "rejected")}
                disabled={saving}
                className="py-3 rounded-2xl bg-red-400/20 border border-red-400/30 text-red-300 text-sm font-semibold hover:bg-red-400/30 transition-all disabled:opacity-50"
              >
                ✗ Reject
              </button>
              <button
                onClick={() => updateStatus(selected.id, "needs_resubmission")}
                disabled={saving}
                className="py-3 rounded-2xl bg-violet-400/20 border border-violet-400/30 text-violet-300 text-sm font-semibold hover:bg-violet-400/30 transition-all disabled:opacity-50"
              >
                ↩ Needs Resubmission
              </button>
              <button
                onClick={() => { setSelected(null); setNotes(""); }}
                className="py-3 rounded-2xl border border-white/10 text-white/60 text-sm font-semibold hover:bg-white/5 transition-all"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
