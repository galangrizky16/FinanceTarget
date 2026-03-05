// app/(app)/records/page.tsx
// Server Component — fetch transaksi di server, langsung render tanpa loading state.

import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import { redirect } from 'next/navigation';
import RecordsClient from './RecordsClient';

export interface Transaction {
  id: string;
  type: 'income' | 'expense';
  amount: number;
  category: string;
  note: string | null;
  date: string;
  created_at: string;
}

export default async function RecordsPage() {
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
  if (!user) redirect('/login?redirectTo=/records');

  const { data, error } = await supabase
    .from('transactions')
    .select('id, type, amount, category, note, date, created_at')
    .eq('user_id', user.id)
    .order('date',       { ascending: false })
    .order('created_at', { ascending: false });

  if (error) {
    // Tetap render UI kosong daripada crash — client bisa retry via FAB
    console.error('[RecordsPage]', error);
  }

  return (
    <RecordsClient
      userId={user.id}
      initialTransactions={(data ?? []) as Transaction[]}
    />
  );
}