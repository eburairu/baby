"use client";

import { useState, useEffect } from "react";
import { Bell, Shield, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { usePushNotification } from "@/hooks/usePushNotification";
import { SettingsHeader } from "@/components/settings/SettingsHeader";

interface NotificationSettings {
  family_record_enabled: boolean;
  feeding_reminder_enabled: boolean;
  diaper_reminder_enabled: boolean;
  daily_summary_enabled: boolean;
  system_notice_enabled: boolean;
  dnd_start_time: string | null;
  dnd_end_time: string | null;
}

export default function NotificationsPage() {
  const { permission, requestPermission, subscribeUser, sendSubscriptionToBackend } = usePushNotification();
  const [settings, setSettings] = useState<NotificationSettings | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await fetch("/api/notifications/settings");
      if (response.ok) {
        const data = await response.json();
        setSettings(data);
      }
    } catch (error) {
      console.error("Failed to fetch settings:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateSetting = async (key: keyof NotificationSettings, value: boolean | string | null) => {
    if (!settings) return;

    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);

    try {
      const response = await fetch("/api/notifications/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [key]: value }),
      });
      if (!response.ok) throw new Error();
      toast.success("設定を更新しました");
    } catch {
      toast.error("設定の更新に失敗しました");
      fetchSettings(); // ロールバック
    }
  };

  const handleEnableNotifications = async () => {
    const status = await requestPermission();

    if (status === "granted") {
      const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
      if (!vapidPublicKey) {
        toast.error("VAPID鍵が設定されていません。管理者にお問い合わせください。");
        return;
      }

      try {
        const sub = await subscribeUser(vapidPublicKey);
        if (sub) {
          await sendSubscriptionToBackend(sub);
          toast.success("通知が有効になりました");
        } else {
          toast.error("通知の購読に失敗しました。時間をおいて再度お試しください。");
        }
      } catch (error) {
        const msg = error instanceof Error ? error.message : "不明なエラー";
        toast.error(`購読エラー: ${msg}`);
      }
    } else if (status === "denied") {
      toast.error("通知がブロックされています。ブラウザの設定から通知を許可してください。");
    } else if (status === "unsupported") {
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
      if (isIOS) {
        toast.error("通知はこのデバイスでサポートされていないか、アプリをホーム画面に追加（PWA）する必要があります。");
      } else {
        toast.error("お使いのブラウザは通知に対応していません。");
      }
    } else {
      toast.error("通知の許可がキャンセルされました");
    }
  };

  const getPermissionLabel = () => {
    switch (permission) {
      case "granted": return "許可されています";
      case "denied": return "ブロックされています";
      case "default": return "未設定（クリックで許可を求める）";
      case "unsupported" as unknown: return "非対応（ホーム画面に追加してください）";
      default: return "不明な状態";
    }
  };

  if (loading) return <div className="p-8 text-center">読み込み中...</div>;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-zinc-950">
      <SettingsHeader title="通知設定" />

      <div className="max-w-2xl mx-auto p-4 space-y-6 pb-20">
        <Card className="dark:bg-zinc-900 dark:border-zinc-800">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Shield className="h-5 w-5 text-blue-500" />
              通知のステータス
            </CardTitle>
            <CardDescription>このデバイスで通知を受け取るための設定です</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <p className="text-sm font-medium">ブラウザの通知許可</p>
                <p className="text-xs text-muted-foreground">
                  {getPermissionLabel()}
                </p>
              </div>
              {permission !== "granted" && (
                <Button onClick={handleEnableNotifications} size="sm">
                  有効にする
                </Button>
              )}
            </div>
            {permission === "granted" && (
              <div className="flex items-center justify-between pt-2 border-t">
                <div className="space-y-0.5">
                  <p className="text-sm font-medium">テスト通知を送信</p>
                  <p className="text-xs text-muted-foreground">通知が正常に届くか確認します</p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={async () => {
                    try {
                      const res = await fetch("/api/notifications/test", { method: "POST" });
                      const data = await res.json();
                      if (data.success) {
                        toast.success("テスト通知を送信しました");
                      } else {
                        toast.error(data.message || "テスト通知の送信に失敗しました");
                      }
                    } catch {
                      toast.error("テスト通知の送信に失敗しました");
                    }
                  }}
                >
                  送信
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="dark:bg-zinc-900 dark:border-zinc-800">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Bell className="h-5 w-5 text-amber-500" />
              通知項目
            </CardTitle>
            <CardDescription>受け取る通知の種類を選択してください</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <p className="text-sm font-medium">家族の記録</p>
                <p className="text-xs text-muted-foreground">家族が新しい記録を追加したときに通知します</p>
              </div>
              <Switch
                checked={settings?.family_record_enabled}
                onCheckedChange={(v) => updateSetting("family_record_enabled", v)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <p className="text-sm font-medium">授乳リマインダー</p>
                <p className="text-xs text-muted-foreground">前回の授乳から時間が経過したときに通知します</p>
              </div>
              <Switch
                checked={settings?.feeding_reminder_enabled}
                onCheckedChange={(v) => updateSetting("feeding_reminder_enabled", v)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <p className="text-sm font-medium">オムツリマインダー</p>
                <p className="text-xs text-muted-foreground">前回のオムツ替えから時間が経過したときに通知します</p>
              </div>
              <Switch
                checked={settings?.diaper_reminder_enabled}
                onCheckedChange={(v) => updateSetting("diaper_reminder_enabled", v)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <p className="text-sm font-medium">デイリーサマリー</p>
                <p className="text-xs text-muted-foreground">AIによる1日のまとめが完成したときに通知します</p>
              </div>
              <Switch
                checked={settings?.daily_summary_enabled}
                onCheckedChange={(v) => updateSetting("daily_summary_enabled", v)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <p className="text-sm font-medium">システム通知</p>
                <p className="text-xs text-muted-foreground">重要なお知らせやアップデート情報を通知します</p>
              </div>
              <Switch
                checked={settings?.system_notice_enabled}
                onCheckedChange={(v) => updateSetting("system_notice_enabled", v)}
              />
            </div>
          </CardContent>
        </Card>

        <Card className="dark:bg-zinc-900 dark:border-zinc-800">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Clock className="h-5 w-5 text-indigo-500" />
              おやすみモード
            </CardTitle>
            <CardDescription>指定した時間帯は通知を送信しません</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-medium text-muted-foreground">開始時間</label>
                <input
                  type="time"
                  className="w-full p-2 rounded-md border dark:bg-zinc-800 dark:border-zinc-700 text-sm"
                  value={settings?.dnd_start_time || ""}
                  onChange={(e) => updateSetting("dnd_start_time", e.target.value || null)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-medium text-muted-foreground">終了時間</label>
                <input
                  type="time"
                  className="w-full p-2 rounded-md border dark:bg-zinc-800 dark:border-zinc-700 text-sm"
                  value={settings?.dnd_end_time || ""}
                  onChange={(e) => updateSetting("dnd_end_time", e.target.value || null)}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
