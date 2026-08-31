/**
 * Generates a realistic year-long dataset of job applications for testing & demo purposes.
 * Spans 13 consecutive calendar months: starts in January (e.g. Jan 2026) and ends in January of next year (Jan 2027).
 */

export const generateYearOfExampleApplications = () => {
  const companies = [
    { name: 'Google', url: 'https://careers.google.com', source: 'Workday', type: 'CDI' },
    { name: 'Datadog', url: 'https://www.datadoghq.com/careers', source: 'Greenhouse', type: 'CDI' },
    { name: 'Doctolib', url: 'https://careers.doctolib.fr', source: 'SmartRecruiters', type: 'CDI' },
    { name: 'Mirakl', url: 'https://www.mirakl.com/careers', source: 'LinkedIn', type: 'CDI' },
    { name: 'Qonto', url: 'https://qonto.com/fr/careers', source: 'Lever', type: 'CDI' },
    { name: 'Alan', url: 'https://alan.com/careers', source: 'Welcome to the Jungle', type: 'CDI' },
    { name: 'PayFit', url: 'https://payfit.com/fr/carrieres', source: 'Lever', type: 'CDI' },
    { name: 'Swile', url: 'https://www.swile.co/carrieres', source: 'Ashby', type: 'CDI' },
    { name: 'ManoMano', url: 'https://jobs.manomano.com', source: 'Welcome to the Jungle', type: 'CDI' },
    { name: 'Back Market', url: 'https://careers.backmarket.com', source: 'Teamtailor', type: 'CDI' },
    { name: 'Deezer', url: 'https://www.deezer.com/careers', source: 'LinkedIn', type: 'CDI' },
    { name: 'BlaBlaCar', url: 'https://careers.blablacar.com', source: 'SmartRecruiters', type: 'CDI' },
    { name: 'Contentsquare', url: 'https://contentsquare.com/careers', source: 'Greenhouse', type: 'CDI' },
    { name: 'Spendesk', url: 'https://www.spendesk.com/careers', source: 'Lever', type: 'CDI' },
    { name: 'LVMH', url: 'https://www.lvmh.fr/talents', source: 'Site Entreprise', type: 'CDI' },
    { name: 'BNP Paribas', url: 'https://group.bnpparibas/emploi-carriere', source: 'Taleo', type: 'CDI' },
    { name: 'Société Générale', url: 'https://careers.societegenerale.com', source: 'Taleo', type: 'CDI' },
    { name: 'Ubisoft', url: 'https://www.ubisoft.com/careers', source: 'SmartRecruiters', type: 'CDI' },
    { name: 'Capgemini', url: 'https://www.capgemini.com/careers', source: 'Workday', type: 'CDI' },
    { name: 'Thales', url: 'https://www.thalesgroup.com/careers', source: 'Workday', type: 'CDI' },
    { name: 'OVHcloud', url: 'https://careers.ovhcloud.com', source: 'LinkedIn', type: 'CDI' },
    { name: 'Voodoo', url: 'https://www.voodoo.io/careers', source: 'Ashby', type: 'CDI' },
    { name: 'Pennylane', url: 'https://www.pennylane.com/fr/careers', source: 'Welcome to the Jungle', type: 'CDI' },
    { name: 'Pigment', url: 'https://www.gopigment.com/careers', source: 'Ashby', type: 'CDI' },
    { name: 'Mistral AI', url: 'https://mistral.ai/careers', source: 'Email direct', type: 'CDI' },
    { name: 'Ledger', url: 'https://www.ledger.com/careers', source: 'Greenhouse', type: 'CDI' },
    { name: 'OpenAI', url: 'https://openai.com/careers', source: 'Greenhouse', type: 'CDI' },
    { name: 'Stripe', url: 'https://stripe.com/jobs', source: 'Site Entreprise', type: 'CDI' },
    { name: 'Shopify', url: 'https://www.shopify.com/careers', source: 'Workday', type: 'Freelance' },
    { name: 'Airbus', url: 'https://www.airbus.com/careers', source: 'Workday', type: 'CDI' },
    { name: 'Schneider Electric', url: 'https://www.se.com/careers', source: 'Taleo', type: 'CDI' },
    { name: 'Renault Digital', url: 'https://www.renaultgroup.com/talents', source: 'LinkedIn', type: 'CDI' },
    { name: 'SNCF Connect & Tech', url: 'https://www.sncf-connect.com/recrutement', source: 'France Travail', type: 'CDI' },
    { name: 'Decathlon Digital', url: 'https://joinus.decathlon.com', source: 'Teamtailor', type: 'CDI' },
    { name: 'Leroy Merlin', url: 'https://recrute.leroymerlin.fr', source: 'Indeed', type: 'CDI' },
    { name: 'Crédit Agricole CIB', url: 'https://www.ca-cib.com/carrieres', source: 'Taleo', type: 'CDI' },
    { name: 'Axa France', url: 'https://recrutement.axa.fr', source: 'Indeed', type: 'CDI' },
    { name: 'TotalEnergies Digital', url: 'https://totalenergies.com/fr/carrieres', source: 'Workday', type: 'CDI' },
    { name: 'Believe Digital', url: 'https://www.believe.com/careers', source: 'Welcome to the Jungle', type: 'CDI' },
    { name: 'Channable', url: 'https://www.channable.com/careers', source: 'LinkedIn', type: 'CDD' },
    { name: 'Kpler', url: 'https://www.kpler.com/careers', source: 'Welcome to the Jungle', type: 'CDI' },
    { name: 'Lucca', url: 'https://www.lucca.fr/carrieres', source: 'Welcome to the Jungle', type: 'CDI' },
    { name: 'Yousign', url: 'https://yousign.com/carrieres', source: 'Ashby', type: 'CDI' },
    { name: 'Shine', url: 'https://shine.fr/jobs', source: 'Welcome to the Jungle', type: 'CDI' },
    { name: 'Iliad / Free', url: 'https://www.iliad.fr/carrieres', source: 'Site Entreprise', type: 'CDI' },
    { name: 'Orange Cyberdefense', url: 'https://orange.jobs', source: 'LinkedIn', type: 'CDI' },
    { name: 'Dassault Systèmes', url: 'https://www.3ds.com/careers', source: 'Site Entreprise', type: 'CDI' },
    { name: 'Luko', url: '', source: 'Cooptation', type: 'CDI' },
    { name: 'Agence Studio Web', url: '', source: 'Candidature Spontanée', type: 'Freelance' },
    { name: 'Inria', url: 'https://www.inria.fr', source: 'France Travail', type: 'CDD' }
  ];

  const roles = [
    'Senior Frontend Engineer (React / TypeScript)',
    'Lead Fullstack Developer',
    'Senior React Engineer',
    'Staff Software Engineer',
    'Tech Lead Node / TypeScript',
    'Product Engineer (Fullstack)',
    'Frontend Architect',
    'Senior Backend Engineer (Go / Node)',
    'Engineering Manager',
    'Senior DevOps / Platform Engineer',
    'Principal Software Architect',
    'Senior Fullstack React & Cloud Developer'
  ];

  const contractTypes = ['CDI', 'CDI', 'CDI', 'CDI', 'CDD', 'Freelance', 'Stage', 'Alternance'];
  const sourcesList = [
    'LinkedIn', 'Welcome to the Jungle', 'Workday', 'Greenhouse',
    'Lever', 'SmartRecruiters', 'Indeed', 'France Travail',
    'Site Entreprise', 'Ashby', 'Teamtailor', 'Taleo', 'Cooptation', 'Candidature Spontanée'
  ];

  const startYear = new Date().getFullYear();
  const applications = [];
  let currentId = 1;

  // Generate for 13 full consecutive calendar months: m=0 (January startYear) to m=12 (January startYear+1)
  for (let m = 0; m <= 12; m++) {
    const targetDate = new Date(startYear, m, 1);
    const yr = targetDate.getFullYear();
    const mo = targetDate.getMonth() + 1;
    const moStr = String(mo).padStart(2, '0');
    const countInMonth = 3 + (currentId % 4); // 3 to 6 applications each month

    for (let i = 0; i < countInMonth; i++) {
      const companyObj = companies[(currentId * 7 + i * 3) % companies.length];
      const role = roles[(currentId * 5 + i * 2) % roles.length];
      const contract = companyObj.type || contractTypes[(currentId + i) % contractTypes.length];
      const source = companyObj.source || sourcesList[(currentId * 3) % sourcesList.length];

      const day = Math.min(28, 2 + ((i * 7 + currentId * 3) % 25));
      const dayStr = String(day).padStart(2, '0');
      const appDateStr = `${yr}-${moStr}-${dayStr}`;

      let status = 'Postulé';
      let responseDateStr = '';

      if (m === 12) {
        // Last January (Next Year)
        const r = (currentId * 11) % 100;
        if (r < 50) {
          status = 'Postulé';
        } else if (r < 80) {
          status = 'Entretien';
          const respDay = Math.min(28, day + 5);
          responseDateStr = `${yr}-${moStr}-${String(respDay).padStart(2, '0')}`;
        } else {
          status = 'Refusé';
          const respDay = Math.min(28, day + 4);
          responseDateStr = `${yr}-${moStr}-${String(respDay).padStart(2, '0')}`;
        }
      } else {
        // Other 12 months
        const r = (currentId * 23 + m * 7) % 100;
        if (r < 25) {
          status = 'Entretien';
          const delayDays = 5 + (currentId % 10);
          const rDate = new Date(yr, mo - 1, day + delayDays);
          responseDateStr = `${rDate.getFullYear()}-${String(rDate.getMonth() + 1).padStart(2, '0')}-${String(rDate.getDate()).padStart(2, '0')}`;
        } else if (r < 35) {
          status = 'Offre';
          const delayDays = 12 + (currentId % 10);
          const rDate = new Date(yr, mo - 1, day + delayDays);
          responseDateStr = `${rDate.getFullYear()}-${String(rDate.getMonth() + 1).padStart(2, '0')}-${String(rDate.getDate()).padStart(2, '0')}`;
        } else if (r < 75) {
          status = 'Refusé';
          const delayDays = 4 + (currentId % 14);
          const rDate = new Date(yr, mo - 1, day + delayDays);
          responseDateStr = `${rDate.getFullYear()}-${String(rDate.getMonth() + 1).padStart(2, '0')}-${String(rDate.getDate()).padStart(2, '0')}`;
        } else {
          status = 'Ghosted';
          responseDateStr = '';
        }
      }

      applications.push({
        id: currentId,
        company: companyObj.name,
        role,
        date: appDateStr,
        responseDate: responseDateStr,
        source,
        status,
        type: contract,
        url: companyObj.url || ''
      });

      currentId++;
    }
  }

  applications.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return applications.map((app, idx) => ({
    ...app,
    id: idx + 1
  }));
};
