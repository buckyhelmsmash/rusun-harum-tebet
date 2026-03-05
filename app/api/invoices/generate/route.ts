import { randomInt, randomUUID } from "node:crypto";
import { format, subMonths } from "date-fns";
import { NextResponse } from "next/server";
import { Query } from "node-appwrite";
import { logActivity } from "@/lib/activity/logger";
import { AuthError, verifyAuth } from "@/lib/auth/verify";
import { APPWRITE } from "@/lib/constants";
import { getAdminDb, getErrorMessage } from "@/lib/repositories/base";
import { InvoiceRepository } from "@/lib/repositories/invoices";
import type { GlobalSettings } from "@/lib/repositories/settings";
import { SettingsRepository } from "@/lib/repositories/settings";
import type { CreateInvoiceInput } from "@/lib/schemas/invoices";
import type { WaterUsage } from "@/lib/schemas/water-usages";

const DB_ID = APPWRITE.DATABASE_ID;

function generateUniqueCode(): number {
  return randomInt(100, 1000);
}

function generateAccessToken(): string {
  return randomUUID();
}

interface UnitRow {
  $id: string;
  occupancyStatus: string;
  displayId: string;
}

interface VehicleRow {
  vehicleType: string;
}

function calculateCarFee(carCount: number, settings: GlobalSettings): number {
  if (carCount <= 0) return 0;
  if (carCount === 1) return settings.car1Fee;
  if (carCount === 2) return settings.car2Fee;
  return settings.car3Fee;
}

