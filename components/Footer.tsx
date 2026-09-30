'use client';

import React from 'react';
import Link from 'next/link';
import { Code2, Send, Youtube } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-top bg-white py-5 mt-5">
      <div className="container text-center" style={{ maxWidth: '780px' }}>
        {/* Brand */}
        <div className="d-flex align-items-center justify-content-center gap-2 mb-3">
          <div
            className="d-flex align-items-center justify-content-center text-white rounded-3 shadow-sm"
            style={{
              width: '42px',
              height: '42px',
              background: 'linear-gradient(135deg, #0284c7 0%, #4f46e5 100%)',
            }}
          >
            <Code2 size={24} strokeWidth={2.5} />
          </div>
          <span
            className="fs-3 fw-bold"
            style={{
              background: 'linear-gradient(135deg, #0f172a 0%, #312e81 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              letterSpacing: '-0.5px',
            }}
          >
            DevGive
          </span>
        </div>

        {/* About */}
        <p className="text-secondary small leading-relaxed mx-auto mb-4" style={{ maxWidth: '620px', lineHeight: '1.7' }}>
          DevGive is a developer-run platform for sharing original source code projects. Every project is built and maintained by the site owner and made available for learning, reference, and development use. Support the creator with a donation, or download select open-source projects for free.
        </p>

        {/* Social Icons */}
        <div className="d-flex align-items-center justify-content-center gap-3 mb-4">
          <a
            href="https://t.me/codetai"
            target="_blank"
            rel="noopener noreferrer"
            className="d-inline-flex align-items-center justify-content-center text-white rounded-circle shadow-sm text-decoration-none"
            style={{
              width: '42px',
              height: '42px',
              background: 'linear-gradient(135deg, #38bdf8 0%, #2563eb 100%)',
              transition: 'transform 0.2s ease',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.1)')}
            onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
            title="Telegram Support"
          >
            <Send size={18} style={{ transform: 'translateX(-1px)' }} />
          </a>
          <a
            href="https://www.youtube.com/@Codetai"
            target="_blank"
            rel="noopener noreferrer"
            className="d-inline-flex align-items-center justify-content-center text-white rounded-circle shadow-sm text-decoration-none"
            style={{
              width: '42px',
              height: '42px',
              background: 'linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)',
              transition: 'transform 0.2s ease',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.1)')}
            onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
            title="YouTube Channel"
          >
            <Youtube size={20} />
          </a>
        </div>

        {/* Copyright */}
        <div className="border-top pt-4 text-muted small">
          © 2026 DevGive. All rights reserved. Built with Next.js, TypeScript & Bootstrap.
        </div>
      </div>
    </footer>
  );
}
