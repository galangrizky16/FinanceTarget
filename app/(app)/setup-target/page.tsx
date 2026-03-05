'use client';

// app/(app)/setup-target/page.tsx
// Auth & target guard dihandle sepenuhnya oleh middleware — tidak perlu cek ulang di sini.

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';

// ─── Types ────────────────────────────────────────────────────────────────────

type PeriodType = 'daily' | 'weekly' | 'monthly' | 'yearly' | 'custom';

interface FormState {
  periodType: PeriodType;
  targetAmount: string;
  startDate: string;
  endDate: string; // Tambahan untuk custom range
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function toDateString(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function calcEndDate(startDate: string, periodType: PeriodType, customEndDate?: string): string {
  if (periodType === 'custom' && customEndDate) {
    return customEndDate;
  }
  
  const date = new Date(startDate);
  switch (periodType) {
    case 'daily':   return startDate;
    case 'weekly':  date.setDate(date.getDate() + 6); break;
    case 'monthly': date.setMonth(date.getMonth() + 1); date.setDate(date.getDate() - 1); break;
    case 'yearly':  date.setFullYear(date.getFullYear() + 1); date.setDate(date.getDate() - 1); break;
    default: return startDate;
  }
  return toDateString(date);
}

function formatIDRFull(num: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency', currency: 'IDR',
    minimumFractionDigits: 0, maximumFractionDigits: 0,
  }).format(num);
}

function formatDateID(dateStr: string): string {
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric', month: 'long', year: 'numeric',
  }).format(new Date(dateStr));
}

function countDays(start: string, end: string): number {
  return Math.round((new Date(end).getTime() - new Date(start).getTime()) / 86_400_000) + 1;
}

// ─── Period options ───────────────────────────────────────────────────────────

