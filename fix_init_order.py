file_path = "lib/winnersDataset.ts"
with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# Just rip out AVATARS_POOL and put it near the top
import re
content = re.sub(r'export const AVATARS_POOL = \[.*?\];', '', content, flags=re.DOTALL)

avatars = """export const AVATARS_POOL = [
  "🧛‍♂️", "🤵‍♂️", "🤴", "🦁", "🐉", "🦅", "🐺", "🐅", "🦈", "🦍", "🥷", "🧙‍♂️", "🧛", "👽", "🤖", "👻"
];
"""

# Put it right after MASKED_TURKISH_NAMES_500
idx = content.find("export const MASKED_TURKISH_NAMES_500")
# find the end of MASKED_TURKISH_NAMES_500 array
idx_end = content.find("];", idx) + 2

content = content[:idx_end] + "\n\n" + avatars + content[idx_end:]

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)
