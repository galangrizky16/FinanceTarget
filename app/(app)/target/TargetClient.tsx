'use client';

// app/(app)/target/TargetClient.tsx
// Terima data dari Server Component — tidak ada fetch, tidak ada loading state.

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { TargetData } from './page';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function toDateString(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function clamp(n: number, lo: number, hi: number) {
  return Math.min(hi, Math.max(lo, n));
}

function formatIDR(n: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency', currency: 'IDR',
    minimumFractionDigits: 0, maximumFractionDigits: 0,
  }).format(n);
}

function formatDateID(s: string): string {
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric', month: 'long', year: 'numeric',
  }).format(new Date(s));
}

const PERIOD_LABEL: Record<string, string> = {
  daily: 'Harian', weekly: 'Mingguan', monthly: 'Bulanan', yearly: 'Tahunan',
};

// ─── Icons ────────────────────────────────────────────────────────────────────

function IconCalendar({ size = 16, color = 'currentColor' }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} fill="none" viewBox="0 0 24 24" stroke={color} strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
    </svg>
  );
}

function IconArrowRight({ size = 16, color = 'currentColor' }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} fill="none" viewBox="0 0 24 24" stroke={color} strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
    </svg>
  );
}

function IconArrowUp({ size = 13, color = 'currentColor' }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} fill="none" viewBox="0 0 24 24" stroke={color} strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 19V5m0 0l-7 7m7-7l7 7" />
    </svg>
  );
}

function IconChartBar({ size = 16, color = 'currentColor' }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} fill="none" viewBox="0 0 24 24" stroke={color} strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
    </svg>
  );
}

function IconEdit({ size = 14, color = 'currentColor' }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} fill="none" viewBox="0 0 24 24" stroke={color} strokeWidth={2.2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
    </svg>
  );
}

function IconWarning({ size = 16, color = '#d97706' }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} fill="none" viewBox="0 0 24 24" stroke={color} strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
    </svg>
  );
}

