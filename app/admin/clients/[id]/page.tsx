"use client";

import { use, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  FileText,
  Mail,
  Send,
  Trash2,
  UploadCloud,
  UserCog,
} from "lucide-react";
import {
  AdminPageHeader,
  BackLink,
  EmptyState,
  showAdminToast,
} from "@/components/admin/AdminPrimitives";

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
  lastActive?: string;
};

type AdminDoc = {
  id: string;
  fileName: string;
  category: string;
  fileSize: number;
  fileType?: string;
  notes: string | null;
  uploadedAt: string;
  filePath?: string;
};

type Submission = {
  id: string;
  fileName: string;
  category: string;
  status: string;
  submittedAt: string;
  adminNotes: string | null;
  fileType?: string;
  filePath?: string;
};

const PLAN_OPTIONS = ["essentials", "plus", "pro"];
const STATUS_OPTIONS = ["active", "pending", "suspended"];
const editableFields: Array<{ key: keyof Client; label: string; type?: string }> = [
  { key: "fullName", label: "Full name" },
  { key: "businessName", label: "Business name" },
  { key: "email", label: "Email", type: "email" },
  { key: "mailboxId", label: "Mailbox ID" },
  { key: "unitNumber", label: "Unit number" },
  { key: "notes", label: "Internal notes" },
];

