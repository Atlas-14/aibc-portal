"use client";

import { type ReactNode, useEffect, useState } from "react";
import Link from "next/link";
import { AlertCircle, Clock3 } from "lucide-react";
import { ADDRESS_STATUS_EVENT, AddressStatus, getAddressStatus } from "@/lib/address-status";

const STATUS_STYLES: Record<Exclude<AddressStatus, "active">, { wrapper: string; icon: ReactNode; message: string; showAction: boolean }> = {
  inactive: {
    wrapper: "border-rose-400/40 bg-rose-900/30 text-rose-50",
    icon: <AlertCircle className="h-5 w-5 text-rose-200" />,
    message: "⚠ Your address is not active. Submit USPS Form 1583 and two valid IDs to activate your AIBC commercial address.",
    showAction: true,
  },
  pending_review: {
    wrapper: "border-amber-300/40 bg-amber-900/30 text-amber-50",
    icon: <Clock3 className="h-5 w-5 text-amber-100" />,
    message: "🕐 Your Form 1583 is under review. We'll notify you once your address is activated (typically 1-2 business days).",
    showAction: false,
  },
};

export default function AddressStatusBanner() {
  const [status, setStatus] = useState<AddressStatus>("inactive");

  useEffect(() => {
    if (typeof window === "undefined") return;
    setStatus(getAddressStatus());

    const handleStatusChange = (event: Event) => {
      if (event instanceof CustomEvent && event.detail) {
        setStatus(event.detail as AddressStatus);
        return;
      }
      setStatus(getAddressStatus());
    };

    const handleStorage = (event: StorageEvent) => {
      if (event.key === "aibc_address_status") {
        setStatus(getAddressStatus());
      }
    };

    window.addEventListener(ADDRESS_STATUS_EVENT, handleStatusChange as EventListener);
    window.addEventListener("storage", handleStorage);

    return () => {
      window.removeEventListener(ADDRESS_STATUS_EVENT, handleStatusChange as EventListener);
      window.removeEventListener("storage", handleStorage);
    };
  }, []);

  if (status === "active") {
    return null;
  }

  const ui = STATUS_STYLES[status];

  return (
    <div className="px-6 pt-4">
      <div className={`flex flex-col gap-3 rounded-2xl border ${ui.wrapper} p-4 backdrop-blur-xl md:flex-row md:items-center md:justify-between`}>
        <div className="flex items-start gap-3 text-sm leading-relaxed">
          {ui.icon}
          <p>{ui.message}</p>
        </div>
        {ui.showAction && (
          <Link
            href="/dashboard/documents"
            className="inline-flex items-center justify-center rounded-full bg-[#36EAEA]/90 px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-[#36EAEA] transition"
          >
            Complete Activation →
          </Link>
        )}
      </div>
    </div>
  );
}
