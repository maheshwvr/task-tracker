'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import Button from '@/components/Button';

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

  if (!sessionReady) return (
    <div className="app-container">
      <div className="content-wrapper">
        <p style={{ textAlign: 'center', fontSize: '1.1rem' }}>Loading…</p>
      </div>
    </div>
  );

  if (!isAuthed) {
    return (
      <div className="app-container">
        <main className="content-wrapper centered-auth">
          <div className="auth-form-container">
            <h1 className="heading-primary">Be Productive.</h1>

          {/* Mode switch */}
          <div style={{ display:'flex', gap:'0.5rem', margin:'1.5rem 0', justifyContent: 'center' }}>
            <Button 
              label="Sign in" 
              onClick={() => setMode('signin')} 
              variant={mode === 'signin' ? 'primary' : 'secondary'}
              size="small"
            />
            <Button 
              label="Sign up" 
              onClick={() => setMode('signup')} 
              variant={mode === 'signup' ? 'primary' : 'secondary'}
              size="small"
            />
          </div>

          {/* Email/password form */}
          <form onSubmit={mode==='signin' ? handleSignIn : handleSignUp}
                style={{ display:'grid', gap:'1rem', marginBottom: '1rem' }}>
            <input 
              type="email" 
              placeholder="you@example.com"
              value={email} 
              onChange={e=>setEmail(e.target.value)} 
              required 
              className="form-input"
            />
            <input 
              type="password" 
              placeholder="Password"
              value={password} 
              onChange={e=>setPassword(e.target.value)} 
              required 
              className="form-input"
            />
            <Button 
              label={sending ? 'Working…' : mode==='signin' ? 'Sign in' : 'Create account'}
              disabled={sending} 
              type="submit"
              size="large"
            />
          </form>

          {/* Additional options */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', alignItems: 'center' }}>
            <Button 
              label="Reset password"
              onClick={handleResetPassword}
              variant="secondary"
              size="small"
            />
            
            <form onSubmit={async e => {
              e.preventDefault(); setSending(true); setMsg(null);
              const { error } = await supabase.auth.signInWithOtp({
                email, options:{ emailRedirectTo: window.location.origin }
              });
              setSending(false); setMsg(error ? `Error: ${error.message}` : 'Magic link sent!');
            }}>
              <Button 
                label="Send magic link instead"
                type="submit"
                variant="secondary"
                size="small"
              />
            </form>
          </div>

          {msg && (
            <div style={{ 
              marginTop:'1.5rem', 
              padding: '1rem',
              backgroundColor: 'var(--background)',
              border: '1px solid var(--border)',
              borderRadius: '8px',
              textAlign: 'center'
            }}>
              {msg}
            </div>
          )}
          </div>
        </main>
        
        {/* Footer */}
        <footer className="page-footer">
          <div className="footer-content">
            Be Productive. A task tracker by Mahesh Maniam.
          </div>
        </footer>
      </div>
    );
  }

  return (
    <div className="app-container">
      <header className="sticky-header" style={{ 
        display:'flex', 
        justifyContent:'space-between', 
        alignItems: 'center',
        padding:'1rem 2rem'
      }}>
        <h2 className="heading-secondary" style={{ 
          margin: 0, 
          fontFamily: 'var(--font-dancing-script), cursive',
          fontSize: '2rem'
        }}>Be Productive.</h2>
        <Button 
          label="Sign out"
          onClick={signOut}
          variant="secondary"
          size="small"
        />
      </header>
      
      <main style={{ flex: 1 }}>
        {children}
      </main>
      
      {/* Footer */}
      <footer className="page-footer">
        <div className="footer-content">
          Be Productive. A task tracker by Mahesh Maniam.
        </div>
      </footer>
    </div>
  );
}
