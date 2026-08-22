import React, { useState } from 'react';
import { 
  LayoutTemplate, 
  Palette, 
  SlidersHorizontal, 
  Download, 
  Image as ImageIcon, 
  Sparkles, 
  RotateCcw, 
  User, 
  Briefcase, 
  GraduationCap, 
  Code, 
  FileText, 
  Files,
  Check, 
  Eye, 
  Copy, 
  Layers, 
  Plus, 
  Trash2,
  HelpCircle,
  ExternalLink,
  Printer,
  Sun,
  Calendar,
  FlaskConical,
  Zap,
  Loader2
} from 'lucide-react';
import { ResumeRenderer, RESUME_TEMPLATES, ACCENT_COLORS } from './ResumeTemplates';
import { HIRING_WEATHER_MONTHS } from './HiringWeather';
import { downloadElementAsPDF } from './pdfExport';

// Preset sample resumes for instant 0-token testing
const SAMPLE_TECH_CV = {
  fullName: "Alexandre Martin",
  photo: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80",
  location: "Paris, France",
  email: "alexandre.martin@example.com",
  phone: "+33 6 12 34 56 78",
  website: "github.com/alexmartin-dev",
  summary: "Architecte Logiciel et Lead Developer Fullstack avec 7+ ans d'expérience dans la conception de plateformes web distribuées à forte charge. Spécialiste React, TypeScript, Node.js et Kubernetes, passionné par les architectures modulaires, la performance et l'excellence technique.",
  experiences: [
    {
      company: "TechScale Solutions",
      role: "Lead Software Architect",
      period: "2022 - Présent",
      achievements: [
        "Conception et migration d'une architecture monolithique vers des microservices événementiels (Kafka, Go, Node.js), réduisant la latence de 42%.",
        "Encadrement d'une équipe de 12 ingénieurs, mise en place des revues de code systématiques et amélioration de la couverture de tests de 55% à 91%.",
        "Optimisation de l'infrastructure Cloud AWS (EKS, Terraform) générant une économie annuelle de 85 000 € sur les coûts d'hébergement."
      ]
    },
    {
      company: "NovaFlow Systems",
      role: "Senior Fullstack Engineer",
      period: "2019 - 2022",
      achievements: [
        "Développement d'un dashboard SaaS analytique temps réel avec React 18, WebSockets et Tailwind CSS utilisé par plus de 45 000 utilisateurs actifs quotidiens.",
        "Mise en place de pipelines CI/CD automatisés (GitHub Actions, Docker) réduisant le délai de déploiement de 45 minutes à 6 minutes.",
        "Conception d'APIs GraphQL haute performance avec mise en cache Redis et partitionnement de base de données PostgreSQL."
      ]
    },
    {
      company: "Studio Digitale",
      role: "Frontend Developer",
      period: "2017 - 2019",
      achievements: [
        "Création d'interfaces web responsives et accessibles (WCAG AA) pour 15+ clients grands comptes internationaux.",
        "Refonte des bibliothèques de composants UI internes en Storybook et TypeScript."
      ]
    }
  ],
  education: [
    {
      school: "École Polytechnique de Paris",
      degree: "Master en Ingénierie du Logiciel & Systèmes d'Information",
      year: "2017",
      description: "Major de promotion en Génie Logiciel, mémoire sur les architectures distribuées et la tolérance aux pannes."
    },
    {
      school: "Université Pierre et Marie Curie",
      degree: "Licence en Informatique Fondamentale",
      year: "2015",
      description: "Mention Très Bien, focus algorithmique avancée et bases de données."
    }
  ],
  skills: [
    { category: "Frontend", items: ["React", "TypeScript", "Next.js", "Tailwind CSS", "Redux Toolkit", "Vue.js"] },
    { category: "Backend & Cloud", items: ["Node.js", "Go", "PostgreSQL", "Redis", "AWS (EKS, S3, RDS)", "Docker", "Kubernetes"] },
    { category: "DevOps & Outils", items: ["CI/CD GitHub Actions", "Terraform", "Jest / Vitest", "GraphQL", "REST APIs", "Git"] }
  ]
};

