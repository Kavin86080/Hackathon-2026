import React, { useState } from 'react';
import { api } from '../services/api.ts';
import { CourseDocument } from '../types/index.ts';

interface KnowledgeUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (doc: CourseDocument) => void;
}

export const KnowledgeUploadModal: React.FC<KnowledgeUploadModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState('Computer Science');
  const [topic, setTopic] = useState('Deep Learning & Neural Networks');
  const [content, setContent] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleUpload = async () => {
    if (!title.trim() || !content.trim()) {
      setErrorMsg('Please provide both a title and document content.');
      return;
    }

    setIsUploading(true);
    setErrorMsg(null);
    try {
      const res = await api.uploadDocument({
        title,
        subject,
        topic,
        content,
      });
      onSuccess(res.document);
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to upload document');
    } finally {
      setIsUploading(false);
    }
  };

  const handleLoadSample = () => {
    setTitle('Goodfellow Deep Learning: Section 9.3 Pooling Strategies');
    setSubject('Deep Learning');
    setTopic('Pooling & Invariance');
    setContent(`Section 9.3: Pooling.
A pooling function replaces the output of the net at a certain location with a summary statistic of the nearby outputs. For example, the max pooling operation reports the maximum output within a rectangular neighborhood. Other popular pooling functions include the average of a rectangular neighborhood, the L2 norm of a rectangular neighborhood, or a weighted average based on the distance from the central pixel.

In all cases, pooling helps to make the representation approximately invariant to small translations of the input. Invariance to translation means that if we translate the input by a small amount, the values of most of the pooled outputs do not change. This is useful when we care more about whether a feature is present than where exactly it is.

Pooling over spatial regions also produces a dramatic reduction in the computational and statistical efficiency of the network because the next layer has roughly k times fewer inputs to process, where k is the pooling downsampling factor.`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-on-surface/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-surface-container-lowest rounded-2xl shadow-xl w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden border border-outline-variant/30">
        <div className="p-space-lg border-b border-outline-variant/30 flex items-center justify-between bg-surface-container-low">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary text-on-primary flex items-center justify-center shadow-sm">
              <span className="material-symbols-outlined text-[24px]">cloud_upload</span>
            </div>
            <div>
              <h2 className="font-headline-md text-headline-md text-on-surface font-bold">
                Upload Course Knowledge to RAG
              </h2>
              <p className="font-label-md text-label-md text-secondary">
                Ground AI evaluations in approved institutional textbooks & syllabus
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

        <div className="p-space-lg overflow-y-auto space-y-space-md">
          {errorMsg && (
            <div className="p-3 rounded-lg bg-error-container text-on-error-container font-label-md text-label-md flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px]">error</span>
              <span>{errorMsg}</span>
            </div>
          )}

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block font-label-md text-label-md text-secondary uppercase font-semibold">
                Document Title
              </label>
              <button
                type="button"
                onClick={handleLoadSample}
                className="text-primary hover:underline font-label-md text-label-md flex items-center gap-1"
              >
                <span className="material-symbols-outlined text-[14px]">history_edu</span>
                Load Sample Textbook Section
              </button>
            </div>
            <input
              type="text"
              placeholder="e.g. Stanford CS231n Lecture 05 Notes or Goodfellow Ch 9"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full p-2.5 rounded bg-surface-container-low border border-outline-variant/40 text-on-surface font-body-md text-body-md focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-label-md text-label-md text-secondary uppercase font-semibold mb-1">
                Subject
              </label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full p-2.5 rounded bg-surface-container-low border border-outline-variant/40 text-on-surface font-body-sm text-body-sm focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
            <div>
              <label className="block font-label-md text-label-md text-secondary uppercase font-semibold mb-1">
                Topic
              </label>
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                className="w-full p-2.5 rounded bg-surface-container-low border border-outline-variant/40 text-on-surface font-body-sm text-body-sm focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>

          <div>
            <label className="block font-label-md text-label-md text-secondary uppercase font-semibold mb-1">
              Course Material Text / Syllabus Prose
            </label>
            <textarea
              rows={8}
              placeholder="Paste lecture notes, syllabus benchmarks, textbook excerpts, or approved reference solutions here. The ExplainGrade engine will automatically segment, index, and extract semantic vector anchors..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full p-2.5 rounded bg-surface-container-low border border-outline-variant/40 text-on-surface font-body-sm text-body-sm focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
        </div>

        <div className="p-space-md border-t border-outline-variant/30 bg-surface-container-low flex items-center justify-between">
          <span className="font-code-eval text-code-eval text-secondary text-[12px]">
            Embeddings & Chunking: Automatic 180-word windows with 30-word overlap
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
              onClick={handleUpload}
              disabled={isUploading}
              className="px-4 py-2 rounded bg-primary text-on-primary font-rubric-metric text-rubric-metric hover:bg-primary-container disabled:opacity-60 transition-all shadow-sm flex items-center gap-1.5"
              type="button"
            >
              {isUploading ? (
                <>
                  <span className="material-symbols-outlined text-[16px] animate-spin">refresh</span>
                  <span>Chunking & Indexing...</span>
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[16px]">task_alt</span>
                  <span>Index into RAG</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
