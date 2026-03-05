import { z } from "zod";

export const createInvoiceSchema = z.object({
  unit: z.string().min(1),
  period: z.string().min(1),
  status: z.enum(["unpaid", "paid"]).default("unpaid"),
  dueDate: z.string().min(1),
  iplFee: z.number().min(0),
  waterFee: z.number().min(0),
  publicFacilityFee: z.number().min(0),
  guardFee: z.number().min(0),
  vehicleFee: z.number().min(0),
  arrears: z.number().min(0),
  arrearsBreakdown: z.string().optional(),
  uniqueCode: z.number().min(100).max(999),
  totalDue: z.number().min(0),
  accessToken: z.string(),
  invoiceNumber: z.string().min(1),
  payDate: z.string().nullable().optional(),
});

export type CreateInvoiceInput = z.infer<typeof createInvoiceSchema>;

export const updateInvoiceSchema = z.object({
  status: z.enum(["unpaid", "paid"]).optional(),
  iplFee: z.number().int().min(0).optional(),
  waterFee: z.number().int().min(0).optional(),
  vehicleFee: z.number().int().min(0).optional(),
  arrears: z.number().int().min(0).optional(),
  uniqueCode: z.number().int().min(100).max(999).optional(),
  totalDue: z.number().int().min(0).optional(),
  dueDate: z.string().optional(),
  payDate: z.string().nullable().optional(),
});

export type UpdateInvoiceInput = z.infer<typeof updateInvoiceSchema>;

export const invoiceListParamsSchema = z.object({
  search: z.string().optional(),
  status: z.enum(["unpaid", "paid"]).optional(),
  period: z.string().optional(),
  block: z.string().optional(),
  orderBy: z.string().optional(),
  limit: z.coerce.number().min(1).max(100).optional(),
  offset: z.coerce.number().min(0).optional(),
});

export type InvoiceListParams = z.infer<typeof invoiceListParamsSchema>;
