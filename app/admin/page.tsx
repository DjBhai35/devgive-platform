'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import AdminLayout from '@/components/AdminLayout';
import {
  FolderCode,
  Users,
  Receipt,
  Download,
  DollarSign,
  Plus,
  Check,
  X,
  ExternalLink,
} from 'lucide-react';

export default function AdminOverviewPage() {
  const [stats, setStats] = useState({
    projects: 0,
    users: 0,
    orders: 0,
    downloads: 0,
    revenue: 0,
  });

  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOverview = async () => {
    try {
      const [statsRes, txRes, usersRes] = await Promise.all([
        fetch('/api/stats'),
        fetch('/api/admin/transactions'),
        fetch('/api/admin/users'),
      ]);

      const statsData = await statsRes.json();
      const txData = await txRes.json();
      const usersData = await usersRes.json();

      let totalRev = 0;
      if (txData.transactions) {
        setTransactions(txData.transactions.slice(0, 8));
        totalRev = txData.transactions
          .filter((t: any) => t.status === 'APPROVED')
          .reduce((sum: number, t: any) => sum + (t.amount || 0), 0);
      }

      setStats({
        projects: statsData.stats?.projects || 0,
        users: usersData.users?.length || statsData.stats?.supporters || 0,
        orders: txData.transactions?.length || 0,
        downloads: statsData.stats?.downloads || 0,
        revenue: totalRev,
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOverview();
  }, []);

  const handleUpdateStatus = async (transactionId: string, status: string) => {
    try {
      const res = await fetch('/api/admin/transactions', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transactionId, status }),
      });
      if (res.ok) {
        fetchOverview();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <AdminLayout>
      <div className="d-flex flex-column gap-4">
        {/* Top Header */}
        <div className="d-flex flex-column flex-sm-row align-items-start align-items-sm-center justify-content-between gap-3">
          <div>
            <h1 className="fs-4 fw-bold text-dark mb-1">Platform Control Center</h1>
            <p className="text-secondary small mb-0">
              Live database monitoring, transactions, and project administration.
            </p>
          </div>
          <div className="d-flex align-items-center gap-2">
            <Link href="/admin/projects" className="btn-pill btn-pill-primary small py-1.5 px-3">
              <Plus size={16} /> Add New Project
            </Link>
          </div>
        </div>

        {/* 5 Real Metric Cards */}
        <div className="row g-3">
          <div className="col-12 col-sm-6 col-xl">
            <div className="glass-card p-3 rounded-4 border shadow-2xs">
              <div className="d-flex align-items-center justify-content-between text-muted small mb-1">
                <span>Total Projects</span>
                <FolderCode size={18} className="text-primary" />
              </div>
              <h3 className="fw-bold text-dark mb-0">{stats.projects}</h3>
            </div>
          </div>

          <div className="col-12 col-sm-6 col-xl">
            <div className="glass-card p-3 rounded-4 border shadow-2xs">
              <div className="d-flex align-items-center justify-content-between text-muted small mb-1">
                <span>Registered Users</span>
                <Users size={18} className="text-cyan-600 text-info" />
              </div>
              <h3 className="fw-bold text-dark mb-0">{stats.users}</h3>
            </div>
          </div>

          <div className="col-12 col-sm-6 col-xl">
            <div className="glass-card p-3 rounded-4 border shadow-2xs">
              <div className="d-flex align-items-center justify-content-between text-muted small mb-1">
                <span>Total Transactions</span>
                <Receipt size={18} className="text-warning" />
              </div>
              <h3 className="fw-bold text-dark mb-0">{stats.orders}</h3>
            </div>
          </div>

          <div className="col-12 col-sm-6 col-xl">
            <div className="glass-card p-3 rounded-4 border shadow-2xs">
              <div className="d-flex align-items-center justify-content-between text-muted small mb-1">
                <span>Total Downloads</span>
                <Download size={18} className="text-success" />
              </div>
              <h3 className="fw-bold text-dark mb-0">{stats.downloads}</h3>
            </div>
          </div>

          <div className="col-12 col-sm-6 col-xl">
            <div className="glass-card p-3 rounded-4 border shadow-2xs">
              <div className="d-flex align-items-center justify-content-between text-muted small mb-1">
                <span>Approved Revenue</span>
                <DollarSign size={18} className="text-primary" />
              </div>
              <h3 className="fw-bold text-dark mb-0">${stats.revenue.toFixed(2)}</h3>
            </div>
          </div>
        </div>

        {/* Recent Transactions & Approval Management */}
        <div className="glass-card p-4 rounded-4 border shadow-sm">
          <div className="d-flex align-items-center justify-content-between mb-3">
            <div>
              <h2 className="fs-5 fw-bold text-dark mb-0">Pending & Recent Orders</h2>
              <span className="text-muted small">Review customer payments and approve downloads</span>
            </div>
            <Link href="/admin/transactions" className="small fw-semibold text-primary text-decoration-none">
              View All Transactions &rarr;
            </Link>
          </div>

          {loading ? (
            <div className="text-center py-4">
              <div className="spinner-border spinner-border-sm text-primary" role="status"></div>
            </div>
          ) : transactions.length === 0 ? (
            <p className="text-muted small py-4 text-center mb-0">No transactions recorded yet.</p>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-light">
                  <tr className="small text-muted">
                    <th>User</th>
                    <th>Project</th>
                    <th>Amount</th>
                    <th>Reference</th>
                    <th>Status</th>
                    <th>Date</th>
                    <th className="text-end">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((tx) => (
                    <tr key={tx.id} className="small">
                      <td>
                        <strong className="text-dark d-block">{tx.user.name}</strong>
                        <span className="text-muted" style={{ fontSize: '0.75rem' }}>{tx.user.email}</span>
                      </td>
                      <td>
                        <span className="fw-semibold text-dark">{tx.project.title}</span>
                      </td>
                      <td className="fw-bold text-dark">${tx.amount.toFixed(2)}</td>
                      <td>
                        <code className="text-dark bg-light px-1.5 py-0.5 rounded border" style={{ fontSize: '0.75rem' }}>
                          {tx.transactionReference || 'N/A'}
                        </code>
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
                        {tx.status === 'PENDING' ? (
                          <div className="d-inline-flex gap-1">
                            <button
                              onClick={() => handleUpdateStatus(tx.id, 'APPROVED')}
                              className="btn btn-sm btn-success rounded-pill px-2.5 py-0.5 small d-flex align-items-center gap-1"
                              title="Approve Order"
                            >
                              <Check size={13} /> Approve
                            </button>
                            <button
                              onClick={() => handleUpdateStatus(tx.id, 'REJECTED')}
                              className="btn btn-sm btn-outline-danger rounded-pill px-2 py-0.5 small"
                              title="Reject Order"
                            >
                              <X size={13} />
                            </button>
                          </div>
                        ) : (
                          <span className="text-muted small">Processed</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
