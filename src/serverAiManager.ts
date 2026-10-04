import fs from 'fs';
import path from 'path';
import { GoogleGenAI, ThinkingLevel } from '@google/genai';

const USAGE_FILE = path.join(process.cwd(), '.token_usage.json');

const DEFAULT_DAILY_LIMIT = 4000000; // 4M tokens daily limit
const CONTEXT_WINDOW_LIMIT = 1048576; // 1M tokens

interface TokenUsageState {
  date: string;
  usedToday: number;
  remainingTokens: number;
  limitTokens: number;
  requestsToday: number;
  lastUsed: number;
  lastCallTimestamp: string | null;
  lastBreakdown: {
    promptTokens: number;
    completionTokens: number;
    thoughtsTokens: number;
    totalTokens: number;
  } | null;
}

function getTodayString(): string {
  return new Date().toISOString().split('T')[0];
}

function loadTokenState(): TokenUsageState {
  const today = getTodayString();
  try {
    if (fs.existsSync(USAGE_FILE)) {
      const data = JSON.parse(fs.readFileSync(USAGE_FILE, 'utf-8'));
      if (data && data.date === today) {
        return data;
      }
    }
  } catch (err) {
    console.warn('Could not read token usage file, resetting:', err);
  }

  const freshState: TokenUsageState = {
    date: today,
    usedToday: 0,
    remainingTokens: DEFAULT_DAILY_LIMIT,
    limitTokens: DEFAULT_DAILY_LIMIT,
    requestsToday: 0,
    lastUsed: 0,
    lastCallTimestamp: null,
    lastBreakdown: null,
  };
  saveTokenState(freshState);
  return freshState;
}

function saveTokenState(state: TokenUsageState): void {
  try {
    fs.writeFileSync(USAGE_FILE, JSON.stringify(state, null, 2), 'utf-8');
  } catch (err) {
    console.warn('Could not persist token state:', err);
  }
}

// In-memory state synchronized with file
let currentState: TokenUsageState = loadTokenState();

