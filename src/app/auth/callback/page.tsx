'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

export default function ResetPasswordPage() {
  const [ready, setReady] = useState(false);
  const [pwd, setPwd] = useState('');
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    // When user lands here from email, Supabase sets a recovery session
    (async () => {
      const { data } = await supabase.auth.getSession();
      setReady(true);
      if (!data.session) setMsg('No active password reset session.');
    })();
  }, []);

  async function updatePwd(e: React.FormEvent) {
    e.preventDefault();
    const { error } = await supabase.auth.updateUser({ password: pwd });
    setMsg(error ? `Error: ${error.message}` : 'Password updated. You can close this tab.');
  }

  if (!ready) return <p>Loading…</p>;
  return (
    <section style={{ padding:24 }}>
      <h2>Set a new password</h2>
      <form onSubmit={updatePwd} style={{ display:'grid', gap:8, maxWidth:320 }}>
        <input type="password" value={pwd} onChange={e=>setPwd(e.target.value)} required />
        <button type="submit" style={{ cursor: 'pointer' }}>Update password</button>
      </form>
      {msg && <p style={{ marginTop:8 }}>{msg}</p>}
    </section>
  );
}
