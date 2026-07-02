import type { Storage, TablesDB, Users } from "node-appwrite";
import { createAdminClient } from "@/lib/appwrite/server";

let cachedDb: TablesDB | null = null;

export async function getDb(): Promise<TablesDB> {
  if (!cachedDb) {
    const { tablesDb } = await createAdminClient();
    cachedDb = tablesDb;
  }
  return cachedDb;
}

let cachedUsers: Users | null = null;

export async function getUsers(): Promise<Users> {
  if (!cachedUsers) {
    const { users } = await createAdminClient();
    cachedUsers = users;
  }
  return cachedUsers;
}

let cachedStorage: Storage | null = null;

export async function getStorage(): Promise<Storage> {
  if (!cachedStorage) {
    const { storage } = await createAdminClient();
    cachedStorage = storage;
  }
  return cachedStorage;
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

/**
 * Next.js Server Components require plain objects, and the Node SDK objects
 * sometimes have prototypes that Next.js serialization rejects.
 */
export function toPlain<T>(obj: T): T {
  if (!obj) return obj;
  return JSON.parse(JSON.stringify(obj)) as T;
}
