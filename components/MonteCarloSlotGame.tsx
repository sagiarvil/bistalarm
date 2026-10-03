'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  SLOT_SYMBOLS, 
  executeSlotSpin, 
  loadCasinoConfig, 
  SpinResult, 
  SlotSymbol 
} from '@/lib/monteCarloEngine';
import { MONTE_CARLO_VIP_MOCK_FEED } from '@/lib/monteCarloGrandKernel';
import { UserAccount } from '@/lib/tradingEngine';
import GrandWinCelebration from '@/components/GrandWinCelebration';


interface MonteCarloSlotGameProps {
  account: UserAccount;
  onUpdateBalance: (newBalance: number) => void;
  onClose: () => void;
  onBackToMonteCarlo?: () => void;
  onOpenTacticsGuide?: () => void;
}

export default function MonteCarloSlotGame({
  account,
  onUpdateBalance,
  onClose,
  onBackToMonteCarlo,
  onOpenTacticsGuide
}: MonteCarloSlotGameProps) {
  const [bet, setBet] = useState<number>(20);
  const [isSpinning, setIsSpinning] = useState<boolean>(false);
  const [autoSpin, setAutoSpin] = useState<boolean>(false);
  const [lastWin, setLastWin] = useState<number>(0);
  const [lastMultiplier, setLastMultiplier] = useState<number>(0);
  const [showMegaWin, setShowMegaWin] = useState<boolean>(false);
  const [winCelebration, setWinCelebration] = useState<{ isOpen: boolean; amount: number; title: string } | null>(null);
  const [auditInfo, setAuditInfo] = useState<{ serverSeed: string; clientSeed: string; nonce: number } | null>(null);

  const [rulesOpen, setRulesOpen] = useState<boolean>(false);
  const [vipFeedIdx, setVipFeedIdx] = useState<number>(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setVipFeedIdx(prev => (prev + 1) % MONTE_CARLO_VIP_MOCK_FEED.length);
    }, 4500);
    return () => clearInterval(timer);
  }, []);

  // 5 makara x 3 satır başlangıç matrisi
  const [reels, setReels] = useState<string[][]>([
    ['scorching_seven', 'wild', 'diamond'],
    ['wild', 'diamond', 'scorching_seven'],
    ['diamond', 'scorching_seven', 'wild']
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
        // VIP Palace & Monte Carlo Grand Win Trompet Fanfarı
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(523.25, now); // C5
        osc.frequency.setValueAtTime(659.25, now + 0.15); // E5
        osc.frequency.setValueAtTime(783.99, now + 0.30); // G5
        osc.frequency.setValueAtTime(1046.50, now + 0.45); // C6
        gain.gain.setValueAtTime(0.35, now);
        gain.gain.linearRampToValueAtTime(0.01, now + 1.2);
        osc.start(now);
        osc.stop(now + 1.2);

        // Altın Sikke / Madeni Para Şıkırtısı (Cascading Gold Coins)
        const coinFreqs = [1500, 1800, 2200, 2700, 3100, 1900, 2400, 2800];
        for (let i = 0; i < 14; i++) {
          setTimeout(() => {
            try {
              if (!audioCtxRef.current) return;
              const cCtx = audioCtxRef.current;
              const cNow = cCtx.currentTime;
              const cOsc = cCtx.createOscillator();
              const cGain = cCtx.createGain();
              cOsc.type = 'triangle';
              cOsc.frequency.setValueAtTime(coinFreqs[Math.floor(Math.random() * coinFreqs.length)], cNow);
              cGain.gain.setValueAtTime(0.12, cNow);
              cGain.gain.exponentialRampToValueAtTime(0.001, cNow + 0.05);
              cOsc.connect(cGain);
              cGain.connect(cCtx.destination);
              cOsc.start(cNow);
              cOsc.stop(cNow + 0.05);
            } catch (err) {}
          }, i * 45);
        }
      }
    } catch (e) {}
  };

  // Nöropatik Kalp Atışı Sesi (Lub-Dub Heartbeat)
  const playHeartbeat = () => {
    try {
      if (!audioCtxRef.current) return;
      const ctx = audioCtxRef.current;
      const now = ctx.currentTime;
      
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.frequency.setValueAtTime(65, now);
      gain1.gain.setValueAtTime(0.25, now);
      gain1.gain.exponentialRampToValueAtTime(0.01, now + 0.12);
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start(now);
      osc1.stop(now + 0.12);

      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.frequency.setValueAtTime(50, now + 0.14);
      gain2.gain.setValueAtTime(0.2, now + 0.14);
      gain2.gain.exponentialRampToValueAtTime(0.01, now + 0.28);
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start(now + 0.14);
      osc2.stop(now + 0.28);
    } catch (e) {}
  };

  const [leverPulling, setLeverPulling] = useState<boolean>(false);
  const [stoppingReels, setStoppingReels] = useState<boolean[]>([false, false, false]);
  const [isTensionSpin, setIsTensionSpin] = useState<boolean>(false);

  // Auto-Spin Referansları (Stale Closure ve Kilitlenmeyi Önler)
  const autoSpinRef = useRef<boolean>(false);
  const spinTimerRef = useRef<NodeJS.Timeout | null>(null);
  const stepTimerRefs = useRef<NodeJS.Timeout[]>([]);

  // Temizleme fonksiyonu
  const clearAllSlotTimers = () => {
    if (spinTimerRef.current) clearTimeout(spinTimerRef.current);
    stepTimerRefs.current.forEach(t => clearTimeout(t));
    stepTimerRefs.current = [];
  };

  useEffect(() => {
    return () => clearAllSlotTimers();
  }, []);

  const handleToggleAutoSpin = () => {
    if (autoSpinRef.current) {
      // ANINDA DURDUR
      autoSpinRef.current = false;
      setAutoSpin(false);
      clearAllSlotTimers();
    } else {
      // BAŞLAT
      autoSpinRef.current = true;
      setAutoSpin(true);
      if (!isSpinning) {
        handleSpin();
      }
    }
  };

  const handleSpin = () => {
    if (isSpinning) return;
    if (account.balance < bet) {
      alert(`Yetersiz Bakiye! Bahis: $${bet}, Mevcut Bakiye: $${account.balance.toFixed(2)}`);
      autoSpinRef.current = false;
      setAutoSpin(false);
      clearAllSlotTimers();
      return;
    }

    setIsSpinning(true);
    setLeverPulling(true);
    setIsTensionSpin(false);
    setStoppingReels([false, false, false]);
    setShowMegaWin(false);
    playSound('spin');

    const leverTimer = setTimeout(() => setLeverPulling(false), 300);
    stepTimerRefs.current.push(leverTimer);

    const balanceAfterBet = account.balance - bet;
    onUpdateBalance(balanceAfterBet);

    const result: SpinResult = executeSlotSpin(bet, account.id);

    // 1. Makara Duruşu
    const t1 = setTimeout(() => {
      setReels(prev => [result.grid[0], prev[1], prev[2]]);
      setStoppingReels(prev => [true, false, false]);
      playSound('click');
    }, 450);
    stepTimerRefs.current.push(t1);

    // 2. Makara Duruşu & Gerilim Kontrolü
    const t2 = setTimeout(() => {
      setReels(prev => [result.grid[0], result.grid[1], prev[2]]);
      setStoppingReels(prev => [true, true, false]);
      playSound('click');

      const highSymbols = ['scorching_seven', 'wild', 'diamond', 'seven'];
      const r1Match = result.grid[0].some(s => highSymbols.includes(s));
      const r2Match = result.grid[1].some(s => highSymbols.includes(s));

      if (r1Match && r2Match) {
        setIsTensionSpin(true);
        playHeartbeat();
        const hbTimer = setTimeout(playHeartbeat, 500);
        stepTimerRefs.current.push(hbTimer);
      }
    }, 800);
    stepTimerRefs.current.push(t2);

    // 3. Makara Duruşu
    const t3 = setTimeout(() => {
      setReels(prev => [result.grid[0], result.grid[1], result.grid[2]]);
      setStoppingReels(prev => [true, true, true]);
      playSound('click');
    }, 1150);
    stepTimerRefs.current.push(t3);

    // 4. Makara Duruşu
    const t4 = setTimeout(() => {
      setReels(prev => [result.grid[0], result.grid[1], result.grid[2], result.grid[3], prev[4]]);
      setStoppingReels(prev => [true, true, true, true, false]);
      playSound('click');
    }, 1500);
    stepTimerRefs.current.push(t4);

    // 5. Makara Duruşu
    const t5 = setTimeout(() => {
      setReels(result.grid);
      setStoppingReels([true, true, true, true, true]);
      playSound('click');
      setIsTensionSpin(false);
    }, 1850);
    stepTimerRefs.current.push(t5);

    // Final Sonuç ve Kazanç Bildirimi
    const tFinal = setTimeout(() => {
      setIsSpinning(false);
      setLastWin(result.totalWin);
      setLastMultiplier(result.multiplier);
      setAuditInfo({
        serverSeed: result.serverSeed,
        clientSeed: result.clientSeed,
        nonce: result.nonce
      });

      let nextBalance = balanceAfterBet;
      if (result.totalWin > 0) {
        nextBalance = balanceAfterBet + result.totalWin;
        onUpdateBalance(nextBalance);

        const winTitle = result.isJackpot 
          ? '🌟 ROYAL 777 JACKPOT! 🌟' 
          : result.multiplier >= 10 
          ? '🔥 MEGA VIP KAZANÇ!' 
          : '👑 MONTE CARLO SLOT ZAFERİ!';

        setWinCelebration({ isOpen: true, amount: result.totalWin, title: winTitle });

        if (result.isJackpot || result.multiplier >= 15) {
          setShowMegaWin(true);
          playSound('jackpot');
        } else {
          playSound('win');
        }
      }


      // Güvenli Auto-spin Döngüsü
      if (autoSpinRef.current) {
        if (nextBalance >= bet) {
          spinTimerRef.current = setTimeout(() => {
            if (autoSpinRef.current) {
              handleSpin();
            }
          }, 1200);
        } else {
          autoSpinRef.current = false;
          setAutoSpin(false);
        }
      }
    }, 1800);
    stepTimerRefs.current.push(tFinal);
  };

  const getSymbol = (id: string): SlotSymbol => {
    return SLOT_SYMBOLS.find(s => s.id === id) || SLOT_SYMBOLS[0];
  };

  const cfg = loadCasinoConfig();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-2 sm:p-4 overflow-y-auto select-none">
      
      {/* Oyun Konsolu - Ekrana Tam Dinamik Uyum (Tek Ekran) */}
      <div className="relative w-full h-full sm:w-[98vw] sm:h-[98vh] max-w-none max-h-none bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-[#0a0000] sm:border-[6px] border-yellow-600 sm:rounded-3xl overflow-hidden flex flex-col my-auto shadow-[0_0_80px_rgba(220,38,38,0.4)]">
        <div className="absolute inset-0 bg-gradient-to-b from-red-900/40 via-black/80 to-black/90 pointer-events-none"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-red-600/10 via-transparent to-red-600/10 pointer-events-none"></div>

        
        {/* Üst Bar */}
        <div className="flex items-center justify-between px-3 sm:px-4 py-2 bg-gradient-to-r from-amber-600/20 via-purple-600/20 to-amber-600/20 border-b border-amber-500/30 shrink-0">
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={() => {
                setAutoSpin(false);
                if (onBackToMonteCarlo) {
                  onBackToMonteCarlo();
                } else {
                  onClose();
                }
              }}
              className="px-2.5 py-1 rounded-lg bg-amber-950/60 hover:bg-amber-900 border border-amber-500/40 text-amber-300 hover:text-white font-bold text-xs flex items-center gap-1 transition shadow"
              title="Monte Carlo Salonuna Geri Dön"
            >
              <span>←</span>
              <span>Geri Dön</span>
            </button>

            <div className="w-7 h-7 rounded-lg  flex items-center justify-center text-base shadow animate-pulse">
              🍓
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm sm:text-base font-black text-amber-300 tracking-wider">
                  ÇİLEK & ANANAS VIP SLOTS
                </h2>
                <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/30 hidden sm:inline">
                  RTP %{cfg.rtpPercent}
                </span>
              </div>
              <span className="text-[9px] text-gray-400 font-mono hidden sm:inline">
                Provably Fair SHA-256 Kriptografik Kasa
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onOpenTacticsGuide && (
              <button
                onClick={() => { setAutoSpin(false); onClose(); onOpenTacticsGuide(); }}
                className="px-2.5 sm:px-3 py-1.5 rounded-xl bg-amber-950/60 hover:bg-amber-900 border border-yellow-500/50 text-yellow-300 font-bold text-xs flex items-center gap-1 transition shadow"
              >
                <span>⚡</span> <span className="hidden sm:inline">Taktikler</span>
              </button>
            )}

            <button
              onClick={() => { setAutoSpin(false); onClose(); }}
              className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white/10 hover:bg-white/20 text-gray-300 hover:text-white flex items-center justify-center font-bold text-xs sm:text-sm transition"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Canlı VIP Kazanç Yayını (Monte Carlo Slot Hub) */}
        <div className="bg-[#0b0416] border-b border-amber-500/20 px-3 py-1 flex items-center justify-between text-[10px] font-mono shrink-0">
          <div className="flex items-center gap-2 overflow-hidden">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping shrink-0" />
            <span className="text-yellow-400 font-bold uppercase font-serif shrink-0">
              [{MONTE_CARLO_VIP_MOCK_FEED[vipFeedIdx].salon}]
            </span>
            <span className="text-gray-300 truncate">
              {MONTE_CARLO_VIP_MOCK_FEED[vipFeedIdx].player} — {MONTE_CARLO_VIP_MOCK_FEED[vipFeedIdx].game}
            </span>
            <span className="text-emerald-400 font-black shrink-0">
              +${MONTE_CARLO_VIP_MOCK_FEED[vipFeedIdx].amount.toLocaleString()} ({MONTE_CARLO_VIP_MOCK_FEED[vipFeedIdx].multiplier})
            </span>
          </div>
          <span className="text-gray-500 text-[9px] shrink-0 hidden sm:inline">
            Canlı Casino Yayını
          </span>
        </div>

        {/* Ana Makine Gövdesi - Tek Ekran Dinamik Ölçek */}
        <div className="p-2 sm:p-3 space-y-2 overflow-y-auto flex-1 flex flex-col justify-between">
          
          {/* Kompakt Jackpot & Bakiye Paneli */}
          <div className="bg-gradient-to-r from-rose-900/40 via-amber-900/40 to-purple-900/40 border border-amber-500/40 rounded-xl px-3 py-1.5 flex items-center justify-between text-center font-mono shrink-0 shadow">
            <div className="text-left flex items-center gap-2">
              <span className="text-[9px] text-amber-400 font-bold tracking-widest uppercase">GRAND JACKPOT:</span>
              <span className="text-base sm:text-lg font-black text-white drop-">
                ${(bet * 1000).toLocaleString()}
              </span>
            </div>
            <div className="text-right flex items-center gap-2">
              <span className="text-[9px] text-gray-400 uppercase">BAKİYE:</span>
              <span className="text-sm sm:text-base font-black text-emerald-400">
                ${account.balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
          </div>

          {/* YÖNLENDİRİCİ ADIM ETİKETLERİ & KATLANABİLİR KURALLAR (Sıfır Yer Kaplayan Kompakt Başlık) */}
          <div className="bg-gradient-to-r from-purple-950/80 via-amber-950/50 to-purple-950/80 border border-amber-500/40 rounded-lg px-2.5 py-1 text-[11px] font-mono shrink-0">
            <div 
              onClick={() => setRulesOpen(!rulesOpen)}
              className="flex items-center justify-between cursor-pointer select-none gap-2"
            >
              <div className="flex items-center gap-1.5">
                <span className="px-1.5 py-0.2 rounded bg-amber-500 text-black font-black text-[9px] uppercase tracking-wide">
                  KURALLAR & KAZANÇ
                </span>
                <span className="text-yellow-300 font-bold text-[10px] sm:text-[11px] truncate">
                  20 Hatlı Vegas Slot • Bahis: ${bet}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-yellow-300 font-bold bg-yellow-500/10 px-1.5 py-0.2 rounded border border-yellow-500/30 text-[9px] hidden md:inline">
                  ⚡ 1000x JACKPOT AKTİF!
                </span>
                <span className="text-[9px] text-amber-400 font-bold">
                  {rulesOpen ? '▲ Kapat' : '▼ Detay'}
                </span>
              </div>
            </div>

            {rulesOpen && (
              <div className="text-[10px] text-gray-300 space-y-0.5 border-t border-amber-500/20 pt-1 mt-1 font-sans">
                <p>• <strong>Maliyet & Bakiye Düşümü:</strong> Her çevirmede seçtiğiniz <strong>${bet}</strong> anında bakiyenizden düşer.</p>
                <p>• <strong>Nasıl Kazanılır:</strong> Soldan sağa aynı hizada en az 3 aynı meyve veya vegas sembolü geldiğinde kazanırsınız. ⭐ <strong>Wild</strong> her sembolün yerine geçer!</p>
                <p>• <strong>Ödeme Çarpanları:</strong> 🍓 Çilek: 3x-25x | 🍍 Ananas: 4x-40x | 🍉 Karpuz: 5x-50x | 🥇 Altın: 15x-200x | 💎 Elmas: 25x-500x | 🎰 777: <strong>50x-1000x JACKPOT!</strong></p>
                <p>• <strong>Kazanç Yüklemesi:</strong> Kazandığınız tutar kuruşu kuruşuna anında bakiyenize eklenir ve ekranda altın kutlama patlar.</p>
              </div>
            )}
          </div>

          {/* 3x3 Klasik Vegas Slot (247Games Tarzı) */}
          <div className={`relative bg-[#0284c7] border-4 sm:border-[8px] border-[#0369a1] rounded-lg p-2 sm:p-4 shadow-[inset_0_0_20px_rgba(0,0,0,0.5)] overflow-hidden transition-all duration-300 flex-1 flex flex-col items-center justify-center ${
            isTensionSpin ? 'animate-pulse ring-4 ring-yellow-400' : ''
          }`}>
            
            <div className="flex items-center gap-2 sm:gap-4 w-full max-w-2xl h-full relative z-10 mx-auto">
              {/* 3 Makaralar - Gerçek Mekanik Şerit Akışı (Reel Strip) */}
              <div className="grid grid-cols-3 gap-2 sm:gap-4 flex-1 h-full relative">
                {reels.slice(0,3).map((reel, colIdx) => {
                  const isReelStopped = stoppingReels[colIdx];
                  const isSpinningThis = isSpinning && !isReelStopped;

                  return (
                    <div 
                      key={colIdx} 
                      className={`flex flex-col bg-white border-x-[12px] border-[#171717] rounded-sm relative overflow-hidden shadow-[inset_0_0_30px_rgba(0,0,0,0.4)] transition-all duration-300 ${
                        isSpinningThis ? 'border-[#262626]' : 'border-[#0a0a0a]'
                      }`}
                    >
                      {/* Dönen Şerit */}
                      {isSpinningThis ? (
                        <div className="animate-slot-spinning flex flex-col w-full h-full">
                          {/* Sürekli dönen sembol akış şeridi */}
                          {['double_bar', 'bar', 'bell', 'scorching_seven', 'cherry', 'diamond', 'wild', 'seven', 'double_bar', 'bar', 'bell', 'scorching_seven', 'cherry', 'diamond', 'wild', 'seven'].map((symId, idx) => {
                            const sym = getSymbol(symId);
                            return (
                              <div 
                                key={idx} 
                                className="h-1/3 w-full border-b-2 border-gray-300 flex flex-col items-center justify-center filter blur-[1.5px] scale-[0.98]"
                              >
                                <span className="text-5xl sm:text-7xl filter drop-shadow-[0_4px_6px_rgba(0,0,0,0.5)]">
                                  {sym.icon}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <div className={`flex flex-col w-full h-full justify-around ${isSpinning ? 'animate-slot-stop' : ''}`}>
                          {isSpinning && ['diamond', 'wild', 'scorching_seven'].map((symId, rowIdx) => {
                            const sym = getSymbol(symId);
                            return (
                              <div key={`fake-${rowIdx}`} className="h-1/3 w-full border-b-2 border-gray-300 flex flex-col items-center justify-center filter blur-[2px] opacity-50 hidden sm:flex">
                                <span className="text-5xl sm:text-7xl filter drop-shadow">{sym.icon}</span>
                              </div>
                            );
                          })}
                          {reel.map((symId, rowIdx) => {
                            const sym = getSymbol(symId);
                            return (
                              <div 
                                key={rowIdx} 
                                className="h-1/3 w-full border-b-2 border-gray-300 flex flex-col items-center justify-center relative overflow-hidden transition-all duration-200"
                              >
                                <span className="text-5xl sm:text-7xl filter drop-shadow-[0_4px_10px_rgba(0,0,0,0.6)]">
                                  {sym.icon}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Monte Carlo Altın Mekanik Çekme Kolu (Slot Lever - Kompakt) */}
              <div 
                onClick={handleSpin}
                className="hidden sm:flex flex-col items-center justify-center cursor-pointer group select-none pl-1 shrink-0"
                title="Kolu Çekerek Çevirin!"
              >
                <div className={`w-7 h-7 rounded-full  border-2 border-yellow-200  transition-transform duration-300 ${
                  leverPulling ? 'translate-y-12 scale-90' : 'group-hover:scale-110'
                }`}>
                </div>
                <div className={`w-2.5  rounded-full border border-zinc-600 shadow-inner transition-all duration-300 ${
                  leverPulling ? 'h-8 mt-0.5' : 'h-16'
                }`}>
                </div>
                <div className="w-5 h-5 rounded-md bg-zinc-800 border border-amber-500/60 shadow flex items-center justify-center text-[9px] text-amber-300">
                  ⚙️
                </div>
                <span className="text-[8px] font-serif text-amber-300/80 mt-0.5 uppercase tracking-tighter">
                  KOLU ÇEK
                </span>
              </div>
            </div>

            {/* Mega Win Pop-up Animasyonu */}
            {showMegaWin && (
              <div className="absolute inset-0 z-30 bg-purple-950/90 backdrop-blur-sm flex flex-col items-center justify-center p-4 text-center animate-bounce">
                <span className="text-4xl">🎰 💎 🥇</span>
                <h3 className="text-2xl sm:text-4xl font-black text-amber-300 drop- mt-1">
                  MEGA KAZANÇ!
                </h3>
                <div className="text-xl sm:text-3xl font-black text-emerald-400 font-mono mt-1">
                  +${lastWin.toLocaleString('en-US', { minimumFractionDigits: 2 })} ({lastMultiplier}x)
                </div>
                <button
                  onClick={() => setShowMegaWin(false)}
                  className="mt-3 px-5 py-1.5  text-white font-bold rounded-xl text-xs shadow-lg"
                >
                  Kazanılanı Topla
                </button>
              </div>
            )}

          </div>

          {/* Son Kazanç Bildirim Çubuğu (Kompakt) */}
          <div className="flex items-center justify-between px-3 py-1.5 bg-[#120822] border border-amber-500/30 rounded-lg font-mono text-[11px] shrink-0">
            <div className="flex items-center gap-2">
              <span className="text-gray-400">Son Kazanç:</span>
              <span className={`font-bold text-xs ${lastWin > 0 ? 'text-emerald-400' : 'text-gray-500'}`}>
                ${lastWin.toFixed(2)} {lastMultiplier > 0 && `(${lastMultiplier}x)`}
              </span>
            </div>
            <div className="text-[10px] text-amber-300 font-semibold">
              20 Kazanç Çizgisi Aktif
            </div>
          </div>

          {/* Kontrol Masası (Bahis Seçimi & Çevir Butonları - Kompakt Tek Satır) */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 pt-0.5 shrink-0">
            
            {/* Bahis Miktarı Ayarlayıcı */}
            <div className="flex items-center gap-1.5 w-full sm:w-auto">
              <span className="text-[10px] font-bold text-gray-400 font-mono uppercase">BAHİS:</span>
              <div className="flex items-center gap-1 bg-[#120822] p-0.5 rounded-lg border border-amber-500/30">
                {[5, 10, 20, 50, 100, 250].map((amount) => (
                  <button
                    key={amount}
                    disabled={isSpinning}
                    onClick={() => { playSound('click'); setBet(amount); }}
                    className={`px-2 py-1 rounded text-[11px] font-mono font-bold transition ${
                      bet === amount ? 'bg-amber-500 text-black shadow' : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    ${amount}
                  </button>
                ))}
              </div>
            </div>

            {/* Aksiyon Butonları */}
            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              
              <button
                onClick={handleToggleAutoSpin}
                className={`px-3 py-2 rounded-lg font-extrabold text-[11px] transition border flex items-center gap-1 shadow active:scale-95 ${
                  autoSpin 
                    ? 'bg-rose-600 hover:bg-rose-700 text-white border-rose-400 ring-2 ring-rose-400/50 animate-pulse' 
                    : 'bg-[#1b0f30] text-purple-300 border-purple-500/40 hover:bg-[#251542]'
                }`}
              >
                <span>🔄</span> {autoSpin ? 'DURDUR' : 'Auto-Spin'}
              </button>

              <button
                disabled={isSpinning}
                onClick={handleSpin}
                className="flex-1 sm:flex-none px-6 py-2.5  bg-blue-600 hover:bg-blue-700 text-black font-black text-xs sm:text-sm tracking-wider uppercase rounded-xl transition  active:scale-95 disabled:opacity-50"
              >
                {isSpinning ? 'ÇEVRİLİYOR...' : '🎰 ÇEVİR (SPIN)'}
              </button>

            </div>

          </div>

          {/* Provably Fair Kriptografik Şeffaflık Paneli */}
          {auditInfo && (
            <div className="pt-1 border-t border-white/5 text-[9px] text-gray-500 font-mono flex items-center justify-between shrink-0">
              <span className="truncate">Hash: {auditInfo.serverSeed.slice(0, 16)}...</span>
              <span>Nonce: #{auditInfo.nonce}</span>
            </div>
          )}

        </div>

      </div>

      {/* ========================================================================= */}
      {/* VIP & MONTE CARLO GRAND WIN CELEBRATION OVERLAY (ALTIN SİKKE & FANFAR) */}
      {/* ========================================================================= */}
      {winCelebration && (
        <GrandWinCelebration
          isOpen={winCelebration.isOpen}
          amount={winCelebration.amount}
          title={winCelebration.title}
          subtitle="Monaco Kraliyet Slot Kasasından Bakiyenize Anında Eklendi!"
          onClose={() => setWinCelebration(null)}
        />
      )}

    </div>
  );

}
