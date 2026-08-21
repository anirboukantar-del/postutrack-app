import React, { useState, useEffect, useMemo } from 'react';
import {
  Briefcase,
  CheckCircle,
  XCircle,
  Clock,
  Plus,
  LayoutDashboard,
  ListTodo,
  Settings,
  UserCheck,
  Sparkles,
  FileText,
  Download,
  Loader2,
  Upload,
  AlertTriangle,
  MessageSquare,
  HelpCircle,
  Layout,
  ExternalLink,
  Copy,
  Sun,
  Moon,
  Languages,
  TrendingUp,
  TrendingDown,
  Timer,
  Percent,
  Share2,
  Layers,
  Globe,
  Rocket,
  Key,
  ArrowRight,
  ArrowLeft,
  Check,
  Eye,
  EyeOff,
  ShieldCheck,
  Mail,
  FileCheck,
  Trash2,
  RotateCcw,
  AlertOctagon,
  Github,
  ShieldAlert,
  Lock,
  X,
  Info,
  Ghost
} from 'lucide-react';
import { translations } from './i18n';

const STATUS_KEYS = ['Postulé', 'En cours', 'Entretien', 'Offre', 'Refusé', 'Ghosted'];
const CONTRACT_KEYS = ['CDI', 'CDD', 'Stage', 'Alternance', 'Freelance', 'Intérim'];
const SOURCE_KEYS = [
  'Workday',
  'LinkedIn',
  'Welcome to the Jungle',
  'Greenhouse',
  'Lever',
  'SmartRecruiters',
  'Taleo',
  'Teamtailor',
  'Ashby',
  'Indeed',
  'France Travail',
  'Site Entreprise',
  'Email direct',
  'Cooptation',
  'Candidature Spontanée',
  'Autre'
];

/**
 * Checks if an application has exceeded 2 weeks (14 days) without any answer.
 * If status is still pending with no responseDate, it is considered ghosted.
 */
export const isApplicationGhosted = (app) => {
  if (!app || !app.date) return false;
  // If answered (Interview, Offer, Rejected, or has responseDate), it is not ghosted
  if (Boolean(app.responseDate) || ['Entretien', 'Interview', 'Offre', 'Offer', 'Refusé', 'Rejected'].includes(app.status)) {
    return false;
  }
  if (app.status === 'Ghosted' || app.status === 'Ghosté' || app.status === 'Sans réponse (Ghosté)') {
    return true;
  }

  const appDate = new Date(app.date);
  if (isNaN(appDate.getTime())) return false;

  const today = new Date();
  const d1 = Date.UTC(appDate.getFullYear(), appDate.getMonth(), appDate.getDate());
  const d2 = Date.UTC(today.getFullYear(), today.getMonth(), today.getDate());
  const diffDays = Math.round((d2 - d1) / (1000 * 60 * 60 * 24));

  return diffDays >= 14;
};

/**
 * Automatically transitions pending applications older than 2 weeks (>= 14 days) with no answers to 'Ghosted'.
 */
export const autoApplyGhostStatus = (apps) => {
  if (!Array.isArray(apps)) return { updated: [], changed: false };
  let changed = false;
  const updated = apps.map(app => {
    const isPending = ['Postulé', 'En cours', 'Applied', 'In Progress'].includes(app.status) || !app.status;
    if (isPending && isApplicationGhosted(app)) {
      changed = true;
      return {
        ...app,
        status: 'Ghosted'
      };
    }
    return app;
  });
  return { updated, changed };
};

const DEFAULT_APPLICATIONS = [
  { id: 1, company: 'Google', role: 'Software Engineer', date: '2026-08-01', responseDate: '2026-08-08', source: 'Workday', status: 'Entretien', type: 'CDI', url: 'https://careers.google.com' },
  { id: 2, company: 'Datadog', role: 'Frontend Engineer', date: '2026-08-04', responseDate: '2026-08-11', source: 'Greenhouse', status: 'Offre', type: 'CDI', url: 'https://www.welcometothejungle.com' },
  { id: 3, company: 'Doctolib', role: 'Fullstack Developer', date: '2026-08-07', responseDate: '2026-08-12', source: 'SmartRecruiters', status: 'Refusé', type: 'CDI', url: 'https://fr.indeed.com' },
  { id: 4, company: 'Mirakl', role: 'React Engineer', date: '2026-08-10', responseDate: '', source: 'LinkedIn', status: 'En cours', type: 'CDI', url: '' },
  { id: 5, company: 'Qonto', role: 'Product Engineer', date: '2026-08-15', responseDate: '', source: 'Lever', status: 'Postulé', type: 'CDI', url: '' }
];

const getStatusLabel = (status, t) => {
  switch (status) {
    case 'Postulé':
    case 'Applied':
      return t.statusApplied;
    case 'En cours':
    case 'In Progress':
      return t.statusInProgress;
    case 'Entretien':
    case 'Interview':
      return t.statusInterview;
    case 'Offre':
    case 'Offer':
      return t.statusOffer;
    case 'Refusé':
    case 'Rejected':
      return t.statusRejected;
    case 'Ghosted':
    case 'Ghosté':
    case 'Sans réponse (Ghosté)':
    case 'Sans réponse':
      return t.statusGhosted;
    default:
      return status;
  }
};

const getStatusColor = (status) => {
  switch (status) {
    case 'Postulé':
    case 'Applied':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300';
    case 'En cours':
    case 'In Progress':
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300';
    case 'Entretien':
    case 'Interview':
      return 'bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300';
    case 'Offre':
    case 'Offer':
      return 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300';
    case 'Refusé':
    case 'Rejected':
      return 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300';
    case 'Ghosted':
    case 'Ghosté':
    case 'Sans réponse (Ghosté)':
    case 'Sans réponse':
      return 'bg-slate-200/80 text-slate-800 dark:bg-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-600';
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
  }
};

const getContractLabel = (type, t) => {
  switch (type) {
    case 'CDI': return t.contractCDI;
    case 'CDD': return t.contractCDD;
    case 'Stage': return t.contractStage;
    case 'Alternance': return t.contractAlternance;
    case 'Freelance': return t.contractFreelance;
    case 'Intérim': return t.contractInterim;
    default: return type || 'CDI';
  }
};

const getSourceLabel = (src, t) => {
  switch (src) {
    case 'Workday': return t.sourceWorkday || 'Workday';
    case 'LinkedIn': return t.sourceLinkedIn;
    case 'Welcome to the Jungle': return t.sourceWTTJ;
    case 'Greenhouse': return t.sourceGreenhouse || 'Greenhouse';
    case 'Lever': return t.sourceLever || 'Lever';
    case 'SmartRecruiters': return t.sourceSmartRecruiters || 'SmartRecruiters';
    case 'Taleo':
    case 'Taleo / Oracle':
      return t.sourceTaleo || 'Taleo / Oracle';
    case 'Teamtailor': return t.sourceTeamtailor || 'Teamtailor';
    case 'Ashby': return t.sourceAshby || 'Ashby';
    case 'Indeed': return t.sourceIndeed;
    case 'France Travail': return t.sourceFranceTravail;
    case 'Site Entreprise':
    case 'Company Website':
    case 'Company Career Site':
      return t.sourceCompanySite;
    case 'Email direct':
    case 'Direct Email':
      return t.sourceEmail || 'Email direct';
    case 'Cooptation':
    case 'Referral':
    case 'Cooptation / Réseau':
    case 'Referral / Network':
      return t.sourceReferral;
    case 'Candidature Spontanée':
    case 'Cold Outreach':
      return t.sourceSpontaneous;
    case 'Autre':
    case 'Other':
      return t.sourceOther;
    default:
      return src || 'Workday';
  }
};

const getSourceBadgeStyle = (src) => {
  switch (src) {
    case 'Workday':
      return 'bg-blue-50 text-blue-800 border-blue-200 dark:bg-blue-900/40 dark:text-blue-200 dark:border-blue-700';
    case 'LinkedIn':
      return 'bg-sky-50 text-sky-800 border-sky-200 dark:bg-sky-900/30 dark:text-sky-300 dark:border-sky-800';
    case 'Welcome to the Jungle':
      return 'bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-800';
    case 'Greenhouse':
      return 'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-800';
    case 'Lever':
      return 'bg-teal-50 text-teal-800 border-teal-200 dark:bg-teal-900/30 dark:text-teal-300 dark:border-teal-800';
    case 'SmartRecruiters':
      return 'bg-indigo-50 text-indigo-800 border-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-300 dark:border-indigo-800';
    case 'Taleo':
    case 'Taleo / Oracle':
      return 'bg-red-50 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800';
    case 'Teamtailor':
      return 'bg-pink-50 text-pink-800 border-pink-200 dark:bg-pink-900/30 dark:text-pink-300 dark:border-pink-800';
    case 'Ashby':
      return 'bg-violet-50 text-violet-800 border-violet-200 dark:bg-violet-900/30 dark:text-violet-300 dark:border-violet-800';
    case 'Indeed':
      return 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800';
    case 'France Travail':
      return 'bg-cyan-50 text-cyan-700 border-cyan-200 dark:bg-cyan-900/30 dark:text-cyan-300 dark:border-cyan-800';
    case 'Site Entreprise':
    case 'Company Website':
    case 'Company Career Site':
      return 'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800';
    case 'Email direct':
    case 'Direct Email':
      return 'bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-900/30 dark:text-orange-300 dark:border-orange-800';
    case 'Cooptation':
    case 'Referral':
    case 'Cooptation / Réseau':
    case 'Referral / Network':
      return 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-800';
    case 'Candidature Spontanée':
    case 'Cold Outreach':
      return 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-900/30 dark:text-rose-300 dark:border-rose-800';
    default:
      return 'bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700';
  }
};

const getResponseDays = (app) => {
  const isAnswered = ['Entretien', 'Interview', 'Offre', 'Offer', 'Refusé', 'Rejected'].includes(app.status) || Boolean(app.responseDate);
  if (!isAnswered || !app.date) return null;
  
  const appDate = new Date(app.date);
  const respDateStr = app.responseDate || app.statusModifiedAt || new Date().toISOString().split('T')[0];
  const respDate = new Date(respDateStr);
  
  if (isNaN(appDate.getTime()) || isNaN(respDate.getTime())) return null;
  
  const d1 = Date.UTC(appDate.getFullYear(), appDate.getMonth(), appDate.getDate());
  const d2 = Date.UTC(respDate.getFullYear(), respDate.getMonth(), respDate.getDate());
  const diffDays = Math.max(0, Math.round((d2 - d1) / (1000 * 60 * 60 * 24)));
  return diffDays;
};

export const formatExternalUrl = (url) => {
  if (!url) return '';
  const trimmed = String(url).trim();
  if (!trimmed) return '';
  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }
  return `https://${trimmed}`;
};

const openExternalLink = async (url, e) => {
  if (e) {
    if (typeof e.preventDefault === 'function') e.preventDefault();
    if (typeof e.stopPropagation === 'function') e.stopPropagation();
  }
  if (!url) return;
  const targetUrl = formatExternalUrl(url);
  if (!targetUrl) return;

  try {
    if (typeof window !== 'undefined' && (window.__TAURI_INTERNALS__ || window.__TAURI__)) {
      const { openUrl } = await import('@tauri-apps/plugin-opener');
      if (typeof openUrl === 'function') {
        await openUrl(targetUrl);
        return;
      }
    }
  } catch (err) {
    console.warn('Could not open external link with Tauri opener plugin:', err);
  }
  window.open(targetUrl, '_blank', 'noopener,noreferrer');
};

