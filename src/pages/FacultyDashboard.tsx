import React, { useState, useEffect } from 'react';
import { api } from '../services/api.ts';
import { Question, StudentAnswer, Evaluation } from '../types/index.ts';
import { ActiveTab } from '../components/Sidebar.tsx';

interface FacultyDashboardProps {
  onNavigate: (tab: ActiveTab) => void;
  onOpenNewRubric: () => void;
  onOpenKnowledgeUpload: () => void;
}

export const FacultyDashboard: React.FC<FacultyDashboardProps> = ({
  onNavigate,
  onOpenNewRubric,
  onOpenKnowledgeUpload,
}) => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<StudentAnswer[]>([]);
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [qList, aList, eList] = await Promise.all([
        api.getQuestions(),
        api.getAnswers(),
        api.getFacultyAnalytics(),
      ]);
      setQuestions(qList);
      setAnswers(aList);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="flex flex-col w-full space-y-space-xl pb-16">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-surface-container-lowest p-space-xl shadow-sm border border-outline-variant/30">
        <div className="absolute -right-20 -bottom-20 w-96 h-96 bg-primary-fixed/20 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-space-lg">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-space-sm">
              <span className="px-space-sm py-0.5 rounded bg-surface-container text-primary font-label-md text-label-md uppercase tracking-wider font-semibold text-[11px]">
                Faculty Assessment Suite
              </span>
              <span className="text-secondary font-label-md text-label-md">•</span>
              <span className="font-label-md text-label-md text-secondary text-[12px]">
                Stanford University · CS231n & CS224n
              </span>
            </div>
            <h1 className="font-headline-xl text-headline-xl text-on-surface tracking-tight font-bold text-[30px]">
              Welcome, Prof. Vance. You have 1 review pending.
            </h1>
            <p className="font-body-md text-body-md text-on-surface-variant text-[14px]">
              AI evaluation pipeline active with deterministic rubric compliance. Review AI recommendations, approve scores, and unlock personalized student feedback.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-space-sm flex-shrink-0">
            <button
              onClick={() => onNavigate('answer-evaluations')}
              className="inline-flex items-center gap-2 px-space-md py-2.5 rounded bg-primary text-on-primary font-label-md text-label-md hover:bg-primary-container transition-all shadow-sm font-semibold text-[13px]"
              type="button"
            >
              <span className="material-symbols-outlined text-[18px]">fact_check</span>
              <span>Review Evaluations</span>
            </button>
            <button
              onClick={onOpenNewRubric}
              className="inline-flex items-center gap-2 px-space-md py-2.5 rounded bg-surface-container text-on-surface font-label-md text-label-md hover:bg-surface-container-high transition-colors border border-outline-variant/30 text-[13px]"
              type="button"
            >
              <span className="material-symbols-outlined text-[18px]">add_circle</span>
              <span>New Rubric</span>
            </button>
            <button
              onClick={onOpenKnowledgeUpload}
              className="inline-flex items-center gap-2 px-space-md py-2.5 rounded bg-surface-container text-on-surface font-label-md text-label-md hover:bg-surface-container-high transition-colors border border-outline-variant/30 text-[13px]"
              type="button"
            >
              <span className="material-symbols-outlined text-[18px]">cloud_upload</span>
              <span>Upload to RAG</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-space-md">
        <div className="p-space-lg rounded-xl bg-surface-container-lowest shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow border border-outline-variant/30">
          <div className="flex items-center justify-between mb-space-md">
            <span className="font-label-md text-label-md text-secondary uppercase tracking-wider font-semibold text-[11px]">
              Active Exam Suites
            </span>
            <div className="w-8 h-8 rounded-lg bg-surface-container-low flex items-center justify-center text-primary">
              <span className="material-symbols-outlined text-[20px]">assignment</span>
            </div>
          </div>
          <div>
            <div className="flex items-baseline gap-2">
              <span className="font-headline-xl text-headline-xl text-on-surface font-bold text-[32px]">
                {questions.length}
              </span>
              <span className="font-label-md text-label-md text-secondary text-[12px]">Published</span>
            </div>
            <div className="mt-space-sm text-secondary font-label-md text-label-md text-[12px]">
              CS231n Midterm & CS224n Asn
            </div>
          </div>
        </div>

        <div className="p-space-lg rounded-xl bg-surface-container-lowest shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow border border-outline-variant/30">
          <div className="flex items-center justify-between mb-space-md">
            <span className="font-label-md text-label-md text-secondary uppercase tracking-wider font-semibold text-[11px]">
              Cohort Submissions
            </span>
            <div className="w-8 h-8 rounded-lg bg-surface-container-low flex items-center justify-center text-tertiary">
              <span className="material-symbols-outlined text-[20px]">task_alt</span>
            </div>
          </div>
          <div>
            <div className="flex items-baseline gap-2">
              <span className="font-headline-xl text-headline-xl text-on-surface font-bold text-[32px]">84</span>
              <span className="font-label-md text-label-md text-secondary text-[12px]">Processed</span>
            </div>
            <div className="mt-space-sm text-tertiary font-label-md text-label-md text-[12px] font-semibold">
              100% OCR digitized
            </div>
          </div>
        </div>

        <div className="p-space-lg rounded-xl bg-surface-container-lowest shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow border border-outline-variant/30">
          <div className="flex items-center justify-between mb-space-md">
            <span className="font-label-md text-label-md text-secondary uppercase tracking-wider font-semibold text-[11px]">
              Mean AI Score
            </span>
            <div className="w-8 h-8 rounded-lg bg-surface-container-low flex items-center justify-center text-primary-container">
              <span className="material-symbols-outlined text-[20px]">query_stats</span>
            </div>
          </div>
          <div>
            <div className="flex items-baseline gap-2">
              <span className="font-headline-xl text-headline-xl text-on-surface font-bold text-[32px]">7.8</span>
              <span className="font-headline-md text-headline-md text-secondary text-[18px]">/ 10.0</span>
            </div>
            <div className="mt-space-sm text-secondary font-label-md text-label-md text-[12px]">
              ±0.15 loss deviation
            </div>
          </div>
        </div>

        <div className="p-space-lg rounded-xl bg-surface-container-lowest shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow border border-outline-variant/30">
          <div className="flex items-center justify-between mb-space-md">
            <span className="font-label-md text-label-md text-secondary uppercase tracking-wider font-semibold text-[11px]">
              Pending Approval
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center text-amber-700">
              <span className="material-symbols-outlined text-[20px]">pending_actions</span>
            </div>
          </div>
          <div>
            <div className="flex items-baseline gap-2">
              <span className="font-headline-xl text-headline-xl text-amber-700 font-bold text-[32px]">1</span>
              <span className="font-label-md text-label-md text-amber-800 text-[12px]">Action Needed</span>
            </div>
            <div className="mt-space-sm text-amber-700 font-label-md text-label-md text-[12px]">
              Alex Chen (Score: 7.5)
            </div>
          </div>
        </div>
      </div>

      {/* Main Two Column Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg">
        {/* Left Column: Active Questions */}
        <div className="lg:col-span-7 space-y-space-md">
          <div className="flex items-center justify-between">
            <h2 className="font-headline-md text-headline-md text-on-surface font-bold text-[18px]">
              Active Curricular Assessments
            </h2>
            <button
              onClick={() => onNavigate('questions-rubrics')}
              className="text-primary hover:underline font-label-md text-label-md text-[12px]"
            >
              Open Rubric Architect →
            </button>
          </div>

          <div className="space-y-3">
            {questions.map((q) => (
              <div
                key={q.id}
                className="p-space-lg rounded-xl bg-surface-container-lowest shadow-sm border border-outline-variant/30 hover:border-primary/50 transition-all cursor-pointer"
                onClick={() => onNavigate('questions-rubrics')}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-surface-container text-primary font-code-eval text-[11px] font-bold">
                      {q.courseCode}
                    </span>
                    <span className="text-secondary font-label-md text-[12px]">{q.targetExam}</span>
                  </div>
                  <span className="font-rubric-metric font-bold text-primary text-[14px]">
                    {q.maxMarks.toFixed(1)} Marks
                  </span>
                </div>
                <h3 className="font-headline-md font-semibold text-on-surface text-[15px] mb-2">{q.prompt}</h3>
                <div className="flex flex-wrap gap-1 mb-3">
                  {q.keyConcepts.slice(0, 4).map((concept, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 rounded bg-surface-container-low text-on-surface-variant font-code-eval text-[11px]"
                    >
                      {concept}
                    </span>
                  ))}
                  {q.keyConcepts.length > 4 && (
                    <span className="px-2 py-0.5 rounded bg-surface-container-low text-secondary font-code-eval text-[11px]">
                      +{q.keyConcepts.length - 4} more
                    </span>
                  )}
                </div>
                <div className="pt-2 border-t border-outline-variant/20 flex items-center justify-between text-secondary font-label-md text-[12px]">
                  <span>Corpus: {q.knowledgeCorpus}</span>
                  <span className="text-tertiary font-semibold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-tertiary"></span>Rubric Calibrated
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Recent Submissions & Action Feed */}
        <div className="lg:col-span-5 space-y-space-md">
          <div className="flex items-center justify-between">
            <h2 className="font-headline-md text-headline-md text-on-surface font-bold text-[18px]">
              Evaluation Pipeline
            </h2>
            <button
              onClick={() => onNavigate('answer-evaluations')}
              className="text-primary hover:underline font-label-md text-label-md text-[12px]"
            >
              All Evaluations →
            </button>
          </div>

          <div className="p-space-lg rounded-xl bg-surface-container-lowest shadow-sm border border-outline-variant/30 space-y-3">
            {answers.map((ans) => (
              <div
                key={ans.id}
                onClick={() => onNavigate('answer-evaluations')}
                className="p-3 rounded-lg bg-surface-container-low hover:bg-surface-container transition-colors cursor-pointer border border-outline-variant/20 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-primary-fixed text-primary flex items-center justify-center font-bold text-[13px]">
                    {ans.studentName.split(' ').map((n) => n[0]).join('')}
                  </div>
                  <div>
                    <div className="font-rubric-metric font-semibold text-on-surface text-[13px]">
                      {ans.studentName}
                    </div>
                    <div className="font-code-eval text-secondary text-[11px]">
                      {ans.studentUid} · {ans.wordCount} words
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <span
                    className={`inline-block px-2 py-0.5 rounded font-label-md text-[11px] font-semibold ${
                      ans.status === 'FEEDBACK_AVAILABLE'
                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                        : 'bg-amber-50 text-amber-800 border border-amber-200'
                    }`}
                  >
                    {ans.status === 'FEEDBACK_AVAILABLE' ? '7.5 / 10.0' : 'Pending Review'}
                  </span>
                  <div className="text-[10px] text-secondary mt-0.5">
                    {ans.status === 'FEEDBACK_AVAILABLE' ? 'Approved' : 'Submitted'}
                  </div>
                </div>
              </div>
            ))}

            <div className="pt-2">
              <button
                onClick={() => onNavigate('answer-evaluations')}
                className="w-full py-2 rounded bg-surface-container hover:bg-surface-container-high text-primary font-label-md text-[12px] font-semibold transition-colors flex items-center justify-center gap-1 border border-outline-variant/30"
              >
                <span>Open Evaluation Studio</span>
                <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
              </button>
            </div>
          </div>

          {/* RAG Knowledge Status Card */}
          <div className="p-space-lg rounded-xl bg-surface-container-lowest shadow-sm border border-outline-variant/30">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[20px] text-primary">menu_book</span>
                <h3 className="font-rubric-metric font-bold text-on-surface text-[14px]">
                  RAG Grounding Corpus
                </h3>
              </div>
              <button
                onClick={() => onNavigate('knowledge-base')}
                className="text-primary hover:underline text-[12px]"
              >
                Manage
              </button>
            </div>
            <p className="font-body-sm text-secondary text-[12px] mb-3">
              Approved textbooks and lecture slides are indexed into vector chunks to prevent AI hallucinations.
            </p>
            <div className="p-2.5 rounded bg-surface-container-low flex items-center justify-between border border-outline-variant/20 text-[12px]">
              <span className="font-code-eval font-semibold text-on-surface">Goodfellow Ch 9 & CS231n Slides</span>
              <span className="text-tertiary font-bold">24 Active Chunks</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
