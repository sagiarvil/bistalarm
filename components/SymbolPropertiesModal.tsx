'use client';

import React from 'react';
import { SymbolSpec, SYMBOL_SPECS } from '@/lib/tradingEngine';
import { X, Check } from 'lucide-react';

interface SymbolPropertiesModalProps {
  isOpen: boolean;
  onClose: () => void;
  symbol: string;
  leverage: number;
}

export default function SymbolPropertiesModal({
  isOpen,
  onClose,
  symbol,
  leverage
}: SymbolPropertiesModalProps) {
  if (!isOpen) return null;

  const spec: SymbolSpec = SYMBOL_SPECS[symbol] || SYMBOL_SPECS['DAX.j'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-150 font-sans">
      <div className="w-full max-w-sm bg-[#161b24] border border-[#263140] rounded-3xl p-5 shadow-2xl flex flex-col gap-3">
        <div className="flex items-center justify-between border-b border-[#242f3e] pb-2">
          <div>
            <span className="font-bold text-base text-white">{symbol} Özellikleri</span>
            <span className="text-xs text-slate-400 block">{spec.name}</span>
          </div>
          <button onClick={onClose} className="p-1 rounded-full text-slate-400 hover:text-white">
            <X size={18} />
          </button>
        </div>

        {/* Özellik Listesi */}
        <div className="divide-y divide-[#202937] text-xs space-y-1">
          <div className="py-2 flex justify-between text-slate-300">
            <span>Sözleşme Büyüklüğü:</span>
            <span className="font-bold text-white">{spec.contractSize}</span>
          </div>
          <div className="py-2 flex justify-between text-slate-300">
            <span>Kategori:</span>
            <span className="font-semibold text-blue-400">{spec.category}</span>
          </div>
          <div className="py-2 flex justify-between text-slate-300">
            <span>Basamak Sayısı (Digits):</span>
            <span className="font-bold text-white">{spec.digits}</span>
          </div>
          <div className="py-2 flex justify-between text-slate-300">
            <span>Spread Tipi:</span>
            <span className="text-emerald-400 font-semibold">Yüzen (Floating)</span>
          </div>
          <div className="py-2 flex justify-between text-slate-300">
            <span>Hesap Kaldıracı:</span>
            <span className="font-bold text-amber-400 font-mono">1:{leverage}</span>
          </div>
          <div className="py-2 flex justify-between text-slate-300">
            <span>Komisyon (Lot Başı):</span>
            <span className="font-bold text-white">${spec.commissionPerLot} USD</span>
          </div>
          <div className="py-2 flex justify-between text-slate-300">
            <span>Minimum Hacim:</span>
            <span className="font-semibold text-white">0.01 Lot</span>
          </div>
          <div className="py-2 flex justify-between text-slate-300">
            <span>Maksimum Hacim:</span>
            <span className="font-semibold text-white">100.00 Lot</span>
          </div>
          <div className="py-2 flex justify-between text-slate-300">
            <span>Hacim Adımı (Step):</span>
            <span className="font-semibold text-white">0.01 Lot</span>
          </div>
          <div className="py-2 flex justify-between text-slate-300">
            <span>Stop-out Seviyesi:</span>
            <span className="font-bold text-red-400">%50.0</span>
          </div>
          <div className="py-2 flex justify-between text-slate-300">
            <span>İşlem Saatleri:</span>
            <span className="text-slate-200">24 Saat / 5 Gün</span>
          </div>
        </div>

        <button
          onClick={onClose}
          className="mt-2 w-full py-2.5 bg-blue-600 hover:bg-blue-500 rounded-xl font-bold text-xs text-white shadow"
        >
          Kapat
        </button>
      </div>
    </div>
  );
}
