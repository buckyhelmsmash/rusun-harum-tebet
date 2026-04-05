"use client";

import { useForm } from "@tanstack/react-form";
import { zodValidator } from "@tanstack/zod-form-adapter";
import { z } from "zod";
import Link from "next/link";
import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RichTextEditor } from "@/components/ui/rich-text-editor";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import type { News } from "@/types";
import { useGetNewsLabels } from "@/hooks/api/use-news";
import { generateSlug } from "@/lib/utils/slug";

const FormSchema = z.object({
  title: z.string().min(1, "Judul wajib diisi"),
  slug: z.string().optional().or(z.literal("")),
  summary: z.string().min(1, "Ringkasan wajib diisi"),
  content: z.string().min(1, "Konten wajib diisi"),
  coverImageId: z
    .string()
    .url("Harus berupa URL yang valid")
    .optional()
    .or(z.literal("")),
  publishedDate: z.string().optional().or(z.literal("")),
  isLeadArticle: z.boolean().default(false),
  labelId: z.string().optional().or(z.literal("")),
  isPublished: z.boolean().default(false),
});

type FormValues = z.infer<typeof FormSchema>;

interface NewsFormProps {
  initialData?: News;
  onSubmit: (data: FormValues) => Promise<void>;
  isSubmitting?: boolean;
}

