import React, { useState, useMemo } from 'react';
import {
  Sun,
  ChevronDown,
  ChevronUp,
  Zap,
  RotateCcw,
  FlaskConical
} from 'lucide-react';

export const HIRING_WEATHER_MONTHS = [
  {
    monthIndex: 0,
    monthKey: 'january',
    quarter: 'Q1',
    climate: 'peak',
    iconType: 'flame',
    tagFr: 'Grand Dégel & Plein Soleil',
    tagEn: 'Annual Thaw & Clear Skies',
    tempBadgeFr: '🔥 Plein Soleil & Dégel',
    tempBadgeEn: '🔥 High Heat & Sun',
    badgeColor: 'bg-rose-100 text-rose-800 border-rose-200 dark:bg-rose-900/40 dark:text-rose-300 dark:border-rose-800',
    titleFr: 'Postulez maintenant pour un poste en février & au printemps ! ☀️',
    titleEn: 'Apply Now for a Position in February & Spring! ☀️',
    descFr: 'Météo de l\'emploi : Ciel parfaitement dégagé et températures au plus haut ! Les budgets annuels sont débloqués. Postulez dès maintenant pour décrocher vos entretiens avant le printemps.',
    descEn: 'Weather Forecast: Clear skies and warm hiring fronts! Annual budgets are unlocked. Apply actively now to land interviews before spring.',
    adviceFr: 'Période royale pour les CDI et profils expérimentés ! Postulez activement dès la première quinzaine de janvier.',
    adviceEn: 'Prime window for full-time permanent roles. Apply actively during the first two weeks of January.',
    targetStartFr: 'Prise de poste : Février à Avril',
    targetStartEn: 'Target Start Date: February to April',
    competitionFr: 'Moyenne (remise en route progressive)',
    competitionEn: 'Moderate (gradual market warmup)',
    speedFr: 'Rapide (2 à 4 semaines)',
    speedEn: 'Fast (2 to 4 weeks)',
    contracts: ['CDI', 'CDD', 'Freelance']
  },
  {
    monthIndex: 1,
    monthKey: 'february',
    quarter: 'Q1',
    climate: 'active',
    iconType: 'sun',
    tagFr: 'Douceur Printanière',
    tagEn: 'Spring Warming',
    tempBadgeFr: '☀️ Beau Fixe & Élan',
    tempBadgeEn: '☀️ Rising Sunshine',
    badgeColor: 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/40 dark:text-amber-300 dark:border-amber-800',
    titleFr: 'Postulez maintenant pour un poste en mars & avril ! ☀️',
    titleEn: 'Apply Now for a Position in March & April! ☀️',
    descFr: 'Météo de l\'emploi : Vent favorable et baromètre au beau fixe ! Les premiers entretiens de janvier débouchent sur des offres et les premières opportunités de stages s\'ouvrent.',
    descEn: 'Weather Forecast: Gentle hiring winds and high pressure! Recruiter response rates peak as initial budget openings convert into offers.',
    adviceFr: 'Maintenez la cadence ! Si vous visez un stage ou une alternance, commencez à cartographier vos entreprises cibles.',
    adviceEn: 'Keep the momentum going! Great timing to map and target companies for spring/summer internships.',
    targetStartFr: 'Prise de poste : Mars à Mai',
    targetStartEn: 'Target Start Date: March to May',
    competitionFr: 'Moyenne',
    competitionEn: 'Moderate',
    speedFr: 'Rapide (2 à 5 semaines)',
    speedEn: 'Fast (2 to 5 weeks)',
    contracts: ['CDI', 'Stage', 'CDD']
  },
  {
    monthIndex: 2,
    monthKey: 'march',
    quarter: 'Q1',
    climate: 'active',
    iconType: 'sun',
    tagFr: 'Brise Printanière',
    tagEn: 'Spring Breeze',
    tempBadgeFr: '🌸 Brise Printanière',
    tempBadgeEn: '🌸 Spring Hiring Breeze',
    badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/40 dark:text-emerald-300 dark:border-emerald-800',
    titleFr: 'Postulez maintenant pour le printemps ou l\'alternance de septembre ! 🌸',
    titleEn: 'Apply Now for Spring Roles or September Apprenticeships! 🌸',
    descFr: 'Météo de l\'emploi : Brise printanière porteuse ! Fenêtre idéale pour boucler les postes du T2 et lancer vos candidatures pour l\'alternance de la rentrée.',
    descEn: 'Weather Forecast: Fresh spring breeze! Prime window to lock in Q2 permanent positions and start early applications for autumn school-year intakes.',
    adviceFr: 'Pour les alternances et stages de septembre : postulez dès maintenant ! Les grands groupes sélectionnent dès mars/avril.',
    adviceEn: 'For September apprenticeships/internships: apply right now! Top companies shortlist starting in March.',
    targetStartFr: 'Prise de poste : Avril - Juin (ou Septembre pour Alternance)',
    targetStartEn: 'Target Start Date: April - June (or September for Apprenticeships)',
    competitionFr: 'Élevée (flux d’étudiants)',
    competitionEn: 'High (rising student volume)',
    speedFr: 'Standard (3 à 6 semaines)',
    speedEn: 'Standard (3 to 6 weeks)',
    contracts: ['Alternance', 'Stage', 'CDI']
  },
  {
    monthIndex: 3,
    monthKey: 'april',
    quarter: 'Q2',
    climate: 'active',
    iconType: 'sun',
    tagFr: 'Pic Anticyclonique',
    tagEn: 'High Pressure Peak',
    tempBadgeFr: '🌤️ Pic Anticyclonique',
    tempBadgeEn: '🌤️ High Pressure Peak',
    badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/40 dark:text-emerald-300 dark:border-emerald-800',
    titleFr: 'Postulez maintenant pour l\'été et la rentrée de septembre ! 🌤️',
    titleEn: 'Apply Now for Summer Positions & September Intakes! 🌤️',
    descFr: 'Météo de l\'emploi : Anticyclone durable et grand soleil ! Pic de volume pour les alternances de septembre et accélérations sur les recrutements CDI de printemps.',
    descEn: 'Weather Forecast: Sustained high pressure and sunny skies! Peak volume for September apprenticeships and rapid CDI spring hirings.',
    adviceFr: 'Multipliez les candidatures ciblées et adaptez votre CV par offre. Les meilleures places partent en avril/mai.',
    adviceEn: 'Tailor your CV for every single role. Prime positions get locked down in April and May.',
    targetStartFr: 'Prise de poste : Mai - Juillet (ou Septembre)',
    targetStartEn: 'Target Start Date: May - July (or September)',
    competitionFr: 'Élevée',
    competitionEn: 'High',
    speedFr: 'Standard (3 à 6 semaines)',
    speedEn: 'Standard (3 to 6 weeks)',
    contracts: ['Alternance', 'Stage', 'CDI', 'Freelance']
  },
  {
    monthIndex: 4,
    monthKey: 'may',
    quarter: 'Q2',
    climate: 'moderate',
    iconType: 'cloud-sun',
    tagFr: 'Éclaircies & Ponts',
    tagEn: 'Sunny Intervals',
    tempBadgeFr: '⛅ Belles Éclaircies',
    tempBadgeEn: '⛅ Sunny Intervals',
    badgeColor: 'bg-sky-100 text-sky-800 border-sky-200 dark:bg-sky-900/40 dark:text-sky-300 dark:border-sky-800',
    titleFr: 'Postulez maintenant pour un poste en septembre (préavis de 3 mois) ! ⛅',
    titleEn: 'Apply Now for a Position in September (3-Month Notice)! ⛅',
    descFr: 'Météo de l\'emploi : Éclaircies favorables entre les ponts fériés ! Timing stratégique parfait pour poser votre préavis de 3 mois et démarrer pile le 1er septembre.',
    descEn: 'Weather Forecast: Sunny outlook with passing holiday clouds! Perfect timing if you have a 3-month notice period to start onboarding on September 1st.',
    adviceFr: 'Si vous avez 3 mois de préavis : C’est le moment d’envoyer vos candidatures pour être prêt le 1er septembre !',
    adviceEn: 'If you have a 3-month notice period: this is the exact time to apply for a September 1st start!',
    targetStartFr: 'Prise de poste : Septembre (avec préavis)',
    targetStartEn: 'Target Start Date: September (with notice period)',
    competitionFr: 'Moyenne',
    competitionEn: 'Moderate',
    speedFr: 'Modéré (dû aux jours fériés)',
    speedEn: 'Moderate (due to public holidays)',
    contracts: ['CDI', 'Alternance', 'CDD']
  },
  {
    monthIndex: 5,
    monthKey: 'june',
    quarter: 'Q2',
    climate: 'active',
    iconType: 'sun',
    tagFr: 'Front Chaud Express',
    tagEn: 'Pre-Summer Heat',
    tempBadgeFr: '☀️ Front Chaud Express',
    tempBadgeEn: '☀️ Fast-Track Warmth',
    badgeColor: 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/40 dark:text-amber-300 dark:border-amber-800',
    titleFr: 'Postulez maintenant avant la trêve pour démarrer en juillet ou septembre ! ☀️',
    titleEn: 'Apply Now for Immediate Summer Roles or an Early Autumn Start! ☀️',
    descFr: 'Météo de l\'emploi : Front chaud express ! Les recruteurs accélèrent le traitement des dossiers pour signer les contrats avant les départs en vacances.',
    descEn: 'Weather Forecast: Fast-moving warm front! Recruiters fast-track candidate screening to finalize contracts before holiday departures.',
    adviceFr: 'Processus d’entretien souvent condensés en 2 semaines. Soyez ultra-disponible pour les entretiens.',
    adviceEn: 'Interview rounds are often condensed into 2 weeks. Be highly responsive and flexible for interview slots.',
    targetStartFr: 'Prise de poste : Juillet ou Septembre',
    targetStartEn: 'Target Start Date: July or September',
    competitionFr: 'Moyenne',
    competitionEn: 'Moderate',
    speedFr: 'Accéléré sur les profils disponibles',
    speedEn: 'Fast-tracked for available candidates',
    contracts: ['CDI', 'Alternance', 'Freelance']
  },
  {
    monthIndex: 6,
    monthKey: 'july',
    quarter: 'Q3',
    climate: 'quiet',
    iconType: 'compass',
    tagFr: 'Mer Calme & Opportunité',
    tagEn: 'Calm Summer Seas',
    tempBadgeFr: '🏖️ Douce Brise Estivale',
    tempBadgeEn: '🏖️ Gentle Summer Breeze',
    badgeColor: 'bg-indigo-100 text-indigo-800 border-indigo-200 dark:bg-indigo-900/40 dark:text-indigo-300 dark:border-indigo-800',
    titleFr: 'Postulez en douceur maintenant pour un poste en septembre ! 🏖️',
    titleEn: 'Apply Quietly Now for a Position in September! 🏖️',
    descFr: 'Météo de l\'emploi : Mer calme et concurrence minimale ! Pendant que la majorité des candidats font une pause, vos candidatures arrivent directement sur le dessus de la pile.',
    descEn: 'Weather Forecast: Calm seas and low competition! While most candidates pause their search, your applications land right on top of the pile for late-summer review.',
    adviceFr: 'Continuez d’envoyer des candidatures : votre CV arrive directement sur le dessus de la pile pour la reprise de fin août !',
    adviceEn: 'Keep submitting applications: your resume lands straight at the top of the recruiter pile for late August review!',
    targetStartFr: 'Prise de poste : Septembre - Octobre',
    targetStartEn: 'Target Start Date: September - October',
    competitionFr: 'Faible (très grand avantage candidat)',
    competitionEn: 'Low (huge candidate advantage)',
    speedFr: 'Ralenti (3 à 7 semaines)',
    speedEn: 'Slower (3 to 7 weeks)',
    contracts: ['CDI', 'Freelance', 'Alternance (Dernières places)']
  },
  {
    monthIndex: 7,
    monthKey: 'august',
    quarter: 'Q3',
    climate: 'quiet',
    iconType: 'compass',
    tagFr: 'Fenêtre Dorée Rentrée',
    tagEn: 'Golden Autumn Window',
    tempBadgeFr: '🏖️ Fenêtre Dorée Rentrée',
    tempBadgeEn: '🏖️ Golden Autumn Window',
    badgeColor: 'bg-amber-100 text-amber-900 border-amber-300 dark:bg-amber-950/60 dark:text-amber-200 dark:border-amber-700',
    titleFr: 'Postulez maintenant pour la rentrée de septembre ! ☀️',
    titleEn: 'Apply Now for a Position in September! ☀️',
    descFr: 'Météo de l\'emploi : Fenêtre dorée et ciel dégagé ! Les recruteurs trient les candidatures dès fin août pour planifier les entretiens de la première semaine de rentrée.',
    descEn: 'Weather Forecast: Golden sunshine window! Recruiters screen early from late August to schedule priority interviews for the first week of September.',
    adviceFr: '⚡ C\'est le moment idéal : postulez maintenant pour démarrer en septembre ! Concurrence minimale, recruteurs frais et postes de rentrée urgents.',
    adviceEn: '⚡ Prime opportunity: apply now to start in September! Minimal competition, refreshed hiring teams, and urgent autumn openings.',
    targetStartFr: 'Prise de poste : Septembre - Octobre',
    targetStartEn: 'Target Start Date: September - October',
    competitionFr: 'Très Faible (Avantage maximal)',
    competitionEn: 'Very Low (Maximum advantage)',
    speedFr: 'Prise de contact rapide fin août / début septembre',
    speedEn: 'Rapid outreach late August / early September',
    contracts: ['CDI', 'CDD', 'Alternance (Dernière minute)', 'Freelance']
  },
  {
    monthIndex: 8,
    monthKey: 'september',
    quarter: 'Q3',
    climate: 'peak',
    iconType: 'flame',
    tagFr: 'Grande Tempête d\'Embauches',
    tagEn: 'Autumn Storm Surge',
    tempBadgeFr: '⚡ Grande Tempête Embauche',
    tempBadgeEn: '⚡ High-Voltage Surge',
    badgeColor: 'bg-rose-100 text-rose-800 border-rose-200 dark:bg-rose-900/40 dark:text-rose-300 dark:border-rose-800',
    titleFr: 'Postulez maintenant pour des postes en octobre & novembre ! ⚡',
    titleEn: 'Apply Now for Positions in October & November! ⚡',
    descFr: 'Météo de l\'emploi : Tempête majeure d\'embauches et vents porteurs ! Tout le monde est de retour et les budgets du T4 sont débloqués. Postulez activement avec des CV ciblés !',
    descEn: 'Weather Forecast: Massive high-voltage hiring surge! Everyone is back from vacation and departments unleash peak Q4 hiring budgets. Apply actively with tailored CVs!',
    adviceFr: 'Volume d’offres gigantesque ! Adaptez systématiquement votre CV avec l’IA PostuTrack pour vous démarquer dans le flux massif de candidats.',
    adviceEn: 'Massive volume of job postings! Tailor your CV systematically with PostuTrack AI to stand out in the candidate flood.',
    targetStartFr: 'Prise de poste : Octobre à Décembre',
    targetStartEn: 'Target Start Date: October to December',
    competitionFr: 'Très Élevée (tous les candidats sont actifs)',
    competitionEn: 'Very High (all candidates are active)',
    speedFr: 'Très rapide (besoins opérationnels immédiats)',
    speedEn: 'Very fast (urgent operational needs)',
    contracts: ['CDI', 'CDD', 'Freelance', 'Stage Fin d’Études']
  },
  {
    monthIndex: 9,
    monthKey: 'october',
    quarter: 'Q4',
    climate: 'active',
    iconType: 'sun',
    tagFr: 'Courant Porteur T4',
    tagEn: 'Steady Thermal Current',
    tempBadgeFr: '🌤️ Courant Porteur T4',
    tempBadgeEn: '🌤️ Steady Thermal',
    badgeColor: 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/40 dark:text-amber-300 dark:border-amber-800',
    titleFr: 'Postulez maintenant pour un poste en novembre ou début d\'année ! 🌤️',
    titleEn: 'Apply Now for a Position in November & Q1! 🌤️',
    descFr: 'Météo de l\'emploi : Courant thermique porteur ! Forte dynamique sur les CDI et ouverture des premières campagnes de stages pour janvier.',
    descEn: 'Weather Forecast: Steady autumn thermals! High demand across permanent roles and early scouting for January internship pipelines.',
    adviceFr: 'Excellent moment pour les CDI. Si vous cherchez un stage pour janvier, commencez vos envois dès maintenant.',
    adviceEn: 'Excellent timing for permanent roles. If you want a January internship, start applying now.',
    targetStartFr: 'Prise de poste : Novembre à Janvier',
    targetStartEn: 'Target Start Date: November to January',
    competitionFr: 'Élevée',
    competitionEn: 'High',
    speedFr: 'Rapide (3 à 5 semaines)',
    speedEn: 'Fast (3 to 5 weeks)',
    contracts: ['CDI', 'Stage Janvier', 'CDD', 'Freelance']
  },
  {
    monthIndex: 10,
    monthKey: 'november',
    quarter: 'Q4',
    climate: 'active',
    iconType: 'zap',
    tagFr: 'Sprint Éclair Budgets',
    tagEn: 'Lightning Budget Sprint',
    tempBadgeFr: '⚡ Sprint Éclair Fin d\'Année',
    tempBadgeEn: '⚡ Lightning Budget Sprint',
    badgeColor: 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/40 dark:text-amber-300 dark:border-amber-800',
    titleFr: 'Postulez vite pour un poste en décembre ou janvier avant le gel ! ⚡',
    titleEn: 'Apply Fast for a Position in December or January before the Freeze! ⚡',
    descFr: 'Météo de l\'emploi : Coup de foudre express avant le gel de fin d\'année ! Les managers s\'empressent de recruter avant la clôture budgétaire de décembre.',
    descEn: 'Weather Forecast: Fast-moving lightning sprint before the year-end freeze! Managers rush to spend remaining budgets before the December cooldown.',
    adviceFr: 'Les processus sont accélérés. Relancez sans hésiter et soyez disponible rapidement pour signer avant mi-décembre.',
    adviceEn: 'Hiring processes are fast-tracked. Follow up promptly and be ready to sign offers before mid-December.',
    targetStartFr: 'Prise de poste : Décembre ou Janvier',
    targetStartEn: 'Target Start Date: December or January',
    competitionFr: 'Moyenne',
    competitionEn: 'Moderate',
    speedFr: 'Très rapide (volonté de boucler avant les fêtes)',
    speedEn: 'Very fast (urgency to close before holidays)',
    contracts: ['CDI', 'Stage', 'Freelance']
  },
  {
    monthIndex: 11,
    monthKey: 'december',
    quarter: 'Q4',
    climate: 'winter',
    iconType: 'snowflake',
    tagFr: 'Gel Hivernal & Préparation',
    tagEn: 'Winter Freeze & Prep',
    tempBadgeFr: '❄️ Gel Hivernal & Préparation',
    tempBadgeEn: '❄️ Winter Freeze & Prep',
    badgeColor: 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/40 dark:text-blue-300 dark:border-blue-800',
    titleFr: 'Préparez vos profils, postulez dès le 2 janvier ! ❄️',
    titleEn: 'Prepare Your Resumes, Apply for January 2nd! ❄️',
    descFr: 'Météo de l\'emploi : Gel hivernal et calme plat sur les recrutements ! Les décisions ralentissent à la mi-décembre. Préparez vos CV dès maintenant pour dégainer dès le 2 janvier au retour du plein soleil.',
    descEn: 'Weather Forecast: Winter freeze and quiet recruitment frost! Hiring pauses mid-month for holidays. Refine your master resumes now to launch on January 2nd when the sunshine returns.',
    adviceFr: 'Moment idéal pour refaire votre CV, calibrer vos profils et programmer vos candidatures pour le 2-5 janvier !',
    adviceEn: 'Perfect window to polish your master CV, tailor cover letters, and prepare to fire applications in early January!',
    targetStartFr: 'Prise de poste : Janvier à Mars',
    targetStartEn: 'Target Start Date: January to March',
    competitionFr: 'Faible',
    competitionEn: 'Low',
    speedFr: 'Ralenti (décisions reportées à janvier)',
    speedEn: 'Slow (decisions deferred to January)',
    contracts: ['Stage Janvier', 'Préparation CDI']
  }
];

