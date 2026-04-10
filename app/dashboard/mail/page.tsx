"use client";
import { useEffect, useState } from "react";
import { Mail, Loader2 } from "lucide-react";

type MailItem = {
  id: string;
  sender?: string;
  received_at?: string;
  status?: string;
  scan_url?: string;
};

const ACTION_BUTTONS = [
  { action: "scan", label: "Open & Scan", color: "bg-[#36EAEA]/10 text-[#36EAEA] border-[#36EAEA]/20 hover:bg-[#36EAEA]/20" },
  { action: "forward", label: "Forward", color: "bg-violet-500/10 text-violet-300 border-violet-500/20 hover:bg-violet-500/20" },
  { action: "shred", label: "Shred", color: "bg-rose-500/10 text-rose-300 border-rose-500/20 hover:bg-rose-500/20" },
  { action: "recycle", label: "Recycle", color: "bg-emerald-500/10 text-emerald-300 border-emerald-500/20 hover:bg-emerald-500/20" },
];

export default function MailPage() {
  const [items, setItems] = useState<MailItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [acting, setActing] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/mail")
      .then((r) => r.json())
      .then((d) => { setItems(d.items || []); setLoading(false); })
      .catch(() => { setError("Unable to load mail. Mailbox not yet connected."); setLoading(false); });
  }, []);

  const handleAction = async (itemId: string, action: string) => {
    setActing(`${itemId}-${action}`);
    try {
      await fetch(`/api/mail/${itemId}/${action}`, { method: "POST" });
      setItems((prev) => prev.map((i) => i.id === itemId ? { ...i, status: action + "_requested" } : i));
    } catch {
      alert("Request failed. Please try again.");
    } finally {
      setActing(null);
    }
  };

  return (
    <div className="p-6 lg:p-10 max-w-4xl">
      <div className="mb-8">
        <p className="text-[#36EAEA] text-xs font-semibold uppercase tracking-widest mb-1">Mailbox</p>
        <h1 className="text-2xl font-bold text-white">Your Mail</h1>
        <p className="text-[#E6E9ED]/50 text-sm mt-1">All incoming mail items at your AIBC address.</p>
      </div>

      {loading && (
        <div className="flex items-center gap-3 text-[#E6E9ED]/50 text-sm">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading mail...
        </div>
      )}

      {error && (
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-5 text-amber-300 text-sm">
          {error}
        </div>
      )}

      {!loading && !error && items.length === 0 && (
        <div className="bg-[#0D2A4A] border border-[#36EAEA]/10 rounded-xl p-10 text-center">
          <Mail className="h-10 w-10 text-[#36EAEA]/30 mx-auto mb-3" />
          <p className="text-[#E6E9ED]/60 text-sm">No mail items yet. New items will appear here as they arrive.</p>
        </div>
      )}

      <div className="space-y-3">
        {items.map((item) => (
          <div key={item.id} className="bg-[#0D2A4A] border border-[#36EAEA]/10 rounded-xl p-5">
            <div className="flex items-start justify-between mb-3">
              <div>
                <p className="text-white font-semibold text-sm">{item.sender || "Unknown Sender"}</p>
                <p className="text-[#E6E9ED]/40 text-xs mt-0.5">
                  Received: {item.received_at ? new Date(item.received_at).toLocaleDateString() : "—"}
                </p>
              </div>
              <span className="text-xs text-[#36EAEA]/60 bg-[#36EAEA]/5 border border-[#36EAEA]/15 rounded-full px-3 py-0.5">
                {item.status || "new"}
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {ACTION_BUTTONS.map(({ action, label, color }) => (
                <button
                  key={action}
                  onClick={() => handleAction(item.id, action)}
                  disabled={!!acting}
                  className={`text-xs border rounded-lg px-3 py-1.5 transition-colors ${color} disabled:opacity-50`}
                >
                  {acting === `${item.id}-${action}` ? "..." : label}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
