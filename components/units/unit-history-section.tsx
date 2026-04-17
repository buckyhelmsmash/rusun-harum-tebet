"use client";

import { Clock } from "lucide-react";
import { DetailCard, DetailCardHeader } from "@/components/shared/detail-card";
import { StatusBadge } from "@/components/shared/status-badge";
import { useGetActivity } from "@/hooks/api/use-activity";
import {
  ACTION_LABELS,
  formatActivityTimestamp,
} from "@/lib/activity/constants";
import { MetadataRenderer } from "@/components/activity/metadata-renderer";

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

            return (
              <div
                key={log.$id}
                className="px-6 py-3 flex items-start justify-between gap-3"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-slate-700 dark:text-slate-300 truncate">
                    {log.description}
                  </p>

                  <MetadataRenderer
                    metadata={log.metadata}
                    variant="compact"
                  />

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
