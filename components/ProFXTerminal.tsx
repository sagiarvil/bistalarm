'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import Decimal from 'decimal.js';
import { 
  UserAccount, 
  Position, 
  TradingEngine, 
  SYMBOL_SPECS, 
  OrderSide, 
  OrderType,
  SymbolSpec
} from '@/lib/tradingEngine';
import Link from 'next/link';

interface ProFXTerminalProps {
  account: UserAccount;
  currentPrices: Record<string, { bid: number; ask: number; high: number; low: number; time: string }>;
  onPlaceOrder: (params: {
    symbol: string;
    side: OrderSide;
    type: OrderType;
    lots: number;
    sl: number | null;
    tp: number | null;
    targetPrice?: number;
  }) => void;
  onCloseFull: (id: string) => void;
  onClosePartial: (id: string, lots: number) => void;
  onUpdateSLTP: (id: string, sl: number | null, tp: number | null) => void;
  onDeposit: (amount: number) => void;
  onChangeLeverage: (leverage: number) => void;
  onOpenModal?: (modalName: 'deposit' | 'withdraw' | 'accounts' | 'calendar' | 'security') => void;
  onOpenNextGenHub?: () => void;
}

interface Candle {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export default function ProFXTerminal({
  account,
  currentPrices,
  onPlaceOrder,
  onCloseFull,
  onClosePartial,
  onUpdateSLTP,
  onDeposit,
  onChangeLeverage,
  onOpenModal,
  onOpenNextGenHub
}: ProFXTerminalProps) {
  // Seçili Sembol & Kategori
  const [selectedSymbol, setSelectedSymbol] = useState<string>('NASDAQ.j');
  const [symbolCategory, setSymbolCategory] = useState<'ALL' | 'Forex' | 'Indices' | 'Commodities' | 'Crypto' | 'Synthetic'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [favorites, setFavorites] = useState<string[]>(['NASDAQ.j', 'XAUUSDX', 'DAX.j']);
  const [onlyFavorites, setOnlyFavorites] = useState(false);

  // Mobil Sekme Yönetimi (Mobilde ekranı tek tek gösterir)
  // 'chart' | 'quotes' | 'trade' | 'positions' | 'menu'
  const [mobileTab, setMobileTab] = useState<'chart' | 'quotes' | 'trade' | 'positions' | 'menu'>('chart');

  // Grafik Ayarları
  const [timeframe, setTimeframe] = useState<'M1' | 'M5' | 'M15' | 'M30' | 'H1' | 'H4' | 'D1'>('M15');
  const [chartType, setChartType] = useState<'candles' | 'hollow' | 'line'>('candles');
  const [showRSI, setShowRSI] = useState<boolean>(true);
  const [showBollinger, setShowBollinger] = useState<boolean>(false);
  const [showEMA, setShowEMA] = useState<boolean>(true);

  // Masaüstü Sekmeleri
  const [rightPanelTab, setRightPanelTab] = useState<'ticket' | 'dom' | 'sentiment'>('ticket');
  const [bottomTab, setBottomTab] = useState<'positions' | 'history' | 'journal'>('positions');

  // Emir Formu
  const [orderSide, setOrderSide] = useState<OrderSide>('buy');
  const [execMode, setExecMode] = useState<'market' | 'pending'>('market');
  const [pendingType, setPendingType] = useState<'limit' | 'stop'>('limit');
  const [orderLots, setOrderLots] = useState<number>(0.10);
  const [slPrice, setSlPrice] = useState<string>('');
  const [tpPrice, setTpPrice] = useState<string>('');
  const [targetPendingPrice, setTargetPendingPrice] = useState<string>('');
  const [commentText, setCommentText] = useState<string>('');

  // Canlı Saat & Ping
  const [currentTimeUTC, setCurrentTimeUTC] = useState<string>('');
  const [pingMs, setPingMs] = useState<number>(14);

  // Canvas Ref
  const canvasContainerRef = useRef<HTMLDivElement | null>(null);
  const mainCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const rsiCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const [candles, setCandles] = useState<Candle[]>([]);

  // Fiyat Flaşları
  const prevPricesRef = useRef<Record<string, number>>({});
  const [priceFlash, setPriceFlash] = useState<Record<string, 'up' | 'down'>>({});

  const spec: SymbolSpec = SYMBOL_SPECS[selectedSymbol] || {
    symbol: selectedSymbol,
    name: selectedSymbol,
    category: 'Indices',
    contractSize: 1,
    digits: 2,
    pipSize: 0.01,
    spread: 0.70,
    commissionPerLot: 1.50,
    basePrice: 30411.30,
  };

  const curPrice = currentPrices[selectedSymbol] || {
    bid: spec.basePrice,
    ask: spec.basePrice + spec.spread,
    high: spec.basePrice * 1.008,
    low: spec.basePrice * 0.992,
    time: '17:22:42'
  };

  // Saat & Ping
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setCurrentTimeUTC(now.toUTCString().slice(17, 25) + ' UTC');
      setPingMs(Math.floor(11 + Math.random() * 6));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Flaş Efekti
  useEffect(() => {
    const flashes: Record<string, 'up' | 'down'> = {};
    for (const [sym, price] of Object.entries(currentPrices)) {
      const prev = prevPricesRef.current[sym];
      if (prev !== undefined) {
        if (price.bid > prev) flashes[sym] = 'up';
        else if (price.bid < prev) flashes[sym] = 'down';
      }
      prevPricesRef.current[sym] = price.bid;
    }
    setPriceFlash(flashes);

    const t = setTimeout(() => setPriceFlash({}), 450);
    return () => clearTimeout(t);
  }, [currentPrices]);

  // Sembol değiştikçe başlangıç mumları üret
  useEffect(() => {
    const base = curPrice.bid;
    const initialCandles: Candle[] = [];
    let p = base - 45 * spec.pipSize * 10;
    const now = Date.now();

    for (let i = 50; i >= 0; i--) {
      const open = p;
      const variation = (Math.random() - 0.485) * spec.pipSize * 30;
      const close = open + variation;
      const high = Math.max(open, close) + Math.random() * spec.pipSize * 18;
      const low = Math.min(open, close) - Math.random() * spec.pipSize * 18;
      p = close;

      initialCandles.push({
        time: now - i * 60 * 1000,
        open: Number(open.toFixed(spec.digits)),
        high: Number(high.toFixed(spec.digits)),
        low: Number(low.toFixed(spec.digits)),
        close: Number(close.toFixed(spec.digits)),
        volume: Math.floor(Math.random() * 850) + 120
      });
    }

    setCandles(initialCandles);
  }, [selectedSymbol]);

  // Canlı fiyat değişiminde mumu güncelle
  useEffect(() => {
    setCandles(prev => {
      if (prev.length === 0) return prev;
      const copy = [...prev];
      const last = { ...copy[copy.length - 1] };
      const current = curPrice.bid;

      last.close = current;
      last.high = Math.max(last.high, current);
      last.low = Math.min(last.low, current);
      last.volume += 1;

      copy[copy.length - 1] = last;
      return copy;
    });
  }, [curPrice.bid]);

  // Ekran boyutu değiştikçe canvas boyutunu dinamik ayarla (Resize Observer)
  useEffect(() => {
    const handleResize = () => {
      const container = canvasContainerRef.current;
      const canvas = mainCanvasRef.current;
      if (container && canvas) {
        canvas.width = container.clientWidth || 800;
        canvas.height = container.clientHeight || 400;
      }
      const rsiCanvas = rsiCanvasRef.current;
      if (container && rsiCanvas) {
        rsiCanvas.width = container.clientWidth || 800;
        rsiCanvas.height = 70;
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [mobileTab]);

  // 1. ANA GRAFİK ÇİZİMİ (CANVAS 60FPS)
  useEffect(() => {
    const canvas = mainCanvasRef.current;
    if (!canvas || candles.length === 0) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    // Arka Plan
    ctx.fillStyle = '#080b11';
    ctx.fillRect(0, 0, width, height);

    // Grid Çizgileri
    ctx.strokeStyle = '#121824';
    ctx.lineWidth = 1;

    for (let x = 40; x < width - 65; x += 75) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }

    for (let y = 25; y < height - 20; y += 40) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width - 65, y);
      ctx.stroke();
    }

    // Min & Max Fiyat
    const padding = 15;
    const chartHeight = height - 20;
    const chartWidth = width - 65;

    let minPrice = Math.min(...candles.map(c => c.low));
    let maxPrice = Math.max(...candles.map(c => c.high));
    const range = (maxPrice - minPrice) || 1;
    minPrice -= range * 0.08;
    maxPrice += range * 0.08;
    const fullRange = maxPrice - minPrice;

    const getY = (val: number) => {
      return chartHeight - ((val - minPrice) / fullRange) * (chartHeight - padding * 2) - padding;
    };

    const candleWidth = Math.max(4, (chartWidth / candles.length) * 0.65);
    const spacing = chartWidth / candles.length;

    // Mumlar
    candles.forEach((c, idx) => {
      const x = idx * spacing + spacing / 2;
      const yOpen = getY(c.open);
      const yClose = getY(c.close);
      const yHigh = getY(c.high);
      const yLow = getY(c.low);

      const isGreen = c.close >= c.open;
      const color = isGreen ? '#089981' : '#f23645';

      // Fitil
      ctx.strokeStyle = color;
      ctx.lineWidth = 1.3;
      ctx.beginPath();
      ctx.moveTo(x, yHigh);
      ctx.lineTo(x, yLow);
      ctx.stroke();

      // Gövde
      const top = Math.min(yOpen, yClose);
      const h = Math.max(2, Math.abs(yClose - yOpen));

      if (chartType === 'hollow' && isGreen) {
        ctx.strokeStyle = color;
        ctx.lineWidth = 1.5;
        ctx.strokeRect(x - candleWidth / 2, top, candleWidth, h);
      } else {
        ctx.fillStyle = color;
        ctx.fillRect(x - candleWidth / 2, top, candleWidth, h);
      }

      // Hacim
      ctx.fillStyle = isGreen ? 'rgba(8, 153, 129, 0.20)' : 'rgba(242, 54, 69, 0.20)';
      const volHeight = Math.min(35, (c.volume / 1000) * 35);
      ctx.fillRect(x - candleWidth / 2, chartHeight - volHeight, candleWidth, volHeight);
    });

    // EMA 20
    if (showEMA && candles.length > 10) {
      ctx.strokeStyle = '#2979ff';
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      let started = false;
      for (let i = 10; i < candles.length; i++) {
        const slice = candles.slice(i - 10, i + 1);
        const avg = slice.reduce((a, b) => a + b.close, 0) / slice.length;
        const x = i * spacing + spacing / 2;
        const y = getY(avg);
        if (!started) { ctx.moveTo(x, y); started = true; }
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
    }

    // Açık Pozisyon Çizgileri
    account.positions.filter(p => p.symbol === selectedSymbol).forEach((pos) => {
      const yPos = getY(pos.openPrice);
      ctx.strokeStyle = pos.side === 'buy' ? '#2979ff' : '#f23645';
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(0, yPos);
      ctx.lineTo(chartWidth, yPos);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.fillStyle = pos.side === 'buy' ? '#2979ff' : '#f23645';
      ctx.fillRect(4, yPos - 9, 115, 17);
      ctx.fillStyle = '#ffffff';
      ctx.font = '10px monospace';
      ctx.fillText(`${pos.side.toUpperCase()} ${pos.lots} @ ${pos.openPrice}`, 8, yPos + 3);
    });

    // Canlı Fiyat Çizgisi
    const yBid = getY(curPrice.bid);
    ctx.strokeStyle = '#089981';
    ctx.setLineDash([2, 2]);
    ctx.beginPath();
    ctx.moveTo(0, yBid);
    ctx.lineTo(chartWidth, yBid);
    ctx.stroke();
    ctx.setLineDash([]);

    // Sağ Skala
    ctx.fillStyle = '#0d1117';
    ctx.fillRect(chartWidth, 0, 65, height);
    ctx.strokeStyle = '#1e2633';
    ctx.strokeRect(chartWidth, 0, 1, height);

    ctx.fillStyle = '#6e7681';
    ctx.font = '10px monospace';
    for (let y = 25; y < height - 20; y += 40) {
      const priceAtY = maxPrice - ((y - padding) / (chartHeight - padding * 2)) * fullRange;
      ctx.fillText(priceAtY.toFixed(spec.digits), chartWidth + 5, y + 4);
    }

    // Canlı Fiyat Etiketi
    ctx.fillStyle = '#089981';
    ctx.fillRect(chartWidth, yBid - 9, 65, 18);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 10px monospace';
    ctx.fillText(curPrice.bid.toFixed(spec.digits), chartWidth + 5, yBid + 4);

  }, [candles, curPrice, selectedSymbol, account.positions, showEMA, chartType]);

  // Hızlı Emir Gönderme
  const handleExecuteTrade = (side: OrderSide) => {
    const finalType: OrderType = execMode === 'market' 
      ? 'market' 
      : (pendingType === 'limit' ? (side === 'buy' ? 'buy_limit' : 'sell_limit') : (side === 'buy' ? 'buy_stop' : 'sell_stop'));

    onPlaceOrder({
      symbol: selectedSymbol,
      side,
      type: finalType,
      lots: orderLots,
      sl: slPrice ? parseFloat(slPrice) : null,
      tp: tpPrice ? parseFloat(tpPrice) : null,
      targetPrice: targetPendingPrice ? parseFloat(targetPendingPrice) : undefined
    });

    // Mobilde işlem sonrası pozisyonlar sekmesine geç
    if (typeof window !== 'undefined' && window.innerWidth < 1024) {
      setMobileTab('positions');
    }
  };

  // Filtrelenmiş Semboller
  const filteredSymbols = useMemo(() => {
    return Object.keys(SYMBOL_SPECS).filter((sym) => {
      const s = SYMBOL_SPECS[sym];
      const matchesSearch = sym.toLowerCase().includes(searchQuery.toLowerCase()) || s.name.toLowerCase().includes(searchQuery.toLowerCase());
      if (onlyFavorites && !favorites.includes(sym)) return false;
      if (symbolCategory === 'ALL') return matchesSearch;
      return matchesSearch && s.category === symbolCategory;
    });
  }, [searchQuery, onlyFavorites, favorites, symbolCategory]);

  const toggleFavorite = (sym: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setFavorites(prev => prev.includes(sym) ? prev.filter(x => x !== sym) : [...prev, sym]);
  };

  const totalOpenProfit = account.positions.reduce((acc, p) => acc + p.profit, 0);
  const totalCommission = account.positions.reduce((acc, p) => acc + p.commission, 0);
  const requiredMargin = TradingEngine.calculateMargin(selectedSymbol, orderLots, curPrice.ask, account.leverage);
  const potentialPipValue = (spec.contractSize * spec.pipSize * orderLots).toFixed(2);

  return (
    <div className="flex flex-col h-screen w-screen bg-[#07090e] text-[#c9d1d9] font-sans overflow-hidden select-none">
      
      {/* ========================================================================= */}
      {/* 1. ÜST HEADER: MASAÜSTÜ & MOBİL TAM DUYARLI (RESPONSIVE) */}
      {/* ========================================================================= */}
      <header className="h-12 bg-[#0b0e14] border-b border-[#1b2230] px-3 flex items-center justify-between z-30 shrink-0">
        
        {/* Sol Logo & Sembol Seçici (Mobilde tıklayınca parite listesini açar) */}
        <div className="flex items-center gap-3">
          <div 
            onClick={() => setMobileTab('quotes')}
            className="flex items-center gap-2 cursor-pointer hover:opacity-90 transition"
          >
            <div className="w-7 h-7 rounded bg-gradient-to-tr from-blue-600 to-cyan-500 flex items-center justify-center font-bold text-white text-xs shadow-md">
              FX
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-xs sm:text-sm tracking-wider text-white">{selectedSymbol}</span>
                <span className="text-[10px] text-blue-400 font-mono">▼</span>
              </div>
              <span className="text-[9px] text-gray-500 font-mono hidden sm:inline">{spec.name}</span>
            </div>
          </div>

          <div className="h-4 w-px bg-[#1e2637] hidden sm:block"></div>

          {/* Sunucu & Ping Rozeti */}
          <div className="hidden xl:flex items-center gap-2 text-[11px] font-mono text-gray-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="text-gray-300">LD4 London</span>
            <span className="text-emerald-400 font-bold">{pingMs}ms</span>
          </div>
        </div>

        {/* Orta Bakiye & Equity Ticker (Mobilde yatay kaydırılabilir) */}
        <div className="flex items-center gap-2 sm:gap-4 bg-[#080b10] border border-[#1b2230] rounded px-2.5 py-1 text-xs font-mono overflow-x-auto max-w-[200px] sm:max-w-none scrollbar-none">
          <div className="shrink-0">
            <span className="text-gray-500 text-[10px] block sm:inline sm:text-xs">Bakiye: </span>
            <span className="font-bold text-white">${account.balance.toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}</span>
          </div>
          <div className="h-3 w-px bg-[#1b2230] shrink-0"></div>
          <div className="shrink-0">
            <span className="text-gray-500 text-[10px] block sm:inline sm:text-xs">Özkaynak: </span>
            <span className={`font-bold ${totalOpenProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              ${account.equity.toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}
            </span>
          </div>
          <div className="h-3 w-px bg-[#1b2230] shrink-0 hidden md:block"></div>
          <div className="shrink-0 hidden md:block">
            <span className="text-gray-500 text-xs">Serbest: </span>
            <span className="font-bold text-cyan-400">${account.freeMargin.toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}</span>
          </div>
        </div>

        {/* Sağ Hızlı Butonlar */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Yeni Nesil Kazanç Kapıları Butonu */}
          <button 
            onClick={onOpenNextGenHub}
            className="bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 hover:opacity-90 text-white text-[11px] font-extrabold px-2.5 sm:px-3 py-1 rounded transition shadow-lg shrink-0 flex items-center gap-1.5 border border-purple-400/30"
          >
            <span>🚀</span>
            <span className="hidden sm:inline">Yeni Nesil</span> Kazanç
          </button>

          <button 
            onClick={() => onOpenModal ? onOpenModal('deposit') : onDeposit(2500)}
            className="bg-[#238636] hover:bg-[#2ea043] text-white text-[11px] font-bold px-2 sm:px-3 py-1 rounded transition shadow shrink-0"
          >
            <span>+</span> Yatır
          </button>

          <Link
            href="/admin"
            className="bg-[#161b22] hover:bg-[#21262d] border border-blue-500/40 text-blue-400 text-[11px] px-2 py-1 rounded transition font-medium hidden sm:flex items-center gap-1"
          >
            <span>⚙️</span> Dealer
          </Link>
        </div>

      </header>

      {/* ========================================================================= */}
      {/* 2. ÇALIŞMA ALANI: MASAÜSTÜNDE 3 PANEL / MOBİLDE SEKME BAZLI TAM EKRAN */}
      {/* ========================================================================= */}
      <div className="flex-1 flex overflow-hidden relative">
        
        {/* SOL MARKET WATCH: MASAÜSTÜNDE YANDA / MOBİLDE 'quotes' SEKMESİNDE */}
        <aside className={`
          bg-[#0b0e14] border-r border-[#1b2230] flex flex-col shrink-0
          lg:w-72 lg:flex
          ${mobileTab === 'quotes' ? 'w-full flex absolute inset-0 z-20' : 'hidden'}
        `}>
          
          {/* Arama ve Filtreler */}
          <div className="p-2.5 border-b border-[#1b2230] space-y-2">
            <div className="relative">
              <input 
                type="text"
                placeholder="Sembol / Parite Ara..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#121721] text-xs text-white rounded px-2.5 py-2 pl-8 border border-[#232c3d] focus:outline-none focus:border-blue-500 placeholder-gray-500"
              />
              <span className="absolute left-2.5 top-2 text-gray-500 text-xs">🔍</span>
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="absolute right-2.5 top-2 text-gray-400 hover:text-white text-xs">✕</button>
              )}
            </div>

            <div className="flex items-center justify-between text-xs font-semibold">
              <div className="flex items-center gap-1 overflow-x-auto pb-0.5">
                {(['ALL', 'Forex', 'Indices', 'Commodities', 'Crypto', 'Synthetic'] as const).map(cat => (
                  <button
                    key={cat}
                    onClick={() => { setOnlyFavorites(false); setSymbolCategory(cat); }}
                    className={`px-2 py-1 rounded transition text-[11px] whitespace-nowrap ${!onlyFavorites && symbolCategory === cat ? 'bg-blue-600 text-white font-bold' : 'text-gray-400 hover:bg-[#161c28]'}`}
                  >
                    {cat === 'ALL' ? 'TÜMÜ' : cat === 'Commodities' ? 'EMTİA' : cat === 'Synthetic' ? 'SENTETİK' : cat === 'Indices' ? 'ENDEKS' : cat.toUpperCase()}
                  </button>
                ))}
              </div>

              <button
                onClick={() => setOnlyFavorites(!onlyFavorites)}
                className={`px-2 py-1 rounded transition ${onlyFavorites ? 'text-yellow-400 font-bold bg-yellow-400/10' : 'text-gray-500 hover:text-yellow-400'}`}
                title="Favorileri Göster"
              >
                ★
              </button>
            </div>
          </div>

          {/* Liste Başlığı */}
          <div className="grid grid-cols-12 px-3 py-1.5 bg-[#0f141f] text-[10px] text-gray-500 font-semibold border-b border-[#1b2230]">
            <span className="col-span-5">SEMBOL</span>
            <span className="col-span-3 text-right">BID</span>
            <span className="col-span-3 text-right">ASK</span>
            <span className="col-span-1 text-right">SPR</span>
          </div>

          {/* Parite Listesi */}
          <div className="flex-1 overflow-y-auto divide-y divide-[#131924]">
            {filteredSymbols.map(sym => {
              const sp = SYMBOL_SPECS[sym];
              const p = currentPrices[sym] || { bid: sp.basePrice, ask: sp.basePrice + sp.spread };
              const isSelected = selectedSymbol === sym;
              const flash = priceFlash[sym];
              const spreadVal = (sp.spread / sp.pipSize).toFixed(1);
              const isFav = favorites.includes(sym);

              return (
                <div 
                  key={sym}
                  onClick={() => {
                    setSelectedSymbol(sym);
                    setMobileTab('chart'); // Mobilde seçince hemen grafiği aç
                  }}
                  className={`grid grid-cols-12 px-3 py-3 text-xs font-mono items-center cursor-pointer transition select-none active:bg-[#151e2d] ${
                    isSelected ? 'bg-[#151e2d] border-l-2 border-blue-500' : 'hover:bg-[#0f141f]'
                  }`}
                >
                  <div className="col-span-5 flex items-center gap-2">
                    <span 
                      onClick={(e) => toggleFavorite(sym, e)}
                      className={`text-sm ${isFav ? 'text-yellow-400' : 'text-gray-600 hover:text-gray-400'}`}
                    >
                      ★
                    </span>
                    <div className="flex flex-col">
                      <span className="font-bold text-white text-xs leading-tight">{sym}</span>
                      <span className="text-[10px] text-gray-500 font-sans leading-tight truncate">{sp.name}</span>
                    </div>
                  </div>

                  <div className={`col-span-3 text-right font-semibold text-xs transition-colors duration-300 ${
                    flash === 'up' ? 'text-emerald-400 bg-emerald-500/10' : flash === 'down' ? 'text-rose-400 bg-rose-500/10' : 'text-blue-400'
                  }`}>
                    {p.bid.toFixed(sp.digits)}
                  </div>

                  <div className={`col-span-3 text-right font-semibold text-xs transition-colors duration-300 ${
                    flash === 'up' ? 'text-emerald-400 bg-emerald-500/10' : flash === 'down' ? 'text-rose-400 bg-rose-500/10' : 'text-rose-400'
                  }`}>
                    {p.ask.toFixed(sp.digits)}
                  </div>

                  <div className="col-span-1 text-right text-[10px] text-gray-500">
                    {spreadVal}
                  </div>
                </div>
              );
            })}
          </div>

        </aside>

        {/* ORTA GRAFİK PANELİ: MASAÜSTÜNDE ORTADA / MOBİLDE 'chart' SEKMESİNDE */}
        <main className={`
          flex-1 flex flex-col bg-[#080b11] overflow-hidden
          lg:flex
          ${mobileTab === 'chart' ? 'w-full flex' : 'hidden'}
        `}>
          
          {/* Grafik Kontrol Çubuğu */}
          <div className="h-9 bg-[#0b0e14] border-b border-[#1b2230] px-3 flex items-center justify-between shrink-0 text-xs">
            
            <div className="flex items-center gap-2 sm:gap-3 overflow-x-auto scrollbar-none">
              <span className="font-extrabold text-white text-xs sm:text-sm tracking-wide shrink-0">{selectedSymbol}</span>

              <div className="h-3 w-px bg-[#1b2230] shrink-0"></div>

              {/* Zaman Dilimleri */}
              <div className="flex items-center gap-0.5 shrink-0">
                {(['M1', 'M5', 'M15', 'H1', 'H4', 'D1'] as const).map(tf => (
                  <button
                    key={tf}
                    onClick={() => setTimeframe(tf)}
                    className={`px-1.5 py-0.5 rounded font-mono text-[11px] font-medium transition ${
                      timeframe === tf ? 'bg-[#2979ff] text-white font-bold' : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    {tf}
                  </button>
                ))}
              </div>

              <div className="h-3 w-px bg-[#1b2230] shrink-0"></div>

              <button
                onClick={() => setChartType(chartType === 'candles' ? 'hollow' : chartType === 'hollow' ? 'line' : 'candles')}
                className="px-2 py-0.5 bg-[#121721] hover:bg-[#1a2232] text-gray-300 rounded border border-[#232c3d] text-[10px] shrink-0"
              >
                {chartType === 'candles' ? '📊 Mum' : chartType === 'hollow' ? '🕯️ İçi Boş' : '📈 Çizgi'}
              </button>
            </div>

            {/* OHLC Barı (Geniş ekranda) */}
            <div className="text-[11px] font-mono text-gray-400 hidden xl:flex items-center gap-3">
              <span>H: <b className="text-emerald-400">{curPrice.high.toFixed(spec.digits)}</b></span>
              <span>L: <b className="text-rose-400">{curPrice.low.toFixed(spec.digits)}</b></span>
              <span>Spr: <b className="text-blue-400">{(spec.spread / spec.pipSize).toFixed(1)}p</b></span>
            </div>

          </div>

          {/* HIZLI ONE-CLICK TRADE ŞERİDİ (HEM MASAÜSTÜ HEM MOBİL UYUMLU) */}
          <div className="bg-[#090c12] border-b border-[#161c26] p-2 sm:px-3 sm:py-2 flex items-center justify-between shrink-0 gap-2">
            <div className="flex items-center gap-2 w-full sm:w-auto">
              
              <button
                onClick={() => handleExecuteTrade('sell')}
                className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 bg-[#f23645] hover:bg-[#d82a39] active:scale-95 text-white py-2 sm:py-1.5 px-3 rounded font-bold font-mono text-xs transition shadow"
              >
                <span>SELL</span>
                <span className="font-extrabold">{curPrice.bid.toFixed(spec.digits)}</span>
              </button>

              {/* Lot Seçici */}
              <div className="flex items-center bg-[#121721] border border-[#232c3d] rounded px-1.5 py-1">
                <button 
                  onClick={() => setOrderLots(prev => Math.max(0.01, Number((prev - 0.05).toFixed(2))))}
                  className="text-gray-400 hover:text-white px-1.5 font-bold text-xs"
                >-</button>
                <input 
                  type="number"
                  step="0.01"
                  value={orderLots}
                  onChange={(e) => setOrderLots(Math.max(0.01, parseFloat(e.target.value) || 0.01))}
                  className="w-12 bg-transparent text-center font-mono font-bold text-white text-xs focus:outline-none"
                />
                <button 
                  onClick={() => setOrderLots(prev => Number((prev + 0.05).toFixed(2)))}
                  className="text-gray-400 hover:text-white px-1.5 font-bold text-xs"
                >+</button>
              </div>

              <button
                onClick={() => handleExecuteTrade('buy')}
                className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 bg-[#089981] hover:bg-[#06806c] active:scale-95 text-white py-2 sm:py-1.5 px-3 rounded font-bold font-mono text-xs transition shadow"
              >
                <span>BUY</span>
                <span className="font-extrabold">{curPrice.ask.toFixed(spec.digits)}</span>
              </button>

            </div>

            <div className="text-[11px] font-mono text-gray-400 hidden md:flex items-center gap-4">
              <span>Pip: <b className="text-white">${potentialPipValue}</b></span>
              <span>Teminat: <b className="text-cyan-400">${requiredMargin.toFixed(2)}</b></span>
            </div>
          </div>

          {/* Grafik Canvas Taşıyıcısı */}
          <div ref={canvasContainerRef} className="flex-1 relative bg-[#080b11] overflow-hidden min-h-[250px]">
            <canvas 
              ref={mainCanvasRef}
              className="w-full h-full block"
            />
          </div>

        </main>

        {/* SAĞ PANEL: MASAÜSTÜNDE SAĞDA / MOBİLDE 'trade' SEKMESİNDE */}
        <aside className={`
          bg-[#0b0e14] border-l border-[#1b2230] flex flex-col shrink-0
          lg:w-80 lg:flex
          ${mobileTab === 'trade' ? 'w-full flex absolute inset-0 z-20' : 'hidden'}
        `}>
          
          <div className="h-10 bg-[#0f141f] border-b border-[#1b2230] px-3 flex items-center justify-between text-xs font-semibold">
            <span className="text-white uppercase tracking-wider font-bold">Emir Bileti</span>
            <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded font-mono">STP/ECN İCRA</span>
          </div>

          <div className="p-4 space-y-4 flex-1 overflow-y-auto">
            
            {/* Market vs Pending */}
            <div className="grid grid-cols-2 gap-1.5 bg-[#121721] p-1 rounded border border-[#232c3d] text-xs font-semibold">
              <button
                onClick={() => setExecMode('market')}
                className={`py-2 rounded transition ${execMode === 'market' ? 'bg-[#2979ff] text-white font-bold' : 'text-gray-400'}`}
              >
                Piyasa Emri
              </button>
              <button
                onClick={() => setExecMode('pending')}
                className={`py-2 rounded transition ${execMode === 'pending' ? 'bg-[#2979ff] text-white font-bold' : 'text-gray-400'}`}
              >
                Bekleyen Emir
              </button>
            </div>

            {/* Yön (Buy / Sell) */}
            <div className="grid grid-cols-2 gap-2 text-xs font-bold font-mono">
              <button
                onClick={() => setOrderSide('buy')}
                className={`p-3 rounded border transition flex flex-col items-center ${
                  orderSide === 'buy' 
                    ? 'bg-[#089981]/20 border-[#089981] text-[#089981]' 
                    : 'bg-[#121721] border-[#232c3d] text-gray-400'
                }`}
              >
                <span className="text-xs">BUY (ALIŞ)</span>
                <span className="text-base font-extrabold mt-1">{curPrice.ask.toFixed(spec.digits)}</span>
              </button>

              <button
                onClick={() => setOrderSide('sell')}
                className={`p-3 rounded border transition flex flex-col items-center ${
                  orderSide === 'sell' 
                    ? 'bg-[#f23645]/20 border-[#f23645] text-[#f23645]' 
                    : 'bg-[#121721] border-[#232c3d] text-gray-400'
                }`}
              >
                <span className="text-xs">SELL (SATIŞ)</span>
                <span className="text-base font-extrabold mt-1">{curPrice.bid.toFixed(spec.digits)}</span>
              </button>
            </div>

            {/* Lot Girişi */}
            <div>
              <div className="flex justify-between text-xs text-gray-400 mb-1.5">
                <span>İşlem Hacmi (Lot):</span>
                <span>Gerekli: ~${requiredMargin.toFixed(2)}</span>
              </div>
              <div className="flex items-center bg-[#121721] border border-[#232c3d] rounded p-2">
                <input 
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={orderLots}
                  onChange={(e) => setOrderLots(Math.max(0.01, parseFloat(e.target.value) || 0.01))}
                  className="w-full bg-transparent font-mono text-base text-white font-bold px-2 focus:outline-none"
                />
                <span className="text-xs text-gray-500 font-mono pr-2">LOT</span>
              </div>
            </div>

            {/* SL / TP */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[11px] text-gray-400 block mb-1">Zarar Durdur (SL)</label>
                <input 
                  type="number"
                  placeholder="Fiyat"
                  value={slPrice}
                  onChange={(e) => setSlPrice(e.target.value)}
                  className="w-full bg-[#121721] border border-[#232c3d] rounded p-2 text-xs text-white font-mono focus:outline-none focus:border-red-500"
                />
              </div>

              <div>
                <label className="text-[11px] text-gray-400 block mb-1">Kâr Al (TP)</label>
                <input 
                  type="number"
                  placeholder="Fiyat"
                  value={tpPrice}
                  onChange={(e) => setTpPrice(e.target.value)}
                  className="w-full bg-[#121721] border border-[#232c3d] rounded p-2 text-xs text-white font-mono focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            {/* Onay Butonu */}
            <button
              onClick={() => handleExecuteTrade(orderSide)}
              className={`w-full py-3.5 rounded font-bold font-mono text-sm text-white shadow-lg transition active:scale-98 ${
                orderSide === 'buy' ? 'bg-[#089981] hover:bg-[#06806c]' : 'bg-[#f23645] hover:bg-[#d82a39]'
              }`}
            >
              {orderSide === 'buy' 
                ? `BUY ${orderLots} LOT @ ${curPrice.ask.toFixed(spec.digits)}` 
                : `SELL ${orderLots} LOT @ ${curPrice.bid.toFixed(spec.digits)}`
              }
            </button>

          </div>

        </aside>

        {/* POZİSYONLAR: MOBİLDE 'positions' SEKMESİNDE */}
        {mobileTab === 'positions' && (
          <div className="w-full flex lg:hidden absolute inset-0 z-20 bg-[#07090e] flex-col overflow-y-auto p-3 space-y-3">
            <div className="flex justify-between items-center border-b border-[#1b2230] pb-2">
              <span className="font-bold text-white text-sm">Açık Pozisyonlar ({account.positions.length})</span>
              <span className={`font-mono font-bold text-sm ${totalOpenProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                ${totalOpenProfit.toFixed(2)} USD
              </span>
            </div>

            {account.positions.length === 0 ? (
              <div className="text-center py-16 text-gray-500 text-xs">
                Açık pozisyonunuz bulunmamaktadır.
              </div>
            ) : (
              account.positions.map(pos => (
                <div key={pos.id} className="bg-[#121721] border border-[#1b2230] rounded-lg p-3 space-y-2 font-mono text-xs">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold text-white ${pos.side === 'buy' ? 'bg-blue-600' : 'bg-rose-600'}`}>
                        {pos.side.toUpperCase()}
                      </span>
                      <span className="font-bold text-white text-sm">{pos.symbol}</span>
                      <span className="text-gray-400">{pos.lots} Lot</span>
                    </div>
                    <span className={`font-bold text-sm ${pos.profit >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      ${pos.profit.toFixed(2)}
                    </span>
                  </div>

                  <div className="flex justify-between text-gray-400 text-[11px]">
                    <span>Açılış: {pos.openPrice}</span>
                    <span>Güncel: {pos.currentPrice}</span>
                  </div>

                  <div className="flex justify-between items-center pt-1 border-t border-[#1e2637]">
                    <span className="text-[10px] text-gray-500">#{pos.ticket}</span>
                    <button
                      onClick={() => onCloseFull(pos.id)}
                      className="px-3 py-1 bg-rose-600 hover:bg-rose-500 text-white rounded text-xs font-semibold transition"
                    >
                      Kapat
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* MENÜ: MOBİLDE 'menu' SEKMESİNDE */}
        {mobileTab === 'menu' && (
          <div className="w-full flex lg:hidden absolute inset-0 z-20 bg-[#07090e] flex-col overflow-y-auto p-4 space-y-4">
            <h3 className="font-bold text-white text-base border-b border-[#1b2230] pb-2">Kurumsal İşlemler</h3>
            
            <div className="space-y-2">
              <button 
                onClick={onOpenNextGenHub}
                className="w-full p-3.5 bg-gradient-to-r from-purple-900/40 via-indigo-900/40 to-blue-900/40 border border-purple-500/50 rounded-lg flex items-center justify-between text-left text-white text-xs font-bold shadow-lg"
              >
                <div className="flex items-center gap-2">
                  <span className="text-base">🚀</span>
                  <div>
                    <span className="block text-white">Yeni Nesil Kazanç Kapıları</span>
                    <span className="text-[10px] text-purple-300 font-normal">1:2000 Kaldıraç • Boom/Crash • Arbitraj • Prop</span>
                  </div>
                </div>
                <span className="text-purple-400">›</span>
              </button>

              <button 
                onClick={() => { onOpenModal && onOpenModal('deposit'); }}
                className="w-full p-3 bg-[#121721] border border-[#1b2230] rounded-lg flex items-center justify-between text-left text-white text-xs font-semibold"
              >
                <span>💳 Para Yatırma (USDT, Havale, Kart)</span>
                <span>›</span>
              </button>

              <button 
                onClick={() => { onOpenModal && onOpenModal('withdraw'); }}
                className="w-full p-3 bg-[#121721] border border-[#1b2230] rounded-lg flex items-center justify-between text-left text-white text-xs font-semibold"
              >
                <span>💸 Para Çekme Talebi</span>
                <span>›</span>
              </button>

              <button 
                onClick={() => { onOpenModal && onOpenModal('accounts'); }}
                className="w-full p-3 bg-[#121721] border border-[#1b2230] rounded-lg flex items-center justify-between text-left text-white text-xs font-semibold"
              >
                <span>⚖️ Hesap Türleri (ECN Raw / Standart)</span>
                <span>›</span>
              </button>

              <button 
                onClick={() => { onOpenModal && onOpenModal('calendar'); }}
                className="w-full p-3 bg-[#121721] border border-[#1b2230] rounded-lg flex items-center justify-between text-left text-white text-xs font-semibold"
              >
                <span>📅 Canlı Ekonomik Takvim</span>
                <span>›</span>
              </button>

              <button 
                onClick={() => { onOpenModal && onOpenModal('security'); }}
                className="w-full p-3 bg-[#121721] border border-[#1b2230] rounded-lg flex items-center justify-between text-left text-white text-xs font-semibold"
              >
                <span>🛡️ Fon Güvenliği & Regülasyon</span>
                <span>›</span>
              </button>

              <Link
                href="/admin"
                className="w-full p-3 bg-[#1e293b] border border-blue-500/40 rounded-lg flex items-center justify-between text-left text-blue-400 text-xs font-semibold"
              >
                <span>⚙️ Market Maker Dealer Masası</span>
                <span>›</span>
              </Link>
            </div>
          </div>
        )}

      </div>

      {/* ========================================================================= */}
      {/* 3. MASAÜSTÜ ALT KONSOL TABLOSU (AÇIK İŞLEMLER / GEÇMİŞ) - SADECE lg+ */}
      {/* ========================================================================= */}
      <footer className="h-52 bg-[#0b0e14] border-t border-[#1b2230] hidden lg:flex flex-col shrink-0 z-20">
        
        {/* Sekmeler */}
        <div className="h-8 bg-[#0f141f] border-b border-[#1b2230] px-3 flex items-center justify-between text-xs font-semibold">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setBottomTab('positions')}
              className={`px-3 py-1 rounded-t transition ${bottomTab === 'positions' ? 'bg-[#18202d] text-white border-b-2 border-blue-500' : 'text-gray-400 hover:text-white'}`}
            >
              Açık Pozisyonlar ({account.positions.length})
            </button>
            <button
              onClick={() => setBottomTab('history')}
              className={`px-3 py-1 rounded-t transition ${bottomTab === 'history' ? 'bg-[#18202d] text-white border-b-2 border-blue-500' : 'text-gray-400 hover:text-white'}`}
            >
              Hesap Geçmişi ({account.history.length})
            </button>
            <button
              onClick={() => setBottomTab('journal')}
              className={`px-3 py-1 rounded-t transition ${bottomTab === 'journal' ? 'bg-[#18202d] text-white border-b-2 border-blue-500' : 'text-gray-400 hover:text-white'}`}
            >
              Sistem Günlüğü (Ledger)
            </button>
          </div>

          <div className="text-xs font-mono">
            <span className="text-gray-400">Net Açık K/Z: </span>
            <span className={`font-bold ${totalOpenProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              ${totalOpenProfit.toFixed(2)} USD
            </span>
          </div>
        </div>

        {/* Tablo */}
        <div className="flex-1 overflow-y-auto">
          {bottomTab === 'positions' && (
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-[#121721] text-gray-500 text-[10px] uppercase sticky top-0">
                <tr>
                  <th className="py-1.5 px-3">Ticket</th>
                  <th className="py-1.5 px-3">Zaman</th>
                  <th className="py-1.5 px-3">Yön</th>
                  <th className="py-1.5 px-3">Lot</th>
                  <th className="py-1.5 px-3">Sembol</th>
                  <th className="py-1.5 px-3">Açılış</th>
                  <th className="py-1.5 px-3">S / L</th>
                  <th className="py-1.5 px-3">T / P</th>
                  <th className="py-1.5 px-3">Güncel</th>
                  <th className="py-1.5 px-3 text-right">Net Kâr/Zarar</th>
                  <th className="py-1.5 px-3 text-center">İşlem</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#18202d]">
                {account.positions.length === 0 ? (
                  <tr>
                    <td colSpan={11} className="text-center py-6 text-gray-500 font-sans text-xs">
                      Aktif açık pozisyon bulunmamaktadır.
                    </td>
                  </tr>
                ) : (
                  account.positions.map(pos => (
                    <tr key={pos.id} className="hover:bg-[#141b26]">
                      <td className="py-1.5 px-3 text-gray-400">#{pos.ticket}</td>
                      <td className="py-1.5 px-3 text-gray-500">{pos.openTime}</td>
                      <td className={`py-1.5 px-3 font-bold ${pos.side === 'buy' ? 'text-blue-400' : 'text-rose-400'}`}>
                        {pos.side.toUpperCase()}
                      </td>
                      <td className="py-1.5 px-3 font-bold text-white">{pos.lots}</td>
                      <td className="py-1.5 px-3 font-bold text-white">{pos.symbol}</td>
                      <td className="py-1.5 px-3">{pos.openPrice}</td>
                      <td className="py-1.5 px-3 text-gray-400">{pos.sl || '-'}</td>
                      <td className="py-1.5 px-3 text-gray-400">{pos.tp || '-'}</td>
                      <td className="py-1.5 px-3 text-white">{pos.currentPrice}</td>
                      <td className={`py-1.5 px-3 text-right font-bold ${pos.profit >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                        ${pos.profit.toFixed(2)}
                      </td>
                      <td className="py-1.5 px-3 text-center">
                        <button
                          onClick={() => onCloseFull(pos.id)}
                          className="px-2 py-0.5 bg-rose-600/20 hover:bg-rose-600 text-rose-400 hover:text-white rounded text-[10px] transition"
                        >
                          ✕ Kapat
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}

          {bottomTab === 'history' && (
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-[#121721] text-gray-500 text-[10px] uppercase sticky top-0">
                <tr>
                  <th className="py-1.5 px-3">Ticket</th>
                  <th className="py-1.5 px-3">Kapanış</th>
                  <th className="py-1.5 px-3">Yön</th>
                  <th className="py-1.5 px-3">Lot</th>
                  <th className="py-1.5 px-3">Sembol</th>
                  <th className="py-1.5 px-3">Açılış</th>
                  <th className="py-1.5 px-3">Kapanış</th>
                  <th className="py-1.5 px-3 text-right">Net Kâr</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#18202d]">
                {account.history.map(item => (
                  <tr key={item.id} className="hover:bg-[#141b26]">
                    <td className="py-1.5 px-3 text-gray-400">#{item.ticket}</td>
                    <td className="py-1.5 px-3 text-gray-500">{item.closeTime}</td>
                    <td className={`py-1.5 px-3 font-bold ${item.side === 'buy' ? 'text-blue-400' : 'text-rose-400'}`}>
                      {item.side.toUpperCase()}
                    </td>
                    <td className="py-1.5 px-3 text-white">{item.lots}</td>
                    <td className="py-1.5 px-3 font-bold text-white">{item.symbol}</td>
                    <td className="py-1.5 px-3 text-gray-300">{item.openPrice}</td>
                    <td className="py-1.5 px-3 text-white">{item.closePrice}</td>
                    <td className={`py-1.5 px-3 text-right font-bold ${item.profit >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      ${item.profit.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {bottomTab === 'journal' && (
            <div className="p-3 space-y-1.5 font-mono text-xs">
              {account.ledger.map(led => (
                <div key={led.id} className="flex items-center justify-between border-b border-[#18202d] pb-1">
                  <div className="flex items-center gap-3">
                    <span className="text-gray-500">{led.time}</span>
                    <span className="font-bold text-white uppercase text-[10px] bg-[#141a24] px-1 rounded">{led.type}</span>
                    <span className="text-gray-300">{led.description}</span>
                  </div>
                  <span className={`font-bold ${led.amount >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {led.amount >= 0 ? `+$${led.amount.toFixed(2)}` : `-$${Math.abs(led.amount).toFixed(2)}`}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

      </footer>

      {/* ========================================================================= */}
      {/* 4. MOBİL ALT SABİT NAVİGASYON BAR (iOS/ANDROID BOTTOM TAB BAR) - SADECE < lg */}
      {/* ========================================================================= */}
      <nav className="h-14 bg-[#0b0e14] border-t border-[#1b2230] flex lg:hidden items-center justify-around z-30 shrink-0 select-none">
        
        <button
          onClick={() => setMobileTab('quotes')}
          className={`flex flex-col items-center justify-center flex-1 h-full transition ${
            mobileTab === 'quotes' ? 'text-blue-500 font-bold' : 'text-gray-400'
          }`}
        >
          <span className="text-base">📋</span>
          <span className="text-[10px] mt-0.5">Piyasa</span>
        </button>

        <button
          onClick={() => setMobileTab('chart')}
          className={`flex flex-col items-center justify-center flex-1 h-full transition ${
            mobileTab === 'chart' ? 'text-blue-500 font-bold' : 'text-gray-400'
          }`}
        >
          <span className="text-base">📈</span>
          <span className="text-[10px] mt-0.5">Grafik</span>
        </button>

        <button
          onClick={() => setMobileTab('trade')}
          className={`flex flex-col items-center justify-center flex-1 h-full transition ${
            mobileTab === 'trade' ? 'text-blue-500 font-bold' : 'text-gray-400'
          }`}
        >
          <span className="text-base">⚡</span>
          <span className="text-[10px] mt-0.5">İşlem</span>
        </button>

        <button
          onClick={() => setMobileTab('positions')}
          className={`flex flex-col items-center justify-center flex-1 h-full relative transition ${
            mobileTab === 'positions' ? 'text-blue-500 font-bold' : 'text-gray-400'
          }`}
        >
          <span className="text-base">📂</span>
          <span className="text-[10px] mt-0.5">Pozisyon</span>
          {account.positions.length > 0 && (
            <span className="absolute top-1.5 right-6 bg-blue-600 text-white text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
              {account.positions.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setMobileTab('menu')}
          className={`flex flex-col items-center justify-center flex-1 h-full transition ${
            mobileTab === 'menu' ? 'text-blue-500 font-bold' : 'text-gray-400'
          }`}
        >
          <span className="text-base">☰</span>
          <span className="text-[10px] mt-0.5">Menü</span>
        </button>

      </nav>

    </div>
  );
}
