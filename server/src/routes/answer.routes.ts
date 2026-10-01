import { Router } from 'express';
import { db } from '../database/db.ts';
import { StudentAnswer, SubmissionMethod, HandwrittenPage } from '@/src/types/index.ts';
import { extractHandwrittenAnswer, transcribeSinglePage, compareTypedAndOcr, ImageInput } from '../ai/ocr.service.ts';

export const answerRouter = Router();

// POST /api/answers/ocr/page — transcribe a single page (for granular progress tracking)
answerRouter.post('/ocr/page', async (req, res) => {
  try {
    const { image, totalCount } = req.body as { image: ImageInput; totalCount?: number };

    if (!image || !image.dataUrl) {
      return res.status(400).json({ success: false, error: 'No image provided for OCR extraction.' });
    }

    const isAllowedFormat =
      image.dataUrl.startsWith('data:image/jpeg') ||
      image.dataUrl.startsWith('data:image/jpg') ||
      image.dataUrl.startsWith('data:image/png') ||
      image.dataUrl.startsWith('data:image/webp') ||
      image.mimeType?.match(/image\/(jpeg|jpg|png|webp)/i);

    if (!isAllowedFormat && !image.dataUrl.startsWith('http')) {
      return res.status(400).json({
        success: false,
        error: 'Unsupported file type. Please upload JPG, JPEG, PNG, or WEBP.',
      });
    }

    // Base64 size limit (approx 10MB)
    if (image.dataUrl.length > 15 * 1024 * 1024) {
      return res.status(400).json({
        success: false,
        error: 'Image is too large. Maximum allowed size is 10 MB.',
      });
    }

    console.log(`[OCR-ROUTE] Processing OCR for page ${image.pageNumber}, length: ${image.dataUrl.length}`);
    const pageResult = await transcribeSinglePage(image, totalCount || 1);
    console.log(`[OCR-ROUTE] Success for page ${image.pageNumber}, text: ${pageResult.text.slice(0, 60)}...`);
    res.json({ success: true, page: pageResult });
  } catch (err: any) {
    console.error('Error in /api/answers/ocr/page:', err);
    res.status(500).json({ success: false, error: err.message || 'OCR extraction failed.' });
  }
});

// POST /api/answers/ocr — batch upload images and extract text across all pages
answerRouter.post('/ocr', async (req, res) => {
  try {
    const { images } = req.body as { images: ImageInput[] };

    if (!images || !Array.isArray(images) || images.length === 0) {
      return res.status(400).json({ success: false, error: 'At least one image is required for OCR extraction.' });
    }

    if (images.length > 10) {
      return res.status(400).json({ success: false, error: 'Maximum 10 pages allowed per submission.' });
    }

    // Validate mime types and sizes
    for (let i = 0; i < images.length; i++) {
      const img = images[i];
      if (!img.dataUrl) {
        return res.status(400).json({ success: false, error: `Page ${i + 1} has no image data.` });
      }

      const isAllowedFormat =
        img.dataUrl.startsWith('data:image/jpeg') ||
        img.dataUrl.startsWith('data:image/jpg') ||
        img.dataUrl.startsWith('data:image/png') ||
        img.dataUrl.startsWith('data:image/webp') ||
        img.mimeType?.match(/image\/(jpeg|jpg|png|webp)/i);

      if (!isAllowedFormat && !img.dataUrl.startsWith('http')) {
        return res.status(400).json({
          success: false,
          error: `Page ${i + 1} format unsupported. Unsupported file type. Please upload JPG, JPEG, PNG, or WEBP.`,
        });
      }

      if (img.dataUrl.length > 15 * 1024 * 1024) {
        return res.status(400).json({
          success: false,
          error: `Page ${i + 1}: Image is too large. Maximum allowed size is 10 MB.`,
        });
      }
    }

    const extraction = await extractHandwrittenAnswer(images);
    res.json({ success: true, extraction });
  } catch (err: any) {
    console.error('Error in /api/answers/ocr:', err);
    res.status(500).json({ success: false, error: err.message || 'OCR extraction failed.' });
  }
});

