'use client';

// app/(app)/daily-target/DailyTargetClient.tsx
// Terima data dari Server Component — tidak ada fetch, tidak ada loading state.

import {
  getDayResult,
  type DayResult,
  type DayStatus,
  type PeriodSummary,
} from '@/lib/finance/dailyTarget';
import type { DailyPageData } from './page';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatIDR(n: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency', currency: 'IDR',
    minimumFractionDigits: 0, maximumFractionDigits: 0,
  }).format(n);
}

function formatDateShort(s: string): string {
  return new Intl.DateTimeFormat('id-ID', {
    weekday: 'short', day: 'numeric', month: 'short',
  }).format(new Date(s));
}

function formatDateFull(s: string): string {
  return new Intl.DateTimeFormat('id-ID', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  }).format(new Date(s));
}

function formatDateID(s: string): string {
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric', month: 'short', year: 'numeric',
  }).format(new Date(s));
}

const PERIOD_LABEL: Record<string, string> = {
  daily: 'Harian', weekly: 'Mingguan', monthly: 'Bulanan', yearly: 'Tahunan',
};

// ─── Status config ────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<DayStatus, {
  label: string; bg: string; color: string; border: string; dotColor: string;
}> = {
  success: { label:'Tercapai',  bg:'#f0fdf4', color:'#15803d', border:'#bbf7d0', dotColor:'#22c55e' },
  over:    { label:'Melebihi',  bg:'#eff6ff', color:'#1d4ed8', border:'#bfdbfe', dotColor:'#3b82f6' },
  minus:   { label:'Kurang',    bg:'#fef2f2', color:'#dc2626', border:'#fecaca', dotColor:'#ef4444' },
  pending: { label:'Menunggu',  bg:'#f8fafc', color:'#94a3b8', border:'#e2e8f0', dotColor:'#cbd5e1' },
};

function StatusPill({ status, size = 'md' }: { status: DayStatus; size?: 'sm' | 'md' }) {
  const cfg = STATUS_CONFIG[status];
  const pad = size === 'sm' ? '3px 9px' : '4px 12px';
  const fs  = size === 'sm' ? 10 : 11;
  return (
    <span style={{ display:'inline-flex', alignItems:'center', gap:5, padding:pad, borderRadius:99, background:cfg.bg, border:`1px solid ${cfg.border}`, color:cfg.color, fontSize:fs, fontWeight:700, whiteSpace:'nowrap' }}>
      <span style={{ width:6, height:6, borderRadius:'50%', background:cfg.dotColor, flexShrink:0 }} />
      {cfg.label}
    </span>
  );
}

// ─── Icons ────────────────────────────────────────────────────────────────────

function IconArrowUp({ size = 13, color = 'currentColor' }: { size?: number; color?: string }) {
  return <svg width={size} height={size} fill="none" viewBox="0 0 24 24" stroke={color} strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 19V5m0 0l-7 7m7-7l7 7" /></svg>;
}

function IconArrowDown({ size = 13, color = 'currentColor' }: { size?: number; color?: string }) {
  return <svg width={size} height={size} fill="none" viewBox="0 0 24 24" stroke={color} strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 5v14m0 0l7-7m-7 7l-7-7" /></svg>;
}

function IconCalendar({ size = 13, color = 'currentColor' }: { size?: number; color?: string }) {
  return <svg width={size} height={size} fill="none" viewBox="0 0 24 24" stroke={color} strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" /></svg>;
}

function IconChevronRight({ size = 14, color = 'currentColor' }: { size?: number; color?: string }) {
  return <svg width={size} height={size} fill="none" viewBox="0 0 24 24" stroke={color} strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" /></svg>;
}

function IconInfo({ size = 14, color = 'currentColor' }: { size?: number; color?: string }) {
  return <svg width={size} height={size} fill="none" viewBox="0 0 24 24" stroke={color} strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" /></svg>;
}

// ─── Today Card ───────────────────────────────────────────────────────────────

