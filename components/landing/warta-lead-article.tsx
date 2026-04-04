import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { getNewsImage } from "@/lib/mock-news";
import type { News } from "@/types";

type Props = {
  article: News;
  index: number;
};

export function WartaLeadArticle({ article, index }: Props) {
  const publishedDate = article.publishedDate
    ? format(new Date(article.publishedDate), "dd MMM yyyy", {
        locale: localeId,
      })
    : null;

  const bodyPreview =
    article.content?.split("\n\n").find((p) => !p.startsWith("**")) ?? "";

  return (
    <article className="mb-12">
      <div className="group cursor-pointer">
        <Link href={`/news/${article.$id}`}>
          <div className="aspect-[16/9] overflow-hidden mb-4 border border-black/5">
            <img
              alt={article.title}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              src={getNewsImage(index)}
            />
          </div>
          <div className="flex items-center gap-3 mb-2">
            <span className="text-[0.65rem] font-bold tracking-[0.2em] uppercase text-red-700">
              Pengumuman Utama
            </span>
          </div>
          <h2 className="text-4xl md:text-5xl font-black font-headline leading-tight tracking-tight mb-4 group-hover:text-black/70 transition-colors">
            {article.title}
          </h2>
          <div className="flex items-center gap-4 text-[0.7rem] font-medium text-neutral-500 uppercase mb-4">
            <span>Oleh Redaksi Warta</span>
            <span className="w-1 h-1 bg-black/20 rounded-full" />
            {publishedDate && <span>{publishedDate}</span>}
          </div>
        </Link>
        <p className="font-serif-body text-lg leading-relaxed text-neutral-800 dropcap mb-6">
          {article.summary || bodyPreview}
        </p>
        <Link
          href={`/news/${article.$id}`}
          className="inline-flex items-center gap-2 border-b-2 border-black mt-12 font-bold text-[0.75rem] tracking-tighter uppercase hover:text-black/70 transition-colors"
        >
          Baca Selengkapnya
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </article>
  );
}
