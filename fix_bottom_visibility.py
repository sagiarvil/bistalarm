import re

file_path = "components/MonteCarloSlotGame.tsx"
with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# Fix the main background gradient to not be completely pitch black at the bottom
content = content.replace(
    'bg-gradient-to-b from-red-900/40 via-black/80 to-black/90',
    'bg-gradient-to-b from-red-950/40 via-[#1a0505]/60 to-[#0a0000]/80'
)

# Fix Son Kazanç bar
old_son_kazanc = """<div className="flex items-center justify-between px-3 py-1.5 bg-[#110202] border border-[#d4af37]/50 shadow-[inset_0_0_15px_rgba(0,0,0,0.8)] rounded-lg font-mono text-[11px] shrink-0">
            <div className="flex items-center gap-2">
              <span className="text-gray-400">Son Kazanç:</span>
              <span className={`font-bold text-xs ${lastWin > 0 ? 'text-emerald-400' : 'text-gray-500'}`}>"""
new_son_kazanc = """<div className="flex items-center justify-between px-4 py-2 bg-gradient-to-b from-zinc-800 to-zinc-950 border border-[#d4af37]/80 shadow-[0_5px_15px_rgba(0,0,0,0.5)] rounded-lg font-mono text-[11px] sm:text-sm shrink-0">
            <div className="flex items-center gap-2">
              <span className="text-amber-200 font-bold drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">Son Kazanç:</span>
              <span className={`font-black text-sm sm:text-base drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] ${lastWin > 0 ? 'text-emerald-400' : 'text-white'}`}>"""
content = content.replace(old_son_kazanc, new_son_kazanc)

# Fix Bahis label and container
content = content.replace(
    '<span className="text-[10px] font-bold text-gray-400 font-mono uppercase">BAHİS:</span>',
    '<span className="text-xs font-black text-amber-200 font-mono uppercase drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]">BAHİS:</span>'
)
content = content.replace(
    'bg-black/60 p-1 rounded-lg border border-[#d4af37]/40 shadow-[inset_0_2px_5px_rgba(0,0,0,0.8)]',
    'bg-zinc-900/90 p-1.5 rounded-lg border border-[#d4af37]/80 shadow-[0_2px_10px_rgba(0,0,0,0.5)]'
)

# Fix bet buttons
content = content.replace(
    "text-[#d4af37]/60 hover:text-[#d4af37] hover:bg-white/5",
    "text-amber-200 hover:text-white hover:bg-white/10"
)

# Fix Auto-Spin button
content = content.replace(
    "'bg-[#2a0808] text-[#d4af37] border-[#d4af37]/40 hover:bg-[#3d0b0b]'",
    "'bg-gradient-to-b from-zinc-700 to-zinc-900 text-amber-300 font-bold border-[#d4af37]/60 hover:from-zinc-600 hover:to-zinc-800 shadow-[0_4px_10px_rgba(0,0,0,0.5)]'"
)

# Fix Hash text
content = content.replace(
    'text-gray-500 font-mono',
    'text-amber-100/70 font-mono font-bold drop-shadow-[0_2px_2px_rgba(0,0,0,1)] text-[10px]'
)

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)
