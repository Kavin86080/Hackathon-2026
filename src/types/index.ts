export type Role = 'faculty' | 'student';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  title?: string;
  department?: string;
  avatarUrl?: string;
  studentId?: string;
}

export interface RubricCriterion {
  id: string;
  order: number;
  name: string;
  description: string;
  weightPct: number;
  maxMarks: number;
  targetSemanticAnchors: string[];
  deductionRules?: string;
  scoringLadder?: {
    full: { marks: number; description: string };
    partial: { marks: number; description: string };
    zero: { marks: number; description: string };
  };
}

export interface Rubric {
  id: string;
  questionId: string;
  totalMarks: number;
  criteria: RubricCriterion[];
  isLocked: boolean;
  model: string;
  updatedAt: string;
}

export interface Question {
  id: string;
  courseCode: string;
  courseName: string;
  targetExam: string;
  qid: string;
  prompt: string;
  maxMarks: number;
  modality: string;
  semanticPrecision: string;
  knowledgeCorpus: string;
  expectedAnswer: string;
  keyConcepts: string[];
  learningObjectives?: string[];
  status: 'draft' | 'active' | 'archived';
  createdAt: string;
  rubric?: Rubric;
}

export interface CourseDocument {
  id: string;
  facultyId: string;
  title: string;
  subject: string;
  topic: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  content: string;
  uploadedAt: string;
  chunksCount: number;
}

export interface DocumentChunk {
  id: string;
  documentId: string;
  documentTitle: string;
  chunkIndex: number;
  content: string;
  embedding?: number[];
  keywords: string[];
}

export type SubmissionMethod = 'TYPED' | 'HANDWRITTEN_OCR' | 'COMBINED';

export interface HandwrittenPage {
  pageNumber: number;
  imageUrl: string;
  imageName: string;
  fileSize?: number;
  mimeType?: string;
  rawOcrText?: string;
  ocrConfidence?: number;
  hasUnclear?: boolean;
  unclearSpans?: string[];
}

export interface OcrExtractionResult {
  fullText: string;
  pages: {
    pageNumber: number;
    text: string;
    hasUnclear: boolean;
    unclearSpans: string[];
    confidence: number;
    notes?: string;
  }[];
  overallConfidence: number;
  hasUnclear: boolean;
  uncertaintyFlags: string[];
}

export interface TextComparisonResult {
  similarityScore: number;
  additions: string[];
  omissions: string[];
  wordingDifferences: {
    typedPhrase: string;
    ocrPhrase: string;
    explanation: string;
  }[];
  summary: string;
}

export interface StudentAnswer {
  id: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  studentUid: string;
  studentAvatar?: string;
  questionId: string;
  answerText: string;
  wordCount: number;
  status: 'NOT_STARTED' | 'DRAFT' | 'SUBMITTED' | 'EVALUATING' | 'EVALUATED' | 'FEEDBACK_AVAILABLE';
  submittedAt?: string;
  createdAt: string;
  updatedAt: string;
  submissionMethod?: SubmissionMethod;
  typedAnswerText?: string;
  rawOcrText?: string;
  correctedOcrText?: string;
  ocrStatus?: 'PENDING' | 'EXTRACTING' | 'EXTRACTED' | 'CONFIRMED' | 'UNCLEAR';
  ocrConfidence?: number;
  ocrUncertaintyFlags?: string[];
  hasOcrUnclear?: boolean;
  handwrittenPages?: HandwrittenPage[];
  comparisonResult?: TextComparisonResult;
  attachments?: {
    name: string;
    type: string;
    url: string;
  }[];
}

export interface CriterionEvaluationResult {
  criterionId: string;
  criterionName: string;
  criterionOrder: number;
  maxMarks: number;
  awardedMarks: number;
  status: 'FULL' | 'PARTIAL' | 'MISSING' | 'ERROR';
  semSim: number;
  evidence: string;
  rationale: string;
  missingConcepts: string[];
  conceptualErrors?: string[];
  facultyNotes?: string;
}

export interface Evaluation {
  id: string;
  answerId: string;
  questionId: string;
  studentId: string;
  aiRecommendedScore: number;
  facultyFinalScore: number;
  maxScore: number;
  confidencePct: number;
  lossDeviation: number;
  status: 'PENDING_REVIEW' | 'APPROVED' | 'MODIFIED';
  criteriaResults: CriterionEvaluationResult[];
  facultyNotes?: string;
  reviewedBy?: string;
  reviewedAt?: string;
  auditHash?: string;
  evaluatedAt: string;
}

export interface FeedbackData {
  id: string;
  evaluationId: string;
  answerId: string;
  studentId: string;
  finalScore: number;
  maxScore: number;
  letterGrade: string;
  cohortRank: string;
  pillars: {
    p1Mastered: {
      marks: number;
      strengths: { title: string; detail: string }[];
      rubricCoverage: string;
    };
    p2Deductions: {
      marksLost: number;
      rootCauses: { criterion: string; marks: number; explanation: string }[];
      criteriaPenalized: number;
    };
    p3Cognition: {
      alertCount: number;
      misconceptions: {
        title: string;
        detectedMisconception: string;
        remediationAnchor: string;
        severity: string;
      }[];
    };
    p4Exemplar: {
      benchmarkScore: number;
      criteriaSummary: string;
      diffScore: string;
      missingTokens: string;
    };
  };
  studentAnswerFormatted: {
    paragraphs: {
      text: string;
      highlight?: {
        text: string;
        type: 'full' | 'partial' | 'error';
        criterionOrder: number;
        criterionName: string;
        marksAwarded: number;
        maxMarks: number;
        semSim: number;
        diagnostic: string;
      };
    }[];
  };
  modelAnswer: string;
  whyLostMarks: {
    concept: string;
    deduction: number;
    studentAnswerSnippet: string;
    expectedConcept: string;
    why: string;
    howToImprove: string;
  }[];
  improvementSuggestions: string[];
  certifiedBy: string;
  certifiedDate: string;
  auditHash: string;
}

export interface FacultyAnalytics {
  totalAssessments: number;
  totalSubmissions: number;
  evaluatedCount: number;
  pendingReviewCount: number;
  averageCohortScore: number;
  commonMissingConcepts: { concept: string; percentage: number; count: number }[];
  cohortDistribution: { range: string; count: number }[];
  submissionTimeline: { date: string; submissions: number }[];
}

export interface StudentProgress {
  activeAssessmentsCount: number;
  completedEvaluationsCount: number;
  overallMasteryPct: number;
  feedbackActionItemsCount: number;
  conceptRadar: {
    labels: string[];
    scores: number[];
    criticalGapTopic: string;
    criticalGapScore: number;
  };
  topicMasteryList: {
    topic: string;
    percentage: number;
    status: 'Mastered' | 'Proficient' | 'Good' | 'Needs Review';
    note?: string;
  }[];
}