export default function HiringWeatherSection({ t, lang = 'fr', simulatedMonth = null, onResetDate = null }) {
  // Current real month (0-11)
  const realMonthIdx = useMemo(() => new Date().getMonth(), []);
  const activeMonthIdx = (simulatedMonth !== null && !isNaN(simulatedMonth) && simulatedMonth >= 0 && simulatedMonth <= 11)
    ? simulatedMonth
    : realMonthIdx;
  const isSimulated = simulatedMonth !== null && !isNaN(simulatedMonth) && simulatedMonth !== realMonthIdx;

  const [isCollapsed, setIsCollapsed] = useState(false);

  const currentMonthData = HIRING_WEATHER_MONTHS[activeMonthIdx];

  return (
    <div className="bg-gradient-to-br from-white via-blue-50/20 to-indigo-50/30 dark:from-gray-800 dark:via-gray-800 dark:to-gray-800/90 rounded-2xl sm:rounded-3xl shadow-xs border border-blue-100/80 dark:border-gray-700/80 p-3 sm:p-5 2xl:p-7 transition-all">
      {/* Header with Title & Action Controls */}
      <div className="flex items-center justify-between gap-3 pb-3 sm:pb-4 border-b border-gray-100 dark:border-gray-700/80">
        {/* Title and Icon Block */}
        <div className="flex items-start sm:items-center gap-2.5 sm:gap-3 min-w-0 flex-1">
          <div className="p-2 sm:p-2.5 bg-gradient-to-br from-amber-400 to-orange-500 text-white rounded-xl sm:rounded-2xl shadow-xs shrink-0 mt-0.5 sm:mt-0">
            <Sun className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-sm sm:text-base md:text-lg font-extrabold text-gray-900 dark:text-white tracking-tight leading-snug">
                {t.hiringWeatherTitle || (lang === 'en' ? 'Hiring Weather' : 'Météo du Recrutement')}
              </h3>
              {isSimulated && (
                <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/60 text-amber-900 dark:text-amber-200 border border-amber-300 dark:border-amber-700 text-[10px] sm:text-xs font-bold">
                  <FlaskConical size={12} className="text-amber-600 dark:text-amber-300" />
                  <span>{lang === 'en' ? 'Simulated Date (Dev)' : 'Date Simulée (Dev)'}</span>
                  {onResetDate && (
                    <button
                      type="button"
                      onClick={onResetDate}
                      className="ml-1 hover:text-amber-950 dark:hover:text-white underline cursor-pointer flex items-center gap-0.5"
                      title={lang === 'en' ? 'Reset to real date' : 'Rétablir la date réelle'}
                    >
                      <RotateCcw size={10} />
                      {lang === 'en' ? 'Reset' : 'Rétablir'}
                    </button>
                  )}
                </div>
              )}
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5 line-clamp-2 sm:line-clamp-none leading-relaxed">
              {t.hiringWeatherSubtitle || (lang === 'en' ? 'Current hiring climate and best times to apply to maximize your response rate.' : 'Périodes propices et dynamiques d\'embauche pour optimiser vos candidatures.')}
            </p>
          </div>
        </div>

        {/* Minimize / Expand Toggle */}
        <button
          type="button"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-1.5 text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white rounded-lg transition-colors cursor-pointer shrink-0 ml-1"
          title={isCollapsed ? (lang === 'en' ? 'Expand' : 'Agrandir') : (lang === 'en' ? 'Minimize' : 'Réduire')}
          aria-label={isCollapsed ? 'Expand' : 'Minimize'}
        >
          {isCollapsed ? <ChevronDown size={17} /> : <ChevronUp size={17} />}
        </button>
      </div>

      {/* Main Content Area */}
      {!isCollapsed && (
        <div className="pt-3 sm:pt-4 space-y-3 sm:space-y-4 animate-in fade-in duration-200">
          {/* Hero Banner */}
          <div className="p-3.5 sm:p-4.5 rounded-xl sm:rounded-2xl bg-gradient-to-r from-amber-500/15 via-orange-500/10 to-amber-500/15 dark:from-amber-950/40 dark:via-orange-950/20 dark:to-amber-950/40 border border-amber-300/80 dark:border-amber-700/60 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-4">
            <div className="flex items-start gap-3 min-w-0 flex-1">
              <div className="p-2 sm:p-2.5 bg-amber-500 text-white rounded-xl shrink-0 shadow-xs mt-0.5">
                <Zap className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div className="space-y-1 min-w-0 flex-1">
                <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                  <span className="px-2 py-0.5 rounded-full text-[10px] sm:text-[11px] font-extrabold bg-amber-500 text-white uppercase tracking-wider">
                    {t.currentSeasonBadge || (lang === 'en' ? 'Current Period' : 'Période Actuelle')} ({t[currentMonthData.monthKey] || currentMonthData.monthKey})
                  </span>
                  <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold border ${currentMonthData.badgeColor}`}>
                    {lang === 'en' ? currentMonthData.tempBadgeEn : currentMonthData.tempBadgeFr}
                  </span>
                </div>
                <h4 className="text-sm sm:text-base font-extrabold text-amber-950 dark:text-amber-100 leading-snug">
                  {lang === 'en' ? currentMonthData.titleEn : currentMonthData.titleFr}
                </h4>
                <p className="text-xs text-amber-900/90 dark:text-amber-200/90 leading-relaxed">
                  {lang === 'en' ? currentMonthData.descEn : currentMonthData.descFr}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
