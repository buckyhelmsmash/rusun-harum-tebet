import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-6">
      <div className="w-full max-w-3xl text-center space-y-8">
        <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl text-primary">
          Selamat Datang di Rusun Harum Tebet
        </h1>
        <p className="text-xl text-muted-foreground leading-relaxed">
          Portal resmi penghuni. Cek pengumuman terbaru atau akses tagihan
          bulanan Anda secara aman melalui Magic Link.
        </p>

        <div className="flex items-center justify-center gap-4 pt-4">
          <Button asChild size="lg">
            <Link href="/news">Baca Berita Terbaru</Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/admin/login">Masuk sebagai Admin</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
