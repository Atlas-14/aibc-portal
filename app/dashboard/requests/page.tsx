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
      <div className="bg-[#0D2A4A] border border-[#36EAEA]/15 rounded-2xl p-6">
        <div className="flex items-start gap-4 border-l-4 border-[#36EAEA] pl-4">
          <Send className="h-6 w-6 text-[#36EAEA]" />
          <p className="text-[#E6E9ED]/70 text-sm leading-relaxed">
            Your AIBC address is active and ready to receive mail. Items will appear here as they arrive at 125 N 9th Street, Frederick, OK 73542.
          </p>
        </div>
      </div>
    </div>
  );
}
