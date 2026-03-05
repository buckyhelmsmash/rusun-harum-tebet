import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { activityKeys } from "@/hooks/api/keys/activity-keys";
import {
  type InvoiceFilters,
  invoiceKeys,
} from "@/hooks/api/keys/invoice-keys";
import { ApiClient } from "@/lib/api/api-client";
import type { Invoice } from "@/types";
import type { GetInvoicesResponse } from "@/types/api";

function buildInvoiceQueryString(filters: InvoiceFilters): string {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(filters)) {
    if (value !== undefined && value !== "" && value !== "all") {
      params.set(key, String(value));
    }
  }
  const qs = params.toString();
  return qs ? `?${qs}` : "";
}

export function useGetInvoices(filters: InvoiceFilters = {}) {
  return useQuery({
    queryKey: invoiceKeys.list(filters),
    queryFn: async () => {
      const qs = buildInvoiceQueryString(filters);
      return await ApiClient.get<GetInvoicesResponse>(`/api/invoices${qs}`);
    },
  });
}

export function useGetInvoice(id: string) {
  return useQuery({
    queryKey: invoiceKeys.detail(id),
    queryFn: async () => {
      return await ApiClient.get<Invoice>(`/api/invoices/${id}`);
    },
    enabled: !!id,
  });
}

export function useCreateInvoice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Record<string, unknown>) => {
      return ApiClient.post<typeof data, { result: Invoice }>(
        "/api/invoices",
        data,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: invoiceKeys.lists(),
      });
      queryClient.invalidateQueries({
        queryKey: activityKeys.lists(),
      });
    },
  });
}

export function useUpdateInvoice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: Partial<Invoice>;
    }) => {
      return ApiClient.patch<typeof data, { result: Invoice }>(
        `/api/invoices/${id}`,
        data,
      );
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: invoiceKeys.detail(variables.id),
      });
      queryClient.invalidateQueries({
        queryKey: invoiceKeys.lists(),
      });
      queryClient.invalidateQueries({
        queryKey: activityKeys.lists(),
      });
    },
  });
}

interface GenerateInvoicesResponse {
  count: number;
  updated: number;
  message?: string;
}

export function useGenerateInvoices() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      return ApiClient.post<undefined, GenerateInvoicesResponse>(
        "/api/invoices/generate",
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: invoiceKeys.lists(),
      });
      queryClient.invalidateQueries({
        queryKey: activityKeys.lists(),
      });
    },
  });
}
