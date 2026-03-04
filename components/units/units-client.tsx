"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { Eye } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { DataTable } from "@/components/shared/data-table";
import { StatusBadge } from "@/components/shared/status-badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useGetUnits } from "@/hooks/api/use-units";
import type { Unit } from "@/types";

const PAGE_SIZE = 25;

function getStatusVariant(status: string) {
  switch (status) {
    case "owner_occupied":
      return "success";
    case "rented":
      return "info";
    case "vacant":
      return "destructive";
    default:
      return "default";
  }
}

function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debounced;
}

export function UnitsClient() {
  const [search, setSearch] = useState("");
  const [blockFilter, setBlockFilter] = useState("all");
  const [floorFilter, setFloorFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(0);

  const debouncedSearch = useDebounce(search, 300);

  const resetPage = useCallback(() => setPage(0), []);

  const filters = {
    ...(blockFilter !== "all" && { block: blockFilter }),
    ...(floorFilter !== "all" && { floor: floorFilter }),
    ...(statusFilter !== "all" && { status: statusFilter }),
    ...(debouncedSearch.length >= 2 && { search: debouncedSearch }),
    limit: PAGE_SIZE,
    offset: page * PAGE_SIZE,
  };

  const { data, isLoading, isError } = useGetUnits(filters);

  const units = data?.items ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.ceil(total / PAGE_SIZE);

  const columns: ColumnDef<Unit, unknown>[] = useMemo(
    () => [
      {
        accessorKey: "displayId",
        header: "Unit ID",
        cell: ({ row }) => (
          <span className="font-medium text-slate-900 dark:text-white">
            {row.original.displayId}
          </span>
        ),
      },
      {
        accessorKey: "block",
        header: "Block",
      },
      {
        accessorKey: "floor",
        header: "Floor",
      },
      {
        accessorKey: "unitType",
        header: "Type",
        cell: ({ row }) => (
          <span className="capitalize">{row.original.unitType}</span>
        ),
      },
      {
        accessorKey: "occupancyStatus",
        header: "Occupancy Status",
        cell: ({ row }) => (
          <StatusBadge variant={getStatusVariant(row.original.occupancyStatus)}>
            {row.original.occupancyStatus.replace("_", " ")}
          </StatusBadge>
        ),
      },
      {
        accessorKey: "billRecipient",
        header: "Bill Recipient",
        cell: ({ row }) => (
          <span className="capitalize">
            {row.original.billRecipient.replace("_", " ")}
          </span>
        ),
      },
      {
        accessorKey: "owner",
        header: "Owner Name",
        cell: ({ row }) => {
          const owner = row.original.owner;
          return (
            <span>
              {owner && typeof owner === "object" ? (
                owner.fullName
              ) : (
                <span className="text-slate-400 dark:text-slate-500">N/A</span>
              )}
            </span>
          );
        },
      },
      {
        id: "actions",
        header: () => <div className="text-right">Actions</div>,
        cell: ({ row }) => (
          <div className="flex justify-end pr-4 text-right">
            <Link
              href={`/admin/units/${row.original.$id}`}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 inline-flex"
            >
              <Eye className="h-4 w-4" />
            </Link>
          </div>
        ),
      },
    ],
    [],
  );

  const renderMobileCard = useCallback(
    (unit: Unit) => (
      <Link
        key={unit.$id}
        href={`/admin/units/${unit.$id}`}
        className="block bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm p-4 active:bg-slate-50 dark:active:bg-slate-800/50 transition-colors"
      >
        <div className="flex items-center justify-between mb-2">
          <span className="font-medium text-slate-900 dark:text-white">
            {unit.displayId}
          </span>
          <StatusBadge variant={getStatusVariant(unit.occupancyStatus)}>
            {unit.occupancyStatus.replace("_", " ")}
          </StatusBadge>
        </div>
        <div className="flex items-center justify-between text-sm text-slate-500 dark:text-slate-400">
          <span className="capitalize">{unit.unitType}</span>
          <span>
            Block {unit.block}, Floor {unit.floor}
          </span>
        </div>
      </Link>
    ),
    [],
  );

  if (isLoading) {
    return (
      <div className="p-8 text-center text-slate-500 dark:text-slate-400">
        Loading units...
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-8 text-center text-red-600 dark:text-red-400">
        Failed to load units. Make sure collections are configured.
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-auto bg-slate-50 dark:bg-slate-950 p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">
            Units
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Manage residential and commercial units across all blocks.
          </p>
        </div>

        <DataTable
          columns={columns}
          data={units}
          isLoading={isLoading}
          mobileCardRender={renderMobileCard}
          searchPlaceholder="Search by unit ID..."
          searchValue={search}
          onSearchChange={(val) => {
            setSearch(val);
            resetPage();
          }}
          total={total}
          pageSize={PAGE_SIZE}
          pageIndex={page}
          onNextPage={() => setPage((p) => p + 1)}
          onPrevPage={() => setPage((p) => p - 1)}
          hasNextPage={page < totalPages - 1}
          hasPrevPage={page > 0}
          filters={
            <>
              <Select
                value={blockFilter}
                onValueChange={(v) => {
                  setBlockFilter(v);
                  resetPage();
                }}
              >
                <SelectTrigger className="w-[120px] bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700">
                  <SelectValue placeholder="Block: All" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Blocks</SelectItem>
                  <SelectItem value="A">Block A</SelectItem>
                  <SelectItem value="B">Block B</SelectItem>
                  <SelectItem value="C">Block C</SelectItem>
                  <SelectItem value="D">Block D</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={floorFilter}
                onValueChange={(v) => {
                  setFloorFilter(v);
                  resetPage();
                }}
              >
                <SelectTrigger className="w-[120px] bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700">
                  <SelectValue placeholder="Floor: All" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Floors</SelectItem>
                  {[1, 2, 3, 4, 5].map((f) => (
                    <SelectItem key={f} value={String(f)}>
                      Floor {f}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={statusFilter}
                onValueChange={(v) => {
                  setStatusFilter(v);
                  resetPage();
                }}
              >
                <SelectTrigger className="w-[140px] bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700">
                  <SelectValue placeholder="Status: All" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="owner_occupied">Owner Occupied</SelectItem>
                  <SelectItem value="rented">Rented</SelectItem>
                  <SelectItem value="vacant">Vacant</SelectItem>
                </SelectContent>
              </Select>
            </>
          }
        />
      </div>
    </div>
  );
}
