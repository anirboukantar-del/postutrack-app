import React, { useState, useMemo, useEffect } from 'react';
import {
  Search,
  Globe,
  Plus,
  Check,
  ExternalLink,
  Building2,
  MapPin,
  Briefcase,
  Calendar,
  Sparkles,
  Download,
  CheckCircle2,
  RefreshCw,
  Eye,
  X,
  Sliders,
  Zap,
  AlertCircle,
  Tag,
  Trash2
} from 'lucide-react';
import { executeJobScrape, normalizeText } from './jobScraperService';
import { openExternalLink } from './App';
import { notifyDownloadSuccess } from './DownloadToast';

export const SUPPORTED_JOB_BOARDS = [
  {
    id: 'linkedin',
    name: 'LinkedIn',
    color: 'bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-950/40 dark:text-sky-300 dark:border-sky-800',
    dotColor: 'bg-[#0077B5]',
    tag: 'LinkedIn Jobs'
  },
  {
    id: 'indeed',
    name: 'Indeed',
    color: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800',
    dotColor: 'bg-[#2164f3]',
    tag: 'Indeed France'
  },
  {
    id: 'wttj',
    name: 'Welcome to the Jungle',
    color: 'bg-yellow-50 text-yellow-800 border-yellow-300 dark:bg-yellow-950/40 dark:text-yellow-300 dark:border-yellow-700',
    dotColor: 'bg-[#FFCC00]',
    tag: 'WTTJ'
  },
  {
    id: 'glassdoor',
    name: 'Glassdoor',
    color: 'bg-teal-50 text-teal-800 border-teal-200 dark:bg-teal-950/40 dark:text-teal-300 dark:border-teal-800',
    dotColor: 'bg-[#0caa41]',
    tag: 'Glassdoor'
  }
];

const CONTRACT_OPTIONS = [
  { id: 'all', label: 'Tous contrats', labelEn: 'All contracts' },
  { id: 'CDI', label: 'CDI (Permanent / Full-time)', labelEn: 'CDI / Full-time' },
  { id: 'CDD', label: 'CDD (Fixed-term)', labelEn: 'CDD / Contract' },
  { id: 'Stage', label: 'Stage (Internship)', labelEn: 'Internship' },
  { id: 'Alternance', label: 'Alternance / Apprentissage', labelEn: 'Apprenticeship' },
  { id: 'Freelance', label: 'Freelance / Indépendant', labelEn: 'Freelance' }
];

const WORKPLACE_OPTIONS = [
  { id: 'all', label: 'Tous modes', labelEn: 'Any workplace' },
  { id: 'remote', label: '100% Télétravail', labelEn: '100% Remote' },
  { id: 'hybrid', label: 'Hybride / Sur site', labelEn: 'Hybrid / On-site' }
];

const FRESHNESS_OPTIONS = [
  { id: 'all', label: 'Toutes dates', labelEn: 'Anytime' },
  { id: '24h', label: 'Dernières 24h', labelEn: 'Past 24 hours' },
  { id: '3d', label: 'Moins de 3 jours', labelEn: 'Past 3 days' },
  { id: '7d', label: 'Dernière semaine', labelEn: 'Past week' },
  { id: '30d', label: 'Dernier mois', labelEn: 'Past month' }
];

