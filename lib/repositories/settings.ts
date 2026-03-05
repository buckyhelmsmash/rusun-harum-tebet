import { APPWRITE } from "@/lib/constants";
import { getAdminDb } from "./base";

const DB_ID = APPWRITE.DATABASE_ID;
const TABLE_ID = APPWRITE.COLLECTIONS.SETTINGS;
const GLOBAL_DOC_ID = "global";

export interface GlobalSettings {
  iplFee: number;
  publicFacilityFee: number;
  guardFee: number;
  waterRate: number;
}

const DEFAULTS: GlobalSettings = {
  iplFee: 250_000,
  publicFacilityFee: 15_000,
  guardFee: 35_000,
  waterRate: 12_500,
};

export const SettingsRepository = {
  async get(): Promise<GlobalSettings> {
    const db = await getAdminDb();
    try {
      const row = await db.getRow({
        databaseId: DB_ID,
        tableId: TABLE_ID,
        rowId: GLOBAL_DOC_ID,
      });
      return {
        iplFee: (row as Record<string, unknown>).iplFee as number,
        publicFacilityFee: (row as Record<string, unknown>)
          .publicFacilityFee as number,
        guardFee: (row as Record<string, unknown>).guardFee as number,
        waterRate: (row as Record<string, unknown>).waterRate as number,
      };
    } catch {
      return DEFAULTS;
    }
  },

  async update(data: Partial<GlobalSettings>): Promise<GlobalSettings> {
    const db = await getAdminDb();
    const row = await db.updateRow({
      databaseId: DB_ID,
      tableId: TABLE_ID,
      rowId: GLOBAL_DOC_ID,
      data,
    });
    return {
      iplFee: (row as Record<string, unknown>).iplFee as number,
      publicFacilityFee: (row as Record<string, unknown>)
        .publicFacilityFee as number,
      guardFee: (row as Record<string, unknown>).guardFee as number,
      waterRate: (row as Record<string, unknown>).waterRate as number,
    };
  },
};
