"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  CalendarRange,
  CheckCircle,
  Clock,
  Download,
  Eye,
  RefreshCw,
  XCircle,
} from "lucide-react";
import {
  AdminPageHeader,
  BackLink,
  EmptyState,
  SortableHeader,
  showAdminToast,
} from "@/components/admin/AdminPrimitives";

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

type SortKey = "clientName" | "category" | "submittedAt" | "status";

const STATUS_CONFIG = {
  pending_review: { label: "Pending Review", tone: "border-amber-400/20 bg-amber-400/12 text-amber-200", icon: Clock },
  approved: { label: "Approved", tone: "border-emerald-400/20 bg-emerald-400/12 text-emerald-200", icon: CheckCircle },
  rejected: { label: "Rejected", tone: "border-red-400/20 bg-red-400/12 text-red-200", icon: XCircle },
  needs_resubmission: { label: "Needs Resubmission", tone: "border-violet-400/20 bg-violet-400/12 text-violet-200", icon: RefreshCw },
};

export default function AdminSubmissions() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("submittedAt");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [selected, setSelected] = useState<Submission | null>(null);
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/admin/submissions")
      .then((response) => response.json())
      .then((data) => {
        setSubmissions(data.submissions ?? []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const setSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDirection((current) => (current === "asc" ? "desc" : "asc"));
      return;
    }
    setSortKey(key);
    setSortDirection(key === "submittedAt" ? "desc" : "asc");
  };

  const filtered = useMemo(() => {
    const from = dateFrom ? new Date(`${dateFrom}T00:00:00`).getTime() : null;
    const to = dateTo ? new Date(`${dateTo}T23:59:59`).getTime() : null;

    return submissions
      .filter((submission) => {
        const matchesStatus = filter === "all" || submission.status === filter;
        const submittedAt = new Date(submission.submittedAt).getTime();
        const matchesFrom = from === null || submittedAt >= from;
        const matchesTo = to === null || submittedAt <= to;
        return matchesStatus && matchesFrom && matchesTo;
      })
      .sort((a, b) => {
        const modifier = sortDirection === "asc" ? 1 : -1;
        const left = sortKey === "submittedAt" ? new Date(a.submittedAt).getTime() : String(a[sortKey]).toLowerCase();
        const right = sortKey === "submittedAt" ? new Date(b.submittedAt).getTime() : String(b[sortKey]).toLowerCase();
        if (left < right) return -1 * modifier;
        if (left > right) return 1 * modifier;
        return 0;
      });
  }, [submissions, filter, dateFrom, dateTo, sortKey, sortDirection]);

  const updateStatus = async (id: string, status: Submission["status"]) => {
    setSaving(true);
    const response = await fetch(`/api/admin/submissions/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status, adminNotes: notes }),
    });
    if (response.ok) {
      setSubmissions((current) =>
        current.map((submission) =>
          submission.id === id
            ? { ...submission, status, adminNotes: notes, reviewedAt: new Date().toISOString() }
            : submission,
        ),
      );
      showAdminToast({ type: "success", title: "Submission updated", message: `Marked as ${status.replaceAll("_", " ")}.` });
      setSelected(null);
      setNotes("");
    } else {
      showAdminToast({ type: "error", title: "Update failed", message: "Please try again." });
    }
    setSaving(false);
  };

  const downloadAll = () => {
    if (!filtered.length) return;
    filtered.forEach((submission, index) => {
      window.setTimeout(() => window.open(`/api/admin/submissions/${submission.id}/download`, "_blank"), index * 120);
    });
    showAdminToast({ type: "success", title: "Downloads started", message: `Opening ${filtered.length} submission files.` });
  };

  return (
    <div className="mx-auto max-w-7xl p-6 lg:p-10">
      <div className="mb-5">
        <BackLink href="/admin" label="Back" />
      </div>

      <AdminPageHeader
        title="Client Submissions"
        description="Review compliance packets, preview supporting documents, and move items through approval faster."
        breadcrumbs={[{ label: "Admin", href: "/admin" }, { label: "Submissions" }]}
        action={
          <button onClick={downloadAll} className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/8">
            <Download className="h-4 w-4" />
            Download All
          </button>
        }
      />

      <div className="mb-6 flex flex-col gap-4 rounded-[2rem] border border-white/10 bg-white/[0.04] p-4 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex flex-wrap gap-2">
          {["all", "pending_review", "approved", "rejected", "needs_resubmission"].map((value) => (
            <button
              key={value}
              onClick={() => setFilter(value)}
              className={`rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-[0.25em] transition ${
                filter === value
                  ? "border-[#36EAEA]/25 bg-[#36EAEA]/10 text-[#9af7f7]"
                  : "border-white/10 bg-white/5 text-white/45 hover:text-white"
              }`}
            >
              {value === "all" ? "All" : value.replaceAll("_", " ")}
            </button>
          ))}
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <label className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/60">
            <CalendarRange className="h-4 w-4 text-white/30" />
            <input type="date" value={dateFrom} onChange={(event) => setDateFrom(event.target.value)} className="bg-transparent text-white focus:outline-none" />
          </label>
          <label className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/60">
            <input type="date" value={dateTo} onChange={(event) => setDateTo(event.target.value)} className="bg-transparent text-white focus:outline-none" />
          </label>
        </div>
      </div>

      <div className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-3">
        <div className="hidden grid-cols-[1.2fr_0.7fr_0.9fr_0.8fr_96px] items-center gap-4 px-4 py-3 lg:grid">
          <SortableHeader label="Client" active={sortKey === "clientName"} direction={sortDirection} onClick={() => setSort("clientName")} />
          <SortableHeader label="Category" active={sortKey === "category"} direction={sortDirection} onClick={() => setSort("category")} />
          <SortableHeader label="Submitted" active={sortKey === "submittedAt"} direction={sortDirection} onClick={() => setSort("submittedAt")} />
          <SortableHeader label="Status" active={sortKey === "status"} direction={sortDirection} onClick={() => setSort("status")} />
          <div />
        </div>

        {loading ? (
          <div className="space-y-3 p-2">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="h-24 animate-pulse rounded-[1.5rem] border border-white/8 bg-white/5" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState title="No submissions match" description="Try a different date range or status filter. Once clients upload files, they will show up here with review state and preview access." icon={<CheckCircle className="h-6 w-6" />} />
        ) : (
          <div className="space-y-3 p-2">
            {filtered.map((submission) => {
              const config = STATUS_CONFIG[submission.status];
              const StatusIcon = config.icon;
              return (
                <div key={submission.id} className="grid gap-4 rounded-[1.75rem] border border-white/8 bg-white/[0.035] p-4 transition hover:border-[#36EAEA]/20 hover:bg-white/[0.05] lg:grid-cols-[1.2fr_0.7fr_0.9fr_0.8fr_96px] lg:items-center">
                  <div>
                    <p className="text-sm font-semibold text-white">{submission.clientName}</p>
                    <p className="mt-1 text-sm text-[#9af7f7]">{submission.fileName}</p>
                    <p className="mt-1 text-xs text-white/40">{submission.businessName || "No business name"} • {(submission.fileSize / 1024).toFixed(0)} KB</p>
                  </div>
                  <div className="text-sm text-white/60">{submission.category}</div>
                  <div className="text-sm text-white/60">{new Date(submission.submittedAt).toLocaleDateString()}</div>
                  <div>
                    <span className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold ${config.tone}`}>
                      <StatusIcon className="h-3.5 w-3.5" />
                      {config.label}
                    </span>
                  </div>
                  <div className="flex items-center justify-end gap-2">
                    <button onClick={() => { setSelected(submission); setNotes(submission.adminNotes ?? ""); }} className="rounded-xl border border-white/10 bg-white/5 p-2 text-white/70 transition hover:bg-white/8 hover:text-white">
                      <Eye className="h-4 w-4" />
                    </button>
                    <a href={`/api/admin/submissions/${submission.id}/download`} className="rounded-xl border border-white/10 bg-white/5 p-2 text-white/70 transition hover:bg-white/8 hover:text-white">
                      <Download className="h-4 w-4" />
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {selected ? (
        <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/70 p-4 backdrop-blur-md">
          <div className="grid h-[85vh] w-full max-w-6xl gap-4 overflow-hidden rounded-[2rem] border border-white/10 bg-[#081322]/95 p-4 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="overflow-hidden rounded-[1.5rem] border border-white/8 bg-black/20">
              {selected.fileType?.startsWith("image/") ? (
                <img src={`/api/admin/submissions/${selected.id}/download`} alt={selected.fileName} className="h-full w-full object-contain" />
              ) : (
                <iframe title={selected.fileName} src={`/api/admin/submissions/${selected.id}/download`} className="h-full min-h-[32rem] w-full" />
              )}
            </div>
            <div className="overflow-y-auto rounded-[1.5rem] border border-white/8 bg-white/[0.04] p-6">
              <div className="mb-5 flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-white/35">Review submission</p>
                  <h2 className="mt-2 text-2xl font-semibold text-white">{selected.fileName}</h2>
                  <p className="mt-2 text-sm text-white/55">{selected.clientName} • {selected.category}</p>
                </div>
                <button onClick={() => setSelected(null)} className="rounded-xl border border-white/10 px-3 py-2 text-sm text-white/60 transition hover:bg-white/5 hover:text-white">Close</button>
              </div>
              <div className="space-y-3 text-sm text-white/60">
                <p>Submitted {new Date(selected.submittedAt).toLocaleString()}</p>
                {selected.reviewedAt ? <p>Last reviewed {new Date(selected.reviewedAt).toLocaleString()}</p> : null}
              </div>
              <label className="mt-6 block text-sm text-white/60">Admin notes</label>
              <textarea value={notes} onChange={(event) => setNotes(event.target.value)} rows={6} className="mt-2 w-full rounded-[1.5rem] border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/25 focus:border-[#36EAEA]/40 focus:outline-none" placeholder="Capture review context, missing items, or next steps..." />
              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                <button onClick={() => updateStatus(selected.id, "approved")} disabled={saving} className="rounded-2xl bg-emerald-400/15 px-4 py-3 text-sm font-semibold text-emerald-100 transition hover:bg-emerald-400/25 disabled:opacity-50">Approve</button>
                <button onClick={() => updateStatus(selected.id, "rejected")} disabled={saving} className="rounded-2xl bg-red-400/15 px-4 py-3 text-sm font-semibold text-red-100 transition hover:bg-red-400/25 disabled:opacity-50">Reject</button>
                <button onClick={() => updateStatus(selected.id, "needs_resubmission")} disabled={saving} className="rounded-2xl bg-violet-400/15 px-4 py-3 text-sm font-semibold text-violet-100 transition hover:bg-violet-400/25 disabled:opacity-50">Needs resubmission</button>
                <Link href={`/admin/clients/${selected.clientId}`} className="rounded-2xl border border-white/10 px-4 py-3 text-center text-sm font-semibold text-white/70 transition hover:bg-white/5 hover:text-white">Open client</Link>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
