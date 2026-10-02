// lib/scenarioEngine.ts
// Gelişmiş Piyasa Simülasyonu ve Senaryo Yönetim Motoru

export type MarketScenario = 
  | 'NORMAL_WALK'        // Dengeli rastgele dalgalanma (Geometric Brownian Motion)
  | 'BULL_TREND'         // Sağlıklı yükseliş trendi (Geri çekilmelerle)
  | 'BEAR_TREND'         // Sağlıklı düşüş trendi (Düzeltmelerle)
  | 'NEWS_SHOCK_SPIKE'   // NFP / Faiz Kararı tarzı ani yukarı iğne ve volatilite patlaması
  | 'NEWS_SHOCK_DUMP'    // Ani aşağı çöküş ve stop avı (Wick)
  | 'LIQUIDITY_HUNT'     // Testere piyasası: Hem yukarı hem aşağı stopları patlatan sahte kırılımlar
  | 'FLASH_CRASH_V_RECOVERY' // Ani %3-5 çöküş ve dakikalar içinde geri toparlanma
  | 'WEEKEND_CRYPTO_RUSH'    // 7/24 kesintisiz yüksek volatilite sentetik hareket
  | 'ARBITRAGE_GAP';     // 5-10 saniyelik arbitraj fırsat aralığı (Spread açılması/kayması)

export interface ScenarioConfig {
  activeScenario: MarketScenario;
  volatilityMultiplier: number; // 0.5x (sakin) - 5.0x (vahşi)
  bias: number;                 // -1.0 (aşırı satıcılı) ile +1.0 (aşırı alıcılı)
  shockProbability: number;     // 0.0 - 0.1 arası ani iğne atma ihtimali
  targetPriceAdjustment?: number; // Adminin yönlendirmek istediği hedef fiyat sapması (%)
  durationSeconds: number;      // Senaryonun aktif kalma süresi (sn)
  remainingSeconds: number;     // Kalan süre
  customNote?: string;          // Senaryo açıklaması / haber başlığı
}

// Varsayılan Admin Senaryo Durumu
export let currentScenarioConfig: ScenarioConfig = {
  activeScenario: 'NORMAL_WALK',
  volatilityMultiplier: 1.0,
  bias: 0.0,
  shockProbability: 0.02,
  durationSeconds: 300,
  remainingSeconds: 300,
  customNote: 'Standart Piyasa Koşulları'
};

export function updateScenarioConfig(newConfig: Partial<ScenarioConfig>) {
  currentScenarioConfig = {
    ...currentScenarioConfig,
    ...newConfig
  };
  return currentScenarioConfig;
}

/**
 * Bir sonraki fiyat değişimini (tick) matematiksel senaryoya göre üretir.
 * Tekdüze artış/azalış yerine gerçek piyasa dinamiklerini (Pullback, Noise, Jump) modeller.
 */
export function calculateNextPrice(
  currentBid: number,
  digits: number,
  spreadPips: number
): { bid: number; ask: number; changeDirection: 'up' | 'down' | 'flat'; isShock: boolean } {
  const cfg = currentScenarioConfig;
  const spread = spreadPips * Math.pow(10, -digits);
  
  // Temel volatilite adımı (örnek EURUSD için 0.00005, XAUUSD için 0.20)
  const baseStep = Math.pow(10, -digits) * 3;
  
  let drift = 0;
  let noise = (Math.random() - 0.5) * 2; // -1 ile +1 arası beyaz gürültü
  let isShock = false;
  let multiplier = cfg.volatilityMultiplier;

  switch (cfg.activeScenario) {
    case 'BULL_TREND':
      // %65 yukarı, %35 aşağı (geri çekilme/pullback ile organik yükseliş)
      drift = Math.random() > 0.35 ? 1.4 : -0.8;
      break;

    case 'BEAR_TREND':
      // %65 aşağı, %35 yukarı (tepki yükselişleriyle organik düşüş)
      drift = Math.random() > 0.35 ? -1.4 : 0.8;
      break;

    case 'NEWS_SHOCK_SPIKE':
      multiplier *= 2.5;
      if (Math.random() < 0.25) {
        drift = 4.5 + Math.random() * 3.0; // Anlık devasa yukarı sıçrama
        isShock = true;
      } else {
        drift = -1.2; // Sıçrama sonrası kâr realizasyonu
      }
      break;

    case 'NEWS_SHOCK_DUMP':
      multiplier *= 2.5;
      if (Math.random() < 0.25) {
        drift = -(4.5 + Math.random() * 3.0); // Anlık devasa aşağı çöküş
        isShock = true;
      } else {
        drift = 1.0; // Tepki alımı
      }
      break;

    case 'LIQUIDITY_HUNT':
      // Testere piyasası: Direnç kırar gibi yapıp anında terse döner
      multiplier *= 1.8;
      drift = Math.sin(Date.now() / 4000) * 3.0; // Sinüzoidal dalga ile stop avı
      break;

    case 'FLASH_CRASH_V_RECOVERY':
      multiplier *= 3.0;
      const cycle = (Date.now() / 1000) % 60; // 60 saniyelik döngü
      if (cycle < 15) {
        drift = -3.5; // Hızlı çöküş
        isShock = true;
      } else if (cycle < 35) {
        drift = 0.2; // Dipte panik konsolidasyonu
      } else {
        drift = 2.8; // Hızlı V-toparlanma
      }
      break;

    case 'ARBITRAGE_GAP':
      // Spread anlık açılır ve fiyat dengesizleşir
      multiplier *= 1.5;
      drift = (Math.random() - 0.5) * 4.0;
      break;

    case 'WEEKEND_CRYPTO_RUSH':
    case 'NORMAL_WALK':
    default:
      // Standart Geometric Brownian Motion
      drift = cfg.bias * 1.0;
      break;
  }

  // Poisson Sıçraması (Beklenmedik Anlık Mikro Şok)
  if (!isShock && Math.random() < cfg.shockProbability) {
    const shockDir = Math.random() > 0.5 ? 1 : -1;
    drift += shockDir * (2.5 + Math.random() * 3.0);
    isShock = true;
  }

  // Delta hesaplama
  const delta = (drift + noise) * baseStep * multiplier;
  let newBid = currentBid + delta;

  // Sıfırın altına veya mantıksız seviyelere düşmesini engelle
  if (newBid <= 0.0001) newBid = currentBid;

  newBid = Number(newBid.toFixed(digits));
  const newAsk = Number((newBid + spread).toFixed(digits));

  let changeDirection: 'up' | 'down' | 'flat' = 'flat';
  if (newBid > currentBid) changeDirection = 'up';
  else if (newBid < currentBid) changeDirection = 'down';

  return {
    bid: newBid,
    ask: newAsk,
    changeDirection,
    isShock
  };
}
