import type { News } from "@/types";

export const MOCK_NEWS: News[] = [
  {
    $id: "mock1",
    title: "Rusun Harum Tebet Lakukan Pembaruan Fasilitas Umum di Area Taman",
    content: `Pengelola mulai melakukan perbaikan area bermain anak dan penambahan bangku taman untuk kenyamanan warga di akhir pekan. Renovasi ini merupakan bagian dari komitmen jangka panjang dalam meningkatkan kualitas hidup penghuni rusun. Pengerjaan diperkirakan selesai dalam dua pekan ke depan dengan melibatkan tim teknis internal.

Selama periode pemeliharaan, seluruh lift di kedua gedung tersebut tidak dapat dioperasikan. Penghuni diharapkan menggunakan tangga darurat yang tersedia di setiap blok.

**Jadwal Pemeliharaan:**
- Gedung A: 5-6 Maret 2026 (Kamis-Jumat)
- Gedung B: 6-7 Maret 2026 (Jumat-Sabtu)

Pemeliharaan ini meliputi penggantian kabel baja, kalibrasi sensor keamanan, pelumasan mesin penggerak, dan pengecekan sistem kelistrikan. Pekerjaan dilaksanakan oleh teknisi bersertifikat dari PT Elevator Nusantara.

Bagi penghuni yang memiliki keterbatasan mobilitas, silakan menghubungi pos keamanan di masing-masing gedung untuk mendapatkan bantuan selama periode pemeliharaan.

Kami mohon maaf atas ketidaknyamanan yang ditimbulkan dan mengucapkan terima kasih atas pengertian seluruh warga.`,
    summary:
      "Pengelola mulai melakukan perbaikan area bermain anak dan penambahan bangku taman untuk kenyamanan warga di akhir pekan. Renovasi ini merupakan bagian dari komitmen jangka panjang dalam meningkatkan kualitas hidup penghuni rusun. Pengerjaan diperkirakan selesai dalam dua pekan ke depan dengan melibatkan tim teknis internal.",
    isPublished: true,
    publishedDate: "2026-03-01T08:00:00.000Z",
  } as News,
  {
    $id: "mock2",
    title: "Fogging Lingkungan Berkala",
    content: `Dalam upaya pencegahan penyakit Demam Berdarah Dengue (DBD), pengelola Rusun Harum Tebet bekerja sama dengan Puskesmas Kecamatan Tebet akan melaksanakan kegiatan fogging (pengasapan) di seluruh area lingkungan rusun.

**Jadwal Pelaksanaan:**
- Tanggal: 10 Maret 2026
- Waktu: 06.00 - 09.00 WIB
- Area: Seluruh blok A, B, C, D termasuk area parkir dan taman

**Yang Perlu Diperhatikan:**
1. Tutup semua makanan dan minuman yang terbuka
2. Simpan pakaian yang sedang dijemur
3. Tutup akuarium dan kandang hewan peliharaan
4. Hindari area yang sedang dilakukan fogging
5. Buka kembali jendela setelah 30 menit pengasapan selesai

Warga yang memiliki riwayat alergi atau asma disarankan untuk meninggalkan unit sementara selama proses pengasapan berlangsung.

Kegiatan ini rutin dilaksanakan setiap 3 bulan sekali sebagai bagian dari program kesehatan lingkungan.`,
    summary:
      "Pengasapan nyamuk DBD di seluruh area rusun untuk pencegahan berkala.",
    isPublished: true,
    publishedDate: "2026-02-28T09:30:00.000Z",
  } as News,
  {
    $id: "mock3",
    title: "Rapat Tahunan Warga RT/RW",
    content: `Rapat tahunan warga RT/RW Rusun Harum Tebet akan diselenggarakan dengan agenda evaluasi program kerja tahun 2025 dan penyusunan rencana kerja tahun 2026.

**Detail Acara:**
- Hari/Tanggal: Sabtu, 15 Maret 2026
- Waktu: 19.00 - 21.00 WIB
- Tempat: Aula Gedung B Lantai 1
- Ketua Pelaksana: Bapak Ahmad Fauzi (RT 05)

**Agenda Rapat:**
1. Pembukaan dan sambutan Ketua RT/RW
2. Laporan pertanggungjawaban pengurus tahun 2025
3. Evaluasi program keamanan dan kebersihan lingkungan
4. Pembahasan rencana perbaikan fasilitas umum
5. Pembahasan iuran dan pengelolaan keuangan
6. Pemilihan pengurus baru periode 2026-2028
7. Tanya jawab dan penutup

Setiap unit diharapkan mengirimkan minimal 1 perwakilan. Konsumsi disediakan oleh panitia.

Bagi warga yang berhalangan hadir, dapat memberikan surat kuasa kepada warga lain.`,
    summary:
      "Rapat tahunan membahas evaluasi keamanan dan rencana perbaikan fasilitas.",
    isPublished: true,
    publishedDate: "2026-02-20T19:00:00.000Z",
  } as News,
  {
    $id: "mock4",
    title: "Pembaruan Sistem Akses Gate",
    content: `Pengelola Rusun Harum Tebet menginformasikan bahwa sistem akses gate utama akan diperbarui dari sistem kartu magnetik ke sistem kartu proximity (contactless) yang lebih modern dan aman.

**Timeline Implementasi:**
- 20-25 Februari 2026: Instalasi perangkat baru
- 26-28 Februari 2026: Penukaran kartu lama ke kartu baru
- 1 Maret 2026: Sistem baru aktif penuh

**Lokasi Penukaran Kartu:**
- Pos Keamanan Gate Utama (24 jam)
- Kantor Pengelola Gedung A Lt. 1 (08.00-17.00 WIB)

**Dokumen yang Diperlukan:**
- KTP asli penghuni
- Kartu akses lama
- Bukti hunian (kontrak/sertifikat)

Setiap unit berhak mendapatkan maksimal 3 kartu akses baru secara gratis. Kartu tambahan dikenakan biaya Rp 50.000/kartu.

Kartu lama akan dinonaktifkan secara otomatis pada 1 Maret 2026. Pastikan penukaran dilakukan sebelum tenggat waktu.`,
    summary:
      "Penggantian kartu akses gate ke sistem proximity baru untuk seluruh penghuni.",
    isPublished: true,
    publishedDate: "2026-02-15T07:00:00.000Z",
  } as News,
];

