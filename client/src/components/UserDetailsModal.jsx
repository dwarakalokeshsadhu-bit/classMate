import React, { useState, useRef } from 'react';
import {
  User, Mail, GraduationCap, School, Flame, BookOpen,
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
  studyStreak = 1,
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
    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result;
      if (base64) {
        setFormData(prev => ({ ...prev, avatar: base64 }));
        setShowAvatarPicker(false);
      }
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
              <h3>Student Profile & Details</h3>
              <p>Academic credentials, active study stats & account info</p>
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
                src={formData.avatar || user?.avatar || "/avatar.png"}
                alt={formData.name}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
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
                Verified Student
              </span>
            </div>
            <div className="user-details-email-row">
              <Mail size={13} color="#8fa092" />
              <span>{formData.email}</span>
            </div>
            <div className="user-details-branch-row">
              <GraduationCap size={13} color="#96A78D" />
              <span>{formData.branch}</span>
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
            <div className="user-details-form-grid">
              <div className="user-details-form-group">
                <label>Full Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Student name"
                  required
                />
              </div>

              <div className="user-details-form-group">
                <label>Student Email / Roll ID</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="student@college.edu"
                  required
                />
              </div>

              <div className="user-details-form-group">
                <label>Student Roll Number</label>
                <input
                  type="text"
                  value={formData.rollNo}
                  onChange={(e) => setFormData({ ...formData, rollNo: e.target.value })}
                  placeholder="e.g. 24EG112B25"
                />
              </div>

              <div className="user-details-form-group">
                <label>Department / Academic Branch</label>
                <input
                  type="text"
                  value={formData.branch}
                  onChange={(e) => setFormData({ ...formData, branch: e.target.value })}
                  placeholder="e.g. Computer Science & Engineering"
                />
              </div>

              <div className="user-details-form-group">
                <label>College / University</label>
                <input
                  type="text"
                  value={formData.college}
                  onChange={(e) => setFormData({ ...formData, college: e.target.value })}
                  placeholder="e.g. Anurag University"
                />
              </div>

              <div className="user-details-form-group">
                <label>Current Semester / Year</label>
                <input
                  type="text"
                  value={formData.semester}
                  onChange={(e) => setFormData({ ...formData, semester: e.target.value })}
                  placeholder="e.g. 4th Semester (Year II)"
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
                <div className="user-stat-icon-wrap" style={{ background: 'rgba(217, 130, 43, 0.15)', color: '#D9822B' }}>
                  <Flame size={18} />
                </div>
                <div>
                  <div className="user-stat-value">{studyStreak} Days</div>
                  <div className="user-stat-label">Daily Streak 🔥</div>
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

            {/* Academic Information Details Section */}
            <div className="user-details-info-section">
              <h5 className="user-details-section-title">
                <School size={15} color="#96A78D" />
                Academic Information
              </h5>

              <div className="user-details-info-grid">
                <div className="user-details-info-item">
                  <span className="user-info-label">Roll Number / ID</span>
                  <span className="user-info-value font-mono">{formData.rollNo}</span>
                </div>

                <div className="user-details-info-item">
                  <span className="user-info-label">Institution</span>
                  <span className="user-info-value">{formData.college}</span>
                </div>

                <div className="user-details-info-item">
                  <span className="user-info-label">Department</span>
                  <span className="user-info-value">{formData.branch}</span>
                </div>

                <div className="user-details-info-item">
                  <span className="user-info-label">Academic Status</span>
                  <span className="user-info-value" style={{ color: '#96A78D', fontWeight: 600 }}>
                    {formData.semester}
                  </span>
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
