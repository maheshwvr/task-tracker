'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import Button from '@/components/Button';

export default function ResetPasswordPage() {
  const [ready, setReady] = useState(false);
  const [pwd, setPwd] = useState('');
  const [msg, setMsg] = useState<string | null>(null);
  const [sending, setSending] = useState(false);

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
    setSending(true);
    const { error } = await supabase.auth.updateUser({ password: pwd });
    setSending(false);
    setMsg(error ? `Error: ${error.message}` : 'Password updated. You can close this tab.');
  }

  if (!ready) {
    return (
      <div className="app-container">
        <div className="content-wrapper">
          <p style={{ textAlign: 'center', fontSize: '1.1rem' }}>Loading…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="app-container">
      <main className="content-wrapper centered-auth">
        <div className="auth-form-container">
          <h1 className="heading-primary">Reset Password</h1>
          
          <form onSubmit={updatePwd} style={{ display: 'grid', gap: '1rem', marginBottom: '1rem' }}>
            <input 
              type="password" 
              placeholder="Enter your new password"
              value={pwd} 
              onChange={e => setPwd(e.target.value)} 
              required 
              className="form-input"
            />
            <Button 
              label={sending ? 'Updating…' : 'Update password'}
              disabled={sending} 
              type="submit"
              size="large"
            />
          </form>
          
          {msg && (
            <p style={{ 
              textAlign: 'center', 
              marginTop: '1rem',
              color: msg.includes('Error') ? '#ef4444' : '#10b981',
              fontSize: '0.875rem'
            }}>
              {msg}
            </p>
          )}
        </div>
      </main>
    </div>
  );
}
