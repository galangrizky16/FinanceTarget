'use client';

import { useRouter } from 'next/navigation';

// ─── Section Container ────────────────────────────────────────────────────────

function Section({ 
  title, 
  children, 
  className = '' 
}: { 
  title?: string; 
  children: React.ReactNode; 
  className?: string 
}) {
  return (
    <div className={className}>
      {title && (
        <h2 className="text-lg font-bold text-slate-900 mb-3">
          {title}
        </h2>
      )}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
        {children}
      </div>
    </div>
  );
}

// ─── Info Item ────────────────────────────────────────────────────────────────

function InfoItem({ 
  label, 
  value 
}: { 
  label: string; 
  value: string 
}) {
  return (
    <div className="flex justify-between items-start py-3 border-b border-slate-50 last:border-0">
      <span className="text-sm text-slate-500 font-medium">{label}</span>
      <span className="text-sm text-slate-900 font-semibold text-right">{value}</span>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function AboutPage() {
  const router = useRouter();

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
      `}</style>

      <div className="max-w-105 mx-auto p-5 pb-8 min-h-screen bg-slate-50">
        {/* Header with Back Button */}
        <div className="mb-6 flex items-center gap-3 fade-up">
          <button
            onClick={() => router.back()}
            className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center hover:bg-slate-50 active:bg-slate-100 transition-colors shrink-0"
          >
            <svg 
              className="w-5 h-5 text-slate-700" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor" 
              strokeWidth={2.5}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
          </button>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Tentang Finance Target
          </h1>
        </div>

        <div className="space-y-6">
          {/* Hero Icon */}
          <div className="flex justify-center fade-up fade-up-1">
            <div className="w-20 h-20 rounded-3xl bg-linear-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-xl shadow-blue-500/30">
              <svg 
                className="w-10 h-10 text-white" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor" 
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" />
              </svg>
            </div>
          </div>

          {/* Main Description */}
          <Section className="fade-up fade-up-2">
            <p className="text-sm text-slate-700 leading-relaxed">
              <span className="font-bold text-slate-900">Finance Target</span> adalah aplikasi pencatatan keuangan dan pengelolaan target finansial yang membantu pengguna mencatat pemasukan, pengeluaran, serta memantau progres target harian dan periode.
            </p>
            <p className="text-sm text-slate-700 leading-relaxed mt-3">
              Dengan antarmuka yang intuitif dan fitur yang lengkap, Finance Target memudahkan Anda untuk mengelola keuangan pribadi dengan lebih efektif dan mencapai tujuan finansial yang telah ditetapkan.
            </p>
          </Section>

          {/* Our Mission */}
          <Section title="Misi Kami" className="fade-up fade-up-3">
            <div className="space-y-4">
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center shrink-0 mt-0.5">
                  <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-bold text-slate-900 mb-1">Literasi Keuangan</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Meningkatkan kesadaran dan pemahaman masyarakat tentang pentingnya pengelolaan keuangan pribadi yang baik.
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center shrink-0 mt-0.5">
                  <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-bold text-slate-900 mb-1">Akses Mudah</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Menyediakan tools yang mudah digunakan untuk semua kalangan dalam mencatat dan melacak keuangan mereka.
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center shrink-0 mt-0.5">
                  <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-bold text-slate-900 mb-1">Target Tercapai</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Membantu pengguna menetapkan dan mencapai target finansial mereka dengan sistem tracking yang jelas dan terukur.
                  </p>
                </div>
              </div>
            </div>
          </Section>

          {/* App Version */}
          <Section title="Versi Aplikasi" className="fade-up fade-up-4">
            <InfoItem label="Versi" value="1.0.0" />
            <InfoItem label="Build" value="2026.03.005" />
            <InfoItem label="Terakhir Diperbarui" value="Maret 2026" />
          </Section>

          {/* Footer Info */}
          <div className="text-center pt-2 pb-4 fade-up fade-up-4">
            <p className="text-xs text-slate-400">
              © 2026 Finance Target. All rights reserved.
            </p>
            <p className="text-xs text-slate-400 mt-1">
              Dibuat dengan ❤️ untuk Indonesia
            </p>
          </div>
        </div>
      </div>
    </>
  );
}