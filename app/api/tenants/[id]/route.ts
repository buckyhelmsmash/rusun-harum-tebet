import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { getChanges, logActivity } from "@/lib/activity/logger";
import { AuthError, verifyAuth } from "@/lib/auth/verify";
import { getErrorMessage } from "@/lib/repositories/base";
import { TenantRepository } from "@/lib/repositories/tenants";
import { updateTenantSchema } from "@/lib/schemas/residents";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await verifyAuth(request);
    const { id } = await params;
    const tenant = await TenantRepository.getById(id);
    return NextResponse.json(tenant);
  } catch (error: unknown) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    console.error("GET /api/tenants/[id] -", getErrorMessage(error));
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
    console.error("PATCH /api/tenants/[id] -", getErrorMessage(error));
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
  } catch (error: unknown) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    console.error("DELETE /api/tenants/[id] -", getErrorMessage(error));
    return NextResponse.json(
      { error: getErrorMessage(error) },
      { status: 500 },
    );
  }
}
