/**
 * PostuTrack Token Manager
 * Tracks real AI model token quotas, daily consumption, and remaining tokens
 * for Gemini 3.8 Flash (server-side), OpenAI, Anthropic, and custom models.
 */

const STORAGE_KEY = 'postutrack_token_usage';

export const MODEL_DEFAULT_QUOTAS = {
  gemini: {
    name: 'Gemini 3.8 Flash',
    provider: 'Google AI Studio',
    defaultLimit: 4000000, // 4M tokens/day free tier quota
    contextWindow: 1048576, // 1M context
    badgeColor: 'text-indigo-600 dark:text-indigo-400',
    borderColor: 'border-indigo-200 dark:border-indigo-800'
  },
  openai: {
    name: 'GPT-4o mini',
    provider: 'OpenAI',
    defaultLimit: 2000000, // 2M TPM / tier quota
    contextWindow: 128000,
    badgeColor: 'text-emerald-600 dark:text-emerald-400',
    borderColor: 'border-emerald-200 dark:border-emerald-800'
  },
  anthropic: {
    name: 'Claude 3 Haiku',
    provider: 'Anthropic',
    defaultLimit: 1000000,
    contextWindow: 200000,
    badgeColor: 'text-amber-600 dark:text-amber-400',
    borderColor: 'border-amber-200 dark:border-amber-800'
  },
  other: {
    name: 'Custom / Local',
    provider: 'Custom API',
    defaultLimit: 500000,
    contextWindow: 128000,
    badgeColor: 'text-purple-600 dark:text-purple-400',
    borderColor: 'border-purple-200 dark:border-purple-800'
  }
};

const getTodayString = () => new Date().toISOString().split('T')[0];

let cachedServerStats = null;
let isFetchingServerStats = false;

/**
 * Fetch real token stats directly from the backend server
 */
export async function fetchServerTokenStats() {
  if (isFetchingServerStats) return cachedServerStats;
  isFetchingServerStats = true;
  try {
    const res = await fetch('/api/ai/token-stats');
    if (res.ok) {
      const data = await res.json();
      if (data && data.success) {
        cachedServerStats = data;

        // Sync into localStorage for gemini
        const storageData = getTokenUsageData();
        storageData.gemini = {
          usedToday: data.usedToday || 0,
          lastUsed: data.lastUsed || 0,
          remainingTokens: data.remainingTokens ?? (data.dailyLimit - (data.usedToday || 0)),
          limitTokens: data.dailyLimit || 4000000,
          contextWindow: data.contextWindow || 1048576,
          requestsToday: data.requestsToday || 0,
          lastCallTimestamp: data.lastCallTimestamp || null,
          lastBreakdown: data.lastBreakdown || null,
          serverAvailable: data.serverAvailable,
          lastResetDate: getTodayString()
        };
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(storageData));
        } catch (e) {}

        window.dispatchEvent(new CustomEvent('postutrack_tokens_updated', {
          detail: { modelKey: 'gemini', stats: storageData.gemini }
        }));

        return data;
      }
    }
  } catch (err) {
    console.warn('Could not fetch server token stats:', err);
  } finally {
    isFetchingServerStats = false;
  }
  return cachedServerStats;
}

// Initial fetch when module loads in browser
if (typeof window !== 'undefined') {
  setTimeout(() => {
    fetchServerTokenStats();
  }, 100);
}

/**
 * Load all token usage data from storage
 */
export function getTokenUsageData() {
  const today = getTodayString();
  let data = {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) data = JSON.parse(raw);
  } catch (e) {
    data = {};
  }

  // Ensure each provider has valid initial state and daily reset
  let modified = false;
  for (const [modelKey, config] of Object.entries(MODEL_DEFAULT_QUOTAS)) {
    if (!data[modelKey] || data[modelKey].lastResetDate !== today) {
      data[modelKey] = {
        usedToday: 0,
        lastUsed: 0,
        remainingTokens: config.defaultLimit,
        limitTokens: config.defaultLimit,
        contextWindow: config.contextWindow,
        lastResetDate: today,
        requestsToday: 0,
        lastCallTimestamp: null,
        lastBreakdown: null,
        serverAvailable: modelKey === 'gemini'
      };
      modified = true;
    }
  }

  if (modified) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {}
  }

  return data;
}

/**
 * Get token stats for a specific model provider
 */
export function getModelTokenStats(modelKey = 'gemini') {
  const data = getTokenUsageData();
  const config = MODEL_DEFAULT_QUOTAS[modelKey] || MODEL_DEFAULT_QUOTAS.gemini;
  const stats = data[modelKey] || {
    usedToday: 0,
    lastUsed: 0,
    remainingTokens: config.defaultLimit,
    limitTokens: config.defaultLimit,
    contextWindow: config.contextWindow,
    requestsToday: 0,
    lastCallTimestamp: null,
    lastBreakdown: null,
    serverAvailable: modelKey === 'gemini'
  };

  const limit = stats.limitTokens || config.defaultLimit;
  const remaining = Math.max(0, Math.min(limit, stats.remainingTokens !== undefined ? stats.remainingTokens : (limit - stats.usedToday)));
  const percentage = limit > 0 ? Math.max(0, Math.min(100, Math.round((remaining / limit) * 100))) : 0;
  const contextWindow = stats.contextWindow || config.contextWindow;

  return {
    ...stats,
    modelKey,
    modelName: config.name,
    provider: config.provider,
    limitTokens: limit,
    remainingTokens: remaining,
    contextWindow,
    percentage,
    serverAvailable: modelKey === 'gemini' ? (cachedServerStats ? cachedServerStats.serverAvailable : true) : false
  };
}

