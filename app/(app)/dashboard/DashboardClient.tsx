'use client';

// app/(app)/dashboard/DashboardClient.tsx
// Terima semua data dari Server Component — tidak ada fetch, tidak ada loading state.

import { DayStatus } from '@/lib/finance/dailyTarget';

// ─── Types ────────────────────────────────────────────────────────────────────

interface ActiveTarget {
  id: string;
  period_type: string;
  target_amount: number;
  start_date: string;
  end_date: string;
}

interface Props {
  userName:             string;
  activeTarget:         ActiveTarget;
  todayIncome:          number;
  todayExpense:         number;
  todayBaseTarget:      number;
  todayCarryMinus:      number;
  todayEffectiveTarget: number;
  todayNet:             number;
  todayStatus:          DayStatus | null;
  percentage:           number;
  totalIncome:          number;
  totalExpense:         number;
  netIncome:            number;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatIDR(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency', currency: 'IDR',
    minimumFractionDigits: 0, maximumFractionDigits: 0,
  }).format(amount);
}

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 11) return 'Selamat pagi';
  if (h < 15) return 'Selamat siang';
  if (h < 18) return 'Selamat sore';
  return 'Selamat malam';
}

function getTodayLabel(): string {
  return new Intl.DateTimeFormat('id-ID', {
    weekday: 'long', day: 'numeric', month: 'long',
  }).format(new Date());
}

function formatDate(s: string): string {
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric', month: 'short', year: 'numeric',
  }).format(new Date(s));
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function ProgressArc({ pct }: { pct: number }) {
  const r = 38;
  const circ = 2 * Math.PI * r;
  const clamped = Math.min(100, Math.max(0, pct));
  const dash = (clamped / 100) * circ;
  const strokeColor = clamped >= 80 ? '#34d399' : clamped >= 40 ? '#93c5fd' : '#fbbf24';
  return (
    <svg width="96" height="96" viewBox="0 0 96 96" style={{ transform:'rotate(-90deg)', flexShrink:0 }}>
      <circle cx="48" cy="48" r={r} fill="none" stroke="rgba(255,255,255,0.10)" strokeWidth="9" />
      <circle cx="48" cy="48" r={r} fill="none"
        stroke={strokeColor} strokeWidth="9"
        strokeLinecap="round"
        strokeDasharray={`${dash} ${circ}`}
        style={{ transition:'stroke-dasharray 0.9s cubic-bezier(.4,0,.2,1)' }}
      />
    </svg>
  );
}

const STATUS_META: Record<Exclude<DayStatus,'pending'>, { label:string; bg:string; color:string; dot:string }> = {
  success: { label:'Target Tercapai', bg:'#f0fdf4', color:'#15803d', dot:'#22c55e' },
  over:    { label:'Melebihi Target',  bg:'#eff6ff', color:'#1d4ed8', dot:'#3b82f6' },
  minus:   { label:'Di Bawah Target',  bg:'#fef2f2', color:'#dc2626', dot:'#ef4444' },
};

function StatusPill({ status }: { status: DayStatus | null }) {
  if (!status || status === 'pending') {
    return (
      <span style={{ fontSize:11, fontWeight:600, color:'#94a3b8', background:'#f8fafc', border:'1px solid #e2e8f0', borderRadius:99, padding:'3px 10px', whiteSpace:'nowrap' }}>
        Menunggu
      </span>
    );
  }
  const m = STATUS_META[status];
  return (
    <span style={{ display:'inline-flex', alignItems:'center', gap:5, fontSize:11, fontWeight:700, color:m.color, background:m.bg, borderRadius:99, padding:'4px 10px', whiteSpace:'nowrap' }}>
      <span style={{ width:6, height:6, borderRadius:'50%', background:m.dot, flexShrink:0 }} />
      {m.label}
    </span>
  );
}

// ─── Main Client Component ────────────────────────────────────────────────────

