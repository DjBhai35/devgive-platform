'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from './AuthContext';
import {
  LayoutDashboard,
  FolderCode,
  Tags,
  Receipt,
  Download,
  Users,
  Settings,
  ShieldAlert,
  ArrowLeft,
  CheckCircle2,
} from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading admin panel...</span>
        </div>
      </div>
    );
  }

  if (!user || user.role !== 'ADMIN') {
    return (
      <div className="container py-5 text-center">
        <div className="glass-card p-5 mx-auto rounded-4" style={{ maxWidth: '480px' }}>
          <ShieldAlert size={48} className="text-danger mb-3 mx-auto" />
          <h4 className="fw-bold text-dark mb-2">Access Denied</h4>
          <p className="text-secondary small mb-4">
            You must be logged in as an administrator to access this area.
          </p>
          <Link href="/auth/login" className="btn-pill btn-pill-dark px-4 py-2 small">
            Sign in as Admin
          </Link>
        </div>
      </div>
    );
  }

  const adminNav = [
    { label: 'Overview', href: '/admin', icon: LayoutDashboard },
    { label: 'Projects', href: '/admin/projects', icon: FolderCode },
    { label: 'Categories', href: '/admin/categories', icon: Tags },
    { label: 'Transactions', href: '/admin/transactions', icon: Receipt },
    { label: 'Free Claims', href: '/admin/claims', icon: CheckCircle2 },
    { label: 'Downloads Log', href: '/admin/downloads', icon: Download },
    { label: 'Users', href: '/admin/users', icon: Users },
    { label: 'Settings', href: '/admin/settings', icon: Settings },
  ];

  return (
    <div className="container-fluid py-4 px-md-4">
      <div className="row g-4">
        {/* Admin Sidebar */}
        <div className="col-12 col-lg-3 col-xl-2">
          <div className="glass-card p-3 rounded-4 border shadow-sm">
            <div className="d-flex align-items-center justify-content-between px-2 mb-3">
              <span className="fw-bold fs-6 text-dark">Admin Console</span>
              <span className="badge bg-danger rounded-pill small">SUPERADMIN</span>
            </div>

            <nav className="d-flex flex-column gap-1 mb-4">
              {adminNav.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`sidebar-link ${isActive ? 'active' : ''}`}
                    style={{ fontSize: '0.875rem' }}
                  >
                    <Icon size={16} />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>

            <div className="border-top pt-3">
              <Link href="/dashboard" className="sidebar-link small text-secondary">
                <ArrowLeft size={16} /> Back to User Dashboard
              </Link>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="col-12 col-lg-9 col-xl-10">{children}</div>
      </div>
    </div>
  );
}
