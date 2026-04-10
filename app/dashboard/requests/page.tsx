"use client";
import { Send } from "lucide-react";

export default function RequestsPage() {
  return (
    <div className="p-6 lg:p-10 max-w-4xl">
      <div className="mb-8">
        <p className="text-[#36EAEA] text-xs font-semibold uppercase tracking-widest mb-1">Requests</p>
        <h1 className="text-2xl font-bold text-white">Request History</h1>
        <p className="text-[#E6E9ED]/50 text-sm mt-1">Track all open & scan, forward, shred, and check deposit requests.</p>
      </div>
      <div className="bg-[#0D2A4A] border border-[#36EAEA]/10 rounded-xl p-10 text-center">
        <Send className="h-10 w-10 text-[#36EAEA]/30 mx-auto mb-3" />
        <p className="text-[#E6E9ED]/60 text-sm">No requests yet. Requests you make on your mail items will appear here.</p>
      </div>
    </div>
  );
}