function TodayCard({ day, today }: { day: DayResult; today: string }) {
  const isToday   = day.date === today;
  const isMinus   = day.status === 'minus';
  const isOver    = day.status === 'over';
  const isSuccess = day.status === 'success';
  const isPending = day.status === 'pending';

  // Progress bar berbasis net / effectiveTarget
  const barPct   = day.effectiveTarget > 0
    ? Math.min(100, Math.round((day.net / day.effectiveTarget) * 100))
    : 0;
  const barColor = isOver ? '#2563eb' : isSuccess ? '#16a34a' : isMinus ? '#ef4444' : '#cbd5e1';

  return (
    <div style={{ background:'#fff', borderRadius:22, padding:'20px 20px 18px', boxShadow:'0 4px 24px rgba(15,23,42,0.10)', border:'1px solid #f1f5f9' }}>
      {/* Header */}
      <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:16 }}>
        <div>
          <p style={{ color:'#64748b', fontSize:10, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.12em', margin:'0 0 4px' }}>
            {isToday ? 'Hari Ini' : formatDateShort(day.date)}
          </p>
          <p style={{ color:'#0f172a', fontSize:14, fontWeight:700, margin:0, letterSpacing:'-0.2px' }}>
            {formatDateFull(day.date)}
          </p>
        </div>
        <StatusPill status={day.status} />
      </div>

      {/* Target amount */}
      <div style={{ marginBottom:14 }}>
        <p style={{ color:'#94a3b8', fontSize:10, fontWeight:600, textTransform:'uppercase', letterSpacing:'0.1em', margin:'0 0 3px' }}>Target hari ini</p>
        <p style={{ fontFamily:'DM Mono,monospace', color:'#0f172a', fontSize:26, fontWeight:600, margin:0, letterSpacing:'-0.8px', lineHeight:1 }}>
          {formatIDR(day.effectiveTarget)}
        </p>
      </div>

      {/* Progress bar */}
      {!isPending && (
        <div style={{ marginBottom:16 }}>
          <div style={{ width:'100%', height:7, borderRadius:99, background:'#f1f5f9', overflow:'hidden' }}>
            <div style={{ height:'100%', borderRadius:99, width:`${barPct}%`, background:barColor, transition:'width 0.8s cubic-bezier(.4,0,.2,1)' }} />
          </div>
          <div style={{ display:'flex', justifyContent:'space-between', marginTop:5 }}>
            <span style={{ fontFamily:'DM Mono,monospace', fontSize:11, color:'#64748b', fontWeight:500 }}>
              {formatIDR(day.net)} net
            </span>
            <span style={{ fontFamily:'DM Mono,monospace', fontSize:11, color:'#94a3b8', fontWeight:500 }}>
              {barPct}%
            </span>
          </div>
        </div>
      )}

      {/* Breakdown rows */}
      <div style={{ borderTop:'1px dashed #f1f5f9', paddingTop:14, display:'flex', flexDirection:'column', gap:9 }}>

        {/* Base target */}
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <span style={{ fontSize:12, fontWeight:500, color:'#64748b' }}>Target dasar</span>
          <span style={{ fontFamily:'DM Mono,monospace', fontSize:13, fontWeight:600, color:'#334155' }}>{formatIDR(day.baseTarget)}</span>
        </div>

        {/* Carry minus */}
        {day.carryMinus > 0 && (
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
            <div style={{ display:'flex', alignItems:'center', gap:5 }}>
              <span style={{ fontSize:12, fontWeight:600, color:'#dc2626' }}>Carry minus</span>
              <IconInfo size={12} color="#dc2626" />
            </div>
            <span style={{ fontFamily:'DM Mono,monospace', fontSize:13, fontWeight:700, color:'#dc2626' }}>+{formatIDR(day.carryMinus)}</span>
          </div>
        )}

        {/* Income */}
        {!isPending && (
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
            <span style={{ fontSize:12, fontWeight:500, color:'#64748b' }}>Income masuk</span>
            <span style={{ fontFamily:'DM Mono,monospace', fontSize:13, fontWeight:700, color: day.income > 0 ? '#16a34a' : '#94a3b8' }}>{formatIDR(day.income)}</span>
          </div>
        )}

        {/* Expense */}
        {!isPending && day.expense > 0 && (
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
            <span style={{ fontSize:12, fontWeight:500, color:'#64748b' }}>Pengeluaran</span>
            <span style={{ fontFamily:'DM Mono,monospace', fontSize:13, fontWeight:700, color:'#dc2626' }}>−{formatIDR(day.expense)}</span>
          </div>
        )}

        {/* Net (selalu tampil jika ada expense) */}
        {!isPending && day.expense > 0 && (
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', background:'#f8fafc', borderRadius:9, padding:'7px 10px' }}>
            <span style={{ fontSize:12, fontWeight:700, color:'#334155' }}>Net hari ini</span>
            <span style={{ fontFamily:'DM Mono,monospace', fontSize:13, fontWeight:800, color: day.net >= 0 ? '#0f172a' : '#dc2626' }}>{formatIDR(day.net)}</span>
          </div>
        )}

        {/* Delta / selisih */}
        {!isPending && (
          <div style={{ borderTop:'1px solid #f1f5f9', paddingTop:9, display:'flex', justifyContent:'space-between', alignItems:'center' }}>
            <span style={{ fontSize:12, fontWeight:700, color:'#334155' }}>
              {isMinus ? 'Kekurangan' : isOver ? 'Kelebihan' : 'Selisih'}
            </span>
            <span style={{ fontFamily:'DM Mono,monospace', fontSize:14, fontWeight:800, color: isMinus ? '#dc2626' : '#16a34a' }}>
              {day.delta >= 0 ? '+' : ''}{formatIDR(day.delta)}
            </span>
          </div>
        )}
      </div>

      {/* Status banners */}
      {isMinus && isToday && (
        <div style={{ marginTop:13, background:'#fef2f2', borderRadius:12, padding:'10px 13px', display:'flex', alignItems:'flex-start', gap:8 }}>
          <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="#dc2626" strokeWidth={2.2} style={{ flexShrink:0, marginTop:1 }}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" /></svg>
          <p style={{ fontFamily:'DM Sans,sans-serif', color:'#dc2626', fontSize:12, fontWeight:600, margin:0, lineHeight:1.5 }}>
            {formatIDR(Math.abs(day.delta))} akan dibawa ke target besok.
          </p>
        </div>
      )}
      {isOver && isToday && (
        <div style={{ marginTop:13, background:'#eff6ff', borderRadius:12, padding:'10px 13px', display:'flex', alignItems:'center', gap:8 }}>
          <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="#2563eb" strokeWidth={2.2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          <p style={{ fontFamily:'DM Sans,sans-serif', color:'#1d4ed8', fontSize:12, fontWeight:600, margin:0 }}>Luar biasa! Kamu melebihi target hari ini.</p>
        </div>
      )}
      {isSuccess && isToday && (
        <div style={{ marginTop:13, background:'#f0fdf4', borderRadius:12, padding:'10px 13px', display:'flex', alignItems:'center', gap:8 }}>
          <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="#16a34a" strokeWidth={2.2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          <p style={{ fontFamily:'DM Sans,sans-serif', color:'#15803d', fontSize:12, fontWeight:600, margin:0 }}>Target hari ini tepat tercapai. Kerja bagus!</p>
        </div>
      )}
    </div>
  );
}

// ─── History Row ──────────────────────────────────────────────────────────────

function HistoryRow({ day, isToday }: { day: DayResult; isToday: boolean }) {
  const isMinus = day.status === 'minus';

  return (
    <div style={{ background:'#fff', borderRadius:16, padding:'13px 15px', border:'1px solid #f1f5f9', boxShadow:'0 1px 5px rgba(15,23,42,0.05)', display:'flex', alignItems:'center', gap:12 }}>
      {/* Date icon */}
      <div style={{ width:42, height:42, borderRadius:13, flexShrink:0, background: isToday ? '#eff6ff' : '#f8fafc', border: isToday ? '1.5px solid #bfdbfe' : '1.5px solid #f1f5f9', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center' }}>
        <span style={{ fontFamily:'DM Mono,monospace', fontSize:15, fontWeight:700, color: isToday ? '#1d4ed8' : '#0f172a', lineHeight:1 }}>
          {new Date(day.date).getDate()}
        </span>
        <span style={{ fontSize:9, fontWeight:700, color: isToday ? '#3b82f6' : '#94a3b8', textTransform:'uppercase', letterSpacing:'0.05em', marginTop:1 }}>
          {new Intl.DateTimeFormat('id-ID', { month:'short' }).format(new Date(day.date))}
        </span>
      </div>

      {/* Middle */}
      <div style={{ flex:1, minWidth:0 }}>
        <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:3 }}>
          <span style={{ fontFamily:'DM Sans,sans-serif', fontSize:12, fontWeight:700, color:'#0f172a' }}>
            {isToday ? 'Hari Ini' : new Intl.DateTimeFormat('id-ID', { weekday:'short' }).format(new Date(day.date))}
          </span>
          <StatusPill status={day.status} size="sm" />
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:4 }}>
          <span style={{ fontFamily:'DM Mono,monospace', fontSize:11, color:'#94a3b8', fontWeight:500 }}>
            Target {formatIDR(day.effectiveTarget)}
          </span>
          {day.carryMinus > 0 && (
            <span style={{ fontSize:9, fontWeight:700, color:'#dc2626', background:'#fef2f2', borderRadius:99, padding:'1px 6px' }}>+carry</span>
          )}
        </div>
      </div>

      {/* Net + delta — tampil net, bukan income mentah */}
      <div style={{ textAlign:'right', flexShrink:0 }}>
        <p style={{ fontFamily:'DM Mono,monospace', fontSize:13, fontWeight:700, margin:'0 0 2px', letterSpacing:'-0.3px', color: day.status === 'pending' ? '#94a3b8' : day.net !== 0 ? '#0f172a' : '#cbd5e1' }}>
          {day.status === 'pending' ? '—' : formatIDR(day.net)}
        </p>
        {day.status !== 'pending' && (
          <span style={{ fontFamily:'DM Mono,monospace', fontSize:10, fontWeight:700, color: isMinus ? '#dc2626' : '#16a34a', display:'flex', alignItems:'center', justifyContent:'flex-end', gap:2 }}>
            {isMinus ? <IconArrowDown size={10} color="#dc2626" /> : <IconArrowUp size={10} color="#16a34a" />}
            {day.delta >= 0 ? '+' : ''}{formatIDR(day.delta)}
          </span>
        )}
      </div>
    </div>
  );
}

