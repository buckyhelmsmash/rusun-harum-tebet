import { storage } from "@/lib/appwrite/client";

/**
 * Builds a public Appwrite file preview URL from a file ID.
 * Uses the official Appwrite Web SDK as per best practices.
 */
export function getNewsCoverUrl(fileId: string): string {
  const bucketId = process.env.NEXT_PUBLIC_APPWRITE_STORAGE_NEWS_COVERS;

  if (!bucketId) {
    throw new Error("NEXT_PUBLIC_APPWRITE_STORAGE_NEWS_COVERS is not defined");
  }
  return storage.getFileView(bucketId, fileId).toString();
}
