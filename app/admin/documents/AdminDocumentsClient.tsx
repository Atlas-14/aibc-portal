"use client";

import { ChangeEvent, useEffect, useState } from "react";
import { FileText, UploadCloud } from "lucide-react";

const ADMIN_STORAGE_KEY = "aibc_admin_uploads";

const MOCK_SUBMISSIONS = [
  {
    id: "sub-101",
    clientName: "Nova Carter",
    businessName: "Lumina Freight LLC",
    receivedAt: "2024-04-10T15:24:00.000Z",
    status: "pending_review",
    files: ["Form 1583", "ID #1", "ID #2"],
  },
  {
    id: "sub-102",
    clientName: "Elias Ward",
    businessName: "Vector Labs Inc",
    receivedAt: "2024-04-09T12:05:00.000Z",
    status: "active",
    files: ["Form 1583", "ID #1", "ID #2", "Utility Bill"],
  },
];

type AdminUpload = {
  id: string;
  clientId: string;
  category: string;
  fileName: string;
  uploadedAt: string;
};

const ADMIN_CATEGORIES = ["Compliance", "Address", "Banking", "Credit", "Other"];

export default function AdminDocumentsClient() {
  const [clientId, setClientId] = useState("");
  const [category, setCategory] = useState("Compliance");
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [uploaded, setUploaded] = useState<AdminUpload[]>([]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = window.localStorage.getItem(ADMIN_STORAGE_KEY);
    if (!stored) return;
    try {
      const parsed: AdminUpload[] = JSON.parse(stored);
      setUploaded(parsed);
    } catch (error) {
      console.error("Unable to parse admin uploads", error);
    }
  }, []);

  useEffect(() => {
    if (!toast) return;
    const timeout = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(timeout);
  }, [toast]);

  const persistAdminUploads = (records: AdminUpload[]) => {
    setUploaded(records);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(ADMIN_STORAGE_KEY, JSON.stringify(records));
    }
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    setError(null);
    const selected = event.target.files?.[0];
    if (!selected) {
      setFile(null);
      return;
    }
    setFile(selected);
  };

  const handleSubmit = () => {
    if (!clientId.trim()) {
      setError("Enter a client ID before uploading.");
      return;
    }
    if (!file) {
      setError("Select a file to upload.");
      return;
    }

    const newRecord: AdminUpload = {
      id: crypto.randomUUID(),
      clientId: clientId.trim(),
      category,
      fileName: file.name,
      uploadedAt: new Date().toISOString(),
    };

    const next = [newRecord, ...uploaded];
    persistAdminUploads(next);
    setClientId("");
    setCategory("Compliance");
    setFile(null);
    const input = document.getElementById("admin-upload-input") as HTMLInputElement | null;
    if (input) input.value = "";
    setToast("Document queued for client delivery once storage is connected.");
  };

  return (
    <div className="space-y-8">
      {toast && (
        <div className="fixed top-6 right-6 rounded-2xl border border-white/10 bg-black/70 px-4 py-2 text-sm text-white/80">
          {toast}
        </div>
      )}

      <section className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
        <div className="flex flex-col gap-2 mb-6">
          <h1 className="text-3xl font-semibold text-white">Admin — Client Document Submissions</h1>
          <p className="text-white/60 text-sm">Monitor Form 1583 packets and push documents directly into client vaults.</p>
        </div>

        <div className="rounded-2xl border border-amber-400/30 bg-amber-500/5 p-4 text-sm text-amber-100">
          When Supabase Storage is wired, this panel will display real client uploads and allow routing to compliance. For now we surface mock data and store admin uploads locally for demos.
        </div>
      </section>

      <section className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
        <div className="flex items-center gap-3 mb-6">
          <UploadCloud className="h-6 w-6 text-[#36EAEA]" />
          <div>
            <h2 className="text-white text-xl font-semibold">Upload a document to a client account</h2>
            <p className="text-white/60 text-sm">Use this until automated storage sync is live.</p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div className="flex flex-col gap-2">
            <label className="text-xs uppercase tracking-[0.3em] text-white/50">Client ID</label>
            <input
              value={clientId}
              onChange={(event) => setClientId(event.target.value)}
              className="rounded-xl border border-white/15 bg-black/30 px-3 py-2 text-sm text-white focus:border-[#36EAEA]/60 focus:outline-none"
              placeholder="client_xxx"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-xs uppercase tracking-[0.3em] text-white/50">Category</label>
            <select
              value={category}
              onChange={(event) => setCategory(event.target.value)}
              className="rounded-xl border border-white/15 bg-black/30 px-3 py-2 text-sm text-white focus:border-[#36EAEA]/60 focus:outline-none"
            >
              {ADMIN_CATEGORIES.map((option) => (
                <option key={option} value={option} className="bg-slate-900">
                  {option}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-xs uppercase tracking-[0.3em] text-white/50">File</label>
            <label
              htmlFor="admin-upload-input"
              className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-white/15 bg-black/30 px-3 py-2 text-sm text-white/70 hover:border-[#36EAEA]/60"
            >
              {file ? file.name : "Select file"}
            </label>
            <input id="admin-upload-input" type="file" className="hidden" onChange={handleFileChange} />
          </div>
        </div>

        {error && <p className="text-sm text-rose-300 mt-3">{error}</p>}

        <button
          onClick={handleSubmit}
          className="mt-4 w-full rounded-xl bg-[#36EAEA]/90 px-4 py-3 text-sm font-semibold text-slate-900 hover:bg-[#36EAEA]"
        >
          Upload to Client Vault
        </button>
      </section>

      <section className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
        <div className="flex items-center gap-3 mb-4">
          <FileText className="h-5 w-5 text-[#36EAEA]" />
          <div>
            <h2 className="text-white text-lg font-semibold">Incoming Compliance Packets</h2>
            <p className="text-white/60 text-sm">Mock submissions displayed until live data sync is ready.</p>
          </div>
        </div>
        <div className="space-y-3">
          {MOCK_SUBMISSIONS.map((submission) => (
            <article key={submission.id} className="rounded-xl border border-white/10 bg-black/30 p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
              <div>
                <p className="text-white font-semibold">{submission.businessName}</p>
                <p className="text-white/60 text-sm">{submission.clientName}</p>
                <p className="text-white/40 text-xs mt-1">Received {new Date(submission.receivedAt).toLocaleString()}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                {submission.files.map((file) => (
                  <span key={file} className="rounded-full border border-white/15 px-3 py-0.5 text-xs text-white/70">
                    {file}
                  </span>
                ))}
              </div>
              <span className="inline-flex items-center rounded-full border border-white/15 px-3 py-1 text-xs uppercase tracking-wide text-white/70">
                {submission.status === "pending_review" ? "Pending Review" : "Active"}
              </span>
            </article>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-white text-lg font-semibold">Admin Upload Activity (Local)</h2>
          <p className="text-xs text-white/50">{uploaded.length} files queued</p>
        </div>
        {uploaded.length === 0 ? (
          <p className="text-sm text-white/60">No admin uploads recorded yet.</p>
        ) : (
          <div className="space-y-3">
            {uploaded.map((record) => (
              <article key={record.id} className="rounded-xl border border-white/10 bg-black/40 p-4 text-sm text-white/80">
                <p className="font-semibold text-white">{record.fileName}</p>
                <p className="text-white/60 text-xs">
                  Client ID: {record.clientId} • Category: {record.category} • Uploaded {new Date(record.uploadedAt).toLocaleString()}
                </p>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
