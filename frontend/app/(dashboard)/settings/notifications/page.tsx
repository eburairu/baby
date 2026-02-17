"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, Bell, BellOff, Shield, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { usePushNotification } from "@/hooks/usePushNotification";

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
  const router = useRouter();
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

  const updateSetting = async (key: keyof NotificationSettings, value: any) => {
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
    } catch (error) {
      toast.error("設定の更新に失敗しました");
      fetchSettings(); // ロールバック
    }
  };

  const handleEnableNotifications = async () => {
    const status = await requestPermission();
    if (status === "granted") {
      // 公開鍵をバックエンドから取得するか環境変数から
      const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
      if (!vapidPublicKey) {
        toast.error("VAPID鍵が設定されていません");
        return;
      }
      
      const sub = await subscribeUser(vapidPublicKey);
      if (sub) {
        await sendSubscriptionToBackend(sub);
        toast.success("通知を有効にしました");
      }
    } else {
      toast.error("通知が許可されませんでした");
    }
  };

  if (loading) return <div className="p-8 text-center">読み込み中...</div>;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-zinc-950">
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md shadow-sm border-b border-gray-100 dark:border-zinc-800 h-14 flex items-center px-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()} className="mr-2">
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-base font-semibold text-gray-900 dark:text-zinc-100">通知設定</h1>
      </header>

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
                  {permission === "granted" ? "許可されています" : permission === "denied" ? "ブロックされています" : "未設定"}
                </p>
              </div>
              {permission !== "granted" && (
                <Button onClick={handleEnableNotifications} size="sm">
                  有効にする
                </Button>
              )}
            </div>
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
