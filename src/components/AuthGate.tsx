'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import ResetPasswordPage from '@/app/auth/callback/page';

type Props = { children: React.ReactNode };

export default function AuthGate({ children }: Props) {
  const [sessionReady, setSessionReady] = useState(false);
  const [isAuthed, setIsAuthed] = useState(false);

  // form state
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [sending, setSending] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const { data } = await supabase.auth.getSession();
      if (!mounted) return;
      setIsAuthed(!!data.session);
      setSessionReady(true);
    })();
    const { data: sub } = supabase.auth.onAuthStateChange((_evt, session) => {
      setIsAuthed(!!session);
    });
    return () => { mounted = false; sub.subscription.unsubscribe(); };
  }, []);

  async function handleSignUp(e: React.FormEvent) {
    e.preventDefault();
    setSending(true); setMsg(null);
    const { error } = await supabase.auth.signUp({ email, password });
    setSending(false);
    setMsg(error ? `Error: ${error.message}` :
      'Signed up! Please check your email.');
  }

  async function handleSignIn(e: React.FormEvent) {
    e.preventDefault();
    setSending(true); setMsg(null);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setSending(false);
    if (error) setMsg(`Error: ${error.message}`);
  }
  
    async function handleResetPassword(e?: React.FormEvent) {
    if (e) e.preventDefault();
    setSending(true);
    setMsg(null);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/callback`,
    });
    setSending(false);
    setMsg(error ? `Error: ${error.message}` : 'Password reset email sent. Check your inbox.');
    }


  async function signOut() { await supabase.auth.signOut(); }

  if (!sessionReady) return <p style={{ padding:24 }}>Loading…</p>;

  if (!isAuthed) {
    return (
      <section style={{ padding:24, maxWidth:420 }}>
        <h1>Task Tracker</h1>

        {/* Mode switch */}
        <div style={{ display:'flex', gap:8, margin:'8px 0' }}>
          <button onClick={() => setMode('signin')} disabled={mode==='signin'} style = {{ cursor: 'pointer' }}>Sign in</button>
          <button onClick={() => setMode('signup')} disabled={mode==='signup'} style = {{ cursor: 'pointer' }}>Sign up</button>  
          <button onClick={handleResetPassword} style={{ cursor: 'pointer' }}>Reset password</button>                
        </div>

        {/* Email/password form */}
        <form onSubmit={mode==='signin' ? handleSignIn : handleSignUp}
              style={{ display:'grid', gap:8 }}>
          <input type="email" placeholder="you@example.com"
                 value={email} onChange={e=>setEmail(e.target.value)} required />
          <input type="password" placeholder="Password"
                 value={password} onChange={e=>setPassword(e.target.value)} required />
          <button disabled={sending} type="submit" style = {{ cursor: 'pointer' }}>
            {sending ? 'Working…' : mode==='signin' ? 'Sign in' : 'Create account'}
          </button>
        </form>

        {/* Optional: magic link button can coexist */}
        <form onSubmit={async e => {
          e.preventDefault(); setSending(true); setMsg(null);
          const { error } = await supabase.auth.signInWithOtp({
            email, options:{ emailRedirectTo: window.location.origin }
          });
          setSending(false); setMsg(error ? `Error: ${error.message}` : 'Magic link sent!');
        }} style={{ marginTop:8 }}>
          <button type="submit" style = {{ cursor: 'pointer' }}>Send magic link instead</button>
        </form>

        {msg && <p style={{ marginTop:8 }}>{msg}</p>}
      </section>
    );
  }

  return (
    <div>
      <header style={{ display:'flex', justifyContent:'space-between', padding:16 }}>
        <strong>Task Tracker</strong>
        <button onClick={signOut} style = {{ cursor: 'pointer' }}>Sign out</button>
      </header>
      {children}
    </div>
  );
}
