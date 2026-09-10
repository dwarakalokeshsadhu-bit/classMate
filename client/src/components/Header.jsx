import React, { useState } from 'react';
import { BookOpen, Users, Search, Bell, Flame, FolderPlus, Check, Sparkles, ArrowRight } from 'lucide-react';

export default function Header({
  statusInfo,
  savedSubjects = [],
  currentSubject = 'General',
  onSelectSubject,
  onSaveCurrentSubject,
  searchQuery = '',
  onSearchChange,
  searchMatches = [],
  studyStreak = 3,
  dailyReminderEnabled = false,
  onToggleDailyReminder
}) {
  const [newSubjectInput, setNewSubjectInput] = useState('');
  const [showSubjectDialog, setShowSubjectDialog] = useState(false);
  const [savedFeedback, setSavedFeedback] = useState(false);

  const isLiveAI = statusInfo?.mode === 'live-ai';

  const handleCreateSubject = (e) => {
    e.preventDefault();
    if (newSubjectInput.trim()) {
      onSaveCurrentSubject(newSubjectInput.trim());
      setNewSubjectInput('');
      setShowSubjectDialog(false);
      setSavedFeedback(true);
      setTimeout(() => setSavedFeedback(false), 2000);
    }
  };

  return (
    <header className="app-header">
      <div className="brand-group">
        <div className="brand-icon-wrapper" style={{ padding: 3, background: '#ffffff', borderRadius: 8 }}>
          <img src="/logo.png" alt="Class Mate" style={{ width: 26, height: 26, objectFit: 'contain' }} />
        </div>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <h1 className="brand-title">Class Mate</h1>
            <span className="version-pill">v2.0</span>
          </div>
          <p className="brand-subtitle">Learning that adapts to you</p>
        </div>
      </div>

      {/* Global Search Bar */}
      <div className="header-search-wrapper" style={{ position: 'relative' }}>
        <Search size={15} className="header-search-icon" />
        <input
          type="text"
          className="header-search-input"
          placeholder="Search notes, flashcards, topics across subjects..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
        />
        {searchQuery && (
          <button
            type="button"
            className="search-clear-btn"
            onClick={() => onSearchChange('')}
          >
            &times;
          </button>
        )}

        {/* Global Search Cross-Subject Matches Dropdown */}
        {searchQuery.trim() && searchMatches && searchMatches.length > 0 && (
          <div style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            marginTop: 6,
            background: 'white',
            border: '1px solid #e2e8f0',
            borderRadius: 8,
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
            zIndex: 100,
            padding: '8px 12px'
          }}>
            <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b', marginBottom: 6 }}>
              🔍 MATCHES ACROSS SAVED SUBJECTS:
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {searchMatches.map((m) => (
                <button
                  key={m.subject}
                  type="button"
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '6px 10px',
                    borderRadius: 6,
                    border: '1px solid #f1f5f9',
                    background: currentSubject === m.subject ? '#ede9fe' : '#f8fafc',
                    cursor: 'pointer',
                    fontSize: '0.82rem',
                    textAlign: 'left'
                  }}
                  onClick={() => {
                    onSelectSubject(m.subject);
                  }}
                >
                  <span style={{ fontWeight: 600, color: '#1e293b' }}>📁 {m.subject}</span>
                  <span style={{ fontSize: '0.72rem', color: '#6366f1', display: 'flex', alignItems: 'center', gap: 4 }}>
                    {m.count} match{m.count > 1 ? 'es' : ''} <ArrowRight size={12} />
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Subject Management & Stats */}
      <div className="header-actions">
        {/* Subject selector */}
        <div className="subject-dropdown-wrapper">
          <select
            className="subject-select"
            value={currentSubject}
            onChange={(e) => onSelectSubject(e.target.value)}
          >
            <option value="General">📁 General Notes</option>
            {savedSubjects.filter(s => s !== 'General').map((sub) => (
              <option key={sub} value={sub}>📁 {sub}</option>
            ))}
          </select>

          <button
            type="button"
            className="btn-icon-subtle"
            title="Save under new subject folder"
            onClick={() => setShowSubjectDialog(!showSubjectDialog)}
          >
            {savedFeedback ? <Check size={16} color="#10b981" /> : <FolderPlus size={16} />}
          </button>
        </div>

        {/* Daily Revision Reminder Toggle */}
        <button
          type="button"
          className={`btn-icon-subtle ${dailyReminderEnabled ? 'active-reminder' : ''}`}
          title={dailyReminderEnabled ? 'Daily revision reminder active' : 'Turn on daily revision reminders'}
          onClick={onToggleDailyReminder}
        >
          <Bell size={16} color={dailyReminderEnabled ? '#4f46e5' : '#64748b'} />
        </button>

        {/* Server & AI status */}
        <div className="team-badge" title={isLiveAI ? 'Live Gemini 2.5 Active' : 'Smart Offline Fallback Mode'}>
          <span
            className="status-dot"
            style={{ background: isLiveAI ? '#10b981' : '#f59e0b' }}
          />
          <span style={{ fontSize: '0.75rem', fontWeight: 700 }}>
            {isLiveAI ? 'Gemini 2.5' : 'Smart Demo'}
          </span>
          <span style={{ opacity: 0.5 }}>|</span>
          <Users size={13} />
          <span style={{ fontSize: '0.75rem' }}>Team 07</span>
        </div>
      </div>

      {/* Add subject modal popup */}
      {showSubjectDialog && (
        <div className="subject-dialog-popover">
          <form onSubmit={handleCreateSubject}>
            <p className="popover-title">Organize into Subject Folder</p>
            <input
              type="text"
              className="popover-input"
              placeholder="e.g. Operating Systems, Biology..."
              value={newSubjectInput}
              onChange={(e) => setNewSubjectInput(e.target.value)}
              autoFocus
            />
            <div style={{ display: 'flex', gap: 8, marginTop: 10, justifyContent: 'flex-end' }}>
              <button
                type="button"
                className="btn-secondary"
                style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                onClick={() => setShowSubjectDialog(false)}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn-primary"
                style={{ width: 'auto', padding: '6px 14px', fontSize: '0.8rem' }}
              >
                Save Folder
              </button>
            </div>
          </form>
        </div>
      )}
    </header>
  );
}
