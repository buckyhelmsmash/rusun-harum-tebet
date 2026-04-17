/**
 * Strictly typed metadata discriminated union for activity logs.
 * Each action maps to a specific metadata shape — no raw JSON blobs.
 */

interface ChangeEntry {
  field: string;
  old: unknown;
  new: unknown;
}

interface ChangesMetadata {
  changes: ChangeEntry[];
}

interface SettingsChangesMetadata {
  changes: ChangeEntry[];
  meetingNumber: string;
}

interface InvoiceSummaryMetadata {
  period: string;
  totalDue: number;
}

interface VehicleCreateMetadata {
  licensePlate: string;
  vehicleType: string;
}

interface WaterImportMetadata {
  period: string;
  previousMeter: number;
  currentMeter: number;
  usage: number;
}

/**
 * Maps each ActivityAction to its allowed metadata shape.
 * Actions not listed here have no metadata (undefined).
 */
export interface ActivityMetadataMap {
  "unit.update": ChangesMetadata;
  "vehicle.create": VehicleCreateMetadata;
  "vehicle.update": ChangesMetadata;
  "vehicle.delete": ChangesMetadata;
  "owner.create": undefined;
  "owner.update": ChangesMetadata;
  "owner.delete": ChangesMetadata;
  "owner.assign": undefined;
  "owner.remove": undefined;
  "tenant.create": undefined;
  "tenant.update": ChangesMetadata;
  "tenant.delete": ChangesMetadata;
  "tenant.assign": undefined;
  "tenant.remove": undefined;
  "invoice.create": InvoiceSummaryMetadata;
  "invoice.update": ChangesMetadata;
  "invoice.sync": undefined;
  "invoice.generate": InvoiceSummaryMetadata;
  "water_usage.import": WaterImportMetadata;
  "water_usage.update": ChangesMetadata;
  "settings.update": SettingsChangesMetadata;
  "news.create": undefined;
  "news.update": ChangesMetadata;
  "news.delete": undefined;
}

export type ActivityMetadata = ActivityMetadataMap[keyof ActivityMetadataMap];

/**
 * Type-safe parser — always returns a known shape or null.
 * Consumers never need to `JSON.parse` + guess anymore.
 */
export function parseActivityMetadata(
  raw?: string | null,
): ActivityMetadata | null {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as ActivityMetadata;
  } catch {
    return null;
  }
}

/**
 * Extracts `changes` array from parsed metadata if present.
 */
export function extractChanges(
  meta: ActivityMetadata | null,
): ChangeEntry[] | null {
  if (!meta || !("changes" in meta) || !Array.isArray(meta.changes))
    return null;
  return meta.changes;
}

/**
 * Extracts `meetingNumber` from settings metadata if present.
 */
export function extractMeetingNumber(
  meta: ActivityMetadata | null,
): string | null {
  if (!meta || !("meetingNumber" in meta)) return null;
  return meta.meetingNumber;
}

export type { ChangeEntry, ChangesMetadata };
