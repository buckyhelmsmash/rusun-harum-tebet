import { Client, Databases, Query } from "node-appwrite";

const APPWRITE_ENDPOINT = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!;
const APPWRITE_PROJECT = process.env.NEXT_PUBLIC_APPWRITE_PROJECT!;
const APPWRITE_KEY = process.env.APPWRITE_KEY!;
const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!;
const INVOICES_COLLECTION =
  process.env.NEXT_PUBLIC_APPWRITE_COLLECTIONS_INVOICES!;

if (
  !APPWRITE_ENDPOINT ||
  !APPWRITE_PROJECT ||
  !APPWRITE_KEY ||
  !DATABASE_ID ||
  !INVOICES_COLLECTION
) {
  console.error("Missing Appwrite environment variables.");
  process.exit(1);
}

const client = new Client()
  .setEndpoint(APPWRITE_ENDPOINT)
  .setProject(APPWRITE_PROJECT)
  .setKey(APPWRITE_KEY);

const databases = new Databases(client);

async function inspectInvoices() {
  try {
    const response = await databases.listDocuments(
      DATABASE_ID,
      INVOICES_COLLECTION,
      [Query.equal("period", "2026-02")],
    );

    console.log(`Found ${response.total} invoices for 2026-02:`);
    response.documents.forEach((doc: any) => {
      console.log(
        `Unit: ${doc.unit}, Status: ${doc.status}, Total: ${doc.totalDue}`,
      );
    });
  } catch (error) {
    console.error("Error fetching invoices:", error);
  }
}

inspectInvoices();
