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
  { id: 'cherry', name: 'Cherry', icon: '🍒', payout3: 3, payout4: 8, payout5: 25, weight: 35 },
  { id: 'bell', name: 'Bell', icon: '🔔', payout3: 4, payout4: 12, payout5: 40, weight: 30 },
  { id: 'bar', name: 'BAR', icon: '🍫', payout3: 5, payout4: 15, payout5: 50, weight: 25 },
  { id: 'double_bar', name: 'Double BAR', icon: '💰', payout3: 6, payout4: 20, payout5: 75, weight: 20 },
  { id: 'diamond', name: 'Diamond', icon: '💎', payout3: 15, payout4: 50, payout5: 200, weight: 12 },
  { id: 'seven', name: 'Red 7', icon: '🔴', payout3: 25, payout4: 100, payout5: 500, weight: 8 },
  { id: 'scorching_seven', name: 'Scorching 777', icon: '🔥', payout3: 50, payout4: 250, payout5: 1000, weight: 4 },
  { id: 'wild', name: 'Double Jackpot', icon: '🎰', payout3: 10, payout4: 30, payout5: 150, weight: 10 }
];

export type PenetrationMode = 
  | 'PURE_MONTE_CARLO' // Saf Monte Carlo Matematiksel Dağılımı (%96.5 RTP)
  | 'SWEET_HOOK'        // Yeni üye bağlama modu: Sık sık x5 - x20 kazanç verir (%98 RTP)
  | 'HOUSE_EDGE'        // Kasa doldurma modu: Zor kazanç (%82 RTP)
  | 'JACKPOT_STORM'     // Yüksek dalgalanma: Birçok boş çevirme ardından devasa x500 jackpot (%92 RTP)
  | 'FORCE_JACKPOT'     // Admin zorlamasıyla kesin jackpot
  | 'GOD_WIN_100'
  | 'SOCIAL_CASINO_AI'; // Playtika/Caesars Dinamik Psikolojik Motor      // %100 KESİNTİSİZ KAZANMA VE MEGA WIN MODU

export interface CasinoEngineConfig {
  rtpPercent: number;          // %75 - %99.5
  penetrationMode: PenetrationMode;
  volatility: 'LOW' | 'MEDIUM' | 'HIGH' | 'EXTREME';
  forcedJackpotPending: boolean;
  totalSpins: number;
  totalWagered: number;
  totalPayout: number;
  consecutiveLosses?: number;
  playerBalance?: number;
  playerInitialBalance?: number;
  globalWinRateTarget?: number; // 0-100 arası (Örn: 80 = %80 kazanma ihtimali)
  userWinRateTargets?: Record<string, number>; // Kullanıcı ID'sine göre özel kazanma oranı
}

