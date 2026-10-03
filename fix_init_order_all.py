file_path = "lib/winnersDataset.ts"
with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

import re

# Remove WINNERS_SCENARIOS_500
winners_match = re.search(r'export const WINNERS_SCENARIOS_500: WinnerItem\[\] = Array\.from\(.*?\}\);', content, flags=re.DOTALL)
if winners_match:
    winners_block = winners_match.group(0)
    content = content.replace(winners_block, '')

# Append WINNERS_SCENARIOS_500 to the VERY END of the file
content = content.strip() + "\n\n" + winners_block + "\n"

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)
