import { NextResponse } from "next/server";
import { logActivity } from "@/lib/activity/logger";
import { withApiHandler } from "@/lib/api/with-api-handler";
import { adminRepository } from "@/lib/repositories/admins";

export const DELETE = withApiHandler<{ id: string }>(
  async (_request, { params, session }) => {
    const { id } = await params;

    if (session.$id === id) {
      return NextResponse.json(
        { error: "Cannot remove your own admin access" },
        { status: 400 },
      );
    }

    await adminRepository.removeAdmin(id);

    logActivity({
      actorId: session.$id,
      actorName: session.name || session.email,
      action: "admin.delete",
      description: "Mencabut akses admin pengguna (Soft Delete)",
      targetType: "admin",
      targetId: id,
    });

    return NextResponse.json({ result: { success: true } });
  },
  { role: "superadmin", label: "DELETE /api/admins/[id]" },
);
