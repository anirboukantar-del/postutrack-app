/**
 * Master Prompts Configuration & Defaults for PostuTrack AI
 * Enables users to inspect, tailor, and restore the foundational instructions
 * given to AI models (Gemini, OpenAI, Anthropic, Ollama, etc.)
 */

export const DEFAULT_MASTER_CV_PROMPT = `Act as an expert recruiter and ATS resume optimization specialist. Analyze the job posting for "{companyName}" for the role of "{roleName}":

JOB DESCRIPTION / OFFRE D'EMPLOI:
{jobDescription}

CANDIDATE PROFILE & MASTER RESUME / PROFIL ET CV MAÎTRE:
Name : {candidateName}
Email : {candidateEmail}
Phone : {candidatePhone}
Location : {candidateLocation}
Master CV Content :
{candidateMasterCV}

{languageDirective}
{densityInstructions}
{modificationInstructions}
{keywordInstructions}
Skill categories rule: Main skills category MUST be named '{categorySkillsDefault}'. Other groups can be 'TOOLS', 'LANGUAGES' (or 'OUTILS', 'LANGUES' in French).
{customInstructions}

STRICT GENERATION RULES:
1. You MUST extract, structure, and include ALL professional experiences, education history, and skills from the Master CV into the JSON output. Under NO circumstance should "experiences", "education", or "skills" arrays be empty if data exists in the Master CV.
2. "summary" is a concise, professional 2-to-3 sentence introductory hook tailored to the position.
3. CRITICAL: Output ONLY the clean, final polished text. NEVER include word counts, notes in parentheses like "(43 mots respectés)", self-corrections, thoughts, or commentary ("No, wait", "Let's cleanly put...").
4. If the offer specifies contract duration/type/start date, mention it succinctly in the summary.
5. Sort professional experiences and education in reverse chronological order (most recent first).
6. Return ONLY a valid JSON object matching the schema.`;

export const DEFAULT_MASTER_LETTER_PROMPT = `Act as an expert career advisor. Write a tailored cover letter (maximum 1 single A4 page) for "{companyName}" for the position "{roleName}".

JOB DESCRIPTION:
{jobDescription}

CANDIDATE RESUME PROFILE:
{candidateMasterCV}

MASTER COVER LETTER (Style/Tone baseline):
{candidateMasterLetter}

{languageDirective}
{toneInstructions}
{customInstructions}

STRICT FORMAT RULES:
1. Do NOT include top headers (Candidate name, address, date) because they are formatted automatically by the layout. Start directly with the formal salutation (e.g. "Dear Hiring Manager," or "Madame, Monsieur,").
2. End with an appropriate formal closing and signature (e.g. "Sincerely, [Candidate Name]" or "Je vous prie d'agréer...").
3. Use clear paragraphs separated by double line breaks (\\n\\n).
4. Return ONLY valid JSON.`;
