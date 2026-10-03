export interface MT5AccountItem {
  id: string;
  name: string;
  login: number;
  server: string;
  balance: number;
  currency: string;
  type: string; // 'Hedge'
  badge?: 'Demo' | 'Master';
  logoType: 'fxpro' | 'xm' | 'raxon' | 'metaquotes';
}

export const INITIAL_ACCOUNTS_LIST: MT5AccountItem[] = [
  {
    id: 'acc-1',
    name: 'VIP Trader',
    login: 20767,
    server: 'FXPro-Server',
    balance: 9746.60,
    currency: 'USD',
    type: 'Hedge',
    badge: 'Master',
    logoType: 'fxpro'
  },
  {
    id: 'acc-2',
    name: 'VIP Trader',
    login: 382049711,
    server: 'XMGlobal-MT5 13',
    balance: 0.00,
    currency: 'USD',
    type: 'Hedge',
    logoType: 'xm'
  },
  {
    id: 'acc-3',
    name: 'VIP Trader',
    login: 521124,
    server: 'RaxonMarkets-Server',
    balance: 0.00,
    currency: 'USD',
    type: 'Hedge',
    logoType: 'raxon'
  },
  {
    id: 'acc-4',
    name: 'VIP Trader',
    login: 113044428,
    server: 'MetaQuotes-Demo',
    balance: 22.75,
    currency: 'USD',
    type: 'Hedge',
    badge: 'Demo',
    logoType: 'metaquotes'
  },
  {
    id: 'acc-5',
    name: 'VIP Trader',
    login: 113036031,
    server: 'MetaQuotes-Demo',
    balance: 3711.78,
    currency: 'USD',
    type: 'Hedge',
    badge: 'Demo',
    logoType: 'metaquotes'
  }
];

// Videoda Geçmiş Ekranında Görünen Tüm İşlemler (Eksiksiz Liste)
export const VIDEO_HISTORY_ITEMS = [
  // Görsel 1'deki işlemler
  { symbol: 'DAX.j', side: 'buy', lots: 0.2, openPrice: 25000.00, closePrice: 25149.18, profit: 842.20, closeTime: '2026.10.01 14:08:20' },
  { symbol: 'Balance', side: 'balance', lots: 0, openPrice: 0, closePrice: 0, profit: -1000.00, closeTime: '2026.10.01 14:30:43', comment: 'Withdrawal SC' },
  { symbol: 'DAX.j', side: 'sell', lots: 0.15, openPrice: 25181.14, closePrice: 25148.96, profit: 136.17, closeTime: '2026.10.01 16:25:23' },
  { symbol: 'NASDAQ.j', side: 'sell', lots: 0.05, openPrice: 30562.82, closePrice: 30530.18, profit: 32.64, closeTime: '2026.10.01 16:50:20' },
  { symbol: 'NASDAQ.j', side: 'sell', lots: 0.05, openPrice: 30603.99, closePrice: 30530.26, profit: 73.73, closeTime: '2026.10.01 16:50:20' },
  { symbol: 'NASDAQ.j', sell: 'sell', lots: 0.15, openPrice: 30605.48, closePrice: 30530.19, profit: 225.87, closeTime: '2026.10.01 16:50:20' },
  { symbol: 'DAX.j', side: 'buy', lots: 0.05, openPrice: 25379.09, closePrice: 25006.03, profit: -526.37, closeTime: '2026.10.01 17:19:33' },
  { symbol: 'DAX.j', side: 'buy', lots: 0.05, openPrice: 25306.83, closePrice: 25005.90, profit: -424.59, closeTime: '2026.10.01 17:19:33' },
  { symbol: 'DAX.j', side: 'buy', lots: 0.05, openPrice: 25257.47, closePrice: 25006.06, profit: -354.72, closeTime: '2026.10.01 17:19:34' },
  { symbol: 'NASDAQ.j', side: 'buy', lots: 0.1, openPrice: 30665.55, closePrice: 30419.10, profit: -492.90, closeTime: '2026.10.01 17:19:34' },
  
  // Videoda yukarı kaydırınca çıkan önceki işlemler (00:03 - 00:15)
  { symbol: 'NASDAQ.j', side: 'buy', lots: 0.1, openPrice: 30661.25, closePrice: 30624.37, profit: 368.80, closeTime: '2026.10.01 11:22:39' },
  { symbol: 'XAUUSDX', side: 'buy', lots: 1.0, openPrice: 4163.19, closePrice: 4187.31, profit: 2412.00, closeTime: '2026.10.01 09:36:43' },
  { symbol: 'XAUUSDX', side: 'buy', lots: 0.2, openPrice: 4172.47, closePrice: 4187.20, profit: -111.40, closeTime: '2026.10.01 09:36:32' },
  { symbol: 'XAUUSDX', side: 'buy', lots: 0.5, openPrice: 4176.12, closePrice: 4187.49, profit: 568.50, closeTime: '2026.10.01 09:36:29' },
  { symbol: 'NASDAQ.j', side: 'sell', lots: 0.05, openPrice: 30596.90, closePrice: 30546.58, profit: 50.32, closeTime: '2026.09.30 16:31:39' },
  { symbol: 'NASDAQ.j', side: 'sell', lots: 0.05, openPrice: 30513.75, closePrice: 30485.00, profit: 71.25, closeTime: '2026.09.30 14:31:30' },
  { symbol: 'NASDAQ.j', side: 'buy', lots: 0.05, openPrice: 30419.14, closePrice: 30563.26, profit: 144.12, closeTime: '2026.09.30 12:47:19' },
  { symbol: 'NASDAQ.j', side: 'buy', lots: 0.05, openPrice: 30352.78, closePrice: 30566.22, profit: 213.44, closeTime: '2026.09.30 12:17:18' },
  { symbol: 'XAUUSDX', side: 'sell', lots: 0.5, openPrice: 4197.50, closePrice: 4189.52, profit: 399.00, closeTime: '2026.09.30 12:17:17' },
  { symbol: 'NASDAQ.j', side: 'sell', lots: 0.05, openPrice: 30504.92, closePrice: 30488.30, profit: 16.62, closeTime: '2026.09.30 01:41:20' },
  { symbol: 'NASDAQ.j', side: 'sell', lots: 0.05, openPrice: 30504.92, closePrice: 30488.30, profit: 16.62, closeTime: '2026.09.30 01:41:20' },
  { symbol: 'NASDAQ.j', side: 'sell', lots: 0.05, openPrice: 30504.91, closePrice: 30488.16, profit: 16.75, closeTime: '2026.09.30 01:41:20' },
  { symbol: 'NASDAQ.j', side: 'sell', lots: 0.05, openPrice: 30504.33, closePrice: 30488.03, profit: 16.30, closeTime: '2026.09.30 01:41:20' },

  // Başlangıç Yükleme Hareketleri (00:06)
  { symbol: 'Credit', side: 'credit', lots: 0, openPrice: 0, closePrice: 0, profit: 4098.00, closeTime: '2026.09.16 17:14:30', comment: 'Credit in SY 5 gün çekimsiz' },
  { symbol: 'Balance', side: 'balance', lots: 0, openPrice: 0, closePrice: 0, profit: 8195.00, closeTime: '2026.09.16 17:14:23', comment: 'First deposit SY' }
];

