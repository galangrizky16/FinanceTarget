// app/(app)/daily-target/page.tsx
// Server Component — fetch target + semua transaksi (income & expense) di server.

import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import { redirect } from 'next/navigation';
import { calculateDailyTargets, type PeriodSummary } from '@/lib/finance/dailyTarget';
import DailyTargetClient from './DailyTargetClient';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface DailyPageData {
  target: {
    id: string;
    period_type: string;
    target_amount: number;
    start_date: string;
    end_date: string;
  };
  summary: PeriodSummary;
  today: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function toDateString(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

// ─── Server Component ─────────────────────────────────────────────────────────

export default async function DailyTargetPage() {
  const cookieStore = await cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: () => {},
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login?redirectTo=/daily-target');

  const today = toDateString(new Date());

  // ── Ambil target terbaru ──────────────────────────────────────────────────
  const { data: target } = await supabase
    .from('targets')
    .select('id, period_type, target_amount, start_date, end_date')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  // Belum ada target → middleware harusnya sudah handle, tapi guard di sini juga
  if (!target) redirect('/setup-target');

  // ── Fetch income + expense paralel, hanya sampai hari ini ─────────────────
  const queryEnd = today < target.end_date ? today : target.end_date;

  const [incomeRes, expenseRes] = await Promise.all([
    supabase
      .from('transactions')
      .select('date, amount')
      .eq('user_id', user.id)
      .eq('type', 'income')
      .gte('date', target.start_date)
      .lte('date', queryEnd),
    supabase
      .from('transactions')
      .select('date, amount')
      .eq('user_id', user.id)
      .eq('type', 'expense')
      .gte('date', target.start_date)
      .lte('date', queryEnd),
  ]);

  // ── Group per tanggal ─────────────────────────────────────────────────────
  const incomeMap = new Map<string, number>();
  for (const tx of incomeRes.data ?? []) {
    incomeMap.set(tx.date, (incomeMap.get(tx.date) ?? 0) + tx.amount);
  }

  const expenseMap = new Map<string, number>();
  for (const tx of expenseRes.data ?? []) {
    expenseMap.set(tx.date, (expenseMap.get(tx.date) ?? 0) + tx.amount);
  }

  // Merge semua tanggal yang punya income ATAU expense
  const allDates = new Set([...incomeMap.keys(), ...expenseMap.keys()]);
  const records  = Array.from(allDates, (date) => ({
    date,
    income:  incomeMap.get(date)  ?? 0,
    expense: expenseMap.get(date) ?? 0,
  }));

  // ── Kalkulasi summary ─────────────────────────────────────────────────────
  const summary = calculateDailyTargets(
    {
      targetAmount: target.target_amount,
      startDate:    new Date(target.start_date),
      endDate:      new Date(target.end_date),
    },
    records,
    new Date(today),
  );

  return (
    <DailyTargetClient
      data={{ target, summary, today }}
    />
  );
}