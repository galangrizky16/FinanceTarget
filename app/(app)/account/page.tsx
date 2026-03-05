// app/(app)/account/page.tsx
// Server Component dengan SSR untuk performa optimal

import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import { redirect } from 'next/navigation';
import AccountClient from './AccountClient';

// ─── Helpers ──────────────────────────────────────────────────────────────

function getInitials(name: string): string {
  if (!name) return 'U';
  
  // Coba split by space dulu
  const words = name.trim().split(/\s+/);
  
  if (words.length > 1) {
    // Jika ada spasi, ambil huruf pertama dari setiap kata
    // Contoh: "Rizky Galang" → "RG"
    return words
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }
  
  // Jika hanya satu kata, cek camelCase
  // Contoh: "RizkyGalang" → "RG", "rizkygalang" → "RG"
  const singleWord = words[0];
  const uppercaseLetters = singleWord.match(/[A-Z]/g);
  
  if (uppercaseLetters && uppercaseLetters.length >= 2) {
    // Ada camelCase, ambil 2 huruf kapital pertama
    return uppercaseLetters.slice(0, 2).join('');
  }
  
  // Fallback: ambil 2 huruf pertama
  // Contoh: "rizkygalang" → "RI"
  return singleWord.slice(0, 2).toUpperCase();
}

// ─── Server Component ─────────────────────────────────────────────────────

export default async function AccountPage() {
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
  if (!user) redirect('/login?redirectTo=/account');

  // ── Fetch Profile ───────────────────────────────────────────────────────
  const { data: profile } = await supabase
    .from('profiles')
    .select('name')
    .eq('id', user.id)
    .maybeSingle();

  const name = profile?.name || user.email?.split('@')[0] || 'User';
  const email = user.email || '';
  const initials = getInitials(name);

  // ── Pass data ke Client Component ───────────────────────────────────────
  return (
    <AccountClient
      name={name}
      email={email}
      initials={initials}
    />
  );
}