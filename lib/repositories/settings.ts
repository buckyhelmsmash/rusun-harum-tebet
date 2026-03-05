import { APPWRITE } from "@/lib/constants";
import { getAdminDb } from "./base";

const DB_ID = APPWRITE.DATABASE_ID;
const TABLE_ID = APPWRITE.COLLECTIONS.SETTINGS;
const GLOBAL_DOC_ID = "global";

export interface GlobalSettings {
  publicFacilityFee: number;
  guardFee: number;
  waterRate: number;
  car1Fee: number;
  car2Fee: number;
  car3Fee: number;
  meetingNumber?: string;
}

const DEFAULTS: GlobalSettings = {
  publicFacilityFee: 15_000,
  guardFee: 35_000,
  waterRate: 12_500,
  car1Fee: 200_000,
  car2Fee: 500_000,
  car3Fee: 850_000,
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
      const r = row as Record<string, unknown>;
      return {
        publicFacilityFee:
          (r.publicFacilityFee as number) ?? DEFAULTS.publicFacilityFee,
        guardFee: (r.guardFee as number) ?? DEFAULTS.guardFee,
        waterRate: (r.waterRate as number) ?? DEFAULTS.waterRate,
        car1Fee: (r.car1Fee as number) ?? DEFAULTS.car1Fee,
        car2Fee: (r.car2Fee as number) ?? DEFAULTS.car2Fee,
        car3Fee: (r.car3Fee as number) ?? DEFAULTS.car3Fee,
        meetingNumber: (r.meetingNumber as string) ?? undefined,
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
    const r = row as Record<string, unknown>;
    return {
      publicFacilityFee:
        (r.publicFacilityFee as number) ?? DEFAULTS.publicFacilityFee,
      guardFee: (r.guardFee as number) ?? DEFAULTS.guardFee,
      waterRate: (r.waterRate as number) ?? DEFAULTS.waterRate,
      car1Fee: (r.car1Fee as number) ?? DEFAULTS.car1Fee,
      car2Fee: (r.car2Fee as number) ?? DEFAULTS.car2Fee,
      car3Fee: (r.car3Fee as number) ?? DEFAULTS.car3Fee,
      meetingNumber: (r.meetingNumber as string) ?? undefined,
    };
  },
};
