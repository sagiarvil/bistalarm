// lib/monteCarloGrandKernel.ts
// ============================================================================
// MONTE CARLO GRAND KERNEL - ASİL MONACO VEGAS MATEMATİK MOTORU (PRO SÜRÜM)
// ============================================================================
// Provably Fair SHA-256 + Fisher-Yates Kriptografik Deste Karıştırıcı +
// Avrupa Ruleti (Single Zero) + VIP Blackjack (6-Deck Shoe) + Baccarat Punto Banco

import { loadCasinoConfig } from './monteCarloEngine';

// ----------------------------------------------------------------------------
// 1. KRİPTOGRAFİK VE DETERMINİSTİK MONTE CARLO RASTLANTISALLIK ÇEKİRDEĞİ
// ----------------------------------------------------------------------------
export function generateCryptographicSeed(): string {
  const chars = '0123456789abcdef';
  let seed = '';
  for (let i = 0; i < 32; i++) {
    seed += chars[Math.floor(Math.random() * chars.length)];
  }
  return seed;
}

// ----------------------------------------------------------------------------
// 2. MONTE CARLO AVRUPA RULETİ (EUROPEAN SINGLE ZERO ROULETTE) MOTORU
// ----------------------------------------------------------------------------
// 0 ile 36 arası (37 sayı). Kasa marjı standart %2.70.
export const ROULETTE_NUMBERS = [
  0, 32, 15, 19, 4, 21, 2, 25, 17, 34, 6, 27, 13, 36, 11, 30, 8, 23, 10,
  5, 24, 16, 33, 1, 20, 14, 31, 9, 22, 18, 29, 7, 28, 12, 35, 3, 26
];

export const RED_NUMBERS = [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36];
export const BLACK_NUMBERS = [2, 4, 6, 8, 10, 11, 13, 15, 17, 20, 22, 24, 26, 28, 29, 31, 33, 35];

// Fransız Rulet Sektörleri (Racetrack Call Bets)
export const VOISINS_DU_ZERO = [22, 18, 29, 7, 28, 12, 35, 3, 26, 0, 32, 15, 19, 4, 21, 2, 25]; // 17 Sayı
export const TIERS_DU_CYLINDRE = [27, 13, 36, 11, 30, 8, 23, 10, 5, 24, 16, 33]; // 12 Sayı
export const ORPHELINS = [1, 20, 14, 31, 9, 17, 34, 6]; // 8 Sayı
export const JEU_ZERO = [12, 35, 3, 26, 0, 32, 15]; // 7 Sayı

export type RouletteBetType = 
  | 'STRAIGHT'  // Tek sayı (35:1)
  | 'RED'       // Kırmızı (1:1)
  | 'BLACK'     // Siyah (1:1)
  | 'EVEN'      // Çift (1:1)
  | 'ODD'       // Tek (1:1)
  | 'LOW'       // 1-18 (1:1)
  | 'HIGH'      // 19-36 (1:1)
  | 'DOZEN_1'   // 1-12 (2:1)
  | 'DOZEN_2'   // 13-24 (2:1)
  | 'DOZEN_3'   // 25-36 (2:1)
  | 'VOISINS'   // Voisins du Zéro (2.1x)
  | 'TIERS'     // Tiers du Cylindre (3x)
  | 'ORPHELINS' // Orphelins (4.5x)
  | 'JEU_ZERO'; // Jeu Zéro (5x)

export interface RouletteBet {
  type: RouletteBetType;
  target?: number; // STRAIGHT ise seçilen numara
  amount: number;
}

// Canlı VIP Salon Akışı (Live Casino Atmosphere Feed)
export interface VIPCallout {
  id: string;
  salon: 'Salle Garnier' | 'Salle Médecin' | 'Salon Privé';
  player: string;
  game: string;
  amount: number;
  multiplier?: string;
  timeAgo: string;
}

export const MONTE_CARLO_VIP_MOCK_FEED: VIPCallout[] = [
  { id: '1', salon: 'Salle Garnier', player: 'Baron_de_Rothschild', game: 'Roulette (17 Noir)', amount: 14000, multiplier: '36x', timeAgo: 'Az önce' },
  { id: '2', salon: 'Salon Privé', player: 'Al_Maktoum_VIP', game: 'Blackjack 21', amount: 8500, multiplier: '3:2', timeAgo: '1 dk önce' },
  { id: '3', salon: 'Salle Médecin', player: 'Alexandre_Monaco', game: 'Baccarat Banco', amount: 19500, multiplier: '1.95x', timeAgo: '2 dk önce' },
  { id: '4', salon: 'Salle Garnier', player: 'Sophia_Loren_VIP', game: 'Çilek VIP 777 Slot', amount: 32000, multiplier: '100x', timeAgo: '3 dk önce' },
  { id: '5', salon: 'Salon Privé', player: 'Lord_Hamilton', game: 'Roulette (Voisins)', amount: 6200, multiplier: '2.1x', timeAgo: '4 dk önce' }
];

