import { GoogleGenAI } from '@google/genai';

let aiInstance: GoogleGenAI | null = null;

export function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    return null;
  }

  if (!aiInstance) {
    aiInstance = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }

  return aiInstance;
}

const FALLBACK_MODELS = ['gemini-3.8-flash', 'gemini-3.1-flash-lite'];

export async function callGeminiText(prompt: string, systemInstruction?: string): Promise<string> {
  const ai = getGeminiClient();
  if (!ai) {
    throw new Error('GEMINI_API_KEY not configured in environment.');
  }

  let lastErr: any = null;
  for (const model of FALLBACK_MODELS) {
    try {
      const response = await ai.models.generateContent({
        model,
        contents: prompt,
        config: systemInstruction
          ? {
              systemInstruction,
            }
          : undefined,
      });
      return response.text || '';
    } catch (err: any) {
      lastErr = err;
      console.warn(`Model ${model} unavailable in callGeminiText, trying next:`, err.message);
    }
  }

  throw lastErr || new Error('Gemini API call failed across available models.');
}

export async function callGeminiJson<T>(
  prompt: string,
  systemInstruction?: string
): Promise<T> {
  const ai = getGeminiClient();
  if (!ai) {
    throw new Error('GEMINI_API_KEY not configured in environment.');
  }

  let lastErr: any = null;
  for (const model of FALLBACK_MODELS) {
    try {
      const response = await ai.models.generateContent({
        model,
        contents: prompt,
        config: {
          systemInstruction:
            (systemInstruction ? systemInstruction + '\n' : '') +
            'Respond ONLY with valid, raw JSON. Do not wrap in markdown ```json blocks or add commentary.',
          responseMimeType: 'application/json',
        },
      });

      const text = (response.text || '').trim();
      const cleaned = text.replace(/^```json\s*/i, '').replace(/```$/i, '').trim();
      return JSON.parse(cleaned) as T;
    } catch (err: any) {
      lastErr = err;
      console.warn(`Model ${model} unavailable in callGeminiJson, trying next:`, err.message);
    }
  }

  throw lastErr || new Error('Gemini JSON call failed across available models.');
}
