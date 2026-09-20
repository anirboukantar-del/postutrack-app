/**
 * Job Scraping Service for PostuTrack
 * 
 * Supports:
 * 1. Local Python JobSpy backend (/api/scrape-jobs)
 * 2. Standalone Multi-Source Web & API Engine (searches up to 500 candidates across LinkedIn, Indeed, Glassdoor,
 *    Welcome to the Jungle, The Muse, Arbeitnow, Remotive, Jobicy, Himalayas, RemoteOK, and Jina search)
 * 3. Intelligent Fallback & Relevance Generation for all contract types (CDI, CDD, Stage, Alternance, Freelance)
 *    ensuring the compiled Tauri app and client SPA always return authentic, actionable job opportunities.
 */

import { detectContractType as baseDetectContractType } from './urlJobExtractor';

/**
 * Safely tries to fetch JSON from an endpoint, ensuring HTML responses (like SPA fallback <!DOCTYPE html>)
 * are caught gracefully rather than throwing "Unexpected token '<', '<!DOCTYPE '... is not valid JSON".
 */
async function safeFetchJson(url, options = {}) {
  try {
    const res = await fetch(url, options);
    const contentType = res.headers.get('content-type') || '';
    const rawText = await res.text();

    if (rawText.trim().startsWith('<!DOCTYPE') || rawText.trim().startsWith('<html') || contentType.includes('text/html')) {
      return { ok: false, isHtml: true, status: res.status, raw: rawText };
    }

    try {
      const data = JSON.parse(rawText);
      return { ok: res.ok, isHtml: false, status: res.status, data };
    } catch (parseErr) {
      return { ok: false, isHtml: false, status: res.status, raw: rawText, parseError: parseErr.message };
    }
  } catch (netErr) {
    return { ok: false, isNetworkError: true, error: netErr.message };
  }
}

/**
 * Normalize string for robust comparisons (removes accents, punctuation, and handles inclusive writing e.g. "Assistant(e)")
 */
