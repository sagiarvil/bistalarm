import re

file_path = "app/page.tsx"
with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

content = content.replace('onOpenArcade={() => setIsArcadeHubOpen(true)}', '')

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)
