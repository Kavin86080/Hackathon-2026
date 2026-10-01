import React, { useState, useEffect } from 'react';
import { api } from '../services/api.ts';
import { StudentAnswer, Evaluation, Question } from '../types/index.ts';

interface AnswerEvaluationsProps {
  onNavigateToFeedback?: (answerId: string) => void;
}

export const AnswerEvaluations: React.FC<AnswerEvaluationsProps> = ({ onNavigateToFeedback }) => {
  const [answers, setAnswers] = useState<StudentAnswer[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [evaluation, setEvaluation] = useState<Evaluation | null>(null);
  const [question, setQuestion] = useState<Question | null>(null);
  const [manualScore, setManualScore] = useState<number>(7.5);
  const [facultyNotes, setFacultyNotes] = useState<string>(
    "Add confidential notes on student's handwritten scans, handwriting edge cases, or oral viva follow-up..."
  );
  const [isLoading, setIsLoading] = useState(false);
  const [isApproving, setIsApproving] = useState(false);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [activeAttachment, setActiveAttachment] = useState<string | null>(null);
  const [acceptPulse, setAcceptPulse] = useState(false);
  const [publishedToast, setPublishedToast] = useState(false);
  const [isSideBySideInspectionOpen, setIsSideBySideInspectionOpen] = useState(false);
  const [selectedScanPageIdx, setSelectedScanPageIdx] = useState(0);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const ansList = await api.getAnswers();
      setAnswers(ansList);
      if (ansList.length > 0) {
        const first = ansList[0];
        const evalRes = await api.getEvaluation(first.id).catch(() => null);
        const qRes = await api.getQuestion(first.questionId).catch(() => null);
        setEvaluation(evalRes);
        setQuestion(qRes);
        if (evalRes) {
          setManualScore(evalRes.facultyFinalScore);
          if (evalRes.facultyNotes) setFacultyNotes(evalRes.facultyNotes);
        }
      }
    } catch (e) {
      console.error('Error loading evaluation view data', e);
    } finally {
      setIsLoading(false);
    }
  };

  const currentAnswer = answers[currentIdx] || answers[0];

  const handleNext = () => {
    if (currentIdx < answers.length - 1) {
      setCurrentIdx((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentIdx > 0) {
      setCurrentIdx((prev) => prev - 1);
    }
  };

  const handleIncrement = () => {
    setManualScore((prev) => {
      const next = Math.min(10.0, +(prev + 0.5).toFixed(1));
      return next;
    });
  };

  const handleDecrement = () => {
    setManualScore((prev) => {
      const next = Math.max(0.0, +(prev - 0.5).toFixed(1));
      return next;
    });
  };

  const handleAcceptAiRec = () => {
    if (evaluation) {
      setManualScore(evaluation.aiRecommendedScore);
      setAcceptPulse(true);
      setTimeout(() => setAcceptPulse(false), 1200);
    }
  };

  const handleRunAiEvaluation = async () => {
    if (!currentAnswer) return;
    setIsEvaluating(true);
    try {
      const res = await api.runEvaluation(currentAnswer.id);
      setEvaluation(res.evaluation);
      setManualScore(res.evaluation.facultyFinalScore);
      if (res.evaluation.facultyNotes) setFacultyNotes(res.evaluation.facultyNotes);
    } catch (err) {
      console.error(err);
    } finally {
      setIsEvaluating(false);
    }
  };

  const handleApproveAndPublish = async () => {
    if (!evaluation) return;
    setIsApproving(true);
    try {
      await api.reviewEvaluation(evaluation.id, {
        facultyFinalScore: manualScore,
        facultyNotes,
        reviewerName: 'Prof. Elena Vance',
      });
      setPublishedToast(true);
      setTimeout(() => setPublishedToast(false), 3000);
      if (onNavigateToFeedback && currentAnswer) {
        setTimeout(() => onNavigateToFeedback(currentAnswer.id), 800);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsApproving(false);
    }
  };

  return (
    <div className="flex flex-col w-full pb-12 space-y-6">
      {publishedToast && (
        <div className="fixed top-20 right-8 z-50 p-4 rounded-xl bg-emerald-600 text-white shadow-xl flex items-center gap-3 animate-in slide-in-from-top-4 duration-300">
          <span className="material-symbols-outlined text-[24px]">verified</span>
          <div>
            <div className="font-bold text-sm">Marks Approved & Published!</div>
            <div className="text-xs opacity-90">
              Student feedback and gap analysis report unlocked for Alex Chen.
            </div>
          </div>
        </div>
      )}

      {/* Question Card */}
      <section className="w-full bg-white border border-slate-200/80 shadow-xs rounded-[18px] p-6 sm:p-8 lg:p-[36px] overflow-hidden">
        {/* Breadcrumb */}
        <nav className="flex flex-wrap items-center gap-2 text-xs text-slate-500 font-medium mb-5">
          <span className="hover:text-blue-600 transition-colors flex items-center gap-1 cursor-pointer">
            <span className="material-symbols-outlined text-[15px] text-blue-600">school</span>
            Assessments
          </span>
          <span className="text-slate-300">/</span>
          <span className="hover:text-blue-600 transition-colors cursor-pointer">CS231n Midterm Exam</span>
          <span className="text-slate-300">/</span>
          <span className="font-mono uppercase px-1.5 py-0.5 rounded bg-slate-100 text-slate-800 text-[11px] font-semibold">
            Question 04
          </span>
          <span className="text-slate-300">/</span>
          <span className="text-slate-900 font-medium">Deep Learning Architectures</span>
        </nav>

        {/* Question Header: Question title & Max marks */}
        <div className="mb-4">
          <h1
            className="text-2xl sm:text-3xl lg:text-[34px] xl:text-[36px] font-bold text-slate-900 tracking-tight leading-[1.2] mb-3"
            style={{ maxWidth: '750px' }}
          >
            Explain the working of a Convolutional Neural Network.
          </h1>
          <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 text-xs font-semibold">
            Max 10.0 Pts
          </span>
        </div>

        {/* Status Cards / Badges (placed BELOW the title on a separate flex row) */}
        <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-50 text-slate-700 text-xs font-medium border border-slate-200/80 shrink-0">
            <span className="material-symbols-outlined text-[16px] text-blue-600">description</span>
            <span>Descriptive Answer</span>
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-50 text-slate-700 text-xs font-medium border border-slate-200/80 shrink-0">
            <span className="material-symbols-outlined text-[16px] text-emerald-600">task_alt</span>
            <span>
              Cohort: <strong className="text-slate-900 font-semibold">84/84</strong> Processed
            </span>
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-50 text-slate-700 text-xs font-medium border border-slate-200/80 shrink-0">
            <span className="material-symbols-outlined text-[16px] text-blue-600">query_stats</span>
            <span>
              Mean AI Score: <strong className="text-slate-900 font-semibold">7.8</strong>/10
            </span>
          </div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-amber-50 text-amber-800 text-xs font-medium border border-amber-200/80 shrink-0">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
            <span>Review Pending</span>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-slate-200/80 my-6" />

        {/* Evaluation Controls */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 w-full">
          {/* Student Navigation: [ Previous ] [ Student Card ] [ Next ] */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handlePrev}
              disabled={currentIdx === 0}
              className="inline-flex items-center justify-center h-9 px-3.5 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 disabled:opacity-40 transition-colors text-xs font-medium cursor-pointer shrink-0"
              type="button"
            >
              <span className="material-symbols-outlined text-[16px] mr-1">arrow_back</span>
              Previous
            </button>
            <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-lg bg-slate-50 border border-slate-200 shrink-0">
              <img
                className="w-6 h-6 rounded-full object-cover ring-1 ring-slate-300 shrink-0"
                alt="Alex Chen portrait"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCdTw4MunwNqvV9FBxMGoTfVCgLz760JQDn4sbQpCAMeewe8Kep3cs3Hxgg5OUUszTmA3gpAZye9yp5dHexfgXUF_ZeY42ejcRkZvqSMHQ4QAd-ta0j9r_9jlmXyhHNEO2YUd3OE4guyOpk82CL64Lc7-k4Q-G4KlpB1cZmgJFe10zJMLfSk95UOVF16fr6bkOfEsQNZ4Q3Xgl3mcdKlc_vxZz6KLKbP6KC4ZUTtTAlLRycRtKohd9d"
              />
              <div className="flex items-center gap-2 text-xs whitespace-nowrap">
                <span className="text-slate-900 font-semibold">
                  Alex Chen
                </span>
                <span className="font-mono text-slate-500 text-[11px]">CS-2024-883</span>
                <span className="px-1.5 py-0.5 rounded bg-slate-200/70 text-slate-700 font-medium text-[11px]">
                  {currentIdx + 1} of {Math.max(answers.length, 84)}
                </span>
              </div>
            </div>
            <button
              onClick={handleNext}
              disabled={currentIdx >= answers.length - 1}
              className="inline-flex items-center justify-center h-9 px-3.5 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 disabled:opacity-40 transition-colors text-xs font-medium cursor-pointer shrink-0"
              type="button"
            >
              Next
              <span className="material-symbols-outlined text-[16px] ml-1">arrow_forward</span>
            </button>
          </div>

          {/* Action Suite Buttons */}
          <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 lg:justify-end">
            <button
              onClick={handleRunAiEvaluation}
              disabled={isEvaluating}
              className="inline-flex items-center justify-center gap-1.5 h-9 px-3.5 rounded-lg bg-white border border-slate-200 text-slate-700 text-xs font-medium hover:bg-slate-50 transition-colors shadow-xs cursor-pointer whitespace-nowrap"
              type="button"
            >
              <span className="material-symbols-outlined text-[16px] text-slate-500">
                {isEvaluating ? 'refresh' : 'smart_toy'}
              </span>
              <span>{isEvaluating ? 'Evaluating...' : 'Re-Run Evaluation'}</span>
            </button>
            <button
              onClick={() => {
                if (onNavigateToFeedback && currentAnswer) {
                  onNavigateToFeedback(currentAnswer.id);
                }
              }}
              className="inline-flex items-center justify-center gap-1.5 h-9 px-3.5 rounded-lg bg-white border border-slate-200 text-slate-700 text-xs font-medium hover:bg-slate-50 transition-colors shadow-xs cursor-pointer whitespace-nowrap"
              type="button"
            >
              <span className="material-symbols-outlined text-[16px] text-slate-500">insights</span>
              <span>View Feedback Report</span>
            </button>
            <button
              onClick={handleApproveAndPublish}
              disabled={isApproving}
              className="inline-flex items-center justify-center gap-1.5 h-9 px-4 rounded-lg bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 transition-colors shadow-xs cursor-pointer whitespace-nowrap"
              type="button"
            >
              <span className="material-symbols-outlined text-[16px]">verified</span>
              <span>{isApproving ? 'Publishing...' : 'Approve & Publish Marks'}</span>
            </button>
          </div>
        </div>
      </section>

      {/* Core Dual-Pane Evaluation Studio */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 w-full items-start">
        {/* LEFT COLUMN: Student Submission & Semantic Annotations (7 cols) */}
        <section className="lg:col-span-7 flex flex-col gap-5">
          {/* Submission Metadata Ribbon */}
          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-sm">
                AC
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-base font-bold text-slate-900">{currentAnswer?.studentName || 'Alex Chen'}</h2>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-[11px] font-semibold flex items-center gap-1">
                    <span className="material-symbols-outlined text-[13px]">check_circle</span> Verified Identity
                  </span>

                  {/* Submission Method Badge */}
                  {currentAnswer?.submissionMethod === 'HANDWRITTEN_OCR' || currentAnswer?.handwrittenPages?.length ? (
                    <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-[11px] font-semibold flex items-center gap-1">
                      <span className="material-symbols-outlined text-[13px]">document_scanner</span>
                      Handwritten OCR {currentAnswer?.ocrConfidence ? `(${currentAnswer.ocrConfidence}%)` : ''}
                    </span>
                  ) : currentAnswer?.submissionMethod === 'COMBINED' ? (
                    <span className="px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200 text-[11px] font-semibold flex items-center gap-1">
                      <span className="material-symbols-outlined text-[13px]">merge_type</span>
                      Combined (Typed + OCR)
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200 text-[11px] font-semibold flex items-center gap-1">
                      <span className="material-symbols-outlined text-[13px]">keyboard</span>
                      Typed Answer
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap items-center gap-2.5 text-slate-500 text-xs mt-0.5">
                  <span>Submitted 2h before deadline</span>
                  <span>•</span>
                  <span className="font-mono text-[11px]">{currentAnswer?.wordCount || 412} words</span>
                  <span>•</span>
                  <span
                    onClick={() => setIsSideBySideInspectionOpen(true)}
                    className="text-blue-600 hover:underline cursor-pointer flex items-center gap-0.5 font-medium"
                  >
                    <span className="material-symbols-outlined text-[13px]">document_scanner</span>
                    {currentAnswer?.handwrittenPages?.length || 3} handwritten scans attached
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1.5 self-end sm:self-center">
              <button
                onClick={() => setIsSideBySideInspectionOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-semibold border border-blue-200/80 transition-colors cursor-pointer"
                title="Inspect Original Handwritten Scan alongside Submitted Text"
                type="button"
              >
                <span className="material-symbols-outlined text-[16px]">compare</span>
                <span>Inspect Original Scan</span>
              </button>
              <button
                className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-900 transition-colors cursor-pointer"
                title="Toggle Fullscreen"
                type="button"
              >
                <span className="material-symbols-outlined text-[18px]">fullscreen</span>
              </button>
            </div>
          </div>

          {/* Descriptive Answer Viewport with Semantic AI Highlights */}
          <article className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 sm:p-7 relative">
            <div className="flex items-center justify-between pb-3 mb-5 border-b border-slate-200/80">
              <div className="flex items-center gap-2">
                <span className="font-mono text-slate-500 uppercase tracking-wider text-[11px] font-semibold">
                  Student Response Stream
                </span>
                <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[11px] font-medium">
                  OCR Confidence 99.4%
                </span>
              </div>
              <div className="flex items-center gap-3 text-slate-500 text-xs">
                <span className="inline-flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-sm bg-emerald-100 border border-emerald-500"></span> Full Match
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-sm bg-amber-100 border border-amber-500"></span> Partial Gap
                </span>
              </div>
            </div>

            {/* Student Body Text with Interactive Traceability Cards */}
            <div className="space-y-5 text-slate-800 leading-relaxed text-[15px]">
              {/* Paragraph 1: Definition with partial warning */}
              <div className="relative group">
                <p>
                  A Convolutional Neural Network (CNN) is a{' '}
                  <span className="bg-amber-100/70 text-amber-950 border-b-2 border-amber-400 px-1 py-0.5 rounded cursor-pointer transition-colors hover:bg-amber-200/80">
                    deep learning architecture primarily utilized for image recognition and computer vision tasks.
                  </span>{' '}
                  The network works by passing an input image through a series of specialized layers.
                </p>
                <div className="mt-3 p-3.5 rounded-xl bg-amber-50/70 border border-amber-200 text-slate-800 shadow-xs">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-amber-900 flex items-center gap-1.5 font-bold text-xs">
                      <span className="material-symbols-outlined text-[16px] text-amber-600">warning</span>
                      Criterion 1: Formal CNN Definition (Partial: +0.5 / 1.0)
                    </span>
                    <span className="font-mono text-slate-500 text-[11px]">Sem-Sim: 0.68</span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed pl-5">
                    AI Diagnostic: Generic high-level description provided. Lacks explicit specification of{' '}
                    <strong className="text-slate-900 font-semibold">grid-structured topology</strong> (2D pixel matrices) and <strong className="text-slate-900 font-semibold">shift/spatial equivariance</strong> foundation.
                  </p>
                </div>
              </div>

              {/* Paragraph 2: Convolution Operation (Full Credit) */}
              <div className="relative group">
                <p>
                  First, the{' '}
                  <span className="bg-emerald-100/70 text-emerald-950 border-b-2 border-emerald-500 px-1 py-0.5 rounded cursor-pointer transition-colors hover:bg-emerald-200/80">
                    Convolution Layer applies learnable filters or kernels that slide (convolve) across the input matrix to perform element-wise multiplication and summation, generating feature maps that capture local spatial hierarchies such as edges and textures.
                  </span>
                </p>
                <div className="mt-3 p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-200 text-slate-800 shadow-xs">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-emerald-900 flex items-center gap-1.5 font-bold text-xs">
                      <span className="material-symbols-outlined text-[16px] text-emerald-600">check_circle</span>
                      Criterion 2: Convolutional Mechanics (Full: +2.0 / 2.0)
                    </span>
                    <span className="font-mono text-emerald-700 text-[11px] font-semibold">Sem-Sim: 0.96</span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed pl-5">
                    Rigorous explanation of kernel translation, dot product operations, and resulting feature map spatial hierarchies. All model answer benchmarks fulfilled.
                  </p>
                </div>
              </div>

              {/* Paragraph 3: Feature Extraction (Partial) */}
              <div className="relative group">
                <p>
                  Next,{' '}
                  <span className="bg-amber-100/70 text-amber-950 border-b-2 border-amber-400 px-1 py-0.5 rounded cursor-pointer transition-colors hover:bg-amber-200/80">
                    Feature Extraction occurs across multiple depths, transforming basic pixel data into high-level representations like shapes and object parts.
                  </span>
                </p>
                <div className="mt-3 p-3.5 rounded-xl bg-amber-50/70 border border-amber-200 text-slate-800 shadow-xs">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-amber-900 flex items-center gap-1.5 font-bold text-xs">
                      <span className="material-symbols-outlined text-[16px] text-amber-600">error</span>
                      Criterion 3: Hierarchical Representations (Partial: +1.0 / 2.0)
                    </span>
                    <span className="font-mono text-slate-500 text-[11px]">Sem-Sim: 0.62</span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed pl-5">
                    Student recognized multi-depth low-to-high feature progression, but completely omitted the mandatory non-linear activation layers (e.g., <strong className="text-slate-900 font-semibold">ReLU / rectified linear units</strong>) required to eliminate linearity between successive convolutions.
                  </p>
                </div>
              </div>

              {/* Paragraph 4: Pooling Layers (Full) */}
              <div className="relative group">
                <p>
                  To reduce the spatial dimensions and computational load,{' '}
                  <span className="bg-emerald-100/70 text-emerald-950 border-b-2 border-emerald-500 px-1 py-0.5 rounded cursor-pointer transition-colors hover:bg-emerald-200/80">
                    Pooling Layers (most commonly Max Pooling) are applied, taking the maximum value over a sliding window. This introduces translation invariance and downsamples the feature maps while retaining dominant features.
                  </span>
                </p>
                <div className="mt-3 p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-200 text-slate-800 shadow-xs">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-emerald-900 flex items-center gap-1.5 font-bold text-xs">
                      <span className="material-symbols-outlined text-[16px] text-emerald-600">check_circle</span>
                      Criterion 4: Subsampling & Invariance (Full: +2.0 / 2.0)
                    </span>
                    <span className="font-mono text-emerald-700 text-[11px] font-semibold">Sem-Sim: 0.94</span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed pl-5">
                    Exact technical grounding of max pooling windowing, parameter reduction, downsampling, and spatial translation invariance.
                  </p>
                </div>
              </div>

              {/* Paragraph 5: Dense / Classification (Full) */}
              <div className="relative group">
                <p>
                  Finally,{' '}
                  <span className="bg-emerald-100/70 text-emerald-950 border-b-2 border-emerald-500 px-1 py-0.5 rounded cursor-pointer transition-colors hover:bg-emerald-200/80">
                    the flattened feature maps are fed into Fully Connected (Dense) Layers for Classification, computing class probability scores using a Softmax activation function.
                  </span>
                </p>
                <div className="mt-3 p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-200 text-slate-800 shadow-xs">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-emerald-900 flex items-center gap-1.5 font-bold text-xs">
                      <span className="material-symbols-outlined text-[16px] text-emerald-600">check_circle</span>
                      Criterion 5: Final Classification Stage (Full: +2.0 / 2.0)
                    </span>
                    <span className="font-mono text-emerald-700 text-[11px] font-semibold">Sem-Sim: 0.98</span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed pl-5">
                    Flawless description of dimensionality flattening into dense matrix layers and subsequent Softmax normalizer.
                  </p>
                </div>
              </div>

              {/* Paragraph 6: Applications (Full) */}
              <div className="relative group">
                <p>
                  CNNs have become fundamental in practical applications such as autonomous driving object perception and medical diagnostic imaging analysis.
                </p>
                <div className="mt-3 p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-200 text-slate-800 shadow-xs">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-emerald-900 flex items-center gap-1.5 font-bold text-xs">
                      <span className="material-symbols-outlined text-[16px] text-emerald-600">check_circle</span>
                      Criterion 6: Practical Domain Context (Full: +1.0 / 1.0)
                    </span>
                    <span className="font-mono text-emerald-700 text-[11px] font-semibold">Sem-Sim: 0.91</span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed pl-5">
                    Cites concrete deployment domains with correct architectural relevance.
                  </p>
                </div>
              </div>
            </div>

            {/* Attached Student Submissions / Diagrams Gallery */}
            <div className="mt-8 pt-5 border-t border-slate-200/80">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[16px] text-blue-600">image</span>
                  Submitted Handwritten & Synthetic Schematics (3)
                </span>
                <span className="text-[11px] text-slate-500">Click image to enlarge</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div
                  onClick={() =>
                    setActiveAttachment(
                      'https://lh3.googleusercontent.com/aida-public/AB6AXuBw5GnA8lSLNSyHQHF72aogkSxTUpco3GlR2XvzeypWX3pzDWAdZ8q1FztWCr6W16uk5DbG7quEEzjSxDbD9O1VAshTF5zflQlWY8GQF08MbNBzS6mSLVBin0jXLiyhL2zrYk5bbexD_AQJA2-8e93D0LPdUU-Qrt32m06-geH1ZO6V_Cgkn6M2N0cq_Qv0UgsEMhYq7VFJQ24m5Gb6UIV95v4euwO04kBkoW3TU6YW45bvLgFi0oSP'
                    )
                  }
                  className="relative rounded-xl overflow-hidden border border-slate-200 group cursor-pointer bg-slate-100"
                >
                  <img
                    className="w-full h-24 object-cover group-hover:scale-105 transition-transform duration-300"
                    alt="CNN pipeline diagram"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuBw5GnA8lSLNSyHQHF72aogkSxTUpco3GlR2XvzeypWX3pzDWAdZ8q1FztWCr6W16uk5DbG7quEEzjSxDbD9O1VAshTF5zflQlWY8GQF08MbNBzS6mSLVBin0jXLiyhL2zrYk5bbexD_AQJA2-8e93D0LPdUU-Qrt32m06-geH1ZO6V_Cgkn6M2N0cq_Qv0UgsEMhYq7VFJQ24m5Gb6UIV95v4euwO04kBkoW3TU6YW45bvLgFi0oSP"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent flex items-end p-2">
                    <span className="text-white text-[11px] truncate font-medium">
                      CNN_Layer_Pipeline.png
                    </span>
                  </div>
                </div>

                <div
                  onClick={() =>
                    setActiveAttachment(
                      'https://lh3.googleusercontent.com/aida-public/AB6AXuAyucroTvFel_hO8V4JWsR4pwnCSgHSdC-Y3C-1LcJ_Jw2eoZI5E1zdE13-zC6y1v6NmY6rW3UfRN7G3WSp6JZAUHUb7k1ObImiPbgBHwG8IZx9wymFw7ZpPUCrwCgP2WkQUrN6NIQ5Scoji7HzgUJdTbIOdlSAim5SMzBdRjwYuUkyRuVteTOboP_qKUVmUlwRDlpuZPrPLXy4tK-Hs1th0Hn-fmj1FowxOBo8r0L5QuFcsbWDF5w5'
                    )
                  }
                  className="relative rounded-xl overflow-hidden border border-slate-200 group cursor-pointer bg-slate-100"
                >
                  <img
                    className="w-full h-24 object-cover group-hover:scale-105 transition-transform duration-300"
                    alt="Convolution matrix dot product"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuAyucroTvFel_hO8V4JWsR4pwnCSgHSdC-Y3C-1LcJ_Jw2eoZI5E1zdE13-zC6y1v6NmY6rW3UfRN7G3WSp6JZAUHUb7k1ObImiPbgBHwG8IZx9wymFw7ZpPUCrwCgP2WkQUrN6NIQ5Scoji7HzgUJdTbIOdlSAim5SMzBdRjwYuUkyRuVteTOboP_qKUVmUlwRDlpuZPrPLXy4tK-Hs1th0Hn-fmj1FowxOBo8r0L5QuFcsbWDF5w5"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent flex items-end p-2">
                    <span className="text-white text-[11px] truncate font-medium">
                      Convolution_Matrix.png
                    </span>
                  </div>
                </div>

                <div
                  onClick={() =>
                    setActiveAttachment(
                      'https://lh3.googleusercontent.com/aida-public/AB6AXuAmKxpAe5yJ5JDsAJcq6_wPRBzsIbQSsR7_WU4mwoslCrrspck7ASfbMzXSYpg6tR77VNOssfRrqK2_-yf8hw2tqETkcZOlvfVKuZ_EYzyfVWtjIRkjTVJ38O_r1zkJyPkDzUxo7g6d0DLsYyGTT18Z9t5KAKblbp-JKgOxDlR2sEJfHZnL4POOnBGAGC7AMHctMR8C31BNi2TvdKNXCLuMWrNJsKJiSPjea8yaGw6yvzGK70vQxm7y'
                    )
                  }
                  className="relative rounded-xl overflow-hidden border border-slate-200 group cursor-pointer bg-slate-100"
                >
                  <img
                    className="w-full h-24 object-cover group-hover:scale-105 transition-transform duration-300"
                    alt="Pooling stride diagram"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuAmKxpAe5yJ5JDsAJcq6_wPRBzsIbQSsR7_WU4mwoslCrrspck7ASfbMzXSYpg6tR77VNOssfRrqK2_-yf8hw2tqETkcZOlvfVKuZ_EYzyfVWtjIRkjTVJ38O_r1zkJyPkDzUxo7g6d0DLsYyGTT18Z9t5KAKblbp-JKgOxDlR2sEJfHZnL4POOnBGAGC7AMHctMR8C31BNi2TvdKNXCLuMWrNJsKJiSPjea8yaGw6yvzGK70vQxm7y"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent flex items-end p-2">
                    <span className="text-white text-[11px] truncate font-medium">
                      Pooling_Stride_2.png
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </article>
        </section>

        {/* RIGHT COLUMN: Semantic AI Evaluation & Rubric Breakdown (5 cols) */}
        <aside className="lg:col-span-5 flex flex-col gap-5">
          {/* Top Score Synthesis Card */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 sm:p-6">
            <div className="flex items-start justify-between">
              <div>
                <span className="font-mono uppercase tracking-wider text-slate-500 text-[11px] font-bold">
                  Deterministic Evaluation Engine
                </span>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-slate-900 font-bold tracking-tight text-4xl">
                    {manualScore.toFixed(1)}
                  </span>
                  <span className="text-slate-500 text-xl font-medium">/ 10.0</span>
                </div>
              </div>
              <div className="flex flex-col items-end">
                <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                  <span className="material-symbols-outlined text-[15px] text-blue-600">auto_awesome</span>
                  <span className="text-xs font-semibold">94% Confidence</span>
                </div>
                <span className="font-mono text-[11px] text-slate-400 mt-1">Loss deviation: ±0.15</span>
              </div>
            </div>

            {/* Metric Distribution Bar */}
            <div className="mt-4">
              <div className="flex items-center justify-between text-slate-500 text-xs mb-1.5 font-medium">
                <span>Aggregated Rubric Fulfillment</span>
                <span className="text-slate-900 font-bold">
                  {Math.round((manualScore / 10) * 100)}% Earned
                </span>
              </div>
              <div className="w-full h-2.5 rounded-full bg-slate-100 overflow-hidden flex">
                <div className="h-full bg-emerald-500" style={{ width: '70%' }}></div>
                <div className="h-full bg-amber-400" style={{ width: '5%' }}></div>
                <div className="h-full bg-slate-200" style={{ width: '25%' }}></div>
              </div>
              <div className="flex items-center justify-between font-mono text-[11px] text-slate-500 mt-1.5">
                <span className="text-emerald-700 font-semibold">7.0 Full Credits</span>
                <span className="text-amber-700 font-semibold">0.5 Partial Credit</span>
                <span className="text-slate-400">2.5 Deducted</span>
              </div>
            </div>

            {/* Faculty Override Quick Control Box */}
            <div className="mt-4 p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="text-slate-700 font-semibold text-xs">
                  Faculty Score Override:
                </span>
                <div className="flex items-center border border-slate-300 rounded-lg bg-white shadow-xs">
                  <button
                    onClick={handleDecrement}
                    className="w-7 h-7 flex items-center justify-center hover:bg-slate-100 text-slate-600 transition-colors font-bold text-sm cursor-pointer"
                    type="button"
                  >
                    -
                  </button>
                  <input
                    className="w-12 text-center bg-transparent border-0 focus:outline-none text-slate-900 font-bold text-sm"
                    type="text"
                    value={manualScore.toFixed(1)}
                    readOnly
                  />
                  <button
                    onClick={handleIncrement}
                    className="w-7 h-7 flex items-center justify-center hover:bg-slate-100 text-slate-600 transition-colors font-bold text-sm cursor-pointer"
                    type="button"
                  >
                    +
                  </button>
                </div>
                <span className="font-mono text-slate-500 text-xs">/ 10</span>
              </div>
              <button
                onClick={handleAcceptAiRec}
                className={`w-full sm:w-auto px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1 border border-slate-200 cursor-pointer ${
                  acceptPulse
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-white text-blue-700 hover:bg-blue-50'
                }`}
                type="button"
              >
                <span className="material-symbols-outlined text-[15px]">done_all</span>
                <span>Accept AI Rec</span>
              </button>
            </div>
          </div>

          {/* Exact Rubric Breakdown Matrix */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs flex flex-col overflow-hidden">
            <div className="px-5 py-3 border-b border-slate-200/80 bg-slate-50/70 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px] text-blue-600">tune</span>
                <h3 className="text-slate-900 font-bold text-sm">
                  Detailed Criteria Matrix
                </h3>
              </div>
              <span className="font-mono text-slate-500 text-[11px] font-semibold">6 Discrete Items</span>
            </div>
            <div className="divide-y divide-slate-100 overflow-y-auto max-h-[580px]">
              {/* Criterion 1 */}
              <div className="p-4 hover:bg-slate-50/60 transition-colors">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center text-[11px] font-bold shrink-0">
                      1
                    </span>
                    <div>
                      <h4 className="text-slate-900 font-semibold text-xs">
                        Definition & Topology
                      </h4>
                      <span className="text-[11px] text-slate-500">Weight: 10% (1.0 Pt)</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200 text-[11px] font-semibold">
                      Partial: 0.5 / 1.0
                    </span>
                    <button className="text-slate-400 hover:text-blue-600 transition-colors p-1" title="Manual Edit" type="button">
                      <span className="material-symbols-outlined text-[15px]">edit</span>
                    </button>
                  </div>
                </div>
                <p className="text-xs text-slate-600 mt-2 pl-7 leading-relaxed">
                  <strong className="text-slate-900 font-semibold">AI Rationale:</strong> Answer gives generic perception context. Missed key theoretical premise: structured 2D/3D Euclidean grid topologies.
                </p>
              </div>

              {/* Criterion 2 */}
              <div className="p-4 hover:bg-slate-50/60 transition-colors bg-emerald-50/20">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center text-[11px] font-bold shrink-0">
                      2
                    </span>
                    <div>
                      <h4 className="text-slate-900 font-semibold text-xs">
                        Convolution & Kernel Sliding
                      </h4>
                      <span className="text-[11px] text-slate-500">Weight: 20% (2.0 Pts)</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200 text-[11px] font-semibold">
                      Full: 2.0 / 2.0
                    </span>
                    <button className="text-slate-400 hover:text-blue-600 transition-colors p-1" title="Manual Edit" type="button">
                      <span className="material-symbols-outlined text-[15px]">edit</span>
                    </button>
                  </div>
                </div>
                <p className="text-xs text-slate-600 mt-2 pl-7 leading-relaxed">
                  <strong className="text-slate-900 font-semibold">AI Rationale:</strong> Clear description of dot product accumulation, filter stride across input matrices, and feature map construction.
                </p>
              </div>

              {/* Criterion 3 */}
              <div className="p-4 hover:bg-slate-50/60 transition-colors">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center text-[11px] font-bold shrink-0">
                      3
                    </span>
                    <div>
                      <h4 className="text-slate-900 font-semibold text-xs">
                        Feature Hierarchies & Non-Linearity
                      </h4>
                      <span className="text-[11px] text-slate-500">Weight: 20% (2.0 Pts)</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200 text-[11px] font-semibold">
                      Partial: 1.0 / 2.0
                    </span>
                    <button className="text-slate-400 hover:text-blue-600 transition-colors p-1" title="Manual Edit" type="button">
                      <span className="material-symbols-outlined text-[15px]">edit</span>
                    </button>
                  </div>
                </div>
                <p className="text-xs text-slate-600 mt-2 pl-7 leading-relaxed">
                  <strong className="text-slate-900 font-semibold">AI Rationale:</strong> Identified low-to-high spatial features (edges vs shapes), but failed to document ReLU activation functions required between linear convolution passes.
                </p>
              </div>

              {/* Criterion 4 */}
              <div className="p-4 hover:bg-slate-50/60 transition-colors bg-emerald-50/20">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center text-[11px] font-bold shrink-0">
                      4
                    </span>
                    <div>
                      <h4 className="text-slate-900 font-semibold text-xs">
                        Pooling & Invariance
                      </h4>
                      <span className="text-[11px] text-slate-500">Weight: 20% (2.0 Pts)</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200 text-[11px] font-semibold">
                      Full: 2.0 / 2.0
                    </span>
                    <button className="text-slate-400 hover:text-blue-600 transition-colors p-1" title="Manual Edit" type="button">
                      <span className="material-symbols-outlined text-[15px]">edit</span>
                    </button>
                  </div>
                </div>
                <p className="text-xs text-slate-600 mt-2 pl-7 leading-relaxed">
                  <strong className="text-slate-900 font-semibold">AI Rationale:</strong> Explicitly explains Max-Pooling window downsampling, computational savings, and translation invariance retention.
                </p>
              </div>

              {/* Criterion 5 */}
              <div className="p-4 hover:bg-slate-50/60 transition-colors bg-emerald-50/20">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center text-[11px] font-bold shrink-0">
                      5
                    </span>
                    <div>
                      <h4 className="text-slate-900 font-semibold text-xs">
                        Flattening, Dense Layers & Softmax
                      </h4>
                      <span className="text-[11px] text-slate-500">Weight: 20% (2.0 Pts)</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200 text-[11px] font-semibold">
                      Full: 2.0 / 2.0
                    </span>
                    <button className="text-slate-400 hover:text-blue-600 transition-colors p-1" title="Manual Edit" type="button">
                      <span className="material-symbols-outlined text-[15px]">edit</span>
                    </button>
                  </div>
                </div>
                <p className="text-xs text-slate-600 mt-2 pl-7 leading-relaxed">
                  <strong className="text-slate-900 font-semibold">AI Rationale:</strong> Seamless bridging from multidimensional pooling layers into flattened dense fully-connected nodes with Softmax probability normalization.
                </p>
              </div>

              {/* Criterion 6 */}
              <div className="p-4 hover:bg-slate-50/60 transition-colors bg-emerald-50/20">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center text-[11px] font-bold shrink-0">
                      6
                    </span>
                    <div>
                      <h4 className="text-slate-900 font-semibold text-xs">
                        Empirical Applications
                      </h4>
                      <span className="text-[11px] text-slate-500">Weight: 10% (1.0 Pt)</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200 text-[11px] font-semibold">
                      Full: 1.0 / 1.0
                    </span>
                    <button className="text-slate-400 hover:text-blue-600 transition-colors p-1" title="Manual Edit" type="button">
                      <span className="material-symbols-outlined text-[15px]">edit</span>
                    </button>
                  </div>
                </div>
                <p className="text-xs text-slate-600 mt-2 pl-7 leading-relaxed">
                  <strong className="text-slate-900 font-semibold">AI Rationale:</strong> Accurate references to diagnostic radiology and autonomous vehicle sensor processing.
                </p>
              </div>
            </div>

            {/* Rubric Interaction Bar */}
            <div className="p-4 bg-slate-50/70 border-t border-slate-200/80 flex items-center justify-between gap-2">
              <button
                onClick={handleRunAiEvaluation}
                className="inline-flex items-center gap-1.5 text-xs text-slate-600 hover:text-slate-900 transition-colors font-medium cursor-pointer"
                type="button"
              >
                <span className="material-symbols-outlined text-[15px]">restart_alt</span>
                Regenerate AI Evaluation
              </button>
              <button
                className="inline-flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-700 transition-colors font-semibold cursor-pointer"
                type="button"
              >
                <span className="material-symbols-outlined text-[15px]">post_add</span>
                Add Faculty Annotation
              </button>
            </div>
          </div>

          {/* Private Evaluator Feedback Card */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5">
            <label
              className="flex items-center justify-between text-slate-900 mb-2 font-semibold text-xs"
              htmlFor="faculty-notes"
            >
              <span className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px] text-slate-500">lock</span>
                Private Faculty Note & Feedback Rationale
              </span>
              <span className="text-[11px] text-slate-400 font-normal">Visible only to TAs & Chair</span>
            </label>
            <textarea
              className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-xs focus:outline-none focus:ring-2 focus:ring-blue-600/30 focus:border-blue-600 transition-all resize-y"
              id="faculty-notes"
              rows={3}
              value={facultyNotes}
              onChange={(e) => setFacultyNotes(e.target.value)}
            />
            <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100">
              <span className="font-mono text-[11px] text-slate-400">Auto-saved just now</span>
              <div className="flex gap-2">
                <button
                  onClick={() => setFacultyNotes('')}
                  className="px-3 py-1 rounded-lg text-slate-500 hover:text-slate-800 text-xs transition-colors cursor-pointer"
                  type="button"
                >
                  Clear
                </button>
                <button
                  onClick={handleApproveAndPublish}
                  className="px-3.5 py-1.5 rounded-lg bg-slate-100 text-slate-800 text-xs hover:bg-slate-200 transition-colors font-semibold cursor-pointer"
                  type="button"
                >
                  Save Memo
                </button>
              </div>
            </div>
          </div>
        </aside>
      </div>

      {/* Attachment Lightbox Modal */}
      {activeAttachment && (
        <div
          onClick={() => setActiveAttachment(null)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs cursor-zoom-out"
        >
          <div className="relative max-w-4xl max-h-[85vh] bg-white rounded-2xl overflow-hidden shadow-2xl p-2 border border-slate-200">
            <img src={activeAttachment} alt="Full attachment preview" className="w-full h-auto object-contain rounded-xl" />
            <div className="p-3 flex justify-between items-center text-slate-900 text-xs font-medium">
              <span>Student Submission Scan Attachment</span>
              <button
                onClick={() => setActiveAttachment(null)}
                className="px-3 py-1 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors cursor-pointer"
                type="button"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Side-by-Side Original Handwritten Scan Inspection Modal */}
      {isSideBySideInspectionOpen && (
        <div
          onClick={() => setIsSideBySideInspectionOpen(false)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/75 backdrop-blur-xs animate-in fade-in duration-200"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-6xl max-h-[92vh] bg-white rounded-2xl overflow-hidden shadow-2xl border border-slate-200 flex flex-col"
          >
            {/* Modal Header */}
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
                  <span className="material-symbols-outlined text-[20px]">document_scanner</span>
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    Faculty Verification: Original Handwritten Script vs. Transcribed Answer
                    <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-[11px] font-semibold">
                      OCR Confidence: {currentAnswer?.ocrConfidence || 99.4}%
                    </span>
                  </h3>
                  <p className="text-xs text-slate-500">
                    Student: <strong className="text-slate-700">{currentAnswer?.studentName || 'Alex Chen'}</strong> ({currentAnswer?.studentUid || 'CS-2024-883'}) · Verifying transcript authenticity
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsSideBySideInspectionOpen(false)}
                  className="px-3.5 py-1.5 rounded-lg bg-slate-200/80 hover:bg-slate-300 text-slate-700 text-xs font-semibold transition-colors cursor-pointer"
                  type="button"
                >
                  Close Inspection
                </button>
              </div>
            </div>

            {/* Modal Body: Split Screen */}
            <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-slate-200 overflow-hidden">
              {/* Left Column: Original Handwritten Photo Scans */}
              <div className="flex flex-col h-full bg-slate-900 overflow-hidden">
                <div className="p-3 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between text-xs text-white">
                  <span className="font-semibold flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[16px] text-blue-400">photo_library</span>
                    Original Uploaded Photo Scans
                  </span>

                  {/* Multi-page switcher */}
                  {(currentAnswer?.handwrittenPages?.length || 3) > 1 && (
                    <div className="flex items-center gap-1">
                      {Array.from({ length: currentAnswer?.handwrittenPages?.length || 3 }).map((_, pIdx) => (
                        <button
                          key={pIdx}
                          type="button"
                          onClick={() => setSelectedScanPageIdx(pIdx)}
                          className={`px-2.5 py-0.5 rounded text-[11px] font-semibold transition-colors cursor-pointer ${
                            selectedScanPageIdx === pIdx
                              ? 'bg-blue-600 text-white'
                              : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                          }`}
                        >
                          Page {pIdx + 1}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex-1 overflow-auto p-4 flex items-center justify-center bg-slate-950">
                  <img
                    src={
                      currentAnswer?.handwrittenPages?.[selectedScanPageIdx]?.imageUrl ||
                      (selectedScanPageIdx === 0
                        ? 'https://lh3.googleusercontent.com/aida-public/AB6AXuBw5GnA8lSLNSyHQHF72aogkSxTUpco3GlR2XvzeypWX3pzDWAdZ8q1FztWCr6W16uk5DbG7quEEzjSxDbD9O1VAshTF5zflQlWY8GQF08MbNBzS6mSLVBin0jXLiyhL2zrYk5bbexD_AQJA2-8e93D0LPdUU-Qrt32m06-geH1ZO6V_Cgkn6M2N0cq_Qv0UgsEMhYq7VFJQ24m5Gb6UIV95v4euwO04kBkoW3TU6YW45bvLgFi0oSP'
                        : selectedScanPageIdx === 1
                        ? 'https://lh3.googleusercontent.com/aida-public/AB6AXuAyucroTvFel_hO8V4JWsR4pwnCSgHSdC-Y3C-1LcJ_Jw2eoZI5E1zdE13-zC6y1v6NmY6rW3UfRN7G3WSp6JZAUHUb7k1ObImiPbgBHwG8IZx9wymFw7ZpPUCrwCgP2WkQUrN6NIQ5Scoji7HzgUJdTbIOdlSAim5SMzBdRjwYuUkyRuVteTOboP_qKUVmUlwRDlpuZPrPLXy4tK-Hs1th0Hn-fmj1FowxOBo8r0L5QuFcsbWDF5w5'
                        : 'https://lh3.googleusercontent.com/aida-public/AB6AXuAmKxpAe5yJ5JDsAJcq6_wPRBzsIbQSsR7_WU4mwoslCrrspck7ASfbMzXSYpg6tR77VNOssfRrqK2_-yf8hw2tqETkcZOlvfVKuZ_EYzyfVWtjIRkjTVJ38O_r1zkJyPkDzUxo7g6d0DLsYyGTT18Z9t5KAKblbp-JKgOxDlR2sEJfHZnL4POOnBGAGC7AMHctMR8C31BNi2TvdKNXCLuMWrNJsKJiSPjea8yaGw6yvzGK70vQxm7y')
                    }
                    alt={`Original handwritten scan page ${selectedScanPageIdx + 1}`}
                    className="max-h-[68vh] w-auto object-contain rounded-lg shadow-lg border border-slate-800"
                  />
                </div>
              </div>

              {/* Right Column: Final Transcribed & Confirmed Student Text */}
              <div className="flex flex-col h-full bg-white overflow-hidden">
                <div className="p-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-800 flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[16px] text-emerald-600">verified</span>
                    Final Verified & Submitted Answer Text
                  </span>
                  <span className="font-mono text-slate-500">
                    {currentAnswer?.answerText ? currentAnswer.answerText.trim().split(/\s+/).length : 412} words
                  </span>
                </div>

                <div className="flex-1 overflow-y-auto p-5 text-slate-800 text-xs sm:text-sm leading-relaxed whitespace-pre-wrap font-sans space-y-4">
                  {currentAnswer?.answerText || `A Convolutional Neural Network (CNN) is a deep learning architecture primarily utilized for image recognition and computer vision tasks. The network works by passing an input image through a series of specialized layers.

First, the Convolution Layer applies learnable filters or kernels that slide (convolve) across the input matrix to perform element-wise multiplication and summation, generating feature maps that capture local spatial hierarchies such as edges and textures.

Next, Feature Extraction occurs across multiple depths, transforming basic pixel data into high-level representations like shapes and object parts.

To reduce the spatial dimensions and computational load, Pooling Layers (most commonly Max Pooling) are applied, taking the maximum value over a sliding window. This introduces translation invariance and downsamples the feature maps while retaining dominant features.

Finally, the flattened feature maps are fed into Fully Connected (Dense) Layers for Classification, computing class probability scores using a Softmax activation function.

CNNs are widely deployed in applications such as automated medical imaging diagnosis and autonomous vehicle perception.`}
                </div>

                <div className="p-3.5 bg-slate-50 border-t border-slate-200 text-xs text-slate-600 flex items-center justify-between">
                  <span className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-[15px] text-blue-600">info</span>
                    Submission Method: <strong className="text-slate-900">{currentAnswer?.submissionMethod || 'Handwritten OCR'}</strong>
                  </span>
                  <button
                    onClick={() => setIsSideBySideInspectionOpen(false)}
                    className="px-3 py-1 rounded bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs cursor-pointer"
                    type="button"
                  >
                    Done Reviewing
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
