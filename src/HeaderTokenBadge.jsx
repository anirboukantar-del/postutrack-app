import React, { useState, useEffect, useRef } from 'react';
import {
  Zap,
  Cpu,
  Sparkles,
  Info,
  Settings,
  RotateCcw,
  ExternalLink,
  ChevronDown,
  ShieldAlert,
  CheckCircle2,
  Activity,
  Calculator,
  Loader2
} from 'lucide-react';
import {
  getModelTokenStats,
  formatCompactTokens,
  resetTokenUsage,
  fetchServerTokenStats,
  countTokensLive,
  MODEL_DEFAULT_QUOTAS
} from './tokenManager';

export default function HeaderTokenBadge({
  selectedAiModel = 'gemini',
  hasApiKey = false,
  onOpenSettings,
  lang = 'fr',
  t = {}
}) {
  const [stats, setStats] = useState(() => getModelTokenStats(selectedAiModel));
  const [isOpen, setIsOpen] = useState(false);
  const [testText, setTestText] = useState('');
  const [testLoading, setTestLoading] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const containerRef = useRef(null);

  const isEn = lang === 'en';

  // For Gemini, server-side API key is pre-configured and active!
  const isModelActive = selectedAiModel === 'gemini' 
    ? (stats.serverAvailable !== false)
    : hasApiKey;

  // Refresh stats when model changes or token event occurs
  useEffect(() => {
    fetchServerTokenStats().then(() => {
      setStats(getModelTokenStats(selectedAiModel));
    });

    const handleUpdate = () => {
      setStats(getModelTokenStats(selectedAiModel));
    };

    window.addEventListener('postutrack_tokens_updated', handleUpdate);
    window.addEventListener('storage', handleUpdate);
    return () => {
      window.removeEventListener('postutrack_tokens_updated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, [selectedAiModel]);

  // Handle outside click to close dropdown
  useEffect(() => {
    function handleClickOutside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const percentage = stats.percentage ?? 100;
  
  // Status colors based on remaining percentage & activity
  let statusColor = 'text-emerald-600 dark:text-emerald-400';
  let badgeBg = 'bg-emerald-50 hover:bg-emerald-100/70 dark:bg-emerald-950/40 dark:hover:bg-emerald-900/50 border-emerald-200 dark:border-emerald-800/60';
  let progressColor = 'bg-emerald-500';

  if (!isModelActive) {
    statusColor = 'text-amber-600 dark:text-amber-400';
    badgeBg = 'bg-amber-50 hover:bg-amber-100/70 dark:bg-amber-950/40 dark:hover:bg-amber-900/50 border-amber-200 dark:border-amber-800/60';
    progressColor = 'bg-amber-500';
  } else if (percentage < 20) {
    statusColor = 'text-rose-600 dark:text-rose-400';
    badgeBg = 'bg-rose-50 hover:bg-rose-100/70 dark:bg-rose-950/40 dark:hover:bg-rose-900/50 border-rose-200 dark:border-rose-800/60';
    progressColor = 'bg-rose-500';
  } else if (percentage < 50) {
    statusColor = 'text-amber-600 dark:text-amber-400';
    badgeBg = 'bg-amber-50 hover:bg-amber-100/70 dark:bg-amber-950/40 dark:hover:bg-amber-900/50 border-amber-200 dark:border-amber-800/60';
    progressColor = 'bg-amber-500';
  }

  const modelConfig = MODEL_DEFAULT_QUOTAS[selectedAiModel] || MODEL_DEFAULT_QUOTAS.gemini;

  // Handle live token count test
  const handleRunLiveTokenTest = async () => {
    setTestLoading(true);
    setTestResult(null);
    try {
      const sample = testText.trim() || 'PostuTrack: Optimisation de CV et lettre de motivation via intelligence artificielle pour le recrutement.';
      const res = await countTokensLive(sample);
      setTestResult({
        tokens: res.totalTokens,
        model: res.model,
        sampleLength: sample.length
      });
    } catch (e) {
      console.warn('Test token error:', e);
    } finally {
      setTestLoading(false);
    }
  };

  return (
    <div className="relative shrink-0" ref={containerRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1 sm:py-1.5 2xl:py-2 text-xs 2xl:text-sm font-semibold rounded-md border shadow-2xs transition-all cursor-pointer select-none ${badgeBg} hover:opacity-95 active:scale-98`}
        title={
          isModelActive
            ? `${formatCompactTokens(stats.remainingTokens)} ${isEn ? 'tokens left' : 'tokens restants'} (${percentage}% - ${modelConfig.name})`
            : (isEn ? 'No API key configured - Click to setup' : 'Aucune clé configurée - Cliquer pour configurer')
        }
        aria-label="Token usage counter"
      >
        <Zap size={14} className={`${statusColor} shrink-0 fill-current opacity-90 animate-pulse`} />
        
        <div className="flex items-center gap-1">
          <span className="font-mono font-bold tracking-tight text-gray-800 dark:text-zinc-100 text-[11px] sm:text-xs 2xl:text-sm">
            {isModelActive ? formatCompactTokens(stats.remainingTokens) : (isEn ? 'No Key' : '0 clé')}
          </span>
          <span className="text-[10px] text-gray-500 dark:text-zinc-400 hidden sm:inline">
            {isEn ? 'tokens' : 'tokens'}
          </span>
        </div>

        <ChevronDown size={12} className={`text-gray-400 dark:text-zinc-500 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown Popover */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-88 p-4 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-150">
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-zinc-800">
            <div className="flex items-center gap-2">
              <Cpu size={16} className={statusColor} />
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-gray-900 dark:text-white leading-tight flex items-center gap-1.5">
                  {modelConfig.name}
                  {selectedAiModel === 'gemini' && (
                    <span className="inline-flex items-center px-1.5 py-0.2 text-[9px] font-medium bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 rounded">
                      Serveur
                    </span>
                  )}
                </h4>
                <p className="text-[10px] text-gray-500 dark:text-zinc-400">
                  {modelConfig.provider}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border ${badgeBg} ${statusColor}`}>
                <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse"></span>
                {isModelActive ? `${percentage}% ${isEn ? 'left' : 'dispo'}` : (isEn ? 'Inactive' : 'Inactif')}
              </span>
            </div>
          </div>

          {/* Token Balance & Progress */}
          <div className="py-3 space-y-2">
            <div className="flex justify-between items-baseline">
              <span className="text-xs text-gray-600 dark:text-zinc-400 font-medium">
                {isEn ? 'Remaining Quota' : 'Quota Restant'}
              </span>
              <span className="font-mono text-sm sm:text-base font-extrabold text-gray-900 dark:text-white">
                {isModelActive ? Number(stats.remainingTokens).toLocaleString() : '0'}
                <span className="text-xs font-normal text-gray-400 dark:text-zinc-500 ml-1">tokens</span>
              </span>
            </div>

            {/* Visual Progress Bar */}
            <div className="w-full h-2 bg-gray-100 dark:bg-zinc-800 rounded-full overflow-hidden">
              <div 
                className={`h-full transition-all duration-300 ${progressColor}`}
                style={{ width: `${isModelActive ? percentage : 0}%` }}
              />
            </div>
            <div className="flex justify-between text-[10px] text-gray-400 dark:text-zinc-500 font-mono">
              <span>{isEn ? 'Quota: ' : 'Plafond: '}{formatCompactTokens(stats.limitTokens)}</span>
              <span>{isEn ? 'Used: ' : 'Consommé: '}{formatCompactTokens(stats.usedToday)}</span>
            </div>
          </div>

          {/* Detailed Statistics */}
          <div className="grid grid-cols-2 gap-2 py-2 text-xs border-t border-b border-gray-100 dark:border-zinc-800 bg-gray-50/60 dark:bg-zinc-950/40 rounded-lg p-2.5 my-1">
            <div>
              <span className="text-[10px] text-gray-500 dark:text-zinc-400 block">
                {isEn ? 'Used Today' : 'Consommé aujourd\'hui'}
              </span>
              <span className="font-mono font-semibold text-gray-800 dark:text-zinc-200 text-xs">
                {Number(stats.usedToday || 0).toLocaleString()}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-gray-500 dark:text-zinc-400 block">
                {isEn ? 'Last Call' : 'Dernier appel'}
              </span>
              <span className="font-mono font-semibold text-gray-800 dark:text-zinc-200 text-xs">
                {stats.lastUsed ? `+${Number(stats.lastUsed).toLocaleString()}` : (isEn ? 'None yet' : 'Aucun')}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-gray-500 dark:text-zinc-400 block">
                {isEn ? 'Requests Today' : 'Requêtes du jour'}
              </span>
              <span className="font-mono font-semibold text-gray-800 dark:text-zinc-200 text-xs">
                {stats.requestsToday || 0}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-gray-500 dark:text-zinc-400 block">
                {isEn ? 'Context Window' : 'Fenêtre Contexte'}
              </span>
              <span className="font-mono font-semibold text-gray-800 dark:text-zinc-200 text-xs">
                {formatCompactTokens(stats.contextWindow || modelConfig.contextWindow)}
              </span>
            </div>
          </div>

          {/* Breakdown of Last Request (if available) */}
          {stats.lastBreakdown && (
            <div className="my-2 p-2 bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/50 rounded-lg text-[10px] space-y-1">
              <div className="font-semibold text-indigo-900 dark:text-indigo-200 flex items-center justify-between">
                <span>{isEn ? 'Last Request Breakdown' : 'Détail du dernier appel'}</span>
                <span className="font-mono text-indigo-700 dark:text-indigo-300">
                  {Number(stats.lastBreakdown.totalTokens).toLocaleString()} tok
                </span>
              </div>
              <div className="grid grid-cols-3 gap-1 text-gray-600 dark:text-zinc-400 font-mono">
                <div>In: {stats.lastBreakdown.promptTokens}</div>
                <div>Out: {stats.lastBreakdown.completionTokens}</div>
                <div>Pensée: {stats.lastBreakdown.thoughtsTokens || 0}</div>
              </div>
            </div>
          )}

          {/* Real Tokenizer Live Test */}
          <div className="my-2 p-2.5 bg-gray-50 dark:bg-zinc-950/60 border border-gray-200 dark:border-zinc-800 rounded-lg">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-semibold text-gray-800 dark:text-zinc-200 flex items-center gap-1.5">
                <Calculator size={13} className="text-blue-500" />
                {isEn ? 'Live Tokenizer Test' : 'Testeur de tokens en direct'}
              </span>
              <button
                type="button"
                onClick={handleRunLiveTokenTest}
                disabled={testLoading}
                className="text-[10px] font-medium px-2 py-0.5 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white rounded cursor-pointer disabled:opacity-50 flex items-center gap-1"
              >
                {testLoading ? (
                  <>
                    <Loader2 size={10} className="animate-spin" />
                    <span>{isEn ? 'Measuring...' : 'Mesure...'}</span>
                  </>
                ) : (
                  <span>{isEn ? 'Count Tokens' : 'Mesurer'}</span>
                )}
              </button>
            </div>

            <input
              type="text"
              value={testText}
              onChange={(e) => setTestText(e.target.value)}
              placeholder={isEn ? 'Paste CV sentence to count tokens...' : 'Tapez ou collez du texte pour compter ses tokens...'}
              className="w-full text-[11px] px-2 py-1 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded text-gray-800 dark:text-zinc-100 placeholder-gray-400 focus:outline-hidden focus:border-blue-500"
            />

            {testResult && (
              <div className="mt-1.5 flex items-center justify-between text-[11px] text-emerald-600 dark:text-emerald-400 font-medium bg-emerald-50 dark:bg-emerald-950/40 p-1.5 rounded border border-emerald-200 dark:border-emerald-800/50">
                <span className="flex items-center gap-1">
                  <CheckCircle2 size={12} />
                  <span>{isEn ? 'Exact Gemini Token Count:' : 'Comptage réel Gemini :'}</span>
                </span>
                <span className="font-mono font-bold">
                  {testResult.tokens} tokens
                </span>
              </div>
            )}
          </div>

          {/* Notice if no key on non-Gemini */}
          {!isModelActive && (
            <div className="mt-2.5 p-2 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 rounded-md text-[11px] text-amber-800 dark:text-amber-300 flex items-start gap-1.5">
              <ShieldAlert size={14} className="shrink-0 mt-0.5 text-amber-600 dark:text-amber-400" />
              <span>
                {isEn 
                  ? 'Add your API key in Settings or switch to Gemini 3.8 Flash to use the active server model.'
                  : 'Ajoutez votre clé API dans les Paramètres ou basculez sur Gemini 3.8 Flash pour utiliser le modèle serveur.'}
              </span>
            </div>
          )}

          {/* Footer Actions */}
          <div className="pt-3 flex items-center justify-between gap-2 mt-1 border-t border-gray-100 dark:border-zinc-800">
            <button
              type="button"
              onClick={async () => {
                await resetTokenUsage(selectedAiModel);
                setStats(getModelTokenStats(selectedAiModel));
              }}
              className="text-[11px] text-gray-400 hover:text-gray-600 dark:hover:text-zinc-300 flex items-center gap-1 transition-colors cursor-pointer"
              title={isEn ? 'Reset daily counter' : 'Réinitialiser le compteur journalier'}
            >
              <RotateCcw size={11} />
              <span>{isEn ? 'Reset' : 'RàZ'}</span>
            </button>

            {onOpenSettings && (
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  onOpenSettings();
                }}
                className="text-xs font-semibold px-3 py-1.5 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white rounded-lg flex items-center gap-1.5 shadow-2xs transition-all cursor-pointer"
              >
                <Settings size={12} />
                <span>{isEn ? 'Configure Models' : 'Paramètres'}</span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
