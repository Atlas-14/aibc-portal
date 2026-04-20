"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Plus, Search, Trash2, Users } from "lucide-react";
import {
  AdminPageHeader,
  ConfirmDialog,
  EmptyState,
  SortableHeader,
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
  mailboxId?: string | null;
  createdAt: string;
  lastActive?: string;
};

type SortKey = "fullName" | "plan" | "createdAt" | "status";

const PLAN_COLORS: Record<string, string> = {
  essentials: "border-sky-400/20 bg-sky-400/12 text-sky-200",
  plus: "border-violet-400/20 bg-violet-400/12 text-violet-200",
  pro: "border-amber-400/20 bg-amber-400/12 text-amber-200",
};

const STATUS_COLORS: Record<string, string> = {
  active: "border-emerald-400/20 bg-emerald-400/12 text-emerald-200",
  pending: "border-amber-400/20 bg-amber-400/12 text-amber-200",
  suspended: "border-red-400/20 bg-red-400/12 text-red-200",
};

export default function AdminClients() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [planFilter, setPlanFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortKey, setSortKey] = useState<SortKey>("createdAt");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [bulkStatus, setBulkStatus] = useState("active");
  const [deletingClient, setDeletingClient] = useState<Client | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    fetch("/api/admin/clients")
      .then((response) => response.json())
      .then((data) => {
        setClients(data.clients ?? []);
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
    setSortDirection(key === "createdAt" ? "desc" : "asc");
  };

  const filteredClients = useMemo(() => {
    const normalized = search.toLowerCase();
    const next = clients.filter((client) => {
      const matchesSearch =
        !normalized ||
        client.fullName.toLowerCase().includes(normalized) ||
        client.businessName?.toLowerCase().includes(normalized) ||
        client.email.toLowerCase().includes(normalized);
      const matchesPlan = planFilter === "all" || client.plan === planFilter;
      const matchesStatus = statusFilter === "all" || client.status === statusFilter;
      return matchesSearch && matchesPlan && matchesStatus;
    });

    return next.sort((a, b) => {
      const modifier = sortDirection === "asc" ? 1 : -1;
      const left = sortKey === "createdAt" ? new Date(a.createdAt).getTime() : String(a[sortKey] ?? "").toLowerCase();
      const right = sortKey === "createdAt" ? new Date(b.createdAt).getTime() : String(b[sortKey] ?? "").toLowerCase();
      if (left < right) return -1 * modifier;
      if (left > right) return 1 * modifier;
      return 0;
    });
  }, [clients, search, planFilter, statusFilter, sortKey, sortDirection]);

  const allSelected = filteredClients.length > 0 && filteredClients.every((client) => selectedIds.includes(client.id));

  const toggleSelected = (id: string) => {
    setSelectedIds((current) => (current.includes(id) ? current.filter((value) => value !== id) : [...current, id]));
  };

  const toggleAll = () => {
    setSelectedIds((current) => (allSelected ? current.filter((id) => !filteredClients.some((client) => client.id === id)) : Array.from(new Set([...current, ...filteredClients.map((client) => client.id)]))));
  };

  const applyBulkStatus = async () => {
    if (!selectedIds.length) return;
    setBusy(true);
    const response = await fetch("/api/admin/clients", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids: selectedIds, status: bulkStatus }),
    });

    if (response.ok) {
      setClients((current) =>
        current.map((client) => (selectedIds.includes(client.id) ? { ...client, status: bulkStatus, lastActive: new Date().toISOString() } : client)),
      );
      setSelectedIds([]);
      showAdminToast({ type: "success", title: "Clients updated", message: `Applied ${bulkStatus} to ${selectedIds.length} client${selectedIds.length === 1 ? "" : "s"}.` });
    } else {
      showAdminToast({ type: "error", title: "Bulk update failed", message: "Please try again." });
    }
    setBusy(false);
  };

  const deleteClient = async () => {
    if (!deletingClient) return;
    setBusy(true);
    const response = await fetch(`/api/admin/clients/${deletingClient.id}`, { method: "DELETE" });
    if (response.ok) {
      setClients((current) => current.filter((client) => client.id !== deletingClient.id));
      showAdminToast({ type: "success", title: "Client deleted", message: `${deletingClient.fullName} was removed.` });
      setDeletingClient(null);
    } else {
      showAdminToast({ type: "error", title: "Delete failed", message: "This client could not be removed." });
    }
    setBusy(false);
  };

  return (
    <div className="mx-auto max-w-7xl p-6 lg:p-10">
      <AdminPageHeader
        title="Clients"
        description={`${clients.length} member records, filters, bulk actions, and fast account management.`}
        breadcrumbs={[{ label: "Admin", href: "/admin" }, { label: "Clients" }]}
        action={
          <Link
            href="/admin/clients/new"
            className="inline-flex items-center gap-2 rounded-2xl bg-[#36EAEA] px-5 py-3 text-sm font-semibold text-[#040d1a] transition hover:bg-[#5cf5f5]"
          >
            <Plus className="h-4 w-4" />
            Add Client
          </Link>
        }
      />

      <div className="mb-6 grid gap-4 rounded-[2rem] border border-white/10 bg-white/[0.04] p-4 lg:grid-cols-[1.6fr_repeat(2,minmax(0,0.7fr))_auto]">
        <div className="relative">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" />
          <input
            type="text"
            placeholder="Search by name, business, or email"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="w-full rounded-2xl border border-white/10 bg-white/5 py-3 pl-11 pr-4 text-sm text-white placeholder:text-white/30 focus:border-[#36EAEA]/40 focus:outline-none"
          />
        </div>
        <select value={planFilter} onChange={(event) => setPlanFilter(event.target.value)} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white focus:border-[#36EAEA]/40 focus:outline-none">
          <option value="all">All plans</option>
          <option value="essentials">Essentials</option>
          <option value="plus">Plus</option>
          <option value="pro">Pro</option>
        </select>
        <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white focus:border-[#36EAEA]/40 focus:outline-none">
          <option value="all">All statuses</option>
          <option value="active">Active</option>
          <option value="pending">Pending</option>
          <option value="suspended">Suspended</option>
        </select>
        <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
          <input type="checkbox" checked={allSelected} onChange={toggleAll} className="h-4 w-4 rounded border-white/20 bg-transparent" />
          <span className="text-sm text-white/60">Select page</span>
        </div>
      </div>

      {selectedIds.length ? (
        <div className="mb-6 flex flex-col gap-3 rounded-[1.75rem] border border-[#36EAEA]/20 bg-[#36EAEA]/10 p-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm font-semibold text-white">{selectedIds.length} clients selected</p>
            <p className="text-xs text-white/55">Apply a bulk status change without leaving the page.</p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <select value={bulkStatus} onChange={(event) => setBulkStatus(event.target.value)} className="rounded-2xl border border-white/10 bg-[#071423] px-4 py-3 text-sm text-white focus:outline-none">
              <option value="active">Active</option>
              <option value="pending">Pending</option>
              <option value="suspended">Suspended</option>
            </select>
            <button onClick={applyBulkStatus} disabled={busy} className="rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-[#040d1a] transition hover:bg-[#dffefe] disabled:opacity-50">
              Update status
            </button>
          </div>
        </div>
      ) : null}

      <div className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-3">
        <div className="hidden grid-cols-[48px_1.4fr_0.8fr_0.8fr_0.7fr_80px] items-center gap-4 px-4 py-3 lg:grid">
          <div />
          <SortableHeader label="Name" active={sortKey === "fullName"} direction={sortDirection} onClick={() => setSort("fullName")} />
          <SortableHeader label="Plan" active={sortKey === "plan"} direction={sortDirection} onClick={() => setSort("plan")} />
          <SortableHeader label="Date joined" active={sortKey === "createdAt"} direction={sortDirection} onClick={() => setSort("createdAt")} />
          <SortableHeader label="Status" active={sortKey === "status"} direction={sortDirection} onClick={() => setSort("status")} />
          <div />
        </div>

        {loading ? (
          <div className="space-y-3 p-2">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="h-24 animate-pulse rounded-[1.5rem] border border-white/8 bg-white/5" />
            ))}
          </div>
        ) : filteredClients.length === 0 ? (
          <EmptyState
            icon={<Users className="h-6 w-6" />}
            title="No clients found"
            description="Try widening your filters or add a new client to start managing accounts from here."
            action={
              <Link href="/admin/clients/new" className="inline-flex rounded-2xl border border-[#36EAEA]/30 bg-[#36EAEA]/12 px-4 py-2 text-sm font-medium text-[#8ef8f8] transition hover:bg-[#36EAEA]/18">
                Add client
              </Link>
            }
          />
        ) : (
          <div className="space-y-3 p-2">
            {filteredClients.map((client) => (
              <div key={client.id} className="grid gap-4 rounded-[1.75rem] border border-white/8 bg-white/[0.035] p-4 transition hover:border-[#36EAEA]/20 hover:bg-white/[0.05] lg:grid-cols-[48px_1.4fr_0.8fr_0.8fr_0.7fr_80px] lg:items-center">
                <div className="flex items-center justify-center">
                  <input checked={selectedIds.includes(client.id)} onChange={() => toggleSelected(client.id)} type="checkbox" className="h-4 w-4 rounded border-white/20 bg-transparent" />
                </div>
                <Link href={`/admin/clients/${client.id}`} className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="truncate text-base font-semibold text-white">{client.fullName}</p>
                    {client.creditAddon ? <span className="rounded-full border border-emerald-400/20 bg-emerald-400/12 px-2 py-0.5 text-[11px] font-semibold text-emerald-200">Credit</span> : null}
                    {client.unitOwner ? <span className="rounded-full border border-amber-400/20 bg-amber-400/12 px-2 py-0.5 text-[11px] font-semibold text-amber-200">Unit {client.unitNumber ?? "—"}</span> : null}
                  </div>
                  <p className="mt-1 truncate text-sm text-white/55">{client.businessName || "No business name"}</p>
                  <p className="mt-1 truncate text-xs text-white/35">{client.email}</p>
                  <p className="mt-2 text-xs text-white/35">Last active {new Date(client.lastActive ?? client.createdAt).toLocaleString()}</p>
                </Link>
                <div>
                  <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold capitalize ${PLAN_COLORS[client.plan] ?? "border-white/15 bg-white/5 text-white/70"}`}>
                    {client.plan}
                  </span>
                </div>
                <div className="text-sm text-white/60">{new Date(client.createdAt).toLocaleDateString()}</div>
                <div>
                  <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold capitalize ${STATUS_COLORS[client.status] ?? "border-white/15 bg-white/5 text-white/70"}`}>
                    {client.status}
                  </span>
                </div>
                <div className="flex items-center justify-end gap-2">
                  <button onClick={() => setDeletingClient(client)} className="rounded-xl border border-red-400/15 bg-red-400/10 p-2 text-red-200 transition hover:bg-red-400/20" aria-label={`Delete ${client.fullName}`}>
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <ConfirmDialog
        open={Boolean(deletingClient)}
        title="Delete client?"
        description="Are you sure? This cannot be undone. The client record and related admin data will be removed."
        confirmLabel="Delete client"
        busy={busy}
        onCancel={() => setDeletingClient(null)}
        onConfirm={deleteClient}
      />
    </div>
  );
}
