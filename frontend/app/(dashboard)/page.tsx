"use client"
import { useState } from "react"
import { useBabies, useRecords } from "@/hooks/useData"
import { api } from "@/lib/api"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"

export default function Dashboard() {
    const { babies, isLoading: babiesLoading, mutate: mutateBabies } = useBabies()
    const [selectedBabyId, setSelectedBabyId] = useState<string | null>(null)

    // Set first baby as default when loaded
    if (babies && babies.length > 0 && !selectedBabyId) {
        setSelectedBabyId(babies[0].id)
    }

    const { records, isLoading: recordsLoading, mutate: mutateRecords } = useRecords(selectedBabyId)

    const [newBabyName, setNewBabyName] = useState("")

    const handleAddBaby = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!newBabyName) return
        try {
            await api.post("/babies/", { name: newBabyName })
            setNewBabyName("")
            mutateBabies()
        } catch (err) {
            console.error("Failed to add baby", err)
        }
    }

    const handleAddRecord = async (type: string) => {
        if (!selectedBabyId) return
        try {
            await api.post(`/babies/${selectedBabyId}/records`, {
                type,
                timestamp: new Date().toISOString(),
                data: {}
            })
            mutateRecords()
        } catch (err) {
            console.error("Failed to add record", err)
        }
    }

    if (babiesLoading) return <div>Loading dashboard...</div>

    if (!babies || babies.length === 0) {
        return (
            <Card className="max-w-md mx-auto mt-10">
                <CardHeader>
                    <CardTitle>Welcome! Let's get started.</CardTitle>
                    <CardDescription>First, verify your baby's name so we can start tracking.</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleAddBaby} className="space-y-4">
                        <div>
                            <Label htmlFor="babyName">Baby Name</Label>
                            <Input
                                id="babyName"
                                value={newBabyName}
                                onChange={(e) => setNewBabyName(e.target.value)}
                                placeholder="e.g. Ren"
                            />
                        </div>
                        <Button type="submit" className="w-full">Add Baby</Button>
                    </form>
                </CardContent>
            </Card>
        )
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">
                    {babies.find((b: any) => b.id === selectedBabyId)?.name}'s Dashboard
                </h2>
                {babies.length > 1 && (
                    <div className="flex gap-2">
                        {babies.map((baby: any) => (
                            <Button
                                key={baby.id}
                                variant={selectedBabyId === baby.id ? "default" : "outline"}
                                onClick={() => setSelectedBabyId(baby.id)}
                            >
                                {baby.name}
                            </Button>
                        ))}
                    </div>
                )}
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Button onClick={() => handleAddRecord("feeding")} className="h-24 text-lg" variant="secondary">🍼 Feeding</Button>
                <Button onClick={() => handleAddRecord("sleep")} className="h-24 text-lg" variant="secondary">💤 Sleep</Button>
                <Button onClick={() => handleAddRecord("diaper")} className="h-24 text-lg" variant="secondary">💩 Diaper</Button>
                <Button onClick={() => handleAddRecord("growth")} className="h-24 text-lg" variant="secondary">📏 Growth</Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Recent Activity</CardTitle>
                </CardHeader>
                <CardContent>
                    {recordsLoading ? (
                        <div>Loading records...</div>
                    ) : records && records.length > 0 ? (
                        <ul className="space-y-4">
                            {records.map((record: any) => (
                                <li key={record.id} className="flex justify-between items-center border-b pb-2 last:border-0">
                                    <div>
                                        <span className="font-semibold capitalize">{record.type}</span>
                                        <span className="text-gray-500 text-sm ml-2">
                                            {new Date(record.timestamp).toLocaleString()}
                                        </span>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-gray-500">No records yet.</p>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
