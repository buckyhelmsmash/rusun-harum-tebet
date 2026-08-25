import { NextResponse } from "next/server";
import { getChanges, logActivity } from "@/lib/activity/logger";
import { withApiHandler } from "@/lib/api/with-api-handler";
import { UnitRepository } from "@/lib/repositories/units";
import { updateUnitSchema } from "@/lib/schemas/units";

export const GET = withApiHandler<{ id: string }>(
  async (_request, { params }) => {
    const { id } = await params;
    const unit = await UnitRepository.getById(id);
    return NextResponse.json({ result: unit });
  },
  { role: "admin", label: "GET /api/units/[id]" },
);

export const PATCH = withApiHandler<{ id: string }>(
  async (request, { params, session }) => {
    const { id } = await params;
    const body = await request.json();
    const payload = body.data ?? body;
    const validated = updateUnitSchema.parse(payload);
    const existingUnit = await UnitRepository.getById(id);
    const unit = await UnitRepository.update(id, validated);
    const changes = getChanges(existingUnit, validated);

    logActivity({
      actorId: session.$id,
      actorName: session.name || session.email,
      action: "unit.update",
      description: `Memperbarui unit ${unit.displayId}`,
      targetType: "unit",
      targetId: unit.$id,
      unitId: unit.$id,
      metadata: changes.length > 0 ? { changes } : undefined,
    });

    return NextResponse.json({ result: unit });
  },
  { role: "admin", label: "PATCH /api/units/[id]" },
);
