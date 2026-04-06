import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { activityKeys } from "@/hooks/api/keys/activity-keys";
import { type NewsFilters, newsKeys } from "@/hooks/api/keys/news-keys";
import { ApiClient } from "@/lib/api/api-client";
import type { News, NewsLabel } from "@/types";
import type { GetNewsResponse } from "@/types/api";

function buildNewsQueryString(filters: NewsFilters): string {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(filters)) {
    if (value !== undefined && value !== "") {
      params.set(key, String(value));
    }
  }
  const qs = params.toString();
  return qs ? `?${qs}` : "";
}

export function useGetNews(
  filters: NewsFilters = {},
  options?: { enabled?: boolean },
) {
  return useQuery({
    queryKey: newsKeys.list(filters),
    queryFn: async () => {
      const qs = buildNewsQueryString(filters);
      return await ApiClient.get<GetNewsResponse>(`/api/news${qs}`);
    },
    enabled: options?.enabled,
  });
}

export function useNewsItem(id: string) {
  return useQuery({
    queryKey: newsKeys.detail(id),
    queryFn: () => ApiClient.get<News>(`/api/news/${id}`),
    enabled: !!id,
  });
}

export function useCreateNews() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: Partial<News>) => {
      return ApiClient.post<typeof data, { result: News }>("/api/news", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: newsKeys.lists() });
      queryClient.invalidateQueries({ queryKey: activityKeys.lists() });
    },
  });
}

export function useUpdateNews() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<News> }) => {
      return ApiClient.patch<typeof data, { result: News }>(
        `/api/news/${id}`,
        data,
      );
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: newsKeys.lists() });
      queryClient.invalidateQueries({ queryKey: newsKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: activityKeys.lists() });
    },
  });
}

export function useDeleteNews() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id }: { id: string }) => {
      return ApiClient.delete<{ result: { success: boolean } }>(
        `/api/news/${id}`,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: newsKeys.lists() });
      queryClient.invalidateQueries({ queryKey: activityKeys.lists() });
    },
  });
}

export function useGetNewsLabels() {
  return useQuery({
    queryKey: newsKeys.labels(),
    queryFn: () => ApiClient.get<NewsLabel[]>("/api/news/labels"),
  });
}

export function useCreateNewsLabel() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: Pick<NewsLabel, "name" | "color">) => {
      return ApiClient.post<typeof data, { result: NewsLabel }>(
        "/api/news/labels",
        data,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: newsKeys.labels() });
    },
  });
}
