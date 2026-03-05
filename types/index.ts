import type { Models } from "appwrite";

export interface Unit extends Models.Document {
  block: "A" | "B" | "C" | "D";
  floor: number;
  unitNumber: number;
  displayId: string;
  unitType: "regular" | "basement";
  isOccupied: boolean;
  occupancyStatus: "owner_occupied" | "rented" | "vacant";
  billRecipient: "owner" | "tenant";
  owner?: Owner;
  ownerId?: string;
  tenant?: Tenant;
  tenantId?: string;
  vehicles?: Vehicle[];
  invoice?: Invoice[];
}

export interface Owner extends Models.Document {
  fullName: string;
  phoneNumber: string;
  ktpNumber: string;
  email?: string;
  dateOfBirth?: string;
  units?: Unit[];
}

export interface Tenant extends Models.Document {
  fullName: string;
  phoneNumber: string;
  ktpNumber: string;
  email?: string;
  dateOfBirth?: string;
  startDate?: string;
  endDate?: string;
  unit?: Unit;
}

export interface Vehicle extends Models.Document {
  vehicleType: "car" | "motorcycle" | "box_car";
  licensePlate: string;
  monthlyRate?: number;
  color?: string;
  brand?: string;
  unit?: Unit;
  unitId?: string;
}

export interface Invoice extends Models.Document {
  accessToken: string;
  period: string; // e.g., '2023-10'
  status: "paid" | "unpaid";
  dueDate: string;
  arrears: number;
  totalDue: number;
  iplFee: number;
  waterFee: number;
  vehicleFee: number;
  uniqueCode: number;
  payDate?: string;
  receiptId?: string;
  unit?: Unit;
  unitId?: string;
}

export interface News extends Models.Document {
  title: string;
  content: string;
  summary: string;
  coverImageId?: string;
  publishedDate?: string;
  isPublished: boolean;
}

export type ActivityAction =
  | "unit.update"
  | "vehicle.create"
  | "vehicle.update"
  | "vehicle.delete"
  | "owner.create"
  | "owner.update"
  | "owner.delete"
  | "owner.assign"
  | "owner.remove"
  | "tenant.create"
  | "tenant.update"
  | "tenant.delete"
  | "tenant.assign"
  | "tenant.remove"
  | "invoice.create"
  | "invoice.update"
  | "news.create"
  | "news.update"
  | "news.delete";

export type TargetType = "unit" | "vehicle" | "owner" | "tenant" | "invoice";

export interface ActivityLog extends Models.Document {
  actorId: string;
  actorName: string;
  action: ActivityAction;
  description: string;
  targetType: TargetType;
  targetId?: string;
  unitId?: string;
  metadata?: string;
}
