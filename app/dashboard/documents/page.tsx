"use client";

import { ChangeEvent, useEffect, useMemo, useRef, useState } from "react";
import { FileText, UploadCloud, Download, Trash2, BadgeCheck } from "lucide-react";

const STORAGE_KEY = "aibc_documents";
const MAX_FILE_BYTES = 10 * 1024 * 1024;
const ACCEPTED_TYPES = ["application/pdf", "image/png", "image/jpeg", "image/webp"];
const ACCEPTED_EXTENSIONS = [".pdf", ".png", ".jpg", ".jpeg", ".webp"];
const DOCUMENT_CATEGORIES = ["Formation", "Tax", "Banking", "Address", "Credit", "Other"] as const;

type DocumentCategory = (typeof DOCUMENT_CATEGORIES)[number];

type StoredDocument = {
  id: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  uploadedAt: string;
  category: DocumentCategory;
  fromAibc: boolean;
  description?: string;
  dataUrl?: string;
  downloadUrl?: string;
};

const fromAibcDocuments: StoredDocument[] = [
  {
    id: "aibc-business-address",
    fileName: "AIBC Business Address Certificate.pdf",
    description: "Your official commercial address confirmation at 125 N 9th Street, Frederick, OK 73542",
    fileType: "application/pdf",
    fileSize: 512 * 1024,
    uploadedAt: "2024-03-01T10:00:00.000Z",
    category: "Address",
    fromAibc: true,
    downloadUrl: "data:text/plain;charset=utf-8," + encodeURIComponent("Official confirmation provided by AIBC."),
  },
  {
    id: "aibc-plan-confirmation",
    fileName: "Business Plus Plan Confirmation.pdf",
    description: "Your current plan details and account information",
    fileType: "application/pdf",
    fileSize: 384 * 1024,
    uploadedAt: "2024-02-20T14:30:00.000Z",
    category: "Other",
    fromAibc: true,
    downloadUrl: "data:text/plain;charset=utf-8," + encodeURIComponent("Plan confirmation placeholder."),
  },
];

const formatBytes = (size: number) => {
  if (size === 0) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  const index = Math.floor(Math.log(size) / Math.log(1024));
  const value = size / Math.pow(1024, index);
  return `${value.toFixed(index === 0 ? 0 : 1)} ${units[index]}`;
};

const formatDate = (value: string) =>
  new Date(value).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

const readFileAsDataUrl = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error || new Error("Unable to read file"));
    reader.readAsDataURL(file);
  });

