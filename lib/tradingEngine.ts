import Decimal from 'decimal.js';

export interface SymbolSpec {
  symbol: string;
  name: string;
  category: 'Forex' | 'Indices' | 'Commodities' | 'Crypto' | 'Synthetic';
  contractSize: number;
  digits: number;
  pipSize: number;
  spread: number;
  commissionPerLot: number;
  basePrice: number;
}

export const SYMBOL_SPECS: Record<string, SymbolSpec> = {
  // --- FOREX PARİTELERİ ---
  'EURUSD': {
    symbol: 'EURUSD',
    name: 'Euro vs US Dollar',
    category: 'Forex',
    contractSize: 100000,
    digits: 5,
    pipSize: 0.0001,
    spread: 0.00008,
    commissionPerLot: 3.00,
    basePrice: 1.08450,
  },
  'GBPUSD': {
    symbol: 'GBPUSD',
    name: 'Great Britain Pound vs US Dollar',
    category: 'Forex',
    contractSize: 100000,
    digits: 5,
    pipSize: 0.0001,
    spread: 0.00010,
    commissionPerLot: 3.00,
    basePrice: 1.30250,
  },
  'USDJPY': {
    symbol: 'USDJPY',
    name: 'US Dollar vs Japanese Yen',
    category: 'Forex',
    contractSize: 100000,
    digits: 3,
    pipSize: 0.01,
    spread: 0.010,
    commissionPerLot: 3.00,
    basePrice: 148.650,
  },
  'USDCHF': {
    symbol: 'USDCHF',
    name: 'US Dollar vs Swiss Franc',
    category: 'Forex',
    contractSize: 100000,
    digits: 5,
    pipSize: 0.0001,
    spread: 0.00012,
    commissionPerLot: 3.00,
    basePrice: 0.86540,
  },
  'AUDUSD': {
    symbol: 'AUDUSD',
    name: 'Australian Dollar vs US Dollar',
    category: 'Forex',
    contractSize: 100000,
    digits: 5,
    pipSize: 0.0001,
    spread: 0.00010,
    commissionPerLot: 3.00,
    basePrice: 0.67230,
  },
  'USDCAD': {
    symbol: 'USDCAD',
    name: 'US Dollar vs Canadian Dollar',
    category: 'Forex',
    contractSize: 100000,
    digits: 5,
    pipSize: 0.0001,
    spread: 0.00011,
    commissionPerLot: 3.00,
    basePrice: 1.37890,
  },
  'NZDUSD': {
    symbol: 'NZDUSD',
    name: 'New Zealand Dollar vs US Dollar',
    category: 'Forex',
    contractSize: 100000,
    digits: 5,
    pipSize: 0.0001,
    spread: 0.00014,
    commissionPerLot: 3.00,
    basePrice: 0.60850,
  },
  'EURGBP': {
    symbol: 'EURGBP',
    name: 'Euro vs Great Britain Pound',
    category: 'Forex',
    contractSize: 100000,
    digits: 5,
    pipSize: 0.0001,
    spread: 0.00012,
    commissionPerLot: 3.00,
    basePrice: 0.83260,
  },
  'EURJPY': {
    symbol: 'EURJPY',
    name: 'Euro vs Japanese Yen',
    category: 'Forex',
    contractSize: 100000,
    digits: 3,
    pipSize: 0.01,
    spread: 0.012,
    commissionPerLot: 3.00,
    basePrice: 161.220,
  },
  'GBPJPY': {
    symbol: 'GBPJPY',
    name: 'Great Britain Pound vs Japanese Yen',
    category: 'Forex',
    contractSize: 100000,
    digits: 3,
    pipSize: 0.01,
    spread: 0.015,
    commissionPerLot: 3.00,
    basePrice: 193.650,
  },
  'DXY.j': {
    symbol: 'DXY.j',
    name: 'US Dollar Index',
    category: 'Forex',
    contractSize: 1000,
    digits: 3,
    pipSize: 0.001,
    spread: 0.035,
    commissionPerLot: 1.50,
    basePrice: 101.796,
  },
  'BIST30': {
    symbol: 'BIST30',
    name: 'Borsa Istanbul 30 Endeksi',
    category: 'Indices',
    contractSize: 10,
    digits: 2,
    pipSize: 0.01,
    spread: 0.50,
    commissionPerLot: 1.00,
    basePrice: 9850.40,
  },

  // --- KIYMETLİ METALLER & EMTİA ---
  'XAUUSDX': {
    symbol: 'XAUUSDX',
    name: 'Gold vs US Dollar (Spot)',
    category: 'Commodities',
    contractSize: 100,
    digits: 2,
    pipSize: 0.01,
    spread: 0.15,
    commissionPerLot: 3.50,
    basePrice: 2650.40,
  },
  'XAGUSD': {
    symbol: 'XAGUSD',
    name: 'Silver vs US Dollar',
    category: 'Commodities',
    contractSize: 5000,
    digits: 3,
    pipSize: 0.001,
    spread: 0.020,
    commissionPerLot: 2.50,
    basePrice: 31.450,
  },
  'BRENT.c': {
    symbol: 'BRENT.c',
    name: 'Brent Crude Oil Spot',
    category: 'Commodities',
    contractSize: 100,
    digits: 2,
    pipSize: 0.01,
    spread: 0.03,
    commissionPerLot: 2.00,
    basePrice: 74.80,
  },

  // --- KÜRESEL BORSA ENDEKSLERİ ---
  'NASDAQ.j': {
    symbol: 'NASDAQ.j',
    name: 'US Tech 100 Index',
    category: 'Indices',
    contractSize: 1,
    digits: 2,
    pipSize: 0.01,
    spread: 0.70,
    commissionPerLot: 1.50,
    basePrice: 20450.00,
  },
  'SPX500.j': {
    symbol: 'SPX500.j',
    name: 'S&P 500 Wall Street Index',
    category: 'Indices',
    contractSize: 1,
    digits: 2,
    pipSize: 0.01,
    spread: 0.40,
    commissionPerLot: 1.50,
    basePrice: 5780.50,
  },
  'DAX.j': {
    symbol: 'DAX.j',
    name: 'Germany 40 Index',
    category: 'Indices',
    contractSize: 1,
    digits: 2,
    pipSize: 0.01,
    spread: 0.60,
    commissionPerLot: 1.50,
    basePrice: 19420.00,
  },
  'US2000.j': {
    symbol: 'US2000.j',
    name: 'US Small Cap 2000 Index',
    category: 'Indices',
    contractSize: 1,
    digits: 2,
    pipSize: 0.01,
    spread: 0.50,
    commissionPerLot: 1.50,
    basePrice: 2210.00,
  },

  // --- KRİPTO VARLIKLAR (7/24) ---
  'BTCUSD': {
    symbol: 'BTCUSD',
    name: 'Bitcoin vs US Dollar',
    category: 'Crypto',
    contractSize: 1,
    digits: 2,
    pipSize: 0.01,
    spread: 5.00,
    commissionPerLot: 5.00,
    basePrice: 64200.00,
  },
  'ETHUSD': {
    symbol: 'ETHUSD',
    name: 'Ethereum vs US Dollar',
    category: 'Crypto',
    contractSize: 1,
    digits: 2,
    pipSize: 0.01,
    spread: 0.50,
    commissionPerLot: 2.00,
    basePrice: 2640.00,
  },
  'SOLUSD': {
    symbol: 'SOLUSD',
    name: 'Solana vs US Dollar',
    category: 'Crypto',
    contractSize: 1,
    digits: 2,
    pipSize: 0.01,
    spread: 0.10,
    commissionPerLot: 1.00,
    basePrice: 154.20,
  },
  'XRPUSD': {
    symbol: 'XRPUSD',
    name: 'Ripple vs US Dollar',
    category: 'Crypto',
    contractSize: 100,
    digits: 4,
    pipSize: 0.0001,
    spread: 0.0008,
    commissionPerLot: 0.50,
    basePrice: 0.5420,
  },
  'AVAXUSD': {
    symbol: 'AVAXUSD',
    name: 'Avalanche vs US Dollar',
    category: 'Crypto',
    contractSize: 10,
    digits: 2,
    pipSize: 0.01,
    spread: 0.05,
    commissionPerLot: 0.80,
    basePrice: 28.40,
  },
  'BNBUSD': {
    symbol: 'BNBUSD',
    name: 'Binance Coin vs US Dollar',
    category: 'Crypto',
    contractSize: 1,
    digits: 2,
    pipSize: 0.01,
    spread: 0.30,
    commissionPerLot: 1.20,
    basePrice: 585.60,
  },

  // --- SENTETİK VOLATİLİTE & YENİ NESİL KAZANÇ ENSTRÜMANLARI ---
  'BOOM1000': {
    symbol: 'BOOM1000',
    name: 'Synthetic Boom 1000 Index (7/24 Spike)',
    category: 'Synthetic',
    contractSize: 1,
    digits: 2,
    pipSize: 0.01,
    spread: 0.50,
    commissionPerLot: 0.00,
    basePrice: 12450.80,
  },
  'CRASH500': {
    symbol: 'CRASH500',
    name: 'Synthetic Crash 500 Index (7/24 Drop)',
    category: 'Synthetic',
    contractSize: 1,
    digits: 2,
    pipSize: 0.01,
    spread: 0.50,
    commissionPerLot: 0.00,
    basePrice: 8750.20,
  },
  'VOLATILITY75': {
    symbol: 'VOLATILITY75',
    name: 'Synthetic Volatility 75 Index (7/24)',
    category: 'Synthetic',
    contractSize: 1,
    digits: 2,
    pipSize: 0.01,
    spread: 0.40,
    commissionPerLot: 0.00,
    basePrice: 1450.30,
  },
  'ARB-USDT': {
    symbol: 'ARB-USDT',
    name: 'Latency Arbitrage LP Feed (0-Risk Scalp)',
    category: 'Synthetic',
    contractSize: 10,
    digits: 3,
    pipSize: 0.001,
    spread: 0.002,
    commissionPerLot: 0.50,
    basePrice: 1.002,
  }
};

