// Reusable query for current user profile.
// Cached for 5 minutes, invalidate after profile updates.

import { useQuery } from "@tanstack/react-query";
import { userApi } from "@/shared/api/client";
import type { GetMeResponseDto } from "@/shared/api/generated/models/get-me-response-dto";

export const currentUserQueryKey = ["current-user"] as const;

export function useCurrentUser() {
  return useQuery({
    queryKey: currentUserQueryKey,
    queryFn: async (): Promise<GetMeResponseDto> => {
      const { data } = await userApi.userControllerGetCurrentUser();
      return data;
    },
    staleTime: 5 * 60 * 1000,
  });
}
