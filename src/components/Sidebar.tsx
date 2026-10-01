import React from 'react';
import { Role } from '../types/index.ts';

export type ActiveTab =
  | 'faculty-dashboard'
  | 'questions-rubrics'
  | 'answer-evaluations'
  | 'feedback-explanations'
  | 'knowledge-base'
  | 'faculty-analytics'
  | 'student-dashboard'
  | 'student-assessments'
  | 'student-editor'
  | 'student-feedback'
  | 'student-progress'
  | 'settings';

interface SidebarProps {
  role: Role;
  activeTab: ActiveTab;
  onNavigate: (tab: ActiveTab) => void;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ role, activeTab, onNavigate, onCloseMobile }) => {
  const handleNav = (tab: ActiveTab) => {
    onNavigate(tab);
    if (onCloseMobile) onCloseMobile();
  };

  return (
    <aside className="w-[300px] shrink-0 h-full bg-white border-r border-slate-200/80 flex flex-col justify-between overflow-y-auto select-none">
      <div className="flex flex-col">
        {/* Brand Header */}
        <div className="h-16 px-6 flex items-center justify-between border-b border-slate-200/80 shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-600 text-white font-bold text-sm shadow-xs ring-1 ring-blue-700/20">
              EG
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-slate-900 text-sm tracking-tight leading-none">
                ExplainGrade AI
              </span>
              <span className="text-[11px] text-slate-500 font-medium tracking-normal mt-0.5">
                From marks to meaningful learning
              </span>
            </div>
          </div>
          {onCloseMobile && (
            <button
              onClick={onCloseMobile}
              className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              type="button"
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
          )}
        </div>

        {/* Workspace Title & Navigation */}
        <div className="p-4">
          <div className="px-3 py-2 mb-2 flex items-center justify-between">
            <span className="text-[11px] font-bold tracking-wider text-slate-400 uppercase">
              {role === 'faculty' ? 'FACULTY WORKSPACE' : 'STUDENT PORTAL'}
            </span>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          </div>

          <nav className="space-y-1">
            {role === 'faculty' ? (
              <>
                <button
                  type="button"
                  onClick={() => handleNav('faculty-dashboard')}
                  className={`w-full flex items-center gap-[18px] px-3.5 py-2.5 rounded-xl transition-colors text-sm text-left ${
                    activeTab === 'faculty-dashboard'
                      ? 'bg-blue-50 text-blue-700 font-semibold shadow-xs'
                      : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900 font-medium'
                  }`}
                >
                  <span className="w-5 h-5 flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-[20px]">space_dashboard</span>
                  </span>
                  <span className="whitespace-nowrap">Dashboard</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleNav('questions-rubrics')}
                  className={`w-full flex items-center gap-[18px] px-3.5 py-2.5 rounded-xl transition-colors text-sm text-left ${
                    activeTab === 'questions-rubrics'
                      ? 'bg-blue-50 text-blue-700 font-semibold shadow-xs'
                      : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900 font-medium'
                  }`}
                >
                  <span className="w-5 h-5 flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-[20px]">rule</span>
                  </span>
                  <span className="whitespace-nowrap">Questions & Rubrics</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleNav('answer-evaluations')}
                  className={`w-full flex items-center gap-[18px] px-3.5 py-2.5 rounded-xl transition-colors text-sm text-left ${
                    activeTab === 'answer-evaluations'
                      ? 'bg-blue-50 text-blue-700 font-semibold shadow-xs'
                      : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900 font-medium'
                  }`}
                >
                  <span className="w-5 h-5 flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-[20px]">fact_check</span>
                  </span>
                  <span className="whitespace-nowrap">Answer Evaluations</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleNav('feedback-explanations')}
                  className={`w-full flex items-center gap-[18px] px-3.5 py-2.5 rounded-xl transition-colors text-sm text-left ${
                    activeTab === 'feedback-explanations'
                      ? 'bg-blue-50 text-blue-700 font-semibold shadow-xs'
                      : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900 font-medium'
                  }`}
                >
                  <span className="w-5 h-5 flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-[20px]">psychology</span>
                  </span>
                  <span className="whitespace-nowrap">Feedback & Explanations</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleNav('knowledge-base')}
                  className={`w-full flex items-center gap-[18px] px-3.5 py-2.5 rounded-xl transition-colors text-sm text-left ${
                    activeTab === 'knowledge-base'
                      ? 'bg-blue-50 text-blue-700 font-semibold shadow-xs'
                      : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900 font-medium'
                  }`}
                >
                  <span className="w-5 h-5 flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-[20px]">menu_book</span>
                  </span>
                  <span className="whitespace-nowrap">Knowledge Base (RAG)</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleNav('faculty-analytics')}
                  className={`w-full flex items-center gap-[18px] px-3.5 py-2.5 rounded-xl transition-colors text-sm text-left ${
                    activeTab === 'faculty-analytics'
                      ? 'bg-blue-50 text-blue-700 font-semibold shadow-xs'
                      : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900 font-medium'
                  }`}
                >
                  <span className="w-5 h-5 flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-[20px]">analytics</span>
                  </span>
                  <span className="whitespace-nowrap">Analytics</span>
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => handleNav('student-dashboard')}
                  className={`w-full flex items-center gap-[18px] px-3.5 py-2.5 rounded-xl transition-colors text-sm text-left ${
                    activeTab === 'student-dashboard'
                      ? 'bg-blue-50 text-blue-700 font-semibold shadow-xs'
                      : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900 font-medium'
                  }`}
                >
                  <span className="w-5 h-5 flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-[20px] text-blue-600">dashboard</span>
                  </span>
                  <span className="whitespace-nowrap">Dashboard</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleNav('student-assessments')}
                  className={`w-full flex items-center gap-[18px] px-3.5 py-2.5 rounded-xl transition-colors text-sm text-left ${
                    activeTab === 'student-assessments'
                      ? 'bg-blue-50 text-blue-700 font-semibold shadow-xs'
                      : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900 font-medium'
                  }`}
                >
                  <span className="w-5 h-5 flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-[20px]">assignment</span>
                  </span>
                  <span className="whitespace-nowrap">My Assessments</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleNav('student-editor')}
                  className={`w-full flex items-center gap-[18px] px-3.5 py-2.5 rounded-xl transition-colors text-sm text-left ${
                    activeTab === 'student-editor'
                      ? 'bg-blue-50 text-blue-700 font-semibold shadow-xs'
                      : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900 font-medium'
                  }`}
                >
                  <span className="w-5 h-5 flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-[20px]">history_edu</span>
                  </span>
                  <span className="whitespace-nowrap">Answer Editor & Submit</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleNav('student-feedback')}
                  className={`w-full flex items-center gap-[18px] px-3.5 py-2.5 rounded-xl transition-colors text-sm text-left ${
                    activeTab === 'student-feedback'
                      ? 'bg-blue-50 text-blue-700 font-semibold shadow-xs'
                      : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900 font-medium'
                  }`}
                >
                  <span className="w-5 h-5 flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-[20px]">insights</span>
                  </span>
                  <span className="whitespace-nowrap">My Feedback</span>
                  <span className="ml-auto px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 text-xs font-semibold shrink-0">
                    18
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => handleNav('student-progress')}
                  className={`w-full flex items-center gap-[18px] px-3.5 py-2.5 rounded-xl transition-colors text-sm text-left ${
                    activeTab === 'student-progress'
                      ? 'bg-blue-50 text-blue-700 font-semibold shadow-xs'
                      : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900 font-medium'
                  }`}
                >
                  <span className="w-5 h-5 flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-[20px]">monitoring</span>
                  </span>
                  <span className="whitespace-nowrap">Progress & Mastery</span>
                </button>
              </>
            )}

            <div className="pt-2 mt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => handleNav('settings')}
                className={`w-full flex items-center gap-[18px] px-3.5 py-2.5 rounded-xl transition-colors text-sm text-left ${
                  activeTab === 'settings'
                    ? 'bg-blue-50 text-blue-700 font-semibold shadow-xs'
                    : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900 font-medium'
                }`}
              >
                <span className="w-5 h-5 flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-[20px]">settings</span>
                </span>
                <span className="whitespace-nowrap">Settings</span>
              </button>
            </div>
          </nav>
        </div>
      </div>

      {/* Engine Status Widget */}
      <div className="p-4 m-4 rounded-2xl bg-slate-50 border border-slate-200/80">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wide">
            ENGINE V2.4
          </span>
          <span className="inline-flex items-center gap-1.5 text-[11px] text-emerald-700 font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>Active
          </span>
        </div>
        <p className="text-xs text-slate-500 mb-2.5 leading-relaxed">
          Deterministic rubric compliance active with verified scoring traceability.
        </p>
        <div className="flex items-center justify-between pt-2 text-xs border-t border-slate-200/80 text-slate-600">
          <span className="text-blue-600 font-semibold flex items-center gap-1">
            <span className="material-symbols-outlined text-[14px]">verified</span>Deterministic
          </span>
          <span className="font-mono text-[11px] text-slate-500 font-medium">CS-99.8%</span>
        </div>
      </div>
    </aside>
  );
};
