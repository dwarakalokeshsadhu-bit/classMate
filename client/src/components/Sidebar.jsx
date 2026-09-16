import React, { useState } from 'react';
import {
  BookOpen, Home, Layers, CheckSquare, BarChart2, ShieldAlert,
  Presentation, Plus, ChevronLeft, ChevronRight,
  Folder, Calendar, BookMarked, LogOut, Bot,
  PlusSquare, History, Check, X
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
  onOpenHistory,
  historyCount = 0,
  onLogout,
  onAddSubject
}) {
  const [isAddingSubject, setIsAddingSubject] = useState(false);
  const [newSubjectInput, setNewSubjectInput] = useState('');

  const hasStudySet = Boolean(studyData);
  const flashcardsCount = studyData?.flashcards?.length || 0;
  const quizCount = studyData?.quiz?.length || 0;

  // Filter out hardcoded subjects and preserve only user subjects
  const userSubjects = Array.from(
    new Set(
      (savedSubjects || [])
        .filter(s => s && !['Computer Science', 'Biology', 'Economics'].includes(s))
        .concat(currentSubject && !['Computer Science', 'Biology', 'Economics'].includes(currentSubject) ? [currentSubject] : [])
    )
  );
  const subjectsToDisplay = userSubjects.length > 0 ? userSubjects : ['General'];

  const handleCreateSubject = (e) => {
    e?.preventDefault();
    const trimmed = newSubjectInput.trim();
    if (!trimmed) {
      setIsAddingSubject(false);
      return;
    }
    if (onAddSubject) {
      onAddSubject(trimmed);
    } else if (onSelectSubject) {
      onSelectSubject(trimmed);
    }
    setNewSubjectInput('');
    setIsAddingSubject(false);
  };

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
          {/* Main Primary Navigation - Workspace */}
          <div className="sidebar-nav-group">
            {!isCollapsed && <div className="sidebar-section-title">WORKSPACE</div>}

            <button
              type="button"
              className={`sidebar-nav-btn ${activeView === 'input' && !hasStudySet ? 'active' : (activeView === 'input' ? 'active' : '')}`}
              onClick={() => onSelectView('input')}
              title="Home"
            >
              <span className="sidebar-nav-icon"><Home size={18} /></span>
              {!isCollapsed && <span className="sidebar-nav-label">Home</span>}
            </button>

            <button
              type="button"
              className="sidebar-nav-btn"
              onClick={onNewNotes}
              title="Create Study Kit"
            >
              <span className="sidebar-nav-icon"><PlusSquare size={18} /></span>
              {!isCollapsed && <span className="sidebar-nav-label">Create Study Kit</span>}
            </button>

            <button
              type="button"
              className="sidebar-nav-btn"
              onClick={onOpenHistory}
              title="Study History"
            >
              <span className="sidebar-nav-icon"><History size={18} /></span>
              {!isCollapsed && (
                <>
                  <span className="sidebar-nav-label">Study History</span>
                  {historyCount > 0 && (
                    <span className="sidebar-nav-badge" style={{ background: 'rgba(150, 167, 141, 0.22)', color: '#96A78D' }}>
                      {historyCount}
                    </span>
                  )}
                </>
              )}
            </button>

            <button
              type="button"
              className={`sidebar-nav-btn ${activeView === 'analytics' ? 'active' : ''}`}
              onClick={() => onSelectView('analytics')}
              title="Progress"
            >
              <span className="sidebar-nav-icon"><BarChart2 size={18} /></span>
              {!isCollapsed && <span className="sidebar-nav-label">Progress</span>}
            </button>
          </div>

          {/* Active Study Set Sub-Menu */}
          {hasStudySet && (
            <div className="sidebar-nav-group" style={{ marginTop: 10 }}>
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

              {!isCollapsed && <div className="sidebar-section-title">STUDY TOOLS</div>}

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
                className={`sidebar-nav-btn ${activeView === 'plan' ? 'active' : ''}`}
                onClick={() => onSelectView('plan')}
                title="Study Plan & Countdown"
              >
                <span className="sidebar-nav-icon"><Calendar size={18} /></span>
                {!isCollapsed && <span className="sidebar-nav-label">Study Plan</span>}
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

          {/* Subjects Navigation - Dynamic User Subjects */}
          <div className="sidebar-nav-group" style={{ marginTop: 10 }}>
            {!isCollapsed && (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 10px 4px' }}>
                <div className="sidebar-section-title" style={{ padding: 0 }}>SUBJECTS</div>
                {!isAddingSubject && (
                  <button
                    type="button"
                    onClick={() => setIsAddingSubject(true)}
                    title="Add new subject"
                    style={{
                      background: 'rgba(150, 167, 141, 0.12)',
                      border: '1px solid rgba(150, 167, 141, 0.25)',
                      color: '#c4d3c7',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      padding: '2px 6px',
                      borderRadius: 4,
                      fontSize: '0.68rem',
                      gap: 3
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.color = '#ffffff'}
                    onMouseLeave={(e) => e.currentTarget.style.color = '#c4d3c7'}
                  >
                    <Plus size={13} />
                    <span>Add</span>
                  </button>
                )}
              </div>
            )}

            {isAddingSubject && !isCollapsed && (
              <form onSubmit={handleCreateSubject} style={{ padding: '4px 6px', display: 'flex', gap: 4, alignItems: 'center' }}>
                <input
                  type="text"
                  value={newSubjectInput}
                  onChange={(e) => setNewSubjectInput(e.target.value)}
                  placeholder="Subject name..."
                  autoFocus
                  style={{
                    flex: 1,
                    background: '#131b15',
                    border: '1px solid #313E35',
                    borderRadius: 6,
                    color: '#fff',
                    padding: '5px 8px',
                    fontSize: '0.78rem',
                    outline: 'none'
                  }}
                />
                <button
                  type="submit"
                  style={{
                    background: 'var(--primary)',
                    border: 'none',
                    borderRadius: 4,
                    color: '#fff',
                    padding: '5px 7px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center'
                  }}
                  title="Save Subject"
                >
                  <Check size={12} />
                </button>
                <button
                  type="button"
                  onClick={() => { setIsAddingSubject(false); setNewSubjectInput(''); }}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: '#8fa092',
                    padding: '5px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center'
                  }}
                  title="Cancel"
                >
                  <X size={12} />
                </button>
              </form>
            )}

            {subjectsToDisplay.map((sub) => (
              <button
                key={sub}
                type="button"
                className={`sidebar-nav-btn ${currentSubject === sub ? 'active' : ''}`}
                onClick={() => onSelectSubject(sub)}
                title={`Subject: ${sub}`}
                style={{ fontSize: '0.82rem', padding: '7px 12px' }}
              >
                <span className="sidebar-nav-icon"><Folder size={16} /></span>
                {!isCollapsed && <span className="sidebar-nav-label">{sub}</span>}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Sidebar Footer - Clean & Minimal without User Details */}
      <div className="sidebar-footer">
        {!isCollapsed ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
            <div className="sidebar-team-tag" style={{ margin: 0 }}>
              <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--primary)', display: 'inline-block' }} />
              <span>Class Mate AI</span>
            </div>

            {onLogout && (
              <button
                type="button"
                onClick={onLogout}
                title="Sign Out"
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#8fa092',
                  cursor: 'pointer',
                  padding: '5px 8px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 5,
                  borderRadius: '6px',
                  fontSize: '0.74rem',
                  transition: 'color 0.15s ease'
                }}
                onMouseEnter={(e) => e.currentTarget.style.color = '#ff8080'}
                onMouseLeave={(e) => e.currentTarget.style.color = '#8fa092'}
              >
                <LogOut size={14} />
                <span>Logout</span>
              </button>
            )}
          </div>
        ) : (
          <div style={{ textAlign: 'center', fontSize: '0.7rem', color: '#8fa092', display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'center' }}>
            {onLogout && (
              <button
                type="button"
                onClick={onLogout}
                title="Sign Out"
                style={{
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#8fa092',
                  padding: 4,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: '6px'
                }}
                onMouseEnter={(e) => e.currentTarget.style.color = '#ff8080'}
                onMouseLeave={(e) => e.currentTarget.style.color = '#8fa092'}
              >
                <LogOut size={16} />
              </button>
            )}
          </div>
        )}
      </div>
    </aside>
  );
}
