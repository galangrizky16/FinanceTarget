'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';

// ─── Types ────────────────────────────────────────────────────────────────────

interface AccountData {
  name: string;
  email: string;
  initials: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getInitials(name: string): string {
  if (!name) return 'U';
  
  // Coba split by space dulu
  const words = name.trim().split(/\s+/);
  
  if (words.length > 1) {
    // Jika ada spasi, ambil huruf pertama dari setiap kata
    // Contoh: "Rizky Galang" → "RG"
    return words
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }
  
  // Jika hanya satu kata, cek camelCase
  // Contoh: "RizkyGalang" → "RG", "rizkygalang" → "RG"
  const singleWord = words[0];
  const uppercaseLetters = singleWord.match(/[A-Z]/g);
  
  if (uppercaseLetters && uppercaseLetters.length >= 2) {
    // Ada camelCase, ambil 2 huruf kapital pertama
    return uppercaseLetters.slice(0, 2).join('');
  }
  
  // Fallback: ambil 2 huruf pertama
  // Contoh: "rizkygalang" → "RI"
  return singleWord.slice(0, 2).toUpperCase();
}

// ─── Loading Skeleton ─────────────────────────────────────────────────────────

function Skeleton({ w = '100%', h = 16, r = 8 }: { w?: string | number; h?: number; r?: number }) {
  return (
    <div style={{
      width: w,
      height: h,
      borderRadius: r,
      background: 'linear-gradient(90deg,#e2e8f0 25%,#f1f5f9 50%,#e2e8f0 75%)',
      backgroundSize: '200% 100%',
      animation: 'shimmer 1.4s infinite',
      flexShrink: 0,
    }} />
  );
}

function LoadingState() {
  return (
    <>
      <style>{`@keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}`}</style>
      <div className="max-w-105 mx-auto p-5 pb-8">
        <div className="mb-6">
          <Skeleton w={120} h={24} r={8} />
        </div>
        
        {/* Profile header */}
        <div className="flex items-center gap-4 mb-6">
          <Skeleton w={64} h={64} r={32} />
          <div className="flex-1">
            <Skeleton w={140} h={18} r={6} />
            <div className="mt-2"><Skeleton w={180} h={14} r={6} /></div>
          </div>
        </div>

        {/* Sections */}
        <div className="space-y-4">
          <Skeleton h={60} r={16} />
          <Skeleton h={120} r={16} />
          <Skeleton h={180} r={16} />
          <Skeleton h={60} r={16} />
        </div>
      </div>
    </>
  );
}

// ─── Section Container ────────────────────────────────────────────────────────

function Section({ title, children, className = '' }: { title?: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={className}>
      {title && (
        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 px-1">
          {title}
        </h3>
      )}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        {children}
      </div>
    </div>
  );
}

// ─── List Item ────────────────────────────────────────────────────────────────

interface ListItemProps {
  icon: React.ReactNode;
  label: string;
  value?: string;
  href?: string;
  external?: boolean;
  onClick?: () => void;
  chevron?: boolean;
  showBorder?: boolean;
}

function ListItem({ icon, label, value, href, external, onClick, chevron = true, showBorder = true }: ListItemProps) {
  const content = (
    <>
      <div className="flex items-center gap-3 flex-1">
        <div className="w-9 h-9 rounded-xl bg-slate-50 flex items-center justify-center text-slate-600 shrink-0">
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-slate-900">{label}</p>
          {value && (
            <p className="text-xs text-slate-500 mt-0.5 truncate">{value}</p>
          )}
        </div>
      </div>
      {chevron && (
        <svg
          className="w-5 h-5 text-slate-400 shrink-0"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          {external ? (
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
          ) : (
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
          )}
        </svg>
      )}
    </>
  );

  const baseClasses = `flex items-center gap-3 p-4 transition-colors ${showBorder ? 'border-b border-slate-50 last:border-0' : ''}`;

  if (href) {
    return (
      <a
        href={href}
        target={external ? '_blank' : undefined}
        rel={external ? 'noopener noreferrer' : undefined}
        className={`${baseClasses} hover:bg-slate-50 active:bg-slate-100`}
      >
        {content}
      </a>
    );
  }

  if (onClick) {
    return (
      <button
        onClick={onClick}
        className={`${baseClasses} hover:bg-slate-50 active:bg-slate-100 w-full text-left`}
      >
        {content}
      </button>
    );
  }

  return (
    <div className={baseClasses}>
      {content}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function AccountPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<AccountData | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchData() {
      try {
        // Get authenticated user
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError || !user) {
          router.replace('/login?redirectTo=/account');
          return;
        }

        // Fetch profile name
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('name')
          .eq('id', user.id)
          .single();

        if (profileError) {
          console.error('Profile fetch error:', profileError);
        }

        const name = profile?.name || user.email?.split('@')[0] || 'User';
        const email = user.email || '';

        if (!cancelled) {
          setData({
            name,
            email,
            initials: getInitials(name),
          });
        }
      } catch (err) {
        console.error('[Account]', err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchData();
    return () => { cancelled = true; };
  }, [router]);

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      router.replace('/login');
    } catch (err) {
      console.error('Logout error:', err);
      alert('Gagal logout. Silakan coba lagi.');
    }
  };

