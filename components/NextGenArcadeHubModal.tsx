'use client';

import React, { useState, useEffect, useRef } from 'react';
import { UserAccount } from '@/lib/tradingEngine';
import { 
  MiniGameType, 
  generateCrashPoint, 
  generateMinesGrid, 
  getMinesMultiplier, 
  getMinesTargetTiers,
  simulatePlinkoPath, 
  PLINKO_MULTIPLIERS,
  spinWheelOfFortune,
  WHEEL_SECTORS,
  flipCoin
} from '@/lib/miniGamesEngine';
import { loadCasinoConfig } from '@/lib/monteCarloEngine';
import GrandWinCelebration from '@/components/GrandWinCelebration';


interface NextGenArcadeHubModalProps {
  isOpen: boolean;
  onClose: () => void;
  account: UserAccount;
  onUpdateBalance: (newBalance: number) => void;
  onOpenSlotGame?: () => void;
}

export default function NextGenArcadeHubModal({
  isOpen,
  onClose,
  account,
  onUpdateBalance,
  onOpenSlotGame
}: NextGenArcadeHubModalProps) {
  const [activeTab, setActiveTab] = useState<MiniGameType>('CRASH_ROCKET');
  const [bet, setBet] = useState<number>(20);
  const [winCelebration, setWinCelebration] = useState<{ isOpen: boolean; amount: number; title: string } | null>(null);


  // Ses Sentezleyici
  const audioCtxRef = useRef<AudioContext | null>(null);
  const playSound = (freq = 440, type: OscillatorType = 'sine', duration = 0.15) => {
    try {
      if (!audioCtxRef.current) {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioCtx) audioCtxRef.current = new AudioCtx();
      }
      const ctx = audioCtxRef.current;
      if (!ctx) return;
      if (ctx.state === 'suspended') ctx.resume();

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.01, ctx.currentTime + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch (e) {}
  };

  // Caesars & Monte Carlo Tarzı Görkemli Zafer Fanfarı & Para Yağmuru
  const playArcadeGrandFanfare = () => {
    playSound(523.25, 'triangle', 0.25); // C5
    setTimeout(() => playSound(659.25, 'triangle', 0.25), 140); // E5
    setTimeout(() => playSound(783.99, 'triangle', 0.25), 280); // G5
    setTimeout(() => playSound(1046.50, 'sawtooth', 0.4), 420); // C6

    const coinPitches = [1600, 2000, 2500, 3000, 1800, 2200];
    for (let i = 0; i < 12; i++) {
      setTimeout(() => {
        playSound(coinPitches[Math.floor(Math.random() * coinPitches.length)], 'sine', 0.05);
      }, 550 + i * 40);
    }
  };

  // =========================================================================
  // 1. ROCKET CRASH STATE & LOGIC
  // =========================================================================
  const [crashState, setCrashState] = useState<'IDLE' | 'FLYING' | 'CRASHED' | 'CASHED_OUT'>('IDLE');
  const [currentMultiplier, setCurrentMultiplier] = useState<number>(1.00);
  const [cashoutWin, setCashoutWin] = useState<number>(0);
  const crashPointRef = useRef<number>(2.00);
  const flyIntervalRef = useRef<any>(null);

  const startCrashGame = () => {
    if (account.balance < bet) {
      alert(`Yetersiz Bakiye! Bahis: $${bet}, Mevcut Bakiye: $${account.balance.toFixed(2)}`);
      return;
    }

    onUpdateBalance(account.balance - bet);
    playSound(350, 'triangle', 0.2);

    const generated = generateCrashPoint();
    const cfg = loadCasinoConfig();
    crashPointRef.current = cfg.penetrationMode === 'GOD_WIN_100' ? 88.88 : generated.crashPoint;
    setCrashState('FLYING');
    setCurrentMultiplier(1.00);
    setCashoutWin(0);

    const startTime = Date.now();
    flyIntervalRef.current = setInterval(() => {
      const elapsedSec = (Date.now() - startTime) / 1000;
      // Katlanarak artan eğri
      const newMult = Number((1.00 + Math.pow(elapsedSec * 0.85, 1.8)).toFixed(2));

      if (newMult >= crashPointRef.current) {
        // Patladı!
        clearInterval(flyIntervalRef.current);
        setCurrentMultiplier(crashPointRef.current);
        setCrashState('CRASHED');
        playSound(120, 'sawtooth', 0.4);
      } else {
        setCurrentMultiplier(newMult);
      }
    }, 60);
  };

  const handleCashout = () => {
    if (crashState !== 'FLYING') return;
    clearInterval(flyIntervalRef.current);
    const winAmount = Number((bet * currentMultiplier).toFixed(2));
    onUpdateBalance(account.balance + winAmount);
    setCashoutWin(winAmount);
    setCrashState('CASHED_OUT');
    playArcadeGrandFanfare();
    setWinCelebration({
      isOpen: true,
      amount: winAmount,
      title: `🚀 ROKET KAZANÇ (${currentMultiplier.toFixed(2)}x)!`
    });
  };

  // =========================================================================
  // 2. DIAMOND MINES STATE & LOGIC
  // =========================================================================
  const [minesCount, setMinesCount] = useState<number>(3);
  const [selectedTargetStep, setSelectedTargetStep] = useState<number>(5); // 3, 5, 8, 12 adım
  const [minesActive, setMinesActive] = useState<boolean>(false);
  const [revealedCells, setRevealedCells] = useState<Record<number, 'GEM' | 'MINE'>>({});
  const [minePositions, setMinePositions] = useState<number[]>([]);
  const [diamondsFound, setDiamondsFound] = useState<number>(0);
  const [minesGameOver, setMinesGameOver] = useState<boolean>(false);
  const [minesWinAmount, setMinesWinAmount] = useState<number>(0);

  const startMinesGame = () => {
    if (account.balance < bet) {
      alert(`Yetersiz Bakiye! Bahis: $${bet}, Mevcut Bakiye: $${account.balance.toFixed(2)}`);
      return;
    }

    onUpdateBalance(account.balance - bet);
    playSound(400, 'sine', 0.15);

    const grid = generateMinesGrid(minesCount);
    setMinePositions(grid.minePositions);
    setRevealedCells({});
    setDiamondsFound(0);
    setMinesGameOver(false);
    setMinesWinAmount(0);
    setMinesActive(true);
  };

  const handleCellClick = (idx: number) => {
    if (!minesActive || minesGameOver || revealedCells[idx]) return;

    const cfg = loadCasinoConfig();
    const isGodMode = cfg.penetrationMode === 'GOD_WIN_100';

    if (minePositions.includes(idx) && !isGodMode) {
      // Mayına bastı!
      const allRevealed: Record<number, 'GEM' | 'MINE'> = { ...revealedCells };
      minePositions.forEach(m => allRevealed[m] = 'MINE');
      setRevealedCells(allRevealed);
      setMinesGameOver(true);
      setMinesActive(false);
      playSound(100, 'sawtooth', 0.5);
    } else {
      // Elmas buldu! (God modunda mayın olsa bile elmasa dönüştürülür)
      const newRevealed = { ...revealedCells, [idx]: 'GEM' as const };
      const newFound = diamondsFound + 1;
      setRevealedCells(newRevealed);
      setDiamondsFound(newFound);
      playSound(500 + newFound * 60, 'sine', 0.15);

      // Hedef Adıma Ulaşıldı mı? (Örn: 3, 5, 8 adım)
      if (selectedTargetStep > 0 && newFound === selectedTargetStep) {
        setTimeout(() => {
          const mult = getMinesMultiplier(minesCount, newFound);
          const win = Number((bet * mult).toFixed(2));
          onUpdateBalance(account.balance + win);
          setMinesWinAmount(win);
          setMinesActive(false);
          playArcadeGrandFanfare();
          setWinCelebration({
            isOpen: true,
            amount: win,
            title: `💎 ELMAS MAYIN HEDEF (${newFound} ADIM)!`
          });
        }, 300);
      }
    }
  };

  const handleMinesCashout = () => {
    if (!minesActive || diamondsFound === 0) return;
    const mult = getMinesMultiplier(minesCount, diamondsFound);
    const win = Number((bet * mult).toFixed(2));
    onUpdateBalance(account.balance + win);
    setMinesWinAmount(win);
    setMinesActive(false);
    playArcadeGrandFanfare();
    setWinCelebration({
      isOpen: true,
      amount: win,
      title: `💎 MAYIN KÂRI ALINDI (${mult}x)!`
    });
  };


  // =========================================================================
  // 3. PLINKO STATE & LOGIC
  // =========================================================================
  const [plinkoActive, setPlinkoActive] = useState<boolean>(false);
  const [plinkoBallPos, setPlinkoBallPos] = useState<{ x: number; y: number } | null>(null);
  const [plinkoSlotResult, setPlinkoSlotResult] = useState<number | null>(null);
  const [plinkoWin, setPlinkoWin] = useState<number>(0);

  const dropPlinkoBall = () => {
    if (plinkoActive) return;
    if (account.balance < bet) {
      alert(`Yetersiz Bakiye! Bahis: $${bet}, Mevcut Bakiye: $${account.balance.toFixed(2)}`);
      return;
    }

    onUpdateBalance(account.balance - bet);
    setPlinkoActive(true);
    setPlinkoSlotResult(null);
    setPlinkoWin(0);

    const simulation = simulatePlinkoPath();
    let step = 0;
    let currX = 50; // Başlangıç tepe noktası %50
    let currY = 5;

    const interval = setInterval(() => {
      if (step < simulation.path.length) {
        const dir = simulation.path[step];
        currX += dir === 'R' ? 4.5 : -4.5;
        currY += 10.5;
        setPlinkoBallPos({ x: currX, y: currY });
        playSound(400 + step * 40, 'triangle', 0.05);
        step++;
      } else {
        clearInterval(interval);
        setPlinkoSlotResult(simulation.finalSlot);
        const win = Number((bet * simulation.multiplier).toFixed(2));
        onUpdateBalance(account.balance + win);
        setPlinkoWin(win);
        setPlinkoActive(false);
        playSound(win >= bet ? 800 : 300, 'sine', 0.3);
      }
    }, 90);
  };

  // =========================================================================
  // 4. VIRAL WHEEL OF FORTUNE (FACEBOOK KLASİK ŞANS ÇARKI)
  // =========================================================================
  const [wheelSpinning, setWheelSpinning] = useState<boolean>(false);
  const [wheelRotation, setWheelRotation] = useState<number>(0);
  const [wheelResult, setWheelResult] = useState<string | null>(null);
  const [wheelWinAmount, setWheelWinAmount] = useState<number>(0);

  const spinWheel = () => {
    if (wheelSpinning) return;
    if (account.balance < bet) {
      alert(`Yetersiz Bakiye! Bahis: $${bet}, Mevcut Bakiye: $${account.balance.toFixed(2)}`);
      return;
    }

    onUpdateBalance(account.balance - bet);
    setWheelSpinning(true);
    setWheelResult(null);
    setWheelWinAmount(0);
    playSound(450, 'sawtooth', 0.2);

    const { sectorIndex, sector } = spinWheelOfFortune();
    // 8 dilim, her dilim 45 derece. Dilimin merkezine denk gelecek açı
    const sliceDeg = 360 / WHEEL_SECTORS.length;
    const targetDeg = 360 * 5 + (360 - (sectorIndex * sliceDeg + sliceDeg / 2));

    setWheelRotation(prev => prev + targetDeg);

    setTimeout(() => {
      setWheelSpinning(false);
      setWheelResult(sector.label);
      const win = Number((bet * sector.multiplier).toFixed(2));
      if (win > 0) {
        onUpdateBalance(account.balance + win);
        setWheelWinAmount(win);
        playArcadeGrandFanfare();
        setWinCelebration({
          isOpen: true,
          amount: win,
          title: `🎡 ŞANS ÇARKI ZAFERİ (${sector.label})!`
        });
      } else {
        playSound(150, 'sawtooth', 0.4);
      }
    }, 3200);
  };

  // =========================================================================
  // 5. COIN FLIP STREAK (FACEBOOK / WEB3 SERİ YAZI-TURA)
  // =========================================================================
  const [coinFlipping, setCoinFlipping] = useState<boolean>(false);
  const [coinStreak, setCoinStreak] = useState<number>(0);
  const [coinLastSide, setCoinLastSide] = useState<'YAZI' | 'TURA' | null>(null);
  const [coinGameActive, setCoinGameActive] = useState<boolean>(false);

  const getCoinStreakMultiplier = (streak: number) => {
    if (streak === 0) return 1.0;
    return Number((Math.pow(1.96, streak)).toFixed(2));
  };

  const handleFlipCoin = (choice: 'YAZI' | 'TURA') => {
    if (coinFlipping) return;
    if (!coinGameActive) {
      if (account.balance < bet) {
        alert(`Yetersiz Bakiye! Bahis: $${bet}, Mevcut Bakiye: $${account.balance.toFixed(2)}`);
        return;
      }
      onUpdateBalance(account.balance - bet);
      setCoinGameActive(true);
      setCoinStreak(0);
    }

    setCoinFlipping(true);
    playSound(600, 'square', 0.1);

    setTimeout(() => {
      const outcome = flipCoin(choice);
      setCoinLastSide(outcome.result);
      setCoinFlipping(false);

      if (outcome.won) {
        setCoinStreak(prev => prev + 1);
        playSound(850, 'sine', 0.25);
      } else {
        // Kaybetti
        setCoinStreak(0);
        setCoinGameActive(false);
        playSound(150, 'sawtooth', 0.4);
      }
    }, 600);
  };

  const handleCoinCashout = () => {
    if (!coinGameActive || coinStreak === 0) return;
    const mult = getCoinStreakMultiplier(coinStreak);
    const win = Number((bet * mult).toFixed(2));
    onUpdateBalance(account.balance + win);
    setCoinGameActive(false);
    setCoinStreak(0);
    playArcadeGrandFanfare();
    setWinCelebration({
      isOpen: true,
      amount: win,
      title: `🪙 SERİ YAZI-TURA KÂRI (${coinStreak}x SERİ)!`
    });
  };


  // Modal kapandığında interval'leri temizle
  useEffect(() => {
    return () => {
      if (flyIntervalRef.current) clearInterval(flyIntervalRef.current);
    };
  }, []);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-2 sm:p-4 overflow-y-auto select-none">
      
      <div className="relative w-full max-w-4xl max-h-[94vh] bg-gradient-to-b from-[#101424] via-[#090c17] to-[#05070e] border-2 border-indigo-500/40 rounded-2xl sm:rounded-3xl shadow-[0_0_60px_rgba(99,102,241,0.25)] overflow-hidden flex flex-col my-auto">
        
        {/* Üst Başlık & Oyun Seçici Sekmeler */}
        <div className="flex flex-col sm:flex-row items-center justify-between px-3 sm:px-5 py-3 bg-[#070913]/90 border-b border-indigo-500/30 gap-3 shrink-0">
          <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto justify-between sm:justify-start">
            <button
              onClick={onClose}
              className="px-2.5 sm:px-3 py-1.5 rounded-xl bg-indigo-950/60 hover:bg-indigo-900 border border-indigo-500/40 text-indigo-300 hover:text-white font-bold text-xs flex items-center gap-1.5 transition shadow"
              title="Arcade Salonundan Çıkış Yap"
            >
              <span>←</span>
              <span>Geri Dön</span>
            </button>

            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 flex items-center justify-center text-lg shadow-lg">
                🚀
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-sm sm:text-base font-black text-white tracking-wide">
                    NOVA ARCADE
                  </h2>
                  <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/30 hidden sm:inline">
                    7/24 SANAL
                  </span>
                </div>
                <span className="text-[9px] text-gray-400 font-mono hidden sm:inline">
                  Bakiye: ${account.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 text-gray-300 hover:text-white flex items-center justify-center font-bold text-xs transition sm:hidden"
            >
              ✕
            </button>
          </div>

          {/* Sekmeler - KAYDIRMASIZ DİNAMİK GRİD */}
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-1 bg-[#141a2e] p-1 rounded-xl border border-indigo-500/30 text-xs font-bold w-full sm:w-auto">
            <button
              onClick={() => setActiveTab('CRASH_ROCKET')}
              className={`px-2.5 py-1.5 rounded-lg transition flex items-center justify-center gap-1 text-center ${
                activeTab === 'CRASH_ROCKET' ? 'bg-gradient-to-r from-rose-600 to-orange-500 text-white shadow' : 'text-gray-400 hover:text-white'
              }`}
            >
              <span>🚀</span> Roket
            </button>
            <button
              onClick={() => setActiveTab('CRYPTO_MINES')}
              className={`px-2.5 py-1.5 rounded-lg transition flex items-center justify-center gap-1 text-center ${
                activeTab === 'CRYPTO_MINES' ? 'bg-gradient-to-r from-cyan-600 to-blue-500 text-white shadow' : 'text-gray-400 hover:text-white'
              }`}
            >
              <span>💎</span> Mayın
            </button>
            <button
              onClick={() => setActiveTab('PLINKO_PIN')}
              className={`px-2.5 py-1.5 rounded-lg transition flex items-center justify-center gap-1 text-center ${
                activeTab === 'PLINKO_PIN' ? 'bg-gradient-to-r from-amber-500 to-yellow-400 text-black shadow' : 'text-gray-400 hover:text-white'
              }`}
            >
              <span>🟡</span> Plinko
            </button>
            <button
              onClick={() => setActiveTab('WHEEL_FORTUNE')}
              className={`px-2.5 py-1.5 rounded-lg transition flex items-center justify-center gap-1 text-center ${
                activeTab === 'WHEEL_FORTUNE' ? 'bg-gradient-to-r from-purple-600 to-pink-500 text-white shadow' : 'text-gray-400 hover:text-white'
              }`}
            >
              <span>🎡</span> Çark
            </button>
            <button
              onClick={() => setActiveTab('COIN_FLIP_STREAK')}
              className={`px-2.5 py-1.5 rounded-lg transition flex items-center justify-center gap-1 text-center ${
                activeTab === 'COIN_FLIP_STREAK' ? 'bg-gradient-to-r from-emerald-600 to-teal-500 text-white shadow' : 'text-gray-400 hover:text-white'
              }`}
            >
              <span>🪙</span> Yazı-Tura
            </button>
            {onOpenSlotGame && (
              <button
                onClick={() => { onClose(); onOpenSlotGame(); }}
                className="px-2.5 py-1.5 rounded-lg text-amber-300 hover:text-white transition flex items-center justify-center gap-1 text-center"
              >
                <span>🍓</span> Çilek
              </button>
            )}
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-gray-300 hover:text-white hidden sm:flex items-center justify-center font-bold text-sm transition"
          >
            ✕
          </button>
        </div>

        {/* ========================================================================= */}
        {/* OYUN ALANI GÖVDESİ - DİKEY SCROLL DESTEKLİ */}
        {/* ========================================================================= */}
        <div className="p-3 sm:p-5 space-y-4 overflow-y-auto flex-1">
          
          {/* 1. OYUN: ROKET CRASH (AVIATOR STİLİ) */}
          {activeTab === 'CRASH_ROCKET' && (
            <div className="space-y-4">
              
              {/* AKILLI YÖNLENDİRİCİ ADIM ETİKETLERİ */}
              <div className="bg-gradient-to-r from-rose-950/60 via-orange-950/50 to-rose-950/60 border border-rose-500/30 rounded-xl p-2.5 flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-orange-500 text-black font-black text-[10px] uppercase">1. ADIM</span>
                  <span className="text-gray-300 font-bold">Bahsi Seç (${bet})</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-rose-500 text-white font-black text-[10px] uppercase animate-pulse">2. ADIM</span>
                  <span className="text-rose-300 font-bold">Roketi Fırlat</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-emerald-500 text-black font-black text-[10px] uppercase">3. ADIM</span>
                  <span className="text-emerald-300 font-bold">Patlamadan Nakite Çevir!</span>
                </div>
                <span className="text-amber-400 font-bold bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/30 hidden sm:inline">
                  ⚡ 88.88x Tepe Çarpanı
                </span>
              </div>

              <div className="relative h-64 sm:h-72 bg-[#060810] border-2 border-rose-500/40 rounded-2xl overflow-hidden flex flex-col items-center justify-center p-6 shadow-inner">
                {/* Uzay Izgarası */}
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f293d15_1px,transparent_1px),linear-gradient(to_bottom,#1f293d15_1px,transparent_1px)] bg-[size:24px_24px]"></div>

                {/* Çarpan Göstergesi */}
                <div className="relative z-10 text-center space-y-1">
                  <div className={`text-5xl sm:text-7xl font-black font-mono transition-transform duration-75 ${
                    crashState === 'CRASHED' ? 'text-rose-500 scale-105' : crashState === 'CASHED_OUT' ? 'text-emerald-400' : 'text-white'
                  }`}>
                    {currentMultiplier.toFixed(2)}x
                  </div>
                  <div className="text-xs font-mono font-bold tracking-widest uppercase">
                    {crashState === 'FLYING' && <span className="text-amber-400 animate-pulse">ROKET YÜKSELİYOR...</span>}
                    {crashState === 'CRASHED' && <span className="text-rose-400">PATLADI! (CRASH)</span>}
                    {crashState === 'CASHED_OUT' && <span className="text-emerald-400">KAZANDIN: +${cashoutWin.toFixed(2)}</span>}
                    {crashState === 'IDLE' && <span className="text-gray-400">BAHİS YAP VE FIRLAT</span>}
                  </div>
                </div>

                {/* Roket İkonu */}
                <div className="absolute bottom-4 left-6 text-3xl sm:text-4xl transition-all duration-300"
                  style={{
                    transform: crashState === 'FLYING' 
                      ? `translate(${Math.min(currentMultiplier * 20, 240)}px, -${Math.min(currentMultiplier * 15, 140)}px) rotate(-25deg)`
                      : 'none'
                  }}
                >
                  {crashState === 'CRASHED' ? '💥' : '🚀'}
                </div>
              </div>

              {/* Crash Kontrolleri */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-[#0c1020] p-4 rounded-xl border border-indigo-500/30 font-mono">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-400">BAHİS:</span>
                  {[5, 10, 20, 50, 100].map(amt => (
                    <button
                      key={amt}
                      disabled={crashState === 'FLYING'}
                      onClick={() => setBet(amt)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold ${bet === amt ? 'bg-rose-600 text-white' : 'bg-[#182035] text-gray-300'}`}
                    >
                      ${amt}
                    </button>
                  ))}
                </div>

                {crashState === 'FLYING' ? (
                  <button
                    onClick={handleCashout}
                    className="w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 text-black font-black text-sm rounded-xl shadow-[0_0_25px_rgba(16,185,129,0.5)] active:scale-95 animate-pulse"
                  >
                    💰 KÂRI AL (${(bet * currentMultiplier).toFixed(2)})
                  </button>
                ) : (
                  <button
                    onClick={startCrashGame}
                    className="w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-rose-600 to-orange-500 hover:from-rose-500 hover:to-orange-400 text-white font-black text-sm rounded-xl shadow-lg active:scale-95"
                  >
                    🚀 FIRLAT (${bet})
                  </button>
                )}
              </div>
            </div>
          )}

          {/* 2. OYUN: CRYPTO MINES (MAYIN TARLASI) */}
          {activeTab === 'CRYPTO_MINES' && (
            <div className="space-y-4">
              
              {/* AKILLI YÖNLENDİRİCİ ADIM ETİKETLERİ */}
              <div className="bg-gradient-to-r from-cyan-950/60 via-blue-950/50 to-cyan-950/60 border border-cyan-500/30 rounded-xl p-2.5 flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-cyan-500 text-black font-black text-[10px] uppercase">1. ADIM</span>
                  <span className="text-gray-300 font-bold">Kutulara Tıkla & Elmasları Aç</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-emerald-500 text-black font-black text-[10px] uppercase animate-pulse">2. ADIM</span>
                  <span className="text-emerald-300 font-bold">Çarpan Yükselirken Nakite Çevir!</span>
                </div>
                <span className="text-yellow-400 font-bold bg-yellow-500/10 px-2 py-0.5 rounded border border-yellow-500/30">
                  💎 God Mode: Tüm Kutular Elmas!
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                
                {/* 5x5 Mayın Izgarası */}
                <div className="md:col-span-2 bg-[#060810] border-2 border-cyan-500/40 rounded-2xl p-4 shadow-inner">
                  <div className="grid grid-cols-5 gap-2.5">
                    {Array.from({ length: 25 }).map((_, idx) => {
                      const status = revealedCells[idx];
                      return (
                        <button
                          key={idx}
                          disabled={!minesActive || minesGameOver || !!status}
                          onClick={() => handleCellClick(idx)}
                          className={`h-12 sm:h-14 rounded-xl flex items-center justify-center text-2xl font-bold transition-all ${
                            status === 'GEM' 
                              ? 'bg-gradient-to-tr from-cyan-600 to-emerald-500 shadow-[0_0_15px_rgba(6,182,212,0.6)] animate-bounce'
                              : status === 'MINE'
                              ? 'bg-rose-900 border-2 border-rose-500'
                              : 'bg-[#12192d] hover:bg-[#1a233d] border border-cyan-500/20 active:scale-95'
                          }`}
                        >
                          {status === 'GEM' ? '💎' : status === 'MINE' ? '💣' : ''}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Mines Panel Bilgisi */}
                <div className="bg-[#0c1020] border border-cyan-500/30 rounded-2xl p-4 space-y-4 font-mono text-xs">
                  <div>
                    <span className="text-gray-400 block">MAYIN SAYISI:</span>
                    <div className="flex items-center gap-1.5 mt-1">
                      {[1, 3, 5, 10].map(m => (
                        <button
                          key={m}
                          disabled={minesActive}
                          onClick={() => setMinesCount(m)}
                          className={`px-3 py-1.5 rounded-lg font-bold ${minesCount === m ? 'bg-cyan-500 text-black' : 'bg-[#182035] text-gray-300'}`}
                        >
                          {m} 💣
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* İNOVATİF ADIM HEDEFLERİ & RİSKE GÖRE KAZANÇ MATRİSİ */}
                  <div className="border-t border-[#1a243a] pt-3 space-y-1.5">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400 block font-bold text-[11px]">HEDEF ADIM (RİSK KAZANÇ):</span>
                      <span className="text-[10px] text-cyan-300">Oto-Cashout</span>
                    </div>
                    <div className="grid grid-cols-2 gap-1.5">
                      {getMinesTargetTiers(minesCount).map(tier => (
                        <button
                          key={tier.step}
                          disabled={minesActive}
                          onClick={() => setSelectedTargetStep(tier.step)}
                          className={`p-2 rounded-xl border text-left flex flex-col justify-between transition ${
                            selectedTargetStep === tier.step
                              ? 'bg-cyan-500/20 border-cyan-400 text-white shadow-[0_0_10px_rgba(6,182,212,0.3)]'
                              : 'bg-[#141b2d] border-[#1d273a] text-gray-400 hover:text-white'
                          }`}
                        >
                          <div className="flex items-center justify-between w-full">
                            <span className="font-extrabold text-xs text-cyan-300">{tier.step} Adım</span>
                            <span className={`text-[9px] px-1 py-0.2 rounded font-bold ${
                              tier.riskLevel === 'DÜŞÜK' ? 'bg-emerald-500/20 text-emerald-300' :
                              tier.riskLevel === 'ORTA' ? 'bg-blue-500/20 text-blue-300' :
                              tier.riskLevel === 'YÜKSEK' ? 'bg-amber-500/20 text-amber-300' : 'bg-rose-500/20 text-rose-300'
                            }`}>
                              {tier.riskLevel}
                            </span>
                          </div>
                          <div className="text-[11px] font-mono text-emerald-400 font-bold mt-1">
                            Hedef: {tier.estMultiplier}x
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="border-t border-[#1a243a] pt-3 space-y-1">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Bulunan Elmas:</span>
                      <span className="text-cyan-400 font-bold">{diamondsFound} 💎</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Mevcut Çarpan:</span>
                      <span className="text-emerald-400 font-extrabold text-sm">{getMinesMultiplier(minesCount, diamondsFound)}x</span>
                    </div>
                  </div>

                  {minesActive ? (
                    <button
                      disabled={diamondsFound === 0}
                      onClick={handleMinesCashout}
                      className="w-full py-3 bg-gradient-to-r from-emerald-500 to-cyan-500 text-black font-black text-xs rounded-xl shadow-lg active:scale-95 disabled:opacity-40"
                    >
                      💰 KÂRI AL (${(bet * getMinesMultiplier(minesCount, diamondsFound)).toFixed(2)})
                    </button>
                  ) : (
                    <button
                      onClick={startMinesGame}
                      className="w-full py-3 bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-black text-xs rounded-xl shadow-lg active:scale-95"
                    >
                      💎 OYUNA BAŞLA (${bet})
                    </button>
                  )}
                </div>

              </div>
            </div>
          )}

          {/* 3. OYUN: PLINKO PIN DROP */}
          {activeTab === 'PLINKO_PIN' && (
            <div className="space-y-4">
              
              {/* AKILLI YÖNLENDİRİCİ ADIM ETİKETLERİ */}
              <div className="bg-gradient-to-r from-yellow-950/60 via-amber-950/50 to-yellow-950/60 border border-yellow-500/30 rounded-xl p-2.5 flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-amber-500 text-black font-black text-[10px] uppercase">1. ADIM</span>
                  <span className="text-gray-300 font-bold">Bahsini Seç & Topu Bırak</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-yellow-500 text-black font-black text-[10px] uppercase animate-pulse">HEDEF</span>
                  <span className="text-yellow-300 font-bold">Kenarlardaki 1000x ve 130x Altın Yuvaları!</span>
                </div>
              </div>

              <div className="relative h-72 sm:h-80 bg-[#060810] border-2 border-amber-500/40 rounded-2xl overflow-hidden flex flex-col items-center justify-between p-4 shadow-inner">
                
                {/* Düşen Top */}
                {plinkoBallPos && (
                  <div
                    className="absolute w-4 h-4 bg-yellow-400 rounded-full shadow-[0_0_12px_rgba(250,204,21,1)] z-20 transition-all duration-75"
                    style={{ left: `${plinkoBallPos.x}%`, top: `${plinkoBallPos.y}%` }}
                  ></div>
                )}

                {/* Çivi Piramidi (Pegs) */}
                <div className="w-full max-w-sm mx-auto flex-1 flex flex-col justify-around py-2">
                  {[3, 4, 5, 6, 7, 8, 9].map((rowLen, rowIdx) => (
                    <div key={rowIdx} className="flex justify-center gap-6 sm:gap-7">
                      {Array.from({ length: rowLen }).map((_, pIdx) => (
                        <div key={pIdx} className="w-2 h-2 rounded-full bg-indigo-300 shadow"></div>
                      ))}
                    </div>
                  ))}
                </div>

                {/* Alt Çarpan Kutucukları */}
                <div className="w-full max-w-md grid grid-cols-9 gap-1 font-mono text-[10px] text-center font-bold">
                  {PLINKO_MULTIPLIERS.map((mult, mIdx) => (
                    <div
                      key={mIdx}
                      className={`py-1.5 rounded transition-transform ${
                        plinkoSlotResult === mIdx ? 'bg-yellow-400 text-black scale-110 shadow-lg' : mult >= 4 ? 'bg-rose-900 text-rose-300' : 'bg-indigo-950 text-indigo-300'
                      }`}
                    >
                      {mult}x
                    </div>
                  ))}
                </div>

              </div>

              {/* Plinko Kontrolleri */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-[#0c1020] p-4 rounded-xl border border-amber-500/30 font-mono">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-400">BAHİS:</span>
                  {[5, 10, 20, 50, 100].map(amt => (
                    <button
                      key={amt}
                      disabled={plinkoActive}
                      onClick={() => setBet(amt)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold ${bet === amt ? 'bg-amber-500 text-black' : 'bg-[#182035] text-gray-300'}`}
                    >
                      ${amt}
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-4">
                  {plinkoWin > 0 && (
                    <span className="text-emerald-400 font-bold text-xs">
                      Sonuç: +${plinkoWin.toFixed(2)}
                    </span>
                  )}
                  <button
                    disabled={plinkoActive}
                    onClick={dropPlinkoBall}
                    className="px-8 py-3 bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-black font-black text-sm rounded-xl shadow-lg active:scale-95 disabled:opacity-50"
                  >
                    {plinkoActive ? 'DÜŞÜYOR...' : '🟡 TOPU BIRAK ($' + bet + ')'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* 4. OYUN: VIRAL WHEEL OF FORTUNE (ŞANS ÇARKI) */}
          {activeTab === 'WHEEL_FORTUNE' && (
            <div className="space-y-4">
              {/* AKILLI YÖNLENDİRİCİ ETİKETLER */}
              <div className="bg-gradient-to-r from-purple-950/60 via-pink-950/50 to-purple-950/60 border border-purple-500/30 rounded-xl p-2.5 flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-purple-500 text-white font-black text-[10px] uppercase">1. ADIM</span>
                  <span className="text-gray-300 font-bold">Bahsini Ayarla & Çarkı Çevir</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-pink-500 text-white font-black text-[10px] uppercase animate-pulse">HEDEF</span>
                  <span className="text-pink-300 font-bold">50x MEGA JACKPOT & 25x Dilimleri!</span>
                </div>
              </div>

              {/* Çarkıfelek Görsel Alanı */}
              <div className="relative h-72 sm:h-80 bg-[#060810] border-2 border-purple-500/40 rounded-2xl flex flex-col items-center justify-center p-4 overflow-hidden shadow-inner">
                {/* İbre (Pointer) */}
                <div className="absolute top-4 z-20 text-3xl sm:text-4xl text-yellow-400 drop-shadow-[0_2px_10px_rgba(234,179,8,0.8)] animate-pulse">
                  ▼
                </div>

                {/* Dönen Çark */}
                <div
                  className="w-56 h-56 sm:w-64 sm:h-64 rounded-full border-4 border-yellow-400 shadow-[0_0_40px_rgba(168,85,247,0.4)] relative flex items-center justify-center transition-transform ease-out"
                  style={{
                    transform: `rotate(${wheelRotation}deg)`,
                    transitionDuration: wheelSpinning ? '3.2s' : '0s',
                    background: 'conic-gradient(#3b82f6 0deg 45deg, #10b981 45deg 90deg, #6366f1 90deg 135deg, #f59e0b 135deg 180deg, #ef4444 180deg 225deg, #8b5cf6 225deg 270deg, #ec4899 270deg 315deg, #eab308 315deg 360deg)'
                  }}
                >
                  {/* Merkez Altın Göbek */}
                  <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-yellow-500 via-amber-300 to-yellow-600 border-2 border-white shadow-xl flex items-center justify-center text-xl">
                    👑
                  </div>
                </div>

                {/* Sonuç Rozeti */}
                {wheelResult && (
                  <div className="absolute bottom-3 bg-purple-950/90 border border-purple-400/50 px-4 py-1.5 rounded-full font-mono text-xs font-bold text-yellow-300 animate-bounce shadow-lg">
                    Çark Durdu: {wheelResult} {wheelWinAmount > 0 ? `(+$${wheelWinAmount.toFixed(2)})` : ''}
                  </div>
                )}
              </div>

              {/* Çark Kontrolleri */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-[#0c1020] p-4 rounded-xl border border-purple-500/30 font-mono">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-400">BAHİS:</span>
                  {[5, 10, 20, 50, 100].map(amt => (
                    <button
                      key={amt}
                      disabled={wheelSpinning}
                      onClick={() => setBet(amt)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold ${bet === amt ? 'bg-purple-600 text-white' : 'bg-[#182035] text-gray-300'}`}
                    >
                      ${amt}
                    </button>
                  ))}
                </div>

                <button
                  disabled={wheelSpinning}
                  onClick={spinWheel}
                  className="w-full sm:w-auto px-8 py-3 bg-gradient-to-r from-purple-600 via-pink-600 to-amber-500 hover:scale-105 text-white font-black text-sm rounded-xl shadow-lg active:scale-95 disabled:opacity-50"
                >
                  {wheelSpinning ? 'ÇEVRİLİYOR...' : `🎡 ÇARKI ÇEVİR ($${bet})`}
                </button>
              </div>
            </div>
          )}

          {/* 5. OYUN: COIN FLIP STREAK (SERİ YAZI-TURA) */}
          {activeTab === 'COIN_FLIP_STREAK' && (
            <div className="space-y-4">
              {/* AKILLI YÖNLENDİRİCİ ETİKETLER */}
              <div className="bg-gradient-to-r from-emerald-950/60 via-teal-950/50 to-emerald-950/60 border border-emerald-500/30 rounded-xl p-2.5 flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-emerald-500 text-black font-black text-[10px] uppercase">STRATEJİ</span>
                  <span className="text-gray-300 font-bold">Her Doğru Tahminde Kazanç ~2x Katlanır!</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-teal-500 text-black font-black text-[10px] uppercase animate-pulse">SERİ</span>
                  <span className="text-teal-300 font-bold">{coinStreak} Seri (Mevcut: {getCoinStreakMultiplier(coinStreak)}x)</span>
                </div>
              </div>

              {/* Yazı Tura Görsel Alanı */}
              <div className="relative h-72 sm:h-80 bg-[#060810] border-2 border-emerald-500/40 rounded-2xl flex flex-col items-center justify-center p-4 overflow-hidden shadow-inner space-y-4">
                <div className={`w-32 h-32 rounded-full border-4 border-yellow-400 bg-gradient-to-tr from-amber-600 via-yellow-400 to-amber-500 shadow-[0_0_50px_rgba(245,158,11,0.5)] flex items-center justify-center text-4xl font-black text-black select-none ${
                  coinFlipping ? 'animate-spin' : ''
                }`}>
                  {coinLastSide ? (coinLastSide === 'YAZI' ? '🦅' : '👑') : '🪙'}
                </div>

                <div className="text-center font-mono">
                  <div className="text-sm font-bold text-gray-300">
                    {coinLastSide ? `Gelen: ${coinLastSide}` : 'Yazı mı, Tura mı?'}
                  </div>
                  {coinStreak > 0 && (
                    <div className="text-emerald-400 font-extrabold text-base mt-1 animate-pulse">
                      🔥 {coinStreak} Adım Başarılı! Çarpan: {getCoinStreakMultiplier(coinStreak)}x (Kâr: ${(bet * getCoinStreakMultiplier(coinStreak)).toFixed(2)})
                    </div>
                  )}
                </div>
              </div>

              {/* Yazı Tura Kontrolleri */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-[#0c1020] p-4 rounded-xl border border-emerald-500/30 font-mono">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-400">BAHİS:</span>
                  {[5, 10, 20, 50, 100].map(amt => (
                    <button
                      key={amt}
                      disabled={coinGameActive}
                      onClick={() => setBet(amt)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold ${bet === amt ? 'bg-emerald-600 text-white' : 'bg-[#182035] text-gray-300'}`}
                    >
                      ${amt}
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  {coinGameActive && coinStreak > 0 && (
                    <button
                      onClick={handleCoinCashout}
                      className="px-5 py-3 bg-gradient-to-r from-emerald-500 to-green-600 text-black font-black text-xs rounded-xl shadow-lg active:scale-95 animate-pulse"
                    >
                      💰 KÂRI AL (${(bet * getCoinStreakMultiplier(coinStreak)).toFixed(2)})
                    </button>
                  )}
                  <button
                    disabled={coinFlipping}
                    onClick={() => handleFlipCoin('YAZI')}
                    className="flex-1 sm:flex-none px-6 py-3 bg-[#162035] hover:bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 font-black text-xs rounded-xl transition active:scale-95 disabled:opacity-50"
                  >
                    🦅 YAZI SEÇ
                  </button>
                  <button
                    disabled={coinFlipping}
                    onClick={() => handleFlipCoin('TURA')}
                    className="flex-1 sm:flex-none px-6 py-3 bg-[#162035] hover:bg-amber-950/80 border border-amber-500/50 text-yellow-300 font-black text-xs rounded-xl transition active:scale-95 disabled:opacity-50"
                  >
                    👑 TURA SEÇ
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* OYUNLARIN KAZANMA MANTIĞI & KURALLAR REHBERİ (DETAYLI & NET ANLATIM) */}
          {/* ========================================================================= */}
          <div className="bg-[#080c16] border border-indigo-500/30 rounded-2xl p-4 sm:p-5 font-sans space-y-3 shadow-xl">
            <div className="flex items-center gap-2 text-indigo-400 font-mono font-bold text-xs uppercase tracking-wide">
              <span>📖</span>
              <span>OYUNLARIN KAZANMA MANTIĞI, KURALLAR VE SENARYO REHBERİ</span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 text-xs text-gray-300 font-mono">
              
              <div className="bg-[#0f1524] p-3 rounded-xl border border-rose-500/20 space-y-1">
                <div className="font-bold text-rose-400 flex items-center gap-1.5">
                  <span>🚀</span> Roket Crash Mantığı
                </div>
                <p className="text-[11px] text-gray-400 font-sans leading-relaxed">
                  <strong>Kazanma Şartı:</strong> Roket havalanır ve çarpan (1.00x - 100x+) katlanarak artar. Roket patlamadan önce &quot;Kârı Al&quot; butonuna basarsanız mevcut çarpan hesabınıza geçer. Patlarsa bahis kaybolur.
                </p>
              </div>

              <div className="bg-[#0f1524] p-3 rounded-xl border border-cyan-500/20 space-y-1">
                <div className="font-bold text-cyan-400 flex items-center gap-1.5">
                  <span>💎</span> Elmas Mayın Mantığı
                </div>
                <p className="text-[11px] text-gray-400 font-sans leading-relaxed">
                  <strong>Kazanma Şartı:</strong> 25 kutuda seçtiğiniz kadar bomba gizlidir. Her açtığınız elmas çarpanı katlar. 3, 5, 8 veya 12 adım hedefinizi belirleyip otomatik kâr alabilir veya dilediğiniz an nakite geçebilirsiniz!
                </p>
              </div>

              <div className="bg-[#0f1524] p-3 rounded-xl border border-amber-500/20 space-y-1">
                <div className="font-bold text-amber-400 flex items-center gap-1.5">
                  <span>🟡</span> Plinko Pin Mantığı
                </div>
                <p className="text-[11px] text-gray-400 font-sans leading-relaxed">
                  <strong>Kazanma Şartı:</strong> Bırakılan top çivilerden sekerek alt ceplere düşer. Dıştaki cepler (15x) dev kazanç, ortadaki cepler daha sık düşen düşük çarpanlar verir.
                </p>
              </div>

              <div className="bg-[#0f1524] p-3 rounded-xl border border-purple-500/20 space-y-1">
                <div className="font-bold text-purple-400 flex items-center gap-1.5">
                  <span>🎡</span> Viral Şans Çarkı Mantığı
                </div>
                <p className="text-[11px] text-gray-400 font-sans leading-relaxed">
                  <strong>Kazanma Şartı:</strong> Çarkı çevirin. İbrenin durduğu dilimdeki çarpan (1.5x - 50x Mega Jackpot) doğrudan kasanıza eklenir. Facebook sosyal oyunlarının en popüler mekaniğidir.
                </p>
              </div>

              <div className="bg-[#0f1524] p-3 rounded-xl border border-emerald-500/20 space-y-1">
                <div className="font-bold text-emerald-400 flex items-center gap-1.5">
                  <span>🪙</span> Seri Yazı-Tura Mantığı
                </div>
                <p className="text-[11px] text-gray-400 font-sans leading-relaxed">
                  <strong>Kazanma Şartı:</strong> Yazı veya Tura seçin. Bildikçe seriniz katlanır (2x, 4x, 8x, 15x...). İstediğiniz basamakta &quot;Kârı Al&quot; diyerek paranızı çekebilirsiniz. Yanlış tahminde tur sıfırlanır.
                </p>
              </div>

              <div className="bg-[#0f1524] p-3 rounded-xl border border-yellow-500/20 space-y-1">
                <div className="font-bold text-yellow-400 flex items-center gap-1.5">
                  <span>👑</span> God Mode Garantisi
                </div>
                <p className="text-[11px] text-gray-400 font-sans leading-relaxed">
                  Admin panelinden &quot;%100 Kazanma&quot; açıldığında; Mayınlar asla patlamaz, Roket devasa çarpanlara uçar, Çark 50x Jackpot verir, Yazı-Tura her seçimde kazanır!
                </p>
              </div>

            </div>
          </div>

        </div>

      </div>

      {/* ========================================================================= */}
      {/* CAESARS & MONTE CARLO GRAND WIN CELEBRATION (ALTIN SİKKE & ZAFER EFEKTİ) */}
      {/* ========================================================================= */}
      {winCelebration && (
        <GrandWinCelebration
          isOpen={winCelebration.isOpen}
          amount={winCelebration.amount}
          title={winCelebration.title}
          subtitle="Monaco Kraliyet Arcade Kasasından Bakiyenize Anında Eklendi!"
          onClose={() => setWinCelebration(null)}
        />
      )}

    </div>
  );
}

