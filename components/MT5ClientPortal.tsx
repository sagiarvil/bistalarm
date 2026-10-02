'use client';

import React, { useState } from 'react';
import { UserAccount, Position, SYMBOL_SPECS, SymbolSpec, OrderSide, OrderType } from '@/lib/tradingEngine';
import MT5Chart from './MT5Chart';
import NewOrderModal from './NewOrderModal';
import ClosePositionModal from './ClosePositionModal';
import {
  TrendingUp,
  TrendingDown,
  Layers,
  Clock,
  Shield,
  Trophy,
  Smartphone,
  Plus,
  X,
  CreditCard,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  UserPlus
} from 'lucide-react';

interface MT5ClientPortalProps {
  account: UserAccount;
  currentPrices: Record<string, { bid: number; ask: number; high: number; low: number; time: string }>;
  onPlaceOrder: (params: any) => void;
  onCloseFull: (id: string) => void;
  onClosePartial: (id: string, lots: number) => void;
  onUpdateSLTP: (id: string, sl: number | null, tp: number | null) => void;
  onDeposit: (amount: number) => void;
  onChangeLeverage: (leverage: number) => void;
  activeView: 'mobile' | 'desktop';
  setActiveView: (view: 'mobile' | 'desktop') => void;
  rooms: any[];
}

