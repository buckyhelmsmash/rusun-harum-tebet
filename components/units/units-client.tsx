"use client";

import { Pencil, Search } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
import { useMediaQuery } from "@/hooks/use-media-query";

export function UnitsClient() {
  const [search, setSearch] = useState("");
  const [blockFilter, setBlockFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const isDesktop = useMediaQuery("(min-width: 768px)");

  // Build filter object. In a real scenario, this gets converted to url string params
  const filters: Record<string, string> = {};
  if (blockFilter !== "all") filters.block = blockFilter;
  if (statusFilter !== "all") filters.status = statusFilter;
  if (search.length > 2) filters.search = search;

  // Currently useGetUnits passes the object to unitKeys but the fetcher doesn't parse it into URLSearchParams
  // A quick fix for the local list is client-side filtering until the api-client is updated to serialize them.
  const { data: allUnits, isLoading, isError } = useGetUnits();

  // Temporary client-side filtering
  const units = (allUnits || []).filter((u) => {
    let match = true;
    if (blockFilter !== "all" && u.block !== blockFilter) match = false;
    if (statusFilter !== "all" && u.occupancyStatus !== statusFilter)
      match = false;
    if (search && !u.displayId.toLowerCase().includes(search.toLowerCase()))
      match = false;
    return match;
  });

  const StatusBadge = ({ status }: { status: string }) => {
    return (
      <Badge
        className="capitalize"
        variant={
          status === "vacant"
            ? "destructive"
            : status === "owner_occupied"
              ? "default"
              : "secondary"
        }
      >
        {status.replace("_", " ")}
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <div className="p-8 text-center text-muted-foreground">
        Loading units...
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-8 text-center text-destructive">
        Failed to load units. Make sure collections are configured.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center">
        <div className="relative flex-1 md:max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search Unit ID..."
            className="pl-8"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2">
          <Select value={blockFilter} onValueChange={setBlockFilter}>
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Block" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Blocks</SelectItem>
              <SelectItem value="A">Block A</SelectItem>
              <SelectItem value="B">Block B</SelectItem>
              <SelectItem value="C">Block C</SelectItem>
              <SelectItem value="D">Block D</SelectItem>
            </SelectContent>
          </Select>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Status" />
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

      {/* Data View */}
      {isDesktop ? (
        <div className="rounded-md border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Unit ID</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Occupancy</TableHead>
                <TableHead>Billing To</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {units.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="text-center py-6 text-muted-foreground"
                  >
                    No units found matching the criteria.
                  </TableCell>
                </TableRow>
              )}
              {units.map((unit) => (
                <TableRow key={unit.$id}>
                  <TableCell className="font-medium">
                    {unit.displayId}
                  </TableCell>
                  <TableCell className="capitalize">{unit.unitType}</TableCell>
                  <TableCell>
                    <StatusBadge status={unit.occupancyStatus} />
                  </TableCell>
                  <TableCell className="capitalize">
                    {unit.billRecipient}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" asChild>
                      <Link href={`/admin/units/${unit.$id}`}>
                        <Pencil className="h-4 w-4" />
                        <span className="sr-only">Manage Unit</span>
                      </Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <div className="space-y-4">
          {units.length === 0 && (
            <div className="text-center py-6 text-muted-foreground border rounded-md">
              No units found.
            </div>
          )}
          {units.map((unit) => (
            <Card key={unit.$id}>
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <div className="font-semibold text-lg">{unit.displayId}</div>
                  <div className="text-sm text-muted-foreground capitalize">
                    {unit.unitType} • Bill to: {unit.billRecipient}
                  </div>
                  <div className="mt-2">
                    <StatusBadge status={unit.occupancyStatus} />
                  </div>
                </div>
                <Button variant="outline" size="icon" asChild>
                  <Link href={`/admin/units/${unit.$id}`}>
                    <Pencil className="h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
