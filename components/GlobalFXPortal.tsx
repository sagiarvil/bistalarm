'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { UserAccount, SYMBOL_SPECS } from '@/lib/tradingEngine';
import { AuthUser } from '@/lib/authStore';
import LiveTickerTape from './LiveTickerTape';
import LiveWinnersTicker from './LiveWinnersTicker';

interface GlobalFXPortalProps {
  account: UserAccount;
  currentPrices: Record<string, { bid: number; ask: number; high: number; low: number; time: string }>;
  onOpenTerminal: (symbol?: string) => void;
  onOpenDeposit: () => void;
  onOpenWithdraw: () => void;
  onOpenNextGen: () => void;
  onOpenCasinoSlot?: () => void;
  onOpenArcadeHub?: () => void;
  onOpenGrandCasino?: () => void;
  onOpenTacticsGuide?: () => void;
  currentUser?: AuthUser | null;
  onOpenAuth?: () => void;
}

export default function GlobalFXPortal({
  account,
  currentPrices,
  onOpenTerminal,
  onOpenDeposit,
  onOpenWithdraw,
  onOpenNextGen,
  onOpenCasinoSlot,
  onOpenArcadeHub,
  onOpenGrandCasino,
  onOpenTacticsGuide,
  currentUser,
  onOpenAuth
}: GlobalFXPortalProps) {
  const [marketTab, setMarketTab] = useState<'POPULAR' | 'FOREX' | 'INDICES' | 'METALS' | 'CRYPTO' | 'SYNTHETIC'>('POPULAR');

  // Canlı Ticker Pariteleri (Majörler, Sentetikler, Kripto, Emtia)
  const marqueeSymbols = ['EURUSD', 'GBPUSD', 'USDJPY', 'XAUUSDX', 'NASDAQ.j', 'SPX500.j', 'BTCUSD', 'ETHUSD', 'BOOM1000', 'CRASH500', 'ARB-USDT'];

  // Kategoriye Göre Semboller (Her Sekme Birebir Kendi Verisine ve Sinyaline Gider)
  const getSymbolsByCategory = () => {
    switch (marketTab) {
      case 'FOREX':
        return ['EURUSD', 'GBPUSD', 'USDJPY', 'DXY.j'];
      case 'INDICES':
        return ['NASDAQ.j', 'SPX500.j', 'DAX.j', 'US2000.j'];
      case 'METALS':
        return ['XAUUSDX', 'XAGUSD', 'BRENT.c'];
      case 'CRYPTO':
        return ['BTCUSD', 'ETHUSD', 'SOLUSD'];
      case 'SYNTHETIC':
        return ['BOOM1000', 'CRASH500', 'VOLATILITY75', 'ARB-USDT'];
      case 'POPULAR':
      default:
        return ['EURUSD', 'XAUUSDX', 'NASDAQ.j', 'BTCUSD', 'BOOM1000', 'ARB-USDT'];
    }
  };

  return (
    <div className="min-h-screen bg-[#06080d] text-[#c9d1d9] font-sans antialiased selection:bg-blue-600 selection:text-white">
      
      {/* ========================================================================= */}
      {/* 1. ULTRA-LÜKS GLOBAL NAVİGASYON (EXNESS & IC MARKETS STANDARDI) */}
      {/* ========================================================================= */}
      <nav className="sticky top-0 z-50 bg-[#070a10]/90 backdrop-blur-md border-b border-[#182030] px-4 lg:px-8 py-3 transition-all">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          
          {/* Logo */}
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-2.5 cursor-pointer">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-400 flex items-center justify-center font-extrabold text-white text-sm shadow-[0_0_15px_rgba(41,121,255,0.4)]">
                ⚡
              </div>
              <div className="flex flex-col">
                <span className="font-black text-base sm:text-lg tracking-wider text-white leading-tight">
                  EXBINA <span className="text-blue-500">PRIME</span>
                </span>
                <span className="text-[8px] text-gray-400 font-mono tracking-widest font-semibold uppercase">
                  GLOBAL ECN LIQUIDITY
                </span>
              </div>
            </div>

            {/* Masaüstü Menü (Exness & IC Markets Hiyerarşisi) */}
            <div className="hidden xl:flex items-center gap-6 text-xs font-semibold text-gray-300">
              <a href="#markets" className="hover:text-white transition">Piyasalar</a>
              <a href="#accounts" className="hover:text-white transition">Hesap Türleri</a>
              <button onClick={onOpenNextGen} className="flex items-center gap-1 text-purple-400 hover:text-purple-300 transition">
                <span>🚀</span> Prop Fonu ($100K)
              </button>
              {onOpenGrandCasino && (
                <button onClick={onOpenGrandCasino} className="flex items-center gap-1.5 text-amber-300 hover:text-amber-100 font-serif font-black tracking-wide transition px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/30 shadow-[0_0_10px_rgba(245,158,11,0.2)]">
                  <span>🇲🇨</span> Monte Carlo VIP
                </button>
              )}
              <a href="#technology" className="hover:text-white transition">Teknoloji & Güvenlik</a>
            </div>
          </div>

          {/* Sağ Eylem Butonları (Kesinlikle Kırılmayan & Taşmayan ECN Mimarisi) */}
          <div className="flex items-center gap-2.5 shrink-0">
            {onOpenAuth && (
              <button
                onClick={onOpenAuth}
                className="bg-[#121824] hover:bg-[#1a2335] border border-[#222f44] text-white text-xs font-semibold px-3 py-2 rounded-lg transition flex items-center gap-1.5 whitespace-nowrap active:scale-95"
              >
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                <span className="font-sans font-bold text-gray-200">
                  {currentUser ? currentUser.name.split(' ')[0] : 'Giriş / Kayıt'}
                </span>
              </button>
            )}

            <button
              onClick={onOpenDeposit}
              className="bg-[#151c28] hover:bg-[#1f293b] border border-[#26354a] text-white text-xs font-semibold px-3.5 py-2 rounded-lg transition whitespace-nowrap active:scale-95"
            >
              Para Yatır
            </button>

            <button
              onClick={() => onOpenTerminal()}
              className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-extrabold text-xs px-4 py-2 rounded-lg transition shadow-[0_0_15px_rgba(41,121,255,0.35)] flex items-center gap-1.5 active:scale-95 whitespace-nowrap"
            >
              <span>💻</span>
              <span>Canlı WebTrader</span>
            </button>

            <Link
              href="/admin"
              className="bg-[#10151f] hover:bg-[#182030] border border-blue-500/30 text-blue-400 text-xs px-2.5 py-2 rounded-lg transition hidden md:flex items-center gap-1 shrink-0 font-mono"
            >
              <span>⚙️</span> Dealer
            </Link>
          </div>

        </div>
      </nav>

      {/* ========================================================================= */}
      {/* 2. CANLI PARİTE KAYAN BANTI (LIVE TICKER DUAL-MARQUEE - HER CİHAZDA ÇALIŞIR) */}
      {/* ========================================================================= */}
      <LiveTickerTape 
        currentPrices={currentPrices} 
        onSelectSymbol={(sym) => onOpenTerminal(sym)} 
      />

      {/* ========================================================================= */}
      {/* 2.1 CANLI KAZANANLAR BANDI (LIVE WINNERS TICKER - ADRENALİN & FOMO AKIŞI) */}
      {/* ========================================================================= */}
      <LiveWinnersTicker />

      {/* ========================================================================= */}
      {/* 3. HERO SECTION (DÜNYA STANDARDI BAŞLIK VE ÇAĞRI) */}
      {/* ========================================================================= */}
      <section className="relative pt-12 pb-16 lg:pt-20 lg:pb-28 px-4 lg:px-8 overflow-hidden">
        
        {/* Arka Plan Işık Hüzmeleri (Glow Orbs) */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-blue-600/15 rounded-full blur-[140px] pointer-events-none"></div>
        <div className="absolute top-1/3 left-1/4 w-[300px] h-[250px] bg-purple-600/10 rounded-full blur-[120px] pointer-events-none"></div>

        <div className="max-w-5xl mx-auto text-center relative z-10 space-y-6">
          
          <div className="inline-flex items-center gap-2 bg-[#121824] border border-[#232d40] px-3.5 py-1.5 rounded-full text-xs font-mono text-gray-300 shadow-inner">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>Tier-1 Banka Likiditesi • Londra Equinix LD4 Optik Ağ</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-tight sm:leading-none">
            Piyasa Standartlarının Ötesinde <br />
            <span className="bg-gradient-to-r from-blue-400 via-cyan-400 to-indigo-400 bg-clip-text text-transparent">
              Kurumsal ECN İşlem Deneyimi
            </span>
          </h1>

          <p className="text-sm sm:text-base text-gray-400 max-w-2xl mx-auto leading-relaxed">
            0.0 Pip&apos;ten başlayan ham spreadler, 1:2000 kademeli dinamik kaldıraç, 0 saniye anında para çekme ve hafta sonu kesintisiz 7/24 sentetik endeksler.
          </p>

          {/* 2 Ana ECN & VIP CTA Butonu */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-3">
            <button
              onClick={() => onOpenTerminal()}
              className="w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-extrabold text-sm rounded-xl transition shadow-[0_0_30px_rgba(41,121,255,0.4)] flex items-center justify-center gap-2 active:scale-95"
            >
              <span>🚀</span> WebTrader&apos;ı Hemen Başlat
            </button>

            {onOpenGrandCasino && (
              <button
                onClick={onOpenGrandCasino}
                className="w-full sm:w-auto px-7 py-3.5 bg-gradient-to-r from-amber-600 via-yellow-500 to-amber-700 hover:opacity-95 text-black font-black text-sm rounded-xl transition shadow-[0_0_25px_rgba(245,158,11,0.4)] border border-amber-300 flex items-center justify-center gap-2 active:scale-95 font-serif"
              >
                <span>🇲🇨</span> Casino de Monte-Carlo VIP
              </button>
            )}
          </div>

          {/* İkincil Hızlı Seçenekler & Rozetler */}
          <div className="flex flex-wrap items-center justify-center gap-2.5 pt-2">
            <button
              onClick={onOpenNextGen}
              className="px-4 py-2 bg-[#101622] hover:bg-[#182030] border border-[#222d42] text-gray-300 hover:text-white font-semibold text-xs rounded-lg transition flex items-center gap-1.5 shadow-sm active:scale-95 font-mono"
            >
              <span>🏆</span> $100,000 Prop Fon Sınavı
            </button>

            {onOpenTacticsGuide && (
              <button
                onClick={onOpenTacticsGuide}
                className="px-4 py-2 bg-gradient-to-r from-amber-950/40 to-yellow-950/40 hover:from-amber-900/60 hover:to-yellow-900/60 border border-yellow-500/40 text-yellow-300 font-semibold text-xs rounded-lg transition flex items-center gap-1.5 shadow-sm active:scale-95 font-mono"
              >
                <span>⚡</span> VIP Taktik Manifestosu
              </button>
            )}

            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-[#0b0e14] border border-[#192232] rounded-lg text-[11px] font-mono text-emerald-400">
              <span>✓</span> 0.0 Ham Spread • LD4 Equinix
            </div>
          </div>

          {/* Canlı Mini Piyasa & Hızlı Al/Sat Önizleme Konsolu (Exness / TradingView Standardı) */}
          <div className="pt-4 max-w-4xl mx-auto">
            <div className="bg-[#0b0f17]/90 border border-[#1d273a] rounded-2xl p-4 sm:p-5 backdrop-blur-xl shadow-2xl text-left">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#182234] gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400 font-black text-sm">
                    ⚡
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-white font-black text-sm sm:text-base">XAUUSDX • Ons Altın Spot</span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-bold border border-emerald-500/20">CANLI 0.0 PİP</span>
                    </div>
                    <span className="text-[11px] text-gray-400 font-mono">Londra Külçe Piyasası Doğrudan İcra</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right font-mono">
                    <span className="text-[10px] text-gray-500 block">CANLI PİYASA ALIŞ / SATIŞ</span>
                    <span className="text-sm sm:text-base font-black text-blue-400">
                      {(currentPrices['XAUUSDX']?.bid || 2650.40).toFixed(2)}
                    </span>
                    <span className="text-gray-500 mx-1">/</span>
                    <span className="text-sm sm:text-base font-black text-rose-400">
                      {(currentPrices['XAUUSDX']?.ask || 2650.60).toFixed(2)}
                    </span>
                  </div>
                  <button
                    onClick={() => onOpenTerminal('XAUUSDX')}
                    className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg transition active:scale-95 whitespace-nowrap"
                  >
                    Terminalde Aç ↗
                  </button>
                </div>
              </div>

              {/* Gün İçi Canlı Fiyat Limitleri */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 text-xs font-mono">
                <div className="bg-[#101622] p-2.5 rounded-lg border border-[#1b2537]">
                  <span className="text-[10px] text-gray-400 block">24s En Yüksek</span>
                  <span className="text-white font-bold">{(currentPrices['XAUUSDX']?.high || 2665.80).toFixed(2)}</span>
                </div>
                <div className="bg-[#101622] p-2.5 rounded-lg border border-[#1b2537]">
                  <span className="text-[10px] text-gray-400 block">24s En Düşük</span>
                  <span className="text-white font-bold">{(currentPrices['XAUUSDX']?.low || 2642.10).toFixed(2)}</span>
                </div>
                <div className="bg-[#101622] p-2.5 rounded-lg border border-[#1b2537]">
                  <span className="text-[10px] text-gray-400 block">LD4 İcra Hızı</span>
                  <span className="text-emerald-400 font-bold">11.4 ms</span>
                </div>
                <div className="bg-[#101622] p-2.5 rounded-lg border border-[#1b2537]">
                  <span className="text-[10px] text-gray-400 block">Dinamik Kaldıraç</span>
                  <span className="text-cyan-400 font-bold">1:2000 Pro</span>
                </div>
              </div>
            </div>
          </div>

          {/* Kurumsal Tier-1 Güvenilirlik Çubuğu (Tekil & Mükerrersiz) */}
          <div className="pt-2 flex flex-wrap items-center justify-center gap-6 text-xs text-gray-400 font-mono">
            <span className="flex items-center gap-1.5"><span className="text-emerald-400">●</span> Barclays & JP Morgan Likiditesi</span>
            <span className="flex items-center gap-1.5"><span className="text-blue-400">●</span> Equinix LD4 Londra Veri Merkezi</span>
            <span className="flex items-center gap-1.5"><span className="text-yellow-400">●</span> Ayrılmış Segregated Hesaplar</span>
            <span className="flex items-center gap-1.5"><span className="text-purple-400">●</span> Sıfır Negatif Bakiye Koruması</span>
          </div>

        </div>

      </section>

      {/* ========================================================================= */}
      {/* 4. CANLI PİYASA DERİNLİK VE FİYAT MATRİSİ (MARKET EXPLORER) */}
      {/* ========================================================================= */}
      <section id="markets" className="py-12 bg-[#090c12] border-t border-[#182030] px-4 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-6">
          
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h2 className="text-2xl font-black text-white tracking-wide">
                Küresel Piyasalara Tek Platformdan Erişin
              </h2>
              <p className="text-xs text-gray-400 mt-1">
                Tüm kategoriler kendi bağımsız fiyat akışına, canlı sinyal algoritmasına ve ECN likiditesine bağlıdır.
              </p>
            </div>

            {/* Kategori Butonları (Forex, Endeks, Emtia, Kripto, Sentetik) */}
            <div className="flex items-center gap-1.5 bg-[#121721] p-1 rounded-xl border border-[#1e2637] text-xs font-semibold overflow-x-auto">
              {(['POPULAR', 'FOREX', 'INDICES', 'METALS', 'CRYPTO', 'SYNTHETIC'] as const).map(cat => (
                <button
                  key={cat}
                  onClick={() => setMarketTab(cat)}
                  className={`px-3 py-1.5 rounded-lg transition whitespace-nowrap ${
                    marketTab === cat ? 'bg-blue-600 text-white font-bold' : 'text-gray-400 hover:text-white'
                  }`}
                >
                  {cat === 'POPULAR' ? '🔥 Popüler' : cat === 'CRYPTO' ? '₿ Kripto (7/24)' : cat === 'SYNTHETIC' ? '💥 Sentetikler' : cat === 'METALS' ? '🪙 Metaller' : cat === 'INDICES' ? '📈 Endeksler' : '💱 Forex'}
                </button>
              ))}
            </div>
          </div>

          {/* Piyasa Tablosu */}
          <div className="bg-[#0c1017] border border-[#1b2332] rounded-2xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-[#0f141f] text-gray-500 text-[11px] uppercase border-b border-[#1b2332]">
                  <tr>
                    <th className="py-3 px-4">Enstrüman</th>
                    <th className="py-3 px-4">Kategori</th>
                    <th className="py-3 px-4 text-right">Alış (Bid)</th>
                    <th className="py-3 px-4 text-right">Satış (Ask)</th>
                    <th className="py-3 px-4 text-right">Spread</th>
                    <th className="py-3 px-4 text-center">Teknik Sinyal</th>
                    <th className="py-3 px-4 text-center">İşlem</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#161c28]">
                  {getSymbolsByCategory().map(sym => {
                    const sp = SYMBOL_SPECS[sym] || { name: sym, category: 'Indices', digits: 2, spread: 0.5, pipSize: 0.01, basePrice: 100 };
                    const p = currentPrices[sym] || { bid: sp.basePrice, ask: sp.basePrice + sp.spread, high: sp.basePrice * 1.005, low: sp.basePrice * 0.995 };
                    const spreadPips = (sp.spread / sp.pipSize).toFixed(1);
                    
                    // Sembole göre teknik sinyal belirleme (RSI & Trend bazlı)
                    const getSignal = (symbol: string) => {
                      if (symbol.includes('BOOM') || symbol.includes('BTC') || symbol === 'XAUUSDX') {
                        return { text: 'GÜÇLÜ AL', color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' };
                      }
                      if (symbol.includes('CRASH') || symbol === 'DXY.j') {
                        return { text: 'GÜÇLÜ SAT', color: 'bg-rose-500/20 text-rose-400 border-rose-500/30' };
                      }
                      if (symbol === 'EURUSD' || symbol.includes('NASDAQ')) {
                        return { text: 'AL', color: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30' };
                      }
                      return { text: 'NÖTR', color: 'bg-gray-500/20 text-gray-300 border-gray-500/30' };
                    };
                    const sig = getSignal(sym);

                    return (
                      <tr key={sym} className="hover:bg-[#121721] transition">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2.5">
                            <div className="w-7 h-7 rounded bg-[#161c28] border border-[#232c3d] flex items-center justify-center font-bold text-white text-[11px]">
                              {sym.slice(0, 3)}
                            </div>
                            <div>
                              <span className="font-bold text-white text-xs block">{sym}</span>
                              <span className="text-[10px] text-gray-400 font-sans block">{sp.name}</span>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-gray-400 font-sans">{sp.category}</td>
                        <td className="py-3 px-4 text-right font-bold text-blue-400">{p.bid.toFixed(sp.digits)}</td>
                        <td className="py-3 px-4 text-right font-bold text-rose-400">{p.ask.toFixed(sp.digits)}</td>
                        <td className="py-3 px-4 text-right text-gray-300 font-semibold">{spreadPips} pip</td>
                        <td className="py-3 px-4 text-center">
                          <span className={`inline-block px-2.5 py-0.5 rounded text-[10px] font-bold border ${sig.color}`}>
                            {sig.text}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <button
                            onClick={() => onOpenTerminal(sym)}
                            className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg text-xs transition active:scale-95 shadow"
                          >
                            Grafik & İşlem
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 5. HESAP TÜRLERİ MATRİSİ (EXNESS & IC MARKETS STANDARDI) */}
      {/* ========================================================================= */}
      <section id="accounts" className="py-16 px-4 lg:px-8 max-w-7xl mx-auto space-y-8">
        <div className="text-center space-y-2">
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-wide">
            Her Strateji İçin Optimize Edilmiş Hesap Tipleri
          </h2>
          <p className="text-xs text-gray-400 max-w-lg mx-auto">
            Gizli masraf yok, yeniden fiyatlama (requote) yok, doğrudan likidite havuzu erişimi.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          
          {/* ECN Raw Spread */}
          <div className="bg-[#0c1017] border border-[#1b2332] rounded-2xl p-5 space-y-4 flex flex-col justify-between hover:border-blue-500/50 transition">
            <div className="space-y-3">
              <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest block">ALGO & SCALP</span>
              <h3 className="text-lg font-bold text-white">ECN Raw Spread</h3>
              <div className="text-2xl font-black text-white font-mono">0.0 <span className="text-xs font-normal text-gray-400">pip&apos;ten</span></div>
              <ul className="text-xs text-gray-300 space-y-2 font-mono border-t border-[#182030] pt-3">
                <li>✓ Komisyon: $3.00 / Lot</li>
                <li>✓ Kaldıraç: 1:500</li>
                <li>✓ Stop Out: %50</li>
                <li>✓ ECN Doğrudan İcra</li>
              </ul>
            </div>
            <button onClick={() => onOpenTerminal()} className="w-full py-2.5 bg-[#161c28] hover:bg-[#20293a] text-white font-bold rounded-xl text-xs transition">
              Hesapla Başla
            </button>
          </div>

          {/* Pro Standart */}
          <div className="bg-[#0c1017] border-2 border-blue-500 rounded-2xl p-5 space-y-4 flex flex-col justify-between relative shadow-[0_0_25px_rgba(41,121,255,0.2)]">
            <span className="absolute -top-3 right-4 bg-blue-600 text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full">EN POPÜLER</span>
            <div className="space-y-3">
              <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest block">SIFIR KOMİSYON</span>
              <h3 className="text-lg font-bold text-white">Pro Standart</h3>
              <div className="text-2xl font-black text-white font-mono">0.7 <span className="text-xs font-normal text-gray-400">pip&apos;ten</span></div>
              <ul className="text-xs text-gray-300 space-y-2 font-mono border-t border-[#182030] pt-3">
                <li>✓ Sıfır Komisyon ($0)</li>
                <li>✓ Kaldıraç: 1:1000</li>
                <li>✓ Anında Para Yatırma</li>
                <li>✓ Mikro Lot (0.01)</li>
              </ul>
            </div>
            <button onClick={() => onOpenTerminal()} className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs transition shadow-lg">
              Hesapla Başla
            </button>
          </div>

          {/* 1:2000 Flash Scalp */}
          <div className="bg-[#0c1017] border border-[#1b2332] rounded-2xl p-5 space-y-4 flex flex-col justify-between hover:border-purple-500/50 transition">
            <div className="space-y-3">
              <span className="text-[10px] font-bold text-purple-400 uppercase tracking-widest block">MİKRO SERMAYE</span>
              <h3 className="text-lg font-bold text-white">1:2000 Flash Scalp</h3>
              <div className="text-2xl font-black text-purple-400 font-mono">1:2000 <span className="text-xs font-normal text-gray-400">Kaldıraç</span></div>
              <ul className="text-xs text-gray-300 space-y-2 font-mono border-t border-[#182030] pt-3">
                <li>✓ $5 ile Büyük Pozisyon</li>
                <li>✓ Kademeli Teminat Koruması</li>
                <li>✓ Hızlı Scalp Robotları</li>
                <li>✓ Sıfır Negatif Bakiye</li>
              </ul>
            </div>
            <button onClick={onOpenNextGen} className="w-full py-2.5 bg-[#161c28] hover:bg-[#20293a] text-white font-bold rounded-xl text-xs transition">
              Kaldıracı İncele
            </button>
          </div>

          {/* Prop Challenge */}
          <div className="bg-[#0c1017] border border-[#1b2332] rounded-2xl p-5 space-y-4 flex flex-col justify-between hover:border-yellow-500/50 transition">
            <div className="space-y-3">
              <span className="text-[10px] font-bold text-yellow-400 uppercase tracking-widest block">FON YÖNETİMİ</span>
              <h3 className="text-lg font-bold text-white">$100K Prop Fon</h3>
              <div className="text-2xl font-black text-yellow-400 font-mono">%80 <span className="text-xs font-normal text-gray-400">Kâr Payı</span></div>
              <ul className="text-xs text-gray-300 space-y-2 font-mono border-t border-[#182030] pt-3">
                <li>✓ Kendi Paranı Riske Atma</li>
                <li>✓ %10 Hedef Kâr</li>
                <li>✓ Max %5 Günlük Kayıp</li>
                <li>✓ İki Haftada Bir Ödeme</li>
              </ul>
            </div>
            <button onClick={onOpenNextGen} className="w-full py-2.5 bg-yellow-600/20 hover:bg-yellow-600/30 text-yellow-400 font-bold rounded-xl text-xs transition border border-yellow-500/40">
              Sınava Katıl
            </button>
          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 5.0. MONTE CARLO GRAND CASINO & YENİ NESİL OYUN SALONU */}
      {/* ========================================================================= */}
      <section className="py-14 bg-gradient-to-b from-[#06080d] via-[#120e06] to-[#06080d] border-t border-amber-900/40 px-4 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-amber-500/20 pb-5">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse"></span>
                <span className="text-[11px] font-bold text-amber-400 uppercase tracking-widest font-mono">
                  MONACO PRINCIPALITY STANDARDS • CANLI VEGAS LİGİ
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 via-amber-300 to-yellow-100 font-serif mt-1">
                🇲🇨 Casino de Monte-Carlo & VIP Oyun Salonu
              </h2>
              <p className="text-xs text-amber-200/70 max-w-2xl mt-1">
                Fildişi bilyeli Avrupa Ruleti, tek desteli VIP Blackjack 21, retro Çilek/Ananas slot makineleri ve 200x Rocket Crash! Matematiksel olasılık ve cesaretin buluştuğu yer.
              </p>
            </div>

            <div className="flex items-center gap-2.5 shrink-0">
              {onOpenTacticsGuide && (
                <button
                  onClick={onOpenTacticsGuide}
                  className="px-4 py-2.5 bg-gradient-to-r from-amber-950 via-yellow-900 to-amber-950 hover:opacity-90 border border-yellow-500/60 text-yellow-300 font-bold text-xs rounded-xl transition shadow-[0_0_20px_rgba(234,179,8,0.25)] flex items-center gap-1.5 active:scale-95"
                >
                  <span>⚡</span> VIP Taktik Manifestosu
                </button>
              )}
              {onOpenGrandCasino && (
                <button
                  onClick={onOpenGrandCasino}
                  className="px-5 py-2.5 bg-gradient-to-r from-amber-600 via-yellow-500 to-amber-700 hover:opacity-95 text-black font-black text-xs rounded-xl transition shadow-[0_0_25px_rgba(245,158,11,0.4)] border border-amber-300 flex items-center gap-1.5 active:scale-95 font-serif"
                >
                  <span>👑</span> Salona Giriş Yap
                </button>
              )}
            </div>
          </div>

          {/* 4 Ana Oyun Kartı */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            {/* 1. Monte Carlo Rulet */}
            <div className="bg-[#140e06]/80 border border-amber-500/30 hover:border-yellow-400 rounded-2xl p-5 space-y-3 flex flex-col justify-between transition-all hover:scale-[1.02] shadow-lg group">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-2xl">🎡</span>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">%97.30 RTP</span>
                </div>
                <h3 className="text-base font-black text-amber-200 font-serif">Avrupa Ruleti 3D</h3>
                <p className="text-[11px] text-gray-300 leading-relaxed">
                  Fransız Racetrack (Voisins, Tiers, Orphelins), fildişi top akustiği ve 36 katına kadar anlık kazanç.
                </p>
                <div className="text-[11px] font-mono text-amber-400/90 pt-1">
                  Strateji: <span className="text-yellow-200">Martingale & Çift Düzine</span>
                </div>
              </div>
              <div className="flex items-center gap-2 pt-2">
                {onOpenGrandCasino && (
                  <button
                    onClick={onOpenGrandCasino}
                    className="flex-1 py-2 bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-500 hover:to-yellow-500 text-black font-black rounded-xl text-xs transition shadow"
                  >
                    Masaya Otur
                  </button>
                )}
                {onOpenTacticsGuide && (
                  <button
                    onClick={onOpenTacticsGuide}
                    className="p-2 bg-amber-950/60 hover:bg-amber-900 border border-yellow-500/40 text-yellow-300 rounded-xl text-xs transition"
                    title="Rulet Taktikleri"
                  >
                    ⚡
                  </button>
                )}
              </div>
            </div>

            {/* 2. Monaco VIP Blackjack 21 */}
            <div className="bg-[#140e06]/80 border border-amber-500/30 hover:border-yellow-400 rounded-2xl p-5 space-y-3 flex flex-col justify-between transition-all hover:scale-[1.02] shadow-lg group">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-2xl">♠️</span>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/40">%99.50 RTP</span>
                </div>
                <h3 className="text-base font-black text-amber-200 font-serif">Monaco VIP Blackjack 21</h3>
                <p className="text-[11px] text-gray-300 leading-relaxed">
                  3:2 Doğal Blackjack ödemesi, Double Down, Split ve Krupiyenin 17&apos;de durduğu kurumsal masa.
                </p>
                <div className="text-[11px] font-mono text-amber-400/90 pt-1">
                  Strateji: <span className="text-yellow-200">MIT Matematik Tablosu</span>
                </div>
              </div>
              <div className="flex items-center gap-2 pt-2">
                {onOpenGrandCasino && (
                  <button
                    onClick={onOpenGrandCasino}
                    className="flex-1 py-2 bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-500 hover:to-yellow-500 text-black font-black rounded-xl text-xs transition shadow"
                  >
                    Dağıtımı Başlat
                  </button>
                )}
                {onOpenTacticsGuide && (
                  <button
                    onClick={onOpenTacticsGuide}
                    className="p-2 bg-amber-950/60 hover:bg-amber-900 border border-yellow-500/40 text-yellow-300 rounded-xl text-xs transition"
                    title="Blackjack Taktikleri"
                  >
                    ⚡
                  </button>
                )}
              </div>
            </div>

            {/* 3. Çilek & Ananas VIP Slots */}
            <div className="bg-[#140e06]/80 border border-amber-500/30 hover:border-yellow-400 rounded-2xl p-5 space-y-3 flex flex-col justify-between transition-all hover:scale-[1.02] shadow-lg group">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-2xl">🍓</span>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/40">500x JACKPOT</span>
                </div>
                <h3 className="text-base font-black text-amber-200 font-serif">Çilek & Ananas VIP Slot</h3>
                <p className="text-[11px] text-gray-300 leading-relaxed">
                  Retro mekanik makara fiziği, Golden Tension gerilim dönüşü, anında durdurma ve scatter ödülü.
                </p>
                <div className="text-[11px] font-mono text-amber-400/90 pt-1">
                  Strateji: <span className="text-yellow-200">Dinamik Bahis & Auto Limiti</span>
                </div>
              </div>
              <div className="flex items-center gap-2 pt-2">
                {onOpenCasinoSlot && (
                  <button
                    onClick={onOpenCasinoSlot}
                    className="flex-1 py-2 bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white font-black rounded-xl text-xs transition shadow"
                  >
                    Makarayı Çevir
                  </button>
                )}
                {onOpenTacticsGuide && (
                  <button
                    onClick={onOpenTacticsGuide}
                    className="p-2 bg-amber-950/60 hover:bg-amber-900 border border-yellow-500/40 text-yellow-300 rounded-xl text-xs transition"
                    title="Slot Taktikleri"
                  >
                    ⚡
                  </button>
                )}
              </div>
            </div>

            {/* 4. Nova Rocket Crash & Mines */}
            <div className="bg-[#140e06]/80 border border-amber-500/30 hover:border-yellow-400 rounded-2xl p-5 space-y-3 flex flex-col justify-between transition-all hover:scale-[1.02] shadow-lg group">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-2xl">🚀</span>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/40">200x ÇARPAN</span>
                </div>
                <h3 className="text-base font-black text-amber-200 font-serif">Rocket Crash & Elmas Madeni</h3>
                <p className="text-[11px] text-gray-300 leading-relaxed">
                  İbre yükseldikçe patlamadan önce nakde dön! Ya da 25 kutuda mayınları atlatıp elmasları topla.
                </p>
                <div className="text-[11px] font-mono text-amber-400/90 pt-1">
                  Strateji: <span className="text-yellow-200">1.30x Sabit Kasa Katlama</span>
                </div>
              </div>
              <div className="flex items-center gap-2 pt-2">
                {onOpenArcadeHub && (
                  <button
                    onClick={onOpenArcadeHub}
                    className="flex-1 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-black rounded-xl text-xs transition shadow"
                  >
                    Roketi Ateşle
                  </button>
                )}
                {onOpenTacticsGuide && (
                  <button
                    onClick={onOpenTacticsGuide}
                    className="p-2 bg-amber-950/60 hover:bg-amber-900 border border-yellow-500/40 text-yellow-300 rounded-xl text-xs transition"
                    title="Crash & Mines Taktikleri"
                  >
                    ⚡
                  </button>
                )}
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 5.1. CANLI ECN SPREAD & MALİYET AVANTAJI KARŞILAŞTIRMASI (IC MARKETS STANDARDI) */}
      {/* ========================================================================= */}
      <section className="py-12 bg-[#080b11] border-t border-[#182030] px-4 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="text-center space-y-2">
            <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest font-mono">DÜŞÜK MALİYET, YÜKSEK KAZANÇ</span>
            <h2 className="text-2xl sm:text-3xl font-black text-white">
              Neden Dünyanın En İyi Trader&apos;ları Bizi Seçiyor?
            </h2>
            <p className="text-xs text-gray-400 max-w-xl mx-auto">
              Perakende aracı kurumların aksine, emirlerinizi doğrudan 25+ Tier-1 banka havuzuna iletiyor, aradaki spread kâr marjını sıfırlıyoruz.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-5xl mx-auto">
            
            {/* Parite 1: EUR/USD */}
            <div className="bg-[#0c1017] border border-[#1b2332] rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-bold text-white text-sm">EUR / USD</span>
                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded font-bold">-%78 TASARRUF</span>
              </div>
              <div className="space-y-2 font-mono text-xs">
                <div className="flex justify-between items-center text-gray-400">
                  <span>Standart Banka / Broker:</span>
                  <span className="text-rose-400 line-through font-bold">1.4 Pip</span>
                </div>
                <div className="flex justify-between items-center text-white bg-blue-500/10 p-2 rounded-lg border border-blue-500/20">
                  <span className="text-blue-300 font-bold">Exbina Prime ECN:</span>
                  <span className="text-emerald-400 font-extrabold text-sm">0.0 Pip</span>
                </div>
              </div>
              <p className="text-[11px] text-gray-400 font-sans">10 Lot işlemde standart brokera göre işlem başına ortalama <strong>$140 kâr avantajı</strong>.</p>
            </div>

            {/* Parite 2: XAU/USD (Ons Altın) */}
            <div className="bg-[#0c1017] border border-blue-500/40 rounded-2xl p-5 space-y-4 shadow-[0_0_20px_rgba(41,121,255,0.15)]">
              <div className="flex items-center justify-between">
                <span className="font-bold text-white text-sm">XAU / USD (Altın)</span>
                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded font-bold">-%82 TASARRUF</span>
              </div>
              <div className="space-y-2 font-mono text-xs">
                <div className="flex justify-between items-center text-gray-400">
                  <span>Geleneksel FX Siteleri:</span>
                  <span className="text-rose-400 line-through font-bold">35 Cent ($0.35)</span>
                </div>
                <div className="flex justify-between items-center text-white bg-blue-500/10 p-2 rounded-lg border border-blue-500/20">
                  <span className="text-blue-300 font-bold">Exbina Prime ECN:</span>
                  <span className="text-emerald-400 font-extrabold text-sm">8 Cent ($0.08)</span>
                </div>
              </div>
              <p className="text-[11px] text-gray-400 font-sans">Scalper ve gün içi altın tüccarları için sıfır kayma (zero slippage) güvencesi.</p>
            </div>

            {/* Parite 3: Sentetik Boom & Crash */}
            <div className="bg-[#0c1017] border border-[#1b2332] rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-bold text-white text-sm">Boom 1000 / Crash 500</span>
                <span className="text-[10px] font-mono text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded font-bold">7/24 KESİNTİSİZ</span>
              </div>
              <div className="space-y-2 font-mono text-xs">
                <div className="flex justify-between items-center text-gray-400">
                  <span>Klasik Brokerlar:</span>
                  <span className="text-gray-500 font-bold">Hafta Sonu Kapalı</span>
                </div>
                <div className="flex justify-between items-center text-white bg-purple-500/10 p-2 rounded-lg border border-purple-500/20">
                  <span className="text-purple-300 font-bold">Sentetik Havuz:</span>
                  <span className="text-cyan-400 font-extrabold text-sm">Cumartesi/Pazar Açık</span>
                </div>
              </div>
              <p className="text-[11px] text-gray-400 font-sans">Hafta sonu dahil 365 gün kesintisiz patlama ve volatilite ticareti.</p>
            </div>

          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 5.2. ANINDA PARA YATIRMA VE ÇEKME KORİDORLARI (EXNESS STANDARDI) */}
      {/* ========================================================================= */}
      <section className="py-12 bg-[#06080d] border-t border-[#182030] px-4 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest font-mono">0 SANİYE OTOMASYON</span>
              <h2 className="text-2xl font-black text-white">
                Otomatik ve Kesintisiz Finansal Ağlar
              </h2>
              <p className="text-xs text-gray-400 mt-1">
                İnsan onayı beklemeden, bot doğrulamasıyla anında para yatırma ve 7/24 otomatik çekim.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={onOpenDeposit}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl transition shadow active:scale-95"
              >
                Hemen Para Yatır
              </button>
              <button
                onClick={onOpenWithdraw}
                className="px-4 py-2 bg-[#161c28] hover:bg-[#20293a] text-white font-bold text-xs rounded-xl transition border border-[#263348]"
              >
                Para Çekme Talebi
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {[
              { name: 'Tether USDT', net: 'TRC20 / ERC20', speed: 'Anında (0s)', fee: '%0 Komisyon', icon: '🟢' },
              { name: 'Banka FAST', net: 'Tüm TR Bankaları', speed: '< 2 Dakika', fee: 'Ücretsiz', icon: '🏦' },
              { name: 'Kredi Kartı', net: 'Visa / Mastercard', speed: 'Anında (3DS)', fee: '%0 Masraf', icon: '💳' },
              { name: 'Bitcoin (BTC)', net: 'Lightning / SegWit', speed: '1 Onay (~3 dk)', fee: 'Ağ Ücreti', icon: '₿' },
              { name: 'Papara & QR', net: 'Hızlı Transfer', speed: 'Anında', fee: 'Sıfır Kesinti', icon: '⚡' },
              { name: 'Binance Pay', net: 'UID / QR Kod', speed: 'Anında', fee: '%0 Komisyon', icon: '🟡' },
            ].map((method, mIdx) => (
              <div key={mIdx} className="bg-[#0b0e14] border border-[#192130] rounded-xl p-3.5 space-y-2 hover:border-blue-500/40 transition">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{method.icon}</span>
                  <div>
                    <span className="text-xs font-bold text-white block">{method.name}</span>
                    <span className="text-[10px] text-gray-500 font-mono block">{method.net}</span>
                  </div>
                </div>
                <div className="border-t border-[#141b27] pt-2 text-[11px] font-mono space-y-0.5">
                  <div className="text-emerald-400 font-semibold">{method.speed}</div>
                  <div className="text-gray-400 text-[10px]">{method.fee}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 6. TEKNOLOJİ & FON GÜVENLİĞİ BÖLÜMÜ */}
      {/* ========================================================================= */}
      <section id="technology" className="py-14 bg-[#090c12] border-t border-[#182030] px-4 lg:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          
          <div className="space-y-4">
            <span className="text-xs font-bold text-blue-400 uppercase font-mono tracking-wider">KURUMSAL ALTYAPI</span>
            <h2 className="text-2xl sm:text-3xl font-black text-white">
              Londra Equinix LD4 Veri Merkezine Doğrudan Optik Bağlantı
            </h2>
            <p className="text-xs sm:text-sm text-gray-300 leading-relaxed">
              Emirleriniz masaüstünüzden ya da telefonunuzdan çıktığı an, aracı sunucularda vakit kaybetmeden doğrudan Tier-1 likidite sağlayıcılarına (Barclays, J.P. Morgan, UBS) milisaniyeler içinde iletilir.
            </p>
            <div className="grid grid-cols-2 gap-3 pt-2 font-mono text-xs">
              <div className="border-l-2 border-emerald-500 pl-3">
                <span className="text-white font-bold block">12ms Ortalama İcra</span>
                <span className="text-gray-500 text-[11px]">Sıfır Slippage (Kayma)</span>
              </div>
              <div className="border-l-2 border-blue-500 pl-3">
                <span className="text-white font-bold block">%99.99 Uptime</span>
                <span className="text-gray-500 text-[11px]">Kesintisiz ECN Yayını</span>
              </div>
            </div>
          </div>

          <div id="security" className="bg-[#0c1017] border border-[#1b2332] rounded-2xl p-6 space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <span>🛡️</span> Müşteri Fon Güvenliği Standartları
            </h3>
            <div className="space-y-3 text-xs text-gray-300">
              <div className="flex items-start gap-2.5">
                <span className="text-emerald-400 text-sm">✓</span>
                <div>
                  <strong className="text-white block">Ayrılmış Müşteri Hesapları (Segregated Accounts):</strong>
                  Fonlarınız şirket sermayesinden tamamen ayrı tutularak Avrupa&apos;nın saygın Tier-1 bankalarında saklanır.
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="text-emerald-400 text-sm">✓</span>
                <div>
                  <strong className="text-white block">Negatif Bakiye Koruması:</strong>
                  Piyasadaki ani şoklarda veya flash crash durumunda hesabınız asla sıfırın altına düşmez.
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="text-emerald-400 text-sm">✓</span>
                <div>
                  <strong className="text-white block">256-Bit SSL ve Kriptografik Şifreleme:</strong>
                  Tüm para yatırma/çekme ve emir iletimleri bankacılık düzeyinde şifrelenir.
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 7. KURUMSAL FOOTER VE YASAL UYARI (REGULATORY FOOTER) */}
      {/* ========================================================================= */}
      <footer className="bg-[#05070a] border-t border-[#141a24] py-12 px-4 lg:px-8 text-xs text-gray-500">
        <div className="max-w-7xl mx-auto space-y-8">
          
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-[#141a24] pb-6">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded bg-blue-600 flex items-center justify-center font-bold text-white text-xs">
                ⚡
              </div>
              <span className="font-extrabold text-white text-sm tracking-wider">EXBINA PRIME ECN</span>
            </div>

            <div className="flex items-center gap-6 text-gray-400">
              <button onClick={() => onOpenTerminal()} className="hover:text-white transition">WebTrader</button>
              <button onClick={onOpenDeposit} className="hover:text-white transition">Para Yatır</button>
              <button onClick={onOpenWithdraw} className="hover:text-white transition">Para Çek</button>
              <Link href="/admin" className="hover:text-blue-400 transition">Dealer Masası</Link>
            </div>
          </div>

          {/* Yasal Risk Açıklaması */}
          <div className="space-y-2 text-[11px] leading-relaxed text-gray-500 font-sans">
            <p>
              <strong>Yasal Risk Uyarısı:</strong> Kaldıraçlı döviz (Forex) ve CFD (Fark Sözleşmeleri) işlemleri yüksek düzeyde risk içerir ve yatırdığınız tüm sermayeyi kaybetmenize yol açabilir. Bireysel yatırımcı hesaplarının %74-%89&apos;u CFD işlemi yaparken para kaybetmektedir. Bu tür finansal türev ürünlerin nasıl çalıştığını tam olarak anladığınızdan ve yüksek para kaybetme riskini göze alıp alamayacağınızdan emin olmalısınız.
            </p>
            <p>
              Exbina Prime Ltd., uluslararası finansal denetim standartlarına tabi olup ayrılmış müşteri hesapları (segregated accounts) politikasını katı bir şekilde uygulamaktadır.
            </p>
          </div>

          <div className="text-[10px] text-gray-600 flex flex-col sm:flex-row justify-between items-center gap-2 pt-4 border-t border-[#10141d]">
            <span>© 2026 Exbina Prime Ltd. Tüm hakları saklıdır.</span>
            <span>Equinix LD4 Server Connection • 0.01ms Latency SLA</span>
          </div>

        </div>
      </footer>

    </div>
  );
}
