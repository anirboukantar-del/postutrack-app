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
  Globe
} from 'lucide-react';
import { translations } from './i18n';

const STATUS_KEYS = ['Postulé', 'En cours', 'Entretien', 'Offre', 'Refusé'];
const CONTRACT_KEYS = ['CDI', 'CDD', 'Stage', 'Alternance', 'Freelance', 'Intérim'];
const SOURCE_KEYS = [
  'LinkedIn',
  'Indeed',
  'Welcome to the Jungle',
  'France Travail',
  'Site Entreprise',
  'Cooptation',
  'Candidature Spontanée',
  'Autre'
];

const DEFAULT_APPLICATIONS = [
  { id: 1, company: 'Google', role: 'Software Engineer', date: '2026-08-01', responseDate: '2026-08-08', source: 'LinkedIn', status: 'Entretien', type: 'CDI', url: 'https://careers.google.com' },
  { id: 2, company: 'Datadog', role: 'Frontend Engineer', date: '2026-08-04', responseDate: '2026-08-11', source: 'Welcome to the Jungle', status: 'Offre', type: 'CDI', url: 'https://www.welcometothejungle.com' },
  { id: 3, company: 'Doctolib', role: 'Fullstack Developer', date: '2026-08-07', responseDate: '2026-08-12', source: 'Indeed', status: 'Refusé', type: 'CDI', url: 'https://fr.indeed.com' },
  { id: 4, company: 'Mirakl', role: 'React Engineer', date: '2026-08-10', responseDate: '', source: 'LinkedIn', status: 'En cours', type: 'CDI', url: '' },
  { id: 5, company: 'Qonto', role: 'Product Engineer', date: '2026-08-15', responseDate: '', source: 'Site Entreprise', status: 'Postulé', type: 'CDI', url: '' }
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
    case 'LinkedIn': return t.sourceLinkedIn;
    case 'Indeed': return t.sourceIndeed;
    case 'Welcome to the Jungle': return t.sourceWTTJ;
    case 'France Travail': return t.sourceFranceTravail;
    case 'Site Entreprise':
    case 'Company Website':
      return t.sourceCompanySite;
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
      return src || 'LinkedIn';
  }
};

