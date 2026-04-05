"use client";

import { NewsForm } from "@/components/news/news-form";
import { useCreateNews } from "@/hooks/api/use-news";
import { useRouter } from "next/navigation";
import { goeyToast } from "@/components/ui/goey-toaster";

export default function CreateNewsPage() {
  const { mutateAsync: createNews, isPending } = useCreateNews();
  const router = useRouter();

  const handleSubmit = async (data: Parameters<typeof createNews>[0]) => {
    try {
      await createNews({
        title: data.title,
        slug: data.slug || undefined,
        summary: data.summary,
        content: data.content,
        coverImageId: data.coverImageId || undefined,
        publishedDate: data.publishedDate || undefined,
        isLeadArticle: data.isLeadArticle,
        labelId: data.labelId === "none" ? undefined : data.labelId || undefined,
        isPublished: data.isPublished,
      });
      goeyToast.success("Artikel berhasil dibuat!");
      router.push("/admin/news");
    } catch (error) {
      console.error(error);
      goeyToast.error("Gagal membuat artikel.");
    }
  };

  return (
    <div className="container mx-auto p-4 md:p-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Buat Berita</h1>
        <p className="text-muted-foreground">
          Tulis artikel baru untuk portal Warta Harum.
        </p>
      </div>

      <NewsForm onSubmit={handleSubmit} isSubmitting={isPending} />
    </div>
  );
}
