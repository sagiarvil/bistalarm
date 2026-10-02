'use client';

import React, { useRef, useEffect } from 'react';
import { SYMBOL_SPECS } from '@/lib/tradingEngine';

interface LiveTickerTapeProps {
  currentPrices: Record<string, { bid: number; ask: number; high: number; low: number; time: string }>;
  onSelectSymbol?: (symbol: string) => void;
}

const DEFAULT_MARQUEE_SYMBOLS = [
  'EURUSD', 
  'GBPUSD', 
  'USDJPY', 
  'XAUUSDX', 
  'NASDAQ.j', 
  'SPX500.j', 
  'DAX.j',
  'US2000.j',
  'BIST30',
  'BTCUSD', 
  'ETHUSD', 
  'SOLUSD',
  'XRPUSD',
  'AVAXUSD',
  'BNBUSD',
  'XAGUSD', 
  'BRENT.c',
  'USDCHF',
  'AUDUSD',
  'USDCAD',
  'NZDUSD',
  'EURGBP',
  'EURJPY',
  'GBPJPY',
  'BOOM1000', 
  'CRASH500', 
  'VOLATILITY75',
  'ARB-USDT'
];

export default function LiveTickerTape({
  currentPrices,
  onSelectSymbol
}: LiveTickerTapeProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  // Kurşun geçirmez donanım ivmeli kaydırma motoru
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    let animId: number;
    let lastTime = performance.now();
    const PIXELS_PER_SECOND = 40;

    const loop = (now: number) => {
      const delta = Math.min((now - lastTime) / 1000, 0.1);
      lastTime = now;

      if (el) {
        el.scrollLeft += PIXELS_PER_SECOND * delta;
        // Listenin ilk yarısı bittiğinde sıfır gecikmeyle başa sar
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

  const renderItem = (sym: string, keyPrefix: string, idx: number) => {
    const sp = SYMBOL_SPECS[sym] || { basePrice: 100, digits: 2, spread: 0.1 };
    const p = currentPrices[sym] || { bid: sp.basePrice, ask: sp.basePrice + sp.spread };
    const changePercent = ((p.bid - sp.basePrice) / sp.basePrice) * 100;
    const isPositive = changePercent >= 0;

    return (
      <div 
        key={`${keyPrefix}-${sym}-${idx}`} 
        onClick={() => onSelectSymbol && onSelectSymbol(sym)}
        className="inline-flex items-center gap-2 cursor-pointer hover:opacity-80 transition font-mono text-xs shrink-0 select-none py-1 px-3 border-r border-[#182030]/60"
        title={`${sym} Canlı Fiyat - Tıkla ve İşlem Yap`}
      >
        <span className="font-bold text-gray-200">{sym}</span>
        <span className="text-blue-400 font-semibold">{p.bid.toFixed(sp.digits)}</span>
        <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${
          isPositive ? 'text-emerald-400 bg-emerald-500/15' : 'text-rose-400 bg-rose-500/15'
        }`}>
          {isPositive ? '▲ +' : '▼ '}{changePercent.toFixed(2)}%
        </span>
      </div>
    );
  };

  return (
    <div className="bg-[#080b12] border-b border-[#182030] py-1.5 overflow-hidden select-none relative w-full z-40">
      {/* Sol ve Sağ Gradyan Gölgeler */}
      <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-[#080b12] to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-[#080b12] to-transparent z-10 pointer-events-none" />

      {/* Kaydırma Taşıyıcısı (Genişliği garanti altına alınmış 2 dev şerit = sonsuz akış) */}
      <div 
        ref={containerRef} 
        className="flex items-center overflow-x-hidden no-scrollbar whitespace-nowrap w-full"
        style={{ scrollBehavior: 'auto', WebkitOverflowScrolling: 'touch' }}
      >
        {/* 1. Şerit (28 Sembol) */}
        <div className="flex items-center shrink-0">
          {DEFAULT_MARQUEE_SYMBOLS.map((sym, idx) => renderItem(sym, 'track1', idx))}
        </div>

        {/* 2. Şerit (28 Sembol - Kesintisiz Sonsuz Akış Eşleniği) */}
        <div className="flex items-center shrink-0" aria-hidden="true">
          {DEFAULT_MARQUEE_SYMBOLS.map((sym, idx) => renderItem(sym, 'track2', idx))}
        </div>
      </div>
    </div>
  );
}
