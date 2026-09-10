import React, { useState, useEffect } from 'react';
import {
  BookOpen, Sparkles, LogIn, UserPlus, ShieldCheck,
  CheckCircle, ArrowRight, BookMarked, Layers, CheckSquare,
  Bot, AlertCircle, ChevronDown, X, Calendar, Mic, FileText,
  MessageSquare, Radio, HelpCircle, GraduationCap, Video,
  Cpu, LayoutGrid, Gamepad2, Award, ExternalLink, Globe, Loader2
} from 'lucide-react';
import { apiUrl } from '../utils/api.js';

export default function AuthLandingPage({ onLogin }) {
  // Navigation & Dropdown State
  const [activeDropdown, setActiveDropdown] = useState(null); // 'features' | 'educators' | 'about' | null
  const [showAnnouncement, setShowAnnouncement] = useState(true);

  // Auth Modal State
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState('signin'); // 'signin' | 'signup'

  // Form Fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [branch, setBranch] = useState('Computer Science & Eng (CSE)');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Close dropdown on click outside
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (!e.target.closest('.nav-dropdown-wrapper')) {
        setActiveDropdown(null);
      }
    };
    document.addEventListener('click', handleOutsideClick);
    return () => document.removeEventListener('click', handleOutsideClick);
  }, []);

  const openAuth = (mode = 'signin') => {
    setAuthMode(mode);
    setError('');
    setIsAuthModalOpen(true);
  };

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (authMode === 'signup') {
      if (!name.trim()) {
        setError('Please enter your full name.');
        return;
      }
      if (!email.trim() || (!email.includes('@') && email.trim().length < 4)) {
        setError('Please enter a valid student email address.');
        return;
      }
      if (password.length < 4) {
        setError('Passcode must be at least 4 characters.');
        return;
      }

      setIsSubmitting(true);
      try {
        const response = await fetch(apiUrl('/api/auth/register'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            name: name.trim(),
            email: email.trim(),
            passcode: password,
            branch
          })
        });

        const data = await response.json();
        if (response.ok && data.success && data.user) {
          if (data.token) {
            try {
              localStorage.setItem('pm_token', data.token);
            } catch (e) {}
          }
          onLogin(data.user);
          return;
        } else {
          setError(data?.error || 'Registration failed. Please check your details.');
          return;
        }
      } catch (err) {
        console.error('Backend register request failed:', err);
        setError('Could not reach backend server. Please verify the server is running on port 5000.');
        return;
      } finally {
        setIsSubmitting(false);
      }
    } else {
      // Sign In
      if (!email.trim()) {
        setError('Please enter your student email or roll number.');
        return;
      }
      if (!password) {
        setError('Please enter your passcode.');
        return;
      }

      setIsSubmitting(true);
      try {
        const response = await fetch(apiUrl('/api/auth/login'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            email: email.trim(),
            passcode: password
          })
        });

        const data = await response.json();
        if (response.ok && data.success && data.user) {
          if (data.token) {
            try {
              localStorage.setItem('pm_token', data.token);
            } catch (e) {}
          }
          onLogin(data.user);
          return;
        } else {
          setError(data?.error || 'Invalid email or passcode. Please check your credentials.');
          return;
        }
      } catch (err) {
        console.error('Backend login request failed:', err);
        setError('Could not reach backend server. Please verify the server is running on port 5000.');
        return;
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  return (
    <div className="studyfetch-landing">
      {/* 1. Top Announcement Bar */}
      {showAnnouncement && (
        <div className="announcement-banner">
          <div className="announcement-content">
            <span className="announcement-tag">New</span>
            <span>Class Mate has a new look & enhanced AI study engine!</span>
            <a
              href="#features"
              className="announcement-link"
              onClick={(e) => {
                e.preventDefault();
                document.getElementById('features-section')?.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              Learn More ↗
            </a>
          </div>
          <button
            type="button"
            className="announcement-close"
            onClick={() => setShowAnnouncement(false)}
            aria-label="Dismiss announcement"
          >
            <X size={15} />
          </button>
        </div>
      )}

      {/* 2. Main Navigation Bar */}
      <header className="sf-navbar">
        <div className="sf-nav-container">
          {/* Brand Logo */}
          <div className="sf-brand-area">
            <button
              type="button"
              className="sf-brand-btn"
              onClick={() => {
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              title="Class Mate — Home"
            >
              <div className="sf-brand-icon">
                <img src="/logo.png" alt="Class Mate Logo" className="sf-brand-logo-img" />
              </div>
              <span className="sf-brand-name">Class Mate</span>
            </button>
          </div>

          {/* Center Dropdown Menus */}
          <nav className="sf-nav-links">
            {/* Features Dropdown */}
            <div className="nav-dropdown-wrapper">
              <button
                type="button"
                className={`nav-link-btn ${activeDropdown === 'features' ? 'active' : ''}`}
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveDropdown(activeDropdown === 'features' ? null : 'features');
                }}
              >
                <span>Features</span>
                <ChevronDown size={14} className={`chevron-icon ${activeDropdown === 'features' ? 'open' : ''}`} />
              </button>

              {/* Mega Menu Dropdown: Features (Image 2) */}
              {activeDropdown === 'features' && (
                <div className="mega-menu-dropdown features-mega-menu">
                  {/* Column 1: ORGANIZE */}
                  <div className="mega-menu-col">
                    <div className="mega-menu-col-header">ORGANIZE</div>
                    <div className="mega-menu-item" onClick={() => openAuth('signup')}>
                      <div className="menu-icon-box bg-purple-soft"><Calendar size={18} color="#7c3aed" /></div>
                      <div>
                        <div className="menu-item-title">Study Plan</div>
                        <div className="menu-item-desc">Build your personalized study schedule</div>
                      </div>
                    </div>

                    <div className="mega-menu-item" onClick={() => openAuth('signup')}>
                      <div className="menu-icon-box bg-amber-soft"><Mic size={18} color="#d97706" /></div>
                      <div>
                        <div className="menu-item-title">Record Lecture</div>
                        <div className="menu-item-desc">Capture and generate notes from audio</div>
                      </div>
                    </div>

                    <div className="mega-menu-item" onClick={() => openAuth('signup')}>
                      <div className="menu-icon-box bg-green-soft"><FileText size={18} color="#16a34a" /></div>
                      <div>
                        <div className="menu-item-title">Notes</div>
                        <div className="menu-item-desc">Enhance notes & material with AI</div>
                      </div>
                    </div>

                    <div className="mega-menu-item" onClick={() => openAuth('signup')}>
                      <div className="menu-icon-box bg-blue-soft"><Calendar size={18} color="#2563eb" /></div>
                      <div>
                        <div className="menu-item-title">Calendar</div>
                        <div className="menu-item-desc">Plan out your studying with exam countdown</div>
                      </div>
                    </div>
                  </div>

                  {/* Column 2: LEARN */}
                  <div className="mega-menu-col">
                    <div className="mega-menu-col-header">LEARN</div>
                    <div className="mega-menu-item" onClick={() => openAuth('signup')}>
                      <div className="menu-icon-box bg-purple-soft"><Bot size={18} color="#7c3aed" /></div>
                      <div>
                        <div className="menu-item-title">Tutor Me</div>
                        <div className="menu-item-desc">Get 1-on-1 help from your 24/7 AI Tutor</div>
                      </div>
                    </div>

                    <div className="mega-menu-item" onClick={() => openAuth('signup')}>
                      <div className="menu-icon-box bg-pink-soft"><MessageSquare size={18} color="#db2777" /></div>
                      <div>
                        <div className="menu-item-title">Text ClassMate</div>
                        <div className="menu-item-desc">Ask doubts directly from lecture slides</div>
                      </div>
                    </div>

                    <div className="mega-menu-item" onClick={() => openAuth('signup')}>
                      <div className="menu-icon-box bg-indigo-soft"><Sparkles size={18} color="#4f46e5" /></div>
                      <div>
                        <div className="menu-item-title">Visual Explanations</div>
                        <div className="menu-item-desc">See architectural & concept diagrams</div>
                      </div>
                    </div>

                    <div className="mega-menu-item" onClick={() => openAuth('signup')}>
                      <div className="menu-icon-box bg-rose-soft"><Radio size={18} color="#e11d48" /></div>
                      <div>
                        <div className="menu-item-title">Audio Recap</div>
                        <div className="menu-item-desc">Listen to quick podcast summaries</div>
                      </div>
                    </div>

                    <div className="mega-menu-item" onClick={() => openAuth('signup')}>
                      <div className="menu-icon-box bg-purple-soft"><Video size={18} color="#9333ea" /></div>
                      <div>
                        <div className="menu-item-title">60-Sec Rescue Summary</div>
                        <div className="menu-item-desc">High-yield core takeaways under 1 minute</div>
                      </div>
                    </div>
                  </div>

                  {/* Column 3: PRACTICE & TEST */}
                  <div className="mega-menu-col">
                    <div className="mega-menu-col-header">PRACTICE & TEST</div>
                    <div className="mega-menu-item" onClick={() => openAuth('signup')}>
                      <div className="menu-icon-box bg-emerald-soft"><Layers size={18} color="#059669" /></div>
                      <div>
                        <div className="menu-item-title">Flashcards</div>
                        <div className="menu-item-desc">Spaced repetition active recall cards</div>
                      </div>
                    </div>

                    <div className="mega-menu-item" onClick={() => openAuth('signup')}>
                      <div className="menu-icon-box bg-cyan-soft"><CheckSquare size={18} color="#0891b2" /></div>
                      <div>
                        <div className="menu-item-title">QuizMate</div>
                        <div className="menu-item-desc">Adaptive quizzes with instant scoring</div>
                      </div>
                    </div>

                    <div className="mega-menu-item" onClick={() => openAuth('signup')}>
                      <div className="menu-icon-box bg-lime-soft"><Gamepad2 size={18} color="#65a30d" /></div>
                      <div>
                        <div className="menu-item-title">Arcade Review</div>
                        <div className="menu-item-desc">Gamified questions to master tough concepts</div>
                      </div>
                    </div>

                    <div className="mega-menu-item" onClick={() => openAuth('signup')}>
                      <div className="menu-icon-box bg-teal-soft"><FileText size={18} color="#0d9488" /></div>
                      <div>
                        <div className="menu-item-title">Targeted Mistake Vault</div>
                        <div className="menu-item-desc">Bank incorrect answers for focused revision</div>
                      </div>
                    </div>

                    <div className="mega-menu-item" onClick={() => openAuth('signup')}>
                      <div className="menu-icon-box bg-sky-soft"><Award size={18} color="#0284c7" /></div>
                      <div>
                        <div className="menu-item-title">Weakness Detector</div>
                        <div className="menu-item-desc">Automated "What Should I Study Now?" action</div>
                      </div>
                    </div>
                  </div>

                  {/* Column 4: CUSTOMIZE */}
                  <div className="mega-menu-col">
                    <div className="mega-menu-col-header">CUSTOMIZE</div>
                    <div className="mega-menu-item" onClick={() => openAuth('signup')}>
                      <div className="menu-icon-box bg-slate-soft"><Cpu size={18} color="#475569" /></div>
                      <div>
                        <div className="menu-item-title">AI Subject Personas</div>
                        <div className="menu-item-desc">Shape the way Class Mate teaches you</div>
                      </div>
                    </div>

                    <div className="mega-menu-item" onClick={() => openAuth('signup')}>
                      <div className="menu-icon-box bg-slate-soft"><LayoutGrid size={18} color="#475569" /></div>
                      <div>
                        <div className="menu-item-title">
                          Study Apps <span className="badge-new">New</span>
                        </div>
                        <div className="menu-item-desc">Interactive decks, formulas & presentation slides</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Educators & Enterprise Dropdown */}
            <div className="nav-dropdown-wrapper">
              <button
                type="button"
                className={`nav-link-btn ${activeDropdown === 'educators' ? 'active' : ''}`}
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveDropdown(activeDropdown === 'educators' ? null : 'educators');
                }}
              >
                <span>Educators & Enterprise</span>
                <ChevronDown size={14} className={`chevron-icon ${activeDropdown === 'educators' ? 'open' : ''}`} />
              </button>

              {activeDropdown === 'educators' && (
                <div className="mega-menu-dropdown educators-dropdown">
                  <div className="mega-menu-item" onClick={() => openAuth('signup')}>
                    <div className="menu-icon-box bg-green-soft"><GraduationCap size={18} color="#16a34a" /></div>
                    <div>
                      <div className="menu-item-title">For Universities & Colleges</div>
                      <div className="menu-item-desc">Empower departments with automated study aids</div>
                    </div>
                  </div>
                  <div className="mega-menu-item" onClick={() => openAuth('signup')}>
                    <div className="menu-icon-box bg-blue-soft"><ShieldCheck size={18} color="#2563eb" /></div>
                    <div>
                      <div className="menu-item-title">Institutional Privacy</div>
                      <div className="menu-item-desc">Strict client-side and encrypted note parsing</div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* About Dropdown (Image 3) */}
            <div className="nav-dropdown-wrapper">
              <button
                type="button"
                className={`nav-link-btn ${activeDropdown === 'about' ? 'active' : ''}`}
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveDropdown(activeDropdown === 'about' ? null : 'about');
                }}
              >
                <span>About</span>
                <ChevronDown size={14} className={`chevron-icon ${activeDropdown === 'about' ? 'open' : ''}`} />
              </button>

              {/* Mega Menu Dropdown: About (Image 3) */}
              {activeDropdown === 'about' && (
                <div className="mega-menu-dropdown about-mega-menu">
                  <div className="about-top-header">
                    <div className="mega-menu-col-header">THE COMPANY</div>
                    <div className="about-company-box" onClick={() => openAuth('signup')}>
                      <div className="menu-icon-box bg-purple-soft">
                        <img src="/logo.png" alt="Class Mate" style={{ width: 22, height: 22, objectFit: 'contain' }} />
                      </div>
                      <div>
                        <div className="menu-item-title">About Class Mate</div>
                        <div className="menu-item-desc">How we started, what we believe, and where we are going.</div>
                      </div>
                    </div>
                  </div>

                  <div className="about-grid">
                    {/* Browse Col */}
                    <div className="about-browse-col">
                      <div className="mega-menu-col-header">BROWSE</div>
                      <div className="about-nav-item" onClick={() => openAuth('signup')}>
                        <span className="icon-wrap">📰</span>
                        <div>
                          <strong>Blog</strong>
                          <p>Product updates, stories, and study tips</p>
                        </div>
                      </div>
                      <div className="about-nav-item" onClick={() => openAuth('signup')}>
                        <span className="icon-wrap">📢</span>
                        <div>
                          <strong>Press</strong>
                          <p>Latest press coverage and announcements</p>
                        </div>
                      </div>
                      <div className="about-nav-item" onClick={() => openAuth('signup')}>
                        <span className="icon-wrap">🔬</span>
                        <div>
                          <strong>Research</strong>
                          <p>Our research on AI in active recall & education</p>
                        </div>
                      </div>
                    </div>

                    {/* Latest From Blog Cards */}
                    <div className="about-blog-col">
                      <div className="mega-menu-col-header">LATEST FROM THE BLOG</div>
                      <div className="blog-cards-row">
                        <div className="blog-card-preview" onClick={() => openAuth('signup')}>
                          <div className="blog-card-tag">Updates</div>
                          <h4>A New and Improved Study Calendar</h4>
                          <p>Upload your syllabus to auto-fill study intervals and exam countdowns.</p>
                        </div>

                        <div className="blog-card-preview" onClick={() => openAuth('signup')}>
                          <div className="blog-card-tag">Product</div>
                          <h4>Class Mate Has A New Look</h4>
                          <p>Super excited to introduce our new Sage Green study aesthetic.</p>
                        </div>

                        <div className="blog-card-preview" onClick={() => openAuth('signup')}>
                          <div className="blog-card-tag">Science</div>
                          <h4>Meet the Spaced Repetition Engine</h4>
                          <p>Every flashcard automatically adapts based on your confidence score.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </nav>

          {/* Right Action Buttons */}
          <div className="sf-nav-actions">
            <button
              type="button"
              className="sf-btn-text"
              onClick={() => openAuth('signin')}
            >
              Login
            </button>
            <button
              type="button"
              className="sf-btn-pill"
              onClick={() => openAuth('signup')}
            >
              Start for Free
            </button>
          </div>
        </div>
      </header>

      {/* 3. Hero Section (Image 1) */}
      <section className="sf-hero-section">
        <div className="sf-hero-inner">
          <div className="sf-hero-badge">
            <Sparkles size={14} color="var(--primary)" />
            <span>AI-Powered Revision & Study Companion</span>
          </div>

          <h1 className="sf-hero-headline">
            Learning that<br />
            <span>adapts to you</span>
          </h1>

          <p className="sf-hero-subheadline">
            Stop wasting hours reorganizing lecture shorthand. <strong>Class Mate</strong> instantly converts raw notes,
            PDFs, slides, or handwritten photos into <strong>60-second rescue summaries</strong>,
            <strong> spaced-repetition flashcards</strong>, and <strong>adaptive self-test quizzes</strong>.
          </p>

          <div className="sf-hero-cta-group">
            <button
              type="button"
              className="sf-btn-hero-cta"
              onClick={() => openAuth('signup')}
            >
              Try for free
            </button>
          </div>

          {/* Interactive Feature Pills */}
          <div className="sf-hero-chips">
            <div className="hero-chip" onClick={() => openAuth('signup')}>
              <BookOpen size={15} color="var(--primary-dark)" />
              <span>60-Sec Rescue Summary</span>
            </div>
            <div className="hero-chip" onClick={() => openAuth('signup')}>
              <Layers size={15} color="var(--primary-dark)" />
              <span>Spaced Repetition Flashcards</span>
            </div>
            <div className="hero-chip" onClick={() => openAuth('signup')}>
              <CheckSquare size={15} color="var(--primary-dark)" />
              <span>Adaptive Quiz & Mistake Vault</span>
            </div>
            <div className="hero-chip" onClick={() => openAuth('signup')}>
              <Bot size={15} color="var(--primary-dark)" />
              <span>24/7 Grounded AI Tutor</span>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Interactive Feature Showcase Section */}
      <section className="sf-showcase-section" id="features-section">
        <div className="sf-showcase-container">
          <div className="section-header">
            <span className="section-tag">Core Capabilities</span>
            <h2>Everything you need to excel this semester</h2>
            <p>Built specifically for college students balancing dense lectures and high-stakes exams.</p>
          </div>

          <div className="showcase-grid">
            <div className="showcase-card" onClick={() => openAuth('signup')}>
              <div className="showcase-icon-box"><BookOpen size={24} color="var(--primary-dark)" /></div>
              <h3>60-Second Rescue Summary</h3>
              <p>Condenses 50-page slide decks into high-yield exam takeaways for rapid review before class.</p>
              <span className="showcase-link">Explore Summaries &rarr;</span>
            </div>

            <div className="showcase-card" onClick={() => openAuth('signup')}>
              <div className="showcase-icon-box"><Layers size={24} color="var(--primary-dark)" /></div>
              <h3>Active Recall Flashcards</h3>
              <p>Interactive 3D cards with Leitner spaced repetition. Focuses on cards you struggle with.</p>
              <span className="showcase-link">Practice Flashcards &rarr;</span>
            </div>

            <div className="showcase-card" onClick={() => openAuth('signup')}>
              <div className="showcase-icon-box"><CheckSquare size={24} color="var(--primary-dark)" /></div>
              <h3>Adaptive Practice Quizzes</h3>
              <p>Instant scoring with targeted explanation. Automatically banks your mistakes for retries.</p>
              <span className="showcase-link">Take a Quiz &rarr;</span>
            </div>

            <div className="showcase-card" onClick={() => openAuth('signup')}>
              <div className="showcase-icon-box"><Bot size={24} color="var(--primary-dark)" /></div>
              <h3>Grounded AI Tutor</h3>
              <p>Personal 24/7 tutor that explains simply (ELI5), warns of exam traps, and quotes directly from notes.</p>
              <span className="showcase-link">Ask AI Tutor &rarr;</span>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Pre-Footer Call to Action (Image 4) */}
      <section className="prefooter-banner">
        <div className="prefooter-container">
          <div className="prefooter-text-col">
            <h2 className="prefooter-title">Ready to transform how you study?</h2>
            <p className="prefooter-subtitle">
              Get tips on studying smarter, mastering active recall, and acing your upcoming exams.
            </p>
            <div className="prefooter-actions">
              <button
                type="button"
                className="sf-btn-pill-light"
                onClick={() => openAuth('signup')}
              >
                Start for Free &rarr;
              </button>
              <button
                type="button"
                className="sf-btn-pill-outline"
                onClick={() => openAuth('signin')}
              >
                Login
              </button>
            </div>
          </div>

          <div className="prefooter-graphic-col">
            <div className="study-illustration-art">
              <div className="art-desk">
                <div className="art-laptop">
                  <div className="art-screen">
                    <span style={{ fontSize: '0.65rem', color: 'var(--primary)' }}>Class Mate AI</span>
                  </div>
                </div>
                <div className="art-notes">
                  <div className="art-line"></div>
                  <div className="art-line"></div>
                  <div className="art-line short"></div>
                </div>
              </div>
              <div className="art-badge">
                <span>E = mc²</span>
                <span>∫ f(x)dx</span>
                <span>O(log n)</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Comprehensive Multi-Column Footer (Image 5) */}
      <footer className="site-footer">
        <div className="site-footer-container">
          {/* Top Row: Brand & Socials */}
          <div className="footer-top-row">
            <div className="footer-brand-wrap">
              <div className="sf-brand-icon" style={{ width: 34, height: 34, padding: 3, background: '#ffffff' }}>
                <img src="/logo.png" alt="Class Mate" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
              </div>
              <span className="footer-brand-title">Class Mate</span>
            </div>

            <div className="footer-social-links">
              <a href="#instagram" className="social-link" title="Instagram" onClick={(e) => e.preventDefault()}>
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect width="20" height="20" x="2" y="2" rx="5" ry="5"></rect>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                  <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"></line>
                </svg>
              </a>
              <a href="#twitter" className="social-link" title="X (Twitter)" onClick={(e) => e.preventDefault()}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
              </a>
              <a href="#linkedin" className="social-link" title="LinkedIn" onClick={(e) => e.preventDefault()}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
                  <rect width="4" height="12" x="2" y="9"></rect>
                  <circle cx="4" cy="4" r="2"></circle>
                </svg>
              </a>
              <a href="#youtube" className="social-link" title="YouTube" onClick={(e) => e.preventDefault()}>
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17"></path>
                  <polygon points="10 15 15 12 10 9 10 15" fill="currentColor"></polygon>
                </svg>
              </a>
              <a href="#web" className="social-link" title="Web" onClick={(e) => e.preventDefault()}><Globe size={17} /></a>
            </div>
          </div>

          {/* 6 Column Sitemap Links (Image 5) */}
          <div className="footer-links-grid">
            {/* Col 1: Website */}
            <div className="footer-col">
              <h4>Website</h4>
              <ul>
                <li><a href="#home" onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>Home</a></li>
                <li><a href="#login" onClick={(e) => { e.preventDefault(); openAuth('signin'); }}>Login</a></li>
                <li><a href="#signup" onClick={(e) => { e.preventDefault(); openAuth('signup'); }}>Sign Up</a></li>
                <li><a href="#study-plan" onClick={(e) => { e.preventDefault(); openAuth('signup'); }}>Study Plan</a></li>
              </ul>
            </div>

            {/* Col 2: Company */}
            <div className="footer-col">
              <h4>Company</h4>
              <ul>
                <li><a href="#about" onClick={(e) => { e.preventDefault(); openAuth('signup'); }}>About</a></li>
                <li><a href="#blog" onClick={(e) => { e.preventDefault(); openAuth('signup'); }}>Blog</a></li>
                <li><a href="#faq" onClick={(e) => { e.preventDefault(); openAuth('signup'); }}>FAQ</a></li>
                <li><a href="#privacy" onClick={(e) => { e.preventDefault(); openAuth('signup'); }}>Privacy Policy</a></li>
                <li><a href="#terms" onClick={(e) => { e.preventDefault(); openAuth('signup'); }}>Terms of Service</a></li>
                <li><a href="#enterprise" onClick={(e) => { e.preventDefault(); openAuth('signup'); }}>Enterprise Terms</a></li>
                <li><a href="#status" onClick={(e) => { e.preventDefault(); openAuth('signup'); }}>Status</a></li>
              </ul>
            </div>

            {/* Col 3: Helpful */}
            <div className="footer-col">
              <h4>Helpful</h4>
              <ul>
                <li><a href="#email-support" onClick={(e) => { e.preventDefault(); alert('Email support: team@classmate.edu'); }}>Email Support</a></li>
                <li><a href="#feedback" onClick={(e) => { e.preventDefault(); alert('We appreciate your feedback!'); }}>Feedback</a></li>
                <li><a href="#question-bank" onClick={(e) => { e.preventDefault(); openAuth('signup'); }}>Question Bank</a></li>
                <li><a href="#documentation" onClick={(e) => { e.preventDefault(); openAuth('signup'); }}>Documentation</a></li>
                <li><a href="#creators" onClick={(e) => { e.preventDefault(); openAuth('signup'); }}>Creators</a></li>
              </ul>
            </div>

            {/* Col 4: Educators & Institutions */}
            <div className="footer-col">
              <h4>Educators & Institutions</h4>
              <ul>
                <li><a href="#for-teachers" onClick={(e) => { e.preventDefault(); openAuth('signup'); }}>For Teachers</a></li>
                <li><a href="#for-institutions" onClick={(e) => { e.preventDefault(); openAuth('signup'); }}>For Institutions</a></li>
                <li><a href="#our-mission" onClick={(e) => { e.preventDefault(); openAuth('signup'); }}>Our Mission</a></li>
                <li><a href="#our-principles" onClick={(e) => { e.preventDefault(); openAuth('signup'); }}>Our Principles</a></li>
                <li><a href="#for-parents" onClick={(e) => { e.preventDefault(); openAuth('signup'); }}>For Parents</a></li>
                <li><a href="#workforce" onClick={(e) => { e.preventDefault(); openAuth('signup'); }}>Accelerate the workforce</a></li>
              </ul>
            </div>

            {/* Col 5: Use Cases */}
            <div className="footer-col">
              <h4>Use Cases</h4>
              <ul>
                <li><a href="#study-tools" onClick={(e) => { e.preventDefault(); openAuth('signup'); }}>Study tools</a></li>
                <li><a href="#study-methods" onClick={(e) => { e.preventDefault(); openAuth('signup'); }}>Study methods</a></li>
                <li><a href="#how-to-study" onClick={(e) => { e.preventDefault(); openAuth('signup'); }}>How to study</a></li>
                <li><a href="#study-guide-maker" onClick={(e) => { e.preventDefault(); openAuth('signup'); }}>Study Guide Maker</a></li>
                <li><a href="#pdf-to-flashcards" onClick={(e) => { e.preventDefault(); openAuth('signup'); }}>PDF to Flashcards</a></li>
                <li><a href="#lecture-to-notes" onClick={(e) => { e.preventDefault(); openAuth('signup'); }}>Lecture to Notes</a></li>
                <li><a href="#practice-test-maker" onClick={(e) => { e.preventDefault(); openAuth('signup'); }}>Practice Test Maker</a></li>
              </ul>
            </div>

            {/* Col 6: Our Features */}
            <div className="footer-col">
              <h4>Our Features</h4>
              <ul>
                <li><a href="#notes-ai" onClick={(e) => { e.preventDefault(); openAuth('signup'); }}>Notes AI</a></li>
                <li><a href="#flashcards-ai" onClick={(e) => { e.preventDefault(); openAuth('signup'); }}>Flashcards AI</a></li>
                <li><a href="#ai-quizzes" onClick={(e) => { e.preventDefault(); openAuth('signup'); }}>AI Quizzes</a></li>
                <li><a href="#classmate-tutor" onClick={(e) => { e.preventDefault(); openAuth('signup'); }}>Tutor AI</a></li>
                <li><a href="#audio-recap" onClick={(e) => { e.preventDefault(); openAuth('signup'); }}>Audio Recap</a></li>
                <li><a href="#diagram-explainer" onClick={(e) => { e.preventDefault(); openAuth('signup'); }}>Diagram Explanations</a></li>
                <li><a href="#record-lecture" onClick={(e) => { e.preventDefault(); openAuth('signup'); }}>Record Live Lecture</a></li>
              </ul>
            </div>
          </div>

          {/* Bottom Copyright */}
          <div className="footer-bottom-bar">
            <p>&copy; 2026 Class Mate Inc. All rights reserved. &bull; Learning that adapts to you.</p>
          </div>
        </div>
      </footer>

      {/* 7. Authentication Modal (Sign In / Create Account) */}
      {isAuthModalOpen && (
        <div className="auth-modal-backdrop" onClick={() => setIsAuthModalOpen(false)}>
          <div className="auth-modal-card" onClick={(e) => e.stopPropagation()}>
            {/* Modal Header */}
            <div className="auth-modal-header">
              <div className="auth-brand-logo-small">
                <img src="/logo.png" alt="Class Mate" style={{ width: 28, height: 28, objectFit: 'contain' }} />
                <span style={{ fontWeight: 800, fontSize: '1.1rem' }}>Class Mate</span>
              </div>
              <button
                type="button"
                className="auth-modal-close"
                onClick={() => setIsAuthModalOpen(false)}
                title="Close"
              >
                <X size={18} />
              </button>
            </div>

            {/* Segmented Tab Switcher */}
            <div className="auth-tab-switch">
              <button
                type="button"
                className={`auth-tab-btn ${authMode === 'signin' ? 'active' : ''}`}
                onClick={() => { setAuthMode('signin'); setError(''); }}
              >
                <LogIn size={15} />
                <span>Sign In</span>
              </button>

              <button
                type="button"
                className={`auth-tab-btn ${authMode === 'signup' ? 'active' : ''}`}
                onClick={() => { setAuthMode('signup'); setError(''); }}
              >
                <UserPlus size={15} />
                <span>Create Account</span>
              </button>
            </div>

            {/* Error Message */}
            {error && (
              <div className="alert-error" style={{ marginBottom: 16, fontSize: '0.82rem', padding: '10px 12px' }}>
                <AlertCircle size={15} />
                <span>{error}</span>
              </div>
            )}

            {/* Secure Form with Anti-Autofill Protection */}
            <form
              onSubmit={handleAuthSubmit}
              className="auth-form"
              autoComplete="off"
              data-lpignore="true"
            >
              {/* Dummy hidden inputs to intercept browser heuristic autofill */}
              <input type="text" name="cm_autofill_decoy_user" style={{ display: 'none' }} tabIndex="-1" autoComplete="off" />
              <input type="password" name="cm_autofill_decoy_pass" style={{ display: 'none' }} tabIndex="-1" autoComplete="off" />

              {authMode === 'signup' && (
                <div className="auth-field-group">
                  <label className="auth-label">Full Name</label>
                  <input
                    type="text"
                    name="cm_student_name_field_unique"
                    className="auth-input"
                    placeholder="Enter your full name..."
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    autoComplete="off"
                    autoCorrect="off"
                    spellCheck="false"
                    data-lpignore="true"
                  />
                </div>
              )}

              <div className="auth-field-group">
                <label className="auth-label">Student Email / Roll Number</label>
                <input
                  type="text"
                  name="cm_student_identifier_field_unique"
                  className="auth-input"
                  placeholder="Enter student email or roll number..."
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="off"
                  autoCorrect="off"
                  autoCapitalize="none"
                  spellCheck="false"
                  data-lpignore="true"
                />
              </div>

              {authMode === 'signup' && (
                <div className="auth-field-group">
                  <label className="auth-label">Department / Branch</label>
                  <select
                    name="cm_student_branch_field_unique"
                    className="auth-input"
                    value={branch}
                    onChange={(e) => setBranch(e.target.value)}
                  >
                    <option value="Information Technology (IT)">Information Technology (IT)</option>
                    <option value="Computer Science & Eng (CSE)">Computer Science & Eng (CSE)</option>
                    <option value="Artificial Intelligence (AI/ML)">Artificial Intelligence (AI/ML)</option>
                    <option value="Electronics & Communication (ECE)">Electronics & Communication (ECE)</option>
                    <option value="Mechanical / Civil Engineering">Mechanical / Civil Engineering</option>
                  </select>
                </div>
              )}

              <div className="auth-field-group">
                <label className="auth-label">Passcode / Password</label>
                <input
                  type="password"
                  name="cm_student_secret_pass_unique"
                  className="auth-input"
                  placeholder="Enter your 4+ digit student passcode..."
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="new-password"
                  data-lpignore="true"
                  required
                />
              </div>

              <button
                type="submit"
                className="btn-primary"
                style={{ marginTop: 8 }}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={18} className="spinner" />
                    <span>Connecting...</span>
                  </>
                ) : (
                  <>
                    {authMode === 'signin' ? <LogIn size={18} /> : <UserPlus size={18} />}
                    <span>{authMode === 'signin' ? 'Sign In to Class Mate' : 'Create Student Account'}</span>
                  </>
                )}
              </button>
            </form>

            <p className="auth-footer-hint" style={{ marginTop: 18 }}>
              🔒 Protected client session. Data stays locally within your browser.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
