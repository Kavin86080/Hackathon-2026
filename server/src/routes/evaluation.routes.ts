import { Router } from 'express';
import { db } from '../database/db.ts';
import { runSemanticEvaluation } from '../ai/evaluation.service.ts';
import { generateFeedback } from '../ai/feedback.service.ts';
import { Evaluation, StudentAnswer } from '@/src/types/index.ts';

export const evaluationRouter = Router();

// GET all evaluations
evaluationRouter.get('/', (req, res) => {
  const evals = db.getEvaluations();
  res.json({ success: true, evaluations: evals });
});

// GET evaluation by answer ID
evaluationRouter.get('/answer/:answerId', (req, res) => {
  const evaluation = db.getEvaluationByAnswerId(req.params.answerId);
  if (!evaluation) {
    return res.status(404).json({ success: false, error: 'Evaluation not found for this answer' });
  }
  res.json({ success: true, evaluation });
});

// RUN AI SEMANTIC EVALUATION on a submitted answer
evaluationRouter.post('/:answerId/run', async (req, res) => {
  try {
    const answer = db.getAnswerById(req.params.answerId);
    if (!answer) {
      return res.status(404).json({ success: false, error: 'Answer not found' });
    }

    const question = db.getQuestionById(answer.questionId);
    if (!question) {
      return res.status(404).json({ success: false, error: 'Associated question not found' });
    }

    const rubric = db.getRubricByQuestionId(question.id);
    if (!rubric) {
      return res.status(400).json({ success: false, error: 'No approved rubric exists for this question' });
    }

    // Set status to EVALUATING
    answer.status = 'EVALUATING';
    db.saveAnswer(answer);

    // Run semantic AI pipeline with deterministic scoring
    const evaluation = await runSemanticEvaluation(question, rubric, answer);
    db.saveEvaluation(evaluation);

    // Auto-generate feedback report as well
    const feedback = await generateFeedback(question, evaluation, answer);
    db.saveFeedback(feedback);

    // Update answer status
    answer.status = 'FEEDBACK_AVAILABLE';
    db.saveAnswer(answer);

    res.json({
      success: true,
      evaluation,
      feedback,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || 'Evaluation pipeline failed' });
  }
});

// FACULTY REVIEW & OVERRIDE
evaluationRouter.post('/:id/review', async (req, res) => {
  const { facultyFinalScore, facultyNotes, reviewerName } = req.body;
  const evaluation = db.getEvaluationById(req.params.id);

  if (!evaluation) {
    return res.status(404).json({ success: false, error: 'Evaluation not found' });
  }

  const finalScore = Number(facultyFinalScore) !== undefined ? Number(facultyFinalScore) : evaluation.facultyFinalScore;
  const isModified = Math.abs(finalScore - evaluation.aiRecommendedScore) > 0.05;

  evaluation.facultyFinalScore = Math.min(evaluation.maxScore, Math.max(0, finalScore));
  evaluation.status = isModified ? 'MODIFIED' : 'APPROVED';
  evaluation.facultyNotes = facultyNotes !== undefined ? facultyNotes : evaluation.facultyNotes;
  evaluation.reviewedBy = reviewerName || 'Prof. Elena Vance';
  evaluation.reviewedAt = new Date().toISOString();

  db.saveEvaluation(evaluation);

  // Update associated feedback data
  const question = db.getQuestionById(evaluation.questionId);
  const answer = db.getAnswerById(evaluation.answerId);
  if (question && answer) {
    const updatedFeedback = await generateFeedback(question, evaluation, answer);
    db.saveFeedback(updatedFeedback);
  }

  res.json({ success: true, evaluation });
});

// SANDBOX SIMULATE (For Questions & Rubric Architect)
evaluationRouter.post('/sandbox-simulate', async (req, res) => {
  const { candidateProse, questionId, rubricCriteria } = req.body;

  const question = (questionId ? db.getQuestionById(questionId) : null) || db.getQuestions()[0];
  const rubric = rubricCriteria
    ? {
        id: 'sandbox-rub',
        questionId: question.id,
        totalMarks: 10.0,
        criteria: rubricCriteria,
        isLocked: false,
        model: 'Gemini-3.8-Flash',
        updatedAt: new Date().toISOString(),
      }
    : (db.getRubricByQuestionId(question.id) || db.getRubrics()[0]);

  const mockAnswer: StudentAnswer = {
    id: 'mock-ans-sim',
    studentId: 'sim-user',
    studentName: 'Synthetic Candidate',
    studentEmail: 'synthetic@test.edu',
    studentUid: 'SIM-001',
    questionId: question.id,
    answerText: candidateProse || '',
    wordCount: (candidateProse || '').split(/\s+/).filter(Boolean).length,
    status: 'SUBMITTED',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const simulation = await runSemanticEvaluation(question, rubric, mockAnswer);

  res.json({
    success: true,
    simulation,
    simulatedScore: simulation.aiRecommendedScore,
  });
});