export function NewsForm({ initialData, onSubmit, isSubmitting }: NewsFormProps) {
  const { data: labels } = useGetNewsLabels();
  const slugManuallyEdited = useRef(!!initialData?.slug);

  const toDateInputValue = (iso?: string) => (iso ? iso.split("T")[0] : "");

  const form = useForm({
    defaultValues: {
      title: initialData?.title ?? "",
      slug: initialData?.slug ?? "",
      summary: initialData?.summary ?? "",
      content: initialData?.content ?? "",
      coverImageId: initialData?.coverImageId ?? "",
      publishedDate: toDateInputValue(initialData?.publishedDate),
      isLeadArticle: initialData?.isLeadArticle ?? false,
      isPublished: initialData?.isPublished ?? false,
      labelId: initialData?.labelId ?? "",
    },
    validators: {
      onSubmit: FormSchema as any,
    },
    onSubmit: async ({ value }) => {
      await onSubmit(value as FormValues);
    },
  });

  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>
          {initialData ? "Edit Artikel Berita" : "Buat Artikel Berita"}
        </CardTitle>
        <CardDescription>Isi detail artikel berita di bawah ini.</CardDescription>
      </CardHeader>
      <CardContent>
        <form
          id="news-form"
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            form.handleSubmit();
          }}
          className="space-y-6"
        >
          <div className="grid gap-4 sm:grid-cols-2">
            {/* Title */}
            <div className="space-y-2 sm:col-span-2">
              <form.Field
                name="title"
                validators={{ onChange: FormSchema.shape.title }}
                children={(field) => (
                  <>
                    <Label htmlFor={field.name}>Judul</Label>
                    <Input
                      id={field.name}
                      name={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => {
                        const newTitle = e.target.value;
                        field.handleChange(newTitle);
                        if (!slugManuallyEdited.current) {
                          const date = form.getFieldValue("publishedDate");
                          form.setFieldValue(
                            "slug",
                            generateSlug(newTitle, date || undefined),
                          );
                        }
                      }}
                      placeholder="Masukkan judul berita..."
                    />
                    {field.state.meta.errors.length > 0 && (
                      <p className="text-sm text-destructive">
                        {field.state.meta.errors.map(err => typeof err === "string" ? err : err?.message || JSON.stringify(err)).join(", ")}
                      </p>
                    )}
                  </>
                )}
              />
            </div>

            {/* Slug */}
            <div className="space-y-2 sm:col-span-2">
              <form.Field
                name="slug"
                children={(field) => (
                  <>
                    <Label htmlFor={field.name}>Slug URL</Label>
                    <Input
                      id={field.name}
                      name={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => {
                        slugManuallyEdited.current = true;
                        field.handleChange(e.target.value);
                      }}
                      placeholder="kata-pertama-kedua-ketiga-20260405"
                    />
                    {field.state.value && (
                      <p className="text-xs text-muted-foreground">
                        URL publik:{" "}
                        <span className="font-mono">/news/{field.state.value}</span>
                      </p>
                    )}
                  </>
                )}
              />
            </div>

            {/* Summary */}
            <div className="space-y-2 sm:col-span-2">
              <form.Field
                name="summary"
                validators={{ onChange: FormSchema.shape.summary }}
                children={(field) => (
                  <>
                    <Label htmlFor={field.name}>Ringkasan</Label>
                    <Input
                      id={field.name}
                      name={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      placeholder="Masukkan ringkasan singkat..."
                    />
                    {field.state.meta.errors.length > 0 && (
                      <p className="text-sm text-destructive">
                        {field.state.meta.errors.map(err => typeof err === "string" ? err : err?.message || JSON.stringify(err)).join(", ")}
                      </p>
                    )}
                  </>
                )}
              />
            </div>

            {/* Label */}
            <div className="space-y-2">
              <form.Field
                name="labelId"
                validators={{ onChange: FormSchema.shape.labelId as any }}
                children={(field) => (
                  <>
                    <Label htmlFor={field.name}>Label</Label>
                    <Select
                      value={field.state.value}
                      onValueChange={field.handleChange}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih label" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Tanpa Label</SelectItem>
                        {labels?.map((label) => (
                          <SelectItem key={label.$id} value={label.$id}>
                            <div className="flex items-center gap-2">
                              <div
                                className="w-3 h-3 rounded-full"
                                style={{ backgroundColor: label.color }}
                              />
                              {label.name}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">
                      Belum ada label yang sesuai?{" "}
                      <Link
                        href="/admin/news/labels/create"
                        className="underline text-primary hover:text-primary/80"
                      >
                        Tambah label baru
                      </Link>
                    </p>
                  </>
                )}
              />
            </div>

            {/* Cover Image URL */}
            <div className="space-y-2">
              <form.Field
                name="coverImageId"
                validators={{ onChange: FormSchema.shape.coverImageId as any }}
                children={(field) => (
                  <>
                    <Label htmlFor={field.name}>URL Gambar Sampul</Label>
                    <Input
                      id={field.name}
                      name={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      placeholder="https://..."
                    />
                    {field.state.meta.errors.length > 0 && (
                      <p className="text-sm text-destructive">
                        {field.state.meta.errors.map(err => typeof err === "string" ? err : err?.message || JSON.stringify(err)).join(", ")}
                      </p>
                    )}
                  </>
                )}
              />
            </div>

            {/* Publish Date */}
            <div className="space-y-2">
              <form.Field
                name="publishedDate"
                children={(field) => (
                  <>
                    <Label htmlFor={field.name}>Tanggal Terbit</Label>
                    <Input
                      id={field.name}
                      name={field.name}
                      type="date"
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                    />
                  </>
                )}
              />
            </div>

            {/* Lead Article Toggle */}
            <div className="space-y-2 sm:col-span-2">
              <form.Field
                name="isLeadArticle"
                validators={{ onChange: FormSchema.shape.isLeadArticle as any }}
                children={(field) => (
                  <div className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <Label htmlFor={field.name} className="text-base">
                        Berita Utama
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Tampilkan artikel ini di carousel utama halaman depan.
                      </p>
                    </div>
                    <Switch
                      id={field.name}
                      checked={field.state.value}
                      onCheckedChange={field.handleChange}
                    />
                  </div>
                )}
              />
            </div>

            {/* Published Toggle */}
            <div className="space-y-2 sm:col-span-2">
              <form.Field
                name="isPublished"
                validators={{ onChange: FormSchema.shape.isPublished as any }}
                children={(field) => (
                  <div className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <Label htmlFor={field.name} className="text-base">
                        Status Publikasi
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Aktifkan untuk mempublikasikan artikel kepada seluruh warga.
                      </p>
                    </div>
                    <Switch
                      id={field.name}
                      checked={field.state.value}
                      onCheckedChange={(checked) => {
                        field.handleChange(checked);
                        if (checked) {
                          const currentDate = form.getFieldValue("publishedDate");
                          if (!currentDate) {
                            form.setFieldValue(
                              "publishedDate",
                              new Date().toISOString().split("T")[0],
                            );
                          }
                        }
                      }}
                    />
                  </div>
                )}
              />
            </div>

            {/* Rich Content */}
            <div className="space-y-2 sm:col-span-2">
              <form.Field
                name="content"
                validators={{ onChange: FormSchema.shape.content }}
                children={(field) => (
                  <>
                    <Label>Konten Artikel</Label>
                    <RichTextEditor
                      value={field.state.value}
                      onChange={field.handleChange}
                    />
                    {field.state.meta.errors.length > 0 && (
                      <p className="text-sm text-destructive">
                        {field.state.meta.errors.map(err => typeof err === "string" ? err : err?.message || JSON.stringify(err)).join(", ")}
                      </p>
                    )}
                  </>
                )}
              />
            </div>
          </div>
        </form>
      </CardContent>
      <CardFooter className="justify-end gap-2">
        <form.Subscribe
          selector={(state) => [state.canSubmit, state.isSubmitting]}
          children={([canSubmit]) => (
            <Button
              type="submit"
              form="news-form"
              disabled={!canSubmit || isSubmitting}
            >
              {isSubmitting
                ? "Menyimpan..."
                : initialData
                  ? "Perbarui Artikel"
                  : "Buat Artikel"}
            </Button>
          )}
        />
      </CardFooter>
    </Card>
  );
}
