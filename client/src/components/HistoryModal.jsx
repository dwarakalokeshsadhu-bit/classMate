import React, { useState } from 'react';
import {
  Clock, Search, Trash2, ArrowRight, BookOpen, Layers,
  CheckSquare, X, Sparkles, Folder, Calendar, FileText,
  AlertCircle, Check
} from 'lucide-react';

export default function HistoryModal({
  historyItems = [],
  onClose,
  onRestoreSession,
  onDeleteHistoryItem,
  currentSubject
}) {
  const [searchFilter, setSearchFilter] = useState('');
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  // Format creation date nicely
  const formatDate = (dateString) => {
    try {
      const d = new Date(dateString);
      if (isNaN(d.getTime())) return 'Recently';
      return d.toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      return 'Recently';
    }
  };

  const filteredItems = historyItems.filter((item) => {
    if (!searchFilter.trim()) return true;
    const q = searchFilter.toLowerCase();
    const titleMatch = item.title?.toLowerCase().includes(q);
    const subjectMatch = item.subject?.toLowerCase().includes(q);
    const notesMatch = item.rawNotes?.toLowerCase().includes(q);
    const summaryMatch = item.studyData?.summary?.toLowerCase().includes(q);
    return titleMatch || subjectMatch || notesMatch || summaryMatch;
  });

  return (
    <div className="history-modal-backdrop" onClick={onClose}>
      <div className="history-modal-card" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="history-modal-header">
          <div className="history-header-info">
            <div className="history-icon-badge">
              <Clock size={20} color="#96A78D" />
            </div>
            <div>
              <h3>Generated Notes History</h3>
              <p>Browse and restore past revision decks, summaries & study sets</p>
            </div>
          </div>
          <button
            type="button"
            className="history-close-btn"
            onClick={onClose}
            title="Close history modal"
          >
            <X size={18} />
          </button>
        </div>

        {/* Search & Filter Bar */}
        <div className="history-search-bar-wrap">
          <Search size={15} className="history-search-icon" />
          <input
            type="text"
            className="history-search-input"
            placeholder="Search saved notes, subjects, or concepts..."
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
          />
          {searchFilter && (
            <button
              type="button"
              className="history-search-clear"
              onClick={() => setSearchFilter('')}
            >
              &times;
            </button>
          )}
        </div>

        {/* Items List */}
        <div className="history-list-viewport">
          {filteredItems.length === 0 ? (
            <div className="history-empty-state">
              <div className="history-empty-icon">
                <FileText size={32} color="#96A78D" />
              </div>
              <h4>{searchFilter ? 'No matching note sessions found' : 'No generated notes history yet'}</h4>
              <p>
                {searchFilter
                  ? 'Try searching for a different keyword or subject.'
                  : 'Whenever you generate study notes, summaries, or flashcards, they will automatically be preserved here so you can revisit them anytime.'}
              </p>
            </div>
          ) : (
            <div className="history-items-grid">
              {filteredItems.map((item) => {
                const flashcardsCount = item.flashcardsCount ?? (item.studyData?.flashcards?.length || 0);
                const quizCount = item.quizCount ?? (item.studyData?.quiz?.length || 0);
                const summaryText = item.studyData?.summary || item.rawNotes?.slice(0, 140) + '...';

                return (
                  <div key={item._id || item.id || item.createdAt} className="history-card-item">
                    <div className="history-card-header">
                      <div className="history-card-badges">
                        <span className="history-subject-badge">
                          <Folder size={12} />
                          {item.subject || 'General'}
                        </span>
                        <span className="history-date-badge">
                          <Calendar size={11} />
                          {formatDate(item.createdAt)}
                        </span>
                      </div>

                      <div className="history-actions-top">
                        {deleteConfirmId === (item._id || item.id) ? (
                          <div className="history-confirm-delete-box">
                            <span style={{ fontSize: '0.72rem', color: '#ef4444' }}>Delete?</span>
                            <button
                              type="button"
                              className="history-del-confirm-btn"
                              onClick={() => {
                                onDeleteHistoryItem(item._id || item.id);
                                setDeleteConfirmId(null);
                              }}
                              title="Confirm delete"
                            >
                              <Check size={13} />
                            </button>
                            <button
                              type="button"
                              className="history-del-cancel-btn"
                              onClick={() => setDeleteConfirmId(null)}
                              title="Cancel"
                            >
                              <X size={13} />
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            className="history-card-del-btn"
                            onClick={() => setDeleteConfirmId(item._id || item.id)}
                            title="Delete this notes session from history"
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                    </div>

                    <h4 className="history-card-title">{item.title || 'Class Lecture Notes'}</h4>

                    <p className="history-card-summary">
                      {summaryText}
                    </p>

                    <div className="history-card-footer">
                      <div className="history-stats-pills">
                        {flashcardsCount > 0 && (
                          <span className="history-pill" title={`${flashcardsCount} flashcards`}>
                            <Layers size={11} /> {flashcardsCount} Cards
                          </span>
                        )}
                        {quizCount > 0 && (
                          <span className="history-pill" title={`${quizCount} quiz questions`}>
                            <CheckSquare size={11} /> {quizCount} Qs
                          </span>
                        )}
                        <span className="history-pill" style={{ color: '#96A78D' }}>
                          <Sparkles size={11} /> AI Deck
                        </span>
                      </div>

                      <button
                        type="button"
                        className="history-restore-btn"
                        onClick={() => {
                          onRestoreSession(item);
                          onClose();
                        }}
                        title="Load this notes session into the study workspace"
                      >
                        <span>Open Deck</span>
                        <ArrowRight size={13} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer summary */}
        <div className="history-modal-footer">
          <span style={{ fontSize: '0.78rem', color: '#8fa092' }}>
            Showing {filteredItems.length} of {historyItems.length} recorded study sets
          </span>
          <button type="button" className="history-footer-close" onClick={onClose}>
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
