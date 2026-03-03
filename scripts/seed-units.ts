import { Client, Databases, ID } from "node-appwrite";
import "dotenv/config";

// Hardcoded for the one-off script because bun's dotenv resolution is struggling
const endpoint = "https://sgp.cloud.appwrite.io/v1";
const projectId = "rusun-harum-tebet";
const apiKey =
  "standard_20f610fdf7b305d44f2c240db327ed25b9ea2802ec02216e377ae6fe4c55c16ef6f783c21ee0eba89404eccade10c102041f5f4543edfd90e93c8226669d12a92e658feffcde6a39c5146d764200b45daf64a8fc057318a62c054978c40e44ead5cfea9c29c056f50eeb8bd420cf46334d6067fb5d0bf12d6fee686d334c1210";
const databaseId = "69a47644000b6bb85e41";
const collectionId = "units";

const client = new Client()
  .setEndpoint(endpoint)
  .setProject(projectId)
  .setKey(apiKey);

const databases = new Databases(client);

const blocks = ["A", "B", "C", "D"];
const regularFloors = [1, 2, 3, 4];

async function seedUnits() {
  console.log("Starting unit seeding process...");
  let totalSeeded = 0;

  try {
    for (const block of blocks) {
      // 1. Seed Regular Floors (1-4), 20 units each
      for (const floor of regularFloors) {
        for (let unitNum = 1; unitNum <= 20; unitNum++) {
          const displayId = `${block}${floor}${unitNum.toString().padStart(2, "0")}`;

          await databases.createDocument(
            databaseId,
            collectionId,
            ID.unique(),
            {
              block,
              floor,
              unitNumber: unitNum,
              displayId,
              unitType: "regular",
              isOccupied: false,
              occupancyStatus: "vacant",
              billRecipient: "owner", // default
            },
          );
          totalSeeded++;
          console.log(`Created unit: ${displayId}`);
        }
      }

      // 2. Seed Basement Floor (0), 16 units each
      for (let unitNum = 1; unitNum <= 16; unitNum++) {
        const displayId = `${block}-B${unitNum.toString().padStart(2, "0")}`;

        await databases.createDocument(databaseId, collectionId, ID.unique(), {
          block,
          floor: 0,
          unitNumber: unitNum,
          displayId,
          unitType: "basement",
          isOccupied: false,
          occupancyStatus: "vacant",
          billRecipient: "owner", // default
        });
        totalSeeded++;
        console.log(`Created basement unit: ${displayId}`);
      }
    }

    console.log(
      `\n✅ Seeding complete! Successfully inserted ${totalSeeded} units.`,
    );
  } catch (error) {
    console.error("❌ Error seeding units:", error);
  }
}

seedUnits();
