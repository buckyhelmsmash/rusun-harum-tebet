"use client";

import { useQueryClient } from "@tanstack/react-query";
import type { ColumnDef } from "@tanstack/react-table";
import { format, subMonths } from "date-fns";
import {
  Calendar as CalendarIcon,
  Droplet,
  Pencil,
  UploadCloud,
} from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { DataTable } from "@/components/shared/data-table";
import { TimelineSheet } from "@/components/shared/timeline-sheet";
import { Button } from "@/components/ui/button";
import { MonthPicker } from "@/components/ui/monthpicker";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { WaterUsageEditDialog } from "@/components/water-usages/water-usage-edit-dialog";
import { WaterUsageImport } from "@/components/water-usages/water-usage-import";
import { useGetWaterUsages } from "@/hooks/api/use-water-usages";
import { useDebounce } from "@/hooks/use-debounce";
import type { WaterUsage } from "@/lib/schemas/water-usages";
import { formatPeriodRange } from "@/lib/utils/period";

const PAGE_SIZE = 25;
const BLOCKS = ["A", "B", "C", "D"] as const;

function getInitialPeriodDate(urlPeriod: string | null): Date | undefined {
  if (urlPeriod) {
    const [year, month] = urlPeriod.split("-").map(Number);
    if (year && month) return new Date(year, month - 1, 1);
  }
  return subMonths(new Date(), 1);
}

function getUnitDisplayId(unit: WaterUsage["unit"]): string {
  if (typeof unit === "string") return unit;
  return unit?.displayId || "—";
}

