import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { logActivity } from "@/lib/activity/logger";
import { AuthError, verifyAuth } from "@/lib/auth/verify";
import { getErrorMessage } from "@/lib/repositories/base";
import { UnitRepository } from "@/lib/repositories/units";
import { updateUnitSchema } from "@/lib/schemas/units";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await verifyAuth(request);
    const { id } = await params;
    const unit = await UnitRepository.getById(id);
    return NextResponse.json({ result: unit });
  } catch (error: unknown) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    console.error("GET /api/units/[id] -", getErrorMessage(error));
    return NextResponse.json(
      { error: getErrorMessage(error) },
      { status: 500 },
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await verifyAuth(request);
    const { id } = await params;
    const body = await request.json();
    const payload = body.data ?? body;
    const validated = updateUnitSchema.parse(payload);
    const unit = await UnitRepository.update(id, validated);

    logActivity({
      actorId: session.$id,
      actorName: session.name || session.email,
      action: "unit.update",
      description: `Updated unit ${unit.displayId}`,
      targetType: "unit",
      targetId: unit.$id,
      unitId: unit.$id,
      metadata: { updatedFields: Object.keys(validated) },
    });

    return NextResponse.json({ result: unit });
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
    console.error("PATCH /api/units/[id] -", getErrorMessage(error));
    return NextResponse.json(
      { error: getErrorMessage(error) },
      { status: 500 },
    );
  }
}
