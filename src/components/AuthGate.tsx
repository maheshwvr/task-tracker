'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

type Props = { children: React.ReactNode };

export default function AuthGate({ children }: Props) {
  const [email, setEmail] = useState('');
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [sessionReady, setSessionReady] = useState(false);
  const [isAuthed, setIsAuthed] = useState(false);

  // On mount, check for a session and subscribe to changes
  useEffect(() => {
    let mounted = true;

    (async () => {
      const { data } = await supabase.auth.getSession();
      if (!mounted) return;
      setIsAuthed(!!data.session);
      setSessionReady(true);
    })();

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthed(!!session);
    });

    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  async function signInWithMagicLink(e: React.FormEvent) {
    e.preventDefault();
    setSending(true);
    setMessage(null);
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: typeof window !== 'undefined' ? window.location.origin : undefined,
      },
    });
    setSending(false);
    if (error) {
      setMessage(`Error: ${error.message}`);
    } else {
      setMessage('Check your email for a magic sign-in link.');
    }
  }

  async function signOut() {
    await supabase.auth.signOut();
  }

  if (!sessionReady) {
    return <p style={{ padding: 24, fontFamily: 'sans-serif' }}>Loading…</p>;
  }

  if (!isAuthed) {
    return (
      <section style={{ padding: 24, maxWidth: 420, fontFamily: 'sans-serif' }}>
        <h1>Task Tracker</h1>
        <p>Sign in with a magic link:</p>
        <form onSubmit={signInWithMagicLink} style={{ display: 'flex', gap: 8 }}>
          <input
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{ flex: 1 }}
          />
          <button disabled={sending} type="submit">
            {sending ? 'Sending…' : 'Send link'}
          </button>
        </form>
        {message && <p style={{ marginTop: 8 }}>{message}</p>}
      </section>
    );
  }

  // Signed in → show child app + a simple sign-out
  return (
    <div style={{ fontFamily: 'sans-serif' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', padding: 16 }}>
        <strong>Task Tracker</strong>
        <button onClick={signOut}>Sign out</button>
      </header>
      {children}
    </div>
  );
}
