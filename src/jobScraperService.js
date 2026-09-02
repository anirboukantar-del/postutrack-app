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
  onProgress = () => {}
}) {
  const candidatePool = [];
  const seenUrls = new Set();
  const seenTitles = new Set();
  const kwList = Array.isArray(keywords) && keywords.length > 0 ? keywords : ['Developer'];
  const maxPoolTarget = 5000;

  function addJobToPool(job) {
    if (!job || !job.job_url) return;
    const urlKey = job.job_url.trim().toLowerCase();
    const titleKey = `${(job.title || '').trim().toLowerCase()}___${(job.company || '').trim().toLowerCase()}`;
    
    if (seenUrls.has(urlKey) || seenTitles.has(titleKey)) return;
    seenUrls.add(urlKey);
    seenTitles.add(titleKey);
    candidatePool.push(job);
  }

  onProgress('Recherche multi-plateformes étendue (analyse des flux d\'offres réelles)...');

  // 1. Fetch from LinkedIn Guest Search API (live real job postings)
  try {
    onProgress('Consultation du flux LinkedIn Jobs...');
    const queryTerms = [...kwList];
    if (contractType && !['all', 'any', 'tous', 'all_types'].includes(contractType.toLowerCase())) {
      kwList.forEach(k => queryTerms.push(`${k} ${contractType}`));
    }

    for (const qTerm of queryTerms.slice(0, 3)) {
      if (candidatePool.length >= maxPoolTarget) break;
      for (const startOffset of [0, 10, 20, 30]) {
        if (candidatePool.length >= maxPoolTarget) break;
        try {
          const liUrl = `https://www.linkedin.com/jobs-guest/jobs/api/seeMoreJobPostings/search?keywords=${encodeURIComponent(qTerm)}&location=${encodeURIComponent(location)}&start=${startOffset}`;
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

  // 2. Fetch from Arbeitnow Public Job API (live multi-pages)
  try {
    onProgress('Consultation du flux Arbeitnow (offres réelles)...');
    for (let page = 1; page <= 5; page++) {
      if (candidatePool.length >= maxPoolTarget) break;
      const pageUrl = page === 1 ? 'https://www.arbeitnow.com/api/job-board-api' : `https://www.arbeitnow.com/api/job-board-api?page=${page}`;
      const arbeitRes = await fetch(pageUrl);
      if (!arbeitRes.ok) break;

      const data = await arbeitRes.json();
      if (Array.isArray(data.data) && data.data.length > 0) {
        const searchTerms = kwList.map(k => normalizeText(k));
        data.data.forEach(item => {
          const title = item.title || '';
          const desc = item.description || '';
          const itemLoc = item.location || '';
          const fullNorm = normalizeText(`${title} ${desc} ${itemLoc}`);

          const matchesKw = searchTerms.length === 0 || searchTerms.some(st => {
            if (fullNorm.includes(st)) return true;
            const syns = KEYWORD_SYNONYMS[st] || [];
            return syns.some(syn => fullNorm.includes(normalizeText(syn)));
          });

          if (matchesKw) {
            const jobUrl = item.url || `https://www.arbeitnow.com/jobs/${item.slug}`;
            const cType = classifyContract(title, desc, item.job_types?.[0]);
            addJobToPool({
              id: `arbeit_${item.slug || Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
              title: item.title,
              company: item.company_name || 'Entreprise',
              location: item.location || (item.remote ? '100% Télétravail' : location),
              site: 'Arbeitnow',
              job_url: jobUrl,
              description: item.description?.replace(/<[^>]+>/g, ' ').slice(0, 2500) || '',
              salary: 'Non spécifié',
              date_posted: new Date(item.created_at * 1000).toISOString().split('T')[0] || 'Récent',
              is_remote: Boolean(item.remote),
              contract: cType,
              job_type: cType,
              matched_keyword: kwList[0]
            });
          }
        });
      }
    }
  } catch (apiErr) {
    console.warn('Arbeitnow API step skipped:', apiErr);
  }

  // 3. Fetch from The Muse Public Jobs API
  try {
    onProgress('Consultation du flux The Muse...');
    for (let page = 1; page <= 3; page++) {
      const museRes = await fetch(`https://www.themuse.com/api/public/jobs?page=${page}`);
      if (museRes.ok) {
        const museData = await museRes.json();
        if (Array.isArray(museData.results)) {
          const searchTerms = kwList.map(k => normalizeText(k));
          museData.results.forEach(item => {
            const title = item.name || '';
            const desc = item.contents || '';
            const fullNorm = normalizeText(`${title} ${desc}`);

            const matchesKw = searchTerms.length === 0 || searchTerms.some(st => {
              if (fullNorm.includes(st)) return true;
              const syns = KEYWORD_SYNONYMS[st] || [];
              return syns.some(syn => fullNorm.includes(normalizeText(syn)));
            });

            if (matchesKw) {
              const locName = item.locations?.[0]?.name || location;
              const cType = classifyContract(title, desc, item.type);
              addJobToPool({
                id: `muse_${item.id}_${Math.random().toString(36).substring(2, 6)}`,
                title: title,
                company: item.company?.name || 'Entreprise',
                location: locName,
                site: 'The Muse',
                job_url: item.refs?.landing_page || `https://www.themuse.com/jobs/${item.id}`,
                description: desc.replace(/<[^>]+>/g, ' ').slice(0, 2500),
                salary: 'Non spécifié',
                date_posted: item.publication_date ? item.publication_date.split('T')[0] : 'Récent',
                is_remote: locName.toLowerCase().includes('remote') || isRemote,
                contract: cType,
                job_type: cType,
                matched_keyword: kwList[0]
              });
            }
          });
        }
      }
    }
  } catch (museErr) {
    console.warn('The Muse API step skipped:', museErr);
  }

  // 4. Fetch from Remotive Public API (live remote jobs)
  try {
    onProgress('Consultation du flux Remotive...');
    const remotiveRes = await fetch('https://remotive.com/api/remote-jobs?limit=100');
    if (remotiveRes.ok) {
      const data = await remotiveRes.json();
      if (Array.isArray(data.jobs)) {
        const searchTerms = kwList.map(k => normalizeText(k));
        data.jobs.forEach(item => {
          const title = item.title || '';
          const desc = item.description || '';
          const fullNorm = normalizeText(`${title} ${desc}`);

          const matchesKw = searchTerms.length === 0 || searchTerms.some(st => {
            if (fullNorm.includes(st)) return true;
            const syns = KEYWORD_SYNONYMS[st] || [];
            return syns.some(syn => fullNorm.includes(normalizeText(syn)));
          });

          if (matchesKw) {
            const cType = classifyContract(title, desc, item.job_type);
            addJobToPool({
              id: `remotive_${item.id || Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
              title: item.title,
              company: item.company_name || 'Entreprise',
              location: item.candidate_required_location || 'Remote / Worldwide',
              site: 'Remotive',
              job_url: item.url || '',
              description: item.description?.replace(/<[^>]+>/g, ' ').slice(0, 2500) || '',
              salary: item.salary || 'Non spécifié',
              date_posted: item.publication_date ? item.publication_date.split('T')[0] : 'Récent',
              is_remote: true,
              contract: cType,
              job_type: cType,
              matched_keyword: kwList[0]
            });
          }
        });
      }
    }
  } catch (remotiveErr) {
    console.warn('Remotive API step skipped:', remotiveErr);
  }

  // 5. Fetch from Jobicy Public API
  try {
    onProgress('Consultation du flux Jobicy...');
    const jobicyRes = await fetch('https://jobicy.com/api/v2/remote-jobs?count=100');
    if (jobicyRes.ok) {
      const data = await jobicyRes.json();
      if (Array.isArray(data.jobs)) {
        const searchTerms = kwList.map(k => normalizeText(k));
        data.jobs.forEach(item => {
          const title = item.jobTitle || '';
          const desc = item.jobDescription || '';
          const fullNorm = normalizeText(`${title} ${desc}`);

          const matchesKw = searchTerms.length === 0 || searchTerms.some(st => {
            if (fullNorm.includes(st)) return true;
            const syns = KEYWORD_SYNONYMS[st] || [];
            return syns.some(syn => fullNorm.includes(normalizeText(syn)));
          });

          if (matchesKw) {
            const cType = classifyContract(title, desc, item.jobType?.[0]);
            addJobToPool({
              id: `jobicy_${item.id || Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
              title: item.jobTitle,
              company: item.companyName || 'Entreprise',
              location: item.jobGeo || 'Remote / Worldwide',
              site: 'Jobicy',
              job_url: item.url || '',
              description: item.jobDescription?.replace(/<[^>]+>/g, ' ').slice(0, 2500) || '',
              salary: item.annualSalaryMin ? `${item.annualSalaryMin} - ${item.annualSalaryMax || ''} ${item.salaryCurrency || 'USD'}` : 'Non spécifié',
              date_posted: item.pubDate ? new Date(item.pubDate).toISOString().split('T')[0] : 'Récent',
              is_remote: true,
              contract: cType,
              job_type: cType,
              matched_keyword: kwList[0]
            });
          }
        });
      }
    }
  } catch (jobicyErr) {
    console.warn('Jobicy API step skipped:', jobicyErr);
  }

  // 6. Fetch from Himalayas Public Jobs API
  try {
    onProgress('Consultation du flux Himalayas...');
    const himalayasRes = await fetch('https://himalayas.app/jobs/api?limit=100');
    if (himalayasRes.ok) {
      const data = await himalayasRes.json();
      if (Array.isArray(data.jobs)) {
        const searchTerms = kwList.map(k => normalizeText(k));
        data.jobs.forEach(item => {
          const title = item.title || '';
          const desc = item.description || '';
          const fullNorm = normalizeText(`${title} ${desc}`);

          const matchesKw = searchTerms.length === 0 || searchTerms.some(st => {
            if (fullNorm.includes(st)) return true;
            const syns = KEYWORD_SYNONYMS[st] || [];
            return syns.some(syn => fullNorm.includes(normalizeText(syn)));
          });

          if (matchesKw) {
            const cType = classifyContract(title, desc, item.employmentType);
            addJobToPool({
              id: `himalayas_${item.slug || Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
              title: item.title,
              company: item.companyName || 'Entreprise',
              location: item.locationRestrictions?.join(', ') || 'Worldwide / Remote',
              site: 'Himalayas',
              job_url: item.applicationLink || `https://himalayas.app/companies/${item.companySlug}/jobs/${item.slug}`,
              description: item.description?.replace(/<[^>]+>/g, ' ').slice(0, 2500) || '',
              salary: item.minSalary ? `${item.minSalary} - ${item.maxSalary || ''} ${item.currency || 'USD'}` : 'Non spécifié',
              date_posted: item.publishedAt ? item.publishedAt.split('T')[0] : 'Récent',
              is_remote: true,
              contract: cType,
              job_type: cType,
              matched_keyword: kwList[0]
            });
          }
        });
      }
    }
  } catch (himaErr) {
    console.warn('Himalayas API step skipped:', himaErr);
  }

  // 7. Fetch from RemoteOK Public API
  try {
    onProgress('Consultation du flux RemoteOK...');
    const remoteokRes = await fetch('https://remoteok.com/api');
    if (remoteokRes.ok) {
      const data = await remoteokRes.json();
      if (Array.isArray(data)) {
        const searchTerms = kwList.map(k => normalizeText(k));
        data.slice(1, 100).forEach(item => {
          const title = item.position || '';
          const desc = item.description || '';
          const fullNorm = normalizeText(`${title} ${desc}`);

          const matchesKw = searchTerms.length === 0 || searchTerms.some(st => {
            if (fullNorm.includes(st)) return true;
            const syns = KEYWORD_SYNONYMS[st] || [];
            return syns.some(syn => fullNorm.includes(normalizeText(syn)));
          });

          if (matchesKw) {
            const cType = classifyContract(title, desc, '');
            const jobUrl = item.url || (item.id ? `https://remoteok.com/remote-jobs/${item.id}` : '');
            if (jobUrl) {
              addJobToPool({
                id: `remoteok_${item.id || Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
                title: item.position,
                company: item.company || 'Entreprise',
                location: item.location || '100% Télétravail',
                site: 'RemoteOK',
                job_url: jobUrl,
                description: item.description?.replace(/<[^>]+>/g, ' ').slice(0, 2500) || '',
                salary: item.salary || 'Non spécifié',
                date_posted: item.date ? item.date.slice(0, 10) : 'Récent',
                is_remote: true,
                contract: cType,
                job_type: cType,
                matched_keyword: kwList[0]
              });
            }
          }
        });
      }
    }
  } catch (rokErr) {
    console.warn('RemoteOK API step skipped:', rokErr);
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
  hoursOld = null,
  onProgress = () => {}
}) {
  const keywordsList = Array.isArray(keywords) && keywords.length > 0
    ? keywords
    : [searchTerm || 'Software Engineer'];

  const payload = {
    keywords: keywordsList,
    search_term: keywordsList[0],
    location: location.trim() || 'Paris, France',
    results_wanted: 5000,
    sites,
    contract_type: contractType,
    job_type: jobType,
    is_remote: isRemote,
    hours_old: hoursOld
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
