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
    <div className="min-h-screen flex flex-col items-center justify-center px-4 bg-[#071829]">
      <div className="w-full max-w-md">
        {/* Logo / header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[#36EAEA]/10 border border-[#36EAEA]/30 mb-4">
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
              <rect width="32" height="32" rx="8" fill="none"/>
              <path d="M8 24V8h4l4 8 4-8h4v16h-4V14l-4 8-4-8v10H8z" fill="#36EAEA"/>
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-white">AIBC Client Portal</h1>
          <p className="text-[#E6E9ED]/50 text-sm mt-1">AI Business Centers — Member Access</p>
        </div>

        {/* Login form */}
        <form onSubmit={handleLogin} className="bg-[#0D2A4A] border border-[#36EAEA]/15 rounded-2xl p-8 space-y-5">
          <div>
            <label className="block text-sm text-[#E6E9ED]/70 mb-2">Email Address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@yourbusiness.com"
              className="w-full bg-[#071829] border border-[#36EAEA]/20 rounded-lg px-4 py-3 text-white placeholder-[#E6E9ED]/30 focus:border-[#36EAEA] focus:outline-none transition-colors text-sm"
            />
          </div>
          <div>
            <label className="block text-sm text-[#E6E9ED]/70 mb-2">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-[#071829] border border-[#36EAEA]/20 rounded-lg px-4 py-3 text-white placeholder-[#E6E9ED]/30 focus:border-[#36EAEA] focus:outline-none transition-colors text-sm"
            />
          </div>
          {error && (
            <p className="text-rose-400 text-sm">{error}</p>
          )}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#36EAEA] text-[#0D2A4A] font-bold py-3 rounded-xl text-sm hover:bg-[#36EAEA]/90 transition-all disabled:opacity-50"
          >
            {loading ? "Signing in..." : "Sign In →"}
          </button>
          <div className="text-center">
            <a href="/auth/forgot-password" className="text-[#36EAEA]/60 text-xs hover:text-[#36EAEA] transition-colors">
              Forgot your password?
            </a>
          </div>
        </form>

        <p className="text-center text-[#E6E9ED]/30 text-xs mt-6">
          Need access? Contact your AI Business Centers account manager.
        </p>
      </div>
    </div>
  );
}
