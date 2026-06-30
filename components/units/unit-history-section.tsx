"use client";

import { Clock } from "lucide-react";
import { MetadataRenderer } from "@/components/activity/metadata-renderer";
import { StatusBadge } from "@/components/shared/status-badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useGetActivity } from "@/hooks/api/use-activity";
import {
  ACTION_LABELS,
  formatActivityTimestamp,
} from "@/lib/activity/constants";

export function UnitHistorySection({ unitId }: { unitId: string }) {
  const { data, isLoading } = useGetActivity({
    unitId,
    limit: 5,
  });

  const logs = data?.items ?? [];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Clock className="h-4 w-4 text-muted-foreground" />
          Aktivitas Terbaru
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <p className="text-center text-sm text-muted-foreground py-4">
            Memuat aktivitas...
          </p>
        ) : logs.length === 0 ? (
          <p className="text-center text-sm text-muted-foreground italic py-4">
            Belum ada aktivitas yang dicatat
          </p>
        ) : (
          <div className="divide-y">
            {logs.map((log) => {
              const actionInfo = ACTION_LABELS[log.action] ?? {
                label: log.action,
                variant: "default" as const,
              };

              return (
                <div
                  key={log.$id}
                  className="flex items-start justify-between gap-3 py-3 first:pt-0 last:pb-0"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm truncate">{log.description}</p>
                    <MetadataRenderer
                      metadata={log.metadata}
                      variant="compact"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
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
      </CardContent>
    </Card>
  );
}
