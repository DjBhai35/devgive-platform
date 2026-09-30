'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import DashboardLayout from '@/components/DashboardLayout';
import { Download, FolderArchive, ArrowRight } from 'lucide-react';

interface DownloadItem {
  id: string;
  downloadedAt: string;
  project: {
    id: string;
    title: string;
    slug: string;
    version: string;
    isPremium: boolean;
  };
}

export default function DownloadsPage() {
  const [downloads, setDownloads] = useState<DownloadItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/user/downloads')
      .then((r) => r.json())
      .then((data) => {
        if (data.downloads) setDownloads(data.downloads);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <DashboardLayout>
      <div className="glass-card p-4 rounded-4 border shadow-sm">
        <div className="d-flex align-items-center justify-content-between mb-4">
          <div>
            <h1 className="fs-4 fw-bold text-dark mb-1">Downloads History</h1>
            <p className="text-secondary small mb-0">
              Access and re-download your claimed and purchased projects.
            </p>
          </div>
          <Link href="/#projects" className="btn-pill btn-pill-cyan small py-1.5 px-3">
            Browse More
          </Link>
        </div>

        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status"></div>
          </div>
        ) : downloads.length === 0 ? (
          <div className="text-center py-5">
            <Download size={48} className="text-muted opacity-50 mb-3 mx-auto" />
            <h5 className="fw-bold text-dark">No downloads yet</h5>
            <p className="text-muted small mb-3">You have not downloaded any source code projects yet.</p>
            <Link href="/#projects" className="btn-pill btn-pill-primary small">
              Explore Projects
            </Link>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr className="small text-muted">
                  <th>Project Name</th>
                  <th>Type</th>
                  <th>Version</th>
                  <th>Downloaded Date</th>
                  <th className="text-end">Action</th>
                </tr>
              </thead>
              <tbody>
                {downloads.map((item) => (
                  <tr key={item.id} className="small">
                    <td>
                      <div className="d-flex align-items-center gap-2">
                        <FolderArchive size={18} className="text-primary" />
                        <Link
                          href={`/project/${item.project.slug}`}
                          className="fw-bold text-dark text-decoration-none hover-text-primary"
                        >
                          {item.project.title}
                        </Link>
                      </div>
                    </td>
                    <td>
                      <span className={`badge rounded-pill ${item.project.isPremium ? 'bg-primary' : 'bg-success'}`}>
                        {item.project.isPremium ? 'Premium' : 'Free'}
                      </span>
                    </td>
                    <td className="text-muted">v{item.project.version}</td>
                    <td className="text-muted">
                      {new Date(item.downloadedAt).toLocaleString()}
                    </td>
                    <td className="text-end">
                      <a
                        href={`/api/downloads/${item.project.id}`}
                        className="btn-pill btn-pill-outline small py-1 px-3 text-nowrap"
                      >
                        <Download size={13} /> Re-download
                      </a>
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
