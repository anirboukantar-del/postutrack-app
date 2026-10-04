import { getDemoCvLibrary } from './demoData';

/**
 * Checks if an object or string returned by the AI is actually an echoed schema definition
 * instead of a populated candidate resume.
 */
export function isSchemaDefinition(obj) {
  if (!obj) return false;
  if (typeof obj === 'string') {
    const trimmed = obj.trim();
    return trimmed.startsWith('{ "type": "OBJECT"') || 
           trimmed.startsWith('{"type":"OBJECT"') || 
           trimmed.includes('"type": "OBJECT"') ||
           trimmed.includes('"properties":');
  }
  if (typeof obj !== 'object') return false;
  if (obj.type === 'OBJECT' || obj.type === 'object') return true;
  if (obj.properties && (obj.properties.cv || obj.properties.matchScore || obj.properties.summary)) return true;
  if (typeof obj.cv === 'object' && obj.cv && (obj.cv.type === 'OBJECT' || obj.cv.properties)) return true;
  if (typeof obj.summary === 'string' && (obj.summary.includes('"type": "OBJECT"') || obj.summary.includes('"properties":'))) return true;
  return false;
}

/**
 * Parses raw text Master CV into a structured CV object with fullName, summary, experiences, education, skills.
 */
export function parseMasterCvToStructured(rawText = '', profile = {}) {
  const cleanText = (rawText || '').trim();
  const fullName = profile.fullName || 'Candidat';

  // 1. If it's John DEMO or contains TechNova Solutions, use the high-fidelity demo CV structure
  if (fullName.toLowerCase().includes('demo') || cleanText.includes('TechNova Solutions') || cleanText.includes('John DEMO')) {
    try {
      const demoCv = getDemoCvLibrary()[0]?.cv;
      if (demoCv) {
        return JSON.parse(JSON.stringify(demoCv));
      }
    } catch (e) {
      // fallback to manual parse below
    }
  }

  // 2. Default structured shell
  const result = {
    fullName: fullName,
    email: profile.email || '',
    phone: profile.phone || '',
    location: profile.location || '',
    website: profile.website || '',
    summary: '',
    experiences: [],
    education: [],
    skills: []
  };

  if (!cleanText) return result;

  const lines = cleanText.split('\n').map(l => l.trim()).filter(Boolean);
  let currentSection = ''; // 'summary', 'experience', 'education', 'skills'
  let currentExp = null;
  let currentEdu = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const upper = line.toUpperCase();

    // Section header detection
    if (/^(R[EÉ]SUM[EÉ]|PROFIL|PROFILE|ABOUT|SUMMARY|SYNTH[EÉ]SE)\b/i.test(upper)) {
      currentSection = 'summary';
      continue;
    }
    if (/^(EXP[EÉ]RIENCE|PARCOURS|EXPERIENCE|WORK EXPERIENCE|PROFESSIONAL EXPERIENCE)\b/i.test(upper)) {
      currentSection = 'experience';
      continue;
    }
    if (/^(FORMATION|EDUCATION|DIPL[OÔ]MES?|ACADEMIC|CURSUS)\b/i.test(upper)) {
      currentSection = 'education';
      continue;
    }
    if (/^(COMP[EÉ]TENCES?|SKILLS?|OUTILS|TOOLS|EXPERTISE|TECH)\b/i.test(upper)) {
      currentSection = 'skills';
      continue;
    }

    if (currentSection === 'summary') {
      if (!result.summary) {
        result.summary = line;
      } else {
        result.summary += ' ' + line;
      }
    } else if (currentSection === 'experience') {
      const isBullet = /^[\u2022\-\*\u25AA]\s*/.test(line);
      if (isBullet && currentExp) {
        currentExp.achievements.push(line.replace(/^[\u2022\-\*\u25AA]\s*/, '').trim());
      } else if (line.includes('|') || line.includes(' - ') || /\(\d{4}/.test(line)) {
        // Line like: "Role | Company, City (Dates)"
        const parts = line.split('|').map(s => s.trim());
        let role = parts[0] || 'Poste';
        let company = 'Entreprise';
        let period = 'Récent';

        if (parts.length > 1) {
          const second = parts[1];
          const dateMatch = second.match(/\(([^)]+)\)/);
          if (dateMatch) {
            period = dateMatch[1];
            company = second.replace(/\([^)]+\)/, '').replace(/,/g, '').trim();
          } else {
            company = second;
          }
        }

        currentExp = {
          role,
          company,
          period,
          achievements: []
        };
        result.experiences.push(currentExp);
      } else if (currentExp && !isBullet) {
        currentExp.achievements.push(line);
      }
    } else if (currentSection === 'education') {
      const isBullet = /^[\u2022\-\*\u25AA]\s*/.test(line);
      const cleanLine = line.replace(/^[\u2022\-\*\u25AA]\s*/, '').trim();
      if (!isBullet && (cleanLine.includes('Master') || cleanLine.includes('Licence') || cleanLine.includes('Bac') || cleanLine.includes('Diplôme') || cleanLine.includes('Degree') || cleanLine.includes('CPGE') || cleanLine.includes('Université') || cleanLine.includes('École'))) {
        currentEdu = {
          degree: cleanLine,
          school: 'Établissement',
          year: 'Diplômé',
          description: ''
        };
        result.education.push(currentEdu);
      } else if (currentEdu) {
        if (!currentEdu.description) {
          currentEdu.description = cleanLine;
        } else {
          currentEdu.description += ' ' + cleanLine;
        }
      }
    } else if (currentSection === 'skills') {
      const cleanLine = line.replace(/^[\u2022\-\*\u25AA]\s*/, '').trim();
      if (cleanLine.includes(':')) {
        const [cat, itemsStr] = cleanLine.split(':');
        const items = itemsStr.split(/[,/•]/).map(s => s.trim()).filter(Boolean);
        if (items.length > 0) {
          result.skills.push({
            category: cat.trim(),
            items
          });
        }
      } else {
        const items = cleanLine.split(/[,/•]/).map(s => s.trim()).filter(Boolean);
        if (items.length > 0) {
          result.skills.push({
            category: 'COMPÉTENCES',
            items
          });
        }
      }
    }
  }

  // Fallback defaults if sections were sparse
  if (result.experiences.length === 0) {
    result.experiences.push({
      role: 'Consultant / Lead',
      company: 'Mission professionnelle',
      period: '2022 - Présent',
      achievements: [
        'Pilotage de projets et alignement opérationnel avec les objectifs stratégiques.',
        'Mise en œuvre des meilleures pratiques et coordination pluridisciplinaire.'
      ]
    });
  }

  if (result.education.length === 0) {
    result.education.push({
      degree: 'Diplôme d\'études supérieures',
      school: 'Université / Grande École',
      year: 'Diplômé',
      description: 'Formation approfondie en ingénierie et méthodologies avancées.'
    });
  }

  if (result.skills.length === 0) {
    result.skills.push({
      category: 'COMPÉTENCES CLÉS',
      items: ['Gestion de projet', 'Leadership', 'Organisation', 'Rigueur', 'Adaptabilité']
    });
  }

  if (!result.summary) {
    result.summary = `Professionnel expérimenté fort de compétences solides, engagé dans la réussite des missions confiées et l'atteinte d'objectifs d'excellence.`;
  }

  return result;
}