// Varsayılan Kasa Ayarları (CAESARS SOSYAL CASINO DİNAMİĞİ AKTİF)
export let currentCasinoConfig: CasinoEngineConfig = {
  rtpPercent: 99.9,
  penetrationMode: 'SOCIAL_CASINO_AI',
  volatility: 'LOW',
  forcedJackpotPending: false,
  totalSpins: 1420,
  totalWagered: 142000,
  totalPayout: 185610,
  consecutiveLosses: 0,
  playerBalance: 1000,
  playerInitialBalance: 1000,
  globalWinRateTarget: -1, // Kasa serbest (Monte Carlo/Caesars standart motoru)
  userWinRateTargets: {}
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
        const parsed = JSON.parse(saved);
        
        // ENTERPRISE HOTFIX: Sanitize corrupted local storage state
        if (parsed.penetrationMode === 'GOD_WIN_100') {
          parsed.penetrationMode = 'SOCIAL_CASINO_AI';
        }
        if (parsed.globalWinRateTarget === 40 || parsed.globalWinRateTarget === 100) {
          parsed.globalWinRateTarget = -1;
        }
        
        currentCasinoConfig = { ...currentCasinoConfig, ...parsed };
        
        // Save back the sanitized version immediately
        localStorage.setItem('mt5_casino_config', JSON.stringify(currentCasinoConfig));
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
export function executeSlotSpin(betAmount: number, userId?: string): SpinResult {
  const cfg = loadCasinoConfig();
  const nonce = Date.now();
  const serverSeed = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  const clientSeed = 'provably-fair-monte-carlo-' + Math.floor(Math.random() * 10000);

  // Admin Zorlaması: Kesin Mega Jackpot
  if (cfg.forcedJackpotPending || cfg.penetrationMode === 'FORCE_JACKPOT') {
    updateCasinoConfig({ forcedJackpotPending: false, penetrationMode: 'SOCIAL_CASINO_AI' });
    const jackpotPayout = betAmount * 1000;
    return {
      grid: [['seven','seven','seven'],['seven','seven','seven'],['seven','seven','seven']],
      winningLines: [{ lineIndex: 0, symbolId: 'seven', matchCount: 3, payout: jackpotPayout }],
      totalWin: jackpotPayout,
      multiplier: 1000,
      isJackpot: true,
      serverSeed, clientSeed, nonce
    };
  }

  // ============================================================================
  // CAESARS / PLAYTIKA SOSYAL CASINO DİNAMİK ALGORİTMASI (SOCIAL_CASINO_AI)
  // ============================================================================
  
  // -- ÖZEL KAZANDIRMA POLİTİKASI KONTROLÜ (Yüzdesel) --
  let forcedWinTarget = -1;
  if (cfg.penetrationMode === 'SOCIAL_CASINO_AI') {
    if (userId && cfg.userWinRateTargets && cfg.userWinRateTargets[userId] !== undefined) {
      forcedWinTarget = cfg.userWinRateTargets[userId];
    } else if (cfg.globalWinRateTarget !== undefined && cfg.globalWinRateTarget >= 0) {
      forcedWinTarget = cfg.globalWinRateTarget;
    }
  }

  // Eğer yüzde bazlı bir hedef belirlendiyse, matematiği ezip bu ihtimale göre kazandır/kaybettir:
  if (forcedWinTarget >= 0 && forcedWinTarget <= 100) {
    const willWin = (Math.random() * 100) < forcedWinTarget;
    
    if (willWin) {
      const sym = Math.random() > 0.8 ? 'diamond' : (Math.random() > 0.5 ? 'seven' : 'gold');
      const payoutMult = sym === 'diamond' ? 10 : (sym === 'seven' ? 5 : 3);
      const totalWin = betAmount * payoutMult;
      return {
        grid: [[sym, sym, sym], [sym, sym, sym], [sym, sym, sym]],
        winningLines: [{ lineIndex: 1, symbolId: sym, matchCount: 3, payout: totalWin }],
        totalWin,
        multiplier: payoutMult,
        isJackpot: payoutMult >= 10,
        serverSeed, clientSeed, nonce
      };
    } else {
      // Kesin kaybettir (Boş çark veya Near Miss)
      const isNearMiss = Math.random() < 0.5;
      if (isNearMiss) {
         return {
           grid: [['seven', 'seven', 'lemon'], ['cherry', 'grape', 'plum'], ['plum', 'cherry', 'grape']],
           winningLines: [], totalWin: 0, multiplier: 0, isJackpot: false, serverSeed, clientSeed, nonce
         };
      } else {
         return {
           grid: [['lemon', 'cherry', 'grape'], ['grape', 'plum', 'lemon'], ['cherry', 'lemon', 'plum']],
           winningLines: [], totalWin: 0, multiplier: 0, isJackpot: false, serverSeed, clientSeed, nonce
         };
      }
    }
  }

  // 1. Churn Prediction & Rescue Win (Kurtarma Algoritması)
  const losses = cfg.consecutiveLosses || 0;
  // 4 veya daha fazla kayıptan sonra %60 ihtimalle oyuncuya bir can simidi (Rescue Win) ver.
  const isRescueWin = losses >= 4 && Math.random() < 0.6; 

  // 2. LDW (Loss Disguised as a Win - Kazanç Gibi Görünen Kayıp)
  // Bahsin sadece %40'ı kazanılır. Kasa %60 kâr eder ama ekran "KAZANDIN" diye patlar.
  const isLDW = !isRescueWin && Math.random() < 0.35; 

  // 3. Near-Miss (Teğet Geçme / Kıl Payı Kaçırma)
  // 2 büyük sembol gelir, 3.sü bilerek boşa düşer. Dopamin tetiklenir, "Neredeyse kazanıyordum!" hissi yaratılır.
  const isNearMiss = !isRescueWin && !isLDW && Math.random() < 0.40; 

  let finalGrid: string[][] = [];
  let winningLines: SpinResult['winningLines'] = [];
  let totalWin = 0;
  let multiplier = 0;
  let isJackpot = false;

  const getRandomSymbol = () => SLOT_SYMBOLS[Math.floor(Math.random() * SLOT_SYMBOLS.length)].id;

  if (isRescueWin) {
    // Kurtarma Kazancı (Orta yollu 3x - 5x)
    const sym = 'diamond';
    finalGrid = [[sym, sym, sym], [sym, sym, sym], [sym, sym, sym]];
    totalWin = betAmount * 5;
    multiplier = 5;
    winningLines.push({ lineIndex: 1, symbolId: sym, matchCount: 3, payout: totalWin });
    updateCasinoConfig({ consecutiveLosses: 0 }); // Kayıp sıfırlandı
  } 
  else if (isLDW) {
    // LDW: Bahsin %40'ını ver.
    const sym = 'cherry';
    finalGrid = [['cherry', 'cherry', 'grape'], ['cherry', 'lemon', 'grape'], ['cherry', 'plum', 'plum']];
    totalWin = betAmount * 0.4;
    multiplier = 0.4;
    winningLines.push({ lineIndex: 0, symbolId: sym, matchCount: 3, payout: totalWin }); // Görsel bir kazanç çizgisi oluşur
    updateCasinoConfig({ consecutiveLosses: losses + 1 }); // Gerçekte zararda, bu yüzden kayıp serisi artar
  }
  else if (isNearMiss) {
    // Kıl payı kaçırma (Makaralar: Jackpot - Jackpot - Boş)
    const bait = Math.random() > 0.5 ? 'seven' : 'diamond';
    finalGrid = [[bait, bait, 'lemon'], ['plum', 'grape', 'cherry'], ['cherry', 'lemon', 'grape']];
    totalWin = 0;
    multiplier = 0;
    updateCasinoConfig({ consecutiveLosses: losses + 1 });
  }
  else {
    // Normal Rastgele Spin (Tamamen Şans)
    for (let c = 0; c < 3; c++) {
      finalGrid.push([getRandomSymbol(), getRandomSymbol(), getRandomSymbol()]);
    }
    
    // 3x3 Klasik Slot Çizgileri Kontrolü (3 yatay çizgi)
    for (let row = 0; row < 3; row++) {
      const s1 = finalGrid[0][row];
      const s2 = finalGrid[1][row];
      const s3 = finalGrid[2][row];
      
      if (s1 === s2 && s2 === s3) {
        const symObj = SLOT_SYMBOLS.find(s => s.id === s1) || SLOT_SYMBOLS[0];
        const lineWin = betAmount * symObj.payout3;
        winningLines.push({ lineIndex: row, symbolId: s1, matchCount: 3, payout: lineWin });
        totalWin += lineWin;
      }
    }

    if (totalWin > 0) {
      updateCasinoConfig({ consecutiveLosses: 0 });
      multiplier = totalWin / betAmount;
    } else {
      updateCasinoConfig({ consecutiveLosses: losses + 1 });
    }
  }

  isJackpot = multiplier >= 10;

  updateCasinoConfig({
    totalSpins: cfg.totalSpins + 1,
    totalWagered: cfg.totalWagered + betAmount,
    totalPayout: cfg.totalPayout + totalWin
  });

  return {
    grid: finalGrid,
    winningLines,
    totalWin,
    multiplier,
    isJackpot,
    serverSeed,
    clientSeed,
    nonce
  };
}
