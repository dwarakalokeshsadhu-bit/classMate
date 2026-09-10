import React, { useState, useRef, useEffect } from 'react';
import {
  MessageSquare, Send, Bot, User, Sparkles, Minus,
  Maximize2, X, Mic, MicOff, Loader2, Lightbulb
} from 'lucide-react';

export default function FloatingTutorWidget({
  notes,
  studyData,
  onOpenFullTutor
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      text: 'Hello! I am your Class Mate AI Tutor. What would you like me to guide you through?'
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const handleSendPrompt = async (promptText, mode = 'default') => {
    const textToSend = promptText || input;
    if (!textToSend.trim() || isLoading) return;

    const newMessages = [...messages, { role: 'user', text: textToSend.trim() }];
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/generate/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          notes: notes || 'General academic study concepts and active recall methods.',
          userMessage: textToSend.trim(),
          history: newMessages.slice(-6),
          mode,
          language: 'English'
        })
      });

      const json = await res.json();
      if (json.success && json.reply) {
        setMessages((prev) => [...prev, { role: 'assistant', text: json.reply }]);
      } else {
        throw new Error(json.error || 'Failed to get response from AI tutor.');
      }
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', text: '⚠️ Connection notice: ' + err.message }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const quickPrompts = [
    { label: 'Continue learning: Core Concepts', mode: 'default' },
    { label: 'Explain simply (ELI5 Mode)', mode: 'simple' },
    { label: 'Common exam pitfalls & traps', mode: 'common_mistakes' },
    { label: 'Draw concept diagram', mode: 'diagram' }
  ];

  if (!isOpen) {
    return (
      <div
        className="floating-tutor-dock minimized cursor-pointer hover:shadow-xl"
        onClick={() => setIsOpen(true)}
        style={{
          background: 'var(--sidebar-bg)',
          color: '#ffffff',
          padding: '10px 18px',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          cursor: 'pointer',
          border: '1px solid var(--sidebar-border)'
        }}
        title="Open AI Study Tutor"
      >
        <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--primary)', display: 'inline-block' }} />
        <Bot size={18} color="var(--primary)" />
        <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Chat with AI Tutor</span>
      </div>
    );
  }

  return (
    <div className="floating-tutor-dock">
      {/* Header */}
      <div className="tutor-dock-header" onClick={() => setIsOpen(false)}>
        <div className="tutor-dock-title">
          <Bot size={18} color="var(--primary)" />
          <span>Class Mate Tutor</span>
        </div>
        <div className="tutor-dock-controls" onClick={(e) => e.stopPropagation()}>
          {onOpenFullTutor && (
            <button
              type="button"
              className="tutor-dock-icon-btn"
              onClick={() => {
                setIsOpen(false);
                onOpenFullTutor();
              }}
              title="Open full tutor tab"
            >
              <Maximize2 size={14} />
            </button>
          )}
          <button
            type="button"
            className="tutor-dock-icon-btn"
            onClick={() => setIsOpen(false)}
            title="Minimize"
          >
            <Minus size={15} />
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="tutor-dock-body">
        {/* Quick Suggestions Banner */}
        <div className="tutor-dock-quick-suggestions">
          <div className="quick-suggestion-title">Quick Study Prompts</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
            {quickPrompts.map((p, idx) => (
              <button
                key={idx}
                type="button"
                className="quick-chip-btn"
                onClick={() => handleSendPrompt(p.label, p.mode)}
                disabled={isLoading}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Message Feed */}
        <div className="tutor-dock-messages">
          {messages.map((m, idx) => (
            <div
              key={idx}
              style={{
                display: 'flex',
                gap: 8,
                alignItems: 'flex-start',
                flexDirection: m.role === 'user' ? 'row-reverse' : 'row'
              }}
            >
              <div
                style={{
                  width: 26,
                  height: 26,
                  borderRadius: '50%',
                  background: m.role === 'user' ? 'var(--primary)' : '#18201B',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.75rem',
                  flexShrink: 0
                }}
              >
                {m.role === 'user' ? <User size={13} /> : <Bot size={13} />}
              </div>

              <div
                style={{
                  background: m.role === 'user' ? 'var(--primary-light)' : '#ffffff',
                  color: 'var(--text-main)',
                  border: '1px solid var(--border)',
                  padding: '8px 12px',
                  borderRadius: 12,
                  fontSize: '0.8rem',
                  lineHeight: 1.5,
                  maxWidth: '82%',
                  whiteSpace: 'pre-wrap',
                  boxShadow: 'var(--shadow-sm)'
                }}
              >
                {m.text}
              </div>
            </div>
          ))}

          {isLoading && (
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              <Loader2 size={15} className="spinner" />
              <span>Class Mate AI is thinking...</span>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <form
          className="tutor-dock-input-bar"
          onSubmit={(e) => {
            e.preventDefault();
            handleSendPrompt();
          }}
        >
          <input
            type="text"
            className="tutor-dock-input"
            placeholder="Ask a question about your notes..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isLoading}
          />
          <button
            type="submit"
            className="top-btn top-btn-primary"
            style={{ padding: '7px 12px' }}
            disabled={isLoading || !input.trim()}
          >
            <Send size={13} />
          </button>
        </form>
      </div>
    </div>
  );
}