export async function POST(request: Request) {
  try {
    const session = await verifyAuth(request);
    const db = await getAdminDb();
    const settings = await SettingsRepository.get();
    const now = new Date();
    const billingPeriod = format(subMonths(now, 1), "yyyy-MM");
    const arrearsPeriod = format(subMonths(now, 2), "yyyy-MM");
    const dueDate = format(
      new Date(now.getFullYear(), now.getMonth(), 15),
      "yyyy-MM-dd",
    );

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
      queries: [Query.equal("period", billingPeriod), Query.limit(500)],
    });

    interface ExistingInvoice {
      $id: string;
      status: string;
      uniqueCode: number;
    }

    const existingByUnit = new Map<string, ExistingInvoice>();
    for (const row of existingInvoices.rows) {
      const inv = row as Record<string, unknown>;
      const unitField = inv.unit;
      let unitId = "";
      if (typeof unitField === "string") unitId = unitField;
      else if (unitField && typeof unitField === "object" && "$id" in unitField)
        unitId = (unitField as { $id: string }).$id;
      if (unitId) {
        existingByUnit.set(unitId, {
          $id: inv.$id as string,
          status: inv.status as string,
          uniqueCode: inv.uniqueCode as number,
        });
      }
    }

    const unitsToCreate: UnitRow[] = [];
    const unitsToUpdate: { unit: UnitRow; invoice: ExistingInvoice }[] = [];

    for (const unit of allUnits) {
      const existing = existingByUnit.get(unit.$id);
      if (!existing) {
        unitsToCreate.push(unit);
      } else if (existing.status === "unpaid") {
        unitsToUpdate.push({ unit, invoice: existing });
      }
    }

    const previousInvoices = await db.listRows({
      databaseId: DB_ID,
      tableId: APPWRITE.COLLECTIONS.INVOICES,
      queries: [
        Query.equal("period", arrearsPeriod),
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

    const existingCodesResult = await db.listRows({
      databaseId: DB_ID,
      tableId: APPWRITE.COLLECTIONS.INVOICES,
      queries: [
        Query.equal("period", billingPeriod),
        Query.limit(500),
        Query.select(["uniqueCode"]),
      ],
    });
    const usedCodes = new Set<number>(
      existingCodesResult.rows.map(
        (row) => (row as unknown as { uniqueCode: number }).uniqueCode,
      ),
    );

    const waterUsagesResult = await db.listRows({
      databaseId: DB_ID,
      tableId: APPWRITE.COLLECTIONS.WATER_USAGES,
      queries: [Query.equal("period", billingPeriod), Query.limit(500)],
    });

    const waterUsageMap = new Map<string, number>();
    for (const row of waterUsagesResult.rows) {
      const w = row as unknown as WaterUsage;
      let unitId = "";
      if (typeof w.unit === "string") unitId = w.unit;
      else if (w.unit && typeof w.unit === "object") unitId = w.unit.$id;
      if (unitId) {
        waterUsageMap.set(unitId, w.amount || 0);
      }
    }

    async function getVehicleFee(unitId: string): Promise<number> {
      const vehiclesResult = await db.listRows({
        databaseId: DB_ID,
        tableId: APPWRITE.COLLECTIONS.VEHICLES,
        queries: [Query.equal("unit", unitId), Query.limit(25)],
      });
      const carCount = (vehiclesResult.rows as unknown as VehicleRow[]).filter(
        (v) => v.vehicleType === "car",
      ).length;
      return calculateCarFee(carCount, settings);
    }

    let created = 0;
    let updated = 0;
    const createdInvoices: { invoiceNumber: string; unitDisplayId: string }[] =
      [];
    const updatedInvoices: { invoiceNumber: string; unitDisplayId: string }[] =
      [];

    for (const unit of unitsToCreate) {
      const vehicleFee = await getVehicleFee(unit.$id);
      const arrears = arrearsMap.get(unit.$id) ?? 0;
      const waterFee = waterUsageMap.get(unit.$id) ?? 0;

      let uniqueCode = generateUniqueCode();
      while (usedCodes.has(uniqueCode)) {
        uniqueCode = generateUniqueCode();
      }
      usedCodes.add(uniqueCode);

      const totalDue =
        settings.publicFacilityFee +
        settings.guardFee +
        waterFee +
        vehicleFee +
        arrears +
        uniqueCode;

      const condensedPeriod = billingPeriod.replace("-", "");
      const invoiceNumber = `INV-${condensedPeriod}-${unit.displayId}`;

      const data: CreateInvoiceInput = {
        unit: unit.$id,
        period: billingPeriod,
        status: "unpaid",
        dueDate,
        publicFacilityFee: settings.publicFacilityFee,
        guardFee: settings.guardFee,
        waterFee,
        vehicleFee,
        arrears,
        uniqueCode,
        totalDue,
        accessToken: generateAccessToken(),
        invoiceNumber,
      };

      await InvoiceRepository.create(data);
      createdInvoices.push({ invoiceNumber, unitDisplayId: unit.displayId });
      created++;
    }

    for (const { unit, invoice } of unitsToUpdate) {
      const vehicleFee = await getVehicleFee(unit.$id);
      const arrears = arrearsMap.get(unit.$id) ?? 0;
      const waterFee = waterUsageMap.get(unit.$id) ?? 0;

      const totalDue =
        settings.publicFacilityFee +
        settings.guardFee +
        waterFee +
        vehicleFee +
        arrears +
        invoice.uniqueCode;

      await InvoiceRepository.update(invoice.$id, {
        publicFacilityFee: settings.publicFacilityFee,
        guardFee: settings.guardFee,
        waterFee,
        vehicleFee,
        arrears,
        totalDue,
      });

      const condensedPeriod = billingPeriod.replace("-", "");
      const invoiceNumber = `INV-${condensedPeriod}-${unit.displayId}`;
      updatedInvoices.push({ invoiceNumber, unitDisplayId: unit.displayId });
      updated++;
    }

    if (created > 0 || updated > 0) {
      logActivity({
        actorId: session.$id,
        actorName: session.name || session.email,
        action: "invoice.generate",
        description: `Membuat ${created} tagihan baru, memperbarui ${updated} tagihan untuk periode ${billingPeriod}`,
        targetType: "invoice",
        metadata: {
          created,
          updated,
          period: billingPeriod,
          createdInvoices,
          updatedInvoices,
        },
      });
    }

    return NextResponse.json({
      count: created,
      updated,
      period: billingPeriod,
      message: `Membuat ${created} tagihan baru, memperbarui ${updated} tagihan untuk periode ${billingPeriod}`,
    });
  } catch (error: unknown) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    console.error("[generate-invoices] Error:", error);
    return NextResponse.json(
      { error: getErrorMessage(error) },
      { status: 500 },
    );
  }
}
