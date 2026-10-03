import re

file_path = "components/GlobalFXPortal.tsx"
with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# Replace the Nova Arcade card and fix the Roulette/Blackjack buttons
# Let's find the section that has the 4 game cards.
start_str = "{/* 1. Vegas Slot (1. SIRA) */}"
end_str = "{/* ================== SİSTEM ve YATIRIM DURUMU ================== */}"

start_idx = content.find(start_str)
end_idx = content.find(end_str)

new_casino_html = """{/* 1. Vegas Slot (1. SIRA) */}
            <div className="bg-[#0b0404] border-2 border-[#d4af37] shadow-[0_0_20px_rgba(212,175,55,0.2)] rounded-2xl p-4 flex flex-col justify-between hover:scale-[1.02] transition-transform">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="bg-gradient-to-r from-red-600 to-red-800 text-white text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">🔥 EN ÇOK TERCİH EDİLEN</span>
                  <span className="text-[#d4af37] text-xl">🎰</span>
                </div>
                <h3 className="text-[#d4af37] font-serif font-bold text-lg leading-tight pt-1">Grand VIP Slot</h3>
                <p className="text-gray-400 text-xs">Caesars RTP Algoritması. Makine başına maksimum kazanç sınırsız. VIP üyelere özel makaralar.</p>
              </div>
              <div className="flex items-center gap-2 pt-4">
                {onOpenCasinoSlot && (
                  <button
                    onClick={onOpenCasinoSlot}
                    className="flex-1 py-2.5 bg-gradient-to-r from-[#d4af37] to-[#aa8011] hover:from-[#e3c155] hover:to-[#d4af37] text-black font-black uppercase tracking-widest rounded-xl text-xs transition shadow-[0_0_15px_rgba(212,175,55,0.4)] active:scale-95"
                  >
                    Makarayı Çevir
                  </button>
                )}
                {onOpenTacticsGuide && (
                  <button
                    onClick={onOpenTacticsGuide}
                    className="p-2.5 bg-black hover:bg-[#1a0505] border border-[#d4af37]/40 text-[#d4af37] rounded-xl text-xs transition"
                    title="VIP Taktikler"
                  >
                    ⚡
                  </button>
                )}
              </div>
            </div>

            {/* 2. Monte Carlo Rulet (2. SIRA) */}
            <div className="bg-[#0a0f0a] border-2 border-emerald-800/40 hover:border-emerald-600/60 rounded-2xl p-4 flex flex-col justify-between hover:scale-[1.02] transition-transform">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="bg-emerald-900/60 text-emerald-400 border border-emerald-700/50 text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">Prive Masa</span>
                  <span className="text-emerald-400 text-xl">🎡</span>
                </div>
                <h3 className="text-white font-serif font-bold text-lg leading-tight pt-1">Avrupa Ruleti (Pro)</h3>
                <p className="text-gray-400 text-xs">Tek sıfırlı klasik Avrupa masası. Gelişmiş istatistikler ve Racetrack (Komşu) bahis paneli.</p>
              </div>
              <div className="flex items-center gap-2 pt-4">
                {onOpenGrandCasino && (
                  <button
                    onClick={() => {
                      if (typeof window !== 'undefined') window.localStorage.setItem('casino_tab', 'ROULETTE');
                      onOpenGrandCasino();
                    }}
                    className="flex-1 py-2.5 bg-emerald-700 hover:bg-emerald-600 text-white font-black uppercase tracking-widest rounded-xl text-xs transition shadow-lg active:scale-95"
                  >
                    Masaya Otur
                  </button>
                )}
              </div>
            </div>

            {/* 3. Monaco VIP Blackjack 21 (3. SIRA) */}
            <div className="bg-[#0f1115] border-2 border-blue-900/40 hover:border-blue-700/60 rounded-2xl p-4 flex flex-col justify-between hover:scale-[1.02] transition-transform">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="bg-blue-900/40 text-blue-400 border border-blue-800/50 text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">Yüksek Limit</span>
                  <span className="text-blue-400 text-xl">♠️</span>
                </div>
                <h3 className="text-white font-serif font-bold text-lg leading-tight pt-1">VIP Blackjack 21</h3>
                <p className="text-gray-400 text-xs">Klasik kurallar, sigorta ve yan bahis imkanı. Canlı dealer hissi veren akıcı dağıtım.</p>
              </div>
              <div className="flex items-center gap-2 pt-4">
                {onOpenGrandCasino && (
                  <button
                    onClick={() => {
                      if (typeof window !== 'undefined') window.localStorage.setItem('casino_tab', 'BLACKJACK');
                      onOpenGrandCasino();
                    }}
                    className="flex-1 py-2.5 bg-blue-800 hover:bg-blue-700 text-white font-black uppercase tracking-widest rounded-xl text-xs transition shadow-lg active:scale-95"
                  >
                    Masaya Otur
                  </button>
                )}
              </div>
            </div>

            {/* 4. Baccarat (4. SIRA) */}
            <div className="bg-[#140b12] border-2 border-fuchsia-900/40 hover:border-fuchsia-700/60 rounded-2xl p-4 flex flex-col justify-between hover:scale-[1.02] transition-transform">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="bg-fuchsia-900/40 text-fuchsia-400 border border-fuchsia-800/50 text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">High Roller</span>
                  <span className="text-fuchsia-400 text-xl">🏦</span>
                </div>
                <h3 className="text-white font-serif font-bold text-lg leading-tight pt-1">Baccarat Punto Banco</h3>
                <p className="text-gray-400 text-xs">Zenginlerin favori oyunu. Düşük kasa avantajı (Tie hariç) ve anlık kazanç aktarımı.</p>
              </div>
              <div className="flex items-center gap-2 pt-4">
                {onOpenGrandCasino && (
                  <button
                    onClick={() => {
                      if (typeof window !== 'undefined') window.localStorage.setItem('casino_tab', 'BACCARAT');
                      onOpenGrandCasino();
                    }}
                    className="flex-1 py-2.5 bg-fuchsia-800 hover:bg-fuchsia-700 text-white font-black uppercase tracking-widest rounded-xl text-xs transition shadow-lg active:scale-95"
                  >
                    Masaya Otur
                  </button>
                )}
              </div>
            </div>

          </div>
"""

content = content[:start_idx] + new_casino_html + content[end_idx:]

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)
