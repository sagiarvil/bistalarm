// components/MonteCarloGrandCasinoModal.tsx
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  spinEuropeanRoulette, 
  RouletteBet, 
  RouletteBetType, 
  RouletteSpinResult,
  RED_NUMBERS,
  BLACK_NUMBERS,
  ROULETTE_NUMBERS,
  createDeckShoe,
  calculateHandValue,
  PlayingCard,
  playBaccaratRound,
  BaccaratBet,
  BaccaratRoundResult
} from '@/lib/monteCarloGrandKernel';

interface MonteCarloGrandCasinoModalProps {
  isOpen: boolean;
  onClose: () => void;
  userBalance: number;
  onUpdateBalance: (newBalance: number) => void;
}

type CasinoTab = 'ROULETTE' | 'BLACKJACK' | 'BACCARAT';

export default function MonteCarloGrandCasinoModal({
  isOpen,
  onClose,
  userBalance,
  onUpdateBalance
}: MonteCarloGrandCasinoModalProps) {
  const [activeTab, setActiveTab] = useState<CasinoTab>('ROULETTE');
  const [selectedChip, setSelectedChip] = useState<number>(25);

  // Web Audio Context
  const audioCtxRef = useRef<AudioContext | null>(null);

  const initAudio = () => {
    if (!audioCtxRef.current && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) audioCtxRef.current = new AudioCtx();
    }
  };

  const playTone = (freq: number, type: OscillatorType = 'sine', duration = 0.15) => {
    try {
      initAudio();
      if (!audioCtxRef.current) return;
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') ctx.resume();

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch (e) {}
  };

  const playChipSound = () => {
    playTone(1200, 'triangle', 0.05);
    setTimeout(() => playTone(1600, 'triangle', 0.04), 40);
  };

  const playWinFanfare = () => {
    playTone(523.25, 'triangle', 0.15); // C5
    setTimeout(() => playTone(659.25, 'triangle', 0.15), 100); // E5
    setTimeout(() => playTone(783.99, 'triangle', 0.25), 200); // G5
    setTimeout(() => playTone(1046.50, 'triangle', 0.4), 320); // C6
  };

  // --------------------------------------------------------------------------
  // 1. RULET DURUMLARI (EUROPEAN ROULETTE)
  // --------------------------------------------------------------------------
  const [rouletteBets, setRouletteBets] = useState<RouletteBet[]>([]);
  const [isSpinningRoulette, setIsSpinningRoulette] = useState(false);
  const [rouletteLastResult, setRouletteLastResult] = useState<RouletteSpinResult | null>(null);
  const [rouletteWheelRotation, setRouletteWheelRotation] = useState(0);
  const [rouletteBallRotation, setRouletteBallRotation] = useState(0);
  const [recentRouletteNumbers, setRecentRouletteNumbers] = useState<number[]>([14, 31, 9, 22, 18, 29, 7]);

  const addRouletteBet = (type: RouletteBetType, target?: number) => {
    playChipSound();
    if (userBalance < selectedChip) return;

    setRouletteBets(prev => {
      const existing = prev.find(b => b.type === type && b.target === target);
      if (existing) {
        return prev.map(b => b === existing ? { ...b, amount: b.amount + selectedChip } : b);
      }
      return [...prev, { type, target, amount: selectedChip }];
    });
  };

  const clearRouletteBets = () => {
    playChipSound();
    setRouletteBets([]);
  };

  const handleSpinRoulette = () => {
    if (rouletteBets.length === 0 || isSpinningRoulette) return;
    const totalBet = rouletteBets.reduce((acc, b) => acc + b.amount, 0);
    if (userBalance < totalBet) return;

    // Bakiyeden düş
    onUpdateBalance(userBalance - totalBet);
    setIsSpinningRoulette(true);
    setRouletteLastResult(null);

    // Çark animasyonu
    const extraRotations = 1800 + Math.random() * 360;
    setRouletteWheelRotation(prev => prev + extraRotations);
    setRouletteBallRotation(prev => prev - (2160 + Math.random() * 360));

    // Ses efekti
    let tickCount = 0;
    const tickInterval = setInterval(() => {
      playTone(400 + Math.random() * 300, 'sine', 0.03);
      tickCount++;
      if (tickCount > 18) clearInterval(tickInterval);
    }, 120);

    setTimeout(() => {
      const res = spinEuropeanRoulette(rouletteBets);
      setRouletteLastResult(res);
      setRecentRouletteNumbers(prev => [res.winningNumber, ...prev.slice(0, 9)]);
      setIsSpinningRoulette(false);

      if (res.totalPayout > 0) {
        onUpdateBalance(userBalance - totalBet + res.totalPayout);
        playWinFanfare();
      }
    }, 2800);
  };

  // --------------------------------------------------------------------------
  // 2. BLACKJACK DURUMLARI (VIP 21)
  // --------------------------------------------------------------------------
  const [bjShoe, setBjShoe] = useState<PlayingCard[]>([]);
  const [bjPlayerCards, setBjPlayerCards] = useState<PlayingCard[]>([]);
  const [bjDealerCards, setBjDealerCards] = useState<PlayingCard[]>([]);
  const [bjBet, setBjBet] = useState<number>(50);
  const [bjGameStage, setBjGameStage] = useState<'BETTING' | 'PLAYER_TURN' | 'ROUND_OVER'>('BETTING');
  const [bjMessage, setBjMessage] = useState<string>('Bahsinizi belirleyin ve Deal butonuna basın.');

  const startBlackjackRound = () => {
    if (userBalance < bjBet || bjGameStage === 'PLAYER_TURN') return;
    playChipSound();
    onUpdateBalance(userBalance - bjBet);

    let shoe = bjShoe;
    if (shoe.length < 20) shoe = createDeckShoe(6);

    const p1 = shoe.pop()!;
    const d1 = shoe.pop()!;
    const p2 = shoe.pop()!;
    const d2 = shoe.pop()!;

    const initialPlayer = [p1, p2];
    const initialDealer = [d1, d2];

    setBjShoe([...shoe]);
    setBjPlayerCards(initialPlayer);
    setBjDealerCards([d1]); // Krupiyenin 2. kartı gizli

    const pVal = calculateHandValue(initialPlayer);
    const dVal = calculateHandValue(initialDealer);

    if (pVal.isBlackjack) {
      setBjDealerCards(initialDealer);
      if (dVal.isBlackjack) {
        setBjMessage('🤝 Berabere (Push)! İki tarafta da Blackjack var.');
        onUpdateBalance(userBalance); // İade
      } else {
        setBjMessage('🔥 BLACKJACK! 3:2 Oranında Kazandınız!');
        onUpdateBalance(userBalance - bjBet + (bjBet * 2.5));
        playWinFanfare();
      }
      setBjGameStage('ROUND_OVER');
    } else {
      setBjGameStage('PLAYER_TURN');
      setBjMessage('Sıra Sizde: Kart çekin (Hit) veya Durun (Stand).');
    }
  };

  const handleBjHit = () => {
    if (bjGameStage !== 'PLAYER_TURN') return;
    playTone(600, 'sine', 0.05);

    const shoe = [...bjShoe];
    const card = shoe.pop()!;
    const newCards = [...bjPlayerCards, card];
    setBjShoe(shoe);
    setBjPlayerCards(newCards);

    const val = calculateHandValue(newCards);
    if (val.isBust) {
      setBjMessage('💥 BUST! 21\'i aştınız, kasa kazandı.');
      setBjGameStage('ROUND_OVER');
    }
  };

  const handleBjStand = () => {
    if (bjGameStage !== 'PLAYER_TURN') return;
    playTone(500, 'sine', 0.05);

    // Krupiye kartlarını aç
    const shoe = [...bjShoe];
    let dealer = [...bjDealerCards];

    // Eksik 2. kartı tamamla
    if (dealer.length === 1) {
      dealer.push(shoe.pop()!);
    }

    // Krupiye kuralı: 17 ve üstüne kadar kart çeker
    while (calculateHandValue(dealer).total < 17) {
      dealer.push(shoe.pop()!);
    }

    setBjDealerCards(dealer);
    setBjShoe(shoe);

    const pVal = calculateHandValue(bjPlayerCards);
    const dVal = calculateHandValue(dealer);

    if (dVal.isBust) {
      setBjMessage('🎉 Krupiye Battı! Kazandınız (1:1).');
      onUpdateBalance(userBalance + (bjBet * 2));
      playWinFanfare();
    } else if (pVal.total > dVal.total) {
      setBjMessage(`🎉 Kazandınız! (${pVal.total} vs ${dVal.total})`);
      onUpdateBalance(userBalance + (bjBet * 2));
      playWinFanfare();
    } else if (dVal.total > pVal.total) {
      setBjMessage(`❌ Kasa Kazandı! (${dVal.total} vs ${pVal.total})`);
    } else {
      setBjMessage(`🤝 Berabere (Push)! (${pVal.total} vs ${dVal.total})`);
      onUpdateBalance(userBalance); // Bahis iadesi
    }

    setBjGameStage('ROUND_OVER');
  };

  // --------------------------------------------------------------------------
  // 3. BACCARAT DURUMLARI (HIGH ROLLER PUNTO BANCO)
  // --------------------------------------------------------------------------
  const [bacShoe, setBacShoe] = useState<PlayingCard[]>([]);
  const [bacBetSide, setBacBetSide] = useState<BaccaratBet>('PLAYER');
  const [bacBetAmount, setBacBetAmount] = useState<number>(50);
  const [bacResult, setBacResult] = useState<BaccaratRoundResult | null>(null);
  const [isBacDealing, setIsBacDealing] = useState(false);
  const [bacRoadmap, setBacRoadmap] = useState<('P' | 'B' | 'T')[]>(['P', 'B', 'B', 'P', 'T', 'B']);

  const handlePlayBaccarat = () => {
    if (userBalance < bacBetAmount || isBacDealing) return;
    playChipSound();
    onUpdateBalance(userBalance - bacBetAmount);
    setIsBacDealing(true);
    setBacResult(null);

    setTimeout(() => {
      let shoe = bacShoe;
      if (shoe.length < 15) shoe = createDeckShoe(6);

      const res = playBaccaratRound(shoe);
      setBacShoe(shoe);
      setBacResult(res);
      setBacRoadmap(prev => [...prev.slice(-9), res.winner === 'PLAYER' ? 'P' : res.winner === 'BANKER' ? 'B' : 'T']);
      setIsBacDealing(false);

      if (res.winner === bacBetSide) {
        const win = bacBetAmount * res.payoutMultiplier;
        onUpdateBalance(userBalance - bacBetAmount + win);
        playWinFanfare();
      }
    }, 1200);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-2 sm:p-4 overflow-y-auto animate-fadeIn">
      <div className="relative w-full max-w-5xl bg-gradient-to-b from-[#0a1f14] via-[#06170e] to-[#030d08] border-2 border-amber-500/60 rounded-3xl shadow-[0_0_50px_rgba(212,175,55,0.25)] overflow-hidden flex flex-col my-auto text-white">
        
        {/* Üst Bar: Monte Carlo Salle Garnier Başlığı */}
        <div className="bg-gradient-to-r from-[#170e06] via-[#241708] to-[#170e06] border-b border-amber-500/40 p-4 sm:p-5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="text-3xl filter drop-shadow">🇲🇨</span>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg sm:text-xl font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-400 to-amber-100 font-serif">
                  CASINO DE MONTE-CARLO
                </h1>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 uppercase tracking-widest font-mono">
                  Salle Garnier VIP
                </span>
              </div>
              <p className="text-xs text-amber-300/70 font-sans">
                Provably Fair SHA-256 • Avrupa Ruleti, Monaco Blackjack 21 & High Roller Baccarat
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="bg-[#0b2416] border border-emerald-500/40 px-4 py-2 rounded-xl text-right font-mono">
              <span className="text-[10px] text-emerald-400/80 block uppercase tracking-wider">VIP Bakiye</span>
              <span className="text-lg font-black text-emerald-300">
                ${userBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>

            <button 
              onClick={onClose}
              className="w-10 h-10 rounded-full bg-[#1b2f22] hover:bg-rose-900/60 border border-amber-500/30 text-gray-300 hover:text-white flex items-center justify-center font-bold text-lg transition"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Oyun Seçim Sekmeleri (Monaco Tab Bar) */}
        <div className="flex border-b border-amber-500/30 bg-[#06180e] px-4 pt-2 gap-2 text-xs font-serif overflow-x-auto">
          <button
            onClick={() => setActiveTab('ROULETTE')}
            className={`px-5 py-3 rounded-t-xl font-bold transition flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'ROULETTE'
                ? 'bg-gradient-to-t from-[#0e3b22] to-[#144f2e] text-amber-300 border-t-2 border-x-2 border-amber-500/60 shadow-[0_-5px_15px_rgba(0,0,0,0.5)]'
                : 'text-gray-400 hover:text-amber-200'
            }`}
          >
            <span className="text-base">🎡</span> Monte Carlo Avrupa Ruleti
          </button>

          <button
            onClick={() => setActiveTab('BLACKJACK')}
            className={`px-5 py-3 rounded-t-xl font-bold transition flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'BLACKJACK'
                ? 'bg-gradient-to-t from-[#0e3b22] to-[#144f2e] text-amber-300 border-t-2 border-x-2 border-amber-500/60 shadow-[0_-5px_15px_rgba(0,0,0,0.5)]'
                : 'text-gray-400 hover:text-amber-200'
            }`}
          >
            <span className="text-base">♠️</span> Monaco VIP Blackjack 21
          </button>

          <button
            onClick={() => setActiveTab('BACCARAT')}
            className={`px-5 py-3 rounded-t-xl font-bold transition flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'BACCARAT'
                ? 'bg-gradient-to-t from-[#0e3b22] to-[#144f2e] text-amber-300 border-t-2 border-x-2 border-amber-500/60 shadow-[0_-5px_15px_rgba(0,0,0,0.5)]'
                : 'text-gray-400 hover:text-amber-200'
            }`}
          >
            <span className="text-base">👑</span> Baccarat Punto Banco
          </button>
        </div>

        {/* ================================================================== */}
        {/* TAB 1: AVRUPA RULETİ */}
        {/* ================================================================== */}
        {activeTab === 'ROULETTE' && (
          <div className="p-4 sm:p-6 space-y-5">
            {/* Çark & Sonuç Sahnesi */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-center bg-[#072415] border border-amber-500/30 rounded-2xl p-4">
              
              {/* Sol: Rulet Çarkı */}
              <div className="flex flex-col items-center justify-center">
                <div className="relative w-48 h-48 sm:w-56 sm:h-56 rounded-full border-4 border-amber-500 bg-radial from-[#124d2c] to-[#041a0d] shadow-[0_0_30px_rgba(245,158,11,0.3)] flex items-center justify-center overflow-hidden">
                  {/* Dönen Çark */}
                  <div 
                    className="absolute inset-2 rounded-full border-2 border-amber-400/40 flex items-center justify-center transition-transform duration-[2800ms] cubic-bezier(0.2, 0.8, 0.2, 1)"
                    style={{ transform: `rotate(${rouletteWheelRotation}deg)` }}
                  >
                    <div className="w-full h-full rounded-full border border-dashed border-amber-300/30 opacity-70 animate-spin-slow" />
                    <div className="absolute text-[11px] font-mono font-black text-amber-300">
                      {isSpinningRoulette ? 'ÇEVRİLİYOR...' : rouletteLastResult ? `${rouletteLastResult.winningNumber}` : 'MONTE CARLO'}
                    </div>
                  </div>

                  {/* Merkez Göbek */}
                  <div className="relative z-10 w-16 h-16 rounded-full bg-gradient-to-tr from-amber-600 via-amber-300 to-amber-500 shadow-lg border border-amber-200 flex items-center justify-center">
                    <span className="text-xl">⚜️</span>
                  </div>
                </div>
              </div>

              {/* Orta: Sonuç & Son Çıkan Numaralar */}
              <div className="text-center space-y-3">
                <span className="text-xs text-amber-200/70 uppercase tracking-widest font-mono">KAZANAN NUMARA</span>
                <div className="flex items-center justify-center">
                  {rouletteLastResult ? (
                    <div className={`w-20 h-20 rounded-2xl flex flex-col items-center justify-center text-3xl font-black border-2 shadow-2xl animate-bounce ${
                      rouletteLastResult.color === 'green'
                        ? 'bg-emerald-600 border-emerald-400 text-white shadow-emerald-500/50'
                        : rouletteLastResult.color === 'red'
                        ? 'bg-rose-600 border-rose-400 text-white shadow-rose-500/50'
                        : 'bg-zinc-900 border-zinc-500 text-white shadow-zinc-500/50'
                    }`}>
                      <span>{rouletteLastResult.winningNumber}</span>
                      <span className="text-[10px] uppercase font-mono tracking-wider">{rouletteLastResult.color}</span>
                    </div>
                  ) : (
                    <div className="w-20 h-20 rounded-2xl bg-[#03140a] border border-amber-500/30 flex items-center justify-center text-gray-500 text-2xl font-mono">
                      ?
                    </div>
                  )}
                </div>

                {rouletteLastResult && (
                  <div className={`text-sm font-bold font-mono ${rouletteLastResult.netWin > 0 ? 'text-emerald-400' : 'text-gray-400'}`}>
                    {rouletteLastResult.netWin > 0 
                      ? `🎉 TEBRİKLER! +$${rouletteLastResult.totalPayout.toFixed(2)} KAZANDINIZ` 
                      : 'Kasa Kazandı. Şansınızı tekrar deneyin.'}
                  </div>
                )}

                {/* Son 8 Numara */}
                <div className="pt-2">
                  <span className="text-[10px] text-gray-400 block mb-1 font-mono">GEÇMİŞ SAYILAR:</span>
                  <div className="flex items-center justify-center gap-1.5 flex-wrap">
                    {recentRouletteNumbers.map((num, i) => (
                      <span 
                        key={i}
                        className={`w-6 h-6 rounded-md flex items-center justify-center text-[11px] font-mono font-bold ${
                          num === 0 ? 'bg-emerald-600 text-white' : RED_NUMBERS.includes(num) ? 'bg-rose-600 text-white' : 'bg-zinc-900 text-white border border-zinc-700'
                        }`}
                      >
                        {num}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Sağ: Bahis Özeti & Çevir Butonu */}
              <div className="flex flex-col justify-center gap-3 bg-[#03140a] p-4 rounded-xl border border-amber-500/20">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-gray-400">Toplam Bahis:</span>
                  <span className="font-bold text-amber-300">
                    ${rouletteBets.reduce((a, b) => a + b.amount, 0)}
                  </span>
                </div>
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-gray-400">Bahis Kalemi:</span>
                  <span className="text-gray-200">{rouletteBets.length} Pozisyon</span>
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    onClick={clearRouletteBets}
                    disabled={isSpinningRoulette || rouletteBets.length === 0}
                    className="flex-1 py-2.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 border border-zinc-600 text-xs font-bold text-gray-300 disabled:opacity-40"
                  >
                    Temizle
                  </button>
                  <button
                    onClick={handleSpinRoulette}
                    disabled={isSpinningRoulette || rouletteBets.length === 0}
                    className="flex-2 py-2.5 px-6 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-black text-sm uppercase tracking-wider shadow-lg shadow-amber-500/30 disabled:opacity-40"
                  >
                    {isSpinningRoulette ? 'Çevriliyor...' : 'RULETİ ÇEVİR'}
                  </button>
                </div>
              </div>

            </div>

            {/* Fiş Seçici (Monaco VIP Chips) */}
            <div className="flex items-center justify-center gap-3 flex-wrap bg-[#051a0f] p-3 rounded-xl border border-amber-500/20">
              <span className="text-xs font-serif text-amber-300">FİŞ SEÇİN:</span>
              {[5, 25, 100, 500, 1000].map(val => (
                <button
                  key={val}
                  onClick={() => { playChipSound(); setSelectedChip(val); }}
                  className={`w-11 h-11 rounded-full font-mono font-black text-xs border-2 shadow-lg transition transform hover:scale-110 flex items-center justify-center ${
                    selectedChip === val 
                      ? 'border-amber-300 scale-110 ring-2 ring-amber-400 shadow-amber-500/50' 
                      : 'border-zinc-700 opacity-80'
                  } ${
                    val === 5 ? 'bg-red-800 text-white' :
                    val === 25 ? 'bg-emerald-800 text-white' :
                    val === 100 ? 'bg-black text-amber-300 border-amber-500' :
                    val === 500 ? 'bg-purple-900 text-white' : 'bg-gradient-to-br from-amber-600 to-yellow-300 text-black'
                  }`}
                >
                  ${val}
                </button>
              ))}
            </div>

            {/* Fransız Çuha Rulet Masası (Fransız Yeşil Çuha) */}
            <div className="bg-[#0b3820] border-2 border-amber-500/50 rounded-2xl p-4 shadow-inner space-y-3">
              {/* Dış Bahisler (Kırmızı, Siyah, Tek, Çift) */}
              <div className="grid grid-cols-6 gap-2 text-xs font-bold font-serif">
                <button 
                  onClick={() => addRouletteBet('LOW')}
                  className="py-2.5 bg-[#062414] hover:bg-[#09351d] border border-amber-500/30 rounded-lg text-amber-200"
                >
                  1 - 18 (1:1)
                </button>
                <button 
                  onClick={() => addRouletteBet('EVEN')}
                  className="py-2.5 bg-[#062414] hover:bg-[#09351d] border border-amber-500/30 rounded-lg text-amber-200"
                >
                  PAIR (ÇİFT)
                </button>
                <button 
                  onClick={() => addRouletteBet('RED')}
                  className="py-2.5 bg-rose-700 hover:bg-rose-600 border border-rose-400 rounded-lg text-white shadow"
                >
                  ROUGE (KIRMIZI)
                </button>
                <button 
                  onClick={() => addRouletteBet('BLACK')}
                  className="py-2.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-500 rounded-lg text-white shadow"
                >
                  NOIR (SİYAH)
                </button>
                <button 
                  onClick={() => addRouletteBet('ODD')}
                  className="py-2.5 bg-[#062414] hover:bg-[#09351d] border border-amber-500/30 rounded-lg text-amber-200"
                >
                  IMPAIR (TEK)
                </button>
                <button 
                  onClick={() => addRouletteBet('HIGH')}
                  className="py-2.5 bg-[#062414] hover:bg-[#09351d] border border-amber-500/30 rounded-lg text-amber-200"
                >
                  19 - 36 (1:1)
                </button>
              </div>

              {/* Düzineler (1st 12, 2nd 12, 3rd 12) */}
              <div className="grid grid-cols-3 gap-2 text-xs font-bold font-serif">
                <button 
                  onClick={() => addRouletteBet('DOZEN_1')}
                  className="py-2 bg-[#062414] hover:bg-[#09351d] border border-amber-500/30 rounded-lg text-amber-300"
                >
                  12 P (1 - 12) [2:1]
                </button>
                <button 
                  onClick={() => addRouletteBet('DOZEN_2')}
                  className="py-2 bg-[#062414] hover:bg-[#09351d] border border-amber-500/30 rounded-lg text-amber-300"
                >
                  12 M (13 - 24) [2:1]
                </button>
                <button 
                  onClick={() => addRouletteBet('DOZEN_3')}
                  className="py-2 bg-[#062414] hover:bg-[#09351d] border border-amber-500/30 rounded-lg text-amber-300"
                >
                  12 D (25 - 36) [2:1]
                </button>
              </div>

              {/* 0 - 36 Rakam Izgarası */}
              <div className="flex gap-2">
                {/* 0 (Yeşil) */}
                <button
                  onClick={() => addRouletteBet('STRAIGHT', 0)}
                  className="w-12 rounded-lg bg-emerald-700 hover:bg-emerald-600 border border-emerald-400 font-bold text-lg flex items-center justify-center"
                >
                  0
                </button>

                {/* 1-36 Rakamları */}
                <div className="grid grid-cols-12 gap-1.5 flex-1 font-mono text-xs font-bold">
                  {Array.from({ length: 36 }, (_, i) => i + 1).map(num => {
                    const isRed = RED_NUMBERS.includes(num);
                    const betOnThis = rouletteBets.find(b => b.type === 'STRAIGHT' && b.target === num);

                    return (
                      <button
                        key={num}
                        onClick={() => addRouletteBet('STRAIGHT', num)}
                        className={`h-9 rounded-md border flex flex-col items-center justify-center transition relative ${
                          isRed 
                            ? 'bg-rose-700 hover:bg-rose-600 border-rose-500 text-white' 
                            : 'bg-zinc-900 hover:bg-zinc-800 border-zinc-700 text-white'
                        }`}
                      >
                        <span>{num}</span>
                        {betOnThis && (
                          <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-amber-400 text-black text-[9px] font-black flex items-center justify-center shadow">
                            •
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

            </div>
          </div>
        )}

        {/* ================================================================== */}
        {/* TAB 2: MONACO VIP BLACKJACK 21 */}
        {/* ================================================================== */}
        {activeTab === 'BLACKJACK' && (
          <div className="p-4 sm:p-6 space-y-6">
            <div className="bg-[#0b3820] border-2 border-amber-500/50 rounded-2xl p-6 shadow-inner space-y-6">
              
              {/* Krupiye Alanı */}
              <div className="flex flex-col items-center gap-2">
                <span className="text-xs font-serif text-amber-300 uppercase tracking-widest">
                  KRUPİYE (DEALER STANDS ON 17)
                </span>
                <div className="flex gap-2 min-h-[90px] items-center">
                  {bjDealerCards.map((card, idx) => (
                    <div 
                      key={idx} 
                      className={`w-14 h-20 sm:w-16 sm:h-24 rounded-lg bg-white border-2 border-zinc-300 shadow-xl flex flex-col justify-between p-1.5 font-bold ${
                        ['♥', '♦'].includes(card.suit) ? 'text-rose-600' : 'text-zinc-900'
                      }`}
                    >
                      <div className="text-xs font-mono">{card.rank}{card.suit}</div>
                      <div className="text-center text-xl sm:text-2xl">{card.suit}</div>
                      <div className="text-xs font-mono text-right">{card.rank}</div>
                    </div>
                  ))}
                  {bjGameStage === 'PLAYER_TURN' && (
                    <div className="w-14 h-20 sm:w-16 sm:h-24 rounded-lg bg-gradient-to-br from-blue-900 to-indigo-950 border-2 border-amber-400/50 shadow-xl flex items-center justify-center text-amber-300 font-serif">
                      ⚜️
                    </div>
                  )}
                </div>
                {bjGameStage === 'ROUND_OVER' && (
                  <span className="text-xs font-mono bg-black/40 px-3 py-1 rounded-full text-amber-200">
                    Krupiye Toplam: {calculateHandValue(bjDealerCards).total}
                  </span>
                )}
              </div>

              {/* Masa Mesajı */}
              <div className="text-center py-2 px-4 rounded-xl bg-[#041a0d] border border-amber-500/20 text-sm font-serif text-amber-200">
                {bjMessage}
              </div>

              {/* Oyuncu Alanı */}
              <div className="flex flex-col items-center gap-2">
                <div className="flex gap-2 min-h-[90px] items-center">
                  {bjPlayerCards.map((card, idx) => (
                    <div 
                      key={idx} 
                      className={`w-14 h-20 sm:w-16 sm:h-24 rounded-lg bg-white border-2 border-zinc-300 shadow-xl flex flex-col justify-between p-1.5 font-bold animate-fadeIn ${
                        ['♥', '♦'].includes(card.suit) ? 'text-rose-600' : 'text-zinc-900'
                      }`}
                    >
                      <div className="text-xs font-mono">{card.rank}{card.suit}</div>
                      <div className="text-center text-xl sm:text-2xl">{card.suit}</div>
                      <div className="text-xs font-mono text-right">{card.rank}</div>
                    </div>
                  ))}
                </div>
                {bjPlayerCards.length > 0 && (
                  <span className="text-xs font-mono bg-black/40 px-3 py-1 rounded-full text-emerald-300 font-bold">
                    Eliniz: {calculateHandValue(bjPlayerCards).total} {calculateHandValue(bjPlayerCards).isSoft ? '(Soft)' : ''}
                  </span>
                )}
                <span className="text-xs font-serif text-amber-300 uppercase tracking-widest mt-1">
                  OYUNCU (SİZ)
                </span>
              </div>

              {/* Kontrol Butonları */}
              <div className="flex flex-wrap items-center justify-center gap-4 pt-4 border-t border-amber-500/30">
                {bjGameStage === 'BETTING' || bjGameStage === 'ROUND_OVER' ? (
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-serif text-gray-300">BAHİS:</span>
                    {[25, 50, 100, 250, 500].map(val => (
                      <button
                        key={val}
                        onClick={() => { playChipSound(); setBjBet(val); }}
                        className={`px-3 py-1.5 rounded-lg font-mono text-xs font-bold border ${
                          bjBet === val ? 'bg-amber-500 text-black border-amber-300' : 'bg-zinc-800 text-white border-zinc-600'
                        }`}
                      >
                        ${val}
                      </button>
                    ))}
                    <button
                      onClick={startBlackjackRound}
                      disabled={userBalance < bjBet}
                      className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-black font-black text-sm uppercase tracking-wider shadow-lg shadow-amber-500/30 ml-2"
                    >
                      KART DAĞIT (DEAL)
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <button
                      onClick={handleBjHit}
                      className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-sm uppercase tracking-wider shadow-lg shadow-emerald-600/30"
                    >
                      KART ÇEK (HIT)
                    </button>
                    <button
                      onClick={handleBjStand}
                      className="px-6 py-2.5 rounded-xl bg-rose-700 hover:bg-rose-600 text-white font-black text-sm uppercase tracking-wider shadow-lg shadow-rose-700/30"
                    >
                      DUR (STAND)
                    </button>
                  </div>
                )}
              </div>

            </div>
          </div>
        )}

        {/* ================================================================== */}
        {/* TAB 3: BACCARAT PUNTO BANCO */}
        {/* ================================================================== */}
        {activeTab === 'BACCARAT' && (
          <div className="p-4 sm:p-6 space-y-6">
            <div className="bg-[#0b3820] border-2 border-amber-500/50 rounded-2xl p-6 shadow-inner space-y-6">
              
              {/* Yol Haritası (Roadmap / Bead Plate) */}
              <div className="flex items-center gap-2 bg-[#041a0d] p-3 rounded-xl border border-amber-500/20 overflow-x-auto text-xs font-mono">
                <span className="text-amber-300 font-serif mr-2">YOL HARİTASI:</span>
                {bacRoadmap.map((r, i) => (
                  <span 
                    key={i} 
                    className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-[10px] ${
                      r === 'P' ? 'bg-blue-600 text-white' : r === 'B' ? 'bg-rose-600 text-white' : 'bg-emerald-600 text-white'
                    }`}
                  >
                    {r}
                  </span>
                ))}
              </div>

              {/* Masa Düzeni (Player vs Banker) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* PLAYER (Punto) */}
                <div className={`p-4 rounded-xl border-2 flex flex-col items-center gap-3 transition ${
                  bacBetSide === 'PLAYER' ? 'border-blue-400 bg-blue-950/30' : 'border-zinc-700 bg-[#051c0f]'
                }`}>
                  <span className="font-serif font-black text-blue-400 tracking-wider">PLAYER (PUNTO) [1:1]</span>
                  <div className="flex gap-2 min-h-[90px] items-center">
                    {bacResult?.playerCards.map((card, idx) => (
                      <div 
                        key={idx}
                        className={`w-14 h-20 rounded-lg bg-white border-2 border-zinc-300 shadow flex flex-col justify-between p-1 font-bold ${
                          ['♥', '♦'].includes(card.suit) ? 'text-rose-600' : 'text-zinc-900'
                        }`}
                      >
                        <div className="text-xs font-mono">{card.rank}{card.suit}</div>
                        <div className="text-center text-lg">{card.suit}</div>
                        <div className="text-xs font-mono text-right">{card.rank}</div>
                      </div>
                    ))}
                  </div>
                  {bacResult && (
                    <span className="text-sm font-mono font-bold text-blue-300">
                      Skor: {bacResult.playerScore}
                    </span>
                  )}
                </div>

                {/* BANKER (Banco) */}
                <div className={`p-4 rounded-xl border-2 flex flex-col items-center gap-3 transition ${
                  bacBetSide === 'BANKER' ? 'border-rose-400 bg-rose-950/30' : 'border-zinc-700 bg-[#051c0f]'
                }`}>
                  <span className="font-serif font-black text-rose-400 tracking-wider">BANKER (BANCO) [0.95:1]</span>
                  <div className="flex gap-2 min-h-[90px] items-center">
                    {bacResult?.bankerCards.map((card, idx) => (
                      <div 
                        key={idx}
                        className={`w-14 h-20 rounded-lg bg-white border-2 border-zinc-300 shadow flex flex-col justify-between p-1 font-bold ${
                          ['♥', '♦'].includes(card.suit) ? 'text-rose-600' : 'text-zinc-900'
                        }`}
                      >
                        <div className="text-xs font-mono">{card.rank}{card.suit}</div>
                        <div className="text-center text-lg">{card.suit}</div>
                        <div className="text-xs font-mono text-right">{card.rank}</div>
                      </div>
                    ))}
                  </div>
                  {bacResult && (
                    <span className="text-sm font-mono font-bold text-rose-300">
                      Skor: {bacResult.bankerScore}
                    </span>
                  )}
                </div>

              </div>

              {/* Bahis Seçim Kutuları */}
              <div className="grid grid-cols-3 gap-3">
                <button
                  onClick={() => { playChipSound(); setBacBetSide('PLAYER'); }}
                  className={`py-3 rounded-xl border text-center transition font-serif font-bold ${
                    bacBetSide === 'PLAYER' ? 'bg-blue-600 border-blue-400 text-white shadow-lg' : 'bg-[#051c0f] border-zinc-700 text-gray-300'
                  }`}
                >
                  PLAYER (1:1)
                </button>
                <button
                  onClick={() => { playChipSound(); setBacBetSide('TIE'); }}
                  className={`py-3 rounded-xl border text-center transition font-serif font-bold ${
                    bacBetSide === 'TIE' ? 'bg-emerald-600 border-emerald-400 text-white shadow-lg' : 'bg-[#051c0f] border-zinc-700 text-gray-300'
                  }`}
                >
                  TIE (BERABERE 8:1)
                </button>
                <button
                  onClick={() => { playChipSound(); setBacBetSide('BANKER'); }}
                  className={`py-3 rounded-xl border text-center transition font-serif font-bold ${
                    bacBetSide === 'BANKER' ? 'bg-rose-700 border-rose-500 text-white shadow-lg' : 'bg-[#051c0f] border-zinc-700 text-gray-300'
                  }`}
                >
                  BANKER (0.95:1)
                </button>
              </div>

              {/* Bahis Miktarı ve Kart Aç Butonu */}
              <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-amber-500/30">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-serif text-gray-300">BAHİS:</span>
                  {[25, 50, 100, 500, 1000].map(val => (
                    <button
                      key={val}
                      onClick={() => { playChipSound(); setBacBetAmount(val); }}
                      className={`px-3 py-1.5 rounded-lg font-mono text-xs font-bold border ${
                        bacBetAmount === val ? 'bg-amber-500 text-black border-amber-300' : 'bg-zinc-800 text-white border-zinc-600'
                      }`}
                    >
                      ${val}
                    </button>
                  ))}
                </div>

                <button
                  onClick={handlePlayBaccarat}
                  disabled={isBacDealing || userBalance < bacBetAmount}
                  className="px-8 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-black font-black text-sm uppercase tracking-wider shadow-lg shadow-amber-500/30 disabled:opacity-40"
                >
                  {isBacDealing ? 'KARTLAR AÇILIYOR...' : 'OYNA (DEAL BACCARAT)'}
                </button>
              </div>

            </div>
          </div>
        )}

      </div>
    </div>
  );
}
