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
  VOISINS_DU_ZERO,
  TIERS_DU_CYLINDRE,
  ORPHELINS,
  JEU_ZERO,
  MONTE_CARLO_VIP_MOCK_FEED,
  VIPCallout,
  createDeckShoe,
  calculateHandValue,
  PlayingCard,
  playBaccaratRound,
  BaccaratBet,
  BaccaratRoundResult
} from '@/lib/monteCarloGrandKernel';
import { loadCasinoConfig } from '@/lib/monteCarloEngine';

interface MonteCarloGrandCasinoModalProps {
  isOpen: boolean;
  onClose: () => void;
  userBalance: number;
  onUpdateBalance: (newBalance: number) => void;
  onOpenSlots?: () => void;
  onOpenArcade?: () => void;
  onOpenTacticsGuide?: () => void;
}

type CasinoTab = 'ROULETTE' | 'BLACKJACK' | 'BACCARAT';

export default function MonteCarloGrandCasinoModal({
  isOpen,
  onClose,
  userBalance,
  onUpdateBalance,
  onOpenSlots,
  onOpenArcade,
  onOpenTacticsGuide
}: MonteCarloGrandCasinoModalProps) {
  const [activeTab, setActiveTab] = useState<CasinoTab>('ROULETTE');
  const [selectedChip, setSelectedChip] = useState<number>(25);
  const [screenShake, setScreenShake] = useState<boolean>(false);
  const [activeFeedIdx, setActiveFeedIdx] = useState<number>(0);
  const [racetrackOpen, setRacetrackOpen] = useState<boolean>(true);

  // Canlı VIP Ticker Döngüsü (Her 4 saniyede bir Monaco salonlarından akış)
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveFeedIdx(prev => (prev + 1) % MONTE_CARLO_VIP_MOCK_FEED.length);
    }, 4200);
    return () => clearInterval(timer);
  }, []);

  // Web Audio Context (Fildişi top, altın fiş, krupiye tıkırtısı sesleri)
  const audioCtxRef = useRef<AudioContext | null>(null);

  const initAudio = () => {
    if (!audioCtxRef.current && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) audioCtxRef.current = new AudioCtx();
    }
  };

  const playTone = (freq: number, type: OscillatorType = 'sine', duration = 0.1, gainVal = 0.15) => {
    try {
      initAudio();
      if (!audioCtxRef.current) return;
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') ctx.resume();

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gain.gain.setValueAtTime(gainVal, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch (e) {}
  };

  // Gerçekçi Fildişi Top Sekmesi Sentezi (Ivory Ball Bounce)
  const playBallBounceSound = () => {
    playTone(1800 + Math.random() * 400, 'triangle', 0.03, 0.08);
    setTimeout(() => playTone(800 + Math.random() * 200, 'sine', 0.04, 0.06), 20);
  };

  // Ağır Kil Fiş Şıkırtısı (Clay Chip Clink)
  const playChipSound = () => {
    playTone(2400, 'triangle', 0.04, 0.12);
    setTimeout(() => playTone(3100, 'sine', 0.03, 0.08), 25);
    setTimeout(() => playTone(1900, 'triangle', 0.05, 0.05), 45);
  };

  // Kart Çekme / Kayma Sesi (Card Slide)
  const playCardSlideSound = () => {
    playTone(350, 'sawtooth', 0.06, 0.04);
    setTimeout(() => playTone(450, 'sine', 0.04, 0.03), 30);
  };

  // Monte Carlo Kraliyet Zafer Fanfarı
  const playWinFanfare = () => {
    playTone(523.25, 'triangle', 0.18, 0.2); // C5
    setTimeout(() => playTone(659.25, 'triangle', 0.18, 0.2), 120); // E5
    setTimeout(() => playTone(783.99, 'triangle', 0.25, 0.2), 240); // G5
    setTimeout(() => playTone(1046.50, 'triangle', 0.5, 0.25), 380); // C6
  };

  // --------------------------------------------------------------------------
  // 1. MONTE CARLO AVRUPA RULETİ (CANVAS 60FPS FİZİKSEL ÇARK VE FİLDİŞİ TOP)
  // --------------------------------------------------------------------------
  const [rouletteBets, setRouletteBets] = useState<RouletteBet[]>([]);
  const [isSpinningRoulette, setIsSpinningRoulette] = useState(false);
  const [rouletteLastResult, setRouletteLastResult] = useState<RouletteSpinResult | null>(null);
  const [krupiyeCallout, setKrupiyeCallout] = useState<string>('Faites vos jeux! (Bahislerinizi yapın)');
  const [recentRouletteNumbers, setRecentRouletteNumbers] = useState<number[]>([32, 15, 19, 4, 21, 2, 25, 17, 34]);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const wheelAngleRef = useRef(0);
  const ballAngleRef = useRef(0);
  const ballRadiusRef = useRef(95);

  // Canvas Üzerinde 60FPS Gerçekçi Monte Carlo Rulet Çarkı Çizimi
  useEffect(() => {
    let animId: number;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const renderWheel = () => {
      const w = canvas.width;
      const h = canvas.height;
      const cx = w / 2;
      const cy = h / 2;
      const radius = Math.min(cx, cy) - 8;

      ctx.clearRect(0, 0, w, h);

      // 1. Dış Maun Ahşap Halka (Mahogany Rim)
      ctx.save();
      const woodGrad = ctx.createRadialGradient(cx, cy, radius - 25, cx, cy, radius);
      woodGrad.addColorStop(0, '#2d1406');
      woodGrad.addColorStop(0.5, '#4a230c');
      woodGrad.addColorStop(1, '#1a0b03');
      ctx.fillStyle = woodGrad;
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.fill();

      // Altın Yaldızlı Dış Bilezik
      ctx.strokeStyle = '#d4af37';
      ctx.lineWidth = 3;
      ctx.stroke();
      ctx.restore();

      // 2. Sayı Cepleri Halka Grubu
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(wheelAngleRef.current);

      const numCount = ROULETTE_NUMBERS.length;
      const sliceAngle = (Math.PI * 2) / numCount;

      for (let i = 0; i < numCount; i++) {
        const num = ROULETTE_NUMBERS[i];
        const startA = i * sliceAngle;
        const endA = startA + sliceAngle;

        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.arc(0, 0, radius - 15, startA, endA);
        ctx.closePath();

        if (num === 0) {
          ctx.fillStyle = '#0f763e'; // Monaco Zümrüt Yeşili
        } else if (RED_NUMBERS.includes(num)) {
          ctx.fillStyle = '#a81c1c'; // Koyu Bordo Kırmızı
        } else {
          ctx.fillStyle = '#18181b'; // Gece Siyahı
        }
        ctx.fill();

        // Pirinç Ayırıcı Çıtalar (Brass Frets)
        ctx.strokeStyle = '#e6ca65';
        ctx.lineWidth = 1;
        ctx.stroke();

        // Rakamları Çiz
        ctx.save();
        ctx.rotate(startA + sliceAngle / 2);
        ctx.textAlign = 'right';
        ctx.fillStyle = '#fef08a';
        ctx.font = 'bold 9px monospace';
        ctx.fillText(num.toString(), radius - 22, 3);
        ctx.restore();
      }

      // 3. Merkez Pirinç Taret (Brass French Turret)
      const turretGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, radius - 60);
      turretGrad.addColorStop(0, '#fef08a');
      turretGrad.addColorStop(0.4, '#ca8a04');
      turretGrad.addColorStop(0.8, '#854d0e');
      turretGrad.addColorStop(1, '#422006');
      ctx.fillStyle = turretGrad;
      ctx.beginPath();
      ctx.arc(0, 0, radius - 60, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#fef08a';
      ctx.lineWidth = 2;
      ctx.stroke();

      // 4 Kollu Monte Carlo Taret Başlığı
      for (let arm = 0; arm < 4; arm++) {
        ctx.save();
        ctx.rotate((Math.PI / 2) * arm);
        ctx.fillStyle = '#fef08a';
        ctx.beginPath();
        ctx.arc(radius - 75, 0, 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      ctx.restore(); // Çark dönüşünü bitir

      // 4. Fildişi Rulet Topu (Ivory Ball)
      ctx.save();
      ctx.translate(cx, cy);
      const bx = Math.cos(ballAngleRef.current) * ballRadiusRef.current;
      const by = Math.sin(ballAngleRef.current) * ballRadiusRef.current;

      const ballGrad = ctx.createRadialGradient(bx - 1.5, by - 1.5, 1, bx, by, 4.5);
      ballGrad.addColorStop(0, '#ffffff');
      ballGrad.addColorStop(0.6, '#fef3c7');
      ballGrad.addColorStop(1, '#d97706');

      ctx.fillStyle = ballGrad;
      ctx.beginPath();
      ctx.arc(bx, by, 4.5, 0, Math.PI * 2);
      ctx.fill();

      // Topun Altına Gerçekçi Gölge
      ctx.fillStyle = 'rgba(0,0,0,0.45)';
      ctx.beginPath();
      ctx.arc(bx + 2, by + 2, 3.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      animId = requestAnimationFrame(renderWheel);
    };

    renderWheel();
    return () => cancelAnimationFrame(animId);
  }, []);

  const addRouletteBet = (type: RouletteBetType, target?: number) => {
    if (isSpinningRoulette) return;
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
    if (isSpinningRoulette) return;
    playChipSound();
    setRouletteBets([]);
  };

  // Gerçekçi Monte Carlo Rulet Dönüş Sekansı
  const handleSpinRoulette = () => {
    if (rouletteBets.length === 0 || isSpinningRoulette) return;
    const totalBet = rouletteBets.reduce((acc, b) => acc + b.amount, 0);
    if (userBalance < totalBet) return;

    onUpdateBalance(userBalance - totalBet);
    setIsSpinningRoulette(true);
    setRouletteLastResult(null);
    setKrupiyeCallout('Rien ne va plus! (Artık bahis yapılamaz)');

    const result = spinEuropeanRoulette(rouletteBets);

    // Fiziksel Animasyon Değişkenleri
    let wheelSpeed = 0.07;
    let ballSpeed = -0.19;
    let currentRadius = 95;
    ballRadiusRef.current = currentRadius;

    let elapsed = 0;
    const interval = setInterval(() => {
      elapsed += 30;
      wheelAngleRef.current += wheelSpeed;
      ballAngleRef.current += ballSpeed;

      // Hız yavaşlaması
      wheelSpeed *= 0.995;
      ballSpeed *= 0.992;

      // Top hız kaybettikçe dış çeperden ceplere doğru iner
      if (elapsed > 1800 && currentRadius > 62) {
        currentRadius -= 0.6;
        ballRadiusRef.current = currentRadius;
        if (Math.random() < 0.28) playBallBounceSound();
      }

      if (elapsed >= 3600) {
        clearInterval(interval);
        setRouletteLastResult(result);
        setRecentRouletteNumbers(prev => [result.winningNumber, ...prev.slice(0, 8)]);
        setIsSpinningRoulette(false);

        const frColor = result.color === 'green' ? 'Zéro Vert' : result.color === 'red' ? 'Rouge' : 'Noir';
        setKrupiyeCallout(`Numéro ${result.winningNumber}, ${frColor}!`);

        if (result.totalPayout > 0) {
          onUpdateBalance(userBalance - totalBet + result.totalPayout);
          playWinFanfare();
        }
      }
    }, 30);
  };

  // --------------------------------------------------------------------------
  // 2. MONACO VIP BLACKJACK 21 (ÇUHA MASA & AYAKKABI SLIDE SESLERİ)
  // --------------------------------------------------------------------------
  const [bjShoe, setBjShoe] = useState<PlayingCard[]>([]);
  const [bjPlayerCards, setBjPlayerCards] = useState<PlayingCard[]>([]);
  const [bjDealerCards, setBjDealerCards] = useState<PlayingCard[]>([]);
  const [bjBet, setBjBet] = useState<number>(50);
  const [bjGameStage, setBjGameStage] = useState<'BETTING' | 'PLAYER_TURN' | 'ROUND_OVER'>('BETTING');
  const [bjMessage, setBjMessage] = useState<string>('Placer vos mises (Bahsinizi koyun).');

  const startBlackjackRound = () => {
    if (userBalance < bjBet || bjGameStage === 'PLAYER_TURN') return;
    playChipSound();
    playCardSlideSound();
    onUpdateBalance(userBalance - bjBet);
    let shoe = bjShoe;
    if (shoe.length < 20) shoe = createDeckShoe(6);

    let p1 = shoe.pop()!;
    let d1 = shoe.pop()!;
    let p2 = shoe.pop()!;
    let d2 = shoe.pop()!;

    // %100 KAZANMA MODU (GOD_WIN_100): Oyuncuya Kesin Doğal Blackjack (As + Papaz)
    const cfg = loadCasinoConfig();
    if (cfg.penetrationMode === 'GOD_WIN_100') {
      p1 = { suit: '♠', rank: 'A', value: 11 };
      p2 = { suit: '♥', rank: 'K', value: 10 };
      d1 = { suit: '♦', rank: '8', value: 8 };
      d2 = { suit: '♣', rank: '9', value: 9 };
    }

    setBjShoe([...shoe]);
    setBjPlayerCards([p1, p2]);
    setBjDealerCards([d1]); // 2. kart kapalı

    const pVal = calculateHandValue([p1, p2]);
    const dVal = calculateHandValue([d1, d2]);

    if (pVal.isBlackjack) {
      setBjDealerCards([d1, d2]);
      if (dVal.isBlackjack) {
        setBjMessage('🤝 Egalité (Push)! Her iki tarafta da Doğal Blackjack.');
        onUpdateBalance(userBalance);
      } else {
        setBjMessage('🔥 BLACKJACK NATUREL! 3:2 Oranında Kazandınız!');
        onUpdateBalance(userBalance - bjBet + (bjBet * 2.5));
        playWinFanfare();
      }
      setBjGameStage('ROUND_OVER');
    } else {
      setBjGameStage('PLAYER_TURN');
      setBjMessage('Sıra Sizde: Carte (Hit) veya Reste (Stand).');
    }
  };

  const handleBjHit = () => {
    if (bjGameStage !== 'PLAYER_TURN') return;
    playCardSlideSound();

    const shoe = [...bjShoe];
    const card = shoe.pop()!;
    const newCards = [...bjPlayerCards, card];
    setBjShoe(shoe);
    setBjPlayerCards(newCards);

    const val = calculateHandValue(newCards);
    if (val.isBust) {
      setBjMessage('💥 BRÛLÉ (Bust)! 21\'i aştınız, kasa kazandı.');
      setBjGameStage('ROUND_OVER');
    }
  };

  const handleBjStand = () => {
    if (bjGameStage !== 'PLAYER_TURN') return;
    playCardSlideSound();

    const shoe = [...bjShoe];
    let dealer = [...bjDealerCards];

    if (dealer.length === 1) {
      dealer.push(shoe.pop()!);
    }

    while (calculateHandValue(dealer).total < 17) {
      dealer.push(shoe.pop()!);
    }

    setBjDealerCards(dealer);
    setBjShoe(shoe);

    const pVal = calculateHandValue(bjPlayerCards);
    const dVal = calculateHandValue(dealer);

    if (dVal.isBust) {
      setBjMessage('🎉 La Banque a brûlé (Krupiye battı)! Kazandınız (1:1).');
      onUpdateBalance(userBalance + (bjBet * 2));
      playWinFanfare();
    } else if (pVal.total > dVal.total) {
      setBjMessage(`🎉 Victoire! Eliniz: ${pVal.total} vs Kasa: ${dVal.total}`);
      onUpdateBalance(userBalance + (bjBet * 2));
      playWinFanfare();
    } else if (dVal.total > pVal.total) {
      setBjMessage(`❌ La Banque gagne! Kasa: ${dVal.total} vs Eliniz: ${pVal.total}`);
    } else {
      setBjMessage(`🤝 Egalité (Push)! Berabere: ${pVal.total}`);
      onUpdateBalance(userBalance);
    }

    setBjGameStage('ROUND_OVER');
  };

  // --------------------------------------------------------------------------
  // 3. BACCARAT PUNTO BANCO (MONTE CARLO HIGH ROLLER)
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
    playCardSlideSound();
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
    }, 1400);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/92 backdrop-blur-md p-2 sm:p-3 overflow-y-auto animate-fadeIn select-none">
      
      {/* Monte Carlo Salle Garnier Ana Muhafaza Kutusu - Ekrana Tam Dinamik Uyum */}
      <div className={`relative w-full max-w-5xl max-h-[94vh] bg-gradient-to-b from-[#1b1008] via-[#0d1e12] to-[#051109] border-4 border-[#d4af37] rounded-2xl sm:rounded-3xl shadow-[0_0_80px_rgba(212,175,55,0.4)] overflow-hidden flex flex-col my-auto text-white transition-transform duration-200 ${
        screenShake ? 'scale-[1.01] translate-y-[-2px] ring-4 ring-yellow-400' : ''
      }`}>
        
        {/* Lüks Maun Ağacı ve Altın Barok Başlık */}
        <div className="relative bg-gradient-to-r from-[#2a1408] via-[#4a240c] to-[#2a1408] border-b-2 border-[#d4af37] p-3 sm:p-4 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-3 py-1.5 bg-[#3d1a0b] hover:bg-[#5a250e] border border-[#d4af37] text-yellow-300 hover:text-white rounded-xl text-xs font-bold font-serif transition flex items-center gap-1.5 shadow"
              title="Salondan Çıkış Yap"
            >
              <span>←</span>
              <span>Geri Dön</span>
            </button>

            <div className="w-10 h-10 rounded-full border-2 border-[#d4af37] bg-gradient-to-tr from-amber-700 to-yellow-300 flex items-center justify-center shadow-lg">
              <span className="text-xl">⚜️</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-xl font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 via-amber-300 to-yellow-100 font-serif">
                  CASINO DE MONTE-CARLO
                </h1>
                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-amber-500/20 text-yellow-300 border border-yellow-400/50 uppercase tracking-widest font-mono hidden sm:inline">
                  Monaco
                </span>
              </div>
              <p className="text-[11px] text-amber-200/80 font-serif italic hidden sm:block">
                Salle Médecin & Salle Garnier VIP • Hautes Mises
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="bg-[#062414] border-2 border-[#d4af37]/60 px-3 py-1.5 rounded-xl text-right font-mono shadow-inner">
              <span className="text-[9px] text-amber-300/80 block uppercase tracking-wider">Crédit VIP</span>
              <span className="text-sm sm:text-base font-black text-emerald-300">
                ${userBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>

            <button 
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-[#3d1a0b] hover:bg-rose-900 border border-[#d4af37] text-amber-200 flex items-center justify-center font-bold text-sm transition shadow"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Canlı VIP Salon Akışı */}
        <div className="bg-gradient-to-r from-[#140b05] via-[#241306] to-[#140b05] border-b border-[#d4af37]/30 px-3 py-1 flex items-center justify-between text-[10px] font-mono shrink-0">
          <div className="flex items-center gap-2 overflow-hidden">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping shrink-0" />
            <span className="text-yellow-400 font-bold uppercase shrink-0 font-serif">
              [{MONTE_CARLO_VIP_MOCK_FEED[activeFeedIdx].salon}]
            </span>
            <span className="text-gray-300 truncate">
              {MONTE_CARLO_VIP_MOCK_FEED[activeFeedIdx].player} — {MONTE_CARLO_VIP_MOCK_FEED[activeFeedIdx].game}
            </span>
            <span className="text-emerald-400 font-black shrink-0">
              +${MONTE_CARLO_VIP_MOCK_FEED[activeFeedIdx].amount.toLocaleString()} ({MONTE_CARLO_VIP_MOCK_FEED[activeFeedIdx].multiplier})
            </span>
          </div>
          <span className="text-gray-500 text-[9px] shrink-0 hidden sm:inline">
            Canlı Monaco Yayını
          </span>
        </div>

        {/* Oyun Seçim Menüsü - KAYDIRMASIZ TEK EKRAN GRİD (6'LI DİNAMİK BUTONLAR) */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 border-b border-[#d4af37]/40 bg-[#071b10] p-1.5 gap-1.5 text-xs font-serif shrink-0">
          <button
            onClick={() => setActiveTab('ROULETTE')}
            className={`px-2 py-2 rounded-lg font-bold transition flex items-center justify-center gap-1.5 text-center tracking-wide ${
              activeTab === 'ROULETTE'
                ? 'bg-gradient-to-t from-[#0e3b22] to-[#165a34] text-yellow-300 border border-[#d4af37] shadow-[0_0_10px_rgba(212,175,55,0.3)]'
                : 'text-gray-400 hover:text-amber-200 bg-[#05140b]'
            }`}
          >
            <span>🎡</span> Rulet (Tek 0)
          </button>

          <button
            onClick={() => setActiveTab('BLACKJACK')}
            className={`px-2 py-2 rounded-lg font-bold transition flex items-center justify-center gap-1.5 text-center tracking-wide ${
              activeTab === 'BLACKJACK'
                ? 'bg-gradient-to-t from-[#0e3b22] to-[#165a34] text-yellow-300 border border-[#d4af37] shadow-[0_0_10px_rgba(212,175,55,0.3)]'
                : 'text-gray-400 hover:text-amber-200 bg-[#05140b]'
            }`}
          >
            <span>♠️</span> Blackjack 21
          </button>

          <button
            onClick={() => setActiveTab('BACCARAT')}
            className={`px-2 py-2 rounded-lg font-bold transition flex items-center justify-center gap-1.5 text-center tracking-wide ${
              activeTab === 'BACCARAT'
                ? 'bg-gradient-to-t from-[#0e3b22] to-[#165a34] text-yellow-300 border border-[#d4af37] shadow-[0_0_10px_rgba(212,175,55,0.3)]'
                : 'text-gray-400 hover:text-amber-200 bg-[#05140b]'
            }`}
          >
            <span>👑</span> Baccarat Banco
          </button>

          {onOpenTacticsGuide && (
            <button
              onClick={() => { onClose(); onOpenTacticsGuide(); }}
              className="px-2 py-2 rounded-lg font-bold transition flex items-center justify-center gap-1 text-yellow-300 hover:text-yellow-100 hover:bg-yellow-500/20 border border-yellow-500/40 bg-yellow-950/40 text-center"
            >
              <span>⚡</span> Taktik Manifestosu
            </button>
          )}

          {onOpenSlots && (
            <button
              onClick={() => { onClose(); onOpenSlots(); }}
              className="px-2 py-2 rounded-lg font-bold transition flex items-center justify-center gap-1 text-amber-400 hover:text-amber-200 hover:bg-amber-500/10 border border-amber-500/30 bg-[#05140b] text-center"
            >
              <span>🍓</span> Vegas Slots
            </button>
          )}

          {onOpenArcade && (
            <button
              onClick={() => { onClose(); onOpenArcade(); }}
              className="px-2 py-2 rounded-lg font-bold transition flex items-center justify-center gap-1 text-cyan-400 hover:text-cyan-200 hover:bg-cyan-500/10 border border-cyan-500/30 bg-[#05140b] text-center"
            >
              <span>🎮</span> Nova Arcade
            </button>
          )}
        </div>

        {/* İÇ OYUN ALANI - DİKEYDE SERBEST KAYDIRILABİLİR (FLEX-1 OVERFLOW-Y-AUTO) */}
        <div className="flex-1 overflow-y-auto">

        {/* ================================================================== */}
        {/* 1. SEKME: MONTE CARLO AVRUPA RULETİ (CANVAS ÇARK & FİLDİŞİ TOP) */}
        {/* ================================================================== */}
        {activeTab === 'ROULETTE' && (
          <div className="p-4 sm:p-6 space-y-5 bg-[#051c0f]">
            
            {/* AKILLI YÖNLENDİRİCİ ADIM ETİKETLERİ */}
            <div className="bg-gradient-to-r from-yellow-950/60 via-amber-950/40 to-yellow-950/60 border border-[#d4af37]/40 rounded-xl p-2.5 flex flex-wrap items-center justify-between gap-2 text-xs font-serif">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded bg-yellow-500 text-black font-black text-[10px] uppercase font-mono">1. ADIM</span>
                <span className="text-gray-300 font-bold">Fiş Değerini Seç ($25 - $1000)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded bg-emerald-500 text-black font-black text-[10px] uppercase font-mono animate-pulse">2. ADIM</span>
                <span className="text-emerald-300 font-bold">Numaraya / Renge Tıkla & ÇEVİR!</span>
              </div>
              <span className="text-yellow-300 font-bold bg-yellow-500/10 px-2 py-0.5 rounded border border-yellow-500/30">
                🔥 Sıcak Sayılar: 17 Siyah (36x), 7 Kırmızı, 0 Yeşil
              </span>
            </div>

            {/* Canlı Çark ve Krupiye Sahnesi */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-center bg-[#072415] border-2 border-[#d4af37]/40 rounded-2xl p-4 shadow-[inset_0_0_30px_rgba(0,0,0,0.5)]">
              
              {/* Sol: 60FPS Fiziksel Rulet Çarkı */}
              <div className="lg:col-span-4 flex flex-col items-center justify-center">
                <canvas 
                  ref={canvasRef} 
                  width={220} 
                  height={220} 
                  className="rounded-full shadow-[0_0_25px_rgba(212,175,55,0.4)] border-2 border-[#d4af37]"
                />
              </div>

              {/* Orta: Krupiye Anonsu & Kazanan Numara */}
              <div className="lg:col-span-4 text-center space-y-3">
                <div className="inline-block px-4 py-1.5 rounded-full bg-black/60 border border-[#d4af37]/40 text-xs font-serif text-yellow-300 tracking-wider">
                  🗣️ {krupiyeCallout}
                </div>

                <div className="flex items-center justify-center pt-1">
                  {rouletteLastResult ? (
                    <div className={`w-20 h-20 rounded-2xl flex flex-col items-center justify-center text-3xl font-black border-2 shadow-2xl animate-bounce ${
                      rouletteLastResult.color === 'green'
                        ? 'bg-emerald-700 border-emerald-400 text-white shadow-emerald-500/50'
                        : rouletteLastResult.color === 'red'
                        ? 'bg-rose-700 border-rose-400 text-white shadow-rose-500/50'
                        : 'bg-zinc-950 border-zinc-600 text-white shadow-zinc-500/50'
                    }`}>
                      <span>{rouletteLastResult.winningNumber}</span>
                      <span className="text-[10px] uppercase font-mono tracking-wider">{rouletteLastResult.color}</span>
                    </div>
                  ) : (
                    <div className="w-20 h-20 rounded-2xl bg-[#03140a] border border-[#d4af37]/30 flex items-center justify-center text-amber-400/50 text-3xl font-serif">
                      ⚜️
                    </div>
                  )}
                </div>

                {rouletteLastResult && (
                  <div className={`text-sm font-bold font-mono ${rouletteLastResult.netWin > 0 ? 'text-emerald-400' : 'text-gray-400'}`}>
                    {rouletteLastResult.netWin > 0 
                      ? `🎉 KAZANDINIZ: +$${rouletteLastResult.totalPayout.toFixed(2)}` 
                      : 'La Banque prend tout (Kasa kazandı).'}
                  </div>
                )}

                {/* Son Çıkan Numaralar */}
                <div>
                  <span className="text-[10px] text-gray-400 block mb-1 font-mono uppercase tracking-wider">Derniers Numéros:</span>
                  <div className="flex items-center justify-center gap-1.5 flex-wrap">
                    {recentRouletteNumbers.map((num, i) => (
                      <span 
                        key={i}
                        className={`w-6 h-6 rounded-md flex items-center justify-center text-[10px] font-mono font-bold ${
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
              <div className="lg:col-span-4 flex flex-col justify-center gap-3 bg-[#03140a] p-4 rounded-xl border border-[#d4af37]/30">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-gray-400">Toplam Bahis:</span>
                  <span className="font-bold text-yellow-300">
                    ${rouletteBets.reduce((a, b) => a + b.amount, 0)}
                  </span>
                </div>
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-gray-400">Aktif Pozisyon:</span>
                  <span className="text-gray-200">{rouletteBets.length} Bahis</span>
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    onClick={clearRouletteBets}
                    disabled={isSpinningRoulette || rouletteBets.length === 0}
                    className="flex-1 py-3 rounded-lg bg-zinc-800 hover:bg-zinc-700 border border-zinc-600 text-xs font-bold text-gray-300 disabled:opacity-40"
                  >
                    Effacer (Temizle)
                  </button>
                  <button
                    onClick={handleSpinRoulette}
                    disabled={isSpinningRoulette || rouletteBets.length === 0}
                    className="flex-2 py-3 px-6 rounded-lg bg-gradient-to-r from-yellow-500 via-amber-500 to-yellow-600 hover:from-yellow-400 hover:to-amber-400 text-black font-black text-sm uppercase tracking-wider shadow-[0_0_20px_rgba(212,175,55,0.4)] disabled:opacity-40 font-serif"
                  >
                    {isSpinningRoulette ? 'TOURNER...' : 'TOURNER LA ROUE'}
                  </button>
                </div>
              </div>

            </div>

            {/* Ağır Kil Fişler (Monaco Heavy Clay Chips) */}
            <div className="flex items-center justify-center gap-3 flex-wrap bg-[#051a0f] p-3 rounded-xl border border-[#d4af37]/30">
              <span className="text-xs font-serif text-yellow-300 tracking-wider">JETON CHOISIR (FİŞ SEÇİN):</span>
              {[5, 25, 100, 500, 1000].map(val => (
                <button
                  key={val}
                  onClick={() => { playChipSound(); setSelectedChip(val); }}
                  className={`w-12 h-12 rounded-full font-mono font-black text-xs border-2 shadow-2xl transition transform hover:scale-110 flex items-center justify-center ${
                    selectedChip === val 
                      ? 'border-yellow-200 scale-110 ring-4 ring-yellow-400/60 shadow-[0_0_20px_rgba(254,240,138,0.7)]' 
                      : 'border-zinc-700 opacity-85'
                  } ${
                    val === 5 ? 'bg-gradient-to-tr from-red-900 to-rose-700 text-white' :
                    val === 25 ? 'bg-gradient-to-tr from-emerald-900 to-green-700 text-white' :
                    val === 100 ? 'bg-gradient-to-tr from-zinc-950 to-zinc-800 text-yellow-300 border-yellow-500' :
                    val === 500 ? 'bg-gradient-to-tr from-purple-950 to-indigo-800 text-white' : 'bg-gradient-to-tr from-amber-600 to-yellow-300 text-black font-black'
                  }`}
                >
                  ${val}
                </button>
              ))}
            </div>

            {/* Fransız Rulet Yarış Pisti (Racetrack Call Bets) */}
            <div className="bg-[#041a0e] border-2 border-[#d4af37]/50 rounded-2xl p-3 shadow-inner">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-serif font-black text-yellow-300 uppercase tracking-widest flex items-center gap-1.5">
                  <span>🏁</span> PISTE DE COURSE MONACO (FRENCH RACETRACK CALL BETS)
                </span>
                <span className="text-[10px] text-gray-400 font-mono">
                  Sektör Bahisleri (Tek Tıkla Tüm Komşuları Kapsa)
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <button
                  onClick={() => addRouletteBet('JEU_ZERO')}
                  className="py-2.5 px-3 rounded-xl bg-gradient-to-b from-[#0e4226] to-[#072415] hover:from-[#145733] hover:to-[#0c3922] border border-[#d4af37]/60 text-left transition group shadow-md"
                >
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-serif font-black text-yellow-300">JEU ZÉRO</span>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-500/20 text-yellow-300 border border-amber-500/40 font-bold">5.25x</span>
                  </div>
                  <div className="text-[9px] text-gray-300 font-mono mt-1">7 Sayı (0, 3, 12, 15, 26, 32, 35)</div>
                </button>

                <button
                  onClick={() => addRouletteBet('VOISINS')}
                  className="py-2.5 px-3 rounded-xl bg-gradient-to-b from-[#0e4226] to-[#072415] hover:from-[#145733] hover:to-[#0c3922] border border-[#d4af37]/60 text-left transition group shadow-md"
                >
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-serif font-black text-yellow-300">VOISINS DU ZÉRO</span>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-500/20 text-yellow-300 border border-amber-500/40 font-bold">2.15x</span>
                  </div>
                  <div className="text-[9px] text-gray-300 font-mono mt-1">17 Sayı (Sıfırın tüm komşuları)</div>
                </button>

                <button
                  onClick={() => addRouletteBet('ORPHELINS')}
                  className="py-2.5 px-3 rounded-xl bg-gradient-to-b from-[#0e4226] to-[#072415] hover:from-[#145733] hover:to-[#0c3922] border border-[#d4af37]/60 text-left transition group shadow-md"
                >
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-serif font-black text-yellow-300">ORPHELINS</span>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-500/20 text-yellow-300 border border-amber-500/40 font-bold">4.60x</span>
                  </div>
                  <div className="text-[9px] text-gray-300 font-mono mt-1">8 Yetim Sayı (1, 6, 9, 14, 17, 20, 31, 34)</div>
                </button>

                <button
                  onClick={() => addRouletteBet('TIERS')}
                  className="py-2.5 px-3 rounded-xl bg-gradient-to-b from-[#0e4226] to-[#072415] hover:from-[#145733] hover:to-[#0c3922] border border-[#d4af37]/60 text-left transition group shadow-md"
                >
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-serif font-black text-yellow-300">TIERS DU CYLINDRE</span>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-500/20 text-yellow-300 border border-amber-500/40 font-bold">3.05x</span>
                  </div>
                  <div className="text-[9px] text-gray-300 font-mono mt-1">12 Sayı (Silindirin Karşı 1/3'ü)</div>
                </button>
              </div>
            </div>

            {/* Fransız Çuha Rulet Masası (French Layout) */}
            <div className="bg-[#09351e] border-4 border-[#d4af37]/60 rounded-2xl p-4 shadow-2xl space-y-3">
              
              {/* Dış Bahisler (Kırmızı, Siyah, Çift, Tek) */}
              <div className="grid grid-cols-6 gap-2 text-xs font-bold font-serif">
                <button 
                  onClick={() => addRouletteBet('LOW')}
                  className="py-3 bg-[#062414] hover:bg-[#0c4426] border border-[#d4af37]/40 rounded-lg text-amber-200 transition"
                >
                  MANQUE (1-18)
                </button>
                <button 
                  onClick={() => addRouletteBet('EVEN')}
                  className="py-3 bg-[#062414] hover:bg-[#0c4426] border border-[#d4af37]/40 rounded-lg text-amber-200 transition"
                >
                  PAIR (ÇİFT)
                </button>
                <button 
                  onClick={() => addRouletteBet('RED')}
                  className="py-3 bg-gradient-to-r from-rose-800 to-red-700 hover:from-rose-700 hover:to-red-600 border border-rose-400 rounded-lg text-white shadow-lg transition"
                >
                  ROUGE (KIRMIZI)
                </button>
                <button 
                  onClick={() => addRouletteBet('BLACK')}
                  className="py-3 bg-gradient-to-r from-zinc-950 to-zinc-900 hover:from-zinc-900 hover:to-zinc-800 border border-zinc-600 rounded-lg text-white shadow-lg transition"
                >
                  NOIR (SİYAH)
                </button>
                <button 
                  onClick={() => addRouletteBet('ODD')}
                  className="py-3 bg-[#062414] hover:bg-[#0c4426] border border-[#d4af37]/40 rounded-lg text-amber-200 transition"
                >
                  IMPAIR (TEK)
                </button>
                <button 
                  onClick={() => addRouletteBet('HIGH')}
                  className="py-3 bg-[#062414] hover:bg-[#0c4426] border border-[#d4af37]/40 rounded-lg text-amber-200 transition"
                >
                  PASSE (19-36)
                </button>
              </div>

              {/* Düzineler (Douzaines) */}
              <div className="grid grid-cols-3 gap-2 text-xs font-bold font-serif">
                <button 
                  onClick={() => addRouletteBet('DOZEN_1')}
                  className="py-2.5 bg-[#062414] hover:bg-[#0c4426] border border-[#d4af37]/40 rounded-lg text-yellow-300 transition"
                >
                  1ère 12 (1 - 12) [2:1]
                </button>
                <button 
                  onClick={() => addRouletteBet('DOZEN_2')}
                  className="py-2.5 bg-[#062414] hover:bg-[#0c4426] border border-[#d4af37]/40 rounded-lg text-yellow-300 transition"
                >
                  2ème 12 (13 - 24) [2:1]
                </button>
                <button 
                  onClick={() => addRouletteBet('DOZEN_3')}
                  className="py-2.5 bg-[#062414] hover:bg-[#0c4426] border border-[#d4af37]/40 rounded-lg text-yellow-300 transition"
                >
                  3ème 12 (25 - 36) [2:1]
                </button>
              </div>

              {/* 0 ve 1-36 Rakam Izgarası */}
              <div className="flex gap-2">
                <button
                  onClick={() => addRouletteBet('STRAIGHT', 0)}
                  className="w-14 rounded-lg bg-gradient-to-b from-emerald-700 to-emerald-900 hover:from-emerald-600 hover:to-emerald-800 border-2 border-emerald-400 font-bold text-xl flex items-center justify-center shadow-lg"
                >
                  0
                </button>

                <div className="grid grid-cols-12 gap-1.5 flex-1 font-mono text-xs font-bold">
                  {Array.from({ length: 36 }, (_, i) => i + 1).map(num => {
                    const isRed = RED_NUMBERS.includes(num);
                    const betOnThis = rouletteBets.find(b => b.type === 'STRAIGHT' && b.target === num);

                    return (
                      <button
                        key={num}
                        onClick={() => addRouletteBet('STRAIGHT', num)}
                        className={`h-10 rounded-md border flex flex-col items-center justify-center transition relative ${
                          isRed 
                            ? 'bg-gradient-to-b from-rose-800 to-rose-950 hover:from-rose-700 border-rose-500 text-white' 
                            : 'bg-gradient-to-b from-zinc-900 to-black hover:from-zinc-800 border-zinc-700 text-white'
                        }`}
                      >
                        <span>{num}</span>
                        {betOnThis && (
                          <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-yellow-400 text-black text-[9px] font-black flex items-center justify-center shadow-md">
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
        {/* 2. SEKME: MONACO VIP BLACKJACK 21 */}
        {/* ================================================================== */}
        {activeTab === 'BLACKJACK' && (
          <div className="p-4 sm:p-6 space-y-6 bg-[#051c0f]">
            
            {/* AKILLI YÖNLENDİRİCİ ADIM ETİKETLERİ */}
            <div className="bg-gradient-to-r from-blue-950/60 via-indigo-950/50 to-blue-950/60 border border-blue-500/40 rounded-xl p-2.5 flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded bg-blue-500 text-white font-black text-[10px] uppercase">HEDEF 21</span>
                <span className="text-gray-300 font-bold">Krupiyeyi Geç, 21'i Aşma! As = 1 veya 11</span>
              </div>
              <span className="text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">
                ⚡ GOD MODE: Oyuncuya Her Elde Doğal Blackjack!
              </span>
            </div>

            <div className="bg-[#09351e] border-4 border-[#d4af37]/60 rounded-2xl p-6 shadow-2xl space-y-6">
              
              {/* Krupiye Alanı */}
              <div className="flex flex-col items-center gap-2">
                <span className="text-xs font-serif text-yellow-300 uppercase tracking-widest">
                  LA BANQUE (DEALER STANDS ON 17)
                </span>
                <div className="flex gap-3 min-h-[105px] items-center">
                  {bjDealerCards.map((card, idx) => (
                    <div 
                      key={idx} 
                      className={`w-16 h-24 rounded-lg bg-white border-2 border-zinc-300 shadow-2xl flex flex-col justify-between p-1.5 font-bold ${
                        ['♥', '♦'].includes(card.suit) ? 'text-rose-600' : 'text-zinc-900'
                      }`}
                    >
                      <div className="text-xs font-mono">{card.rank}{card.suit}</div>
                      <div className="text-center text-2xl">{card.suit}</div>
                      <div className="text-xs font-mono text-right">{card.rank}</div>
                    </div>
                  ))}
                  {bjGameStage === 'PLAYER_TURN' && (
                    <div className="w-16 h-24 rounded-lg bg-gradient-to-br from-blue-950 to-indigo-950 border-2 border-[#d4af37] shadow-2xl flex items-center justify-center text-yellow-300 font-serif text-2xl">
                      ⚜️
                    </div>
                  )}
                </div>
                {bjGameStage === 'ROUND_OVER' && (
                  <span className="text-xs font-mono bg-black/60 px-3 py-1 rounded-full text-yellow-200 border border-[#d4af37]/30">
                    Krupiye: {calculateHandValue(bjDealerCards).total}
                  </span>
                )}
              </div>

              {/* Masa Mesajı */}
              <div className="text-center py-2.5 px-4 rounded-xl bg-black/50 border border-[#d4af37]/40 text-sm font-serif text-yellow-200">
                {bjMessage}
              </div>

              {/* Oyuncu Alanı */}
              <div className="flex flex-col items-center gap-2">
                <div className="flex gap-3 min-h-[105px] items-center">
                  {bjPlayerCards.map((card, idx) => (
                    <div 
                      key={idx} 
                      className={`w-16 h-24 rounded-lg bg-white border-2 border-zinc-300 shadow-2xl flex flex-col justify-between p-1.5 font-bold animate-fadeIn ${
                        ['♥', '♦'].includes(card.suit) ? 'text-rose-600' : 'text-zinc-900'
                      }`}
                    >
                      <div className="text-xs font-mono">{card.rank}{card.suit}</div>
                      <div className="text-center text-2xl">{card.suit}</div>
                      <div className="text-xs font-mono text-right">{card.rank}</div>
                    </div>
                  ))}
                </div>
                {bjPlayerCards.length > 0 && (
                  <span className="text-xs font-mono bg-black/60 px-3 py-1 rounded-full text-emerald-300 font-bold border border-emerald-500/40">
                    Main (Eliniz): {calculateHandValue(bjPlayerCards).total} {calculateHandValue(bjPlayerCards).isSoft ? '(Soft)' : ''}
                  </span>
                )}
                <span className="text-xs font-serif text-yellow-300 uppercase tracking-widest mt-1">
                  JOUEUR VIP (SİZ)
                </span>
              </div>

              {/* Kontroller */}
              <div className="flex flex-wrap items-center justify-center gap-4 pt-4 border-t border-[#d4af37]/30">
                {bjGameStage === 'BETTING' || bjGameStage === 'ROUND_OVER' ? (
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-serif text-gray-300">MISE (BAHİS):</span>
                    {[25, 50, 100, 250, 500].map(val => (
                      <button
                        key={val}
                        onClick={() => { playChipSound(); setBjBet(val); }}
                        className={`px-3 py-1.5 rounded-lg font-mono text-xs font-bold border ${
                          bjBet === val ? 'bg-yellow-400 text-black border-yellow-200 shadow' : 'bg-zinc-800 text-white border-zinc-600'
                        }`}
                      >
                        ${val}
                      </button>
                    ))}
                    <button
                      onClick={startBlackjackRound}
                      disabled={userBalance < bjBet}
                      className="px-8 py-3 rounded-xl bg-gradient-to-r from-yellow-500 via-amber-500 to-yellow-600 text-black font-black text-sm uppercase tracking-wider shadow-lg shadow-amber-500/40 ml-2 font-serif"
                    >
                      DONNER (DEAL)
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-4">
                    <button
                      onClick={handleBjHit}
                      className="px-8 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-sm uppercase tracking-wider shadow-lg shadow-emerald-600/30"
                    >
                      CARTE (HIT)
                    </button>
                    <button
                      onClick={handleBjStand}
                      className="px-8 py-3 rounded-xl bg-rose-700 hover:bg-rose-600 text-white font-black text-sm uppercase tracking-wider shadow-lg shadow-rose-700/30"
                    >
                      RESTE (STAND)
                    </button>
                  </div>
                )}
              </div>

            </div>
          </div>
        )}

        {/* ================================================================== */}
        {/* 3. SEKME: BACCARAT PUNTO BANCO */}
        {/* ================================================================== */}
        {activeTab === 'BACCARAT' && (
          <div className="p-4 sm:p-6 space-y-6 bg-[#051c0f]">
            
            {/* AKILLI YÖNLENDİRİCİ ADIM ETİKETLERİ */}
            <div className="bg-gradient-to-r from-purple-950/60 via-amber-950/50 to-purple-950/60 border border-amber-500/40 rounded-xl p-2.5 flex flex-wrap items-center justify-between gap-2 text-xs font-serif">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded bg-amber-500 text-black font-black text-[10px] uppercase font-mono">PUNTO / BANCO</span>
                <span className="text-gray-300 font-bold">9'a en yakın ele oyna (Oyuncu / Beraberlik / Banker)</span>
              </div>
              <span className="text-yellow-300 font-bold bg-yellow-500/10 px-2 py-0.5 rounded border border-yellow-500/30">
                👑 Salle Médecin Yüksek Bahis Masası
              </span>
            </div>

            <div className="bg-[#09351e] border-4 border-[#d4af37]/60 rounded-2xl p-6 shadow-2xl space-y-6">
              
              {/* Yol Haritası */}
              <div className="flex items-center gap-2 bg-black/50 p-3 rounded-xl border border-[#d4af37]/30 overflow-x-auto text-xs font-mono">
                <span className="text-yellow-300 font-serif mr-2">GRANDE ROUTE:</span>
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

              {/* Masa Düzeni (Punto vs Banco) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* PUNTO */}
                <div className={`p-4 rounded-xl border-2 flex flex-col items-center gap-3 transition ${
                  bacBetSide === 'PLAYER' ? 'border-blue-400 bg-blue-950/40' : 'border-zinc-700 bg-black/40'
                }`}>
                  <span className="font-serif font-black text-blue-400 tracking-wider">PUNTO (OYUNCU) [1:1]</span>
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
                      Score: {bacResult.playerScore}
                    </span>
                  )}
                </div>

                {/* BANCO */}
                <div className={`p-4 rounded-xl border-2 flex flex-col items-center gap-3 transition ${
                  bacBetSide === 'BANKER' ? 'border-rose-400 bg-rose-950/40' : 'border-zinc-700 bg-black/40'
                }`}>
                  <span className="font-serif font-black text-rose-400 tracking-wider">BANCO (KASA) [0.95:1]</span>
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
                      Score: {bacResult.bankerScore}
                    </span>
                  )}
                </div>

              </div>

              {/* Bahis Kutuları */}
              <div className="grid grid-cols-3 gap-3">
                <button
                  onClick={() => { playChipSound(); setBacBetSide('PLAYER'); }}
                  className={`py-3.5 rounded-xl border text-center transition font-serif font-bold ${
                    bacBetSide === 'PLAYER' ? 'bg-blue-600 border-blue-400 text-white shadow-xl' : 'bg-black/50 border-zinc-700 text-gray-300'
                  }`}
                >
                  PUNTO (1:1)
                </button>
                <button
                  onClick={() => { playChipSound(); setBacBetSide('TIE'); }}
                  className={`py-3.5 rounded-xl border text-center transition font-serif font-bold ${
                    bacBetSide === 'TIE' ? 'bg-emerald-600 border-emerald-400 text-white shadow-xl' : 'bg-black/50 border-zinc-700 text-gray-300'
                  }`}
                >
                  EGALITÉ (TIE 8:1)
                </button>
                <button
                  onClick={() => { playChipSound(); setBacBetSide('BANKER'); }}
                  className={`py-3.5 rounded-xl border text-center transition font-serif font-bold ${
                    bacBetSide === 'BANKER' ? 'bg-rose-700 border-rose-500 text-white shadow-xl' : 'bg-black/50 border-zinc-700 text-gray-300'
                  }`}
                >
                  BANCO (0.95:1)
                </button>
              </div>

              {/* Bahis Miktarı ve Deal Butonu */}
              <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-[#d4af37]/30">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-serif text-gray-300">MISE:</span>
                  {[25, 50, 100, 500, 1000].map(val => (
                    <button
                      key={val}
                      onClick={() => { playChipSound(); setBacBetAmount(val); }}
                      className={`px-3 py-1.5 rounded-lg font-mono text-xs font-bold border ${
                        bacBetAmount === val ? 'bg-yellow-400 text-black border-yellow-200' : 'bg-zinc-800 text-white border-zinc-600'
                      }`}
                    >
                      ${val}
                    </button>
                  ))}
                </div>

                <button
                  onClick={handlePlayBaccarat}
                  disabled={isBacDealing || userBalance < bacBetAmount}
                  className="px-8 py-3 rounded-xl bg-gradient-to-r from-yellow-500 via-amber-500 to-yellow-600 text-black font-black text-sm uppercase tracking-wider shadow-lg shadow-amber-500/40 disabled:opacity-40 font-serif"
                >
                  {isBacDealing ? 'DISTRIBUTION...' : 'FAITES VOS JEUX'}
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
