<div align="center">
  <img src="client/public/logo.png" alt="Class Mate Logo" width="130" />
  <h1>🎓 Class Mate</h1>
  <p><strong>Learning that adapts to you</strong></p>
  <p><em>An intelligent AI revision & active-recall platform that transforms raw lecture notes into interactive study suites.</em></p>

  <p>
    <img src="https://img.shields.io/badge/Frontend-React%2018%20%2B%20Vite-61DAFB?logo=react&logoColor=black" alt="React" />
    <img src="https://img.shields.io/badge/Backend-Node.js%20%2B%20Express-339933?logo=node.js&logoColor=white" alt="Node" />
    <img src="https://img.shields.io/badge/Design-StudyFetch%20Aesthetic%20%7C%20Sage%20Green-96A78D" alt="Theme" />
    <img src="https://img.shields.io/badge/License-MIT-blue.svg" alt="License" />
  </p>
</div>

---

## 📌 1. Project Overview

**Class Mate** is an intelligent revision and active-recall engine designed for students. It transforms disorganized, shorthand-heavy, or photographed lecture notes into an active study suite:
1. **⚡ 60-Second Rescue Summary**: Rapid plain-language overview capturing core invariants (~1 min read).
2. **🔑 Key Points & Important Definitions**: High-yield exam takeaways and term/application cards.
3. **📇 Active-Recall Flashcards with Spaced Repetition**: 3D flip cards with SM-2 intervals (Again, Hard, Good, Easy) and Text-to-Speech pronunciation.
4. **📝 Self-Test Quiz & Mock Exam**: Multiple-choice assessment with instant explanations, distractor trap breakdowns, confidence calibration, adaptive difficulty, and a 5-minute timed exam mode.
5. **🎯 Smart Learning & Weakness Detector**: Automatic subtopic classification into Strong and Weak topics with 2x2 Confidence vs. Correctness tracking.
6. **🚨 Mistake Vault**: Banks missed questions across sessions and offers 1-click targeted revision drills.
7. **🤖 Grounded AI Tutor**: Interactive chat with ELI5 ("Explain simply"), Deep Professor, Real-World Examples, Common Pitfalls, ASCII Concept Diagrams, and Multilingual explanations.
8. **🖥️ Presentation Deck**: Converts raw notes into structured slide decks with copy/export.
9. **📅 Personalized Study Plan**: Live exam countdown timer and customized daily study milestones.

---

## 🚀 Quickstart: Running on Localhost

### Single-Command Full-Stack (Root)
```bash
npm run build    # Compiles client production bundle
npm start        # Launches full-stack server on http://localhost:5000
```

### Separate Client & Server Development
**1. Start Backend Server (Port 5000)**:
```powershell
cd server
npm.cmd install
npm.cmd test         # Runs 8 integration test suites
npm.cmd start        # Starts Express on http://localhost:5000
```
> *Tip: To enable live Gemini AI generation, add your `GEMINI_API_KEY` to `server/.env`. If omitted, Class Mate runs using its built-in smart demo engine.*

**2. Start Frontend Dev Client (Port 5173)**:
```powershell
cd client
npm.cmd install
npm.cmd run dev      # Starts Vite dev server with proxy on http://localhost:5173
```

---

## 🌐 Production Deployment

Class Mate is deployment-ready for **Render**, **Railway**, **Vercel**, **Docker**, and cloud container services.

- **Full-Stack on Render (1-Click)**: Connect repo, set build command `npm run build` and start command `npm start`. (Blueprint included: `render.yaml`).
- **Docker Container**: Multi-stage production `Dockerfile` included (`docker build -t class-mate .`).
- **Vercel Frontend**: Configuration included (`vercel.json` and `client/vercel.json`).

📖 **Full Step-by-Step Instructions**: See [docs/DEPLOYMENT_GUIDE.md](docs/DEPLOYMENT_GUIDE.md).

---

## ✨ Features Implemented

### 📥 Core Ingestion & Notes Cleanup
- **Multi-Format Document Upload**: Accepts PDF, Word (DOC/DOCX), PowerPoint (PPT/PPTX), Plaintext, Markdown, and Images.
- **Handwritten Notes OCR**: Image transcription via Gemini Multimodal Vision API or fallback smart extractor.
- **Lecture Audio → Notes**: Built-in Speech-to-Text transcription via browser Web Speech API.
- **AI Notes Cleanup & Format**: Organizes messy, fragmented shorthand into structured Markdown sections with headers and bullet points.
- **Sample Presets**: Quick-load syllabus presets for Operating Systems, Compilers, Biology, and Economics.

