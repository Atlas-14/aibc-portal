"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowUpRight, FileText, Loader2, Mail, Package, ScanLine, Send, Trash2, X } from "lucide-react";

type MailStatus = "new" | "opened" | "scanned" | "forwarded" | "shredded" | string;
type FilterKey = "all" | "new" | "scanned" | "forwarded" | "shredded";
type SortKey = "date" | "type";
type ModalAction = "open" | "scan" | "forward" | "shred";

type MailItem = {
  id: string;
  sender: string;
  receivedAt: string;
  type: string;
  status: MailStatus;
  imageUrl: string | null;
  scanUrl: string | null;
  trackingNumber?: string;
  notes?: string;
};

type ForwardAddress = {
  fullName: string;
  company: string;
  address1: string;
  address2: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  shippingMethod?: string;
};

type MailResponse = {
  mailboxReady: boolean;
  message?: string;
  unreadCount: number;
  items: MailItem[];
  forwardAddress: ForwardAddress;
};

const FILTERS: Array<{ key: FilterKey; label: string }> = [
  { key: "all", label: "All" },
  { key: "new", label: "New" },
  { key: "scanned", label: "Scanned" },
  { key: "forwarded", label: "Forwarded" },
  { key: "shredded", label: "Shredded" },
];

const STATUS_STYLES: Record<string, string> = {
  new: "border-[#36EAEA]/30 bg-[#36EAEA]/10 text-[#7cf7f7]",
  opened: "border-emerald-400/25 bg-emerald-400/10 text-emerald-100",
  scanned: "border-teal-400/25 bg-teal-400/10 text-teal-100",
  forwarded: "border-blue-400/25 bg-blue-400/10 text-blue-100",
  shredded: "border-rose-400/25 bg-rose-400/10 text-rose-100",
};

const SHIPPING_METHODS = ["Standard", "Priority", "Express"];

function formatStatus(status: string) {
  return status.replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());
}

function statusMatches(filter: FilterKey, status: string) {
  if (filter === "all") return true;
  return status.toLowerCase().includes(filter);
}

function EmptyThumbnail({ type }: { type: string }) {
  const isPackage = type.toLowerCase().includes("package") || type.toLowerCase().includes("parcel");
  const Icon = isPackage ? Package : Mail;

  return (
    <div className="flex h-32 w-full items-center justify-center rounded-2xl border border-white/10 bg-white/[0.03] text-white/35">
      <Icon className="h-10 w-10" />
    </div>
  );
}

