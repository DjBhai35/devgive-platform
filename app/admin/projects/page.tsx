'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import AdminLayout from '@/components/AdminLayout';
import {
  FolderCode,
  Plus,
  Edit2,
  Trash2,
  Eye,
  EyeOff,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  Save,
  X,
} from 'lucide-react';

interface Project {
  id: string;
  title: string;
  slug: string;
  shortDescription: string;
  description: string;
  categoryId: string;
  category: { id: string; name: string };
  techStack: string[];
  version: string;
  liveDemoUrl: string | null;
  isPremium: boolean;
  price: number;
  sourcePackagePath: string | null;
  thumbnail: string | null;
  youtubeUrl: string | null;
  youtubeRequiredDuration: number;
  published: boolean;
  downloadCount: number;
  viewCount: number;
}

interface Category {
  id: string;
  name: string;
}

export default function AdminProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Form Fields
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [shortDescription, setShortDescription] = useState('');
  const [description, setDescription] = useState('');
  const [techStackInput, setTechStackInput] = useState('');
  const [version, setVersion] = useState('1.0.0');
  const [liveDemoUrl, setLiveDemoUrl] = useState('');
  const [isPremium, setIsPremium] = useState(false);
  const [price, setPrice] = useState('0');
  const [thumbnail, setThumbnail] = useState('');
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [youtubeRequiredDuration, setYoutubeRequiredDuration] = useState('60');
  const [sourcePackagePath, setSourcePackagePath] = useState('storage/packages/ecommerce-saas.zip');
  const [uploadingZip, setUploadingZip] = useState(false);
  const [published, setPublished] = useState(true);

  const fetchProjects = async () => {
    try {
      const [projRes, catRes] = await Promise.all([
        fetch('/api/projects?limit=100'),
        fetch('/api/categories'),
      ]);
      const projData = await projRes.json();
      const catData = await catRes.json();

      if (projData.projects) setProjects(projData.projects);
      if (catData.categories) setCategories(catData.categories);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const openCreateModal = () => {
    setEditingProject(null);
    setTitle('');
    setSlug('');
    setCategoryId(categories[0]?.id || '');
    setShortDescription('');
    setDescription('');
    setTechStackInput('Next.js, TypeScript, Tailwind');
    setVersion('1.0.0');
    setLiveDemoUrl('');
    setIsPremium(false);
    setPrice('0');
    setThumbnail('https://images.unsplash.com/photo-1556742049-0a67e5572263?auto=format&fit=crop&w=800&q=80');
    setYoutubeUrl('https://www.youtube.com/watch?v=dQw4w9WgXcQ');
    setYoutubeRequiredDuration('60');
    setSourcePackagePath('storage/packages/ecommerce-saas.zip');
    setPublished(true);
    setErrorMessage(null);
    setModalOpen(true);
  };

  const openEditModal = (p: Project) => {
    setEditingProject(p);
    setTitle(p.title);
    setSlug(p.slug);
    setCategoryId(p.categoryId);
    setShortDescription(p.shortDescription);
    setDescription(p.description);
    setTechStackInput(p.techStack.join(', '));
    setVersion(p.version);
    setLiveDemoUrl(p.liveDemoUrl || '');
    setIsPremium(p.isPremium);
    setPrice(String(p.price));
    setThumbnail(p.thumbnail || '');
    setYoutubeUrl(p.youtubeUrl || '');
    setYoutubeRequiredDuration(String(p.youtubeRequiredDuration));
    setSourcePackagePath(p.sourcePackagePath || 'storage/packages/ecommerce-saas.zip');
    setPublished(p.published);
    setErrorMessage(null);
    setModalOpen(true);
  };

  const handleSaveProject = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMessage(null);

    const techArray = techStackInput
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    const payload = {
      title,
      slug,
      categoryId,
      shortDescription,
      description,
      techStack: techArray,
      version,
      liveDemoUrl: liveDemoUrl || null,
      isPremium,
      price: isPremium ? parseFloat(price) || 0 : 0,
      sourcePackagePath,
      thumbnail: thumbnail || null,
      youtubeUrl: youtubeUrl || null,
      youtubeRequiredDuration: parseInt(youtubeRequiredDuration, 10) || 60,
      published,
    };

    try {
      const url = editingProject ? `/api/projects/${editingProject.id}` : '/api/projects';
      const method = editingProject ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (res.ok) {
        setModalOpen(false);
        fetchProjects();
      } else {
        setErrorMessage(data.error || 'Failed to save project');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Network error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleTogglePublish = async (p: Project) => {
    try {
      const res = await fetch(`/api/projects/${p.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ published: !p.published }),
      });
      if (res.ok) {
        fetchProjects();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteProject = async (id: string) => {
    if (!confirm('Are you sure you want to delete this project? This action cannot be undone.')) {
      return;
    }
    try {
      const res = await fetch(`/api/projects/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setProjects((prev) => prev.filter((p) => p.id !== id));
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
            <h1 className="fs-4 fw-bold text-dark mb-1">Projects Repository</h1>
            <p className="text-secondary small mb-0">
              Create, edit, publish/unpublish, and manage live source-code scripts.
            </p>
          </div>
          <button onClick={openCreateModal} className="btn-pill btn-pill-primary small py-2 px-3">
            <Plus size={16} /> New Project
          </button>
        </div>

        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status"></div>
          </div>
        ) : projects.length === 0 ? (
          <p className="text-muted text-center py-5">No projects created yet.</p>
        ) : (
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr className="small text-muted">
                  <th>Project</th>
                  <th>Category</th>
                  <th>Type</th>
                  <th>Price</th>
                  <th>Status</th>
                  <th>Stats</th>
                  <th className="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {projects.map((p) => (
                  <tr key={p.id} className="small">
                    <td>
                      <div className="d-flex align-items-center gap-2.5">
                        <img
                          src={p.thumbnail || 'https://images.unsplash.com/photo-1556742049-0a67e5572263?auto=format&fit=crop&w=100&q=80'}
                          alt={p.title}
                          className="rounded-3 object-fit-cover"
                          style={{ width: '48px', height: '48px' }}
                        />
                        <div>
                          <strong className="text-dark d-block">{p.title}</strong>
                          <span className="text-muted" style={{ fontSize: '0.75rem' }}>/{p.slug}</span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="badge bg-light text-secondary border rounded-pill">
                        {p.category.name}
                      </span>
                    </td>
                    <td>
                      <span className={`badge rounded-pill ${p.isPremium ? 'bg-primary' : 'bg-success'}`}>
                        {p.isPremium ? 'Premium' : 'Free'}
                      </span>
                    </td>
                    <td className="fw-bold text-dark">
                      {p.isPremium ? `$${p.price.toFixed(2)}` : '$0.00'}
                    </td>
                    <td>
                      <span
                        className={`badge rounded-pill px-2.5 py-1 ${
                          p.published ? 'bg-success-subtle text-success' : 'bg-secondary-subtle text-secondary'
                        }`}
                      >
                        {p.published ? 'Published' : 'Draft'}
                      </span>
                    </td>
                    <td className="text-muted" style={{ fontSize: '0.75rem' }}>
                      <div>{p.downloadCount} dl</div>
                      <div>{p.viewCount} views</div>
                    </td>
                    <td className="text-end">
                      <div className="d-inline-flex gap-1">
                        <button
                          onClick={() => handleTogglePublish(p)}
                          className={`btn btn-sm ${p.published ? 'btn-outline-warning' : 'btn-outline-success'} rounded-circle p-1.5`}
                          title={p.published ? 'Unpublish' : 'Publish'}
                        >
                          {p.published ? <EyeOff size={14} /> : <Eye size={14} />}
                        </button>
                        <button
                          onClick={() => openEditModal(p)}
                          className="btn btn-sm btn-outline-primary rounded-circle p-1.5"
                          title="Edit Project"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          onClick={() => handleDeleteProject(p.id)}
                          className="btn btn-sm btn-outline-danger rounded-circle p-1.5"
                          title="Delete Project"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create / Edit Project Modal */}
      {modalOpen && (
        <div
          className="modal show d-block"
          tabIndex={-1}
          style={{ background: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(8px)' }}
        >
          <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
            <div className="modal-content rounded-4 border-0 shadow-lg">
              <div className="modal-header border-0 pb-0">
                <h5 className="modal-title fw-bold text-dark">
                  {editingProject ? 'Edit Project' : 'Create New Project'}
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setModalOpen(false)}
                ></button>
              </div>

              <div className="modal-body p-4">
                {errorMessage && (
                  <div className="alert alert-danger py-2 small d-flex align-items-center gap-2 mb-3">
                    <AlertCircle size={16} /> {errorMessage}
                  </div>
                )}

                <form onSubmit={handleSaveProject}>
                  <div className="row g-3">
                    <div className="col-12 col-md-8">
                      <label className="form-label small fw-semibold text-secondary">Title</label>
                      <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        required
                        className="form-control form-control-saas"
                      />
                    </div>

                    <div className="col-12 col-md-4">
                      <label className="form-label small fw-semibold text-secondary">Category</label>
                      <select
                        value={categoryId}
                        onChange={(e) => setCategoryId(e.target.value)}
                        required
                        className="form-select"
                      >
                        {categories.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="col-12 col-md-6">
                      <label className="form-label small fw-semibold text-secondary">URL Slug</label>
                      <input
                        type="text"
                        placeholder="auto-generated-from-title"
                        value={slug}
                        onChange={(e) => setSlug(e.target.value)}
                        className="form-control form-control-saas"
                      />
                    </div>

                    <div className="col-12 col-md-3">
                      <label className="form-label small fw-semibold text-secondary">Version</label>
                      <input
                        type="text"
                        value={version}
                        onChange={(e) => setVersion(e.target.value)}
                        className="form-control form-control-saas"
                      />
                    </div>

                    <div className="col-12 col-md-3">
                      <label className="form-label small fw-semibold text-secondary">Live Demo URL</label>
                      <input
                        type="url"
                        placeholder="https://..."
                        value={liveDemoUrl}
                        onChange={(e) => setLiveDemoUrl(e.target.value)}
                        className="form-control form-control-saas"
                      />
                    </div>

                    <div className="col-12">
                      <label className="form-label small fw-semibold text-secondary">
                        Short Excerpt / Description
                      </label>
                      <textarea
                        rows={2}
                        value={shortDescription}
                        onChange={(e) => setShortDescription(e.target.value)}
                        required
                        className="form-control form-control-saas"
                      ></textarea>
                    </div>

                    <div className="col-12">
                      <label className="form-label small fw-semibold text-secondary">
                        Full Detailed Description (Features, Requirements, Setup)
                      </label>
                      <textarea
                        rows={5}
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        required
                        className="form-control form-control-saas"
                      ></textarea>
                    </div>

                    <div className="col-12">
                      <label className="form-label small fw-semibold text-secondary">
                        Technologies / Tech Stack (comma separated)
                      </label>
                      <input
                        type="text"
                        placeholder="Next.js, TypeScript, Laravel, Tailwind"
                        value={techStackInput}
                        onChange={(e) => setTechStackInput(e.target.value)}
                        className="form-control form-control-saas"
                      />
                    </div>

                    <div className="col-12 col-md-6">
                      <label className="form-label small fw-semibold text-secondary">Thumbnail Image URL</label>
                      <input
                        type="url"
                        placeholder="https://images.unsplash.com/..."
                        value={thumbnail}
                        onChange={(e) => setThumbnail(e.target.value)}
                        className="form-control form-control-saas"
                      />
                    </div>

                    <div className="col-12 col-md-6">
                      <label className="form-label small fw-semibold text-secondary">YouTube Demo / Tutorial URL</label>
                      <input
                        type="url"
                        placeholder="https://www.youtube.com/watch?v=..."
                        value={youtubeUrl}
                        onChange={(e) => setYoutubeUrl(e.target.value)}
                        className="form-control form-control-saas"
                      />
                    </div>

                    <div className="col-12 col-md-6">
                      <label className="form-label small fw-semibold text-secondary">
                        Upload Actual Source Code ZIP {uploadingZip && '(Uploading...)'}
                      </label>
                      <input
                        type="file"
                        accept=".zip"
                        disabled={uploadingZip}
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          setUploadingZip(true);
                          const fd = new FormData();
                          fd.append('file', file);
                          try {
                            const res = await fetch('/api/admin/upload-package', {
                              method: 'POST',
                              body: fd,
                            });
                            const data = await res.json();
                            if (res.ok && data.packagePath) {
                              setSourcePackagePath(data.packagePath);
                              alert('ZIP uploaded successfully: ' + data.filename);
                            } else {
                              alert(data.error || 'Failed to upload ZIP package');
                            }
                          } catch (err: any) {
                            alert('Upload failed: ' + err.message);
                          } finally {
                            setUploadingZip(false);
                          }
                        }}
                        className="form-control form-control-saas"
                      />
                      {sourcePackagePath && (
                        <div className="text-muted small mt-1 font-monospace" style={{ fontSize: '0.75rem' }}>
                          Current file: {sourcePackagePath}
                        </div>
                      )}
                    </div>

                    <div className="col-12 col-md-4">
                      <div className="form-check form-switch pt-4">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          id="isPremiumSwitch"
                          checked={isPremium}
                          onChange={(e) => setIsPremium(e.target.checked)}
                        />
                        <label className="form-check-label small fw-semibold text-dark" htmlFor="isPremiumSwitch">
                          Premium Project (Requires Payment)
                        </label>
                      </div>
                    </div>

                    {isPremium ? (
                      <div className="col-12 col-md-4">
                        <label className="form-label small fw-semibold text-secondary">Price (USD)</label>
                        <div className="input-group">
                          <span className="input-group-text">$</span>
                          <input
                            type="number"
                            step="0.01"
                            value={price}
                            onChange={(e) => setPrice(e.target.value)}
                            className="form-control"
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="col-12 col-md-4">
                        <label className="form-label small fw-semibold text-secondary">
                          Req. YouTube Watch Duration (seconds)
                        </label>
                        <input
                          type="number"
                          value={youtubeRequiredDuration}
                          onChange={(e) => setYoutubeRequiredDuration(e.target.value)}
                          className="form-control"
                        />
                      </div>
                    )}

                    <div className="col-12 col-md-4">
                      <div className="form-check form-switch pt-4">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          id="publishSwitch"
                          checked={published}
                          onChange={(e) => setPublished(e.target.checked)}
                        />
                        <label className="form-check-label small fw-semibold text-dark" htmlFor="publishSwitch">
                          Publish Publicly on Website
                        </label>
                      </div>
                    </div>
                  </div>

                  <div className="modal-footer border-0 pt-4 px-0">
                    <button
                      type="button"
                      onClick={() => setModalOpen(false)}
                      className="btn-pill btn-pill-outline small py-2 px-3.5"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="btn-pill btn-pill-primary small py-2 px-4"
                    >
                      <Save size={16} /> {submitting ? 'Saving...' : 'Save Project'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
