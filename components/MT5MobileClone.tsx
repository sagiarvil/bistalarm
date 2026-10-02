'use client';

import React, { useState } from 'react';
import { UserAccount, Position, SYMBOL_SPECS, SymbolSpec, OrderSide, OrderType } from '@/lib/tradingEngine';
import { INITIAL_ACCOUNTS_LIST, MT5AccountItem } from '@/lib/videoReferenceData';
import { INITIAL_NEWS, INITIAL_MAILBOX, INITIAL_CALENDAR } from '@/lib/mt5Data';
import MT5Chart from './MT5Chart';
import DOMModal from './DOMModal';
import SymbolPropertiesModal from './SymbolPropertiesModal';
import {
  X,
  Plus,
  Clock,
  ChevronRight,
  ChevronLeft,
  Pencil,
  PlusCircle,
  MessageSquare,
  Users,
  Cpu,
  KeyRound,
  Globe,
  LineChart,
  BookOpen,
  Sliders,
  TrendingUp,
  TrendingDown,
  Info
} from 'lucide-react';

// Formatlayıcı: Binlik boşluklu sayı ("9 746.60", "-1 000.00")
const fmtMoney = (val: number): string => {
  const isNeg = val < 0;
  const absVal = Math.abs(val);
  const parts = absVal.toFixed(2).split('.');
  const integerPart = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  return (isNeg ? '-' : '') + integerPart + '.' + parts[1];
};

// Orijinal MT5 SVG İkonları
const IconQuotes = ({ active }: { active: boolean }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? "#2979ff" : "#8e8e93"} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M7 19V5M7 5l-4 4M7 5l4 4M17 5v14M17 19l-4-4M17 19l4-4" />
  </svg>
);

const IconChart = ({ active }: { active: boolean }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill={active ? "#2979ff" : "#8e8e93"}>
    <path d="M5 9h2v10H5V9zm6-5h2v15h-2V4zm6 8h2v7h-2v-7z" />
    <path d="M6 5v3m6-4v2m6 10v2" stroke={active ? "#2979ff" : "#8e8e93"} strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

const IconTrade = ({ active }: { active: boolean }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? "#2979ff" : "#8e8e93"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="16" rx="3" />
    <path d="M7 14l3-4 3 3 4-5" />
  </svg>
);

const IconHistory = ({ active }: { active: boolean }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? "#2979ff" : "#8e8e93"} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="9" />
    <polyline points="12 7 12 12 15 15" />
  </svg>
);

const IconSettings = ({ active }: { active: boolean }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? "#2979ff" : "#8e8e93"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
  </svg>
);

interface MT5MobileCloneProps {
  account: UserAccount;
  currentPrices: Record<string, { bid: number; ask: number; high: number; low: number; time: string }>;
  onPlaceOrder: (params: any) => void;
  onCloseFull: (id: string) => void;
  onClosePartial: (id: string, lots: number) => void;
  onUpdateSLTP: (id: string, sl: number | null, tp: number | null) => void;
  onDeposit: (amount: number) => void;
  onChangeLeverage: (leverage: number) => void;
  onLoginAccount: (login: number, name: string) => void;
}

