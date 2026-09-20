import React from 'react';
import {
  Sparkles,
  Key,
  Settings,
  BookOpen,
  X,
  ShieldCheck,
  CheckCircle2,
  ArrowRight
} from 'lucide-react';

export default function NoApiKeyModal({
  isOpen,
  onClose,
  onGoToSettings,
  onOpenTutorial,
  lang = 'fr'
}) {
  if (!isOpen) return null;

  const isEn = lang === 'en';

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div 
        className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl border border-gray-200 dark:border-gray-700 w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
      >
        {/* Header with decorative background */}
        <div className="relative bg-gradient-to-r from-blue-600 via-indigo-600 to-indigo-700 text-white p-6 sm:p-7">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white/90 transition-colors cursor-pointer"
            title={isEn ? 'Close' : 'Fermer'}
          >
            <X size={18} />
          </button>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-400/20 text-amber-300 border border-amber-400/30 rounded-full text-xs font-bold uppercase tracking-wider mb-3">
            <Key size={13} />
            <span>{isEn ? 'AI Setup Needed' : 'Clé API requise'}</span>
          </div>

          <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
            {isEn ? 'No AI API Key Detected' : 'Aucune Clé API IA Configurée'}
          </h2>

          <p className="text-xs sm:text-sm text-blue-100/90 mt-1 leading-relaxed">
            {isEn
              ? 'PostuTrack needs an AI API key to tailor resumes, generate cover letters, and analyze job descriptions.'
              : 'PostuTrack utilise l\'IA pour adapter vos CVs sur-mesure, rédiger des lettres de motivation percutantes et analyser les offres.'}
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
