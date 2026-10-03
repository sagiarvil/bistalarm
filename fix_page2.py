import re

file_path = "app/page.tsx"
with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

content = re.sub(r'onOpenCrash=\{\(\) => \{.*?\}\}', 'onOpenCrash={() => {}}', content, flags=re.DOTALL)
content = re.sub(r'onOpenMines=\{\(\) => \{.*?\}\}', 'onOpenMines={() => {}}', content, flags=re.DOTALL)

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)