// POST /api/answers/compare — compare typed and OCR text when both exist
answerRouter.post('/compare', async (req, res) => {
  try {
    const { typedText, ocrText } = req.body;

    if (!typedText || !ocrText) {
      return res.status(400).json({
        success: false,
        error: 'Both typedText and ocrText are required for comparison.',
      });
    }

    const comparison = await compareTypedAndOcr(typedText, ocrText);
    res.json({ success: true, comparison });
  } catch (err: any) {
    console.error('Error in /api/answers/compare:', err);
    res.status(500).json({ success: false, error: err.message || 'Comparison failed.' });
  }
});

// GET all answers (Faculty view)
answerRouter.get('/', (req, res) => {
  const answers = db.getAnswers();
  res.json({ success: true, answers });
});

// GET single answer
answerRouter.get('/:id', (req, res) => {
  const answer = db.getAnswerById(req.params.id);
  if (!answer) {
    return res.status(404).json({ success: false, error: 'Answer not found' });
  }
  res.json({ success: true, answer });
});

// GET assessments for student
answerRouter.get('/student/assessments', (req, res) => {
  const studentId = (req.query.studentId as string) || 'usr-stu-1';
  const questions = db.getQuestions();
  const studentAnswers = db.getAnswersByStudent(studentId);

  const assessments = questions.map((q) => {
    const existingAns = studentAnswers.find((a) => a.questionId === q.id);
    const evaluation = existingAns ? db.getEvaluationByAnswerId(existingAns.id) : undefined;

    return {
      question: q,
      answer: existingAns || null,
      evaluation: evaluation || null,
      status: existingAns?.status || 'NOT_STARTED',
    };
  });

  res.json({ success: true, assessments });
});

// POST /api/answers/reset-draft — resets or unlocks answer into a clean editable draft
answerRouter.post('/reset-draft', (req, res) => {
  const { questionId, studentId } = req.body;
  const targetStudentId = studentId || 'usr-stu-1';
  if (!questionId) {
    return res.status(400).json({ success: false, error: 'Question ID is required' });
  }

  // Clear previous answer/evaluations for this question so student can start fresh
  db.deleteAnswersByStudentAndQuestion(targetStudentId, questionId);

  const student = db.getUserById(targetStudentId) || db.getUsers().find((u) => u.role === 'student');
  const newDraft: StudentAnswer = {
    id: `ans-${Date.now()}`,
    studentId: targetStudentId,
    studentName: student?.name || 'Alex Chen',
    studentEmail: student?.email || 'alex.chen@stanford.edu',
    studentUid: student?.studentId || 'CS-2024-883',
    studentAvatar: student?.avatarUrl,
    questionId,
    answerText: '',
    wordCount: 0,
    status: 'DRAFT',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    submissionMethod: 'HANDWRITTEN_OCR',
    handwrittenPages: [],
    ocrStatus: 'PENDING',
  };

  db.saveAnswer(newDraft);
  res.json({ success: true, answer: newDraft });
});

