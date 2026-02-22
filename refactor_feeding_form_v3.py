import os

file_path = 'frontend/components/feeding/feeding-form.tsx'

with open(file_path, 'r') as f:
    content = f.read()

# 1. Imports
if 'import { useFeedingTimer }' not in content:
    content = content.replace('import { useState, useEffect, useRef, useCallback } from "react"',
                              'import { useState, useEffect, useCallback } from "react"\nimport { useFeedingTimer } from "@/hooks/useFeedingTimer"')
    content = content.replace('import { useState, useEffect, useRef, useCallback }', 'import { useState, useEffect, useCallback }')

# 2. Remove ActiveBreastSide type definition
content = content.replace('type ActiveBreastSide = "LEFT" | "RIGHT" | null\n', '')

# 3. Replace state definitions and refs
old_state_block = """    // 左右独立タイマー
    const [leftSeconds, setLeftSeconds] = useState((initialData?.left_breast_minutes ?? 0) * 60)
    const [rightSeconds, setRightSeconds] = useState((initialData?.right_breast_minutes ?? 0) * 60)
    const [activeBreastSide, setActiveBreastSide] = useState<ActiveBreastSide>(null)
    const leftBaseRef = useRef<number | null>(null)
    const rightBaseRef = useRef<number | null>(null)"""

new_hook_block = """    // 左右独立タイマー (Hooks)
    const {
        leftSeconds,
        rightSeconds,
        setLeftSeconds,
        setRightSeconds,
        activeBreastSide,
        toggleTimer,
        resetAllTimers,
        formatTimer,
        totalSeconds
    } = useFeedingTimer({
        initialLeftMinutes: initialData?.left_breast_minutes ?? 0,
        initialRightMinutes: initialData?.right_breast_minutes ?? 0
    })"""

if old_state_block in content:
    content = content.replace(old_state_block, new_hook_block)
else:
    print("WARNING: Could not find old state block exactly.")

# 4. Remove interval useEffect
old_interval_effect = """    // タイマーインターバル
    useEffect(() => {
        if (activeBreastSide === null) return
        const interval = setInterval(() => {
            const now = Date.now()
            if (activeBreastSide === "LEFT" && leftBaseRef.current !== null) {
                const diff = Math.floor((now - leftBaseRef.current) / 1000)
                setLeftSeconds(diff)
                form.setValue("left_breast_minutes", Math.ceil(diff / 60))
            } else if (activeBreastSide === "RIGHT" && rightBaseRef.current !== null) {
                const diff = Math.floor((now - rightBaseRef.current) / 1000)
                setRightSeconds(diff)
                form.setValue("right_breast_minutes", Math.ceil(diff / 60))
            }
        }, 1000)
        return () => clearInterval(interval)
    }, [activeBreastSide, form])"""

if old_interval_effect in content:
    content = content.replace(old_interval_effect, '')
else:
    print("WARNING: Could not find old interval effect exactly.")

# 5. Add syncing useEffects
anchor = """    // 前回のミルク量をデフォルトとしてセット (SWRで後から読み込まれた場合)
    useEffect(() => {"""

sync_effects = """    // タイマーの値をフォームと同期
    useEffect(() => {
        form.setValue("left_breast_minutes", Math.ceil(leftSeconds / 60))
    }, [leftSeconds, form])

    useEffect(() => {
        form.setValue("right_breast_minutes", Math.ceil(rightSeconds / 60))
    }, [rightSeconds, form])

"""

if anchor in content:
    content = content.replace(anchor, sync_effects + anchor)
else:
    print("WARNING: Could not find anchor for syncing effects.")

# 6. Remove helper functions
old_helpers_start = """    const startTimer = (side: "LEFT" | "RIGHT") => {"""

old_helpers_end = """    const totalSeconds = leftSeconds + rightSeconds"""

start_idx = content.find(old_helpers_start)
end_idx = content.find(old_helpers_end)

if start_idx != -1 and end_idx != -1:
    end_idx += len(old_helpers_end)
    content = content[:start_idx] + content[end_idx:]
else:
    print("WARNING: Could not find helper functions block.")
    if start_idx == -1: print("Start not found")
    if end_idx == -1: print("End not found")

# Cleanup empty lines
while '\n\n\n' in content:
    content = content.replace('\n\n\n', '\n\n')

with open(file_path, 'w') as f:
    f.write(content)

print("Refactoring complete.")
