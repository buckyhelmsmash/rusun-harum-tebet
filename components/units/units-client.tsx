"use client";

import { ChevronLeft, ChevronRight, Eye, Search } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
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

const PAGE_SIZE = 25;

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
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize",
        styles[status] ?? "bg-slate-100 text-slate-800",
      )}
    >
      {status.replace("_", " ")}
    </span>
  );
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
              onChange={(e) => {
                setSearch(e.target.value);
                resetPage();
              }}
            />
          </div>
          <div className="flex items-center gap-3">
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

        {/* Pagination Footer */}
        <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="text-sm text-slate-500 dark:text-slate-400">
            Showing{" "}
            <span className="font-medium">
              {total === 0 ? 0 : page * PAGE_SIZE + 1}
            </span>
            {" – "}
            <span className="font-medium">
              {Math.min((page + 1) * PAGE_SIZE, total)}
            </span>{" "}
            of <span className="font-medium">{total}</span> units
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page === 0}
              onClick={() => setPage((p) => p - 1)}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm text-slate-600 dark:text-slate-300 min-w-[80px] text-center">
              Page {page + 1} of {totalPages || 1}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages - 1}
              onClick={() => setPage((p) => p + 1)}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
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
        {total > 0 && (
          <div className="flex items-center justify-between pt-2">
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {page * PAGE_SIZE + 1}–{Math.min((page + 1) * PAGE_SIZE, total)}{" "}
              of {total}
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page === 0}
                onClick={() => setPage((p) => p - 1)}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= totalPages - 1}
                onClick={() => setPage((p) => p + 1)}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
