"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { format, subMonths } from "date-fns";
import {
  Calendar as CalendarIcon,
  FileText,
  Pencil,
  Plus,
  Zap,
} from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { DataTable } from "@/components/shared/data-table";
import { StatusBadge } from "@/components/shared/status-badge";
import { TimelineSheet } from "@/components/shared/timeline-sheet";
import { Button } from "@/components/ui/button";
import { goeyToast } from "@/components/ui/goey-toaster";
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
import { useGetInvoices } from "@/hooks/api/use-invoices";
import { cn } from "@/lib/utils";
import type { Invoice, Unit } from "@/types";
import { InvoiceFormDialog } from "./invoice-form-dialog";

const PAGE_SIZE = 25;
const BLOCKS = ["A", "B", "C", "D"] as const;

function formatCurrency(value: number): string {
  return `Rp ${value.toLocaleString("id-ID")}`;
}

function getResidentName(unit: Unit | undefined): string {
  if (!unit) return "—";
  if (unit.billRecipient === "tenant" && unit.tenant) {
    return typeof unit.tenant === "string" ? "Tenant" : unit.tenant.fullName;
  }
  if (unit.owner) {
    return typeof unit.owner === "string" ? "Owner" : unit.owner.fullName;
  }
  return "—";
}

const STATUS_TABS = [
  { value: "all", label: "All" },
  { value: "paid", label: "Paid" },
  { value: "unpaid", label: "Unpaid" },
] as const;

function getInitialPeriodDate(urlPeriod: string | null): Date | undefined {
  if (urlPeriod) {
    const [year, month] = urlPeriod.split("-").map(Number);
    if (year && month) return new Date(year, month - 1, 1);
  }
  return subMonths(new Date(), 1);
}

