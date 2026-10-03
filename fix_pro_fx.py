import re
file_path = "components/ProFXTerminal.tsx"
with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

content = content.replace(
    '1:2000 Kaldıraç • Boom/Crash • Arbitraj • Prop',
    'Institutional ECN • Direct Market Access • Zero Spread'
)

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)
