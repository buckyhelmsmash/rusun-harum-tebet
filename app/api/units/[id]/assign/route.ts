import { NextResponse } from "next/server";
import { ZodError, z } from "zod";
import { logActivity } from "@/lib/activity/logger";
import { AuthError, verifyAuth } from "@/lib/auth/verify";
import { getErrorMessage } from "@/lib/repositories/base";
import { OwnerRepository } from "@/lib/repositories/owners";
import { TenantRepository } from "@/lib/repositories/tenants";
import { UnitRepository } from "@/lib/repositories/units";

const assignSchema = z.object({
  type: z.enum(["owner", "tenant"]),
  residentId: z.string().min(1, "Resident ID is required"),
  startDate: z.string().nullable().optional(),
  endDate: z.string().nullable().optional(),
});

const removeSchema = z.object({
  type: z.enum(["owner", "tenant"]),
});

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await verifyAuth(request);
    const { id: unitId } = await params;
    const body = await request.json();
    const { type, residentId, startDate, endDate } = assignSchema.parse(body);

    const unit = await UnitRepository.getById(unitId);

    // Update the unit's relationship field
    await UnitRepository.update(unitId, { [type]: residentId });

    // For tenants, also update lease dates on the tenant record
    if (
      type === "tenant" &&
      (startDate !== undefined || endDate !== undefined)
    ) {
      await TenantRepository.update(residentId, {
        ...(startDate !== undefined && { startDate }),
        ...(endDate !== undefined && { endDate }),
      });
    }

    // Fetch the resident name for the activity log
    const resident =
      type === "owner"
        ? await OwnerRepository.getById(residentId)
        : await TenantRepository.getById(residentId);
    const residentName = resident?.fullName ?? "Unknown";

    logActivity({
      actorId: session.$id,
      actorName: session.name || session.email,
      action: `${type}.assign`,
      description: `Assigned ${type} ${residentName} to unit ${unit.displayId}`,
      targetType: type,
      targetId: residentId,
      unitId,
    });

    const updated = await UnitRepository.getById(unitId);
    return NextResponse.json({ result: updated });
  } catch (error: unknown) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: "Invalid payload", details: error.flatten() },
        { status: 400 },
      );
    }
    console.error("POST /api/units/[id]/assign -", getErrorMessage(error));
    return NextResponse.json(
      { error: getErrorMessage(error) },
      { status: 500 },
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await verifyAuth(request);
    const { id: unitId } = await params;
    const body = await request.json();
    const { type } = removeSchema.parse(body);

    const unit = await UnitRepository.getById(unitId);
    const removedId = type === "owner" ? unit.owner?.$id : unit.tenant?.$id;

    if (!removedId) {
      return NextResponse.json(
        { error: `No ${type} is currently assigned to this unit` },
        { status: 400 },
      );
    }

    // Clear lease dates when removing a tenant
    if (type === "tenant") {
      await TenantRepository.update(removedId, {
        startDate: null,
        endDate: null,
      });
    }

    await UnitRepository.update(unitId, { [type]: null });

    const removedName =
      type === "owner" ? unit.owner?.fullName : unit.tenant?.fullName;

    logActivity({
      actorId: session.$id,
      actorName: session.name || session.email,
      action: `${type}.remove`,
      description: `Removed ${type} ${removedName ?? "Unknown"} from unit ${unit.displayId}`,
      targetType: type,
      targetId: removedId,
      unitId,
    });

    const updated = await UnitRepository.getById(unitId);
    return NextResponse.json({ result: updated });
  } catch (error: unknown) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: "Invalid payload", details: error.flatten() },
        { status: 400 },
      );
    }
    console.error("DELETE /api/units/[id]/assign -", getErrorMessage(error));
    return NextResponse.json(
      { error: getErrorMessage(error) },
      { status: 500 },
    );
  }
}
