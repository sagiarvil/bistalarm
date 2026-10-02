import Decimal from 'decimal.js';

export interface SymbolSpec {
  symbol: string;
  name: string;
  category: 'Forex' | 'Indices' | 'Commodities' | 'Crypto';
  contractSize: number;
  digits: number;
  pipSize: number;
  spread: number;
  commissionPerLot: number;
  basePrice: number;
}

export const SYMBOL_SPECS: Record<string, SymbolSpec> = {
  'NASDAQ.j': {
    symbol: 'NASDAQ.j',
    name: 'US Tech 100 Index',
    category: 'Indices',
    contractSize: 1,
    digits: 2,
    pipSize: 0.01,
    spread: 0.70,
    commissionPerLot: 1.50,
    basePrice: 30411.30,
  },
  'XAUUSDX': {
    symbol: 'XAUUSDX',
    name: 'Gold vs US Dollar',
    category: 'Commodities',
    contractSize: 100,
    digits: 2,
    pipSize: 0.01,
    spread: 0.70,
    commissionPerLot: 3.50,
    basePrice: 4157.43,
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
    basePrice: 25001.80,
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
  'XAGUSD': {
    symbol: 'XAGUSD',
    name: 'Silver vs US Dollar',
    category: 'Commodities',
    contractSize: 5000,
    digits: 3,
    pipSize: 0.001,
    spread: 0.020,
    commissionPerLot: 2.50,
    basePrice: 60.780,
  },
  'US2000.j': {
    symbol: 'US2000.j',
    name: 'US Small Cap 2000 Index',
    category: 'Indices',
    contractSize: 1,
    digits: 2,
    pipSize: 0.01,
    spread: 1.00,
    commissionPerLot: 1.50,
    basePrice: 2781.15,
  },
  'BOOM1000': {
    symbol: 'BOOM1000',
    name: 'Synthetic Boom 1000 Index (7/24 Spike)',
    category: 'Indices',
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
    category: 'Indices',
    contractSize: 1,
    digits: 2,
    pipSize: 0.01,
    spread: 0.50,
    commissionPerLot: 0.00,
    basePrice: 8750.20,
  },
  'ARB-USDT': {
    symbol: 'ARB-USDT',
    name: 'Latency Arbitrage LP Feed (0-Risk Scalp)',
    category: 'Crypto',
    contractSize: 10,
    digits: 3,
    pipSize: 0.001,
    spread: 0.010,
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
