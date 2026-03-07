import { randomBytes } from "crypto";
import { Client, Databases, ID, Query } from "node-appwrite";

// Require dotenv carefully in standard Node
require("dotenv").config({ path: ".env" });
require("dotenv").config({ path: ".env.local" });

const APPWRITE_ENDPOINT = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!;
const APPWRITE_PROJECT = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!;
const APPWRITE_KEY = process.env.APPWRITE_API_KEY!;
const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!;
const INVOICES_COLLECTION =
  process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_INVOICES!;

if (
  !APPWRITE_ENDPOINT ||
  !APPWRITE_PROJECT ||
  !APPWRITE_KEY ||
  !DATABASE_ID ||
  !INVOICES_COLLECTION
) {
  console.error("Missing Appwrite environment variables.", {
    APPWRITE_ENDPOINT,
    APPWRITE_PROJECT,
    APPWRITE_KEY: APPWRITE_KEY ? "***" : undefined,
    DATABASE_ID,
    INVOICES_COLLECTION,
  });
  process.exit(1);
}

const client = new Client()
  .setEndpoint(APPWRITE_ENDPOINT)
  .setProject(APPWRITE_PROJECT)
  .setKey(APPWRITE_KEY);

const databases = new Databases(client);

function generateRandomPin() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

function generateRandomToken() {
  return randomBytes(16).toString("hex");
}

function generateUniqueCode() {
  return Math.floor(Math.random() * 900) + 100; // 100-999
}

const PAST_PERIODS = ["2025-11", "2025-12", "2026-01"];

async function seedHistory() {
  try {
    // 1. Fetch current (Feb 2026) invoices to use as templates
    console.log("Fetching existing 2026-02 invoices...");
    const response = await databases.listDocuments(
      DATABASE_ID,
      INVOICES_COLLECTION,
      [Query.equal("period", "2026-02")],
    );

    const baseInvoices = response.documents;
    console.log(`Found ${baseInvoices.length} invoices to seed history for.`);

    if (baseInvoices.length === 0) {
      console.log("No base invoices found. Aborting.");
      return;
    }

    // 2. Loop through each base invoice and create past months
    for (const base of baseInvoices) {
      const unitId = typeof base.unit === "string" ? base.unit : base.unit.$id;
      if (!unitId) continue;

      console.log(`\nSeeding history for Unit: ${unitId} ...`);

      let cumulativeArrears = 0;

      // Iterate chronologically to build up arrears naturally
      for (const period of PAST_PERIODS) {
        // Randomly decide if this past month was paid or not
        // Let's make it so ~30% chance they missed a payment to create arrears
        const isPaid = Math.random() > 0.3;

        const uniqueCode = generateUniqueCode();
        const subtotal =
          (base.waterFee || 0) +
          (base.publicFacilityFee || 0) +
          (base.guardFee || 0) +
          (base.vehicleFee || 0);
        const totalDue = subtotal + cumulativeArrears + uniqueCode;

        // Due date is usually 15th of the NEXT month (e.g. Nov 2025 -> Due Dec 15, 2025)
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

        // If it was paid, generated a random pay date before the due date
        let payDate = null;
        if (isPaid) {
          payDate = new Date(
            dueDate.getTime() - Math.random() * 5 * 24 * 60 * 60 * 1000,
          ).toISOString();
        }

        const newDoc = {
          invoiceNumber: `INV-${period.replace("-", "")}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
          unit: unitId,
          period: period,
          status: isPaid ? "paid" : "unpaid",
          dueDate: dueDate.toISOString(),
          waterFee: base.waterFee,
          publicFacilityFee: base.publicFacilityFee,
          guardFee: base.guardFee,
          vehicleFee: base.vehicleFee,
          arrears: cumulativeArrears,
          uniqueCode,
          totalDue,
          accessToken: generateRandomToken(),
          pinCode: generateRandomPin(), // Set a PIN for these test documents
          payDate: payDate,
        };

        const created = await databases.createDocument(
          DATABASE_ID,
          INVOICES_COLLECTION,
          ID.unique(),
          newDoc,
        );

        console.log(
          `  Created ${period}: Status=${newDoc.status}, Arrears=${newDoc.arrears}, Total=${newDoc.totalDue}`,
        );

        // If this invoice went unpaid, it becomes arrears for the NEXT period
        if (!isPaid) {
          cumulativeArrears += subtotal + uniqueCode;
        }
      }

      // OPTIONAL: Update the current February invoice to reflect the final accumulated arrears
      if (cumulativeArrears > 0) {
        console.log(
          `  -> Updating 2026-02 invoice with carried over Arrears: ${cumulativeArrears}`,
        );
        const totalFebDue =
          (base.waterFee || 0) +
          (base.publicFacilityFee || 0) +
          (base.guardFee || 0) +
          (base.vehicleFee || 0) +
          cumulativeArrears +
          base.uniqueCode;
        await databases.updateDocument(
          DATABASE_ID,
          INVOICES_COLLECTION,
          base.$id,
          {
            arrears: cumulativeArrears,
            totalDue: totalFebDue,
            pinCode: generateRandomPin(), // Ensure current invoice has a PIN so we can test it!
          },
        );
      } else {
        // Make sure it has a PIN code anyway
        await databases.updateDocument(
          DATABASE_ID,
          INVOICES_COLLECTION,
          base.$id,
          {
            pinCode: generateRandomPin(),
          },
        );
      }
    }

    console.log("\nSuccess! Historical test data seeded successfully.");
  } catch (error) {
    console.error("Error seeding invoices:", error);
  }
}

seedHistory();
