import React from 'react';
import {
  ArrowLeft,
  ExternalLink,
  Key,
  Settings,
  Info,
  Zap
} from './icons';

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
    <div className="max-w-4xl mx-auto space-y-5 animate-in fade-in duration-150 pb-12">
      {/* Top Bar Navigation */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <button
          type="button"
          onClick={onBackToSettings}
          className="inline-flex items-center gap-2 px-3.5 py-2 bg-white dark:bg-zinc-900 hover:bg-zinc-100/80 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-200 rounded-md text-xs sm:text-sm font-medium transition-colors duration-150 cursor-pointer"
        >
          <ArrowLeft size={16} />
          <span>{resolvedBackLabel}</span>
        </button>

        <div className="flex items-center gap-2">
          {onGoToDashboard && (
            <button
              type="button"
              onClick={onGoToDashboard}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 rounded-md transition-colors duration-150 cursor-pointer"
            >
              <span>{isEn ? 'Dashboard' : 'Tableau de bord'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Hero Header: Clean flat surface, no gradient, no blur-3xl blob */}
      <div className="bg-white dark:bg-zinc-900 rounded-lg p-5 sm:p-6">
        <div className="space-y-3 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 rounded-sm text-xs font-medium">
            <span>{isEn ? 'Beginner Guide · 100% Free' : 'Guide Débutant · 100% Gratuit'}</span>
          </div>

          <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
            {isEn
              ? 'How to Create a Free Google AI Studio API Key & Add it to PostuTrack'
              : 'Créer une Clé API Gratuite sur Google AI Studio et l\'ajouter à PostuTrack'}
          </h1>

          <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
            {isEn
              ? 'Follow this simple 5-step tutorial (under 2 minutes, no credit card required) to unlock AI-powered resume tailoring and cover letter generation.'
              : 'Suivez ce tutoriel simple en 5 étapes (moins de 2 minutes, sans carte bancaire) pour débloquer l\'adaptation de CV et la génération de lettres par IA.'}
          </p>

          <div className="pt-1 flex flex-wrap items-center gap-3">
            <a
              href={googleAiStudioUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-md text-xs sm:text-sm transition-colors duration-150 cursor-pointer"
            >
              <span>{isEn ? 'Open Google AI Studio' : 'Ouvrir Google AI Studio'}</span>
              <ExternalLink size={14} />
            </a>
          </div>
        </div>
      </div>

      {/* Step by Step Blocks */}
      <div className="space-y-3">
        <h2 className="text-base font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
          <span>{isEn ? 'Step-by-Step Instructions' : 'Tutoriel étape par étape'}</span>
        </h2>

        {/* Step 1 */}
        <div className="bg-white dark:bg-zinc-900 rounded-lg p-4 sm:p-5">
          <div className="flex items-start gap-3.5">
            <div className="w-7 h-7 rounded-md bg-blue-600 text-white font-mono tabular-nums font-semibold text-xs flex items-center justify-center shrink-0">
              1
            </div>
            <div className="space-y-2 flex-1">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <h3 className="font-semibold text-sm sm:text-base text-zinc-900 dark:text-zinc-100">
                  {isEn ? 'Open Google AI Studio in a new tab' : 'Accéder à Google AI Studio'}
                </h3>
                <span className="text-xs px-2 py-0.5 rounded-sm bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 font-medium">
                  {isEn ? 'Free Platform' : 'Plateforme officielle'}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                {isEn
                  ? 'Google AI Studio is the official developer hub for Gemini models. It provides completely free API keys with generous usage quotas (plenty for hundreds of CV adaptations per day).'
                  : 'Google AI Studio est la plateforme officielle de Google pour les modèles Gemini. Elle fournit des clés API gratuites avec des quotas très confortables (largement suffisant pour adapter des dizaines de CV par jour).'}
              </p>
              <div className="pt-1">
                <a
                  href={googleAiStudioUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200/80 dark:hover:bg-zinc-700 text-zinc-900 dark:text-zinc-100 rounded-md text-xs font-medium transition-colors duration-150 cursor-pointer"
                >
                  <span>{isEn ? 'Go to aistudio.google.com/app/apikey' : 'Aller sur aistudio.google.com/app/apikey'}</span>
                  <ExternalLink size={13} />
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Step 2 */}
        <div className="bg-white dark:bg-zinc-900 rounded-lg p-4 sm:p-5">
          <div className="flex items-start gap-3.5">
            <div className="w-7 h-7 rounded-md bg-blue-600 text-white font-mono tabular-nums font-semibold text-xs flex items-center justify-center shrink-0">
              2
            </div>
            <div className="space-y-2 flex-1">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <h3 className="font-semibold text-sm sm:text-base text-zinc-900 dark:text-zinc-100">
                  {isEn ? 'Log in with your Google Account' : 'Connectez-vous avec votre compte Google'}
                </h3>
                <span className="text-xs px-2 py-0.5 rounded-sm bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-medium">
                  {isEn ? 'No Credit Card' : 'Sans carte bancaire'}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                {isEn
                  ? 'Sign in using any standard Gmail or Google Workspace account. If this is your first time, check the box to agree to the terms of service and click Continue.'
                  : 'Connectez-vous avec votre compte Gmail habituel. S\'il s\'agit de votre première visite, cochez la case d\'acceptation des conditions d\'utilisation et validez.'}
              </p>
              <div className="p-3 bg-zinc-100/70 dark:bg-zinc-950/60 rounded-md text-xs text-zinc-700 dark:text-zinc-300 flex items-start gap-2">
                <Info size={15} className="shrink-0 mt-0.5 text-zinc-500" />
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
        <div className="bg-white dark:bg-zinc-900 rounded-lg p-4 sm:p-5">
          <div className="flex items-start gap-3.5">
            <div className="w-7 h-7 rounded-md bg-blue-600 text-white font-mono tabular-nums font-semibold text-xs flex items-center justify-center shrink-0">
              3
            </div>
            <div className="space-y-2 flex-1">
              <h3 className="font-semibold text-sm sm:text-base text-zinc-900 dark:text-zinc-100">
                {isEn ? 'Click "Create API key"' : 'Cliquez sur le bouton bleu "Create API key"'}
              </h3>
              <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                {isEn
                  ? 'In the top-left or center of the screen, click the blue button labeled "Create API key" (or "Get API key").'
                  : 'En haut ou au centre de la page, cliquez sur le bouton bleu intitulé "Create API key" (Créer une clé API).'}
              </p>
              <div className="p-3 bg-zinc-100/70 dark:bg-zinc-950/60 rounded-md text-xs font-mono text-zinc-700 dark:text-zinc-300 space-y-1">
                <div className="font-medium text-blue-600 dark:text-blue-400 font-sans">
                  {isEn ? 'Options modal appearing:' : 'Dans la petite fenêtre qui s\'ouvre :'}
                </div>
                <div>→ {isEn ? 'Select: "Create API key in new project"' : 'Sélectionnez : "Create API key in new project" (Créer dans un nouveau projet)'}</div>
                <div>→ {isEn ? 'Click Create' : 'Cliquez sur Créer'}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Step 4 */}
        <div className="bg-white dark:bg-zinc-900 rounded-lg p-4 sm:p-5">
          <div className="flex items-start gap-3.5">
            <div className="w-7 h-7 rounded-md bg-blue-600 text-white font-mono tabular-nums font-semibold text-xs flex items-center justify-center shrink-0">
              4
            </div>
            <div className="space-y-2 flex-1">
              <h3 className="font-semibold text-sm sm:text-base text-zinc-900 dark:text-zinc-100">
                {isEn ? 'Copy your generated key' : 'Copiez votre clé générée'}
              </h3>
              <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                {isEn
                  ? 'Google instantly displays your new API key. It looks like a long string of letters and numbers starting with AIzaSy... Click the Copy button next to it.'
                  : 'Google affiche instantanément votre nouvelle clé. Elle ressemble à une chaîne de caractères commençant par AIzaSy... Cliquez sur l\'icône de copie à côté.'}
              </p>
              <div className="inline-flex items-center gap-2 px-2.5 py-1 bg-zinc-100 dark:bg-zinc-950/60 rounded-md text-xs font-mono text-zinc-700 dark:text-zinc-300">
                <Key size={13} className="text-zinc-500" />
                <span>AIzaSyAbC123... (39 caractères)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Step 5 */}
        <div className="bg-white dark:bg-zinc-900 rounded-lg p-4 sm:p-5">
          <div className="flex items-start gap-3.5">
            <div className="w-7 h-7 rounded-md bg-emerald-600 text-white font-mono tabular-nums font-semibold text-xs flex items-center justify-center shrink-0">
              5
            </div>
            <div className="space-y-2 flex-1">
              <h3 className="font-semibold text-sm sm:text-base text-zinc-900 dark:text-zinc-100">
                {isEn ? 'Paste it into PostuTrack Settings' : 'Collez-la dans les Paramètres de PostuTrack'}
              </h3>
              <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                {isEn
                  ? 'Go back to Settings → AI Configuration → Google Gemini API Key. Paste your copied key, click Save, and you are all set!'
                  : 'Retournez dans Paramètres → Configuration de l\'IA → Clé API Google Gemini. Collez votre clé copiée, cliquez sur Enregistrer et le tour est joué !'}
              </p>
              <div className="pt-1 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={onBackToSettings}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-xs font-semibold transition-colors duration-150 cursor-pointer"
                >
                  <Settings size={14} />
                  <span>{resolvedBackLabel}</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Alternative: Groq Cloud */}
        <div className="bg-white dark:bg-zinc-900 rounded-lg p-4 sm:p-5 space-y-2.5">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <Zap size={16} className="text-amber-600 dark:text-amber-400" />
              <h3 className="font-semibold text-sm text-zinc-900 dark:text-zinc-100">
                {isEn ? 'Another Free & Fast Option: Groq Cloud LPU' : 'Autre option gratuite & rapide : Groq Cloud LPU'}
              </h3>
            </div>
            <span className="px-2 py-0.5 rounded-sm text-[10px] font-mono tabular-nums font-semibold bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
              500+ tok/s
            </span>
          </div>

          <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
            {isEn
              ? 'Groq provides free API keys with near-instant inference for Llama 3.3 70B, Llama 3.1 8B, and DeepSeek R1 models powered by custom LPU hardware. Create your key in 30 seconds at console.groq.com/keys.'
              : 'Groq propose également des clés API gratuites offrant une vitesse d\'inférence quasi instantanée pour Llama 3.3 70B, Llama 3.1 8B et DeepSeek R1 grâce à son matériel LPU. Créez votre clé en 30 secondes sur console.groq.com/keys.'}
          </p>

          <div>
            <a
              href="https://console.groq.com/keys"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-zinc-100 hover:bg-zinc-200/80 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-900 dark:text-zinc-100 rounded-md text-xs font-medium transition-colors duration-150 cursor-pointer"
            >
              <span>{isEn ? 'Get Groq API Key (console.groq.com)' : 'Obtenir une clé Groq (console.groq.com)'}</span>
              <ExternalLink size={13} />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
