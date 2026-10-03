import re

file_path = "components/GlobalFXPortal.tsx"
with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# Replace the promotional text with institutional text
content = content.replace(
    '0.0 Pip&apos;ten başlayan ham spreadler, 1:2000 kademeli dinamik kaldıraç, 0 saniye anında para çekme ve hafta sonu kesintisiz 7/24 sentetik endeksler.',
    'Kurumsal Seviye Derinlik, Gelişmiş Emir İletimi (STP/ECN), Gerçek Zamanlı Likidite ve Global Piyasalar.'
)
content = content.replace(
    'Küresel ECN & 7/24 Piyasalar Hub\'ı',
    'Global Piyasalar İşlem Terminali'
)
content = content.replace(
    'MİKRO SERMAYE',
    'INSTITUTIONAL'
)
content = content.replace(
    '1:2000 Flash Scalp',
    'Advanced Scalping'
)
content = content.replace(
    '1:2000 <span className="text-xs font-normal text-gray-400">Kaldıraç</span>',
    'FIX API <span className="text-xs font-normal text-gray-400">Bağlantısı</span>'
)
content = content.replace(
    '<li>✓ $5 ile Büyük Pozisyon</li>',
    '<li>✓ Kurumsal Likidite Sağlayıcıları</li>'
)
content = content.replace(
    '<li>✓ Profesyonel Hızlı Scalp Emirleri</li>',
    '<li>✓ DMA (Direct Market Access)</li>'
)
content = content.replace(
    'Prop Challenge',
    'Portföy Yönetimi'
)
content = content.replace(
    'YETENEK AVI',
    'WEALTH MANAGEMENT'
)
content = content.replace(
    '$100K <span className="text-xs font-normal text-gray-400">Yönetilen</span>',
    'PAMM / MAM <span className="text-xs font-normal text-gray-400">Hesaplar</span>'
)
content = content.replace(
    '<li>✓ Hedef: %10 Kâr</li>',
    '<li>✓ Gerçek Zamanlı Risk Analizi</li>'
)
content = content.replace(
    '<li>✓ Kâr Paylaşımı %80 Senin</li>',
    '<li>✓ Otomatik Dağıtım Mekanizması</li>'
)
content = content.replace(
    'Sınava Katıl',
    'Yönetime Başla'
)

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)
