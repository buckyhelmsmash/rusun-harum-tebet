import type { Models } from "appwrite";

export interface Unit extends Models.Document {
  block: string;
  floor: number;
  unitNumber: number;
  displayId: string;
  occupancyStatus: "owner_occupied" | "rented" | "vacant";
  billRecipient: "owner" | "tenant";
  owner?: Owner;
  tenant?: Tenant;
  vehicles?: Vehicle[];
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
  units?: Unit[];
}

export interface Vehicle extends Models.Document {
  licensePlate: string;
  type: string;
  brand: string;
  unit?: Unit;
}

export interface Invoice extends Models.Document {
  period: string; // e.g., '2023-10'
  status: "paid" | "unpaid";
  dueDate: string;
  payDate?: string;
  iplFee: number;
  waterFee: number;
  vehicleFee: number;
  arrears: number;
  uniqueCode: number; // 3-digit
  totalDue: number;
  accessToken: string; // Magic Link string
  unit?: Unit;
}

export interface News extends Models.Document {
  title: string;
  content: string;
  summary: string;
  coverImageId?: string;
  publishedDate?: string;
  isPublished: boolean;
}
