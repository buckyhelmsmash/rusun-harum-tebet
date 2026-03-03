import { NextResponse } from "next/server";
import { ID } from "node-appwrite";
import { createAdminClient } from "@/lib/appwrite/server";
import { APPWRITE } from "@/lib/constants";

export async function POST(request: Request) {
  try {
    const { tablesDb } = await createAdminClient();
    const body = await request.json();
    const payload = body.data || body;

    const newVehicle = await tablesDb.createRow({
      databaseId: APPWRITE.DATABASE_ID,
      tableId: APPWRITE.COLLECTIONS.VEHICLES,
      rowId: ID.unique(),
      data: payload,
    });

    return NextResponse.json({ result: newVehicle });
  } catch (error: any) {
    console.error("POST /api/vehicles - Error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to create vehicle" },
      { status: 500 },
    );
  }
}
