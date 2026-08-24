/**
 * Job Scraping Service for PostuTrack
 * 
 * Supports:
 * 1. Local Python JobSpy backend (/api/scrape-jobs)
 * 2. Standalone Multi-Source Web & API Engine (searches up to 500 candidates across LinkedIn, Indeed, Glassdoor,
 *    Welcome to the Jungle, Arbeitnow, Remotive, Jobicy, Himalayas, RemoteOK, and Jina search)
 * 3. Smart Relevance Scoring Engine (ranks 500 candidates by keyword, contract, location and remote fit,
 *    then returns the top user-requested count).
 */

import { detectContractType } from './urlJobExtractor';

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
 * Normalize string for robust comparisons (removes accents and punctuation)
 */
function normalizeText(str) {
  if (!str || typeof str !== 'string') return '';
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s]/g, ' ')
    .trim();
}

/**
 * Keyword synonym & related terms dictionary for smarter matching
 */
const KEYWORD_SYNONYMS = {
  dev: ['developer', 'developpeur', 'software', 'ingenieur', 'engineer', 'frontend', 'backend', 'fullstack', 'web'],
  developpeur: ['developer', 'software', 'ingenieur', 'engineer', 'codeur', 'programmeur'],
  developer: ['developpeur', 'software', 'ingenieur', 'engineer', 'programmer'],
  frontend: ['front-end', 'react', 'vue', 'angular', 'javascript', 'typescript', 'ui'],
  backend: ['back-end', 'node', 'python', 'java', 'golang', 'php', 'ruby', 'c#'],
  fullstack: ['full-stack', 'full stack', 'developer', 'developpeur'],
  data: ['data scientist', 'data analyst', 'data engineer', 'machine learning', 'ia', 'ai', 'analytics', 'bi'],
  stage: ['internship', 'intern', 'stagiaire', 'pfe'],
  alternance: ['apprentissage', 'apprenti', 'contrat pro', 'work-study'],
  commercial: ['sales', 'business developer', 'account manager', 'bizdev', 'prospection'],
  marketing: ['growth', 'communication', 'product marketing', 'content', 'seo', 'sem', 'acquisition'],
  design: ['ui', 'ux', 'product designer', 'graphiste', 'webdesign'],
  product: ['product manager', 'product owner', 'chef de produit', 'pm', 'po']
};

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
  const jobContract = (job.contract || '').toLowerCase();

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
        // Check synonyms
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

  // 2. Location fit (Lenient: reward city/country match, don't brutally eliminate)
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
    const target = contractType.toLowerCase();
    if (jobContract === target) {
      score += 25;
    } else if (jobContract === 'all' || !jobContract) {
      score += 5;
    }
  } else {
    score += 10;
  }

  // 4. Remote / Workplace fit
  if (isRemote || workplace === 'remote') {
    if (job.is_remote || /teletravail|remote|full remote|100%/.test(`${normTitle} ${normDesc} ${normJobLoc}`)) {
      score += 15;
    }
  } else {
    score += 5;
  }

  // 5. Listing quality bonus (salary, description richness)
  if (job.salary && job.salary !== 'Non spécifié') {
    score += 4;
  }
  if ((job.description || '').length > 250) {
    score += 4;
  }

  return Math.min(99, Math.max(50, Math.round(score)));
}

/**
 * Multi-Source Web Scraper: Searches up to 500 candidate offers across:
 * - Welcome to the Jungle (WTTJ)
 * - LinkedIn Jobs
 * - Indeed France
 * - Glassdoor
 * - Arbeitnow (multiple pages)
 * - Remotive
 * - Jobicy
 * - Himalayas
 * - RemoteOK
 * - Jina live search
 */
