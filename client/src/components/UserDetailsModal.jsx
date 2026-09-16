import React, { useState, useRef } from 'react';
import {
  User, Mail, GraduationCap, School, BookOpen,
  Layers, CheckSquare, ShieldAlert, Edit3, Check, X,
  LogOut, ShieldCheck, Sparkles, Hash, Calendar, Award,
  Camera, Upload
} from 'lucide-react';

const PRESET_AVATARS = [
  { id: 'av-1', src: '/avatars/avatar-1.png', label: 'Male Student (Glasses)' },
  { id: 'av-2', src: '/avatars/avatar-2.png', label: 'Female Student (Blazer)' },
  { id: 'av-3', src: '/avatars/avatar-3.png', label: 'Student (Headphones)' }
];

export default function UserDetailsModal({
  user,
  onUpdateUser,
  onClose,
  onLogout,
  savedSubjects = [],
  studyData = null
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    name: user?.name || 'Student',
    email: user?.email || 'user1@student.college.edu',
    branch: user?.branch || 'Computer Science & Engineering',
    rollNo: user?.rollNo || '24EG112B25',
    college: user?.college || 'Anurag University',
    semester: user?.semester || '4th Semester (Year II)',
    avatar: user?.avatar || '/avatars/avatar-1.png'
  });
  const [saveSuccess, setSaveSuccess] = useState(false);

  const flashcardsCount = studyData?.flashcards?.length || 5;
  const quizCount = studyData?.quiz?.length || 4;
  const mistakeCount = studyData?.subtopics?.length || 2;

  const handleCustomAvatarUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    // Compress image via canvas to ~20KB (150x150 JPEG)
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const size = 150;
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');
        // Center-crop to square
        const minDim = Math.min(img.width, img.height);
        const sx = (img.width - minDim) / 2;
        const sy = (img.height - minDim) / 2;
        ctx.drawImage(img, sx, sy, minDim, minDim, 0, 0, size, size);
        const compressed = canvas.toDataURL('image/jpeg', 0.8);
        setFormData(prev => ({ ...prev, avatar: compressed }));
        setShowAvatarPicker(false);
        // Auto-save avatar immediately
        const updated = { ...user, avatar: compressed, avatarInitial: (formData.name?.trim()?.[0] || 'S').toUpperCase() };
        onUpdateUser(updated);
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      };
      img.src = event.target?.result;
    };
    reader.readAsDataURL(file);
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    const updated = {
      ...user,
      ...formData,
      avatarInitial: formData.name.trim()[0].toUpperCase()
    };

    onUpdateUser(updated);
    setIsEditing(false);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  return (
    <div className="user-details-backdrop" onClick={onClose}>
      <div className="user-details-modal" onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="user-details-header">
          <div className="user-details-header-title">
            <div className="user-details-icon-badge">
              <User size={18} color="#96A78D" />
            </div>
            <div>
              <h3>Profile & Account Details</h3>
              <p>Active study stats & account info</p>
            </div>
          </div>
          <button
            type="button"
            className="user-details-close-btn"
            onClick={onClose}
            title="Close modal"
          >
            <X size={18} />
          </button>
        </div>

        {/* Success Toast */}
        {saveSuccess && (
          <div className="user-details-toast">
            <Check size={16} color="#96A78D" />
            <span>Profile details successfully updated and saved!</span>
          </div>
        )}

        {/* Profile Card Hero */}
        <div className="user-details-hero">
          <div className="user-details-avatar-wrap">
            <div className="user-details-avatar" style={{ overflow: 'hidden', padding: 0, position: 'relative' }}>
              <img
                src={formData.avatar || user?.avatar || "/avatars/avatar-1.png"}
                alt={formData.name}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  // Show initials fallback
                  const parent = e.currentTarget.parentElement;
                  if (parent && !parent.querySelector('.avatar-initial-fallback')) {
                    const span = document.createElement('span');
                    span.className = 'avatar-initial-fallback';
                    span.textContent = (formData.name?.[0] || 'S').toUpperCase();
                    span.style.cssText = 'display:flex;align-items:center;justify-content:center;width:100%;height:100%;font-size:1.5rem;font-weight:700;color:#96A78D;background:rgba(150,167,141,0.15);';
                    parent.appendChild(span);
                  }
                }}
              />
            </div>
            <button
              type="button"
              className="user-details-avatar-cam-btn"
              onClick={() => setShowAvatarPicker(!showAvatarPicker)}
              title="Change profile picture"
            >
              <Camera size={13} />
            </button>
            <div className="user-details-online-dot" title="Online & Active" />
          </div>

          <div className="user-details-hero-info">
            <div className="user-details-name-row">
              <h4>{formData.name}</h4>
              <span className="user-details-status-badge">
                <ShieldCheck size={13} color="#96A78D" />
                Verified Account
              </span>
            </div>
            <div className="user-details-email-row">
              <Mail size={13} color="#8fa092" />
              <span>{formData.email}</span>
            </div>
          </div>

          <button
            type="button"
            className="user-details-edit-toggle-btn"
            onClick={() => setIsEditing(!isEditing)}
            title={isEditing ? 'Cancel editing' : 'Edit profile info'}
          >
            {isEditing ? <X size={14} /> : <Edit3 size={14} />}
            <span>{isEditing ? 'Cancel' : 'Edit Profile'}</span>
          </button>
        </div>

        {/* Interactive Avatar Selection Gallery */}
        {showAvatarPicker && (
          <div className="user-avatar-picker-panel">
            <div className="avatar-picker-title">
              <span>Choose Your Student Avatar</span>
              <button
                type="button"
                onClick={() => setShowAvatarPicker(false)}
                style={{ background: 'transparent', border: 'none', color: '#8fa092', cursor: 'pointer' }}
              >
                <X size={14} />
              </button>
            </div>
            <div className="avatar-presets-grid">
              {PRESET_AVATARS.map((av) => (
                <button
                  key={av.id}
                  type="button"
                  className={`avatar-preset-choice ${formData.avatar === av.src ? 'selected' : ''}`}
                  onClick={() => {
                    setFormData(prev => ({ ...prev, avatar: av.src }));
                    // Auto-save avatar immediately
                    const updated = { ...user, avatar: av.src, avatarInitial: (formData.name?.trim()?.[0] || 'S').toUpperCase() };
                    onUpdateUser(updated);
                    setSaveSuccess(true);
                    setTimeout(() => setSaveSuccess(false), 3000);
                  }}
                  title={av.label}
                >
                  <img src={av.src} alt={av.label} style={{ width: 44, height: 44, borderRadius: '50%', objectFit: 'cover' }} />
                  {formData.avatar === av.src && (
                    <div className="avatar-selected-badge">
                      <Check size={10} color="#fff" />
                    </div>
                  )}
                </button>
              ))}

              <button
                type="button"
                className="avatar-upload-choice-btn"
                onClick={() => fileInputRef.current?.click()}
                title="Upload custom photo from computer"
              >
                <Upload size={16} color="#96A78D" />
                <span>Upload Custom</span>
              </button>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleCustomAvatarUpload}
                accept="image/*"
                style={{ display: 'none' }}
              />
            </div>
          </div>
        )}

        {/* Content Area: Either Edit Form OR View Details */}
        {isEditing ? (
          <form onSubmit={handleSave} className="user-details-edit-form">
            <div className="user-details-form-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
              <div className="user-details-form-group">
                <label>Full Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Your full name"
                  required
                />
              </div>

              <div className="user-details-form-group">
                <label>Email Address</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="user@mail.com"
                  required
                />
              </div>
            </div>

            <div className="user-details-form-actions">
              <button
                type="button"
                className="user-details-btn-secondary"
                onClick={() => setIsEditing(false)}
              >
                Cancel
              </button>
              <button type="submit" className="user-details-btn-primary">
                <Check size={15} />
                Save Changes
              </button>
            </div>
          </form>
        ) : (
          <div className="user-details-view">
            {/* Quick Stats Grid */}
            <div className="user-details-stats-grid">
              <div className="user-stat-card">
                <div className="user-stat-icon-wrap" style={{ background: 'rgba(150, 167, 141, 0.18)', color: '#96A78D' }}>
                  <Sparkles size={18} />
                </div>
                <div>
                  <div className="user-stat-value">Smart AI</div>
                  <div className="user-stat-label">Pocket Mentor</div>
                </div>
              </div>

              <div className="user-stat-card">
                <div className="user-stat-icon-wrap" style={{ background: 'rgba(150, 167, 141, 0.18)', color: '#96A78D' }}>
                  <BookOpen size={18} />
                </div>
                <div>
                  <div className="user-stat-value">{savedSubjects.length}</div>
                  <div className="user-stat-label">Saved Subjects</div>
                </div>
              </div>

              <div className="user-stat-card">
                <div className="user-stat-icon-wrap" style={{ background: 'rgba(124, 58, 237, 0.15)', color: '#8b5cf6' }}>
                  <Layers size={18} />
                </div>
                <div>
                  <div className="user-stat-value">{flashcardsCount} Cards</div>
                  <div className="user-stat-label">Active Flashcards</div>
                </div>
              </div>

              <div className="user-stat-card">
                <div className="user-stat-icon-wrap" style={{ background: 'rgba(5, 150, 105, 0.15)', color: '#10b981' }}>
                  <CheckSquare size={18} />
                </div>
                <div>
                  <div className="user-stat-value">{quizCount} Qs</div>
                  <div className="user-stat-label">Quiz Ready</div>
                </div>
              </div>
            </div>

            {/* Enrolled Subjects Chips */}
            <div className="user-details-info-section" style={{ marginTop: 14 }}>
              <h5 className="user-details-section-title">
                <BookOpen size={15} color="#96A78D" />
                Active Study Subjects
              </h5>
              <div className="user-subjects-chips">
                {savedSubjects.map((sub) => (
                  <span key={sub} className="user-subject-chip">
                    📁 {sub}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Modal Footer Actions */}
        <div className="user-details-footer">
          <div className="user-details-footer-left">
            <span style={{ fontSize: '0.75rem', color: '#8fa092' }}>
              Logged in to Class Mate &bull; Active Local Session
            </span>
          </div>

          <div className="user-details-footer-right">
            <button
              type="button"
              className="user-details-logout-btn"
              onClick={() => {
                onClose();
                onLogout();
              }}
              title="Sign out of current account"
            >
              <LogOut size={14} />
              <span>Log Out</span>
            </button>

            <button
              type="button"
              className="user-details-close-action-btn"
              onClick={onClose}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
