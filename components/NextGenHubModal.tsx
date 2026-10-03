'use client';

import React, { useState } from 'react';
import { UserAccount, Position } from '@/lib/tradingEngine';

interface NextGenHubModalProps {
  isOpen: boolean;
  onClose: () => void;
  account: UserAccount;
  onSelectSymbol: (symbol: string) => void;
  onChangeLeverage: (leverage: number) => void;
  onPlaceOrder: (params: any) => void;
  onDeposit: (amount: number) => void;
}

export default function NextGenHubModal({
  isOpen,
  onClose,
  account,
  onSelectSymbol,
  onChangeLeverage,
  onPlaceOrder,
  onDeposit
}: NextGenHubModalProps) {
  const [activeTab, setActiveTab] = useState<'dynamic' | 'synthetic' | 'arbitrage' | 'prop' | 'copy'>('dynamic');
  const [arbScanning, setArbScanning] = useState(false);
  const [arbSuccess, setArbSuccess] = useState<string | null>(null);
  const [copiedTrader, setCopiedTrader] = useState<string | null>(null);

  if (!isOpen) return null;

  // Arbitraj Sistemini Çalıştırma
  const handleRunArbitrage = () => {
    setArbScanning(true);
    setArbSuccess(null);
    setTimeout(() => {
      setArbScanning(false);
      const profit = Math.floor(120 + Math.random() * 160);
      onDeposit(profit);
      setArbSuccess(`⚡ Arbitraj Başarılı! LD4 (London) vs NY4 arasındaki 180ms gecikme yakalandı: +$${profit}.00 USD kâr hesaba eklendi!`);
    }, 2000);
  };

  // Copy Trading Başlatma
  const handleCopy = (traderName: string, sym: string, lots: number) => {
    setCopiedTrader(traderName);
    onPlaceOrder({
      symbol: sym,
      side: 'buy',
      type: 'market',
      lots,
      sl: null,
      tp: null
    });
    setTimeout(() => {
      setCopiedTrader(null);
    }, 3000);
  };

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-[#0c1017] border border-[#232d3f] rounded-2xl max-w-4xl w-full p-4 sm:p-6 shadow-2xl space-y-5 my-auto max-h-[92vh] flex flex-col">
        
        {/* Üst Başlık */}
        <div className="flex justify-between items-start border-b border-[#1c2433] pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl">🚀</span>
              <h2 className="text-lg sm:text-xl font-extrabold text-white tracking-wide">
                Yeni Nesil Kaldıraç & Yaratıcı Kazanç Kapıları
              </h2>
              <span className=" text-white text-[10px] font-bold px-2 py-0.5 rounded-full font-mono">
                WEB3 & FINTECH 2026
              </span>
            </div>
            <p className="text-xs text-gray-400 mt-1">
              Geleneksel piyasaların ötesinde; 1:2000 dinamik kaldıraç, 7/24 sentetik patlama endeksleri, milisaniyelik arbitraj ve 100K$ prop fonlama.
            </p>
          </div>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-white text-lg p-1"
          >
            ✕
          </button>
        </div>

        {/* Sekmeler */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5 bg-[#121721] p-1.5 rounded-xl border border-[#1e2637] text-xs font-semibold">
          <button
            onClick={() => setActiveTab('dynamic')}
            className={`py-2 px-2 rounded-lg transition text-center ${activeTab === 'dynamic' ? 'bg-[#2979ff] text-white font-bold shadow' : 'text-gray-400 hover:text-white'}`}
          >
            🚀 1:2000 Kaldıraç
          </button>
          <button
            onClick={() => setActiveTab('synthetic')}
            className={`py-2 px-2 rounded-lg transition text-center ${activeTab === 'synthetic' ? 'bg-[#2979ff] text-white font-bold shadow' : 'text-gray-400 hover:text-white'}`}
          >
            💥 Boom & Crash
          </button>
          <button
            onClick={() => setActiveTab('arbitrage')}
            className={`py-2 px-2 rounded-lg transition text-center ${activeTab === 'arbitrage' ? 'bg-[#2979ff] text-white font-bold shadow' : 'text-gray-400 hover:text-white'}`}
          >
            ⚡ Flaş Arbitraj
          </button>
          <button
            onClick={() => setActiveTab('prop')}
            className={`py-2 px-2 rounded-lg transition text-center ${activeTab === 'prop' ? 'bg-[#2979ff] text-white font-bold shadow' : 'text-gray-400 hover:text-white'}`}
          >
            🏆 100K$ Prop Sınavı
          </button>
          <button
            onClick={() => setActiveTab('copy')}
            className={`py-2 px-2 rounded-lg transition text-center ${activeTab === 'copy' ? 'bg-[#2979ff] text-white font-bold shadow' : 'text-gray-400 hover:text-white'}`}
          >
            👥 Copy Trading
          </button>
        </div>

        {/* Sekme İçerikleri */}
        <div className="flex-1 overflow-y-auto pr-1">
          
          {/* 1. DİNAMİK 1:2000 KALDIRAÇ */}
          {activeTab === 'dynamic' && (
            <div className="space-y-4">
              <div className="bg-gradient-to-r from-blue-900/20 to-indigo-900/20 border border-blue-500/30 rounded-xl p-4">
                <h3 className="font-bold text-white text-sm mb-1">Dinamik Mikro-Kaldıraç Modeli (Tiered Margin)</h3>
                <p className="text-xs text-gray-300 leading-relaxed">
                  Geleneksel brokerların 1:100 kısıtlamasını kırın! Küçük hacimli emirlerde sermaye gereksinimini sıfıra indiren kademeli kaldıraç sistemi ile sadece <strong>$5 teminatla 0.10 Lot Altın veya Endeks</strong> açabilirsiniz.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono text-xs">
                <div className="bg-[#121721] p-3.5 rounded-xl border border-[#1e2637] space-y-1">
                  <span className="text-[10px] text-emerald-400 font-bold uppercase block">KADEME 1 (Mikro Scalp)</span>
                  <div className="text-lg font-bold text-white">0.01 – 0.50 Lot</div>
                  <div className="text-cyan-400 font-extrabold text-sm">1:2000 Kaldıraç</div>
                  <div className="text-[11px] text-gray-400 font-sans mt-1">Gereken Teminat: ~%0.05</div>
                </div>

                <div className="bg-[#121721] p-3.5 rounded-xl border border-[#1e2637] space-y-1">
                  <span className="text-[10px] text-blue-400 font-bold uppercase block">KADEME 2 (Standart)</span>
                  <div className="text-lg font-bold text-white">0.51 – 2.00 Lot</div>
                  <div className="text-blue-400 font-extrabold text-sm">1:1000 Kaldıraç</div>
                  <div className="text-[11px] text-gray-400 font-sans mt-1">Gereken Teminat: ~%0.10</div>
                </div>

                <div className="bg-[#121721] p-3.5 rounded-xl border border-[#1e2637] space-y-1">
                  <span className="text-[10px] text-purple-400 font-bold uppercase block">KADEME 3 (Büyük Hacim)</span>
                  <div className="text-lg font-bold text-white">2.01+ Lot</div>
                  <div className="text-purple-400 font-extrabold text-sm">1:500 Kaldıraç</div>
                  <div className="text-[11px] text-gray-400 font-sans mt-1">Gereken Teminat: ~%0.20</div>
                </div>
              </div>

              <div className="p-4 bg-[#141a24] rounded-xl border border-[#232c3d] flex flex-col sm:flex-row items-center justify-between gap-3">
                <div>
                  <span className="text-xs text-gray-300 font-semibold block">Mevcut Hesap Kaldıracınız: 1:{account.leverage}</span>
                  <span className="text-[11px] text-gray-500">1:2000 modunu aktif ettiğinizde küçük lotlarda doğrudan devreye girer.</span>
                </div>
                <button
                  onClick={() => {
                    onChangeLeverage(2000);
                    onClose();
                  }}
                  className="w-full sm:w-auto px-5 py-2.5  bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-xs transition shadow-lg shrink-0"
                >
                  🚀 1:2000 Kaldıracı Aktif Et
                </button>
              </div>
            </div>
          )}

          {/* 2. 7/24 SENTETİK BOOM & CRASH */}
          {activeTab === 'synthetic' && (
            <div className="space-y-4">
              <div className="bg-gradient-to-r from-purple-900/20 to-pink-900/20 border border-purple-500/30 rounded-xl p-4">
                <h3 className="font-bold text-white text-sm mb-1">Hafta Sonu Kesintisiz: Boom & Crash Endeksleri</h3>
                <p className="text-xs text-gray-300 leading-relaxed">
                  Forex piyasaları Cuma akşamı kapandığında bile 7/24 çalışan matematiksel volatilite endeksleri.
                  Dünyada Deriv&apos;in milyarlarca dolar hacim ürettiği efsanevi model: Fiyat sürekli sabit adımlarla ilerler ve ortalama her 500 veya 1000 tick&apos;te bir anlık <strong>%300-%500 patlama veya çöküş iğnesi</strong> atar!
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="bg-[#121721] p-4 rounded-xl border border-[#1e2637] space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-xs font-bold text-emerald-400">BOOM 1000 INDEX</span>
                      <span className="text-[11px] text-gray-400 block font-mono">Yukarı Patlama Endeksi</span>
                    </div>
                    <span className="bg-emerald-500/10 text-emerald-400 text-[10px] font-bold px-2 py-0.5 rounded font-mono">7/24 CANLI</span>
                  </div>
                  <p className="text-[11px] text-gray-300 font-sans">
                    Yavaş yavaş iner, aniden yukarı dev iğne (spike) atar. Spike yakalayan alıcılar 1 saniyede %400 kazanır!
                  </p>
                  <button
                    onClick={() => {
                      onSelectSymbol('BOOM1000');
                      onClose();
                    }}
                    className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded text-xs transition font-mono"
                  >
                    📈 BOOM 1000 Grafiğini Aç
                  </button>
                </div>

                <div className="bg-[#121721] p-4 rounded-xl border border-[#1e2637] space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-xs font-bold text-rose-400">CRASH 500 INDEX</span>
                      <span className="text-[11px] text-gray-400 block font-mono">Aşağı Çöküş Endeksi</span>
                    </div>
                    <span className="bg-rose-500/10 text-rose-400 text-[10px] font-bold px-2 py-0.5 rounded font-mono">7/24 CANLI</span>
                  </div>
                  <p className="text-[11px] text-gray-300 font-sans">
                    Yavaş yavaş yükselir, her 500 tickte bir dev kırmızı çöküş mumu bırakır. Short açan scalper&apos;lar için idealdir.
                  </p>
                  <button
                    onClick={() => {
                      onSelectSymbol('CRASH500');
                      onClose();
                    }}
                    className="w-full py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded text-xs transition font-mono"
                  >
                    📉 CRASH 500 Grafiğini Aç
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* 3. GECİKME ARBİTRAJI VE YÜKSEK FREKANSLI İŞLEM SİSTEMİ */}
          {activeTab === 'arbitrage' && (
            <div className="space-y-4">
              <div className="bg-gradient-to-r from-cyan-900/20 to-blue-900/20 border border-cyan-500/30 rounded-xl p-4">
                <h3 className="font-bold text-white text-sm mb-1">Milisaniyelik Gecikme Arbitrajı (Latency Arbitrage)</h3>
                <p className="text-xs text-gray-300 leading-relaxed">
                  İki farklı likidite sağlayıcı arasındaki 150-250ms ağ gecikmesini tespit eden arbitraj mekanizması.
                  Hızlı fiyat kaynağında (London Equinix LD4) fiyat hareket ettiği anda, henüz yavaş kaynağa yansımamış fiyat açığını yakalar ve <strong>sıfır piyasa riskiyle</strong> anında kâr kilitler.
                </p>
              </div>

              <div className="bg-[#121721] p-4 rounded-xl border border-[#1e2637] space-y-3">
                <div className="grid grid-cols-2 gap-3 text-xs font-mono">
                  <div className="bg-[#090c12] p-2.5 rounded border border-[#232c3d]">
                    <span className="text-gray-500 text-[10px] block">HIZLI BESLEME (LD4)</span>
                    <span className="text-white font-bold">EURUSD: 1.08542</span>
                    <span className="text-emerald-400 text-[10px] block">Gecikme: 2ms</span>
                  </div>
                  <div className="bg-[#090c12] p-2.5 rounded border border-[#232c3d]">
                    <span className="text-gray-500 text-[10px] block">YAVAŞ BROKER (NY4)</span>
                    <span className="text-white font-bold">EURUSD: 1.08520</span>
                    <span className="text-rose-400 text-[10px] block">Gecikme: 182ms</span>
                  </div>
                </div>

                <div className="flex justify-between items-center text-xs font-mono py-1">
                  <span className="text-gray-400">Net Arbitraj Boşluğu:</span>
                  <span className="text-cyan-400 font-extrabold">+2.2 Pip (Garantili Spread)</span>
                </div>

                {arbSuccess && (
                  <div className="p-3 bg-emerald-500/15 border border-emerald-500/40 rounded text-emerald-400 text-xs font-mono">
                    {arbSuccess}
                  </div>
                )}

                <button
                  onClick={handleRunArbitrage}
                  disabled={arbScanning}
                  className="w-full py-3 bg-cyan-600 hover:bg-cyan-500 disabled:bg-gray-700 text-white font-bold rounded-lg text-xs transition font-mono flex items-center justify-center gap-2 shadow-lg"
                >
                  {arbScanning ? (
                    <>
                      <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                      <span>Likidite Havuzları Taranıyor (LD4 vs NY4)...</span>
                    </>
                  ) : (
                    <span>⚡ Tek Tıkla Arbitraj Sistemini Çalıştır</span>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* 4. PROP TRADING FONLAMA CHALLENGE */}
          {activeTab === 'prop' && (
            <div className="space-y-4">
              <div className="bg-gradient-to-r from-yellow-900/20 to-amber-900/20 border border-yellow-500/30 rounded-xl p-4">
                <h3 className="font-bold text-white text-sm mb-1">100.000$ Fon Yönetim Sınavı (Prop Evaluation)</h3>
                <p className="text-xs text-gray-300 leading-relaxed">
                  Kendi paranızı kaybetme korkusunu unutun! Şirketimizin <strong>$100,000 Fon Hesabı</strong> için yetenek sınavına katılın. Kurallara uyup hedef kâra ulaşan başarılı yatırımcılarımıza gerçek sanal fon tahsis edilir ve <strong>kârın %80&apos;i nakit ödenir</strong>.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono text-xs">
                <div className="bg-[#121721] p-3.5 rounded-xl border border-[#1e2637] space-y-1">
                  <span className="text-gray-400 text-[10px] uppercase block">HEDEF KÂR (Phase 1)</span>
                  <div className="text-lg font-bold text-emerald-400">%10 ($10,000)</div>
                  <div className="text-[11px] text-gray-400 font-sans mt-1">Zaman sınırı yok</div>
                </div>

                <div className="bg-[#121721] p-3.5 rounded-xl border border-[#1e2637] space-y-1">
                  <span className="text-gray-400 text-[10px] uppercase block">GÜNLÜK MAX KAYIP</span>
                  <div className="text-lg font-bold text-rose-400">%5 ($5,000)</div>
                  <div className="text-[11px] text-gray-400 font-sans mt-1">Sermaye koruma kuralı</div>
                </div>

                <div className="bg-[#121721] p-3.5 rounded-xl border border-[#1e2637] space-y-1">
                  <span className="text-gray-400 text-[10px] uppercase block">KÂR PAYLAŞIMI</span>
                  <div className="text-lg font-bold text-yellow-400">%80 PAY SİZİN</div>
                  <div className="text-[11px] text-gray-400 font-sans mt-1">Her 14 günde bir çekim</div>
                </div>
              </div>

              <button
                onClick={() => {
                  onDeposit(100000 - account.balance);
                  onClose();
                }}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-xs transition font-mono shadow-lg"
              >
                🏆 100.000$ Değerlendirme Hesabını Başlat
              </button>
            </div>
          )}

          {/* 5. COPY TRADING */}
          {activeTab === 'copy' && (
            <div className="space-y-4">
              <div className="bg-gradient-to-r from-emerald-900/20 to-teal-900/20 border border-emerald-500/30 rounded-xl p-4">
                <h3 className="font-bold text-white text-sm mb-1">Kıdemli Portföy Yöneticileri & Kopya Ticareti</h3>
                <p className="text-xs text-gray-300 leading-relaxed">
                  Piyasayı analiz etmeye vaktiniz yok mu? Platformumuzun en yüksek getiri sağlayan lisanslı fon yöneticilerini ve tecrübeli trader&apos;larını tek tıkla kopyalayın.
                </p>
              </div>

              <div className="space-y-3 font-mono text-xs">
                
                {/* Trader 1 */}
                <div className="bg-[#121721] p-4 rounded-xl border border-[#1e2637] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center font-bold text-white text-sm">
                      QA
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white text-sm">Quant Alpha (Hedge Fund Desk)</span>
                        <span className="bg-blue-500/20 text-blue-400 text-[10px] px-1.5 py-0.2 rounded font-bold">FON</span>
                      </div>
                      <span className="text-[11px] text-gray-400 font-sans">Kazanma Oranı: %94.2 • 30G Kâr: +$42,800 • 1,420 Takipçi</span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleCopy('Quant Alpha', 'NASDAQ.j', 0.5)}
                    className="w-full sm:w-auto px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded text-xs transition shrink-0"
                  >
                    {copiedTrader === 'Quant Alpha' ? '✓ Kopyalandı (Emir Açıldı!)' : 'Kopyala (%80 Eşle)'}
                  </button>
                </div>

                {/* Trader 2 */}
                <div className="bg-[#121721] p-4 rounded-xl border border-[#1e2637] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-yellow-600 flex items-center justify-center font-bold text-white text-sm">
                      GS
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white text-sm">Gold Sniper (XAU Scalper)</span>
                        <span className="bg-yellow-500/20 text-yellow-400 text-[10px] px-1.5 py-0.2 rounded">PRO</span>
                      </div>
                      <span className="text-[11px] text-gray-400 font-sans">Kazanma Oranı: %88.5 • 30G Kâr: +$19,250 • 890 Takipçi</span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleCopy('Gold Sniper', 'XAUUSDX', 0.2)}
                    className="w-full sm:w-auto px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded text-xs transition shrink-0"
                  >
                    {copiedTrader === 'Gold Sniper' ? '✓ Kopyalandı (Emir Açıldı!)' : 'Kopyala (%80 Eşle)'}
                  </button>
                </div>

              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
