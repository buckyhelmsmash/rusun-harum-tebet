"use client";

import { format } from "date-fns";
import { id } from "date-fns/locale";
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

  const formatMetadata = (metadata?: string) => {
    if (!metadata) return null;
    try {
      const parsed = JSON.parse(metadata);
      // Simplify the display depending on what exists in the metadata
      if (parsed.meetingNumber) {
        return (
          <span className="text-xs">No. Rapat: {parsed.meetingNumber}</span>
        );
      }
      if (parsed.changes && Array.isArray(parsed.changes)) {
        return (
          <ul className="text-xs list-disc list-inside">
            {parsed.changes.map(
              (c: { field: string; old?: unknown; new?: unknown }) => (
                <li key={c.field}>Ubah {c.field}</li>
              ),
            )}
          </ul>
        );
      }
      if (parsed.created !== undefined || parsed.updated !== undefined) {
        return (
          <span className="text-xs">
            Baru: {parsed.created}, Diperbarui: {parsed.updated}
          </span>
        );
      }
      if (parsed.processed !== undefined) {
        return (
          <span className="text-xs">
            Diproses: {parsed.processed}, Gagal: {parsed.skipped ?? 0}
          </span>
        );
      }
      return (
        <pre className="text-[10px] whitespace-pre-wrap">
          {JSON.stringify(parsed, null, 2)}
        </pre>
      );
    } catch {
      return null;
    }
  };

  const totalPages = Math.ceil(data.total / limit);

  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Waktu</TableHead>
              <TableHead>Aktor</TableHead>
              <TableHead>Aksi</TableHead>
              <TableHead>Deskripsi</TableHead>
              <TableHead>Detail</TableHead>
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
              data.items.map((log) => (
                <TableRow key={log.$id}>
                  <TableCell className="whitespace-nowrap">
                    {format(new Date(log.$createdAt), "d MMM yyyy, HH:mm", {
                      locale: id,
                    })}
                  </TableCell>
                  <TableCell>{log.actorName || log.actorId}</TableCell>
                  <TableCell className="whitespace-nowrap font-medium text-xs">
                    {log.action}
                  </TableCell>
                  <TableCell
                    className="max-w-[200px] truncate"
                    title={log.description}
                  >
                    {log.description}
                  </TableCell>
                  <TableCell>{formatMetadata(log.metadata)}</TableCell>
                </TableRow>
              ))
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
