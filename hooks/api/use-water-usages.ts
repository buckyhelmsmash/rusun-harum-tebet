import { useQuery } from "@tanstack/react-query";
import { ApiClient } from "@/lib/api/api-client";
import {
  type WaterUsage,
  waterUsageListParamsSchema,
} from "@/lib/schemas/water-usages";

interface WaterUsagePageData {
  total: number;
  rows: WaterUsage[];
}

export function useGetWaterUsages(params: {
  limit?: number;
  offset?: number;
  period?: string;
  unitId?: string;
}) {
  return useQuery({
    queryKey: ["waterUsages", params],
    queryFn: async () => {
      // Clean undefined values
      const searchParams = new URLSearchParams();
      if (params.limit !== undefined)
        searchParams.set("limit", params.limit.toString());
      if (params.offset !== undefined)
        searchParams.set("offset", params.offset.toString());
      if (params.period) searchParams.set("period", params.period);
      if (params.unitId) searchParams.set("unitId", params.unitId);

      return ApiClient.get<WaterUsagePageData>(
        `/api/water-usages?${searchParams.toString()}`,
      );
    },
  });
}
