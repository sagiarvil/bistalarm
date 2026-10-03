import re
file_path = "lib/winnersDataset.ts"
with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# Just slice everything after CASINO_GAMES_POOL and rewrite it
idx = content.find("export const CASINO_GAMES_POOL = [")
if idx != -1:
    content = content[:idx] + """export const CASINO_GAMES_POOL = [
  {
    "game": "MONTE CARLO GRAND VIP",
    "icon": "🎰",
    "badge": "GRAND JACKPOT",
    "minM": 150,
    "maxM": 2000
  },
  {
    "game": "EUROPEAN ROULETTE PRO",
    "icon": "🎯",
    "badge": "STRAIGHT UP",
    "minM": 36,
    "maxM": 36
  },
  {
    "game": "VIP BLACKJACK 21",
    "icon": "♠️",
    "badge": "BLACKJACK",
    "minM": 2.5,
    "maxM": 2.5
  },
  {
    "game": "BACCARAT SUPER 6",
    "icon": "🏦",
    "badge": "BANKER WIN",
    "minM": 2,
    "maxM": 8
  },
  {
    "game": "TEXAS HOLD'EM ELITE",
    "icon": "🃏",
    "badge": "ROYAL FLUSH",
    "minM": 100,
    "maxM": 1500
  }
];
"""
    with open(file_path, "w", encoding="utf-8") as f:
        f.write(content)
