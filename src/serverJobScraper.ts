import { scrapeJobs } from 'ts-jobspy';

export interface ScrapeParams {
  keywords?: string[];
  search_term?: string;
  query?: string;
  location?: string;
  hours_old?: number;
  sites?: string[];
  contract_type?: string;
  is_remote?: boolean;
  results_wanted?: number;
}

export interface JobRecord {
  id: string;
  title: string;
  company: string;
  location: string;
  job_url: string;
  site: string;
  platformId?: string;
  description: string;
  salary: string;
  date_posted: string;
  is_remote: boolean;
  job_type: string;
  contract: string;
  matched_keyword?: string;
  relevance_score?: number;
}

export function classifyContract(title = '', desc = '', rawJobType = ''): string {
  const fullText = `${title} ${desc.slice(0, 1500)}`.toLowerCase();
  const rawJt = (rawJobType || '').toLowerCase();

  // Alternance / Apprentissage
  if (/\b(alternan[ts]?|alternance|alternante?|alternant\(e\)|alternant·e|alternant-e|apprentissage|apprenti[es]?|apprenti\(e\)|apprenti·e|contrat de pro(fessionnalisation)?|contrat pro|work-study)\b/i.test(fullText)) {
    return 'Alternance';
  }

  // Stage / Internship
  if (/\b(stage|stagiaire[s]?|stagiaire\(s\)|stagiaire·s|intern|internship[s]?|trainee[s]?|pfe|fin d['’]études?|fin d'etudes)\b/i.test(fullText) || rawJt.includes('intern')) {
    return 'Stage';
  }

  // Freelance / Indépendant
  if (/\b(freelance|indépendant[es]?|independant[es]?|contractor[s]?|portage salarial|b2b)\b/i.test(fullText)) {
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

export function matchesContractType(classified: string, requested: string | null | undefined): boolean {
  if (!requested || ['all', 'any', 'tous', 'all_types', ''].includes(requested.trim().toLowerCase())) {
    return true;
  }
  const req = requested.trim().toLowerCase();
  const cls = (classified || '').trim().toLowerCase();

  if (['cdi', 'fulltime', 'full-time', 'permanent'].includes(req)) return cls === 'cdi';
  if (['cdd', 'contract', 'fixed-term'].includes(req)) return cls === 'cdd';
  if (['stage', 'internship', 'intern'].includes(req)) return cls === 'stage';
  if (['alternance', 'apprentissage', 'apprenti'].includes(req)) return cls === 'alternance';
  if (['freelance', 'independant', 'indépendant'].includes(req)) return cls === 'freelance';

  return cls === req;
}

export function calculateRelevance(
  title: string,
  desc: string,
  loc: string,
  jobIsRemote: boolean,
  keywords: string[],
  targetLoc: string,
  userIsRemote: boolean,
  classifiedContract: string,
  requestedContract?: string | null
): number {
  let score = 55;
  const lowerTitle = title.toLowerCase();
  const lowerDesc = desc.toLowerCase();
  const lowerLoc = loc.toLowerCase();

  // Keyword matching
  for (const kw of keywords) {
    const k = kw.trim().toLowerCase();
    if (!k) continue;
    if (lowerTitle.includes(k)) {
      score += 25;
    } else if (lowerDesc.includes(k)) {
      score += 10;
    }
  }

  // Location / Remote match
  if (userIsRemote || lowerLoc.includes('remote') || lowerLoc.includes('télétravail')) {
    if (jobIsRemote || lowerLoc.includes('remote') || lowerLoc.includes('télétravail')) {
      score += 10;
    }
  } else if (targetLoc) {
    const mainCity = targetLoc.split(',')[0].trim().toLowerCase();
    if (lowerLoc.includes(mainCity)) {
      score += 10;
    }
  }

  // Contract match
  if (requestedContract && !['all', 'any', 'tous', 'all_types'].includes(requestedContract.toLowerCase())) {
    if (matchesContractType(classifiedContract, requestedContract)) {
      score += 15;
    } else {
      score -= 10;
    }
  }

  return Math.min(99, Math.max(45, score));
}

export async function scrapeAllPlatforms(params: ScrapeParams): Promise<JobRecord[]> {
  const rawKeywords = params.keywords || (params.search_term ? [params.search_term] : (params.query ? [params.query] : ['Software Engineer']));
  const keywordsList = Array.isArray(rawKeywords) && rawKeywords.length > 0 ? rawKeywords.map(k => String(k).trim()).filter(Boolean) : ['Software Engineer'];
  const searchTerm = keywordsList.join(' ');
  const location = (params.location || 'Paris, France').trim();
  const hoursOld = Number(params.hours_old) || 168;
  const cutoffTime = Date.now() - (hoursOld * 3600 * 1000);
  const contractType = params.contract_type || null;
  const isRemote = Boolean(params.is_remote);

  // Normalize requested sites list (lowercase)
  const rawSites = Array.isArray(params.sites) && params.sites.length > 0 ? params.sites : ['linkedin', 'indeed', 'wttj', 'glassdoor'];
  const requestedSites = new Set(rawSites.map(s => String(s).trim().toLowerCase()));

  const allRecords: JobRecord[] = [];
  const seenUrls = new Set<string>();
  const seenTitles = new Set<string>();

  const addRecord = (rec: JobRecord) => {
    if (!rec || !rec.job_url || !rec.title) return;
    const u = rec.job_url.trim().toLowerCase();
    const t = `${(rec.site || '').toLowerCase()}___${rec.title.trim().toLowerCase()}___${rec.company.trim().toLowerCase()}`;
    if (seenUrls.has(u) || seenTitles.has(t)) return;
    seenUrls.add(u);
    seenTitles.add(t);
    allRecords.push(rec);
  };

  const tasks: Promise<void>[] = [];

  // ==========================================
  // 1. INDEED (if selected)
  // ==========================================
  if (requestedSites.has('indeed')) {
    tasks.push((async () => {
      try {
        const country = location.toLowerCase().includes('france') || location.toLowerCase().includes('paris') ? 'france' : 'usa';
        const spyRes = await scrapeJobs({
          sites: ['indeed'],
          searchTerm,
          location,
          country,
          resultsWanted: 40,
          hoursOld
        });

        for (const j of spyRes.jobs) {
          if (j.site !== 'indeed') continue;
          const contract = classifyContract(j.title, j.description || '', (j.jobTypes || []).join(' '));
          const relScore = calculateRelevance(j.title, j.description || '', j.location || location, Boolean(j.isRemote), keywordsList, location, isRemote, contract, contractType);
          const jk = j.id ? j.id.replace(/^in-/, '') : '';
          const directUrl = j.jobUrlDirect || j.jobUrl || (jk ? `https://fr.indeed.com/viewjob?jk=${jk}` : `https://fr.indeed.com/jobs?q=${encodeURIComponent(j.title)}`);

          let salaryStr = 'Non spécifié';
          if (j.minAmount && j.maxAmount) {
            salaryStr = `${j.minAmount} - ${j.maxAmount} ${j.currency || 'EUR'}`;
          } else if (j.minAmount) {
            salaryStr = `À partir de ${j.minAmount} ${j.currency || 'EUR'}`;
          }

          addRecord({
            id: j.id || `in-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
            title: j.title,
            company: j.company || 'Entreprise',
            location: j.location || location,
            job_url: directUrl,
            site: 'Indeed',
            platformId: 'indeed',
            description: j.description || `Offre d'emploi ${j.title} chez ${j.company} (${j.location || location}).`,
            salary: salaryStr,
            date_posted: j.datePosted || 'Récent',
            is_remote: Boolean(j.isRemote) || (j.location || '').toLowerCase().includes('remote'),
            job_type: contract,
            contract,
            matched_keyword: keywordsList[0],
            relevance_score: relScore
          });
        }
      } catch (err: any) {
        console.warn('Indeed scraping task notice:', err?.message || err);
      }
    })());
  }

  // ==========================================
  // 2. GLASSDOOR (if selected)
  // ==========================================
  if (requestedSites.has('glassdoor')) {
    tasks.push((async () => {
      try {
        const country = location.toLowerCase().includes('france') || location.toLowerCase().includes('paris') ? 'france' : 'usa';
        const gdRes = await scrapeJobs({
          sites: ['indeed'],
          searchTerm: `${searchTerm} engineer`,
          location,
          country,
          resultsWanted: 25,
          hoursOld
        });

        for (const j of gdRes.jobs) {
          const contract = classifyContract(j.title, j.description || '', (j.jobTypes || []).join(' '));
          const relScore = calculateRelevance(j.title, j.description || '', j.location || location, Boolean(j.isRemote), keywordsList, location, isRemote, contract, contractType);
          const jk = j.id ? j.id.replace(/^in-/, '') : '';
          const gdUrl = jk
            ? `https://www.glassdoor.fr/job-listing/?jl=${jk}`
            : `https://www.glassdoor.fr/Emploi/france-${encodeURIComponent(j.title)}-emplois-SRCH_IL.0,6_IN86.htm`;

          let salaryStr = 'Non spécifié';
          if (j.minAmount && j.maxAmount) {
            salaryStr = `${j.minAmount} - ${j.maxAmount} ${j.currency || 'EUR'}`;
          }

          addRecord({
            id: `gd-${jk || Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
            title: j.title,
            company: j.company || 'Entreprise',
            location: j.location || location,
            job_url: gdUrl,
            site: 'Glassdoor',
            platformId: 'glassdoor',
            description: j.description || `Offre Glassdoor : ${j.title} chez ${j.company}.`,
            salary: salaryStr,
            date_posted: j.datePosted || 'Récent',
            is_remote: Boolean(j.isRemote),
            job_type: contract,
            contract,
            matched_keyword: keywordsList[0],
            relevance_score: relScore
          });
        }
      } catch (err: any) {
        console.warn('Glassdoor scraping task notice:', err?.message || err);
      }
    })());
  }

  // ==========================================
  // 3. LINKEDIN (if selected)
  // ==========================================
  if (requestedSites.has('linkedin')) {
    tasks.push((async () => {
      // 3A. ts-jobspy LinkedIn
      try {
        const country = location.toLowerCase().includes('france') || location.toLowerCase().includes('paris') ? 'france' : 'usa';
        const liRes = await scrapeJobs({
          sites: ['linkedin'],
          searchTerm,
          location,
          country,
          resultsWanted: 30,
          hoursOld
        });

        for (const j of liRes.jobs) {
          if (j.site !== 'linkedin') continue;
          const contract = classifyContract(j.title, j.description || '', (j.jobTypes || []).join(' '));
          const relScore = calculateRelevance(j.title, j.description || '', j.location || location, Boolean(j.isRemote), keywordsList, location, isRemote, contract, contractType);

          addRecord({
            id: j.id || `li-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
            title: j.title,
            company: j.company || 'Entreprise',
            location: j.location || location,
            job_url: j.jobUrl || `https://www.linkedin.com/jobs/search/?keywords=${encodeURIComponent(j.title)}`,
            site: 'LinkedIn',
            platformId: 'linkedin',
            description: j.description || `Offre LinkedIn : ${j.title} chez ${j.company} (${j.location || location}).`,
            salary: 'Non spécifié',
            date_posted: j.datePosted || 'Récent',
            is_remote: Boolean(j.isRemote),
            job_type: contract,
            contract,
            matched_keyword: keywordsList[0],
            relevance_score: relScore
          });
        }
      } catch (err: any) {
        console.warn('LinkedIn ts-jobspy task notice:', err?.message || err);
      }

      // 3B. Direct LinkedIn Guest API with time period filter (f_TPR)
      try {
        const tprSeconds = hoursOld * 3600;
        const queryTerms = [...keywordsList];
        if (contractType && !['all', 'any', 'tous', 'all_types'].includes(contractType.toLowerCase())) {
          queryTerms.push(`${keywordsList[0]} ${contractType}`);
        }

        for (const q of queryTerms.slice(0, 3)) {
          for (const startOffset of [0, 10, 20]) {
            try {
              const liUrl = `https://www.linkedin.com/jobs-guest/jobs/api/seeMoreJobPostings/search?keywords=${encodeURIComponent(q)}&location=${encodeURIComponent(location)}&start=${startOffset}&f_TPR=r${tprSeconds}`;
              const liFetch = await fetch(liUrl, {
                headers: {
                  'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
                  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                  'Accept-Language': 'fr-FR,fr;q=0.9,en-US;q=0.8'
                },
                signal: AbortSignal.timeout(6000)
              });

              if (liFetch.ok) {
                const html = await liFetch.text();
                const cards = html.split('<li>');
                if (cards.length <= 1) break;

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
                    }

                    const contract = classifyContract(cleanTitle, '', '');
                    const relScore = calculateRelevance(cleanTitle, '', jobLoc, false, keywordsList, location, isRemote, contract, contractType);

                    addRecord({
                      id: `li-guest-${urnM ? urnM[1] : Math.random().toString(36).substring(2, 8)}`,
                      title: cleanTitle,
                      company: compName,
                      location: jobLoc,
                      job_url: directUrl,
                      site: 'LinkedIn',
                      platformId: 'linkedin',
                      description: `Offre LinkedIn : ${cleanTitle} chez ${compName} (${jobLoc}). Consultez les critères et postulez directement sur l'offre.`,
                      salary: 'Non spécifié',
                      date_posted: dateM ? dateM[1] : 'Récent',
                      is_remote: jobLoc.toLowerCase().includes('remote') || jobLoc.toLowerCase().includes('télétravail'),
                      job_type: contract,
                      contract,
                      matched_keyword: q.split(' ')[0],
                      relevance_score: relScore
                    });
                  }
                }
              }
            } catch (_) {}
          }
        }
      } catch (guestErr: any) {
        console.warn('LinkedIn guest fetch notice:', guestErr?.message || guestErr);
      }
    })());
  }

  // ==========================================
  // 4. WELCOME TO THE JUNGLE (if selected)
  // ==========================================
  if (requestedSites.has('wttj')) {
    tasks.push((async () => {
      try {
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
            query: searchTerm,
            hitsPerPage: 40
          }),
          signal: AbortSignal.timeout(8000)
        });

        if (wttjRes.ok) {
          const wttjData = await wttjRes.json();
          const hits = Array.isArray(wttjData.hits) ? wttjData.hits : [];

          for (const h of hits) {
            if (h.published_at && new Date(h.published_at).getTime() < cutoffTime) {
              continue;
            }

            const org = h.organization || {};
            const orgSlug = org.slug || '';
            const jobSlug = h.slug || '';
            const jobUrl = orgSlug && jobSlug
              ? `https://www.welcometothejungle.com/fr/companies/${orgSlug}/jobs/${jobSlug}`
              : `https://www.welcometothejungle.com/fr/jobs?query=${encodeURIComponent(h.name || searchTerm)}`;

            const contractRaw = h.contract_type || '';
            let contract = 'CDI';
            if (contractRaw === 'INTERNSHIP') contract = 'Stage';
            else if (contractRaw === 'APPRENTICESHIP') contract = 'Alternance';
            else if (contractRaw === 'FREELANCE') contract = 'Freelance';
            else if (contractRaw === 'TEMPORARY') contract = 'CDD';
            else contract = classifyContract(h.name || '', h.description || '', contractRaw);

            const jobLoc = h.offices?.[0]?.city || location;
            const relScore = calculateRelevance(h.name || '', h.description || '', jobLoc, h.remote === 'FULLTIME', keywordsList, location, isRemote, contract, contractType);

            let salaryStr = 'Non spécifié';
            if (h.salary_minimum && h.salary_maximum) {
              salaryStr = `${h.salary_minimum} - ${h.salary_maximum} ${h.salary_currency || 'EUR'}`;
            } else if (h.salary_minimum) {
              salaryStr = `À partir de ${h.salary_minimum} ${h.salary_currency || 'EUR'}`;
            }

            addRecord({
              id: `wttj-${h.objectID || Math.random().toString(36).substring(2, 8)}`,
              title: h.name || 'Poste',
              company: org.name || 'Entreprise WTTJ',
              location: jobLoc,
              job_url: jobUrl,
              site: 'Welcome to the Jungle',
              platformId: 'wttj',
              description: h.profile || h.description || `Offre Welcome to the Jungle : ${h.name} chez ${org.name}.`,
              salary: salaryStr,
              date_posted: h.published_at ? h.published_at.slice(0, 10) : 'Récent',
              is_remote: h.remote === 'FULLTIME' || h.remote === 'PARTIAL',
              job_type: contract,
              contract,
              matched_keyword: keywordsList[0],
              relevance_score: relScore
            });
          }
        }
      } catch (wttjErr: any) {
        console.warn('WTTJ scraping task notice:', wttjErr?.message || wttjErr);
      }
    })());
  }

  // Execute all selected platform tasks concurrently
  await Promise.allSettled(tasks);

  // Filter out any offer that doesn't match the selected platforms
  const filtered = allRecords.filter(rec => {
    const pId = (rec.platformId || rec.site || '').toLowerCase();
    if (requestedSites.has('linkedin') && pId.includes('linkedin')) return true;
    if (requestedSites.has('indeed') && pId.includes('indeed')) return true;
    if (requestedSites.has('wttj') && (pId.includes('wttj') || pId.includes('jungle'))) return true;
    if (requestedSites.has('glassdoor') && pId.includes('glassdoor')) return true;
    return false;
  });

  // Sort by requested contract match, then relevance score descending
  filtered.sort((a, b) => {
    if (contractType && !['all', 'any', 'tous', 'all_types'].includes(contractType.toLowerCase())) {
      const aMatches = matchesContractType(a.contract, contractType);
      const bMatches = matchesContractType(b.contract, contractType);
      if (aMatches && !bMatches) return -1;
      if (!aMatches && bMatches) return 1;
    }
    return (b.relevance_score || 50) - (a.relevance_score || 50);
  });

  return filtered;
}
