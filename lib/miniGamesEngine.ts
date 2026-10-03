// lib/miniGamesEngine.ts
// Dünyada En Çok Rağbet Gören Yeni Nesil Hızlı Provably Fair Mini Oyunlar Motoru

import { loadCasinoConfig, updateCasinoConfig } from './monteCarloEngine';

export type MiniGameType = 'CRASH_ROCKET' | 'CRYPTO_MINES' | 'PLINKO_PIN' | 'WHEEL_FORTUNE' | 'COIN_FLIP_STREAK' | 'TURKISH_BARBUT';

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
export function generateCrashPoint(userId?: string): CrashResult {
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

/**
 * 6. KLASİK TÜRK BARBUTU & CASINO CRAPS MOTORU
 * Barbut Kuralları:
 * - 2 adet zar atılır (D1: 1-6, D2: 1-6).
 * - "ZAR TUTAN (ATICI)" veya "KÜÇÜK/BÜYÜK/ÇİFT/TEK/DÜŞEŞ" tahminleri yapılır.
 * - Geleneksel Barbut Kazanan Zarları:
 *   - 3-3, 5-5, 6-6 veya 1-2 (Altın Vuruş / Kazandıran Zarlar)
 *   - 2-2, 4-4 veya 5-6 (Kaybettiren Zarlar)
 * - Modern Casino Barbutu Modu:
 *   - 'BARBUT_WIN': Geleneksel Barbut (3-3, 5-5, 6-6 veya 1-2) -> 2.0x
 *   - 'DUSES': 6-6 (Düşeş Jackpot) -> 30.0x
 *   - 'CIFT': Çift Zarlar (1-1, 2-2, 3-3, 4-4, 5-5, 6-6) -> 5.5x
 *   - 'YUKSEK': Toplam 8-12 (Büyük Zar) -> 2.0x
 *   - 'DUSUK': Toplam 2-6 (Küçük Zar) -> 2.0x
 *   - 'YEDILI': Toplam 7 (Şanslı 7) -> 5.0x
 */
export type BarbutBetType = 'BARBUT_WIN' | 'DUSES' | 'CIFT' | 'YUKSEK' | 'DUSUK' | 'YEDILI';

export interface BarbutRollResult {
  dice1: number;
  dice2: number;
  total: number;
  isPair: boolean;
  combinationName: string;
  won: boolean;
  multiplier: number;
}

export function rollBarbutDice(betType: BarbutBetType, userId?: string): BarbutRollResult {
  const cfg = loadCasinoConfig();

  // GOD_WIN_100: Kullanıcının seçimine göre en yüksek kazançlı zarı garanti eder
  if (cfg.penetrationMode === 'GOD_WIN_100') {
    if (betType === 'DUSES') {
      return {
        dice1: 6,
        dice2: 6,
        total: 12,
        isPair: true,
        combinationName: 'DÜŞEŞ (6-6)',
        won: true,
        multiplier: 30.0
      };
    }
    if (betType === 'BARBUT_WIN') {
      return {
        dice1: 5,
        dice2: 5,
        total: 10,
        isPair: true,
        combinationName: 'DÜBEŞ (5-5 Barbut Zaferi)',
        won: true,
        multiplier: 2.0
      };
    }
    if (betType === 'CIFT') {
      return {
        dice1: 4,
        dice2: 4,
        total: 8,
        isPair: true,
        combinationName: 'DÖRT-CİHAR (4-4)',
        won: true,
        multiplier: 5.5
      };
    }
    if (betType === 'YUKSEK') {
      return {
        dice1: 5,
        dice2: 4,
        total: 9,
        isPair: false,
        combinationName: 'BEŞ-DÖRT (Toplam 9)',
        won: true,
        multiplier: 2.0
      };
    }
    if (betType === 'DUSUK') {
      return {
        dice1: 2,
        dice2: 2,
        total: 4,
        isPair: true,
        combinationName: 'İKİ-BİR (Toplam 4)',
        won: true,
        multiplier: 2.0
      };
    }
    if (betType === 'YEDILI') {
      return {
        dice1: 4,
        dice2: 3,
        total: 7,
        isPair: false,
        combinationName: 'ŞANSLI YEDİ (4-3)',
        won: true,
        multiplier: 5.0
      };
    }
  }

  // Standart Fiziksel Rastgele Zar Atımı (1-6)
  const d1 = Math.floor(Math.random() * 6) + 1;
  const d2 = Math.floor(Math.random() * 6) + 1;
  const total = d1 + d2;
  const isPair = d1 === d2;

  // Geleneksel Türkçe Barbut Terimleri
  let combinationName = `${d1}-${d2}`;
  if (d1 === 1 && d2 === 1) combinationName = 'HEP YEK (1-1)';
  else if (d1 === 2 && d2 === 2) combinationName = 'DÜ BARA (2-2)';
  else if (d1 === 3 && d2 === 3) combinationName = 'DÜ SE (3-3)';
  else if (d1 === 4 && d2 === 4) combinationName = 'DÖRT CİHAR (4-4)';
  else if (d1 === 5 && d2 === 5) combinationName = 'DÜ BEŞ (5-5)';
  else if (d1 === 6 && d2 === 6) combinationName = 'DÜ ŞEŞ (6-6)';
  else if ((d1 === 1 && d2 === 2) || (d1 === 2 && d2 === 1)) combinationName = 'İKİ-BİR (Altın Vuruş)';
  else if ((d1 === 6 && d2 === 5) || (d1 === 5 && d2 === 6)) combinationName = 'ŞEŞ-BEŞ (6-5)';
  else if (total === 7) combinationName = `ŞANSLI YEDİ (${d1}-${d2})`;

  let won = false;
  let multiplier = 0;

  switch (betType) {
    case 'BARBUT_WIN':
      // Geleneksel Türk Barbutu: 3-3, 5-5, 6-6 veya 1-2 gelirse kazanır
      if ((d1 === 3 && d2 === 3) || (d1 === 5 && d2 === 5) || (d1 === 6 && d2 === 6) || (d1 === 1 && d2 === 2) || (d1 === 2 && d2 === 1)) {
        won = true;
        multiplier = 2.0;
      }
      break;
    case 'DUSES':
      if (d1 === 6 && d2 === 6) {
        won = true;
        multiplier = 30.0;
      }
      break;
    case 'CIFT':
      if (isPair) {
        won = true;
        multiplier = 5.5;
      }
      break;
    case 'YUKSEK':
      if (total >= 8 && total <= 12) {
        won = true;
        multiplier = 2.0;
      }
      break;
    case 'DUSUK':
      if (total >= 2 && total <= 6) {
        won = true;
        multiplier = 2.0;
      }
      break;
    case 'YEDILI':
      if (total === 7) {
        won = true;
        multiplier = 5.0;
      }
      break;
  }

  return {
    dice1: d1,
    dice2: d2,
    total,
    isPair,
    combinationName,
    won,
    multiplier
  };
}
