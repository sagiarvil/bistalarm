'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  MarketScenario, 
  currentScenarioConfig, 
  updateScenarioConfig, 
  ScenarioConfig 
} from '@/lib/scenarioEngine';
import { SYMBOL_SPECS } from '@/lib/tradingEngine';
import { CURRENT_PRICES } from '@/lib/store';

export default function AdminPage() {
  const [config, setConfig] = useState<ScenarioConfig>(currentScenarioConfig);
  const [prices, setPrices] = useState(CURRENT_PRICES);
  const [userBalance, setUserBalance] = useState<number>(9746.60);
  const [userCredit, setUserCredit] = useState<number>(4098.00);
  const [userLeverage, setUserLeverage] = useState<number>(100);
  const [logMessages, setLogMessages] = useState<string[]>([
    'Sistem başlatıldı. Fiyat senaryo motoru aktif.',
    'Piyasa Modu: Standart Rastgele Dalgalanma (Normal Walk)'
  ]);

  // Canlı sayaç ve fiyat takibi
  useEffect(() => {
    const interval = setInterval(() => {
      // LocalStorage senkronizasyonu
      const savedConfig = localStorage.getItem('mt5_scenario_config');
      if (savedConfig) {
        try {
          setConfig(JSON.parse(savedConfig));
        } catch (e) {}
      }

      const savedPrices = localStorage.getItem('mt5_live_prices');
      if (savedPrices) {
        try {
          setPrices(JSON.parse(savedPrices));
        } catch (e) {}
      }

      const savedAccount = localStorage.getItem('mt5_user_account');
      if (savedAccount) {
        try {
          const acc = JSON.parse(savedAccount);
          setUserBalance(acc.balance);
          setUserCredit(acc.credit);
          setUserLeverage(acc.leverage);
        } catch (e) {}
      }
    }, 1000);

    return () => clearInterval(interval);
  }, []);

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
    localStorage.setItem('mt5_scenario_config', JSON.stringify(newCfg));

    const log = `[${new Date().toLocaleTimeString('tr-TR')}] Senaryo Değiştirildi: ${note} (Volatilite: ${vol}x, Yön: ${bias > 0 ? 'Boğa' : bias < 0 ? 'Ayı' : 'Nötr'})`;
    setLogMessages(prev => [log, ...prev.slice(0, 15)]);
  };

  const handleUpdateBalance = (amount: number, isCredit = false) => {
    const savedAccount = localStorage.getItem('mt5_user_account');
    if (savedAccount) {
      try {
        const acc = JSON.parse(savedAccount);
        if (isCredit) {
          acc.credit = Math.max(0, acc.credit + amount);
          setUserCredit(acc.credit);
        } else {
          acc.balance = Math.max(0, acc.balance + amount);
          setUserBalance(acc.balance);
        }
        localStorage.setItem('mt5_user_account', JSON.stringify(acc));
        const log = `[${new Date().toLocaleTimeString('tr-TR')}] Hesap Güncellendi: ${isCredit ? 'Kredi' : 'Bakiye'} += ${amount} USD`;
        setLogMessages(prev => [log, ...prev.slice(0, 15)]);
      } catch (e) {}
    }
  };

  const handleUpdateLeverage = (lev: number) => {
    const savedAccount = localStorage.getItem('mt5_user_account');
    if (savedAccount) {
      try {
        const acc = JSON.parse(savedAccount);
        acc.leverage = lev;
        setUserLeverage(lev);
        localStorage.setItem('mt5_user_account', JSON.stringify(acc));
        const log = `[${new Date().toLocaleTimeString('tr-TR')}] Kaldıraç Güncellendi: 1:${lev}`;
        setLogMessages(prev => [log, ...prev.slice(0, 15)]);
      } catch (e) {}
    }
  };

  return (
    <div className="min-h-screen bg-[#0d1117] text-[#c9d1d9] font-sans p-4 md:p-8">
      {/* Üst Bar */}
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#30363d] pb-6 mb-8">
        <div>
          <div className="flex items-center gap-3">
            <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse"></span>
            <h1 className="text-2xl font-bold text-white tracking-wide">
              MT5 Dealer & Market Maker Kontrol Konsolu
            </h1>
            <span className="bg-[#238636]/20 text-[#3fb950] border border-[#238636]/40 text-xs px-2.5 py-0.5 rounded-full font-mono">
              CANLI YAYIN
            </span>
          </div>
          <p className="text-sm text-[#8b949e] mt-1">
            Algoritmik Piyasa Senaryoları, Fiyat Manipülasyonu & Üye Hesap Yönetim Paneli
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link 
            href="/" 
            className="flex items-center gap-2 bg-[#21262d] hover:bg-[#30363d] text-white border border-[#30363d] px-4 py-2 rounded-lg text-sm font-semibold transition"
          >
            <span>📱</span> MT5 Mobil Terminale Git
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* SOL VE ORTA KOLON: SENARYO KONTROL MERKEZİ */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Aktif Senaryo Durumu */}
          <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-5 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <span>🎛️</span> Aktif Piyasa Rejimi
              </h2>
              <span className="text-xs font-mono bg-[#30363d] text-blue-400 px-3 py-1 rounded-md">
                Kalan: {config.remainingSeconds}s
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-[#0d1117] rounded-lg border border-[#30363d]/60 mb-4">
              <div>
                <div className="text-xs text-[#8b949e]">Senaryo Modu</div>
                <div className="text-sm font-bold text-emerald-400 mt-0.5">{config.activeScenario}</div>
              </div>
              <div>
                <div className="text-xs text-[#8b949e]">Volatilite Çarpanı</div>
                <div className="text-sm font-bold text-yellow-400 mt-0.5">{config.volatilityMultiplier}x</div>
              </div>
              <div>
                <div className="text-xs text-[#8b949e]">Piyasa Eğilimi (Bias)</div>
                <div className="text-sm font-bold text-cyan-400 mt-0.5">
                  {config.bias > 0 ? `Boğa (+${config.bias})` : config.bias < 0 ? `Ayı (${config.bias})` : 'Nötr (0.0)'}
                </div>
              </div>
              <div>
                <div className="text-xs text-[#8b949e]">Şok İhtimali</div>
                <div className="text-sm font-bold text-purple-400 mt-0.5">%{ (config.shockProbability * 100).toFixed(0) }</div>
              </div>
            </div>

            <div className="text-xs text-[#8b949e] italic">
              ℹ️ Not: {config.customNote}
            </div>
          </div>

          {/* Senaryo Tetikleme Butonları */}
          <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-5 shadow-lg">
            <h2 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
              <span>🚀</span> Algoritmik Piyasa Senaryoları (Tek Tıkla Çalıştır)
            </h2>
            <p className="text-xs text-[#8b949e] mb-4">
              Aşağıdaki senaryolardan birini seçtiğinizde, tüm üyelerin terminallerindeki fiyat akışı matematiksel olarak bu modele geçer.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              
              {/* Standart */}
              <button 
                onClick={() => handleApplyScenario('NORMAL_WALK', 'Standart Rastgele Dalgalanma (Brownian Motion)', 1.0, 0.0)}
                className={`p-3.5 rounded-lg border text-left transition flex items-start gap-3 ${
                  config.activeScenario === 'NORMAL_WALK' 
                    ? 'bg-blue-600/20 border-blue-500 text-white' 
                    : 'bg-[#0d1117] border-[#30363d] hover:border-gray-500 text-[#c9d1d9]'
                }`}
              >
                <span className="text-xl">⚖️</span>
                <div>
                  <div className="font-semibold text-sm">Standart Piyasa (Normal Walk)</div>
                  <div className="text-xs text-[#8b949e] mt-1">Dengeli, organik Brownian motion salınımı. İki yön eşit ihtimalli.</div>
                </div>
              </button>

              {/* Boğa Rallisi */}
              <button 
                onClick={() => handleApplyScenario('BULL_TREND', 'Boğa Trendi: Düzeltmelerle Güçlü Yükseliş', 1.4, 0.7)}
                className={`p-3.5 rounded-lg border text-left transition flex items-start gap-3 ${
                  config.activeScenario === 'BULL_TREND' 
                    ? 'bg-emerald-600/20 border-emerald-500 text-white' 
                    : 'bg-[#0d1117] border-[#30363d] hover:border-gray-500 text-[#c9d1d9]'
                }`}
              >
                <span className="text-xl">📈</span>
                <div>
                  <div className="font-semibold text-sm text-emerald-400">Boğa Trendi (Bull Rally)</div>
                  <div className="text-xs text-[#8b949e] mt-1">%65 yukarı, %35 aşağı geri çekilmelerle sağlıklı yükseliş trendi.</div>
                </div>
              </button>

              {/* Ayı Çöküşü */}
              <button 
                onClick={() => handleApplyScenario('BEAR_TREND', 'Ayı Trendi: Tepki Yükselişleriyle Organik Düşüş', 1.4, -0.7)}
                className={`p-3.5 rounded-lg border text-left transition flex items-start gap-3 ${
                  config.activeScenario === 'BEAR_TREND' 
                    ? 'bg-red-600/20 border-red-500 text-white' 
                    : 'bg-[#0d1117] border-[#30363d] hover:border-gray-500 text-[#c9d1d9]'
                }`}
              >
                <span className="text-xl">📉</span>
                <div>
                  <div className="font-semibold text-sm text-red-400">Ayı Trendi (Bear Market)</div>
                  <div className="text-xs text-[#8b949e] mt-1">%65 aşağı, %35 yukarı tepki alımlarıyla organik satış baskısı.</div>
                </div>
              </button>

              {/* NFP / Haber Yukarı Şok */}
              <button 
                onClick={() => handleApplyScenario('NEWS_SHOCK_SPIKE', 'NFP / Faiz Kararı: Ani Yukarı İğne & Stop Avı', 3.0, 0.9)}
                className={`p-3.5 rounded-lg border text-left transition flex items-start gap-3 ${
                  config.activeScenario === 'NEWS_SHOCK_SPIKE' 
                    ? 'bg-yellow-600/20 border-yellow-500 text-white' 
                    : 'bg-[#0d1117] border-[#30363d] hover:border-gray-500 text-[#c9d1d9]'
                }`}
              >
                <span className="text-xl">⚡</span>
                <div>
                  <div className="font-semibold text-sm text-yellow-400">Haber Şoku (NFP Spike)</div>
                  <div className="text-xs text-[#8b949e] mt-1">3x volatilite. Yukarı anlık dev iğne atıp ardından kâr satışı getirir.</div>
                </div>
              </button>

              {/* Haber Aşağı Şok */}
              <button 
                onClick={() => handleApplyScenario('NEWS_SHOCK_DUMP', 'Jeopolitik Kriz / Faiz Kararı: Ani Düşüş Şoku', 3.0, -0.9)}
                className={`p-3.5 rounded-lg border text-left transition flex items-start gap-3 ${
                  config.activeScenario === 'NEWS_SHOCK_DUMP' 
                    ? 'bg-orange-600/20 border-orange-500 text-white' 
                    : 'bg-[#0d1117] border-[#30363d] hover:border-gray-500 text-[#c9d1d9]'
                }`}
              >
                <span className="text-xl">💥</span>
                <div>
                  <div className="font-semibold text-sm text-orange-400">Haber Şoku (Dump & Flush)</div>
                  <div className="text-xs text-[#8b949e] mt-1">Aşağı yönlü ani 50-100 pip çöküş, alttaki stopları patlatma.</div>
                </div>
              </button>

              {/* Testere / Stop Avı */}
              <button 
                onClick={() => handleApplyScenario('LIQUIDITY_HUNT', 'Testere Piyasası: Sahte Kırılımlar ve Çift Yönlü Stop Avı', 2.0, 0.0)}
                className={`p-3.5 rounded-lg border text-left transition flex items-start gap-3 ${
                  config.activeScenario === 'LIQUIDITY_HUNT' 
                    ? 'bg-purple-600/20 border-purple-500 text-white' 
                    : 'bg-[#0d1117] border-[#30363d] hover:border-gray-500 text-[#c9d1d9]'
                }`}
              >
                <span className="text-xl">🪚</span>
                <div>
                  <div className="font-semibold text-sm text-purple-400">Testere & Likidite Avı (Chop)</div>
                  <div className="text-xs text-[#8b949e] mt-1">Direnç kırar gibi yapıp döner, destek kırar gibi yapıp döner.</div>
                </div>
              </button>

              {/* Flash Crash & V Recovery */}
              <button 
                onClick={() => handleApplyScenario('FLASH_CRASH_V_RECOVERY', 'Flash Crash: Ani Çöküş ve 60 sn İçinde V-Toparlanma', 3.5, 0.0)}
                className={`p-3.5 rounded-lg border text-left transition flex items-start gap-3 ${
                  config.activeScenario === 'FLASH_CRASH_V_RECOVERY' 
                    ? 'bg-red-800/40 border-red-500 text-white' 
                    : 'bg-[#0d1117] border-[#30363d] hover:border-gray-500 text-[#c9d1d9]'
                }`}
              >
                <span className="text-xl">📉🔄</span>
                <div>
                  <div className="font-semibold text-sm text-red-300">Flash Crash & V-Recovery</div>
                  <div className="text-xs text-[#8b949e] mt-1">Dakikalar içinde sert çöküş ardından panik alımlarıyla eski yerine dönüş.</div>
                </div>
              </button>

              {/* Arbitraj Açığı */}
              <button 
                onClick={() => handleApplyScenario('ARBITRAGE_GAP', 'Arbitraj Fırsatı: Spread Açılması & Fiyat Kayması', 1.8, 0.2)}
                className={`p-3.5 rounded-lg border text-left transition flex items-start gap-3 ${
                  config.activeScenario === 'ARBITRAGE_GAP' 
                    ? 'bg-cyan-600/20 border-cyan-500 text-white' 
                    : 'bg-[#0d1117] border-[#30363d] hover:border-gray-500 text-[#c9d1d9]'
                }`}
              >
                <span className="text-xl">⚡🌐</span>
                <div>
                  <div className="font-semibold text-sm text-cyan-400">Arbitraj & Fiyat Kayması</div>
                  <div className="text-xs text-[#8b949e] mt-1">Spread anlık 3 katına çıkar, hızlı scalper botlar için arbitraj boşluğu.</div>
                </div>
              </button>

            </div>
          </div>

          {/* Canlı Piyasa Fiyatları Tablosu */}
          <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-5 shadow-lg">
            <h2 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
              <span>📊</span> Canlı Sembol Fiyatları
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead>
                  <tr className="border-b border-[#30363d] text-[#8b949e]">
                    <th className="py-2.5 px-3">SEMBOL</th>
                    <th className="py-2.5 px-3">BID (ALIŞ)</th>
                    <th className="py-2.5 px-3">ASK (SATIŞ)</th>
                    <th className="py-2.5 px-3">SPREAD</th>
                    <th className="py-2.5 px-3">HIGH / LOW</th>
                    <th className="py-2.5 px-3">GÜNCELLEME</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#30363d]/50">
                  {Object.entries(prices).map(([sym, cur]) => {
                    const spec = SYMBOL_SPECS[sym];
                    const spreadPips = spec ? (spec.spread / spec.pipSize).toFixed(1) : '-';
                    return (
                      <tr key={sym} className="hover:bg-[#21262d]/50">
                        <td className="py-2.5 px-3 font-bold text-white">{sym}</td>
                        <td className="py-2.5 px-3 text-blue-400 font-semibold">{cur.bid}</td>
                        <td className="py-2.5 px-3 text-red-400 font-semibold">{cur.ask}</td>
                        <td className="py-2.5 px-3 text-[#8b949e]">{spreadPips} pip</td>
                        <td className="py-2.5 px-3 text-gray-400">{cur.high} / {cur.low}</td>
                        <td className="py-2.5 px-3 text-[#8b949e]">{cur.time}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

        </div>

        {/* SAĞ KOLON: ÜYE HESAP YÖNETİMİ & LOGLAR */}
        <div className="space-y-6">
          
          {/* Müşteri Hesap Bilgisi & Müdahale */}
          <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-5 shadow-lg">
            <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <span>👤</span> Müşteri Hesabı: 20767
            </h2>
            <div className="text-xs text-[#8b949e] mb-3">Fetih Çetin (Exbina-Server)</div>

            <div className="space-y-3 bg-[#0d1117] p-4 rounded-lg border border-[#30363d]">
              <div className="flex justify-between items-center text-sm">
                <span className="text-[#8b949e]">Bakiye (Balance):</span>
                <span className="font-bold font-mono text-emerald-400">${userBalance.toFixed(2)} USD</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-[#8b949e]">Kredi (Credit):</span>
                <span className="font-bold font-mono text-blue-400">${userCredit.toFixed(2)} USD</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-[#8b949e]">Kaldıraç:</span>
                <span className="font-bold font-mono text-yellow-400">1:{userLeverage}</span>
              </div>
            </div>

            {/* Bakiye Yükleme Butonları */}
            <div className="mt-4 space-y-2">
              <div className="text-xs text-[#8b949e] font-semibold">Bakiye & Kredi Müdahalesi:</div>
              <div className="grid grid-cols-2 gap-2">
                <button 
                  onClick={() => handleUpdateBalance(1000)}
                  className="bg-[#238636] hover:bg-[#2ea043] text-white text-xs font-semibold py-2 px-3 rounded transition"
                >
                  + $1,000 Deposit
                </button>
                <button 
                  onClick={() => handleUpdateBalance(-1000)}
                  className="bg-red-700 hover:bg-red-600 text-white text-xs font-semibold py-2 px-3 rounded transition"
                >
                  - $1,000 Çekim
                </button>
                <button 
                  onClick={() => handleUpdateBalance(2000, true)}
                  className="bg-blue-700 hover:bg-blue-600 text-white text-xs font-semibold py-2 px-3 rounded transition"
                >
                  + $2,000 Kredi Ekle
                </button>
                <button 
                  onClick={() => handleUpdateBalance(-2000, true)}
                  className="bg-gray-700 hover:bg-gray-600 text-white text-xs font-semibold py-2 px-3 rounded transition"
                >
                  - Kredi İptal
                </button>
              </div>
            </div>

            {/* Kaldıraç Değiştirme */}
            <div className="mt-4">
              <div className="text-xs text-[#8b949e] font-semibold mb-2">Kaldıraç Oranı:</div>
              <div className="grid grid-cols-4 gap-1.5 font-mono text-xs">
                {[50, 100, 200, 500].map((lev) => (
                  <button
                    key={lev}
                    onClick={() => handleUpdateLeverage(lev)}
                    className={`py-1.5 rounded border transition font-bold ${
                      userLeverage === lev 
                        ? 'bg-blue-600 text-white border-blue-500' 
                        : 'bg-[#0d1117] text-gray-300 border-[#30363d] hover:bg-[#21262d]'
                    }`}
                  >
                    1:{lev}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Canlı Konsol Logları */}
          <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-5 shadow-lg">
            <h2 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
              <span>📜</span> Olay Günlüğü (Audit Log)
            </h2>
            <div className="bg-[#0d1117] p-3 rounded-lg border border-[#30363d] font-mono text-[11px] text-gray-400 space-y-1.5 max-h-56 overflow-y-auto">
              {logMessages.map((msg, idx) => (
                <div key={idx} className="leading-tight border-b border-[#30363d]/30 pb-1">
                  {msg}
                </div>
              ))}
            </div>
          </div>

          {/* Stratejik Özet Kartı */}
          <div className="bg-gradient-to-br from-[#161b22] to-[#1f2937] border border-blue-500/30 rounded-xl p-5 shadow-lg">
            <h3 className="text-sm font-bold text-blue-400 mb-2 flex items-center gap-2">
              <span>💡</span> Yeni FinTech Trendi: Prop Firm
            </h3>
            <p className="text-xs text-gray-300 leading-relaxed">
              Dünyadaki en karlı model, kullanıcıya doğrudan sanal sınav açmaktır:
              <strong> %10 Kâr Hedefi</strong>, <strong>%5 Max Drawdown</strong>. 
              Sınavı geçen üyeye sanal 100.000$ bakiye tanımlanır ve kârından komisyon ödenir. Sıfır yasal risk, maksimum bağlılık!
            </p>
          </div>

        </div>

      </div>
    </div>
  );
}
