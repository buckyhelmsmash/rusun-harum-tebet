import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { activityKeys } from "@/hooks/api/keys/activity-keys";
import { adminKeys } from "@/hooks/api/keys/admin-keys";
import { ApiClient } from "@/lib/api/api-client";

export interface AdminUser {
  $id: string;
  name: string;
  email: string;
  labels: string[];
}

export function useGetAdmins() {
  return useQuery({
    queryKey: adminKeys.lists(),
    queryFn: async () => {
      // The API returns the array directly, so we just return it as AdminUser[]
      return await ApiClient.get<AdminUser[]>("/api/admins");
    },
  });
}

export function useInviteAdmin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { email: string }) => {
      return ApiClient.post<typeof data, { result: AdminUser }>(
        "/api/admins/invite",
        data,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: adminKeys.lists(),
      });
      queryClient.invalidateQueries({
        queryKey: activityKeys.lists(),
      });
    },
  });
}

export function useDeleteAdmin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      return ApiClient.delete<{ result: { success: boolean } }>(
        `/api/admins/${id}`,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: adminKeys.lists(),
      });
      queryClient.invalidateQueries({
        queryKey: activityKeys.lists(),
      });
    },
  });
}
