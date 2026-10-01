import React, { useState, useEffect, useRef } from 'react';
import { api } from '../services/api.ts';
import {
  Question,
  StudentAnswer,
  HandwrittenPage,
  SubmissionMethod,
  TextComparisonResult,
} from '../types/index.ts';

interface StudentAnswerEditorProps {
  questionId?: string;
  onSubmitted?: (answerId: string) => void;
}

export type EditorWorkflowState =
  | 'DRAFT'
  | 'OCR_PROCESSING'
  | 'OCR_REVIEW'
  | 'READY_TO_SUBMIT'
  | 'SUBMITTED'
  | 'EVALUATED';

interface PageExtractionStatus {
  pageNum: number;
  status: 'waiting' | 'extracting' | 'done' | 'failed';
  error?: string;
}

export const StudentAnswerEditor: React.FC<StudentAnswerEditorProps> = ({
  questionId = 'q-cs231n-04',
  onSubmitted,
}) => {
  const [question, setQuestion] = useState<Question | null>(null);
  const [currentAnswer, setCurrentAnswer] = useState<StudentAnswer | null>(null);

  // Workflow state machine
  const [workflowState, setWorkflowState] = useState<EditorWorkflowState>('DRAFT');

  // Input mode tab: 'typed' | 'handwritten' | 'compare'
  const [inputMode, setInputMode] = useState<'typed' | 'handwritten' | 'compare'>('typed');

  // Input states
  const [typedText, setTypedText] = useState('');
  const [handwrittenPages, setHandwrittenPages] = useState<HandwrittenPage[]>([]);
  const [rawOcrText, setRawOcrText] = useState('');
  const [correctedOcrText, setCorrectedOcrText] = useState('');
  const [ocrConfidence, setOcrConfidence] = useState<number>(0);
  const [ocrStatus, setOcrStatus] = useState<'PENDING' | 'EXTRACTING' | 'EXTRACTED' | 'CONFIRMED' | 'UNCLEAR'>('PENDING');
  const [hasOcrUnclear, setHasOcrUnclear] = useState(false);
  const [ocrUncertaintyFlags, setOcrUncertaintyFlags] = useState<string[]>([]);

  // Page extraction progress tracking
  const [pageExtractionStatuses, setPageExtractionStatuses] = useState<PageExtractionStatus[]>([]);
  const [currentExtractingPage, setCurrentExtractingPage] = useState<number>(0);

  // Comparison & selection
  const [submissionChoice, setSubmissionChoice] = useState<SubmissionMethod>('TYPED');
  const [combinedText, setCombinedText] = useState('');
  const [comparisonResult, setComparisonResult] = useState<TextComparisonResult | null>(null);
  const [isComparing, setIsComparing] = useState(false);

  // Process states
  const [isExtractingOcr, setIsExtractingOcr] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [activePreviewImage, setActivePreviewImage] = useState<string | null>(null);

  // Refs for real file pickers
  const fileInputRef = useRef<HTMLInputElement>(null);
  const replacePageInputRef = useRef<HTMLInputElement>(null);
  const ocrTextareaRef = useRef<HTMLTextAreaElement>(null);
  const [replaceTargetIndex, setReplaceTargetIndex] = useState<number | null>(null);

  useEffect(() => {
    loadData();
  }, [questionId]);

  const loadData = async () => {
    try {
      const q = await api.getQuestion(questionId);
      setQuestion(q);

      const ansList = await api.getAnswers();
      const existing = ansList.find((a) => a.questionId === questionId && a.studentId === 'usr-stu-1');
      if (existing) {
        setCurrentAnswer(existing);
        setTypedText(existing.typedAnswerText || existing.answerText || '');
        setCorrectedOcrText(existing.correctedOcrText || existing.rawOcrText || '');
        setRawOcrText(existing.rawOcrText || '');
        setHandwrittenPages(existing.handwrittenPages || []);
        setOcrConfidence(existing.ocrConfidence || 0);
        setOcrStatus(existing.ocrStatus || (existing.handwrittenPages?.length ? 'CONFIRMED' : 'PENDING'));
        setHasOcrUnclear(existing.hasOcrUnclear || false);
        setOcrUncertaintyFlags(existing.ocrUncertaintyFlags || []);
        setSubmissionChoice(existing.submissionMethod || (existing.handwrittenPages?.length ? 'HANDWRITTEN_OCR' : 'TYPED'));
        setComparisonResult(existing.comparisonResult || null);

        // Determine workflow state accurately
        if (existing.status === 'FEEDBACK_AVAILABLE' || existing.status === 'EVALUATED') {
          setWorkflowState('EVALUATED');
        } else if (existing.status === 'SUBMITTED' || existing.status === 'EVALUATING') {
          setWorkflowState('SUBMITTED');
        } else if (existing.ocrStatus === 'CONFIRMED') {
          setWorkflowState('READY_TO_SUBMIT');
        } else if (existing.correctedOcrText || existing.rawOcrText) {
          setWorkflowState('OCR_REVIEW');
        } else {
          setWorkflowState('DRAFT');
        }

        if (existing.submissionMethod === 'HANDWRITTEN_OCR' || existing.handwrittenPages?.length) {
          setInputMode('handwritten');
        }
      } else {
        setWorkflowState('DRAFT');
        // Default clean starting text
        const defaultText = `A Convolutional Neural Network (CNN) is a deep learning architecture primarily tailored for data with a 2D grid topology, such as digital image pixel arrays.

First, the Convolution Layer applies learnable weight kernels that slide across the input matrix with a defined stride and padding. At each location, element-wise dot products are computed and summed to generate 2D feature activation maps capturing local spatial hierarchies such as edges and textures.

Second, non-linear activation functions (principally the Rectified Linear Unit, ReLU: f(x) = max(0, x)) are applied to prevent multiple successive linear convolution layers from collapsing into a single linear transformation.

Third, Pooling Layers (most commonly Max Pooling) downsample spatial dimensions by taking the maximum value over a sliding window. This introduces translation invariance and reduces computational parameter overhead.

Finally, multidimensional feature maps are flattened into a 1D vector and connected to Fully Connected (Dense) layers with a Softmax normalization function to output class probability scores.

CNNs are extensively deployed in real-world computer vision applications including autonomous vehicle obstacle perception and radiological medical diagnostic imaging.`;
        setTypedText(defaultText);
      }
    } catch (e) {
      console.error('Error loading question or answer data', e);
    }
  };

  // Determine active answer text according to student's explicit choice
  const getActiveAnswerText = (): string => {
    if (submissionChoice === 'HANDWRITTEN_OCR') {
      return correctedOcrText.trim() ? correctedOcrText : typedText;
    }
    if (submissionChoice === 'COMBINED') {
      return combinedText.trim() ? combinedText : `${typedText}\n\n[OCR Addition]:\n${correctedOcrText}`;
    }
    return typedText;
  };

  const activeText = getActiveAnswerText();
  const wordCount = activeText.trim() ? activeText.trim().split(/\s+/).filter(Boolean).length : 0;
  const charCount = activeText.length;

  const isFinalized = workflowState === 'SUBMITTED' || workflowState === 'EVALUATED';
  const hasBothAnswers = Boolean(typedText.trim() && correctedOcrText.trim());

  // Start a new draft attempt (unlocking read-only state for revision or new handwritten upload)
  const handleStartNewAttempt = async (autoTriggerUpload: boolean = false) => {
    setIsSaving(true);
    setErrorMsg(null);
    setStatusMsg(null);
    try {
      const freshDraft = await api.resetDraftAnswer(questionId, 'usr-stu-1');
      setCurrentAnswer(freshDraft);
      setWorkflowState('DRAFT');
      setInputMode('handwritten');
      setHandwrittenPages([]);
      setRawOcrText('');
      setCorrectedOcrText('');
      setOcrConfidence(0);
      setOcrStatus('PENDING');
      setHasOcrUnclear(false);
      setOcrUncertaintyFlags([]);
      setSubmissionChoice('HANDWRITTEN_OCR');
      setStatusMsg('Unlocked fresh draft mode. You can now select and upload handwritten answer photos.');

      if (autoTriggerUpload) {
        setTimeout(() => {
          fileInputRef.current?.click();
        }, 100);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to initialize fresh draft.');
    } finally {
      setIsSaving(false);
    }
  };

  // Click handler for "Upload Handwritten Answer" button
  const handleUploadButtonClick = () => {
    setInputMode('handwritten');

    if (isFinalized) {
      // If currently in read-only / evaluated state, unlock draft and immediately trigger OS file picker
      handleStartNewAttempt(true);
      return;
    }

    // Trigger the real operating-system file picker
    setTimeout(() => {
      fileInputRef.current?.click();
    }, 50);
  };

  // Real file selection and validation (JPG, JPEG, PNG, WEBP, <= 10MB per page)
  const handleFilesSelected = (files: FileList | null) => {
    if (!files || files.length === 0) return;

    setErrorMsg(null);
    setStatusMsg(null);

    const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    const allowedExtensions = ['.jpg', '.jpeg', '.png', '.webp'];

    const validFiles: File[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const nameLower = file.name.toLowerCase();
      const hasValidExt = allowedExtensions.some((ext) => nameLower.endsWith(ext));
      const hasValidMime = allowedMimeTypes.includes(file.type.toLowerCase()) || hasValidExt;

      if (!hasValidMime) {
        setErrorMsg('Unsupported file type. Please upload JPG, JPEG, PNG, or WEBP.');
        return;
      }

      if (file.size > 10 * 1024 * 1024) {
        setErrorMsg('Image is too large. Maximum allowed size is 10 MB.');
        return;
      }

      validFiles.push(file);
    }

    let loadedCount = 0;
    const newPages: HandwrittenPage[] = [];

    validFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string;
        newPages.push({
          pageNumber: 0, // renumbered below
          imageName: file.name,
          imageUrl: dataUrl,
          fileSize: file.size,
          mimeType: file.type || 'image/jpeg',
        });
        loadedCount++;

        if (loadedCount === validFiles.length) {
          setHandwrittenPages((prev) => {
            const combined = [...prev, ...newPages];
            return combined.map((p, idx) => ({ ...p, pageNumber: idx + 1 }));
          });
          setSubmissionChoice('HANDWRITTEN_OCR');
          if (workflowState === 'EVALUATED') {
            setWorkflowState('DRAFT');
          }
          setStatusMsg(
            `Selected ${validFiles.length} image page(s). Click "Extract Text from Handwritten Answer" below to transcribe.`
          );
        }
      };
      reader.onerror = () => {
        setErrorMsg(`Failed to read image file "${file.name}".`);
      };
      reader.readAsDataURL(file);
    });

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Reorder pages
  const movePage = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= handwrittenPages.length) return;

    const updated = [...handwrittenPages];
    const temp = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = temp;

    const renumbered = updated.map((p, i) => ({ ...p, pageNumber: i + 1 }));
    setHandwrittenPages(renumbered);
  };

  // Remove page
  const removePage = (index: number) => {
    const updated = handwrittenPages.filter((_, i) => i !== index);
    const renumbered = updated.map((p, i) => ({ ...p, pageNumber: i + 1 }));
    setHandwrittenPages(renumbered);
    if (renumbered.length === 0) {
      setRawOcrText('');
      setCorrectedOcrText('');
      setWorkflowState('DRAFT');
    }
  };

  // Replace page
  const startReplacePage = (index: number) => {
    setReplaceTargetIndex(index);
    if (replacePageInputRef.current) {
      replacePageInputRef.current.value = '';
      replacePageInputRef.current.click();
    }
  };

  const handlePageReplaced = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || replaceTargetIndex === null) return;

    const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    const nameLower = file.name.toLowerCase();
    const hasValidExt = ['.jpg', '.jpeg', '.png', '.webp'].some((ext) => nameLower.endsWith(ext));

    if (!allowedMimeTypes.includes(file.type.toLowerCase()) && !hasValidExt) {
      setErrorMsg('Unsupported file type. Please upload JPG, JPEG, PNG, or WEBP.');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setErrorMsg('Image is too large. Maximum allowed size is 10 MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string;
      setHandwrittenPages((prev) => {
        const updated = [...prev];
        updated[replaceTargetIndex] = {
          ...updated[replaceTargetIndex],
          imageName: file.name,
          imageUrl: dataUrl,
          fileSize: file.size,
          mimeType: file.type || 'image/jpeg',
          rawOcrText: undefined,
        };
        return updated;
      });
      setReplaceTargetIndex(null);
      setStatusMsg(`Page ${replaceTargetIndex + 1} updated with new image "${file.name}".`);
    };
    reader.readAsDataURL(file);
  };

  // Real OCR Extraction with Granular Progress UI
  const handleExtractOcr = async () => {
    if (handwrittenPages.length === 0) {
      setErrorMsg('Please select at least one photo of your handwritten answer first.');
      return;
    }

    setIsExtractingOcr(true);
    setWorkflowState('OCR_PROCESSING');
    setStatusMsg(null);
    setErrorMsg(null);

    const totalPages = handwrittenPages.length;
    const initialStatuses: PageExtractionStatus[] = handwrittenPages.map((p) => ({
      pageNum: p.pageNumber,
      status: 'waiting',
    }));
    setPageExtractionStatuses(initialStatuses);

    const updatedPages: HandwrittenPage[] = [...handwrittenPages];
    const pageTexts: { pageNum: number; text: string; uncertain: boolean; unclearSections: string[] }[] = [];
    let hadError = false;

    try {
      for (let i = 0; i < totalPages; i++) {
        const page = updatedPages[i];
        setCurrentExtractingPage(page.pageNumber);

        // Update status to 'extracting'
        setPageExtractionStatuses((prev) =>
          prev.map((s) => (s.pageNum === page.pageNumber ? { ...s, status: 'extracting' } : s))
        );

        try {
          const res = await api.extractOcrPage(
            {
              dataUrl: page.imageUrl,
              name: page.imageName,
              pageNumber: page.pageNumber,
              mimeType: page.mimeType,
              fileSize: page.fileSize,
            },
            totalPages
          );

          updatedPages[i] = {
            ...updatedPages[i],
            rawOcrText: res.text,
            ocrConfidence: res.confidence,
            hasUnclear: res.uncertain,
            unclearSpans: res.unclearSections || [],
          };

          pageTexts.push({
            pageNum: page.pageNumber,
            text: res.text,
            uncertain: res.uncertain,
            unclearSections: res.unclearSections || [],
          });

          // Mark done
          setPageExtractionStatuses((prev) =>
            prev.map((s) => (s.pageNum === page.pageNumber ? { ...s, status: 'done' } : s))
          );
        } catch (pageErr: any) {
          hadError = true;
          setPageExtractionStatuses((prev) =>
            prev.map((s) =>
              s.pageNum === page.pageNumber ? { ...s, status: 'failed', error: pageErr.message } : s
            )
          );
          setErrorMsg(pageErr.message || `Unable to extract text from Page ${page.pageNumber}. Please try uploading a clearer image.`);
          break;
        }
      }

      setHandwrittenPages(updatedPages);

      if (pageTexts.length > 0) {
        // Construct full text strictly as:
        // PAGE 1
        // [text]
        // PAGE 2
        // [text]
        const fullTranscription = pageTexts
          .map((p) => (totalPages > 1 ? `PAGE ${p.pageNum}\n\n${p.text}` : p.text))
          .join('\n\n');

        setRawOcrText(fullTranscription);
        setCorrectedOcrText(fullTranscription);

        const anyUnclear = pageTexts.some((p) => p.uncertain || p.text.includes('[UNCLEAR]'));
        setHasOcrUnclear(anyUnclear);

        const flags: string[] = [];
        pageTexts.forEach((p) => {
          if (p.uncertain && p.unclearSections.length > 0) {
            flags.push(`Page ${p.pageNum}: ${p.unclearSections.length} uncertain span(s) marked [UNCLEAR]`);
          }
        });
        setOcrUncertaintyFlags(flags);

        const avgConf = Math.round(
          updatedPages.reduce((acc, p) => acc + (p.ocrConfidence || 95), 0) / updatedPages.length
        );
        setOcrConfidence(avgConf);

        setOcrStatus(anyUnclear ? 'UNCLEAR' : 'EXTRACTED');
        setWorkflowState('OCR_REVIEW');

        if (!hadError) {
          setStatusMsg('✓ Handwriting extraction completed. Review and verify the extracted text below before confirming.');
        }
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'OCR extraction failed. Your draft has not been modified.');
      setWorkflowState('DRAFT');
    } finally {
      setIsExtractingOcr(false);
    }
  };

  // Jump to [UNCLEAR] token in the textarea for rapid review
  const handleJumpToUnclear = () => {
    if (!ocrTextareaRef.current) return;
    const text = correctedOcrText;
    const index = text.indexOf('[UNCLEAR]');
    if (index !== -1) {
      ocrTextareaRef.current.focus();
      ocrTextareaRef.current.setSelectionRange(index, index + '[UNCLEAR]'.length);
      setStatusMsg('Jumped to [UNCLEAR] marker. Replace it with your intended word.');
    }
  };

  // Save manual corrections to draft
  const handleSaveCorrections = async () => {
    setIsSaving(true);
    setStatusMsg(null);
    setErrorMsg(null);
    try {
      await api.saveDraftAnswer({
        id: currentAnswer?.id,
        studentId: 'usr-stu-1',
        questionId,
        answerText: correctedOcrText,
        submissionMethod: submissionChoice,
        typedAnswerText: typedText,
        rawOcrText,
        correctedOcrText,
        ocrStatus,
        ocrConfidence,
        ocrUncertaintyFlags,
        hasOcrUnclear,
        handwrittenPages,
      });
      setStatusMsg('✓ Corrections saved to draft.');
      setTimeout(() => setStatusMsg(null), 3000);
    } catch (e: any) {
      setErrorMsg(e.message || 'Failed to save corrections.');
    } finally {
      setIsSaving(false);
    }
  };

  // Confirm OCR Text (moves state to READY_TO_SUBMIT)
  const handleConfirmOcr = () => {
    if (!correctedOcrText.trim()) {
      setErrorMsg('Extracted answer text cannot be empty.');
      return;
    }

    if (correctedOcrText.includes('[UNCLEAR]')) {
      const proceed = window.confirm(
        'Warning: Your answer contains "[UNCLEAR]" markers. We recommend replacing them with your intended words before confirming. Do you want to confirm anyway?'
      );
      if (!proceed) return;
    }

    setOcrStatus('CONFIRMED');
    setWorkflowState('READY_TO_SUBMIT');
    setStatusMsg('✓ Answer verified & confirmed! Ready to submit for formal evaluation.');

    if (!typedText.trim()) {
      setSubmissionChoice('HANDWRITTEN_OCR');
    } else {
      setStatusMsg('✓ Answer verified. Both typed and handwritten answers are available—select which one to submit below.');
    }
  };

  // Compare Typed and OCR
  const handleRunComparison = async () => {
    if (!typedText.trim() || !correctedOcrText.trim()) {
      setErrorMsg('Both typed answer and handwritten OCR answer must be present to compare.');
      return;
    }

    setIsComparing(true);
    setErrorMsg(null);
    try {
      const comp = await api.compareAnswers(typedText, correctedOcrText);
      setComparisonResult(comp);
      if (!combinedText) {
        setCombinedText(`${typedText}\n\n[Handwritten Additions]:\n${correctedOcrText}`);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Comparison failed');
    } finally {
      setIsComparing(false);
    }
  };

  // Save Draft
  const handleSaveDraft = async () => {
    setIsSaving(true);
    setStatusMsg(null);
    setErrorMsg(null);

    try {
      const finalSelectedText = getActiveAnswerText();
      const saved = await api.saveDraftAnswer({
        id: currentAnswer?.id,
        studentId: 'usr-stu-1',
        questionId,
        answerText: finalSelectedText,
        submissionMethod: submissionChoice,
        typedAnswerText: typedText,
        rawOcrText,
        correctedOcrText,
        ocrStatus,
        ocrConfidence,
        ocrUncertaintyFlags,
        hasOcrUnclear,
        handwrittenPages,
        comparisonResult: comparisonResult || undefined,
      });

      setCurrentAnswer(saved);
      setStatusMsg('Draft saved successfully at ' + new Date().toLocaleTimeString());
      setTimeout(() => setStatusMsg(null), 3500);
    } catch (e: any) {
      setErrorMsg(e.message || 'Failed to save draft');
    } finally {
      setIsSaving(false);
    }
  };

  // Final Submit and Evaluation Execution
  const handleSubmit = async () => {
    const finalSelectedText = getActiveAnswerText();
    const finalWordCount = finalSelectedText.trim().split(/\s+/).filter(Boolean).length;

    if (finalWordCount < 20) {
      setErrorMsg('Please ensure your answer is comprehensive (minimum 20 words required for formal academic evaluation).');
      return;
    }

    if (submissionChoice === 'HANDWRITTEN_OCR' && ocrStatus !== 'CONFIRMED') {
      setErrorMsg('Please click "Confirm Extracted Text" on your handwritten answer before submitting.');
      return;
    }

    setIsSubmitting(true);
    setWorkflowState('SUBMITTED');
    setStatusMsg('Submitting answer and launching ExplainGrade AI evaluation engine...');
    setErrorMsg(null);

    try {
      // 1. Save draft with final confirmed answer
      const saved = await api.saveDraftAnswer({
        id: currentAnswer?.id,
        studentId: 'usr-stu-1',
        questionId,
        answerText: finalSelectedText,
        submissionMethod: submissionChoice,
        typedAnswerText: typedText,
        rawOcrText,
        correctedOcrText,
        ocrStatus: 'CONFIRMED',
        ocrConfidence,
        ocrUncertaintyFlags,
        hasOcrUnclear,
        handwrittenPages,
        comparisonResult: comparisonResult || undefined,
      });

      // 2. Submit & lock
      const submitted = await api.submitAnswer(saved.id, {
        answerText: finalSelectedText,
        submissionMethod: submissionChoice,
        correctedOcrText,
        handwrittenPages,
      });

      setCurrentAnswer(submitted);

      // 3. Trigger evaluation pipeline (evaluates the verified OCR text against official rubrics)
      await api.runEvaluation(submitted.id);

      setWorkflowState('EVALUATED');
      setStatusMsg('✓ Evaluation completed! Navigating to feedback report...');

      if (onSubmitted) {
        onSubmitted(submitted.id);
      }
    } catch (e: any) {
      setErrorMsg(e.message || 'Submission or evaluation failed');
      setWorkflowState('READY_TO_SUBMIT');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col w-full space-y-6 pb-16">
      {/* Hidden real file inputs */}
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        multiple
        accept="image/png,image/jpeg,image/jpg,image/webp"
        onChange={(e) => handleFilesSelected(e.target.files)}
      />
      <input
        type="file"
        ref={replacePageInputRef}
        className="hidden"
        accept="image/png,image/jpeg,image/jpg,image/webp"
        onChange={handlePageReplaced}
      />

      {/* Top Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-blue-50 text-blue-700 text-xs font-semibold mb-1 border border-blue-200/60">
            <span className="material-symbols-outlined text-[15px]">edit_note</span>
            <span>Student Descriptive Examination Workspace</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight font-display-lg">
            {question?.courseCode || 'CS231n'} Midterm Exam · Question 04
          </h1>
          <p className="text-sm text-slate-500 mt-0.5 font-body-sm">
            Submit either typed text or handwritten photos. Handwriting is transcribed using Gemini Multimodal Vision, verified by you, and evaluated against official rubrics.
          </p>
        </div>

        {/* Workflow Status Chip */}
        <div className="flex items-center gap-2 shrink-0">
          <span
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border flex items-center gap-1.5 ${
              workflowState === 'EVALUATED'
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                : workflowState === 'SUBMITTED'
                ? 'bg-blue-50 text-blue-800 border-blue-200'
                : workflowState === 'OCR_PROCESSING'
                ? 'bg-purple-50 text-purple-800 border-purple-200'
                : workflowState === 'READY_TO_SUBMIT'
                ? 'bg-teal-50 text-teal-800 border-teal-200'
                : 'bg-amber-50 text-amber-800 border-amber-200'
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                workflowState === 'EVALUATED'
                  ? 'bg-emerald-500'
                  : workflowState === 'OCR_PROCESSING'
                  ? 'bg-purple-500 animate-spin'
                  : 'bg-amber-500 animate-pulse'
              }`}
            ></span>
            {workflowState === 'EVALUATED'
              ? 'Submission Evaluated'
              : workflowState === 'SUBMITTED'
              ? 'Submitted & Evaluating'
              : workflowState === 'OCR_PROCESSING'
              ? 'Extracting Handwriting...'
              : workflowState === 'OCR_REVIEW'
              ? 'OCR Review & Verification'
              : workflowState === 'READY_TO_SUBMIT'
              ? 'Ready to Submit'
              : 'Draft Mode (Editable)'}
          </span>
        </div>
      </div>

      {/* Evaluated Notice Banner (Allows starting a fresh submission attempt or viewing feedback) */}
      {workflowState === 'EVALUATED' && (
        <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-50 to-blue-50 border border-emerald-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-emerald-950 font-medium">
            <span className="material-symbols-outlined text-[20px] text-emerald-600">verified</span>
            <span>
              <strong>Previous submission has been evaluated (Mark: 7.5 / 10.0).</strong> You can view the full gap analysis or start a fresh attempt to upload new handwritten photos and re-evaluate.
            </span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => handleStartNewAttempt(true)}
              disabled={isSaving}
              className="px-3.5 py-1.5 rounded-lg bg-white hover:bg-slate-50 text-blue-700 font-semibold border border-blue-200 shadow-xs cursor-pointer flex items-center gap-1 transition-all"
            >
              <span className="material-symbols-outlined text-[15px]">add_photo_alternate</span>
              <span>Upload New Handwritten Answer</span>
            </button>
            {onSubmitted && currentAnswer && (
              <button
                type="button"
                onClick={() => onSubmitted(currentAnswer.id)}
                className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow-xs cursor-pointer flex items-center gap-1 transition-all"
              >
                <span className="material-symbols-outlined text-[15px]">insights</span>
                <span>View Gap Analysis</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Target Question Details Card */}
      {question && (
        <section className="p-5 sm:p-6 rounded-2xl bg-white shadow-xs border border-slate-200/80 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 font-rubric-metric">
              Target Question Prompt
            </span>
            <span className="px-2.5 py-0.5 rounded bg-blue-50 text-blue-700 text-xs font-bold border border-blue-200/60 font-code-eval">
              Max {question.maxMarks.toFixed(1)} Marks
            </span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 leading-snug font-headline-md">
            {question.prompt}
          </h2>
          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            <span className="text-xs text-slate-500 font-medium mr-1">Expected Concepts:</span>
            {question.keyConcepts.map((concept, idx) => (
              <span
                key={idx}
                className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[11px] font-medium border border-slate-200/60"
              >
                {concept}
              </span>
            ))}
          </div>
        </section>
      )}

      {/* Editor & Multi-Input Workspace */}
      <section className="p-6 sm:p-8 rounded-[18px] bg-white shadow-xs border border-slate-200/80 space-y-5">
        {/* Status Alerts */}
        {statusMsg && (
          <div className="p-3.5 rounded-xl bg-emerald-50 text-emerald-900 border border-emerald-200 text-xs font-medium flex items-center gap-2.5 animate-in fade-in duration-200">
            <span className="material-symbols-outlined text-[18px] text-emerald-600 shrink-0">check_circle</span>
            <span>{statusMsg}</span>
          </div>
        )}
        {errorMsg && (
          <div className="p-3.5 rounded-xl bg-red-50 text-red-900 border border-red-200 text-xs font-medium flex items-center justify-between gap-2.5 animate-in fade-in duration-200">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px] text-red-600 shrink-0">error</span>
              <span>{errorMsg}</span>
            </div>
            {handwrittenPages.length > 0 && isExtractingOcr === false && (
              <button
                type="button"
                onClick={handleExtractOcr}
                className="px-2.5 py-1 rounded bg-red-100 hover:bg-red-200 text-red-800 text-[11px] font-semibold cursor-pointer shrink-0 transition-colors"
              >
                Retry OCR
              </button>
            )}
          </div>
        )}

        {/* Section Heading & Word Counts */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-200/80 gap-2">
          <div>
            <h3 className="text-base font-bold text-slate-900 font-headline-md">Your Descriptive Response</h3>
            <p className="text-xs text-slate-500">
              Choose an input method below: type directly or upload photos of your handwritten answer for real Gemini OCR transcription.
            </p>
          </div>
          <div className="flex items-center gap-3 text-xs text-slate-500 font-mono">
            <span>
              Active: <strong className="text-slate-900">{wordCount}</strong> words
            </span>
            <span>•</span>
            <span>{charCount} chars</span>
            {isFinalized && <span className="text-amber-700 font-semibold">(Read-Only)</span>}
          </div>
        </div>

        {/* SECTION 1: Two Input Options Navigation */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-1.5 rounded-xl bg-slate-100 border border-slate-200/80">
          <div className="flex items-center gap-1.5">
            {/* Type Answer Button */}
            <button
              type="button"
              onClick={() => setInputMode('typed')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                inputMode === 'typed'
                  ? 'bg-white text-blue-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">keyboard</span>
              <span>Type Answer</span>
              {typedText.trim() && (
                <span className="w-2 h-2 rounded-full bg-blue-600 ml-0.5"></span>
              )}
            </button>

            {/* Upload Handwritten Answer Button (Directly opens real OS file picker) */}
            <button
              type="button"
              onClick={handleUploadButtonClick}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                inputMode === 'handwritten'
                  ? 'bg-white text-blue-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">add_photo_alternate</span>
              <span>Upload Handwritten Answer</span>
              {handwrittenPages.length > 0 && (
                <span className="px-1.5 py-0.2 rounded-full bg-blue-100 text-blue-800 text-[10px] font-bold">
                  {handwrittenPages.length} {handwrittenPages.length === 1 ? 'page' : 'pages'}
                </span>
              )}
            </button>
          </div>

          {/* Compare Answers Button (When both typed text and verified OCR text exist) */}
          {hasBothAnswers && (
            <button
              type="button"
              onClick={() => {
                setInputMode('compare');
                if (!comparisonResult) {
                  handleRunComparison();
                }
              }}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                inputMode === 'compare'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200/80'
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">compare_arrows</span>
              <span>Compare Answers</span>
              <span className="px-1.5 py-0.5 rounded bg-blue-500/20 text-[10px]">Both Available</span>
            </button>
          )}
        </div>

        {/* INPUT MODE 1: Typed Answer Direct Canvas */}
        {inputMode === 'typed' && (
          <div className="space-y-3 animate-in fade-in duration-150">
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span className="font-medium text-slate-700">Type your answer directly:</span>
              <span>Formatting and technical equations preserved</span>
            </div>
            <textarea
              rows={14}
              readOnly={isFinalized}
              value={typedText}
              onChange={(e) => {
                setTypedText(e.target.value);
                if (submissionChoice === 'TYPED') {
                  // Keep active
                }
              }}
              placeholder="Begin typing your detailed response here..."
              className="w-full p-4 rounded-xl bg-slate-50 text-slate-900 border border-slate-200/90 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600/30 focus:border-blue-600 transition-all resize-y leading-relaxed font-sans"
            />
            {hasBothAnswers && (
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
                <span className="text-slate-600">
                  You also have a verified handwritten answer uploaded.
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setInputMode('compare');
                    if (!comparisonResult) handleRunComparison();
                  }}
                  className="text-blue-600 font-semibold hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[15px]">compare_arrows</span>
                  Compare with Handwritten OCR
                </button>
              </div>
            )}
          </div>
        )}

        {/* INPUT MODE 2: Upload Handwritten Answer (Photos + OCR Extraction) */}
        {inputMode === 'handwritten' && (
          <div className="space-y-6 animate-in fade-in duration-150">
            {/* Drag & Drop Upload Area (Opens real file picker) */}
            {!isFinalized && (
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleFilesSelected(e.dataTransfer.files);
                }}
                className="border-2 border-dashed border-blue-200 hover:border-blue-400 bg-blue-50/40 rounded-2xl p-6 sm:p-8 text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-2 group"
                onClick={() => fileInputRef.current?.click()}
              >
                <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined text-[26px]">add_photo_alternate</span>
                </div>
                <div>
                  <span className="text-sm font-bold text-slate-800">
                    Click to browse or drag and drop photos of your handwritten answer
                  </span>
                  <span className="text-slate-500 text-xs block mt-0.5">
                    Select one or multiple pages (JPG, JPEG, PNG, or WEBP)
                  </span>
                </div>
                <div className="flex flex-wrap items-center justify-center gap-2 text-[11px] text-slate-500 pt-1">
                  <span className="px-2 py-0.5 rounded bg-white border border-slate-200 font-mono">JPG</span>
                  <span className="px-2 py-0.5 rounded bg-white border border-slate-200 font-mono">JPEG</span>
                  <span className="px-2 py-0.5 rounded bg-white border border-slate-200 font-mono">PNG</span>
                  <span className="px-2 py-0.5 rounded bg-white border border-slate-200 font-mono">WEBP</span>
                  <span>• Up to 10MB per page • Multi-page support</span>
                </div>
                <button
                  type="button"
                  className="mt-2 px-5 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
                  onClick={(e) => {
                    e.stopPropagation();
                    fileInputRef.current?.click();
                  }}
                >
                  <span className="material-symbols-outlined text-[16px]">upload_file</span>
                  <span>Choose Photos</span>
                </button>
              </div>
            )}

            {/* Uploaded Pages Gallery & Reorder Controls */}
            {handwrittenPages.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-1 border-b border-slate-200/60">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-800 uppercase tracking-wide font-rubric-metric">
                      HANDWRITTEN ANSWER PAGES ({handwrittenPages.length})
                    </span>
                    <span className="text-xs text-slate-500">
                      — Processed in sequential page order
                    </span>
                  </div>
                  {!isFinalized && (
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="text-xs text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-1 cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[16px]">add</span>
                      Add More Pages
                    </button>
                  )}
                </div>

                {/* Previews Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {handwrittenPages.map((page, idx) => (
                    <div
                      key={idx}
                      className="relative rounded-xl border border-slate-200 bg-white overflow-hidden shadow-xs flex flex-col group hover:border-blue-300 transition-all"
                    >
                      {/* Page Header Ribbon */}
                      <div className="px-3 py-2 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs">
                        <span className="font-bold text-blue-700 flex items-center gap-1.5 font-code-eval">
                          <span className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center text-[11px] font-bold">
                            {page.pageNumber}
                          </span>
                          Page {page.pageNumber}
                        </span>

                        {!isFinalized && (
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => movePage(idx, 'up')}
                              disabled={idx === 0 || isExtractingOcr}
                              className="p-1 rounded hover:bg-slate-200 text-slate-600 disabled:opacity-30 cursor-pointer"
                              title="Move Earlier"
                            >
                              <span className="material-symbols-outlined text-[16px]">arrow_back</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => movePage(idx, 'down')}
                              disabled={idx === handwrittenPages.length - 1 || isExtractingOcr}
                              className="p-1 rounded hover:bg-slate-200 text-slate-600 disabled:opacity-30 cursor-pointer"
                              title="Move Later"
                            >
                              <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => startReplacePage(idx)}
                              disabled={isExtractingOcr}
                              className="p-1 rounded hover:bg-slate-200 text-slate-600 cursor-pointer"
                              title="Replace Photo"
                            >
                              <span className="material-symbols-outlined text-[16px]">swap_horiz</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => removePage(idx)}
                              disabled={isExtractingOcr}
                              className="p-1 rounded hover:bg-red-50 text-red-600 cursor-pointer"
                              title="Remove Page"
                            >
                              <span className="material-symbols-outlined text-[16px]">delete</span>
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Image Thumbnail */}
                      <div
                        onClick={() => setActivePreviewImage(page.imageUrl)}
                        className="relative h-44 overflow-hidden bg-slate-900 cursor-zoom-in"
                        title="Click to enlarge"
                      >
                        <img
                          src={page.imageUrl}
                          alt={`Handwritten answer page ${page.pageNumber}`}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/75 via-transparent to-transparent flex items-end p-2.5">
                          <span className="text-white text-xs font-medium truncate">
                            {page.imageName}
                          </span>
                        </div>
                      </div>

                      {/* Card Footer Status */}
                      <div className="p-2.5 bg-slate-50 border-t border-slate-200 text-[11px] text-slate-500 flex items-center justify-between">
                        <span>Click photo to enlarge</span>
                        {page.rawOcrText ? (
                          <span className="text-emerald-700 font-semibold flex items-center gap-0.5">
                            <span className="material-symbols-outlined text-[13px]">check_circle</span>
                            Extracted
                          </span>
                        ) : (
                          <span className="text-slate-400">Ready for OCR</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Extract Button (Shown ONLY after images are selected) */}
                {!isFinalized && (
                  <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl bg-blue-50/50 border border-blue-200">
                    <div className="text-xs text-slate-700">
                      <strong className="text-slate-900 font-semibold">Ready to extract:</strong>{' '}
                      Gemini Vision will transcribe your handwritten answers exactly as written across all {handwrittenPages.length}{' '}
                      {handwrittenPages.length === 1 ? 'page' : 'pages'}.
                    </div>
                    <button
                      type="button"
                      onClick={handleExtractOcr}
                      disabled={isExtractingOcr || handwrittenPages.length === 0}
                      className="px-5 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-semibold shadow-xs flex items-center justify-center gap-2 cursor-pointer shrink-0 transition-colors"
                    >
                      <span className="material-symbols-outlined text-[18px]">
                        {isExtractingOcr ? 'progress_activity' : 'document_scanner'}
                      </span>
                      <span>
                        {isExtractingOcr
                          ? 'Extracting Handwriting...'
                          : 'Extract Text from Handwritten Answer'}
                      </span>
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* OCR Progress UI (Requirement 7) */}
            {isExtractingOcr && (
              <div className="p-5 sm:p-6 rounded-2xl bg-blue-50/80 border border-blue-200 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="inline-flex items-center gap-2 text-sm font-bold text-blue-950">
                    <span className="material-symbols-outlined animate-spin text-[20px] text-blue-600">
                      progress_activity
                    </span>
                    <span>Extracting handwritten answer...</span>
                  </div>
                  <span className="text-xs font-mono font-bold text-blue-800">
                    Page {currentExtractingPage || 1} of {handwrittenPages.length}
                  </span>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-blue-200/70 rounded-full h-3 overflow-hidden">
                  <div
                    className="bg-blue-600 h-full rounded-full transition-all duration-300"
                    style={{
                      width: `${Math.round(
                        ((pageExtractionStatuses.filter((s) => s.status === 'done').length +
                          (currentExtractingPage > 0 ? 0.5 : 0)) /
                          handwrittenPages.length) *
                          100
                      )}%`,
                    }}
                  />
                </div>

                {/* Granular Page List Progress */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 pt-1">
                  {pageExtractionStatuses.map((ps) => (
                    <div
                      key={ps.pageNum}
                      className={`p-2.5 rounded-lg border text-xs flex items-center justify-between ${
                        ps.status === 'done'
                          ? 'bg-emerald-50 border-emerald-200 text-emerald-900 font-semibold'
                          : ps.status === 'extracting'
                          ? 'bg-white border-blue-400 text-blue-900 font-bold shadow-xs animate-pulse'
                          : ps.status === 'failed'
                          ? 'bg-red-50 border-red-200 text-red-900'
                          : 'bg-slate-50 border-slate-200 text-slate-500'
                      }`}
                    >
                      <span className="flex items-center gap-1.5">
                        {ps.status === 'done' && (
                          <span className="material-symbols-outlined text-[16px] text-emerald-600">check_circle</span>
                        )}
                        {ps.status === 'extracting' && (
                          <span className="material-symbols-outlined text-[16px] text-blue-600 animate-spin">
                            progress_activity
                          </span>
                        )}
                        {ps.status === 'waiting' && (
                          <span className="material-symbols-outlined text-[16px] text-slate-400">hourglass_empty</span>
                        )}
                        {ps.status === 'failed' && (
                          <span className="material-symbols-outlined text-[16px] text-red-600">error</span>
                        )}
                        <span>Page {ps.pageNum}</span>
                      </span>
                      <span className="text-[11px] capitalize">
                        {ps.status === 'done'
                          ? '✓ extracted'
                          : ps.status === 'extracting'
                          ? '⟳ extracting'
                          : ps.status === 'failed'
                          ? 'failed'
                          : 'waiting'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* EXTRACTED ANSWER SECTION (Requirements 8, 9, 10) */}
            {(correctedOcrText || rawOcrText) && (
              <div className="p-5 sm:p-7 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-5">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-200/80">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-base font-bold text-slate-900 font-headline-md">
                        EXTRACTED ANSWER
                      </h4>
                      {ocrConfidence > 0 && (
                        <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200 text-[11px] font-semibold font-code-eval">
                          {ocrConfidence}% OCR Confidence
                        </span>
                      )}
                      {ocrStatus === 'CONFIRMED' && (
                        <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 border border-emerald-300 text-[11px] font-semibold flex items-center gap-1">
                          <span className="material-symbols-outlined text-[13px]">verified</span>
                          Answer Verified
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Review & Correct Extracted Text — please verify the extracted text against your handwritten answer before submitting.
                    </p>
                  </div>

                  <span className="text-xs font-mono text-slate-500">
                    {correctedOcrText.trim().split(/\s+/).filter(Boolean).length} words
                  </span>
                </div>

                {/* Per-Page Extracted Text Preview Cards */}
                {handwrittenPages.some((p) => p.rawOcrText) && (
                  <div className="space-y-3">
                    <span className="text-xs font-bold text-slate-700 uppercase tracking-wide font-rubric-metric">
                      Page Breakdown
                    </span>
                    <div className="grid grid-cols-1 gap-3">
                      {handwrittenPages.map((p) => (
                        <div
                          key={p.pageNumber}
                          className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1.5"
                        >
                          <div className="flex items-center justify-between font-bold text-blue-800">
                            <span>PAGE {p.pageNumber}</span>
                            {p.hasUnclear && (
                              <span className="text-amber-700 text-[11px] font-medium flex items-center gap-1">
                                <span className="material-symbols-outlined text-[14px]">warning</span>
                                Contains [UNCLEAR]
                              </span>
                            )}
                          </div>
                          <p className="text-slate-800 whitespace-pre-wrap leading-relaxed max-h-36 overflow-y-auto font-sans bg-white p-2.5 rounded-lg border border-slate-200/70">
                            {p.rawOcrText || '[Pending extraction]'}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* UNCLEAR Warning Banner (Requirement 10) */}
                {(hasOcrUnclear || correctedOcrText.includes('[UNCLEAR]')) && (
                  <div className="p-4 rounded-xl bg-amber-50 border border-amber-300 text-amber-900 text-xs space-y-2">
                    <div className="font-bold flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-[18px] text-amber-600">warning</span>
                        <span>⚠ Unclear handwriting detected</span>
                      </div>
                      <button
                        type="button"
                        onClick={handleJumpToUnclear}
                        className="px-2.5 py-1 rounded bg-amber-200 hover:bg-amber-300 text-amber-900 text-[11px] font-semibold cursor-pointer transition-colors"
                      >
                        Locate [UNCLEAR] in Text
                      </button>
                    </div>
                    <p className="leading-relaxed">
                      The extracted text contains uncertain sections marked{' '}
                      <code className="bg-amber-200/80 px-1.5 py-0.5 rounded font-mono font-bold text-amber-950">[UNCLEAR]</code>.
                      Please review your original image, edit the text below to replace <code className="font-mono">[UNCLEAR]</code> with your intended words, and confirm.
                    </p>
                    {ocrUncertaintyFlags.length > 0 && (
                      <ul className="list-disc pl-5 space-y-0.5 text-[11px] text-amber-800">
                        {ocrUncertaintyFlags.map((flag, idx) => (
                          <li key={idx}>{flag}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}

                {/* Editable Extracted Textarea (Requirement 9) */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <label className="font-bold text-slate-800">
                      Review & Correct Extracted Text:
                    </label>
                    <span className="text-slate-500">
                      Editable · Changes will be submitted for grading
                    </span>
                  </div>
                  <textarea
                    ref={ocrTextareaRef}
                    rows={12}
                    readOnly={isFinalized}
                    value={correctedOcrText}
                    onChange={(e) => {
                      setCorrectedOcrText(e.target.value);
                      if (ocrStatus === 'CONFIRMED') {
                        setOcrStatus('EXTRACTED');
                      }
                    }}
                    className="w-full p-4 rounded-xl bg-slate-50 text-slate-900 border border-slate-200/90 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600/30 focus:border-blue-600 transition-all resize-y leading-relaxed font-sans"
                    placeholder="Full extracted text appears here for your verification and edits..."
                  />
                </div>

                {/* Control Buttons (Re-extract, Save Corrections, Confirm Extracted Text) */}
                {!isFinalized && (
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-slate-200/60">
                    <div className="text-xs text-slate-500">
                      {ocrStatus === 'CONFIRMED'
                        ? '✓ Answer verified. Click "Submit Final Answer" below to evaluate.'
                        : 'Confirm the extracted text once you have verified its accuracy.'}
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={handleExtractOcr}
                        disabled={isExtractingOcr}
                        className="px-3.5 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5"
                      >
                        <span className="material-symbols-outlined text-[16px]">refresh</span>
                        <span>Re-extract</span>
                      </button>

                      <button
                        type="button"
                        onClick={handleSaveCorrections}
                        disabled={isSaving}
                        className="px-3.5 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5"
                      >
                        <span className="material-symbols-outlined text-[16px]">save</span>
                        <span>Save Corrections</span>
                      </button>

                      <button
                        type="button"
                        onClick={handleConfirmOcr}
                        className={`px-4 py-2 rounded-lg text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-all cursor-pointer ${
                          ocrStatus === 'CONFIRMED'
                            ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                            : 'bg-blue-600 text-white hover:bg-blue-700'
                        }`}
                      >
                        <span className="material-symbols-outlined text-[16px]">
                          {ocrStatus === 'CONFIRMED' ? 'check_circle' : 'verified'}
                        </span>
                        <span>{ocrStatus === 'CONFIRMED' ? 'Text Confirmed' : 'Confirm Extracted Text'}</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* INPUT MODE 3: Compare Typed vs OCR (Workflow C) */}
        {inputMode === 'compare' && hasBothAnswers && (
          <div className="space-y-6 animate-in fade-in duration-150">
            {/* Header / Intro */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl bg-blue-50/70 border border-blue-200">
              <div>
                <h4 className="text-sm font-bold text-blue-950 flex items-center gap-1.5 font-headline-md">
                  <span className="material-symbols-outlined text-[18px] text-blue-600">compare_arrows</span>
                  Typed Answer vs. Verified Handwritten OCR Comparison
                </h4>
                <p className="text-xs text-blue-800 mt-0.5">
                  Review differences side by side, then select which version you would like to submit for grading.
                </p>
              </div>
              <button
                type="button"
                onClick={handleRunComparison}
                disabled={isComparing}
                className="px-3.5 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 transition-colors shadow-xs flex items-center gap-1 cursor-pointer shrink-0"
              >
                <span className="material-symbols-outlined text-[15px]">refresh</span>
                <span>{isComparing ? 'Comparing...' : 'Refresh Comparison'}</span>
              </button>
            </div>

            {/* Side-by-Side Dual Viewport */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {/* Left Pane: Typed Answer */}
              <div
                className={`p-5 rounded-2xl border transition-all flex flex-col justify-between ${
                  submissionChoice === 'TYPED'
                    ? 'border-blue-600 bg-blue-50/20 ring-2 ring-blue-600/20'
                    : 'border-slate-200 bg-slate-50/40'
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                    <div className="flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[18px] text-blue-600">keyboard</span>
                      <span className="text-xs font-bold text-slate-900">TYPED ANSWER</span>
                    </div>
                    <span className="text-xs font-mono text-slate-500">
                      {typedText.trim().split(/\s+/).filter(Boolean).length} words
                    </span>
                  </div>
                  <div className="text-xs text-slate-800 leading-relaxed max-h-80 overflow-y-auto whitespace-pre-wrap font-sans p-3 bg-white rounded-xl border border-slate-200/80">
                    {typedText}
                  </div>
                </div>

                {!isFinalized && (
                  <div className="pt-4 border-t border-slate-200/80 mt-3 flex items-center justify-between">
                    <span className="text-[11px] text-slate-500">Directly typed in workspace</span>
                    <button
                      type="button"
                      onClick={() => {
                        setSubmissionChoice('TYPED');
                        setStatusMsg('Selected Typed Answer for final evaluation.');
                      }}
                      className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                        submissionChoice === 'TYPED'
                          ? 'bg-blue-600 text-white shadow-xs'
                          : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
                      }`}
                    >
                      {submissionChoice === 'TYPED' ? '✓ Using Typed Answer' : 'Use Typed Answer'}
                    </button>
                  </div>
                )}
              </div>

              {/* Right Pane: Verified Handwritten OCR */}
              <div
                className={`p-5 rounded-2xl border transition-all flex flex-col justify-between ${
                  submissionChoice === 'HANDWRITTEN_OCR'
                    ? 'border-blue-600 bg-blue-50/20 ring-2 ring-blue-600/20'
                    : 'border-slate-200 bg-slate-50/40'
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                    <div className="flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[18px] text-blue-600">draw</span>
                      <span className="text-xs font-bold text-slate-900">HANDWRITTEN OCR</span>
                      {ocrConfidence > 0 && (
                        <span className="px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                          {ocrConfidence}% Conf
                        </span>
                      )}
                    </div>
                    <span className="text-xs font-mono text-slate-500">
                      {correctedOcrText.trim().split(/\s+/).filter(Boolean).length} words
                    </span>
                  </div>
                  <div className="text-xs text-slate-800 leading-relaxed max-h-80 overflow-y-auto whitespace-pre-wrap font-sans p-3 bg-white rounded-xl border border-slate-200/80">
                    {correctedOcrText}
                  </div>
                </div>

                {!isFinalized && (
                  <div className="pt-4 border-t border-slate-200/80 mt-3 flex items-center justify-between">
                    <span className="text-[11px] text-slate-500">
                      Transcribed from {handwrittenPages.length} {handwrittenPages.length === 1 ? 'page' : 'pages'}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setSubmissionChoice('HANDWRITTEN_OCR');
                        setStatusMsg('Selected Verified OCR Answer for final evaluation.');
                      }}
                      className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                        submissionChoice === 'HANDWRITTEN_OCR'
                          ? 'bg-blue-600 text-white shadow-xs'
                          : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
                      }`}
                    >
                      {submissionChoice === 'HANDWRITTEN_OCR'
                        ? '✓ Using OCR Answer'
                        : 'Use OCR Answer'}
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Semantic Difference Analysis Card */}
            {comparisonResult && (
              <div className="p-5 sm:p-6 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200/80">
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wide flex items-center gap-1.5 font-rubric-metric">
                    <span className="material-symbols-outlined text-[16px] text-blue-600">analytics</span>
                    Semantic Alignment & Diff Breakdown
                  </h4>
                  <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 font-bold text-xs font-code-eval">
                    {comparisonResult.similarityScore}% Semantic Alignment
                  </span>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">
                  <strong className="text-slate-900">Analysis Summary:</strong> {comparisonResult.summary}
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                  <div className="p-3.5 rounded-xl bg-emerald-50/60 border border-emerald-200/80 space-y-1.5">
                    <span className="text-xs font-bold text-emerald-900 flex items-center gap-1">
                      <span className="material-symbols-outlined text-[15px] text-emerald-700">add_circle</span>
                      Handwritten Additions / Extensions:
                    </span>
                    <ul className="text-xs text-emerald-950 space-y-1 list-disc pl-4">
                      {comparisonResult.additions.map((item, idx) => (
                        <li key={idx}>{item}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="p-3.5 rounded-xl bg-amber-50/60 border border-amber-200/80 space-y-1.5">
                    <span className="text-xs font-bold text-amber-900 flex items-center gap-1">
                      <span className="material-symbols-outlined text-[15px] text-amber-700">remove_circle</span>
                      Typed Points Missing in Handwriting:
                    </span>
                    <ul className="text-xs text-amber-950 space-y-1 list-disc pl-4">
                      {comparisonResult.omissions.map((item, idx) => (
                        <li key={idx}>{item}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Action Bar (Save Draft & Submit Answer) */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-slate-200/80">
          <div className="text-xs text-slate-500">
            {isFinalized ? (
              <span className="text-emerald-700 font-semibold flex items-center gap-1">
                <span className="material-symbols-outlined text-[15px]">verified</span>
                This script has been finalized and evaluated by the ExplainGrade AI Engine.
              </span>
            ) : (
              <span>
                Submission Version:{' '}
                <strong className="text-slate-800">
                  {submissionChoice === 'TYPED'
                    ? 'Typed Answer'
                    : submissionChoice === 'HANDWRITTEN_OCR'
                    ? 'Verified Handwritten OCR'
                    : 'Manually Combined Answer'}
                </strong>{' '}
                ({wordCount} words)
              </span>
            )}
          </div>

          <div className="flex items-center gap-2.5">
            {!isFinalized && (
              <>
                <button
                  type="button"
                  onClick={handleSaveDraft}
                  disabled={isSaving || isSubmitting}
                  className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium border border-slate-200 transition-colors cursor-pointer"
                >
                  {isSaving ? 'Saving Draft...' : 'Save Draft'}
                </button>
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={isSubmitting || isSaving || isExtractingOcr}
                  className="px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-semibold shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[16px]">send</span>
                  <span>{isSubmitting ? 'Submitting & Evaluating...' : 'Submit Final Answer'}</span>
                </button>
              </>
            )}

            {isFinalized && (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleStartNewAttempt(true)}
                  className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium border border-slate-200 transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-[16px]">restart_alt</span>
                  <span>Revise / Retake</span>
                </button>
                {onSubmitted && currentAnswer && (
                  <button
                    type="button"
                    onClick={() => onSubmitted(currentAnswer.id)}
                    className="px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[16px]">insights</span>
                    <span>View Feedback & Gap Analysis</span>
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Image Preview Lightbox Modal */}
      {activePreviewImage && (
        <div
          onClick={() => setActivePreviewImage(null)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs cursor-zoom-out animate-in fade-in duration-200"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-4xl max-h-[85vh] bg-white rounded-2xl overflow-hidden shadow-2xl p-2 border border-slate-200 flex flex-col"
          >
            <div className="p-3 flex justify-between items-center text-slate-900 text-xs font-medium border-b border-slate-100">
              <span className="flex items-center gap-1.5 font-bold font-headline-md">
                <span className="material-symbols-outlined text-[16px] text-blue-600">image</span>
                Handwritten Script Photo Preview
              </span>
              <button
                onClick={() => setActivePreviewImage(null)}
                className="px-3 py-1 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors cursor-pointer text-xs"
                type="button"
              >
                Close
              </button>
            </div>
            <div className="overflow-auto p-2 flex items-center justify-center bg-slate-900 rounded-xl">
              <img
                src={activePreviewImage}
                alt="Enlarged handwritten scan preview"
                className="max-h-[72vh] w-auto object-contain rounded-lg shadow-md"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
