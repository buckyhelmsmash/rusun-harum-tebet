import { Query } from "appwrite";
import { NextResponse } from "next/server";
import * as xlsx from "xlsx";
import { AuthError, verifyAuth } from "@/lib/auth/verify";
import { APPWRITE } from "@/lib/constants";
import { getAdminDb } from "@/lib/repositories/base";
import type { Unit } from "@/types";

const DB_ID = APPWRITE.DATABASE_ID;

export async function GET(req: Request) {
  try {
    try {
      await verifyAuth(req);
    } catch (error) {
      if (error instanceof AuthError) {
        return NextResponse.json({ error: error.message }, { status: 401 });
      }
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const db = await getAdminDb();

    const unitsResult = await db.listRows({
      databaseId: DB_ID,
      tableId: APPWRITE.COLLECTIONS.UNITS,
      queries: [Query.orderAsc("displayId"), Query.limit(500)],
    });

    const units = unitsResult.rows as unknown as Unit[];

    const templateRows = units.map((unit) => ({
      "Unit ID": unit.displayId,
      "Previous Meter": "",
      "Current Meter": "",
    }));

    const worksheet = xlsx.utils.json_to_sheet(templateRows);

    // Set reasonable column widths
    worksheet["!cols"] = [
      { wch: 12 }, // Unit ID
      { wch: 16 }, // Previous Meter
      { wch: 16 }, // Current Meter
    ];

    const workbook = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(workbook, worksheet, "Water Usages");

    const xlsxBuffer = xlsx.write(workbook, {
      type: "array",
      bookType: "xlsx",
    }) as ArrayBuffer;

    return new Response(new Uint8Array(xlsxBuffer), {
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition":
          'attachment; filename="water-usages-template.xlsx"',
      },
    });
  } catch (error) {
    console.error("[water-usages-template]", error);
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 },
    );
  }
}
