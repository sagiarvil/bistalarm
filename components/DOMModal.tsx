'use client';

import React from 'react';
import { SymbolSpec, SYMBOL_SPECS } from '@/lib/tradingEngine';
import { X, ArrowDown, ArrowUp } from 'lucide-react';

interface DOMModalProps {
  isOpen: boolean;
  onClose: () => void;
  symbol: string;
  currentBid: number;
  currentAsk: number;
  onQuickOrder: (side: 'buy' | 'sell', lots: number) => void;
}

export default function DOMModal({
  isOpen,
  onClose,
  symbol,
  currentBid,
  currentAsk,
  onQuickOrder
}: DOMModalProps) {
  if (!isOpen) return null;

  const spec: SymbolSpec = SYMBOL_SPECS[symbol] || SYMBOL_SPECS['DAX.j'];
  const spread = ((currentAsk - currentBid) / spec.pipSize).toFixed(1);

  // Derinlik Kademeleri (5 Kademe Satış, 5 Kademe Alış)
  const depth = 5;
  const asks = [];
  const bids = [];

  for (let i = depth; i >= 1; i--) {
    const p = currentAsk + i * spec.pipSize * (symbol.includes('BTC') ? 10 : 2);
    const vol = (Math.random() * 4 + 0.5).toFixed(2);
    asks.push({ price: p, volume: vol });
  }

  for (let i = 1; i <= depth; i++) {
    const p = currentBid - i * spec.pipSize * (symbol.includes('BTC') ? 10 : 2);
    const vol = (Math.random() * 5 + 0.8).toFixed(2);
    bids.push({ price: p, volume: vol });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-sm bg-[#161b24] border border-[#263140] rounded-3xl p-5 shadow-2xl flex flex-col gap-3 font-sans">
        {/* Üst Bar */}
        <div className="flex items-center justify-between border-b border-[#242f3e] pb-2">
          <div>
            <span className="font-bold text-base text-white">{symbol} Piyasa Derinliği</span>
            <span className="text-xs text-slate-400 block font-mono">Spread: {spread} pips</span>
          </div>
          <button onClick={onClose} className="p-1 rounded-full text-slate-400 hover:text-white">
            <X size={18} />
          </button>
        </div>

        {/* DOM Tablosu */}
        <div className="border border-[#242f3e] rounded-xl overflow-hidden text-xs font-tabular">
          {/* Ask Kademeleri (Kırmızı) */}
          <div className="divide-y divide-[#202937] bg-red-950/20">
            {asks.map((a, i) => (
              <div key={i} className="flex justify-between px-3 py-1.5 text-red-400 hover:bg-red-900/30">
                <span className="font-semibold">{a.price.toFixed(spec.digits)}</span>
                <span className="text-slate-400 font-mono">{a.volume} Lot</span>
              </div>
            ))}
          </div>

          {/* Orta Fiyat Çizgisi */}
          <div className="bg-[#1e2633] px-3 py-1.5 flex justify-between font-bold text-white text-[11px] border-y border-[#2a374a]">
            <span className="text-blue-400">Bid: {currentBid.toFixed(spec.digits)}</span>
            <span className="text-red-400">Ask: {currentAsk.toFixed(spec.digits)}</span>
          </div>

          {/* Bid Kademeleri (Mavi) */}
          <div className="divide-y divide-[#202937] bg-blue-950/20">
            {bids.map((b, i) => (
              <div key={i} className="flex justify-between px-3 py-1.5 text-blue-400 hover:bg-blue-900/30">
                <span className="font-semibold">{b.price.toFixed(spec.digits)}</span>
                <span className="text-slate-400 font-mono">{b.volume} Lot</span>
              </div>
            ))}
          </div>
        </div>

        {/* Hızlı Al / Sat Butonları */}
        <div className="grid grid-cols-2 gap-2 pt-1">
          <button
            onClick={() => {
              onQuickOrder('sell', 0.1);
              onClose();
            }}
            className="py-2.5 bg-red-600 hover:bg-red-500 rounded-xl font-bold text-xs text-white shadow"
          >
            SAT (0.10 Lot)
          </button>
          <button
            onClick={() => {
              onQuickOrder('buy', 0.1);
              onClose();
            }}
            className="py-2.5 bg-blue-600 hover:bg-blue-500 rounded-xl font-bold text-xs text-white shadow"
          >
            AL (0.10 Lot)
          </button>
        </div>
      </div>
    </div>
  );
}
