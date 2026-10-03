import re

file_path = "components/MonteCarloSlotGame.tsx"
with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# Fix the arrays referencing old symbols
content = content.replace("['seven', 'wild', 'diamond']", "['scorching_seven', 'wild', 'diamond']")
content = content.replace("['wild', 'diamond', 'seven']", "['wild', 'diamond', 'scorching_seven']")
content = content.replace("['diamond', 'seven', 'wild']", "['diamond', 'scorching_seven', 'wild']")

content = content.replace("['seven', 'wild', 'strawberry', 'diamond']", "['scorching_seven', 'wild', 'diamond', 'seven']")
content = content.replace("['gold', 'watermelon', 'pineapple', 'seven', 'strawberry', 'grapes', 'wild', 'diamond', 'gold', 'watermelon', 'pineapple', 'seven', 'strawberry', 'grapes', 'wild', 'diamond']", "['double_bar', 'bar', 'bell', 'scorching_seven', 'cherry', 'diamond', 'wild', 'seven', 'double_bar', 'bar', 'bell', 'scorching_seven', 'cherry', 'diamond', 'wild', 'seven']")
content = content.replace("['diamond', 'wild', 'seven']", "['diamond', 'wild', 'scorching_seven']")

# Now completely upgrade the design
# Header
old_header = """<div className="flex justify-between items-center bg-[#0a0514] border-b border-amber-500/20 px-4 sm:px-6 py-3 sm:py-4 shrink-0">"""
new_header = """<div className="flex justify-between items-center bg-gradient-to-b from-[#3a0808] to-[#1a0000] border-b-4 border-yellow-600 px-4 sm:px-6 py-3 sm:py-4 shrink-0 shadow-[0_10px_20px_rgba(0,0,0,0.8)] z-10 relative">"""
content = content.replace(old_header, new_header)

# Title
old_title = """<span className="font-serif font-black tracking-wider bg-clip-text text-transparent bg-gradient-to-b from-amber-200 to-amber-500 drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]">
              ÇİLEK & ANANAS VIP SLOTS
            </span>"""
new_title = """<span className="font-serif font-black tracking-wider bg-clip-text text-transparent bg-gradient-to-b from-yellow-200 via-yellow-500 to-yellow-700 drop-shadow-[0_2px_5px_rgba(0,0,0,1)] uppercase" style={{ WebkitTextStroke: '1px #b45309' }}>
              Double Jackpot SCORCHING 777
            </span>"""
content = content.replace(old_title, new_title)

# Main container
old_container = """<div className="relative w-full h-full sm:w-[98vw] sm:h-[98vh] max-w-none max-h-none bg-gradient-to-b from-[#110a22] via-[#0a0514] to-[#05030a] sm:border-2 border-amber-500/40 sm:rounded-2xl overflow-hidden flex flex-col my-auto shadow-[0_0_50px_rgba(245,158,11,0.15)]">"""
new_container = """<div className="relative w-full h-full sm:w-[98vw] sm:h-[98vh] max-w-none max-h-none bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-[#0a0000] sm:border-[6px] border-yellow-600 sm:rounded-3xl overflow-hidden flex flex-col my-auto shadow-[0_0_80px_rgba(220,38,38,0.4)]">
        <div className="absolute inset-0 bg-gradient-to-b from-red-900/40 via-black/80 to-black/90 pointer-events-none"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-red-600/10 via-transparent to-red-600/10 pointer-events-none"></div>
"""
content = content.replace(old_container, new_container)

# Machine Box Background
old_machine_bg = """<div className="bg-[#0284c7] p-8 sm:p-12 border-t-8 border-b-8 border-r-[16px] border-l-[16px] border-[#140c24] rounded-sm relative shadow-2xl flex items-center justify-center min-h-[300px] sm:min-h-[450px]">"""
new_machine_bg = """<div className="bg-gradient-to-b from-[#2a0404] via-[#110000] to-[#2a0404] p-4 sm:p-12 border-t-[12px] border-b-[16px] border-x-[20px] border-yellow-600 rounded-lg relative shadow-[0_0_50px_inset_rgba(0,0,0,0.9)] flex items-center justify-center min-h-[300px] sm:min-h-[450px]" style={{ boxShadow: '0 0 0 4px #000, inset 0 0 20px #000' }}>
              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/brushed-alum.png')] opacity-10 pointer-events-none"></div>"""
