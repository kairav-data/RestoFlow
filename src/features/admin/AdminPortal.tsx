'use client';

import React, { useEffect, useState } from 'react';
import { AdminLogin } from './components/AdminLogin';
import { AdminApp } from './components/AdminApp';
import { hasAdminSession } from './services/adminAuth';

/** Entry point for /admin: platform administrators only. */
export const AdminPortal: React.FC = () => {
  const [state, setState] = useState<'checking' | 'signed-out' | 'signed-in'>('checking');

  useEffect(() => {
    hasAdminSession().then((ok) => setState(ok ? 'signed-in' : 'signed-out'));
  }, []);

  if (state === 'checking') return <div className="min-h-screen bg-slate-50" aria-busy="true" />;
  if (state === 'signed-out') return <AdminLogin onSignedIn={() => setState('signed-in')} />;
  return <AdminApp onSignOut={() => setState('signed-out')} />;
};
