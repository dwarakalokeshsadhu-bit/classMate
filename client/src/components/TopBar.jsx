import React from 'react';
import {
  ChevronRight, Share2, RotateCw, Flame, Search,
  Check, Download, Bell, BellRing, LogOut, User
} from 'lucide-react';

export default function TopBar({
  currentSubject = 'General',
  topicTitle = 'New Session',
  studyData,
  onReviseAgain,
  isRegenerating,
  onOpenShare,
  studyStreak = 1,
  dailyReminderEnabled,
  onToggleReminder,
  searchQuery,
  setSearchQuery,
  allDecks = {},
  onSelectSearchMatch,
  onBreadcrumbRootClick,
  onTopicClick,
  currentUser,
  onOpenUserDetails,
  onLogout
}) {
  const hasStudySet = Boolean(studyData);

  // Search matches
  const searchMatches = searchQuery.trim()
    ? Object.entries(allDecks)
        .filter(([sub, data]) => {
          const notes = data.notes || '';
          const summary = data.studyData?.summary || '';
          const query = searchQuery.toLowerCase();
          return (
            sub.toLowerCase().includes(query) ||
            notes.toLowerCase().includes(query) ||
            summary.toLowerCase().includes(query)
          );
        })
        .slice(0, 5)
    : [];

  return (
    <header className="top-app-bar">
      {/* Breadcrumbs */}
      <div className="top-bar-breadcrumbs">
        <span
          className="breadcrumb-root"
          onClick={onBreadcrumbRootClick}
          title="Go to Home / Input Notes"
          style={{ cursor: 'pointer' }}
        >
          My Sets
        </span>
        <ChevronRight size={14} className="breadcrumb-separator" />
        <span
          style={{ color: 'var(--text-muted)', cursor: 'pointer' }}
          onClick={onBreadcrumbRootClick}
          title={`Subject: ${currentSubject}`}
        >
          {currentSubject}
        </span>
        {hasStudySet && (
          <>
            <ChevronRight size={14} className="breadcrumb-separator" />
            <span
              className="breadcrumb-current"
              title={topicTitle}
              style={{ cursor: 'pointer' }}
              onClick={onTopicClick}
            >
              {topicTitle}
            </span>
          </>
        )}
      </div>

      {/* Right Action Tools */}
      <div className="top-bar-actions">
        {hasStudySet && (
          <button
            type="button"
            className="top-btn top-btn-primary"
            onClick={onReviseAgain}
            disabled={isRegenerating}
            title="Generate new question variations from current notes"
          >
            <RotateCw size={14} className={isRegenerating ? 'spinner' : ''} />
            <span>{isRegenerating ? 'Regenerating...' : 'Revise Again'}</span>
          </button>
        )}

        {hasStudySet && (
          <button
            type="button"
            className="top-btn"
            onClick={onOpenShare}
            title="Share or Export Study Deck"
          >
            <Share2 size={14} />
            <span>Share</span>
          </button>
        )}

        {/* Streak / Timer Badge */}
        <div className="top-streak-pill" title="Current Daily Active Revision Streak">
          <Flame size={14} color="#D9822B" />
          <span>{studyStreak}d Streak</span>
        </div>

        {/* Daily Reminder Toggle */}
        <button
          type="button"
          className="top-btn"
          onClick={onToggleReminder}
          style={{ padding: '6px 9px' }}
          title={dailyReminderEnabled ? 'Daily revision reminder active' : 'Enable daily revision notification'}
        >
          {dailyReminderEnabled ? <BellRing size={14} color="var(--primary)" /> : <Bell size={14} />}
        </button>

        {/* User Account Profile & Logout */}
        {currentUser && (
          <div className="user-profile-pill">
            <button
              type="button"
              onClick={onOpenUserDetails}
              className="user-profile-clickable-area"
              title={`Click to view user details & profile (${currentUser.name})`}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                padding: 0,
                color: 'inherit'
              }}
            >
              <div className="user-avatar-circle" style={{ overflow: 'hidden', padding: 0 }}>
                <img
                  src={currentUser.avatar || "/avatar.png"}
                  alt={currentUser.name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  onError={(e) => { e.currentTarget.style.display = 'none'; }}
                />
              </div>
              <span className="user-pill-name">{currentUser.name}</span>
            </button>
            <button
              type="button"
              className="user-logout-btn"
              onClick={onLogout}
              title="Sign Out / Switch Account"
            >
              <LogOut size={13} />
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
