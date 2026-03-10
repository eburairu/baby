import re

file_path = 'frontend/components/feeding/feeding-form.tsx'

with open(file_path, 'r') as f:
    lines = f.readlines()

new_lines = []
import_line = 'import { BOTTLE_CONTENT_TYPES, FEEDING_COMPLETIONS } from "@/constants/feeding"\n'
use_client_found = False

# Remove the incorrectly placed import line first
lines = [line for line in lines if line.strip() != import_line.strip()]

for line in lines:
    new_lines.append(line)
    if '"use client"' in line and not use_client_found:
        new_lines.append('\n')
        new_lines.append(import_line)
        use_client_found = True

with open(file_path, 'w') as f:
    f.writelines(new_lines)
