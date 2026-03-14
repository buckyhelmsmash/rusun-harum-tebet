"use client";

import { format } from "date-fns";
import { id } from "date-fns/locale";
import { ArrowRight, Building2, Calendar, MapPin } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import type { News } from "@/types";

const HERO_FALLBACK_IMAGES = [
  "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=1600&q=80",
  "https://images.unsplash.com/photo-1515263487990-61b07816b324?w=1600&q=80",
  "https://images.unsplash.com/photo-1460317442991-0ec209397118?w=1600&q=80",
  "https://images.unsplash.com/photo-1574362848149-11496d93a7c7?w=1600&q=80",
];

type Props = {
  news: News[];
};

const MOCK_NEWS: News[] = [
  {
    $id: "mock1",
    title: "Pemeliharaan Rutin Lift Gedung A dan B",
    content:
      "Pengelola rusun akan melaksanakan pemeliharaan rutin lift di Gedung A dan B pada tanggal 5-7 Maret 2026. Selama periode tersebut, penghuni diharapkan menggunakan tangga darurat.",
    summary: "Jadwal pemeliharaan lift rutin Gedung A & B pada 5-7 Maret 2026.",
    isPublished: true,
    publishedDate: "2026-03-01T08:00:00.000Z",
  } as News,
  {
    $id: "mock2",
    title: "Fogging Lingkungan Berkala",
    content:
      "Kegiatan fogging (pengasapan) nyamuk demam berdarah akan dilaksanakan di seluruh area Rusun Harum Tebet. Warga dimohon menutup makanan dan minuman yang terbuka.",
    summary:
      "Pengasapan nyamuk DBD di seluruh area rusun untuk pencegahan berkala.",
    isPublished: true,
    publishedDate: "2026-02-28T09:30:00.000Z",
  } as News,
  {
    $id: "mock3",
    title: "Rapat Tahunan Warga RT/RW",
    content:
      "Rapat tahunan warga RT/RW akan diselenggarakan di Aula Gedung B lantai 1. Agenda utama meliputi evaluasi keamanan, kebersihan, dan rencana perbaikan fasilitas umum tahun 2026.",
    summary:
      "Rapat tahunan membahas evaluasi keamanan dan rencana perbaikan fasilitas.",
    isPublished: true,
    publishedDate: "2026-02-20T19:00:00.000Z",
  } as News,
  {
    $id: "mock4",
    title: "Pembaruan Sistem Akses Gate",
    content:
      "Sistem akses gate utama akan diperbarui ke kartu proximity baru. Seluruh penghuni wajib menukarkan kartu lama ke pos keamanan sebelum 28 Februari 2026.",
    summary:
      "Penggantian kartu akses gate ke sistem proximity baru untuk seluruh penghuni.",
    isPublished: true,
    publishedDate: "2026-02-15T07:00:00.000Z",
  } as News,
];

const GREETING_SLIDE = {
  title: "Selamat Datang di\nRusun Harum Tebet",
  summary:
    "Portal informasi dan layanan digital resmi bagi seluruh warga Rusun Harum Tebet. Dapatkan berita terbaru, pengumuman penting, dan kemudahan akses informasi hunian Anda.",
};

function getNewsImage(index: number): string {
  return HERO_FALLBACK_IMAGES[index % HERO_FALLBACK_IMAGES.length];
}

