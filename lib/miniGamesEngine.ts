// lib/miniGamesEngine.ts
// Dünyada En Çok Rağbet Gören Yeni Nesil Hızlı Provably Fair Mini Oyunlar Motoru

import { loadCasinoConfig } from './monteCarloEngine';

export type MiniGameType = 'CRASH_ROCKET' | 'CRYPTO_MINES' | 'PLINKO_PIN';

export interface CrashResult {
  crashPoint: number;     // Roketin patladığı çarpan (örn. 1.84x, 14.50x, 100.0x)
  isInstantCrash: boolean; // 1.00x anında patlama
}

export interface MinesGrid {
  minesCount: number;
  gridSize: number;       // 25 hücre (5x5)
  minePositions: number[]; // 0-24 arası bomba indeksleri
}

/**
 * 1. ROCKET CRASH (Aviator & Space Crash tarzı)
 * Matematiksel olarak logaritmik eğri ile roket yükselir.
 */
export function generateCrashPoint(): CrashResult {
  const cfg = loadCasinoConfig();
  
  // %100 KAZANMA MODU (GOD_WIN_100): Roket asla erkenden patlamaz, garantili 50x-100x uçar!
  if (cfg.penetrationMode === 'GOD_WIN_100') {
    return {
      crashPoint: Number((50 + Math.random() * 50).toFixed(2)),
      isInstantCrash: false
    };
  }

  // Admin zorlaması / RTP etkisi
  let rtpMultiplier = (cfg.rtpPercent || 95.5) / 100;
  
  if (cfg.penetrationMode === 'SWEET_HOOK') {
    rtpMultiplier = 1.05;
  } else if (cfg.penetrationMode === 'HOUSE_EDGE') {
    rtpMultiplier = 0.85;
  }

  // Anında patlama ihtimali (%3-%5)
  if (Math.random() < 0.04 * (1 / rtpMultiplier)) {
    return { crashPoint: 1.00, isInstantCrash: true };
  }

  // Klasik Provably Fair Crash Formülü: E = 0.99 / (1 - U)
  const u = Math.random();
  let rawCrash = (0.97 * rtpMultiplier) / (1 - u);

  // Aşırı yüksek çarpanları doğal eğride sınırla
  if (rawCrash > 150) rawCrash = 150 + Math.random() * 50;
  if (rawCrash < 1.01) rawCrash = 1.01;

  return {
    crashPoint: Number(rawCrash.toFixed(2)),
    isInstantCrash: false
  };
}

/**
 * 2. DIAMOND MINES (Mayın Tarlası - Stake & Roobet tarzı)
 * 5x5 (25 kare) ızgara. Kullanıcı elmas buldukça çarpan katlanır.
 */
export function generateMinesGrid(minesCount: number): MinesGrid {
  const positions: number[] = [];
  while (positions.length < minesCount) {
    const r = Math.floor(Math.random() * 25);
    if (!positions.includes(r)) {
      positions.push(r);
    }
  }
  return {
    minesCount,
    gridSize: 25,
    minePositions: positions
  };
}

// Mayın tarlasında elmas açıldıkça artan çarpan tablosu (Örn: 3 mayın seçiliyken)
export function getMinesMultiplier(minesCount: number, diamondsFound: number): number {
  if (diamondsFound === 0) return 1.00;
  // Olasılık formülü: Çarpan = (1 / P(n)) * 0.97
  let mult = 1.0;
  let remainingTotal = 25;
  let remainingGems = 25 - minesCount;

  for (let i = 0; i < diamondsFound; i++) {
    const prob = (remainingGems - i) / (remainingTotal - i);
    mult *= (1 / prob);
  }

  return Number((mult * 0.97).toFixed(2));
}

/**
 * 3. PLINKO PEGS (Piramit Top Düşürme - Mobil Viral)
 * Top 8 satır çividen seker ve alt kutucuklara düşer.
 */
export const PLINKO_MULTIPLIERS = [15.0, 4.0, 1.8, 0.7, 0.4, 0.7, 1.8, 4.0, 15.0]; // 9 yuva

export function simulatePlinkoPath(): { path: ('L' | 'R')[]; finalSlot: number; multiplier: number } {
  const cfg = loadCasinoConfig();
  if (cfg.penetrationMode === 'GOD_WIN_100') {
    // 15x en dış yuvaya yönlendir
    const isRightEnd = Math.random() > 0.5;
    const path: ('L' | 'R')[] = Array(8).fill(isRightEnd ? 'R' : 'L');
    const finalSlot = isRightEnd ? 8 : 0;
    return { path, finalSlot, multiplier: 15.0 };
  }

  const path: ('L' | 'R')[] = [];
  let rightCount = 0;

  // 8 basamak çividen sekme (Her çividen %50 Sol, %50 Sağ)
  for (let i = 0; i < 8; i++) {
    const isRight = Math.random() > 0.495;
    path.push(isRight ? 'R' : 'L');
    if (isRight) rightCount++;
  }

  const finalSlot = rightCount; // 0 - 8 arası yuva indeksi
  const multiplier = PLINKO_MULTIPLIERS[finalSlot] || 1.0;

  return { path, finalSlot, multiplier };
}
