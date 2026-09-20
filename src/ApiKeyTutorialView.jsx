import React from 'react';
import {
  Sparkles,
  ArrowLeft,
  ExternalLink,
  Key,
  CheckCircle2,
  Settings,
  Info
} from 'lucide-react';

export default function ApiKeyTutorialView({
  lang,
  onBackToSettings,
  onGoToDashboard,
  backLabel = null
}) {
  const googleAiStudioUrl = 'https://aistudio.google.com/app/apikey';
  const isEn = lang === 'en';

  const defaultBackText = isEn ? 'Back to Settings' : 'Retour aux Paramètres';
  const resolvedBackLabel = backLabel || defaultBackText;

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-300 pb-12">
      {/* Top Bar Navigation */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <button
          type="button"
          onClick={onBackToSettings}
          className="inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-750 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-700 rounded-xl text-xs sm:text-sm font-semibold shadow-xs transition-colors cursor-pointer"
        >
          <ArrowLeft size={16} />
          <span>{resolvedBackLabel}</span>
        </button>

        <div className="flex items-center gap-2">
          {onGoToDashboard && (
            <button
              type="button"
              onClick={onGoToDashboard}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 rounded-lg transition-colors cursor-pointer"
            >
              <span>{isEn ? 'Dashboard' : 'Tableau de bord'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Hero Header */}
      <div className="relative overflow-hidden bg-gradient-to-br from-indigo-900 via-blue-900 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-indigo-700/40">
        <div className="absolute -right-8 -bottom-8 w-56 h-56 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 space-y-3 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-400/20 text-amber-300 border border-amber-400/30 rounded-full text-xs font-bold uppercase tracking-wider">
            <Sparkles size={13} />
            <span>{isEn ? 'Beginner Guide • 100% Free' : 'Guide Débutant • 100% Gratuit'}</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            {isEn
              ? 'How to Create a Free Google AI Studio API Key & Add it to PostuTrack'
              : 'Créer une Clé API Gratuite sur Google AI Studio et l\'ajouter à PostuTrack'}
          </h1>

          <p className="text-sm sm:text-base text-blue-100/90 leading-relaxed">
            {isEn
              ? 'Follow this simple 5-step tutorial (under 2 minutes, no credit card required) to unlock AI-powered resume tailoring and cover letter generation.'
              : 'Suivez ce tutoriel simple en 5 étapes (moins de 2 minutes, sans carte bancaire) pour débloquer l\'adaptation de CV et la génération de lettres par IA.'}
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            <a
              href={googleAiStudioUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white font-bold rounded-xl text-xs sm:text-sm shadow-md shadow-blue-500/30 transition-all cursor-pointer"
            >
              <span>{isEn ? 'Open Google AI Studio' : 'Ouvrir Google AI Studio'}</span>
              <ExternalLink size={15} />
            </a>
          </div>
        </div>
      </div>

      {/* Step by Step Cards */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <span>{isEn ? 'Step-by-Step Instructions' : 'Tutoriel étape par étape'}</span>
        </h2>

        {/* Step 1 */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xs border border-gray-200 dark:border-gray-700 p-5 sm:p-6 transition-colors">
          <div className="flex items-start gap-4">
            <div className="w-9 h-9 rounded-xl bg-blue-600 text-white font-black text-base flex items-center justify-center shrink-0 shadow-xs">
              1
            </div>
            <div className="space-y-2 flex-1">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <h3 className="font-bold text-base text-gray-900 dark:text-white">
                  {isEn ? 'Open Google AI Studio in a new tab' : 'Accéder à Google AI Studio'}
                </h3>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 font-semibold border border-blue-200 dark:border-blue-800">
                  {isEn ? 'Free Platform' : 'Plateforme officielle'}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                {isEn
                  ? 'Google AI Studio is the official developer hub for Gemini models. It provides completely free API keys with generous usage quotas (plenty for hundreds of CV adaptations per day).'
                  : 'Google AI Studio est la plateforme officielle de Google pour les modèles Gemini. Elle fournit des clés API gratuites avec des quotas très confortables (largement suffisant pour adapter des dizaines de CV par jour).'}
              </p>
              <div className="pt-2">
                <a
                  href={googleAiStudioUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 dark:bg-blue-900/30 hover:bg-blue-100 dark:hover:bg-blue-900/50 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                >
                  <span>{isEn ? 'Go to aistudio.google.com/app/apikey' : 'Aller sur aistudio.google.com/app/apikey'}</span>
                  <ExternalLink size={13} />
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Step 2 */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xs border border-gray-200 dark:border-gray-700 p-5 sm:p-6 transition-colors">
          <div className="flex items-start gap-4">
            <div className="w-9 h-9 rounded-xl bg-blue-600 text-white font-black text-base flex items-center justify-center shrink-0 shadow-xs">
              2
            </div>
            <div className="space-y-2 flex-1">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <h3 className="font-bold text-base text-gray-900 dark:text-white">
                  {isEn ? 'Log in with your Google Account' : 'Connectez-vous avec votre compte Google'}
                </h3>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 font-semibold border border-emerald-200 dark:border-emerald-800">
                  {isEn ? 'No Credit Card' : 'Sans carte bancaire'}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                {isEn
                  ? 'Sign in using any standard Gmail or Google Workspace account. If this is your first time, check the box to agree to the terms of service and click Continue.'
                  : 'Connectez-vous avec votre compte Gmail habituel. S\'il s\'agit de votre première visite, cochez la case d\'acceptation des conditions d\'utilisation et validez.'}
              </p>
              <div className="p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 rounded-xl text-xs text-amber-800 dark:text-amber-300 flex items-start gap-2">
                <Info size={16} className="shrink-0 mt-0.5" />
                <span>
                  {isEn
                    ? 'Important: Google will never ask for a credit card or billing details to use the free tier.'
                    : 'Rappel : Google ne vous demandera aucune carte bancaire pour utiliser le quota gratuit standard.'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Step 3 */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xs border border-gray-200 dark:border-gray-700 p-5 sm:p-6 transition-colors">
          <div className="flex items-start gap-4">
            <div className="w-9 h-9 rounded-xl bg-blue-600 text-white font-black text-base flex items-center justify-center shrink-0 shadow-xs">
              3
            </div>
            <div className="space-y-2 flex-1">
              <h3 className="font-bold text-base text-gray-900 dark:text-white">
                {isEn ? 'Click "Create API key"' : 'Cliquez sur le bouton bleu "Create API key"'}
              </h3>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                {isEn
                  ? 'In the top-left or center of the screen, click the blue button labeled "Create API key" (or "Get API key").'
                  : 'En haut ou au centre de la page, cliquez sur le bouton bleu intitulé "Create API key" (Créer une clé API).'}
              </p>
              <div className="p-3.5 bg-slate-50 dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 text-xs font-mono text-gray-700 dark:text-gray-300 space-y-1">
                <div className="font-semibold text-blue-600 dark:text-blue-400 font-sans">
                  {isEn ? 'Options modal appearing:' : 'Dans la petite fenêtre qui s\'ouvre :'}
                </div>
                <div>→ {isEn ? 'Select: "Create API key in new project"' : 'Sélectionnez : "Create API key in new project" (Créer dans un nouveau projet)'}</div>
                <div>→ {isEn ? 'Click Create' : 'Cliquez sur Créer'}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Step 4 */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xs border border-gray-200 dark:border-gray-700 p-5 sm:p-6 transition-colors">
          <div className="flex items-start gap-4">
            <div className="w-9 h-9 rounded-xl bg-blue-600 text-white font-black text-base flex items-center justify-center shrink-0 shadow-xs">
              4
            </div>
            <div className="space-y-2 flex-1">
              <h3 className="font-bold text-base text-gray-900 dark:text-white">
                {isEn ? 'Copy your generated key' : 'Copiez votre clé générée'}
              </h3>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                {isEn
                  ? 'Google instantly displays your new API key. It looks like a long string of letters and numbers starting with AIzaSy... Click the Copy button next to it.'
                  : 'Google affiche instantanément votre nouvelle clé. Elle ressemble à une chaîne de caractères commençant par AIzaSy... Cliquez sur l\'icône de copie à côté.'}
              </p>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-gray-100 dark:bg-gray-900 rounded-lg text-xs font-mono text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700">
                <Key size={13} className="text-amber-500" />
                <span>AIzaSyAbC123... (39 caractères)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Step 5 */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xs border border-gray-200 dark:border-gray-700 p-5 sm:p-6 transition-colors">
          <div className="flex items-start gap-4">
            <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white font-black text-base flex items-center justify-center shrink-0 shadow-xs">
              5
            </div>
            <div className="space-y-2 flex-1">
              <h3 className="font-bold text-base text-gray-900 dark:text-white">
                {isEn ? 'Paste it into PostuTrack Settings' : 'Collez-la dans les Paramètres de PostuTrack'}
              </h3>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                {isEn
                  ? 'Go back to Settings → AI Configuration → Google Gemini API Key. Paste your copied key, click Save, and you are all set!'
                  : 'Retournez dans Paramètres → Configuration de l\'IA → Clé API Google Gemini. Collez votre clé copiée, cliquez sur Enregistrer et le tour est joué !'}
              </p>
              <div className="pt-2 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={onBackToSettings}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer"
                >
                  <Settings size={14} />
                  <span>{resolvedBackLabel}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
