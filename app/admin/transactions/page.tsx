'use client';

import React, { useEffect, useState } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { Receipt, Check, X, Filter } from 'lucide-react';

interface Transaction {
  id: string;
  amount: number;
  currency: string;
  status: string;
  paymentMethod: string;
  transactionReference: string | null;
  notes: string | null;
  createdAt: string;
  user: {
    id: string;
    name: string;
    email: string;
    username: string;
  };
  project: {
    id: string;
    title: string;
    slug: string;
  };
}

export default function AdminTransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchTransactions = () => {
    setLoading(true);
    const url = statusFilter
      ? `/api/admin/transactions?status=${statusFilter}`
      : '/api/admin/transactions';
    fetch(url)
      .then((r) => r.json())
      .then((data) => {
        if (data.transactions) setTransactions(data.transactions);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchTransactions();
  }, [statusFilter]);

  const handleUpdateStatus = async (transactionId: string, status: string) => {
    try {
      const res = await fetch('/api/admin/transactions', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transactionId, status }),
      });
      if (res.ok) {
        fetchTransactions();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <AdminLayout>
      <div className="glass-card p-4 rounded-4 border shadow-sm">
        <div className="d-flex flex-column flex-sm-row align-items-start align-items-sm-center justify-content-between gap-3 mb-4">
          <div>
            <h1 className="fs-4 fw-bold text-dark mb-1">Orders & Transactions</h1>
            <p className="text-secondary small mb-0">
              Audit customer payments, verify transaction proofs, and unlock downloads.
            </p>
          </div>

          <div className="d-flex align-items-center gap-2">
            <Filter size={16} className="text-muted" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="form-select form-select-sm rounded-pill"
              style={{ minWidth: '150px' }}
            >
              <option value="">All Statuses</option>
              <option value="PENDING">Pending Review</option>
              <option value="APPROVED">Approved</option>
              <option value="REJECTED">Rejected</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status"></div>
          </div>
        ) : transactions.length === 0 ? (
          <p className="text-muted text-center py-5">No transactions found.</p>
        ) : (
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr className="small text-muted">
                  <th>Customer</th>
                  <th>Project</th>
                  <th>Amount</th>
                  <th>Payment Method</th>
                  <th>Proof / Ref ID</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th className="text-end">Action</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((tx) => (
                  <tr key={tx.id} className="small">
                    <td>
                      <strong className="text-dark d-block">{tx.user.name}</strong>
                      <span className="text-muted" style={{ fontSize: '0.75rem' }}>
                        {tx.user.email}
                      </span>
                    </td>
                    <td>
                      <span className="fw-semibold text-dark">{tx.project.title}</span>
                    </td>
                    <td className="fw-bold text-dark">
                      ${tx.amount.toFixed(2)} {tx.currency}
                    </td>
                    <td className="text-secondary">{tx.paymentMethod}</td>
                    <td>
                      <code
                        className="text-dark bg-light px-2 py-0.5 rounded border d-inline-block text-truncate"
                        style={{ maxWidth: '140px', fontSize: '0.75rem' }}
                        title={tx.transactionReference || ''}
                      >
                        {tx.transactionReference || 'N/A'}
                      </code>
                      {tx.notes && (
                        <div className="text-muted small" style={{ fontSize: '0.725rem' }}>
                          Note: {tx.notes}
                        </div>
                      )}
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
                      <div className="d-inline-flex gap-1">
                        {tx.status !== 'APPROVED' && (
                          <button
                            onClick={() => handleUpdateStatus(tx.id, 'APPROVED')}
                            className="btn btn-sm btn-success rounded-pill px-2.5 py-0.5 small d-flex align-items-center gap-1"
                            title="Approve Order"
                          >
                            <Check size={13} /> Approve
                          </button>
                        )}
                        {tx.status !== 'REJECTED' && (
                          <button
                            onClick={() => handleUpdateStatus(tx.id, 'REJECTED')}
                            className="btn btn-sm btn-outline-danger rounded-pill px-2 py-0.5 small"
                            title="Reject Order"
                          >
                            <X size={13} /> Reject
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
