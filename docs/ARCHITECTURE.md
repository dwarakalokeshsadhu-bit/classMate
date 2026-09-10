# 🏛️ Pocket Mentor — Technical Architecture

This document provides a comprehensive technical breakdown of the system design, frontend and backend architectures, LLM orchestration pipeline, data contracts, and error-handling mechanisms for **Pocket Mentor**.

---

## 1. System High-Level Architecture

Pocket Mentor follows a decoupled client-server architecture built on the MERN stack with external LLM service integration.

```
       +---------------------------------------------+
       |             Client Layer (Browser)          |
       |  React 18 + Vite + Tailwind CSS / Vanilla   |
       +---------------------------------------------+
                              |
                     HTTPS (JSON REST)
                              |
       +---------------------------------------------+
       |             Application Server              |
       |       Node.js (v18+) + Express.js           |
       |                                             |
       |  +------------------+  +-----------------+  |
       |  |  Input Validator |  | Prompt Builder  |  |
       |  +------------------+  +-----------------+  |
       |  +------------------+  +-----------------+  |
       |  |  JSON Sanitizer  |  | Error Handler   |  |
       |  +------------------+  +-----------------+  |
       +---------------------------------------------+
                |                            |
       Structured Prompts / JSON       Mongoose / MongoDB Driver
                v                            v
    +-----------------------+     +--------------------+
    |    LLM Cloud API      |     | MongoDB Atlas (Opt)|
    | OpenAI / Anthropic /  |     | Collection:        |
    | Gemini 1.5/2.0 Flash  |     | sessions           |
    +-----------------------+     +--------------------+
```

---

## 2. Frontend Architecture (React + Vite)

### 2.1 Component Hierarchy

```
App.jsx
│
├── Header.jsx (App branding, team tag, status indicator)
│
├── NotesInputScreen.jsx
│   ├── TextInputArea.jsx (Multi-line textarea with word/char counter)
│   ├── FileUploadZone.jsx (Drag-and-drop / file picker for .txt and .md)
│   └── ActionControls.jsx (Generate button with loading state & spinners)
│
└── ResultsScreen.jsx
    ├── NavigationTabs.jsx (Switch between Summary, Flashcards, and Quiz)
    ├── SummaryView.jsx (60-second summary display with copy-to-clipboard)
    ├── FlashcardDeck.jsx
    │   ├── FlashcardCard.jsx (Flip animation: question on front, answer on back)
    │   └── DeckControls.jsx (Previous, Next, Flip, Card counter)
    ├── QuizEngine.jsx
    │   ├── QuizQuestion.jsx (Question prompt + 4 selectable options)
    │   ├── QuizScoreModal.jsx (Instant score calculation, percentage, breakdown)
    │   └── AnswerReview.jsx (Highlights correct vs selected answers)
    └── SessionFooter.jsx (Revise Again trigger, Start New Notes button)
```

### 2.2 State Management Strategy
The client uses local React state (or lightweight Context) to manage:
- `rawNotes`: Current text in the input area.
- `isLoading`: Boolean flag indicating active backend processing.
- `error`: User-friendly error message string if request fails.
- `studyData`:
  ```typescript
  interface StudyData {
    summary: string;
    flashcards: Array<{
      question: string;
      answer: string;
    }>;
    quiz: Array<{
      question: string;
      options: string[];
      correctAnswer: string;
    }>;
  }
  ```
- `quizState`:
  - `userAnswers`: Record of `{ [questionIndex: number]: string }`
  - `isSubmitted`: Boolean flag controlling review mode
  - `score`: Numeric calculation `(correct / total) * 100`

---

## 3. Backend Architecture (Node.js + Express)

### 3.1 Directory Structure
```
server/
├── index.js              # Express app initialization and server listen
├── routes/
│   ├── generate.js       # Route handler for /api/generate
│   └── health.js         # Liveness/readiness probe /api/health
├── controllers/
│   └── aiController.js   # Orchestrates prompt construction & LLM invocation
├── services/
│   └── llmService.js     # Direct client wrapper (OpenAI / Gemini SDK)
├── utils/
│   ├── jsonCleaner.js    # Strips markdown backticks and validates JSON
│   └── promptTemplates.js# System prompts and few-shot schemas
└── middleware/
    ├── errorHandler.js   # Global express error handler
    └── validateInput.js  # Validates request body presence and size limits
```

