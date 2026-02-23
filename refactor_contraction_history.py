import re

file_path = "frontend/components/ContractionHistory.tsx"

with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# Add import
import_statement = 'import { formatTimeHHMM, formatSecondsToJapanese } from "@/lib/ageUtils"'
if import_statement not in content:
    content = content.replace('import { api } from "@/lib/api"', f'import {{ api }} from "@/lib/api"\n{import_statement}')

# Remove local formatDuration
content = re.sub(r'function formatDuration\(seconds: number\): string \{[^}]+\}', '', content, flags=re.DOTALL)

# Remove local formatTime
content = re.sub(r'function formatTime\(isoString: string\): string \{[^}]+\}', '', content, flags=re.DOTALL)

# Replace usages
content = content.replace('formatTime(record.start_time)', 'formatTimeHHMM(record.start_time)')
content = content.replace('formatDuration(record.duration_seconds)', 'formatSecondsToJapanese(record.duration_seconds)')
content = content.replace('formatDuration(record.interval_seconds)', 'formatSecondsToJapanese(record.interval_seconds)')

# Clean up extra newlines
content = re.sub(r'\n\s*\n\s*\n', '\n\n', content)

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)

print("Refactoring complete.")
