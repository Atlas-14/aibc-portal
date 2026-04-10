import Sidebar from "@/components/Sidebar";
import MobileNav from "@/components/MobileNav";
import OnboardingModal from "@/components/OnboardingModal";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const formattedDate = new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  }).format(new Date());

  return (
    <div className="flex min-h-screen bg-[#071829]">
      <Sidebar businessName="Your Business" />
      <div className="flex-1 flex flex-col relative">
        <header className="sticky top-0 z-30 flex items-center justify-between border-b border-white/5 bg-[#071829]/95 px-6 py-4 backdrop-blur">
          <div>
            <p className="text-xs uppercase tracking-[0.4em] text-[#E6E9ED]/40">Today</p>
            <p className="text-white text-lg font-semibold">{formattedDate}</p>
          </div>
          <div className="inline-flex items-center gap-2 rounded-full border border-[#36EAEA]/40 bg-[#36EAEA]/10 px-4 py-1 text-sm font-semibold text-[#36EAEA]">
            Business Plus
          </div>
        </header>
        <main className="flex-1 overflow-y-auto pb-24 lg:pb-0">
          {children}
        </main>
        <MobileNav />
        <OnboardingModal />
      </div>
    </div>
  );
}
