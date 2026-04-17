"use client";

import { Clock, Loader2 } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useGetActivity } from "@/hooks/api/use-activity";
import {
  formatActionLabel,
  formatActivityTimestamp,
  formatChangeValue,
  formatFieldLabel,
  getActionIcon,
  getActionIconColor,
} from "@/lib/activity/constants";
import type { ActivityLog, TargetType } from "@/types";

interface TimelineSheetProps {
  targetId?: string;
  targetType: TargetType;
  title: string;
}

interface ChangeEntry {
  field: string;
  old: unknown;
  new: unknown;
}

function parseChanges(log: ActivityLog): ChangeEntry[] {
  const raw = log.metadata;
  if (!raw) return [];
  try {
    const parsed = typeof raw === "string" ? JSON.parse(raw) : raw;
    if (Array.isArray(parsed?.changes)) return parsed.changes as ChangeEntry[];
  } catch {
    // ignore
  }
  return [];
}

function TimelineItem({ log }: { log: ActivityLog }) {
  const Icon = getActionIcon(log.action);
  const colorClass = getActionIconColor(log.action);
  const changes = parseChanges(log);

  return (
    <div className="relative flex gap-4 pb-8 last:pb-0 group">
      {/* Vertical connector line */}
      <div className="absolute left-[17px] top-10 bottom-0 w-px bg-slate-200 dark:bg-slate-700 group-last:hidden" />

      {/* Icon bubble */}
      <div
        className={`relative z-10 flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center ${colorClass}`}
      >
        <Icon className="h-4 w-4" />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 pt-0.5">
        <div className="flex items-center justify-between gap-2 mb-1">
          <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
            {formatActionLabel(log.action)}
          </span>
          <time className="text-[11px] text-slate-400 dark:text-slate-500 whitespace-nowrap">
            {formatActivityTimestamp(log.$createdAt)}
          </time>
        </div>
        <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
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

        <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
          oleh {log.actorName}
        </p>
      </div>
    </div>
  );
}

export function TimelineSheet({
  targetId,
  targetType,
  title,
}: TimelineSheetProps) {
  const [open, setOpen] = useState(false);

  const filters = targetId
    ? { targetId, limit: 50 }
    : { targetType, limit: 50 };

  const { data, isLoading } = useGetActivity(open ? filters : {});

  const logs = data?.items ?? [];

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          title="Lihat riwayat"
        >
          <Clock className="h-4 w-4" />
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-md overflow-y-auto">
        <SheetHeader className="mb-6">
          <SheetTitle>Riwayat</SheetTitle>
          <SheetDescription>{title}</SheetDescription>
        </SheetHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
          </div>
        ) : logs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Clock className="h-10 w-10 text-slate-300 dark:text-slate-600 mb-3" />
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Belum ada aktivitas terekam.
            </p>
          </div>
        ) : (
          <div className="px-1">
            {logs.map((log) => (
              <TimelineItem key={log.$id} log={log} />
            ))}
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
