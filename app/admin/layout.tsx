import AdminSidebar from "@/components/AdminSidebar";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-[#040d1a] relative">
      <div className="floating-orb floating-orb--teal w-[28rem] h-[28rem] fixed -top-24 -left-10 -z-10" />
      <div className="floating-orb floating-orb--blue w-[32rem] h-[32rem] fixed bottom-0 -right-16 -z-10" />
      <AdminSidebar />
      <div className="flex-1 flex flex-col relative overflow-hidden">
        <header className="sticky top-0 z-30 flex items-center justify-between border-b border-white/8 bg-black/20 backdrop-blur-xl px-6 py-4">
          <div>
            <p className="text-xs uppercase tracking-[0.4em] text-[#E6E9ED]/40">AIBC Admin</p>
            <p className="text-white text-lg font-semibold">Command Center</p>
          </div>
          <div className="inline-flex items-center gap-2 rounded-full border border-red-400/30 bg-red-400/10 px-4 py-1 text-sm font-semibold text-red-300">
            🔐 Admin Access
          </div>
        </header>
        <main className="flex-1 overflow-y-auto pb-24 lg:pb-0">
          {children}
        </main>
      </div>
    </div>
  );
}
