'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthContext';
import { Sparkles, AlertCircle } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const { login } = useAuth();

  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, username, email, password }),
      });

      const data = await res.json();

      if (res.ok && data.user) {
        login(data.user);
        router.push('/dashboard');
        router.refresh();
      } else {
        setError(data.error || 'Failed to create account.');
      }
    } catch (err: any) {
      setError(err.message || 'Network error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-5 d-flex align-items-center justify-content-center" style={{ minHeight: '80vh' }}>
      <div className="glass-card p-4 p-md-5 rounded-4 border shadow-sm w-100" style={{ maxWidth: '460px' }}>
        {/* Badge */}
        <div className="pill-badge mb-3">
          <Sparkles size={14} />
          Supporter & Creator Access
        </div>

        <h1 className="fs-3 fw-bold text-dark mb-1">Create account</h1>
        <p className="text-secondary small mb-4">
          Join DevGive to claim open source repositories & support projects.
        </p>

        {error && (
          <div className="alert alert-danger py-2 small d-flex align-items-center gap-2 mb-3">
            <AlertCircle size={16} /> {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label small fw-semibold text-secondary">Full Name</label>
            <input
              type="text"
              placeholder="Dilshad Bhai"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="form-control form-control-saas"
            />
          </div>

          <div className="mb-3">
            <label className="form-label small fw-semibold text-secondary">Username</label>
            <input
              type="text"
              placeholder="djbhai"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="form-control form-control-saas"
            />
          </div>

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

          <div className="row g-2 mb-4">
            <div className="col-12 col-sm-6">
              <label className="form-label small fw-semibold text-secondary">Password</label>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="form-control form-control-saas"
              />
            </div>
            <div className="col-12 col-sm-6">
              <label className="form-label small fw-semibold text-secondary">Confirm</label>
              <input
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="form-control form-control-saas"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-pill btn-pill-cyan w-100 py-2.5 small justify-content-center shadow-sm"
          >
            {loading ? 'Creating account...' : 'Create account'}
          </button>
        </form>

        <p className="text-muted small text-center mt-4 mb-0">
          Already registered?{' '}
          <Link href="/auth/login" className="fw-semibold text-primary text-decoration-none">
            Sign in
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
