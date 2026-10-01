import React, { useState, useEffect } from 'react';
import { api } from '../services/api.ts';
import { FeedbackData } from '../types/index.ts';
import { WhyLostMarksModal } from '../components/WhyLostMarksModal.tsx';

interface FeedbackReportProps {
  answerId?: string;
}

export const FeedbackReport: React.FC<FeedbackReportProps> = ({ answerId = 'ans-alex-cs231n-04' }) => {
  const [feedback, setFeedback] = useState<FeedbackData | null>(null);
  const [viewMode, setViewMode] = useState<'split' | 'student' | 'model'>('split');
  const [proseInput, setProseInput] = useState('');
  const [sandboxScore, setSandboxScore] = useState(7.5);
  const [evalBadge, setEvalBadge] = useState('Awaiting Input');
  const [checks, setChecks] = useState({ relu: false, grid: false, formula: false });
  const [isWhyModalOpen, setIsWhyModalOpen] = useState(false);
  const [isTestingAi, setIsTestingAi] = useState(false);

  useEffect(() => {
    loadFeedback();
  }, [answerId]);

  const loadFeedback = async () => {
    try {
      const data = await api.getFeedback(answerId);
      setFeedback(data);
    } catch (e) {
      console.error('Failed to load feedback data', e);
    }
  };

  const wordCount = proseInput.trim() ? proseInput.trim().split(/\s+/).length : 0;

  const handleInsertTemplate = () => {
    const template =
      'CNNs operate on structured 2D grid topology. Immediately after convolution, an element-wise non-linear activation (ReLU: f(x) = max(0, x)) must be applied to prevent cascaded layers from collapsing into a single linear map. The spatial dimension transformation formula is O = ((W - F + 2P) / S) + 1.';
    setProseInput(template);
    runLiveCheck(template);
  };

  const handleClear = () => {
    setProseInput('');
    setSandboxScore(7.5);
    setEvalBadge('Awaiting Input');
    setChecks({ relu: false, grid: false, formula: false });
  };

  const runLiveCheck = async (text: string) => {
    setIsTestingAi(true);
    try {
      const res = await api.evaluateRemediationProse(text, 7.5);
      setSandboxScore(res.remediatedScore);
      setChecks(res.checks);
      setEvalBadge(res.statusBadge);
    } catch (e) {
      console.error(e);
    } finally {
      setIsTestingAi(false);
    }
  };

  return (
    <div className="flex flex-col w-full pb-16 space-y-6">
      {/* Executive Context Bar */}
      <section className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-200/80">
          <div className="flex items-center gap-3.5">
            <div className="relative w-11 h-11 rounded-full overflow-hidden bg-slate-100 shrink-0 ring-1 ring-slate-300">
              <img
                className="w-full h-full object-cover"
                alt="Alex Chen portrait"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCdTw4MunwNqvV9FBxMGoTfVCgLz760JQDn4sbQpCAMeewe8Kep3cs3Hxgg5OUUszTmA3gpAZye9yp5dHexfgXUF_ZeY42ejcRkZvqSMHQ4QAd-ta0j9r_9jlmXyhHNEO2YUd3OE4guyOpk82CL64Lc7-k4Q-G4KlpB1cZmgJFe10zJMLfSk95UOVF16fr6bkOfEsQNZ4Q3Xgl3mcdKlc_vxZz6KLKbP6KC4ZUTtTAlLRycRtKohd9d"
              />
            </div>
            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-base font-bold text-slate-900">
                  Alex Chen
                </span>
                <span className="font-mono text-slate-500 px-1.5 py-0.5 rounded bg-slate-100 text-[11px] font-semibold">
                  CS-24-9102
                </span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-[11px] font-semibold border border-emerald-200">
                  Verified Submission
                </span>
              </div>
              <p className="text-xs text-slate-500 truncate mt-0.5">
                Assignment 03 · Deep Architectures & Vision Systems · Mid-Term Assessment
              </p>
            </div>
          </div>

          {/* Quick Action Group */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setIsWhyModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-red-50 text-red-700 hover:bg-red-100 text-xs transition-colors font-semibold border border-red-200 cursor-pointer"
              type="button"
            >
              <span className="material-symbols-outlined text-[16px] text-red-600">help_outline</span>
              <span>Why Did I Lose Marks?</span>
            </button>
            <button
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200/70 text-slate-700 text-xs transition-colors border border-slate-200 font-medium cursor-pointer"
              type="button"
            >
              <span className="material-symbols-outlined text-[16px] text-blue-600">download</span>
              <span>Remediation PDF</span>
            </button>
            <button
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 text-white text-xs hover:bg-blue-700 transition-colors shadow-xs font-semibold cursor-pointer"
              type="button"
            >
              <span className="material-symbols-outlined text-[16px]">calendar_add_on</span>
              <span>Office Hours Check</span>
            </button>
          </div>
        </div>

        {/* Executive Feedback Hero Content */}
        <div className="pt-5 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="max-w-3xl flex flex-col space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></span>
              <span className="font-mono text-blue-600 uppercase tracking-wider font-bold text-[11px]">
                Descriptive Evaluation Protocol 4.2
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Descriptive Feedback Report & Conceptual Gap Analysis
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
              From marks to meaningful learning — Understand precisely where marks were lost and acquire targeted remediation to bridge foundational comprehension gaps.
            </p>
            <div className="pt-1 flex items-center gap-2 text-xs text-slate-500">
              <span className="font-semibold text-slate-900">Target Prompt:</span>
              <span className="italic text-slate-700">“Explain the working of a Convolutional Neural Network.”</span>
            </div>
          </div>

          {/* Grade & Scoring Dashboard Tile */}
          <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-center p-4 rounded-xl bg-slate-50 border border-slate-200/80 shrink-0 min-w-[240px]">
            <div className="flex flex-col sm:text-right">
              <span className="uppercase tracking-wider text-slate-500 font-bold text-[10px]">
                Awarded Mark
              </span>
              <div className="flex items-baseline sm:justify-end gap-1.5 my-0.5">
                <span className="text-blue-600 leading-none font-bold text-4xl">
                  7.5
                </span>
                <span className="text-slate-500 font-semibold text-xl">/ 10.0</span>
              </div>
              <div className="flex items-center sm:justify-end gap-2 mt-0.5">
                <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-red-100 text-red-800 font-mono text-[11px] font-bold">
                  -2.5 Marks Lost
                </span>
              </div>
            </div>

            <div className="sm:mt-3 sm:pt-3 sm:border-t sm:border-slate-200 flex items-center gap-4">
              <div className="text-left sm:text-right">
                <span className="block text-slate-400 text-[10px] uppercase font-bold">
                  Grade
                </span>
                <span className="text-slate-900 font-bold text-base">
                  B+
                </span>
              </div>
              <div className="h-5 w-px bg-slate-200 hidden sm:block"></div>
              <div className="text-left sm:text-right">
                <span className="block text-slate-400 text-[10px] uppercase font-bold">
                  Cohort Rank
                </span>
                <span className="text-emerald-700 font-bold text-base">
                  68th %ile
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* The Four Transparency Breakdown Pillars */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900">
              The 4 Pillars of Evaluation Transparency
            </h2>
            <p className="text-xs text-slate-500">
              Algorithmic deconstruction mapped against Stanford CS curriculum rubric metrics.
            </p>
          </div>
          <div className="hidden md:flex items-center gap-4 text-xs text-slate-600">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Mastered
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span> Gap Identified
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span> Remediation Available
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {/* Pillar 1: Strengths */}
          <div className="flex flex-col p-5 rounded-2xl bg-white shadow-xs hover:shadow-md transition-shadow border border-slate-200/80">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
              <div className="flex items-center gap-1.5 text-emerald-700">
                <span className="material-symbols-outlined text-[18px]">check_circle</span>
                <span className="font-bold text-xs text-slate-900">
                  Pillar 1: Mastered
                </span>
              </div>
              <span className="font-mono px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 font-bold text-[11px] border border-emerald-200">
                +6.0 Marks
              </span>
            </div>
            <h3 className="text-sm font-bold text-slate-900 mb-1">
              Core Strengths
            </h3>
            <p className="text-xs text-slate-500 mb-3">
              Robust comprehension observed across 4 foundational tenets.
            </p>
            <ul className="space-y-2 flex-1">
              <li className="flex items-start gap-2 p-2 rounded-lg bg-slate-50 text-xs">
                <span className="material-symbols-outlined text-[16px] text-emerald-600 shrink-0 mt-0.5">done</span>
                <span className="text-slate-700">
                  <strong className="text-slate-900">Kernel Mechanics:</strong> Clear 2D cross-correlation filter sliding.
                </span>
              </li>
              <li className="flex items-start gap-2 p-2 rounded-lg bg-slate-50 text-xs">
                <span className="material-symbols-outlined text-[16px] text-emerald-600 shrink-0 mt-0.5">done</span>
                <span className="text-slate-700">
                  <strong className="text-slate-900">Downsampling:</strong> Flawless Max Pooling & translation invariance.
                </span>
              </li>
              <li className="flex items-start gap-2 p-2 rounded-lg bg-slate-50 text-xs">
                <span className="material-symbols-outlined text-[16px] text-emerald-600 shrink-0 mt-0.5">done</span>
                <span className="text-slate-700">
                  <strong className="text-slate-900">Dense Mapping:</strong> Correct Softmax probability routing.
                </span>
              </li>
              <li className="flex items-start gap-2 p-2 rounded-lg bg-slate-50 text-xs">
                <span className="material-symbols-outlined text-[16px] text-emerald-600 shrink-0 mt-0.5">done</span>
                <span className="text-slate-700">
                  <strong className="text-slate-900">Applications:</strong> Real-world medical & autonomous cases.
                </span>
              </li>
            </ul>
          </div>

          {/* Pillar 2: Deductions & Root Causes */}
          <div className="flex flex-col p-5 rounded-2xl bg-white shadow-xs hover:shadow-md transition-shadow border border-slate-200/80">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
              <div className="flex items-center gap-1.5 text-red-600">
                <span className="material-symbols-outlined text-[18px]">remove_circle</span>
                <span className="font-bold text-xs text-slate-900">
                  Pillar 2: Deductions
                </span>
              </div>
              <span className="font-mono px-2 py-0.5 rounded-full bg-red-50 text-red-700 font-bold text-[11px] border border-red-200">
                -2.5 Marks
              </span>
            </div>
            <h3 className="text-sm font-bold text-slate-900 mb-1">
              Root Causes & Gaps
            </h3>
            <p className="text-xs text-slate-500 mb-3">
              Penalties triggered by specific omissions against model expectations.
            </p>
            <ul className="space-y-2 flex-1">
              <li className="p-2.5 rounded-lg bg-red-50/60 border border-red-200/70 text-xs">
                <div className="flex items-center justify-between mb-0.5">
                  <span className="font-bold text-red-900">Omitted ReLU Non-Linearity</span>
                  <span className="font-mono text-red-700 font-bold text-[11px]">-1.0</span>
                </div>
                <p className="text-slate-600 text-[11px] leading-tight">
                  Stacking linear convolutions collapses to one linear transform without ReLU.
                </p>
              </li>
              <li className="p-2.5 rounded-lg bg-red-50/60 border border-red-200/70 text-xs">
                <div className="flex items-center justify-between mb-0.5">
                  <span className="font-bold text-red-900">Missing Arithmetic Formula</span>
                  <span className="font-mono text-red-700 font-bold text-[11px]">-1.0</span>
                </div>
                <p className="text-slate-600 text-[11px] leading-tight">
                  Failed to derive spatial output dimension relation <code className="font-mono text-[10px]">O = ((W-F+2P)/S)+1</code>.
                </p>
              </li>
              <li className="p-2.5 rounded-lg bg-red-50/60 border border-red-200/70 text-xs">
                <div className="flex items-center justify-between mb-0.5">
                  <span className="font-bold text-red-900">Grid Topology Axiom</span>
                  <span className="font-mono text-red-700 font-bold text-[11px]">-0.5</span>
                </div>
                <p className="text-slate-600 text-[11px] leading-tight">
                  Omitted the foundational 2D/3D Euclidean grid topological prior.
                </p>
              </li>
            </ul>
          </div>

          {/* Pillar 3: Misconceptions */}
          <div className="flex flex-col p-5 rounded-2xl bg-white shadow-xs hover:shadow-md transition-shadow border border-slate-200/80">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
              <div className="flex items-center gap-1.5 text-amber-600">
                <span className="material-symbols-outlined text-[18px]">psychology</span>
                <span className="font-bold text-xs text-slate-900">
                  Pillar 3: Cognition
                </span>
              </div>
              <span className="font-mono px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 font-bold text-[11px] border border-amber-200">
                1 Alert
              </span>
            </div>
            <h3 className="text-sm font-bold text-slate-900 mb-1">
              Detected Misconception
            </h3>
            <p className="text-xs text-slate-500 mb-3">
              Theoretical misconstructions identified in response stream.
            </p>
            <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200 space-y-2 flex-1 flex flex-col justify-between">
              <div>
                <span className="text-amber-900 font-bold text-xs block mb-1">
                  Linear Feature Extraction Fallacy
                </span>
                <p className="text-slate-700 text-xs leading-relaxed">
                  Your answer implied that deep feature maps emerge solely through recursive convolving operations. In reality, deep representational capacity is entirely contingent on introducing point-wise non-linearities (like ReLU) between spatial stages.
                </p>
              </div>
              <div className="pt-2 border-t border-amber-200/70 text-[11px] text-amber-900 font-medium">
                📖 Goodfellow Deep Learning Ch. 9.2
              </div>
            </div>
          </div>

          {/* Pillar 4: Exemplar Delta */}
          <div className="flex flex-col p-5 rounded-2xl bg-white shadow-xs hover:shadow-md transition-shadow border border-slate-200/80">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
              <div className="flex items-center gap-1.5 text-blue-600">
                <span className="material-symbols-outlined text-[18px]">difference</span>
                <span className="font-bold text-xs text-slate-900">
                  Pillar 4: Exemplar Delta
                </span>
              </div>
              <span className="font-mono px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 font-bold text-[11px] border border-blue-200">
                84% Match
              </span>
            </div>
            <h3 className="text-sm font-bold text-slate-900 mb-1">
              Gap vs. Model Answer
            </h3>
            <p className="text-xs text-slate-500 mb-3">
              Direct delta benchmarked against perfect score department exemplar.
            </p>
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2 flex-1 flex flex-col justify-between text-xs">
              <div className="space-y-1.5">
                <div className="flex justify-between text-slate-600">
                  <span>Exemplar Benchmark</span>
                  <span className="font-bold text-slate-900">10.0 / 10.0</span>
                </div>
                <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-blue-600 h-full rounded-full" style={{ width: '84%' }}></div>
                </div>
                <p className="text-slate-500 text-[11px] pt-1">
                  Missing key formulations: activation thresholds, dimension equations, and inductive bias.
                </p>
              </div>
              <button
                onClick={() => setViewMode('split')}
                className="w-full py-1.5 rounded-lg bg-white hover:bg-slate-100 text-blue-600 font-semibold text-xs border border-slate-200 transition-colors shadow-xs cursor-pointer text-center"
                type="button"
              >
                Inspect Comparison
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Script Comparison */}
      <section className="bg-white rounded-2xl p-6 sm:p-7 shadow-xs border border-slate-200/80 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200/80">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              Interactive Script Comparison: Submission vs. Exemplar
            </h2>
            <p className="text-xs text-slate-500">
              Examine where conceptual drift occurred side-by-side with verified annotations.
            </p>
          </div>
          <div className="flex items-center p-0.5 rounded-lg bg-slate-100 border border-slate-200">
            <button
              onClick={() => setViewMode('split')}
              className={`px-3 py-1 rounded-md text-xs font-semibold transition-all ${
                viewMode === 'split' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600'
              }`}
              type="button"
            >
              Split View
            </button>
            <button
              onClick={() => setViewMode('student')}
              className={`px-3 py-1 rounded-md text-xs font-semibold transition-all ${
                viewMode === 'student' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600'
              }`}
              type="button"
            >
              Student Submission
            </button>
            <button
              onClick={() => setViewMode('model')}
              className={`px-3 py-1 rounded-md text-xs font-semibold transition-all ${
                viewMode === 'model' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600'
              }`}
              type="button"
            >
              Model Exemplar
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Left: Student Submission */}
          {(viewMode === 'split' || viewMode === 'student') && (
            <div className="p-4 sm:p-5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                <span className="font-bold text-xs text-slate-800 flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[16px] text-blue-600">person</span>
                  Alex Chen (Actual Submission)
                </span>
                <span className="font-mono text-xs font-bold text-slate-700">7.5 / 10.0</span>
              </div>
              <div className="text-xs text-slate-700 space-y-3 leading-relaxed">
                <p className="p-3 rounded-lg bg-white border border-slate-200/60">
                  A Convolutional Neural Network (CNN) is a deep learning architecture primarily utilized for image recognition and computer vision tasks. The network works by passing an input image through a series of specialized layers.
                </p>
                <p className="p-3 rounded-lg bg-white border border-slate-200/60">
                  First, the Convolution Layer applies learnable filters that slide across the input to perform element-wise multiplication and summation, generating feature maps that capture local spatial hierarchies such as edges and textures.
                </p>
                {/* Gap 1 */}
                <div className="p-3 rounded-lg bg-red-50 border-l-4 border-red-500 border border-red-200">
                  <div className="flex justify-between items-center mb-1 text-[11px] font-bold text-red-900">
                    <span>Gap: Non-Linear Activation (ReLU) Absent</span>
                    <span className="font-mono text-red-700">-1.0 Mark</span>
                  </div>
                  <p className="text-[11px] text-slate-600">
                    Progressed directly from convolutional filtering to max pooling without applying a non-linear activation threshold (e.g., ReLU).
                  </p>
                </div>
                <p className="p-3 rounded-lg bg-white border border-slate-200/60">
                  After convolution, the features pass to a Max Pooling layer. This reduces the spatial size of the feature map by selecting the maximum value within a window (usually 2x2). This step controls overfitting and provides translational invariance.
                </p>
                {/* Gap 2 */}
                <div className="p-3 rounded-lg bg-red-50 border-l-4 border-red-500 border border-red-200">
                  <div className="flex justify-between items-center mb-1 text-[11px] font-bold text-red-900">
                    <span>Gap: Arithmetic Formula Absent</span>
                    <span className="font-mono text-red-700">-1.0 Mark</span>
                  </div>
                  <p className="text-[11px] text-slate-600">
                    Did not provide mathematical relation for output spatial dimension after stride S and padding P.
                  </p>
                </div>
                <p className="p-3 rounded-lg bg-white border border-slate-200/60">
                  Finally, the pooled feature maps are flattened into a 1D vector and fed through Fully Connected (dense) layers. The final output layer uses Softmax to compute probabilities across target classes. CNNs are today used widely in CT scan diagnostics and autonomous navigation.
                </p>
              </div>
            </div>
          )}

          {/* Right: Model Exemplar */}
          {(viewMode === 'split' || viewMode === 'model') && (
            <div className="p-4 sm:p-5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                <span className="font-bold text-xs text-slate-800 flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[16px] text-emerald-600">star</span>
                  Department Exemplar (Full 10.0)
                </span>
                <span className="font-mono text-xs font-bold text-emerald-700">10.0 / 10.0</span>
              </div>
              <div className="text-xs text-slate-700 space-y-3 leading-relaxed">
                <p className="p-3 rounded-lg bg-white border border-slate-200/60">
                  <span className="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-semibold mr-1.5 text-[11px]">
                    Inductive Bias
                  </span>
                  Convolutional Neural Networks (CNNs) are architectures explicitly parameterized for data that has a known, <strong className="text-slate-900">grid-like topology (e.g., 2D arrays of pixels)</strong>. They leverage spatial locality and equivariant representations.
                </p>
                <p className="p-3 rounded-lg bg-white border border-slate-200/60">
                  1. <strong>Convolution Stage:</strong> Kernels of size <code className="font-mono bg-slate-100 px-1 rounded">K x K</code> compute affine linear transforms over receptive fields. The spatial output dimensions are governed by:
                  <span className="block my-2 p-2 rounded-lg bg-slate-100 font-mono text-blue-700 text-center font-bold text-xs">
                    O = ⌊(W - F + 2P) / S⌋ + 1
                  </span>
                  where W is input dimension, F is kernel size, P is zero-padding, and S is stride.
                </p>
                <div className="p-3 rounded-lg bg-emerald-50 border-l-4 border-emerald-600 border border-emerald-200">
                  <div className="text-[11px] font-bold text-emerald-900 mb-1">
                    Crucial Inclusion: Non-Linear Activation (ReLU)
                  </div>
                  <p className="text-[11px] text-slate-600">
                    2. <strong>Detector Stage:</strong> The linear output is immediately fed into an element-wise non-linear activation <code className="font-mono font-bold text-blue-700">f(x) = max(0, x)</code>. Without this step, stacking multiple convolution layers mathematically collapses into a single linear transform.
                  </p>
                </div>
                <p className="p-3 rounded-lg bg-white border border-slate-200/60">
                  3. <strong>Pooling Stage:</strong> Replaces the network output at specific locations with summary statistics (Max Pooling). This induces translation equivariance and invariance while halving spatial dimensions.
                </p>
                <p className="p-3 rounded-lg bg-white border border-slate-200/60">
                  4. <strong>Dense Classification:</strong> Flattened latent representations are routed through fully connected layers with Softmax normalization, mapping learned high-level abstractions to class likelihood vectors.
                </p>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Interactive Student Revision Sandbox */}
      <section className="bg-white rounded-2xl p-6 sm:p-7 shadow-xs border border-slate-200/80 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-slate-200/80">
          <div>
            <div className="flex items-center gap-1.5 text-blue-600 font-mono text-[11px] font-bold uppercase">
              <span className="material-symbols-outlined text-[16px]">terminal</span>
              <span>Interactive Remediation Sandbox</span>
            </div>
            <h2 className="text-lg font-bold text-slate-900 mt-0.5">
              Try Re-writing the Missing Section
            </h2>
            <p className="text-xs text-slate-500">
              Formulate the missing ReLU explanation and grid topology definition below. The ExplainGrade AI Engine will run deterministic rubric validation in real time.
            </p>
          </div>
          <div className="flex flex-col text-right">
            <span className="text-[11px] text-slate-400 font-medium">Target Recapture Potential</span>
            <span className="text-emerald-700 font-bold text-lg leading-none">+2.5 Marks</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Prose Input */}
          <div className="lg:col-span-7 flex flex-col space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span className="font-semibold text-slate-700">Student Sandbox Prose Editor</span>
              <span className="font-mono text-[11px]">
                {wordCount} words · Minimum 40 suggested
              </span>
            </div>
            <textarea
              className="w-full p-4 rounded-xl bg-slate-50 text-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-blue-600/30 focus:bg-white focus:border-blue-600 transition-all resize-y placeholder:text-slate-400 border border-slate-200 leading-relaxed"
              id="revision-input"
              placeholder="Type your revision here... (Hint: Address 2D grid topology, why ReLU non-linearity is mandatory after convolution to prevent collapsing to a single linear map, and state the spatial dimension equation)."
              rows={8}
              value={proseInput}
              onChange={(e) => {
                setProseInput(e.target.value);
                runLiveCheck(e.target.value);
              }}
            />
            <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
              <div className="flex items-center gap-2">
                <button
                  onClick={handleInsertTemplate}
                  className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200/70 text-slate-700 text-xs font-medium transition-colors border border-slate-200 cursor-pointer"
                  type="button"
                >
                  Insert Key Formula Template
                </button>
                <button
                  onClick={handleClear}
                  className="px-3 py-1.5 rounded-lg text-slate-500 hover:text-slate-800 text-xs transition-colors cursor-pointer"
                  type="button"
                >
                  Reset
                </button>
              </div>
              <button
                onClick={() => runLiveCheck(proseInput)}
                disabled={isTestingAi}
                className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 transition-colors shadow-xs cursor-pointer"
                type="button"
              >
                <span className="material-symbols-outlined text-[16px]">auto_awesome</span>
                <span>{isTestingAi ? 'Evaluating...' : 'Test with AI Engine'}</span>
              </button>
            </div>
          </div>

          {/* Real-time check card */}
          <div className="lg:col-span-5 flex flex-col justify-between p-4 sm:p-5 rounded-xl bg-slate-50 border border-slate-200/80">
            <div>
              <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-200">
                <span className="text-slate-900 font-bold text-xs">
                  Live Semantic Check
                </span>
                <span className="font-mono px-2 py-0.5 rounded-full bg-slate-200 text-slate-700 text-[11px] font-bold">
                  {evalBadge}
                </span>
              </div>

              <div className="space-y-2">
                <div className="flex items-start gap-2 p-2.5 rounded-lg bg-white border border-slate-200/60 shadow-xs">
                  <span
                    className={`material-symbols-outlined text-[18px] shrink-0 mt-0.5 ${
                      checks.relu ? 'text-emerald-600' : 'text-slate-300'
                    }`}
                  >
                    {checks.relu ? 'check_circle' : 'radio_button_unchecked'}
                  </span>
                  <div>
                    <div className="text-slate-900 font-semibold text-xs">
                      Non-linear Activation (ReLU)
                    </div>
                    <div className="text-[11px] text-slate-500">
                      Explains avoiding linear transformation collapse.
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-2 p-2.5 rounded-lg bg-white border border-slate-200/60 shadow-xs">
                  <span
                    className={`material-symbols-outlined text-[18px] shrink-0 mt-0.5 ${
                      checks.grid ? 'text-emerald-600' : 'text-slate-300'
                    }`}
                  >
                    {checks.grid ? 'check_circle' : 'radio_button_unchecked'}
                  </span>
                  <div>
                    <div className="text-slate-900 font-semibold text-xs">
                      2D Grid Topology Prior
                    </div>
                    <div className="text-[11px] text-slate-500">
                      Notes spatial arrays & weight sharing.
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-2 p-2.5 rounded-lg bg-white border border-slate-200/60 shadow-xs">
                  <span
                    className={`material-symbols-outlined text-[18px] shrink-0 mt-0.5 ${
                      checks.formula ? 'text-emerald-600' : 'text-slate-300'
                    }`}
                  >
                    {checks.formula ? 'check_circle' : 'radio_button_unchecked'}
                  </span>
                  <div>
                    <div className="text-slate-900 font-semibold text-xs">
                      Spatial Output Equation
                    </div>
                    <div className="text-[11px] text-slate-500">
                      Contains stride and padding parameters.
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-200">
                <div className="flex items-center justify-between mb-1.5 text-xs">
                  <span className="text-slate-500 font-medium">Simulated Recovered Score</span>
                  <span className="font-bold text-slate-900">
                    {sandboxScore.toFixed(1)} / 10.0
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-200 overflow-hidden">
                  <div
                    className={`h-full transition-all duration-500 ${
                      sandboxScore >= 9.5 ? 'bg-emerald-500' : 'bg-blue-600'
                    }`}
                    style={{ width: `${(sandboxScore / 10) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>

            <div className="mt-4 p-2.5 rounded-lg bg-white text-slate-500 text-[11px] border border-slate-200/60 leading-relaxed">
              <strong className="text-slate-700">Deterministic Traceability:</strong> This sandbox simulates how your revised response fulfills the rubric anchors.
            </div>
          </div>
        </div>
      </section>

      {/* Faculty Verification Endorsement Banner */}
      <section className="p-5 rounded-2xl bg-white shadow-xs flex flex-col md:flex-row items-center justify-between gap-4 border border-slate-200/80">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-700 shrink-0">
            <span className="material-symbols-outlined text-[24px]">verified_user</span>
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="text-slate-900 font-bold text-sm">
                Grading Verified & Endorsed
              </span>
              <span className="font-mono px-2 py-0.2 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                Audited
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Certified by <strong>Prof. Elena Vance</strong> (CS Chair & Course Evaluator) on October 24, 2024 at 14:32 PST.
            </p>
            <span className="font-mono text-slate-400 text-[11px] mt-0.5">
              Audit Hash: 9f82d1..c4a7 | ExplainGrade Engine v2.4 Compliant
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsWhyModalOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200/70 text-slate-700 text-xs font-semibold transition-colors border border-slate-200 cursor-pointer"
            type="button"
          >
            Complete Rubric Breakdown
          </button>
          <button
            onClick={() => alert('Remediation sign-off submitted to Prof. Elena Vance.')}
            className="px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 transition-colors shadow-xs cursor-pointer"
            type="button"
          >
            Sign Off Remediation
          </button>
        </div>
      </section>

      {/* Why Lost Marks Modal */}
      {feedback && (
        <WhyLostMarksModal
          isOpen={isWhyModalOpen}
          onClose={() => setIsWhyModalOpen(false)}
          items={feedback.whyLostMarks}
          onOpenSandbox={() => {
            const el = document.getElementById('revision-input');
            if (el) el.focus();
          }}
        />
      )}
    </div>
  );
};
