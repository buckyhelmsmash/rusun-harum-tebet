"use client";

import { NewsForm } from "@/components/news/news-form";
import { useNewsItem, useUpdateNews } from "@/hooks/api/use-news";
import { useRouter, useParams } from "next/navigation";
import { goeyToast } from "@/components/ui/goey-toaster";
import { Loader2 } from "lucide-react";

export default function EditNewsPage() {
  const params = useParams();
  const newsId = params.id as string;
  const { data: newsItem, isLoading } = useNewsItem(newsId);
  const { mutateAsync: updateNews, isPending } = useUpdateNews();
  const router = useRouter();

  const handleSubmit = async (data: Parameters<typeof updateNews>[0]["data"]) => {
    try {
      await updateNews({
        id: newsId,
        data: {
          title: data.title,
          slug: data.slug || undefined,
          summary: data.summary,
          content: data.content,
          coverImageId: data.coverImageId || undefined,
          publishedDate: data.publishedDate || undefined,
          isLeadArticle: data.isLeadArticle,
          labelId: data.labelId === "none" ? undefined : data.labelId || undefined,
          isPublished: data.isPublished,
        },
      });
      goeyToast.success("Artikel berhasil diperbarui!");
      router.push("/admin/news");
    } catch (error) {
      console.error(error);
      goeyToast.error("Gagal memperbarui artikel.");
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!newsItem) {
    return (
      <div className="container mx-auto p-4 md:p-8">
        <div className="text-center text-muted-foreground">
          Artikel tidak ditemukan.
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 md:p-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Edit Berita</h1>
        <p className="text-muted-foreground">
          Perbarui artikel berita yang dipilih.
        </p>
      </div>

      <NewsForm
        initialData={newsItem}
        onSubmit={handleSubmit}
        isSubmitting={isPending}
      />
    </div>
  );
}
