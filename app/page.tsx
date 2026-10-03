'use client';

import React, { useState, useEffect } from 'react';
import { UserAccount, Position, TradingEngine, SYMBOL_SPECS, OrderSide, OrderType } from '@/lib/tradingEngine';
import { INITIAL_ACCOUNT, CURRENT_PRICES } from '@/lib/store';
import ProFXTerminal from '@/components/ProFXTerminal';
import GlobalFXPortal from '@/components/GlobalFXPortal';
import NextGenHubModal from '@/components/NextGenHubModal';
import MonteCarloSlotGame from '@/components/MonteCarloSlotGame';
import NextGenArcadeHubModal from '@/components/NextGenArcadeHubModal';
import MonteCarloGrandCasinoModal from '@/components/MonteCarloGrandCasinoModal';
import GameTacticsGuideModal from '@/components/GameTacticsGuideModal';
import AuthModal from '@/components/AuthModal';
import LiveTickerTape from '@/components/LiveTickerTape';
import { AuthStore, AuthUser } from '@/lib/authStore';
import Decimal from 'decimal.js';
import Link from 'next/link';
import { calculateNextPrice, updateScenarioConfig } from '@/lib/scenarioEngine';

export default function Home() {
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const u = AuthStore.getCurrentUser();
      setCurrentUser(u);
    }
  }, []);

  const [account, setAccount] = useState<UserAccount>(INITIAL_ACCOUNT);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('mt5_user_account');
      if (saved) {
        try { setAccount(JSON.parse(saved)); } catch (e) {}
      }
    }
  }, []);
  const [prices, setPrices] = useState(CURRENT_PRICES);

  // Ana Görünüm: 'portal' (Dünya Standardı Landing & Platform Tanıtımı) veya 'terminal' (Tam Ekran Canlı WebTrader)
  const [mainView, setMainView] = useState<'portal' | 'terminal'>('portal');
  const [selectedSymbolFromPortal, setSelectedSymbolFromPortal] = useState<string>('NASDAQ.j');

  // Yeni Nesil Kazanç Kapıları Modalı
  const [isNextGenOpen, setIsNextGenOpen] = useState(false);

  // Monte Carlo Çilek & Ananas Casino Slot Modalı
  const [isCasinoSlotOpen, setIsCasinoSlotOpen] = useState(false);

  // Yeni Nesil Mini Oyunlar (Crash, Mines, Plinko) Modalı
  const [isArcadeHubOpen, setIsArcadeHubOpen] = useState(false);

  // Monte Carlo Grand Casino (Avrupa Ruleti, VIP Blackjack, Baccarat) Modalı
  const [isGrandCasinoOpen, setIsGrandCasinoOpen] = useState(false);

  // VIP Kazanma Taktikleri & Oyun Rehberi Modalı
  const [isTacticsGuideOpen, setIsTacticsGuideOpen] = useState(false);

  // Slot Oyunu Bakiye Senkronizasyonu
  const handleUpdateCasinoBalance = (newBalance: number) => {
    setAccount(prev => {
      const updated = { ...prev, balance: newBalance };
      TradingEngine.updateAccountState(updated, prices);
      if (typeof window !== 'undefined') {
        localStorage.setItem('mt5_user_account', JSON.stringify(updated));
      }
      return updated;
    });
  };

  // Kurumsal Modallar
  const [activeModal, setActiveModal] = useState<'none' | 'deposit' | 'withdraw' | 'accounts' | 'calendar' | 'security'>('none');
  const [depositAmount, setDepositAmount] = useState('1000');
  const [depositMethod, setDepositMethod] = useState<'USDT' | 'HAVALE' | 'CARD'>('USDT');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawIban, setWithdrawIban] = useState('');

  // Admin senaryo ve hesap güncellemelerini dinleme
  useEffect(() => {
    const handleStorageChange = () => {
      const savedAcc = localStorage.getItem('mt5_user_account');
      if (savedAcc) {
        try { setAccount(JSON.parse(savedAcc)); } catch (e) {}
      }
      const savedConfig = localStorage.getItem('mt5_scenario_config');
      if (savedConfig) {
        try { updateScenarioConfig(JSON.parse(savedConfig)); } catch (e) {}
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Canlı Piyasa Fiyat Simülatörü ve Tick Akışı (Senaryo Motoru Destekli)
  useEffect(() => {
    const interval = setInterval(() => {
      setPrices((prev) => {
        const next = { ...prev };
        for (const [sym, cur] of Object.entries(prev)) {
          const spec = SYMBOL_SPECS[sym];
          if (!spec) continue;

          // Senaryo motoru ile gerçekçi fiyat hesabı (Her sembole özel davranış)
          const spreadPips = spec.spread / spec.pipSize;
          const nextTick = calculateNextPrice(cur.bid, spec.digits, spreadPips, sym);

          const newHigh = Math.max(cur.high, nextTick.ask);
          const newLow = Math.min(cur.low, nextTick.bid);

          next[sym] = {
            bid: nextTick.bid,
            ask: nextTick.ask,
            high: newHigh,
            low: newLow,
            time: new Date().toLocaleTimeString('tr-TR')
          };
        }
        
        if (typeof window !== 'undefined') {
          localStorage.setItem('mt5_live_prices', JSON.stringify(next));
        }
        return next;
      });
    }, 1100);

    return () => clearInterval(interval);
  }, []);

  // Fiyat değiştikçe açık pozisyonların kâr/zarar ve teminat durumunu güncelle
  useEffect(() => {
    setAccount((prev) => {
      const cloned: UserAccount = JSON.parse(JSON.stringify(prev));
      TradingEngine.updateAccountState(cloned, prices);

      // Stop-Out Kontrolü (Teminat Seviyesi %50 altına indiğinde tasfiye edilir)
      if (cloned.marginLevel !== null && cloned.marginLevel <= 50.0 && cloned.positions.length > 0) {
        const worstPos = [...cloned.positions].sort((a, b) => a.profit - b.profit)[0];
        if (worstPos) {
          cloned.positions = cloned.positions.filter(p => p.id !== worstPos.id);
          worstPos.status = 'closed';
          worstPos.closePrice = worstPos.currentPrice;
          worstPos.closeTime = new Date().toISOString().replace('T', ' ').substring(0, 19);
          worstPos.comment = 'Stop-Out [Margin < 50%]';
          cloned.history.unshift(worstPos);
          cloned.balance = new Decimal(cloned.balance).plus(worstPos.profit).toNumber();
          TradingEngine.updateAccountState(cloned, prices);
        }
      }

      return cloned;
    });
  }, [prices]);

  // Yeni Emir Açma
  const handlePlaceOrder = (params: {
    symbol: string;
    side: OrderSide;
    type: OrderType;
    lots: number;
    sl: number | null;
    tp: number | null;
    targetPrice?: number;
  }) => {
    const spec = SYMBOL_SPECS[params.symbol];
    if (!spec) return;

    const cur = prices[params.symbol] || { bid: spec.basePrice, ask: spec.basePrice + spec.spread };
    const execPrice = params.side === 'buy' ? cur.ask : cur.bid;

    // Gerekli teminat
    const requiredMargin = TradingEngine.calculateMargin(params.symbol, params.lots, execPrice, account.leverage);
    if (requiredMargin > account.freeMargin) {
      alert(`Yetersiz Teminat! Gerekli: $${requiredMargin.toFixed(2)}, Mevcut Serbest Teminat: $${account.freeMargin.toFixed(2)}`);
      return;
    }

    // Açılış komisyonu
    const commission = TradingEngine.calculateCommission(params.symbol, params.lots, false);

    const newTicket = Math.floor(9482100 + Math.random() * 9000);
    const newPosition: Position = {
      id: `pos-${Date.now()}`,
      ticket: newTicket,
      userId: account.id,
      symbol: params.symbol,
      side: params.side,
      lots: params.lots,
      openPrice: execPrice,
      openTime: new Date().toISOString().replace('T', ' ').substring(0, 19).replace(/-/g, '.'),
      closePrice: undefined,
      closeTime: undefined,
      sl: params.sl,
      tp: params.tp,
      currentPrice: execPrice,
      profit: 0,
      commission,
      swap: 0,
      status: 'open',
      comment: 'ProWeb-Execution'
    };

    setAccount((prev) => {
      const cloned: UserAccount = JSON.parse(JSON.stringify(prev));
      cloned.positions.unshift(newPosition);
      TradingEngine.updateAccountState(cloned, prices);
      return cloned;
    });
  };

  // Pozisyonu Tam Kapatma
  const handleCloseFull = (id: string) => {
    setAccount((prev) => {
      const cloned: UserAccount = JSON.parse(JSON.stringify(prev));
      const pos = cloned.positions.find(p => p.id === id);
      if (!pos) return prev;

      cloned.positions = cloned.positions.filter(p => p.id !== id);
      pos.status = 'closed';
      pos.closePrice = pos.currentPrice;
      pos.closeTime = new Date().toISOString().replace('T', ' ').substring(0, 19).replace(/-/g, '.');
      cloned.history.unshift(pos);
      cloned.balance = new Decimal(cloned.balance).plus(pos.profit).plus(pos.commission).toNumber();

      TradingEngine.updateAccountState(cloned, prices);
      return cloned;
    });
  };

  // Kısmi Kapatma
  const handleClosePartial = (id: string, lots: number) => {
    setAccount((prev) => {
      const cloned: UserAccount = JSON.parse(JSON.stringify(prev));
      const pos = cloned.positions.find(p => p.id === id);
      if (!pos || lots >= pos.lots) return prev;

      const remainingLots = new Decimal(pos.lots).minus(lots).toNumber();
      const closedProfit = new Decimal(pos.profit).times(lots).dividedBy(pos.lots).toNumber();

      const closedRecord: Position = {
        ...pos,
        id: `pos-${Date.now()}`,
        ticket: Math.floor(9482100 + Math.random() * 9000),
        lots,
        closePrice: pos.currentPrice,
        closeTime: new Date().toISOString().replace('T', ' ').substring(0, 19).replace(/-/g, '.'),
        profit: closedProfit,
        status: 'closed',
        comment: `Close #${pos.ticket} part ${lots}`
      };

      pos.lots = remainingLots;
      pos.profit = new Decimal(pos.profit).minus(closedProfit).toNumber();

      cloned.history.unshift(closedRecord);
      cloned.balance = new Decimal(cloned.balance).plus(closedProfit).toNumber();

      TradingEngine.updateAccountState(cloned, prices);
      return cloned;
    });
  };

  // SL / TP Güncelleme
  const handleUpdateSLTP = (id: string, sl: number | null, tp: number | null) => {
    setAccount((prev) => {
      const cloned: UserAccount = JSON.parse(JSON.stringify(prev));
      const pos = cloned.positions.find(p => p.id === id);
      if (pos) {
        pos.sl = sl;
        pos.tp = tp;
      }
      return cloned;
    });
  };

  // Para Yatırma
  const handleDeposit = (amount: number) => {
    // Admin Finans Kuyruğuna Bildir
    AuthStore.addFinancialRequest({
      userId: currentUser?.id || account.id,
      userEmail: currentUser?.email || 'trader@fxpro.com',
      type: 'deposit',
      amount,
      method: depositMethod,
      details: `${depositMethod} Hızlı Yatırım`
    });

    setAccount((prev) => {
      const cloned: UserAccount = JSON.parse(JSON.stringify(prev));
      cloned.balance = new Decimal(cloned.balance).plus(amount).toNumber();
      cloned.ledger.unshift({
        id: `led-${Date.now()}`,
        time: new Date().toISOString().replace('T', ' ').substring(0, 19).replace(/-/g, '.'),
        type: 'deposit',
        amount,
        description: `Deposit (${depositMethod} +$${amount.toFixed(2)})`
      });
      TradingEngine.updateAccountState(cloned, prices);
      return cloned;
    });
    setActiveModal('none');
  };

  // Para Çekme
  const handleWithdrawal = () => {
    const val = parseFloat(withdrawAmount);
    if (isNaN(val) || val <= 0) return;
    if (val > account.freeMargin) {
      alert(`Yetersiz serbest bakiye! Maksimum çekilebilir: $${account.freeMargin.toFixed(2)}`);
      return;
    }

    // Admin Finans Masasına Çekim Bildirimi
    AuthStore.addFinancialRequest({
      userId: currentUser?.id || account.id,
      userEmail: currentUser?.email || 'trader@fxpro.com',
      type: 'withdraw',
      amount: val,
      method: withdrawIban ? 'Banka Transferi' : 'USDT TRC20',
      details: withdrawIban || 'TRC20 Kripto Cüzdanı'
    });

    setAccount((prev) => {
      const cloned: UserAccount = JSON.parse(JSON.stringify(prev));
      cloned.balance = new Decimal(cloned.balance).minus(val).toNumber();
      cloned.ledger.unshift({
        id: `led-${Date.now()}`,
        time: new Date().toISOString().replace('T', ' ').substring(0, 19).replace(/-/g, '.'),
        type: 'withdrawal',
        amount: -val,
        description: `Çekim Talebi (${withdrawIban || 'USDT TRC20'})`
      });
      TradingEngine.updateAccountState(cloned, prices);
      return cloned;
    });
    setWithdrawAmount('');
    setActiveModal('none');
  };

  // Kaldıraç Değiştirme
  const handleChangeLeverage = (leverage: number) => {
    setAccount((prev) => {
      const cloned: UserAccount = JSON.parse(JSON.stringify(prev));
      cloned.leverage = leverage;
      TradingEngine.updateAccountState(cloned, prices);
      return cloned;
    });
  };

  // Hesap durumunu localStorage'a senkronize et
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('mt5_user_account', JSON.stringify(account));
    }
  }, [account]);

  return (
    <div className="w-full min-h-screen bg-[#06080d] relative text-[#c9d1d9] font-sans">
      
      {/* ÜST GEÇİŞ ÇUBUĞU (YALNIZCA TERMINALDE GÖRÜNÜR - PORTALDAKİ MÜKERRER BAŞLIKLARI ENGELLER) */}
      {mainView === 'terminal' && (
        <div className="bg-[#0b0e14] border-b border-[#1c2230] px-3 sm:px-6 py-1.5 flex items-center justify-between text-xs z-50">
          <div className="flex items-center gap-3">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="font-mono text-gray-400 text-[11px] hidden sm:inline">FxPro GLOBAL</span>

            {/* Görünüm Değiştirici */}
            <div className="flex items-center bg-[#141a24] p-0.5 rounded border border-[#232c3d]">
              <button
                onClick={() => setMainView('portal')}
                className="px-2.5 py-1 rounded text-[11px] font-semibold transition text-gray-400 hover:text-white"
              >
                🏛️ Kurumsal Portal
              </button>
              <button
                onClick={() => setMainView('terminal')}
                className="px-2.5 py-1 rounded text-[11px] font-semibold transition bg-blue-600 text-white font-bold"
              >
                💻 Canlı WebTrader
              </button>
            </div>

          </div>

          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-3 font-mono text-[11px] bg-[#121722] px-3 py-1 rounded border border-[#1e2637]">
              <span className="text-gray-400">Bakiye:</span>
              <span className="font-bold text-emerald-400">${account.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
              <span className="text-gray-600">|</span>
              <span className="text-gray-400">Serbest:</span>
              <span className="font-bold text-cyan-400">${account.freeMargin.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
            </div>

            <button 
              onClick={() => setIsAuthModalOpen(true)}
              className="bg-[#121824] hover:bg-[#1a2335] border border-[#232c3d] text-gray-200 hover:text-white px-2.5 py-1 rounded text-[11px] transition flex items-center gap-1.5 font-mono"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              <span>{currentUser ? currentUser.name.split(' ')[0] : 'Giriş Yap'}</span>
            </button>

            <button 
              onClick={() => setActiveModal('deposit')}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-3 py-1 rounded transition text-[11px] shadow flex items-center gap-1"
            >
              <span>+</span> Para Yatır
            </button>

            <Link
              href="/admin"
              className="bg-[#18202d] hover:bg-[#222c3d] border border-blue-500/30 text-blue-400 px-2.5 py-1 rounded text-[11px] transition hidden sm:flex items-center gap-1 font-mono font-medium"
            >
              <span>⚙️</span> Dealer
            </Link>
          </div>
        </div>
      )}


      {/* ANA İÇERİK: GLOBAL FX PORTALI VEYA CANLI PRO WEBTRADER */}
      {mainView === 'portal' ? (
        <GlobalFXPortal
          account={account}
          currentPrices={prices}
          onOpenTerminal={(sym) => {
            if (sym) setSelectedSymbolFromPortal(sym);
            setMainView('terminal');
          }}
          onOpenDeposit={() => setActiveModal('deposit')}
          onOpenWithdraw={() => setActiveModal('withdraw')}
          onOpenNextGen={() => setIsNextGenOpen(true)}
          onOpenCasinoSlot={() => setIsCasinoSlotOpen(true)}
          onOpenArcadeHub={() => setIsArcadeHubOpen(true)}
          onOpenGrandCasino={() => setIsCasinoSlotOpen(true)}
          onOpenTacticsGuide={() => setIsTacticsGuideOpen(true)}
          currentUser={currentUser}
          onOpenAuth={() => setIsAuthModalOpen(true)}
        />
      ) : (
        <div className="w-full h-[calc(100vh-37px)] flex flex-col overflow-hidden">
          <LiveTickerTape 
            currentPrices={prices} 
            onSelectSymbol={(sym) => setSelectedSymbolFromPortal(sym)} 
          />
          <div className="flex-1 overflow-hidden">
            <ProFXTerminal
              account={account}
              currentPrices={prices}
              onPlaceOrder={handlePlaceOrder}
              onCloseFull={handleCloseFull}
              onClosePartial={handleClosePartial}
              onUpdateSLTP={handleUpdateSLTP}
              onDeposit={handleDeposit}
              onChangeLeverage={handleChangeLeverage}
              onOpenModal={(m) => setActiveModal(m)}
              onOpenNextGenHub={() => setIsNextGenOpen(true)}
              onOpenCasinoSlot={() => setIsCasinoSlotOpen(true)}
              onOpenArcadeHub={() => setIsArcadeHubOpen(true)}
              onOpenGrandCasino={() => setIsCasinoSlotOpen(true)}
              onBackToPortal={() => setMainView('portal')}
            />
          </div>
        </div>
      )}

      {/* ================= MODALLER ================= */}

      {/* 1. PARA YATIRMA MODALI */}
      {activeModal === 'deposit' && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#121721] border border-[#1c2433] rounded-xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-[#1c2433] pb-3">
              <h3 className="font-bold text-base text-white flex items-center gap-2">
                <span>💳</span> Hızlı Para Yatırma (Instant Deposit)
              </h3>
              <button onClick={() => setActiveModal('none')} className="text-gray-400 hover:text-white">✕</button>
            </div>

            <div className="grid grid-cols-3 gap-2 text-xs font-semibold">
              <button 
                onClick={() => setDepositMethod('USDT')}
                className={`py-2 rounded border text-center transition ${depositMethod === 'USDT' ? 'bg-blue-600 text-white border-blue-500' : 'bg-[#18202d] text-gray-400 border-[#222c3d]'}`}
              >
                USDT (TRC20)
              </button>
              <button 
                onClick={() => setDepositMethod('HAVALE')}
                className={`py-2 rounded border text-center transition ${depositMethod === 'HAVALE' ? 'bg-blue-600 text-white border-blue-500' : 'bg-[#18202d] text-gray-400 border-[#222c3d]'}`}
              >
                Banka Havalesi
              </button>
              <button 
                onClick={() => setDepositMethod('CARD')}
                className={`py-2 rounded border text-center transition ${depositMethod === 'CARD' ? 'bg-blue-600 text-white border-blue-500' : 'bg-[#18202d] text-gray-400 border-[#222c3d]'}`}
              >
                Kredi Kartı
              </button>
            </div>

            <div className="space-y-1">
              <label className="text-xs text-gray-400">Tutar (USD):</label>
              <div className="grid grid-cols-4 gap-2">
                {['500', '1000', '2500', '5000'].map(val => (
                  <button
                    key={val}
                    onClick={() => setDepositAmount(val)}
                    className={`py-1.5 text-xs font-mono font-bold rounded border ${depositAmount === val ? 'bg-emerald-600/30 text-emerald-400 border-emerald-500' : 'bg-[#18202d] text-gray-300 border-[#222c3d]'}`}
                  >
                    ${val}
                  </button>
                ))}
              </div>
              <input 
                type="number"
                value={depositAmount}
                onChange={(e) => setDepositAmount(e.target.value)}
                className="w-full bg-[#18202d] border border-[#222c3d] rounded p-2 text-white font-mono text-sm mt-2"
                placeholder="Özel Tutar"
              />
            </div>

            {depositMethod === 'USDT' && (
              <div className="p-3 bg-[#0a0d14] rounded-lg border border-[#1c2433] space-y-2 text-xs font-mono">
                <span className="text-gray-400 block font-sans">USDT TRC20 Cüzdan Adresi:</span>
                <div className="bg-[#141a24] p-2 rounded text-[11px] text-emerald-400 break-all select-all border border-[#232c3d]">
                  TYx7B4kM89qLkP2Wj9NmQ3bRtZ8VvKpE5A
                </div>
              </div>
            )}

            <button
              onClick={() => handleDeposit(parseFloat(depositAmount) || 1000)}
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded text-xs transition shadow-lg"
            >
              Yatırımı Onayla (+${depositAmount} USD)
            </button>
          </div>
        </div>
      )}

      {/* 2. PARA ÇEKME MODALI */}
      {activeModal === 'withdraw' && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#121721] border border-[#1c2433] rounded-xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-[#1c2433] pb-3">
              <h3 className="font-bold text-base text-white flex items-center gap-2">
                <span>💸</span> Para Çekme Talebi (Withdrawal)
              </h3>
              <button onClick={() => setActiveModal('none')} className="text-gray-400 hover:text-white">✕</button>
            </div>

            <div className="bg-[#18202d] p-3 rounded-lg border border-[#222c3d] text-xs font-mono space-y-1">
              <div className="flex justify-between">
                <span className="text-gray-400">Toplam Bakiye:</span>
                <span className="font-bold text-white">${account.balance.toFixed(2)} USD</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Çekilebilir Serbest Teminat:</span>
                <span className="font-bold text-emerald-400">${account.freeMargin.toFixed(2)} USD</span>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs text-gray-400">Çekmek İstediğiniz Tutar (USD):</label>
              <input 
                type="number"
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(e.target.value)}
                placeholder="Örn. 500"
                className="w-full bg-[#18202d] border border-[#222c3d] rounded p-2 text-white font-mono text-sm focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs text-gray-400">IBAN veya USDT (TRC20) Adresi:</label>
              <input 
                type="text"
                value={withdrawIban}
                onChange={(e) => setWithdrawIban(e.target.value)}
                placeholder="TR00 0000 0000 ... veya TYx7B4..."
                className="w-full bg-[#18202d] border border-[#222c3d] rounded p-2 text-white font-mono text-xs focus:outline-none focus:border-blue-500"
              />
            </div>

            <button
              onClick={handleWithdrawal}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded text-xs transition shadow-lg"
            >
              Çekim Talebi Gönder
            </button>
          </div>
        </div>
      )}

      {/* 3. YENİ NESİL KAZANÇ KAPILARI MODALI */}
      <NextGenHubModal
        isOpen={isNextGenOpen}
        onClose={() => setIsNextGenOpen(false)}
        account={account}
        onSelectSymbol={(sym) => {
          setSelectedSymbolFromPortal(sym);
          setMainView('terminal');
        }}
        onChangeLeverage={handleChangeLeverage}
        onPlaceOrder={handlePlaceOrder}
        onDeposit={handleDeposit}
      />

      {/* 4. MONTE CARLO ÇİLEK & ANANAS VIP SLOTS OYUNU */}
      {isCasinoSlotOpen && (
        <MonteCarloSlotGame
          account={account}
          onUpdateBalance={handleUpdateCasinoBalance}
          onClose={() => setIsCasinoSlotOpen(false)}
          onBackToMonteCarlo={() => {
            setIsCasinoSlotOpen(false);
            setIsGrandCasinoOpen(true);
          }}
          onOpenTacticsGuide={() => {
            setIsCasinoSlotOpen(false);
            setIsTacticsGuideOpen(true);
          }}
        />
      )}

      {/* 5. NOVA ARCADE: YENİ NESİL MOBİL MİNİ OYUNLAR (CRASH, MINES, PLINKO) */}
      <NextGenArcadeHubModal
        isOpen={isArcadeHubOpen}
        onClose={() => setIsArcadeHubOpen(false)}
        onBackToMonteCarlo={() => {
          setIsArcadeHubOpen(false);
          setIsGrandCasinoOpen(true);
        }}
        account={account}
        onUpdateBalance={handleUpdateCasinoBalance}
        onOpenSlotGame={() => setIsCasinoSlotOpen(true)}
      />

      {/* 6. MONTE CARLO GRAND CASINO (AVRUPA RULETİ, MONACO BLACKJACK 21, BACCARAT) */}
      <MonteCarloGrandCasinoModal
        isOpen={isGrandCasinoOpen}
        onClose={() => setIsGrandCasinoOpen(false)}
        userBalance={account.balance}
        onUpdateBalance={handleUpdateCasinoBalance}
        onOpenSlots={() => setIsCasinoSlotOpen(true)}
        onOpenArcade={() => setIsArcadeHubOpen(true)}
        onOpenTacticsGuide={() => {
          setIsGrandCasinoOpen(false);
          setIsTacticsGuideOpen(true);
        }}
      />

      {/* 7. VIP KAZANMA MANİFESTOSU VE OYUN TAKTİKLERİ REHBERİ */}
      <GameTacticsGuideModal
        isOpen={isTacticsGuideOpen}
        onClose={() => setIsTacticsGuideOpen(false)}
        onOpenRoulette={() => {
          setIsTacticsGuideOpen(false);
          setIsGrandCasinoOpen(true);
        }}
        onOpenBlackjack={() => {
          setIsTacticsGuideOpen(false);
          setIsGrandCasinoOpen(true);
        }}
        onOpenSlots={() => {
          setIsTacticsGuideOpen(false);
          setIsCasinoSlotOpen(true);
        }}
        onOpenCrash={() => {
          setIsTacticsGuideOpen(false);
          setIsArcadeHubOpen(true);
        }}
        onOpenMines={() => {
          setIsTacticsGuideOpen(false);
          setIsArcadeHubOpen(true);
        }}
      />

      {/* 8. KULLANICI DOSTU HIZLI ÜYELİK VE GİRİŞ MODALI */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={(user) => {
          setCurrentUser(user);
          setAccount(prev => ({
            ...prev,
            id: user.id,
            balance: user.balance,
            credit: user.credit,
            leverage: user.leverage
          }));
        }}
      />

    </div>
  );
}
