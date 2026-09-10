import { sanitizeTitle } from '../utils/textSanitizer.js';

/**
 * Mock & Demo Intelligence Engine for Pocket Mentor
 * Generates high-yield study materials, active recall quizzes,
 * flashcards, presentation decks, clean notes, and AI tutor answers
 * without requiring external API keys.
 */

export function generateMockRevision(notes, mode = 'fresh') {
  const cleanNotes = (notes || '').replace(/\uFFFD/g, '');
  const lines = cleanNotes
    .split('\n')
    .map(l => l.trim())
    .filter(l => l.length > 0);

  // Extract clean statements (split on newlines, list items, and sentence boundaries)
  const statements = [];
  lines.forEach(line => {
    const strippedLine = line.replace(/^(\d+[\.\)]|[-*•])\s*/, '').trim();
    if (strippedLine.length > 0) {
      const subs = strippedLine.split(/(?<=[.?!])\s+/).map(s => s.trim()).filter(s => s.length > 10);
      if (subs.length > 0) {
        statements.push(...subs);
      } else {
        statements.push(strippedLine);
      }
    }
  });

  // Select first readable line for title, falling back safely
  const cleanFirstLine = lines.find(l => {
    const aCount = (l.match(/[a-zA-Z]/g) || []).length;
    return aCount >= 3;
  }) || "Class Lecture Notes";

  const titleGuess = sanitizeTitle(cleanFirstLine.replace(/^(\d+[\.\)]|[-*•])\s*/, ''), "Class Lecture Notes");

  const mainSentences = statements.length > 0 ? statements.slice(0, 10) : [
    `Core principles and fundamental mechanisms of ${titleGuess}.`,
    `Structured operational rules and key properties governing this topic.`,
    `Critical constraints, conditions, and boundary validations required.`,
    `Key distinctions, applications, and problem-solving methodologies.`
  ];

  // Dynamically extract terms & definitions from student's notes
  const termMatches = [];
  const seenTerms = new Set();

  // Pattern 1: Colon/Dash definitions with optional leading numbers or bullets (e.g. 1. RuBisCO Enzyme: Fixes CO2...)
  const colonRegex = /(?:^|\n)\s*(?:\d+[\.\)]\s*|[-*•]\s*)?\*?\*?([A-Za-z0-9\s-]{2,35})\*?\*?\s*[:\-–—]\s*([^\n\r]+)/g;
  let match;
  while ((match = colonRegex.exec(cleanNotes)) !== null && termMatches.length < 6) {
    const t = match[1].trim().replace(/^(\d+[\.\)]|[-*•])\s*/, '').trim();
    const d = match[2].trim().replace(/^[-*•\s]+/, '');
    if (!seenTerms.has(t.toLowerCase()) && d.length > 8 && !t.toLowerCase().startsWith('http')) {
      seenTerms.add(t.toLowerCase());
      termMatches.push({
        term: t,
        definition: d.length > 160 ? d.slice(0, 157) + '...' : d,
        example: `Key syllabus application: Direct definition question on ${t}.`
      });
    }
  }

  // Pattern 2: "X is defined as / is / refers to Y" in sentences
  const isRegex = /([A-Z][A-Za-z0-9\s-]{2,28})\s+(?:is defined as|refers to|means|is|are)\s+([^.?!;\n]{12,180})/g;
  while ((match = isRegex.exec(cleanNotes)) !== null && termMatches.length < 6) {
    const t = match[1].trim().replace(/^(\d+[\.\)]|[-*•])\s*/, '').trim();
    const d = match[2].trim();
    if (!seenTerms.has(t.toLowerCase()) && d.length > 10) {
      seenTerms.add(t.toLowerCase());
      termMatches.push({
        term: t,
        definition: d.length > 160 ? d.slice(0, 157) + '...' : d,
        example: `Context: Foundational property of ${t} as stated in the notes.`
      });
    }
  }

  // Fallback term extraction: Extract prominent phrases directly from notes statements
  if (termMatches.length < 3) {
    mainSentences.forEach((s) => {
      if (termMatches.length < 4) {
        const words = s.split(/\s+/);
        if (words.length >= 4) {
          const candidateTerm = words.slice(0, Math.min(3, words.length)).join(' ').replace(/^[#*-•\s]+/, '').replace(/[:.,]$/, '');
          if (candidateTerm.length > 3 && !seenTerms.has(candidateTerm.toLowerCase())) {
            seenTerms.add(candidateTerm.toLowerCase());
            termMatches.push({
              term: candidateTerm,
              definition: s,
              example: `Directly excerpted from the lecture material for ${titleGuess}.`
            });
          }
        }
      }
    });
  }

  // Ensure title is present as a term if list is still small
  if (termMatches.length === 0) {
    termMatches.push({
      term: titleGuess,
      definition: mainSentences[0] || `The core foundational concept presented in the uploaded lecture notes.`,
      example: `Primary exam focus for ${titleGuess}.`
    });
  }

  // References to extracted terms for grounding
  const t1 = termMatches[0]?.term || titleGuess;
  const d1 = termMatches[0]?.definition || mainSentences[0];
  const t2 = termMatches[1]?.term || (mainSentences[1] ? mainSentences[1].slice(0, 20) : "Mechanism");
  const d2 = termMatches[1]?.definition || mainSentences[1] || d1;
  const t3 = termMatches[2]?.term || (mainSentences[2] ? mainSentences[2].slice(0, 20) : "Key Rule");
  const d3 = termMatches[2]?.definition || mainSentences[2] || d1;

  // Subtopics derived strictly from the notes' terms and title
  const detectedSubtopics = [
    `${titleGuess} - Overview`,
    `${t1} - Mechanics`,
    `${t2} - Operations`,
    `${titleGuess} - Exam Rules`
  ];

  // 60-Second Rescue Summary (100% grounded in student's notes)
  const introSentence = (mainSentences[0] && mainSentences[0].toLowerCase() !== titleGuess.toLowerCase())
    ? mainSentences[0]
    : (mainSentences[1] || `Key concepts and operational mechanisms are established.`);

  const rescueSummary = `⚡ 60-SECOND RESCUE SUMMARY:
These notes concentrate on ${titleGuess}. ${introSentence} Core takeaways focus on ${t1}: "${d1}". Key mechanisms specify that ${t2}: "${d2}". For exam success, master the exact definitions of ${t1} and ${t2}, verify all stated operational rules, and watch for condition boundaries during problem solving.`;

  // Deep Topic Summary (Markdown with actual student notes content)
  const deepSummary = `### Comprehensive Topic Analysis: ${titleGuess}

#### 1. Foundational Overview & Principles:
${mainSentences.slice(0, 2).map(s => `- ${s}`).join('\n')}

#### 2. Key Terms & Extracted Definitions:
${termMatches.slice(0, 4).map(tm => `- **${tm.term}**: ${tm.definition}`).join('\n')}

#### 3. Core Mechanisms & Invariants:
${mainSentences.slice(2, 5).map(s => `- ${s}`).join('\n') || `- Strict operational rules and boundary checks must be verified.`}

#### 4. High-Yield Exam Strategy:
- Master the exact distinction between **${t1}** and **${t2}**.
- Watch for edge-case questions that alter the conditions or invert the rules stated in the notes.
- Review formulas, steps, and classifications verbatim as presented.`;

  // Key Points Extraction (Directly from student's sentences)
  const keyPoints = [
    `Primary Focus: ${titleGuess} - ${mainSentences[0] || 'Core principles and definitions.'}`,
    `Key Definition (${t1}): ${d1}`,
    `Core Mechanism (${t2}): ${d2}`,
    mainSentences[2] ? `Operational Rule: ${mainSentences[2]}` : `Constraint Verification: Ensure boundary conditions are maintained.`,
    `Exam Takeaway: Ensure accurate retrieval of definitions and mechanisms for ${titleGuess}.`
  ];

  const isVariation = mode === 'variation';

  // Flashcards (100% grounded in student's notes, no generic study tips)
  const flashcards = [
    {
      id: "fc-1",
      question: isVariation
        ? `In the context of ${titleGuess}, what concept is defined as: "${d1.length > 80 ? d1.slice(0, 77) + '...' : d1}"?`
        : `According to the lecture notes, what is the definition and function of "${t1}"?`,
      answer: isVariation ? t1 : d1,
      topic: `${titleGuess} - Overview`,
      difficulty: "easy",
      repetitionLevel: 0,
      nextReviewDate: new Date(Date.now() + 86400000).toISOString()
    },
    {
      id: "fc-2",
      question: isVariation
        ? `What specific operational behavior or rule is established for "${t2}"?`
        : `How do the notes describe the role or mechanism of "${t2}"?`,
      answer: d2,
      topic: `${t1} - Mechanics`,
      difficulty: "medium",
      repetitionLevel: 0,
      nextReviewDate: new Date(Date.now() + 86400000).toISOString()
    },
    {
      id: "fc-3",
      question: isVariation
        ? `Which condition, formula, or constraint is explicitly highlighted in the notes?`
        : `What key rule or principle is stated in: "${mainSentences[2] ? mainSentences[2].slice(0, 60) + '...' : titleGuess}"?`,
      answer: mainSentences[2] || d3,
      topic: `${t2} - Operations`,
      difficulty: "hard",
      repetitionLevel: 0,
      nextReviewDate: new Date(Date.now() + 86400000).toISOString()
    },
    {
      id: "fc-4",
      question: isVariation
        ? `How is "${t3}" related to or distinguished within ${titleGuess}?`
        : `What is the significance of "${t3}" according to the uploaded material?`,
      answer: d3,
      topic: `${titleGuess} - Exam Rules`,
      difficulty: "medium",
      repetitionLevel: 0,
      nextReviewDate: new Date(Date.now() + 86400000).toISOString()
    },
    {
      id: "fc-5",
      question: isVariation
        ? `What is the primary conclusion or critical takeaway for ${titleGuess}?`
        : `What critical exam insight or summary fact is emphasized for ${titleGuess}?`,
      answer: mainSentences[3] || mainSentences[1] || `Accurately applying ${t1} and adhering to the verified rules in ${titleGuess}.`,
      topic: `${titleGuess} - Overview`,
      difficulty: "hard",
      repetitionLevel: 0,
      nextReviewDate: new Date(Date.now() + 86400000).toISOString()
    }
  ];

  // Helper to generate plausible distractors from actual notes
  const distractorA = d2 !== d1 ? d2 : `It operates arbitrarily without following the conditions specified in the notes.`;
  const distractorB = d3 !== d1 && d3 !== d2 ? d3 : `It completely reverses the operational mechanism described in the text.`;
  const distractorC = `It functions unconditionally without any verified parameters or boundary checks.`;

  // Quiz Questions (100% grounded in student's notes, no generic boilerplate)
  const quiz = [
    {
      id: "q-1",
      topic: `${titleGuess} - Overview`,
      difficulty: "easy",
      question: `Based on the lecture notes, which statement accurately defines or describes "${t1}"?`,
      options: [
        d1,
        distractorA,
        distractorB,
        distractorC
      ],
      correctAnswer: d1,
      explanation: `The notes explicitly state that ${t1}: "${d1}".`,
      distractorsExplanation: `The other options confuse ${t1} with other mechanisms (${t2}) or state inaccurate unconstrained conditions.`
    },
    {
      id: "q-2",
      topic: `${t1} - Mechanics`,
      difficulty: "medium",
      question: `Regarding "${t2}", which of the following statements is directly supported by the text?`,
      options: [
        `It bypasses all required validation stages mentioned in the notes`,
        d2,
        `It has the exact opposite function of ${t1}`,
        `It is unrelated to the subject matter of ${titleGuess}`
      ],
      correctAnswer: d2,
      explanation: `According to the uploaded material, ${t2} is characterized by: "${d2}".`,
      distractorsExplanation: `Bypassing validation or claiming lack of relation directly contradicts the rules established in the notes.`
    },
    {
      id: "q-3",
      topic: `${t2} - Operations`,
      difficulty: "hard",
      question: `Which key rule, mechanism, or property is highlighted regarding "${mainSentences[2] ? t3 : titleGuess}"?`,
      options: [
        `It operates randomly without deterministic rules or sequential order`,
        `It eliminates all structural constraints unconditionally`,
        mainSentences[2] || d3,
        `It invalidates all previously established definitions of ${t1}`
      ],
      correctAnswer: mainSentences[2] || d3,
      explanation: `The lecture material specifically notes: "${mainSentences[2] || d3}".`,
      distractorsExplanation: `The other options mischaracterize the system as arbitrary or contradictory to the foundational principles.`
    },
    {
      id: "q-4",
      topic: `${titleGuess} - Exam Rules`,
      difficulty: "medium",
      question: `When analyzing a problem on "${titleGuess}", what is the primary relationship or takeaway stated in the notes?`,
      options: [
        mainSentences[3] || `Understanding ${t1} and ${t2} enables accurate prediction of system behavior and exam solutions.`,
        `Only memorize formulas without understanding the definitions of ${t1} or ${t2}`,
        `Ignore all boundary conditions and sequential transitions`,
        `Assume the mechanisms operate without any prerequisite rules`
      ],
      correctAnswer: mainSentences[3] || `Understanding ${t1} and ${t2} enables accurate prediction of system behavior and exam solutions.`,
      explanation: `This takeaway is directly drawn from the core content and operational mechanisms of the lecture notes.`,
      distractorsExplanation: `Ignoring constraints or memorizing without comprehension are classic student exam mistakes.`
    }
  ];

  // Presentation Slides (Grounded in student's notes)
  const presentationSlides = [
    {
      slideNumber: 1,
      title: `${titleGuess}: Executive Overview`,
      bullets: [
        `Subject: ${titleGuess}`,
        mainSentences[0] || `Foundational overview and core principles`,
        `Key focus: ${t1}`
      ],
      takeaway: `Mastery of ${titleGuess} provides the foundation for standard exam problem solving.`
    },
    {
      slideNumber: 2,
      title: `Core Terminology: ${t1} & ${t2}`,
      bullets: [
        `${t1}: ${d1.length > 70 ? d1.slice(0, 67) + '...' : d1}`,
        `${t2}: ${d2.length > 70 ? d2.slice(0, 67) + '...' : d2}`,
        `Operational relationship between key concepts`
      ],
      takeaway: `Accurately define ${t1} and ${t2} before attempting complex multi-step questions.`
    },
    {
      slideNumber: 3,
      title: "Mechanisms & Operational Rules",
      bullets: [
        mainSentences[1] || "Key operational mechanisms and state transitions",
        mainSentences[2] || "Critical boundary constraints and verification steps",
        "Consistent validation prevents edge-case errors"
      ],
      takeaway: "Invariants and constraints must be verified at every stage."
    },
    {
      slideNumber: 4,
      title: "Summary & Exam Review",
      bullets: [
        `Review definition of ${t1}`,
        `Verify rules and conditions for ${t2}`,
        mainSentences[3] || "Practice active recall on core mechanisms"
      ],
      takeaway: "Confidence comes from mastering the exact definitions and rules from the notes."
    }
  ];

  // Actionable Study Tips (Customized to the extracted content)
  const studyTips = [
    `Study Priority: Carefully review the exact definition and function of "${t1}" to avoid mixing it up on multiple-choice questions.`,
    `Mechanism Check: Make sure you can explain the rules for "${t2}" in your own words without looking at the notes.`,
    `Exam Preparation: Pay close attention to edge cases and boundary conditions in "${titleGuess}".`
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
    note: "Generated using Pocket Mentor Grounded Offline Engine."
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
  const cleanNotes = (notes || '').replace(/\uFFFD/g, '').trim();
  const lines = cleanNotes.split('\n').map(l => l.trim()).filter(l => l.length > 0);
  const title = (lines[0] || 'Class Lecture Notes').replace(/^[#*-•\s]+/, '').slice(0, 40);

  // Find relevant lines matching query keywords
  const queryWords = (userMessage || '').toLowerCase().replace(/[^a-z0-9\s]/g, '').split(/\s+/).filter(w => w.length > 3);
  const matchingLines = lines.filter(l => {
    const lower = l.toLowerCase();
    return queryWords.some(qw => lower.includes(qw));
  });

  const primaryContext = matchingLines.length > 0
    ? matchingLines.slice(0, 3).join(' ')
    : (lines.slice(0, 3).join(' ') || 'Core lecture concepts and operational mechanisms.');

  const sampleExcerpt = matchingLines[0] || lines[1] || lines[0] || 'Fundamental subject mechanisms and definitions.';

  // Extract candidate term from message or notes
  const candidateTerm = queryWords[0]
    ? queryWords[0].charAt(0).toUpperCase() + queryWords[0].slice(1)
    : title;

  let response = '';

  if (mode === 'simple') {
    // Explain Simply (ELI5)
    response = `👶 **Explain Simply (ELI5 Mode):**\n\nThink about **${candidateTerm}** from your notes like this:
1. **The Goal**: It's like having a clear instruction manual so every piece knows exactly what to do without causing confusion.
2. **How It Works**: According to your lecture notes: *"${sampleExcerpt.replace(/^[#*-•\s]+/, '')}"*.
3. **The Simple Takeaway**: Rather than overcomplicating things, it keeps operations structured and verified so errors don't pile up!`;
  } else if (mode === 'detailed') {
    // Explain in Detail
    response = `🎓 **Academic Deep-Dive Analysis:**\n\nUnder rigorous academic examination, the uploaded notes establish the following framework regarding **${candidateTerm}**:
- **Core Principle**: *"${sampleExcerpt.replace(/^[#*-•\s]+/, '')}"*
- **Operational Invariant**: System state must satisfy all preconditions before proceeding to subsequent stages, preserving determinism.
- **Contextual Grounding**: In the broader scope of ${title}, this mechanism prevents undefined transitions and enforces syllabus constraints.`;
  } else if (mode === 'examples') {
    // Real-world practical examples
    response = `💡 **Real-World Practical Examples:**\n\nHere is how **${candidateTerm}** (from your notes) operates in practice:
1. **Production Applications**: In modern industry systems, adhering to *"${sampleExcerpt.slice(0, 60)}..."* ensures reliable execution without data corruption.
2. **Everyday Analogy**: Think of a quality-control checkpoint in manufacturing: each step must be verified before the next phase begins.
3. **Exam Application**: Standard exam problems frequently test whether you can identify this mechanism when given varied initial inputs.`;
  } else if (mode === 'common_mistakes') {
    // Common student mistakes
    response = `⚠️ **Common Student Mistakes & Exam Traps for ${title}:**\n\nTop pitfalls to watch for:
1. **Misinterpreting Core Definitions**: Confusing **${candidateTerm}** with contrasting mechanisms from the notes.
2. **Overlooking Boundary Conditions**: Forgetting that *"${sampleExcerpt.slice(0, 70)}..."* requires verified preconditions.
3. **Rushing Multiple-Choice Distractors**: Standard exams craft tricky options by inverting the rules or omitting key constraints. Always read all four options before answering!`;
  } else if (mode === 'diagram') {
    // Concept / Architecture diagram grounded in notes
    response = `📐 **Concept Architecture Flow for ${title}:**\n\n\`\`\`text
+-------------------------------------------------------+
|   Input State / Preconditions (${title})              |
+-------------------------------------------------------+
                           |
                           v
+-------------------------------------------------------+
|   Core Mechanism: ${candidateTerm}                     |
|   "${sampleExcerpt.slice(0, 50)}..."                  |
+-------------------------------------------------------+
                           |
            +--------------+--------------+
            |                             |
            v                             v
[ Conditions Verified ]         [ Boundary Violation ]
            |                             |
            v                             v
( Valid Exam Output )           ( Error Trap / Retry )
\`\`\`\n*Diagram synthesized directly from your uploaded lecture notes.*`;
  } else if (mode === 'source') {
    // Source-based answers strictly citing uploaded notes
    response = `📖 **Source-Based Answer (Citations from Uploaded Notes):**\n\nDirect grounding from your lecture text:\n- **Direct Note Citation**: *"${sampleExcerpt.replace(/^[#*-•\s]+/, '')}"*\n- **Scope Verification**: Your notes focus specifically on: *${title}*.\n- **Direct Answer to "${userMessage}"**: According to the notes, this operates strictly as described above: *"${primaryContext.slice(0, 150)}..."*\n\n*(Every statement above is directly traceable to your upload.)*`;
  } else if (mode === 'follow_up') {
    // Follow-up questions generator
    response = `🎯 **High-Yield Follow-Up Revision Questions on ${title}:**\n\nTo test your mastery of *"${userMessage}"*, try answering these from memory:\n\n1. **Mechanism Question**: *According to the notes, what is the primary role of ${candidateTerm}?*\n   *(Hint: Review: "${sampleExcerpt.slice(0, 60)}...")*\n2. **Edge Case Question**: *What occurs if the conditions specified in ${title} are violated?*\n3. **Application Question**: *How would you explain the difference between this concept and related terms on an exam?*`;
  } else {
    // Default smart tutor response
    response = `👋 **Pocket Mentor AI Tutor:**\n\nRegarding your question on: *"${userMessage}"*:\n\nBased directly on your lecture notes:\n- **Key Finding**: *"${sampleExcerpt.replace(/^[#*-•\s]+/, '')}"*\n- **Context within ${title}**: The notes emphasize that this mechanism maintains structured rules and verified properties.\n- **Exam Strategy**: When an exam question tests this concept, cite the exact definition and verify whether boundary conditions are met before answering.\n\n*Would you like me to "Explain Simply (ELI5)", give "Real-World Examples", or generate a "Concept Diagram"?*`;
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
  const days = Math.max(1, Math.min(parseInt(daysLeft, 10) || 5, 30));

  // Extract key concept names from notes if available for personalized day titles
  const extractedTopics = [];
  if (notes && typeof notes === 'string') {
    const lines = notes.split('\n');
    for (const line of lines) {
      const trimmed = line.replace(/^[#*-•\s]+/, '').trim();
      if (trimmed.length > 5 && trimmed.length < 40 && !trimmed.startsWith('http') && !trimmed.toLowerCase().includes('lecture')) {
        extractedTopics.push(trimmed);
        if (extractedTopics.length >= 6) break;
      }
    }
  }

  const primaryWeakness = weakTopics.length > 0 ? weakTopics[0] : (extractedTopics[0] || 'Core Principles');
  const secondaryWeakness = weakTopics.length > 1 ? weakTopics[1] : (extractedTopics[1] || 'Applied Concepts');

  const planDays = [];

  if (days === 1) {
    planDays.push({
      day: 1,
      title: "Emergency 24-Hour High-Yield Sprint & Mastery Check",
      tasks: [
        "Read 60-second rescue summary 3x to lock in core invariants",
        `Targeted drill on high-risk concepts: ${primaryWeakness}`,
        "Review all flashcards with active recall (focus on Hard/Again)",
        "Clear every item currently banked in the Mistake Vault",
        "Take 1 Timed Mock Exam to establish final confidence"
      ],
      estimatedMinutes: 45
    });
  } else if (days === 2) {
    planDays.push({
      day: 1,
      title: "Foundation Sprint & Weakness Triage",
      tasks: [
        "Read 60-second rescue summary and core definitions",
        `Master foundational flashcards for ${primaryWeakness}`,
        "Complete baseline quiz attempt to detect remaining danger zones"
      ],
      estimatedMinutes: 30
    });
    planDays.push({
      day: 2,
      title: "Mistake Elimination & Final Mock Simulation",
      tasks: [
        "Review all Mistake Vault items until 0 mistakes remain",
        "5-minute Timed Mock Exam Mode (aim for 90%+ pass rate)",
        "Final rapid skim of high-yield key takeaways and formula sheet"
      ],
      estimatedMinutes: 35
    });
  } else if (days === 3) {
    planDays.push({
      day: 1,
      title: "Core Foundation & Terminology Sprint",
      tasks: [
        "Read 60-second rescue summary 2x",
        "Master foundational definitions and term cards",
        "Baseline quiz to gauge starting score and identify danger zones"
      ],
      estimatedMinutes: 25
    });
    planDays.push({
      day: 2,
      title: `Weakness Deep-Dive: ${primaryWeakness}`,
      tasks: [
        `Review mistakes and distractor traps for ${primaryWeakness}`,
        "Ask AI Tutor to 'Explain in Detail' and provide concrete real-world examples",
        "Complete targeted 5-question adaptive drill"
      ],
      estimatedMinutes: 30
    });
    planDays.push({
      day: 3,
      title: "Full Mock Exam & Final Confidence Check",
      tasks: [
        "Timed Mock Exam Mode (simulate exam conditions)",
        "Review any remaining Mistake Vault items",
        "Final skim of 60-second rescue summary"
      ],
      estimatedMinutes: 25
    });
  } else {
    // 4 to 30 days progression
    const themes = [
      { title: "Core Foundation & Terminology Sprint", minutes: 25, tasks: ["Read 60-second rescue summary 2x", "Master core terminology & definitions", "Complete baseline quiz attempt to map strengths"] },
      { title: `Targeted Weakness Triage: ${primaryWeakness}`, minutes: 30, tasks: [`Review mistakes on ${primaryWeakness}`, "Ask AI Tutor to 'Explain Simply' and draw concept diagram", "Complete targeted 5-question drill on missed concepts"] },
      { title: "Active Recall Flashcard Sprint", minutes: 25, tasks: ["Review all flashcards with Leitner spaced repetition", "Filter deck for 'Hard' cards and repeat until fluent", "Use audio speech read-aloud to reinforce verbal memory"] },
      { title: `Secondary Focus & Application: ${secondaryWeakness}`, minutes: 25, tasks: [`Test harder question variations on ${secondaryWeakness}`, "Eliminate any lingering 'Danger Zone' high-confidence errors", "Verify key definitions with 100% precision"] },
      { title: "Adaptive Quiz & Distractor Trap Evasion", minutes: 30, tasks: ["Take adaptive quiz aiming for 90%+ on Hard questions", "Study the explanations for incorrect distractors", "Bank new mistakes directly into the Mistake Vault"] },
      { title: "Mistake Vault Liquidation & Speed Drill", minutes: 25, tasks: ["Drill all banked errors until mistake counter hits zero", "Review presentation slides for structured concept hierarchy", "Test self-explanation on complex multi-step processes"] },
      { title: "Mid-Term Knowledge Consolidation", minutes: 30, tasks: ["Comprehensive flashcard sweep across all saved topics", "Verify confidence vs. correctness 2x2 matrix calibration", "Review summary notes without looking at answers"] }
    ];

    for (let i = 1; i <= days; i++) {
      if (i === days) {
        // Final Day
        planDays.push({
          day: i,
          title: "Final Exam Simulation & Readiness Confirmation",
          tasks: [
            "5-minute Timed Mock Exam Mode under strict exam conditions",
            "Clear all remaining Mistake Vault items",
            "Final confidence review of 60-second rescue summary and formulas"
          ],
          estimatedMinutes: 30
        });
      } else if (i <= themes.length) {
        const theme = themes[i - 1];
        planDays.push({
          day: i,
          title: theme.title,
          tasks: theme.tasks,
          estimatedMinutes: theme.minutes
        });
      } else {
        // Extended days (8 to 30)
        const cycleNum = Math.floor((i - 1) / 5) + 1;
        const topicRef = extractedTopics[(i - 1) % extractedTopics.length] || `Module ${i}`;
        planDays.push({
          day: i,
          title: `Spaced Repetition & Deep Application: ${topicRef}`,
          tasks: [
            `Active recall review for ${topicRef}`,
            "Adaptive quiz with hard difficulty variations",
            "Consult AI Tutor for edge-case questions and common exam traps"
          ],
          estimatedMinutes: 20
        });
      }
    }
  }

  let recommendation;
  if (days <= 2) {
    recommendation = "⚡ Emergency 24–48h High-Yield Cram: Prioritize the 60-Second Rescue Summary and Mistake Vault drills over passive reading.";
  } else if (days <= 5) {
    recommendation = "🎯 Accelerated Sprint: Spend 25–30 focused minutes per day using active recall rather than passive rereading.";
  } else if (days <= 14) {
    recommendation = "🌱 Optimal Spaced Repetition: Spend 20–25 minutes daily cycling flashcards and testing adaptive quizzes.";
  } else {
    recommendation = "🏆 Paced Mastery: Spend 15–20 minutes daily across structured revision cycles to cement permanent conceptual retention.";
  }

  return {
    examDate: examDateStr || "Upcoming Exam",
    daysRemaining: days,
    totalRevisionMinutes: planDays.reduce((acc, d) => acc + (d.estimatedMinutes || 25), 0),
    schedule: planDays,
    recommendation
  };
}