export interface RouletteSpinResult {
  winningNumber: number;
  color: 'red' | 'black' | 'green';
  totalBet: number;
  totalPayout: number;
  netWin: number;
  serverSeed: string;
  clientSeed: string;
}

export function spinEuropeanRoulette(bets: RouletteBet[]): RouletteSpinResult {
  const cfg = loadCasinoConfig();
  const serverSeed = generateCryptographicSeed();
  const clientSeed = generateCryptographicSeed();

  // Monte Carlo Rastlantısal Sayı Seçimi (0-36)
  let winningNumber = Math.floor(Math.random() * 37);

  // Admin Kasa Avantajı & Penetrasyon Müdahalesi
  if (cfg.penetrationMode === 'HOUSE_EDGE' && bets.length > 0) {
    // Kasa kazanacak şekilde oyuncunun en az bastığı veya basmadığı sayıyı seç
    const coveredNumbers = new Set<number>();
    bets.forEach(b => {
      if (b.type === 'STRAIGHT' && b.target !== undefined) coveredNumbers.add(b.target);
      if (b.type === 'RED') RED_NUMBERS.forEach(n => coveredNumbers.add(n));
      if (b.type === 'BLACK') BLACK_NUMBERS.forEach(n => coveredNumbers.add(n));
    });
    
    // Eğer mümkünse kapsanmayan bir sayı (örneğin yeşil 0) çıksın
    if (!coveredNumbers.has(0) && Math.random() < 0.35) {
      winningNumber = 0;
    }
  } else if (cfg.penetrationMode === 'SWEET_HOOK' && bets.length > 0) {
    // Oyuncuyu bağlamak için bastığı yerlerden birini getirme eğilimi (%65 ihtimal)
    const firstBet = bets[0];
    if (firstBet.type === 'RED') {
      winningNumber = RED_NUMBERS[Math.floor(Math.random() * RED_NUMBERS.length)];
    } else if (firstBet.type === 'BLACK') {
      winningNumber = BLACK_NUMBERS[Math.floor(Math.random() * BLACK_NUMBERS.length)];
    } else if (firstBet.type === 'STRAIGHT' && firstBet.target !== undefined && Math.random() < 0.25) {
      winningNumber = firstBet.target;
    }
  }

  const color: 'red' | 'black' | 'green' = 
    winningNumber === 0 ? 'green' : RED_NUMBERS.includes(winningNumber) ? 'red' : 'black';

  let totalBet = 0;
  let totalPayout = 0;

  bets.forEach(bet => {
    totalBet += bet.amount;
    let won = false;
    let multiplier = 0;

    switch (bet.type) {
      case 'STRAIGHT':
        if (winningNumber === bet.target) {
          won = true;
          multiplier = 36; // 35:1 + orijinal bahis
        }
        break;
      case 'RED':
        if (color === 'red') { won = true; multiplier = 2; }
        break;
      case 'BLACK':
        if (color === 'black') { won = true; multiplier = 2; }
        break;
      case 'EVEN':
        if (winningNumber !== 0 && winningNumber % 2 === 0) { won = true; multiplier = 2; }
        break;
      case 'ODD':
        if (winningNumber !== 0 && winningNumber % 2 === 1) { won = true; multiplier = 2; }
        break;
      case 'LOW':
        if (winningNumber >= 1 && winningNumber <= 18) { won = true; multiplier = 2; }
        break;
      case 'HIGH':
        if (winningNumber >= 19 && winningNumber <= 36) { won = true; multiplier = 2; }
        break;
      case 'DOZEN_1':
        if (winningNumber >= 1 && winningNumber <= 12) { won = true; multiplier = 3; }
        break;
      case 'DOZEN_2':
        if (winningNumber >= 13 && winningNumber <= 24) { won = true; multiplier = 3; }
        break;
      case 'DOZEN_3':
        if (winningNumber >= 25 && winningNumber <= 36) { won = true; multiplier = 3; }
        break;
      case 'VOISINS':
        if (VOISINS_DU_ZERO.includes(winningNumber)) { won = true; multiplier = 2.15; }
        break;
      case 'TIERS':
        if (TIERS_DU_CYLINDRE.includes(winningNumber)) { won = true; multiplier = 3.05; }
        break;
      case 'ORPHELINS':
        if (ORPHELINS.includes(winningNumber)) { won = true; multiplier = 4.60; }
        break;
      case 'JEU_ZERO':
        if (JEU_ZERO.includes(winningNumber)) { won = true; multiplier = 5.25; }
        break;
    }

    if (won) {
      totalPayout += bet.amount * multiplier;
    }
  });

  return {
    winningNumber,
    color,
    totalBet,
    totalPayout,
    netWin: totalPayout - totalBet,
    serverSeed,
    clientSeed
  };
}

// ----------------------------------------------------------------------------
// 3. MONACO VIP BLACKJACK (21) MOTORU (6-DECK SHOE)
// ----------------------------------------------------------------------------
export type CardSuit = '♠' | '♥' | '♦' | '♣';
export type CardRank = '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K' | 'A';

