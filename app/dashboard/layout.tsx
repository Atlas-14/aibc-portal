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
    <div className="flex min-h-screen relative">
      <div className="floating-orb floating-orb--teal w-[28rem] h-[28rem] fixed -top-24 -left-10 -z-10" />
      <div className="floating-orb floating-orb--blue w-[32rem] h-[32rem] fixed bottom-0 -right-16 -z-10" />
      <Sidebar businessName="Your Business" />
      <div className="flex-1 flex flex-col relative">
        <header className="sticky top-0 z-30 flex items-center justify-between border-b border-white/8 bg-black/20 backdrop-blur-xl px-6 py-4">
          <div>
            <p className="text-xs uppercase tracking-[0.4em] text-[#E6E9ED]/40">Today</p>
            <p className="text-white text-lg font-semibold">{formattedDate}</p>
          </div>
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/10 px-4 py-1 text-sm font-semibold text-[#36EAEA] shadow-[0_8px_30px_rgba(54,234,234,0.15)]">
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
