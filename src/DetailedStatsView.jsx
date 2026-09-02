import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';
import {
  Briefcase,
  Clock,
  CheckCircle,
  XCircle,
  Ghost,
  Timer,
  Percent,
  TrendingUp,
  TrendingDown,
  Filter,
  Download,
  Search,
  ExternalLink,
  Sparkles,
  Layers,
  ArrowRight,
  RotateCcw,
  Building2,
  FileSpreadsheet,
  FileCode,
  Check,
  Globe
} from 'lucide-react';
import { STATUS_KEYS, CONTRACT_KEYS, SOURCE_KEYS, isApplicationGhosted } from './App';

export const DetailedStatsView = ({
  applications = [],
  t = {},
  lang = 'fr',
  onGoToTailor,
  onUpdateStatus,
  formatExternalUrl
}) => {
  // Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [selectedContract, setSelectedContract] = useState('ALL');
  const [selectedSource, setSelectedSource] = useState('ALL');
  const [sortOrder, setSortOrder] = useState('date-desc');
  const [exportNotice, setExportNotice] = useState('');

  // Velocity Line Visibility State (interactive toggles)
  const [visibleLines, setVisibleLines] = useState({
    sent: true,
    responses: true,
    successRate: true
  });

  const toggleLine = (lineKey) => {
    setVisibleLines(prev => {
      // Ensure at least one line remains visible
      const activeCount = Object.values(prev).filter(Boolean).length;
      if (prev[lineKey] && activeCount <= 1) return prev;
      return { ...prev, [lineKey]: !prev[lineKey] };
    });
  };

  // Helpers for calculation
  const getAppResponseDays = (app) => {
    const isAnswered = ['Entretien', 'Interview', 'Offre', 'Offer', 'Refusé', 'Rejected'].includes(app.status) || Boolean(app.responseDate);
    if (!isAnswered || !app.date) return null;
    const appDate = new Date(app.date);
    const respDateStr = app.responseDate || app.statusModifiedAt || new Date().toISOString().split('T')[0];
    const respDate = new Date(respDateStr);
    if (isNaN(appDate.getTime()) || isNaN(respDate.getTime())) return null;
    const d1 = Date.UTC(appDate.getFullYear(), appDate.getMonth(), appDate.getDate());
    const d2 = Date.UTC(respDate.getFullYear(), respDate.getMonth(), respDate.getDate());
    return Math.max(0, Math.round((d2 - d1) / (1000 * 60 * 60 * 24)));
  };

  const getSourceBadgeStyle = (src) => {
    switch (src) {
      case 'LinkedIn': return 'bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-950/40 dark:text-sky-300 dark:border-sky-800';
      case 'Welcome to the Jungle': return 'bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800';
      case 'Workday': return 'bg-blue-50 text-blue-800 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800';
      case 'Greenhouse': return 'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800';
      case 'Lever': return 'bg-indigo-50 text-indigo-800 border-indigo-200 dark:bg-indigo-950/40 dark:text-indigo-300 dark:border-indigo-800';
      case 'SmartRecruiters': return 'bg-teal-50 text-teal-800 border-teal-200 dark:bg-teal-950/40 dark:text-teal-300 dark:border-teal-800';
      case 'Indeed': return 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800';
      default: return 'bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Postulé':
      case 'Applied':
      case 'En cours':
      case 'In Progress':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300 border-blue-200 dark:border-blue-800';
      case 'Entretien':
      case 'Interview':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300 border-purple-200 dark:border-purple-800';
      case 'Offre':
      case 'Offer':
        return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800';
      case 'Refusé':
      case 'Rejected':
        return 'bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300 border-rose-200 dark:border-rose-800';
      case 'Ghosted':
      case 'Ghosté':
      case 'Sans réponse (Ghosté)':
      case 'Sans réponse':
        return 'bg-slate-200/80 text-slate-800 dark:bg-slate-700 dark:text-slate-200 border-slate-300 dark:border-slate-600';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700';
    }
  };

  // Basic Metrics
  const totalApplications = applications.length;
  const interviewsCount = applications.filter(app => ['Entretien', 'Interview'].includes(app.status)).length;
  const offersCount = applications.filter(app => ['Offre', 'Offer'].includes(app.status)).length;
  const rejectionsCount = applications.filter(app => ['Refusé', 'Rejected'].includes(app.status)).length;
  const ghostedCount = applications.filter(app => isApplicationGhosted(app) || ['Ghosted', 'Ghosté', 'Sans réponse (Ghosté)', 'Sans réponse'].includes(app.status)).length;

  const answeredApps = useMemo(() => {
    return applications.filter(app => ['Entretien', 'Interview', 'Offre', 'Offer', 'Refusé', 'Rejected'].includes(app.status) || Boolean(app.responseDate));
  }, [applications]);

  const avgResponseDays = useMemo(() => {
    const responseTimes = answeredApps
      .map(getAppResponseDays)
      .filter(days => days !== null && !isNaN(days));

    return responseTimes.length > 0
      ? (responseTimes.reduce((acc, curr) => acc + curr, 0) / responseTimes.length).toFixed(1)
      : null;
  }, [answeredApps]);

  const overallReplyRate = totalApplications > 0 ? Math.round((answeredApps.length / totalApplications) * 100) : 0;
  const interviewRate = totalApplications > 0 ? Math.round((interviewsCount / totalApplications) * 100) : 0;
  const offerRate = totalApplications > 0 ? Math.round((offersCount / totalApplications) * 100) : 0;

  // 1. APPLICATION VELOCITY (Dual-Axis / Timeline Graph)
  const velocityData = useMemo(() => {
    if (!applications || applications.length === 0) return [];

    // Map all application sent dates and response dates into YYYY-MM buckets
    const monthMap = {};

    // Helper to get YYYY-MM
    const getYearMonth = (dateStr) => {
      if (!dateStr) return null;
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return null;
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      return `${y}-${m}`;
    };

    applications.forEach(app => {
      // Sent date
      const sentYM = getYearMonth(app.date);
      if (sentYM) {
        if (!monthMap[sentYM]) {
          monthMap[sentYM] = { ym: sentYM, sent: 0, responses: 0, interviews: 0, offers: 0, rejections: 0 };
        }
        monthMap[sentYM].sent += 1;
      }

      // Response date
      const isAnswered = ['Entretien', 'Interview', 'Offre', 'Offer', 'Refusé', 'Rejected'].includes(app.status) || Boolean(app.responseDate);
      if (isAnswered) {
        const respDateStr = app.responseDate || app.statusModifiedAt || app.date;
        const respYM = getYearMonth(respDateStr);
        if (respYM) {
          if (!monthMap[respYM]) {
            monthMap[respYM] = { ym: respYM, sent: 0, responses: 0, interviews: 0, offers: 0, rejections: 0 };
          }
          monthMap[respYM].responses += 1;
          if (['Entretien', 'Interview'].includes(app.status)) monthMap[respYM].interviews += 1;
          if (['Offre', 'Offer'].includes(app.status)) monthMap[respYM].offers += 1;
          if (['Refusé', 'Rejected'].includes(app.status)) monthMap[respYM].rejections += 1;
        }
      }
    });

    // Fixed 13-month calendar timeline: starts in January (startYear) and ends in January of next year (startYear + 1)
    const now = new Date();
    let startYear = now.getFullYear();

    if (applications.length > 0) {
      const validDates = applications
        .map(a => a.date ? new Date(a.date) : null)
        .filter(d => d && !isNaN(d.getTime()));
      if (validDates.length > 0) {
        startYear = Math.min(...validDates.map(d => d.getFullYear()));
      }
    }

    const result = [];
    const monthNamesFr = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'];
    const monthNamesEn = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const names = lang === 'en' ? monthNamesEn : monthNamesFr;

    // Iterate through all 13 consecutive months from January (m=0) to January next year (m=12)
    for (let m = 0; m <= 12; m++) {
      const currentMonth = new Date(startYear, m, 1);
      const y = currentMonth.getFullYear();
      const monthIndex = currentMonth.getMonth(); // 0 to 11
      const ymStr = `${y}-${String(monthIndex + 1).padStart(2, '0')}`;
      const label = `${names[monthIndex]} ${String(y).slice(2)}`;

      const data = monthMap[ymStr] || { sent: 0, responses: 0, interviews: 0, offers: 0, rejections: 0 };
      const successRate = data.sent > 0 ? Math.round((data.responses / data.sent) * 100) : 0;

      result.push({
        ym: ymStr,
        month: label,
        sent: data.sent,
        responses: data.responses,
        interviews: data.interviews,
        offers: data.offers,
        rejections: data.rejections,
        replyRatio: successRate,
        successRate: successRate
      });
    }

    return result;
  }, [applications, lang]);

  // Calculate unified maximum scale for the count metrics on the left Y-axis
  const maxVelocityValue = useMemo(() => {
    if (!velocityData || velocityData.length === 0) return 5;
    let max = 0;
    velocityData.forEach(d => {
      if (d.sent > max) max = d.sent;
      if (d.responses > max) max = d.responses;
    });
    return Math.max(max + 1, 5);
  }, [velocityData]);

  // 2. PLATFORM BAR CHART DATA (Keep platform analysis, but no table -> bar chart)
  const platformChartData = useMemo(() => {
    const map = {};

    applications.forEach(app => {
      const src = app.source || 'Workday';
      if (!map[src]) {
        map[src] = {
          source: src,
          total: 0,
          answered: 0,
          interviews: 0,
          offers: 0,
          rejections: 0,
          responseTimes: []
        };
      }
      const item = map[src];
      item.total += 1;

      const isInterview = ['Entretien', 'Interview'].includes(app.status);
      const isOffer = ['Offre', 'Offer'].includes(app.status);
      const isRejected = ['Refusé', 'Rejected'].includes(app.status);
      const isAnswered = isInterview || isOffer || isRejected || Boolean(app.responseDate);

      if (isInterview) item.interviews += 1;
      if (isOffer) item.offers += 1;
      if (isRejected) item.rejections += 1;

      if (isAnswered) {
        item.answered += 1;
        const days = getAppResponseDays(app);
        if (days !== null && !isNaN(days)) {
          item.responseTimes.push(days);
        }
      }
    });

    const list = Object.values(map).map(item => {
      const positiveCount = item.interviews + item.offers;
      const replyRate = item.total > 0 ? Math.round((item.answered / item.total) * 100) : 0;
      const positiveRate = item.total > 0 ? Math.round((positiveCount / item.total) * 100) : 0;
      const avgDays = item.responseTimes.length > 0
        ? (item.responseTimes.reduce((a, b) => a + b, 0) / item.responseTimes.length).toFixed(1)
        : null;

      return {
        source: item.source,
        shortName: item.source.length > 12 ? `${item.source.substring(0, 11)}...` : item.source,
        total: item.total,
        answered: item.answered,
        positive: positiveCount,
        interviews: item.interviews,
        offers: item.offers,
        rejections: item.rejections,
        replyRate,
        positiveRate,
        avgDays
      };
    });

    // Sort by total applications descending
    list.sort((a, b) => b.total - a.total);
    return list;
  }, [applications]);

  // Highlights for Platforms
  const platformHighlights = useMemo(() => {
    if (platformChartData.length === 0) return { mostReplies: null, leastReplies: null, bestPositive: null };

    const sortedByReplies = [...platformChartData].sort((a, b) => {
      if (b.replyRate !== a.replyRate) return b.replyRate - a.replyRate;
      return b.answered - a.answered;
    });
    const mostReplies = sortedByReplies[0];

    const sortedByLeast = [...platformChartData].sort((a, b) => {
      if (a.replyRate !== b.replyRate) return a.replyRate - b.replyRate;
      return a.answered - b.answered;
    });
    const leastReplies = sortedByLeast[0];

    const sortedByPositive = [...platformChartData].sort((a, b) => b.positive - a.positive);
    const bestPositive = sortedByPositive[0]?.positive > 0 ? sortedByPositive[0] : null;

    return { mostReplies, leastReplies, bestPositive };
  }, [platformChartData]);

  // 3. FILTERED APPLICATIONS TABLE
  const filteredApplications = useMemo(() => {
    return applications.filter(app => {
      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const companyMatch = (app.company || '').toLowerCase().includes(q);
        const roleMatch = (app.role || '').toLowerCase().includes(q);
        const sourceMatch = (app.source || '').toLowerCase().includes(q);
        const contractMatch = (app.type || '').toLowerCase().includes(q);
        if (!companyMatch && !roleMatch && !sourceMatch && !contractMatch) {
          return false;
        }
      }

      // Status filter
      if (selectedStatus !== 'ALL') {
        if (selectedStatus === 'Ghosted') {
          if (!isApplicationGhosted(app) && !['Ghosted', 'Ghosté', 'Sans réponse (Ghosté)', 'Sans réponse'].includes(app.status)) {
            return false;
          }
        } else if (selectedStatus === 'Entretien' && !['Entretien', 'Interview'].includes(app.status)) {
          return false;
        } else if (selectedStatus === 'Offre' && !['Offre', 'Offer'].includes(app.status)) {
          return false;
        } else if (selectedStatus === 'Refusé' && !['Refusé', 'Rejected'].includes(app.status)) {
          return false;
        } else if (selectedStatus === 'Postulé' && !['Postulé', 'Applied', 'En cours', 'In Progress'].includes(app.status)) {
          return false;
        }
      }

      // Contract filter
      if (selectedContract !== 'ALL') {
        if ((app.type || 'CDI') !== selectedContract) return false;
      }

      // Source filter
      if (selectedSource !== 'ALL') {
        if ((app.source || 'Workday') !== selectedSource) return false;
      }

      return true;
    }).sort((a, b) => {
      if (sortOrder === 'date-desc') {
        return new Date(b.date || 0) - new Date(a.date || 0);
      }
      if (sortOrder === 'date-asc') {
        return new Date(a.date || 0) - new Date(b.date || 0);
      }
      if (sortOrder === 'company-asc') {
        return (a.company || '').localeCompare(b.company || '');
      }
      if (sortOrder === 'response-days') {
        const dA = getAppResponseDays(a) ?? 999;
        const dB = getAppResponseDays(b) ?? 999;
        return dA - dB;
      }
      return 0;
    });
  }, [applications, searchQuery, selectedStatus, selectedContract, selectedSource, sortOrder]);

  // Unique sources in applications for the filter dropdown
  const availableSources = useMemo(() => {
    const set = new Set();
    applications.forEach(a => {
      if (a.source) set.add(a.source);
    });
    SOURCE_KEYS.forEach(k => set.add(k));
    return Array.from(set).sort();
  }, [applications]);

  // 4. EXPORT HANDLERS
  const handleExportFilteredCSV = () => {
    if (filteredApplications.length === 0) return;

    const headers = [
      'Entreprise',
      'Poste',
      'Contrat',
      'Plateforme_ATS',
      'Date_Candidature',
      'Date_Reponse',
      'Delai_Jours',
      'Statut',
      'Lien_Offre'
    ];

    const rows = filteredApplications.map(app => [
      `"${(app.company || '').replace(/"/g, '""')}"`,
      `"${(app.role || '').replace(/"/g, '""')}"`,
      `"${(app.type || 'CDI').replace(/"/g, '""')}"`,
      `"${(app.source || 'Workday').replace(/"/g, '""')}"`,
      `"${app.date || ''}"`,
      `"${app.responseDate || ''}"`,
      `"${getAppResponseDays(app) ?? ''}"`,
      `"${(app.status || 'Postulé').replace(/"/g, '""')}"`,
      `"${(app.url || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = '\uFEFF' + [headers.join(';'), ...rows.map(r => r.join(';'))].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `PostuTrack_Candidatures_Filtrees_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setExportNotice(lang === 'en' ? 'CSV file exported successfully!' : 'Fichier CSV exporté avec succès !');
    setTimeout(() => setExportNotice(''), 3500);
  };

  const handleExportFilteredJSON = () => {
    if (filteredApplications.length === 0) return;

    const dataToExport = {
      exportDate: new Date().toISOString(),
      count: filteredApplications.length,
      filtersApplied: {
        searchQuery,
        status: selectedStatus,
        contract: selectedContract,
        source: selectedSource
      },
      applications: filteredApplications
    };

    const blob = new Blob([JSON.stringify(dataToExport, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `PostuTrack_Export_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setExportNotice(lang === 'en' ? 'JSON file exported successfully!' : 'Fichier JSON exporté avec succès !');
    setTimeout(() => setExportNotice(''), 3500);
  };

  const hasActiveFilters = searchQuery !== '' || selectedStatus !== 'ALL' || selectedContract !== 'ALL' || selectedSource !== 'ALL';

  const resetAllFilters = () => {
    setSearchQuery('');
    setSelectedStatus('ALL');
    setSelectedContract('ALL');
    setSelectedSource('ALL');
  };

  // Custom Velocity Tooltip
  const CustomVelocityTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white dark:bg-gray-800 p-3.5 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 text-xs 2xl:text-sm space-y-1.5 z-50">
          <p className="font-bold text-gray-900 dark:text-white border-b border-gray-100 dark:border-gray-700 pb-1 flex items-center justify-between gap-4">
            <span>{data.month}</span>
            <span className="text-[11px] font-mono font-normal text-gray-500 dark:text-gray-400">{data.ym}</span>
          </p>
          <div className="space-y-1 pt-0.5">
            <div className="flex items-center justify-between gap-4 text-blue-600 dark:text-blue-400 font-semibold">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-600 inline-block" />
                {t.appsSent || 'Candidatures envoyées'} :
              </span>
              <span className="font-mono font-bold text-gray-900 dark:text-white">{data.sent}</span>
            </div>
            <div className="flex items-center justify-between gap-4 text-emerald-600 dark:text-emerald-400 font-semibold">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
                {t.responsesReceived || 'Réponses reçues'} :
              </span>
              <span className="font-mono font-bold text-gray-900 dark:text-white">{data.responses}</span>
            </div>
            <div className="flex items-center justify-between gap-4 text-purple-600 dark:text-purple-400 font-semibold border-t border-gray-100 dark:border-gray-700/60 pt-1 mt-0.5">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-purple-500 inline-block" />
                {t.successRate || 'Taux de succès'} :
              </span>
              <span className="font-mono font-bold text-purple-600 dark:text-purple-300">{data.successRate}%</span>
            </div>
            {(data.interviews > 0 || data.offers > 0 || data.rejections > 0) && (
              <p className="text-[11px] text-gray-500 dark:text-gray-400 pl-4 pt-0.5">
                ({data.interviews} {t.interviews?.toLowerCase() || 'entretiens'}, {data.offers} {t.offersReceived?.toLowerCase() || 'offres'}, {data.rejections} {t.rejections?.toLowerCase() || 'refus'})
              </p>
            )}
          </div>
        </div>
      );
    }
    return null;
  };

  // Custom Platform Tooltip
  const CustomPlatformTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white dark:bg-gray-800 p-3.5 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 text-xs 2xl:text-sm space-y-1.5 z-50">
          <p className="font-bold text-gray-900 dark:text-white border-b border-gray-100 dark:border-gray-700 pb-1">
            {data.source}
          </p>
          <div className="space-y-1 pt-0.5">
            <div className="flex items-center justify-between gap-4">
              <span className="text-gray-600 dark:text-gray-400">{t.totalApplications || 'Candidatures'} :</span>
              <span className="font-bold text-blue-600 dark:text-blue-400 font-mono">{data.total}</span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="text-gray-600 dark:text-gray-400">{t.repliesCount || 'Réponses reçues'} :</span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400 font-mono">{data.answered}</span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="text-gray-600 dark:text-gray-400">{t.replyRate || 'Taux de réponse'} :</span>
              <span className="font-bold text-purple-600 dark:text-purple-400 font-mono">{data.replyRate}%</span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="text-gray-600 dark:text-gray-400">{t.positiveRate || 'Intérêt positif'} :</span>
              <span className="font-bold text-amber-600 dark:text-amber-400 font-mono">{data.positive} ({data.positiveRate}%)</span>
            </div>
            {data.avgDays && (
              <div className="flex items-center justify-between gap-4 pt-1 border-t border-gray-100 dark:border-gray-700">
                <span className="text-gray-500 dark:text-gray-400">{t.avgResponseTime || 'Délai moyen'} :</span>
                <span className="font-semibold text-gray-800 dark:text-gray-200">~{data.avgDays} {t.avgDays || 'j'}</span>
              </div>
            )}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6 sm:space-y-8 max-w-6xl xl:max-w-7xl 2xl:max-w-[1700px] mx-auto animate-in fade-in duration-300">
      
      {/* Toast Notification */}
      {exportNotice && (
        <div className="fixed bottom-6 right-6 z-50 bg-emerald-600 text-white px-4 py-3 rounded-2xl shadow-xl flex items-center gap-2.5 text-sm font-semibold animate-in slide-in-from-bottom-3 duration-200">
          <Check size={18} className="shrink-0" />
          <span>{exportNotice}</span>
        </div>
      )}


      {/* 1. ALL STATS METRICS GRID (Comprehensive View) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-3 sm:gap-4 2xl:gap-5">
        {/* Total Applications */}
        <div className="bg-white dark:bg-gray-800 p-4 sm:p-5 rounded-2xl shadow-xs border border-gray-100 dark:border-gray-700/80 flex flex-col justify-between hover:shadow-md transition-all">
          <div className="flex items-start justify-between gap-2 mb-2">
            <span className="text-xs font-semibold text-gray-600 dark:text-gray-400">{t.totalApplications}</span>
            <div className="p-2 bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 rounded-xl shrink-0">
              <Briefcase size={16} />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">{totalApplications}</p>
        </div>

        {/* Interviews */}
        <div className="bg-white dark:bg-gray-800 p-4 sm:p-5 rounded-2xl shadow-xs border border-gray-100 dark:border-gray-700/80 flex flex-col justify-between hover:shadow-md transition-all">
          <div className="flex items-start justify-between gap-2 mb-2">
            <span className="text-xs font-semibold text-gray-600 dark:text-gray-400">{t.interviews}</span>
            <div className="p-2 bg-purple-50 dark:bg-purple-900/40 text-purple-600 dark:text-purple-400 rounded-xl shrink-0">
              <Clock size={16} />
            </div>
          </div>
          <div>
            <p className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">{interviewsCount}</p>
            <p className="text-[11px] text-purple-600 dark:text-purple-400 font-semibold mt-0.5">{interviewRate}% {t.interviewRate || 'taux'}</p>
          </div>
        </div>

        {/* Offers */}
        <div className="bg-white dark:bg-gray-800 p-4 sm:p-5 rounded-2xl shadow-xs border border-gray-100 dark:border-gray-700/80 flex flex-col justify-between hover:shadow-md transition-all">
          <div className="flex items-start justify-between gap-2 mb-2">
            <span className="text-xs font-semibold text-gray-600 dark:text-gray-400">{t.offersReceived}</span>
            <div className="p-2 bg-emerald-50 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 rounded-xl shrink-0">
              <CheckCircle size={16} />
            </div>
          </div>
          <div>
            <p className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">{offersCount}</p>
            <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold mt-0.5">{offerRate}% {t.offerRate || 'taux'}</p>
          </div>
        </div>

        {/* Rejections */}
        <div className="bg-white dark:bg-gray-800 p-4 sm:p-5 rounded-2xl shadow-xs border border-gray-100 dark:border-gray-700/80 flex flex-col justify-between hover:shadow-md transition-all">
          <div className="flex items-start justify-between gap-2 mb-2">
            <span className="text-xs font-semibold text-gray-600 dark:text-gray-400">{t.rejections}</span>
            <div className="p-2 bg-rose-50 dark:bg-rose-900/40 text-rose-600 dark:text-rose-400 rounded-xl shrink-0">
              <XCircle size={16} />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">{rejectionsCount}</p>
        </div>

        {/* Ghosted */}
        <div className="bg-white dark:bg-gray-800 p-4 sm:p-5 rounded-2xl shadow-xs border border-gray-100 dark:border-gray-700/80 flex flex-col justify-between hover:shadow-md transition-all">
          <div className="flex items-start justify-between gap-2 mb-2">
            <span className="text-xs font-semibold text-gray-600 dark:text-gray-400">{t.ghostedCountLabel || 'Ghosté(s)'}</span>
            <div className="p-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl shrink-0">
              <Ghost size={16} />
            </div>
          </div>
          <div>
            <p className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">{ghostedCount}</p>
            <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-0.5">{t.ghostedTooltip || '> 14j sans retour'}</p>
          </div>
        </div>

        {/* Reply Rate */}
        <div className="bg-white dark:bg-gray-800 p-4 sm:p-5 rounded-2xl shadow-xs border border-gray-100 dark:border-gray-700/80 flex flex-col justify-between hover:shadow-md transition-all">
          <div className="flex items-start justify-between gap-2 mb-2">
            <span className="text-xs font-semibold text-gray-600 dark:text-gray-400">{t.replyRate}</span>
            <div className="p-2 bg-indigo-50 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 rounded-xl shrink-0">
              <Percent size={16} />
            </div>
          </div>
          <div>
            <p className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">{overallReplyRate}%</p>
            <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-0.5">{answeredApps.length} / {totalApplications}</p>
          </div>
        </div>

        {/* Average Response Time */}
        <div className="bg-white dark:bg-gray-800 p-4 sm:p-5 rounded-2xl shadow-xs border border-gray-100 dark:border-gray-700/80 flex flex-col justify-between hover:shadow-md transition-all">
          <div className="flex items-start justify-between gap-2 mb-2">
            <span className="text-xs font-semibold text-gray-600 dark:text-gray-400">{t.avgResponseTime}</span>
            <div className="p-2 bg-amber-50 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400 rounded-xl shrink-0">
              <Timer size={16} />
            </div>
          </div>
          <div>
            {avgResponseDays !== null ? (
              <p className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight flex items-baseline gap-1">
                {avgResponseDays} <span className="text-xs font-semibold text-gray-500">{t.avgDays || 'j'}</span>
              </p>
            ) : (
              <p className="text-xs text-gray-400 dark:text-gray-500">-</p>
            )}
          </div>
        </div>
      </div>

      {/* 2. DUAL-AXIS LINE GRAPH: APPLICATION VELOCITY */}
      <div className="bg-white dark:bg-gray-800 rounded-3xl p-5 sm:p-7 shadow-xs border border-gray-100 dark:border-gray-700">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400">
                <TrendingUp size={18} />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
                {t.appVelocity || 'Vélocité des candidatures (Timeline & Réponses)'}
              </h3>
            </div>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
              {t.appVelocitySubtitle || 'Évolution dans le temps : volume de candidatures envoyées vs volume de réponses reçues (entretiens et refus).'}
            </p>
          </div>

          <div className="flex items-center flex-wrap gap-2 sm:gap-3 text-xs font-semibold">
            {/* Toggle Applications Sent */}
            <button
              type="button"
              onClick={() => toggleLine('sent')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border transition-all cursor-pointer select-none ${
                visibleLines.sent
                  ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border-blue-300 dark:border-blue-700 shadow-2xs'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500 border-gray-200 dark:border-gray-700 opacity-60 hover:opacity-100'
              }`}
              title={visibleLines.sent ? 'Cliquer pour masquer' : 'Cliquer pour afficher'}
            >
              <span className={`w-2.5 h-2.5 rounded-full shrink-0 transition-opacity ${visibleLines.sent ? 'bg-blue-600' : 'bg-gray-400'}`} />
              <span className={!visibleLines.sent ? 'line-through' : ''}>{t.appsSent || 'Candidatures envoyées'}</span>
            </button>

            {/* Toggle Responses Received */}
            <button
              type="button"
              onClick={() => toggleLine('responses')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border transition-all cursor-pointer select-none ${
                visibleLines.responses
                  ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700 shadow-2xs'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500 border-gray-200 dark:border-gray-700 opacity-60 hover:opacity-100'
              }`}
              title={visibleLines.responses ? 'Cliquer pour masquer' : 'Cliquer pour afficher'}
            >
              <span className={`w-2.5 h-2.5 rounded-full shrink-0 transition-opacity ${visibleLines.responses ? 'bg-emerald-500' : 'bg-gray-400'}`} />
              <span className={!visibleLines.responses ? 'line-through' : ''}>{t.responsesReceived || 'Réponses reçues'}</span>
            </button>

            {/* Toggle Success Rate */}
            <button
              type="button"
              onClick={() => toggleLine('successRate')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border transition-all cursor-pointer select-none ${
                visibleLines.successRate
                  ? 'bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border-purple-300 dark:border-purple-700 shadow-2xs'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500 border-gray-200 dark:border-gray-700 opacity-60 hover:opacity-100'
              }`}
              title={visibleLines.successRate ? 'Cliquer pour masquer' : 'Cliquer pour afficher'}
            >
              <span className={`w-2.5 h-2.5 rounded-full shrink-0 transition-opacity ${visibleLines.successRate ? 'bg-purple-500' : 'bg-gray-400'}`} />
              <span className={!visibleLines.successRate ? 'line-through' : ''}>{t.successRate || 'Taux de succès'} (%)</span>
            </button>
          </div>
        </div>

        {velocityData.length > 0 ? (
          <div className="h-72 sm:h-80 2xl:h-96 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={velocityData} margin={{ top: 15, right: 15, left: -10, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" className="dark:stroke-gray-700/60" vertical={false} />
                <XAxis 
                  dataKey="month" 
                  interval={0}
                  tick={{ fill: '#64748b', fontSize: 11, fontWeight: 600 }} 
                  axisLine={{ stroke: '#cbd5e1' }}
                  tickLine={{ stroke: '#cbd5e1' }}
                  dy={4}
                  minTickGap={0}
                  padding={{ left: 10, right: 10 }}
                />
                {(visibleLines.sent || visibleLines.responses) && (
                  <YAxis 
                    yAxisId="left"
                    domain={[0, maxVelocityValue]}
                    allowDecimals={false}
                    tick={{ fill: '#64748b', fontSize: 12, fontWeight: 500 }}
                    axisLine={{ stroke: '#cbd5e1' }}
                    tickLine={false}
                  />
                )}
                {visibleLines.successRate && (
                  <YAxis 
                    yAxisId="right"
                    orientation="right"
                    domain={[0, 100]}
                    ticks={[0, 25, 50, 75, 100]}
                    tickFormatter={(val) => `${val}%`}
                    tick={{ fill: '#a855f7', fontSize: 12, fontWeight: 500 }}
                    axisLine={{ stroke: '#d8b4fe' }}
                    tickLine={false}
                  />
                )}
                <Tooltip content={<CustomVelocityTooltip />} />
                {visibleLines.sent && (
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="sent"
                    name={t.appsSent || 'Candidatures envoyées'}
                    stroke="#2563eb"
                    strokeWidth={3.5}
                    dot={{ r: 4.5, fill: '#2563eb', strokeWidth: 2, stroke: '#fff' }}
                    activeDot={{ r: 7, strokeWidth: 2, stroke: '#fff' }}
                  />
                )}
                {visibleLines.responses && (
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="responses"
                    name={t.responsesReceived || 'Réponses reçues'}
                    stroke="#10b981"
                    strokeWidth={3.5}
                    dot={{ r: 4.5, fill: '#10b981', strokeWidth: 2, stroke: '#fff' }}
                    activeDot={{ r: 7, strokeWidth: 2, stroke: '#fff' }}
                  />
                )}
                {visibleLines.successRate && (
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="successRate"
                    name={`${t.successRate || 'Taux de succès'} (%)`}
                    stroke="#a855f7"
                    strokeWidth={3}
                    strokeDasharray="4 4"
                    dot={{ r: 4.5, fill: '#a855f7', strokeWidth: 2, stroke: '#fff' }}
                    activeDot={{ r: 7, strokeWidth: 2, stroke: '#fff' }}
                  />
                )}
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="p-8 text-center text-gray-400 dark:text-gray-500 text-sm">
            {t.noDataForVelocity || 'Ajoutez des candidatures avec des dates valides pour visualiser la courbe de vélocité.'}
          </div>
        )}
      </div>

      {/* 3. PLATFORM BAR CHART ANALYSIS (Without table) */}
      <div className="bg-white dark:bg-gray-800 rounded-3xl p-5 sm:p-7 shadow-xs border border-gray-100 dark:border-gray-700">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-purple-50 dark:bg-purple-900/40 text-purple-600 dark:text-purple-400">
                <Globe size={18} />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
                {t.platformAnalysisChart || 'Performance par Plateforme / ATS'}
              </h3>
            </div>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
              {t.platformAnalysisChartSubtitle || 'Comparatif visuel du volume de candidatures et des retours par canal.'}
            </p>
          </div>

          {/* Highlights summary badges */}
          <div className="flex items-center gap-2 flex-wrap">
            {platformHighlights.mostReplies && (
              <div className="px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-xs font-semibold text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
                <TrendingUp size={14} className="text-emerald-600 shrink-0" />
                <span>{t.mostRepliesSource || 'Top réactive'} :</span>
                <span className="font-bold">{platformHighlights.mostReplies.source} ({platformHighlights.mostReplies.replyRate}%)</span>
              </div>
            )}
            {platformHighlights.leastReplies && (
              <div className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <TrendingDown size={14} className="text-slate-500 shrink-0" />
                <span>{t.leastRepliesSource || 'Moins réactive'} :</span>
                <span className="font-bold">{platformHighlights.leastReplies.source} ({platformHighlights.leastReplies.replyRate}%)</span>
              </div>
            )}
          </div>
        </div>

        {platformChartData.length > 0 ? (
          <div className="h-72 sm:h-80 2xl:h-96 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={platformChartData} margin={{ top: 15, right: 15, left: -15, bottom: 25 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" className="dark:stroke-gray-700" vertical={false} />
                <XAxis 
                  dataKey="shortName" 
                  tick={{ fill: '#64748b', fontSize: 11, fontWeight: 600 }} 
                  interval={0}
                  angle={-15}
                  textAnchor="end"
                  axisLine={{ stroke: '#cbd5e1' }}
                  tickLine={false}
                />
                <YAxis 
                  allowDecimals={false}
                  tick={{ fill: '#64748b', fontSize: 12 }}
                  axisLine={{ stroke: '#cbd5e1' }}
                  tickLine={false}
                />
                <Tooltip content={<CustomPlatformTooltip />} />
                <Legend 
                  verticalAlign="top" 
                  align="right" 
                  height={36}
                  formatter={(value) => <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">{value}</span>}
                />
                <Bar 
                  dataKey="total" 
                  name={t.platformChartApplications || 'Candidatures envoyées'} 
                  fill="#3b82f6" 
                  radius={[6, 6, 0, 0]} 
                />
                <Bar 
                  dataKey="answered" 
                  name={t.platformChartAnswers || 'Réponses reçues'} 
                  fill="#10b981" 
                  radius={[6, 6, 0, 0]} 
                />
                <Bar 
                  dataKey="positive" 
                  name={t.platformChartPositive || 'Intérêt positif (Entretiens / Offres)'} 
                  fill="#8b5cf6" 
                  radius={[6, 6, 0, 0]} 
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="p-8 text-center text-gray-400 dark:text-gray-500 text-sm">
            {t.noDataForPlatforms || 'Aucune donnée de plateforme disponible.'}
          </div>
        )}
      </div>

      {/* 4. ADVANCED FILTERED APPLICATIONS TABLE & EXPORT */}
      <div className="bg-white dark:bg-gray-800 rounded-3xl p-5 sm:p-7 shadow-xs border border-gray-100 dark:border-gray-700 space-y-5">
        
        {/* Table Header & Export Actions */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400">
                <FileSpreadsheet size={18} />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
                {t.filterOffersTitle || 'Tableau & Filtrage des offres'}
              </h3>
            </div>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
              {t.filterOffersSubtitle || 'Recherchez, filtrez par statut, contrat ou plateforme, et exportez vos données.'}
            </p>
          </div>

          {/* Export Action Buttons */}
          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              type="button"
              onClick={handleExportFilteredCSV}
              disabled={filteredApplications.length === 0}
              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2 transition-all cursor-pointer shadow-xs"
            >
              <Download size={15} />
              <span>{t.exportCSV || 'Exporter CSV'}</span>
              <span className="px-1.5 py-0.5 rounded-full bg-emerald-700/60 text-[11px]">
                {filteredApplications.length}
              </span>
            </button>

            <button
              type="button"
              onClick={handleExportFilteredJSON}
              disabled={filteredApplications.length === 0}
              className="px-3.5 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 disabled:opacity-50 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2 transition-all cursor-pointer border border-gray-200 dark:border-gray-600"
            >
              <FileCode size={15} className="text-indigo-500" />
              <span>{t.exportJSON || 'Exporter JSON'}</span>
            </button>
          </div>
        </div>

        {/* Filter Controls Bar */}
        <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-2xl border border-gray-100 dark:border-gray-700 space-y-3.5">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            
            {/* Search Bar */}
            <div className="relative">
              <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder={t.filterSearchPlaceholder || 'Rechercher une entreprise, poste...'}
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Status Filter */}
            <div>
              <select
                value={selectedStatus}
                onChange={e => setSelectedStatus(e.target.value)}
                className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
              >
                <option value="ALL">{t.filterAllStatuses || 'Tous les statuts'}</option>
                {STATUS_KEYS.map(status => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </div>

            {/* Contract Type Filter */}
            <div>
              <select
                value={selectedContract}
                onChange={e => setSelectedContract(e.target.value)}
                className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
              >
                <option value="ALL">{t.filterAllContracts || 'Tous les contrats'}</option>
                {CONTRACT_KEYS.map(contract => (
                  <option key={contract} value={contract}>
                    {contract}
                  </option>
                ))}
              </select>
            </div>

            {/* Platform / Source Filter */}
            <div>
              <select
                value={selectedSource}
                onChange={e => setSelectedSource(e.target.value)}
                className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
              >
                <option value="ALL">{t.filterAllSources || 'Toutes les plateformes'}</option>
                {availableSources.map(source => (
                  <option key={source} value={source}>
                    {source}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Quick Stats Pill Counters & Reset button */}
          <div className="flex items-center justify-between flex-wrap gap-2 pt-1">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 mr-1">
                {t.filteredResultsCount ? t.filteredResultsCount.replace('{count}', filteredApplications.length) : `${filteredApplications.length} offre(s)`}
              </span>
              {selectedStatus !== 'ALL' && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 dark:bg-blue-900/60 text-blue-800 dark:text-blue-200">
                  {selectedStatus}
                </span>
              )}
              {selectedContract !== 'ALL' && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-100 dark:bg-indigo-900/60 text-indigo-800 dark:text-indigo-200">
                  {selectedContract}
                </span>
              )}
              {selectedSource !== 'ALL' && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-100 dark:bg-purple-900/60 text-purple-800 dark:text-purple-200">
                  {selectedSource}
                </span>
              )}
            </div>

            {hasActiveFilters && (
              <button
                type="button"
                onClick={resetAllFilters}
                className="text-xs text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer font-medium"
              >
                <RotateCcw size={12} />
                <span>{t.resetFilters || 'Réinitialiser les filtres'}</span>
              </button>
            )}
          </div>
        </div>

        {/* The Offers Table */}
        <div className="overflow-x-auto -mx-5 sm:mx-0 px-5 sm:px-0">
          <table className="w-full text-left border-collapse text-xs sm:text-sm">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-900/60 text-gray-500 dark:text-gray-400 text-[11px] sm:text-xs uppercase tracking-wider border-b dark:border-gray-700">
                <th className="p-3 font-semibold">{t.company || 'Entreprise'} & {t.role || 'Poste'}</th>
                <th className="p-3 font-semibold">{t.contract || 'Contrat'}</th>
                <th className="p-3 font-semibold">{t.source || 'Plateforme'}</th>
                <th className="p-3 font-semibold">{t.date || 'Date candidature'}</th>
                <th className="p-3 font-semibold">{t.avgResponseTime || 'Délai retour'}</th>
                <th className="p-3 font-semibold">{t.status || 'Statut'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700/80">
              {filteredApplications.map(app => {
                const responseDays = getAppResponseDays(app);
                const isGhosted = isApplicationGhosted(app);
                const formattedUrl = formatExternalUrl ? formatExternalUrl(app.url) : app.url;

                return (
                  <tr key={app.id} className="hover:bg-gray-50/70 dark:hover:bg-gray-700/40 transition-colors">
                    
                    {/* Company & Role */}
                    <td className="p-3 font-semibold text-gray-900 dark:text-white">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-xs shrink-0">
                          {app.company ? app.company.substring(0, 2).toUpperCase() : 'CO'}
                        </div>
                        <div className="min-w-0">
                          <div className="font-bold text-gray-900 dark:text-white truncate flex items-center gap-1.5">
                            <span>{app.company || 'Entreprise'}</span>
                            {formattedUrl && (
                              <a
                                href={formattedUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
                                title="Voir l'offre"
                              >
                                <ExternalLink size={12} />
                              </a>
                            )}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400 font-normal truncate">
                            {app.role || 'Poste non spécifié'}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Contract */}
                    <td className="p-3">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-lg text-xs font-semibold bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                        {app.type || 'CDI'}
                      </span>
                    </td>

                    {/* Source / ATS */}
                    <td className="p-3">
                      <span className={`inline-flex items-center whitespace-nowrap px-2.5 py-0.5 rounded-full text-xs font-medium border ${getSourceBadgeStyle(app.source || 'Workday')}`}>
                        {app.source || 'Workday'}
                      </span>
                    </td>

                    {/* Application Date */}
                    <td className="p-3 font-mono text-gray-600 dark:text-gray-300 text-xs">
                      {app.date || '-'}
                    </td>

                    {/* Response Delay */}
                    <td className="p-3">
                      {responseDays !== null ? (
                        <span className="inline-flex items-center gap-1 font-semibold text-emerald-700 dark:text-emerald-400 text-xs">
                          <Timer size={13} className="text-emerald-500 shrink-0" />
                          <span>{responseDays} {t.avgDays || 'j'}</span>
                        </span>
                      ) : isGhosted ? (
                        <span className="inline-flex items-center gap-1 text-slate-500 dark:text-slate-400 text-xs font-medium">
                          <Ghost size={13} className="shrink-0" />
                          <span>&gt; 14j</span>
                        </span>
                      ) : (
                        <span className="text-gray-400 dark:text-gray-500 text-xs">-</span>
                      )}
                    </td>

                    {/* Status */}
                    <td className="p-2.5">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10.5px] font-semibold border ${getStatusColor(app.status)}`}>
                        {app.status || 'Postulé'}
                      </span>
                    </td>
                  </tr>
                );
              })}

              {filteredApplications.length === 0 && (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-gray-400 dark:text-gray-500 text-sm">
                    {t.noApplications || 'Aucune offre ne correspond aux critères sélectionnés.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};

export default DetailedStatsView;
