# 🎯 Pocket Mentor — Hackathon Pitch Deck & Slide Outline

> **AU.28 Hackathon-01 | Team 07**  
> **Topic**: Turn Messy Class Notes Into Revision Tools

---

## Slide 1: Title & Hook
- **Title**: Pocket Mentor
- **Subtitle**: Turn Messy Class Notes Into Revision Tools
- **Tagline**: From raw lecture scribbles to exam-ready mastery in seconds.
- **Team**: Team 07 (Sadhu Dwaraka Lokesh, Ganji Nithish, Sri Vinya Reddy, N. Sai Satya Nishika, Chalamalla Ruthwika)
- **Visual**: Side-by-side: chaotic fragmented notes on the left $\rightarrow$ sleek flashcards, instant quiz, and 60-second summary on the right.

---

## Slide 2: The Problem (Student Reality)
- **The Lecture Problem**: Students type or write shorthand, unpunctuated, chaotic lecture notes.
- **The Revision Bottleneck**: Before exams, hours are wasted re-formatting, highlighting, or re-typing notes instead of studying.
- **The Cognitive Trap**: Passive re-reading yields the lowest retention rates (<20%), whereas active recall yields up to 80% retention.
- **Key Pain Point**: Active study tools (flashcards, practice quizzes) take too long to build manually when time is short.

---

## Slide 3: The Solution — Pocket Mentor
- **One-Click Transformation**: Paste or drop raw, unorganized notes. No pre-cleaning required.
- **Three-Pronged Output**:
  1. **60-Second Plain-Language Summary**: Rapid conceptual orientation.
  2. **Active Recall Flashcards**: Front/back question-and-answer pairs for spaced repetition.
  3. **Interactive Self-Test Quiz**: Multiple-choice diagnostic with instant feedback and score.
- **"Revise Again" Engine**: Dynamic prompt variations produce fresh questions for unlimited practice without changing notes.

---

## Slide 4: System Workflow & Live Demo Flow
- **Step 1: Input**: Student pastes messy notes into the React/Vite interface.
- **Step 2: Single LLM Call**: Backend sends a strictly scoped prompt enforcing deterministic JSON.
- **Step 3: Interactive Revision**: Student flips through flashcards and answers the quiz.
- **Step 4: Real-time Evaluation**: Immediate scoring, answer explanations, and opportunity to iterate.

---

## Slide 5: Technical Architecture (MERN + LLM)
- **Frontend**: React 18, Vite, Responsive CSS, interactive flip animations, local quiz score engine.
- **Backend**: Node.js, Express.js REST API (`POST /api/generate`).
- **AI Integration**: Structured JSON schema output via OpenAI / Gemini / Anthropic APIs with fail-safe JSON parsers and temperature tuning.
- **Database (Stretch)**: MongoDB session history to track quiz scores and topic retention over time.

---

## Slide 6: Market Validation & Competitive Edge
- **Quizlet**: Popular for flashcards, but requires existing cards or multi-step manual setup.
- **Anki**: Great spaced repetition, but steep learning curve and zero automated note conversion.
- **Notion AI**: Good summarization, but lacks dedicated student active recall tools and interactive testing.
- **Pocket Mentor's Edge**: **Unified, instant, one-step synthesis** built specifically from raw student notes.

---

## Slide 7: Team 07 Roster

| Member | Roll Number | Branch | Primary Responsibility |
| :--- | :---: | :---: | :--- |
| **Sadhu Dwaraka Lokesh** | `24EG112B25` | IT | Full Stack & LLM Pipeline Lead |
| **Ganji Nithish** | `24EG105R62` | CSE | Frontend & Interactive UI/UX |
| **Sri Vinya Reddy** | `24EG105P30` | CSE | Backend REST Services & Routing |
| **N. Sai Satya Nishika** | `24EG105B32` | CSE | Prompt Engineering & Schema Design |
| **Chalamalla Ruthwika** | `24EG105J07` | CSE | Quality Assurance, Testing & Docs |

---

## Slide 8: Future Roadmap & Q&A
- Voice memo & lecture audio transcription (Whisper API).
- Handwriting OCR for physical notebook camera snaps.
- Spaced repetition notification system (SM-2 algorithm).
- **Q&A**: Thank you! Open for questions.
