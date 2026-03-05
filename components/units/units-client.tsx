"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { Eye } from "lucide-react";
import Link from "next/link";
import { useCallback, useMemo, useState } from "react";
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
import { useDebounce } from "@/hooks/use-debounce";
import type { Unit } from "@/types";

const PAGE_SIZE = 25;

function getStatusVariant(status: string) {
  switch (status) {
    case "owner_occupied":
    case "dihuni_pemilik":
      return "success";
    case "rented":
    case "disewa":
      return "info";
    case "vacant":
    case "kosong":
      return "destructive";
    default:
      return "default";
  }
}

function translateStatus(status: string) {
  switch (status) {
    case "owner_occupied":
      return "Dihuni Pemilik";
    case "rented":
      return "Disewa";
    case "vacant":
      return "Kosong";
    default:
      return status.replace("_", " ");
  }
}

function translateType(type: string) {
  switch (type) {
    case "residential":
      return "Residensial";
    case "commercial":
      return "Komersial";
    default:
      return type;
  }
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

  const { data, isLoading } = useGetUnits(filters);

  const units = data?.items ?? [];
  const total = data?.total ?? 0;

  const columns: ColumnDef<Unit, unknown>[] = useMemo(
    () => [
      {
        accessorKey: "displayId",
        header: "Unit ID",
        cell: ({ row }) => (
          <span className="font-semibold">{row.original.displayId}</span>
        ),
      },
      {
        accessorKey: "block",
        header: "Blok",
      },
      {
        accessorKey: "floor",
        header: "Lantai",
      },
      {
        accessorKey: "unitType",
        header: "Tipe",
        cell: ({ row }) => (
          <span className="capitalize">
            {translateType(row.original.unitType)}
          </span>
        ),
      },
      {
        accessorKey: "occupancyStatus",
        header: "Status",
        cell: ({ row }) => (
          <StatusBadge variant={getStatusVariant(row.original.occupancyStatus)}>
            {translateStatus(row.original.occupancyStatus)}
          </StatusBadge>
        ),
      },
      {
        accessorKey: "owner",
        header: "Pemilik",
        cell: ({ row }) => {
          const owner = row.original.owner;
          if (owner && typeof owner === "object") return owner.fullName;
          return <span className="text-slate-400">—</span>;
        },
      },
      {
        id: "actions",
        header: "",
        cell: ({ row }) => (
          <div className="flex justify-end">
            <Link
              href={`/admin/units/${row.original.$id}`}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 inline-flex p-1.5"
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
        className="block p-4 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900/50 active:bg-slate-50 dark:active:bg-slate-800/50 transition-colors"
      >
        <div className="flex items-center justify-between mb-2">
          <span className="font-bold text-slate-900 dark:text-white">
            {unit.displayId}
          </span>
          <StatusBadge variant={getStatusVariant(unit.occupancyStatus)}>
            {translateStatus(unit.occupancyStatus)}
          </StatusBadge>
        </div>
        <div className="flex items-center justify-between text-sm text-slate-500 dark:text-slate-400">
          <span className="capitalize">{translateType(unit.unitType)}</span>
          <span>
            Blok {unit.block}, Lantai {unit.floor}
          </span>
        </div>
        {unit.owner && typeof unit.owner === "object" && (
          <p className="text-xs text-slate-500 mt-1">
            Pemilik: {unit.owner.fullName}
          </p>
        )}
      </Link>
    ),
    [],
  );

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          Daftar Unit
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Kelola unit residensial dan komersial di seluruh blok
        </p>
      </div>

      <DataTable
        columns={columns}
        data={units}
        isLoading={isLoading}
        mobileCardRender={renderMobileCard}
        keyExtractor={(u) => u.$id}
        searchPlaceholder="Cari ID unit..."
        searchValue={search}
        onSearchChange={(val) => {
          setSearch(val);
          resetPage();
        }}
        filters={
          <>
            <Select
              value={blockFilter}
              onValueChange={(v) => {
                setBlockFilter(v);
                resetPage();
              }}
            >
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Blok: Semua" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Blok</SelectItem>
                <SelectItem value="A">Blok A</SelectItem>
                <SelectItem value="B">Blok B</SelectItem>
                <SelectItem value="C">Blok C</SelectItem>
                <SelectItem value="D">Blok D</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={floorFilter}
              onValueChange={(v) => {
                setFloorFilter(v);
                resetPage();
              }}
            >
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Lantai: Semua" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Lantai</SelectItem>
                {[1, 2, 3, 4, 5].map((f) => (
                  <SelectItem key={f} value={String(f)}>
                    Lantai {f}
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
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Status: Semua" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Status</SelectItem>
                <SelectItem value="owner_occupied">Dihuni Pemilik</SelectItem>
                <SelectItem value="rented">Disewa</SelectItem>
                <SelectItem value="vacant">Kosong</SelectItem>
              </SelectContent>
            </Select>
          </>
        }
        total={total}
        pageSize={PAGE_SIZE}
        pageIndex={page}
        onNextPage={() => setPage((p) => p + 1)}
        onPrevPage={() => setPage((p) => Math.max(0, p - 1))}
        hasNextPage={(page + 1) * PAGE_SIZE < total}
        hasPrevPage={page > 0}
      />
    </div>
  );
}
