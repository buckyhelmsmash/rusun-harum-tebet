import { NextResponse } from "next/server";
import { withApiHandler } from "@/lib/api/with-api-handler";
import { storageRepository } from "@/lib/repositories/storage";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

export const POST = withApiHandler(
  async (request) => {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!file || !(file instanceof File)) {
      return NextResponse.json(
        { error: "File wajib diunggah" },
        { status: 400 },
      );
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        {
          error: `Tipe file tidak didukung. Gunakan: ${ALLOWED_TYPES.join(", ")}`,
        },
        { status: 400 },
      );
    }

    if (file.size > MAX_SIZE_BYTES) {
      return NextResponse.json(
        { error: "Ukuran file maksimal 5 MB" },
        { status: 400 },
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const fileId = await storageRepository.uploadNewsCover(buffer, file.name);

    return NextResponse.json({ result: { fileId } }, { status: 201 });
  },
  { role: "admin", label: "POST /api/news/covers" },
);

export const DELETE = withApiHandler(
  async (request) => {
    const { searchParams } = new URL(request.url);
    const fileId = searchParams.get("fileId");

    if (!fileId) {
      return NextResponse.json(
        { error: "fileId wajib disertakan" },
        { status: 400 },
      );
    }

    await storageRepository.deleteNewsCover(fileId);
    return NextResponse.json({ result: { success: true } });
  },
  { role: "admin", label: "DELETE /api/news/covers" },
);
