// Cover letter paragraph formatting & structuring engine
// Ensures clean, well-ventilated, professional paragraphs regardless of LLM output format

/**
 * Normalizes and formats a cover letter into clean, well-spaced paragraphs.
 * Handles:
 * - Literal escaped newlines (\n or \\n)
 * - Single newlines instead of double newlines
 * - Completely unformatted single-block text (smart paragraph boundary detection)
 * - Ensures salutation and closing formulas are distinct paragraphs
 */
export function formatCoverLetterParagraphs(rawText, candidateName = '') {
  if (!rawText || typeof rawText !== 'string') return '';

  let text = rawText.trim();

  // 1. Normalize escaped newlines and line breaks
  text = text
    .replace(/\\r\\n/g, '\n')
    .replace(/\\n/g, '\n')
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n');

  // Strip accidental markdown code blocks (```json ... ``` or ```text)
  text = text.replace(/^```[a-z]*\s*/i, '').replace(/```$/g, '').trim();

  // If text is surrounded by JSON quotes: "..."
  if (text.startsWith('"') && text.endsWith('"') && text.length > 2) {
    try {
      text = JSON.parse(text);
    } catch (e) {
      text = text.slice(1, -1);
    }
  }

  // 2. Normalize and ensure double newlines around standard salutations
  const salutationRegex = /^(Madame,\s*Monsieur|Monsieur,\s*Madame|Monsieur|Madame|Chère\s+équipe[^,.\n]*|Dear\s+Hiring\s+Manager|Dear\s+Recruiter|Dear\s+Team|To\s+whom\s+it\s+may\s+concern)[,.:]?\s*/i;
  const salutationMatch = text.match(salutationRegex);
  if (salutationMatch) {
    const salutation = salutationMatch[1].trim() + (salutationMatch[0].includes(':') ? ':' : ',');
    const rest = text.substring(salutationMatch[0].length).trim();
    text = `${salutation}\n\n${rest}`;
  }

  // 3. Ensure double newlines before formal closings / politeness formulas
  const closingKeywords = [
    "Je vous prie d'agréer",
    "Je vous prie de recevoir",
    "Veuillez agréer",
    "Veuillez recevoir",
    "Recevez, Madame, Monsieur",
    "Dans l'attente de votre retour",
    "Dans l'attente d'une réponse",
    "En espérant que ma candidature",
    "Restant à votre entière disposition",
    "Je me tiens à votre entière disposition",
    "Je me tiens à votre disposition",
    "En vous remerciant par avance",
    "Sincerely,",
    "Sincerely yours,",
    "Best regards,",
    "Warm regards,",
    "Kind regards,",
    "Respectfully,",
    "Yours faithfully,"
  ];

  for (const kw of closingKeywords) {
    // If preceded by a period or exclamation and space
    const regex = new RegExp(`([.!?])\\s*(${kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'i');
    text = text.replace(regex, '$1\n\n$2');

    // If preceded by a single newline
    const regexWithNewline = new RegExp(`(?<!\n)\n(${kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'i');
    text = text.replace(regexWithNewline, '\n\n$1');
  }

  // 4. Ensure candidate signature at the end is separated by double newline
  if (candidateName && candidateName.trim()) {
    const cleanCand = candidateName.trim();
    const candRegex = new RegExp(`([.!?]|distinguées\.?|sincerely,?|regards,?)\\s*(${cleanCand.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})$`, 'i');
    text = text.replace(candRegex, '$1\n\n$2');
  }

  // 5. Check if the text is still a single solid block (fewer than 3 paragraphs)
  const paragraphCount = text.split(/\n\s*\n/).filter(p => p.trim().length > 0).length;
  if (paragraphCount < 3) {
    // If it has single newlines, promote lines that end with terminal punctuation into double newlines
    if (text.includes('\n')) {
      const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
      text = lines.join('\n\n');
    } else {
      // It has NO newlines at all (one continuous wall of text)
      // Break before common French/English paragraph transition starters
      const transitionStarters = [
        "Actuellement",
        "Titulaire d'un",
        "Diplômé de",
        "Fort d'une expérience",
        "Fort de mon parcours",
        "Au cours de mon parcours",
        "Au cours de mes",
        "Durant mes précédentes",
        "Tout au long de ma carrière",
        "Mon expérience en",
        "Mon profil correspond",
        "Rejoindre votre entreprise",
        "Rejoindre votre équipe",
        "Votre entreprise",
        "Votre projet",
        "Sensible aux valeurs",
        "Particulièrement intéressé",
        "Je suis vivement intéressé",
        "Je me permets de vous adresser",
        "C'est avec un grand intérêt",
        "C'est avec un vif intérêt",
        "Je me tiens à votre disposition",
        "Je serais ravi de",
        "C'est avec plaisir que je",
        "Dans l'attente de",
        "Je vous prie d'agréer",
        "Veuillez agréer",
        "I am writing to",
        "With over",
        "Having worked",
        "Throughout my career",
        "My background in",
        "I am particularly drawn to",
        "Your company's reputation",
        "Joining your team",
        "I would welcome the opportunity",
        "I look forward to",
        "Thank you for considering"
      ];

      for (const starter of transitionStarters) {
        const regex = new RegExp(`([.!?])\\s+(${starter}\\b)`, 'g');
        text = text.replace(regex, '$1\n\n$2');
      }
    }
  }

  // 6. Final cleanup: split into clean paragraphs and re-join with exactly \n\n
  const cleanedParagraphs = text
    .split(/\n{2,}/)
    .map(p => p.trim().replace(/[ \t]+/g, ' '))
    .filter(Boolean);

  return cleanedParagraphs.join('\n\n');
}

/**
 * Splits formatted cover letter text into an array of paragraph strings.
 */
export function getCoverLetterParagraphList(rawText, candidateName = '') {
  const formatted = formatCoverLetterParagraphs(rawText, candidateName);
  if (!formatted) return [];
  return formatted.split(/\n{2,}/).map(p => p.trim()).filter(Boolean);
}
