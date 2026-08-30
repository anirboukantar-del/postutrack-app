import { SOURCE_KEYS, CONTRACT_KEYS, formatExternalUrl } from './App';

/**
 * Normalizes any job URL into its canonical direct job posting link.
 * Special handling for LinkedIn (e.g. converting search/collection URLs with currentJobId to direct /jobs/view/<id>/ links).
 */
export function normalizeJobUrl(rawUrl) {
  if (!rawUrl || typeof rawUrl !== 'string') return '';
  let url = rawUrl.trim();
  if (!url) return '';

  // Add https protocol if missing
  if (!/^https?:\/\//i.test(url)) {
    url = `https://${url}`;
  }

  try {
    const parsed = new URL(url);
    const hostname = parsed.hostname.toLowerCase();
    const pathname = parsed.pathname;

    // 1. LinkedIn URL Normalization
    if (hostname.includes('linkedin.com')) {
      // Check if currentJobId query param is present (e.g. from search, collections, recommendations, alerts)
      const currentJobId =
        parsed.searchParams.get('currentJobId') ||
        parsed.searchParams.get('jobId') ||
        parsed.searchParams.get('trkJobId') ||
        parsed.searchParams.get('recommendedJobId');

      if (currentJobId && /^\d+$/.test(currentJobId)) {
        return `https://www.linkedin.com/jobs/view/${currentJobId}/`;
      }

      // Check if URL is /jobs/view/<slug>-<jobId> or /jobs/view/<jobId>
      const viewMatch = pathname.match(/\/jobs\/view\/(?:[^\/]+-)?(\d+)/i);
      if (viewMatch && viewMatch[1]) {
        return `https://www.linkedin.com/jobs/view/${viewMatch[1]}/`;
      }

      // If it's already a /jobs/view/... link with slug, keep clean pathname
      if (pathname.includes('/jobs/view/')) {
        return `https://www.linkedin.com${pathname}`;
      }
    }

    // 2. Welcome to the Jungle
    if (hostname.includes('welcometothejungle.com') || hostname.includes('wttj.co')) {
      return `https://www.welcometothejungle.com${pathname}`;
    }

    // 3. Indeed
    if (hostname.includes('indeed.')) {
      const vjk = parsed.searchParams.get('vjk') || parsed.searchParams.get('jk');
      if (vjk) {
        return `https://${parsed.hostname}/viewjob?jk=${vjk}`;
      }
    }

    // 4. Greenhouse / Lever / Ashby / SmartRecruiters / Teamtailor / Workday
    if (
      hostname.includes('greenhouse.io') ||
      hostname.includes('lever.co') ||
      hostname.includes('ashbyhq.com') ||
      hostname.includes('smartrecruiters.com') ||
      hostname.includes('teamtailor.com') ||
      hostname.includes('myworkdayjobs.com')
    ) {
      return `${parsed.origin}${pathname}`;
    }

    // Remove tracking query params (utm_*, gclid, fbclid, ref, etc.)
    const cleanParams = new URLSearchParams();
    for (const [key, value] of parsed.searchParams.entries()) {
      if (!/^(utm_|gclid|fbclid|ref|referrer|source|trk|tracking)/i.test(key)) {
        cleanParams.append(key, value);
      }
    }
    parsed.search = cleanParams.toString();
    return parsed.href;
  } catch {
    return url;
  }
}

/**
 * Decodes HTML entities and common character escapes.
 */
