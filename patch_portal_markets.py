import re

file_path = "components/GlobalFXPortal.tsx"
with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# Fix marquee and getSymbolsByCategory
content = re.sub(
    r"const marqueeSymbols = \[.*?\];",
    "const marqueeSymbols = ['EURUSD', 'GBPUSD', 'USDJPY', 'XAUUSDX', 'XAGUSD', 'BRENT.c', 'NASDAQ.j', 'SPX500.j', 'BIST30', 'BTCUSD', 'ETHUSD'];",
    content
)

content = content.replace("case 'SYNTHETIC':", "// case 'SYNTHETIC':")
content = content.replace("return ['BOOM1000', 'CRASH500', 'VOLATILITY75', 'ARB-USDT'];", "// return")
content = content.replace("'POPULAR' | 'FOREX' | 'INDICES' | 'METALS' | 'CRYPTO' | 'SYNTHETIC'", "'POPULAR' | 'FOREX' | 'INDICES' | 'METALS' | 'CRYPTO'")
content = content.replace("'BOOM1000', 'CRASH500', 'ARB-USDT'", "'GBPUSD', 'XAGUSD', 'ETHUSD'")
content = content.replace("<button\n                  onClick={() => setMarketTab('SYNTHETIC')}", "{/* <button\n                  onClick={() => setMarketTab('SYNTHETIC')}")
content = content.replace("<span>⚡</span> Sentetikler\n                </button>", "<span>⚡</span> Sentetikler\n                </button> */}")

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)
