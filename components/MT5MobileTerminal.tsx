'use client';

import React, { useState } from 'react';
import { UserAccount, Position, SYMBOL_SPECS } from '@/lib/tradingEngine';
import MT5Chart from './MT5Chart';
import NewOrderModal from './NewOrderModal';
import ClosePositionModal from './ClosePositionModal';
import {
  ArrowUpDown,
  CandlestickChart,
  BarChart2,
  Clock,
  Settings,
  BatteryMedium,
  Wifi,
  SlidersHorizontal,
  ChevronRight,
  PlusCircle,
  TrendingUp,
  TrendingDown,
  ShieldCheck,
  User,
  Plus
} from 'lucide-react';

interface MT5MobileTerminalProps {
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
}

export default function MT5MobileTerminal({
  account,
  currentPrices,
  onPlaceOrder,
  onCloseFull,
  onClosePartial,
  onUpdateSLTP,
  onDeposit,
  onChangeLeverage,
  activeView,
  setActiveView
}: MT5MobileTerminalProps) {
  // Alt Bar Sekmesi: quotes | chart | trade | history | settings
  const [activeTab, setActiveTab] = useState<'quotes' | 'chart' | 'trade' | 'history' | 'settings'>('history');
  
  // Geçmiş Sekmeleri: positions | orders | deals
  const [historyTab, setHistoryTab] = useState<'positions' | 'orders' | 'deals'>('positions');

  // Modal Durumları
  const [isNewOrderOpen, setIsNewOrderOpen] = useState(false);
  const [selectedSymbolForOrder, setSelectedSymbolForOrder] = useState('DAX.j');
  const [selectedPositionForClose, setSelectedPositionForClose] = useState<Position | null>(null);

  // İşlem Özeti (History için)
  const depositTotal = account.ledger
    .filter(l => l.type === 'deposit')
    .reduce((sum, l) => sum + l.amount, 0);

  const withdrawalTotal = account.ledger
    .filter(l => l.type === 'withdrawal')
    .reduce((sum, l) => sum + l.amount, 0);

  const profitTotal = account.history.reduce((sum, p) => sum + p.profit, 0);
  const commissionTotal = -627.84; // Görseldeki değer
  const swapTotal = 0.00;

  return (
    <div className="w-full flex justify-center items-center py-0 sm:py-6 bg-[#080b0f] min-h-screen text-slate-100">
      {/* Mobil Telefon Kasası Simülasyonu */}
      <div className="relative w-full sm:max-w-[420px] h-[100dvh] sm:h-[860px] bg-black sm:rounded-[44px] sm:border-[8px] sm:border-[#1e242d] sm: overflow-hidden flex flex-col font-sans">
        
        {/* iOS Üst Durum Çubuğu (Status Bar) */}
        <div className="h-11 px-6 pt-2 flex items-center justify-between text-xs font-semibold text-white select-none z-20">
          <span className="font-bold text-sm tracking-tight">17:21</span>
          {/* iOS Dynamic Island */}
          <div className="w-24 h-4 bg-black rounded-full hidden sm:block" />
          <div className="flex items-center gap-1.5 text-slate-200">
            <span className="text-[10px] font-bold">LTE</span>
            <div className="flex items-center gap-1 bg-[#1a2e1d] text-emerald-400 px-1 py-0.5 rounded text-[11px] font-mono">
              <span className="text-[10px] font-bold">86</span>
              <BatteryMedium size={14} className="text-emerald-400 fill-emerald-400" />
            </div>
          </div>
        </div>

        {/* ======================= 1. GEÇMİŞ (HISTORY) SEKMESİ (GÖRSELDEKİ EKRAN) ======================= */}
        {activeTab === 'history' && (
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Üst Hap Butonları: [Pozisyonlar] [Emirler] [İşlemler] */}
            <div className="px-4 py-2 flex items-center justify-between">
              <button className="p-1 text-slate-400 hover:text-white">
                <ArrowUpDown size={18} />
              </button>

              <div className="flex bg-[#1c222b] p-0.5 rounded-full border border-[#2a3443]">
                <button
                  onClick={() => setHistoryTab('positions')}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition ${
                    historyTab === 'positions' ? 'bg-[#323d4e] text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Pozisyonlar
                </button>
                <button
                  onClick={() => setHistoryTab('orders')}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition ${
                    historyTab === 'orders' ? 'bg-[#323d4e] text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Emirler
                </button>
                <button
                  onClick={() => setHistoryTab('deals')}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition ${
                    historyTab === 'deals' ? 'bg-[#323d4e] text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  İşlemler
                </button>
              </div>

              <button className="p-1 text-slate-400 hover:text-white">
                <Clock size={18} />
              </button>
            </div>

            {/* Pozisyonlar / İşlemler Listesi (Görselin Aynısı) */}
            <div className="flex-1 overflow-y-auto px-4 py-1 divide-y divide-[#18202b] no-scrollbar">
              {/* Sabit görseldeki liste elemanları */}
              {account.history.map((item, idx) => (
                <div key={item.id || idx} className="py-2.5 flex items-start justify-between">
                  <div className="flex flex-col">
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-sm tracking-tight text-white">{item.symbol}</span>
                      <span className={`text-xs font-semibold ${item.side === 'buy' ? 'text-blue-400' : 'text-red-400'}`}>
                        {item.side} {item.lots}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-0.5 font-tabular">
                      <span>{item.openPrice.toFixed(2)}</span>
                      <span>→</span>
                      <span>{(item.closePrice || item.currentPrice).toFixed(2)}</span>
                    </div>
                  </div>

                  <div className="flex flex-col items-end">
                    <span className={`font-bold font-tabular text-sm tracking-tight ${
                      item.profit >= 0 ? 'text-blue-400' : 'text-red-500'
                    }`}>
                      {item.profit >= 0 ? item.profit.toFixed(2) : item.profit.toFixed(2)}
                    </span>
                    <span className="text-[11px] text-slate-500 font-tabular mt-0.5">
                      {item.closeTime || '2026.10.01 17:19:34'}
                    </span>
                  </div>
                </div>
              ))}

              {/* Balance Para Çekme Satırı (Görselde yer alan: Balance Withdrawal SC -1 000.00) */}
              <div className="py-2.5 flex items-start justify-between">
                <div className="flex flex-col">
                  <span className="font-bold text-sm text-white">Balance</span>
                  <span className="text-xs text-slate-400 mt-0.5">Withdrawal SC</span>
                </div>
                <div className="flex flex-col items-end">
                  <span className="font-bold font-tabular text-sm text-red-500">-1 000.00</span>
                  <span className="text-[11px] text-slate-500 font-tabular mt-0.5">2026.10.01 14:30:43</span>
                </div>
              </div>
            </div>

            {/* Alt Finansal Döküm Bölümü (Görseldeki alt özet tablosu) */}
            <div className="px-5 py-3 border-t border-[#1c2430] bg-black/90 space-y-1 text-xs font-medium">
              <div className="flex justify-between text-slate-300">
                <span>Para yatır</span>
                <span className="font-bold font-tabular text-white">8 195.00</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Kredi</span>
                <span className="font-bold font-tabular text-white">4 098.00</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Para çek</span>
                <span className="font-bold font-tabular text-white">-1 000.00</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Kar</span>
                <span className="font-bold font-tabular text-white">3 179.44</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Swap</span>
                <span className="font-bold font-tabular text-white">0.00</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Komisyon</span>
                <span className="font-bold font-tabular text-white">-627.84</span>
              </div>
              <div className="flex justify-between text-slate-100 pt-1 border-t border-[#1f2733] font-bold text-sm">
                <span>Bakiye</span>
                <span className="font-extrabold font-tabular text-white text-base">
                  {account.balance.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* ======================= 2. İŞLEM (TRADE) SEKMESİ ======================= */}
        {activeTab === 'trade' && (
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Üst Başlık */}
            <div className="px-4 py-3 flex items-center justify-between border-b border-[#1c2430]">
              <div className="flex items-center gap-2">
                <span className="font-bold text-base text-white">#{account.login}</span>
                <span className="text-[11px] bg-blue-900/40 text-blue-400 px-2 py-0.5 rounded font-mono">
                  1:{account.leverage}
                </span>
              </div>
              <button
                onClick={() => {
                  setSelectedSymbolForOrder('DAX.j');
                  setIsNewOrderOpen(true);
                }}
                className="flex items-center gap-1 bg-[#2979ff] hover:bg-[#1f66de] text-white px-3 py-1.5 rounded-lg text-xs font-bold transition shadow"
              >
                <Plus size={14} /> Yeni İşlem
              </button>
            </div>

            {/* Bakiye & Teminat Kartı */}
            <div className="p-4 bg-[#12161c] border-b border-[#1c2430] space-y-1.5 text-xs font-tabular">
              <div className="flex justify-between text-slate-400">
                <span>Bakiye:</span>
                <span className="text-white font-bold">${account.balance.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Varlık (Equity):</span>
                <span className="text-blue-400 font-bold">${account.equity.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Kullanılan Teminat:</span>
                <span className="text-slate-200 font-semibold">${account.margin.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Serbest Teminat:</span>
                <span className="text-emerald-400 font-bold">${account.freeMargin.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Teminat Seviyesi (%):</span>
                <span className="text-amber-400 font-bold">
                  {account.marginLevel !== null ? `%${account.marginLevel.toFixed(1)}` : 'Açık pozisyon yok'}
                </span>
              </div>
            </div>

            {/* Açık Pozisyonlar */}
            <div className="flex-1 overflow-y-auto px-4 py-2 divide-y divide-[#18202b] no-scrollbar">
              <div className="py-1 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Açık Pozisyonlar ({account.positions.length})
              </div>

              {account.positions.length === 0 ? (
                <div className="py-12 text-center text-xs text-slate-500">
                  Açık pozisyonunuz bulunmamaktadır.
                </div>
              ) : (
                account.positions.map((pos) => (
                  <div
                    key={pos.id}
                    onClick={() => setSelectedPositionForClose(pos)}
                    className="py-3 flex items-start justify-between cursor-pointer hover:bg-[#161c24] -mx-2 px-2 rounded-lg transition"
                  >
                    <div className="flex flex-col">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-sm text-white">{pos.symbol}</span>
                        <span className={`text-xs font-semibold ${pos.side === 'buy' ? 'text-blue-400' : 'text-red-400'}`}>
                          {pos.side} {pos.lots}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-0.5 font-tabular">
                        <span>{pos.openPrice.toFixed(2)}</span>
                        <span>→</span>
                        <span className="text-slate-200">{pos.currentPrice.toFixed(2)}</span>
                      </div>
                      {(pos.sl || pos.tp) && (
                        <div className="flex gap-2 text-[10px] text-slate-500 mt-0.5">
                          {pos.sl && <span>SL: {pos.sl}</span>}
                          {pos.tp && <span>TP: {pos.tp}</span>}
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col items-end">
                      <span className={`font-bold font-tabular text-sm ${
                        pos.profit >= 0 ? 'text-blue-400' : 'text-red-500'
                      }`}>
                        {pos.profit >= 0 ? `+${pos.profit.toFixed(2)}` : pos.profit.toFixed(2)}
                      </span>
                      <span className="text-[10px] text-slate-400 mt-1 bg-[#1e2633] px-2 py-0.5 rounded">
                        Kapat ➔
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* ======================= 3. FİYATLAR (QUOTES) SEKMESİ ======================= */}
        {activeTab === 'quotes' && (
          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="px-4 py-3 border-b border-[#1c2430] flex items-center justify-between">
              <span className="font-bold text-base text-white">Piyasa Fiyatları</span>
              <button
                onClick={() => {
                  setSelectedSymbolForOrder('DAX.j');
                  setIsNewOrderOpen(true);
                }}
                className="p-1.5 bg-[#2979ff] text-white rounded-lg text-xs font-bold flex items-center gap-1"
              >
                <Plus size={14} /> Yeni Emir
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-4 divide-y divide-[#18202b] no-scrollbar">
              {Object.entries(SYMBOL_SPECS).map(([sym, spec]) => {
                const price = currentPrices[sym] || { bid: spec.basePrice, ask: spec.basePrice + spec.spread, high: spec.basePrice * 1.01, low: spec.basePrice * 0.99, time: '17:21:45' };
                const spreadPips = ((price.ask - price.bid) / spec.pipSize).toFixed(1);

                return (
                  <div
                    key={sym}
                    onClick={() => {
                      setSelectedSymbolForOrder(sym);
                      setIsNewOrderOpen(true);
                    }}
                    className="py-3 flex items-center justify-between cursor-pointer hover:bg-[#161c24] -mx-2 px-2 rounded-lg transition"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-white">{sym}</span>
                        <span className="text-[10px] text-slate-400 bg-[#1c2430] px-1.5 py-0.5 rounded">
                          {spreadPips}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5">{spec.name}</p>
                      <p className="text-[10px] text-slate-500 font-tabular">Y: {price.high.toFixed(spec.digits)} D: {price.low.toFixed(spec.digits)}</p>
                    </div>

                    <div className="flex items-center gap-4 font-tabular">
                      <div className="text-right">
                        <span className="text-xs text-slate-400 block">Bid</span>
                        <span className="font-bold text-sm text-blue-400">{price.bid.toFixed(spec.digits)}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-xs text-slate-400 block">Ask</span>
                        <span className="font-bold text-sm text-red-400">{price.ask.toFixed(spec.digits)}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ======================= 4. GRAFİK (CHART) SEKMESİ ======================= */}
        {activeTab === 'chart' && (
          <div className="flex-1 flex flex-col overflow-hidden bg-[#12161c]">
            {/* Üst Bar: Sembol Seçici ve Hızlı Emir */}
            <div className="px-3 py-2 border-b border-[#1c2430] flex items-center justify-between">
              <select
                value={selectedSymbolForOrder}
                onChange={(e) => setSelectedSymbolForOrder(e.target.value)}
                className="bg-[#1c2430] text-xs font-bold text-white px-2 py-1 rounded focus:outline-none"
              >
                {Object.keys(SYMBOL_SPECS).map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>

              <div className="flex gap-2">
                <button
                  onClick={() => setIsNewOrderOpen(true)}
                  className="px-3 py-1 bg-[#ff3b30] hover:bg-[#e03126] text-white rounded text-xs font-bold"
                >
                  SELL
                </button>
                <button
                  onClick={() => setIsNewOrderOpen(true)}
                  className="px-3 py-1 bg-[#2979ff] hover:bg-[#1f66de] text-white rounded text-xs font-bold"
                >
                  BUY
                </button>
              </div>
            </div>

            {/* Mum Grafik */}
            <div className="flex-1 relative">
              <MT5Chart
                symbol={selectedSymbolForOrder}
                currentPrice={currentPrices[selectedSymbolForOrder]?.bid || 25149.18}
              />
            </div>
          </div>
        )}

        {/* ======================= 5. AYARLAR & MÜŞTERİ PANELİ SEKMESİ ======================= */}
        {activeTab === 'settings' && (
          <div className="flex-1 flex flex-col overflow-y-auto px-4 py-4 space-y-4 no-scrollbar">
            {/* Profil Kartı */}
            <div className="bg-[#161c24] border border-[#232d3b] rounded-2xl p-4 flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center font-bold text-lg text-white">
                BB
              </div>
              <div className="flex-1">
                <span className="font-bold text-sm text-white block">{account.name}</span>
                <span className="text-xs text-slate-400 font-mono">Hesap No: {account.login}</span>
                <div className="mt-1 flex items-center gap-1 text-[11px] text-emerald-400">
                  <ShieldCheck size={13} /> Gerçek Doğrulanmış Simülasyon
                </div>
              </div>
            </div>

            {/* Kaldıraç Ayarı */}
            <div className="bg-[#161c24] border border-[#232d3b] rounded-2xl p-4">
              <span className="text-xs font-semibold text-slate-300 block mb-2">Hesap Kaldıracı (Leverage)</span>
              <div className="grid grid-cols-4 gap-2">
                {[10, 20, 50, 100].map(lev => (
                  <button
                    key={lev}
                    onClick={() => onChangeLeverage(lev)}
                    className={`py-2 rounded-xl text-xs font-bold transition ${
                      account.leverage === lev
                        ? 'bg-[#2979ff] text-white shadow'
                        : 'bg-[#1f2633] text-slate-400 hover:text-white'
                    }`}
                  >
                    1:{lev}
                  </button>
                ))}
              </div>
            </div>

            {/* Sanal Para Ekleme */}
            <div className="bg-[#161c24] border border-[#232d3b] rounded-2xl p-4">
              <span className="text-xs font-semibold text-slate-300 block mb-2">Sanal Bakiye Yükle (Eğitim)</span>
              <div className="grid grid-cols-3 gap-2">
                {[1000, 5000, 10000].map(amt => (
                  <button
                    key={amt}
                    onClick={() => onDeposit(amt)}
                    className="py-2 bg-[#1f2633] hover:bg-[#283244] border border-[#2f3b4d] rounded-xl text-xs font-bold text-emerald-400 transition"
                  >
                    +${amt.toLocaleString()}
                  </button>
                ))}
              </div>
            </div>

            {/* Görünüm Değiştirici: Mobil <-> Masaüstü WebTrader */}
            <div className="pt-2">
              <button
                onClick={() => setActiveView('desktop')}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 rounded-xl text-xs font-bold text-white shadow-lg flex items-center justify-center gap-2 transition"
              >
                <BarChart2 size={16} /> Masaüstü Müşteri İşlem Paneline Geç
              </button>
            </div>
          </div>
        )}

        {/* ======================= MT5 ALT NAVİGASYON BAR (TAB BAR) ======================= */}
        {/* Görseldeki: [Fiyatlar] [Grafik] [İşlem] [Geçmiş] [Ayarlar] */}
        <div className="h-16 bg-[#0a0d12] border-t border-[#1a222e] px-2 flex items-center justify-around z-20">
          {/* Fiyatlar */}
          <button
            onClick={() => setActiveTab('quotes')}
            className={`flex flex-col items-center gap-1 transition ${
              activeTab === 'quotes' ? 'text-blue-400' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <ArrowUpDown size={18} />
            <span className="text-[10px] font-medium">Fiyatlar</span>
          </button>

          {/* Grafik */}
          <button
            onClick={() => setActiveTab('chart')}
            className={`flex flex-col items-center gap-1 transition ${
              activeTab === 'chart' ? 'text-blue-400' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <CandlestickChart size={18} />
            <span className="text-[10px] font-medium">Grafik</span>
          </button>

          {/* İşlem */}
          <button
            onClick={() => setActiveTab('trade')}
            className={`flex flex-col items-center gap-1 transition ${
              activeTab === 'trade' ? 'text-blue-400' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <BarChart2 size={18} />
            <span className="text-[10px] font-medium">İşlem</span>
          </button>

          {/* Geçmiş (Görselde aktif olan daire ikonu) */}
          <button
            onClick={() => setActiveTab('history')}
            className={`flex flex-col items-center gap-1 transition ${
              activeTab === 'history' ? 'text-blue-400' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <div className={`p-1 rounded-full ${activeTab === 'history' ? 'bg-[#1e293b]' : ''}`}>
              <Clock size={18} />
            </div>
            <span className="text-[10px] font-medium">Geçmiş</span>
          </button>

          {/* Ayarlar */}
          <button
            onClick={() => setActiveTab('settings')}
            className={`flex flex-col items-center gap-1 transition ${
              activeTab === 'settings' ? 'text-blue-400' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Settings size={18} />
            <span className="text-[10px] font-medium">Ayarlar</span>
          </button>
        </div>

        {/* Yeni Emir Modalı */}
        <NewOrderModal
          isOpen={isNewOrderOpen}
          onClose={() => setIsNewOrderOpen(false)}
          selectedSymbol={selectedSymbolForOrder}
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
    </div>
  );
}
