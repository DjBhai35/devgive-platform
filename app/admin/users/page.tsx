'use client';

import React, { useEffect, useState } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { Users, Search, Shield, UserX, UserCheck } from 'lucide-react';

interface UserItem {
  id: string;
  name: string;
  username: string;
  email: string;
  role: string;
  status: string;
  country: string | null;
  createdAt: string;
  _count: {
    downloads: number;
    purchases: number;
    freeClaims: number;
  };
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserItem[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchUsers = () => {
    setLoading(true);
    const url = search ? `/api/admin/users?q=${encodeURIComponent(search)}` : '/api/admin/users';
    fetch(url)
      .then((r) => r.json())
      .then((data) => {
        if (data.users) setUsers(data.users);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchUsers();
  }, [search]);

  const handleToggleStatus = async (user: UserItem) => {
    const newStatus = user.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, status: newStatus }),
      });
      if (res.ok) {
        fetchUsers();
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
            <h1 className="fs-4 fw-bold text-dark mb-1">Users & Accounts</h1>
            <p className="text-secondary small mb-0">
              Manage registered platform accounts, privileges, and account status.
            </p>
          </div>

          <div className="d-flex align-items-center bg-white rounded-pill px-3 py-1.5 border shadow-2xs">
            <Search size={16} className="text-muted me-2" />
            <input
              type="text"
              placeholder="Search by name, email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="border-0 bg-transparent small text-dark outline-none"
              style={{ outline: 'none', minWidth: '180px' }}
            />
          </div>
        </div>

        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status"></div>
          </div>
        ) : users.length === 0 ? (
          <p className="text-muted text-center py-5">No users found matching query.</p>
        ) : (
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr className="small text-muted">
                  <th>User Details</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Activity</th>
                  <th>Joined Date</th>
                  <th className="text-end">Action</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} className="small">
                    <td>
                      <strong className="text-dark d-block">{u.name}</strong>
                      <span className="text-muted" style={{ fontSize: '0.75rem' }}>
                        @{u.username} • {u.email}
                      </span>
                    </td>
                    <td>
                      <span
                        className={`badge rounded-pill ${
                          u.role === 'ADMIN' ? 'bg-danger-subtle text-danger' : 'bg-light text-secondary border'
                        }`}
                      >
                        {u.role}
                      </span>
                    </td>
                    <td>
                      <span
                        className={`badge rounded-pill px-2.5 py-1 ${
                          u.status === 'ACTIVE'
                            ? 'bg-success-subtle text-success'
                            : 'bg-danger-subtle text-danger'
                        }`}
                      >
                        {u.status}
                      </span>
                    </td>
                    <td className="text-muted" style={{ fontSize: '0.75rem' }}>
                      <span>{u._count.downloads} downloads</span> • <span>{u._count.purchases} orders</span>
                    </td>
                    <td className="text-muted">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>
                    <td className="text-end">
                      {u.role !== 'ADMIN' && (
                        <button
                          onClick={() => handleToggleStatus(u)}
                          className={`btn btn-sm ${
                            u.status === 'ACTIVE' ? 'btn-outline-danger' : 'btn-outline-success'
                          } rounded-pill px-3 py-1 small`}
                        >
                          {u.status === 'ACTIVE' ? (
                            <>
                              <UserX size={13} className="me-1" /> Suspend
                            </>
                          ) : (
                            <>
                              <UserCheck size={13} className="me-1" /> Activate
                            </>
                          )}
                        </button>
                      )}
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
