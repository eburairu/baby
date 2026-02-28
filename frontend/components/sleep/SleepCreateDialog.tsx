"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { useSleeps } from "@/hooks/useSleep"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Plus } from "lucide-react"
import { SleepForm } from "./SleepForm"

interface Props {
    babyId: string
}

export function SleepCreateDialog({ babyId }: Props) {
    const { mutate } = useSleeps(babyId)
    const [isOpen, setIsOpen] = useState(false)

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" className="w-full bg-white dark:bg-zinc-900 text-indigo-600 dark:text-indigo-400 border-indigo-100 dark:border-zinc-800 hover:bg-indigo-50 dark:hover:bg-zinc-800 hover:text-indigo-700 dark:hover:text-indigo-300 h-12 rounded-xl shadow-sm transition-colors" data-sentry-unmask>
                    <Plus className="mr-2 h-4 w-4" />
                    手動で記録を追加
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>睡眠記録の手動追加</DialogTitle>
                </DialogHeader>
                <SleepForm
                    babyId={babyId}
                    onSuccess={() => {
                        mutate()
                        setIsOpen(false)
                    }}
                />
            </DialogContent>
        </Dialog>
    )
}
