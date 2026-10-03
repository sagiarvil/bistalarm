import re

file_path = "app/page.tsx"
with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

content = re.sub(r"import NextGenArcadeHubModal from '@\/components\/NextGenArcadeHubModal';\n", "", content)
content = re.sub(r"<NextGenArcadeHubModal.*?/>\n", "", content, flags=re.DOTALL)
content = content.replace('const [isArcadeHubOpen, setIsArcadeHubOpen] = useState(false);', '')
content = content.replace('onOpenArcadeHub={() => setIsArcadeHubOpen(true)}', '')

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)
