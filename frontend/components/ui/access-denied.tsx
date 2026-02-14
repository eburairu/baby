"use client"

import { ShieldOff } from "lucide-react"

export function AccessDenied() {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-gray-400 bg-white rounded-2xl shadow-sm border border-gray-100 mx-4">
      <ShieldOff className="w-12 h-12 mb-3 text-gray-300" />
      <p className="text-sm font-medium">この記録は閲覧できません</p>
      <p className="text-xs mt-1 text-gray-400">管理者によってアクセスが制限されています</p>
    </div>
  )
}
