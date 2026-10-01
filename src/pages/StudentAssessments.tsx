import React, { useState, useEffect } from 'react';
import { api } from '../services/api.ts';
import { ActiveTab } from '../components/Sidebar.tsx';

interface StudentAssessmentsProps {
  onNavigate: (tab: ActiveTab) => void;
}

export const StudentAssessments: React.FC<StudentAssessmentsProps> = ({ onNavigate }) => {
  const [assessments, setAssessments] = useState<any[]>([]);

  useEffect(() => {
    api.getStudentAssessments('usr-stu-1').then(setAssessments).catch(console.error);
  }, []);

  return (
    <div className="flex flex-col w-full space-y-space-xl pb-16">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-space-xs px-space-sm py-0.5 rounded bg-surface-container text-primary font-label-md text-label-md text-[11px] font-semibold mb-1">
          <span className="material-symbols-outlined text-[15px]">assignment</span>
          <span>Assigned Curricular Assessments</span>
        </div>
        <h1 className="font-headline-xl text-headline-xl text-on-surface tracking-tight font-bold text-[30px]">
          My Descriptive Assessments
        </h1>
        <p className="font-body-md text-body-md text-secondary max-w-3xl text-[14px]">
          View your assigned examinations, open workspaces to draft or finalize answers, and inspect faculty-approved rubric evaluations.
        </p>
      </div>

      {/* Assessment cards list */}
      <div className="space-y-4">
        {assessments.map((item, idx) => {
          const q = item.question;
          const ans = item.answer;
          const isEvaluated = ans?.status === 'FEEDBACK_AVAILABLE';

          return (
            <div
              key={q.id || idx}
              className="p-space-xl rounded-2xl bg-surface-container-lowest shadow-sm border border-outline-variant/30 hover:border-primary/40 transition-all flex flex-col md:flex-row md:items-center justify-between gap-space-md"
            >
              <div className="space-y-2 max-w-2xl">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-surface-container text-primary font-code-eval font-bold text-[11px]">
                    {q.courseCode} · {q.targetExam}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded font-code-eval font-bold text-[11px] ${
                      isEvaluated
                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                        : ans?.status === 'SUBMITTED'
                        ? 'bg-blue-50 text-blue-800 border border-blue-200'
                        : 'bg-amber-50 text-amber-800 border border-amber-200'
                    }`}
                  >
                    {isEvaluated
                      ? 'FEEDBACK AVAILABLE'
                      : ans?.status === 'SUBMITTED'
                      ? 'SUBMITTED & EVALUATING'
                      : 'IN PROGRESS / DRAFT'}
                  </span>
                </div>

                <h2 className="font-headline-md font-bold text-on-surface text-[18px]">
                  {q.prompt}
                </h2>

                <div className="flex flex-wrap items-center gap-space-md text-secondary font-body-sm text-[12px]">
                  <span>Modality: {q.modality}</span>
                  <span>•</span>
                  <span>Max Marks: {q.maxMarks.toFixed(1)}</span>
                  <span>•</span>
                  <span>Corpus: {q.knowledgeCorpus}</span>
                </div>
              </div>

              {/* Right Action */}
              <div className="flex flex-col sm:flex-row items-center gap-3">
                {isEvaluated && (
                  <div className="text-right sm:mr-3">
                    <span className="text-[10px] uppercase font-bold text-secondary block">Final Mark</span>
                    <span className="font-display-lg font-bold text-primary text-[24px]">7.5 / 10.0</span>
                  </div>
                )}

                {isEvaluated ? (
                  <button
                    onClick={() => onNavigate('student-feedback')}
                    className="w-full sm:w-auto px-5 py-2.5 rounded bg-primary text-on-primary font-rubric-metric font-semibold text-[13px] hover:bg-primary-container transition-all shadow-sm flex items-center justify-center gap-1.5"
                    type="button"
                  >
                    <span className="material-symbols-outlined text-[18px]">insights</span>
                    <span>View Gap Analysis</span>
                  </button>
                ) : (
                  <button
                    onClick={() => onNavigate('student-editor')}
                    className="w-full sm:w-auto px-5 py-2.5 rounded bg-primary text-on-primary font-rubric-metric font-semibold text-[13px] hover:bg-primary-container transition-all shadow-sm flex items-center justify-center gap-1.5"
                    type="button"
                  >
                    <span className="material-symbols-outlined text-[18px]">edit_note</span>
                    <span>Open Answer Workspace</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
