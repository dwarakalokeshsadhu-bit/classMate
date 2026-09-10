import React, { useState } from 'react';
import {
  BookOpen, Layers, CheckSquare, RotateCw, Edit3, Copy, Check,
  BarChart2, ShieldAlert, Bot, Presentation, Calendar, Share2,
  Printer, Sparkles, Tag, CheckCircle2
} from 'lucide-react';
import FlashcardDeck from './FlashcardDeck.jsx';
import QuizEngine from './QuizEngine.jsx';
import AnalyticsDashboard from './AnalyticsDashboard.jsx';
import MistakeVault from './MistakeVault.jsx';
import AITutorChat from './AITutorChat.jsx';
import PresentationDeck from './PresentationDeck.jsx';
import StudyPlanModal from './StudyPlanModal.jsx';
import { containsMojiboke } from '../utils/textSanitizer.js';

export default function ResultsScreen({
  studyData,
  rawNotes = '',
  onReviseAgain,
  onEditNotes,
  isRegenerating,
  currentSubject = 'General',
  searchFilter = '',
  externalActiveTab,
  onTabChange
}) {
  const [internalActiveTab, setInternalActiveTab] = useState('summary');
  const activeTab = externalActiveTab || internalActiveTab;
  const setActiveTab = (tab) => {
    setInternalActiveTab(tab);
    if (onTabChange) onTabChange(tab);
  };
  const [copiedSummary, setCopiedSummary] = useState(false);
  const [copiedShare, setCopiedShare] = useState(false);
  const [checkedKeyPoints, setCheckedKeyPoints] = useState({});

  // Performance and analytics state across quiz sessions
  const [quizHistory, setQuizHistory] = useState([]);
  const [latestQuestionResults, setLatestQuestionResults] = useState([]);
  const [mistakesBank, setMistakesBank] = useState([]);

  const rawTitle = studyData?.title || 'Lecture Revision Set';
  const hasMojibokeTitle = rawTitle.includes('\uFFFD') || containsMojiboke(rawTitle);
  const title = hasMojibokeTitle ? 'Class Lecture Revision' : rawTitle;

  const rawSummary = studyData?.summary || '';
  const hasMojibokeSummary = rawSummary.includes('\uFFFD') || containsMojiboke(rawSummary);
  const summary = hasMojibokeSummary
    ? 'These lecture notes concentrate on core foundational principles, operational rules, and key problem-solving techniques essential for exam preparation.'
    : rawSummary;

  const {
    deepSummary = '',
    keyPoints = [],
    definitions = [],
    subtopics = [],
    flashcards = [],
    quiz = [],
    presentationSlides = [],
    studyTips = [],
    warning,
    source
  } = studyData || {};

  // Copy 60s summary
  const handleCopySummary = () => {
    if (!summary) return;
    navigator.clipboard.writeText(summary);
    setCopiedSummary(true);
    setTimeout(() => setCopiedSummary(false), 2000);
  };

  // Share revision pack
  const handleSharePack = () => {
    const shareText = `📚 Class Mate Revision Deck: ${title} (${currentSubject})\n\n⚡ 60-Second Summary:\n${summary}\n\n🎴 Flashcards: ${flashcards.length} cards | 📝 Quiz: ${quiz.length} questions | 🎯 Subtopics: ${subtopics.join(', ')}\n\nStudy effectively with active recall & spaced repetition!`;
    navigator.clipboard.writeText(shareText);
    setCopiedShare(true);
    setTimeout(() => setCopiedShare(false), 2000);
  };

  // Print revision cheat sheet
  const handlePrint = () => {
    window.print();
  };

  // Record quiz completion results
  const handleRecordQuizResult = (result) => {
    setQuizHistory(prev => [...prev, result]);
    setLatestQuestionResults(result.questionResults);
  };

  // Add mistakes to vault
  const handleLogMistakes = (newMistakes) => {
    setMistakesBank(prev => {
      // Deduplicate by question text
      const existingQuestions = new Set(prev.map(m => m.question));
      const filtered = newMistakes.filter(m => !existingQuestions.has(m.question));
      return [...prev, ...filtered];
    });
  };

  // Resolve individual mistake
  const handleResolveMistake = (identifier) => {
    setMistakesBank(prev => prev.filter(m => m.id !== identifier && m.question !== identifier));
  };

  // Resolve multiple mistakes on successful retry
  const handleResolveMultipleMistakes = (resolvedIds) => {
    const idSet = new Set(resolvedIds);
    setMistakesBank(prev => prev.filter(m => !idSet.has(m.id) && !idSet.has(m.question)));
  };

  // Key point toggle
  const toggleKeyPoint = (idx) => {
    setCheckedKeyPoints(prev => ({
      ...prev,
      [idx]: !prev[idx]
    }));
  };

  // Handle "What Should I Study Now?" jump
  const handleStudyNextAction = () => {
    if (mistakesBank.length > 0) {
      setActiveTab('mistakes');
    } else {
      setActiveTab('flashcards');
    }
  };

  return (
    <div className="results-container">
      {/* Old corrupted cache notice */}
      {(hasMojibokeTitle || hasMojibokeSummary) && (
        <div className="alert-warning" style={{ background: '#fef2f2', borderColor: '#fecdd3', color: '#991b1b', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>⚠️ <strong>Notice:</strong> Old corrupted session detected from cache. Class Mate has sanitized the display.</span>
          <button
            type="button"
            className="btn-secondary"
            style={{ padding: '4px 10px', fontSize: '0.78rem', background: '#ffffff' }}
            onClick={() => {
              try {
                localStorage.removeItem('pm_saved_decks');
              } catch (e) {}
              onEditNotes();
            }}
          >
            🧹 Clear Cache & New Notes
          </button>
        </div>
      )}

      {/* Informational AI mode banner */}
      {warning && (
        <div className="alert-warning">
          <span>⚠️ {warning}</span>
        </div>
      )}

      {/* Revision Deck Header */}
      <div className="deck-meta-bar">
        <div>
          <span className="deck-subject-tag">📁 {currentSubject}</span>
          <h2 className="deck-main-title">{title}</h2>
        </div>

        <div className="deck-quick-actions">
          <button
            type="button"
            className="btn-secondary"
            style={{ padding: '7px 14px', fontSize: '0.82rem' }}
            onClick={handleSharePack}
            title="Copy shareable summary"
          >
            {copiedShare ? <Check size={14} color="#10b981" /> : <Share2 size={14} />}
            {copiedShare ? 'Copied Deck!' : 'Share Deck'}
          </button>

          <button
            type="button"
            className="btn-secondary"
            style={{ padding: '7px 14px', fontSize: '0.82rem' }}
            onClick={handlePrint}
            title="Print revision cheat sheet"
          >
            <Printer size={14} /> Print Cheat Sheet
          </button>
        </div>
      </div>

      {/* Navigation Tabs Bar */}
      <div className="tabs-nav-scroll">
        <div className="tabs-nav">
          <button
            type="button"
            className={`tab-btn ${activeTab === 'summary' ? 'active' : ''}`}
            onClick={() => setActiveTab('summary')}
          >
            <BookOpen size={16} />
            Summary & Concepts
          </button>

          <button
            type="button"
            className={`tab-btn ${activeTab === 'flashcards' ? 'active' : ''}`}
            onClick={() => setActiveTab('flashcards')}
          >
            <Layers size={16} />
            Flashcards
            <span className="tab-count">{flashcards.length}</span>
          </button>

          <button
            type="button"
            className={`tab-btn ${activeTab === 'quiz' ? 'active' : ''}`}
            onClick={() => setActiveTab('quiz')}
          >
            <CheckSquare size={16} />
            Self-Test Quiz
            <span className="tab-count">{quiz.length}</span>
          </button>

          <button
            type="button"
            className={`tab-btn ${activeTab === 'analytics' ? 'active' : ''}`}
            onClick={() => setActiveTab('analytics')}
          >
            <BarChart2 size={16} />
            Weakness & Analytics
          </button>

          <button
            type="button"
            className={`tab-btn ${activeTab === 'mistakes' ? 'active' : ''}`}
            onClick={() => setActiveTab('mistakes')}
          >
            <ShieldAlert size={16} />
            Mistake Vault
            {mistakesBank.length > 0 && (
              <span className="tab-count bg-danger" style={{ background: '#fef2f2', color: '#dc2626' }}>
                {mistakesBank.length}
              </span>
            )}
          </button>

          <button
            type="button"
            className={`tab-btn ${activeTab === 'tutor' ? 'active' : ''}`}
            onClick={() => setActiveTab('tutor')}
          >
            <Bot size={16} />
            AI Tutor Chat
          </button>

          <button
            type="button"
            className={`tab-btn ${activeTab === 'presentation' ? 'active' : ''}`}
            onClick={() => setActiveTab('presentation')}
          >
            <Presentation size={16} />
            Slide Summary
          </button>

          <button
            type="button"
            className={`tab-btn ${activeTab === 'plan' ? 'active' : ''}`}
            onClick={() => setActiveTab('plan')}
          >
            <Calendar size={16} />
            Study Plan & Countdown
          </button>
        </div>
      </div>

      {/* Tab Body Content - Using CSS display to preserve tab state without unmounting */}
      <div className="tab-body">
        {/* Tab 1: 60-Second Rescue Summary & Extracted Concepts */}
        <div style={{ display: activeTab === 'summary' ? 'block' : 'none' }}>
          <div className="summary-tab-content">
            {/* 60-Second Rescue Card */}
            <div className="summary-container">
              <div className="summary-header">
                <span className="summary-tag">
                  ⚡ 60-Second Rescue Summary (~1 Min Read)
                </span>
                <button
                  type="button"
                  className="btn-secondary"
                  style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                  onClick={handleCopySummary}
                >
                  {copiedSummary ? <Check size={14} color="#10b981" /> : <Copy size={14} />}
                  {copiedSummary ? 'Copied!' : 'Copy Summary'}
                </button>
              </div>
              <p className="summary-text">{summary}</p>
            </div>

            {/* Key Points Extraction */}
            {keyPoints && keyPoints.length > 0 && (
              <div className="concept-card" style={{ marginTop: 22 }}>
                <h4 className="concept-card-title">
                  <Sparkles size={16} color="#4f46e5" /> Essential High-Yield Key Points
                </h4>
                <div className="keypoints-list">
                  {keyPoints.map((pt, idx) => {
                    const isChecked = checkedKeyPoints[idx];
                    return (
                      <div
                        key={idx}
                        className={`keypoint-item ${isChecked ? 'item-checked' : ''}`}
                        onClick={() => toggleKeyPoint(idx)}
                      >
                        <div className="point-checkbox">
                          {isChecked && <Check size={12} color="white" />}
                        </div>
                        <span className="point-text">{pt}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Important Definitions Table */}
            {definitions && definitions.length > 0 && (
              <div className="concept-card" style={{ marginTop: 22 }}>
                <h4 className="concept-card-title">
                  <Tag size={16} color="#06b6d4" /> Important Definitions & Exam Applications
                </h4>
                <div className="definitions-grid">
                  {definitions.map((def, idx) => (
                    <div key={idx} className="definition-card">
                      <div className="def-term">{def.term}</div>
                      <p className="def-body">{def.definition}</p>
                      {def.example && (
                        <div className="def-example">
                          <strong>Application:</strong> {def.example}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Deep Comprehensive Analysis */}
            {deepSummary && (
              <div className="concept-card" style={{ marginTop: 22 }}>
                <h4 className="concept-card-title">
                  <BookOpen size={16} color="#8b5cf6" /> In-Depth Academic Topic Analysis
                </h4>
                <div className="deep-summary-body">
                  <pre style={{ whiteSpace: 'pre-wrap', fontFamily: 'inherit', color: '#334155' }}>
                    {deepSummary}
                  </pre>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Tab 2: Flashcards Deck */}
        <div style={{ display: activeTab === 'flashcards' ? 'block' : 'none' }}>
          <FlashcardDeck flashcards={flashcards} subjectTitle={title} />
        </div>

        {/* Tab 3: Self-Test Quiz Engine */}
        <div style={{ display: activeTab === 'quiz' ? 'block' : 'none' }}>
          <QuizEngine
            quiz={quiz}
            onRecordResult={handleRecordQuizResult}
            onLogMistakes={handleLogMistakes}
            onResolveMistakes={handleResolveMultipleMistakes}
          />
        </div>

        {/* Tab 4: Weakness & Analytics */}
        <div style={{ display: activeTab === 'analytics' ? 'block' : 'none' }}>
          <AnalyticsDashboard
            quizHistory={quizHistory}
            questionResults={latestQuestionResults}
            subtopics={subtopics}
            onJumpToMistakes={() => setActiveTab('mistakes')}
            onStudyNext={handleStudyNextAction}
          />
        </div>

        {/* Tab 5: Mistake Vault */}
        <div style={{ display: activeTab === 'mistakes' ? 'block' : 'none' }}>
          <MistakeVault
            mistakes={mistakesBank}
            onClearMistakes={() => setMistakesBank([])}
            onResolveMistake={handleResolveMistake}
          />
        </div>

        {/* Tab 6: AI Tutor Chat */}
        <div style={{ display: activeTab === 'tutor' ? 'block' : 'none' }}>
          <AITutorChat notes={rawNotes || summary} topicTitle={title} />
        </div>

        {/* Tab 7: Presentation Deck */}
        <div style={{ display: activeTab === 'presentation' ? 'block' : 'none' }}>
          <PresentationDeck slides={presentationSlides} topicTitle={title} />
        </div>

        {/* Tab 8: Personalized Study Plan */}
        <div style={{ display: activeTab === 'plan' ? 'block' : 'none' }}>
          <StudyPlanModal notes={rawNotes || summary} weakTopics={subtopics} />
        </div>
      </div>

      {/* Bottom Session Navigation Bar */}
      <div className="session-actions">
        <button
          type="button"
          className="btn-secondary"
          onClick={onEditNotes}
          disabled={isRegenerating}
        >
          <Edit3 size={16} /> Edit Notes / New Lecture
        </button>

        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <button
            type="button"
            className="btn-secondary"
            onClick={handleStudyNextAction}
            title="Jump to targeted revision"
          >
            <Sparkles size={16} color="#f59e0b" />
            What Should I Study Now?
          </button>

          <button
            type="button"
            className="btn-primary"
            style={{ width: 'auto', padding: '10px 22px' }}
            onClick={onReviseAgain}
            disabled={isRegenerating}
          >
            <RotateCw size={16} className={isRegenerating ? 'spinner' : ''} />
            {isRegenerating ? 'Generating Variations...' : '🔄 Revise Again (New Questions)'}
          </button>
        </div>
      </div>
    </div>
  );
}
