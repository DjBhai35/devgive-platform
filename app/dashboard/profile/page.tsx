'use client';

import React, { useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { useAuth } from '@/components/AuthContext';
import { User, Lock, Save, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function ProfilePage() {
  const { user, refreshUser } = useAuth();

  // Profile fields
  const [name, setName] = useState(user?.name || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [country, setCountry] = useState(user?.country || '');
  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl || '');

  // Password fields
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Status
  const [profileMessage, setProfileMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [passwordMessage, setPasswordMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [submittingProfile, setSubmittingProfile] = useState(false);
  const [submittingPassword, setSubmittingPassword] = useState(false);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileMessage(null);
    setSubmittingProfile(true);

    try {
      const res = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, bio, country, avatarUrl }),
      });
      const data = await res.json();
      if (res.ok) {
        setProfileMessage({ type: 'success', text: 'Profile updated successfully!' });
        await refreshUser();
      } else {
        setProfileMessage({ type: 'error', text: data.error || 'Failed to update profile.' });
      }
    } catch (err: any) {
      setProfileMessage({ type: 'error', text: err.message || 'Network error' });
    } finally {
      setSubmittingProfile(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordMessage(null);

    if (newPassword !== confirmPassword) {
      setPasswordMessage({ type: 'error', text: 'New passwords do not match.' });
      return;
    }

    if (newPassword.length < 6) {
      setPasswordMessage({ type: 'error', text: 'New password must be at least 6 characters.' });
      return;
    }

    setSubmittingPassword(true);
    try {
      const res = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json();
      if (res.ok) {
        setPasswordMessage({ type: 'success', text: 'Password changed successfully!' });
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        setPasswordMessage({ type: 'error', text: data.error || 'Failed to change password.' });
      }
    } catch (err: any) {
      setPasswordMessage({ type: 'error', text: err.message || 'Network error' });
    } finally {
      setSubmittingPassword(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="d-flex flex-column gap-4">
        {/* Profile Card */}
        <div className="glass-card p-4 rounded-4 border shadow-sm">
          <div className="d-flex align-items-center gap-3 mb-4 border-bottom pb-3">
            <div
              className="d-flex align-items-center justify-content-center text-white rounded-circle shadow-sm"
              style={{ width: '48px', height: '48px', background: 'linear-gradient(135deg, #0ea5e9 0%, #6366f1 100%)' }}
            >
              <User size={24} />
            </div>
            <div>
              <h1 className="fs-5 fw-bold text-dark mb-0">Personal Profile</h1>
              <p className="text-secondary small mb-0">
                Manage your public details and identity on DevGive.
              </p>
            </div>
          </div>

          {profileMessage && (
            <div
              className={`alert ${
                profileMessage.type === 'success' ? 'alert-success' : 'alert-danger'
              } d-flex align-items-center gap-2 py-2 small mb-4`}
            >
              {profileMessage.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
              {profileMessage.text}
            </div>
          )}

          <form onSubmit={handleUpdateProfile}>
            <div className="row g-3">
              <div className="col-12 col-md-6">
                <label className="form-label small fw-semibold text-secondary">Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="form-control form-control-saas"
                />
              </div>

              <div className="col-12 col-md-6">
                <label className="form-label small fw-semibold text-secondary">Username</label>
                <input
                  type="text"
                  value={user?.username || ''}
                  disabled
                  className="form-control form-control-saas bg-light"
                  title="Username cannot be changed"
                />
              </div>

              <div className="col-12 col-md-6">
                <label className="form-label small fw-semibold text-secondary">Email Address</label>
                <input
                  type="email"
                  value={user?.email || ''}
                  disabled
                  className="form-control form-control-saas bg-light"
                  title="Email cannot be changed directly"
                />
              </div>

              <div className="col-12 col-md-6">
                <label className="form-label small fw-semibold text-secondary">Country / Location</label>
                <input
                  type="text"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  placeholder="e.g. United States, Germany"
                  className="form-control form-control-saas"
                />
              </div>

              <div className="col-12">
                <label className="form-label small fw-semibold text-secondary">Avatar URL</label>
                <input
                  type="url"
                  value={avatarUrl}
                  onChange={(e) => setAvatarUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="form-control form-control-saas"
                />
              </div>

              <div className="col-12">
                <label className="form-label small fw-semibold text-secondary">Bio / About Me</label>
                <textarea
                  rows={3}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Tell other developers about yourself and your tech stack..."
                  className="form-control form-control-saas"
                ></textarea>
              </div>

              <div className="col-12 pt-2">
                <button
                  type="submit"
                  disabled={submittingProfile}
                  className="btn-pill btn-pill-primary px-4 py-2 small"
                >
                  <Save size={15} /> {submittingProfile ? 'Saving...' : 'Save Profile'}
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* Change Password Card */}
        <div className="glass-card p-4 rounded-4 border shadow-sm">
          <div className="d-flex align-items-center gap-3 mb-4 border-bottom pb-3">
            <div
              className="d-flex align-items-center justify-content-center text-white rounded-circle shadow-sm"
              style={{ width: '48px', height: '48px', background: 'linear-gradient(135deg, #1e1b4b 0%, #4338ca 100%)' }}
            >
              <Lock size={22} />
            </div>
            <div>
              <h2 className="fs-5 fw-bold text-dark mb-0">Security & Password</h2>
              <p className="text-secondary small mb-0">
                Update your account password for enhanced security.
              </p>
            </div>
          </div>

          {passwordMessage && (
            <div
              className={`alert ${
                passwordMessage.type === 'success' ? 'alert-success' : 'alert-danger'
              } d-flex align-items-center gap-2 py-2 small mb-4`}
            >
              {passwordMessage.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
              {passwordMessage.text}
            </div>
          )}

          <form onSubmit={handleChangePassword}>
            <div className="row g-3">
              <div className="col-12 col-md-4">
                <label className="form-label small fw-semibold text-secondary">Current Password</label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="form-control form-control-saas"
                />
              </div>

              <div className="col-12 col-md-4">
                <label className="form-label small fw-semibold text-secondary">New Password</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="form-control form-control-saas"
                />
              </div>

              <div className="col-12 col-md-4">
                <label className="form-label small fw-semibold text-secondary">Confirm New Password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="form-control form-control-saas"
                />
              </div>

              <div className="col-12 pt-2">
                <button
                  type="submit"
                  disabled={submittingPassword}
                  className="btn-pill btn-pill-dark px-4 py-2 small"
                >
                  <Lock size={15} /> {submittingPassword ? 'Updating...' : 'Update Password'}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
}
