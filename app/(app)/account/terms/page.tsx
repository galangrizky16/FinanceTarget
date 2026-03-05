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

// ─── Article Item ─────────────────────────────────────────────────────────────

function Article({ 
  number, 
  title, 
  content 
}: { 
  number: string; 
  title: string; 
  content: string | string[] 
}) {
  const contentArray = Array.isArray(content) ? content : [content];
  
  return (
    <div className="pb-5 mb-5 border-b border-slate-100 last:border-0 last:pb-0 last:mb-0">
      <div className="flex gap-3 mb-2">
        <div className="w-7 h-7 rounded-lg bg-blue-500 flex items-center justify-center shrink-0">
          <span className="text-xs font-bold text-white">{number}</span>
        </div>
        <h3 className="text-base font-bold text-slate-900 pt-0.5">{title}</h3>
      </div>
      <div className="pl-10 space-y-2">
        {contentArray.map((paragraph, idx) => (
          <p key={idx} className="text-sm text-slate-700 leading-relaxed">
            {paragraph}
          </p>
        ))}
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function TermsPage() {
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
            Syarat & Ketentuan
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
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
              </svg>
            </div>
          </div>

          {/* Introduction */}
          <Section className="fade-up fade-up-2">
            <p className="text-sm text-slate-700 leading-relaxed">
              Dengan menggunakan <span className="font-bold text-slate-900">Finance Target</span>, Anda menyetujui syarat dan ketentuan berikut. Harap baca dengan seksama sebelum menggunakan layanan kami.
            </p>
            <p className="text-sm text-slate-700 leading-relaxed mt-3">
              Syarat dan ketentuan ini mengatur penggunaan aplikasi Finance Target dan semua fitur yang tersedia di dalamnya.
            </p>
          </Section>

          {/* Terms Content */}
          <Section className="fade-up fade-up-3">
            <Article
              number="1"
              title="Definisi Layanan"
              content={[
                "Finance Target adalah alat bantu pencatatan keuangan pribadi yang dirancang untuk membantu pengguna mengelola pemasukan, pengeluaran, dan target finansial mereka.",
                "Layanan ini bersifat self-service dimana pengguna bertanggung jawab penuh atas data yang dimasukkan ke dalam sistem."
              ]}
            />

            <Article
              number="2"
              title="Akun Pengguna"
              content={[
                "Anda bertanggung jawab untuk menjaga kerahasiaan akun dan kata sandi Anda. Segala aktivitas yang terjadi di bawah akun Anda adalah tanggung jawab Anda sepenuhnya.",
                "Anda harus segera memberi tahu kami jika ada penggunaan tidak sah atas akun Anda atau pelanggaran keamanan lainnya."
              ]}
            />

            <Article
              number="3"
              title="Tanggung Jawab Pengguna"
              content={[
                "Pengguna bertanggung jawab atas keakuratan dan kelengkapan data yang dimasukkan ke dalam aplikasi Finance Target.",
                "Finance Target tidak bertanggung jawab atas kesalahan atau ketidakakuratan data yang dimasukkan oleh pengguna.",
                "Pengguna setuju untuk tidak menggunakan layanan untuk tujuan ilegal atau melanggar hukum yang berlaku."
              ]}
            />

            <Article
              number="4"
              title="Ketersediaan Layanan"
              content={[
                "Kami berusaha untuk menjaga layanan tetap tersedia 24/7, namun tidak menjamin layanan akan selalu tersedia tanpa gangguan.",
                "Finance Target berhak untuk melakukan pemeliharaan, upgrade, atau perbaikan sistem yang mungkin menyebabkan gangguan sementara pada layanan."
              ]}
            />

            <Article
              number="5"
              title="Perubahan Layanan"
              content={[
                "Finance Target berhak untuk memperbarui, mengubah, atau menghentikan fitur atau layanan sewaktu-waktu tanpa pemberitahuan sebelumnya.",
                "Kami akan berusaha memberikan informasi mengenai perubahan signifikan melalui notifikasi dalam aplikasi atau email."
              ]}
            />

            <Article
              number="6"
              title="Batasan Tanggung Jawab"
              content={[
                "Finance Target adalah alat bantu pencatatan dan bukan merupakan layanan konsultasi keuangan profesional.",
                "Keputusan finansial yang Anda ambil berdasarkan data dalam aplikasi sepenuhnya menjadi tanggung jawab Anda.",
                "Kami tidak bertanggung jawab atas kerugian finansial yang mungkin timbul dari penggunaan aplikasi ini."
              ]}
            />

            <Article
              number="7"
              title="Hak Kekayaan Intelektual"
              content={[
                "Semua konten, fitur, dan fungsionalitas aplikasi Finance Target adalah milik eksklusif kami dan dilindungi oleh hak cipta dan hak kekayaan intelektual lainnya.",
                "Anda tidak diperkenankan untuk menyalin, memodifikasi, atau mendistribusikan bagian mana pun dari aplikasi tanpa izin tertulis dari kami."
              ]}
            />

            <Article
              number="8"
              title="Penghentian Akun"
              content={[
                "Kami berhak untuk menangguhkan atau menghentikan akses Anda ke layanan jika Anda melanggar syarat dan ketentuan ini.",
                "Anda dapat menghapus akun Anda kapan saja melalui pengaturan aplikasi. Data Anda akan dihapus sesuai dengan kebijakan privasi kami."
              ]}
            />

            <Article
              number="9"
              title="Perubahan Syarat & Ketentuan"
              content={[
                "Kami dapat mengubah syarat dan ketentuan ini dari waktu ke waktu. Perubahan akan efektif setelah dipublikasikan dalam aplikasi.",
                "Penggunaan berkelanjutan atas layanan setelah perubahan dianggap sebagai penerimaan terhadap syarat dan ketentuan yang diperbarui."
              ]}
            />

            <Article
              number="10"
              title="Hukum yang Berlaku"
              content={[
                "Syarat dan ketentuan ini diatur oleh dan ditafsirkan sesuai dengan hukum yang berlaku di Republik Indonesia.",
                "Setiap perselisihan yang timbul akan diselesaikan melalui jalur musyawarah atau melalui pengadilan yang berwenang."
              ]}
            />
          </Section>

          {/* Contact Notice */}
          <div className="bg-blue-50 rounded-2xl p-5 border border-blue-100 fade-up fade-up-3">
            <div className="flex gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500 flex items-center justify-center shrink-0">
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-bold text-blue-900 mb-1">Pertanyaan?</h3>
                <p className="text-xs text-blue-700 leading-relaxed mb-3">
                  Jika Anda memiliki pertanyaan tentang syarat dan ketentuan ini, silakan hubungi kami melalui:
                </p>
                <div className="space-y-2">
                  <a 
                    href="mailto:rizkygalang729@gmail.com"
                    className="flex items-center gap-2 text-xs text-blue-600 hover:text-blue-700 font-medium"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                    </svg>
                    rizkygalang729@gmail.com
                  </a>
                  <a 
                    href="https://wa.me/6285714608649"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-xs text-blue-600 hover:text-blue-700 font-medium"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 9.75a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375m-13.5 3.01c0 1.6 1.123 2.994 2.707 3.227 1.087.16 2.185.283 3.293.369V21l4.184-4.183a1.14 1.14 0 01.778-.332 48.294 48.294 0 005.83-.498c1.585-.233 2.708-1.626 2.708-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
                    </svg>
                    WhatsApp Support
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Last Updated */}
          <div className="text-center pt-2 pb-4 fade-up fade-up-3">
            <p className="text-xs text-slate-400">
              Terakhir diperbarui: Maret 2024
            </p>
            <p className="text-xs text-slate-400 mt-1">
              Berlaku sejak: 1 Maret 2024
            </p>
          </div>
        </div>
      </div>
    </>
  );
}