### 3.2 Request Lifecycle
1. **Client Request**: `POST /api/generate` with payload `{ notes: string, mode?: string }`.
2. **Validation**: Check notes length (minimum 20 characters, maximum 15,000 characters).
3. **Prompt Construction**: Assemble system role and task instructions with explicit JSON output requirements.
4. **LLM Invocation**: Call API using temperature `0.3` (low randomness for deterministic schema compliance).
5. **Sanitization**: In case the model returns ````json { ... } ````, regex-extract the valid JSON payload.
6. **Delivery**: Respond with HTTP `200 OK` and parsed JSON body.

---

## 4. LLM Prompt Design & Schema Contract

### 4.1 System Prompt
```
You are Pocket Mentor, an expert educational assistant designed to transform messy lecture notes into high-impact revision resources.

Output STRICT JSON ONLY. Do not wrap output in markdown fences, backticks, or conversational text.
Your response MUST strictly adhere to this exact JSON schema:
{
  "summary": "A 60-second plain-language conceptual synthesis of the provided notes (approx 80-150 words).",
  "flashcards": [
    {
      "question": "Clear, direct active-recall question testing a single key concept",
      "answer": "Concise, precise explanation or definition"
    }
  ],
  "quiz": [
    {
      "question": "Conceptual multiple-choice question testing understanding rather than simple memorization",
      "options": [
        "Plausible Option A",
        "Plausible Option B",
        "Plausible Option C",
        "Plausible Option D"
      ],
      "correctAnswer": "The exact string corresponding to the correct option"
    }
  ]
}

Rules:
1. Generate between 5 to 8 flashcards.
2. Generate between 3 to 5 quiz questions.
3. Every quiz question MUST contain exactly 4 options.
4. "correctAnswer" MUST be an exact match to one of the 4 strings in "options".
5. Ground all information strictly in the provided lecture notes; avoid external hallucinations.
```

---

## 5. Database Schema (MongoDB Stretch Goal)

If MongoDB persistence is enabled, sessions are persisted in the `sessions` collection:

```javascript
const SessionSchema = new mongoose.Schema({
  rawNotes: {
    type: String,
    required: true,
    trim: true,
  },
  summary: {
    type: String,
    required: true,
  },
  flashcards: [
    {
      question: { type: String, required: true },
      answer: { type: String, required: true },
    }
  ],
  quiz: [
    {
      question: { type: String, required: true },
      options: [{ type: String, required: true }],
      correctAnswer: { type: String, required: true },
    }
  ],
  lastQuizScore: {
    score: { type: Number, default: null },
    totalQuestions: { type: Number, default: null },
    completedAt: { type: Date, default: null },
  },
  createdAt: {
    type: Date,
    default: Date.now,
  }
});
```

---

## 6. Resilience & Error Handling

| Potential Failure Point | Cause | Mitigation Strategy |
| :--- | :--- | :--- |
| **Malformed JSON from LLM** | Model wraps output in markdown codeblocks (````json ... ````) or outputs stray prose. | Regex extraction of `{.*}` combined with standard `JSON.parse()`; automatic one-shot retry if parsing fails. |
| **API Rate Limit / Quota** | High traffic or API key tier limits reached. | Implement HTTP 429 backoff handling; fallback to a friendly client toast asking the user to wait a few seconds. |
| **Empty or Minimal Notes** | User enters fewer than 20 characters or gibberish. | Frontend and backend validation returning HTTP 400 with message: `"Please provide sufficient lecture notes (at least 2-3 sentences) to generate revision tools."` |
| **Offline / Server Unreachable** | Backend process down or network timeout. | Client-side Axios/fetch timeout (30 seconds) with user-friendly retry button. |
