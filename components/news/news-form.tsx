"use client";

import { useForm } from "@tanstack/react-form";

import { ImagePlus, Loader2, Trash2 } from "lucide-react";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { z } from "zod";
import {
  Attachment,
  AttachmentAction,
  AttachmentActions,
  AttachmentContent,
  AttachmentDescription,
  AttachmentMedia,
  AttachmentTitle,
} from "@/components/ui/attachment";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RichTextEditor } from "@/components/ui/rich-text-editor";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  useDeleteNewsCover,
  useGetNewsLabels,
  useUploadNewsCover,
} from "@/hooks/api/use-news";
import { getNewsCoverUrl } from "@/lib/utils/news-cover";
import { generateSlug } from "@/lib/utils/slug";
import type { News } from "@/types";
import { NewsEditor } from "../news-editor/news-editor";
import { SimpleEditor } from "../tiptap-templates/simple/simple-editor";

const FormSchema = z.object({
  title: z.string().min(1, "Judul wajib diisi"),
  slug: z.string().optional().or(z.literal("")),
  summary: z.string().min(1, "Ringkasan wajib diisi"),
  content: z.string().min(1, "Konten wajib diisi"),
  coverImageId: z.string().optional().or(z.literal("")),
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

export function NewsForm({
  initialData,
  onSubmit,
  isSubmitting,
}: NewsFormProps) {
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
        <CardDescription>
          Isi detail artikel berita di bawah ini.
        </CardDescription>
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
              >
                {(field) => (
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
                        {field.state.meta.errors
                          .map((err) =>
                            typeof err === "string"
                              ? err
                              : err?.message || JSON.stringify(err),
                          )
                          .join(", ")}
                      </p>
                    )}
                  </>
                )}
              </form.Field>
            </div>

            {/* Slug */}
            <div className="space-y-2 sm:col-span-2">
              <form.Field name="slug">
                {(field) => (
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
                        <span className="font-mono">
                          /news/{field.state.value}
                        </span>
                      </p>
                    )}
                  </>
                )}
              </form.Field>
            </div>

            {/* Summary */}
            <div className="space-y-2 sm:col-span-2">
              <form.Field
                name="summary"
                validators={{ onChange: FormSchema.shape.summary }}
              >
                {(field) => (
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
                        {field.state.meta.errors
                          .map((err) =>
                            typeof err === "string"
                              ? err
                              : err?.message || JSON.stringify(err),
                          )
                          .join(", ")}
                      </p>
                    )}
                  </>
                )}
              </form.Field>
            </div>

            {/* Label */}
            <div className="space-y-2">
              <form.Field
                name="labelId"
                validators={{ onChange: FormSchema.shape.labelId as any }}
              >
                {(field) => (
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
              </form.Field>
            </div>

            {/* Cover Image Upload */}
            <div className="space-y-2">
              <form.Field name="coverImageId">
                {(field) => (
                  <CoverImageUpload
                    value={field.state.value ?? ""}
                    onChange={field.handleChange}
                  />
                )}
              </form.Field>
            </div>

            {/* Publish Date */}
            <div className="space-y-2">
              <form.Field name="publishedDate">
                {(field) => (
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
              </form.Field>
            </div>

            {/* Lead Article Toggle */}
            <div className="space-y-2 sm:col-span-2">
              <form.Field
                name="isLeadArticle"
                validators={{ onChange: FormSchema.shape.isLeadArticle as any }}
              >
                {(field) => (
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
              </form.Field>
            </div>

            {/* Published Toggle */}
            <div className="space-y-2 sm:col-span-2">
              <form.Field
                name="isPublished"
                validators={{ onChange: FormSchema.shape.isPublished as any }}
              >
                {(field) => (
                  <div className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <Label htmlFor={field.name} className="text-base">
                        Status Publikasi
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Aktifkan untuk mempublikasikan artikel kepada seluruh
                        warga.
                      </p>
                    </div>
                    <Switch
                      id={field.name}
                      checked={field.state.value}
                      onCheckedChange={(checked) => {
                        field.handleChange(checked);
                        if (checked) {
                          const currentDate =
                            form.getFieldValue("publishedDate");
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
              </form.Field>
            </div>

            {/* Rich Content */}
            <div className="space-y-2 sm:col-span-2">
              <form.Field
                name="content"
                validators={{ onChange: FormSchema.shape.content }}
              >
                {(field) => (
                  <>
                    <Label>Konten Artikel</Label>
                    {/* <RichTextEditor
                      value={field.state.value}
                      onChange={field.handleChange}
                    /> */}
                    <NewsEditor
                      value={field.state.value}
                      onChange={field.handleChange}
                    />
                    {field.state.meta.errors.length > 0 && (
                      <p className="text-sm text-destructive">
                        {field.state.meta.errors
                          .map((err) =>
                            typeof err === "string"
                              ? err
                              : err?.message || JSON.stringify(err),
                          )
                          .join(", ")}
                      </p>
                    )}
                  </>
                )}
              </form.Field>
            </div>
          </div>
        </form>
      </CardContent>
      <CardFooter className="justify-end gap-2">
        <form.Subscribe
          selector={(state) => [state.canSubmit, state.isSubmitting]}
        >
          {([canSubmit]) => (
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
        </form.Subscribe>
      </CardFooter>
    </Card>
  );
}

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_SIZE_MB = 5;

function CoverImageUpload({
  value,
  onChange,
}: {
  value: string;
  onChange: (fileId: string) => void;
}) {
  const uploadMutation = useUploadNewsCover();
  const deleteMutation = useDeleteNewsCover();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [localPreview, setLocalPreview] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (localPreview) {
        URL.revokeObjectURL(localPreview);
      }
    };
  }, [localPreview]);

  const validateFile = useCallback((file: File): string | null => {
    if (!ALLOWED_TYPES.includes(file.type)) {
      return `Tipe file tidak didukung. Gunakan: JPEG, PNG, atau WebP`;
    }
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      return `Ukuran file maksimal ${MAX_SIZE_MB} MB`;
    }
    return null;
  }, []);

  const handleUpload = useCallback(
    async (file: File) => {
      const validationError = validateFile(file);
      if (validationError) {
        setError(validationError);
        return;
      }
      setError(null);
      const objectUrl = URL.createObjectURL(file);
      setLocalPreview(objectUrl);
      try {
        const result = await uploadMutation.mutateAsync({ file });
        onChange(result.fileId);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Gagal mengunggah gambar",
        );
        setLocalPreview(null);
        URL.revokeObjectURL(objectUrl);
      }
    },
    [uploadMutation, onChange, validateFile],
  );

  const handleDelete = useCallback(async () => {
    if (!value) return;
    try {
      await deleteMutation.mutateAsync(value);
      onChange("");
      setLocalPreview(null);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal menghapus gambar");
    }
  }, [value, deleteMutation, onChange]);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) handleUpload(file);
    },
    [handleUpload],
  );

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) handleUpload(file);
      e.target.value = "";
    },
    [handleUpload],
  );

  const isUploading = uploadMutation.isPending;
  const isDeleting = deleteMutation.isPending;

  if (value) {
    return (
      <div className="space-y-2">
        <Label>Gambar Sampul</Label>
        <Attachment state={isDeleting ? "processing" : "done"}>
          <AttachmentMedia variant="image" className="w-20">
            {/** biome-ignore lint/performance/noImgElement: <img used for direct Appwrite URL> */}
            <img
              src={localPreview || getNewsCoverUrl(value)}
              alt="Sampul"
              className="aspect-square w-full object-cover"
            />
          </AttachmentMedia>
          <AttachmentContent>
            <AttachmentTitle>Gambar sampul</AttachmentTitle>
            <AttachmentDescription>
              {isDeleting ? "Menghapus..." : "Terunggah"}
            </AttachmentDescription>
          </AttachmentContent>
          <AttachmentActions>
            <AttachmentAction
              onClick={handleDelete}
              disabled={isDeleting}
              aria-label="Hapus gambar"
            >
              {isDeleting ? <Loader2 className="animate-spin" /> : <Trash2 />}
            </AttachmentAction>
          </AttachmentActions>
        </Attachment>
        {error && <p className="text-sm text-destructive">{error}</p>}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <Label>Gambar Sampul</Label>
      <Attachment
        state={isUploading ? "uploading" : "idle"}
        className="w-full cursor-pointer"
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <AttachmentMedia
          variant="icon"
          className={isDragging ? "text-primary" : ""}
        >
          {isUploading ? <Loader2 className="animate-spin" /> : <ImagePlus />}
        </AttachmentMedia>
        <AttachmentContent>
          <AttachmentTitle>
            {isUploading
              ? "Mengunggah..."
              : isDragging
                ? "Lepas file di sini"
                : "Klik atau seret gambar"}
          </AttachmentTitle>
          <AttachmentDescription>
            JPEG, PNG, WebP — maks {MAX_SIZE_MB} MB
          </AttachmentDescription>
        </AttachmentContent>
      </Attachment>
      <input
        ref={fileInputRef}
        type="file"
        accept={ALLOWED_TYPES.join(",")}
        onChange={handleFileSelect}
        className="hidden"
      />
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
