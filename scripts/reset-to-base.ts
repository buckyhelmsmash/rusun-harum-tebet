import { Client, Databases, ID, Query } from "node-appwrite";

require("dotenv").config({ path: ".env" });

const APPWRITE_ENDPOINT = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!;
const APPWRITE_PROJECT = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!;
const APPWRITE_KEY = process.env.APPWRITE_API_KEY!;
const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!;

if (!APPWRITE_ENDPOINT || !APPWRITE_PROJECT || !APPWRITE_KEY || !DATABASE_ID) {
  console.error("Missing Appwrite environment variables in .env");
  process.exit(1);
}

const client = new Client()
  .setEndpoint(APPWRITE_ENDPOINT)
  .setProject(APPWRITE_PROJECT)
  .setKey(APPWRITE_KEY);

const databases = new Databases(client);

// All Collection IDs
const COLLECTIONS = {
  units: process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_UNITS || "units",
  owners: process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_OWNERS || "owners",
  tenants: process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_TENANTS || "tenants",
  vehicles: process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_VEHICLES || "vehicles",
  water_usage:
    process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_WATER_USAGE || "water_usage",
  invoices: process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_INVOICES || "invoices",
  activity_logs:
    process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_ACTIVITY_LOGS ||
    "activity_logs",
  settings: process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_SETTINGS || "settings",
  news: process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_NEWS || "news",
};

const BLOCKS = ["A", "B", "C", "D"];
const FLOORS = 8;
const UNITS_PER_FLOOR = 12;

async function flushCollection(collectionId: string) {
  console.log(`Flushing collection: ${collectionId}...`);
  let hasMore = true;
  let deletedCount = 0;

  while (hasMore) {
    const response = await databases.listDocuments(DATABASE_ID, collectionId, [
      Query.limit(100),
    ]);

    if (response.documents.length === 0) {
      hasMore = false;
      break;
    }

    const deletePromises = response.documents.map((doc) =>
      databases
        .deleteDocument(DATABASE_ID, collectionId, doc.$id)
        .catch((err) => {
          // Ignore relation errors if we are deleting everything anyway
          console.log(
            `Failed to delete ${doc.$id} (might be tied to a relation, skipping for next pass)`,
          );
        }),
    );

    await Promise.allSettled(deletePromises);
    deletedCount += response.documents.length;
  }
  console.log(`  -> Deleted ${deletedCount} documents from ${collectionId}.`);
}

async function resetToBase() {
  console.log("=== STARTING RESET TO BASE ===");

  // 1. FLUSH EVERYTHING
  // Delete in reverse dependency order to minimize relation constraint errors
  await flushCollection(COLLECTIONS.invoices);
  await flushCollection(COLLECTIONS.vehicles);
  const remainingCollections = [
    COLLECTIONS.units,
    COLLECTIONS.owners,
    COLLECTIONS.tenants,
    COLLECTIONS.activity_logs,
    // Keeping settings and news intact
  ];

  for (const c of remainingCollections) {
    await flushCollection(c);
  }

  // Double pass for units, owners, tenants due to mutual relations locking them
  await flushCollection(COLLECTIONS.units);
  await flushCollection(COLLECTIONS.owners);

  console.log("\n=== SEEDING BASE DATA ===");

  // 2. SEED 10 OWNERS
  console.log("Seeding 10 Owners...");
  const ownerDocs = [];
  for (let i = 1; i <= 10; i++) {
    const owner = await databases.createDocument(
      DATABASE_ID,
      COLLECTIONS.owners,
      ID.unique(),
      {
        fullName: `Owner Base ${i}`,
        phoneNumber: `08120000${i.toString().padStart(4, "0")}`,
        ktpNumber: `3170000000000${i.toString().padStart(3, "0")}`,
      },
    );
    ownerDocs.push(owner);
  }

  // 3. SEED 10 TENANTS
  console.log("Seeding 10 Tenants...");
  const tenantDocs = [];
  for (let i = 1; i <= 10; i++) {
    const tenant = await databases.createDocument(
      DATABASE_ID,
      COLLECTIONS.tenants,
      ID.unique(),
      {
        fullName: `Tenant Base ${i}`,
        phoneNumber: `08130000${i.toString().padStart(4, "0")}`,
        ktpNumber: `3171111000000${i.toString().padStart(3, "0")}`,
      },
    );
    tenantDocs.push(tenant);
  }

  // 4. SEED 384 UNITS
  console.log("Seeding 384 Units...");
  const unitDocs = [];
  let ownerIdx = 0;
  let tenantIdx = 0;

  const totalUnits = BLOCKS.length * FLOORS * UNITS_PER_FLOOR;
  let createdCount = 0;

  for (const block of BLOCKS) {
    for (let floor = 1; floor <= FLOORS; floor++) {
      for (let unitNum = 1; unitNum <= UNITS_PER_FLOOR; unitNum++) {
        const displayId = `${block}-${floor}${String(unitNum).padStart(2, "0")}`;
        const unitType = floor <= 2 ? "basement" : "regular";

        // We only have 10 owners and 10 tenants to assign
        let owner = null;
        let tenant = null;
        let occupancyStatus = "vacant";
        let isOccupied = false;
        let billRecipient = "owner";

        // Assign the first 10 units to Owners, and the next 10 units to Tenants
        if (createdCount < 10) {
          owner = ownerDocs[ownerIdx++];
          occupancyStatus = "owner_occupied";
          isOccupied = true;
          billRecipient = "owner";
        } else if (createdCount >= 10 && createdCount < 20) {
          tenant = tenantDocs[tenantIdx++];
          occupancyStatus = "rented";
          isOccupied = true;
          billRecipient = "tenant";

          // Optionally, a rented unit usually still has an owner, but let's leave it null to keep it simple,
          // or we can assign an owner too. We'll leave it pure to just the tenant for tracking.
        }

        const unitData: any = {
          block,
          floor,
          unitNumber: unitNum,
          displayId,
          unitType,
          isOccupied,
          occupancyStatus,
          billRecipient,
        };

        if (owner) {
          unitData.ownerId = owner.$id;
          unitData.owner = owner.$id; // the relationship
        }
        if (tenant) {
          unitData.tenantId = tenant.$id;
          unitData.tenant = tenant.$id; // the relationship
        }

        const unit = await databases.createDocument(
          DATABASE_ID,
          COLLECTIONS.units,
          ID.unique(),
          unitData,
        );
        unitDocs.push(unit);
        createdCount++;
      }
    }
  }

  console.log(`Successfully created ${unitDocs.length} units.`);
  console.log("=== RESET COMPLETE ===");
}

resetToBase().catch(console.error);
