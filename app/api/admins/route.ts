import { NextResponse } from "next/server";
import { withApiHandler } from "@/lib/api/with-api-handler";
import { adminRepository } from "@/lib/repositories/admins";

export const GET = withApiHandler(
  async () => {
    const admins = await adminRepository.list();
    return NextResponse.json(admins);
  },
  { role: "superadmin", label: "GET /api/admins" },
);
