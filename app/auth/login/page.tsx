'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthContext';
import { ShieldCheck, AlertCircle, ArrowRight } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok && data.user) {
        login(data.user);
        if (data.user.role === 'ADMIN') {
          router.push('/admin');
        } else {
          router.push('/dashboard');
        }
        router.refresh();
      } else {
        setError(data.error || 'Invalid email or password.');
      }
    } catch (err: any) {
      setError(err.message || 'Network error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-5 d-flex align-items-center justify-content-center" style={{ minHeight: '75vh' }}>
      <div className="glass-card p-4 p-md-5 rounded-4 border shadow-sm w-100" style={{ maxWidth: '440px' }}>
        {/* Badge */}
        <div className="pill-badge mb-3">
          <ShieldCheck size={14} />
          Secure sign-in
        </div>

        <h1 className="fs-3 fw-bold text-dark mb-1">Welcome back</h1>
        <p className="text-secondary small mb-4">Access your dashboard and donations.</p>

        {error && (
          <div className="alert alert-danger py-2 small d-flex align-items-center gap-2 mb-3">
            <AlertCircle size={16} /> {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label small fw-semibold text-secondary">Email address</label>
            <input
              type="email"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="form-control form-control-saas"
            />
          </div>

          <div className="mb-4">
            <div className="d-flex align-items-center justify-content-between mb-1">
              <label className="form-label small fw-semibold text-secondary mb-0">Password</label>
              <a href="#" className="small text-muted text-decoration-none">
                Forgot?
              </a>
            </div>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="form-control form-control-saas"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-pill btn-pill-primary w-100 py-2.5 small justify-content-center shadow-sm"
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>

        <p className="text-muted small text-center mt-4 mb-0">
          No account?{' '}
          <Link href="/auth/register" className="fw-semibold text-primary text-decoration-none">
            Create one
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
