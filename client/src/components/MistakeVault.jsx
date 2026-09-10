import React, { useState, useEffect } from 'react';
import {
  ShieldAlert, CheckCircle2, RotateCcw, Trash2, ArrowRight,
  BookOpen, Sparkles, AlertCircle, Award
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function MistakeVault({
  mistakes = [],
  onClearMistakes,
  onResolveMistake
}) {
  const [drillActive, setDrillActive] = useState(false);
  const [drillIndex, setDrillIndex] = useState(0);
  const [selectedDrillAnswer, setSelectedDrillAnswer] = useState('');
  const [isDrillChecked, setIsDrillChecked] = useState(false);
  const [drillScore, setDrillScore] = useState(0);
  const [drillCompleted, setDrillCompleted] = useState(false);
  const [drillOptions, setDrillOptions] = useState([]);

  const currentDrillQuestion = mistakes[drillIndex];

  // Stable option shuffle per question index
  useEffect(() => {
    if (currentDrillQuestion) {
      const candidates = [
        currentDrillQuestion.correctAnswer,
        currentDrillQuestion.userAnswer,
        "Arbitrary system non-determinism",
        "Outdated legacy standard"
      ].filter((val, idx, arr) => arr.indexOf(val) === idx && val);

      // Deterministic or once-per-question shuffle
      const shuffled = [...candidates].sort(() => 0.5 - Math.random());
      setDrillOptions(shuffled);
    }
  }, [drillIndex, currentDrillQuestion]);

  if (!mistakes || mistakes.length === 0) {
    return (
      <div className="mistake-vault-empty">
        <CheckCircle2 size={48} color="#10b981" style={{ marginBottom: 12 }} />
        <h3>Mistake Vault is Empty & Clean!</h3>
        <p>You currently have zero unaddressed quiz mistakes. As you take quizzes, missed questions and tricky distractors will automatically be banked here for targeted revision drills.</p>
      </div>
    );
  }

  const handleDrillSubmit = () => {
    setIsDrillChecked(true);
    const isCorrect = selectedDrillAnswer === currentDrillQuestion.correctAnswer;
    if (isCorrect) {
      setDrillScore(prev => prev + 1);
      if (onResolveMistake) {
        onResolveMistake(currentDrillQuestion.id || currentDrillQuestion.question);
      }
    }
  };

  const handleDrillNext = () => {
    if (drillIndex + 1 < mistakes.length) {
      setDrillIndex(prev => prev + 1);
      setSelectedDrillAnswer('');
      setIsDrillChecked(false);
    } else {
      // Completed drill
      setDrillCompleted(true);
      try {
        confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
      } catch (e) {}
    }
  };

  const handleCloseDrill = () => {
    setDrillActive(false);
    setDrillCompleted(false);
    setDrillIndex(0);
    setSelectedDrillAnswer('');
    setIsDrillChecked(false);
  };

  return (
    <div className="mistake-vault-container">
      {/* Header Banner */}
      <div className="vault-header">
        <div>
          <div className="vault-tag">
            <ShieldAlert size={14} /> Mistake → Targeted Revision Vault
          </div>
          <h3 className="vault-title">{mistakes.length} High-Yield Concept Trap{mistakes.length > 1 ? 's' : ''} Banked</h3>
          <p className="vault-desc">
            Reviewing where you stumbled is 3x more effective for exam retention than rereading concepts you already know.
          </p>
        </div>

        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <button
            type="button"
            className="btn-primary"
            style={{ width: 'auto', padding: '10px 20px', fontSize: '0.88rem' }}
            onClick={() => {
              setDrillActive(true);
              setDrillCompleted(false);
              setDrillIndex(0);
              setSelectedDrillAnswer('');
              setIsDrillChecked(false);
              setDrillScore(0);
            }}
          >
            <Sparkles size={16} /> Start Targeted Drill ({mistakes.length})
          </button>

          <button
            type="button"
            className="btn-secondary"
            style={{ padding: '10px 14px' }}
            title="Clear all saved mistakes"
            onClick={onClearMistakes}
          >
            <Trash2 size={16} color="#ef4444" />
          </button>
        </div>
      </div>

      {/* Targeted Drill Mode Modal / View */}
      {drillActive && !drillCompleted && currentDrillQuestion && (
        <div className="targeted-drill-box">
          <div className="drill-top">
            <span className="drill-label">
              ⚡ Targeted Drill: Question {drillIndex + 1} of {mistakes.length}
            </span>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <span className="drill-topic">{currentDrillQuestion.topic}</span>
              <button
                type="button"
                className="text-btn-muted"
                style={{ fontSize: '0.78rem', textDecoration: 'underline' }}
                onClick={handleCloseDrill}
              >
                Close Drill
              </button>
            </div>
          </div>

          <div className="drill-question">{currentDrillQuestion.question}</div>

          <div className="drill-options">
            {drillOptions.map((opt, oIdx) => {
              const isSelected = selectedDrillAnswer === opt;
              let optClass = 'quiz-option-btn';

              if (isDrillChecked) {
                if (opt === currentDrillQuestion.correctAnswer) optClass += ' correct';
                else if (isSelected) optClass += ' incorrect';
              } else if (isSelected) {
                optClass += ' selected';
              }

              return (
                <button
                  key={oIdx}
                  type="button"
                  className={optClass}
                  onClick={() => !isDrillChecked && setSelectedDrillAnswer(opt)}
                  disabled={isDrillChecked}
                >
                  <span className="quiz-option-letter">{String.fromCharCode(65 + oIdx)}</span>
                  <span>{opt}</span>
                </button>
              );
            })}
          </div>

          {isDrillChecked && (
            <div className="drill-explanation">
              <strong>Rationale:</strong> {currentDrillQuestion.explanation}
            </div>
          )}

          <div style={{ marginTop: 16, display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
            {!isDrillChecked ? (
              <button
                type="button"
                className="btn-primary"
                style={{ width: 'auto', padding: '8px 20px' }}
                disabled={!selectedDrillAnswer}
                onClick={handleDrillSubmit}
              >
                Verify Answer
              </button>
            ) : (
              <button
                type="button"
                className="btn-primary"
                style={{ width: 'auto', padding: '8px 20px' }}
                onClick={handleDrillNext}
              >
                {drillIndex + 1 < mistakes.length ? 'Next Drill Question' : 'Complete Drill'}
              </button>
            )}
          </div>
        </div>
      )}

      {/* Drill Completed Banner */}
      {drillActive && drillCompleted && (
        <div className="score-banner" style={{ marginBottom: 20 }}>
          <div>
            <div className="score-label">Targeted Drill Score</div>
            <div className="score-number">{drillScore} / {mistakes.length}</div>
            <div className="score-label">Mistakes Corrected!</div>
          </div>
          <div style={{ flex: 1, paddingLeft: 20 }}>
            <div className="score-msg">
              {drillScore === mistakes.length
                ? '🎉 100% Mastery! You eliminated all targeted conceptual traps!'
                : '👍 Good practice! Keep re-testing until you achieve full confidence!'}
            </div>
            <div style={{ marginTop: 12 }}>
              <button
                type="button"
                className="btn-secondary"
                style={{ background: 'white', color: '#1e1b4b' }}
                onClick={handleCloseDrill}
              >
                Done with Drill
              </button>
            </div>
          </div>
        </div>
      )}

      {/* List of banked mistakes */}
      <div className="mistakes-list">
        {mistakes.map((m, idx) => (
          <div key={idx} className="mistake-item-card">
            <div className="mistake-item-header">
              <span className="mistake-badge">Mistake #{idx + 1}</span>
              <span className="mistake-topic">{m.topic}</span>
            </div>

            <div className="mistake-item-q">{m.question}</div>

            <div className="mistake-answers-grid">
              <div className="ans-box ans-wrong">
                <span className="ans-label">Your Previous Answer:</span>
                <span className="ans-text">❌ {m.userAnswer}</span>
              </div>

              <div className="ans-box ans-right">
                <span className="ans-label">Correct Exam Answer:</span>
                <span className="ans-text">✅ {m.correctAnswer}</span>
              </div>
            </div>

            <div className="mistake-explanation-box">
              <strong>💡 Why You Missed It & Rule to Remember:</strong>
              <p>{m.explanation}</p>
              {m.distractorsExplanation && (
                <p style={{ marginTop: 6, fontSize: '0.85rem', color: '#64748b' }}>
                  <strong>Trap Warning:</strong> {m.distractorsExplanation}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
