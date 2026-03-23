import Link from "next/link";
import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";
import { ArrowLeft, Building2, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MOCK_NEWS, getNewsImage } from "@/lib/mock-news";

export default function NewsPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-display">
      {/* Header */}
      <header className="border-b border-white/10 bg-slate-900/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 md:px-12 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="bg-primary p-2 rounded-lg text-white">
              <Building2 className="w-5 h-5" />
            </div>
            <span className="text-white font-bold text-lg group-hover:text-primary transition-colors">
              Rusun Harum Tebet
            </span>
          </Link>
          <Button
            asChild
            variant="ghost"
            className="text-white/70 hover:text-white hover:bg-white/10"
          >
            <Link href="/">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Kembali
            </Link>
          </Button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 md:px-12 py-12 md:py-16">
        <div className="mb-10">
          <h1 className="text-3xl md:text-4xl font-black tracking-tight text-white">
            Berita & Pengumuman
          </h1>
          <p className="text-slate-400 mt-2 text-lg">
            Informasi terbaru seputar Rusun Harum Tebet
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {MOCK_NEWS.map((item, index) => (
            <Link
              key={item.$id}
              href={`/news/${item.$id}`}
              className="group rounded-2xl overflow-hidden bg-white/5 border border-white/5 hover:border-white/15 hover:bg-white/10 transition-all duration-300"
            >
              <img
                src={getNewsImage(index)}
                alt={item.title}
                className="w-full h-48 md:h-56 object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="p-6 space-y-3">
                <h2 className="text-white text-xl md:text-2xl font-bold leading-snug group-hover:text-primary transition-colors line-clamp-2">
                  {item.title}
                </h2>
                {item.summary && (
                  <p className="text-slate-400 text-base leading-relaxed line-clamp-2">
                    {item.summary}
                  </p>
                )}
                {item.publishedDate && (
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold bg-primary/20 text-primary px-3 py-1 rounded-full">
                    <Calendar className="w-3 h-3" />
                    {format(new Date(item.publishedDate), "dd MMMM yyyy", {
                      locale: localeId,
                    })}
                  </span>
                )}
              </div>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
