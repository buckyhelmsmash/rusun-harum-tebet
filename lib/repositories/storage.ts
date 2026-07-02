import { ID } from "node-appwrite";
import { InputFile } from "node-appwrite/file";
import { APPWRITE } from "@/lib/constants";
import { getStorage } from "@/lib/repositories/base";

const BUCKET_ID = APPWRITE.STORAGE.NEWS_COVERS;

export const storageRepository = {
  async uploadNewsCover(fileBuffer: Buffer, fileName: string) {
    const storage = await getStorage();
    const inputFile = InputFile.fromBuffer(fileBuffer, fileName);
    const result = await storage.createFile(BUCKET_ID, ID.unique(), inputFile);
    return result.$id;
  },

  async deleteNewsCover(fileId: string) {
    const storage = await getStorage();
    await storage.deleteFile(BUCKET_ID, fileId);
  },
};

/**
 * Builds a public Appwrite file preview URL from a file ID.
 * Uses NEXT_PUBLIC_ env vars so it works in both server and client contexts.
 */
export function getNewsCoverUrl(fileId: string, width = 1200): string {
  const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT;
  const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID;
  return `${endpoint}/storage/buckets/${BUCKET_ID}/files/${fileId}/preview?project=${projectId}&width=${width}`;
}
