import re

with open('lib/monteCarloEngine.ts', 'r', encoding='utf-8') as f:
    content = f.read()

# Replace Math.random() * 100 with the dynamic total weight
old_code = """  const getRandomSymbol = () => {
    const rand = Math.random() * 100;
    let acc = 0;
    for (const s of SLOT_SYMBOLS) {
      acc += s.weight;
      if (rand <= acc) return s.id;
    }
    return SLOT_SYMBOLS[0].id;
  };"""

new_code = """  const getRandomSymbol = () => {
    const totalWeight = SLOT_SYMBOLS.reduce((sum, s) => sum + s.weight, 0);
    const rand = Math.random() * totalWeight;
    let acc = 0;
    for (const s of SLOT_SYMBOLS) {
      acc += s.weight;
      if (rand <= acc) return s.id;
    }
    return SLOT_SYMBOLS[0].id;
  };"""

if old_code in content:
    content = content.replace(old_code, new_code)
    with open('lib/monteCarloEngine.ts', 'w', encoding='utf-8') as f:
        f.write(content)
    print("Fixed getRandomSymbol loop parameter.")
else:
    print("Could not find the code block to replace.")
