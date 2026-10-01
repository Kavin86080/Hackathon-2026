import { db } from '../database/db.ts';
import { DocumentChunk, CourseDocument } from '@/src/types/index.ts';

export function chunkText(text: string, chunkSize = 180, overlap = 30): string[] {
  const words = text.split(/\s+/).filter(Boolean);
  const chunks: string[] = [];

  for (let i = 0; i < words.length; i += (chunkSize - overlap)) {
    const chunkWords = words.slice(i, i + chunkSize);
    if (chunkWords.length > 20) {
      chunks.push(chunkWords.join(' '));
    }
  }

  if (chunks.length === 0 && words.length > 0) {
    chunks.push(words.join(' '));
  }

  return chunks;
}

export function extractKeywords(text: string): string[] {
  const stopWords = new Set([
    'the', 'a', 'an', 'and', 'or', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'as',
    'is', 'are', 'was', 'were', 'it', 'its', 'this', 'that', 'from', 'into', 'which', 'be',
  ]);

  const tokens = text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, ' ')
    .split(/\s+/)
    .filter((t) => t.length > 3 && !stopWords.has(t));

  const freqMap: Record<string, number> = {};
  tokens.forEach((t) => {
    freqMap[t] = (freqMap[t] || 0) + 1;
  });

  return Object.entries(freqMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([w]) => w);
}

export function indexDocument(
  docId: string,
  docTitle: string,
  text: string
): DocumentChunk[] {
  const rawChunks = chunkText(text);
  return rawChunks.map((content, idx) => ({
    id: `chunk-${docId}-${idx + 1}`,
    documentId: docId,
    documentTitle: docTitle,
    chunkIndex: idx,
    content,
    keywords: extractKeywords(content),
  }));
}

export function retrieveRelevantChunks(query: string, topK = 4): { chunk: DocumentChunk; score: number }[] {
  const chunks = db.getChunks();
  if (!chunks.length) return [];

  const queryTerms = query
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 3);

  const scored = chunks.map((chunk) => {
    let score = 0;
    const contentLower = chunk.content.toLowerCase();
    const titleLower = chunk.documentTitle.toLowerCase();

    for (const term of queryTerms) {
      if (titleLower.includes(term)) score += 2.0;
      if (chunk.keywords.includes(term)) score += 2.5;

      const occurrences = (contentLower.match(new RegExp(`\\b${term}\\b`, 'g')) || []).length;
      score += Math.min(occurrences * 1.0, 5.0);
    }

    return { chunk, score };
  });

  return scored
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, topK);
}
