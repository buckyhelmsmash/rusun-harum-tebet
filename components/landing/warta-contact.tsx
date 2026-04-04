import { Mail, Phone, Share2 } from "lucide-react";

export function WartaContact() {
  return (
    <section id="kontak" className="py-12 md:py-24 bg-white border-t border-black">
      <div className="section-container text-center">
        <h2 className="text-3xl sm:text-5xl md:text-6xl font-black font-headline tracking-tighter uppercase mb-10 md:mb-20 text-center">
          Hubungi kami
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-left border-b border-black pb-16">
          <div className="md:pr-8 md:border-r border-neutral-200">
            <h4 className="text-[0.65rem] font-black tracking-[0.25em] uppercase mb-6 text-black/50">
              Kantor Pengelola
            </h4>
            <p className="font-serif-body text-sm leading-relaxed">
              Lantai Dasar Blok A, Rusun Harum Tebet.
              <br />
              Senin - Jumat: 08.00 - 16.00 WIB
            </p>
          </div>
          <div className="md:px-8 md:border-r border-neutral-200">
            <h4 className="text-[0.65rem] font-black tracking-[0.25em] uppercase mb-6 text-black/50">
              Korespondensi
            </h4>
            <p className="font-headline font-bold text-lg md:text-2xl mb-1 tracking-tight break-all sm:break-normal">
              info@wartaharum.id
            </p>
            <p className="font-serif-body text-xs text-neutral-500 italic">
              Kirimkan rilis kegiatan atau saran konten.
            </p>
          </div>
          <div className="md:pl-8">
            <h4 className="text-[0.65rem] font-black tracking-[0.25em] uppercase mb-6 text-black/50">
              Hotline Warga
            </h4>
            <p className="font-headline font-bold text-lg md:text-2xl mb-1 tracking-tight">
              +62 (21) 555-0123
            </p>
            <p className="font-serif-body text-xs text-neutral-500 italic">
              Untuk laporan darurat infrastruktur.
            </p>
          </div>
        </div>
        <div className="flex justify-center gap-4 pt-12">
          <button
            className="w-10 h-10 border border-black flex items-center justify-center hover:bg-black hover:text-white transition-all"
            type="button"
          >
            <Share2 className="w-4 h-4" />
          </button>
          <button
            className="w-10 h-10 border border-black flex items-center justify-center hover:bg-black hover:text-white transition-all"
            type="button"
          >
            <Mail className="w-4 h-4" />
          </button>
          <button
            className="w-10 h-10 border border-black flex items-center justify-center hover:bg-black hover:text-white transition-all"
            type="button"
          >
            <Phone className="w-4 h-4" />
          </button>
        </div>
      </div>
    </section>
  );
}