const SAMPLE_PRODUCT_CV = {
  fullName: "Camille Laurent",
  photo: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80",
  location: "Lyon, France",
  email: "camille.laurent@example.com",
  phone: "+33 6 98 76 54 32",
  website: "linkedin.com/in/camille-laurent-pm",
  summary: "Senior Product Manager avec 6 ans d'expérience dans le scaling de produits B2B SaaS. Expert en discovery utilisateur, méthodologies agiles, stratégie produit data-driven et alignement des équipes cross-fonctionnelles pour accélérer la croissance et le MRR.",
  experiences: [
    {
      company: "GrowthMatrix SaaS",
      role: "Lead Product Manager",
      period: "2021 - Présent",
      achievements: [
        "Pilotage de la roadmap stratégique d'un produit B2B générant 4.2M€ d'ARR, avec une croissance annuelle de +65%.",
        "Refonte complète du funnel d'onboarding utilisateur, augmentant le taux de conversion trial-to-paid de 8.5% à 16.2%.",
        "Direction de 3 squads produit (24 personnes : Devs, UX Designers, Data Analysts) en méthode Scrum/Kanban."
      ]
    },
    {
      company: "AppPulse Analytics",
      role: "Product Manager B2B",
      period: "2018 - 2021",
      achievements: [
        "Lancement de deux nouvelles fonctionnalités majeures d'automatisation adoptées par 78% de la base client active en 3 mois.",
        "Mise en place d'un framework d'expérimentation A/B testing continu (Amplitude, Mixpanel) validant 40+ hypothèses par an."
      ]
    }
  ],
  education: [
    {
      school: "HEC Paris",
      degree: "Master in Management & Strategic Marketing",
      year: "2018",
      description: "Spécialisation Digital Transformation & Product Strategy."
    }
  ],
  skills: [
    { category: "Product & Strategy", items: ["Product Discovery", "Roadmapping", "Product Analytics", "A/B Testing", "User Journey", "Pricing B2B"] },
    { category: "Outils & Méthodes", items: ["Figma", "Jira / Linear", "Notion", "Amplitude", "Mixpanel", "SQL de base", "Scrum / Agile"] }
  ]
};

