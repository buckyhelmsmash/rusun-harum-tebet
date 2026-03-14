"use client";

import { format } from "date-fns";
import { id } from "date-fns/locale";
import { ArrowRight, Building2, Calendar, MapPin } from "lucide-react";
import { useEffect, useState } from "react";
import type { News } from "@/types";
import { Button } from "@/components/ui/button";

const BACKGROUND_IMAGES = [
  "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=1600&q=80",
  "https://images.unsplash.com/photo-1515263487990-61b07816b324?w=1600&q=80",
  "https://images.unsplash.com/photo-1460317442991-0ec209397118?w=1600&q=80",
];

// Reusing image for news fallback if there's no coverImageId
const DEFAULT_NEWS_THUMBNAILS = [
  "https://images.unsplash.com/photo-1574362848149-11496d93a7c7?w=400&q=80",
  "https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=400&q=80",
  "https://images.unsplash.com/photo-1497366216548-37526070297c?w=400&q=80",
];

type Props = {
  news: News[];
};

const MOCK_NEWS: News[] = [
  {
    $id: "mock1",
    title: "Pemeliharaan Rutin Lift Gedung A dan B",
    content: "",
    summary: "",
    isPublished: true,
    publishedDate: "2026-03-01T08:00:00.000Z",
  } as News,
  {
    $id: "mock2",
    title: "Fogging Lingkungan Berkala",
    content: "",
    summary: "",
    isPublished: true,
    publishedDate: "2026-02-28T09:30:00.000Z",
  } as News,
  {
    $id: "mock3",
    title: "Rapat Tahunan Warga RT/RW",
    content: "",
    summary: "",
    isPublished: true,
    publishedDate: "2026-02-20T19:00:00.000Z",
  } as News,
  {
    $id: "mock4",
    title: "Pembaruan Sistem Akses Gate",
    content: "",
    summary: "",
    isPublished: true,
    publishedDate: "2026-02-15T07:00:00.000Z",
  } as News,
];

