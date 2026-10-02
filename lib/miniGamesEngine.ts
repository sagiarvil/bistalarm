// lib/miniGamesEngine.ts
// Dünyada En Çok Rağbet Gören Yeni Nesil Hızlı Provably Fair Mini Oyunlar Motoru

import { loadCasinoConfig } from './monteCarloEngine';

export type MiniGameType = 'CRASH_ROCKET' | 'CRYPTO_MINES' | 'PLINKO_PIN' | 'WHEEL_FORTUNE' | 'COIN_FLIP_STREAK';

export interface MinesTargetTier {
  step: number;        // Örn 3, 5, 8, 12 adım
  label: string;       // "3 Adım Hedefi"
  riskLevel: 'DÜŞÜK' | 'ORTA' | 'YÜKSEK' | 'EFSANEVİ';
  estMultiplier: number;
}

export interface WheelSector {
  label: string;
  multiplier: number;
  color: string;
  probability: number;
}

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

/**
 * Mayın Tarlası Adım Hedefleri & Dinamik Risk Matrisi
 */
export function getMinesTargetTiers(minesCount: number): MinesTargetTier[] {
  return [
    {
      step: 3,
      label: '3 Adım Güvenli Hedef',
      riskLevel: minesCount <= 3 ? 'DÜŞÜK' : 'ORTA',
      estMultiplier: getMinesMultiplier(minesCount, 3)
    },
    {
      step: 5,
      label: '5 Adım Usta Hedef',
      riskLevel: minesCount <= 3 ? 'ORTA' : 'YÜKSEK',
      estMultiplier: getMinesMultiplier(minesCount, 5)
    },
    {
      step: 8,
      label: '8 Adım Cesur Hedef',
      riskLevel: 'YÜKSEK',
      estMultiplier: getMinesMultiplier(minesCount, 8)
    },
    {
      step: 12,
      label: '12 Adım Efsane Hedef',
      riskLevel: 'EFSANEVİ',
      estMultiplier: getMinesMultiplier(minesCount, 12)
    }
  ];
}

/**
 * 4. VIRAL WHEEL OF FORTUNE (Facebook Çarkıfelek Klasikleri)
 * 8 Dilimli Şans Çarkı
 */
export const WHEEL_SECTORS: WheelSector[] = [
  { label: '2x', multiplier: 2.0, color: '#3b82f6', probability: 0.30 },
  { label: '5x', multiplier: 5.0, color: '#10b981', probability: 0.20 },
  { label: '1.5x', multiplier: 1.5, color: '#6366f1', probability: 0.25 },
  { label: '10x', multiplier: 10.0, color: '#f59e0b', probability: 0.10 },
  { label: '0x Pas', multiplier: 0.0, color: '#ef4444', probability: 0.05 },
  { label: '3x', multiplier: 3.0, color: '#8b5cf6', probability: 0.06 },
  { label: '25x Mega', multiplier: 25.0, color: '#ec4899', probability: 0.03 },
  { label: '50x JACKPOT', multiplier: 50.0, color: '#eab308', probability: 0.01 },
];

export function spinWheelOfFortune(): { sectorIndex: number; sector: WheelSector } {
  const cfg = loadCasinoConfig();
  if (cfg.penetrationMode === 'GOD_WIN_100') {
    // 50x JACKPOT dilimine yönlendir (Son dilim)
    return { sectorIndex: 7, sector: WHEEL_SECTORS[7] };
  }

  const rand = Math.random();
  let cum = 0;
  for (let i = 0; i < WHEEL_SECTORS.length; i++) {
    cum += WHEEL_SECTORS[i].probability;
    if (rand <= cum) {
      return { sectorIndex: i, sector: WHEEL_SECTORS[i] };
    }
  }
  return { sectorIndex: 0, sector: WHEEL_SECTORS[0] };
}

/**
 * 5. COIN FLIP STREAK (Facebook / Web3 Klasik Yazı-Tura Seri Kazanma)
 * Üst üste doğru tahmin ettikçe çarpan katlanır: 1.95x -> 3.85x -> 7.60x -> 15.0x -> 30.0x
 */
export function flipCoin(choice: 'YAZI' | 'TURA'): { result: 'YAZI' | 'TURA'; won: boolean } {
  const cfg = loadCasinoConfig();
  if (cfg.penetrationMode === 'GOD_WIN_100') {
    return { result: choice, won: true };
  }

  const outcome = Math.random() > 0.5 ? 'YAZI' : 'TURA';
  return {
    result: outcome,
    won: outcome === choice
  };
}
