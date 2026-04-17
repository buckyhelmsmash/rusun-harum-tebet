"use client";

import { Loader2 } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useGetActivity } from "@/hooks/api/use-activity";
import {
  formatActionLabel,
  formatActivityTimestamp,
  formatChangeValue,
  formatFieldLabel,
} from "@/lib/activity/constants";

export function ActivityLogs() {
  const [page, setPage] = useState(0);
  const limit = 20;

  const { data, isLoading, isError } = useGetActivity({
    targetType: "settings",
    limit,
    offset: page * limit,
  });

  if (isLoading) {
    return (
      <div className="flex justify-center p-8">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="p-8 text-center text-red-500">
        Gagal memuat riwayat aktivitas.
      </div>
    );
  }

  const totalPages = Math.ceil(data.total / limit);

  const renderChanges = (metadata?: string) => {
    if (!metadata) return null;
    try {
      const parsed = JSON.parse(metadata);

      if (parsed.changes && Array.isArray(parsed.changes)) {
        return (
          <div className="space-y-0.5">
            {parsed.changes.map(
              (c: { field: string; old?: unknown; new?: unknown }) => (
                <div key={c.field} className="text-xs">
                  <span className="font-medium text-slate-700 dark:text-slate-300">
                    {formatFieldLabel(c.field)}:
                  </span>{" "}
                  <span className="text-red-500 line-through">
                    {formatChangeValue(c.old)}
                  </span>{" "}
                  →{" "}
                  <span className="text-emerald-600 font-medium">
                    {formatChangeValue(c.new)}
                  </span>
                </div>
              ),
            )}
          </div>
        );
      }
      return null;
    } catch {
      return null;
    }
  };

  const getMeetingNumber = (metadata?: string): string | null => {
    if (!metadata) return null;
    try {
      const parsed = JSON.parse(metadata);
      return parsed.meetingNumber ?? null;
    } catch {
      return null;
    }
  };

  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Waktu</TableHead>
              <TableHead>Aktor</TableHead>
              <TableHead>Aksi</TableHead>
              <TableHead>Perubahan</TableHead>
              <TableHead>No. Rapat</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.items.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="h-24 text-center text-muted-foreground"
                >
                  Belum ada riwayat aktivitas.
                </TableCell>
              </TableRow>
            ) : (
              data.items.map((log) => {
                const meetingNumber = getMeetingNumber(log.metadata);
                return (
                  <TableRow key={log.$id}>
                    <TableCell className="whitespace-nowrap text-xs">
                      {formatActivityTimestamp(log.$createdAt)}
                    </TableCell>
                    <TableCell className="text-sm">
                      {log.actorName || log.actorId}
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                      <span className="text-xs font-medium text-blue-600 dark:text-blue-400">
                        {formatActionLabel(log.action)}
                      </span>
                    </TableCell>
                    <TableCell className="max-w-[250px]">
                      {renderChanges(log.metadata)}
                    </TableCell>
                    <TableCell>
                      {meetingNumber ? (
                        <span className="inline-flex items-center text-xs font-medium text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 px-2 py-0.5 rounded">
                          {meetingNumber}
                        </span>
                      ) : (
                        <span className="text-slate-300">—</span>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {data.total > limit && (
        <div className="flex items-center justify-end space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={page === 0}
          >
            Sebelumnya
          </Button>
          <div className="text-sm font-medium">
            Halaman {page + 1} dari {totalPages || 1}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
            disabled={page >= totalPages - 1}
          >
            Selanjutnya
          </Button>
        </div>
      )}
    </div>
  );
}
