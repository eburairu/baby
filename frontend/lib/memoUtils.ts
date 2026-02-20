import { BabyRecord } from '@/hooks/useData'
import { isToday } from '@/lib/ageUtils'

/**
 * Compares two arrays of BabyRecords to determine if they are effectively equal for a specific record type.
 * This is used for React.memo to prevent unnecessary re-renders of dashboard widgets.
 */
export function areRecordsEqual(prevRecords: BabyRecord[] | undefined, nextRecords: BabyRecord[] | undefined, type: string): boolean {
  if (prevRecords === nextRecords) return true

  const prev = prevRecords ?? []
  const next = nextRecords ?? []

  // Filter only relevant records
  const prevTarget = prev.filter(r => r.type === type)
  const nextTarget = next.filter(r => r.type === type)

  // Quick check: length
  if (prevTarget.length !== nextTarget.length) return false

  // Detailed check
  for (let i = 0; i < prevTarget.length; i++) {
    const p = prevTarget[i]
    const n = nextTarget[i]

    // ID and timestamp must match
    if (p.id !== n.id) return false
    if (p.timestamp !== n.timestamp) return false

    // Check details deeply for ALL records to ensure correctness.
    // Even if historical records change (e.g., editing notes or amounts), the widget should reflect the new state.
    // Performance impact is negligible for typical list sizes on dashboard.
    if (JSON.stringify(p.details) !== JSON.stringify(n.details)) return false
  }

  return true
}