content = content.replace(old_machine_bg, new_machine_bg)

# Reel columns
old_reel = """<div key={`reel-${cIdx}`} className="flex-1 bg-white border-r-2 border-l-2 border-gray-400 relative overflow-hidden h-[240px] sm:h-[350px] shadow-inner">"""
new_reel = """<div key={`reel-${cIdx}`} className="flex-1 bg-gradient-to-b from-gray-300 via-white to-gray-400 border-x-4 border-[#333] relative overflow-hidden h-[240px] sm:h-[350px] shadow-[inset_0_20px_30px_rgba(0,0,0,0.6),inset_0_-20px_30px_rgba(0,0,0,0.6)] rounded-sm">"""
content = content.replace(old_reel, new_reel)

# The individual symbol boxes
old_sym = """<div key={`cell-${rowIdx}-${cIdx}`} className={`flex-1 flex items-center justify-center relative p-2 ${isWinningCell ? 'bg-amber-300/30' : ''}`}>"""
new_sym = """<div key={`cell-${rowIdx}-${cIdx}`} className={`flex-1 flex items-center justify-center relative p-2 ${isWinningCell ? 'bg-yellow-400/40 animate-pulse' : ''} border-b border-gray-300/30`}>"""
content = content.replace(old_sym, new_sym)

# The text format inside the symbol
old_sym_text = """<div className="text-5xl sm:text-7xl drop-shadow-xl z-10 filter hover:brightness-110 transition-all">"""
new_sym_text = """<div className="text-6xl sm:text-[90px] drop-shadow-[0_10px_10px_rgba(0,0,0,0.5)] z-10 flex flex-col items-center">"""
content = content.replace(old_sym_text, new_sym_text)

# We need to map the icon to custom HTML for BAR, 777 etc.
old_sym_icon = """{sym?.icon}"""
new_sym_icon = """
{sym?.id === 'scorching_seven' ? <span className="font-serif font-black text-red-600 drop-shadow-[0_0_15px_rgba(220,38,38,0.8)]" style={{WebkitTextStroke: '3px #fde047'}}>777</span> :
sym?.id === 'seven' ? <span className="font-serif font-black text-red-500 drop-shadow-lg" style={{WebkitTextStroke: '2px #000'}}>7</span> :
sym?.id === 'wild' ? <span className="font-sans font-black text-transparent bg-clip-text bg-gradient-to-b from-yellow-200 to-yellow-600 drop-shadow-[0_0_10px_rgba(202,138,4,1)] text-[40px] sm:text-[60px]" style={{WebkitTextStroke: '1px #000'}}>DOUBLE<br/><span className="text-red-600" style={{WebkitTextStroke: '1px #fff'}}>JACKPOT</span></span> :
sym?.id === 'bar' ? <div className="bg-gradient-to-b from-gray-700 to-black text-white px-4 py-2 font-black border-4 border-gray-400 rounded-sm text-3xl sm:text-5xl shadow-xl uppercase">BAR</div> :
sym?.id === 'double_bar' ? <div className="flex flex-col gap-1"><div className="bg-gradient-to-b from-yellow-600 to-yellow-800 text-white px-4 py-1 font-black border-2 border-yellow-300 rounded-sm text-2xl sm:text-4xl shadow-xl uppercase">BAR</div><div className="bg-gradient-to-b from-yellow-600 to-yellow-800 text-white px-4 py-1 font-black border-2 border-yellow-300 rounded-sm text-2xl sm:text-4xl shadow-xl uppercase">BAR</div></div> :
sym?.icon}
"""
content = content.replace(old_sym_icon, new_sym_icon)

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)

print("UI updated.")
