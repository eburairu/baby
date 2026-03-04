"use client"
import { ActivityItem } from "@/components/dashboard/ActivityItem"
import { BabyWidget } from "@/components/dashboard/BabyWidget"
import { BirthRegistrationDialog } from "@/components/dashboard/BirthRegistrationDialog"
import { NotificationItem } from "@/components/notifications/NotificationItem"

export default function TestPage() {
    return (
        <div className="p-8 space-y-8 bg-white dark:bg-zinc-950 min-h-screen">
            <div>
                <h2 className="text-xl font-bold mb-4">ActivityItem</h2>
                <ul className="w-80">
                    <ActivityItem
                        record={{
                            id: 1,
                            baby_id: 1,
                            type: "feeding",
                            timestamp: new Date().toISOString(),
                            recorded_by_id: 1,
                            recorded_by_display_name: "パパ",
                            comment_count: 0,
                            created_at: new Date().toISOString(),
                            details: {
                                feeding_type: "BREAST",
                                amount_ml: null,
                                duration_minutes: 10,
                                notes: "よく飲んだ",
                            }
                        } as any}
                        onClick={() => {}}
                    />
                </ul>
            </div>

            <div>
                <h2 className="text-xl font-bold mb-4">BabyWidget</h2>
                <div className="w-48">
                    <BabyWidget
                        baby={{
                            id: 1,
                            name: "太郎",
                            birthday: "2024-01-01",
                        }}
                    />
                </div>
            </div>

            <div>
                <h2 className="text-xl font-bold mb-4">BirthRegistrationDialog</h2>
                <div className="w-64">
                    <BirthRegistrationDialog babyId="1" babyName="太郎" onSuccess={() => {}} />
                </div>
            </div>

            <div>
                <h2 className="text-xl font-bold mb-4">NotificationItem</h2>
                <div className="w-80 border rounded-xl overflow-hidden">
                    <NotificationItem
                        notification={{
                            id: 1,
                            user_id: 1,
                            type: "family_record",
                            title: "新しい記録が追加されました",
                            body: "ママがおむつ（うんち）を記録しました",
                            is_read: false,
                            created_at: new Date().toISOString(),
                        }}
                        onRead={() => {}}
                    />
                </div>
            </div>
        </div>
    )
}