export type OrderSide = 'buy' | 'sell';
export type OrderType = 'market' | 'buy_limit' | 'sell_limit' | 'buy_stop' | 'sell_stop';
export type PositionStatus = 'open' | 'closed';

export interface Position {
  id: string;
  ticket: number;
  userId: string;
  symbol: string;
  side: OrderSide;
  lots: number;
  openPrice: number;
  openTime: string;
  sl: number | null;
  tp: number | null;
  currentPrice: number;
  closePrice?: number;
  closeTime?: string;
  profit: number;
  commission: number;
  swap: number;
  status: PositionStatus;
  comment?: string;
}

export interface PendingOrder {
  id: string;
  ticket: number;
  userId: string;
  symbol: string;
  type: OrderType;
  side: OrderSide;
  lots: number;
  targetPrice: number;
  sl: number | null;
  tp: number | null;
  placedTime: string;
}

export interface AccountLedger {
  id: string;
  time: string;
  type: 'deposit' | 'withdrawal' | 'credit' | 'trade_profit' | 'commission';
  amount: number;
  description: string;
  ticket?: number;
}

export interface UserAccount {
  id: string;
  login: number;
  name: string;
  role: 'OWNER' | 'MEMBER';
  balance: number;
  credit: number;
  equity: number;
  margin: number;
  freeMargin: number;
  marginLevel: number | null;
  leverage: number;
  positions: Position[];
  pendingOrders: PendingOrder[];
  history: Position[];
  ledger: AccountLedger[];
}

