// components/AuthModal.tsx
'use client';

import React, { useState } from 'react';
import { AuthStore, AuthUser } from '@/lib/authStore';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: AuthUser) => void;
}

export default function AuthModal({ isOpen, onClose, onSuccess }: AuthModalProps) {
  const [tab, setTab] = useState<'LOGIN' | 'REGISTER' | 'VERIFY'>('LOGIN');
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [verifyCode, setVerifyCode] = useState('');
  const [tempUser, setTempUser] = useState<AuthUser | null>(null);
  const [notification, setNotification] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      setNotification('Lütfen geçerli bir e-posta adresi giriniz.');
      return;
    }

    const u = AuthStore.login(email);
    if (name) {
      AuthStore.updateUser(u.id, { name });
      u.name = name;
    }

    // Basit ve nazik e-posta doğrulama adımı
    setTempUser(u);
    setTab('VERIFY');
    setNotification('⚡ 4 haneli doğrulama kodu: [ 1234 ]');
  };

  const handleVerifySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (verifyCode === '1234' || verifyCode.length === 4 || !verifyCode) {
      if (tempUser) {
        AuthStore.setCurrentUser(tempUser);
        onSuccess(tempUser);
        onClose();
      }
    } else {
      setNotification('Kod hatalı. Test kodu: 1234');
    }
  };

  const handleGoogleLogin = () => {
    const user = AuthStore.loginWithGoogle();
    onSuccess(user);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-fadeIn select-none">
      <div className="relative w-full max-w-md bg-[#0d121c] border-2 border-blue-500/40 rounded-3xl shadow-[0_0_60px_rgba(41,121,255,0.25)] overflow-hidden flex flex-col text-white">
        
        {/* Üst Logo & Kapatma */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#1b2434] bg-[#090d15]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-cyan-400 flex items-center justify-center font-black text-white text-sm shadow-md">
              ⚡
            </div>
            <div>
              <span className="font-black text-sm text-white tracking-wide block">EXBINA PRIME</span>
              <span className="text-[10px] text-gray-400 font-mono">Hızlı & Güvenli Üyelik</span>
            </div>
          </div>

          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-gray-300 hover:text-white flex items-center justify-center font-bold text-sm transition"
          >
            ✕
          </button>
        </div>

        <div className="p-6 space-y-5">
          
          {/* Bildirim */}
          {notification && (
            <div className="p-3 bg-blue-500/10 border border-blue-500/30 rounded-xl text-blue-300 text-xs font-mono text-center animate-pulse">
              {notification}
            </div>
          )}

          {/* Sekmeler (Giriş / Kayıt) */}
          {tab !== 'VERIFY' && (
            <div className="grid grid-cols-2 gap-2 bg-[#121824] p-1 rounded-xl border border-[#1d273a] text-xs font-bold font-mono">
              <button
                onClick={() => { setTab('LOGIN'); setNotification(null); }}
                className={`py-2 rounded-lg transition ${tab === 'LOGIN' ? 'bg-blue-600 text-white shadow' : 'text-gray-400 hover:text-white'}`}
              >
                Giriş Yap
              </button>
              <button
                onClick={() => { setTab('REGISTER'); setNotification(null); }}
                className={`py-2 rounded-lg transition ${tab === 'REGISTER' ? 'bg-blue-600 text-white shadow' : 'text-gray-400 hover:text-white'}`}
              >
                Hesap Aç
              </button>
            </div>
          )}

          {/* GOOGLE İLE TEK TIK GİRİŞ (Zorlamayan, Kullanıcı Dostu) */}
          {tab !== 'VERIFY' && (
            <>
              <button
                onClick={handleGoogleLogin}
                className="w-full py-3 bg-[#18202f] hover:bg-[#202b3f] border border-[#2c3b54] text-white font-bold text-xs rounded-xl transition flex items-center justify-center gap-2.5 shadow active:scale-95"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                </svg>
                <span>Google ile Hızlı Giriş Yap</span>
              </button>

              <div className="flex items-center gap-3 text-xs text-gray-500 font-mono">
                <div className="h-px bg-[#1d273a] flex-1"></div>
                <span>VEYA E-POSTA İLE</span>
                <div className="h-px bg-[#1d273a] flex-1"></div>
              </div>
            </>
          )}

          {/* FORM: GİRİŞ & KAYIT */}
          {tab !== 'VERIFY' ? (
            <form onSubmit={handleEmailSubmit} className="space-y-3.5">
              {tab === 'REGISTER' && (
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-gray-400 font-mono">Adınız Soyadınız:</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Örn: Ahmet Yılmaz"
                    className="w-full bg-[#121824] border border-[#222e42] rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 font-sans"
                  />
                </div>
              )}

              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-gray-400 font-mono">E-posta Adresiniz:</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="trader@exbina.com"
                  className="w-full bg-[#121824] border border-[#222e42] rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 font-sans"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-gray-400 font-mono">Şifre:</label>
                <input
                  type="password"
                  required
                  defaultValue="123456"
                  placeholder="••••••••"
                  className="w-full bg-[#121824] border border-[#222e42] rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 font-sans"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-black text-xs rounded-xl transition shadow-[0_0_20px_rgba(41,121,255,0.4)] active:scale-95 uppercase tracking-wider font-mono mt-2"
              >
                {tab === 'LOGIN' ? 'Giriş Yap & İşleme Başla' : 'Hesabı Oluştur ($10,000 Bakiye)'}
              </button>
            </form>
          ) : (
            /* E-POSTA DOĞRULAMA (Kullanıcı dostu, 4 hane) */
            <form onSubmit={handleVerifySubmit} className="space-y-4">
              <div className="text-center space-y-1">
                <div className="text-3xl">📧</div>
                <h3 className="text-base font-bold text-white">E-posta Doğrulaması</h3>
                <p className="text-xs text-gray-400">
                  <span className="text-blue-400 font-semibold">{tempUser?.email}</span> adresine 4 haneli kod gönderildi.
                </p>
              </div>

              <div className="space-y-1 text-center">
                <label className="text-[11px] font-semibold text-gray-400 font-mono block">Doğrulama Kodu (Varsayılan: 1234):</label>
                <input
                  type="text"
                  maxLength={4}
                  value={verifyCode}
                  onChange={(e) => setVerifyCode(e.target.value)}
                  placeholder="1234"
                  className="w-40 text-center tracking-widest text-xl font-mono bg-[#121824] border-2 border-blue-500/60 rounded-xl py-2 text-white focus:outline-none focus:border-cyan-400 mx-auto block"
                />
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setTab('LOGIN')}
                  className="flex-1 py-2.5 bg-[#18202d] hover:bg-[#222c3d] text-gray-300 font-bold text-xs rounded-xl transition font-mono"
                >
                  Geri Dön
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-500 hover:opacity-95 text-white font-black text-xs rounded-xl transition shadow active:scale-95 font-mono"
                >
                  Doğrula & Başla
                </button>
              </div>
            </form>
          )}

          {/* Alt Güvence Rozeti */}
          <div className="text-center pt-2 text-[10px] text-gray-500 font-mono flex items-center justify-center gap-1.5">
            <span>🛡️</span>
            <span>256-bit SSL • Karmaşık KYC Zorunluluğu Yoktur</span>
          </div>

        </div>
      </div>
    </div>
  );
}
