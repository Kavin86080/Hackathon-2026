import React, { useState, useEffect } from 'react';
import { api } from '../services/api.ts';
import { CourseDocument } from '../types/index.ts';

interface KnowledgeBaseProps {
  onOpenUpload: () => void;
}

export const KnowledgeBase: React.FC<KnowledgeBaseProps> = ({ onOpenUpload }) => {
  const [documents, setDocuments] = useState<CourseDocument[]>([]);
  const [totalChunks, setTotalChunks] = useState(0);
  const [searchQuery, setSearchQuery] = useState('Max Pooling downsampling translation invariance');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState<CourseDocument | null>(null);

  useEffect(() => {
    loadKnowledge();
  }, []);

  const loadKnowledge = async () => {
    try {
      const res = await api.getDocuments();
      setDocuments(res.documents);
      setTotalChunks(res.totalChunks);
      if (res.documents.length > 0) setSelectedDoc(res.documents[0]);
    } catch (e) {
      console.error(e);
    }
  };

  const handleTestSearch = async () => {
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    try {
      const res = await api.testRagQuery(searchQuery, 4);
      setSearchResults(res.results);
    } catch (e) {
      console.error(e);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="flex flex-col w-full space-y-space-xl pb-16">
      {/* Header */}
      <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-space-lg">
        <div>
          <div className="inline-flex items-center gap-space-xs px-space-sm py-0.5 rounded bg-surface-container text-primary font-label-md text-label-md text-[11px] font-semibold mb-1">
            <span className="material-symbols-outlined text-[15px]">menu_book</span>
            <span>RAG Grounding & Reference Store</span>
          </div>
          <h1 className="font-headline-xl text-headline-xl text-on-surface tracking-tight font-bold text-[30px]">
            Institutional Knowledge Base
          </h1>
          <p className="font-body-md text-body-md text-secondary max-w-3xl text-[14px]">
            Faculty-approved reference material, lecture notes, and model answers used to ground Gemini Flash evaluations and prevent hallucinations.
          </p>
        </div>

        <button
          onClick={onOpenUpload}
          className="inline-flex items-center gap-1.5 px-space-lg py-2 rounded bg-primary text-on-primary hover:bg-primary-container shadow-sm transition-all font-rubric-metric text-rubric-metric font-semibold text-[13px]"
          type="button"
        >
          <span className="material-symbols-outlined text-[18px]">cloud_upload</span>
          <span>Upload New Reference Material</span>
        </button>
      </div>

      {/* RAG Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-space-md">
        <div className="p-space-lg rounded-xl bg-surface-container-lowest shadow-sm border border-outline-variant/30 flex items-center justify-between">
          <div>
            <span className="font-label-md text-secondary uppercase tracking-wider text-[11px] font-semibold block">
              Indexed Documents
            </span>
            <span className="font-display-lg font-bold text-on-surface text-[32px]">{documents.length}</span>
          </div>
          <div className="w-10 h-10 rounded-lg bg-surface-container-low flex items-center justify-center text-primary">
            <span className="material-symbols-outlined text-[22px]">description</span>
          </div>
        </div>

        <div className="p-space-lg rounded-xl bg-surface-container-lowest shadow-sm border border-outline-variant/30 flex items-center justify-between">
          <div>
            <span className="font-label-md text-secondary uppercase tracking-wider text-[11px] font-semibold block">
              Vector Chunks
            </span>
            <span className="font-display-lg font-bold text-tertiary text-[32px]">{totalChunks}</span>
          </div>
          <div className="w-10 h-10 rounded-lg bg-surface-container-low flex items-center justify-center text-tertiary">
            <span className="material-symbols-outlined text-[22px]">database</span>
          </div>
        </div>

        <div className="p-space-lg rounded-xl bg-surface-container-lowest shadow-sm border border-outline-variant/30 flex items-center justify-between">
          <div>
            <span className="font-label-md text-secondary uppercase tracking-wider text-[11px] font-semibold block">
              Retrieval Model
            </span>
            <span className="font-headline-md font-bold text-primary text-[18px]">Gemini Embeddings</span>
            <div className="text-[11px] text-secondary mt-0.5">Cosine cutoff: 0.84</div>
          </div>
          <div className="w-10 h-10 rounded-lg bg-surface-container-low flex items-center justify-center text-primary">
            <span className="material-symbols-outlined text-[22px]">hub</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Documents List & Content Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg">
        {/* Left Column: Documents list */}
        <div className="lg:col-span-5 space-y-space-md">
          <div className="flex items-center justify-between">
            <h2 className="font-headline-md font-bold text-on-surface text-[17px]">Approved Course Documents</h2>
            <span className="font-code-eval text-secondary text-[11px]">{documents.length} Files</span>
          </div>

          <div className="space-y-3">
            {documents.map((doc) => (
              <div
                key={doc.id}
                onClick={() => setSelectedDoc(doc)}
                className={`p-space-md rounded-xl cursor-pointer transition-all border ${
                  selectedDoc?.id === doc.id
                    ? 'bg-surface-container-low border-primary shadow-sm'
                    : 'bg-surface-container-lowest border-outline-variant/30 hover:border-outline'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="material-symbols-outlined text-primary text-[22px]">picture_as_pdf</span>
                    <div>
                      <h3 className="font-rubric-metric font-semibold text-on-surface text-[14px]">
                        {doc.title}
                      </h3>
                      <div className="font-code-eval text-secondary text-[11px]">
                        {doc.fileName} · {(doc.fileSize / 1024).toFixed(1)} KB
                      </div>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-surface-container text-tertiary font-code-eval text-[11px] font-semibold">
                    {doc.chunksCount} chunks
                  </span>
                </div>
                <div className="mt-2 pt-2 border-t border-outline-variant/20 flex items-center justify-between text-secondary text-[11px]">
                  <span>{doc.subject} · {doc.topic}</span>
                  <span>{new Date(doc.uploadedAt).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Interactive RAG Inspector & Search Tester */}
        <div className="lg:col-span-7 space-y-space-md">
          {/* Real-Time Retrieval Playground */}
          <div className="p-space-lg rounded-2xl bg-surface-container-lowest shadow-sm border border-outline-variant/30 space-y-3">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-[20px]">manage_search</span>
              <h3 className="font-headline-md font-bold text-on-surface text-[16px]">
                RAG Semantic Search Simulator
              </h3>
            </div>
            <p className="font-body-sm text-secondary text-[12px]">
              Type a student prose snippet or exam concept to verify which course textbook chunks will be retrieved by Gemini Flash.
            </p>
            <div className="flex gap-2">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Enter query terms (e.g. ReLU non-linearity, Max Pooling downsampling)..."
                className="flex-1 p-2.5 rounded-lg bg-surface-container-low border border-outline-variant/40 text-on-surface font-body-sm text-body-sm focus:outline-none focus:ring-1 focus:ring-primary"
              />
              <button
                onClick={handleTestSearch}
                disabled={isSearching}
                className="px-4 py-2.5 rounded-lg bg-primary text-on-primary font-rubric-metric text-[13px] font-semibold hover:bg-primary-container transition-all flex items-center gap-1.5"
                type="button"
              >
                <span className="material-symbols-outlined text-[16px]">search</span>
                <span>{isSearching ? 'Querying...' : 'Test Retrieval'}</span>
              </button>
            </div>

            {/* Results Preview */}
            {searchResults.length > 0 && (
              <div className="space-y-2 pt-2">
                <span className="font-label-md text-secondary uppercase font-semibold text-[11px] block">
                  Top Grounded Chunks ({searchResults.length} matched):
                </span>
                {searchResults.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-lg bg-surface-container-low border-l-4 border-primary text-[12px] space-y-1"
                  >
                    <div className="flex items-center justify-between text-secondary">
                      <span className="font-semibold text-on-surface">{item.chunk.documentTitle}</span>
                      <span className="font-code-eval text-primary font-bold">Score: {item.score.toFixed(1)}</span>
                    </div>
                    <p className="text-on-surface-variant font-body-sm italic">
                      "{item.chunk.content}"
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Selected Document Full View */}
          {selectedDoc && (
            <div className="p-space-lg rounded-2xl bg-surface-container-lowest shadow-sm border border-outline-variant/30 space-y-3">
              <div className="flex items-center justify-between border-b border-outline-variant/20 pb-2">
                <div>
                  <h3 className="font-headline-md font-bold text-on-surface text-[16px]">{selectedDoc.title}</h3>
                  <span className="font-code-eval text-secondary text-[11px]">
                    Extracted text from {selectedDoc.fileName}
                  </span>
                </div>
                <span className="px-2 py-0.5 rounded bg-tertiary-container/10 text-tertiary font-code-eval text-[11px] font-bold">
                  Verified In Syllabus
                </span>
              </div>
              <div className="max-h-80 overflow-y-auto p-3 rounded-lg bg-surface-container-low font-body-sm text-[13px] text-on-surface leading-relaxed whitespace-pre-wrap border border-outline-variant/20">
                {selectedDoc.content}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
