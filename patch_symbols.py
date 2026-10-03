import re

file_path = "lib/monteCarloEngine.ts"
with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# Replace the SLOT_SYMBOLS block
old_symbols = """export const SLOT_SYMBOLS: SlotSymbol[] = [
  { id: 'strawberry', name: 'Çilek', icon: '🍓', payout3: 3, payout4: 8, payout5: 25, weight: 35 },
  { id: 'pineapple', name: 'Ananas', icon: '🍍', payout3: 4, payout4: 12, payout5: 40, weight: 30 },
  { id: 'watermelon', name: 'Karpuz', icon: '🍉', payout3: 5, payout4: 15, payout5: 50, weight: 25 },
  { id: 'grapes', name: 'Üzüm', icon: '🍇', payout3: 6, payout4: 20, payout5: 75, weight: 20 },
  { id: 'gold', name: 'Altın Külçesi', icon: '🥇', payout3: 15, payout4: 50, payout5: 200, weight: 12 },
  { id: 'diamond', name: 'Elmas', icon: '💎', payout3: 25, payout4: 100, payout5: 500, weight: 8 },
  { id: 'seven', name: 'Şanslı 777', icon: '🎰', payout3: 50, payout4: 250, payout5: 1000, weight: 4 },
  { id: 'wild', name: 'Wild Yıldız', icon: '⭐', payout3: 10, payout4: 30, payout5: 150, weight: 10 }
];"""

new_symbols = """export const SLOT_SYMBOLS: SlotSymbol[] = [
  { id: 'cherry', name: 'Cherry', icon: '🍒', payout3: 3, payout4: 8, payout5: 25, weight: 35 },
  { id: 'bell', name: 'Bell', icon: '🔔', payout3: 4, payout4: 12, payout5: 40, weight: 30 },
  { id: 'bar', name: 'BAR', icon: '🍫', payout3: 5, payout4: 15, payout5: 50, weight: 25 },
  { id: 'double_bar', name: 'Double BAR', icon: '💰', payout3: 6, payout4: 20, payout5: 75, weight: 20 },
  { id: 'diamond', name: 'Diamond', icon: '💎', payout3: 15, payout4: 50, payout5: 200, weight: 12 },
  { id: 'seven', name: 'Red 7', icon: '🔴', payout3: 25, payout4: 100, payout5: 500, weight: 8 },
  { id: 'scorching_seven', name: 'Scorching 777', icon: '🔥', payout3: 50, payout4: 250, payout5: 1000, weight: 4 },
  { id: 'wild', name: 'Double Jackpot', icon: '🎰', payout3: 10, payout4: 30, payout5: 150, weight: 10 }
];"""

content = content.replace(old_symbols, new_symbols)

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)

print("Symbols updated.")
