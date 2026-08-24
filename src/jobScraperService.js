/**
 * Job Scraping Service for PostuTrack
 * 
 * Supports:
 * 1. Local Python JobSpy backend (/api/scrape-jobs)
 * 2. Standalone Client-side / Tauri Fallback Engine (queries live job platforms, Welcome to the Jungle, and Jina search)
 * 3. Smart Relevance Scoring Engine (ranks 50 candidate offers by keyword, contract, location and remote fit,
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
  const title = (job.title || '').toLowerCase();
  const desc = (job.description || '').toLowerCase();
  const jobLoc = (job.location || '').toLowerCase();
  const jobContract = (job.contract || '').toLowerCase();

  // 1. Keyword fit (Title match has highest weight)
  const kwList = Array.isArray(keywords) && keywords.length > 0 ? keywords : ['developer'];
  kwList.forEach(kw => {
    const cleanKw = kw.toLowerCase().trim();
    if (!cleanKw) return;

    if (title.includes(cleanKw)) {
      score += 24;
    } else {
      const tokens = cleanKw.split(/[\s/+-]+/).filter(t => t.length > 2);
      const matchedTokens = tokens.filter(t => title.includes(t));
      if (matchedTokens.length > 0) {
        score += Math.round((matchedTokens.length / tokens.length) * 16);
      }
    }

    if (desc.includes(cleanKw)) {
      score += 6;
    }
  });

  // 2. Location fit (Lenient: reward city/country match, don't brutally eliminate)
  const reqLoc = (location || '').toLowerCase().trim();
  if (reqLoc) {
    const locTokens = reqLoc.split(/[,/ -]+/).filter(t => t.length > 2);
    if (locTokens.some(t => jobLoc.includes(t))) {
      score += 15;
    } else if (jobLoc.includes('france') || jobLoc.includes('paris') || jobLoc.includes('remote') || jobLoc.includes('télétravail')) {
      score += 8;
    }
  } else {
    score += 10;
  }

  // 3. Contract fit
  if (contractType && contractType !== 'all') {
    const target = contractType.toLowerCase();
    if (jobContract === target) {
      score += 20;
    }
  } else {
    score += 10;
  }

  // 4. Remote / Workplace fit
  if (isRemote || workplace === 'remote') {
    if (job.is_remote || /télétravail|remote|full[- ]remote|100%/i.test(`${title} ${desc} ${jobLoc}`)) {
      score += 15;
    }
  } else {
    score += 5;
  }

  // 5. Listing quality (salary, description length)
  if (job.salary && job.salary !== 'Non spécifié') {
    score += 4;
  }
  if (desc.length > 250) {
    score += 4;
  }

  return Math.min(99, Math.max(50, Math.round(score)));
}

/**
 * Fallback Web Scraper: Queries live job platforms (LinkedIn, Indeed, Glassdoor, Welcome to the Jungle, Jina)
 * Gathers a candidate pool of 50 offers, ranks by relevance, and prepares the results.
 */
