import re

file_path = 'frontend/components/feeding/feeding-form.tsx'

with open(file_path, 'r') as f:
    content = f.read()

# Add import
import_hook = 'import { useFeedingTimer } from "@/hooks/useFeedingTimer"'
if import_hook not in content:
    content = content.replace('import { Button }', f'{import_hook}\nimport {{ Button }}')

# Remove ActiveBreastSide type definition if present
content = re.sub(r'type ActiveBreastSide = "LEFT" \| "RIGHT" \| null\s*', '', content)

# Find the start of the component
start_marker = 'export function FeedingForm({ babyId, onAdd, onUpdate, initialData, onSuccess, lastMilkAmount }: FeedingFormProps) {'
end_marker = 'const form = useForm<FeedingFormValues>({'

# New logic to insert
new_logic = """    const isEditing = !!initialData
    const [activeTab, setActiveTab] = useState<FeedingType>(initialData?.feeding_type ?? "BREAST")
    const [isSubmitting, setIsSubmitting] = useState(false)

    // 左右独立タイマー (Hooks)
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
    })

    // Phase 2: ボトルコンテンツタイプ・授乳完全度
    const [bottleContentType, setBottleContentType] = useState<BottleContentType | null>(initialData?.bottle_content_type ?? null)
    const [feedingCompletion, setFeedingCompletion] = useState<FeedingCompletion | null>(initialData?.feeding_completion ?? null)
"""

# Replace the state definitions
pattern = r'const isEditing = !!initialData[\s\S]*?const \[feedingCompletion, setFeedingCompletion\] = useState<FeedingCompletion \| null>\(initialData\?\.feeding_completion \?\? null\)'
match = re.search(pattern, content)
if match:
    content = content.replace(match.group(0), new_logic)

# Remove the interval useEffect
interval_effect_pattern = r'// タイマーインターバル\s+useEffect\(\(\) => \{[\s\S]*?\}, \[activeBreastSide, form\]\)'
content = re.sub(interval_effect_pattern, '', content)

# Remove timer helper functions
helpers_pattern = r'const startTimer = \(side: "LEFT" \| "RIGHT"\) => \{[\s\S]*?const totalSeconds = leftSeconds \+ rightSeconds'
content = re.sub(helpers_pattern, '', content)

# Add syncing useEffects after form definition
form_def_pattern = r'const form = useForm<FeedingFormValues>(\{[\s\S]*?\}\)'
sync_effects = """    // タイマーの値をフォームと同期
    useEffect(() => {
        form.setValue("left_breast_minutes", Math.ceil(leftSeconds / 60))
    }, [leftSeconds, form])

    useEffect(() => {
        form.setValue("right_breast_minutes", Math.ceil(rightSeconds / 60))
    }, [rightSeconds, form])"""

match = re.search(form_def_pattern, content)
if match:
    # Insert sync effects after form definition
    insert_pos = match.end()
    content = content[:insert_pos] + '\n\n' + sync_effects + content[insert_pos:]

# Remove unused imports (simple heuristic)
content = content.replace('useRef, ', '')

with open(file_path, 'w') as f:
    f.write(content)

print("Refactoring complete.")
