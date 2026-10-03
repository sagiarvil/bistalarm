import re

file_path = "components/MonteCarloSlotGame.tsx"
with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

render_function = """
  const renderSymbol = (sym: any) => {
    // Elegant, glowing CSS styling for emojis instead of plain text
    return (
      <div className="relative flex items-center justify-center w-full h-full">
        {/* Glow behind the symbol */}
        <div className="absolute inset-0 bg-yellow-400/10 blur-xl rounded-full"></div>
        {/* Inner symbol styling */}
        <span className="text-6xl sm:text-8xl drop-shadow-[0_10px_15px_rgba(0,0,0,0.7)] z-10 hover:scale-110 transition-transform duration-300" style={{ textShadow: '0 5px 10px rgba(0,0,0,0.6), 0 0 40px rgba(255,215,0,0.4)' }}>
          {sym.icon}
        </span>
      </div>
    );
  };
"""

# Insert render_function just before `useEffect(() => {`
if "const renderSymbol" not in content:
    content = content.replace('useEffect(() => {', render_function + '\n  useEffect(() => {', 1)

# Replace `{sym.icon}` with `{renderSymbol(sym)}` inside the reel rendering
# and remove the text-5xl sm:text-7xl wrappers since the renderSymbol handles it
content = re.sub(r'<span className="text-5xl sm:text-7xl[^>]*>\s*\{sym.icon\}\s*</span>', '{renderSymbol(sym)}', content)

# Change reel background
content = content.replace(
    'bg-gradient-to-b from-[#e8e6df] via-white to-[#e8e6df] border-x-[8px] border-[#d4af37] rounded-sm relative overflow-hidden shadow-[inset_0_0_30px_rgba(0,0,0,0.4)]',
    'bg-gradient-to-b from-[#cfc3ad] via-[#f7f2e1] to-[#cfc3ad] border-x-[2px] border-black/80 rounded-sm relative overflow-hidden shadow-[inset_0_0_60px_rgba(0,0,0,0.9),inset_0_0_20px_rgba(0,0,0,0.6)]'
)

# Fix lever styling
old_lever = """<div className={`w-7 h-7 rounded-full  border-2 border-yellow-200  transition-transform duration-300 ${
                  leverPulling ? 'translate-y-12 scale-90' : 'group-hover:scale-110'
                }`}>
                </div>"""
new_lever = """<div className={`w-10 h-10 rounded-full bg-gradient-to-tr from-red-800 via-red-500 to-red-400 border-2 border-red-950 shadow-[inset_-4px_-4px_10px_rgba(0,0,0,0.5),0_10px_20px_rgba(0,0,0,0.6)] transition-transform duration-300 ${
                  leverPulling ? 'translate-y-16 scale-90' : 'group-hover:scale-110'
                }`}>
                  {/* Gloss highlight */}
                  <div className="absolute top-1 left-2 w-4 h-2 bg-white/40 rounded-full rotate-45 blur-[1px]"></div>
                </div>"""
content = content.replace(old_lever, new_lever)

old_stick = """<div className={`w-2.5  rounded-full border border-zinc-600 shadow-inner transition-all duration-300 ${
                  leverPulling ? 'h-8 mt-0.5' : 'h-16'
                }`}>
                </div>"""
new_stick = """<div className={`w-3.5 bg-gradient-to-r from-zinc-400 via-zinc-200 to-zinc-500 rounded-full border border-zinc-800 shadow-[inset_2px_0_5px_rgba(255,255,255,0.8),inset_-2px_0_5px_rgba(0,0,0,0.6)] transition-all duration-300 ${
                  leverPulling ? 'h-8 mt-0.5' : 'h-24'
                }`}>
                </div>"""
content = content.replace(old_stick, new_stick)

old_base = """<div className="w-5 h-5 rounded-md bg-zinc-800 border border-amber-500/60 shadow flex items-center justify-center text-[9px] text-amber-300">
                  ⚙️
                </div>"""
new_base = """<div className="w-8 h-8 rounded-lg bg-gradient-to-br from-zinc-900 to-zinc-700 border-2 border-amber-600/80 shadow-[0_5px_15px_rgba(0,0,0,0.8)] flex items-center justify-center text-[11px] text-amber-400">
                  ⚙️
                </div>"""
content = content.replace(old_base, new_base)

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)
