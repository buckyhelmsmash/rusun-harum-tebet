import type { Metadata } from "next";
import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";
import Link from "next/link";
import { MOCK_NEWS, getNewsCategory, getNewsImage } from "@/lib/mock-news";

export const metadata: Metadata = {
  title: "Indeks Berita | Warta Harum",
  description:
    "Seluruh berita dan pengumuman resmi Rumah Susun Harum Tebet dalam satu halaman.",
};

export default function NewsPage() {
  return (
    <main className="section-container py-12">
      <div className="border-b-4 border-black pb-3 mb-10">
        <nav className="text-[0.6rem] font-bold tracking-[0.2em] uppercase text-black/40 mb-8">
          <Link href="/" className="hover:text-black transition-colors">
            Beranda
          </Link>
          <span className="mx-2">/</span>
          <span className="text-black">Berita</span>
        </nav>
        <h1 className="text-5xl md:text-7xl font-black font-headline tracking-tighter uppercase">
          Indeks Berita
        </h1>
        <p className="text-sm text-neutral-500 mt-2 font-serif-body italic">
          Seluruh pengumuman dan berita terkini Rusun Harum Tebet
        </p>
      </div>

      <div className="grid gap-0">
        {MOCK_NEWS.map((item, index) => {
          const category = getNewsCategory(item.$id);
          const publishedDate = item.publishedDate
            ? format(new Date(item.publishedDate), "dd MMMM yyyy", {
                locale: localeId,
              })
            : null;

          return (
            <Link
              key={item.$id}
              href={`/news/${item.$id}`}
              className="group grid grid-cols-1 md:grid-cols-12 gap-6 py-8 border-b border-neutral-200 hover:bg-neutral-50/50 transition-colors -mx-4 px-4"
            >
              <div className="md:col-span-4 aspect-[16/10] overflow-hidden border border-black/5">
                <img
                  alt={item.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  src={getNewsImage(index)}
                />
              </div>
              <div className="md:col-span-8 flex flex-col justify-between py-1">
                <div>
                  <div className="flex items-center gap-3 mb-3">
                    <span className="inline-block px-2.5 py-1 bg-black text-white text-[0.5rem] font-black tracking-widest uppercase">
                      {category}
                    </span>
                    {publishedDate && (
                      <span className="text-[0.6rem] font-bold text-black/40 uppercase tracking-tighter">
                        {publishedDate}
                      </span>
                    )}
                  </div>
                  <h2 className="text-2xl md:text-3xl font-black font-headline leading-tight tracking-tight group-hover:underline mb-3">
                    {item.title}
                  </h2>
                  {item.summary && (
                    <p className="text-sm font-serif-body leading-relaxed text-neutral-600 line-clamp-2">
                      {item.summary}
                    </p>
                  )}
                </div>
                <span className="text-[0.7rem] font-bold tracking-tighter uppercase text-black/40 mt-4">
                  Oleh Redaksi Warta
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </main>
  );
}