export default function MT5ClientPortal({
  account,
  currentPrices,
  onPlaceOrder,
  onCloseFull,
  onClosePartial,
  onUpdateSLTP,
  onDeposit,
  onChangeLeverage,
  activeView,
  setActiveView,
  rooms
}: MT5ClientPortalProps) {
  const [selectedSymbol, setSelectedSymbol] = useState<string>('DAX.j');
  const [orderLots, setOrderLots] = useState<number>(0.10);
  const [terminalTab, setTerminalTab] = useState<'trade' | 'history' | 'competition' | 'ledger'>('trade');
  const [selectedPositionForClose, setSelectedPositionForClose] = useState<Position | null>(null);
  const [isNewOrderModalOpen, setIsNewOrderModalOpen] = useState(false);

  const spec: SymbolSpec = SYMBOL_SPECS[selectedSymbol] || SYMBOL_SPECS['DAX.j'];
  const price = currentPrices[selectedSymbol] || { bid: spec.basePrice, ask: spec.basePrice + spec.spread, high: spec.basePrice * 1.01, low: spec.basePrice * 0.99, time: '17:21:45' };

  // Hızlı One-Click Market Al/Sat
  const handleQuickOrder = (side: OrderSide) => {
    onPlaceOrder({
      symbol: selectedSymbol,
      side,
      type: 'market',
      lots: orderLots,
      sl: null,
      tp: null
    });
  };

  return (
    <div className="flex flex-col h-screen w-full bg-[#0d1117] text-slate-200 select-none overflow-hidden">
      {/* ======================= ÜST KONTROL & BİLGİ ÇUBUĞU ======================= */}
      <header className="h-14 bg-[#161b22] border-b border-[#21262d] px-4 flex items-center justify-between z-10">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center font-black text-white text-sm shadow">
              MT5
            </div>
            <div>
              <span className="font-bold text-sm tracking-tight text-white block">MetaTrader 5 WebTrader</span>
              <span className="text-[10px] text-slate-400">Müşteri İşlem & Yönetim Platformu</span>
            </div>
          </div>

          <div className="h-6 w-[1px] bg-[#30363d]" />

          {/* Hesap Bilgileri */}
          <div className="flex items-center gap-4 text-xs font-tabular">
            <div>
              <span className="text-slate-400">Hesap: </span>
              <span className="font-semibold text-white">#{account.login} ({account.name})</span>
            </div>
            <div>
              <span className="text-slate-400">Kaldıraç: </span>
              <span className="font-bold text-blue-400 font-mono">1:{account.leverage}</span>
            </div>
          </div>
        </div>

        {/* Canlı Bakiye Metrikleri */}
        <div className="flex items-center gap-5 text-xs font-tabular">
          <div className="flex flex-col text-right">
            <span className="text-[10px] text-slate-400 uppercase">Bakiye</span>
            <span className="font-bold text-white">${account.balance.toFixed(2)}</span>
          </div>
          <div className="flex flex-col text-right">
            <span className="text-[10px] text-slate-400 uppercase">Varlık (Equity)</span>
            <span className="font-bold text-blue-400">${account.equity.toFixed(2)}</span>
          </div>
          <div className="flex flex-col text-right">
            <span className="text-[10px] text-slate-400 uppercase">Teminat</span>
            <span className="font-semibold text-slate-300">${account.margin.toFixed(2)}</span>
          </div>
          <div className="flex flex-col text-right">
            <span className="text-[10px] text-slate-400 uppercase">Serbest Teminat</span>
            <span className="font-bold text-emerald-400">${account.freeMargin.toFixed(2)}</span>
          </div>
          <div className="flex flex-col text-right">
            <span className="text-[10px] text-slate-400 uppercase">Teminat Seviyesi</span>
            <span className="font-bold text-amber-400">
              {account.marginLevel !== null ? `%${account.marginLevel.toFixed(1)}` : 'Açık pozisyon yok'}
            </span>
          </div>

          {/* Mobil Görünüme Geçiş Butonu */}
          <button
            onClick={() => setActiveView('mobile')}
            className="flex items-center gap-1.5 bg-[#21262d] hover:bg-[#30363d] text-white px-3 py-1.5 rounded-lg text-xs font-medium border border-[#30363d] transition ml-2"
          >
            <Smartphone size={14} className="text-blue-400" />
            <span>📱 MT5 Mobil Görünümü</span>
          </button>
        </div>
      </header>

      {/* ======================= ANA İÇERİK BÖLÜMÜ (3 SÜTUN) ======================= */}
      <div className="flex-1 flex overflow-hidden">
        {/* SOL SÜTUN: Piyasa Gözlemi (Market Watch) */}
        <aside className="w-72 bg-[#12161c] border-r border-[#21262d] flex flex-col">
          <div className="p-3 border-b border-[#21262d] flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-300">Piyasa Gözlemi</span>
            <button
              onClick={() => setIsNewOrderModalOpen(true)}
              className="text-xs bg-blue-600 hover:bg-blue-500 text-white px-2 py-0.5 rounded font-bold transition"
            >
              + Yeni Emir
            </button>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-[#1a212b] no-scrollbar">
            {Object.entries(SYMBOL_SPECS).map(([sym, s]) => {
              const p = currentPrices[sym] || { bid: s.basePrice, ask: s.basePrice + s.spread, high: s.basePrice * 1.01, low: s.basePrice * 0.99, time: '17:21:45' };
              const spread = ((p.ask - p.bid) / s.pipSize).toFixed(1);
              const isSelected = selectedSymbol === sym;

              return (
                <div
                  key={sym}
                  onClick={() => setSelectedSymbol(sym)}
                  className={`p-3 cursor-pointer transition flex items-center justify-between ${
                    isSelected ? 'bg-[#1b222d] border-l-4 border-blue-500' : 'hover:bg-[#161c24]'
                  }`}
                >
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-xs text-white">{sym}</span>
                      <span className="text-[9px] bg-[#232c3a] text-slate-400 px-1 py-0.5 rounded">{spread}</span>
                    </div>
                    <span className="text-[10px] text-slate-400 block mt-0.5">{s.name}</span>
                  </div>

                  <div className="flex items-center gap-3 font-tabular text-right">
                    <div>
                      <span className="text-[10px] text-slate-400 block">Bid</span>
                      <span className="font-bold text-xs text-blue-400">{p.bid.toFixed(s.digits)}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block">Ask</span>
                      <span className="font-bold text-xs text-red-400">{p.ask.toFixed(s.digits)}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </aside>

        {/* ORTA SÜTUN: Grafik & Tek Tıkla İşlem Paneli */}
        <main className="flex-1 flex flex-col bg-[#0e1217] overflow-hidden">
          {/* Tek Tıkla İşlem (One-Click Trading Bar) */}
          <div className="h-12 bg-[#161c24] border-b border-[#21262d] px-4 flex items-center justify-between z-10">
            <div className="flex items-center gap-3">
              <span className="font-bold text-sm text-white">{selectedSymbol}</span>
              <span className="text-xs text-slate-400">{spec.name}</span>
            </div>

            <div className="flex items-center gap-2">
              {/* SELL BUTTON */}
              <button
                onClick={() => handleQuickOrder('sell')}
                className="flex items-center gap-2 bg-[#ff3b30] hover:bg-[#e03126] text-white px-4 py-1.5 rounded-lg text-xs font-bold transition shadow active:scale-95"
              >
                <span>SAT (SELL)</span>
                <span className="font-tabular">{price.bid.toFixed(spec.digits)}</span>
              </button>

              {/* LOT SEÇİCİ */}
              <div className="flex items-center bg-[#12161c] border border-[#2a3443] rounded-lg px-2 py-1">
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={orderLots}
                  onChange={(e) => setOrderLots(Math.max(0.01, parseFloat(e.target.value) || 0.01))}
                  className="w-16 bg-transparent text-center font-bold text-xs text-white focus:outline-none"
                />
                <span className="text-[10px] text-slate-400">Lot</span>
              </div>

              {/* BUY BUTTON */}
              <button
                onClick={() => handleQuickOrder('buy')}
                className="flex items-center gap-2 bg-[#2979ff] hover:bg-[#1f66de] text-white px-4 py-1.5 rounded-lg text-xs font-bold transition shadow active:scale-95"
              >
                <span>AL (BUY)</span>
                <span className="font-tabular">{price.ask.toFixed(spec.digits)}</span>
              </button>
            </div>
          </div>

          {/* Mum Grafik Alanı */}
          <div className="flex-1 relative">
            <MT5Chart symbol={selectedSymbol} currentPrice={price.bid} />
          </div>
        </main>
      </div>

      {/* ======================= ALT SÜTUN: TERMINAL (ARAÇ KUTUSU) ======================= */}
      <footer className="h-64 bg-[#12161c] border-t border-[#21262d] flex flex-col">
        {/* Terminal Sekmeleri */}
        <div className="h-9 bg-[#161c24] border-b border-[#21262d] px-3 flex items-center justify-between">
          <div className="flex items-center gap-1">
            <button
              onClick={() => setTerminalTab('trade')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-t-md transition ${
                terminalTab === 'trade'
                  ? 'bg-[#12161c] text-white border-t-2 border-blue-500'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Açık Pozisyonlar ({account.positions.length})
            </button>
            <button
              onClick={() => setTerminalTab('history')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-t-md transition ${
                terminalTab === 'history'
                  ? 'bg-[#12161c] text-white border-t-2 border-blue-500'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Hesap Geçmişi ({account.history.length})
            </button>
            <button
              onClick={() => setTerminalTab('competition')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-t-md transition flex items-center gap-1.5 ${
                terminalTab === 'competition'
                  ? 'bg-[#12161c] text-amber-400 border-t-2 border-amber-500'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Trophy size={13} />
              Arkadaş Yarışması / Sıralama
            </button>
            <button
              onClick={() => setTerminalTab('ledger')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-t-md transition ${
                terminalTab === 'ledger'
                  ? 'bg-[#12161c] text-white border-t-2 border-blue-500'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Sanal Para & Finansal Defter
            </button>
          </div>

          {/* Hızlı Bakiye Ekleme / Kaldıraç */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => onDeposit(5000)}
              className="text-[11px] bg-emerald-950 text-emerald-300 border border-emerald-800 hover:bg-emerald-900 px-2 py-0.5 rounded font-medium transition"
            >
              +$5.000 Fon Ekle
            </button>
          </div>
        </div>

        {/* Terminal İçeriği Tablosu */}
        <div className="flex-1 overflow-y-auto no-scrollbar font-tabular text-xs">
          {terminalTab === 'trade' && (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#151a23] text-slate-400 text-[11px] border-b border-[#21262d] sticky top-0">
                  <th className="py-2 px-3">Bilet</th>
                  <th className="py-2 px-3">Açılış Zamanı</th>
                  <th className="py-2 px-3">Tür</th>
                  <th className="py-2 px-3">Hacim</th>
                  <th className="py-2 px-3">Sembol</th>
                  <th className="py-2 px-3">Giriş Fiyatı</th>
                  <th className="py-2 px-3">S / L</th>
                  <th className="py-2 px-3">T / P</th>
                  <th className="py-2 px-3">Fiyat</th>
                  <th className="py-2 px-3">Komisyon</th>
                  <th className="py-2 px-3">Kâr / Zarar</th>
                  <th className="py-2 px-3 text-right">Eylem</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1a212b]">
                {account.positions.length === 0 ? (
                  <tr>
                    <td colSpan={12} className="py-8 text-center text-slate-500">
                      Açık pozisyon bulunmamaktadır.
                    </td>
                  </tr>
                ) : (
                  account.positions.map((pos) => (
                    <tr key={pos.id} className="hover:bg-[#161c24] transition">
                      <td className="py-2 px-3 font-mono text-slate-300">#{pos.ticket}</td>
                      <td className="py-2 px-3 text-slate-400">{pos.openTime}</td>
                      <td className="py-2 px-3 font-bold uppercase">
                        <span className={pos.side === 'buy' ? 'text-blue-400' : 'text-red-400'}>
                          {pos.side}
                        </span>
                      </td>
                      <td className="py-2 px-3 font-bold text-white">{pos.lots}</td>
                      <td className="py-2 px-3 font-bold text-white">{pos.symbol}</td>
                      <td className="py-2 px-3">{pos.openPrice.toFixed(2)}</td>
                      <td className="py-2 px-3 text-slate-400">{pos.sl || 'Yok'}</td>
                      <td className="py-2 px-3 text-slate-400">{pos.tp || 'Yok'}</td>
                      <td className="py-2 px-3 text-slate-200">{pos.currentPrice.toFixed(2)}</td>
                      <td className="py-2 px-3 text-slate-400">{pos.commission.toFixed(2)}</td>
                      <td className={`py-2 px-3 font-bold ${pos.profit >= 0 ? 'text-blue-400' : 'text-red-500'}`}>
                        {pos.profit >= 0 ? `+${pos.profit.toFixed(2)}` : pos.profit.toFixed(2)} USD
                      </td>
                      <td className="py-2 px-3 text-right">
                        <button
                          onClick={() => setSelectedPositionForClose(pos)}
                          className="bg-[#212936] hover:bg-red-950 hover:text-red-400 text-slate-300 px-2 py-0.5 rounded text-[11px] font-semibold transition"
                        >
                          Kapat ✕
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}

          {terminalTab === 'history' && (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#151a23] text-slate-400 text-[11px] border-b border-[#21262d] sticky top-0">
                  <th className="py-2 px-3">Bilet</th>
                  <th className="py-2 px-3">Kapanış Zamanı</th>
                  <th className="py-2 px-3">Tür</th>
                  <th className="py-2 px-3">Hacim</th>
                  <th className="py-2 px-3">Sembol</th>
                  <th className="py-2 px-3">Açılış</th>
                  <th className="py-2 px-3">Kapanış</th>
                  <th className="py-2 px-3">Komisyon</th>
                  <th className="py-2 px-3">Swap</th>
                  <th className="py-2 px-3 text-right">Net Kâr</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1a212b]">
                {account.history.map((h, i) => (
                  <tr key={h.id || i} className="hover:bg-[#161c24] transition">
                    <td className="py-2 px-3 font-mono text-slate-400">#{h.ticket}</td>
                    <td className="py-2 px-3 text-slate-400">{h.closeTime || '2026.10.01 17:19:34'}</td>
                    <td className={`py-2 px-3 font-bold uppercase ${h.side === 'buy' ? 'text-blue-400' : 'text-red-400'}`}>
                      {h.side}
                    </td>
                    <td className="py-2 px-3 font-bold text-white">{h.lots}</td>
                    <td className="py-2 px-3 font-bold text-white">{h.symbol}</td>
                    <td className="py-2 px-3 text-slate-300">{h.openPrice.toFixed(2)}</td>
                    <td className="py-2 px-3 text-slate-300">{(h.closePrice || h.currentPrice).toFixed(2)}</td>
                    <td className="py-2 px-3 text-slate-400">{h.commission.toFixed(2)}</td>
                    <td className="py-2 px-3 text-slate-400">{h.swap.toFixed(2)}</td>
                    <td className={`py-2 px-3 text-right font-bold ${h.profit >= 0 ? 'text-blue-400' : 'text-red-500'}`}>
                      {h.profit >= 0 ? `+${h.profit.toFixed(2)}` : h.profit.toFixed(2)} USD
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {terminalTab === 'competition' && (
            <div className="p-4 space-y-4">
              <div className="flex items-center justify-between bg-[#161c24] p-3 rounded-xl border border-[#21262d]">
                <div>
                  <span className="font-bold text-sm text-white">🏆 Haftalık Arkadaş Sanal Piyasa Şampiyonası</span>
                  <p className="text-xs text-slate-400 mt-0.5">Yönetici: Barış | Başlangıç Fonu: 10.000$ | Kalan Süre: 42 Dakika</p>
                </div>
                <span className="text-xs bg-emerald-950 text-emerald-400 border border-emerald-800 px-2.5 py-1 rounded-full font-bold">
                  CANLI YARIŞMA AKTİF
                </span>
              </div>

              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#151a23] text-slate-400 text-[11px] border-b border-[#21262d]">
                    <th className="py-2 px-3">Sıra</th>
                    <th className="py-2 px-3">Katılımcı / Üye</th>
                    <th className="py-2 px-3">Güncel Varlık (Equity)</th>
                    <th className="py-2 px-3">İşlem Sayısı</th>
                    <th className="py-2 px-3 text-right">Net Getiri (%)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1a212b]">
                  {rooms[0]?.participants.map((p: any, idx: number) => (
                    <tr key={p.userId} className={`hover:bg-[#161c24] ${idx === 0 ? 'bg-amber-950/20' : ''}`}>
                      <td className="py-2 px-3 font-bold">
                        {idx === 0 ? '🥇 1.' : idx === 1 ? '🥈 2.' : '🥉 3.'}
                      </td>
                      <td className="py-2 px-3 font-bold text-white">{p.userName}</td>
                      <td className="py-2 px-3 font-bold text-slate-200">${p.equity.toFixed(2)}</td>
                      <td className="py-2 px-3 text-slate-400">{p.tradesCount} İşlem</td>
                      <td className={`py-2 px-3 text-right font-extrabold ${p.netReturn >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                        {p.netReturn >= 0 ? `+${p.netReturn.toFixed(2)}%` : `${p.netReturn.toFixed(2)}%`}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {terminalTab === 'ledger' && (
            <div className="p-4">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#151a23] text-slate-400 text-[11px] border-b border-[#21262d]">
                    <th className="py-2 px-3">Tarih</th>
                    <th className="py-2 px-3">Tür</th>
                    <th className="py-2 px-3">Açıklama</th>
                    <th className="py-2 px-3 text-right">Miktar (USD)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1a212b]">
                  {account.ledger.map((l) => (
                    <tr key={l.id} className="hover:bg-[#161c24]">
                      <td className="py-2 px-3 text-slate-400">{l.time}</td>
                      <td className="py-2 px-3 uppercase font-bold text-xs">{l.type}</td>
                      <td className="py-2 px-3 text-slate-300">{l.description}</td>
                      <td className={`py-2 px-3 text-right font-bold ${l.amount >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                        {l.amount >= 0 ? `+${l.amount.toFixed(2)}` : l.amount.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </footer>

      {/* Yeni Emir Modalı */}
      <NewOrderModal
        isOpen={isNewOrderModalOpen}
        onClose={() => setIsNewOrderModalOpen(false)}
        selectedSymbol={selectedSymbol}
        currentPrices={currentPrices}
        onPlaceOrder={onPlaceOrder}
        leverage={account.leverage}
      />

      {/* Pozisyon Kapatma Modalı */}
      <ClosePositionModal
        isOpen={!!selectedPositionForClose}
        onClose={() => setSelectedPositionForClose(null)}
        position={selectedPositionForClose}
        onCloseFull={onCloseFull}
        onClosePartial={onClosePartial}
        onUpdateSLTP={onUpdateSLTP}
      />
    </div>
  );
}
