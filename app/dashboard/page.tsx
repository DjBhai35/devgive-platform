'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import DashboardLayout from '@/components/DashboardLayout';
import { useAuth } from '@/components/AuthContext';
import {
  CheckCircle2,
  Clock,
  Download,
  Heart,
  Search,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';

interface UserStats {
  approved: number;
  pending: number;
  downloads: number;
  favorites: number;
}

interface Transaction {
  id: string;
  amount: number;
  currency: string;
  status: string;
  paymentMethod: string;
  createdAt: string;
  project: {
    id: string;
    title: string;
    slug: string;
    thumbnail: string | null;
  };
}

export default function DashboardOverviewPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<UserStats>({
    approved: 0,
    pending: 0,
    downloads: 0,
    favorites: 0,
  });
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/user/stats')
      .then((r) => r.json())
      .then((data) => {
        if (data.stats) setStats(data.stats);
        if (data.recentTransactions) setRecentTransactions(data.recentTransactions);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <DashboardLayout>
      {/* Header Greeting & Action */}
      <div className="d-flex flex-column flex-sm-row align-items-start align-items-sm-center justify-content-between gap-3 mb-4">
        <div>
          <h1 className="fs-3 fw-bold text-dark mb-1">
            Welcome back, {user?.username || user?.name || 'supporter'}
          </h1>
          <p className="text-secondary small mb-0">
            Track your donations, downloads, and favorite projects.
          </p>
        </div>

        <Link
          href="/#projects"
          className="btn-pill btn-pill-cyan px-4 py-2 small shadow-sm text-nowrap"
        >
          <Search size={16} /> Browse projects
        </Link>
      </div>

      {/* 4 Stat Cards */}
      <div className="row g-3 g-md-4 mb-4">
        {/* Approved */}
        <div className="col-6 col-md-3">
          <div className="stat-widget stat-widget-green h-100">
            <div className="d-flex align-items-center justify-content-between mb-2">
              <span className="text-uppercase fw-bold" style={{ fontSize: '0.725rem', color: '#047857' }}>
                Approved
              </span>
              <div
                className="d-flex align-items-center justify-content-center text-white rounded-circle shadow-2xs"
                style={{ width: '28px', height: '28px', background: '#10b981' }}
              >
                <CheckCircle2 size={16} />
              </div>
            </div>
            <div className="fs-3 fw-bold" style={{ color: '#065f46' }}>
              {stats.approved}
            </div>
          </div>
        </div>

        {/* Pending */}
        <div className="col-6 col-md-3">
          <div className="stat-widget stat-widget-amber h-100">
            <div className="d-flex align-items-center justify-content-between mb-2">
              <span className="text-uppercase fw-bold" style={{ fontSize: '0.725rem', color: '#b45309' }}>
                Pending
              </span>
              <div
                className="d-flex align-items-center justify-content-center text-white rounded-circle shadow-2xs"
                style={{ width: '28px', height: '28px', background: '#f59e0b' }}
              >
                <Clock size={16} />
              </div>
            </div>
            <div className="fs-3 fw-bold" style={{ color: '#92400e' }}>
              {stats.pending}
            </div>
          </div>
        </div>

        {/* Downloads */}
        <div className="col-6 col-md-3">
          <div className="stat-widget stat-widget-blue h-100">
            <div className="d-flex align-items-center justify-content-between mb-2">
              <span className="text-uppercase fw-bold" style={{ fontSize: '0.725rem', color: '#1d4ed8' }}>
                Downloads
              </span>
              <div
                className="d-flex align-items-center justify-content-center text-white rounded-circle shadow-2xs"
                style={{ width: '28px', height: '28px', background: '#3b82f6' }}
              >
                <Download size={16} />
              </div>
            </div>
            <div className="fs-3 fw-bold" style={{ color: '#1e40af' }}>
              {stats.downloads}
            </div>
          </div>
        </div>

        {/* Favorites */}
        <div className="col-6 col-md-3">
          <div className="stat-widget stat-widget-purple h-100">
            <div className="d-flex align-items-center justify-content-between mb-2">
              <span className="text-uppercase fw-bold" style={{ fontSize: '0.725rem', color: '#7e22ce' }}>
                Favorites
              </span>
              <div
                className="d-flex align-items-center justify-content-center text-white rounded-circle shadow-2xs"
                style={{ width: '28px', height: '28px', background: '#a855f7' }}
              >
                <Heart size={16} />
              </div>
            </div>
            <div className="fs-3 fw-bold" style={{ color: '#6b21a8' }}>
              {stats.favorites}
            </div>
          </div>
        </div>
      </div>

      {/* Recent Transactions Section */}
      <section className="glass-card p-4 rounded-4 border shadow-sm">
        <div className="d-flex align-items-center justify-content-between mb-3">
          <div>
            <h2 className="fs-5 fw-bold text-dark mb-0">Recent transactions</h2>
            <span className="text-muted small">Your latest 5 donations</span>
          </div>
          <Link
            href="/dashboard/donations"
            className="text-decoration-none fw-semibold small text-primary d-flex align-items-center gap-1"
          >
            View all <ArrowRight size={14} />
          </Link>
        </div>

        {loading ? (
          <div className="text-center py-4">
            <div className="spinner-border spinner-border-sm text-primary" role="status"></div>
          </div>
        ) : recentTransactions.length === 0 ? (
          /* Empty state matching the reference screenshot */
          <div className="text-center py-5">
            <div className="d-inline-flex align-items-center justify-content-center text-muted mb-3">
              <Heart size={48} strokeWidth={1.5} className="text-secondary opacity-50" />
            </div>
            <p className="text-secondary small mb-3">
              No transactions yet. Start donating to projects!
            </p>
            <Link href="/#projects" className="btn-pill btn-pill-outline small py-1.5 px-3">
              Explore Projects
            </Link>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr className="small text-muted">
                  <th>Project</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th className="text-end">Action</th>
                </tr>
              </thead>
              <tbody>
                {recentTransactions.map((tx) => (
                  <tr key={tx.id} className="small">
                    <td>
                      <span className="fw-semibold text-dark">{tx.project.title}</span>
                    </td>
                    <td className="fw-bold text-dark">
                      ${tx.amount.toFixed(2)} {tx.currency}
                    </td>
                    <td>
                      <span
                        className={`badge rounded-pill px-2.5 py-1 ${
                          tx.status === 'APPROVED'
                            ? 'bg-success-subtle text-success'
                            : tx.status === 'REJECTED'
                            ? 'bg-danger-subtle text-danger'
                            : 'bg-warning-subtle text-warning'
                        }`}
                      >
                        {tx.status}
                      </span>
                    </td>
                    <td className="text-muted">
                      {new Date(tx.createdAt).toLocaleDateString()}
                    </td>
                    <td className="text-end">
                      <Link
                        href={`/project/${tx.project.slug}`}
                        className="btn btn-sm btn-outline-secondary rounded-pill py-1 px-2.5"
                      >
                        <ExternalLink size={13} />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </DashboardLayout>
  );
}
