import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { getChanges, logActivity } from "@/lib/activity/logger";
import { AuthError, verifyAuth } from "@/lib/auth/verify";
import { getErrorMessage } from "@/lib/repositories/base";
import { OwnerRepository } from "@/lib/repositories/owners";
import { updateOwnerSchema } from "@/lib/schemas/residents";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await verifyAuth(request);
    const { id } = await params;
    const owner = await OwnerRepository.getById(id);
    return NextResponse.json(owner);
  } catch (error: unknown) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    console.error("GET /api/owners/[id] -", getErrorMessage(error));
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
    const validated = updateOwnerSchema.parse(payload);

    const existingOwner = await OwnerRepository.getById(id);
    const owner = await OwnerRepository.update(id, validated);
    const changes = getChanges(existingOwner, validated);

    logActivity({
      actorId: session.$id,
      actorName: session.name || session.email,
      action: "owner.update",
      description: `Updated owner ${owner.fullName}`,
      targetType: "owner",
      targetId: owner.$id,
      metadata: changes.length > 0 ? { changes } : undefined,
    });

    return NextResponse.json({ result: owner });
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
    console.error("PATCH /api/owners/[id] -", getErrorMessage(error));
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
    const { id } = await params;

    const owner = await OwnerRepository.getById(id);
    await OwnerRepository.delete(id);

    logActivity({
      actorId: session.$id,
      actorName: session.name || session.email,
      action: "owner.delete",
      description: `Removed owner ${owner.fullName}`,
      targetType: "owner",
      targetId: id,
    });

    return NextResponse.json({ result: { success: true } });
  } catch (error: unknown) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    console.error("DELETE /api/owners/[id] -", getErrorMessage(error));
    return NextResponse.json(
      { error: getErrorMessage(error) },
      { status: 500 },
    );
  }
}
