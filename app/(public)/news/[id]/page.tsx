import type { Metadata } from "next";
import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";
import { ArrowLeft, Share2 } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  MOCK_NEWS,
  getNewsById,
  getNewsCategory,
  getNewsImage,
  getNewsImageById,
} from "@/lib/mock-news";

export async function generateStaticParams() {
  return MOCK_NEWS.map((n) => ({ id: n.$id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const news = getNewsById(id);
  if (!news) return {};

  return {
    title: `${news.title} | Warta Harum`,
    description: news.summary ?? news.title,
    openGraph: {
      title: news.title,
      description: news.summary ?? news.title,
      type: "article",
      images: [getNewsImageById(id)],
    },
  };
}

export default async function NewsDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const news = getNewsById(id);
  if (!news) return notFound();

  const heroImage = getNewsImageById(id);
  const category = getNewsCategory(id);
  const publishedDate = news.publishedDate
    ? format(new Date(news.publishedDate), "dd MMMM yyyy", {
        locale: localeId,
      })
    : null;

  const contentParagraphs = (news.content || "").split("\n\n").filter(Boolean);
  const readingTime = Math.max(1, Math.ceil(contentParagraphs.length * 0.8));
  const otherNews = MOCK_NEWS.filter((n) => n.$id !== id).slice(0, 3);

  return (
    <main>
      {/* Breadcrumb */}
      <div className="section-container pt-8 pb-4">
        <nav className="text-[0.6rem] font-bold tracking-[0.2em] uppercase text-black/40">
          <Link href="/" className="hover:text-black transition-colors">
            Beranda
          </Link>
          <span className="mx-2">/</span>
          <Link href="/news" className="hover:text-black transition-colors">
            Berita
          </Link>
          <span className="mx-2">/</span>
          <span className="text-black line-clamp-1 inline">{news.title}</span>
        </nav>
      </div>

      {/* Article header */}
      <div className="section-container pb-8">
        <div className="max-w-4xl">
          <div className="flex items-center gap-3 mb-4">
            <span className="inline-block px-2.5 py-1 bg-black text-white text-[0.55rem] font-black tracking-widest uppercase">
              {category}
            </span>
          </div>
          <h1 className="text-4xl md:text-6xl font-black font-headline leading-[0.95] tracking-tighter mb-6">
            {news.title}
          </h1>
          <div className="flex flex-wrap items-center gap-4 text-[0.7rem] font-bold text-black/40 uppercase tracking-tighter">
            <span>Oleh Redaksi Warta</span>
            <span className="w-1 h-1 bg-black/20 rounded-full" />
            {publishedDate && <span>{publishedDate}</span>}
            <span className="w-1 h-1 bg-black/20 rounded-full" />
            <span>{readingTime} menit baca</span>
          </div>
        </div>
      </div>

      {/* Hero image */}
      <div className="section-container pb-10">
        <div className="aspect-[21/9] overflow-hidden border border-black/5">
          <img
            alt={news.title}
            className="w-full h-full object-cover"
            src={heroImage}
          />
        </div>
      </div>

      {/* Article body */}
      <div className="section-container pb-16">
        <div className="max-w-3xl">
          {news.summary && (
            <p className="font-serif-body text-xl leading-relaxed text-neutral-700 mb-8 pb-8 border-b border-neutral-200 italic">
              {news.summary}
            </p>
          )}

          <article className="space-y-6">
            {contentParagraphs.map((paragraph, idx) => {
              if (paragraph.startsWith("**") && paragraph.endsWith("**")) {
                const text = paragraph.slice(2, -2);
                return (
                  <h2
                    key={idx}
                    className="text-xl md:text-2xl font-black font-headline mt-8 mb-2"
                  >
                    {text}
                  </h2>
                );
              }

              const lines = paragraph.split("\n");
              const isList = lines.every(
                (l) =>
                  l.startsWith("- ") ||
                  l.startsWith("* ") ||
                  /^\d+\.\s/.test(l),
              );

              if (isList) {
                const isOrdered = /^\d+\.\s/.test(lines[0]);
                const Tag = isOrdered ? "ol" : "ul";
                return (
                  <Tag
                    key={idx}
                    className={`space-y-2 ${isOrdered ? "list-decimal" : "list-disc"} list-inside font-serif-body text-base md:text-lg leading-relaxed text-neutral-700`}
                  >
                    {lines.map((line, li) => (
                      <li key={li}>
                        {line.replace(/^[-*]\s|^\d+\.\s/, "")}
                      </li>
                    ))}
                  </Tag>
                );
              }

              return (
                <p
                  key={idx}
                  className={`font-serif-body text-base md:text-lg leading-relaxed text-neutral-700 ${idx === 0 ? "dropcap" : ""}`}
                >
                  {paragraph}
                </p>
              );
            })}
          </article>

          {/* Actions */}
          <div className="flex items-center gap-4 mt-12 pt-8 border-t border-neutral-200">
            <button
              className="flex items-center gap-2 px-4 py-2.5 border border-black text-[0.7rem] font-black tracking-widest uppercase hover:bg-black hover:text-white transition-all"
              type="button"
            >
              <Share2 className="w-4 h-4" />
              Bagikan
            </button>
            <Link
              className="flex items-center gap-2 px-4 py-2.5 border border-black text-[0.7rem] font-black tracking-widest uppercase hover:bg-black hover:text-white transition-all"
              href="/news"
            >
              <ArrowLeft className="w-4 h-4" />
              Kembali
            </Link>
          </div>
        </div>
      </div>

      {/* Related articles */}
      {otherNews.length > 0 && (
        <section className="border-t border-black bg-[#f9f8f6] py-16">
          <div className="section-container">
            <div className="border-b-4 border-black pb-3 mb-10">
              <h2 className="text-3xl md:text-4xl font-black font-headline tracking-tighter uppercase">
                Berita Lainnya
              </h2>
            </div>
            <div className="grid gap-8 md:grid-cols-3">
              {otherNews.map((item) => {
                const itemIdx = MOCK_NEWS.findIndex(
                  (n) => n.$id === item.$id,
                );
                const itemCategory = getNewsCategory(item.$id);
                const itemDate = item.publishedDate
                  ? format(new Date(item.publishedDate), "dd MMM yyyy", {
                      locale: localeId,
                    })
                  : null;

                return (
                  <Link
                    key={item.$id}
                    href={`/news/${item.$id}`}
                    className="group"
                  >
                    <div className="aspect-[16/10] overflow-hidden border border-black/5 mb-4">
                      <img
                        alt={item.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        src={getNewsImage(itemIdx >= 0 ? itemIdx : 0)}
                      />
                    </div>
                    <span className="inline-block px-2 py-0.5 bg-black text-white text-[0.5rem] font-black tracking-widest uppercase mb-2">
                      {itemCategory}
                    </span>
                    <h3 className="text-lg font-bold font-headline leading-tight group-hover:underline mb-2 line-clamp-2">
                      {item.title}
                    </h3>
                    {itemDate && (
                      <span className="text-[0.6rem] font-bold text-black/40 uppercase tracking-tighter">
                        {itemDate}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      )}
    </main>
  );
}
