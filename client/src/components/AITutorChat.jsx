import React, { useState, useRef, useEffect } from 'react';
import {
  Send, Bot, User, Sparkles, Mic, MicOff, Globe, BookOpen,
  Code, AlertTriangle, Lightbulb, Compass, Loader2, HelpCircle
} from 'lucide-react';

const TUTOR_MODES = [
  { id: 'default', label: 'Tutor Chat', icon: Bot, desc: 'Interactive Q&A' },
  { id: 'simple', label: 'Explain Simply (ELI5)', icon: Sparkles, desc: 'Child-friendly analogies' },
  { id: 'detailed', label: 'Deep Professor', icon: BookOpen, desc: 'Rigorous academic depth' },
  { id: 'examples', label: 'Real-World Examples', icon: Lightbulb, desc: 'Practical scenarios' },
  { id: 'common_mistakes', label: 'Common Pitfalls', icon: AlertTriangle, desc: 'Exam traps to avoid' },
  { id: 'source', label: 'Source Grounding', icon: Compass, desc: 'Strict citations from uploaded notes' },
  { id: 'follow_up', label: 'Follow-Up Drill', icon: HelpCircle, desc: 'Probing conceptual follow-ups' },
  { id: 'diagram', label: 'Concept Diagram', icon: Code, desc: 'ASCII / Flowchart architecture' }
];

const LANGUAGES = [
  'English',
  'Hindi',
  'Spanish',
  'French',
  'German',
  'Telugu',
  'Tamil',
  'Mandarin',
  'Japanese'
];