const PERIOD_OPTIONS: { value: PeriodType; label: string; sub: string; icon: React.ReactNode }[] = [
  {
    value: 'daily', label: 'Harian', sub: '1 hari',
    icon: <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" /></svg>,
  },
  {
    value: 'weekly', label: 'Mingguan', sub: '7 hari',
    icon: <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" /></svg>,
  },
  {
    value: 'monthly', label: 'Bulanan', sub: '~30 hari',
    icon: <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" /></svg>,
  },
  {
    value: 'yearly', label: 'Tahunan', sub: '365 hari',
    icon: <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9m9 0a3 3 0 013 3h-15a3 3 0 013-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 01-.982-3.172M9.497 14.25a7.454 7.454 0 00.981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 007.73 9.728M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228M5.25 4.236V2.721C7.456 2.41 9.71 2.25 12 2.25c2.291 0 4.545.16 6.75.47v1.516M7.73 9.728a6.726 6.726 0 002.748 1.35m8.272-6.842V4.5c0 2.108-.966 3.99-2.48 5.228m2.48-5.492a46.32 46.32 0 012.916.52 6.003 6.003 0 01-5.395 4.972m0 0a6.726 6.726 0 01-2.749 1.35m0 0a6.772 6.772 0 01-3.044 0" /></svg>,
  },
  {
    value: 'custom', label: 'Custom', sub: 'Pilih tanggal',
    icon: <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5m-9-6h.008v.008H12v-.008zM12 15h.008v.008H12V15zm0 2.25h.008v.008H12v-.008zM9.75 15h.008v.008H9.75V15zm0 2.25h.008v.008H9.75v-.008zM7.5 15h.008v.008H7.5V15zm0 2.25h.008v.008H7.5v-.008zm6.75-4.5h.008v.008h-.008v-.008zm0 2.25h.008v.008h-.008V15zm0 2.25h.008v.008h-.008v-.008zm2.25-4.5h.008v.008H16.5v-.008zm0 2.25h.008v.008H16.5V15z" /></svg>,
  },
];

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function SetupTargetPage() {
  const router = useRouter();

  const [form, setForm] = useState<FormState>({
    periodType: 'monthly',
    targetAmount: '',
    startDate: toDateString(new Date()),
    endDate: '', // Untuk custom range
  });
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');

  function setField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setError('');
  }

  // Hitung end date berdasarkan period type
  const endDate = form.periodType === 'custom' 
    ? form.endDate || form.startDate 
    : calcEndDate(form.startDate, form.periodType);
  
  const amount   = Number(form.targetAmount);
  const days     = countDays(form.startDate, endDate);
  const dailyEst = amount > 0 && days > 0 ? Math.round(amount / days) : 0;
  const hasAmount = amount > 0;
  
  // Validasi custom range
  const isValidCustomRange = form.periodType !== 'custom' || (form.endDate && form.endDate >= form.startDate);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!hasAmount) {
      setError('Masukkan nominal target yang valid');
      return;
    }

    if (!isValidCustomRange) {
      setError('Tanggal akhir harus lebih besar atau sama dengan tanggal mulai');
      return;
    }

    if (days < 1) {
      setError('Periode minimal 1 hari');
      return;
    }

    setLoading(true);
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        setError('Sesi tidak ditemukan, silakan login ulang');
        return;
      }

      const { error: insertError } = await supabase.from('targets').insert({
        user_id:       user.id,
        period_type:   form.periodType,
        target_amount: amount,
        start_date:    form.startDate,
        end_date:      endDate,
      });

      if (insertError) {
        setError('Gagal menyimpan target, silakan coba lagi');
        return;
      }

      router.refresh(); // flush middleware cache dulu
      router.push('/dashboard');
    } catch {
      setError('Terjadi kesalahan, silakan coba lagi');
    } finally {
      setLoading(false);
    }
  };

  // ─── Styles ─────────────────────────────────────────────────────────────────

  const inputBase: React.CSSProperties = {
    width:'100%', 
    border:'1.5px solid #e2e8f0', 
    borderRadius:14, 
    background:'#ffffff',
    color:'#0f172a', 
    outline:'none', 
    transition:'border 0.15s,box-shadow 0.15s',
  };

  const onFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    e.currentTarget.style.border = '1.5px solid #2563eb';
    e.currentTarget.style.boxShadow = '0 0 0 3px rgba(37,99,235,0.08)';
  };

  const onBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    e.currentTarget.style.border = '1.5px solid #e2e8f0';
    e.currentTarget.style.boxShadow = 'none';
  };

  // ─── Render ─────────────────────────────────────────────────────────────────

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@300;400;500&family=Inter:wght@400;500;600;700;800;900&display=swap');
        html, body { margin:0; padding:0; font-family:'Inter',system-ui,sans-serif; }
        * { box-sizing:border-box; }

        .st-mono { font-family:'DM Mono',monospace; }
        
        @keyframes spin { to { transform:rotate(360deg); } }
        @keyframes fadeUp {
          from { opacity:0; transform:translateY(12px); }
          to   { opacity:1; transform:translateY(0); }
        }
        .fu { animation:fadeUp 0.4s ease both; }
        .fu1 { animation-delay:0.05s; }
        .fu2 { animation-delay:0.1s; }
        .fu3 { animation-delay:0.15s; }
        .fu4 { animation-delay:0.2s; }
        .fu5 { animation-delay:0.25s; }

        .period-btn:hover {
          transform:translateY(-2px);
          transition:transform 0.2s,box-shadow 0.2s;
          box-shadow:0 4px 14px rgba(15,23,42,0.1);
        }
        .cta-btn:hover:not(:disabled) {
          transform:translateY(-2px);
          transition:transform 0.2s,box-shadow 0.2s;
          box-shadow:0 8px 24px rgba(37,99,235,0.35)!important;
        }
      `}</style>

      <div style={{ minHeight:'100vh', background:'linear-gradient(135deg,#f0f4ff,#f8fafc)', padding:'24px 16px' }}>
        <form onSubmit={handleSubmit} style={{ maxWidth:460,margin:'0 auto' }}>

          {/* ── Header ────────────────────────────────────────────────────────── */}
          <div className="fu fu1" style={{ textAlign:'center',marginBottom:24 }}>
            <div style={{ display:'inline-flex',alignItems:'center',justifyContent:'center',width:58,height:58,borderRadius:18,background:'linear-gradient(135deg,#1e40af,#2563eb)',marginBottom:14,boxShadow:'0 4px 16px rgba(37,99,235,0.26)' }}>
              <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="#fff" strokeWidth={2.4}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
              </svg>
            </div>
            <h1 style={{ fontSize:26,fontWeight:900,color:'#0f172a',margin:'0 0 6px',letterSpacing:'-0.4px' }}>
              Setup Target Anda
            </h1>
            <p style={{ fontSize:14,fontWeight:500,color:'#64748b',margin:0,lineHeight:1.5 }}>
              Atur nominal dan periode untuk mencapai target finansial Anda
            </p>
          </div>

          {/* ── Form Fields ──────────────────────────────────────────────────── */}
          <div>
            {/* ── 1. Pilih Periode ─────────────────────── */}
            <div className="fu fu1" style={{ background:'#fff',borderRadius:20,padding:'18px',boxShadow:'0 2px 14px rgba(15,23,42,0.07)',border:'1px solid #f1f5f9',marginBottom:10 }}>
              <label style={{ display:'block',color:'#64748b',fontSize:10,fontWeight:700,textTransform:'uppercase',letterSpacing:'0.12em',marginBottom:12 }}>
                Periode Target
              </label>
              <div style={{ display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(90px,1fr))',gap:8 }}>
                {PERIOD_OPTIONS.map(({ value, label, sub, icon }) => {
                  const active = form.periodType === value;
                  return (
                    <button
                      key={value}
                      type="button"
                      className="period-btn"
                      onClick={() => setField('periodType', value)}
                      style={{
                        display:'flex',flexDirection:'column',alignItems:'flex-start',
                        padding:'12px 13px',borderRadius:14,cursor:'pointer',textAlign:'left',
                        border: active ? '1.5px solid #2563eb' : '1.5px solid #e2e8f0',
                        background: active ? '#eff6ff' : '#f8fafc',
                      }}
                    >
                      <span style={{ color: active ? '#2563eb' : '#94a3b8', marginBottom:7 }}>{icon}</span>
                      <span style={{ fontSize:13,fontWeight:700,color: active ? '#1d4ed8' : '#334155',lineHeight:1 }}>{label}</span>
                      <span style={{ fontSize:10,fontWeight:500,color: active ? '#3b82f6' : '#94a3b8',marginTop:3 }}>{sub}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* ── 2. Nominal Target ───────────────────── */}
            <div className="fu fu2" style={{ background:'#fff',borderRadius:20,padding:'18px',boxShadow:'0 2px 14px rgba(15,23,42,0.07)',border:'1px solid #f1f5f9',marginBottom:10 }}>
              <label htmlFor="targetAmount" style={{ display:'block',color:'#64748b',fontSize:10,fontWeight:700,textTransform:'uppercase',letterSpacing:'0.12em',marginBottom:12 }}>
                Nominal Target
              </label>
              <div style={{ position:'relative' }}>
                <span style={{ position:'absolute',left:14,top:'50%',transform:'translateY(-50%)',color:'#94a3b8',fontSize:14,fontWeight:700,pointerEvents:'none',userSelect:'none',fontFamily:'DM Mono, monospace' }}>
                  Rp
                </span>
                <input
                  id="targetAmount"
                  type="number"
                  min="1"
                  value={form.targetAmount}
                  onChange={(e) => setField('targetAmount', e.target.value)}
                  disabled={loading}
                  placeholder="0"
                  onFocus={onFocus}
                  onBlur={onBlur}
                  style={{
                    ...inputBase,
                    height: 54,
                    paddingLeft: 44,
                    paddingRight: 14,
                    fontSize: 20,
                    fontWeight: 700,
                    fontFamily: 'DM Mono, monospace',
                  }}
                />
              </div>

              {/* Live preview */}
              {hasAmount ? (
                <p style={{ color:'#2563eb',fontSize:12,fontWeight:600,margin:'8px 0 0',fontFamily:'DM Mono, monospace' }}>
                  {formatIDRFull(amount)}
                </p>
              ) : (
                <p style={{ color:'#94a3b8',fontSize:11,fontWeight:500,margin:'8px 0 0' }}>
                  Ketik nominal, format Rupiah tampil otomatis
                </p>
              )}
            </div>

            {/* ── 3. Tanggal Mulai ────────────────────── */}
            <div className="fu fu3" style={{ background:'#fff',borderRadius:20,padding:'18px',boxShadow:'0 2px 14px rgba(15,23,42,0.07)',border:'1px solid #f1f5f9',marginBottom:10 }}>
              <label htmlFor="startDate" style={{ display:'block',color:'#64748b',fontSize:10,fontWeight:700,textTransform:'uppercase',letterSpacing:'0.12em',marginBottom:12 }}>
                Tanggal Mulai
              </label>
              <input
                id="startDate"
                type="date"
                value={form.startDate}
                onChange={(e) => setField('startDate', e.target.value)}
                disabled={loading}
                onFocus={onFocus}
                onBlur={onBlur}
                style={{ ...inputBase, height:48, padding:'0 14px', fontSize:14, fontWeight:600 }}
              />
            </div>

            {/* ── 3b. Tanggal Akhir (hanya untuk custom) ─ */}
            {form.periodType === 'custom' && (
              <div className="fu fu3" style={{ background:'#fff',borderRadius:20,padding:'18px',boxShadow:'0 2px 14px rgba(15,23,42,0.07)',border:'1px solid #f1f5f9',marginBottom:10 }}>
                <label htmlFor="endDate" style={{ display:'block',color:'#64748b',fontSize:10,fontWeight:700,textTransform:'uppercase',letterSpacing:'0.12em',marginBottom:12 }}>
                  Tanggal Akhir
                </label>
                <input
                  id="endDate"
                  type="date"
                  value={form.endDate}
                  onChange={(e) => setField('endDate', e.target.value)}
                  disabled={loading}
                  min={form.startDate}
                  onFocus={onFocus}
                  onBlur={onBlur}
                  style={{ ...inputBase, height:48, padding:'0 14px', fontSize:14, fontWeight:600 }}
                />
                {form.endDate && form.endDate < form.startDate && (
                  <p style={{ color:'#dc2626',fontSize:11,fontWeight:500,margin:'8px 0 0' }}>
                    Tanggal akhir tidak boleh lebih awal dari tanggal mulai
                  </p>
                )}
              </div>
            )}

            {/* ── 4. Ringkasan ────────────────────────── */}
            <div className="fu fu4" style={{ background:'#f8fafc',borderRadius:18,padding:'15px 17px',border:'1.5px dashed #e2e8f0',marginBottom:12 }}>
              <p style={{ color:'#64748b',fontSize:10,fontWeight:700,textTransform:'uppercase',letterSpacing:'0.12em',margin:'0 0 11px' }}>
                Ringkasan Periode
              </p>
              <div style={{ display:'flex',flexDirection:'column',gap:8 }}>
                <Row label="Mulai"    value={formatDateID(form.startDate)} />
                <Row label="Berakhir" value={isValidCustomRange ? formatDateID(endDate) : '-'} />
                <Row label="Durasi"   value={isValidCustomRange && days > 0 ? `${days} hari` : '-'} />
                {hasAmount && isValidCustomRange && days > 0 && (
                  <div style={{ borderTop:'1px solid #e2e8f0', paddingTop:8, display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                    <span style={{ color:'#334155',fontSize:12,fontWeight:700 }}>Estimasi target/hari</span>
                    <span className="st-mono" style={{ color:'#2563eb',fontSize:13,fontWeight:700 }}>
                      {formatIDRFull(dailyEst)}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* ── Error ───────────────────────────────── */}
            {error && (
              <div className="fu" style={{ display:'flex',alignItems:'flex-start',gap:8,background:'#fef2f2',border:'1px solid #fecaca',borderRadius:14,padding:'11px 14px',marginBottom:12 }}>
                <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="#dc2626" strokeWidth={2.2} style={{ flexShrink:0,marginTop:1 }}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                </svg>
                <p style={{ color:'#dc2626',fontSize:13,fontWeight:600,margin:0 }}>{error}</p>
              </div>
            )}

            {/* ── Submit ──────────────────────────────── */}
            <div className="fu fu5">
              <button
                type="submit"
                disabled={loading || !isValidCustomRange}
                className="cta-btn"
                style={{
                  width:'100%', height:54,
                  background: (loading || !isValidCustomRange) ? '#93c5fd' : 'linear-gradient(135deg,#1e40af,#2563eb)',
                  color:'#fff', fontSize:15, fontWeight:800,
                  borderRadius:16, border:'none',
                  cursor: (loading || !isValidCustomRange) ? 'not-allowed' : 'pointer',
                  display:'flex', alignItems:'center', justifyContent:'center', gap:8,
                  boxShadow: (loading || !isValidCustomRange) ? 'none' : '0 6px 20px rgba(37,99,235,0.28)',
                  letterSpacing:'-0.2px',
                }}
              >
                {loading ? (
                  <>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" style={{ animation:'spin 0.8s linear infinite' }}>
                      <circle cx="12" cy="12" r="10" stroke="white" strokeWidth="3" strokeOpacity="0.25" />
                      <path d="M12 2a10 10 0 0110 10" stroke="white" strokeWidth="3" strokeLinecap="round" />
                    </svg>
                    Menyimpan...
                  </>
                ) : (
                  <>
                    <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth={2.8}><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>
                    Simpan Target
                  </>
                )}
              </button>
              <p style={{ textAlign:'center',color:'#94a3b8',fontSize:11,fontWeight:500,margin:'10px 0 0' }}>
                Target dapat diperbarui kapan saja dari menu pengaturan
              </p>
            </div>

          </div>
        </form>
      </div>
    </>
  );
}

// ─── Row helper ───────────────────────────────────────────────────────────────
function Row({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
      <span style={{ color:'#64748b', fontSize:12, fontWeight:500 }}>{label}</span>
      <span style={{ color:'#0f172a', fontSize:12, fontWeight:700 }}>{value}</span>
    </div>
  );
}