export function LandingClient({ news }: Props) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const displayNews = news.length > 0 ? news : MOCK_NEWS;

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % BACKGROUND_IMAGES.length);
    }, 8000); // Change image every 8 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative h-screen w-full flex flex-col overflow-hidden bg-background-dark text-slate-100 antialiased font-display">
      {/* HEADER */}
      <header className="absolute top-0 left-0 w-full z-50 flex items-center justify-between px-10 py-6 pointer-events-none">
        <div className="flex items-center gap-3 pointer-events-auto">
          <div className="bg-primary p-2 rounded-lg text-white">
            <Building2 className="w-6 h-6" />
          </div>
          <h2 className="text-white text-xl font-bold tracking-tight text-shadow drop-shadow-md">
            Rusun Harum Tebet
          </h2>
        </div>
        <nav className="absolute left-1/2 -translate-x-1/2 flex items-center gap-8 bg-black/40 backdrop-blur-md px-8 py-3 rounded-full border border-white/10 pointer-events-auto shadow-xl">
          <a
            href="#home"
            className="text-white hover:text-primary text-base font-semibold transition-colors"
          >
            Beranda
          </a>
          <a
            href="#lokasi"
            className="text-white/80 hover:text-white text-base font-medium transition-colors"
          >
            Lokasi
          </a>
          <a
            href="#kontak"
            className="text-white/80 hover:text-white text-base font-medium transition-colors"
          >
            Kontak
          </a>
        </nav>
      </header>

      <main className="flex h-full w-full relative">
        {/* LEFT 70% HERO SECTION */}
        <section className="absolute inset-0 w-full h-full flex flex-col items-center justify-center text-center overflow-hidden transition-all duration-300">
          <div className="absolute inset-0 z-0 w-full h-full">
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent z-10 w-full h-full"></div>
            <div className="absolute inset-0 bg-black/30 z-10 w-full h-full"></div>
            {BACKGROUND_IMAGES.map((img, index) => (
              <img
                key={img}
                src={img}
                alt={`Architectural Background ${index + 1}`}
                className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-[2000ms] ease-in-out ${
                  index === currentImageIndex ? "opacity-100" : "opacity-0"
                }`}
              />
            ))}
          </div>

          <div className="absolute bottom-32 right-[32%] z-20 max-w-3xl space-y-8 text-right pr-10">
            <div className="space-y-6 flex flex-col items-end">
              <div className="space-y-2 text-right">
                <h1 className="text-white text-6xl md:text-7xl font-light leading-tight tracking-tight drop-shadow-lg">
                  Selamat Datang di
                </h1>
                <h1 className="text-white text-7xl md:text-8xl font-black leading-tight tracking-tight drop-shadow-xl text-transparent bg-clip-text bg-gradient-to-r from-white to-white/80">
                  Rusun Harum Tebet
                </h1>
              </div>
              <p className="text-slate-200 text-xl font-light max-w-2xl ml-auto leading-relaxed drop-shadow-md bg-black/20 p-6 rounded-xl backdrop-blur-sm border border-white/5">
                Portal informasi dan layanan digital resmi bagi seluruh warga
                Rusun Harum Tebet. Dapatkan berita terbaru, pengumuman penting,
                dan kemudahan akses informasi hunian Anda.
              </p>
            </div>
          </div>
          <div className="absolute bottom-10 left-10 z-20 flex items-center gap-6 text-white/50 text-xs tracking-widest font-medium uppercase">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4" /> Jakarta Selatan
            </div>
          </div>
        </section>

        {/* RIGHT 30% NEWS SIDEBAR */}
        <aside className="absolute right-0 top-0 w-[30%] h-full bg-slate-900/40 backdrop-blur-xl z-30 flex flex-col p-10 pt-36 border-l border-white/10 transition-all duration-300">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-white text-2xl font-bold tracking-tight">
              Berita & Pengumuman
            </h3>
          </div>

          <div className="flex-1 space-y-6 overflow-y-auto no-scrollbar pr-2 custom-scrollbar">
            {displayNews.length === 0 ? (
              <p className="text-white/60 text-sm text-center">
                Belum ada pengumuman terbaru.
              </p>
            ) : (
              displayNews.map((item, index) => (
                <div
                  key={item.$id}
                  className="group cursor-pointer bg-white/5 hover:bg-white/10 border border-white/5 rounded-2xl p-4 transition-all duration-300 backdrop-blur-sm"
                >
                  <div className="flex gap-4">
                    <img
                      src={
                        DEFAULT_NEWS_THUMBNAILS[
                          index % DEFAULT_NEWS_THUMBNAILS.length
                        ]
                      }
                      alt="News Thumbnail"
                      className="w-20 h-20 rounded-xl object-cover shrink-0"
                    />
                    <div className="flex flex-col justify-center">
                      <h4 className="text-white text-base font-semibold leading-snug group-hover:text-primary transition-colors line-clamp-2">
                        {item.title}
                      </h4>
                      <p className="text-slate-400 text-xs mt-2 font-medium flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        {item.publishedDate
                          ? format(
                              new Date(item.publishedDate),
                              "dd MMM yyyy",
                              { locale: id },
                            )
                          : "Terbaru"}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="pt-6">
            <Button
              variant="outline"
              className="w-full flex items-center justify-center gap-2 py-6 rounded-xl bg-white/5 border-white/10 hover:bg-white/10 hover:text-white text-white text-sm font-semibold transition-all backdrop-blur-md"
            >
              Semua Pengumuman
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </aside>
      </main>

      <style
        dangerouslySetInnerHTML={{
          __html: `
        .no-scrollbar::-webkit-scrollbar {
            display: none;
        }
        .no-scrollbar {
            -ms-overflow-style: none;
            scrollbar-width: none;
        }
      `,
        }}
      />
    </div>
  );
}
