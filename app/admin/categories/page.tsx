'use client';

import React, { useEffect, useState } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { Tags, Plus, Save, AlertCircle, FolderCode } from 'lucide-react';

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  projectCount: number;
}

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  // New category form
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [icon, setIcon] = useState('folder');
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchCategories = () => {
    fetch('/api/categories')
      .then((r) => r.json())
      .then((data) => {
        if (data.categories) setCategories(data.categories);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage(null);

    try {
      const res = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, slug, description, icon }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage({ type: 'success', text: 'Category created successfully!' });
        setName('');
        setSlug('');
        setDescription('');
        fetchCategories();
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to create category' });
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Network error' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AdminLayout>
      <div className="row g-4">
        {/* Left: Categories List */}
        <div className="col-12 col-lg-8">
          <div className="glass-card p-4 rounded-4 border shadow-sm">
            <h1 className="fs-5 fw-bold text-dark mb-1">Categories Directory</h1>
            <p className="text-secondary small mb-4">
              Organize projects across various software engineering disciplines.
            </p>

            {loading ? (
              <div className="text-center py-5">
                <div className="spinner-border text-primary" role="status"></div>
              </div>
            ) : categories.length === 0 ? (
              <p className="text-muted text-center py-4">No categories configured.</p>
            ) : (
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0">
                  <thead className="table-light">
                    <tr className="small text-muted">
                      <th>Category Name</th>
                      <th>Slug</th>
                      <th>Description</th>
                      <th>Live Projects</th>
                    </tr>
                  </thead>
                  <tbody>
                    {categories.map((c) => (
                      <tr key={c.id} className="small">
                        <td>
                          <div className="d-flex align-items-center gap-2">
                            <FolderCode size={16} className="text-primary" />
                            <strong className="text-dark">{c.name}</strong>
                          </div>
                        </td>
                        <td className="text-muted">/{c.slug}</td>
                        <td className="text-secondary" style={{ maxWidth: '240px' }}>
                          {c.description || '—'}
                        </td>
                        <td>
                          <span className="badge rounded-pill bg-light text-dark border px-2.5 py-1">
                            {c.projectCount} projects
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Right: Create Category Form */}
        <div className="col-12 col-lg-4">
          <div className="glass-card p-4 rounded-4 border shadow-sm">
            <h2 className="fs-6 fw-bold text-dark mb-1">Add New Category</h2>
            <p className="text-secondary small mb-3">Create a new category for projects.</p>

            {message && (
              <div
                className={`alert ${
                  message.type === 'success' ? 'alert-success' : 'alert-danger'
                } py-2 small mb-3`}
              >
                {message.text}
              </div>
            )}

            <form onSubmit={handleCreateCategory}>
              <div className="mb-3">
                <label className="form-label small fw-semibold text-secondary">Name</label>
                <input
                  type="text"
                  placeholder="e.g. AI Tools"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="form-control form-control-saas"
                />
              </div>

              <div className="mb-3">
                <label className="form-label small fw-semibold text-secondary">Slug (optional)</label>
                <input
                  type="text"
                  placeholder="ai-tools"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  className="form-control form-control-saas"
                />
              </div>

              <div className="mb-3">
                <label className="form-label small fw-semibold text-secondary">Description</label>
                <textarea
                  rows={2}
                  placeholder="Short description..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="form-control form-control-saas"
                ></textarea>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="btn-pill btn-pill-primary w-100 py-2 small justify-content-center"
              >
                <Plus size={16} /> {submitting ? 'Creating...' : 'Create Category'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
