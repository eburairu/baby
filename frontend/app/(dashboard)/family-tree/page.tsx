"use client"

import { GitBranch } from "lucide-react"
import { useRecordPage } from "@/hooks/useRecordPage"
import { useRelatives } from "@/hooks/useRelatives"
import { FamilyTreeView } from "@/components/family-tree/FamilyTreeView"
import { RecordPageLayout } from "@/components/ui/record-page-layout"

export default function FamilyTreePage() {
  const { babyId, babies, isLoading: babiesLoading, canWrite } = useRecordPage()

  const { relatives, isLoading, isError, addRelative, updateRelative, deleteRelative } =
    useRelatives(babyId ?? null)

  const baby = babies?.find((b) => String(b.id) === babyId) ?? null

  return (
    <RecordPageLayout
      title="家系図"
      icon={GitBranch}
      iconColorClass="text-rose-500 dark:text-rose-400"
      isLoading={babiesLoading}
      isDataLoading={isLoading}
      apiError={isError}
      babyId={babyId}
    >
      <FamilyTreeView
        relatives={relatives}
        baby={baby}
        canWrite={canWrite}
        onAdd={addRelative}
        onUpdate={updateRelative}
        onDelete={deleteRelative}
      />
    </RecordPageLayout>
  )
}
