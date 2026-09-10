import React, { useState, useEffect } from 'react';
import {
  ChevronLeft, ChevronRight, RotateCw, Volume2, CheckCircle2,
  AlertTriangle, Clock, Shuffle, Filter, Award
} from 'lucide-react';

export default function FlashcardDeck({ flashcards = [], subjectTitle = 'Class Notes' }) {
  const [cards, setCards] = useState(flashcards);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [difficultyFilter, setDifficultyFilter] = useState('all');
  const [masteryLevels, setMasteryLevels] = useState({}); // { [cardId]: 'again'|'hard'|'good'|'easy' }

  // Load saved Spaced Repetition mastery from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('pm_srs_mastery');
      if (saved) setMasteryLevels(JSON.parse(saved));
    } catch (e) {}
  }, []);

  // Update cards when props change
  useEffect(() => {
    if (flashcards && flashcards.length > 0) {
      setCards(flashcards);
      setCurrentIndex(0);
      setIsFlipped(false);
    }
  }, [flashcards]);

  // Reset flip state on index change
  useEffect(() => {
    setIsFlipped(false);
  }, [currentIndex]);

  // Filter cards based on selected difficulty
  const filteredCards = cards.filter((card) => {
    if (difficultyFilter === 'all') return true;
    return (card.difficulty || 'medium') === difficultyFilter;
  });

  if (!cards || cards.length === 0) {
    return <p className="text-muted">No flashcards generated for this session.</p>;
  }

  const effectiveIndex = Math.min(currentIndex, Math.max(0, filteredCards.length - 1));
  const currentCard = filteredCards[effectiveIndex] || cards[0];

  const handleNext = () => {
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev + 1) % filteredCards.length);
  };

  const handlePrev = () => {
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev - 1 + filteredCards.length) % filteredCards.length);
  };

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  // Text to speech
  const handleSpeak = (e, text) => {
    e.stopPropagation();
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.0;
      window.speechSynthesis.speak(utterance);
    }
  };

  // Spaced repetition rating
  const handleRateCard = (rating) => {
    const cardId = currentCard.id || `card-${effectiveIndex}`;
    setMasteryLevels((prev) => {
      const updated = {
        ...prev,
        [cardId]: rating
      };
      try {
        localStorage.setItem('pm_srs_mastery', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });

    // Auto advance to next card
    setTimeout(() => {
      handleNext();
    }, 250);
  };

  // Shuffle deck
  const handleShuffle = () => {
    const shuffled = [...cards].sort(() => Math.random() - 0.5);
    setCards(shuffled);
    setCurrentIndex(0);
    setIsFlipped(false);
  };

  const currentMastery = masteryLevels[currentCard?.id || `card-${effectiveIndex}`];
  const masteredCount = Object.values(masteryLevels).filter(v => v === 'good' || v === 'easy').length;

  return (
    <div className="flashcards-view">
      {/* Top Deck Controls */}
      <div className="deck-header-bar">
        <div className="deck-filter-group">
          <Filter size={15} color="#64748b" />
          <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#64748b' }}>Filter:</span>
          {['all', 'easy', 'medium', 'hard'].map((diff) => (
            <button
              key={diff}
              type="button"
              className={`filter-chip ${difficultyFilter === diff ? 'active' : ''}`}
              onClick={() => {
                setDifficultyFilter(diff);
                setCurrentIndex(0);
              }}
            >
              {diff.toUpperCase()}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <span className="mastery-counter" title="Cards rated Good or Easy">
            <Award size={14} color="#10b981" /> {masteredCount}/{cards.length} Mastered
          </span>
          <button
            type="button"
            className="btn-secondary"
            style={{ padding: '5px 12px', fontSize: '0.8rem' }}
            onClick={handleShuffle}
            title="Shuffle deck cards"
          >
            <Shuffle size={13} /> Shuffle
          </button>
        </div>
      </div>

      {/* 3D Flip Card Container */}
      <div
        className="flashcard-wrapper"
        onClick={handleFlip}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === ' ' || e.key === 'Enter') {
            e.preventDefault();
            handleFlip();
          } else if (e.key === 'ArrowRight') {
            handleNext();
          } else if (e.key === 'ArrowLeft') {
            handlePrev();
          }
        }}
      >
        <div className={`flashcard-inner ${isFlipped ? 'flipped' : ''}`}>
          {/* Card Front */}
          <div className="flashcard-face flashcard-front">
            <div className="card-top-row">
              <span className="flashcard-label">
                {currentCard.topic || subjectTitle} &bull; Card {effectiveIndex + 1} of {filteredCards.length}
              </span>
              <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                <span className={`diff-tag diff-${currentCard.difficulty || 'medium'}`}>
                  {currentCard.difficulty || 'medium'}
                </span>
                <button
                  type="button"
                  className="btn-speak"
                  title="Read question aloud"
                  onClick={(e) => handleSpeak(e, currentCard.question)}
                >
                  <Volume2 size={16} />
                </button>
              </div>
            </div>

            <div className="flashcard-content">
              {currentCard.question}
            </div>

            <div className="flashcard-hint">
              <RotateCw size={14} /> Click card or press Space to reveal answer
            </div>
          </div>

          {/* Card Back */}
          <div className="flashcard-face flashcard-back">
            <div className="card-top-row">
              <span className="flashcard-label">Active Recall Answer</span>
              <button
                type="button"
                className="btn-speak btn-speak-white"
                title="Read answer aloud"
                onClick={(e) => handleSpeak(e, currentCard.answer)}
              >
                <Volume2 size={16} />
              </button>
            </div>

            <div className="flashcard-content">
              {currentCard.answer}
            </div>

            <div className="flashcard-hint">
              <RotateCw size={14} /> Click to flip back
            </div>
          </div>
        </div>
      </div>

      {/* Spaced Repetition Rating Buttons */}
      <div className="spaced-rep-box">
        <span className="spaced-rep-title">
          <Clock size={14} /> Rate Your Recall Ease (Spaced Repetition Schedule):
        </span>
        <div className="spaced-rep-buttons">
          <button
            type="button"
            className={`srs-btn srs-again ${currentMastery === 'again' ? 'active' : ''}`}
            onClick={() => handleRateCard('again')}
            title="Reset interval (1 day)"
          >
            <span>🔄 Again</span>
            <small>&lt; 1 Day</small>
          </button>
          <button
            type="button"
            className={`srs-btn srs-hard ${currentMastery === 'hard' ? 'active' : ''}`}
            onClick={() => handleRateCard('hard')}
            title="Review in 2 days"
          >
            <span>⚠️ Hard</span>
            <small>2 Days</small>
          </button>
          <button
            type="button"
            className={`srs-btn srs-good ${currentMastery === 'good' ? 'active' : ''}`}
            onClick={() => handleRateCard('good')}
            title="Review in 4 days"
          >
            <span>👍 Good</span>
            <small>4 Days</small>
          </button>
          <button
            type="button"
            className={`srs-btn srs-easy ${currentMastery === 'easy' ? 'active' : ''}`}
            onClick={() => handleRateCard('easy')}
            title="Mastered (Review in 7 days)"
          >
            <span>⭐ Easy</span>
            <small>7 Days</small>
          </button>
        </div>
      </div>

      {/* Deck Navigation */}
      <div className="deck-nav">
        <button
          type="button"
          className="btn-secondary"
          onClick={handlePrev}
          disabled={filteredCards.length <= 1}
        >
          <ChevronLeft size={18} /> Previous
        </button>

        <span className="deck-counter">
          {effectiveIndex + 1} / {filteredCards.length}
        </span>

        <button
          type="button"
          className="btn-secondary"
          onClick={handleNext}
          disabled={filteredCards.length <= 1}
        >
          Next <ChevronRight size={18} />
        </button>
      </div>
    </div>
  );
}
