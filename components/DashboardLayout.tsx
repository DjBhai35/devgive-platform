'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from './AuthContext';
import {
  LayoutDashboard,
  Heart,
  Download,
  Receipt,
  User,
  Send,
  Youtube,
  Shield,
} from 'lucide-react';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading dashboard...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container py-5 text-center">
        <div className="glass-card p-5 mx-auto rounded-4" style={{ maxWidth: '480px' }}>
          <h4 className="fw-bold text-dark mb-3">Authentication Required</h4>
          <p className="text-secondary small mb-4">Please sign in to access your personal dashboard.</p>
          <Link href="/auth/login" className="btn-pill btn-pill-primary px-4 py-2">
            Sign In Now
          </Link>
        </div>
      </div>
    );
  }

  const navLinks = [
    { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { label: 'Donations', href: '/dashboard/donations', icon: Receipt },
    { label: 'Downloads', href: '/dashboard/downloads', icon: Download },
    { label: 'Wishlist', href: '/dashboard/wishlist', icon: Heart },
    { label: 'Profile', href: '/dashboard/profile', icon: User },
  ];

  return (
    <div className="container py-4 py-md-5">
      <div className="row g-4">
        {/* Sidebar */}
        <div className="col-12 col-lg-3">
          <aside className="dashboard-sidebar">
            <div className="text-uppercase fw-bold text-muted px-3 mb-2" style={{ fontSize: '0.725rem', letterSpacing: '0.075em' }}>
              Menu
            </div>
            <nav className="mb-4">
              {navLinks.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`sidebar-link ${isActive ? 'active' : ''}`}
                  >
                    <Icon size={18} />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
              {user.role === 'ADMIN' && (
                <Link href="/admin" className="sidebar-link text-primary mt-2">
                  <Shield size={18} />
                  <span>Admin Panel</span>
                </Link>
              )}
            </nav>

            <div className="text-uppercase fw-bold text-muted px-3 mb-2 border-top pt-3" style={{ fontSize: '0.725rem', letterSpacing: '0.075em' }}>
              Contact Developer
            </div>
            <div className="d-flex flex-column gap-1">
              <a
                href="https://t.me/codetai"
                target="_blank"
                rel="noopener noreferrer"
                className="sidebar-link"
              >
                <div
                  className="d-flex align-items-center justify-content-center text-white rounded-circle"
                  style={{ width: '26px', height: '26px', background: '#0284c7' }}
                >
                  <Send size={13} style={{ transform: 'translateX(-1px)' }} />
                </div>
                <span>Telegram Support</span>
              </a>
              <a
                href="https://www.youtube.com/@Codetai"
                target="_blank"
                rel="noopener noreferrer"
                className="sidebar-link"
              >
                <div
                  className="d-flex align-items-center justify-content-center text-white rounded-circle"
                  style={{ width: '26px', height: '26px', background: '#dc2626' }}
                >
                  <Youtube size={14} />
                </div>
                <span>YouTube Tutorials</span>
              </a>
            </div>
          </aside>
        </div>

        {/* Main Content Area */}
        <div className="col-12 col-lg-9">{children}</div>
      </div>
    </div>
  );
}
