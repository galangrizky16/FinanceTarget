// app/(app)/account/profile/page.tsx
// Server Component dengan SSR

import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import { redirect } from 'next/navigation';
import ProfileClient from './ProfileClient';

export default async function ProfilePage() {
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

  // ── Auth Check ──────────────────────────────────────────────────────────
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login?redirectTo=/account/profile');

  // ── Fetch Profile ───────────────────────────────────────────────────────
  const { data: profile } = await supabase
    .from('profiles')
    .select('name')
    .eq('id', user.id)
    .maybeSingle();

  const profileData = {
    id: user.id,
    name: profile?.name || user.email?.split('@')[0] || '',
    email: user.email || '',
  };

  // ── Pass data ke Client Component ───────────────────────────────────────
  return <ProfileClient profileData={profileData} />;
}