function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength).trimEnd()}…`;
}

export function LandingClient({ news }: Props) {
  const [activeIndex, setActiveIndex] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const displayNews = news.length > 0 ? news : MOCK_NEWS;

  const totalSlides = displayNews.length + 1;
  const isGreetingSlide = activeIndex === 0;
  const activeNewsIndex = activeIndex - 1;
  const activeNews = isGreetingSlide ? null : displayNews[activeNewsIndex];

  const startTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % totalSlides);
    }, 15000);
  }, [totalSlides]);

  useEffect(() => {
    startTimer();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [startTimer]);

  const handleCardClick = (newsIdx: number) => {
    setActiveIndex(newsIdx + 1);
    startTimer();
  };

  const heroTitle = isGreetingSlide
    ? GREETING_SLIDE.title
    : activeNews?.title || "";
  const heroSubheading = isGreetingSlide
    ? GREETING_SLIDE.summary
    : activeNews?.summary || truncateText(activeNews?.content || "", 150);

  return (
    <div className="relative h-screen w-full flex flex-col overflow-hidden bg-slate-950 text-slate-100 antialiased font-display">
      {/* HEADER — logo only, nav moved to news sidebar */}
      <header className="absolute top-0 left-0 w-full z-50 flex items-center px-6 md:px-10 py-4 md:py-6 pointer-events-none">
        <div className="flex items-center gap-3 pointer-events-auto">
          <div className="bg-primary p-2 rounded-lg text-white">
            <Building2 className="w-5 h-5 md:w-6 md:h-6" />
          </div>
          <h2 className="text-white text-lg md:text-xl font-bold tracking-tight drop-shadow-md">
            Rusun Harum Tebet
          </h2>
        </div>
      </header>

      <main className="relative h-full w-full">
        {/* FULL-WIDTH BACKGROUND IMAGES — spans entire screen for glassmorphism */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/10 z-10" />
          <div className="absolute inset-0 bg-black/40 z-10" />
          <img
            src={HERO_FALLBACK_IMAGES[0]}
            alt="Rusun Harum Tebet"
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-[2000ms] ease-in-out ${
              isGreetingSlide ? "opacity-100" : "opacity-0"
            }`}
          />
          {displayNews.map((item, index) => (
            <img
              key={item.$id}
              src={getNewsImage(index)}
              alt={item.title}
              className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-[2000ms] ease-in-out ${
                index === activeNewsIndex ? "opacity-100" : "opacity-0"
              }`}
            />
          ))}
        </div>

        {/* HERO TEXT — positioned in the left half, right-aligned */}
        <div className="hidden md:block absolute bottom-36 left-0 w-1/2 z-20">
          <div className="max-w-[85%] ml-auto pr-10 space-y-4 text-right">
            <div className="space-y-3 flex flex-col items-end">
              {!isGreetingSlide && (
                <p className="text-amber-400 text-sm font-semibold uppercase tracking-widest drop-shadow-md">
                  Berita Terkini
                </p>
              )}
              <h1
                key={isGreetingSlide ? "greeting" : activeNews?.$id}
                className={`text-white font-black leading-tight tracking-tight drop-shadow-xl animate-fade-in whitespace-pre-line ${
                  isGreetingSlide ? "text-6xl" : "text-5xl"
                }`}
              >
                {heroTitle}
              </h1>
            </div>
            <p className="text-slate-200/90 text-base font-light max-w-xl ml-auto leading-relaxed drop-shadow-md bg-black/30 px-6 py-4 rounded-xl backdrop-blur-sm border border-white/5">
              {heroSubheading}
            </p>
          </div>
        </div>

        {/* MOBILE HERO TEXT — visible only on mobile, above the sidebar */}
        <div className="md:hidden absolute top-20 left-6 right-6 z-20 space-y-3 text-right">
          <div className="space-y-2 flex flex-col items-end">
            {!isGreetingSlide && (
              <p className="text-amber-400 text-xs font-semibold uppercase tracking-widest drop-shadow-md">
                Berita Terkini
              </p>
            )}
            <h1
              key={isGreetingSlide ? "greeting-m" : `${activeNews?.$id}-m`}
              className={`text-white font-black leading-tight tracking-tight drop-shadow-xl animate-fade-in whitespace-pre-line ${
                isGreetingSlide ? "text-3xl" : "text-2xl"
              }`}
            >
              {heroTitle}
            </h1>
          </div>
        </div>

        <div className="hidden md:flex absolute bottom-6 left-10 z-20 items-center gap-6 text-white/50 text-xs tracking-widest font-medium uppercase">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4" /> Jakarta Selatan
          </div>
        </div>

        {/* NEWS SIDEBAR — glassmorphism + nav island */}
        <aside className="absolute md:right-0 md:top-0 bottom-0 left-0 right-0 md:left-auto md:w-1/2 h-[55vh] md:h-full bg-slate-900/70 backdrop-blur-2xl z-30 flex flex-col px-5 py-5 md:px-8 md:pt-8 md:pb-8 border-t md:border-t-0 md:border-l border-white/10">
          {/* Navigation island — left-aligned at top of news section */}
          <nav className="hidden md:inline-flex items-center gap-6 bg-white/5 backdrop-blur-md px-6 py-2.5 rounded-full border border-white/10 shadow-lg mb-6 w-fit">
            <a
              href="#home"
              className="text-white hover:text-primary text-sm font-semibold transition-colors"
            >
              Berita
            </a>
            <a
              href="#lokasi"
              className="text-white/70 hover:text-white text-sm font-medium transition-colors"
            >
              Tentang Rusun Harum
            </a>
            <a
              href="#kontak"
              className="text-white/70 hover:text-white text-sm font-medium transition-colors"
            >
              Kontak
            </a>
          </nav>

          <div className="flex items-center justify-between mb-4 md:mb-5">
            <h3 className="text-white text-2xl md:text-3xl font-bold tracking-tight">
              Berita & Pengumuman
            </h3>
          </div>

          <div className="flex-1 space-y-3 md:space-y-4 overflow-y-auto no-scrollbar">
            {displayNews.length === 0 ? (
              <p className="text-white/60 text-sm text-center">
                Belum ada pengumuman terbaru.
              </p>
            ) : (
              displayNews.map((item, index) => {
                const isActive = index === activeNewsIndex;
                const subtext =
                  item.summary || truncateText(item.content || "", 120);

                return (
                  <button
                    type="button"
                    key={item.$id}
                    onClick={() => handleCardClick(index)}
                    className={`w-full text-left cursor-pointer rounded-2xl overflow-hidden transition-all duration-300 ${
                      isActive
                        ? "bg-white/15 ring-2 ring-amber-400/60 scale-[1.01] shadow-lg shadow-amber-400/10"
                        : "bg-white/5 ring-1 ring-white/5 hover:bg-white/10 hover:ring-white/15"
                    }`}
                  >
                    <div className="flex gap-0">
                      {/* Flush thumbnail — no padding */}
                      <img
                        src={getNewsImage(index)}
                        alt={item.title}
                        className="w-32 md:w-40 h-32 md:h-36 object-cover shrink-0"
                      />
                      <div className="flex flex-col justify-center p-4 md:p-5 min-w-0 gap-2">
                        <h4
                          className={`text-lg md:text-2xl font-bold leading-snug transition-colors line-clamp-2 ${
                            isActive ? "text-amber-400" : "text-white"
                          }`}
                        >
                          {item.title}
                        </h4>
                        {subtext && (
                          <p className="text-slate-300 text-sm md:text-base leading-relaxed line-clamp-2">
                            {subtext}
                          </p>
                        )}
                        <span
                          className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full w-fit transition-colors ${
                            isActive
                              ? "bg-amber-400/20 text-amber-300"
                              : "bg-primary/20 text-primary"
                          }`}
                        >
                          <Calendar className="w-3 h-3" />
                          {item.publishedDate
                            ? format(
                                new Date(item.publishedDate),
                                "dd MMM yyyy",
                                { locale: id },
                              )
                            : "Terbaru"}
                        </span>
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>

          <div className="pt-4 md:pt-6">
            <Button
              variant="outline"
              className="w-full flex items-center justify-center gap-2 py-5 md:py-6 rounded-xl bg-white/5 border-white/10 hover:bg-white/10 hover:text-white text-white text-sm font-semibold transition-all backdrop-blur-md"
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
				.no-scrollbar::-webkit-scrollbar { display: none; }
				.no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
				@keyframes fade-in {
					from { opacity: 0; transform: translateY(8px); }
					to { opacity: 1; transform: translateY(0); }
				}
				.animate-fade-in { animation: fade-in 0.6s ease-out; }
			`,
        }}
      />
    </div>
  );
}
