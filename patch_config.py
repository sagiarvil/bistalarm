import re

with open('lib/monteCarloEngine.ts', 'r', encoding='utf-8') as f:
    content = f.read()

# Update the default config to reset cash and set pure Caesars parameters
old_config = """export let currentCasinoConfig: CasinoEngineConfig = {
  rtpPercent: 99.9,
  penetrationMode: 'SOCIAL_CASINO_AI',
  volatility: 'LOW',
  forcedJackpotPending: false,
  totalSpins: 1420,
  totalWagered: 142000,
  totalPayout: 185610,
  consecutiveLosses: 0,
  playerBalance: 1000,
  playerInitialBalance: 1000,
  globalWinRateTarget: -1, // Kasa serbest (Monte Carlo/Caesars standart motoru)
  userWinRateTargets: {}
};"""

new_config = """export let currentCasinoConfig: CasinoEngineConfig = {
  rtpPercent: 85.0, // Safkan Caesars RTP (%85)
  penetrationMode: 'HOUSE_EDGE', // Kasa odaklı Brutal Mod
  volatility: 'EXTREME',
  forcedJackpotPending: false,
  totalSpins: 0,
  totalWagered: 0,
  totalPayout: 0,
  consecutiveLosses: 0,
  playerBalance: 1000,
  playerInitialBalance: 1000,
  globalWinRateTarget: -1,
  userWinRateTargets: {}
};"""

if old_config in content:
    content = content.replace(old_config, new_config)
    
# Also clear the localStorage prefix so it resets for all clients
old_load = "const saved = localStorage.getItem('mt5_casino_config_v4');"
new_load = "const saved = localStorage.getItem('mt5_casino_config_v5_pure_caesars');"
content = content.replace(old_load, new_load)

old_save = "localStorage.setItem('mt5_casino_config_v4', JSON.stringify(currentCasinoConfig));"
new_save = "localStorage.setItem('mt5_casino_config_v5_pure_caesars', JSON.stringify(currentCasinoConfig));"
content = content.replace(old_save, new_save)

with open('lib/monteCarloEngine.ts', 'w', encoding='utf-8') as f:
    f.write(content)

print("Config and cash reset patched.")
