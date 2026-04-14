"use client";
import { useEffect, useState, use } from "react";
import { FileText, UploadCloud, ChevronLeft, Edit2, Check, X, Package, CreditCard, Mail } from "lucide-react";
import Link from "next/link";

type Client = {
  id: string;
  email: string;
  fullName: string;
  businessName: string;
  plan: string;
  status: string;
  creditAddon: boolean;
  unitOwner: boolean;
  unitNumber: string | null;
  mailboxId: string | null;
  notes: string | null;
  createdAt: string;
};

type AdminDoc = {
  id: string;
  fileName: string;
  category: string;
  fileSize: number;
  notes: string | null;
  uploadedAt: string;
};

type Submission = {
  id: string;
  fileName: string;
  category: string;
  status: string;
  submittedAt: string;
  adminNotes: string | null;
};

const PLAN_LABELS: Record<string, string> = {
  essentials: "Business Essentials — $59/mo",
  plus: "Business Plus — $99/mo",
  pro: "Business Pro — $149/mo",
};

export default function ClientDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [client, setClient] = useState<Client | null>(null);
  const [docs, setDocs] = useState<AdminDoc[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editData, setEditData] = useState<Partial<Client>>({});
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  // Upload state
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadCategory, setUploadCategory] = useState("General");
  const [uploadNotes, setUploadNotes] = useState("");
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch(`/api/admin/clients/${id}`).then(r => r.json()),
      fetch(`/api/admin/clients/${id}/documents`).then(r => r.json()),
      fetch(`/api/admin/clients/${id}/submissions`).then(r => r.json()),
    ]).then(([clientData, docsData, subsData]) => {
      setClient(clientData.client ?? null);
      setDocs(docsData.documents ?? []);
      setSubmissions(subsData.submissions ?? []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(t);
  }, [toast]);

  const startEdit = () => {
    setEditData({ ...client });
    setEditing(true);
  };

  const saveEdit = async () => {
    setSaving(true);
    const res = await fetch(`/api/admin/clients/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editData),
    });
    if (res.ok) {
      setClient(prev => ({ ...prev!, ...editData }));
      setEditing(false);
      setToast("Client updated");
    }
    setSaving(false);
  };

  const handleUpload = async () => {
    if (!uploadFile) return;
    setUploading(true);
    const fd = new FormData();
    fd.append("file", uploadFile);
    fd.append("clientId", id);
    fd.append("category", uploadCategory);
    fd.append("notes", uploadNotes);
    const res = await fetch("/api/admin/documents/upload", { method: "POST", body: fd });
    if (res.ok) {
      const data = await res.json();
      setDocs(prev => [data.document, ...prev]);
      setToast("Document uploaded to client portal");
      setUploadFile(null); setUploadNotes("");
    }
    setUploading(false);
  };

  if (loading) return <div className="p-10"><div className="h-8 w-64 rounded-xl bg-white/5 animate-pulse" /></div>;
  if (!client) return <div className="p-10 text-white/60">Client not found</div>;

  return (
    <div className="p-6 lg:p-10 max-w-5xl">
      {toast && (
        <div className="fixed top-6 right-6 z-50 bg-teal-400/20 border border-teal-400/30 text-teal-300 text-sm px-5 py-3 rounded-2xl shadow-xl">
          {toast}
        </div>
      )}

      <div className="mb-6">
        <Link href="/admin/clients" className="inline-flex items-center gap-2 text-white/40 hover:text-white/70 text-sm transition-colors mb-4">
          <ChevronLeft className="h-4 w-4" /> Back to Clients
        </Link>
        <div className="flex items-start justify-between">
          <div>
            <p className="text-red-400 text-xs font-semibold uppercase tracking-widest mb-1">Client Profile</p>
            <h1 className="text-3xl font-bold text-white">{client.fullName}</h1>
            <p className="text-white/60 text-sm mt-1">{client.businessName} · {client.email}</p>
          </div>
          {!editing ? (
            <button onClick={startEdit} className="flex items-center gap-2 px-4 py-2 rounded-xl border border-white/10 text-white/60 hover:text-white hover:bg-white/5 text-sm transition-all">
              <Edit2 className="h-4 w-4" /> Edit
            </button>
          ) : (
            <div className="flex gap-2">
              <button onClick={saveEdit} disabled={saving} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-teal-400/20 border border-teal-400/30 text-teal-300 text-sm font-semibold hover:bg-teal-400/30 transition-all">
                <Check className="h-4 w-4" /> {saving ? "Saving..." : "Save"}
              </button>
              <button onClick={() => setEditing(false)} className="flex items-center gap-2 px-4 py-2 rounded-xl border border-white/10 text-white/60 text-sm hover:bg-white/5 transition-all">
                <X className="h-4 w-4" /> Cancel
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6 mb-8">
        {/* Client Info */}
        <div className="lg:col-span-2 glass-card rounded-2xl border-white/10 p-6">
          <p className="text-xs uppercase tracking-widest text-white/40 mb-4">Account Details</p>
          {editing ? (
            <div className="space-y-4">
              {[
                { label: "Full Name", key: "fullName", type: "text" },
                { label: "Business Name", key: "businessName", type: "text" },
                { label: "Email", key: "email", type: "email" },
                { label: "Mailbox ID", key: "mailboxId", type: "text" },
              ].map(({ label, key, type }) => (
                <div key={key}>
                  <label className="text-xs text-white/50 block mb-1">{label}</label>
                  <input
                    type={type}
                    value={(editData as Record<string, string>)[key] ?? ""}
                    onChange={(e) => setEditData(prev => ({ ...prev, [key]: e.target.value }))}
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:outline-none focus:border-teal-400/40"
                  />
                </div>
              ))}
              <div>
                <label className="text-xs text-white/50 block mb-1">Plan</label>
                <select
                  value={editData.plan ?? client.plan}
                  onChange={(e) => setEditData(prev => ({ ...prev, plan: e.target.value }))}
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:outline-none"
                >
                  <option value="essentials">Business Essentials — $59/mo</option>
                  <option value="plus">Business Plus — $99/mo</option>
                  <option value="pro">Business Pro — $149/mo</option>
                </select>
              </div>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 text-sm text-white/60 cursor-pointer">
                  <input type="checkbox" checked={editData.creditAddon ?? client.creditAddon}
                    onChange={(e) => setEditData(prev => ({ ...prev, creditAddon: e.target.checked }))}
                    className="rounded" />
                  Credit Reporting Add-on
                </label>
                <label className="flex items-center gap-2 text-sm text-white/60 cursor-pointer">
                  <input type="checkbox" checked={editData.unitOwner ?? client.unitOwner}
                    onChange={(e) => setEditData(prev => ({ ...prev, unitOwner: e.target.checked }))}
                    className="rounded" />
                  Unit Owner
                </label>
              </div>
              <div>
                <label className="text-xs text-white/50 block mb-1">Status</label>
                <select
                  value={editData.status ?? client.status}
                  onChange={(e) => setEditData(prev => ({ ...prev, status: e.target.value }))}
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:outline-none"
                >
                  <option value="active">Active</option>
                  <option value="pending">Pending</option>
                  <option value="suspended">Suspended</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-white/50 block mb-1">Internal Notes</label>
                <textarea rows={2} value={editData.notes ?? ""}
                  onChange={(e) => setEditData(prev => ({ ...prev, notes: e.target.value }))}
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:outline-none"
                />
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {[
                { label: "Email", value: client.email },
                { label: "Plan", value: PLAN_LABELS[client.plan] ?? client.plan },
                { label: "Status", value: client.status },
                { label: "Mailbox ID", value: client.mailboxId ?? "Not set" },
                { label: "Joined", value: new Date(client.createdAt).toLocaleDateString() },
                ...(client.notes ? [{ label: "Notes", value: client.notes }] : []),
              ].map(({ label, value }) => (
                <div key={label} className="flex items-start justify-between py-2 border-b border-white/5">
                  <span className="text-white/50 text-sm">{label}</span>
                  <span className="text-white text-sm text-right max-w-xs">{value}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Status cards */}
        <div className="space-y-3">
          <div className={`glass-card rounded-2xl border p-4 ${client.status === "active" ? "border-emerald-400/30" : "border-amber-400/30"}`}>
            <Check className={`h-5 w-5 mb-2 ${client.status === "active" ? "text-emerald-400" : "text-amber-400"}`} />
            <p className="text-white font-semibold text-sm capitalize">{client.status}</p>
            <p className="text-white/50 text-xs">Account status</p>
          </div>
          <div className={`glass-card rounded-2xl border p-4 ${client.creditAddon ? "border-teal-400/30" : "border-white/10"}`}>
            <CreditCard className={`h-5 w-5 mb-2 ${client.creditAddon ? "text-teal-400" : "text-white/30"}`} />
            <p className={`font-semibold text-sm ${client.creditAddon ? "text-teal-300" : "text-white/40"}`}>
              {client.creditAddon ? "Credit Reporting Active" : "No Credit Add-on"}
            </p>
            <p className="text-white/50 text-xs">{client.creditAddon ? "$249/mo" : "Upsell opportunity"}</p>
          </div>
          {client.unitOwner && (
            <div className="glass-card rounded-2xl border border-amber-400/30 p-4">
              <Package className="h-5 w-5 text-amber-400 mb-2" />
              <p className="text-amber-300 font-semibold text-sm">Unit Owner</p>
              <p className="text-white/50 text-xs">Unit {client.unitNumber ?? "—"}</p>
            </div>
          )}
          <div className="glass-card rounded-2xl border border-white/10 p-4">
            <FileText className="h-5 w-5 text-white/30 mb-2" />
            <p className="text-white font-semibold text-sm">{docs.length} documents</p>
            <p className="text-white/50 text-xs">{submissions.length} submissions</p>
          </div>
        </div>
      </div>

      {/* Upload to this client */}
      <div className="glass-card rounded-2xl border-white/10 p-6 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <UploadCloud className="h-5 w-5 text-teal-400" />
          <p className="text-white font-semibold">Upload Document to This Client</p>
        </div>
        <div className="grid md:grid-cols-3 gap-4">
          <div>
            <label className="text-xs text-white/50 uppercase tracking-wider block mb-2">Category</label>
            <select value={uploadCategory} onChange={(e) => setUploadCategory(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:outline-none">
              {["Compliance", "Address", "Banking", "Credit", "Contract", "General"].map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div className="md:col-span-2">
            <label className="text-xs text-white/50 uppercase tracking-wider block mb-2">Notes for client</label>
            <input type="text" value={uploadNotes} onChange={(e) => setUploadNotes(e.target.value)}
              placeholder="e.g. Please review and sign"
              className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder-white/30 focus:outline-none" />
          </div>
          <div className="md:col-span-2">
            <label className="text-xs text-white/50 uppercase tracking-wider block mb-2">File</label>
            <input type="file" accept=".pdf,.png,.jpg,.jpeg,.webp"
              onChange={(e) => setUploadFile(e.target.files?.[0] ?? null)}
              className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/70 file:mr-3 file:rounded-lg file:border-0 file:bg-teal-400/20 file:text-teal-300 file:text-xs file:px-3 file:py-1 focus:outline-none" />
          </div>
          <div className="flex items-end">
            <button onClick={handleUpload} disabled={!uploadFile || uploading}
              className="w-full py-2.5 rounded-xl bg-[#36EAEA] text-[#040d1a] font-semibold text-sm hover:bg-[#2fd4d4] transition-all disabled:opacity-40">
              {uploading ? "Uploading..." : "Upload"}
            </button>
          </div>
        </div>
      </div>

      {/* Documents from AIBC */}
      <div className="glass-card rounded-2xl border-white/10 p-6 mb-6">
        <p className="text-xs uppercase tracking-widest text-teal-400/70 mb-1">From AIBC</p>
        <h2 className="text-white text-lg font-semibold mb-4">Documents in Client Portal</h2>
        {docs.length === 0 ? (
          <p className="text-white/40 text-sm py-4">No documents uploaded yet</p>
        ) : (
          <div className="space-y-2">
            {docs.map(doc => (
              <div key={doc.id} className="flex items-center justify-between p-3 rounded-xl bg-white/5">
                <div className="flex items-center gap-3">
                  <FileText className="h-4 w-4 text-teal-400 flex-shrink-0" />
                  <div>
                    <p className="text-white text-sm font-medium">{doc.fileName}</p>
                    <p className="text-white/40 text-xs">{doc.category} · {(doc.fileSize / 1024).toFixed(0)} KB · {new Date(doc.uploadedAt).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Client Submissions */}
      <div className="glass-card rounded-2xl border-white/10 p-6">
        <p className="text-xs uppercase tracking-widest text-amber-400/70 mb-1">From Client</p>
        <h2 className="text-white text-lg font-semibold mb-4">Client Submissions</h2>
        {submissions.length === 0 ? (
          <p className="text-white/40 text-sm py-4">No submissions from this client yet</p>
        ) : (
          <div className="space-y-2">
            {submissions.map(sub => (
              <div key={sub.id} className="flex items-center justify-between p-3 rounded-xl bg-white/5">
                <div>
                  <p className="text-white text-sm font-medium">{sub.fileName}</p>
                  <p className="text-white/40 text-xs">{sub.category} · {new Date(sub.submittedAt).toLocaleDateString()}</p>
                  {sub.adminNotes && <p className="text-white/50 text-xs italic">{sub.adminNotes}</p>}
                </div>
                <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${
                  sub.status === "approved" ? "bg-emerald-400/20 text-emerald-300" :
                  sub.status === "pending_review" ? "bg-amber-400/20 text-amber-300" :
                  "bg-red-400/20 text-red-300"
                }`}>
                  {sub.status.replace("_", " ")}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
