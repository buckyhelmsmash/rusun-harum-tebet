"use client";

import { Clock, Loader2 } from "lucide-react";
import { useState } from "react";
import { MetadataRenderer } from "@/components/activity/metadata-renderer";
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
  getActionIcon,
  getActionIconColor,
} from "@/lib/activity/constants";
import type { ActivityLog, TargetType } from "@/types";

interface TimelineSheetProps {
  targetId?: string;
  targetType: TargetType;
  title: string;
}

function TimelineItem({ log }: { log: ActivityLog }) {
  const Icon = getActionIcon(log.action);
  const colorClass = getActionIconColor(log.action);

  return (
    <div className="relative flex gap-4 pb-8 last:pb-0 group">
      <div className="absolute left-[17px] top-10 bottom-0 w-px bg-slate-200 dark:bg-slate-700 group-last:hidden" />

      <div
        className={`relative z-10 flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center ${colorClass}`}
      >
        <Icon className="h-4 w-4" />
      </div>

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

        <MetadataRenderer metadata={log.metadata} />

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
