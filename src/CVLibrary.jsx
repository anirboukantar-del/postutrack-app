import React, { useState, useMemo, useRef } from 'react';
import { 
  Library, 
  FileText, 
  Upload, 
  Download, 
  Eye, 
  Pencil, 
  Trash2, 
  Link2, 
  Unlink, 
  Sparkles, 
  CheckCircle, 
  Search, 
  X, 
  SlidersHorizontal, 
  Palette, 
  Files, 
  ImageIcon, 
  Loader2, 
  Briefcase, 
  Building2, 
  Clock, 
  Layers, 
  ArrowRight, 
  FileCheck, 
  AlertCircle,
  FolderArchive,
  RefreshCw,
  Copy,
  LayoutTemplate
} from 'lucide-react';
import { ResumeRenderer, RESUME_TEMPLATES, ACCENT_COLORS } from './ResumeTemplates';
import { downloadElementAsPDF } from './pdfExport';

export default function CVLibrary({
  cvLibrary = [],
  setCvLibrary,
  applications = [],
  profile,
  lang = 'fr',
  t = {},
  onOpenInTailor,
  notifyDownloadSuccess
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all'); // 'all', 'linked', 'unlinked'
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'

  // Modal states
  const [previewCvItem, setPreviewCvItem] = useState(null);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [editingTitleId, setEditingTitleId] = useState(null);
  const [editingTitleValue, setEditingTitleValue] = useState('');
  const [linkModalCvItem, setLinkModalCvItem] = useState(null);
  const [selectedLinkAppId, setSelectedLinkAppId] = useState('');

  // Preview customization controls (synced to active preview item)
  const [previewTemplate, setPreviewTemplate] = useState('modern');
  const [previewColor, setPreviewColor] = useState('#2563eb');
  const [previewDensity, setPreviewDensity] = useState('normal');
  const [previewShowPhoto, setPreviewShowPhoto] = useState(true);
  const [previewPhotoSize, setPreviewPhotoSize] = useState('md');
  const [previewIsMultiPage, setPreviewIsMultiPage] = useState(false);
  const [isExportingPdf, setIsExportingPdf] = useState(false);

  // Import form state
  const [importTitle, setImportTitle] = useState('');
  const [importAppId, setImportAppId] = useState('');
  const [importText, setImportText] = useState('');
  const [importFile, setImportFile] = useState(null);
  const [isParsingFile, setIsParsingFile] = useState(false);
  const [importError, setImportError] = useState('');
  const fileInputRef = useRef(null);

  // Filtered list of CVs
  const filteredList = useMemo(() => {
    return cvLibrary.filter(item => {
      // Filter by type
      if (filterType === 'linked' && !item.applicationId) return false;
      if (filterType === 'unlinked' && item.applicationId) return false;

      // Search query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const titleMatch = (item.title || '').toLowerCase().includes(q);
        const companyMatch = (item.company || '').toLowerCase().includes(q);
        const roleMatch = (item.role || '').toLowerCase().includes(q);
        
        // Match in cv content if available
        let cvTextMatch = false;
        if (item.cv) {
          if (typeof item.cv === 'string') {
            cvTextMatch = item.cv.toLowerCase().includes(q);
          } else {
            const summary = (item.cv.summary || '').toLowerCase();
            const skills = Array.isArray(item.cv.skills) 
              ? item.cv.skills.map(s => (s.items || []).join(' ')).join(' ').toLowerCase() 
              : '';
            const experiences = Array.isArray(item.cv.experiences)
              ? item.cv.experiences.map(e => `${e.role} ${e.company} ${(e.achievements || []).join(' ')}`).join(' ').toLowerCase()
              : '';
            cvTextMatch = summary.includes(q) || skills.includes(q) || experiences.includes(q);
          }
        }
        if (!titleMatch && !companyMatch && !roleMatch && !cvTextMatch) return false;
      }
      return true;
    });
  }, [cvLibrary, filterType, searchQuery]);

  // Handle open preview
  const handleOpenPreview = (cvItem) => {
    setPreviewCvItem(cvItem);
    setPreviewTemplate(cvItem.template || 'modern');
    setPreviewColor(cvItem.accentColor || '#2563eb');
    setPreviewDensity(cvItem.density || 'normal');
    setPreviewShowPhoto(cvItem.showPhoto !== false);
    setPreviewPhotoSize(cvItem.photoSize || 'md');
    setPreviewIsMultiPage(Boolean(cvItem.isMultiPage));
  };

  // Handle download PDF for a specific CV item
  const handleDownloadPdf = async (cvItem) => {
    setIsExportingPdf(true);
    try {
      const cleanName = (cvItem.title || 'CV')
        .replace(/[^a-zA-Z0-9_\-]/g, '_')
        .replace(/_+/g, '_');
      
      const filename = `${cleanName}.pdf`;
      const resumeElement = document.getElementById(`resume-render-target-${cvItem.id}`) || document.getElementById('resume-preview-modal-content');
      
      if (resumeElement) {
        await downloadElementAsPDF(resumeElement, {
          filename,
          isMultiPage: previewCvItem?.id === cvItem.id ? previewIsMultiPage : Boolean(cvItem.isMultiPage),
          notifyDownloadSuccess
        });
      } else {
        // Fallback print/download
        window.print();
      }
    } catch (err) {
      console.error('PDF export error:', err);
    } finally {
      setIsExportingPdf(false);
    }
  };

  // Handle title rename
  const handleSaveTitle = (id) => {
    if (!editingTitleValue.trim()) {
      setEditingTitleId(null);
      return;
    }
    setCvLibrary(prev => prev.map(item => {
      if (item.id === id) {
        return { ...item, title: editingTitleValue.trim() };
      }
      return item;
    }));
    setEditingTitleId(null);
    setEditingTitleValue('');
  };

  // Handle delete CV item
  const handleDeleteCv = (id, e) => {
    if (e) e.stopPropagation();
    if (window.confirm(t.deleteResumeConfirm || "Êtes-vous sûr de vouloir supprimer ce CV de la bibliothèque ?")) {
      setCvLibrary(prev => prev.filter(item => item.id !== id));
      if (previewCvItem?.id === id) setPreviewCvItem(null);
    }
  };

  // Handle Link / Unlink Application
  const handleOpenLinkModal = (cvItem, e) => {
    if (e) e.stopPropagation();
    setLinkModalCvItem(cvItem);
    setSelectedLinkAppId(cvItem.applicationId || '');
  };

  const handleSaveLinkApplication = () => {
    if (!linkModalCvItem) return;

    const targetAppId = selectedLinkAppId ? String(selectedLinkAppId) : null;
    const targetApp = targetAppId ? applications.find(a => String(a.id) === targetAppId) : null;

    setCvLibrary(prev => {
      // If linking to an application, enforce rule: SAVE ONLY THE LAST RESUME FOR AN APPLICATION.
      // Remove any other existing CV attached to targetAppId
      let filtered = prev;
      if (targetAppId) {
        filtered = filtered.filter(item => item.id === linkModalCvItem.id || String(item.applicationId) !== targetAppId);
      }

      return filtered.map(item => {
        if (item.id === linkModalCvItem.id) {
          const updatedCompany = targetApp ? targetApp.company : '';
          const updatedRole = targetApp ? targetApp.role : '';
          // If title was default or empty, suggest new title from offer
          const updatedTitle = targetApp && (!item.title || item.title.startsWith('CV -') || item.title === 'Mon CV')
            ? `${updatedCompany} - ${updatedRole}`
            : item.title;

          return {
            ...item,
            applicationId: targetAppId,
            company: updatedCompany,
            role: updatedRole,
            title: updatedTitle
          };
        }
        return item;
      });
    });

    setLinkModalCvItem(null);
    setSelectedLinkAppId('');
  };

  // File upload parser
  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImportFile(file);
    setIsParsingFile(true);
    setImportError('');

    // Pre-fill title if empty
    if (!importTitle) {
      const nameWithoutExt = file.name.replace(/\.[^/.]+$/, '');
      setImportTitle(nameWithoutExt);
    }

    try {
      if (file.name.endsWith('.json')) {
        const text = await file.text();
        const json = JSON.parse(text);
        if (json.cv) {
          setImportText(JSON.stringify(json.cv, null, 2));
        } else {
          setImportText(text);
        }
      } else if (file.type === 'application/pdf' || file.name.endsWith('.pdf')) {
        if (!window.pdfjsLib) {
          setImportText("PDF en cours d'analyse...");
          const script = document.createElement('script');
          script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.min.js';
          script.onload = async () => {
            window.pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js';
            const reader = new FileReader();
            reader.onload = async () => {
              try {
                const typedarray = new Uint8Array(reader.result);
                const pdf = await window.pdfjsLib.getDocument(typedarray).promise;
                let fullText = '';
                for (let i = 1; i <= pdf.numPages; i++) {
                  const page = await pdf.getPage(i);
                  const textContent = await page.getTextContent();
                  fullText += textContent.items.map(item => item.str).join(' ') + '\n\n';
                }
                setImportText(fullText.trim());
              } catch (err) {
                console.error(err);
                setImportError("Erreur lors de la lecture du fichier PDF.");
              } finally {
                setIsParsingFile(false);
              }
            };
            reader.readAsArrayBuffer(file);
          };
          document.body.appendChild(script);
          return;
        } else {
          const reader = new FileReader();
          reader.onload = async () => {
            try {
              const typedarray = new Uint8Array(reader.result);
              const pdf = await window.pdfjsLib.getDocument(typedarray).promise;
              let fullText = '';
              for (let i = 1; i <= pdf.numPages; i++) {
                const page = await pdf.getPage(i);
                const textContent = await page.getTextContent();
                fullText += textContent.items.map(item => item.str).join(' ') + '\n\n';
              }
              setImportText(fullText.trim());
            } catch (err) {
              console.error(err);
              setImportError("Erreur lors de la lecture du fichier PDF.");
            } finally {
              setIsParsingFile(false);
            }
          };
          reader.readAsArrayBuffer(file);
          return;
        }
      } else {
        const text = await file.text();
        setImportText(text);
      }
    } catch (err) {
      console.error(err);
      setImportError("Impossible de lire ce fichier.");
    } finally {
      setIsParsingFile(false);
    }
  };

  // Handle save imported CV
  const handleSaveImportedCv = () => {
    if (!importText.trim() && !importFile) {
      setImportError("Veuillez fournir un texte de CV ou importer un fichier.");
      return;
    }

    const linkedApp = importAppId ? applications.find(a => String(a.id) === String(importAppId)) : null;
    const company = linkedApp ? linkedApp.company : '';
    const role = linkedApp ? linkedApp.role : '';

    // Base title: offer name if linked, or custom title, or profile name
    const finalTitle = (importTitle && importTitle.trim())
      ? importTitle.trim()
      : (linkedApp ? `${company} - ${role}` : (profile?.fullName ? `CV - ${profile.fullName}` : 'CV Importé'));

    let structuredCv = null;
    let format = 'text';

    // Try parsing as JSON first
    try {
      const parsed = JSON.parse(importText);
      if (parsed.experiences || parsed.skills || parsed.summary || parsed.fullName) {
        structuredCv = parsed;
        format = 'structured';
      } else if (parsed.cv) {
        structuredCv = parsed.cv;
        format = 'structured';
      }
    } catch {
      // Plain text / Markdown fallback
      structuredCv = {
        fullName: profile?.fullName || "Candidat",
        summary: importText.length > 500 ? importText.substring(0, 300) + '...' : importText,
        experiences: [
          {
            role: role || "Expérience",
            company: company || "Entreprise",
            period: "2024 - Présent",
            achievements: [importText.substring(0, 180)]
          }
        ],
        education: [
          {
            degree: "Formation / Diplôme",
            school: "Université / École",
            year: "2023",
            description: ""
          }
        ],
        skills: [
          {
            category: "COMPÉTENCES",
            items: ["Compétence 1", "Compétence 2"]
          }
        ]
      };
    }

    const now = new Date();
    const dateStr = now.toLocaleDateString(lang === 'en' ? 'en-US' : 'fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    const newCvItem = {
      id: `cv-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      applicationId: importAppId ? String(importAppId) : null,
      title: finalTitle,
      company,
      role,
      date: dateStr,
      timestamp: Date.now(),
      cv: structuredCv,
      rawText: importText,
      format,
      source: 'imported',
      template: 'modern',
      accentColor: '#2563eb',
      density: 'normal',
      isMultiPage: false,
      showPhoto: true,
      photoSize: 'md'
    };

    setCvLibrary(prev => {
      // RULE: Save ONLY the last resume for an application
      let filtered = prev;
      if (newCvItem.applicationId) {
        filtered = filtered.filter(item => String(item.applicationId) !== String(newCvItem.applicationId));
      }
      return [newCvItem, ...filtered];
    });

    // Reset import form
    setImportTitle('');
    setImportAppId('');
    setImportText('');
    setImportFile(null);
    setImportError('');
    setIsImportModalOpen(false);
  };

  // Check if an application already has a saved CV
  const getExistingCvForApp = (appId) => {
    if (!appId) return null;
    return cvLibrary.find(item => String(item.applicationId) === String(appId));
  };

  return (
    <div className="space-y-6 max-w-6xl xl:max-w-7xl 2xl:max-w-[1700px] mx-auto pb-12">
      {/* Header Section */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xs border border-gray-200 dark:border-gray-700 p-5 sm:p-6 2xl:p-8 transition-colors">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 sm:p-3 bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-400 rounded-2xl">
              <Library className="w-6 h-6 sm:w-7 sm:h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h2 className="text-lg sm:text-xl 2xl:text-2xl font-bold text-gray-800 dark:text-white">
                  {t.cvLibrary || "Bibliothèque de CV"}
                </h2>
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                  {cvLibrary.length} {cvLibrary.length <= 1 ? (lang === 'en' ? 'resume' : 'CV') : (lang === 'en' ? 'resumes' : 'CVs')}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                {t.cvLibrarySubtitle || "Consultez, gérez et exportez le dernier CV généré ou importé pour chaque candidature."}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <button
              type="button"
              onClick={() => {
                setImportTitle('');
                setImportAppId('');
                setImportText('');
                setImportFile(null);
                setImportError('');
                setIsImportModalOpen(true);
              }}
              className="flex-1 sm:flex-none px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs sm:text-sm font-semibold shadow-xs transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <Upload size={16} />
              <span>{t.importCvBtn || "Importer un CV"}</span>
            </button>
          </div>
        </div>

        {/* Informative Rule Badge: Save ONLY the last resume for an application */}
        <div className="mt-4 pt-3.5 border-t border-gray-100 dark:border-gray-700/80 flex items-center gap-2 text-xs text-amber-700 dark:text-amber-400 bg-amber-50/60 dark:bg-amber-950/20 px-3 py-2 rounded-xl border border-amber-200/60 dark:border-amber-900/40">
          <Sparkles size={14} className="shrink-0 text-amber-600 dark:text-amber-400" />
          <span>
            {t.lastResumeNote || "Règle de gestion : Un seul CV est conservé par candidature (le plus récent). L'adaptation ou l'import pour une offre remplace automatiquement sa version précédente."}
          </span>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xs border border-gray-200 dark:border-gray-700 p-3 sm:p-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1 min-w-0">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
            <Search size={15} />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t.searchCvPlaceholder || "Rechercher par titre, entreprise, poste, compétences..."}
            className="w-full pl-9 sm:pl-10 pr-9 py-2 text-xs sm:text-sm bg-gray-50 dark:bg-gray-900/80 border border-gray-200 dark:border-gray-700 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-gray-100 placeholder-gray-400 transition-colors shadow-2xs"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 cursor-pointer"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap shrink-0">
          <div className="flex bg-gray-100 dark:bg-gray-900 p-1 rounded-xl">
            <button
              type="button"
              onClick={() => setFilterType('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                filterType === 'all'
                  ? 'bg-white dark:bg-gray-700 text-blue-700 dark:text-blue-300 shadow-2xs'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-200/60 dark:hover:bg-gray-800'
              }`}
            >
              {t.allResumes || "Tous"} ({cvLibrary.length})
            </button>
            <button
              type="button"
              onClick={() => setFilterType('linked')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                filterType === 'linked'
                  ? 'bg-white dark:bg-gray-700 text-blue-700 dark:text-blue-300 shadow-2xs'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-200/60 dark:hover:bg-gray-800'
              }`}
            >
              {t.linkedResumes || "Liés"} ({cvLibrary.filter(i => i.applicationId).length})
            </button>
            <button
              type="button"
              onClick={() => setFilterType('unlinked')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                filterType === 'unlinked'
                  ? 'bg-white dark:bg-gray-700 text-blue-700 dark:text-blue-300 shadow-2xs'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-200/60 dark:hover:bg-gray-800'
              }`}
            >
              {t.unlinkedResumes || "Autonomes"} ({cvLibrary.filter(i => !i.applicationId).length})
            </button>
          </div>

          {/* View Mode Toggle */}
          <div className="hidden sm:flex bg-gray-100 dark:bg-gray-900 p-1 rounded-xl">
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                viewMode === 'grid'
                  ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-2xs'
                  : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
              title="Vue Grille"
            >
              <Layers size={15} />
            </button>
            <button
              type="button"
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                viewMode === 'list'
                  ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-2xs'
                  : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
              title="Vue Liste"
            >
              <FileText size={15} />
            </button>
          </div>
        </div>
      </div>

      {/* Empty State */}
      {filteredList.length === 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xs border border-gray-200 dark:border-gray-700 p-8 sm:p-12 text-center max-w-xl mx-auto">
          <div className="w-14 h-14 rounded-2xl bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto mb-4">
            <FolderArchive size={28} />
          </div>
          <h3 className="text-base sm:text-lg font-bold text-gray-800 dark:text-white mb-2">
            {cvLibrary.length === 0 
              ? (t.noResumesInLibrary || "Aucun CV dans la bibliothèque")
              : (t.noMatchingResumes || "Aucun CV ne correspond à vos critères de recherche.")}
          </h3>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 leading-relaxed mb-6">
            {cvLibrary.length === 0
              ? (t.noResumesInLibraryDesc || "Générez un CV adapté depuis l'onglet Adaptateur IA ou importez vos CVs existants pour les centraliser ici.")
              : "Essayez d'effacer les filtres de recherche pour afficher tous les CVs enregistrés."}
          </p>
          <div className="flex items-center justify-center gap-3">
            {cvLibrary.length > 0 && searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-xl text-xs sm:text-sm font-semibold hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors cursor-pointer"
              >
                Effacer la recherche
              </button>
            )}
            <button
              type="button"
              onClick={() => {
                setImportTitle('');
                setImportAppId('');
                setImportText('');
                setImportFile(null);
                setIsImportModalOpen(true);
              }}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs sm:text-sm font-semibold shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <Upload size={15} />
              <span>{t.importCvBtn || "Importer un CV"}</span>
            </button>
          </div>
        </div>
      )}

      {/* Grid View of Resumes */}
      {viewMode === 'grid' && filteredList.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {filteredList.map((item) => {
            const linkedApp = item.applicationId ? applications.find(a => String(a.id) === String(item.applicationId)) : null;
            const isEditingTitle = editingTitleId === item.id;

            return (
              <div
                key={item.id}
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-xs border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-700/60 p-4 sm:p-5 flex flex-col justify-between transition-all group"
              >
                {/* Card Top: Title & Linked Application info */}
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      {isEditingTitle ? (
                        <div className="flex items-center gap-1.5">
                          <input
                            type="text"
                            value={editingTitleValue}
                            onChange={(e) => setEditingTitleValue(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleSaveTitle(item.id);
                              if (e.key === 'Escape') setEditingTitleId(null);
                            }}
                            autoFocus
                            className="w-full px-2 py-1 text-sm font-bold bg-white dark:bg-gray-900 border border-blue-500 rounded-lg outline-none text-gray-900 dark:text-white"
                          />
                          <button
                            type="button"
                            onClick={() => handleSaveTitle(item.id)}
                            className="p-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer"
                          >
                            <CheckCircle size={14} />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 group/title">
                          <h3
                            className="text-sm sm:text-base font-bold text-gray-900 dark:text-white truncate"
                            title={item.title}
                          >
                            {item.title}
                          </h3>
                          <button
                            type="button"
                            onClick={() => {
                              setEditingTitleId(item.id);
                              setEditingTitleValue(item.title);
                            }}
                            className="opacity-0 group-hover/title:opacity-100 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-opacity p-0.5 cursor-pointer"
                            title={t.editTitle || "Modifier le titre"}
                          >
                            <Pencil size={13} />
                          </button>
                        </div>
                      )}

                      {/* Subtitle / Timestamp */}
                      <div className="flex items-center gap-2 text-[11px] text-gray-500 dark:text-gray-400 mt-1">
                        <span className="flex items-center gap-1">
                          <Clock size={11} /> {item.date}
                        </span>
                        <span>•</span>
                        <span className="capitalize font-medium">
                          {item.source === 'tailored' ? 'IA' : 'Importé'}
                        </span>
                        {item.matchScore && (
                          <>
                            <span>•</span>
                            <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                              {item.matchScore}% Match
                            </span>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Format Badge */}
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 shrink-0 border dark:border-slate-600">
                      {item.template || 'Modern'}
                    </span>
                  </div>

                  {/* Linked Application Pill */}
                  <div className="pt-2 border-t border-gray-100 dark:border-gray-700/80">
                    {linkedApp ? (
                      <div className="flex items-center justify-between p-2 rounded-xl bg-blue-50/60 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/50">
                        <div className="flex items-center gap-2 min-w-0">
                          <Building2 size={14} className="text-blue-600 dark:text-blue-400 shrink-0" />
                          <div className="truncate text-xs">
                            <span className="font-bold text-blue-950 dark:text-blue-200">{linkedApp.company}</span>
                            <span className="text-blue-700 dark:text-blue-300"> — {linkedApp.role}</span>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={(e) => handleOpenLinkModal(item, e)}
                          className="text-[10px] font-semibold text-blue-600 dark:text-blue-400 hover:underline shrink-0 ml-1.5 cursor-pointer"
                          title={t.linkToApp || "Changer l'association"}
                        >
                          {t.changeLink || "Modifier"}
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between p-2 rounded-xl bg-gray-50 dark:bg-gray-900/50 border border-gray-200/70 dark:border-gray-700/70">
                        <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 truncate">
                          <Unlink size={13} />
                          <span>{t.noLinkedApplication || "CV autonome (Non lié)"}</span>
                        </div>
                        <button
                          type="button"
                          onClick={(e) => handleOpenLinkModal(item, e)}
                          className="text-[10px] font-semibold text-blue-600 dark:text-blue-400 hover:underline shrink-0 ml-1.5 cursor-pointer"
                        >
                          {t.linkToApp || "+ Lier"}
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Summary Snippet */}
                  {item.cv?.summary && (
                    <p className="text-xs text-gray-600 dark:text-gray-300 line-clamp-2 leading-relaxed italic bg-gray-50/70 dark:bg-gray-900/40 p-2.5 rounded-xl border border-gray-100 dark:border-gray-800">
                      "{item.cv.summary}"
                    </p>
                  )}
                </div>

                {/* Card Actions Footer */}
                <div className="pt-4 mt-4 border-t border-gray-100 dark:border-gray-700/80 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    {/* Delete button */}
                    <button
                      type="button"
                      onClick={(e) => handleDeleteCv(item.id, e)}
                      className="p-2 text-gray-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition-colors cursor-pointer"
                      title={t.deleteResume || "Supprimer"}
                    >
                      <Trash2 size={15} />
                    </button>
                    {/* Open in Tailor */}
                    {onOpenInTailor && item.cv && (
                      <button
                        type="button"
                        onClick={() => onOpenInTailor(item)}
                        className="p-2 text-gray-500 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 rounded-xl transition-colors cursor-pointer"
                        title={t.openInTailor || "Ouvrir dans l'Adaptateur IA"}
                      >
                        <Sparkles size={15} />
                      </button>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Preview Button */}
                    <button
                      type="button"
                      onClick={() => handleOpenPreview(item)}
                      className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-xl text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5 shadow-2xs"
                    >
                      <Eye size={14} />
                      <span>{t.previewResume || "Visualiser"}</span>
                    </button>
                    {/* Quick PDF Download */}
                    <button
                      type="button"
                      onClick={() => {
                        handleOpenPreview(item);
                        setTimeout(() => handleDownloadPdf(item), 100);
                      }}
                      className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-2xs transition-colors cursor-pointer flex items-center gap-1.5"
                    >
                      <Download size={14} />
                      <span>PDF</span>
                    </button>
                  </div>
                </div>

                {/* Hidden Render Target for direct PDF export */}
                <div className="hidden">
                  <div id={`resume-render-target-${item.id}`}>
                    <ResumeRenderer
                      cv={item.cv}
                      profile={profile}
                      template={item.template || 'modern'}
                      accentColor={item.accentColor || '#2563eb'}
                      density={item.density || 'normal'}
                      showPhoto={item.showPhoto !== false}
                      photoSize={item.photoSize || 'md'}
                      isMultiPage={Boolean(item.isMultiPage)}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* List View of Resumes */}
      {viewMode === 'list' && filteredList.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xs border border-gray-200 dark:border-gray-700 overflow-hidden">
          <table className="w-full table-fixed text-left border-collapse text-xs md:text-sm">
            <thead>
              <tr className="bg-gray-100/70 dark:bg-gray-900 text-gray-600 dark:text-gray-400 text-xs uppercase tracking-wider border-b dark:border-gray-700">
                <th className="w-[30%] px-4 py-3 font-semibold truncate">{t.resumeTitleLabel || "Titre du CV"}</th>
                <th className="w-[30%] px-3 py-3 font-semibold truncate">{t.linkedApplication || "Candidature liée"}</th>
                <th className="w-[15%] px-3 py-3 font-semibold truncate">{t.date || "Date"}</th>
                <th className="w-[10%] px-2 py-3 font-semibold truncate">Modèle</th>
                <th className="w-[15%] px-3 py-3 text-right font-semibold truncate">{t.actions || "Actions"}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {filteredList.map((item) => {
                const linkedApp = item.applicationId ? applications.find(a => String(a.id) === String(item.applicationId)) : null;

                return (
                  <tr key={item.id} className="hover:bg-gray-50/80 dark:hover:bg-gray-700/40 transition-colors">
                    <td className="w-[30%] px-4 py-3 font-bold text-gray-900 dark:text-white truncate">
                      <div className="flex items-center gap-2">
                        <FileText size={16} className="text-blue-600 dark:text-blue-400 shrink-0" />
                        <span className="truncate" title={item.title}>{item.title}</span>
                      </div>
                    </td>
                    <td className="w-[30%] px-3 py-3 text-gray-700 dark:text-gray-300 truncate">
                      {linkedApp ? (
                        <div className="flex items-center gap-1.5 truncate">
                          <span className="font-semibold text-blue-900 dark:text-blue-300 truncate">{linkedApp.company}</span>
                          <span className="text-gray-500">— {linkedApp.role}</span>
                        </div>
                      ) : (
                        <span className="text-gray-400 italic text-xs">{t.noLinkedApplication || "CV autonome"}</span>
                      )}
                    </td>
                    <td className="w-[15%] px-3 py-3 text-gray-500 dark:text-gray-400 text-xs truncate">
                      {item.date}
                    </td>
                    <td className="w-[10%] px-2 py-3">
                      <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                        {item.template || 'Modern'}
                      </span>
                    </td>
                    <td className="w-[15%] px-3 py-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleOpenPreview(item)}
                          className="p-1.5 text-gray-600 dark:text-gray-300 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/40 rounded-lg transition-colors cursor-pointer"
                          title={t.previewResume || "Visualiser"}
                        >
                          <Eye size={15} />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            handleOpenPreview(item);
                            setTimeout(() => handleDownloadPdf(item), 100);
                          }}
                          className="p-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/40 rounded-lg transition-colors cursor-pointer"
                          title="Télécharger PDF"
                        >
                          <Download size={15} />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => handleDeleteCv(item.id, e)}
                          className="p-1.5 text-gray-400 hover:text-rose-600 rounded-lg transition-colors cursor-pointer"
                          title={t.deleteResume || "Supprimer"}
                        >
                          <Trash2 size={15} />
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

      {/* MODAL: Full Preview of Resume */}
      {previewCvItem && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 z-50 overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 w-full max-w-5xl max-h-[92vh] flex flex-col overflow-hidden my-auto">
            {/* Modal Header & Toolbar */}
            <div className="p-4 sm:p-5 border-b border-gray-200 dark:border-gray-700 bg-gray-50/80 dark:bg-gray-900/80 flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 rounded-xl">
                  <FileCheck size={20} />
                </div>
                <div className="truncate">
                  <h3 className="text-base font-bold text-gray-900 dark:text-white truncate">
                    {previewCvItem.title}
                  </h3>
                  <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                    {previewCvItem.applicationId && (
                      <span>Candidature : <strong>{previewCvItem.company}</strong> ({previewCvItem.role})</span>
                    )}
                    <span>• {previewCvItem.date}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleDownloadPdf(previewCvItem)}
                  disabled={isExportingPdf}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs sm:text-sm font-bold shadow-xs cursor-pointer transition-all flex items-center gap-1.5 disabled:opacity-60"
                >
                  {isExportingPdf ? <Loader2 size={15} className="animate-spin" /> : <Download size={15} />}
                  <span>{isExportingPdf ? "Export PDF..." : "Télécharger PDF"}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewCvItem(null)}
                  className="p-2 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 rounded-xl cursor-pointer transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Customization Toolbar inside Preview */}
            <div className="p-3.5 bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 flex flex-wrap items-center justify-between gap-3 text-xs">
              {/* Template selector */}
              <div className="flex items-center gap-1.5">
                <LayoutTemplate size={14} className="text-gray-500" />
                <span className="font-semibold text-gray-700 dark:text-gray-300">Modèle:</span>
                <select
                  value={previewTemplate}
                  onChange={(e) => setPreviewTemplate(e.target.value)}
                  className="px-2.5 py-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg font-medium text-gray-800 dark:text-gray-200 outline-none"
                >
                  {RESUME_TEMPLATES.map(t => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
              </div>

              {/* Color selector */}
              <div className="flex items-center gap-1.5">
                <Palette size={14} className="text-gray-500" />
                <span className="font-semibold text-gray-700 dark:text-gray-300">Couleur:</span>
                <div className="flex items-center gap-1.5">
                  {ACCENT_COLORS.map(c => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => setPreviewColor(c.hex)}
                      className={`w-5 h-5 rounded-full cursor-pointer transition-transform ${
                        previewColor === c.hex ? 'ring-2 ring-blue-500 scale-110' : ''
                      }`}
                      style={{ backgroundColor: c.hex }}
                    />
                  ))}
                </div>
              </div>

              {/* Page Format Toggle */}
              <div className="flex items-center gap-1.5">
                <Files size={14} className="text-gray-500" />
                <button
                  type="button"
                  onClick={() => setPreviewIsMultiPage(!previewIsMultiPage)}
                  className={`px-2.5 py-1 rounded-lg font-semibold border transition-colors cursor-pointer ${
                    !previewIsMultiPage
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border-gray-200 dark:border-gray-700'
                  }`}
                >
                  {!previewIsMultiPage ? "1 Page A4 stricte" : "Multi-pages"}
                </button>
              </div>
            </div>

            {/* Resume Content View */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-8 bg-gray-100 dark:bg-gray-950 flex justify-center">
              <div id="resume-preview-modal-content" className="w-full flex justify-center">
                <ResumeRenderer
                  cv={previewCvItem.cv}
                  profile={profile}
                  template={previewTemplate}
                  accentColor={previewColor}
                  density={previewDensity}
                  showPhoto={previewShowPhoto}
                  photoSize={previewPhotoSize}
                  isMultiPage={previewIsMultiPage}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Import a CV */}
      {isImportModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 w-full max-w-xl p-5 sm:p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-700 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-400 rounded-xl">
                  <Upload size={20} />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white">
                    {t.importCvModalTitle || "Importer un CV dans la bibliothèque"}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {t.importCvModalSubtitle || "Importez un fichier (PDF, TXT, JSON) ou collez le texte, avec option d'association."}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsImportModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            {/* Option to Link to an Existing Application */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300">
                {t.selectLinkedApplication || "Associer à une candidature (optionnel)"}
              </label>
              <select
                value={importAppId}
                onChange={(e) => {
                  const appId = e.target.value;
                  setImportAppId(appId);
                  if (appId) {
                    const matchedApp = applications.find(a => String(a.id) === String(appId));
                    if (matchedApp) {
                      // Pre-fill base title as the name of offer
                      setImportTitle(`${matchedApp.company} - ${matchedApp.role}`);
                    }
                  }
                }}
                className="w-full p-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-xs sm:text-sm text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">{t.noJobLinked || "-- Aucune candidature liée (CV autonome) --"}</option>
                {applications.map(app => (
                  <option key={app.id} value={app.id}>
                    {app.company} - {app.role} ({app.status || 'Postulé'})
                  </option>
                ))}
              </select>

              {/* Overwrite notice if application already has a resume */}
              {importAppId && getExistingCvForApp(importAppId) && (
                <div className="p-2.5 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-xl flex items-start gap-2 text-xs text-amber-700 dark:text-amber-400">
                  <AlertCircle size={15} className="shrink-0 mt-0.5" />
                  <span>
                    {t.overwriteWarning || "Attention : cette candidature a déjà un CV enregistré. Ce nouvel import le remplacera pour conserver uniquement le dernier."}
                  </span>
                </div>
              )}
            </div>

            {/* Base Title for Resume (default: offer name, fully editable) */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300">
                {t.resumeTitleLabel || "Titre du CV"} <span className="text-gray-400 font-normal">(modifiable)</span>
              </label>
              <input
                type="text"
                value={importTitle}
                onChange={(e) => setImportTitle(e.target.value)}
                placeholder={t.resumeTitlePlaceholder || "ex: Google - Développeur Full-Stack"}
                className="w-full p-2.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-xs sm:text-sm text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500 shadow-2xs"
              />
            </div>

            {/* File Upload Zone */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300">
                Fichier CV (PDF, TXT, JSON)
              </label>
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-gray-300 dark:border-gray-600 hover:border-blue-500 dark:hover:border-blue-400 rounded-2xl p-5 text-center cursor-pointer transition-colors bg-gray-50/50 dark:bg-gray-900/30"
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  accept=".pdf,.txt,.json,.yaml,.yml"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <div className="flex flex-col items-center gap-1.5">
                  <Upload size={22} className="text-gray-400 dark:text-gray-500" />
                  <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                    {importFile ? importFile.name : (t.uploadFileOrDrag || "Déposez un fichier PDF, TXT ou JSON, ou cliquez")}
                  </span>
                  {isParsingFile && (
                    <div className="flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400">
                      <Loader2 size={13} className="animate-spin" />
                      <span>Lecture du fichier en cours...</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Raw Text Input */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300">
                {t.pasteRawText || "Ou collez le texte du CV directement"}
              </label>
              <textarea
                rows={5}
                value={importText}
                onChange={(e) => setImportText(e.target.value)}
                placeholder="Expérience, Formation, Compétences..."
                className="w-full p-2.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-xs font-mono text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500 shadow-2xs"
              />
            </div>

            {importError && (
              <div className="p-2.5 bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-900 rounded-xl text-xs flex items-center gap-2">
                <AlertCircle size={15} />
                <span>{importError}</span>
              </div>
            )}

            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-gray-100 dark:border-gray-700">
              <button
                type="button"
                onClick={() => setIsImportModalOpen(false)}
                className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl text-xs sm:text-sm font-medium hover:bg-gray-200 transition-colors cursor-pointer"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={handleSaveImportedCv}
                disabled={isParsingFile || (!importText.trim() && !importFile)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl text-xs sm:text-sm font-semibold shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <CheckCircle size={15} />
                <span>Enregistrer dans la bibliothèque</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Link to Application */}
      {linkModalCvItem && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 w-full max-w-md p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-700 pb-3">
              <div className="flex items-center gap-2">
                <Link2 size={18} className="text-blue-600 dark:text-blue-400" />
                <h3 className="font-bold text-sm sm:text-base text-gray-900 dark:text-white">
                  {t.linkToApp || "Lier ce CV à une candidature"}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setLinkModalCvItem(null)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300">
                Sélectionner la candidature ciblée :
              </label>
              <select
                value={selectedLinkAppId}
                onChange={(e) => setSelectedLinkAppId(e.target.value)}
                className="w-full p-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-xs sm:text-sm text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">{t.noJobLinked || "-- Aucune candidature (CV autonome) --"}</option>
                {applications.map(app => (
                  <option key={app.id} value={app.id}>
                    {app.company} - {app.role} ({app.status || 'Postulé'})
                  </option>
                ))}
              </select>

              {selectedLinkAppId && getExistingCvForApp(selectedLinkAppId) && getExistingCvForApp(selectedLinkAppId).id !== linkModalCvItem.id && (
                <div className="p-2.5 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-xl flex items-start gap-2 text-xs text-amber-700 dark:text-amber-400 mt-2">
                  <AlertCircle size={15} className="shrink-0 mt-0.5" />
                  <span>
                    Cette candidature possède déjà un CV. L'associer ici remplacera l'ancien afin de conserver uniquement le dernier CV.
                  </span>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-gray-100 dark:border-gray-700">
              <button
                type="button"
                onClick={() => setLinkModalCvItem(null)}
                className="px-3.5 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl text-xs font-medium hover:bg-gray-200 transition-colors cursor-pointer"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={handleSaveLinkApplication}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors cursor-pointer"
              >
                Valider
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
