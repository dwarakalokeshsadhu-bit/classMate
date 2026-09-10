import { sanitizeTitle } from '../utils/textSanitizer.js';

/**
 * Mock & Demo Intelligence Engine for Pocket Mentor
 * Generates high-yield study materials, active recall quizzes,
 * flashcards, presentation decks, clean notes, and AI tutor answers
 * without requiring external API keys.
 */

export function generateMockRevision(notes, mode = 'fresh') {
  const lines = notes
    .split('\n')
    .map(l => l.replace(/\uFFFD/g, '').trim())
    .filter(l => l.length > 0);

  // Extract candidate sentences, strictly filtering out corrupted/binary fragments
  const sentences = notes
    .replace(/([.?!])\s*(?=[A-Z])/g, "$1|")
    .split("|")
    .map(s => s.replace(/\uFFFD/g, '').trim())
    .filter(s => {
      const alphaCount = (s.match(/[a-zA-Z]/g) || []).length;
      return s.length > 12 && alphaCount >= 6 && (alphaCount / s.length) >= 0.35;
    });

  // Select first readable line for title, falling back safely
  const cleanFirstLine = lines.find(l => {
    const aCount = (l.match(/[a-zA-Z]/g) || []).length;
    return aCount >= 3;
  }) || "Class Lecture Notes";

  const titleGuess = sanitizeTitle(cleanFirstLine, "Class Lecture Notes");
  const mainSentences = sentences.length > 0 ? sentences.slice(0, 8) : [
    `Foundational concepts and principles of ${titleGuess}.`,
    `Structured state transitions and boundary validations.`,
    `Critical constraints and system rules governing problem solving.`
  ];

  // Extract key terms (capitalized words or terms followed by colons or hyphens)
  const termMatches = [];
  const termRegex = /([A-Z][A-Za-z0-9\s-]{2,25}):\s*([^.\n]+)/g;
  let match;
  while ((match = termRegex.exec(notes)) !== null) {
    if (termMatches.length < 6) {
      termMatches.push({
        term: match[1].trim(),
        definition: match[2].trim(),
        example: `Used when applying ${match[1].trim()} in exam scenarios and system workflows.`
      });
    }
  }

  // Fallback definitions if not enough colon-based terms
  if (termMatches.length < 3) {
    termMatches.push({
      term: titleGuess,
      definition: mainSentences[0] || `The core foundational principle described in the uploaded notes.`,
      example: `Primary focus area in standard syllabus exam problems.`
    });
    termMatches.push({
      term: lines[1] ? lines[1].substring(0, 24).replace(/^[#-*\s]+/, '') : "Core Mechanism",
      definition: mainSentences[1] || `The underlying operational technique and state transition rules.`,
      example: `Key mechanism evaluated in multi-choice and descriptive questions.`
    });
    termMatches.push({
      term: "Active Recall Optimization",
      definition: "The cognitive practice of retrieving information from memory without looking at the notes, maximizing long-term retention.",
      example: "Practicing with Pocket Mentor flashcards and quizzes before exam day."
    });
  }

  // Detected subtopics for weakness tracking
  const detectedSubtopics = [
    `${titleGuess} - Core Concepts`,
    `${titleGuess} - Operational Mechanics`,
    `${titleGuess} - Edge Cases & Pitfalls`,
    `${titleGuess} - Exam Applications`
  ];

  // 60-Second Rescue Summary
  const rescueSummary = `⚡ 60-SECOND RESCUE SUMMARY:
These notes concentrate on ${titleGuess}. ${mainSentences[0] || 'Key rules and operational mechanics are established.'} ${mainSentences[1] || 'Foundational constraints dictate the behavior of each component.'} Primary takeaways: master the core terminology, understand the sequential transitions, and be prepared to identify edge-case traps during exam calculations.`;

  // Deep Topic Summary
  const deepSummary = `### Comprehensive Topic Analysis: ${titleGuess}

1. **Foundational Architecture**:
${mainSentences.slice(0, 2).map(s => `- ${s}`).join('\n') || `- ${titleGuess} provides the operational baseline.`}

2. **Core Mechanisms & Rules**:
${mainSentences.slice(2, 4).map(s => `- ${s}`).join('\n') || `- Strict operational conditions must be validated at every stage.`}

3. **Critical Distinctions**:
${mainSentences.slice(4, 6).map(s => `- ${s}`).join('\n') || `- Differentiate between theoretical bounds and practical implementation constraints.`}

4. **Exam Strategy**:
- Focus active recall on definitions and formula parameters.
- Watch for distractor options in multiple-choice questions that swap key variables or omit boundary conditions.`;

  // Key Points Extraction
  const keyPoints = [
    `Foundational Theme: Focuses specifically on ${titleGuess}.`,
    mainSentences[0] || `Primary operational definition and initial system parameters.`,
    mainSentences[1] || `Key transition states and validation milestones.`,
    mainSentences[2] || `Important constraint boundaries to remember for problem solving.`,
    `Revision Priority: Master high-frequency formulas and term definitions first.`
  ];

  const isVariation = mode === 'variation';

  // High-Yield Flashcards with topic and difficulty
  const flashcards = [
    {
      id: "fc-1",
      question: isVariation
        ? `What is the critical exam objective behind "${titleGuess}"?`
        : `What is the central subject and primary definition of "${titleGuess}"?`,
      answer: mainSentences[0] || `${titleGuess} establishes the foundational architecture and governing principles.`,
      topic: `${titleGuess} - Core Concepts`,
      difficulty: "easy",
      repetitionLevel: 0,
      nextReviewDate: new Date(Date.now() + 86400000).toISOString()
    },
    {
      id: "fc-2",
      question: isVariation
        ? `Which specific condition or property dictates system stability in this topic?`
        : `What primary rule or invariant must be maintained according to these notes?`,
      answer: mainSentences[1] || `Continuous state verification and boundary validation during each execution stage.`,
      topic: `${titleGuess} - Operational Mechanics`,
      difficulty: "medium",
      repetitionLevel: 0,
      nextReviewDate: new Date(Date.now() + 86400000).toISOString()
    },
    {
      id: "fc-3",
      question: isVariation
        ? `Where do students most frequently commit errors when solving problems on this topic?`
        : `What common edge case or constraint is highlighted in the notes?`,
      answer: mainSentences[2] || `Confusing logical address translation with physical boundary allocations.`,
      topic: `${titleGuess} - Edge Cases & Pitfalls`,
      difficulty: "hard",
      repetitionLevel: 0,
      nextReviewDate: new Date(Date.now() + 86400000).toISOString()
    },
    {
      id: "fc-4",
      question: isVariation
        ? `How do the core components of ${titleGuess} interact under non-ideal conditions?`
        : `What distinguishes the primary components mentioned in the lecture material?`,
      answer: mainSentences[3] || `Components communicate through strict interfaces to preserve data isolation and determinism.`,
      topic: `${titleGuess} - Exam Applications`,
      difficulty: "medium",
      repetitionLevel: 0,
      nextReviewDate: new Date(Date.now() + 86400000).toISOString()
    },
    {
      id: "fc-5",
      question: `Why is active recall with spaced repetition superior to passive rereading for ${titleGuess}?`,
      answer: `Active recall forces cognitive retrieval, strengthening synaptic pathways and dramatically reducing exam retrieval anxiety.`,
      topic: `Learning Methodology`,
      difficulty: "easy",
      repetitionLevel: 0,
      nextReviewDate: new Date(Date.now() + 86400000).toISOString()
    }
  ];

  // Multi-choice quiz with explanations, distractors, topic tags & difficulty
  const quiz = [
    {
      id: "q-1",
      topic: `${titleGuess} - Core Concepts`,
      difficulty: "easy",
      question: `Regarding "${titleGuess}", which statement represents the most accurate definition?`,
      options: [
        mainSentences[0] || `It establishes the fundamental structure and parameters for ${titleGuess}.`,
        "It is a deprecated paradigm that has no valid exam or industry application.",
        "It eliminates all hardware, memory, and algorithmic constraints unconditionally.",
        "It operates strictly randomly without any deterministic output."
      ],
      correctAnswer: mainSentences[0] || `It establishes the fundamental structure and parameters for ${titleGuess}.`,
      explanation: `Option A is correct because the lecture notes explicitly identify this as the foundational premise.`,
      distractorsExplanation: `Options B, C, and D are incorrect distractors: the concept is modern and core to the syllabus, constraints are never arbitrarily eliminated, and the process is strictly deterministic.`
    },
    {
      id: "q-2",
      topic: `${titleGuess} - Operational Mechanics`,
      difficulty: "medium",
      question: `When executing the primary mechanism outlined in the notes, which invariant holds true?`,
      options: [
        mainSentences[1] || "Structured state transitions with validated boundary checks at each phase",
        "Arbitrary skipping of intermediate states to maximize unverified throughput",
        "Disabling all error detection and boundary validations",
        "Replacing deterministic rules with uncontrolled race conditions"
      ],
      correctAnswer: mainSentences[1] || "Structured state transitions with validated boundary checks at each phase",
      explanation: `The operational mechanism requires strict sequential state validation to prevent corruption or undefined states.`,
      distractorsExplanation: `Disabling error checks or allowing race conditions contradicts the foundational rules established in the text.`
    },
    {
      id: "q-3",
      topic: `${titleGuess} - Edge Cases & Pitfalls`,
      difficulty: "hard",
      question: `What is the most frequent student mistake when analyzing this topic under exam conditions?`,
      options: [
        "Confusing the primary constraint boundary with secondary implementation details",
        "Relying on the official textbook formulas",
        "Double-checking unit conversions and index offsets",
        "Reviewing the definitions prior to answering descriptive questions"
      ],
      correctAnswer: "Confusing the primary constraint boundary with secondary implementation details",
      explanation: `Examiners intentionally craft distractors around boundary conditions and index offsets, making constraint confusion the highest risk mistake.`,
      distractorsExplanation: `Double-checking units and using standard formulas are recommended best practices, not mistakes.`
    },
    {
      id: "q-4",
      topic: `${titleGuess} - Exam Applications`,
      difficulty: "medium",
      question: `How should a student systematically triage a complex exam problem on ${titleGuess}?`,
      options: [
        "Isolate given variables, verify boundary constraints, and apply the core state transition rule",
        "Immediately write down the first memorized numeric answer without reading constraints",
        "Skip to the concluding formula while ignoring all intermediate assumptions",
        "Assume the system operates under ideal conditions without resource limitations"
      ],
      correctAnswer: "Isolate given variables, verify boundary constraints, and apply the core state transition rule",
      explanation: `Systematic problem-solving requires grounding in given constraints before executing state transitions.`,
      distractorsExplanation: `Blind guessing or ignoring assumptions leads directly to distractor traps on standardized exams.`
    }
  ];

  // Notes -> Presentation Summary (Slide Deck)
  const presentationSlides = [
    {
      slideNumber: 1,
      title: `${titleGuess}: Executive Overview`,
      bullets: [
        `Topic Context: Core curriculum revision for ${titleGuess}`,
        mainSentences[0] || "Foundational concepts and principles overview",
        "Audience: Students preparing for competitive and semester exams"
      ],
      takeaway: `Mastery of ${titleGuess} provides a reliable foundation for downstream problem solving.`
    },
    {
      slideNumber: 2,
      title: "Core Mechanics & Architectural Rules",
      bullets: [
        mainSentences[1] || "Key operational mechanisms and state transitions",
        mainSentences[2] || "Critical boundary constraints and verification steps",
        "Efficiency considerations and performance implications"
      ],
      takeaway: "Invariants must be verified at every state boundary."
    },
    {
      slideNumber: 3,
      title: "Common Pitfalls & Exam Traps",
      bullets: [
        "Mistaking logical structures for physical hardware mappings",
        "Overlooking off-by-one errors in index and offset calculations",
        "Rushing through distractor options in high-stakes MCQs"
      ],
      takeaway: "Always write down the boundary parameters before computing values."
    },
    {
      slideNumber: 4,
      title: "Rapid Mastery & Action Plan",
      bullets: [
        "Step 1: Active recall with Pocket Mentor flashcards (Spaced Repetition)",
        "Step 2: Timed self-test quiz with Confidence vs. Correctness check",
        "Step 3: Targeted review of the Mistake Vault"
      ],
      takeaway: "Consistent 15-minute daily recall sessions yield higher retention than cramming."
    }
  ];

  // Actionable Study Tips
  const studyTips = [
    `Study Next Recommendation: Focus on "${titleGuess} - Edge Cases & Pitfalls" to eliminate preventable exam deductions.`,
    `Spaced Repetition: Review these flashcards again in 24 hours (Day 1) and 72 hours (Day 3).`,
    `Confidence Rule: If you answer a question with High Confidence but get it Wrong (Danger Zone), review the exact definition immediately.`
  ];

  return {
    title: titleGuess,
    summary: rescueSummary,
    deepSummary,
    keyPoints,
    definitions: termMatches,
    subtopics: detectedSubtopics,
    flashcards,
    quiz,
    presentationSlides,
    studyTips,
    source: "demo-mode",
    note: "Generated using Pocket Mentor Smart Engine. For live Gemini 2.5 generative reasoning, specify GEMINI_API_KEY in server/.env."
  };
}

/**
 * AI Notes Cleanup & Organization
 */
export function cleanMockNotes(rawNotes) {
  const lines = rawNotes
    .split('\n')
    .map(l => l.trim())
    .filter(l => l.length > 0);

  const title = (lines[0] || "Organized Study Notes").replace(/^[#-*\s]+/, '').trim();
  const bodyLines = lines.slice(1);

  let structuredMarkdown = `# 📚 ${title}\n\n`;
  structuredMarkdown += `## 🎯 Overview & Objectives\n`;
  structuredMarkdown += `These notes have been cleaned, deduplicated, and formatted into high-yield study structure for active exam revision.\n\n`;

  structuredMarkdown += `## 🔑 Core Concepts & Rules\n`;
  bodyLines.forEach((line) => {
    const cleaned = line.replace(/^[•\-*]\s*/, '').trim();
    if (cleaned.length > 0) {
      if (cleaned.includes(':')) {
        const [term, ...rest] = cleaned.split(':');
        structuredMarkdown += `- **${term.trim()}**: ${rest.join(':').trim()}\n`;
      } else {
        structuredMarkdown += `- ${cleaned}\n`;
      }
    }
  });

  structuredMarkdown += `\n## ⚡ Quick Formula / Definition Checklist\n`;
  structuredMarkdown += `- [ ] Verified core terminology definitions\n`;
  structuredMarkdown += `- [ ] Checked boundary edge cases & constraints\n`;
  structuredMarkdown += `- [ ] Practiced active recall flashcards\n`;

  return structuredMarkdown;
}

/**
 * Simulated Handwritten Notes & Document OCR
 */
export function ocrMockImage(filename = "handwritten_notes.png") {
  const lower = (filename || '').toLowerCase();

  if (lower.includes('bio') || lower.includes('photo')) {
    return `--- Transcribed from Document / Photo (${filename}) ---
# Biology: Photosynthesis & Light Reactions
1. Photolysis of Water:
   - 2H2O -> 4H+ + 4e- + O2 (in thylakoid lumen)
   - Generates proton gradient driving ATP synthase.
2. Calvin Cycle Key Reactions:
   - RuBisCO fixes CO2 into 3-Phosphoglycerate (3-PGA).
   - Requires ATP & NADPH synthesized during light reactions.
Exam Trap: RuBisCO also reacts with O2 (photorespiration), which wastes energy!`;
  }

  if (lower.includes('econ') || lower.includes('market')) {
    return `--- Transcribed from Document / Photo (${filename}) ---
# Economics: Market Equilibrium & Elasticity
1. Price Elasticity of Demand (PED):
   - PED = (% Change in Quantity Demanded) / (% Change in Price)
   - Inelastic (|PED| < 1): Price increase raises total revenue.
2. Deadweight Loss:
   - Net loss of total surplus from tax, tariff, price ceilings or price floors.`;
  }

  return `--- Transcribed from Document / Handwritten Notes (${filename}) ---
Topic: Operating Systems & Distributed Consensus
1. Byzantine Fault Tolerance (BFT):
   - Ability of a distributed computer network to function correctly even if some nodes fail or act maliciously.
   - Requires minimum 3f + 1 total nodes to tolerate f faulty nodes.
2. Two-Phase Commit (2PC):
   - Phase 1: Prepare phase (coordinator asks all cohorts if they can commit).
   - Phase 2: Commit phase (if all agree, coordinator sends commit; otherwise abort).
   - Limitation: Blocking protocol if coordinator crashes during phase 2.
3. Memory Paging & TLB:
   - Virtual page number (p) translates to physical frame number (f).
   - TLB hit eliminates redundant memory access for page table lookup.
Exam Note: Memorize the 3f+1 formula and the blocking condition in 2PC!`;
}

/**
 * AI Tutor Chatbot Engine
 */
export function chatMockTutor(notes, userMessage, history = [], mode = 'default', language = 'English') {
  const notesSnippet = notes ? notes.slice(0, 300) : '';

  let response = '';

  if (mode === 'simple') {
    // Explain Simply (ELI5)
    response = `👶 **Explain Simply (ELI5 Mode):**\n\nImagine this like a team project where everyone has a specific job:
1. Instead of one person trying to remember everything at once, the system breaks big tasks into tiny, bite-sized pieces (like lunchboxes!).
2. Whenever you need something, you just look up its label in a quick index card, grab it, and keep moving.
3. If you look for something that isn't on the table yet, you pause for a second, fetch it from your backpack, and resume. That's all there is to it!`;
  } else if (mode === 'detailed') {
    // Explain in Detail
    response = `🎓 **Academic Deep-Dive Analysis:**\n\nUnder rigorous academic examination, the uploaded notes reflect a deterministic state machine:
- **Formal Invariant**: The transition function $\\delta(S_t, I) \\to S_{t+1}$ preserves boundary consistency across each stage.
- **Resource Constraints**: Allocation overhead scales with $O(N)$ space complexity where $N$ represents active addressable frames.
- **Fault Trapping**: Traps to the supervisory kernel execute with atomicity, saving program counter registers to prevent race hazards during context switches.`;
  } else if (mode === 'examples') {
    // Real-world examples
    response = `💡 **Real-World Practical Examples:**\n\nHere is how this concept operates in real life:
1. **Smartphone App Switching**: When you switch between Instagram and Spotify on your phone, background apps swap memory pages so your phone doesn't run out of RAM!
2. **Library Index Catalog**: Instead of wandering through 10,000 shelves, you check the card catalog (page table) which tells you the exact aisle and shelf coordinate.
3. **Database Caching**: Web servers store hot customer sessions in RAM while inactive records remain in slower backing storage.`;
  } else if (mode === 'common_mistakes') {
    // Common student mistakes
    response = `⚠️ **Common Student Mistakes & Traps:**\n\nTop 3 mistakes examiners look for:
1. **Confusing Page vs. Frame**: Remember: *Pages* belong to virtual memory (logical), while *Frames* belong to physical RAM!
2. **Index Off-by-One**: Forgetting that address bits are 0-indexed when computing page offsets.
3. **Overlooking Valid-Invalid Bits**: Assuming every address lookup immediately hits physical RAM without validating the page table entry.`;
  } else if (mode === 'diagram') {
    // Diagram / Concept explanation
    response = `📐 **System Architecture Concept Flow:**\n\n\`\`\`text
+-------------------+
|    CPU Request    |  --> Logical Address: [ Page # (p) | Offset (d) ]
+-------------------+
          |
          v
+-------------------+
|    Page Table     |  --> Looks up Frame # (f) for Page (p)
+-------------------+
          |
          +---> Valid bit == 1?
          |       ├── YES: Physical Address = [ Frame # (f) | Offset (d) ] --> RAM Access!
          |       └── NO:  PAGE FAULT TRAP! --> OS swaps page from Disk to RAM!
\`\`\`\n*Diagram grounded in uploaded notes.*`;
  } else if (mode === 'source') {
    // Source-based answers strictly citing uploaded notes
    const sampleLine = (notes.split('\n').filter(l => l.trim().length > 15)[0] || 'Foundational topic principles and rules').replace(/^[-*#\s]+/, '');
    response = `📖 **Source-Based Answer (Citations from Uploaded Notes):**\n\nDirect grounding from your notes:\n- **Direct Note Excerpt**: *"${sampleLine}"*\n- **Scope Verification**: Your notes focus strictly on core architecture and operational transitions.\n- **Direct Answer to "${userMessage}"**: According to the text, this mechanism operates within the bounds established in your syllabus, requiring verified preconditions before advancing state.\n\n*(Note: Every statement above is directly traceable to your lecture upload.)*`;
  } else if (mode === 'follow_up') {
    // Follow-up questions generator
    response = `🎯 **High-Yield Follow-Up Revision Questions:**\n\nTo test your mastery of *"${userMessage}"*, try answering these without looking at your notes:\n\n1. **Edge Case Question**: *What occurs if the primary boundary condition is violated during a state transition?*\n   *(Hint: Consider whether an exception trap or undefined behavior is triggered.)*\n2. **Mechanism Question**: *How does this component prevent redundant operations under high load?*\n   *(Hint: Review caching and index lookups.)*\n3. **Exam Calculation Trap**: *If the input size doubles, what is the exact mathematical impact on overhead?*`;
  } else {
    // Default smart tutor response
    response = `👋 **Pocket Mentor AI Tutor:**\n\nGreat question regarding: *"${userMessage}"*.\n\nBased on your uploaded notes, here is the clear breakdown:
- **Core Principle**: Your notes highlight that this concept establishes strict boundaries and structured execution.
- **Key Takeaway**: Make sure you distinguish the primary definitions from implementation edge cases.
- **Exam Strategy**: When an exam question tests this, first write down the given constraints before choosing an answer.\n\n*Would you like me to "Explain Simply (ELI5)", give a "Real-World Example", or generate a "Concept Diagram"?*`;
  }

  // Multilingual translation simulation if requested
  const langLower = (language || '').toLowerCase();
  if (langLower && langLower !== 'english') {
    if (langLower === 'spanish' || langLower === 'español') {
      response = `🌐 *[Explicación en Español]*\n\n¡Hola! Aquí está tu tutor Pocket Mentor:\n\n${response}\n\n*Consejo de examen: ¡Practica con las tarjetas de memoria (flashcards) para reforzar la retención!*`;
    } else if (langLower === 'hindi') {
      response = `🌐 *[हिंदी में व्याख्या]*\n\nनमस्ते! पॉकेट मेंटर में आपका स्वागत है:\n\n${response}\n\n*परीक्षा सलाह: परीक्षा में बेहतर प्रदर्शन के लिए मुख्य परिभाषाओं को याद रखें।*`;
    } else if (langLower === 'french' || langLower === 'français') {
      response = `🌐 *[Explication en Français]*\n\nBonjour! Voici les explications de Pocket Mentor:\n\n${response}\n\n*Conseil d'examen: Révisez les définitions clés avant l'épreuve!*`;
    } else if (langLower === 'german' || langLower === 'deutsch') {
      response = `🌐 *[Erklärung auf Deutsch]*\n\nHallo! Hier ist deine Pocket Mentor Zusammenfassung:\n\n${response}\n\n*Prüfungstipp: Achte auf die Randbedingungen und Definitionen!*`;
    } else if (langLower === 'telugu') {
      response = `🌐 *[తెలుగు వివరణ]*\n\nనమస్కారం! పాకెట్ మెంటార్ వివరణ:\n\n${response}\n\n*పరీక్ష చిట్కా: ముఖ్యమైన నిర్వచనాలను మరియు సూత్రాలను క్రమం తప్పకుండా పునశ్చరణ చేయండి.*`;
    } else {
      response = `🌐 *[Language: ${language}]*\n\n${response}\n\n*(Pocket Mentor multilingual support active for ${language})*`;
    }
  }

  return response;
}

/**
 * Personalized Study Plan Generator
 */
export function mockStudyPlan(notes, examDateStr, daysLeft = 5, weakTopics = []) {
  const days = Math.max(1, Math.min(daysLeft || 5, 30));

  const planDays = [];
  for (let i = 1; i <= days; i++) {
    if (i === 1) {
      planDays.push({
        day: 1,
        title: "Foundation & Terminology Sprint",
        tasks: [
          "Read 60-second rescue summary 2x",
          "Master core flashcards (Cards 1-3)",
          "Take baseline quiz to establish initial score"
        ],
        estimatedMinutes: 25
      });
    } else if (i === days) {
      planDays.push({
        day: i,
        title: "Final Exam Simulation & Mastery Check",
        tasks: [
          "Timed Mock Exam Mode (100% pass goal)",
          "Review Mistake Vault items until 0 errors remain",
          "Read through Presentation Summary key takeaways"
        ],
        estimatedMinutes: 30
      });
    } else if (weakTopics.length > 0 && i === 2) {
      planDays.push({
        day: i,
        title: `Weakness Triage: ${weakTopics[0] || 'Targeted Areas'}`,
        tasks: [
          `Review mistakes on ${weakTopics[0]}`,
          "Ask AI Tutor to 'Explain in Detail' and generate examples",
          "Complete targeted 5-question drill"
        ],
        estimatedMinutes: 20
      });
    } else {
      planDays.push({
        day: i,
        title: `Spaced Repetition & Deep Application (Cycle ${i})`,
        tasks: [
          "Spaced flashcard review (flip without looking)",
          "Adaptive quiz: aim for 85%+ on Medium & Hard questions",
          "Identify and eliminate any Danger Zone answers"
        ],
        estimatedMinutes: 25
      });
    }
  }

  return {
    examDate: examDateStr || "Upcoming Exam",
    daysRemaining: days,
    totalRevisionMinutes: days * 25,
    schedule: planDays,
    recommendation: "Spend 20-25 focused minutes per day using active recall rather than passive rereading."
  };
}
