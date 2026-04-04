export function WartaAbout() {
  return (
    <section id="tentang" className="mt-20 py-20 bg-[#f9f8f6] border-t border-black">
      <div className="section-container">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          <div className="lg:col-span-4">
            <span className="text-xs font-bold tracking-[0.3em] uppercase text-black/40 block mb-4">
              Editorial Note
            </span>
            <h2 className="text-5xl font-black font-headline tracking-tighter uppercase leading-[0.85] mb-8">
              Tentang Kami
            </h2>
          </div>
          <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-10">
            <div>
              <h3 className="text-xs font-black tracking-widest uppercase mb-4 pb-2 border-b border-black/10">
                Warta Harum
              </h3>
              <p className="text-[0.95rem] font-serif-body leading-relaxed text-neutral-600">
                Warta Harum merupakan portal berita dan informasi resmi yang
                dikelola secara kolektif untuk melayani seluruh warga Rumah Susun
                Harum Tebet. Kami berkomitmen untuk menyajikan pembaruan terkini
                mengenai kegiatan komunitas, pengumuman teknis, hingga jadwal
                pelayanan publik.
              </p>
            </div>
            <div>
              <h3 className="text-xs font-black tracking-widest uppercase mb-4 pb-2 border-b border-black/10">
                Hunian Kita
              </h3>
              <p className="text-[0.95rem] font-serif-body leading-relaxed text-neutral-600">
                Rusun Harum Tebet adalah kawasan hunian vertikal strategis di
                Jakarta Selatan yang mengedepankan nilai-nilai kekeluargaan,
                kebersihan, dan kenyamanan bersama. Menciptakan ekosistem urban
                yang harmonis bagi setiap penghuni di tengah dinamika ibu kota.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
