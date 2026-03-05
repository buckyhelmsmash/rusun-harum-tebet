import { NextResponse } from "next/server";
import { ZodError, z } from "zod";
import { logActivity } from "@/lib/activity/logger";
import { AuthError, verifyAuth } from "@/lib/auth/verify";
import { getErrorMessage } from "@/lib/repositories/base";
import { OwnerRepository } from "@/lib/repositories/owners";
import { TenantRepository } from "@/lib/repositories/tenants";
import { UnitRepository } from "@/lib/repositories/units";
import { VehicleRepository } from "@/lib/repositories/vehicles";
import type { UpdateUnitInput } from "@/lib/schemas/units";

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

    if (type === "tenant" && !unit.ownerId) {
      return NextResponse.json(
        {
          error:
            "Cannot assign a tenant without an owner. Assign an owner first.",
        },
        { status: 400 },
      );
    }

    const statusUpdate: UpdateUnitInput = { [type]: residentId };

    if (type === "owner" && !unit.tenantId) {
      statusUpdate.occupancyStatus = "owner_occupied";
      statusUpdate.billRecipient = "owner";
      statusUpdate.isOccupied = true;
    } else if (type === "tenant") {
      statusUpdate.occupancyStatus = "rented";
      statusUpdate.billRecipient = "tenant";
      statusUpdate.isOccupied = true;
    }

    await UnitRepository.update(unitId, statusUpdate);

    if (
      type === "tenant" &&
      (startDate !== undefined || endDate !== undefined)
    ) {
      await TenantRepository.update(residentId, {
        ...(startDate !== undefined && { startDate }),
        ...(endDate !== undefined && { endDate }),
      });
    }

    const resident =
      type === "owner"
        ? await OwnerRepository.getById(residentId)
        : await TenantRepository.getById(residentId);
    const residentName = resident?.fullName ?? "Unknown";

    logActivity({
      actorId: session.$id,
      actorName: session.name || session.email,
      action: `${type}.assign`,
      description: `Menugaskan ${type === "owner" ? "pemilik" : "penyewa"} ${residentName} ke unit ${unit.displayId}`,
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

    const removedName =
      type === "owner" ? unit.owner?.fullName : unit.tenant?.fullName;

    if (type === "owner") {
      // Cascade: also remove tenant if present
      if (unit.tenantId && unit.tenant?.$id) {
        await TenantRepository.update(unit.tenant.$id, {
          startDate: null,
          endDate: null,
        });
        await UnitRepository.update(unitId, { tenant: null });

        logActivity({
          actorId: session.$id,
          actorName: session.name || session.email,
          action: "tenant.remove",
          description: `Menghapus penyewa ${unit.tenant.fullName ?? "Tidak diketahui"} dari unit ${unit.displayId} (otomatis karena penghapusan pemilik)`,
          targetType: "tenant",
          targetId: unit.tenant.$id,
          unitId,
        });
      }

      // Cascade: also remove all vehicles
      if (unit.vehicles && unit.vehicles.length > 0) {
        for (const vehicle of unit.vehicles) {
          await VehicleRepository.delete(vehicle.$id);

          logActivity({
            actorId: session.$id,
            actorName: session.name || session.email,
            action: "vehicle.delete",
            description: `Menghapus kendaraan ${vehicle.licensePlate} dari unit ${unit.displayId} (otomatis karena penghapusan pemilik)`,
            targetType: "vehicle",
            targetId: vehicle.$id,
            unitId,
          });
        }
      }

      await UnitRepository.update(unitId, {
        owner: null,
        occupancyStatus: "vacant",
        billRecipient: "owner",
        isOccupied: false,
      });
    } else {
      // Removing tenant only
      await TenantRepository.update(removedId, {
        startDate: null,
        endDate: null,
      });

      await UnitRepository.update(unitId, {
        tenant: null,
        occupancyStatus: "owner_occupied",
        billRecipient: "owner",
        isOccupied: true,
      });
    }

    logActivity({
      actorId: session.$id,
      actorName: session.name || session.email,
      action: `${type}.remove`,
      description: `Menghapus ${type === "owner" ? "pemilik" : "penyewa"} ${removedName ?? "Tidak diketahui"} dari unit ${unit.displayId}`,
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
