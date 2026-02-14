import useSWR from "swr";
import { fetcher, api } from "@/lib/api";

export type PermissionItem = {
  record_type: string;
  can_view: boolean;
};

export type UserPermissionSet = {
  user_id: number;
  username: string;
  permissions: PermissionItem[];
};

export type BabyPermissionsData = {
  baby_id: number;
  baby_name: string;
  members: UserPermissionSet[];
};

export function useBabyPermissions(babyId: number | null) {
  const { data, error, isLoading, mutate } = useSWR<BabyPermissionsData>(
    babyId ? `/babies/${babyId}/permissions` : null,
    fetcher,
    { revalidateOnFocus: false }
  );
  return { data, error, isLoading, mutate };
}

export async function updateBabyPermissions(
  babyId: number,
  permissions: { user_id: number; record_type: string; can_view: boolean }[]
): Promise<void> {
  await api.put(`/babies/${babyId}/permissions`, { permissions });
}
