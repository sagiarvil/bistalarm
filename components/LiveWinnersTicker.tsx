'use client';

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
  // İlk 28 senaryoyu karma olarak başlat
  const [winners, setWinners] = useState<WinnerItem[]>(() => {
    return WINNERS_SCENARIOS_500.slice(0, 28);
  });
  const scrollRef = useRef<HTMLDivElement>(null);
  const scenarioIndexRef = useRef<number>(28);

  // Kurşun geçirmez donanım ivmeli kaydırma motoru
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    let animId: number;
    let lastTime = performance.now();
    const SPEED = 46;

    const loop = (now: number) => {
      const delta = Math.min((now - lastTime) / 1000, 0.1);
      lastTime = now;

      if (el) {
        el.scrollLeft += SPEED * delta;
        const half = el.scrollWidth / 2;
        if (half > 0 && el.scrollLeft >= half - 1) {
          el.scrollLeft -= half;
        }
      }

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(animId);
    };
  }, []);

  // 500 Farklı Senaryo & Maskeli Türk İsimleri (ah***, sam***, meh***) Karma Dinamik Akış Simülatörü
  useEffect(() => {
    const times = ['Az önce', '2 sn önce', '5 sn önce', '9 sn önce', '14 sn önce'];

    const timer = setInterval(() => {
      // 500 senaryo havuzundan sıradaki veya rastgele birini al
      const poolIndex = scenarioIndexRef.current % WINNERS_SCENARIOS_500.length;
      scenarioIndexRef.current += 1;

      // Dinamik rastgele isim seç (500 maskelenmiş Türk ismi havuzundan: ah***, sam***, meh***, ali_***)
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

      setWinners(prev => [newWinner, ...prev.slice(0, 27)]);
    }, 3500);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative w-full bg-gradient-to-r from-[#160d06] via-[#241306] to-[#160d06] border-y-2 border-[#d4af37]/60 py-2.5 overflow-hidden select-none shadow-[0_4px_25px_rgba(212,175,55,0.25)]">
      
      {/* Altın Parıltı Üst & Alt Kenar Çizgileri */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#ffd700] to-transparent opacity-80" />
      <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#ffd700] to-transparent opacity-80" />

      <div className="max-w-7xl mx-auto flex items-center px-3 sm:px-6">
        
        {/* Sol Sabit VIP Rozeti (VIP Palace & Monte Carlo Prestij Kutusu) */}
        <div className="flex items-center gap-2 bg-gradient-to-r from-[#ffd700] via-[#f59e0b] to-[#b45309] text-black px-3.5 py-1.5 rounded-xl font-black text-xs shrink-0 mr-4  z-20 font-serif tracking-wider border border-yellow-200">
          <span className="text-sm animate-pulse">⚜️</span>
          <div className="flex flex-col leading-tight">
            <span className="text-[11px] font-black tracking-widest uppercase">VIP PALACE</span>
            <span className="text-[9px] font-mono font-bold text-black/80 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-ping inline-block" />
              CANLI VIP KAZANANLAR
            </span>
          </div>
        </div>

        {/* Kayan Şerit (RAF Donanım İvmeli Kesintisiz Akış - Her Cihazda 60FPS) */}
        <div 
          ref={scrollRef}
          className="flex items-center overflow-x-hidden no-scrollbar whitespace-nowrap flex-1 relative"
          style={{ scrollBehavior: 'auto', WebkitOverflowScrolling: 'touch' }}
        >
          {/* Sol & Sağ Solma Maskeleri */}
          <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-[#1a0e06] to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-[#1a0e06] to-transparent z-10 pointer-events-none" />

          {/* 1. Şerit */}
          <div className="flex items-center gap-4 sm:gap-6 shrink-0 pr-4 sm:pr-6">
            {winners.map((item) => (
              <div 
                key={`win1-${item.id}`}
                className="flex items-center gap-3 bg-gradient-to-r from-[#201007]/90 via-[#361c0c]/90 to-[#201007]/90 border border-[#d4af37]/50 hover:border-yellow-400 px-3.5 py-1.5 rounded-2xl text-xs font-mono shrink-0 transition-transform duration-200 hover:scale-105 shadow-[0_2px_12px_rgba(0,0,0,0.6)] select-none"
              >
                <div className="w-7 h-7 rounded-full  border border-yellow-200 flex items-center justify-center text-sm shadow">
                  {item.avatar}
                </div>

                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-yellow-100 font-bold font-sans">{item.user}</span>
                    <span className={`text-[9px] font-mono px-1.5 py-0.2 rounded font-extrabold border ${
                      item.badge === 'JACKPOT' ? 'bg-amber-500/20 text-yellow-300 border-yellow-400/50 animate-pulse' :
                      item.badge === 'ROYAL' ? 'bg-purple-500/20 text-purple-300 border-purple-400/50' :
                      item.badge === 'VIP VIP' ? 'bg-rose-500/20 text-rose-300 border-rose-400/50' :
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
                  <div className="text-emerald-400 font-black text-sm font-mono tracking-tight drop-">
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
          <div className="flex items-center gap-4 sm:gap-6 shrink-0 pr-4 sm:pr-6" aria-hidden="true">
            {winners.map((item) => (
              <div 
                key={`win2-${item.id}`}
                className="flex items-center gap-3 bg-gradient-to-r from-[#201007]/90 via-[#361c0c]/90 to-[#201007]/90 border border-[#d4af37]/50 hover:border-yellow-400 px-3.5 py-1.5 rounded-2xl text-xs font-mono shrink-0 transition-transform duration-200 hover:scale-105 shadow-[0_2px_12px_rgba(0,0,0,0.6)] select-none"
              >
                <div className="w-7 h-7 rounded-full  border border-yellow-200 flex items-center justify-center text-sm shadow">
                  {item.avatar}
                </div>

                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-yellow-100 font-bold font-sans">{item.user}</span>
                    <span className={`text-[9px] font-mono px-1.5 py-0.2 rounded font-extrabold border ${
                      item.badge === 'JACKPOT' ? 'bg-amber-500/20 text-yellow-300 border-yellow-400/50 animate-pulse' :
                      item.badge === 'ROYAL' ? 'bg-purple-500/20 text-purple-300 border-purple-400/50' :
                      item.badge === 'VIP VIP' ? 'bg-rose-500/20 text-rose-300 border-rose-400/50' :
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
                  <div className="text-emerald-400 font-black text-sm font-mono tracking-tight drop-">
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
