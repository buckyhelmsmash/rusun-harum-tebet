"use client";

import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { useState, useRef, useCallback, useEffect } from "react";
import { getNewsImage } from "@/lib/mock-news";
import type { News } from "@/types";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";
import { cn } from "@/lib/utils";

type Props = {
  articles: News[];
};

export function WartaLeadArticle({ articles }: Props) {
  const [api, setApi] = useState<CarouselApi>();
  const [currentIndex, setCurrentIndex] = useState(0);
  const plugin = useRef(Autoplay({ delay: 5000, stopOnInteraction: true }));

  const onSelect = useCallback(() => {
    if (!api) return;
    setCurrentIndex(api.selectedScrollSnap());
  }, [api]);

  useEffect(() => {
    if (!api) return;
    onSelect();
    api.on("select", onSelect);
    return () => {
      api.off("select", onSelect);
    };
  }, [api, onSelect]);

  if (!articles?.length) {
    return (
      <div className="h-64 flex items-center justify-center border border-dashed rounded-lg bg-muted text-muted-foreground">
        Belum ada berita utama
      </div>
    );
  }

  return (
    <div className="mb-4 relative w-full">
      <Carousel
        setApi={setApi}
        plugins={[plugin.current]}
        className="w-full"
        onMouseEnter={plugin.current.stop}
        onMouseLeave={plugin.current.reset}
      >
        <CarouselContent>
          {articles.map((article, index) => {
            const publishedDate = article.publishedDate
              ? format(new Date(article.publishedDate), "dd MMM yyyy", {
                  locale: localeId,
                })
              : null;

            const bodyPreview =
              article.content?.split("\n\n").find((p) => !p.startsWith("**")) ??
              "";

            const href = article.slug
              ? `/news/${article.slug}`
              : `/news/${article.$id}`;

            return (
              <CarouselItem key={article.$id}>
                <article>
                  <div className="group cursor-pointer">
                    <Link href={href}>
                      <div className="aspect-[16/9] overflow-hidden mb-4 border border-black/5 bg-muted">
                        <img
                          alt={article.title}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                          src={article.coverImageId || getNewsImage(index)}
                        />
                      </div>
                      <div className="flex items-center gap-3 mb-2">
                        {article.label ? (
                          <span
                            className="text-[0.65rem] font-bold tracking-[0.2em] uppercase"
                            style={{ color: article.label.color }}
                          >
                            {article.label.name}
                          </span>
                        ) : (
                          <span className="text-[0.65rem] font-bold tracking-[0.2em] uppercase text-red-700">
                            Pengumuman Utama
                          </span>
                        )}
                      </div>
                      <h2 className="text-2xl sm:text-3xl md:text-5xl font-black font-headline leading-tight tracking-tight mb-3 md:mb-4 group-hover:text-black/70 transition-colors line-clamp-3">
                        {article.title}
                      </h2>
                      <div className="flex items-center gap-4 text-[0.7rem] font-medium text-neutral-500 uppercase mb-4">
                        <span>Oleh Redaksi Warta</span>
                        <span className="w-1 h-1 bg-black/20 rounded-full" />
                        {publishedDate && <span>{publishedDate}</span>}
                      </div>
                    </Link>
                    <p className="font-serif-body text-base md:text-lg leading-relaxed text-neutral-800 dropcap mb-4 md:mb-6 line-clamp-3">
                      {article.summary || bodyPreview}
                    </p>
                    <Link
                      href={href}
                      className="inline-flex items-center gap-2 border-b-2 border-black mt-2 md:mt-6 font-bold text-[0.75rem] tracking-tighter uppercase hover:text-black/70 transition-colors"
                    >
                      Baca Selengkapnya
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </article>
              </CarouselItem>
            );
          })}
        </CarouselContent>
      </Carousel>

      {/* Dot navigation — positioned below the carousel */}
      {articles.length > 1 && (
        <div className="flex justify-center items-center gap-2 mt-8">
          {articles.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => api?.scrollTo(i)}
              aria-label={`Berita ${i + 1}`}
              className={cn(
                "h-2 rounded-full transition-all duration-300",
                i === currentIndex
                  ? "bg-black w-6"
                  : "bg-black/20 w-2 hover:bg-black/40",
              )}
            />
          ))}
        </div>
      )}
    </div>
  );
}
