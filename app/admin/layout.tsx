import AdminSidebar from "@/components/AdminSidebar";
import { AdminBreadcrumbs, AdminSearchBar, AdminToastViewport } from "@/components/admin/AdminPrimitives";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex min-h-screen bg-[#040d1a]">
      <div className="floating-orb floating-orb--teal fixed -left-10 -top-24 -z-10 h-[28rem] w-[28rem]" />
      <div className="floating-orb floating-orb--blue fixed bottom-0 right-[-4rem] -z-10 h-[32rem] w-[32rem]" />
      <AdminToastViewport />
      <AdminSidebar />
      <div className="relative flex flex-1 flex-col overflow-hidden">
        <header className="sticky top-0 z-30 border-b border-white/8 bg-black/25 px-5 py-4 backdrop-blur-xl sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div className="space-y-2">
              <p className="text-xs uppercase tracking-[0.42em] text-[#E6E9ED]/35">AIBC Admin</p>
              <div className="flex flex-col gap-2 xl:flex-row xl:items-center xl:gap-4">
                <p className="text-lg font-semibold text-white">Command Center</p>
                <AdminBreadcrumbs />
              </div>
            </div>
            <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
              <AdminSearchBar />
              <div className="inline-flex items-center justify-center gap-2 rounded-full border border-[#36EAEA]/25 bg-[#36EAEA]/10 px-4 py-2 text-sm font-semibold text-[#8ef8f8]">
                🔐 Admin Access
              </div>
            </div>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto pb-24 lg:pb-0">{children}</main>
      </div>
    </div>
  );
}
