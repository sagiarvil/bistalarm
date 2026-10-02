import { SymbolSpec } from './tradingEngine';

export interface DOMLevel {
  price: number;
  bidVolume: number;
  askVolume: number;
}

export interface NewsItem {
  id: string;
  time: string;
  category: string;
  title: string;
  content: string;
}

export interface MailboxItem {
  id: string;
  time: string;
  sender: string;
  subject: string;
  body: string;
  read: boolean;
}

export interface EconomicEvent {
  id: string;
  time: string;
  currency: string;
  impact: 'low' | 'medium' | 'high';
  event: string;
  actual?: string;
  forecast?: string;
  previous?: string;
}

export const INITIAL_NEWS: NewsItem[] = [
  {
    id: 'n-1',
    time: '17:15',
    category: 'Indices',
    title: 'DAX 40 ve NASDAQ Rekor Seviyeleri Test Ediyor',
    content: 'Avrupa ve ABD piyasalarında teknoloji hisselerinin öncülüğünde güçlü alıcılı seyir devam ediyor. DAX.j 25.150 direncinin üzerinde kalıcılık arıyor.'
  },
  {
    id: 'n-2',
    time: '16:40',
    category: 'Forex',
    title: 'EUR/USD Paritesinde ECB Faiz Beklentileri Fiyatlanıyor',
    content: 'Avrupa Merkez Bankası yetkililerinin enflasyon değerlendirmeleri sonrasında euro dolar karşısında 1.0850 bandında dengeleniyor.'
  },
  {
    id: 'n-3',
    time: '15:20',
    category: 'Commodities',
    title: 'Altın (XAUUSD) 4.300 Doların Üzerinde Güç Topluyor',
    content: 'Küresel merkez bankası alımları ve jeopolitik gelişmeler ons altın fiyatlarını tarihi zirvelerde destekliyor.'
  }
];

export const INITIAL_MAILBOX: MailboxItem[] = [
  {
    id: 'm-1',
    time: '2026.10.01 09:00',
    sender: 'MetaQuotes MT5 Server',
    subject: 'Müşteri Hesabınız Başarıyla Aktifleştirildi (#5892144)',
    body: 'Sayın Barış Bağırlı, MetaTrader 5 Pro Kaldıraçlı Forex/CFD müşteri hesabınız 1:100 kaldıraç ve 13.844,60 USD bakiye ile tam yetkilendirilmiştir.',
    read: true
  },
  {
    id: 'm-2',
    time: '2026.10.01 14:31',
    sender: 'Sistem Muhasebe Departmanı',
    subject: 'Para Çekme Onayı (Withdrawal SC -1000.00 USD)',
    body: 'Hesabınızdan 1.000,00 USD tutarındaki para çekme talebi başarıyla işlenmiş ve bakiyeniz güncellenmiştir.',
    read: true
  },
  {
    id: 'm-3',
    time: '2026.10.02 08:30',
    sender: 'Risk Yönetim Masası',
    subject: 'Haftalık Kaldıraçlı İşlem Marjin ve Stop-out Bülteni',
    body: 'Stop-out seviyesi %50 olarak uygulanmaktadır. Teminat seviyenizin risk eşiklerine dikkat etmenizi tavsiye ederiz.',
    read: false
  }
];

export const INITIAL_CALENDAR: EconomicEvent[] = [
  {
    id: 'c-1',
    time: '15:30',
    currency: 'USD',
    impact: 'high',
    event: 'Tarım Dışı İstihdam (NFP)',
    actual: '215K',
    forecast: '190K',
    previous: '185K'
  },
  {
    id: 'c-2',
    time: '15:30',
    currency: 'USD',
    impact: 'high',
    event: 'İşsizlik Oranı',
    actual: '%4.1',
    forecast: '%4.2',
    previous: '%4.2'
  },
  {
    id: 'c-3',
    time: '16:00',
    currency: 'EUR',
    impact: 'medium',
    event: 'Euro Bölgesi İmalat PMI',
    actual: '49.8',
    forecast: '49.2',
    previous: '48.9'
  }
];
