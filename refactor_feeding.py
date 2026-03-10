import re

file_path = 'frontend/components/feeding/feeding-form.tsx'

with open(file_path, 'r') as f:
    content = f.read()

# Add import
import_statement = 'import { BOTTLE_CONTENT_TYPES, FEEDING_COMPLETIONS } from "@/constants/feeding"\n'
content = import_statement + content

# Replace Bottle Content Types array
bottle_pattern = r'\{\(\[\s*\{ value: "FORMULA" as BottleContentType, label: "粉ミルク" \},\s*\{ value: "EXPRESSED_MILK" as BottleContentType, label: "搾母乳" \},\s*\{ value: "MIXED" as BottleContentType, label: "混合" \},\s*\] as const\)\.map'
bottle_replacement = '{BOTTLE_CONTENT_TYPES.map'
content = re.sub(bottle_pattern, bottle_replacement, content)

# Replace Feeding Completions array
completion_pattern = r'\{\(\[\s*\{ value: "FULL" as FeedingCompletion, label: "しっかり飲んだ" \},\s*\{ value: "PARTIAL" as FeedingCompletion, label: "途中でやめた" \},\s*\] as const\)\.map'
completion_replacement = '{FEEDING_COMPLETIONS.map'
content = re.sub(completion_pattern, completion_replacement, content)

with open(file_path, 'w') as f:
    f.write(content)
