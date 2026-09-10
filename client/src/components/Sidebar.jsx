import React from 'react';
import {
  BookOpen, Home, Layers, CheckSquare, BarChart2, ShieldAlert,
  Presentation, MessageSquare, Plus, ChevronLeft, ChevronRight,
  Folder, Calendar, Sparkles, BookMarked, Radio, LogOut, Bot
} from 'lucide-react';

export default function Sidebar({
  isCollapsed,
  onToggleCollapse,
  activeView,
  onSelectView,
  studyData,
  currentSubject,
  savedSubjects = [],
  onSelectSubject,
  onNewNotes,
  onOpenStudyPlan,
  activeDeckTitle = "Active Study Set",
  currentUser,
  onLogout
}) {
  const hasStudySet = Boolean(studyData);
  const flashcardsCount = studyData?.flashcards?.length || 0;
  const quizCount = studyData?.quiz?.length || 0;

  return (
    <aside className={`sidebar-togglebar ${isCollapsed ? 'collapsed' : ''}`}>
      <div>
        {/* Top Header & Collapse Button */}
        <div className="sidebar-top">
          <button
            type="button"
            className="sidebar-brand-wrapper sidebar-brand-btn"
            onClick={() => onSelectView('input')}
            title="Class Mate — Click to return to Home"
          >
            <div className="sidebar-logo-icon">
              <img src="/logo.png" alt="Class Mate" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
            </div>
            {!isCollapsed && (
              <div style={{ textAlign: 'left' }}>
                <div className="sidebar-brand-name">Class Mate</div>
                <div style={{ fontSize: '0.68rem', color: '#8fa092' }}>Learning that adapts to you</div>
              </div>
            )}
          </button>

          <button
            type="button"
            className="sidebar-collapse-btn"
            onClick={onToggleCollapse}
            title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
        </div>

        {/* Sidebar Nav Content */}
        <div className="sidebar-content">
          {/* Main Primary Navigation */}
          <div className="sidebar-nav-group">
            {!isCollapsed && <div className="sidebar-section-title">Navigation</div>}

            <button
              type="button"
              className={`sidebar-nav-btn ${activeView === 'input' ? 'active' : ''}`}
              onClick={() => onSelectView('input')}
              title="Home / Input Notes"
            >
              <span className="sidebar-nav-icon"><Home size={18} /></span>
              {!isCollapsed && <span className="sidebar-nav-label">Home</span>}
            </button>

            <button
              type="button"
              className={`sidebar-nav-btn ${activeView === 'plan' ? 'active' : ''}`}
              onClick={() => onSelectView('plan')}
              title="Study Plan & Exam Countdown"
            >
              <span className="sidebar-nav-icon"><Calendar size={18} /></span>
              {!isCollapsed && <span className="sidebar-nav-label">Study Plan</span>}
            </button>
          </div>

          {/* Active Study Set Sub-Menu (StudyFetch Style) */}
          {hasStudySet && (
            <div className="sidebar-nav-group" style={{ marginTop: 6 }}>
              {!isCollapsed && (
                <div className="sidebar-study-set-box">
                  <div className="study-set-header">
                    <span style={{ display: 'flex', alignItems: 'center', gap: 6, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      <BookMarked size={14} color="var(--primary)" />
                      {currentSubject}
                    </span>
                    <span className="study-set-pill">Active</span>
                  </div>
                  <div style={{ fontSize: '0.72rem', color: '#c2d2c4', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {activeDeckTitle}
                  </div>
                </div>
              )}

              {!isCollapsed && <div className="sidebar-section-title">Study Tools</div>}

              <button
                type="button"
                className={`sidebar-nav-btn ${activeView === 'summary' ? 'active' : ''}`}
                onClick={() => onSelectView('summary')}
                title="60-Second Summary & Concepts"
              >
                <span className="sidebar-nav-icon"><BookOpen size={18} /></span>
                {!isCollapsed && <span className="sidebar-nav-label">Summary & Concepts</span>}
              </button>

              <button
                type="button"
                className={`sidebar-nav-btn ${activeView === 'flashcards' ? 'active' : ''}`}
                onClick={() => onSelectView('flashcards')}
                title="Spaced Repetition Flashcards"
              >
                <span className="sidebar-nav-icon"><Layers size={18} /></span>
                {!isCollapsed && (
                  <>
                    <span className="sidebar-nav-label">Flashcards</span>
                    {flashcardsCount > 0 && <span className="sidebar-nav-badge">{flashcardsCount}</span>}
                  </>
                )}
              </button>

              <button
                type="button"
                className={`sidebar-nav-btn ${activeView === 'quiz' ? 'active' : ''}`}
                onClick={() => onSelectView('quiz')}
                title="Adaptive Quiz & Self-Test"
              >
                <span className="sidebar-nav-icon"><CheckSquare size={18} /></span>
                {!isCollapsed && (
                  <>
                    <span className="sidebar-nav-label">Practice Quiz</span>
                    {quizCount > 0 && <span className="sidebar-nav-badge">{quizCount}</span>}
                  </>
                )}
              </button>

              <button
                type="button"
                className={`sidebar-nav-btn ${activeView === 'analytics' ? 'active' : ''}`}
                onClick={() => onSelectView('analytics')}
                title="Weakness Detector & Analytics"
              >
                <span className="sidebar-nav-icon"><BarChart2 size={18} /></span>
                {!isCollapsed && <span className="sidebar-nav-label">Weakness & Matrix</span>}
              </button>

              <button
                type="button"
                className={`sidebar-nav-btn ${activeView === 'mistakes' ? 'active' : ''}`}
                onClick={() => onSelectView('mistakes')}
                title="Targeted Mistake Vault"
              >
                <span className="sidebar-nav-icon"><ShieldAlert size={18} /></span>
                {!isCollapsed && <span className="sidebar-nav-label">Mistake Vault</span>}
              </button>

              <button
                type="button"
                className={`sidebar-nav-btn ${activeView === 'tutor' ? 'active' : ''}`}
                onClick={() => onSelectView('tutor')}
                title="AI Tutor Chat & Explanations"
              >
                <span className="sidebar-nav-icon"><Bot size={18} /></span>
                {!isCollapsed && <span className="sidebar-nav-label">AI Tutor Chat</span>}
              </button>

              <button
                type="button"
                className={`sidebar-nav-btn ${activeView === 'presentation' ? 'active' : ''}`}
                onClick={() => onSelectView('presentation')}
                title="Presentation Slide Deck"
              >
                <span className="sidebar-nav-icon"><Presentation size={18} /></span>
                {!isCollapsed && <span className="sidebar-nav-label">Presentation</span>}
              </button>
            </div>
          )}

          {/* Quick Upload CTA */}
          <button
            type="button"
            className="sidebar-upload-cta"
            onClick={onNewNotes}
            title="Upload or paste new class notes"
          >
            <Plus size={16} />
            {!isCollapsed && <span>+ Upload / New Notes</span>}
          </button>

          {/* Subjects List */}
          {!isCollapsed && (
            <div className="sidebar-nav-group" style={{ marginTop: 8 }}>
              <div className="sidebar-section-title">My Subjects</div>
              {savedSubjects.map((sub) => (
                <button
                  key={sub}
                  type="button"
                  className={`sidebar-nav-btn ${currentSubject === sub ? 'active' : ''}`}
                  onClick={() => onSelectSubject(sub)}
                  style={{ fontSize: '0.8rem', padding: '6px 10px' }}
                >
                  <span className="sidebar-nav-icon"><Folder size={15} /></span>
                  <span className="sidebar-nav-label">{sub}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Sidebar Footer */}
      <div className="sidebar-footer">
        {!isCollapsed ? (
          <div>
            {currentUser && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '8px 10px',
                background: 'rgba(255, 255, 255, 0.05)',
                borderRadius: 'var(--radius-sm)',
                marginBottom: 8,
                border: '1px solid rgba(255, 255, 255, 0.08)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, overflow: 'hidden' }}>
                  <div style={{
                    width: 26,
                    height: 26,
                    borderRadius: '50%',
                    background: 'var(--primary)',
                    color: '#ffffff',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    {currentUser.avatarInitial || 'S'}
                  </div>
                  <div style={{ overflow: 'hidden' }}>
                    <div style={{ fontSize: '0.78rem', fontWeight: 600, color: '#e0e8e2', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {currentUser.name}
                    </div>
                    <div style={{ fontSize: '0.68rem', color: '#8fa092', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {currentUser.branch || currentUser.role}
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={onLogout}
                  title="Sign Out"
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: '#8fa092',
                    cursor: 'pointer',
                    padding: 4,
                    display: 'flex',
                    alignItems: 'center'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.color = '#ff8080'}
                  onMouseLeave={(e) => e.currentTarget.style.color = '#8fa092'}
                >
                  <LogOut size={14} />
                </button>
              </div>
            )}

            <div className="sidebar-team-tag">
              <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--primary)', display: 'inline-block' }} />
              <span>Class Mate AI</span>
            </div>
          </div>
        ) : (
          <div style={{ textAlign: 'center', fontSize: '0.7rem', color: '#8fa092' }}>
            {currentUser ? (
              <button
                type="button"
                onClick={onLogout}
                title={`Logged in as ${currentUser.name}. Click to log out`}
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--primary)' }}
              >
                {currentUser.avatarInitial || 'S'}
              </button>
            ) : (
              <img src="/logo.png" alt="Class Mate" style={{ width: 22, height: 22, objectFit: 'contain' }} />
            )}
          </div>
        )}
      </div>
    </aside>
  );
}
