// app/(app)/dashboard/page.tsx
// Server Component — semua fetch data terjadi di server sebelum HTML dikirim ke browser.

import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import { redirect } from 'next/navigation';
import {
  calculateDailyTargets,
  getDayResult,
} from '@/lib/finance/dailyTarget';
import DashboardClient from './DashboardClient';

function toDateString(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export default async function DashboardPage() {
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
  if (!user) redirect('/login?redirectTo=/dashboard');

  const today = toDateString(new Date());

  // ── Ambil target terbaru ──────────────────────────────────────────────────
  const { data: target } = await supabase
    .from('targets')
    .select('id, period_type, target_amount, start_date, end_date')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!target) redirect('/setup-target');

  // ── Fetch semua transaksi periode secara paralel ──────────────────────────
  const [incToday, expToday, allInc, allExp] = await Promise.all([
    supabase.from('transactions').select('amount')
      .eq('user_id', user.id).eq('type', 'income').eq('date', today),
    supabase.from('transactions').select('amount')
      .eq('user_id', user.id).eq('type', 'expense').eq('date', today),
    supabase.from('transactions').select('date, amount')
      .eq('user_id', user.id).eq('type', 'income')
      .gte('date', target.start_date).lte('date', target.end_date),
    supabase.from('transactions').select('date, amount')
      .eq('user_id', user.id).eq('type', 'expense')
      .gte('date', target.start_date).lte('date', target.end_date),
  ]);

  const todayIncome  = (incToday.data ?? []).reduce((s, t) => s + t.amount, 0);
  const todayExpense = (expToday.data ?? []).reduce((s, t) => s + t.amount, 0);

  // ── Gabungkan income + expense per hari → DayRecord[] ────────────────────
  const incomeMap  = new Map<string, number>();
  const expenseMap = new Map<string, number>();

  for (const tx of allInc.data ?? [])
    incomeMap.set(tx.date, (incomeMap.get(tx.date) ?? 0) + tx.amount);

  for (const tx of allExp.data ?? [])
    expenseMap.set(tx.date, (expenseMap.get(tx.date) ?? 0) + tx.amount);

  const allDates = new Set([...incomeMap.keys(), ...expenseMap.keys()]);
  const records  = Array.from(allDates, (date) => ({
    date,
    income:  incomeMap.get(date)  ?? 0,
    expense: expenseMap.get(date) ?? 0,
  }));

  // ── Kalkulasi dengan net per hari ─────────────────────────────────────────
  const summary   = calculateDailyTargets(
    {
      targetAmount: target.target_amount,
      startDate:    new Date(target.start_date),
      endDate:      new Date(target.end_date),
    },
    records,
  );
  const dayResult = getDayResult(summary, today);

  return (
    <DashboardClient
      userName={user.email?.split('@')[0] ?? 'Pengguna'}
      activeTarget={target}
      todayIncome={todayIncome}
      todayExpense={todayExpense}
      todayNet={todayIncome - todayExpense}
      todayBaseTarget={dayResult?.baseTarget        ?? 0}
      todayCarryMinus={dayResult?.carryMinus        ?? 0}
      todayEffectiveTarget={dayResult?.effectiveTarget ?? 0}
      todayStatus={dayResult?.status ?? null}
      percentage={summary.percentage}
      totalIncome={summary.totalIncome}
      totalExpense={summary.totalExpense}
      netIncome={summary.totalNet}
    />
  );
}