const NEWS_IMAGES = [
  "https://lh3.googleusercontent.com/aida-public/AB6AXuDyN9HF9lrzxjlHEUC5RMMk3yw8pTbKquotK7KHaabhn5woO4yzJ7CqjTwXYBsqwiqYvagdX41RIgHD0SFDwDfeGahlC6C9xrYasj5LRLqsKvtSNfhdmviMDMeT7xl10tLLKSf4k2o6w77E0p2SoqsOJ03HA4ubihMXsgajYSnox04Ed0X8959DB_yrC507mP0T0So4G2F1cHDkeTjyXXnYQG0IjznOpDPOoQ9UwcPPTQwhpVYp3-HcuQANJfbjHUb1YnrnAGcilJN_",
  "https://lh3.googleusercontent.com/aida-public/AB6AXuDwbu9EWrTig1wjiAfICsviOjm4_luxyclp1zkRuy8q4z2z-pDw9_3KiwuZUZMAnum7_VE1X-V_TmmaWRrHWCYyVskUKZHBVJZmNF5aKiyYHz1_l183mv5EZtEM_37ESCscQ1mk9OUeCz6O3UvbaFdwwpKGtwb1pla0m3lE-QJqw9AhijasmE2boPQemeNpisKXccmIN2Q5PbsRxioStRPScyOQB91lX519agrgVBf4_6mWUoiN_Ybid4qtu7XC8eZqfjLYEwxctWgj",
  "https://lh3.googleusercontent.com/aida-public/AB6AXuCf7Scfz9xVMYem_dEkm8y7zhMHiKEnzF9loEGxefdTGENtkfiZBGeEl6-AEyz0QuZ37bsXYa7eaOvOepiuIAuvHHLmAMEjQ6tAW-jVZb5O4szD1UkroebtTz9ZmB-Ik0Szet9q50KryJTFB9n3prxh0xkftUYBzHY8UYn6oGxTo7ie-U9-5yjLqlMK2AETR8I16GLK1DjEQl0fiSglLrRmyYXVqFKtuPaOMkm7JRPT7kGLpSHqkFN5woShicZN8FRmT7KAmvpoVmy8",
  "https://lh3.googleusercontent.com/aida-public/AB6AXuDUEJnynr8CUjzksr6r8zdsFPB0Wx-GCtpv0qFFPpP2Lfm3w4RXCinirM_jk9K3IRCK2idL7oOIR3sASidr7FZ-vfiFOtQtWA0Z9DIGjDI8xAF140T-Pr_LN-8fBUd0AB-4FRdfeoMHeLmlU8egzwndPMYPAeinFV-xy0Ranj33lGix9l1zWSvW3s9jjt8Pu_krWFQbaYxx_iG3iLXASh8DG-iNt-aPSaU1-N8Cto-mIR01mwbSt0fYoq4YxIxSZ5wCe-OJktd8vVGK",
  "https://lh3.googleusercontent.com/aida-public/AB6AXuDtbzwLtpKHr9usMN5sAk-gNdeQqaYpMghMb2ydN1sCUT2u-GFPc_Ln0hySTb7thj-EJ00t8ElaDx1HTuwNwr3ST4zTcye7Fr1jFNfU_jZC5Rj1QTKhLg6HlNPsRPxlbxeAVrXDwAJerX-6mP-zI-rvI7G20RkDMDw1lr9_48NSjJeH2E5qUtuxZv989HRNeAWtvm322vNvgAX_5lrjAnQiQq6DoMGsLg1cxVRE_wMIItTuPa8KY1UWpLQRq4Gti9HxuBZnyQRoDix6",
];

const NEWS_CATEGORIES: Record<string, string> = {
  mock1: "TEKNIS",
  mock2: "KEGIATAN WARGA",
  mock3: "PENDIDIKAN",
  mock4: "INFRASTRUKTUR",
};

export function getNewsImage(index: number): string {
  return NEWS_IMAGES[index % NEWS_IMAGES.length];
}

export function getNewsById(id: string) {
  return MOCK_NEWS.find((n) => n.$id === id) ?? null;
}

export function getNewsImageById(id: string): string {
  const index = MOCK_NEWS.findIndex((n) => n.$id === id);
  return getNewsImage(index >= 0 ? index : 0);
}

export function getNewsCategory(id: string): string {
  return NEWS_CATEGORIES[id] ?? "UMUM";
}