export function DevResumeLab({
  profile,
  selectedResumeTemplate,
  setSelectedResumeTemplate,
  resumeAccentColor,
  setResumeAccentColor,
  resumeDensity,
  setResumeDensity,
  showPhoto,
  setShowPhoto,
  photoSize = 'md',
  setPhotoSize,
  isMultiPage = false,
  setIsMultiPage,
  simulatedMonth = null,
  setSimulatedMonth,
  t,
  lang = 'fr'
}) {
  const [internalMultiPage, setInternalMultiPage] = useState(false);
  const currentMultiPage = setIsMultiPage ? isMultiPage : internalMultiPage;
  const toggleMultiPage = (val) => {
    if (setIsMultiPage) setIsMultiPage(val);
    else setInternalMultiPage(val);
  };
  const [activePreset, setActivePreset] = useState('tech'); // 'tech', 'product', 'my_profile'
  const [testCV, setTestCV] = useState(SAMPLE_TECH_CV);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [isExportingPdf, setIsExportingPdf] = useState(false);

  const realMonthIdx = new Date().getMonth();
  const currentSimMonthIdx = (simulatedMonth !== null && !isNaN(simulatedMonth) && simulatedMonth >= 0 && simulatedMonth <= 11)
    ? simulatedMonth
    : realMonthIdx;
  const isSimulationActive = simulatedMonth !== null && !isNaN(simulatedMonth) && simulatedMonth !== realMonthIdx;

  // Load a preset
  const handleSelectPreset = (presetKey) => {
    setActivePreset(presetKey);
    if (presetKey === 'tech') {
      setTestCV(SAMPLE_TECH_CV);
    } else if (presetKey === 'product') {
      setTestCV(SAMPLE_PRODUCT_CV);
    } else if (presetKey === 'my_profile') {
      // Build from user profile
      const userSkills = profile.masterCV ? [
        { category: "Compétences", items: ["TypeScript", "React", "Node.js", "Tailwind CSS", "Architecture"] }
      ] : SAMPLE_TECH_CV.skills;

      setTestCV({
        fullName: profile.fullName || (lang === 'en' ? 'My Name' : 'Mon Nom'),
        photo: profile.photo || SAMPLE_TECH_CV.photo,
        location: profile.location || (lang === 'en' ? 'Paris, France' : 'Paris, France'),
        email: profile.email || 'user@example.com',
        phone: profile.phone || '+33 6 00 00 00 00',
        website: profile.website || 'linkedin.com/in/profile',
        summary: profile.masterCV 
          ? profile.masterCV.slice(0, 300) + '...'
          : (lang === 'en' ? 'Experienced professional dedicated to delivering high-impact solutions.' : 'Professionnel expérimenté dédié à la livraison de solutions à fort impact.'),
        experiences: SAMPLE_TECH_CV.experiences,
        education: SAMPLE_TECH_CV.education,
        skills: userSkills
      });
    }
  };

  // Direct PDF Download
  const handleDownloadPdf = async () => {
    if (isExportingPdf) return;
    try {
      setIsExportingPdf(true);
      const name = testCV?.fullName || 'CV_Test';
      const cleanName = name.replace(/[^a-zA-Z0-9_-]/g, '_');
      await downloadElementAsPDF({
        elementId: 'cv-render',
        filename: `CV_${cleanName}_${selectedResumeTemplate}.pdf`,
        isMultiPage: currentMultiPage
      });
    } catch (err) {
      console.error('PDF download error:', err);
      handlePrint();
    } finally {
      setIsExportingPdf(false);
    }
  };

  // Direct print trigger
  const handlePrint = () => {
    window.print();
  };

  // Export JSON
  const handleExportJson = () => {
    const dataStr = JSON.stringify(testCV, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `resume_test_data_${selectedResumeTemplate}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Export YAML (for RenderCV)
  const handleExportYaml = () => {
    let yaml = `cv:\n  name: "${testCV.fullName}"\n  location: "${testCV.location}"\n  email: "${testCV.email}"\n  phone: "${testCV.phone}"\n`;
    const blob = new Blob([yaml], { type: 'text/yaml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `CV_rendercv_test.yaml`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-5 max-w-7xl mx-auto pb-12">
      {/* Dev Studio Header Banner - Responsive & Non-wrapping */}
      <div className="bg-gradient-to-r from-amber-500/15 via-orange-500/10 to-blue-500/10 dark:from-amber-950/40 dark:via-orange-950/20 dark:to-blue-950/20 p-4 sm:p-5 md:p-6 rounded-2xl border border-amber-300/40 dark:border-amber-700/40 shadow-xs no-print print:hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center font-black text-xs sm:text-sm shadow-2xs shrink-0">
                DEV
              </div>
              <h2 className="text-lg sm:text-xl md:text-2xl font-black text-gray-900 dark:text-white tracking-tight whitespace-nowrap">
                Dev Studio
              </h2>
              <span className="text-xs sm:text-sm font-semibold text-gray-600 dark:text-gray-300 hidden sm:inline">
                — {lang === 'en' ? 'Resume Sandbox' : 'Laboratoire CV'}
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-900 dark:bg-amber-900/60 dark:text-amber-200 border border-amber-300 dark:border-amber-700 whitespace-nowrap shrink-0">
                ⚡ 0 Token
              </span>
            </div>
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 max-w-3xl leading-relaxed">
              {t.devLabSubtitle || 'Testez, personnalisez et prévisualisez tous les modèles de CV en temps réel sans consommer aucun token API.'}
            </p>
          </div>

          {/* Quick Presets Picker */}
          <div className="flex items-center gap-1.5 flex-wrap bg-white/90 dark:bg-gray-800/90 p-1.5 rounded-xl border border-amber-200/80 dark:border-amber-800/60 shrink-0 self-start lg:self-center">
            <span className="text-[11px] font-bold text-gray-500 dark:text-gray-400 px-1 hidden sm:inline">
              {lang === 'en' ? 'Presets:' : 'Profils:'}
            </span>
            <button
              onClick={() => handleSelectPreset('tech')}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer whitespace-nowrap ${
                activePreset === 'tech'
                  ? 'bg-amber-500 text-white shadow-2xs'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              💻 Tech Lead
            </button>
            <button
              onClick={() => handleSelectPreset('product')}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer whitespace-nowrap ${
                activePreset === 'product'
                  ? 'bg-amber-500 text-white shadow-2xs'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              🎯 Product PM
            </button>
            <button
              onClick={() => handleSelectPreset('my_profile')}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer whitespace-nowrap ${
                activePreset === 'my_profile'
                  ? 'bg-amber-500 text-white shadow-2xs'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              👤 {t.loadMyProfileData || 'Mon Profil'}
            </button>
          </div>
        </div>
      </div>

      {/* Control Panel: Template, Color, Density, Photo Toggle & Photo Size */}
      <div className="bg-white dark:bg-gray-800 p-4 sm:p-5 rounded-2xl shadow-xs border border-gray-100 dark:border-gray-700/80 space-y-4 no-print print:hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 dark:border-gray-700 pb-3">
          <div className="flex items-center gap-2">
            <LayoutTemplate className="text-amber-500" size={18} />
            <h3 className="font-bold text-sm sm:text-base text-gray-900 dark:text-white">
              {t.devControlsTitle || 'Personnalisation & Options du CV'}
            </h3>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setIsEditorOpen(!isEditorOpen)}
              className={`flex items-center gap-1.5 px-3 py-1.5 sm:py-2 text-xs font-semibold rounded-xl border transition-colors cursor-pointer ${
                isEditorOpen 
                  ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-300 text-amber-700 dark:text-amber-300' 
                  : 'bg-gray-50 dark:bg-gray-700/70 border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-100'
              }`}
            >
              <FileText size={14} />
              {isEditorOpen ? (lang === 'en' ? 'Hide Data' : 'Masquer Données') : (lang === 'en' ? 'Edit Data' : 'Modifier données')}
            </button>

            {selectedResumeTemplate === 'rendercv' && (
              <button
                onClick={handleExportYaml}
                className="flex items-center gap-1.5 px-3 py-1.5 sm:py-2 text-xs font-semibold bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 rounded-xl hover:bg-emerald-100 cursor-pointer"
              >
                <Download size={13} /> YAML
              </button>
            )}

            <button
              onClick={handleExportJson}
              className="flex items-center gap-1.5 px-3 py-1.5 sm:py-2 text-xs font-semibold bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200 rounded-xl hover:bg-slate-100 cursor-pointer"
            >
              <Download size={13} /> JSON
            </button>

            <button
              onClick={handleDownloadPdf}
              disabled={isExportingPdf}
              className="flex items-center gap-1.5 px-3.5 py-1.5 sm:py-2 text-xs sm:text-sm font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-xs cursor-pointer transition-all disabled:opacity-60"
            >
              {isExportingPdf ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
              <span>{isExportingPdf ? (lang === 'en' ? 'Generating...' : 'Création...') : (lang === 'en' ? 'Download PDF' : 'Télécharger PDF')}</span>
            </button>
          </div>
        </div>

        {/* 1. Template Selection Grid */}
        <div>
          <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">
            {lang === 'en' ? 'Choose Resume Template' : 'Sélectionner le modèle de CV'}
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {RESUME_TEMPLATES.map((tpl) => {
              const isSelected = selectedResumeTemplate === tpl.id;
              return (
                <button
                  key={tpl.id}
                  type="button"
                  onClick={() => setSelectedResumeTemplate(tpl.id)}
                  className={`p-2.5 sm:p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                    isSelected 
                      ? 'border-blue-600 dark:border-blue-500 bg-blue-50/70 dark:bg-blue-900/30 ring-2 ring-blue-500/20 shadow-2xs' 
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 bg-white dark:bg-gray-800'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className={`text-xs font-bold ${isSelected ? 'text-blue-900 dark:text-blue-200' : 'text-gray-900 dark:text-white'}`}>
                        {tpl.name}
                      </span>
                      {isSelected && <span className="w-2 h-2 rounded-full bg-blue-600 dark:bg-blue-400" />}
                    </div>
                    <p className="text-[11px] text-gray-500 dark:text-gray-400 line-clamp-2 mb-2 leading-snug">
                      {tpl.description}
                    </p>
                  </div>
                  <span className={`text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded self-start ${
                    tpl.id === 'rendercv' 
                      ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300' 
                      : 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300'
                  }`}>
                    {tpl.badge}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 2. Style & Rendering Options: Colors, Page Format (1p / multi-page), Density, Photo Toggle & Photo Size */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3.5 pt-3 border-t border-gray-100 dark:border-gray-700">
          {/* Accent Color */}
          <div>
            <div className="flex items-center gap-1.5 mb-1.5">
              <Palette size={14} className="text-gray-500 dark:text-gray-400" />
              <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                {t.accentColorTitle || "Couleur d'accent"}
              </label>
              {selectedResumeTemplate === 'rendercv' && (
                <span className="text-[10px] text-gray-400 italic">
                  ({lang === 'en' ? 'Monochrome' : 'Monochrome'})
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 flex-wrap min-h-[36px]">
              {ACCENT_COLORS.map((c) => {
                const isActive = resumeAccentColor === c.hex;
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setResumeAccentColor(c.hex)}
                    disabled={selectedResumeTemplate === 'rendercv'}
                    title={c.name}
                    className={`w-7 h-7 rounded-full flex items-center justify-center transition-transform cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${
                      isActive ? 'ring-2 ring-offset-2 ring-gray-900 dark:ring-white scale-110' : 'hover:scale-105'
                    }`}
                    style={{ backgroundColor: c.hex }}
                  >
                    {isActive && <span className="w-2 h-2 rounded-full bg-white shadow-xs" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Page Format Toggle (1 Page strictly vs Multi-Page) */}
          <div>
            <div className="flex items-center justify-between gap-1.5 mb-1.5">
              <div className="flex items-center gap-1.5">
                <Files size={14} className="text-gray-500 dark:text-gray-400" />
                <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                  {t.pageFormatTitle || 'Format (A4)'}
                </label>
              </div>
              {!currentMultiPage && (
                <span className="text-[9.5px] px-1.5 py-0.2 font-bold rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60" title="Anti-blank page active">
                  1p
                </span>
              )}
            </div>
            <div className="flex gap-1.5 min-h-[36px] items-center">
              <button
                type="button"
                title={t.singlePageTip || 'Strictement 1 page A4 (évite toute 2ème page blanche)'}
                onClick={() => toggleMultiPage(false)}
                className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-semibold border transition-colors cursor-pointer whitespace-nowrap ${
                  !currentMultiPage
                    ? 'bg-blue-600 text-white border-blue-600 shadow-2xs'
                    : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-750'
                }`}
              >
                {t.singlePageBadge || '1 Page'}
              </button>
              <button
                type="button"
                title={t.multiPageTip || 'Autorise le CV à s’étendre sur plusieurs pages'}
                onClick={() => toggleMultiPage(true)}
                className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-semibold border transition-colors cursor-pointer whitespace-nowrap ${
                  currentMultiPage
                    ? 'bg-blue-600 text-white border-blue-600 shadow-2xs'
                    : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-750'
                }`}
              >
                {t.multiPageBadge || 'Multi-pages'}
              </button>
            </div>
          </div>

          {/* Density Selector */}
          <div>
            <div className="flex items-center gap-1.5 mb-1.5">
              <SlidersHorizontal size={14} className="text-gray-500 dark:text-gray-400" />
              <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                {t.pageDensityTitle || 'Densité de page (A4)'}
              </label>
            </div>
            <div className="flex gap-1.5 min-h-[36px] items-center">
              {[
                { id: 'compact', label: t.densityCompactShort || 'Compact', title: t.densityCompact },
                { id: 'normal', label: t.densityNormalShort || 'Standard', title: t.densityNormal },
                { id: 'relaxed', label: t.densityRelaxedShort || 'Aéré', title: t.densityRelaxed }
              ].map((d) => (
                <button
                  key={d.id}
                  type="button"
                  title={d.title}
                  onClick={() => setResumeDensity(d.id)}
                  className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-semibold border transition-colors cursor-pointer whitespace-nowrap ${
                    resumeDensity === d.id
                      ? 'bg-gray-900 text-white border-gray-900 dark:bg-white dark:text-gray-900 dark:border-white shadow-2xs'
                      : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-750'
                  }`}
                >
                  {d.label}
                </button>
              ))}
            </div>
          </div>

          {/* Show / Hide Photo Toggle Switch */}
          <div>
            <div className="flex items-center gap-1.5 mb-1.5">
              <ImageIcon size={14} className="text-gray-500 dark:text-gray-400" />
              <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                {t.showPhotoOnResume || 'Photo de profil'}
              </label>
            </div>
            <div className="flex items-center justify-between p-1.5 sm:p-2 rounded-xl bg-gray-50 dark:bg-gray-700/60 border border-gray-200 dark:border-gray-600 min-h-[36px]">
              <span className="text-xs font-medium text-gray-800 dark:text-gray-200">
                {showPhoto 
                  ? (t.showPhotoOn || 'Visible') 
                  : (t.showPhotoOff || 'Masquée')}
              </span>
              <button
                type="button"
                onClick={() => setShowPhoto(!showPhoto)}
                className={`relative inline-flex h-5 w-10 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                  showPhoto ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'
                }`}
                role="switch"
                aria-checked={showPhoto}
              >
                <span
                  className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                    showPhoto ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Photo Size Selector */}
          <div>
            <div className="flex items-center gap-1.5 mb-1.5">
              <ImageIcon size={14} className="text-gray-500 dark:text-gray-400" />
              <label className={`text-xs font-semibold ${showPhoto ? 'text-gray-700 dark:text-gray-300' : 'text-gray-400 dark:text-gray-500'}`}>
                {t.photoSizeTitle || 'Taille de photo'}
              </label>
            </div>
            <div className="flex gap-1.5 min-h-[36px] items-center">
              {[
                { id: 'sm', label: t.photoSizeSm || 'Petite' },
                { id: 'md', label: t.photoSizeMd || 'Moyenne' },
                { id: 'lg', label: t.photoSizeLg || 'Grande' }
              ].map((s) => (
                <button
                  key={s.id}
                  type="button"
                  disabled={!showPhoto}
                  onClick={() => setPhotoSize && setPhotoSize(s.id)}
                  className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-semibold border transition-colors whitespace-nowrap ${
                    !showPhoto 
                      ? 'opacity-40 cursor-not-allowed bg-gray-100 dark:bg-gray-800 text-gray-400 border-gray-200 dark:border-gray-700'
                      : photoSize === s.id
                        ? 'bg-blue-600 text-white border-blue-600 shadow-2xs cursor-pointer'
                        : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-750 cursor-pointer'
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 3. Collapsible Mock Data Editor */}
        {isEditorOpen && (
          <div className="pt-4 border-t border-gray-100 dark:border-gray-700 space-y-4 bg-gray-50/70 dark:bg-gray-900/40 p-4 rounded-xl">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                  {t.devEditData || 'Modifier les données test'}
                </h4>
                <p className="text-[11px] text-gray-500 dark:text-gray-400">
                  {t.devDataSubtitle || 'Ajustez les champs ci-dessous pour tester le rendu instantanément :'}
                </p>
              </div>
              <button
                onClick={() => handleSelectPreset(activePreset)}
                className="text-xs text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <RotateCcw size={12} /> {t.restore || 'Réinitialiser'}
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-gray-600 dark:text-gray-400 mb-1">{t.fullName}</label>
                <input
                  type="text"
                  value={testCV.fullName || ''}
                  onChange={(e) => setTestCV({ ...testCV, fullName: e.target.value })}
                  className="w-full p-2 text-xs border rounded-lg bg-white dark:bg-gray-800 dark:border-gray-700 dark:text-white outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-gray-600 dark:text-gray-400 mb-1">{t.email}</label>
                <input
                  type="email"
                  value={testCV.email || ''}
                  onChange={(e) => setTestCV({ ...testCV, email: e.target.value })}
                  className="w-full p-2 text-xs border rounded-lg bg-white dark:bg-gray-800 dark:border-gray-700 dark:text-white outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-gray-600 dark:text-gray-400 mb-1">{t.location}</label>
                <input
                  type="text"
                  value={testCV.location || ''}
                  onChange={(e) => setTestCV({ ...testCV, location: e.target.value })}
                  className="w-full p-2 text-xs border rounded-lg bg-white dark:bg-gray-800 dark:border-gray-700 dark:text-white outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-gray-600 dark:text-gray-400 mb-1">{t.phone}</label>
                <input
                  type="text"
                  value={testCV.phone || ''}
                  onChange={(e) => setTestCV({ ...testCV, phone: e.target.value })}
                  className="w-full p-2 text-xs border rounded-lg bg-white dark:bg-gray-800 dark:border-gray-700 dark:text-white outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-gray-600 dark:text-gray-400 mb-1">{t.website}</label>
                <input
                  type="text"
                  value={testCV.website || ''}
                  onChange={(e) => setTestCV({ ...testCV, website: e.target.value })}
                  className="w-full p-2 text-xs border rounded-lg bg-white dark:bg-gray-800 dark:border-gray-700 dark:text-white outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-gray-600 dark:text-gray-400 mb-1">{lang === 'en' ? 'Photo URL' : 'URL Photo'}</label>
                <input
                  type="text"
                  value={testCV.photo || ''}
                  onChange={(e) => setTestCV({ ...testCV, photo: e.target.value })}
                  placeholder="https://..."
                  className="w-full p-2 text-xs border rounded-lg bg-white dark:bg-gray-800 dark:border-gray-700 dark:text-white outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-gray-600 dark:text-gray-400 mb-1">Résumé / Bio</label>
              <textarea
                rows={3}
                value={testCV.summary || ''}
                onChange={(e) => setTestCV({ ...testCV, summary: e.target.value })}
                className="w-full p-2 text-xs border rounded-lg bg-white dark:bg-gray-800 dark:border-gray-700 dark:text-white outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>
        )}
      </div>

      {/* 4. Hiring Weather Date Simulator (Dev Tool) */}
      <div className="bg-gradient-to-r from-blue-500/10 via-amber-500/10 to-indigo-500/10 dark:from-blue-950/30 dark:via-amber-950/20 dark:to-indigo-950/30 p-4 sm:p-5 rounded-2xl border border-blue-200/80 dark:border-blue-800/60 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-blue-200/60 dark:border-blue-800/40 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-gradient-to-br from-amber-400 to-orange-500 text-white rounded-xl shadow-xs shrink-0">
              <Sun size={17} />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-bold text-sm sm:text-base text-gray-900 dark:text-white">
                  {t.weatherSimulatorTitle || 'Simulateur Météo du Recrutement'}
                </h3>
                <span className={`px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-bold border ${
                  isSimulationActive
                    ? 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-900/50 dark:text-amber-200 dark:border-amber-700'
                    : 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-900/50 dark:text-emerald-200 dark:border-emerald-750'
                }`}>
                  {isSimulationActive 
                    ? (t.simulatedDateActive || 'Simulation active') 
                    : (t.realDateActive || 'Date réelle')}
                </span>
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
                {t.weatherSimulatorSubtitle || "Testez les dynamiques d'embauche selon les mois de l'année pour voir comment le widget s'adapte :"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setSimulatedMonth && setSimulatedMonth(null)}
              disabled={!isSimulationActive}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                isSimulationActive
                  ? 'bg-white dark:bg-gray-800 text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-700 hover:bg-amber-50 dark:hover:bg-gray-700 shadow-2xs'
                  : 'bg-gray-100 dark:bg-gray-800/50 text-gray-400 dark:text-gray-500 border border-transparent cursor-not-allowed'
              }`}
              title={t.resetRealDate || 'Rétablir la date actuelle (Temps réel)'}
            >
              <RotateCcw size={12} />
              <span>{t.resetRealDate || 'Rétablir date réelle'}</span>
            </button>
          </div>
        </div>

        {/* 12 Months Grid Selector */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 pt-1">
          {HIRING_WEATHER_MONTHS.map((m) => {
            const isSelected = currentSimMonthIdx === m.monthIndex;
            const isRealCurrentMonth = realMonthIdx === m.monthIndex;
            return (
              <button
                key={m.monthIndex}
                type="button"
                onClick={() => setSimulatedMonth && setSimulatedMonth(m.monthIndex)}
                className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between min-h-[64px] ${
                  isSelected
                    ? 'border-amber-500 bg-amber-50 dark:bg-amber-950/40 ring-2 ring-amber-500/20 shadow-2xs'
                    : 'border-gray-200 dark:border-gray-700/80 hover:border-amber-300 dark:hover:border-amber-700 bg-white dark:bg-gray-800'
                }`}
              >
                <div className="flex items-center justify-between gap-1 mb-1">
                  <span className={`text-xs font-bold truncate ${isSelected ? 'text-amber-950 dark:text-amber-200' : 'text-gray-900 dark:text-white'}`}>
                    {t[m.monthKey] || m.monthKey}
                  </span>
                  {isRealCurrentMonth && (
                    <span className="text-[9px] font-extrabold uppercase px-1 py-0.2 rounded bg-blue-100 dark:bg-blue-900/60 text-blue-800 dark:text-blue-200 shrink-0" title="Mois réel actuel">
                      {lang === 'en' ? 'NOW' : 'RÉEL'}
                    </span>
                  )}
                </div>
                <div className="flex items-center justify-between gap-1 mt-auto">
                  <span className="text-[10px] font-semibold text-gray-500 dark:text-gray-400 truncate">
                    {lang === 'en' ? m.tempBadgeEn : m.tempBadgeFr}
                  </span>
                  {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />}
                </div>
              </button>
            );
          })}
        </div>

        {/* Selected Month Preview Snapshot in Dev Studio */}
        <div className="p-3 bg-white/80 dark:bg-gray-800/80 rounded-xl border border-blue-100 dark:border-gray-700/70 flex items-start gap-2.5">
          <Zap className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
          <div className="text-xs min-w-0 flex-1">
            <span className="font-bold text-gray-900 dark:text-white">
              {lang === 'en' ? HIRING_WEATHER_MONTHS[currentSimMonthIdx].titleEn : HIRING_WEATHER_MONTHS[currentSimMonthIdx].titleFr} :
            </span>{' '}
            <span className="text-gray-600 dark:text-gray-300">
              {lang === 'en' ? HIRING_WEATHER_MONTHS[currentSimMonthIdx].descEn : HIRING_WEATHER_MONTHS[currentSimMonthIdx].descFr}
            </span>
          </div>
        </div>
      </div>

      {/* Live A4 Canvas Container */}
      <div className="space-y-2">
        <div className="flex items-center justify-between px-1 flex-wrap gap-2 no-print print:hidden">
          <div className="flex items-center gap-2">
            <Eye size={16} className="text-gray-500" />
            <h4 className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
              {t.devLivePreview || 'Aperçu en direct (A4)'}
            </h4>
          </div>
          <div className="flex items-center gap-2 text-[11px] text-gray-500 dark:text-gray-400">
            <span>{RESUME_TEMPLATES.find(tpl => tpl.id === selectedResumeTemplate)?.name}</span>
            <span>•</span>
            <span className="capitalize">{resumeDensity}</span>
            <span>•</span>
            <span className="font-semibold text-blue-600 dark:text-blue-400">{currentMultiPage ? (t.multiPageBadge || 'Multi-pages') : (t.singlePageBadge || '1 Page')}</span>
            <span>•</span>
            <span>{showPhoto ? (lang === 'en' ? `Photo (${photoSize.toUpperCase()})` : `Photo (${photoSize === 'sm' ? 'Petite' : photoSize === 'lg' ? 'Grande' : 'Moyenne'})`) : 'Sans photo'}</span>
          </div>
        </div>

        <div className="w-full flex justify-center bg-gray-150 dark:bg-gray-900 p-2 sm:p-6 md:p-8 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-x-auto shadow-inner print:p-0 print:m-0 print:bg-white print:border-none print:shadow-none print:rounded-none print:overflow-visible">
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
          <ResumeRenderer
            cv={testCV}
            profile={{ ...profile, photo: testCV.photo }}
            template={selectedResumeTemplate}
            accentColorHex={resumeAccentColor}
            density={resumeDensity}
            showPhoto={showPhoto}
            photoSize={photoSize}
            isMultiPage={currentMultiPage}
            t={t}
            lang={lang}
          />
        </div>
      </div>
    </div>
  );
}
