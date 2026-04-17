"use client";

import { ClipboardList, Loader2, Search } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useGetActivity } from "@/hooks/api/use-activity";
import { useDebounce } from "@/hooks/use-debounce";
import {
  TARGET_TYPE_OPTIONS,
  formatActionLabel,
  formatActivityTimestamp,
  getActionBadgeStyle,
  getActionIcon,
} from "@/lib/activity/constants";
import type { ActivityLog } from "@/types";
import { MetadataRenderer } from "./metadata-renderer";

const PAGE_SIZE = 25;

function ActivityLogCard({ log }: { log: ActivityLog }) {
  const Icon = getActionIcon(log.action);
  const badgeStyle = getActionBadgeStyle(log.action);

  return (
    <div className="flex gap-4 p-4 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900/50 hover:shadow-sm transition-shadow">
      <div
        className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${badgeStyle}`}
      >
        <Icon className="h-4 w-4" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2 flex-wrap">
            <Badge
              variant="outline"
              className={`text-[10px] px-1.5 py-0 border-0 ${badgeStyle}`}
            >
              {formatActionLabel(log.action)}
            </Badge>
            <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
              {log.actorName}
            </span>
          </div>
          <time className="text-[11px] text-slate-400 whitespace-nowrap flex-shrink-0">
            {formatActivityTimestamp(log.$createdAt)}
          </time>
        </div>
        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
          {log.description}
        </p>
        <MetadataRenderer metadata={log.metadata} />
      </div>
    </div>
  );
}

export function ActivityClient() {
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 400);
  const [targetTypeFilter, setTargetTypeFilter] = useState("all");
  const [pageIndex, setPageIndex] = useState(0);

  const filters = {
    search: debouncedSearch || undefined,
    targetType: targetTypeFilter !== "all" ? targetTypeFilter : undefined,
    limit: PAGE_SIZE,
    offset: pageIndex * PAGE_SIZE,
  };

  const { data, isLoading } = useGetActivity(filters);
  const logs = data?.items ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          Riwayat Aktivitas
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Seluruh aktivitas dan perubahan data yang dilakukan oleh admin di
          dalam sistem.
        </p>
      </div>

      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center gap-2">
            <ClipboardList className="h-5 w-5 text-muted-foreground" />
            <CardTitle>Log Aktivitas</CardTitle>
          </div>
          <CardDescription>
            {total > 0 ? `${total} aktivitas tercatat` : "Belum ada aktivitas."}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Cari deskripsi aktivitas..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPageIndex(0);
                }}
                className="pl-10"
              />
            </div>
            <Select
              value={targetTypeFilter}
              onValueChange={(val) => {
                setTargetTypeFilter(val);
                setPageIndex(0);
              }}
            >
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Modul" />
              </SelectTrigger>
              <SelectContent>
                {TARGET_TYPE_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {isLoading ? (
            <div className="flex justify-center p-12">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : logs.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 text-center">
              <ClipboardList className="h-10 w-10 text-slate-300 dark:text-slate-600 mb-3" />
              <p className="text-sm text-slate-500">
                Tidak ada aktivitas ditemukan.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {logs.map((log) => (
                <ActivityLogCard key={log.$id} log={log} />
              ))}
            </div>
          )}

          {total > PAGE_SIZE && (
            <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-800">
              <p className="text-sm text-slate-500">
                Menampilkan {pageIndex * PAGE_SIZE + 1}–
                {Math.min((pageIndex + 1) * PAGE_SIZE, total)} dari {total}
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPageIndex((p) => Math.max(0, p - 1))}
                  disabled={pageIndex === 0}
                >
                  Sebelumnya
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setPageIndex((p) => Math.min(totalPages - 1, p + 1))
                  }
                  disabled={pageIndex >= totalPages - 1}
                >
                  Selanjutnya
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
