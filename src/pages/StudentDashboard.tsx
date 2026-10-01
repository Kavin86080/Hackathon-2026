import React from 'react';
import { ActiveTab } from '../components/Sidebar.tsx';

interface StudentDashboardProps {
  onNavigate: (tab: ActiveTab) => void;
  onOpenWhyModal?: () => void;
}

export const StudentDashboard: React.FC<StudentDashboardProps> = ({
  onNavigate,
  onOpenWhyModal,
}) => {
  return (
    <div className="flex flex-col w-full pb-16 space-y-6">
      {/* Top Hero Status Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-white p-6 sm:p-7 shadow-xs border border-slate-200/80">
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2 text-xs">
              <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 font-bold uppercase tracking-wider text-[11px]">
                Cohort 2024-25
              </span>
              <span className="text-slate-300">•</span>
              <span className="text-slate-500 font-medium">
                Dept of Computer Science & Engineering
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              Welcome back, Alex! Here is your descriptive learning report.
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Your semantic rubric breakdown for{' '}
              <strong className="text-slate-900">CS231n Midterm Descriptive Assessment</strong> is complete. 2 targeted cognitive gaps identified for remediation.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              onClick={() => onNavigate('student-feedback')}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 transition-colors shadow-xs cursor-pointer"
              type="button"
            >
              <span className="material-symbols-outlined text-[16px]">verified</span>
              <span>Inspect Latest Evaluation</span>
            </button>
            <button
              onClick={() => onNavigate('student-assessments')}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 text-slate-700 text-xs font-semibold hover:bg-slate-200/70 transition-colors border border-slate-200 cursor-pointer"
              type="button"
            >
              <span className="material-symbols-outlined text-[16px]">download</span>
              <span>Summary Transcript</span>
            </button>
          </div>
        </div>
      </div>

      {/* Key Student Stat Bento Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Stat 1 */}
        <div className="p-5 rounded-2xl bg-white shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow border border-slate-200/80">
          <div className="flex items-center justify-between mb-4">
            <span className="text-slate-500 uppercase tracking-wider font-bold text-[11px]">
              Active Assessments
            </span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
              <span className="material-symbols-outlined text-[18px]">assignment_turned_in</span>
            </div>
          </div>
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl font-bold text-slate-900">3</span>
              <span className="text-xs text-slate-500 font-medium">Enrolled</span>
            </div>
            <div className="mt-2 flex items-center gap-1.5 text-blue-600 text-xs font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse"></span>
              <span>1 pending submission tonight</span>
            </div>
          </div>
        </div>

        {/* Stat 2 */}
        <div className="p-5 rounded-2xl bg-white shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow border border-slate-200/80">
          <div className="flex items-center justify-between mb-4">
            <span className="text-slate-500 uppercase tracking-wider font-bold text-[11px]">
              Completed Evaluations
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
              <span className="material-symbols-outlined text-[18px]">task_alt</span>
            </div>
          </div>
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl font-bold text-slate-900">12</span>
              <span className="text-xs text-slate-500 font-medium">Submitted & Graded</span>
            </div>
            <div className="mt-2 text-slate-500 text-xs flex items-center gap-1">
              <span className="font-mono text-emerald-700 font-bold">+2</span>
              <span>verified by faculty this week</span>
            </div>
          </div>
        </div>

        {/* Stat 3 */}
        <div className="p-5 rounded-2xl bg-white shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow border border-slate-200/80">
          <div className="flex items-center justify-between mb-4">
            <span className="text-slate-500 uppercase tracking-wider font-bold text-[11px]">
              Concept Mastery
            </span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
              <span className="material-symbols-outlined text-[18px]">speed</span>
            </div>
          </div>
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-slate-900">82%</span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-semibold text-[11px] border border-emerald-200">
                Proficient
              </span>
            </div>
            <div className="mt-2 w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
              <div className="bg-blue-600 h-full rounded-full transition-all duration-500" style={{ width: '82%' }}></div>
            </div>
          </div>
        </div>

        {/* Stat 4 */}
        <div className="p-5 rounded-2xl bg-white shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow border border-slate-200/80">
          <div className="flex items-center justify-between mb-4">
            <span className="text-slate-500 uppercase tracking-wider font-bold text-[11px]">
              Feedback Action Items
            </span>
            <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center text-red-600">
              <span className="material-symbols-outlined text-[18px]">psychology_alt</span>
            </div>
          </div>
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl font-bold text-slate-900">18</span>
              <span className="text-xs text-slate-500 font-medium">Target Insights</span>
            </div>
            <div className="mt-2 flex items-center gap-1.5 text-slate-600 text-xs">
              <span className="w-2 h-2 rounded-full bg-red-500"></span>
              <span>4 high-priority rubric gaps</span>
            </div>
          </div>
        </div>
      </div>

      {/* Primary Asymmetric Split Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        {/* LEFT 7 COLS: Highlighted Descriptive Assessment Evaluation */}
        <div className="xl:col-span-7 space-y-4" id="recent-evaluation">
          <div className="p-6 sm:p-7 rounded-2xl bg-white shadow-xs border border-slate-200/80 space-y-5">
            {/* Card Header & Metadata */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-mono font-bold uppercase tracking-wider text-[11px]">
                    CS231n · Midterm Exam
                  </span>
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-xs font-semibold border border-emerald-200">
                    <span className="material-symbols-outlined text-[13px]">check_circle</span>
                    Verified by Prof. Vance
                  </span>
                </div>
                <h2 className="text-base sm:text-lg font-bold text-slate-900">
                  "Explain the working of a Convolutional Neural Network."
                </h2>
                <div className="flex items-center gap-3 text-slate-400 text-xs pt-0.5">
                  <span className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-[15px]">calendar_today</span> Oct 23, 2024
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-[15px]">schedule</span> 1,248 Words
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-[15px]">tag</span> CS-DES-088
                  </span>
                </div>
              </div>

              {/* Total Score Pill Hero */}
              <div className="flex flex-col items-end justify-center bg-slate-50 px-4 py-2.5 rounded-xl border border-slate-200 shrink-0">
                <span className="uppercase tracking-wider text-slate-400 font-bold text-[10px]">
                  Earned Marks
                </span>
                <div className="flex items-baseline gap-1">
                  <span className="text-blue-600 font-bold text-3xl">
                    7.5
                  </span>
                  <span className="text-slate-500 font-medium text-base">/ 10.0</span>
                </div>
                <span className="font-mono text-emerald-700 font-bold text-[11px]">
                  75.0% Overall Band
                </span>
              </div>
            </div>

            {/* Semantic Evaluator Summary Callout */}
            <div className="p-4 rounded-xl bg-slate-50 flex items-start gap-3.5 border border-slate-200/80">
              <div className="w-9 h-9 rounded-lg bg-white flex items-center justify-center text-blue-600 shadow-xs shrink-0 border border-slate-200/50">
                <span className="material-symbols-outlined text-[20px]">auto_awesome</span>
              </div>
              <div className="space-y-1">
                <h3 className="text-slate-900 font-bold text-xs flex items-center gap-2">
                  ExplainGrade Synthetic Diagnostic
                  <span className="px-1.5 py-0.2 rounded bg-blue-100 text-blue-700 font-mono text-[10px] font-bold">
                    Engine v2.4 Checked
                  </span>
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Excellent descriptive exposition of spatial convolution kernels and pooling hierarchies. However, partial deductions occurred in the mathematical formalization of feature activation mapping and the strict formal definition of translational equivariance vs. invariance.
                </p>
              </div>
            </div>

            {/* Micro Rubric Criteria Progression Rails */}
            <div className="space-y-3">
              <div className="flex items-center justify-between pb-1">
                <h4 className="uppercase tracking-wider font-bold text-xs text-slate-700">
                  Criterion-Level Rubric Breakdown
                </h4>
                <span className="text-[11px] text-slate-400">6 Traceable Dimensions</span>
              </div>

              {/* Criterion 1 */}
              <div className="p-3.5 rounded-xl bg-white shadow-xs space-y-2 border border-slate-200/80">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-red-100 text-red-700 flex items-center justify-center text-[10px] font-bold">
                      !
                    </span>
                    <span className="text-xs font-semibold text-slate-900">
                      1. Core Formal Definition
                    </span>
                    <span className="px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 text-[10px]">
                      Weight: 1.0
                    </span>
                  </div>
                  <div className="flex items-center gap-1 font-mono text-xs">
                    <span className="text-slate-900 font-bold">0.5</span>
                    <span className="text-slate-400">/ 1.0</span>
                    <span className="text-red-600 font-bold text-[11px] ml-1">(50%)</span>
                  </div>
                </div>
                <div className="w-full h-1.5 rounded-full bg-slate-100 overflow-hidden">
                  <div className="h-full bg-red-500 rounded-full" style={{ width: '50%' }}></div>
                </div>
                <p className="text-[11px] text-slate-500 leading-snug">
                  <strong className="text-slate-700">Faculty Note:</strong> Omitted distinct differentiation between temporal vs. grid-structured spatial tensor representations.
                </p>
              </div>

              {/* Criterion 2 */}
              <div className="p-3.5 rounded-xl bg-white shadow-xs space-y-2 border border-slate-200/80">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-[10px] font-bold">
                      ✓
                    </span>
                    <span className="text-xs font-semibold text-slate-900">
                      2. Convolution & Kernel Arithmetic
                    </span>
                    <span className="px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 text-[10px]">
                      Weight: 2.0
                    </span>
                  </div>
                  <div className="flex items-center gap-1 font-mono text-xs">
                    <span className="text-emerald-700 font-bold">2.0</span>
                    <span className="text-slate-400">/ 2.0</span>
                    <span className="text-emerald-700 font-bold text-[11px] ml-1">(100%)</span>
                  </div>
                </div>
                <div className="w-full h-1.5 rounded-full bg-slate-100 overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: '100%' }}></div>
                </div>
                <p className="text-[11px] text-slate-500 leading-snug">
                  Flawless derivation of receptive fields, sliding dot-products, stride logic, and boundary conditions.
                </p>
              </div>

              {/* Criterion 3 */}
              <div className="p-3.5 rounded-xl bg-white shadow-xs space-y-2 border border-slate-200/80">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center text-[10px] font-bold">
                      Δ
                    </span>
                    <span className="text-xs font-semibold text-slate-900">
                      3. Latent Feature Extraction Hierarchy
                    </span>
                    <span className="px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 text-[10px]">
                      Weight: 2.0
                    </span>
                  </div>
                  <div className="flex items-center gap-1 font-mono text-xs">
                    <span className="text-blue-600 font-bold">1.0</span>
                    <span className="text-slate-400">/ 2.0</span>
                    <span className="text-amber-700 font-bold text-[11px] ml-1">(50%)</span>
                  </div>
                </div>
                <div className="w-full h-1.5 rounded-full bg-slate-100 overflow-hidden">
                  <div className="h-full bg-amber-400 rounded-full" style={{ width: '50%' }}></div>
                </div>
                <p className="text-[11px] text-slate-500 leading-snug">
                  Missed explanation of non-linear ReLU activation between linear matrix stages.
                </p>
              </div>

              {/* Criterion 4 */}
              <div className="p-3.5 rounded-xl bg-white shadow-xs space-y-2 border border-slate-200/80">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-[10px] font-bold">
                      ✓
                    </span>
                    <span className="text-xs font-semibold text-slate-900">
                      4. Pooling & Downsampling Layers
                    </span>
                    <span className="px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 text-[10px]">
                      Weight: 2.0
                    </span>
                  </div>
                  <div className="flex items-center gap-1 font-mono text-xs">
                    <span className="text-emerald-700 font-bold">2.0</span>
                    <span className="text-slate-400">/ 2.0</span>
                    <span className="text-emerald-700 font-bold text-[11px] ml-1">(100%)</span>
                  </div>
                </div>
                <div className="w-full h-1.5 rounded-full bg-slate-100 overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: '100%' }}></div>
                </div>
              </div>

              {/* Criterion 5 */}
              <div className="p-3.5 rounded-xl bg-white shadow-xs space-y-2 border border-slate-200/80">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-[10px] font-bold">
                      ✓
                    </span>
                    <span className="text-xs font-semibold text-slate-900">
                      5. Classification & Softmax Projection
                    </span>
                    <span className="px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 text-[10px]">
                      Weight: 2.0
                    </span>
                  </div>
                  <div className="flex items-center gap-1 font-mono text-xs">
                    <span className="text-emerald-700 font-bold">2.0</span>
                    <span className="text-slate-400">/ 2.0</span>
                    <span className="text-emerald-700 font-bold text-[11px] ml-1">(100%)</span>
                  </div>
                </div>
                <div className="w-full h-1.5 rounded-full bg-slate-100 overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: '100%' }}></div>
                </div>
              </div>

              {/* Criterion 6 */}
              <div className="p-3.5 rounded-xl bg-white shadow-xs space-y-2 border border-slate-200/80">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-[10px] font-bold">
                      ✓
                    </span>
                    <span className="text-xs font-semibold text-slate-900">
                      6. Real-World Applications
                    </span>
                    <span className="px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 text-[10px]">
                      Weight: 1.0
                    </span>
                  </div>
                  <div className="flex items-center gap-1 font-mono text-xs">
                    <span className="text-emerald-700 font-bold">1.0</span>
                    <span className="text-slate-400">/ 1.0</span>
                    <span className="text-emerald-700 font-bold text-[11px] ml-1">(100%)</span>
                  </div>
                </div>
                <div className="w-full h-1.5 rounded-full bg-slate-100 overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: '100%' }}></div>
                </div>
              </div>
            </div>

            {/* Action Remediations CTAs */}
            <div className="pt-2 flex flex-wrap items-center justify-between gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200/80">
              <div className="flex items-center gap-2 text-slate-600 text-xs">
                <span className="material-symbols-outlined text-[18px] text-blue-600">model_training</span>
                <span>Remediation model ready with 3 practice prompts</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onNavigate('student-feedback')}
                  className="px-3.5 py-1.5 rounded-lg bg-white text-blue-700 text-xs hover:bg-slate-50 transition-colors shadow-xs border border-slate-200 font-semibold cursor-pointer"
                  type="button"
                >
                  Remediation Sandbox
                </button>
                <button
                  onClick={() => onNavigate('student-feedback')}
                  className="inline-flex items-center gap-1 px-3.5 py-1.5 rounded-lg bg-blue-600 text-white text-xs hover:bg-blue-700 transition-colors shadow-xs font-semibold cursor-pointer"
                  type="button"
                >
                  <span>Review Detailed Explanation</span>
                  <span className="material-symbols-outlined text-[15px]">arrow_forward</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT 5 COLS: Concept Mastery Radar & Skill Gap Tracker */}
        <div className="xl:col-span-5 space-y-4">
          {/* Visual Mastery & Radar Container */}
          <div className="p-6 sm:p-7 rounded-2xl bg-white shadow-xs space-y-4 border border-slate-200/80">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Concept Mastery Radar
                </h3>
                <p className="text-xs text-slate-500">
                  CS231n Curriculum Syllabus Breakdown
                </p>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 font-mono text-[11px] font-semibold">
                Oct 2024 Index
              </span>
            </div>

            {/* Embedded SVG Concept Radar */}
            <div className="relative flex items-center justify-center p-4 bg-slate-50 rounded-xl overflow-hidden border border-slate-200/70">
              <svg className="w-full h-48 text-slate-300" fill="none" viewBox="0 0 320 220">
                <polygon
                  fill="none"
                  points="160,20 280,75 240,190 80,190 40,75"
                  stroke="currentColor"
                  strokeDasharray="3 3"
                  strokeWidth="1"
                ></polygon>
                <polygon
                  fill="none"
                  points="160,55 235,90 210,165 110,165 85,90"
                  stroke="currentColor"
                  strokeDasharray="2 2"
                  strokeWidth="1"
                ></polygon>
                <line stroke="currentColor" strokeWidth="1" x1="160" x2="160" y1="110" y2="20"></line>
                <line stroke="currentColor" strokeWidth="1" x1="160" x2="280" y1="110" y2="75"></line>
                <line stroke="currentColor" strokeWidth="1" x1="160" x2="240" y1="110" y2="190"></line>
                <line stroke="currentColor" strokeWidth="1" x1="160" x2="80" y1="110" y2="190"></line>
                <line stroke="currentColor" strokeWidth="1" x1="160" x2="40" y1="110" y2="75"></line>
                <polygon
                  className="text-blue-600"
                  fill="currentColor"
                  fillOpacity="0.18"
                  points="160,28 274,77 230,180 97,172 65,87"
                  stroke="currentColor"
                  strokeWidth="2"
                ></polygon>
                <circle className="fill-blue-600" cx="160" cy="28" r="3.5"></circle>
                <circle className="fill-blue-600" cx="274" cy="77" r="3.5"></circle>
                <circle className="fill-blue-600" cx="230" cy="180" r="3.5"></circle>
                <circle className="fill-blue-600" cx="97" cy="172" r="3.5"></circle>
                <circle className="fill-red-500 stroke-white stroke-2" cx="65" cy="87" r="4.5"></circle>
              </svg>
              <div className="absolute left-4 top-4 px-2 py-0.5 rounded-full bg-red-100 text-red-800 font-mono font-bold text-[10px] border border-red-200">
                Critical Gap: 64%
              </div>
            </div>

            {/* Topic Mastery Progress Rows */}
            <div className="space-y-3 pt-1">
              {/* Topic 1 */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-800">Neural Network Fundamentals</span>
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono font-bold text-slate-900">92%</span>
                    <span className="px-1.5 py-0.2 rounded bg-emerald-50 text-emerald-800 font-mono font-bold text-[10px]">
                      Mastered
                    </span>
                  </div>
                </div>
                <div className="w-full h-1.5 rounded-full bg-slate-100 overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: '92%' }}></div>
                </div>
              </div>

              {/* Topic 2 */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-800">Convolution & Spatial Filters</span>
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono font-bold text-slate-900">95%</span>
                    <span className="px-1.5 py-0.2 rounded bg-emerald-50 text-emerald-800 font-mono font-bold text-[10px]">
                      Mastered
                    </span>
                  </div>
                </div>
                <div className="w-full h-1.5 rounded-full bg-slate-100 overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: '95%' }}></div>
                </div>
              </div>

              {/* Topic 3 */}
              <div className="space-y-1 p-2.5 rounded-xl bg-red-50/70 border border-red-200/80">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1 text-red-900 font-bold">
                    <span className="material-symbols-outlined text-[15px] text-red-600">flag</span>
                    <span>Non-linear Activations & Loss</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono font-bold text-red-700">64%</span>
                    <span className="px-1.5 py-0.2 rounded bg-red-100 text-red-800 font-mono font-bold text-[10px]">
                      Review
                    </span>
                  </div>
                </div>
                <div className="w-full h-1.5 rounded-full bg-slate-200 overflow-hidden">
                  <div className="h-full bg-red-500 rounded-full" style={{ width: '64%' }}></div>
                </div>
                <span className="block text-slate-500 font-mono text-[10px]">
                  Directly linked to CNN Exam Criterion #1 & #3 deductions.
                </span>
              </div>

              {/* Topic 4 */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-800">Optimization & Backpropagation</span>
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono font-bold text-slate-900">78%</span>
                    <span className="px-1.5 py-0.2 rounded bg-blue-50 text-blue-700 font-mono font-bold text-[10px]">
                      Good
                    </span>
                  </div>
                </div>
                <div className="w-full h-1.5 rounded-full bg-slate-100 overflow-hidden">
                  <div className="h-full bg-blue-600 rounded-full" style={{ width: '78%' }}></div>
                </div>
              </div>

              {/* Topic 5 */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-800">Model Architectures & Transfer Learning</span>
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono font-bold text-slate-900">88%</span>
                    <span className="px-1.5 py-0.2 rounded bg-emerald-50 text-emerald-800 font-mono font-bold text-[10px]">
                      Proficient
                    </span>
                  </div>
                </div>
                <div className="w-full h-1.5 rounded-full bg-slate-100 overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: '88%' }}></div>
                </div>
              </div>
            </div>

            <button
              onClick={() => alert('Personalized 3-step study syllabus generated for Alex Chen.')}
              className="w-full py-2.5 rounded-xl bg-slate-100 text-slate-800 text-xs font-semibold hover:bg-slate-200 transition-colors flex items-center justify-center gap-1.5 border border-slate-200 cursor-pointer"
              type="button"
            >
              <span className="material-symbols-outlined text-[16px]">query_stats</span>
              <span>Generate Personalized Study Syllabus</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
