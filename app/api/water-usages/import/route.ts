import { ID, Query } from "appwrite";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { z } from "zod";
import { AuthError, verifyAuth } from "@/lib/auth/verify";
import { APPWRITE } from "@/lib/constants";
import { getAdminDb } from "@/lib/repositories/base";
import { excelImportRowSchema } from "@/lib/schemas/water-usages";
import type { Unit } from "@/types";

const DB_ID = APPWRITE.DATABASE_ID;
const WATER_RATE_PER_M3 = 12500; // Harcoded for now, will be moved to settings

const importPayloadSchema = z.object({
  period: z.string().min(1),
  rows: z.array(excelImportRowSchema),
});

export async function POST(req: Request) {
  try {
    try {
      await verifyAuth(req);
    } catch (error) {
      if (error instanceof AuthError) {
        return NextResponse.json({ error: error.message }, { status: 401 });
      }
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = importPayloadSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid payload format", details: parsed.error.format() },
        { status: 400 },
      );
    }

    const { period, rows } = parsed.data;
    const db = await getAdminDb();

    // 1. Fetch all units to map Unit ID to internal $id
    const unitsResult = await db.listRows({
      databaseId: DB_ID,
      tableId: APPWRITE.COLLECTIONS.UNITS,
      queries: [Query.limit(500)],
    });

    const unitMap = new Map<string, string>();
    for (const doc of unitsResult.rows) {
      const u = doc as unknown as Unit;
      // We assume Unit ID in excel maps to displayId (e.g., A101)
      unitMap.set(u.displayId.toLowerCase(), u.$id);
    }

    // 2. Fetch existing water usages for this period
    const existingResult = await db.listRows({
      databaseId: DB_ID,
      tableId: APPWRITE.COLLECTIONS.WATER_USAGES,
      queries: [Query.equal("period", period), Query.limit(500)],
    });

    const existingMap = new Map<string, string>();
    for (const doc of existingResult.rows) {
      const uId =
        typeof doc.unit === "object" && doc.unit
          ? (doc.unit as any).$id
          : doc.unit;
      if (uId) existingMap.set(uId, doc.$id);
    }

    let processed = 0;
    let skipped = 0;
    const errors: string[] = [];

    // 3. Process each row
    for (const [index, row] of rows.entries()) {
      const displayId = row["Unit ID"].trim().toLowerCase();
      const unitId = unitMap.get(displayId);

      if (!unitId) {
        skipped++;
        errors.push(`Row ${index + 1}: Unit ${row["Unit ID"]} not found`);
        continue;
      }

      if (row["Current Meter"] < row["Previous Meter"]) {
        skipped++;
        errors.push(
          `Row ${index + 1}: Current meter is less than previous meter for ${row["Unit ID"]}`,
        );
        continue;
      }

      const usage = row["Current Meter"] - row["Previous Meter"];
      const amount = usage * WATER_RATE_PER_M3;

      const data = {
        unit: unitId,
        period,
        previousMeter: row["Previous Meter"],
        currentMeter: row["Current Meter"],
        usage,
        amount,
        isBilled: false,
      };

      const existingId = existingMap.get(unitId);

      try {
        if (existingId) {
          await db.updateRow({
            databaseId: DB_ID,
            tableId: APPWRITE.COLLECTIONS.WATER_USAGES,
            rowId: existingId,
            data,
            permissions: [],
          });
        } else {
          await db.createRow({
            databaseId: DB_ID,
            tableId: APPWRITE.COLLECTIONS.WATER_USAGES,
            rowId: ID.unique(),
            data,
            permissions: [],
          });
        }
        processed++;
      } catch (e) {
        skipped++;
        errors.push(
          `Row ${index + 1}: Failed to save data for ${row["Unit ID"]}`,
        );
      }
    }

    return NextResponse.json({
      success: true,
      processed,
      skipped,
      errors,
    });
  } catch (error) {
    console.error("[water-usages-import]", error);
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 },
    );
  }
}
