'use client';

import React, { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthContext';
import {
  Download,
  Eye,
  Heart,
  ExternalLink,
  Youtube,
  FolderCode,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Clock,
  CreditCard,
  Send,
  Layers,
  Sparkles,
} from 'lucide-react';

interface Project {
  id: string;
  title: string;
  slug: string;
  shortDescription: string;
  description: string;
  version: string;
  liveDemoUrl: string | null;
  isPremium: boolean;
  price: number;
  thumbnail: string | null;
  youtubeUrl: string | null;
  youtubeRequiredDuration: number;
  downloadCount: number;
  viewCount: number;
  category: { name: string; slug: string };
  techStack: string[];
  isWishlisted: boolean;
  hasClaimed: boolean;
  hasPurchased: boolean;
}

interface RelatedProject {
  id: string;
  title: string;
  slug: string;
  thumbnail: string | null;
  isPremium: boolean;
  price: number;
}

export default function ProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();

  const [project, setProject] = useState<Project | null>(null);
  const [related, setRelated] = useState<RelatedProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);

  // Free Claim / YouTube verification state
  const [watchedSeconds, setWatchedSeconds] = useState(0);
  const [isWatching, setIsWatching] = useState(false);
  const [verifyingClaim, setVerifyingClaim] = useState(false);
  const [claimSuccess, setClaimSuccess] = useState(false);
  const [claimError, setClaimError] = useState<string | null>(null);

  // Donation / Purchase Modal state
  const [showBuyModal, setShowBuyModal] = useState(false);
  const [donationAmount, setDonationAmount] = useState<string>('29');
  const [paymentMethod, setPaymentMethod] = useState('USDT (TRC20)');
  const [paymentProof, setPaymentProof] = useState('');
  const [txNotes, setTxNotes] = useState('');
  const [submittingPayment, setSubmittingPayment] = useState(false);
  const [paymentSubmitted, setPaymentSubmitted] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);

  const watchTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!params.id) return;
    setLoading(true);

    fetch(`/api/projects/${params.id}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.project) {
          setProject(data.project);
          setIsWishlisted(data.project.isWishlisted);
          setClaimSuccess(data.project.hasClaimed);
          setDonationAmount(String(data.project.price || '29'));
        }
        if (data.related) setRelated(data.related);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [params.id]);

  // YouTube watch simulation / tracker
  useEffect(() => {
    if (isWatching) {
      watchTimerRef.current = setInterval(() => {
        setWatchedSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      if (watchTimerRef.current) clearInterval(watchTimerRef.current);
    }
    return () => {
      if (watchTimerRef.current) clearInterval(watchTimerRef.current);
    };
  }, [isWatching]);

  const toggleWishlist = async () => {
    if (!user) {
      router.push('/auth/login');
      return;
    }
    if (!project) return;

    setWishlistLoading(true);
    try {
      const res = await fetch('/api/wishlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId: project.id }),
      });
      const data = await res.json();
      if (res.ok) {
        setIsWishlisted(data.wishlisted);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setWishlistLoading(false);
    }
  };

  const handleVerifyFreeClaim = async () => {
    if (!user) {
      router.push('/auth/login');
      return;
    }
    if (!project) return;

    setVerifyingClaim(true);
    setClaimError(null);

    try {
      const res = await fetch('/api/claims/verify-youtube', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId: project.id,
          watchedSeconds,
        }),
      });
      const data = await res.json();

      if (res.ok && data.verified) {
        setClaimSuccess(true);
        setIsWatching(false);
      } else {
        setClaimError(data.error || 'Verification failed');
      }
    } catch (err: any) {
      setClaimError(err.message || 'Network error');
    } finally {
      setVerifyingClaim(false);
    }
  };

  const handleSubmitPurchase = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      router.push('/auth/login');
      return;
    }
    if (!project) return;

    setSubmittingPayment(true);
    setPaymentError(null);

    try {
      const res = await fetch('/api/purchases', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId: project.id,
          amount: parseFloat(donationAmount),
          paymentMethod,
          transactionReference: paymentProof,
          notes: txNotes,
        }),
      });
      const data = await res.json();

      if (res.ok) {
        setPaymentSubmitted(true);
      } else {
        setPaymentError(data.error || 'Failed to submit transaction.');
      }
    } catch (err: any) {
      setPaymentError(err.message || 'Network error');
    } finally {
      setSubmittingPayment(false);
    }
  };

  if (loading) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading project...</span>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="container py-5 text-center">
        <div className="glass-card p-5 mx-auto rounded-4" style={{ maxWidth: '480px' }}>
          <h4 className="fw-bold text-dark mb-2">Project Not Found</h4>
          <p className="text-secondary small mb-4">This project does not exist or has been unpublished.</p>
          <Link href="/#projects" className="btn-pill btn-pill-primary small">
            Back to Marketplace
          </Link>
        </div>
      </div>
    );
  }

  const isUnlocked =
    user?.role === 'ADMIN' ||
    (project.isPremium && project.hasPurchased) ||
    (!project.isPremium && claimSuccess);

  return (
    <div className="container py-4 py-md-5">
      <div className="row g-4 g-lg-5">
        {/* Main Column */}
        <div className="col-lg-8">
          <div className="glass-card overflow-hidden rounded-4 border shadow-sm">
            {/* Project Image */}
            <div className="position-relative overflow-hidden" style={{ maxHeight: '380px' }}>
              <img
                src={
                  project.thumbnail ||
                  'https://images.unsplash.com/photo-1556742049-0a67e5572263?auto=format&fit=crop&w=1200&q=80'
                }
                alt={project.title}
                className="w-100 object-fit-cover"
                style={{ maxHeight: '380px' }}
              />
            </div>

            <div className="p-4 p-md-5">
              {/* Header Info */}
              <div className="d-flex flex-column flex-md-row align-items-start justify-content-between gap-3 mb-4">
                <div className="flex-grow-1">
                  <div className="d-flex align-items-center gap-2 mb-2">
                    <span className="category-pill">
                      <FolderCode size={13} className="text-primary" />
                      {project.category.name}
                    </span>
                    <span className="badge rounded-pill bg-light text-secondary border small">
                      v{project.version}
                    </span>
                  </div>

                  <h1 className="fs-3 fw-bold text-dark mb-2" style={{ lineHeight: '1.3' }}>
                    {project.title}
                  </h1>

                  <p className="text-muted small mb-0">
                    By <strong className="text-dark">codetai</strong> • Site Owner & Verified Creator
                  </p>
                </div>

                {/* Stats badge */}
                <div
                  className="p-3 rounded-4 bg-light border text-center d-flex d-md-block gap-4 gap-md-0"
                  style={{ minWidth: '120px' }}
                >
                  <div className="mb-md-2">
                    <div className="fs-5 fw-bold text-dark">{project.downloadCount}</div>
                    <div className="text-muted small" style={{ fontSize: '0.75rem' }}>
                      downloads
                    </div>
                  </div>
                  <div className="border-top-md pt-md-2 border-start ps-3 ps-md-0 border-start-md-0">
                    <div className="fs-5 fw-bold text-dark">{project.viewCount}</div>
                    <div className="text-muted small" style={{ fontSize: '0.75rem' }}>
                      views
                    </div>
                  </div>
                </div>
              </div>

              {/* Short description */}
              <p className="lead fs-6 text-secondary mb-4 leading-relaxed" style={{ lineHeight: '1.7' }}>
                {project.shortDescription}
              </p>

              {/* Technologies */}
              {project.techStack && project.techStack.length > 0 && (
                <div className="mb-4">
                  <span className="text-uppercase fw-bold text-muted d-block mb-2" style={{ fontSize: '0.725rem', letterSpacing: '0.05em' }}>
                    Technologies & Stack
                  </span>
                  <div className="d-flex flex-wrap gap-2">
                    {project.techStack.map((tech, i) => (
                      <span key={i} className="badge rounded-pill bg-light text-dark border px-3 py-1.5 fw-medium small">
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Live Demo Link */}
              {project.liveDemoUrl && (
                <div className="mb-4">
                  <a
                    href={project.liveDemoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-pill btn-pill-outline small py-2 px-3"
                  >
                    <ExternalLink size={15} /> Open Live Web Demo
                  </a>
                </div>
              )}

              {/* Full Description Section */}
              <div className="border-top pt-4 mb-4">
                <h3 className="fs-5 fw-bold text-dark mb-3">Project Overview</h3>
                <div
                  className="text-secondary small leading-relaxed"
                  style={{ whiteSpace: 'pre-line', lineHeight: '1.8' }}
                >
                  {project.description}
                </div>
              </div>

              {/* ================= GATED DOWNLOAD / CLAIM SECTION ================= */}
              <div id="claim" className="border-top pt-4">
                {isUnlocked ? (
                  /* UNLOCKED STATE */
                  <div className="p-4 rounded-4 bg-success-subtle border border-success-subtle text-success-emphasis">
                    <div className="d-flex align-items-center gap-2 mb-2">
                      <CheckCircle2 size={24} className="text-success" />
                      <h4 className="fs-5 fw-bold mb-0">Source Code Unlocked!</h4>
                    </div>
                    <p className="small mb-3">
                      Your access has been successfully authorized and verified. You can download the complete original source package now.
                    </p>
                    <a
                      href={`/api/downloads/${project.id}`}
                      className="btn-pill btn-pill-primary px-4 py-2.5 shadow-sm text-nowrap"
                    >
                      <Download size={18} /> Download Source Code Archive (.zip)
                    </a>
                  </div>
                ) : project.isPremium ? (
                  /* PREMIUM PURCHASE / DONATE PROMPT */
                  <div id="buy" className="p-4 rounded-4 bg-light border">
                    <div className="d-flex flex-column flex-sm-row align-items-start align-items-sm-center justify-content-between gap-3 mb-3">
                      <div>
                        <span className="badge rounded-pill bg-gradient-primary text-white mb-1">
                          Premium Project
                        </span>
                        <h4 className="fs-5 fw-bold text-dark mb-1">Support Creator & Unlock Source Code</h4>
                        <p className="text-secondary small mb-0">
                          Donate minimum <strong className="text-dark">${project.price.toFixed(2)} USD</strong> to unlock full source access.
                        </p>
                      </div>
                      <div className="fs-3 fw-extrabold text-primary">
                        ${project.price.toFixed(2)}
                      </div>
                    </div>

                    <div className="d-flex flex-wrap gap-2">
                      <button
                        onClick={() => setShowBuyModal(true)}
                        className="btn-pill btn-pill-primary px-4 py-2.5 shadow-sm"
                      >
                        <CreditCard size={18} /> Donate & Download
                      </button>
                      <button
                        onClick={toggleWishlist}
                        disabled={wishlistLoading}
                        className={`btn-pill btn-pill-outline px-3.5 py-2.5 ${isWishlisted ? 'text-danger' : ''}`}
                      >
                        <Heart size={16} fill={isWishlisted ? 'currentColor' : 'none'} />
                        {isWishlisted ? 'Saved to Wishlist' : 'Add to Wishlist'}
                      </button>
                    </div>
                  </div>
                ) : (
                  /* FREE CLAIM / YOUTUBE WATCH REQUIREMENT */
                  <div className="p-4 rounded-4 bg-light border">
                    <div className="d-flex align-items-center justify-content-between mb-3">
                      <div>
                        <span className="badge rounded-pill bg-success text-white mb-1">
                          Free Download
                        </span>
                        <h4 className="fs-5 fw-bold text-dark mb-1">YouTube Verification Required</h4>
                        <p className="text-secondary small mb-0">
                          Watch the tutorial demo video for at least{' '}
                          <strong>{project.youtubeRequiredDuration} seconds</strong> to unlock this free source package.
                        </p>
                      </div>
                    </div>

                    {claimError && (
                      <div className="alert alert-danger py-2 small d-flex align-items-center gap-2 mb-3">
                        <AlertCircle size={16} /> {claimError}
                      </div>
                    )}

                    {/* YouTube Watch Tracker UI */}
                    <div className="p-3 bg-white rounded-3 border mb-3">
                      <div className="d-flex align-items-center justify-content-between mb-2">
                        <div className="d-flex align-items-center gap-2 small fw-semibold text-dark">
                          <Youtube size={18} className="text-danger" />
                          <span>Watch Progress</span>
                        </div>
                        <span className="badge bg-secondary-subtle text-secondary rounded-pill small">
                          {watchedSeconds}s / {project.youtubeRequiredDuration}s
                        </span>
                      </div>

                      {/* Progress Bar */}
                      <div className="progress mb-3" style={{ height: '8px' }}>
                        <div
                          className="progress-bar bg-primary progress-bar-striped progress-bar-animated"
                          style={{
                            width: `${Math.min(
                              100,
                              (watchedSeconds / project.youtubeRequiredDuration) * 100
                            )}%`,
                          }}
                        ></div>
                      </div>

                      <div className="d-flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => setIsWatching(!isWatching)}
                          className={`btn btn-sm ${
                            isWatching ? 'btn-outline-danger' : 'btn-outline-primary'
                          } rounded-pill px-3 py-1.5 fw-semibold small`}
                        >
                          {isWatching ? 'Pause Watching' : '▶ Start Watching Video'}
                        </button>

                        <button
                          type="button"
                          disabled={watchedSeconds < project.youtubeRequiredDuration || verifyingClaim}
                          onClick={handleVerifyFreeClaim}
                          className="btn-pill btn-pill-primary small py-1.5 px-3"
                        >
                          <ShieldCheck size={16} />
                          {verifyingClaim ? 'Verifying with Server...' : 'Verify & Unlock Download'}
                        </button>
                      </div>
                    </div>

                    <div className="d-flex align-items-center gap-2">
                      <button
                        onClick={toggleWishlist}
                        disabled={wishlistLoading}
                        className={`btn-pill btn-pill-outline small py-2 px-3.5 ${isWishlisted ? 'text-danger' : ''}`}
                      >
                        <Heart size={15} fill={isWishlisted ? 'currentColor' : 'none'} />
                        {isWishlisted ? 'Saved' : 'Save to Wishlist'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar: Related Projects & Support */}
        <div className="col-lg-4">
          <div className="d-flex flex-column gap-4">
            {/* Related Projects Card */}
            <div className="glass-card p-4 rounded-4 border shadow-sm">
              <h3 className="fs-6 fw-bold text-dark mb-3 d-flex align-items-center gap-2">
                <Layers size={18} className="text-primary" />
                Related Projects
              </h3>

              {related.length === 0 ? (
                <p className="text-muted small mb-0">No other projects in this category yet.</p>
              ) : (
                <div className="d-flex flex-column gap-3">
                  {related.map((item) => (
                    <Link
                      key={item.id}
                      href={`/project/${item.slug}`}
                      className="p-2.5 rounded-3 bg-white border text-decoration-none d-flex align-items-center gap-3 hover-shadow transition"
                    >
                      <img
                        src={
                          item.thumbnail ||
                          'https://images.unsplash.com/photo-1556742049-0a67e5572263?auto=format&fit=crop&w=200&q=80'
                        }
                        alt={item.title}
                        className="rounded-3 object-fit-cover"
                        style={{ width: '60px', height: '60px' }}
                      />
                      <div className="flex-grow-1 min-w-0">
                        <h4 className="fs-6 fw-bold text-dark mb-1 text-truncate" style={{ fontSize: '0.875rem' }}>
                          {item.title}
                        </h4>
                        <span className="small fw-semibold text-primary">
                          {item.isPremium ? `$${item.price.toFixed(2)}` : 'FREE'}
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Quick Developer Support */}
            <div className="glass-card p-4 rounded-4 border shadow-sm">
              <h3 className="fs-6 fw-bold text-dark mb-2">Need Assistance?</h3>
              <p className="text-secondary small mb-3">
                Have questions regarding installation, dependencies, or customization?
              </p>
              <div className="d-flex flex-column gap-2">
                <a
                  href="https://t.me/codetai"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-pill btn-pill-cyan small w-100 justify-content-center py-2"
                >
                  <Send size={15} /> Contact Developer on Telegram
                </a>
                <a
                  href="https://www.youtube.com/@Codetai"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-pill btn-pill-outline small w-100 justify-content-center py-2"
                >
                  <Youtube size={15} className="text-danger" /> Watch Video Setup Guides
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ================= PURCHASE / DONATION MODAL ================= */}
      {showBuyModal && (
        <div
          className="modal show d-block"
          tabIndex={-1}
          style={{ background: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(8px)' }}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content rounded-4 border-0 shadow-lg">
              <div className="modal-header border-0 pb-0">
                <h5 className="modal-title fw-bold text-dark">
                  Support & Purchase Source Code
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => {
                    setShowBuyModal(false);
                    setPaymentSubmitted(false);
                    setPaymentError(null);
                  }}
                ></button>
              </div>

              <div className="modal-body p-4">
                {paymentSubmitted ? (
                  <div className="text-center py-4">
                    <CheckCircle2 size={48} className="text-success mb-3 mx-auto" />
                    <h4 className="fw-bold text-dark mb-2">Proof Submitted!</h4>
                    <p className="text-secondary small mb-4">
                      Your transaction proof has been recorded in the database. Once our admin verifies the transfer, your download will be unlocked in your Dashboard.
                    </p>
                    <div className="d-flex justify-content-center gap-2">
                      <Link href="/dashboard/donations" className="btn-pill btn-pill-primary small py-2 px-4">
                        View in Dashboard
                      </Link>
                      <button
                        onClick={() => setShowBuyModal(false)}
                        className="btn-pill btn-pill-outline small py-2 px-4"
                      >
                        Close
                      </button>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleSubmitPurchase}>
                    <p className="text-secondary small mb-3">
                      Complete your contribution to receive the full repository source package for{' '}
                      <strong className="text-dark">{project.title}</strong>.
                    </p>

                    {paymentError && (
                      <div className="alert alert-danger py-2 small d-flex align-items-center gap-2 mb-3">
                        <AlertCircle size={16} /> {paymentError}
                      </div>
                    )}

                    <div className="mb-3">
                      <label className="form-label small fw-semibold text-secondary">
                        Contribution / Price (USD)
                      </label>
                      <div className="input-group">
                        <span className="input-group-text">$</span>
                        <input
                          type="number"
                          step="0.01"
                          min={project.price}
                          value={donationAmount}
                          onChange={(e) => setDonationAmount(e.target.value)}
                          required
                          className="form-control"
                        />
                      </div>
                    </div>

                    <div className="mb-3">
                      <label className="form-label small fw-semibold text-secondary">
                        Payment Gateway / Method
                      </label>
                      <select
                        value={paymentMethod}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="form-select"
                      >
                        <option value="USDT (TRC20)">Crypto - USDT (TRC20)</option>
                        <option value="Bitcoin (BTC)">Crypto - Bitcoin (BTC)</option>
                        <option value="PayPal">PayPal Transfer</option>
                        <option value="Direct Bank Wire">Direct Bank Wire</option>
                      </select>
                    </div>

                    <div className="p-3 bg-light rounded-3 border mb-3 small text-secondary">
                      <div className="fw-semibold text-dark mb-1">Payment Instructions:</div>
                      Send <strong className="text-primary">${donationAmount} USD</strong> to our official address:{' '}
                      <code className="text-dark bg-white px-2 py-0.5 rounded border">
                        TXyzDevGiveSupportWallet998822
                      </code>
                    </div>

                    <div className="mb-3">
                      <label className="form-label small fw-semibold text-secondary">
                        Transaction Hash / Reference / Proof
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. 0x8a92... or PayPal Txn ID"
                        value={paymentProof}
                        onChange={(e) => setPaymentProof(e.target.value)}
                        required
                        className="form-control"
                      />
                    </div>

                    <div className="mb-4">
                      <label className="form-label small fw-semibold text-secondary">
                        Notes (Optional)
                      </label>
                      <textarea
                        rows={2}
                        placeholder="Any additional notes for the developer..."
                        value={txNotes}
                        onChange={(e) => setTxNotes(e.target.value)}
                        className="form-control"
                      ></textarea>
                    </div>

                    <div className="d-flex justify-content-end gap-2">
                      <button
                        type="button"
                        onClick={() => setShowBuyModal(false)}
                        className="btn-pill btn-pill-outline small py-2 px-3.5"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={submittingPayment}
                        className="btn-pill btn-pill-primary small py-2 px-4"
                      >
                        {submittingPayment ? 'Submitting...' : 'Confirm & Submit Proof'}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
