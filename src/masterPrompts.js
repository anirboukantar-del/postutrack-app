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

export const DEFAULT_MASTER_LETTER_PROMPT = `Act as an expert career advisor. Write a tailored, persuasive cover letter (maximum 1 single A4 page) for "{companyName}" for the position "{roleName}".

JOB DESCRIPTION:
{jobDescription}

CANDIDATE RESUME PROFILE:
{candidateMasterCV}

MASTER COVER LETTER (Style/Tone baseline):
{candidateMasterLetter}

{languageDirective}
{toneInstructions}
{customInstructions}

STRICT STRUCTURE & PARAGRAPH FORMAT RULES:
1. Do NOT include top headers (Candidate name, address, contact details, date) because they are already formatted automatically by the layout. Start directly with the formal salutation (e.g. "Madame, Monsieur," or "Dear Hiring Manager,").
2. Structure the letter into 4 to 5 distinct, well-ventilated paragraphs:
   - Paragraph 1: Salutation followed by strong hook (enthusiasm, role targeted, alignment).
   - Paragraph 2: Core competencies, key professional achievements, and value proposition relevant to the job.
   - Paragraph 3: Why this specific company/team, shared values, and mutual impact.
   - Paragraph 4: Proactive call to action (availability for an interview).
   - Paragraph 5: Formal closing formula (e.g. "Je vous prie d'agréer, Madame, Monsieur, l'expression de mes salutations distinguées." or "Sincerely,") followed by the candidate's name.
3. MANDATORY: Separate every single paragraph and section with DOUBLE LINE BREAKS (\\n\\n). NEVER merge the letter into a single continuous block of text.
4. Return ONLY valid JSON with key "coverLetter".`;
