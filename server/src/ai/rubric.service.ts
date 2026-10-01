import { callGeminiJson, getGeminiClient } from './gemini.service.ts';
import { RubricCriterion, Question } from '@/src/types/index.ts';

export async function generateRubricWithAI(
  question: Partial<Question>,
  targetMaxMarks = 10.0
): Promise<RubricCriterion[]> {
  const promptText = `
You are an expert university computer science professor and educational assessment architect.
Design a rigorous, deterministic marking rubric for the following descriptive exam question:

COURSE: ${question.courseName || 'Computer Science'} (${question.courseCode || 'CS'})
QUESTION PROMPT: "${question.prompt}"
MAXIMUM MARKS: ${targetMaxMarks}
EXPECTED MODEL ANSWER: "${question.expectedAnswer || 'Standard curriculum coverage'}"
KEY CONCEPTS: ${(question.keyConcepts || []).join(', ')}

REQUIREMENTS:
1. Generate between 4 and 6 discrete criteria.
2. The sum of all criterion maxMarks MUST exactly equal ${targetMaxMarks}.
3. Each criterion must have:
   - name: clear academic title (e.g. "Convolutional Mechanics", "Non-Linear Activation")
   - description: 1-2 sentence specification of what constitutes mastery
   - maxMarks: number (e.g. 1.0, 2.0)
   - weightPct: percentage of total marks
   - targetSemanticAnchors: array of 3-5 specific technical terminology tokens expected
   - deductionRules: precise rule for when to deduct partial or full points
   - scoringLadder: { full: { marks, description }, partial: { marks, description }, zero: { marks, description } }

OUTPUT FORMAT:
Return a JSON array of criterion objects:
[
  {
    "name": "...",
    "description": "...",
    "maxMarks": 2.0,
    "weightPct": 20,
    "targetSemanticAnchors": ["...", "..."],
    "deductionRules": "...",
    "scoringLadder": {
      "full": { "marks": 2.0, "description": "..." },
      "partial": { "marks": 1.0, "description": "..." },
      "zero": { "marks": 0.0, "description": "..." }
    }
  }
]
`;

  if (getGeminiClient()) {
    try {
      const generated = await callGeminiJson<Omit<RubricCriterion, 'id' | 'order'>[]>(
        promptText,
        'You are an educational assessment rubric generation engine. Always return exact JSON array conforming to the prompt specification.'
      );

      if (Array.isArray(generated) && generated.length > 0) {
        // Enforce deterministic normalization so sum equals targetMaxMarks
        let sum = generated.reduce((acc, c) => acc + (Number(c.maxMarks) || 0), 0);
        if (sum <= 0) sum = targetMaxMarks;

        const normalized: RubricCriterion[] = generated.map((c, idx) => {
          const rawMarks = Number(c.maxMarks) || (targetMaxMarks / generated.length);
          const scaledMarks = Math.round((rawMarks / sum) * targetMaxMarks * 2) / 2; // snap to 0.5
          return {
            id: `crit-gen-${Date.now()}-${idx + 1}`,
            order: idx + 1,
            name: c.name || `Criterion ${idx + 1}`,
            description: c.description || 'Assessment of conceptual mastery',
            maxMarks: Math.max(0.5, scaledMarks),
            weightPct: Math.round(((Math.max(0.5, scaledMarks)) / targetMaxMarks) * 100),
            targetSemanticAnchors: Array.isArray(c.targetSemanticAnchors) ? c.targetSemanticAnchors : ['Core definition'],
            deductionRules: c.deductionRules || 'Deduct proportional points for omitted technical anchors.',
            scoringLadder: c.scoringLadder || {
              full: { marks: Math.max(0.5, scaledMarks), description: 'Complete technical articulation' },
              partial: { marks: Math.max(0.5, scaledMarks) / 2, description: 'Partial mention without full grounding' },
              zero: { marks: 0.0, description: 'Missing or erroneous concept' },
            },
          };
        });

        // Exact sum correction on last criterion
        const currentSum = normalized.reduce((acc, c) => acc + c.maxMarks, 0);
        const diff = targetMaxMarks - currentSum;
        if (Math.abs(diff) >= 0.25 && normalized.length > 0) {
          normalized[normalized.length - 1].maxMarks = Math.max(0.5, +(normalized[normalized.length - 1].maxMarks + diff).toFixed(1));
          normalized[normalized.length - 1].weightPct = Math.round((normalized[normalized.length - 1].maxMarks / targetMaxMarks) * 100);
        }

        return normalized;
      }
    } catch (e) {
      console.warn('Gemini rubric generation fallback engaged:', e);
    }
  }

  // Deterministic Fallback Rubric
  return [
    {
      id: `crit-fb-${Date.now()}-1`,
      order: 1,
      name: 'Definition & Core Axiom',
      description: 'Establishes fundamental operational premises and formal architectural definition.',
      maxMarks: 1.0,
      weightPct: 10,
      targetSemanticAnchors: ['Foundational concept', 'Primary domain applicability', 'Structural properties'],
      deductionRules: 'Award 0.5 for generic description lacking mathematical grounding.',
      scoringLadder: {
        full: { marks: 1.0, description: 'Complete definition with precise technical taxonomy' },
        partial: { marks: 0.5, description: 'High-level description without rigorous terminology' },
        zero: { marks: 0.0, description: 'Missing or fundamentally incorrect definition' },
      },
    },
    {
      id: `crit-fb-${Date.now()}-2`,
      order: 2,
      name: 'Primary Mechanics & Computation',
      description: 'Mathematical and procedural transformations involved in the core operational loop.',
      maxMarks: 2.0,
      weightPct: 20,
      targetSemanticAnchors: ['Operational transform', 'Input-output mapping', 'Parameterization'],
      deductionRules: 'Deduct 1.0 mark if candidate omits formal tensor/matrix calculation steps.',
      scoringLadder: {
        full: { marks: 2.0, description: 'Rigorous derivation of procedural mechanics' },
        partial: { marks: 1.0, description: 'Understands workflow but omits mathematical formulations' },
        zero: { marks: 0.0, description: 'No coherent calculation explained' },
      },
    },
    {
      id: `crit-fb-${Date.now()}-3`,
      order: 3,
      name: 'Representational Hierarchy & Non-Linearity',
      description: 'Progression of internal state representations and non-linear gating/activation functions.',
      maxMarks: 2.0,
      weightPct: 20,
      targetSemanticAnchors: ['Latent abstraction', 'Feature progression', 'Non-linear activation function'],
      deductionRules: 'Penalize -1.0 mark if candidate omits non-linear functions preventing linear collapse.',
      scoringLadder: {
        full: { marks: 2.0, description: 'Articulates multi-depth representations and non-linear activation' },
        partial: { marks: 1.0, description: 'Describes hierarchy but misses activation function rationale' },
        zero: { marks: 0.0, description: 'Omits internal representational concepts' },
      },
    },
    {
      id: `crit-fb-${Date.now()}-4`,
      order: 4,
      name: 'Subsampling & Invariance Mechanisms',
      description: 'Dimensionality reduction, computational simplification, and spatial/temporal invariance.',
      maxMarks: 2.0,
      weightPct: 20,
      targetSemanticAnchors: ['Downsampling', 'Dimension reduction', 'Invariance retention'],
      deductionRules: 'Deduct 1.0 mark if candidate confuses downsampling with parameter elimination.',
      scoringLadder: {
        full: { marks: 2.0, description: 'Thorough explanation of subsampling and invariance properties' },
        partial: { marks: 1.0, description: 'Mentions size reduction without explaining invariance mechanism' },
        zero: { marks: 0.0, description: 'Absent subsampling discussion' },
      },
    },
    {
      id: `crit-fb-${Date.now()}-5`,
      order: 5,
      name: 'Output Stage & Decision Projection',
      description: 'Aggregation of latent representations into final probability distributions or targets.',
      maxMarks: 2.0,
      weightPct: 20,
      targetSemanticAnchors: ['Dense mapping', 'Probability normalization', 'Loss target'],
      deductionRules: 'Deduct 1.0 mark if final projection normalization is missing.',
      scoringLadder: {
        full: { marks: 2.0, description: 'Clear mapping to normalized output probabilities' },
        partial: { marks: 1.0, description: 'Mentions decision layer without output normalization' },
        zero: { marks: 0.0, description: 'Missing output classification stage' },
      },
    },
    {
      id: `crit-fb-${Date.now()}-6`,
      order: 6,
      name: 'Contextual Engineering Applications',
      description: 'Real-world deployment scenarios and engineering trade-offs.',
      maxMarks: 1.0,
      weightPct: 10,
      targetSemanticAnchors: ['Industry applications', 'Domain deployment', 'Performance trade-offs'],
      deductionRules: 'Requires at least 2 distinct concrete industry use cases.',
      scoringLadder: {
        full: { marks: 1.0, description: 'Provides 2+ authentic real-world engineering citations' },
        partial: { marks: 0.5, description: 'Cites 1 vague or generic example' },
        zero: { marks: 0.0, description: 'No practical applications cited' },
      },
    },
  ];
}
