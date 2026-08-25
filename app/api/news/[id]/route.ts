import { NextResponse } from "next/server";
import { getChanges, logActivity } from "@/lib/activity/logger";
import { withApiHandler } from "@/lib/api/with-api-handler";
import { newsRepository } from "@/lib/repositories/news";
import { updateNewsSchema } from "@/lib/schemas/news";

export const GET = withApiHandler<{ id: string }>(
  async (_request, { params }) => {
    const { id } = await params;
    const newsItem = await newsRepository.getNewsItem(id);
    return NextResponse.json(newsItem);
  },
  { label: "GET /api/news/[id]" },
);

export const PATCH = withApiHandler<{ id: string }>(
  async (request, { params, session }) => {
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
  },
  { role: "admin", label: "PATCH /api/news/[id]" },
);

export const DELETE = withApiHandler<{ id: string }>(
  async (_request, { params, session }) => {
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
  },
  { role: "admin", label: "DELETE /api/news/[id]" },
);
