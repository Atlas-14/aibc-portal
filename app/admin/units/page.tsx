"use client";
import { useEffect, useState } from "react";
import { Package, DollarSign } from "lucide-react";

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
  available: { color: "bg-emerald-400/20 text-emerald-300 border-emerald-400/30", label: "Available" },
  assigned: { color: "bg-teal-400/20 text-teal-300 border-teal-400/30", label: "Sold" },
  reserved: { color: "bg-amber-400/20 text-amber-300 border-amber-400/30", label: "Reserved" },
};

export default function AdminUnits() {
  const [units, setUnits] = useState<Unit[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Unit | null>(null);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/units")
      .then(r => r.json())
      .then(data => { setUnits(data.units ?? []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(t);
  }, [toast]);

  const sold = units.filter(u => u.status === "assigned").length;
  const available = units.filter(u => u.status === "available").length;
  const revenue = sold * 250000;

  const saveUnit = async () => {
    if (!editing) return;
    setSaving(true);
    const res = await fetch(`/api/admin/units/${editing.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        status: editing.status,
        ownerName: editing.ownerName,
        ownerEmail: editing.ownerEmail,
        notes: editing.notes,
      }),
    });
    if (res.ok) {
      setUnits(prev => prev.map(u => u.id === editing.id ? editing : u));
      setToast("Unit updated");
      setEditing(null);
    }
    setSaving(false);
  };

  return (
    <div className="p-6 lg:p-10 max-w-5xl">
      {toast && (
        <div className="fixed top-6 right-6 z-50 bg-teal-400/20 border border-teal-400/30 text-teal-300 text-sm px-5 py-3 rounded-2xl shadow-xl">
          {toast}
        </div>
      )}

      <div className="mb-8">
        <p className="text-red-400 text-xs font-semibold uppercase tracking-widest mb-1">Admin</p>
        <h1 className="text-3xl font-bold text-white">Unit Inventory</h1>
        <p className="text-white/60 text-sm mt-1">Track all 22 deeded AI Business Center units.</p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="glass-card rounded-2xl border-white/10 p-5">
          <Package className="h-5 w-5 text-emerald-400 mb-3" />
          <div className="text-2xl font-bold text-white">{available}</div>
          <div className="text-white/60 text-xs">Available</div>
        </div>
        <div className="glass-card rounded-2xl border-white/10 p-5">
          <Package className="h-5 w-5 text-teal-400 mb-3" />
          <div className="text-2xl font-bold text-white">{sold}</div>
          <div className="text-white/60 text-xs">Sold</div>
        </div>
        <div className="glass-card rounded-2xl border-white/10 p-5">
          <DollarSign className="h-5 w-5 text-amber-400 mb-3" />
          <div className="text-2xl font-bold text-white">${(revenue / 1000000).toFixed(1)}M</div>
          <div className="text-white/60 text-xs">Revenue</div>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {Array.from({length: 22}).map((_, i) => <div key={i} className="h-24 rounded-2xl bg-white/5 animate-pulse" />)}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {units.map((unit) => {
            const cfg = STATUS_CONFIG[unit.status];
            return (
              <button
                key={unit.id}
                onClick={() => setEditing({ ...unit })}
                className={`p-4 rounded-2xl border text-left transition-all hover:scale-[1.02] ${cfg.color}`}
              >
                <p className="text-xs font-bold uppercase tracking-wider opacity-60 mb-1">Unit {unit.unitNumber}</p>
                <p className="font-semibold text-sm">{cfg.label}</p>
                {unit.ownerName && <p className="text-xs opacity-70 mt-1 truncate">{unit.ownerName}</p>}
                <p className="text-xs opacity-50 mt-1">$250K</p>
              </button>
            );
          })}
        </div>
      )}

      {/* Edit Modal */}
      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="glass-card rounded-3xl border-white/10 p-8 max-w-md w-full">
            <h2 className="text-white text-xl font-bold mb-6">Unit {editing.unitNumber}</h2>
            <div className="space-y-4">
              <div>
                <label className="text-xs text-white/50 uppercase tracking-wider block mb-2">Status</label>
                <select
                  value={editing.status}
                  onChange={(e) => setEditing({ ...editing, status: e.target.value as Unit["status"] })}
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white focus:outline-none"
                >
                  <option value="available">Available</option>
                  <option value="assigned">Sold</option>
                  <option value="reserved">Reserved</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-white/50 uppercase tracking-wider block mb-2">Owner Name</label>
                <input
                  type="text"
                  value={editing.ownerName ?? ""}
                  onChange={(e) => setEditing({ ...editing, ownerName: e.target.value })}
                  placeholder="Full name"
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-white/30 focus:outline-none"
                />
              </div>
              <div>
                <label className="text-xs text-white/50 uppercase tracking-wider block mb-2">Owner Email</label>
                <input
                  type="email"
                  value={editing.ownerEmail ?? ""}
                  onChange={(e) => setEditing({ ...editing, ownerEmail: e.target.value })}
                  placeholder="email@example.com"
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-white/30 focus:outline-none"
                />
              </div>
              <div>
                <label className="text-xs text-white/50 uppercase tracking-wider block mb-2">Notes</label>
                <textarea
                  rows={2}
                  value={editing.notes ?? ""}
                  onChange={(e) => setEditing({ ...editing, notes: e.target.value })}
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-white/30 focus:outline-none"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={saveUnit} disabled={saving} className="flex-1 py-3 rounded-2xl bg-[#36EAEA] text-[#040d1a] font-semibold text-sm hover:bg-[#2fd4d4] transition-all disabled:opacity-50">
                {saving ? "Saving..." : "Save Changes"}
              </button>
              <button onClick={() => setEditing(null)} className="flex-1 py-3 rounded-2xl border border-white/10 text-white/60 text-sm hover:bg-white/5 transition-all">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
