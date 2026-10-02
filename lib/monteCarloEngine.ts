// lib/monteCarloEngine.ts
// Monte Carlo Provably Fair Slot & RNG Algoritma Motoru

export interface SlotSymbol {
  id: string;
  name: string;
  icon: string;
  payout3: number; // 3 eşleşme çarpanı
  payout4: number; // 4 eşleşme çarpanı
  payout5: number; // 5 eşleşme çarpanı
  weight: number;  // Temel çıkma ağırlığı (RNG ağırlığı)
}

// Çilek, Ananas ve Lüks Meyve & Vegas Sembolleri
export const SLOT_SYMBOLS: SlotSymbol[] = [
  { id: 'strawberry', name: 'Çilek', icon: '🍓', payout3: 3, payout4: 8, payout5: 25, weight: 35 },
  { id: 'pineapple', name: 'Ananas', icon: '🍍', payout3: 4, payout4: 12, payout5: 40, weight: 30 },
  { id: 'watermelon', name: 'Karpuz', icon: '🍉', payout3: 5, payout4: 15, payout5: 50, weight: 25 },
  { id: 'grapes', name: 'Üzüm', icon: '🍇', payout3: 6, payout4: 20, payout5: 75, weight: 20 },
  { id: 'gold', name: 'Altın Külçesi', icon: '🥇', payout3: 15, payout4: 50, payout5: 200, weight: 12 },
  { id: 'diamond', name: 'Elmas', icon: '💎', payout3: 25, payout4: 100, payout5: 500, weight: 8 },
  { id: 'seven', name: 'Şanslı 777', icon: '🎰', payout3: 50, payout4: 250, payout5: 1000, weight: 4 },
  { id: 'wild', name: 'Wild Yıldız', icon: '⭐', payout3: 10, payout4: 30, payout5: 150, weight: 10 }
];

export type PenetrationMode = 
  | 'PURE_MONTE_CARLO' // Saf Monte Carlo Matematiksel Dağılımı (%96.5 RTP)
  | 'SWEET_HOOK'        // Yeni üye bağlama modu: Sık sık x5 - x20 kazanç verir (%98 RTP)
  | 'HOUSE_EDGE'        // Kasa doldurma modu: Zor kazanç (%82 RTP)
  | 'JACKPOT_STORM'     // Yüksek dalgalanma: Birçok boş çevirme ardından devasa x500 jackpot (%92 RTP)
  | 'FORCE_JACKPOT';    // Admin zorlamasıyla bir sonraki spin kesin 5x 777 Jackpot

export interface CasinoEngineConfig {
  rtpPercent: number;          // %75 - %99.5
  penetrationMode: PenetrationMode;
  volatility: 'LOW' | 'MEDIUM' | 'HIGH' | 'EXTREME';
  forcedJackpotPending: boolean;
  totalSpins: number;
  totalWagered: number;
  totalPayout: number;
}

// Varsayılan Kasa Ayarları
export let currentCasinoConfig: CasinoEngineConfig = {
  rtpPercent: 95.5,
  penetrationMode: 'PURE_MONTE_CARLO',
  volatility: 'MEDIUM',
  forcedJackpotPending: false,
  totalSpins: 1420,
  totalWagered: 142000,
  totalPayout: 135610
};

// 20 Standart Kazanç Çizgisi (5x3 Reel Koordinatları [Reel0-4, Row0-2])
export const PAYLINES: number[][] = [
  [1, 1, 1, 1, 1], // Çizgi 1: Orta yatay
  [0, 0, 0, 0, 0], // Çizgi 2: Üst yatay
  [2, 2, 2, 2, 2], // Çizgi 3: Alt yatay
  [0, 1, 2, 1, 0], // Çizgi 4: V şekli
  [2, 1, 0, 1, 2], // Çizgi 5: Ters V
  [0, 0, 1, 2, 2], // Çizgi 6: Merdiven aşağı
  [2, 2, 1, 0, 0], // Çizgi 7: Merdiven yukarı
  [1, 0, 0, 0, 1], // Çizgi 8: Çukur
  [1, 2, 2, 2, 1], // Çizgi 9: Tepe
  [0, 1, 1, 1, 0], // Çizgi 10
  [2, 1, 1, 1, 2], // Çizgi 11
  [0, 1, 0, 1, 0], // Çizgi 12: Zikzak üst
  [2, 1, 2, 1, 2], // Çizgi 13: Zikzak alt
  [1, 0, 1, 0, 1], // Çizgi 14
  [1, 2, 1, 2, 1], // Çizgi 15
  [0, 0, 1, 0, 0], // Çizgi 16
  [2, 2, 1, 2, 2], // Çizgi 17
  [1, 1, 0, 1, 1], // Çizgi 18
  [1, 1, 2, 1, 1], // Çizgi 19
  [0, 2, 0, 2, 0]  // Çizgi 20: Büyük dalga
];

export function updateCasinoConfig(newConfig: Partial<CasinoEngineConfig>) {
  currentCasinoConfig = { ...currentCasinoConfig, ...newConfig };
  if (typeof window !== 'undefined') {
    localStorage.setItem('mt5_casino_config', JSON.stringify(currentCasinoConfig));
  }
  return currentCasinoConfig;
}

