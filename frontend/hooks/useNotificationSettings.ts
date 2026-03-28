import useSWR from "swr"
import { fetcher, api } from "@/lib/api"
import { toast } from "sonner"

export interface NotificationSettings {
  family_record_enabled: boolean;
  feeding_reminder_enabled: boolean;
  diaper_reminder_enabled: boolean;
  daily_summary_enabled: boolean;
  system_notice_enabled: boolean;
  dnd_start_time: string | null;
  dnd_end_time: string | null;
}

export function useNotificationSettings() {
    const { data: settings, mutate, isLoading, error } = useSWR<NotificationSettings>(
        "/notifications/settings",
        fetcher
    )

    const updateSettings = async (updates: Partial<NotificationSettings>, options?: { showToast?: boolean }) => {
        if (!settings) return;

        const newSettings = { ...settings, ...updates };

        try {
            await mutate(
                async () => {
                    await api.patch("/notifications/settings", updates);
                    return newSettings;
                },
                {
                    optimisticData: newSettings,
                    rollbackOnError: true,
                    revalidate: false,
                }
            );
            if (options?.showToast !== false) {
                toast.success("設定を更新しました");
            }
        } catch (err) {
            toast.error("設定の更新に失敗しました");
            throw err;
        }
    };

    return { settings, mutate, isLoading, error, updateSettings };
}