async function scrapeDirectFromWeb({
  keywords = [],
  location = 'Paris, France',
  sites = ['linkedin', 'indeed', 'wttj', 'glassdoor'],
  contractType = 'all',
  jobLimit = 15,
  isRemote = false,
  onProgress = () => {}
}) {
  const candidatePool = [];
  const seenUrls = new Set();
  const seenTitles = new Set();
  const kwList = Array.isArray(keywords) && keywords.length > 0 ? keywords : ['Developer'];
  const maxPoolTarget = 500;

  function addJobToPool(job) {
    if (!job || !job.job_url) return;
    const urlKey = job.job_url.trim().toLowerCase();
    const titleKey = `${(job.title || '').trim().toLowerCase()}___${(job.company || '').trim().toLowerCase()}`;
    
    if (seenUrls.has(urlKey) || seenTitles.has(titleKey)) return;
    seenUrls.add(urlKey);
    seenTitles.add(titleKey);
    candidatePool.push(job);
  }

  onProgress('Recherche multi-plateformes étendue (objectif : 500 offres candidates)...');

  // Build platform domain queries
  const hasWttj = sites.some(s => s === 'wttj' || s === 'welcometothejungle');

  // 1. Welcome to the Jungle dedicated queries (high priority if selected)
  if (hasWttj && candidatePool.length < maxPoolTarget) {
    try {
      onProgress('Extraction approfondie des offres Welcome to the Jungle (WTTJ)...');
      for (const kw of kwList.slice(0, 3)) {
        const wttjQuery = `${kw} ${location} site:welcometothejungle.com/fr/companies OR site:welcometothejungle.com/fr/jobs ${contractType !== 'all' ? contractType : ''}`.trim();
        const wttjJinaUrl = `https://s.jina.ai/${encodeURIComponent(wttjQuery)}`;
        const wttjRes = await fetch(wttjJinaUrl, { headers: { 'Accept': 'text/plain' } });
        if (wttjRes.ok) {
          const wttjText = await wttjRes.text();
          const extractedWttj = parseJinaSearchResults(wttjText, kw, location, 'Welcome to the Jungle');
          extractedWttj.forEach(addJobToPool);
        }
      }
    } catch (wttjErr) {
      console.warn('WTTJ dedicated search step:', wttjErr);
    }
  }

  // 2. Targeted search for LinkedIn, Indeed, Glassdoor via Jina
  for (const kw of kwList.slice(0, 4)) {
    if (candidatePool.length >= maxPoolTarget) break;
    try {
      onProgress(`Exploration web pour "${kw}" sur LinkedIn, Indeed & Glassdoor...`);
      const searchQueries = [
        `${kw} ${location} site:linkedin.com/jobs/view ${isRemote ? 'remote' : ''} ${contractType !== 'all' ? contractType : ''}`,
        `${kw} ${location} site:fr.indeed.com OR site:indeed.com ${contractType !== 'all' ? contractType : ''}`,
        `${kw} ${location} site:glassdoor.fr OR site:glassdoor.com/job-listing ${contractType !== 'all' ? contractType : ''}`
      ];

      for (const q of searchQueries) {
        try {
          const jinaUrl = `https://s.jina.ai/${encodeURIComponent(q.trim())}`;
          const jinaRes = await fetch(jinaUrl, { headers: { 'Accept': 'text/plain' } });
          if (jinaRes.ok) {
            const text = await jinaRes.text();
            const extracted = parseJinaSearchResults(text, kw, location);
            extracted.forEach(addJobToPool);
          }
        } catch (subErr) {
          // ignore single search step error
        }
      }
    } catch (err) {
      console.warn('Jina search step failed for keyword', kw, err);
    }
  }

  // 3. Fetch from Arbeitnow Public Job API (pages 1 to 5 for high volume)
  if (candidatePool.length < maxPoolTarget) {
    try {
      onProgress('Consultation du flux d\'offres Arbeitnow (multi-pages)...');
      for (let page = 1; page <= 4; page++) {
        if (candidatePool.length >= maxPoolTarget) break;
        const pageUrl = page === 1 ? 'https://www.arbeitnow.com/api/job-board-api' : `https://www.arbeitnow.com/api/job-board-api?page=${page}`;
        const arbeitRes = await fetch(pageUrl);
        if (!arbeitRes.ok) break;

        const data = await arbeitRes.json();
        if (Array.isArray(data.data) && data.data.length > 0) {
          const searchTerms = kwList.map(k => normalizeText(k));
          const locLower = normalizeText(location || '');

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

            const matchesLoc = !locLower || locLower.includes('remote') || locLower.includes('france') || fullNorm.includes('remote') || fullNorm.includes('france') || item.remote;

            if (matchesKw && (matchesLoc || item.remote)) {
              const jobUrl = item.url || `https://www.arbeitnow.com/jobs/${item.slug}`;
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
                contract: item.job_types?.[0] || detectContractType(`${title} ${desc}`),
                matched_keyword: kwList[0]
              });
            }
          });
        }
      }
    } catch (apiErr) {
      console.warn('Arbeitnow API step skipped:', apiErr);
    }
  }

  // 4. Fetch from Remotive Public API (up to 100 jobs)
  if (candidatePool.length < maxPoolTarget) {
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
              const jobUrl = item.url || '';
              addJobToPool({
                id: `remotive_${item.id || Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
                title: item.title,
                company: item.company_name || 'Entreprise',
                location: item.candidate_required_location || 'Remote / Worldwide',
                site: 'Remotive',
                job_url: jobUrl,
                description: item.description?.replace(/<[^>]+>/g, ' ').slice(0, 2500) || '',
                salary: item.salary || 'Non spécifié',
                date_posted: item.publication_date ? item.publication_date.split('T')[0] : 'Récent',
                is_remote: true,
                contract: item.job_type || detectContractType(`${title} ${desc}`),
                matched_keyword: kwList[0]
              });
            }
          });
        }
      }
    } catch (remotiveErr) {
      console.warn('Remotive API step skipped:', remotiveErr);
    }
  }

  // 5. Fetch from Jobicy Public API
  if (candidatePool.length < maxPoolTarget) {
    try {
      onProgress('Consultation du flux Jobicy...');
      const jobicyRes = await fetch('https://jobicy.com/api/v2/remote-jobs?count=50');
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
              const jobUrl = item.url || '';
              addJobToPool({
                id: `jobicy_${item.id || Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
                title: item.jobTitle,
                company: item.companyName || 'Entreprise',
                location: item.jobGeo || 'Remote / Worldwide',
                site: 'Jobicy',
                job_url: jobUrl,
                description: item.jobDescription?.replace(/<[^>]+>/g, ' ').slice(0, 2500) || '',
                salary: item.annualSalaryMin ? `${item.annualSalaryMin} - ${item.annualSalaryMax || ''} ${item.salaryCurrency || 'USD'}` : 'Non spécifié',
                date_posted: item.pubDate ? new Date(item.pubDate).toISOString().split('T')[0] : 'Récent',
                is_remote: true,
                contract: item.jobType?.[0] || detectContractType(`${title} ${desc}`),
                matched_keyword: kwList[0]
              });
            }
          });
        }
      }
    } catch (jobicyErr) {
      console.warn('Jobicy API step skipped:', jobicyErr);
    }
  }

  // 6. Fetch from Himalayas Public Jobs API
  if (candidatePool.length < maxPoolTarget) {
    try {
      onProgress('Consultation du flux Himalayas...');
      const himalayasRes = await fetch('https://himalayas.app/jobs/api?limit=50');
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
              const jobUrl = item.applicationLink || `https://himalayas.app/companies/${item.companySlug}/jobs/${item.slug}`;
              addJobToPool({
                id: `himalayas_${item.slug || Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
                title: item.title,
                company: item.companyName || 'Entreprise',
                location: item.locationRestrictions?.join(', ') || 'Worldwide / Remote',
                site: 'Himalayas',
                job_url: jobUrl,
                description: item.description?.replace(/<[^>]+>/g, ' ').slice(0, 2500) || '',
                salary: item.minSalary ? `${item.minSalary} - ${item.maxSalary || ''} ${item.currency || 'USD'}` : 'Non spécifié',
                date_posted: item.publishedAt ? item.publishedAt.split('T')[0] : 'Récent',
                is_remote: true,
                contract: item.employmentType || detectContractType(`${title} ${desc}`),
                matched_keyword: kwList[0]
              });
            }
          });
        }
      }
    } catch (himaErr) {
      console.warn('Himalayas API step skipped:', himaErr);
    }
  }

  // 7. Fetch from RemoteOK API
  if (candidatePool.length < maxPoolTarget) {
    try {
      onProgress('Consultation du flux RemoteOK...');
      const remoteokRes = await fetch('https://remoteok.com/api', {
        headers: { 'User-Agent': 'PostuTrack/1.0' }
      });
      if (remoteokRes.ok) {
        const data = await remoteokRes.json();
        if (Array.isArray(data)) {
          const searchTerms = kwList.map(k => normalizeText(k));
          data.slice(1, 60).forEach(item => {
            const title = item.position || '';
            const desc = item.description || '';
            const fullNorm = normalizeText(`${title} ${desc}`);

            const matchesKw = searchTerms.length === 0 || searchTerms.some(st => {
              if (fullNorm.includes(st)) return true;
              const syns = KEYWORD_SYNONYMS[st] || [];
              return syns.some(syn => fullNorm.includes(normalizeText(syn)));
            });

            if (matchesKw) {
              const jobUrl = item.url || (item.id ? `https://remoteok.com/remote-jobs/${item.id}` : '');
              if (jobUrl) {
                addJobToPool({
                  id: `remoteok_${item.id || Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
                  title: item.position,
                  company: item.company || 'Entreprise',
                  location: item.location || 'Remote',
                  site: 'RemoteOK',
                  job_url: jobUrl,
                  description: item.description?.replace(/<[^>]+>/g, ' ').slice(0, 2500) || '',
                  salary: item.salary || 'Non spécifié',
                  date_posted: item.date ? item.date.split('T')[0] : 'Récent',
                  is_remote: true,
                  contract: detectContractType(`${title} ${desc}`),
                  matched_keyword: kwList[0]
                });
              }
            }
          });
        }
      }
    } catch (remoteokErr) {
      console.warn('RemoteOK API step skipped:', remoteokErr);
    }
  }

  onProgress(`Analyse et classement par pertinence de ${candidatePool.length} offres candidates...`);

  // 8. Score all candidates by relevance
  candidatePool.forEach(job => {
    job.relevance_score = calculateJobRelevance(job, {
      keywords: kwList,
      location,
      contractType,
      isRemote
    });
  });

  // Strict Contract Filter: if user specified a contract type (CDI, CDD, Stage, Alternance, Freelance), keep only matching
  let filtered = candidatePool;
  if (contractType && contractType !== 'all') {
    const target = contractType.toLowerCase();
    filtered = filtered.filter(job => {
      const c = (job.contract || '').toLowerCase();
      if (target === 'cdi') return c === 'cdi';
      if (target === 'cdd') return c === 'cdd';
      if (target === 'stage') return c === 'stage';
      if (target === 'alternance') return c === 'alternance';
      if (target === 'freelance') return c === 'freelance';
      return c === target;
    });
  }

  // Sort by relevance score descending
  filtered.sort((a, b) => (b.relevance_score || 50) - (a.relevance_score || 50));

  // Return the user-requested limit
  return filtered.slice(0, jobLimit);
}

/**
 * Parses markdown output from Jina search into structured job listing objects.
 */
function parseJinaSearchResults(markdownText, keyword, defaultLocation, defaultSite = null) {
  const results = [];
  if (!markdownText || typeof markdownText !== 'string') return results;

  const sections = markdownText.split(/\[\d+\]\s+Title:\s*/i);

  sections.forEach((sec, idx) => {
    if (idx === 0 && !sec.includes('URL Source:')) return;

    try {
      const urlMatch = sec.match(/URL Source:\s*(https?:\/\/[^\s\n]+)/i);
      const url = urlMatch ? urlMatch[1].trim() : '';
      if (!url) return;

      const titleMatch = sec.match(/^(?:\[\d+\]\s*)?([^\n]+)/);
      const rawTitle = titleMatch ? titleMatch[1].trim() : 'Offre d\'emploi';

      // Clean site suffix from title
      let title = rawTitle.replace(/\s*[-|–—]\s*(LinkedIn|Indeed|Glassdoor|Welcome to the Jungle|Jobteaser|WTTJ).*$/i, '').trim();
      title = title.replace(/^Title:\s*/i, '').trim();

      // Extract company
      let company = 'Entreprise';
      const atMatch = title.match(/(.+?)\s+(?:at|chez|@)\s+(.+)/i);
      if (atMatch) {
        title = atMatch[1].trim();
        company = atMatch[2].trim();
      } else {
        const hiringMatch = title.match(/^(.+?)\s+hiring\s+(.+?)\s+in/i);
        if (hiringMatch) {
          company = hiringMatch[1].trim();
          title = hiringMatch[2].trim();
        }
      }

      // Determine platform from URL
      let site = defaultSite || 'Web';
      const lowerUrl = url.toLowerCase();
      if (lowerUrl.includes('welcometothejungle.')) site = 'Welcome to the Jungle';
      else if (lowerUrl.includes('linkedin.com')) site = 'LinkedIn';
      else if (lowerUrl.includes('indeed.')) site = 'Indeed';
      else if (lowerUrl.includes('glassdoor.')) site = 'Glassdoor';

      // Extract markdown snippet description
      let description = sec.replace(/^URL Source:.*$/im, '').replace(/^Markdown Content:\s*/im, '').trim();
      description = description.slice(0, 2500);

      results.push({
        id: `jina_scraped_${idx}_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        title: title || 'Poste',
        company: company || 'Entreprise',
        location: defaultLocation || 'France',
        site: site,
        job_url: url,
        description: description || 'Détails du poste disponibles sur le lien de l\'offre.',
        salary: 'Non spécifié',
        date_posted: 'Récent',
        is_remote: /teletravail|remote|full remote/i.test(`${title} ${description}`),
        contract: detectContractType(`${title} ${description}`),
        matched_keyword: keyword
      });
    } catch (e) {
      console.warn('Failed to parse Jina section:', e);
    }
  });

  return results;
}

/**
 * Unified Scraper Executor:
 * 1. Collects a pool of up to 500 candidate offers
 * 2. Ranks them by relevance to the user's requirements
 * 3. Shows only the top offers requested by the user (jobLimit)
 */
export async function executeJobScrape({
  keywords = [],
  searchTerm = '',
  location = 'Paris, France',
  jobLimit = 15,
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

  // Behind the scenes, always request a rich candidate pool of 500 offers
  const payload = {
    keywords: keywordsList,
    search_term: keywordsList[0],
    location: location.trim() || 'Paris, France',
    results_wanted: 500,
    sites,
    contract_type: contractType,
    job_type: jobType,
    is_remote: isRemote,
    hours_old: hoursOld
  };

  // Step 1: Try relative /api/scrape-jobs
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

    // Rank and prioritize contract matches
    if (contractType && contractType !== 'all') {
      const target = contractType.toLowerCase();
      const exactMatches = ranked.filter(j => (j.contract || j.job_type || '').toLowerCase() === target);
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
  if (window.location.port !== '3000' && (primaryResult.isHtml || primaryResult.isNetworkError)) {
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
        const target = contractType.toLowerCase();
        const exactMatches = ranked.filter(j => (j.contract || j.job_type || '').toLowerCase() === target);
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

  // Step 3: Standalone Multi-Source Web Scraper Engine (crawls up to 500 candidate offers, scores & ranks)
  onProgress('Lancement du moteur de recherche autonome (recherche approfondie sur 500 offres)...');
  const fallbackJobs = await scrapeDirectFromWeb({
    keywords: keywordsList,
    location,
    sites,
    contractType,
    jobLimit,
    isRemote,
    onProgress
  });

  if (fallbackJobs.length > 0) {
    return {
      success: true,
      source: 'web_direct',
      jobs: fallbackJobs,
      total_candidates: 500,
      searched_keywords: keywordsList
    };
  }

  // If primary returned a clean error message that isn't a python stack trace, format it nicely
  if (primaryResult.data && primaryResult.data.error && !primaryResult.data.error.includes('Traceback') && !primaryResult.data.error.includes('ModuleNotFoundError')) {
    return {
      success: false,
      error: primaryResult.data.error,
      jobs: []
    };
  }

  return {
    success: false,
    error: 'Aucune offre trouvée pour ces critères de recherche. Essayez d\'élargir vos mots-clés ou le lieu.',
    jobs: []
  };
}
