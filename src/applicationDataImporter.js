import * as XLSX from 'xlsx';

const KNOWN_SOURCES = [
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
  'Email direct',
  'Cooptation',
  'Candidature Spontanée',
  'Inconnue',
  'Autre'
];

/**
 * Normalizes any date representation (string, Excel serial, Date object) to YYYY-MM-DD
 */
export function normalizeDate(input) {
  if (!input) return '';
  
  if (input instanceof Date && !isNaN(input.getTime())) {
    return input.toISOString().split('T')[0];
  }

  if (typeof input === 'number') {
    // Excel serial date number conversion (1900 date system)
    try {
      const parsedDate = new Date(Math.round((input - 25569) * 86400 * 1000));
      if (!isNaN(parsedDate.getTime())) {
        return parsedDate.toISOString().split('T')[0];
      }
    } catch (e) {}
  }

  const str = String(input).trim();
  if (!str) return '';

  // Match YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(str)) {
    return str;
  }

  // Match DD/MM/YYYY or DD-MM-YYYY
  const dmyMatch = str.match(/^(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{4})/);
  if (dmyMatch) {
    const day = dmyMatch[1].padStart(2, '0');
    const month = dmyMatch[2].padStart(2, '0');
    const year = dmyMatch[3];
    return `${year}-${month}-${day}`;
  }

  // Match MM/DD/YYYY (if month is clearly first or standard US)
  const parsed = new Date(str);
  if (!isNaN(parsed.getTime())) {
    return parsed.toISOString().split('T')[0];
  }

  return '';
}

/**
 * Normalizes status strings from various languages/tools to PostuTrack standard status.
 * If rawStatus is null/empty/undefined, returns null so the caller can apply fallback rules.
 */
export function normalizeStatus(rawStatus) {
  if (rawStatus === undefined || rawStatus === null || String(rawStatus).trim() === '') {
    return null;
  }
  const s = String(rawStatus).toLowerCase().trim();

  if (s.includes('refus') || s.includes('reject') || s.includes('declined') || s.includes('non retenu')) {
    return 'Refusé';
  }
  if (s.includes('offr') || s.includes('offer') || s.includes('accept') || s.includes('proposition')) {
    return 'Offre';
  }
  if (s.includes('entretien') || s.includes('interview') || s.includes('screen') || s.includes('rh') || s.includes('assessment')) {
    return 'Entretien';
  }
  if (s.includes('ghost') || s.includes('sans réponse') || s.includes('sans reponse') || s.includes('no response')) {
    return 'Ghosted';
  }
  if (s.includes('postul') || s.includes('applied') || s.includes('cours') || s.includes('progress') || s.includes('envoy') || s.includes('sent')) {
    return 'Postulé';
  }
  return 'Postulé';
}

/**
 * Normalizes contract type
 */
export function normalizeContract(rawType) {
  if (!rawType) return 'CDI';
  const t = String(rawType).toLowerCase().trim();

  if (t.includes('stage') || t.includes('intern')) return 'Stage';
  if (t.includes('alternan') || t.includes('appren')) return 'Alternance';
  if (t.includes('freelance') || t.includes('indep') || t.includes('contractor')) return 'Freelance';
  if (t.includes('interim') || t.includes('intérim') || t.includes('temp')) return 'Intérim';
  if (t.includes('cdd')) return 'CDD';
  if (t.includes('cdi') || t.includes('permanent') || t.includes('full')) return 'CDI';

  return 'CDI';
}

/**
 * Normalizes platform/source
 */
