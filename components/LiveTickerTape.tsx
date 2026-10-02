'use client';

import React from 'react';
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
  'BTCUSD', 
  'ETHUSD', 
  'BOOM1000', 
  'CRASH500', 
  'ARB-USDT'
];

export default function LiveTickerTape({
  currentPrices,
  onSelectSymbol
}: LiveTickerTapeProps) {
  const renderItem = (sym: string, keyPrefix: string, idx: number) => {
    const sp = SYMBOL_SPECS[sym] || { basePrice: 100, digits: 2, spread: 0.1 };
    const p = currentPrices[sym] || { bid: sp.basePrice, ask: sp.basePrice + sp.spread };
    const changePercent = ((p.bid - sp.basePrice) / sp.basePrice) * 100;
    const isPositive = changePercent >= 0;

    return (
      <div 
        key={`${keyPrefix}-${sym}-${idx}`} 
        onClick={() => onSelectSymbol && onSelectSymbol(sym)}
        className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition font-mono text-xs shrink-0 select-none py-1"
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
      <div className="ticker-track flex items-center">
        {/* 1. Şerit */}
        <div className="ticker-marquee flex items-center">
          {DEFAULT_MARQUEE_SYMBOLS.map((sym, idx) => renderItem(sym, 'track1', idx))}
        </div>

        {/* 2. Şerit (Sonsuz Döngü Kesintisiz Çift Bellek) */}
        <div className="ticker-marquee flex items-center" aria-hidden="true">
          {DEFAULT_MARQUEE_SYMBOLS.map((sym, idx) => renderItem(sym, 'track2', idx))}
        </div>
      </div>
    </div>
  );
}
