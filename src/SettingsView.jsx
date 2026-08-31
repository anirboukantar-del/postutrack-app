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
  ShieldCheck
} from 'lucide-react';

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
  resetSuccessNotice
}) {
  const [showKey, setShowKey] = useState(false);
  const [savedKeyNotice, setSavedKeyNotice] = useState(false);

  const handleKeyChange = (val, setter) => {
    setter(val);
    setSavedKeyNotice(true);
    setTimeout(() => setSavedKeyNotice(false), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xs border border-gray-200 dark:border-gray-700 p-5 sm:p-6 transition-colors">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 rounded-xl">
            <Settings size={24} />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
              {t.settingsTitle || (lang === 'en' ? 'Settings & Preferences' : 'Paramètres & Préférences')}
            </h2>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-0.5">
              {t.settingsSubtitle || (lang === 'en' ? 'Manage your AI credentials, developer tools, and local data.' : 'Gérez vos clés d\'IA, vos outils développeur et vos données locales.')}
            </p>
          </div>
        </div>
      </div>

      {resetSuccessNotice && (
        <div className="p-4 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 rounded-2xl text-sm font-medium flex items-center gap-2.5 animate-in fade-in">
          <CheckCircle size={20} className="shrink-0 text-emerald-600 dark:text-emerald-400" />
          <span>{t.resetSuccessNotice}</span>
        </div>
      )}

      {/* 1. AI CONFIGURATION */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xs border border-gray-200 dark:border-gray-700 p-5 sm:p-6 transition-colors space-y-5">
        <div className="flex items-center justify-between flex-wrap gap-3 pb-4 border-b border-gray-100 dark:border-gray-700">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-300 rounded-xl">
              <Sparkles size={18} />
            </div>
            <div>
              <h3 className="font-bold text-base text-gray-900 dark:text-white">
                {t.aiConfigTitle || 'Configuration de l\'IA'}
              </h3>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {lang === 'en' ? 'Active engine for CV & Cover letter generation' : 'Moteur actif pour la génération de CV et lettres'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 hidden sm:inline">
              {lang === 'en' ? 'Provider:' : 'Fournisseur :'}
            </label>
            <select 
              className="px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-xl text-xs sm:text-sm bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white font-semibold shadow-xs outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
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
        <div className="flex items-start gap-2.5 p-3.5 bg-blue-50/70 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/50 rounded-xl text-xs text-blue-800 dark:text-blue-300">
          <ShieldCheck size={16} className="text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
          <span>{t.apiKeyPrivacyNote}</span>
        </div>

        {/* API Key Input */}
        <div className="space-y-3">
          {selectedAiModel === 'gemini' && (
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-gray-800 dark:text-gray-200 flex items-center gap-1.5">
                  <Key size={14} className="text-blue-600" />
                  <span>{t.geminiKeyLabel}</span>
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
                className="w-full p-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-700 dark:text-white text-xs sm:text-sm font-mono focus:ring-2 focus:ring-blue-500 outline-none transition-all" 
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
                className="w-full p-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-700 dark:text-white text-xs sm:text-sm font-mono focus:ring-2 focus:ring-blue-500 outline-none transition-all" 
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
                className="w-full p-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-700 dark:text-white text-xs sm:text-sm font-mono focus:ring-2 focus:ring-blue-500 outline-none transition-all" 
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
                className="w-full p-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-700 dark:text-white text-xs sm:text-sm font-mono focus:ring-2 focus:ring-blue-500 outline-none transition-all" 
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
              className={`w-full p-3 border rounded-xl bg-white dark:bg-gray-700 text-xs sm:text-sm font-mono focus:ring-2 focus:ring-blue-500 outline-none transition-all dark:text-white ${
                selectedAiModel === 'other' && !customApiUrl.trim()
                  ? 'border-amber-400 dark:border-amber-600 ring-1 ring-amber-400/50'
                  : 'border-gray-200 dark:border-gray-700'
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

      {/* 2. DEV STUDIO SETTINGS */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xs border border-gray-200 dark:border-gray-700 p-5 sm:p-6 transition-colors">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-start gap-3.5">
            <div className="p-2.5 bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300 rounded-xl shrink-0 mt-0.5 border border-amber-300 dark:border-amber-700/70">
              <Code size={20} />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-bold text-gray-900 dark:text-white text-base">
                  {t.devStudioToggleTitle || 'Dev Studio (Laboratoire CV 0 Token)'}
                </h3>
                <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-amber-100 dark:bg-amber-900/60 text-amber-900 dark:text-amber-200 border border-amber-300 dark:border-amber-700">
                  0 Token
                </span>
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-400 max-w-xl leading-relaxed">
                {t.devStudioToggleSubtitle || "Activer ou masquer l'onglet Dev Studio dans la barre de navigation pour concevoir et tester vos CVs sans consommer de tokens API."}
              </p>
            </div>
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

      {/* 3. DANGER ZONE / RESET */}
      <div className="bg-rose-50/70 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/60 rounded-2xl p-5 sm:p-6 transition-colors">
        <div className="flex items-center gap-2.5 mb-2">
          <div className="p-2 bg-rose-100 dark:bg-rose-900/50 text-rose-600 dark:text-rose-400 rounded-xl">
            <AlertOctagon size={20} />
          </div>
          <div>
            <h3 className="font-bold text-base text-rose-900 dark:text-rose-200">
              {t.dangerZoneTitle || 'Zone de Danger / Réinitialisation'}
            </h3>
          </div>
        </div>
        
        <p className="text-xs text-rose-700 dark:text-rose-400 mb-4 max-w-2xl leading-relaxed">
          {t.dangerZoneSubtitle || 'Effacez toutes les données stockées localement pour remettre l\'application à zéro.'}
        </p>

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
  );
}