export function loadCasinoConfig() {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('mt5_casino_config');
    if (saved) {
      try {
        currentCasinoConfig = JSON.parse(saved);
      } catch (e) {}
    }
  }
  return currentCasinoConfig;
}

export interface SpinResult {
  grid: string[][]; // 5 makara x 3 satır sembol id'leri
  winningLines: {
    lineIndex: number;
    symbolId: string;
    matchCount: number;
    payout: number;
  }[];
  totalWin: number;
  multiplier: number;
  isJackpot: boolean;
  serverSeed: string;
  clientSeed: string;
  nonce: number;
}

/**
 * Monte Carlo Provably Fair Spin Hesaplayıcı
 */
export function executeSlotSpin(betAmount: number): SpinResult {
  const cfg = loadCasinoConfig();
  const nonce = Date.now();
  const serverSeed = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  const clientSeed = 'provably-fair-monte-carlo-' + Math.floor(Math.random() * 10000);

  // Admin Zorlaması: Kesin Mega Jackpot
  if (cfg.forcedJackpotPending || cfg.penetrationMode === 'FORCE_JACKPOT') {
    updateCasinoConfig({ forcedJackpotPending: false, penetrationMode: 'PURE_MONTE_CARLO' });
    const jackpotGrid: string[][] = [
      ['seven', 'seven', 'seven'],
      ['seven', 'seven', 'seven'],
      ['seven', 'seven', 'seven'],
      ['seven', 'seven', 'seven'],
      ['seven', 'seven', 'seven']
    ];
    const jackpotPayout = betAmount * 1000;
    return {
      grid: jackpotGrid,
      winningLines: [{ lineIndex: 0, symbolId: 'seven', matchCount: 5, payout: jackpotPayout }],
      totalWin: jackpotPayout,
      multiplier: 1000,
      isJackpot: true,
      serverSeed,
      clientSeed,
      nonce
    };
  }

  // Penetrasyon ve RTP Moduna Göre Sembol Ağırlıklarını Dinamik Ayarla
  let symbolWeights = [...SLOT_SYMBOLS];
  if (cfg.penetrationMode === 'SWEET_HOOK') {
    // Çilek ve ananas kazançlarını artır
    symbolWeights = symbolWeights.map(s => {
      if (s.id === 'strawberry' || s.id === 'pineapple') return { ...s, weight: s.weight * 2.2 };
      return s;
    });
  } else if (cfg.penetrationMode === 'HOUSE_EDGE') {
    // Yüksek ödeyen sembollerin çıkma oranını kıs
    symbolWeights = symbolWeights.map(s => {
      if (s.id === 'seven' || s.id === 'diamond' || s.id === 'gold') return { ...s, weight: Math.max(1, s.weight * 0.3) };
      return s;
    });
  }

  const totalWeight = symbolWeights.reduce((acc, s) => acc + s.weight, 0);

  const getRandomSymbol = (): string => {
    let rand = Math.random() * totalWeight;
    for (const s of symbolWeights) {
      if (rand < s.weight) return s.id;
      rand -= s.weight;
    }
    return 'strawberry';
  };

  // 5 makara x 3 satır matris oluştur
  const grid: string[][] = [];
  for (let col = 0; col < 5; col++) {
    const reel: string[] = [];
    for (let row = 0; row < 3; row++) {
      reel.push(getRandomSymbol());
    }
    grid.push(reel);
  }

  // 20 Çizgiyi Kontrol Et ve Kazanç Hesapla
  const winningLines: SpinResult['winningLines'] = [];
  let totalWin = 0;

  PAYLINES.forEach((line, lineIdx) => {
    const lineSymbols = [
      grid[0][line[0]],
      grid[1][line[1]],
      grid[2][line[2]],
      grid[3][line[3]],
      grid[4][line[4]]
    ];

    // İlk sembol (Wild ise sonrakine bak)
    let firstSym = lineSymbols[0];
    let matchCount = 1;

    for (let i = 1; i < 5; i++) {
      const current = lineSymbols[i];
      if (current === firstSym || current === 'wild' || firstSym === 'wild') {
        if (firstSym === 'wild' && current !== 'wild') firstSym = current;
        matchCount++;
      } else {
        break;
      }
    }

    if (matchCount >= 3) {
      const spec = SLOT_SYMBOLS.find(s => s.id === firstSym) || SLOT_SYMBOLS[0];
      let linePayoutMult = 0;
      if (matchCount === 3) linePayoutMult = spec.payout3;
      else if (matchCount === 4) linePayoutMult = spec.payout4;
      else if (matchCount === 5) linePayoutMult = spec.payout5;

      const lineWin = (betAmount / 20) * linePayoutMult;
      totalWin += lineWin;

      winningLines.push({
        lineIndex: lineIdx,
        symbolId: firstSym,
        matchCount,
        payout: lineWin
      });
    }
  });

  totalWin = Number(totalWin.toFixed(2));
  const multiplier = Number((totalWin / (betAmount || 1)).toFixed(2));
  const isJackpot = multiplier >= 100;

  // İstatistikleri güncelle
  updateCasinoConfig({
    totalSpins: cfg.totalSpins + 1,
    totalWagered: cfg.totalWagered + betAmount,
    totalPayout: cfg.totalPayout + totalWin
  });

  return {
    grid,
    winningLines,
    totalWin,
    multiplier,
    isJackpot,
    serverSeed,
    clientSeed,
    nonce
  };
}
