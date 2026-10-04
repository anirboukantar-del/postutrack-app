import React from 'react';
import {
  Sparkles,
  Settings,
  BookOpen,
  X,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  Languages
} from 'lucide-react';

export default function NoApiKeyModal({
  isOpen,
  onClose,
  onGoToSettings,
  onOpenTutorial,
  onToggleLanguage,
  lang = 'fr'
}) {
  if (!isOpen) return null;

  const isEn = lang === 'en';

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div 
        className="bg-white dark:bg-zinc-950 rounded-md shadow-2xl border border-gray-200 dark:border-zinc-800 w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
      >
        {/* Header with decorative background */}
        <div className="relative bg-gradient-to-r from-blue-600 via-indigo-600 to-indigo-700 text-white p-6 sm:p-7">
          <div className="absolute top-4 right-4 flex items-center gap-2">
            {onToggleLanguage && (
              <button
                type="button"
                onClick={onToggleLanguage}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/15 hover:bg-white/25 active:scale-95 text-white text-xs font-semibold backdrop-blur-xs transition-all cursor-pointer border border-white/20 select-none shadow-xs"
                title={isEn ? 'Passer en français' : 'Switch to English'}
                aria-label={isEn ? 'Passer en français' : 'Switch to English'}
              >
                <Languages size={14} className="text-white/90 shrink-0" />
                <span className="flex items-center gap-1 tracking-wider text-[11px]">
                  <span className={!isEn ? 'font-bold text-white' : 'text-white/60'}>FR</span>
                  <span className="text-white/40">/</span>
                  <span className={isEn ? 'font-bold text-white' : 'text-white/60'}>EN</span>
                </span>
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white/90 transition-colors cursor-pointer"
              title={isEn ? 'Close' : 'Fermer'}
            >
              <X size={18} />
            </button>
          </div>

          <h2 className="text-xl sm:text-2xl font-bold tracking-tight pr-24 sm:pr-28">
            {isEn ? 'No AI API Key Detected' : 'Aucune Clé API IA Configurée'}
          </h2>

          <p className="text-xs sm:text-sm text-blue-100/90 mt-1 leading-relaxed">
            {isEn
              ? 'PostuTrack needs an AI connection (free Gemini, OpenAI, Claude, or 100% local Ollama) to tailor resumes and generate cover letters.'
              : 'PostuTrack utilise l\'IA (Gemini gratuit, OpenAI, Claude, ou Ollama 100% local) pour adapter vos CVs sur-mesure et rédiger vos lettres.'}
          </p>
        </div>

        {/* Content Body */}
        <div className="p-6 sm:p-7 space-y-5">
          <div className="space-y-2.5">
            {/* Primary Action: Go to Settings */}
            <button
              type="button"
              onClick={onGoToSettings}
              className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 active:scale-99 text-white rounded-xl text-xs sm:text-sm font-bold shadow-md shadow-blue-500/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <Settings size={17} />
              <span>{isEn ? 'Go to Settings to Import Key' : 'Aller aux Paramètres pour importer une clé'}</span>
              <ArrowRight size={15} />
            </button>

            {/* Secondary Action: Open Tutorial */}
            {onOpenTutorial && (
              <button
                type="button"
                onClick={onOpenTutorial}
                className="w-full py-2.5 px-4 bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/30 dark:hover:bg-amber-900/40 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800/60 rounded-xl text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <BookOpen size={16} className="text-amber-600 dark:text-amber-400" />
                <span>{isEn ? "I don't have an API key" : "Je n'ai pas de clé API"}</span>
              </button>
            )}
          </div>

          {/* Privacy & Dismiss note */}
          <div className="pt-2 flex items-center justify-between border-t border-gray-100 dark:border-gray-700 text-xs text-gray-500 dark:text-gray-400">
            <span className="flex items-center gap-1 text-[11px]">
              <ShieldCheck size={14} className="text-emerald-500" />
              <span>{isEn ? 'Local storage only' : 'Clé stockée localement'}</span>
            </span>

            <button
              type="button"
              onClick={onClose}
              className="text-[11px] text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 underline cursor-pointer"
            >
              {isEn ? 'Continue without AI for now' : 'Continuer sans clé pour l\'instant'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