function decodeHtmlEntities(str) {
  if (!str) return '';
  return str
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&rsquo;/g, "'")
    .replace(/&lsquo;/g, "'")
    .replace(/&ldquo;/g, '"')
    .replace(/&rdquo;/g, '"')
    .replace(/&nbsp;/g, ' ')
    .replace(/&middot;/g, '·')
    .replace(/&bull;/g, '•')
    .replace(/&ndash;/g, '–')
    .replace(/&mdash;/g, '—')
    .replace(/&#x2F;/g, '/')
    .replace(/&#(\d+);/g, (_, dec) => String.fromCharCode(dec));
}

/**
 * Strips UI elements, navigation headers, cookie popups, recruitment platforms metadata,
 * buttons, footers, similar jobs recommendations, and web scraping artifacts from a job description.
 * Standardizes sections into clear markdown headings and structured bullet lists.
 */
export function cleanJobDescription(rawText, url = '') {
  if (!rawText || typeof rawText !== 'string') return '';

  let text = decodeHtmlEntities(rawText);

  // 1. Remove script, style, comments, and HTML tags
  text = text.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  text = text.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '');
  text = text.replace(/<!--[\s\S]*?-->/g, '');
  text = text.replace(/<\/?[a-z][a-z0-9]*[^<>]*>/gi, '');

  // 2. Remove markdown images: ![alt](url)
  text = text.replace(/!\[[^\]]*\]\([^)]*\)/g, '');
  text = text.replace(/!\[[^\]]*\]/g, '');

  // 3. Remove markdown links while preserving anchor text: [Link text](url) -> Link text
  text = text.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');

  // 4. Remove base64 data URIs
  text = text.replace(/data:image\/[a-zA-Z]+;base64,[^\s]+/g, '');

  // Detect platform context
  const lowerUrl = (url || '').toLowerCase();
  const isLinkedIn =
    lowerUrl.includes('linkedin.com') ||
    /About the job|À propos du poste|LinkedIn Corporation|Similar jobs|People also viewed/i.test(text);
  const isWTTJ =
    lowerUrl.includes('welcometothejungle.com') ||
    lowerUrl.includes('wttj.co') ||
    /Welcome to the Jungle|Descriptif du poste|Processus de recrutement/i.test(text);

  // Split into raw lines
  const rawLines = text.split('\n');
  let lines = rawLines.map((l) => l.trim());

  // === SPECIFIC LINKEDIN EXTRACTION & CLEANING LOGIC ===
  if (isLinkedIn) {
    let titleHeader = '';
    let companyLocationHeader = '';

    for (let i = 0; i < Math.min(35, lines.length); i++) {
      const line = lines[i];
      if (!titleHeader && /^#\s+([^#]+)$/.test(line)) {
        titleHeader = line;
        if (lines[i + 1] && !lines[i + 1].startsWith('#') && lines[i + 1].length > 2) {
          companyLocationHeader = lines[i + 1];
        }
      }
    }

    let jobDescStartIndex = -1;
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (
        /^(#+\s*)?(About the job|À propos du poste|À propos de l'offre|Description du poste|Description de l'offre|Job description|About this job|About the role|The Role|Position Overview|Job Overview)\b/i.test(
          line
        )
      ) {
        jobDescStartIndex = i;
        break;
      }
    }

    let jobDescEndIndex = lines.length;
    const cutOffPatterns = [
      /^(#+\s*)?(Similar jobs|Offres d'emploi similaires|Offres similaires|Similar Job Searches|Jobs you may be interested in|More jobs|Related jobs)\b/i,
      /^(#+\s*)?(People also viewed|Les utilisateurs ont également consulté|Job seekers also viewed|People also searched)\b/i,
      /^(#+\s*)?(Explore collaborative articles|Articles collaboratifs)\b/i,
      /^(#+\s*)?(About the company|À propos de l'entreprise|Notre entreprise)\s*$/i,
      /^(Set alert for similar jobs|Créer une alerte pour des offres similaires|Get notified about new jobs)\b/i,
      /^(Show more jobs like this|Voir plus d'offres similaires|Search more jobs)\b/i,
      /^(Directory|Browse jobs|Browse LinkedIn|LinkedIn Corporation|LinkedIn ©|© LinkedIn)\b/i,
      /^(Sign in to create a job alert|Sign in to view full profile|Sign in to apply|Join now to see who you know)\b/i,
      /^A\s+B\s+C\s+D\s+E\s+F\s+G\s+H\s+I\s+J\s+K\s+L\s+M\s+N\s+O\s+P\s+Q\s+R\s+S\s+T\s+U\s+V\s+W\s+X\s+Y\s+Z/i,
      /^(About\s*\|\s*Accessibility\s*\|\s*Talent Solutions|Community Guidelines\s*\|\s*Careers)/i,
      /^(New to LinkedIn\? Join now|Welcome back|Sign in with Google)/i
    ];

    const searchFrom = jobDescStartIndex !== -1 ? jobDescStartIndex + 1 : 0;
    for (let i = searchFrom; i < lines.length; i++) {
      const line = lines[i];
      if (cutOffPatterns.some((p) => p.test(line))) {
        jobDescEndIndex = i;
        break;
      }
    }

    let selectedLines = [];
    if (jobDescStartIndex !== -1) {
      if (titleHeader) selectedLines.push(titleHeader);
      if (companyLocationHeader) selectedLines.push(companyLocationHeader);
      if (titleHeader || companyLocationHeader) selectedLines.push('');
      selectedLines.push(...lines.slice(jobDescStartIndex, jobDescEndIndex));
    } else {
      selectedLines = lines.slice(0, jobDescEndIndex);
    }

    lines = selectedLines;
  }

  // === SPECIFIC WELCOME TO THE JUNGLE CLEANING LOGIC ===
  if (isWTTJ) {
    let wttjCutoff = lines.length;
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (
        /^(Découvrir l'entreprise|En savoir plus sur l'entreprise|Voir toutes les offres de l'entreprise|Offres similaires|D'autres offres peuvent vous intéresser)\b/i.test(
          line
        )
      ) {
        wttjCutoff = i;
        break;
      }
    }
    lines = lines.slice(0, wttjCutoff);
  }

  // General line-by-line filtering of UI clutter
  const uiLinePatterns = [
    // Jina reader headers
    /^Title:\s*/i,
    /^URL Source:\s*/i,
    /^Markdown Content:\s*/i,
    /^Published Time:\s*/i,

    // Navigation and menu items
    /^(Accueil|Home|Menu|Navigation|Skip to main content|Aller au contenu principal)$/i,
    /^(Connexion|Se connecter|Login|Sign in|Sign up|S'inscrire|Mon compte|My account|Espace candidat|Espace recruteur)$/i,
    /^(Jobs|Emplois|Offres d'emploi|Rechercher|Search|Find jobs|Trouver un job|Toutes nos offres|Voir toutes les offres)$/i,
    /^(Companies|Entreprises|Découvrir les entreprises|Nos métiers|Salaires|Événements|Guides|Blog)$/i,
    /^(Back to search results|Retour à la recherche|Retour aux offres|Previous job|Next job|Offre précédente|Offre suivante)$/i,
    /^(Home\s*[>/»]\s*.*(?:Jobs|Careers|Offres).*)/i, // Breadcrumbs

    // LinkedIn-specific noisy UI text
    /^(Sign in to (?:see|view|apply|create)|Join now to|Welcome back|Sign in with (?:Google|Apple)|Email or phone|Forgot password\?|New to LinkedIn\?)/i,
    /^(Agree & Join LinkedIn|By clicking Continue to join or sign in|See who LinkedIn has hired|See recent hiring trends|See connections who work here)/i,
    /^(Be (?:among )?the first \d+ applicants|Over \d+ applicants|\d+ applicants|\d+ candidatures)/i,
    /^(Promoted|Reposted|Sponsorisé|Actively hiring|Recrute activement)$/i,
    /^(Full-time · Mid-Senior level|Temps plein · Niveau intermédiaire|Full-time · Entry level|Full-time · Associate)$/i,
    /^(Show more|Voir plus|Afficher plus|Show less|Voir moins|Afficher moins|Read more|Lire la suite)$/i,

    // Action buttons & CTAs
    /^(Apply now|Postuler|Postuler maintenant|Postuler à cette offre|Easy apply|Candidature simplifiée)$/i,
    /^(Apply with LinkedIn|Postuler avec LinkedIn|Apply with Indeed|Postuler avec Indeed|Apply on company website|Postuler sur le site)$/i,
    /^(Save job|Sauvegarder|Sauvegarder l'offre|Enregistrer|Ajouter aux favoris|Favori|Bookmark)$/i,
    /^(Share|Share this job|Partager|Partager cette offre|Partager sur LinkedIn|Partager par email|Envoyer à un ami)$/i,
    /^(Print|Imprimer|Imprimer l'offre|Download PDF|Télécharger)$/i,
    /^(Report this job|Signaler cette offre|Signaler l'offre|Report job)$/i,
    /^(Create job alert|Créer une alerte|Recevoir des offres similaires|Get job alerts|Email me jobs like this)$/i,
    /^(Upload resume|Déposer votre CV|Joindre un CV|Drop files here|Attach resume)$/i,
    /^(Select a reason|Motif du signalement|Thank you for reporting).*$/i,

    // Social follow bars
    /^(Follow us|Suivez-nous|Rejoignez-nous|Follow \w+ on|Suivre sur|Follow)\s*(:|on)?\s*(LinkedIn|Twitter|Facebook|Instagram|YouTube|X)?$/i,

    // Ratings & Glassdoor / Indeed UI
    /^(⭐|★|\d(\.\d)?\s*\/\s*5|\d+%\s*recommandent|\d+\s*avis|Glassdoor rating|Reviews|Note Glassdoor).*$/i,
    /^(Estimated salary by Indeed|Salaires estimés|Salary estimate).*$/i,

    // Cookie & GDPR notices
    /^(Accept all|Tout accepter|Accept all cookies|Accepter les cookies|Refuse all|Tout refuser|Reject all|Reject non-essential)$/i,
    /^(Manage cookies|Gérer les cookies|Paramétrer les cookies|Cookie preferences|Cookie settings|Privacy settings)$/i,
    /^(This website uses cookies|Ce site utilise des cookies|Nous utilisons des cookies).*$/i,
    /^(En poursuivant votre navigation|By continuing your visit).*$/i,

    // Footers & Copyright
    /^(©|Copyright|\(c\))\s*\d{4}.*$/i,
    /^(All rights reserved|Tous droits réservés|Mentions légales|Legal notice|Terms of service|Conditions d'utilisation|Privacy policy|Politique de confidentialité)$/i,
    /^(Powered by\s+(Greenhouse|Lever|Ashby|Workday|Teamtailor|SmartRecruiters|SmartRecruiters\.com|Oracle|Taleo|iCIMS)).*$/i,

    // Unwanted repetitive list of links (e.g. "* [Jobs](...)")
    /^(\*|\-|\•)\s*(Home|Accueil|Jobs|Emplois|About us|À propos|Contact|Careers|Carrières|Sign In|Log In|Sign Up|Privacy|Terms|Cookies)$/i,
    /^(\*|\-|\•)\s*(LinkedIn|Twitter|Facebook|Instagram|YouTube|Glassdoor|TikTok)$/i
  ];

  // Section markers that signal start of irrelevant forms/surveys at bottom (EEO federal demographic surveys, etc.)
  const surveyStartPatterns = [
    /^(Voluntary Self-Identification of Disability|Disability Status|Demographic Information|Equal Opportunity Employer Survey|Self-Identification)/i,
    /^(Form CC-305|OMB Control Number)/i,
    /^(Veteran Status|U\.S\. Equal Opportunity)/i
  ];

  const cleanedLines = [];
  let inSurveyOrEeo = false;
  let inCookieBanner = false;

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i].trim();
    if (!rawLine) {
      cleanedLines.push('');
      continue;
    }

    // Check if we hit US EEO questionnaire forms
    if (surveyStartPatterns.some((p) => p.test(rawLine))) {
      inSurveyOrEeo = true;
      continue;
    }

    // Check cookie banner block
    if (/^(Cookie Policy|Politique relative aux cookies|Gestion des cookies)/i.test(rawLine)) {
      inCookieBanner = true;
      continue;
    }
    if (inCookieBanner && /(Save preferences|Enregistrer mes préférences|Enregistrer les choix)/i.test(rawLine)) {
      inCookieBanner = false;
      continue;
    }
    if (inCookieBanner) continue;

    // Skip if inside demographic survey block
    if (inSurveyOrEeo) {
      if (/^(About the company|À propos de l'entreprise|Notre entreprise)/i.test(rawLine)) {
        inSurveyOrEeo = false;
      } else {
        continue;
      }
    }

    // Check against individual line UI patterns
    const isUiLine = uiLinePatterns.some((pattern) => pattern.test(rawLine));
    if (isUiLine) {
      continue;
    }

    // Filter lines that are purely separator characters or lone symbols
    if (/^[\-_=*~—–•|#\s]{2,}$/.test(rawLine) && !rawLine.startsWith('# ')) {
      continue;
    }

    // Filter out lone URLs
    if (/^https?:\/\/[^\s]+$/i.test(rawLine)) {
      continue;
    }

    // Normalize bullets (e.g. "• item" -> "- item", "▪ item" -> "- item")
    let formattedLine = rawLine;
    if (/^[•▪▫–—\*+]\s+(.+)$/.test(formattedLine)) {
      formattedLine = formattedLine.replace(/^[•▪▫–—\*+]\s+/, '- ');
    }

    // Normalize standard section titles to Markdown ## Headers for crisp structure
    if (
      /^(Missions|Vos missions|Vos responsabilités|Responsibilities|What you will do|Ce que vous ferez|Role & Responsibilities|Missions principales|Principales missions)[\s:]*$/i.test(
        formattedLine
      )
    ) {
      formattedLine = '## Missions & Responsabilités';
    } else if (
      /^(Profil recherché|Votre profil|Profil|Qualifications|Requirements|What we are looking for|Compétences requises|Exigences du poste|Candidate profile)[\s:]*$/i.test(
        formattedLine
      )
    ) {
      formattedLine = '## Profil recherché & Compétences';
    } else if (
      /^(À propos de nous|À propos de l'entreprise|Notre entreprise|Qui sommes-nous \?|About us|About the company|Company overview)[\s:]*$/i.test(
        formattedLine
      )
    ) {
      formattedLine = "## À propos de l'entreprise";
    } else if (
      /^(Avantages|Ce que nous offrons|Benefits|Perks|Pourquoi nous rejoindre \?|What we offer|Rémunération et avantages)[\s:]*$/i.test(
        formattedLine
      )
    ) {
      formattedLine = '## Avantages & Conditions';
    } else if (
      /^(Processus de recrutement|Recruitment process|Hiring process|Étapes du recrutement|Déroulement des entretiens)[\s:]*$/i.test(
        formattedLine
      )
    ) {
      formattedLine = '## Processus de recrutement';
    }

    cleanedLines.push(formattedLine);
  }

  // Join lines and clean up excessive empty lines
  let result = cleanedLines.join('\n');
  result = result.replace(/(\n\s*){3,}/g, '\n\n');
  result = result.trim();

  return result;
}

/**
 * Clean and format a slug into a readable title (e.g. "software-engineer-frontend" -> "Software Engineer Frontend")
 */
function cleanSlug(slug) {
  if (!slug) return '';
  let cleaned = slug
    .replace(/^([a-f0-9]{8,}|[0-9]{4,})[-_]/i, '')
    .replace(/[-_]([a-f0-9]{8,}|[0-9]{4,})$/i, '')
    .replace(/[-_](paris|london|remote|france|fr|ny|sf|emea|latam)$/i, '')
    .replace(/[-_](cdi|cdd|stage|internship|alternance)$/i, '');

  cleaned = cleaned.replace(/[-_]+/g, ' ').trim();

  // Title case words
  return cleaned
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Detects the application platform/source from URL domain.
 */
export function detectSourceFromUrl(url) {
  if (!url) return 'Site Entreprise';
  const lower = url.toLowerCase();

  if (lower.includes('linkedin.com')) return 'LinkedIn';
  if (lower.includes('welcometothejungle.com') || lower.includes('wttj.co')) return 'Welcome to the Jungle';
  if (lower.includes('greenhouse.io')) return 'Greenhouse';
  if (lower.includes('lever.co')) return 'Lever';
  if (lower.includes('smartrecruiters.com')) return 'SmartRecruiters';
  if (lower.includes('taleo.net') || lower.includes('oraclecloud.com')) return 'Taleo';
  if (lower.includes('teamtailor.com')) return 'Teamtailor';
  if (lower.includes('ashbyhq.com')) return 'Ashby';
  if (lower.includes('indeed.com') || lower.includes('indeed.fr')) return 'Indeed';
  if (lower.includes('francetravail.fr') || lower.includes('pole-emploi.fr')) return 'France Travail';
  if (lower.includes('myworkdayjobs.com') || lower.includes('workday.com')) return 'Workday';

  return 'Site Entreprise';
}

/**
 * Heuristically extracts contract type (CDI, CDD, Stage, Alternance, Freelance, Intérim) from text or URL,
 * including gender-inclusive spellings like Alternant(e), Apprenti(e), Stagiaire(s).
 */
export function detectContractType(text) {
  if (!text) return 'CDI';
  const lower = text.toLowerCase();

  // 1. Stage / Internship (including stagiaire(s), stagiaire·s, stagiaire.s)
  if (
    /\b(stage|stagiaire[s]?|intern|internship[s]?|trainee[s]?|pfe|stage de fin d['’]études|stagiaire\(s\))\b/i.test(
      lower
    )
  ) {
    return 'Stage';
  }

  // 2. Alternance / Apprenticeship (including alternant(e), apprenti(e), alternant·e, etc.)
  if (
    /\b(alternan[ts]?|alternance|alternante?|alternant\(e\)|alternant·e|alternant-e|apprenti[es]?|apprenti\(e\)|apprenti·e|apprentissage|contrat pro|contrat de professionnalisation|work-study)\b/i.test(
      lower
    )
  ) {
    return 'Alternance';
  }

  // 3. Freelance / Contractor (including indépendant(e), freelance, contractor)
  if (
    /\b(freelance|freelancing|contractor|prestation|indépendant[es]?|independante?|indépendant\(e\)|independant\(e\)|portage salarial|b2b contract)\b/i.test(
      lower
    )
  ) {
    return 'Freelance';
  }

  // 4. CDD / Fixed-Term / Interim
  if (
    /\b(cdd|fixed[- ]term|contrat à durée déterminée|contrat a duree determinee|intérim|interim|mission temporaire|travail temporaire)\b/i.test(
      lower
    )
  ) {
    return 'CDD';
  }

  // 5. CDI / Permanent
  if (
    /\b(cdi|contrat à durée indéterminée|contrat a duree indeterminee|permanent contract|full[- ]time|temps plein)\b/i.test(
      lower
    )
  ) {
    return 'CDI';
  }

  return 'CDI';
}

/**
 * Extracts basic hints (company, role, contract) from URL structure alone (instant fallback).
 */
export function extractHintsFromUrl(url) {
  const normalized = normalizeJobUrl(url);
  const result = {
    company: '',
    role: '',
    type: 'CDI',
    source: detectSourceFromUrl(normalized || url),
    url: formatExternalUrl(normalized || url)
  };

  if (!normalized && !url) return result;

  try {
    const formatted = formatExternalUrl(normalized || url);
    const parsedUrl = new URL(formatted);
    const hostname = parsedUrl.hostname.toLowerCase();
    const pathname = parsedUrl.pathname;
    const pathParts = pathname.split('/').filter(Boolean);

    result.type = detectContractType(pathname + ' ' + parsedUrl.search);

    // LinkedIn
    if (hostname.includes('linkedin.com')) {
      const viewIdx = pathParts.indexOf('view');
      if (viewIdx !== -1 && pathParts[viewIdx + 1]) {
        const slug = pathParts[viewIdx + 1];
        if (slug.includes('-at-')) {
          const [rolePart, companyPart] = slug.split('-at-');
          result.role = cleanSlug(rolePart);
          if (companyPart) {
            result.company = cleanSlug(companyPart);
          }
        } else if (!/^\d+$/.test(slug)) {
          result.role = cleanSlug(slug);
        }
      }
    }
    // Welcome to the Jungle
    else if (hostname.includes('welcometothejungle.com')) {
      const compIdx = pathParts.indexOf('companies');
      if (compIdx !== -1 && pathParts[compIdx + 1]) {
        result.company = cleanSlug(pathParts[compIdx + 1]);
      }
      const jobIdx = pathParts.indexOf('jobs');
      if (jobIdx !== -1 && pathParts[jobIdx + 1]) {
        result.role = cleanSlug(pathParts[jobIdx + 1]);
      }
    }
    // Lever
    else if (hostname.includes('lever.co')) {
      if (pathParts[0]) result.company = cleanSlug(pathParts[0]);
      if (pathParts[1]) result.role = cleanSlug(pathParts[1]);
    }
    // Greenhouse
    else if (hostname.includes('greenhouse.io')) {
      if (pathParts[0]) result.company = cleanSlug(pathParts[0]);
      if (pathParts[2]) result.role = cleanSlug(pathParts[2]);
    }
    // SmartRecruiters
    else if (hostname.includes('smartrecruiters.com')) {
      if (pathParts[0]) result.company = cleanSlug(pathParts[0]);
      if (pathParts[1]) result.role = cleanSlug(pathParts[1]);
    }
    // Ashby
    else if (hostname.includes('ashbyhq.com')) {
      if (pathParts[0]) result.company = cleanSlug(pathParts[0]);
      if (pathParts[1]) result.role = cleanSlug(pathParts[1]);
    }
    // Teamtailor
    else if (hostname.includes('teamtailor.com')) {
      const sub = hostname.split('.')[0];
      if (sub && sub !== 'jobs' && sub !== 'www') {
        result.company = cleanSlug(sub);
      }
      const jobIdx = pathParts.indexOf('jobs');
      if (jobIdx !== -1 && pathParts[jobIdx + 1]) {
        result.role = cleanSlug(pathParts[jobIdx + 1]);
      }
    }
    // Workday
    else if (hostname.includes('myworkdayjobs.com')) {
      const sub = hostname.split('.')[0];
      if (sub && sub !== 'www') {
        result.company = cleanSlug(sub);
      }
      const lastPart = pathParts[pathParts.length - 1];
      if (lastPart) result.role = cleanSlug(lastPart);
    }
    // General fallback
    else {
      const domainParts = hostname.replace(/^www\./, '').split('.');
      if (domainParts.length > 0 && domainParts[0] !== 'jobs' && domainParts[0] !== 'careers') {
        result.company = cleanSlug(domainParts[0]);
      }
      const lastPart = pathParts[pathParts.length - 1];
      if (lastPart && lastPart.length > 3) {
        result.role = cleanSlug(lastPart);
      }
    }
  } catch (err) {
    console.warn('URL parsing error:', err);
  }

  return result;
}

/**
 * Cleans extracted job title/role of common noise like "(H/F)", "(M/F/D)", "[CDI]", "| Company", etc.
 */
function cleanJobTitle(title, company = '') {
  if (!title) return '';
  let cleaned = title.trim();

  // Remove markdown headers
  cleaned = cleaned.replace(/^#+\s*/, '');

  // Remove (H/F), (F/H), (M/F/D), (all genders), (w/m/d), etc.
  cleaned = cleaned.replace(
    /\s*\(?(H\/F|F\/H|M\/F|M\/F\/D|W\/M\/D|all genders|all gender|m\/w\/d|f\/m\/d)\)?/gi,
    ''
  );

  // Remove contract badges in title e.g. "(CDI)", "[Stage]", "- CDI", etc.
  cleaned = cleaned.replace(
    /\s*[\(\[\-–—]\s*(CDI|CDD|Stage|Alternance|Freelance|Intérim|Permanent|Full-time|Temps plein)\s*[\)\]]?/gi,
    ''
  );

  // Remove company suffix like " - Datadog", " | Google", " at Mirakl"
  if (company) {
    const compRegex = new RegExp(`\\s*[-|–—•@]\\s*${company}\\b.*$`, 'i');
    cleaned = cleaned.replace(compRegex, '');
    const atRegex = new RegExp(`\\s+at\\s+${company}\\b.*$`, 'i');
    cleaned = cleaned.replace(atRegex, '');
    const chezRegex = new RegExp(`\\s+chez\\s+${company}\\b.*$`, 'i');
    cleaned = cleaned.replace(chezRegex, '');
  }

  // Remove site name suffixes
  cleaned = cleaned.replace(
    /\s*[-|–—•]\s*(Welcome to the Jungle|LinkedIn|Indeed|Glassdoor|Jobteaser|Greenhouse|Lever|SmartRecruiters).*$/gi,
    ''
  );

  // Clean trailing punctuation or spaces
  cleaned = cleaned.replace(/[\s\-_–—|:;,.]+$/, '').trim();

  return cleaned;
}

/**
 * Cleans extracted company name.
 */
function cleanCompanyName(company) {
  if (!company) return '';
  let cleaned = company.trim();
  cleaned = cleaned.replace(/^#+\s*/, '');
  cleaned = cleaned.replace(
    /\s*[-|–—•]\s*(Careers|Jobs|Recrutement|Emploi|Welcome to the Jungle|LinkedIn).*$/gi,
    ''
  );
  cleaned = cleaned.replace(/[\s\-_–—|:;,.]+$/, '').trim();
  return cleaned;
}

/**
 * Heuristic regex extractor that reads the scraped markdown text of a job page.
 */
export function extractDetailsFromMarkdown(text, url) {
  const hints = extractHintsFromUrl(url);
  const result = {
    company: hints.company,
    role: hints.role,
    type: hints.type,
    source: hints.source,
    location: '',
    url: formatExternalUrl(normalizeJobUrl(url) || url)
  };

  if (!text || typeof text !== 'string') return result;

  const lines = text.split('\n').map((l) => l.trim()).filter(Boolean);

  // 1. Detect Contract Type from full text
  result.type = detectContractType(text);

  // 2. Title & Company Detection
  for (let i = 0; i < Math.min(35, lines.length); i++) {
    const line = lines[i];

    // Explicit metadata line: "Title: ..."
    const titleMetaMatch = line.match(/^Title:\s*(.+)$/i);
    if (titleMetaMatch) {
      const fullTitle = titleMetaMatch[1];

      // Pattern A: "Company hiring Role in Location | LinkedIn"
      const hiringMatch = fullTitle.match(/^(.+?)\s+hiring\s+(.+?)\s+in\s+([^|]+)(?:\|\s*LinkedIn)?/i);
      if (hiringMatch) {
        if (!result.company) result.company = cleanCompanyName(hiringMatch[1]);
        if (!result.role) result.role = cleanJobTitle(hiringMatch[2]);
        if (!result.location) result.location = hiringMatch[3].trim();
      } else {
        // Pattern B: "Role at Company | Platform"
        const atMatch = fullTitle.match(/(.+?)\s+(?:at|chez|@|-|–|—)\s+([^|\-]+)/i);
        if (atMatch) {
          if (!result.role) result.role = cleanJobTitle(atMatch[1]);
          if (!result.company) result.company = cleanCompanyName(atMatch[2]);
        } else if (!result.role) {
          result.role = cleanJobTitle(fullTitle);
        }
      }
    }

    const companyMetaMatch = line.match(/^(?:Company|Entreprise|Organization|Employer):\s*(.+)$/i);
    if (companyMetaMatch && !result.company) {
      result.company = cleanCompanyName(companyMetaMatch[1]);
    }

    const locationMetaMatch = line.match(/^(?:Location|Lieu|Ville|Localisation):\s*(.+)$/i);
    if (locationMetaMatch && !result.location) {
      result.location = locationMetaMatch[1].trim();
    }

    // Markdown H1 "# Title"
    if (line.startsWith('# ') && !result.role) {
      const h1Text = line.substring(2).trim();
      if (!/^(accueil|home|menu|connexion|login|jobs|search|postuler|about the job|à propos)/i.test(h1Text)) {
        const atMatch = h1Text.match(/(.+?)\s+(?:at|chez|@|-|–|—)\s+([^|\-]+)/i);
        if (atMatch) {
          result.role = cleanJobTitle(atMatch[1]);
          if (!result.company) result.company = cleanCompanyName(atMatch[2]);
        } else {
          result.role = cleanJobTitle(h1Text);
        }

        // Check if next line contains "Company · Location" (Standard LinkedIn pattern)
        if (lines[i + 1] && lines[i + 1].includes('·')) {
          const parts = lines[i + 1].split('·').map((p) => p.trim());
          if (parts[0] && !result.company) result.company = cleanCompanyName(parts[0]);
          if (parts[1] && !result.location) result.location = parts[1];
        }
      }
    }
  }

  // Detect common French & International cities in location if still empty
  if (!result.location) {
    const locRegex =
      /\b(Paris|Lyon|Marseille|Toulouse|Nantes|Bordeaux|Lille|Strasbourg|Rennes|Montpellier|Nice|Toulon|Grenoble|Aix-en-Provence|Rouen|Île-de-France|London|Berlin|Amsterdam|Madrid|Barcelona|Brussels|Geneva|New York|San Francisco|Remote|Full Remote|Télétravail|Télétravail total|Hybride)\b/i;
    const locMatch = text.match(locRegex);
    if (locMatch) {
      result.location = locMatch[1];
    }
  }

  // Final cleanup
  if (result.role) {
    result.role = cleanJobTitle(result.role, result.company);
  }
  if (result.company) {
    result.company = cleanCompanyName(result.company);
  }

  return result;
}

/**
 * Main extractor function that fetches the job URL via server proxy or client fallback,
 * cleans the description, and applies AI or smart heuristics.
 *
 * Returns { company, role, type, source, location, url, isAiExtracted, jobDescription }
 */
export async function importJobFromUrl(
  rawUrl,
  {
    apiKey = '',
    openAiKey = '',
    anthropicKey = '',
    selectedAiModel = 'gemini',
    customApiUrl = '',
    t = {},
    lang = 'fr'
  } = {}
) {
  const normalizedUrl = normalizeJobUrl(rawUrl);
  const formattedUrl = formatExternalUrl(normalizedUrl || rawUrl);
  if (!formattedUrl) {
    throw new Error(lang === 'en' ? 'Please provide a valid URL' : 'Veuillez saisir une URL valide');
  }

  const initialHints = extractHintsFromUrl(formattedUrl);
  let rawExtractedText = '';

  // 1. Primary Strategy: Call our dedicated server-side proxy
  try {
    const serverRes = await fetch('/api/extract-job-url', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: formattedUrl })
    });
    if (serverRes.ok) {
      const data = await serverRes.json();
      if (data.success && data.rawText && data.rawText.length > 50) {
        rawExtractedText = data.rawText;
      }
    }
  } catch (serverErr) {
    console.warn('Server-side job extractor warning:', serverErr);
  }

  // 2. Secondary Strategy: Direct client-side Jina Reader proxy fallback
  if (!rawExtractedText || rawExtractedText.length < 50) {
    try {
      const proxyUrl = `https://r.jina.ai/${encodeURIComponent(formattedUrl)}`;
      const response = await fetch(proxyUrl, {
        headers: { Accept: 'text/plain' }
      });
      if (response.ok) {
        const body = await response.text();
        if (body && body.length > 50) {
          rawExtractedText = body;
        }
      }
    } catch (clientErr) {
      console.warn('Client Jina fetch warning:', clientErr);
    }
  }

  // Clean and structure the job description
  const cleanedDescription = rawExtractedText ? cleanJobDescription(rawExtractedText, formattedUrl) : '';

  // 3. AI Extraction if API Key is configured and text is available
  const hasAiKey =
    (selectedAiModel === 'gemini' && apiKey && apiKey.trim().length > 5) ||
    (selectedAiModel === 'openai' && openAiKey && openAiKey.trim().length > 5) ||
    (selectedAiModel === 'anthropic' && anthropicKey && anthropicKey.trim().length > 5);

  if (hasAiKey && cleanedDescription && cleanedDescription.length > 60) {
    try {
      const excerpt = cleanedDescription.substring(0, 7500);
      const aiResult = await extractWithAi({
        url: formattedUrl,
        text: excerpt,
        apiKey,
        openAiKey,
        anthropicKey,
        selectedAiModel,
        customApiUrl,
        hints: initialHints
      });

      if (aiResult && (aiResult.company || aiResult.role)) {
        return {
          company: aiResult.company || initialHints.company || '',
          role: aiResult.role || initialHints.role || '',
          type: CONTRACT_KEYS.includes(aiResult.type) ? aiResult.type : initialHints.type || 'CDI',
          source: SOURCE_KEYS.includes(aiResult.source) ? aiResult.source : initialHints.source || 'Site Entreprise',
          location: aiResult.location || '',
          url: formattedUrl,
          jobDescription: cleanedDescription,
          isAiExtracted: true
        };
      }
    } catch (aiErr) {
      console.warn('AI Extraction error, falling back to heuristics:', aiErr);
    }
  }

  // 4. Heuristic Markdown Extraction (0-token offline parsing)
  if (cleanedDescription && cleanedDescription.length > 40) {
    const heuristic = extractDetailsFromMarkdown(cleanedDescription, formattedUrl);
    return {
      company: heuristic.company || initialHints.company || '',
      role: heuristic.role || initialHints.role || '',
      type: heuristic.type || initialHints.type || 'CDI',
      source: heuristic.source || initialHints.source || 'Site Entreprise',
      location: heuristic.location || '',
      url: formattedUrl,
      jobDescription: cleanedDescription,
      isAiExtracted: false
    };
  }

  // 5. Fallback from URL structure
  return {
    ...initialHints,
    jobDescription: cleanedDescription || '',
    isAiExtracted: false
  };
}

/**
 * Helper to call AI models with structured extraction schema.
 */
async function extractWithAi({ url, text, apiKey, openAiKey, anthropicKey, selectedAiModel, customApiUrl = '', hints }) {
  const prompt = `You are an expert recruitment parser. Extract the structured job information from this job posting text and URL.
URL: ${url}
Default Platform Hint: ${hints.source}

TEXT CONTENT:
${text}

Extract and return JSON with these exact fields:
- "company": exact company name (e.g. "Google", "Datadog", "Alan", "Qonto")
- "role": job title / position name (e.g. "Senior Frontend Engineer", "Product Manager", "Développeur Fullstack") - do NOT include company name, (H/F), or contract type in the role.
- "type": MUST be strictly one of ["CDI", "CDD", "Stage", "Alternance", "Freelance", "Intérim"]. (Choose Stage if internship, Alternance if apprenticeship/work-study, CDI if permanent/full-time).
- "source": platform where this job is posted, strictly one of ["Workday", "LinkedIn", "Welcome to the Jungle", "Greenhouse", "Lever", "SmartRecruiters", "Taleo", "Teamtailor", "Ashby", "Indeed", "France Travail", "Site Entreprise", "Autre"]
- "location": location if mentioned (e.g. "Paris, France", "Remote", etc.)

Return ONLY valid JSON.`;

  const responseSchema = {
    type: 'OBJECT',
    properties: {
      company: { type: 'STRING' },
      role: { type: 'STRING' },
      type: { type: 'STRING', enum: ['CDI', 'CDD', 'Stage', 'Alternance', 'Freelance', 'Intérim'] },
      source: {
        type: 'STRING',
        enum: [
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
          'Autre'
        ]
      },
      location: { type: 'STRING' }
    },
    required: ['company', 'role', 'type', 'source']
  };

  if (selectedAiModel === 'gemini') {
    let endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
    if (customApiUrl && customApiUrl.trim()) {
      const cleanCustom = customApiUrl.trim().replace(/\/+$/, '');
      if (cleanCustom.includes(':generateContent')) {
        endpoint = `${cleanCustom}${cleanCustom.includes('?') ? '&' : '?'}key=${apiKey}`;
      } else {
        endpoint = `${cleanCustom}/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
      }
    }

    const res = await fetch(
      endpoint,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            responseMimeType: 'application/json',
            responseSchema: responseSchema,
            temperature: 0.1
          }
        })
      }
    );

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error?.message || 'Gemini API Error');
    }

    const data = await res.json();
    const candidateText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (candidateText) {
      return JSON.parse(candidateText);
    }
  } else if (selectedAiModel === 'openai') {
    let endpoint = 'https://api.openai.com/v1/chat/completions';
    if (customApiUrl && customApiUrl.trim()) {
      const cleanCustom = customApiUrl.trim().replace(/\/+$/, '');
      if (cleanCustom.endsWith('/chat/completions')) {
        endpoint = cleanCustom;
      } else if (cleanCustom.endsWith('/v1')) {
        endpoint = `${cleanCustom}/chat/completions`;
      } else {
        endpoint = `${cleanCustom}/v1/chat/completions`;
      }
    }

    const res = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${openAiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        response_format: { type: 'json_object' },
        temperature: 0.1
      })
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error?.message || 'OpenAI API Error');
    }

    const data = await res.json();
    const content = data.choices?.[0]?.message?.content;
    if (content) {
      return JSON.parse(content);
    }
  } else if (selectedAiModel === 'anthropic') {
    let endpoint = 'https://api.anthropic.com/v1/messages';
    if (customApiUrl && customApiUrl.trim()) {
      const cleanCustom = customApiUrl.trim().replace(/\/+$/, '');
      if (cleanCustom.endsWith('/messages')) {
        endpoint = cleanCustom;
      } else if (cleanCustom.endsWith('/v1')) {
        endpoint = `${cleanCustom}/messages`;
      } else {
        endpoint = `${cleanCustom}/v1/messages`;
      }
    }

    const res = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': anthropicKey,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true'
      },
      body: JSON.stringify({
        model: 'claude-3-5-haiku-20241022',
        max_tokens: 1024,
        messages: [{ role: 'user', content: prompt + '\nRespond ONLY with valid JSON.' }],
        temperature: 0.1
      })
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error?.message || 'Claude API Error');
    }

    const data = await res.json();
    const content = data.content?.[0]?.text;
    if (content) {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) return JSON.parse(jsonMatch[0]);
    }
  }

  return null;
}
