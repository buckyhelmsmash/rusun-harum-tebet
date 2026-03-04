"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { CalendarDays, Pencil, Plus, Trash2, User } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { DataTable } from "@/components/shared/data-table";
import { TimelineSheet } from "@/components/shared/timeline-sheet";
import { Button } from "@/components/ui/button";
import { goeyToast } from "@/components/ui/goey-toaster";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useDeleteOwner, useGetOwners } from "@/hooks/api/use-owners";
import { useDeleteTenant, useGetTenants } from "@/hooks/api/use-tenants";
import type { Owner, Tenant } from "@/types";
import { OwnerFormDialog } from "./owner-form-dialog";
import { TenantFormDialog } from "./tenant-form-dialog";

const PAGE_SIZE = 25;

function formatDate(dateStr?: string) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function ResidentsClient() {
  const [activeTab, setActiveTab] = useState("owners");

  // Owners state
  const [ownerSearch, setOwnerSearch] = useState("");
  const [ownerPageIndex, setOwnerPageIndex] = useState(0);
  const [ownerFormOpen, setOwnerFormOpen] = useState(false);
  const [editingOwner, setEditingOwner] = useState<Owner | null>(null);
  const [deletingOwner, setDeletingOwner] = useState<Owner | null>(null);

  // Tenants state
  const [tenantSearch, setTenantSearch] = useState("");
  const [tenantPageIndex, setTenantPageIndex] = useState(0);
  const [tenantFormOpen, setTenantFormOpen] = useState(false);
  const [editingTenant, setEditingTenant] = useState<Tenant | null>(null);
  const [deletingTenant, setDeletingTenant] = useState<Tenant | null>(null);

  // Owners query
  const ownerFilters = useMemo(
    () => ({
      search: ownerSearch || undefined,
      limit: PAGE_SIZE,
      offset: ownerPageIndex * PAGE_SIZE,
    }),
    [ownerSearch, ownerPageIndex],
  );
  const { data: ownersData, isLoading: ownersLoading } =
    useGetOwners(ownerFilters);
  const owners = ownersData?.items ?? [];
  const ownersTotal = ownersData?.total ?? 0;

  // Tenants query
  const tenantFilters = useMemo(
    () => ({
      search: tenantSearch || undefined,
      limit: PAGE_SIZE,
      offset: tenantPageIndex * PAGE_SIZE,
    }),
    [tenantSearch, tenantPageIndex],
  );
  const { data: tenantsData, isLoading: tenantsLoading } =
    useGetTenants(tenantFilters);
  const tenants = tenantsData?.items ?? [];
  const tenantsTotal = tenantsData?.total ?? 0;

  // Delete mutations
  const deleteOwnerMutation = useDeleteOwner();
  const deleteTenantMutation = useDeleteTenant();

  // Owners columns
  const ownerColumns = useMemo<ColumnDef<Owner, unknown>[]>(
    () => [
      {
        accessorKey: "fullName",
        header: "Name",
        cell: ({ row }) => (
          <span className="font-semibold">{row.original.fullName}</span>
        ),
      },
      {
        accessorKey: "ktpNumber",
        header: "KTP",
        cell: ({ row }) => (
          <span className="font-mono text-xs">{row.original.ktpNumber}</span>
        ),
      },
      {
        accessorKey: "phoneNumber",
        header: "Phone",
      },
      {
        accessorKey: "email",
        header: "Email",
        cell: ({ row }) => row.original.email || "—",
      },
      {
        id: "unit",
        header: "Unit",
        cell: ({ row }) => {
          const units = row.original.units;
          if (!units || units.length === 0)
            return <span className="text-slate-400">—</span>;
          return (
            <div className="flex flex-wrap gap-1">
              {units.map((u) => (
                <Link
                  key={u.$id}
                  href={`/admin/units/${u.$id}`}
                  className="text-blue-600 dark:text-blue-400 hover:underline text-sm"
                >
                  {u.displayId}
                </Link>
              ))}
            </div>
          );
        },
      },
      {
        id: "actions",
        header: "",
        cell: ({ row }) => (
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => {
                setEditingOwner(row.original);
                setOwnerFormOpen(true);
              }}
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-red-500 hover:text-red-600"
              onClick={() => setDeletingOwner(row.original)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
            <TimelineSheet
              targetId={row.original.$id}
              targetType="owner"
              title={`Owner ${row.original.fullName}`}
            />
          </div>
        ),
      },
    ],
    [],
  );

  // Tenants columns
  const tenantColumns = useMemo<ColumnDef<Tenant, unknown>[]>(
    () => [
      {
        accessorKey: "fullName",
        header: "Name",
        cell: ({ row }) => (
          <span className="font-semibold">{row.original.fullName}</span>
        ),
      },
      {
        accessorKey: "ktpNumber",
        header: "KTP",
        cell: ({ row }) => (
          <span className="font-mono text-xs">{row.original.ktpNumber}</span>
        ),
      },
      {
        accessorKey: "phoneNumber",
        header: "Phone",
      },
      {
        id: "unit",
        header: "Unit",
        cell: ({ row }) => {
          const unit = row.original.unit;
          if (!unit || typeof unit === "string")
            return <span className="text-slate-400">—</span>;
          return (
            <Link
              href={`/admin/units/${unit.$id}`}
              className="text-blue-600 dark:text-blue-400 hover:underline text-sm"
            >
              {unit.displayId}
            </Link>
          );
        },
      },
      {
        id: "lease",
        header: "Lease Period",
        cell: ({ row }) => {
          if (!row.original.startDate && !row.original.endDate)
            return <span className="text-slate-400">—</span>;
          return (
            <span className="text-xs flex items-center gap-1">
              <CalendarDays className="h-3 w-3" />
              {formatDate(row.original.startDate)} —{" "}
              {row.original.endDate ? formatDate(row.original.endDate) : "∞"}
            </span>
          );
        },
      },
      {
        id: "actions",
        header: "",
        cell: ({ row }) => (
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => {
                setEditingTenant(row.original);
                setTenantFormOpen(true);
              }}
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-red-500 hover:text-red-600"
              onClick={() => setDeletingTenant(row.original)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
            <TimelineSheet
              targetId={row.original.$id}
              targetType="tenant"
              title={`Tenant ${row.original.fullName}`}
            />
          </div>
        ),
      },
    ],
    [],
  );

  const renderOwnerMobileCard = (owner: Owner) => (
    <div className="p-4 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900/50">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 p-2 rounded-lg">
            <User className="h-5 w-5" />
          </div>
          <div>
            <p className="font-bold text-slate-900 dark:text-white">
              {owner.fullName}
            </p>
            <p className="text-xs text-slate-500 font-mono">
              {owner.ktpNumber}
            </p>
          </div>
        </div>
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => {
              setEditingOwner(owner);
              setOwnerFormOpen(true);
            }}
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-red-500 hover:text-red-600"
            onClick={() => setDeletingOwner(owner)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
          <TimelineSheet
            targetId={owner.$id}
            targetType="owner"
            title={`Owner ${owner.fullName}`}
          />
        </div>
      </div>
      <div className="flex items-center justify-between text-sm text-slate-500">
        <span>{owner.phoneNumber}</span>
        <span>{owner.email || "—"}</span>
      </div>
    </div>
  );

  const renderTenantMobileCard = (tenant: Tenant) => (
    <div className="p-4 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900/50">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="bg-blue-50 dark:bg-blue-900/20 text-blue-600 p-2 rounded-lg">
            <User className="h-5 w-5" />
          </div>
          <div>
            <p className="font-bold text-slate-900 dark:text-white">
              {tenant.fullName}
            </p>
            <p className="text-xs text-slate-500 font-mono">
              {tenant.ktpNumber}
            </p>
          </div>
        </div>
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => {
              setEditingTenant(tenant);
              setTenantFormOpen(true);
            }}
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-red-500 hover:text-red-600"
            onClick={() => setDeletingTenant(tenant)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
          <TimelineSheet
            targetId={tenant.$id}
            targetType="tenant"
            title={`Tenant ${tenant.fullName}`}
          />
        </div>
      </div>
      <div className="flex items-center justify-between text-sm text-slate-500">
        <span>{tenant.phoneNumber}</span>
        {(tenant.startDate || tenant.endDate) && (
          <span className="flex items-center gap-1 text-xs">
            <CalendarDays className="h-3 w-3" />
            {formatDate(tenant.startDate)} — {formatDate(tenant.endDate)}
          </span>
        )}
      </div>
    </div>
  );

  const handleDeleteOwner = async () => {
    if (!deletingOwner) return;
    try {
      await deleteOwnerMutation.mutateAsync({ id: deletingOwner.$id });
      goeyToast.success(`Owner ${deletingOwner.fullName} deleted`);
      setDeletingOwner(null);
    } catch (error) {
      goeyToast.error("Failed to delete owner.", {
        description: (error as Error).message,
      });
    }
  };

  const handleDeleteTenant = async () => {
    if (!deletingTenant) return;
    try {
      await deleteTenantMutation.mutateAsync({ id: deletingTenant.$id });
      goeyToast.success(`Tenant ${deletingTenant.fullName} deleted`);
      setDeletingTenant(null);
    } catch (error) {
      goeyToast.error("Failed to delete tenant.", {
        description: (error as Error).message,
      });
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            Residents
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Manage owners and tenants
          </p>
        </div>
        <Button
          onClick={() => {
            if (activeTab === "owners") {
              setEditingOwner(null);
              setOwnerFormOpen(true);
            } else {
              setEditingTenant(null);
              setTenantFormOpen(true);
            }
          }}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add {activeTab === "owners" ? "Owner" : "Tenant"}
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2 max-w-xs">
          <TabsTrigger value="owners">Owners</TabsTrigger>
          <TabsTrigger value="tenants">Tenants</TabsTrigger>
        </TabsList>

        <TabsContent value="owners" className="mt-4">
          <DataTable
            columns={ownerColumns}
            data={owners}
            isLoading={ownersLoading}
            mobileCardRender={renderOwnerMobileCard}
            keyExtractor={(o) => o.$id}
            searchPlaceholder="Search owners..."
            searchValue={ownerSearch}
            onSearchChange={(val) => {
              setOwnerSearch(val);
              setOwnerPageIndex(0);
            }}
            total={ownersTotal}
            pageSize={PAGE_SIZE}
            pageIndex={ownerPageIndex}
            onNextPage={() => setOwnerPageIndex((p) => p + 1)}
            onPrevPage={() => setOwnerPageIndex((p) => Math.max(0, p - 1))}
            hasNextPage={(ownerPageIndex + 1) * PAGE_SIZE < ownersTotal}
            hasPrevPage={ownerPageIndex > 0}
          />
        </TabsContent>

        <TabsContent value="tenants" className="mt-4">
          <DataTable
            columns={tenantColumns}
            data={tenants}
            isLoading={tenantsLoading}
            mobileCardRender={renderTenantMobileCard}
            keyExtractor={(t) => t.$id}
            searchPlaceholder="Search tenants..."
            searchValue={tenantSearch}
            onSearchChange={(val) => {
              setTenantSearch(val);
              setTenantPageIndex(0);
            }}
            total={tenantsTotal}
            pageSize={PAGE_SIZE}
            pageIndex={tenantPageIndex}
            onNextPage={() => setTenantPageIndex((p) => p + 1)}
            onPrevPage={() => setTenantPageIndex((p) => Math.max(0, p - 1))}
            hasNextPage={(tenantPageIndex + 1) * PAGE_SIZE < tenantsTotal}
            hasPrevPage={tenantPageIndex > 0}
          />
        </TabsContent>
      </Tabs>

      {/* Owners form dialog */}
      <OwnerFormDialog
        open={ownerFormOpen}
        onOpenChange={(open) => {
          setOwnerFormOpen(open);
          if (!open) setEditingOwner(null);
        }}
        owner={editingOwner}
      />

      {/* Tenants form dialog */}
      <TenantFormDialog
        open={tenantFormOpen}
        onOpenChange={(open) => {
          setTenantFormOpen(open);
          if (!open) setEditingTenant(null);
        }}
        tenant={editingTenant}
      />

      {/* Delete owner confirmation */}
      <ConfirmDialog
        isOpen={!!deletingOwner}
        onClose={() => setDeletingOwner(null)}
        title="Delete Owner"
        description={`Are you sure you want to delete ${deletingOwner?.fullName}? This action cannot be undone.`}
        confirmText="Delete"
        variant="destructive"
        isLoading={deleteOwnerMutation.isPending}
        onConfirm={handleDeleteOwner}
      />

      {/* Delete tenant confirmation */}
      <ConfirmDialog
        isOpen={!!deletingTenant}
        onClose={() => setDeletingTenant(null)}
        title="Delete Tenant"
        description={`Are you sure you want to delete ${deletingTenant?.fullName}? This action cannot be undone.`}
        confirmText="Delete"
        variant="destructive"
        isLoading={deleteTenantMutation.isPending}
        onConfirm={handleDeleteTenant}
      />
    </div>
  );
}