export default function AITutorChat({ notes = '', topicTitle = 'Topic' }) {
  const [messages, setMessages] = useState([
    {
      sender: 'bot',
      text: `👋 Hello! I am your **Class Mate AI Tutor** for **${topicTitle}**.\n\nI can explain confusing definitions, give simple analogies, highlight common exam traps, quote directly from your notes, or draw architectural diagrams grounded strictly in your uploaded notes.\n\nWhat would you like help with?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      followUps: [
        'Can you explain this simply with an everyday analogy?',
        'What is a common trap question examiners ask on this topic?',
        'Show an architecture diagram of this concept.'
      ]
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [currentMode, setCurrentMode] = useState('default');
  const [currentLang, setCurrentLang] = useState('English');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);

  const messagesEndRef = useRef(null);
  const speechRecognizerRef = useRef(null);

  // Auto scroll chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Speech Recognition for voice questions
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognizer = new SpeechRecognition();
      recognizer.continuous = false;
      recognizer.interimResults = false;
      recognizer.lang = 'en-US';

      recognizer.onresult = (event) => {
        const voiceText = event.results[0][0].transcript;
        if (voiceText) {
          setInputText(voiceText);
        }
        setIsListening(false);
      };

      recognizer.onerror = () => setIsListening(false);
      recognizer.onend = () => setIsListening(false);

      speechRecognizerRef.current = recognizer;
    }
  }, []);

  const toggleVoice = () => {
    if (!speechRecognizerRef.current) {
      // Demo voice simulation when browser speech API is blocked or unavailable
      const sampleQueries = [
        'How does address translation work with paging?',
        'What is the difference between a page and a frame?',
        'Why does a page fault cause an interrupt?'
      ];
      const randomQuery = sampleQueries[Math.floor(Math.random() * sampleQueries.length)];
      setInputText(randomQuery);
      return;
    }

    if (isListening) {
      speechRecognizerRef.current.stop();
      setIsListening(false);
    } else {
      try {
        speechRecognizerRef.current.start();
        setIsListening(true);
      } catch (e) {
        setIsListening(false);
      }
    }
  };

  const handleSendMessage = async (textToSend = inputText, modeOverride = currentMode) => {
    const query = textToSend.trim();
    if (!query || isLoading) return;

    const userMsg = {
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/generate/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          notes,
          message: query,
          mode: modeOverride,
          language: currentLang,
          history: messages.slice(-4)
        })
      });

      const json = await res.json();
      const botReply = json.success && json.response
        ? json.response
        : 'I could not generate a response. Please verify your connection.';

      // Generate dynamic follow-up options
      const dynamicFollowUps = [
        `Explain "${query.slice(0, 30)}" simply (ELI5)`,
        `What is the most common exam trap about this?`,
        `Give a real-world software example of this.`
      ];

      setMessages(prev => [
        ...prev,
        {
          sender: 'bot',
          text: botReply,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          followUps: dynamicFollowUps
        }
      ]);
    } catch (err) {
      setMessages(prev => [
        ...prev,
        {
          sender: 'bot',
          text: `⚠️ Connection error: ${err.message}`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // Quick suggestion prompts
  const quickPrompts = [
    { label: 'Explain Simply (ELI5)', mode: 'simple', query: 'Can you explain this core concept simply with an everyday analogy?' },
    { label: 'Real-World Example', mode: 'examples', query: 'What is a real-world engineering or practical application of this?' },
    { label: 'Common Exam Traps', mode: 'common_mistakes', query: 'What common mistakes do students make on this topic during exams?' },
    { label: 'Source Grounding', mode: 'source', query: 'What does my uploaded lecture specifically say about this mechanism?' },
    { label: 'Draw Diagram', mode: 'diagram', query: 'Generate an architectural ASCII/flowchart diagram of how this works.' }
  ];

  return (
    <div className="ai-tutor-container">
      {/* Top Toolbar: Mode selectors & Language */}
      <div className="tutor-controls-bar">
        <div className="tutor-modes-scroll">
          {TUTOR_MODES.map((m) => {
            const Icon = m.icon;
            const isActive = currentMode === m.id;
            return (
              <button
                key={m.id}
                type="button"
                className={`tutor-mode-chip ${isActive ? 'active' : ''}`}
                onClick={() => setCurrentMode(m.id)}
                title={m.desc}
              >
                <Icon size={14} />
                <span>{m.label}</span>
              </button>
            );
          })}
        </div>

        {/* Multilingual Selector */}
        <div className="lang-selector-group">
          <Globe size={15} color="#4f46e5" />
          <select
            className="lang-select"
            value={currentLang}
            onChange={(e) => setCurrentLang(e.target.value)}
            title="Translate tutor explanations into other languages"
          >
            {LANGUAGES.map((lang) => (
              <option key={lang} value={lang}>{lang}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Suggested Quick Prompt Pills */}
      <div className="quick-prompts-bar">
        <span style={{ fontSize: '0.78rem', fontWeight: 600, color: '#64748b' }}>Quick Ask:</span>
        {quickPrompts.map((p, idx) => (
          <button
            key={idx}
            type="button"
            className="quick-prompt-pill"
            onClick={() => handleSendMessage(p.query, p.mode)}
            disabled={isLoading}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Chat Messages Log */}
      <div className="tutor-messages-box">
        {messages.map((m, idx) => (
          <div
            key={idx}
            className={`tutor-msg-row ${m.sender === 'user' ? 'msg-user-row' : 'msg-bot-row'}`}
          >
            <div className={`msg-avatar ${m.sender === 'user' ? 'avatar-user' : 'avatar-bot'}`}>
              {m.sender === 'user' ? <User size={16} /> : <Bot size={16} />}
            </div>

            <div className={`msg-bubble ${m.sender === 'user' ? 'bubble-user' : 'bubble-bot'}`}>
              <div className="msg-text" style={{ whiteSpace: 'pre-wrap' }}>{m.text}</div>
              <span className="msg-time">{m.timestamp}</span>

              {/* Interactive Follow-Up Questions below bot answers */}
              {m.sender === 'bot' && m.followUps && m.followUps.length > 0 && (
                <div style={{ marginTop: 10, paddingTop: 8, borderTop: '1px solid rgba(0,0,0,0.06)' }}>
                  <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#6366f1', marginBottom: 4 }}>
                    Probing Follow-Up Questions:
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    {m.followUps.map((fu, fuIdx) => (
                      <button
                        key={fuIdx}
                        type="button"
                        className="quick-prompt-pill"
                        style={{ fontSize: '0.74rem', textAlign: 'left', width: 'fit-content' }}
                        onClick={() => handleSendMessage(fu)}
                        disabled={isLoading}
                      >
                        👉 {fu}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="tutor-msg-row msg-bot-row">
            <div className="msg-avatar avatar-bot">
              <Bot size={16} />
            </div>
            <div className="msg-bubble bubble-bot" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Loader2 size={16} className="spinner" />
              <span>Class Mate is analyzing your lecture notes...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Message Input Box */}
      <form
        className="tutor-input-form"
        onSubmit={(e) => {
          e.preventDefault();
          handleSendMessage();
        }}
      >
        <button
          type="button"
          className={`btn-voice ${isListening ? 'voice-active' : ''}`}
          onClick={toggleVoice}
          title={isListening ? 'Listening... click to stop' : 'Ask question by voice (Speech-to-Text)'}
        >
          {isListening ? <MicOff size={18} color="#ef4444" /> : <Mic size={18} />}
        </button>

        <input
          type="text"
          className="tutor-text-input"
          placeholder={`Ask about ${topicTitle}, request ELI5, or ask exam traps...`}
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          disabled={isLoading}
        />

        <button
          type="submit"
          className="btn-primary tutor-send-btn"
          disabled={!inputText.trim() || isLoading}
        >
          <Send size={16} />
        </button>
      </form>
    </div>
  );
}
