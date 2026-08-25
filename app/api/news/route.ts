import { NextResponse } from "next/server";
import { logActivity } from "@/lib/activity/logger";
import { withApiHandler } from "@/lib/api/with-api-handler";
import { newsRepository } from "@/lib/repositories/news";
import { createNewsSchema } from "@/lib/schemas/news";
import { generateSlug } from "@/lib/utils/slug";

export const GET = withApiHandler(
  async (request) => {
    const url = new URL(request.url);
    const search = url.searchParams.get("search");

    let items = await newsRepository.getNews();

    if (search) {
      const lowerSearch = search.toLowerCase();
      items = items.filter((n) => n.title.toLowerCase().includes(lowerSearch));
    }

    return NextResponse.json({ items, total: items.length });
  },
  { label: "GET /api/news" },
);

export const POST = withApiHandler(
  async (request, { session }) => {
    const body = await request.json();
    const payload = body.data ?? body;
    const validated = createNewsSchema.parse(payload);

    const baseSlug = generateSlug(
      validated.title,
      validated.publishedDate || undefined,
    );
    let slug = baseSlug;
    let suffix = 1;
    while (await newsRepository.slugExists(slug)) {
      slug = `${baseSlug}-${suffix}`;
      suffix++;
    }

    const newsItem = await newsRepository.createNews({ ...validated, slug });

    logActivity({
      actorId: session.$id,
      actorName: session.name || session.email,
      action: "news.create",
      description: `Membuat berita baru: ${newsItem.title}`,
      targetType: "news",
      targetId: newsItem.$id,
    });

    return NextResponse.json({ result: newsItem }, { status: 201 });
  },
  { role: "admin", label: "POST /api/news" },
);
