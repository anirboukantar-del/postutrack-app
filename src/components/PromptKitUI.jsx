import React, { createContext, useContext, useRef, useEffect, useState } from 'react';
import {
  Loader2,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Check,
} from '../icons';

// ============================================================================
// 1. PROMPT-KIT PRIMITIVES (https://www.prompt-kit.com / ibelick/prompt-kit)
// ============================================================================

const PromptInputContext = createContext({
  isLoading: false,
  value: '',
  setValue: () => {},
  maxHeight: 240,
  onSubmit: undefined,
  disabled: false,
});

export function usePromptInput() {
  return useContext(PromptInputContext);
}

/**
 * PromptInput — Core composer container from prompt-kit.com
 * Uses clean surface luminance contrast without block borders.
 */
export function PromptInput({
  className = '',
  isLoading = false,
  maxHeight = 240,
  value,
  onValueChange,
  onSubmit,
  disabled = false,
  children,
}) {
  const [internalValue, setInternalValue] = useState(value || '');
  const isControlled = value !== undefined;
  const currentValue = isControlled ? value : internalValue;

  const handleChange = (newVal) => {
    if (!isControlled) setInternalValue(newVal);
    if (onValueChange) onValueChange(newVal);
  };

  return (
    <PromptInputContext.Provider
      value={{
        isLoading,
        value: currentValue,
        setValue: handleChange,
        maxHeight,
        onSubmit,
        disabled,
      }}
    >
      <div
        className={`group/prompt relative flex flex-col w-full rounded-lg bg-zinc-100/80 dark:bg-zinc-950/70 transition-colors duration-150 focus-within:ring-1 focus-within:ring-blue-600/40 ${
          disabled ? 'opacity-60 pointer-events-none' : ''
        } ${className}`}
      >
        {children}
      </div>
    </PromptInputContext.Provider>
  );
}

/**
 * PromptInputTextarea — Auto-resizing textarea primitive from prompt-kit.com
 */
export function PromptInputTextarea({
  className = '',
  placeholder = '',
  minRows = 4,
  maxHeight: propMaxHeight,
  onKeyDown,
  disabled: propDisabled,
  ...props
}) {
  const { value, setValue, maxHeight: ctxMaxHeight, onSubmit, disabled: ctxDisabled } = usePromptInput();
  const maxHeight = propMaxHeight ?? ctxMaxHeight;
  const textareaRef = useRef(null);
  const isDisabled = propDisabled || ctxDisabled;

  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    const nextHeight = Math.min(el.scrollHeight, maxHeight);
    el.style.height = `${Math.max(nextHeight, minRows * 22)}px`;
  }, [value, maxHeight, minRows]);

  const handleKeyDown = (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault();
      if (onSubmit) onSubmit();
    }
    if (onKeyDown) onKeyDown(e);
  };

  return (
    <textarea
      ref={textareaRef}
      rows={minRows}
      value={value}
      disabled={isDisabled}
      onChange={(e) => setValue(e.target.value)}
      onKeyDown={handleKeyDown}
      placeholder={placeholder}
      className={`w-full resize-none bg-transparent px-3.5 py-3 text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:outline-none font-sans leading-relaxed custom-scrollbar ${className}`}
      {...props}
    />
  );
}

/**
 * PromptInputActions — Bottom action bar inside PromptInput
 */
export function PromptInputActions({ children, className = '' }) {
  return (
    <div
      className={`flex flex-wrap items-center justify-between gap-2 px-3 py-2 bg-zinc-200/40 dark:bg-zinc-900/60 rounded-b-lg ${className}`}
    >
      {children}
    </div>
  );
}

/**
 * PromptInputAction — Action slot with subtle hover title/tooltip
 */
export function PromptInputAction({ tooltip, children, className = '' }) {
  return (
    <div className={`relative inline-flex items-center ${className}`} title={tooltip}>
      {children}
    </div>
  );
}

/**
 * PromptSuggestion — Interactive suggestion button from prompt-kit.com
 */
