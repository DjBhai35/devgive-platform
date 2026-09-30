'use client';

import React, { useEffect, useState } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { Settings, Save, CheckCircle2, AlertCircle } from 'lucide-react';

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchSettings = () => {
    fetch('/api/admin/settings')
      .then((r) => r.json())
      .then((data) => {
        if (data.settings) setSettings(data.settings);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleChange = (key: string, value: string) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage(null);

    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ settings }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage({ type: 'success', text: 'Platform settings updated successfully!' });
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to update settings.' });
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Network error' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AdminLayout>
      <div className="glass-card p-4 rounded-4 border shadow-sm" style={{ maxWidth: '800px' }}>
        <h1 className="fs-4 fw-bold text-dark mb-1">Global Platform Settings</h1>
        <p className="text-secondary small mb-4">
          Control application behavior, branding, payment details, and verification requirements.
        </p>

        {message && (
          <div
            className={`alert ${
              message.type === 'success' ? 'alert-success' : 'alert-danger'
            } d-flex align-items-center gap-2 py-2 small mb-4`}
          >
            {message.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
            {message.text}
          </div>
        )}

        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status"></div>
          </div>
        ) : (
          <form onSubmit={handleSave}>
            <div className="row g-3">
              <div className="col-12 col-md-6">
                <label className="form-label small fw-semibold text-secondary">Platform Name</label>
                <input
                  type="text"
                  value={settings.site_name || ''}
                  onChange={(e) => handleChange('site_name', e.target.value)}
                  className="form-control form-control-saas"
                />
              </div>

              <div className="col-12 col-md-6">
                <label className="form-label small fw-semibold text-secondary">Currency Code</label>
                <input
                  type="text"
                  value={settings.currency || 'USD'}
                  onChange={(e) => handleChange('currency', e.target.value)}
                  className="form-control form-control-saas"
                />
              </div>

              <div className="col-12">
                <label className="form-label small fw-semibold text-secondary">SEO Platform Title</label>
                <input
                  type="text"
                  value={settings.site_title || ''}
                  onChange={(e) => handleChange('site_title', e.target.value)}
                  className="form-control form-control-saas"
                />
              </div>

              <div className="col-12">
                <label className="form-label small fw-semibold text-secondary">Meta Description</label>
                <textarea
                  rows={2}
                  value={settings.site_description || ''}
                  onChange={(e) => handleChange('site_description', e.target.value)}
                  className="form-control form-control-saas"
                ></textarea>
              </div>

              <div className="col-12 col-md-6">
                <label className="form-label small fw-semibold text-secondary">
                  Default YouTube Watch Duration (seconds)
                </label>
                <input
                  type="number"
                  value={settings.youtube_default_duration || '60'}
                  onChange={(e) => handleChange('youtube_default_duration', e.target.value)}
                  className="form-control form-control-saas"
                />
              </div>

              <div className="col-12 col-md-6">
                <label className="form-label small fw-semibold text-secondary">Allow New Registrations</label>
                <select
                  value={settings.allow_registration || 'true'}
                  onChange={(e) => handleChange('allow_registration', e.target.value)}
                  className="form-select"
                >
                  <option value="true">Enabled (Open to Public)</option>
                  <option value="false">Disabled (Invite Only)</option>
                </select>
              </div>

              <div className="col-12 col-md-6">
                <label className="form-label small fw-semibold text-secondary">Official Telegram URL</label>
                <input
                  type="url"
                  value={settings.telegram_url || ''}
                  onChange={(e) => handleChange('telegram_url', e.target.value)}
                  className="form-control form-control-saas"
                />
              </div>

              <div className="col-12 col-md-6">
                <label className="form-label small fw-semibold text-secondary">Official YouTube Channel URL</label>
                <input
                  type="url"
                  value={settings.youtube_channel_url || ''}
                  onChange={(e) => handleChange('youtube_channel_url', e.target.value)}
                  className="form-control form-control-saas"
                />
              </div>

              <div className="col-12">
                <label className="form-label small fw-semibold text-secondary">
                  Manual Payment & Contribution Instructions
                </label>
                <textarea
                  rows={3}
                  value={settings.manual_payment_info || ''}
                  onChange={(e) => handleChange('manual_payment_info', e.target.value)}
                  className="form-control form-control-saas"
                ></textarea>
              </div>

              <div className="col-12 pt-3">
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn-pill btn-pill-primary px-4 py-2 small"
                >
                  <Save size={16} /> {submitting ? 'Saving Settings...' : 'Save Changes'}
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </AdminLayout>
  );
}
