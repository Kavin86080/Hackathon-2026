import React, { useState } from 'react';
import { api } from '../services/api.ts';
import { User } from '../types/index.ts';

interface SettingsPageProps {
  currentUser: User;
  onUserChange?: (u: User) => void;
  onResetDemo: () => void;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({
  currentUser,
  onResetDemo,
}) => {
  const [resetSuccess, setResetSuccess] = useState(false);

  const handleReset = async () => {
    await api.resetDemo();
    onResetDemo();
    setResetSuccess(true);
    setTimeout(() => setResetSuccess(false), 3000);
  };

  return (
    <div className="flex flex-col w-full space-y-space-xl pb-16">
      <div>
        <div className="inline-flex items-center gap-space-xs px-space-sm py-0.5 rounded bg-surface-container text-primary font-label-md text-label-md text-[11px] font-semibold mb-1">
          <span className="material-symbols-outlined text-[15px]">settings</span>
          <span>System Architecture & Operational Configuration</span>
        </div>
        <h1 className="font-headline-xl text-headline-xl text-on-surface tracking-tight font-bold text-[30px]">
          ExplainGrade AI System Settings
        </h1>
        <p className="font-body-md text-body-md text-secondary max-w-3xl text-[14px]">
          Inspect AI engine parameters, deterministic scoring constraints, RAG vector index paths, and test credentials.
        </p>
      </div>

      {resetSuccess && (
        <div className="p-4 rounded-xl bg-emerald-50 text-emerald-900 border border-emerald-200 font-label-md text-[13px] flex items-center gap-2">
          <span className="material-symbols-outlined text-[20px] text-emerald-700">check_circle</span>
          <span>Database and demo records have been reset to verified initial benchmarks.</span>
        </div>
      )}

      {/* Settings Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-space-lg">
        {/* Card 1: Engine & Models */}
        <div className="p-space-xl rounded-2xl bg-surface-container-lowest shadow-sm border border-outline-variant/30 space-y-3">
          <div className="flex items-center gap-2 pb-2 border-b border-outline-variant/20">
            <span className="material-symbols-outlined text-primary text-[22px]">smart_toy</span>
            <h2 className="font-headline-md font-bold text-on-surface text-[17px]">AI Engine & Model Architecture</h2>
          </div>
          <div className="space-y-2 text-[13px]">
            <div className="flex justify-between py-1 border-b border-outline-variant/10">
              <span className="text-secondary font-medium">Evaluation Model</span>
              <span className="font-code-eval text-primary font-semibold">Gemini 3.8 Flash</span>
            </div>
            <div className="flex justify-between py-1 border-b border-outline-variant/10">
              <span className="text-secondary font-medium">RAG Embedding Model</span>
              <span className="font-code-eval text-tertiary font-semibold">Gemini Embeddings 2 / Semantic Vectors</span>
            </div>
            <div className="flex justify-between py-1 border-b border-outline-variant/10">
              <span className="text-secondary font-medium">Scoring Engine</span>
              <span className="font-code-eval text-on-surface font-semibold">Deterministic Rubric Constraint v2.4</span>
            </div>
            <div className="flex justify-between py-1 border-b border-outline-variant/10">
              <span className="text-secondary font-medium">Telemetry Header</span>
              <span className="font-code-eval text-secondary">User-Agent: aistudio-build</span>
            </div>
          </div>
        </div>

        {/* Card 2: Database & Storage */}
        <div className="p-space-xl rounded-2xl bg-surface-container-lowest shadow-sm border border-outline-variant/30 space-y-3">
          <div className="flex items-center gap-2 pb-2 border-b border-outline-variant/20">
            <span className="material-symbols-outlined text-tertiary text-[22px]">database</span>
            <h2 className="font-headline-md font-bold text-on-surface text-[17px]">Storage & Relational Schema</h2>
          </div>
          <div className="space-y-2 text-[13px]">
            <div className="flex justify-between py-1 border-b border-outline-variant/10">
              <span className="text-secondary font-medium">Production Database Target</span>
              <span className="font-code-eval text-on-surface font-semibold">MySQL (DDL: /server/src/database/schema.sql)</span>
            </div>
            <div className="flex justify-between py-1 border-b border-outline-variant/10">
              <span className="text-secondary font-medium">Runtime Store</span>
              <span className="font-code-eval text-tertiary font-semibold">Persistent Relational Store (JSON/ACID safe)</span>
            </div>
            <div className="flex justify-between py-1 border-b border-outline-variant/10">
              <span className="text-secondary font-medium">OCR Engine</span>
              <span className="font-code-eval text-primary font-semibold">Multimodal Gemini OCR 99.4%</span>
            </div>
            <div className="flex justify-between py-1 border-b border-outline-variant/10">
              <span className="text-secondary font-medium">Audit Compliance</span>
              <span className="font-code-eval text-secondary font-semibold">Compliant · Hash Verified</span>
            </div>
          </div>
        </div>

        {/* Card 3: Demo Credentials */}
        <div className="p-space-xl rounded-2xl bg-surface-container-lowest shadow-sm border border-outline-variant/30 space-y-3">
          <div className="flex items-center gap-2 pb-2 border-b border-outline-variant/20">
            <span className="material-symbols-outlined text-primary text-[22px]">badge</span>
            <h2 className="font-headline-md font-bold text-on-surface text-[17px]">Demo User Profiles</h2>
          </div>
          <div className="space-y-2 text-[13px]">
            <div className="p-2.5 rounded-lg bg-surface-container-low border border-outline-variant/20 flex justify-between items-center">
              <div>
                <div className="font-semibold text-on-surface">Prof. Elena Vance</div>
                <div className="text-[11px] text-secondary">CS Chair & Course Evaluator (Faculty)</div>
              </div>
              <span className="px-2 py-0.5 rounded bg-primary-fixed text-primary font-code-eval text-[11px] font-bold">
                Faculty Role
              </span>
            </div>
            <div className="p-2.5 rounded-lg bg-surface-container-low border border-outline-variant/20 flex justify-between items-center">
              <div>
                <div className="font-semibold text-on-surface">Alex Chen (CS-2024-883)</div>
                <div className="text-[11px] text-secondary">Undergrad · AI Specialization (Student)</div>
              </div>
              <span className="px-2 py-0.5 rounded bg-secondary-container text-on-secondary-fixed font-code-eval text-[11px] font-bold">
                Student Role
              </span>
            </div>
          </div>
        </div>

        {/* Card 4: Quick Reset */}
        <div className="p-space-xl rounded-2xl bg-surface-container-lowest shadow-sm border border-outline-variant/30 space-y-3 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 pb-2 border-b border-outline-variant/20">
              <span className="material-symbols-outlined text-secondary text-[22px]">restart_alt</span>
              <h2 className="font-headline-md font-bold text-on-surface text-[17px]">Reset Demo Environment</h2>
            </div>
            <p className="font-body-sm text-secondary text-[13px] mt-2">
              Restore all questions, rubrics, course textbook chunks, student answers, and Alex Chen's 7.5 evaluation report to their initial states.
            </p>
          </div>
          <button
            onClick={handleReset}
            className="w-full py-2.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-error font-rubric-metric font-semibold text-[13px] transition-colors border border-outline-variant/30 flex items-center justify-center gap-1.5"
            type="button"
          >
            <span className="material-symbols-outlined text-[18px]">restore</span>
            <span>Reset Demo to Verified Initial Benchmarks</span>
          </button>
        </div>
      </div>
    </div>
  );
};
