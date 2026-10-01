import { Router } from 'express';
import { db } from '../database/db.ts';
import { evaluateRemediationProse } from '../ai/feedback.service.ts';

export const feedbackRouter = Router();

// GET feedback by answer ID
feedbackRouter.get('/answer/:answerId', (req, res) => {
  const feedback = db.getFeedbackByAnswerId(req.params.answerId);
  if (!feedback) {
    return res.status(404).json({ success: false, error: 'Feedback report not found' });
  }
  res.json({ success: true, feedback });
});

// INTERACTIVE REMEDIATION SANDBOX EVALUATION
feedbackRouter.post('/sandbox-eval', (req, res) => {
  const { prose, baseScore } = req.body;
  const result = evaluateRemediationProse(prose || '', Number(baseScore) || 7.5);
  res.json({ success: true, ...result });
});
