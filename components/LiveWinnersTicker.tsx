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
  badge: 'MEGA' | 'EPIC' | 'JACKPOT' | 'VIP';
}

const INITIAL_WINNERS: WinnerItem[] = [
  { id: 'w1', user: 'baris***', avatar: '🦁', game: 'Çilek & Ananas VIP Slot', icon: '🍓', amount: 14850, multiplier: '742x', timeAgo: 'Az önce', badge: 'JACKPOT' },
  { id: 'w2', user: 'ahmet_vip', avatar: '🦅', game: 'Rocket Crash (Aviator)', icon: '🚀', amount: 8940, multiplier: '44.7x', timeAgo: '12 sn önce', badge: 'EPIC' },
  { id: 'w3', user: 'monaco_king', avatar: '👑', game: 'Avrupa Ruleti (Tek 0)', icon: '🎡', amount: 35000, multiplier: '36x', timeAgo: '28 sn önce', badge: 'MEGA' },
  { id: 'w4', user: 'selim_fx', avatar: '🐺', game: 'Elmas Mayın (Mines)', icon: '💎', amount: 6200, multiplier: '31x', timeAgo: '41 sn önce', badge: 'VIP' },
  { id: 'w5', user: 'crypto_trader', avatar: '⚡', game: 'Plinko VIP Drop', icon: '🟡', amount: 20000, multiplier: '1000x', timeAgo: '1 dk önce', badge: 'JACKPOT' },
  { id: 'w6', user: 'caner_99', avatar: '🐯', game: 'VIP Blackjack 21', icon: '♠️', amount: 12500, multiplier: '2.5x', timeAgo: '1 dk önce', badge: 'EPIC' },
  { id: 'w7', user: 'deniz_bist', avatar: '🚀', game: 'Çilek & Ananas VIP Slot', icon: '🍍', amount: 19400, multiplier: '970x', timeAgo: '2 dk önce', badge: 'JACKPOT' },
  { id: 'w8', user: 'bora_monaco', avatar: '💎', game: 'Baccarat Punto Banco', icon: '👑', amount: 18000, multiplier: '2x', timeAgo: '2 dk önce', badge: 'VIP' },
];

export default function LiveWinnersTicker() {
  const [winners, setWinners] = useState<WinnerItem[]>(INITIAL_WINNERS);

  // Canlı kazanç akışı simülatörü (Her 6 saniyede bir yeni VIP kazanan düşer)
  useEffect(() => {
    const randomUsers = ['arda_fx', 'kemal_vip', 'mert_tr', 'emre_monaco', 'burak_pro', 'yasin_gold', 'tarik_77'];
    const randomGames = [
      { game: 'Çilek & Ananas VIP Slot', icon: '🍓', minMult: 100, maxMult: 1000, badge: 'JACKPOT' as const },
      { game: 'Rocket Crash', icon: '🚀', minMult: 10, maxMult: 88, badge: 'EPIC' as const },
      { game: 'Avrupa Ruleti', icon: '🎡', minMult: 18, maxMult: 36, badge: 'MEGA' as const },
      { game: 'Elmas Mayın', icon: '💎', minMult: 15, maxMult: 65, badge: 'VIP' as const },
      { game: 'VIP Blackjack 21', icon: '♠️', minMult: 2, maxMult: 5, badge: 'EPIC' as const }
    ];

    const timer = setInterval(() => {
      const g = randomGames[Math.floor(Math.random() * randomGames.length)];
      const u = randomUsers[Math.floor(Math.random() * randomUsers.length)];
      const mult = Math.floor(g.minMult + Math.random() * (g.maxMult - g.minMult));
      const bet = [20, 50, 100, 200][Math.floor(Math.random() * 4)];
      const wonAmount = bet * mult;

      const newWinner: WinnerItem = {
        id: `w-${Date.now()}`,
        user: `${u.substring(0, 4)}***`,
        avatar: ['👑', '🦁', '⚡', '🦅', '🔥'][Math.floor(Math.random() * 5)],
        game: g.game,
        icon: g.icon,
        amount: wonAmount,
        multiplier: `${mult}x`,
        timeAgo: 'Şimdi',
        badge: g.badge
      };

      setWinners(prev => [newWinner, ...prev.slice(0, 9)]);
    }, 6500);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="bg-gradient-to-r from-[#0a0f1d] via-[#10192e] to-[#0a0f1d] border-y border-amber-500/30 py-2 overflow-hidden select-none relative w-full shadow-lg">
      <div className="max-w-7xl mx-auto flex items-center px-4">
        
        {/* Sol Sabit Etiket (Live Winners Badge) */}
        <div className="flex items-center gap-2 bg-gradient-to-r from-amber-600 to-yellow-500 text-black px-3 py-1 rounded-lg font-black text-xs shrink-0 mr-4 shadow-[0_0_15px_rgba(245,158,11,0.5)] z-20 font-mono tracking-wider">
          <span className="w-2 h-2 rounded-full bg-red-600 animate-ping" />
          <span>CANLI KAZANANLAR</span>
        </div>

        {/* Kayan Şerit (Double Marquee GPU) */}
        <div className="ticker-track flex items-center overflow-hidden flex-1">
          {/* 1. Şerit */}
          <div className="ticker-marquee flex items-center gap-6">
            {winners.map((item) => (
              <div 
                key={`win1-${item.id}`}
                className="flex items-center gap-2.5 bg-[#0d1424] border border-amber-500/20 hover:border-amber-400/60 px-3 py-1 rounded-xl text-xs font-mono shrink-0 transition shadow-sm"
              >
                <span className="text-base">{item.avatar}</span>
                <span className="text-gray-300 font-bold">{item.user}</span>
                <span className="text-gray-500">•</span>
                <span className="text-gray-400 flex items-center gap-1">
                  <span>{item.icon}</span>
                  <span className="hidden sm:inline">{item.game}</span>
                </span>
                <span className="text-emerald-400 font-black text-sm bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/30">
                  +${item.amount.toLocaleString()}
                </span>
                <span className="text-yellow-400 font-bold text-[10px] bg-yellow-500/10 px-1 rounded">
                  {item.multiplier}
                </span>
              </div>
            ))}
          </div>

          {/* 2. Şerit (Sonsuz Döngü) */}
          <div className="ticker-marquee flex items-center gap-6" aria-hidden="true">
            {winners.map((item) => (
              <div 
                key={`win2-${item.id}`}
                className="flex items-center gap-2.5 bg-[#0d1424] border border-amber-500/20 hover:border-amber-400/60 px-3 py-1 rounded-xl text-xs font-mono shrink-0 transition shadow-sm"
              >
                <span className="text-base">{item.avatar}</span>
                <span className="text-gray-300 font-bold">{item.user}</span>
                <span className="text-gray-500">•</span>
                <span className="text-gray-400 flex items-center gap-1">
                  <span>{item.icon}</span>
                  <span className="hidden sm:inline">{item.game}</span>
                </span>
                <span className="text-emerald-400 font-black text-sm bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/30">
                  +${item.amount.toLocaleString()}
                </span>
                <span className="text-yellow-400 font-bold text-[10px] bg-yellow-500/10 px-1 rounded">
                  {item.multiplier}
                </span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