  if (loading) return <LoadingState />;
  if (!data) return null;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700;9..40,800&display=swap');
        
        * {
          font-family: 'DM Sans', sans-serif;
        }
        
        @keyframes fadeUp {
          from {
            opacity: 0;
            transform: translateY(16px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .fade-up {
          animation: fadeUp 0.4s ease both;
        }
        
        .fade-up-1 { animation-delay: 0.05s; }
        .fade-up-2 { animation-delay: 0.10s; }
        .fade-up-3 { animation-delay: 0.15s; }
        .fade-up-4 { animation-delay: 0.20s; }
        .fade-up-5 { animation-delay: 0.25s; }
      `}</style>

      <div className="max-w-105 mx-auto p-5 pb-8 min-h-screen bg-slate-50">
        {/* Header */}
        <div className="mb-6 fade-up">
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Akun
          </h1>
        </div>

        {/* Profile Header */}
        <div className="flex items-center gap-4 mb-6 fade-up fade-up-1">
          <div className="w-16 h-16 rounded-full bg-linear-to-br from-blue-500 to-blue-600 flex items-center justify-center shrink-0 shadow-lg shadow-blue-500/30">
            <span className="text-white text-xl font-bold">
              {data.initials}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-bold text-slate-900 truncate">
              {data.name}
            </h2>
            <p className="text-sm text-slate-500 truncate">
              {data.email}
            </p>
          </div>
        </div>

        <div className="space-y-4">
          {/* Pengaturan */}
          <Section title="Pengaturan" className="fade-up fade-up-2">
            <ListItem
              icon={
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                </svg>
              }
              label="Profil"
              value={`${data.name} • ${data.email}`}
              href="/account/profile"
              showBorder={false}
            />
          </Section>

          {/* Keamanan */}
          <Section title="Keamanan" className="fade-up fade-up-3">
            <ListItem
              icon={
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                </svg>
              }
              label="Ubah Password"
              href="/account/security/password"
            />
          </Section>

          {/* Kontak Finance Target */}
          <Section title="Kontak Finance Target" className="fade-up fade-up-4">
            <ListItem
              icon={
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 9.75a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375m-13.5 3.01c0 1.6 1.123 2.994 2.707 3.227 1.087.16 2.185.283 3.293.369V21l4.184-4.183a1.14 1.14 0 01.778-.332 48.294 48.294 0 005.83-.498c1.585-.233 2.708-1.626 2.708-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
                </svg>
              }
              label="WhatsApp"
              value="Hubungi kami via WhatsApp"
              href="https://wa.me/6285714608649"
              external
            />
            <ListItem
              icon={
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                </svg>
              }
              label="Email"
              value="support@financetarget.com"
              href="mailto:rizkygalang729@gmail.com"
              external
              showBorder={false}
            />
          </Section>

          {/* Informasi */}
          <Section title="Informasi" className="fade-up fade-up-5">
            <ListItem
              icon={
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
                </svg>
              }
              label="Tentang"
              href="/account/about"
            />
            <ListItem
              icon={
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                </svg>
              }
              label="Kebijakan Privasi"
              href="/account/privacy"
            />
            <ListItem
              icon={
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                </svg>
              }
              label="Syarat & Ketentuan"
              href="/account/terms"
              showBorder={false}
            />
          </Section>

          {/* Logout Button */}
          <div className="pt-2 fade-up fade-up-5">
            <button
              onClick={handleLogout}
              className="w-full bg-white border border-red-200 text-red-600 font-bold py-4 rounded-2xl shadow-sm hover:bg-red-50 active:bg-red-100 transition-colors flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
              </svg>
              Keluar
            </button>
          </div>
        </div>
      </div>
    </>
  );
}