'use client';

// app/(auth)/login/page.tsx

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';

function parseAuthError(message: string): string {
  if (message.includes('Invalid login credentials')) return 'Email atau password salah';
  if (message.includes('Email not confirmed'))        return 'Silakan verifikasi email Anda terlebih dahulu';
  return 'Terjadi kesalahan, coba lagi nanti';
}

export default function LoginPage() {
  const router       = useRouter();
  const searchParams = useSearchParams();

  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({ email, password });
      if (authError) { setError(parseAuthError(authError.message)); return; }
      if (!data.session) { setError('Login gagal, silakan coba lagi'); return; }
      const redirectTo = searchParams.get('redirectTo') ?? '/dashboard';
      router.push(redirectTo);
      router.refresh();
    } catch {
      setError('Terjadi kesalahan, coba lagi nanti');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        html, body { font-family: 'Plus Jakarta Sans', sans-serif; background: #f1f5f9; }
        input[type=number]::-webkit-inner-spin-button { -webkit-appearance: none; }
      `}</style>

      {/* Full-screen centering wrapper */}
      <div className="min-h-screen flex justify-center bg-slate-100">
        <div className="w-full max-w-sm flex flex-col bg-white min-h-screen overflow-hidden relative">

          {/* ── Blue hero section ── */}
          <div className="relative bg-blue-600 px-5 pt-14 pb-20 overflow-hidden shrink-0">
            {/* Decorative bubbles */}
            <div className="absolute -top-8 -right-8 w-40 h-40 rounded-full bg-blue-500/50 pointer-events-none" />
            <div className="absolute top-10 right-2 w-20 h-20 rounded-full bg-blue-400/30 pointer-events-none" />

            {/* Nav row */}
            <div className="relative z-10 flex items-center justify-between mb-10">
              {/* Brand */}
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-white flex items-center justify-center">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path d="M3 17L9 11L13 15L21 7" stroke="#2563eb" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                    <circle cx="21" cy="7" r="2" fill="#2563eb"/>
                  </svg>
                </div>
                <div className="leading-none">
                  <p className="text-white font-extrabold text-[15px]">Finance</p>
                  <p className="text-blue-200 font-bold text-[10px] tracking-[0.15em] uppercase">Target</p>
                </div>
              </div>

              {/* Daftar button */}
              <a
                href="/register"
                className="text-[13px] font-semibold text-white bg-white/20 backdrop-blur-sm px-4 py-1.5 rounded-full border border-white/30 hover:bg-white/30 transition"
              >
                Daftar
              </a>
            </div>

            {/* Hero copy */}
            <div className="relative z-10">
              <p className="text-blue-100 text-sm font-medium mb-1">Selamat datang 👋</p>
              <h1 className="text-white font-extrabold text-[26px] leading-snug mb-2">
                Kelola Keuangan,<br />Capai Targetmu
              </h1>
              <p className="text-blue-100 text-[13px] font-medium">
                Pantau progress target harian & periodenya
              </p>
            </div>

            {/* Wave SVG */}
            <div className="absolute bottom-0 left-0 right-0 pointer-events-none">
              <svg viewBox="0 0 390 40" preserveAspectRatio="none" className="w-full h-10" fill="white">
                <path d="M0 40V20C65 0 130 40 195 20C260 0 325 40 390 20V40H0Z"/>
              </svg>
            </div>
          </div>

          {/* ── Login form ── */}
          <div className="flex-1 px-5 pt-8 pb-8 flex flex-col justify-between">
            <div>
              <h2 className="text-[17px] font-extrabold text-slate-900 mb-0.5">Masuk ke akun</h2>
              <p className="text-[13px] text-slate-400 mb-6">Gunakan email dan password Anda</p>

              <form onSubmit={handleSubmit} className="space-y-4">

                {/* Email */}
                <div>
                  <label htmlFor="email" className="block text-[10px] font-bold text-slate-400 uppercase tracking-[0.12em] mb-1.5">
                    Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={loading}
                    autoComplete="email"
                    placeholder="nama@email.com"
                    className="w-full h-12 px-4 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 text-[14px] placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white focus:border-transparent transition disabled:opacity-50"
                  />
                </div>

                {/* Password */}
                <div>
                  <label htmlFor="password" className="block text-[10px] font-bold text-slate-400 uppercase tracking-[0.12em] mb-1.5">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      id="password"
                      type={showPass ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      disabled={loading}
                      autoComplete="current-password"
                      placeholder="••••••••"
                      className="w-full h-12 pl-4 pr-11 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 text-[14px] placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white focus:border-transparent transition disabled:opacity-50"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPass(v => !v)}
                      tabIndex={-1}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition p-0.5"
                    >
                      {showPass ? (
                        <svg width="17" height="17" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                        </svg>
                      ) : (
                        <svg width="17" height="17" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>

                {/* Error */}
                {error && (
                  <div className="flex items-center gap-2 bg-red-50 border border-red-100 text-red-600 px-3.5 py-2.5 rounded-xl text-[13px]">
                    <svg className="w-3.5 h-3.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {error}
                  </div>
                )}

                {/* CTA */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full h-13 bg-blue-600 hover:bg-blue-700 active:scale-[0.985] text-white font-bold text-[15px] rounded-2xl transition-all shadow-lg shadow-blue-200/70 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-1"
                >
                  {loading ? (
                    <>
                      <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"/>
                      </svg>
                      Memproses...
                    </>
                  ) : 'Masuk'}
                </button>

              </form>
            </div>

            {/* Register */}
            <p className="text-center text-[13px] text-slate-500 mt-8">
              Belum punya akun?{' '}
              <a href="/register" className="text-blue-600 font-bold hover:text-blue-700 transition">
                Daftar sekarang
              </a>
            </p>
          </div>

        </div>
      </div>
    </>
  );
}