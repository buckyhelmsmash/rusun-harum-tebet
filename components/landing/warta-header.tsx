import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";
import { Search } from "lucide-react";
import Link from "next/link";

export function WartaHeader() {
  const today = format(new Date(), "EEEE, dd MMMM yyyy", { locale: localeId });

  return (
    <header className="w-full border-b border-black/10 bg-white sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link
            href="/"
            className="text-3xl font-black font-headline tracking-tighter text-black"
          >
            WARTA HARUM
          </Link>
          <nav className="hidden md:flex items-center gap-6">
            <Link
              href="/#berita"
              className="text-[0.7rem] font-bold tracking-widest uppercase hover:text-black/60 transition-colors"
            >
              Berita
            </Link>
            <Link
              href="/#tentang"
              className="text-[0.7rem] font-bold tracking-widest uppercase hover:text-black/60 transition-colors"
            >
              Tentang
            </Link>
            <Link
              href="/#kontak"
              className="text-[0.7rem] font-bold tracking-widest uppercase hover:text-black/60 transition-colors"
            >
              Kontak
            </Link>
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <div className="hidden sm:block text-right mr-4">
            <p className="text-[0.6rem] font-bold uppercase tracking-tighter leading-none capitalize">
              {today}
            </p>
          </div>
          <Search className="w-5 h-5 text-black cursor-pointer hover:text-black/60 transition-colors" />
        </div>
      </div>
    </header>
  );
}
