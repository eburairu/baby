"use client"
import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { NoteDialog } from "./NoteDialog"

interface Props {
  babyId: string
}

export function NoteWidget({ babyId }: Props) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <Card 
        className="dark:bg-zinc-900 rounded-2xl shadow-sm border-0 cursor-pointer hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors"
        onClick={() => setOpen(true)}
      >
        <CardContent className="p-4 flex flex-col items-center justify-center gap-2">
          <span className="text-3xl">📝</span>
          <span className="text-sm font-medium text-gray-700 dark:text-zinc-300">メモ</span>
        </CardContent>
      </Card>
      <NoteDialog babyId={babyId} open={open} onOpenChange={setOpen} />
    </>
  )
}
