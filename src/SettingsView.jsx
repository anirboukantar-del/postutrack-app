import React, { useState } from 'react';
import { 
  Settings, 
  Sparkles, 
  Cpu, 
  Globe, 
  Code, 
  AlertOctagon, 
  Trash2, 
  CheckCircle, 
  Eye, 
  EyeOff, 
  Key,
  ShieldCheck,
  Terminal,
  RotateCcw,
  Save,
  FileText,
  Mail,
  Info,
  Download,
  Upload
} from 'lucide-react';
import { BookOpen, HelpCircle, ExternalLink } from 'lucide-react';
import { DEFAULT_MASTER_CV_PROMPT, DEFAULT_MASTER_LETTER_PROMPT } from './masterPrompts';

export default function SettingsView({
  t,
  lang,
  selectedAiModel,
  setSelectedAiModel,
  apiKey,
  setApiKey,
  openAiKey,
  setOpenAiKey,
  anthropicKey,
  setAnthropicKey,
  customApiUrl,
  setCustomApiUrl,
  showDevStudio,
  handleToggleDevStudio,
  onOpenResetConfirm,
  onOpenDemoConfirm,
  resetSuccessNotice,
  masterCvPrompt,
  setMasterCvPrompt,
  masterLetterPrompt,
  setMasterLetterPrompt,
  onRestoreMasterCvPrompt,
  onRestoreMasterLetterPrompt,
  onExportProfile,
  onExportBackup,
  onImportData,
  onOpenTutorial
}) {
  const [showKey, setShowKey] = useState(false);
  const [savedKeyNotice, setSavedKeyNotice] = useState(false);

  // Master Prompt editor state
  const [activePromptTab, setActivePromptTab] = useState('cv'); // 'cv' or 'letter'
  const [promptSavedNotice, setPromptSavedNotice] = useState(false);
  const [promptRestoredNotice, setPromptRestoredNotice] = useState(false);
  const [showPromptRestoreConfirm, setShowPromptRestoreConfirm] = useState(false);

  const isCvPromptModified = (masterCvPrompt || '').trim() !== DEFAULT_MASTER_CV_PROMPT.trim();
  const isLetterPromptModified = (masterLetterPrompt || '').trim() !== DEFAULT_MASTER_LETTER_PROMPT.trim();

  const handleSavePrompt = () => {
    setPromptSavedNotice(true);
    setPromptRestoredNotice(false);
    setTimeout(() => setPromptSavedNotice(false), 2500);
  };

  const handleRestorePrompt = () => {
    if (activePromptTab === 'cv') {
      if (onRestoreMasterCvPrompt) onRestoreMasterCvPrompt();
    } else {
      if (onRestoreMasterLetterPrompt) onRestoreMasterLetterPrompt();
    }
    setShowPromptRestoreConfirm(false);
    setPromptRestoredNotice(true);
    setPromptSavedNotice(false);
    setTimeout(() => setPromptRestoredNotice(false), 2500);
  };

  const handleKeyChange = (val, setter) => {
    setter(val);
    setSavedKeyNotice(true);
    setTimeout(() => setSavedKeyNotice(false), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="pb-1">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
          {t.settingsTitle || (lang === 'en' ? 'Settings & Preferences' : 'Paramètres & Préférences')}
        </h2>
        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
          {t.settingsSubtitle || (lang === 'en' ? 'Manage your AI credentials, developer tools, and local data.' : 'Gérez vos clés d\'IA, vos outils développeur et vos données locales.')}
        </p>
      </div>

      {resetSuccessNotice && (
        <div className="p-4 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 rounded-xl text-sm font-medium flex items-center gap-2.5 animate-in fade-in">
          <CheckCircle size={20} className="shrink-0 text-emerald-600 dark:text-emerald-400" />
          <span>{t.resetSuccessNotice}</span>
        </div>
      )}

      {/* 1. AI CONFIGURATION */}
      <div className="space-y-4 pt-2 border-t border-gray-200 dark:border-gray-800">
        <div className="flex items-center justify-between flex-wrap gap-3 pb-3 border-b border-gray-100 dark:border-gray-800">
          <div>
            <h3 className="font-bold text-base text-gray-900 dark:text-white">
              {t.aiConfigTitle || 'Configuration de l\'IA'}
            </h3>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {lang === 'en' ? 'Active engine for CV & Cover letter generation' : 'Moteur actif pour la génération de CV et lettres'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-xs font-semibold text-gray-500 dark:text-zinc-400 hidden sm:inline">
              {lang === 'en' ? 'Provider:' : 'Fournisseur :'}
            </label>
            <select 
              className="px-3 py-2 border border-gray-200 dark:border-zinc-800 rounded-md text-xs sm:text-sm bg-gray-50 dark:bg-zinc-900 text-gray-900 dark:text-white font-semibold shadow-xs outline-none focus:ring-2 focus:ring-zinc-600 cursor-pointer"
              value={selectedAiModel}
              onChange={(e) => setSelectedAiModel(e.target.value)}
            >
              <option value="gemini">{t.geminiOption}</option>
              <option value="openai">{t.openAiOption}</option>
              <option value="anthropic">{t.anthropicOption}</option>
              <option value="other">{t.otherAiOption || (lang === 'en' ? 'Other (Custom / Compatible / Ollama)' : 'Autre (Custom / Compatible / Ollama)')}</option>
            </select>
          </div>
        </div>

        {/* Privacy Note */}
        <div className="flex items-start gap-2.5 p-3.5 bg-gray-50/70 dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 rounded-md text-xs text-gray-700 dark:text-zinc-300">
          <ShieldCheck size={16} className="text-blue-600 dark:text-zinc-400 shrink-0 mt-0.5" />
          <span>{t.apiKeyPrivacyNote}</span>
        </div>

        {/* API Key Input */}
        <div className="space-y-3">
          {selectedAiModel === 'gemini' && (
            <div>
              <div className="flex items-center justify-between mb-1.5 flex-wrap gap-1">
                <label className="text-xs font-bold text-gray-800 dark:text-gray-200 flex items-center gap-1.5">
                  <Key size={14} className="text-blue-600" />
                  <span>{t.geminiKeyLabel}</span>
                  <button
                    type="button"
                    onClick={onOpenTutorial}
                    className="text-[11px] text-amber-600 dark:text-amber-400 hover:underline font-semibold flex items-center gap-0.5 cursor-pointer ml-1"
                  >
                    <span>({lang === 'en' ? "I don't have an API key" : "Je n'ai pas de clé API"} ↗)</span>
                  </button>
                </label>
                <button
                  type="button"
                  onClick={() => setShowKey(!showKey)}
                  className="text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 flex items-center gap-1 cursor-pointer"
                >
                  {showKey ? <EyeOff size={13} /> : <Eye size={13} />}
                  <span>{showKey ? (lang === 'en' ? 'Hide' : 'Masquer') : (lang === 'en' ? 'Show' : 'Afficher')}</span>
                </button>
              </div>
              <input 
                type={showKey ? 'text' : 'password'} 
                placeholder={t.geminiKeyPlaceholder} 
                className="w-full p-3 border border-gray-200 dark:border-zinc-800 rounded-md bg-white dark:bg-zinc-900 dark:text-white text-xs sm:text-sm font-mono focus:ring-2 focus:ring-zinc-600 outline-none transition-all" 
                value={apiKey} 
                onChange={e => handleKeyChange(e.target.value, setApiKey)} 
              />
            </div>
          )}

          {selectedAiModel === 'openai' && (
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-gray-800 dark:text-gray-200 flex items-center gap-1.5">
                  <Key size={14} className="text-blue-600" />
                  <span>{t.openAiKeyLabel}</span>
                </label>
                <button
                  type="button"
                  onClick={() => setShowKey(!showKey)}
                  className="text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 flex items-center gap-1 cursor-pointer"
                >
                  {showKey ? <EyeOff size={13} /> : <Eye size={13} />}
                  <span>{showKey ? (lang === 'en' ? 'Hide' : 'Masquer') : (lang === 'en' ? 'Show' : 'Afficher')}</span>
                </button>
              </div>
              <input 
                type={showKey ? 'text' : 'password'} 
                placeholder={t.openAiKeyPlaceholder} 
                className="w-full p-3 border border-gray-200 dark:border-zinc-800 rounded-md bg-white dark:bg-zinc-900 dark:text-white text-xs sm:text-sm font-mono focus:ring-2 focus:ring-zinc-600 outline-none transition-all" 
                value={openAiKey} 
                onChange={e => handleKeyChange(e.target.value, setOpenAiKey)} 
              />
            </div>
          )}

          {selectedAiModel === 'anthropic' && (
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-gray-800 dark:text-gray-200 flex items-center gap-1.5">
                  <Key size={14} className="text-blue-600" />
                  <span>{t.anthropicKeyLabel}</span>
                </label>
                <button
                  type="button"
                  onClick={() => setShowKey(!showKey)}
                  className="text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 flex items-center gap-1 cursor-pointer"
                >
                  {showKey ? <EyeOff size={13} /> : <Eye size={13} />}
                  <span>{showKey ? (lang === 'en' ? 'Hide' : 'Masquer') : (lang === 'en' ? 'Show' : 'Afficher')}</span>
                </button>
              </div>
              <input 
                type={showKey ? 'text' : 'password'} 
                placeholder={t.anthropicKeyPlaceholder} 
                className="w-full p-3 border border-gray-200 dark:border-zinc-800 rounded-md bg-white dark:bg-zinc-900 dark:text-white text-xs sm:text-sm font-mono focus:ring-2 focus:ring-zinc-600 outline-none transition-all" 
                value={anthropicKey} 
                onChange={e => handleKeyChange(e.target.value, setAnthropicKey)} 
              />
            </div>
          )}

          {selectedAiModel === 'other' && (
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-gray-800 dark:text-gray-200 flex items-center gap-1.5">
                  <Key size={14} className="text-blue-600" />
                  <span>{t.otherKeyLabel || (lang === 'en' ? 'API Key / Token (Optional)' : 'Clé API / Token (Optionnelle)')}</span>
                </label>
                <button
                  type="button"
                  onClick={() => setShowKey(!showKey)}
                  className="text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 flex items-center gap-1 cursor-pointer"
                >
                  {showKey ? <EyeOff size={13} /> : <Eye size={13} />}
                  <span>{showKey ? (lang === 'en' ? 'Hide' : 'Masquer') : (lang === 'en' ? 'Show' : 'Afficher')}</span>
                </button>
              </div>
              <input 
                type={showKey ? 'text' : 'password'} 
                placeholder={t.otherKeyPlaceholder || (lang === 'en' ? 'Paste your API key or Bearer token (leave blank if not required)...' : 'Collez votre clé API personnalisée (laissez vide si non requise)...')} 
                className="w-full p-3 border border-gray-200 dark:border-zinc-800 rounded-md bg-white dark:bg-zinc-900 dark:text-white text-xs sm:text-sm font-mono focus:ring-2 focus:ring-zinc-600 outline-none transition-all" 
                value={openAiKey} 
                onChange={e => handleKeyChange(e.target.value, setOpenAiKey)} 
              />
            </div>
          )}

          {/* Section URL d'API Personnalisée */}
          <div className="pt-3 border-t border-gray-100 dark:border-gray-700 space-y-1.5">
            <div className="flex items-center justify-between gap-2">
              <label className="block text-xs font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-1.5">
                <Globe size={14} className="text-blue-600 dark:text-blue-400" />
                <span>
                  {selectedAiModel === 'other'
                    ? (lang === 'en' ? 'Custom API Endpoint / Base URL (Required)' : "URL d'API / Endpoint personnalisé (Requis)")
                    : (t.customApiUrlLabel || "URL d'API / Endpoint personnalisé (Optionnel)")}
                </span>
              </label>
              {customApiUrl && (
                <button 
                  type="button" 
                  onClick={() => handleKeyChange('', setCustomApiUrl)} 
                  className="text-[11px] text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                >
                  {t.resetDefaultUrl || 'Réinitialiser URL par défaut'}
                </button>
              )}
            </div>
            <input 
              type="text" 
              placeholder={t.customApiUrlPlaceholder || "ex: http://localhost:11434/v1, https://openrouter.ai/api/v1, https://api.groq.com/openai/v1..."} 
              className={`w-full p-3 border rounded-md bg-white dark:bg-zinc-900 text-xs sm:text-sm font-mono focus:ring-2 focus:ring-zinc-600 outline-none transition-all dark:text-white ${
                selectedAiModel === 'other' && !customApiUrl.trim()
                  ? 'border-amber-400 dark:border-amber-600 ring-1 ring-amber-400/50'
                  : 'border-gray-200 dark:border-zinc-800'
              }`} 
              value={customApiUrl} 
              onChange={e => handleKeyChange(e.target.value, setCustomApiUrl)} 
            />
            <p className="text-[11px] text-gray-500 dark:text-gray-400 leading-relaxed">
              {selectedAiModel === 'other'
                ? (lang === 'en' 
                    ? 'Compatible with standard OpenAI API format (e.g., Ollama at http://localhost:11434/v1, OpenRouter at https://openrouter.ai/api/v1, Groq, LM Studio, vLLM, etc.).' 
                    : 'Compatible avec le format standard OpenAI (ex : Ollama à http://localhost:11434/v1, OpenRouter à https://openrouter.ai/api/v1, Groq, LM Studio, vLLM, etc.).')
                : (t.customApiUrlHelp || "Laissez vide pour utiliser l'URL par défaut de l'IA sélectionnée, ou renseignez votre propre proxy/endpoint (Ollama, OpenRouter, Groq, LM Studio, proxy interne...).")}
            </p>
          </div>
        </div>

        {savedKeyNotice && (
          <div className="text-xs text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1.5 animate-in fade-in">
            <CheckCircle size={14} />
            <span>{lang === 'en' ? 'Configuration automatically saved in browser' : 'Configuration enregistrée automatiquement dans le navigateur'}</span>
          </div>
        )}
      </div>

      {/* 1b. MASTER AI PROMPT CONFIGURATION & RESTORE */}
      <div className="space-y-4 pt-6 border-t border-gray-200 dark:border-gray-800">
        <div className="flex items-center justify-between flex-wrap gap-3 pb-3 border-b border-gray-100 dark:border-gray-800">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-bold text-base text-gray-900 dark:text-white">
                {t.masterPromptConfigTitle || (lang === 'en' ? 'Master AI Prompts (System Instructions)' : 'Prompt Maître de l\'IA (Instructions Système)')}
              </h3>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${
                  (activePromptTab === 'cv' ? isCvPromptModified : isLetterPromptModified)
                    ? 'bg-amber-50 text-amber-700 border-amber-300 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-700'
                    : 'bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-700'
                }`}>
                  {(activePromptTab === 'cv' ? isCvPromptModified : isLetterPromptModified)
                    ? (t.masterPromptModifiedBadge || (lang === 'en' ? 'Customized' : 'Personnalisé'))
                    : (t.masterPromptDefaultBadge || (lang === 'en' ? 'Default' : 'Par défaut'))}
                </span>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 max-w-2xl">
                {t.masterPromptConfigSubtitle || (lang === 'en' ? 'Customize the core instructions sent to the AI when generating resumes and cover letters, with the option to restore the original baseline at any time.' : 'Personnalisez les directives fondamentales envoyées à l\'IA lors de la génération de CV et de lettres de motivation, avec option de réinitialisation aux valeurs d\'usine.')}
              </p>
            </div>

          {/* Prompt Tabs Switcher */}
          <div className="flex items-center gap-1 bg-gray-100 dark:bg-zinc-900 p-1 rounded-md border border-gray-200 dark:border-zinc-800">
            <button
              type="button"
              onClick={() => {
                setActivePromptTab('cv');
                setShowPromptRestoreConfirm(false);
              }}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer ${
                activePromptTab === 'cv'
                  ? 'bg-white dark:bg-zinc-800 text-blue-600 dark:text-white shadow-xs'
                  : 'text-gray-600 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <FileText size={13} />
              <span>{t.masterPromptCvTab || (lang === 'en' ? 'Master Resume Prompt' : 'Prompt Maître CV')}</span>
              {isCvPromptModified && <span className="w-1.5 h-1.5 rounded-full bg-amber-500" title="Modified" />}
            </button>
            <button
              type="button"
              onClick={() => {
                setActivePromptTab('letter');
                setShowPromptRestoreConfirm(false);
              }}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer ${
                activePromptTab === 'letter'
                  ? 'bg-white dark:bg-zinc-800 text-blue-600 dark:text-white shadow-xs'
                  : 'text-gray-600 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <Mail size={13} />
              <span>{t.masterPromptLetterTab || (lang === 'en' ? 'Master Cover Letter Prompt' : 'Prompt Maître Lettre')}</span>
              {isLetterPromptModified && <span className="w-1.5 h-1.5 rounded-full bg-amber-500" title="Modified" />}
            </button>
          </div>
        </div>

        {/* Dynamic Variables Helper Banner */}
        <div className="p-3 bg-gray-50/70 dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 rounded-md space-y-2">
          <div className="flex items-center gap-2 text-xs font-semibold text-gray-800 dark:text-zinc-200">
            <Info size={14} className="text-blue-600 dark:text-zinc-400 shrink-0" />
            <span>{t.masterPromptVariablesTitle || (lang === 'en' ? 'Available Dynamic Variables:' : 'Variables disponibles injectées automatiquement :')}</span>
          </div>
          <div className="flex flex-wrap gap-1.5 text-[11px] font-mono">
            {activePromptTab === 'cv' ? (
              <>
                <span className="px-2 py-0.5 rounded bg-white dark:bg-zinc-900 text-gray-700 dark:text-zinc-300 border border-gray-200 dark:border-zinc-800">{"{companyName}"}</span>
                <span className="px-2 py-0.5 rounded bg-white dark:bg-zinc-900 text-gray-700 dark:text-zinc-300 border border-gray-200 dark:border-zinc-800">{"{roleName}"}</span>
                <span className="px-2 py-0.5 rounded bg-white dark:bg-zinc-900 text-gray-700 dark:text-zinc-300 border border-gray-200 dark:border-zinc-800">{"{jobDescription}"}</span>
                <span className="px-2 py-0.5 rounded bg-white dark:bg-zinc-900 text-gray-700 dark:text-zinc-300 border border-gray-200 dark:border-zinc-800">{"{candidateName}"}</span>
                <span className="px-2 py-0.5 rounded bg-white dark:bg-zinc-900 text-gray-700 dark:text-zinc-300 border border-gray-200 dark:border-zinc-800">{"{candidateEmail}"}</span>
                <span className="px-2 py-0.5 rounded bg-white dark:bg-zinc-900 text-gray-700 dark:text-zinc-300 border border-gray-200 dark:border-zinc-800">{"{candidatePhone}"}</span>
                <span className="px-2 py-0.5 rounded bg-white dark:bg-zinc-900 text-gray-700 dark:text-zinc-300 border border-gray-200 dark:border-zinc-800">{"{candidateLocation}"}</span>
                <span className="px-2 py-0.5 rounded bg-white dark:bg-zinc-900 text-gray-700 dark:text-zinc-300 border border-gray-200 dark:border-zinc-800">{"{candidateMasterCV}"}</span>
                <span className="px-2 py-0.5 rounded bg-white dark:bg-zinc-900 text-gray-700 dark:text-zinc-300 border border-gray-200 dark:border-zinc-800">{"{languageDirective}"}</span>
                <span className="px-2 py-0.5 rounded bg-white dark:bg-zinc-900 text-gray-700 dark:text-zinc-300 border border-gray-200 dark:border-zinc-800">{"{densityInstructions}"}</span>
                <span className="px-2 py-0.5 rounded bg-white dark:bg-zinc-900 text-gray-700 dark:text-zinc-300 border border-gray-200 dark:border-zinc-800">{"{modificationInstructions}"}</span>
                <span className="px-2 py-0.5 rounded bg-white dark:bg-zinc-900 text-gray-700 dark:text-zinc-300 border border-gray-200 dark:border-zinc-800">{"{keywordInstructions}"}</span>
                <span className="px-2 py-0.5 rounded bg-white dark:bg-zinc-900 text-gray-700 dark:text-zinc-300 border border-gray-200 dark:border-zinc-800">{"{customInstructions}"}</span>
              </>
            ) : (
              <>
                <span className="px-2 py-0.5 rounded bg-white dark:bg-zinc-900 text-gray-700 dark:text-zinc-300 border border-gray-200 dark:border-zinc-800">{"{companyName}"}</span>
                <span className="px-2 py-0.5 rounded bg-white dark:bg-zinc-900 text-gray-700 dark:text-zinc-300 border border-gray-200 dark:border-zinc-800">{"{roleName}"}</span>
                <span className="px-2 py-0.5 rounded bg-white dark:bg-zinc-900 text-gray-700 dark:text-zinc-300 border border-gray-200 dark:border-zinc-800">{"{jobDescription}"}</span>
                <span className="px-2 py-0.5 rounded bg-white dark:bg-zinc-900 text-gray-700 dark:text-zinc-300 border border-gray-200 dark:border-zinc-800">{"{candidateMasterCV}"}</span>
                <span className="px-2 py-0.5 rounded bg-white dark:bg-zinc-900 text-gray-700 dark:text-zinc-300 border border-gray-200 dark:border-zinc-800">{"{candidateMasterLetter}"}</span>
                <span className="px-2 py-0.5 rounded bg-white dark:bg-zinc-900 text-gray-700 dark:text-zinc-300 border border-gray-200 dark:border-zinc-800">{"{languageDirective}"}</span>
                <span className="px-2 py-0.5 rounded bg-white dark:bg-zinc-900 text-gray-700 dark:text-zinc-300 border border-gray-200 dark:border-zinc-800">{"{toneInstructions}"}</span>
                <span className="px-2 py-0.5 rounded bg-white dark:bg-zinc-900 text-gray-700 dark:text-zinc-300 border border-gray-200 dark:border-zinc-800">{"{customInstructions}"}</span>
              </>
            )}
          </div>
          <p className="text-[11px] text-gray-600 dark:text-zinc-400 leading-relaxed">
            {t.masterPromptVariablesHelp || (lang === 'en' ? 'Keep tags enclosed in curly braces {variableName} to ensure candidate and job data are injected dynamically.' : 'Conservez les balises entre accolades {nomVariable} pour que les données du candidat et de l\'offre soient injectées.')}
          </p>
        </div>

        {/* Textarea for Editing Prompt */}
        <div className="space-y-2">
          <textarea
            rows={14}
            value={activePromptTab === 'cv' ? (masterCvPrompt || '') : (masterLetterPrompt || '')}
            onChange={(e) => {
              if (activePromptTab === 'cv') {
                if (setMasterCvPrompt) setMasterCvPrompt(e.target.value);
              } else {
                if (setMasterLetterPrompt) setMasterLetterPrompt(e.target.value);
              }
            }}
            placeholder={activePromptTab === 'cv' ? DEFAULT_MASTER_CV_PROMPT : DEFAULT_MASTER_LETTER_PROMPT}
            className="w-full p-3.5 border border-gray-200 dark:border-zinc-800 rounded-md bg-gray-50/70 dark:bg-zinc-950 dark:text-zinc-100 text-xs font-mono focus:ring-2 focus:ring-zinc-600 outline-none leading-relaxed transition-all shadow-inner resize-y"
            spellCheck={false}
          />
        </div>

        {/* Action Controls & Notices */}
        <div className="flex items-center justify-between flex-wrap gap-3 pt-2">
          <div className="flex items-center gap-2">
            {/* Save Button */}
            <button
              type="button"
              onClick={handleSavePrompt}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-xs sm:text-sm font-semibold shadow-xs hover:shadow-md transition-all cursor-pointer flex items-center gap-1.5"
            >
              <Save size={15} />
              <span>{t.masterPromptSaveBtn || (lang === 'en' ? 'Save Prompt Changes' : 'Enregistrer les modifications du prompt')}</span>
            </button>

            {/* Restore Confirmation Dialog or Button */}
            {showPromptRestoreConfirm ? (
              <div className="flex items-center gap-2 p-1.5 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 rounded-xl animate-in fade-in">
                <span className="text-[11px] font-semibold text-rose-700 dark:text-rose-300 px-2">
                  {lang === 'en' ? 'Confirm restore to original?' : 'Confirmer la restauration originale ?'}
                </span>
                <button
                  type="button"
                  onClick={handleRestorePrompt}
                  className="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-lg cursor-pointer transition-colors"
                >
                  {lang === 'en' ? 'Yes, restore' : 'Oui, restaurer'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowPromptRestoreConfirm(false)}
                  className="px-2 py-1 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 text-xs font-medium rounded-lg cursor-pointer transition-colors"
                >
                  {t.resetCancelBtn || (lang === 'en' ? 'Cancel' : 'Annuler')}
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setShowPromptRestoreConfirm(true)}
                disabled={activePromptTab === 'cv' ? !isCvPromptModified : !isLetterPromptModified}
                className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-medium border transition-colors flex items-center gap-1.5 cursor-pointer ${
                  (activePromptTab === 'cv' ? isCvPromptModified : isLetterPromptModified)
                    ? 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                    : 'border-gray-200 dark:border-gray-800 text-gray-400 dark:text-gray-600 cursor-not-allowed opacity-60'
                }`}
                title={t.masterPromptResetConfirm}
              >
                <RotateCcw size={14} />
                <span>{t.masterPromptResetBtn || (lang === 'en' ? 'Restore Original Prompt' : 'Restaurer le prompt d\'origine')}</span>
              </button>
            )}
          </div>

          {/* Feedback Notices */}
          <div>
            {promptSavedNotice && (
              <div className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1.5 animate-in fade-in">
                <CheckCircle size={14} />
                <span>{t.masterPromptSavedNotice || (lang === 'en' ? 'Master prompt successfully saved!' : 'Prompt maître enregistré avec succès !')}</span>
              </div>
            )}
            {promptRestoredNotice && (
              <div className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold flex items-center gap-1.5 animate-in fade-in">
                <RotateCcw size={14} />
                <span>{t.masterPromptRestoredNotice || (lang === 'en' ? 'Original master prompt successfully restored!' : 'Prompt maître restauré avec succès à sa version d\'origine !')}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 2. DEV STUDIO SETTINGS */}
      <div className="pt-6 border-t border-gray-200 dark:border-gray-800">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="space-y-1">
            <h3 className="font-bold text-gray-900 dark:text-white text-base">
              {t.devStudioToggleTitle || 'Dev Studio'}
            </h3>
            <p className="text-xs text-gray-600 dark:text-gray-400 max-w-xl leading-relaxed">
              {t.devStudioToggleSubtitle || "Activer ou masquer l'onglet Dev Studio dans la barre de navigation pour concevoir et tester vos CVs sans consommer de tokens API."}
            </p>
          </div>
          
          <div className="flex items-center gap-3 shrink-0 ml-auto sm:ml-0">
            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${
              showDevStudio 
                ? 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-900/50 dark:text-amber-200 dark:border-amber-700' 
                : 'bg-gray-100 text-gray-600 border-gray-300 dark:bg-gray-700 dark:text-gray-400 dark:border-gray-600'
            }`}>
              {showDevStudio 
                ? (t.devStudioEnabled || 'Visible dans le menu') 
                : (t.devStudioDisabled || 'Masqué du menu')}
            </span>
            <button
              type="button"
              onClick={handleToggleDevStudio}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                showDevStudio ? 'bg-amber-600' : 'bg-gray-300 dark:bg-gray-600'
              }`}
              role="switch"
              aria-checked={showDevStudio}
              title={t.toggleDevStudioBtn || 'Activer / Désactiver le Dev Studio'}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                  showDevStudio ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* 3. SAUVEGARDE & TRANSFERT */}
      {(onExportProfile || onExportBackup || onImportData) && (
        <div className="pt-6 border-t border-gray-200 dark:border-gray-800 space-y-3">
          <div>
            <h3 className="font-bold text-base text-gray-900 dark:text-white flex items-center gap-2">
              <Download size={18} className="text-indigo-600 dark:text-indigo-400 shrink-0" />
              <span>{t.backupSettingsSectionTitle || (lang === 'en' ? 'Backup & Transfer (Profile, CVs & Keys)' : 'Sauvegarde & Transfert (Profil, CVs & Clés)')}</span>
            </h3>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5 max-w-2xl leading-relaxed">
              {t.backupSettingsSectionSubtitle || (lang === 'en' ? 'Export or import your profile, CV library, API keys, and all local settings.' : 'Exportez ou importez votre profil, votre bibliothèque de CVs, vos clés API et l\'ensemble de vos paramètres locaux.')}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 pt-1">
            {onExportProfile && (
              <button
                type="button"
                onClick={onExportProfile}
                className="px-3.5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs sm:text-sm font-semibold shadow-xs hover:shadow-md transition-all cursor-pointer flex items-center gap-1.5"
                title={t.exportProfileTooltip}
              >
                <Download size={15} />
                <span>{t.exportProfileBtn || (lang === 'en' ? 'Export Profile & Settings (.json)' : 'Exporter Profil & Paramètres (.json)')}</span>
              </button>
            )}

            {onExportBackup && (
              <button
                type="button"
                onClick={onExportBackup}
                className="px-3.5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs sm:text-sm font-semibold shadow-xs hover:shadow-md transition-all cursor-pointer flex items-center gap-1.5"
                title={t.exportDataTooltip}
              >
                <Download size={15} />
                <span>{t.exportCompleteBackupBtn || (lang === 'en' ? 'Export Full Backup (.json)' : 'Exporter Sauvegarde Complète (.json)')}</span>
              </button>
            )}

            {onImportData && (
              <label className="cursor-pointer px-3.5 py-2.5 bg-white dark:bg-zinc-900 border border-gray-300 dark:border-zinc-700 text-gray-800 dark:text-zinc-200 hover:bg-gray-50 dark:hover:bg-zinc-800 rounded-xl text-xs sm:text-sm font-semibold shadow-xs transition-colors flex items-center gap-1.5">
                <Upload size={15} className="text-gray-600 dark:text-zinc-400" />
                <span>{t.importBackupBtn || (lang === 'en' ? 'Import Backup / Profile (.json)' : 'Importer Sauvegarde / Profil (.json)')}</span>
                <input type="file" accept=".json" className="hidden" onChange={onImportData} />
              </label>
            )}
          </div>
        </div>
      )}

      {/* 4. MODE DEMO */}
      <div className="pt-6 border-t border-gray-200 dark:border-gray-800 space-y-2">
        <div>
          <h3 className="font-bold text-base text-gray-900 dark:text-white">
            {t.demoConfirmTitle || (lang === 'en' ? 'Demo Environment (John DEMO)' : 'Environnement de Démo (John DEMO)')}
          </h3>
          <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5 max-w-2xl leading-relaxed">
            {t.demoConfirmSubtitle || (lang === 'en' ? 'Quickly populate the app with 200 applications across 3 years, the complete profile of John DEMO, and tailored CVs in the library.' : 'Remplissez instantanément l\'application avec 200 candidatures sur 3 ans, le profil complet de John DEMO et plusieurs CVs stylisés dans la bibliothèque.')}
          </p>
        </div>

        <div className="pt-1">
          <button
            type="button"
            onClick={onOpenDemoConfirm}
            className="px-4 py-2.5 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white rounded-xl text-xs sm:text-sm font-semibold shadow-xs hover:shadow-md transition-all cursor-pointer flex items-center gap-2"
          >
            <Sparkles size={16} />
            <span>{t.demoConfirmBtn || (lang === 'en' ? 'Load Demo Data (200 applications)' : 'Charger la démo (200 candidatures)')}</span>
          </button>
        </div>
      </div>

      {/* 4. DANGER ZONE / RESET */}
      <div className="pt-6 border-t border-gray-200 dark:border-gray-800 space-y-2">
        <div className="flex items-center gap-2">
          <AlertOctagon size={18} className="text-rose-600 dark:text-rose-400 shrink-0" />
          <h3 className="font-bold text-base text-rose-600 dark:text-rose-400">
            {t.dangerZoneTitle || 'Zone de Danger / Réinitialisation'}
          </h3>
        </div>
        
        <p className="text-xs text-gray-600 dark:text-gray-400 max-w-2xl leading-relaxed">
          {t.dangerZoneSubtitle || 'Effacez toutes les données stockées localement pour remettre l\'application à zéro.'}
        </p>

        <div className="pt-1">
          <button
            type="button"
            onClick={onOpenResetConfirm}
            className="px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs sm:text-sm font-semibold shadow-sm transition-colors cursor-pointer flex items-center gap-2"
          >
            <Trash2 size={16} />
            <span>{t.resetDataBtn || 'Supprimer les données et réinitialiser'}</span>
          </button>
        </div>
      </div>

    </div>
  );
}