export function getAiClient(customApiKey?: string): GoogleGenAI | null {
  const key = (customApiKey && customApiKey.trim()) || process.env.GEMINI_API_KEY;
  if (!key) return null;

  return new GoogleGenAI({
    apiKey: key,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

export function isGeminiAvailable(customApiKey?: string): boolean {
  const key = (customApiKey && customApiKey.trim()) || process.env.GEMINI_API_KEY;
  return Boolean(key && key.trim().length > 10);
}

export function getTokenStats() {
  const today = getTodayString();
  if (currentState.date !== today) {
    currentState = loadTokenState();
  }

  const remaining = Math.max(0, currentState.limitTokens - currentState.usedToday);
  const percentage = Math.max(0, Math.min(100, Math.round((remaining / currentState.limitTokens) * 100)));

  return {
    serverAvailable: isGeminiAvailable(),
    provider: 'gemini',
    model: 'gemini-3.8-flash',
    displayName: 'Gemini 3.8 Flash',
    contextWindow: CONTEXT_WINDOW_LIMIT,
    dailyLimit: currentState.limitTokens,
    usedToday: currentState.usedToday,
    remainingTokens: remaining,
    remainingContext: CONTEXT_WINDOW_LIMIT,
    percentage,
    requestsToday: currentState.requestsToday,
    lastUsed: currentState.lastUsed,
    lastBreakdown: currentState.lastBreakdown,
    lastCallTimestamp: currentState.lastCallTimestamp,
    tier: 'standard',
    status: isGeminiAvailable() ? 'connected' : 'no_key',
  };
}

export function recordTokensConsumed(consumedTokens: number, breakdown?: { promptTokens?: number; completionTokens?: number; thoughtsTokens?: number; totalTokens?: number }) {
  const today = getTodayString();
  if (currentState.date !== today) {
    currentState = loadTokenState();
  }

  const validConsumed = Math.max(0, Number(consumedTokens) || 0);
  currentState.usedToday += validConsumed;
  currentState.lastUsed = validConsumed;
  currentState.remainingTokens = Math.max(0, currentState.limitTokens - currentState.usedToday);
  currentState.requestsToday += 1;
  currentState.lastCallTimestamp = new Date().toISOString();
  if (breakdown) {
    currentState.lastBreakdown = {
      promptTokens: breakdown.promptTokens || 0,
      completionTokens: breakdown.completionTokens || 0,
      thoughtsTokens: breakdown.thoughtsTokens || 0,
      totalTokens: breakdown.totalTokens || validConsumed,
    };
  }

  saveTokenState(currentState);
  return getTokenStats();
}

export function resetServerTokenStats() {
  const today = getTodayString();
  currentState = {
    date: today,
    usedToday: 0,
    remainingTokens: DEFAULT_DAILY_LIMIT,
    limitTokens: DEFAULT_DAILY_LIMIT,
    requestsToday: 0,
    lastUsed: 0,
    lastCallTimestamp: null,
    lastBreakdown: null,
  };
  saveTokenState(currentState);
  return getTokenStats();
}

/**
 * Counts actual tokens for any text content using Gemini's native countTokens API
 */
export async function countContentTokens(text: string, customApiKey?: string): Promise<{ totalTokens: number; model: string }> {
  const ai = getAiClient(customApiKey);
  if (!ai) {
    // Heuristic fallback if no API key is available
    const approx = Math.max(1, Math.ceil((text || '').length / 4));
    return { totalTokens: approx, model: 'local-heuristic' };
  }

  const cleanText = (text || '').trim();
  if (!cleanText) {
    return { totalTokens: 0, model: 'gemini-3.8-flash' };
  }

  // Try primary model gemini-3.8-flash, fallback to gemini-3.1-flash-lite
  try {
    const res = await ai.models.countTokens({
      model: 'gemini-3.8-flash',
      contents: cleanText,
    });
    return { totalTokens: res.totalTokens || 0, model: 'gemini-3.8-flash' };
  } catch (err: any) {
    try {
      const res = await ai.models.countTokens({
        model: 'gemini-3.1-flash-lite',
        contents: cleanText,
      });
      return { totalTokens: res.totalTokens || 0, model: 'gemini-3.1-flash-lite' };
    } catch (e2) {
      console.warn('Gemini countTokens error, using heuristic:', err?.message || err);
      const approx = Math.max(1, Math.ceil(cleanText.length / 4));
      return { totalTokens: approx, model: 'heuristic-fallback' };
    }
  }
}

/**
 * Executes server-side generation with Gemini and extracts full token usage
 */
export async function generateWithGemini(params: {
  prompt: string;
  responseSchema?: any;
  systemInstruction?: string;
  temperature?: number;
  model?: string;
  customApiKey?: string;
}) {
  const { prompt, responseSchema, systemInstruction, temperature = 0.1, customApiKey } = params;
  const ai = getAiClient(customApiKey);
  if (!ai) {
    throw new Error('Aucune clé Gemini API disponible sur le serveur.');
  }

  const modelsToTry = [params.model || 'gemini-3.8-flash', 'gemini-3.1-flash-lite'];
  let lastError: any = null;

  for (const model of modelsToTry) {
    try {
      const config: any = {
        temperature,
        thinkingConfig: {
          thinkingLevel: ThinkingLevel.LOW,
        },
      };

      if (systemInstruction) {
        config.systemInstruction = systemInstruction;
      }

      if (responseSchema) {
        config.responseMimeType = 'application/json';
        config.responseSchema = responseSchema;
      }

      const response = await ai.models.generateContent({
        model,
        contents: prompt,
        config,
      });

      const text = response.text || '';
      const usage = response.usageMetadata || {};

      const promptTokens = usage.promptTokenCount || 0;
      const candidatesTokens = usage.candidatesTokenCount || 0;
      const thoughtsTokens = (usage as any).thoughtsTokenCount || 0;
      const totalTokens = usage.totalTokenCount || (promptTokens + candidatesTokens + thoughtsTokens);

      const updatedStats = recordTokensConsumed(totalTokens, {
        promptTokens,
        completionTokens: candidatesTokens,
        thoughtsTokens,
        totalTokens,
      });

      return {
        success: true,
        text,
        model,
        usage: {
          promptTokens,
          completionTokens: candidatesTokens,
          thoughtsTokens,
          totalTokens,
          serviceTier: (usage as any).serviceTier || 'standard',
        },
        tokensLeft: updatedStats.remainingTokens,
        stats: updatedStats,
      };
    } catch (err: any) {
      console.warn(`Gemini generation failed on ${model}:`, err?.message || err);
      lastError = err;
      // If 503 or model error, loop to next fallback model
    }
  }

  throw lastError || new Error('Erreur de génération Gemini.');
}
