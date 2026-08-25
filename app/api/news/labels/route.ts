import { NextResponse } from "next/server";
import { z } from "zod";
import { withApiHandler } from "@/lib/api/with-api-handler";
import { newsRepository } from "@/lib/repositories/news";

const createLabelSchema = z.object({
  name: z.string().min(1, "Nama label wajib diisi"),
  color: z.string().min(1, "Warna wajib dipilih"),
});

export const GET = withApiHandler(
  async () => {
    const items = await newsRepository.getNewsLabels();
    return NextResponse.json(items);
  },
  { label: "GET /api/news/labels" },
);

export const POST = withApiHandler(
  async (request) => {
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
  },
  { role: "admin", label: "POST /api/news/labels" },
);
