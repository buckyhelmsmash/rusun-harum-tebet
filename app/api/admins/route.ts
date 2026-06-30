import { NextResponse } from "next/server";
import { AuthError, ForbiddenError, requireRole } from "@/lib/auth/verify";
import { adminRepository } from "@/lib/repositories/admins";
import { getErrorMessage } from "@/lib/repositories/base";

export async function GET(request: Request) {
  try {
    // Only superadmins can list other admins
    await requireRole(request, "superadmin");

    const admins = await adminRepository.list();
    return NextResponse.json(admins);
  } catch (error: unknown) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    if (error instanceof ForbiddenError) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    console.error("GET /api/admins -", getErrorMessage(error));
    return NextResponse.json(
      { error: getErrorMessage(error) },
      { status: 500 },
    );
  }
}
