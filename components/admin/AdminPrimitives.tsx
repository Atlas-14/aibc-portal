"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ReactNode, useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  ArrowLeft,
  ArrowUpDown,
  CheckCircle2,
  ChevronRight,
  Search,
  X,
} from "lucide-react";

type ToastType = "success" | "error";

type ToastItem = {
  id: string;
  title: string;
  message?: string;
  type: ToastType;
};

type AdminToastEvent = CustomEvent<Omit<ToastItem, "id">>;

const breadcrumbLabels: Record<string, string> = {
  admin: "Admin",
  clients: "Clients",
  submissions: "Submissions",
  documents: "Documents",
  units: "Units",
  settings: "Settings",
  credit: "Credit Scores",
  tradelines: "Trade Lines",
  new: "New Client",
};

export function showAdminToast(payload: Omit<ToastItem, "id">) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent("admin-toast", { detail: payload }));
}

export function AdminToastViewport() {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  useEffect(() => {
    const handler = (event: Event) => {
      const detail = (event as AdminToastEvent).detail;
      const toast = { ...detail, id: crypto.randomUUID() };
      setToasts((current) => [...current, toast]);
      window.setTimeout(() => {
        setToasts((current) => current.filter((item) => item.id !== toast.id));
      }, 3500);
    };

    window.addEventListener("admin-toast", handler as EventListener);
    return () => window.removeEventListener("admin-toast", handler as EventListener);
  }, []);

  return (
    <div className="pointer-events-none fixed right-4 top-4 z-[100] flex w-full max-w-sm flex-col gap-3 sm:right-6 sm:top-6">
      {toasts.map((toast) => {
        const success = toast.type === "success";
        return (
          <div
            key={toast.id}
            className={`pointer-events-auto rounded-3xl border px-5 py-4 shadow-2xl backdrop-blur-2xl ${
              success
                ? "border-emerald-400/30 bg-emerald-400/12 text-emerald-100"
                : "border-red-400/30 bg-red-400/12 text-red-100"
            }`}
          >
            <div className="flex items-start gap-3">
              {success ? (
                <CheckCircle2 className="mt-0.5 h-5 w-5 text-emerald-300" />
              ) : (
                <AlertTriangle className="mt-0.5 h-5 w-5 text-red-300" />
              )}
              <div>
                <p className="text-sm font-semibold text-white">{toast.title}</p>
                {toast.message ? <p className="mt-1 text-xs text-white/70">{toast.message}</p> : null}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function AdminSearchBar() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Array<{ id: string; fullName: string; email: string; businessName?: string }>>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setOpen(false);
      return;
    }

    const controller = new AbortController();
    const timeout = window.setTimeout(async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/admin/clients?search=${encodeURIComponent(query)}`, { signal: controller.signal });
        const data = await response.json();
        setResults(data.clients ?? []);
        setOpen(true);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 180);

    return () => {
      controller.abort();
      window.clearTimeout(timeout);
    };
  }, [query]);

  const submitFirst = () => {
    const first = results[0];
    if (!first) return;
    router.push(`/admin/clients/${first.id}`);
    setQuery("");
    setOpen(false);
  };

  return (
    <div className="relative w-full max-w-xl">
      <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" />
      <input
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            event.preventDefault();
            submitFirst();
          }
          if (event.key === "Escape") {
            setOpen(false);
          }
        }}
        onBlur={() => window.setTimeout(() => setOpen(false), 120)}
        onFocus={() => {
          if (results.length) setOpen(true);
        }}
        placeholder="Search clients by name or email"
        className="w-full rounded-2xl border border-white/10 bg-white/5 py-3 pl-11 pr-4 text-sm text-white placeholder:text-white/30 focus:border-[#36EAEA]/40 focus:outline-none"
      />
      {open ? (
        <div className="absolute inset-x-0 top-[calc(100%+0.75rem)] overflow-hidden rounded-3xl border border-white/10 bg-[#071423]/95 shadow-2xl backdrop-blur-2xl">
          {loading ? (
            <div className="p-4 text-sm text-white/50">Searching…</div>
          ) : results.length ? (
            <div className="p-2">
              {results.slice(0, 6).map((result) => (
                <button
                  key={result.id}
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => {
                    router.push(`/admin/clients/${result.id}`);
                    setQuery("");
                    setOpen(false);
                  }}
                  className="flex w-full items-center justify-between rounded-2xl px-3 py-3 text-left transition hover:bg-white/6"
                >
                  <div>
                    <p className="text-sm font-medium text-white">{result.fullName}</p>
                    <p className="text-xs text-white/45">{result.email}{result.businessName ? ` • ${result.businessName}` : ""}</p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-white/25" />
                </button>
              ))}
            </div>
          ) : (
            <div className="p-4 text-sm text-white/50">No clients matched your search.</div>
          )}
        </div>
      ) : null}
    </div>
  );
}

export function AdminBreadcrumbs({ items }: { items?: Array<{ label: string; href?: string }> }) {
  const pathname = usePathname();
  const inferred = useMemo(() => {
    const segments = pathname.split("/").filter(Boolean);
    return segments.map((segment, index) => {
      const href = `/${segments.slice(0, index + 1).join("/")}`;
      return {
        href,
        label: breadcrumbLabels[segment] ?? decodeURIComponent(segment),
      };
    });
  }, [pathname]);

  const parts = items && items.length ? items : inferred;

  return (
    <div className="flex flex-wrap items-center gap-2 text-xs text-white/40">
      {parts.map((item, index) => {
        const last = index === parts.length - 1;
        return (
          <div key={`${item.label}-${index}`} className="flex items-center gap-2">
            {index > 0 ? <ChevronRight className="h-3.5 w-3.5 text-white/20" /> : null}
            {item.href && !last ? (
              <Link href={item.href} className="transition hover:text-white/75">
                {item.label}
              </Link>
            ) : (
              <span className={last ? "text-white/70" : ""}>{item.label}</span>
            )}
          </div>
        );
      })}
    </div>
  );
}

export function AdminPageHeader({
  eyebrow = "Admin",
  title,
  description,
  action,
  breadcrumbs,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: ReactNode;
  breadcrumbs?: Array<{ label: string; href?: string }>;
}) {
  return (
    <div className="mb-8 space-y-4">
      <AdminBreadcrumbs items={breadcrumbs} />
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="mb-1 text-xs font-semibold uppercase tracking-[0.35em] text-[#36EAEA]/65">{eyebrow}</p>
          <h1 className="text-3xl font-bold text-white sm:text-4xl">{title}</h1>
          {description ? <p className="mt-2 text-sm text-white/55">{description}</p> : null}
        </div>
        {action ? <div className="flex items-center gap-3">{action}</div> : null}
      </div>
    </div>
  );
}

export function BackLink({ href, label = "Back" }: { href: string; label?: string }) {
  return (
    <Link
      href={href}
      className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/65 transition hover:border-white/20 hover:bg-white/8 hover:text-white"
    >
      <ArrowLeft className="h-4 w-4" />
      {label}
    </Link>
  );
}

export function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon?: ReactNode;
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="rounded-[2rem] border border-dashed border-white/10 bg-white/[0.03] px-6 py-14 text-center">
      <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-white/35">
        {icon}
      </div>
      <h3 className="text-lg font-semibold text-white">{title}</h3>
      <p className="mx-auto mt-2 max-w-md text-sm text-white/45">{description}</p>
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}

export function LoadingCard({ className = "h-24" }: { className?: string }) {
  return <div className={`animate-pulse rounded-[1.75rem] border border-white/8 bg-white/5 ${className}`} />;
}

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = "Confirm",
  tone = "danger",
  busy,
  onCancel,
  onConfirm,
}: {
  open: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  tone?: "danger" | "primary";
  busy?: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/65 p-4 backdrop-blur-md">
      <div className="w-full max-w-md rounded-[2rem] border border-white/10 bg-[#081322]/90 p-6 shadow-2xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-xl font-semibold text-white">{title}</h3>
            <p className="mt-2 text-sm text-white/55">{description}</p>
          </div>
          <button onClick={onCancel} className="rounded-xl p-2 text-white/40 transition hover:bg-white/5 hover:text-white/70">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="mt-6 flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 rounded-2xl border border-white/10 px-4 py-3 text-sm text-white/70 transition hover:bg-white/5 hover:text-white"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={busy}
            className={`flex-1 rounded-2xl px-4 py-3 text-sm font-semibold transition disabled:opacity-50 ${
              tone === "danger"
                ? "bg-red-400/15 text-red-200 hover:bg-red-400/25"
                : "bg-[#36EAEA]/90 text-[#040d1a] hover:bg-[#36EAEA]"
            }`}
          >
            {busy ? "Working..." : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

export function SortableHeader({
  label,
  active,
  direction,
  onClick,
  align = "left",
}: {
  label: string;
  active: boolean;
  direction: "asc" | "desc";
  onClick: () => void;
  align?: "left" | "right";
}) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.25em] text-white/45 transition hover:text-white ${
        align === "right" ? "ml-auto" : ""
      }`}
    >
      {label}
      <ArrowUpDown className={`h-3.5 w-3.5 ${active ? "text-[#36EAEA]" : "text-white/25"} ${active && direction === "desc" ? "rotate-180" : ""} transition-transform`} />
    </button>
  );
}
