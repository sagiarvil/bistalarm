'use client';

import React, { useState } from 'react';
import { SYMBOL_SPECS, SymbolSpec, OrderSide, OrderType } from '@/lib/tradingEngine';
import { X, Minus, Plus } from 'lucide-react';

interface NewOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedSymbol: string;
  currentPrices: Record<string, { bid: number; ask: number }>;
  onPlaceOrder: (params: {
    symbol: string;
    side: OrderSide;
    type: OrderType;
    lots: number;
    sl: number | null;
    tp: number | null;
    targetPrice?: number;
  }) => void;
  leverage: number;
}

export default function NewOrderModal({
  isOpen,
  onClose,
  selectedSymbol,
  currentPrices,
  onPlaceOrder,
  leverage
}: NewOrderModalProps) {
  const [symbol, setSymbol] = useState(selectedSymbol);
  const [orderType, setOrderType] = useState<OrderType>('market');
  const [lots, setLots] = useState<number>(0.10);
  const [sl, setSl] = useState<string>('');
  const [tp, setTp] = useState<string>('');
  const [targetPrice, setTargetPrice] = useState<string>('');

  if (!isOpen) return null;

  const spec: SymbolSpec = SYMBOL_SPECS[symbol] || SYMBOL_SPECS['DAX.j'];
  const price = currentPrices[symbol] || { bid: spec.basePrice, ask: spec.basePrice + spec.spread };

  const handleAdjustLots = (delta: number) => {
    const next = Math.max(0.01, parseFloat((lots + delta).toFixed(2)));
    setLots(next);
  };

  // Tahmini Teminat
  const estimatedMargin = ((price.ask * lots * spec.contractSize) / leverage).toFixed(2);

  const handleSubmit = (side: OrderSide) => {
    onPlaceOrder({
      symbol,
      side,
      type: orderType,
      lots,
      sl: sl ? parseFloat(sl) : null,
      tp: tp ? parseFloat(tp) : null,
      targetPrice: targetPrice ? parseFloat(targetPrice) : undefined
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-sm p-0 sm:p-4">
      <div className="w-full max-w-md bg-[#161a22] border-t sm:border border-[#263140] rounded-t-2xl sm:rounded-2xl p-5 shadow-2xl text-slate-100 flex flex-col gap-4 animate-in fade-in slide-in-from-bottom duration-200">
        {/* Üst Başlık */}
        <div className="flex items-center justify-between border-b border-[#263140] pb-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold tracking-tight text-white">{symbol}</span>
              <span className="text-xs bg-[#222b38] px-2 py-0.5 rounded text-blue-400 font-mono">
                1:{leverage}
              </span>
            </div>
            <p className="text-xs text-slate-400">{spec.name}</p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-[#263140] text-slate-400 hover:text-white transition"
          >
            <X size={20} />
          </button>
        </div>

        {/* Sembol ve Emir Türü Seçici */}
        <div className="grid grid-cols-2 gap-2 text-xs font-medium">
          <select
            value={symbol}
            onChange={(e) => setSymbol(e.target.value)}
            className="bg-[#1f2633] border border-[#2c384a] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
          >
            {Object.keys(SYMBOL_SPECS).map((sym) => (
              <option key={sym} value={sym}>
                {sym}
              </option>
            ))}
          </select>

          <select
            value={orderType}
            onChange={(e) => setOrderType(e.target.value as OrderType)}
            className="bg-[#1f2633] border border-[#2c384a] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
          >
            <option value="market">Piyasa İcrası</option>
            <option value="buy_limit">Buy Limit</option>
            <option value="sell_limit">Sell Limit</option>
            <option value="buy_stop">Buy Stop</option>
            <option value="sell_stop">Sell Stop</option>
          </select>
        </div>

        {/* Hacim (Lot) Kontrolü */}
        <div className="bg-[#1b222d] border border-[#2a3647] rounded-xl p-3">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span>İşlem Hacmi (Lot)</span>
            <span className="text-blue-400">Gerekli Teminat: ${estimatedMargin}</span>
          </div>

          <div className="flex items-center justify-between gap-2">
            <div className="flex gap-1">
              <button
                type="button"
                onClick={() => handleAdjustLots(-0.1)}
                className="px-2.5 py-1.5 bg-[#252f3e] hover:bg-[#313e52] rounded-lg text-xs font-semibold text-slate-300"
              >
                -0.1
              </button>
              <button
                type="button"
                onClick={() => handleAdjustLots(-0.01)}
                className="px-2.5 py-1.5 bg-[#252f3e] hover:bg-[#313e52] rounded-lg text-xs font-semibold text-slate-300"
              >
                -0.01
              </button>
            </div>

            <input
              type="number"
              step="0.01"
              min="0.01"
              value={lots}
              onChange={(e) => setLots(Math.max(0.01, parseFloat(e.target.value) || 0.01))}
              className="w-20 text-center font-bold text-lg bg-[#12161c] border border-[#313e52] rounded-lg py-1 text-white focus:outline-none focus:border-blue-500"
            />

            <div className="flex gap-1">
              <button
                type="button"
                onClick={() => handleAdjustLots(0.01)}
                className="px-2.5 py-1.5 bg-[#252f3e] hover:bg-[#313e52] rounded-lg text-xs font-semibold text-slate-300"
              >
                +0.01
              </button>
              <button
                type="button"
                onClick={() => handleAdjustLots(0.1)}
                className="px-2.5 py-1.5 bg-[#252f3e] hover:bg-[#313e52] rounded-lg text-xs font-semibold text-slate-300"
              >
                +0.1
              </button>
            </div>
          </div>
        </div>

        {/* Fiyat Girdileri (Limit/Stop, SL, TP) */}
        {orderType !== 'market' && (
          <div>
            <label className="text-xs text-slate-400 mb-1 block">Hedef Fiyat</label>
            <input
              type="number"
              placeholder={price.ask.toString()}
              value={targetPrice}
              onChange={(e) => setTargetPrice(e.target.value)}
              className="w-full bg-[#1b222d] border border-[#2a3647] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
            />
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-red-400 mb-1 block">Stop Loss (Zarar Durdur)</label>
            <input
              type="number"
              placeholder="Yok"
              value={sl}
              onChange={(e) => setSl(e.target.value)}
              className="w-full bg-[#1b222d] border border-red-900/40 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-red-500"
            />
          </div>
          <div>
            <label className="text-xs text-emerald-400 mb-1 block">Take Profit (Kâr Al)</label>
            <input
              type="number"
              placeholder="Yok"
              value={tp}
              onChange={(e) => setTp(e.target.value)}
              className="w-full bg-[#1b222d] border border-emerald-900/40 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        {/* Fiyat Göstergesi ve Al-Sat Butonları */}
        <div className="grid grid-cols-2 gap-3 pt-2">
          {/* SELL BUTTON */}
          <button
            onClick={() => handleSubmit('sell')}
            className="flex flex-col items-center justify-center bg-[#ff3b30] hover:bg-[#e03126] active:scale-[0.98] transition p-3 rounded-xl shadow-lg"
          >
            <span className="text-xs font-semibold text-red-100 uppercase tracking-wider">SAT (SELL)</span>
            <span className="text-xl font-bold font-tabular tracking-tight text-white mt-0.5">
              {price.bid.toFixed(spec.digits)}
            </span>
          </button>

          {/* BUY BUTTON */}
          <button
            onClick={() => handleSubmit('buy')}
            className="flex flex-col items-center justify-center bg-[#2979ff] hover:bg-[#1f66de] active:scale-[0.98] transition p-3 rounded-xl shadow-lg"
          >
            <span className="text-xs font-semibold text-blue-100 uppercase tracking-wider">AL (BUY)</span>
            <span className="text-xl font-bold font-tabular tracking-tight text-white mt-0.5">
              {price.ask.toFixed(spec.digits)}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
