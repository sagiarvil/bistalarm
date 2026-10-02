'use client';

import React, { useState } from 'react';
import { Position } from '@/lib/tradingEngine';
import { X, Check } from 'lucide-react';

interface ClosePositionModalProps {
  isOpen: boolean;
  onClose: () => void;
  position: Position | null;
  onCloseFull: (positionId: string) => void;
  onClosePartial: (positionId: string, lotsToClose: number) => void;
  onUpdateSLTP: (positionId: string, sl: number | null, tp: number | null) => void;
}

export default function ClosePositionModal({
  isOpen,
  onClose,
  position,
  onCloseFull,
  onClosePartial,
  onUpdateSLTP
}: ClosePositionModalProps) {
  const [activeTab, setActiveTab] = useState<'close' | 'modify'>('close');
  const [partialLots, setPartialLots] = useState<number>(0.05);
  const [newSl, setNewSl] = useState<string>('');
  const [newTp, setNewTp] = useState<string>('');

  if (!isOpen || !position) return null;

  const isProfit = position.profit >= 0;

  const handlePartialClose = () => {
    if (partialLots > 0 && partialLots < position.lots) {
      onClosePartial(position.id, partialLots);
      onClose();
    }
  };

  const handleFullClose = () => {
    onCloseFull(position.id);
    onClose();
  };

  const handleSaveSLTP = () => {
    onUpdateSLTP(
      position.id,
      newSl ? parseFloat(newSl) : null,
      newTp ? parseFloat(newTp) : null
    );
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-sm p-0 sm:p-4">
      <div className="w-full max-w-md bg-[#161a22] border-t sm:border border-[#263140] rounded-t-2xl sm:rounded-2xl p-5 shadow-2xl text-slate-100 flex flex-col gap-4 animate-in fade-in slide-in-from-bottom duration-200">
        {/* Üst Bar */}
        <div className="flex items-center justify-between border-b border-[#263140] pb-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg text-white">#{position.ticket} {position.symbol}</span>
              <span className={`text-xs px-2 py-0.5 rounded font-bold uppercase ${
                position.side === 'buy' ? 'bg-blue-900/60 text-blue-400' : 'bg-red-900/60 text-red-400'
              }`}>
                {position.side} {position.lots} lot
              </span>
            </div>
            <p className="text-xs text-slate-400">Giriş: {position.openPrice} ➔ Anlık: {position.currentPrice}</p>
          </div>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-[#263140] text-slate-400 hover:text-white">
            <X size={20} />
          </button>
        </div>

        {/* Tab Seçici */}
        <div className="flex bg-[#12161c] p-1 rounded-xl border border-[#263140]">
          <button
            onClick={() => setActiveTab('close')}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition ${
              activeTab === 'close' ? 'bg-[#2979ff] text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            Pozisyon Kapat
          </button>
          <button
            onClick={() => {
              setActiveTab('modify');
              setNewSl(position.sl ? position.sl.toString() : '');
              setNewTp(position.tp ? position.tp.toString() : '');
            }}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition ${
              activeTab === 'modify' ? 'bg-[#2979ff] text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            SL / TP Düzenle
          </button>
        </div>

        {activeTab === 'close' ? (
          <div className="flex flex-col gap-4">
            {/* Anlık Kâr/Zarar Durumu */}
            <div className={`p-4 rounded-xl border flex flex-col items-center justify-center ${
              isProfit ? 'bg-blue-950/30 border-blue-900/50' : 'bg-red-950/30 border-red-900/50'
            }`}>
              <span className="text-xs text-slate-400">Açık Net Kâr / Zarar</span>
              <span className={`text-2xl font-bold font-tabular mt-1 ${isProfit ? 'text-blue-400' : 'text-red-500'}`}>
                {isProfit ? '+' : ''}{position.profit.toFixed(2)} USD
              </span>
            </div>

            {/* Tam Kapatma Butonu */}
            <button
              onClick={handleFullClose}
              className={`w-full py-3.5 px-4 rounded-xl font-bold text-sm text-white shadow-lg transition active:scale-[0.99] ${
                isProfit ? 'bg-blue-600 hover:bg-blue-500' : 'bg-red-600 hover:bg-red-500'
              }`}
            >
              Pozisyonu Tam Kapat ({isProfit ? '+' : ''}{position.profit.toFixed(2)} USD)
            </button>

            {/* Kısmi Kapatma Seçeneği (Eğer lot > 0.01 ise) */}
            {position.lots > 0.01 && (
              <div className="bg-[#1b222d] border border-[#2a3647] rounded-xl p-3 flex flex-col gap-2">
                <span className="text-xs font-semibold text-slate-300">Kısmi Kapat (Partial Close)</span>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    max={position.lots - 0.01}
                    value={partialLots}
                    onChange={(e) => setPartialLots(parseFloat(e.target.value) || 0.01)}
                    className="w-24 bg-[#12161c] border border-[#313e52] rounded-lg px-2 py-1.5 text-center text-sm font-bold text-white focus:outline-none"
                  />
                  <span className="text-xs text-slate-400">Lot Kapat (Kalan: {(position.lots - partialLots).toFixed(2)})</span>
                </div>
                <button
                  onClick={handlePartialClose}
                  className="w-full mt-1 py-2 bg-[#252f3e] hover:bg-[#313e52] rounded-lg text-xs font-bold text-amber-300 border border-amber-500/30 transition"
                >
                  {partialLots} Lot Kısmi Kapat
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            <div>
              <label className="text-xs text-red-400 mb-1 block">Zarar Durdur (Stop Loss)</label>
              <input
                type="number"
                placeholder="Örn: 24900"
                value={newSl}
                onChange={(e) => setNewSl(e.target.value)}
                className="w-full bg-[#1b222d] border border-red-900/40 rounded-lg px-3 py-2 text-sm text-white focus:outline-none"
              />
            </div>
            <div>
              <label className="text-xs text-emerald-400 mb-1 block">Kâr Al (Take Profit)</label>
              <input
                type="number"
                placeholder="Örn: 25400"
                value={newTp}
                onChange={(e) => setNewTp(e.target.value)}
                className="w-full bg-[#1b222d] border border-emerald-900/40 rounded-lg px-3 py-2 text-sm text-white focus:outline-none"
              />
            </div>
            <button
              onClick={handleSaveSLTP}
              className="mt-2 w-full py-3 bg-[#2979ff] hover:bg-[#1f66de] rounded-xl font-bold text-sm text-white shadow-lg transition"
            >
              Emri Değiştir (Kaydet)
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
