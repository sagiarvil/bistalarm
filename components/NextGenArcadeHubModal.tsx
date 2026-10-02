'use client';

import React, { useState, useEffect, useRef } from 'react';
import { UserAccount } from '@/lib/tradingEngine';
import { 
  MiniGameType, 
  generateCrashPoint, 
  generateMinesGrid, 
  getMinesMultiplier, 
  simulatePlinkoPath, 
  PLINKO_MULTIPLIERS 
} from '@/lib/miniGamesEngine';
import { loadCasinoConfig } from '@/lib/monteCarloEngine';

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
    playSound(600, 'sine', 0.3);
  };

  // =========================================================================
  // 2. DIAMOND MINES STATE & LOGIC
  // =========================================================================
  const [minesCount, setMinesCount] = useState<number>(3);
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
    }
  };

  const handleMinesCashout = () => {
    if (!minesActive || diamondsFound === 0) return;
    const mult = getMinesMultiplier(minesCount, diamondsFound);
    const win = Number((bet * mult).toFixed(2));
    onUpdateBalance(account.balance + win);
    setMinesWinAmount(win);
    setMinesActive(false);
    playSound(750, 'sine', 0.4);
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

          {/* Sekmeler - KAYDIRMASIZ TEK EKRAN GRİD */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 bg-[#141a2e] p-1 rounded-xl border border-indigo-500/30 text-xs font-bold w-full sm:w-auto">
            <button
              onClick={() => setActiveTab('CRASH_ROCKET')}
              className={`px-3 py-1.5 rounded-lg transition flex items-center justify-center gap-1 text-center ${
                activeTab === 'CRASH_ROCKET' ? 'bg-gradient-to-r from-rose-600 to-orange-500 text-white shadow' : 'text-gray-400 hover:text-white'
              }`}
            >
              <span>🚀</span> Roket
            </button>
            <button
              onClick={() => setActiveTab('CRYPTO_MINES')}
              className={`px-3 py-1.5 rounded-lg transition flex items-center justify-center gap-1 text-center ${
                activeTab === 'CRYPTO_MINES' ? 'bg-gradient-to-r from-cyan-600 to-blue-500 text-white shadow' : 'text-gray-400 hover:text-white'
              }`}
            >
              <span>💎</span> Mayın
            </button>
            <button
              onClick={() => setActiveTab('PLINKO_PIN')}
              className={`px-3 py-1.5 rounded-lg transition flex items-center justify-center gap-1 text-center ${
                activeTab === 'PLINKO_PIN' ? 'bg-gradient-to-r from-amber-500 to-yellow-400 text-black shadow' : 'text-gray-400 hover:text-white'
              }`}
            >
              <span>🟡</span> Plinko
            </button>
            {onOpenSlotGame && (
              <button
                onClick={() => { onClose(); onOpenSlotGame(); }}
                className="px-3 py-1.5 rounded-lg text-amber-300 hover:text-white transition flex items-center justify-center gap-1 text-center"
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

        </div>

      </div>

    </div>
  );
}