export function InvoicesClient() {
  const searchParams = useSearchParams();

  const urlStatus = searchParams.get("status");
  const urlPeriod = searchParams.get("period");
  const urlBlock = searchParams.get("block");

  const [statusFilter, setStatusFilter] = useState(urlStatus ?? "all");
  const [periodDate, setPeriodDate] = useState<Date | undefined>(() =>
    getInitialPeriodDate(urlPeriod),
  );
  const [blockFilter, setBlockFilter] = useState(urlBlock ?? "A");
  const [pageIndex, setPageIndex] = useState(0);
  const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const periodFilter = periodDate ? format(periodDate, "yyyy-MM") : undefined;

  const filters = useMemo(
    () => ({
      status:
        statusFilter !== "all"
          ? (statusFilter as "paid" | "unpaid")
          : undefined,
      period: periodFilter,
      block: blockFilter !== "all" ? blockFilter : undefined,
      limit: PAGE_SIZE,
      offset: pageIndex * PAGE_SIZE,
    }),
    [statusFilter, periodFilter, blockFilter, pageIndex],
  );

  const { data, isLoading } = useGetInvoices(filters);
  const invoices = data?.items ?? [];
  const total = data?.total ?? 0;

  const handleGenerateInvoices = async () => {
    setIsGenerating(true);
    try {
      const res = await fetch("/api/cron/generate-invoices", {
        method: "POST",
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Generation failed");
      }
      const result = await res.json();
      goeyToast.success(`Successfully generated ${result.count ?? 0} invoices`);
    } catch (error) {
      goeyToast.error("Failed to generate invoices", {
        description: (error as Error).message,
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const columns: ColumnDef<Invoice>[] = useMemo(
    () => [
      {
        accessorKey: "period",
        header: "Period",
        enableSorting: false,
        cell: ({ row }) => (
          <span className="text-sm font-medium">{row.original.period}</span>
        ),
      },
      {
        id: "unit",
        header: "Unit",
        enableSorting: false,
        cell: ({ row }) => {
          const unit = row.original.unit;
          const displayId =
            unit && typeof unit !== "string" ? unit.displayId : "—";
          return (
            <span className="text-sm font-semibold text-slate-900 dark:text-white">
              {displayId}
            </span>
          );
        },
      },
      {
        id: "resident",
        header: "Recipient",
        enableSorting: false,
        cell: ({ row }) => {
          const unit =
            typeof row.original.unit === "object"
              ? row.original.unit
              : undefined;
          return (
            <span className="text-sm">
              {getResidentName(unit as Unit | undefined)}
            </span>
          );
        },
      },
      {
        accessorKey: "iplFee",
        header: () => <span className="text-right block">IPL Fee</span>,
        enableSorting: false,
        cell: ({ row }) => (
          <span className="text-sm text-right block">
            {formatCurrency(row.original.iplFee)}
          </span>
        ),
      },
      {
        accessorKey: "waterFee",
        header: () => <span className="text-right block">Water</span>,
        enableSorting: false,
        cell: ({ row }) => (
          <span className="text-sm text-right block">
            {formatCurrency(row.original.waterFee)}
          </span>
        ),
      },
      {
        accessorKey: "vehicleFee",
        header: () => <span className="text-right block">Vehicle</span>,
        enableSorting: false,
        cell: ({ row }) => (
          <span className="text-sm text-right block">
            {formatCurrency(row.original.vehicleFee)}
          </span>
        ),
      },
      {
        accessorKey: "arrears",
        header: "Arrears",
        cell: ({ row }) => (
          <span
            className={`text-sm text-right block ${row.original.arrears > 0 ? "text-rose-600 font-medium" : "text-slate-400"}`}
          >
            {formatCurrency(row.original.arrears)}
          </span>
        ),
      },
      {
        accessorKey: "totalDue",
        header: "Total Due",
        cell: ({ row }) => (
          <span className="text-sm font-bold text-slate-900 dark:text-white text-right block">
            {formatCurrency(row.original.totalDue)}
          </span>
        ),
      },
      {
        accessorKey: "status",
        header: "Status",
        enableSorting: false,
        cell: ({ row }) => (
          <StatusBadge
            variant={row.original.status === "paid" ? "success" : "destructive"}
          >
            {row.original.status === "paid" ? "Paid" : "Unpaid"}
          </StatusBadge>
        ),
      },
      {
        id: "actions",
        header: "",
        enableSorting: false,
        cell: ({ row }) => (
          <div className="flex items-center justify-end gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => {
                setEditingInvoice(row.original);
                setFormOpen(true);
              }}
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <TimelineSheet
              targetId={row.original.$id}
              targetType="invoice"
              title={`Invoice ${row.original.period}`}
            />
          </div>
        ),
      },
    ],
    [],
  );

  const renderMobileCard = (invoice: Invoice) => {
    const unit =
      typeof invoice.unit === "object" ? (invoice.unit as Unit) : undefined;
    const displayId = unit?.displayId ?? "—";
    const residentName = getResidentName(unit);

    return (
      <div className="p-4 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900/50">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 p-2 rounded-lg">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <p className="font-bold text-slate-900 dark:text-white">
                {displayId}
              </p>
              <p className="text-xs text-slate-500">{residentName}</p>
            </div>
          </div>
          <StatusBadge
            variant={invoice.status === "paid" ? "success" : "destructive"}
          >
            {invoice.status === "paid" ? "Paid" : "Unpaid"}
          </StatusBadge>
        </div>
        <div className="grid grid-cols-2 gap-2 text-xs text-slate-500 mb-3">
          <div>
            <span className="text-slate-400">Period:</span> {invoice.period}
          </div>
          <div className="text-right">
            <span className="text-slate-400">IPL:</span>{" "}
            {formatCurrency(invoice.iplFee)}
          </div>
          <div>
            <span className="text-slate-400">Water:</span>{" "}
            {formatCurrency(invoice.waterFee)}
          </div>
          <div className="text-right">
            <span className="text-slate-400">Vehicle:</span>{" "}
            {formatCurrency(invoice.vehicleFee)}
          </div>
        </div>
        <div className="flex items-center justify-between text-sm mt-3 pt-3 border-t border-slate-100 dark:border-slate-800">
          <div>
            {invoice.arrears > 0 && (
              <span className="text-xs text-rose-600 mr-2">
                Arrears: {formatCurrency(invoice.arrears)}
              </span>
            )}
          </div>
          <span className="font-bold text-slate-900 dark:text-white">
            {formatCurrency(invoice.totalDue)}
          </span>
        </div>
        <div className="flex items-center justify-end gap-1 mt-3 pt-3 border-t border-slate-100 dark:border-slate-800">
          <Button
            variant="ghost"
            size="sm"
            className="h-8 text-xs"
            onClick={() => {
              setEditingInvoice(invoice);
              setFormOpen(true);
            }}
          >
            <Pencil className="h-3.5 w-3.5 mr-1.5" />
            Edit
          </Button>
          <TimelineSheet
            targetId={invoice.$id}
            targetType="invoice"
            title={`Invoice ${invoice.period}`}
          />
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Page Title & CTA */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Invoices
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Manage monthly billings and payment status for all residents.
          </p>
        </div>
        <Button
          onClick={handleGenerateInvoices}
          disabled={isGenerating}
          className="bg-primary hover:bg-primary/90 text-white shadow-sm"
        >
          {isGenerating ? (
            <Zap className="h-4 w-4 mr-2 animate-pulse" />
          ) : (
            <Plus className="h-4 w-4 mr-2" />
          )}
          {isGenerating ? "Generating…" : "Generate Monthly Invoices"}
        </Button>
      </div>

      {/* DataTable with filters inside */}
      <DataTable
        columns={columns}
        data={invoices}
        isLoading={isLoading}
        mobileCardRender={renderMobileCard}
        keyExtractor={(inv) => inv.$id}
        searchPlaceholder="Search invoices, units, or residents..."
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
                <SelectValue placeholder="Block" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Blocks</SelectItem>
                {BLOCKS.map((b) => (
                  <SelectItem key={b} value={b}>
                    Block {b}
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

            {/* Status segmented toggle */}
            <div className="flex items-center bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-1 shadow-sm">
              {STATUS_TABS.map((tab) => (
                <button
                  key={tab.value}
                  type="button"
                  onClick={() => {
                    setStatusFilter(tab.value);
                    setPageIndex(0);
                  }}
                  className={cn(
                    "px-4 py-1 text-sm font-medium rounded-md transition-colors",
                    statusFilter === tab.value
                      ? "bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white"
                      : "text-slate-500 hover:text-slate-900 dark:hover:text-white",
                  )}
                >
                  {tab.label}
                </button>
              ))}
            </div>
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

      <InvoiceFormDialog
        invoice={editingInvoice}
        open={formOpen}
        onOpenChange={(open: boolean) => {
          setFormOpen(open);
          if (!open) setEditingInvoice(null);
        }}
      />
    </div>
  );
}
