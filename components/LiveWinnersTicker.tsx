'use client';

import React, { useState, useEffect } from 'react';

export interface WinnerItem {
  id: string;
  user: string;
  avatar: string;
  game: string;
  icon: string;
  amount: number;
  multiplier: string;
  timeAgo: string;
  badge: 'MEGA' | 'EPIC' | 'JACKPOT' | 'CAESARS VIP' | 'ROYAL';
}

const INITIAL_WINNERS: WinnerItem[] = [
  { id: 'w1', user: 'baris***', avatar: '👑', game: 'Çilek & Ananas VIP 777', icon: '🍓', amount: 14850, multiplier: '742x', timeAgo: 'Az önce', badge: 'JACKPOT' },
  { id: 'w2', user: 'ahmet_vip', avatar: '🦅', game: 'Rocket Crash (Aviator)', icon: '🚀', amount: 8940, multiplier: '44.7x', timeAgo: '12 sn önce', badge: 'EPIC' },
  { id: 'w3', user: 'monaco_king', avatar: '⚜️', game: 'Monte Carlo Avrupa Ruleti', icon: '🎡', amount: 35000, multiplier: '36x', timeAgo: '28 sn önce', badge: 'ROYAL' },
  { id: 'w4', user: 'selim_fx', avatar: '🦁', game: 'Elmas Mayın (Mines 8 Adım)', icon: '💎', amount: 6200, multiplier: '31x', timeAgo: '41 sn önce', badge: 'CAESARS VIP' },
  { id: 'w5', user: 'crypto_trader', avatar: '⚡', game: 'Plinko 1000x Altın Yuva', icon: '🟡', amount: 20000, multiplier: '1000x', timeAgo: '1 dk önce', badge: 'JACKPOT' },
  { id: 'w6', user: 'caner_99', avatar: '🐯', game: 'Monaco VIP Blackjack 21', icon: '♠️', amount: 12500, multiplier: '2.5x', timeAgo: '1 dk önce', badge: 'EPIC' },
  { id: 'w7', user: 'deniz_bist', avatar: '💎', game: 'Çilek & Ananas VIP 777', icon: '🍍', amount: 19400, multiplier: '970x', timeAgo: '2 dk önce', badge: 'JACKPOT' },
  { id: 'w8', user: 'bora_monaco', avatar: '👑', game: 'Baccarat Punto Banco', icon: '🏛️', amount: 18000, multiplier: '2x', timeAgo: '2 dk önce', badge: 'CAESARS VIP' },
];

