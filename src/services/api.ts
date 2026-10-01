import {
  User,
  Question,
  Rubric,
  RubricCriterion,
  CourseDocument,
  StudentAnswer,
  Evaluation,
  FeedbackData,
  FacultyAnalytics,
  StudentProgress,
  OcrExtractionResult,
  TextComparisonResult,
  SubmissionMethod,
  HandwrittenPage,
} from '../types/index.ts';

async function fetchJson<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  const data = await res.json();
  if (!res.ok || data.success === false) {
    throw new Error(data.error || `HTTP error ${res.status}`);
  }
  return data;
}

export const api = {
  // Auth
  async login(role: 'faculty' | 'student', email?: string): Promise<{ user: User; token: string }> {
    const res = await fetchJson<{ user: User; token: string }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ role, email }),
    });
    return res;
  },

  async getUsers(): Promise<User[]> {
    const res = await fetchJson<{ users: User[] }>('/api/auth/users');
    return res.users;
  },

  // Questions
  async getQuestions(): Promise<Question[]> {
    const res = await fetchJson<{ questions: Question[] }>('/api/questions');
    return res.questions;
  },

  async getQuestion(id: string): Promise<Question> {
    const res = await fetchJson<{ question: Question }>(`/api/questions/${id}`);
    return res.question;
  },

  async createQuestion(question: Partial<Question>): Promise<Question> {
    const res = await fetchJson<{ question: Question }>('/api/questions', {
      method: 'POST',
      body: JSON.stringify(question),
    });
    return res.question;
  },

  async updateQuestion(id: string, question: Partial<Question>): Promise<Question> {
    const res = await fetchJson<{ question: Question }>(`/api/questions/${id}`, {
      method: 'PUT',
      body: JSON.stringify(question),
    });
    return res.question;
  },

  // Rubrics
  async getRubric(questionId: string): Promise<Rubric> {
    const res = await fetchJson<{ rubric: Rubric }>(`/api/rubrics/question/${questionId}`);
    return res.rubric;
  },

  async saveRubric(questionId: string, criteria: RubricCriterion[], totalMarks: number): Promise<Rubric> {
    const res = await fetchJson<{ rubric: Rubric }>(`/api/rubrics/question/${questionId}`, {
      method: 'POST',
      body: JSON.stringify({ criteria, totalMarks, isLocked: true }),
    });
    return res.rubric;
  },

  async generateRubricWithAI(params: {
    questionPrompt: string;
    courseCode?: string;
    courseName?: string;
    maxMarks?: number;
    keyConcepts?: string[];
    expectedAnswer?: string;
  }): Promise<{ criteria: RubricCriterion[]; totalMarks: number; source: string }> {
    return fetchJson('/api/rubrics/generate', {
      method: 'POST',
      body: JSON.stringify(params),
    });
  },

  // Knowledge & RAG
  async getDocuments(): Promise<{ documents: CourseDocument[]; totalChunks: number }> {
    return fetchJson('/api/knowledge');
  },

  async uploadDocument(data: {
    title: string;
    subject: string;
    topic: string;
    fileName?: string;
    content: string;
  }): Promise<{ document: CourseDocument; chunksCreated: number }> {
    return fetchJson('/api/knowledge/upload', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async testRagQuery(query: string, topK = 4): Promise<{ results: any[]; count: number }> {
    return fetchJson('/api/knowledge/query', {
      method: 'POST',
      body: JSON.stringify({ query, topK }),
    });
  },

  // Student Answers
  async getAnswers(): Promise<StudentAnswer[]> {
    const res = await fetchJson<{ answers: StudentAnswer[] }>('/api/answers');
    return res.answers;
  },

  async getAnswer(id: string): Promise<StudentAnswer> {
    const res = await fetchJson<{ answer: StudentAnswer }>(`/api/answers/${id}`);
    return res.answer;
  },

  async getStudentAssessments(studentId: string): Promise<{ question: Question; answer: StudentAnswer | null; evaluation: Evaluation | null; status: string }[]> {
    const res = await fetchJson<{ assessments: any[] }>(`/api/answers/student/assessments?studentId=${studentId}`);
    return res.assessments;
  },

  async extractOcr(images: {
    dataUrl: string;
    name: string;
    pageNumber: number;
    mimeType?: string;
    fileSize?: number;
  }[]): Promise<OcrExtractionResult> {
    const res = await fetchJson<{ extraction: OcrExtractionResult }>('/api/answers/ocr', {
      method: 'POST',
      body: JSON.stringify({ images }),
    });
    return res.extraction;
  },

  async extractOcrPage(image: {
    dataUrl: string;
    name: string;
    pageNumber: number;
    mimeType?: string;
    fileSize?: number;
  }, totalCount?: number): Promise<{
    pageNumber: number;
    text: string;
    uncertain: boolean;
    unclearSections: string[];
    confidence: number;
    hasUnclear?: boolean;
    unclearSpans?: string[];
  }> {
    const res = await fetchJson<{ page: any }>('/api/answers/ocr/page', {
      method: 'POST',
      body: JSON.stringify({ image, totalCount }),
    });
    return res.page;
  },

  async resetDraftAnswer(questionId: string, studentId: string = 'usr-stu-1'): Promise<StudentAnswer> {
    const res = await fetchJson<{ answer: StudentAnswer }>('/api/answers/reset-draft', {
      method: 'POST',
      body: JSON.stringify({ questionId, studentId }),
    });
    return res.answer;
  },

  async compareAnswers(typedText: string, ocrText: string): Promise<TextComparisonResult> {
    const res = await fetchJson<{ comparison: TextComparisonResult }>('/api/answers/compare', {
      method: 'POST',
      body: JSON.stringify({ typedText, ocrText }),
    });
    return res.comparison;
  },

  async saveDraftAnswer(data: {
    id?: string;
    studentId?: string;
    questionId: string;
    answerText: string;
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
    attachments?: { name: string; type: string; url: string }[];
  }): Promise<StudentAnswer> {
    const endpoint = data.id ? `/api/answers/${data.id}/draft` : '/api/answers';
    const res = await fetchJson<{ answer: StudentAnswer }>(endpoint, {
      method: data.id ? 'PUT' : 'POST',
      body: JSON.stringify(data),
    });
    return res.answer;
  },

  async submitAnswer(
    answerId: string,
    data?: {
      answerText?: string;
      submissionMethod?: SubmissionMethod;
      correctedOcrText?: string;
      handwrittenPages?: HandwrittenPage[];
    }
  ): Promise<StudentAnswer> {
    const res = await fetchJson<{ answer: StudentAnswer }>(`/api/answers/${answerId}/submit`, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
    return res.answer;
  },

  // Evaluations
  async getEvaluation(answerId: string): Promise<Evaluation> {
    const res = await fetchJson<{ evaluation: Evaluation }>(`/api/evaluations/answer/${answerId}`);
    return res.evaluation;
  },

  async runEvaluation(answerId: string): Promise<{ evaluation: Evaluation; feedback: FeedbackData }> {
    return fetchJson(`/api/evaluations/${answerId}/run`, {
      method: 'POST',
    });
  },

  async reviewEvaluation(
    id: string,
    data: { facultyFinalScore: number; facultyNotes?: string; reviewerName?: string }
  ): Promise<Evaluation> {
    const res = await fetchJson<{ evaluation: Evaluation }>(`/api/evaluations/${id}/review`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return res.evaluation;
  },

  async simulateSandboxEvaluation(data: {
    candidateProse: string;
    questionId?: string;
    rubricCriteria?: RubricCriterion[];
  }): Promise<{ simulation: Evaluation; simulatedScore: number }> {
    return fetchJson('/api/evaluations/sandbox-simulate', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Feedback
  async getFeedback(answerId: string): Promise<FeedbackData> {
    const res = await fetchJson<{ feedback: FeedbackData }>(`/api/feedback/answer/${answerId}`);
    return res.feedback;
  },

  async evaluateRemediationProse(prose: string, baseScore = 7.5): Promise<{
    remediatedScore: number;
    checks: { relu: boolean; grid: boolean; formula: boolean };
    earnedMarks: number;
    statusBadge: string;
  }> {
    return fetchJson('/api/feedback/sandbox-eval', {
      method: 'POST',
      body: JSON.stringify({ prose, baseScore }),
    });
  },

  // Analytics
  async getFacultyAnalytics(): Promise<FacultyAnalytics> {
    const res = await fetchJson<{ analytics: FacultyAnalytics }>('/api/analytics/faculty');
    return res.analytics;
  },

  async getStudentProgress(studentId = 'usr-stu-1'): Promise<StudentProgress> {
    const res = await fetchJson<{ progress: StudentProgress }>(`/api/analytics/student?studentId=${studentId}`);
    return res.progress;
  },

  async resetDemo(): Promise<void> {
    await fetchJson('/api/demo/reset', { method: 'POST' });
  },
};
