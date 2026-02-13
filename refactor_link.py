import re

with open("frontend/app/(dashboard)/page.tsx", "r") as f:
    content = f.read()

pattern = r'<a href="/contraction" className="block">\s*<button className="([^"]+)">\s*🤰 陣痛タイマー\s*</button>\s*</a>'
replacement = r'<Link href="/contraction" className="\1 flex items-center justify-center">\n                        🤰 陣痛タイマー\n                    </Link>'

new_content = re.sub(pattern, replacement, content)

with open("frontend/app/(dashboard)/page.tsx", "w") as f:
    f.write(new_content)