export default function LiveWinnersTicker() {
  const [winners, setWinners] = useState<WinnerItem[]>(INITIAL_WINNERS);

  // Canlı kazanç akışı simülatörü (Her 5.5 saniyede bir yeni Caesars VIP kazanan düşer)
  useEffect(() => {
    const randomUsers = ['arda_fx', 'kemal_vip', 'mert_tr', 'emre_monaco', 'burak_pro', 'yasin_gold', 'tarik_77', 'serdar_cesar', 'okan_vegas'];
    const randomGames = [
      { game: 'Çilek VIP 777 Slot', icon: '🍓', minMult: 150, maxMult: 1000, badge: 'JACKPOT' as const },
      { game: 'Rocket Crash Aviator', icon: '🚀', minMult: 20, maxMult: 90, badge: 'EPIC' as const },
      { game: 'Salle Garnier Rulet', icon: '🎡', minMult: 18, maxMult: 36, badge: 'ROYAL' as const },
      { game: 'Elmas Mayın Tarlası', icon: '💎', minMult: 15, maxMult: 75, badge: 'CAESARS VIP' as const },
      { game: 'Monaco Blackjack 21', icon: '♠️', minMult: 2, maxMult: 5, badge: 'EPIC' as const },
      { game: 'Viral Şans Çarkı (50x)', icon: '🎡', minMult: 10, maxMult: 50, badge: 'MEGA' as const }
    ];

    const timer = setInterval(() => {
      const g = randomGames[Math.floor(Math.random() * randomGames.length)];
      const u = randomUsers[Math.floor(Math.random() * randomUsers.length)];
      const mult = Math.floor(g.minMult + Math.random() * (g.maxMult - g.minMult));
      const bet = [25, 50, 100, 250][Math.floor(Math.random() * 4)];
      const wonAmount = bet * mult;

      const newWinner: WinnerItem = {
        id: `w-${Date.now()}`,
        user: `${u.substring(0, 4)}***`,
        avatar: ['👑', '🦁', '⚡', '🦅', '🔥', '⚜️'][Math.floor(Math.random() * 6)],
        game: g.game,
        icon: g.icon,
        amount: wonAmount,
        multiplier: `${mult}x`,
        timeAgo: 'Az önce',
        badge: g.badge
      };

      setWinners(prev => [newWinner, ...prev.slice(0, 11)]);
    }, 5500);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative w-full bg-gradient-to-r from-[#160d06] via-[#241306] to-[#160d06] border-y-2 border-[#d4af37]/60 py-2.5 overflow-hidden select-none shadow-[0_4px_25px_rgba(212,175,55,0.25)]">
      
      {/* Altın Parıltı Üst & Alt Kenar Çizgileri */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#ffd700] to-transparent opacity-80" />
      <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#ffd700] to-transparent opacity-80" />

      <div className="max-w-7xl mx-auto flex items-center px-3 sm:px-6">
        
        {/* Sol Sabit Caesars Rozeti (Caesars Palace & Monte Carlo Prestij Kutusu) */}
        <div className="flex items-center gap-2 bg-gradient-to-r from-[#ffd700] via-[#f59e0b] to-[#b45309] text-black px-3.5 py-1.5 rounded-xl font-black text-xs shrink-0 mr-4 shadow-[0_0_20px_rgba(255,215,0,0.6)] z-20 font-serif tracking-wider border border-yellow-200">
          <span className="text-sm animate-pulse">⚜️</span>
          <div className="flex flex-col leading-tight">
            <span className="text-[11px] font-black tracking-widest uppercase">CAESARS PALACE</span>
            <span className="text-[9px] font-mono font-bold text-black/80 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-ping inline-block" />
              CANLI VIP KAZANANLAR
            </span>
          </div>
        </div>

        {/* Kayan Şerit (Double Marquee GPU Hızlandırmalı - 60FPS) */}
        <div className="ticker-track flex items-center overflow-hidden flex-1 relative">
          
          {/* Sol & Sağ Solma Maskeleri */}
          <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-[#1a0e06] to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-[#1a0e06] to-transparent z-10 pointer-events-none" />

          {/* 1. Şerit */}
          <div className="ticker-marquee flex items-center gap-4 sm:gap-6">
            {winners.map((item) => (
              <div 
                key={`win1-${item.id}`}
                className="flex items-center gap-3 bg-gradient-to-r from-[#201007]/90 via-[#361c0c]/90 to-[#201007]/90 border border-[#d4af37]/50 hover:border-yellow-400 px-3.5 py-1.5 rounded-2xl text-xs font-mono shrink-0 transition-transform duration-200 hover:scale-105 shadow-[0_2px_12px_rgba(0,0,0,0.6)]"
              >
                <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-amber-600 to-yellow-400 border border-yellow-200 flex items-center justify-center text-sm shadow">
                  {item.avatar}
                </div>

                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-yellow-100 font-bold font-sans">{item.user}</span>
                    <span className={`text-[9px] font-mono px-1.5 py-0.2 rounded font-extrabold border ${
                      item.badge === 'JACKPOT' ? 'bg-amber-500/20 text-yellow-300 border-yellow-400/50 animate-pulse' :
                      item.badge === 'ROYAL' ? 'bg-purple-500/20 text-purple-300 border-purple-400/50' :
                      item.badge === 'CAESARS VIP' ? 'bg-rose-500/20 text-rose-300 border-rose-400/50' :
                      'bg-emerald-500/20 text-emerald-300 border-emerald-400/50'
                    }`}>
                      {item.badge}
                    </span>
                  </div>
                  <span className="text-[10px] text-amber-200/70 flex items-center gap-1">
                    <span>{item.icon}</span>
                    <span>{item.game}</span>
                  </span>
                </div>

                <div className="text-right pl-2 border-l border-[#d4af37]/30">
                  <div className="text-emerald-400 font-black text-sm font-mono tracking-tight drop-shadow-[0_0_8px_rgba(52,211,153,0.5)]">
                    +${item.amount.toLocaleString()}
                  </div>
                  <div className="text-yellow-400 font-bold text-[10px] font-mono">
                    {item.multiplier}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* 2. Şerit (Sonsuz Kesintisiz Marquee Döngüsü) */}
          <div className="ticker-marquee flex items-center gap-4 sm:gap-6" aria-hidden="true">
            {winners.map((item) => (
              <div 
                key={`win2-${item.id}`}
                className="flex items-center gap-3 bg-gradient-to-r from-[#201007]/90 via-[#361c0c]/90 to-[#201007]/90 border border-[#d4af37]/50 hover:border-yellow-400 px-3.5 py-1.5 rounded-2xl text-xs font-mono shrink-0 transition-transform duration-200 hover:scale-105 shadow-[0_2px_12px_rgba(0,0,0,0.6)]"
              >
                <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-amber-600 to-yellow-400 border border-yellow-200 flex items-center justify-center text-sm shadow">
                  {item.avatar}
                </div>

                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-yellow-100 font-bold font-sans">{item.user}</span>
                    <span className={`text-[9px] font-mono px-1.5 py-0.2 rounded font-extrabold border ${
                      item.badge === 'JACKPOT' ? 'bg-amber-500/20 text-yellow-300 border-yellow-400/50 animate-pulse' :
                      item.badge === 'ROYAL' ? 'bg-purple-500/20 text-purple-300 border-purple-400/50' :
                      item.badge === 'CAESARS VIP' ? 'bg-rose-500/20 text-rose-300 border-rose-400/50' :
                      'bg-emerald-500/20 text-emerald-300 border-emerald-400/50'
                    }`}>
                      {item.badge}
                    </span>
                  </div>
                  <span className="text-[10px] text-amber-200/70 flex items-center gap-1">
                    <span>{item.icon}</span>
                    <span>{item.game}</span>
                  </span>
                </div>

                <div className="text-right pl-2 border-l border-[#d4af37]/30">
                  <div className="text-emerald-400 font-black text-sm font-mono tracking-tight drop-shadow-[0_0_8px_rgba(52,211,153,0.5)]">
                    +${item.amount.toLocaleString()}
                  </div>
                  <div className="text-yellow-400 font-bold text-[10px] font-mono">
                    {item.multiplier}
                  </div>
                </div>
              </div>
            ))}
          </div>

        </div>

      </div>
    </div>
  );
}
