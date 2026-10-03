import re

file_path = "lib/winnersDataset.ts"
with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# Replace CASINO_GAMES_POOL
old_games = """export const CASINO_GAMES_POOL = [
  {
    "game": "Çilek VIP 777 Slot",
    "icon": "🍓",
    "badge": "JACKPOT",
    "minM": 150,
    "maxM": 1000
  },
  {
    "game": "Çilek & Ananas VIP 777",
    "icon": "🍍",
    "badge": "JACKPOT",
    "minM": 200,
    "maxM": 1200
  },
  {
    "game": "Rocket Crash Aviator",
    "icon": "🚀",
    "badge": "EPIC",
    "minM": 15,
    "maxM": 180
  },
  {
    "game": "Altın Mayın (Mines)",
    "icon": "💣",
    "badge": "MEGA",
    "minM": 5,
    "maxM": 50
  },
  {
    "game": "Kripto Barbut (Dice)",
    "icon": "🎲",
    "badge": "MEGA",
    "minM": 2,
    "maxM": 99
  }
];"""

new_games = """export const CASINO_GAMES_POOL = [
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
];"""

content = content.replace(old_games, new_games)

# Also clear the hardcoded WINNERS_SCENARIOS_500 which might have old strings. We will just generate it dynamically.
old_scenarios_pattern = r'export const WINNERS_SCENARIOS_500: WinnerItem\[\] = \[.*?\];'
new_scenarios = """export const WINNERS_SCENARIOS_500: WinnerItem[] = Array.from({ length: 50 }, (_, i) => {
  const game = CASINO_GAMES_POOL[i % CASINO_GAMES_POOL.length];
  const mult = Math.floor(game.minM + Math.random() * (game.maxM - game.minM));
  const bet = [100, 200, 500, 1000][Math.floor(Math.random() * 4)];
  return {
    id: `w-${i}-${Date.now()}`,
    user: MASKED_TURKISH_NAMES_500[i % MASKED_TURKISH_NAMES_500.length],
    avatar: AVATARS_POOL[i % AVATARS_POOL.length],
    game: game.game,
    icon: game.icon,
    amount: bet * mult,
    multiplier: `${mult}x`,
    timeAgo: "Az önce",
    badge: game.badge as any
  };
});"""

content = re.sub(old_scenarios_pattern, new_scenarios, content, flags=re.DOTALL)

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)