// SAVE DRAFT answer (POST or PUT /:id/draft)
const handleSaveDraft = (req: any, res: any) => {
  const {
    id,
    studentId,
    questionId,
    answerText,
    submissionMethod,
    typedAnswerText,
    rawOcrText,
    correctedOcrText,
    ocrStatus,
    ocrConfidence,
    ocrUncertaintyFlags,
    hasOcrUnclear,
    handwrittenPages,
    comparisonResult,
    attachments,
    isRevision,
  } = req.body;

  const targetQuestionId = questionId || req.body.questionId;
  if (!targetQuestionId) {
    return res.status(400).json({ success: false, error: 'Question ID is required' });
  }

  const student = db.getUserById(studentId || 'usr-stu-1') || db.getUsers().find((u) => u.role === 'student');
  const existingAnswers = db.getAnswers();
  const requestedId = req.params?.id || id;
  let existing = requestedId
    ? db.getAnswerById(requestedId)
    : existingAnswers.find((a) => a.studentId === student?.id && a.questionId === targetQuestionId);

  // If this is a deliberate revision or if existing is finalized, create a new draft ID if needed
  if (isRevision && existing && (existing.status === 'SUBMITTED' || existing.status === 'EVALUATED' || existing.status === 'FEEDBACK_AVAILABLE')) {
    // Reset old or generate new draft
    db.deleteAnswer(existing.id);
    existing = undefined;
  } else if (existing && (existing.status === 'SUBMITTED' || existing.status === 'EVALUATED' || existing.status === 'FEEDBACK_AVAILABLE')) {
    return res.status(400).json({ success: false, error: 'Cannot modify an already submitted answer' });
  }

  const finalAnswerText = answerText !== undefined ? answerText : (existing?.answerText || '');
  const wordCount = finalAnswerText.trim().split(/\s+/).filter(Boolean).length;

  const answer: StudentAnswer = {
    id: existing?.id || requestedId || `ans-${Date.now()}`,
    studentId: student?.id || 'usr-stu-1',
    studentName: student?.name || 'Alex Chen',
    studentEmail: student?.email || 'alex.chen@stanford.edu',
    studentUid: student?.studentId || 'CS-2024-883',
    studentAvatar: student?.avatarUrl,
    questionId: targetQuestionId,
    answerText: finalAnswerText,
    wordCount,
    status: 'DRAFT',
    createdAt: existing?.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    submissionMethod: (submissionMethod as SubmissionMethod) || existing?.submissionMethod || 'HANDWRITTEN_OCR',
    typedAnswerText: typedAnswerText !== undefined ? typedAnswerText : existing?.typedAnswerText,
    rawOcrText: rawOcrText !== undefined ? rawOcrText : existing?.rawOcrText,
    correctedOcrText: correctedOcrText !== undefined ? correctedOcrText : existing?.correctedOcrText,
    ocrStatus: ocrStatus !== undefined ? ocrStatus : existing?.ocrStatus,
    ocrConfidence: ocrConfidence !== undefined ? ocrConfidence : existing?.ocrConfidence,
    ocrUncertaintyFlags: ocrUncertaintyFlags !== undefined ? ocrUncertaintyFlags : existing?.ocrUncertaintyFlags,
    hasOcrUnclear: hasOcrUnclear !== undefined ? hasOcrUnclear : existing?.hasOcrUnclear,
    handwrittenPages: handwrittenPages !== undefined ? handwrittenPages : existing?.handwrittenPages,
    comparisonResult: comparisonResult !== undefined ? comparisonResult : existing?.comparisonResult,
    attachments: attachments || existing?.attachments || [],
  };

  db.saveAnswer(answer);
  res.json({ success: true, answer });
};

answerRouter.post('/', handleSaveDraft);
answerRouter.put('/:id/draft', handleSaveDraft);

// SUBMIT answer (locks editing & triggers evaluation readiness, prevents duplicate submit)
answerRouter.post('/:id/submit', (req, res) => {
  const answer = db.getAnswerById(req.params.id);
  if (!answer) {
    return res.status(404).json({ success: false, error: 'Answer not found' });
  }

  // Prevent duplicate final submissions
  if (answer.status === 'SUBMITTED' || answer.status === 'EVALUATED' || answer.status === 'FEEDBACK_AVAILABLE') {
    return res.status(400).json({ success: false, error: 'Answer has already been submitted and finalized.' });
  }

  // Update any final confirmed parameters if passed in body
  if (req.body.answerText) {
    answer.answerText = req.body.answerText;
    answer.wordCount = answer.answerText.trim().split(/\s+/).filter(Boolean).length;
  }
  if (req.body.submissionMethod) {
    answer.submissionMethod = req.body.submissionMethod;
  }
  if (req.body.correctedOcrText) {
    answer.correctedOcrText = req.body.correctedOcrText;
  }
  if (req.body.handwrittenPages) {
    answer.handwrittenPages = req.body.handwrittenPages;
  }

  answer.status = 'SUBMITTED';
  answer.submittedAt = new Date().toISOString();
  answer.updatedAt = new Date().toISOString();

  db.saveAnswer(answer);
  res.json({ success: true, answer });
});
