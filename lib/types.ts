export interface AppwriteRow {
  $id: string;
  $createdAt: string;
  $updatedAt: string;
}

export interface Unit extends AppwriteRow {
  block: "A" | "B" | "C" | "D";
  floor: number;
  unitNumber: number;
  displayId: string;
  unitType: "regular" | "basement";
  isOccupied: boolean;
  occupancyStatus: "owner_occupied" | "rented" | "vacant";
  billRecipient: "owner" | "tenant";
  owner?: Owner | string | null;
  tenant?: Tenant | string | null;
  vehicles?: Vehicle[] | string[];
  invoice?: Invoice[] | string[];
}

export interface Owner extends AppwriteRow {
  fullName: string;
  phoneNumber: string;
  ktpNumber: string;
  email?: string | null;
  dateOfBirth: string;
  units?: Unit[] | string[];
}

export interface Tenant extends AppwriteRow {
  fullName: string;
  phoneNumber: string;
  ktpNumber: string;
  dateOfBirth: string;
  email?: string | null;
  unit?: Unit | string | null;
}

export interface Vehicle extends AppwriteRow {
  vehicleType: "car" | "motorcycle" | "box_car";
  licensePlate: string;
  monthlyRate?: number | null;
  color?: string | null;
  brand?: string | null;
  unit?: Unit | string | null;
}

export interface Invoice extends AppwriteRow {
  accessToken: string;
  period: string;
  status: "unpaid" | "paid";
  dueDate: string;
  arrears: number;
  totalDue: number;
  iplFee: number;
  waterFee: number;
  vehicleFee: number;
  payDate?: string | null;
  receiptId?: string | null;
  unit?: Unit | string | null;
}

export interface NewsArticle extends AppwriteRow {
  title: string;
  content: string;
  publishedDate?: string | null;
  isPublished: boolean;
  summary: string;
  coverImageId?: string | null;
}
