"use client";
import { useEffect, useRef, useState } from "react";
import { UploadCloud, FileText, Trash2, Send, Search } from "lucide-react";

type Client = { id: string; fullName: string; businessName: string; email: string; };
type AdminDoc = {
  id: string;
  clientId: string;
  clientName: string;
  businessName: string;
  fileName: string;
  fileSize: number;
  category: string;
  notes: string | null;
  uploadedAt: string;
  filePath: string;
};

const CATEGORIES = ["Compliance", "Address", "Banking", "Credit", "Contract", "General"];

export default function AdminDocuments() {
  const [clients, setClients] = useState<Client[]>([]);
  const [docs, setDocs] = useState<AdminDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const [selectedClient, setSelectedClient] = useState("");
  const [category, setCategory] = useState("General");
  const [notes, setNotes] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    Promise.all([
      fetch("/api/admin/clients").then(r => r.json()),
      fetch("/api/admin/documents").then(r => r.json()),
    ]).then(([clientData, docData]) => {
      setClients(clientData.clients ?? []);
      setDocs(docData.documents ?? []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(t);
  }, [toast]);

  const handleUpload = async () => {
    if (!file || !selectedClient) return;
    setUploading(true);
    const fd = new FormData();
    fd.append("file", file);
    fd.append("clientId", selectedClient);
    fd.append("category", category);
    fd.append("notes", notes);
    const res = await fetch("/api/admin/documents/upload", { method: "POST", body: fd });
    if (res.ok) {
      const data = await res.json();
      const client = clients.find(c => c.id === selectedClient);
      setDocs(prev => [{ ...data.document, clientName: client?.fullName ?? "", businessName: client?.businessName ?? "" }, ...prev]);
      setToast("Document uploaded — client can now see it in their portal");
      setFile(null); setNotes(""); setSelectedClient("");
      if (fileRef.current) fileRef.current.value = "";
    } else {
      setToast("Upload failed — please try again");
    }
    setUploading(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this document? The client will no longer see it.")) return;
    const res = await fetch(`/api/admin/documents/${id}`, { method: "DELETE" });
    if (res.ok) {
      setDocs(prev => prev.filter(d => d.id !== id));
      setToast("Document deleted");
    }
  };

  const filtered = docs.filter(d =>
    d.fileName.toLowerCase().includes(search.toLowerCase()) ||
    d.clientName.toLowerCase().includes(search.toLowerCase()) ||
    d.businessName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 lg:p-10 max-w-5xl">
      {toast && (
        <div className="fixed top-6 right-6 z-50 bg-teal-400/20 border border-teal-400/30 text-teal-300 text-sm px-5 py-3 rounded-2xl shadow-xl">
          {toast}
        </div>
      )}

      <div className="mb-8">
        <p className="text-red-400 text-xs font-semibold uppercase tracking-widest mb-1">Admin</p>
        <h1 className="text-3xl font-bold text-white">Client Documents</h1>
        <p className="text-white/60 text-sm mt-1">Upload documents to client portals and manage what they can see.</p>
      </div>

      {/* Upload Panel */}
      <div className="glass-card rounded-3xl border-white/10 p-6 mb-8">
        <div className="flex items-center gap-2 mb-5">
          <UploadCloud className="h-5 w-5 text-teal-400" />
          <p className="text-white font-semibold">Upload Document to Client</p>
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-white/50 uppercase tracking-wider block mb-2">Client *</label>
            <select
              value={selectedClient}
              onChange={(e) => setSelectedClient(e.target.value)}
              className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white focus:border-teal-400/40 focus:outline-none"
            >
              <option value="">Select a client...</option>
              {clients.map(c => (
                <option key={c.id} value={c.id}>{c.fullName} — {c.businessName}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs text-white/50 uppercase tracking-wider block mb-2">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white focus:border-teal-400/40 focus:outline-none"
            >
              {CATEGORIES.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div className="md:col-span-2">
            <label className="text-xs text-white/50 uppercase tracking-wider block mb-2">Notes for client (optional)</label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Please review and sign this agreement"
              className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-white/30 focus:border-teal-400/40 focus:outline-none"
            />
          </div>
          <div className="md:col-span-2">
            <label className="text-xs text-white/50 uppercase tracking-wider block mb-2">File * (PDF, PNG, JPG — max 10MB)</label>
            <input
              ref={fileRef}
              type="file"
              accept=".pdf,.png,.jpg,.jpeg,.webp"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/70 file:mr-3 file:rounded-xl file:border-0 file:bg-teal-400/20 file:text-teal-300 file:text-xs file:px-3 file:py-1.5 file:font-semibold focus:outline-none"
            />
          </div>
        </div>
        <button
          onClick={handleUpload}
          disabled={!file || !selectedClient || uploading}
          className="mt-5 flex items-center gap-2 px-6 py-3 rounded-2xl bg-[#36EAEA] text-[#040d1a] font-semibold text-sm hover:bg-[#2fd4d4] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Send className="h-4 w-4" />
          {uploading ? "Uploading..." : "Upload to Client Portal"}
        </button>
      </div>

      {/* Documents List */}
      <div className="glass-card rounded-2xl border-white/10 p-6">
        <div className="flex items-center justify-between mb-5">
          <p className="text-white font-semibold">Uploaded Documents</p>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30" />
            <input
              type="text"
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-4 py-2 rounded-xl border border-white/10 bg-white/5 text-sm text-white placeholder-white/30 focus:outline-none focus:border-white/20 w-48"
            />
          </div>
        </div>

        {loading ? (
          <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="h-16 rounded-xl bg-white/5 animate-pulse" />)}</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="h-8 w-8 text-white/20 mx-auto mb-2" />
            <p className="text-white/40 text-sm">No documents uploaded yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((doc) => (
              <div key={doc.id} className="flex items-center justify-between p-4 rounded-2xl bg-white/5 hover:bg-white/8 transition-all">
                <div className="flex items-center gap-3 min-w-0">
                  <FileText className="h-5 w-5 text-teal-400 flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-white text-sm font-semibold truncate">{doc.fileName}</p>
                    <p className="text-white/50 text-xs">
                      {doc.clientName} · {doc.businessName} · {doc.category} · {(doc.fileSize / 1024).toFixed(0)} KB
                    </p>
                    {doc.notes && <p className="text-white/40 text-xs italic mt-0.5">{doc.notes}</p>}
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="text-xs text-white/30">{new Date(doc.uploadedAt).toLocaleDateString()}</span>
                  <button
                    onClick={() => handleDelete(doc.id)}
                    className="p-2 rounded-xl bg-red-400/10 hover:bg-red-400/20 text-red-400 transition-all"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
