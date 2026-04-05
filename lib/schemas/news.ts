import { z } from "zod";

export const createNewsSchema = z.object({
  title: z.string().min(1, "Judul wajib diisi"),
  summary: z.string().min(1, "Ringkasan wajib diisi"),
  content: z.string().min(1, "Konten wajib diisi"),
  slug: z.string().optional().or(z.literal("")),
  coverImageId: z.string().optional().or(z.literal("")),
  publishedDate: z.string().optional().or(z.literal("")),
  isLeadArticle: z.boolean().default(false),
  labelId: z.string().optional().or(z.literal("")),
  isPublished: z.boolean().default(false),
});

export const updateNewsSchema = createNewsSchema.partial();

