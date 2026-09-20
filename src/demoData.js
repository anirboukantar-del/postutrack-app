/**
 * Demo Data Generator for PostuTrack
 * Generates:
 * - John DEMO profile with complete academic and professional records
 * - 200 realistic applications spanning 3 calendar years (36 months)
 * - 4 varied, tailored resumes for the CV Library
 */

export const getDemoProfile = () => {
  return {
    fullName: 'John DEMO',
    photo: '/john-demo.png',
    email: 'john.demo.engineering@gmail.com',
    phone: '+33 6 82 45 19 30',
    location: 'Paris, France (Hybride / Remote)',
    website: 'https://github.com/john-demo-engineer',
    masterCV: `JOHN DEMO
Lead Software Engineer & Cloud Architect
Paris, France | +33 6 82 45 19 30 | john.demo.engineering@gmail.com | https://github.com/john-demo-engineer

RÉSUMÉ PROFESSIONNEL
Ingénieur logiciel senior et Lead Developer avec plus de 8 ans d'expérience dans la conception, le développement et le déploiement d'architectures web distribuées à haute disponibilité (React, TypeScript, Node.js, Go, AWS). Expert en performance front-end, patterns micro-frontends et animation d'équipes agiles pluridisciplinaires.

EXPÉRIENCE PROFESSIONNELLE

Lead Fullstack & Cloud Architect | TechNova Solutions, Paris (2023 - Présent)
• Pilotage technique d'une équipe de 10 ingénieurs sur la refonte de la plateforme SaaS cœur de métier (React 18, Next.js, Node.js, Kubernetes).
• Réduction du temps de chargement initial de 42% et amélioration du Core Web Vitals (LCP < 1.2s).
• Mise en place de pipelines CI/CD automatisés avec tests de régression, réduisant le cycle de release de 2 semaines à 1 jour.
• Conception d'une architecture événementielle scalable supportant plus de 50 000 requêtes/sec en pic de trafic.

Senior Software Engineer (React / TypeScript / Node) | CloudFlow Systems, Paris (2020 - 2023)
• Développement de composants UI haute performance et d'un Design System unifié partagé par 4 produits SaaS.
• Migration progressive d'un monolithe Legacy vers une architecture modulaire en TypeScript strict et GraphQL.
• Mentorat actif de 5 développeurs juniors et animation de sessions de partage technique hebdomadaires.
• Augmentation de la couverture de tests unitaires et e2e de 45% à 88% (Vitest, Playwright).

Fullstack Developer | DataScale Labs, Lyon (2018 - 2020)
• Conception d'API RESTful et microservices avec Node.js, PostgreSQL et Redis.
• Développement d'interfaces de visualisation de données complexes en temps réel avec D3.js et React.
• Optimisation des requêtes SQL complexes ayant permis un gain de performance de 60% sur les rapports volumineux.

FORMATION ACADÉMIQUE

• Master 2 en Informatique & Systèmes Distribués (Mention Très Bien)
  École Polytechnique / Sorbonne Université, Paris (2016 - 2018)
  - Spécialisation : Algorithmique distribuée, sécurité logicielle, cloud computing.
  - Mémoire de recherche : "Optimisation du consensus distribué pour les flux événementiels temps réel".

• Licence en Informatique et Mathématiques Appliquées (Mention Bien)
  Université Paris-Saclay (2013 - 2016)
  - Majeures : Algorithmique avancée, structures de données, statistiques, calcul formel.

• CPGE (Classes Préparatoires aux Grandes Écoles) - Filière MPSI / MP*
  Lycée Louis-le-Grand, Paris (2011 - 2013)

COMPÉTENCES TECHNIQUES
• Langages : TypeScript, JavaScript (ESNext), Go, Python, SQL, HTML5/CSS3
• Frontend : React 18, Next.js, Vue.js, Tailwind CSS, Redux Toolkit, Zustand, Vite
• Backend : Node.js, Express, Fastify, Go (Gin), GraphQL, REST APIs, Microservices
• Bases de données : PostgreSQL, MySQL, Redis, MongoDB, ElasticSearch
• Cloud & DevOps : AWS (ECS, Lambda, S3, RDS), Docker, Kubernetes, GitHub Actions, Terraform
• Méthodologies : Agile Scrum/Kanban, TDD, Clean Architecture, Code Review, System Design

LANGUES & CERTIFICATIONS
• Français : Langue maternelle
• Anglais : Courant / Bilingue professionnel (TOEIC 985/990, C2)
• AWS Certified Solutions Architect - Associate
• Certified Kubernetes Application Developer (CKAD)`,
    masterLetter: `John DEMO
Paris, France
+33 6 82 45 19 30
john.demo.engineering@gmail.com
https://github.com/john-demo-engineer

À l'attention de l'équipe de recrutement

Objet : Candidature au poste de Lead Fullstack Engineer / Tech Lead

Madame, Monsieur,

Fort de plus de huit années d'expérience dans la conception et le déploiement d'applications web scalables, je vous adresse avec un vif enthousiasme ma candidature. Votre vision technologique et vos ambitions de croissance résonnent particulièrement avec mon parcours d'ingénieur et de leader technique.

Au cours de mes dernières fonctions chez TechNova Solutions et CloudFlow Systems, j'ai eu l'opportunité de concevoir des architectures complètes en TypeScript, React et Node.js, tout en orchestrant des infrastructures cloud sur AWS et Kubernetes. Mon rôle ne s'est pas limité à la seule rigueur du code : j'ai activement fédéré des équipes de développeurs, instauré des standards d'excellence en matière de tests et de performance, et réduit de manière drastique les délais de mise en production.

Ma formation académique à l'École Polytechnique et à la Sorbonne Université m'a conféré une solide maîtrise des concepts algorithmiques fondamentaux, que j'ai constamment mise au service de défis concrets : fluidité des parcours utilisateurs, résilience des systèmes à fort trafic et clarté du code maintenable sur le long terme.

Dynamique, force de proposition et guidé par la volonté d'avoir un impact mesurable, je serais ravi d'échanger prochainement avec vous pour vous exposer plus en détail la manière dont mon expertise technique et mes compétences en encadrement pourront contribuer au succès de vos futurs projets.

Je vous remercie vivement pour l'attention portée à ma candidature et vous prie d'agréer, Madame, Monsieur, l'expression de mes salutations distinguées.

John DEMO`
  };
};

