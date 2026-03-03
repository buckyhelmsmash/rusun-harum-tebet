import type { TablesDB } from "node-appwrite";
import { createAdminClient } from "@/lib/appwrite/server";

let cachedDb: TablesDB | null = null;

export async function getAdminDb(): Promise<TablesDB> {
  if (!cachedDb) {
    const { tablesDb } = await createAdminClient();
    cachedDb = tablesDb;
  }
  return cachedDb;
}

export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  return String(error);
}

export interface PaginatedResult<T> {
  items: T[];
  total: number;
  limit: number;
  offset: number;
}

export const DEFAULT_LIMIT = 25;
export const MAX_LIMIT = 100;
