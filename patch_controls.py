import re

file_path = "components/MonteCarloSlotGame.tsx"
with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# Replace the control panel background
old_panel = """<div className="flex flex-col sm:flex-row justify-between items-center bg-[#05030a] border-t border-amber-500/20 px-4 sm:px-6 py-4 shrink-0 gap-4">"""
new_panel = """<div className="flex flex-col sm:flex-row justify-between items-center bg-gradient-to-t from-[#1a0000] to-[#3a0808] border-t-4 border-yellow-600 px-4 sm:px-6 py-4 shrink-0 gap-4 shadow-[0_-10px_20px_rgba(0,0,0,0.8)] relative z-10">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/brushed-alum.png')] opacity-20 pointer-events-none"></div>
"""
content = content.replace(old_panel, new_panel)

# Replace the BET selector buttons
old_bet = """<button onClick={() => setBet(5)} className="px-3 py-1 rounded-lg bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700">$5</button>"""
new_bet = """<button onClick={() => setBet(5)} className="px-4 py-2 rounded shadow-[inset_0_2px_10px_rgba(255,255,255,0.4),0_5px_10px_rgba(0,0,0,0.8)] bg-gradient-to-b from-gray-200 to-gray-400 text-black font-black hover:brightness-110 active:scale-95 border-b-4 border-gray-500 font-sans text-sm sm:text-base">BET<br/>$5</button>"""
content = content.replace(old_bet, new_bet)

old_bet2 = """<button onClick={() => setBet(10)} className="px-3 py-1 rounded-lg bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700">$10</button>"""
new_bet2 = """<button onClick={() => setBet(10)} className="px-4 py-2 rounded shadow-[inset_0_2px_10px_rgba(255,255,255,0.4),0_5px_10px_rgba(0,0,0,0.8)] bg-gradient-to-b from-gray-200 to-gray-400 text-black font-black hover:brightness-110 active:scale-95 border-b-4 border-gray-500 font-sans text-sm sm:text-base">BET<br/>$10</button>"""
content = content.replace(old_bet2, new_bet2)

old_bet3 = """<button onClick={() => setBet(20)} className="px-3 py-1 rounded-lg bg-amber-600 text-white font-bold">$20</button>"""
new_bet3 = """<button onClick={() => setBet(20)} className="px-4 py-2 rounded shadow-[inset_0_2px_10px_rgba(255,255,255,0.4),0_5px_10px_rgba(0,0,0,0.8)] bg-gradient-to-b from-yellow-300 to-yellow-600 text-black font-black hover:brightness-110 active:scale-95 border-b-4 border-yellow-700 font-sans text-sm sm:text-base">BET<br/>$20</button>"""
content = content.replace(old_bet3, new_bet3)

old_bet4 = """<button onClick={() => setBet(50)} className="px-3 py-1 rounded-lg bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700">$50</button>"""
new_bet4 = """<button onClick={() => setBet(50)} className="px-4 py-2 rounded shadow-[inset_0_2px_10px_rgba(255,255,255,0.4),0_5px_10px_rgba(0,0,0,0.8)] bg-gradient-to-b from-gray-200 to-gray-400 text-black font-black hover:brightness-110 active:scale-95 border-b-4 border-gray-500 font-sans text-sm sm:text-base">BET<br/>$50</button>"""
content = content.replace(old_bet4, new_bet4)

old_bet5 = """<button onClick={() => setBet(100)} className="px-3 py-1 rounded-lg bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700">$100</button>"""
new_bet5 = """<button onClick={() => setBet(100)} className="px-4 py-2 rounded shadow-[inset_0_2px_10px_rgba(255,255,255,0.4),0_5px_10px_rgba(0,0,0,0.8)] bg-gradient-to-b from-gray-200 to-gray-400 text-black font-black hover:brightness-110 active:scale-95 border-b-4 border-gray-500 font-sans text-sm sm:text-base">BET<br/>$100</button>"""
content = content.replace(old_bet5, new_bet5)

old_bet6 = """<button onClick={() => setBet(250)} className="px-3 py-1 rounded-lg bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700">$250</button>"""
new_bet6 = """<button onClick={() => setBet(250)} className="px-4 py-2 rounded shadow-[inset_0_2px_10px_rgba(255,255,255,0.4),0_5px_10px_rgba(0,0,0,0.8)] bg-gradient-to-b from-red-400 to-red-600 text-white font-black hover:brightness-110 active:scale-95 border-b-4 border-red-800 font-sans text-sm sm:text-base">BET MAX<br/>$250</button>"""
content = content.replace(old_bet6, new_bet6)

# Replace Auto-Spin button
old_auto = """<button onClick={() => setAutoSpin(!autoSpin)} className={`px-4 py-2 rounded-lg font-bold transition ${autoSpin ? 'bg-amber-600 text-white' : 'bg-[#1a1033] text-gray-400 hover:bg-[#2a1a4a]'}`}>
              ⚙️ Auto-Spin
            </button>"""
new_auto = """<button onClick={() => setAutoSpin(!autoSpin)} className={`px-4 py-3 rounded shadow-[inset_0_2px_10px_rgba(255,255,255,0.4),0_5px_10px_rgba(0,0,0,0.8)] font-sans font-black transition ${autoSpin ? 'bg-gradient-to-b from-yellow-400 to-yellow-600 text-black border-b-4 border-yellow-700' : 'bg-gradient-to-b from-gray-300 to-gray-500 text-black border-b-4 border-gray-600'} hover:brightness-110 active:scale-95 uppercase text-xs sm:text-sm`}>
              Auto<br/>Spin
            </button>"""
content = content.replace(old_auto, new_auto)

# Replace Spin button
old_spin = """<button 
              onClick={handleSpinClick}
              disabled={isSpinning || account.balance < bet}
              className={`px-8 py-3 rounded-lg font-bold text-lg shadow-[0_0_20px_rgba(37,99,235,0.4)] transition-all
                ${(isSpinning || account.balance < bet) ? 'bg-gray-600 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-500 text-white hover:scale-105'}
              `}
            >
              🎰 ÇEVİR (SPIN)
            </button>"""
new_spin = """<button 
              onClick={handleSpinClick}
              disabled={isSpinning || account.balance < bet}
              className={`px-8 py-2 rounded-full font-sans font-black text-2xl sm:text-3xl shadow-[inset_0_2px_20px_rgba(255,255,255,0.6),0_10px_20px_rgba(0,0,0,0.9)] transition-all uppercase leading-tight
                ${(isSpinning || account.balance < bet) ? 'bg-gradient-to-b from-green-900 to-green-950 text-green-700 border-b-[8px] border-green-950 cursor-not-allowed' : 'bg-gradient-to-b from-green-400 to-green-600 text-black hover:brightness-110 active:scale-95 border-b-[8px] border-green-800'}
              `}
            >
              SPIN<br/><span className="text-[10px] sm:text-xs font-normal tracking-widest">Hold for Autospin</span>
            </button>"""
content = content.replace(old_spin, new_spin)

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)

print("Controls updated.")
