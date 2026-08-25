import { NextResponse } from "next/server";
import { z } from "zod";
import { getChanges, logActivity } from "@/lib/activity/logger";
import { withApiHandler } from "@/lib/api/with-api-handler";
import { APPWRITE } from "@/lib/constants";
import { getDb } from "@/lib/repositories/base";
import { SettingsRepository } from "@/lib/repositories/settings";

const DB_ID = APPWRITE.DATABASE_ID;

const updateMeterSchema = z.object({
  previousMeter: z.number().min(0),
  currentMeter: z.number().min(0),
});

export const PATCH = withApiHandler<{ id: string }>(
  async (request, { params, session }) => {
    const { id } = await params;

    const body = await request.json();
    const { previousMeter, currentMeter } = updateMeterSchema.parse(body);

    if (currentMeter < previousMeter) {
      return NextResponse.json(
        { error: "Current meter cannot be less than previous meter" },
        { status: 400 },
      );
    }

    const usage = currentMeter - previousMeter;
    const settings = await SettingsRepository.get();
    const amount = usage * settings.waterRate;

    const db = await getDb();

    const oldRow = await db.getRow({
      databaseId: DB_ID,
      tableId: APPWRITE.COLLECTIONS.WATER_USAGES,
      rowId: id,
    });

    const newData = {
      previousMeter,
      currentMeter,
      usage,
      amount,
    };

    const updated = await db.updateRow({
      databaseId: DB_ID,
      tableId: APPWRITE.COLLECTIONS.WATER_USAGES,
      rowId: id,
      data: newData,
    });

    const changes = getChanges(oldRow, newData);

    if (changes.length > 0) {
      logActivity({
        actorId: session.$id,
        actorName: session.name || session.email,
        action: "water_usage.update",
        description: `Memperbarui penggunaan air untuk periode ${updated.period}`,
        targetType: "water_usage",
        targetId: updated.$id,
        unitId:
          typeof updated.unit === "object" ? updated.unit.$id : updated.unit,
        metadata: { changes },
      });
    }

    return NextResponse.json({ result: updated });
  },
  { role: "admin", label: "PATCH /api/water-usages/[id]" },
);
