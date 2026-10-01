import React from 'react';

interface WhyLostItem {
  concept: string;
  deduction: number;
  studentAnswerSnippet: string;
  expectedConcept: string;
  why: string;
  howToImprove: string;
}

interface WhyLostMarksModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: WhyLostItem[];
  onOpenSandbox?: () => void;
}

export const WhyLostMarksModal: React.FC<WhyLostMarksModalProps> = ({
  isOpen,
  onClose,
  items,
  onOpenSandbox,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[85vh] flex flex-col overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-100 text-red-700 flex items-center justify-center shadow-xs">
              <span className="material-symbols-outlined text-[22px]">crisis_alert</span>
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Why Did I Lose Marks?
              </h2>
              <p className="text-xs text-slate-500">
                Exact criterion infractions, student excerpts, and targeted remediation steps.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-800 hover:bg-slate-200/60 transition-colors cursor-pointer"
            type="button"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        {/* Content list */}
        <div className="p-5 overflow-y-auto space-y-5 divide-y divide-slate-100">
          {items.map((item, idx) => (
            <div key={idx} className={idx > 0 ? 'pt-5' : ''}>
              {/* Concept title & deduction */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-red-100 text-red-700 flex items-center justify-center font-bold text-xs">
                    {idx + 1}
                  </span>
                  <h3 className="font-bold text-sm text-slate-900">
                    {item.concept}
                  </h3>
                </div>
                <span className="px-2.5 py-0.5 rounded-full bg-red-50 text-red-700 font-mono font-bold text-xs border border-red-200">
                  -{item.deduction.toFixed(1)} Marks
                </span>
              </div>

              {/* Grid breakdown */}
              <div className="space-y-2.5 text-xs">
                <div className="p-3 rounded-xl bg-red-50/50 border-l-4 border-red-500 border border-red-200/60">
                  <span className="block text-[10px] text-red-900 uppercase font-bold tracking-wider mb-1">
                    Your Submitted Answer Excerpt:
                  </span>
                  <p className="italic text-slate-700">
                    "{item.studentAnswerSnippet}"
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-blue-50/50 border-l-4 border-blue-600 border border-blue-200/60">
                  <span className="block text-[10px] text-blue-900 uppercase font-bold tracking-wider mb-1">
                    Expected Theoretical Concept:
                  </span>
                  <p className="text-slate-900 font-medium">
                    {item.expectedConcept}
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/70">
                  <span className="block text-[10px] text-slate-500 uppercase font-bold tracking-wider mb-1">
                    Diagnostic Rationale (Why marks were deducted):
                  </span>
                  <p className="text-slate-700 leading-relaxed">
                    {item.why}
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-emerald-50/60 border border-emerald-200/70">
                  <span className="block text-[10px] text-emerald-800 uppercase font-bold tracking-wider mb-1">
                    Remediation Action (How to regain credit):
                  </span>
                  <p className="text-emerald-900 font-medium leading-relaxed">
                    {item.howToImprove}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <span className="text-xs text-slate-500">
            ExplainGrade Traceability Protocol Active
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                onClose();
                if (onOpenSandbox) onOpenSandbox();
              }}
              className="px-3.5 py-1.5 rounded-xl bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 transition-colors shadow-xs cursor-pointer"
              type="button"
            >
              Open Remediation Sandbox
            </button>
            <button
              onClick={onClose}
              className="px-3.5 py-1.5 rounded-xl bg-white text-slate-700 hover:bg-slate-100 text-xs font-semibold transition-colors border border-slate-200 cursor-pointer"
              type="button"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