export function normalizeSource(rawSource) {
  if (!rawSource || !String(rawSource).trim()) return { source: 'Inconnue', customSource: '' };
  const s = String(rawSource).trim();
  const lower = s.toLowerCase();

  if (lower === 'unknown' || lower === 'inconnue' || lower === 'inconnu' || lower === 'n/a' || lower === 'na' || lower === 'none' || lower === 'aucun' || lower === 'aucune' || lower === '?') {
    return { source: 'Inconnue', customSource: '' };
  }

  for (const known of KNOWN_SOURCES) {
    if (lower === known.toLowerCase()) {
      return { source: known, customSource: '' };
    }
  }

  if (lower.includes('workday')) return { source: 'Workday', customSource: '' };
  if (lower.includes('linkedin')) return { source: 'LinkedIn', customSource: '' };
  if (lower.includes('wttj') || lower.includes('jungle')) return { source: 'Welcome to the Jungle', customSource: '' };
  if (lower.includes('greenhouse')) return { source: 'Greenhouse', customSource: '' };
  if (lower.includes('lever')) return { source: 'Lever', customSource: '' };
  if (lower.includes('smartrecruiters') || lower.includes('smart recruiters')) return { source: 'SmartRecruiters', customSource: '' };
  if (lower.includes('taleo') || lower.includes('oracle')) return { source: 'Taleo', customSource: '' };
  if (lower.includes('teamtailor')) return { source: 'Teamtailor', customSource: '' };
  if (lower.includes('ashby')) return { source: 'Ashby', customSource: '' };
  if (lower.includes('indeed')) return { source: 'Indeed', customSource: '' };
  if (lower.includes('france travail') || lower.includes('pole emploi') || lower.includes('pôle emploi')) return { source: 'France Travail', customSource: '' };
  if (lower.includes('site') || lower.includes('carriere') || lower.includes('carrière')) return { source: 'Site Entreprise', customSource: '' };
  if (lower.includes('mail') || lower.includes('email')) return { source: 'Email direct', customSource: '' };
  if (lower.includes('cooptation') || lower.includes('referral')) return { source: 'Cooptation', customSource: '' };
  if (lower.includes('spontan')) return { source: 'Candidature Spontanée', customSource: '' };
  if (lower.includes('unknown') || lower.includes('inconnu')) return { source: 'Inconnue', customSource: '' };

  return { source: 'Autre', customSource: s };
}

/**
 * Finds the value for any matching key in an object (case-insensitive & trimmed)
 */
function findValueByKeys(obj, possibleKeys) {
  const normalizedKeys = Object.keys(obj).map(k => ({
    original: k,
    normalized: k.toLowerCase().replace(/[\_\-\s\(\)\/\:\.]+/g, ' ').trim()
  }));

  for (const target of possibleKeys) {
    const cleanTarget = target.toLowerCase().replace(/[\_\-\s\(\)\/\:\.]+/g, ' ').trim();
    const match = normalizedKeys.find(k => k.normalized === cleanTarget || k.normalized.includes(cleanTarget));
    if (match && obj[match.original] !== undefined && obj[match.original] !== null && String(obj[match.original]).trim() !== '') {
      return String(obj[match.original]).trim();
    }
  }
  return '';
}

/**
 * Maps a generic raw row object (from Excel, CSV or JSON) into a PostuTrack application object
 */
