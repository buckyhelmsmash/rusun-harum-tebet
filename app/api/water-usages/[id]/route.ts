import { NextResponse } from "next/server";
import { z } from "zod";
import { AuthError, verifyAuth } from "@/lib/auth/verify";
import { APPWRITE } from "@/lib/constants";
import { getAdminDb, getErrorMessage } from "@/lib/repositories/base";
import { SettingsRepository } from "@/lib/repositories/settings";

const DB_ID = APPWRITE.DATABASE_ID;

const updateMeterSchema = z.object({
  previousMeter: z.number().min(0),
  currentMeter: z.number().min(0),
});

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await verifyAuth(request);
    const { id } = await params;

    const body = await request.json();
    const parsed = updateMeterSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid payload", details: parsed.error.format() },
        { status: 400 },
      );
    }

    const { previousMeter, currentMeter } = parsed.data;

    if (currentMeter < previousMeter) {
      return NextResponse.json(
        { error: "Current meter cannot be less than previous meter" },
        { status: 400 },
      );
    }

    const usage = currentMeter - previousMeter;
    const settings = await SettingsRepository.get();
    const amount = usage * settings.waterRate;

    const db = await getAdminDb();
    const updated = await db.updateRow({
      databaseId: DB_ID,
      tableId: APPWRITE.COLLECTIONS.WATER_USAGES,
      rowId: id,
      data: {
        previousMeter,
        currentMeter,
        usage,
        amount,
      },
    });

    return NextResponse.json({ result: updated });
  } catch (error: unknown) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    console.error("[water-usages-patch]", error);
    return NextResponse.json(
      { error: getErrorMessage(error) },
      { status: 500 },
    );
  }
}