export function WaterUsagesClient() {
  const searchParams = useSearchParams();
  const urlPeriod = searchParams.get("period");
  const urlBlock = searchParams.get("block");

  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 300);
  const [periodDate, setPeriodDate] = useState<Date | undefined>(() =>
    getInitialPeriodDate(urlPeriod),
  );
  const [blockFilter, setBlockFilter] = useState(urlBlock ?? "A");
  const [pageIndex, setPageIndex] = useState(0);
  const [importOpen, setImportOpen] = useState(false);
  const [editingUsage, setEditingUsage] = useState<WaterUsage | null>(null);
  const [editOpen, setEditOpen] = useState(false);

  const queryClient = useQueryClient();

  const periodFilter = periodDate ? format(periodDate, "yyyy-MM") : undefined;

  const filters = useMemo(
    () => ({
      unitId: debouncedSearch || undefined,
      limit: PAGE_SIZE,
      offset: pageIndex * PAGE_SIZE,
      period: periodFilter,
      block: blockFilter !== "all" ? blockFilter : undefined,
    }),
    [debouncedSearch, periodFilter, blockFilter, pageIndex],
  );

  const { data, isLoading } = useGetWaterUsages(filters);
  const rows = data?.rows ?? [];
  const total = data?.total ?? 0;

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ["waterUsages"] });
  };

  const columns: ColumnDef<WaterUsage>[] = useMemo(
    () => [
      {
        accessorKey: "period",
        header: "Periode",
        cell: ({ row }) => (
          <span className="font-medium text-slate-900 dark:text-white text-xs">
            {formatPeriodRange(row.original.period)}
          </span>
        ),
      },
      {
        accessorKey: "unit",
        header: "Unit",
        cell: ({ row }) => (
          <span className="font-semibold text-slate-900 dark:text-white">
            {getUnitDisplayId(row.original.unit)}
          </span>
        ),
      },
      {
        accessorKey: "previousMeter",
        header: "Meteran Awal",
        cell: ({ row }) => (
          <span className="text-sm">
            {row.original.previousMeter.toLocaleString()}
          </span>
        ),
      },
      {
        accessorKey: "currentMeter",
        header: "Meteran Akhir",
        cell: ({ row }) => (
          <span className="text-sm">
            {row.original.currentMeter.toLocaleString()}
          </span>
        ),
      },
      {
        accessorKey: "usage",
        header: "Pemakaian (m³)",
        cell: ({ row }) => (
          <span className="font-semibold text-emerald-600 dark:text-emerald-400">
            {row.original.usage.toLocaleString()}
          </span>
        ),
      },
      {
        accessorKey: "amount",
        header: () => <span className="text-right block">Tagihan (Rp)</span>,
        cell: ({ row }) => (
          <span className="font-semibold text-slate-900 dark:text-white text-right block">
            {row.original.amount.toLocaleString("id-ID")}
          </span>
        ),
      },
      {
        id: "actions",
        header: "",
        cell: ({ row }) => (
          <div className="flex items-center justify-end gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => {
                setEditingUsage(row.original);
                setEditOpen(true);
              }}
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <TimelineSheet
              targetId={row.original.$id}
              targetType="water_usage"
              title={`Air ${getUnitDisplayId(row.original.unit)} — ${row.original.period}`}
            />
          </div>
        ),
      },
    ],
    [],
  );

  const renderMobileCard = (usage: WaterUsage) => (
    <div className="p-4 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900/50">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="bg-blue-50 dark:bg-blue-900/20 text-blue-600 p-2 rounded-lg">
            <Droplet className="h-5 w-5" />
          </div>
          <div>
            <p className="font-bold text-slate-900 dark:text-white">
              {getUnitDisplayId(usage.unit)}
            </p>
            <p className="text-xs text-slate-500">
              {formatPeriodRange(usage.period)}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => {
              setEditingUsage(usage);
              setEditOpen(true);
            }}
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <TimelineSheet
            targetId={usage.$id}
            targetType="water_usage"
            title={`Air ${getUnitDisplayId(usage.unit)} — ${usage.period}`}
          />
        </div>
      </div>
      <div className="grid grid-cols-3 gap-2 text-xs text-slate-500">
        <div>
          <span className="text-slate-400">Awal:</span>{" "}
          {usage.previousMeter.toLocaleString()}
        </div>
        <div>
          <span className="text-slate-400">Akhir:</span>{" "}
          {usage.currentMeter.toLocaleString()}
        </div>
        <div className="text-right">
          <span className="text-slate-400">Pemakaian:</span>{" "}
          <span className="font-semibold text-emerald-600">
            {usage.usage.toLocaleString()}
          </span>
        </div>
      </div>
      <div className="flex items-center justify-end text-sm mt-3 pt-3 border-t border-slate-100 dark:border-slate-800">
        <span className="font-bold text-slate-900 dark:text-white">
          Rp {usage.amount.toLocaleString("id-ID")}
        </span>
      </div>
    </div>
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <WaterUsageImport
        open={importOpen}
        onOpenChange={setImportOpen}
        onSuccess={handleRefresh}
      />

      <WaterUsageEditDialog
        usage={editingUsage}
        open={editOpen}
        onOpenChange={(open) => {
          setEditOpen(open);
          if (!open) setEditingUsage(null);
        }}
        onSuccess={handleRefresh}
      />

      {/* Page Title & CTA */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Penggunaan Air
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Kelola dan impor pembacaan meteran air bulanan.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <TimelineSheet
            targetType="water_usage"
            title="Riwayat Penggunaan Air"
          />
          <Button
            onClick={() => setImportOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
          >
            <UploadCloud className="h-4 w-4 mr-2" />
            Impor Excel
          </Button>
        </div>
      </div>

      {/* DataTable with filters */}
      <DataTable
        columns={columns}
        data={rows}
        isLoading={isLoading}
        mobileCardRender={renderMobileCard}
        keyExtractor={(usage) => usage.$id}
        searchPlaceholder="Cari ID unit (mis. A-101)..."
        searchValue={search}
        onSearchChange={(val) => {
          setSearch(val);
          setPageIndex(0);
        }}
        filters={
          <>
            {/* Block filter */}
            <Select
              value={blockFilter}
              onValueChange={(val) => {
                setBlockFilter(val);
                setPageIndex(0);
              }}
            >
              <SelectTrigger className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 min-w-[100px] shadow-sm">
                <SelectValue placeholder="Blok" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Blok</SelectItem>
                {BLOCKS.map((b) => (
                  <SelectItem key={b} value={b}>
                    Blok {b}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Month picker */}
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  data-empty={!periodDate}
                  className="min-w-[160px] justify-start text-left font-normal shadow-sm data-[empty=true]:text-muted-foreground"
                >
                  <CalendarIcon className="h-4 w-4 mr-2" />
                  {periodDate
                    ? format(periodDate, "MMMM yyyy")
                    : "Semua Periode"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <MonthPicker
                  selectedMonth={periodDate}
                  onMonthSelect={(date) => {
                    setPeriodDate(date);
                    setPageIndex(0);
                  }}
                />
                {periodDate && (
                  <div className="p-2 border-t border-slate-200 dark:border-slate-800">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full text-xs"
                      onClick={() => {
                        setPeriodDate(undefined);
                        setPageIndex(0);
                      }}
                    >
                      Hapus filter
                    </Button>
                  </div>
                )}
              </PopoverContent>
            </Popover>
          </>
        }
        total={total}
        pageSize={PAGE_SIZE}
        pageIndex={pageIndex}
        onNextPage={() => setPageIndex((p) => p + 1)}
        onPrevPage={() => setPageIndex((p) => Math.max(0, p - 1))}
        hasNextPage={(pageIndex + 1) * PAGE_SIZE < total}
        hasPrevPage={pageIndex > 0}
      />
    </div>
  );
}
