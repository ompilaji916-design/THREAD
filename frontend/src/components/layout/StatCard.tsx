import { LucideIcon } from "lucide-react";

export function StatCard({ icon: Icon, label, value, trend }: { icon: LucideIcon; label: string; value: string | number; trend?: string }) {
  return (
    <div className="bg-surface border border-borderc rounded-xl p-4 flex items-center gap-3 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
      <div className="w-10 h-10 rounded-lg bg-indigo-50 text-accent flex items-center justify-center shrink-0">
        <Icon size={20} />
      </div>
      <div className="min-w-0">
        <p className="text-xl font-extrabold text-textmain leading-tight">{value}</p>
        <p className="text-xs text-textmuted truncate">{label}{trend ? ` · ${trend}` : ""}</p>
      </div>
    </div>
  );
}
