"use client";

import { Clock } from "lucide-react";
import { DetailCard, DetailCardHeader } from "@/components/shared/detail-card";
import { StatusBadge } from "@/components/shared/status-badge";
import { useGetActivity } from "@/hooks/api/use-activity";
import {
  ACTION_LABELS,
  formatActivityTimestamp,
  formatChangeValue,
  formatFieldLabel,
} from "@/lib/activity/constants";

export function UnitHistorySection({ unitId }: { unitId: string }) {
  const { data, isLoading } = useGetActivity({
    unitId,
    limit: 5,
  });

  const logs = data?.items ?? [];

  return (
    <DetailCard>
      <DetailCardHeader
        title="Aktivitas Terbaru"
        icon={<Clock className="h-5 w-5" />}
      />

      {isLoading ? (
        <div className="p-6 text-center text-sm text-slate-400">
          Memuat aktivitas...
        </div>
      ) : logs.length === 0 ? (
        <div className="p-6 text-center text-sm text-slate-400 italic">
          Belum ada aktivitas yang dicatat
        </div>
      ) : (
        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {logs.map((log) => {
            const actionInfo = ACTION_LABELS[log.action] ?? {
              label: log.action,
              variant: "default" as const,
            };

            let changes: Array<{ field: string; old: unknown; new: unknown }> =
              [];
            if (log.metadata) {
              try {
                const parsedMetadata =
                  typeof log.metadata === "string"
                    ? JSON.parse(log.metadata)
                    : log.metadata;

                if (Array.isArray(parsedMetadata?.changes)) {
                  changes = parsedMetadata.changes;
                }
              } catch (e) {
                console.error("Failed to parse activity metadata:", e);
              }
            }

            return (
              <div
                key={log.$id}
                className="px-6 py-3 flex items-start justify-between gap-3"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-slate-700 dark:text-slate-300 truncate">
                    {log.description}
                  </p>

                  {changes.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {changes.map((change) => (
                        <div
                          key={change.field}
                          className="text-xs text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/50 p-1.5 rounded-md border border-slate-100 dark:border-slate-800"
                        >
                          <span className="font-medium text-slate-700 dark:text-slate-300 mr-1">
                            {formatFieldLabel(change.field)}:
                          </span>
                          <span className="line-through opacity-70 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 px-1 rounded mr-1">
                            {formatChangeValue(change.old)}
                          </span>
                          <span className="opacity-90 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 px-1 rounded">
                            {formatChangeValue(change.new)}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  <p className="text-xs text-slate-400 mt-1">
                    oleh {log.actorName} ·{" "}
                    {formatActivityTimestamp(log.$createdAt)}
                  </p>
                </div>
                <StatusBadge variant={actionInfo.variant}>
                  {actionInfo.label}
                </StatusBadge>
              </div>
            );
          })}
        </div>
      )}
    </DetailCard>
  );
}