export function mapRowToApplication(row, index = 0) {
  if (!row || typeof row !== 'object') return null;

  // 1. Company
  const company = findValueByKeys(row, [
    'company', 'entreprise', 'societe', 'société', 'employer', 'employeur', 
    'organization', 'organisation', 'nom entreprise', 'boite', 'boîte', 'compagnie'
  ]);

  // 2. Role / Position
  const role = findValueByKeys(row, [
    'role', 'position', 'poste', 'job title', 'title', 'titre', 'intitule', 
    'intitulé', 'metier', 'métier', 'job', 'fonction', 'grade'
  ]);

  // If both company and role are missing, row is likely empty/invalid
  if (!company && !role) return null;

  // 3. Status
  const rawStatus = findValueByKeys(row, [
    'status', 'statut', 'stage', 'state', 'etape', 'étape', 'etat', 'état'
  ]);
  const status = normalizeStatus(rawStatus);

  // 4. Contract
  const rawContract = findValueByKeys(row, [
    'contract', 'type de contrat', 'contrat', 'type', 'contract type', 'job type', 'contract_type'
  ]);
  const type = normalizeContract(rawContract);

  // 5. Source / Platform
  const rawSource = findValueByKeys(row, [
    'platform', 'plateforme', 'source', 'site de candidature', 'site de candidature ats plateforme', 
    'application platform ats', 'ats', 'job board', 'portal', 'job board ats'
  ]);
  const { source, customSource } = normalizeSource(rawSource);

  // 6. Application Date
  const rawDate = findValueByKeys(row, [
    'application date', 'date de candidature', 'date', 'applied date', 'date candidature', 
    'date postule', 'date postulé', 'created at', 'created_at'
  ]);
  const date = normalizeDate(rawDate) || new Date().toISOString().split('T')[0];

  // 7. Response Date / Rejection Date
  const rawResponseDate = findValueByKeys(row, [
    'response date', 'date de reponse', 'date de réponse', 'decision date', 'reply date', 
    'date reponse', 'reponse date', 'rejection date', 'date de refus', 'date refus',
    'date rejet', 'rejet date', 'rejected date'
  ]);
  const responseDate = normalizeDate(rawResponseDate);

  // 8. Determine final Status based on explicit status, rejection date, or default to Ghosted
  let finalStatus = status;
  if (!finalStatus) {
    // If no status was provided: check if there is a rejection date
    if (responseDate) {
      finalStatus = 'Refusé';
    } else {
      // If there is no status and no rejection date, consider it Ghosted
      finalStatus = 'Ghosted';
    }
  }

  // 9. URL
  const url = findValueByKeys(row, [
    'listing url', 'lien de l offre', 'lien de loffre', 'url', 'link', 'lien', 'job url', 'offer url'
  ]);

  // 10. Location
  const location = findValueByKeys(row, [
    'location', 'lieu', 'ville', 'city', 'adresse', 'address', 'pays', 'country', 'region'
  ]);

  // 11. Notes
  const notes = findValueByKeys(row, [
    'notes', 'note', 'commentaires', 'commentaire', 'comments', 'comment', 'remarques', 'description', 'details'
  ]);

  return {
    id: row.id && !isNaN(Number(row.id)) ? Number(row.id) : (Date.now() + Math.floor(Math.random() * 1000000) + index),
    company: company || (role ? 'Entreprise' : 'Inconnue'),
    role: role || 'Candidature',
    source,
    customSource: customSource || '',
    date,
    responseDate: responseDate || '',
    status: finalStatus,
    type,
    location: location || '',
    url: url || '',
    notes: notes || ''
  };
}

/**
 * Parses application data from an uploaded File object (xlsx, xls, csv, tsv, json)
 * Returns { success: boolean, applications: Array, error?: string, format: string, totalRowsParsed: number }
 */
export async function parseApplicationFile(file) {
  if (!file) {
    throw new Error("No file provided");
  }

  const fileName = file.name || '';
  const ext = fileName.split('.').pop().toLowerCase();

  // 1. JSON file handling
  if (ext === 'json') {
    const text = await file.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch (e) {
      throw new Error("Invalid JSON format");
    }

    let rows = [];
    if (Array.isArray(data)) {
      rows = data;
    } else if (data && Array.isArray(data.applications)) {
      rows = data.applications;
    } else if (data && Array.isArray(data.candidatures)) {
      rows = data.candidatures;
    } else if (data && Array.isArray(data.data)) {
      rows = data.data;
    } else if (data && typeof data === 'object') {
      // Find first array property
      const arrKey = Object.keys(data).find(k => Array.isArray(data[k]));
      if (arrKey) {
        rows = data[arrKey];
      }
    }

    if (!rows.length) {
      throw new Error("No application array found in JSON");
    }

    const applications = rows
      .map((row, idx) => mapRowToApplication(row, idx))
      .filter(Boolean);

    return {
      success: true,
      applications,
      format: 'JSON',
      fileName,
      totalRowsParsed: rows.length
    };
  }

  // 2. Excel (XLSX, XLS) or CSV / TSV handling via SheetJS
  const arrayBuffer = await file.arrayBuffer();
  const workbook = XLSX.read(arrayBuffer, { type: 'array', cellDates: true });
  
  if (!workbook.SheetNames || workbook.SheetNames.length === 0) {
    throw new Error("Empty spreadsheet");
  }

  // Read the first worksheet
  const firstSheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[firstSheetName];

  // Convert to JSON row objects
  const rawRows = XLSX.utils.sheet_to_json(worksheet, { defval: '', raw: false });

  if (!rawRows || rawRows.length === 0) {
    throw new Error("No data rows found in spreadsheet");
  }

  const applications = rawRows
    .map((row, idx) => mapRowToApplication(row, idx))
    .filter(Boolean);

  return {
    success: true,
    applications,
    format: ext.toUpperCase(),
    fileName,
    totalRowsParsed: rawRows.length
  };
}