export default function DashboardClient({
  userName, activeTarget,
  todayIncome, todayExpense, todayNet,
  todayBaseTarget, todayCarryMinus, todayEffectiveTarget,
  todayStatus, percentage, totalIncome, totalExpense, netIncome,
}: Props) {
  const todayDelta  = todayNet - todayEffectiveTarget;
  const isShort     = todayStatus === 'minus';
  const progressPct = Math.min(100, percentage);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700;9..40,800&family=DM+Mono:wght@400;500&display=swap');
        .db-root { font-family:'DM Sans',sans-serif; }
        .db-mono { font-family:'DM Mono',monospace !important; }
        @keyframes fadeUp {
          from { opacity:0; transform:translateY(12px); }
          to   { opacity:1; transform:translateY(0); }
        }
        .fu  { animation:fadeUp 0.38s ease both; }
        .fu1 { animation-delay:0.04s; }
        .fu2 { animation-delay:0.10s; }
        .fu3 { animation-delay:0.17s; }
        .fu4 { animation-delay:0.24s; }
        .tap:active { transform:scale(0.97); }
        .tap { transition:transform 0.12s, box-shadow 0.12s; }
      `}</style>

      <div className="db-root" style={{ paddingBottom:8 }}>

        {/* ══════════════════════════════════════════════
            HERO
        ══════════════════════════════════════════════ */}
        <div style={{
          background:'linear-gradient(148deg,#1e3a8a 0%,#1d4ed8 60%,#3b82f6 100%)',
          borderRadius:'0 0 30px 30px',
          padding:'22px 20px 48px',
          position:'relative',
          overflow:'hidden',
        }}>
          {/* Orbs dekoratif */}
          <div style={{ position:'absolute', top:-50, right:-50, width:180, height:180, borderRadius:'50%', background:'rgba(255,255,255,0.05)', pointerEvents:'none' }} />
          <div style={{ position:'absolute', bottom:-30, left:-30, width:120, height:120, borderRadius:'50%', background:'rgba(255,255,255,0.04)', pointerEvents:'none' }} />
          <div style={{ position:'absolute', top:30, right:10, width:60, height:60, borderRadius:'50%', background:'rgba(255,255,255,0.04)', pointerEvents:'none' }} />

          {/* Greeting */}
          <div className="fu">
            <p style={{ color:'rgba(255,255,255,0.60)', fontSize:13, fontWeight:500, margin:'0 0 2px' }}>
              {getGreeting()} 👋
            </p>
            <p style={{ color:'#fff', fontSize:19, fontWeight:800, margin:'0 0 1px', letterSpacing:'-0.4px' }}>
              {userName}
            </p>
            <p style={{ color:'rgba(255,255,255,0.45)', fontSize:12, fontWeight:500, margin:0 }}>
              {getTodayLabel()}
            </p>
          </div>

          {/* Progress card */}
          <div className="fu fu1" style={{
            marginTop:18,
            background:'rgba(255,255,255,0.11)',
            backdropFilter:'blur(16px)',
            WebkitBackdropFilter:'blur(16px)',
            borderRadius:20,
            border:'1px solid rgba(255,255,255,0.16)',
            padding:'16px 18px',
            display:'flex',
            alignItems:'center',
            gap:16,
          }}>
            {/* Arc */}
            <div style={{ position:'relative', flexShrink:0 }}>
              <ProgressArc pct={progressPct} />
              <div style={{ position:'absolute', inset:0, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center' }}>
                <span className="db-mono" style={{ color:'#fff', fontSize:16, fontWeight:600, lineHeight:1 }}>
                  {Math.round(progressPct)}%
                </span>
                <span style={{ color:'rgba(255,255,255,0.50)', fontSize:9, fontWeight:700, marginTop:2, letterSpacing:'0.08em', textTransform:'uppercase' }}>
                  target
                </span>
              </div>
            </div>

            {/* Text */}
            <div style={{ flex:1, minWidth:0 }}>
              <p style={{ color:'rgba(255,255,255,0.55)', fontSize:10, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.1em', margin:'0 0 4px' }}>
                Saldo Periode
              </p>
              <p className="db-mono" style={{ color:'#fff', fontSize:19, fontWeight:600, margin:'0 0 6px', letterSpacing:'-0.5px', lineHeight:1, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>
                {formatIDR(netIncome)}
              </p>
              <div style={{ display:'flex', gap:8, fontSize:9, fontWeight:500 }}>
                <span style={{ color:'rgba(255,255,255,0.45)' }}>Income: {formatIDR(totalIncome)}</span>
                <span style={{ color:'rgba(255,255,255,0.30)' }}>•</span>
                <span style={{ color:'rgba(255,255,255,0.45)' }}>Expense: {formatIDR(totalExpense)}</span>
              </div>
              {/* Bar */}
              <div style={{ width:'100%', height:5, background:'rgba(255,255,255,0.14)', borderRadius:99, overflow:'hidden', marginTop:8 }}>
                <div style={{
                  height:'100%', borderRadius:99,
                  width:`${progressPct}%`,
                  background: progressPct >= 80 ? '#34d399' : progressPct >= 40 ? '#93c5fd' : '#fbbf24',
                  transition:'width 0.9s cubic-bezier(.4,0,.2,1)',
                }} />
              </div>
              <p style={{ color:'rgba(255,255,255,0.40)', fontSize:10, fontWeight:500, margin:'5px 0 0', lineHeight:1.4, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>
                dari {formatIDR(activeTarget.target_amount)} · {formatDate(activeTarget.start_date)}–{formatDate(activeTarget.end_date)}
              </p>
            </div>
          </div>
        </div>

        {/* ══════════════════════════════════════════════
            CONTENT
        ══════════════════════════════════════════════ */}
        <div style={{ padding:'0 14px', marginTop:'-20px' }}>

          {/* ── 2-col summary ─────────────────────────── */}
          <div className="fu fu2" style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:10 }}>

            {/* Income */}
            <div style={{ background:'#fff', borderRadius:18, padding:'15px', boxShadow:'0 2px 14px rgba(15,23,42,0.07)', border:'1px solid #f1f5f9' }}>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:10 }}>
                <span style={{ color:'#64748b', fontSize:10, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.1em' }}>Income</span>
                <div style={{ width:26, height:26, borderRadius:8, background:'#f0fdf4', display:'flex', alignItems:'center', justifyContent:'center' }}>
                  <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="#22c55e" strokeWidth={2.8}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 19V5m0 0l-7 7m7-7l7 7" />
                  </svg>
                </div>
              </div>
              <p className="db-mono" style={{ color:'#0f172a', fontSize:15, fontWeight:600, margin:0, letterSpacing:'-0.4px', lineHeight:1 }}>
                {formatIDR(todayIncome)}
              </p>
              <p style={{ color:'#94a3b8', fontSize:10, fontWeight:500, margin:'5px 0 0' }}>hari ini</p>
            </div>

            {/* Expense */}
            <div style={{ background:'#fff', borderRadius:18, padding:'15px', boxShadow:'0 2px 14px rgba(15,23,42,0.07)', border:'1px solid #f1f5f9' }}>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:10 }}>
                <span style={{ color:'#64748b', fontSize:10, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.1em' }}>Expense</span>
                <div style={{ width:26, height:26, borderRadius:8, background:'#fff1f2', display:'flex', alignItems:'center', justifyContent:'center' }}>
                  <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="#f43f5e" strokeWidth={2.8}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 5v14m0 0l7-7m-7 7l-7-7" />
                  </svg>
                </div>
              </div>
              <p className="db-mono" style={{ color:'#0f172a', fontSize:15, fontWeight:600, margin:0, letterSpacing:'-0.4px', lineHeight:1 }}>
                {formatIDR(todayExpense)}
              </p>
              <p style={{ color:'#94a3b8', fontSize:10, fontWeight:500, margin:'5px 0 0' }}>hari ini</p>
            </div>
          </div>

          {/* ── Target Hari Ini ───────────────────────── */}
          <div className="fu fu3" style={{
            background:'#fff',
            borderRadius:20,
            padding:'18px 18px 16px',
            boxShadow:'0 2px 16px rgba(15,23,42,0.08)',
            border:'1px solid #f1f5f9',
            marginBottom:10,
          }}>
            {/* Header */}
            <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:16 }}>
              <div>
                <p style={{ color:'#64748b', fontSize:10, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.12em', margin:'0 0 5px' }}>
                  Target Hari Ini
                </p>
                <p className="db-mono" style={{ color:'#0f172a', fontSize:23, fontWeight:600, margin:0, letterSpacing:'-0.8px', lineHeight:1 }}>
                  {formatIDR(todayEffectiveTarget)}
                </p>
              </div>
              <StatusPill status={todayStatus} />
            </div>

            {/* Breakdown */}
            <div style={{ borderTop:'1px dashed #e2e8f0', paddingTop:14, display:'flex', flexDirection:'column', gap:0 }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', paddingBottom:9 }}>
                <span style={{ color:'#64748b', fontSize:12, fontWeight:500 }}>Target dasar</span>
                <span className="db-mono" style={{ color:'#334155', fontSize:12, fontWeight:500 }}>{formatIDR(todayBaseTarget)}</span>
              </div>

              {todayCarryMinus > 0 && (
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', paddingBottom:9 }}>
                  <span style={{ color:'#dc2626', fontSize:12, fontWeight:600 }}>+ Carry minus</span>
                  <span className="db-mono" style={{ color:'#dc2626', fontSize:12, fontWeight:700 }}>+{formatIDR(todayCarryMinus)}</span>
                </div>
              )}

              <div style={{ borderTop:'1px solid #f1f5f9', paddingTop:10, display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                <span style={{ color:'#334155', fontSize:12, fontWeight:700 }}>
                  {isShort ? 'Masih kurang' : 'Selisih'}
                </span>
                <span className="db-mono" style={{ fontSize:14, fontWeight:800, color: todayDelta >= 0 ? '#16a34a' : '#dc2626' }}>
                  {todayDelta >= 0 ? '+' : ''}{formatIDR(todayDelta)}
                </span>
              </div>
            </div>

            {isShort && (
              <div style={{ marginTop:12, background:'#fef2f2', borderRadius:10, padding:'8px 11px', display:'flex', alignItems:'center', gap:7 }}>
                <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="#dc2626" strokeWidth={2.2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                </svg>
                <p style={{ color:'#dc2626', fontSize:11, fontWeight:600, margin:0 }}>
                  Kekurangan {formatIDR(Math.abs(todayDelta))} akan dibawa ke besok
                </p>
              </div>
            )}
          </div>

          {/* ── Quick actions ─────────────────────────── */}
          <div className="fu fu4" style={{ marginBottom:4 }}>
            <a
              href="/records"
              className="tap"
              style={{
                display:'flex', alignItems:'center', justifyContent:'center', gap:8,
                background:'linear-gradient(135deg,#1e40af,#2563eb)',
                color:'#fff', fontSize:14, fontWeight:700,
                padding:'15px', borderRadius:16, textDecoration:'none',
                boxShadow:'0 6px 20px rgba(37,99,235,0.28)',
                letterSpacing:'-0.1px',
              }}
            >
              <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
              </svg>
              Lihat Semua Catatan
            </a>
          </div>

        </div>
      </div>
    </>
  );
}