/**
 * Record tokens consumed after an API request
 */
export function recordTokenUsage(modelKey, { promptTokens = 0, completionTokens = 0, thoughtsTokens = 0, totalTokens = null, remainingFromHeader = null, limitFromHeader = null }) {
  try {
    const data = getTokenUsageData();
    const config = MODEL_DEFAULT_QUOTAS[modelKey] || MODEL_DEFAULT_QUOTAS.gemini;
    const current = data[modelKey] || {
      usedToday: 0,
      lastUsed: 0,
      remainingTokens: config.defaultLimit,
      limitTokens: config.defaultLimit,
      contextWindow: config.contextWindow,
      requestsToday: 0,
      lastResetDate: getTodayString()
    };

    const consumed = totalTokens !== null ? totalTokens : (promptTokens + completionTokens + thoughtsTokens);
    const newUsedToday = current.usedToday + consumed;
    const effectiveLimit = limitFromHeader !== null && limitFromHeader > 0 ? limitFromHeader : (current.limitTokens || config.defaultLimit);
    
    let newRemaining;
    if (remainingFromHeader !== null && remainingFromHeader >= 0) {
      newRemaining = remainingFromHeader;
    } else {
      newRemaining = Math.max(0, effectiveLimit - newUsedToday);
    }

    data[modelKey] = {
      ...current,
      usedToday: newUsedToday,
      lastUsed: consumed,
      remainingTokens: newRemaining,
      limitTokens: effectiveLimit,
      requestsToday: (current.requestsToday || 0) + 1,
      lastResetDate: getTodayString(),
      lastCallTimestamp: new Date().toISOString(),
      lastBreakdown: {
        promptTokens,
        completionTokens,
        thoughtsTokens,
        totalTokens: consumed
      }
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    window.dispatchEvent(new CustomEvent('postutrack_tokens_updated', { detail: { modelKey, stats: data[modelKey] } }));

    // If external model, also notify backend
    if (modelKey !== 'gemini') {
      fetch('/api/tokens/record', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tokens: consumed, breakdown: data[modelKey].lastBreakdown })
      }).catch(() => {});
    }

    return data[modelKey];
  } catch (err) {
    console.error('Failed to record token usage:', err);
  }
}

/**
 * Reset token stats for a specific model (or all models)
 */
export async function resetTokenUsage(modelKey = null) {
  try {
    const data = getTokenUsageData();
    const today = getTodayString();

    if (modelKey && data[modelKey]) {
      const config = MODEL_DEFAULT_QUOTAS[modelKey] || MODEL_DEFAULT_QUOTAS.gemini;
      data[modelKey] = {
        usedToday: 0,
        lastUsed: 0,
        remainingTokens: config.defaultLimit,
        limitTokens: config.defaultLimit,
        contextWindow: config.contextWindow,
        requestsToday: 0,
        lastResetDate: today,
        lastCallTimestamp: null,
        lastBreakdown: null
      };
    } else {
      for (const [key, config] of Object.entries(MODEL_DEFAULT_QUOTAS)) {
        data[key] = {
          usedToday: 0,
          lastUsed: 0,
          remainingTokens: config.defaultLimit,
          limitTokens: config.defaultLimit,
          contextWindow: config.contextWindow,
          requestsToday: 0,
          lastResetDate: today,
          lastCallTimestamp: null,
          lastBreakdown: null
        };
      }
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    window.dispatchEvent(new CustomEvent('postutrack_tokens_updated', { detail: { modelKey } }));

    // Reset on server too
    if (!modelKey || modelKey === 'gemini') {
      await fetch('/api/ai/reset-tokens', { method: 'POST' }).catch(() => {});
      fetchServerTokenStats();
    }
  } catch (e) {}
}

/**
 * Real-time token counter via backend Gemini tokenizer API
 */
export async function countTokensLive(text, customApiKey = '') {
  if (!text || !text.trim()) return { totalTokens: 0, model: 'none' };
  try {
    const res = await fetch('/api/ai/count-tokens', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, customApiKey })
    });
    if (res.ok) {
      const data = await res.json();
      return data;
    }
  } catch (e) {
    console.warn('Live count tokens failed:', e);
  }
  // Heuristic approximation: ~4 characters per token for french/english
  return {
    totalTokens: Math.max(1, Math.ceil(text.length / 4)),
    model: 'approximate'
  };
}

/**
 * Helper to format large token numbers compactly (e.g. 4.0M, 985k, 1,250)
 */
export function formatCompactTokens(num) {
  if (num === null || num === undefined || isNaN(num)) return '0';
  const val = Number(num);
  if (val >= 1000000) {
    const formatted = (val / 1000000).toFixed(val >= 10000000 ? 1 : 2);
    return formatted.replace(/\.00$/, '').replace(/(\.[1-9])0$/, '$1') + 'M';
  }
  if (val >= 1000) {
    const formatted = (val / 1000).toFixed(val >= 100000 ? 0 : 1);
    return formatted.replace(/\.0$/, '') + 'k';
  }
  return val.toLocaleString();
}
