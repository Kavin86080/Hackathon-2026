import React, { useState } from 'react';
import { api } from '../services/api.ts';
import { RubricCriterion } from '../types/index.ts';

interface QuestionsArchitectProps {
  onOpenNewRubricModal?: () => void;
}

export const QuestionsArchitect: React.FC<QuestionsArchitectProps> = ({ onOpenNewRubricModal }) => {
  const [promptText, setPromptText] = useState('Explain the working of a Convolutional Neural Network.');
  const [weights, setWeights] = useState<number[]>([1.0, 2.0, 2.0, 2.0, 2.0, 1.0]);
  const [sandboxText, setSandboxText] = useState(
    `A Convolutional Neural Network (CNN) is a deep learning architecture specially tailored for handling data with a grid topology, such as 2D images. Inspired by biological vision mechanisms discovered in animal visual cortices, CNNs achieve parameter efficiency through shared spatial kernels.\n\nThe core operation is convolution, where learnable filters slide across an input image with a specified stride, taking element-wise dot products to produce 2D activation maps or feature maps. This captures local spatial correlations. As data progresses, hierarchical feature extraction emerges: early layers detect rudimentary edges and gradients, while deeper layers synthesize these into intricate parts and textures. Non-linear activation functions like ReLU are applied to introduce non-linearity.\n\nTo compress the spatial dimensionality, pooling layers (most commonly Max Pooling) downsample the feature representations. This helps control overfitting, reduces compute load, and confers slight translation invariance.\n\nFinally, the multidimensional tensor is flattened into a 1D feature vector and passed through Fully Connected (Dense) layers. At the output stage, a Softmax activation produces normalized class probabilities across the candidate classification categories. CNNs are widely deployed in autonomous driving pipelines and radiology imaging diagnostics.`
  );

  const [simScore, setSimScore] = useState<number>(9.5);
  const [isSimulating, setIsSimulating] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [exportNotice, setExportNotice] = useState(false);

  const totalWeight = +weights.reduce((sum, w) => sum + w, 0).toFixed(1);
  const isBalanced = Math.abs(totalWeight - 10.0) < 0.05;

  const handleSliderChange = (idx: number, newVal: number) => {
    setWeights((prev) => {
      const next = [...prev];
      next[idx] = newVal;
      return next;
    });
  };

  const handleAutoNormalize = () => {
    const sum = weights.reduce((acc, w) => acc + w, 0);
    if (sum === 0) return;
    const normalized = weights.map((w) => +(Math.round(((w / sum) * 10) * 2) / 2).toFixed(1));
    const currentSum = normalized.reduce((acc, w) => acc + w, 0);
    const diff = +(10.0 - currentSum).toFixed(1);
    normalized[normalized.length - 1] = +(normalized[normalized.length - 1] + diff).toFixed(1);
    setWeights(normalized);
  };

  const handleLoadSample = () => {
    setSandboxText(
      `CNNs are networks that use convolution instead of general matrix multiplication in at least one of their layers. They scan images with filters to find patterns like corners or circles. After filtering, we use max pooling to make the size smaller so the computer doesn't get overloaded. In the end, dense layers classify the image into labels like dog or cat. For example, self-driving cars use this to see pedestrians.`
    );
  };

  const handleExecuteSimulation = async () => {
    setIsSimulating(true);
    try {
      const criteriaPayload: RubricCriterion[] = [
        {
          id: 'crit-1',
          order: 1,
          name: 'Definition & Core Axiom',
          description: 'Establishes input modality geometry and fundamental foundational neural architecture.',
          weightPct: 10,
          maxMarks: weights[0],
          targetSemanticAnchors: ['Grid-topology input', 'bio-inspired visual cortex', 'shift/spatial invariance'],
        },
        {
          id: 'crit-2',
          order: 2,
          name: 'Convolutional Mechanism',
          description: 'Mathematical or procedural mechanics of kernel transformation over matrix fields.',
          weightPct: 20,
          maxMarks: weights[1],
          targetSemanticAnchors: ['Kernels / filters', 'sliding window & stride', 'element-wise dot product', 'feature maps'],
        },
        {
          id: 'crit-3',
          order: 3,
          name: 'Hierarchical Feature Extraction',
          description: 'Progression of sensory representations through depth layers and non-linearities.',
          weightPct: 20,
          maxMarks: weights[2],
          targetSemanticAnchors: ['Hierarchical representation', 'edges -> textures -> parts', 'non-linear activation (ReLU)'],
        },
        {
          id: 'crit-4',
          order: 4,
          name: 'Subsampling & Pooling',
          description: 'Spatial dimension contraction and invariance mechanics across receptive fields.',
          weightPct: 20,
          maxMarks: weights[3],
          targetSemanticAnchors: ['Downsampling', 'Max Pooling / Avg Pooling', 'translation invariance', 'parameter reduction'],
        },
        {
          id: 'crit-5',
          order: 5,
          name: 'Classification & Dense Layers',
          description: 'Mapping spatial tensors to categorical probability manifolds.',
          weightPct: 20,
          maxMarks: weights[4],
          targetSemanticAnchors: ['Flattening layer', 'Fully Connected (Dense)', 'Softmax activation', 'class probability distribution'],
        },
        {
          id: 'crit-6',
          order: 6,
          name: 'Pragmatic Vision Applications',
          description: 'Anchors theoretical mechanism in production systems and domain relevance.',
          weightPct: 10,
          maxMarks: weights[5],
          targetSemanticAnchors: ['Autonomous vehicles', 'medical diagnostics', 'perceptual compute'],
        },
      ];

      const res = await api.simulateSandboxEvaluation({
        candidateProse: sandboxText,
        rubricCriteria: criteriaPayload,
      });

      setSimScore(res.simulatedScore);
    } catch (e) {
      console.error('Simulation error', e);
    } finally {
      setIsSimulating(false);
    }
  };

  const handleExportRubric = () => {
    setIsExporting(true);
    const rubricData = {
      questionPrompt: promptText,
      course: 'CS231n Deep Learning for Computer Vision',
      term: 'Midterm Exam 2024',
      totalMarks: 10.0,
      criteria: [
        { name: 'Definition & Core Axiom', weight: weights[0] },
        { name: 'Convolutional Mechanism', weight: weights[1] },
        { name: 'Hierarchical Feature Extraction', weight: weights[2] },
        { name: 'Subsampling & Pooling', weight: weights[3] },
        { name: 'Classification & Dense Layers', weight: weights[4] },
        { name: 'Pragmatic Vision Applications', weight: weights[5] },
      ],
      engine: 'ExplainGrade Engine v2.4 Compliant',
      exportedAt: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(rubricData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'CS231n_Q04_Rubric_Schema.json';
    a.click();
    setIsExporting(false);
    setExportNotice(true);
    setTimeout(() => setExportNotice(false), 2500);
  };

  return (
    <div className="flex flex-col w-full space-y-6 pb-12">
      {exportNotice && (
        <div className="fixed top-20 right-8 z-50 p-4 rounded-xl bg-blue-600 text-white shadow-xl flex items-center gap-3 animate-in slide-in-from-top-4 duration-300">
          <span className="material-symbols-outlined text-[20px]">file_download_done</span>
          <span className="font-semibold text-xs">
            Active Rubric exported as CS231n_Q04_Rubric_Schema.json
          </span>
        </div>
      )}

      {/* 1. Header Bar */}
      <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-blue-50 text-blue-700 text-xs font-semibold">
            <span className="material-symbols-outlined text-[15px]">architecture</span>
            <span>Curricular Assessment Engine · Module 01</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Questions & Rubric Architect
          </h1>
          <p className="text-sm text-slate-500 max-w-3xl leading-relaxed">
            Design weighted semantic rubrics, calibrate concept anchors, and benchmark deterministic AI evaluation models before publishing exam suites.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <button
            onClick={handleExportRubric}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white text-slate-700 hover:bg-slate-50 shadow-xs transition-colors border border-slate-200 text-xs font-semibold cursor-pointer"
            type="button"
          >
            <span className="material-symbols-outlined text-[16px] text-slate-500">file_download</span>
            <span>Export Active Rubric</span>
          </button>
          <button
            onClick={handleLoadSample}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white text-slate-700 hover:bg-slate-50 shadow-xs transition-colors border border-slate-200 text-xs font-semibold cursor-pointer"
            type="button"
          >
            <span className="material-symbols-outlined text-[16px] text-slate-500">input</span>
            <span>Import Bank (JSON/LTI)</span>
          </button>
          <button
            onClick={onOpenNewRubricModal}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700 shadow-xs transition-colors text-xs font-semibold cursor-pointer"
            type="button"
          >
            <span className="material-symbols-outlined text-[16px]">add_task</span>
            <span>Create New Question</span>
          </button>
        </div>
      </div>

      {/* 2. Active Question Editor Card */}
      <div className="relative bg-white rounded-2xl shadow-xs p-6 sm:p-7 overflow-hidden space-y-5 border border-slate-200/80">
        {/* Metadata Header Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 bg-slate-50 rounded-xl border border-slate-200/80">
          <div className="flex flex-wrap items-center gap-3 text-slate-600 font-mono text-xs">
            <div className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[16px] text-blue-600">bookmark</span>
              <span className="font-semibold text-slate-900">COURSE:</span> CS231n · Deep Learning for Computer Vision
            </div>
            <span className="text-slate-300">•</span>
            <div className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[16px] text-slate-500">assignment</span>
              <span className="font-semibold text-slate-900">TARGET:</span> Midterm Exam 2024
            </div>
            <span className="text-slate-300">•</span>
            <div className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[16px] text-emerald-600">fingerprint</span>
              <span className="font-semibold text-slate-900">QID:</span> #CS231N-MID-Q04-DESCR
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-mono font-semibold text-[11px] flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>LIVE CALIBRATION
            </span>
            <span className="px-2 py-0.5 rounded bg-slate-200/70 text-slate-700 font-mono text-[11px]">
              Revision 3.1
            </span>
          </div>
        </div>

        {/* Question Prompt Field */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label
              className="text-slate-900 font-bold uppercase tracking-wider text-xs"
              htmlFor="question-text"
            >
              Descriptive Examination Prompt
            </label>
            <span className="text-xs text-slate-400">
              Rich Markdown & LaTeX tokens supported
            </span>
          </div>
          <div className="relative">
            <textarea
              className="w-full bg-slate-50 focus:bg-white text-slate-900 font-medium rounded-xl p-4 focus:outline-none focus:ring-2 focus:ring-blue-600/30 focus:border-blue-600 transition-all border border-slate-200 resize-none text-[15px]"
              id="question-text"
              rows={2}
              value={promptText}
              onChange={(e) => setPromptText(e.target.value)}
            />
            <div className="absolute right-3 bottom-3 flex items-center gap-1 text-slate-400 font-mono text-[11px]">
              <span className="material-symbols-outlined text-[14px]">translate</span>
              <span>English (US)</span>
            </div>
          </div>
        </div>

        {/* Configuration Metric Strip */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-1">
          <div className="p-4 rounded-xl bg-slate-50 flex flex-col justify-between border border-slate-200/80">
            <span className="text-slate-500 uppercase tracking-wider font-bold text-[11px]">
              Maximum Marks
            </span>
            <div className="flex items-baseline justify-between mt-1">
              <span className="text-blue-600 tracking-tight font-bold text-3xl">
                {totalWeight.toFixed(1)}
              </span>
              <span className="font-mono text-slate-500 text-xs">
                Allocated: {Math.round((totalWeight / 10) * 100)}%
              </span>
            </div>
            <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden mt-2">
              <div
                className={`h-full rounded-full transition-all duration-300 ${
                  isBalanced ? 'bg-blue-600' : 'bg-red-500'
                }`}
                style={{ width: `${Math.min(100, (totalWeight / 10) * 100)}%` }}
              ></div>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 flex flex-col justify-between border border-slate-200/80">
            <span className="text-slate-500 uppercase tracking-wider font-bold text-[11px]">
              Evaluation Modality
            </span>
            <div className="mt-1 flex items-center gap-2">
              <span className="material-symbols-outlined text-blue-600 text-[20px]">subject</span>
              <span className="text-slate-900 font-bold text-sm">
                Long Descriptive
              </span>
            </div>
            <span className="font-mono text-slate-500 mt-1 text-[11px]">
              Essay format (300-800 words)
            </span>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 flex flex-col justify-between border border-slate-200/80">
            <span className="text-slate-500 uppercase tracking-wider font-bold text-[11px]">
              Semantic Precision Depth
            </span>
            <div className="mt-1 flex items-center gap-2">
              <span className="material-symbols-outlined text-emerald-600 text-[20px]">verified</span>
              <span className="text-slate-900 font-bold text-sm">
                Strict Semantic
              </span>
            </div>
            <span className="font-mono text-slate-500 mt-1 text-[11px]">
              Cos-sim cutoff: 0.84 / Concepts active
            </span>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 flex flex-col justify-between border border-slate-200/80">
            <span className="text-slate-500 uppercase tracking-wider font-bold text-[11px]">
              Ground Truth Corpus
            </span>
            <div className="mt-1 flex items-center gap-2">
              <span className="material-symbols-outlined text-slate-600 text-[20px]">menu_book</span>
              <span className="text-slate-900 truncate font-bold text-sm">
                Goodfellow Ch. 9 & CS231n
              </span>
            </div>
            <span className="font-mono text-slate-500 mt-1 text-[11px]">
              Syllabus Index Rev 2024.1
            </span>
          </div>
        </div>
      </div>

      {/* 3. Interactive Rubric Matrix */}
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-1.5 h-6 bg-blue-600 rounded-full"></div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-slate-900">
                Algorithmic Weighting & Criteria Matrix
              </h2>
              <span className="text-xs text-slate-500">
                6 Discrete Concept Nodes · Evaluated via Deterministic Scoring Vectors
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-slate-200 shadow-xs">
              <span className="font-mono text-slate-500 text-[11px]">TOTAL WEIGHT:</span>
              <span
                className={`font-bold text-sm ${
                  isBalanced ? 'text-blue-600' : 'text-red-600'
                }`}
              >
                {totalWeight.toFixed(1)} / 10.0 Marks ({Math.round((totalWeight / 10) * 100)}%)
              </span>
            </div>
            <button
              onClick={handleAutoNormalize}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-colors border border-slate-200 shadow-xs cursor-pointer"
              type="button"
            >
              <span className="material-symbols-outlined text-[15px]">tune</span>
              <span>Auto-Normalize Weights</span>
            </button>
          </div>
        </div>

        {/* 6 Criteria Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Criterion 1 */}
          <div className="bg-white rounded-2xl p-5 shadow-xs flex flex-col justify-between space-y-4 hover:shadow-md transition-shadow border border-slate-200/80">
            <div className="space-y-1">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="w-6 h-6 rounded-lg bg-blue-100 text-blue-700 font-mono font-bold flex items-center justify-center text-xs">
                    01
                  </span>
                  <span className="text-sm font-bold text-slate-900">
                    Definition & Core Axiom
                  </span>
                </div>
                <div className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 font-mono text-xs font-semibold border border-blue-200">
                  <span>{weights[0].toFixed(1)} Marks</span>
                  <span className="text-blue-400">
                    ({Math.round((weights[0] / totalWeight) * 100)}%)
                  </span>
                </div>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                Establishes input modality geometry and fundamental foundational neural architecture.
              </p>
            </div>

            <div className="space-y-1.5">
              <span className="text-slate-700 font-semibold text-[11px]">
                Target Semantic Anchors
              </span>
              <div className="flex flex-wrap gap-1.5">
                <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-mono text-[11px]">
                  Grid-topology input
                </span>
                <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-mono text-[11px]">
                  bio-inspired visual cortex
                </span>
                <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-mono text-[11px]">
                  shift/spatial invariance
                </span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 space-y-1 border border-slate-200/60">
              <div className="flex items-center justify-between text-slate-500 font-mono text-[11px]">
                <span>Deterministic Scoring Ladder</span>
                <span className="material-symbols-outlined text-[14px]">gavel</span>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center pt-1 text-xs">
                <div className="p-1.5 rounded-lg bg-white text-emerald-700 border border-slate-200/50">
                  <div className="font-bold">{weights[0].toFixed(1)}</div>
                  <div className="text-[10px] text-slate-500">Complete definition</div>
                </div>
                <div className="p-1.5 rounded-lg bg-white text-slate-700 border border-slate-200/50">
                  <div className="font-bold">{(weights[0] * 0.5).toFixed(1)}</div>
                  <div className="text-[10px] text-slate-500">Generic DL mention</div>
                </div>
                <div className="p-1.5 rounded-lg bg-white text-red-600 border border-slate-200/50">
                  <div className="font-bold">0.0</div>
                  <div className="text-[10px] text-slate-500">Missing</div>
                </div>
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-xs text-slate-500">
                <span>Weight Allocation</span>
                <span className="font-mono font-bold text-slate-900">{weights[0].toFixed(1)} pt</span>
              </div>
              <input
                className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                max="3.0"
                min="0.5"
                step="0.5"
                type="range"
                value={weights[0]}
                onChange={(e) => handleSliderChange(0, parseFloat(e.target.value))}
              />
            </div>
          </div>

          {/* Criterion 2 */}
          <div className="bg-white rounded-2xl p-5 shadow-xs flex flex-col justify-between space-y-4 hover:shadow-md transition-shadow border border-slate-200/80">
            <div className="space-y-1">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="w-6 h-6 rounded-lg bg-blue-100 text-blue-700 font-mono font-bold flex items-center justify-center text-xs">
                    02
                  </span>
                  <span className="text-sm font-bold text-slate-900">
                    Convolutional Mechanism
                  </span>
                </div>
                <div className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 font-mono text-xs font-semibold border border-blue-200">
                  <span>{weights[1].toFixed(1)} Marks</span>
                  <span className="text-blue-400">
                    ({Math.round((weights[1] / totalWeight) * 100)}%)
                  </span>
                </div>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                Mathematical or procedural mechanics of kernel transformation over matrix fields.
              </p>
            </div>

            <div className="space-y-1.5">
              <span className="text-slate-700 font-semibold text-[11px]">
                Target Semantic Anchors
              </span>
              <div className="flex flex-wrap gap-1.5">
                <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-mono text-[11px]">
                  Kernels / filters
                </span>
                <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-mono text-[11px]">
                  sliding window & stride
                </span>
                <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-mono text-[11px]">
                  element-wise dot product
                </span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 space-y-1 border border-slate-200/60">
              <div className="flex items-center justify-between text-slate-500 font-mono text-[11px]">
                <span>Deterministic Scoring Ladder</span>
                <span className="material-symbols-outlined text-[14px]">gavel</span>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center pt-1 text-xs">
                <div className="p-1.5 rounded-lg bg-white text-emerald-700 border border-slate-200/50">
                  <div className="font-bold">{weights[1].toFixed(1)}</div>
                  <div className="text-[10px] text-slate-500">Full math & filter stride</div>
                </div>
                <div className="p-1.5 rounded-lg bg-white text-slate-700 border border-slate-200/50">
                  <div className="font-bold">{(weights[1] * 0.5).toFixed(1)}</div>
                  <div className="text-[10px] text-slate-500">Conceptual mention</div>
                </div>
                <div className="p-1.5 rounded-lg bg-white text-red-600 border border-slate-200/50">
                  <div className="font-bold">0.0</div>
                  <div className="text-[10px] text-slate-500">Missing</div>
                </div>
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-xs text-slate-500">
                <span>Weight Allocation</span>
                <span className="font-mono font-bold text-slate-900">{weights[1].toFixed(1)} pt</span>
              </div>
              <input
                className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                max="4.0"
                min="0.5"
                step="0.5"
                type="range"
                value={weights[1]}
                onChange={(e) => handleSliderChange(1, parseFloat(e.target.value))}
              />
            </div>
          </div>

          {/* Criterion 3 */}
          <div className="bg-white rounded-2xl p-5 shadow-xs flex flex-col justify-between space-y-4 hover:shadow-md transition-shadow border border-slate-200/80">
            <div className="space-y-1">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="w-6 h-6 rounded-lg bg-blue-100 text-blue-700 font-mono font-bold flex items-center justify-center text-xs">
                    03
                  </span>
                  <span className="text-sm font-bold text-slate-900">
                    Hierarchical Feature Extraction
                  </span>
                </div>
                <div className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 font-mono text-xs font-semibold border border-blue-200">
                  <span>{weights[2].toFixed(1)} Marks</span>
                  <span className="text-blue-400">
                    ({Math.round((weights[2] / totalWeight) * 100)}%)
                  </span>
                </div>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                Progression of sensory representations through depth layers and non-linearities.
              </p>
            </div>

            <div className="space-y-1.5">
              <span className="text-slate-700 font-semibold text-[11px]">
                Target Semantic Anchors
              </span>
              <div className="flex flex-wrap gap-1.5">
                <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-mono text-[11px]">
                  Hierarchical representation
                </span>
                <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-mono text-[11px]">
                  edges - textures - parts
                </span>
                <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-mono text-[11px]">
                  non-linear ReLU activation
                </span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 space-y-1 border border-slate-200/60">
              <div className="flex items-center justify-between text-slate-500 font-mono text-[11px]">
                <span>Deterministic Scoring Ladder</span>
                <span className="material-symbols-outlined text-[14px]">gavel</span>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center pt-1 text-xs">
                <div className="p-1.5 rounded-lg bg-white text-emerald-700 border border-slate-200/50">
                  <div className="font-bold">{weights[2].toFixed(1)}</div>
                  <div className="text-[10px] text-slate-500">Depths + ReLU function</div>
                </div>
                <div className="p-1.5 rounded-lg bg-white text-slate-700 border border-slate-200/50">
                  <div className="font-bold">{(weights[2] * 0.5).toFixed(1)}</div>
                  <div className="text-[10px] text-slate-500">Omitted ReLU</div>
                </div>
                <div className="p-1.5 rounded-lg bg-white text-red-600 border border-slate-200/50">
                  <div className="font-bold">0.0</div>
                  <div className="text-[10px] text-slate-500">Missing</div>
                </div>
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-xs text-slate-500">
                <span>Weight Allocation</span>
                <span className="font-mono font-bold text-slate-900">{weights[2].toFixed(1)} pt</span>
              </div>
              <input
                className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                max="4.0"
                min="0.5"
                step="0.5"
                type="range"
                value={weights[2]}
                onChange={(e) => handleSliderChange(2, parseFloat(e.target.value))}
              />
            </div>
          </div>

          {/* Criterion 4 */}
          <div className="bg-white rounded-2xl p-5 shadow-xs flex flex-col justify-between space-y-4 hover:shadow-md transition-shadow border border-slate-200/80">
            <div className="space-y-1">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="w-6 h-6 rounded-lg bg-blue-100 text-blue-700 font-mono font-bold flex items-center justify-center text-xs">
                    04
                  </span>
                  <span className="text-sm font-bold text-slate-900">
                    Subsampling & Pooling
                  </span>
                </div>
                <div className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 font-mono text-xs font-semibold border border-blue-200">
                  <span>{weights[3].toFixed(1)} Marks</span>
                  <span className="text-blue-400">
                    ({Math.round((weights[3] / totalWeight) * 100)}%)
                  </span>
                </div>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                Spatial dimension contraction and invariance mechanics across receptive fields.
              </p>
            </div>

            <div className="space-y-1.5">
              <span className="text-slate-700 font-semibold text-[11px]">
                Target Semantic Anchors
              </span>
              <div className="flex flex-wrap gap-1.5">
                <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-mono text-[11px]">
                  Downsampling
                </span>
                <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-mono text-[11px]">
                  Max / Avg Pooling
                </span>
                <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-mono text-[11px]">
                  translation invariance
                </span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 space-y-1 border border-slate-200/60">
              <div className="flex items-center justify-between text-slate-500 font-mono text-[11px]">
                <span>Deterministic Scoring Ladder</span>
                <span className="material-symbols-outlined text-[14px]">gavel</span>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center pt-1 text-xs">
                <div className="p-1.5 rounded-lg bg-white text-emerald-700 border border-slate-200/50">
                  <div className="font-bold">{weights[3].toFixed(1)}</div>
                  <div className="text-[10px] text-slate-500">Windowing + Invariance</div>
                </div>
                <div className="p-1.5 rounded-lg bg-white text-slate-700 border border-slate-200/50">
                  <div className="font-bold">{(weights[3] * 0.5).toFixed(1)}</div>
                  <div className="text-[10px] text-slate-500">Only reduction noted</div>
                </div>
                <div className="p-1.5 rounded-lg bg-white text-red-600 border border-slate-200/50">
                  <div className="font-bold">0.0</div>
                  <div className="text-[10px] text-slate-500">Missing</div>
                </div>
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-xs text-slate-500">
                <span>Weight Allocation</span>
                <span className="font-mono font-bold text-slate-900">{weights[3].toFixed(1)} pt</span>
              </div>
              <input
                className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                max="4.0"
                min="0.5"
                step="0.5"
                type="range"
                value={weights[3]}
                onChange={(e) => handleSliderChange(3, parseFloat(e.target.value))}
              />
            </div>
          </div>

          {/* Criterion 5 */}
          <div className="bg-white rounded-2xl p-5 shadow-xs flex flex-col justify-between space-y-4 hover:shadow-md transition-shadow border border-slate-200/80">
            <div className="space-y-1">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="w-6 h-6 rounded-lg bg-blue-100 text-blue-700 font-mono font-bold flex items-center justify-center text-xs">
                    05
                  </span>
                  <span className="text-sm font-bold text-slate-900">
                    Classification & Dense Layers
                  </span>
                </div>
                <div className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 font-mono text-xs font-semibold border border-blue-200">
                  <span>{weights[4].toFixed(1)} Marks</span>
                  <span className="text-blue-400">
                    ({Math.round((weights[4] / totalWeight) * 100)}%)
                  </span>
                </div>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                Mapping spatial tensors to categorical probability manifolds.
              </p>
            </div>

            <div className="space-y-1.5">
              <span className="text-slate-700 font-semibold text-[11px]">
                Target Semantic Anchors
              </span>
              <div className="flex flex-wrap gap-1.5">
                <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-mono text-[11px]">
                  Flattening layer
                </span>
                <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-mono text-[11px]">
                  Fully Connected (Dense)
                </span>
                <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-mono text-[11px]">
                  Softmax distribution
                </span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 space-y-1 border border-slate-200/60">
              <div className="flex items-center justify-between text-slate-500 font-mono text-[11px]">
                <span>Deterministic Scoring Ladder</span>
                <span className="material-symbols-outlined text-[14px]">gavel</span>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center pt-1 text-xs">
                <div className="p-1.5 rounded-lg bg-white text-emerald-700 border border-slate-200/50">
                  <div className="font-bold">{weights[4].toFixed(1)}</div>
                  <div className="text-[10px] text-slate-500">Vector flattening + Softmax</div>
                </div>
                <div className="p-1.5 rounded-lg bg-white text-slate-700 border border-slate-200/50">
                  <div className="font-bold">{(weights[4] * 0.5).toFixed(1)}</div>
                  <div className="text-[10px] text-slate-500">Only classification noted</div>
                </div>
                <div className="p-1.5 rounded-lg bg-white text-red-600 border border-slate-200/50">
                  <div className="font-bold">0.0</div>
                  <div className="text-[10px] text-slate-500">Missing</div>
                </div>
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-xs text-slate-500">
                <span>Weight Allocation</span>
                <span className="font-mono font-bold text-slate-900">{weights[4].toFixed(1)} pt</span>
              </div>
              <input
                className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                max="4.0"
                min="0.5"
                step="0.5"
                type="range"
                value={weights[4]}
                onChange={(e) => handleSliderChange(4, parseFloat(e.target.value))}
              />
            </div>
          </div>

          {/* Criterion 6 */}
          <div className="bg-white rounded-2xl p-5 shadow-xs flex flex-col justify-between space-y-4 hover:shadow-md transition-shadow border border-slate-200/80">
            <div className="space-y-1">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="w-6 h-6 rounded-lg bg-blue-100 text-blue-700 font-mono font-bold flex items-center justify-center text-xs">
                    06
                  </span>
                  <span className="text-sm font-bold text-slate-900">
                    Pragmatic Vision Applications
                  </span>
                </div>
                <div className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 font-mono text-xs font-semibold border border-blue-200">
                  <span>{weights[5].toFixed(1)} Marks</span>
                  <span className="text-blue-400">
                    ({Math.round((weights[5] / totalWeight) * 100)}%)
                  </span>
                </div>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                Anchors theoretical mechanism in production systems and domain relevance.
              </p>
            </div>

            <div className="space-y-1.5">
              <span className="text-slate-700 font-semibold text-[11px]">
                Target Semantic Anchors
              </span>
              <div className="flex flex-wrap gap-1.5">
                <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-mono text-[11px]">
                  Autonomous driving
                </span>
                <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-mono text-[11px]">
                  radiology & pathology
                </span>
                <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-mono text-[11px]">
                  real-time video perception
                </span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 space-y-1 border border-slate-200/60">
              <div className="flex items-center justify-between text-slate-500 font-mono text-[11px]">
                <span>Deterministic Scoring Ladder</span>
                <span className="material-symbols-outlined text-[14px]">gavel</span>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center pt-1 text-xs">
                <div className="p-1.5 rounded-lg bg-white text-emerald-700 border border-slate-200/50">
                  <div className="font-bold">{weights[5].toFixed(1)}</div>
                  <div className="text-[10px] text-slate-500">Multiple concrete cases</div>
                </div>
                <div className="p-1.5 rounded-lg bg-white text-slate-700 border border-slate-200/50">
                  <div className="font-bold">{(weights[5] * 0.5).toFixed(1)}</div>
                  <div className="text-[10px] text-slate-500">Vague imaging mention</div>
                </div>
                <div className="p-1.5 rounded-lg bg-white text-red-600 border border-slate-200/50">
                  <div className="font-bold">0.0</div>
                  <div className="text-[10px] text-slate-500">Missing</div>
                </div>
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-xs text-slate-500">
                <span>Weight Allocation</span>
                <span className="font-mono font-bold text-slate-900">{weights[5].toFixed(1)} pt</span>
              </div>
              <input
                className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                max="3.0"
                min="0.5"
                step="0.5"
                type="range"
                value={weights[5]}
                onChange={(e) => handleSliderChange(5, parseFloat(e.target.value))}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Rubric Verification Status Bar */}
      <div
        className={`p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 border ${
          isBalanced
            ? 'bg-emerald-50/70 border-emerald-200 text-emerald-900'
            : 'bg-amber-50/70 border-amber-200 text-amber-900'
        }`}
      >
        <div className="flex items-center gap-3">
          <div
            className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
              isBalanced ? 'bg-emerald-600 text-white' : 'bg-amber-500 text-white'
            }`}
          >
            <span className="material-symbols-outlined text-[20px]">
              {isBalanced ? 'verified' : 'warning'}
            </span>
          </div>
          <div>
            <div className="font-bold text-sm">
              {isBalanced ? 'Rubric Verification Protocol Passed' : 'Weight Allocation Warning'}
            </div>
            <p className="text-xs opacity-90">
              {isBalanced
                ? '✓ 10.0/10.0 Marks Balanced · 0 Criteria Collisions Detected · Calibrated for Semantic Evaluation'
                : `⚠ Total allocated is ${totalWeight.toFixed(1)}/10.0 Marks. Click "Auto-Normalize Weights" to balance to exactly 10.0.`}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white/80 text-slate-700 font-mono text-[11px] border border-slate-200/50">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Gemini-3.8-Flash
          </span>
          <button
            onClick={handleAutoNormalize}
            className="px-3.5 py-1.5 rounded-lg bg-white text-slate-900 hover:bg-slate-50 text-xs font-semibold transition-colors border border-slate-200 shadow-xs cursor-pointer"
            type="button"
          >
            Lock & Publish Rubric
          </button>
        </div>
      </div>

      {/* 4. Benchmarking & AI Alignment Tester */}
      <div className="bg-white rounded-2xl p-6 sm:p-7 shadow-xs space-y-5 border border-slate-200/80">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 font-mono text-[11px] font-bold mb-1">
              <span className="material-symbols-outlined text-[14px]">science</span>
              <span>SANDBOX EVALUATION ENVIRONMENT</span>
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-slate-900">
              Test Rubric with Synthetic Answer
            </h3>
            <p className="text-xs text-slate-500">
              Inject a test submission to calibrate semantic vector thresholds and verify mark attribution before releasing to students.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleLoadSample}
              className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200/70 text-slate-700 text-xs font-medium transition-colors flex items-center gap-1 border border-slate-200 cursor-pointer"
              type="button"
            >
              <span className="material-symbols-outlined text-[16px]">history_edu</span>
              <span>Load Sample Response</span>
            </button>
            <button
              onClick={handleExecuteSimulation}
              disabled={isSimulating}
              className="px-4 py-1.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700 text-xs font-semibold transition-colors shadow-xs flex items-center gap-1.5 cursor-pointer"
              type="button"
            >
              {isSimulating ? (
                <>
                  <span className="material-symbols-outlined text-[16px] animate-spin">refresh</span>
                  <span>Simulating...</span>
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[16px]">play_circle</span>
                  <span>Execute Simulation</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Dual Split Simulation Canvas */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Synthetic Answer Input Panel (7 Cols) */}
          <div className="lg:col-span-7 flex flex-col space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Candidate Response Stream
              </label>
              <span className="font-mono text-slate-400 text-[11px]">
                {sandboxText.split(/\s+/).filter(Boolean).length} words · {sandboxText.length} chars
              </span>
            </div>
            <textarea
              className="w-full h-full min-h-[300px] p-4 rounded-xl bg-slate-50 text-slate-800 text-xs focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-600/30 focus:border-blue-600 transition-all resize-none leading-relaxed border border-slate-200"
              rows={12}
              value={sandboxText}
              onChange={(e) => setSandboxText(e.target.value)}
            />
          </div>

          {/* Live Alignment Diagnostics & Projected Marks (5 Cols) */}
          <div className="lg:col-span-5 bg-slate-50 rounded-xl p-4 sm:p-5 flex flex-col justify-between space-y-4 border border-slate-200/80">
            <div className="space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                <span className="text-slate-900 font-bold text-xs">
                  Simulated Evaluation Output
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-mono font-bold text-xs border border-emerald-200">
                  {simScore.toFixed(1)} / 10.0 Marks
                </span>
              </div>

              {/* Dynamic Criterion Breakdown Stack */}
              <div className="space-y-1.5">
                <div className="p-2 rounded-lg bg-white flex items-center justify-between shadow-xs border border-slate-200/50">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-emerald-600 text-[16px]">check_circle</span>
                    <span className="text-slate-800 text-xs font-medium">C1: Definition & Axiom</span>
                  </div>
                  <span className="font-mono text-emerald-700 font-bold text-xs">
                    {weights[0].toFixed(1)} / {weights[0].toFixed(1)}
                  </span>
                </div>

                <div className="p-2 rounded-lg bg-white flex items-center justify-between shadow-xs border border-slate-200/50">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-emerald-600 text-[16px]">check_circle</span>
                    <span className="text-slate-800 text-xs font-medium">C2: Convolution Mechanism</span>
                  </div>
                  <span className="font-mono text-emerald-700 font-bold text-xs">
                    {weights[1].toFixed(1)} / {weights[1].toFixed(1)}
                  </span>
                </div>

                <div className="p-2 rounded-lg bg-white flex items-center justify-between shadow-xs border border-slate-200/50">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-emerald-600 text-[16px]">check_circle</span>
                    <span className="text-slate-800 text-xs font-medium">C3: Feature Hierarchy</span>
                  </div>
                  <span className="font-mono text-emerald-700 font-bold text-xs">
                    {weights[2].toFixed(1)} / {weights[2].toFixed(1)}
                  </span>
                </div>

                <div className="p-2 rounded-lg bg-white flex items-center justify-between shadow-xs border border-slate-200/50">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-amber-500 text-[16px]">change_circle</span>
                    <span className="text-slate-800 text-xs font-medium">C4: Pooling & Invariance</span>
                  </div>
                  <span className="font-mono text-amber-700 font-bold text-xs">
                    {(weights[3] - 0.5).toFixed(1)} / {weights[3].toFixed(1)}
                  </span>
                </div>

                <div className="p-2 rounded-lg bg-white flex items-center justify-between shadow-xs border border-slate-200/50">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-emerald-600 text-[16px]">check_circle</span>
                    <span className="text-slate-800 text-xs font-medium">C5: Classification Layer</span>
                  </div>
                  <span className="font-mono text-emerald-700 font-bold text-xs">
                    {weights[4].toFixed(1)} / {weights[4].toFixed(1)}
                  </span>
                </div>

                <div className="p-2 rounded-lg bg-white flex items-center justify-between shadow-xs border border-slate-200/50">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-emerald-600 text-[16px]">check_circle</span>
                    <span className="text-slate-800 text-xs font-medium">C6: Real-world Applications</span>
                  </div>
                  <span className="font-mono text-emerald-700 font-bold text-xs">
                    {weights[5].toFixed(1)} / {weights[5].toFixed(1)}
                  </span>
                </div>
              </div>
            </div>

            {/* Semantic Radar / Vector Alignment Card */}
            <div className="p-3 rounded-lg bg-white space-y-1 border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500 font-bold text-[11px] uppercase">Synthesized Evaluator Note</span>
                <span className="font-mono text-blue-600 text-[11px] font-bold">Conf: 98.4%</span>
              </div>
              <p className="text-xs text-slate-600 leading-snug">
                "Candidate articulates stride and kernel dot product accurately. Minus 0.5 points on C4 for omitting explicit mention of average pooling contrast."
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
