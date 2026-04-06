"use client";

import type { ColumnDef, Row } from "@tanstack/react-table";
import { Edit, Plus, Trash } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { DataTable } from "@/components/shared/data-table";
import { StatusBadge } from "@/components/shared/status-badge";
import { useGetNews, useDeleteNews } from "@/hooks/api/use-news";
import type { News } from "@/types";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { goeyToast } from "@/components/ui/goey-toaster";

function ActionCell({ row }: { row: Row<News> }) {
  const { mutateAsync: deleteNews, isPending } = useDeleteNews();
  const [open, setOpen] = useState(false);

  const handleDelete = async () => {
    try {
      await deleteNews({ id: row.original.$id });
      goeyToast.success("Artikel berhasil dihapus.");
      setOpen(false);
    } catch (error) {
      console.error(error);
      goeyToast.error("Gagal menghapus artikel.");
    }
  };

  return (
    <div className="flex justify-end gap-2">
      <Link
        href={`/admin/news/${row.original.$id}`}
        className="text-slate-400 hover:text-blue-600 inline-flex p-1.5"
      >
        <Edit className="h-4 w-4" />
      </Link>

      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogTrigger asChild>
          <button className="text-slate-400 hover:text-red-600 inline-flex p-1.5 transition-colors">
            <Trash className="h-4 w-4" />
          </button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Artikel?</AlertDialogTitle>
            <AlertDialogDescription>
              Tindakan ini tidak dapat dibatalkan. Artikel {" "}
              <span className="font-semibold text-foreground">
                {row.original.title}
              </span>{" "}
              akan dihapus secara permanen dari server.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending}>Batal</AlertDialogCancel>
            <Button
              variant="destructive"
              onClick={(e) => {
                e.preventDefault();
                handleDelete();
              }}
              disabled={isPending}
            >
              {isPending ? "Menghapus..." : "Hapus"}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export function NewsClient() {
  const [search, setSearch] = useState("");
  const { data, isLoading } = useGetNews();

  const news = data?.items ?? [];

  const filteredNews = useMemo(() => {
    if (!search) return news;
    return news.filter((n) =>
      n.title.toLowerCase().includes(search.toLowerCase())
    );
  }, [news, search]);

  const columns: ColumnDef<News, unknown>[] = useMemo(
    () => [
      {
        accessorKey: "title",
        header: "Judul Berita",
        cell: ({ row }) => (
          <span className="font-semibold text-wrap truncate block max-w-[300px]">
            {row.original.title}
          </span>
        ),
      },
      {
        accessorKey: "publishedDate",
        header: "Tanggal Publikasi",
        cell: ({ row }) => {
          if (!row.original.publishedDate) return "-";
          return new Date(row.original.publishedDate).toLocaleDateString(
            "id-ID",
            { day: "2-digit", month: "short", year: "numeric" }
          );
        },
      },
      {
        accessorKey: "isLeadArticle",
        header: "Pengumuman Utama",
        cell: ({ row }) => (
          <StatusBadge
            variant={row.original.isLeadArticle ? "success" : "default"}
          >
            {row.original.isLeadArticle ? "Ya" : "Tidak"}
          </StatusBadge>
        ),
      },
      {
        accessorKey: "isPublished",
        header: "Status",
        cell: ({ row }) => (
          <StatusBadge variant={row.original.isPublished ? "success" : "info"}>
            {row.original.isPublished ? "Publik" : "Draft"}
          </StatusBadge>
        ),
      },
      {
        id: "actions",
        header: "",
        cell: ({ row }) => <ActionCell row={row} />,
      },
    ],
    []
  );

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            Warta Harum
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Kelola pengumuman dan berita portal warga
          </p>
        </div>
        <Link href="/admin/news/create">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Tambah Berita
          </Button>
        </Link>
      </div>

      <DataTable
        columns={columns}
        data={filteredNews}
        isLoading={isLoading}
        keyExtractor={(n) => n.$id}
        searchPlaceholder="Cari judul berita..."
        searchValue={search}
        onSearchChange={setSearch}
        total={filteredNews.length}
      />
    </div>
  );
}
