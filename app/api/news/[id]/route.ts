import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { getChanges, logActivity } from "@/lib/activity/logger";
import { AuthError, verifyAuth } from "@/lib/auth/verify";
import { getErrorMessage } from "@/lib/repositories/base";
import { newsRepository } from "@/lib/repositories/news";
import { updateNewsSchema } from "@/lib/schemas/news";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const newsItem = await newsRepository.getNewsItem(id);
    return NextResponse.json(newsItem);
  } catch (error: unknown) {
    console.error("GET /api/news/[id] -", getErrorMessage(error));
    return NextResponse.json(
      { error: getErrorMessage(error) },
      { status: 500 },
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await verifyAuth(request);
    const { id } = await params;
    const body = await request.json();
    const payload = body.data ?? body;
    const validated = updateNewsSchema.parse(payload);

    const existingNewsItem = await newsRepository.getNewsItem(id);
    const newsItem = await newsRepository.updateNews(id, validated);
    const changes = getChanges(existingNewsItem, validated);

    logActivity({
      actorId: session.$id,
      actorName: session.name || session.email,
      action: "news.update",
      description: `Memperbarui berita: ${newsItem.title}`,
      targetType: "news",
      targetId: newsItem.$id,
      metadata: changes.length > 0 ? { changes } : undefined,
    });

    return NextResponse.json({ result: newsItem });
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
    console.error("PATCH /api/news/[id] -", getErrorMessage(error));
    return NextResponse.json(
      { error: getErrorMessage(error) },
      { status: 500 },
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await verifyAuth(request);
    const { id } = await params;

    const newsItem = await newsRepository.getNewsItem(id);
    await newsRepository.deleteNews(id);

    logActivity({
      actorId: session.$id,
      actorName: session.name || session.email,
      action: "news.delete",
      description: `Menghapus berita: ${newsItem.title}`,
      targetType: "news",
      targetId: id,
    });

    return NextResponse.json({ result: { success: true } });
  } catch (error: unknown) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    console.error("DELETE /api/news/[id] -", getErrorMessage(error));
    return NextResponse.json(
      { error: getErrorMessage(error) },
      { status: 500 },
    );
  }
}
