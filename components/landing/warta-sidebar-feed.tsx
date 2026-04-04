import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";
import Link from "next/link";
import { getNewsCategory, getNewsImage } from "@/lib/mock-news";
import type { News } from "@/types";

type Props = {
  articles: News[];
  startIndex: number;
};

export function WartaSidebarFeed({ articles, startIndex }: Props) {
  return (
    <div>
      <div className="border-b-4 !border-black pb-2 mb-6">
        <h3 className="text-[0.75rem] font-black tracking-[0.25em] uppercase">
          Berita Terkini
        </h3>
      </div>
      <div className="space-y-6">
        <ul className="space-y-6">
          {articles.map((item, i) => {
            const imageIndex = startIndex + i;
            const category = getNewsCategory(item.$id);
            const publishedDate = item.publishedDate
              ? format(new Date(item.publishedDate), "dd MMM yyyy", {
                  locale: localeId,
                }).toUpperCase()
              : null;

            return (
              <li
                key={item.$id}
                className="group cursor-pointer border-b border-neutral-200 pb-6 last:border-0"
              >
                <Link href={`/news/${item.$id}`} className="flex gap-4">
                  <div className="w-24 h-24 flex-shrink-0 border border-black/5 overflow-hidden">
                    <img
                      alt={item.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      src={getNewsImage(imageIndex)}
                    />
                  </div>
                  <div className="flex flex-col justify-between py-1">
                    <div>
                      <span className="inline-block px-2 py-0.5 bg-black text-white text-[0.5rem] font-black tracking-widest uppercase mb-2">
                        {category}
                      </span>
                      <h5 className="text-sm font-bold leading-tight group-hover:underline line-clamp-2">
                        {item.title}
                      </h5>
                    </div>
                    {publishedDate && (
                      <span className="text-[0.6rem] font-bold text-black/40 uppercase tracking-tighter">
                        {publishedDate}
                      </span>
                    )}
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
        <div className="pt-2">
          <Link
            href="/news"
            className="block w-full py-3 border-2 !border-black font-black text-[0.7rem] tracking-widest uppercase hover:bg-black hover:!text-white transition-all text-center"
          >
            Lihat semua berita
          </Link>
        </div>
      </div>
    </div>
  );
}
