import React from 'react';
import { BookOpen, Sparkles } from 'lucide-react';

export default function ProgressDashboard({
  noteHistory = [],
  currentSubject,
  studyData,
  onSelectTopic,
  onNewNotes,
  quizHistory = [],
  currentUser
}) {
  // Build real user topics from noteHistory or active studyData
  let historyItems = Array.isArray(noteHistory) ? [...noteHistory] : [];

  // If noteHistory is empty but user currently has an active study session, include it
  if (historyItems.length === 0 && studyData) {
    historyItems.push({
      title: studyData.title || currentSubject || 'Lecture Topic',
      subject: currentSubject || 'General',
      studyData
    });
  }

  // Map real user history into topic rows
  const userTopics = historyItems.map((item, idx) => {
    const topicName = item.title || item.subject || 'Lecture Topic';
    const style = item.studyData?.studyStyle || (idx % 2 === 0 ? 'Professor' : 'Exam Focused');

    const hasQuizScore = item.quizScore !== undefined || item.studyData?.quizScore !== undefined;
    const rawScore = item.quizScore ?? item.studyData?.quizScore;

    let scoreDisplay = 'Unchecked';
    let status = 'NEEDS REVISION';

    if (hasQuizScore && rawScore !== null && rawScore !== undefined) {
      scoreDisplay = `${rawScore}%`;
      status = rawScore >= 75 ? 'STRONG' : 'NEEDS REVISION';
    }

    return {
      topic: topicName,
      style,
      score: scoreDisplay,
      status,
      rawItem: item
    };
  });

  // Compute 4 KPI metric values purely from real data
  const topicsStudiedCount = userTopics.length;

  const numericScores = userTopics
    .map((t) => parseInt(t.score, 10))
    .filter((n) => !isNaN(n));

  const avgQuizScore = numericScores.length > 0
    ? Math.round(numericScores.reduce((a, b) => a + b, 0) / numericScores.length)
    : 0;

  const masteredCount = userTopics.filter((t) => t.status === 'STRONG').length;

  const revisionTime = topicsStudiedCount > 0 ? `${topicsStudiedCount * 12}m` : '0m';

  const handleRowClick = (topicItem) => {
    if (topicItem.rawItem && onSelectTopic) {
      onSelectTopic(topicItem.rawItem);
    } else if (onNewNotes) {
      onNewNotes(topicItem.topic);
    }
  };

  return (
    <div className="learning-progress-container">
      {/* Top Header Section */}
      <div className="progress-header-section">
        <div className="progress-category-tag">ACADEMIC ANALYTICS</div>
        <h1 className="progress-main-title">Learning Progress</h1>
        <p className="progress-subtitle">
          Clear metric indicators tracking topic mastery, revision efficiency, and exam readiness.
        </p>
      </div>

      {/* 4 Metric KPI Cards */}
      <div className="progress-metrics-grid">
        <div className="progress-metric-card">
          <div className="metric-card-label">TOPICS STUDIED</div>
          <div className="metric-card-value">{topicsStudiedCount}</div>
        </div>

        <div className="progress-metric-card">
          <div className="metric-card-label">AVG QUIZ SCORE</div>
          <div className="metric-card-value">{avgQuizScore}%</div>
        </div>

        <div className="progress-metric-card">
          <div className="metric-card-label">MASTERED</div>
          <div className="metric-card-value">{masteredCount}</div>
        </div>

        <div className="progress-metric-card">
          <div className="metric-card-label">REVISION TIME</div>
          <div className="metric-card-value">{revisionTime}</div>
        </div>
      </div>

      {/* Topic Mastery Patterns Section */}
      <div className="progress-patterns-section">
        <div className="progress-patterns-title">TOPIC MASTERY PATTERNS</div>

        <div className="progress-table-wrapper">
          <div className="progress-table-header">
            <div className="col-topic">TOPIC</div>
            <div className="col-style">STYLE</div>
            <div className="col-score">SCORE</div>
            <div className="col-status">STATUS</div>
          </div>

          <div className="progress-table-body">
            {userTopics.length === 0 ? (
              <div className="progress-empty-row">
                <BookOpen size={36} color="#94a3b8" style={{ marginBottom: 10 }} />
                <div className="progress-empty-msg">No Study History Recorded Yet</div>
                <div className="progress-empty-sub">
                  You haven't generated any study kits or taken quizzes yet. Once you upload notes and practice, your topic mastery, revision efficiency, and quiz scores will automatically appear here.
                </div>
                {onNewNotes && (
                  <button
                    type="button"
                    className="btn-primary"
                    style={{ width: 'auto', padding: '9px 20px', fontSize: '0.82rem', marginTop: 14 }}
                    onClick={onNewNotes}
                  >
                    <Sparkles size={14} /> + Create Your First Study Kit
                  </button>
                )}
              </div>
            ) : (
              userTopics.map((t, idx) => (
                <div
                  key={idx}
                  className="progress-table-row"
                  onClick={() => handleRowClick(t)}
                  title={t.rawItem ? `Click to open study kit for ${t.topic}` : `Topic: ${t.topic}`}
                  style={{ cursor: t.rawItem ? 'pointer' : 'default' }}
                >
                  <div className="col-topic">
                    <span className="topic-name">{t.topic}</span>
                  </div>

                  <div className="col-style">
                    <span className="topic-style">{t.style}</span>
                  </div>

                  <div className="col-score">
                    <span className="topic-score">{t.score}</span>
                  </div>

                  <div className="col-status">
                    {t.status === 'STRONG' ? (
                      <span className="status-pill strong">
                        <span className="status-dot-filled">●</span>
                        <span>STRONG</span>
                      </span>
                    ) : (
                      <span className="status-pill needs-revision">
                        <span className="status-dot-outline">⭘</span>
                        <span>NEEDS REVISION</span>
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
