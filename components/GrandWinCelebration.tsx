'use client';

import React, { useEffect, useRef } from 'react';

interface GrandWinCelebrationProps {
  isOpen: boolean;
  amount: number;
  title?: string;
  subtitle?: string;
  onClose: () => void;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  rotation: number;
  vRot: number;
  isCoin: boolean;
  opacity: number;
}

export default function GrandWinCelebration({
  isOpen,
  amount,
  title = 'BÜYÜK MONTE CARLO ZAFERİ!',
  subtitle = 'Kraliyet Kasasından Bakiyenize Anında Eklendi!',
  onClose
}: GrandWinCelebrationProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Web Audio Context - VIP & Monte Carlo Gerçekçi Zafer Sentezleyicisi
  useEffect(() => {
    if (!isOpen) return;

    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      if (ctx.state === 'suspended') ctx.resume();

      const playTone = (freq: number, type: OscillatorType, dur: number, gainVal: number, delay = 0) => {
        setTimeout(() => {
          try {
            if (ctx.state === 'closed') return;
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = type;
            osc.frequency.setValueAtTime(freq, ctx.currentTime);
            gain.gain.setValueAtTime(gainVal, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + dur);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start();
            osc.stop(ctx.currentTime + dur);
          } catch (e) {}
        }, delay);
      };

      // 1. Trompet Fanfarı (Kraliyet C-Majör Akoru)
      playTone(523.25, 'sawtooth', 0.25, 0.3, 0);    // C5
      playTone(659.25, 'triangle', 0.25, 0.25, 50);   // E5
      playTone(783.99, 'sine', 0.3, 0.25, 100);       // G5
      playTone(1046.50, 'sawtooth', 0.5, 0.35, 200);  // C6
      playTone(1318.51, 'triangle', 0.6, 0.3, 350);  // E6
      playTone(1567.98, 'sine', 0.7, 0.35, 500);      // G6

      // 2. Bas Patlama (Şampanya & Kasa Açılışı)
      playTone(120, 'sine', 0.4, 0.5, 50);

      // 3. 25 Katmanlı Altın Sikke / Fiş Kaskatı (Stereo Para Şıkırtısı)
      const coinTones = [1600, 1900, 2200, 2600, 3100, 3500, 4200, 2800, 3300, 2100];
      for (let i = 0; i < 28; i++) {
        const tone = coinTones[i % coinTones.length] + Math.random() * 200;
        playTone(tone, 'triangle', 0.05, 0.15, 300 + i * 40);
      }

      // 4. İkinci Zafer Vurgusu (1.5 saniye sonra)
      setTimeout(() => {
        playTone(1046.50, 'sawtooth', 0.4, 0.3, 0);
        playTone(1318.51, 'triangle', 0.5, 0.3, 100);
        playTone(2093.00, 'sine', 0.7, 0.35, 200); // C7 (High Bell)
      }, 1500);

    } catch (e) {}

    // 4.5 saniye sonra otomatik kapanma
    const autoClose = setTimeout(() => {
      onClose();
    }, 4500);

    return () => clearTimeout(autoClose);
  }, [isOpen, onClose]);

  // Canvas 60 FPS Altın Sikke & Konfeti Fırtınası Motoru
  useEffect(() => {
    if (!isOpen) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const colors = ['#ffd700', '#f59e0b', '#fbbf24', '#10b981', '#3b82f6', '#ec4899', '#ffffff'];
    const particles: Particle[] = [];

    // 140 Adet Dinamik Parçacık (Altın Sikkeler + Konfetiler)
    for (let i = 0; i < 140; i++) {
      particles.push({
        x: canvas.width * 0.5 + (Math.random() - 0.5) * 150,
        y: canvas.height * 0.55 + (Math.random() - 0.5) * 60,
        vx: (Math.random() - 0.5) * 18,
        vy: -Math.random() * 16 - 8,
        size: Math.random() * 9 + 6,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * Math.PI * 2,
        vRot: (Math.random() - 0.5) * 0.2,
        isCoin: i % 2 === 0,
        opacity: 1
      });
    }

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.35; // Yerçekimi
        p.vx *= 0.985; // Hava direnci
        p.rotation += p.vRot;

        if (p.y > canvas.height * 0.6) {
          p.opacity = Math.max(0, p.opacity - 0.015);
        }

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        ctx.globalAlpha = p.opacity;

        if (p.isCoin) {
          // Altın Sikke Çizimi
          ctx.beginPath();
          ctx.arc(0, 0, p.size, 0, Math.PI * 2);
          ctx.fillStyle = '#ffd700';
          ctx.fill();
          ctx.lineWidth = 1.5;
          ctx.strokeStyle = '#b45309';
          ctx.stroke();

          // Sikke Üzeri Kabartma
          ctx.beginPath();
          ctx.arc(0, 0, p.size * 0.6, 0, Math.PI * 2);
          ctx.strokeStyle = '#fef08a';
          ctx.stroke();
        } else {
          // Renkli Konfeti Şeridi
          ctx.fillStyle = p.color;
          ctx.fillRect(-p.size * 0.5, -p.size, p.size, p.size * 1.6);
        }

        ctx.restore();
      }

      animId = requestAnimationFrame(render);
    };

    render();

    return () => cancelAnimationFrame(animId);
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/85 backdrop-blur-md animate-fadeIn select-none p-4">
      {/* 60 FPS Altın Parçacık Yağmuru Canvas */}
      <canvas 
        ref={canvasRef} 
        className="absolute inset-0 pointer-events-none z-10 w-full h-full"
      />

      {/* Altın Işık Hüzmesi (Radyal Glow) */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(255,215,0,0.35)_0%,_rgba(180,83,9,0.15)_45%,_transparent_75%)] pointer-events-none animate-pulse" />

      {/* Ana Lüks Zafer Kartı (VIP Palace & Monte Carlo VIP) */}
      <div className="relative z-20 max-w-md sm:max-w-lg w-full bg-gradient-to-b from-[#2b1204] via-[#4d2208] to-[#1a0802] border-4 border-[#ffd700] rounded-3xl p-6 sm:p-8 text-center  transform transition-transform animate-scaleUp">
        
        {/* Kapat Butonu */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/60 hover:bg-rose-900 border border-yellow-400 text-yellow-200 flex items-center justify-center font-bold text-sm transition"
        >
          ✕
        </button>

        {/* Taç / Kupa Rozeti */}
        <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto rounded-full  border-4 border-white  flex items-center justify-center text-3xl sm:text-4xl mb-3 animate-bounce">
          👑
        </div>

        {/* VIP Başlığı */}
        <span className="text-[10px] sm:text-xs font-mono tracking-widest text-amber-300 uppercase font-black block">
          ⚜️ VIP PALACE & MONTE CARLO VIP ⚜️
        </span>

        {/* Ana Zafer Başlığı */}
        <h2 className="text-xl sm:text-3xl font-black font-serif   tracking-wider my-2 drop-shadow-[0_2px_12px_rgba(255,215,0,0.6)]">
          {title}
        </h2>

        {/* Parlayan Kazanılan Para Tutarı */}
        <div className="my-3 py-3 px-6 bg-black/75 rounded-2xl border-2 border-yellow-400 inline-block shadow-[inset_0_0_20px_rgba(255,215,0,0.4)]">
          <span className="text-3xl sm:text-5xl font-black font-mono text-emerald-400 tracking-tight drop-">
            +${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        </div>

        {/* Alt Açıklama */}
        <p className="text-xs sm:text-sm text-amber-200 font-serif italic mt-1">
          {subtitle}
        </p>

        {/* Devam Et Butonu */}
        <div className="mt-5">
          <button
            onClick={onClose}
            className="px-8 py-2.5 rounded-xl  bg-blue-600 hover:bg-blue-700 text-black font-black text-xs sm:text-sm uppercase tracking-wider  transition active:scale-95 font-serif"
          >
            KAZANCI AL VE DEVAM ET
          </button>
        </div>
      </div>
    </div>
  );
}
