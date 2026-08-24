/**
 * Job Scraping Service for PostuTrack
 * 
 * Supports both:
 * 1. Local Python JobSpy backend (/api/scrape-jobs on current host or http://localhost:3000)
 * 2. Standalone Client-side / Tauri Fallback Engine (queries live job platforms and Jina search)
 *    so scraping works in compiled .exe / .msi desktop apps with zero crashes.
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
 * Fallback Web Scraper: Runs directly from browser/Tauri without needing a Python or Node backend.
 * Queries Jina Search for LinkedIn / Indeed / WTTJ real postings + public job APIs.
 */
async function scrapeDirectFromWeb({
  keywords = [],
  location = 'Paris, France',
  sites = ['linkedin', 'indeed'],
  contractType = 'all',
  jobLimit = 15,
  isRemote = false,
  onProgress = () => {}
}) {
  const jobs = [];
  const seenUrls = new Set();
  const kwList = Array.isArray(keywords) && keywords.length > 0 ? keywords : ['Developer'];

  onProgress('Recherche en direct sur le web (moteur autonome)...');

  // 1. Fetch from Jina Search with targeted job board queries
  for (const kw of kwList.slice(0, 3)) {
    try {
      const siteFilters = sites.map(s => {
        if (s === 'linkedin') return 'site:linkedin.com/jobs/view';
        if (s === 'indeed') return 'site:indeed.com OR site:fr.indeed.com';
        if (s === 'glassdoor') return 'site:glassdoor.com/job-listing';
        return '';
      }).filter(Boolean).join(' OR ');

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
            jobs.push(job);
          }
        });
      }
    } catch (err) {
      console.warn('Jina search step failed for keyword', kw, err);
    }
  }

  // 2. Fetch from Arbeitnow Public Job API (free, reliable, global & remote jobs)
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

          const matchesKw = searchTerms.length === 0 || searchTerms.some(st => fullText.includes(st));
          const matchesLoc = !locLower || locLower.includes('remote') || locLower.includes('france') || fullText.includes('remote') || fullText.includes('paris') || fullText.includes('france') || item.remote;

          if (matchesKw && (matchesLoc || item.remote)) {
            const jobUrl = item.url || `https://www.arbeitnow.com/jobs/${item.slug}`;
            if (!seenUrls.has(jobUrl)) {
              seenUrls.add(jobUrl);
              jobs.push({
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

  // 3. Fetch from Jobicy Public Job API (free global tech & business jobs)
  try {
    const jobicyRes = await fetch('https://jobicy.com/api/v2/remote-jobs?count=20');
    if (jobicyRes.ok) {
      const data = await jobicyRes.json();
      if (Array.isArray(data.jobs)) {
        const searchTerms = kwList.map(k => k.toLowerCase());
        data.jobs.forEach(item => {
          const title = item.jobTitle || '';
          const desc = item.jobDescription || '';
          const fullText = `${title} ${desc}`.toLowerCase();

          const matchesKw = searchTerms.length === 0 || searchTerms.some(st => fullText.includes(st));
          if (matchesKw) {
            const jobUrl = item.url || '';
            if (jobUrl && !seenUrls.has(jobUrl)) {
              seenUrls.add(jobUrl);
              jobs.push({
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

  return jobs.slice(0, jobLimit);
}

/**
 * Parses markdown output from Jina search into structured job listing objects.
 */
function parseJinaSearchResults(markdownText, keyword, defaultLocation) {
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
      let title = rawTitle.replace(/\s*[-|–—]\s*(LinkedIn|Indeed|Glassdoor|Welcome to the Jungle|Jobteaser).*$/i, '').trim();
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
      let site = 'Web';
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
        id: `jina_scraped_${idx}_${Date.now()}`,
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
 * 1. Tries primary backend (/api/scrape-jobs)
 * 2. Tries fallback local backend (http://localhost:3000/api/scrape-jobs)
 * 3. Tries standalone client-side live scraper (Jina Search + Public Feeds)
 */
export async function executeJobScrape({
  keywords = [],
  searchTerm = '',
  location = 'Paris, France',
  jobLimit = 15,
  sites = ['linkedin', 'indeed', 'glassdoor'],
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
    results_wanted: jobLimit,
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
    return {
      success: true,
      source: 'jobspy_local',
      jobs: primaryResult.data.jobs,
      searched_keywords: primaryResult.data.searched_keywords || keywordsList
    };
  }

  // Step 2: If primary returned HTML or network error, try http://localhost:3000/api/scrape-jobs (common in Tauri dev)
  if (window.location.port !== '3000' && (primaryResult.isHtml || primaryResult.isNetworkError)) {
    const localPortResult = await safeFetchJson('http://localhost:3000/api/scrape-jobs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (localPortResult.ok && localPortResult.data?.success && Array.isArray(localPortResult.data.jobs) && localPortResult.data.jobs.length > 0) {
      return {
        success: true,
        source: 'jobspy_localhost_3000',
        jobs: localPortResult.data.jobs,
        searched_keywords: localPortResult.data.searched_keywords || keywordsList
      };
    }
  }

  // Step 3: Standalone Client-side live web scraper fallback
  onProgress('Lancement du moteur de recherche autonome en direct...');
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
