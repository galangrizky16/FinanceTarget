// app/(app)/target/page.tsx
// Server Component — semua fetch dan kalkulasi di server.

import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import { redirect } from 'next/navigation';
import TargetClient from './TargetClient';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface TargetData {
  target: {
    id: string;
    period_type: string;
    target_amount: number;
    start_date: string;
    end_date: string;
  };
  totalIncome:     number;
  totalExpense:    number;
  totalNet:        number;
  todayIncome:     number;
  todayExpense:    number;
  todayNet:        number;
  percentage:      number;
  remaining:       number;
  totalDays:       number;
  baseDailyTarget: number;
  daysElapsed:     number;
  daysLeft:        number;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function toDateString(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function daysBetween(a: string, b: string): number {
  return Math.round((new Date(b).getTime() - new Date(a).getTime()) / 86_400_000) + 1;
}

// ─── Server Component ─────────────────────────────────────────────────────────

export default async function TargetPage() {
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
  if (!user) redirect('/login?redirectTo=/target');

  const today = toDateString(new Date());

  // ── Ambil target terbaru ──────────────────────────────────────────────────
  const { data: target } = await supabase
    .from('targets')
    .select('id, period_type, target_amount, start_date, end_date')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  // Belum ada target → tampilkan empty state di client
  if (!target) {
    return <TargetClient data={null} />;
  }

  // ── Fetch income + expense paralel ──────────────────────────────────────
  const periodEnd = target.end_date < today ? target.end_date : today;

  const [periodIncomeRes, periodExpenseRes, todayIncomeRes, todayExpenseRes] = await Promise.all([
    supabase
      .from('transactions').select('amount')
      .eq('user_id', user.id).eq('type', 'income')
      .gte('date', target.start_date).lte('date', periodEnd),
    supabase
      .from('transactions').select('amount')
      .eq('user_id', user.id).eq('type', 'expense')
      .gte('date', target.start_date).lte('date', periodEnd),
    supabase
      .from('transactions').select('amount')
      .eq('user_id', user.id).eq('type', 'income')
      .eq('date', today),
    supabase
      .from('transactions').select('amount')
      .eq('user_id', user.id).eq('type', 'expense')
      .eq('date', today),
  ]);

  const totalIncome  = (periodIncomeRes.data  ?? []).reduce((s, t) => s + t.amount, 0);
  const totalExpense = (periodExpenseRes.data ?? []).reduce((s, t) => s + t.amount, 0);
  const totalNet     = totalIncome - totalExpense;
  const todayIncome  = (todayIncomeRes.data   ?? []).reduce((s, t) => s + t.amount, 0);
  const todayExpense = (todayExpenseRes.data  ?? []).reduce((s, t) => s + t.amount, 0);
  const todayNet     = todayIncome - todayExpense;

  // ── Kalkulasi berbasis net ─────────────────────────────────────────────────
  const totalDays       = daysBetween(target.start_date, target.end_date);
  const baseDailyTarget = Math.round(target.target_amount / totalDays);
  const percentage      = Math.round(Math.max(0, (totalNet / target.target_amount) * 100 * 10)) / 10;
  const remaining       = Math.max(0, target.target_amount - totalNet);
  const cappedToday     = today > target.end_date ? target.end_date : today;
  const daysElapsed     = daysBetween(target.start_date, cappedToday);
  const daysLeft        = Math.max(0, daysBetween(cappedToday, target.end_date) - 1);

  const data: TargetData = {
    target,
    totalIncome,
    totalExpense,
    totalNet,
    todayIncome,
    todayExpense,
    todayNet,
    percentage,
    remaining,
    totalDays,
    baseDailyTarget,
    daysElapsed,
    daysLeft,
  };

  return <TargetClient data={data} />;
}