import { createClient } from "@supabase/supabase-js";
import { History } from "lucide-react";

export const dynamic = "force-dynamic";

function formatAction(action: Record<string, unknown>) {
  return [action.action, action.subscription_id, action.mailbox_name, action.reason]
    .filter(Boolean)
    .join(" · ");
}

export default async function OffboardingLogPage() {
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

  const { data, error } = await supabase
    .from("offboarding_log")
    .select("id, client_name, client_email, actions_taken, notes, offboarded_at")
    .order("offboarded_at", { ascending: false });

  const entries = data ?? [];

  return (
    <div className="max-w-7xl p-6 lg:p-10">
      <div className="mb-8">
        <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-red-400">Admin</p>
        <div className="flex items-center gap-3">
          <History className="h-6 w-6 text-red-300" />
          <h1 className="text-3xl font-bold text-white">Offboarding Log</h1>
        </div>
        <p className="mt-1 text-sm text-white/60">Every client offboarding action, with a durable audit trail.</p>
      </div>

      <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04]">
        {error ? (
          <div className="p-6 text-sm text-red-300">Unable to load offboarding log: {error.message}</div>
        ) : entries.length === 0 ? (
          <div className="p-10 text-sm text-white/55">No offboarding events recorded yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-white/10 text-sm">
              <thead className="bg-white/5 text-left text-white/45">
                <tr>
                  <th className="px-4 py-3 font-medium">Timestamp</th>
                  <th className="px-4 py-3 font-medium">Client</th>
                  <th className="px-4 py-3 font-medium">Email</th>
                  <th className="px-4 py-3 font-medium">Actions</th>
                  <th className="px-4 py-3 font-medium">Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-white/80">
                {entries.map((entry) => {
                  const actions = Array.isArray(entry.actions_taken) ? entry.actions_taken : [];
                  return (
                    <tr key={entry.id} className="align-top">
                      <td className="px-4 py-4 text-white/55">{new Date(entry.offboarded_at).toLocaleString()}</td>
                      <td className="px-4 py-4 font-medium text-white">{entry.client_name || "Unknown client"}</td>
                      <td className="px-4 py-4 text-white/65">{entry.client_email}</td>
                      <td className="px-4 py-4">
                        <div className="space-y-2">
                          {actions.length ? (
                            actions.map((action, index) => (
                              <div key={`${entry.id}-${index}`} className="rounded-2xl border border-white/10 bg-black/10 px-3 py-2 text-xs text-white/70">
                                {typeof action === "object" && action !== null ? formatAction(action as Record<string, unknown>) : String(action)}
                              </div>
                            ))
                          ) : (
                            <span className="text-white/40">No actions recorded</span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-4 text-white/60">{entry.notes || "—"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
