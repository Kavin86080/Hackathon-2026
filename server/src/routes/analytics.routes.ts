import { Router } from 'express';
import { db } from '../database/db.ts';

export const analyticsRouter = Router();

// FACULTY ANALYTICS
analyticsRouter.get('/faculty', (req, res) => {
  const questions = db.getQuestions();
  const answers = db.getAnswers();
  const evaluations = db.getEvaluations();

  const evaluatedCount = answers.filter((a) => a.status === 'EVALUATED' || a.status === 'FEEDBACK_AVAILABLE').length;
  const pendingReviewCount = evaluations.filter((e) => e.status === 'PENDING_REVIEW').length;

  const avgScore = evaluations.length > 0
    ? +(evaluations.reduce((sum, e) => sum + e.facultyFinalScore, 0) / evaluations.length).toFixed(1)
    : 7.8;

  res.json({
    success: true,
    analytics: {
      totalAssessments: questions.length,
      totalSubmissions: answers.length,
      evaluatedCount,
      pendingReviewCount,
      averageCohortScore: avgScore,
      commonMissingConcepts: [
        { concept: 'Non-linear Activation (ReLU)', percentage: 42, count: 35 },
        { concept: '2D Grid Topology Prior', percentage: 35, count: 29 },
        { concept: 'Spatial Dimension Equation O = floor((W-F+2P)/S)+1', percentage: 28, count: 24 },
        { concept: 'Translation Equivariance vs. Invariance contrast', percentage: 22, count: 18 },
        { concept: 'Softmax Logit Normalization', percentage: 14, count: 12 },
      ],
      cohortDistribution: [
        { range: '9.0 - 10.0', count: 18 },
        { range: '7.5 - 8.9', count: 44 },
        { range: '6.0 - 7.4', count: 16 },
        { range: '< 6.0', count: 6 },
      ],
      submissionTimeline: [
        { date: 'Oct 20', submissions: 12 },
        { date: 'Oct 21', submissions: 28 },
        { date: 'Oct 22', submissions: 32 },
        { date: 'Oct 23', submissions: 12 },
      ],
    },
  });
});

// STUDENT PROGRESS & MASTERY
analyticsRouter.get('/student', (req, res) => {
  const studentId = (req.query.studentId as string) || 'usr-stu-1';
  const answers = db.getAnswersByStudent(studentId);
  const evaluations = db.getEvaluations().filter((e) => e.studentId === studentId);

  res.json({
    success: true,
    progress: {
      activeAssessmentsCount: 3,
      completedEvaluationsCount: 12,
      overallMasteryPct: 82,
      feedbackActionItemsCount: 18,
      conceptRadar: {
        labels: [
          'Neural Network Fundamentals',
          'Convolution & Spatial Filters',
          'Model Architectures',
          'Optimization & Backpropagation',
          'Non-linear Activations & Loss',
        ],
        scores: [92, 95, 88, 78, 64],
        criticalGapTopic: 'Non-linear Activations & Loss',
        criticalGapScore: 64,
      },
      topicMasteryList: [
        {
          topic: 'Neural Network Fundamentals',
          percentage: 92,
          status: 'Mastered',
        },
        {
          topic: 'Convolution & Spatial Filters',
          percentage: 95,
          status: 'Mastered',
        },
        {
          topic: 'Non-linear Activations & Loss',
          percentage: 64,
          status: 'Needs Review',
          note: 'Directly linked to CNN Exam Criterion #1 & #3 deductions.',
        },
        {
          topic: 'Optimization & Backpropagation',
          percentage: 78,
          status: 'Good',
        },
        {
          topic: 'Model Architectures & Transfer Learning',
          percentage: 88,
          status: 'Proficient',
        },
      ],
    },
  });
});

// RESET TO DEMO STATE
analyticsRouter.post('/demo/reset', (req, res) => {
  db.resetDemo();
  res.json({ success: true, message: 'ExplainGrade AI database reset to initial verified demo state.' });
});
