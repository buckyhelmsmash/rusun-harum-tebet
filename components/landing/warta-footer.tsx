import { Fingerprint, Globe } from "lucide-react";
import Link from "next/link";

export function WartaFooter() {
  return (
    <footer className="bg-black text-white pt-20 pb-10">
      <div className="max-w-7xl mx-auto px-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 mb-16">
          <div className="md:col-span-5">
            <span className="text-3xl font-black font-headline tracking-tighter uppercase mb-6 block">
              Warta Harum
            </span>
            <p className="text-xs font-medium text-white/50 leading-relaxed max-w-sm uppercase tracking-wider">
              Sebuah publikasi independen yang didedikasikan untuk transparansi
              informasi dan pembangunan komunitas di Rumah Susun Harum Tebet.
            </p>
          </div>
          <div className="md:col-span-7 grid grid-cols-2 sm:grid-cols-3 gap-8">
            <div className="space-y-4">
              <h5 className="text-[0.6rem] font-black tracking-[0.3em] uppercase text-white/30">
                Navigasi
              </h5>
              <ul className="text-[0.7rem] font-bold space-y-2 uppercase tracking-tighter">
                <li>
                  <Link href="/news" className="hover:text-white/70">
                    Indeks Berita
                  </Link>
                </li>
                <li>
                  <Link href="/news" className="hover:text-white/70">
                    Arsip Digital
                  </Link>
                </li>
                <li>
                  <Link href="/#kontak" className="hover:text-white/70">
                    Opini Warga
                  </Link>
                </li>
              </ul>
            </div>
            <div className="space-y-4">
              <h5 className="text-[0.6rem] font-black tracking-[0.3em] uppercase text-white/30">
                Legalitas
              </h5>
              <ul className="text-[0.7rem] font-bold space-y-2 uppercase tracking-tighter">
                <li>
                  <a href="#" className="hover:text-white/70">
                    Privasi
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white/70">
                    Disclaimer
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white/70">
                    Redaksi
                  </a>
                </li>
              </ul>
            </div>
            <div className="space-y-4 col-span-2 sm:col-span-1">
              <h5 className="text-[0.6rem] font-black tracking-[0.3em] uppercase text-white/30">
                Bahasa
              </h5>
              <div className="flex items-center gap-2 text-[0.7rem] font-bold">
                <span className="underline">Indonesia</span>
                <span className="text-white/30">|</span>
                <span className="text-white/50 cursor-pointer">English</span>
              </div>
            </div>
          </div>
        </div>
        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-[0.6rem] font-bold tracking-[0.2em] text-white/30 uppercase">
            © {new Date().getFullYear()} Warta Harum Tebet. Semua hak cipta
            dilindungi undang-undang.
          </p>
          <div className="flex gap-4">
            <Globe className="w-4 h-4 text-white/40" />
            <Fingerprint className="w-4 h-4 text-white/40" />
          </div>
        </div>
      </div>
    </footer>
  );
}
