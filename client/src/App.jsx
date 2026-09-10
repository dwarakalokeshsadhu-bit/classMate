import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar.jsx';
import TopBar from './components/TopBar.jsx';
import FloatingTutorWidget from './components/FloatingTutorWidget.jsx';
import NotesInputScreen from './components/NotesInputScreen.jsx';
import ResultsScreen from './components/ResultsScreen.jsx';
import AuthLandingPage from './components/AuthLandingPage.jsx';
import StudyPlanModal from './components/StudyPlanModal.jsx';
import { sanitizeNotesInput, containsMojiboke } from './utils/textSanitizer.js';

export default function App() {
  // Authentication & student profile
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const stored = localStorage.getItem('pm_user');
      return stored ? JSON.parse(stored) : null;
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

  // Subject management
  const [savedSubjects, setSavedSubjects] = useState(['General', 'Computer Science', 'Biology', 'Economics']);
  const [currentSubject, setCurrentSubject] = useState('General');
  const [savedDecks, setSavedDecks] = useState({}); // { [subject]: { notes, studyData } }

  // Global search
  const [searchQuery, setSearchQuery] = useState('');

  // Gamification & reminders
  const [studyStreak, setStudyStreak] = useState(3);
  const [dailyReminderEnabled, setDailyReminderEnabled] = useState(false);

  // Check backend health on mount and restore local persistence with auto-purge of corrupted decks
  useEffect(() => {
    fetch('/api/health')
      .then((res) => res.json())
      .then((data) => setServerStatus(data))
      .catch((err) => console.warn('Could not reach backend health check:', err));

    // Load persisted subjects, decks, streak, and reminders
    try {
      const storedSubjects = localStorage.getItem('pm_subjects');
      if (storedSubjects) setSavedSubjects(JSON.parse(storedSubjects));

      const storedDecks = localStorage.getItem('pm_saved_decks');
      if (storedDecks) {
        const parsedDecks = JSON.parse(storedDecks);
        let purgedAny = false;

        // Inspect and purge any cached decks containing binary mojiboke (\uFFFD)
        for (const sub of Object.keys(parsedDecks)) {
          const deck = parsedDecks[sub];
          const hasBadNotes = deck?.notes && (deck.notes.includes('\uFFFD') || containsMojiboke(deck.notes));
          const hasBadTitle = deck?.studyData?.title && (deck.studyData.title.includes('\uFFFD') || containsMojiboke(deck.studyData.title));
          const hasBadSummary = deck?.studyData?.summary && (deck.studyData.summary.includes('\uFFFD') || containsMojiboke(deck.studyData.summary));

          if (hasBadNotes || hasBadTitle || hasBadSummary) {
            delete parsedDecks[sub];
            purgedAny = true;
          }
        }

        if (purgedAny) {
          localStorage.setItem('pm_saved_decks', JSON.stringify(parsedDecks));
        }

        setSavedDecks(parsedDecks);
        if (parsedDecks['General'] && parsedDecks['General'].studyData) {
          setNotes(parsedDecks['General'].notes || '');
          setStudyData(parsedDecks['General'].studyData);
          setActiveView('summary');
        } else {
          setNotes('');
          setStudyData(null);
          setActiveView('input');
        }
      } else {
        setActiveView('input');
      }

      const storedStreak = localStorage.getItem('pm_streak');
      if (storedStreak) setStudyStreak(parseInt(storedStreak, 10));

      const storedReminder = localStorage.getItem('pm_reminder');
      if (storedReminder) setDailyReminderEnabled(storedReminder === 'true');
    } catch (e) {
      console.warn('LocalStorage error on mount:', e);
    }
  }, []);

  // Helper to persist savedDecks
  const persistDecks = (newDecks) => {
    setSavedDecks(newDecks);
    try {
      localStorage.setItem('pm_saved_decks', JSON.stringify(newDecks));
    } catch (e) {
      console.warn('Could not persist decks to localStorage:', e);
    }
  };

  // Student auth handlers
  const handleLogin = (userData) => {
    setCurrentUser(userData);
    try {
      localStorage.setItem('pm_user', JSON.stringify(userData));
    } catch (e) {
      console.warn('Could not save user session:', e);
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    try {
      localStorage.removeItem('pm_user');
    } catch (e) {
      console.warn('Could not clear user session:', e);
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
          body: 'Your 15-minute active recall review session is scheduled! Keep your study streak alive!',
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
      const response = await fetch('/api/generate', {
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
        [currentSubject]: { notes, studyData: json.data }
      };
      persistDecks(updatedDecks);

      // Increment streak
      const newStreak = studyStreak + 1;
      setStudyStreak(newStreak);
      try {
        localStorage.setItem('pm_streak', String(newStreak));
      } catch (e) {}
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
          studyStreak={studyStreak}
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
    </div>
  );
}
