import re

file_path = "components/MonteCarloSlotGame.tsx"
with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

old_button = """<button
                disabled={isSpinning}
                onClick={handleSpin}
                className="flex-1 sm:flex-none px-6 py-3 bg-gradient-to-b from-[#d4af37] to-[#997a15] border border-[#ffdf73] shadow-[0_0_20px_rgba(212,175,55,0.4),inset_0_1px_3px_rgba(255,255,255,0.6)] hover:from-[#ffdf73] hover:to-[#d4af37] text-[#2a0808] font-black text-base sm:text-xl tracking-widest uppercase rounded-xl transition active:scale-95 disabled:opacity-50"
              >
                {isSpinning ? 'ÇEVRİLİYOR...' : '🎰 ÇEVİR (SPIN)'}
              </button>"""

new_button = """<button
                disabled={isSpinning}
                onClick={handleSpin}
                className="relative flex-1 sm:flex-none px-8 py-3 bg-gradient-to-b from-red-600 via-red-700 to-red-900 border-2 border-[#d4af37] shadow-[0_0_30px_rgba(255,0,0,0.6),inset_0_2px_10px_rgba(255,255,255,0.4)] hover:shadow-[0_0_50px_rgba(255,50,50,0.9),inset_0_2px_10px_rgba(255,255,255,0.6)] hover:from-red-500 hover:to-red-800 text-white font-black text-base sm:text-xl tracking-widest uppercase rounded-xl transition-all duration-300 active:scale-95 disabled:opacity-70 disabled:grayscale-[0.5]"
              >
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20 mix-blend-overlay rounded-xl"></div>
                <span className="relative z-10 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                  {isSpinning ? 'ÇEVRİLİYOR...' : '🎰 SPIN'}
                </span>
              </button>"""

content = content.replace(old_button, new_button)

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)
