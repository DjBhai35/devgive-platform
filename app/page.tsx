'use client';

import React, { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  Code2,
  CheckCircle2,
  ArrowRight,
  Download,
  Eye,
  Heart,
  SlidersHorizontal,
  FolderCode,
  UserCheck,
  Search,
  ExternalLink,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';

interface Category {
  id: string;
  name: string;
  slug: string;
  projectCount: number;
}

interface Project {
  id: string;
  title: string;
  slug: string;
  shortDescription: string;
  thumbnail: string | null;
  isPremium: boolean;
  price: number;
  downloadCount: number;
  viewCount: number;
  category: { name: string; slug: string };
  techStack: string[];
}

interface PlatformStats {
  projects: number;
  downloads: number;
  supporters: number;
  approvedDonations: number;
}

function HomePageContent() {
  const searchParams = useSearchParams();
  const [stats, setStats] = useState<PlatformStats>({
    projects: 0,
    downloads: 0,
    supporters: 0,
    approvedDonations: 0,
  });

  const [categories, setCategories] = useState<Category[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loadingProjects, setLoadingProjects] = useState(true);

  // Filter state
  const [selectedCategory, setSelectedCategory] = useState<string>(searchParams.get('category') || '');
  const [searchQuery, setSearchQuery] = useState<string>(searchParams.get('q') || '');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalCount, setTotalCount] = useState<number>(0);

  // Fetch stats and categories once
  useEffect(() => {
    fetch('/api/stats')
      .then((r) => r.json())
      .then((data) => {
        if (data.stats) setStats(data.stats);
      })
      .catch((err) => console.error(err));

    fetch('/api/categories')
      .then((r) => r.json())
      .then((data) => {
        if (data.categories) setCategories(data.categories);
      })
      .catch((err) => console.error(err));
  }, []);

  // Sync url param changes
  useEffect(() => {
    const q = searchParams.get('q');
    if (q !== null) setSearchQuery(q);
    const cat = searchParams.get('category');
    if (cat !== null) setSelectedCategory(cat);
  }, [searchParams]);

  // Fetch projects when filters change
  const fetchProjects = (page = 1) => {
    setLoadingProjects(true);
    const params = new URLSearchParams();
    if (searchQuery) params.set('q', searchQuery);
    if (selectedCategory) params.set('category', selectedCategory);
    if (typeFilter !== 'all') params.set('type', typeFilter);
    params.set('page', String(page));
    params.set('limit', '6');

    fetch(`/api/projects?${params.toString()}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.projects) {
          setProjects(data.projects);
          setTotalPages(data.pagination.totalPages || 1);
          setTotalCount(data.pagination.total || 0);
          setCurrentPage(data.pagination.page || 1);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoadingProjects(false));
  };

  useEffect(() => {
    fetchProjects(currentPage);
  }, [selectedCategory, typeFilter, currentPage]);

  const handleFilterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchProjects(1);
  };

  return (
    <div className="container py-4 py-md-5">
      {/* ===================== HERO SECTION ===================== */}
      <section className="glass-card p-4 p-md-5 mb-5 border-0 shadow-sm" style={{ borderRadius: '1.75rem' }}>
        <div className="row g-4 g-lg-5 align-items-center">
          {/* Left Hero Column */}
          <div className="col-lg-7">
            <div className="pill-badge mb-3">
              <span className="pill-badge-dot"></span>
              Donation-first code marketplace
            </div>

            <h1 className="display-6 fw-extrabold text-slate-900 mb-3" style={{ letterSpacing: '-0.75px', fontWeight: 800 }}>
              DevGive - Developer Source Code Sharing & Resource Platform
            </h1>

            <p className="lead text-secondary mb-4 fs-6 fs-md-5" style={{ lineHeight: '1.7' }}>
              DevGive is a developer resource platform where original source code projects are shared for learning and development purposes. Browse projects, support the creator with a donation, or download select projects for free.
            </p>

            <div className="d-flex flex-wrap gap-3 mb-4">
              <a href="#projects" className="btn-pill btn-pill-primary px-4 py-2.5 shadow-sm">
                Browse source codes
              </a>
              <a href="#projects" className="btn-pill btn-pill-outline px-4 py-2.5">
                View marketplace
              </a>
            </div>

            {/* 3 Value propositions */}
            <div className="row g-2 pt-2">
              <div className="col-12 col-sm-4">
                <div className="p-3 bg-white bg-opacity-75 rounded-4 border shadow-2xs h-100">
                  <div className="d-flex align-items-center gap-2 mb-1">
                    <CheckCircle2 size={16} className="text-primary" />
                    <span className="fw-bold small text-dark">Secure payments</span>
                  </div>
                  <div className="text-muted" style={{ fontSize: '0.75rem' }}>
                    Manual proof review
                  </div>
                </div>
              </div>

              <div className="col-12 col-sm-4">
                <div className="p-3 bg-white bg-opacity-75 rounded-4 border shadow-2xs h-100">
                  <div className="d-flex align-items-center gap-2 mb-1">
                    <CheckCircle2 size={16} className="text-cyan-600 text-info" />
                    <span className="fw-bold small text-dark">Fast delivery</span>
                  </div>
                  <div className="text-muted" style={{ fontSize: '0.75rem' }}>
                    Gated downloads
                  </div>
                </div>
              </div>

              <div className="col-12 col-sm-4">
                <div className="p-3 bg-white bg-opacity-75 rounded-4 border shadow-2xs h-100">
                  <div className="d-flex align-items-center gap-2 mb-1">
                    <CheckCircle2 size={16} className="text-purple-600 text-primary" />
                    <span className="fw-bold small text-dark">Creator-first</span>
                  </div>
                  <div className="text-muted" style={{ fontSize: '0.75rem' }}>
                    You own your IP
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Hero Card: Live Marketplace Stats */}
          <div className="col-lg-5">
            <div
              className="p-4 rounded-4 bg-white border shadow-sm"
              style={{
                borderRadius: '1.5rem',
                boxShadow: '0 20px 40px -15px rgba(99, 102, 241, 0.12)',
              }}
            >
              <div className="d-flex align-items-center justify-content-between mb-4">
                <h3 className="fs-5 fw-bold text-dark mb-0">Live marketplace</h3>
                <span className="badge rounded-pill bg-success-subtle text-success px-3 py-1.5 fw-semibold small">
                  ● Realtime
                </span>
              </div>

              {/* 4 Stat Tiles */}
              <div className="row g-3 mb-4">
                <div className="col-6">
                  <div className="p-3 rounded-4 bg-light border">
                    <span className="text-muted small fw-medium">Projects</span>
                    <h3 className="fw-bold text-dark mt-1 mb-0">{stats.projects}</h3>
                  </div>
                </div>
                <div className="col-6">
                  <div className="p-3 rounded-4 bg-light border">
                    <span className="text-muted small fw-medium">Downloads</span>
                    <h3 className="fw-bold text-dark mt-1 mb-0">{stats.downloads.toLocaleString()}</h3>
                  </div>
                </div>
                <div className="col-6">
                  <div className="p-3 rounded-4 bg-light border">
                    <span className="text-muted small fw-medium">Supporters</span>
                    <h3 className="fw-bold text-dark mt-1 mb-0">{stats.supporters.toLocaleString()}</h3>
                  </div>
                </div>
                <div className="col-6">
                  <div className="p-3 rounded-4 bg-light border">
                    <span className="text-muted small fw-medium">Approved donations</span>
                    <h3 className="fw-bold text-dark mt-1 mb-0">{stats.approvedDonations.toLocaleString()}</h3>
                  </div>
                </div>
              </div>

              {/* Creator Workflow Banner */}
              <div
                className="p-3.5 rounded-4 text-white"
                style={{
                  background: 'linear-gradient(135deg, #0284c7 0%, #4f46e5 100%)',
                }}
              >
                <div className="text-uppercase fw-bold" style={{ fontSize: '0.75rem', letterSpacing: '0.05em', opacity: 0.9 }}>
                  Creator workflow
                </div>
                <p className="fw-semibold small mt-1 mb-2">
                  Upload, set a minimum donation, approve proofs, unlock downloads.
                </p>
                <div className="d-flex align-items-center gap-1.5 small text-white-50" style={{ fontSize: '0.775rem' }}>
                  <span className="bg-white rounded-circle" style={{ width: '6px', height: '6px' }}></span>
                  <span className="text-white">Audit trail + activity logs</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===================== FEATURED SOURCE CODES ===================== */}
      <section id="projects" className="mb-5 pt-3">
        <div className="d-flex flex-column flex-md-row align-items-start align-items-md-center justify-content-between gap-3 mb-4">
          <div>
            <h2 className="fs-3 fw-bold text-slate-900 mb-1">Featured source codes</h2>
            <p className="text-muted small mb-0">
              Filter by category or search to find what you need. Showing{' '}
              {projects.length > 0 ? `${(currentPage - 1) * 6 + 1}–${Math.min(currentPage * 6, totalCount)}` : '0'} of{' '}
              {totalCount} projects.
            </p>
          </div>

          {/* Category Dropdown and Filter Form */}
          <form onSubmit={handleFilterSubmit} className="d-flex flex-wrap align-items-center gap-2 w-100 w-md-auto">
            <select
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value);
                setCurrentPage(1);
              }}
              className="form-select rounded-3 py-2 px-3 small border shadow-2xs"
              style={{ minWidth: '170px' }}
            >
              <option value="">All categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.slug}>
                  {c.name} ({c.projectCount})
                </option>
              ))}
            </select>

            <select
              value={typeFilter}
              onChange={(e) => {
                setTypeFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="form-select rounded-3 py-2 px-3 small border shadow-2xs"
              style={{ minWidth: '130px' }}
            >
              <option value="all">All Types</option>
              <option value="free">Free only</option>
              <option value="premium">Premium only</option>
            </select>

            <button type="submit" className="btn-pill btn-pill-primary py-2 px-3.5 small">
              <SlidersHorizontal size={15} /> Filter
            </button>
          </form>
        </div>

        {/* Project Cards Grid */}
        {loadingProjects ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading projects...</span>
            </div>
          </div>
        ) : projects.length === 0 ? (
          <div className="glass-card text-center py-5 p-4 rounded-4">
            <FolderCode size={48} className="text-muted mb-3 mx-auto" />
            <h4 className="fw-bold text-dark">No projects found</h4>
            <p className="text-muted small mb-3">Try clearing search filters or selecting another category.</p>
            <button
              onClick={() => {
                setSelectedCategory('');
                setSearchQuery('');
                setTypeFilter('all');
                setCurrentPage(1);
              }}
              className="btn-pill btn-pill-outline small"
            >
              Reset filters
            </button>
          </div>
        ) : (
          <div className="row g-4 mb-4">
            {projects.map((project) => (
              <div key={project.id} className="col-12 col-md-6 col-lg-4">
                <article className="glass-card glass-card-hover h-100 d-flex flex-column overflow-hidden rounded-4">
                  {/* Thumbnail Banner */}
                  <div className="position-relative overflow-hidden" style={{ height: '190px' }}>
                    <img
                      src={
                        project.thumbnail ||
                        'https://images.unsplash.com/photo-1556742049-0a67e5572263?auto=format&fit=crop&w=800&q=80'
                      }
                      alt={project.title}
                      className="project-card-img"
                    />
                    <div className="position-absolute top-0 end-0 m-3">
                      <span
                        className={`badge rounded-pill px-3 py-1.5 fw-bold shadow-sm ${
                          project.isPremium
                            ? 'bg-gradient-primary text-white'
                            : 'bg-emerald-600 bg-success text-white'
                        }`}
                        style={{ fontSize: '0.75rem' }}
                      >
                        {project.isPremium ? `$${project.price.toFixed(2)}` : 'FREE'}
                      </span>
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="p-4 d-flex flex-column flex-grow-1">
                    {/* Category pill */}
                    <div className="d-flex align-items-center justify-content-between mb-2">
                      <span className="category-pill">
                        <FolderCode size={13} className="text-primary" />
                        {project.category.name}
                      </span>
                      <span className="small text-muted d-flex align-items-center gap-1">
                        <Eye size={13} /> {project.viewCount}
                      </span>
                    </div>

                    {/* Title */}
                    <h3 className="fs-6 fw-bold text-dark mb-2" style={{ lineHeight: '1.4' }}>
                      <Link
                        href={`/project/${project.slug}`}
                        className="text-decoration-none text-dark hover-text-primary"
                      >
                        {project.title}
                      </Link>
                    </h3>

                    {/* Short Description */}
                    <p
                      className="text-secondary small mb-3 flex-grow-1"
                      style={{
                        lineHeight: '1.6',
                        display: '-webkit-box',
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                      }}
                    >
                      {project.shortDescription}
                    </p>

                    {/* Download info bar */}
                    <div className="d-flex align-items-center justify-content-between text-muted small border-top pt-2.5 mb-3" style={{ fontSize: '0.8rem' }}>
                      <span className="d-flex align-items-center gap-1">
                        <Download size={13} /> {project.downloadCount} downloads
                      </span>
                      <span className="fw-semibold">Source code</span>
                    </div>

                    {/* Action buttons */}
                    <div className="d-flex align-items-center gap-2">
                      <Link
                        href={`/project/${project.slug}`}
                        className="btn-pill btn-pill-outline small flex-fill py-2"
                      >
                        View details
                      </Link>
                      <Link
                        href={project.isPremium ? `/project/${project.slug}#buy` : `/project/${project.slug}#claim`}
                        className="btn-pill btn-pill-primary small flex-fill py-2 text-nowrap"
                      >
                        {project.isPremium ? 'Donate & download' : 'Free claim'}
                      </Link>
                    </div>
                  </div>
                </article>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="d-flex justify-content-center mt-4">
            <nav className="d-inline-flex align-items-center gap-1 bg-white p-1.5 rounded-4 border shadow-sm">
              <button
                disabled={currentPage <= 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="btn btn-sm btn-light border-0 fw-semibold px-3 py-1.5"
              >
                Previous
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`btn btn-sm fw-bold px-3 py-1.5 rounded-3 ${
                    currentPage === page ? 'btn-pill-primary text-white' : 'btn-light border-0 text-dark'
                  }`}
                >
                  {page}
                </button>
              ))}

              <button
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                className="btn btn-sm btn-light border-0 fw-semibold px-3 py-1.5"
              >
                Next
              </button>
            </nav>
          </div>
        )}
      </section>

      {/* ===================== HOW IT WORKS SECTION ===================== */}
      <section id="how" className="glass-card p-4 p-md-5 rounded-4 border shadow-sm">
        <h2 className="fs-4 fw-bold text-dark mb-4">How it works</h2>

        <div className="row g-4">
          {/* Step 1: Register */}
          <div className="col-12 col-sm-6 col-lg-3">
            <div className="p-4 bg-light rounded-4 border h-100">
              <div
                className="d-inline-flex align-items-center justify-content-center text-primary rounded-3 mb-3 bg-white shadow-2xs"
                style={{ width: '42px', height: '42px' }}
              >
                <UserCheck size={22} />
              </div>
              <h3 className="fs-6 fw-bold text-dark mb-2">Register</h3>
              <p className="text-secondary small mb-0" style={{ lineHeight: '1.6' }}>
                Create your supporter or creator account securely with your email.
              </p>
            </div>
          </div>

          {/* Step 2: Browse */}
          <div className="col-12 col-sm-6 col-lg-3">
            <div className="p-4 bg-light rounded-4 border h-100">
              <div
                className="d-inline-flex align-items-center justify-content-center text-cyan-600 rounded-3 mb-3 bg-white shadow-2xs"
                style={{ width: '42px', height: '42px' }}
              >
                <Search size={22} />
              </div>
              <h3 className="fs-6 fw-bold text-dark mb-2">Browse</h3>
              <p className="text-secondary small mb-0" style={{ lineHeight: '1.6' }}>
                Search curated projects across web, mobile, SaaS, and automation tools.
              </p>
            </div>
          </div>

          {/* Step 3: Donate */}
          <div className="col-12 col-sm-6 col-lg-3">
            <div className="p-4 bg-light rounded-4 border h-100">
              <div
                className="d-inline-flex align-items-center justify-content-center text-purple-600 rounded-3 mb-3 bg-white shadow-2xs"
                style={{ width: '42px', height: '42px' }}
              >
                <SlidersHorizontal size={22} />
              </div>
              <h3 className="fs-6 fw-bold text-dark mb-2">Donate</h3>
              <p className="text-secondary small mb-0" style={{ lineHeight: '1.6' }}>
                Choose a gateway and upload payment proof or complete video verification.
              </p>
            </div>
          </div>

          {/* Step 4: Download */}
          <div className="col-12 col-sm-6 col-lg-3">
            <div className="p-4 bg-light rounded-4 border h-100">
              <div
                className="d-inline-flex align-items-center justify-content-center text-success rounded-3 mb-3 bg-white shadow-2xs"
                style={{ width: '42px', height: '42px' }}
              >
                <Download size={22} />
              </div>
              <h3 className="fs-6 fw-bold text-dark mb-2">Download</h3>
              <p className="text-secondary small mb-0" style={{ lineHeight: '1.6' }}>
                Access original source-code zip archives instantly once approved.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default function HomePage() {
  return (
    <Suspense
      fallback={
        <div className="container py-5 text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      }
    >
      <HomePageContent />
    </Suspense>
  );
}
