'use client';

import React, { useEffect, useState } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { Download, ShieldCheck } from 'lucide-react';

interface DownloadLog {
  id: string;
  ipAddress: string | null;
  userAgent: string | null;
  downloadedAt: string;
  user: {
    name: string;
    email: string;
    username: string;
  };
  project: {
    title: string;
    slug: string;
    isPremium: boolean;
  };
}

export default function AdminDownloadsPage() {
  const [downloads, setDownloads] = useState<DownloadLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/downloads')
      .then((r) => r.json())
      .then((data) => {
        if (data.downloads) setDownloads(data.downloads);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <AdminLayout>
      <div className="glass-card p-4 rounded-4 border shadow-sm">
        <h1 className="fs-4 fw-bold text-dark mb-1">Downloads Security & Audit Trail</h1>
        <p className="text-secondary small mb-4">
          Real-time access logs of all authorized package deliveries with user and IP telemetry.
        </p>

        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status"></div>
          </div>
        ) : downloads.length === 0 ? (
          <p className="text-muted text-center py-5">No download records captured yet.</p>
        ) : (
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr className="small text-muted">
                  <th>User</th>
                  <th>Project</th>
                  <th>Type</th>
                  <th>IP Address</th>
                  <th>User Agent</th>
                  <th>Timestamp</th>
                </tr>
              </thead>
              <tbody>
                {downloads.map((dl) => (
                  <tr key={dl.id} className="small">
                    <td>
                      <strong className="text-dark d-block">{dl.user.name}</strong>
                      <span className="text-muted" style={{ fontSize: '0.75rem' }}>
                        {dl.user.email}
                      </span>
                    </td>
                    <td>
                      <span className="fw-semibold text-dark">{dl.project.title}</span>
                    </td>
                    <td>
                      <span className={`badge rounded-pill ${dl.project.isPremium ? 'bg-primary' : 'bg-success'}`}>
                        {dl.project.isPremium ? 'Premium' : 'Free'}
                      </span>
                    </td>
                    <td>
                      <code className="text-dark bg-light px-2 py-0.5 rounded border" style={{ fontSize: '0.75rem' }}>
                        {dl.ipAddress || '127.0.0.1'}
                      </code>
                    </td>
                    <td className="text-secondary text-truncate" style={{ maxWidth: '200px', fontSize: '0.75rem' }} title={dl.userAgent || ''}>
                      {dl.userAgent || 'Unknown'}
                    </td>
                    <td className="text-muted">
                      {new Date(dl.downloadedAt).toLocaleString()}
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
