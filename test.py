import re
with open('.specify/specs/ui/dashboard.md', 'r') as f:
    text = f.read()
if re.search(r'POST /api/babies/{baby_id}/records', text):
    print("Found")
else:
    print("Not Found")
