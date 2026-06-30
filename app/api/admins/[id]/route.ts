import { NextResponse } from "next/server";
import { logActivity } from "@/lib/activity/logger";
import { AuthError, ForbiddenError, requireRole } from "@/lib/auth/verify";
import { AdminRepository } from "@/lib/repositories/admins";
import { getErrorMessage } from "@/lib/repositories/base";

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    // Only superadmins can remove admins
    const session = await requireRole(request, "superadmin");
    const { id } = await params;

    // Prevent self-deletion
    if (session.$id === id) {
      return NextResponse.json(
        { error: "Cannot remove your own admin access" },
        { status: 400 },
      );
    }

    await AdminRepository.removeAdmin(id);

    logActivity({
      actorId: session.$id,
      actorName: session.name || session.email,
      action: "admin.delete",
      description: `Mencabut akses admin pengguna (Soft Delete)`,
      targetType: "admin",
      targetId: id,
    });

    return NextResponse.json({ result: { success: true } });
  } catch (error: unknown) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    if (error instanceof ForbiddenError) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    console.error("DELETE /api/admins/[id] -", getErrorMessage(error));
    return NextResponse.json(
      { error: getErrorMessage(error) },
      { status: 500 },
    );
  }
}