export const generateDemoApplications = (totalCount = 200) => {
  const companies = [
    { name: 'Google', url: 'https://careers.google.com', source: 'Workday', type: 'CDI', salary: '95k€ - 110k€' },
    { name: 'Datadog', url: 'https://www.datadoghq.com/careers', source: 'Greenhouse', type: 'CDI', salary: '90k€ - 105k€' },
    { name: 'Doctolib', url: 'https://careers.doctolib.fr', source: 'SmartRecruiters', type: 'CDI', salary: '80k€ - 92k€' },
    { name: 'Mirakl', url: 'https://www.mirakl.com/careers', source: 'LinkedIn', type: 'CDI', salary: '75k€ - 88k€' },
    { name: 'Qonto', url: 'https://qonto.com/fr/careers', source: 'Lever', type: 'CDI', salary: '85k€ - 98k€' },
    { name: 'Alan', url: 'https://alan.com/careers', source: 'Welcome to the Jungle', type: 'CDI', salary: '85k€ - 100k€' },
    { name: 'PayFit', url: 'https://payfit.com/fr/carrieres', source: 'Lever', type: 'CDI', salary: '75k€ - 85k€' },
    { name: 'Swile', url: 'https://www.swile.co/carrieres', source: 'Ashby', type: 'CDI', salary: '78k€ - 90k€' },
    { name: 'ManoMano', url: 'https://jobs.manomano.com', source: 'Welcome to the Jungle', type: 'CDI', salary: '72k€ - 82k€' },
    { name: 'Back Market', url: 'https://careers.backmarket.com', source: 'Teamtailor', type: 'CDI', salary: '80k€ - 95k€' },
    { name: 'Deezer', url: 'https://www.deezer.com/careers', source: 'LinkedIn', type: 'CDI', salary: '75k€ - 88k€' },
    { name: 'BlaBlaCar', url: 'https://careers.blablacar.com', source: 'SmartRecruiters', type: 'CDI', salary: '78k€ - 92k€' },
    { name: 'Contentsquare', url: 'https://contentsquare.com/careers', source: 'Greenhouse', type: 'CDI', salary: '85k€ - 100k€' },
    { name: 'Spendesk', url: 'https://www.spendesk.com/careers', source: 'Lever', type: 'CDI', salary: '80k€ - 92k€' },
    { name: 'LVMH Digital', url: 'https://www.lvmh.fr/talents', source: 'Site Entreprise', type: 'CDI', salary: '85k€ - 100k€' },
    { name: 'BNP Paribas CIB', url: 'https://group.bnpparibas/emploi-carriere', source: 'Taleo / Oracle', type: 'CDI', salary: '75k€ - 90k€' },
    { name: 'Société Générale Tech', url: 'https://careers.societegenerale.com', source: 'Taleo / Oracle', type: 'CDI', salary: '72k€ - 86k€' },
    { name: 'Ubisoft', url: 'https://www.ubisoft.com/careers', source: 'SmartRecruiters', type: 'CDI', salary: '70k€ - 85k€' },
    { name: 'Capgemini Invent', url: 'https://www.capgemini.com/careers', source: 'Workday', type: 'CDI', salary: '68k€ - 80k€' },
    { name: 'Thales Digital', url: 'https://www.thalesgroup.com/careers', source: 'Workday', type: 'CDI', salary: '70k€ - 82k€' },
    { name: 'OVHcloud', url: 'https://careers.ovhcloud.com', source: 'LinkedIn', type: 'CDI', salary: '75k€ - 88k€' },
    { name: 'Voodoo', url: 'https://www.voodoo.io/careers', source: 'Ashby', type: 'CDI', salary: '85k€ - 105k€' },
    { name: 'Pennylane', url: 'https://www.pennylane.com/fr/careers', source: 'Welcome to the Jungle', type: 'CDI', salary: '82k€ - 96k€' },
    { name: 'Pigment', url: 'https://www.gopigment.com/careers', source: 'Ashby', type: 'CDI', salary: '90k€ - 110k€' },
    { name: 'Mistral AI', url: 'https://mistral.ai/careers', source: 'Email direct', type: 'CDI', salary: '100k€ - 130k€' },
    { name: 'Ledger', url: 'https://www.ledger.com/careers', source: 'Greenhouse', type: 'CDI', salary: '85k€ - 105k€' },
    { name: 'OpenAI France', url: 'https://openai.com/careers', source: 'Greenhouse', type: 'CDI', salary: '120k€ - 160k€' },
    { name: 'Stripe', url: 'https://stripe.com/jobs', source: 'Site Entreprise', type: 'CDI', salary: '110k€ - 140k€' },
    { name: 'Shopify', url: 'https://www.shopify.com/careers', source: 'Workday', type: 'Freelance', salary: '650€ / jour' },
    { name: 'Airbus Digital', url: 'https://www.airbus.com/careers', source: 'Workday', type: 'CDI', salary: '72k€ - 85k€' },
    { name: 'Schneider Electric', url: 'https://www.se.com/careers', source: 'Taleo / Oracle', type: 'CDI', salary: '70k€ - 84k€' },
    { name: 'Renault Digital Lab', url: 'https://www.renaultgroup.com/talents', source: 'LinkedIn', type: 'CDI', salary: '68k€ - 80k€' },
    { name: 'SNCF Connect & Tech', url: 'https://www.sncf-connect.com/recrutement', source: 'France Travail', type: 'CDI', salary: '65k€ - 78k€' },
    { name: 'Decathlon Digital', url: 'https://joinus.decathlon.com', source: 'Teamtailor', type: 'CDI', salary: '70k€ - 84k€' },
    { name: 'Leroy Merlin Digital', url: 'https://recrute.leroymerlin.fr', source: 'Indeed', type: 'CDI', salary: '65k€ - 76k€' },
    { name: 'Crédit Agricole CIB', url: 'https://www.ca-cib.com/carrieres', source: 'Taleo / Oracle', type: 'CDI', salary: '75k€ - 88k€' },
    { name: 'Axa France Tech', url: 'https://recrutement.axa.fr', source: 'Indeed', type: 'CDI', salary: '68k€ - 82k€' },
    { name: 'TotalEnergies Digital', url: 'https://totalenergies.com/fr/carrieres', source: 'Workday', type: 'CDI', salary: '75k€ - 90k€' },
    { name: 'Believe Digital', url: 'https://www.believe.com/careers', source: 'Welcome to the Jungle', type: 'CDI', salary: '70k€ - 84k€' },
    { name: 'Channable France', url: 'https://www.channable.com/careers', source: 'LinkedIn', type: 'CDD', salary: '62k€ - 72k€' },
    { name: 'Kpler', url: 'https://www.kpler.com/careers', source: 'Welcome to the Jungle', type: 'CDI', salary: '80k€ - 95k€' },
    { name: 'Lucca', url: 'https://www.lucca.fr/carrieres', source: 'Welcome to the Jungle', type: 'CDI', salary: '75k€ - 88k€' },
    { name: 'Yousign', url: 'https://yousign.com/carrieres', source: 'Ashby', type: 'CDI', salary: '75k€ - 88k€' },
    { name: 'Shine', url: 'https://shine.fr/jobs', source: 'Welcome to the Jungle', type: 'CDI', salary: '75k€ - 85k€' },
    { name: 'Iliad / Free', url: 'https://www.iliad.fr/carrieres', source: 'Site Entreprise', type: 'CDI', salary: '70k€ - 85k€' },
    { name: 'Orange Cyberdefense', url: 'https://orange.jobs', source: 'LinkedIn', type: 'CDI', salary: '72k€ - 86k€' },
    { name: 'Dassault Systèmes', url: 'https://www.3ds.com/careers', source: 'Site Entreprise', type: 'CDI', salary: '78k€ - 92k€' },
    { name: 'Freelance Studio Tech', url: '', source: 'Cooptation / Réseau', type: 'Freelance', salary: '700€ / jour' },
    { name: 'TechScale Advisory', url: '', source: 'Candidature Spontanée', type: 'Freelance', salary: '650€ / jour' },
    { name: 'Inria Innovation', url: 'https://www.inria.fr', source: 'France Travail', type: 'CDD', salary: '58k€ - 65k€' }
  ];

  const roles = [
    'Lead Fullstack Developer (React / Node / TypeScript)',
    'Senior Frontend Engineer (React 18 / TypeScript)',
    'Staff Software Engineer',
    'Tech Lead Node.js / TypeScript',
    'Principal Software Architect',
    'Senior React Engineer & Design System',
    'Senior Backend Engineer (Go / Distributed Systems)',
    'Engineering Manager',
    'Senior Cloud & DevOps Engineer (AWS / K8s)',
    'Product Engineer (Fullstack TypeScript)',
    'Senior Platform Engineer',
    'Frontend Architect (Micro-frontends)'
  ];

  const locations = [
    'Paris, France',
    'Paris (Hybride 2j)',
    'Remote France',
    'Full Remote Europe',
    'Lyon, France',
    'Nantes, France',
    'Bordeaux, France'
  ];

  // Span exactly 3 years (36 months): e.g. from Sep 2023 to Aug 2026
  // (Base year 2026 minus 2.5 years up to today)
  const baseEnd = new Date(2026, 8, 1); // September 2026
  const totalMonths = 36;
  const applications = [];

  // Generate 200 items across 36 months (~5 to 6 applications each month)
  let countCreated = 0;
  let seq = 1;

  for (let m = totalMonths - 1; m >= 0 && countCreated < totalCount; m--) {
    // Current month in the 36-month timeline
    const monthDate = new Date(baseEnd.getFullYear(), baseEnd.getMonth() - m, 1);
    const yr = monthDate.getFullYear();
    const mo = monthDate.getMonth() + 1;
    const moStr = String(mo).padStart(2, '0');

    // Number of applications in this month: balanced distribution to reach exactly totalCount
    const remainingApps = totalCount - countCreated;
    const remainingMonths = m + 1;
    const countThisMonth = m === 0 
      ? remainingApps 
      : Math.min(remainingApps, Math.max(3, Math.round(remainingApps / remainingMonths) + ((seq % 5) - 2)));

    for (let i = 0; i < countThisMonth && countCreated < totalCount; i++) {
      countCreated++;
      const companyIndex = (seq * 13 + i * 7) % companies.length;
      const comp = companies[companyIndex];
      const role = roles[(seq * 5 + i * 3) % roles.length];
      const location = locations[(seq * 3 + i) % locations.length];

      // Day in month between 1 and 28
      const day = Math.min(28, Math.max(1, 1 + ((i * 6 + seq * 7) % 27)));
      const dayStr = String(day).padStart(2, '0');
      const appDateStr = `${yr}-${moStr}-${dayStr}`;

      // Status distribution
      // If within the last 2 weeks of the timeline -> mostly 'Postulé'
      let status = 'Postulé';
      let responseDateStr = '';

      if (m === 0 && day > 15) {
        // Very recent applications (last 15 days of Aug/Sep 2026)
        const rnd = (seq * 17) % 100;
        if (rnd < 60) {
          status = 'Postulé';
        } else if (rnd < 85) {
          status = 'Entretien';
          const rD = new Date(yr, mo - 1, day + 4);
          responseDateStr = `${rD.getFullYear()}-${String(rD.getMonth() + 1).padStart(2, '0')}-${String(rD.getDate()).padStart(2, '0')}`;
        } else {
          status = 'Refusé';
          const rD = new Date(yr, mo - 1, day + 3);
          responseDateStr = `${rD.getFullYear()}-${String(rD.getMonth() + 1).padStart(2, '0')}-${String(rD.getDate()).padStart(2, '0')}`;
        }
      } else {
        // Historical applications across the 3 years
        const rnd = (seq * 31 + m * 11 + i * 7) % 100;
        if (rnd < 26) {
          // Interview (26%)
          status = 'Entretien';
          const delayDays = 4 + (seq % 9);
          const rD = new Date(yr, mo - 1, day + delayDays);
          responseDateStr = `${rD.getFullYear()}-${String(rD.getMonth() + 1).padStart(2, '0')}-${String(rD.getDate()).padStart(2, '0')}`;
        } else if (rnd < 34) {
          // Offer (8%)
          status = 'Offre';
          const delayDays = 12 + (seq % 10);
          const rD = new Date(yr, mo - 1, day + delayDays);
          responseDateStr = `${rD.getFullYear()}-${String(rD.getMonth() + 1).padStart(2, '0')}-${String(rD.getDate()).padStart(2, '0')}`;
        } else if (rnd < 75) {
          // Refused (41%)
          status = 'Refusé';
          const delayDays = 3 + (seq % 14);
          const rD = new Date(yr, mo - 1, day + delayDays);
          responseDateStr = `${rD.getFullYear()}-${String(rD.getMonth() + 1).padStart(2, '0')}-${String(rD.getDate()).padStart(2, '0')}`;
        } else {
          // Ghosted (25%)
          status = 'Ghosted';
          responseDateStr = '';
        }
      }

      applications.push({
        id: seq,
        company: comp.name,
        role,
        date: appDateStr,
        responseDate: responseDateStr,
        interviewDate: (status === 'Entretien' || status === 'Offre') ? responseDateStr : '',
        source: comp.source,
        status,
        type: comp.type,
        location,
        salary: comp.salary,
        url: comp.url || '',
        notes: `Candidature démo envoyée via ${comp.source}. Profil John DEMO orienté architecture et leadership technique.`
      });

      seq++;
    }
  }

  // Sort descending by date (most recent first)
  applications.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  // Re-index clean 1..200
  return applications.map((app, idx) => ({
    ...app,
    id: idx + 1
  }));
};

