// components/GameTacticsGuideModal.tsx
'use client';

import React, { useState } from 'react';

interface GameTacticsGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenRoulette: () => void;
  onOpenBlackjack: () => void;
  onOpenSlots: () => void;
  onOpenCrash: () => void;
  onOpenMines: () => void;
}

type GuideTab = 'ALL' | 'CRASH' | 'MINES' | 'ROULETTE' | 'BLACKJACK' | 'SLOTS';

export default function GameTacticsGuideModal({
  isOpen,
  onClose,
  onOpenRoulette,
  onOpenBlackjack,
  onOpenSlots,
  onOpenCrash,
  onOpenMines
}: GameTacticsGuideModalProps) {
  const [activeTab, setActiveTab] = useState<GuideTab>('ALL');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-2 sm:p-4 overflow-y-auto animate-fadeIn select-none">
      <div className="relative w-full max-w-4xl max-h-[94vh] bg-gradient-to-b from-[#1c1206] via-[#101e14] to-[#07130b] border-4 border-[#d4af37] rounded-2xl sm:rounded-3xl  overflow-hidden flex flex-col my-auto text-white">
        
        {/* Üst Bar: Monte Carlo VIP Taktik ve Kazanç Manifestosu */}
        <div className="bg-gradient-to-r from-[#2c1408] via-[#4d260c] to-[#2c1408] border-b-2 border-[#d4af37] p-3 sm:p-4 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2.5 sm:gap-3.5">
            <button
              onClick={onClose}
              className="px-2.5 sm:px-3 py-1.5 bg-[#3d1a0b] hover:bg-[#5a250e] border border-[#d4af37] text-yellow-300 hover:text-white rounded-xl text-xs font-bold font-serif transition flex items-center gap-1.5 shadow"
              title="Rehberden Çıkış Yap"
            >
              <span>←</span>
              <span>Geri Dön</span>
            </button>

            <div className="w-10 h-10 rounded-2xl  border-2 border-yellow-200 flex items-center justify-center shadow-lg text-xl">
              ⚡
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-xl font-black   font-serif tracking-wide">
                  VIP KAZANMA MANİFESTOSU
                </h2>
                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-amber-500/20 text-yellow-300 border border-yellow-400/50 uppercase tracking-widest font-mono hidden sm:inline">
                  MONACO SIRLARI
                </span>
              </div>
              <p className="text-[11px] text-amber-200/80 font-sans hidden sm:block">
                Şans Değil; Cesaret, Hız ve Soğukkanlılık! Bakiyeni Katlama Sanatı.
              </p>
            </div>
          </div>

          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#3d1a0b] hover:bg-rose-900 border border-[#d4af37] text-amber-200 flex items-center justify-center font-bold text-sm transition shadow"
          >
            ✕
          </button>
        </div>

        {/* Sekmeler - KAYDIRMASIZ TEK EKRAN GRİD */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 border-b border-[#d4af37]/30 bg-[#071a0e] p-1.5 gap-1.5 text-xs font-serif shrink-0">
          {[
            { id: 'ALL', label: '🌟 Tümü' },
            { id: 'CRASH', label: '🚀 Rocket' },
            { id: 'MINES', label: '💎 Mines' },
            { id: 'ROULETTE', label: '🎡 Rulet' },
            { id: 'BLACKJACK', label: '♠️ 21 VIP' },
            { id: 'SLOTS', label: '🍓 Slots' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as GuideTab)}
              className={`px-2 py-2 rounded-lg font-bold transition flex items-center justify-center text-center tracking-wide ${
                activeTab === tab.id
                  ? 'bg-gradient-to-t from-[#0e3b22] to-[#165a34] text-yellow-300 border border-[#d4af37] shadow-lg'
                  : 'text-gray-400 hover:text-amber-200 bg-[#05140b]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Ana İçerik Alanı - Dikey Scroll Destekli */}
        <div className="p-3 sm:p-5 space-y-5 overflow-y-auto flex-1 bg-[#051c0f]">
          
          {/* Üst Vurgulu İlham Kartı */}
          <div className="bg-gradient-to-r from-amber-600/30 via-yellow-500/20 to-amber-700/30 border-2 border-amber-400/50 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
            <div className="space-y-1 text-center sm:text-left">
              <span className="text-xs font-mono font-black text-amber-300 uppercase tracking-widest block">
                🔥 KAZANANLAR KULÜBÜ KURALI #1:
              </span>
              <h3 className="text-base sm:text-lg font-black text-white font-serif">
                &ldquo;Tereddüt Kaybettirir, Doğru Zamanda Basılan Bir Buton Hayat Değiştirir!&rdquo;
              </h3>
              <p className="text-xs text-gray-300">
                Sanal bakiyen hazır bekliyor. İster roketin zirvesinde tek tıkla servet yap, ister rulette 36 katına oyna!
              </p>
            </div>
            <button
              onClick={() => { onClose(); onOpenCrash(); }}
              className="px-6 py-3 rounded-xl  bg-blue-600 hover:bg-blue-700 text-black font-black text-xs uppercase tracking-wider shadow-lg shadow-amber-500/30 shrink-0 font-serif active:scale-95"
            >
              Hemen Şansını Dene ↗
            </button>
          </div>

          {/* OYUNLAR KILAVUZU */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* 1. ROCKET CRASH */}
            {(activeTab === 'ALL' || activeTab === 'CRASH') && (
              <div className="bg-[#092b19] border-2 border-cyan-500/40 rounded-2xl p-4 sm:p-5 space-y-3 shadow-lg relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-28 h-28 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none" />
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="text-3xl">🚀</span>
                    <div>
                      <h4 className="font-black text-base text-cyan-300 font-serif">ROCKET CRASH (AVIATOR)</h4>
                      <span className="text-[10px] text-gray-400 font-mono">Logaritmik Yükseliş • 1.01x - 200x+</span>
                    </div>
                  </div>
                  <span className="text-xs font-mono px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/30">
                    ADRENALİN %100
                  </span>
                </div>

                <p className="text-xs text-gray-300 leading-relaxed">
                  <strong className="text-white">Mesele sadece sabır:</strong> Roket ateşlenir, sayılar çılgınca döner! Korkaklar 1.20x&apos;de çıkar; gerçek cesaret sahipleri roket 10x, 25x, 80x&apos;e tırmanırken bekler!
                </p>

                <div className="bg-black/50 p-3 rounded-xl border border-cyan-500/20 text-xs font-mono space-y-1">
                  <div className="text-cyan-400 font-bold">🎯 ÖLÜMCÜL TAKTİK:</div>
                  <div className="text-gray-300 text-[11px]">
                    $100 bahis koy, roket 5x olduğunda &ldquo;KÂRI AL&rdquo; butonuna bas: <strong>Anında +$500 cebinde!</strong> Roket patlamadan hemen önce çekilmek sanattır.
                  </div>
                </div>

                <button
                  onClick={() => { onClose(); onOpenCrash(); }}
                  className="w-full py-2.5  bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow transition"
                >
                  🚀 Roketi Ateşle (Crash Oyna)
                </button>
              </div>
            )}

            {/* 2. DIAMOND MINES */}
            {(activeTab === 'ALL' || activeTab === 'MINES') && (
              <div className="bg-[#092b19] border-2 border-emerald-500/40 rounded-2xl p-4 sm:p-5 space-y-3 shadow-lg relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-28 h-28 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="text-3xl">💎</span>
                    <div>
                      <h4 className="font-black text-base text-emerald-300 font-serif">DIAMOND MINES (MAYIN TARLASI)</h4>
                      <span className="text-[10px] text-gray-400 font-mono">5x5 Izgara • Katlanan Çarpanlar</span>
                    </div>
                  </div>
                  <span className="text-xs font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
                    STRATEJİ %100
                  </span>
                </div>

                <p className="text-xs text-gray-300 leading-relaxed">
                  <strong className="text-white">Her karede servet yatıyor:</strong> 25 kutunun içine mayınlar gizlendi. Her bulduğun elmas çarpanı katlar! 1 elmas: 1.15x, 3 elmas: 2.10x, 6 elmas: 7.40x!
                </p>

                <div className="bg-black/50 p-3 rounded-xl border border-emerald-500/20 text-xs font-mono space-y-1">
                  <div className="text-emerald-400 font-bold">🎯 ÖLÜMCÜL TAKTİK:</div>
                  <div className="text-gray-300 text-[11px]">
                    3 mayın seç. İlk 4 köşeyi aç; bomba çıkmazsa çarpan 3 katına fırlar. İster kârı çek, ister son kutuyla 28.5x efsaneyi yakala!
                  </div>
                </div>

                <button
                  onClick={() => { onClose(); onOpenMines(); }}
                  className="w-full py-2.5  bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow transition"
                >
                  💎 Elmasları Çıkart (Mines Oyna)
                </button>
              </div>
            )}

            {/* 3. AVRUPA RULETİ */}
            {(activeTab === 'ALL' || activeTab === 'ROULETTE') && (
              <div className="bg-[#092b19] border-2 border-yellow-500/40 rounded-2xl p-4 sm:p-5 space-y-3 shadow-lg relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-28 h-28 bg-yellow-500/10 rounded-full blur-2xl pointer-events-none" />
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="text-3xl">🎡</span>
                    <div>
                      <h4 className="font-black text-base text-yellow-300 font-serif">MONTE CARLO AVRUPA RULETİ</h4>
                      <span className="text-[10px] text-gray-400 font-mono">Tek Sıfır (0) • 35:1 Tek Numara Kazancı</span>
                    </div>
                  </div>
                  <span className="text-xs font-mono px-2 py-0.5 rounded bg-yellow-500/20 text-yellow-300 font-bold border border-yellow-500/30">
                    KRALİYET MASASI
                  </span>
                </div>

                <p className="text-xs text-gray-300 leading-relaxed">
                  <strong className="text-white">160 yıllık Monaco efsanesi:</strong> Fildişi top altın pirinç taretin etrafında dönerken nefesler tutulur. Kırmızı mı Siyah mı? Yoksa tek bir rakama basıp 36 katını tek nefeste masadan toplamak mı?
                </p>

                <div className="bg-black/50 p-3 rounded-xl border border-yellow-500/20 text-xs font-mono space-y-1">
                  <div className="text-yellow-400 font-bold">🎯 ÖLÜMCÜL TAKTİK:</div>
                  <div className="text-gray-300 text-[11px]">
                    <strong>Voisins du Zéro (Sıfır Komşuları):</strong> Racetrack üzerinden tek tıkla 17 sayıyı kapat. Çarkın neredeyse yarısı senin olur, kazanma ihtimalin tavan yapar!
                  </div>
                </div>

                <button
                  onClick={() => { onClose(); onOpenRoulette(); }}
                  className="w-full py-2.5  bg-blue-600 hover:bg-blue-700 text-black font-black text-xs rounded-xl shadow transition font-serif"
                >
                  🎡 Rulet Masasına Otur (Çevir)
                </button>
              </div>
            )}

            {/* 4. MONACO VIP BLACKJACK 21 */}
            {(activeTab === 'ALL' || activeTab === 'BLACKJACK') && (
              <div className="bg-[#092b19] border-2 border-indigo-500/40 rounded-2xl p-4 sm:p-5 space-y-3 shadow-lg relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-28 h-28 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="text-3xl">♠️</span>
                    <div>
                      <h4 className="font-black text-base text-indigo-300 font-serif">MONACO VIP BLACKJACK 21</h4>
                      <span className="text-[10px] text-gray-400 font-mono">6 Deste • Doğal 21 için 3:2 Ödeme</span>
                    </div>
                  </div>
                  <span className="text-xs font-mono px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-bold border border-indigo-500/30">
                    MATEMATİK KAZANDIRIR
                  </span>
                </div>

                <p className="text-xs text-gray-300 leading-relaxed">
                  <strong className="text-white">Kasanın zayıf karnını yakala:</strong> Krupiye 17&apos;ye kadar duramaz, çekmek zorundadır. Elin 11 mi geldi? Bas ikiye katlamaya (Double), 21 vurup kasayı masadan sil!
                </p>

                <div className="bg-black/50 p-3 rounded-xl border border-indigo-500/20 text-xs font-mono space-y-1">
                  <div className="text-indigo-400 font-bold">🎯 ÖLÜMCÜL TAKTİK:</div>
                  <div className="text-gray-300 text-[11px]">
                    Krupiyenin açık kartı 4, 5 veya 6 ise dur (Stand)! Krupiye patlamaya (Bust) mahkumdur; risksiz kazanç garantidir!
                  </div>
                </div>

                <button
                  onClick={() => { onClose(); onOpenBlackjack(); }}
                  className="w-full py-2.5  bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow transition"
                >
                  ♠️ 21 Masasına Geç (Kart İste)
                </button>
              </div>
            )}

            {/* 5. VEGAS VIP FRUIT SLOT */}
            {(activeTab === 'ALL' || activeTab === 'SLOTS') && (
              <div className="bg-[#092b19] border-2 border-rose-500/40 rounded-2xl p-4 sm:p-5 space-y-3 shadow-lg relative overflow-hidden group md:col-span-2">
                <div className="absolute top-0 right-0 w-28 h-28 bg-rose-500/10 rounded-full blur-2xl pointer-events-none" />
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="text-3xl">🍓🍍</span>
                    <div>
                      <h4 className="font-black text-base text-rose-300 font-serif">VEGAS & MONACO ÇİLEK / ANANAS VIP SLOTS</h4>
                      <span className="text-[10px] text-gray-400 font-mono">5x3 Makara • 20 Kazanç Çizgisi • Grand Mega Jackpot</span>
                    </div>
                  </div>
                  <span className="text-xs font-mono px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 font-bold border border-rose-500/30">
                    MEGA VOLATİLİTE
                  </span>
                </div>

                <p className="text-xs text-gray-300 leading-relaxed">
                  <strong className="text-white">Mekanik kolu çek, altın yağmurunu başlat:</strong> İlk iki makaraya 777 veya Çilek düştüğünde kalp atışı başlar! 3. ve 4. makaralar alev alarak slow-motion döner. 5 tane 777 yakaladığın an tek çevirmede $20,000 Mega Jackpot patlar!
                </p>

                <div className="bg-black/50 p-3 rounded-xl border border-rose-500/20 text-xs font-mono space-y-1">
                  <div className="text-rose-400 font-bold">🎯 ÖLÜMCÜL TAKTİK:</div>
                  <div className="text-gray-300 text-[11px]">
                    Bahsi $20 veya $50&apos;ye çek, Auto-Spin&apos;i başlat! Tension Spin modunda 3 Scatter yakaladığında tüm çarpanlar 15x ile 100x arasına fırlar!
                  </div>
                </div>

                <button
                  onClick={() => { onClose(); onOpenSlots(); }}
                  className="w-full py-3  hover:opacity-95 text-black font-black text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-rose-600/30 transition"
                >
                  🎰 Kolu Çek & Mega Jackpot Patlat!
                </button>
              </div>
            )}

          </div>

        </div>

      </div>
    </div>
  );
}
