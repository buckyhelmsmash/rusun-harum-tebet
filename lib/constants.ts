export const APPWRITE = {
  ENDPOINT: process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT as string,
  PROJECT_ID: process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID as string,
  API_KEY: process.env.APPWRITE_API_KEY as string,
  DATABASE_ID: process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID as string,
  COLLECTIONS: {
    UNITS: process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_UNITS as string,
    OWNERS: process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_OWNERS as string,
    TENANTS: process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_TENANTS as string,
    VEHICLES: process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_VEHICLES as string,
    INVOICES: process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_INVOICES as string,
    NEWS: process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_NEWS as string,
    ACTIVITY_LOGS: process.env
      .NEXT_PUBLIC_APPWRITE_COLLECTION_ACTIVITY_LOGS as string,
    WATER_USAGES: process.env
      .NEXT_PUBLIC_APPWRITE_COLLECTION_WATER_USAGES as string,
  },
  AUTH: {
    ADMIN_EMAILS: (process.env.NEXT_PUBLIC_ADMIN_EMAILS || "")
      .split(",")
      .map((email) => email.trim().toLowerCase())
      .filter(Boolean),
  },
  STORAGE: {
    NEWS_COVERS: process.env.NEXT_PUBLIC_APPWRITE_STORAGE_NEWS_COVERS as string,
  },
} as const;
