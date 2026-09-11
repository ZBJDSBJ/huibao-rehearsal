'use client';

import { useState } from 'react';
import { useAuth } from './AuthProvider';

export default function AuthNav() {
  const { user, plan, loading, signIn, signUp, signOut } = useAuth();
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [pwd, setPwd] = useState('');
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);

  if (loading) return <span className="auth-loading">…</span>;

  const doLogin = async () => {
    if (!email || !pwd) { setErr('请输入邮箱和密码'); return; }
    setBusy(true); setErr('');
    const e = await signIn(email, pwd);
    if (e) setErr(e); else { setOpen(false); setPwd(''); }
    setBusy(false);
  };
  const doSignup = async () => {
    if (!email || pwd.length < 6) { setErr('密码至少 6 位'); return; }
    setBusy(true); setErr('');
    const e = await signUp(email, pwd);
    if (e) setErr(e); else { setOpen(false); setPwd(''); }
    setBusy(false);
  };

  return (
    <>
      {user ? (
        <div className="auth-user">
          <span className={`auth-plan ${plan === 'pro' ? 'pro' : ''}`}>{plan === 'pro' ? '⭐ Pro' : '免费版'}</span>
          <span className="auth-email" title={user.email}>{user.email}</span>
          {plan !== 'pro' && <a href="/pricing" className="auth-upgrade">升级</a>}
          <button className="auth-out" onClick={signOut}>退出</button>
        </div>
      ) : (
        <button className="nav-cta" onClick={() => setOpen(true)}>登录</button>
      )}

      {open && (
        <div className="modal-backdrop" onClick={() => setOpen(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setOpen(false)}>✕</button>
            <h3>登录 / 注册</h3>
            <p className="muted small" style={{ margin: '0 0 14px' }}>登录后历史云端同步，可订阅 Pro 解锁 AI 教练。</p>
            <input className="type-box" type="email" placeholder="邮箱" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
            <input className="type-box" type="password" placeholder="密码（至少 6 位）" value={pwd} onChange={(e) => setPwd(e.target.value)} style={{ marginTop: 10 }} autoComplete="current-password" />
            {err && <p className="notice" style={{ marginTop: 10 }}>{err}</p>}
            <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
              <button className="btn btn-primary" onClick={doLogin} disabled={busy}>登录</button>
              <button className="btn btn-ghost" onClick={doSignup} disabled={busy}>注册</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
