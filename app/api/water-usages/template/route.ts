import { Query } from "appwrite";
import * as xlsx from "xlsx";
import { withApiHandler } from "@/lib/api/with-api-handler";
import { APPWRITE } from "@/lib/constants";
import { getDb } from "@/lib/repositories/base";
import type { Unit } from "@/types";

const DB_ID = APPWRITE.DATABASE_ID;

export const GET = withApiHandler(
  async () => {
    const db = await getDb();

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
  },
  { role: "admin", label: "GET /api/water-usages/template" },
);
