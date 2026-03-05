"use client";

import { Clock } from "lucide-react";
import { DetailCard, DetailCardHeader } from "@/components/shared/detail-card";
import { StatusBadge } from "@/components/shared/status-badge";
import { useGetActivity } from "@/hooks/api/use-activity";

type BadgeVariant = "success" | "info" | "destructive" | "default" | "warning";

const ACTION_LABELS: Record<string, { label: string; variant: BadgeVariant }> =
  {
    "vehicle.create": { label: "Ditambahkan", variant: "success" },
    "vehicle.update": { label: "Diperbarui", variant: "info" },
    "vehicle.delete": { label: "Dihapus", variant: "destructive" },
    "unit.update": { label: "Diperbarui", variant: "info" },
    "owner.assign": { label: "Ditetapkan", variant: "success" },
    "owner.remove": { label: "Dihapus", variant: "destructive" },
    "tenant.assign": { label: "Ditetapkan", variant: "success" },
    "tenant.remove": { label: "Dihapus", variant: "destructive" },
    "invoice.create": { label: "Dibuat", variant: "success" },
    "invoice.update": { label: "Diperbarui", variant: "info" },
    "news.create": { label: "Dibuat", variant: "success" },
    "news.update": { label: "Diperbarui", variant: "info" },
    "news.delete": { label: "Dihapus", variant: "destructive" },
  };

function formatRelativeTime(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);

  if (diffMins < 1) return "Baru saja";
  if (diffMins < 60) return `${diffMins}m yang lalu`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}j yang lalu`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays}h yang lalu`;
  return date.toLocaleDateString("id-ID", { day: "numeric", month: "short" });
}

interface ActivitySectionProps {
  unitId: string;
}

export function ActivitySection({ unitId }: ActivitySectionProps) {
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
              variant: "default",
            };

            let changes: Array<{ field: string; old: unknown; new: unknown }> =
              [];
            if (log.metadata) {
              try {
                // Handle both pre-parsed and JSON string formats
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
                    <div className="mt-2 space-y-1">
                      {changes.map((change) => (
                        <div
                          key={change.field}
                          className="text-xs text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/50 p-1.5 rounded-md border border-slate-100 dark:border-slate-800 inline-block mr-2 mb-1"
                        >
                          <span className="font-medium text-slate-700 dark:text-slate-300 mr-1">
                            {change.field}:
                          </span>
                          <span className="line-through opacity-70 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 px-1 rounded mr-1">
                            {String(change.old ?? "null")}
                          </span>
                          <span className="opacity-90 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 px-1 rounded">
                            {String(change.new ?? "null")}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  <p className="text-xs text-slate-400 mt-1">
                    oleh {log.actorName} · {formatRelativeTime(log.$createdAt)}
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
