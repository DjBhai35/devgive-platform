'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import DashboardLayout from '@/components/DashboardLayout';
import { Receipt, ExternalLink, Download } from 'lucide-react';

interface Purchase {
  id: string;
  amount: number;
  currency: string;
  status: string;
  paymentMethod: string;
  transactionReference: string | null;
  createdAt: string;
  project: {
    id: string;
    title: string;
    slug: string;
    isPremium: boolean;
    price: number;
  };
}

export default function DonationsPage() {
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/purchases')
      .then((r) => r.json())
      .then((data) => {
        if (data.purchases) setPurchases(data.purchases);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <DashboardLayout>
      <div className="glass-card p-4 rounded-4 border shadow-sm">
        <div className="d-flex align-items-center justify-content-between mb-4">
          <div>
            <h1 className="fs-4 fw-bold text-dark mb-1">My Donations & Purchases</h1>
            <p className="text-secondary small mb-0">
              Track your donation proofs, orders, and approval statuses.
            </p>
          </div>
          <Link href="/#projects" className="btn-pill btn-pill-cyan small py-1.5 px-3">
            Donate to a Project
          </Link>
        </div>

        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status"></div>
          </div>
        ) : purchases.length === 0 ? (
          <div className="text-center py-5">
            <Receipt size={48} className="text-muted opacity-50 mb-3 mx-auto" />
            <h5 className="fw-bold text-dark">No donations yet</h5>
            <p className="text-muted small mb-3">You have not supported any projects yet.</p>
            <Link href="/#projects" className="btn-pill btn-pill-primary small">
              Browse Projects
            </Link>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr className="small text-muted">
                  <th>Project</th>
                  <th>Amount</th>
                  <th>Method</th>
                  <th>Ref ID</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th className="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {purchases.map((tx) => (
                  <tr key={tx.id} className="small">
                    <td>
                      <Link
                        href={`/project/${tx.project.slug}`}
                        className="fw-bold text-dark text-decoration-none hover-text-primary"
                      >
                        {tx.project.title}
                      </Link>
                    </td>
                    <td className="fw-bold text-dark">
                      ${tx.amount.toFixed(2)} {tx.currency}
                    </td>
                    <td className="text-secondary">{tx.paymentMethod}</td>
                    <td className="text-muted text-monospace" style={{ fontSize: '0.75rem' }}>
                      {tx.transactionReference || 'N/A'}
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
                      {tx.status === 'APPROVED' ? (
                        <a
                          href={`/api/downloads/${tx.project.id}`}
                          className="btn-pill btn-pill-primary small py-1 px-3 text-nowrap"
                        >
                          <Download size={13} /> Download
                        </a>
                      ) : (
                        <span className="text-muted small">Pending approval</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