export default function ClientDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [client, setClient] = useState<Client | null>(null);
  const [docs, setDocs] = useState<AdminDoc[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [editingField, setEditingField] = useState<keyof Client | null>(null);
  const [draft, setDraft] = useState<Partial<Client>>({});
  const [creatingMailbox, setCreatingMailbox] = useState(false);
  const [showOffboardModal, setShowOffboardModal] = useState(false);
  const [offboarding, setOffboarding] = useState(false);
  const [offboardOptions, setOffboardOptions] = useState({
    cancelStripe: true,
    deactivateMailbox: true,
    deleteClient: true,
  });
  const [offboardNotes, setOffboardNotes] = useState("");
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadCategory, setUploadCategory] = useState("General");
  const [uploadNotes, setUploadNotes] = useState("");
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch(`/api/admin/clients/${id}`).then((response) => response.json()),
      fetch(`/api/admin/clients/${id}/documents`).then((response) => response.json()),
      fetch(`/api/admin/clients/${id}/submissions`).then((response) => response.json()),
    ])
      .then(([clientData, docsData, submissionsData]) => {
        setClient(clientData.client ?? null);
        setDraft(clientData.client ?? {});
        setDocs(docsData.documents ?? []);
        setSubmissions(submissionsData.submissions ?? []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id]);

  const saveField = async (key?: keyof Client, value?: string | boolean | null) => {
    if (!client) return;
    const next = { ...draft, ...(key ? { [key]: value } : {}) };
    setBusy(true);
    const response = await fetch(`/api/admin/clients/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(next),
    });
    if (response.ok) {
      setClient((current) => (current ? { ...current, ...next } : current));
      setDraft(next);
      setEditingField(null);
      showAdminToast({ type: "success", title: "Client updated", message: "Changes were saved instantly." });
    } else {
      showAdminToast({ type: "error", title: "Update failed", message: "Please try again." });
    }
    setBusy(false);
  };

  const handleUpload = async () => {
    if (!uploadFile) return;
    setUploading(true);
    const formData = new FormData();
    formData.append("file", uploadFile);
    formData.append("clientId", id);
    formData.append("category", uploadCategory);
    formData.append("notes", uploadNotes);

    const response = await fetch("/api/admin/documents/upload", { method: "POST", body: formData });
    if (response.ok) {
      const data = await response.json();
      setDocs((current) => [data.document, ...current]);
      setUploadFile(null);
      setUploadNotes("");
      showAdminToast({ type: "success", title: "Document uploaded", message: "The file is now available in the client portal." });
    } else {
      showAdminToast({ type: "error", title: "Upload failed", message: "The document could not be uploaded." });
    }
    setUploading(false);
  };

  const handleCreateMailbox = async () => {
    setCreatingMailbox(true);
    try {
      const response = await fetch(`/api/admin/clients/${id}/create-mailbox`, { method: "POST" });
      const data = await response.json();
      if (!response.ok) {
        showAdminToast({ type: "error", title: "Mailbox failed", message: data.error ?? "Unable to create mailbox." });
        return;
      }
      const mailboxId = data.mailboxId ?? client?.mailboxId ?? null;
      setClient((current) => (current ? { ...current, mailboxId } : current));
      setDraft((current) => ({ ...current, mailboxId }));
      showAdminToast({ type: "success", title: data.alreadyExists ? "Mailbox already exists" : "Mailbox created", message: mailboxId ? `Mailbox ID ${mailboxId}` : "Mailbox is ready." });
    } catch {
      showAdminToast({ type: "error", title: "Mailbox failed", message: "Unable to create mailbox." });
    } finally {
      setCreatingMailbox(false);
    }
  };

  const toggleStatus = async () => {
    if (!client) return;
    const nextStatus = client.status === "suspended" ? "active" : "suspended";
    await saveField("status", nextStatus);
  };

  const handleOffboard = async () => {
    setOffboarding(true);
    try {
      const response = await fetch(`/api/admin/clients/${id}/offboard`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...offboardOptions,
          notes: offboardNotes.trim() || undefined,
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        showAdminToast({
          type: "error",
          title: "Offboarding failed",
          message: data.error ?? "The client could not be offboarded.",
        });
        return;
      }

      showAdminToast({
        type: "success",
        title: "Client offboarded",
        message: offboardOptions.deleteClient
          ? "Audit log saved and client record removed."
          : "Selected offboarding actions completed and logged.",
      });

      if (offboardOptions.deleteClient) {
        window.location.href = "/admin/clients";
        return;
      }

      setShowOffboardModal(false);
    } catch {
      showAdminToast({ type: "error", title: "Offboarding failed", message: "The client could not be offboarded." });
    } finally {
      setOffboarding(false);
    }
  };

  const activity = useMemo(() => {
    if (!client) return [];
    return [
      {
        id: `joined-${client.id}`,
        title: "Client account created",
        meta: `${client.plan} plan started`,
        at: client.createdAt,
      },
      ...docs.map((doc) => ({
        id: `doc-${doc.id}`,
        title: `Document uploaded: ${doc.fileName}`,
        meta: doc.category,
        at: doc.uploadedAt,
      })),
      ...submissions.map((submission) => ({
        id: `submission-${submission.id}`,
        title: `Submission received: ${submission.fileName}`,
        meta: submission.status.replaceAll("_", " "),
        at: submission.submittedAt,
      })),
      {
        id: `status-${client.id}`,
        title: `Account is currently ${client.status}`,
        meta: client.mailboxId ? `Mailbox ${client.mailboxId}` : "Mailbox not created yet",
        at: client.lastActive ?? client.createdAt,
      },
    ].sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime());
  }, [client, docs, submissions]);

  if (loading) {
    return <div className="p-10 text-sm text-white/50">Loading client profile…</div>;
  }

  if (!client) {
    return (
      <div className="mx-auto max-w-4xl p-6 lg:p-10">
        <EmptyState icon={<UserCog className="h-6 w-6" />} title="Client not found" description="This record may have been removed, or the link is no longer valid." action={<BackLink href="/admin/clients" label="Back to clients" />} />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl p-6 lg:p-10">
      <div className="mb-5">
        <BackLink href="/admin/clients" label="Back to Clients" />
      </div>

      <AdminPageHeader
        eyebrow="Client Profile"
        title={client.fullName}
        description={`${client.businessName || "No business name"} • ${client.email}`}
        breadcrumbs={[
          { label: "Admin", href: "/admin" },
          { label: "Clients", href: "/admin/clients" },
          { label: client.fullName },
        ]}
        action={
          <button onClick={() => setShowOffboardModal(true)} className="inline-flex items-center gap-2 rounded-2xl border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm font-semibold text-red-200 transition hover:bg-red-400/20">
            <Trash2 className="h-4 w-4" />
            Delete Client
          </button>
        }
      />

      <div className="mb-8 grid gap-6 xl:grid-cols-[1.7fr_1fr]">
        <div className="space-y-6">
          <section className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-6">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-white/35">Account details</p>
                <p className="mt-1 text-sm text-white/55">Click any field to edit it inline.</p>
              </div>
            </div>
            <div className="space-y-3">
              {editableFields.map((field) => (
                <div key={String(field.key)} className="rounded-[1.5rem] border border-white/8 bg-black/10 px-4 py-4">
                  <p className="mb-2 text-xs uppercase tracking-[0.25em] text-white/35">{field.label}</p>
                  {editingField === field.key ? (
                    <div className="flex flex-col gap-3 sm:flex-row">
                      {field.key === "notes" ? (
                        <textarea
                          autoFocus
                          rows={3}
                          value={String(draft[field.key] ?? "")}
                          onChange={(event) => setDraft((current) => ({ ...current, [field.key]: event.target.value }))}
                          className="min-h-24 flex-1 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white focus:border-[#36EAEA]/40 focus:outline-none"
                        />
                      ) : (
                        <input
                          autoFocus
                          type={field.type ?? "text"}
                          value={String(draft[field.key] ?? "")}
                          onChange={(event) => setDraft((current) => ({ ...current, [field.key]: event.target.value }))}
                          className="flex-1 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white focus:border-[#36EAEA]/40 focus:outline-none"
                        />
                      )}
                      <div className="flex gap-2">
                        <button onClick={() => saveField()} disabled={busy} className="rounded-2xl bg-[#36EAEA] px-4 py-3 text-sm font-semibold text-[#040d1a] transition hover:bg-[#5cf5f5] disabled:opacity-50">Save</button>
                        <button onClick={() => { setEditingField(null); setDraft(client); }} className="rounded-2xl border border-white/10 px-4 py-3 text-sm text-white/70 transition hover:bg-white/5 hover:text-white">Cancel</button>
                      </div>
                    </div>
                  ) : (
                    <button onClick={() => setEditingField(field.key)} className="w-full text-left text-sm text-white transition hover:text-[#9af7f7]">
                      {String(client[field.key] ?? "—")}
                    </button>
                  )}
                </div>
              ))}

              <div className="grid gap-3 md:grid-cols-2">
                <div className="rounded-[1.5rem] border border-white/8 bg-black/10 px-4 py-4">
                  <p className="mb-2 text-xs uppercase tracking-[0.25em] text-white/35">Plan</p>
                  <select value={draft.plan ?? client.plan} onChange={(event) => { const value = event.target.value; setDraft((current) => ({ ...current, plan: value })); void saveField("plan", value); }} className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white focus:outline-none">
                    {PLAN_OPTIONS.map((option) => <option key={option} value={option}>{option}</option>)}
                  </select>
                </div>
                <div className="rounded-[1.5rem] border border-white/8 bg-black/10 px-4 py-4">
                  <p className="mb-2 text-xs uppercase tracking-[0.25em] text-white/35">Status</p>
                  <select value={draft.status ?? client.status} onChange={(event) => { const value = event.target.value; setDraft((current) => ({ ...current, status: value })); void saveField("status", value); }} className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white focus:outline-none">
                    {STATUS_OPTIONS.map((option) => <option key={option} value={option}>{option}</option>)}
                  </select>
                </div>
              </div>
            </div>
          </section>

          <section className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-6">
            <div className="mb-5 flex items-center gap-3">
              <UploadCloud className="h-5 w-5 text-[#36EAEA]" />
              <div>
                <h2 className="text-lg font-semibold text-white">Upload Document</h2>
                <p className="text-sm text-white/55">Send a new file directly into this client&apos;s portal.</p>
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              <select value={uploadCategory} onChange={(event) => setUploadCategory(event.target.value)} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white focus:outline-none">
                {["Compliance", "Address", "Banking", "Credit", "Contract", "General"].map((category) => <option key={category}>{category}</option>)}
              </select>
              <input value={uploadNotes} onChange={(event) => setUploadNotes(event.target.value)} placeholder="Notes for the client" className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/30 focus:outline-none md:col-span-2" />
              <input type="file" accept=".pdf,.png,.jpg,.jpeg,.webp" onChange={(event) => setUploadFile(event.target.files?.[0] ?? null)} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/70 file:mr-3 file:rounded-xl file:border-0 file:bg-[#36EAEA]/15 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-[#9af7f7] md:col-span-2" />
              <button onClick={handleUpload} disabled={!uploadFile || uploading} className="rounded-2xl bg-[#36EAEA] px-4 py-3 text-sm font-semibold text-[#040d1a] transition hover:bg-[#5cf5f5] disabled:opacity-50">
                {uploading ? "Uploading..." : "Upload"}
              </button>
            </div>
          </section>

          <div className="grid gap-6 xl:grid-cols-2">
            <section className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-6">
              <div className="mb-4 flex items-center gap-3">
                <FileText className="h-5 w-5 text-[#36EAEA]" />
                <div>
                  <h2 className="text-lg font-semibold text-white">Documents</h2>
                  <p className="text-sm text-white/55">Files AIBC uploaded for this client.</p>
                </div>
              </div>
              {docs.length ? (
                <div className="space-y-3">
                  {docs.map((doc) => (
                    <a key={doc.id} href={`/api/admin/documents/${doc.id}/download`} className="flex items-start justify-between rounded-[1.5rem] border border-white/8 bg-black/10 p-4 transition hover:border-[#36EAEA]/20 hover:bg-black/15">
                      <div>
                        <p className="text-sm font-semibold text-white">{doc.fileName}</p>
                        <p className="mt-1 text-xs text-white/45">{doc.category} • {(doc.fileSize / 1024).toFixed(0)} KB • {new Date(doc.uploadedAt).toLocaleString()}</p>
                      </div>
                      <span className="rounded-full border border-white/10 px-3 py-1 text-xs text-white/60">Download</span>
                    </a>
                  ))}
                </div>
              ) : (
                <EmptyState title="No documents uploaded" description="Upload agreements, certificates, or onboarding documents so the client can access them immediately." />
              )}
            </section>

            <section className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-6">
              <div className="mb-4 flex items-center gap-3">
                <Send className="h-5 w-5 text-amber-300" />
                <div>
                  <h2 className="text-lg font-semibold text-white">Submissions</h2>
                  <p className="text-sm text-white/55">Everything the client has sent in for review.</p>
                </div>
              </div>
              {submissions.length ? (
                <div className="space-y-3">
                  {submissions.map((submission) => (
                    <a key={submission.id} href={`/api/admin/submissions/${submission.id}/download`} className="flex items-start justify-between rounded-[1.5rem] border border-white/8 bg-black/10 p-4 transition hover:border-amber-300/20 hover:bg-black/15">
                      <div>
                        <p className="text-sm font-semibold text-white">{submission.fileName}</p>
                        <p className="mt-1 text-xs text-white/45">{submission.category} • {submission.status.replaceAll("_", " ")} • {new Date(submission.submittedAt).toLocaleString()}</p>
                        {submission.adminNotes ? <p className="mt-2 text-xs italic text-white/45">{submission.adminNotes}</p> : null}
                      </div>
                      <span className="rounded-full border border-white/10 px-3 py-1 text-xs text-white/60">Open</span>
                    </a>
                  ))}
                </div>
              ) : (
                <EmptyState title="No submissions yet" description="Once this client uploads compliance or onboarding files, they will appear here with status history." />
              )}
            </section>
          </div>
        </div>

        <div className="space-y-6">
          <section className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-6">
            <p className="text-xs uppercase tracking-[0.3em] text-white/35">Client actions</p>
            <div className="mt-4 space-y-3">
              <button onClick={() => showAdminToast({ type: "success", title: "Welcome email prepared", message: "Use the generated welcome letter from the documents panel to send it from support." })} className="flex w-full items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-left text-sm text-white transition hover:bg-white/8">
                <Mail className="h-4 w-4 text-[#36EAEA]" />
                Send Welcome Email
              </button>
              {!client.mailboxId ? (
                <button onClick={handleCreateMailbox} disabled={creatingMailbox} className="flex w-full items-center gap-3 rounded-2xl border border-[#36EAEA]/20 bg-[#36EAEA]/10 px-4 py-3 text-left text-sm text-[#baf8f8] transition hover:bg-[#36EAEA]/15 disabled:opacity-50">
                  <Mail className="h-4 w-4" />
                  {creatingMailbox ? "Creating Mailbox..." : "Create Mailbox"}
                </button>
              ) : null}
              <button onClick={toggleStatus} disabled={busy} className="flex w-full items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-left text-sm text-white transition hover:bg-white/8 disabled:opacity-50">
                <UserCog className="h-4 w-4 text-amber-300" />
                {client.status === "suspended" ? "Activate account" : "Suspend account"}
              </button>
            </div>
          </section>

          <section className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-6">
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
              <div className="rounded-[1.5rem] border border-emerald-400/15 bg-emerald-400/10 p-4">
                <p className="text-xs uppercase tracking-[0.25em] text-emerald-100/60">Status</p>
                <p className="mt-2 text-lg font-semibold capitalize text-white">{client.status}</p>
                <p className="mt-1 text-sm text-white/55">Last active {new Date(client.lastActive ?? client.createdAt).toLocaleString()}</p>
              </div>
              <div className="rounded-[1.5rem] border border-[#36EAEA]/15 bg-[#36EAEA]/10 p-4">
                <p className="text-xs uppercase tracking-[0.25em] text-[#9af7f7]/70">Plan</p>
                <p className="mt-2 text-lg font-semibold capitalize text-white">{client.plan}</p>
                <p className="mt-1 text-sm text-white/55">Mailbox {client.mailboxId ?? "not set"}</p>
              </div>
              <div className="rounded-[1.5rem] border border-amber-400/15 bg-amber-400/10 p-4">
                <p className="text-xs uppercase tracking-[0.25em] text-amber-100/60">Add-ons</p>
                <p className="mt-2 text-lg font-semibold text-white">{client.creditAddon ? "Credit reporting active" : "No credit add-on"}</p>
                <p className="mt-1 text-sm text-white/55">{client.unitOwner ? `Owns Unit ${client.unitNumber ?? "—"}` : "No unit ownership recorded"}</p>
              </div>
            </div>
          </section>

          <section className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-6">
            <p className="text-xs uppercase tracking-[0.3em] text-white/35">Activity timeline</p>
            <div className="mt-5 space-y-4">
              {activity.map((item) => (
                <div key={item.id} className="relative pl-6 before:absolute before:left-2 before:top-1.5 before:h-full before:w-px before:bg-white/10 last:before:hidden">
                  <div className="absolute left-0 top-1.5 h-4 w-4 rounded-full border border-[#36EAEA]/30 bg-[#36EAEA]/15" />
                  <p className="text-sm font-medium text-white">{item.title}</p>
                  <p className="mt-1 text-xs text-white/45">{item.meta}</p>
                  <p className="mt-1 text-xs text-white/30">{new Date(item.at).toLocaleString()}</p>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>

      {showOffboardModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="glass-card w-full max-w-lg rounded-3xl border border-white/10 p-8 shadow-2xl">
            <div className="mb-2 flex items-center gap-3">
              <AlertTriangle className="h-6 w-6 text-red-400" />
              <h2 className="text-xl font-bold text-white">Offboard Client</h2>
            </div>
            <p className="mb-6 text-sm text-white/60">{client.fullName} · {client.email}</p>

            <div className="mb-6 space-y-3">
              <p className="mb-3 text-xs uppercase tracking-widest text-white/40">Select actions to perform:</p>

              <label className="flex cursor-pointer items-start gap-3 rounded-xl bg-white/5 p-3 transition-all hover:bg-white/10">
                <input
                  type="checkbox"
                  checked={offboardOptions.cancelStripe}
                  onChange={(event) => setOffboardOptions((previous) => ({ ...previous, cancelStripe: event.target.checked }))}
                  className="mt-0.5 rounded"
                />
                <div>
                  <p className="text-sm font-semibold text-white">Cancel Stripe Subscription</p>
                  <p className="text-xs text-white/50">Immediately cancels any active billing. Client will not be charged again.</p>
                </div>
              </label>

              <label className="flex cursor-pointer items-start gap-3 rounded-xl bg-white/5 p-3 transition-all hover:bg-white/10">
                <input
                  type="checkbox"
                  checked={offboardOptions.deactivateMailbox}
                  onChange={(event) => setOffboardOptions((previous) => ({ ...previous, deactivateMailbox: event.target.checked }))}
                  className="mt-0.5 rounded"
                />
                <div>
                  <p className="text-sm font-semibold text-white">Deactivate Mailbox & Release Address</p>
                  <p className="text-xs text-white/50">Deactivates their Anytime Mailbox account and releases their address slot for reassignment.</p>
                </div>
              </label>

              <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-red-500/20 bg-red-500/10 p-3 transition-all hover:bg-red-500/15">
                <input
                  type="checkbox"
                  checked={offboardOptions.deleteClient}
                  onChange={(event) => setOffboardOptions((previous) => ({ ...previous, deleteClient: event.target.checked }))}
                  className="mt-0.5 rounded"
                />
                <div>
                  <p className="text-sm font-semibold text-red-300">Delete Client Record</p>
                  <p className="text-xs text-white/50">Permanently removes all portal data. This cannot be undone. An audit log will be saved.</p>
                </div>
              </label>
            </div>

            <div className="mb-5">
              <label className="mb-2 block text-xs text-white/50">Notes (optional, for audit log)</label>
              <textarea
                rows={2}
                value={offboardNotes}
                onChange={(event) => setOffboardNotes(event.target.value)}
                placeholder="Reason for offboarding..."
                className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder-white/30 focus:outline-none"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleOffboard}
                disabled={offboarding || (!offboardOptions.cancelStripe && !offboardOptions.deactivateMailbox && !offboardOptions.deleteClient)}
                className="flex-1 rounded-2xl border border-red-500/30 bg-red-500/20 py-3 text-sm font-semibold text-red-300 transition-all hover:bg-red-500/30 disabled:opacity-40"
              >
                {offboarding ? "Processing..." : "Confirm Offboarding"}
              </button>
              <button
                onClick={() => setShowOffboardModal(false)}
                className="flex-1 rounded-2xl border border-white/10 py-3 text-sm text-white/60 transition-all hover:bg-white/5"
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
