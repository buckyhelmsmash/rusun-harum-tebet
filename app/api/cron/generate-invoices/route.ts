import { endOfMonth, format, subMonths } from "date-fns";
import { NextResponse } from "next/server";
import { Query } from "node-appwrite";
import { APPWRITE } from "@/lib/constants";
import { getAdminDb } from "@/lib/repositories/base";
import { InvoiceRepository } from "@/lib/repositories/invoices";
import type { CreateInvoiceInput } from "@/lib/schemas/invoices";
import type { Vehicle } from "@/types";

const DB_ID = APPWRITE.DATABASE_ID;

const DEFAULT_IPL_FEE = 250_000;
const DEFAULT_WATER_FEE = 100_000;

function generateUniqueCode(): number {
  return Math.floor(Math.random() * 900) + 100;
}

function generateAccessToken(): string {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let token = "";
  for (let i = 0; i < 32; i++) {
    token += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return token;
}

interface UnitRow {
  $id: string;
  occupancyStatus: string;
  displayId: string;
}

export async function POST() {
  try {
    const db = await getAdminDb();
    const now = new Date();
    const currentPeriod = format(now, "yyyy-MM");
    const previousPeriod = format(subMonths(now, 1), "yyyy-MM");
    const dueDate = format(endOfMonth(now), "yyyy-MM-dd");

    const allUnits: UnitRow[] = [];
    let offset = 0;
    const batchSize = 100;

    while (true) {
      const batch = await db.listRows({
        databaseId: DB_ID,
        tableId: APPWRITE.COLLECTIONS.UNITS,
        queries: [
          Query.notEqual("occupancyStatus", "vacant"),
          Query.limit(batchSize),
          Query.offset(offset),
        ],
      });

      allUnits.push(...(batch.rows as unknown as UnitRow[]));
      if (allUnits.length >= batch.total) break;
      offset += batchSize;
    }

    if (allUnits.length === 0) {
      return NextResponse.json({
        count: 0,
        message: "No occupied units found",
      });
    }

    const existingInvoices = await db.listRows({
      databaseId: DB_ID,
      tableId: APPWRITE.COLLECTIONS.INVOICES,
      queries: [Query.equal("period", currentPeriod), Query.limit(500)],
    });

    const invoicedUnitIds = new Set(
      existingInvoices.rows.map((row) => {
        const unitField = (row as Record<string, unknown>).unit;
        if (typeof unitField === "string") return unitField;
        if (unitField && typeof unitField === "object" && "$id" in unitField) {
          return (unitField as { $id: string }).$id;
        }
        return "";
      }),
    );

    const unitsToGenerate = allUnits.filter(
      (unit) => !invoicedUnitIds.has(unit.$id),
    );

    if (unitsToGenerate.length === 0) {
      return NextResponse.json({
        count: 0,
        message: `All ${allUnits.length} occupied units already have invoices for ${currentPeriod}`,
      });
    }

    const previousInvoices = await db.listRows({
      databaseId: DB_ID,
      tableId: APPWRITE.COLLECTIONS.INVOICES,
      queries: [
        Query.equal("period", previousPeriod),
        Query.equal("status", "unpaid"),
        Query.limit(500),
      ],
    });

    const arrearsMap = new Map<string, number>();
    for (const row of previousInvoices.rows) {
      const inv = row as Record<string, unknown>;
      const unitField = inv.unit;
      let unitId = "";
      if (typeof unitField === "string") unitId = unitField;
      else if (
        unitField &&
        typeof unitField === "object" &&
        "$id" in unitField
      ) {
        unitId = (unitField as { $id: string }).$id;
      }
      if (unitId) {
        arrearsMap.set(unitId, (inv.totalDue as number) || 0);
      }
    }

    let created = 0;

    for (const unit of unitsToGenerate) {
      const vehiclesResult = await db.listRows({
        databaseId: DB_ID,
        tableId: APPWRITE.COLLECTIONS.VEHICLES,
        queries: [Query.equal("unit", unit.$id), Query.limit(25)],
      });

      const vehicleFee = (vehiclesResult.rows as unknown as Vehicle[]).reduce(
        (sum, v) => sum + (v.monthlyRate ?? 0),
        0,
      );

      const arrears = arrearsMap.get(unit.$id) ?? 0;
      const uniqueCode = generateUniqueCode();
      const totalDue =
        DEFAULT_IPL_FEE + DEFAULT_WATER_FEE + vehicleFee + arrears + uniqueCode;

      const data: CreateInvoiceInput = {
        unit: unit.$id,
        period: currentPeriod,
        status: "unpaid",
        dueDate,
        iplFee: DEFAULT_IPL_FEE,
        waterFee: DEFAULT_WATER_FEE,
        vehicleFee,
        arrears,
        uniqueCode,
        totalDue,
        accessToken: generateAccessToken(),
      };

      await InvoiceRepository.create(data);
      created++;
    }

    return NextResponse.json({
      count: created,
      period: currentPeriod,
      message: `Generated ${created} invoices for ${currentPeriod}`,
    });
  } catch (error) {
    console.error("[generate-invoices] Error:", error);
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 },
    );
  }
}
