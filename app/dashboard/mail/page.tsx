"use client";
import { useEffect, useRef, useState } from "react";
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
  const [scanFeedback, setScanFeedback] = useState<{ id: string; visible: boolean } | null>(null);
  const feedbackTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const feedbackHideTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    fetch("/api/mail")
      .then((r) => r.json())
      .then((d) => {
        setItems(d.items || []);
        setLoading(false);
      })
      .catch(() => {
        setError("Unable to load mail. Mailbox not yet connected.");
        setLoading(false);
      });

    return () => {
      if (feedbackTimeoutRef.current) clearTimeout(feedbackTimeoutRef.current);
      if (feedbackHideTimeoutRef.current) clearTimeout(feedbackHideTimeoutRef.current);
    };
  }, []);

  const handleAction = async (itemId: string, action: string) => {
    setActing(`${itemId}-${action}`);
    try {
      await fetch(`/api/mail/${itemId}/${action}`, { method: "POST" });
      setItems((prev) => prev.map((i) => (i.id === itemId ? { ...i, status: action + "_requested" } : i)));
      if (action === "scan") {
        if (feedbackTimeoutRef.current) clearTimeout(feedbackTimeoutRef.current);
        if (feedbackHideTimeoutRef.current) clearTimeout(feedbackHideTimeoutRef.current);
        setScanFeedback({ id: itemId, visible: true });
        feedbackTimeoutRef.current = setTimeout(() => {
          setScanFeedback((prev) => (prev && prev.id === itemId ? { ...prev, visible: false } : prev));
          feedbackHideTimeoutRef.current = setTimeout(() => setScanFeedback((prev) => (prev && prev.id === itemId ? null : prev)), 300);
        }, 3000);
      }
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
        <h1 className="text-3xl font-bold text-white">Your Mail</h1>
        <p className="text-white/60 text-sm mt-1">All incoming mail items at your AIBC address.</p>
      </div>

      {loading && (
        <div className="flex items-center gap-3 text-[#E6E9ED]/50 text-sm">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading mail...
        </div>
      )}

      {error && (
        <div className="glass-card rounded-2xl border border-amber-500/30 p-5 text-amber-300 text-sm">
          {error}
        </div>
      )}

      {!loading && !error && items.length === 0 && (
        <div className="glass-card rounded-3xl border border-white/10 p-6">
          <div className="flex items-start gap-4 border-l-4 border-[#36EAEA]/60 pl-4">
            <Mail className="h-6 w-6 text-[#36EAEA]" />
            <p className="text-white/70 text-sm leading-relaxed">
              Your AIBC address is active and ready to receive mail. Items will appear here as they arrive at 125 N 9th Street, Frederick, OK 73542.
            </p>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {items.map((item) => (
          <div key={item.id} className="glass-card rounded-2xl border-white/10 p-5">
            <div className="flex items-start justify-between mb-3">
              <div>
                <p className="text-white font-semibold text-sm">{item.sender || "Unknown Sender"}</p>
                <p className="text-white/40 text-xs mt-0.5">
                  Received: {item.received_at ? new Date(item.received_at).toLocaleDateString() : "—"}
                </p>
              </div>
              <span className="glass-pill text-xs text-[#36EAEA] px-3 py-0.5">
                {item.status || "new"}
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {ACTION_BUTTONS.map(({ action, label, color }) => (
                <button
                  key={action}
                  onClick={() => handleAction(item.id, action)}
                  disabled={acting === `${item.id}-${action}`}
                  className={`text-xs border rounded-xl px-3 py-1.5 transition-colors ${color} disabled:opacity-50`}
                >
                  {acting === `${item.id}-${action}` ? (
                    <span className="flex items-center gap-1">
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      Processing
                    </span>
                  ) : (
                    label
                  )}
                </button>
              ))}
            </div>
            {scanFeedback?.id === item.id && (
              <p
                className={`text-xs font-semibold text-[#36EAEA] mt-3 transition-opacity duration-300 ${
                  scanFeedback.visible ? "opacity-100" : "opacity-0"
                }`}
              >
                Scan requested ✓
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
