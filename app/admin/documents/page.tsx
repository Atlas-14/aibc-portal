"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { Download, FileImage, FileText, Search, Send, Trash2, UploadCloud } from "lucide-react";
import {
  AdminPageHeader,
  BackLink,
  ConfirmDialog,
  EmptyState,
  SortableHeader,
  showAdminToast,
} from "@/components/admin/AdminPrimitives";

type Client = { id: string; fullName: string; businessName: string; email: string };
type AdminDoc = {
  id: string;
  clientId: string;
  clientName: string;
  businessName: string;
  fileName: string;
  fileSize: number;
  fileType?: string;
  category: string;
  notes: string | null;
  uploadedAt: string;
  filePath: string;
};

type SortKey = "fileName" | "clientName" | "category" | "uploadedAt";

const CATEGORIES = ["Compliance", "Address", "Banking", "Credit", "Contract", "General"];

export default function AdminDocuments() {
  const [clients, setClients] = useState<Client[]>([]);
  const [docs, setDocs] = useState<AdminDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("uploadedAt");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [selectedClient, setSelectedClient] = useState("");
  const [category, setCategory] = useState("General");
  const [notes, setNotes] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [deletingDoc, setDeletingDoc] = useState<AdminDoc | null>(null);
  const [busy, setBusy] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    Promise.all([fetch("/api/admin/clients").then((response) => response.json()), fetch("/api/admin/documents").then((response) => response.json())])
      .then(([clientData, docData]) => {
        setClients(clientData.clients ?? []);
        setDocs(docData.documents ?? []);
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
    setSortDirection(key === "uploadedAt" ? "desc" : "asc");
  };

  const filtered = useMemo(() => {
    const normalized = search.toLowerCase();
    return docs
      .filter((doc) =>
        [doc.fileName, doc.clientName, doc.businessName, doc.category].some((value) => value.toLowerCase().includes(normalized)),
      )
      .sort((a, b) => {
        const modifier = sortDirection === "asc" ? 1 : -1;
        const left = sortKey === "uploadedAt" ? new Date(a.uploadedAt).getTime() : String(a[sortKey]).toLowerCase();
        const right = sortKey === "uploadedAt" ? new Date(b.uploadedAt).getTime() : String(b[sortKey]).toLowerCase();
        if (left < right) return -1 * modifier;
        if (left > right) return 1 * modifier;
        return 0;
      });
  }, [docs, search, sortKey, sortDirection]);

  const handleUpload = async () => {
    if (!file || !selectedClient) return;
    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("clientId", selectedClient);
    formData.append("category", category);
    formData.append("notes", notes);
    const response = await fetch("/api/admin/documents/upload", { method: "POST", body: formData });

    if (response.ok) {
      const data = await response.json();
      const client = clients.find((entry) => entry.id === selectedClient);
      setDocs((current) => [
        {
          ...data.document,
          clientName: client?.fullName ?? "Unknown",
          businessName: client?.businessName ?? "",
        },
        ...current,
      ]);
      setFile(null);
      setNotes("");
      setSelectedClient("");
      if (fileRef.current) fileRef.current.value = "";
      showAdminToast({ type: "success", title: "Document uploaded", message: "The client can see it now." });
    } else {
      showAdminToast({ type: "error", title: "Upload failed", message: "Please try again." });
    }
    setUploading(false);
  };

  const handleDelete = async () => {
    if (!deletingDoc) return;
    setBusy(true);
    const response = await fetch(`/api/admin/documents/${deletingDoc.id}`, { method: "DELETE" });
    if (response.ok) {
      setDocs((current) => current.filter((doc) => doc.id !== deletingDoc.id));
      showAdminToast({ type: "success", title: "Document deleted", message: `${deletingDoc.fileName} was removed.` });
      setDeletingDoc(null);
    } else {
      showAdminToast({ type: "error", title: "Delete failed", message: "The document could not be deleted." });
    }
    setBusy(false);
  };

  return (
    <div className="mx-auto max-w-7xl p-6 lg:p-10">
      <div className="mb-5">
        <BackLink href="/admin" label="Back" />
      </div>

      <AdminPageHeader
        title="Client Documents"
        description="Upload polished deliverables into client portals and manage visibility across accounts."
        breadcrumbs={[{ label: "Admin", href: "/admin" }, { label: "Documents" }]}
      />

      <div className="mb-8 rounded-[2rem] border border-white/10 bg-white/[0.04] p-6">
        <div className="mb-5 flex items-center gap-3">
          <UploadCloud className="h-5 w-5 text-[#36EAEA]" />
          <div>
            <h2 className="text-lg font-semibold text-white">Upload to Client Portal</h2>
            <p className="text-sm text-white/55">Send agreements, compliance docs, and deliverables without leaving admin.</p>
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <select value={selectedClient} onChange={(event) => setSelectedClient(event.target.value)} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white focus:outline-none">
            <option value="">Select a client…</option>
            {clients.map((client) => (
              <option key={client.id} value={client.id}>{client.fullName} — {client.businessName}</option>
            ))}
          </select>
          <select value={category} onChange={(event) => setCategory(event.target.value)} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white focus:outline-none">
            {CATEGORIES.map((option) => <option key={option}>{option}</option>)}
          </select>
          <input value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="Notes for the client" className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/30 focus:outline-none md:col-span-2" />
          <input ref={fileRef} type="file" accept=".pdf,.png,.jpg,.jpeg,.webp" onChange={(event) => setFile(event.target.files?.[0] ?? null)} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/70 file:mr-3 file:rounded-xl file:border-0 file:bg-[#36EAEA]/15 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-[#9af7f7] md:col-span-2" />
        </div>
        <button onClick={handleUpload} disabled={!file || !selectedClient || uploading} className="mt-5 inline-flex items-center gap-2 rounded-2xl bg-[#36EAEA] px-5 py-3 text-sm font-semibold text-[#040d1a] transition hover:bg-[#5cf5f5] disabled:opacity-50">
          <Send className="h-4 w-4" />
          {uploading ? "Uploading..." : "Upload to Portal"}
        </button>
      </div>

      <div className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-3">
        <div className="mb-3 flex flex-col gap-3 px-2 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative w-full max-w-sm">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" />
            <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search documents" className="w-full rounded-2xl border border-white/10 bg-white/5 py-3 pl-11 pr-4 text-sm text-white placeholder:text-white/30 focus:outline-none" />
          </div>
          <div className="hidden grid-cols-[1.1fr_1fr_0.7fr_0.8fr_96px] items-center gap-4 lg:grid">
            <SortableHeader label="Document" active={sortKey === "fileName"} direction={sortDirection} onClick={() => setSort("fileName")} />
            <SortableHeader label="Client" active={sortKey === "clientName"} direction={sortDirection} onClick={() => setSort("clientName")} />
            <SortableHeader label="Category" active={sortKey === "category"} direction={sortDirection} onClick={() => setSort("category")} />
            <SortableHeader label="Uploaded" active={sortKey === "uploadedAt"} direction={sortDirection} onClick={() => setSort("uploadedAt")} />
            <div />
          </div>
        </div>

        {loading ? (
          <div className="space-y-3 p-2">
            {Array.from({ length: 5 }).map((_, index) => <div key={index} className="h-24 animate-pulse rounded-[1.5rem] border border-white/8 bg-white/5" />)}
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState title="No documents yet" description="Upload your first client-facing document and it will appear here with quick download links and client navigation." icon={<FileText className="h-6 w-6" />} />
        ) : (
          <div className="space-y-3 p-2">
            {filtered.map((doc) => {
              const isPdf = doc.fileType?.includes("pdf") || doc.fileName.toLowerCase().endsWith(".pdf");
              const Icon = isPdf ? FileText : FileImage;
              const iconTone = isPdf ? "text-red-200 bg-red-400/15 border-red-400/20" : "text-sky-200 bg-sky-400/15 border-sky-400/20";
              return (
                <div key={doc.id} className="grid gap-4 rounded-[1.75rem] border border-white/8 bg-white/[0.035] p-4 transition hover:border-[#36EAEA]/20 hover:bg-white/[0.05] lg:grid-cols-[1.1fr_1fr_0.7fr_0.8fr_96px] lg:items-center">
                  <div className="flex items-start gap-3 min-w-0">
                    <div className={`mt-0.5 flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-2xl border ${iconTone}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-white">{doc.fileName}</p>
                      <p className="mt-1 text-xs text-white/40">{(doc.fileSize / 1024).toFixed(0)} KB</p>
                      {doc.notes ? <p className="mt-1 truncate text-xs italic text-white/40">{doc.notes}</p> : null}
                    </div>
                  </div>
                  <div>
                    <Link href={`/admin/clients/${doc.clientId}`} className="text-sm font-medium text-[#9af7f7] transition hover:text-white">
                      {doc.clientName}
                    </Link>
                    <p className="mt-1 text-xs text-white/40">{doc.businessName}</p>
                  </div>
                  <div className="text-sm text-white/60">{doc.category}</div>
                  <div className="text-sm text-white/60">{new Date(doc.uploadedAt).toLocaleDateString()}</div>
                  <div className="flex items-center justify-end gap-2">
                    <a href={`/api/admin/documents/${doc.id}/download`} className="rounded-xl border border-white/10 bg-white/5 p-2 text-white/70 transition hover:bg-white/8 hover:text-white">
                      <Download className="h-4 w-4" />
                    </a>
                    <button onClick={() => setDeletingDoc(doc)} className="rounded-xl border border-red-400/15 bg-red-400/10 p-2 text-red-200 transition hover:bg-red-400/20">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <ConfirmDialog
        open={Boolean(deletingDoc)}
        title="Delete document?"
        description="This removes the file from the client portal immediately."
        confirmLabel="Delete document"
        busy={busy}
        onCancel={() => setDeletingDoc(null)}
        onConfirm={handleDelete}
      />
    </div>
  );
}