export const getDemoCvLibrary = (demoApps = []) => {
  const linkedApp1 = demoApps.find(a => a.company === 'Datadog') || demoApps[0] || null;
  const linkedApp2 = demoApps.find(a => a.company === 'Doctolib') || demoApps[1] || null;
  const linkedApp3 = demoApps.find(a => a.company === 'Qonto') || demoApps[2] || null;

  // Complete contact info for John DEMO
  const contactInfo = {
    fullName: 'John DEMO',
    email: 'john.demo.engineering@gmail.com',
    phone: '+33 6 82 45 19 30',
    location: 'Paris, France (Hybride / Remote)',
    website: 'https://github.com/john-demo-engineer',
    photo: '/john-demo.png'
  };

  // Full academic background of John DEMO
  const fullEducation = [
    {
      school: 'École Polytechnique / Sorbonne Université',
      institution: 'École Polytechnique / Sorbonne Université',
      degree: 'Master 2 en Informatique & Systèmes Distribués (Mention Très Bien)',
      year: '2016 - 2018',
      period: '2016 - 2018',
      location: 'Paris',
      description: 'Spécialisation en algorithmique distribuée, consensus tolérant aux pannes, sécurité et architectures cloud à grande échelle.',
      details: 'Spécialisation en algorithmique distribuée, consensus tolérant aux pannes, sécurité et architectures cloud à grande échelle.'
    },
    {
      school: 'Université Paris-Saclay',
      institution: 'Université Paris-Saclay',
      degree: 'Licence en Informatique et Mathématiques Appliquées (Mention Bien)',
      year: '2013 - 2016',
      period: '2013 - 2016',
      location: 'Orsay',
      description: 'Majeures en structures de données avancées, calcul formel, statistiques et fondements du génie logiciel.',
      details: 'Majeures en structures de données avancées, calcul formel, statistiques et fondements du génie logiciel.'
    },
    {
      school: 'Lycée Louis-le-Grand',
      institution: 'Lycée Louis-le-Grand',
      degree: 'CPGE (Classes Préparatoires aux Grandes Écoles) - MPSI / MP*',
      year: '2011 - 2013',
      period: '2011 - 2013',
      location: 'Paris',
      description: 'Formation intensive d\'excellence en mathématiques fondamentales et physique théorique.',
      details: 'Formation intensive d\'excellence en mathématiques fondamentales et physique théorique.'
    }
  ];

  return [
    // 1. MASTER CV (RenderCV - Format Professionnel Examen Complet)
    {
      id: 'demo-cv-master',
      applicationId: null,
      title: 'John DEMO - CV Master Exhaustif (Profil Complet)',
      company: '',
      role: 'Lead Software Engineer & Cloud Architect',
      date: '08/09/2026, 10:00',
      timestamp: Date.now() - 3600000 * 24 * 1,
      cv: {
        ...contactInfo,
        summary: "Ingénieur logiciel senior et Lead Developer avec 8+ années d'expérience dans la conception d'architectures web résilientes, distribuées et haute performance (React, TypeScript, Node.js, Go, AWS, Kubernetes). Double parcours d'excellence : recherche académique en systèmes distribués et leadership technique en scale-ups SaaS.",
        experiences: [
          {
            company: 'TechNova Solutions',
            role: 'Lead Fullstack & Cloud Architect',
            period: '2023 - Présent',
            location: 'Paris',
            highlights: [
              "Direction technique d'une équipe de 10 ingénieurs sur la refonte de la plateforme SaaS cœur (React 18, Next.js, Node.js, Kubernetes).",
              "Optimisation drastique des Core Web Vitals : LCP réduit de 42% (LCP < 1.1s) et bundle JavaScript allégé de 35%.",
              "Conception d'une architecture événementielle distribuée tolérante aux pannes supportant 50k req/sec en pic.",
              "Mise en œuvre des pipelines CI/CD automatisés avec tests de régression, réduisant le cycle de déploiement de 2 semaines à 1 jour."
            ],
            achievements: [
              "Direction technique d'une équipe de 10 ingénieurs sur la refonte de la plateforme SaaS cœur (React 18, Next.js, Node.js, Kubernetes).",
              "Optimisation drastique des Core Web Vitals : LCP réduit de 42% (LCP < 1.1s) et bundle JavaScript allégé de 35%.",
              "Conception d'une architecture événementielle distribuée tolérante aux pannes supportant 50k req/sec en pic.",
              "Mise en œuvre des pipelines CI/CD automatisés avec tests de régression, réduisant le cycle de déploiement de 2 semaines à 1 jour."
            ]
          },
          {
            company: 'CloudFlow Systems',
            role: 'Senior Software Engineer (React / TypeScript / Node)',
            period: '2020 - 2023',
            location: 'Paris',
            highlights: [
              "Développement et gouvernance d'un Design System unifié partagé par 4 produits SaaS critiques.",
              "Migration progressive d'un monolithe Legacy vers des micro-frontends en TypeScript strict et GraphQL.",
              "Hausse mesurable de la couverture de tests automatisés de 45% à 88% avec Vitest et Playwright.",
              "Mentorat et accompagnement de 5 développeurs juniors et animation des guildes techniques."
            ],
            achievements: [
              "Développement et gouvernance d'un Design System unifié partagé par 4 produits SaaS critiques.",
              "Migration progressive d'un monolithe Legacy vers des micro-frontends en TypeScript strict et GraphQL.",
              "Hausse mesurable de la couverture de tests automatisés de 45% à 88% avec Vitest et Playwright.",
              "Mentorat et accompagnement de 5 développeurs juniors et animation des guildes techniques."
            ]
          },
          {
            company: 'DataScale Labs',
            role: 'Fullstack Developer',
            period: '2018 - 2020',
            location: 'Lyon',
            highlights: [
              "Conception d'APIs RESTful et de microservices performants avec Node.js, PostgreSQL et Redis.",
              "Création de tableaux de bord interactifs de visualisation de données volumineuses en temps réel (D3.js et React).",
              "Optimisation des requêtes SQL complexes ayant permis un gain de performance de 60% sur les rapports de synthèse."
            ],
            achievements: [
              "Conception d'APIs RESTful et de microservices performants avec Node.js, PostgreSQL et Redis.",
              "Création de tableaux de bord interactifs de visualisation de données volumineuses en temps réel (D3.js et React).",
              "Optimisation des requêtes SQL complexes ayant permis un gain de performance de 60% sur les rapports de synthèse."
            ]
          }
        ],
        education: fullEducation,
        skills: [
          { category: 'Frontend', items: ['React 18', 'TypeScript', 'Next.js', 'Tailwind CSS', 'Vite', 'Redux / Zustand', 'Web Performance'] },
          { category: 'Backend & Cloud', items: ['Node.js', 'Go', 'PostgreSQL', 'Redis', 'Docker', 'Kubernetes', 'AWS (ECS, Lambda)'] },
          { category: 'Méthodes & Qualité', items: ['Architecture Hexagonale', 'CI/CD GitHub Actions', 'TDD', 'System Design', 'Code Review'] }
        ],
        projects: [
          {
            name: 'HighScale Gateway',
            period: '2024',
            role: 'Créateur & Lead Maintainer',
            description: "Passerelle d'API open source en Go avec reverse-proxy intelligent et limitation de débit distribuée."
          },
          {
            name: 'PolishedUI Design Kit',
            period: '2023',
            role: 'Auteur',
            description: "Ensemble de composants UI React accessibles (WCAG 2.1 AA) et optimisés pour les applications d'entreprise."
          }
        ]
      },
      format: 'structured',
      source: 'tailored',
      template: 'rendercv',
      accentColor: '#1e3a8a',
      density: 'normal',
      isMultiPage: false,
      showPhoto: true,
      photoSize: 'md',
      matchScore: 98,
      analysisSummary: "CV complet regroupant l'ensemble des expériences académiques et professionnelles de John DEMO.",
      injectedKeywords: ['TypeScript', 'React 18', 'Node.js', 'Kubernetes', 'AWS', 'Architecture', 'Polytechnique']
    },

    // 2. LEAD FULLSTACK & CLOUD ARCHITECT (Azurill - Candidature Datadog)
    {
      id: 'demo-cv-tech-lead',
      applicationId: linkedApp1 ? String(linkedApp1.id) : null,
      title: 'John DEMO - Lead Fullstack & Cloud Architect',
      company: linkedApp1 ? linkedApp1.company : 'Datadog',
      role: 'Lead Fullstack Developer',
      date: '05/09/2026, 14:30',
      timestamp: Date.now() - 3600000 * 24 * 2,
      cv: {
        ...contactInfo,
        summary: "Ingénieur logiciel senior et Lead Developer avec 8+ années d'expérience dans la conception d'architectures web résilientes et distribuées (React, TypeScript, Node.js, Go, Kubernetes). Expert en Web Performance, observabilité et pilotage d'équipes d'ingénierie agiles.",
        experiences: [
          {
            company: 'TechNova Solutions',
            role: 'Lead Fullstack & Cloud Architect',
            period: '2023 - Présent',
            location: 'Paris',
            highlights: [
              "Direction technique d'une équipe de 10 ingénieurs sur la refonte de la plateforme SaaS cœur.",
              "Amélioration des Core Web Vitals : LCP réduit de 42% et optimisation du bundle Vite.",
              "Conception d'une architecture événementielle scalable supportant 50k req/sec en pic."
            ],
            achievements: [
              "Direction technique d'une équipe de 10 ingénieurs sur la refonte de la plateforme SaaS cœur.",
              "Amélioration des Core Web Vitals : LCP réduit de 42% et optimisation du bundle Vite.",
              "Conception d'une architecture événementielle scalable supportant 50k req/sec en pic."
            ]
          },
          {
            company: 'CloudFlow Systems',
            role: 'Senior Software Engineer (React / TypeScript)',
            period: '2020 - 2023',
            location: 'Paris',
            highlights: [
              "Développement d'un Design System unifié partagé par 4 produits SaaS critiques.",
              "Migration d'un monolithe Legacy vers des micro-frontends modulaires en TypeScript strict.",
              "Hausse de la couverture de tests unitaires et e2e de 45% à 88% (Vitest, Playwright)."
            ],
            achievements: [
              "Développement d'un Design System unifié partagé par 4 produits SaaS critiques.",
              "Migration d'un monolithe Legacy vers des micro-frontends modulaires en TypeScript strict.",
              "Hausse de la couverture de tests unitaires et e2e de 45% à 88% (Vitest, Playwright)."
            ]
          },
          {
            company: 'DataScale Labs',
            role: 'Fullstack Developer',
            period: '2018 - 2020',
            location: 'Lyon',
            highlights: [
              "Conception d'APIs RESTful et microservices Node.js / PostgreSQL / Redis.",
              "Visualisations interactives de données financières en temps réel avec D3.js et React."
            ],
            achievements: [
              "Conception d'APIs RESTful et microservices Node.js / PostgreSQL / Redis.",
              "Visualisations interactives de données financières en temps réel avec D3.js et React."
            ]
          }
        ],
        education: fullEducation,
        skills: [
          { category: 'Frontend', items: ['React 18', 'TypeScript', 'Next.js', 'Tailwind CSS', 'Vite', 'Redux / Zustand'] },
          { category: 'Backend & Cloud', items: ['Node.js', 'Go', 'PostgreSQL', 'Docker', 'Kubernetes', 'AWS (ECS, Lambda)'] },
          { category: 'Méthodes & Outils', items: ['Architecture Hexagonale', 'CI/CD GitHub Actions', 'TDD', 'System Design'] }
        ],
        projects: [
          {
            name: 'HighScale Gateway',
            period: '2024',
            role: 'Créateur & Lead Maintainer',
            description: "Passerelle d'API open source en Go avec reverse-proxy intelligent et limitation de débit distribuée."
          }
        ]
      },
      format: 'structured',
      source: 'tailored',
      template: 'azurill',
      accentColor: '#2563eb',
      density: 'normal',
      isMultiPage: false,
      showPhoto: true,
      photoSize: 'md',
      matchScore: 96,
      analysisSummary: "Excellente adéquation avec le rôle de Lead Fullstack. Fortes compétences démontrées sur TypeScript, React 18 et Kubernetes.",
      injectedKeywords: ['TypeScript', 'Kubernetes', 'React 18', 'Architecture', 'Web Performance']
    },

    // 3. FRONTEND & UI SPECIALIST (Dittox - Candidature Doctolib)
    {
      id: 'demo-cv-frontend-specialist',
      applicationId: linkedApp2 ? String(linkedApp2.id) : null,
      title: 'John DEMO - Senior React & TypeScript Specialist',
      company: linkedApp2 ? linkedApp2.company : 'Doctolib',
      role: 'Senior Frontend Engineer',
      date: '02/09/2026, 11:15',
      timestamp: Date.now() - 3600000 * 24 * 5,
      cv: {
        ...contactInfo,
        summary: "Spécialiste Front-end React & TypeScript axé sur l'accessibilité (a11y), le design ergonomique et l'ultra-performance web. Passionné par la conception de bibliothèques UI évolutives et d'expériences utilisateur fluides.",
        experiences: [
          {
            company: 'TechNova Solutions',
            role: 'Senior Frontend Engineer & Design System Lead',
            period: '2023 - Présent',
            location: 'Paris',
            highlights: [
              "Conception et gouvernance du Design System React sous Tailwind CSS et Radix UI.",
              "Audit et mise en conformité RGAA / WCAG 2.1 AA sur l'ensemble des parcours utilisateurs.",
              "Mise en place de micro-frontends avec Module Federation et lazy-loading granulaire."
            ],
            achievements: [
              "Conception et gouvernance du Design System React sous Tailwind CSS et Radix UI.",
              "Audit et mise en conformité RGAA / WCAG 2.1 AA sur l'ensemble des parcours utilisateurs.",
              "Mise en place de micro-frontends avec Module Federation et lazy-loading granulaire."
            ]
          },
          {
            company: 'CloudFlow Systems',
            role: 'Frontend Developer',
            period: '2020 - 2023',
            location: 'Paris',
            highlights: [
              "Refonte de l'application web principale : réduction de 35% du temps d'interactivité (TTI).",
              "Écriture de suites de tests de composants automatisés avec Testing Library et Vitest.",
              "Mise en place de storybooks interactifs documentant 50+ composants d'interface."
            ],
            achievements: [
              "Refonte de l'application web principale : réduction de 35% du temps d'interactivité (TTI).",
              "Écriture de suites de tests de composants automatisés avec Testing Library et Vitest.",
              "Mise en place de storybooks interactifs documentant 50+ composants d'interface."
            ]
          },
          {
            company: 'DataScale Labs',
            role: 'Frontend UI Developer',
            period: '2018 - 2020',
            location: 'Lyon',
            highlights: [
              "Développement d'interfaces graphiques dynamiques et graphiques D3.js temps réel.",
              "Intégration responsive pixel-perfect et tests d'ergonomie utilisateurs."
            ],
            achievements: [
              "Développement d'interfaces graphiques dynamiques et graphiques D3.js temps réel.",
              "Intégration responsive pixel-perfect et tests d'ergonomie utilisateurs."
            ]
          }
        ],
        education: fullEducation,
        skills: [
          { category: 'Frontend Core', items: ['React 18', 'TypeScript', 'Tailwind CSS', 'Next.js', 'Web Performance'] },
          { category: 'UI & State', items: ['Zustand', 'Radix UI', 'Framer Motion', 'React Query', 'Redux Toolkit'] },
          { category: 'Tooling & Testing', items: ['Vite', 'Vitest', 'Playwright', 'Storybook', 'ESLint / Prettier'] }
        ],
        projects: [
          {
            name: 'PolishedUI Design Kit',
            period: '2023',
            role: 'Auteur',
            description: "Ensemble de 40+ composants React headless et accessibles inspirés des meilleurs standards de l'industrie."
          }
        ]
      },
      format: 'structured',
      source: 'tailored',
      template: 'dittox',
      accentColor: '#059669',
      density: 'compact',
      isMultiPage: false,
      showPhoto: true,
      photoSize: 'md',
      matchScore: 92,
      analysisSummary: "Profil particulièrement pointu sur l'ergonomie, la performance front-end et les Design Systems.",
      injectedKeywords: ['React 18', 'TypeScript', 'Tailwind CSS', 'Radix UI', 'Vitest']
    },

    // 4. STAFF BACKEND & PLATFORM ENGINEER (Bronzor - Candidature Qonto)
    {
      id: 'demo-cv-staff-backend',
      applicationId: linkedApp3 ? String(linkedApp3.id) : null,
      title: 'John DEMO - Staff Backend & Platform Engineer',
      company: linkedApp3 ? linkedApp3.company : 'Qonto',
      role: 'Staff Backend Engineer (Go / Node)',
      date: '28/08/2026, 17:45',
      timestamp: Date.now() - 3600000 * 24 * 10,
      cv: {
        ...contactInfo,
        summary: "Ingénieur Backend Staff spécialisé dans la conception de services distribués résilients en Go et Node.js. Expertise approfondie en bases de données relationnelles et NoSQL, architectures orientées événements (Kafka) et infrastructures cloud AWS.",
        experiences: [
          {
            company: 'TechNova Solutions',
            role: 'Staff Backend Engineer & Data Platform Lead',
            period: '2023 - Présent',
            location: 'Paris',
            highlights: [
              "Architecture des microservices d'ingestion de données temps réel en Go.",
              "Partitionnement et sharding de bases PostgreSQL sous fort volume de transactions (10M+ lignes/jour).",
              "Supervision globale de l'observabilité avec Datadog, Prometheus et Grafana."
            ],
            achievements: [
              "Architecture des microservices d'ingestion de données temps réel en Go.",
              "Partitionnement et sharding de bases PostgreSQL sous fort volume de transactions (10M+ lignes/jour).",
              "Supervision globale de l'observabilité avec Datadog, Prometheus et Grafana."
            ]
          },
          {
            company: 'CloudFlow Systems',
            role: 'Senior Backend Engineer',
            period: '2020 - 2023',
            location: 'Paris',
            highlights: [
              "Création du moteur de facturation automatisé avec Stripe et webhooks résilients.",
              "Mise en place de caches distribués Redis réduisant la latence p99 de 70%.",
              "Migration vers des schémas d'APIs typés avec validation runtime et gRPC."
            ],
            achievements: [
              "Création du moteur de facturation automatisé avec Stripe et webhooks résilients.",
              "Mise en place de caches distribués Redis réduisant la latence p99 de 70%.",
              "Migration vers des schémas d'APIs typés avec validation runtime et gRPC."
            ]
          },
          {
            company: 'DataScale Labs',
            role: 'Fullstack & Backend Engineer',
            period: '2018 - 2020',
            location: 'Lyon',
            highlights: [
              "Développement de microservices Node.js avec bases de données relationnelles PostgreSQL.",
              "Conception d'APIs haut débit et optimisation de pipelines de données batch."
            ],
            achievements: [
              "Développement de microservices Node.js avec bases de données relationnelles PostgreSQL.",
              "Conception d'APIs haut débit et optimisation de pipelines de données batch."
            ]
          }
        ],
        education: fullEducation,
        skills: [
          { category: 'Langages Backend', items: ['Go', 'Node.js', 'TypeScript', 'SQL (PostgreSQL)', 'Python'] },
          { category: 'Data & Event Streams', items: ['PostgreSQL', 'Redis', 'Kafka', 'RabbitMQ', 'MongoDB'] },
          { category: 'Cloud Infrastructure', items: ['Docker', 'Kubernetes', 'AWS (ECS, S3, RDS)', 'Terraform'] }
        ],
        projects: [
          {
            name: 'EventStream Core',
            period: '2023',
            role: 'Architecte',
            description: "Moteur de synchronisation bidirectionnelle de bases de données distribuées à faible latence."
          }
        ]
      },
      format: 'structured',
      source: 'tailored',
      template: 'bronzor',
      accentColor: '#7c3aed',
      density: 'normal',
      isMultiPage: false,
      showPhoto: true,
      photoSize: 'md',
      matchScore: 94,
      analysisSummary: "Solide profil système et backend avec une grande rigueur sur les bases de données et la scalabilité.",
      injectedKeywords: ['Go', 'PostgreSQL', 'Kafka', 'Microservices', 'Kubernetes']
    },

    // 5. ACADEMIC & RESEARCH CV (RenderCV - Format Académique Prestige)
    {
      id: 'demo-cv-rendercv-academic',
      applicationId: null,
      title: 'John DEMO - CV Académique & Recherche (RenderCV)',
      company: 'Sorbonne / Inria',
      role: 'Chercheur & Ingénieur R&D',
      date: '20/08/2026, 09:20',
      timestamp: Date.now() - 3600000 * 24 * 18,
      cv: {
        ...contactInfo,
        summary: "Parcours d'excellence académique combinant recherche en algorithmique distribuée et ingénierie logicielle appliquée. Diplômé de l'École Polytechnique et Sorbonne Université, avec publications et interventions régulières sur les systèmes tolérants aux pannes.",
        experiences: [
          {
            company: 'TechNova Solutions & Laboratoires Partenaires',
            role: 'Lead Architecte R&D',
            period: '2023 - Présent',
            location: 'Paris',
            highlights: [
              "Direction des projets de R&D industrielle sur les architectures distribuées tolérantes aux pannes.",
              "Encadrement de thèses CIFRE et publication d'articles techniques sur la résilience cloud.",
              "Mise en œuvre de bancs de tests de performance comparatifs sur le consensus distribué."
            ],
            achievements: [
              "Direction des projets de R&D industrielle sur les architectures distribuées tolérantes aux pannes.",
              "Encadrement de thèses CIFRE et publication d'articles techniques sur la résilience cloud.",
              "Mise en œuvre de bancs de tests de performance comparatifs sur le consensus distribué."
            ]
          },
          {
            company: 'Laboratoire d’Informatique de Paris 6 (LIP6) / Inria',
            role: 'Chercheur Invité / Ingénieur Recherche',
            period: '2020 - 2023',
            location: 'Paris',
            highlights: [
              "Recherche appliquée sur les protocoles de consensus et les réseaux décentralisés tolérants aux pannes.",
              "Rédaction d'articles acceptés en conférences internationales peer-reviewed.",
              "Développement de prototypes en C++ et Go pour valider les modèles formels de tolérance aux pannes."
            ],
            achievements: [
              "Recherche appliquée sur les protocoles de consensus et les réseaux décentralisés tolérants aux pannes.",
              "Rédaction d'articles acceptés en conférences internationales peer-reviewed.",
              "Développement de prototypes en C++ et Go pour valider les modèles formels de tolérance aux pannes."
            ]
          },
          {
            company: 'DataScale Labs',
            role: 'Ingénieur R&D Algorithmique',
            period: '2018 - 2020',
            location: 'Lyon',
            highlights: [
              "Optimisation d'algorithmes de routage et de compression de flux de données massifs.",
              "Benchmark et publication de métriques comparatives sur des bases NoSQL distribuées."
            ],
            achievements: [
              "Optimisation d'algorithmes de routage et de compression de flux de données massifs.",
              "Benchmark et publication de métriques comparatives sur des bases NoSQL distribuées."
            ]
          }
        ],
        education: [
          {
            school: 'École Polytechnique / Sorbonne Université',
            institution: 'École Polytechnique / Sorbonne Université',
            degree: 'Master 2 Recherche en Informatique & Systèmes Distribués (Major de promotion)',
            year: '2016 - 2018',
            period: '2016 - 2018',
            location: 'Paris',
            description: "Thèse de Master sur le consensus tolérant aux fautes byzantines. Mention Très Bien avec félicitations du jury.",
            details: "Thèse de Master sur le consensus tolérant aux fautes byzantines. Mention Très Bien avec félicitations du jury."
          },
          {
            school: 'Université Paris-Saclay',
            institution: 'Université Paris-Saclay',
            degree: 'Licence d’Excellence en Mathématiques et Informatique (Mention Très Bien)',
            year: '2013 - 2016',
            period: '2013 - 2016',
            location: 'Orsay',
            description: "Majeures en calcul formel, analyse numérique et théorie de la complexité. Major du parcours combiné math-info.",
            details: "Majeures en calcul formel, analyse numérique et théorie de la complexité. Major du parcours combiné math-info."
          },
          {
            school: 'Lycée Louis-le-Grand',
            institution: 'Lycée Louis-le-Grand',
            degree: 'Classes Préparatoires aux Grandes Écoles (MPSI / MP*)',
            year: '2011 - 2013',
            period: '2011 - 2013',
            location: 'Paris',
            description: "Formation intensive d'excellence en mathématiques pures et physique. Admis aux concours des Écoles Normales Supérieures et Polytechnique.",
            details: "Formation intensive d'excellence en mathématiques pures et physique. Admis aux concours des Écoles Normales Supérieures et Polytechnique."
          }
        ],
        skills: [
          { category: 'Recherche & Algorithmique', items: ['Algorithmes Distribués', 'Calcul Formel', 'Théorie des Graphes', 'Complexité'] },
          { category: 'Langages de Programmation', items: ['C/C++', 'Go', 'Python', 'TypeScript', 'Rust (Notions)'] },
          { category: 'Outils Scientifiques', items: ['LaTeX', 'Git', 'Linux Kernel', 'Docker', 'Jupyter'] }
        ],
        projects: [
          {
            name: 'ByzantineFaultSimulator',
            period: '2018',
            role: 'Auteur Principal',
            description: "Simulateur de consensus distribué avec injection de pannes arbitraires pour l'évaluation de protocoles réseau."
          }
        ]
      },
      format: 'structured',
      source: 'tailored',
      template: 'rendercv',
      accentColor: '#334155',
      density: 'relaxed',
      isMultiPage: false,
      showPhoto: true,
      photoSize: 'md',
      matchScore: 97,
      analysisSummary: "Format académique épuré et intemporel mettant en exergue les diplômes prestigieux et les réalisations de recherche.",
      injectedKeywords: ['Polytechnique', 'Sorbonne', 'Systèmes Distribués', 'Algorithmes', 'Recherche']
    }
  ];
};
