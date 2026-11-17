'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Lock } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useLang } from '@/components/LangContext';
import LangToggle from '@/components/LangToggle';

export default function AdminLogin() {
  const router = useRouter();
  const { t } = useLang();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setErr(''); setBusy(true);
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) { setBusy(false); return setErr(t('lg.invalid')); }
    const { data: row } = await supabase.from('admins').select('user_id').eq('user_id', data.user.id).maybeSingle();
    if (!row) { await supabase.auth.signOut(); setBusy(false); return setErr(t('lg.noaccess')); }
    router.push('/admin');
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-teal-light px-4">
      <form onSubmit={submit} className="relative w-full max-w-sm space-y-4 rounded-2xl bg-white p-8 shadow-lg">
        <LangToggle className="absolute right-3 top-3 border-teal text-teal" />
        <div className="text-center">
          <Lock className="mx-auto text-brand" size={36} />
          <h1 className="mt-2 text-xl font-bold text-teal-dark">{t('lg.title')}</h1>
          <p className="text-sm text-gray-500">{t('lg.sub')}</p>
        </div>
        <div><label className="label">{t('lg.email')}</label><input type="email" required className="input" value={email} onChange={(e) => setEmail(e.target.value)} /></div>
        <div><label className="label">{t('lg.password')}</label><input type="password" required className="input" value={password} onChange={(e) => setPassword(e.target.value)} /></div>
        {err && <p className="rounded bg-red-50 p-2 text-sm text-red-600">{err}</p>}
        <button disabled={busy} className="w-full rounded-lg bg-brand py-2.5 font-bold text-white hover:bg-brand-dark disabled:opacity-60">{busy ? t('lg.signing') : t('nav.signin')}</button>
      </form>
    </div>
  );
}
