import { NextResponse } from "next/server";
import { z } from "zod";
import { ZodError } from "zod";
import { AuthError, verifyAuth } from "@/lib/auth/verify";
import { getErrorMessage } from "@/lib/repositories/base";
import { newsRepository } from "@/lib/repositories/news";

const createLabelSchema = z.object({
  name: z.string().min(1, "Nama label wajib diisi"),
  color: z.string().min(1, "Warna wajib dipilih"),
});

export async function GET() {
  try {
    const items = await newsRepository.getNewsLabels();
    return NextResponse.json(items);
  } catch (error) {
    console.error("Error fetching news labels:", getErrorMessage(error));
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    await verifyAuth(request);
    const body = await request.json();
    const validated = createLabelSchema.parse(body);

    const existing = await newsRepository.getNewsLabelByName(validated.name);
    if (existing) {
      return NextResponse.json(
        { error: "Label dengan nama ini sudah ada" },
        { status: 409 },
      );
    }

    const label = await newsRepository.createNewsLabel(validated);
    return NextResponse.json({ result: label }, { status: 201 });
  } catch (error: unknown) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: "Invalid payload", details: error.flatten() },
        { status: 400 },
      );
    }
    console.error("POST /api/news/labels -", getErrorMessage(error));
    return NextResponse.json(
      { error: getErrorMessage(error) },
      { status: 500 },
    );
  }
}
