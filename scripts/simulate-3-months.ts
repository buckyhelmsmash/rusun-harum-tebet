import { faker } from "@faker-js/faker/locale/id_ID";
import { randomBytes } from "crypto";
import { Client, Databases, ID, Query, TablesDB } from "node-appwrite";

require("dotenv").config({ path: ".env" });
require("dotenv").config({ path: ".env.local" });

const APPWRITE_ENDPOINT = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!;
const APPWRITE_PROJECT = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!;
const APPWRITE_KEY = process.env.APPWRITE_API_KEY!;
const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!;

const COL_UNITS = process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_UNITS!;
const COL_OWNERS = process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_OWNERS!;
const COL_TENANTS = process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_TENANTS!;
const COL_VEHICLES = process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_VEHICLES!;
const COL_SETTINGS = process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_SETTINGS!;
const COL_WATER = process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_WATER_USAGES!;
const COL_INVOICES = process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_INVOICES!;
const COL_ACTIVITY = process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_ACTIVITY_LOGS!;

const ACTOR_ID = "69a6d2135fded0a2e5bc";
const ACTOR_NAME = "Bucky Al-Jawad";

if (!APPWRITE_ENDPOINT || !APPWRITE_PROJECT || !APPWRITE_KEY || !DATABASE_ID) {
  console.error("Missing Appwrite environment variables.");
  process.exit(1);
}

const client = new Client()
  .setEndpoint(APPWRITE_ENDPOINT)
  .setProject(APPWRITE_PROJECT)
  .setKey(APPWRITE_KEY);

const databases = new Databases(client);

// Helper to delete all documents in a collection
async function flushCollection(collectionId: string, name: string) {
  console.log(`Flushing ${name}...`);
  let hasMore = true;
  let deletedCount = 0;
  while (hasMore) {
    const response = await databases.listDocuments(DATABASE_ID, collectionId, [
      Query.limit(100),
    ]);
    for (const doc of response.documents) {
      await databases.deleteDocument(DATABASE_ID, collectionId, doc.$id);
      deletedCount++;
    }
    hasMore = response.documents.length === 100;
  }
  console.log(`  -> Deleted ${deletedCount} documents from ${name}.`);
}

async function logActivity(
  action: string,
  targetType: string,
  targetId: string,
  unitId: string | undefined,
  message: string,
  metadata: any,
) {
  await databases.createDocument(DATABASE_ID, COL_ACTIVITY, ID.unique(), {
    action,
    targetType,
    targetId,
    unitId: unitId || undefined,
    description: message,
    actorId: ACTOR_ID,
    actorName: ACTOR_NAME,
    metadata: JSON.stringify(metadata),
  });
}

function generateRandomPin() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

function generateRandomToken() {
  return randomBytes(16).toString("hex");
}

function generateUniqueCode() {
  return Math.floor(Math.random() * 900) + 100;
}

