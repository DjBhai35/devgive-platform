'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from './AuthContext';
import { Search, Code2, Menu, X, Shield, LayoutDashboard, LogOut, User } from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/#projects?q=${encodeURIComponent(searchQuery.trim())}`);
      setMobileMenuOpen(false);
    }
  };

  return (
    <header className="glass-header">
      <div className="container py-2.5 d-flex align-items-center justify-content-between">
        {/* Brand & Desktop Links */}
        <div className="d-flex align-items-center gap-4">
          <Link href="/" className="d-flex align-items-center gap-2 text-decoration-none">
            <div
              className="d-flex align-items-center justify-content-center text-white rounded-3 shadow-sm"
              style={{
                width: '38px',
                height: '38px',
                background: 'linear-gradient(135deg, #0284c7 0%, #4f46e5 100%)',
              }}
            >
              <Code2 size={22} strokeWidth={2.5} />
            </div>
            <span
              className="fs-4 fw-bold"
              style={{
                background: 'linear-gradient(135deg, #0f172a 0%, #312e81 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                letterSpacing: '-0.5px',
              }}
            >
              DevGive
            </span>
          </Link>

          <nav className="d-none d-lg-flex align-items-center gap-3 ms-2">
            <Link href="/" className="text-secondary fw-semibold text-decoration-none small hover-text-primary px-2 py-1">
              Home
            </Link>
            <Link href="/#projects" className="text-secondary fw-semibold text-decoration-none small hover-text-primary px-2 py-1">
              Projects
            </Link>
            <Link href="/#how" className="text-secondary fw-semibold text-decoration-none small hover-text-primary px-2 py-1">
              How it works
            </Link>
          </nav>
        </div>

        {/* Search Bar & Actions */}
        <div className="d-flex align-items-center gap-2 gap-sm-3">
          {/* Search form */}
          <form onSubmit={handleSearch} className="d-none d-md-flex align-items-center">
            <div
              className="d-flex align-items-center px-3 py-1 bg-white rounded-pill border shadow-sm"
              style={{ minWidth: '220px' }}
            >
              <Search size={16} className="text-muted me-2" />
              <input
                type="text"
                placeholder="Search projects"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="border-0 bg-transparent small text-dark outline-none w-100"
                style={{ fontSize: '0.875rem', outline: 'none' }}
              />
              <button
                type="submit"
                className="btn btn-link p-0 text-decoration-none fw-bold small text-primary ms-1"
                style={{ fontSize: '0.8rem', whiteSpace: 'nowrap' }}
              >
                Search
              </button>
            </div>
          </form>

          {/* User authenticated actions */}
          {user ? (
            <div className="d-none d-sm-flex align-items-center gap-2">
              {user.role === 'ADMIN' && (
                <Link href="/admin" className="btn-pill btn-pill-dark small py-1 px-3" style={{ fontSize: '0.825rem' }}>
                  <Shield size={14} /> Admin
                </Link>
              )}
              <Link href="/dashboard" className="btn-pill btn-pill-primary small py-1.5 px-3.5" style={{ fontSize: '0.85rem' }}>
                <LayoutDashboard size={15} /> Dashboard
              </Link>
              <button
                onClick={logout}
                className="btn-pill btn-pill-cyan small py-1.5 px-3"
                style={{ fontSize: '0.85rem' }}
              >
                <LogOut size={15} /> Logout
              </button>
            </div>
          ) : (
            <div className="d-none d-sm-flex align-items-center gap-2">
              <Link href="/auth/login" className="btn-pill btn-pill-dark small py-1.5 px-3.5" style={{ fontSize: '0.875rem' }}>
                Sign in
              </Link>
              <Link href="/auth/register" className="btn-pill btn-pill-cyan small py-1.5 px-3.5" style={{ fontSize: '0.875rem' }}>
                Create account
              </Link>
            </div>
          )}

          {/* Mobile hamburger button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="btn btn-outline-secondary d-lg-none border-0 p-1.5 text-secondary"
            aria-label="Toggle navigation"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Slide-down Menu */}
      {mobileMenuOpen && (
        <div className="d-lg-none bg-white border-top px-3 py-3 shadow-sm animate-fadeIn">
          <form onSubmit={handleSearch} className="mb-3">
            <div className="d-flex align-items-center px-3 py-2 bg-light rounded-pill border">
              <Search size={16} className="text-muted me-2" />
              <input
                type="text"
                placeholder="Search projects"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="border-0 bg-transparent small text-dark outline-none w-100"
              />
              <button type="submit" className="btn btn-link p-0 text-decoration-none fw-bold small text-primary ms-1">
                Search
              </button>
            </div>
          </form>

          <div className="d-flex flex-column gap-2">
            <Link
              href="/"
              onClick={() => setMobileMenuOpen(false)}
              className="text-secondary fw-semibold text-decoration-none px-3 py-2 rounded-3 hover-bg-light"
            >
              Home
            </Link>
            <Link
              href="/#projects"
              onClick={() => setMobileMenuOpen(false)}
              className="text-secondary fw-semibold text-decoration-none px-3 py-2 rounded-3 hover-bg-light"
            >
              Projects
            </Link>
            <Link
              href="/#how"
              onClick={() => setMobileMenuOpen(false)}
              className="text-secondary fw-semibold text-decoration-none px-3 py-2 rounded-3 hover-bg-light"
            >
              How it works
            </Link>

            <div className="border-top pt-2 mt-2">
              {user ? (
                <div className="d-flex flex-column gap-2">
                  <div className="px-3 py-1 small text-muted">
                    Signed in as <strong className="text-dark">{user.name}</strong>
                  </div>
                  {user.role === 'ADMIN' && (
                    <Link
                      href="/admin"
                      onClick={() => setMobileMenuOpen(false)}
                      className="btn-pill btn-pill-dark w-100 justify-content-center"
                    >
                      <Shield size={16} /> Admin Panel
                    </Link>
                  )}
                  <Link
                    href="/dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                    className="btn-pill btn-pill-primary w-100 justify-content-center"
                  >
                    <LayoutDashboard size={16} /> Dashboard
                  </Link>
                  <button
                    onClick={() => {
                      logout();
                      setMobileMenuOpen(false);
                    }}
                    className="btn-pill btn-pill-cyan w-100 justify-content-center"
                  >
                    <LogOut size={16} /> Logout
                  </button>
                </div>
              ) : (
                <div className="d-flex flex-column gap-2">
                  <Link
                    href="/auth/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="btn-pill btn-pill-dark w-100 justify-content-center"
                  >
                    Sign in
                  </Link>
                  <Link
                    href="/auth/register"
                    onClick={() => setMobileMenuOpen(false)}
                    className="btn-pill btn-pill-cyan w-100 justify-content-center"
                  >
                    Create account
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
