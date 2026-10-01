import React, { useState } from 'react';
import { api } from '../services/api.ts';
import { RubricCriterion, Question } from '../types/index.ts';

interface NewRubricModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (question: Question) => void;
}

export const NewRubricModal: React.FC<NewRubricModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [courseCode, setCourseCode] = useState('CS231n');
  const [courseName, setCourseName] = useState('Deep Learning for Computer Vision');
  const [targetExam, setTargetExam] = useState('Midterm Exam 2024');
  const [prompt, setPrompt] = useState('Explain the working of a Convolutional Neural Network.');
  const [maxMarks, setMaxMarks] = useState<number>(10.0);
  const [keyConcepts, setKeyConcepts] = useState(
    'Convolution mechanics, Stride and kernels, Feature hierarchy, Non-linear activation (ReLU), Pooling downsampling, Softmax classification'
  );
  const [expectedAnswer, setExpectedAnswer] = useState(
    'CNN is an architecture designed for grid-structured inputs. It uses sliding kernels, non-linear activations (ReLU), pooling for translation invariance, and dense layers for classification.'
  );

  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedCriteria, setGeneratedCriteria] = useState<RubricCriterion[] | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleGenerate = async () => {
    setIsGenerating(true);
    setErrorMsg(null);
    try {
      const conceptsList = keyConcepts.split(',').map((s) => s.trim()).filter(Boolean);
      const res = await api.generateRubricWithAI({
        questionPrompt: prompt,
        courseCode,
        courseName,
        maxMarks,
        keyConcepts: conceptsList,
        expectedAnswer,
      });

      setGeneratedCriteria(res.criteria);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to generate rubric');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSave = async () => {
    try {
      const conceptsList = keyConcepts.split(',').map((s) => s.trim()).filter(Boolean);
      const newQuestion = await api.createQuestion({
        courseCode,
        courseName,
        targetExam,
        prompt,
        maxMarks,
        keyConcepts: conceptsList,
        expectedAnswer,
      });

      if (generatedCriteria && generatedCriteria.length > 0) {
        await api.saveRubric(newQuestion.id, generatedCriteria, maxMarks);
      }

      onSuccess(newQuestion);
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to save question and rubric');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-on-surface/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-surface-container-lowest rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden border border-outline-variant/30">
        {/* Header */}
        <div className="p-space-lg border-b border-outline-variant/30 flex items-center justify-between bg-surface-container-low">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary text-on-primary flex items-center justify-center shadow-sm">
              <span className="material-symbols-outlined text-[24px]">architecture</span>
            </div>
            <div>
              <h2 className="font-headline-md text-headline-md text-on-surface font-bold">
                Create Question & Generate Rubric with AI
              </h2>
              <p className="font-label-md text-label-md text-secondary">
                Curricular Assessment Engine · Module 01 · Powered by Gemini 3.8 Flash
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-secondary hover:text-on-surface hover:bg-surface-container transition-colors"
            type="button"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Body */}
        <div className="p-space-lg overflow-y-auto space-y-space-md">
          {errorMsg && (
            <div className="p-3 rounded-lg bg-error-container text-on-error-container font-label-md text-label-md flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px]">error</span>
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="block font-label-md text-label-md text-secondary uppercase font-semibold mb-1">
                Course Code
              </label>
              <input
                type="text"
                value={courseCode}
                onChange={(e) => setCourseCode(e.target.value)}
                className="w-full p-2.5 rounded bg-surface-container-low border border-outline-variant/40 text-on-surface font-rubric-metric text-rubric-metric focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block font-label-md text-label-md text-secondary uppercase font-semibold mb-1">
                Course Name
              </label>
              <input
                type="text"
                value={courseName}
                onChange={(e) => setCourseName(e.target.value)}
                className="w-full p-2.5 rounded bg-surface-container-low border border-outline-variant/40 text-on-surface font-body-md text-body-md focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>

          <div>
            <label className="block font-label-md text-label-md text-secondary uppercase font-semibold mb-1">
              Descriptive Examination Prompt
            </label>
            <textarea
              rows={2}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="w-full p-2.5 rounded bg-surface-container-low border border-outline-variant/40 text-on-surface font-headline-md text-headline-md focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="block font-label-md text-label-md text-secondary uppercase font-semibold mb-1">
                Maximum Marks
              </label>
              <input
                type="number"
                step="0.5"
                value={maxMarks}
                onChange={(e) => setMaxMarks(parseFloat(e.target.value) || 10.0)}
                className="w-full p-2.5 rounded bg-surface-container-low border border-outline-variant/40 text-primary font-display-lg text-display-lg focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block font-label-md text-label-md text-secondary uppercase font-semibold mb-1">
                Key Concepts (comma separated)
              </label>
              <input
                type="text"
                value={keyConcepts}
                onChange={(e) => setKeyConcepts(e.target.value)}
                className="w-full p-2.5 rounded bg-surface-container-low border border-outline-variant/40 text-on-surface font-body-sm text-body-sm focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>

          <div>
            <label className="block font-label-md text-label-md text-secondary uppercase font-semibold mb-1">
              Expected Model Answer / Core Benchmarks
            </label>
            <textarea
              rows={3}
              value={expectedAnswer}
              onChange={(e) => setExpectedAnswer(e.target.value)}
              className="w-full p-2.5 rounded bg-surface-container-low border border-outline-variant/40 text-on-surface font-body-sm text-body-sm focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          {/* AI Generator Button */}
          <div className="p-4 rounded-xl bg-surface-container-low border border-primary/20 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[24px] text-primary">auto_awesome</span>
              <div>
                <h4 className="font-rubric-metric text-rubric-metric text-on-surface font-bold">
                  Generate Structured Rubric with Gemini Flash
                </h4>
                <p className="font-body-sm text-body-sm text-secondary">
                  Creates discrete weighted criteria, deduction rules, and scoring ladders totaling {maxMarks.toFixed(1)} marks.
                </p>
              </div>
            </div>
            <button
              onClick={handleGenerate}
              disabled={isGenerating}
              type="button"
              className="px-4 py-2 rounded bg-primary text-on-primary font-rubric-metric text-rubric-metric hover:bg-primary-container disabled:opacity-60 transition-all flex items-center gap-2 shadow-sm"
            >
              {isGenerating ? (
                <>
                  <span className="material-symbols-outlined text-[18px] animate-spin">refresh</span>
                  <span>Synthesizing Rubric...</span>
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[18px]">auto_awesome</span>
                  <span>Generate Rubric</span>
                </>
              )}
            </button>
          </div>

          {/* Generated Criteria Preview */}
          {generatedCriteria && generatedCriteria.length > 0 && (
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <span className="font-rubric-metric text-rubric-metric text-on-surface uppercase font-bold text-[14px]">
                  Generated Criteria Matrix ({generatedCriteria.length} Items)
                </span>
                <span className="px-2 py-0.5 rounded bg-tertiary-fixed text-on-tertiary-fixed font-code-eval text-code-eval font-semibold text-[11px]">
                  Total: {generatedCriteria.reduce((sum, c) => sum + c.maxMarks, 0).toFixed(1)} / {maxMarks.toFixed(1)} Marks Balanced
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {generatedCriteria.map((crit, idx) => (
                  <div
                    key={crit.id || idx}
                    className="p-3 rounded-lg bg-surface-container-low border border-outline-variant/30 flex flex-col justify-between space-y-2"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded bg-primary/10 text-primary font-code-eval font-bold text-[11px] flex items-center justify-center">
                          {idx + 1}
                        </span>
                        <h5 className="font-rubric-metric text-rubric-metric text-on-surface font-semibold text-[14px]">
                          {crit.name}
                        </h5>
                      </div>
                      <span className="px-2 py-0.5 rounded bg-primary-fixed text-on-primary-fixed font-code-eval font-semibold text-[11px]">
                        {crit.maxMarks.toFixed(1)} Pts ({crit.weightPct}%)
                      </span>
                    </div>
                    <p className="font-body-sm text-body-sm text-secondary text-[12px]">
                      {crit.description}
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {crit.targetSemanticAnchors.map((anchor, aIdx) => (
                        <span
                          key={aIdx}
                          className="px-1.5 py-0.2 rounded bg-surface-container text-on-surface font-code-eval text-[10px]"
                        >
                          {anchor}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-space-md border-t border-outline-variant/30 bg-surface-container-low flex items-center justify-between">
          <span className="font-label-md text-label-md text-secondary text-[12px]">
            Faculty must review and approve rubrics before publishing.
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded text-secondary hover:text-on-surface font-label-md text-label-md transition-colors"
              type="button"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 rounded bg-primary text-on-primary font-rubric-metric text-rubric-metric hover:bg-primary-container transition-all shadow-sm flex items-center gap-1.5"
              type="button"
            >
              <span className="material-symbols-outlined text-[16px]">save</span>
              <span>Approve & Save Question</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
