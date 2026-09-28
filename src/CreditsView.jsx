import React from 'react';
import {
  Github,
  Linkedin,
  Instagram,
  ExternalLink,
  Code2,
  Sparkles,
  FileCode2,
  Layers,
  Compass,
  UserCheck
} from 'lucide-react';
import { openExternalLink } from './App';

export function CreditsView({ t, lang }) {
  const contacts = [
    {
      id: 'x',
      name: 'X (Twitter)',
      handle: '@ANIRSURX',
      url: 'https://x.com/ANIRSURX',
      description: lang === 'en' ? 'Follow on X for updates and tech discussions' : 'Suivez mon compte X pour les actualités et échanges tech',
      badge: lang === 'en' ? 'Social' : 'Réseau',
      badgeColor: 'bg-black text-white dark:bg-white dark:text-black',
      icon: (
        <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      )
    },
    {
      id: 'instagram',
      name: 'Instagram',
      handle: '@anirsurinsta',
      url: 'https://www.instagram.com/anirsurinsta/',
      description: lang === 'en' ? 'Follow creative projects and daily updates' : 'Suivez mes projets créatifs et actualités sur Instagram',
      badge: lang === 'en' ? 'Visual' : 'Photos & Projets',
      badgeColor: 'bg-gradient-to-r from-purple-600 via-pink-500 to-amber-500 text-white',
      icon: <Instagram className="w-5 h-5" />
    },
    {
      id: 'linkedin',
      name: 'LinkedIn',
      handle: 'Anir Boukantar',
      url: 'https://www.linkedin.com/in/anirboukantar/',
      description: lang === 'en' ? 'Connect on LinkedIn for professional collaborations' : 'Retrouvez mon profil professionnel et échangeons sur LinkedIn',
      badge: lang === 'en' ? 'Professional' : 'Professionnel',
      badgeColor: 'bg-[#0077b5] text-white',
      icon: <Linkedin className="w-5 h-5" />
    }
  ];

  const codeCredits = [
    {
      id: 'rendercv',
      name: 'RenderCV',
      repoUrl: 'https://github.com/rendercv/rendercv.git',
      webUrl: 'https://github.com/rendercv/rendercv',
      category: lang === 'en' ? 'CV Typography & Layout' : 'Moteur de rendu CV & Typographie',
      description: lang === 'en' 
        ? 'A clean, typography-focused LaTeX/Typst Curriculum Vitae generator and standard schema for developer resumes.'
        : 'Générateur de CV basé sur LaTeX et Typst, inspirant la structuration sémantique et la mise en page optimisée pour les recruteurs.',
      tags: ['LaTeX', 'Typst', 'Resume Engine', 'YAML Schema'],
      icon: <FileCode2 className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />,
      accentBg: 'bg-indigo-50/70 dark:bg-indigo-950/30 border-indigo-200/90 dark:border-indigo-700/60',
      btnStyle: 'bg-indigo-600 hover:bg-indigo-700 text-white dark:bg-indigo-600 dark:hover:bg-indigo-500 dark:text-white',
      dividerColor: 'border-indigo-200/70 dark:border-indigo-800/50'
    },
    {
      id: 'jinaai',
      name: 'Jina AI (Reader & Search)',
      repoUrl: 'https://github.com/jina-ai',
      webUrl: 'https://github.com/jina-ai',
      category: lang === 'en' ? 'Web Extraction & NLP' : 'Extraction Web & Traitement NLP',
      description: lang === 'en'
        ? 'Neural search and Reader API empowering fast, clean URL parsing and intelligent job offer extraction without clutter.'
        : 'API Reader et modèles de recherche neuronale permettant d’extraire proprement le contenu des offres d’emploi depuis les URLs (LinkedIn, WTTJ, etc.).',
      tags: ['Reader API', 'Neural Search', 'Job Extraction', 'Web Scraping'],
      icon: <Sparkles className="w-6 h-6 text-sky-600 dark:text-sky-400" />,
      accentBg: 'bg-sky-50/70 dark:bg-sky-950/30 border-sky-200/90 dark:border-sky-700/60',
      btnStyle: 'bg-sky-600 hover:bg-sky-700 text-white dark:bg-sky-600 dark:hover:bg-sky-500 dark:text-white',
      dividerColor: 'border-sky-200/70 dark:border-sky-800/50'
    },
    {
      id: 'reactiveresume',
      name: 'Reactive Resume',
      repoUrl: 'https://github.com/amruthpillai/reactive-resume.git',
      webUrl: 'https://github.com/amruthpillai/reactive-resume',
      category: lang === 'en' ? 'Open Source Resume Builder' : 'Constructeur de CV Open Source',
      description: lang === 'en'
        ? 'A free and open-source resume builder designed to make creating, updating and sharing resumes effortless.'
        : 'Projet open source de référence pour la création et la composition de CVs modulaires, respectant la vie privée et les normes ATS.',
      tags: ['React', 'Modular CV', 'Open Source', 'Privacy First'],
      icon: <Layers className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />,
      accentBg: 'bg-emerald-50/70 dark:bg-emerald-950/30 border-emerald-200/90 dark:border-emerald-700/60',
      btnStyle: 'bg-emerald-600 hover:bg-emerald-700 text-white dark:bg-emerald-600 dark:hover:bg-emerald-500 dark:text-white',
      dividerColor: 'border-emerald-200/70 dark:border-emerald-800/50'
    },
    {
      id: 'jobspy',
      name: 'JobSpy',
      repoUrl: 'https://github.com/speedyapply/JobSpy.git',
      webUrl: 'https://github.com/speedyapply/JobSpy',
      category: lang === 'en' ? 'Multi-Platform Scraping' : 'Agrégation d\'offres Multi-Plateformes',
      description: lang === 'en'
        ? '4-in-1 Job Scraping Library aggregation for LinkedIn, Indeed, Glassdoor, and ZipRecruiter with multi-threaded queries.'
        : 'Bibliothèque d’agrégation d’offres d’emploi 4-en-1 (LinkedIn, Indeed, Glassdoor, ZipRecruiter) pour automatiser la veille et le sourcing.',
      tags: ['Job Scraper (WIP)', 'LinkedIn', 'Indeed', 'Multi-Search'],
      icon: <Compass className="w-6 h-6 text-amber-600 dark:text-amber-400" />,
      accentBg: 'bg-amber-50/70 dark:bg-amber-950/30 border-amber-200/90 dark:border-amber-700/60',
      btnStyle: 'bg-amber-600 hover:bg-amber-700 text-white dark:bg-amber-600 dark:hover:bg-amber-500 dark:text-white',
      dividerColor: 'border-amber-200/70 dark:border-amber-800/50'
    }
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-200 pb-12 pt-2">
      {/* SECTION 1: CONTACTS & SOCIALS */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
              {lang === 'en' ? 'My Contacts & Social Links' : 'Mes Réseaux & Contacts'}
            </h3>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
              {lang === 'en' ? 'Direct channels to reach out and follow development' : 'Mes profils officiels pour échanger, collaborer et suivre les projets'}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {contacts.map((contact) => (
            <div
              key={contact.id}
              className="p-4 rounded-lg bg-gray-50/70 dark:bg-gray-800/40 border border-gray-200 dark:border-gray-700/60 flex flex-col justify-between group transition-all"
            >
              <div>
                <div className="flex items-center justify-between mb-2.5">
                  <div className="flex items-center gap-3">
                    <div className="text-gray-800 dark:text-gray-100 group-hover:scale-105 transition-transform shrink-0">
                      {contact.icon}
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 dark:text-white text-sm sm:text-base">
                        {contact.name}
                      </h4>
                      <div className="text-xs font-semibold text-blue-600 dark:text-blue-400">
                        {contact.handle}
                      </div>
                    </div>
                  </div>
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed min-h-[36px]">
                  {contact.description}
                </p>
              </div>

              <div className="pt-3 mt-2 border-t border-gray-200/60 dark:border-gray-700/60">
                <a
                  href={contact.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => openExternalLink(contact.url, e)}
                  className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer"
                >
                  <ExternalLink size={13} />
                  <span>{lang === 'en' ? 'Open Profile' : 'Voir le profil'}</span>
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* SECTION 2: CODE CREDITS */}
      <div className="space-y-4 pt-2">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
              {lang === 'en' ? 'Code & Open-Source Credits' : 'Crédits Code & Projets Open Source'}
            </h3>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
              {lang === 'en'
                ? 'Key repositories, tools, and libraries that provided technical inspiration and power'
                : 'Bibliothèques, dépôts et frameworks open source ayant inspiré l’architecture et les fonctionnalités'}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {codeCredits.map((item) => (
            <div
              key={item.id}
              className={`p-4 rounded-lg border ${item.accentBg} flex flex-col justify-between transition-all`}
            >
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="text-gray-700 dark:text-gray-300 shrink-0">
                    {item.icon}
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 dark:text-white text-base flex items-center gap-2">
                      <span>{item.name}</span>
                    </h4>
                    <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">
                      {item.category}
                    </span>
                  </div>
                </div>

                <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed mb-3">
                  {item.description}
                </p>
              </div>

              <div className={`pt-2.5 border-t ${item.dividerColor || 'border-gray-200/60 dark:border-gray-700/60'}`}>
                <a
                  href={item.webUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => openExternalLink(item.webUrl, e)}
                  className={`w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 ${item.btnStyle} rounded-lg text-xs font-bold transition-all cursor-pointer shadow-xs active:scale-[0.99]`}
                >
                  <Github size={14} className="shrink-0 text-white" />
                  <span className="text-white font-semibold">{lang === 'en' ? 'View on GitHub' : 'Voir sur GitHub'}</span>
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
