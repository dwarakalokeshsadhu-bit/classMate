import React, { useState, useEffect, useCallback } from 'react';
import {
  Calendar, Clock, CheckSquare, Sparkles, Loader2, Award,
  AlertCircle, ChevronRight, Check, Zap, Flame, Target
} from 'lucide-react';
import { apiUrl } from '../utils/api.js';

// Helper to get formatted YYYY-MM-DD
const getTodayDateStr = () => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const getFutureDateStr = (daysAhead) => {
  const d = new Date();
  d.setDate(d.getDate() + daysAhead);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const calculateCalendarDaysLeft = (targetDateStr) => {
  if (!targetDateStr) return 5;
  const parts = targetDateStr.split('-');
  const y = parseInt(parts[0], 10);
  const m = parseInt(parts[1], 10) - 1;
  const d = parseInt(parts[2], 10);

  const targetDate = new Date(y, m, d);
  targetDate.setHours(0, 0, 0, 0);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const diffTime = targetDate.getTime() - today.getTime();
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
  return Math.max(1, Math.min(diffDays, 30));
};

export default function StudyPlanModal({
  notes = '',
  weakTopics = [],
  onClose
}) {
  const [examDate, setExamDate] = useState(() => getFutureDateStr(5));
  const [countdown, setCountdown] = useState({ days: 5, hours: 0, minutes: 0 });
  const [plan, setPlan] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [completedTasks, setCompletedTasks] = useState({});
  const [activePreset, setActivePreset] = useState(5);

  const todayStr = getTodayDateStr();

  // Load saved task progress from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('pm_completed_tasks');
      if (saved) setCompletedTasks(JSON.parse(saved));
    } catch (e) {}
  }, []);

  // Calculate live countdown timer
  useEffect(() => {
    const updateCountdown = () => {
      if (!examDate) return;
      const parts = examDate.split('-');
      const y = parseInt(parts[0], 10);
      const m = parseInt(parts[1], 10) - 1;
      const d = parseInt(parts[2], 10);

      // Target 09:00 AM on the exam morning
      const targetTime = new Date(y, m, d, 9, 0, 0).getTime();
      const now = Date.now();
      const diff = Math.max(0, targetTime - now);

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

      setCountdown({ days, hours, minutes });
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 10000);
    return () => clearInterval(interval);
  }, [examDate]);

  // Generate study plan for given date and days count
  const generatePlanForDays = useCallback(async (targetDate, daysCount) => {
    setIsLoading(true);
    const validDays = Math.max(1, Math.min(daysCount || 5, 30));

    try {
      const res = await fetch(apiUrl('/api/generate/study-plan'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          notes,
          examDate: targetDate,
          daysLeft: validDays,
          weakTopics
        })
      });

      const json = await res.json();
      if (json.success && json.plan && json.plan.schedule) {
        setPlan(json.plan);
      } else {
        throw new Error('API returned empty plan');
      }
    } catch (err) {
      console.warn('Assembling responsive client plan fallback:', err.message);

      // Extract topic names from notes if present
      const extracted = [];
      if (notes && typeof notes === 'string') {
        const lines = notes.split('\n');
        for (const line of lines) {
          const trimmed = line.replace(/^[#*-•\s]+/, '').trim();
          if (trimmed.length > 5 && trimmed.length < 40 && !trimmed.startsWith('http') && !trimmed.toLowerCase().includes('lecture')) {
            extracted.push(trimmed);
            if (extracted.length >= 6) break;
          }
        }
      }

      const primaryWeakness = weakTopics.length > 0 ? weakTopics[0] : (extracted[0] || 'Core Principles');
      const secondaryWeakness = weakTopics.length > 1 ? weakTopics[1] : (extracted[1] || 'Key Definitions');

      const fallbackSchedule = [];

      if (validDays === 1) {
        fallbackSchedule.push({
          day: 1,
          title: "Emergency 24-Hour High-Yield Sprint & Mastery Check",
          tasks: [
            "Read 60-second rescue summary 3x to lock in core invariants",
            `Targeted drill on high-risk concepts: ${primaryWeakness}`,
            "Review all flashcards with active recall (focus on Hard/Again)",
            "Clear every item currently banked in the Mistake Vault",
            "Take 1 Timed Mock Exam to establish final confidence"
          ],
          estimatedMinutes: 45
        });
      } else if (validDays === 2) {
        fallbackSchedule.push({
          day: 1,
          title: "Foundation Sprint & Weakness Triage",
          tasks: [
            "Read 60-second rescue summary and core definitions",
            `Master foundational flashcards for ${primaryWeakness}`,
            "Complete baseline quiz attempt to detect remaining danger zones"
          ],
          estimatedMinutes: 30
        });
        fallbackSchedule.push({
          day: 2,
          title: "Mistake Elimination & Final Mock Simulation",
          tasks: [
            "Review all Mistake Vault items until 0 mistakes remain",
            "5-minute Timed Mock Exam Mode (aim for 90%+ pass rate)",
            "Final rapid skim of high-yield key takeaways and formula sheet"
          ],
          estimatedMinutes: 35
        });
      } else if (validDays === 3) {
        fallbackSchedule.push({
          day: 1,
          title: "Core Foundation & Terminology Sprint",
          tasks: [
            "Read 60-second rescue summary 2x",
            "Master foundational definitions and term cards",
            "Baseline quiz to gauge starting score and identify danger zones"
          ],
          estimatedMinutes: 25
        });
        fallbackSchedule.push({
          day: 2,
          title: `Weakness Deep-Dive: ${primaryWeakness}`,
          tasks: [
            `Review mistakes and distractor traps for ${primaryWeakness}`,
            "Ask AI Tutor to 'Explain in Detail' and provide concrete real-world examples",
            "Complete targeted 5-question adaptive drill"
          ],
          estimatedMinutes: 30
        });
        fallbackSchedule.push({
          day: 3,
          title: "Full Mock Exam & Final Confidence Check",
          tasks: [
            "Timed Mock Exam Mode (simulate exam conditions)",
            "Review any remaining Mistake Vault items",
            "Final skim of 60-second rescue summary"
          ],
          estimatedMinutes: 25
        });
      } else {
        const themes = [
          { title: "Core Foundation & Terminology Sprint", minutes: 25, tasks: ["Read 60-second rescue summary 2x", "Master core terminology & definitions", "Complete baseline quiz attempt to map strengths"] },
          { title: `Targeted Weakness Triage: ${primaryWeakness}`, minutes: 30, tasks: [`Review mistakes on ${primaryWeakness}`, "Ask AI Tutor to 'Explain Simply' and draw concept diagram", "Complete targeted 5-question drill on missed concepts"] },
          { title: "Active Recall Flashcard Sprint", minutes: 25, tasks: ["Review all flashcards with Leitner spaced repetition", "Filter deck for 'Hard' cards and repeat until fluent", "Use audio speech read-aloud to reinforce verbal memory"] },
          { title: `Secondary Focus & Application: ${secondaryWeakness}`, minutes: 25, tasks: [`Test harder question variations on ${secondaryWeakness}`, "Eliminate any lingering 'Danger Zone' high-confidence errors", "Verify key definitions with 100% precision"] },
          { title: "Adaptive Quiz & Distractor Trap Evasion", minutes: 30, tasks: ["Take adaptive quiz aiming for 90%+ on Hard questions", "Study the explanations for incorrect distractors", "Bank new mistakes directly into the Mistake Vault"] },
          { title: "Mistake Vault Liquidation & Speed Drill", minutes: 25, tasks: ["Drill all banked errors until mistake counter hits zero", "Review presentation slides for structured concept hierarchy", "Test self-explanation on complex multi-step processes"] },
          { title: "Mid-Term Knowledge Consolidation", minutes: 30, tasks: ["Comprehensive flashcard sweep across all saved topics", "Verify confidence vs. correctness 2x2 matrix calibration", "Review summary notes without looking at answers"] }
        ];

        for (let i = 1; i <= validDays; i++) {
          if (i === validDays) {
            fallbackSchedule.push({
              day: i,
              title: "Final Exam Simulation & Readiness Confirmation",
              tasks: [
                "5-minute Timed Mock Exam Mode under strict exam conditions",
                "Clear all remaining Mistake Vault items",
                "Final confidence review of 60-second rescue summary and formulas"
              ],
              estimatedMinutes: 30
            });
          } else if (i <= themes.length) {
            const theme = themes[i - 1];
            fallbackSchedule.push({
              day: i,
              title: theme.title,
              tasks: theme.tasks,
              estimatedMinutes: theme.minutes
            });
          } else {
            const topicRef = extracted[(i - 1) % extracted.length] || `Module ${i}`;
            fallbackSchedule.push({
              day: i,
              title: `Spaced Repetition & Deep Application: ${topicRef}`,
              tasks: [
                `Active recall review for ${topicRef}`,
                "Adaptive quiz with hard difficulty variations",
                "Consult AI Tutor for edge-case questions and common exam traps"
              ],
              estimatedMinutes: 20
            });
          }
        }
      }

      let recommendation;
      if (validDays <= 2) {
        recommendation = "⚡ Emergency 24–48h High-Yield Cram: Prioritize the 60-Second Rescue Summary and Mistake Vault drills over passive reading.";
      } else if (validDays <= 5) {
        recommendation = "🎯 Accelerated Sprint: Spend 25–30 focused minutes per day using active recall rather than passive rereading.";
      } else if (validDays <= 14) {
        recommendation = "🌱 Optimal Spaced Repetition: Spend 20–25 minutes daily cycling flashcards and testing adaptive quizzes.";
      } else {
        recommendation = "🏆 Paced Mastery: Spend 15–20 minutes daily across structured revision cycles to cement permanent conceptual retention.";
      }

      setPlan({
        examDate: targetDate,
        daysRemaining: validDays,
        totalRevisionMinutes: fallbackSchedule.reduce((acc, d) => acc + (d.estimatedMinutes || 25), 0),
        schedule: fallbackSchedule,
        recommendation
      });
    } finally {
      setIsLoading(false);
    }
  }, [notes, weakTopics]);

  // Initial plan generation on mount
  useEffect(() => {
    const days = calculateCalendarDaysLeft(examDate);
    generatePlanForDays(examDate, days);
  }, []);

  // Date input handler
  const handleDateChange = (e) => {
    const selectedDate = e.target.value;
    if (!selectedDate) return;
    setExamDate(selectedDate);
    const days = calculateCalendarDaysLeft(selectedDate);
    setActivePreset(days);
    generatePlanForDays(selectedDate, days);
  };

  // Quick preset click handler
  const handlePresetSelect = (daysCount) => {
    const targetDate = getFutureDateStr(daysCount);
    setExamDate(targetDate);
    setActivePreset(daysCount);
    generatePlanForDays(targetDate, daysCount);
  };

  const toggleTask = (key) => {
    setCompletedTasks(prev => {
      const updated = {
        ...prev,
        [key]: !prev[key]
      };
      try {
        localStorage.setItem('pm_completed_tasks', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });
  };

  // Calculate completed progress
  const allTasks = plan?.schedule?.flatMap((d, dIdx) =>
    (d.tasks || []).map((_, tIdx) => `d${d.day}-t${tIdx}`)
  ) || [];
  const completedCount = allTasks.filter(k => completedTasks[k]).length;
  const progressPercent = allTasks.length > 0 ? Math.round((completedCount / allTasks.length) * 100) : 0;

  return (
    <div className="study-plan-container">
      {/* 1. Countdown Hero Banner with Sage Green & Dark Forest Theme */}
      <div className="countdown-banner">
        <div className="countdown-info">
          <div className="countdown-tag">
            <Clock size={14} color="var(--primary)" />
            <span>EXAM COUNTDOWN</span>
          </div>
          <h3 className="countdown-title">Your Target Exam Date</h3>

          {/* Interactive Date Picker */}
          <div className="exam-date-picker-row">
            <Calendar size={18} color="var(--primary)" />
            <input
              type="date"
              className="exam-date-picker"
              value={examDate}
              min={todayStr}
              onChange={handleDateChange}
              title="Click to pick your target exam date"
            />
            <span className="exam-date-hint">
              ({plan?.daysRemaining || countdown.days} {plan?.daysRemaining === 1 ? 'day' : 'days'} remaining)
            </span>
          </div>

          {/* Quick Preset Selector Buttons */}
          <div className="exam-preset-pills">
            <span className="preset-label">Quick Set:</span>
            <button
              type="button"
              className={`preset-pill ${activePreset === 1 ? 'active' : ''}`}
              onClick={() => handlePresetSelect(1)}
            >
              Tomorrow (1d)
            </button>
            <button
              type="button"
              className={`preset-pill ${activePreset === 3 ? 'active' : ''}`}
              onClick={() => handlePresetSelect(3)}
            >
              3 Days
            </button>
            <button
              type="button"
              className={`preset-pill ${activePreset === 5 ? 'active' : ''}`}
              onClick={() => handlePresetSelect(5)}
            >
              5 Days
            </button>
            <button
              type="button"
              className={`preset-pill ${activePreset === 7 ? 'active' : ''}`}
              onClick={() => handlePresetSelect(7)}
            >
              1 Week (7d)
            </button>
            <button
              type="button"
              className={`preset-pill ${activePreset === 14 ? 'active' : ''}`}
              onClick={() => handlePresetSelect(14)}
            >
              2 Weeks (14d)
            </button>
            <button
              type="button"
              className={`preset-pill ${activePreset === 30 ? 'active' : ''}`}
              onClick={() => handlePresetSelect(30)}
            >
              1 Month (30d)
            </button>
          </div>
        </div>

        {/* Live Countdown Clock Tiles */}
        <div className="countdown-tiles">
          <div className="countdown-tile">
            <span className="tile-num">{countdown.days}</span>
            <span className="tile-label">Days</span>
          </div>
          <div className="countdown-tile">
            <span className="tile-num">{countdown.hours}</span>
            <span className="tile-label">Hours</span>
          </div>
          <div className="countdown-tile">
            <span className="tile-num">{countdown.minutes}</span>
            <span className="tile-label">Mins</span>
          </div>
        </div>
      </div>

      {/* 2. Plan Details & Timeline */}
      {isLoading ? (
        <div className="plan-loading">
          <Loader2 size={26} className="spinner" color="var(--primary)" />
          <p style={{ marginTop: 12, fontWeight: 600, color: 'var(--text-main)' }}>
            Adapting study milestones to your {calculateCalendarDaysLeft(examDate)}-day timeline...
          </p>
        </div>
      ) : plan ? (
        <div className="plan-schedule-wrapper">
          {/* Strategic Advice Bar */}
          <div className="plan-summary-bar">
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1, minWidth: 260 }}>
              <span style={{ fontSize: '1.1rem' }}>💡</span>
              <span style={{ fontSize: '0.88rem', color: '#18201B', fontWeight: 700, lineHeight: 1.4 }}>
                <strong>Strategic Advice:</strong> {plan.recommendation || 'Spend 20–25 focused minutes per day using active recall rather than passive rereading.'}
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span className="plan-time-badge">
                Total Revision Time: ~{plan.totalRevisionMinutes || 100} mins
              </span>
              {allTasks.length > 0 && (
                <span className="plan-progress-pill">
                  {completedCount}/{allTasks.length} Completed ({progressPercent}%)
                </span>
              )}
            </div>
          </div>

          {/* Days Timeline matching exact selected days */}
          <div className="days-timeline">
            {(plan.schedule || []).map((dayItem) => {
              const dayTasks = dayItem.tasks || [];
              const dayTasksKeys = dayTasks.map((_, tIdx) => `d${dayItem.day}-t${tIdx}`);
              const dayCompletedCount = dayTasksKeys.filter(k => completedTasks[k]).length;
              const isDayAllDone = dayTasks.length > 0 && dayCompletedCount === dayTasks.length;

              return (
                <div key={dayItem.day} className={`timeline-day-card ${isDayAllDone ? 'day-completed' : ''}`}>
                  <div className="day-card-header">
                    <span className="day-number">Day {dayItem.day}</span>
                    <span className="day-title">{dayItem.title}</span>
                    <span className="day-duration">⏱️ {dayItem.estimatedMinutes} mins</span>
                  </div>

                  <div className="day-tasks-list">
                    {dayTasks.map((task, tIdx) => {
                      const taskKey = `d${dayItem.day}-t${tIdx}`;
                      const isDone = completedTasks[taskKey];
                      return (
                        <div
                          key={tIdx}
                          className={`day-task-item ${isDone ? 'task-done' : ''}`}
                          onClick={() => toggleTask(taskKey)}
                          title="Click to toggle task completion"
                        >
                          <div className="task-checkbox">
                            {isDone && <Check size={13} strokeWidth={3} color="white" />}
                          </div>
                          <span className="task-text">{task}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="alert-error" style={{ padding: 16 }}>
          <AlertCircle size={18} />
          <span>Could not generate study plan. Please pick a target exam date above.</span>
        </div>
      )}
    </div>
  );
}
