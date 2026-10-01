import { Router } from 'express';
import { db } from '../database/db.ts';
import { Question } from '@/src/types/index.ts';

export const questionRouter = Router();

// GET all questions
questionRouter.get('/', (req, res) => {
  const questions = db.getQuestions();
  res.json({ success: true, questions });
});

// GET single question
questionRouter.get('/:id', (req, res) => {
  const question = db.getQuestionById(req.params.id);
  if (!question) {
    return res.status(404).json({ success: false, error: 'Question not found' });
  }
  res.json({ success: true, question });
});

// CREATE question
questionRouter.post('/', (req, res) => {
  const {
    courseCode,
    courseName,
    targetExam,
    qid,
    prompt,
    maxMarks,
    modality,
    semanticPrecision,
    knowledgeCorpus,
    expectedAnswer,
    keyConcepts,
    learningObjectives,
  } = req.body;

  if (!prompt) {
    return res.status(400).json({ success: false, error: 'Question prompt is required' });
  }

  const newQuestion: Question = {
    id: `q-${Date.now()}`,
    courseCode: courseCode || 'CS231n',
    courseName: courseName || 'Deep Learning for Computer Vision',
    targetExam: targetExam || 'Midterm Exam 2024',
    qid: qid || `#CS-${Math.floor(1000 + Math.random() * 9000)}`,
    prompt,
    maxMarks: Number(maxMarks) || 10.0,
    modality: modality || 'Long Descriptive',
    semanticPrecision: semanticPrecision || 'Strict Semantic',
    knowledgeCorpus: knowledgeCorpus || 'Approved Course Textbook & Syllabus',
    expectedAnswer: expectedAnswer || '',
    keyConcepts: Array.isArray(keyConcepts) ? keyConcepts : (keyConcepts ? [keyConcepts] : []),
    learningObjectives: Array.isArray(learningObjectives) ? learningObjectives : [],
    status: 'active',
    createdAt: new Date().toISOString(),
  };

  db.saveQuestion(newQuestion);
  res.status(201).json({ success: true, question: newQuestion });
});

// UPDATE question
questionRouter.put('/:id', (req, res) => {
  const existing = db.getQuestionById(req.params.id);
  if (!existing) {
    return res.status(404).json({ success: false, error: 'Question not found' });
  }

  const updated: Question = {
    ...existing,
    ...req.body,
    id: existing.id,
  };

  db.saveQuestion(updated);
  res.json({ success: true, question: updated });
});

// DELETE question
questionRouter.delete('/:id', (req, res) => {
  const success = db.deleteQuestion(req.params.id);
  res.json({ success });
});