async function runSimulation() {
  console.log("=== STARTING 3-MONTH SIMULATION ===");

  // 1. FLUSH ALL
  await flushCollection(COL_ACTIVITY, "Activity Logs");
  await flushCollection(COL_INVOICES, "Invoices");
  await flushCollection(COL_WATER, "Water Usages");
  await flushCollection(COL_VEHICLES, "Vehicles");
  await flushCollection(COL_TENANTS, "Tenants");
  await flushCollection(COL_OWNERS, "Owners");
  await flushCollection(COL_UNITS, "Units");
  await flushCollection(COL_SETTINGS, "Settings");

  // 2. SEED SETTINGS
  console.log("\\nSeeding System Settings...");
  // Use the specific GLOBAL_DOC_ID used by SettingsRepository
  await databases.createDocument(DATABASE_ID, COL_SETTINGS, "global", {
    publicFacilityFee: 15000,
    guardFee: 35000,
    waterRate: 12500,
    car1Fee: 200000,
    car2Fee: 500000,
    car3Fee: 850000,
  });
  console.log("  -> Settings created.");

  // 3. GENERATE OWNERS AND TENANTS
  console.log("\\nGenerating Owners and Tenants...");
  const ownerDocs = [];
  for (let i = 0; i < 400; i++) {
    const doc = await databases.createDocument(
      DATABASE_ID,
      COL_OWNERS,
      ID.unique(),
      {
        fullName: faker.person.fullName(),
        phoneNumber: faker.phone.number({ style: "national" }),
        email: faker.internet.email(),
        ktpNumber: faker.string.numeric(16),
        dateOfBirth: faker.date.birthdate().toISOString(),
      },
    );
    ownerDocs.push(doc);
  }
  console.log(`  -> Created ${ownerDocs.length} Owners.`);

  const tenantDocs = [];
  for (let i = 0; i < 400; i++) {
    const doc = await databases.createDocument(
      DATABASE_ID,
      COL_TENANTS,
      ID.unique(),
      {
        fullName: faker.person.fullName(),
        phoneNumber: faker.phone.number({ style: "national" }),
        email: faker.internet.email(),
        ktpNumber: faker.string.numeric(16),
        dateOfBirth: faker.date.birthdate().toISOString(),
      },
    );
    tenantDocs.push(doc);
  }
  console.log(`  -> Created ${tenantDocs.length} Tenants.`);

  // 4. GENERATE UNITS & ASSIGN PEOPLE & VEHICLES
  console.log("\\nGenerating Units and Assinging People/Vehicles...");
  const blocks = ["A", "B", "C", "D"];
  const regularFloors = [1, 2, 3, 4];

  const unitDocs = [];
  let ownerIdx = 0;
  let tenantIdx = 0;

  for (const block of blocks) {
    // Regular
    for (const floor of regularFloors) {
      for (let unitNum = 1; unitNum <= 20; unitNum++) {
        unitDocs.push({
          block,
          floor,
          unitNumber: unitNum,
          displayId: `${block}${floor}${unitNum.toString().padStart(2, "0")}`,
          unitType: "regular",
        });
      }
    }
    // Basement
    for (let unitNum = 1; unitNum <= 16; unitNum++) {
      unitDocs.push({
        block,
        floor: 0,
        unitNumber: unitNum,
        displayId: `${block}-B${unitNum.toString().padStart(2, "0")}`,
        unitType: "basement",
      });
    }
  }

  const createdUnits = [];
  for (const u of unitDocs) {
    const isOccupied = true;
    const isTenanted = Math.random() < 0.4;
    const owner = ownerDocs[ownerIdx % ownerDocs.length];
    ownerIdx++;

    let tenant = null;
    let occupancyStatus = "owner_occupied";
    let billRecipient = "owner";

    if (isTenanted) {
      tenant = tenantDocs[tenantIdx % tenantDocs.length];
      tenantIdx++;
      occupancyStatus = "rented";
      billRecipient = Math.random() < 0.5 ? "tenant" : "owner";
    }

    const unitDoc = await databases.createDocument(
      DATABASE_ID,
      COL_UNITS,
      ID.unique(),
      {
        block: u.block,
        floor: u.floor,
        unitNumber: u.unitNumber,
        displayId: u.displayId,
        unitType: u.unitType,
        isOccupied,
        occupancyStatus,
        billRecipient,
        owner: owner.$id,
        tenant: tenant ? tenant.$id : null,
      },
    );
    createdUnits.push(unitDoc);

    // Initial Move-in log
    await logActivity(
      "unit.update",
      "unit",
      unitDoc.$id,
      unitDoc.$id,
      `Serah terima unit ${u.displayId} ke penghuni baru.`,
      {
        displayId: u.displayId,
        ownerId: owner.$id,
        tenantId: tenant ? tenant.$id : null,
      },
    );

    // Vehicles (30% chance 1 car, 50% chance 1 moto)
    if (Math.random() < 0.3) {
      await databases.createDocument(DATABASE_ID, COL_VEHICLES, ID.unique(), {
        unit: unitDoc.$id,
        licensePlate: `${faker.string.alpha(1).toUpperCase()} ${faker.string.numeric(4)} ${faker.string.alpha(2).toUpperCase()}`,
        vehicleType: "car",
        brand: "Toyota Avanza",
        color: "Hitam",
      });
    }
    if (Math.random() < 0.5) {
      await databases.createDocument(DATABASE_ID, COL_VEHICLES, ID.unique(), {
        unit: unitDoc.$id,
        licensePlate: `${faker.string.alpha(1).toUpperCase()} ${faker.string.numeric(4)} ${faker.string.alpha(2).toUpperCase()}`,
        vehicleType: "motorcycle",
        brand: "Honda Vario",
        color: "Merah",
      });
    }
  }
  console.log(
    `  -> Created ${createdUnits.length} Units with assignments and activities.`,
  );

  // 5. CHRONOLOGICAL SIMULATION
  console.log("\nRunning 3-Month Chronological Simulation...");
  const PERIODS = ["2025-12", "2026-01", "2026-02"];

  // track cumulative arrears per unit
  const arrearsTracker: Record<string, number> = {};

  for (const period of PERIODS) {
    console.log(`\n--- Simulating Period: ${period} ---`);
    let invoicesGenerated = 0;

    // For Due Date
    const [pYear, pMonth] = period.split("-").map(Number);
    let dueYear = pYear;
    let dueMonth = pMonth + 1;
    if (dueMonth > 12) {
      dueMonth = 1;
      dueYear++;
    }
    const dueDate = new Date(
      `${dueYear}-${String(dueMonth).padStart(2, "0")}-15T00:00:00.000Z`,
    );

    for (const unit of createdUnits) {
      // 1. Water Usage
      const previousMeter = faker.number.int({ min: 100, max: 500 }); // simulated prev
      const currentMeter =
        previousMeter + faker.number.int({ min: 5, max: 25 }); // 5-25 m3
      const usageAmount = currentMeter - previousMeter;
      const waterCost = usageAmount * 10000;

      const waterDoc = await databases.createDocument(
        DATABASE_ID,
        COL_WATER,
        ID.unique(),
        {
          unit: unit.$id,
          period: period,
          previousMeter,
          currentMeter,
          usage: usageAmount,
          amount: waterCost,
        },
      );

      await logActivity(
        "water_usage.import",
        "water_usage",
        waterDoc.$id,
        unit.$id,
        `Meteran air unit ${unit.displayId} dicatat pada ${currentMeter} m3.`,
        {
          period,
          usageAmount,
        },
      );

      // 2. Fetch Vehicles
      const vehiclesData = await databases.listDocuments(
        DATABASE_ID,
        COL_VEHICLES,
        [Query.equal("unit", unit.$id)],
      );
      let vehicleFee = 0;
      vehiclesData.documents.forEach((v) => {
        if (v.vehicleType === "car") vehicleFee += 100000;
        if (v.vehicleType === "motorcycle") vehicleFee += 50000;
      });

      // 3. Invoice Math
      const pastArrears = arrearsTracker[unit.$id] || 0;
      // Sarana umum + penjagaan split
      const publicFacilityFee = 100000;
      const guardFee = 50000;
      const uniqueCode = generateUniqueCode();
      const subtotal = waterCost + publicFacilityFee + guardFee + vehicleFee;
      const totalDue = subtotal + pastArrears + uniqueCode;

      const isPaid = Math.random() > 0.15; // 85% paid
      let payDate = null;
      if (isPaid) {
        payDate = new Date(
          dueDate.getTime() - Math.random() * 5 * 24 * 60 * 60 * 1000,
        ).toISOString();
      }

      const invDoc = await databases.createDocument(
        DATABASE_ID,
        COL_INVOICES,
        ID.unique(),
        {
          invoiceNumber: `INV-${period.replace("-", "")}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
          unit: unit.$id,
          period: period,
          status: isPaid ? "paid" : "unpaid",
          dueDate: dueDate.toISOString(),
          waterFee: waterCost,
          publicFacilityFee,
          guardFee,
          vehicleFee,
          arrears: pastArrears,
          uniqueCode,
          totalDue,
          accessToken: generateRandomToken(),
          pinCode: generateRandomPin(),
          payDate,
        },
      );

      await logActivity(
        "invoice.generate",
        "invoice",
        invDoc.$id,
        unit.$id,
        `Tagihan INV-${period} untuk unit ${unit.displayId} diterbitkan.`,
        {
          period,
          totalDue,
        },
      );

      // Payment logic
      if (isPaid) {
        arrearsTracker[unit.$id] = 0;
        await logActivity(
          "invoice.update",
          "invoice",
          invDoc.$id,
          unit.$id,
          `Pembayaran tagihan ${invDoc.invoiceNumber} berhasil.`,
          {
            period,
            amountPaid: totalDue,
          },
        );
      } else {
        arrearsTracker[unit.$id] = subtotal + uniqueCode + pastArrears;
        await logActivity(
          "invoice.update",
          "invoice",
          invDoc.$id,
          unit.$id,
          `Tagihan ${invDoc.invoiceNumber} melewati batas waktu pembayaran.`,
          {
            period,
            arrearsAmount: arrearsTracker[unit.$id],
          },
        );
      }

      invoicesGenerated++;
    }
    console.log(`  -> Generated ${invoicesGenerated} invoices for ${period}.`);
  }

  console.log("\\n=== SIMULATION COMPLETE ===");
}

runSimulation();
