import { Router } from 'express';
import { db } from '../database/db.ts';
import { generateRubricWithAI } from '../ai/rubric.service.ts';
import { Rubric } from '@/src/types/index.ts';

export const rubricRouter = Router();

// GET rubric by question ID
rubricRouter.get('/question/:questionId', (req, res) => {
  const rubric = db.getRubricByQuestionId(req.params.questionId);
  if (!rubric) {
    return res.status(404).json({ success: false, error: 'Rubric not found for this question' });
  }
  res.json({ success: true, rubric });
});

// GENERATE rubric using Gemini Flash
rubricRouter.post('/generate', async (req, res) => {
  try {
    const { questionPrompt, courseCode, courseName, maxMarks, keyConcepts, expectedAnswer } = req.body;
    const targetMarks = Number(maxMarks) || 10.0;

    const criteria = await generateRubricWithAI(
      {
        prompt: questionPrompt,
        courseCode,
        courseName,
        maxMarks: targetMarks,
        keyConcepts,
        expectedAnswer,
      },
      targetMarks
    );

    res.json({
      success: true,
      criteria,
      totalMarks: targetMarks,
      source: 'Gemini-3.8-Flash AI Evaluation Protocol',
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || 'Failed to generate rubric' });
  }
});

// SAVE or UPDATE rubric for a question
rubricRouter.post('/question/:questionId', (req, res) => {
  const { questionId } = req.params;
  const { criteria, totalMarks, isLocked } = req.body;

  const existing = db.getRubricByQuestionId(questionId);

  const updatedRubric: Rubric = {
    id: existing?.id || `rub-${questionId}`,
    questionId,
    totalMarks: Number(totalMarks) || 10.0,
    criteria: Array.isArray(criteria) ? criteria : [],
    isLocked: Boolean(isLocked),
    model: 'Gemini-3.8-Flash / GPT-4o-Deterministic-v2',
    updatedAt: new Date().toISOString(),
  };

  db.saveRubric(updatedRubric);
  res.json({ success: true, rubric: updatedRubric });
});