export function PromptSuggestion({
  children,
  onClick,
  active = false,
  icon: IconComponent,
  className = '',
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-md transition-colors duration-150 cursor-pointer whitespace-nowrap shrink-0 ${
        active
          ? 'bg-blue-600/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-300'
          : 'bg-zinc-100/90 dark:bg-zinc-800/80 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200/70 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-zinc-200'
      } ${className}`}
    >
      {IconComponent && <IconComponent size={13} className={active ? 'text-blue-600 dark:text-blue-400' : 'text-zinc-400'} />}
      <span>{children}</span>
    </button>
  );
}

// ============================================================================
// 2. BEAUTIFUL UI PRIMITIVES (https://www.beautifului.dev)
// ============================================================================

/**
 * ToolCallRow — Beautiful UI micro-component displaying an agent tool execution
 */
export function ToolCallRow({
  toolName,
  label,
  detail,
  status = 'done', // 'pending' | 'running' | 'done'
  durationMs,
}) {
  return (
    <div className="flex items-center justify-between gap-3 py-1.5 px-2.5 rounded-md bg-white/80 dark:bg-zinc-900/70 text-xs">
      <div className="flex items-center gap-2 min-w-0">
        {status === 'running' ? (
          <Loader2 size={13} className="animate-spin text-blue-600 dark:text-blue-400 shrink-0" />
        ) : status === 'done' ? (
          <CheckCircle2 size={13} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
        ) : (
          <span className="w-3 h-3 rounded-full bg-zinc-200 dark:bg-zinc-800 inline-block shrink-0" />
        )}
        <span className="font-mono text-[11px] font-medium text-blue-600 dark:text-blue-400 shrink-0">
          {toolName}
        </span>
        <span className="text-zinc-300 dark:text-zinc-700" aria-hidden="true">·</span>
        <span className="text-zinc-700 dark:text-zinc-300 truncate">{label}</span>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        {detail && (
          <span className="hidden sm:inline text-[11px] font-mono text-zinc-400 dark:text-zinc-500 truncate max-w-[160px]">
            {detail}
          </span>
        )}
        {durationMs && status === 'done' && (
          <span className="font-mono tabular-nums text-[10px] text-zinc-400 dark:text-zinc-500">
            {durationMs}
          </span>
        )}
      </div>
    </div>
  );
}

/**
 * AgentThinkingTrace — Beautiful UI reasoning & tool-call trace panel
 * Replaces generic spinners with transparent step-by-step agentic progress.
 */
export function AgentThinkingTrace({
  isActive = false,
  mode = 'cv', // 'cv' | 'letter' | 'scrape'
  providerName = 'AI Engine',
  companyName = '',
  roleName = '',
  lang = 'fr',
}) {
  const [elapsedSec, setElapsedSec] = useState(0);
  const [activeStepIdx, setActiveStepIdx] = useState(0);
  const [isExpanded, setIsExpanded] = useState(true);

  useEffect(() => {
    if (!isActive) {
      setElapsedSec(0);
      setActiveStepIdx(0);
      return;
    }
    const timer = setInterval(() => {
      setElapsedSec((prev) => +(prev + 0.1).toFixed(1));
    }, 100);

    const stepTimer = setInterval(() => {
      setActiveStepIdx((prev) => (prev < 3 ? prev + 1 : prev));
    }, 1400);

    return () => {
      clearInterval(timer);
      clearInterval(stepTimer);
    };
  }, [isActive]);

  if (!isActive) return null;

  const isEn = lang === 'en';
  const steps =
    mode === 'scrape'
      ? [
          {
            tool: 'scraper.fetchUrl',
            label: isEn ? 'Connecting to job board & extracting DOM' : 'Connexion au portail et lecture du DOM de l\'offre',
            detail: 'HTTP/DOM',
          },
          {
            tool: 'parser.cleanOffer',
            label: isEn ? 'Filtering boilerplate & isolating requirements' : 'Nettoyage du texte et isolation des prérequis',
            detail: 'NLP Parser',
          },
          {
            tool: 'extractor.metadata',
            label: isEn ? 'Detecting company name & target role title' : 'Identification de l\'entreprise et de l\'intitulé du poste',
            detail: 'JSON Struct',
          },
        ]
      : mode === 'letter'
      ? [
          {
            tool: 'ats.analyzeOffer',
            label: isEn ? 'Parsing job description & core expectations' : 'Analyse des attentes clés de l\'offre d\'emploi',
            detail: companyName || 'Target Role',
          },
          {
            tool: 'profile.matchExperiences',
            label: isEn ? 'Selecting highest-impact achievements from Master CV' : 'Sélection des réalisations clés du CV Maître',
            detail: roleName || 'Master CV',
          },
          {
            tool: 'writer.composeLetter',
            label: isEn ? 'Drafting structured multi-paragraph cover letter' : 'Rédaction des paragraphes argumentés sur-mesure',
            detail: providerName,
          },
          {
            tool: 'layout.formatA4',
            label: isEn ? 'Validating A4 spacing & formal salutations' : 'Vérification du calibrage A4 et des formules de politesse',
            detail: '210×297mm',
          },
        ]
      : [
          {
            tool: 'ats.extractKeywords',
            label: isEn ? 'Extracting high-priority ATS keywords & skills' : 'Extraction des mots-clés ATS et compétences cibles',
            detail: companyName || 'ATS Scan',
          },
          {
            tool: 'cv.alignExperiences',
            label: isEn ? 'Rewriting bullet points with measurable impact' : 'Adaptation des expériences et réalisations chiffrées',
            detail: roleName || 'Master CV',
          },
          {
            tool: 'llm.synthesizeJson',
            label: isEn ? 'Generating structured resume schema & match score' : 'Synthèse du schéma JSON structuré et calcul du score ATS',
            detail: providerName,
          },
          {
            tool: 'a4.calibrateLayout',
            label: isEn ? 'Fitting typography & margins to A4 layout' : 'Calibrage typographique sur gabarit A4',
            detail: '210×297mm',
          },
        ];

  return (
    <div className="rounded-lg bg-zinc-100/80 dark:bg-zinc-900 p-3.5 space-y-2.5 transition-colors duration-150">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <Loader2 size={15} className="animate-spin text-blue-600 dark:text-blue-400 shrink-0" />
          <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 truncate">
            {isEn ? 'Agent Reasoning & Execution Trace' : 'Exécution de l\'agent IA en cours'}
          </span>
          <span className="text-zinc-300 dark:text-zinc-700" aria-hidden="true">·</span>
          <span className="font-mono text-[11px] text-blue-600 dark:text-blue-400 truncate">
            {providerName}
          </span>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="font-mono tabular-nums text-xs font-medium text-zinc-500 dark:text-zinc-400">
            {elapsedSec.toFixed(1)}s
          </span>
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 rounded-md transition-colors duration-150 cursor-pointer"
          >
            {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="space-y-1.5 pt-1">
          {steps.map((s, idx) => {
            const stepStatus =
              idx < activeStepIdx ? 'done' : idx === activeStepIdx ? 'running' : 'pending';
            return (
              <ToolCallRow
                key={s.tool}
                toolName={s.tool}
                label={s.label}
                detail={s.detail}
                status={stepStatus}
                durationMs={idx < activeStepIdx ? `${(0.4 + idx * 0.3).toFixed(1)}s` : undefined}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}

/**
 * StructuredRecordCard — Beautiful UI structured record & ATS alignment card
 * Displays match score, analysis summary, and injected keywords cleanly without borders between blocks.
 */
export function StructuredRecordCard({
  matchScore = 88,
  analysisSummary = '',
  injectedKeywords = [],
  providerLabel = '',
  lang = 'fr',
}) {
  const [copiedKw, setCopiedKw] = useState(null);
  const isEn = lang === 'en';

  const handleCopyKeyword = (kw) => {
    navigator.clipboard.writeText(kw);
    setCopiedKw(kw);
    setTimeout(() => setCopiedKw(null), 1500);
  };

  const scoreColor =
    matchScore >= 80
      ? 'text-emerald-600 dark:text-emerald-400'
      : matchScore >= 65
      ? 'text-blue-600 dark:text-blue-400'
      : 'text-amber-600 dark:text-amber-400';

  const barColor =
    matchScore >= 80
      ? 'bg-emerald-600 dark:bg-emerald-500'
      : matchScore >= 65
      ? 'bg-blue-600 dark:bg-blue-500'
      : 'bg-amber-500';

  return (
    <div className="rounded-lg bg-white dark:bg-zinc-900 overflow-hidden no-print print:hidden">
      {/* Top Record Header: Score & Alignment Summary */}
      <div className="p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1 max-w-2xl">
          <div className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
            <span className="font-medium text-zinc-900 dark:text-zinc-100">
              {isEn ? 'ATS Alignment Record' : 'Rapport d\'Alignement ATS'}
            </span>
            {providerLabel && (
              <>
                <span aria-hidden="true">·</span>
                <span className="font-mono text-[11px]">{providerLabel}</span>
              </>
            )}
          </div>
          <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
            {analysisSummary}
          </p>
        </div>

        {/* Numeric Score Readout (Tabular Numerals) */}
        <div className="flex items-center gap-4 shrink-0 md:pl-5">
          <div>
            <div className="text-[11px] text-zinc-500 dark:text-zinc-400">
              {isEn ? 'Match Score' : 'Score ATS'}
            </div>
            <div className={`text-2xl font-semibold font-mono tabular-nums tracking-tight ${scoreColor}`}>
              {matchScore}%
            </div>
          </div>
          <div className="w-24 h-2 bg-zinc-100 dark:bg-zinc-800 rounded-sm overflow-hidden">
            <div
              className={`h-full ${barColor} transition-all duration-300`}
              style={{ width: `${Math.min(100, Math.max(0, matchScore))}%` }}
            />
          </div>
        </div>
      </div>

      {/* Bottom Record Row: Injected ATS Keywords */}
      {Array.isArray(injectedKeywords) && injectedKeywords.length > 0 && (
        <div className="px-4 py-3 sm:px-5 bg-zinc-50/80 dark:bg-zinc-950/50 flex flex-wrap items-center gap-x-2 gap-y-1.5">
          <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400 mr-1">
            {isEn ? 'Injected Keywords:' : 'Mots-clés injectés :'}
          </span>
          {injectedKeywords.map((kw, i) => (
            <button
              key={i}
              type="button"
              onClick={() => handleCopyKeyword(kw)}
              title={isEn ? 'Click to copy keyword' : 'Cliquer pour copier ce mot-clé'}
              className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-mono bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors duration-150 cursor-pointer"
            >
              <span>{kw}</span>
              {copiedKw === kw && <Check size={11} className="text-emerald-600 dark:text-emerald-400" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * SegmentedControl — Unslop / Beautiful UI Segmented Control Bar
 */
export function SegmentedControl({ options = [], value, onChange, className = '' }) {
  return (
    <div
      className={`inline-flex items-center p-1 rounded-lg bg-zinc-100 dark:bg-zinc-900 ${className}`}
    >
      {options.map((opt) => {
        const isActive = value === opt.value;
        const Icon = opt.icon;
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className={`inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors duration-150 cursor-pointer whitespace-nowrap shrink-0 ${
              isActive
                ? 'bg-white dark:bg-zinc-800 text-blue-600 dark:text-zinc-100'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
            }`}
          >
            {Icon && <Icon size={14} className={isActive ? 'text-blue-600 dark:text-blue-400' : 'text-zinc-400'} />}
            <span>{opt.label}</span>
          </button>
        );
      })}
    </div>
  );
}
