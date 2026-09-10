import React, { useState, useEffect, useRef } from 'react';
import {
  CheckCircle2, XCircle, Award, RotateCcw, Volume2, Timer,
  Sparkles, AlertCircle, TrendingUp, ShieldAlert, ArrowRight, Check
} from 'lucide-react';
import confetti from 'canvas-confetti';

const OPTION_LETTERS = ['A', 'B', 'C', 'D'];

export default function QuizEngine({
  quiz = [],
  onRecordResult,
  onLogMistakes,
  onResolveMistakes
}) {
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [confidenceRatings, setConfidenceRatings] = useState({}); // { [qIdx]: 'low'|'medium'|'high' }
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isAdaptiveMode, setIsAdaptiveMode] = useState(false);
  const [adaptiveLevel, setAdaptiveLevel] = useState(1); // 1: Foundation (Easy), 2: Intermediate (Medium), 3: Advanced (Hard)
  const [isExamMode, setIsExamMode] = useState(false);
  const [examTimeRemaining, setExamTimeRemaining] = useState(300); // 5 minutes in seconds
  const [onlyShowIncorrect, setOnlyShowIncorrect] = useState(false);
  const [retryMode, setRetryMode] = useState(false);

  const timerRef = useRef(null);
  const selectedAnswersRef = useRef(selectedAnswers);
  const confidenceRatingsRef = useRef(confidenceRatings);

  // Keep refs in sync to prevent stale closures in timer callbacks
  useEffect(() => {
    selectedAnswersRef.current = selectedAnswers;
  }, [selectedAnswers]);

  useEffect(() => {
    confidenceRatingsRef.current = confidenceRatings;
  }, [confidenceRatings]);

  // Reset state when quiz changes
  useEffect(() => {
    setSelectedAnswers({});
    setConfidenceRatings({});
    setIsSubmitted(false);
    setOnlyShowIncorrect(false);
    setRetryMode(false);
    setExamTimeRemaining(300);
    setAdaptiveLevel(1);
  }, [quiz]);

  // Exam mode countdown timer
  useEffect(() => {
    if (isExamMode && !isSubmitted) {
      timerRef.current = setInterval(() => {
        setExamTimeRemaining((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isExamMode, isSubmitted]);

  // Handle auto-submit on exam timeout
  useEffect(() => {
    if (isExamMode && !isSubmitted && examTimeRemaining === 0) {
      handleSubmit();
    }
  }, [examTimeRemaining, isExamMode, isSubmitted]);

  if (!quiz || quiz.length === 0) {
    return <p className="text-muted">No quiz questions available for this topic.</p>;
  }

  // Answer selection
  const handleSelect = (questionIdx, optionStr) => {
    if (isSubmitted) return;
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionIdx]: optionStr
    }));

    // Default confidence to medium if not set
    if (!confidenceRatings[questionIdx]) {
      setConfidenceRatings((prev) => ({
        ...prev,
        [questionIdx]: 'medium'
      }));
    }

    // If Adaptive Mode is enabled, dynamically calibrate difficulty level
    if (isAdaptiveMode) {
      const q = quiz[questionIdx];
      if (q) {
        const isRight = optionStr === q.correctAnswer;
        if (isRight) {
          setAdaptiveLevel(prev => Math.min(3, prev + 1));
        } else {
          setAdaptiveLevel(prev => Math.max(1, prev - 1));
        }
      }
    }
  };

  // Confidence selection
  const handleConfidence = (questionIdx, level) => {
    if (isSubmitted) return;
    setConfidenceRatings((prev) => ({
      ...prev,
      [questionIdx]: level
    }));
  };

  // Submit quiz
  const handleSubmit = () => {
    setIsSubmitted(true);
    if (timerRef.current) clearInterval(timerRef.current);

    const currentAnswers = selectedAnswersRef.current;
    const currentConfidences = confidenceRatingsRef.current;

    let correctCount = 0;
    const mistakesList = [];
    const resolvedIds = [];
    const questionResults = [];

    quiz.forEach((q, idx) => {
      const userAnswer = currentAnswers[idx];
      const confidence = currentConfidences[idx] || 'medium';
      const isCorrect = userAnswer === q.correctAnswer;

      if (isCorrect) {
        correctCount++;
        resolvedIds.push(q.id || `q-${idx}`);
      } else {
        mistakesList.push({
          id: q.id || `q-${idx}`,
          question: q.question,
          topic: q.topic || 'General',
          userAnswer: userAnswer || 'Not answered',
          correctAnswer: q.correctAnswer,
          explanation: q.explanation || 'Review the core definition in your notes.',
          distractorsExplanation: q.distractorsExplanation || '',
          confidence
        });
      }

      questionResults.push({
        id: q.id || `q-${idx}`,
        topic: q.topic || 'General',
        difficulty: q.difficulty || 'medium',
        isCorrect,
        confidence,
        userAnswer,
        correctAnswer: q.correctAnswer
      });
    });

    const scorePercentage = Math.round((correctCount / quiz.length) * 100);

    // Trigger confetti on good score
    if (scorePercentage >= 70) {
      try {
        confetti({
          particleCount: 90,
          spread: 80,
          origin: { y: 0.6 }
        });
      } catch (e) {}
    }

    // Pass results up to parent for analytics & mistake vault
    if (onRecordResult) {
      onRecordResult({
        score: correctCount,
        total: quiz.length,
        percentage: scorePercentage,
        questionResults,
        timestamp: new Date().toISOString()
      });
    }

    if (onLogMistakes && mistakesList.length > 0) {
      onLogMistakes(mistakesList);
    }

    // If student successfully retried questions, resolve those mistakes in parent bank
    if (onResolveMistakes && resolvedIds.length > 0) {
      onResolveMistakes(resolvedIds);
    }
  };

  // Reset / Retake all
  const handleReset = () => {
    setSelectedAnswers({});
    setConfidenceRatings({});
    setIsSubmitted(false);
    setOnlyShowIncorrect(false);
    setRetryMode(false);
    setExamTimeRemaining(300);
    setAdaptiveLevel(1);
  };

  // Start Retry Incorrect Questions mode
  const handleStartRetry = () => {
    // Find incorrect questions
    const incorrectIndices = [];
    quiz.forEach((q, idx) => {
      if (selectedAnswers[idx] !== q.correctAnswer) {
        incorrectIndices.push(idx);
      }
    });

    if (incorrectIndices.length === 0) return;

    // Clear answers for incorrect questions so student can re-attempt
    const updatedAnswers = { ...selectedAnswers };
    incorrectIndices.forEach(idx => {
      delete updatedAnswers[idx];
    });

    setSelectedAnswers(updatedAnswers);
    setOnlyShowIncorrect(true);
    setRetryMode(true);
    setIsSubmitted(false);
  };

  // Cancel retry mode and show all questions
  const handleCancelRetry = () => {
    setOnlyShowIncorrect(false);
    setRetryMode(false);
    setIsSubmitted(true);
  };

  // Text-to-Speech
  const handleSpeakQuestion = (text, options) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const readText = `${text}. Option A: ${options[0]}. Option B: ${options[1]}. Option C: ${options[2]}. Option D: ${options[3]}.`;
      const utterance = new SpeechSynthesisUtterance(readText);
      utterance.rate = 1.0;
      window.speechSynthesis.speak(utterance);
    }
  };

  // Format timer MM:SS
  const formatTimer = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // Compute adaptive ordered questions or standard list
  const getPreparedQuestions = () => {
    let list = quiz.map((q, idx) => ({ ...q, originalIdx: idx }));

    if (isAdaptiveMode) {
      // Order questions from Easy -> Medium -> Hard to establish progressive difficulty
      const diffWeight = { easy: 1, medium: 2, hard: 3 };
      list = [...list].sort((a, b) => {
        const wa = diffWeight[a.difficulty || 'medium'] || 2;
        const wb = diffWeight[b.difficulty || 'medium'] || 2;
        return wa - wb;
      });
    }

    if (onlyShowIncorrect) {
      // In retry mode, show only questions that were answered incorrectly or are awaiting retry
      list = list.filter((q) => {
        const ans = selectedAnswers[q.originalIdx];
        return ans !== q.correctAnswer;
      });
    }

    return list;
  };

  const displayedQuestions = getPreparedQuestions();
  const totalQuestions = quiz.length;
  const answeredCount = Object.keys(selectedAnswers).length;

  let correctCount = 0;
  quiz.forEach((q, idx) => {
    if (selectedAnswers[idx] === q.correctAnswer) {
      correctCount++;
    }
  });
  const scorePercentage = Math.round((correctCount / totalQuestions) * 100);

  // Check how many displayed questions have answers
  const displayedAnsweredCount = displayedQuestions.filter(q => selectedAnswers[q.originalIdx] !== undefined).length;
  const canSubmit = retryMode
    ? displayedAnsweredCount === displayedQuestions.length && displayedQuestions.length > 0
    : answeredCount > 0;

  return (
    <div className="quiz-engine">
      {/* Top Quiz Controls */}
      <div className="quiz-toolbar">
        <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
          {/* Exam / Mock Test Mode Toggle */}
          <button
            type="button"
            className={`quiz-mode-pill ${isExamMode ? 'active' : ''}`}
            onClick={() => {
              if (!isSubmitted) setIsExamMode(!isExamMode);
            }}
          >
            <Timer size={14} />
            {isExamMode ? `Exam Mode: ${formatTimer(examTimeRemaining)}` : 'Mock Exam Timer (5m)'}
          </button>

          {/* Adaptive Quiz Toggle */}
          <button
            type="button"
            className={`quiz-mode-pill ${isAdaptiveMode ? 'active' : ''}`}
            onClick={() => setIsAdaptiveMode(!isAdaptiveMode)}
            title="Questions adapt progressively from Foundation to Advanced based on performance"
          >
            <TrendingUp size={14} />
            {isAdaptiveMode ? 'Adaptive Quiz (Active)' : 'Standard Quiz'}
          </button>
        </div>

        {/* Adaptive Difficulty Gauge (when Adaptive Mode is active) */}
        {isAdaptiveMode && (
          <div className="adaptive-gauge-pill" style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '4px 12px',
            borderRadius: '9999px',
            background: adaptiveLevel === 3 ? '#ecfdf5' : adaptiveLevel === 2 ? '#eff6ff' : '#fef3c7',
            border: `1px solid ${adaptiveLevel === 3 ? '#10b981' : adaptiveLevel === 2 ? '#3b82f6' : '#f59e0b'}`,
            fontSize: '0.78rem',
            fontWeight: 700,
            color: adaptiveLevel === 3 ? '#065f46' : adaptiveLevel === 2 ? '#1e40af' : '#92400e'
          }}>
            <Sparkles size={13} />
            <span>Adaptive Level {adaptiveLevel}/3: {adaptiveLevel === 1 ? 'Foundational' : adaptiveLevel === 2 ? 'Intermediate' : 'Advanced Mastery'}</span>
          </div>
        )}

        {/* Progress pill */}
        <div className="quiz-progress-info">
          {retryMode ? `${displayedAnsweredCount}/${displayedQuestions.length} Retry Answered` : `${answeredCount}/${totalQuestions} Answered`}
        </div>
      </div>

      {/* Retry Mode Notice Banner */}
      {retryMode && !isSubmitted && (
        <div className="alert-warning" style={{ background: '#fffbeb', borderColor: '#fde68a', color: '#92400e' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
            <span>
              🎯 <strong>Targeted Retry Mode:</strong> Select your corrected answers for the {displayedQuestions.length} missed question{displayedQuestions.length > 1 ? 's' : ''} below.
            </span>
            <button
              type="button"
              className="text-btn-muted"
              style={{ fontSize: '0.78rem', color: '#92400e', textDecoration: 'underline' }}
              onClick={handleCancelRetry}
            >
              Exit Retry
            </button>
          </div>
        </div>
      )}

      {/* Score Banner when submitted */}
      {isSubmitted && (
        <div className="score-banner">
          <div>
            <div className="score-label">Final Quiz Score</div>
            <div className="score-number">
              {correctCount} / {totalQuestions}
            </div>
            <div className="score-label">{scorePercentage}% Mastery Score</div>
          </div>

          <div style={{ flex: 1, paddingLeft: 24 }}>
            <div className="score-msg">
              {scorePercentage === 100
                ? '🏆 Perfect Mastery! Flawless conceptual understanding!'
                : scorePercentage >= 70
                ? '🌟 Great Job! Solid exam retention!'
                : '📖 Learning Opportunity! Check instant explanations & retry incorrect.'}
            </div>

            {/* Adaptive diagnostic feedback if Adaptive Mode was used */}
            {isAdaptiveMode && (
              <div style={{ fontSize: '0.82rem', color: '#4f46e5', marginTop: 6, fontWeight: 600 }}>
                📈 Adaptive Calibration: Reached Level {adaptiveLevel}/3 ({adaptiveLevel === 3 ? 'Advanced Problem Solving' : adaptiveLevel === 2 ? 'Solid Applied Understanding' : 'Needs Core Foundation Drill'}).
              </div>
            )}

            <div style={{ display: 'flex', gap: 10, marginTop: 14, flexWrap: 'wrap' }}>
              <button
                type="button"
                className="btn-secondary"
                style={{ background: 'white', color: '#1e1b4b' }}
                onClick={handleReset}
              >
                <RotateCcw size={15} /> Retake All
              </button>

              {correctCount < totalQuestions && (
                <button
                  type="button"
                  className="btn-secondary"
                  style={{ background: '#fef2f2', color: '#991b1b', borderColor: '#fca5a5' }}
                  onClick={handleStartRetry}
                >
                  <ShieldAlert size={15} />
                  Retry Incorrect Questions ({totalQuestions - correctCount})
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Questions list */}
      {displayedQuestions.map((q, displayIdx) => {
        const qIdx = q.originalIdx;
        const userAnswer = selectedAnswers[qIdx];
        const userConfidence = confidenceRatings[qIdx] || 'medium';
        const isCorrect = isSubmitted && userAnswer === q.correctAnswer;
        const isWrong = isSubmitted && userAnswer && userAnswer !== q.correctAnswer;

        return (
          <div
            key={qIdx}
            className={`quiz-card ${isSubmitted ? (isCorrect ? 'card-correct' : 'card-incorrect') : ''}`}
          >
            {/* Question Header */}
            <div className="quiz-card-header">
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <span className="quiz-q-num">Question {displayIdx + 1}</span>
                {q.topic && <span className="quiz-topic-tag">{q.topic}</span>}
                {q.difficulty && (
                  <span className={`diff-tag diff-${q.difficulty}`}>
                    {q.difficulty}
                  </span>
                )}
              </div>

              <button
                type="button"
                className="btn-speak"
                title="Read question and options aloud"
                onClick={() => handleSpeakQuestion(q.question, q.options)}
              >
                <Volume2 size={16} />
              </button>
            </div>

            {/* Question Text */}
            <div className="quiz-question">{q.question}</div>

            {/* Confidence Selector before/during answering */}
            {!isSubmitted && (
              <div className="confidence-picker">
                <span className="confidence-label">Your Confidence:</span>
                {['low', 'medium', 'high'].map((lvl) => (
                  <button
                    key={lvl}
                    type="button"
                    className={`confidence-btn conf-${lvl} ${userConfidence === lvl ? 'active' : ''}`}
                    onClick={() => handleConfidence(qIdx, lvl)}
                  >
                    {lvl === 'low' ? '🤔 Low' : lvl === 'medium' ? '😐 Medium' : '🔥 High'}
                  </button>
                ))}
              </div>
            )}

            {/* Options List */}
            <div className="quiz-options">
              {q.options.map((option, oIdx) => {
                const isSelected = userAnswer === option;
                let optionClass = 'quiz-option-btn';

                if (isSubmitted) {
                  if (option === q.correctAnswer) {
                    optionClass += ' correct';
                  } else if (isSelected) {
                    optionClass += ' incorrect';
                  }
                } else if (isSelected) {
                  optionClass += ' selected';
                }

                return (
                  <button
                    key={oIdx}
                    type="button"
                    className={optionClass}
                    onClick={() => handleSelect(qIdx, option)}
                    disabled={isSubmitted}
                  >
                    <span className="quiz-option-letter">
                      {OPTION_LETTERS[oIdx] || String.fromCharCode(65 + oIdx)}
                    </span>
                    <span style={{ flex: 1 }}>{option}</span>

                    {isSubmitted && option === q.correctAnswer && (
                      <CheckCircle2 size={18} color="#10b981" />
                    )}
                    {isSubmitted && isSelected && option !== q.correctAnswer && (
                      <XCircle size={18} color="#ef4444" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Instant Explanations after submission */}
            {isSubmitted && (
              <div className="instant-explanation-box">
                <div className="explanation-title">
                  {isCorrect ? '✅ Explanation (Why Option is Correct):' : '❌ Correction & Deep Explanation:'}
                </div>
                <p className="explanation-text">
                  {q.explanation || `The correct answer is "${q.correctAnswer}". This follows the foundational principles established in your lecture notes.`}
                </p>

                {q.distractorsExplanation && (
                  <div className="distractor-box">
                    <strong>⚠️ Why Other Options are Traps:</strong>
                    <p>{q.distractorsExplanation}</p>
                  </div>
                )}

                <div className="confidence-result-tag">
                  Confidence was: <strong>{userConfidence.toUpperCase()}</strong>
                  {userConfidence === 'high' && !isCorrect && (
                    <span className="danger-zone-badge">⚠️ DANGER ZONE: High Confidence Mistake</span>
                  )}
                  {userConfidence === 'low' && isCorrect && (
                    <span className="lucky-guess-badge">🎲 Lucky Guess: Reinforce this concept!</span>
                  )}
                </div>
              </div>
            )}
          </div>
        );
      })}

      {/* Submit Button */}
      {!isSubmitted && (
        <button
          type="button"
          className="btn-primary"
          onClick={handleSubmit}
          disabled={!canSubmit}
        >
          <Award size={20} />
          {retryMode
            ? `Submit Retry & Verify (${displayedAnsweredCount}/${displayedQuestions.length})`
            : answeredCount < totalQuestions
            ? `Submit Quiz (${answeredCount}/${totalQuestions} Answered)`
            : 'Submit Quiz & Check Score'}
        </button>
      )}
    </div>
  );
}