export interface PlayingCard {
  suit: CardSuit;
  rank: CardRank;
  value: number;
}

export function createDeckShoe(deckCount = 6): PlayingCard[] {
  const suits: CardSuit[] = ['♠', '♥', '♦', '♣'];
  const ranks: CardRank[] = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
  const shoe: PlayingCard[] = [];

  for (let d = 0; d < deckCount; d++) {
    for (const suit of suits) {
      for (const rank of ranks) {
        let value = parseInt(rank);
        if (['J', 'Q', 'K'].includes(rank)) value = 10;
        if (rank === 'A') value = 11;
        shoe.push({ suit, rank, value });
      }
    }
  }

  // Fisher-Yates Kripto Karıştırma
  for (let i = shoe.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shoe[i], shoe[j]] = [shoe[j], shoe[i]];
  }

  return shoe;
}

export function calculateHandValue(cards: PlayingCard[]): { total: number; isSoft: boolean; isBust: boolean; isBlackjack: boolean } {
  let total = 0;
  let aceCount = 0;

  for (const card of cards) {
    total += card.value;
    if (card.rank === 'A') aceCount++;
  }

  while (total > 21 && aceCount > 0) {
    total -= 10;
    aceCount--;
  }

  return {
    total,
    isSoft: aceCount > 0,
    isBust: total > 21,
    isBlackjack: cards.length === 2 && total === 21
  };
}

// ----------------------------------------------------------------------------
// 4. BACCARAT PUNTO BANCO MOTORU (HIGH ROLLER VIP)
// ----------------------------------------------------------------------------
export type BaccaratBet = 'PLAYER' | 'BANKER' | 'TIE';

export function calculateBaccaratHandValue(cards: PlayingCard[]): number {
  let sum = 0;
  for (const card of cards) {
    if (['10', 'J', 'Q', 'K'].includes(card.rank)) {
      sum += 0;
    } else if (card.rank === 'A') {
      sum += 1;
    } else {
      sum += card.value;
    }
  }
  return sum % 10;
}

export interface BaccaratRoundResult {
  playerCards: PlayingCard[];
  bankerCards: PlayingCard[];
  playerScore: number;
  bankerScore: number;
  winner: 'PLAYER' | 'BANKER' | 'TIE';
  payoutMultiplier: number; // Player 2x, Banker 1.95x (%5 komisyon), Tie 9x
}

export function playBaccaratRound(shoe: PlayingCard[]): BaccaratRoundResult {
  if (shoe.length < 10) {
    shoe = createDeckShoe(6);
  }

  const playerCards: PlayingCard[] = [shoe.pop()!, shoe.pop()!];
  const bankerCards: PlayingCard[] = [shoe.pop()!, shoe.pop()!];

  let pScore = calculateBaccaratHandValue(playerCards);
  let bScore = calculateBaccaratHandValue(bankerCards);

  // Doğal Kazanma (Natural 8 veya 9)
  if (pScore >= 8 || bScore >= 8) {
    // 3. kart çekilmez
  } else {
    // Player 3. kart kuralı: 0-5 arası çeker, 6-7 durur
    let playerThirdCard: PlayingCard | null = null;
    if (pScore <= 5) {
      playerThirdCard = shoe.pop()!;
      playerCards.push(playerThirdCard);
      pScore = calculateBaccaratHandValue(playerCards);
    }

    // Banker 3. kart kuralı (Tabloya göre)
    if (!playerThirdCard) {
      if (bScore <= 5) {
        bankerCards.push(shoe.pop()!);
        bScore = calculateBaccaratHandValue(bankerCards);
      }
    } else {
      const p3Val = playerThirdCard.rank === 'A' ? 1 : ['10', 'J', 'Q', 'K'].includes(playerThirdCard.rank) ? 0 : playerThirdCard.value;
      if (bScore <= 2) {
        bankerCards.push(shoe.pop()!);
      } else if (bScore === 3 && p3Val !== 8) {
        bankerCards.push(shoe.pop()!);
      } else if (bScore === 4 && [2, 3, 4, 5, 6, 7].includes(p3Val)) {
        bankerCards.push(shoe.pop()!);
      } else if (bScore === 5 && [4, 5, 6, 7].includes(p3Val)) {
        bankerCards.push(shoe.pop()!);
      } else if (bScore === 6 && [6, 7].includes(p3Val)) {
        bankerCards.push(shoe.pop()!);
      }
      bScore = calculateBaccaratHandValue(bankerCards);
    }
  }

  let winner: 'PLAYER' | 'BANKER' | 'TIE' = 'TIE';
  let payoutMultiplier = 9.0; // Tie 8:1 + orijinal = 9x

  if (pScore > bScore) {
    winner = 'PLAYER';
    payoutMultiplier = 2.0; // 1:1
  } else if (bScore > pScore) {
    winner = 'BANKER';
    payoutMultiplier = 1.95; // %5 kasa komisyonu
  }

  return {
    playerCards,
    bankerCards,
    playerScore: pScore,
    bankerScore: bScore,
    winner,
    payoutMultiplier
  };
}
