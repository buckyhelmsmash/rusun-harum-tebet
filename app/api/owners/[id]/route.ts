import { NextResponse } from "next/server";
import { getChanges, logActivity } from "@/lib/activity/logger";
import { withApiHandler } from "@/lib/api/with-api-handler";
import { OwnerRepository } from "@/lib/repositories/owners";
import { updateOwnerSchema } from "@/lib/schemas/residents";

export const GET = withApiHandler<{ id: string }>(
  async (_request, { params }) => {
    const { id } = await params;
    const owner = await OwnerRepository.getById(id);
    return NextResponse.json(owner);
  },
  { role: "admin", label: "GET /api/owners/[id]" },
);

export const PATCH = withApiHandler<{ id: string }>(
  async (request, { params, session }) => {
    const { id } = await params;
    const body = await request.json();
    const payload = body.data ?? body;
    const validated = updateOwnerSchema.parse(payload);

    const existingOwner = await OwnerRepository.getById(id);
    const owner = await OwnerRepository.update(id, validated);
    const changes = getChanges(existingOwner, validated);

    logActivity({
      actorId: session.$id,
      actorName: session.name || session.email,
      action: "owner.update",
      description: `Memperbarui pemilik ${owner.fullName}`,
      targetType: "owner",
      targetId: owner.$id,
      metadata: changes.length > 0 ? { changes } : undefined,
    });

    return NextResponse.json({ result: owner });
  },
  { role: "admin", label: "PATCH /api/owners/[id]" },
);

export const DELETE = withApiHandler<{ id: string }>(
  async (_request, { params, session }) => {
    const { id } = await params;

    const owner = await OwnerRepository.getById(id);
    await OwnerRepository.delete(id);

    logActivity({
      actorId: session.$id,
      actorName: session.name || session.email,
      action: "owner.delete",
      description: `Menghapus pemilik ${owner.fullName}`,
      targetType: "owner",
      targetId: id,
    });

    return NextResponse.json({ result: { success: true } });
  },
  { role: "admin", label: "DELETE /api/owners/[id]" },
);
