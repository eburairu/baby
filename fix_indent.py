import re

filepath = "frontend/components/landing/LandingContent.tsx"
with open(filepath, 'r') as f:
    lines = f.readlines()

new_lines = []
for line in lines:
    # "{/* Floating Notification" で始まる行のインデントを修正
    if "{/* Floating Notification" in line:
        # 周囲のインデントに合わせる (28スペース)
        line = " " * 28 + line.lstrip()
    new_lines.append(line)

with open(filepath, 'w') as f:
    f.writelines(new_lines)

print("Fixed indentation")
