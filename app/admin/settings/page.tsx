import { Bell, CreditCard, Shield, Wrench } from "lucide-react";

const sections = [
  {
    title: "Admin access",
    description: "Role-based access, invite controls, and internal audit logging will live here.",
    icon: Shield,
  },
  {
    title: "Billing & products",
    description: "Stripe product mapping, plan labels, and add-on configuration can be managed here next.",
    icon: CreditCard,
  },
  {
    title: "Notifications",
    description: "Review alerts, submission notifications, and internal routing preferences are planned for this section.",
    icon: Bell,
  },
  {
    title: "System maintenance",
    description: "Operational toggles, sync jobs, and admin tooling shortcuts can be added here as the portal expands.",
    icon: Wrench,
  },
];

export default function AdminSettingsPage() {
  return (
    <div className="p-6 lg:p-10 max-w-5xl">
      <div className="mb-8">
        <p className="text-red-400 text-xs font-semibold uppercase tracking-widest mb-1">Admin</p>
        <h1 className="text-3xl font-bold text-white">Settings</h1>
        <p className="text-white/60 text-sm mt-1">A stable placeholder so the sidebar route resolves cleanly while deeper controls are added.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-5">
        {sections.map(({ title, description, icon: Icon }) => (
          <div key={title} className="glass-card rounded-3xl border border-white/10 p-6">
            <Icon className="h-5 w-5 text-red-300 mb-4" />
            <h2 className="text-lg font-semibold text-white mb-2">{title}</h2>
            <p className="text-sm text-white/60 leading-relaxed">{description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