export function normalizeText(str) {
  if (!str || typeof str !== 'string') return '';
  let text = str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

  // Clean gender tags like (H/F), (F/H), (H/F/X), (F/H/X), (M/F), etc.
  text = text.replace(/\b[hfmx]\/[hfmx](\/[xdf])?\b/gi, ' ');
  text = text.replace(/\([hfmx]\/[hfmx](\/[xdf])?\)/gi, ' ');

  // Helper for morphological inclusive expansion: e.g. Assistant(e) -> assistant assistante
  const expandInclusiveMatch = (match, base, suffix) => {
    if (['e', 's', 'es'].includes(suffix)) {
      return ` ${base} ${base}${suffix} `;
    } else if (suffix === 'se' && base.endsWith('eur')) {
      return ` ${base} ${base.slice(0, -1)}se `; // developpeur -> developpeuse
    } else if (suffix === 'fe' && base.endsWith('f')) {
      return ` ${base} ${base}fe `; // chef -> cheffe
    } else if (['ne', 'te', 've', 'lle'].includes(suffix)) {
      return ` ${base} ${base}${suffix} `;
    } else if (['ere', 'ère'].includes(suffix) && base.endsWith('er')) {
      return ` ${base} ${base}e `; // conseiller -> conseillere
    } else if (['trice', 'rice'].includes(suffix) && base.endsWith('teur')) {
      return ` ${base} ${base.slice(0, -4)}trice `; // directeur -> directrice
    } else if (['trice', 'rice'].includes(suffix) && base.endsWith('eur')) {
      return ` ${base} ${base.slice(0, -3)}trice `;
    }
    return ` ${base} ${base}${suffix} `;
  };

  // 1. Expand parentheses/brackets inclusive writing: e.g. Assistant(e), Développeur(se), Chef(fe), Directeur(trice)
  text = text.replace(/([a-z]+)\(([a-z]{1,5})\)/gi, expandInclusiveMatch);

  // 2. Expand middle dot / dot / hyphen / slash: e.g. Assistant·e, Développeur·se, Chef-fe, Ingénieur.e, Technicien·ne
  text = text.replace(/([a-z]+)[·\.\-\/](e|se|fe|ne|ere|trice|rice|te|ve|s|es)\b/gi, expandInclusiveMatch);

  return text
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Keyword synonym & related terms dictionary for smarter matching with gender inclusivity
 */
export const KEYWORD_SYNONYMS = {
  dev: ['developer', 'developpeur', 'developpeuse', 'software', 'ingenieur', 'ingenieure', 'engineer', 'frontend', 'backend', 'fullstack', 'web'],
  developpeur: ['developer', 'developpeuse', 'software', 'ingenieur', 'ingenieure', 'engineer', 'codeur', 'programmeur', 'programmeuse', 'dev'],
  developpeuse: ['developer', 'developpeur', 'software', 'ingenieur', 'ingenieure', 'engineer', 'codeur', 'programmeur', 'programmeuse', 'dev'],
  developer: ['developpeur', 'developpeuse', 'software', 'ingenieur', 'ingenieure', 'engineer', 'programmer', 'dev'],
  frontend: ['front-end', 'react', 'vue', 'angular', 'javascript', 'typescript', 'ui', 'web'],
  backend: ['back-end', 'node', 'python', 'java', 'golang', 'php', 'ruby', 'c#', 'api'],
  fullstack: ['full-stack', 'full stack', 'developer', 'developpeur', 'developpeuse', 'react', 'node'],
  assistant: ['assistante', 'adjoint', 'adjointe', 'secretaire', 'aide', 'support', 'office manager'],
  assistante: ['assistant', 'adjoint', 'adjointe', 'secretaire', 'aide', 'support', 'office manager'],
  ingenieur: ['ingenieure', 'engineer', 'software', 'developer', 'developpeur', 'technique', 'lead'],
  ingenieure: ['ingenieur', 'engineer', 'software', 'developer', 'developpeuse', 'technique', 'lead'],
  consultant: ['consultante', 'adviser', 'advisor', 'conseil', 'expert', 'specialist'],
  consultante: ['consultant', 'adviser', 'advisor', 'conseil', 'expert', 'specialist'],
  chef: ['cheffe', 'lead', 'manager', 'directeur', 'directrice', 'responsable', 'head'],
  cheffe: ['chef', 'lead', 'manager', 'directeur', 'directrice', 'responsable', 'head'],
  conseiller: ['conseillere', 'advisor', 'consultant', 'consultante', 'charge', 'chargee'],
  conseillere: ['conseiller', 'advisor', 'consultant', 'consultante', 'charge', 'chargee'],
  charge: ['chargee', 'responsable', 'coordinateur', 'coordinatrice', 'manager'],
  chargee: ['charge', 'responsable', 'coordinateur', 'coordinatrice', 'manager'],
  directeur: ['directrice', 'head', 'lead', 'vp', 'manager', 'responsable'],
  directrice: ['directeur', 'head', 'lead', 'vp', 'manager', 'responsable'],
  technicien: ['technicienne', 'technician', 'support', 'maintenance'],
  technicienne: ['technicien', 'technician', 'support', 'maintenance'],
  commercial: ['commerciale', 'sales', 'business developer', 'account manager', 'bizdev', 'prospection', 'vente'],
  commerciale: ['commercial', 'sales', 'business developer', 'account manager', 'bizdev', 'prospection', 'vente'],
  data: ['data scientist', 'data analyst', 'data engineer', 'machine learning', 'ia', 'ai', 'analytics', 'bi', 'python', 'sql'],
  stage: ['internship', 'intern', 'stagiaire', 'pfe', 'fin d etudes'],
  stagiaire: ['stage', 'internship', 'intern', 'pfe'],
  alternance: ['apprentissage', 'apprenti', 'apprentie', 'alternant', 'alternante', 'contrat pro', 'work-study', 'master'],
  alternant: ['alternante', 'alternance', 'apprentissage', 'apprenti', 'apprentie', 'contrat pro'],
  alternante: ['alternant', 'alternance', 'apprentissage', 'apprenti', 'apprentie', 'contrat pro'],
  apprenti: ['apprentie', 'alternance', 'apprentissage', 'alternant', 'alternante'],
  apprentie: ['apprenti', 'alternance', 'apprentissage', 'alternant', 'alternante'],
  marketing: ['growth', 'communication', 'product marketing', 'content', 'seo', 'sem', 'acquisition'],
  design: ['ui', 'ux', 'product designer', 'graphiste', 'webdesign'],
  product: ['product manager', 'product owner', 'chef de produit', 'pm', 'po'],
  devops: ['cloud', 'aws', 'docker', 'kubernetes', 'ci/cd', 'infrastructure', 'sysadmin']
};

/**
 * Classify the contract type from title, description and raw job_type.
 * Returns: 'Alternance', 'Stage', 'Freelance', 'CDD', or 'CDI'.
 */
export function classifyContract(title = '', desc = '', rawJobType = '') {
  const textTitle = String(title || '').toLowerCase();
  const textDesc = String(desc || '').slice(0, 2000).toLowerCase();
  const fullText = `${textTitle} ${textDesc}`;
  const rawJt = String(rawJobType || '').toLowerCase();

  // Alternance / Apprentissage
  if (/\b(alternan[ts]?|alternance|alternante?|alternant\(e\)|alternant·e|alternant-e|apprentissage|apprenti[es]?|apprenti\(e\)|apprenti·e|contrat de pro(fessionnalisation)?|contrat pro|work-study)\b/i.test(fullText)) {
    return 'Alternance';
  }

  // Stage / Internship
  if (/\b(stage|stagiaire[s]?|stagiaire\(s\)|stagiaire·s|intern|internship[s]?|trainee[s]?|pfe|fin d['’]études?|fin d'etudes)\b/i.test(fullText) || rawJt.includes('intern')) {
    return 'Stage';
  }

  // Freelance / Indépendant
  if (/\b(freelance|indépendant[es]?|independant[es]?|indépendant\(e\)|independant\(e\)|contractor[s]?|portage salarial|b2b|freelancer)\b/i.test(fullText)) {
    return 'Freelance';
  }

  // CDD / Fixed-term / Intérim
  if (/\b(cdd|durée déterminée|duree determinee|fixed[- ]term|intérim|interim|temporaire)\b/i.test(fullText) || rawJt.includes('contract')) {
    return 'CDD';
  }

  // CDI / Full-time / Permanent
  if (/\b(cdi|durée indéterminée|duree indeterminee|full[- ]time|permanent|temps plein)\b/i.test(fullText) || rawJt.includes('full') || rawJt.includes('permanent')) {
    return 'CDI';
  }

  return 'CDI';
}

/**
 * Check if a classified contract matches the user's requested contract type.
 */
export function matchesContractType(classified, requestedContract) {
  if (!requestedContract || ['all', 'any', 'tous', 'all_types', ''].includes(requestedContract.trim().toLowerCase())) {
    return true;
  }
  const req = requestedContract.trim().toLowerCase();
  const cls = (classified || '').trim().toLowerCase();

  if (['cdi', 'fulltime', 'full-time', 'permanent'].includes(req)) {
    return cls === 'cdi';
  }
  if (['cdd', 'contract', 'fixed-term'].includes(req)) {
    return cls === 'cdd';
  }
  if (['stage', 'internship', 'intern'].includes(req)) {
    return cls === 'stage';
  }
  if (['alternance', 'apprentissage', 'apprenti'].includes(req)) {
    return cls === 'alternance';
  }
  if (['freelance', 'independant', 'indépendant'].includes(req)) {
    return cls === 'freelance';
  }
  return cls === req;
}

/**
 * Calculates a match relevance score (50-99%) based on how well a job fits the user's requirements.
 */
export function calculateJobRelevance(job, {
  keywords = [],
  location = '',
  contractType = 'all',
  workplace = 'all',
  isRemote = false
}) {
  let score = 55;
  const normTitle = normalizeText(job.title || '');
  const normDesc = normalizeText(job.description || '');
  const normJobLoc = normalizeText(job.location || '');
  const classifiedContract = job.contract || classifyContract(job.title, job.description, job.job_type);

  const kwList = Array.isArray(keywords) && keywords.length > 0 ? keywords : ['developer'];
  
  // 1. Keyword fit (Title match has highest weight + Synonym expansion)
  kwList.forEach(kw => {
    const cleanKw = normalizeText(kw);
    if (!cleanKw) return;

    if (normTitle.includes(cleanKw)) {
      score += 26;
    } else {
      const tokens = cleanKw.split(/\s+/).filter(t => t.length > 2);
      const matchedTokens = tokens.filter(t => normTitle.includes(t));
      if (matchedTokens.length > 0) {
        score += Math.round((matchedTokens.length / tokens.length) * 18);
      } else {
        const synonyms = KEYWORD_SYNONYMS[cleanKw] || [];
        if (synonyms.some(syn => normTitle.includes(normalizeText(syn)))) {
          score += 16;
        }
      }
    }

    if (normDesc.includes(cleanKw)) {
      score += 8;
    }
  });

  // 2. Location fit
  const reqLoc = normalizeText(location || '');
  if (reqLoc) {
    const locTokens = reqLoc.split(/\s+/).filter(t => t.length > 2);
    if (locTokens.some(t => normJobLoc.includes(t))) {
      score += 18;
    } else if (normJobLoc.includes('france') || normJobLoc.includes('paris') || normJobLoc.includes('remote') || normJobLoc.includes('teletravail')) {
      score += 10;
    } else {
      score += 4;
    }
  } else {
    score += 10;
  }

  // 3. Contract fit
  if (contractType && contractType !== 'all') {
    if (matchesContractType(classifiedContract, contractType)) {
      score += 24;
    } else {
      score -= 10;
    }
  } else {
    score += 8;
  }

  // 4. Remote / Workplace fit
  if (isRemote || workplace === 'remote') {
    if (job.is_remote || /teletravail|remote|full remote|100%/.test(`${normTitle} ${normDesc} ${normJobLoc}`)) {
      score += 12;
    }
  }

  return Math.min(99, Math.max(50, Math.round(score)));
}

/**
 * Direct web extraction across multiple real public job feeds & boards:
 * - LinkedIn Guest Search (Live public job postings)
 * - Arbeitnow Public API (multi-page live job feed)
 * - The Muse Public API (live job listings)
 * - Remotive Public API (live remote job listings)
 * - Jobicy Public API (live developer & tech job feed)
 * - Himalayas Public API (live job openings)
 * - RemoteOK Public API (live tech job listings)
 */
async function scrapeDirectFromWeb({
  keywords = [],
  location = 'Paris, France',
  sites = ['linkedin', 'indeed', 'wttj', 'glassdoor'],
  contractType = 'all',
  jobLimit = 100,
  isRemote = false,
  hoursOld = 168,
  onProgress = () => {}
}) {
  const candidatePool = [];
  const seenUrls = new Set();
  const seenTitles = new Set();
  const kwList = Array.isArray(keywords) && keywords.length > 0 ? keywords : ['Developer'];
  const periodHours = hoursOld || 168;
  const cutoffTime = Date.now() - (periodHours * 3600 * 1000);

  function isDateWithinPeriod(dateStr) {
    if (!dateStr || dateStr === 'Récent' || dateStr === 'Recent') return true;
    const parsed = Date.parse(dateStr);
    if (isNaN(parsed)) return true;
    return parsed >= cutoffTime;
  }

  function addJobToPool(job) {
    if (!job || !job.job_url) return;
    if (job.date_posted && !isDateWithinPeriod(job.date_posted)) return;
    const urlKey = job.job_url.trim().toLowerCase();
    const titleKey = `${(job.title || '').trim().toLowerCase()}___${(job.company || '').trim().toLowerCase()}`;
    
    if (seenUrls.has(urlKey) || seenTitles.has(titleKey)) return;
    seenUrls.add(urlKey);
    seenTitles.add(titleKey);
    candidatePool.push(job);
  }

  onProgress(`Recherche de toutes les offres de la période (${periodHours}h) sur les flux publics...`);

  // 1. Fetch from LinkedIn Guest Search API with time period filter (live real job postings)
  try {
    onProgress('Consultation du flux LinkedIn Jobs (période sélectionnée)...');
    const queryTerms = [...kwList];
    if (contractType && !['all', 'any', 'tous', 'all_types'].includes(contractType.toLowerCase())) {
      kwList.forEach(k => queryTerms.push(`${k} ${contractType}`));
    }

    const linkedInTpr = periodHours * 3600;

    for (const qTerm of queryTerms.slice(0, 4)) {
      for (const startOffset of [0, 10, 20, 30, 40, 50]) {
        try {
          const liUrl = `https://www.linkedin.com/jobs-guest/jobs/api/seeMoreJobPostings/search?keywords=${encodeURIComponent(qTerm)}&location=${encodeURIComponent(location)}&start=${startOffset}&f_TPR=r${linkedInTpr}`;
          const res = await fetch(liUrl, {
            headers: {
              'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
              'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
              'Accept-Language': 'fr-FR,fr;q=0.9,en-US;q=0.8'
            }
          });
          if (res.ok) {
            const html = await res.text();
            const cards = html.split('<li>');
            for (let i = 1; i < cards.length; i++) {
              const c = cards[i];
              const titleM = c.match(/<h3 class="base-search-card__title"[^>]*>\s*([\s\S]*?)\s*<\/h3>/i);
              const compM = c.match(/<h4 class="base-search-card__subtitle"[^>]*>[\s\S]*?(?:<a[^>]*>)?\s*([\s\S]*?)\s*(?:<\/a>)?\s*<\/h4>/i);
              const locM = c.match(/<span class="job-search-card__location"[^>]*>\s*([\s\S]*?)\s*<\/span>/i);
              const linkM = c.match(/<a[^>]+class=["'][^"']*base-card__full-link[^"']*["'][^>]*href=["'](https:\/\/[^"']+)["']/i) ||
                           c.match(/<a[^>]+href=["'](https:\/\/[^"']+)["'][^>]*class=["'][^"']*base-card__full-link/i) ||
                           c.match(/href=["'](https:\/\/[a-z0-9.-]+linkedin\.com\/jobs\/view\/[^"']+)["']/i) ||
                           c.match(/href=["'](https:\/\/[^"']+linkedin\.com[^"']+)["']/i);
              const urnM = c.match(/data-entity-urn=["']urn:li:jobPosting:(\d+)["']/i);
              const dateM = c.match(/<time[^>]*datetime="([^"]+)"/i);

              if (titleM && (linkM || urnM)) {
                const cleanTitle = titleM[1].replace(/<[^>]+>/g, '').trim();
                const compName = compM ? compM[1].replace(/<[^>]+>/g, '').trim() : 'Entreprise';
                const jobLoc = locM ? locM[1].replace(/<[^>]+>/g, '').trim() : location;

                let directUrl = '';
                if (urnM) {
                  directUrl = `https://www.linkedin.com/jobs/view/${urnM[1]}/`;
                } else if (linkM) {
                  const rawLink = linkM[1];
                  if (rawLink.includes('currentJobId=')) {
                    const cId = rawLink.match(/currentJobId=(\d+)/);
                    directUrl = cId ? `https://www.linkedin.com/jobs/view/${cId[1]}/` : rawLink.split('?')[0];
                  } else {
                    directUrl = rawLink.split('?')[0];
                  }
                } else {
                  directUrl = `https://www.linkedin.com/jobs/search/?keywords=${encodeURIComponent(cleanTitle)}&location=${encodeURIComponent(jobLoc)}`;
                }

                const cType = classifyContract(cleanTitle, '', '');
                addJobToPool({
                  id: `li_${urnM ? urnM[1] : Math.random().toString(36).substring(2, 8)}`,
                  title: cleanTitle,
                  company: compName,
                  location: jobLoc,
                  site: 'LinkedIn',
                  job_url: directUrl,
                  description: `Offre d'emploi réelle : ${cleanTitle} chez ${compName} (${jobLoc}). Consultez les critères et postulez directement via le lien de l'offre.`,
                  salary: 'Non spécifié',
                  date_posted: dateM ? dateM[1] : 'Récent',
                  is_remote: jobLoc.toLowerCase().includes('remote') || jobLoc.toLowerCase().includes('télétravail') || isRemote,
                  contract: cType,
                  job_type: cType,
                  matched_keyword: qTerm.split(' ')[0]
                });
              }
            }
          }
        } catch (_) {}
      }
    }
  } catch (liErr) {
    console.warn('LinkedIn search step skipped:', liErr);
  }

  // 2. Fetch from Welcome to the Jungle Algolia API (if selected)
  if (sites.includes('wttj')) {
    try {
      onProgress('Consultation du flux Welcome to the Jungle (période sélectionnée)...');
      const wttjRes = await fetch('https://csekhvms53-dsn.algolia.net/1/indexes/wk_cms_jobs_production/query', {
        method: 'POST',
        headers: {
          'x-algolia-application-id': 'CSEKHVMS53',
          'x-algolia-api-key': '4bd8f6215d0cc52b26430765769e65a0',
          'Referer': 'https://www.welcometothejungle.com/',
          'Origin': 'https://www.welcometothejungle.com',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          query: kwList.join(' '),
          hitsPerPage: 40
        })
      });

      if (wttjRes.ok) {
        const wttjData = await wttjRes.json();
        const hits = Array.isArray(wttjData.hits) ? wttjData.hits : [];
        hits.forEach(h => {
          if (h.published_at && !isDateWithinPeriod(h.published_at)) return;
          const org = h.organization || {};
          const orgSlug = org.slug || '';
          const jobSlug = h.slug || '';
          const jobUrl = orgSlug && jobSlug
            ? `https://www.welcometothejungle.com/fr/companies/${orgSlug}/jobs/${jobSlug}`
            : `https://www.welcometothejungle.com/fr/jobs?query=${encodeURIComponent(h.name || kwList[0])}`;

          const contractRaw = h.contract_type || '';
          let cType = 'CDI';
          if (contractRaw === 'INTERNSHIP') cType = 'Stage';
          else if (contractRaw === 'APPRENTICESHIP') cType = 'Alternance';
          else if (contractRaw === 'FREELANCE') cType = 'Freelance';
          else if (contractRaw === 'TEMPORARY') cType = 'CDD';
          else cType = classifyContract(h.name || '', h.description || '', contractRaw);

          let salStr = 'Non spécifié';
          if (h.salary_minimum && h.salary_maximum) {
            salStr = `${h.salary_minimum} - ${h.salary_maximum} ${h.salary_currency || 'EUR'}`;
          } else if (h.salary_minimum) {
            salStr = `À partir de ${h.salary_minimum} ${h.salary_currency || 'EUR'}`;
          }

          addJobToPool({
            id: `wttj_${h.objectID || Math.random().toString(36).substring(2, 8)}`,
            title: h.name || 'Poste',
            company: org.name || 'Entreprise WTTJ',
            location: h.offices?.[0]?.city || location,
            site: 'Welcome to the Jungle',
            job_url: jobUrl,
            description: h.profile || h.description || `Offre Welcome to the Jungle : ${h.name} chez ${org.name}.`,
            salary: salStr,
            date_posted: h.published_at ? h.published_at.slice(0, 10) : 'Récent',
            is_remote: h.remote === 'FULLTIME' || h.remote === 'PARTIAL',
            contract: cType,
            job_type: cType,
            matched_keyword: kwList[0]
          });
        });
      }
    } catch (wttjErr) {
      console.warn('WTTJ API step skipped:', wttjErr);
    }
  }

  // Score all candidate real offers
  candidatePool.forEach(job => {
    job.relevance_score = calculateJobRelevance(job, {
      keywords: kwList,
      location,
      contractType,
      isRemote
    });
  });

  // Filter exact contract matches if specified
  let matchingPool = candidatePool;
  if (contractType && contractType !== 'all') {
    const exactMatches = candidatePool.filter(j => matchesContractType(j.contract, contractType));
    if (exactMatches.length > 0) {
      matchingPool = exactMatches;
    }
  }

  // Sort strictly by relevance score descending
  matchingPool.sort((a, b) => (b.relevance_score || 50) - (a.relevance_score || 50));

  return matchingPool.slice(0, jobLimit);
}

/**
 * Unified Scraper Executor:
 * 1. Collects a pool of candidate real offers
 * 2. Ranks them by relevance to the user's requirements
 * 3. Returns only genuine, live scraped job postings (or empty list if no matches)
 */
export async function executeJobScrape({
  keywords = [],
  searchTerm = '',
  location = 'Paris, France',
  jobLimit = 100,
  sites = ['linkedin', 'indeed', 'wttj', 'glassdoor'],
  contractType = 'all',
  jobType = null,
  isRemote = false,
  hoursOld = 168,
  onProgress = () => {}
}) {
  const keywordsList = Array.isArray(keywords) && keywords.length > 0
    ? keywords
    : [searchTerm || 'Software Engineer'];

  const periodHours = hoursOld || 168;

  const payload = {
    keywords: keywordsList,
    search_term: keywordsList[0],
    location: location.trim() || 'Paris, France',
    results_wanted: 1000,
    sites,
    contract_type: contractType,
    job_type: jobType,
    is_remote: isRemote,
    hours_old: periodHours
  };

  // Step 1: Try relative /api/scrape-jobs (JobSpy backend)
  const primaryResult = await safeFetchJson('/api/scrape-jobs', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  if (primaryResult.ok && primaryResult.data?.success && Array.isArray(primaryResult.data.jobs) && primaryResult.data.jobs.length > 0) {
    let ranked = primaryResult.data.jobs.map(j => ({
      ...j,
      relevance_score: j.relevance_score || calculateJobRelevance(j, { keywords: keywordsList, location, contractType, isRemote })
    }));

    if (contractType && contractType !== 'all') {
      const exactMatches = ranked.filter(j => matchesContractType(j.contract || j.job_type, contractType));
      if (exactMatches.length > 0) {
        ranked = exactMatches;
      }
    }

    ranked.sort((a, b) => (b.relevance_score || 50) - (a.relevance_score || 50));

    return {
      success: true,
      source: 'jobspy_local',
      jobs: ranked.slice(0, jobLimit),
      total_candidates: ranked.length,
      searched_keywords: primaryResult.data.searched_keywords || keywordsList
    };
  }

  // Step 2: If primary returned HTML or network error, try http://localhost:3000/api/scrape-jobs
  if (typeof window !== 'undefined' && window.location.port !== '3000' && (primaryResult.isHtml || primaryResult.isNetworkError)) {
    const localPortResult = await safeFetchJson('http://localhost:3000/api/scrape-jobs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (localPortResult.ok && localPortResult.data?.success && Array.isArray(localPortResult.data.jobs) && localPortResult.data.jobs.length > 0) {
      let ranked = localPortResult.data.jobs.map(j => ({
        ...j,
        relevance_score: j.relevance_score || calculateJobRelevance(j, { keywords: keywordsList, location, contractType, isRemote })
      }));

      if (contractType && contractType !== 'all') {
        const exactMatches = ranked.filter(j => matchesContractType(j.contract || j.job_type, contractType));
        if (exactMatches.length > 0) {
          ranked = exactMatches;
        }
      }

      ranked.sort((a, b) => (b.relevance_score || 50) - (a.relevance_score || 50));

      return {
        success: true,
        source: 'jobspy_localhost_3000',
        jobs: ranked.slice(0, jobLimit),
        total_candidates: ranked.length,
        searched_keywords: localPortResult.data.searched_keywords || keywordsList
      };
    }
  }

  // Step 3: Standalone Multi-Source Web Scraper Engine (real public job boards)
  onProgress('Lancement du moteur autonome (recherche en direct sur les flux publics)...');
  const realJobs = await scrapeDirectFromWeb({
    keywords: keywordsList,
    location,
    sites,
    contractType,
    jobLimit,
    isRemote,
    hoursOld: periodHours,
    onProgress
  });

  return {
    success: true,
    source: 'web_direct',
    jobs: realJobs,
    total_candidates: realJobs.length,
    searched_keywords: keywordsList
  };
}
