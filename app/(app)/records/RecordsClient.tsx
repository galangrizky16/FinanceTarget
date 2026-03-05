'use client';

// app/(app)/records/RecordsClient.tsx
// Terima data awal dari Server Component — tidak ada loading state saat pertama render.
// Re-fetch hanya dilakukan setelah user tambah transaksi baru.

import { useCallback, useRef, useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import type { Transaction } from './page';

// ─── Types ────────────────────────────────────────────────────────────────────

type TxType = 'income' | 'expense';
type Filter = 'all' | 'income' | 'expense';

interface FormState {
  type: TxType;
  amount: string;
  category: string;
  note: string;
  date: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const INCOME_CATEGORIES  = ['Gaji', 'Freelance', 'Bisnis', 'Investasi', 'Hadiah', 'Lainnya'];
const EXPENSE_CATEGORIES = ['Makan', 'Transportasi', 'Belanja', 'Kesehatan', 'Hiburan', 'Tagihan', 'Pendidikan', 'Lainnya'];

const FILTER_LABELS: { value: Filter; label: string }[] = [
  { value: 'all',     label: 'Semua'  },
  { value: 'income',  label: 'Masuk'  },
  { value: 'expense', label: 'Keluar' },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function toDateString(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function formatIDR(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency', currency: 'IDR',
    minimumFractionDigits: 0, maximumFractionDigits: 0,
  }).format(amount);
}

function formatDateShort(dateStr: string): string {
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric', month: 'short', year: 'numeric',
  }).format(new Date(dateStr));
}

function groupByDate(txs: Transaction[]): { date: string; items: Transaction[] }[] {
  const map = new Map<string, Transaction[]>();
  for (const tx of txs) {
    const list = map.get(tx.date) ?? [];
    list.push(tx);
    map.set(tx.date, list);
  }
  return Array.from(map, ([date, items]) => ({ date, items }));
}

// ─── Icons ────────────────────────────────────────────────────────────────────

function IconArrowUp({ color = 'currentColor', size = 16 }: { color?: string; size?: number }) {
  return (
    <svg width={size} height={size} fill="none" viewBox="0 0 24 24" stroke={color} strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 19V5m0 0l-7 7m7-7l7 7" />
    </svg>
  );
}

function IconArrowDown({ color = 'currentColor', size = 16 }: { color?: string; size?: number }) {
  return (
    <svg width={size} height={size} fill="none" viewBox="0 0 24 24" stroke={color} strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 5v14m0 0l7-7m-7 7l-7-7" />
    </svg>
  );
}

