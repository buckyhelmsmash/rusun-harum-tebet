"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { Car, Eye } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { DataTable } from "@/components/shared/data-table";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useGetVehicles } from "@/hooks/api/use-vehicles";
import type { Vehicle } from "@/types";

const PAGE_SIZE = 25;

function getTypeVariant(type: string) {
  switch (type) {
    case "car":
      return "info";
    case "motorcycle":
      return "warning";
    case "box_car":
      return "default";
    default:
      return "default";
  }
}

function formatType(type: string) {
  return type
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

export function VehiclesClient() {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [pageIndex, setPageIndex] = useState(0);

  const filters = useMemo(
    () => ({
      search: search || undefined,
      vehicleType:
        typeFilter !== "all"
          ? (typeFilter as "car" | "motorcycle" | "box_car")
          : undefined,
      limit: PAGE_SIZE,
      offset: pageIndex * PAGE_SIZE,
    }),
    [search, typeFilter, pageIndex],
  );

  const { data, isLoading } = useGetVehicles(filters);
  const vehicles = data?.items ?? [];
  const total = data?.total ?? 0;

  const columns = useMemo<ColumnDef<Vehicle, unknown>[]>(
    () => [
      {
        accessorKey: "licensePlate",
        header: "License Plate",
        cell: ({ row }) => (
          <span className="font-bold uppercase tracking-tight">
            {row.original.licensePlate}
          </span>
        ),
      },
      {
        accessorKey: "vehicleType",
        header: "Type",
        cell: ({ row }) => (
          <StatusBadge variant={getTypeVariant(row.original.vehicleType)}>
            {formatType(row.original.vehicleType)}
          </StatusBadge>
        ),
      },
      {
        accessorKey: "brand",
        header: "Brand",
        cell: ({ row }) => row.original.brand || "—",
      },
      {
        accessorKey: "color",
        header: "Color",
        cell: ({ row }) => row.original.color || "—",
      },
      {
        accessorKey: "monthlyRate",
        header: "Monthly Rate",
        cell: ({ row }) =>
          row.original.monthlyRate
            ? `Rp ${row.original.monthlyRate.toLocaleString("id-ID")}`
            : "—",
      },
      {
        accessorKey: "unit",
        header: "Unit",
        cell: ({ row }) => {
          const unitId =
            typeof row.original.unit === "string"
              ? row.original.unit
              : row.original.unit?.$id;
          if (!unitId) return "—";
          return (
            <Link
              href={`/admin/units/${unitId}`}
              className="text-blue-600 dark:text-blue-400 hover:underline text-sm"
            >
              View Unit
            </Link>
          );
        },
      },
      {
        id: "actions",
        header: "",
        cell: ({ row }) => {
          const unitId =
            typeof row.original.unit === "string"
              ? row.original.unit
              : row.original.unit?.$id;
          if (!unitId) return null;
          return (
            <Link href={`/admin/units/${unitId}`}>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <Eye className="h-4 w-4" />
              </Button>
            </Link>
          );
        },
      },
    ],
    [],
  );

  const renderMobileCard = (vehicle: Vehicle) => {
    const unitId =
      typeof vehicle.unit === "string" ? vehicle.unit : vehicle.unit?.$id;

    return (
      <div className="p-4 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900/50">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="bg-blue-50 dark:bg-blue-900/20 text-blue-600 p-2 rounded-lg">
              <Car className="h-5 w-5" />
            </div>
            <div>
              <p className="font-bold text-slate-900 dark:text-white uppercase tracking-tight">
                {vehicle.licensePlate}
              </p>
              <p className="text-xs text-slate-500">
                {vehicle.brand || "Unknown"}{" "}
                {vehicle.color ? `(${vehicle.color})` : ""}
              </p>
            </div>
          </div>
          <StatusBadge variant={getTypeVariant(vehicle.vehicleType)}>
            {formatType(vehicle.vehicleType)}
          </StatusBadge>
        </div>
        <div className="flex items-center justify-between text-sm">
          {vehicle.monthlyRate ? (
            <span className="font-semibold text-emerald-600 dark:text-emerald-400">
              Rp {vehicle.monthlyRate.toLocaleString("id-ID")}/mo
            </span>
          ) : (
            <span className="text-slate-400">No rate set</span>
          )}
          {unitId && (
            <Link
              href={`/admin/units/${unitId}`}
              className="text-blue-600 dark:text-blue-400 hover:underline text-xs font-medium"
            >
              View Unit →
            </Link>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          Vehicles
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          All registered vehicles across units
        </p>
      </div>

      <DataTable
        columns={columns}
        data={vehicles}
        isLoading={isLoading}
        mobileCardRender={renderMobileCard}
        keyExtractor={(v) => v.$id}
        searchPlaceholder="Search license plate..."
        searchValue={search}
        onSearchChange={(val) => {
          setSearch(val);
          setPageIndex(0);
        }}
        filters={
          <Select
            value={typeFilter}
            onValueChange={(val) => {
              setTypeFilter(val);
              setPageIndex(0);
            }}
          >
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="All Types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="car">Car</SelectItem>
              <SelectItem value="motorcycle">Motorcycle</SelectItem>
              <SelectItem value="box_car">Box Car</SelectItem>
            </SelectContent>
          </Select>
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
