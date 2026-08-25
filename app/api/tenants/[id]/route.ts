import { NextResponse } from "next/server";
import { getChanges, logActivity } from "@/lib/activity/logger";
import { withApiHandler } from "@/lib/api/with-api-handler";
import { TenantRepository } from "@/lib/repositories/tenants";
import { updateTenantSchema } from "@/lib/schemas/residents";

export const GET = withApiHandler<{ id: string }>(
  async (_request, { params }) => {
    const { id } = await params;
    const tenant = await TenantRepository.getById(id);
    return NextResponse.json(tenant);
  },
  { role: "admin", label: "GET /api/tenants/[id]" },
);

export const PATCH = withApiHandler<{ id: string }>(
  async (request, { params, session }) => {
    const { id } = await params;
    const body = await request.json();
    const payload = body.data ?? body;
    const validated = updateTenantSchema.parse(payload);

    const existingTenant = await TenantRepository.getById(id);
    const tenant = await TenantRepository.update(id, validated);
    const changes = getChanges(existingTenant, validated);

    logActivity({
      actorId: session.$id,
      actorName: session.name || session.email,
      action: "tenant.update",
      description: `Memperbarui penyewa ${tenant.fullName}`,
      targetType: "tenant",
      targetId: tenant.$id,
      metadata: changes.length > 0 ? { changes } : undefined,
    });

    return NextResponse.json({ result: tenant });
  },
  { role: "admin", label: "PATCH /api/tenants/[id]" },
);

export const DELETE = withApiHandler<{ id: string }>(
  async (_request, { params, session }) => {
    const { id } = await params;

    const tenant = await TenantRepository.getById(id);
    await TenantRepository.delete(id);

    logActivity({
      actorId: session.$id,
      actorName: session.name || session.email,
      action: "tenant.delete",
      description: `Menghapus penyewa ${tenant.fullName}`,
      targetType: "tenant",
      targetId: id,
    });

    return NextResponse.json({ result: { success: true } });
  },
  { role: "admin", label: "DELETE /api/tenants/[id]" },
);
