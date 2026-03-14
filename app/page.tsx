import { Query } from "node-appwrite";
import { LandingClient } from "@/components/landing/landing-client";
import { createAdminClient } from "@/lib/appwrite/server";
import { APPWRITE } from "@/lib/constants";
import type { News } from "@/types";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  let initialNews: News[] = [];

  try {
    const { tablesDb } = await createAdminClient();

    const response = await tablesDb.listRows({
      databaseId: APPWRITE.DATABASE_ID,
      tableId: APPWRITE.COLLECTIONS.NEWS,
      queries: [
        Query.equal("isPublished", true),
        Query.orderDesc("publishedDate"),
        Query.limit(5),
      ],
    });

    initialNews = response.rows as unknown as News[];
  } catch (error) {
    console.error("Failed to fetch news:", error);
  }

  return <LandingClient news={initialNews} />;
}