export class TradingEngine {
  public static calculateMargin(
    symbol: string,
    lots: number,
    price: number,
    leverage: number
  ): number {
    const spec = SYMBOL_SPECS[symbol] || { contractSize: 1 };
    const notional = new Decimal(price)
      .times(lots)
      .times(spec.contractSize);
    return notional.dividedBy(leverage).toDecimalPlaces(2, Decimal.ROUND_HALF_UP).toNumber();
  }

  public static calculateProfit(
    symbol: string,
    side: OrderSide,
    lots: number,
    openPrice: number,
    currentPrice: number
  ): number {
    const spec = SYMBOL_SPECS[symbol] || { contractSize: 1 };
    const diff = side === 'buy'
      ? new Decimal(currentPrice).minus(openPrice)
      : new Decimal(openPrice).minus(currentPrice);
    
    return diff
      .times(lots)
      .times(spec.contractSize)
      .toDecimalPlaces(2, Decimal.ROUND_HALF_UP)
      .toNumber();
  }

  public static calculateCommission(
    symbol: string,
    lots: number,
    isRoundTurn: boolean = false
  ): number {
    const spec = SYMBOL_SPECS[symbol] || { commissionPerLot: 3.50 };
    const factor = isRoundTurn ? 2 : 1;
    return new Decimal(spec.commissionPerLot)
      .times(lots)
      .times(factor)
      .toDecimalPlaces(2, Decimal.ROUND_HALF_UP)
      .toNumber();
  }

  public static updateAccountState(account: UserAccount, currentPrices: Record<string, { bid: number; ask: number }>): void {
    let totalMargin = new Decimal(0);
    let totalFloatingProfit = new Decimal(0);

    for (const pos of account.positions) {
      if (pos.status === 'open') {
        const prices = currentPrices[pos.symbol] || { bid: pos.openPrice, ask: pos.openPrice };
        const currentP = pos.side === 'buy' ? prices.bid : prices.ask;
        pos.currentPrice = currentP;

        const profit = this.calculateProfit(pos.symbol, pos.side, pos.lots, pos.openPrice, currentP);
        pos.profit = profit;
        totalFloatingProfit = totalFloatingProfit.plus(profit);

        const margin = this.calculateMargin(pos.symbol, pos.lots, pos.openPrice, account.leverage);
        totalMargin = totalMargin.plus(margin);
      }
    }

    const balanceDec = new Decimal(account.balance);
    const creditDec = new Decimal(account.credit);
    const equityDec = balanceDec.plus(creditDec).plus(totalFloatingProfit);

    account.margin = totalMargin.toNumber();
    account.equity = equityDec.toDecimalPlaces(2, Decimal.ROUND_HALF_UP).toNumber();
    account.freeMargin = equityDec.minus(totalMargin).toDecimalPlaces(2, Decimal.ROUND_HALF_UP).toNumber();

    if (totalMargin.greaterThan(0)) {
      account.marginLevel = equityDec
        .dividedBy(totalMargin)
        .times(100)
        .toDecimalPlaces(2, Decimal.ROUND_HALF_UP)
        .toNumber();
    } else {
      account.marginLevel = null;
    }
  }
}
