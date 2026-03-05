"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { Car, Eye } from "lucide-react";
import Link from "next/link";
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
import { useGetVehicles } from "@/hooks/api/use-vehicles";
import { useDebounce } from "@/hooks/use-debounce";
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
  const debouncedSearch = useDebounce(search, 300);
  const [typeFilter, setTypeFilter] = useState("all");
  const [pageIndex, setPageIndex] = useState(0);

  const filters = useMemo(
    () => ({
      search: debouncedSearch || undefined,
      vehicleType:
        typeFilter !== "all"
          ? (typeFilter as "car" | "motorcycle" | "box_car")
          : undefined,
      limit: PAGE_SIZE,
      offset: pageIndex * PAGE_SIZE,
    }),
    [debouncedSearch, typeFilter, pageIndex],
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
        accessorKey: "unit",
        header: "Unit",
        cell: ({ row }) => {
          const unit = row.original.unit;
          if (!unit) return "—";
          const unitId = typeof unit === "string" ? unit : unit.$id;
          const displayId = typeof unit === "object" ? unit.displayId : unitId;
          return (
            <Link
              href={`/admin/units/${unitId}`}
              className="text-blue-600 dark:text-blue-400 hover:underline text-sm font-medium"
            >
              {displayId}
            </Link>
          );
        },
      },
      {
        id: "actions",
        header: "",
        cell: ({ row }) => {
          const unit = row.original.unit;
          const unitId = typeof unit === "string" ? unit : unit?.$id;
          return (
            <div className="flex items-center gap-1">
              {unitId && (
                <Link href={`/admin/units/${unitId}`}>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 gap-1.5 text-xs"
                  >
                    <Eye className="h-3.5 w-3.5" />
                    View Unit
                  </Button>
                </Link>
              )}
              <TimelineSheet
                targetId={row.original.$id}
                targetType="vehicle"
                title={`Vehicle ${row.original.licensePlate}`}
              />
            </div>
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
        <div className="flex items-center justify-between text-sm mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
          {vehicle.brand && (
            <span className="text-slate-500">
              {vehicle.brand} {vehicle.color ? `· ${vehicle.color}` : ""}
            </span>
          )}
          <div className="flex items-center gap-1">
            <TimelineSheet
              targetId={vehicle.$id}
              targetType="vehicle"
              title={`Vehicle ${vehicle.licensePlate}`}
            />
            {unitId && (
              <Button
                variant="ghost"
                size="sm"
                className="h-8 gap-1.5 text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
                asChild
              >
                <Link href={`/admin/units/${unitId}`}>
                  View Unit
                  <span className="sr-only">
                    (
                    {typeof vehicle.unit === "object"
                      ? vehicle.unit.displayId
                      : unitId}
                    )
                  </span>
                </Link>
              </Button>
            )}
          </div>
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
