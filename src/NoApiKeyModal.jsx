import React from 'react';
import {
  Settings,
  BookOpen,
  X,
  ShieldCheck,
  ArrowRight,
  Languages
} from './icons';

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
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div 
        className="bg-white dark:bg-zinc-900 rounded-lg w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-150"
        role="dialog"
        aria-modal="true"
      >
        {/* Header with flat surface contrast */}
        <div className="relative bg-zinc-100/80 dark:bg-zinc-950/60 p-5 sm:p-6">
          <div className="absolute top-4 right-4 flex items-center gap-2">
            {onToggleLanguage && (
              <button
                type="button"
                onClick={onToggleLanguage}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white dark:bg-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-200 text-xs font-medium transition-colors duration-150 cursor-pointer select-none"
                title={isEn ? 'Passer en français' : 'Switch to English'}
                aria-label={isEn ? 'Passer en français' : 'Switch to English'}
              >
                <Languages size={14} className="text-zinc-500 dark:text-zinc-400 shrink-0" />
                <span className="flex items-center gap-1 tracking-wider text-[11px]">
                  <span className={!isEn ? 'font-semibold text-zinc-900 dark:text-zinc-100' : 'text-zinc-400 dark:text-zinc-500'}>FR</span>
                  <span className="text-zinc-300 dark:text-zinc-700">/</span>
                  <span className={isEn ? 'font-semibold text-zinc-900 dark:text-zinc-100' : 'text-zinc-400 dark:text-zinc-500'}>EN</span>
                </span>
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-md bg-white dark:bg-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-500 dark:text-zinc-400 transition-colors duration-150 cursor-pointer"
              title={isEn ? 'Close' : 'Fermer'}
            >
              <X size={18} />
            </button>
          </div>

          <h2 className="text-lg sm:text-xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100 pr-24 sm:pr-28">
            {isEn ? 'No AI API Key Detected' : 'Aucune Clé API IA Configurée'}
          </h2>

          <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 mt-1.5 leading-relaxed">
            {isEn
              ? 'PostuTrack needs an AI connection (free Gemini, OpenAI, Claude, or 100% local Ollama) to tailor resumes and generate cover letters.'
              : 'PostuTrack utilise l\'IA (Gemini gratuit, OpenAI, Claude, ou Ollama 100% local) pour adapter vos CVs sur-mesure et rédiger vos lettres.'}
          </p>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 space-y-4">
          <div className="space-y-2.5">
            {/* Primary Action: Go to Settings */}
            <button
              type="button"
              onClick={onGoToSettings}
              className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 transition-colors duration-150 cursor-pointer"
            >
              <Settings size={16} />
              <span>{isEn ? 'Go to Settings to Import Key' : 'Aller aux Paramètres pour importer une clé'}</span>
              <ArrowRight size={15} />
            </button>

            {/* Secondary Action: Open Tutorial */}
            {onOpenTutorial && (
              <button
                type="button"
                onClick={onOpenTutorial}
                className="w-full py-2.5 px-4 bg-zinc-100 hover:bg-zinc-200/70 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-900 dark:text-zinc-100 rounded-md text-xs sm:text-sm font-medium flex items-center justify-center gap-2 transition-colors duration-150 cursor-pointer"
              >
                <BookOpen size={15} className="text-zinc-500 dark:text-zinc-400" />
                <span>{isEn ? "I don't have an API key" : "Je n'ai pas de clé API"}</span>
              </button>
            )}
          </div>

          {/* Privacy & Dismiss note */}
          <div className="pt-2 flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400">
            <span className="flex items-center gap-1 text-[11px]">
              <ShieldCheck size={14} className="text-emerald-600 dark:text-emerald-400" />
              <span>{isEn ? 'Local storage only' : 'Clé stockée localement'}</span>
            </span>

            <button
              type="button"
              onClick={onClose}
              className="text-[11px] text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 underline cursor-pointer transition-colors duration-150"
            >
              {isEn ? 'Continue without AI for now' : 'Continuer sans clé pour l\'instant'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
