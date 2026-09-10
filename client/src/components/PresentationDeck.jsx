import React, { useState } from 'react';
import {
  Presentation, ChevronLeft, ChevronRight, Copy, Check,
  Download, Sparkles, Layers
} from 'lucide-react';

export default function PresentationDeck({ slides = [], topicTitle = 'Topic' }) {
  const [activeSlideIdx, setActiveSlideIdx] = useState(0);
  const [copied, setCopied] = useState(false);

  if (!slides || slides.length === 0) {
    return <p className="text-muted">No presentation slides generated for this topic.</p>;
  }

  const currentSlide = slides[activeSlideIdx] || slides[0];

  const handleCopySlide = () => {
    const text = `Slide ${currentSlide.slideNumber}: ${currentSlide.title}\n\n` +
      currentSlide.bullets.map(b => `• ${b}`).join('\n') +
      `\n\nKey Takeaway: ${currentSlide.takeaway}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyAllSlides = () => {
    const fullDeck = slides.map(s => (
      `=== Slide ${s.slideNumber}: ${s.title} ===\n` +
      s.bullets.map(b => `• ${b}`).join('\n') +
      `\nKey Takeaway: ${s.takeaway}\n`
    )).join('\n\n');

    navigator.clipboard.writeText(fullDeck);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="presentation-deck-container">
      {/* Top Deck Controls */}
      <div className="deck-header-bar">
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <Presentation size={18} color="#4f46e5" />
          <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>Notes → Presentation Summary</span>
          <span className="tab-count">{slides.length} Slides</span>
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <button
            type="button"
            className="btn-secondary"
            style={{ padding: '6px 12px', fontSize: '0.8rem' }}
            onClick={handleCopySlide}
          >
            {copied ? <Check size={14} color="#10b981" /> : <Copy size={14} />}
            {copied ? 'Copied Slide!' : 'Copy Current Slide'}
          </button>

          <button
            type="button"
            className="btn-secondary"
            style={{ padding: '6px 12px', fontSize: '0.8rem' }}
            onClick={handleCopyAllSlides}
          >
            <Download size={14} /> Copy Full Deck
          </button>
        </div>
      </div>

      {/* Main Slide Card */}
      <div className="slide-card">
        <div className="slide-header">
          <span className="slide-number">Slide {activeSlideIdx + 1} of {slides.length}</span>
          <span className="slide-topic">{topicTitle}</span>
        </div>

        <h3 className="slide-title">{currentSlide.title}</h3>

        <ul className="slide-bullets">
          {currentSlide.bullets.map((b, idx) => (
            <li key={idx}>{b}</li>
          ))}
        </ul>

        <div className="slide-takeaway-box">
          <strong>💡 Executive Takeaway:</strong>
          <p>{currentSlide.takeaway}</p>
        </div>
      </div>

      {/* Slide Navigation */}
      <div className="deck-nav" style={{ marginTop: 18 }}>
        <button
          type="button"
          className="btn-secondary"
          onClick={() => setActiveSlideIdx(prev => Math.max(0, prev - 1))}
          disabled={activeSlideIdx === 0}
        >
          <ChevronLeft size={18} /> Previous Slide
        </button>

        {/* Slide dots */}
        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          {slides.map((_, idx) => (
            <button
              key={idx}
              type="button"
              className={`slide-dot ${activeSlideIdx === idx ? 'active' : ''}`}
              onClick={() => setActiveSlideIdx(idx)}
              title={`Jump to Slide ${idx + 1}`}
            />
          ))}
        </div>

        <button
          type="button"
          className="btn-secondary"
          onClick={() => setActiveSlideIdx(prev => Math.min(slides.length - 1, prev + 1))}
          disabled={activeSlideIdx === slides.length - 1}
        >
          Next Slide <ChevronRight size={18} />
        </button>
      </div>
    </div>
  );
}
