import Link from "next/link";
import { notFound } from "next/navigation";
import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";
import { ArrowLeft, Building2, Calendar, Clock, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  MOCK_NEWS,
  getNewsById,
  getNewsImageById,
  getNewsImage,
} from "@/lib/mock-news";

export default async function NewsDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const news = getNewsById(id);

  if (!news) return notFound();

  const heroImage = getNewsImageById(id);
  const publishedDate = news.publishedDate
    ? new Date(news.publishedDate)
    : null;

  const otherNews = MOCK_NEWS.filter((n) => n.$id !== id).slice(0, 3);

  const contentParagraphs = (news.content || "").split("\n\n").filter(Boolean);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-display">
      {/* Hero banner */}
      <div className="relative h-[40vh] md:h-[50vh] w-full overflow-hidden">
        <img
          src={heroImage}
          alt={news.title}
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent" />
        <div className="absolute inset-0 bg-black/20" />

        {/* Top bar */}
        <header className="absolute top-0 left-0 w-full z-20 flex items-center justify-between px-6 md:px-12 py-5">
          <Link
            href="/"
            className="flex items-center gap-3 group"
          >
            <div className="bg-primary p-2 rounded-lg text-white">
              <Building2 className="w-5 h-5" />
            </div>
            <span className="text-white font-bold text-lg drop-shadow-md group-hover:text-primary transition-colors">
              Rusun Harum Tebet
            </span>
          </Link>
        </header>

        {/* Title overlay */}
        <div className="absolute bottom-0 left-0 right-0 z-10 px-6 md:px-12 lg:px-0 pb-10">
          <div className="max-w-3xl mx-auto space-y-4">
            <Button
              asChild
              variant="ghost"
              className="text-white/70 hover:text-white hover:bg-white/10 -ml-4 mb-2"
            >
              <Link href="/">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Kembali ke Beranda
              </Link>
            </Button>

            <h1 className="text-3xl md:text-5xl font-black leading-tight tracking-tight text-white drop-shadow-xl">
              {news.title}
            </h1>

            <div className="flex flex-wrap items-center gap-4 text-sm">
              {publishedDate && (
                <span className="inline-flex items-center gap-1.5 bg-primary/20 text-primary px-3 py-1.5 rounded-full font-semibold">
                  <Calendar className="w-3.5 h-3.5" />
                  {format(publishedDate, "dd MMMM yyyy", {
                    locale: localeId,
                  })}
                </span>
              )}
              <span className="inline-flex items-center gap-1.5 text-white/50">
                <Clock className="w-3.5 h-3.5" />
                {contentParagraphs.length} menit baca
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Article body */}
      <main className="relative z-10 -mt-1">
        <div className="max-w-3xl mx-auto px-6 md:px-12 lg:px-0 py-10 md:py-16">
          {/* Summary callout */}
          {news.summary && (
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl px-6 py-5 mb-10">
              <p className="text-slate-200 text-lg md:text-xl leading-relaxed font-light italic">
                {news.summary}
              </p>
            </div>
          )}

          {/* Content */}
          <article className="space-y-6">
            {contentParagraphs.map((paragraph, idx) => {
              if (paragraph.startsWith("**") && paragraph.endsWith("**")) {
                const text = paragraph.slice(2, -2);
                return (
                  <h2
                    key={idx}
                    className="text-xl md:text-2xl font-bold text-white mt-8 mb-2"
                  >
                    {text}
                  </h2>
                );
              }

              const lines = paragraph.split("\n");
              const isList = lines.every(
                (l) => l.startsWith("- ") || l.startsWith("* ") || /^\d+\.\s/.test(l)
              );

              if (isList) {
                const isOrdered = /^\d+\.\s/.test(lines[0]);
                const Tag = isOrdered ? "ol" : "ul";
                return (
                  <Tag
                    key={idx}
                    className={`space-y-2 ${isOrdered ? "list-decimal" : "list-disc"} list-inside text-slate-300 text-base md:text-lg leading-relaxed`}
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
                  className="text-slate-300 text-base md:text-lg leading-relaxed"
                >
                  {paragraph}
                </p>
              );
            })}
          </article>

          {/* Share / actions */}
          <div className="flex items-center gap-3 mt-12 pt-8 border-t border-white/10">
            <Button
              variant="outline"
              className="bg-white/5 border-white/10 hover:bg-white/10 text-white"
            >
              <Share2 className="w-4 h-4 mr-2" />
              Bagikan
            </Button>
            <Button
              asChild
              variant="outline"
              className="bg-white/5 border-white/10 hover:bg-white/10 text-white"
            >
              <Link href="/">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Kembali
              </Link>
            </Button>
          </div>
        </div>

        {/* Related news */}
        {otherNews.length > 0 && (
          <section className="border-t border-white/10 bg-slate-900/50">
            <div className="max-w-5xl mx-auto px-6 md:px-12 lg:px-0 py-12 md:py-16">
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-8">
                Berita Lainnya
              </h2>
              <div className="grid gap-6 md:grid-cols-3">
                {otherNews.map((item, index) => {
                  const itemIdx = MOCK_NEWS.findIndex(
                    (n) => n.$id === item.$id
                  );
                  return (
                    <Link
                      key={item.$id}
                      href={`/news/${item.$id}`}
                      className="group rounded-2xl overflow-hidden bg-white/5 border border-white/5 hover:border-white/15 hover:bg-white/10 transition-all duration-300"
                    >
                      <img
                        src={getNewsImage(itemIdx >= 0 ? itemIdx : index)}
                        alt={item.title}
                        className="w-full h-40 object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="p-5 space-y-2">
                        <h3 className="text-white font-bold text-lg leading-snug group-hover:text-primary transition-colors line-clamp-2">
                          {item.title}
                        </h3>
                        {item.summary && (
                          <p className="text-slate-400 text-sm line-clamp-2">
                            {item.summary}
                          </p>
                        )}
                        {item.publishedDate && (
                          <span className="inline-flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                            <Calendar className="w-3 h-3" />
                            {format(
                              new Date(item.publishedDate),
                              "dd MMM yyyy",
                              { locale: localeId }
                            )}
                          </span>
                        )}
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