// Videodaki Fiyatlar Ekranı Sembolleri (00:00 & 00:35)
export const VIDEO_QUOTES_SYMBOLS = {
  'NASDAQ.j': {
    name: 'US Tech 100 Index',
    changePips: -12680,
    changePercent: -0.42,
    spread: 70,
    bid: 30411.30,
    ask: 30412.00,
    low: 30408.70,
    high: 30967.40,
    time: '17:22:42',
    digits: 2
  },
  'XAUUSDX': {
    name: 'Gold vs US Dollar',
    changePips: 69,
    changePercent: 0.02,
    spread: 70,
    bid: 4157.43,
    ask: 4158.13,
    low: 4139.04,
    high: 4182.59,
    time: '17:22:43',
    digits: 2
  },
  'DAX.j': {
    name: 'Germany 40 Index',
    changePips: -10390,
    changePercent: -0.41,
    spread: 60,
    bid: 25001.80,
    ask: 25002.40,
    low: 24828.40,
    high: 25234.80,
    time: '17:22:43',
    digits: 2
  },
  'DXY.j': {
    name: 'US Dollar Index',
    changePips: 336,
    changePercent: 0.33,
    spread: 35,
    bid: 101.796,
    ask: 101.831,
    low: 101.456,
    high: 101.996,
    time: '17:22:44',
    digits: 3
  },
  'XAGUSD': {
    name: 'Silver vs US Dollar',
    changePips: 4260,
    changePercent: 0.82,
    spread: 190,
    bid: 60.780,
    ask: 60.800,
    low: 59.9560,
    high: 61.4190,
    time: '17:22:43',
    digits: 3
  },
  'US2000.j': {
    name: 'US Small Cap 2000 Index',
    changePips: -1900,
    changePercent: -0.68,
    spread: 100,
    bid: 2781.15,
    ask: 2782.15,
    low: 2772.55,
    high: 2816.25,
    time: '17:22:43',
    digits: 2
  }
};
