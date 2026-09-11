'use client';

import { useState } from 'react';
import { useAuth } from './AuthProvider';

export default function PricingButton({ interval }: { interval: 'month' | 'year' }) {
  const { user, goPro } = useAuth();
  const [msg, setMsg] = useState('');
  const [busy, setBusy] = useState(false);

  const click = async () => {
    setMsg('');
    if (!user) { setMsg('请先在右上角登录，再订阅 Pro'); return; }
    setBusy(true);
    const e = await goPro(interval);
    if (e) setMsg(e);
    setBusy(false);
  };

  return (
    <div>
      <button className="btn btn-primary btn-lg" onClick={click} disabled={busy} style={{ width: '100%' }}>
        {busy ? '跳转中…' : '升级 Pro'}
      </button>
      {msg && <p className="notice" style={{ marginTop: 10 }}>{msg}</p>}
    </div>
  );
}
