# 🛠️ Pocket Mentor — Setup & Development Guide

This guide walks through setting up and running **Pocket Mentor** locally on your development machine.

---

## 📋 Prerequisites

Before starting, ensure you have the following installed:
- **Node.js**: v18.x or higher ([Download Node.js](https://nodejs.org/))
- **npm** (comes bundled with Node.js) or **yarn** / **pnpm**
- **Git** ([Download Git](https://git-scm.com/))
- An API key for your chosen LLM provider:
  - **OpenAI API Key** ([platform.openai.com](https://platform.openai.com/)), OR
  - **Google Gemini API Key** ([aistudio.google.com](https://aistudio.google.com/)), OR
  - **Anthropic Claude API Key** ([console.anthropic.com](https://console.anthropic.com/))
- *(Optional)* **MongoDB** (Local instance or free MongoDB Atlas URI if enabling session history)

---

## 📁 Recommended Project Layout

```
Pocket Mentor/
├── client/                     # React + Vite Frontend
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Header.jsx
│   │   │   ├── NotesInputScreen.jsx
│   │   │   ├── ResultsScreen.jsx
│   │   │   ├── FlashcardDeck.jsx
│   │   │   └── QuizEngine.jsx
│   │   ├── App.jsx
│   │   ├── index.css
│   │   └── main.jsx
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
│
├── server/                     # Node.js + Express Backend
│   ├── routes/
│   │   └── generate.js
│   ├── controllers/
│   │   └── aiController.js
│   ├── services/
│   │   └── llmService.js
│   ├── utils/
│   │   └── jsonCleaner.js
│   ├── .env.example
│   ├── package.json
│   └── index.js
│
├── docs/                       # Project Documentation Suite
│   ├── PROJECT_DOCUMENTATION.md
│   ├── ARCHITECTURE.md
│   ├── API_SPECIFICATION.md
│   └── SETUP_GUIDE.md
│
└── README.md
```

---

## ⚡ Quick Start Instructions

### 1. Clone or Open the Repository
```bash
cd "c:\24EG112B25\Pocket Mentor"
```

---

### 2. Backend Setup (`server/`)

1. Navigate to the server folder:
   ```bash
   cd server
   ```
2. Install dependencies:
   ```bash
   npm install express cors dotenv @google/genai # or openai
   ```
3. Configure environment variables:
   Create a `.env` file in `server/`:
   ```env
   PORT=5000
   # Choose your provider key:
   GEMINI_API_KEY=your_gemini_api_key_here
   # or OPENAI_API_KEY=your_openai_api_key_here
   
   # Optional: MongoDB connection
   # MONGODB_URI=mongodb+srv://<user>:<password>@cluster0.mongodb.net/pocketmentor
   ```
4. Start the backend development server:
   ```bash
   npm run dev   # (using nodemon or node index.js)
   ```
   The backend will start running on `http://localhost:5000`.

---

### 3. Frontend Setup (`client/`)

1. Open a new terminal and navigate to the client folder:
   ```bash
   cd client
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```
4. Open your browser and navigate to the printed local URL (typically `http://localhost:5173`).

---

## 🧪 Testing with Sample Lecture Notes

You can paste this sample note block into Pocket Mentor to test generation:

```text
Compiler Design - Lexical Analysis:
Lexical analysis is the 1st phase of a compiler. It reads the source program as a stream of characters and groups them into meaningful sequences called lexemes. For each lexeme, the lexical analyzer produces a token of the form <token-name, attribute-value>.
Tokens: keywords, identifiers, operators, constants.
Patterns: rule describing the set of lexemes that can represent a particular token. Often specified using regular expressions.
A Lexeme is an instance of a token in the source code.
Buffer Pairs are used to speed up character reading: two buffers of size N bytes each, loaded alternately. Two pointers: Begin pointer and Forward pointer.
```

Expected Output:
- **Summary**: ~80 words explaining Lexical Analysis, lexemes, tokens, and buffer pairs.
- **Flashcards**: 4-6 cards (e.g., Difference between lexeme and token, purpose of buffer pairs, two pointers used).
- **Quiz**: 3-4 multiple-choice questions with 4 choices each testing compiler phases and token definitions.

---

## 💡 Troubleshooting

- **CORS Issues**: Ensure `cors()` middleware is active in `server/index.js` and allows `http://localhost:5173`.
- **Invalid JSON from LLM**: Check `server/utils/jsonCleaner.js` to ensure markdown backtick stripping (` ```json ... ``` `) is handling raw model strings.
- **API Key Quotas**: Verify that the API key is valid and has billing/free credits available.
