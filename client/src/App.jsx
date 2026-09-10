import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar.jsx';
import TopBar from './components/TopBar.jsx';
import FloatingTutorWidget from './components/FloatingTutorWidget.jsx';
import NotesInputScreen from './components/NotesInputScreen.jsx';
import ResultsScreen from './components/ResultsScreen.jsx';
import AuthLandingPage from './components/AuthLandingPage.jsx';
import StudyPlanModal from './components/StudyPlanModal.jsx';
import UserDetailsModal from './components/UserDetailsModal.jsx';
import HistoryModal from './components/HistoryModal.jsx';
import { sanitizeNotesInput, containsMojiboke } from './utils/textSanitizer.js';
import { apiUrl } from './utils/api.js';

// User-scoped storage key helpers to prevent cross-account data leakage
const getUserDecksKey = (email) => (email ? `pm_saved_decks_${email.trim().toLowerCase()}` : 'pm_saved_decks_guest');
const getUserHistoryKey = (email) => (email ? `pm_note_history_${email.trim().toLowerCase()}` : 'pm_note_history_guest');

export default function App() {
  // Authentication & student profile
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const stored = localStorage.getItem('pm_user');
      if (!stored) return null;
      const parsed = JSON.parse(stored);
      if (!parsed.avatar) parsed.avatar = '/avatar.png';
      return parsed;
    } catch (e) {
      return null;
    }
  });

  const [notes, setNotes] = useState('');
  const [studyData, setStudyData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [error, setError] = useState(null);
  const [serverStatus, setServerStatus] = useState(null);

  // Layout & active navigation view
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [activeView, setActiveView] = useState('input'); // 'input' | 'summary' | 'flashcards' | 'quiz' | 'analytics' | 'mistakes' | 'slides' | 'tutor' | 'plan'
  const [isUserDetailsOpen, setIsUserDetailsOpen] = useState(false);

  // Subject management
  const [savedSubjects, setSavedSubjects] = useState(['General', 'Computer Science', 'Biology', 'Economics']);
  const [currentSubject, setCurrentSubject] = useState('General');
  const [savedDecks, setSavedDecks] = useState({}); // { [subject]: { notes, studyData } }

  // Global search
  const [searchQuery, setSearchQuery] = useState('');

  // Gamification & reminders
  const [dailyReminderEnabled, setDailyReminderEnabled] = useState(false);

  // Generated Notes History (scoped to current student)
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [noteHistory, setNoteHistory] = useState(() => {
    try {
      const storedUser = localStorage.getItem('pm_user');
      const email = storedUser ? JSON.parse(storedUser)?.email : null;
      if (!email) return [];
      const stored = localStorage.getItem(getUserHistoryKey(email));
      return stored ? JSON.parse(stored) : [];
    } catch (e) {
      return [];
    }
  });

  // Check backend health on mount and restore local persistence with auto-purge of corrupted decks
  useEffect(() => {
    fetch(apiUrl('/api/health'))
      .then((res) => res.json())
      .then((data) => setServerStatus(data))
      .catch((err) => console.warn('Could not reach backend health check:', err));

    // Load persisted subjects and reminders
    try {
      // Purge legacy shared keys so previous users' state does not contaminate
      localStorage.removeItem('pm_saved_decks');
      localStorage.removeItem('pm_note_history');

      const storedSubjects = localStorage.getItem('pm_subjects');
      if (storedSubjects) setSavedSubjects(JSON.parse(storedSubjects));

      const storedReminder = localStorage.getItem('pm_reminder');
      if (storedReminder) setDailyReminderEnabled(storedReminder === 'true');

      // Load user-scoped decks for current user if logged in
      const storedUser = localStorage.getItem('pm_user');
      const email = storedUser ? JSON.parse(storedUser)?.email : null;
      if (email) {
        const userDecks = localStorage.getItem(getUserDecksKey(email));
        if (userDecks) {
          const parsedDecks = JSON.parse(userDecks);
          setSavedDecks(parsedDecks);
        }
      }
      // Always start fresh on the input screen
      setActiveView('input');
    } catch (e) {
      console.warn('LocalStorage error on mount:', e);
    }
  }, []);

  // Helper to persist savedDecks per user
  const persistDecks = (newDecks, userEmail = currentUser?.email) => {
    setSavedDecks(newDecks);
    try {
      localStorage.setItem(getUserDecksKey(userEmail), JSON.stringify(newDecks));
    } catch (e) {
      console.warn('Could not persist decks to localStorage:', e);
    }
  };

  // Student auth handlers
  const handleLogin = (userData) => {
    setCurrentUser(userData);
    // Reset workspace completely for the new user session
    setNotes('');
    setStudyData(null);
    setActiveView('input');
    setError(null);
    setCurrentSubject('General');

    try {
      localStorage.setItem('pm_user', JSON.stringify(userData));
      localStorage.removeItem('pm_saved_decks'); // Purge legacy shared state

      // Load user-specific decks if any
      const userDecksKey = getUserDecksKey(userData.email);
      const storedDecks = localStorage.getItem(userDecksKey);
      if (storedDecks) {
        setSavedDecks(JSON.parse(storedDecks));
      } else {
        setSavedDecks({});
      }

      // Load user-specific note history from cache immediately
      const userHistKey = getUserHistoryKey(userData.email);
      const storedHist = localStorage.getItem(userHistKey);
      if (storedHist) {
        setNoteHistory(JSON.parse(storedHist));
      } else {
        setNoteHistory([]);
      }
    } catch (e) {
      console.warn('Could not save user session:', e);
    }
  };

  const handleUpdateUser = (updatedUserData) => {
    setCurrentUser(updatedUserData);
    try {
      localStorage.setItem('pm_user', JSON.stringify(updatedUserData));
    } catch (e) {
      console.warn('Could not update user session:', e);
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    // Completely clear all active study data and reset workspace to clean slate
    setNotes('');
    setStudyData(null);
    setActiveView('input');
    setSavedDecks({});
    setNoteHistory([]);
    setCurrentSubject('General');
    setError(null);

    try {
      localStorage.removeItem('pm_user');
      localStorage.removeItem('pm_saved_decks');
      localStorage.removeItem('pm_note_history');
    } catch (e) {
      console.warn('Could not clear user session:', e);
    }

    // Clear server httpOnly cookie
    fetch(apiUrl('/api/auth/logout'), {
      method: 'POST',
      credentials: 'include'
    }).catch(() => {});
  };

  // Fetch online note history on user mount or change
  useEffect(() => {
    if (!currentUser?.email) {
      setNoteHistory([]);
      return;
    }

    // Verify session validity
    fetch(apiUrl('/api/auth/me'), { credentials: 'include' })
      .then((res) => {
        if (res.status === 401) {
          handleLogout();
        }
      })
      .catch(() => {});

    fetch(apiUrl('/api/history'), { credentials: 'include' })
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.items)) {
          setNoteHistory(data.items);
          try {
            const userHistKey = getUserHistoryKey(currentUser.email);
            localStorage.setItem(userHistKey, JSON.stringify(data.items));
          } catch (e) {}
        }
      })
      .catch((err) => console.warn('History fetch notice:', err.message));
  }, [currentUser?.email]);

  // Save generated notes & revision deck into history (MongoDB + local backup)
  const saveToHistory = async (cleanText, generatedData, subject) => {
    const userEmail = currentUser?.email || 'student@college.edu';
    const historyPayload = {
      subject: subject || currentSubject,
      title: generatedData?.title || 'Class Lecture Notes',
      rawNotes: cleanText,
      studyData: generatedData,
      flashcardsCount: Array.isArray(generatedData?.flashcards) ? generatedData.flashcards.length : 0,
      quizCount: Array.isArray(generatedData?.quiz) ? generatedData.quiz.length : 0,
      createdAt: new Date().toISOString()
    };

    // Update local state and user-scoped localStorage immediately
    setNoteHistory((prev) => {
      const filtered = prev.filter(
        (h) => !(h.title === historyPayload.title && h.subject === historyPayload.subject)
      );
      const updated = [historyPayload, ...filtered];
      try {
        localStorage.setItem(getUserHistoryKey(userEmail), JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });

    // Save to backend MongoDB
    try {
      const res = await fetch(apiUrl('/api/history'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(historyPayload)
      });
      const data = await res.json();
      if (res.ok && data.success && data.item) {
        // Update item with mongo _id
        setNoteHistory((prev) =>
          prev.map((h) => (h.createdAt === historyPayload.createdAt ? data.item : h))
        );
      }
    } catch (e) {
      console.warn('Backend history save notice (saved locally):', e.message);
    }
  };

  // Restore note session from history into the active workspace
  const handleRestoreFromHistory = (historyItem) => {
    if (!historyItem) return;
    if (historyItem.rawNotes) {
      setNotes(historyItem.rawNotes);
    }
    if (historyItem.studyData) {
      setStudyData(historyItem.studyData);
    }
    if (historyItem.subject) {
      setCurrentSubject(historyItem.subject);
      const updatedDecks = {
        ...savedDecks,
        [historyItem.subject]: { notes: historyItem.rawNotes || '', studyData: historyItem.studyData }
      };
      persistDecks(updatedDecks);
    }
    setActiveView('summary');
  };

  // Delete note history item
  const handleDeleteHistoryItem = async (id) => {
    setNoteHistory((prev) => {
      const updated = prev.filter((item) => (item._id || item.id) !== id);
      try {
        const key = getUserHistoryKey(currentUser?.email);
        localStorage.setItem(key, JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });

    try {
      await fetch(apiUrl(`/api/history/${id}`), {
        method: 'DELETE',
        credentials: 'include'
      });
    } catch (e) {
      console.warn('Could not delete history item on server:', e);
    }
  };

  // Handle subject change
  const handleSelectSubject = (subjectName) => {
    setCurrentSubject(subjectName);
    if (savedDecks[subjectName]) {
      setNotes(savedDecks[subjectName].notes || '');
      setStudyData(savedDecks[subjectName].studyData || null);
    } else {
      setNotes('');
      setStudyData(null);
    }
  };

  // Save current revision deck under subject
  const handleSaveCurrentSubject = (subjectName) => {
    if (!savedSubjects.includes(subjectName)) {
      const updated = [...savedSubjects, subjectName];
      setSavedSubjects(updated);
      try {
        localStorage.setItem('pm_subjects', JSON.stringify(updated));
      } catch (e) {}
    }
    setCurrentSubject(subjectName);
    const updatedDecks = {
      ...savedDecks,
      [subjectName]: { notes, studyData }
    };
    persistDecks(updatedDecks);
  };

  // Toggle Daily Revision Reminder
  const handleToggleDailyReminder = async () => {
    const nextState = !dailyReminderEnabled;
    setDailyReminderEnabled(nextState);
    try {
      localStorage.setItem('pm_reminder', String(nextState));
    } catch (e) {}

    if (nextState && 'Notification' in window) {
      if (Notification.permission === 'default') {
        await Notification.requestPermission();
      }
      if (Notification.permission === 'granted') {
        new Notification('Class Mate Daily Revision 📚', {
          body: 'Your 15-minute active recall review session is scheduled! Keep your revision momentum going!',
          icon: '/favicon.ico'
        });
      }
    }
  };

  // Main generator
  const handleGenerate = async (mode = 'fresh') => {
    const { text: cleanNotes, wasCleaned } = sanitizeNotesInput(notes);
    if (wasCleaned) {
      setNotes(cleanNotes);
    }

    if (!cleanNotes || cleanNotes.trim().length < 10) {
      setError('Please provide at least 10 characters of readable notes to generate revision tools.');
      return;
    }

    setError(null);
    if (mode === 'variation') {
      setIsRegenerating(true);
    } else {
      setIsLoading(true);
    }

    try {
      const response = await fetch(apiUrl('/api/generate'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes: cleanNotes, mode })
      });

      const json = await response.json();

      if (!response.ok || !json.success) {
        throw new Error(json.error || 'Failed to generate revision resources.');
      }

      setStudyData(json.data);

      // Auto-save to current subject and persist to localStorage
      const updatedDecks = {
        ...savedDecks,
        [currentSubject]: { notes: cleanNotes, studyData: json.data }
      };
      persistDecks(updatedDecks);

      // Save to note history in MongoDB and localStorage
      saveToHistory(cleanNotes, json.data, currentSubject);
    } catch (err) {
      console.error('Generation Error:', err);
      setError(err.message || 'Connection error. Is the Class Mate backend running on port 5000?');
    } finally {
      setIsLoading(false);
      setIsRegenerating(false);
    }
  };

  const handleReviseAgain = () => {
    handleGenerate('variation');
  };

  const handleEditNotes = () => {
    setError(null);
    setActiveView('input');
  };

  const handleStartFreshNotes = () => {
    setStudyData(null);
    setNotes('');
    setError(null);
    setActiveView('input');
  };

  // Cross-subject search matches calculation
  const searchMatches = [];
  if (searchQuery.trim()) {
    const q = searchQuery.toLowerCase().trim();
    Object.entries(savedDecks).forEach(([sub, data]) => {
      const noteMatch = data.notes && data.notes.toLowerCase().includes(q);
      const titleMatch = data.studyData && data.studyData.title && data.studyData.title.toLowerCase().includes(q);
      const fcMatches = data.studyData?.flashcards?.filter(f =>
        f.question?.toLowerCase().includes(q) || f.answer?.toLowerCase().includes(q) || f.topic?.toLowerCase().includes(q)
      ).length || 0;
      const quizMatches = data.studyData?.quiz?.filter(qz =>
        qz.question?.toLowerCase().includes(q) || qz.topic?.toLowerCase().includes(q)
      ).length || 0;

      const totalMatches = (noteMatch ? 1 : 0) + (titleMatch ? 1 : 0) + fcMatches + quizMatches;
      if (totalMatches > 0) {
        searchMatches.push({
          subject: sub,
          title: data.studyData?.title || `${sub} Notes`,
          count: totalMatches
        });
      }
    });
  }

  // Global search filtering across active deck's flashcards, quiz, key points, and definitions
  const filteredStudyData = searchQuery.trim() && studyData ? {
    ...studyData,
    flashcards: studyData.flashcards?.filter(f =>
      f.question?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.answer?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (f.topic && f.topic.toLowerCase().includes(searchQuery.toLowerCase()))
    ) || [],
    quiz: studyData.quiz?.filter(q =>
      q.question?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (q.topic && q.topic.toLowerCase().includes(searchQuery.toLowerCase()))
    ) || [],
    keyPoints: studyData.keyPoints?.filter(kp =>
      kp.toLowerCase().includes(searchQuery.toLowerCase())
    ) || studyData.keyPoints,
    definitions: studyData.definitions?.filter(d =>
      d.term?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.definition?.toLowerCase().includes(searchQuery.toLowerCase())
    ) || studyData.definitions
  } : studyData;

  // Render Home/Auth Landing Page if not logged in
  if (!currentUser) {
    return <AuthLandingPage onLogin={handleLogin} />;
  }

  return (
    <div className="app-shell">
      {/* Left Collapsible Togglebar (StudyFetch Style) */}
      <Sidebar
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        activeView={activeView}
        onSelectView={(view) => setActiveView(view)}
        studyData={studyData}
        currentSubject={currentSubject}
        savedSubjects={savedSubjects}
        onSelectSubject={(sub) => {
          handleSelectSubject(sub);
          if (savedDecks[sub]?.studyData) {
            setActiveView('summary');
          } else {
            setActiveView('input');
          }
        }}
        onNewNotes={handleStartFreshNotes}
        onOpenStudyPlan={() => setActiveView('plan')}
        activeDeckTitle={studyData?.title || (notes ? notes.slice(0, 30) + '...' : 'New Revision Session')}
        currentUser={currentUser}
        onOpenUserDetails={() => setIsUserDetailsOpen(true)}
        onOpenHistory={() => setIsHistoryOpen(true)}
        historyCount={noteHistory.length}
        onLogout={handleLogout}
      />

      {/* Main Viewport */}
      <div className="main-viewport">
        {/* Top App Bar with Breadcrumbs & Actions */}
        <TopBar
          currentSubject={currentSubject}
          topicTitle={studyData?.title || 'Class Lecture Notes'}
          studyData={studyData}
          onReviseAgain={handleReviseAgain}
          isRegenerating={isRegenerating}
          onOpenShare={() => {
            const shareText = `📚 Class Mate Revision Deck: ${studyData?.title || 'Class Notes'} (${currentSubject})\n\n⚡ 60-Second Summary:\n${studyData?.summary || ''}\n\nStudy effectively with Class Mate!`;
            navigator.clipboard.writeText(shareText);
            alert('Deck details copied to clipboard! Ready to share.');
          }}
          onOpenHistory={() => setIsHistoryOpen(true)}
          historyCount={noteHistory.length}
          dailyReminderEnabled={dailyReminderEnabled}
          onToggleReminder={handleToggleDailyReminder}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          allDecks={savedDecks}
          onSelectSearchMatch={(sub, data) => {
            setCurrentSubject(sub);
            setNotes(data.notes || '');
            setStudyData(data.studyData || null);
            if (data.studyData) setActiveView('summary');
          }}
          onBreadcrumbRootClick={() => setActiveView('input')}
          onTopicClick={() => setActiveView('summary')}
          currentUser={currentUser}
          onOpenUserDetails={() => setIsUserDetailsOpen(true)}
          onLogout={handleLogout}
        />

        {/* Central Study Workspace */}
        <main className="main-study-area">
          <div className="main-card">
            {activeView === 'plan' ? (
              <div style={{ background: '#ffffff', borderRadius: 'var(--radius-lg)', padding: '24px', border: '1px solid var(--border)' }}>
                <StudyPlanModal
                  notes={notes || (studyData?.summary || '')}
                  weakTopics={studyData?.subtopics || []}
                  onClose={() => setActiveView(studyData ? 'summary' : 'input')}
                />
              </div>
            ) : activeView === 'input' || !studyData ? (
              <NotesInputScreen
                notes={notes}
                setNotes={setNotes}
                onGenerate={() => {
                  handleGenerate('fresh').then(() => {
                    setActiveView('summary');
                  });
                }}
                isLoading={isLoading}
                error={error}
                currentSubject={currentSubject}
                onSubjectChange={setCurrentSubject}
              />
            ) : (
              <ResultsScreen
                studyData={filteredStudyData || studyData}
                rawNotes={notes}
                onReviseAgain={handleReviseAgain}
                onEditNotes={() => setActiveView('input')}
                isRegenerating={isRegenerating}
                currentSubject={currentSubject}
                searchFilter={searchQuery}
                externalActiveTab={activeView}
                onTabChange={(tab) => setActiveView(tab)}
              />
            )}
          </div>
        </main>

        {/* Floating AI Tutor Dock (StudyFetch Style) */}
        <FloatingTutorWidget
          notes={notes}
          studyData={studyData}
          onOpenFullTutor={() => {
            if (studyData) {
              setActiveView('tutor');
            }
          }}
        />
      </div>

      {/* Student Profile & User Details Modal */}
      {isUserDetailsOpen && (
        <UserDetailsModal
          user={currentUser}
          onUpdateUser={handleUpdateUser}
          onClose={() => setIsUserDetailsOpen(false)}
          onLogout={handleLogout}
          savedSubjects={savedSubjects}
          studyData={studyData}
        />
      )}

      {/* Generated Notes History Modal */}
      {isHistoryOpen && (
        <HistoryModal
          historyItems={noteHistory}
          onClose={() => setIsHistoryOpen(false)}
          onRestoreSession={handleRestoreFromHistory}
          onDeleteHistoryItem={handleDeleteHistoryItem}
          currentSubject={currentSubject}
        />
      )}
    </div>
  );
}
