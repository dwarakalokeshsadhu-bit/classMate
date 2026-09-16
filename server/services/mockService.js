import { sanitizeTitle, isBannerOrNoiseLine } from '../utils/textSanitizer.js';

/**
 * Mock & Demo Intelligence Engine for Pocket Mentor
 * Generates high-yield study materials, active recall quizzes,
 * flashcards, presentation decks, clean notes, and AI tutor answers
 * without requiring external API keys.
 */

// Stopwords to reject when extracting terms
const STOPWORDS = new Set([
  'the', 'this', 'that', 'with', 'from', 'when', 'where', 'which', 'what',
  'rule', 'exam', 'note', 'topic', 'chapter', 'unit', 'transcribed', 'document',
  'page', 'let', 'step', 'case', 'table', 'section', 'lecture', 'notes',
  'and', 'for', 'are', 'was', 'were', 'have', 'has', 'been', 'their', 'there'
]);

function isValidTerm(term) {
  if (!term || typeof term !== 'string') return false;
  const clean = term.trim().replace(/^[#*•\-\s]+/, '').replace(/[:.,]$/, '').trim();
  if (clean.length < 3 || clean.length > 45) return false;
  const alphaCount = (clean.match(/[a-zA-Z]/g) || []).length;
  if (alphaCount < 3) return false;
  if (STOPWORDS.has(clean.toLowerCase())) return false;
  if (/^[-=~*#\d.]+$/.test(clean)) return false;
  return true;
}

/**
 * Domain Pack: Database Management Systems (DBMS) - Functional Dependencies & Normalization
 */
function getDbmsStudyPack(mode = 'fresh') {
  const isVariation = mode === 'variation';
  const title = "DBMS: Functional Dependencies & Normalization";

  const rescueSummary = `⚡ **60-SECOND RESCUE SUMMARY: Functional Dependencies & Normalization**

• **Core Concept**: A Functional Dependency (FD) $X \\to Y$ over relation schema $R$ is an integrity constraint specifying that if two tuples $t_1, t_2$ agree on attribute set $X$ ($t_1.X = t_2.X$), they must also agree on attribute set $Y$ ($t_1.Y = t_2.Y$).
• **Classifications**:
  - **Trivial FD**: $Y \\subseteq X$ (always holds unconditionally, e.g., $\\{RollNo, Name\\} \\to Name$).
  - **Non-Trivial FD**: $Y \\not\\subseteq X$ (dependent contains attributes not in the determinant).
  - **Completely Non-Trivial**: $X \\cap Y = \\emptyset$ (determinant and dependent share zero common attributes).
• **Armstrong's Axioms (Inference Rules)**:
  - **Reflexivity**: If $Y \\subseteq X$, then $X \\to Y$.
  - **Augmentation**: If $X \\to Y$, then $XZ \\to YZ$ for any attribute set $Z$.
  - **Transitivity**: If $X \\to Y$ and $Y \\to Z$, then $X \\to Z$.
• **Exam Alert**: When testing if $X \\to Y$ holds on a table instance, verify rows with identical $X$ values. If any matching $X$ values lead to differing $Y$ values, the FD is strictly violated!`;

  const deepSummary = `### Comprehensive Topic Analysis: DBMS Functional Dependencies & Normalization

#### 1. Foundational Overview:
- **Relation Schema ($R$)**: A named set of attributes representing the structural blueprint of a relational table.
- **Functional Dependency ($X \\to Y$)**: A semantic constraint between two sets of attributes $X$ and $Y$ in $R$. Attribute set $X$ is the **determinant**, and $Y$ is the **dependent**.
- **Tuple Equivalence Rule**: For all pairs of tuples $t_1, t_2 \\in R$, if $t_1.X = t_2.X$, then $t_1.Y = t_2.Y$.

#### 2. Taxonomy of Functional Dependencies:
- **Trivial Dependency**: Occurs when the right-hand side is a subset of the left-hand side ($Y \\subseteq X$). Such dependencies carry no new information and are always satisfied.
- **Non-Trivial Dependency**: Occurs when at least one attribute in $Y$ is absent from $X$ ($Y \\not\\subseteq X$).
- **Completely Non-Trivial Dependency**: Occurs when $X$ and $Y$ are completely disjoint ($X \\cap Y = \\emptyset$).

#### 3. Armstrong's Inference Axioms:
1. **Reflexivity Rule**: If $Y \\subseteq X$, then $X \\to Y$ holds.
2. **Augmentation Rule**: If $X \\to Y$, then $XZ \\to YZ$ holds for any attribute set $Z$.
3. **Transitivity Rule**: If $X \\to Y$ and $Y \\to Z$, then $X \\to Z$ holds.
4. **Union Rule (Derived)**: If $X \\to Y$ and $X \\to Z$, then $X \\to YZ$.
5. **Decomposition Rule (Derived)**: If $X \\to YZ$, then $X \\to Y$ and $X \\to Z$.

#### 4. High-Yield Exam Strategy:
- **Closure Computation**: To determine if an attribute set is a Super Key, compute its attribute closure $X^+$ using Armstrong's Axioms. If $X^+$ includes all attributes of $R$, $X$ is a Super Key.
- **Candidate Key vs. Super Key**: A Candidate Key is a minimal Super Key (no proper subset is a Super Key).
- **BCNF Condition**: For every non-trivial FD $X \\to Y$, $X$ must be a Super Key.
- **3NF Condition**: For every non-trivial FD $X \\to Y$, either $X$ is a Super Key OR $Y$ is a prime attribute (part of some Candidate Key).`;

  const keyPoints = [
    "Definition of Functional Dependency (X → Y): If t₁.X = t₂.X, then t₁.Y = t₂.Y must hold for all tuples.",
    "Trivial vs Non-Trivial: An FD is trivial if Y ⊆ X; completely non-trivial if X ∩ Y = ∅.",
    "Armstrong's Primary Axioms: Reflexivity (Y ⊆ X ⇒ X → Y), Augmentation (X → Y ⇒ XZ → YZ), and Transitivity (X → Y, Y → Z ⇒ X → Z).",
    "Armstrong's Secondary Rules: Union (X → Y, X → Z ⇒ X → YZ) and Decomposition (X → YZ ⇒ X → Y, X → Z).",
    "Validation Rule: To test X → Y on relation instances, check whether duplicate X values produce duplicate Y values."
  ];

  const definitions = [
    {
      term: "Functional Dependency (X → Y)",
      definition: "A relationship between attribute sets X and Y in relation R such that whenever two tuples agree on X, they must also agree on Y.",
      example: "In a Student relation, Student_ID → {Student_Name, Major, GPA}."
    },
    {
      term: "Trivial Functional Dependency",
      definition: "A functional dependency X → Y where the dependent attribute set Y is a subset of the determinant attribute set X (Y ⊆ X).",
      example: "{Roll_No, Student_Name} → Roll_No is trivial because Roll_No ⊆ {Roll_No, Student_Name}."
    },
    {
      term: "Non-Trivial Functional Dependency",
      definition: "A functional dependency X → Y where at least one attribute in Y is not contained in X (Y ⊄ X).",
      example: "Roll_No → Student_Name is non-trivial."
    },
    {
      term: "Armstrong's Augmentation Rule",
      definition: "An inference rule stating that if X → Y holds, then adding attribute set Z to both sides preserves the dependency: XZ → YZ.",
      example: "If Emp_ID → Salary, then {Emp_ID, Dept_ID} → {Salary, Dept_ID}."
    },
    {
      term: "Armstrong's Transitivity Rule",
      definition: "An inference rule stating that if X → Y and Y → Z both hold, then X → Z must also hold.",
      example: "If Student_ID → Department_ID and Department_ID → Department_Head, then Student_ID → Department_Head."
    },
    {
      term: "Attribute Closure (X⁺)",
      definition: "The complete set of all attributes that can be functionally determined by attribute set X under a given set of FDs.",
      example: "If A → B and B → C, then A⁺ = {A, B, C}."
    }
  ];

  const flashcards = isVariation ? [
    {
      id: "fc-dbms-v1",
      question: "What is Armstrong's Decomposition Rule, and how is it derived?",
      answer: "The Decomposition Rule states that if X → YZ, then X → Y and X → Z. It is derived from Reflexivity (YZ → Y, YZ → Z) and Transitivity.",
      topic: "Armstrong's Axioms",
      difficulty: "medium",
      repetitionLevel: 0,
      nextReviewDate: new Date(Date.now() + 86400000).toISOString()
    },
    {
      id: "fc-dbms-v2",
      question: "What is the key difference between a Super Key and a Candidate Key?",
      answer: "A Super Key is any attribute set whose closure contains all attributes of R. A Candidate Key is a minimal Super Key (no proper subset is a Super Key).",
      topic: "Relational Keys",
      difficulty: "hard",
      repetitionLevel: 0,
      nextReviewDate: new Date(Date.now() + 86400000).toISOString()
    },
    {
      id: "fc-dbms-v3",
      question: "When is a relational schema in Boyce-Codd Normal Form (BCNF)?",
      answer: "A relation schema R is in BCNF if for every non-trivial functional dependency X → Y, the determinant X is a Super Key.",
      topic: "Schema Normalization",
      difficulty: "hard",
      repetitionLevel: 0,
      nextReviewDate: new Date(Date.now() + 86400000).toISOString()
    },
    {
      id: "fc-dbms-v4",
      question: "What is Armstrong's Union Rule?",
      answer: "If X → Y and X → Z both hold, then X → YZ holds (proven by Augmentation: X → XY and XY → YZ, then Transitivity).",
      topic: "Armstrong's Axioms",
      difficulty: "medium",
      repetitionLevel: 0,
      nextReviewDate: new Date(Date.now() + 86400000).toISOString()
    },
    {
      id: "fc-dbms-v5",
      question: "How do you detect whether a table instance violates the functional dependency A → B?",
      answer: "Search for two tuples with identical A values. If their B values differ, the functional dependency A → B is violated.",
      topic: "FD Verification",
      difficulty: "easy",
      repetitionLevel: 0,
      nextReviewDate: new Date(Date.now() + 86400000).toISOString()
    }
  ] : [
    {
      id: "fc-dbms-1",
      question: "In relational database theory, what is the formal definition of a Functional Dependency (X → Y)?",
      answer: "For any two tuples t₁ and t₂ in relation R, whenever t₁.X = t₂.X, then t₁.Y = t₂.Y must also hold.",
      topic: "Functional Dependencies",
      difficulty: "easy",
      repetitionLevel: 0,
      nextReviewDate: new Date(Date.now() + 86400000).toISOString()
    },
    {
      id: "fc-dbms-2",
      question: "What distinguishes a Trivial Functional Dependency from a Non-Trivial Functional Dependency?",
      answer: "An FD X → Y is trivial if Y is a subset of X (Y ⊆ X). It is non-trivial if Y is not a subset of X (Y ⊄ X).",
      topic: "FD Types",
      difficulty: "easy",
      repetitionLevel: 0,
      nextReviewDate: new Date(Date.now() + 86400000).toISOString()
    },
    {
      id: "fc-dbms-3",
      question: "What is Armstrong's Augmentation Rule?",
      answer: "If X → Y holds, then adding any attribute set Z to both sides preserves the dependency: XZ → YZ.",
      topic: "Armstrong's Axioms",
      difficulty: "medium",
      repetitionLevel: 0,
      nextReviewDate: new Date(Date.now() + 86400000).toISOString()
    },
    {
      id: "fc-dbms-4",
      question: "What is Armstrong's Transitivity Rule?",
      answer: "If X → Y holds and Y → Z holds, then X → Z must also hold.",
      topic: "Armstrong's Axioms",
      difficulty: "medium",
      repetitionLevel: 0,
      nextReviewDate: new Date(Date.now() + 86400000).toISOString()
    },
    {
      id: "fc-dbms-5",
      question: "When is a functional dependency X → Y considered 'Completely Non-Trivial'?",
      answer: "When determinant X and dependent Y share no common attributes at all, meaning X ∩ Y = ∅.",
      topic: "FD Types",
      difficulty: "hard",
      repetitionLevel: 0,
      nextReviewDate: new Date(Date.now() + 86400000).toISOString()
    }
  ];

  const quiz = isVariation ? [
    {
      id: "q-dbms-v1",
      topic: "Armstrong's Axioms",
      difficulty: "medium",
      question: "Which of the following is the Decomposition Rule derived from Armstrong's Axioms?",
      options: [
        "If X → YZ, then X → Y and X → Z",
        "If X → Y and X → Z, then X → YZ",
        "If X → Y, then XZ → YZ",
        "If Y ⊆ X, then X → Y"
      ],
      correctAnswer: "If X → YZ, then X → Y and X → Z",
      explanation: "The Decomposition Rule states that a multi-attribute right-hand side can be split into separate dependencies: X → YZ implies X → Y and X → Z.",
      distractorsExplanation: "Option B is the Union Rule, Option C is Augmentation, and Option D is Reflexivity."
    },
    {
      id: "q-dbms-v2",
      topic: "Relational Keys",
      difficulty: "hard",
      question: "Given a relation R(A, B, C, D) with functional dependency A → BCD, what can be definitively concluded about attribute A?",
      options: [
        "A is a Super Key of relation R",
        "A cannot be a Candidate Key under any circumstances",
        "A is a foreign key referencing another table",
        "The relation is automatically violated by BCNF"
      ],
      correctAnswer: "A is a Super Key of relation R",
      explanation: "Because A determines all attributes of R (A⁺ = {A, B, C, D}), A is by definition a Super Key of relation R.",
      distractorsExplanation: "A may indeed be a Candidate Key if it is minimal. It is not necessarily a foreign key, and BCNF requires the determinant to be a Super Key (which A is)."
    },
    {
      id: "q-dbms-v3",
      topic: "FD Verification",
      difficulty: "medium",
      question: "In a table instance of R(A, B), Tuple 1 has (A=10, B=20) and Tuple 2 has (A=10, B=30). Does the functional dependency A → B hold?",
      options: [
        "No, because identical A values have different B values",
        "Yes, because A has duplicate values",
        "Yes, because B has duplicate values",
        "Cannot be determined without knowing the Candidate Keys"
      ],
      correctAnswer: "No, because identical A values have different B values",
      explanation: "By definition, A → B requires that whenever t₁.A = t₂.A, t₁.B must equal t₂.B. Here 10=10 but 20≠30, which violates A → B.",
      distractorsExplanation: "Duplicate A values are allowed in instances, but they must map to the same B value to satisfy the functional dependency."
    },
    {
      id: "q-dbms-v4",
      topic: "Schema Normalization",
      difficulty: "hard",
      question: "What is the condition for a non-trivial functional dependency X → Y to satisfy Third Normal Form (3NF)?",
      options: [
        "Either X is a Super Key, OR Y is a prime attribute",
        "X must be a candidate key, and Y must be non-prime",
        "X and Y must be completely non-trivial with zero common attributes",
        "All attributes must be numerical and non-null"
      ],
      correctAnswer: "Either X is a Super Key, OR Y is a prime attribute",
      explanation: "3NF allows transitive dependencies on candidate keys provided that every attribute in the dependent Y is a prime attribute (part of some candidate key).",
      distractorsExplanation: "Requiring X to be a super key is the stricter BCNF condition. 3NF relaxes this by allowing Y to be prime."
    }
  ] : [
    {
      id: "q-dbms-1",
      topic: "Functional Dependencies",
      difficulty: "easy",
      question: "Under relation schema R, what condition is strictly required for the Functional Dependency X → Y to hold between tuples t₁ and t₂?",
      options: [
        "If t₁.X = t₂.X, then t₁.Y must equal t₂.Y",
        "If t₁.X ≠ t₂.X, then t₁.Y must equal t₂.Y",
        "Attributes in Y must always be a subset of X",
        "The relation must contain zero duplicate tuples across all attributes"
      ],
      correctAnswer: "If t₁.X = t₂.X, then t₁.Y must equal t₂.Y",
      explanation: "A functional dependency X → Y dictates that the determinant X uniquely determines the dependent Y. Whenever two rows agree on X, they must agree on Y.",
      distractorsExplanation: "Option B inverts the logic. Option C defines a trivial dependency rather than the general FD condition."
    },
    {
      id: "q-dbms-2",
      topic: "FD Types",
      difficulty: "medium",
      question: "Which of the following represents a Trivial Functional Dependency according to relational theory?",
      options: [
        "{Roll_No, Name} → Name",
        "Roll_No → Name",
        "Course_ID → Department_Name",
        "{Student_ID} → {GPA, Semester}"
      ],
      correctAnswer: "{Roll_No, Name} → Name",
      explanation: "An FD X → Y is trivial if and only if Y ⊆ X. Here, {Name} is a subset of {Roll_No, Name}, making it trivial.",
      distractorsExplanation: "In all other choices, the right-hand attribute is not contained in the left-hand determinant set."
    },
    {
      id: "q-dbms-3",
      topic: "Armstrong's Axioms",
      difficulty: "medium",
      question: "According to Armstrong's Axioms, what does the Augmentation Rule state?",
      options: [
        "If X → Y holds, then XZ → YZ for any attribute set Z",
        "If X → Y and Y → Z, then X → Z",
        "If Y ⊆ X, then X → Y",
        "If X → YZ, then X → Y and X → Z"
      ],
      correctAnswer: "If X → Y holds, then XZ → YZ for any attribute set Z",
      explanation: "Augmentation ensures that adding an attribute set Z to both sides of an existing functional dependency produces a valid dependency.",
      distractorsExplanation: "Option B is Transitivity, Option C is Reflexivity, and Option D is Decomposition."
    },
    {
      id: "q-dbms-4",
      topic: "FD Types",
      difficulty: "hard",
      question: "When is a functional dependency X → Y classified as 'Completely Non-Trivial'?",
      options: [
        "When X ∩ Y = ∅ (X and Y share zero common attributes)",
        "When Y ⊆ X (Y is a subset of X)",
        "When X is guaranteed to be the primary key",
        "When the dependency cannot be inferred using Armstrong's Axioms"
      ],
      correctAnswer: "When X ∩ Y = ∅ (X and Y share zero common attributes)",
      explanation: "An FD is completely non-trivial if the intersection of determinant X and dependent Y is empty (no shared attributes).",
      distractorsExplanation: "When Y ⊆ X it is trivial. A dependency can always be analyzed via Armstrong's Axioms."
    }
  ];

  const presentationSlides = [
    {
      slideNumber: 1,
      title: "DBMS: Functional Dependencies & Normalization",
      bullets: [
        "Relation Schema R: Blueprint defining attributes and domain constraints",
        "Functional Dependency X → Y: Integrity constraint governing tuple consistency",
        "Determinant (X) uniquely defines Dependent (Y)"
      ],
      takeaway: "Functional dependencies form the mathematical foundation for database normalization."
    },
    {
      slideNumber: 2,
      title: "Taxonomy of Functional Dependencies",
      bullets: [
        "Trivial FD: Y ⊆ X (inherently satisfied in all relations)",
        "Non-Trivial FD: Y ⊄ X (conveys substantive semantic constraints)",
        "Completely Non-Trivial: X ∩ Y = ∅ (zero overlapping attributes)"
      ],
      takeaway: "Non-trivial dependencies must be verified against relation instances and schema rules."
    },
    {
      slideNumber: 3,
      title: "Armstrong's Inference Axioms",
      bullets: [
        "Reflexivity: Y ⊆ X ⇒ X → Y",
        "Augmentation: X → Y ⇒ XZ → YZ",
        "Transitivity: X → Y, Y → Z ⇒ X → Z",
        "Derived Rules: Union and Decomposition"
      ],
      takeaway: "Armstrong's Axioms are sound and complete for deriving all valid functional dependencies."
    },
    {
      slideNumber: 4,
      title: "Exam Review: Normal Forms & Keys",
      bullets: [
        "Compute Attribute Closure X⁺ to identify Super Keys",
        "Candidate Key: Minimal Super Key with no extraneous attributes",
        "BCNF: Determinant must be a Super Key for every non-trivial FD",
        "3NF: Allows non-super-key determinant if dependent is prime"
      ],
      takeaway: "Master attribute closure algorithms to quickly solve key determination and normal form exam problems."
    }
  ];

  const studyTips = [
    "Exam Trick: When verifying X → Y on table data, sort or group by attribute set X. If any group contains different Y values, the FD fails.",
    "Closure Algorithm: Always start with X⁺ = X, then iteratively add attributes from the right-hand side of any FD whose determinant is already in X⁺.",
    "Trap Alert: Remember that trivial dependencies (Y ⊆ X) always hold regardless of the instance data."
  ];

  return {
    title,
    summary: rescueSummary,
    deepSummary,
    keyPoints,
    definitions,
    subtopics: [
      "Functional Dependency Definition",
      "Trivial vs Non-Trivial FDs",
      "Armstrong's Axioms",
      "Attribute Closure & Keys",
      "Schema Normalization (BCNF & 3NF)"
    ],
    flashcards,
    quiz,
    presentationSlides,
    studyTips,
    source: "demo-mode",
    note: "Generated using Pocket Mentor Grounded Offline Engine."
  };
}

/**
 * Domain Pack: Computer Networks (OSI Model & TCP/IP Architecture)
 */
function getCnStudyPack(mode = 'fresh') {
  const isVariation = mode === 'variation';
  const title = "Computer Networks: OSI 7-Layer Architecture & Protocols";

  const rescueSummary = `⚡ **60-SECOND RESCUE SUMMARY: OSI Model & Network Architecture**

• **Core Architecture**: The OSI 7-layer reference model standardizes network communication into distinct abstraction layers: Physical, Data Link, Network, Transport, Session, Presentation, and Application.
• **Key Layer Functions**:
  - **Data Link Layer (DLL)**: Node-to-node framing, physical addressing (MAC), error detection (CRC), and flow control (Sliding Window).
  - **Network Layer**: End-to-end packet delivery, logical addressing (IPv4/IPv6), and routing algorithms (OSPF, BGP).
  - **Transport Layer**: End-to-end process-to-process communication, connection management (TCP 3-way handshake), and reliability.
• **TCP vs UDP**: TCP is connection-oriented, reliable, and provides flow & congestion control. UDP is connectionless, unreliable, and offers low overhead for real-time streaming.
• **Exam Alert**: Data encapsulation adds headers going down the protocol stack (Application → Physical); decapsulation strips headers going up the stack!`;

  const deepSummary = `### Comprehensive Topic Analysis: Computer Networks & OSI Model

#### 1. The 7 OSI Layers & Responsibilities:
1. **Physical Layer**: Bit transmission over physical media; deals with voltage levels, bit timing, and mechanical connectors.
2. **Data Link Layer (DLL)**: Transfers frames between adjacent nodes; performs MAC addressing, framing, and CRC error checking.
3. **Network Layer**: Delivers packets from source host to destination host; handles logical IP addressing and shortest-path routing.
4. **Transport Layer**: Port-to-port multiplexing, flow control, and end-to-end error recovery (TCP, UDP).
5. **Session Layer**: Dialog control, session establishment, checkpointing, and token management.
6. **Presentation Layer**: Data formatting, character encoding (ASCII/Unicode), encryption/decryption, and compression.
7. **Application Layer**: Direct interface for end-user applications (HTTP, DNS, SMTP, FTP).

#### 2. Flow & Error Control Mechanisms:
- **Stop-and-Wait**: Sender transmits one frame and waits for acknowledgment (ACK) before transmitting the next.
- **Sliding Window**: Allows sender to transmit multiple frames up to window size $W$ before waiting for ACK (Go-Back-N, Selective Repeat).

#### 3. High-Yield Exam Takeaways:
- **PDU Hierarchy**: Application (Message) → Transport (Segment) → Network (Packet) → Data Link (Frame) → Physical (Bits).
- **Subnet Formula**: Usable hosts = $2^{(32 - \\text{prefix})} - 2$ (excluding network and broadcast addresses).`;

  const keyPoints = [
    "OSI 7 Layers from bottom to top: Physical, Data Link, Network, Transport, Session, Presentation, Application.",
    "Protocol Data Units (PDUs): Bits (Physical), Frames (Data Link), Packets (Network), Segments (Transport), Data/Messages (Application).",
    "Transport Layer Distinction: TCP is connection-oriented, ordered, and reliable; UDP is connectionless and low-overhead.",
    "Data Link Layer deals with hop-to-hop physical MAC addresses; Network Layer handles end-to-end logical IP addresses.",
    "Encapsulation appends protocol headers as data moves down; Decapsulation removes headers as data moves up."
  ];

  const definitions = [
    {
      term: "Protocol Data Unit (PDU)",
      definition: "The specific unit of data specified in an architectural layer protocol (Bits, Frames, Packets, Segments).",
      example: "A router processes Network-layer Packets, while a switch processes Data Link-layer Frames."
    },
    {
      term: "Sliding Window Protocol",
      definition: "A flow control protocol allowing a sender to transmit multiple frames before receiving an acknowledgment, maximizing bandwidth.",
      example: "Go-Back-N ARQ and Selective Repeat ARQ."
    },
    {
      term: "TCP 3-Way Handshake",
      definition: "The connection establishment process in TCP using SYN, SYN-ACK, and ACK packets to synchronize sequence numbers.",
      example: "Client sends SYN, Server replies SYN-ACK, Client sends ACK."
    },
    {
      term: "Encapsulation",
      definition: "The process of wrapping lower-layer protocol headers and trailers around higher-layer data as it travels down the stack.",
      example: "An IP packet is encapsulated inside an Ethernet frame with source and destination MAC headers."
    }
  ];

  const flashcards = [
    {
      id: "fc-cn-1",
      question: "Which OSI layer is responsible for end-to-end process-to-process communication and port addressing?",
      answer: "The Transport Layer (Layer 4).",
      topic: "OSI Layers",
      difficulty: "easy",
      repetitionLevel: 0,
      nextReviewDate: new Date(Date.now() + 86400000).toISOString()
    },
    {
      id: "fc-cn-2",
      question: "What are the Protocol Data Units (PDUs) for Layers 1 through 4 of the OSI model?",
      answer: "Layer 1 (Physical): Bits; Layer 2 (Data Link): Frames; Layer 3 (Network): Packets; Layer 4 (Transport): Segments.",
      topic: "OSI Architecture",
      difficulty: "medium",
      repetitionLevel: 0,
      nextReviewDate: new Date(Date.now() + 86400000).toISOString()
    },
    {
      id: "fc-cn-3",
      question: "What is the primary operational difference between TCP and UDP?",
      answer: "TCP is connection-oriented, reliable, and guarantees in-order delivery; UDP is connectionless, unreliable, and has low latency.",
      topic: "Transport Protocols",
      difficulty: "easy",
      repetitionLevel: 0,
      nextReviewDate: new Date(Date.now() + 86400000).toISOString()
    },
    {
      id: "fc-cn-4",
      question: "What mechanism does the Data Link Layer use to prevent a fast sender from overwhelming a slow receiver?",
      answer: "Flow Control (e.g., Stop-and-Wait or Sliding Window protocols).",
      topic: "Data Link Protocols",
      difficulty: "medium",
      repetitionLevel: 0,
      nextReviewDate: new Date(Date.now() + 86400000).toISOString()
    },
    {
      id: "fc-cn-5",
      question: "Which layer performs encryption, decryption, compression, and character syntax translation?",
      answer: "The Presentation Layer (Layer 6).",
      topic: "OSI Layers",
      difficulty: "hard",
      repetitionLevel: 0,
      nextReviewDate: new Date(Date.now() + 86400000).toISOString()
    }
  ];

  const quiz = [
    {
      id: "q-cn-1",
      topic: "OSI Layers",
      difficulty: "easy",
      question: "Which layer of the OSI reference model handles physical MAC addressing and framing?",
      options: [
        "Data Link Layer",
        "Network Layer",
        "Transport Layer",
        "Physical Layer"
      ],
      correctAnswer: "Data Link Layer",
      explanation: "The Data Link Layer (Layer 2) divides network layer data into frames and uses physical MAC addresses for node-to-node transmission.",
      distractorsExplanation: "Network layer handles logical IP addresses, Transport handles port numbers, and Physical handles raw bit timing."
    },
    {
      id: "q-cn-2",
      topic: "Transport Protocols",
      difficulty: "medium",
      question: "What three packets constitute the standard TCP connection establishment handshake?",
      options: [
        "SYN, SYN-ACK, ACK",
        "ACK, FIN, RST",
        "PING, ECHO, ACK",
        "INIT, READY, START"
      ],
      correctAnswer: "SYN, SYN-ACK, ACK",
      explanation: "TCP uses a three-way handshake: the client sends SYN, the server responds with SYN-ACK, and the client confirms with ACK.",
      distractorsExplanation: "FIN/RST are for termination. PING/ECHO belong to ICMP."
    },
    {
      id: "q-cn-3",
      topic: "Network Layer",
      difficulty: "medium",
      question: "What is the primary responsibility of the Network Layer (Layer 3)?",
      options: [
        "Host-to-host packet routing and logical IP addressing",
        "Bit-level voltage and synchronization control",
        "Port multiplexing and socket stream management",
        "Data compression and SSL/TLS encryption"
      ],
      correctAnswer: "Host-to-host packet routing and logical IP addressing",
      explanation: "The Network Layer routes packets across interconnected networks using logical addresses (IPv4/IPv6).",
      distractorsExplanation: "Voltage is Physical, port multiplexing is Transport, and encryption is Presentation."
    },
    {
      id: "q-cn-4",
      topic: "OSI Architecture",
      difficulty: "hard",
      question: "In the OSI model, what term describes the process of adding headers to user data as it traverses down the stack?",
      options: [
        "Encapsulation",
        "Decapsulation",
        "Fragmentation",
        "Multiplexing"
      ],
      correctAnswer: "Encapsulation",
      explanation: "Encapsulation wraps layer-specific protocol control information (headers and trailers) around higher-layer data units.",
      distractorsExplanation: "Decapsulation strips headers going up. Fragmentation breaks packets into smaller sizes."
    }
  ];

  const presentationSlides = [
    {
      slideNumber: 1,
      title: "Computer Networks: OSI Reference Model",
      bullets: [
        "7-Layer layered abstraction architecture",
        "Standardized protocol boundaries and interfaces",
        "PDU hierarchy from Bits to Application Messages"
      ],
      takeaway: "Layering isolates functions so changes in one layer do not require changes in other layers."
    },
    {
      slideNumber: 2,
      title: "Lower Layers: Physical & Data Link",
      bullets: [
        "Physical: Voltage, bit timing, and network media",
        "Data Link: Framing, CRC error detection, and MAC addressing",
        "Flow control via Stop-and-Wait and Sliding Window"
      ],
      takeaway: "The Data Link Layer ensures reliable hop-to-hop transmission between adjacent nodes."
    },
    {
      slideNumber: 3,
      title: "Internetworking: Network & Transport",
      bullets: [
        "Network Layer: IP addressing, subnetting, and routing protocols",
        "Transport Layer: End-to-end delivery via TCP and UDP",
        "TCP 3-way handshake and congestion avoidance"
      ],
      takeaway: "TCP provides reliability over unreliable IP network layer delivery."
    },
    {
      slideNumber: 4,
      title: "Summary & Exam Review",
      bullets: [
        "Remember the mnemonic: Please Do Not Throw Sausage Pizza Away",
        "Distinguish hop-to-hop (MAC) from end-to-end (IP and Ports)",
        "Review subnet masking and usable host calculations"
      ],
      takeaway: "Master PDU mappings and layer functions for rapid exam score maximization."
    }
  ];

  const studyTips = [
    "Mnemonic Trick: Physical, Data Link, Network, Transport, Session, Presentation, Application ('Please Do Not Throw Sausage Pizza Away').",
    "Exam Trap: Don't confuse MAC address (Layer 2 hop-to-hop) with IP address (Layer 3 end-to-end) or Port numbers (Layer 4 process-to-process).",
    "Calculation Rule: For /24 subnet, 256 total addresses - 2 reserved (network and broadcast) = 254 usable host addresses."
  ];

  return {
    title,
    summary: rescueSummary,
    deepSummary,
    keyPoints,
    definitions,
    subtopics: [
      "OSI 7-Layer Hierarchy",
      "Data Link Framing & MAC",
      "Network Layer IP Routing",
      "Transport Layer TCP vs UDP",
      "Data Encapsulation"
    ],
    flashcards,
    quiz,
    presentationSlides,
    studyTips,
    source: "demo-mode",
    note: "Generated using Pocket Mentor Grounded Offline Engine."
  };
}

/**
 * Domain Pack: Operating Systems (Memory Management, Paging, Consensus)
 */
function getOsStudyPack(mode = 'fresh') {
  const title = "Operating Systems: Memory Management & Paging";

  const rescueSummary = `⚡ **60-SECOND RESCUE SUMMARY: Memory Management & Paging**

• **Core Concept**: Paging eliminates external fragmentation by partitioning a process's virtual address space into fixed-size chunks called **pages**, and physical memory into identical fixed-size blocks called **frames**.
• **Address Translation**: The CPU generates a logical address split into a Page Number ($p$) and a Page Offset ($d$). The Page Table maps page number $p$ to physical frame number $f$, producing physical address $(f \\times \\text{frame size}) + d$.
• **Page Fault Handling**: When a process references a page marked invalid in the Page Table (not in RAM), the MMU triggers a Page Fault interrupt. The OS swaps the required page from disk into a free physical frame, updates the valid bit, and restarts the trapped instruction.
• **TLB Acceleration**: The Translation Lookaside Buffer (TLB) is an associative hardware cache that caches recent page-to-frame translations, reducing memory lookups from 2 accesses to 1 on a TLB hit!`;

  const deepSummary = `### Comprehensive Topic Analysis: Operating Systems Memory Management

#### 1. Paging Architecture & Translation:
- **Logical Address Space**: Divided into Pages of size $2^m$ bytes.
- **Physical Memory**: Divided into Frames of identical size.
- **Address Breakdown**:
  - Higher bits: Page Number ($p$), used as an index into the process page table.
  - Lower bits: Page Offset ($d$), specifies the exact byte within the page.
- **Physical Address**: $\\text{Frame Number } f \\parallel \\text{Offset } d$.

#### 2. Translation Lookaside Buffer (TLB):
- Hardware associative memory storing active page-table entries.
- **Effective Access Time (EAT)**:
  $$\\text{EAT} = \\alpha \\times (\\text{TLB access} + \\text{RAM access}) + (1 - \\alpha) \\times (\\text{TLB access} + 2 \\times \\text{RAM access})$$
  where $\\alpha$ is the TLB hit ratio.

#### 3. Page Fault Service Routine:
1. Trap to operating system kernel.
2. Verify logical address is valid within process address space.
3. Locate a free physical frame (or run Page Replacement Algorithm: FIFO, LRU, Optimal).
4. Issue disk I/O to read missing page into allocated frame.
5. Update process Page Table (set frame number and valid bit = 1).
6. Restart the instruction that caused the trap.`;

  const keyPoints = [
    "Paging eliminates external fragmentation by allowing noncontiguous physical memory allocation.",
    "Address translation maps logical page number (p) to physical frame number (f) via the Page Table.",
    "Page Fault: Triggered by the MMU when a referenced page is not present in RAM (valid/invalid bit is 0).",
    "TLB: High-speed associative hardware cache that eliminates redundant memory accesses for page table lookups.",
    "Page replacement algorithms (FIFO, LRU, Clock) determine which frame to evict when memory is full."
  ];

  const definitions = [
    {
      term: "Page vs Frame",
      definition: "A page is a fixed-sized block of logical/virtual memory; a frame is an identical-sized block of physical RAM.",
      example: "A 4KB virtual page is loaded into any available 4KB physical frame."
    },
    {
      term: "Page Fault",
      definition: "A hardware interrupt raised by the Memory Management Unit (MMU) when accessing a page with an invalid bit.",
      example: "The OS traps, retrieves the page from backing store (disk), and updates the page table."
    },
    {
      term: "Translation Lookaside Buffer (TLB)",
      definition: "A fast associative hardware cache that stores recent virtual-to-physical address mappings.",
      example: "A 95% TLB hit ratio drastically lowers Effective Memory Access Time."
    },
    {
      term: "Belady's Anomaly",
      definition: "A phenomenon where increasing the number of page frames leads to an increased number of page faults under FIFO replacement.",
      example: "FIFO replacement exhibiting more faults with 4 frames than with 3 frames."
    }
  ];

  const flashcards = [
    {
      id: "fc-os-1",
      question: "What type of memory fragmentation is completely eliminated by paging?",
      answer: "External fragmentation (though internal fragmentation can still occur in the final page).",
      topic: "Memory Management",
      difficulty: "easy",
      repetitionLevel: 0,
      nextReviewDate: new Date(Date.now() + 86400000).toISOString()
    },
    {
      id: "fc-os-2",
      question: "What are the two parts of a CPU-generated logical address in a paged memory system?",
      answer: "Page Number (p) and Page Offset (d).",
      topic: "Address Translation",
      difficulty: "easy",
      repetitionLevel: 0,
      nextReviewDate: new Date(Date.now() + 86400000).toISOString()
    },
    {
      id: "fc-os-3",
      question: "What steps does the operating system take when a Page Fault occurs?",
      answer: "Traps to kernel, finds a free frame, loads page from disk, updates page table valid bit to 1, and restarts the instruction.",
      topic: "Virtual Memory",
      difficulty: "medium",
      repetitionLevel: 0,
      nextReviewDate: new Date(Date.now() + 86400000).toISOString()
    },
    {
      id: "fc-os-4",
      question: "What is the function of the Translation Lookaside Buffer (TLB)?",
      answer: "It acts as a hardware cache for recent virtual-to-physical address mappings to avoid multiple RAM accesses per translation.",
      topic: "TLB & Hardware",
      difficulty: "medium",
      repetitionLevel: 0,
      nextReviewDate: new Date(Date.now() + 86400000).toISOString()
    },
    {
      id: "fc-os-5",
      question: "Which page replacement algorithm suffers from Belady's Anomaly?",
      answer: "FIFO (First-In, First-Out) page replacement algorithm.",
      topic: "Page Replacement",
      difficulty: "hard",
      repetitionLevel: 0,
      nextReviewDate: new Date(Date.now() + 86400000).toISOString()
    }
  ];

  const quiz = [
    {
      id: "q-os-1",
      topic: "Memory Management",
      difficulty: "easy",
      question: "In paged memory management, what is the relationship between page size and frame size?",
      options: [
        "Page size must exactly equal physical frame size",
        "Frame size is always twice the page size",
        "Page size depends dynamically on process execution time",
        "Frame size is variable to prevent internal fragmentation"
      ],
      correctAnswer: "Page size must exactly equal physical frame size",
      explanation: "Pages and frames must be of identical fixed size so that any logical page can be accommodated by any free physical frame.",
      distractorsExplanation: "Different sizes would prevent seamless mapping and create complex fragmentation."
    },
    {
      id: "q-os-2",
      topic: "Address Translation",
      difficulty: "medium",
      question: "If a 32-bit system uses 4 KB (2¹²) pages, how many bits are used for the page offset (d)?",
      options: [
        "12 bits",
        "20 bits",
        "16 bits",
        "32 bits"
      ],
      correctAnswer: "12 bits",
      explanation: "Page size of 4 KB = 4096 bytes = 2¹² bytes. Therefore, 12 bits are required for the page offset, leaving 32 - 12 = 20 bits for the page number.",
      distractorsExplanation: "20 bits is the page number. 16 and 32 bits are incorrect offset sizes."
    },
    {
      id: "q-os-3",
      topic: "Virtual Memory",
      difficulty: "medium",
      question: "When does a Page Fault trap occur during program execution?",
      options: [
        "When the referenced page has a valid/invalid bit set to 0 (not in physical RAM)",
        "When the CPU encounters a division by zero error",
        "When the process finishes execution normally",
        "When a TLB hit occurs on the primary instruction"
      ],
      correctAnswer: "When the referenced page has a valid/invalid bit set to 0 (not in physical RAM)",
      explanation: "A page fault is raised by the MMU hardware when the valid bit is 0, indicating the page is on disk rather than in physical memory.",
      distractorsExplanation: "Division by zero is an arithmetic exception. TLB hit avoids traps entirely."
    },
    {
      id: "q-os-4",
      topic: "Page Replacement",
      difficulty: "hard",
      question: "What is Belady's Anomaly in operating systems?",
      options: [
        "Increasing the number of physical frames causes more page faults in FIFO",
        "Increasing TLB size slows down CPU instruction cycles",
        "LRU algorithm performing worse than Random replacement",
        "A deadlock scenario caused by unreleased mutex semaphores"
      ],
      correctAnswer: "Increasing the number of physical frames causes more page faults in FIFO",
      explanation: "Belady's Anomaly describes situations where giving a process more memory frames unexpectedly increases its total page fault rate under FIFO.",
      distractorsExplanation: "Stack-based algorithms like LRU and Optimal are immune to Belady's Anomaly."
    }
  ];

  const presentationSlides = [
    {
      slideNumber: 1,
      title: "Operating Systems: Paging & Virtual Memory",
      bullets: [
        "Elimination of external fragmentation",
        "Non-contiguous allocation in physical RAM",
        "Division into Pages (logical) and Frames (physical)"
      ],
      takeaway: "Paging decouples the programmer's logical address space from physical RAM constraints."
    },
    {
      slideNumber: 2,
      title: "Address Translation & Page Tables",
      bullets: [
        "CPU generates logical address (Page p, Offset d)",
        "Page table lookup translates p to Frame f",
        "Physical address = f concatenated with offset d"
      ],
      takeaway: "Address translation is performed completely in hardware by the MMU."
    },
    {
      slideNumber: 3,
      title: "Performance Acceleration: TLB",
      bullets: [
        "Translation Lookaside Buffer caches recent translations",
        "TLB Hit: Instant translation without extra memory lookup",
        "TLB Miss: Fall back to Page Table in main memory"
      ],
      takeaway: "High TLB hit rates are critical for modern system performance."
    },
    {
      slideNumber: 4,
      title: "Page Fault Handling & Replacement",
      bullets: [
        "MMU detects invalid bit and traps to kernel",
        "OS loads required page from backing disk store",
        "Replacement policies: FIFO, LRU, and Optimal"
      ],
      takeaway: "Effective page replacement balances I/O overhead against thrashing."
    }
  ];

  const studyTips = [
    "Calculation Rule: Offset bits = log₂(Page Size in bytes). For 8KB pages, offset = 13 bits.",
    "Exam Trick: LRU and Optimal never suffer from Belady's Anomaly because they belong to the class of stack algorithms.",
    "Effective Access Time: Always verify whether memory access time includes or excludes TLB lookup time in problem statements."
  ];

  return {
    title,
    summary: rescueSummary,
    deepSummary,
    keyPoints,
    definitions,
    subtopics: [
      "Paging Principles",
      "Address Translation & Offset",
      "Page Fault Handler",
      "TLB Cache & Hit Ratio",
      "Page Replacement & Belady's Anomaly"
    ],
    flashcards,
    quiz,
    presentationSlides,
    studyTips,
    source: "demo-mode",
    note: "Generated using Pocket Mentor Grounded Offline Engine."
  };
}

/**
 * Universal Generic Study Pack for student notes that do not match predefined domains
 */
function getGenericStudyPack(rawNotes, mode = 'fresh') {
  const isVariation = mode === 'variation';

  // 1. Strip all banner lines and noise
  const lines = (rawNotes || '')
    .replace(/\uFFFD/g, '')
    .split('\n')
    .map(l => l.trim())
    .filter(l => l.length > 0 && !isBannerOrNoiseLine(l));

  // 2. Extract clean title
  const candidateTitleLine = lines.find(l => {
    const stripped = l.replace(/^[#\-*=>~`\s]+/, '').trim();
    const alphaCount = (stripped.match(/[a-zA-Z]/g) || []).length;
    return stripped.length >= 4 && alphaCount >= 4 && !isBannerOrNoiseLine(l);
  }) || "Class Lecture Notes";

  const titleGuess = sanitizeTitle(candidateTitleLine, "Class Lecture Notes");

  // 3. Extract meaningful sentences
  const statements = [];
  lines.forEach(line => {
    const stripped = line.replace(/^(\d+[\.\)]|[-*•])\s*/, '').trim();
    if (stripped.length > 15 && !isBannerOrNoiseLine(stripped)) {
      const sentences = stripped.split(/(?<=[.?!])\s+/).map(s => s.trim()).filter(s => s.length > 15);
      if (sentences.length > 0) {
        statements.push(...sentences);
      } else {
        statements.push(stripped);
      }
    }
  });

  const mainSentences = statements.length > 0 ? statements.slice(0, 10) : [
    `Core principles and fundamental mechanisms of ${titleGuess}.`,
    `Structured operational rules and key properties governing this topic.`,
    `Critical constraints, conditions, and boundary validations required.`,
    `Key distinctions, applications, and problem-solving methodologies.`
  ];

  // 4. Extract terms & definitions with strict validation
  const termMatches = [];
  const seenTerms = new Set();

  // Pattern 1: Colon / Dash definitions (e.g. Term: Definition)
  const colonRegex = /(?:^|\n)\s*(?:\d+[\.\)]\s*|[-*•]\s*)?\*?\*?([A-Za-z0-9\s-]{3,35})\*?\*?\s*[:\-–—]\s*([^\n\r]+)/g;
  let match;
  while ((match = colonRegex.exec(rawNotes)) !== null && termMatches.length < 6) {
    const t = match[1].trim().replace(/^(\d+[\.\)]|[-*•])\s*/, '').trim();
    const d = match[2].trim().replace(/^[-*•\s]+/, '');
    if (isValidTerm(t) && !seenTerms.has(t.toLowerCase()) && d.length > 12 && !isBannerOrNoiseLine(d)) {
      seenTerms.add(t.toLowerCase());
      termMatches.push({
        term: t,
        definition: d.length > 180 ? d.slice(0, 177) + '...' : d,
        example: `Syllabus application: Direct definition question on ${t}.`
      });
    }
  }

  // Pattern 2: "X is defined as / refers to / means Y"
  const isRegex = /([A-Z][A-Za-z0-9\s-]{2,28})\s+(?:is defined as|refers to|means|is characterized by)\s+([^.?!;\n]{15,180})/g;
  while ((match = isRegex.exec(rawNotes)) !== null && termMatches.length < 6) {
    const t = match[1].trim().replace(/^(\d+[\.\)]|[-*•])\s*/, '').trim();
    const d = match[2].trim();
    if (isValidTerm(t) && !seenTerms.has(t.toLowerCase()) && d.length > 12 && !isBannerOrNoiseLine(d)) {
      seenTerms.add(t.toLowerCase());
      termMatches.push({
        term: t,
        definition: d.length > 180 ? d.slice(0, 177) + '...' : d,
        example: `Foundational property of ${t} as stated in the notes.`
      });
    }
  }

  // Fallback term extraction
  if (termMatches.length < 3) {
    mainSentences.forEach((s) => {
      if (termMatches.length < 4) {
        const words = s.split(/\s+/).filter(w => w.length > 2);
        if (words.length >= 3) {
          const candidateTerm = words.slice(0, Math.min(3, words.length)).join(' ').replace(/^[#*-•\s]+/, '').replace(/[:.,]$/, '');
          if (isValidTerm(candidateTerm) && !seenTerms.has(candidateTerm.toLowerCase())) {
            seenTerms.add(candidateTerm.toLowerCase());
            termMatches.push({
              term: candidateTerm,
              definition: s,
              example: `Directly excerpted from the lecture material on ${titleGuess}.`
            });
          }
        }
      }
    });
  }

  // Guarantee at least two valid terms
  if (termMatches.length === 0) {
    termMatches.push({
      term: titleGuess,
      definition: mainSentences[0] || `The core foundational concept presented in the lecture notes.`,
      example: `Primary exam focus for ${titleGuess}.`
    });
  }
  if (termMatches.length < 2) {
    termMatches.push({
      term: "Operational Principle",
      definition: mainSentences[1] || `The structured mechanism and operational rules governing ${titleGuess}.`,
      example: `Core mechanics and exam conditions for ${titleGuess}.`
    });
  }

  const t1 = termMatches[0].term;
  const d1 = termMatches[0].definition;
  const t2 = termMatches[1].term;
  const d2 = termMatches[1].definition;
  const t3 = termMatches[2] ? termMatches[2].term : "Boundary Constraints";
  const d3 = termMatches[2] ? termMatches[2].definition : (mainSentences[2] || `Ensure verified boundary conditions are met.`);

  // Formatted 60-Second Rescue Summary with markdown bullet points
  const rescueSummary = `⚡ **60-SECOND RESCUE SUMMARY: ${titleGuess}**

• **Core Concept**: ${mainSentences[0] || `These notes establish the foundational principles of ${titleGuess}.`}
• **Key Principle (${t1})**: ${d1}
• **Operational Mechanism (${t2})**: ${d2}
• **Exam Alert**: Master the precise definitions of **${t1}** and **${t2}**, verify all stated operational rules, and watch for condition boundaries during problem solving.`;

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

  const keyPoints = [
    `Primary Focus: ${titleGuess} - ${mainSentences[0] || 'Core principles and definitions.'}`,
    `Key Definition (${t1}): ${d1}`,
    `Core Mechanism (${t2}): ${d2}`,
    mainSentences[2] ? `Operational Rule: ${mainSentences[2]}` : `Constraint Verification: Ensure boundary conditions are maintained.`,
    `Exam Takeaway: Ensure accurate retrieval of definitions and mechanisms for ${titleGuess}.`
  ];

  const flashcards = [
    {
      id: "fc-gen-1",
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
      id: "fc-gen-2",
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
      id: "fc-gen-3",
      question: isVariation
        ? `Which condition, formula, or constraint is explicitly highlighted for "${t3}"?`
        : `What key rule or principle is stated regarding: "${t3}"?`,
      answer: d3,
      topic: `${t2} - Operations`,
      difficulty: "hard",
      repetitionLevel: 0,
      nextReviewDate: new Date(Date.now() + 86400000).toISOString()
    },
    {
      id: "fc-gen-4",
      question: isVariation
        ? `How is "${t1}" related to or distinguished within ${titleGuess}?`
        : `What is the significance of "${t1}" according to the uploaded material?`,
      answer: d1,
      topic: `${titleGuess} - Exam Rules`,
      difficulty: "medium",
      repetitionLevel: 0,
      nextReviewDate: new Date(Date.now() + 86400000).toISOString()
    },
    {
      id: "fc-gen-5",
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

  const distractorA = d2 !== d1 ? d2 : `It operates arbitrarily without following the conditions specified in the notes.`;
  const distractorB = d3 !== d1 && d3 !== d2 ? d3 : `It completely reverses the operational mechanism described in the text.`;
  const distractorC = `It functions unconditionally without any verified parameters or boundary checks.`;

  const quiz = [
    {
      id: "q-gen-1",
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
      distractorsExplanation: `The other options confuse ${t1} with other mechanisms or state inaccurate unconstrained conditions.`
    },
    {
      id: "q-gen-2",
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
      id: "q-gen-3",
      topic: `${t2} - Operations`,
      difficulty: "hard",
      question: `Which key rule, mechanism, or property is highlighted regarding "${t3}"?`,
      options: [
        `It operates randomly without deterministic rules or sequential order`,
        `It eliminates all structural constraints unconditionally`,
        d3,
        `It invalidates all previously established definitions of ${t1}`
      ],
      correctAnswer: d3,
      explanation: `The lecture material specifically notes: "${d3}".`,
      distractorsExplanation: `The other options mischaracterize the system as arbitrary or contradictory to foundational principles.`
    },
    {
      id: "q-gen-4",
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

  const presentationSlides = [
    {
      slideNumber: 1,
      title: `${titleGuess}: Overview`,
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
    subtopics: [
      `${titleGuess} - Overview`,
      `${t1} - Mechanics`,
      `${t2} - Operations`,
      `${titleGuess} - Exam Rules`
    ],
    flashcards,
    quiz,
    presentationSlides,
    studyTips,
    source: "demo-mode",
    note: "Generated using Pocket Mentor Grounded Offline Engine."
  };
}

/**
 * Main Revision Generator with domain detection and bulletproof fallback
 */
export function generateMockRevision(notes, mode = 'fresh') {
  const cleanNotes = (notes || '').replace(/\uFFFD/g, '');
  const lower = cleanNotes.toLowerCase();

  // 1. DBMS Detection
  if (
    lower.includes('functional depend') ||
    lower.includes('relation schema') ||
    lower.includes('armstrong') ||
    lower.includes('normalization') ||
    lower.includes('bcnf') ||
    lower.includes('3nf') ||
    (lower.includes('dbms') && (lower.includes('table') || lower.includes('tuple') || lower.includes('key') || lower.includes('attribute')))
  ) {
    return getDbmsStudyPack(mode);
  }

  // 2. Computer Networks Detection
  if (
    lower.includes('osi') ||
    lower.includes('tcp') ||
    lower.includes('datalink') ||
    lower.includes('sliding window') ||
    lower.includes('flow control') ||
    (lower.includes('network') && (lower.includes('layer') || lower.includes('packet') || lower.includes('router') || lower.includes('protocol')))
  ) {
    return getCnStudyPack(mode);
  }

  // 3. Operating Systems Detection
  if (
    lower.includes('paging') ||
    lower.includes('page fault') ||
    lower.includes('virtual memory') ||
    lower.includes('tlb') ||
    lower.includes('deadlock') ||
    lower.includes('byzantine fault') ||
    lower.includes('two-phase commit')
  ) {
    return getOsStudyPack(mode);
  }

  // 4. Universal Fallback
  return getGenericStudyPack(cleanNotes, mode);
}

/**
 * AI Notes Cleanup & Organization
 */
export function cleanMockNotes(rawNotes) {
  const lines = (rawNotes || '')
    .split('\n')
    .map(l => l.trim())
    .filter(l => l.length > 0 && !isBannerOrNoiseLine(l));

  const candidateTitle = lines.find(l => {
    const s = l.replace(/^[#\-*=>~`\s]+/, '').trim();
    return s.length >= 4 && (s.match(/[a-zA-Z]/g) || []).length >= 4;
  }) || "Organized Study Notes";

  const title = sanitizeTitle(candidateTitle, "Organized Study Notes");
  const bodyLines = lines.slice(1);

  let structuredMarkdown = `# 📚 ${title}\n\n`;
  structuredMarkdown += `## 🎯 Overview & Objectives\n`;
  structuredMarkdown += `These notes have been cleaned, deduplicated, and formatted into high-yield study structure for active exam revision.\n\n`;

  structuredMarkdown += `## 🔑 Core Concepts & Rules\n`;
  bodyLines.forEach((line) => {
    const cleaned = line.replace(/^[•\-*]\s*/, '').trim();
    if (cleaned.length > 0 && !isBannerOrNoiseLine(cleaned)) {
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

  // Check Computer Networks first (avoids false-matching 'notes' to dbms)
  if (lower.includes('cn') || lower.includes('network') || lower.includes('osi') || lower.includes('protocol') || lower.includes('subnet')) {
    return `# Computer Networks: OSI 7-Layer Model & Architecture

1. Physical Layer:
   - Transmits raw unstructured bitstreams over a physical transmission medium.
   - Deals with electrical, mechanical, and timing interfaces.

2. Data Link Layer (DLL):
   - Provides node-to-node data transfer and frame synchronization.
   - Handles Media Access Control (MAC), error detection (CRC), and flow control (Stop-and-Wait, Sliding Window).

3. Network Layer:
   - Responsible for host-to-host packet delivery, logical addressing (IPv4/IPv6), and path determination (Routing).
   - Key protocols: IP, ICMP, ARP, OSPF, BGP.

4. Transport Layer:
   - Provides end-to-end communication, connection establishment, and reliability.
   - TCP: Connection-oriented, reliable, provides flow control and congestion avoidance.
   - UDP: Connectionless, unreliable, low-overhead datagram protocol.

5. Application Layer:
   - Interfaces directly with end-user software applications (HTTP, DNS, SMTP, FTP).

Exam Rule: In the OSI model, data encapsulation adds headers going down the stack (Application to Physical), and decapsulation removes headers going up the stack.`;
  }

  if (lower.includes('bio') || lower.includes('photo')) {
    return `# Biology: Photosynthesis & Light Reactions

1. Photolysis of Water:
   - 2H2O -> 4H+ + 4e- + O2 (in thylakoid lumen)
   - Generates proton gradient driving ATP synthase.

2. Calvin Cycle Key Reactions:
   - RuBisCO fixes CO2 into 3-Phosphoglycerate (3-PGA).
   - Requires ATP & NADPH synthesized during light reactions.

Exam Trap: RuBisCO also reacts with O2 (photorespiration), which wastes energy!`;
  }

  if (lower.includes('econ') || lower.includes('market')) {
    return `# Economics: Market Equilibrium & Elasticity

1. Price Elasticity of Demand (PED):
   - PED = (% Change in Quantity Demanded) / (% Change in Price)
   - Inelastic (|PED| < 1): Price increase raises total revenue.

2. Deadweight Loss:
   - Net loss of total surplus from tax, tariff, price ceilings or price floors.`;
  }

  if (lower.includes('dbms') || lower.includes('relation') || lower.includes('schema') || lower.includes('fd') || lower.includes('sql') || lower.includes('functional')) {
    return `# Database Management Systems: Functional Dependencies & Schema Normalization

1. Functional Dependency Definition:
   - Let R be the Relation Schema, X and Y be the attribute sets of Relation R, and t₁, t₂ be any two tuples such that:
   - X → Y
   - If t₁.x = t₂.x then t₁.y = t₂.y must be equal.
   - Rule: In X → Y, whenever an X value repeats, the corresponding Y value must be the same.

2. Types of Functional Dependencies:
   - Trivial Functional Dependency: X → Y is trivial if Y ⊆ X (e.g., {Roll_No, Name} → Name).
   - Non-Trivial Functional Dependency: X → Y is non-trivial if Y is not a subset of X (e.g., Roll_No → Name).
   - Completely Non-Trivial: X ∩ Y = ∅ (X and Y share zero common attributes).

3. Armstrong's Axioms (Inference Rules):
   - Reflexivity Rule: If Y ⊆ X, then X → Y.
   - Augmentation Rule: If X → Y, then XZ → YZ for any attribute set Z.
   - Transitivity Rule: If X → Y and Y → Z, then X → Z.
   - Union Rule: If X → Y and X → Z, then X → YZ.
   - Decomposition Rule: If X → YZ, then X → Y and X → Z.

Exam Rule: When testing Functional Dependency X → Y, always verify whether identical values in determinant attribute X lead to identical values in dependent attribute Y!`;
  }

  return `# Operating Systems & Distributed Consensus

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
  const lines = cleanNotes.split('\n').map(l => l.trim()).filter(l => l.length > 0 && !isBannerOrNoiseLine(l));
  const candidateTitle = lines.find(l => {
    const s = l.replace(/^[#\-*=>~`\s]+/, '').trim();
    return s.length >= 4 && (s.match(/[a-zA-Z]/g) || []).length >= 4;
  }) || 'Class Lecture Notes';
  const title = sanitizeTitle(candidateTitle, 'Class Lecture Notes');

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

