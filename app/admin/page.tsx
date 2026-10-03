// app/admin/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  MarketScenario, 
  currentScenarioConfig, 
  updateScenarioConfig, 
  ScenarioConfig 
} from '@/lib/scenarioEngine';
import { 
  CasinoEngineConfig, 
  loadCasinoConfig, 
  updateCasinoConfig, 
  PenetrationMode 
} from '@/lib/monteCarloEngine';
import { AuthStore, AuthUser, FinancialRequest } from '@/lib/authStore';
import { CURRENT_PRICES } from '@/lib/store';
import { SYMBOL_SPECS } from '@/lib/tradingEngine';

type AdminTab = 'USERS' | 'FINANCE' | 'MARKETS' | 'CASINO' | 'LOGS';

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<AdminTab>('USERS');
  const [users, setUsers] = useState<AuthUser[]>([]);
  const [selectedUser, setSelectedUser] = useState<AuthUser | null>(null);
  const [requests, setRequests] = useState<FinancialRequest[]>([]);
  const [config, setConfig] = useState<ScenarioConfig>(currentScenarioConfig);
  const [casinoCfg, setCasinoCfg] = useState<CasinoEngineConfig>(() => loadCasinoConfig());
  const [globalWinRateInput, setGlobalWinRateInput] = useState<string>(casinoCfg.globalWinRateTarget?.toString() || '40');
  const [specificUserId, setSpecificUserId] = useState('');
  const [specificWinRate, setSpecificWinRate] = useState('100');
  const [prices, setPrices] = useState(CURRENT_PRICES);
  const [customBalanceInput, setCustomBalanceInput] = useState<string>('1000');
  const [notification, setNotification] = useState<string | null>(null);
  const [logMessages, setLogMessages] = useState<string[]>([
    'FxPro Dealer & Risk Yönetim Konsolu başlatıldı.',
    'Equinix LD4 Londra Likidite Köprüsü: Çevrimiçi (0.01ms)',
    'Monte Carlo Kriptografik Kasa Motoru: Aktif (Provably Fair)'
  ]);

  // Canlı Veri Senkronizasyonu
  const reloadData = () => {
    const userList = AuthStore.getUsers();
    setUsers(userList);
    if (!selectedUser && userList.length > 0) {
      setSelectedUser(userList[0]);
    } else if (selectedUser) {
      const refreshed = userList.find(u => u.id === selectedUser.id);
      if (refreshed) setSelectedUser(refreshed);
    }
    setRequests(AuthStore.getFinancialRequests());
  };

  useEffect(() => {
    reloadData();
    const interval = setInterval(() => {
      reloadData();
    }, 2000);

    const cycleTimer = setInterval(() => {
      if (currentScenarioConfig.activeScenario === 'KARMA_CYCLE') {
        setConfig({ ...currentScenarioConfig });
      }
    }, 1000);

    return () => {
      clearInterval(interval);
      clearInterval(cycleTimer);
    };
  }, []);

  const showNotify = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3500);
  };

  const addLog = (msg: string) => {
    const stamp = new Date().toLocaleTimeString('tr-TR');
    setLogMessages(prev => [`[${stamp}] ${msg}`, ...prev.slice(0, 30)]);
  };

  // 1. KULLANICI BAKİYE & KALDIRAÇ YÖNETİMİ
  const handleModifyUserBalance = (amount: number) => {
    if (!selectedUser) return;
    const newBal = Math.max(0, selectedUser.balance + amount);
    AuthStore.updateUser(selectedUser.id, { balance: newBal });
    reloadData();
    addLog(`Kullanıcı (#${selectedUser.accountNumber} - ${selectedUser.name}) Bakiyesi güncellendi: ${amount > 0 ? '+' : ''}${amount} USD. Yeni Bakiye: $${newBal.toLocaleString()}`);
    showNotify(`Bakiye güncellendi: $${newBal.toLocaleString()}`);
  };

  const handleModifyUserCredit = (amount: number) => {
    if (!selectedUser) return;
    const newCredit = Math.max(0, selectedUser.credit + amount);
    AuthStore.updateUser(selectedUser.id, { credit: newCredit });
    reloadData();
    addLog(`Kullanıcı (#${selectedUser.accountNumber}) Kredisi güncellendi: +${amount} USD.`);
    showNotify(`Kredi güncellendi: $${newCredit.toLocaleString()}`);
  };

  const handleUpdateUserLeverage = (leverage: number) => {
    if (!selectedUser) return;
    AuthStore.updateUser(selectedUser.id, { leverage });
    reloadData();
    addLog(`Kullanıcı (#${selectedUser.accountNumber}) Kaldıracı 1:${leverage} olarak ayarlandı.`);
    showNotify(`Kaldıraç 1:${leverage} yapıldı.`);
  };

  const [showAddUserModal, setShowAddUserModal] = useState<boolean>(false);
  const [newUserEmail, setNewUserEmail] = useState<string>('');
  const [newUserName, setNewUserName] = useState<string>('');
  const [newUserPassword, setNewUserPassword] = useState<string>('123456');
  const [newUserBalance, setNewUserBalance] = useState<number>(10000);
  const [newUserLeverage, setNewUserLeverage] = useState<number>(500);

  const handleCreateNewUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserEmail || !newUserEmail.includes('@')) {
      showNotify('Geçerli bir e-posta adresi giriniz.');
      return;
    }

    const created = AuthStore.createUser({
      email: newUserEmail,
      name: newUserName || newUserEmail.split('@')[0],
      password: newUserPassword || '123456',
      balance: newUserBalance,
      leverage: newUserLeverage,
      role: 'user'
    });

    reloadData();
    setSelectedUser(created);
    setShowAddUserModal(false);
    setNewUserEmail('');
    setNewUserName('');
    setNewUserPassword('123456');
    addLog(`Yeni Kullanıcı Eklendi: #${created.accountNumber} • ${created.email} (Şifre: ${created.password})`);
    showNotify(`Kullanıcı ${created.email} başarıyla oluşturuldu! Şifre: ${created.password}`);
  };

  const handleUpdateUserPassword = (newPass: string) => {
    if (!selectedUser || !newPass) return;
    AuthStore.updateUser(selectedUser.id, { password: newPass });
    reloadData();
    addLog(`Kullanıcı (#${selectedUser.accountNumber}) Şifresi Güncellendi: ${newPass}`);
    showNotify(`Şifre güncellendi: ${newPass}`);
  };

  const handleToggleUserStatus = () => {
    if (!selectedUser) return;
    const newStatus = selectedUser.status === 'active' ? 'suspended' : 'active';
    AuthStore.updateUser(selectedUser.id, { status: newStatus });
    reloadData();
    addLog(`Kullanıcı (#${selectedUser.accountNumber}) durumu: ${newStatus === 'active' ? 'AKTİF' : 'DONDURULDU'}.`);
    showNotify(`Hesap durumu: ${newStatus.toUpperCase()}`);
  };

  // 2. FİNANSAL TALEP ONAY / RET
  const handleApproveRequest = (req: FinancialRequest) => {
    AuthStore.updateRequestStatus(req.id, 'approved');
    reloadData();
    addLog(`Finansal Talep ONAYLANDI: #${req.id} • ${req.userEmail} • ${req.amount} USD (${req.type.toUpperCase()})`);
    showNotify(`Talep #${req.id} onaylandı ve hesaba aktarıldı.`);
  };

  const handleRejectRequest = (req: FinancialRequest) => {
    AuthStore.updateRequestStatus(req.id, 'rejected');
    reloadData();
    addLog(`Finansal Talep REDDEDİLDİ: #${req.id} • ${req.userEmail} • ${req.amount} USD`);
    showNotify(`Talep #${req.id} reddedildi.`);
  };

  // 3. PİYASA SENARYO & VOLATİLİTE KONTROLÜ
  const handleApplyScenario = (scenario: MarketScenario, note: string, vol = 1.0, bias = 0.0) => {
    const newCfg = updateScenarioConfig({
      activeScenario: scenario,
      volatilityMultiplier: vol,
      bias: bias,
      customNote: note,
      durationSeconds: 300,
      remainingSeconds: 300
    });
    setConfig(newCfg);
    if (typeof window !== 'undefined') {
      localStorage.setItem('mt5_scenario_config', JSON.stringify(newCfg));
    }
    addLog(`Piyasa Senaryosu Devreye Alındı: ${note} (Volatilite: ${vol}x, Yön: ${bias > 0 ? 'Boğa' : bias < 0 ? 'Ayı' : 'Nötr'})`);
    showNotify(`Piyasa Modu: ${note}`);
  };

  // 4. MONTE CARLO KUMAR & PENETRASYON AYARI
  const handleUpdateCasinoPenetration = (mode: PenetrationMode) => {
    const updated = updateCasinoConfig({ penetrationMode: mode });
    setCasinoCfg(updated);
    addLog(`Monte Carlo Casino Penetrasyon Kademesi Değiştirildi: ${mode}`);
    showNotify(`Casino Penetrasyonu: ${mode}`);
  };

  const handleUpdateCasinoRTP = (rtp: number) => {
    const updated = updateCasinoConfig({ rtpPercent: rtp });
    setCasinoCfg(updated);
    addLog(`Monte Carlo Oyunları Genel RTP Oranı: %${rtp} olarak kilitlendi.`);
    showNotify(`RTP %${rtp} yapıldı.`);
  };

  // Toplam İstatistikler
  const totalUserBalance = users.reduce((sum, u) => sum + (u.balance || 0), 0);
  const totalPendingDeposits = requests.filter(r => r.type === 'deposit' && r.status === 'pending').reduce((sum, r) => sum + r.amount, 0);
  const totalPendingWithdraws = requests.filter(r => r.type === 'withdraw' && r.status === 'pending').reduce((sum, r) => sum + r.amount, 0);

  return (
    <div className="min-h-screen bg-[#070a0f] text-[#c9d1d9] font-sans antialiased selection:bg-blue-600 selection:text-white flex flex-col">
      
      {/* ========================================================================= */}
      {/* 1. ÜST DEALER YÖNETİM ÇUBUĞU */}
      {/* ========================================================================= */}
      <header className="sticky top-0 z-50 bg-[#090d14]/95 backdrop-blur-md border-b border-[#1b2434] px-4 lg:px-8 py-3 flex items-center justify-between shadow-xl">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="px-3 py-1.5 bg-[#141b27] hover:bg-[#1d2738] border border-[#263449] text-emerald-400 hover:text-white text-xs font-bold rounded-xl transition flex items-center gap-1.5 shadow-sm"
          >
            <span>←</span>
            <span>Geri Dön</span>
          </Link>

          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl  flex items-center justify-center font-black text-white text-sm ">
              ⚙️
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-base tracking-wider text-white">FxPro</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-500/20 text-blue-400 font-bold border border-blue-500/30 uppercase">
                  MASTER DEALER & CRM
                </span>
              </div>
              <span className="text-[10px] text-gray-400 font-mono hidden sm:inline">
                Tier-1 Banka Likidite Masası & Risk Yönetim Konsolu
              </span>
            </div>
          </div>
        </div>

        {/* Canlı Kasa Özeti & Navigasyon */}
        <div className="flex items-center gap-3">
          <div className="hidden lg:flex items-center gap-3 bg-[#0d121c] px-3.5 py-1.5 rounded-xl border border-[#1d273a] text-xs font-mono">
            <span className="text-gray-400">Toplam Üye: <strong className="text-white">{users.length}</strong></span>
            <span className="text-gray-600">|</span>
            <span className="text-gray-400">Üye Bakiyeleri: <strong className="text-emerald-400">${totalUserBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}</strong></span>
            <span className="text-gray-600">|</span>
            <span className="text-gray-400">Bekleyen Çekim: <strong className="text-rose-400">${totalPendingWithdraws.toLocaleString()}</strong></span>
          </div>

          <Link
            href="/"
            className="px-3.5 py-1.5 bg-[#141b27] hover:bg-[#1d2738] border border-[#263449] text-gray-300 hover:text-white text-xs font-bold rounded-xl transition flex items-center gap-1.5"
          >
            <span>🏛️</span> Kurumsal Portal
          </Link>
        </div>
      </header>

      {/* Bildirim Barı */}
      {notification && (
        <div className=" text-white font-mono text-xs py-2 px-4 text-center font-bold shadow-lg animate-pulse">
          ⚡ {notification}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. YÖNETİM SEKMELERİ - KAYDIRMASIZ DİNAMİK GRİD */}
      {/* ========================================================================= */}
      <div className="bg-[#0b0f17] border-b border-[#182232] px-3 lg:px-8 py-2">
        <div className="max-w-7xl mx-auto grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 text-xs font-mono font-bold">
          
          <button
            onClick={() => setActiveTab('USERS')}
            className={`px-3 py-2 rounded-xl transition flex items-center justify-center gap-1.5 text-center ${
              activeTab === 'USERS'
                ? 'bg-blue-600 text-white '
                : 'bg-[#121722] text-gray-400 hover:text-white border border-[#1b2332]'
            }`}
          >
            <span>👥</span> Üye Yönetimi ({users.length})
          </button>

          <button
            onClick={() => setActiveTab('FINANCE')}
            className={`px-3 py-2 rounded-xl transition flex items-center justify-center gap-1.5 text-center ${
              activeTab === 'FINANCE'
                ? 'bg-blue-600 text-white '
                : 'bg-[#121722] text-gray-400 hover:text-white border border-[#1b2332]'
            }`}
          >
            <span>💳</span> Finans Onay ({requests.filter(r => r.status === 'pending').length})
          </button>

          <button
            onClick={() => setActiveTab('MARKETS')}
            className={`px-3 py-2 rounded-xl transition flex items-center justify-center gap-1.5 text-center ${
              activeTab === 'MARKETS'
                ? 'bg-blue-600 text-white '
                : 'bg-[#121722] text-gray-400 hover:text-white border border-[#1b2332]'
            }`}
          >
            <span>📈</span> Fiyat & Senaryo
          </button>

          <button
            onClick={() => setActiveTab('CASINO')}
            className={`px-3 py-2 rounded-xl transition flex items-center justify-center gap-1.5 text-center ${
              activeTab === 'CASINO'
                ? 'bg-amber-600 text-white '
                : 'bg-[#121722] text-amber-400 hover:text-white border border-amber-500/20'
            }`}
          >
            <span>🎰</span> Monte Carlo
          </button>

          <button
            onClick={() => setActiveTab('LOGS')}
            className={`px-3 py-2 rounded-xl transition flex items-center justify-center gap-1.5 text-center col-span-2 sm:col-span-1 ${
              activeTab === 'LOGS'
                ? 'bg-blue-600 text-white '
                : 'bg-[#121722] text-gray-400 hover:text-white border border-[#1b2332]'
            }`}
          >
            <span>📋</span> Denetim Logları
          </button>

        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. ANA PANEL İÇERİĞİ */}
      {/* ========================================================================= */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 lg:p-8 space-y-6">

        {/* ----------------------------------------------------------------------- */}
        {/* SEKME 1: KULLANICI & CRM YÖNETİMİ */}
        {/* ----------------------------------------------------------------------- */}
        {activeTab === 'USERS' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Sol: Kullanıcı Listesi */}
            <div className="lg:col-span-7 bg-[#0b0f17] border border-[#1c2638] rounded-2xl p-5 space-y-4 shadow-xl">
              <div className="flex items-center justify-between pb-3 border-b border-[#182130]">
                <div>
                  <h2 className="text-base font-bold text-white flex items-center gap-2">
                    <span>👥</span> Kayıtlı Kullanıcılar & ECN Hesapları
                  </h2>
                  <p className="text-[11px] text-gray-400 font-mono">
                    Yönetmek veya şifre güncellemek için kullanıcının üzerine tıklayınız.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowAddUserModal(true)}
                    className="px-3 py-1.5  bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold font-mono rounded-xl transition shadow flex items-center gap-1.5 active:scale-95"
                  >
                    <span>➕</span>
                    <span>Kullanıcı Ekle</span>
                  </button>
                  <span className="text-xs font-mono font-bold text-blue-400 bg-blue-500/10 px-2.5 py-1 rounded-lg border border-blue-500/20">
                    {users.length} Üye
                  </span>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-mono">
                  <thead>
                    <tr className="text-gray-400 border-b border-[#182130]">
                      <th className="py-2.5 px-3">Hesap No</th>
                      <th className="py-2.5 px-3">Kullanıcı & Şifre</th>
                      <th className="py-2.5 px-3 text-right">Bakiye</th>
                      <th className="py-2.5 px-3 text-center">Kaldıraç</th>
                      <th className="py-2.5 px-3 text-center">Durum</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#151d2b]">
                    {users.map((u) => {
                      const isSel = selectedUser?.id === u.id;
                      return (
                        <tr
                          key={u.id}
                          onClick={() => setSelectedUser(u)}
                          className={`cursor-pointer transition ${
                            isSel ? 'bg-blue-600/20 text-white font-bold' : 'hover:bg-[#121824] text-gray-300'
                          }`}
                        >
                          <td className="py-3 px-3 text-blue-400 font-bold">#{u.accountNumber}</td>
                          <td className="py-3 px-3">
                            <span className="block text-white font-sans">{u.name}</span>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <span className="text-[10px] text-gray-400">{u.email}</span>
                              <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20 font-mono">
                                🔑 {u.password || '123456'}
                              </span>
                            </div>
                          </td>
                          <td className="py-3 px-3 text-right font-bold text-emerald-400">
                            ${u.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                          </td>
                          <td className="py-3 px-3 text-center text-cyan-300">1:{u.leverage}</td>
                          <td className="py-3 px-3 text-center">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              u.status === 'active' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                            }`}>
                              {u.status === 'active' ? 'Aktif' : 'Donduruldu'}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Sağ: Seçili Kullanıcı Kontrol Paneli */}
            <div className="lg:col-span-5 bg-[#0b0f17] border border-[#1c2638] rounded-2xl p-5 space-y-5 shadow-xl">
              {selectedUser ? (
                <>
                  <div className="flex items-center justify-between pb-3 border-b border-[#182130]">
                    <div>
                      <span className="text-[10px] font-mono text-gray-400 block uppercase">SEÇİLİ HESAP</span>
                      <h3 className="text-lg font-bold text-white font-sans">{selectedUser.name}</h3>
                      <span className="text-xs font-mono text-blue-400">#{selectedUser.accountNumber} • {selectedUser.email}</span>
                    </div>
                    <button
                      onClick={handleToggleUserStatus}
                      className={`px-3 py-1.5 rounded-xl font-bold text-xs transition font-mono ${
                        selectedUser.status === 'active'
                          ? 'bg-rose-600/20 hover:bg-rose-600/30 text-rose-400 border border-rose-500/30'
                          : 'bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/30'
                      }`}
                    >
                      {selectedUser.status === 'active' ? 'Hesabı Dondur' : 'Hesabı Aç'}
                    </button>
                  </div>

                  {/* ŞİFRE YÖNETİMİ & DOĞRUDAN ERİŞİM BİLGİSİ */}
                  <div className="bg-[#121824] p-3.5 rounded-xl border border-amber-500/30 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-amber-300 font-mono flex items-center gap-1.5">
                        <span>🔑</span> Kullanıcı Giriş Şifresi:
                      </span>
                      <span className="text-xs font-mono font-black text-white bg-amber-500/20 px-2 py-0.5 rounded border border-amber-400/30">
                        {selectedUser.password || '123456'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 pt-1">
                      <input
                        type="text"
                        placeholder="Yeni şifre belirle (Örn: bursa16)"
                        id="user-password-input"
                        className="flex-1 bg-[#090d15] border border-[#222e42] rounded-xl px-3 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-amber-400"
                      />
                      <button
                        onClick={() => {
                          const inp = document.getElementById('user-password-input') as HTMLInputElement;
                          if (inp && inp.value) {
                            handleUpdateUserPassword(inp.value);
                            inp.value = '';
                          }
                        }}
                        className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-400 text-black font-black text-xs rounded-xl font-mono transition"
                      >
                        Şifreyi Değiştir
                      </button>
                    </div>
                  </div>

                  {/* Bakiye Bilgileri */}
                  <div className="grid grid-cols-2 gap-3 text-center font-mono">
                    <div className="bg-[#121824] p-3 rounded-xl border border-[#1d273a]">
                      <span className="text-[10px] text-gray-400 block">KULLANILABİLİR BAKİYE</span>
                      <span className="text-xl font-black text-emerald-400">
                        ${selectedUser.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                    <div className="bg-[#121824] p-3 rounded-xl border border-[#1d273a]">
                      <span className="text-[10px] text-gray-400 block">KREDİ / BONUS</span>
                      <span className="text-xl font-black text-cyan-400">
                        ${selectedUser.credit.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  </div>

                  {/* Hızlı Bakiye Ekleme / Çıkarma */}
                  <div className="space-y-2">
                    <span className="text-xs font-bold text-gray-300 font-mono block">Hızlı Bakiye Yükleme:</span>
                    <div className="grid grid-cols-4 gap-2 font-mono">
                      {[500, 1000, 2500, 5000].map(amt => (
                        <button
                          key={amt}
                          onClick={() => handleModifyUserBalance(amt)}
                          className="py-2 bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/30 text-emerald-400 font-bold rounded-xl text-xs transition"
                        >
                          +${amt}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Bakiye Azaltma / Özel Tutar */}
                  <div className="space-y-2 pt-1">
                    <span className="text-xs font-bold text-gray-300 font-mono block">Özel Tutar ile İşlem Yap:</span>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        value={customBalanceInput}
                        onChange={(e) => setCustomBalanceInput(e.target.value)}
                        placeholder="USD Tutarı"
                        className="flex-1 bg-[#121824] border border-[#222e42] rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-blue-500"
                      />
                      <button
                        onClick={() => handleModifyUserBalance(parseFloat(customBalanceInput) || 0)}
                        className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl transition"
                      >
                        Bakiye Ekle
                      </button>
                      <button
                        onClick={() => handleModifyUserBalance(-(parseFloat(customBalanceInput) || 0))}
                        className="px-3.5 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl transition"
                      >
                        Bakiye Sil
                      </button>
                    </div>
                  </div>

                  {/* Kaldıraç Değiştirme */}
                  <div className="space-y-2 pt-2 border-t border-[#182130]">
                    <span className="text-xs font-bold text-gray-300 font-mono block">Hesap Kaldıracı (Dinamik):</span>
                    <div className="grid grid-cols-4 gap-2 font-mono text-xs">
                      {[100, 500, 1000, 2000].map(lev => (
                        <button
                          key={lev}
                          onClick={() => handleUpdateUserLeverage(lev)}
                          className={`py-2 rounded-xl border font-bold transition ${
                            selectedUser.leverage === lev
                              ? 'bg-blue-600 text-white border-blue-400'
                              : 'bg-[#121824] text-gray-400 border-[#1d273a] hover:text-white'
                          }`}
                        >
                          1:{lev}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Kredi Ekle */}
                  <div className="flex items-center gap-2 pt-2">
                    <button
                      onClick={() => handleModifyUserCredit(1000)}
                      className="flex-1 py-2 bg-cyan-600/20 hover:bg-cyan-600/30 border border-cyan-500/30 text-cyan-300 font-bold text-xs rounded-xl transition font-mono"
                    >
                      +$1,000 Bonus Kredi Ekle
                    </button>
                    <button
                      onClick={() => handleModifyUserCredit(-selectedUser.credit)}
                      className="px-3 py-2 bg-gray-800 hover:bg-gray-700 text-gray-400 font-bold text-xs rounded-xl transition font-mono"
                    >
                      Krediyi Sıfırla
                    </button>
                  </div>
                </>
              ) : (
                <div className="text-center py-16 text-gray-500 font-mono text-xs">
                  Lütfen soldaki listeden bir kullanıcı seçiniz.
                </div>
              )}
            </div>

          </div>
        )}

        {/* ----------------------------------------------------------------------- */}
        {/* SEKME 2: FİNANS & PARA YATIRMA / ÇEKME ONAYLARI */}
        {/* ----------------------------------------------------------------------- */}
        {activeTab === 'FINANCE' && (
          <div className="bg-[#0b0f17] border border-[#1c2638] rounded-2xl p-5 space-y-6 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-[#182130]">
              <div>
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <span>💳</span> Para Yatırma & Çekme Onay Masası
                </h2>
                <p className="text-[11px] text-gray-400 font-mono">
                  Bekleyen talepleri tek tıkla onaylayabilir veya reddedebilirsiniz.
                </p>
              </div>

              <div className="flex items-center gap-3 text-xs font-mono">
                <span className="text-emerald-400">Bekleyen Yatırma: <strong>${totalPendingDeposits.toLocaleString()}</strong></span>
                <span className="text-gray-600">|</span>
                <span className="text-rose-400">Bekleyen Çekim: <strong>${totalPendingWithdraws.toLocaleString()}</strong></span>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead>
                  <tr className="text-gray-400 border-b border-[#182130]">
                    <th className="py-2.5 px-3">Talep No</th>
                    <th className="py-2.5 px-3">Tarih</th>
                    <th className="py-2.5 px-3">Kullanıcı</th>
                    <th className="py-2.5 px-3">Tür</th>
                    <th className="py-2.5 px-3">Yöntem / Detay</th>
                    <th className="py-2.5 px-3 text-right">Tutar</th>
                    <th className="py-2.5 px-3 text-center">Durum</th>
                    <th className="py-2.5 px-3 text-center">Aksiyon</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#151d2b]">
                  {requests.map((r) => (
                    <tr key={r.id} className="hover:bg-[#121824] transition">
                      <td className="py-3 px-3 text-blue-400 font-bold">#{r.id}</td>
                      <td className="py-3 px-3 text-gray-400">{r.createdAt}</td>
                      <td className="py-3 px-3 text-white">{r.userEmail}</td>
                      <td className="py-3 px-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          r.type === 'deposit' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                        }`}>
                          {r.type === 'deposit' ? 'YATIRMA' : 'ÇEKME'}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <span className="text-white block">{r.method}</span>
                        <span className="text-[10px] text-gray-400">{r.details || '-'}</span>
                      </td>
                      <td className="py-3 px-3 text-right font-black text-white text-sm">
                        ${r.amount.toLocaleString()}
                      </td>
                      <td className="py-3 px-3 text-center">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          r.status === 'pending'
                            ? 'bg-yellow-500/20 text-yellow-300'
                            : r.status === 'approved'
                            ? 'bg-emerald-500/20 text-emerald-400'
                            : 'bg-rose-500/20 text-rose-400'
                        }`}>
                          {r.status === 'pending' ? 'BEKLİYOR' : r.status === 'approved' ? 'ONAYLANDI' : 'REDDEDİLDİ'}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-center">
                        {r.status === 'pending' ? (
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => handleApproveRequest(r)}
                              className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg text-[11px] transition shadow"
                            >
                              ✓ Onayla
                            </button>
                            <button
                              onClick={() => handleRejectRequest(r)}
                              className="px-2.5 py-1 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-lg text-[11px] transition"
                            >
                              ✕ Reddet
                            </button>
                          </div>
                        ) : (
                          <span className="text-[11px] text-gray-500">Tamamlandı</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ----------------------------------------------------------------------- */}
        {/* SEKME 3: PİYASA & FİYAT MANİPÜLASYON MOTORU */}
        {/* ----------------------------------------------------------------------- */}
        {activeTab === 'MARKETS' && (
          <div className="space-y-6">
            
            {/* Canlı Senaryo Seçici */}
            <div className="bg-[#0b0f17] border border-[#1c2638] rounded-2xl p-5 space-y-4 shadow-xl">
              <div className="flex items-center justify-between pb-3 border-b border-[#182130]">
                <div>
                  <h2 className="text-base font-bold text-white flex items-center gap-2">
                    <span>⚡</span> Canlı Piyasa Senaryo Motoru (Dealer Override)
                  </h2>
                  <p className="text-[11px] text-gray-400 font-mono">
                    Tüm kullanıcılara yansıyan anlık piyasa trendini ve oynaklığını belirleyiniz.
                  </p>
                </div>
                <div className="bg-[#121824] px-3 py-1 rounded-xl border border-[#1d273a] text-xs font-mono">
                  Aktif Mod: <strong className="text-emerald-400">{config.customNote}</strong>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
                
                {/* 1. 🔥 KARMA DÖNGÜ MOTORU (ÖZEL VURGULU KUTU) */}
                <button
                  onClick={() => handleApplyScenario('KARMA_CYCLE', 'Otonom Karma Döngüsü', 2.5, 0.0)}
                  className={`p-4 rounded-xl border text-left space-y-2 transition relative overflow-hidden group ${
                    config.activeScenario === 'KARMA_CYCLE'
                      ? 'bg-gradient-to-br from-amber-600/30 via-yellow-600/20 to-emerald-600/30 border-yellow-400 text-white  ring-2 ring-yellow-400/50'
                      : 'bg-gradient-to-br from-[#181a28] to-[#121420] border-amber-500/40 text-amber-200 hover:border-amber-400'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <span className="font-black text-xs font-mono text-yellow-300 flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-yellow-400 animate-ping" />
                      KARMA DÖNGÜSÜ
                    </span>
                    <span className="text-base">🌀</span>
                  </div>
                  <div className="text-sm font-black  ">
                    Otonom Karma Motor
                  </div>
                  <p className="text-[11px] text-gray-300 font-sans">
                    Boğa ➔ Yatay ➔ Stop Avı ➔ Crash ➔ V-Recovery (80s Rotasyon).
                  </p>
                  {config.activeScenario === 'KARMA_CYCLE' && config.cyclePhase && (
                    <div className="text-[10px] text-emerald-300 font-mono font-bold bg-black/60 px-2 py-0.5 rounded border border-yellow-400/30">
                      {config.cyclePhase}
                    </div>
                  )}
                </button>

                {/* 2. Standart Normal Dalgalanma */}
                <button
                  onClick={() => handleApplyScenario('NORMAL_WALK', 'Standart Piyasa Dalgalanması', 1.0, 0.0)}
                  className={`p-4 rounded-xl border text-left space-y-2 transition ${
                    config.activeScenario === 'NORMAL_WALK'
                      ? 'bg-blue-600/20 border-blue-500 text-white shadow-lg'
                      : 'bg-[#121824] border-[#1d273a] text-gray-300 hover:border-gray-500'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-xs font-mono text-blue-400">STANDART MOD</span>
                    <span>⚖️</span>
                  </div>
                  <div className="text-sm font-bold text-white">Normal Walk</div>
                  <p className="text-[11px] text-gray-400 font-sans">1.0x Doğal Volatilite, Nötr Trend.</p>
                </button>

                {/* 3. Boğa Koşusu (Pump) */}
                <button
                  onClick={() => handleApplyScenario('BULL_TREND', 'Agresif Boğa Koşusu (Pump)', 2.2, 0.0035)}
                  className={`p-4 rounded-xl border text-left space-y-2 transition ${
                    config.activeScenario === 'BULL_TREND'
                      ? 'bg-emerald-600/20 border-emerald-500 text-white shadow-lg'
                      : 'bg-[#121824] border-[#1d273a] text-gray-300 hover:border-emerald-500/50'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-xs font-mono text-emerald-400">BOĞA PUMP</span>
                    <span>🚀</span>
                  </div>
                  <div className="text-sm font-bold text-emerald-400">Agresif Yükseliş</div>
                  <p className="text-[11px] text-gray-400 font-sans">Sürekli yeşil mumlar, yukarı yönlü baskı.</p>
                </button>

                {/* 4. Ayı Satış Dalgası (Bear Dump) */}
                <button
                  onClick={() => handleApplyScenario('BEAR_TREND', 'Kademeli Ayı Baskısı (Dump)', 2.2, -0.0035)}
                  className={`p-4 rounded-xl border text-left space-y-2 transition ${
                    config.activeScenario === 'BEAR_TREND'
                      ? 'bg-rose-600/20 border-rose-500 text-white shadow-lg'
                      : 'bg-[#121824] border-[#1d273a] text-gray-300 hover:border-rose-500/50'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-xs font-mono text-rose-400">AYI BASKISI</span>
                    <span>🐻</span>
                  </div>
                  <div className="text-sm font-bold text-rose-400">Kademeli Düşüş</div>
                  <p className="text-[11px] text-gray-400 font-sans">Derinleşen kırmızı mumlar, satış baskısı.</p>
                </button>

                {/* 5. Ani Çöküş (Flash Crash) */}
                <button
                  onClick={() => handleApplyScenario('FLASH_CRASH_V_RECOVERY', 'Flash Crash (Ani Çöküş)', 3.8, -0.006)}
                  className={`p-4 rounded-xl border text-left space-y-2 transition ${
                    config.activeScenario === 'FLASH_CRASH_V_RECOVERY'
                      ? 'bg-rose-600/20 border-rose-500 text-white shadow-lg'
                      : 'bg-[#121824] border-[#1d273a] text-gray-300 hover:border-rose-500/50'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-xs font-mono text-rose-400">FLASH CRASH</span>
                    <span>📉</span>
                  </div>
                  <div className="text-sm font-bold text-rose-400">Sert Düşüş Dalgası</div>
                  <p className="text-[11px] text-gray-400 font-sans">3.8x Volatilite, panik satışları.</p>
                </button>

                {/* 6. Stop Avı (Wick Spike) */}
                <button
                  onClick={() => handleApplyScenario('LIQUIDITY_HUNT', 'Stop-Loss Avcısı (İğne Atma)', 4.0, 0.0)}
                  className={`p-4 rounded-xl border text-left space-y-2 transition ${
                    config.activeScenario === 'LIQUIDITY_HUNT'
                      ? 'bg-purple-600/20 border-purple-500 text-white shadow-lg'
                      : 'bg-[#121824] border-[#1d273a] text-gray-300 hover:border-purple-500/50'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-xs font-mono text-purple-400">STOP AVCISI</span>
                    <span>⚡</span>
                  </div>
                  <div className="text-sm font-bold text-purple-300">Her İki Yöne İğne</div>
                  <p className="text-[11px] text-gray-400 font-sans">Dar alanda sert yukarı ve aşağı iğneleme.</p>
                </button>

                {/* 7. Testere Piyasası (Range Chop) */}
                <button
                  onClick={() => handleApplyScenario('RANGE_CHOP', 'Testere / Yatay Koridor', 1.4, 0.0)}
                  className={`p-4 rounded-xl border text-left space-y-2 transition ${
                    config.activeScenario === 'RANGE_CHOP'
                      ? 'bg-cyan-600/20 border-cyan-500 text-white shadow-lg'
                      : 'bg-[#121824] border-[#1d273a] text-gray-300 hover:border-cyan-500/50'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-xs font-mono text-cyan-400">YATAY TUZAK</span>
                    <span>🪚</span>
                  </div>
                  <div className="text-sm font-bold text-cyan-300">Testere (Chop)</div>
                  <p className="text-[11px] text-gray-400 font-sans">Dar koridorda sahte kırılımlar, yatay sıkışma.</p>
                </button>

                {/* 8. Haber Şoku (News Spike) */}
                <button
                  onClick={() => handleApplyScenario('NEWS_SHOCK_SPIKE', 'NFP / FED Haber Şoku', 4.5, 0.005)}
                  className={`p-4 rounded-xl border text-left space-y-2 transition ${
                    config.activeScenario === 'NEWS_SHOCK_SPIKE'
                      ? 'bg-amber-600/20 border-amber-500 text-white shadow-lg'
                      : 'bg-[#121824] border-[#1d273a] text-gray-300 hover:border-amber-500/50'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-xs font-mono text-amber-400">HABER ŞOKU</span>
                    <span>💥</span>
                  </div>
                  <div className="text-sm font-bold text-amber-300">NFP / FED Kararı</div>
                  <p className="text-[11px] text-gray-400 font-sans">4.5x Çılgın volatilite, 200 pip anlık sıçrama.</p>
                </button>

                {/* 9. Kara Kuğu Krizi (Black Swan) */}
                <button
                  onClick={() => handleApplyScenario('BLACK_SWAN', 'Kara Kuğu Kriz Modu', 5.0, -0.008)}
                  className={`p-4 rounded-xl border text-left space-y-2 transition ${
                    config.activeScenario === 'BLACK_SWAN'
                      ? 'bg-red-900/40 border-red-500 text-white shadow-lg'
                      : 'bg-[#121824] border-[#1d273a] text-gray-300 hover:border-red-500/50'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-xs font-mono text-red-500">KARA KUĞU</span>
                    <span>🦢</span>
                  </div>
                  <div className="text-sm font-bold text-red-400">Küresel Kriz</div>
                  <p className="text-[11px] text-gray-400 font-sans">5.0x Panik çöküşü, derin likidite boşluğu.</p>
                </button>

                {/* 10. Kripto Rush (7/24 Hiper Momentum) */}
                <button
                  onClick={() => handleApplyScenario('WEEKEND_CRYPTO_RUSH', 'Kripto Hiper Momentum', 2.8, 0.002)}
                  className={`p-4 rounded-xl border text-left space-y-2 transition ${
                    config.activeScenario === 'WEEKEND_CRYPTO_RUSH'
                      ? 'bg-indigo-600/20 border-indigo-500 text-white shadow-lg'
                      : 'bg-[#121824] border-[#1d273a] text-gray-300 hover:border-indigo-500/50'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-xs font-mono text-indigo-400">KRİPTO RUSH</span>
                    <span>🪙</span>
                  </div>
                  <div className="text-sm font-bold text-indigo-300">Hiper Momentum</div>
                  <p className="text-[11px] text-gray-400 font-sans">Kriptolarda parabolik dalgalar, kesintisiz hız.</p>
                </button>

              </div>
            </div>

            {/* Anlık Parite İzleme & Spread Tablosu */}
            <div className="bg-[#0b0f17] border border-[#1c2638] rounded-2xl p-5 space-y-4 shadow-xl">
              <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wide">
                Canlı Parite Fiyatları & ECN Likidite Havuzu
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3 font-mono text-xs">
                {['EURUSD', 'XAUUSDX', 'NASDAQ.j', 'BTCUSD', 'BOOM1000', 'CRASH500'].map((sym) => {
                  const p = prices[sym] || { bid: 100, ask: 100.1, high: 105, low: 95 };
                  const sp = SYMBOL_SPECS[sym] || { digits: 2, name: sym };
                  return (
                    <div key={sym} className="bg-[#121824] p-3 rounded-xl border border-[#1d273a] space-y-1">
                      <span className="text-white font-bold block">{sym}</span>
                      <div className="text-blue-400 font-bold">{p.bid.toFixed(sp.digits)}</div>
                      <div className="text-rose-400 font-bold">{p.ask.toFixed(sp.digits)}</div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        )}

        {/* ----------------------------------------------------------------------- */}
        {/* SEKME 4: MONTE CARLO KUMAR & PENETRASYON MOTORU */}
        {/* ----------------------------------------------------------------------- */}
        {activeTab === 'CASINO' && (
          <div className="bg-[#0b0f17] border border-amber-500/30 rounded-2xl p-5 space-y-6 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-amber-500/20">
              <div>
                <h2 className="text-base font-bold text-amber-300 flex items-center gap-2 font-serif">
                  <span>🇲🇨</span> Monte Carlo Penetrasyon & Kasa Algoritması
                </h2>
                <p className="text-[11px] text-gray-400 font-mono">
                  Rulet, Blackjack, Slot, Crash ve Mines oyunlarının kasa matematiğini belirleyiniz.
                </p>
              </div>

              <div className="bg-[#181105] border border-amber-500/40 px-3 py-1 rounded-xl text-xs font-mono text-amber-300">
                Aktif Kasa RTP: <strong>%{casinoCfg.rtpPercent}</strong>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 font-mono">
              
              {/* Caesars Sosyal AI (Ana Mod) */}
              <button
                onClick={() => handleUpdateCasinoPenetration('SOCIAL_CASINO_AI')}
                className={`p-4 rounded-xl border text-left space-y-2 transition ${
                  casinoCfg.penetrationMode === 'SOCIAL_CASINO_AI'
                    ? 'bg-blue-600/30 border-blue-400 text-white shadow-lg'
                    : 'bg-[#121824] border-[#1d273a] text-gray-400 hover:text-white'
                }`}
              >
                <div className="text-xs font-bold text-blue-400">KADEME 1 (VARSAYILAN)</div>
                <div className="text-sm font-bold text-blue-300">Caesars / Playtika AI</div>
                <p className="text-[11px] text-gray-400 font-sans">Kullanıcıyı sistemde tutar, teğet geçer (near-miss), kurtarma kazancı verir.</p>
              </button>
              
              {/* Normal */}
              <button
                onClick={() => handleUpdateCasinoPenetration('PURE_MONTE_CARLO')}
                className={`p-4 rounded-xl border text-left space-y-2 transition ${
                  casinoCfg.penetrationMode === 'PURE_MONTE_CARLO'
                    ? 'bg-amber-600/30 border-amber-400 text-white shadow-lg'
                    : 'bg-[#121824] border-[#1d273a] text-gray-400 hover:text-white'
                }`}
              >
                <div className="text-xs font-bold text-gray-400">KADEME 2</div>
                <div className="text-sm font-bold text-amber-300">Saf Monte Carlo</div>
                <p className="text-[11px] text-gray-400 font-sans">Monaco ve Vegas standartlarında bağımsız provably fair RNG.</p>
              </button>

              {/* Kazandır (Sweet Hook) */}
              <button
                onClick={() => handleUpdateCasinoPenetration('SWEET_HOOK')}
                className={`p-4 rounded-xl border text-left space-y-2 transition ${
                  casinoCfg.penetrationMode === 'SWEET_HOOK'
                    ? 'bg-emerald-600/30 border-emerald-400 text-white shadow-lg'
                    : 'bg-[#121824] border-[#1d273a] text-gray-400 hover:text-emerald-400'
                }`}
              >
                <div className="text-xs font-bold text-emerald-400">KADEME 3</div>
                <div className="text-sm font-bold text-emerald-300">Kullanıcıyı Isıt (Hook)</div>
                <p className="text-[11px] text-gray-400 font-sans">Kullanıcıya peş peşe 2x-20x kazanç vererek tutundur.</p>
              </button>

              {/* Kasa Kazanır (House Edge) */}
              <button
                onClick={() => handleUpdateCasinoPenetration('HOUSE_EDGE')}
                className={`p-4 rounded-xl border text-left space-y-2 transition ${
                  casinoCfg.penetrationMode === 'HOUSE_EDGE'
                    ? 'bg-rose-600/30 border-rose-400 text-white shadow-lg'
                    : 'bg-[#121824] border-[#1d273a] text-gray-400 hover:text-rose-400'
                }`}
              >
                <div className="text-xs font-bold text-rose-400">KADEME 4</div>
                <div className="text-sm font-bold text-rose-300">Kasa Toplama Modu</div>
                <p className="text-[11px] text-gray-400 font-sans">Büyük bahislerde kasa avantajını sertleştir.</p>
              </button>

              {/* Jackpot Tetikle (Force Jackpot) */}
              <button
                onClick={() => handleUpdateCasinoPenetration('FORCE_JACKPOT')}
                className={`p-4 rounded-xl border text-left space-y-2 transition ${
                  casinoCfg.penetrationMode === 'FORCE_JACKPOT'
                    ? 'bg-purple-600/30 border-purple-400 text-white shadow-lg'
                    : 'bg-[#121824] border-[#1d273a] text-gray-400 hover:text-purple-400'
                }`}
              >
                <div className="text-xs font-bold text-purple-400">KADEME 5</div>
                <div className="text-sm font-bold text-purple-300">Kesin Jackpot Patlat!</div>
                <p className="text-[11px] text-gray-400 font-sans">İlk çevirmede 5x Şanslı 777 Grand Jackpot patlatır.</p>
              </button>

            </div>

            {/* RTP Ayarı */}
            <div className="space-y-3 pt-2">
              <span className="text-xs font-bold text-gray-300 font-mono block">RTP (Return to Player) Kademesi:</span>
              <div className="grid grid-cols-4 gap-3 font-mono text-xs">
                {[90, 94, 96.5, 98.5].map((rtp) => (
                  <button
                    key={rtp}
                    onClick={() => handleUpdateCasinoRTP(rtp)}
                    className={`py-2.5 rounded-xl border font-bold transition ${
                      casinoCfg.rtpPercent === rtp
                        ? 'bg-amber-500 text-black border-yellow-300 shadow-md'
                        : 'bg-[#121824] text-gray-300 border-[#1d273a] hover:text-white'
                    }`}
                  >
                    %{rtp} RTP
                  </button>
                ))}
              </div>
            </div>

          </div>
        )}

        {/* ----------------------------------------------------------------------- */}
        {/* SEKME 5: SİSTEM DENETİM LOGLARI */}
        {/* ----------------------------------------------------------------------- */}
        {activeTab === 'LOGS' && (
          <div className="bg-[#0b0f17] border border-[#1c2638] rounded-2xl p-5 space-y-4 shadow-xl font-mono text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-[#182130]">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <span>📋</span> Gerçek Zamanlı Denetim & İşlem Günlüğü
              </h2>
              <button
                onClick={() => setLogMessages([])}
                className="px-3 py-1 bg-[#161d2b] hover:bg-[#202a3d] text-gray-400 hover:text-white rounded-lg text-[11px] transition"
              >
                Logları Temizle
              </button>
            </div>

            <div className="bg-[#06080d] p-4 rounded-xl border border-[#141b27] space-y-1.5 max-h-[450px] overflow-y-auto">
              {logMessages.map((msg, i) => (
                <div key={i} className="text-gray-300 leading-relaxed font-mono">
                  {msg}
                </div>
              ))}
            </div>
          </div>
        )}

      </main>

      {/* ========================================================================= */}
      {/* 4. YENİ KULLANICI EKLEME MODALI (ÖZEL ŞİFRE & E-POSTA BELİRLEME) */}
      {/* ========================================================================= */}
      {showAddUserModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fadeIn select-none">
          <div className="relative w-full max-w-md bg-[#0d121c] border-2 border-blue-500/40 rounded-3xl  overflow-hidden flex flex-col text-white">
            
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#1b2434] bg-[#090d15]">
              <div className="flex items-center gap-2">
                <span className="text-xl">👤</span>
                <div>
                  <h3 className="text-sm font-bold text-white font-sans">Yeni Kullanıcı Hesabı Ekle</h3>
                  <p className="text-[10px] text-gray-400 font-mono">E-posta ve özel giriş şifresi belirleyin</p>
                </div>
              </div>
              <button
                onClick={() => setShowAddUserModal(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-gray-300 hover:text-white flex items-center justify-center font-bold text-sm transition"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateNewUser} className="p-6 space-y-4 font-mono text-xs">
              <div className="space-y-1">
                <label className="text-gray-400 block font-bold">Kullanıcı E-Posta Adresi (Zorunlu):</label>
                <input
                  type="email"
                  required
                  value={newUserEmail}
                  onChange={(e) => setNewUserEmail(e.target.value)}
                  placeholder="musteri@firma.com"
                  className="w-full bg-[#121824] border border-[#222e42] rounded-xl px-3.5 py-2.5 text-white font-sans focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-gray-400 block font-bold">Ad Soyad / Unvan:</label>
                <input
                  type="text"
                  value={newUserName}
                  onChange={(e) => setNewUserName(e.target.value)}
                  placeholder="Örn: Mehmet Can"
                  className="w-full bg-[#121824] border border-[#222e42] rounded-xl px-3.5 py-2.5 text-white font-sans focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <label className="text-amber-300 block font-bold">Özel Giriş Şifresi:</label>
                  <span className="text-[10px] text-gray-400">Kullanıcı bu şifreyle girecek</span>
                </div>
                <input
                  type="text"
                  required
                  value={newUserPassword}
                  onChange={(e) => setNewUserPassword(e.target.value)}
                  placeholder="Örn: bursa16"
                  className="w-full bg-[#121824] border border-amber-500/50 rounded-xl px-3.5 py-2.5 text-amber-300 font-mono font-bold focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-gray-400 block font-bold">Başlangıç Bakiyesi ($):</label>
                  <input
                    type="number"
                    value={newUserBalance}
                    onChange={(e) => setNewUserBalance(Number(e.target.value))}
                    className="w-full bg-[#121824] border border-[#222e42] rounded-xl px-3 py-2 text-emerald-400 font-mono font-bold focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-gray-400 block font-bold">Kaldıraç Oranı:</label>
                  <select
                    value={newUserLeverage}
                    onChange={(e) => setNewUserLeverage(Number(e.target.value))}
                    className="w-full bg-[#121824] border border-[#222e42] rounded-xl px-3 py-2 text-cyan-400 font-mono font-bold focus:outline-none focus:border-blue-500"
                  >
                    <option value={100}>1:100</option>
                    <option value={200}>1:200</option>
                    <option value={500}>1:500</option>
                    <option value={1000}>1:1000</option>
                  </select>
                </div>
              </div>

              <div className="pt-2 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddUserModal(false)}
                  className="flex-1 py-3 bg-[#161d2b] hover:bg-[#202a3d] text-gray-300 font-bold rounded-xl transition"
                >
                  Vazgeç
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3  bg-blue-600 hover:bg-blue-700 text-white font-black rounded-xl transition shadow-lg active:scale-95"
                >
                  ✅ Kullanıcıyı Oluştur
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
}
