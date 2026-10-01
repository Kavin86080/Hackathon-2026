import { Router } from 'express';
import { db } from '../database/db.ts';
import { indexDocument, retrieveRelevantChunks } from '../ai/rag.service.ts';
import { CourseDocument } from '@/src/types/index.ts';

export const knowledgeRouter = Router();

// GET all course documents
knowledgeRouter.get('/', (req, res) => {
  const documents = db.getDocuments();
  const chunks = db.getChunks();
  res.json({
    success: true,
    documents,
    totalChunks: chunks.length,
  });
});

// UPLOAD / INDEX course document
knowledgeRouter.post('/upload', (req, res) => {
  const { title, subject, topic, fileName, fileType, content } = req.body;

  if (!title || !content) {
    return res.status(400).json({ success: false, error: 'Document title and content are required' });
  }

  const docId = `doc-${Date.now()}`;
  const chunks = indexDocument(docId, title, content);

  const newDoc: CourseDocument = {
    id: docId,
    facultyId: 'usr-fac-1',
    title,
    subject: subject || 'Computer Science',
    topic: topic || 'Course Reference Material',
    fileName: fileName || `${title.toLowerCase().replace(/\s+/g, '_')}.txt`,
    fileType: fileType || 'text/plain',
    fileSize: Buffer.byteLength(content, 'utf8'),
    content,
    uploadedAt: new Date().toISOString(),
    chunksCount: chunks.length,
  };

  db.saveDocument(newDoc, chunks);

  res.status(201).json({
    success: true,
    document: newDoc,
    chunksCreated: chunks.length,
  });
});

// TEST RAG RETRIEVAL
knowledgeRouter.post('/query', (req, res) => {
  const { query, topK } = req.body;
  if (!query) {
    return res.status(400).json({ success: false, error: 'Query is required' });
  }

  const results = retrieveRelevantChunks(query, Number(topK) || 4);
  res.json({ success: true, results, count: results.length });
});

// DELETE document
knowledgeRouter.delete('/:id', (req, res) => {
  const success = db.deleteDocument(req.params.id);
  res.json({ success });
});
