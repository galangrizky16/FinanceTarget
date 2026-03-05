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

// ─── List Item ────────────────────────────────────────────────────────────────

function ListItem({ 
  icon, 
  title, 
  description 
}: { 
  icon: React.ReactNode; 
  title: string; 
  description: string 
}) {
  return (
    <div className="flex gap-3 py-3 border-b border-slate-50 last:border-0">
      <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center shrink-0 mt-0.5">
        {icon}
      </div>
      <div className="flex-1">
        <h3 className="text-sm font-bold text-slate-900 mb-1">{title}</h3>
        <p className="text-xs text-slate-600 leading-relaxed">{description}</p>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function PrivacyPage() {
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
        .fade-up-5 { animation-delay: 0.25s; }
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
            Kebijakan Privasi
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
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
              </svg>
            </div>
          </div>

          {/* Introduction */}
          <Section className="fade-up fade-up-2">
            <p className="text-sm text-slate-700 leading-relaxed">
              <span className="font-bold text-slate-900">Finance Target</span> berkomitmen untuk melindungi privasi dan keamanan data Anda. Kebijakan privasi ini menjelaskan bagaimana kami mengumpulkan, menggunakan, dan melindungi informasi pribadi Anda.
            </p>
            <p className="text-sm text-slate-700 leading-relaxed mt-3">
              Finance Target menyimpan data transaksi keuangan pengguna seperti pemasukan, pengeluaran, dan target finansial untuk membantu manajemen keuangan Anda. Data disimpan secara aman dan <span className="font-semibold text-slate-900">tidak dibagikan ke pihak ketiga tanpa izin</span> Anda.
            </p>
          </Section>

          {/* Data yang Dikumpulkan */}
          <Section title="Data yang Dikumpulkan" className="fade-up fade-up-3">
            <ListItem
              icon={
                <svg className="w-4 h-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                </svg>
              }
              title="Informasi Akun"
              description="Nama, email, dan kata sandi yang Anda daftarkan untuk membuat dan mengakses akun Finance Target."
            />
            <ListItem
              icon={
                <svg className="w-4 h-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" />
                </svg>
              }
              title="Data Transaksi"
              description="Catatan pemasukan, pengeluaran, kategori transaksi, tanggal, dan jumlah yang Anda input ke dalam aplikasi."
            />
            <ListItem
              icon={
                <svg className="w-4 h-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
                </svg>
              }
              title="Target Finansial"
              description="Informasi target harian dan periode yang Anda tetapkan, termasuk nominal target dan progres pencapaian."
            />
            <ListItem
              icon={
                <svg className="w-4 h-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5a2.25 2.25 0 002.25 2.25h7.5A2.25 2.25 0 0018 20.25V3.75a2.25 2.25 0 00-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3" />
                </svg>
              }
              title="Data Perangkat"
              description="Informasi perangkat seperti tipe perangkat, sistem operasi, dan alamat IP untuk keamanan dan peningkatan layanan."
            />
          </Section>

          {/* Penggunaan Data */}
          <Section title="Penggunaan Data" className="fade-up fade-up-4">
            <div className="space-y-3">
              <div className="flex gap-2">
                <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center shrink-0 mt-0.5">
                  <div className="w-2 h-2 rounded-full bg-blue-600" />
                </div>
                <p className="text-sm text-slate-700 leading-relaxed">
                  <span className="font-semibold text-slate-900">Manajemen Keuangan:</span> Data transaksi digunakan untuk menampilkan ringkasan keuangan, statistik, dan laporan yang membantu Anda mengelola keuangan.
                </p>
              </div>

              <div className="flex gap-2">
                <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center shrink-0 mt-0.5">
                  <div className="w-2 h-2 rounded-full bg-blue-600" />
                </div>
                <p className="text-sm text-slate-700 leading-relaxed">
                  <span className="font-semibold text-slate-900">Tracking Target:</span> Data target finansial digunakan untuk memantau progres dan memberikan notifikasi pencapaian.
                </p>
              </div>

              <div className="flex gap-2">
                <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center shrink-0 mt-0.5">
                  <div className="w-2 h-2 rounded-full bg-blue-600" />
                </div>
                <p className="text-sm text-slate-700 leading-relaxed">
                  <span className="font-semibold text-slate-900">Peningkatan Layanan:</span> Kami menganalisis pola penggunaan untuk meningkatkan fitur dan pengalaman pengguna.
                </p>
              </div>

              <div className="flex gap-2">
                <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center shrink-0 mt-0.5">
                  <div className="w-2 h-2 rounded-full bg-blue-600" />
                </div>
                <p className="text-sm text-slate-700 leading-relaxed">
                  <span className="font-semibold text-slate-900">Keamanan:</span> Data perangkat membantu kami mendeteksi aktivitas mencurigakan dan melindungi akun Anda.
                </p>
              </div>
            </div>
          </Section>

          {/* Keamanan Data */}
          <Section title="Keamanan Data" className="fade-up fade-up-5">
            <div className="space-y-4">
              <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
                <div className="flex gap-3 items-start">
                  <div className="w-8 h-8 rounded-lg bg-blue-500 flex items-center justify-center shrink-0">
                    <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-sm font-bold text-blue-900 mb-1">Enkripsi End-to-End</h3>
                    <p className="text-xs text-blue-700 leading-relaxed">
                      Semua data Anda dienkripsi saat dikirim dan disimpan di server kami menggunakan standar keamanan industri.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-green-600 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
                  </svg>
                  <p className="text-sm text-slate-700">Data disimpan di server yang aman dan terlindungi</p>
                </div>

                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-green-600 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
                  </svg>
                  <p className="text-sm text-slate-700">Tidak ada pihak ketiga yang dapat mengakses data Anda</p>
                </div>

                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-green-600 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
                  </svg>
                  <p className="text-sm text-slate-700">Backup rutin untuk mencegah kehilangan data</p>
                </div>

                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-green-600 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
                  </svg>
                  <p className="text-sm text-slate-700">Pemantauan keamanan 24/7 terhadap ancaman</p>
                </div>
              </div>
            </div>
          </Section>

          {/* Kontak */}
          <Section title="Kontak" className="fade-up fade-up-5">
            <p className="text-sm text-slate-700 leading-relaxed mb-4">
              Jika Anda memiliki pertanyaan atau kekhawatiran tentang kebijakan privasi kami, silakan hubungi kami melalui:
            </p>
            
            <div className="space-y-3">
              <a 
                href="mailto:rizkygalang729@gmail.com"
                className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 hover:bg-slate-100 active:bg-slate-200 transition-colors"
              >
                <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center shrink-0">
                  <svg className="w-5 h-5 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-900">Email</p>
                  <p className="text-xs text-slate-500 truncate">rizkygalang729@gmail.com</p>
                </div>
                <svg className="w-5 h-5 text-slate-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                </svg>
              </a>

              <a 
                href="https://wa.me/6285714608649"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 hover:bg-slate-100 active:bg-slate-200 transition-colors"
              >
                <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center shrink-0">
                  <svg className="w-5 h-5 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 9.75a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375m-13.5 3.01c0 1.6 1.123 2.994 2.707 3.227 1.087.16 2.185.283 3.293.369V21l4.184-4.183a1.14 1.14 0 01.778-.332 48.294 48.294 0 005.83-.498c1.585-.233 2.708-1.626 2.708-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-900">WhatsApp</p>
                  <p className="text-xs text-slate-500 truncate">Hubungi kami via WhatsApp</p>
                </div>
                <svg className="w-5 h-5 text-slate-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                </svg>
              </a>
            </div>
          </Section>

          {/* Last Updated */}
          <div className="text-center pt-2 pb-4 fade-up fade-up-5">
            <p className="text-xs text-slate-400">
              Terakhir diperbarui: Maret 2024
            </p>
          </div>
        </div>
      </div>
    </>
  );
}