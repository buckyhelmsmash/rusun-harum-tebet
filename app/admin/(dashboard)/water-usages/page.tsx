import { Droplet } from "lucide-react";
import { WaterUsageImport } from "@/components/water-usages/water-usage-import";

export default function WaterUsagesPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-3 text-slate-900 dark:text-white mb-6">
        <Droplet className="w-8 h-8 text-blue-500" />
        <div>
          <h1 className="text-2xl font-bold">Water Usages</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Import monthly water meter readings to calculate usage fees.
          </p>
        </div>
      </div>
      <div className="max-w-4xl">
        <WaterUsageImport />
      </div>
    </div>
  );
}
