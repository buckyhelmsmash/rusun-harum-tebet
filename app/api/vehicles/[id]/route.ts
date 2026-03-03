import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/appwrite/server";
import { APPWRITE } from "@/lib/constants";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const { tablesDb } = await createAdminClient();
    const body = await request.json();
    const payload = body.data || body;

    const updatedVehicle = await tablesDb.updateRow({
      databaseId: APPWRITE.DATABASE_ID,
      tableId: APPWRITE.COLLECTIONS.VEHICLES,
      rowId: id,
      data: payload,
    });

    return NextResponse.json({ result: updatedVehicle });
  } catch (error: any) {
    console.error(`PATCH /api/vehicles - Error:`, error);
    return NextResponse.json(
      { error: error?.message || "Failed to update vehicle" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const { tablesDb } = await createAdminClient();

    await tablesDb.deleteRow({
      databaseId: APPWRITE.DATABASE_ID,
      tableId: APPWRITE.COLLECTIONS.VEHICLES,
      rowId: id,
    });

    return NextResponse.json({ result: { success: true } });
  } catch (error: any) {
    console.error(`DELETE /api/vehicles - Error:`, error);
    return NextResponse.json(
      { error: error?.message || "Failed to delete vehicle" },
      { status: 500 },
    );
  }
}
