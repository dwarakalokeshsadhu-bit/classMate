import http from 'http';
import app from './index.js'; // Note: index.js listens on PORT if run directly, or exports app if imported

// Let's create an integration test runner that hits the server endpoints
async function runTests() {
  console.log('🧪 Starting Pocket Mentor API Integration Tests...');

  const BASE_URL = 'http://localhost:5000';

  // 1. Test Health endpoint
  console.log('\n--- 1. Testing GET /api/health ---');
  try {
    const res = await fetch(`${BASE_URL}/api/health`);
    const data = await res.json();
    console.log('✅ Health status:', data.status, '| Mode:', data.mode);
    if (data.status !== 'ok') throw new Error('Healthcheck status is not ok');
  } catch (err) {
    console.error('❌ Healthcheck failed:', err.message);
    process.exit(1);
  }

  // Sample notes for test
  const sampleNotes = `Operating Systems Lecture 12: Memory Management & Paging
- Paging solves external fragmentation by allowing physical address space to be noncontiguous.
- Physical memory is divided into fixed blocks called frames.
- Logical address is divided into page number (p) and page offset (d).
- Page Fault: occurs when CPU references an unmapped page. Kernel traps and swaps page from disk.`;

  // 2. Test Main Generate endpoint
  console.log('\n--- 2. Testing POST /api/generate ---');
  try {
    const res = await fetch(`${BASE_URL}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ notes: sampleNotes, mode: 'fresh' })
    });
    const json = await res.json();
    if (!json.success || !json.data) throw new Error('Generate endpoint did not return success=true');

    const data = json.data;
    console.log('✅ Title:', data.title);
    console.log('✅ 60s Summary length:', data.summary.length, 'chars');
    console.log('✅ Flashcards count:', data.flashcards.length);
    console.log('✅ Quiz questions count:', data.quiz.length);
    console.log('✅ Key points count:', data.keyPoints.length);
    console.log('✅ Definitions count:', data.definitions.length);
    console.log('✅ Presentation slides count:', data.presentationSlides.length);
    console.log('✅ Subtopics detected:', data.subtopics);

    // Verify quiz integrity
    const q1 = data.quiz[0];
    if (!q1.options.includes(q1.correctAnswer)) {
      throw new Error(`Integrity error: correctAnswer "${q1.correctAnswer}" not in options!`);
    }
    if (!q1.explanation) {
      throw new Error('Integrity error: Quiz question missing explanation!');
    }
    console.log('✅ Quiz schema integrity verified! Sample question:', q1.question.slice(0, 45) + '...');
  } catch (err) {
    console.error('❌ Generate failed:', err.message);
    process.exit(1);
  }

  // 3. Test Clean Notes endpoint
  console.log('\n--- 3. Testing POST /api/generate/clean ---');
  try {
    const res = await fetch(`${BASE_URL}/api/generate/clean`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ notes: 'messy notes: paging is cool. virtual memory. page faults occur.' })
    });
    const json = await res.json();
    if (!json.success || !json.cleanedNotes) throw new Error('Clean notes failed');
    console.log('✅ Cleaned notes preview:\n' + json.cleanedNotes.slice(0, 120) + '...');
  } catch (err) {
    console.error('❌ Clean notes failed:', err.message);
    process.exit(1);
  }

  // 4. Test OCR endpoint
  console.log('\n--- 4. Testing POST /api/generate/ocr ---');
  try {
    const res = await fetch(`${BASE_URL}/api/generate/ocr`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fileName: 'lecture_notes_page1.png' })
    });
    const json = await res.json();
    if (!json.success || !json.extractedText) throw new Error('OCR endpoint failed');
    console.log('✅ OCR extraction preview:\n' + json.extractedText.slice(0, 140) + '...');
  } catch (err) {
    console.error('❌ OCR failed:', err.message);
    process.exit(1);
  }

  // 5. Test AI Tutor Chat
  console.log('\n--- 5. Testing POST /api/generate/chat in multiple modes ---');
  const modesToTest = [
    { mode: 'simple', label: 'Explain Simply (ELI5)' },
    { mode: 'detailed', label: 'Deep Academic' },
    { mode: 'examples', label: 'Real-World Examples' },
    { mode: 'common_mistakes', label: 'Common Pitfalls' },
    { mode: 'diagram', label: 'Concept Diagram' }
  ];

  for (const item of modesToTest) {
    try {
      const res = await fetch(`${BASE_URL}/api/generate/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          notes: sampleNotes,
          message: 'What happens during a page fault?',
          mode: item.mode,
          language: 'English'
        })
      });
      const json = await res.json();
      if (!json.success || !json.response) throw new Error(`Chat in mode ${item.mode} failed`);
      console.log(`✅ Tutor mode [${item.label}]: response length = ${json.response.length} chars`);
    } catch (err) {
      console.error(`❌ Tutor mode ${item.mode} failed:`, err.message);
      process.exit(1);
    }
  }

  // 6. Test Study Plan & Countdown endpoint
  console.log('\n--- 6. Testing POST /api/generate/study-plan ---');
  try {
    const res = await fetch(`${BASE_URL}/api/generate/study-plan`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        notes: sampleNotes,
        examDate: '2026-09-18',
        daysLeft: 5,
        weakTopics: ['Page Table Address Translation']
      })
    });
    const json = await res.json();
    if (!json.success || !json.plan) throw new Error('Study plan failed');
    console.log('✅ Study Plan generated:');
    console.log('   Days:', json.plan.schedule.length);
    console.log('   Recommendation:', json.plan.recommendation);
    console.log('   Day 1 theme:', json.plan.schedule[0].title);
  } catch (err) {
    console.error('❌ Study plan failed:', err.message);
    process.exit(1);
  }

  console.log('\n🎉 ALL POCKET MENTOR API TESTS PASSED SUCCESSFULLY! 🎉\n');
  process.exit(0);
}

runTests();
