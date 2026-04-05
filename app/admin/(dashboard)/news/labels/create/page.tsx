"use client";

import { useForm } from "@tanstack/react-form";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { goeyToast } from "@/components/ui/goey-toaster";
import { useCreateNewsLabel } from "@/hooks/api/use-news";

const FormSchema = z.object({
  name: z.string().min(1, "Nama label wajib diisi"),
  color: z.string().min(1, "Warna wajib dipilih"),
});

export default function CreateNewsLabelPage() {
  const { mutateAsync: createLabel, isPending } = useCreateNewsLabel();
  const router = useRouter();

  const form = useForm({
    defaultValues: {
      name: "",
      color: "#3b82f6",
    },
    onSubmit: async ({ value }) => {
      try {
        const validated = FormSchema.parse(value);
        await createLabel(validated);
        goeyToast.success("Label berhasil dibuat!");
        router.back();
      } catch (error: unknown) {
        const message =
          error instanceof Error ? error.message : "Gagal membuat label.";
        goeyToast.error(message);
      }
    },
  });

  return (
    <div className="container mx-auto p-4 md:p-8">
      <div className="mb-6">
        <Link
          href="/admin/news"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Kembali ke Berita
        </Link>
        <h1 className="text-3xl font-bold tracking-tight">Tambah Label Berita</h1>
        <p className="text-muted-foreground">
          Buat label baru untuk kategorisasi berita.
        </p>
      </div>

      <Card className="max-w-md">
        <CardHeader>
          <CardTitle>Label Baru</CardTitle>
          <CardDescription>
            Nama label harus unik. Label digunakan untuk mengkategorikan artikel
            berita.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            id="label-form"
            onSubmit={(e) => {
              e.preventDefault();
              e.stopPropagation();
              form.handleSubmit();
            }}
            className="space-y-6"
          >
            <form.Field
              name="name"
              children={(field) => (
                <div className="space-y-2">
                  <Label htmlFor={field.name}>Nama Label</Label>
                  <Input
                    id={field.name}
                    name={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    placeholder="contoh: Pengumuman, Kegiatan, Info..."
                  />
                  {field.state.meta.errors.length > 0 && (
                    <p className="text-sm text-destructive">
                      {field.state.meta.errors.join(", ")}
                    </p>
                  )}
                </div>
              )}
            />

            <form.Field
              name="color"
              children={(field) => (
                <div className="space-y-2">
                  <Label htmlFor={field.name}>Warna Label</Label>
                  <div className="flex items-center gap-3">
                    <input
                      id={field.name}
                      name={field.name}
                      type="color"
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                      className="h-10 w-14 cursor-pointer rounded border border-input bg-transparent p-1"
                    />
                    <span className="text-sm text-muted-foreground font-mono">
                      {field.state.value}
                    </span>
                    <div
                      className="h-6 w-6 rounded-full border border-black/10"
                      style={{ backgroundColor: field.state.value }}
                    />
                  </div>
                </div>
              )}
            />
          </form>
        </CardContent>
        <CardFooter className="justify-end gap-2">
          <Button variant="outline" type="button" onClick={() => router.back()}>
            Batal
          </Button>
          <form.Subscribe
            selector={(state) => [state.canSubmit]}
            children={([canSubmit]) => (
              <Button
                type="submit"
                form="label-form"
                disabled={!canSubmit || isPending}
              >
                {isPending ? "Menyimpan..." : "Buat Label"}
              </Button>
            )}
          />
        </CardFooter>
      </Card>
    </div>
  );
}
