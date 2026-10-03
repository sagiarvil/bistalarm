import re

with open('components/MonteCarloGrandCasinoModal.tsx', 'r') as f:
    code = f.read()

# Fix MANQUE
code = re.sub(r'onClick=\{\(\) => addRouletteBet\(\'LOW\'\)\}\n\s*className="py-1\s*bg-blue-600 hover:bg-blue-700 border border-emerald-400', 
              r'onClick={() => addRouletteBet(\'LOW\')}\n                  className="py-1 bg-[#06180d] hover:bg-[#0a2615] border border-emerald-400', code)

# Fix PAIR
code = re.sub(r'onClick=\{\(\) => addRouletteBet\(\'EVEN\'\)\}\n\s*className="py-1\s*bg-blue-600 hover:bg-blue-700 border border-emerald-400', 
              r'onClick={() => addRouletteBet(\'EVEN\')}\n                  className="py-1 bg-[#06180d] hover:bg-[#0a2615] border border-emerald-400', code)

# Fix ROUGE
code = re.sub(r'onClick=\{\(\) => addRouletteBet\(\'RED\'\)\}\n\s*className="py-1\s*bg-blue-600 hover:bg-blue-700 border border-rose-400', 
              r'onClick={() => addRouletteBet(\'RED\')}\n                  className="py-1 bg-rose-900 hover:bg-rose-800 border border-rose-400', code)

# Fix NOIR
code = re.sub(r'onClick=\{\(\) => addRouletteBet\(\'BLACK\'\)\}\n\s*className="py-1\s*bg-blue-600 hover:bg-blue-700 border border-zinc-500', 
              r'onClick={() => addRouletteBet(\'BLACK\')}\n                  className="py-1 bg-zinc-900 hover:bg-zinc-800 border border-zinc-500', code)

# Fix IMPAIR
code = re.sub(r'onClick=\{\(\) => addRouletteBet\(\'ODD\'\)\}\n\s*className="py-1\s*bg-blue-600 hover:bg-blue-700 border border-emerald-400', 
              r'onClick={() => addRouletteBet(\'ODD\')}\n                  className="py-1 bg-[#06180d] hover:bg-[#0a2615] border border-emerald-400', code)

# Fix PASSE
code = re.sub(r'onClick=\{\(\) => addRouletteBet\(\'HIGH\'\)\}\n\s*className="py-1\s*bg-blue-600 hover:bg-blue-700 border border-emerald-400', 
              r'onClick={() => addRouletteBet(\'HIGH\')}\n                  className="py-1 bg-[#06180d] hover:bg-[#0a2615] border border-emerald-400', code)

# Fix DOZEN 1
code = re.sub(r'onClick=\{\(\) => addRouletteBet\(\'DOZEN_1\'\)\}\n\s*className="py-1\s*bg-blue-600 hover:bg-blue-700 border border-[#d4af37]\/40', 
              r'onClick={() => addRouletteBet(\'DOZEN_1\')}\n                  className="py-1 bg-[#1a1405] hover:bg-[#2a2008] border border-[#d4af37]/40', code)

# Fix DOZEN 2
code = re.sub(r'onClick=\{\(\) => addRouletteBet\(\'DOZEN_2\'\)\}\n\s*className="py-1\s*bg-blue-600 hover:bg-blue-700 border border-[#d4af37]\/40', 
              r'onClick={() => addRouletteBet(\'DOZEN_2\')}\n                  className="py-1 bg-[#1a1405] hover:bg-[#2a2008] border border-[#d4af37]/40', code)

# Fix DOZEN 3
code = re.sub(r'onClick=\{\(\) => addRouletteBet\(\'DOZEN_3\'\)\}\n\s*className="py-1\s*bg-blue-600 hover:bg-blue-700 border border-[#d4af37]\/40', 
              r'onClick={() => addRouletteBet(\'DOZEN_3\')}\n                  className="py-1 bg-[#1a1405] hover:bg-[#2a2008] border border-[#d4af37]/40', code)

with open('components/MonteCarloGrandCasinoModal.tsx', 'w') as f:
    f.write(code)