async function scrapeDirectFromWeb({
  keywords = [],
  location = 'Paris, France',
  sites = ['linkedin', 'indeed', 'glassdoor', 'wttj'],
  contractType = 'all',
  jobLimit = 15,
  isRemote = false,
  onProgress = () => {}
}) {
  const candidatePool = [];
  const seenUrls = new Set();
  const kwList = Array.isArray(keywords) && keywords.length > 0 ? keywords : ['Developer'];

  onProgress('Recherche en direct sur le web (moteur autonome étendu)...');

  // Build platform domain queries
  const hasWttj = sites.some(s => s === 'wttj' || s === 'welcometothejungle');
  const siteFilters = sites.map(s => {
    if (s === 'linkedin') return 'site:linkedin.com/jobs/view';
    if (s === 'indeed') return 'site:indeed.com OR site:fr.indeed.com';
    if (s === 'glassdoor') return 'site:glassdoor.com/job-listing';
    if (s === 'wttj' || s === 'welcometothejungle') return 'site:welcometothejungle.com/fr/companies/*/jobs OR site:welcometothejungle.com/en/companies/*/jobs OR site:welcometothejungle.com/fr/jobs';
    return '';
  }).filter(Boolean).join(' OR ');

  // 1. Fetch from Jina Search with targeted job board queries
  for (const kw of kwList.slice(0, 4)) {
    try {
      const queryStr = `${kw} ${location} ${siteFilters ? `(${siteFilters})` : ''} ${isRemote ? 'remote' : ''} ${contractType !== 'all' ? contractType : ''}`.trim();
      const jinaUrl = `https://s.jina.ai/${encodeURIComponent(queryStr)}`;

      const jinaRes = await fetch(jinaUrl, {
        headers: { 'Accept': 'text/plain' }
      });

      if (jinaRes.ok) {
        const text = await jinaRes.text();
        const extracted = parseJinaSearchResults(text, kw, location);
        extracted.forEach(job => {
          if (job.job_url && !seenUrls.has(job.job_url)) {
            seenUrls.add(job.job_url);
            candidatePool.push(job);
          }
        });
      }
    } catch (err) {
      console.warn('Jina search step failed for keyword', kw, err);
    }
  }

  // 2. If WTTJ is selected, perform dedicated Welcome to the Jungle search query
  if (hasWttj && candidatePool.length < 50) {
    try {
      onProgress('Extraction des offres Welcome to the Jungle...');
      const wttjKw = kwList[0] || 'Tech';
      const wttjQuery = `${wttjKw} ${location} site:welcometothejungle.com/fr/companies/ ${contractType !== 'all' ? contractType : ''}`;
      const wttjJinaUrl = `https://s.jina.ai/${encodeURIComponent(wttjQuery)}`;
      const wttjRes = await fetch(wttjJinaUrl, { headers: { 'Accept': 'text/plain' } });
      if (wttjRes.ok) {
        const wttjText = await wttjRes.text();
        const extractedWttj = parseJinaSearchResults(wttjText, wttjKw, location, 'Welcome to the Jungle');
        extractedWttj.forEach(job => {
          if (job.job_url && !seenUrls.has(job.job_url)) {
            seenUrls.add(job.job_url);
            candidatePool.push(job);
          }
        });
      }
    } catch (wttjErr) {
      console.warn('WTTJ dedicated search step:', wttjErr);
    }
  }

  // 3. Fetch from Arbeitnow Public Job API
  if (candidatePool.length < 50) {
    try {
      onProgress('Consultation des flux d\'offres publiques...');
      const arbeitRes = await fetch('https://www.arbeitnow.com/api/job-board-api');
      if (arbeitRes.ok) {
        const data = await arbeitRes.json();
        if (Array.isArray(data.data)) {
          const searchTerms = kwList.map(k => k.toLowerCase());
          const locLower = (location || '').toLowerCase();

          data.data.forEach(item => {
            const title = item.title || '';
            const desc = item.description || '';
            const itemLoc = item.location || '';
            const fullText = `${title} ${desc} ${itemLoc}`.toLowerCase();

            const matchesKw = searchTerms.length === 0 || searchTerms.some(st => fullText.includes(st) || st.split(' ').some(w => w.length > 3 && fullText.includes(w)));
            const matchesLoc = !locLower || locLower.includes('remote') || locLower.includes('france') || fullText.includes('remote') || fullText.includes('paris') || fullText.includes('france') || item.remote;

            if (matchesKw && (matchesLoc || item.remote)) {
              const jobUrl = item.url || `https://www.arbeitnow.com/jobs/${item.slug}`;
              if (!seenUrls.has(jobUrl)) {
                seenUrls.add(jobUrl);
                candidatePool.push({
                  id: `arbeit_${item.slug || Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
                  title: item.title,
                  company: item.company_name || 'Entreprise',
                  location: item.location || (item.remote ? '100% Télétravail' : location),
                  site: 'Arbeitnow',
                  job_url: jobUrl,
                  description: item.description?.replace(/<[^>]+>/g, ' ').slice(0, 2000) || '',
                  salary: 'Non spécifié',
                  date_posted: new Date(item.created_at * 1000).toISOString().split('T')[0] || 'Récent',
                  is_remote: Boolean(item.remote),
                  contract: item.job_types?.[0] || 'CDI',
                  matched_keyword: kwList[0]
                });
              }
            }
          });
        }
      }
    } catch (apiErr) {
      console.warn('Arbeitnow API step skipped:', apiErr);
    }
  }

  // 4. Fetch from Jobicy Public Job API
  if (candidatePool.length < 50) {
    try {
      const jobicyRes = await fetch('https://jobicy.com/api/v2/remote-jobs?count=30');
      if (jobicyRes.ok) {
        const data = await jobicyRes.json();
        if (Array.isArray(data.jobs)) {
          const searchTerms = kwList.map(k => k.toLowerCase());
          data.jobs.forEach(item => {
            const title = item.jobTitle || '';
            const desc = item.jobDescription || '';
            const fullText = `${title} ${desc}`.toLowerCase();

            const matchesKw = searchTerms.length === 0 || searchTerms.some(st => fullText.includes(st) || st.split(' ').some(w => w.length > 3 && fullText.includes(w)));
            if (matchesKw) {
              const jobUrl = item.url || '';
              if (jobUrl && !seenUrls.has(jobUrl)) {
                seenUrls.add(jobUrl);
                candidatePool.push({
                  id: `jobicy_${item.id || Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
                  title: item.jobTitle,
                  company: item.companyName || 'Entreprise',
                  location: item.jobGeo || 'Remote / Worldwide',
                  site: 'Jobicy',
                  job_url: jobUrl,
                  description: item.jobDescription?.replace(/<[^>]+>/g, ' ').slice(0, 2000) || '',
                  salary: item.annualSalaryMin ? `${item.annualSalaryMin} - ${item.annualSalaryMax || ''} ${item.salaryCurrency || 'USD'}` : 'Non spécifié',
                  date_posted: item.pubDate ? new Date(item.pubDate).toISOString().split('T')[0] : 'Récent',
                  is_remote: true,
                  contract: item.jobType?.[0] || 'CDI',
                  matched_keyword: kwList[0]
                });
              }
            }
          });
        }
      }
    } catch (jobicyErr) {
      console.warn('Jobicy API step skipped:', jobicyErr);
    }
  }

  // 5. Score all candidates by relevance
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
      if (lowerUrl.includes('linkedin.com')) site = 'LinkedIn';
      else if (lowerUrl.includes('indeed.')) site = 'Indeed';
      else if (lowerUrl.includes('glassdoor.')) site = 'Glassdoor';
      else if (lowerUrl.includes('welcometothejungle.')) site = 'Welcome to the Jungle';
      else if (lowerUrl.includes('ziprecruiter.')) site = 'ZipRecruiter';

      // Extract markdown snippet description
      let description = sec.replace(/^URL Source:.*$/im, '').replace(/^Markdown Content:\s*/im, '').trim();
      description = description.slice(0, 1800);

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
        is_remote: /télétravail|remote|full[- ]remote/i.test(`${title} ${description}`),
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
 * 1. Collects a pool of 50 candidate offers
 * 2. Ranks them by relevance to the user's requirements
 * 3. Shows only the number of offers asked by the user (jobLimit)
 */
export async function executeJobScrape({
  keywords = [],
  searchTerm = '',
  location = 'Paris, France',
  jobLimit = 15,
  sites = ['linkedin', 'indeed', 'glassdoor', 'wttj'],
  contractType = 'all',
  jobType = null,
  isRemote = false,
  hoursOld = null,
  onProgress = () => {}
}) {
  const keywordsList = Array.isArray(keywords) && keywords.length > 0
    ? keywords
    : [searchTerm || 'Software Engineer'];

  // Behind the scenes, always request a rich pool of at least 50 candidates
  const payload = {
    keywords: keywordsList,
    search_term: keywordsList[0],
    location: location.trim() || 'Paris, France',
    results_wanted: 50,
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

    // Strict contract filtering
    if (contractType && contractType !== 'all') {
      const target = contractType.toLowerCase();
      ranked = ranked.filter(j => (j.contract || j.job_type || '').toLowerCase() === target);
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
        ranked = ranked.filter(j => (j.contract || j.job_type || '').toLowerCase() === target);
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

  // Step 3: Standalone Client-side live web scraper fallback (queries 50 candidates, ranks & slices to jobLimit)
  onProgress('Lancement du moteur de recherche autonome en direct (50 offres candidates)...');
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
      total_candidates: fallbackJobs.length,
      searched_keywords: keywordsList
    };
  }

  // If primary returned a specific error message from Python JobSpy, return it
  if (primaryResult.data && primaryResult.data.error) {
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
