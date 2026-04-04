import { MapPin } from "lucide-react";

export function WartaMap() {
  return (
    <section className="py-16 border-t border-black">
      <div className="section-container">
        <div className="flex flex-col lg:flex-row gap-12 items-center">
          <div className="w-full lg:w-3/5">
            <div className="aspect-[21/9] border border-black p-1">
              <iframe
                allowFullScreen
                height="100%"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3966.248356972076!2d106.8496458!3d-6.2309594!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e69f39009805561%3A0xe54d65022097782b!2sRusun%20Harum!5e0!3m2!1sid!2sid!4v1715600000000!5m2!1sid!2sid"
                style={{ border: 0 }}
                title="Lokasi Rusun Harum Tebet"
                width="100%"
              />
            </div>
          </div>
          <div className="w-full lg:w-2/5 space-y-6">
            <div className="border-b-2 border-black pb-2">
              <h3 className="text-[0.7rem] font-black tracking-[0.25em] uppercase">
                Lokasi
              </h3>
            </div>
            <address className="not-italic font-headline font-bold text-2xl leading-tight">
              Jl. Tebet Barat Raya No. 1, Jakarta Selatan 12810
            </address>
            <div className="flex flex-col gap-4 pt-4">
              <a
                className="flex items-center gap-3 font-bold text-xs tracking-widest uppercase hover:underline"
                href="https://maps.app.goo.gl/Yp2M6R5sA5p5"
                target="_blank"
                rel="noopener noreferrer"
              >
                <MapPin className="w-4 h-4" />
                Buka di Google Maps
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
