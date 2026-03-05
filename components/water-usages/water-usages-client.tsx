"use client";

import { useQueryClient } from "@tanstack/react-query";
import type { ColumnDef } from "@tanstack/react-table";
import { format, subMonths } from "date-fns";
import { Calendar as CalendarIcon, Droplet, UploadCloud } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { DataTable } from "@/components/shared/data-table";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { MonthPicker } from "@/components/ui/monthpicker";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { WaterUsageImport } from "@/components/water-usages/water-usage-import";
import { useGetWaterUsages } from "@/hooks/api/use-water-usages";
import { useDebounce } from "@/hooks/use-debounce";
import type { WaterUsage } from "@/lib/schemas/water-usages";

const PAGE_SIZE = 25;

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

  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 300);
  const [periodDate, setPeriodDate] = useState<Date | undefined>(() =>
    getInitialPeriodDate(urlPeriod),
  );
  const [pageIndex, setPageIndex] = useState(0);
  const [importOpen, setImportOpen] = useState(false);

  const queryClient = useQueryClient();

  const periodFilter = periodDate ? format(periodDate, "yyyy-MM") : undefined;

  const filters = useMemo(
    () => ({
      unitId: debouncedSearch || undefined,
      limit: PAGE_SIZE,
      offset: pageIndex * PAGE_SIZE,
      period: periodFilter,
    }),
    [debouncedSearch, periodFilter, pageIndex],
  );

  const { data, isLoading } = useGetWaterUsages(filters);
  const rows = data?.rows ?? [];
  const total = data?.total ?? 0;

  const columns: ColumnDef<WaterUsage>[] = useMemo(
    () => [
      {
        accessorKey: "period",
        header: "Period",
        cell: ({ row }) => {
          const periodStr = row.original.period;
          const [year, month] = periodStr.split("-").map(Number);
          const date = new Date(year, month - 1, 1);
          return (
            <span className="font-medium text-slate-900 dark:text-white">
              {format(date, "MMM yyyy")}
            </span>
          );
        },
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
        header: "Prev Meter",
        cell: ({ row }) => (
          <span className="text-sm">
            {row.original.previousMeter.toLocaleString()}
          </span>
        ),
      },
      {
        accessorKey: "currentMeter",
        header: "Current Meter",
        cell: ({ row }) => (
          <span className="text-sm">
            {row.original.currentMeter.toLocaleString()}
          </span>
        ),
      },
      {
        accessorKey: "usage",
        header: "Usage (m³)",
        cell: ({ row }) => (
          <span className="font-semibold text-emerald-600 dark:text-emerald-400">
            {row.original.usage.toLocaleString()}
          </span>
        ),
      },
      {
        accessorKey: "amount",
        header: () => <span className="text-right block">Amount (Rp)</span>,
        cell: ({ row }) => (
          <span className="font-semibold text-slate-900 dark:text-white text-right block">
            {row.original.amount.toLocaleString("id-ID")}
          </span>
        ),
      },
      {
        accessorKey: "isBilled",
        header: "Billed",
        cell: ({ row }) => (
          <StatusBadge variant={row.original.isBilled ? "success" : "warning"}>
            {row.original.isBilled ? "Billed" : "Unbilled"}
          </StatusBadge>
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
            <p className="text-xs text-slate-500">{usage.period}</p>
          </div>
        </div>
        <StatusBadge variant={usage.isBilled ? "success" : "warning"}>
          {usage.isBilled ? "Billed" : "Unbilled"}
        </StatusBadge>
      </div>
      <div className="grid grid-cols-3 gap-2 text-xs text-slate-500">
        <div>
          <span className="text-slate-400">Prev:</span>{" "}
          {usage.previousMeter.toLocaleString()}
        </div>
        <div>
          <span className="text-slate-400">Curr:</span>{" "}
          {usage.currentMeter.toLocaleString()}
        </div>
        <div className="text-right">
          <span className="text-slate-400">Usage:</span>{" "}
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
        onSuccess={() => {
          queryClient.invalidateQueries({ queryKey: ["waterUsages"] });
        }}
      />

      {/* Page Title & CTA */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Water Usages
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Manage and import monthly water meter readings.
          </p>
        </div>
        <Button
          onClick={() => setImportOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
        >
          <UploadCloud className="h-4 w-4 mr-2" />
          Import Excel
        </Button>
      </div>

      {/* DataTable with filters via the slot pattern */}
      <DataTable
        columns={columns}
        data={rows}
        isLoading={isLoading}
        mobileCardRender={renderMobileCard}
        keyExtractor={(usage) => usage.$id}
        searchPlaceholder="Search by unit ID (e.g. A-101)..."
        searchValue={search}
        onSearchChange={(val) => {
          setSearch(val);
          setPageIndex(0);
        }}
        filters={
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                data-empty={!periodDate}
                className="min-w-[160px] justify-start text-left font-normal shadow-sm data-[empty=true]:text-muted-foreground"
              >
                <CalendarIcon className="h-4 w-4 mr-2" />
                {periodDate ? format(periodDate, "MMMM yyyy") : "All Periods"}
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
                    Clear filter
                  </Button>
                </div>
              )}
            </PopoverContent>
          </Popover>
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
