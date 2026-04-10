"use client";
import { useState } from "react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Login failed");
      window.location.href = "/dashboard";
    } catch (err: unknown) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center px-4 py-16 overflow-hidden">
      <div className="floating-orb floating-orb--teal w-[32rem] h-[32rem] -top-32 -left-10 -z-10" />
      <div className="floating-orb floating-orb--blue w-[26rem] h-[26rem] top-10 right-16 -z-10" />
      <div className="floating-orb floating-orb--indigo w-[30rem] h-[30rem] -bottom-32 left-1/3 -z-10" />

      <div className="w-full max-w-md relative">
        {/* Logo / header */}
        <div className="text-center mb-10">
          <div className="flex justify-center mb-4">
            <div className="relative">
              <div className="absolute inset-0 rounded-full bg-[#36EAEA]/20 blur-3xl scale-150" />
              <img
                src="/aibc-logo-transparent.png"
                alt="AI Business Centers"
                className="relative w-40 h-40 drop-shadow-[0_0_30px_rgba(54,234,234,0.55)] animate-pulse"
                style={{ animationDuration: "3s" }}
              />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-white">AIBC Client Portal</h1>
          <p className="text-[#E6E9ED]/60 text-sm mt-1">AI Business Centers — Member Access</p>
        </div>

        {/* Login form */}
        <form
          onSubmit={handleLogin}
          className="glass-card rounded-[2.25rem] border-white/10 shadow-2xl shadow-[#36EAEA]/10 p-8 space-y-6"
        >
          <div>
            <label className="block text-sm text-white/70 mb-2">Email Address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@yourbusiness.com"
              className="glass-input w-full rounded-2xl px-4 py-3 text-sm placeholder:text-white/30 focus:border-[#36EAEA] focus:outline-none transition-colors"
            />
          </div>
          <div>
            <label className="block text-sm text-white/70 mb-2">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="glass-input w-full rounded-2xl px-4 py-3 text-sm placeholder:text-white/30 focus:border-[#36EAEA] focus:outline-none transition-colors"
            />
          </div>
          {error && (
            <p className="text-rose-400 text-sm">{error}</p>
          )}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#36EAEA] text-[#040d1a] font-bold py-3 rounded-xl text-sm tracking-wide hover:bg-[#2fd4d4] transition-all disabled:opacity-60 drop-shadow-[0_12px_35px_rgba(54,234,234,0.35)]"
          >
            {loading ? "Signing in..." : "Sign In →"}
          </button>
          <div className="text-center">
            <a href="/auth/forgot-password" className="text-[#36EAEA]/70 text-xs hover:text-[#36EAEA] transition-colors">
              Forgot your password?
            </a>
          </div>
        </form>

        <p className="text-center text-white/40 text-xs mt-6">
          Need access? Contact your AI Business Centers account manager.
        </p>
      </div>
    </div>
  );
}
