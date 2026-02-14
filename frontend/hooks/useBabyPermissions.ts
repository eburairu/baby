import useSWR from "swr";
import { fetcher } from "@/lib/api";

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
    babyId ? `/api/babies/${babyId}/permissions` : null,
    fetcher,
    { revalidateOnFocus: false }
  );
  return { data, error, isLoading, mutate };
}

export async function updateBabyPermissions(
  babyId: number,
  permissions: { user_id: number; record_type: string; can_view: boolean }[]
): Promise<void> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/api/babies/${babyId}/permissions`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ permissions }),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail ?? "権限の更新に失敗しました");
  }
}