function AddApplicationModal({ isOpen, onClose, onSave, editingApp, onGoToTailor, t }) {
  const [formData, setFormData] = useState({
    company: '',
    role: '',
    source: 'Workday',
    customSource: '',
    date: new Date().toISOString().split('T')[0],
    responseDate: '',
    status: 'Postulé',
    type: 'CDI',
    location: '',
    url: ''
  });

  useEffect(() => {
    if (editingApp) {
      const isKnown = SOURCE_KEYS.includes(editingApp.source);
      setFormData({
        company: editingApp.company || '',
        role: editingApp.role || '',
        source: isKnown ? editingApp.source : 'Autre',
        customSource: isKnown ? '' : (editingApp.source || ''),
        date: editingApp.date || new Date().toISOString().split('T')[0],
        responseDate: editingApp.responseDate || '',
        status: editingApp.status || 'Postulé',
        type: editingApp.type || 'CDI',
        location: editingApp.location || '',
        url: editingApp.url || ''
      });
    } else {
      setFormData({
        company: '',
        role: '',
        source: 'Workday',
        customSource: '',
        date: new Date().toISOString().split('T')[0],
        responseDate: '',
        status: 'Postulé',
        type: 'CDI',
        location: '',
        url: ''
      });
    }
  }, [editingApp, isOpen]);

  if (!isOpen) return null;

  const handleStatusChange = (newStatus) => {
    const isAnswered = ['Entretien', 'Interview', 'Offre', 'Offer', 'Refusé', 'Rejected'].includes(newStatus);
    const todayStr = new Date().toISOString().split('T')[0];
    setFormData(prev => ({
      ...prev,
      status: newStatus,
      responseDate: isAnswered ? (prev.status !== newStatus ? todayStr : (prev.responseDate || todayStr)) : ''
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const finalSource = formData.source === 'Autre' && formData.customSource.trim()
      ? formData.customSource.trim()
      : formData.source;

    const isAnswered = ['Entretien', 'Interview', 'Offre', 'Offer', 'Refusé', 'Rejected'].includes(formData.status);
    const todayStr = new Date().toISOString().split('T')[0];

    const payload = {
      ...formData,
      source: finalSource,
      responseDate: isAnswered ? (formData.responseDate || todayStr) : '',
      statusModifiedAt: todayStr
    };

    if (editingApp) {
      onSave({ ...payload, id: editingApp.id }, true);
    } else {
      const newApp = { ...payload, id: Date.now() };
      onSave(newApp, false);
    }
    onClose();
  };

  const isAnsweredStatus = ['Entretien', 'Interview', 'Offre', 'Offer', 'Refusé', 'Rejected'].includes(formData.status);

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50 backdrop-blur-xs">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-md p-6 dark:text-white border dark:border-gray-700 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white">
            {editingApp ? t.editApplication : t.addApplication}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors">
            <XCircle size={24} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t.company}</label>
            <input required type="text" className="w-full p-2.5 border rounded-lg bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 outline-none" 
              value={formData.company} onChange={e => setFormData({...formData, company: e.target.value})} placeholder={t.companyPlaceholder} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t.role}</label>
            <input required type="text" className="w-full p-2.5 border rounded-lg bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 outline-none" 
              value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})} placeholder={t.rolePlaceholder} />
          </div>
          
          {/* Source selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t.source}</label>
            <select 
              className="w-full p-2.5 border rounded-lg bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              value={formData.source}
              onChange={e => setFormData({...formData, source: e.target.value})}
            >
              {SOURCE_KEYS.map(sourceKey => (
                <option key={sourceKey} value={sourceKey}>{getSourceLabel(sourceKey, t)}</option>
              ))}
            </select>
            {formData.source === 'Autre' && (
              <input
                type="text"
                className="mt-2 w-full p-2.5 border rounded-lg bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder={t.sourceCustomPlaceholder || "Préciser la source..."}
                value={formData.customSource}
                onChange={e => setFormData({...formData, customSource: e.target.value})}
              />
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t.date}</label>
              <input type="date" className="w-full p-2.5 border rounded-lg bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 outline-none" 
                value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t.contractType}</label>
              <select className="w-full p-2.5 border rounded-lg bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})}>
                {CONTRACT_KEYS.map(contractKey => (
                  <option key={contractKey} value={contractKey}>{getContractLabel(contractKey, t)}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t.status}</label>
            <select className="w-full p-2.5 border rounded-lg bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              value={formData.status} onChange={e => handleStatusChange(e.target.value)}>
              {STATUS_KEYS.map(statusKey => (
                <option key={statusKey} value={statusKey}>{getStatusLabel(statusKey, t)}</option>
              ))}
            </select>
          </div>

          {/* Response Date (shown if answered status) */}
          {isAnsweredStatus && (
            <div className="p-3 bg-blue-50/70 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800/50 rounded-lg">
              <label className="block text-xs font-semibold text-blue-900 dark:text-blue-300 mb-1 flex items-center gap-1.5">
                <Timer size={14} /> {t.responseDate}
              </label>
              <input 
                type="date" 
                className="w-full p-2 border rounded-md bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white text-xs focus:ring-2 focus:ring-blue-500 outline-none" 
                value={formData.responseDate} 
                onChange={e => setFormData({...formData, responseDate: e.target.value})} 
              />
              <p className="text-[11px] text-blue-700 dark:text-blue-400 mt-1">{t.responseDateHelp || "Permet de calculer le délai moyen de réponse."}</p>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t.offerUrl}</label>
            <input type="url" className="w-full p-2.5 border rounded-lg bg-white text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none" 
              value={formData.url || ''} onChange={e => setFormData({...formData, url: e.target.value})} placeholder={t.urlPlaceholder} />
          </div>
          
          {editingApp && (
            <div className="pt-2">
              <button 
                type="button" 
                onClick={() => onGoToTailor(editingApp.id)} 
                className="w-full py-2.5 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 rounded-lg font-medium text-sm hover:bg-indigo-100 dark:hover:bg-indigo-900/50 flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <Sparkles size={16} /> {t.viewAdaptCV}
              </button>
            </div>
          )}

          <div className="pt-4 flex justify-end gap-2">
            <button type="button" onClick={onClose} className="px-4 py-2 border rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 text-sm font-medium cursor-pointer transition-colors">
              {t.cancel}
            </button>
            <button type="submit" className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium cursor-pointer shadow-sm transition-colors">
              {t.save}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function OnboardingStartingPage({
  t,
  lang,
  profile,
  setProfile,
  setApplications,
  apiKey,
  setApiKey,
  openAiKey,
  setOpenAiKey,
  anthropicKey,
  setAnthropicKey,
  selectedAiModel,
  setSelectedAiModel,
  onComplete,
  onSkip,
  processFile
}) {
  const [activeStep, setActiveStep] = useState(1);
  const [showApiKey, setShowApiKey] = useState(false);
  const [isCvDragging, setIsCvDragging] = useState(false);
  const [isLetterDragging, setIsLetterDragging] = useState(false);
  const [importNotice, setImportNotice] = useState('');

  const hasCv = Boolean(profile.masterCV && profile.masterCV.trim().length > 15);
  const hasLetter = Boolean(profile.masterLetter && profile.masterLetter.trim().length > 15);
  
  const currentKey = selectedAiModel === 'gemini' 
    ? apiKey 
    : selectedAiModel === 'openai' 
    ? openAiKey 
    : anthropicKey;
  const hasKey = Boolean(currentKey && currentKey.trim().length > 5);

  const countWords = (str) => {
    if (!str) return 0;
    return str.trim().split(/\s+/).filter(Boolean).length;
  };

  const cvWords = countWords(profile.masterCV);
  const letterWords = countWords(profile.masterLetter);

  const completionCount = (hasCv ? 1 : 0) + (hasLetter ? 1 : 0) + (hasKey ? 1 : 0);
  const completionPercent = Math.round((completionCount / 3) * 100);

  const handleImportProfileFile = (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target.result);
        let imported = false;

        // Case 1: PostuTrack full backup { profile: {...}, applications: [...] }
        if (data.profile && typeof data.profile === 'object') {
          setProfile(prev => ({
            ...prev,
            ...data.profile,
            masterCV: data.profile.masterCV || prev.masterCV || '',
            masterLetter: data.profile.masterLetter || prev.masterLetter || ''
          }));
          if (data.applications && Array.isArray(data.applications) && setApplications) {
            setApplications(autoApplyGhostStatus(data.applications).updated);
          }
          imported = true;
        } 
        // Case 2: Standalone Profile object { fullName, email, masterCV, ... }
        else if (
          data.fullName !== undefined || 
          data.email !== undefined || 
          data.masterCV !== undefined || 
          data.masterLetter !== undefined ||
          data.phone !== undefined ||
          data.location !== undefined
        ) {
          setProfile(prev => ({
            ...prev,
            fullName: data.fullName ?? prev.fullName ?? '',
            email: data.email ?? prev.email ?? '',
            phone: data.phone ?? prev.phone ?? '',
            location: data.location ?? prev.location ?? '',
            website: data.website ?? prev.website ?? '',
            masterCV: data.masterCV ?? prev.masterCV ?? '',
            masterLetter: data.masterLetter ?? prev.masterLetter ?? ''
          }));
          imported = true;
        }

        if (imported) {
          // If keys are provided in export, load them
          if (data.apiKey) setApiKey(data.apiKey);
          if (data.openAiKey) setOpenAiKey(data.openAiKey);
          if (data.anthropicKey) setAnthropicKey(data.anthropicKey);
          if (data.selectedAiModel) setSelectedAiModel(data.selectedAiModel);

          setImportNotice(t.onboardingImportProfileSuccess);
          setTimeout(() => setImportNotice(''), 4500);
        } else {
          alert(t.onboardingImportProfileError);
        }
      } catch (err) {
        console.error("Import profile error:", err);
        alert(t.onboardingImportProfileError);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleCvDrop = (e) => {
    e.preventDefault();
    setIsCvDragging(false);
    if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0], setProfile);
    }
  };

  const handleLetterDrop = (e) => {
    e.preventDefault();
    setIsLetterDragging(false);
    if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0], (text) => setProfile(prev => ({ ...prev, masterLetter: text })));
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 py-2">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden bg-gradient-to-br from-indigo-900 via-blue-900 to-slate-900 text-white rounded-3xl p-8 sm:p-10 shadow-xl border border-indigo-800/40">
        <div className="relative z-10 space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-200 text-xs font-semibold tracking-wide">
              <Rocket size={14} className="text-indigo-400" />
              {t.onboardingIntroBadge}
            </div>

            {/* Profile Import Button in Header */}
            <label 
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-semibold backdrop-blur-xs transition-all cursor-pointer shadow-sm hover:scale-[1.02]"
              title={t.onboardingImportProfileTooltip}
            >
              <Upload size={14} className="text-indigo-300" />
              <span>{t.onboardingImportProfileBtn}</span>
              <input type="file" accept=".json" className="hidden" onChange={handleImportProfileFile} />
            </label>
          </div>
          
          <div className="max-w-3xl">
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white mb-2">
              {t.welcomeTitle}
            </h1>
            <p className="text-indigo-100/90 text-sm sm:text-base leading-relaxed">
              {t.welcomeSubtitle}
            </p>
          </div>

          {importNotice && (
            <div className="p-3.5 bg-emerald-500/20 border border-emerald-400/40 text-emerald-100 rounded-2xl text-xs sm:text-sm font-semibold flex items-center gap-2.5 backdrop-blur-xs shadow-lg animate-in fade-in">
              <CheckCircle size={18} className="text-emerald-300 shrink-0" />
              <span>{importNotice}</span>
            </div>
          )}

          {/* Quick Real-Time Status Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4">
            {/* CV Status */}
            <div 
              onClick={() => setActiveStep(1)} 
              className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${activeStep === 1 ? 'ring-2 ring-indigo-400 bg-white/10' : 'bg-white/5 hover:bg-white/10'} ${hasCv ? 'border-emerald-400/40' : 'border-white/10'}`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-semibold text-indigo-200 flex items-center gap-1.5">
                  <FileText size={14} /> 1. {t.onboardingStep1Title}
                </span>
                {hasCv ? (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 flex items-center gap-1">
                    <Check size={10} /> {t.onboardingCvSuccessBadge}
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/20 text-amber-300 border border-amber-400/30">
                    {t.onboardingCvPendingBadge}
                  </span>
                )}
              </div>
              <p className="text-xs text-indigo-100/80 truncate">
                {hasCv ? `${profile.fullName || (lang === 'en' ? 'Candidate' : 'Candidat')} • ${cvWords} ${t.onboardingWordsCount || (lang === 'en' ? 'words' : 'mots')}` : (lang === 'en' ? 'PDF or TXT format' : 'Format PDF ou TXT')}
              </p>
            </div>

            {/* Letter Status */}
            <div 
              onClick={() => setActiveStep(2)} 
              className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${activeStep === 2 ? 'ring-2 ring-indigo-400 bg-white/10' : 'bg-white/5 hover:bg-white/10'} ${hasLetter ? 'border-emerald-400/40' : 'border-white/10'}`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-semibold text-indigo-200 flex items-center gap-1.5">
                  <Mail size={14} /> 2. {t.onboardingStep2Title}
                </span>
                {hasLetter ? (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 flex items-center gap-1">
                    <Check size={10} /> {t.onboardingLetterSuccessBadge}
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-white/10 text-gray-300 border border-white/10">
                    {t.onboardingLetterPendingBadge}
                  </span>
                )}
              </div>
              <p className="text-xs text-indigo-100/80 truncate">
                {hasLetter ? `${letterWords} ${t.onboardingWordsCount || (lang === 'en' ? 'words' : 'mots')}` : (lang === 'en' ? 'Standard reference letter' : 'Lettre modèle de référence')}
              </p>
            </div>

            {/* API Key Status */}
            <div 
              onClick={() => setActiveStep(3)} 
              className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${activeStep === 3 ? 'ring-2 ring-indigo-400 bg-white/10' : 'bg-white/5 hover:bg-white/10'} ${hasKey ? 'border-emerald-400/40' : 'border-white/10'}`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-semibold text-indigo-200 flex items-center gap-1.5">
                  <Key size={14} /> 3. {t.onboardingStep3Title}
                </span>
                {hasKey ? (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 flex items-center gap-1">
                    <Check size={10} /> {selectedAiModel.toUpperCase()}
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-500/20 text-blue-300 border border-blue-400/30">
                    {t.onboardingKeyPendingBadge}
                  </span>
                )}
              </div>
              <p className="text-xs text-indigo-100/80 truncate">
                {hasKey ? (lang === 'en' ? 'Stored locally & secured' : 'Enregistrée localement') : (lang === 'en' ? 'Free Gemini, OpenAI, Claude' : 'Gemini gratuit, OpenAI, Claude')}
              </p>
            </div>
          </div>
        </div>

        {/* Decorative Background Glow */}
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-12 w-64 h-64 bg-indigo-500/20 rounded-full blur-2xl pointer-events-none" />
      </div>

      {/* Main Stepper Container */}
      <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-200/80 dark:border-gray-700 overflow-hidden transition-colors">
        {/* Step Navigation Tabs */}
        <div className="grid grid-cols-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50/70 dark:bg-gray-850">
          <button
            onClick={() => setActiveStep(1)}
            className={`py-4 px-4 sm:px-6 text-left flex items-center gap-3 transition-colors cursor-pointer border-b-2 ${
              activeStep === 1
                ? 'border-indigo-600 dark:border-indigo-400 bg-white dark:bg-gray-800 text-indigo-600 dark:text-indigo-400 font-semibold'
                : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-100/50 dark:hover:bg-gray-800/50'
            }`}
          >
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
              hasCv 
                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300' 
                : activeStep === 1 
                ? 'bg-indigo-600 text-white dark:bg-indigo-500' 
                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
            }`}>
              {hasCv ? <Check size={14} /> : '1'}
            </div>
            <div className="hidden sm:block min-w-0">
              <p className="text-xs font-semibold leading-none">{t.onboardingStep1Title}</p>
              <p className="text-[11px] text-gray-400 dark:text-gray-500 truncate mt-1">
                {hasCv ? t.onboardingCvSuccessBadge : t.onboardingCvPendingBadge}
              </p>
            </div>
          </button>

          <button
            onClick={() => setActiveStep(2)}
            className={`py-4 px-4 sm:px-6 text-left flex items-center gap-3 transition-colors cursor-pointer border-b-2 ${
              activeStep === 2
                ? 'border-indigo-600 dark:border-indigo-400 bg-white dark:bg-gray-800 text-indigo-600 dark:text-indigo-400 font-semibold'
                : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-100/50 dark:hover:bg-gray-800/50'
            }`}
          >
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
              hasLetter 
                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300' 
                : activeStep === 2 
                ? 'bg-indigo-600 text-white dark:bg-indigo-500' 
                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
            }`}>
              {hasLetter ? <Check size={14} /> : '2'}
            </div>
            <div className="hidden sm:block min-w-0">
              <p className="text-xs font-semibold leading-none">{t.onboardingStep2Title}</p>
              <p className="text-[11px] text-gray-400 dark:text-gray-500 truncate mt-1">
                {hasLetter ? t.onboardingLetterSuccessBadge : t.onboardingLetterPendingBadge}
              </p>
            </div>
          </button>

          <button
            onClick={() => setActiveStep(3)}
            className={`py-4 px-4 sm:px-6 text-left flex items-center gap-3 transition-colors cursor-pointer border-b-2 ${
              activeStep === 3
                ? 'border-indigo-600 dark:border-indigo-400 bg-white dark:bg-gray-800 text-indigo-600 dark:text-indigo-400 font-semibold'
                : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-100/50 dark:hover:bg-gray-800/50'
            }`}
          >
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
              hasKey 
                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300' 
                : activeStep === 3 
                ? 'bg-indigo-600 text-white dark:bg-indigo-500' 
                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
            }`}>
              {hasKey ? <Check size={14} /> : '3'}
            </div>
            <div className="hidden sm:block min-w-0">
              <p className="text-xs font-semibold leading-none">{t.onboardingStep3Title}</p>
              <p className="text-[11px] text-gray-400 dark:text-gray-500 truncate mt-1">
                {hasKey ? t.onboardingKeySuccessBadge : t.onboardingKeyPendingBadge}
              </p>
            </div>
          </button>
        </div>

        {/* Step Body Content */}
        <div className="p-6 sm:p-8">
          {/* STEP 1: IMPORT CV */}
          {activeStep === 1 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <FileText className="text-indigo-600 dark:text-indigo-400" size={20} />
                  {t.onboardingStep1Title}
                </h3>
                <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
                  {t.onboardingStep1Subtitle}
                </p>
              </div>

              {/* Drag & Drop Target */}
              <div
                onDragOver={(e) => { e.preventDefault(); setIsCvDragging(true); }}
                onDragLeave={() => setIsCvDragging(false)}
                onDrop={handleCvDrop}
                className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all ${
                  isCvDragging 
                    ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-900/20 scale-[1.01]' 
                    : hasCv 
                    ? 'border-emerald-300 dark:border-emerald-800/60 bg-emerald-50/30 dark:bg-emerald-950/10' 
                    : 'border-gray-300 dark:border-gray-600 bg-gray-50/50 dark:bg-gray-750 hover:bg-gray-100/50 dark:hover:bg-gray-700/50'
                }`}
              >
                <div className="max-w-md mx-auto space-y-3">
                  <div className={`w-14 h-14 mx-auto rounded-2xl flex items-center justify-center shadow-xs ${
                    hasCv 
                      ? 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400' 
                      : 'bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400'
                  }`}>
                    {hasCv ? <FileCheck size={28} /> : <Upload size={28} />}
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                      {t.onboardingDragOrClick}
                    </p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                      {t.onboardingSupportedFormats}
                    </p>
                  </div>

                  <div className="pt-2 flex items-center justify-center gap-3 flex-wrap">
                    <label className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-all cursor-pointer">
                      <Upload size={15} />
                      {t.importCVBtn}
                      <input 
                        type="file" 
                        accept=".pdf,.txt" 
                        className="hidden" 
                        onChange={(e) => {
                          if (e.target.files && e.target.files[0]) {
                            processFile(e.target.files[0], setProfile);
                            e.target.value = '';
                          }
                        }} 
                      />
                    </label>

                    <label 
                      className="inline-flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-650 text-indigo-600 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-700/60 rounded-xl text-xs font-semibold shadow-xs transition-all cursor-pointer"
                      title={t.onboardingImportProfileTooltip}
                    >
                      <UserCheck size={15} className="text-indigo-500 dark:text-indigo-400" />
                      {t.onboardingImportProfileBtn}
                      <input 
                        type="file" 
                        accept=".json" 
                        className="hidden" 
                        onChange={handleImportProfileFile} 
                      />
                    </label>
                  </div>
                </div>
              </div>

              {/* Extracted Profile Details Preview */}
              <div className="p-5 bg-slate-50 dark:bg-gray-750 border border-slate-200 dark:border-gray-700 rounded-2xl space-y-4">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                    {t.onboardingExtractedProfileTitle}
                  </h4>
                  {hasCv && (
                    <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                      <CheckCircle size={14} /> {t.onboardingCvSuccessBadge} ({cvWords} {lang === 'en' ? 'words' : 'mots'})
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-medium text-gray-500 dark:text-gray-400 mb-1">{t.fullName}</label>
                    <input 
                      type="text" 
                      className="w-full p-2.5 text-xs rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500"
                      value={profile.fullName || ''} 
                      placeholder="Jean Dupont"
                      onChange={(e) => setProfile(prev => ({ ...prev, fullName: e.target.value }))}
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-gray-500 dark:text-gray-400 mb-1">{t.email}</label>
                    <input 
                      type="email" 
                      className="w-full p-2.5 text-xs rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500"
                      value={profile.email || ''} 
                      placeholder="jean.dupont@email.com"
                      onChange={(e) => setProfile(prev => ({ ...prev, email: e.target.value }))}
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-gray-500 dark:text-gray-400 mb-1">{t.phone}</label>
                    <input 
                      type="text" 
                      className="w-full p-2.5 text-xs rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500"
                      value={profile.phone || ''} 
                      placeholder="+33 6 12 34 56 78"
                      onChange={(e) => setProfile(prev => ({ ...prev, phone: e.target.value }))}
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-gray-500 dark:text-gray-400 mb-1">{t.location}</label>
                    <input 
                      type="text" 
                      className="w-full p-2.5 text-xs rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500"
                      value={profile.location || ''} 
                      placeholder="Paris, France"
                      onChange={(e) => setProfile(prev => ({ ...prev, location: e.target.value }))}
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-medium text-gray-500 dark:text-gray-400 mb-1">{t.website}</label>
                    <input 
                      type="text" 
                      className="w-full p-2.5 text-xs rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500"
                      value={profile.website || ''} 
                      placeholder="https://linkedin.com/in/jean-dupont"
                      onChange={(e) => setProfile(prev => ({ ...prev, website: e.target.value }))}
                    />
                  </div>
                </div>
              </div>

              {/* Master CV Raw Textarea */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300">
                    {t.onboardingOrPasteDirectly}
                  </label>
                  <span className="text-xs text-gray-400 dark:text-gray-500">
                    {cvWords} {lang === 'en' ? 'words' : 'mots'} • {profile.masterCV?.length || 0} {lang === 'en' ? 'chars' : 'caractères'}
                  </span>
                </div>
                <textarea 
                  rows={6}
                  className="w-full p-3 text-xs font-mono rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder={lang === 'en' ? "Paste your full resume text here (Experiences, Education, Skills, Projects)..." : "Collez le texte brut complet de votre CV ici (Expériences, Formations, Compétences, Projets)..."}
                  value={profile.masterCV || ''}
                  onChange={(e) => setProfile(prev => ({ ...prev, masterCV: e.target.value }))}
                />
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={() => setActiveStep(2)}
                  className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold flex items-center gap-2 shadow-sm transition-all cursor-pointer"
                >
                  {t.onboardingNextBtn} <ArrowRight size={15} />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: IMPORT COVER LETTER */}
          {activeStep === 2 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <Mail className="text-indigo-600 dark:text-indigo-400" size={20} />
                  {t.onboardingStep2Title}
                </h3>
                <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
                  {t.onboardingStep2Subtitle}
                </p>
              </div>

              {/* Drag & Drop Target for Letter */}
              <div
                onDragOver={(e) => { e.preventDefault(); setIsLetterDragging(true); }}
                onDragLeave={() => setIsLetterDragging(false)}
                onDrop={handleLetterDrop}
                className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all ${
                  isLetterDragging 
                    ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-900/20 scale-[1.01]' 
                    : hasLetter 
                    ? 'border-emerald-300 dark:border-emerald-800/60 bg-emerald-50/30 dark:bg-emerald-950/10' 
                    : 'border-gray-300 dark:border-gray-600 bg-gray-50/50 dark:bg-gray-750 hover:bg-gray-100/50 dark:hover:bg-gray-700/50'
                }`}
              >
                <div className="max-w-md mx-auto space-y-3">
                  <div className={`w-14 h-14 mx-auto rounded-2xl flex items-center justify-center shadow-xs ${
                    hasLetter 
                      ? 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400' 
                      : 'bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400'
                  }`}>
                    {hasLetter ? <FileCheck size={28} /> : <Upload size={28} />}
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                      {t.onboardingDragOrClick}
                    </p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                      {t.onboardingSupportedFormats}
                    </p>
                  </div>

                  <div className="pt-2">
                    <label className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-all cursor-pointer">
                      <Upload size={15} />
                      {t.importLetterBtn}
                      <input 
                        type="file" 
                        accept=".pdf,.txt" 
                        className="hidden" 
                        onChange={(e) => {
                          if (e.target.files && e.target.files[0]) {
                            processFile(e.target.files[0], (text) => setProfile(prev => ({ ...prev, masterLetter: text })));
                            e.target.value = '';
                          }
                        }} 
                      />
                    </label>
                  </div>
                </div>
              </div>

              {/* Master Letter Textarea */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300">
                    {t.masterLetterLabel}
                  </label>
                  <span className="text-xs text-gray-400 dark:text-gray-500">
                    {letterWords} {lang === 'en' ? 'words' : 'mots'} • {profile.masterLetter?.length || 0} {lang === 'en' ? 'chars' : 'caractères'}
                  </span>
                </div>
                <textarea 
                  rows={7}
                  className="w-full p-3 text-xs font-mono rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder={t.masterLetterPlaceholder || (lang === 'en' ? "Paste your favorite cover letter template here (or leave blank to let AI draft from scratch)..." : "Collez votre lettre type de motivation ici (ou laissez vide pour que l'IA génère de zéro)...")}
                  value={profile.masterLetter || ''}
                  onChange={(e) => setProfile(prev => ({ ...prev, masterLetter: e.target.value }))}
                />
              </div>

              <div className="pt-2 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setActiveStep(1)}
                  className="px-5 py-2.5 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl text-xs font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <ArrowLeft size={14} /> {t.onboardingPrevBtn}
                </button>

                <button
                  type="button"
                  onClick={() => setActiveStep(3)}
                  className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold flex items-center gap-2 shadow-sm transition-all cursor-pointer"
                >
                  {t.onboardingNextBtn} <ArrowRight size={15} />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: CONFIGURE API KEY */}
          {activeStep === 3 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <Key className="text-indigo-600 dark:text-indigo-400" size={20} />
                  {t.onboardingStep3Title}
                </h3>
                <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
                  {t.onboardingStep3Subtitle}
                </p>
              </div>

              {/* Provider Selection Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                {/* Google Gemini Card */}
                <div
                  onClick={() => setSelectedAiModel('gemini')}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer relative ${
                    selectedAiModel === 'gemini'
                      ? 'border-indigo-600 dark:border-indigo-400 bg-indigo-50/60 dark:bg-indigo-900/30 ring-2 ring-indigo-500/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 bg-white dark:bg-gray-750'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-gray-900 dark:text-white">Google Gemini</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300">
                      {lang === 'en' ? 'Free & Recommended' : 'Gratuit & Conseillé'}
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400">
                    {lang === 'en' ? 'Fast, generous free tier via Google AI Studio.' : 'Rapide, quota gratuit sans carte bancaire.'}
                  </p>
                </div>

                {/* OpenAI Card */}
                <div
                  onClick={() => setSelectedAiModel('openai')}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                    selectedAiModel === 'openai'
                      ? 'border-indigo-600 dark:border-indigo-400 bg-indigo-50/60 dark:bg-indigo-900/30 ring-2 ring-indigo-500/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 bg-white dark:bg-gray-750'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-gray-900 dark:text-white">OpenAI ChatGPT</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
                      GPT-4o
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400">
                    {lang === 'en' ? 'Requires an OpenAI platform API account.' : 'Nécessite un compte API OpenAI actif.'}
                  </p>
                </div>

                {/* Anthropic Card */}
                <div
                  onClick={() => setSelectedAiModel('anthropic')}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                    selectedAiModel === 'anthropic'
                      ? 'border-indigo-600 dark:border-indigo-400 bg-indigo-50/60 dark:bg-indigo-900/30 ring-2 ring-indigo-500/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 bg-white dark:bg-gray-750'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-gray-900 dark:text-white">Anthropic Claude</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
                      Claude 3.5
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400">
                    {lang === 'en' ? 'Requires an Anthropic Claude console key.' : 'Nécessite une clé Anthropic Console.'}
                  </p>
                </div>
              </div>

              {/* Free Gemini Helper Banner */}
              {selectedAiModel === 'gemini' && (
                <div className="p-4 bg-indigo-50/80 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800/60 rounded-2xl flex items-center justify-between flex-wrap gap-3">
                  <div className="space-y-0.5">
                    <p className="text-xs font-bold text-indigo-900 dark:text-indigo-300">
                      {t.onboardingFreeGeminiHelp}
                    </p>
                    <p className="text-[11px] text-indigo-700 dark:text-indigo-400">
                      {lang === 'en' ? 'Click below to open Google AI Studio and generate your free key in 1 click.' : 'Cliquez ci-dessous pour ouvrir Google AI Studio et créer votre clé gratuite en 1 clic.'}
                    </p>
                  </div>
                  <a
                    href="https://aistudio.google.com/app/apikey"
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => openExternalLink("https://aistudio.google.com/app/apikey", e)}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer"
                  >
                    {t.onboardingGetFreeGeminiBtn}
                  </a>
                </div>
              )}

              {/* Selected Key Input */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300">
                  {selectedAiModel === 'gemini' 
                    ? t.geminiKeyLabel 
                    : selectedAiModel === 'openai' 
                    ? t.openAiKeyLabel 
                    : t.anthropicKeyLabel}
                </label>

                <div className="relative">
                  <input
                    type={showApiKey ? 'text' : 'password'}
                    placeholder={
                      selectedAiModel === 'gemini'
                        ? t.geminiKeyPlaceholder
                        : selectedAiModel === 'openai'
                        ? t.openAiKeyPlaceholder
                        : t.anthropicKeyPlaceholder
                    }
                    className="w-full p-3.5 pr-11 text-xs font-mono rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 outline-none focus:ring-2 focus:ring-indigo-500"
                    value={
                      selectedAiModel === 'gemini'
                        ? apiKey
                        : selectedAiModel === 'openai'
                        ? openAiKey
                        : anthropicKey
                    }
                    onChange={(e) => {
                      if (selectedAiModel === 'gemini') setApiKey(e.target.value);
                      else if (selectedAiModel === 'openai') setOpenAiKey(e.target.value);
                      else setAnthropicKey(e.target.value);
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowApiKey(!showApiKey)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 cursor-pointer p-1"
                    title={showApiKey ? 'Hide' : 'Show'}
                  >
                    {showApiKey ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Privacy / Security Notice */}
              <div className="p-4 bg-emerald-50/80 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/40 rounded-2xl flex items-start gap-3">
                <ShieldCheck size={20} className="text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <div className="text-xs text-emerald-900 dark:text-emerald-300 space-y-0.5">
                  <p className="font-semibold">{t.apiKeyPrivacyNote}</p>
                  <p className="text-emerald-700 dark:text-emerald-400 text-[11px]">
                    {lang === 'en' 
                      ? 'All AI calls are executed securely directly from your browser session.' 
                      : 'Les requêtes IA sont exécutées de manière sécurisée directement depuis votre session de navigation.'}
                  </p>
                </div>
              </div>

              {/* Navigation & Launch */}
              <div className="pt-4 flex items-center justify-between flex-wrap gap-4 border-t border-gray-100 dark:border-gray-700">
                <button
                  type="button"
                  onClick={() => setActiveStep(2)}
                  className="px-5 py-2.5 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl text-xs font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <ArrowLeft size={14} /> {t.onboardingPrevBtn}
                </button>

                <button
                  type="button"
                  onClick={onComplete}
                  className="px-7 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 shadow-lg shadow-emerald-500/20 transition-all cursor-pointer"
                >
                  <Rocket size={16} /> {t.onboardingCompleteBtn}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Global Footer Actions */}
        <div className="px-6 sm:px-8 py-4 bg-gray-50 dark:bg-gray-850 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <div className="w-32 bg-gray-200 dark:bg-gray-700 h-2 rounded-full overflow-hidden">
              <div 
                className="bg-indigo-600 dark:bg-indigo-400 h-full rounded-full transition-all duration-300"
                style={{ width: `${completionPercent}%` }}
              />
            </div>
            <span className="text-[11px] font-semibold text-gray-500 dark:text-gray-400">
              {completionPercent}% {lang === 'en' ? 'ready' : 'configuré'}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onSkip}
              className="text-xs text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 underline cursor-pointer"
            >
              {t.onboardingSkipBtn}
            </button>

            {activeStep < 3 && (
              <button
                type="button"
                onClick={onComplete}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer"
              >
                {t.onboardingCompleteBtn}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [isOnboardingCompleted, setIsOnboardingCompleted] = useState(() => {
    try {
      return localStorage.getItem('postutrack_onboarding_completed') === 'true';
    } catch (e) {
      return false;
    }
  });

  const [activeTab, setActiveTab] = useState(() => {
    try {
      const isCompleted = localStorage.getItem('postutrack_onboarding_completed') === 'true';
      return isCompleted ? 'dashboard' : 'onboarding';
    } catch (e) {
      return 'onboarding';
    }
  });

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingApplication, setEditingApplication] = useState(null);
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);
  const [resetSuccessNotice, setResetSuccessNotice] = useState(false);
  const [isStartupWarningDismissed, setIsStartupWarningDismissed] = useState(() => {
    try {
      return localStorage.getItem('postutrack_startup_warning_dismissed') === 'true';
    } catch (e) {
      return false;
    }
  });

  const handleDismissStartupWarning = () => {
    try {
      localStorage.setItem('postutrack_startup_warning_dismissed', 'true');
    } catch (e) {}
    setIsStartupWarningDismissed(true);
  };

  const handleCompleteOnboarding = () => {
    try {
      localStorage.setItem('postutrack_onboarding_completed', 'true');
    } catch (e) {}
    setIsOnboardingCompleted(true);
    setActiveTab('dashboard');
  };

  const handleSkipOnboarding = () => {
    try {
      localStorage.setItem('postutrack_onboarding_completed', 'true');
    } catch (e) {}
    setIsOnboardingCompleted(true);
    setActiveTab('dashboard');
  };

  // --- GESTION DE LA LANGUE (FR / EN) ---
  const [lang, setLang] = useState(() => {
    try {
      return localStorage.getItem('postutrack_lang') || 'fr';
    } catch (e) {
      return 'fr';
    }
  });

  const t = translations[lang] || translations.fr;

  const toggleLanguage = () => {
    const nextLang = lang === 'fr' ? 'en' : 'fr';
    setLang(nextLang);
    try {
      localStorage.setItem('postutrack_lang', nextLang);
    } catch (e) {}
  };

  // --- 1. SAUVEGARDE DES CANDIDATURES ---
  const [applications, setApplications] = useState(() => {
    try {
      const saved = localStorage.getItem('postutrack_applications');
      if (saved !== null) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          const mapped = parsed.map(app => ({
            ...app,
            source: app.source || 'LinkedIn',
            responseDate: app.responseDate || ''
          }));
          return autoApplyGhostStatus(mapped).updated;
        }
      }
    } catch (e) {
      console.error(e);
    }
    return autoApplyGhostStatus(DEFAULT_APPLICATIONS).updated;
  });

  // Automatically update any applications older than 2 weeks with no answers to "Ghosted"
  useEffect(() => {
    setApplications(prev => {
      const { updated, changed } = autoApplyGhostStatus(prev);
      return changed ? updated : prev;
    });
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('postutrack_applications', JSON.stringify(applications));
    } catch (e) {
      console.error(e);
    }
  }, [applications]);

  // --- 2. SAUVEGARDE DU PROFIL ---
  const [profile, setProfile] = useState(() => {
    try {
      const saved = localStorage.getItem('postutrack_profile');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return {
      fullName: 'Jean Dupont',
      email: '',
      phone: '',
      location: '',
      website: '',
      masterCV: '',
      masterLetter: ''
    };
  });

  const [savedNotice, setSavedNotice] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem('postutrack_profile', JSON.stringify(profile));
    } catch (e) {
      console.error(e);
    }
  }, [profile]);

  // --- REINITIALISATION COMPLETE DE L'APPLICATION ---
  const handleResetAllData = () => {
    try {
      localStorage.setItem('postutrack_applications', JSON.stringify([]));
      localStorage.setItem('postutrack_profile', JSON.stringify({
        fullName: '',
        email: '',
        phone: '',
        location: '',
        website: '',
        masterCV: '',
        masterLetter: ''
      }));
      localStorage.removeItem('postutrack_apikey');
      localStorage.removeItem('postutrack_openaikey');
      localStorage.removeItem('postutrack_anthropickey');
      localStorage.removeItem('postutrack_aimodel');
      localStorage.removeItem('postutrack_onboarding_completed');
      localStorage.removeItem('postutrack_startup_warning_dismissed');
    } catch (e) {
      console.error(e);
    }
    setApplications([]);
    setProfile({
      fullName: '',
      email: '',
      phone: '',
      location: '',
      website: '',
      masterCV: '',
      masterLetter: ''
    });
    setApiKey('');
    setOpenAiKey('');
    setAnthropicKey('');
    setSelectedAiModel('gemini');
    setBaseCV('');
    setBaseLetter('');
    setAiResult(null);
    setAiError('');
    setIsOnboardingCompleted(false);
    setIsStartupWarningDismissed(false);
    setIsResetConfirmOpen(false);
    setActiveTab('onboarding');
    setResetSuccessNotice(true);
    setTimeout(() => setResetSuccessNotice(false), 4000);
  };

  // --- 3. SAUVEGARDE DES CLÉS API ET DU MODÈLE ---
  const [apiKey, setApiKey] = useState(() => {
    try { return localStorage.getItem('postutrack_apikey') || ''; } catch (e) { return ''; }
  });
  const [openAiKey, setOpenAiKey] = useState(() => {
    try { return localStorage.getItem('postutrack_openaikey') || ''; } catch (e) { return ''; }
  });
  const [anthropicKey, setAnthropicKey] = useState(() => {
    try { return localStorage.getItem('postutrack_anthropickey') || ''; } catch (e) { return ''; }
  });
  const [selectedAiModel, setSelectedAiModel] = useState(() => {
    try { return localStorage.getItem('postutrack_aimodel') || 'gemini'; } catch (e) { return 'gemini'; }
  });

  useEffect(() => {
    try {
      localStorage.setItem('postutrack_apikey', apiKey);
      localStorage.setItem('postutrack_openaikey', openAiKey);
      localStorage.setItem('postutrack_anthropickey', anthropicKey);
      localStorage.setItem('postutrack_aimodel', selectedAiModel);
    } catch (e) {
      console.error(e);
    }
  }, [apiKey, openAiKey, anthropicKey, selectedAiModel]);

  const [selectedAppId, setSelectedAppId] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [jobUrl, setJobUrl] = useState('');
  const [isExtracting, setIsExtracting] = useState(false);
  
  // AI CV States
  const [baseCV, setBaseCV] = useState(profile.masterCV || '');
  const [isLoadingAI, setIsLoadingAI] = useState(false);
  const [aiResult, setAiResult] = useState(null);
  const [aiError, setAiError] = useState('');
  const [isPrinting, setIsPrinting] = useState(false);
  
  const [cvDensity, setCvDensity] = useState('expanded');
  const [modificationStrategy, setModificationStrategy] = useState('balanced');
  const [keywordDensity, setKeywordDensity] = useState('moderate');
  const [customInstruction, setCustomInstruction] = useState('');

  // AI Letter States
  const [generationMode, setGenerationMode] = useState('cv'); // 'cv' or 'letter'
  const [baseLetter, setBaseLetter] = useState(profile.masterLetter || '');
  const [letterTone, setLetterTone] = useState('professional');
  const [isCopied, setIsCopied] = useState(false);

  // --- SAUVEGARDE ET EXPORTS AVEC DÉLAIS DE RÉPONSE ---
  const handleExportData = () => {
    // Calcul et enrichissement des candidatures avec les délais de réponse
    const enrichedApplications = applications.map(app => {
      const respDays = getResponseDays(app);
      return {
        ...app,
        responseTimeDays: respDays !== null ? respDays : null,
        responseTimeFormatted: respDays !== null 
          ? `${respDays} ${lang === 'en' ? (respDays <= 1 ? 'day' : 'days') : (respDays <= 1 ? 'jour' : 'jours')}` 
          : (lang === 'en' ? 'Pending' : 'En attente')
      };
    });

    const responseTimesList = enrichedApplications
      .map(a => a.responseTimeDays)
      .filter(d => d !== null && !isNaN(d));

    const avgTime = responseTimesList.length > 0
      ? parseFloat((responseTimesList.reduce((a, b) => a + b, 0) / responseTimesList.length).toFixed(1))
      : null;

    const backup = {
      exportDate: new Date().toISOString(),
      formatVersion: "2.0",
      analytics: {
        totalApplications: applications.length,
        answeredApplications: responseTimesList.length,
        averageResponseTimeDays: avgTime
      },
      applications: enrichedApplications,
      profile: profile
    };
    
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `PostuTrack_Backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportCSV = () => {
    if (!applications || applications.length === 0) {
      alert(t.noApplicationsToExport);
      return;
    }

    const isEn = lang === 'en';
    const headers = [
      isEn ? 'Company' : 'Entreprise',
      isEn ? 'Position' : 'Poste',
      isEn ? 'Status' : 'Statut',
      isEn ? 'Contract' : 'Type de contrat',
      isEn ? 'Application Platform / ATS' : 'Site de candidature (ATS / Plateforme)',
      isEn ? 'Application Date' : 'Date de candidature',
      isEn ? 'Response Date' : 'Date de réponse',
      isEn ? 'Response Time (Days)' : 'Délai de réponse (Jours)',
      isEn ? 'Response Time (Formatted)' : 'Délai de réponse (Formaté)',
      isEn ? 'Location' : 'Localisation',
      isEn ? 'Listing URL' : 'Lien de l\'offre'
    ];

    const rows = applications.map(app => {
      const respDays = getResponseDays(app);
      const respDaysFormatted = respDays !== null 
        ? `${respDays} ${isEn ? (respDays <= 1 ? 'day' : 'days') : (respDays <= 1 ? 'jour' : 'jours')}` 
        : (isEn ? 'Pending' : 'En attente');

      return [
        app.company || '',
        app.role || '',
        getStatusLabel(app.status, t),
        getContractLabel(app.type, t),
        getSourceLabel(app.source || 'LinkedIn', t),
        app.date || '',
        app.responseDate || '',
        respDays !== null ? respDays : '',
        respDaysFormatted,
        app.location || '',
        app.url || ''
      ].map(val => {
        const str = String(val ?? '').replace(/"/g, '""');
        return `"${str}"`;
      }).join(';');
    });

    const csvContent = '\uFEFF' + [headers.map(h => `"${h}"`).join(';'), ...rows].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `PostuTrack_Candidatures_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportData = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const backup = JSON.parse(event.target.result);
        if (backup.applications && Array.isArray(backup.applications)) {
          setApplications(autoApplyGhostStatus(backup.applications).updated);
        }
        if (backup.profile) setProfile(backup.profile);
        
        setSavedNotice(true);
        setTimeout(() => setSavedNotice(false), 3000);
      } catch (err) {
        alert(t.backupInvalidError);
      }
    };
    reader.readAsText(file);
    e.target.value = ''; 
  };

  // --- 4. GESTION DU THÈME SOMBRE DIRECTE ---
  const [theme, setTheme] = useState(() => {
    try { return localStorage.getItem('postutrack_theme') || 'light'; } catch (e) { return 'light'; }
  });

  const toggleTheme = () => {
    const nextTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(nextTheme);
    try { localStorage.setItem('postutrack_theme', nextTheme); } catch (e) {}
    
    if (nextTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const handleCopyLetter = () => {
    if (!aiResult?.coverLetter) return;
    const dateStr = new Date().toLocaleDateString(lang === 'en' ? 'en-US' : 'fr-FR');
    const datePrefix = lang === 'en' ? 'Date:' : 'le';
    const letterText = `${profile.fullName || (lang === 'en' ? 'Candidate' : 'Candidat')}
${profile.location || ''}
${profile.email || ''}
${profile.phone || ''}

${profile.location?.split(',')[0] || (lang === 'en' ? 'City' : 'Paris')}, ${datePrefix} ${dateStr}

${aiResult.coverLetter}`;

    navigator.clipboard.writeText(letterText).then(() => {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    });
  };

  useEffect(() => {
    if (!baseCV || baseCV === profile.masterCV) setBaseCV(profile.masterCV || '');
  }, [profile.masterCV]);

  useEffect(() => {
    if (!baseLetter || baseLetter === profile.masterLetter) setBaseLetter(profile.masterLetter || '');
  }, [profile.masterLetter]);

  const extractOfferFromUrl = async (urlToExtract) => {
    if (!urlToExtract) return;
    setIsExtracting(true);
    setJobDescription(t.extractingPage);
    
    try {
      const formatted = formatExternalUrl(urlToExtract);
      const proxyUrl = `https://r.jina.ai/${encodeURIComponent(formatted)}`;
      const response = await fetch(proxyUrl, {
        headers: { 'Accept': 'text/plain' }
      });
      
      if (!response.ok) throw new Error(t.networkExtractionError);
      
      let text = await response.text();
      
      text = text.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1'); 
      text = text.replace(/^(Accueil|Home|Connexion|Login|Emplois|Jobs|Rechercher|Search|Menu).*$/gim, ''); 
      text = text.replace(/(\n\s*){3,}/g, '\n\n'); 
      
      if (text && text.length > 100) {
        setJobDescription(text.trim().substring(0, 10000));
      } else {
        setJobDescription(t.extractedTooShort);
      }
    } catch (e) {
      console.error(e);
      setJobDescription(t.extractFailed);
    } finally {
      setIsExtracting(false);
    }
  };

  const handleSelectAssociatedApplication = (appId) => {
    setSelectedAppId(appId);
    if (!appId) {
      setJobUrl('');
      return;
    }
    const app = applications.find(a => a.id.toString() === appId.toString());
    if (app) {
      const targetUrl = app.url || '';
      setJobUrl(targetUrl);
      if (targetUrl) {
        extractOfferFromUrl(targetUrl);
      }
    }
  };

  const getInitials = (name) => {
    if (!name || typeof name !== 'string') return 'JD';
    return name.split(' ').map(n => n[0]).filter(Boolean).join('').substring(0, 2).toUpperCase() || 'JD';
  };

  const triggerPrint = () => {
    setIsPrinting(true);
    setTimeout(() => {
      window.print();
      setIsPrinting(false);
    }, 300);
  };

  useEffect(() => {
    if (!document.getElementById('pdfjs-script')) {
      const script = document.createElement('script');
      script.id = 'pdfjs-script';
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.min.js';
      script.onload = () => {
        if (window.pdfjsLib) {
          window.pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js';
        }
      };
      document.head.appendChild(script);
    }

    if (!document.getElementById('html2pdf-script')) {
      const script = document.createElement('script');
      script.id = 'html2pdf-script';
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js';
      document.head.appendChild(script);
    }
  }, []);

  const totalApplications = applications.length;
  const interviewsCount = applications.filter(app => app.status === 'Entretien' || app.status === 'Interview').length;
  const offersCount = applications.filter(app => app.status === 'Offre' || app.status === 'Offer').length;
  const rejectionsCount = applications.filter(app => app.status === 'Refusé' || app.status === 'Rejected').length;
  const ghostedCount = applications.filter(app => app.status === 'Ghosted' || app.status === 'Ghosté' || app.status === 'Sans réponse (Ghosté)' || app.status === 'Sans réponse').length;

  const answeredApps = useMemo(() => {
    return applications.filter(app => ['Entretien', 'Interview', 'Offre', 'Offer', 'Refusé', 'Rejected'].includes(app.status) || Boolean(app.responseDate));
  }, [applications]);

  const avgResponseDays = useMemo(() => {
    const responseTimes = answeredApps
      .map(getResponseDays)
      .filter(days => days !== null && !isNaN(days));

    return responseTimes.length > 0
      ? (responseTimes.reduce((acc, curr) => acc + curr, 0) / responseTimes.length).toFixed(1)
      : null;
  }, [answeredApps]);

  const overallReplyRate = useMemo(() => {
    if (totalApplications === 0) return 0;
    return Math.round((answeredApps.length / totalApplications) * 100);
  }, [answeredApps.length, totalApplications]);

  const sourceStats = useMemo(() => {
    const map = {};

    applications.forEach(app => {
      const rawSource = app.source || 'Workday';
      if (!map[rawSource]) {
        map[rawSource] = {
          source: rawSource,
          total: 0,
          interviews: 0,
          offers: 0,
          rejections: 0,
          ghosted: 0,
          pending: 0,
          answered: 0,
          responseTimes: []
        };
      }
      const item = map[rawSource];
      item.total += 1;

      const isInterview = app.status === 'Entretien' || app.status === 'Interview';
      const isOffer = app.status === 'Offre' || app.status === 'Offer';
      const isRejected = app.status === 'Refusé' || app.status === 'Rejected';
      const isGhosted = app.status === 'Ghosted' || app.status === 'Ghosté' || app.status === 'Sans réponse (Ghosté)' || app.status === 'Sans réponse';
      const isAnswered = isInterview || isOffer || isRejected || Boolean(app.responseDate);

      if (isInterview) item.interviews += 1;
      if (isOffer) item.offers += 1;
      if (isRejected) item.rejections += 1;
      if (isGhosted) item.ghosted += 1;

      if (isAnswered) {
        item.answered += 1;
        const days = getResponseDays(app);
        if (days !== null && !isNaN(days)) {
          item.responseTimes.push(days);
        }
      } else {
        item.pending += 1;
      }
    });

    const list = Object.values(map).map(item => {
      const replyRate = item.total > 0 ? Math.round((item.answered / item.total) * 100) : 0;
      const positiveCount = item.interviews + item.offers;
      const positiveRate = item.total > 0 ? Math.round((positiveCount / item.total) * 100) : 0;
      const avgDays = item.responseTimes.length > 0
        ? (item.responseTimes.reduce((a, b) => a + b, 0) / item.responseTimes.length).toFixed(1)
        : null;
      return {
        ...item,
        replyRate,
        positiveCount,
        positiveRate,
        avgDays
      };
    });

    list.sort((a, b) => b.total - a.total);

    let mostReplies = null;
    let leastReplies = null;

    if (list.length > 0) {
      const sortedByReplies = [...list].sort((a, b) => {
        if (b.replyRate !== a.replyRate) return b.replyRate - a.replyRate;
        return b.answered - a.answered;
      });
      mostReplies = sortedByReplies[0];

      const sortedByLeast = [...list].sort((a, b) => {
        if (a.replyRate !== b.replyRate) return a.replyRate - b.replyRate;
        return a.answered - b.answered;
      });
      leastReplies = sortedByLeast[0];
    }

    return { list, mostReplies, leastReplies };
  }, [applications]);

  const handleInlineStatusChange = (appId, newStatus) => {
    const isAnswered = ['Entretien', 'Interview', 'Offre', 'Offer', 'Refusé', 'Rejected'].includes(newStatus);
    const todayStr = new Date().toISOString().split('T')[0];
    setApplications(prev => prev.map(item => {
      if (item.id !== appId) return item;
      return {
        ...item,
        status: newStatus,
        responseDate: isAnswered ? todayStr : '',
        statusModifiedAt: todayStr
      };
    }));
  };

  const parseAndFillProfile = (text) => {
    const emailMatch = text.match(/[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+/);
    const email = emailMatch ? emailMatch[0] : '';

    const phoneMatch = text.match(/(?:(?:\+|00)33|0)\s*[1-9](?:[\s.-]*\d{2}){4}/);
    const phone = phoneMatch ? phoneMatch[0] : '';

    const webMatch = text.match(/(?:https?:\/\/)?(?:www\.)?(?:github\.com|linkedin\.com\/in|gitlab\.com|portfolio)[^\s]+/i);
    const website = webMatch ? webMatch[0] : '';

    const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
    let fullName = '';
    
    for (let i = 0; i < Math.min(10, lines.length); i++) {
      const line = lines[i];
      const isEmail = line.includes('@');
      const hasNumbers = /\d/.test(line);
      const isURL = line.toLowerCase().includes('http') || line.toLowerCase().includes('www') || line.toLowerCase().includes('linkedin');
      const isBlacklisted = /curriculum vitae|profil|cv|resume|job|stage|emploi|alternance|étudiant|candidate/i.test(line);
      const wordCount = line.split(/\s+/).length;
      
      if (line.length > 2 && line.length < 40 && wordCount >= 1 && wordCount <= 4 && !isEmail && !hasNumbers && !isURL && !isBlacklisted) {
        if (/^[a-zA-ZÀ-ÿ\s-]+$/.test(line)) {
          fullName = line;
          break; 
        }
      }
    }

    if (!fullName) {
      const nameMatch = text.match(/\b([A-Z][a-zÀ-ÿ-]+(?:\s+[A-ZÀ-Ÿ-]{2,})+)\b/);
      if (nameMatch) {
        fullName = nameMatch[1].trim();
      }
    }

    setProfile(prev => ({
      ...prev,
      masterCV: text,
      email: email || prev.email,
      phone: phone || prev.phone,
      website: website || prev.website,
      fullName: fullName || prev.fullName
    }));
    setBaseCV(text);
  };

  const processFile = async (file, targetStateSetter) => {
    if (!file) return;
    
    if (file.type === 'application/pdf' || file.name.endsWith('.pdf')) {
      if (!window.pdfjsLib) {
        if (targetStateSetter === setProfile) {
          setProfile(p => ({ ...p, masterCV: t.pdfLoading }));
        } else {
          targetStateSetter(t.pdfLoading);
        }
        return;
      }
      const reader = new FileReader();
      reader.onload = async (event) => {
        try {
          const typedarray = new Uint8Array(event.target.result);
          const pdf = await window.pdfjsLib.getDocument(typedarray).promise;
          let fullText = "";
          for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const textContent = await page.getTextContent();
            
            let pageText = "";
            let lastY = -1;
            
            for (const item of textContent.items) {
              if (lastY !== -1 && Math.abs(lastY - item.transform[5]) > 4) {
                pageText += "\n";
              } else if (lastY !== -1) {
                pageText += " "; 
              }
              pageText += item.str;
              lastY = item.transform[5];
            }
            
            fullText += pageText + "\n\n";
          }
          if (targetStateSetter === setProfile) {
            parseAndFillProfile(fullText);
          } else {
            targetStateSetter(fullText);
          }
        } catch (error) {
          console.error(error);
        }
      };
      reader.readAsArrayBuffer(file);
    } else {
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target.result;
        if (targetStateSetter === setProfile) parseAndFillProfile(text);
        else targetStateSetter(text);
      };
      reader.readAsText(file);
    }
  };

  const handleFileUpload = async (e, targetStateSetter) => {
    const file = e.target.files[0];
    if (!file) return;
    await processFile(file, targetStateSetter);
    e.target.value = '';
  };

  const handleExtractUrl = async () => {
    if (!jobUrl) return;
    await extractOfferFromUrl(jobUrl);
  };

  const handleGenerateAI = async (e) => {
    e.preventDefault();
    
    if (selectedAiModel === 'gemini' && !apiKey.trim()) return setAiError(t.missingGeminiKey);
    if (selectedAiModel === 'openai' && !openAiKey.trim()) return setAiError(t.missingOpenAiKey);
    if (selectedAiModel === 'anthropic' && !anthropicKey.trim()) return setAiError(t.missingAnthropicKey);

    if (!jobDescription.trim()) {
      setAiError(t.missingJobDesc);
      return;
    }
    
    setIsLoadingAI(true);
    setAiResult(null);
    setAiError('');

    const targetApp = applications.find(a => a.id.toString() === selectedAppId);
    const companyName = targetApp ? targetApp.company : (lang === 'en' ? 'the company' : "l'entreprise");
    const roleName = targetApp ? targetApp.role : (lang === 'en' ? 'the position' : 'le poste');

    const customPromptStr = customInstruction.trim() ? `\nCUSTOM INSTRUCTIONS FROM CANDIDATE / CONSIGNES SUPPLÉMENTAIRES :\n${customInstruction}\n` : "";
    const isEn = lang === 'en';

    try {
      let prompt = "";
      let responseSchema = {};

      if (generationMode === 'cv') {
        const densityInstructions = isEn
          ? (cvDensity === 'expanded'
              ? "Resume Density: Write rich bullet points (3-4 bullets per experience) to fill one full A4 page without spilling onto a 2nd page."
              : cvDensity === 'compact'
              ? "Resume Density: Be extremely concise (1-2 very short bullets per role) to fit strictly on a single A4 page."
              : "Resume Density: Balanced content to fit exactly on ONE A4 page.")
          : (cvDensity === 'expanded'
              ? "Consigne CV : Rédige des descriptions riches (3 à 4 puces par expérience). Objectif : remplir harmonieusement une page entière A4."
              : cvDensity === 'compact'
              ? "Consigne CV : Sois extrêmement CONCIS et synthétique (1 à 2 puces très courtes par expérience) pour tenir sur UNE SEULE PAGE A4 stricte."
              : "Consigne CV : Équilibre le contenu pour remplir exactement UNE SEULE PAGE A4, ni plus, ni moins.");

        const modificationInstructions = isEn
          ? (modificationStrategy === 'strict'
              ? "Fidelity: STRICT PRESERVATION. Do not delete existing skills or experiences from master CV. Only add relevant elements."
              : modificationStrategy === 'rewrite'
              ? "Fidelity: TOTAL ADAPTATION. Filter and rewrite master CV to match 100% with the job requirements."
              : "Fidelity: BALANCED FUSION. Adapt existing experiences to highlight relevant skills while preserving authenticity.")
          : (modificationStrategy === 'strict'
              ? "Consigne Modification : CONSERVATION STRICTE. Ne supprime AUCUNE compétence ou expérience du CV maître."
              : modificationStrategy === 'rewrite'
              ? "Consigne Modification : ADAPTATION TOTALE. Filtre et adapte les infos pour coller à 100% à l'offre."
              : "Consigne Modification : FUSION ÉQUILIBRÉE. Adapte l'existant sans perdre l'essence du profil.");

        const keywordInstructions = isEn
          ? (keywordDensity === 'high'
              ? "ATS Keywords: MAXIMUM INJECTION. Insert as many keywords from the job listing into achievements and skills as possible."
              : keywordDensity === 'low'
              ? "ATS Keywords: SUBTLE INJECTION. Add 2-3 key keywords organically."
              : "ATS Keywords: MODERATE INJECTION. Add primary keywords naturally where appropriate.")
          : (keywordDensity === 'high'
              ? "Consigne ATS : INJECTION MAXIMALE. Insère autant de mots-clés de l'offre que possible."
              : keywordDensity === 'low'
              ? "Consigne ATS : INJECTION SUBTILE. Ajoute uniquement 2 ou 3 mots-clés essentiels."
              : "Consigne ATS : INJECTION MODÉRÉE. Ajoute les mots-clés principaux de l'offre de façon naturelle.");

        const langDirective = isEn
          ? "CRITICAL LANGUAGE REQUIREMENT: All generated texts (summary, achievements, education descriptions, skills categories) MUST be written in ENGLISH unless instructed otherwise."
          : "CONSIGNE DE LANGUE : Rédige l'ensemble du résultat en FRANÇAIS sauf consigne explicite contraire.";

        const categorySkillsDefault = isEn ? 'SKILLS' : 'COMPÉTENCES';

        prompt = `Act as an expert recruiter and ATS resume optimization specialist. Analyze the job posting for "${companyName}" for the role of "${roleName}":
        
JOB DESCRIPTION / OFFRE D'EMPLOI:
${jobDescription}

CANDIDATE PROFILE & MASTER RESUME / PROFIL ET CV MAÎTRE:
Name : ${profile.fullName}
Email : ${profile.email}
Phone : ${profile.phone}
Location : ${profile.location}
Master CV Content :
${baseCV || profile.masterCV}

${langDirective}
${densityInstructions}
${modificationInstructions}
${keywordInstructions}
Skill categories rule: Main skills category MUST be named '${categorySkillsDefault}'. Other groups can be 'TOOLS', 'LANGUAGES' (or 'OUTILS', 'LANGUES' in French).
${customPromptStr}

STRICT GENERATION RULES:
1. You MUST extract, structure, and include ALL professional experiences, education history, and skills from the Master CV into the JSON output. Under NO circumstance should "experiences", "education", or "skills" arrays be empty if data exists in the Master CV.
2. "summary" is a concise, professional 2-to-3 sentence introductory hook tailored to the position.
3. CRITICAL: Output ONLY the clean, final polished text. NEVER include word counts, notes in parentheses like "(43 mots respectés)", self-corrections, thoughts, or commentary ("No, wait", "Let's cleanly put...").
4. If the offer specifies contract duration/type/start date, mention it succinctly in the summary.
5. Sort professional experiences and education in reverse chronological order (most recent first).
6. Return ONLY a valid JSON object matching the schema.`;

        responseSchema = {
          type: "OBJECT",
          required: ["matchScore", "analysisSummary", "injectedKeywords", "cv"],
          properties: {
            matchScore: { type: "INTEGER" },
            analysisSummary: { type: "STRING" },
            injectedKeywords: { type: "ARRAY", items: { type: "STRING" } },
            cv: {
              type: "OBJECT",
              required: ["fullName", "summary", "experiences", "education", "skills"],
              properties: {
                fullName: { type: "STRING" },
                summary: { type: "STRING" },
                experiences: {
                  type: "ARRAY",
                  items: {
                    type: "OBJECT",
                    required: ["role", "company", "period", "achievements"],
                    properties: {
                      role: { type: "STRING" },
                      company: { type: "STRING" },
                      period: { type: "STRING" },
                      achievements: { type: "ARRAY", items: { type: "STRING" } }
                    }
                  }
                },
                education: {
                  type: "ARRAY",
                  items: {
                    type: "OBJECT",
                    required: ["degree", "school", "year"],
                    properties: {
                      degree: { type: "STRING" },
                      school: { type: "STRING" },
                      year: { type: "STRING" },
                      description: { type: "STRING" }
                    }
                  }
                },
                skills: { 
                  type: "ARRAY", 
                  items: { 
                    type: "OBJECT", 
                    required: ["category", "items"],
                    properties: {
                      category: { type: "STRING" },
                      items: { type: "ARRAY", items: { type: "STRING" } }
                    } 
                  } 
                }
              }
            }
          }
        };
      } else {
        const toneInstructions = isEn
          ? (letterTone === 'audacious'
              ? "Tone: Bold, punchy, direct and compelling."
              : letterTone === 'original'
              ? "Tone: Creative, original, storytelling approach."
              : "Tone: Professional, formal, structured, and polite.")
          : (letterTone === 'audacious'
              ? "Ton audacieux, percutant et direct."
              : letterTone === 'original'
              ? "Ton original, créatif et narratif."
              : "Ton professionnel, structuré, formel et rigoureux.");

        const langDirective = isEn
          ? "CRITICAL LANGUAGE REQUIREMENT: Write the cover letter in fluent, high-quality ENGLISH."
          : "CONSIGNE DE LANGUE : Rédige la lettre de motivation en FRANÇAIS.";

        prompt = `Act as an expert career advisor. Write a tailored cover letter (maximum 1 single A4 page) for "${companyName}" for the position "${roleName}".
        
JOB DESCRIPTION:
${jobDescription}

CANDIDATE RESUME PROFILE:
${baseCV || profile.masterCV}

MASTER COVER LETTER (Style/Tone baseline):
${baseLetter || profile.masterLetter || "Generate directly from the resume and job requirements."}

${langDirective}
${toneInstructions}
${customPromptStr}

STRICT FORMAT RULES:
1. Do NOT include top headers (Candidate name, address, date) because they are formatted automatically by the layout. Start directly with the formal salutation (e.g. "Dear Hiring Manager," or "Madame, Monsieur,").
2. End with an appropriate formal closing and signature (e.g. "Sincerely, [Candidate Name]" or "Je vous prie d'agréer...").
3. Use clear paragraphs separated by double line breaks (\\n\\n).
4. Return ONLY valid JSON.`;

        responseSchema = {
          type: "OBJECT",
          properties: {
            coverLetter: { type: "STRING" }
          }
        };
      }

      let text = "";
      const finalPrompt = selectedAiModel !== 'gemini' 
        ? `${prompt}\n\nSTRICT JSON SCHEMA TO FOLLOW :\n${JSON.stringify(responseSchema, null, 2)}` 
        : prompt;

      if (selectedAiModel === 'gemini') {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=${apiKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: finalPrompt }] }],
            generationConfig: { temperature: 0.1, responseMimeType: "application/json", responseSchema }
          })
        });
        const result = await response.json();
        if (!response.ok) throw new Error(result.error?.message || "Error connecting to Gemini API.");
        text = result?.candidates?.[0]?.content?.parts?.[0]?.text;

      } else if (selectedAiModel === 'openai') {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json', 
            'Authorization': `Bearer ${openAiKey}` 
          },
          body: JSON.stringify({
            model: "gpt-4o-mini",
            temperature: 0.1,
            response_format: { type: "json_object" },
            messages: [{ role: "user", content: finalPrompt }]
          })
        });
        const result = await response.json();
        if (!response.ok) throw new Error(result.error?.message || "Error connecting to OpenAI API.");
        text = result.choices[0].message.content;

      } else if (selectedAiModel === 'anthropic') {
        const response = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': anthropicKey,
            'anthropic-version': '2023-06-01',
            'anthropic-dangerously-allow-browser': 'true'
          },
          body: JSON.stringify({
            model: "claude-3-haiku-20240307",
            max_tokens: 4096,
            temperature: 0.1,
            system: "Return ONLY a valid JSON object matching the requested schema without any markdown formatting or extra text.",
            messages: [{ role: "user", content: finalPrompt }]
          })
        });
        const result = await response.json();
        if (!response.ok) throw new Error(result.error?.message || "Error connecting to Anthropic API.");
        text = result.content[0].text;
      }

      if (text) {
        let parsed;
        text = text.trim();
        if (text.startsWith('```json')) text = text.substring(7);
        if (text.startsWith('```')) text = text.substring(3);
        if (text.endsWith('```')) text = text.substring(0, text.length - 3);
        text = text.trim();

        try {
          parsed = JSON.parse(text);
        } catch (e) {
          try {
            const match = text.match(/\{[\s\S]*\}/);
            if (match) parsed = JSON.parse(match[0]);
            else throw e;
          } catch (e2) {
            console.error("Raw AI response:", text);
            throw new Error(t.invalidAiJson);
          }
        }
        
        if (generationMode === 'cv' && (!parsed || !parsed.cv)) {
          throw new Error(`${t.noDataReturned} ${t.pasteOfferManuallyTip}`);
        }
        if (generationMode === 'letter' && (!parsed || !parsed.coverLetter)) {
          throw new Error(`${t.noDataReturned} ${t.pasteOfferManuallyTip}`);
        }
        
        if (parsed.cv) {
          parsed.cv.fullName = profile.fullName;
          parsed.cv.email = profile.email;
          parsed.cv.phone = profile.phone;
          parsed.cv.location = profile.location;
          parsed.cv.website = profile.website;

          if (typeof parsed.cv.summary === 'string') {
            parsed.cv.summary = parsed.cv.summary
              .replace(/\([^)]*mots?[^)]*\)/gi, '')
              .replace(/No,?\s*wait:?/gi, '')
              .replace(/Let's cleanly put[^:]*:/gi, '')
              .trim();
          }
        }
        setAiResult(parsed);
      } else {
        throw new Error(`${t.noDataReturned} ${t.pasteOfferManuallyTip}`);
      }
    } catch (err) {
      console.error(err);
      setAiError(`${t.generationError}: ${err.message}`);
    } finally {
      setIsLoadingAI(false);
    }
  };

  const handleExportRenderCV = () => {
    if (!aiResult || !aiResult.cv) return;
    const cv = aiResult.cv;
    let yaml = `cv:\n  name: "${cv.fullName}"\n  location: "${cv.location}"\n  email: "${cv.email}"\n  phone: "${cv.phone}"\n`;
    const blob = new Blob([yaml], { type: 'text/yaml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `CV_rendercv.yaml`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const renderCVTemplate = () => {
    const cv = aiResult?.cv;
    if (!cv) return null;

    const displayName = cv.fullName || profile.fullName || (lang === 'en' ? 'Candidate' : 'Candidat');
    const displayLocation = cv.location || profile.location;
    const displayEmail = cv.email || profile.email;
    const displayPhone = cv.phone || profile.phone;
    const displayWebsite = cv.website || profile.website;

    let structuredSkills = [];
    if (cv.skills && cv.skills.length > 0) {
      if (typeof cv.skills[0] === 'string') {
        structuredSkills = [{ category: t.skillsDefaultCategory, items: cv.skills }];
      } else {
        structuredSkills = cv.skills;
      }
    }

    return (
      <div className="w-full flex justify-center bg-gray-100 dark:bg-gray-900 p-2 sm:p-6 md:p-8 overflow-x-auto print:p-0 print:bg-white print:overflow-visible">
        <style dangerouslySetInnerHTML={{__html: `
          @media print {
            @page {
              size: A4 portrait;
              margin: 0mm;
            }
            body {
              margin: 0;
              background-color: white !important;
            }
          }
        `}} />

        <div 
          id="cv-render" 
          className="bg-white border border-gray-300 p-6 sm:p-8 md:p-10 w-full max-w-[210mm] min-h-[297mm] box-border shadow-md text-black font-serif select-text print:border-none print:shadow-none print:p-8 print:m-0 print:w-[210mm] print:h-[297mm] print:absolute print:inset-0 flex flex-col gap-4"
          style={{ 
            userSelect: 'text', 
            WebkitUserSelect: 'text', 
            pageBreakAfter: 'avoid', 
            breakAfter: 'avoid', 
            pageBreakInside: 'avoid',
            breakInside: 'avoid'
          }}
        >
          {/* Header */}
          <div className="text-center mb-1">
            <h1 className="text-3xl font-normal mb-1">{displayName}</h1>
            <div className="text-[12px] flex justify-center items-center gap-3 flex-wrap text-gray-700">
              {displayLocation && <span>{displayLocation}</span>}
              {displayEmail && <span>| {displayEmail}</span>}
              {displayPhone && <span>| {displayPhone}</span>}
              {displayWebsite && <span>| {displayWebsite}</span>}
            </div>
          </div>
          
          {/* Summary */}
          {cv.summary && (
            <div>
              <p className="text-[12.5px] leading-relaxed text-justify">{cv.summary}</p>
            </div>
          )}

          {/* Experiences */}
          {cv.experiences && cv.experiences.length > 0 && (
            <div>
              <h3 className="text-[13.5px] font-bold uppercase border-b-2 border-black mb-2 pb-0.5 tracking-wider">
                {t.experienceTitle}
              </h3>
              <div className="flex flex-col gap-3">
                {cv.experiences.map((exp, idx) => (
                  <div key={idx}>
                    <div className="flex justify-between items-baseline mb-0.5">
                      <div className="font-bold text-[13px]">{exp.company}</div>
                      <div className="text-[12px] text-gray-700">{exp.period}</div>
                    </div>
                    <div className="italic text-[12.5px] mb-0.5 text-gray-800">{exp.role}</div>
                    <ul className="list-disc list-inside text-[12px] space-y-0.5 pl-1.5 text-gray-900">
                      {exp.achievements?.map((ach, i) => <li key={i} className="leading-snug">{ach}</li>)}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Education */}
          {cv.education && cv.education.length > 0 && (
            <div>
              <h3 className="text-[13.5px] font-bold uppercase border-b-2 border-black mb-2 pb-0.5 tracking-wider">
                {t.educationTitle}
              </h3>
              <div className="flex flex-col gap-2.5">
                {cv.education.map((edu, idx) => (
                  <div key={idx}>
                    <div className="flex justify-between items-baseline mb-0.5">
                      <strong className="text-[13px]">{edu.school}</strong>
                      <span className="text-[12px] text-gray-700">{edu.year}</span>
                    </div>
                    <div className="italic text-[12.5px] text-gray-800">{edu.degree}</div>
                    {edu.description && <p className="text-[12px] text-gray-700 mt-0.5 leading-snug">{edu.description}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Skills */}
          {structuredSkills.length > 0 && (
            <div>
              <h3 className="text-[13.5px] font-bold uppercase border-b-2 border-black mb-2 pb-0.5 tracking-wider">
                {t.skillsTitle}
              </h3>
              <div className="flex flex-col gap-1.5 text-[12px] w-full">
                {structuredSkills.map((group, idx) => (
                  <div key={idx} className="flex flex-row items-start">
                    <h4 className="font-bold uppercase w-[160px] shrink-0 text-right pr-4 leading-tight pt-[2px]">{group.category}</h4>
                    <div className="text-gray-800 leading-snug flex-1">
                      {group.items?.join(' • ')}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  const getTabHeading = () => {
    switch (activeTab) {
      case 'onboarding': return t.onboarding;
      case 'dashboard': return t.dashboard;
      case 'applications': return t.applications;
      case 'tailor': return t.tailor;
      case 'profile': return t.profile;
      default: return activeTab;
    }
  };

  const renderSidebar = () => (
    <aside className="w-64 xl:w-72 2xl:w-80 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 h-screen hidden md:flex flex-col sticky top-0 print:hidden transition-colors duration-200 shrink-0">
      <div className="p-5 xl:p-6 2xl:p-8">
        <h1 className="text-2xl xl:text-3xl font-bold text-blue-600 dark:text-blue-400 flex items-center gap-2 tracking-tight">
          PostuTrack
        </h1>
      </div>
      <nav className="flex-1 px-3 xl:px-4 space-y-1.5 xl:space-y-2">
        {(!isOnboardingCompleted || activeTab === 'onboarding') && (
          <button onClick={() => setActiveTab('onboarding')} className={`w-full flex items-center gap-3 px-3.5 xl:px-4 py-2.5 xl:py-3 2xl:py-3.5 rounded-xl text-left text-sm xl:text-base transition-colors cursor-pointer ${activeTab === 'onboarding' ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 font-semibold' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50 font-medium'}`}>
            <Rocket size={20} className="text-indigo-500 shrink-0" /> 
            <span className="truncate">{t.onboarding}</span>
          </button>
        )}
        <button onClick={() => setActiveTab('dashboard')} className={`w-full flex items-center gap-3 px-3.5 xl:px-4 py-2.5 xl:py-3 2xl:py-3.5 rounded-xl text-left text-sm xl:text-base transition-colors cursor-pointer ${activeTab === 'dashboard' ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 font-semibold' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50 font-medium'}`}>
          <LayoutDashboard size={20} className="shrink-0" /> 
          <span className="truncate">{t.dashboard}</span>
        </button>
        <button onClick={() => setActiveTab('applications')} className={`w-full flex items-center gap-3 px-3.5 xl:px-4 py-2.5 xl:py-3 2xl:py-3.5 rounded-xl text-left text-sm xl:text-base transition-colors cursor-pointer ${activeTab === 'applications' ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 font-semibold' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50 font-medium'}`}>
          <ListTodo size={20} className="shrink-0" /> 
          <span className="truncate">{t.applications}</span>
        </button>
        <button onClick={() => setActiveTab('tailor')} className={`w-full flex items-center gap-3 px-3.5 xl:px-4 py-2.5 xl:py-3 2xl:py-3.5 rounded-xl text-left text-sm xl:text-base transition-colors cursor-pointer ${activeTab === 'tailor' ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 font-semibold' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50 font-medium'}`}>
          <Sparkles size={20} className="text-amber-500 shrink-0" /> 
          <span className="truncate">{t.tailor}</span>
        </button>
        <button onClick={() => setActiveTab('profile')} className={`w-full flex items-center gap-3 px-3.5 xl:px-4 py-2.5 xl:py-3 2xl:py-3.5 rounded-xl text-left text-sm xl:text-base transition-colors cursor-pointer ${activeTab === 'profile' ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 font-semibold' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50 font-medium'}`}>
          <UserCheck size={20} className="text-emerald-500 shrink-0" /> 
          <span className="truncate">{t.profile}</span>
        </button>
      </nav>
    </aside>
  );

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-gray-900 font-sans flex text-gray-900 dark:text-gray-100 transition-colors duration-200">
      {renderSidebar()}
      <main className="flex-1 flex flex-col min-w-0">
        <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-20 px-3.5 sm:px-6 lg:px-8 2xl:px-10 py-3 sm:py-4 2xl:py-5 flex justify-between items-center print:hidden transition-colors duration-200">
          <div className="flex items-center gap-3">
            {/* Mobile Title Icon */}
            <div className="md:hidden font-extrabold text-blue-600 dark:text-blue-400 text-lg tracking-tight">PostuTrack</div>
            <h2 className="text-lg sm:text-xl 2xl:text-2xl font-bold text-gray-800 dark:text-white hidden md:block">
              {getTabHeading()}
            </h2>
          </div>
          
          <div className="flex items-center gap-2 sm:gap-3">
            {/* BOUTON GITHUB */}
            <a
              href="https://github.com/anirboukantar-del/postutrack-app"
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => openExternalLink("https://github.com/anirboukantar-del/postutrack-app", e)}
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 2xl:py-2 text-xs 2xl:text-sm font-semibold rounded-full border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/80 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white transition-all cursor-pointer shadow-xs shrink-0"
              title={t.viewOnGithub}
              aria-label={t.viewOnGithub}
            >
              <Github size={15} className="text-gray-800 dark:text-gray-200 shrink-0" />
              <span className="hidden sm:inline">GitHub</span>
            </a>

            {/* BOUTON DE CHANGEMENT DE LANGUE (FR / EN) */}
            <button 
              onClick={toggleLanguage} 
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 2xl:py-2 text-xs 2xl:text-sm font-semibold rounded-full border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/80 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all cursor-pointer shadow-xs shrink-0"
              title={t.switchLanguage}
              aria-label={t.switchLanguage}
            >
              <Languages size={15} className="text-blue-600 dark:text-blue-400 shrink-0" />
              <span className="flex items-center gap-1 tracking-wider text-[11px] sm:text-xs">
                <span className={lang === 'fr' ? 'font-bold text-blue-600 dark:text-blue-400' : 'text-gray-400 dark:text-gray-500'}>FR</span>
                <span className="text-gray-300 dark:text-gray-600 text-[10px]">|</span>
                <span className={lang === 'en' ? 'font-bold text-blue-600 dark:text-blue-400' : 'text-gray-400 dark:text-gray-500'}>EN</span>
              </span>
            </button>

            {/* BOUTON DU THÈME */}
            <button 
              onClick={toggleTheme} 
              className="p-1.5 sm:p-2 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors flex items-center justify-center cursor-pointer shrink-0"
              title={t.toggleTheme}
            >
              {theme === 'dark' ? <Sun size={18} className="text-yellow-400" /> : <Moon size={18} />}
            </button>

            {/* PROFIL AVATAR */}
            <div onClick={() => setActiveTab('profile')} className="flex items-center gap-1.5 sm:gap-2 cursor-pointer bg-blue-50 dark:bg-blue-900/30 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full border border-blue-100 dark:border-gray-700 hover:bg-blue-100 dark:hover:bg-gray-700 transition-colors shrink-0">
              <div className="w-6 h-6 sm:w-7 sm:h-7 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-[10px] sm:text-xs shrink-0">
                {getInitials(profile.fullName)}
              </div>
              <span className="text-xs 2xl:text-sm font-semibold text-blue-900 dark:text-blue-300 max-w-[80px] xs:max-w-[120px] sm:max-w-[160px] truncate">{profile.fullName || t.user}</span>
            </div>
          </div>
        </header>

        {/* Mobile Navigation Tabs */}
        <div className="md:hidden flex items-center gap-1 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-2 py-1.5 overflow-x-auto scrollbar-none print:hidden sticky top-[53px] z-10">
          {(!isOnboardingCompleted || activeTab === 'onboarding') && (
            <button onClick={() => setActiveTab('onboarding')} className={`px-3 py-2 text-xs font-semibold rounded-xl whitespace-nowrap flex items-center gap-1.5 min-h-[38px] transition-colors ${activeTab === 'onboarding' ? 'bg-indigo-50 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-300 shadow-2xs' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700/50'}`}>
              <Rocket size={14} className="shrink-0" />
              <span>{t.onboarding}</span>
            </button>
          )}
          <button onClick={() => setActiveTab('dashboard')} className={`px-3 py-2 text-xs font-semibold rounded-xl whitespace-nowrap flex items-center gap-1.5 min-h-[38px] transition-colors ${activeTab === 'dashboard' ? 'bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-300 shadow-2xs' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700/50'}`}>
            <LayoutDashboard size={14} className="shrink-0" />
            <span>{t.dashboard}</span>
          </button>
          <button onClick={() => setActiveTab('applications')} className={`px-3 py-2 text-xs font-semibold rounded-xl whitespace-nowrap flex items-center gap-1.5 min-h-[38px] transition-colors ${activeTab === 'applications' ? 'bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-300 shadow-2xs' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700/50'}`}>
            <ListTodo size={14} className="shrink-0" />
            <span>{t.applications}</span>
          </button>
          <button onClick={() => setActiveTab('tailor')} className={`px-3 py-2 text-xs font-semibold rounded-xl whitespace-nowrap flex items-center gap-1.5 min-h-[38px] transition-colors ${activeTab === 'tailor' ? 'bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-300 shadow-2xs' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700/50'}`}>
            <Sparkles size={14} className="text-amber-500 shrink-0" />
            <span>{t.tailor}</span>
          </button>
          <button onClick={() => setActiveTab('profile')} className={`px-3 py-2 text-xs font-semibold rounded-xl whitespace-nowrap flex items-center gap-1.5 min-h-[38px] transition-colors ${activeTab === 'profile' ? 'bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-300 shadow-2xs' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700/50'}`}>
            <UserCheck size={14} className="text-emerald-500 shrink-0" />
            <span>{t.profile}</span>
          </button>
        </div>

        <div className="flex-1 p-3.5 sm:p-5 md:p-6 lg:p-8 2xl:p-10 overflow-auto">
          {/* AVERTISSEMENT DE CONFIDENTIALITÉ & STOCKAGE LOCAL AU DÉMARRAGE */}
          {!isStartupWarningDismissed && (
            <div className="mb-6 p-4 sm:p-5 bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-amber-500/10 dark:from-amber-950/40 dark:via-amber-900/20 dark:to-amber-950/40 border border-amber-300 dark:border-amber-700/60 rounded-2xl shadow-xs max-w-6xl mx-auto animate-in fade-in slide-in-from-top-2 duration-300">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3.5">
                  <div className="p-2.5 bg-amber-500/20 dark:bg-amber-500/30 text-amber-700 dark:text-amber-300 rounded-xl shrink-0 mt-0.5 border border-amber-400/30">
                    <ShieldAlert size={22} className="text-amber-600 dark:text-amber-400" />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-sm sm:text-base font-bold text-amber-950 dark:text-amber-200 flex items-center gap-1.5">
                        <Lock size={15} className="text-amber-600 dark:text-amber-400" />
                        {t.startupPrivacyWarningTitle}
                      </h3>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-200/80 dark:bg-amber-900/60 text-amber-900 dark:text-amber-300 border border-amber-300 dark:border-amber-700">
                        100% Local
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm text-amber-900/90 dark:text-amber-200/90 leading-relaxed max-w-4xl">
                      {t.startupPrivacyWarningText}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={handleDismissStartupWarning}
                    className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer flex items-center gap-1.5 whitespace-nowrap"
                  >
                    <Check size={14} />
                    <span>{t.startupPrivacyWarningGotIt}</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleDismissStartupWarning}
                    className="p-1.5 text-amber-700/80 hover:text-amber-950 dark:text-amber-400 dark:hover:text-amber-200 hover:bg-amber-200/50 dark:hover:bg-amber-900/50 rounded-lg transition-colors cursor-pointer"
                    title={t.startupPrivacyWarningGotIt}
                    aria-label={t.startupPrivacyWarningGotIt}
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>
            </div>
          )}

          {resetSuccessNotice && (
            <div className="mb-6 p-4 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 rounded-xl text-sm font-medium flex items-center gap-2 max-w-4xl mx-auto shadow-xs">
              <CheckCircle size={20} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>{t.resetSuccessNotice}</span>
            </div>
          )}

          {activeTab === 'onboarding' && (
            <OnboardingStartingPage
              t={t}
              lang={lang}
              profile={profile}
              setProfile={setProfile}
              setApplications={setApplications}
              apiKey={apiKey}
              setApiKey={setApiKey}
              openAiKey={openAiKey}
              setOpenAiKey={setOpenAiKey}
              anthropicKey={anthropicKey}
              setAnthropicKey={setAnthropicKey}
              selectedAiModel={selectedAiModel}
              setSelectedAiModel={setSelectedAiModel}
              onComplete={handleCompleteOnboarding}
              onSkip={handleSkipOnboarding}
              processFile={processFile}
            />
          )}

          {activeTab === 'dashboard' && (
            <div className="space-y-6 sm:space-y-8 max-w-6xl xl:max-w-7xl 2xl:max-w-[1700px] mx-auto">
              {/* Top Metric Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-3 sm:gap-4 2xl:gap-6">
                {/* Total Applications */}
                <div className="bg-white dark:bg-gray-800 p-4 sm:p-5 2xl:p-6 rounded-2xl shadow-xs border border-gray-100 dark:border-gray-700/80 flex flex-col justify-between hover:shadow-md hover:border-blue-200 dark:hover:border-blue-800/60 transition-all">
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <span className="text-xs sm:text-sm font-semibold text-gray-600 dark:text-gray-400 leading-snug">{t.totalApplications}</span>
                    <div className="p-2 sm:p-2.5 bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 rounded-xl shrink-0">
                      <Briefcase className="w-4 h-4 sm:w-5 sm:h-5" />
                    </div>
                  </div>
                  <div>
                    <p className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">{totalApplications}</p>
                  </div>
                </div>

                {/* Interviews */}
                <div className="bg-white dark:bg-gray-800 p-4 sm:p-5 2xl:p-6 rounded-2xl shadow-xs border border-gray-100 dark:border-gray-700/80 flex flex-col justify-between hover:shadow-md hover:border-purple-200 dark:hover:border-purple-800/60 transition-all">
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <span className="text-xs sm:text-sm font-semibold text-gray-600 dark:text-gray-400 leading-snug">{t.interviews}</span>
                    <div className="p-2 sm:p-2.5 bg-purple-50 dark:bg-purple-900/40 text-purple-600 dark:text-purple-400 rounded-xl shrink-0">
                      <Clock className="w-4 h-4 sm:w-5 sm:h-5" />
                    </div>
                  </div>
                  <div>
                    <p className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">{interviewsCount}</p>
                  </div>
                </div>

                {/* Offers */}
                <div className="bg-white dark:bg-gray-800 p-4 sm:p-5 2xl:p-6 rounded-2xl shadow-xs border border-gray-100 dark:border-gray-700/80 flex flex-col justify-between hover:shadow-md hover:border-emerald-200 dark:hover:border-emerald-800/60 transition-all">
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <span className="text-xs sm:text-sm font-semibold text-gray-600 dark:text-gray-400 leading-snug">{t.offersReceived}</span>
                    <div className="p-2 sm:p-2.5 bg-emerald-50 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 rounded-xl shrink-0">
                      <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5" />
                    </div>
                  </div>
                  <div>
                    <p className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">{offersCount}</p>
                  </div>
                </div>

                {/* Rejections */}
                <div className="bg-white dark:bg-gray-800 p-4 sm:p-5 2xl:p-6 rounded-2xl shadow-xs border border-gray-100 dark:border-gray-700/80 flex flex-col justify-between hover:shadow-md hover:border-rose-200 dark:hover:border-rose-800/60 transition-all">
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <span className="text-xs sm:text-sm font-semibold text-gray-600 dark:text-gray-400 leading-snug">{t.rejections}</span>
                    <div className="p-2 sm:p-2.5 bg-rose-50 dark:bg-rose-900/40 text-rose-600 dark:text-rose-400 rounded-xl shrink-0">
                      <XCircle className="w-4 h-4 sm:w-5 sm:h-5" />
                    </div>
                  </div>
                  <div>
                    <p className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">{rejectionsCount}</p>
                  </div>
                </div>

                {/* Ghosted / Sans réponse */}
                <div className="bg-white dark:bg-gray-800 p-4 sm:p-5 2xl:p-6 rounded-2xl shadow-xs border border-gray-100 dark:border-gray-700/80 flex flex-col justify-between hover:shadow-md hover:border-slate-300 dark:hover:border-slate-600 transition-all">
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <span className="text-xs sm:text-sm font-semibold text-gray-600 dark:text-gray-400 leading-snug">{t.ghostedCountLabel || t.ghosted || 'Ghosté(s)'}</span>
                    <div className="p-2 sm:p-2.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl shrink-0">
                      <Ghost className="w-4 h-4 sm:w-5 sm:h-5" />
                    </div>
                  </div>
                  <div>
                    <p className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">{ghostedCount}</p>
                    <p className="text-[11px] 2xl:text-xs text-gray-400 dark:text-gray-500 mt-1 leading-tight">{t.ghostedTooltip || '> 14j sans retour'}</p>
                  </div>
                </div>

                {/* Average Response Time */}
                <div className="bg-white dark:bg-gray-800 p-4 sm:p-5 2xl:p-6 rounded-2xl shadow-xs border border-gray-100 dark:border-gray-700/80 flex flex-col justify-between hover:shadow-md hover:border-amber-200 dark:hover:border-amber-800/60 transition-all">
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <span className="text-xs sm:text-sm font-semibold text-gray-600 dark:text-gray-400 leading-snug">{t.avgResponseTime}</span>
                    <div className="p-2 sm:p-2.5 bg-amber-50 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400 rounded-xl shrink-0">
                      <Timer className="w-4 h-4 sm:w-5 sm:h-5" />
                    </div>
                  </div>
                  <div>
                    {avgResponseDays !== null ? (
                      <div>
                        <p className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight flex items-baseline gap-1">
                          {avgResponseDays} <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">{avgResponseDays <= 1 ? t.avgDaySingle : t.avgDays}</span>
                        </p>
                        <p className="text-[11px] 2xl:text-xs text-gray-400 dark:text-gray-500 mt-1 leading-tight">{t.basedOnAnswers ? t.basedOnAnswers.replace('{count}', answeredApps.length) : `${answeredApps.length} réponses`}</p>
                      </div>
                    ) : (
                      <p className="text-xs sm:text-sm font-medium text-gray-400 dark:text-gray-500">{t.noResponseData}</p>
                    )}
                  </div>
                </div>

                {/* Overall Reply Rate */}
                <div className="bg-white dark:bg-gray-800 p-4 sm:p-5 2xl:p-6 rounded-2xl shadow-xs border border-gray-100 dark:border-gray-700/80 flex flex-col justify-between hover:shadow-md hover:border-indigo-200 dark:hover:border-indigo-800/60 transition-all">
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <span className="text-xs sm:text-sm font-semibold text-gray-600 dark:text-gray-400 leading-snug">{t.replyRate}</span>
                    <div className="p-2 sm:p-2.5 bg-indigo-50 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 rounded-xl shrink-0">
                      <Percent className="w-4 h-4 sm:w-5 sm:h-5" />
                    </div>
                  </div>
                  <div>
                    <p className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">{overallReplyRate}%</p>
                    <p className="text-[11px] 2xl:text-xs text-gray-400 dark:text-gray-500 mt-1 leading-tight">{answeredApps.length} / {totalApplications} {t.repliesCount?.toLowerCase() || 'réponses'}</p>
                  </div>
                </div>
              </div>

              {/* Platform / Source Analytics Section */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xs border border-gray-100 dark:border-gray-700 p-4 sm:p-6 2xl:p-8">
                <div className="flex justify-between items-start flex-wrap gap-3 sm:gap-4 mb-5 sm:mb-6">
                  <div>
                    <div className="flex items-center gap-2">
                      <Globe className="text-blue-600 dark:text-blue-400" size={20} />
                      <h3 className="text-base sm:text-lg 2xl:text-xl font-bold text-gray-900 dark:text-white">{t.sourceAnalysis}</h3>
                    </div>
                    <p className="text-xs 2xl:text-sm text-gray-500 dark:text-gray-400 mt-1">{t.sourceAnalysisSubtitle}</p>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <button 
                      onClick={handleExportCSV} 
                      className="px-3 py-1.5 2xl:px-4 2xl:py-2 bg-gray-50 hover:bg-gray-100 dark:bg-gray-700/60 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-600 rounded-xl text-xs 2xl:text-sm font-medium flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                      title={t.exportDataTooltip}
                    >
                      <Download size={14} className="text-emerald-600 dark:text-emerald-400" />
                      <span>{t.exportCSVBtn}</span>
                    </button>
                    <button 
                      onClick={() => setActiveTab('applications')} 
                      className="px-3.5 py-1.5 2xl:px-4 2xl:py-2 bg-blue-50 dark:bg-blue-900/30 hover:bg-blue-100 dark:hover:bg-blue-900/50 text-blue-700 dark:text-blue-300 rounded-xl text-xs 2xl:text-sm font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <ListTodo size={14} /> {t.applications}
                    </button>
                  </div>
                </div>

                {/* Highlights: Best & Worst Source cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 2xl:gap-6 mb-6">
                  {/* Most replies source */}
                  <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-emerald-500/10 to-teal-500/5 dark:from-emerald-950/40 dark:to-teal-950/20 border border-emerald-200/80 dark:border-emerald-800/60">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs 2xl:text-sm font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
                        <TrendingUp size={16} /> {t.mostRepliesSource}
                      </span>
                      {sourceStats.mostReplies && (
                        <span className="px-2.5 py-0.5 rounded-full text-xs 2xl:text-sm font-bold bg-emerald-600 text-white shadow-2xs">
                          {sourceStats.mostReplies.replyRate}% {t.replyRate.toLowerCase()}
                        </span>
                      )}
                    </div>
                    {sourceStats.mostReplies ? (
                      <div>
                        <div className="flex items-center gap-2 mt-2 flex-wrap">
                          <span className={`inline-flex items-center whitespace-nowrap px-2.5 sm:px-3 py-1 rounded-lg text-xs sm:text-sm font-bold border shrink-0 ${getSourceBadgeStyle(sourceStats.mostReplies.source)}`}>
                            {getSourceLabel(sourceStats.mostReplies.source, t)}
                          </span>
                          <span className="text-xs sm:text-sm 2xl:text-base font-semibold text-gray-800 dark:text-gray-200">
                            {sourceStats.mostReplies.answered} / {sourceStats.mostReplies.total} {t.repliesCount.toLowerCase()}
                          </span>
                        </div>
                        <p className="text-xs 2xl:text-sm text-gray-500 dark:text-gray-400 mt-2">
                          {sourceStats.mostReplies.interviews} {t.interviews.toLowerCase()} • {sourceStats.mostReplies.offers} {t.offersReceived.toLowerCase()} • {sourceStats.mostReplies.rejections} {t.rejections.toLowerCase()}
                          {sourceStats.mostReplies.avgDays && ` • ~${sourceStats.mostReplies.avgDays} ${t.avgDays}`}
                        </p>
                      </div>
                    ) : (
                      <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">{t.noRepliesYet}</p>
                    )}
                  </div>

                  {/* Least replies source */}
                  <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-slate-500/10 to-gray-500/5 dark:from-slate-900/40 dark:to-gray-900/20 border border-slate-200 dark:border-slate-800">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs 2xl:text-sm font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                        <TrendingDown size={16} /> {t.leastRepliesSource}
                      </span>
                      {sourceStats.leastReplies && (
                        <span className="px-2.5 py-0.5 rounded-full text-xs 2xl:text-sm font-bold bg-slate-600 text-white shadow-2xs">
                          {sourceStats.leastReplies.replyRate}% {t.replyRate.toLowerCase()}
                        </span>
                      )}
                    </div>
                    {sourceStats.leastReplies ? (
                      <div>
                        <div className="flex items-center gap-2 mt-2 flex-wrap">
                          <span className={`inline-flex items-center whitespace-nowrap px-2.5 sm:px-3 py-1 rounded-lg text-xs sm:text-sm font-bold border shrink-0 ${getSourceBadgeStyle(sourceStats.leastReplies.source)}`}>
                            {getSourceLabel(sourceStats.leastReplies.source, t)}
                          </span>
                          <span className="text-xs sm:text-sm 2xl:text-base font-semibold text-gray-800 dark:text-gray-200">
                            {sourceStats.leastReplies.answered} / {sourceStats.leastReplies.total} {t.repliesCount.toLowerCase()}
                          </span>
                        </div>
                        <p className="text-xs 2xl:text-sm text-gray-500 dark:text-gray-400 mt-2">
                          {sourceStats.leastReplies.pending} {t.pending.toLowerCase()} • {sourceStats.leastReplies.rejections} {t.rejections.toLowerCase()}
                          {sourceStats.leastReplies.avgDays ? ` • ~${sourceStats.leastReplies.avgDays} ${t.avgDays}` : ''}
                        </p>
                      </div>
                    ) : (
                      <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">{t.noRepliesYet}</p>
                    )}
                  </div>
                </div>

                {/* Detailed Source Breakdown Table */}
                <div className="overflow-x-auto -mx-4 sm:mx-0 px-4 sm:px-0">
                  <table className="w-full text-left border-collapse text-xs sm:text-sm 2xl:text-base min-w-[560px]">
                    <thead>
                      <tr className="bg-gray-50 dark:bg-gray-900/60 text-gray-500 dark:text-gray-400 text-[11px] sm:text-xs 2xl:text-sm uppercase tracking-wider border-b dark:border-gray-700">
                        <th className="p-2.5 sm:p-3 2xl:p-4 font-semibold">{t.source}</th>
                        <th className="p-2.5 sm:p-3 2xl:p-4 font-semibold text-center">{t.totalApplications}</th>
                        <th className="p-2.5 sm:p-3 2xl:p-4 font-semibold text-center">{t.repliesCount}</th>
                        <th className="p-2.5 sm:p-3 2xl:p-4 font-semibold min-w-[140px] sm:min-w-[160px]">{t.replyRate}</th>
                        <th className="p-2.5 sm:p-3 2xl:p-4 font-semibold text-center">{t.positiveRate}</th>
                        <th className="p-2.5 sm:p-3 2xl:p-4 font-semibold text-right">{t.avgResponseTime}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-700/80">
                      {sourceStats.list.map((item) => (
                        <tr key={item.source} className="hover:bg-gray-50/70 dark:hover:bg-gray-700/40 transition-colors">
                          <td className="p-2.5 sm:p-3 2xl:p-4 font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                      <span className={`inline-flex items-center whitespace-nowrap px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full text-[11px] sm:text-xs 2xl:text-sm font-semibold border shrink-0 ${getSourceBadgeStyle(item.source)}`}>
                        {getSourceLabel(item.source, t)}
                      </span>
                          </td>
                          <td className="p-2.5 sm:p-3 2xl:p-4 text-center font-bold text-gray-800 dark:text-gray-200">{item.total}</td>
                          <td className="p-2.5 sm:p-3 2xl:p-4 text-center text-xs 2xl:text-sm">
                            <span className="font-semibold text-gray-700 dark:text-gray-300">{item.answered}</span>
                            <span className="text-gray-400 dark:text-gray-500 ml-1">({item.interviews} E, {item.offers} O, {item.rejections} R)</span>
                          </td>
                          <td className="p-2.5 sm:p-3 2xl:p-4">
                            <div className="flex items-center gap-2">
                              <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                                <div 
                                  className={`h-full rounded-full transition-all duration-500 ${
                                    item.replyRate >= 60 ? 'bg-emerald-500' : item.replyRate >= 30 ? 'bg-amber-500' : 'bg-slate-400'
                                  }`}
                                  style={{ width: `${item.replyRate}%` }}
                                />
                              </div>
                              <span className="text-[11px] sm:text-xs 2xl:text-sm font-bold text-gray-700 dark:text-gray-300 w-9 text-right">{item.replyRate}%</span>
                            </div>
                          </td>
                          <td className="p-2.5 sm:p-3 2xl:p-4 text-center">
                            <span className={`px-2 py-0.5 rounded text-xs 2xl:text-sm font-semibold ${
                              item.positiveRate > 0 ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'text-gray-400 dark:text-gray-500'
                            }`}>
                              {item.positiveRate}%
                            </span>
                          </td>
                          <td className="p-2.5 sm:p-3 2xl:p-4 text-right">
                            {item.avgDays !== null ? (
                              <span className="inline-flex items-center gap-1 font-semibold text-gray-800 dark:text-gray-200">
                                <Timer size={13} className="text-amber-500 shrink-0" /> {item.avgDays} {item.avgDays <= 1 ? t.avgDaySingle : t.avgDays}
                              </span>
                            ) : (
                              <span className="text-gray-400 dark:text-gray-500 text-xs">-</span>
                            )}
                          </td>
                        </tr>
                      ))}
                      {sourceStats.list.length === 0 && (
                        <tr>
                          <td colSpan="6" className="p-6 text-center text-gray-400 dark:text-gray-500 text-sm">
                            {t.noApplications}
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'applications' && (
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xs border border-gray-200 dark:border-gray-700 overflow-hidden transition-colors max-w-6xl xl:max-w-7xl 2xl:max-w-[1700px] mx-auto">
              <div className="p-4 sm:p-5 2xl:p-6 border-b dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/50 flex justify-between items-start sm:items-center flex-col sm:flex-row gap-3.5 sm:gap-4">
                <div>
                  <h3 className="text-base sm:text-lg 2xl:text-xl font-bold text-gray-800 dark:text-white">{t.applications}</h3>
                  <p className="text-xs 2xl:text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                    {totalApplications} {t.totalApplications.toLowerCase()} • {answeredApps.length} {t.answered.toLowerCase()}
                    {ghostedCount > 0 ? ` • ${ghostedCount} ${lang === 'en' ? 'ghosted' : 'sans réponse'}` : ''}
                  </p>
                </div>
                <div className="flex items-center gap-2 sm:gap-2.5 flex-wrap w-full sm:w-auto">
                  <button 
                    onClick={handleExportCSV} 
                    className="flex-1 sm:flex-none justify-center px-3.5 py-2 2xl:px-4 2xl:py-2.5 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 rounded-xl text-xs sm:text-sm 2xl:text-base font-semibold hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors cursor-pointer shadow-2xs flex items-center gap-1.5"
                    title={t.exportDataTooltip}
                  >
                    <Download size={15} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <span>{t.exportCSVBtn}</span>
                  </button>
                  <button 
                    onClick={() => { setEditingApplication(null); setIsAddModalOpen(true); }} 
                    className="flex-1 sm:flex-none justify-center px-4 py-2 2xl:px-5 2xl:py-2.5 bg-blue-600 text-white rounded-xl text-xs sm:text-sm 2xl:text-base font-semibold hover:bg-blue-700 transition-colors cursor-pointer shadow-xs flex items-center gap-1.5"
                  >
                    <Plus size={16} className="shrink-0" />
                    <span>{t.newApplication}</span>
                  </button>
                </div>
              </div>

              {/* Mobile Card List (< 640px) */}
              <div className="block sm:hidden divide-y divide-gray-100 dark:divide-gray-700/80">
                {applications.map(app => (
                  <div key={app.id} className="p-4 space-y-2.5 hover:bg-gray-50/80 dark:hover:bg-gray-700/30 transition-colors">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="font-bold text-sm text-gray-900 dark:text-white flex items-center gap-1.5">
                          <span>{app.company}</span>
                          {app.url && (
                            <a 
                              href={formatExternalUrl(app.url)} 
                              target="_blank" 
                              rel="noopener noreferrer" 
                              onClick={(e) => openExternalLink(app.url, e)}
                              className="text-blue-500 hover:text-blue-700 dark:text-blue-400 inline-flex items-center cursor-pointer p-0.5 hover:bg-blue-50 dark:hover:bg-blue-900/40 rounded transition-colors" 
                              title={app.url}
                              aria-label={app.url}
                            >
                              <ExternalLink size={13} />
                            </a>
                          )}
                        </div>
                        <div className="text-xs font-medium text-gray-700 dark:text-gray-300 mt-0.5">{app.role}</div>
                      </div>
                      <span className={`inline-flex items-center whitespace-nowrap px-2.5 py-0.5 rounded-full text-[10px] font-bold border shrink-0 ${getSourceBadgeStyle(app.source || 'LinkedIn')}`}>
                        {getSourceLabel(app.source || 'LinkedIn', t)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between gap-2 text-xs flex-wrap">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="inline-flex items-center whitespace-nowrap px-2.5 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-full text-[10px] font-semibold border dark:border-gray-600 shrink-0">
                          {getContractLabel(app.type, t)}
                        </span>
                        <span className="text-gray-500 dark:text-gray-400 text-[11px] whitespace-nowrap">{app.date}</span>
                      </div>
                      {getResponseDays(app) !== null && (
                        <span className="inline-flex items-center whitespace-nowrap text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 shrink-0 gap-1">
                          <Timer size={10} /> {getResponseDays(app)} {lang === 'en' ? 'd' : 'j'}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center justify-between gap-2 pt-1">
                      <select
                        value={app.status}
                        onChange={(e) => handleInlineStatusChange(app.id, e.target.value)}
                        className={`inline-flex items-center whitespace-nowrap px-3 py-1.5 rounded-xl text-xs font-semibold cursor-pointer outline-none appearance-none text-center shadow-2xs ${getStatusColor(app.status)}`}
                      >
                        {STATUS_KEYS.map(statusKey => (
                          <option key={statusKey} value={statusKey} className="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 font-medium">
                            {getStatusLabel(statusKey, t)}
                          </option>
                        ))}
                      </select>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <button 
                          onClick={() => { setEditingApplication(app); setIsAddModalOpen(true); }} 
                          className="px-2.5 py-1.5 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-lg text-xs font-medium cursor-pointer transition-colors whitespace-nowrap"
                        >
                          {t.edit}
                        </button>
                        <button 
                          onClick={() => setApplications(applications.filter(item => item.id !== app.id))} 
                          className="px-2.5 py-1.5 bg-red-50 dark:bg-red-900/30 hover:bg-red-100 dark:hover:bg-red-900/50 text-red-600 dark:text-red-400 rounded-lg text-xs font-medium cursor-pointer transition-colors whitespace-nowrap"
                        >
                          {t.delete}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
                {applications.length === 0 && (
                  <div className="p-8 text-center text-gray-400 dark:text-gray-500 text-sm">{t.noApplications}</div>
                )}
              </div>

              {/* Desktop / Tablet Table (>= 640px) */}
              <div className="hidden sm:block">
                <table className="w-full table-fixed text-left border-collapse text-xs sm:text-sm 2xl:text-base">
                  <colgroup>
                    <col className="w-[18%]" />
                    <col className="w-[20%]" />
                    <col className="w-[13%]" />
                    <col className="w-[11%]" />
                    <col className="w-[12%]" />
                    <col className="w-[16%]" />
                    <col className="w-[10%]" />
                  </colgroup>
                  <thead>
                    <tr className="bg-gray-100/60 dark:bg-gray-900 text-gray-600 dark:text-gray-400 text-xs 2xl:text-sm uppercase tracking-wider">
                      <th className="p-2.5 sm:p-3 lg:p-3.5 2xl:p-4 truncate">{t.company}</th>
                      <th className="p-2.5 sm:p-3 lg:p-3.5 2xl:p-4 truncate">{t.role}</th>
                      <th className="p-2.5 sm:p-3 lg:p-3.5 2xl:p-4 truncate">{t.source}</th>
                      <th className="p-2.5 sm:p-3 lg:p-3.5 2xl:p-4 truncate">{t.contract}</th>
                      <th className="p-2.5 sm:p-3 lg:p-3.5 2xl:p-4 truncate">{t.date}</th>
                      <th className="p-2.5 sm:p-3 lg:p-3.5 2xl:p-4 truncate">{t.status}</th>
                      <th className="p-2.5 sm:p-3 lg:p-3.5 2xl:p-4 text-right truncate">{t.actions}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                    {applications.map(app => (
                      <tr key={app.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                        <td className="p-2.5 sm:p-3 lg:p-3.5 2xl:p-4 font-semibold text-gray-900 dark:text-gray-100">
                          <div className="flex items-center gap-1.5 min-w-0">
                            <span className="truncate" title={app.company}>{app.company}</span>
                            {app.url && (
                              <a 
                                href={formatExternalUrl(app.url)} 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                onClick={(e) => openExternalLink(app.url, e)}
                                className="text-blue-500 hover:text-blue-700 dark:text-blue-400 inline-flex items-center cursor-pointer shrink-0 p-0.5 hover:bg-blue-50 dark:hover:bg-blue-900/40 rounded transition-colors" 
                                title={app.url}
                                aria-label={app.url}
                              >
                                <ExternalLink size={13} />
                              </a>
                            )}
                          </div>
                        </td>
                        <td className="p-2.5 sm:p-3 lg:p-3.5 2xl:p-4 text-gray-700 dark:text-gray-300 font-medium">
                          <div className="truncate" title={app.role}>{app.role}</div>
                        </td>
                        <td className="p-2.5 sm:p-3 lg:p-3.5 2xl:p-4">
                          <span className={`inline-flex items-center whitespace-nowrap px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full text-[11px] sm:text-xs 2xl:text-sm font-semibold border shrink-0 max-w-full truncate ${getSourceBadgeStyle(app.source || 'LinkedIn')}`} title={getSourceLabel(app.source || 'LinkedIn', t)}>
                            <span className="truncate">{getSourceLabel(app.source || 'LinkedIn', t)}</span>
                          </span>
                        </td>
                        <td className="p-2.5 sm:p-3 lg:p-3.5 2xl:p-4">
                          <span className="inline-flex items-center whitespace-nowrap px-2 sm:px-2.5 py-0.5 sm:py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-full text-[11px] sm:text-xs 2xl:text-sm font-medium border dark:border-gray-600 max-w-full truncate" title={getContractLabel(app.type, t)}>
                            <span className="truncate">{getContractLabel(app.type, t)}</span>
                          </span>
                        </td>
                        <td className="p-2.5 sm:p-3 lg:p-3.5 2xl:p-4 text-gray-500 dark:text-gray-400 text-xs 2xl:text-sm">
                          <div className="truncate">{app.date}</div>
                          {app.responseDate && (
                            <div className="text-[10px] sm:text-[11px] 2xl:text-xs text-amber-600 dark:text-amber-400 flex items-center gap-1 mt-0.5 truncate" title={`${t.responseDate}: ${app.responseDate}`}>
                              <Clock size={10} className="shrink-0" /> <span className="truncate">{app.responseDate}</span>
                            </div>
                          )}
                        </td>
                        <td className="p-2.5 sm:p-3 lg:p-3.5 2xl:p-4">
                          <div className="flex items-center gap-1.5 flex-nowrap min-w-0">
                            <select
                              value={app.status}
                              onChange={(e) => handleInlineStatusChange(app.id, e.target.value)}
                              className={`inline-flex items-center whitespace-nowrap px-2 sm:px-2.5 py-1 rounded-full text-[11px] sm:text-xs 2xl:text-sm font-semibold cursor-pointer outline-none appearance-none text-center hover:opacity-80 transition-opacity max-w-[110px] sm:max-w-[130px] truncate ${getStatusColor(app.status)}`}
                              style={{ textAlignLast: 'center' }}
                            >
                              {STATUS_KEYS.map(statusKey => (
                                <option key={statusKey} value={statusKey} className="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 font-medium">
                                  {getStatusLabel(statusKey, t)}
                                </option>
                              ))}
                            </select>
                            {getResponseDays(app) !== null && (
                              <span className="inline-flex items-center whitespace-nowrap text-[10px] sm:text-[11px] font-semibold px-1.5 py-0.5 rounded-md bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 shrink-0 gap-0.5" title={`${t.avgResponseTime}: ${getResponseDays(app)} ${t.avgDays}`}>
                                <Timer size={10} className="shrink-0" /> {getResponseDays(app)} {lang === 'en' ? 'd' : 'j'}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="p-2.5 sm:p-3 lg:p-3.5 2xl:p-4 text-right space-x-1.5 whitespace-nowrap">
                          <button onClick={() => { setEditingApplication(app); setIsAddModalOpen(true); }} className="px-2 py-1 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-md text-xs font-medium cursor-pointer transition-colors">
                            {t.edit}
                          </button>
                          <button onClick={() => setApplications(applications.filter(item => item.id !== app.id))} className="px-2 py-1 bg-red-50 dark:bg-red-900/30 hover:bg-red-100 dark:hover:bg-red-900/50 text-red-600 dark:text-red-400 rounded-md text-xs font-medium cursor-pointer transition-colors">
                            {t.delete}
                          </button>
                        </td>
                      </tr>
                    ))}
                    {applications.length === 0 && (
                      <tr><td colSpan="7" className="p-8 text-center text-gray-400 dark:text-gray-500 text-sm">{t.noApplications}</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'tailor' && (
            <div className="space-y-6 max-w-6xl xl:max-w-7xl 2xl:max-w-[1700px] mx-auto">
              <div className={`bg-white dark:bg-gray-800 rounded-2xl shadow-xs border border-gray-100 dark:border-gray-700 p-4 sm:p-6 2xl:p-8 print:hidden transition-colors ${isPrinting ? 'print:hidden' : ''}`}>
                <div className="flex items-center justify-between mb-5 sm:mb-6 flex-wrap gap-3 sm:gap-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 sm:p-2.5 bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400 rounded-xl"><Sparkles className="w-5 h-5 sm:w-6 sm:h-6" /></div>
                    <div>
                      <h2 className="text-lg sm:text-xl 2xl:text-2xl font-bold text-gray-800 dark:text-white">{t.tailor}</h2>
                      <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">{t.tailorSubtitle}</p>
                    </div>
                  </div>
                  <div className="flex bg-gray-100 dark:bg-gray-900 p-1 rounded-xl w-full sm:w-auto">
                    <button 
                      onClick={() => setGenerationMode('cv')} 
                      className={`flex-1 sm:flex-none px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-colors cursor-pointer ${generationMode === 'cv' ? 'bg-white dark:bg-gray-700 shadow-xs text-blue-700 dark:text-blue-400' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-800'}`}
                    >
                      {t.cvMode}
                    </button>
                    <button 
                      onClick={() => setGenerationMode('letter')} 
                      className={`flex-1 sm:flex-none px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-colors cursor-pointer ${generationMode === 'letter' ? 'bg-white dark:bg-gray-700 shadow-xs text-blue-700 dark:text-blue-400' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-800'}`}
                    >
                      {t.letterMode}
                    </button>
                  </div>
                </div>

                <form onSubmit={handleGenerateAI} className="space-y-4 sm:space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 2xl:gap-6">
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t.associatedJob}</label>
                      <select className="w-full p-2.5 2xl:p-3 border rounded-xl text-xs sm:text-sm bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white outline-none focus:ring-2 focus:ring-blue-500 shadow-2xs" value={selectedAppId} onChange={(e) => handleSelectAssociatedApplication(e.target.value)}>
                        <option value="">{t.noJobLinked}</option>
                        {applications.map(app => <option key={app.id} value={app.id}>{app.company} - {app.role}</option>)}
                      </select>
                    </div>

                    {generationMode === 'cv' ? (
                      <>
                        <div>
                          <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t.strategyFidelity}</label>
                          <select className="w-full p-2.5 2xl:p-3 border rounded-xl text-xs sm:text-sm bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white outline-none focus:ring-2 focus:ring-blue-500 shadow-2xs" value={modificationStrategy} onChange={(e) => setModificationStrategy(e.target.value)}>
                            <option value="strict">{t.strategyStrict}</option>
                            <option value="balanced">{t.strategyBalanced}</option>
                            <option value="rewrite">{t.strategyRewrite}</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t.atsKeywordsDensity}</label>
                          <select className="w-full p-2.5 2xl:p-3 border rounded-xl text-xs sm:text-sm bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white outline-none focus:ring-2 focus:ring-blue-500 shadow-2xs" value={keywordDensity} onChange={(e) => setKeywordDensity(e.target.value)}>
                            <option value="low">{t.atsLow}</option>
                            <option value="moderate">{t.atsModerate}</option>
                            <option value="high">{t.atsHigh}</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t.cvTextDensity}</label>
                          <select className="w-full p-2.5 2xl:p-3 border rounded-xl text-xs sm:text-sm bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white outline-none focus:ring-2 focus:ring-blue-500 shadow-2xs" value={cvDensity} onChange={(e) => setCvDensity(e.target.value)}>
                            <option value="expanded">{t.densityExpanded}</option>
                            <option value="standard">{t.densityStandard}</option>
                            <option value="compact">{t.densityCompact}</option>
                          </select>
                        </div>
                      </>
                    ) : (
                      <div className="sm:col-span-2 lg:col-span-3">
                        <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t.letterTone}</label>
                        <select className="w-full p-2.5 2xl:p-3 border rounded-xl text-xs sm:text-sm bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white outline-none focus:ring-2 focus:ring-blue-500 shadow-2xs" value={letterTone} onChange={(e) => setLetterTone(e.target.value)}>
                          <option value="professional">{t.toneProfessional}</option>
                          <option value="audacious">{t.toneAudacious}</option>
                          <option value="original">{t.toneOriginal}</option>
                        </select>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 2xl:gap-6">
                    {generationMode === 'cv' ? (
                      <div>
                        <div className="flex justify-between items-end mb-1">
                          <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">{t.sourceMasterCV}</label>
                          <button type="button" onClick={() => setBaseCV(profile.masterCV)} className="text-xs text-blue-600 dark:text-blue-400 hover:underline cursor-pointer">{t.restore}</button>
                        </div>
                        <textarea rows={5} className="w-full p-2.5 2xl:p-3 border rounded-xl text-xs font-mono bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white outline-none focus:ring-2 focus:ring-blue-500" value={baseCV} onChange={(e) => setBaseCV(e.target.value)} />
                      </div>
                    ) : (
                      <div>
                        <div className="flex justify-between items-end mb-1">
                          <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">{t.sourceMasterLetter}</label>
                          <button type="button" onClick={() => setBaseLetter(profile.masterLetter)} className="text-xs text-blue-600 dark:text-blue-400 hover:underline cursor-pointer">{t.restore}</button>
                        </div>
                        <textarea rows={5} className="w-full p-2.5 2xl:p-3 border rounded-xl text-xs font-mono bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white outline-none focus:ring-2 focus:ring-blue-500" value={baseLetter} onChange={(e) => setBaseLetter(e.target.value)} placeholder={t.masterLetterPlaceholder} />
                      </div>
                    )}
                    <div>
                      <div className="flex justify-between items-end mb-1 flex-wrap gap-1">
                        <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">{t.jobDescription}</label>
                        <div className="flex items-center gap-1.5 sm:gap-2">
                          <input type="url" placeholder={t.urlExtractorPlaceholder} className="px-2.5 py-1 text-xs border rounded-lg w-28 sm:w-36 bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white" value={jobUrl} onChange={(e) => setJobUrl(e.target.value)} />
                          <button type="button" onClick={handleExtractUrl} disabled={isExtracting || !jobUrl} className="text-xs bg-gray-100 dark:bg-gray-700 px-2.5 py-1 rounded-lg border dark:border-gray-600 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 disabled:opacity-50 cursor-pointer">
                            {isExtracting ? <Loader2 size={13} className="animate-spin" /> : t.extractBtn}
                          </button>
                        </div>
                      </div>
                      <textarea rows={5} className="w-full p-2.5 sm:p-3 border rounded-xl text-xs sm:text-sm bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white outline-none focus:ring-2 focus:ring-blue-500" placeholder={t.jobDescPlaceholder} value={jobDescription} onChange={(e) => setJobDescription(e.target.value)} />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t.customInstructionsLabel}</label>
                    <textarea 
                      rows={2} 
                      className="w-full p-2.5 sm:p-3 border rounded-xl text-xs sm:text-sm bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white outline-none focus:ring-2 focus:ring-blue-500" 
                      placeholder={t.customInstructionsPlaceholder} 
                      value={customInstruction} 
                      onChange={(e) => setCustomInstruction(e.target.value)} 
                    />
                  </div>

                  {aiError && (
                    <div className="p-3.5 sm:p-4 bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800 rounded-xl text-xs sm:text-sm space-y-1.5">
                      <div className="flex items-start gap-2">
                        <AlertTriangle size={18} className="shrink-0 mt-0.5" />
                        <span className="font-semibold">{aiError}</span>
                      </div>
                      <div className="flex items-start gap-2 text-xs text-red-600 dark:text-red-400 pl-6.5">
                        <Info size={14} className="shrink-0 mt-0.5" />
                        <span>{t.pasteOfferManuallyTip}</span>
                      </div>
                    </div>
                  )}
                  <div className="flex justify-end pt-1">
                    <button type="submit" disabled={isLoadingAI} className="w-full sm:w-auto flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 sm:px-6 py-2.5 sm:py-3 rounded-xl font-semibold shadow-md disabled:opacity-50 cursor-pointer transition-all text-xs sm:text-sm 2xl:text-base">
                      {isLoadingAI ? <Loader2 className="animate-spin" size={18} /> : <Sparkles size={18} />} {isLoadingAI ? t.generating : (generationMode === 'cv' ? t.optimizeCV : t.optimizeLetter)}
                    </button>
                  </div>
                </form>
              </div>

              {/* Empty / Placeholder State when no document has been generated */}
              {!aiResult && !isLoadingAI && (
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xs border border-gray-100 dark:border-gray-700/80 p-6 sm:p-8 text-center max-w-2xl mx-auto">
                  <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto mb-3.5">
                    <Sparkles size={24} />
                  </div>
                  <h3 className="text-sm sm:text-base font-bold text-gray-800 dark:text-white mb-1.5">{t.noDocumentGeneratedTitle}</h3>
                  <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 leading-relaxed max-w-lg mx-auto">{t.noDocumentGeneratedDesc}</p>
                </div>
              )}

              {/* Display CV Result */}
              {aiResult && generationMode === 'cv' && aiResult.cv && (
                <div className="space-y-4 sm:space-y-6">
                  <div className="bg-white dark:bg-gray-800 p-4 sm:p-5 rounded-2xl shadow-xs border border-gray-100 dark:border-gray-700 flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4 print:hidden">
                    <h3 className="font-bold text-sm sm:text-base text-gray-800 dark:text-white flex items-center gap-2">
                      <FileText className="text-blue-600 dark:text-blue-400" size={18} /> {t.cvFormatRenderCV}
                    </h3>
                    <div className="flex gap-2 w-full sm:w-auto justify-end">
                      <button onClick={handleExportRenderCV} className="flex-1 sm:flex-none justify-center flex items-center gap-1.5 px-3 py-2 text-xs sm:text-sm bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800/50 rounded-xl text-emerald-700 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 font-semibold cursor-pointer transition-colors">
                        <Download size={15} /> {t.yamlExport}
                      </button>
                      <button onClick={triggerPrint} className="flex-1 sm:flex-none justify-center flex items-center gap-1.5 px-4 py-2 text-xs sm:text-sm bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-semibold shadow-xs cursor-pointer transition-colors">
                        <Download size={15} /> {t.pdfExport}
                      </button>
                    </div>
                  </div>

                  <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xs border border-gray-100 dark:border-gray-700 p-2 sm:p-6 flex justify-center bg-gray-100 dark:bg-gray-900 overflow-x-auto">
                    {renderCVTemplate()}
                  </div>
                </div>
              )}

              {/* Display Letter Result */}
              {aiResult && generationMode === 'letter' && aiResult.coverLetter && (
                <div className="space-y-4 sm:space-y-6">
                  <div className="bg-white dark:bg-gray-800 p-4 sm:p-5 rounded-2xl shadow-xs border border-gray-100 dark:border-gray-700 flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4 print:hidden">
                    <h3 className="font-bold text-sm sm:text-base text-gray-800 dark:text-white flex items-center gap-2"><Sparkles className="text-indigo-600 dark:text-indigo-400" size={18} /> {t.coverLetterTitle}</h3>                
                    <div className="flex gap-2 w-full sm:w-auto justify-end">
                      <button 
                        onClick={handleCopyLetter} 
                        className="flex-1 sm:flex-none justify-center flex items-center gap-1.5 px-3.5 py-2 text-xs sm:text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 font-semibold shadow-2xs cursor-pointer transition-all"
                      >
                        {isCopied ? <CheckCircle size={15} className="text-emerald-600 dark:text-emerald-400" /> : <Copy size={15} />} 
                        {isCopied ? <span className="text-emerald-700 dark:text-emerald-400">{t.copied}</span> : t.copyText}
                      </button>
                      <button onClick={triggerPrint} className="flex-1 sm:flex-none justify-center flex items-center gap-1.5 px-4 py-2 text-xs sm:text-sm bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-semibold shadow-xs cursor-pointer transition-colors">
                        <Download size={15} /> {t.printPdf}
                      </button>
                    </div>
                  </div>
                  
                  <div className="w-full flex justify-center bg-gray-100 dark:bg-gray-900 p-2 sm:p-6 md:p-8 overflow-x-auto print:p-0 print:bg-white print:overflow-visible">
                    <style dangerouslySetInnerHTML={{__html: `
                      @media print {
                        @page {
                          size: A4 portrait;
                          margin: 0mm;
                        }
                        body {
                          margin: 0;
                          background-color: white !important;
                        }
                      }
                    `}} />
                    <div 
                      id="cv-render" 
                      className="bg-white border border-gray-300 p-6 sm:p-10 md:p-12 w-full max-w-[210mm] min-h-[297mm] box-border shadow-md text-gray-800 font-sans select-text print:border-none print:shadow-none print:p-12 print:m-0 print:w-[210mm] print:absolute print:inset-0 text-xs sm:text-[13px] leading-relaxed relative flex flex-col"
                      style={{ 
                        userSelect: 'text', 
                        WebkitUserSelect: 'text', 
                        pageBreakAfter: 'avoid', 
                        breakAfter: 'avoid',
                        pageBreakInside: 'avoid',
                        breakInside: 'avoid'
                      }}
                    >
                      <div className="mb-6 sm:mb-10 flex justify-between items-start flex-wrap gap-4">
                        <div>
                          <p className="font-bold text-sm sm:text-base text-black">{profile.fullName || (lang === 'en' ? 'Candidate' : 'Candidat')}</p>
                          <p>{profile.location}</p>
                          <p>{profile.email}</p>
                          <p>{profile.phone}</p>
                        </div>
                        <div className="text-right text-gray-600">
                          <p>{profile.location?.split(',')[0] || (lang === 'en' ? 'City' : 'Paris')}, {lang === 'en' ? 'Date:' : 'le'} {new Date().toLocaleDateString(lang === 'en' ? 'en-US' : 'fr-FR')}</p>
                        </div>
                      </div>
                      <div className="space-y-4 text-justify whitespace-pre-line flex-1">
                        {aiResult.coverLetter}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'profile' && (
            <div className="max-w-4xl mx-auto bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 transition-colors">
              <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
                <h2 className="text-xl font-bold text-gray-800 dark:text-white">{t.profileTitle}</h2>
                <button 
                  type="button"
                  onClick={() => setActiveTab('onboarding')}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-900/30 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 rounded-lg border border-indigo-200 dark:border-indigo-800/60 transition-colors cursor-pointer"
                >
                  <Rocket size={14} className="text-indigo-500" />
                  {t.onboardingRestartGuide}
                </button>
              </div>
              <form onSubmit={(e) => { e.preventDefault(); localStorage.setItem('postutrack_profile', JSON.stringify(profile)); setSavedNotice(true); setTimeout(() => setSavedNotice(false), 3000); }} className="space-y-6">
                
                <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800/50 rounded-xl">
                  <div className="flex justify-between items-center flex-wrap gap-4">
                    <div>
                      <h4 className="font-bold text-emerald-800 dark:text-emerald-400 text-sm">{t.autoImportTitle}</h4>
                      <p className="text-xs text-emerald-700 dark:text-emerald-500 mt-0.5">{t.autoImportSubtitle}</p>
                    </div>
                    <label className="cursor-pointer text-xs flex items-center gap-1.5 bg-emerald-600 text-white px-4 py-2.5 rounded-lg shadow-sm hover:bg-emerald-700 font-medium transition-colors">
                      <Upload size={16} /> {t.importCVBtn}
                      <input type="file" accept=".pdf,.txt" className="hidden" onChange={(e) => handleFileUpload(e, setProfile)} />
                    </label>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div><label className="block text-sm font-medium mb-1">{t.fullName}</label><input type="text" className="w-full p-2.5 border rounded-lg bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white text-sm outline-none focus:ring-2 focus:ring-blue-500" value={profile.fullName || ''} onChange={e => setProfile({...profile, fullName: e.target.value})} /></div>
                  <div><label className="block text-sm font-medium mb-1">{t.email}</label><input type="email" className="w-full p-2.5 border rounded-lg bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white text-sm outline-none focus:ring-2 focus:ring-blue-500" value={profile.email || ''} onChange={e => setProfile({...profile, email: e.target.value})} /></div>
                  <div><label className="block text-sm font-medium mb-1">{t.phone}</label><input type="text" className="w-full p-2.5 border rounded-lg bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white text-sm outline-none focus:ring-2 focus:ring-blue-500" value={profile.phone || ''} onChange={e => setProfile({...profile, phone: e.target.value})} /></div>
                  <div><label className="block text-sm font-medium mb-1">{t.location}</label><input type="text" className="w-full p-2.5 border rounded-lg bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white text-sm outline-none focus:ring-2 focus:ring-blue-500" value={profile.location || ''} onChange={e => setProfile({...profile, location: e.target.value})} /></div>
                  <div className="md:col-span-2"><label className="block text-sm font-medium mb-1">{t.website}</label><input type="text" className="w-full p-2.5 border rounded-lg bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white text-sm outline-none focus:ring-2 focus:ring-blue-500" value={profile.website || ''} onChange={e => setProfile({...profile, website: e.target.value})} /></div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">{t.masterCVLabel}</label>
                  <textarea rows={6} className="w-full p-3 border rounded-lg font-mono text-sm bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white outline-none focus:ring-2 focus:ring-blue-500" value={profile.masterCV || ''} onChange={e => setProfile({...profile, masterCV: e.target.value})} />
                </div>
                <div>
                  <div className="flex justify-between items-end mb-1">
                    <label className="block text-sm font-medium">{t.masterLetterLabel}</label>
                    <label className="cursor-pointer text-xs flex items-center gap-1.5 px-3 py-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-xs hover:bg-gray-50 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 font-medium transition-colors">
                      <Upload size={14} /> {t.importLetterBtn}
                      <input type="file" accept=".pdf,.txt" className="hidden" onChange={(e) => handleFileUpload(e, (text) => setProfile(prev => ({ ...prev, masterLetter: text })))} />
                    </label>
                  </div>
                  <textarea rows={6} className="w-full p-3 border rounded-lg font-mono text-sm bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white outline-none focus:ring-2 focus:ring-blue-500" placeholder={t.masterLetterPlaceholder} value={profile.masterLetter || ''} onChange={e => setProfile({...profile, masterLetter: e.target.value})} />
                </div>

                {/* Section Sauvegarde & Export */}
                <div className="mt-8 p-5 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/50 rounded-xl">
                  <div className="flex items-center gap-2 mb-2">
                    <Download className="text-amber-600 dark:text-amber-400" size={20} />
                    <h4 className="font-bold text-amber-800 dark:text-amber-400">{t.backupTitle}</h4>
                  </div>
                  <p className="text-xs text-amber-700 dark:text-amber-500 mb-4">{t.backupSubtitle}</p>
                  <div className="flex flex-wrap gap-3">
                    <button type="button" onClick={handleExportData} className="px-4 py-2 bg-amber-600 text-white rounded-lg text-sm font-medium hover:bg-amber-700 shadow-sm transition-colors cursor-pointer flex items-center gap-1.5" title={t.exportDataTooltip}>
                      <Download size={15} />
                      {t.exportDataBtn}
                    </button>
                    <button type="button" onClick={handleExportCSV} className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 shadow-sm transition-colors cursor-pointer flex items-center gap-1.5" title={t.exportDataTooltip}>
                      <Download size={15} />
                      {t.exportCSVBtn}
                    </button>
                    <label className="cursor-pointer px-4 py-2 bg-white border border-amber-300 text-amber-700 dark:bg-gray-800 dark:border-amber-700 dark:text-amber-400 dark:hover:bg-gray-700 rounded-lg text-sm font-medium hover:bg-amber-100/50 shadow-xs transition-colors flex items-center gap-1.5">
                      <Upload size={15} />
                      {t.importBackupBtn}
                      <input type="file" accept=".json" className="hidden" onChange={handleImportData} />
                    </label>
                  </div>
                </div>

                {/* Section API Key */}
                <div className="mt-8 p-5 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800/50 rounded-xl">
                  <div className="flex items-center justify-between mb-4 flex-wrap gap-4">
                    <div className="flex items-center gap-2">
                      <Settings className="text-blue-600 dark:text-blue-400" size={20} />
                      <h4 className="font-bold text-blue-900 dark:text-blue-300">{t.aiConfigTitle}</h4>
                    </div>
                    <select 
                      className="p-2 border border-blue-200 dark:border-gray-700 rounded-lg text-sm bg-white dark:bg-gray-700 text-blue-900 dark:text-blue-300 font-medium shadow-xs outline-none"
                      value={selectedAiModel}
                      onChange={(e) => setSelectedAiModel(e.target.value)}
                    >
                      <option value="gemini">{t.geminiOption}</option>
                      <option value="openai">{t.openAiOption}</option>
                      <option value="anthropic">{t.anthropicOption}</option>
                    </select>
                  </div>
                  
                  <p className="text-xs text-blue-700 dark:text-blue-400 mb-4">{t.apiKeyPrivacyNote}</p>
                  
                  <div className="space-y-3">
                    {selectedAiModel === 'gemini' && (
                      <div>
                        <label className="block text-xs font-semibold text-blue-900 dark:text-blue-300 mb-1">{t.geminiKeyLabel}</label>
                        <input 
                          type="password" 
                          placeholder={t.geminiKeyPlaceholder} 
                          className="w-full p-3 border border-blue-200 rounded-lg bg-white text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all dark:bg-gray-700 dark:border-gray-600 dark:text-white" 
                          value={apiKey} 
                          onChange={e => setApiKey(e.target.value)} 
                        />
                      </div>
                    )}
                    
                    {selectedAiModel === 'openai' && (
                      <div>
                        <label className="block text-xs font-semibold text-blue-900 dark:text-blue-300 mb-1">{t.openAiKeyLabel}</label>
                        <input 
                          type="password" 
                          placeholder={t.openAiKeyPlaceholder} 
                          className="w-full p-3 border border-blue-200 rounded-lg bg-white text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all dark:bg-gray-700 dark:border-gray-600 dark:text-white" 
                          value={openAiKey} 
                          onChange={e => setOpenAiKey(e.target.value)} 
                        />
                      </div>
                    )}

                    {selectedAiModel === 'anthropic' && (
                      <div>
                        <label className="block text-xs font-semibold text-blue-900 dark:text-blue-300 mb-1">{t.anthropicKeyLabel}</label>
                        <input 
                          type="password" 
                          placeholder={t.anthropicKeyPlaceholder} 
                          className="w-full p-3 border border-blue-200 rounded-lg bg-white text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all dark:bg-gray-700 dark:border-gray-600 dark:text-white" 
                          value={anthropicKey} 
                          onChange={e => setAnthropicKey(e.target.value)} 
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* Section Zone de Danger / Réinitialisation */}
                <div className="mt-8 p-5 bg-rose-50/80 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/60 rounded-xl">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertOctagon className="text-rose-600 dark:text-rose-400" size={20} />
                    <h4 className="font-bold text-rose-900 dark:text-rose-300">{t.dangerZoneTitle}</h4>
                  </div>
                  <p className="text-xs text-rose-700 dark:text-rose-400 mb-4">{t.dangerZoneSubtitle}</p>
                  <button
                    type="button"
                    onClick={() => setIsResetConfirmOpen(true)}
                    className="px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-sm font-medium shadow-sm transition-colors cursor-pointer flex items-center gap-2"
                  >
                    <Trash2 size={16} />
                    {t.resetDataBtn}
                  </button>
                </div>

                {savedNotice && <div className="p-3 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 rounded-lg text-sm font-medium flex items-center gap-2"><CheckCircle size={18} /> {t.profileSavedNotice}</div>}
                <div className="flex justify-end">
                  <button type="submit" className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-medium shadow-md transition-all cursor-pointer">
                    {t.saveProfileBtn}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </main>
      
      <AddApplicationModal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
        editingApp={editingApplication}
        t={t}
        onGoToTailor={(appId) => {
          setIsAddModalOpen(false);
          setActiveTab('tailor');
          handleSelectAssociatedApplication(appId);
        }}
        onSave={(savedApp, isEdit) => {
          setApplications(prev => {
            const nextList = isEdit
              ? prev.map(app => app.id === savedApp.id ? savedApp : app)
              : [savedApp, ...prev];
            return autoApplyGhostStatus(nextList).updated;
          });
        }}
      />

      {/* Modal de Confirmation de Réinitialisation Complète */}
      {isResetConfirmOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 max-w-md w-full p-6 text-left space-y-4">
            <div className="flex items-center gap-3 text-rose-600 dark:text-rose-400">
              <div className="p-3 bg-rose-100 dark:bg-rose-900/40 rounded-xl">
                <AlertTriangle size={24} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">{t.resetConfirmTitle}</h3>
              </div>
            </div>
            
            <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
              {t.resetConfirmDesc}
            </p>

            <div className="flex justify-end items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsResetConfirmOpen(false)}
                className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-xl text-sm font-medium transition-colors cursor-pointer"
              >
                {t.resetCancelBtn}
              </button>
              <button
                type="button"
                onClick={handleResetAllData}
                className="px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-sm font-semibold shadow-md transition-all cursor-pointer flex items-center gap-1.5"
              >
                <Trash2 size={16} />
                {t.resetConfirmBtn}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
