export interface InvoiceFilters {
  search?: string;
  status?: string;
  period?: string;
  block?: string;
  orderBy?: string;
  limit?: number;
  offset?: number;
}

export const invoiceKeys = {
  all: ["invoices"] as const,
  lists: () => [...invoiceKeys.all, "list"] as const,
  list: (filters?: InvoiceFilters) =>
    [...invoiceKeys.lists(), { filters }] as const,
  detail: (id: string) => [...invoiceKeys.all, "detail", id] as const,
};
