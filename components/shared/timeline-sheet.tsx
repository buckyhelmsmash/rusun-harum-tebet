"use client";

import {
  Clock,
  Download,
  FileText,
  Loader2,
  Plus,
  RefreshCw,
  Trash2,
  UserCheck,
  UserMinus,
  Zap,
} from "lucide-react";
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
import type { ActivityLog, TargetType } from "@/types";

interface TimelineSheetProps {
  targetId?: string;
  targetType: TargetType;
  title: string;
  /** Optional context for query-side bulk log merging. Keys: `unitDisplayId`, `invoiceNumber`. */
  bulkContext?: Record<string, string>;
}

function getActionIcon(action: string) {
  if (action.endsWith(".create")) return Plus;
  if (action.endsWith(".update")) return RefreshCw;
  if (action.endsWith(".delete")) return Trash2;
  if (action.endsWith(".assign")) return UserCheck;
  if (action.endsWith(".remove")) return UserMinus;
  if (action.endsWith(".generate")) return Zap;
  if (action.endsWith(".sync")) return RefreshCw;
  if (action.endsWith(".import")) return Download;
  return FileText;
}

function getActionColor(action: string) {
  if (action.endsWith(".create"))
    return "text-emerald-500 bg-emerald-50 dark:bg-emerald-900/20";
  if (action.endsWith(".update"))
    return "text-blue-500 bg-blue-50 dark:bg-blue-900/20";
  if (action.endsWith(".delete"))
    return "text-red-500 bg-red-50 dark:bg-red-900/20";
  if (action.endsWith(".assign"))
    return "text-violet-500 bg-violet-50 dark:bg-violet-900/20";
  if (action.endsWith(".remove"))
    return "text-orange-500 bg-orange-50 dark:bg-orange-900/20";
  if (action.endsWith(".generate"))
    return "text-amber-500 bg-amber-50 dark:bg-amber-900/20";
  if (action.endsWith(".sync"))
    return "text-cyan-500 bg-cyan-50 dark:bg-cyan-900/20";
  if (action.endsWith(".import"))
    return "text-indigo-500 bg-indigo-50 dark:bg-indigo-900/20";
  return "text-slate-500 bg-slate-50 dark:bg-slate-800";
}

function formatActionLabel(action: string) {
  const [entity, verb] = action.split(".");

  const entityMap: Record<string, string> = {
    invoice: "Tagihan",
    water_usage: "Penggunaan Air",
    unit: "Unit",
    vehicle: "Kendaraan",
    resident: "Penghuni",
    user: "Pengguna",
  };

  const verbMap: Record<string, string> = {
    create: "Dibuat",
    update: "Diperbarui",
    delete: "Dihapus",
    assign: "Ditugaskan",
    remove: "Dihapus dari",
    generate: "Dihasilkan",
    sync: "Disinkronkan",
    import: "Diimpor",
  };

  const entityLabel =
    entityMap[entity] || entity.charAt(0).toUpperCase() + entity.slice(1);
  const verbLabel =
    verbMap[verb] || verb.charAt(0).toUpperCase() + verb.slice(1);

  return `${entityLabel} ${verbLabel}`;
}

function formatTimestamp(dateStr: string) {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

const FIELD_LABELS: Record<string, string> = {
  status: "Status",
  waterFee: "Biaya Air",
  waterRate: "Tarif Air",
  publicFacilityFee: "Sarana Umum",
  guardFee: "Penjagaan Fasilitas",
  vehicleFee: "Biaya Kendaraan",
  iplFee: "IPL",
  arrears: "Tunggakan",
  totalDue: "Total Tagihan",
  previousMeter: "Meteran Awal",
  currentMeter: "Meteran Akhir",
  usage: "Pemakaian",
  amount: "Jumlah",
  period: "Periode",
  isBilled: "Tertagih",
  paymentDate: "Tanggal Bayar",
  billRecipient: "Penerima Tagihan",
  uniqueCode: "Kode Unik",
  fullName: "Nama Lengkap",
  phone: "Telepon",
  email: "Email",
  plateNumber: "Plat Nomor",
  brand: "Merek",
  color: "Warna",
  vehicleType: "Jenis",
  publicFacilityRate: "Tarif Sarana Umum",
  guardRate: "Tarif Penjagaan",
  meetingNumber: "Nomor Rapat",
  invoiceNumber: "No. Tagihan",
};

const VALUE_LABELS: Record<string, string> = {
  paid: "Lunas",
  unpaid: "Belum Lunas",
  true: "Ya",
  false: "Tidak",
  owner: "Pemilik",
  tenant: "Penyewa",
  car: "Mobil",
  motorcycle: "Motor",
};

function formatFieldLabel(field: string): string {
  return FIELD_LABELS[field] ?? field;
}

function formatChangeValue(val: unknown): string {
  if (val === null || val === undefined) return "—";
  const str = String(val);
  return VALUE_LABELS[str] ?? str;
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
  const colorClass = getActionColor(log.action);
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
            {formatTimestamp(log.$createdAt)}
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
  bulkContext,
}: TimelineSheetProps) {
  const [open, setOpen] = useState(false);

  const serializedBulkContext = bulkContext
    ? JSON.stringify(bulkContext)
    : undefined;

  const filters = targetId
    ? { targetId, limit: 50, bulkContext: serializedBulkContext }
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