function IconCheck({ size = 15 }: { size?: number }) {
  return (
    <svg width={size} height={size} fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth={2.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
    </svg>
  );
}

function IconClose({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}

function IconWarning({ size = 14, color = '#dc2626' }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} fill="none" viewBox="0 0 24 24" stroke={color} strokeWidth={2.2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
    </svg>
  );
}

function IconPlus({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size} fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth={2.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
    </svg>
  );
}

function FilterIcon({ value, active }: { value: Filter; active: boolean }) {
  const color = active ? '#fff' : '#94a3b8';
  if (value === 'income')
    return <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke={color} strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 19V5m0 0l-7 7m7-7l7 7" /></svg>;
  if (value === 'expense')
    return <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke={color} strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 5v14m0 0l7-7m-7 7l-7-7" /></svg>;
  return <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke={color} strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" /></svg>;
}

function CategoryIcon({ category, type }: { category: string; type: TxType }) {
  const color  = type === 'income' ? '#16a34a' : '#dc2626';
  const bg     = type === 'income' ? '#f0fdf4' : '#fff1f2';
  const stroke = 1.8;
  const icon = (() => {
    switch (category) {
      case 'Gaji':         return <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke={color} strokeWidth={stroke}><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" /></svg>;
      case 'Freelance':    return <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke={color} strokeWidth={stroke}><path strokeLinecap="round" strokeLinejoin="round" d="M9 17.25v1.007a3 3 0 01-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0115 18.257V17.25m6-12V15a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 15V5.25m18 0A2.25 2.25 0 0018.75 3H5.25A2.25 2.25 0 003 5.25m18 0V12a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 12V5.25" /></svg>;
      case 'Bisnis':       return <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke={color} strokeWidth={stroke}><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 21v-7.5a.75.75 0 01.75-.75h3a.75.75 0 01.75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349m-16.5 11.65V9.35m0 0a3.001 3.001 0 003.75-.615A2.993 2.993 0 009.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 002.25 1.016c.896 0 1.7-.393 2.25-1.016a3.001 3.001 0 003.75.614m-16.5 0a3.004 3.004 0 01-.621-4.72L4.318 3.44A1.5 1.5 0 015.378 3h13.243a1.5 1.5 0 011.06.44l1.19 1.189a3 3 0 01-.621 4.72m-13.5 8.65h3.75a.75.75 0 00.75-.75V13.5a.75.75 0 00-.75-.75H6.75a.75.75 0 00-.75.75v3.75c0 .415.336.75.75.75z" /></svg>;
      case 'Investasi':    return <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke={color} strokeWidth={stroke}><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" /></svg>;
      case 'Hadiah':       return <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke={color} strokeWidth={stroke}><path strokeLinecap="round" strokeLinejoin="round" d="M21 11.25v8.25a1.5 1.5 0 01-1.5 1.5H5.25a1.5 1.5 0 01-1.5-1.5v-8.25M12 4.875A2.625 2.625 0 1 09.375 7.5H12m0-2.625V7.5m0-2.625A2.625 2.625 0 1 14.625 7.5H12m0 0V21m-8.625-9.75h18c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125h-18c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" /></svg>;
      case 'Makan':        return <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke={color} strokeWidth={stroke}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8.25v-1.5m0 1.5c-1.355 0-2.697.056-4.024.166C6.845 8.51 6 9.473 6 10.608v2.513m6-4.87c1.355 0 2.697.055 4.024.165C17.155 8.51 18 9.473 18 10.608v2.513m-3-4.87v-1.5m-6 1.5v-1.5m12 9.75l-1.5.75a3.354 3.354 0 01-3 0 3.354 3.354 0 00-3 0 3.354 3.354 0 01-3 0L3 16.5m15-3.38a48.474 48.474 0 00-6-.37c-2.032 0-4.034.125-6 .37m12 0c.39.049.777.102 1.163.16 1.07.16 1.837 1.254 1.837 2.63v.5a2.5 2.5 0 01-2.5 2.5h-15a2.5 2.5 0 01-2.5-2.5v-.5c0-1.376.767-2.47 1.837-2.63A48.343 48.343 0 016 13.12" /></svg>;
      case 'Transportasi': return <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke={color} strokeWidth={stroke}><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" /></svg>;
      case 'Belanja':      return <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke={color} strokeWidth={stroke}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" /></svg>;
      case 'Kesehatan':    return <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke={color} strokeWidth={stroke}><path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" /></svg>;
      case 'Hiburan':      return <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke={color} strokeWidth={stroke}><path strokeLinecap="round" strokeLinejoin="round" d="M3.375 19.5h17.25m-17.25 0a1.125 1.125 0 01-1.125-1.125M3.375 19.5h1.5C5.496 19.5 6 18.996 6 18.375m-3.75.125V5.625c0-.621.504-1.125 1.125-1.125h17.25c.621 0 1.125.504 1.125 1.125v12.75c0 .621-.504 1.125-1.125 1.125m-17.25 0h17.25M9 10.5l3 3 3-3" /></svg>;
      case 'Tagihan':      return <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke={color} strokeWidth={stroke}><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" /></svg>;
      case 'Pendidikan':   return <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke={color} strokeWidth={stroke}><path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5" /></svg>;
      default:             return <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke={color} strokeWidth={stroke}><path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
    }
  })();
  return (
    <div style={{ width:40, height:40, borderRadius:12, background:bg, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
      {icon}
    </div>
  );
}

// ─── Empty State ──────────────────────────────────────────────────────────────

function EmptyState({ filter, onAdd }: { filter: Filter; onAdd: () => void }) {
  const config = {
    all:     { title:'Belum ada transaksi',  sub:'Mulai catat income dan expense harianmu.', icon:'#2563eb', bg:'#eff6ff' },
    income:  { title:'Belum ada pemasukan',  sub:'Belum ada transaksi masuk yang tercatat.', icon:'#16a34a', bg:'#f0fdf4' },
    expense: { title:'Belum ada pengeluaran', sub:'Belum ada transaksi keluar yang tercatat.', icon:'#dc2626', bg:'#fff1f2' },
  }[filter];
  return (
    <div style={{ display:'flex', flexDirection:'column', alignItems:'center', padding:'48px 24px 32px', textAlign:'center' }}>
      <div style={{ width:72, height:72, borderRadius:22, background:config.bg, display:'flex', alignItems:'center', justifyContent:'center', marginBottom:16 }}>
        {filter === 'income' ? (
          <svg width="34" height="34" fill="none" viewBox="0 0 24 24" stroke={config.icon} strokeWidth={1.6}><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" /></svg>
        ) : filter === 'expense' ? (
          <svg width="34" height="34" fill="none" viewBox="0 0 24 24" stroke={config.icon} strokeWidth={1.6}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" /></svg>
        ) : (
          <svg width="34" height="34" fill="none" viewBox="0 0 24 24" stroke={config.icon} strokeWidth={1.6}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25z" /></svg>
        )}
      </div>
      <p style={{ fontFamily:'DM Sans,sans-serif', fontSize:15, fontWeight:800, color:'#0f172a', margin:'0 0 6px', letterSpacing:'-0.2px' }}>{config.title}</p>
      <p style={{ fontFamily:'DM Sans,sans-serif', fontSize:13, fontWeight:500, color:'#94a3b8', margin:'0 0 20px', lineHeight:1.5 }}>{config.sub}</p>
      {filter === 'all' && (
        <button onClick={onAdd} style={{ display:'inline-flex', alignItems:'center', gap:7, padding:'10px 20px', borderRadius:12, border:'none', cursor:'pointer', background:'linear-gradient(135deg,#1e40af,#2563eb)', color:'#fff', fontSize:13, fontWeight:700, fontFamily:'DM Sans,sans-serif', boxShadow:'0 4px 14px rgba(37,99,235,0.25)' }}>
          <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth={2.8}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
          Tambah Transaksi
        </button>
      )}
    </div>
  );
}

// ─── Error Banner ─────────────────────────────────────────────────────────────

function ErrorBanner({ message }: { message: string }) {
  return (
    <div style={{ display:'flex', alignItems:'flex-start', gap:9, background:'#fef2f2', border:'1.5px solid #fecaca', borderRadius:13, padding:'11px 13px' }}>
      <span style={{ flexShrink:0, marginTop:1 }}><IconWarning size={15} /></span>
      <p style={{ fontFamily:'DM Sans,sans-serif', color:'#dc2626', fontSize:13, fontWeight:600, margin:0, lineHeight:1.4 }}>{message}</p>
    </div>
  );
}

// ─── Bottom Sheet ─────────────────────────────────────────────────────────────

function AddTransactionSheet({ open, onClose, onSuccess, userId }: {
  open: boolean; onClose: () => void; onSuccess: () => void; userId: string;
}) {
  const [form, setFormState] = useState<FormState>({
    type:'income', amount:'', category:'', note:'', date: toDateString(new Date()),
  });
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');
  const sheetRef              = useRef<HTMLDivElement>(null);

  // Reset saat dibuka
  const prevOpen = useRef(false);
  if (open !== prevOpen.current) {
    prevOpen.current = open;
    if (open) {
      setFormState({ type:'income', amount:'', category:'', note:'', date: toDateString(new Date()) });
      setError('');
    }
  }

  function handleBackdropClick(e: React.MouseEvent) {
    if (loading) return;
    if (sheetRef.current && !sheetRef.current.contains(e.target as Node)) onClose();
  }

  function setField<K extends keyof FormState>(key: K, value: FormState[K]) {
    if (loading) return;
    setError('');
    if (key === 'type') {
      setFormState((p) => ({ ...p, type: value as TxType, category: '' }));
    } else {
      setFormState((p) => ({ ...p, [key]: value }));
    }
  }

  const categories  = form.type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
  const isIncome    = form.type === 'income';
  const accentColor = isIncome ? '#16a34a' : '#dc2626';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const amount = Number(form.amount);
    if (!form.amount || isNaN(amount) || amount <= 0) { setError('Nominal harus diisi dan lebih dari 0.'); return; }
    if (!form.category)                               { setError('Pilih salah satu kategori terlebih dahulu.'); return; }
    if (!form.date)                                   { setError('Tanggal transaksi harus diisi.'); return; }

    setLoading(true);
    try {
      const { error: insertError } = await supabase.from('transactions').insert({
        user_id:  userId,
        type:     form.type,
        amount,
        category: form.category,
        note:     form.note.trim() || null,
        date:     form.date,
      });
      if (insertError) { setError('Gagal menyimpan transaksi. Periksa koneksi internet lalu coba lagi.'); return; }
      onSuccess();
    } catch {
      setError('Terjadi kesalahan tak terduga. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  const inputBase: React.CSSProperties = {
    width:'100%', boxSizing:'border-box', height:46, padding:'0 14px', borderRadius:12,
    border:'1.5px solid #e2e8f0', background:'#f8fafc',
    fontSize:14, fontWeight:600, color:'#0f172a',
    fontFamily:'DM Sans,sans-serif', outline:'none',
    transition:'border-color 0.15s, box-shadow 0.15s, background 0.15s',
    opacity: loading ? 0.6 : 1, pointerEvents: loading ? 'none' : 'auto',
  };
  const onFocusInput = (e: React.FocusEvent<HTMLInputElement>) => {
    if (loading) return;
    e.currentTarget.style.borderColor = '#2563eb';
    e.currentTarget.style.boxShadow   = '0 0 0 3px rgba(37,99,235,0.10)';
    e.currentTarget.style.background  = '#fff';
  };
  const onBlurInput = (e: React.FocusEvent<HTMLInputElement>) => {
    e.currentTarget.style.borderColor = '#e2e8f0';
    e.currentTarget.style.boxShadow   = 'none';
    e.currentTarget.style.background  = '#f8fafc';
  };

  return (
    <div onClick={handleBackdropClick} style={{ position:'fixed', inset:0, zIndex:60, background:'rgba(15,23,42,0.45)', backdropFilter:'blur(2px)', opacity: open ? 1 : 0, pointerEvents: open ? 'auto' : 'none', transition:'opacity 0.22s' }}>
      <div ref={sheetRef} onClick={(e) => e.stopPropagation()} style={{ position:'absolute', bottom:0, left:'50%', transform:`translateX(-50%) translateY(${open ? '0' : '100%'})`, width:'100%', maxWidth:420, background:'#fff', borderRadius:'24px 24px 0 0', boxShadow:'0 -8px 40px rgba(15,23,42,0.15)', transition:'transform 0.30s cubic-bezier(.32,1,.6,1)', maxHeight:'92dvh', overflowY:'auto', paddingBottom:'env(safe-area-inset-bottom, 16px)' }}>
        <div style={{ display:'flex', justifyContent:'center', padding:'12px 0 4px' }}>
          <div style={{ width:36, height:4, borderRadius:99, background:'#e2e8f0' }} />
        </div>
        <div style={{ padding:'8px 18px 24px' }}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:18 }}>
            <h2 style={{ fontFamily:'DM Sans,sans-serif', fontSize:17, fontWeight:800, color:'#0f172a', margin:0, letterSpacing:'-0.3px' }}>Tambah Transaksi</h2>
            <button type="button" onClick={onClose} disabled={loading} style={{ width:30, height:30, borderRadius:9, background:'#f1f5f9', border:'none', cursor: loading ? 'not-allowed' : 'pointer', display:'flex', alignItems:'center', justifyContent:'center', color:'#64748b', opacity: loading ? 0.4 : 1 }}>
              <IconClose />
            </button>
          </div>

          <form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap:16 }}>
            {/* Type toggle */}
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:6, background:'#f1f5f9', borderRadius:13, padding:4 }}>
              {(['income', 'expense'] as TxType[]).map((t) => {
                const active = form.type === t;
                return (
                  <button key={t} type="button" onClick={() => setField('type', t)} disabled={loading}
                    style={{ height:40, borderRadius:9, border:'none', cursor: loading ? 'not-allowed' : 'pointer', fontFamily:'DM Sans,sans-serif', fontSize:13, fontWeight:700, background: active ? '#fff' : 'transparent', color: active ? (t === 'income' ? '#16a34a' : '#dc2626') : '#94a3b8', boxShadow: active ? '0 1px 6px rgba(15,23,42,0.09)' : 'none', transition:'all 0.16s', display:'flex', alignItems:'center', justifyContent:'center', gap:6, opacity: loading ? 0.6 : 1 }}>
                    {t === 'income' ? <IconArrowUp color={active ? '#16a34a' : '#94a3b8'} size={13} /> : <IconArrowDown color={active ? '#dc2626' : '#94a3b8'} size={13} />}
                    {t === 'income' ? 'Masuk' : 'Keluar'}
                  </button>
                );
              })}
            </div>

            {/* Nominal */}
            <div>
              <label style={{ display:'block', fontFamily:'DM Sans,sans-serif', fontSize:10, fontWeight:700, color:'#64748b', textTransform:'uppercase', letterSpacing:'0.12em', marginBottom:7 }}>
                Nominal <span style={{ color:'#dc2626' }}>*</span>
              </label>
              <div style={{ position:'relative' }}>
                <span style={{ position:'absolute', left:14, top:'50%', transform:'translateY(-50%)', color:'#94a3b8', fontSize:14, fontWeight:700, fontFamily:'DM Mono,monospace', pointerEvents:'none', opacity: loading ? 0.5 : 1 }}>Rp</span>
                <input type="number" min="1" value={form.amount} onChange={(e) => setField('amount', e.target.value)} disabled={loading} placeholder="0" onFocus={onFocusInput} onBlur={onBlurInput} style={{ ...inputBase, paddingLeft:44, fontFamily:'DM Mono,monospace', fontSize:18, fontWeight:700 }} />
              </div>
              {Number(form.amount) > 0 && (
                <p style={{ fontFamily:'DM Mono,monospace', color:accentColor, fontSize:12, fontWeight:600, margin:'6px 0 0' }}>{formatIDR(Number(form.amount))}</p>
              )}
            </div>

            {/* Kategori */}
            <div>
              <label style={{ display:'block', fontFamily:'DM Sans,sans-serif', fontSize:10, fontWeight:700, color:'#64748b', textTransform:'uppercase', letterSpacing:'0.12em', marginBottom:8 }}>
                Kategori <span style={{ color:'#dc2626' }}>*</span>
              </label>
              <div style={{ display:'flex', flexWrap:'wrap', gap:7, opacity: loading ? 0.55 : 1, pointerEvents: loading ? 'none' : 'auto' }}>
                {categories.map((cat) => {
                  const active = form.category === cat;
                  return (
                    <button key={cat} type="button" onClick={() => { setFormState((p) => ({ ...p, category: cat })); setError(''); }} disabled={loading}
                      style={{ display:'inline-flex', alignItems:'center', gap:5, padding:'6px 11px', borderRadius:10, cursor:'pointer', fontFamily:'DM Sans,sans-serif', fontSize:12, fontWeight:700, border:`1.5px solid ${active ? accentColor : '#e2e8f0'}`, background: active ? (isIncome ? '#f0fdf4' : '#fef2f2') : '#f8fafc', color: active ? accentColor : '#64748b', transition:'all 0.13s' }}>
                      <CategoryIcon category={cat} type={form.type} />
                      {cat}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Catatan */}
            <div>
              <label style={{ display:'block', fontFamily:'DM Sans,sans-serif', fontSize:10, fontWeight:700, color:'#64748b', textTransform:'uppercase', letterSpacing:'0.12em', marginBottom:7 }}>
                Catatan <span style={{ color:'#cbd5e1', fontWeight:500, textTransform:'none', letterSpacing:0 }}>(opsional)</span>
              </label>
              <input type="text" value={form.note} onChange={(e) => setField('note', e.target.value)} disabled={loading} placeholder="Contoh: Gaji bulan Maret" onFocus={onFocusInput} onBlur={onBlurInput} style={inputBase} />
            </div>

            {/* Tanggal */}
            <div>
              <label style={{ display:'block', fontFamily:'DM Sans,sans-serif', fontSize:10, fontWeight:700, color:'#64748b', textTransform:'uppercase', letterSpacing:'0.12em', marginBottom:7 }}>
                Tanggal <span style={{ color:'#dc2626' }}>*</span>
              </label>
              <input type="date" value={form.date} onChange={(e) => setField('date', e.target.value)} disabled={loading} onFocus={onFocusInput} onBlur={onBlurInput} style={inputBase} />
            </div>

            {error && <ErrorBanner message={error} />}

            <button type="submit" disabled={loading}
              style={{ width:'100%', height:50, background: loading ? '#cbd5e1' : isIncome ? 'linear-gradient(135deg,#15803d,#16a34a)' : 'linear-gradient(135deg,#b91c1c,#dc2626)', color: loading ? '#94a3b8' : '#fff', fontSize:14, fontWeight:800, borderRadius:14, border:'none', cursor: loading ? 'not-allowed' : 'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:8, fontFamily:'DM Sans,sans-serif', letterSpacing:'-0.1px', boxShadow: loading ? 'none' : (isIncome ? '0 4px 16px rgba(22,163,74,0.28)' : '0 4px 16px rgba(220,38,38,0.28)'), transition:'background 0.2s, box-shadow 0.2s, color 0.2s' }}>
              {loading ? (
                <>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style={{ animation:'spin 0.8s linear infinite', flexShrink:0 }}>
                    <circle cx="12" cy="12" r="10" stroke="#94a3b8" strokeWidth="3" strokeOpacity="0.4" />
                    <path d="M12 2a10 10 0 0110 10" stroke="#64748b" strokeWidth="3" strokeLinecap="round" />
                  </svg>
                  Menyimpan...
                </>
              ) : (
                <><IconCheck size={15} />Simpan Transaksi</>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

// ─── Main Client Component ────────────────────────────────────────────────────

export default function RecordsClient({ userId, initialTransactions }: {
  userId: string;
  initialTransactions: Transaction[];
}) {
  const [transactions, setTransactions] = useState<Transaction[]>(initialTransactions);
  const [filter,       setFilter]       = useState<Filter>('all');
  const [sheetOpen,    setSheetOpen]    = useState(false);
  const [refetching,   setRefetching]   = useState(false);

  // Re-fetch hanya setelah user tambah transaksi — bukan saat pertama load
  const refetch = useCallback(async () => {
    setRefetching(true);
    try {
      const { data } = await supabase
        .from('transactions')
        .select('id, type, amount, category, note, date, created_at')
        .eq('user_id', userId)
        .order('date',       { ascending: false })
        .order('created_at', { ascending: false });
      if (data) setTransactions(data as Transaction[]);
    } finally {
      setRefetching(false);
    }
  }, [userId]);

  function handleSuccess() {
    setSheetOpen(false);
    refetch();
  }

  const filtered = filter === 'all' ? transactions : transactions.filter((tx) => tx.type === filter);
  const grouped  = groupByDate(filtered);

  const totalIncome  = transactions.filter((t) => t.type === 'income') .reduce((s, t) => s + t.amount, 0);
  const totalExpense = transactions.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700;9..40,800&family=DM+Mono:wght@400;500;600&display=swap');
        .rc-root * { font-family:'DM Sans',sans-serif; box-sizing:border-box; }
        .rc-mono   { font-family:'DM Mono',monospace !important; }
        @keyframes fadeUp  { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
        @keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
        @keyframes spin    { to{transform:rotate(360deg)} }
        .fu  { animation:fadeUp 0.32s ease both; }
        .fu1 { animation-delay:0.05s; }
        .fu2 { animation-delay:0.10s; }
        .fu3 { animation-delay:0.15s; }
        .chip-btn { transition:all 0.14s; }
        .chip-btn:active { transform:scale(0.96); }
        .tx-card { transition:background 0.10s; cursor:default; }
        .tx-card:active { background:#f8fafc !important; }
        .fab { transition:transform 0.14s, box-shadow 0.14s; }
        .fab:active { transform:scale(0.93) !important; }
        input[type=number]::-webkit-inner-spin-button,
        input[type=number]::-webkit-outer-spin-button { -webkit-appearance:none; }
        input[type=date]::-webkit-calendar-picker-indicator { opacity:0.45; cursor:pointer; }
        button:disabled { pointer-events:none; }
      `}</style>

      <div className="rc-root" style={{ paddingBottom:88 }}>

        {/* ══ HERO ══ */}
        <div style={{ background:'linear-gradient(148deg,#1e3a8a 0%,#1d4ed8 60%,#3b82f6 100%)', borderRadius:'0 0 28px 28px', padding:'20px 20px 36px', position:'relative', overflow:'hidden', marginBottom:'-18px' }}>
          <div style={{ position:'absolute',top:-40,right:-40,width:150,height:150,borderRadius:'50%',background:'rgba(255,255,255,0.05)',pointerEvents:'none' }} />
          <div style={{ position:'absolute',bottom:-20,left:-20,width:90,height:90,borderRadius:'50%',background:'rgba(255,255,255,0.04)',pointerEvents:'none' }} />

          <div className="fu">
            <h1 style={{ color:'#fff', fontSize:20, fontWeight:800, margin:'0 0 3px', letterSpacing:'-0.4px' }}>Catatan Keuangan</h1>
            <p style={{ color:'rgba(255,255,255,0.52)', fontSize:12, fontWeight:500, margin:0 }}>Semua transaksi income &amp; expense</p>
          </div>

          {/* Summary strip — langsung tampil, tidak perlu tunggu loading */}
          <div className="fu fu1" style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginTop:16 }}>
            <div style={{ background:'rgba(255,255,255,0.11)', borderRadius:14, border:'1px solid rgba(255,255,255,0.14)', padding:'11px 14px' }}>
              <div style={{ display:'flex', alignItems:'center', gap:5, marginBottom:4 }}>
                <IconArrowUp color="rgba(255,255,255,0.55)" size={11} />
                <p style={{ color:'rgba(255,255,255,0.55)', fontSize:10, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.1em', margin:0 }}>Total Masuk</p>
              </div>
              <p className="rc-mono" style={{ color:'#86efac', fontSize:15, fontWeight:600, margin:0, letterSpacing:'-0.4px', lineHeight:1 }}>
                {refetching ? '...' : formatIDR(totalIncome)}
              </p>
            </div>
            <div style={{ background:'rgba(255,255,255,0.11)', borderRadius:14, border:'1px solid rgba(255,255,255,0.14)', padding:'11px 14px' }}>
              <div style={{ display:'flex', alignItems:'center', gap:5, marginBottom:4 }}>
                <IconArrowDown color="rgba(255,255,255,0.55)" size={11} />
                <p style={{ color:'rgba(255,255,255,0.55)', fontSize:10, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.1em', margin:0 }}>Total Keluar</p>
              </div>
              <p className="rc-mono" style={{ color:'#fca5a5', fontSize:15, fontWeight:600, margin:0, letterSpacing:'-0.4px', lineHeight:1 }}>
                {refetching ? '...' : formatIDR(totalExpense)}
              </p>
            </div>
          </div>
        </div>

        {/* ══ CONTENT ══ */}
        <div style={{ padding:'0 14px' }}>

          {/* Filter chips */}
          <div className="fu fu2" style={{ display:'flex', gap:8, padding:'22px 0 12px', overflowX:'auto', scrollbarWidth:'none' }}>
            {FILTER_LABELS.map(({ value, label }) => {
              const active = filter === value;
              const count  = value === 'all' ? transactions.length : transactions.filter(t => t.type === value).length;
              return (
                <button key={value} className="chip-btn" onClick={() => setFilter(value)}
                  style={{ display:'inline-flex', alignItems:'center', gap:5, padding:'7px 15px', borderRadius:99, border:'none', cursor:'pointer', fontFamily:'DM Sans,sans-serif', fontSize:13, fontWeight:700, whiteSpace:'nowrap', background: active ? '#1d4ed8' : '#fff', color: active ? '#fff' : '#64748b', boxShadow: active ? '0 2px 10px rgba(37,99,235,0.22)' : '0 1px 4px rgba(15,23,42,0.08)' }}>
                  <FilterIcon value={value} active={active} />
                  {label}
                  <span style={{ background: active ? 'rgba(255,255,255,0.20)' : '#f1f5f9', color: active ? '#fff' : '#94a3b8', fontSize:10, fontWeight:700, borderRadius:99, padding:'1px 7px' }}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* List / empty */}
          {filtered.length === 0 ? (
            <EmptyState filter={filter} onAdd={() => setSheetOpen(true)} />
          ) : (
            <div className="fu fu3" style={{ display:'flex', flexDirection:'column', opacity: refetching ? 0.5 : 1, transition:'opacity 0.2s' }}>
              {grouped.map(({ date, items }) => {
                const net = items.reduce((s, t) => t.type === 'income' ? s + t.amount : s - t.amount, 0);
                return (
                  <div key={date} style={{ marginBottom:18 }}>
                    <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:8 }}>
                      <span style={{ fontSize:11, fontWeight:700, color:'#94a3b8', whiteSpace:'nowrap' }}>{formatDateShort(date)}</span>
                      <div style={{ flex:1, height:1, background:'#f1f5f9' }} />
                      <span className="rc-mono" style={{ fontSize:11, fontWeight:700, color: net >= 0 ? '#16a34a' : '#dc2626', whiteSpace:'nowrap' }}>
                        {net >= 0 ? '+' : ''}{formatIDR(net)}
                      </span>
                    </div>
                    <div style={{ display:'flex', flexDirection:'column', gap:7 }}>
                      {items.map((tx) => (
                        <div key={tx.id} className="tx-card" style={{ background:'#fff', borderRadius:16, padding:'13px 14px', border:'1px solid #f1f5f9', boxShadow:'0 1px 6px rgba(15,23,42,0.05)', display:'flex', alignItems:'center', gap:12 }}>
                          <CategoryIcon category={tx.category} type={tx.type} />
                          <div style={{ flex:1, minWidth:0 }}>
                            <p style={{ fontSize:13, fontWeight:700, color:'#0f172a', margin:'0 0 2px', lineHeight:1 }}>{tx.category}</p>
                            <p style={{ fontSize:11, fontWeight:500, color: tx.note ? '#94a3b8' : '#cbd5e1', margin:0, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis', fontStyle: tx.note ? 'normal' : 'italic' }}>
                              {tx.note ?? 'Tidak ada catatan'}
                            </p>
                          </div>
                          <div style={{ textAlign:'right', flexShrink:0 }}>
                            <p className="rc-mono" style={{ fontSize:14, fontWeight:700, margin:0, letterSpacing:'-0.3px', lineHeight:1, color: tx.type === 'income' ? '#16a34a' : '#dc2626' }}>
                              {tx.type === 'income' ? '+' : '−'}{formatIDR(tx.amount)}
                            </p>
                            <span style={{ display:'inline-flex', alignItems:'center', gap:3, marginTop:4, fontSize:9, fontWeight:700, letterSpacing:'0.05em', textTransform:'uppercase', color: tx.type === 'income' ? '#16a34a' : '#dc2626', background: tx.type === 'income' ? '#f0fdf4' : '#fff1f2', borderRadius:99, padding:'2px 7px' }}>
                              {tx.type === 'income' ? <IconArrowUp color="#16a34a" size={9} /> : <IconArrowDown color="#dc2626" size={9} />}
                              {tx.type === 'income' ? 'Masuk' : 'Keluar'}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* ══ FAB ══ */}
      <button onClick={() => setSheetOpen(true)} className="fab" aria-label="Tambah transaksi"
        style={{ position:'fixed', bottom:'calc(72px + env(safe-area-inset-bottom, 0px))', right:'calc(max(50% - 196px, 16px))', width:52, height:52, borderRadius:'50%', background:'linear-gradient(135deg,#1e40af,#2563eb)', border:'none', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'0 6px 24px rgba(37,99,235,0.35)', zIndex:50 }}>
        <IconPlus />
      </button>

      {/* ══ BOTTOM SHEET ══ */}
      <AddTransactionSheet
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        onSuccess={handleSuccess}
        userId={userId}
      />
    </>
  );
}