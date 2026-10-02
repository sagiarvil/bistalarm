import { UserAccount, Position } from './tradingEngine';
import { VIDEO_HISTORY_ITEMS, VIDEO_QUOTES_SYMBOLS } from './videoReferenceData';

// Başlangıç Fiyatları (Videodaki Fiyatlar ekranı)
export const CURRENT_PRICES: Record<string, { bid: number; ask: number; high: number; low: number; time: string }> = {
  'NASDAQ.j': { bid: 30411.30, ask: 30412.00, high: 30967.40, low: 30408.70, time: '17:22:42' },
  'XAUUSDX': { bid: 4157.43, ask: 4158.13, high: 4182.59, low: 4139.04, time: '17:22:43' },
  'DAX.j': { bid: 25001.80, ask: 25002.40, high: 25234.80, low: 24828.40, time: '17:22:43' },
  'DXY.j': { bid: 101.796, ask: 101.831, high: 101.996, low: 101.456, time: '17:22:44' },
  'XAGUSD': { bid: 60.780, ask: 60.800, high: 61.4190, low: 59.9560, time: '17:22:43' },
  'US2000.j': { bid: 2781.15, ask: 2782.15, high: 2816.25, low: 2772.55, time: '17:22:43' },
  'BOOM1000': { bid: 12450.80, ask: 12451.30, high: 12690.00, low: 12380.00, time: '17:22:45' },
  'CRASH500': { bid: 8750.20, ask: 8750.70, high: 8920.00, low: 8610.00, time: '17:22:45' },
  'ARB-USDT': { bid: 1.002, ask: 1.012, high: 1.025, low: 0.995, time: '17:22:45' }
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
