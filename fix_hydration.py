import re
file_path = "lib/winnersDataset.ts"
with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# Replace the WINNERS_SCENARIOS_500 generation with deterministic values
old_winners = re.search(r'export const WINNERS_SCENARIOS_500: WinnerItem\[\] = Array\.from\(.*?\}\);', content, flags=re.DOTALL)
if old_winners:
    new_winners = """export const WINNERS_SCENARIOS_500: WinnerItem[] = Array.from({ length: 50 }, (_, i) => {
  const game = CASINO_GAMES_POOL[i % CASINO_GAMES_POOL.length];
  
  // DETERMINISTIC VALUES FOR SSR HYDRATION MATCH
  // Instead of Math.random(), we use pseudo-random logic based on index 'i'
  const pseudoRandom1 = ((i * 13) % 100) / 100;
  const pseudoRandom2 = ((i * 17) % 100) / 100;
  
  const mult = Math.floor(game.minM + pseudoRandom1 * (game.maxM - game.minM));
  const betOptions = [100, 200, 500, 1000];
  const bet = betOptions[i % 4];
  
  return {
    id: `w-${i}-static`,
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
    content = content.replace(old_winners.group(0), new_winners)
    with open(file_path, "w", encoding="utf-8") as f:
        f.write(content)
