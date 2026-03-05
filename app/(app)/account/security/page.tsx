'use client';

import { useRouter } from 'next/navigation';

// ─── Types ────────────────────────────────────────────────────────────────────

interface SecurityMenuItem {
  id: string;
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  href: string;
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function SecurityPage() {
  const router = useRouter();

  const menuItems: SecurityMenuItem[] = [
    {
      id: 'password',
      title: 'Ubah Password',
      subtitle: 'Kirim link reset ke email',
      icon: (
        <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z" />
        </svg>
      ),
      href: '/account/security/password',
    },
    {
      id: 'passkey',
      title: 'Login Face ID / Fingerprint',
      subtitle: 'Gunakan Passkey untuk login cepat',
      icon: (
        <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M7.864 4.243A7.5 7.5 0 0119.5 10.5c0 2.92-.556 5.709-1.568 8.268M5.742 6.364A7.465 7.465 0 004.5 10.5a7.464 7.464 0 01-1.15 3.993m1.989 3.559A11.209 11.209 0 008.25 10.5a3.75 3.75 0 117.5 0c0 .527-.021 1.049-.064 1.565M12 10.5a14.94 14.94 0 01-3.6 9.75m6.633-4.596a18.666 18.666 0 01-2.485 5.33" />
        </svg>
      ),
      href: '/account/security/passkey',
    },
  ];

  const handleItemClick = (href: string) => {
    router.push(href);
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        
        * {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
        }
        
        @keyframes fadeUp {
          from {
            opacity: 0;
            transform: translateY(12px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .fade-up {
          animation: fadeUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) both;
        }
        
        .fade-up-1 { animation-delay: 0.05s; }
        .fade-up-2 { animation-delay: 0.10s; }
        
        .menu-item {
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .menu-item:active {
          transform: scale(0.98);
          background-color: #f8fafc;
        }
      `}</style>

      <div className="max-w-105 mx-auto min-h-screen bg-slate-50">
        {/* Header */}
        <div className="bg-white border-b border-slate-200 px-5 pt-4 pb-4 fade-up sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.back()}
              className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center hover:bg-slate-200 active:bg-slate-300 transition-colors"
            >
              <svg className="w-5 h-5 text-slate-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
              </svg>
            </button>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              Keamanan
            </h1>
          </div>
        </div>

        {/* Content */}
        <div className="p-5">
          {/* Menu Card */}
          <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-200 fade-up fade-up-1">
            {menuItems.map((item, index) => (
              <button
                key={item.id}
                onClick={() => handleItemClick(item.href)}
                className={`menu-item w-full flex items-center gap-4 p-4 text-left ${
                  index !== menuItems.length - 1 ? 'border-b border-slate-100' : ''
                }`}
              >
                {/* Icon Container */}
                <div className="shrink-0 w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
                  {item.icon}
                </div>

                {/* Text Content */}
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-slate-900 mb-0.5">
                    {item.title}
                  </div>
                  <div className="text-xs text-slate-500 leading-relaxed">
                    {item.subtitle}
                  </div>
                </div>

                {/* Chevron */}
                <div className="shrink-0">
                  <svg 
                    className="w-5 h-5 text-slate-400" 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor" 
                    strokeWidth={2.5}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                  </svg>
                </div>
              </button>
            ))}
          </div>

          {/* Info Card */}
          <div className="mt-4 bg-blue-50 border border-blue-100 rounded-2xl p-4 fade-up fade-up-2">
            <div className="flex gap-3">
              <div className="shrink-0 mt-0.5">
                <svg className="w-4 h-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                </svg>
              </div>
              <div className="flex-1">
                <p className="text-xs font-semibold text-blue-900 mb-1">
                  Keamanan Akun
                </p>
                <p className="text-xs text-blue-700 leading-relaxed">
                  Pastikan akun Anda selalu aman dengan menggunakan password yang kuat dan aktifkan login biometrik.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}