export function JobScraperView({
  t,
  lang = 'fr',
  applications = [],
  onTransferApplication,
  onGoToTailor,
  candidateProfile = null
}) {
  // Search parameters
  const [keywords, setKeywords] = useState([]);
  const [keywordInput, setKeywordInput] = useState('');
  const [location, setLocation] = useState('Paris, France');
  const [contractType, setContractType] = useState('all');
  const [workplace, setWorkplace] = useState('all');
  const [freshness, setFreshness] = useState('all');
  const [selectedPlatforms, setSelectedPlatforms] = useState(['linkedin', 'indeed', 'wttj', 'glassdoor']);
  const [jobLimit, setJobLimit] = useState(15);

  // Helper to add a keyword
  const handleAddKeyword = (kwToAdd) => {
    const raw = typeof kwToAdd === 'string' ? kwToAdd : keywordInput;
    if (!raw || !raw.trim()) return;

    // Split by comma or semicolon in case user pasted multiple
    const tokens = raw.split(/[,;]+/).map(k => k.trim()).filter(Boolean);
    if (tokens.length === 0) return;

    setKeywords(prev => {
      const next = [...prev];
      tokens.forEach(t => {
        if (!next.some(existing => existing.toLowerCase() === t.toLowerCase())) {
          next.push(t);
        }
      });
      return next;
    });
    setKeywordInput('');
  };

  // Helper to remove a single keyword
  const handleRemoveKeyword = (indexToRemove) => {
    setKeywords(prev => prev.filter((_, idx) => idx !== indexToRemove));
  };

  // Helper to clear all keywords
  const handleClearAllKeywords = () => {
    setKeywords([]);
    setKeywordInput('');
  };

  // Compute full query string from all active keywords and any pending input
  const fullSearchQuery = useMemo(() => {
    const combined = [...keywords];
    if (keywordInput.trim() && !combined.some(k => k.toLowerCase() === keywordInput.trim().toLowerCase())) {
      combined.push(keywordInput.trim());
    }
    return combined.join(' ').trim();
  }, [keywords, keywordInput]);

  // Scraper UI State - Starts empty, absolutely no mock examples
  const [isScraping, setIsScraping] = useState(false);
  const [scrapingStep, setScrapingStep] = useState('');
  const [scrapedJobs, setScrapedJobs] = useState([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  // Table filtering & selection state
  const [tableSearch, setTableSearch] = useState('');
  const [tablePlatformFilter, setTablePlatformFilter] = useState('all');
  const [tableContractFilter, setTableContractFilter] = useState('all');
  const [tableKeywordFilter, setTableKeywordFilter] = useState('all');
  const [searchedKeywordsList, setSearchedKeywordsList] = useState([]);
  const [selectedJobIds, setSelectedJobIds] = useState(new Set());
  const [viewingJob, setViewingJob] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  // Set of transferred job keys to prevent duplicate transfers
  const [transferredJobKeys, setTransferredJobKeys] = useState(() => {
    const existing = new Set();
    applications.forEach(a => {
      if (a.company && a.role) {
        existing.add(`${a.company.toLowerCase().trim()}___${a.role.toLowerCase().trim()}`);
      }
    });
    return existing;
  });

  // Sync transferred keys when applications change
  useEffect(() => {
    const keys = new Set();
    applications.forEach(a => {
      if (a.company && a.role) {
        keys.add(`${a.company.toLowerCase().trim()}___${a.role.toLowerCase().trim()}`);
      }
    });
    setTransferredJobKeys(keys);
  }, [applications]);

  // Show temporary toast
  const triggerToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // Contract type detector from title, description and raw job_type
  function detectContractType(job, defaultFallback) {
    const title = (job.title || '').toLowerCase();
    const desc = (job.description || '').slice(0, 2000).toLowerCase();
    const rawJt = (job.job_type || '').toLowerCase();
    const text = `${title} ${desc}`;

    if (/\b(alternan[ts]?|alternance|apprentissage|apprenti[es]?|contrat de pro(fessionnalisation)?|contrat pro)\b/i.test(text)) {
      return 'Alternance';
    }
    if (/\b(stage|stagiaire[s]?|intern|internship[s]?|trainee[s]?|pfe|fin d['’]études?)\b/i.test(text) || rawJt.includes('intern')) {
      return 'Stage';
    }
    if (/\b(freelance|indépendant[s]?|independant[s]?|contractor[s]?|portage salarial|b2b)\b/i.test(text)) {
      return 'Freelance';
    }
    if (/\b(cdd|durée déterminée|fixed[- ]term|intérim|interim|temporaire)\b/i.test(text)) {
      return 'CDD';
    }
    if (/\b(cdi|durée indéterminée|full[- ]time|permanent|temps plein)\b/i.test(text) || rawJt.includes('full') || rawJt.includes('permanent')) {
      return 'CDI';
    }
    if (rawJt.includes('contract')) {
      return 'CDD';
    }
    return defaultFallback || 'CDI';
  }

  // Contract badge styling helper
  function getContractBadgeStyle(cType) {
    const norm = String(cType || '').toLowerCase();
    if (norm.includes('stage') || norm.includes('intern')) {
      return 'bg-purple-100 dark:bg-purple-900/50 text-purple-800 dark:text-purple-300 border-purple-200 dark:border-purple-800';
    }
    if (norm.includes('alternance') || norm.includes('apprenti')) {
      return 'bg-teal-100 dark:bg-teal-900/50 text-teal-800 dark:text-teal-300 border-teal-200 dark:border-teal-800';
    }
    if (norm.includes('freelance') || norm.includes('indép')) {
      return 'bg-fuchsia-100 dark:bg-fuchsia-900/50 text-fuchsia-800 dark:text-fuchsia-300 border-fuchsia-200 dark:border-fuchsia-800';
    }
    if (norm.includes('cdd') || norm.includes('contrat') || norm.includes('fixed')) {
      return 'bg-amber-100 dark:bg-amber-900/50 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800';
    }
    return 'bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-300 border-blue-200 dark:border-blue-800';
  }

  // Toggle platform selection
  const togglePlatform = (id) => {
    setSelectedPlatforms(prev => {
      if (prev.includes(id)) {
        if (prev.length === 1) return prev; // Keep at least one
        return prev.filter(p => p !== id);
      }
      return [...prev, id];
    });
  };

  const selectAllPlatforms = () => {
    setSelectedPlatforms(SUPPORTED_JOB_BOARDS.map(b => b.id));
  };

  const deselectAllPlatforms = () => {
    setSelectedPlatforms(['linkedin']);
  };

  // Execute Real Scraping using JobSpy backend - Searches each keyword individually
  const handleLaunchScrape = async () => {
    // If user has typed something in the input box, add it to active keywords
    let keywordsToSearch = [...keywords];
    if (keywordInput.trim() && !keywordsToSearch.some(k => k.toLowerCase() === keywordInput.trim().toLowerCase())) {
      keywordsToSearch.push(keywordInput.trim());
      handleAddKeyword();
    }

    if (keywordsToSearch.length === 0 || isScraping) return;
    setIsScraping(true);
    setErrorMessage(null);
    setSelectedJobIds(new Set());
    setHasSearched(true);
    setSearchedKeywordsList(keywordsToSearch);
    setTableKeywordFilter('all');

    const kwSummary = keywordsToSearch.length > 1
      ? (lang === 'en' ? `${keywordsToSearch.length} distinct keywords (${keywordsToSearch.join(', ')})` : `${keywordsToSearch.length} mots-clés distincts (${keywordsToSearch.join(', ')})`)
      : `"${keywordsToSearch[0]}"`;

    const stepTexts = [
      lang === 'en' 
        ? `Connecting to JobSpy engine for ${kwSummary}...` 
        : `Connexion au moteur JobSpy pour ${kwSummary}...`,
      lang === 'en' 
        ? `Scraping each keyword separately on ${selectedPlatforms.join(', ')}...` 
        : `Recherche individuelle par mot-clé sur ${selectedPlatforms.join(', ')}...`,
      lang === 'en' 
        ? 'Extracting descriptions, tags and job metadata...' 
        : 'Extraction des descriptions complètes, mots-clés et métadonnées...',
      lang === 'en' 
        ? 'Deduplicating & formatting combined results...' 
        : 'Dédoublonnage et finalisation des résultats consolidés...'
    ];

    let stepIndex = 0;
    setScrapingStep(stepTexts[0]);
    const stepInterval = setInterval(() => {
      stepIndex = (stepIndex + 1) % stepTexts.length;
      setScrapingStep(stepTexts[stepIndex]);
    }, 1800);

    try {
      let hoursOldVal = null;
      if (freshness === '24h') hoursOldVal = 24;
      else if (freshness === '3d') hoursOldVal = 72;
      else if (freshness === '7d') hoursOldVal = 168;
      else if (freshness === '30d') hoursOldVal = 720;

      let jobTypeVal = null;
      if (contractType === 'CDI') jobTypeVal = 'fulltime';
      else if (contractType === 'CDD' || contractType === 'Freelance') jobTypeVal = 'contract';
      else if (contractType === 'Stage' || contractType === 'Alternance') jobTypeVal = 'internship';

      const data = await executeJobScrape({
        keywords: keywordsToSearch,
        searchTerm: keywordsToSearch[0],
        location: location.trim() || 'Paris, France',
        jobLimit: jobLimit,
        sites: selectedPlatforms,
        contractType: contractType,
        jobType: jobTypeVal,
        isRemote: workplace === 'remote',
        hoursOld: hoursOldVal,
        onProgress: (msg) => setScrapingStep(msg)
      });

      clearInterval(stepInterval);

      if (!data.success && data.error && (!data.jobs || data.jobs.length === 0)) {
        throw new Error(data.error);
      }

      const rawJobs = Array.isArray(data.jobs) ? data.jobs : [];
      if (Array.isArray(data.searched_keywords) && data.searched_keywords.length > 0) {
        setSearchedKeywordsList(data.searched_keywords);
      }
      
      // Format into UI models
      let formatted = rawJobs.map((j, i) => {
        const platformKey = (j.site || 'LinkedIn').toLowerCase().replace(' ', '_');
        const board = SUPPORTED_JOB_BOARDS.find(b => b.id === platformKey || (platformKey.includes('wttj') && b.id === 'wttj') || (platformKey.includes('jungle') && b.id === 'wttj')) || {
          id: platformKey,
          name: j.site || 'Web',
          color: 'bg-gray-100 text-gray-800 border-gray-300 dark:bg-gray-800 dark:text-gray-200',
          dotColor: 'bg-blue-500'
        };

        const companyInitial = (j.company || 'C').charAt(0).toUpperCase();
        const colors = ['bg-blue-600', 'bg-indigo-600', 'bg-purple-600', 'bg-emerald-600', 'bg-amber-600', 'bg-rose-600'];
        const companyColor = colors[Math.abs(hashString(j.company || '')) % colors.length];

        const detectedContract = j.contract || detectContractType(j, contractType !== 'all' ? contractType : 'CDI');
        const relevance = j.relevance_score || j.relevanceScore || 80;

        return {
          id: j.id || `job_${i}_${Date.now()}`,
          title: j.title || 'Poste',
          company: j.company || 'Entreprise',
          companyLogo: companyInitial,
          companyColor: companyColor,
          location: j.location || location,
          platformId: board.id,
          platformName: board.name,
          platformColor: board.color,
          platformDot: board.dotColor,
          url: j.job_url || '',
          description: j.description || '',
          salary: j.salary || 'Non spécifié',
          contract: detectedContract,
          relevanceScore: relevance,
          matchedKeyword: j.matched_keyword || (keywordsToSearch.length === 1 ? keywordsToSearch[0] : ''),
          workplaceLabel: j.is_remote ? '100% Télétravail' : 'Sur site / Hybride',
          posted: j.date_posted || 'Récent',
          raw: j
        };
      });

      // Prioritize and filter by requested contract type
      if (contractType && contractType !== 'all') {
        const target = contractType.toLowerCase();
        const exactMatches = formatted.filter(job => {
          const c = (job.contract || '').toLowerCase();
          if (target === 'cdi') return c === 'cdi';
          if (target === 'cdd') return c === 'cdd';
          if (target === 'stage') return c === 'stage';
          if (target === 'alternance') return c === 'alternance';
          if (target === 'freelance') return c === 'freelance';
          return c === target;
        });

        if (exactMatches.length > 0) {
          formatted = exactMatches;
        }
      }

      // Sort by relevance score descending
      formatted.sort((a, b) => (b.relevanceScore || 50) - (a.relevanceScore || 50));

      // Limit results to the user-requested job limit
      const finalJobs = formatted.slice(0, jobLimit);

      setScrapedJobs(finalJobs);
      const totalPoolCount = data.total_candidates || rawJobs.length || finalJobs.length;
      triggerToast(
        lang === 'en'
          ? `⚡ Scraped and ranked top ${finalJobs.length} offers (from ${totalPoolCount} candidate offers) by relevance!`
          : `⚡ ${finalJobs.length} meilleures offres sélectionnées et classées par pertinence (sur ${totalPoolCount} offres analysées) !`
      );

      if (finalJobs.length === 0) {
        setErrorMessage(
          lang === 'en'
            ? `No jobs found for ${kwSummary} with contract "${contractType !== 'all' ? contractType : 'All'}". Try broadening keywords or location.`
            : `Aucune offre trouvée pour ${kwSummary} avec le contrat "${contractType !== 'all' ? contractType : 'Tous'}". Essayez d'élargir les mots-clés ou le lieu.`
        );
      }
    } catch (err) {
      clearInterval(stepInterval);
      console.error('JobSpy scrape error:', err);
      setErrorMessage(err.message || 'Erreur lors du scraping.');
      triggerToast(lang === 'en' ? `❌ Scrape error: ${err.message}` : `❌ Erreur de scraping : ${err.message}`);
    } finally {
      setIsScraping(false);
      setScrapingStep('');
    }
  };

  // Helper hash
  function hashString(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = (hash << 5) - hash + str.charCodeAt(i);
      hash |= 0;
    }
    return hash;
  }

  function formatJobType(typeStr) {
    if (!typeStr) return 'CDI';
    const s = String(typeStr).toLowerCase();
    if (s.includes('full')) return 'CDI / Full-time';
    if (s.includes('part')) return 'Temps partiel';
    if (s.includes('intern') || s.includes('stage')) return 'Stage';
    if (s.includes('contract') || s.includes('cdd')) return 'CDD / Contrat';
    return typeStr;
  }

  // Single Job Transfer
  const handleTransferToApplications = (job) => {
    const jobKey = `${job.company.toLowerCase().trim()}___${job.title.toLowerCase().trim()}`;
    if (transferredJobKeys.has(jobKey)) {
      triggerToast(lang === 'en' ? '⚠️ This job is already in your applications!' : '⚠️ Cette offre est déjà dans vos candidatures !');
      return;
    }

    const newApp = {
      id: Date.now(),
      company: job.company,
      role: job.title,
      date: new Date().toISOString().split('T')[0],
      responseDate: '',
      source: job.platformName || 'LinkedIn',
      status: 'Postulé',
      type: job.contract && job.contract !== 'Non spécifié' ? job.contract : 'CDI',
      url: job.url || '',
      jobDescription: job.description || '',
      location: job.location || '',
      salary: job.salary && job.salary !== 'Non spécifié' ? job.salary : '',
      notes: `Scrappé en direct via JobSpy (${job.platformName}) le ${new Date().toLocaleDateString(lang === 'en' ? 'en-US' : 'fr-FR')}`
    };

    if (onTransferApplication) {
      onTransferApplication(newApp);
    }

    setTransferredJobKeys(prev => new Set([...prev, jobKey]));
    triggerToast(
      lang === 'en' 
        ? `✅ "${job.title}" at ${job.company} added to My Applications (+)` 
        : `✅ "${job.title}" chez ${job.company} transféré dans Mes Candidatures (+)`
    );
  };

  // Batch Transfer
  const handleBatchTransfer = () => {
    if (selectedJobIds.size === 0) return;
    let count = 0;
    const newTransferred = new Set(transferredJobKeys);

    filteredJobs.forEach(job => {
      if (selectedJobIds.has(job.id)) {
        const jobKey = `${job.company.toLowerCase().trim()}___${job.title.toLowerCase().trim()}`;
        if (!newTransferred.has(jobKey)) {
          const newApp = {
            id: Date.now() + Math.random(),
            company: job.company,
            role: job.title,
            date: new Date().toISOString().split('T')[0],
            responseDate: '',
            source: job.platformName || 'LinkedIn',
            status: 'Postulé',
            type: job.contract && job.contract !== 'Non spécifié' ? job.contract : 'CDI',
            url: job.url || '',
            jobDescription: job.description || '',
            location: job.location || '',
            salary: job.salary && job.salary !== 'Non spécifié' ? job.salary : '',
            notes: `Scrappé via JobSpy (${job.platformName})`
          };

          if (onTransferApplication) {
            onTransferApplication(newApp);
          }
          newTransferred.add(jobKey);
          count++;
        }
      }
    });

    setTransferredJobKeys(newTransferred);
    setSelectedJobIds(new Set());
    triggerToast(
      lang === 'en'
        ? `🎉 ${count} job(s) transferred to your applications tracker!`
        : `🎉 ${count} offre(s) transférée(s) dans votre tableau de candidatures !`
    );
  };

  // Select all filtered jobs
  const handleToggleSelectAll = () => {
    if (selectedJobIds.size === filteredJobs.length && filteredJobs.length > 0) {
      setSelectedJobIds(new Set());
    } else {
      setSelectedJobIds(new Set(filteredJobs.map(j => j.id)));
    }
  };

  const handleToggleSelectJob = (id) => {
    setSelectedJobIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // Export results to CSV
  const handleExportCSV = () => {
    if (scrapedJobs.length === 0) return;
    const headers = ['Title', 'Company', 'Platform', 'Contract', 'Location', 'Salary', 'Date', 'URL'];
    const rows = scrapedJobs.map(j => [
      `"${(j.title || '').replace(/"/g, '""')}"`,
      `"${(j.company || '').replace(/"/g, '""')}"`,
      `"${(j.platformName || '').replace(/"/g, '""')}"`,
      `"${(j.contract || '').replace(/"/g, '""')}"`,
      `"${(j.location || '').replace(/"/g, '""')}"`,
      `"${(j.salary || '').replace(/"/g, '""')}"`,
      `"${(j.posted || '').replace(/"/g, '""')}"`,
      `"${(j.url || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    const queryFilename = (fullSearchQuery || 'jobs').replace(/[^a-zA-Z0-9_-]/g, '_');
    const filename = `jobspy_scraped_${queryFilename}_${Date.now()}.csv`;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    notifyDownloadSuccess({
      filename,
      fileType: 'csv'
    });
  };

  // Filtered jobs in the table
  const filteredJobs = useMemo(() => {
    const cleanSearch = normalizeText(tableSearch);
    return scrapedJobs.filter(job => {
      let matchesSearch = true;
      if (cleanSearch) {
        const normTitle = normalizeText(job.title || '');
        const normCompany = normalizeText(job.company || '');
        const normLoc = normalizeText(job.location || '');
        matchesSearch = normTitle.includes(cleanSearch) ||
          normCompany.includes(cleanSearch) ||
          normLoc.includes(cleanSearch) ||
          cleanSearch.split(' ').some(token => token.length > 2 && (normTitle.includes(token) || normCompany.includes(token)));
      }
      
      const matchesPlatform = tablePlatformFilter === 'all' || job.platformId === tablePlatformFilter;
      const matchesContract = tableContractFilter === 'all' || (job.contract && job.contract.toLowerCase() === tableContractFilter.toLowerCase());
      const matchesKeyword = tableKeywordFilter === 'all' || (job.matchedKeyword && job.matchedKeyword.toLowerCase() === tableKeywordFilter.toLowerCase());

      return matchesSearch && matchesPlatform && matchesContract && matchesKeyword;
    });
  }, [scrapedJobs, tableSearch, tablePlatformFilter, tableContractFilter, tableKeywordFilter]);

  return (
    <div className="space-y-6 max-w-6xl xl:max-w-7xl 2xl:max-w-[1700px] mx-auto pb-12">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-gray-900/95 dark:bg-gray-100/95 text-white dark:text-gray-900 px-4 py-3 rounded-xl shadow-2xl flex items-center gap-3 backdrop-blur-md border border-gray-700 dark:border-gray-300 animate-in fade-in slide-in-from-bottom-5 duration-200">
          <Sparkles className="w-5 h-5 text-amber-400 dark:text-amber-600 shrink-0" />
          <span className="text-sm font-semibold">{toastMessage}</span>
          <button onClick={() => setToastMessage(null)} className="ml-2 hover:opacity-75">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Hero Header & Scraper Controls Card */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xs border border-gray-200 dark:border-gray-700 overflow-hidden transition-colors">
        {/* Banner */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <h2 className="text-xl sm:text-2xl font-black tracking-tight">
              {lang === 'en' ? 'Job Scraper' : 'Scraper d\'Offres d\'Emploi'}
            </h2>
            <p className="text-xs sm:text-sm text-blue-100 max-w-2xl leading-relaxed">
              {lang === 'en'
                ? 'Search and scrape real job listings from LinkedIn, Indeed, Glassdoor & Welcome to the Jungle in real time, and transfer them with 1-click into your tracker.'
                : 'Scrappez en direct les offres réelles sur LinkedIn, Indeed, Glassdoor et Welcome to the Jungle selon vos critères, et transférez-les en 1 clic dans vos candidatures.'}
            </p>
          </div>
        </div>

        {/* Search & Multi-Keywords Box */}
        <div className="p-5 sm:p-6 space-y-5 bg-gray-50/50 dark:bg-gray-800/40">
          {/* Main Keywords Input & Manager */}
          <div className="space-y-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <label className="text-xs sm:text-sm font-bold text-gray-800 dark:text-gray-200 flex items-center gap-2">
                <Search size={16} className="text-blue-600 dark:text-blue-400" />
                <span>{lang === 'en' ? 'Job Title & Target Keywords' : 'Poste recherché & Mots-clés cibles'}</span>
                <span className="px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/60 text-blue-800 dark:text-blue-300 text-[11px] font-black">
                  {keywords.length} {lang === 'en' ? (keywords.length > 1 ? 'keywords' : 'keyword') : (keywords.length > 1 ? 'mots-clés' : 'mot-clé')}
                </span>
              </label>

              {keywords.length > 0 && (
                <button
                  type="button"
                  onClick={handleClearAllKeywords}
                  className="text-[11px] font-semibold text-rose-600 dark:text-rose-400 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Trash2 size={12} />
                  <span>{lang === 'en' ? 'Clear all keywords' : 'Effacer tous les mots-clés'}</span>
                </button>
              )}
            </div>

            {/* Active Keywords Badges Display */}
            {keywords.length > 0 && (
              <div className="flex flex-wrap items-center gap-2 p-3 bg-white dark:bg-gray-900/80 border border-blue-200/80 dark:border-blue-900/50 rounded-xl shadow-2xs">
                {keywords.map((kw, idx) => (
                  <span
                    key={`${kw}_${idx}`}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 dark:bg-blue-950/60 text-blue-800 dark:text-blue-200 border border-blue-200 dark:border-blue-800/80 rounded-lg text-xs font-bold shadow-2xs group hover:border-blue-400 transition-all"
                  >
                    <Tag size={12} className="text-blue-500 shrink-0" />
                    <span>{kw}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveKeyword(idx)}
                      className="p-0.5 ml-0.5 text-blue-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/80 rounded transition-colors cursor-pointer"
                      title={lang === 'en' ? 'Remove this keyword' : 'Supprimer ce mot-clé'}
                    >
                      <X size={13} className="stroke-[2.5]" />
                    </button>
                  </span>
                ))}
              </div>
            )}

            {/* Keyword Input & Action Buttons Bar */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={keywordInput}
                  onChange={(e) => setKeywordInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      if (keywordInput.trim()) {
                        handleAddKeyword();
                      } else {
                        handleLaunchScrape();
                      }
                    }
                  }}
                  placeholder={
                    lang === 'en'
                      ? 'Type a keyword (e.g. React, Python, DevOps, Senior)...'
                      : 'Tapez un mot-clé (ex: React, Python, DevOps, Senior)...'
                  }
                  className="w-full pl-4 pr-10 py-3.5 bg-white dark:bg-gray-900 border-2 border-blue-200 dark:border-blue-900/60 rounded-xl text-sm font-medium text-gray-900 dark:text-white placeholder-gray-400 outline-none focus:border-blue-600 dark:focus:border-blue-500 shadow-xs transition-all"
                />
                {keywordInput && (
                  <button
                    type="button"
                    onClick={() => setKeywordInput('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                  >
                    <X size={15} />
                  </button>
                )}
              </div>

              {/* Dedicated "Add Keyword" Button */}
              <button
                type="button"
                onClick={() => handleAddKeyword()}
                disabled={!keywordInput.trim()}
                className="px-4 py-3.5 bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/60 dark:hover:bg-blue-900/60 text-blue-700 dark:text-blue-300 border-2 border-blue-300 dark:border-blue-700/80 rounded-xl text-xs sm:text-sm font-bold shadow-xs transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2 shrink-0 active:scale-95"
                title={lang === 'en' ? 'Add keyword to search list' : 'Ajouter le mot-clé à la liste de recherche'}
              >
                <Plus size={16} className="stroke-[2.5]" />
                <span>{lang === 'en' ? 'Add Keyword' : 'Ajouter mot-clé'}</span>
              </button>

              {/* Main "Scrape Jobs" Execution Button */}
              <button
                type="button"
                disabled={isScraping || (!keywords.length && !keywordInput.trim())}
                onClick={handleLaunchScrape}
                className="px-5 py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl text-xs sm:text-sm font-bold shadow-xs transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2 shrink-0 active:scale-95"
              >
                {isScraping ? (
                  <>
                    <RefreshCw size={15} className="animate-spin" />
                    <span>{lang === 'en' ? 'Scraping...' : 'Scraping...'}</span>
                  </>
                ) : (
                  <>
                    <Zap size={15} className="fill-amber-300 text-amber-300" />
                    <span>{lang === 'en' ? 'Scrape Jobs' : 'Lancer le Scraper'}</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Options Grid Under Prompt Box */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 pt-2 border-t border-gray-200 dark:border-gray-700/80">
            {/* Location */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                <MapPin size={14} className="text-rose-500" />
                <span>{lang === 'en' ? 'Location / City' : 'Localisation / Ville'}</span>
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Ex: Paris, France / Remote"
                className="w-full px-3 py-2 text-xs sm:text-sm bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"
              />
            </div>

            {/* Contract Type */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                <Briefcase size={14} className="text-blue-500" />
                <span>{lang === 'en' ? 'Contract Type' : 'Type de contrat'}</span>
              </label>
              <select
                value={contractType}
                onChange={(e) => setContractType(e.target.value)}
                className="w-full px-3 py-2 text-xs sm:text-sm bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"
              >
                {CONTRACT_OPTIONS.map(c => (
                  <option key={c.id} value={c.id}>
                    {lang === 'en' ? c.labelEn : c.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Workplace / Remote */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                <Building2 size={14} className="text-emerald-500" />
                <span>{lang === 'en' ? 'Workplace / Remote' : 'Mode de travail'}</span>
              </label>
              <select
                value={workplace}
                onChange={(e) => setWorkplace(e.target.value)}
                className="w-full px-3 py-2 text-xs sm:text-sm bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"
              >
                {WORKPLACE_OPTIONS.map(w => (
                  <option key={w.id} value={w.id}>
                    {lang === 'en' ? w.labelEn : w.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Freshness */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                <Calendar size={14} className="text-amber-500" />
                <span>{lang === 'en' ? 'Date Posted' : 'Date de publication'}</span>
              </label>
              <select
                value={freshness}
                onChange={(e) => setFreshness(e.target.value)}
                className="w-full px-3 py-2 text-xs sm:text-sm bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"
              >
                {FRESHNESS_OPTIONS.map(f => (
                  <option key={f.id} value={f.id}>
                    {lang === 'en' ? f.labelEn : f.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Website Selection */}
          <div className="space-y-2 pt-2 border-t border-gray-200 dark:border-gray-700/80">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <label className="text-xs sm:text-sm font-bold text-gray-800 dark:text-gray-200 flex items-center gap-2">
                <Globe size={16} className="text-indigo-600 dark:text-indigo-400" />
                <span>{lang === 'en' ? 'Target Platforms:' : 'Plateformes cibles :'}</span>
                <span className="text-[11px] font-normal text-gray-500 dark:text-gray-400">
                  ({selectedPlatforms.length}/{SUPPORTED_JOB_BOARDS.length} {lang === 'en' ? 'active' : 'actives'})
                </span>
              </label>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={selectAllPlatforms}
                  className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                >
                  {lang === 'en' ? 'Select all' : 'Tout sélectionner'}
                </button>
                <span className="text-gray-300 dark:text-gray-600">•</span>
                <button
                  type="button"
                  onClick={deselectAllPlatforms}
                  className="text-[11px] font-semibold text-gray-500 hover:underline cursor-pointer"
                >
                  {lang === 'en' ? 'Reset' : 'Réinitialiser'}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {SUPPORTED_JOB_BOARDS.map((board) => {
                const isSelected = selectedPlatforms.includes(board.id);
                return (
                  <button
                    key={board.id}
                    type="button"
                    onClick={() => togglePlatform(board.id)}
                    className={`p-2.5 rounded-xl border flex items-center justify-between gap-2 text-left transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-white dark:bg-gray-800 border-blue-500 dark:border-blue-400 shadow-sm ring-1 ring-blue-500/20'
                        : 'bg-gray-100/70 dark:bg-gray-900/50 border-gray-200 dark:border-gray-800 text-gray-400 opacity-60 hover:opacity-90'
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className={`w-2.5 h-2.5 rounded-full ${board.dotColor} shrink-0`} />
                      <span className="text-xs font-bold text-gray-900 dark:text-white truncate">
                        {board.name}
                      </span>
                    </div>
                    {isSelected ? (
                      <CheckCircle2 size={15} className="text-blue-600 dark:text-blue-400 shrink-0" />
                    ) : (
                      <div className="w-3.5 h-3.5 rounded-full border border-gray-300 dark:border-gray-600 shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Number of Jobs Limit Slider (5 to 50 max) */}
          <div className="pt-2 border-t border-gray-200 dark:border-gray-700/80 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Sliders size={16} className="text-purple-600 dark:text-purple-400 shrink-0" />
              <div>
                <span className="text-xs sm:text-sm font-bold text-gray-800 dark:text-gray-200">
                  {lang === 'en' ? 'Number of jobs to scrape:' : 'Nombre d\'offres à récupérer :'}
                </span>
                <span className="ml-2 text-xs font-black px-2 py-0.5 rounded-md bg-blue-100 dark:bg-blue-900/60 text-blue-800 dark:text-blue-300">
                  {jobLimit} {lang === 'en' ? 'jobs max' : 'offres max'}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3 flex-1 sm:max-w-xs">
              <span className="text-[11px] font-bold text-gray-400">5</span>
              <input
                type="range"
                min="5"
                max="50"
                step="5"
                value={jobLimit}
                onChange={(e) => setJobLimit(parseInt(e.target.value, 10))}
                className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
              <span className="text-[11px] font-bold text-gray-400">50</span>

              {/* Quick Preset Buttons */}
              <div className="flex items-center gap-1 shrink-0">
                {[10, 20, 50].map(v => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => setJobLimit(v)}
                    className={`px-2 py-0.5 text-[10px] font-bold rounded cursor-pointer transition-colors ${
                      jobLimit === v
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300'
                    }`}
                  >
                    {v}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Real-time Scraping Progress Banner */}
        {isScraping && (
          <div className="p-4 bg-indigo-50 dark:bg-indigo-950/40 border-t border-indigo-100 dark:border-indigo-900 flex items-center justify-between gap-4 animate-pulse">
            <div className="flex items-center gap-3">
              <RefreshCw className="w-5 h-5 text-indigo-600 dark:text-indigo-400 animate-spin" />
              <div>
                <div className="text-xs sm:text-sm font-bold text-indigo-900 dark:text-indigo-200">
                  {scrapingStep}
                </div>
                <div className="text-[11px] text-indigo-700 dark:text-indigo-400">
                  {lang === 'en' ? 'Scraping live job portals with JobSpy...' : 'Extraction en direct des offres depuis les portails...'}
                </div>
              </div>
            </div>
            <div className="text-xs font-semibold text-indigo-800 dark:text-indigo-300">
              {jobLimit} {lang === 'en' ? 'jobs targeted' : 'offres ciblées'}
            </div>
          </div>
        )}
      </div>

      {/* Error notification if any */}
      {errorMessage && (
        <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 flex items-center gap-3 text-amber-900 dark:text-amber-200 text-xs sm:text-sm">
          <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
          <div className="flex-1">{errorMessage}</div>
          <button
            onClick={() => setErrorMessage(null)}
            className="p-1 hover:bg-amber-100 dark:hover:bg-amber-900/50 rounded"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* Scraped Jobs Table Section */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xs border border-gray-200 dark:border-gray-700 overflow-hidden transition-colors">
        {/* Table Top Header & Actions Toolbar */}
        <div className="p-4 sm:p-5 border-b dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3.5">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white">
                {lang === 'en' ? 'Scraped Job Results' : 'Résultats du Scraping'}
              </h3>
              <span className="px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-300 text-xs font-bold">
                {filteredJobs.length} {lang === 'en' ? 'offers' : 'offres'}
              </span>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              {lang === 'en' 
                ? 'Click on the "+" button next to any offer to transfer it directly to your applications list.'
                : 'Cliquez sur le bouton "+" à côté d\'une offre pour la transférer immédiatement dans vos candidatures.'}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 flex-wrap">
            {selectedJobIds.size > 0 && (
              <button
                type="button"
                onClick={handleBatchTransfer}
                className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs sm:text-sm font-bold shadow-xs transition-colors cursor-pointer flex items-center gap-1.5 animate-in fade-in"
              >
                <Plus size={15} />
                <span>
                  {lang === 'en'
                    ? `Transfer ${selectedJobIds.size} selected (+)`
                    : `Transférer ${selectedJobIds.size} sélectionnées (+)`}
                </span>
              </button>
            )}

            <button
              type="button"
              onClick={handleExportCSV}
              disabled={scrapedJobs.length === 0}
              className="px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 rounded-xl text-xs sm:text-sm font-semibold hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors cursor-pointer shadow-2xs flex items-center gap-1.5 disabled:opacity-50"
              title="Exporter en CSV"
            >
              <Download size={14} className="text-emerald-600 dark:text-emerald-400" />
              <span>{lang === 'en' ? 'Export CSV' : 'Exporter CSV'}</span>
            </button>

            <button
              type="button"
              onClick={handleLaunchScrape}
              disabled={isScraping}
              className="px-3 py-2 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 rounded-xl text-xs sm:text-sm font-semibold hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <RefreshCw size={14} className={isScraping ? 'animate-spin' : ''} />
              <span>{lang === 'en' ? 'Refresh' : 'Actualiser'}</span>
            </button>
          </div>
        </div>

        {/* Filter bar within results */}
        {scrapedJobs.length > 0 && (
          <div className="p-3.5 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="relative flex-1 sm:max-w-md">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={tableSearch}
                onChange={(e) => setTableSearch(e.target.value)}
                placeholder={lang === 'en' ? 'Filter by title, company, location...' : 'Filtrer par poste, entreprise, lieu...'}
                className="w-full pl-9 pr-3 py-1.5 text-xs sm:text-sm bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"
              />
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {/* Filter by keyword if multiple were searched */}
              {searchedKeywordsList.length > 1 && (
                <select
                  value={tableKeywordFilter}
                  onChange={(e) => setTableKeywordFilter(e.target.value)}
                  className="px-2.5 py-1.5 text-xs bg-gray-50 dark:bg-gray-900 border border-blue-200 dark:border-blue-800 rounded-xl text-blue-800 dark:text-blue-200 font-semibold outline-none"
                >
                  <option value="all">{lang === 'en' ? 'All Keywords' : 'Tous mots-clés'}</option>
                  {searchedKeywordsList.map(kw => (
                    <option key={kw} value={kw}>{kw}</option>
                  ))}
                </select>
              )}

              {/* Filter by platform */}
              <select
                value={tablePlatformFilter}
                onChange={(e) => setTablePlatformFilter(e.target.value)}
                className="px-2.5 py-1.5 text-xs bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-700 dark:text-gray-300 outline-none"
              >
                <option value="all">{lang === 'en' ? 'All Platforms' : 'Toutes plateformes'}</option>
                {SUPPORTED_JOB_BOARDS.map(b => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </select>

              {/* Filter by contract in table */}
              <select
                value={tableContractFilter}
                onChange={(e) => setTableContractFilter(e.target.value)}
                className="px-2.5 py-1.5 text-xs bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-700 dark:text-gray-300 outline-none"
              >
                <option value="all">{lang === 'en' ? 'All Contracts' : 'Tous contrats'}</option>
                <option value="CDI">CDI</option>
                <option value="CDD">CDD</option>
                <option value="Stage">Stage</option>
                <option value="Alternance">Alternance</option>
                <option value="Freelance">Freelance</option>
              </select>
            </div>
          </div>
        )}

        {/* Results Table OR Clean Empty State */}
        {scrapedJobs.length === 0 ? (
          <div className="p-12 text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto shadow-inner">
              <Search size={26} />
            </div>
            <div className="space-y-1">
              <h4 className="text-base font-bold text-gray-900 dark:text-white">
                {hasSearched
                  ? (lang === 'en' ? 'No offers found' : 'Aucune offre trouvée')
                  : (lang === 'en' ? 'Ready to scrape live jobs' : 'Prêt à scraper des offres en direct')}
              </h4>
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 max-w-md mx-auto leading-relaxed">
                {hasSearched
                  ? (lang === 'en' 
                      ? 'No jobs returned for your query. Try broadening your keywords, location, or selecting other portals.' 
                      : 'Aucun résultat renvoyé pour ces critères. Essayez d\'élargir les mots-clés ou de cibler d\'autres plateformes.')
                  : (lang === 'en' 
                      ? 'Configure your keywords and target platforms above, then click "Scrape Jobs" to fetch live postings directly via JobSpy.' 
                      : 'Indiquez vos mots-clés et plateformes cibles ci-dessus, puis cliquez sur "Lancer le Scraper" pour extraire en temps réel les offres réelles.')}
              </p>
            </div>
            {!hasSearched && (
              <button
                type="button"
                onClick={handleLaunchScrape}
                disabled={isScraping}
                className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl text-xs sm:text-sm font-bold shadow-md shadow-blue-500/20 transition-all cursor-pointer inline-flex items-center gap-2"
              >
                <Zap size={15} className="fill-amber-300 text-amber-300" />
                <span>{lang === 'en' ? 'Launch Scraper Now' : 'Lancer le Scraper Maintenant'}</span>
              </button>
            )}
          </div>
        ) : filteredJobs.length === 0 ? (
          <div className="p-8 text-center space-y-3">
            <h4 className="text-sm font-bold text-gray-900 dark:text-white">
              {lang === 'en' ? 'No offers match table filter' : 'Aucune offre ne correspond au filtre du tableau'}
            </h4>
            <button
              type="button"
              onClick={() => { setTableSearch(''); setTablePlatformFilter('all'); setTableContractFilter('all'); setTableKeywordFilter('all'); }}
              className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700 transition-colors"
            >
              {lang === 'en' ? 'Reset Table Filters' : 'Réinitialiser les filtres'}
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-100/60 dark:bg-gray-900/60 text-gray-600 dark:text-gray-400 text-[11px] sm:text-xs font-bold uppercase tracking-wider border-b border-gray-200 dark:border-gray-700">
                  <th className="p-3 sm:p-4 w-10 text-center">
                    <input
                      type="checkbox"
                      checked={selectedJobIds.size === filteredJobs.length && filteredJobs.length > 0}
                      onChange={handleToggleSelectAll}
                      className="rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                      title="Tout sélectionner"
                    />
                  </th>
                  <th className="p-3 sm:p-4">{lang === 'en' ? 'Job Title & Role' : 'Intitulé du Poste'}</th>
                  <th className="p-3 sm:p-4">{lang === 'en' ? 'Company' : 'Entreprise'}</th>
                  <th className="p-3 sm:p-4">{lang === 'en' ? 'Relevance' : 'Pertinence'}</th>
                  <th className="p-3 sm:p-4">{lang === 'en' ? 'Platform / Source' : 'Plateforme / Source'}</th>
                  <th className="p-3 sm:p-4">{lang === 'en' ? 'Location & Mode' : 'Lieu & Mode'}</th>
                  <th className="p-3 sm:p-4">{lang === 'en' ? 'Contract' : 'Contrat'}</th>
                  <th className="p-3 sm:p-4">{lang === 'en' ? 'Date' : 'Publication'}</th>
                  <th className="p-3 sm:p-4 text-right">{lang === 'en' ? 'Actions & Transfer' : 'Actions & Transfert'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700 text-xs sm:text-sm">
                {filteredJobs.map((job) => {
                  const jobKey = `${job.company.toLowerCase().trim()}___${job.title.toLowerCase().trim()}`;
                  const isTransferred = transferredJobKeys.has(jobKey);
                  const isSelected = selectedJobIds.has(job.id);
                  const relScore = job.relevanceScore || 75;

                  return (
                    <tr
                      key={job.id}
                      className={`hover:bg-blue-50/40 dark:hover:bg-blue-950/20 transition-colors ${
                        isSelected ? 'bg-blue-50/60 dark:bg-blue-900/20' : ''
                      }`}
                    >
                      {/* Checkbox */}
                      <td className="p-3 sm:p-4 text-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggleSelectJob(job.id)}
                          className="rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                        />
                      </td>

                      {/* Job Title */}
                      <td className="p-3 sm:p-4">
                        <div className="font-bold text-gray-900 dark:text-white">
                          <span
                            className="hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer"
                            onClick={() => setViewingJob(job)}
                          >
                            {job.title}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 flex-wrap mt-0.5">
                          {job.salary && job.salary !== 'Non spécifié' && (
                            <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                              {job.salary}
                            </span>
                          )}
                          {job.matchedKeyword && (
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-blue-50 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 font-bold text-[10px] border border-blue-200 dark:border-blue-800/70">
                              <Tag size={9} className="text-blue-500 shrink-0" />
                              <span>{job.matchedKeyword}</span>
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Company */}
                      <td className="p-3 sm:p-4">
                        <div className="flex items-center gap-2.5">
                          <div className={`w-7 h-7 rounded-lg ${job.companyColor} text-white font-bold text-xs flex items-center justify-center shadow-2xs shrink-0`}>
                            {job.companyLogo}
                          </div>
                          <div className="font-semibold text-gray-900 dark:text-gray-100">
                            {job.company}
                          </div>
                        </div>
                      </td>

                      {/* Relevance Score */}
                      <td className="p-3 sm:p-4">
                        <div className="flex items-center gap-2">
                          <div className="w-14 bg-gray-200 dark:bg-gray-700 h-2 rounded-full overflow-hidden shrink-0">
                            <div
                              className={`h-full ${
                                relScore >= 80
                                  ? 'bg-emerald-500'
                                  : relScore >= 65
                                  ? 'bg-blue-500'
                                  : 'bg-amber-500'
                              }`}
                              style={{ width: `${relScore}%` }}
                            />
                          </div>
                          <span
                            className={`text-xs font-black px-1.5 py-0.5 rounded ${
                              relScore >= 80
                                ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                                : relScore >= 65
                                ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300'
                                : 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300'
                            }`}
                          >
                            {relScore}%
                          </span>
                        </div>
                      </td>

                      {/* Platform / Source */}
                      <td className="p-3 sm:p-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${job.platformColor}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${job.platformDot}`} />
                          {job.platformName}
                        </span>
                      </td>

                      {/* Location & Mode */}
                      <td className="p-3 sm:p-4">
                        <div className="text-gray-800 dark:text-gray-200 font-medium">
                          {job.location}
                        </div>
                        <div className="text-[11px] text-gray-500 dark:text-gray-400">
                          {job.workplaceLabel}
                        </div>
                      </td>

                      {/* Contract */}
                      <td className="p-3 sm:p-4">
                        <span className={`px-2.5 py-0.5 rounded-md font-bold text-xs border ${getContractBadgeStyle(job.contract)}`}>
                          {job.contract}
                        </span>
                      </td>

                      {/* Date Posted */}
                      <td className="p-3 sm:p-4 text-gray-600 dark:text-gray-400 text-xs">
                        {job.posted}
                      </td>

                      {/* Actions & Transfer Button (+) */}
                      <td className="p-3 sm:p-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Preview Details Button */}
                          <button
                            type="button"
                            onClick={() => setViewingJob(job)}
                            className="p-1.5 text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors cursor-pointer"
                            title={lang === 'en' ? 'View Job Details' : 'Voir le détail de l\'offre'}
                          >
                            <Eye size={16} />
                          </button>

                          {/* Open External URL */}
                          {job.url && (
                            <a
                              href={job.url}
                              target="_blank"
                              rel="noreferrer"
                              onClick={(e) => openExternalLink(job.url, e)}
                              className="p-1.5 text-gray-500 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors cursor-pointer"
                              title={lang === 'en' ? 'Open on Source Website' : 'Ouvrir sur le site d\'origine'}
                            >
                              <ExternalLink size={16} />
                            </a>
                          )}

                          {/* "+" Button to Transfer to Applications Tab */}
                          <button
                            type="button"
                            onClick={() => handleTransferToApplications(job)}
                            disabled={isTransferred}
                            className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all shadow-2xs cursor-pointer ${
                              isTransferred
                                ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700 cursor-default opacity-90'
                                : 'bg-blue-600 hover:bg-blue-700 active:scale-95 text-white shadow-blue-500/20'
                            }`}
                            title={
                              isTransferred
                                ? (lang === 'en' ? 'Already in your applications tracker' : 'Déjà présent dans vos candidatures')
                                : (lang === 'en' ? 'Transfer this job offer to My Applications tab (+)' : 'Transférer cette offre dans l\'onglet Candidatures (+)')
                            }
                          >
                            {isTransferred ? (
                              <>
                                <Check size={14} className="stroke-[3]" />
                                <span>{lang === 'en' ? 'Added' : 'Transféré'}</span>
                              </>
                            ) : (
                              <>
                                <Plus size={15} className="stroke-[3]" />
                                <span>{lang === 'en' ? 'Add' : 'Transférer'}</span>
                              </>
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal for Detailed Job View */}
      {viewingJob && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-5 border-b border-gray-200 dark:border-gray-700 bg-gray-50/70 dark:bg-gray-900/50 flex items-start justify-between gap-4">
              <div className="flex items-start gap-3.5">
                <div className={`w-11 h-11 rounded-xl ${viewingJob.companyColor} text-white font-black text-base flex items-center justify-center shadow-xs shrink-0`}>
                  {viewingJob.companyLogo}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white leading-tight">
                    {viewingJob.title}
                  </h3>
                  <div className="text-xs font-semibold text-gray-600 dark:text-gray-300 mt-1 flex items-center gap-2 flex-wrap">
                    <span className="text-blue-600 dark:text-blue-400">{viewingJob.company}</span>
                    <span>•</span>
                    <span>{viewingJob.location}</span>
                    <span>•</span>
                    <span className={`px-2.5 py-0.5 rounded-md font-bold text-[11px] border ${getContractBadgeStyle(viewingJob.contract)}`}>
                      {viewingJob.contract}
                    </span>
                    {viewingJob.matchedKeyword && (
                      <>
                        <span>•</span>
                        <span className="px-2 py-0.5 rounded-md font-bold text-[11px] bg-blue-100 dark:bg-blue-900/60 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-800 flex items-center gap-1">
                          <Tag size={10} className="text-blue-500" />
                          <span>{viewingJob.matchedKeyword}</span>
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setViewingJob(null)}
                className="p-2 rounded-xl text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 sm:p-6 overflow-y-auto space-y-4 text-xs sm:text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
              {/* Badges Bar */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 p-3 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700">
                <div>
                  <div className="text-[10px] font-bold uppercase text-gray-400">Pertinence</div>
                  <div className="font-black text-amber-600 dark:text-amber-400 mt-0.5 flex items-center gap-1">
                    <Sparkles size={12} />
                    <span>{viewingJob.relevanceScore || 75}%</span>
                  </div>
                </div>
                <div>
                  <div className="text-[10px] font-bold uppercase text-gray-400">Plateforme</div>
                  <div className="font-bold text-gray-900 dark:text-white mt-0.5">{viewingJob.platformName}</div>
                </div>
                <div>
                  <div className="text-[10px] font-bold uppercase text-gray-400">Salaire estimé</div>
                  <div className="font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">{viewingJob.salary}</div>
                </div>
                <div>
                  <div className="text-[10px] font-bold uppercase text-gray-400">Mode de travail</div>
                  <div className="font-bold text-gray-900 dark:text-white mt-0.5">{viewingJob.workplaceLabel}</div>
                </div>
                <div>
                  <div className="text-[10px] font-bold uppercase text-gray-400">Publication</div>
                  <div className="font-bold text-gray-900 dark:text-white mt-0.5">{viewingJob.posted}</div>
                </div>
              </div>

              {/* Description Content */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  {lang === 'en' ? 'Job Description & Requirements' : 'Description de l\'offre & Profil'}
                </h4>
                <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 whitespace-pre-line font-sans text-xs leading-relaxed max-h-80 overflow-y-auto">
                  {viewingJob.description || (lang === 'en' ? 'No detailed description provided.' : 'Aucune description détaillée fournie.')}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50/70 dark:bg-gray-900/50 flex flex-col sm:flex-row items-center justify-between gap-3">
              {viewingJob.url ? (
                <a
                  href={viewingJob.url}
                  target="_blank"
                  rel="noreferrer"
                  onClick={(e) => openExternalLink(viewingJob.url, e)}
                  className="w-full sm:w-auto px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <span>{lang === 'en' ? 'View on Source Website' : 'Voir sur le site officiel'}</span>
                  <ExternalLink size={14} />
                </a>
              ) : <div />}

              <div className="flex items-center gap-2 w-full sm:w-auto">
                {onGoToTailor && (
                  <button
                    type="button"
                    onClick={() => {
                      onGoToTailor(viewingJob.description);
                      setViewingJob(null);
                    }}
                    className="flex-1 sm:flex-none px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <Sparkles size={14} />
                    <span>{lang === 'en' ? 'Tailor CV with AI' : 'Adapter mon CV'}</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => {
                    handleTransferToApplications(viewingJob);
                    setViewingJob(null);
                  }}
                  className="flex-1 sm:flex-none px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Plus size={15} />
                  <span>{lang === 'en' ? 'Transfer to Applications (+)' : 'Transférer dans mes Candidatures (+)'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