export default function MT5MobileClone({
  account,
  currentPrices,
  onPlaceOrder,
  onCloseFull,
  onClosePartial,
  onUpdateSLTP,
  onDeposit,
  onChangeLeverage,
  onLoginAccount
}: MT5MobileCloneProps) {
  // Aktif Sekme
  const [activeTab, setActiveTab] = useState<'quotes' | 'chart' | 'trade' | 'history' | 'settings'>('history');
  
  // Geçmiş Sekmeleri
  const [historyTab, setHistoryTab] = useState<'positions' | 'orders' | 'deals'>('positions');

  // Fiyatlar
  const [selectedSymbol, setSelectedSymbol] = useState<string>('NASDAQ.j');
  const [isTradeModalOpen, setIsTradeModalOpen] = useState<boolean>(false);
  const [isActionSheetOpen, setIsActionSheetOpen] = useState<boolean>(false);
  const [isDOMOpen, setIsDOMOpen] = useState<boolean>(false);
  const [isPropertiesOpen, setIsPropertiesOpen] = useState<boolean>(false);

  // Grafik
  const [timeframe, setTimeframe] = useState<string>('M15');
  const [isTimeframeMenuOpen, setIsTimeframeMenuOpen] = useState(false);

  // İşlem Emri
  const [orderLots, setOrderLots] = useState<number>(0.10);
  const [orderType, setOrderType] = useState<OrderType>('market');
  const [slPrice, setSlPrice] = useState<string>('');
  const [tpPrice, setTpPrice] = useState<string>('');
  const [targetLimitPrice, setTargetLimitPrice] = useState<string>('');

  // Pozisyon Kapatma
  const [selectedPosition, setSelectedPosition] = useState<Position | null>(null);
  const [isCloseModalOpen, setIsCloseModalOpen] = useState<boolean>(false);
  const [closeModalTab, setCloseModalTab] = useState<'close' | 'modify'>('close');
  const [partialLots, setPartialLots] = useState<number>(0.05);
  const [modifySL, setModifySL] = useState<string>('');
  const [modifyTP, setModifyTP] = useState<string>('');

  // Ayarlar Ekranı Seviyeleri: 'main' | 'accounts' | 'account_detail'
  const [settingsView, setSettingsView] = useState<'main' | 'accounts' | 'account_detail'>('main');
  const [selectedAccountItem, setSelectedAccountItem] = useState<MT5AccountItem>(INITIAL_ACCOUNTS_LIST[0]);

  // Ses Efekti
  const playSound = (type: 'trade' | 'close') => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      if (type === 'trade') {
        osc.frequency.setValueAtTime(587.33, audioCtx.currentTime);
        osc.frequency.setValueAtTime(880.00, audioCtx.currentTime + 0.08);
        gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.25);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.25);
      } else {
        osc.frequency.setValueAtTime(440.00, audioCtx.currentTime);
        gain.gain.setValueAtTime(0.12, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.2);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.2);
      }
    } catch (e) {}
  };

  const handleAdjustLots = (delta: number) => {
    const next = Math.max(0.01, parseFloat((orderLots + delta).toFixed(2)));
    setOrderLots(next);
  };

  const handleExecuteOrder = (side: OrderSide) => {
    playSound('trade');
    onPlaceOrder({
      symbol: selectedSymbol,
      side,
      type: orderType,
      lots: orderLots,
      sl: slPrice ? parseFloat(slPrice) : null,
      tp: tpPrice ? parseFloat(tpPrice) : null,
      targetPrice: targetLimitPrice ? parseFloat(targetLimitPrice) : undefined
    });
    setIsTradeModalOpen(false);
  };

  const spec: SymbolSpec = SYMBOL_SPECS[selectedSymbol] || SYMBOL_SPECS['NASDAQ.j'];
  const curPrice = currentPrices[selectedSymbol] || {
    bid: spec.basePrice,
    ask: spec.basePrice + spec.spread,
    high: spec.basePrice * 1.01,
    low: spec.basePrice * 0.99,
    time: '17:22:42'
  };

  return (
    <div className="w-full h-full flex justify-center items-center bg-black text-white select-none overflow-hidden">
      {/* Cihaz Boyutu Çerçevesi */}
      <div className="relative w-full max-w-[430px] h-[100dvh] bg-black overflow-hidden flex flex-col font-sans">
        
        {/* ========================================================================= */}
        {/* 1. SEKMELER: FİYATLAR (QUOTES) - VİDEO 00:00 & 00:35 İLE BİREBİR */}
        {/* ========================================================================= */}
        <div className="flex-1 flex flex-col overflow-hidden bg-black" style={{ display: activeTab === 'quotes' ? 'flex' : 'none' }}>

            {/* iOS Statü Çubuğu */}
            <div className="px-6 pt-3 pb-1 flex items-center justify-between text-xs font-semibold select-none shrink-0 z-30">
              <span className="font-bold text-[16px] tracking-tight text-white">17:22</span>
              {/* Dynamic Island */}
              <div className="w-24 h-4 bg-black rounded-full border border-[#1e242d]" />
              <div className="flex items-center gap-1.5">
                <div className="flex items-end gap-0.5 h-3">
                  <div className="w-[3px] h-1.5 bg-white rounded-sm"></div>
                  <div className="w-[3px] h-2 bg-white rounded-sm"></div>
                  <div className="w-[3px] h-2.5 bg-white rounded-sm"></div>
                  <div className="w-[3px] h-3 bg-white rounded-sm"></div>
                </div>
                <span className="text-[12px] font-bold text-white tracking-tight">LTE</span>
                <div className="flex items-center gap-0.5 bg-[#34c759] text-black px-1.5 py-[1px] rounded-md font-bold text-[10px]">
                  <span>86</span>
                  <span className="text-[9px]">⚡</span>
                </div>
              </div>
            </div>

            {/* Üst Bar: Fiyatlar, Kalem, + */}
            <div className="px-5 py-2 flex items-center justify-between shrink-0">
              <span className="font-bold text-[22px] tracking-tight text-white">Fiyatlar</span>
              <div className="flex items-center gap-4">
                <button className="text-white hover:text-slate-300">
                  <Pencil size={20} />
                </button>
                <button
                  onClick={() => {
                    setSelectedSymbol('NASDAQ.j');
                    setIsTradeModalOpen(true);
                  }}
                  className="text-white hover:text-slate-300"
                >
                  <Plus size={24} />
                </button>
              </div>
            </div>

            {/* Fiyat Listesi (Videodaki Renkli Kutu Tasarımı) */}
            <div className="flex-1 overflow-y-auto px-4 divide-y divide-[#151517] no-scrollbar">
              {Object.entries(SYMBOL_SPECS).map(([sym, s]) => {
                const p = currentPrices[sym] || {
                  bid: s.basePrice,
                  ask: s.basePrice + s.spread,
                  high: s.basePrice * 1.01,
                  low: s.basePrice * 0.99,
                  time: '17:22:42'
                };
                
                const isDown = sym.includes('NASDAQ') || sym.includes('DAX') || sym.includes('US2000');
                const changePips = isDown ? -12680 : 69;
                const changePct = isDown ? -0.42 : 0.02;

                const bidStr = p.bid.toFixed(s.digits);
                const askStr = p.ask.toFixed(s.digits);
                const bidMain = bidStr.slice(0, -2);
                const bidBig = bidStr.slice(-2);
                const askMain = askStr.slice(0, -2);
                const askBig = askStr.slice(-2);

                return (
                  <div
                    key={sym}
                    onClick={() => {
                      setSelectedSymbol(sym);
                      setIsActionSheetOpen(true);
                    }}
                    className="py-3 flex items-center justify-between cursor-pointer active:bg-[#151517] -mx-2 px-2 rounded-xl transition"
                  >
                    {/* Sol Bilgiler */}
                    <div className="w-32">
                      <div className="flex items-center gap-1.5 text-[11px] font-bold">
                        <span className={isDown ? 'text-[#ff3b30]' : 'text-[#2979ff]'}>
                          {changePips > 0 ? `+${changePips}` : changePips}
                        </span>
                        <span className={isDown ? 'text-[#ff3b30]' : 'text-[#2979ff]'}>
                          {changePct > 0 ? `+${changePct}%` : `${changePct}%`}
                        </span>
                      </div>
                      <span className="font-bold text-[17px] text-white block tracking-tight leading-tight mt-0.5">
                        {sym}
                      </span>
                      <span className="text-[11px] text-[#8e8e93] font-tabular block mt-0.5">
                        {p.time || '17:22:42'} [{Math.round(s.spread / s.pipSize)}]
                      </span>
                    </div>

                    {/* Sağ Kutu Butonları (Bid / Ask Renkli Kutular) */}
                    <div className="flex items-center gap-2 font-tabular">
                      {/* Bid Kutusu */}
                      <div className="w-[100px] h-[52px] bg-[#0c2444] border border-[#1b4375] rounded-xl flex flex-col items-center justify-center text-white">
                        <div className="flex items-baseline">
                          <span className="text-sm font-semibold">{bidMain}</span>
                          <span className="text-xl font-bold tracking-tight">{bidBig}</span>
                        </div>
                        <span className="text-[9px] text-[#8ea4be]">L: {p.low.toFixed(s.digits)}</span>
                      </div>

                      {/* Ask Kutusu */}
                      <div className={`w-[100px] h-[52px] rounded-xl flex flex-col items-center justify-center text-white border ${
                        isDown ? 'bg-[#0c2444] border-[#1b4375]' : 'bg-[#3b1216] border-[#661f26]'
                      }`}>
                        <div className="flex items-baseline">
                          <span className="text-sm font-semibold">{askMain}</span>
                          <span className="text-xl font-bold tracking-tight">{askBig}</span>
                        </div>
                        <span className="text-[9px] text-[#be8e94]">H: {p.high.toFixed(s.digits)}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
        </div>

        {/* ========================================================================= */}
        {/* 2. SEKMELER: İŞLEM (TRADE) - VİDEO 00:01 İLE BİREBİR */}
        {/* ========================================================================= */}
        <div className="flex-1 flex flex-col overflow-hidden bg-black" style={{ display: activeTab === 'trade' ? 'flex' : 'none' }}>

            {/* iOS Statü Çubuğu */}
            <div className="px-6 pt-3 pb-1 flex items-center justify-between text-xs font-semibold select-none shrink-0 z-30">
              <span className="font-bold text-[16px] tracking-tight text-white">17:22</span>
              <div className="w-24 h-4 bg-black rounded-full border border-[#1e242d]" />
              <div className="flex items-center gap-1.5">
                <div className="flex items-end gap-0.5 h-3">
                  <div className="w-[3px] h-1.5 bg-white rounded-sm"></div>
                  <div className="w-[3px] h-2 bg-white rounded-sm"></div>
                  <div className="w-[3px] h-2.5 bg-white rounded-sm"></div>
                  <div className="w-[3px] h-3 bg-white rounded-sm"></div>
                </div>
                <span className="text-[12px] font-bold text-white tracking-tight">LTE</span>
                <div className="flex items-center gap-0.5 bg-[#34c759] text-black px-1.5 py-[1px] rounded-md font-bold text-[10px]">
                  <span>86</span>
                  <span className="text-[9px]">⚡</span>
                </div>
              </div>
            </div>

            {/* Üst Bar: USD Başlığı ve + Butonu */}
            <div className="px-5 py-2 flex items-center justify-between shrink-0">
              <div className="w-6" />
              <span className="font-bold text-[18px] text-white">USD</span>
              <button
                onClick={() => {
                  setSelectedSymbol('NASDAQ.j');
                  setIsTradeModalOpen(true);
                }}
                className="text-white hover:text-slate-300"
              >
                <Plus size={24} />
              </button>
            </div>

            {/* Bakiye Dökümü (Videodaki 00:01 Satırları) */}
            <div className="px-5 py-3 space-y-2 text-[14px] font-normal border-b border-[#1c1c1e] font-tabular">
              <div className="flex justify-between">
                <span className="text-white">Bakiye:</span>
                <span className="font-bold text-white tracking-tight">9 746.60</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white">Varlık:</span>
                <span className="font-bold text-white tracking-tight">13 844.60</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white">Kredi:</span>
                <span className="font-bold text-white tracking-tight">4 098.00</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white">Serbest Teminat:</span>
                <span className="font-bold text-white tracking-tight">13 844.60</span>
              </div>
            </div>

            {/* Ortadaki Büyük İkon (Videodaki Beyaz Zikzak Yükselen Ok) */}
            <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
              <div className="w-36 h-36 flex items-center justify-center text-white/90">
                <svg width="120" height="120" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 18l7-7 4 4 6-7" />
                  <path d="M15 4h6v6" />
                </svg>
              </div>
            </div>
        </div>

        {/* ========================================================================= */}
        {/* 3. SEKMELER: GEÇMİŞ (HISTORY) - VİDEODAKİ TAM LİSTE */}
        {/* ========================================================================= */}
        <div className="flex-1 flex flex-col overflow-hidden bg-black" style={{ display: activeTab === 'history' ? 'flex' : 'none' }}>

            {/* iOS Statü Çubuğu */}
            <div className="px-5 pt-3 pb-1 flex items-center justify-between text-xs font-semibold select-none shrink-0 z-30">
              <span className="font-bold text-[16px] tracking-tight text-white">17:22</span>
              <div className="w-24 h-4 bg-black rounded-full border border-[#1e242d]" />
              <div className="flex items-center gap-1.5">
                <div className="flex items-end gap-0.5 h-3">
                  <div className="w-[3px] h-1.5 bg-white rounded-sm"></div>
                  <div className="w-[3px] h-2 bg-white rounded-sm"></div>
                  <div className="w-[3px] h-2.5 bg-white rounded-sm"></div>
                  <div className="w-[3px] h-3 bg-white rounded-sm"></div>
                </div>
                <span className="text-[12px] font-bold text-white tracking-tight">LTE</span>
                <div className="flex items-center gap-0.5 bg-[#34c759] text-black px-1.5 py-[1px] rounded-md font-bold text-[10px]">
                  <span>86</span>
                  <span className="text-[9px]">⚡</span>
                </div>
              </div>
            </div>

            {/* Üst Hap Bar: ⇅ | [Pozisyonlar] [Emirler] [İşlemler] | 🕒 */}
            <div className="px-4 py-2 flex items-center justify-between shrink-0 relative z-30">
              <button className="w-10 h-10 rounded-full bg-[#2c2c2e]/90 flex items-center justify-center text-white active:bg-[#3a3a3c] transition shadow-sm">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M7 19V5M7 5l-4 4M7 5l4 4M17 5v14M17 19l-4-4M17 19l4-4" />
                </svg>
              </button>

              <div className="flex bg-[#1c1c1e] p-1 rounded-full border border-white/5">
                <button
                  onClick={() => setHistoryTab('positions')}
                  className={`px-4 py-1.5 rounded-full text-[13px] font-semibold transition ${
                    historyTab === 'positions' ? 'bg-[#3a3a3c] text-white shadow' : 'text-[#8e8e93] hover:text-white'
                  }`}
                >
                  Pozisyonlar
                </button>
                <button
                  onClick={() => setHistoryTab('orders')}
                  className={`px-4 py-1.5 rounded-full text-[13px] font-semibold transition ${
                    historyTab === 'orders' ? 'bg-[#3a3a3c] text-white shadow' : 'text-[#8e8e93] hover:text-white'
                  }`}
                >
                  Emirler
                </button>
                <button
                  onClick={() => setHistoryTab('deals')}
                  className={`px-4 py-1.5 rounded-full text-[13px] font-semibold transition ${
                    historyTab === 'deals' ? 'bg-[#3a3a3c] text-white shadow' : 'text-[#8e8e93] hover:text-white'
                  }`}
                >
                  İşlemler
                </button>
              </div>

              <button className="w-10 h-10 rounded-full bg-[#2c2c2e]/90 flex items-center justify-center text-white active:bg-[#3a3a3c] transition shadow-sm">
                <Clock size={20} />
              </button>
            </div>

            {/* Videodaki Scroll Edilebilen Tüm İşlemler Listesi */}
            <div className="flex-1 overflow-y-auto px-4 pt-1 space-y-2.5 no-scrollbar">
              {account.history.map((item, idx) => (
                <div key={item.id || idx} className="flex justify-between items-start relative pl-2">
                  {item.symbol !== 'Balance' && item.symbol !== 'Credit' && (
                    <div className="absolute left-0 top-1 bottom-1 w-[3px] bg-[#ff3b30] rounded-full" />
                  )}
                  <div>
                    <div className="text-[16px] font-bold tracking-tight">
                      <span className="text-white">{item.symbol} </span>
                      {item.symbol !== 'Balance' && item.symbol !== 'Credit' && (
                        <span className={`font-semibold ${item.side === 'buy' ? 'text-[#2979ff]' : 'text-[#ff3b30]'}`}>
                          {item.side} {item.lots}
                        </span>
                      )}
                    </div>
                    <div className="text-[13px] text-[#8e8e93] font-tabular mt-0.5">
                      {item.comment ? item.comment : `${item.openPrice.toFixed(2)} → ${item.closePrice?.toFixed(2)}`}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`text-[16px] font-bold font-tabular ${
                      item.profit >= 0 ? 'text-[#2979ff]' : 'text-[#ff3b30]'
                    }`}>
                      {fmtMoney(item.profit)}
                    </div>
                    <div className="text-[12px] text-[#8e8e93] font-tabular mt-0.5">
                      {item.closeTime}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Alt Finansal Döküm Bölümü */}
            <div className="px-5 pt-3 pb-2 border-t border-[#1c1c1e] bg-black space-y-1 text-[13px] font-normal shrink-0">
              <div className="flex justify-between">
                <span className="text-white">Para yatır</span>
                <span className="font-bold font-tabular text-white tracking-tight">8 195.00</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white">Kredi</span>
                <span className="font-bold font-tabular text-white tracking-tight">4 098.00</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white">Para çek</span>
                <span className="font-bold font-tabular text-white tracking-tight">-1 000.00</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white">Kar</span>
                <span className="font-bold font-tabular text-white tracking-tight">3 179.44</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white">Swap</span>
                <span className="font-bold font-tabular text-white tracking-tight">0.00</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white">Komisyon</span>
                <span className="font-bold font-tabular text-white tracking-tight">-627.84</span>
              </div>
              <div className="flex justify-between pt-1">
                <span className="text-white font-bold">Bakiye</span>
                <span className="font-bold font-tabular text-white tracking-tight">13 844.60</span>
              </div>
            </div>
        </div>

        {/* ========================================================================= */}
        {/* 4. SEKMELER: GRAFİK (CHART) */}
        {/* ========================================================================= */}
        <div className="flex-1 flex flex-col overflow-hidden bg-[#12161c]" style={{ display: activeTab === 'chart' ? 'flex' : 'none' }}>
          <div className="px-3 py-2 bg-black border-b border-[#1c1c1e] flex items-center justify-between shrink-0 relative">
            <div className="flex items-center gap-2">
              <select
                value={selectedSymbol}
                onChange={(e) => setSelectedSymbol(e.target.value)}
                className="bg-[#1c1c1e] text-xs font-bold text-white px-2 py-1 rounded focus:outline-none"
              >
                {Object.keys(SYMBOL_SPECS).map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>

              <button
                onClick={() => setIsTimeframeMenuOpen(!isTimeframeMenuOpen)}
                className="text-xs text-[#2979ff] font-bold bg-[#1c1c1e] px-2 py-1 rounded"
              >
                {timeframe} ▾
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsTradeModalOpen(true)}
                className="px-2.5 py-1 bg-[#ff3b30] text-white rounded-lg text-xs font-bold font-tabular"
              >
                SELL {curPrice.bid.toFixed(spec.digits)}
              </button>
              <button
                onClick={() => setIsTradeModalOpen(true)}
                className="px-2.5 py-1 bg-[#2979ff] text-white rounded-lg text-xs font-bold font-tabular"
              >
                BUY {curPrice.ask.toFixed(spec.digits)}
              </button>
            </div>
          </div>

          <div className="flex-1 relative">
            <MT5Chart symbol={selectedSymbol} currentPrice={curPrice.bid} />
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 5. SEKMELER: AYARLAR (SETTINGS) - VİDEO 00:19 & 00:21 & 00:22 İLE BİREBİR */}
        {/* ========================================================================= */}
        <div className="flex-1 flex flex-col overflow-y-auto px-4 py-3 space-y-3 no-scrollbar bg-black" style={{ display: activeTab === 'settings' ? 'flex' : 'none' }}>

            
            {/* VİDEO 00:19 — ANA AYARLAR EKRANI */}
            {settingsView === 'main' && (
              <>
                <div className="text-center font-bold text-[18px] text-white py-1">
                  Ayarlar
                </div>

                {/* Üst Kullanıcı Kartı (Videodaki: Fetih Çetin, Exbina Ltd. 20767 - Exbina-Server Access Server 1) */}
                <div
                  onClick={() => setSettingsView('accounts')}
                  className="bg-[#1c1c1e] rounded-2xl p-4 flex items-center justify-between cursor-pointer active:bg-[#2c2c2e] transition"
                >
                  <div>
                    <span className="font-bold text-[18px] text-white block">Fetih Çetin</span>
                    <span className="text-xs text-[#8e8e93] block mt-0.5">Exbina Ltd.</span>
                    <span className="text-[11px] text-[#8e8e93] block mt-0.5">
                      20767 - Exbina-Server
                    </span>
                    <span className="text-[11px] text-[#8e8e93] block">
                      Access Server 1
                    </span>
                  </div>
                  <ChevronRight size={20} className="text-[#8e8e93]" />
                </div>

                {/* 1. Menü Grubu (Yeni Hesap, Posta Kutusu, Haberler, Tradays) */}
                <div className="bg-[#1c1c1e] rounded-2xl divide-y divide-[#2c2c2e] overflow-hidden text-xs">
                  <div className="p-3.5 flex items-center justify-between cursor-pointer active:bg-[#2c2c2e]">
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-lg bg-[#2c2c2e] flex items-center justify-center text-white font-bold">
                        ➕
                      </div>
                      <span className="font-semibold text-white text-[14px]">Yeni Hesap</span>
                    </div>
                    <ChevronRight size={18} className="text-[#8e8e93]" />
                  </div>

                  <div className="p-3.5 flex items-center justify-between cursor-pointer active:bg-[#2c2c2e]">
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-lg bg-[#2c2c2e] flex items-center justify-center text-white">
                        ✉️
                      </div>
                      <div>
                        <span className="font-semibold text-white text-[14px] block">Posta kutusu</span>
                        <span className="text-[11px] text-[#8e8e93]">İşlem platformuna hoş geldiniz - Tradin...</span>
                      </div>
                    </div>
                    <ChevronRight size={18} className="text-[#8e8e93]" />
                  </div>

                  <div className="p-3.5 flex items-center justify-between cursor-pointer active:bg-[#2c2c2e]">
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-lg bg-[#2c2c2e] flex items-center justify-center text-white">
                        📰
                      </div>
                      <span className="font-semibold text-white text-[14px]">Haberler</span>
                    </div>
                    <ChevronRight size={18} className="text-[#8e8e93]" />
                  </div>

                  <div className="p-3.5 flex items-center justify-between cursor-pointer active:bg-[#2c2c2e]">
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-lg bg-[#2c2c2e] flex items-center justify-center text-white">
                        📅
                      </div>
                      <div>
                        <span className="font-semibold text-white text-[14px] block">Tradays</span>
                        <span className="text-[11px] text-[#8e8e93]">Ekonomik takvim</span>
                      </div>
                    </div>
                    <ChevronRight size={18} className="text-[#8e8e93]" />
                  </div>
                </div>

                {/* 2. Menü Grubu (Sohbet, Yatırımcılar, MQL5 Algo) */}
                <div className="bg-[#1c1c1e] rounded-2xl divide-y divide-[#2c2c2e] overflow-hidden text-xs">
                  <div className="p-3.5 flex items-center justify-between cursor-pointer active:bg-[#2c2c2e]">
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-lg bg-[#2c2c2e] flex items-center justify-center text-white">
                        💬
                      </div>
                      <div>
                        <span className="font-semibold text-white text-[14px] block">Sohbet ve Mesajlar</span>
                        <span className="text-[11px] text-[#8e8e93]">MQL5.community'e giriş yapın!</span>
                      </div>
                    </div>
                    <ChevronRight size={18} className="text-[#8e8e93]" />
                  </div>

                  <div className="p-3.5 flex items-center justify-between cursor-pointer active:bg-[#2c2c2e]">
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-lg bg-[#007aff] flex items-center justify-center text-white font-bold text-[10px]">
                        MQL5
                      </div>
                      <span className="font-semibold text-white text-[14px]">Yatırımcılar Topluluğu</span>
                    </div>
                    <ChevronRight size={18} className="text-[#8e8e93]" />
                  </div>

                  <div className="p-3.5 flex items-center justify-between cursor-pointer active:bg-[#2c2c2e]">
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-lg bg-[#34c759] flex items-center justify-center text-white font-bold text-[10px]">
                        MQL5
                      </div>
                      <span className="font-semibold text-white text-[14px]">MQL5 Algo Trading</span>
                    </div>
                    <ChevronRight size={18} className="text-[#8e8e93]" />
                  </div>
                </div>

                {/* 3. Menü Grubu (OTP, Arayüz, Grafikler, Günlük, Ayarlar) */}
                <div className="bg-[#1c1c1e] rounded-2xl divide-y divide-[#2c2c2e] overflow-hidden text-xs">
                  <div className="p-3.5 flex items-center justify-between cursor-pointer active:bg-[#2c2c2e]">
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-lg bg-[#ff9500] flex items-center justify-center text-white text-[12px]">
                        🛡️
                      </div>
                      <div>
                        <span className="font-semibold text-white text-[14px] block">OTP</span>
                        <span className="text-[11px] text-[#8e8e93]">Tek kullanımlık şifre oluşturucu</span>
                      </div>
                    </div>
                    <ChevronRight size={18} className="text-[#8e8e93]" />
                  </div>

                  <div className="p-3.5 flex items-center justify-between cursor-pointer active:bg-[#2c2c2e]">
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-lg bg-[#5856d6] flex items-center justify-center text-white text-[12px]">
                        🌐
                      </div>
                      <div>
                        <span className="font-semibold text-white text-[14px] block">Arayüz</span>
                        <span className="text-[11px] text-[#8e8e93]">Türkçe</span>
                      </div>
                    </div>
                    <ChevronRight size={18} className="text-[#8e8e93]" />
                  </div>

                  <div className="p-3.5 flex items-center justify-between cursor-pointer active:bg-[#2c2c2e]">
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-lg bg-[#007aff] flex items-center justify-center text-white text-[12px]">
                        📊
                      </div>
                      <span className="font-semibold text-white text-[14px]">Grafikler</span>
                    </div>
                    <ChevronRight size={18} className="text-[#8e8e93]" />
                  </div>

                  <div className="p-3.5 flex items-center justify-between cursor-pointer active:bg-[#2c2c2e]">
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-lg bg-[#8e8e93] flex items-center justify-center text-white text-[12px]">
                        📜
                      </div>
                      <span className="font-semibold text-white text-[14px]">Günlük</span>
                    </div>
                    <ChevronRight size={18} className="text-[#8e8e93]" />
                  </div>

                  <div className="p-3.5 flex items-center justify-between cursor-pointer active:bg-[#2c2c2e]">
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-lg bg-[#636366] flex items-center justify-center text-white text-[12px]">
                        ⚙️
                      </div>
                      <span className="font-semibold text-white text-[14px]">Ayarlar</span>
                    </div>
                    <ChevronRight size={18} className="text-[#8e8e93]" />
                  </div>
                </div>
              </>
            )}

            {/* VİDEO 00:21 — HESAPLAR LİSTESİ EKRANI */}
            {settingsView === 'accounts' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between py-1">
                  <button onClick={() => setSettingsView('main')} className="text-[#2979ff] p-1 flex items-center gap-1 text-sm font-semibold">
                    <ChevronLeft size={22} />
                  </button>
                  <span className="font-bold text-[18px] text-white">Hesaplar</span>
                  <button className="text-white p-1">
                    <Plus size={24} />
                  </button>
                </div>

                <div className="space-y-2">
                  {INITIAL_ACCOUNTS_LIST.map((acc) => (
                    <div
                      key={acc.id}
                      onClick={() => {
                        setSelectedAccountItem(acc);
                        setSettingsView('account_detail');
                      }}
                      className="bg-[#1c1c1e] rounded-2xl p-4 flex items-center justify-between cursor-pointer active:bg-[#2c2c2e] transition"
                    >
                      <div className="flex items-center gap-3">
                        {/* Logo */}
                        <div className="w-10 h-10 rounded-full bg-[#2c2c2e] flex items-center justify-center font-bold text-xs text-white">
                          {acc.logoType === 'exbina' ? 'EX' : acc.logoType === 'xm' ? 'XM' : acc.logoType === 'raxon' ? 'R' : 'MQ'}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-[16px] text-white">{acc.name}</span>
                            {acc.badge === 'Demo' && (
                              <span className="bg-[#34c759] text-black text-[10px] font-bold px-2 py-0.2 rounded-full">
                                Demo
                              </span>
                            )}
                          </div>
                          <span className="text-xs text-[#8e8e93] block">
                            {acc.login} - {acc.server}
                          </span>
                          <span className="text-xs text-white font-semibold font-tabular block mt-0.5">
                            {fmtMoney(acc.balance)} {acc.currency}, {acc.type}
                          </span>
                        </div>
                      </div>
                      <ChevronRight size={18} className="text-[#8e8e93]" />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* VİDEO 00:22 — HESAP DETAYI EKRANI */}
            {settingsView === 'account_detail' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between py-1">
                  <button onClick={() => setSettingsView('accounts')} className="text-white p-1">
                    <ChevronLeft size={24} />
                  </button>
                  <div className="w-6" />
                </div>

                {/* Profil Başlığı */}
                <div className="flex flex-col items-center justify-center text-center space-y-1">
                  <div className="w-16 h-16 rounded-full bg-[#1c1c1e] border border-[#2c2c2e] flex items-center justify-center text-2xl font-bold text-blue-400">
                    EX
                  </div>
                  <span className="font-bold text-[20px] text-white">{selectedAccountItem.name}</span>
                  <span className="text-xs text-[#8e8e93]">{selectedAccountItem.login} - {selectedAccountItem.server}</span>
                  <span className="font-bold text-base text-white font-tabular">{fmtMoney(selectedAccountItem.balance)} USD</span>
                  <div className="flex gap-2 pt-1">
                    <span className="bg-[#ff3b30]/20 text-[#ff3b30] text-[10px] font-bold px-2 py-0.5 rounded">Master</span>
                    <span className="bg-[#2979ff]/20 text-[#2979ff] text-[10px] font-bold px-2 py-0.5 rounded">Hedge</span>
                  </div>
                </div>

                {/* Detay Bilgileri Listesi */}
                <div className="bg-[#1c1c1e] rounded-2xl divide-y divide-[#2c2c2e] overflow-hidden text-xs">
                  <div className="p-3.5 flex justify-between">
                    <span className="text-[#8e8e93] font-medium text-[13px]">Şirket</span>
                    <span className="text-white font-semibold text-[13px] flex items-center gap-1">
                      Exbina Ltd. <ChevronRight size={14} className="text-[#8e8e93]" />
                    </span>
                  </div>
                  <div className="p-3.5 flex justify-between">
                    <span className="text-[#8e8e93] font-medium text-[13px]">Ad</span>
                    <span className="text-white font-semibold text-[13px]">{selectedAccountItem.name}</span>
                  </div>
                  <div className="p-3.5 flex justify-between">
                    <span className="text-[#8e8e93] font-medium text-[13px]">E-posta</span>
                    <span className="text-white font-semibold text-[13px]">-</span>
                  </div>
                  <div className="p-3.5 flex justify-between">
                    <span className="text-[#8e8e93] font-medium text-[13px]">Telefon</span>
                    <span className="text-white font-semibold text-[13px]">-</span>
                  </div>
                  <div className="p-3.5 flex justify-between">
                    <span className="text-[#8e8e93] font-medium text-[13px]">Giriş</span>
                    <span className="text-white font-semibold text-[13px] font-mono">{selectedAccountItem.login}</span>
                  </div>
                  <div className="p-3.5 flex justify-between">
                    <span className="text-[#8e8e93] font-medium text-[13px]">Sunucu</span>
                    <span className="text-white font-semibold text-[13px]">{selectedAccountItem.server}</span>
                  </div>
                  <div className="p-3.5 flex justify-between">
                    <span className="text-[#8e8e93] font-medium text-[13px]">Bağlandı</span>
                    <span className="text-white font-semibold text-[13px]">Access Server 1</span>
                  </div>
                </div>

                {/* Alt İşlemler */}
                <div className="bg-[#1c1c1e] rounded-2xl divide-y divide-[#2c2c2e] overflow-hidden text-xs">
                  <div className="p-3.5 flex justify-between items-center cursor-pointer active:bg-[#2c2c2e]">
                    <span className="text-white font-semibold text-[13px]">Başka bir cihazdan bağlan</span>
                    <ChevronRight size={16} className="text-[#8e8e93]" />
                  </div>
                  <div className="p-3.5 flex justify-between items-center cursor-pointer active:bg-[#2c2c2e]">
                    <span className="text-white font-semibold text-[13px]">Şifreyi Değiştir</span>
                    <ChevronRight size={16} className="text-[#8e8e93]" />
                  </div>
                  <div className="p-3.5 flex justify-between items-center cursor-pointer active:bg-[#2c2c2e]">
                    <span className="text-[#ff3b30] font-semibold text-[13px]">Hesabı Sil</span>
                    <ChevronRight size={16} className="text-[#8e8e93]" />
                  </div>
                </div>
              </div>
            )}
        </div>


        {/* ========================================================================= */}
        {/* MT5 ORJİNAL ALT TAB BAR */}
        {/* ========================================================================= */}
        <div className="h-16 bg-[#000000] border-t border-[#1c1c1e] px-2 flex items-center justify-around z-30 shrink-0 safe-bottom">
          <button
            onClick={() => setActiveTab('quotes')}
            className="flex flex-col items-center gap-0.5 transition"
          >
            <div className={`px-4 py-1 rounded-full ${activeTab === 'quotes' ? 'bg-[#3a3a3c]' : ''}`}>
              <IconQuotes active={activeTab === 'quotes'} />
            </div>
            <span className={`text-[10px] font-medium ${activeTab === 'quotes' ? 'text-[#2979ff]' : 'text-[#8e8e93]'}`}>
              Fiyatlar
            </span>
          </button>

          <button
            onClick={() => setActiveTab('chart')}
            className="flex flex-col items-center gap-0.5 transition"
          >
            <div className={`px-4 py-1 rounded-full ${activeTab === 'chart' ? 'bg-[#3a3a3c]' : ''}`}>
              <IconChart active={activeTab === 'chart'} />
            </div>
            <span className={`text-[10px] font-medium ${activeTab === 'chart' ? 'text-[#2979ff]' : 'text-[#8e8e93]'}`}>
              Grafik
            </span>
          </button>

          <button
            onClick={() => setActiveTab('trade')}
            className="flex flex-col items-center gap-0.5 transition"
          >
            <div className={`px-4 py-1 rounded-full ${activeTab === 'trade' ? 'bg-[#3a3a3c]' : ''}`}>
              <IconTrade active={activeTab === 'trade'} />
            </div>
            <span className={`text-[10px] font-medium ${activeTab === 'trade' ? 'text-[#2979ff]' : 'text-[#8e8e93]'}`}>
              İşlem
            </span>
          </button>

          <button
            onClick={() => setActiveTab('history')}
            className="flex flex-col items-center gap-0.5 transition"
          >
            <div className={`px-4 py-1 rounded-full ${activeTab === 'history' ? 'bg-[#3a3a3c]' : ''}`}>
              <IconHistory active={activeTab === 'history'} />
            </div>
            <span className={`text-[10px] font-medium ${activeTab === 'history' ? 'text-[#2979ff]' : 'text-[#8e8e93]'}`}>
              Geçmiş
            </span>
          </button>

          <button
            onClick={() => { setActiveTab('settings'); setSettingsView('main'); }}
            className="flex flex-col items-center gap-0.5 transition"
          >
            <div className={`px-4 py-1 rounded-full ${activeTab === 'settings' ? 'bg-[#3a3a3c]' : ''}`}>
              <IconSettings active={activeTab === 'settings'} />
            </div>
            <span className={`text-[10px] font-medium ${activeTab === 'settings' ? 'text-[#2979ff]' : 'text-[#8e8e93]'}`}>
              Ayarlar
            </span>
          </button>
        </div>

        {/* MODAL: Action Sheet */}
        {isActionSheetOpen && (
          <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 backdrop-blur-sm p-3 animate-in fade-in duration-150">
            <div className="w-full max-w-sm flex flex-col gap-2">
              <div className="bg-[#1c1c1e] rounded-2xl overflow-hidden divide-y divide-[#2c2c2e] text-center font-semibold text-sm">
                <div className="py-2.5 text-xs text-[#8e8e93] bg-[#161618] font-bold">
                  {selectedSymbol} — {spec.name}
                </div>
                <button
                  onClick={() => { setIsActionSheetOpen(false); setIsTradeModalOpen(true); }}
                  className="w-full py-3.5 text-[#2979ff] active:bg-[#2c2c2e]"
                >
                  ⚡ İşlem (Yeni Emir)
                </button>
                <button
                  onClick={() => { setIsActionSheetOpen(false); setActiveTab('chart'); }}
                  className="w-full py-3.5 text-[#2979ff] active:bg-[#2c2c2e]"
                >
                  📈 Grafik
                </button>
                <button
                  onClick={() => { setIsActionSheetOpen(false); setIsDOMOpen(true); }}
                  className="w-full py-3.5 text-[#2979ff] active:bg-[#2c2c2e]"
                >
                  📋 Piyasa Derinliği (DOM)
                </button>
                <button
                  onClick={() => { setIsActionSheetOpen(false); setIsPropertiesOpen(true); }}
                  className="w-full py-3.5 text-[#2979ff] active:bg-[#2c2c2e]"
                >
                  ℹ️ Sembol Özellikleri
                </button>
              </div>
              <button
                onClick={() => setIsActionSheetOpen(false)}
                className="w-full py-3.5 bg-[#1c1c1e] text-[#2979ff] font-bold rounded-2xl text-center active:bg-[#2c2c2e]"
              >
                İptal
              </button>
            </div>
          </div>
        )}

        {/* MODAL: Yeni Emir */}
        {isTradeModalOpen && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-sm p-0 sm:p-4 animate-in fade-in duration-150">
            <div className="w-full max-w-md bg-[#1c1c1e] border-t sm:border border-[#2c2c2e] rounded-t-3xl sm:rounded-3xl p-5 shadow-2xl flex flex-col gap-4">
              <div className="flex items-center justify-between border-b border-[#2c2c2e] pb-3">
                <span className="font-bold text-lg text-white">{selectedSymbol}</span>
                <span className="text-xs bg-[#2c2c2e] px-2 py-0.5 rounded text-[#2979ff] font-mono">
                  1:{account.leverage}
                </span>
                <button onClick={() => setIsTradeModalOpen(false)} className="text-[#8e8e93] hover:text-white p-1">
                  <X size={20} />
                </button>
              </div>

              <select
                value={orderType}
                onChange={(e) => setOrderType(e.target.value as OrderType)}
                className="w-full bg-[#2c2c2e] border border-[#3a3a3c] rounded-xl px-3 py-2 text-xs font-semibold text-white focus:outline-none"
              >
                <option value="market">Piyasa İcrası (Market Execution)</option>
                <option value="buy_limit">Buy Limit</option>
                <option value="sell_limit">Sell Limit</option>
                <option value="buy_stop">Buy Stop</option>
                <option value="sell_stop">Sell Stop</option>
              </select>

              <div className="bg-[#121214] border border-[#2c2c2e] rounded-2xl p-3 flex items-center justify-between">
                <div className="flex gap-1">
                  <button onClick={() => handleAdjustLots(-0.1)} className="px-2.5 py-1.5 bg-[#2c2c2e] rounded-lg text-xs font-bold text-white">-0.1</button>
                  <button onClick={() => handleAdjustLots(-0.01)} className="px-2.5 py-1.5 bg-[#2c2c2e] rounded-lg text-xs font-bold text-white">-0.01</button>
                </div>
                <input
                  type="number"
                  step="0.01"
                  value={orderLots}
                  onChange={(e) => setOrderLots(Math.max(0.01, parseFloat(e.target.value) || 0.01))}
                  className="w-20 text-center font-bold text-lg bg-transparent text-white focus:outline-none font-tabular"
                />
                <div className="flex gap-1">
                  <button onClick={() => handleAdjustLots(0.01)} className="px-2.5 py-1.5 bg-[#2c2c2e] rounded-lg text-xs font-bold text-white">+0.01</button>
                  <button onClick={() => handleAdjustLots(0.1)} className="px-2.5 py-1.5 bg-[#2c2c2e] rounded-lg text-xs font-bold text-white">+0.1</button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-1">
                <button
                  onClick={() => handleExecuteOrder('sell')}
                  className="flex flex-col items-center justify-center bg-[#ff3b30] active:scale-98 transition py-3 rounded-2xl shadow-lg"
                >
                  <span className="text-[11px] font-semibold text-white/90 uppercase tracking-wider">SAT (SELL)</span>
                  <span className="text-xl font-bold font-tabular text-white mt-0.5">{curPrice.bid.toFixed(spec.digits)}</span>
                </button>
                <button
                  onClick={() => handleExecuteOrder('buy')}
                  className="flex flex-col items-center justify-center bg-[#2979ff] active:scale-98 transition py-3 rounded-2xl shadow-lg"
                >
                  <span className="text-[11px] font-semibold text-white/90 uppercase tracking-wider">AL (BUY)</span>
                  <span className="text-xl font-bold font-tabular text-white mt-0.5">{curPrice.ask.toFixed(spec.digits)}</span>
                </button>
              </div>
            </div>
          </div>
        )}

        <DOMModal
          isOpen={isDOMOpen}
          onClose={() => setIsDOMOpen(false)}
          symbol={selectedSymbol}
          currentBid={curPrice.bid}
          currentAsk={curPrice.ask}
          onQuickOrder={(side, lots) => {
            playSound('trade');
            onPlaceOrder({
              symbol: selectedSymbol,
              side,
              type: 'market',
              lots,
              sl: null,
              tp: null
            });
          }}
        />

        <SymbolPropertiesModal
          isOpen={isPropertiesOpen}
          onClose={() => setIsPropertiesOpen(false)}
          symbol={selectedSymbol}
          leverage={account.leverage}
        />
      </div>
    </div>
  );
}
