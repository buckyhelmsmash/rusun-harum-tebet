import { NextResponse } from "next/server";
import { Query } from "node-appwrite";
import { withApiHandler } from "@/lib/api/with-api-handler";
import { APPWRITE } from "@/lib/constants";
import { getDb } from "@/lib/repositories/base";
import { InvoiceRepository } from "@/lib/repositories/invoices";
import type { Invoice } from "@/types";

export const POST = withApiHandler(
  async (request) => {
    const body = await request.json();
    const { accessToken, pinCode } = body as {
      accessToken: string;
      pinCode: string;
    };

    if (!accessToken || !pinCode) {
      return NextResponse.json(
        { error: "Access token dan PIN wajib diisi" },
        { status: 400 },
      );
    }

    const invoice = await InvoiceRepository.getByAccessToken(accessToken);

    if (!invoice) {
      return NextResponse.json(
        { error: "Tagihan tidak ditemukan" },
        { status: 404 },
      );
    }

    if (!invoice.pinCode || invoice.pinCode !== pinCode) {
      return NextResponse.json({ error: "PIN tidak valid" }, { status: 403 });
    }

    const unitId =
      typeof invoice.unit === "string" ? invoice.unit : invoice.unit?.$id;

    if (!unitId) {
      return NextResponse.json(
        { error: "Data unit tidak ditemukan" },
        { status: 404 },
      );
    }

    const db = await getDb();
    const result = await db.listRows({
      databaseId: APPWRITE.DATABASE_ID,
      tableId: APPWRITE.COLLECTIONS.INVOICES,
      queries: [
        Query.equal("unit", unitId),
        Query.orderDesc("period"),
        Query.limit(12),
      ],
    });

    const history = (result.rows as unknown as Invoice[]).map((inv) => ({
      $id: inv.$id,
      invoiceNumber: inv.invoiceNumber,
      period: inv.period,
      status: inv.status,
      totalDue: inv.totalDue,
      dueDate: inv.dueDate,
      payDate: inv.payDate,
    }));

    return NextResponse.json({ history });
  },
  {
    label: "POST /api/portal/history",
    genericErrorMessage: "Terjadi kesalahan server",
  },
);
