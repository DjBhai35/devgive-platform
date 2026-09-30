'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import DashboardLayout from '@/components/DashboardLayout';
import { Heart, Trash2, ExternalLink, Download } from 'lucide-react';

interface WishlistItem {
  id: string;
  projectId: string;
  createdAt: string;
  project: {
    id: string;
    title: string;
    slug: string;
    thumbnail: string | null;
    isPremium: boolean;
    price: number;
    downloadCount: number;
    category: { name: string };
  };
}

export default function WishlistPage() {
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchWishlist = () => {
    fetch('/api/wishlist')
      .then((r) => r.json())
      .then((data) => {
        if (data.wishlist) setItems(data.wishlist);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchWishlist();
  }, []);

  const handleRemove = async (projectId: string) => {
    try {
      const res = await fetch('/api/wishlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId }),
      });
      if (res.ok) {
        setItems((prev) => prev.filter((i) => i.projectId !== projectId));
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <DashboardLayout>
      <div className="glass-card p-4 rounded-4 border shadow-sm">
        <div className="d-flex align-items-center justify-content-between mb-4">
          <div>
            <h1 className="fs-4 fw-bold text-dark mb-1">My Wishlist & Favorites</h1>
            <p className="text-secondary small mb-0">
              Saved projects for quick access and downloads.
            </p>
          </div>
          <span className="badge rounded-pill bg-purple-subtle text-primary px-3 py-1.5 fw-bold">
            {items.length} {items.length === 1 ? 'item' : 'items'}
          </span>
        </div>

        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status"></div>
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-5">
            <Heart size={48} className="text-muted opacity-50 mb-3 mx-auto" />
            <h5 className="fw-bold text-dark">Your wishlist is empty</h5>
            <p className="text-muted small mb-3">You have not saved any projects to your favorites yet.</p>
            <Link href="/#projects" className="btn-pill btn-pill-primary small">
              Explore Projects
            </Link>
          </div>
        ) : (
          <div className="row g-3">
            {items.map((item) => (
              <div key={item.id} className="col-12 col-md-6">
                <div className="p-3 bg-white rounded-4 border shadow-2xs d-flex gap-3 align-items-center">
                  <img
                    src={
                      item.project.thumbnail ||
                      'https://images.unsplash.com/photo-1556742049-0a67e5572263?auto=format&fit=crop&w=400&q=80'
                    }
                    alt={item.project.title}
                    className="rounded-3 object-fit-cover"
                    style={{ width: '80px', height: '80px' }}
                  />
                  <div className="flex-grow-1 min-w-0">
                    <span className="badge bg-light text-secondary rounded-pill small mb-1">
                      {item.project.category.name}
                    </span>
                    <h4 className="fs-6 fw-bold text-dark mb-1 text-truncate">
                      <Link
                        href={`/project/${item.project.slug}`}
                        className="text-decoration-none text-dark hover-text-primary"
                      >
                        {item.project.title}
                      </Link>
                    </h4>
                    <div className="d-flex align-items-center justify-content-between mt-2">
                      <span className="fw-bold small text-primary">
                        {item.project.isPremium ? `$${item.project.price.toFixed(2)}` : 'FREE'}
                      </span>
                      <div className="d-flex align-items-center gap-1">
                        <Link
                          href={`/project/${item.project.slug}`}
                          className="btn btn-sm btn-outline-primary rounded-pill py-1 px-2.5 small"
                        >
                          View
                        </Link>
                        <button
                          onClick={() => handleRemove(item.projectId)}
                          className="btn btn-sm btn-outline-danger rounded-circle p-1.5"
                          title="Remove from favorites"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
