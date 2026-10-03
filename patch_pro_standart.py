import re

file_path = "components/GlobalFXPortal.tsx"
with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

content = content.replace(
    'Pro Standart',
    'ECN / STP'
)
content = content.replace(
    'SIFIR KOMİSYON',
    'INTERBANK LIKIDITE'
)
content = content.replace(
    '0.7 <span className="text-xs font-normal text-gray-400">pip&apos;ten</span>',
    '0.0 <span className="text-xs font-normal text-gray-400">pip\'ten (Raw)</span>'
)
content = content.replace(
    '<li>✓ Sıfır Komisyon ($0)</li>',
    '<li>✓ Derinlikli Piyasa (DoM)</li>'
)
content = content.replace(
    '<li>✓ Kaldıraç: 1:1000</li>',
    '<li>✓ Gecikmesiz Emir İletimi</li>'
)
content = content.replace(
    '<li>✓ Anında Para Yatırma</li>',
    '<li>✓ Kurumsal Seviye Veri API</li>'
)
content = content.replace(
    'Hesapla Başla',
    'Terminale Geçiş Yap'
)

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)
