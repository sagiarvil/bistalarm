// lib/authStore.ts
'use client';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  password?: string;
  avatar?: string;
  role: 'user' | 'admin';
  createdAt: string;
  accountNumber: number;
  balance: number;
  credit: number;
  leverage: number;
  status: 'active' | 'suspended';
  verified: boolean;
}

export interface FinancialRequest {
  id: string;
  userId: string;
  userEmail: string;
  type: 'deposit' | 'withdraw';
  amount: number;
  method: string;
  details?: string;
  createdAt: string;
  status: 'pending' | 'approved' | 'rejected';
}

const DEFAULT_USERS: AuthUser[] = [
  {
    id: 'usr-admin-1',
    email: 'admin@exbina.com',
    name: 'Exbina Master Dealer',
    password: 'admin',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop',
    role: 'admin',
    createdAt: '2026-01-01 10:00:00',
    accountNumber: 9482100,
    balance: 50000.00,
    credit: 10000.00,
    leverage: 500,
    status: 'active',
    verified: true
  },
  {
    id: 'usr-demo-1',
    email: 'trader@exbina.com',
    name: 'Barış B. (VIP Trader)',
    password: '123',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop',
    role: 'user',
    createdAt: '2026-03-15 14:20:00',
    accountNumber: 9482104,
    balance: 10000.00,
    credit: 2500.00,
    leverage: 1000,
    status: 'active',
    verified: true
  },
  {
    id: 'usr-demo-2',
    email: 'selin.kaya@gmail.com',
    name: 'Selin Kaya',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop',
    role: 'user',
    createdAt: '2026-03-20 09:12:00',
    accountNumber: 9482118,
    balance: 3450.00,
    credit: 500.00,
    leverage: 500,
    status: 'active',
    verified: true
  }
];

const DEFAULT_REQUESTS: FinancialRequest[] = [
  {
    id: 'req-101',
    userId: 'usr-demo-1',
    userEmail: 'trader@exbina.com',
    type: 'deposit',
    amount: 2500,
    method: 'USDT (TRC20)',
    details: 'TxID: 0x9f82...3b12',
    createdAt: '2026-10-02 21:15',
    status: 'pending'
  },
  {
    id: 'req-102',
    userId: 'usr-demo-2',
    userEmail: 'selin.kaya@gmail.com',
    type: 'withdraw',
    amount: 850,
    method: 'Banka Havalesi',
    details: 'TR33 0006 1005 1234 5678 9012 34',
    createdAt: '2026-10-02 22:40',
    status: 'pending'
  }
];

export class AuthStore {
  private static USERS_KEY = 'mt5_registered_users';
  private static CURRENT_USER_KEY = 'mt5_active_user';
  private static REQUESTS_KEY = 'mt5_financial_requests';

  static getUsers(): AuthUser[] {
    if (typeof window === 'undefined') return DEFAULT_USERS;
    const data = localStorage.getItem(this.USERS_KEY);
    if (!data) {
      localStorage.setItem(this.USERS_KEY, JSON.stringify(DEFAULT_USERS));
      return DEFAULT_USERS;
    }
    try {
      return JSON.parse(data);
    } catch {
      return DEFAULT_USERS;
    }
  }

