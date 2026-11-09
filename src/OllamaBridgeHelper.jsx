import React, { useState } from 'react';
import { 
  Copy, 
  Check, 
  ChevronDown, 
  ChevronUp,
  Radio,
  AlertCircle,
} from './icons';
import { isHttpsOrigin, isLocalhostUrl } from './ollamaService';

export default function OllamaBridgeHelper({
  ollamaUrl,
  onApplyUrl,
  lang = 'fr',
  isCompact = false
}) {
  const [activeTab, setActiveTab] = useState('cloudflared');
  const [copiedKey, setCopiedKey] = useState(null);
  const [isExpanded, setIsExpanded] = useState(!isCompact);

  const isEn = lang === 'en';
  const onHttps = isHttpsOrigin();
  const isLocal = isLocalhostUrl(ollamaUrl);

  const handleCopy = (text, key) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 2500);
    }
  };

  const methods = [
    {
      id: 'cloudflared',
      name: 'Cloudflare Tunnel',
      badge: isEn ? 'Recommended (No 403)' : 'Recommandé (Anti-403)',
      badgeColor: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300',
      command: 'cloudflared tunnel --url http://localhost:11434 --http-host-header localhost',
      desc: isEn
        ? 'Best solution: automatically rewrites host headers to bypass 403 errors with zero account required.'
        : 'Meilleure solution : réécrit automatiquement les en-têtes pour éviter l\'erreur 403 sans compte requis.',
      urlExample: 'https://xxxx.trycloudflare.com',
      steps: isEn ? [
        'If not installed, install cloudflared (macOS: brew install cloudflared, Windows: winget install Cloudflare.cloudflared).',
        'Run the command above. The "--http-host-header localhost" flag guarantees Ollama will NOT reject the request with 403.',
        'Copy the generated https://xxxx.trycloudflare.com URL and paste it in the Ollama URL field above.'
      ] : [
        'Si besoin, installez cloudflared (macOS: brew install cloudflared, Windows: winget install Cloudflare.cloudflared).',
        'Lancez la commande ci-dessus. L\'option "--http-host-header localhost" garantit qu\'Ollama ne rejettera PAS la requête avec une erreur 403.',
        'Copiez l\'URL générée https://xxxx.trycloudflare.com et collez-la dans le champ URL Ollama ci-dessus.'
      ]
    },
    {
      id: 'ngrok',
      name: 'ngrok',
      badge: 'ngrok-free',
      badgeColor: 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300',
      command: 'ngrok http 11434 --host-header="localhost"',
      desc: isEn
        ? 'Standard tunneling with host-header rewrite to prevent 403 Forbidden.'
        : 'Tunnel standard avec réécriture d\'en-tête pour éliminer l\'erreur 403 Forbidden.',
      urlExample: 'https://xxxx.ngrok-free.app',
      steps: isEn ? [
        'Start ngrok on port 11434 with --host-header="localhost" so Ollama accepts the connection.',
        'Copy your assigned Forwarding URL (https://xxxx.ngrok-free.app).',
        'Paste it in PostuTrack. Warning bypass headers are automatically injected.'
      ] : [
        'Lancez ngrok sur le port 11434 avec l\'option --host-header="localhost" pour qu\'Ollama accepte la connexion.',
        'Copiez l\'URL Forwarding attribuée (https://xxxx.ngrok-free.app).',
        'Collez-la dans PostuTrack. Les en-têtes d\'interstitiel sont gérés automatiquement.'
      ]
    },
    {
      id: 'localtunnel',
      name: 'LocalTunnel',
      badge: isEn ? 'Zero install (npx)' : 'Sans install (npx)',
      badgeColor: 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300',
      command: 'npx localtunnel --port 11434 --local-host 127.0.0.1',
      desc: isEn 
        ? 'Runs instantly using npx (Node.js). Gives a free public HTTPS URL.'
        : 'S\'exécute instantanément via npx (Node.js). Fournit une URL HTTPS gratuite.',
      urlExample: 'https://xxxx.loca.lt',
      steps: isEn ? [
        'Run this command in your terminal where Ollama is running.',
        'If localtunnel displays a reminder page, open your https://xxxx.loca.lt URL in a browser tab once to confirm your IP.',
        'Paste the URL into the Ollama URL input above and click "Test & Detect".'
      ] : [
        'Lancez cette commande dans votre terminal où Ollama tourne.',
        'Si localtunnel affiche une page de confirmation, ouvrez votre URL https://xxxx.loca.lt une fois dans un onglet pour valider votre IP.',
        'Collez l\'URL dans le champ URL Ollama ci-dessus et cliquez sur "Tester & Détecter".'
      ]
    },
    {
      id: 'cors',
      name: isEn ? 'Ollama Origins (CORS)' : 'Autoriser Tout (CORS)',
      badge: 'OLLAMA_ORIGINS',
      badgeColor: 'bg-zinc-200 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200',
      command: 'OLLAMA_ORIGINS="*" ollama serve',
      desc: isEn
        ? 'Instructs Ollama to accept requests from all origins and tunnel domains.'
        : 'Configure Ollama pour accepter les requêtes de tous les domaines et tunnels.',
      urlExample: 'OLLAMA_ORIGINS="*"',
      steps: isEn ? [
        'Stop Ollama if running as a background service.',
        'Run: OLLAMA_ORIGINS="*" ollama serve (or in Windows PowerShell: $env:OLLAMA_ORIGINS="*"; ollama serve).',
        'Any tunnel or origin will now connect without 403 Forbidden.'
      ] : [
        'Arrêtez Ollama s\'il tourne en arrière-plan.',
        'Lancez : OLLAMA_ORIGINS="*" ollama serve (sur Windows PowerShell : $env:OLLAMA_ORIGINS="*"; ollama serve).',
        'Tous les tunnels et requêtes externes fonctionneront alors sans erreur 403.'
      ]
    }
  ];

  const currentMethod = methods.find(m => m.id === activeTab) || methods[0];

  return (
    <div className="rounded-lg bg-zinc-100/70 dark:bg-zinc-950/60 overflow-hidden transition-colors duration-150">
      {/* Header bar */}
      <div 
        onClick={() => setIsExpanded(!isExpanded)}
        className="p-3.5 flex items-center justify-between cursor-pointer select-none hover:bg-zinc-200/50 dark:hover:bg-zinc-900 transition-colors duration-150"
      >
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-md bg-blue-600 text-white">
            <Radio size={15} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs sm:text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                {isEn ? 'Connect Local Ollama (Anti-403 Bridge)' : 'Connecter Ollama Local (Passerelle Anti-403)'}
              </span>
              <span className="text-zinc-300 dark:text-zinc-700" aria-hidden="true">·</span>
              <span className="font-mono text-[11px] text-blue-600 dark:text-blue-400">
                HTTPS Bridge
              </span>
            </div>
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
              {isEn 
                ? 'Because this app runs online over HTTPS, connect your local GPU in 1 terminal command.'
                : 'Application en ligne sécurisée : connectez votre modèle local en 1 commande sans erreur 403.'}
            </p>
          </div>
        </div>

        <button
          type="button"
          className="text-xs text-blue-600 dark:text-blue-400 font-medium flex items-center gap-1 p-1 hover:underline cursor-pointer"
        >
          <span>{isExpanded ? (isEn ? 'Hide Guide' : 'Masquer le guide') : (isEn ? 'Show Guide' : 'Afficher le guide')}</span>
          {isExpanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
        </button>
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="p-4 pt-1 space-y-3.5 text-xs animate-in fade-in duration-150">
          {/* Solution direct Anti-403 Banner */}
          <div className="p-3.5 rounded-md bg-amber-500/10 dark:bg-amber-500/15 text-amber-900 dark:text-amber-200 space-y-2">
            <div className="flex items-center gap-2">
              <AlertCircle size={16} className="text-amber-600 dark:text-amber-400 shrink-0" />
              <strong className="font-semibold text-xs sm:text-sm text-amber-950 dark:text-amber-100">
                {isEn ? 'Fixing Error 403 Forbidden (Why Ollama blocks connections)' : 'Résolution de l\'Erreur 403 (Pourquoi Ollama bloque l\'accès)'}
              </strong>
            </div>
            <p className="text-[11px] text-amber-800 dark:text-amber-300 leading-relaxed">
              {isEn
                ? 'By default, Ollama blocks requests from web domains or tunnels unless launched with OLLAMA_ORIGINS="*" or using "--http-host-header localhost". Run either fix in your terminal:'
                : 'Par défaut, Ollama bloque toute requête venant d\'un domaine Web ou d\'un tunnel pour des raisons de sécurité, renvoyant un code 403. Pour débloquer immédiatement :'}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
              <div className="p-2.5 rounded-md bg-zinc-950 text-zinc-100 space-y-1">
                <span className="text-[10px] text-zinc-400 font-medium block">
                  {isEn ? 'Option A: Cloudflare (Easiest)' : 'Option A : Cloudflare Tunnel (Recommandé)'}
                </span>
                <div className="font-mono text-[11px] text-emerald-300 select-all flex items-center justify-between gap-1">
                  <span className="truncate">cloudflared tunnel --url http://localhost:11434 --http-host-header localhost</span>
                  <button
                    type="button"
                    onClick={() => handleCopy('cloudflared tunnel --url http://localhost:11434 --http-host-header localhost', 'cf-quick')}
                    className="p-1 rounded-sm bg-zinc-800 hover:bg-zinc-700 text-zinc-300 shrink-0 cursor-pointer"
                    title="Copier"
                  >
                    {copiedKey === 'cf-quick' ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                  </button>
                </div>
              </div>

              <div className="p-2.5 rounded-md bg-zinc-950 text-zinc-100 space-y-1">
                <span className="text-[10px] text-zinc-400 font-medium block">
                  {isEn ? 'Option B: Allow Origins in Ollama' : 'Option B : Lancer Ollama avec OLLAMA_ORIGINS'}
                </span>
                <div className="font-mono text-[11px] text-emerald-300 select-all flex items-center justify-between gap-1">
                  <span className="truncate">OLLAMA_ORIGINS="*" ollama serve</span>
                  <button
                    type="button"
                    onClick={() => handleCopy('OLLAMA_ORIGINS="*" ollama serve', 'origins-quick')}
                    className="p-1 rounded-sm bg-zinc-800 hover:bg-zinc-700 text-zinc-300 shrink-0 cursor-pointer"
                    title="Copier"
                  >
                    {copiedKey === 'origins-quick' ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex flex-wrap gap-1.5">
            {methods.map(m => (
              <button
                key={m.id}
                type="button"
                onClick={() => setActiveTab(m.id)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors duration-150 cursor-pointer flex items-center gap-1.5 ${
                  activeTab === m.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200/60 dark:hover:bg-zinc-800'
                }`}
              >
                <span>{m.name}</span>
              </button>
            ))}
          </div>

          {/* Active Tab Panel */}
          <div className="space-y-3 bg-white dark:bg-zinc-900 p-4 rounded-md">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-zinc-900 dark:text-zinc-100 text-sm">
                  {currentMethod.name}
                </span>
                <span className={`px-2 py-0.5 rounded-sm text-[10px] font-medium ${currentMethod.badgeColor}`}>
                  {currentMethod.badge}
                </span>
              </div>
              <span className="text-[11px] text-zinc-500 dark:text-zinc-400">
                {currentMethod.desc}
              </span>
            </div>

            {/* Terminal Command Box */}
            <div className="relative group">
              <div className="bg-zinc-950 text-emerald-400 font-mono text-xs sm:text-sm p-3 rounded-md flex items-center justify-between gap-3 overflow-x-auto">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-zinc-500 select-none">$</span>
                  <span className="text-emerald-300 select-all font-medium tracking-wide">
                    {currentMethod.command}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => handleCopy(currentMethod.command, currentMethod.id)}
                  className="px-2.5 py-1 rounded-sm bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-sans font-medium flex items-center gap-1.5 shrink-0 transition-colors duration-150 cursor-pointer"
                >
                  {copiedKey === currentMethod.id ? (
                    <>
                      <Check size={13} className="text-emerald-400" />
                      <span className="text-emerald-400">{isEn ? 'Copied' : 'Copié'}</span>
                    </>
                  ) : (
                    <>
                      <Copy size={13} />
                      <span>{isEn ? 'Copy' : 'Copier'}</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Step-by-step instructions */}
            <div className="space-y-1.5 pt-1">
              <span className="text-[11px] font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider">
                {isEn ? 'Instructions:' : 'Étapes à suivre :'}
              </span>
              <ol className="list-decimal list-inside space-y-1 text-[11px] text-zinc-600 dark:text-zinc-400 leading-relaxed">
                {currentMethod.steps.map((step, idx) => (
                  <li key={idx} className="pl-1">
                    <span>{step}</span>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