### 🧠 Active Recall & Practice Suite
- **60-Second Rescue Summary**: High-impact read with read-time badge and 1-click copy.
- **Deep Academic Summary**: Comprehensive concept breakdown with equations and state transitions.
- **High-Yield Key Points**: Checkbox list to track reviewed takeaways.
- **Important Definitions Grid**: Term, exam definition, and practical application cards.
- **Flashcards with Spaced Repetition**: 3D flip animation, keyboard shortcuts (Space/Arrows), difficulty filtering (Easy/Medium/Hard), audio speech read-aloud, and recall ease intervals (Again, Hard, Good, Easy).
- **Quiz Engine**: 4-option MCQs with instant scoring, celebratory confetti, and verbatim-checked answers.
- **Instant Explanations**: Deep rationale for correct answers and distractor trap warnings.
- **Confidence vs. Correctness Tracking (2x2 Matrix)**:
  - 🔴 **Danger Zone**: High Confidence + Wrong Answer (Highest Exam Threat)
  - 🟡 **Lucky Guess**: Low Confidence + Correct Answer (Unstable Knowledge)
  - 🟠 **Learning Gap**: Low Confidence + Wrong Answer (Needs Review)
  - 🟢 **Solid Mastery**: High Confidence + Correct Answer (Exam-Ready)
- **Retry Incorrect Questions**: 1-click focus mode to retry only missed questions.
- **Revise-Again Engine**: Generates completely new variations of questions and flashcards.
- **Exam / Mock-Test Mode**: 5-minute timed test with countdown timer and auto-submission.
- **Adaptive Quiz**: Dynamically adjusts question difficulty based on answers.

### 🎯 Smart Learning & Differentiating Features
- **Weakness Detector**: Topic-level accuracy tracking with clear Strong and Weak badges.
- **“What should I study now?”**: Smart triage recommendation pointing directly to the highest-priority study task.
- **Mistake Vault**: Persistent mistake bank with 1-click **Targeted Quick Drill** to re-test mistakes until mastered.
- **Progress from First Attempt → Final Mastery**: Tracks score progression from first baseline attempt to current mastery.
- **Personalized Study Plan**: Day-by-day revision milestones tailored to weak topics.
- **Exam Countdown**: Live Days, Hours, and Minutes countdown tiles for the target exam date.
- **Save & Organize Subjects**: Subject folder switcher and creator (e.g. Operating Systems, Biology).
- **Global Search**: Search across saved subjects, notes, flashcards, and topics.
- **Daily Revision Reminders**: Browser notification scheduler to keep study streaks alive.
- **Offline Flashcards Revision**: Works offline via browser LocalStorage.
- **Share & Export**: Export full study deck as JSON, copy summary link, or print a revision cheat sheet.

### 🤖 Grounded AI Tutor
- **Conversational Tutor**: Grounded strictly in uploaded notes.
- **“Explain simply” (ELI5) Mode**: Everyday metaphors and simple language.
- **“Explain in detail” Mode**: Rigorous academic professor depth.
- **Real-World Examples Mode**: Concrete industry and software applications.
- **Common Mistakes Mode**: Uncovers frequent exam traps and edge cases.
- **Concept Architecture Diagram Mode**: Generates ASCII/flowchart system diagrams.
- **Multilingual Explanations**: Supports English, Spanish, Hindi, French, German, Telugu, Tamil, Mandarin, Japanese.
- **Voice-Based Questions**: Ask questions verbally via microphone.

---

## 👥 Team Details

**Team Number**: 07  
**Hackathon**: AU.28 Hackathon-01  

| S.No | Name | Roll Number | Branch | Role / Focus Area |
| :---: | :--- | :---: | :---: | :--- |
| 1 | **Sadhu Dwaraka Lokesh** | `24EG112B25` | IT | Full Stack & LLM Pipeline |
| 2 | **Ganji Nithish** | `24EG105R62` | CSE | Frontend & UI/UX Design |
| 3 | **Sri Vinya Reddy** | `24EG105P30` | CSE | Backend & API Architecture |
| 4 | **N. Sai Satya Nishika** | `24EG105B32` | CSE | LLM Prompt Engineering & Validation |
| 5 | **Chalamalla Ruthwika** | `24EG105J07` | CSE | Testing, Evaluation & Documentation |

---
*Class Mate — Learning that adapts to you.*
