import React, { useState, useEffect } from 'react';
import {
  Calendar, Clock, CheckSquare, Sparkles, Loader2, Award,
  AlertCircle, ChevronRight, Check
} from 'lucide-react';

export default function StudyPlanModal({
  notes = '',
  weakTopics = [],
  onClose
}) {
  // Default exam date: 5 days from now
  const defaultExamDate = new Date(Date.now() + 5 * 86400000).toISOString().split('T')[0];
  const [examDate, setExamDate] = useState(defaultExamDate);
  const [countdown, setCountdown] = useState({ days: 5, hours: 0, minutes: 0 });
  const [plan, setPlan] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [completedTasks, setCompletedTasks] = useState({});

  // Load saved task progress from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('pm_completed_tasks');
      if (saved) setCompletedTasks(JSON.parse(saved));
    } catch (e) {}
  }, []);

  // Calculate countdown
  useEffect(() => {
    const updateCountdown = () => {
      const target = new Date(examDate).getTime();
      const now = Date.now();
      const diff = Math.max(0, target - now);

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

      setCountdown({ days, hours, minutes });
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 60000);
    return () => clearInterval(interval);
  }, [examDate]);

  // Generate study plan
  const handleGeneratePlan = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/generate/study-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          notes,
          examDate,
          daysLeft: countdown.days || 5,
          weakTopics
        })
      });

      const json = await res.json();
      if (json.success && json.plan) {
        setPlan(json.plan);
      } else {
        throw new Error('API returned unsuccessful response');
      }
    } catch (err) {
      console.warn('Using client fallback study plan:', err.message);
      // Smart offline fallback plan
      const days = Math.max(1, Math.min(countdown.days || 5, 14));
      const fallbackSchedule = [];
      for (let i = 1; i <= days; i++) {
        if (i === 1) {
          fallbackSchedule.push({
            day: 1,
            title: "Foundation Sprint & Active Recall",
            tasks: [
              "Read 60-second rescue summary 2x",
              "Master core terminology & definitions",
              "Complete baseline quiz attempt"
            ],
            estimatedMinutes: 25
          });
        } else if (i === days) {
          fallbackSchedule.push({
            day: i,
            title: "Exam Simulation & Mastery Check",
            tasks: [
              "5-minute Timed Mock Exam Mode",
              "Clear all remaining Mistake Vault items",
              "Final review of key takeaways"
            ],
            estimatedMinutes: 30
          });
        } else {
          fallbackSchedule.push({
            day: i,
            title: `Deep Revision & Weakness Triage (Cycle ${i})`,
            tasks: [
              `Review flashcards for ${weakTopics[0] || 'Core Principles'}`,
              "Targeted drill on previous mistakes",
              "Adaptive quiz to test harder question variations"
            ],
            estimatedMinutes: 25
          });
        }
      }
      setPlan({
        examDate,
        daysRemaining: days,
        totalRevisionMinutes: days * 25,
        recommendation: "Focus 20 minutes daily on active recall flashcards rather than passive rereading.",
        schedule: fallbackSchedule
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    handleGeneratePlan();
  }, [examDate]);

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

  return (
    <div className="study-plan-container">
      {/* Countdown Hero Banner */}
      <div className="countdown-banner">
        <div className="countdown-info">
          <div className="countdown-tag">
            <Clock size={14} /> Exam Countdown
          </div>
          <h3 className="countdown-title">Your Target Exam Date</h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 8 }}>
            <Calendar size={18} color="#c7d2fe" />
            <input
              type="date"
              className="exam-date-picker"
              value={examDate}
              onChange={(e) => setExamDate(e.target.value)}
            />
          </div>
        </div>

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

      {/* Plan Details */}
      {isLoading ? (
        <div className="plan-loading">
          <Loader2 size={24} className="spinner" />
          <p>Assembling custom daily revision milestones...</p>
        </div>
      ) : plan ? (
        <div className="plan-schedule-wrapper">
          <div className="plan-summary-bar">
            <span style={{ fontSize: '0.9rem', color: '#1e1b4b', fontWeight: 700 }}>
              💡 Strategic Advice: {plan.recommendation || 'Focus on active recall flashcards.'}
            </span>
            <span className="plan-time-badge">
              Total Revision Time: ~{plan.totalRevisionMinutes || 100} mins
            </span>
          </div>

          <div className="days-timeline">
            {(plan.schedule || []).map((dayItem) => (
              <div key={dayItem.day} className="timeline-day-card">
                <div className="day-card-header">
                  <span className="day-number">Day {dayItem.day}</span>
                  <span className="day-title">{dayItem.title}</span>
                  <span className="day-duration">⏱️ {dayItem.estimatedMinutes} mins</span>
                </div>

                <div className="day-tasks-list">
                  {(dayItem.tasks || []).map((task, tIdx) => {
                    const taskKey = `d${dayItem.day}-t${tIdx}`;
                    const isDone = completedTasks[taskKey];
                    return (
                      <div
                        key={tIdx}
                        className={`day-task-item ${isDone ? 'task-done' : ''}`}
                        onClick={() => toggleTask(taskKey)}
                      >
                        <div className="task-checkbox">
                          {isDone && <Check size={14} color="white" />}
                        </div>
                        <span className="task-text">{task}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <p className="text-muted">Could not load study plan.</p>
      )}
    </div>
  );
}
