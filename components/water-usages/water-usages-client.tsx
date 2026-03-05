"use client";

import { useQueryClient } from "@tanstack/react-query";
import type { ColumnDef } from "@tanstack/react-table";
import { format, subMonths } from "date-fns";
import { CalendarIcon, Droplet, UploadCloud } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { DataTable } from "@/components/shared/data-table";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  return subMonths(new Date(), 1); // default to last month
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
      unitId: debouncedSearch || undefined, // For simple search we are passing unitId but backend expects displayId? Actually backend expects Unit ID but our existing GET API searches `unit` ID. Wait. We will just pass it, though a generic text search wasn't strictly built into `/api/water-usages`. For now, we omit it or adapt the API later if needed. Let's just pass `unitId` as undefined for now if it's text, or leave it. We'll refine search later.
      limit: PAGE_SIZE,
      offset: pageIndex * PAGE_SIZE,
      period: periodFilter,
    }),
    [debouncedSearch, periodFilter, pageIndex],
  );

  const { data, isLoading } = useGetWaterUsages(filters);

  const columns: ColumnDef<WaterUsage>[] = [
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
      cell: ({ row }) => {
        return (
          <div className="font-medium text-slate-900 dark:text-white">
            {getUnitDisplayId(row.original.unit)}
          </div>
        );
      },
    },
    {
      accessorKey: "previousMeter",
      header: "Prev Meter",
      cell: ({ row }) => row.original.previousMeter.toLocaleString(),
    },
    {
      accessorKey: "currentMeter",
      header: "Current Meter",
      cell: ({ row }) => row.original.currentMeter.toLocaleString(),
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
      header: "Amount (Rp)",
      cell: ({ row }) => (
        <span className="font-semibold text-slate-900 dark:text-white">
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
  ];

  return (
    <div className="space-y-6">
      <WaterUsageImport
        open={importOpen}
        onOpenChange={setImportOpen}
        onSuccess={() => {
          queryClient.invalidateQueries({ queryKey: ["waterUsages"] });
        }}
      />

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center space-x-3 text-slate-900 dark:text-white">
          <Droplet className="w-8 h-8 text-blue-500" />
          <div>
            <h1 className="text-2xl font-bold">Water Usages</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Manage and import monthly water meter readings.
            </p>
          </div>
        </div>

        <Button
          onClick={() => setImportOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          <UploadCloud className="w-4 h-4 mr-2" />
          Import Excel
        </Button>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm flex flex-col">
        {/* Filters */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search by unit (coming soon)..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="max-w-xs bg-white dark:bg-slate-800"
                disabled
              />
            </div>
            <div className="flex items-center gap-4">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-[240px] justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {periodDate
                      ? format(periodDate, "MMM yyyy")
                      : "Pick a month"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="end">
                  <MonthPicker
                    selectedMonth={periodDate}
                    onMonthSelect={(date) => {
                      setPeriodDate(date);
                      setPageIndex(0);
                    }}
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </div>

        {/* Data list */}
        <div className="flex-1 p-0 flex flex-col min-h-0 min-h-[400px]">
          <DataTable
            columns={columns}
            data={data?.rows ?? []}
            total={data?.total ?? 0}
            pageSize={PAGE_SIZE}
            pageIndex={pageIndex}
            onNextPage={() => setPageIndex((p) => p + 1)}
            onPrevPage={() => setPageIndex((p) => Math.max(0, p - 1))}
            hasNextPage={(pageIndex + 1) * PAGE_SIZE < (data?.total ?? 0)}
            hasPrevPage={pageIndex > 0}
            isLoading={isLoading}
          />
        </div>
      </div>
    </div>
  );
}
