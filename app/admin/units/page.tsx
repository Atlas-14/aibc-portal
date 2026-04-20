"use client";

import { useEffect, useMemo, useState } from "react";
import { DollarSign, Package } from "lucide-react";
import { AdminPageHeader, EmptyState, showAdminToast } from "@/components/admin/AdminPrimitives";

type Unit = {
  id: string;
  unitNumber: number;
  status: "available" | "assigned" | "reserved";
  ownerName: string | null;
  ownerEmail: string | null;
  salePrice: number;
  downPayment: number;
  financingTermMonths: number;
  notes: string | null;
  assignedAt: string | null;
};

const STATUS_CONFIG = {
  available: {
    label: "Available",
    card: "border-emerald-400/25 bg-emerald-400/12 text-emerald-100",
  },
  assigned: {
    label: "Assigned",
    card: "border-[#36EAEA]/25 bg-[#36EAEA]/12 text-[#b7ffff]",
  },
  reserved: {
    label: "Reserved",
    card: "border-amber-400/25 bg-amber-400/12 text-amber-100",
  },
};

export default function AdminUnits() {
  const [units, setUnits] = useState<Unit[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Unit | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/admin/units")
      .then((response) => response.json())
      .then((data) => {
        setUnits(data.units ?? []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const totals = useMemo(() => {
    const available = units.filter((unit) => unit.status === "available").length;
    const assigned = units.filter((unit) => unit.status === "assigned").length;
    const reserved = units.filter((unit) => unit.status === "reserved").length;
    const committed = units
      .filter((unit) => unit.status === "assigned")
      .reduce((sum, unit) => sum + Number(unit.salePrice ?? 250000), 0);
    return { available, assigned, reserved, committed };
  }, [units]);

  const saveUnit = async () => {
    if (!editing) return;
    setSaving(true);
    const response = await fetch(`/api/admin/units/${editing.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        status: editing.status,
        ownerName: editing.ownerName,
        ownerEmail: editing.ownerEmail,
        notes: editing.notes,
      }),
    });

    if (response.ok) {
      setUnits((current) => current.map((unit) => (unit.id === editing.id ? editing : unit)));
      showAdminToast({ type: "success", title: "Unit updated", message: `Unit ${editing.unitNumber} changes saved.` });
      setEditing(null);
    } else {
      showAdminToast({ type: "error", title: "Save failed", message: "Please try again." });
    }
    setSaving(false);
  };

  return (
    <div className="mx-auto max-w-7xl p-6 lg:p-10">
      <AdminPageHeader
        title="Unit Inventory"
        description="Track inventory, ownership, and committed revenue across all deeded units."
        breadcrumbs={[{ label: "Admin", href: "/admin" }, { label: "Units" }]}
      />

      <div className="mb-8 grid gap-4 md:grid-cols-4">
        <div className="rounded-[2rem] border border-emerald-400/20 bg-emerald-400/10 p-5">
          <Package className="h-5 w-5 text-emerald-200" />
          <p className="mt-4 text-3xl font-semibold text-white">{totals.available}</p>
          <p className="mt-1 text-sm text-white/55">Available units</p>
        </div>
        <div className="rounded-[2rem] border border-[#36EAEA]/20 bg-[#36EAEA]/10 p-5">
          <Package className="h-5 w-5 text-[#b7ffff]" />
          <p className="mt-4 text-3xl font-semibold text-white">{totals.assigned}</p>
          <p className="mt-1 text-sm text-white/55">Assigned units</p>
        </div>
        <div className="rounded-[2rem] border border-amber-400/20 bg-amber-400/10 p-5">
          <Package className="h-5 w-5 text-amber-100" />
          <p className="mt-4 text-3xl font-semibold text-white">{totals.reserved}</p>
          <p className="mt-1 text-sm text-white/55">Reserved units</p>
        </div>
        <div className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-5">
          <DollarSign className="h-5 w-5 text-white/60" />
          <p className="mt-4 text-3xl font-semibold text-white">${totals.committed.toLocaleString()}</p>
          <p className="mt-1 text-sm text-white/55">total committed</p>
        </div>
      </div>

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, index) => (
            <div key={index} className="h-44 animate-pulse rounded-[2rem] border border-white/8 bg-white/5" />
          ))}
        </div>
      ) : units.length === 0 ? (
        <EmptyState icon={<Package className="h-6 w-6" />} title="No units found" description="Add unit inventory records and they will appear here with status color coding and owner details." />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {units.map((unit) => {
            const config = STATUS_CONFIG[unit.status];
            return (
              <button
                key={unit.id}
                onClick={() => setEditing({ ...unit })}
                className={`group rounded-[2rem] border p-5 text-left transition hover:-translate-y-0.5 hover:shadow-[0_12px_40px_rgba(0,0,0,0.25)] ${config.card}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs uppercase tracking-[0.3em] text-white/50">Unit</p>
                    <p className="mt-2 text-5xl font-bold text-white">{unit.unitNumber}</p>
                  </div>
                  <span className="rounded-full border border-white/10 px-3 py-1 text-xs font-semibold">{config.label}</span>
                </div>
                <div className="mt-6 space-y-2 text-sm text-white/70">
                  <p>{unit.ownerName || "No owner assigned"}</p>
                  <p>{unit.ownerEmail || "No email on file"}</p>
                  <p>${Number(unit.salePrice ?? 250000).toLocaleString()} sale price</p>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {editing ? (
        <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/70 p-4 backdrop-blur-md">
          <div className="w-full max-w-lg rounded-[2rem] border border-white/10 bg-[#081322]/95 p-6 shadow-2xl">
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-white/35">Unit Editor</p>
                <h2 className="mt-2 text-3xl font-semibold text-white">Unit {editing.unitNumber}</h2>
              </div>
              <button onClick={() => setEditing(null)} className="rounded-xl border border-white/10 px-3 py-2 text-sm text-white/60 transition hover:bg-white/5 hover:text-white">Close</button>
            </div>
            <div className="space-y-4">
              <select value={editing.status} onChange={(event) => setEditing({ ...editing, status: event.target.value as Unit["status"] })} className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white focus:outline-none">
                <option value="available">Available</option>
                <option value="assigned">Assigned</option>
                <option value="reserved">Reserved</option>
              </select>
              <input value={editing.ownerName ?? ""} onChange={(event) => setEditing({ ...editing, ownerName: event.target.value })} placeholder="Owner name" className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/30 focus:outline-none" />
              <input value={editing.ownerEmail ?? ""} onChange={(event) => setEditing({ ...editing, ownerEmail: event.target.value })} placeholder="Owner email" className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/30 focus:outline-none" />
              <textarea value={editing.notes ?? ""} onChange={(event) => setEditing({ ...editing, notes: event.target.value })} rows={4} placeholder="Notes" className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/30 focus:outline-none" />
            </div>
            <div className="mt-6 flex gap-3">
              <button onClick={saveUnit} disabled={saving} className="flex-1 rounded-2xl bg-[#36EAEA] px-4 py-3 text-sm font-semibold text-[#040d1a] transition hover:bg-[#5cf5f5] disabled:opacity-50">{saving ? "Saving..." : "Save changes"}</button>
              <button onClick={() => setEditing(null)} className="flex-1 rounded-2xl border border-white/10 px-4 py-3 text-sm text-white/70 transition hover:bg-white/5 hover:text-white">Cancel</button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
