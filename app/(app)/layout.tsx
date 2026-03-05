'use client';

// app/(app)/layout.tsx

import { usePathname } from 'next/navigation';
import Link from 'next/link';

// ─── Types ────────────────────────────────────────────────────────────────────

interface NavItem {
  label: string;
  href: string;
  icon: (active: boolean) => React.ReactNode;
}

// ─── Navigation config ────────────────────────────────────────────────────────

const NAV_ITEMS: NavItem[] = [
  {
    label: 'Beranda',
    href: '/dashboard',
    icon: (active) => (
      <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke={active ? '#2563eb' : '#94a3b8'} strokeWidth={active ? 2.2 : 1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
      </svg>
    ),
  },
  {
    label: 'Catatan',
    href: '/records',
    icon: (active) => (
      <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke={active ? '#2563eb' : '#94a3b8'} strokeWidth={active ? 2.2 : 1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
      </svg>
    ),
  },
  {
    label: 'Target',
    href: '/target',
    icon: (active) => (
      <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke={active ? '#2563eb' : '#94a3b8'} strokeWidth={active ? 2.2 : 1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
      </svg>
    ),
  },
  {
    label: 'Harian',
    href: '/daily-target',
    icon: (active) => (
      <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke={active ? '#2563eb' : '#94a3b8'} strokeWidth={active ? 2.2 : 1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
      </svg>
    ),
  },
  {
    label: 'Akun',
    href: '/account',
    icon: (active) => (
      <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke={active ? '#2563eb' : '#94a3b8'} strokeWidth={active ? 2.2 : 1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
      </svg>
    ),
  },
];

// ─── Sub-components ───────────────────────────────────────────────────────────

function AppHeader() {
  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 40,
        background: 'rgba(255,255,255,0.92)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        borderBottom: '1px solid #f1f5f9',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 20px',
          height: '56px',
        }}
      >
        {/* Logo + Brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div
            style={{
              width: '34px',
              height: '34px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 2px 8px rgba(37,99,235,0.30)',
              flexShrink: 0,
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M3 17L9 11L13 15L21 7" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              <circle cx="21" cy="7" r="2" fill="white" />
            </svg>
          </div>
          <div style={{ lineHeight: 1 }}>
            <div style={{ fontSize: '14px', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.3px' }}>
              Finance
            </div>
            <div style={{ fontSize: '9px', fontWeight: 700, color: '#94a3b8', letterSpacing: '0.15em', textTransform: 'uppercase', marginTop: '1px' }}>
              Target
            </div>
          </div>
        </div>

        {/* Profile icon */}
        <Link
          href="/account"
          style={{
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            background: '#f1f5f9',
            border: '1.5px solid #e2e8f0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            textDecoration: 'none',
          }}
        >
          <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="#64748b" strokeWidth={1.8}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
          </svg>
        </Link>
      </div>
    </header>
  );
}

function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      style={{
        position: 'fixed',
        bottom: 0,
        left: '50%',
        transform: 'translateX(-50%)',
        width: '100%',
        maxWidth: '420px',
        zIndex: 50,
        background: 'rgba(255,255,255,0.97)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderTop: '1px solid #f1f5f9',
        borderRadius: '20px 20px 0 0',
        boxShadow: '0 -4px 24px rgba(15,23,42,0.07)',
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'stretch',
          height: '64px',
          padding: '0 4px',
        }}
      >
        {NAV_ITEMS.map(({ label, href, icon }) => {
          const active = pathname === href || pathname.startsWith(href + '/');

          return (
            <Link
              key={href}
              href={href}
              style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '3px',
                textDecoration: 'none',
                position: 'relative',
                borderRadius: '12px',
                transition: 'background 0.15s',
                WebkitTapHighlightColor: 'transparent',
              }}
            >
              {/* Icon */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {icon(active)}
              </div>

              {/* Label */}
              <span
                style={{
                  fontSize: '10px',
                  fontWeight: active ? 700 : 500,
                  color: active ? '#2563eb' : '#94a3b8',
                  letterSpacing: active ? '-0.1px' : '0',
                  lineHeight: 1,
                  transition: 'color 0.15s, font-weight 0.15s',
                }}
              >
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

// ─── Layout ───────────────────────────────────────────────────────────────────

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        html, body {
          font-family: 'Plus Jakarta Sans', sans-serif;
          background: #e8edf5;
          margin: 0;
          padding: 0;
        }
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { display: none; }
      `}</style>

      {/* Outer centering wrapper */}
      <div
        style={{
          minHeight: '100dvh',
          display: 'flex',
          justifyContent: 'center',
          background: '#dde3ed',
        }}
      >
        {/* Phone shell */}
        <div
          style={{
            width: '100%',
            maxWidth: '420px',
            minHeight: '100dvh',
            display: 'flex',
            flexDirection: 'column',
            background: '#f8fafc',
            position: 'relative',
            overflowX: 'hidden',
          }}
        >
          {/* Sticky top header */}
          <AppHeader />

          {/* Page content */}
          <main
            style={{
              flex: 1,
              overflowY: 'auto',
              /* Padding bottom = tab bar height (64px) + safe area */
              paddingBottom: 'calc(64px + env(safe-area-inset-bottom, 12px))',
            }}
          >
            {children}
          </main>

          {/* Sticky bottom nav */}
          <BottomNav />
        </div>
      </div>
    </>
  );
}