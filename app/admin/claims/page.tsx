'use client';

import React, { useEffect, useState } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { CheckCircle2, Youtube } from 'lucide-react';

interface FreeClaim {
  id: string;
  youtubeWatchedSeconds: number;
  verifiedAt: string;
  createdAt: string;
  user: {
    name: string;
    email: string;
    username: string;
  };
  project: {
    title: string;
    slug: string;
    youtubeRequiredDuration: number;
  };
}

export default function AdminClaimsPage() {
  const [claims, setClaims] = useState<FreeClaim[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/claims')
      .then((r) => r.json())
      .then((data) => {
        if (data.claims) setClaims(data.claims);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <AdminLayout>
      <div className="glass-card p-4 rounded-4 border shadow-sm">
        <h1 className="fs-4 fw-bold text-dark mb-1">Free Claims & YouTube Verifications</h1>
        <p className="text-secondary small mb-4">
          Audit history of users who watched the required video duration to unlock free source packages.
        </p>

        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status"></div>
          </div>
        ) : claims.length === 0 ? (
          <p className="text-muted text-center py-5">No free claims recorded yet.</p>
        ) : (
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr className="small text-muted">
                  <th>User</th>
                  <th>Project</th>
                  <th>Watched Duration</th>
                  <th>Verification Status</th>
                  <th>Verified Date</th>
                </tr>
              </thead>
              <tbody>
                {claims.map((claim) => (
                  <tr key={claim.id} className="small">
                    <td>
                      <strong className="text-dark d-block">{claim.user.name}</strong>
                      <span className="text-muted" style={{ fontSize: '0.75rem' }}>
                        {claim.user.email}
                      </span>
                    </td>
                    <td>
                      <span className="fw-semibold text-dark">{claim.project.title}</span>
                    </td>
                    <td>
                      <div className="d-flex align-items-center gap-1.5 text-danger fw-semibold">
                        <Youtube size={15} />
                        <span>
                          {claim.youtubeWatchedSeconds}s / {claim.project.youtubeRequiredDuration}s
                        </span>
                      </div>
                    </td>
                    <td>
                      <span className="badge rounded-pill bg-success-subtle text-success px-2.5 py-1">
                        Verified & Unlocked
                      </span>
                    </td>
                    <td className="text-muted">
                      {new Date(claim.verifiedAt).toLocaleString()}
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
