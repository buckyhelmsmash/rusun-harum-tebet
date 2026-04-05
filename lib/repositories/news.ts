import { ID, Query } from "node-appwrite";
import { APPWRITE } from "../constants";
import { getAdminDb } from "./base";
import type { News, NewsLabel } from "@/types";

// Next.js Server Components require plain objects, and the Node SDK objects sometimes
// have prototypes that Next.js serialization rejects.
function toPlain<T>(obj: T): T {
  if (!obj) return obj;
  return JSON.parse(JSON.stringify(obj)) as T;
}

async function populateLabels(newsItems: News[]): Promise<News[]> {
  if (!newsItems.length) return newsItems;
  
  const db = await getAdminDb();
  // Fetch all labels once
  const result = await db.listRows({
    databaseId: APPWRITE.DATABASE_ID,
    tableId: APPWRITE.COLLECTIONS.NEWS_LABELS,
    queries: [Query.limit(100)],
  });
  const labelsMap = new Map<string, NewsLabel>();
  for (const row of result.rows as unknown as NewsLabel[]) {
    labelsMap.set(row.$id, row);
  }

  const populated = newsItems.map((item) => {
    if (item.labelId && item.labelId !== "none" && labelsMap.has(item.labelId)) {
      item.label = labelsMap.get(item.labelId);
    }
    return item;
  });

  return toPlain(populated);
}

export const newsRepository = {
  async getNews() {
    const db = await getAdminDb();
    const result = await db.listRows({
      databaseId: APPWRITE.DATABASE_ID,
      tableId: APPWRITE.COLLECTIONS.NEWS,
      queries: [Query.orderDesc("$createdAt")],
    });
    return populateLabels(result.rows as unknown as News[]);
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
    return populateLabels(result.rows as unknown as News[]);
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
    return populateLabels(result.rows as unknown as News[]);
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
    return populateLabels(result.rows as unknown as News[]);
  },

  async getNewsItem(id: string) {
    const db = await getAdminDb();
    const row = await db.getRow({
      databaseId: APPWRITE.DATABASE_ID,
      tableId: APPWRITE.COLLECTIONS.NEWS,
      rowId: id,
    });
    const populated = await populateLabels([row as unknown as News]);
    return populated[0];
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
    const populated = await populateLabels([row as unknown as News]);
    return populated[0];
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
    
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { label, ...dataToSave } = data;
    
    const row = await db.createRow({
      databaseId: APPWRITE.DATABASE_ID,
      tableId: APPWRITE.COLLECTIONS.NEWS,
      rowId: ID.unique(),
      data: dataToSave,
    });
    const populated = await populateLabels([row as unknown as News]);
    return populated[0];
  },

  async updateNews(id: string, data: Partial<News>) {
    const db = await getAdminDb();
    
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { label, ...dataToSave } = data;
    
    const row = await db.updateRow({
      databaseId: APPWRITE.DATABASE_ID,
      tableId: APPWRITE.COLLECTIONS.NEWS,
      rowId: id,
      data: dataToSave,
    });
    const populated = await populateLabels([row as unknown as News]);
    return populated[0];
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
    return toPlain(result.rows as unknown as NewsLabel[]);
  },

  async getNewsLabelByName(name: string) {
    const db = await getAdminDb();
    const result = await db.listRows({
      databaseId: APPWRITE.DATABASE_ID,
      tableId: APPWRITE.COLLECTIONS.NEWS_LABELS,
      queries: [Query.equal("name", name), Query.limit(1)],
    });
    return toPlain((result.rows[0] as unknown as NewsLabel) ?? null);
  },

  async createNewsLabel(data: Pick<NewsLabel, "name" | "color">) {
    const db = await getAdminDb();
    const row = await db.createRow({
      databaseId: APPWRITE.DATABASE_ID,
      tableId: APPWRITE.COLLECTIONS.NEWS_LABELS,
      rowId: ID.unique(),
      data,
    });
    return toPlain(row as unknown as NewsLabel);
  },
};
