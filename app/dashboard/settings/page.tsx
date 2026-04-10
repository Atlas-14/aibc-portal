"use client";

import { useEffect, useMemo, useState } from "react";
import { Check, Loader2, Shield, User, Bell } from "lucide-react";

const profile = {
  name: "Ricky Kinney",
  email: "ricky@aibusinesscenters.com",
  business: "AI Business Centers",
};

const notificationOptions = [
  {
    key: "mail-arrived",
    title: "Mail received",
    description: "Get an alert the moment new mail hits your virtual address.",
  },
  {
    key: "actions-updated",
    title: "Action updates",
    description: "Know when scans, forwards, or shreds finish processing.",
  },
  {
    key: "billing",
    title: "Billing reminders",
    description: "Stay ahead of invoices, credits, and payment receipts.",
  },
];

export default function SettingsPage() {
  const [forwardingAddress, setForwardingAddress] = useState("");
  const [forwardingSaved, setForwardingSaved] = useState(false);
  const [notifications, setNotifications] = useState<Record<string, boolean>>({});
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [passwords, setPasswords] = useState({ current: "", next: "", confirm: "" });

  useEffect(() => {
    const storedAddress = localStorage.getItem("aibc_forwarding_address");
    const storedNotifications = localStorage.getItem("aibc_notification_prefs");

    if (storedAddress) {
      setForwardingAddress(storedAddress);
    }
    if (storedNotifications) {
      setNotifications(JSON.parse(storedNotifications));
    } else {
      const defaults = notificationOptions.reduce((acc, option) => {
        acc[option.key] = true;
        return acc;
      }, {} as Record<string, boolean>);
      setNotifications(defaults);
    }
  }, []);

  useEffect(() => {
    if (forwardingSaved) {
      const timeout = setTimeout(() => setForwardingSaved(false), 2000);
      return () => clearTimeout(timeout);
    }
  }, [forwardingSaved]);

  const saveForwardingAddress = () => {
    localStorage.setItem("aibc_forwarding_address", forwardingAddress.trim());
    setForwardingSaved(true);
  };

  const toggleNotification = (key: string) => {
    setNotifications((prev) => {
      const next = { ...prev, [key]: !prev[key] };
      localStorage.setItem("aibc_notification_prefs", JSON.stringify(next));
      return next;
    });
  };

  const passwordDisabled = useMemo(() => {
    return !passwords.current || !passwords.next || passwords.next !== passwords.confirm;
  }, [passwords]);

  const handlePasswordChange = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (passwordDisabled) return;

    setPasswordLoading(true);
    setPasswordMessage(null);

    try {
      const response = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword: passwords.current,
          newPassword: passwords.next,
        }),
      });

      const data = await response.json();
      if (response.ok && data?.success) {
        setPasswordMessage({ type: "success", text: "Password updated successfully." });
        setPasswords({ current: "", next: "", confirm: "" });
      } else {
        throw new Error(data?.error || "Unable to update password.");
      }
    } catch (error: any) {
      setPasswordMessage({ type: "error", text: error.message || "Request failed" });
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <div className="p-6 lg:p-10 max-w-4xl space-y-8">
      <div>
        <p className="text-[#36EAEA] text-xs font-semibold uppercase tracking-widest mb-1">Settings</p>
        <h1 className="text-2xl font-bold text-white">Account & Preferences</h1>
        <p className="text-[#E6E9ED]/50 text-sm mt-1">Update your profile, security, forwarding, and alerts.</p>
      </div>

      <section className="rounded-3xl border border-white/5 bg-[#0D2A4A] p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="rounded-2xl bg-[#36EAEA]/10 border border-[#36EAEA]/20 p-2 text-[#36EAEA]">
            <User className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-white">Profile</h2>
            <p className="text-[#E6E9ED]/50 text-sm">Connected to your AIBC business identity.</p>
          </div>
        </div>
        <div className="grid gap-4 text-sm">
          <div>
            <p className="text-[#E6E9ED]/40 uppercase text-[11px] tracking-widest">Full Name</p>
            <p className="text-white text-base mt-1">{profile.name}</p>
          </div>
          <div>
            <p className="text-[#E6E9ED]/40 uppercase text-[11px] tracking-widest">Email</p>
            <p className="text-white text-base mt-1">{profile.email}</p>
          </div>
          <div>
            <p className="text-[#E6E9ED]/40 uppercase text-[11px] tracking-widest">Business</p>
            <p className="text-white text-base mt-1">{profile.business}</p>
          </div>
        </div>
      </section>

      <section className="rounded-3xl border border-white/5 bg-[#0D2A4A] p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="rounded-2xl bg-[#36EAEA]/10 border border-[#36EAEA]/20 p-2 text-[#36EAEA]">
            <Shield className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-white">Change Password</h2>
            <p className="text-[#E6E9ED]/50 text-sm">Secure your account with a new password.</p>
          </div>
        </div>
        <form onSubmit={handlePasswordChange} className="grid gap-4">
          <input
            type="password"
            placeholder="Current password"
            value={passwords.current}
            onChange={(e) => setPasswords((prev) => ({ ...prev, current: e.target.value }))}
            className="rounded-2xl border border-white/10 bg-[#071829] px-4 py-3 text-sm text-white placeholder:text-[#E6E9ED]/40"
          />
          <div className="grid gap-4 md:grid-cols-2">
            <input
              type="password"
              placeholder="New password"
              value={passwords.next}
              onChange={(e) => setPasswords((prev) => ({ ...prev, next: e.target.value }))}
              className="rounded-2xl border border-white/10 bg-[#071829] px-4 py-3 text-sm text-white placeholder:text-[#E6E9ED]/40"
            />
            <input
              type="password"
              placeholder="Confirm new password"
              value={passwords.confirm}
              onChange={(e) => setPasswords((prev) => ({ ...prev, confirm: e.target.value }))}
              className="rounded-2xl border border-white/10 bg-[#071829] px-4 py-3 text-sm text-white placeholder:text-[#E6E9ED]/40"
            />
          </div>
          <button
            type="submit"
            disabled={passwordDisabled || passwordLoading}
            className="inline-flex items-center justify-center rounded-full bg-[#36EAEA] px-5 py-2 text-sm font-semibold text-[#071829] shadow-lg shadow-[#36EAEA]/30 disabled:opacity-50"
          >
            {passwordLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Update Password"}
          </button>
          {passwordMessage && (
            <p
              className={`text-sm ${
                passwordMessage.type === "success" ? "text-emerald-300" : "text-rose-300"
              }`}
            >
              {passwordMessage.text}
            </p>
          )}
        </form>
      </section>

      <section className="rounded-3xl border border-white/5 bg-[#0D2A4A] p-6 space-y-4">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div>
            <h2 className="text-lg font-semibold text-white">Forwarding Address</h2>
            <p className="text-[#E6E9ED]/50 text-sm">Where should physical mail be forwarded?</p>
          </div>
          {forwardingSaved && (
            <span className="text-xs font-semibold text-[#36EAEA]">Saved ✓</span>
          )}
        </div>
        <textarea
          value={forwardingAddress}
          onChange={(e) => setForwardingAddress(e.target.value)}
          rows={3}
          placeholder="Add your preferred forwarding address"
          className="w-full rounded-2xl border border-white/10 bg-[#071829] px-4 py-3 text-sm text-white placeholder:text-[#E6E9ED]/40"
        />
        <div className="flex justify-end">
          <button
            type="button"
            onClick={saveForwardingAddress}
            className="rounded-full border border-[#36EAEA]/40 bg-[#36EAEA]/10 px-4 py-2 text-sm font-semibold text-[#36EAEA]"
          >
            Save Address
          </button>
        </div>
      </section>

      <section className="rounded-3xl border border-white/5 bg-[#0D2A4A] p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="rounded-2xl bg-[#36EAEA]/10 border border-[#36EAEA]/20 p-2 text-[#36EAEA]">
            <Bell className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-white">Notification Preferences</h2>
            <p className="text-[#E6E9ED]/50 text-sm">Choose what AIBC should keep you posted on.</p>
          </div>
        </div>
        <div className="space-y-4">
          {notificationOptions.map((option) => (
            <div
              key={option.key}
              className="flex items-center justify-between gap-6 rounded-2xl border border-white/5 bg-white/5 p-4"
            >
              <div>
                <p className="text-white font-medium">{option.title}</p>
                <p className="text-[#E6E9ED]/50 text-sm">{option.description}</p>
              </div>
              <button
                type="button"
                onClick={() => toggleNotification(option.key)}
                className={`relative inline-flex h-7 w-12 flex-shrink-0 items-center rounded-full border p-1 transition-all ${
                  notifications[option.key]
                    ? "border-[#36EAEA]/40 bg-[#36EAEA]/10"
                    : "border-white/10 bg-[#071829]"
                }`}
              >
                <span
                  className={`inline-block h-5 w-5 rounded-full shadow transition-transform ${
                    notifications[option.key]
                      ? "translate-x-5 bg-[#36EAEA] shadow-[#36EAEA]/40"
                      : "translate-x-0 bg-white"
                  }`}
                />
              </button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
