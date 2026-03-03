"use client";

import { Eye, Search } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useGetUnits } from "@/hooks/api/use-units";
import { cn } from "@/lib/utils";

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    owner_occupied:
      "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
    rented: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
    vacant: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
        styles[status] ?? "bg-slate-100 text-slate-800",
      )}
    >
      {status.replace("_", " ")}
    </span>
  );
}

export function UnitsClient() {
  const [search, setSearch] = useState("");
  const [blockFilter, setBlockFilter] = useState("all");
  const [floorFilter, setFloorFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const { data: allUnits, isLoading, isError } = useGetUnits();

  const units = (allUnits ?? []).filter((u) => {
    if (blockFilter !== "all" && u.block !== blockFilter) return false;
    if (floorFilter !== "all" && String(u.floor) !== floorFilter) return false;
    if (statusFilter !== "all" && u.occupancyStatus !== statusFilter)
      return false;
    if (search && !u.displayId.toLowerCase().includes(search.toLowerCase()))
      return false;
    return true;
  });

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
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-1 items-center gap-3 flex-wrap">
          <div className="relative w-full md:w-80">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="text-slate-400 h-4 w-4" />
            </div>
            <Input
              placeholder="Search by unit ID..."
              className="pl-10 bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-3">
            <Select value={blockFilter} onValueChange={setBlockFilter}>
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

            <Select value={floorFilter} onValueChange={setFloorFilter}>
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

            <Select value={statusFilter} onValueChange={setStatusFilter}>
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
          </div>
        </div>
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-slate-50 dark:bg-slate-800/50">
              <TableRow>
                <TableHead className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Unit ID
                </TableHead>
                <TableHead className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Block
                </TableHead>
                <TableHead className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Floor
                </TableHead>
                <TableHead className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Type
                </TableHead>
                <TableHead className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Occupancy Status
                </TableHead>
                <TableHead className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Bill Recipient
                </TableHead>
                <TableHead className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Owner Name
                </TableHead>
                <TableHead className="text-right text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="bg-white dark:bg-slate-900 divide-y divide-slate-200 dark:divide-slate-800">
              {units.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={8}
                    className="text-center py-8 text-slate-500 dark:text-slate-400"
                  >
                    No units found matching the criteria.
                  </TableCell>
                </TableRow>
              )}
              {units.map((unit) => (
                <TableRow
                  key={unit.$id}
                  className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                >
                  <TableCell className="font-medium text-slate-900 dark:text-white">
                    {unit.displayId}
                  </TableCell>
                  <TableCell className="text-slate-600 dark:text-slate-300">
                    {unit.block}
                  </TableCell>
                  <TableCell className="text-slate-600 dark:text-slate-300">
                    {unit.floor}
                  </TableCell>
                  <TableCell className="text-slate-600 dark:text-slate-300 capitalize">
                    {unit.unitType}
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={unit.occupancyStatus} />
                  </TableCell>
                  <TableCell className="text-slate-600 dark:text-slate-300 capitalize">
                    {unit.billRecipient.replace("_", " ")}
                  </TableCell>
                  <TableCell className="text-slate-600 dark:text-slate-300">
                    {unit.owner && typeof unit.owner === "object" ? (
                      unit.owner.fullName
                    ) : (
                      <span className="text-slate-400 dark:text-slate-500">
                        N/A
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <Link
                      href={`/admin/units/${unit.$id}`}
                      className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 inline-flex"
                    >
                      <Eye className="h-4 w-4" />
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        {units.length > 0 && (
          <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div className="text-sm text-slate-500 dark:text-slate-400">
              Showing <span className="font-medium">{units.length}</span> units
            </div>
          </div>
        )}
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-3">
        {units.length === 0 && (
          <div className="text-center py-8 text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800">
            No units found.
          </div>
        )}
        {units.map((unit) => (
          <Link
            key={unit.$id}
            href={`/admin/units/${unit.$id}`}
            className="block bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm p-4 active:bg-slate-50 dark:active:bg-slate-800/50 transition-colors"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium text-slate-900 dark:text-white">
                {unit.displayId}
              </span>
              <StatusBadge status={unit.occupancyStatus} />
            </div>
            <div className="flex items-center justify-between text-sm text-slate-500 dark:text-slate-400">
              <span className="capitalize">{unit.unitType}</span>
              <span>
                Block {unit.block}, Floor {unit.floor}
              </span>
            </div>
          </Link>
        ))}
        {units.length > 0 && (
          <p className="text-center text-sm text-slate-500 dark:text-slate-400 pt-2">
            Showing {units.length} units
          </p>
        )}
      </div>
    </div>
  );
}
