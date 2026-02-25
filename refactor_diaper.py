import re

file_path = 'frontend/components/diaper/DiaperForm.tsx'
diaper_constants_path = '@/constants/diaper'

with open(file_path, 'r') as f:
    lines = f.readlines()

new_lines = []
import_added = False

for line in lines:
    # Remove definition lines
    if 'const POOP_COLORS =' in line:
        continue
    if 'const POOP_AMOUNTS =' in line:
        continue

    new_lines.append(line)
    if '"use client"' in line and not import_added:
        new_lines.append('\n')
        new_lines.append(f'import {{ POOP_COLORS, POOP_AMOUNTS }} from "{diaper_constants_path}"\n')
        import_added = True

with open(file_path, 'w') as f:
    f.writelines(new_lines)
