"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { FileText, Pencil } from "lucide-react";
import { useMemo, useState } from "react";
import { DataTable } from "@/components/shared/data-table";
import { StatusBadge } from "@/components/shared/status-badge";
import { TimelineSheet } from "@/components/shared/timeline-sheet";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useGetInvoices } from "@/hooks/api/use-invoices";
import type { Invoice, Unit } from "@/types";
import { InvoiceFormDialog } from "./invoice-form-dialog";

const PAGE_SIZE = 25;

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

export function InvoicesClient() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [periodFilter, setPeriodFilter] = useState("all");
  const [pageIndex, setPageIndex] = useState(0);
  const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null);
  const [formOpen, setFormOpen] = useState(false);

  const filters = useMemo(
    () => ({
      search: search || undefined,
      status:
        statusFilter !== "all"
          ? (statusFilter as "paid" | "unpaid")
          : undefined,
      period: periodFilter !== "all" ? periodFilter : undefined,
      limit: PAGE_SIZE,
      offset: pageIndex * PAGE_SIZE,
    }),
    [search, statusFilter, periodFilter, pageIndex],
  );

  const { data, isLoading } = useGetInvoices(filters);
  const invoices = data?.items ?? [];
  const total = data?.total ?? 0;

  const periods = useMemo(() => {
    const uniquePeriods = new Set(invoices.map((inv) => inv.period));
    return Array.from(uniquePeriods).sort().reverse();
  }, [invoices]);

  const columns: ColumnDef<Invoice>[] = useMemo(
    () => [
      {
        accessorKey: "period",
        header: "Period",
        cell: ({ row }) => (
          <span className="text-sm font-medium">{row.original.period}</span>
        ),
      },
      {
        id: "unit",
        header: "Unit",
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
        header: "Resident",
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
        header: () => <span className="text-right block">IPL</span>,
        cell: ({ row }) => (
          <span className="text-sm text-right block">
            {formatCurrency(row.original.iplFee)}
          </span>
        ),
      },
      {
        accessorKey: "waterFee",
        header: () => <span className="text-right block">Water</span>,
        cell: ({ row }) => (
          <span className="text-sm text-right block">
            {formatCurrency(row.original.waterFee)}
          </span>
        ),
      },
      {
        accessorKey: "vehicleFee",
        header: () => <span className="text-right block">Vehicle</span>,
        cell: ({ row }) => (
          <span className="text-sm text-right block">
            {formatCurrency(row.original.vehicleFee)}
          </span>
        ),
      },
      {
        accessorKey: "arrears",
        header: () => <span className="text-right block">Arrears</span>,
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
        header: () => <span className="text-right block">Total Due</span>,
        cell: ({ row }) => (
          <span className="text-sm font-bold text-slate-900 dark:text-white text-right block">
            {formatCurrency(row.original.totalDue)}
          </span>
        ),
      },
      {
        accessorKey: "status",
        header: "Status",
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
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          Invoices & Billing
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Manage monthly IPL invoices and payments
        </p>
      </div>

      <DataTable
        columns={columns}
        data={invoices}
        isLoading={isLoading}
        mobileCardRender={renderMobileCard}
        keyExtractor={(inv) => inv.$id}
        searchPlaceholder="Search period..."
        searchValue={search}
        onSearchChange={(val) => {
          setSearch(val);
          setPageIndex(0);
        }}
        filters={
          <div className="flex items-center gap-2">
            <Select
              value={statusFilter}
              onValueChange={(val) => {
                setStatusFilter(val);
                setPageIndex(0);
              }}
            >
              <SelectTrigger className="w-[130px]">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="unpaid">Unpaid</SelectItem>
              </SelectContent>
            </Select>
            {periods.length > 0 && (
              <Select
                value={periodFilter}
                onValueChange={(val) => {
                  setPeriodFilter(val);
                  setPageIndex(0);
                }}
              >
                <SelectTrigger className="w-[130px]">
                  <SelectValue placeholder="All Periods" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Periods</SelectItem>
                  {periods.map((p) => (
                    <SelectItem key={p} value={p}>
                      {p}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
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
