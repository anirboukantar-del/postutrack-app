import React, { useState, useEffect } from 'react';
import {
  Briefcase,
  CheckCircle,
  XCircle,
  Clock,
  Plus,
  LayoutDashboard,
  ListTodo,
  Settings,
  UserCheck,
  Sparkles,
  FileText,
  Download,
  Loader2,
  Upload,
  AlertTriangle,
  MessageSquare,
  HelpCircle,
  Layout,
  ExternalLink,
  Copy,
  Sun,
  Moon,
  Monitor
} from 'lucide-react';


const STATUS_COLORS = {
  'Postulé': 'bg-blue-100 text-blue-800',
  'En cours': 'bg-yellow-100 text-yellow-800',
  'Entretien': 'bg-purple-100 text-purple-800',
  'Offre': 'bg-green-100 text-green-800',
  'Refusé': 'bg-red-100 text-red-800',
};

function AddApplicationModal({ isOpen, onClose, onSave, editingApp, onGoToTailor }) {
  const [formData, setFormData] = useState({
    company: '', role: '', date: new Date().toISOString().split('T')[0], status: 'Postulé', type: 'CDI', location: '', url: ''
  });

  useEffect(() => {
    if (editingApp) {
      setFormData(editingApp);
    } else {
      setFormData({
        company: '', role: '', date: new Date().toISOString().split('T')[0], status: 'Postulé', type: 'CDI', location: '', url: ''
      });
    }
  }, [editingApp, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingApp) {
      onSave({ ...formData, id: editingApp.id }, true);
    } else {
      const newApp = { ...formData, id: Date.now() };
      onSave(newApp, false);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-md p-6 dark:text-white border dark:border-gray-700">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-800">{editingApp ? 'Modifier la candidature' : 'Ajouter une candidature'}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 dark:text-gray-300">
            <XCircle size={24} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Entreprise</label>
            <input required type="text" className="w-full p-2 border rounded-md bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white" 
              value={formData.company} onChange={e => setFormData({...formData, company: e.target.value})} placeholder="Ex: Google" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Poste</label>
            <input required type="text" className="w-full p-2 border rounded-md bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white" 
              value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})} placeholder="Ex: Développeur React" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Date</label>
              <input type="date" className="w-full p-2 border rounded-md bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white" 
                value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Type de contrat</label>
              <select className="w-full p-2 border rounded-md bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})}>
                <option value="CDI">CDI</option>
                <option value="CDD">CDD</option>
                <option value="Stage">Stage</option>
                <option value="Alternance">Alternance</option>
                <option value="Freelance">Freelance</option>
                <option value="Intérim">Intérim</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Statut</label>
            <select className="w-full p-2 border rounded-md bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})}>
              {Object.keys(STATUS_COLORS).map(status => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Lien de l'offre (URL)</label>
            <input type="url" className="w-full p-2 border rounded-md bg-white text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white" 
              value={formData.url || ''} onChange={e => setFormData({...formData, url: e.target.value})} placeholder="https://..." />
          </div>
          
          {editingApp && (
            <div className="pt-2">
              <button 
                type="button" 
                onClick={() => onGoToTailor(editingApp.id)} 
                className="w-full py-2 bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-md font-medium text-sm hover:bg-indigo-100 flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <Sparkles size={16} /> Voir / Adapter le CV
              </button>
            </div>
          )}

          <div className="pt-4 flex justify-end gap-2">
            <button type="button" onClick={onClose} className="px-4 py-2 border rounded-md text-gray-600 dark:text-gray-400 cursor-pointer">Annuler</button>
            <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md cursor-pointer">Enregistrer</button>
          </div>
        </form>
      </div>
    </div>
  );
}


