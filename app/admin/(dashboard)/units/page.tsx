import { UnitsClient } from "@/components/units/units-client";

export default function UnitsPage() {
  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-slate-50 dark:bg-slate-950/50">
      <div className="mb-6 md:mb-8">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
          Units
        </h1>
        <p className="text-slate-500 dark:text-slate-400">
          Manage and monitor all housing units in Rusun Harum Tebet.
        </p>
      </div>
      <UnitsClient />
    </div>
  );
}
