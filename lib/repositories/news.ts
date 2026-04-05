import { ID, Query } from "node-appwrite";
import { APPWRITE } from "../constants";
import { getAdminDb } from "./base";
import type { News, NewsLabel } from "@/types";

export const newsRepository = {
  async getNews() {
    const db = await getAdminDb();
    const result = await db.listRows({
      databaseId: APPWRITE.DATABASE_ID,
      tableId: APPWRITE.COLLECTIONS.NEWS,
      queries: [Query.orderDesc("$createdAt")],
    });
    return result.rows as unknown as News[];
  },

  async getPublishedLeadNews() {
    const db = await getAdminDb();
    const result = await db.listRows({
      databaseId: APPWRITE.DATABASE_ID,
      tableId: APPWRITE.COLLECTIONS.NEWS,
      queries: [
        Query.equal("isPublished", true),
        Query.equal("isLeadArticle", true),
        Query.orderDesc("publishedDate"),
      ],
    });
    return result.rows as unknown as News[];
  },

  async getPublishedSidebarNews(limit = 10) {
    const db = await getAdminDb();
    const result = await db.listRows({
      databaseId: APPWRITE.DATABASE_ID,
      tableId: APPWRITE.COLLECTIONS.NEWS,
      queries: [
        Query.equal("isPublished", true),
        Query.orderDesc("publishedDate"),
        Query.limit(limit),
      ],
    });
    return result.rows as unknown as News[];
  },

  async getPublishedNews(limit = 50) {
    const db = await getAdminDb();
    const result = await db.listRows({
      databaseId: APPWRITE.DATABASE_ID,
      tableId: APPWRITE.COLLECTIONS.NEWS,
      queries: [
        Query.equal("isPublished", true),
        Query.orderDesc("publishedDate"),
        Query.limit(limit),
      ],
    });
    return result.rows as unknown as News[];
  },

  async getNewsItem(id: string) {
    const db = await getAdminDb();
    const row = await db.getRow({
      databaseId: APPWRITE.DATABASE_ID,
      tableId: APPWRITE.COLLECTIONS.NEWS,
      rowId: id,
    });
    return row as unknown as News;
  },

  async getNewsBySlug(slug: string) {
    const db = await getAdminDb();
    const result = await db.listRows({
      databaseId: APPWRITE.DATABASE_ID,
      tableId: APPWRITE.COLLECTIONS.NEWS,
      queries: [
        Query.equal("slug", slug),
        Query.equal("isPublished", true),
        Query.limit(1),
      ],
    });
    const row = result.rows[0];
    if (!row) return null;
    return row as unknown as News;
  },

  async slugExists(slug: string) {
    const db = await getAdminDb();
    const result = await db.listRows({
      databaseId: APPWRITE.DATABASE_ID,
      tableId: APPWRITE.COLLECTIONS.NEWS,
      queries: [Query.equal("slug", slug), Query.limit(1)],
    });
    return result.rows.length > 0;
  },

  async createNews(data: Partial<News>) {
    const db = await getAdminDb();
    const row = await db.createRow({
      databaseId: APPWRITE.DATABASE_ID,
      tableId: APPWRITE.COLLECTIONS.NEWS,
      rowId: ID.unique(),
      data,
    });
    return row as unknown as News;
  },

  async updateNews(id: string, data: Partial<News>) {
    const db = await getAdminDb();
    const row = await db.updateRow({
      databaseId: APPWRITE.DATABASE_ID,
      tableId: APPWRITE.COLLECTIONS.NEWS,
      rowId: id,
      data,
    });
    return row as unknown as News;
  },

  async deleteNews(id: string) {
    const db = await getAdminDb();
    await db.deleteRow({
      databaseId: APPWRITE.DATABASE_ID,
      tableId: APPWRITE.COLLECTIONS.NEWS,
      rowId: id,
    });
    return true;
  },

  async getNewsLabels() {
    const db = await getAdminDb();
    const result = await db.listRows({
      databaseId: APPWRITE.DATABASE_ID,
      tableId: APPWRITE.COLLECTIONS.NEWS_LABELS,
      queries: [Query.orderAsc("name")],
    });
    return result.rows as unknown as NewsLabel[];
  },

  async getNewsLabelByName(name: string) {
    const db = await getAdminDb();
    const result = await db.listRows({
      databaseId: APPWRITE.DATABASE_ID,
      tableId: APPWRITE.COLLECTIONS.NEWS_LABELS,
      queries: [Query.equal("name", name), Query.limit(1)],
    });
    return (result.rows[0] as unknown as NewsLabel) ?? null;
  },

  async createNewsLabel(data: Pick<NewsLabel, "name" | "color">) {
    const db = await getAdminDb();
    const row = await db.createRow({
      databaseId: APPWRITE.DATABASE_ID,
      tableId: APPWRITE.COLLECTIONS.NEWS_LABELS,
      rowId: ID.unique(),
      data,
    });
    return row as unknown as NewsLabel;
  },
};
