"use client"

import { useState } from "react"
import { api, getErrorMessage } from "@/lib/api"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAsyncAction } from "@/hooks/useAsyncAction"

interface OnboardingFormProps {
    isAdmin: boolean
    onSuccess: () => void
}

export function OnboardingForm({ isAdmin, onSuccess }: OnboardingFormProps) {
    const [newBabyName, setNewBabyName] = useState("")
    const [newBabyBirthday, setNewBabyBirthday] = useState("")
    const [newBabyGender, setNewBabyGender] = useState("unknown")
    const [error, setError] = useState<string | null>(null)
    const { loading: submitting, execute } = useAsyncAction()

    const handleAddBaby = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!newBabyName) return
        setError(null)

        await execute(
            async () => {
                const body: Record<string, string> = { name: newBabyName, gender: newBabyGender }
                if (newBabyBirthday) body.birthday = newBabyBirthday
                await api.post("/babies/", body)
                setNewBabyName("")
                setNewBabyBirthday("")
                setNewBabyGender("unknown")
                onSuccess()
            },
            {
                onError: (err) => {
                    console.error("赤ちゃんの追加に失敗しました", err)
                    setError(getErrorMessage(err, "赤ちゃんの追加に失敗しました"))
                }
            }
        )
    }

    if (!isAdmin) {
        return (
            <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 flex items-center justify-center p-4">
                <Card className="w-full max-w-md rounded-2xl shadow-sm border-0 dark:bg-zinc-900">
                    <CardHeader>
                        <CardTitle className="text-xl text-amber-600 dark:text-amber-500">赤ちゃんが未登録です</CardTitle>
                        <CardDescription className="dark:text-zinc-400">
                            ファミリーの管理者に赤ちゃんの登録を依頼してください。
                        </CardDescription>
                    </CardHeader>
                </Card>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 flex items-center justify-center p-4">
            <Card className="w-full max-w-md rounded-2xl shadow-sm border-0 dark:bg-zinc-900">
                <CardHeader>
                    <CardTitle className="text-xl dark:text-zinc-100">ようこそ！</CardTitle>
                    <CardDescription className="dark:text-zinc-400">
                        赤ちゃんの情報を登録して、育児記録を始めましょう。
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleAddBaby} className="space-y-4">
                        {error ? <div className="text-red-500 dark:text-red-400 text-sm">{error}</div> : null}
                        <div className="space-y-2">
                            <Label htmlFor="babyName" className="dark:text-zinc-300">赤ちゃんの名前 <span className="text-red-500">*</span></Label>
                            <Input
                                id="babyName"
                                value={newBabyName}
                                onChange={(e) => setNewBabyName(e.target.value)}
                                placeholder="例: れん"
                                required
                                className="dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-100 dark:placeholder:text-zinc-500"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="babyBirthday" className="dark:text-zinc-300">誕生日（任意）</Label>
                            <Input
                                id="babyBirthday"
                                type="date"
                                max="9999-12-31"
                                value={newBabyBirthday}
                                onChange={(e) => setNewBabyBirthday(e.target.value)}
                                className="dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-100"
                            />
                        </div>
                        <fieldset className="space-y-2">
                            <legend className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 dark:text-zinc-300 mb-2">
                                性別 <span className="text-red-500">*</span>
                            </legend>
                            <div className="flex gap-4">
                                <label className="flex items-center gap-2 text-sm cursor-pointer dark:text-zinc-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                                    <input
                                        type="radio"
                                        name="gender"
                                        value="boy"
                                        checked={newBabyGender === "boy"}
                                        onChange={(e) => setNewBabyGender(e.target.value)}
                                        required
                                        className="dark:bg-zinc-800 dark:border-zinc-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:focus-visible:ring-indigo-400 focus-visible:ring-offset-2 transition-shadow"
                                    />
                                    男の子
                                </label>
                                <label className="flex items-center gap-2 text-sm cursor-pointer dark:text-zinc-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                                    <input
                                        type="radio"
                                        name="gender"
                                        value="girl"
                                        checked={newBabyGender === "girl"}
                                        onChange={(e) => setNewBabyGender(e.target.value)}
                                        className="dark:bg-zinc-800 dark:border-zinc-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:focus-visible:ring-indigo-400 focus-visible:ring-offset-2 transition-shadow"
                                    />
                                    女の子
                                </label>
                                <label className="flex items-center gap-2 text-sm cursor-pointer dark:text-zinc-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                                    <input
                                        type="radio"
                                        name="gender"
                                        value="unknown"
                                        checked={newBabyGender === "unknown"}
                                        onChange={(e) => setNewBabyGender(e.target.value)}
                                        className="dark:bg-zinc-800 dark:border-zinc-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:focus-visible:ring-indigo-400 focus-visible:ring-offset-2 transition-shadow"
                                    />
                                    わからない
                                </label>
                            </div>
                        </fieldset>
                        <Button
                            type="submit"
                            className="w-full bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white"
                            disabled={submitting}
                            loading={submitting}
                        >
                            登録する
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
