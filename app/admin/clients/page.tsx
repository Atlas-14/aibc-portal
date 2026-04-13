"use client";
import { useEffect, useState } from "react";
import { Users, Plus, Search, ChevronRight } from "lucide-react";
import Link from "next/link";

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
  createdAt: string;
};

const PLAN_COLORS: Record<string, string> = {
  essentials: "bg-sky-400/20 text-sky-300",
  plus: "bg-violet-400/20 text-violet-300",
  pro: "bg-amber-400/20 text-amber-300",
};

export default function AdminClients() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch("/api/admin/clients")
      .then(r => r.json())
      .then(data => { setClients(data.clients ?? []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const filtered = clients.filter(c =>
    c.fullName.toLowerCase().includes(search.toLowerCase()) ||
    c.businessName?.toLowerCase().includes(search.toLowerCase()) ||
    c.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 lg:p-10 max-w-5xl">
      <div className="mb-8 flex items-start justify-between">
        <div>
          <p className="text-red-400 text-xs font-semibold uppercase tracking-widest mb-1">Admin</p>
          <h1 className="text-3xl font-bold text-white">Clients</h1>
          <p className="text-white/60 text-sm mt-1">{clients.length} total members</p>
        </div>
        <Link
          href="/admin/clients/new"
          className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-[#36EAEA] text-[#040d1a] font-semibold text-sm hover:bg-[#2fd4d4] transition-all"
        >
          <Plus className="h-4 w-4" />
          Add Client
        </Link>
      </div>

      <div className="mb-5 relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30" />
        <input
          type="text"
          placeholder="Search by name, business, or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-11 pr-4 py-3 rounded-2xl border border-white/10 bg-white/5 text-sm text-white placeholder-white/30 focus:outline-none focus:border-white/20"
        />
      </div>

      {loading ? (
        <div className="space-y-3">{[1,2,3,4,5].map(i => <div key={i} className="h-20 rounded-2xl bg-white/5 animate-pulse" />)}</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20">
          <Users className="h-10 w-10 text-white/20 mx-auto mb-3" />
          <p className="text-white/40 mb-3">No clients found</p>
          <Link href="/admin/clients/new" className="text-sm text-teal-400 hover:text-teal-300">Add your first client →</Link>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((client) => (
            <Link
              key={client.id}
              href={`/admin/clients/${client.id}`}
              className="flex items-center justify-between p-5 glass-card rounded-2xl border-white/10 hover:border-teal-400/20 transition-all group"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-1">
                  <p className="text-white font-semibold">{client.fullName}</p>
                  <span className={`text-xs px-2.5 py-0.5 rounded-full font-semibold ${PLAN_COLORS[client.plan] ?? "bg-white/10 text-white/60"}`}>
                    {client.plan}
                  </span>
                  {client.creditAddon && (
                    <span className="text-xs px-2.5 py-0.5 rounded-full font-semibold bg-emerald-400/20 text-emerald-300">
                      Credit
                    </span>
                  )}
                  {client.unitOwner && (
                    <span className="text-xs px-2.5 py-0.5 rounded-full font-semibold bg-amber-400/20 text-amber-300">
                      Unit {client.unitNumber}
                    </span>
                  )}
                </div>
                <p className="text-white/60 text-sm">{client.businessName}</p>
                <p className="text-white/40 text-xs mt-0.5">{client.email} · Joined {new Date(client.createdAt).toLocaleDateString()}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${
                  client.status === "active" ? "bg-emerald-400/20 text-emerald-300" : "bg-amber-400/20 text-amber-300"
                }`}>
                  {client.status}
                </span>
                <ChevronRight className="h-4 w-4 text-white/20 group-hover:text-white/50 transition-colors" />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
