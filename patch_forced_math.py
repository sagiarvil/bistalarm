import re

file_path = "lib/monteCarloEngine.ts"
with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

old_forced_loss = """      // Kesin kaybettir (Boş çark veya Near Miss)
      const isNearMiss = Math.random() < 0.5;
      if (isNearMiss) {
         return {
           grid: [['seven', 'seven', 'lemon'], ['cherry', 'grape', 'plum'], ['plum', 'cherry', 'grape']],
           winningLines: [], totalWin: 0, multiplier: 0, isJackpot: false, serverSeed, clientSeed, nonce
         };
      } else {
         return {
           grid: [['lemon', 'cherry', 'grape'], ['grape', 'plum', 'lemon'], ['cherry', 'lemon', 'plum']],
           winningLines: [], totalWin: 0, multiplier: 0, isJackpot: false, serverSeed, clientSeed, nonce
         };
      }"""

new_forced_loss = """      // Kesin kaybettir (Boş çark veya Near Miss)
      const isNearMiss = Math.random() < 0.5;
      if (isNearMiss) {
         return {
           grid: [['scorching_seven', 'scorching_seven', 'bar'], ['cherry', 'bell', 'double_bar'], ['double_bar', 'cherry', 'bell']],
           winningLines: [], totalWin: 0, multiplier: 0, isJackpot: false, serverSeed, clientSeed, nonce
         };
      } else {
         return {
           grid: [['bar', 'cherry', 'bell'], ['bell', 'double_bar', 'bar'], ['cherry', 'bar', 'double_bar']],
           winningLines: [], totalWin: 0, multiplier: 0, isJackpot: false, serverSeed, clientSeed, nonce
         };
      }"""

content = content.replace(old_forced_loss, new_forced_loss)

# Also fix the 'gold' bug inside willWin logic
old_willwin = """const sym = Math.random() > 0.8 ? 'diamond' : (Math.random() > 0.5 ? 'seven' : 'gold');"""
new_willwin = """const sym = Math.random() > 0.8 ? 'diamond' : (Math.random() > 0.5 ? 'scorching_seven' : 'double_bar');"""
content = content.replace(old_willwin, new_willwin)

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)
print("Forced target math patched.")
