"use client";

import { ChevronDown, ClipboardList, Loader2, Search } from "lucide-react";
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

const PAGE_SIZE = 25;

interface ChangeEntry {
  field: string;
  old?: unknown;
  new?: unknown;
}

interface UnitItem {
  displayId: string;
}

interface InvoiceItem {
  invoiceNumber: string;
  unitDisplayId: string;
}

function AccordionSection({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="mt-2">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
      >
        <ChevronDown
          className={`h-3.5 w-3.5 transition-transform ${
            open ? "rotate-0" : "-rotate-90"
          }`}
        />
        {label}
      </button>
      {open && <div className="mt-1.5 ml-5">{children}</div>}
    </div>
  );
}

function MetadataDisplay({ metadata }: { metadata?: string }) {
  if (!metadata) return null;
  try {
    const parsed = JSON.parse(metadata);

    const sections: React.ReactNode[] = [];

    if (
      parsed.changes &&
      Array.isArray(parsed.changes) &&
      parsed.changes.length > 0
    ) {
      sections.push(
        <div key="changes" className="space-y-1">
          {parsed.meetingNumber && (
            <p className="text-xs text-amber-600 dark:text-amber-400 font-medium">
              No. Rapat: {parsed.meetingNumber}
            </p>
          )}
          <div className="rounded-md border border-slate-200 dark:border-slate-700 overflow-hidden">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/50">
                  <th className="text-left px-2 py-1 font-medium text-slate-500">
                    Kolom
                  </th>
                  <th className="text-left px-2 py-1 font-medium text-slate-500">
                    Sebelum
                  </th>
                  <th className="text-left px-2 py-1 font-medium text-slate-500">
                    Sesudah
                  </th>
                </tr>
              </thead>
              <tbody>
                {parsed.changes.map((c: ChangeEntry) => (
                  <tr
                    key={c.field}
                    className="border-t border-slate-100 dark:border-slate-800"
                  >
                    <td className="px-2 py-1 font-medium text-slate-600 dark:text-slate-300">
                      {c.field}
                    </td>
                    <td className="px-2 py-1 text-red-500 line-through">
                      {c.old != null ? String(c.old) : "—"}
                    </td>
                    <td className="px-2 py-1 text-emerald-600 font-medium">
                      {c.new != null ? String(c.new) : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>,
      );
    }

    if (parsed.created !== undefined || parsed.updated !== undefined) {
      sections.push(
        <p key="counts" className="text-xs text-slate-500">
          Baru: {parsed.created ?? 0}, Diperbarui: {parsed.updated ?? 0}
          {parsed.period && ` — Periode: ${parsed.period}`}
        </p>,
      );
    }

    if (parsed.processed !== undefined) {
      sections.push(
        <p key="processed" className="text-xs text-slate-500">
          Diproses: {parsed.processed}, Dilewati: {parsed.skipped ?? 0}
        </p>,
      );
    }

    if (parsed.meetingNumber && !parsed.changes) {
      sections.push(
        <p key="meeting" className="text-xs text-amber-600 dark:text-amber-400">
          No. Rapat: {parsed.meetingNumber}
        </p>,
      );
    }

    if (
      parsed.processedUnits &&
      Array.isArray(parsed.processedUnits) &&
      parsed.processedUnits.length > 0
    ) {
      const units = parsed.processedUnits as UnitItem[];
      sections.push(
        <AccordionSection
          key="processedUnits"
          label={`Lihat ${units.length} unit yang diperbarui`}
        >
          <div className="flex flex-wrap gap-1">
            {units.map((u) => (
              <Badge
                key={u.displayId}
                variant="secondary"
                className="text-[10px] px-1.5 py-0"
              >
                {u.displayId}
              </Badge>
            ))}
          </div>
        </AccordionSection>,
      );
    }

    if (
      parsed.createdInvoices &&
      Array.isArray(parsed.createdInvoices) &&
      parsed.createdInvoices.length > 0
    ) {
      const invoices = parsed.createdInvoices as InvoiceItem[];
      sections.push(
        <AccordionSection
          key="createdInvoices"
          label={`Lihat ${invoices.length} tagihan baru`}
        >
          <div className="space-y-0.5">
            {invoices.map((inv) => (
              <p
                key={inv.invoiceNumber}
                className="text-[11px] text-slate-600 dark:text-slate-400"
              >
                <span className="font-mono font-medium">
                  {inv.invoiceNumber}
                </span>
                <span className="text-slate-400 dark:text-slate-500">
                  {" "}
                  — Unit {inv.unitDisplayId}
                </span>
              </p>
            ))}
          </div>
        </AccordionSection>,
      );
    }

    if (
      parsed.updatedInvoices &&
      Array.isArray(parsed.updatedInvoices) &&
      parsed.updatedInvoices.length > 0
    ) {
      const invoices = parsed.updatedInvoices as InvoiceItem[];
      sections.push(
        <AccordionSection
          key="updatedInvoices"
          label={`Lihat ${invoices.length} tagihan yang diperbarui`}
        >
          <div className="space-y-0.5">
            {invoices.map((inv) => (
              <p
                key={inv.invoiceNumber}
                className="text-[11px] text-slate-600 dark:text-slate-400"
              >
                <span className="font-mono font-medium">
                  {inv.invoiceNumber}
                </span>
                <span className="text-slate-400 dark:text-slate-500">
                  {" "}
                  — Unit {inv.unitDisplayId}
                </span>
              </p>
            ))}
          </div>
        </AccordionSection>,
      );
    }

    if (sections.length > 0) {
      return <div className="mt-2 space-y-1">{sections}</div>;
    }

    const keys = Object.keys(parsed);
    if (keys.length > 0 && keys.length <= 5) {
      return (
        <pre className="text-[10px] text-slate-400 mt-1 whitespace-pre-wrap font-mono">
          {JSON.stringify(parsed, null, 2)}
        </pre>
      );
    }

    return null;
  } catch {
    return null;
  }
}

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
        <MetadataDisplay metadata={log.metadata} />
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
          {/* Filters */}
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

          {/* Content */}
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

          {/* Pagination */}
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