export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingApplication, setEditingApplication] = useState(null);

  // --- 1. SAUVEGARDE DES CANDIDATURES ---
  const [applications, setApplications] = useState(() => {
    try {
      const saved = localStorage.getItem('postutrack_applications');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return [];
  });

  useEffect(() => {
    try {
      localStorage.setItem('postutrack_applications', JSON.stringify(applications));
    } catch (e) {
      console.error(e);
    }
  }, [applications]);

  // --- 2. SAUVEGARDE DU PROFIL ---
  const [profile, setProfile] = useState(() => {
    try {
      const saved = localStorage.getItem('postutrack_profile');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return {
      fullName: 'Jean Dupont',
      email: '',
      phone: '',
      location: '',
      website: '',
      masterCV: ''
    };
  });

  const [savedNotice, setSavedNotice] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem('postutrack_profile', JSON.stringify(profile));
    } catch (e) {
      console.error(e);
    }
  }, [profile]);

  // --- 3. SAUVEGARDE DES CLÉS API ET DU MODÈLE ---
  const [apiKey, setApiKey] = useState(() => {
    try { return localStorage.getItem('postutrack_apikey') || ''; } catch (e) { return ''; }
  });
  const [openAiKey, setOpenAiKey] = useState(() => {
    try { return localStorage.getItem('postutrack_openaikey') || ''; } catch (e) { return ''; }
  });
  const [anthropicKey, setAnthropicKey] = useState(() => {
    try { return localStorage.getItem('postutrack_anthropickey') || ''; } catch (e) { return ''; }
  });
  const [selectedAiModel, setSelectedAiModel] = useState(() => {
    try { return localStorage.getItem('postutrack_aimodel') || 'gemini'; } catch (e) { return 'gemini'; }
  });

  useEffect(() => {
    try {
      localStorage.setItem('postutrack_apikey', apiKey);
      localStorage.setItem('postutrack_openaikey', openAiKey);
      localStorage.setItem('postutrack_anthropickey', anthropicKey);
      localStorage.setItem('postutrack_aimodel', selectedAiModel);
    } catch (e) {
      console.error(e);
    }
  }, [apiKey, openAiKey, anthropicKey, selectedAiModel]);

  useEffect(() => {
    try {
      localStorage.setItem('postutrack_apikey', apiKey);
    } catch (e) {
      console.error(e);
    }
  }, [apiKey]);

  const [selectedAppId, setSelectedAppId] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [jobUrl, setJobUrl] = useState('');
  const [isExtracting, setIsExtracting] = useState(false);
  
  // AI CV States
  const [baseCV, setBaseCV] = useState(profile.masterCV || '');
  const [isLoadingAI, setIsLoadingAI] = useState(false);
  const [aiResult, setAiResult] = useState(null);
  const [aiError, setAiError] = useState('');
  const [isPrinting, setIsPrinting] = useState(false);
  
  const [cvDensity, setCvDensity] = useState('expanded');
  const [modificationStrategy, setModificationStrategy] = useState('balanced');
  const [keywordDensity, setKeywordDensity] = useState('moderate');
  const [customInstruction, setCustomInstruction] = useState('');

  // AI Letter States
  const [generationMode, setGenerationMode] = useState('cv'); // 'cv' or 'letter'
  const [baseLetter, setBaseLetter] = useState(profile.masterLetter || '');
  const [letterTone, setLetterTone] = useState('professional');
  const [isCopied, setIsCopied] = useState(false);

  // --- SAUVEGARDE ET RESTAURATION ---
  const handleExportData = () => {
    // On rassemble les données (on exclut les clés API par sécurité)
    const backup = {
      applications: applications,
      profile: profile
    };
    
    // On crée un fichier JSON téléchargeable
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `PostuTrack_Backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportData = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const backup = JSON.parse(event.target.result);
        if (backup.applications) setApplications(backup.applications);
        if (backup.profile) setProfile(backup.profile);
        
        // Afficher le message de succès
        setSavedNotice(true);
        setTimeout(() => setSavedNotice(false), 3000);
      } catch (err) {
        alert("Fichier de sauvegarde invalide ou corrompu.");
      }
    };
    reader.readAsText(file);
    // On réinitialise l'input pour pouvoir réimporter le même fichier si besoin
    e.target.value = ''; 
  };

  // --- 4. GESTION DU THÈME SOMBRE DIRECTE ---
  const [theme, setTheme] = useState(() => {
    try { return localStorage.getItem('postutrack_theme') || 'light'; } catch (e) { return 'light'; }
  });

  const toggleTheme = () => {
    const nextTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(nextTheme);
    try { localStorage.setItem('postutrack_theme', nextTheme); } catch (e) {}
    
    if (nextTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  // S'assure que le thème est bien appliqué au chargement
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const handleCopyLetter = () => {
    if (!aiResult?.coverLetter) return;
    const letterText = `${profile.fullName || 'Candidat'}
${profile.location || ''}
${profile.email || ''}
${profile.phone || ''}

${profile.location?.split(',')[0] || 'Paris'}, le ${new Date().toLocaleDateString()}

${aiResult.coverLetter}`;

    navigator.clipboard.writeText(letterText).then(() => {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    });
  };

  const [isCoachLoading, setIsCoachLoading] = useState(false);
  const [coachError, setCoachError] = useState('');
  const [coachResult, setCoachResult] = useState(null);
  const [coachAppId, setCoachAppId] = useState('');

  useEffect(() => {
    if (!baseCV || baseCV === profile.masterCV) setBaseCV(profile.masterCV || '');
  }, [profile.masterCV]);

  useEffect(() => {
    if (!baseLetter || baseLetter === profile.masterLetter) setBaseLetter(profile.masterLetter || '');
  }, [profile.masterLetter]);

  // Sync selectedApp URL to jobUrl if empty
  useEffect(() => {
    if (selectedAppId && !jobUrl) {
      const app = applications.find(a => a.id.toString() === selectedAppId.toString());
      if (app && app.url) {
        setJobUrl(app.url);
      }
    }
  }, [selectedAppId]);

  const getInitials = (name) => {
    if (!name || typeof name !== 'string') return 'JD';
    return name.split(' ').map(n => n[0]).filter(Boolean).join('').substring(0, 2).toUpperCase() || 'JD';
  };

  const triggerPrint = () => {
    setIsPrinting(true);
    setTimeout(() => {
      window.print();
      setIsPrinting(false);
    }, 300);
  };

  useEffect(() => {
    if (!document.getElementById('pdfjs-script')) {
      const script = document.createElement('script');
      script.id = 'pdfjs-script';
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.min.js';
      script.onload = () => {
        if (window.pdfjsLib) {
          window.pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js';
        }
      };
      document.head.appendChild(script);
    }

    if (!document.getElementById('html2pdf-script')) {
      const script = document.createElement('script');
      script.id = 'html2pdf-script';
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js';
      document.head.appendChild(script);
    }
  }, []);

  const totalApplications = applications.length;
  const interviewsCount = applications.filter(app => app.status === 'Entretien').length;
  const offersCount = applications.filter(app => app.status === 'Offre').length;

  const parseAndFillProfile = (text) => {
    const emailMatch = text.match(/[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+/);
    const email = emailMatch ? emailMatch[0] : '';

    const phoneMatch = text.match(/(?:(?:\+|00)33|0)\s*[1-9](?:[\s.-]*\d{2}){4}/);
    const phone = phoneMatch ? phoneMatch[0] : '';

    const webMatch = text.match(/(?:https?:\/\/)?(?:www\.)?(?:github\.com|linkedin\.com\/in|gitlab\.com|portfolio)[^\s]+/i);
    const website = webMatch ? webMatch[0] : '';

    const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
    let fullName = '';
    
    for (let i = 0; i < Math.min(10, lines.length); i++) {
      const line = lines[i];
      const isEmail = line.includes('@');
      const hasNumbers = /\d/.test(line);
      const isURL = line.toLowerCase().includes('http') || line.toLowerCase().includes('www') || line.toLowerCase().includes('linkedin');
      const isBlacklisted = /curriculum vitae|profil|cv|stage|emploi|alternance|étudiant/i.test(line);
      const wordCount = line.split(/\s+/).length;
      
      if (line.length > 2 && line.length < 40 && wordCount >= 1 && wordCount <= 4 && !isEmail && !hasNumbers && !isURL && !isBlacklisted) {
        if (/^[a-zA-ZÀ-ÿ\s-]+$/.test(line)) {
          fullName = line;
          break; 
        }
      }
    }

    if (!fullName) {
      const nameMatch = text.match(/\b([A-Z][a-zÀ-ÿ-]+(?:\s+[A-ZÀ-Ÿ-]{2,})+)\b/);
      if (nameMatch) {
        fullName = nameMatch[1].trim();
      }
    }

    setProfile(prev => ({
      ...prev,
      masterCV: text,
      email: email || prev.email,
      phone: phone || prev.phone,
      website: website || prev.website,
      fullName: fullName || prev.fullName
    }));
    setBaseCV(text);
  };

  const handleFileUpload = async (e, targetStateSetter) => {
    const file = e.target.files[0];
    if (!file) return;
    
    if (file.type === 'application/pdf') {
      if (!window.pdfjsLib) {
        if (targetStateSetter === setProfile) {
          setProfile(p => ({ ...p, masterCV: "Chargement de la librairie PDF en cours..." }));
        } else {
          targetStateSetter("Chargement de la librairie PDF en cours...");
        }
        return;
      }
      const reader = new FileReader();
      reader.onload = async (event) => {
        try {
          const typedarray = new Uint8Array(event.target.result);
          const pdf = await window.pdfjsLib.getDocument(typedarray).promise;
          let fullText = "";
          for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const textContent = await page.getTextContent();
            
            let pageText = "";
            let lastY = -1;
            
            for (const item of textContent.items) {
              if (lastY !== -1 && Math.abs(lastY - item.transform[5]) > 4) {
                pageText += "\n";
              } else if (lastY !== -1) {
                pageText += " "; 
              }
              pageText += item.str;
              lastY = item.transform[5];
            }
            
            fullText += pageText + "\n\n";
          }
          if (targetStateSetter === setProfile) {
            parseAndFillProfile(fullText);
          } else {
            targetStateSetter(fullText);
          }
        } catch (error) {
          console.error(error);
        }
      };
      reader.readAsArrayBuffer(file);
    } else {
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target.result;
        if (targetStateSetter === setProfile) parseAndFillProfile(text);
        else targetStateSetter(text);
      };
      reader.readAsText(file);
    }
  };

  const handleExtractUrl = async () => {
    if (!jobUrl) return;
    setIsExtracting(true);
    setJobDescription("Extraction de la page web via l'IA en cours...");
    
    try {
      const proxyUrl = `https://r.jina.ai/${encodeURIComponent(jobUrl)}`;
      const response = await fetch(proxyUrl, {
        headers: { 'Accept': 'text/plain' }
      });
      
      if (!response.ok) throw new Error("Erreur réseau ou blocage du site");
      
      let text = await response.text();
      
      text = text.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1'); 
      text = text.replace(/^(Accueil|Connexion|Emplois|Rechercher|Menu).*$/gim, ''); 
      text = text.replace(/(\n\s*){3,}/g, '\n\n'); 
      
      if (text && text.length > 100) {
        setJobDescription(text.trim().substring(0, 10000));
      } else {
        setJobDescription("Texte extrait trop court. Veuillez copier-coller manuellement.");
      }
    } catch (e) {
      console.error(e);
      setJobDescription("Échec de l'extraction automatisée (blocage antibot). Veuillez copier-coller le texte de l'annonce manuellement.");
    } finally {
      setIsExtracting(false);
    }
  };

  const handleGenerateAI = async (e) => {
    e.preventDefault();
    
    // Vérification de la bonne clé selon le modèle sélectionné
    if (selectedAiModel === 'gemini' && !apiKey.trim()) return setAiError("Veuillez configurer votre clé API Gemini.");
    if (selectedAiModel === 'openai' && !openAiKey.trim()) return setAiError("Veuillez configurer votre clé API OpenAI.");
    if (selectedAiModel === 'anthropic' && !anthropicKey.trim()) return setAiError("Veuillez configurer votre clé API Anthropic.");

    if (!jobDescription.trim()) {
      setAiError("Veuillez coller la description de l'offre d'emploi avant de générer.");
      return;
    }
    
    setIsLoadingAI(true);
    setAiResult(null);
    setAiError('');

    const targetApp = applications.find(a => a.id.toString() === selectedAppId);
    const companyName = targetApp ? targetApp.company : "l'entreprise";
    const roleName = targetApp ? targetApp.role : "le poste";

    const customPromptStr = customInstruction.trim() ? `\nCONSIGNES SUPPLÉMENTAIRES DU CANDIDAT :\n${customInstruction}\n` : "";

    try {
      let prompt = "";
      let responseSchema = {};

      if (generationMode === 'cv') {
        const densityInstructions = cvDensity === 'expanded'
          ? "Consigne CV : Rédige des descriptions riches (3 à 4 puces par expérience). Objectif : étoffer un parcours court pour remplir harmonieusement une page entière, sans jamais la dépasser."
          : cvDensity === 'compact'
          ? "Consigne CV : Sois extrêmement CONCIS et synthétique. Maximum 1 à 2 puces très courtes par expérience. Objectif : faire tenir un long parcours sur UNE SEULE PAGE A4 stricte."
          : "Consigne CV : Équilibre le contenu. Ajuste dynamiquement le nombre de mots et de puces pour que le résultat final remplisse exactement UNE SEULE PAGE A4, ni plus, ni moins.";

        const modificationInstructions = modificationStrategy === 'strict'
          ? "Consigne Modification : CONSERVATION STRICTE. Ne supprime AUCUNE compétence ou expérience du CV maître. Ajoute uniquement les nouveautés pertinentes."
          : modificationStrategy === 'rewrite'
          ? "Consigne Modification : ADAPTATION TOTALE. Filtre et supprime les infos hors-sujet du CV maître pour coller à 100% à l'offre."
          : "Consigne Modification : FUSION ÉQUILIBRÉE. Adapte l'existant sans perdre l'essence du profil.";

        const keywordInstructions = keywordDensity === 'high'
          ? "Consigne ATS : INJECTION MAXIMALE. Insère autant de mots-clés de l'offre que possible dans les descriptions d'expériences et compétences."
          : keywordDensity === 'low'
          ? "Consigne ATS : INJECTION SUBTILE. Ajoute uniquement 2 ou 3 mots-clés essentiels, de manière très naturelle."
          : "Consigne ATS : INJECTION MODÉRÉE. Ajoute les mots-clés principaux de l'offre si cela a du sens.";

        const categoryInstructions = "Consigne Structure Compétences : Regroupe OBLIGATOIREMENT les compétences en catégories. La catégorie principale DOIT strictement s'appeler 'COMPÉTENCES'. Les autres peuvent être 'OUTILS', 'LANGUES'. N'invente pas d'autres noms.";

        prompt = `Agis en tant qu'expert en recrutement et ATS. Analyse l'offre d'emploi pour "${companyName}" au poste de "${roleName}":
        
DESCRIPTION DE L'OFFRE:
${jobDescription}

PROFIL & CV MAÎTRE:
Nom : ${profile.fullName}
Email : ${profile.email}
Téléphone : ${profile.phone}
Localisation : ${profile.location}
Contenu CV Maître :
${baseCV || profile.masterCV}

${densityInstructions}
${modificationInstructions}
${keywordInstructions}
${categoryInstructions}
${customPromptStr}

RÈGLES STRICTES ET IMPÉRATIVES DE GÉNÉRATION (ANTI-HALLUCINATION CRITIQUE) :
1. Le champ "analysisSummary" DOIT faire 3 phrases MAXIMUM.
2. Le champ "summary" (votre profil en haut du CV) DOIT faire 3 phrases MAXIMUM. LONGUEUR MAXIMALE DE 45 MOTS.
3. OBLIGATION ABSOLUE : Si l'offre spécifie un type de contrat, durée ou date de début, tu DOIS l'indiquer dans ce "summary" (ex: "À la recherche d'un stage de 6 mois à partir de septembre...").
4. INTERDICTION ABSOLUE de répéter la même phrase ou les mêmes mots en boucle (ex: ne répète pas le nom de l'entreprise 50 fois). Si tu commences à boucler, arrête-toi immédiatement.
5. ORDRE STRICT : Tu DOIS impérativement trier les expériences professionnelles et les formations de la plus récente à la plus ancienne (ordre anti-chronologique), en respectant l'ordre du CV maître.
6. Renvoie UNIQUEMENT un JSON valide sans aucun autre texte.`;

        responseSchema = {
          type: "OBJECT",
          properties: {
            matchScore: { type: "INTEGER" },
            analysisSummary: { type: "STRING" },
            injectedKeywords: { type: "ARRAY", items: { type: "STRING" } },
            cv: {
              type: "OBJECT",
              properties: {
                fullName: { type: "STRING" },
                summary: { type: "STRING" },
                experiences: {
                  type: "ARRAY",
                  items: {
                    type: "OBJECT",
                    properties: {
                      role: { type: "STRING" },
                      company: { type: "STRING" },
                      period: { type: "STRING" },
                      achievements: { type: "ARRAY", items: { type: "STRING" } }
                    }
                  }
                },
                education: {
                  type: "ARRAY",
                  items: {
                    type: "OBJECT",
                    properties: {
                      degree: { type: "STRING" },
                      school: { type: "STRING" },
                      year: { type: "STRING" },
                      description: { type: "STRING" }
                    }
                  }
                },
                skills: { 
                  type: "ARRAY", 
                  items: { 
                    type: "OBJECT", 
                    properties: {
                      category: { type: "STRING" },
                      items: { type: "ARRAY", items: { type: "STRING" } }
                    } 
                  } 
                }
              }
            }
          }
        };
      } else {
        const toneInstructions = letterTone === 'audacious'
          ? "Ton audacieux, percutant et direct."
          : letterTone === 'original'
          ? "Ton original, créatif et narratif."
          : "Ton professionnel, structuré, formel et rigoureux.";

        prompt = `Agis en tant qu'expert en recrutement. Rédige une lettre de motivation (MAXIMUM 1 page) pour l'entreprise "${companyName}" au poste de "${roleName}".
        
DESCRIPTION DE L'OFFRE:
${jobDescription}

PROFIL DU CANDIDAT (Base CV) :
${baseCV || profile.masterCV}

LETTRE DE MOTIVATION MAÎTRE (Base de style/contenu) :
${baseLetter || profile.masterLetter || "Aucune base, génère à partir du CV."}

CONSIGNES :
${toneInstructions}
${customPromptStr}

RÈGLES STRICTES ET IMPÉRATIVES (ANTI-HALLUCINATION CRITIQUE) :
1. Ne mets PAS l'en-tête (Nom, adresse, date). Commence DIRECTEMENT par la salutation (ex: "Madame, Monsieur,").
2. Termine IMPÉRATIVEMENT par une formule de politesse formelle de fin de lettre (ex: "Je vous prie d'agréer...").
3. Fais des paragraphes clairs séparés par des sauts de ligne (\\n\\n).
4. INTERDICTION ABSOLUE de répéter les mêmes phrases en boucle.
5. Renvoie UNIQUEMENT un JSON valide.`;

        responseSchema = {
          type: "OBJECT",
          properties: {
            coverLetter: { type: "STRING" }
          }
        };
      }

      // --- DÉBUT DU BLOC MULTI-IA ---
      let text = "";

      // OpenAI et Anthropic ont besoin qu'on leur injecte le schéma JSON directement dans le texte du prompt
      const finalPrompt = selectedAiModel !== 'gemini' 
        ? `${prompt}\n\nSchéma JSON STRICT à respecter impérativement pour ta réponse :\n${JSON.stringify(responseSchema, null, 2)}` 
        : prompt;

      if (selectedAiModel === 'gemini') {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${apiKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: finalPrompt }] }],
            generationConfig: { temperature: 0.1, responseMimeType: "application/json", responseSchema }
          })
        });
        const result = await response.json();
        if (!response.ok) throw new Error(result.error?.message || "Erreur de connexion à Gemini.");
        text = result?.candidates?.[0]?.content?.parts?.[0]?.text;

      } else if (selectedAiModel === 'openai') {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json', 
            'Authorization': `Bearer ${openAiKey}` 
          },
          body: JSON.stringify({
            model: "gpt-4o-mini", // Modèle le plus rapide et abordable d'OpenAI
            temperature: 0.1,
            response_format: { type: "json_object" }, // Force OpenAI à renvoyer un JSON
            messages: [{ role: "user", content: finalPrompt }]
          })
        });
        const result = await response.json();
        if (!response.ok) throw new Error(result.error?.message || "Erreur de connexion à OpenAI.");
        text = result.choices[0].message.content;

      } else if (selectedAiModel === 'anthropic') {
        const response = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': anthropicKey,
            'anthropic-version': '2023-06-01',
            'anthropic-dangerously-allow-browser': 'true' // Requis par Anthropic pour les appels depuis le navigateur
          },
          body: JSON.stringify({
            model: "claude-3-haiku-20240307", // Modèle rapide de Claude
            max_tokens: 4096,
            temperature: 0.1,
            system: "Tu dois renvoyer UNIQUEMENT un objet JSON valide, sans aucun texte avant ou après.",
            messages: [{ role: "user", content: finalPrompt }]
          })
        });
        const result = await response.json();
        if (!response.ok) throw new Error(result.error?.message || "Erreur de connexion à Anthropic.");
        text = result.content[0].text;
      }
      // --- FIN DU BLOC MULTI-IA ---

      if (text) {
        let parsed;
        text = text.trim();
        if (text.startsWith('```json')) text = text.substring(7);
        if (text.startsWith('```')) text = text.substring(3);
        if (text.endsWith('```')) text = text.substring(0, text.length - 3);
        text = text.trim();

        try {
          parsed = JSON.parse(text);
        } catch (e) {
          try {
            const match = text.match(/\{[\s\S]*\}/);
            if (match) parsed = JSON.parse(match[0]);
            else throw e;
          } catch (e2) {
            console.error("Texte brut reçu de l'IA :", text);
            throw new Error("L'IA a généré un JSON invalide. Essayez de relancer.");
          }
        }
        
        if (parsed.cv) {
          parsed.cv.fullName = profile.fullName;
          parsed.cv.email = profile.email;
          parsed.cv.phone = profile.phone;
          parsed.cv.location = profile.location;
          parsed.cv.website = profile.website;
        }
        setAiResult(parsed);
      } else {
        throw new Error("L'IA n'a renvoyé aucune donnée.");
      }
    } catch (err) {
      console.error(err);
      setAiError(`Erreur lors de la génération : ${err.message}`);
    } finally {
      setIsLoadingAI(false);
    }
  };

  const handleExportRenderCV = () => {
    if (!aiResult || !aiResult.cv) return;
    const cv = aiResult.cv;
    let yaml = `cv:\n  name: "${cv.fullName}"\n  location: "${cv.location}"\n  email: "${cv.email}"\n  phone: "${cv.phone}"\n`;
    const blob = new Blob([yaml], { type: 'text/yaml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `CV_rendercv.yaml`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const renderCVTemplate = () => {
    const cv = aiResult?.cv;
    if (!cv) return null;

    const displayName = cv.fullName || profile.fullName || 'Candidat';
    const displayLocation = cv.location || profile.location;
    const displayEmail = cv.email || profile.email;
    const displayPhone = cv.phone || profile.phone;
    const displayWebsite = cv.website || profile.website;

    let structuredSkills = [];
    if (cv.skills && cv.skills.length > 0) {
      if (typeof cv.skills[0] === 'string') {
        structuredSkills = [{ category: 'COMPÉTENCES', items: cv.skills }];
      } else {
        structuredSkills = cv.skills;
      }
    }

    return (
      <div className="w-full flex justify-center bg-gray-100 p-8 overflow-x-auto print:p-0 print:bg-white print:overflow-visible">
        {/* Style global injecté pour forcer le format A4 strict sans marge d'impression parasite */}
        <style dangerouslySetInnerHTML={{__html: `
          @media print {
            @page {
              size: A4 portrait;
              margin: 0mm;
            }
            body {
              margin: 0;
              background-color: white !important;
            }
          }
        `}} />

        <div 
          id="cv-render" 
          className="bg-white border border-gray-300 p-10 w-[210mm] max-w-[210mm] box-border shadow-lg text-black font-serif select-text print:border-none print:shadow-none print:p-8 print:m-0 print:w-[210mm] print:h-[297mm] print:absolute print:inset-0 flex flex-col gap-4"
          style={{ 
            userSelect: 'text', 
            WebkitUserSelect: 'text', 
            pageBreakAfter: 'avoid', 
            breakAfter: 'avoid',
            pageBreakInside: 'avoid',
            breakInside: 'avoid'
          }}
        >
          {/* En-tête */}
          <div className="text-center mb-1">
            <h1 className="text-3xl font-normal mb-1">{displayName}</h1>
            <div className="text-[12px] flex justify-center items-center gap-3 flex-wrap text-gray-700 dark:text-gray-300">
              {displayLocation && <span>{displayLocation}</span>}
              {displayEmail && <span>| {displayEmail}</span>}
              {displayPhone && <span>| {displayPhone}</span>}
              {displayWebsite && <span>| {displayWebsite}</span>}
            </div>
          </div>
          
          {/* Profil / Résumé */}
          {cv.summary && (
            <div>
              <p className="text-[12.5px] leading-relaxed text-justify">{cv.summary}</p>
            </div>
          )}

          {/* Expériences */}
          {cv.experiences && cv.experiences.length > 0 && (
            <div>
              <h3 className="text-[13.5px] font-bold uppercase border-b-2 border-black mb-2 pb-0.5 tracking-wider">Expérience Professionnelle</h3>
              <div className="flex flex-col gap-3">
                {cv.experiences.map((exp, idx) => (
                  <div key={idx}>
                    <div className="flex justify-between items-baseline mb-0.5">
                      <div className="font-bold text-[13px]">{exp.company}</div>
                      <div className="text-[12px] text-gray-700 dark:text-gray-300">{exp.period}</div>
                    </div>
                    <div className="italic text-[12.5px] mb-0.5 text-gray-800">{exp.role}</div>
                    <ul className="list-disc list-inside text-[12px] space-y-0.5 pl-1.5 text-gray-900">
                      {exp.achievements?.map((ach, i) => <li key={i} className="leading-snug">{ach}</li>)}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Formation */}
          {cv.education && cv.education.length > 0 && (
            <div>
              <h3 className="text-[13.5px] font-bold uppercase border-b-2 border-black mb-2 pb-0.5 tracking-wider">Formation</h3>
              <div className="flex flex-col gap-2.5">
                {cv.education.map((edu, idx) => (
                  <div key={idx}>
                    <div className="flex justify-between items-baseline mb-0.5">
                      <strong className="text-[13px]">{edu.school}</strong>
                      <span className="text-[12px] text-gray-700 dark:text-gray-300">{edu.year}</span>
                    </div>
                    <div className="italic text-[12.5px] text-gray-800">{edu.degree}</div>
                    {edu.description && <p className="text-[12px] text-gray-700 dark:text-gray-300 mt-0.5 leading-snug">{edu.description}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Compétences */}
          {structuredSkills.length > 0 && (
            <div>
              <h3 className="text-[13.5px] font-bold uppercase border-b-2 border-black mb-2 pb-0.5 tracking-wider">Compétences</h3>
              <div className="flex flex-col gap-1.5 text-[12px] w-full">
                {structuredSkills.map((group, idx) => (
                  <div key={idx} className="flex flex-row items-start">
                    <h4 className="font-bold uppercase w-[160px] shrink-0 text-right pr-4 leading-tight pt-[2px]">{group.category}</h4>
                    <div className="text-gray-800 leading-snug flex-1">
                      {group.items?.join(' • ')}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
        </div>
      </div>
    );
  };

  const renderSidebar = () => (
    <aside className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 h-screen hidden md:flex flex-col sticky top-0 print:hidden transition-colors duration-200">
      <div className="p-6">
        <h1 className="text-2xl font-bold text-blue-600 dark:text-blue-400 flex items-center gap-2">
          PostuTrack
        </h1>
      </div>
      <nav className="flex-1 px-4 space-y-2">
        <button onClick={() => setActiveTab('dashboard')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${activeTab === 'dashboard' ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-500 font-medium' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700'}`}>
          <LayoutDashboard size={20} /> Tableau de bord
        </button>
        <button onClick={() => setActiveTab('applications')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${activeTab === 'applications' ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-500 font-medium' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700'}`}>
          <ListTodo size={20} /> Mes Candidatures
        </button>
        <button onClick={() => setActiveTab('tailor')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${activeTab === 'tailor' ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-500 font-medium' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700'}`}>
          <Sparkles size={20} className="text-amber-500" /> Adaptateur CV & IA
        </button>
        <button onClick={() => setActiveTab('profile')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${activeTab === 'profile' ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-500 font-medium' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700'}`}>
          <UserCheck size={20} className="text-emerald-500" /> Mon Profil
        </button>
      </nav>
    </aside>
  );

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-gray-900 font-sans flex text-gray-900 dark:text-gray-100 transition-colors duration-200">
      {renderSidebar()}
      <main className="flex-1 flex flex-col min-w-0">
        <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-20 px-6 py-4 flex justify-between items-center print:hidden transition-colors duration-200">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white capitalize">{activeTab === 'tailor' ? 'Adaptateur CV & IA' : activeTab}</h2>
          <div className="flex items-center gap-4"><div className="flex items-center gap-4">
            
            {/* BOUTON DU THÈME */}
            <button 
  onClick={toggleTheme} 
  className="p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors flex items-center justify-center cursor-pointer"
  title="Changer de thème"
>
  {theme === 'dark' ? <Sun size={20} className="text-yellow-400" /> : <Moon size={20} />}
</button>

            <div onClick={() => setActiveTab('profile')} className="flex items-center gap-2 cursor-pointer bg-blue-50 dark:bg-blue-900/30 dark:bg-gray-800 px-3 py-1.5 rounded-full border border-blue-100 dark:border-gray-700 hover:bg-blue-100 dark:hover:bg-gray-700 transition-colors">
              <div className="w-7 h-7 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-xs">
                {getInitials(profile.fullName)}
              </div>
              <span className="text-xs font-semibold text-blue-900 dark:text-blue-400 dark:text-gray-200">{profile.fullName || 'Utilisateur'}</span>
            </div>
          </div>
          </div>
        </header>

        <div className="flex-1 p-6 overflow-auto">
          {activeTab === 'dashboard' && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 flex items-center gap-4">
                <div className="p-3 bg-blue-100 text-blue-600 dark:text-blue-400 rounded-lg"><Briefcase size={24} /></div>
                <div><p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Candidatures</p><p className="text-3xl font-bold text-gray-800 dark:text-white">{totalApplications}</p></div>
              </div>
              <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 flex items-center gap-4">
                <div className="p-3 bg-purple-100 text-purple-600 rounded-lg"><Clock size={24} /></div>
                <div><p className="text-sm font-medium text-gray-500 dark:text-gray-400">Entretiens</p><p className="text-3xl font-bold text-gray-800 dark:text-white">{interviewsCount}</p></div>
              </div>
              <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 flex items-center gap-4">
                <div className="p-3 bg-green-100 text-green-600 rounded-lg"><CheckCircle size={24} /></div>
                <div><p className="text-sm font-medium text-gray-500 dark:text-gray-400">Offres reçues</p><p className="text-3xl font-bold text-gray-800 dark:text-white">{offersCount}</p></div>
              </div>
            </div>
          )}

          {activeTab === 'applications' && (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden transition-colors">
              <div className="p-4 border-b dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 flex justify-between items-center">
                <h3 className="text-lg font-bold text-gray-800 dark:text-white">Mes Candidatures</h3>
                <button onClick={() => { setEditingApplication(null); setIsAddModalOpen(true); }} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 cursor-pointer">
                  + Nouvelle Candidature
                </button>
              </div>
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-100 dark:bg-gray-900 text-gray-600 dark:text-gray-400 dark:text-gray-300 text-xs uppercase tracking-wider">
                    <th className="p-3">Entreprise</th>
                    <th className="p-3">Poste</th>
                    <th className="p-3">Contrat</th>
                    <th className="p-3">Date</th>
                    <th className="p-3">Statut</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700 text-sm">
                  {applications.map(app => (
                    <tr key={app.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                      <td className="p-3 font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                        {app.company}
                        {app.url && <a href={app.url} target="_blank" rel="noreferrer" className="text-blue-500 hover:text-blue-700 dark:text-blue-500"><ExternalLink size={14} /></a>}
                      </td>
                      <td className="p-3 text-gray-700 dark:text-gray-300">{app.role}</td>
                      <td className="p-3"><span className="px-2.5 py-0.5 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-full text-xs font-medium border">{app.type || 'CDI'}</span></td>
                      <td className="p-3 text-gray-500">{app.date}</td>
                      <td className="p-3">
                        <select
                          value={app.status}
                          onChange={(e) => setApplications(applications.map(item => item.id === app.id ? { ...item, status: e.target.value } : item))}
                          className={`px-2.5 py-1 rounded-full text-xs font-semibold cursor-pointer outline-none appearance-none text-center hover:opacity-80 transition-opacity ${STATUS_COLORS[app.status]}`}
                          style={{ textAlignLast: 'center' }}
                        >
                          {Object.keys(STATUS_COLORS).map(status => (
                            <option key={status} value={status} className="bg-white text-gray-900 font-medium">
                              {status}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="p-3 text-right space-x-2">
                        <button onClick={() => { setEditingApplication(app); setIsAddModalOpen(true); }} className="px-2.5 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 dark:text-gray-700 rounded text-xs font-medium cursor-pointer">Modifier</button>
                        <button onClick={() => setApplications(applications.filter(item => item.id !== app.id))} className="px-2.5 py-1 bg-red-50 dark:bg-red-900/30 hover:bg-red-100 dark:hover:bg-red-900/50 text-red-600 dark:text-red-400 rounded text-xs font-medium cursor-pointer">Supprimer</button>
                      </td>
                    </tr>
                  ))}
                  {applications.length === 0 && (
                    <tr><td colSpan="6" className="p-6 text-center text-gray-500">Aucune candidature enregistrée.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'tailor' && (
            <div className="space-y-6 max-w-6xl mx-auto">
              <div className={`bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 print:hidden transition-colors ${isPrinting ? 'print:hidden' : ''}`}>
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-amber-100 text-amber-700 rounded-xl"><Sparkles size={24} /></div>
                    <div>
                      <h2 className="text-xl font-bold text-gray-800 dark:text-white">Adaptateur CV & IA</h2>
                      <p className="text-sm text-gray-500">Générez un CV ou une Lettre optimisés pour l'offre.</p>
                    </div>
                  </div>
                  <div className="flex bg-gray-100 dark:bg-gray-900 p-1 rounded-lg">
                    <button 
                      onClick={() => setGenerationMode('cv')} 
                      className={`px-4 py-2 rounded-md text-sm font-medium transition-colors cursor-pointer ${generationMode === 'cv' ? 'bg-white dark:bg-gray-700 shadow text-blue-700 dark:text-blue-500 dark:text-white' : 'text-gray-600 dark:text-gray-400 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-800'}`}
                    >
                      Mode CV
                    </button>
                    <button 
                      onClick={() => setGenerationMode('letter')} 
                      className={`px-4 py-2 rounded-md text-sm font-medium transition-colors cursor-pointer ${generationMode === 'letter' ? 'bg-white shadow text-blue-700 dark:text-blue-500' : 'text-gray-600 dark:text-gray-400 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-800'}`}
                    >
                      Mode Lettre
                    </button>
                  </div>
                </div>

                <form onSubmit={handleGenerateAI} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Offre associée</label>
                      <select className="w-full p-2.5 border rounded-lg text-sm bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white" value={selectedAppId} onChange={(e) => setSelectedAppId(e.target.value)}>
                        <option value="">-- Sans candidature --</option>
                        {applications.map(app => <option key={app.id} value={app.id}>{app.company} - {app.role}</option>)}
                      </select>
                    </div>

                    {generationMode === 'cv' ? (
                      <>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Stratégie (Fidélité)</label>
                          <select className="w-full p-2.5 border rounded-lg text-sm bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white" value={modificationStrategy} onChange={(e) => setModificationStrategy(e.target.value)}>
                            <option value="strict">Strict (Ne rien supprimer)</option>
                            <option value="balanced">Équilibré (Recommandé)</option>
                            <option value="rewrite">Adaptation Totale</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Densité Mots-clés ATS</label>
                          <select className="w-full p-2.5 border rounded-lg text-sm bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white" value={keywordDensity} onChange={(e) => setKeywordDensity(e.target.value)}>
                            <option value="low">Subtile (2-3 ajouts)</option>
                            <option value="moderate">Modérée (Équilibrée)</option>
                            <option value="high">Agressive (Maximiser le score)</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Densité du texte CV</label>
                          <select className="w-full p-2.5 border rounded-lg text-sm bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white" value={cvDensity} onChange={(e) => setCvDensity(e.target.value)}>
                            <option value="expanded">Maximiser (Remplir page)</option>
                            <option value="standard">Standard</option>
                            <option value="compact">Compact</option>
                          </select>
                        </div>
                      </>
                    ) : (
                      <div className="md:col-span-3">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Ton de la lettre de motivation</label>
                        <select className="w-full p-2.5 border rounded-lg text-sm bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white" value={letterTone} onChange={(e) => setLetterTone(e.target.value)}>
                          <option value="professional">Professionnel & Formel</option>
                          <option value="audacious">Audacieux & Percutant</option>
                          <option value="original">Original & Narratif</option>
                        </select>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {generationMode === 'cv' ? (
                      <div>
                        <div className="flex justify-between items-end mb-1">
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Source : CV Maître</label>
                          <button type="button" onClick={() => setBaseCV(profile.masterCV)} className="text-xs text-blue-600 dark:text-blue-400 hover:underline">Restaurer</button>
                        </div>
                        <textarea rows={5} className="w-full p-2.5 border rounded-lg text-sm font-mono text-xs bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white" value={baseCV} onChange={(e) => setBaseCV(e.target.value)} />
                      </div>
                    ) : (
                      <div>
                        <div className="flex justify-between items-end mb-1">
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Source : Lettre Maître</label>
                          <button type="button" onClick={() => setBaseLetter(profile.masterLetter)} className="text-xs text-blue-600 dark:text-blue-400 hover:underline">Restaurer</button>
                        </div>
                        <textarea rows={5} className="w-full p-2.5 border rounded-lg text-sm font-mono text-xs bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white" value={baseLetter} onChange={(e) => setBaseLetter(e.target.value)} placeholder="Modèle de lettre de base..." />
                      </div>
                    )}
                    <div>
                      <div className="flex justify-between items-end mb-1">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Description de l'offre</label>
                        <div className="flex items-center gap-2">
                          <input type="url" placeholder="Lien URL (Jina AI)" className="px-3 py-1 text-xs border rounded-md w-36 bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white" value={jobUrl} onChange={(e) => setJobUrl(e.target.value)} />
                          <button type="button" onClick={handleExtractUrl} disabled={isExtracting || !jobUrl} className="text-xs bg-gray-100 px-3 py-1 rounded border hover:bg-gray-200 dark:text-gray-700 disabled:opacity-50">
                            {isExtracting ? <Loader2 size={14} className="animate-spin" /> : 'Extraire'}
                          </button>
                        </div>
                      </div>
                      <textarea rows={5} className="w-full p-3 border rounded-lg text-sm bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white" placeholder="Collez l'annonce ici ou utilisez l'extracteur URL..." value={jobDescription} onChange={(e) => setJobDescription(e.target.value)} />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Consignes personnalisées pour l'IA (Optionnel)</label>
                    <textarea 
                      rows={2} 
                      className="w-full p-2.5 border rounded-lg text-sm bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white" 
                      placeholder="Ex: Traduis en anglais, insiste sur mon expérience..." 
                      value={customInstruction} 
                      onChange={(e) => setCustomInstruction(e.target.value)} 
                    />
                  </div>

                  {aiError && <div className="p-3 bg-red-50 text-red-700 border border-red-200 rounded-lg text-sm flex items-center gap-2"><AlertTriangle size={18} /> {aiError}</div>}
                  <div className="flex justify-end">
                    <button type="submit" disabled={isLoadingAI} className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl font-medium shadow-md disabled:opacity-50 cursor-pointer">
                      {isLoadingAI ? <Loader2 className="animate-spin" size={20} /> : <Sparkles size={20} />} {isLoadingAI ? 'Génération en cours...' : `✨ Optimiser ${generationMode === 'cv' ? 'le CV' : 'la Lettre'}`}
                    </button>
                  </div>
                </form>
              </div>

              {/* Display CV Result */}
              {aiResult && generationMode === 'cv' && aiResult.cv && (
                <div className="space-y-6">
                  <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4 print:hidden">
                    <h3 className="font-bold text-gray-800 flex items-center gap-2">
                      <FileText className="text-blue-600 dark:text-blue-400" size={20} /> CV Format RenderCV
                    </h3>
                    <div className="flex gap-2">
                      <button onClick={handleExportRenderCV} className="flex items-center gap-1.5 px-3 py-2 text-sm bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800/50 rounded-lg text-emerald-700 hover:bg-emerald-100 font-medium cursor-pointer">
                        <Download size={16} /> YAML
                      </button>
                      <button onClick={triggerPrint} className="flex items-center gap-1.5 px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium shadow-sm cursor-pointer">
                        <Download size={16} /> PDF
                      </button>
                    </div>
                  </div>

                  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex justify-center bg-gray-200">
                    {renderCVTemplate()}
                  </div>
                </div>
              )}

              {/* Display Letter Result */}
              {aiResult && generationMode === 'letter' && aiResult.coverLetter && (
                <div className="space-y-6">
                  
                  <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4 print:hidden">
                    <h3 className="font-bold text-gray-800 flex items-center gap-2"><Sparkles className="text-indigo-600" size={20} /> Lettre de Motivation</h3>                
                    <div className="flex gap-2">
                      <button 
                        onClick={handleCopyLetter} 
                        className="flex items-center gap-1.5 px-4 py-2 text-sm bg-gray-100 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 font-medium shadow-sm cursor-pointer transition-all"
                      >
                        {isCopied ? <CheckCircle size={16} className="text-emerald-600" /> : <Copy size={16} />} 
                        {isCopied ? <span className="text-emerald-700">Copié !</span> : 'Copier le texte'}
                      </button>
                      <button onClick={triggerPrint} className="flex items-center gap-1.5 px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium shadow-sm cursor-pointer">
                        <Download size={16} /> Imprimer / PDF
                      </button>
                    </div>

                  </div>
                  
                  {/* APPLICATION DES MÊMES RÈGLES D'IMPRESSION QUE LE CV */}
                  <div className="w-full flex justify-center bg-gray-100 p-8 overflow-x-auto print:p-0 print:bg-white print:overflow-visible">
                    <style dangerouslySetInnerHTML={{__html: `
                      @media print {
                        @page {
                          size: A4 portrait;
                          margin: 0mm;
                        }
                        body {
                          margin: 0;
                          background-color: white !important;
                        }
                      }
                    `}} />
                    <div 
                      id="cv-render" 
                      className="bg-white border border-gray-300 p-12 w-[210mm] min-h-[297mm] max-w-[210mm] box-border shadow-lg text-gray-800 font-sans select-text print:border-none print:shadow-none print:p-12 print:m-0 print:w-[210mm] print:absolute print:inset-0 text-[13px] leading-relaxed relative flex flex-col"
                      style={{ 
                        userSelect: 'text', 
                        WebkitUserSelect: 'text', 
                        pageBreakAfter: 'avoid', 
                        breakAfter: 'avoid',
                        pageBreakInside: 'avoid',
                        breakInside: 'avoid'
                      }}
                    >
                      <div className="mb-10 flex justify-between items-start">
                        <div>
                          <p className="font-bold text-base text-black">{profile.fullName || 'Candidat'}</p>
                          <p>{profile.location}</p>
                          <p>{profile.email}</p>
                          <p>{profile.phone}</p>
                        </div>
                        <div className="text-right text-gray-600 dark:text-gray-400">
                          <p>{profile.location?.split(',')[0] || 'Paris'}, le {new Date().toLocaleDateString()}</p>
                        </div>
                      </div>
                      <div className="space-y-4 text-justify whitespace-pre-line flex-1">
                        {aiResult.coverLetter}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'profile' && (
            <div className="max-w-4xl mx-auto bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 transition-colors">
              <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-6">Profil & Documents Maîtres</h2>
              <form onSubmit={(e) => { e.preventDefault(); localStorage.setItem('postutrack_profile', JSON.stringify(profile)); setSavedNotice(true); setTimeout(() => setSavedNotice(false), 3000); }} className="space-y-6">
                
                <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800/50 rounded-xl">
                  <div className="flex justify-between items-center flex-wrap gap-4">
                    <div>
                      <h4 className="font-bold text-emerald-700 dark:text-emerald-500text-sm">⚡ Importation automatique du profil</h4>
                      <p className="text-xs text-emerald-700 mt-0.5">Importez votre CV (PDF ou TXT) pour remplir vos coordonnées et votre CV Maître en un clic.</p>
                    </div>
                    <label className="cursor-pointer text-xs flex items-center gap-1.5 bg-emerald-600 text-white px-4 py-2.5 rounded-lg shadow-sm hover:bg-emerald-700 font-medium transition-colors">
                      <Upload size={16} /> Importer un CV
                      <input type="file" accept=".pdf,.txt" className="hidden" onChange={(e) => handleFileUpload(e, setProfile)} />
                    </label>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div><label className="block text-sm font-medium mb-1">Nom</label><input type="text" className="w-full p-2 border rounded-lg bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white" value={profile.fullName || ''} onChange={e => setProfile({...profile, fullName: e.target.value})} /></div>
                  <div><label className="block text-sm font-medium mb-1">Email</label><input type="email" className="w-full p-2 border rounded-lg bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white" value={profile.email || ''} onChange={e => setProfile({...profile, email: e.target.value})} /></div>
                  <div><label className="block text-sm font-medium mb-1">Téléphone</label><input type="text" className="w-full p-2 border rounded-lg bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white" value={profile.phone || ''} onChange={e => setProfile({...profile, phone: e.target.value})} /></div>
                  <div><label className="block text-sm font-medium mb-1">Localisation</label><input type="text" className="w-full p-2 border rounded-lg bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white" value={profile.location || ''} onChange={e => setProfile({...profile, location: e.target.value})} /></div>
                  <div className="md:col-span-2"><label className="block text-sm font-medium mb-1">Site Web / LinkedIn</label><input type="text" className="w-full p-2 border rounded-lg bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white" value={profile.website || ''} onChange={e => setProfile({...profile, website: e.target.value})} /></div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">CV Maître</label>
                  <textarea rows={6} className="w-full p-3 border rounded-lg font-mono text-sm bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white" value={profile.masterCV || ''} onChange={e => setProfile({...profile, masterCV: e.target.value})} />
                </div>
                <div>
                  <div className="flex justify-between items-end mb-1">
                    <label className="block text-sm font-medium">Lettre de Motivation Maître (Optionnelle)</label>
                    <label className="cursor-pointer text-xs flex items-center gap-1.5 px-3 py-1 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 text-gray-700 dark:text-gray-700 font-medium transition-colors">
                      <Upload size={14} /> Importer (PDF/TXT)
                      <input type="file" accept=".pdf,.txt" className="hidden" onChange={(e) => handleFileUpload(e, (text) => setProfile(prev => ({ ...prev, masterLetter: text })))} />
                    </label>
                  </div>
                  <textarea rows={6} className="w-full p-3 border rounded-lg font-mono text-sm bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white" placeholder="Votre lettre de motivation de base..." value={profile.masterLetter || ''} onChange={e => setProfile({...profile, masterLetter: e.target.value})} />
                </div>

                {/* Section Sauvegarde */}
                <div className="mt-8 p-5 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/50 rounded-xl">
                  <div className="flex items-center gap-2 mb-2">
                    <Download className="text-amber-600" size={20} />
                    <h4 className="font-bold text-amber-700 dark:text-amber-500">Sauvegarde & Transfert (Backup)</h4>
                  </div>
                  <p className="text-xs text-amber-700 mb-4">Exportez vos données pour les transférer vers la version logicielle ou pour les mettre en sécurité.</p>
                  <div className="flex flex-wrap gap-3">
                    <button type="button" onClick={handleExportData} className="px-4 py-2 bg-amber-600 text-white rounded-lg text-sm font-medium hover:bg-amber-700 shadow-sm transition-colors cursor-pointer">
                      Exporter mes données (.json)
                    </button>
                    <label className="cursor-pointer px-4 py-2 bg-white border-amber-300 text-amber-700 dark:bg-gray-800 dark:border-amber-700 dark:text-amber-400 dark:hover:bg-gray-700 rounded-lg text-sm font-medium hover:bg-amber-100 shadow-sm transition-colors">
                      Importer une sauvegarde
                      <input type="file" accept=".json" className="hidden" onChange={handleImportData} />
                    </label>
                  </div>
                </div>

                {/* Section API Key */}
                <div className="mt-8 p-5 bg-blue-50 dark:bg-blue-900/30 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800/50 rounded-xl">
                  <div className="flex items-center justify-between mb-4 flex-wrap gap-4">
                    <div className="flex items-center gap-2">
                      <Settings className="text-blue-600 dark:text-blue-400" size={20} />
                      <h4 className="font-bold text-blue-900 dark:text-blue-400">Configuration de l'IA</h4>
                    </div>
                    <select 
                      className="p-2 border border-blue-200 rounded-lg text-sm bg-white text-blue-900 dark:text-blue-400 font-medium shadow-sm outline-none"
                      value={selectedAiModel}
                      onChange={(e) => setSelectedAiModel(e.target.value)}
                    >
                      <option value="gemini">Google Gemini (Recommandé)</option>
                      <option value="openai">OpenAI - ChatGPT</option>
                      <option value="anthropic">Anthropic - Claude</option>
                    </select>
                  </div>
                  
                  <p className="text-xs text-blue-700 dark:text-blue-500 mb-4">Vos clés API sont stockées uniquement sur votre navigateur local. Elles ne sont jamais partagées.</p>
                  
                  <div className="space-y-3">
                    {selectedAiModel === 'gemini' && (
                      <div>
                        <label className="block text-xs font-semibold text-blue-900 dark:text-blue-400 mb-1">Clé API Google Gemini</label>
                        <input 
                          type="password" 
                          placeholder="Collez votre clé commençant par AIzaSy..." 
                          className="w-full p-3 border border-blue-200 rounded-lg bg-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all dark:bg-gray-700 dark:border-gray-600 dark:text-white" 
                          value={apiKey} 
                          onChange={e => setApiKey(e.target.value)} 
                        />
                      </div>
                    )}
                    
                    {selectedAiModel === 'openai' && (
                      <div>
                        <label className="block text-xs font-semibold text-blue-900 dark:text-blue-400 mb-1">Clé API OpenAI</label>
                        <input 
                          type="password" 
                          placeholder="Collez votre clé commençant par sk-proj-..." 
                          className="w-full p-3 border border-blue-200 rounded-lg bg-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all dark:bg-gray-700 dark:border-gray-600 dark:text-white" 
                          value={openAiKey} 
                          onChange={e => setOpenAiKey(e.target.value)} 
                        />
                      </div>
                    )}

                    {selectedAiModel === 'anthropic' && (
                      <div>
                        <label className="block text-xs font-semibold text-blue-900 dark:text-blue-400 mb-1">Clé API Anthropic</label>
                        <input 
                          type="password" 
                          placeholder="Collez votre clé commençant par sk-ant-..." 
                          className="w-full p-3 border border-blue-200 rounded-lg bg-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all dark:bg-gray-700 dark:border-gray-600 dark:text-white" 
                          value={anthropicKey} 
                          onChange={e => setAnthropicKey(e.target.value)} 
                        />
                      </div>
                    )}
                  </div>
                </div>

                {savedNotice && <div className="p-3 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg text-sm font-medium flex items-center gap-2"><CheckCircle size={18} /> Profil et Documents sauvegardés !</div>}
                <div className="flex justify-end">
                  <button type="submit" className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-medium shadow-md transition-all cursor-pointer">Enregistrer le profil</button>
                </div>
              </form>
            </div>
          )}
        </div>
      </main>
      
      <AddApplicationModal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
        editingApp={editingApplication}
        onGoToTailor={(appId) => {
          setIsAddModalOpen(false);
          setActiveTab('tailor');
          setSelectedAppId(appId);
        }}
        onSave={(savedApp, isEdit) => {
          if (isEdit) setApplications(applications.map(app => app.id === savedApp.id ? savedApp : app));
          else setApplications([savedApp, ...applications]);
        }}
      />
    </div>
  );
}