function ActionModal({
  action,
  item,
  forwardAddress,
  busy,
  error,
  onClose,
  onChangeForwardAddress,
  onConfirm,
}: {
  action: ModalAction;
  item: MailItem;
  forwardAddress: ForwardAddress;
  busy: boolean;
  error: string;
  onClose: () => void;
  onChangeForwardAddress: (patch: Partial<ForwardAddress>) => void;
  onConfirm: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#020811]/75 p-4 backdrop-blur-md">
      <div className="glass-card w-full max-w-2xl rounded-[2rem] border border-white/10 p-6 shadow-2xl">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-[#36EAEA]/70">Mail action</p>
            <h2 className="mt-1 text-2xl font-semibold text-white">
              {action === "open" && "Open & Scan Contents"}
              {action === "scan" && "Request Exterior Scan"}
              {action === "forward" && "Forward Mail Item"}
              {action === "shred" && "Shred Mail Item"}
            </h2>
            <p className="mt-2 text-sm text-white/60">{item.sender || "Unknown sender"} • {item.type}</p>
          </div>
          <button onClick={onClose} className="rounded-full border border-white/10 bg-white/5 p-2 text-white/60 transition hover:bg-white/10 hover:text-white">
            <X className="h-4 w-4" />
          </button>
        </div>

        {action === "forward" ? (
          <div className="space-y-4">
            <p className="text-sm text-white/70">Choose where this item should be shipped. Fields are pre-filled from the client address we could find on file.</p>
            <div className="grid gap-3 md:grid-cols-2">
              <input value={forwardAddress.fullName} onChange={(event) => onChangeForwardAddress({ fullName: event.target.value })} placeholder="Full name" className="glass-input rounded-2xl px-4 py-3 text-sm focus:outline-none" />
              <input value={forwardAddress.company} onChange={(event) => onChangeForwardAddress({ company: event.target.value })} placeholder="Company" className="glass-input rounded-2xl px-4 py-3 text-sm focus:outline-none" />
              <input value={forwardAddress.address1} onChange={(event) => onChangeForwardAddress({ address1: event.target.value })} placeholder="Address line 1" className="glass-input rounded-2xl px-4 py-3 text-sm focus:outline-none md:col-span-2" />
              <input value={forwardAddress.address2} onChange={(event) => onChangeForwardAddress({ address2: event.target.value })} placeholder="Address line 2" className="glass-input rounded-2xl px-4 py-3 text-sm focus:outline-none md:col-span-2" />
              <input value={forwardAddress.city} onChange={(event) => onChangeForwardAddress({ city: event.target.value })} placeholder="City" className="glass-input rounded-2xl px-4 py-3 text-sm focus:outline-none" />
              <input value={forwardAddress.state} onChange={(event) => onChangeForwardAddress({ state: event.target.value })} placeholder="State" className="glass-input rounded-2xl px-4 py-3 text-sm focus:outline-none" />
              <input value={forwardAddress.postalCode} onChange={(event) => onChangeForwardAddress({ postalCode: event.target.value })} placeholder="ZIP / Postal code" className="glass-input rounded-2xl px-4 py-3 text-sm focus:outline-none" />
              <input value={forwardAddress.country} onChange={(event) => onChangeForwardAddress({ country: event.target.value })} placeholder="Country" className="glass-input rounded-2xl px-4 py-3 text-sm focus:outline-none" />
              <select value={forwardAddress.shippingMethod || SHIPPING_METHODS[0]} onChange={(event) => onChangeForwardAddress({ shippingMethod: event.target.value })} className="glass-input rounded-2xl px-4 py-3 text-sm focus:outline-none md:col-span-2">
                {SHIPPING_METHODS.map((method) => (
                  <option key={method} value={method} className="bg-[#081624]">
                    {method}
                  </option>
                ))}
              </select>
            </div>
          </div>
        ) : (
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 text-sm text-white/75">
            {action === "open" && "We’ll request that this mail piece be opened and scanned so you can review the contents from your portal."}
            {action === "scan" && "We’ll request a scan for this mail item. If scan files are available, a download button will appear on the card."}
            {action === "shred" && "This cannot be undone. Once shredding is requested, the item should no longer be recoverable."}
          </div>
        )}

        {error ? <p className="mt-4 text-sm text-rose-300">{error}</p> : null}

        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button onClick={onClose} disabled={busy} className="rounded-2xl border border-white/10 px-4 py-3 text-sm text-white/70 transition hover:bg-white/5 hover:text-white disabled:opacity-50">
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={busy}
            className={`rounded-2xl px-5 py-3 text-sm font-semibold transition disabled:opacity-50 ${
              action === "shred"
                ? "bg-rose-500 text-white hover:bg-rose-400"
                : action === "forward"
                  ? "bg-blue-500 text-white hover:bg-blue-400"
                  : "bg-[#36EAEA] text-[#04111d] hover:bg-[#5cf5f5]"
            }`}
          >
            {busy ? (
              <span className="inline-flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Processing
              </span>
            ) : action === "shred" ? (
              "Confirm Shred"
            ) : action === "forward" ? (
              "Submit Forward Request"
            ) : action === "open" ? (
              "Open & Scan Contents"
            ) : (
              "Request Scan"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function MailPage() {
  const [items, setItems] = useState<MailItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [mailboxMessage, setMailboxMessage] = useState("");
  const [mailboxReady, setMailboxReady] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const [filter, setFilter] = useState<FilterKey>("all");
  const [sortKey, setSortKey] = useState<SortKey>("date");
  const [modalAction, setModalAction] = useState<ModalAction | null>(null);
  const [selectedItem, setSelectedItem] = useState<MailItem | null>(null);
  const [forwardAddress, setForwardAddress] = useState<ForwardAddress>({
    fullName: "",
    company: "",
    address1: "",
    address2: "",
    city: "",
    state: "",
    postalCode: "",
    country: "US",
    shippingMethod: SHIPPING_METHODS[0],
  });
  const [busyAction, setBusyAction] = useState<string | null>(null);
  const [modalError, setModalError] = useState("");

  useEffect(() => {
    let cancelled = false;

    const loadMail = async () => {
      try {
        const response = await fetch("/api/mail/items", { cache: "no-store" });
        const data = (await response.json()) as Partial<MailResponse> & { error?: string };

        if (!response.ok) {
          throw new Error(data.error || "Unable to load mail.");
        }

        if (cancelled) return;

        setItems(data.items || []);
        setUnreadCount(data.unreadCount || 0);
        setMailboxReady(data.mailboxReady ?? true);
        setMailboxMessage(data.message || "");
        if (data.forwardAddress) {
          setForwardAddress({
            ...data.forwardAddress,
            shippingMethod: data.forwardAddress.shippingMethod || SHIPPING_METHODS[0],
          });
        }
      } catch (loadError) {
        if (cancelled) return;
        setError(loadError instanceof Error ? loadError.message : "Unable to load mail.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadMail();
    return () => {
      cancelled = true;
    };
  }, []);

  const visibleItems = useMemo(() => {
    const filtered = items.filter((item) => statusMatches(filter, item.status));

    return [...filtered].sort((a, b) => {
      if (sortKey === "type") {
        return a.type.localeCompare(b.type);
      }
      return new Date(b.receivedAt || 0).getTime() - new Date(a.receivedAt || 0).getTime();
    });
  }, [filter, items, sortKey]);

  const openModal = (action: ModalAction, item: MailItem) => {
    setModalError("");
    setSelectedItem(item);
    setModalAction(action);
  };

  const closeModal = () => {
    setModalError("");
    setSelectedItem(null);
    setModalAction(null);
  };

  const updateItemStatus = (itemId: string, status: MailStatus) => {
    setItems((current) => current.map((item) => (item.id === itemId ? { ...item, status } : item)));
    setUnreadCount((current) => Math.max(0, status === "new" ? current : items.filter((item) => item.status === "new" && item.id !== itemId).length));
  };

  const submitAction = async () => {
    if (!modalAction || !selectedItem) return;

    const busyKey = `${selectedItem.id}:${modalAction}`;
    setBusyAction(busyKey);
    setModalError("");

    try {
      const response = await fetch(`/api/mail/${modalAction}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mailPieceId: selectedItem.id,
          ...(modalAction === "forward" ? { forwardAddress } : {}),
        }),
      });

      const data = (await response.json().catch(() => ({}))) as { error?: string };

      if (!response.ok) {
        throw new Error(data.error || "Unable to complete mail action.");
      }

      updateItemStatus(selectedItem.id, modalAction === "open" ? "opened" : modalAction === "scan" ? "scanned" : modalAction === "forward" ? "forwarded" : "shredded");
      closeModal();
    } catch (actionError) {
      setModalError(actionError instanceof Error ? actionError.message : "Unable to complete mail action.");
    } finally {
      setBusyAction(null);
    }
  };

  return (
    <div className="max-w-6xl p-6 lg:p-10">
      <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="mb-1 text-xs font-semibold uppercase tracking-[0.35em] text-[#36EAEA]">Mailbox</p>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-3xl font-bold text-white">Your Mail</h1>
            <span className="glass-pill px-3 py-1 text-xs font-semibold text-[#36EAEA]">
              {unreadCount} unread
            </span>
          </div>
          <p className="mt-2 text-sm text-white/60">Manage scans, forwards, and shredding from inside your portal.</p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="glass-card flex rounded-2xl border border-white/10 p-1">
            {FILTERS.map((option) => (
              <button
                key={option.key}
                onClick={() => setFilter(option.key)}
                className={`rounded-xl px-4 py-2 text-sm transition ${
                  filter === option.key ? "bg-white/10 text-white" : "text-white/55 hover:text-white"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>

          <select
            value={sortKey}
            onChange={(event) => setSortKey(event.target.value as SortKey)}
            className="glass-input rounded-2xl px-4 py-3 text-sm text-white focus:outline-none"
          >
            <option value="date" className="bg-[#081624]">Sort by: Date</option>
            <option value="type" className="bg-[#081624]">Sort by: Type</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center gap-3 text-sm text-white/60">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading mail...
        </div>
      ) : null}

      {!loading && error ? (
        <div className="glass-card rounded-3xl border border-rose-500/30 p-6 text-sm text-rose-200">{error}</div>
      ) : null}

      {!loading && !error && !mailboxReady ? (
        <div className="glass-card rounded-3xl border border-amber-500/30 p-6 text-sm text-amber-200">
          {mailboxMessage || "Your mailbox is being set up. Mail will appear here within 1 business day of your account activation."}
        </div>
      ) : null}

      {!loading && !error && mailboxReady && visibleItems.length === 0 ? (
        <div className="glass-card rounded-[2rem] border border-white/10 p-8">
          <div className="flex items-start gap-4 border-l-4 border-[#36EAEA]/60 pl-4">
            <Mail className="mt-0.5 h-6 w-6 text-[#36EAEA]" />
            <div>
              <p className="text-lg font-semibold text-white">No mail in this view yet</p>
              <p className="mt-2 text-sm leading-relaxed text-white/65">
                Your AIBC address is active and ready. As mail arrives, you’ll be able to open, scan, forward, and shred each item from here.
              </p>
            </div>
          </div>
        </div>
      ) : null}

      <div className="grid gap-4 xl:grid-cols-2">
        {visibleItems.map((item) => {
          const busy = Boolean(busyAction?.startsWith(`${item.id}:`));
          const statusClass = STATUS_STYLES[item.status] || "border-white/15 bg-white/5 text-white/75";

          return (
            <article key={item.id} className="glass-card overflow-hidden rounded-[2rem] border border-white/10 p-5 shadow-[0_20px_70px_rgba(4,13,26,0.3)]">
              <div className="grid gap-5 lg:grid-cols-[180px_minmax(0,1fr)]">
                <div>
                  {item.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={item.imageUrl} alt={item.sender || "Mail item"} className="h-32 w-full rounded-2xl object-cover" />
                  ) : (
                    <EmptyThumbnail type={item.type} />
                  )}
                </div>

                <div>
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="text-lg font-semibold text-white">{item.sender || "Unknown sender"}</p>
                      <p className="mt-1 text-sm text-white/55">
                        {item.receivedAt ? new Date(item.receivedAt).toLocaleDateString() : "Date unavailable"}
                      </p>
                    </div>
                    <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${statusClass}`}>
                      {formatStatus(item.status)}
                    </span>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2 text-xs text-white/65">
                    <span className="glass-pill px-3 py-1">{item.type}</span>
                    {item.trackingNumber ? <span className="glass-pill px-3 py-1">Tracking: {item.trackingNumber}</span> : null}
                  </div>

                  {item.notes ? <p className="mt-4 text-sm text-white/60">{item.notes}</p> : null}

                  <div className="mt-5 flex flex-wrap gap-2">
                    <button onClick={() => openModal("open", item)} disabled={busy} className="rounded-2xl border border-teal-400/30 bg-teal-400/10 px-4 py-2 text-sm font-semibold text-teal-100 transition hover:bg-teal-400/20 disabled:opacity-50">
                      <span className="inline-flex items-center gap-2"><FileText className="h-4 w-4" />Open & Scan Contents</span>
                    </button>
                    <button onClick={() => openModal("scan", item)} disabled={busy} className="rounded-2xl border border-cyan-400/30 bg-cyan-400/10 px-4 py-2 text-sm font-semibold text-cyan-100 transition hover:bg-cyan-400/20 disabled:opacity-50">
                      <span className="inline-flex items-center gap-2"><ScanLine className="h-4 w-4" />Scan</span>
                    </button>
                    <button onClick={() => openModal("forward", item)} disabled={busy} className="rounded-2xl border border-blue-400/30 bg-blue-500/10 px-4 py-2 text-sm font-semibold text-blue-100 transition hover:bg-blue-500/20 disabled:opacity-50">
                      <span className="inline-flex items-center gap-2"><Send className="h-4 w-4" />Forward</span>
                    </button>
                    <button onClick={() => openModal("shred", item)} disabled={busy} className="rounded-2xl border border-rose-400/30 bg-rose-500/10 px-4 py-2 text-sm font-semibold text-rose-100 transition hover:bg-rose-500/20 disabled:opacity-50">
                      <span className="inline-flex items-center gap-2"><Trash2 className="h-4 w-4" />Shred</span>
                    </button>
                    {item.scanUrl ? (
                      <a href={item.scanUrl} target="_blank" rel="noreferrer" className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/10">
                        <span className="inline-flex items-center gap-2"><ArrowUpRight className="h-4 w-4" />Download Scan</span>
                      </a>
                    ) : null}
                  </div>
                </div>
              </div>
            </article>
          );
        })}
      </div>

      {modalAction && selectedItem ? (
        <ActionModal
          action={modalAction}
          item={selectedItem}
          forwardAddress={forwardAddress}
          busy={busyAction === `${selectedItem.id}:${modalAction}`}
          error={modalError}
          onClose={closeModal}
          onChangeForwardAddress={(patch) => setForwardAddress((current) => ({ ...current, ...patch }))}
          onConfirm={submitAction}
        />
      ) : null}
    </div>
  );
}
