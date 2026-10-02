'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  SLOT_SYMBOLS, 
  executeSlotSpin, 
  loadCasinoConfig, 
  SpinResult, 
  SlotSymbol 
} from '@/lib/monteCarloEngine';
import { UserAccount } from '@/lib/tradingEngine';

interface MonteCarloSlotGameProps {
  account: UserAccount;
  onUpdateBalance: (newBalance: number) => void;
  onClose: () => void;
}

export default function MonteCarloSlotGame({
  account,
  onUpdateBalance,
  onClose
}: MonteCarloSlotGameProps) {
  const [bet, setBet] = useState<number>(20);
  const [isSpinning, setIsSpinning] = useState<boolean>(false);
  const [autoSpin, setAutoSpin] = useState<boolean>(false);
  const [lastWin, setLastWin] = useState<number>(0);
  const [lastMultiplier, setLastMultiplier] = useState<number>(0);
  const [showMegaWin, setShowMegaWin] = useState<boolean>(false);
  const [auditInfo, setAuditInfo] = useState<{ serverSeed: string; clientSeed: string; nonce: number } | null>(null);

  // 5 makara x 3 satır başlangıç matrisi
  const [reels, setReels] = useState<string[][]>([
    ['strawberry', 'pineapple', 'seven'],
    ['pineapple', 'diamond', 'watermelon'],
    ['seven', 'wild', 'gold'],
    ['watermelon', 'grapes', 'pineapple'],
    ['gold', 'seven', 'strawberry']
  ]);

  // Ses Sentezleyici (Web Audio API)
  const audioCtxRef = useRef<AudioContext | null>(null);

  const playSound = (type: 'spin' | 'win' | 'jackpot' | 'click') => {
    try {
      if (!audioCtxRef.current) {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioCtx) audioCtxRef.current = new AudioCtx();
      }
      const ctx = audioCtxRef.current;
      if (!ctx || ctx.state === 'suspended') {
        ctx?.resume();
      }
      if (!ctx) return;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      const now = ctx.currentTime;

      if (type === 'click') {
        osc.frequency.setValueAtTime(400, now);
        osc.frequency.exponentialRampToValueAtTime(150, now + 0.05);
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.linearRampToValueAtTime(0.01, now + 0.05);
        osc.start(now);
        osc.stop(now + 0.05);
      } else if (type === 'spin') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(220, now);
        osc.frequency.linearRampToValueAtTime(320, now + 0.1);
        gain.gain.setValueAtTime(0.1, now);
        gain.gain.linearRampToValueAtTime(0.01, now + 0.1);
        osc.start(now);
        osc.stop(now + 0.1);
      } else if (type === 'win') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(523.25, now); // C5
        osc.frequency.setValueAtTime(659.25, now + 0.08); // E5
        osc.frequency.setValueAtTime(783.99, now + 0.16); // G5
        osc.frequency.setValueAtTime(1046.50, now + 0.24); // C6
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.linearRampToValueAtTime(0.01, now + 0.4);
        osc.start(now);
        osc.stop(now + 0.4);
      } else if (type === 'jackpot') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(440, now);
        osc.frequency.exponentialRampToValueAtTime(880, now + 0.3);
        gain.gain.setValueAtTime(0.3, now);
        gain.gain.linearRampToValueAtTime(0.01, now + 0.8);
        osc.start(now);
        osc.stop(now + 0.8);
      }
    } catch (e) {}
  };

  const handleSpin = () => {
    if (isSpinning) return;
    if (account.balance < bet) {
      alert(`Yetersiz Bakiye! Bahis: $${bet}, Mevcut Bakiye: $${account.balance.toFixed(2)}`);
      setAutoSpin(false);
      return;
    }

    setIsSpinning(true);
    setShowMegaWin(false);
    playSound('spin');

    // Bakiyeden bahsi düş
    const balanceAfterBet = account.balance - bet;
    onUpdateBalance(balanceAfterBet);

    // Algoritma hesaplaması
    const result: SpinResult = executeSlotSpin(bet);

    // 1 saniyelik akıcı dönüş efekti
    setTimeout(() => {
      setReels(result.grid);
      setIsSpinning(false);
      setLastWin(result.totalWin);
      setLastMultiplier(result.multiplier);
      setAuditInfo({
        serverSeed: result.serverSeed,
        clientSeed: result.clientSeed,
        nonce: result.nonce
      });

      if (result.totalWin > 0) {
        const finalBalance = balanceAfterBet + result.totalWin;
        onUpdateBalance(finalBalance);

        if (result.isJackpot || result.multiplier >= 15) {
          setShowMegaWin(true);
          playSound('jackpot');
        } else {
          playSound('win');
        }
      }

      // Auto-spin devamı
      if (autoSpin && balanceAfterBet >= bet) {
        setTimeout(handleSpin, 1200);
      } else if (autoSpin) {
        setAutoSpin(false);
      }
    }, 900);
  };

  const getSymbol = (id: string): SlotSymbol => {
    return SLOT_SYMBOLS.find(s => s.id === id) || SLOT_SYMBOLS[0];
  };

  const cfg = loadCasinoConfig();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-3 sm:p-6 overflow-y-auto">
      
      {/* Oyun Konsolu */}
      <div className="relative w-full max-w-4xl bg-gradient-to-b from-[#150d2a] via-[#0d071a] to-[#080410] border-2 border-amber-500/40 rounded-3xl shadow-[0_0_60px_rgba(245,158,11,0.25)] overflow-hidden flex flex-col my-auto">
        
        {/* Üst Bar */}
        <div className="flex items-center justify-between px-5 py-3.5 bg-gradient-to-r from-amber-600/20 via-purple-600/20 to-amber-600/20 border-b border-amber-500/30">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 to-rose-500 flex items-center justify-center text-xl shadow-lg animate-pulse">
              🍓
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black text-amber-300 tracking-wider">
                  MONTE CARLO • ÇİLEK & ANANAS VIP SLOTS
                </h2>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/30">
                  RTP %{cfg.rtpPercent}
                </span>
              </div>
              <span className="text-[10px] text-gray-400 font-mono">
                Provably Fair SHA-256 Kriptografik Kasa Motoru
              </span>
            </div>
          </div>

          <button
            onClick={() => { setAutoSpin(false); onClose(); }}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-gray-300 hover:text-white flex items-center justify-center font-bold text-sm transition"
          >
            ✕
          </button>
        </div>

        {/* Ana Makine Gövdesi */}
        <div className="p-4 sm:p-6 space-y-5">
          
          {/* Jackpot Paneli */}
          <div className="bg-gradient-to-r from-rose-900/40 via-amber-900/40 to-purple-900/40 border border-amber-500/40 rounded-2xl p-3 flex items-center justify-between text-center font-mono">
            <div className="text-left">
              <span className="text-[10px] text-amber-400 font-bold tracking-widest block">GRAND MEGA JACKPOT</span>
              <span className="text-xl sm:text-2xl font-black text-white drop-shadow-[0_0_10px_rgba(245,158,11,0.5)]">
                ${(bet * 1000).toLocaleString()}
              </span>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-gray-400 block">KULLANICI BAKİYESİ</span>
              <span className="text-lg sm:text-xl font-black text-emerald-400">
                ${account.balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
          </div>

          {/* 5x3 Makaralar (Reels Grid) */}
          <div className="relative bg-[#07030e] border-4 border-amber-500/50 rounded-2xl p-3 shadow-inner overflow-hidden">
            
            {/* Arka Plan Neon Çizgiler */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-purple-900/20 via-transparent to-transparent pointer-events-none"></div>

            <div className="grid grid-cols-5 gap-2 sm:gap-3 relative z-10">
              {reels.map((reel, colIdx) => (
                <div 
                  key={colIdx} 
                  className={`flex flex-col gap-2 bg-[#120822] border border-amber-500/20 rounded-xl p-2 transition-all duration-300 ${
                    isSpinning ? 'blur-[1.5px] scale-[0.98]' : 'blur-none scale-100'
                  }`}
                >
                  {reel.map((symId, rowIdx) => {
                    const sym = getSymbol(symId);
                    return (
                      <div 
                        key={rowIdx} 
                        className="h-16 sm:h-20 bg-[#1c0f33] border border-amber-500/20 rounded-lg flex flex-col items-center justify-center p-1 relative overflow-hidden group shadow-md"
                      >
                        <span className="text-3xl sm:text-4xl filter drop-shadow-md transition-transform group-hover:scale-110">
                          {sym.icon}
                        </span>
                        <span className="text-[9px] font-bold text-amber-200/80 font-mono mt-0.5">
                          {sym.name}
                        </span>
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>

            {/* Mega Win Pop-up Animasyonu */}
            {showMegaWin && (
              <div className="absolute inset-0 z-30 bg-purple-950/90 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center animate-bounce">
                <span className="text-5xl">🎰 💎 🥇</span>
                <h3 className="text-3xl sm:text-5xl font-black text-amber-300 drop-shadow-[0_0_20px_rgba(245,158,11,0.8)] mt-2">
                  MEGA KAZANÇ!
                </h3>
                <div className="text-2xl sm:text-4xl font-black text-emerald-400 font-mono mt-1">
                  +${lastWin.toLocaleString('en-US', { minimumFractionDigits: 2 })} ({lastMultiplier}x)
                </div>
                <button
                  onClick={() => setShowMegaWin(false)}
                  className="mt-4 px-6 py-2 bg-gradient-to-r from-amber-500 to-rose-500 text-white font-bold rounded-xl text-xs shadow-lg"
                >
                  Kazanılanı Topla
                </button>
              </div>
            )}

          </div>

          {/* Son Kazanç Bildirim Çubuğu */}
          <div className="flex items-center justify-between px-4 py-2.5 bg-[#120822] border border-amber-500/30 rounded-xl font-mono text-xs">
            <div className="flex items-center gap-2">
              <span className="text-gray-400">Son Kazanç:</span>
              <span className={`font-bold text-sm ${lastWin > 0 ? 'text-emerald-400' : 'text-gray-500'}`}>
                ${lastWin.toFixed(2)} {lastMultiplier > 0 && `(${lastMultiplier}x)`}
              </span>
            </div>
            <div className="text-[11px] text-amber-300 font-semibold">
              20 Kazanç Çizgisi Aktif
            </div>
          </div>

          {/* Kontrol Masası (Bahis Seçimi & Çevir Butonları) */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-1">
            
            {/* Bahis Miktarı Ayarlayıcı */}
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <span className="text-xs font-bold text-gray-400 font-mono uppercase">BAHİS:</span>
              <div className="flex items-center gap-1 bg-[#120822] p-1 rounded-xl border border-amber-500/30">
                {[5, 10, 20, 50, 100, 250].map((amount) => (
                  <button
                    key={amount}
                    disabled={isSpinning}
                    onClick={() => { playSound('click'); setBet(amount); }}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-mono font-bold transition ${
                      bet === amount ? 'bg-amber-500 text-black shadow-md' : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    ${amount}
                  </button>
                ))}
              </div>
            </div>

            {/* Aksiyon Butonları */}
            <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
              
              <button
                disabled={isSpinning}
                onClick={() => setAutoSpin(!autoSpin)}
                className={`px-4 py-3 rounded-xl font-extrabold text-xs transition border flex items-center gap-1.5 ${
                  autoSpin 
                    ? 'bg-rose-600 text-white border-rose-500 animate-pulse' 
                    : 'bg-[#1b0f30] text-purple-300 border-purple-500/40 hover:bg-[#251542]'
                }`}
              >
                <span>🔄</span> {autoSpin ? 'Durdur' : 'Auto-Spin'}
              </button>

              <button
                disabled={isSpinning}
                onClick={handleSpin}
                className="flex-1 sm:flex-none px-8 py-3.5 bg-gradient-to-r from-amber-500 via-rose-500 to-amber-500 hover:from-amber-400 hover:to-rose-400 text-black font-black text-sm tracking-wider uppercase rounded-xl transition shadow-[0_0_30px_rgba(245,158,11,0.5)] active:scale-95 disabled:opacity-50"
              >
                {isSpinning ? 'ÇEVRİLİYOR...' : '🎰 ÇEVİR (SPIN)'}
              </button>

            </div>

          </div>

          {/* Provably Fair Kriptografik Şeffaflık Paneli */}
          {auditInfo && (
            <div className="pt-2 border-t border-white/5 text-[10px] text-gray-500 font-mono space-y-1">
              <div className="flex items-center justify-between">
                <span>Server Seed (Hash): {auditInfo.serverSeed}</span>
                <span>Nonce: #{auditInfo.nonce}</span>
              </div>
              <div>Client Seed: {auditInfo.clientSeed} (SHA-256 Doğrulanabilir)</div>
            </div>
          )}

        </div>

      </div>

    </div>
  );
}
