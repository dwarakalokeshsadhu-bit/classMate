import React from 'react';
import {
  TrendingUp, AlertTriangle, CheckCircle, HelpCircle, ShieldAlert,
  Target, Sparkles, BookOpen, Clock, ArrowRight
} from 'lucide-react';

export default function AnalyticsDashboard({
  quizHistory = [],
  questionResults = [],
  subtopics = [],
  onJumpToMistakes,
  onStudyNext
}) {
  // If no quiz has been taken yet
  if (!questionResults || questionResults.length === 0) {
    return (
      <div className="analytics-empty">
        <Target size={40} color="#6366f1" style={{ marginBottom: 12 }} />
        <h3>Smart Learning & Weakness Detector</h3>
        <p>Complete at least one Self-Test Quiz to unlock your 2x2 Confidence Matrix, Weak-Topic Detection, and First Attempt → Final Mastery tracking.</p>
      </div>
    );
  }

  // Calculate 2x2 Matrix Quadrants
  // 1. Danger Zone: High confidence + Incorrect (Highest Risk!)
  // 2. Lucky Guess: Low confidence + Correct (Unstable knowledge)
  // 3. Learning Gap: Low confidence + Incorrect (Needs primary study)
  // 4. Solid Mastery: High confidence + Correct (Locked in!)
  const dangerZone = questionResults.filter(q => q.confidence === 'high' && !q.isCorrect);
  const luckyGuess = questionResults.filter(q => q.confidence === 'low' && q.isCorrect);
  const learningGap = questionResults.filter(q => q.confidence === 'low' && !q.isCorrect);
  const solidMastery = questionResults.filter(q => (q.confidence === 'high' || q.confidence === 'medium') && q.isCorrect);

  // Group performance by topic
  const topicStats = {};
  questionResults.forEach((q) => {
    const topic = q.topic || 'General Concepts';
    if (!topicStats[topic]) {
      topicStats[topic] = { total: 0, correct: 0 };
    }
    topicStats[topic].total += 1;
    if (q.isCorrect) topicStats[topic].correct += 1;
  });

  const topicsList = Object.entries(topicStats).map(([topic, stat]) => {
    const accuracy = Math.round((stat.correct / stat.total) * 100);
    const isWeak = accuracy < 60;
    return {
      topic,
      accuracy,
      total: stat.total,
      isWeak
    };
  });

  // Determine "What Should I Study Now?" recommendation
  let studyNextHeadline = '';
  let studyNextReason = '';

  if (dangerZone.length > 0) {
    studyNextHeadline = `Address ${dangerZone.length} Danger Zone Mistake${dangerZone.length > 1 ? 's' : ''}`;
    studyNextReason = `You had High Confidence on questions you answered incorrectly. These create the highest exam deductions.`;
  } else {
    const weakest = topicsList.find(t => t.isWeak);
    if (weakest) {
      studyNextHeadline = `Target Weak Topic: ${weakest.topic}`;
      studyNextReason = `Current accuracy is ${weakest.accuracy}%. Review definitions and flashcards before re-quizzing.`;
    } else if (luckyGuess.length > 0) {
      studyNextHeadline = `Reinforce ${luckyGuess.length} Lucky Guess Question${luckyGuess.length > 1 ? 's' : ''}`;
      studyNextReason = `You answered correctly with Low Confidence. Read the deep explanations to solidify the concept.`;
    } else {
      studyNextHeadline = `Comprehensive Mastery Achieved!`;
      studyNextReason = `All tested topics show > 80% accuracy. Run a Timed Mock Exam to test speed under pressure.`;
    }
  }

  // Attempt progression
  const firstAttempt = quizHistory[0] ? quizHistory[0].percentage : Math.round((solidMastery.length / questionResults.length) * 100);
  const latestAttempt = quizHistory[quizHistory.length - 1] ? quizHistory[quizHistory.length - 1].percentage : firstAttempt;

  return (
    <div className="analytics-dashboard">
      {/* "What Should I Study Now?" Smart Action Card */}
      <div className="study-next-card">
        <div className="study-next-left">
          <div className="study-next-tag">
            <Sparkles size={14} /> AI Recommendation: What To Study Next
          </div>
          <h4 className="study-next-headline">{studyNextHeadline}</h4>
          <p className="study-next-reason">{studyNextReason}</p>
        </div>
        <button
          type="button"
          className="btn-primary study-next-btn"
          onClick={onStudyNext}
        >
          <span>Begin Targeted Revision</span>
          <ArrowRight size={16} />
        </button>
      </div>

      {/* 2x2 Confidence vs. Correctness Matrix */}
      <div className="matrix-section">
        <h4 className="section-title">
          <Target size={18} /> Confidence vs. Correctness Tracking (2x2 Matrix)
        </h4>
        <p className="section-desc">
          Evaluates cognitive calibration. Eliminates false confidence and isolates topics needing immediate reinforcement.
        </p>

        <div className="matrix-grid">
          {/* Danger Zone */}
          <div className="matrix-quadrant quad-danger">
            <div className="quad-header">
              <ShieldAlert size={18} color="#ef4444" />
              <span className="quad-title">Danger Zone</span>
              <span className="quad-badge bg-danger">{dangerZone.length}</span>
            </div>
            <p className="quad-metric">High Confidence &bull; Wrong Answer</p>
            <p className="quad-advice">
              Highest exam threat! You were sure of the wrong answer. Triage these first.
            </p>
          </div>

          {/* Lucky Guess */}
          <div className="matrix-quadrant quad-warning">
            <div className="quad-header">
              <HelpCircle size={18} color="#f59e0b" />
              <span className="quad-title">Lucky Guess</span>
              <span className="quad-badge bg-warning">{luckyGuess.length}</span>
            </div>
            <p className="quad-metric">Low Confidence &bull; Correct Answer</p>
            <p className="quad-advice">
              Unstable retention. You got it right but weren't sure why. Review rationale.
            </p>
          </div>

          {/* Learning Gap */}
          <div className="matrix-quadrant quad-gap">
            <div className="quad-header">
              <AlertTriangle size={18} color="#8b5cf6" />
              <span className="quad-title">Learning Gap</span>
              <span className="quad-badge bg-purple">{learningGap.length}</span>
            </div>
            <p className="quad-metric">Low Confidence &bull; Wrong Answer</p>
            <p className="quad-advice">
              Unfamiliar material. Read the 60-second summary and practice flashcards.
            </p>
          </div>

          {/* Solid Mastery */}
          <div className="matrix-quadrant quad-mastery">
            <div className="quad-header">
              <CheckCircle size={18} color="#10b981" />
              <span className="quad-title">Solid Mastery</span>
              <span className="quad-badge bg-success">{solidMastery.length}</span>
            </div>
            <p className="quad-metric">High Confidence &bull; Correct Answer</p>
            <p className="quad-advice">
              Reliable long-term memory! Ready for exam day.
            </p>
          </div>
        </div>
      </div>

      {/* Weak-Topic Classification */}
      <div className="topics-section">
        <h4 className="section-title">
          <TrendingUp size={18} /> Topic-Wise Performance & Weakness Detector
        </h4>
        <div className="topics-grid">
          {topicsList.map((t) => (
            <div
              key={t.topic}
              className={`topic-card ${t.isWeak ? 'topic-weak' : 'topic-strong'}`}
            >
              <div className="topic-card-top">
                <span className="topic-name">{t.topic}</span>
                <span className={`topic-status-pill ${t.isWeak ? 'status-weak' : 'status-strong'}`}>
                  {t.isWeak ? '⚠️ Weak Topic' : '✅ Strong Topic'}
                </span>
              </div>

              <div className="topic-bar-wrapper">
                <div
                  className={`topic-bar-fill ${t.isWeak ? 'bar-weak' : 'bar-strong'}`}
                  style={{ width: `${t.accuracy}%` }}
                />
              </div>

              <div className="topic-meta">
                <span>Accuracy: <strong>{t.accuracy}%</strong></span>
                <span>{t.total} question{t.total > 1 ? 's' : ''} tested</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* First Attempt -> Final Mastery Tracker */}
      <div className="mastery-progression-card">
        <h4 className="section-title">
          <Clock size={18} /> Mastery Progression: First Attempt → Current Mastery
        </h4>
        <div className="progression-flex">
          <div className="prog-stat">
            <span className="prog-label">First Attempt Score</span>
            <span className="prog-value text-muted">{firstAttempt}%</span>
          </div>

          <div className="prog-arrow">➔</div>

          <div className="prog-stat">
            <span className="prog-label">Current Mastery Score</span>
            <span className="prog-value text-primary">{latestAttempt}%</span>
          </div>

          <div className="prog-stat prog-diff">
            <span className="prog-label">Net Improvement</span>
            <span className={`prog-badge ${latestAttempt >= firstAttempt ? 'prog-up' : 'prog-down'}`}>
              {latestAttempt >= firstAttempt ? `+${latestAttempt - firstAttempt}% Gain` : `${latestAttempt - firstAttempt}%`}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