const getSourceBadgeStyle = (src) => {
  switch (src) {
    case 'LinkedIn':
      return 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800';
    case 'Indeed':
      return 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-300 dark:border-indigo-800';
    case 'Welcome to the Jungle':
      return 'bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-800';
    case 'France Travail':
      return 'bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-900/30 dark:text-sky-300 dark:border-sky-800';
    case 'Site Entreprise':
    case 'Company Website':
      return 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-800';
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

function AddApplicationModal({ isOpen, onClose, onSave, editingApp, onGoToTailor, t }) {
  const [formData, setFormData] = useState({
    company: '',
    role: '',
    source: 'LinkedIn',
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
        source: 'LinkedIn',
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

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingApplication, setEditingApplication] = useState(null);

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
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map(app => ({
            ...app,
            source: app.source || 'LinkedIn',
            responseDate: app.responseDate || ''
          }));
        }
      }
    } catch (e) {
      console.error(e);
    }
    return DEFAULT_APPLICATIONS;
  });

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
      masterCV: ''
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

  // --- SAUVEGARDE ET RESTAURATION ---
  const handleExportData = () => {
    const backup = {
      applications: applications,
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

  const handleImportData = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const backup = JSON.parse(event.target.result);
        if (backup.applications) setApplications(backup.applications);
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

  useEffect(() => {
    if (selectedAppId && !jobUrl) {
      const app = applications.find(a => a.id.toString() === selectedAppId.toString());
      if (app && app.url) {
        setJobUrl(app.url);
      }
    }
  }, [selectedAppId]);

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
      const rawSource = app.source || 'LinkedIn';
      if (!map[rawSource]) {
        map[rawSource] = {
          source: rawSource,
          total: 0,
          interviews: 0,
          offers: 0,
          rejections: 0,
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
      const isAnswered = isInterview || isOffer || isRejected || Boolean(app.responseDate);

      if (isInterview) item.interviews += 1;
      if (isOffer) item.offers += 1;
      if (isRejected) item.rejections += 1;

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

  const handleFileUpload = async (e, targetStateSetter) => {
    const file = e.target.files[0];
    if (!file) return;
    
    if (file.type === 'application/pdf') {
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

  const handleExtractUrl = async () => {
    if (!jobUrl) return;
    setIsExtracting(true);
    setJobDescription(t.extractingPage);
    
    try {
      const proxyUrl = `https://r.jina.ai/${encodeURIComponent(jobUrl)}`;
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

CANDIDATE PROFILE & MASTER RESUME:
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
1. "analysisSummary" MUST be at most 3 sentences.
2. "summary" (profile intro at the top of the CV) MUST be at most 3 sentences (MAX 45 WORDS).
3. If the offer specifies contract duration/type/start date, mention it succinctly in the summary.
4. DO NOT repeat the same sentences in loops.
5. Sort professional experiences and education in reverse chronological order (most recent first).
6. Return ONLY valid JSON adhering strictly to the schema.`;

        responseSchema = {
          type: "OBJECT",
          properties: {
            matchScore: { type: "INTEGER" },
            analysisSummary: { type: "STRING" },
            injectedKeywords: { type: "ARRAY", items: { type: "STRING" } },
            cv: {
              type: "OBJECT",
              properties: {
                fullName: { type: "STRING" },
                summary: { type: "STRING" },
                experiences: {
                  type: "ARRAY",
                  items: {
                    type: "OBJECT",
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
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
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
        
        if (parsed.cv) {
          parsed.cv.fullName = profile.fullName;
          parsed.cv.email = profile.email;
          parsed.cv.phone = profile.phone;
          parsed.cv.location = profile.location;
          parsed.cv.website = profile.website;
        }
        setAiResult(parsed);
      } else {
        throw new Error(t.noDataReturned);
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
      <div className="w-full flex justify-center bg-gray-100 p-8 overflow-x-auto print:p-0 print:bg-white print:overflow-visible">
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
          className="bg-white border border-gray-300 p-10 w-[210mm] max-w-[210mm] box-border shadow-lg text-black font-serif select-text print:border-none print:shadow-none print:p-8 print:m-0 print:w-[210mm] print:h-[297mm] print:absolute print:inset-0 flex flex-col gap-4"
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
      case 'dashboard': return t.dashboard;
      case 'applications': return t.applications;
      case 'tailor': return t.tailor;
      case 'profile': return t.profile;
      default: return activeTab;
    }
  };

  const renderSidebar = () => (
    <aside className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 h-screen hidden md:flex flex-col sticky top-0 print:hidden transition-colors duration-200">
      <div className="p-6">
        <h1 className="text-2xl font-bold text-blue-600 dark:text-blue-400 flex items-center gap-2">
          PostuTrack
        </h1>
      </div>
      <nav className="flex-1 px-4 space-y-2">
        <button onClick={() => setActiveTab('dashboard')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors cursor-pointer ${activeTab === 'dashboard' ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 font-medium' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50'}`}>
          <LayoutDashboard size={20} /> {t.dashboard}
        </button>
        <button onClick={() => setActiveTab('applications')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors cursor-pointer ${activeTab === 'applications' ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 font-medium' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50'}`}>
          <ListTodo size={20} /> {t.applications}
        </button>
        <button onClick={() => setActiveTab('tailor')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors cursor-pointer ${activeTab === 'tailor' ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 font-medium' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50'}`}>
          <Sparkles size={20} className="text-amber-500" /> {t.tailor}
        </button>
        <button onClick={() => setActiveTab('profile')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors cursor-pointer ${activeTab === 'profile' ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 font-medium' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50'}`}>
          <UserCheck size={20} className="text-emerald-500" /> {t.profile}
        </button>
      </nav>
    </aside>
  );

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-gray-900 font-sans flex text-gray-900 dark:text-gray-100 transition-colors duration-200">
      {renderSidebar()}
      <main className="flex-1 flex flex-col min-w-0">
        <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-20 px-6 py-4 flex justify-between items-center print:hidden transition-colors duration-200">
          <div className="flex items-center gap-3">
            {/* Mobile Title Icon */}
            <div className="md:hidden font-bold text-blue-600 text-lg">PostuTrack</div>
            <h2 className="text-xl font-bold text-gray-800 dark:text-white hidden md:block">
              {getTabHeading()}
            </h2>
          </div>
          
          <div className="flex items-center gap-3">
            {/* BOUTON DE CHANGEMENT DE LANGUE (FR / EN) */}
            <button 
              onClick={toggleLanguage} 
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-full border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/80 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all cursor-pointer shadow-xs"
              title={t.switchLanguage}
              aria-label={t.switchLanguage}
            >
              <Languages size={15} className="text-blue-600 dark:text-blue-400" />
              <span className="flex items-center gap-1 tracking-wider">
                <span className={lang === 'fr' ? 'font-bold text-blue-600 dark:text-blue-400' : 'text-gray-400 dark:text-gray-500'}>FR</span>
                <span className="text-gray-300 dark:text-gray-600 text-[10px]">|</span>
                <span className={lang === 'en' ? 'font-bold text-blue-600 dark:text-blue-400' : 'text-gray-400 dark:text-gray-500'}>EN</span>
              </span>
            </button>

            {/* BOUTON DU THÈME */}
            <button 
              onClick={toggleTheme} 
              className="p-2 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors flex items-center justify-center cursor-pointer"
              title={t.toggleTheme}
            >
              {theme === 'dark' ? <Sun size={19} className="text-yellow-400" /> : <Moon size={19} />}
            </button>

            {/* PROFIL AVATAR */}
            <div onClick={() => setActiveTab('profile')} className="flex items-center gap-2 cursor-pointer bg-blue-50 dark:bg-blue-900/30 px-3 py-1.5 rounded-full border border-blue-100 dark:border-gray-700 hover:bg-blue-100 dark:hover:bg-gray-700 transition-colors">
              <div className="w-7 h-7 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-xs">
                {getInitials(profile.fullName)}
              </div>
              <span className="text-xs font-semibold text-blue-900 dark:text-blue-300 max-w-[120px] truncate">{profile.fullName || t.user}</span>
            </div>
          </div>
        </header>

        {/* Mobile Navigation Tabs */}
        <div className="md:hidden flex border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-2 py-1 overflow-x-auto print:hidden">
          <button onClick={() => setActiveTab('dashboard')} className={`px-3 py-2 text-xs font-medium rounded-lg whitespace-nowrap ${activeTab === 'dashboard' ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' : 'text-gray-600 dark:text-gray-400'}`}>{t.dashboard}</button>
          <button onClick={() => setActiveTab('applications')} className={`px-3 py-2 text-xs font-medium rounded-lg whitespace-nowrap ${activeTab === 'applications' ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' : 'text-gray-600 dark:text-gray-400'}`}>{t.applications}</button>
          <button onClick={() => setActiveTab('tailor')} className={`px-3 py-2 text-xs font-medium rounded-lg whitespace-nowrap ${activeTab === 'tailor' ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' : 'text-gray-600 dark:text-gray-400'}`}>{t.tailor}</button>
          <button onClick={() => setActiveTab('profile')} className={`px-3 py-2 text-xs font-medium rounded-lg whitespace-nowrap ${activeTab === 'profile' ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' : 'text-gray-600 dark:text-gray-400'}`}>{t.profile}</button>
        </div>

        <div className="flex-1 p-6 overflow-auto">
          {activeTab === 'dashboard' && (
            <div className="space-y-8 max-w-6xl mx-auto">
              {/* Top Metric Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
                {/* Total Applications */}
                <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl shadow-xs border border-gray-100 dark:border-gray-700 flex items-center gap-3.5">
                  <div className="p-3 bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 rounded-xl shrink-0"><Briefcase size={22} /></div>
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400 truncate">{t.totalApplications}</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white mt-0.5">{totalApplications}</p>
                  </div>
                </div>

                {/* Interviews */}
                <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl shadow-xs border border-gray-100 dark:border-gray-700 flex items-center gap-3.5">
                  <div className="p-3 bg-purple-50 dark:bg-purple-900/40 text-purple-600 dark:text-purple-400 rounded-xl shrink-0"><Clock size={22} /></div>
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400 truncate">{t.interviews}</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white mt-0.5">{interviewsCount}</p>
                  </div>
                </div>

                {/* Offers */}
                <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl shadow-xs border border-gray-100 dark:border-gray-700 flex items-center gap-3.5">
                  <div className="p-3 bg-emerald-50 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 rounded-xl shrink-0"><CheckCircle size={22} /></div>
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400 truncate">{t.offersReceived}</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white mt-0.5">{offersCount}</p>
                  </div>
                </div>

                {/* Rejections */}
                <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl shadow-xs border border-gray-100 dark:border-gray-700 flex items-center gap-3.5">
                  <div className="p-3 bg-rose-50 dark:bg-rose-900/40 text-rose-600 dark:text-rose-400 rounded-xl shrink-0"><XCircle size={22} /></div>
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400 truncate">{t.rejections}</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white mt-0.5">{rejectionsCount}</p>
                  </div>
                </div>

                {/* Average Response Time */}
                <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl shadow-xs border border-gray-100 dark:border-gray-700 flex items-center gap-3.5">
                  <div className="p-3 bg-amber-50 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400 rounded-xl shrink-0"><Timer size={22} /></div>
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400 truncate">{t.avgResponseTime}</p>
                    {avgResponseDays !== null ? (
                      <div>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white mt-0.5 flex items-baseline gap-1">
                          {avgResponseDays} <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">{avgResponseDays <= 1 ? t.avgDaySingle : t.avgDays}</span>
                        </p>
                        <p className="text-[10px] text-gray-400 dark:text-gray-500 truncate">{t.basedOnAnswers ? t.basedOnAnswers.replace('{count}', answeredApps.length) : `${answeredApps.length} réponses`}</p>
                      </div>
                    ) : (
                      <p className="text-xs font-medium text-gray-400 dark:text-gray-500 mt-1">{t.noResponseData}</p>
                    )}
                  </div>
                </div>

                {/* Overall Reply Rate */}
                <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl shadow-xs border border-gray-100 dark:border-gray-700 flex items-center gap-3.5">
                  <div className="p-3 bg-indigo-50 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 rounded-xl shrink-0"><Percent size={22} /></div>
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400 truncate">{t.replyRate}</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white mt-0.5">{overallReplyRate}%</p>
                    <p className="text-[10px] text-gray-400 dark:text-gray-500 truncate">{answeredApps.length} / {totalApplications} {t.repliesCount?.toLowerCase() || 'réponses'}</p>
                  </div>
                </div>
              </div>

              {/* Platform / Source Analytics Section */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xs border border-gray-100 dark:border-gray-700 p-6">
                <div className="flex justify-between items-start flex-wrap gap-4 mb-6">
                  <div>
                    <div className="flex items-center gap-2">
                      <Globe className="text-blue-600 dark:text-blue-400" size={20} />
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white">{t.sourceAnalysis}</h3>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{t.sourceAnalysisSubtitle}</p>
                  </div>
                  <button 
                    onClick={() => setActiveTab('applications')} 
                    className="px-3.5 py-1.5 bg-blue-50 dark:bg-blue-900/30 hover:bg-blue-100 dark:hover:bg-blue-900/50 text-blue-700 dark:text-blue-300 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <ListTodo size={14} /> {t.applications}
                  </button>
                </div>

                {/* Highlights: Best & Worst Source cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  {/* Most replies source */}
                  <div className="p-4 rounded-xl bg-gradient-to-br from-emerald-500/10 to-teal-500/5 dark:from-emerald-950/40 dark:to-teal-950/20 border border-emerald-200/80 dark:border-emerald-800/60">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
                        <TrendingUp size={16} /> {t.mostRepliesSource}
                      </span>
                      {sourceStats.mostReplies && (
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-600 text-white shadow-xs">
                          {sourceStats.mostReplies.replyRate}% {t.replyRate.toLowerCase()}
                        </span>
                      )}
                    </div>
                    {sourceStats.mostReplies ? (
                      <div>
                        <div className="flex items-center gap-2 mt-2">
                          <span className={`px-3 py-1 rounded-lg text-sm font-bold border ${getSourceBadgeStyle(sourceStats.mostReplies.source)}`}>
                            {getSourceLabel(sourceStats.mostReplies.source, t)}
                          </span>
                          <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                            {sourceStats.mostReplies.answered} / {sourceStats.mostReplies.total} {t.repliesCount.toLowerCase()}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                          {sourceStats.mostReplies.interviews} {t.interviews.toLowerCase()} • {sourceStats.mostReplies.offers} {t.offersReceived.toLowerCase()} • {sourceStats.mostReplies.rejections} {t.rejections.toLowerCase()}
                          {sourceStats.mostReplies.avgDays && ` • ~${sourceStats.mostReplies.avgDays} ${t.avgDays}`}
                        </p>
                      </div>
                    ) : (
                      <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">{t.noRepliesYet}</p>
                    )}
                  </div>

                  {/* Least replies source */}
                  <div className="p-4 rounded-xl bg-gradient-to-br from-slate-500/10 to-gray-500/5 dark:from-slate-900/40 dark:to-gray-900/20 border border-slate-200 dark:border-slate-800">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                        <TrendingDown size={16} /> {t.leastRepliesSource}
                      </span>
                      {sourceStats.leastReplies && (
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-600 text-white shadow-xs">
                          {sourceStats.leastReplies.replyRate}% {t.replyRate.toLowerCase()}
                        </span>
                      )}
                    </div>
                    {sourceStats.leastReplies ? (
                      <div>
                        <div className="flex items-center gap-2 mt-2">
                          <span className={`px-3 py-1 rounded-lg text-sm font-bold border ${getSourceBadgeStyle(sourceStats.leastReplies.source)}`}>
                            {getSourceLabel(sourceStats.leastReplies.source, t)}
                          </span>
                          <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                            {sourceStats.leastReplies.answered} / {sourceStats.leastReplies.total} {t.repliesCount.toLowerCase()}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
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
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-sm">
                    <thead>
                      <tr className="bg-gray-50 dark:bg-gray-900/60 text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider border-b dark:border-gray-700">
                        <th className="p-3 font-semibold">{t.source}</th>
                        <th className="p-3 font-semibold text-center">{t.totalApplications}</th>
                        <th className="p-3 font-semibold text-center">{t.repliesCount}</th>
                        <th className="p-3 font-semibold min-w-[160px]">{t.replyRate}</th>
                        <th className="p-3 font-semibold text-center">{t.positiveRate}</th>
                        <th className="p-3 font-semibold text-right">{t.avgResponseTime}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-700/80">
                      {sourceStats.list.map((item) => (
                        <tr key={item.source} className="hover:bg-gray-50/70 dark:hover:bg-gray-700/40 transition-colors">
                          <td className="p-3 font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                            <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${getSourceBadgeStyle(item.source)}`}>
                              {getSourceLabel(item.source, t)}
                            </span>
                          </td>
                          <td className="p-3 text-center font-bold text-gray-800 dark:text-gray-200">{item.total}</td>
                          <td className="p-3 text-center text-xs">
                            <span className="font-semibold text-gray-700 dark:text-gray-300">{item.answered}</span>
                            <span className="text-gray-400 dark:text-gray-500 ml-1">({item.interviews} E, {item.offers} O, {item.rejections} R)</span>
                          </td>
                          <td className="p-3">
                            <div className="flex items-center gap-2.5">
                              <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                                <div 
                                  className={`h-full rounded-full transition-all duration-500 ${
                                    item.replyRate >= 60 ? 'bg-emerald-500' : item.replyRate >= 30 ? 'bg-amber-500' : 'bg-slate-400'
                                  }`}
                                  style={{ width: `${item.replyRate}%` }}
                                />
                              </div>
                              <span className="text-xs font-bold text-gray-700 dark:text-gray-300 w-9 text-right">{item.replyRate}%</span>
                            </div>
                          </td>
                          <td className="p-3 text-center">
                            <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
                              item.positiveRate > 0 ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'text-gray-400 dark:text-gray-500'
                            }`}>
                              {item.positiveRate}%
                            </span>
                          </td>
                          <td className="p-3 text-right">
                            {item.avgDays !== null ? (
                              <span className="inline-flex items-center gap-1 font-semibold text-gray-800 dark:text-gray-200">
                                <Timer size={13} className="text-amber-500" /> {item.avgDays} {item.avgDays <= 1 ? t.avgDaySingle : t.avgDays}
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
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden transition-colors max-w-6xl mx-auto">
              <div className="p-5 border-b dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/50 flex justify-between items-center flex-wrap gap-4">
                <h3 className="text-lg font-bold text-gray-800 dark:text-white">{t.applications}</h3>
                <button onClick={() => { setEditingApplication(null); setIsAddModalOpen(true); }} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors cursor-pointer shadow-sm">
                  {t.newApplication}
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-100/60 dark:bg-gray-900 text-gray-600 dark:text-gray-400 text-xs uppercase tracking-wider">
                      <th className="p-3.5">{t.company}</th>
                      <th className="p-3.5">{t.role}</th>
                      <th className="p-3.5">{t.source}</th>
                      <th className="p-3.5">{t.contract}</th>
                      <th className="p-3.5">{t.date}</th>
                      <th className="p-3.5">{t.status}</th>
                      <th className="p-3.5 text-right">{t.actions}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-700 text-sm">
                    {applications.map(app => (
                      <tr key={app.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                        <td className="p-3.5 font-semibold text-gray-900 dark:text-gray-100">
                          <div className="flex items-center gap-2">
                            {app.company}
                            {app.url && <a href={app.url} target="_blank" rel="noreferrer" className="text-blue-500 hover:text-blue-700 dark:text-blue-400 inline-flex items-center" title="Lien vers l'offre"><ExternalLink size={14} /></a>}
                          </div>
                        </td>
                        <td className="p-3.5 text-gray-700 dark:text-gray-300 font-medium">{app.role}</td>
                        <td className="p-3.5">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${getSourceBadgeStyle(app.source || 'LinkedIn')}`}>
                            {getSourceLabel(app.source || 'LinkedIn', t)}
                          </span>
                        </td>
                        <td className="p-3.5"><span className="px-2.5 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-full text-xs font-medium border dark:border-gray-600">{getContractLabel(app.type, t)}</span></td>
                        <td className="p-3.5 text-gray-500 dark:text-gray-400 text-xs">
                          <div>{app.date}</div>
                          {app.responseDate && (
                            <div className="text-[11px] text-amber-600 dark:text-amber-400 flex items-center gap-1 mt-0.5" title={`${t.responseDate}: ${app.responseDate}`}>
                              <Clock size={11} /> {app.responseDate}
                            </div>
                          )}
                        </td>
                        <td className="p-3.5">
                          <div className="flex items-center gap-2 flex-wrap">
                            <select
                              value={app.status}
                              onChange={(e) => handleInlineStatusChange(app.id, e.target.value)}
                              className={`px-3 py-1 rounded-full text-xs font-semibold cursor-pointer outline-none appearance-none text-center hover:opacity-80 transition-opacity ${getStatusColor(app.status)}`}
                              style={{ textAlignLast: 'center' }}
                            >
                              {STATUS_KEYS.map(statusKey => (
                                <option key={statusKey} value={statusKey} className="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 font-medium">
                                  {getStatusLabel(statusKey, t)}
                                </option>
                              ))}
                            </select>
                            {getResponseDays(app) !== null && (
                              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 flex items-center gap-1" title={`${t.avgResponseTime}: ${getResponseDays(app)} ${t.avgDays}`}>
                                <Timer size={11} /> {getResponseDays(app)} {lang === 'en' ? 'd' : 'j'}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="p-3.5 text-right space-x-2">
                          <button onClick={() => { setEditingApplication(app); setIsAddModalOpen(true); }} className="px-2.5 py-1 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-md text-xs font-medium cursor-pointer transition-colors">
                            {t.edit}
                          </button>
                          <button onClick={() => setApplications(applications.filter(item => item.id !== app.id))} className="px-2.5 py-1 bg-red-50 dark:bg-red-900/30 hover:bg-red-100 dark:hover:bg-red-900/50 text-red-600 dark:text-red-400 rounded-md text-xs font-medium cursor-pointer transition-colors">
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
            <div className="space-y-6 max-w-6xl mx-auto">
              <div className={`bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 print:hidden transition-colors ${isPrinting ? 'print:hidden' : ''}`}>
                <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400 rounded-xl"><Sparkles size={24} /></div>
                    <div>
                      <h2 className="text-xl font-bold text-gray-800 dark:text-white">{t.tailor}</h2>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{t.tailorSubtitle}</p>
                    </div>
                  </div>
                  <div className="flex bg-gray-100 dark:bg-gray-900 p-1 rounded-xl">
                    <button 
                      onClick={() => setGenerationMode('cv')} 
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${generationMode === 'cv' ? 'bg-white dark:bg-gray-700 shadow-sm text-blue-700 dark:text-blue-400' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-800'}`}
                    >
                      {t.cvMode}
                    </button>
                    <button 
                      onClick={() => setGenerationMode('letter')} 
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${generationMode === 'letter' ? 'bg-white dark:bg-gray-700 shadow-sm text-blue-700 dark:text-blue-400' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-800'}`}
                    >
                      {t.letterMode}
                    </button>
                  </div>
                </div>

                <form onSubmit={handleGenerateAI} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t.associatedJob}</label>
                      <select className="w-full p-2.5 border rounded-lg text-sm bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white outline-none focus:ring-2 focus:ring-blue-500" value={selectedAppId} onChange={(e) => setSelectedAppId(e.target.value)}>
                        <option value="">{t.noJobLinked}</option>
                        {applications.map(app => <option key={app.id} value={app.id}>{app.company} - {app.role}</option>)}
                      </select>
                    </div>

                    {generationMode === 'cv' ? (
                      <>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t.strategyFidelity}</label>
                          <select className="w-full p-2.5 border rounded-lg text-sm bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white outline-none focus:ring-2 focus:ring-blue-500" value={modificationStrategy} onChange={(e) => setModificationStrategy(e.target.value)}>
                            <option value="strict">{t.strategyStrict}</option>
                            <option value="balanced">{t.strategyBalanced}</option>
                            <option value="rewrite">{t.strategyRewrite}</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t.atsKeywordsDensity}</label>
                          <select className="w-full p-2.5 border rounded-lg text-sm bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white outline-none focus:ring-2 focus:ring-blue-500" value={keywordDensity} onChange={(e) => setKeywordDensity(e.target.value)}>
                            <option value="low">{t.atsLow}</option>
                            <option value="moderate">{t.atsModerate}</option>
                            <option value="high">{t.atsHigh}</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t.cvTextDensity}</label>
                          <select className="w-full p-2.5 border rounded-lg text-sm bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white outline-none focus:ring-2 focus:ring-blue-500" value={cvDensity} onChange={(e) => setCvDensity(e.target.value)}>
                            <option value="expanded">{t.densityExpanded}</option>
                            <option value="standard">{t.densityStandard}</option>
                            <option value="compact">{t.densityCompact}</option>
                          </select>
                        </div>
                      </>
                    ) : (
                      <div className="md:col-span-3">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t.letterTone}</label>
                        <select className="w-full p-2.5 border rounded-lg text-sm bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white outline-none focus:ring-2 focus:ring-blue-500" value={letterTone} onChange={(e) => setLetterTone(e.target.value)}>
                          <option value="professional">{t.toneProfessional}</option>
                          <option value="audacious">{t.toneAudacious}</option>
                          <option value="original">{t.toneOriginal}</option>
                        </select>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {generationMode === 'cv' ? (
                      <div>
                        <div className="flex justify-between items-end mb-1">
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t.sourceMasterCV}</label>
                          <button type="button" onClick={() => setBaseCV(profile.masterCV)} className="text-xs text-blue-600 dark:text-blue-400 hover:underline cursor-pointer">{t.restore}</button>
                        </div>
                        <textarea rows={5} className="w-full p-2.5 border rounded-lg text-xs font-mono bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white outline-none focus:ring-2 focus:ring-blue-500" value={baseCV} onChange={(e) => setBaseCV(e.target.value)} />
                      </div>
                    ) : (
                      <div>
                        <div className="flex justify-between items-end mb-1">
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t.sourceMasterLetter}</label>
                          <button type="button" onClick={() => setBaseLetter(profile.masterLetter)} className="text-xs text-blue-600 dark:text-blue-400 hover:underline cursor-pointer">{t.restore}</button>
                        </div>
                        <textarea rows={5} className="w-full p-2.5 border rounded-lg text-xs font-mono bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white outline-none focus:ring-2 focus:ring-blue-500" value={baseLetter} onChange={(e) => setBaseLetter(e.target.value)} placeholder={t.masterLetterPlaceholder} />
                      </div>
                    )}
                    <div>
                      <div className="flex justify-between items-end mb-1">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t.jobDescription}</label>
                        <div className="flex items-center gap-2">
                          <input type="url" placeholder={t.urlExtractorPlaceholder} className="px-3 py-1 text-xs border rounded-md w-36 bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white" value={jobUrl} onChange={(e) => setJobUrl(e.target.value)} />
                          <button type="button" onClick={handleExtractUrl} disabled={isExtracting || !jobUrl} className="text-xs bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded border dark:border-gray-600 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 disabled:opacity-50 cursor-pointer">
                            {isExtracting ? <Loader2 size={14} className="animate-spin" /> : t.extractBtn}
                          </button>
                        </div>
                      </div>
                      <textarea rows={5} className="w-full p-3 border rounded-lg text-sm bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white outline-none focus:ring-2 focus:ring-blue-500" placeholder={t.jobDescPlaceholder} value={jobDescription} onChange={(e) => setJobDescription(e.target.value)} />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t.customInstructionsLabel}</label>
                    <textarea 
                      rows={2} 
                      className="w-full p-2.5 border rounded-lg text-sm bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white outline-none focus:ring-2 focus:ring-blue-500" 
                      placeholder={t.customInstructionsPlaceholder} 
                      value={customInstruction} 
                      onChange={(e) => setCustomInstruction(e.target.value)} 
                    />
                  </div>

                  {aiError && <div className="p-3 bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800 rounded-lg text-sm flex items-center gap-2"><AlertTriangle size={18} /> {aiError}</div>}
                  <div className="flex justify-end">
                    <button type="submit" disabled={isLoadingAI} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-medium shadow-md disabled:opacity-50 cursor-pointer transition-all">
                      {isLoadingAI ? <Loader2 className="animate-spin" size={20} /> : <Sparkles size={20} />} {isLoadingAI ? t.generating : (generationMode === 'cv' ? t.optimizeCV : t.optimizeLetter)}
                    </button>
                  </div>
                </form>
              </div>

              {/* Display CV Result */}
              {aiResult && generationMode === 'cv' && aiResult.cv && (
                <div className="space-y-6">
                  <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col sm:flex-row items-center justify-between gap-4 print:hidden">
                    <h3 className="font-bold text-gray-800 dark:text-white flex items-center gap-2">
                      <FileText className="text-blue-600 dark:text-blue-400" size={20} /> {t.cvFormatRenderCV}
                    </h3>
                    <div className="flex gap-2">
                      <button onClick={handleExportRenderCV} className="flex items-center gap-1.5 px-3 py-2 text-sm bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800/50 rounded-lg text-emerald-700 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 font-medium cursor-pointer transition-colors">
                        <Download size={16} /> {t.yamlExport}
                      </button>
                      <button onClick={triggerPrint} className="flex items-center gap-1.5 px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium shadow-sm cursor-pointer transition-colors">
                        <Download size={16} /> {t.pdfExport}
                      </button>
                    </div>
                  </div>

                  <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 flex justify-center bg-gray-200 dark:bg-gray-900">
                    {renderCVTemplate()}
                  </div>
                </div>
              )}

              {/* Display Letter Result */}
              {aiResult && generationMode === 'letter' && aiResult.coverLetter && (
                <div className="space-y-6">
                  <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col sm:flex-row items-center justify-between gap-4 print:hidden">
                    <h3 className="font-bold text-gray-800 dark:text-white flex items-center gap-2"><Sparkles className="text-indigo-600 dark:text-indigo-400" size={20} /> {t.coverLetterTitle}</h3>                
                    <div className="flex gap-2">
                      <button 
                        onClick={handleCopyLetter} 
                        className="flex items-center gap-1.5 px-4 py-2 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 font-medium shadow-sm cursor-pointer transition-all"
                      >
                        {isCopied ? <CheckCircle size={16} className="text-emerald-600 dark:text-emerald-400" /> : <Copy size={16} />} 
                        {isCopied ? <span className="text-emerald-700 dark:text-emerald-400">{t.copied}</span> : t.copyText}
                      </button>
                      <button onClick={triggerPrint} className="flex items-center gap-1.5 px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium shadow-sm cursor-pointer transition-colors">
                        <Download size={16} /> {t.printPdf}
                      </button>
                    </div>
                  </div>
                  
                  <div className="w-full flex justify-center bg-gray-100 dark:bg-gray-900 p-8 overflow-x-auto print:p-0 print:bg-white print:overflow-visible">
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
                      className="bg-white border border-gray-300 p-12 w-[210mm] min-h-[297mm] max-w-[210mm] box-border shadow-lg text-gray-800 font-sans select-text print:border-none print:shadow-none print:p-12 print:m-0 print:w-[210mm] print:absolute print:inset-0 text-[13px] leading-relaxed relative flex flex-col"
                      style={{ 
                        userSelect: 'text', 
                        WebkitUserSelect: 'text', 
                        pageBreakAfter: 'avoid', 
                        breakAfter: 'avoid',
                        pageBreakInside: 'avoid',
                        breakInside: 'avoid'
                      }}
                    >
                      <div className="mb-10 flex justify-between items-start">
                        <div>
                          <p className="font-bold text-base text-black">{profile.fullName || (lang === 'en' ? 'Candidate' : 'Candidat')}</p>
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
              <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-6">{t.profileTitle}</h2>
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

                {/* Section Sauvegarde */}
                <div className="mt-8 p-5 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/50 rounded-xl">
                  <div className="flex items-center gap-2 mb-2">
                    <Download className="text-amber-600 dark:text-amber-400" size={20} />
                    <h4 className="font-bold text-amber-800 dark:text-amber-400">{t.backupTitle}</h4>
                  </div>
                  <p className="text-xs text-amber-700 dark:text-amber-500 mb-4">{t.backupSubtitle}</p>
                  <div className="flex flex-wrap gap-3">
                    <button type="button" onClick={handleExportData} className="px-4 py-2 bg-amber-600 text-white rounded-lg text-sm font-medium hover:bg-amber-700 shadow-sm transition-colors cursor-pointer">
                      {t.exportDataBtn}
                    </button>
                    <label className="cursor-pointer px-4 py-2 bg-white border border-amber-300 text-amber-700 dark:bg-gray-800 dark:border-amber-700 dark:text-amber-400 dark:hover:bg-gray-700 rounded-lg text-sm font-medium hover:bg-amber-100/50 shadow-xs transition-colors">
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
          setSelectedAppId(appId);
        }}
        onSave={(savedApp, isEdit) => {
          if (isEdit) setApplications(applications.map(app => app.id === savedApp.id ? savedApp : app));
          else setApplications([savedApp, ...applications]);
        }}
      />
    </div>
  );
}