  static saveUsers(users: AuthUser[]): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(this.USERS_KEY, JSON.stringify(users));
  }

  static getCurrentUser(): AuthUser {
    if (typeof window === 'undefined') return DEFAULT_USERS[1];
    const data = localStorage.getItem(this.CURRENT_USER_KEY);
    if (!data) {
      const def = DEFAULT_USERS[1]; // Varsayılan VIP Trader
      localStorage.setItem(this.CURRENT_USER_KEY, JSON.stringify(def));
      return def;
    }
    try {
      return JSON.parse(data);
    } catch {
      return DEFAULT_USERS[1];
    }
  }

  static setCurrentUser(user: AuthUser): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(this.CURRENT_USER_KEY, JSON.stringify(user));
    // mt5_user_account ile de senkronize et
    const existing = localStorage.getItem('mt5_user_account');
    if (existing) {
      try {
        const acc = JSON.parse(existing);
        acc.id = user.id;
        acc.name = user.name;
        acc.accountNumber = user.accountNumber;
        acc.balance = user.balance;
        acc.credit = user.credit;
        acc.leverage = user.leverage;
        localStorage.setItem('mt5_user_account', JSON.stringify(acc));
      } catch {}
    }
  }

  static login(email: string, password?: string): { user?: AuthUser; error?: string } {
    const users = this.getUsers();
    let user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (user) {
      // Eğer kullanıcıya bir şifre atanmışsa ve girilen şifre uyuşmuyorsa
      if (user.password && password && user.password !== password) {
        return { error: 'Girdiğiniz şifre hatalıdır. Lütfen kontrol ediniz.' };
      }
      this.setCurrentUser(user);
      return { user };
    }

    // Yeni kullanıcı hızlı oluşturma
    const name = email.split('@')[0];
    const capitalized = name.charAt(0).toUpperCase() + name.slice(1);
    user = {
      id: `usr-${Date.now()}`,
      email,
      name: capitalized,
      password: password || '123456',
      role: email.includes('admin') ? 'admin' : 'user',
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
      accountNumber: Math.floor(9480000 + Math.random() * 9000),
      balance: 10000.00,
      credit: 1000.00,
      leverage: 1000,
      status: 'active',
      verified: true
    };
    users.push(user);
    this.saveUsers(users);
    this.setCurrentUser(user);
    return { user };
  }

  static createUser(userData: {
    email: string;
    name: string;
    password?: string;
    balance?: number;
    leverage?: number;
    role?: 'user' | 'admin';
  }): AuthUser {
    const users = this.getUsers();
    const existing = users.find(u => u.email.toLowerCase() === userData.email.toLowerCase());
    if (existing) {
      // Güncelle
      if (userData.password) existing.password = userData.password;
      if (userData.name) existing.name = userData.name;
      if (userData.balance !== undefined) existing.balance = userData.balance;
      if (userData.leverage !== undefined) existing.leverage = userData.leverage;
      this.saveUsers(users);
      return existing;
    }

    const newUser: AuthUser = {
      id: `usr-${Date.now()}`,
      email: userData.email,
      name: userData.name || userData.email.split('@')[0],
      password: userData.password || '123456',
      role: userData.role || 'user',
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
      accountNumber: Math.floor(9480000 + Math.random() * 9000),
      balance: userData.balance ?? 10000.00,
      credit: 1000.00,
      leverage: userData.leverage ?? 500,
      status: 'active',
      verified: true
    };
    users.unshift(newUser);
    this.saveUsers(users);
    return newUser;
  }

  static loginWithGoogle(): AuthUser {
    const users = this.getUsers();
    const googleEmail = 'google.trader@gmail.com';
    let user = users.find(u => u.email === googleEmail);
    if (!user) {
      user = {
        id: `usr-google-${Date.now()}`,
        email: googleEmail,
        name: 'Google Trader (Verified)',
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop',
        role: 'user',
        createdAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
        accountNumber: Math.floor(9480000 + Math.random() * 9000),
        balance: 10000.00,
        credit: 2000.00,
        leverage: 1000,
        status: 'active',
        verified: true
      };
      users.push(user);
      this.saveUsers(users);
    }
    this.setCurrentUser(user);
    return user;
  }

  static updateUser(id: string, partial: Partial<AuthUser>): void {
    const users = this.getUsers();
    const idx = users.findIndex(u => u.id === id);
    if (idx !== -1) {
      users[idx] = { ...users[idx], ...partial };
      this.saveUsers(users);
      const current = this.getCurrentUser();
      if (current.id === id) {
        this.setCurrentUser(users[idx]);
      }
    }
  }

  static deleteUser(id: string): void {
    const users = this.getUsers().filter(u => u.id !== id);
    this.saveUsers(users);
  }

  static getFinancialRequests(): FinancialRequest[] {
    if (typeof window === 'undefined') return DEFAULT_REQUESTS;
    const data = localStorage.getItem(this.REQUESTS_KEY);
    if (!data) {
      localStorage.setItem(this.REQUESTS_KEY, JSON.stringify(DEFAULT_REQUESTS));
      return DEFAULT_REQUESTS;
    }
    try {
      return JSON.parse(data);
    } catch {
      return DEFAULT_REQUESTS;
    }
  }

  static saveFinancialRequests(requests: FinancialRequest[]): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(this.REQUESTS_KEY, JSON.stringify(requests));
  }

  static addFinancialRequest(req: Omit<FinancialRequest, 'id' | 'createdAt' | 'status'>): FinancialRequest {
    const requests = this.getFinancialRequests();
    const newReq: FinancialRequest = {
      ...req,
      id: `req-${Date.now()}`,
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
      status: 'pending'
    };
    requests.unshift(newReq);
    this.saveFinancialRequests(requests);
    return newReq;
  }

  static updateRequestStatus(reqId: string, status: 'approved' | 'rejected'): void {
    const requests = this.getFinancialRequests();
    const r = requests.find(item => item.id === reqId);
    if (!r) return;
    r.status = status;
    this.saveFinancialRequests(requests);

    // Eğer para yatırma onaylandıysa kullanıcının bakiyesine ekle
    if (status === 'approved' && r.type === 'deposit') {
      const users = this.getUsers();
      const u = users.find(item => item.id === r.userId);
      if (u) {
        u.balance += r.amount;
        this.saveUsers(users);
        const cur = this.getCurrentUser();
        if (cur.id === u.id) {
          this.setCurrentUser(u);
        }
      }
    }
  }
}
