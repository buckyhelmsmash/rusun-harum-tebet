import { NextResponse } from "next/server";
import { APPWRITE } from "@/lib/constants";
import { getAdminDb, getErrorMessage } from "@/lib/repositories/base";
import { InvoiceRepository } from "@/lib/repositories/invoices";
import type { Owner, Tenant, Unit } from "@/types";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ accessToken: string }> },
) {
  try {
    const { accessToken } = await params;
    const invoice = await InvoiceRepository.getByAccessToken(accessToken);

    if (!invoice) {
      return NextResponse.json(
        { error: "Tagihan tidak ditemukan" },
        { status: 404 },
      );
    }

    let unit = invoice.unit as Unit | undefined;
    let ownerName: string | undefined;
    let tenantName: string | undefined;

    if (unit) {
      const db = await getAdminDb();

      // If unit is just a string ID, fetch the full document
      if (typeof unit === "string") {
        try {
          unit = await db.getRow<Unit & { $tableId: string }>(
            APPWRITE.DATABASE_ID,
            APPWRITE.COLLECTIONS.UNITS,
            unit,
          );
        } catch {
          unit = undefined;
        }
      }

      if (unit) {
        if (typeof unit.owner === "string" && unit.owner) {
          try {
            const ownerDoc = await db.getRow<Owner & { $tableId: string }>(
              APPWRITE.DATABASE_ID,
              APPWRITE.COLLECTIONS.OWNERS,
              unit.owner,
            );
            ownerName = ownerDoc.fullName;
          } catch {
            /* ignore */
          }
        } else if (unit.owner && typeof unit.owner !== "string") {
          ownerName = unit.owner.fullName;
        }

        if (typeof unit.tenant === "string" && unit.tenant) {
          try {
            const tenantDoc = await db.getRow<Tenant & { $tableId: string }>(
              APPWRITE.DATABASE_ID,
              APPWRITE.COLLECTIONS.TENANTS,
              unit.tenant,
            );
            tenantName = tenantDoc.fullName;
          } catch {
            /* ignore */
          }
        } else if (unit.tenant && typeof unit.tenant !== "string") {
          tenantName = unit.tenant.fullName;
        }
      }
    }

    const safeInvoice = {
      $id: invoice.$id,
      invoiceNumber: invoice.invoiceNumber,
      period: invoice.period,
      status: invoice.status,
      dueDate: invoice.dueDate,
      waterFee: invoice.waterFee,
      publicFacilityFee: invoice.publicFacilityFee ?? 0,
      guardFee: invoice.guardFee ?? 0,
      vehicleFee: invoice.vehicleFee,
      arrears: invoice.arrears,
      arrearsBreakdown: invoice.arrearsBreakdown,
      uniqueCode: invoice.uniqueCode,
      totalDue: invoice.totalDue,
      payDate: invoice.payDate,
      unit: unit
        ? {
            displayId: unit.displayId,
            block: unit.block,
            floor: unit.floor,
            owner: ownerName ? { fullName: ownerName } : undefined,
            tenant: tenantName ? { fullName: tenantName } : undefined,
          }
        : undefined,
    };

    return NextResponse.json(safeInvoice);
  } catch (error: unknown) {
    console.error(
      "GET /api/portal/invoice/[accessToken] -",
      getErrorMessage(error),
    );
    return NextResponse.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 },
    );
  }
}
