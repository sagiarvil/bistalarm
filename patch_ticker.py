file_path = "components/LiveWinnersTicker.tsx"
with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# Replace the entire file with a new highly polished version
new_content = """'use client';

import React, { useState, useEffect, useRef } from 'react';

import { 
  WinnerItem, 
  WINNERS_SCENARIOS_500, 
  MASKED_TURKISH_NAMES_500, 
  CASINO_GAMES_POOL, 
  AVATARS_POOL 
} from '@/lib/winnersDataset';

export type { WinnerItem };

export default function LiveWinnersTicker() {
  const [winners, setWinners] = useState<WinnerItem[]>(() => {
    return WINNERS_SCENARIOS_500.slice(0, 30);
  });
  const scenarioIndexRef = useRef<number>(30);

  // Dinamik olarak yeni kazananları ekle
  useEffect(() => {
    const times = ['Az önce', '2 sn önce', '5 sn önce', '9 sn önce', '14 sn önce'];

    const timer = setInterval(() => {
      const poolIndex = scenarioIndexRef.current % WINNERS_SCENARIOS_500.length;
      scenarioIndexRef.current += 1;

      const randomUser = MASKED_TURKISH_NAMES_500[Math.floor(Math.random() * MASKED_TURKISH_NAMES_500.length)];
      const randomGame = CASINO_GAMES_POOL[Math.floor(Math.random() * CASINO_GAMES_POOL.length)];
      const randomAvatar = AVATARS_POOL[Math.floor(Math.random() * AVATARS_POOL.length)];
      const randomTime = times[Math.floor(Math.random() * times.length)];

      const mult = Math.floor(randomGame.minM + Math.random() * (randomGame.maxM - randomGame.minM));
      const bet = [20, 25, 50, 75, 100, 150, 200, 250, 500][Math.floor(Math.random() * 9)];
      const wonAmount = bet * mult;

      const newWinner: WinnerItem = {
        id: `w-${Date.now()}-${poolIndex}-${Math.random().toString(36).substring(2, 5)}`,
        user: randomUser,
        avatar: randomAvatar,
        game: randomGame.game,
        icon: randomGame.icon,
        amount: wonAmount,
        multiplier: `${mult}x`,
        timeAgo: randomTime,
        badge: randomGame.badge as any
      };

      setWinners(prev => [newWinner, ...prev.slice(0, 29)]);
    }, 2500);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative w-full bg-[#0a0505] border-y border-[#d4af37]/30 py-2 overflow-hidden select-none">
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes marquee-infinite {
          0% { transform: translateX(0%); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee-infinite {
          animation: marquee-infinite 60s linear infinite;
          will-change: transform;
        }
        .animate-marquee-infinite:hover {
          animation-play-state: paused;
        }
      `}} />
      
      {/* İnce Işık Efekti */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#d4af37]/50 to-transparent" />
      
      <div className="flex items-center px-2 sm:px-4">
        
        {/* Sol Sabit VIP Rozeti */}
        <div className="flex items-center gap-2 bg-gradient-to-b from-[#1f1a10] to-[#120e06] border border-[#d4af37]/40 shadow-[0_0_10px_rgba(212,175,55,0.15)] text-[#d4af37] px-4 py-1.5 rounded-md shrink-0 z-20 font-serif tracking-wide relative">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-[#d4af37] to-amber-600 rounded-md opacity-20 blur-sm"></div>
          <span className="text-sm relative z-10">⚜️</span>
          <div className="flex flex-col leading-none relative z-10">
            <span className="text-[11px] font-black tracking-widest uppercase text-amber-200/90">LIVE LEDGER</span>
            <span className="text-[9px] font-mono font-bold text-amber-400/60 flex items-center gap-1.5 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse inline-block shadow-[0_0_4px_#10b981]" />
              GLOBAL WINNERS
            </span>
          </div>
        </div>

        {/* Kayan Şerit (Pure CSS GPU Accelerated) */}
        <div className="flex-1 overflow-hidden relative ml-3">
          {/* Sol/Sağ Solma Maskesi */}
          <div className="absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-[#0a0505] to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-[#0a0505] to-transparent z-10 pointer-events-none" />

          {/* Marquee Wrapper (Width must hold 2x content) */}
          <div className="flex w-[200%] animate-marquee-infinite">
            {/* Tek Bir Liste, İki Kere Tekrar Eder (Seamless Loop) */}
            <div className="flex w-1/2 items-center justify-around gap-3 shrink-0">
              {winners.map((item) => (
                <WinnerCard key={`a-${item.id}`} item={item} />
              ))}
            </div>
            <div className="flex w-1/2 items-center justify-around gap-3 shrink-0">
              {winners.map((item) => (
                <WinnerCard key={`b-${item.id}`} item={item} />
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

function WinnerCard({ item }: { item: WinnerItem }) {
  return (
    <div className="flex items-center gap-3 bg-[#110a08] border border-[#302518] hover:border-[#d4af37]/70 px-3 py-1 rounded-md text-xs font-mono shrink-0 transition-colors shadow-sm cursor-pointer group">
      
      {/* İkon / Avatar Alanı */}
      <div className="w-6 h-6 rounded bg-black/50 border border-white/5 flex items-center justify-center text-sm shadow-inner group-hover:scale-110 transition-transform">
        {item.icon}
      </div>

      <div className="flex flex-col justify-center">
        <div className="flex items-center gap-2">
          <span className="text-zinc-300 font-medium font-sans">{item.user}</span>
          <span className="text-[#d4af37] font-bold text-[9px] tracking-tighter opacity-80">{item.game}</span>
        </div>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-emerald-400 font-bold tracking-tight">
            +${item.amount.toLocaleString('en-US')}
          </span>
          <span className="text-zinc-500 font-mono text-[9px]">
            {item.multiplier}
          </span>
          {item.badge === 'GRAND JACKPOT' && (
            <span className="text-[8px] bg-gradient-to-r from-amber-500 to-yellow-300 text-black font-black px-1 rounded animate-pulse">
              JACKPOT
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
"""

with open(file_path, "w", encoding="utf-8") as f:
    f.write(new_content)

