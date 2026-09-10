process.env.NODE_ENV = 'test';
process.env.PORT = '5055';

import app from './index.js';

async function runAllTests() {
  console.log('🚀 Starting Pocket Mentor Comprehensive Test Runner...');

  const server = app.listen(5055, async () => {
    console.log('📡 Test server listening on http://localhost:5055');

    const BASE = 'http://localhost:5055';
    let failed = false;

    try {
      // 1. Healthcheck
      console.log('\n[Test 1] Healthcheck GET /api/health');
      const hRes = await fetch(`${BASE}/api/health`);
      const health = await hRes.json();
      console.log('   Status:', health.status, '| LLM:', health.mode);
      if (health.status !== 'ok') throw new Error('Health status is not ok');

      // 2. Empty or invalid notes validation
      console.log('\n[Test 2] Edge Case: Empty notes POST /api/generate');
      const badRes = await fetch(`${BASE}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes: 'short' })
      });
      const badJson = await badRes.json();
      if (badRes.status !== 400 || badJson.success !== false) {
        throw new Error('Expected 400 Bad Request on short notes');
      }
      console.log('   Validation handled correctly: status 400 rejected short input');

      // 3. Main study suite generation
      console.log('\n[Test 3] Main Study Generation POST /api/generate');
      const sampleNotes = `Operating Systems Lecture 12: Memory Management & Paging
- Paging solves external fragmentation by allowing physical address space of a process to be noncontiguous.
- Physical memory is broken into fixed-sized blocks called frames.
- Logical/virtual memory is broken into blocks of the same size called pages.
- When a process runs, its pages are loaded into any available frames from backing store (disk).
- Address translation: CPU produces logical address divided into page number (p) and page offset (d).
- Page table contains base address of each page in physical memory.
- Page Fault: occurs when CPU references a page not present in physical RAM (valid-invalid bit is 0). The OS traps to kernel, swaps page from disk into a free frame, updates page table, and restarts instruction.
- Translation Lookaside Buffer (TLB): High-speed hardware associative cache storing recent page-to-frame translations.`;

      const genRes = await fetch(`${BASE}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes: sampleNotes, mode: 'fresh' })
      });
      const genJson = await genRes.json();
      if (!genJson.success || !genJson.data) throw new Error('Generate endpoint failed');

      const d = genJson.data;
      console.log('   Title:', d.title);
      console.log('   Summary:', d.summary.slice(0, 70) + '...');
      console.log('   Flashcards count:', d.flashcards.length);
      console.log('   Quiz count:', d.quiz.length);
      console.log('   Key points count:', d.keyPoints.length);
      console.log('   Definitions count:', d.definitions.length);
      console.log('   Presentation slides count:', d.presentationSlides.length);
      console.log('   Subtopics count:', d.subtopics.length);

      // Quiz integrity checks
      d.quiz.forEach((q, idx) => {
        if (!q.options || q.options.length !== 4) {
          throw new Error(`Quiz question ${idx} does not have exactly 4 options`);
        }
        if (!q.options.includes(q.correctAnswer)) {
          throw new Error(`Quiz question ${idx}: correctAnswer not in options`);
        }
        if (!q.explanation) {
          throw new Error(`Quiz question ${idx}: missing explanation`);
        }
      });
      console.log('   All quiz questions verified for 4-choice options, verbatim match, and explanations.');

      // 4. Revise-Again (Variation mode)
      console.log('\n[Test 4] Revise-Again Variation POST /api/generate (mode: variation)');
      const varRes = await fetch(`${BASE}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes: sampleNotes, mode: 'variation' })
      });
      const varJson = await varRes.json();
      if (!varJson.success) throw new Error('Revise-again variation failed');
      console.log('   Variation generated successfully! Quiz Q1:', varJson.data.quiz[0].question.slice(0, 50) + '...');

      // 5. Clean & Organize Notes
      console.log('\n[Test 5] AI Notes Cleanup & Organization POST /api/generate/clean');
      const cleanRes = await fetch(`${BASE}/api/generate/clean`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes: 'unstructured fragments: paging, frames, page faults, tlb cache.' })
      });
      const cleanJson = await cleanRes.json();
      if (!cleanJson.success || !cleanJson.cleanedNotes) throw new Error('Clean notes failed');
      console.log('   Notes cleaned & structured with markdown headings successfully.');

      // 6. Handwritten Notes OCR
      console.log('\n[Test 6] Handwritten Notes OCR POST /api/generate/ocr');
      const ocrRes = await fetch(`${BASE}/api/generate/ocr`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileName: 'my_exam_notes_photo.jpg' })
      });
      const ocrJson = await ocrRes.json();
      if (!ocrJson.success || !ocrJson.extractedText) throw new Error('OCR failed');
      console.log('   OCR transcription returned text successfully.');

      // 7. AI Tutor Chat with specialized modes & multilingual
      console.log('\n[Test 7] AI Tutor Chat Modes POST /api/generate/chat');
      const tutorModes = ['default', 'simple', 'detailed', 'examples', 'common_mistakes', 'diagram', 'source', 'follow_up'];
      const testLangs = ['English', 'Spanish', 'Hindi', 'French', 'German', 'Telugu'];
      for (let i = 0; i < tutorModes.length; i++) {
        const m = tutorModes[i];
        const lang = testLangs[i % testLangs.length];
        const cRes = await fetch(`${BASE}/api/generate/chat`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            notes: sampleNotes,
            message: 'Explain page fault handling',
            mode: m,
            language: lang
          })
        });
        const cJson = await cRes.json();
        if (!cJson.success || !cJson.response) throw new Error(`Tutor mode ${m} failed`);
        console.log(`   Mode [${m}] in [${lang}] responded (${cJson.response.length} chars).`);
      }

      // 8. Study Plan & Exam Countdown
      console.log('\n[Test 8] Study Plan & Exam Countdown POST /api/generate/study-plan');
      const planRes = await fetch(`${BASE}/api/generate/study-plan`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          notes: sampleNotes,
          examDate: '2026-09-20',
          daysLeft: 6,
          weakTopics: ['Address Translation & Offset Calculations']
        })
      });
      const planJson = await planRes.json();
      if (!planJson.success || !planJson.plan) throw new Error('Study plan failed');
      console.log('   Study plan schedule generated for', planJson.plan.schedule.length, 'days.');
      console.log('   Day 2 targeted weak topic task:', planJson.plan.schedule[1].tasks[0]);

      console.log('\n=============================================');
      console.log('✅ ALL 8 INTEGRATION TEST SUITES PASSED (100% SUCCESS)');
      console.log('=============================================\n');
    } catch (err) {
      console.error('❌ Test failed with error:', err);
      failed = true;
    } finally {
      server.close(() => {
        console.log('🛑 Test server closed.');
        if (failed) {
          process.exit(1);
        }
      });
    }
  });
}

runAllTests();
