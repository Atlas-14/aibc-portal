"use client";

import { ChangeEvent, useEffect, useMemo, useState } from "react";
import { FileText, UploadCloud, Download, Trash2, BadgeCheck } from "lucide-react";
import { ADDRESS_STATUS_EVENT, AddressStatus, getAddressStatus, setAddressStatus } from "@/lib/address-status";

const STORAGE_KEY = "aibc_documents";
const ACTIVATION_STORAGE_KEY = "aibc_activation_docs";
const MAX_FILE_BYTES = 10 * 1024 * 1024;
const ACCEPTED_TYPES = ["application/pdf", "image/png", "image/jpeg", "image/webp"];
const ACCEPTED_EXTENSIONS = [".pdf", ".png", ".jpg", ".jpeg", ".webp"];
const DOCUMENT_CATEGORIES = ["Formation", "Tax", "Banking", "Address", "Credit", "Other"] as const;

const DEFAULT_ACTIVATION_STATE = {
  form1583: null,
  idOne: null,
  idTwo: null,
} as const;

type DocumentCategory = (typeof DOCUMENT_CATEGORIES)[number];
type ActivationDocKey = "form1583" | "idOne" | "idTwo";

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

type ActivationDocumentsState = Record<ActivationDocKey, File | null>;

type ActivationUploadFieldProps = {
  id: string;
  label: string;
  description: string;
  accept: string;
  file: File | null;
  onChange: (file: File | null) => void;
  inputKey: string;
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
    downloadUrl: "/api/documents/generate/address-certificate",
  },
  {
    id: "aibc-welcome-letter",
    fileName: "AIBC Welcome Letter.pdf",
    description: "A personal welcome from Ricky Kinney confirming your active business address",
    fileType: "application/pdf",
    fileSize: 384 * 1024,
    uploadedAt: "2024-02-20T14:30:00.000Z",
    category: "Other",
    fromAibc: true,
    downloadUrl: "/api/documents/generate/welcome-letter",
  },
  {
    id: "aibc-plan-summary",
    fileName: "Business Plus Plan Summary.pdf",
    description: "Snapshot of your Business Plus plan features, limits, and billing details.",
    fileType: "application/pdf",
    fileSize: 420 * 1024,
    uploadedAt: "2024-04-01T09:00:00.000Z",
    category: "Address",
    fromAibc: true,
    downloadUrl: "/api/documents/generate/plan-summary",
  },
  {
    id: "aibc-mail-authorization",
    fileName: "Mail Handling Authorization Letter.pdf",
    description: "Formal authorization confirming your business may receive mail at the AIBC address.",
    fileType: "application/pdf",
    fileSize: 360 * 1024,
    uploadedAt: "2024-04-02T09:00:00.000Z",
    category: "Address",
    fromAibc: true,
    downloadUrl: "/api/documents/generate/mail-authorization",
  },
  {
    id: "aibc-credit-reporting",
    fileName: "Business Credit Reporting Confirmation.pdf",
    description: "Confirmation that your plan payments are reported to business credit bureaus.",
    fileType: "application/pdf",
    fileSize: 340 * 1024,
    uploadedAt: "2024-04-03T09:00:00.000Z",
    category: "Credit",
    fromAibc: true,
    downloadUrl: "/api/documents/generate/credit-reporting",
  },
  {
    id: "aibc-member-id",
    fileName: "AIBC Member ID Card.pdf",
    description: "Your digital membership card with plan, address, and account ID details.",
    fileType: "application/pdf",
    fileSize: 220 * 1024,
    uploadedAt: "2024-04-04T09:00:00.000Z",
    category: "Other",
    fromAibc: true,
    downloadUrl: "/api/documents/generate/member-id",
  },
  {
    id: "aibc-form-1583",
    fileName: "Form 1583 Instructions.pdf",
    description: "Cover letter explaining how to complete and submit USPS Form 1583 for activation.",
    fileType: "application/pdf",
    fileSize: 300 * 1024,
    uploadedAt: "2024-04-05T09:00:00.000Z",
    category: "Address",
    fromAibc: true,
    downloadUrl: "/api/documents/generate/form-1583",
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
  const [addressStatus, setAddressStatusState] = useState<AddressStatus>("inactive");
  const [activationDocs, setActivationDocs] = useState<ActivationDocumentsState>({ ...DEFAULT_ACTIVATION_STATE });
  const [activationError, setActivationError] = useState<string | null>(null);
  const [activationSubmitting, setActivationSubmitting] = useState(false);
  const [activationInputResetKey, setActivationInputResetKey] = useState(0);

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
    if (typeof window === "undefined") return;
    setAddressStatusState(getAddressStatus());

    const handleStatusChange = (event: Event) => {
      if (event instanceof CustomEvent && event.detail) {
        setAddressStatusState(event.detail as AddressStatus);
        return;
      }
      setAddressStatusState(getAddressStatus());
    };

    const handleStorage = (event: StorageEvent) => {
      if (event.key === "aibc_address_status") {
        setAddressStatusState(getAddressStatus());
      }
    };

    window.addEventListener(ADDRESS_STATUS_EVENT, handleStatusChange as EventListener);
    window.addEventListener("storage", handleStorage);

    return () => {
      window.removeEventListener(ADDRESS_STATUS_EVENT, handleStatusChange as EventListener);
      window.removeEventListener("storage", handleStorage);
    };
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
    const input = document.getElementById("document-upload") as HTMLInputElement | null;
    if (input) {
      input.value = "";
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

  const handleActivationDocChange = (key: ActivationDocKey, file: File | null) => {
    setActivationError(null);

    if (!file) {
      setActivationDocs((prev) => ({ ...prev, [key]: null }));
      return;
    }

    if (file.size > MAX_FILE_BYTES) {
      setActivationError("Each file must be 10MB or less.");
      return;
    }

    const mimeType = (file.type || "").toLowerCase();
    const extension = file.name.substring(file.name.lastIndexOf(".")).toLowerCase();

    const isPdf = mimeType === "application/pdf" || extension === ".pdf";
    if (key === "form1583" && !isPdf) {
      setActivationError("Completed Form 1583 must be uploaded as a PDF.");
      return;
    }

    if (key !== "form1583") {
      const isMimeAllowed = ACCEPTED_TYPES.includes(mimeType);
      const isExtensionAllowed = ACCEPTED_EXTENSIONS.includes(extension);
      if (!isMimeAllowed && !isExtensionAllowed) {
        setActivationError("ID uploads must be PDF or image files (PNG, JPG, WEBP).");
        return;
      }
    }

    setActivationDocs((prev) => ({ ...prev, [key]: file }));
  };

  const handleActivationSubmit = async () => {
    if (!activationDocs.form1583 || !activationDocs.idOne || !activationDocs.idTwo) {
      setActivationError("Upload the Form 1583 and both IDs before submitting.");
      return;
    }

    setActivationSubmitting(true);
    setActivationError(null);

    try {
      const payload = {
        clientName: "Ricky Kinney",
        businessName: "AI Business Centers LLC",
        files: {
          form1583: activationDocs.form1583.name,
          idOne: activationDocs.idOne.name,
          idTwo: activationDocs.idTwo.name,
        },
      };

      const response = await fetch("/api/compliance/submit-activation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error("Unable to submit documents at this time.");
      }

      const data = await response.json();

      if (typeof window !== "undefined") {
        window.localStorage.setItem(
          ACTIVATION_STORAGE_KEY,
          JSON.stringify({ ...payload.files, submittedAt: new Date().toISOString() })
        );
      }

      setAddressStatus("pending_review");
      setAddressStatusState((data?.status as AddressStatus) || "pending_review");
      setActivationDocs({ ...DEFAULT_ACTIVATION_STATE });
      setActivationInputResetKey((prev) => prev + 1);
      setToastMessage("Documents submitted! We'll review and activate your address within 1-2 business days.");
    } catch (err) {
      console.error(err);
      setActivationError("There was an issue submitting your documents. Please try again.");
    } finally {
      setActivationSubmitting(false);
    }
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

      {toastMessage && (
        <div className="fixed top-6 right-6 rounded-2xl border border-teal-400/30 bg-black/70 text-teal-200 px-5 py-3 text-sm shadow-[0_10px_40px_rgba(0,0,0,0.45)]">
          {toastMessage}
        </div>
      )}

      {addressStatus !== "active" && (
        <section className="glass-card rounded-2xl border border-amber-500/30 bg-white/5 p-6 mb-8">
          <div className="flex flex-col gap-2 mb-6">
            <div className="flex items-center gap-3">
              <h2 className="text-white text-lg font-semibold">Address Activation Required</h2>
              <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-200 bg-amber-500/10 border border-amber-400/40 rounded-full px-3 py-0.5">
                Action Needed
              </span>
            </div>
            <p className="text-white/70 text-sm">
              Before your AIBC commercial address can be activated, you must submit a completed USPS Form 1583 and two valid government-issued photo IDs.
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-3">
            <ActivationUploadField
              id="activation-form1583"
              label="Completed Form 1583"
              description="PDF only — notarized, signed"
              accept=".pdf,application/pdf"
              file={activationDocs.form1583}
              onChange={(file) => handleActivationDocChange("form1583", file)}
              inputKey={`form1583-${activationInputResetKey}`}
            />
            <ActivationUploadField
              id="activation-id-one"
              label="ID #1 — Front"
              description="PDF or image (PNG, JPG, WEBP)"
              accept=".pdf,.png,.jpg,.jpeg,.webp"
              file={activationDocs.idOne}
              onChange={(file) => handleActivationDocChange("idOne", file)}
              inputKey={`idOne-${activationInputResetKey}`}
            />
            <ActivationUploadField
              id="activation-id-two"
              label="ID #2 — Front"
              description="PDF or image (PNG, JPG, WEBP)"
              accept=".pdf,.png,.jpg,.jpeg,.webp"
              file={activationDocs.idTwo}
              onChange={(file) => handleActivationDocChange("idTwo", file)}
              inputKey={`idTwo-${activationInputResetKey}`}
            />
          </div>

          {activationError && <p className="text-sm text-rose-300 mt-4">{activationError}</p>}

          <button
            onClick={handleActivationSubmit}
            disabled={activationSubmitting}
            className="mt-6 w-full rounded-xl bg-[#36EAEA]/90 px-4 py-3 text-sm font-semibold text-slate-900 hover:bg-[#36EAEA] disabled:opacity-60"
          >
            {activationSubmitting ? "Submitting..." : "Submit for Review"}
          </button>
        </section>
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
            <p className="text-white/60 text-sm">Important records we've issued for your business.</p>
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
              {doc.downloadUrl && (
                <a
                  href={doc.downloadUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-full border border-[#36EAEA]/50 text-[#36EAEA] px-4 py-2 text-xs font-semibold hover:bg-[#36EAEA]/10 transition"
                >
                  Download
                </a>
              )}
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

function ActivationUploadField({ id, label, description, accept, file, onChange, inputKey }: ActivationUploadFieldProps) {
  return (
    <div className="flex flex-col gap-2">
      <p className="text-sm font-semibold text-white">{label}</p>
      <label
        htmlFor={id}
        className="flex flex-1 cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-white/15 bg-white/5 p-6 text-center text-white/70 hover:border-[#36EAEA]/50 hover:text-white transition"
      >
        <UploadCloud className="h-8 w-8 text-[#36EAEA]" />
        <div>
          <p className="text-sm font-semibold text-white">
            {file ? file.name : "Drag & drop or click to browse"}
          </p>
          <p className="text-xs text-white/50">{description}</p>
        </div>
      </label>
      <input
        key={inputKey}
        id={id}
        type="file"
        accept={accept}
        className="hidden"
        onChange={(event: ChangeEvent<HTMLInputElement>) => onChange(event.target.files?.[0] || null)}
      />
    </div>
  );
}