// ─── Carry Badge ──────────────────────────────────────────────────────────────

function CarryBadge({ carry }: { carry: number }) {
  if (carry === 0) return null;
  return (
    <div style={{ display:'flex', alignItems:'center', gap:8, background:'#fef2f2', border:'1px solid #fecaca', borderRadius:13, padding:'10px 14px', marginBottom:12 }}>
      <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="#dc2626" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" /></svg>
      <div>
        <span style={{ fontFamily:'DM Sans,sans-serif', fontSize:12, fontWeight:700, color:'#dc2626' }}>Carry minus aktif:&nbsp;</span>
        <span style={{ fontFamily:'DM Mono,monospace', fontSize:12, fontWeight:700, color:'#dc2626' }}>{formatIDR(carry)}</span>
        <p style={{ fontFamily:'DM Sans,sans-serif', fontSize:11, color:'#ef4444', fontWeight:500, margin:'2px 0 0' }}>
          Kekurangan dari hari-hari sebelumnya yang belum tertutup.
        </p>
      </div>
    </div>
  );
}

// ─── Main Client Component ────────────────────────────────────────────────────

export default function DailyTargetClient({ data }: { data: DailyPageData }) {
  const { target, summary, today } = data;

  const todayResult  = getDayResult(summary, today);
  const pastDays     = summary.days
    .filter(d => d.date <= today && d.status !== 'pending')
    .slice(-7)
    .reverse();

  const successCount = summary.days.filter(d => d.status === 'success' || d.status === 'over').length;
  const totalPast    = summary.days.filter(d => d.status !== 'pending').length;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700;9..40,800&family=DM+Mono:wght@400;500;600&display=swap');
        .dt-root * { font-family:'DM Sans',sans-serif; box-sizing:border-box; }
        .dt-mono   { font-family:'DM Mono',monospace !important; }
        @keyframes fadeUp { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
        .fu  { animation:fadeUp 0.36s ease both; }
        .fu1 { animation-delay:0.05s; }
        .fu2 { animation-delay:0.11s; }
        .fu3 { animation-delay:0.17s; }
        .fu4 { animation-delay:0.23s; }
        .nav-btn { transition:transform 0.13s, box-shadow 0.13s; }
        .nav-btn:active { transform:scale(0.97); }
      `}</style>

      <div className="dt-root" style={{ paddingBottom:24 }}>

        {/* ══ HERO ══ */}
        <div style={{ background:'linear-gradient(148deg,#1e3a8a 0%,#1d4ed8 60%,#3b82f6 100%)', borderRadius:'0 0 30px 30px', padding:'20px 20px 48px', position:'relative', overflow:'hidden', marginBottom:'-22px' }}>
          <div style={{ position:'absolute',top:-44,right:-44,width:160,height:160,borderRadius:'50%',background:'rgba(255,255,255,0.05)',pointerEvents:'none' }} />
          <div style={{ position:'absolute',bottom:-28,left:-28,width:100,height:100,borderRadius:'50%',background:'rgba(255,255,255,0.04)',pointerEvents:'none' }} />

          <div className="fu">
            {/* Period badge */}
            <div style={{ display:'inline-flex', alignItems:'center', gap:5, background:'rgba(255,255,255,0.13)', border:'1px solid rgba(255,255,255,0.18)', borderRadius:99, padding:'4px 12px', marginBottom:12 }}>
              <IconCalendar size={11} color="rgba(255,255,255,0.70)" />
              <span style={{ color:'rgba(255,255,255,0.75)', fontSize:11, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.1em' }}>
                {PERIOD_LABEL[target.period_type] ?? target.period_type}
              </span>
            </div>

            <h1 style={{ color:'#fff', fontSize:21, fontWeight:800, margin:'0 0 4px', letterSpacing:'-0.4px', lineHeight:1.1 }}>Target Harian</h1>
            <p style={{ color:'rgba(255,255,255,0.50)', fontSize:11, fontWeight:500, margin:'0 0 18px' }}>
              {formatDateID(target.start_date)} — {formatDateID(target.end_date)}
            </p>

            {/* Quick stats */}
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:8 }}>
              {[
                { label:'Target/Hari',   value: formatIDR(summary.days[0]?.baseTarget ?? 0), mono:true },
                { label:'Hari Berhasil', value: `${successCount}/${totalPast}`,               mono:true },
                { label:'Carry Aktif',   value: formatIDR(summary.currentCarryMinus),         mono:true, warn: summary.currentCarryMinus > 0 },
              ].map((s) => (
                <div key={s.label} style={{ background:'rgba(255,255,255,0.10)', border:'1px solid rgba(255,255,255,0.13)', borderRadius:13, padding:'10px 10px 8px' }}>
                  <p style={{ color:'rgba(255,255,255,0.50)', fontSize:9, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.08em', margin:'0 0 4px', lineHeight:1 }}>{s.label}</p>
                  <p className="dt-mono" style={{ color: s.warn ? '#fca5a5' : '#fff', fontSize:11, fontWeight:700, margin:0, letterSpacing:'-0.3px', lineHeight:1, wordBreak:'break-all' }}>
                    {s.value}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ══ CONTENT ══ */}
        <div style={{ padding:'0 14px' }}>

          {/* Carry warning banner */}
          {summary.currentCarryMinus > 0 && (
            <div className="fu fu1" style={{ marginTop:26, marginBottom:0 }}>
              <CarryBadge carry={summary.currentCarryMinus} />
            </div>
          )}

          {/* Today card */}
          <div className="fu fu2" style={{ marginTop: summary.currentCarryMinus > 0 ? 0 : 26 }}>
            {todayResult ? (
              <TodayCard day={todayResult} today={today} />
            ) : (
              <div style={{ background:'#fff', borderRadius:20, padding:'24px 20px', textAlign:'center', border:'1px solid #f1f5f9', boxShadow:'0 2px 12px rgba(15,23,42,0.06)' }}>
                <p style={{ color:'#94a3b8', fontSize:13, fontWeight:600, margin:0 }}>Data hari ini belum tersedia.</p>
              </div>
            )}
          </div>

          {/* Riwayat 7 hari */}
          {pastDays.length > 1 && (
            <div className="fu fu3" style={{ marginTop:20 }}>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:10 }}>
                <p style={{ fontFamily:'DM Sans,sans-serif', fontSize:11, fontWeight:700, color:'#64748b', textTransform:'uppercase', letterSpacing:'0.12em', margin:0 }}>Riwayat 7 Hari</p>
                <a href="/records" style={{ display:'inline-flex', alignItems:'center', gap:3, fontSize:11, fontWeight:700, color:'#2563eb', textDecoration:'none' }}>
                  Semua <IconChevronRight size={11} color="#2563eb" />
                </a>
              </div>
              <div style={{ display:'flex', flexDirection:'column', gap:7 }}>
                {pastDays.map((day) => (
                  <div key={day.date} className="fu fu4">
                    <HistoryRow day={day} isToday={day.date === today} />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Nav buttons */}
          <div className="fu fu4" style={{ marginTop:16, display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
            <a href="/target" className="nav-btn" style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:6, height:46, borderRadius:14, textDecoration:'none', background:'#fff', border:'1.5px solid #e2e8f0', color:'#64748b', fontSize:12, fontWeight:700, fontFamily:'DM Sans,sans-serif' }}>
              <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" /></svg>
              Lihat Target
            </a>
            <a href="/records" className="nav-btn" style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:6, height:46, borderRadius:14, textDecoration:'none', background:'linear-gradient(135deg,#1e40af,#2563eb)', color:'#fff', fontSize:12, fontWeight:700, fontFamily:'DM Sans,sans-serif', boxShadow:'0 4px 14px rgba(37,99,235,0.22)' }}>
              <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25z" /></svg>
              Catatan
            </a>
          </div>

        </div>
      </div>
    </>
  );
}