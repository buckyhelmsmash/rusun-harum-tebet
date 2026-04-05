import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { logActivity } from "@/lib/activity/logger";
import { AuthError, verifyAuth } from "@/lib/auth/verify";
import { getErrorMessage } from "@/lib/repositories/base";
import { newsRepository } from "@/lib/repositories/news";
import { createNewsSchema } from "@/lib/schemas/news";
import { generateSlug } from "@/lib/utils/slug";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const search = url.searchParams.get("search");

    let items = await newsRepository.getNews();

    if (search) {
      const lowerSearch = search.toLowerCase();
      items = items.filter((n) => n.title.toLowerCase().includes(lowerSearch));
    }

    return NextResponse.json({ items, total: items.length });
  } catch (error) {
    console.error("Error fetching news:", getErrorMessage(error));
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await verifyAuth(request);
    const body = await request.json();
    const payload = body.data ?? body;
    const validated = createNewsSchema.parse(payload);

    // Generate a unique slug from title + date
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
    console.error("POST /api/news -", getErrorMessage(error));
    return NextResponse.json(
      { error: getErrorMessage(error) },
      { status: 500 },
    );
  }
}
