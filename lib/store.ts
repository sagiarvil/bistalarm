import { UserAccount, Position } from './tradingEngine';
import { VIDEO_HISTORY_ITEMS, VIDEO_QUOTES_SYMBOLS } from './videoReferenceData';

// Başlangıç Fiyatları (Videodaki Fiyatlar ekranı)
export const CURRENT_PRICES: Record<string, { bid: number; ask: number; high: number; low: number; time: string }> = {
  // Forex
  'EURUSD': { bid: 1.08450, ask: 1.08458, high: 1.08920, low: 1.08110, time: '17:22:42' },
  'GBPUSD': { bid: 1.30250, ask: 1.30260, high: 1.30880, low: 1.29850, time: '17:22:42' },
  'USDJPY': { bid: 148.650, ask: 148.660, high: 149.200, low: 147.900, time: '17:22:42' },
  'DXY.j': { bid: 101.796, ask: 101.831, high: 101.996, low: 101.456, time: '17:22:44' },

  // Metaller & Emtia
  'XAUUSDX': { bid: 2650.40, ask: 2650.55, high: 2668.20, low: 2642.10, time: '17:22:43' },
  'XAGUSD': { bid: 31.450, ask: 31.470, high: 32.100, low: 30.950, time: '17:22:43' },
  'BRENT.c': { bid: 74.80, ask: 74.83, high: 75.90, low: 73.60, time: '17:22:43' },

  // Endeksler
  'NASDAQ.j': { bid: 20450.00, ask: 20450.70, high: 20620.00, low: 20380.00, time: '17:22:42' },
  'SPX500.j': { bid: 5780.50, ask: 5780.90, high: 5820.00, low: 5750.00, time: '17:22:42' },
  'DAX.j': { bid: 19420.00, ask: 19420.60, high: 19580.00, low: 19310.00, time: '17:22:43' },
  'US2000.j': { bid: 2210.00, ask: 2210.50, high: 2240.00, low: 2190.00, time: '17:22:43' },

  // Kripto
  'BTCUSD': { bid: 64200.00, ask: 64205.00, high: 65400.00, low: 63100.00, time: '17:22:45' },
  'ETHUSD': { bid: 2640.00, ask: 2640.50, high: 2710.00, low: 2580.00, time: '17:22:45' },
  'SOLUSD': { bid: 154.20, ask: 154.30, high: 158.50, low: 149.80, time: '17:22:45' },

  // Sentetik & Arbitraj
  'BOOM1000': { bid: 12450.80, ask: 12451.30, high: 12690.00, low: 12380.00, time: '17:22:45' },
  'CRASH500': { bid: 8750.20, ask: 8750.70, high: 8920.00, low: 8610.00, time: '17:22:45' },
  'VOLATILITY75': { bid: 1450.30, ask: 1450.70, high: 1490.00, low: 1420.00, time: '17:22:45' },
  'ARB-USDT': { bid: 1.002, ask: 1.004, high: 1.025, low: 0.995, time: '17:22:45' }
};

// Videodaki Tüm Geçmiş Pozisyonlar
export const INITIAL_HISTORY: Position[] = VIDEO_HISTORY_ITEMS.map((item, idx) => ({
  id: `pos-${idx + 1}`,
  ticket: 9482100 + idx,
  userId: 'usr-1',
  symbol: item.symbol,
  side: (item.side as any) || 'buy',
  lots: item.lots,
  openPrice: item.openPrice,
  openTime: item.closeTime,
  closePrice: item.closePrice,
  closeTime: item.closeTime,
  sl: null,
  tp: null,
  currentPrice: item.closePrice,
  profit: item.profit,
  commission: item.symbol === 'Balance' || item.symbol === 'Credit' ? 0 : -5.00,
  swap: 0.00,
  status: 'closed',
  comment: (item as any).comment
}));

// Videodaki Kullanıcı Hesabı: Fetih Çetin - 20767
export const INITIAL_ACCOUNT: UserAccount = {
  id: 'usr-1',
  login: 20767,
  name: 'Fetih Çetin',
  role: 'OWNER',
  balance: 9746.60,
  credit: 4098.00,
  equity: 13844.60,
  margin: 0.00,
  freeMargin: 13844.60,
  marginLevel: null,
  leverage: 100,
  positions: [], // Videoda Trade ekranında açık pozisyon yok, büyük ok ikonu var!
  pendingOrders: [],
  history: INITIAL_HISTORY,
  ledger: [
    { id: 'led-1', time: '2026.09.16 17:14:23', type: 'deposit', amount: 8195.00, description: 'First deposit SY' },
    { id: 'led-2', time: '2026.09.16 17:14:30', type: 'credit', amount: 4098.00, description: 'Credit in SY 5 gün çekimsiz' },
    { id: 'led-3', time: '2026.10.01 14:30:43', type: 'withdrawal', amount: -1000.00, description: 'Withdrawal SC' }
  ]
};
