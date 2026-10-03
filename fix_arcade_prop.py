import re

file_path = "components/GlobalFXPortal.tsx"
with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

content = content.replace("onOpenArcadeHub?: () => void;", "")
content = content.replace("onOpenArcadeHub,", "")

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)