export default function DocumentsPage() {
  const [myDocuments, setMyDocuments] = useState<StoredDocument[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<DocumentCategory>("Other");
  const [error, setError] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (!stored) return;

    try {
      const parsed: StoredDocument[] = JSON.parse(stored);
      setMyDocuments(parsed);
    } catch (err) {
      console.error("Unable to parse stored documents", err);
    }
  }, []);

  useEffect(() => {
    if (!toastMessage) return;
    const timeout = setTimeout(() => setToastMessage(null), 3500);
    return () => clearTimeout(timeout);
  }, [toastMessage]);

  const persistDocuments = (docs: StoredDocument[]) => {
    setMyDocuments(docs);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(docs));
    }
  };

  const resetUploadState = () => {
    setSelectedFile(null);
    setSelectedCategory("Other");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    setError(null);

    if (!file) {
      setSelectedFile(null);
      return;
    }

    const mimeType = (file.type || "").toLowerCase();
    const extension = file.name.substring(file.name.lastIndexOf(".")).toLowerCase();

    const isMimeAllowed = mimeType ? ACCEPTED_TYPES.includes(mimeType) : true;
    const isExtensionAllowed = ACCEPTED_EXTENSIONS.includes(extension);

    if (!isMimeAllowed && !isExtensionAllowed) {
      setError("Unsupported file type. Upload PDF or image files only.");
      setSelectedFile(null);
      return;
    }

    if (file.size > MAX_FILE_BYTES) {
      setError("File is too large. Maximum upload size is 10MB.");
      setSelectedFile(null);
      return;
    }

    setSelectedFile(file);
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setError("Select a file to upload.");
      return;
    }

    setIsUploading(true);
    setError(null);

    try {
      const dataUrl = await readFileAsDataUrl(selectedFile);
      const newDocument: StoredDocument = {
        id: crypto.randomUUID(),
        fileName: selectedFile.name,
        fileSize: selectedFile.size,
        fileType: (selectedFile.type || "application/octet-stream").toLowerCase(),
        uploadedAt: new Date().toISOString(),
        category: selectedCategory,
        fromAibc: false,
        dataUrl,
      };

      const updatedDocuments = [newDocument, ...myDocuments];
      persistDocuments(updatedDocuments);
      setToastMessage("Document uploaded successfully");
      resetUploadState();
    } catch (err) {
      console.error(err);
      setError("Unable to save this file. Storage limit may have been reached.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = (id: string) => {
    const updated = myDocuments.filter((doc) => doc.id !== id);
    persistDocuments(updated);
  };

  const handleDownload = (doc: StoredDocument) => {
    const link = document.createElement("a");
    if (doc.dataUrl) {
      link.href = doc.dataUrl;
    } else if (doc.downloadUrl) {
      link.href = doc.downloadUrl;
    } else {
      setToastMessage("Download will be available after syncing with storage.");
      return;
    }
    link.download = doc.fileName;
    link.click();
  };

  const totalStorageUsed = useMemo(() => myDocuments.reduce((sum, doc) => sum + doc.fileSize, 0), [myDocuments]);

  return (
    <div className="p-6 lg:p-10 max-w-5xl">
      <div className="mb-10">
        <p className="text-[#36EAEA] text-xs font-semibold uppercase tracking-[0.3em] mb-1">Document Vault</p>
        <h1 className="text-3xl font-bold text-white">Securely store your business paperwork</h1>
        <p className="text-white/60 text-sm">Upload items like EIN confirmations, bank letters, credit approvals, and more.</p>
      </div>

      {/* Toast */}
      {toastMessage && (
        <div className="fixed top-6 right-6 rounded-2xl border border-teal-400/30 bg-black/70 text-teal-200 px-5 py-3 text-sm shadow-[0_10px_40px_rgba(0,0,0,0.45)]">
          {toastMessage}
        </div>
      )}

      <section className="glass-card rounded-2xl border border-white/10 p-6 mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h2 className="text-white text-lg font-semibold">From AIBC</h2>
              <span className="inline-flex items-center gap-1 text-xs font-medium text-[#36EAEA] bg-[#36EAEA]/10 border border-[#36EAEA]/30 rounded-full px-2 py-0.5">
                <BadgeCheck className="h-3.5 w-3.5" /> Official
              </span>
            </div>
            <p className="text-white/60 text-sm">Important records we7ve issued for your business.</p>
          </div>
        </div>
        <div className="space-y-3">
          {fromAibcDocuments.map((doc) => (
            <article
              key={doc.id}
              className="flex items-center justify-between gap-4 rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur-xl hover:border-white/20 transition"
            >
              <div className="flex items-center gap-4">
                <div className="rounded-2xl bg-[#36EAEA]/10 border border-[#36EAEA]/30 p-3">
                  <FileText className="h-5 w-5 text-[#36EAEA]" />
                </div>
                <div>
                  <p className="text-white font-semibold text-sm">{doc.fileName}</p>
                  {doc.description && <p className="text-white/60 text-xs">{doc.description}</p>}
                  <p className="text-white/40 text-xs mt-1">Added {formatDate(doc.uploadedAt)}</p>
                </div>
              </div>
              <button
                onClick={() => handleDownload(doc)}
                className="rounded-full border border-[#36EAEA]/50 text-[#36EAEA] px-4 py-2 text-xs font-semibold hover:bg-[#36EAEA]/10 transition"
              >
                Download
              </button>
            </article>
          ))}
        </div>
      </section>

      <section className="glass-card rounded-2xl border border-white/10 p-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between mb-6">
          <div>
            <h2 className="text-white text-lg font-semibold">My Documents</h2>
            <p className="text-white/60 text-sm">All files remain private to your account.</p>
          </div>
          <div className="text-xs text-white/50">
            {formatBytes(totalStorageUsed)} stored • {myDocuments.length} files
          </div>
        </div>

        <div className="mb-6">
          <label
            htmlFor="document-upload"
            className="flex flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-white/15 bg-white/5 p-8 text-center text-white/70 hover:border-[#36EAEA]/60 hover:text-white transition cursor-pointer"
          >
            <UploadCloud className="h-10 w-10 text-[#36EAEA]" />
            <div>
              <p className="text-sm font-semibold">Drop PDF or image here, or click to browse</p>
              <p className="text-xs text-white/40">PDF, PNG, JPG, JPEG, WEBP • Max 10MB</p>
            </div>
          </label>
          <input
            ref={fileInputRef}
            id="document-upload"
            type="file"
            accept=".pdf,.png,.jpg,.jpeg,.webp"
            className="hidden"
            onChange={handleFileChange}
          />
        </div>

        {selectedFile && (
          <div className="rounded-2xl border border-white/10 bg-black/40 p-4 mb-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-white font-semibold text-sm">{selectedFile.name}</p>
                <p className="text-white/50 text-xs">{formatBytes(selectedFile.size)}</p>
              </div>
              <div className="flex flex-col gap-3 md:flex-row md:items-center">
                <select
                  value={selectedCategory}
                  onChange={(event) => setSelectedCategory(event.target.value as DocumentCategory)}
                  className="rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-sm text-white focus:border-[#36EAEA]/60 focus:outline-none"
                >
                  {DOCUMENT_CATEGORIES.map((category) => (
                    <option key={category} value={category} className="bg-slate-900">
                      {category}
                    </option>
                  ))}
                </select>
                <button
                  onClick={handleUpload}
                  disabled={isUploading}
                  className="rounded-xl bg-[#36EAEA]/90 px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-[#36EAEA] disabled:opacity-60"
                >
                  {isUploading ? "Uploading..." : "Upload"}
                </button>
              </div>
            </div>
          </div>
        )}

        {error && <p className="text-sm text-rose-400 mb-4">{error}</p>}

        {myDocuments.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-center text-white/70">
            <p className="font-semibold text-white">Upload your important business documents here.</p>
            <p className="text-sm text-white/60">
              EIN letters, formation documents, bank confirmations, credit approvals, and more. All files are private to your account.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {myDocuments.map((doc) => (
              <article
                key={doc.id}
                className="flex items-center justify-between gap-4 rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur-xl hover:border-white/20 transition"
              >
                <div className="flex items-center gap-4">
                  <div className="rounded-2xl bg-[#36EAEA]/10 border border-[#36EAEA]/30 p-3">
                    <FileText className="h-5 w-5 text-[#36EAEA]" />
                  </div>
                  <div>
                    <p className="text-white font-semibold text-sm">{doc.fileName}</p>
                    <p className="text-white/50 text-xs flex flex-wrap gap-2">
                      <span>{formatBytes(doc.fileSize)}</span>
                      <span>• Uploaded {formatDate(doc.uploadedAt)}</span>
                      <span className="inline-flex items-center rounded-full border border-white/20 px-2 py-0.5 text-[10px] uppercase tracking-wide text-white/70">
                        {doc.category}
                      </span>
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleDownload(doc)}
                    className="inline-flex items-center gap-1 rounded-full border border-white/15 px-4 py-2 text-xs font-semibold text-white hover:border-white/40"
                  >
                    <Download className="h-4 w-4" /> Download
                  </button>
                  {!doc.fromAibc && (
                    <button
                      onClick={() => handleDelete(doc.id)}
                      className="inline-flex items-center gap-1 rounded-full border border-red-500/40 px-4 py-2 text-xs font-semibold text-red-300 hover:bg-red-500/10"
                    >
                      <Trash2 className="h-4 w-4" /> Delete
                    </button>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