function IconPlus({ size = 16, color = 'white' }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} fill="none" viewBox="0 0 24 24" stroke={color} strokeWidth={2.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
    </svg>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function ProgressBar({ pct, height = 8 }: { pct: number; height?: number }) {
  const clamped = clamp(pct, 0, 100);
  const color   = clamped >= 100 ? '#16a34a' : clamped >= 60 ? '#2563eb' : clamped >= 30 ? '#f59e0b' : '#ef4444';
  return (
    <div style={{ width:'100%', height, borderRadius:99, background:'#f1f5f9', overflow:'hidden' }}>
      <div style={{ height:'100%', borderRadius:99, width:`${clamped}%`, background:color, transition:'width 0.9s cubic-bezier(.4,0,.2,1)', position:'relative' }}>
        <div style={{ position:'absolute', inset:0, background:'linear-gradient(90deg,transparent 0%,rgba(255,255,255,0.25) 50%,transparent 100%)', borderRadius:99 }} />
      </div>
    </div>
  );
}

function StatRow({ label, value, valueColor = '#0f172a', bold = false }: { label: string; value: string; valueColor?: string; bold?: boolean }) {
  return (
    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
      <span style={{ fontFamily:'DM Sans,sans-serif', color:'#64748b', fontSize:12, fontWeight:500 }}>{label}</span>
      <span style={{ fontFamily:'DM Mono,monospace', color:valueColor, fontSize:13, fontWeight: bold ? 700 : 600 }}>{value}</span>
    </div>
  );
}

function ConfirmModal({ open, onConfirm, onCancel }: { open: boolean; onConfirm: () => void; onCancel: () => void }) {
  if (!open) return null;
  return (
    <div onClick={onCancel} style={{ position:'fixed', inset:0, zIndex:70, background:'rgba(15,23,42,0.50)', backdropFilter:'blur(3px)', display:'flex', alignItems:'flex-end', justifyContent:'center' }}>
      <div onClick={(e) => e.stopPropagation()} style={{ width:'100%', maxWidth:420, background:'#fff', borderRadius:'24px 24px 0 0', padding:'24px 20px 32px', boxShadow:'0 -8px 40px rgba(15,23,42,0.15)' }}>
        <div style={{ display:'flex', justifyContent:'center', marginBottom:20 }}>
          <div style={{ width:36, height:4, borderRadius:99, background:'#e2e8f0' }} />
        </div>
        <div style={{ display:'flex', justifyContent:'center', marginBottom:16 }}>
          <div style={{ width:56, height:56, borderRadius:18, background:'#fffbeb', border:'1.5px solid #fde68a', display:'flex', alignItems:'center', justifyContent:'center' }}>
            <IconWarning size={26} color="#d97706" />
          </div>
        </div>
        <p style={{ fontFamily:'DM Sans,sans-serif', fontSize:16, fontWeight:800, color:'#0f172a', textAlign:'center', margin:'0 0 8px', letterSpacing:'-0.3px' }}>Ubah Target?</p>
        <p style={{ fontFamily:'DM Sans,sans-serif', fontSize:13, fontWeight:500, color:'#64748b', textAlign:'center', margin:'0 0 24px', lineHeight:1.55 }}>
          Kamu akan membuat target baru. Target saat ini akan tetap tersimpan di riwayat.
        </p>
        <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
          <button onClick={onConfirm} style={{ width:'100%', height:50, borderRadius:14, border:'none', cursor:'pointer', background:'linear-gradient(135deg,#1e40af,#2563eb)', color:'#fff', fontSize:14, fontWeight:800, fontFamily:'DM Sans,sans-serif', boxShadow:'0 4px 14px rgba(37,99,235,0.25)' }}>
            Ya, Buat Target Baru
          </button>
          <button onClick={onCancel} style={{ width:'100%', height:46, borderRadius:14, border:'1.5px solid #e2e8f0', cursor:'pointer', background:'#fff', color:'#64748b', fontSize:14, fontWeight:700, fontFamily:'DM Sans,sans-serif' }}>
            Batal
          </button>
        </div>
      </div>
    </div>
  );
}

function EmptyState() {
  const router = useRouter();
  return (
    <div style={{ display:'flex', flexDirection:'column', alignItems:'center', padding:'64px 28px 32px', textAlign:'center' }}>
      <div style={{ width:80, height:80, borderRadius:24, background:'#eff6ff', border:'2px dashed #bfdbfe', display:'flex', alignItems:'center', justifyContent:'center', marginBottom:20 }}>
        <svg width="38" height="38" fill="none" viewBox="0 0 24 24" stroke="#2563eb" strokeWidth={1.4}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
        </svg>
      </div>
      <p style={{ fontFamily:'DM Sans,sans-serif', fontSize:17, fontWeight:800, color:'#0f172a', margin:'0 0 8px', letterSpacing:'-0.3px' }}>Belum Ada Target</p>
      <p style={{ fontFamily:'DM Sans,sans-serif', fontSize:13, fontWeight:500, color:'#94a3b8', margin:'0 0 28px', lineHeight:1.6, maxWidth:260 }}>
        Tetapkan target income untuk mulai memantau progres keuanganmu setiap hari.
      </p>
      <button onClick={() => router.push('/setup-target')} style={{ display:'inline-flex', alignItems:'center', gap:8, padding:'13px 24px', borderRadius:16, border:'none', cursor:'pointer', background:'linear-gradient(135deg,#1e40af,#2563eb)', color:'#fff', fontSize:14, fontWeight:800, fontFamily:'DM Sans,sans-serif', boxShadow:'0 6px 20px rgba(37,99,235,0.28)', letterSpacing:'-0.1px' }}>
        <IconPlus />
        Buat Target Sekarang
      </button>
    </div>
  );
}

// ─── Main Client Component ────────────────────────────────────────────────────

export default function TargetClient({ data }: { data: TargetData | null }) {
  const router        = useRouter();
  const [confirmOpen, setConfirmOpen] = useState(false);

  const today = toDateString(new Date());

  if (!data) {
    return (
      <>
        <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700;9..40,800&family=DM+Mono:wght@400;500;600&display=swap');`}</style>
        <EmptyState />
      </>
    );
  }

  const { target, totalIncome, totalExpense, totalNet, todayIncome, todayExpense, todayNet, percentage, remaining, totalDays, baseDailyTarget, daysElapsed, daysLeft } = data;

  const pct           = clamp(percentage, 0, 100);
  const isCompleted   = totalNet >= target.target_amount;
  const isOverdue     = today > target.end_date;
  const progressColor = isCompleted ? '#16a34a' : pct >= 60 ? '#2563eb' : pct >= 30 ? '#f59e0b' : '#ef4444';

  const statusLabel = isCompleted
    ? { text:'Target Tercapai',  bg:'#f0fdf4', color:'#16a34a', border:'#bbf7d0' }
    : isOverdue
    ? { text:'Periode Berakhir', bg:'#fff7ed', color:'#d97706', border:'#fed7aa' }
    : { text:'Sedang Berjalan',  bg:'#eff6ff', color:'#2563eb', border:'#bfdbfe' };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700;9..40,800&family=DM+Mono:wght@400;500;600&display=swap');
        .tg-root * { font-family:'DM Sans',sans-serif; box-sizing:border-box; }
        .tg-mono   { font-family:'DM Mono',monospace !important; }
        @keyframes fadeUp  { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
        .fu  { animation:fadeUp 0.36s ease both; }
        .fu1 { animation-delay:0.05s; }
        .fu2 { animation-delay:0.11s; }
        .fu3 { animation-delay:0.17s; }
        .fu4 { animation-delay:0.23s; }
        .action-btn { transition:transform 0.13s, box-shadow 0.13s; }
        .action-btn:active { transform:scale(0.97); }
      `}</style>

      <div className="tg-root" style={{ paddingBottom:20 }}>

        {/* ══ HERO ══ */}
        <div style={{ background:'linear-gradient(148deg,#1e3a8a 0%,#1d4ed8 60%,#3b82f6 100%)', borderRadius:'0 0 30px 30px', padding:'20px 20px 48px', position:'relative', overflow:'hidden', marginBottom:'-22px' }}>
          <div style={{ position:'absolute',top:-44,right:-44,width:170,height:170,borderRadius:'50%',background:'rgba(255,255,255,0.05)',pointerEvents:'none' }} />
          <div style={{ position:'absolute',bottom:-30,left:-30,width:110,height:110,borderRadius:'50%',background:'rgba(255,255,255,0.04)',pointerEvents:'none' }} />

          <div className="fu">
            <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:14 }}>
              <div>
                <p style={{ color:'rgba(255,255,255,0.55)', fontSize:11, fontWeight:600, textTransform:'uppercase', letterSpacing:'0.12em', margin:'0 0 4px' }}>
                  {PERIOD_LABEL[target.period_type] ?? target.period_type}
                </p>
                <h1 style={{ color:'#fff', fontSize:22, fontWeight:800, margin:0, letterSpacing:'-0.5px', lineHeight:1.1 }}>Target Saya</h1>
              </div>
              <span style={{ display:'inline-flex', alignItems:'center', gap:5, padding:'5px 12px', borderRadius:99, background:statusLabel.bg, border:`1px solid ${statusLabel.border}`, color:statusLabel.color, fontSize:11, fontWeight:700 }}>
                <span style={{ width:6, height:6, borderRadius:'50%', background:statusLabel.color }} />
                {statusLabel.text}
              </span>
            </div>
            <p className="tg-mono" style={{ color:'#fff', fontSize:30, fontWeight:600, margin:'0 0 4px', letterSpacing:'-1px', lineHeight:1 }}>
              {formatIDR(target.target_amount)}
            </p>
            <div style={{ display:'flex', alignItems:'center', gap:6 }}>
              <IconCalendar size={12} color="rgba(255,255,255,0.50)" />
              <p style={{ color:'rgba(255,255,255,0.50)', fontSize:11, fontWeight:500, margin:0 }}>
                {formatDateID(target.start_date)} — {formatDateID(target.end_date)}
              </p>
            </div>
          </div>
        </div>

        {/* ══ CONTENT ══ */}
        <div style={{ padding:'0 14px' }}>

          {/* ── Progress card ── */}
          <div className="fu fu1" style={{ background:'#fff', borderRadius:20, padding:'18px', boxShadow:'0 2px 16px rgba(15,23,42,0.08)', border:'1px solid #f1f5f9', marginBottom:10 }}>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:14 }}>
              <p style={{ color:'#64748b', fontSize:10, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.12em', margin:0 }}>Progress Periode</p>
              <span className="tg-mono" style={{ fontSize:20, fontWeight:700, color:progressColor, letterSpacing:'-0.5px' }}>{percentage}%</span>
            </div>
            <ProgressBar pct={pct} height={10} />
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:0, marginTop:14, borderTop:'1px solid #f8fafc', paddingTop:14 }}>
              {[
                { label:'Tercapai', value: formatIDR(totalNet),    color:'#16a34a' },
                { label:'Sisa',     value: formatIDR(remaining),   color: remaining === 0 ? '#16a34a' : '#dc2626' },
                { label:'Total',    value: formatIDR(target.target_amount), color:'#0f172a' },
              ].map((s, i) => (
                <div key={s.label} style={{ textAlign: i === 1 ? 'center' : i === 2 ? 'right' : 'left' }}>
                  <p style={{ color:'#94a3b8', fontSize:10, fontWeight:600, textTransform:'uppercase', letterSpacing:'0.08em', margin:'0 0 3px' }}>{s.label}</p>
                  <p className="tg-mono" style={{ color:s.color, fontSize:12, fontWeight:700, margin:0, letterSpacing:'-0.3px' }}>{s.value}</p>
                </div>
              ))}
            </div>
            <div style={{ display:'flex', justifyContent:'space-between', marginTop:12, paddingTop:12, borderTop:'1px dashed #f1f5f9' }}>
              <div style={{ display:'flex', alignItems:'center', gap:5 }}>
                <IconCalendar size={12} color="#94a3b8" />
                <span style={{ fontSize:11, fontWeight:600, color:'#94a3b8' }}>Hari ke-{daysElapsed} dari {totalDays}</span>
              </div>
              {!isOverdue && !isCompleted && (
                <span style={{ fontSize:11, fontWeight:700, color: daysLeft <= 3 ? '#dc2626' : '#64748b' }}>{daysLeft} hari lagi</span>
              )}
              {isCompleted && <span style={{ fontSize:11, fontWeight:700, color:'#16a34a' }}>Selesai ✓</span>}
            </div>
          </div>

          {/* ── Ringkasan Hari Ini ── */}
          <div className="fu fu2" style={{ background:'#fff', borderRadius:20, padding:'17px 18px', boxShadow:'0 2px 14px rgba(15,23,42,0.07)', border:'1px solid #f1f5f9', marginBottom:10 }}>
            <p style={{ color:'#64748b', fontSize:10, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.12em', margin:'0 0 14px' }}>Ringkasan Hari Ini</p>
            <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                  <div style={{ width:30, height:30, borderRadius:9, background:'#f0fdf4', display:'flex', alignItems:'center', justifyContent:'center' }}>
                    <IconArrowUp size={13} color="#16a34a" />
                  </div>
                  <span style={{ fontSize:13, fontWeight:600, color:'#334155' }}>Net hari ini</span>
                </div>
                <span className="tg-mono" style={{ fontSize:14, fontWeight:700, color: todayNet > 0 ? '#16a34a' : todayNet < 0 ? '#dc2626' : '#94a3b8' }}>{formatIDR(todayNet)}</span>
              </div>
              <div style={{ height:1, background:'#f8fafc' }} />
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                  <div style={{ width:30, height:30, borderRadius:9, background:'#eff6ff', display:'flex', alignItems:'center', justifyContent:'center' }}>
                    <IconChartBar size={13} color="#2563eb" />
                  </div>
                  <span style={{ fontSize:13, fontWeight:600, color:'#334155' }}>Target/hari</span>
                </div>
                <span className="tg-mono" style={{ fontSize:14, fontWeight:700, color:'#2563eb' }}>{formatIDR(baseDailyTarget)}</span>
              </div>
              {(() => {
                const delta = todayNet - baseDailyTarget;
                return (
                  <div style={{ borderTop:'1px dashed #f1f5f9', paddingTop:10, display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                    <span style={{ fontSize:12, fontWeight:600, color:'#64748b' }}>{delta >= 0 ? 'Lebih dari target' : 'Kurang dari target'}</span>
                    <span className="tg-mono" style={{ fontSize:13, fontWeight:800, color: delta >= 0 ? '#16a34a' : '#dc2626' }}>
                      {delta >= 0 ? '+' : ''}{formatIDR(delta)}
                    </span>
                  </div>
                );
              })()}
            </div>
          </div>

          {/* ── Detail target ── */}
          <div className="fu fu3" style={{ background:'#f8fafc', borderRadius:18, padding:'15px 17px', border:'1.5px dashed #e2e8f0', marginBottom:12 }}>
            <p style={{ color:'#64748b', fontSize:10, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.12em', margin:'0 0 12px' }}>Detail Target</p>
            <div style={{ display:'flex', flexDirection:'column', gap:9 }}>
              <StatRow label="Tipe periode"    value={PERIOD_LABEL[target.period_type] ?? target.period_type} />
              <StatRow label="Total hari"      value={`${totalDays} hari`} />
              <StatRow label="Target per hari" value={formatIDR(baseDailyTarget)} valueColor="#2563eb" bold />
              <div style={{ borderTop:'1px solid #e2e8f0', paddingTop:9 }}>
                <StatRow label="Mulai"    value={formatDateID(target.start_date)} />
              </div>
              <StatRow label="Berakhir" value={formatDateID(target.end_date)} />
            </div>
          </div>

          {/* ── Action buttons ── */}
          <div className="fu fu4" style={{ display:'flex', flexDirection:'column', gap:8 }}>
            <a href="/daily-target" className="action-btn" style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:8, height:52, borderRadius:16, textDecoration:'none', background:'linear-gradient(135deg,#1e40af,#2563eb)', color:'#fff', fontSize:14, fontWeight:800, fontFamily:'DM Sans,sans-serif', boxShadow:'0 6px 20px rgba(37,99,235,0.28)', letterSpacing:'-0.1px' }}>
              <IconChartBar size={16} color="white" />
              Lihat Target Harian
              <IconArrowRight size={14} color="white" />
            </a>
            <button onClick={() => setConfirmOpen(true)} className="action-btn" style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:7, width:'100%', height:46, borderRadius:14, cursor:'pointer', background:'#fff', color:'#64748b', fontSize:13, fontWeight:700, fontFamily:'DM Sans,sans-serif', border:'1.5px solid #e2e8f0' }}>
              <IconEdit size={14} color="#64748b" />
              Ubah Target
            </button>
          </div>

        </div>
      </div>

      <ConfirmModal
        open={confirmOpen}
        onConfirm={() => { setConfirmOpen(false); router.push('/setup-target'); }}
        onCancel={() => setConfirmOpen(false)}
      />
    </>
  );
}