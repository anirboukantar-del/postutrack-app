import React from 'react';
import { 
  Mail, 
  Phone, 
  MapPin, 
  Globe, 
  Briefcase, 
  GraduationCap, 
  Code, 
  Calendar, 
  User, 
  Award,
  Layers,
  Sparkles
} from 'lucide-react';

export const RESUME_TEMPLATES = [
  {
    id: 'rendercv',
    name: 'RenderCV Classic',
    description: 'Format académique & classique serif (modèle original conservé)',
    badge: 'Original'
  },
  {
    id: 'azurill',
    name: 'Azurill',
    description: 'Tech moderne épuré avec icônes de contact et badges de compétences',
    badge: 'Reactive Resume'
  },
  {
    id: 'bronzor',
    name: 'Bronzor',
    description: 'Structure 2 colonnes avec barre latérale et monogramme',
    badge: 'Reactive Resume'
  },
  {
    id: 'dittox',
    name: 'Dittox',
    description: 'Minimaliste exécutif, typographie géométrique soignée',
    badge: 'Reactive Resume'
  }
];

export const ACCENT_COLORS = [
  { id: 'blue', name: 'Navy Blue', hex: '#2563eb', darkHex: '#1d4ed8', bgLight: '#eff6ff' },
  { id: 'indigo', name: 'Deep Indigo', hex: '#4f46e5', darkHex: '#4338ca', bgLight: '#eef2ff' },
  { id: 'emerald', name: 'Emerald Teal', hex: '#059669', darkHex: '#047857', bgLight: '#ecfdf5' },
  { id: 'slate', name: 'Slate Charcoal', hex: '#334155', darkHex: '#1e293b', bgLight: '#f8fafc' },
  { id: 'rose', name: 'Crimson Rose', hex: '#e11d48', darkHex: '#be123c', bgLight: '#fff1f2' },
  { id: 'amber', name: 'Warm Amber', hex: '#d97706', darkHex: '#b45309', bgLight: '#fffbeb' },
  { id: 'violet', name: 'Royal Violet', hex: '#7c3aed', darkHex: '#6d28d9', bgLight: '#f5f3ff' }
];

export function A4PreviewWrapper({ children, scaleMode = 'auto', className = '' }) {
  const containerRef = React.useRef(null);
  const contentRef = React.useRef(null);
  const [scale, setScale] = React.useState(1);
  const [scaledHeight, setScaledHeight] = React.useState(null);

  const calculateScale = React.useCallback(() => {
    if (!containerRef.current || !contentRef.current) return;
    
    if (scaleMode === '100%') {
      setScale(1);
      setScaledHeight(null);
      return;
    }

    if (typeof scaleMode === 'number') {
      setScale(scaleMode);
      const naturalHeight = contentRef.current.offsetHeight || 1123;
      setScaledHeight(Math.ceil(naturalHeight * scaleMode));
      return;
    }

    // Auto-fit mode: keep authentic A4 format even if screen is smaller
    const containerWidth = containerRef.current.clientWidth;
    // Standard A4 width at 96 DPI: 210mm = 793.7px (approx 794px)
    const naturalWidth = 794;

    if (containerWidth > 0 && containerWidth < naturalWidth) {
      // Leave slight comfortable margin
      const availableWidth = Math.max(160, containerWidth - 12);
      const newScale = Math.min(1, availableWidth / naturalWidth);
      setScale(newScale);
      
      const naturalHeight = contentRef.current.offsetHeight || 1123;
      setScaledHeight(Math.ceil(naturalHeight * newScale));
    } else {
      setScale(1);
      setScaledHeight(null);
    }
  }, [scaleMode]);

  React.useLayoutEffect(() => {
    calculateScale();
  }, [calculateScale]);

  React.useEffect(() => {
    calculateScale();

    let resizeObserver = null;
    if (typeof ResizeObserver !== 'undefined') {
      resizeObserver = new ResizeObserver(() => {
        calculateScale();
      });
      if (containerRef.current) resizeObserver.observe(containerRef.current);
      if (contentRef.current) resizeObserver.observe(contentRef.current);
    }

    const handleResize = () => calculateScale();
    window.addEventListener('resize', handleResize);

    const timer1 = setTimeout(calculateScale, 100);
    const timer2 = setTimeout(calculateScale, 300);

    return () => {
      if (resizeObserver) resizeObserver.disconnect();
      window.removeEventListener('resize', handleResize);
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, [calculateScale]);

  return (
    <div 
      ref={containerRef}
      className={`a4-preview-container w-full flex flex-col items-center justify-start ${className}`}
      style={{
        height: scaledHeight ? `${scaledHeight}px` : undefined,
        minHeight: scaledHeight ? `${scaledHeight}px` : undefined,
        overflow: scale < 1 ? 'hidden' : 'visible',
        transition: 'height 0.15s ease-out'
      }}
    >
      <div
        ref={contentRef}
        className="a4-sheet shrink-0 origin-top print:transform-none"
        style={{
          width: '210mm',
          minWidth: '210mm',
          transform: scale < 1 ? `scale(${scale})` : undefined,
          transformOrigin: 'top center',
          transition: 'transform 0.15s ease-out'
        }}
      >
        {children}
      </div>
    </div>
  );
}

export function ResumeRenderer({
  cv,
  profile,
  template = 'rendercv',
  accentColorHex = '#2563eb',
  density = 'normal',
  showPhoto = true,
  photoSize = 'md',
  scaleMode = 'auto',
  t,
  lang = 'fr'
}) {
  if (!cv) return null;

  const displayName = cv.fullName || profile?.fullName || (lang === 'en' ? 'Candidate' : 'Candidat');
  const displayLocation = cv.location || profile?.location;
  const displayEmail = cv.email || profile?.email;
  const displayPhone = cv.phone || profile?.phone;
  const displayWebsite = cv.website || profile?.website;

  const hasPhoto = Boolean(showPhoto && (cv.photo || profile?.photo));
  const photoUrl = cv.photo || profile?.photo;

  // Sizing map for photo
  const photoSizeClasses = {
    rendercv: {
      sm: 'w-12 h-12',
      md: 'w-16 h-16',
      lg: 'w-20 h-20'
    }[photoSize] || 'w-16 h-16',
    azurill: {
      sm: 'w-14 h-14',
      md: 'w-18 h-18 sm:w-20 sm:h-20',
      lg: 'w-24 h-24 sm:w-28 sm:h-28'
    }[photoSize] || 'w-18 h-18 sm:w-20 sm:h-20',
    bronzor: {
      sm: 'w-14 h-14',
      md: 'w-20 h-20',
      lg: 'w-24 h-24'
    }[photoSize] || 'w-20 h-20',
    dittox: {
      sm: 'w-14 h-14',
      md: 'w-18 h-18',
      lg: 'w-24 h-24'
    }[photoSize] || 'w-18 h-18'
  };

  let structuredSkills = [];
  if (cv.skills && cv.skills.length > 0) {
    if (typeof cv.skills[0] === 'string') {
      structuredSkills = [{ category: t?.skillsDefaultCategory || 'Compétences', items: cv.skills }];
    } else {
      structuredSkills = cv.skills;
    }
  }

  // Initials for monograms
  const initials = displayName
    .split(' ')
    .filter(Boolean)
    .map(n => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase() || 'CV';

  // Density spacing scales
  const densityStyles = {
    compact: {
      gap: 'gap-2.5 sm:gap-3',
      sectionGap: 'mb-2.5',
      bodyText: 'text-[11.5px] leading-snug',
      headingText: 'text-[12.5px]',
      padding: 'p-5 sm:p-6 md:p-8',
      itemGap: 'space-y-1.5'
    },
    normal: {
      gap: 'gap-3.5 sm:gap-4',
      sectionGap: 'mb-3',
      bodyText: 'text-[12px] sm:text-[12.5px] leading-relaxed',
      headingText: 'text-[13px] sm:text-[13.5px]',
      padding: 'p-6 sm:p-8 md:p-10',
      itemGap: 'space-y-2'
    },
    relaxed: {
      gap: 'gap-4 sm:gap-5',
      sectionGap: 'mb-3.5',
      bodyText: 'text-[12.5px] sm:text-[13px] leading-relaxed',
      headingText: 'text-[14px]',
      padding: 'p-7 sm:p-9 md:p-11',
      itemGap: 'space-y-2.5'
    }
  }[density] || {
    gap: 'gap-3.5 sm:gap-4',
    sectionGap: 'mb-3',
    bodyText: 'text-[12px] sm:text-[12.5px] leading-relaxed',
    headingText: 'text-[13px] sm:text-[13.5px]',
    padding: 'p-6 sm:p-8 md:p-10',
    itemGap: 'space-y-2'
  };

  const renderTemplateContent = () => {
    /* =========================================================================
       1. MODEL 1: RENDERCV CLASSIC (The exact original model, 100% preserved)
       ========================================================================= */
    if (template === 'rendercv') {
      return (
        <div 
          id="cv-render" 
          className={`bg-white border border-gray-300 ${densityStyles.padding} w-[210mm] min-w-[210mm] min-h-[297mm] box-border shadow-md text-black font-serif select-text print:border-none print:shadow-none print:p-8 print:m-0 print:w-[210mm] print:h-[297mm] print:absolute print:inset-0 flex flex-col gap-4`}
        style={{ 
          userSelect: 'text', 
          WebkitUserSelect: 'text', 
          pageBreakAfter: 'avoid', 
          breakAfter: 'avoid', 
          pageBreakInside: 'avoid',
          breakInside: 'avoid'
        }}
      >
        {/* Header */}
        <div className="text-center mb-1 flex items-center justify-center gap-4">
          {hasPhoto && (
            <img 
              src={photoUrl} 
              alt={displayName} 
              className={`${photoSizeClasses.rendercv} rounded-full object-cover border border-gray-300 shadow-2xs shrink-0`} 
            />
          )}
          <div>
            <h1 className="text-3xl font-normal mb-1">{displayName}</h1>
            <div className="text-[12px] flex justify-center items-center gap-3 flex-wrap text-gray-700">
              {displayLocation && <span>{displayLocation}</span>}
              {displayEmail && <span>| {displayEmail}</span>}
              {displayPhone && <span>| {displayPhone}</span>}
              {displayWebsite && <span>| {displayWebsite}</span>}
            </div>
          </div>
        </div>
        
        {/* Summary */}
        {cv.summary && (
          <div>
            <p className="text-[12.5px] leading-relaxed text-justify">{cv.summary}</p>
          </div>
        )}

        {/* Experiences */}
        {cv.experiences && cv.experiences.length > 0 && (
          <div>
            <h3 className="text-[13.5px] font-bold uppercase border-b-2 border-black mb-2 pb-0.5 tracking-wider">
              {t?.experienceTitle || 'Expérience Professionnelle'}
            </h3>
            <div className="flex flex-col gap-3">
              {cv.experiences.map((exp, idx) => (
                <div key={idx}>
                  <div className="flex justify-between items-baseline mb-0.5">
                    <div className="font-bold text-[13px]">{exp.company}</div>
                    <div className="text-[12px] text-gray-700">{exp.period}</div>
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

        {/* Education */}
        {cv.education && cv.education.length > 0 && (
          <div>
            <h3 className="text-[13.5px] font-bold uppercase border-b-2 border-black mb-2 pb-0.5 tracking-wider">
              {t?.educationTitle || 'Formation'}
            </h3>
            <div className="flex flex-col gap-2.5">
              {cv.education.map((edu, idx) => (
                <div key={idx}>
                  <div className="flex justify-between items-baseline mb-0.5">
                    <strong className="text-[13px]">{edu.school}</strong>
                    <span className="text-[12px] text-gray-700">{edu.year}</span>
                  </div>
                  <div className="italic text-[12.5px] text-gray-800">{edu.degree}</div>
                  {edu.description && <p className="text-[12px] text-gray-700 mt-0.5 leading-snug">{edu.description}</p>}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Skills */}
        {structuredSkills.length > 0 && (
          <div>
            <h3 className="text-[13.5px] font-bold uppercase border-b-2 border-black mb-2 pb-0.5 tracking-wider">
              {t?.skillsTitle || 'Compétences'}
            </h3>
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
    );
  }

  /* =========================================================================
     2. MODEL 2: AZURILL (Reactive Resume Classic Tech)
     Modern sans-serif, accent color header, contact badges with icons,
     clean underlines, and pill badges for skills.
     ========================================================================= */
  if (template === 'azurill') {
    return (
      <div 
        id="cv-render" 
        className={`bg-white border border-gray-200 ${densityStyles.padding} w-[210mm] min-w-[210mm] min-h-[297mm] box-border shadow-md text-slate-800 font-sans select-text print:border-none print:shadow-none print:p-8 print:m-0 print:w-[210mm] print:h-[297mm] print:absolute print:inset-0 flex flex-col ${densityStyles.gap}`}
        style={{ 
          userSelect: 'text', 
          WebkitUserSelect: 'text', 
          pageBreakAfter: 'avoid', 
          breakAfter: 'avoid', 
          pageBreakInside: 'avoid',
          breakInside: 'avoid'
        }}
      >
        {/* Header */}
        <div className="border-b pb-3 flex justify-between items-center gap-4" style={{ borderColor: `${accentColorHex}30` }}>
          <div className="flex-1">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight" style={{ color: accentColorHex }}>
              {displayName}
            </h1>
            
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 mt-2 text-[11.5px] sm:text-[12px] text-slate-600">
              {displayLocation && (
                <span className="flex items-center gap-1">
                  <MapPin size={13} style={{ color: accentColorHex }} />
                  {displayLocation}
                </span>
              )}
              {displayEmail && (
                <span className="flex items-center gap-1">
                  <Mail size={13} style={{ color: accentColorHex }} />
                  {displayEmail}
                </span>
              )}
              {displayPhone && (
                <span className="flex items-center gap-1">
                  <Phone size={13} style={{ color: accentColorHex }} />
                  {displayPhone}
                </span>
              )}
              {displayWebsite && (
                <span className="flex items-center gap-1">
                  <Globe size={13} style={{ color: accentColorHex }} />
                  {displayWebsite}
                </span>
              )}
            </div>
          </div>
          {hasPhoto && (
            <img 
              src={photoUrl} 
              alt={displayName} 
              className={`${photoSizeClasses.azurill} rounded-2xl object-cover shadow-xs border shrink-0`} 
              style={{ borderColor: accentColorHex }}
            />
          )}
        </div>

        {/* Summary */}
        {cv.summary && (
          <div>
            <p className={`${densityStyles.bodyText} text-slate-700 leading-relaxed text-justify`}>
              {cv.summary}
            </p>
          </div>
        )}

        {/* Experience */}
        {cv.experiences && cv.experiences.length > 0 && (
          <div>
            <div className="flex items-center gap-2 pb-1 mb-2.5 border-b-2" style={{ borderColor: accentColorHex }}>
              <Briefcase size={15} style={{ color: accentColorHex }} />
              <h3 className={`${densityStyles.headingText} font-bold uppercase tracking-wider text-slate-900`}>
                {t?.experienceTitle || 'Expérience Professionnelle'}
              </h3>
            </div>
            
            <div className={densityStyles.itemGap}>
              {cv.experiences.map((exp, idx) => (
                <div key={idx} className="relative pl-3 border-l-2" style={{ borderColor: `${accentColorHex}40` }}>
                  <div className="flex justify-between items-baseline flex-wrap gap-1 mb-0.5">
                    <span className="font-bold text-[13px] text-slate-900">{exp.company}</span>
                    <span className="text-[11.5px] px-2 py-0.5 rounded-full font-medium" style={{ backgroundColor: `${accentColorHex}12`, color: accentColorHex }}>
                      {exp.period}
                    </span>
                  </div>
                  <div className="text-[12.5px] font-semibold text-slate-700 mb-1">{exp.role}</div>
                  <ul className="space-y-1 text-[12px] text-slate-700">
                    {exp.achievements?.map((ach, i) => (
                      <li key={i} className="flex items-start gap-1.5 leading-snug">
                        <span className="inline-block w-1.5 h-1.5 rounded-full mt-1.5 shrink-0" style={{ backgroundColor: accentColorHex }} />
                        <span>{ach}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Education */}
        {cv.education && cv.education.length > 0 && (
          <div>
            <div className="flex items-center gap-2 pb-1 mb-2.5 border-b-2" style={{ borderColor: accentColorHex }}>
              <GraduationCap size={15} style={{ color: accentColorHex }} />
              <h3 className={`${densityStyles.headingText} font-bold uppercase tracking-wider text-slate-900`}>
                {t?.educationTitle || 'Formation'}
              </h3>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {cv.education.map((edu, idx) => (
                <div key={idx} className="p-2.5 rounded-lg border bg-slate-50/50" style={{ borderColor: `${accentColorHex}25` }}>
                  <div className="flex justify-between items-baseline gap-2 mb-0.5">
                    <span className="font-bold text-[12.5px] text-slate-900 truncate">{edu.school}</span>
                    <span className="text-[11px] font-semibold shrink-0" style={{ color: accentColorHex }}>{edu.year}</span>
                  </div>
                  <div className="text-[12px] font-medium text-slate-700">{edu.degree}</div>
                  {edu.description && <p className="text-[11.5px] text-slate-600 mt-1 leading-snug">{edu.description}</p>}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Skills */}
        {structuredSkills.length > 0 && (
          <div>
            <div className="flex items-center gap-2 pb-1 mb-2.5 border-b-2" style={{ borderColor: accentColorHex }}>
              <Code size={15} style={{ color: accentColorHex }} />
              <h3 className={`${densityStyles.headingText} font-bold uppercase tracking-wider text-slate-900`}>
                {t?.skillsTitle || 'Compétences'}
              </h3>
            </div>
            
            <div className="space-y-2">
              {structuredSkills.map((group, idx) => (
                <div key={idx} className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-2">
                  <span className="text-[11.5px] font-bold uppercase tracking-wide text-slate-700 sm:w-36 shrink-0">
                    {group.category} :
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {group.items?.map((item, i) => (
                      <span 
                        key={i} 
                        className="px-2 py-0.5 rounded-md text-[11px] font-medium border"
                        style={{ 
                          backgroundColor: `${accentColorHex}0d`, 
                          borderColor: `${accentColorHex}25`,
                          color: '#1e293b'
                        }}
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

    /* =========================================================================
       3. MODEL 3: BRONZOR (Reactive Resume 2-Column Sidebar Layout)
       Sidebar with candidate monogram, icons, skills badges, and education;
       main body with prominent header and experience timeline.
       ========================================================================= */
    if (template === 'bronzor') {
      return (
        <div 
          id="cv-render" 
          className="bg-white border border-gray-200 w-[210mm] min-w-[210mm] min-h-[297mm] box-border shadow-md text-slate-800 font-sans select-text print:border-none print:shadow-none print:p-0 print:m-0 print:w-[210mm] print:h-[297mm] print:absolute print:inset-0 flex flex-row overflow-hidden"
        style={{ 
          userSelect: 'text', 
          WebkitUserSelect: 'text', 
          pageBreakAfter: 'avoid', 
          breakAfter: 'avoid', 
          pageBreakInside: 'avoid',
          breakInside: 'avoid'
        }}
      >
        {/* Left Sidebar (~33% width) */}
        <div 
          className="w-[33%] p-5 sm:p-6 flex flex-col gap-4 text-slate-800 shrink-0 border-r"
          style={{ 
            backgroundColor: `${accentColorHex}0a`,
            borderColor: `${accentColorHex}20` 
          }}
        >
          {/* Photo (if present and enabled) */}
          {hasPhoto && (
            <div className="flex flex-col items-center text-center pb-2 border-b" style={{ borderColor: `${accentColorHex}25` }}>
              <img
                src={photoUrl}
                alt={displayName}
                className={`${photoSizeClasses.bronzor} rounded-2xl object-cover shadow-xs border`}
                style={{ borderColor: accentColorHex }}
              />
            </div>
          )}

          {/* Contact Details */}
          <div className="space-y-2 text-[11.5px]">
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5 flex items-center gap-1.5">
              <User size={13} style={{ color: accentColorHex }} />
              Contact
            </h4>
            {displayLocation && (
              <div className="flex items-start gap-2">
                <MapPin size={13} className="shrink-0 mt-0.5" style={{ color: accentColorHex }} />
                <span className="text-slate-700 break-words">{displayLocation}</span>
              </div>
            )}
            {displayEmail && (
              <div className="flex items-start gap-2">
                <Mail size={13} className="shrink-0 mt-0.5" style={{ color: accentColorHex }} />
                <span className="text-slate-700 break-all">{displayEmail}</span>
              </div>
            )}
            {displayPhone && (
              <div className="flex items-start gap-2">
                <Phone size={13} className="shrink-0 mt-0.5" style={{ color: accentColorHex }} />
                <span className="text-slate-700">{displayPhone}</span>
              </div>
            )}
            {displayWebsite && (
              <div className="flex items-start gap-2">
                <Globe size={13} className="shrink-0 mt-0.5" style={{ color: accentColorHex }} />
                <span className="text-slate-700 break-all">{displayWebsite}</span>
              </div>
            )}
          </div>

          {/* Skills in Sidebar */}
          {structuredSkills.length > 0 && (
            <div className="space-y-2.5 pt-2 border-t" style={{ borderColor: `${accentColorHex}20` }}>
              <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1 flex items-center gap-1.5">
                <Code size={13} style={{ color: accentColorHex }} />
                {t?.skillsTitle || 'Compétences'}
              </h4>
              {structuredSkills.map((group, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="text-[11px] font-bold text-slate-800 uppercase">{group.category}</div>
                  <div className="flex flex-wrap gap-1">
                    {group.items?.map((item, i) => (
                      <span 
                        key={i} 
                        className="px-1.5 py-0.5 rounded text-[10.5px] font-medium bg-white text-slate-800 border"
                        style={{ borderColor: `${accentColorHex}30` }}
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Main Content (~67% width) */}
        <div className={`w-[67%] ${densityStyles.padding} flex flex-col ${densityStyles.gap}`}>
          {/* Main Name & Title */}
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              {displayName}
            </h1>
            <div className="w-12 h-1 rounded-full mt-2" style={{ backgroundColor: accentColorHex }} />
          </div>

          {/* Summary */}
          {cv.summary && (
            <div 
              className="p-3 rounded-r-xl border-l-4 bg-slate-50/80" 
              style={{ borderColor: accentColorHex }}
            >
              <p className={`${densityStyles.bodyText} text-slate-700 leading-relaxed text-justify`}>
                {cv.summary}
              </p>
            </div>
          )}

          {/* Experience Timeline */}
          {cv.experiences && cv.experiences.length > 0 && (
            <div>
              <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2 pb-1.5 mb-3 border-b" style={{ borderColor: `${accentColorHex}30` }}>
                <Briefcase size={15} style={{ color: accentColorHex }} />
                {t?.experienceTitle || 'Expérience Professionnelle'}
              </h3>
              
              <div className="space-y-3 relative pl-4 border-l-2" style={{ borderColor: `${accentColorHex}40` }}>
                {cv.experiences.map((exp, idx) => (
                  <div key={idx} className="relative">
                    {/* Node dot on timeline */}
                    <div 
                      className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full border-2 bg-white" 
                      style={{ borderColor: accentColorHex }} 
                    />
                    <div className="flex justify-between items-baseline flex-wrap gap-1 mb-0.5">
                      <span className="font-bold text-[13px] text-slate-900">{exp.role}</span>
                      <span className="text-[11.5px] font-semibold" style={{ color: accentColorHex }}>{exp.period}</span>
                    </div>
                    <div className="text-[12px] font-medium text-slate-700 mb-1">{exp.company}</div>
                    <ul className="space-y-0.5 text-[11.5px] text-slate-600">
                      {exp.achievements?.map((ach, i) => (
                        <li key={i} className="leading-snug pl-2 border-l border-slate-200">
                          {ach}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Education / Formation under Experience */}
          {cv.education && cv.education.length > 0 && (
            <div>
              <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2 pb-1.5 mb-3 border-b" style={{ borderColor: `${accentColorHex}30` }}>
                <GraduationCap size={15} style={{ color: accentColorHex }} />
                {t?.educationTitle || 'Formation'}
              </h3>
              <div className="space-y-2.5 relative pl-4 border-l-2" style={{ borderColor: `${accentColorHex}40` }}>
                {cv.education.map((edu, idx) => (
                  <div key={idx} className="relative">
                    <div 
                      className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full border-2 bg-white" 
                      style={{ borderColor: accentColorHex }} 
                    />
                    <div className="flex justify-between items-baseline flex-wrap gap-1">
                      <span className="font-bold text-[12.5px] text-slate-900">{edu.degree}</span>
                      <span className="text-[11.5px] font-semibold" style={{ color: accentColorHex }}>{edu.year}</span>
                    </div>
                    <div className="text-[12px] text-slate-700 font-medium">{edu.school}</div>
                    {edu.description && (
                      <p className="text-[11px] text-slate-600 leading-snug mt-0.5">{edu.description}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

    /* =========================================================================
       4. MODEL 4: DITTOX (Reactive Resume Minimalist Executive)
       Ultra-refined typographic layout with hairline dividers and ample whitespace.
       ========================================================================= */
    return (
      <div 
        id="cv-render" 
        className={`bg-white border border-gray-200 ${densityStyles.padding} w-[210mm] min-w-[210mm] min-h-[297mm] box-border shadow-md text-slate-900 font-sans select-text print:border-none print:shadow-none print:p-8 print:m-0 print:w-[210mm] print:h-[297mm] print:absolute print:inset-0 flex flex-col ${densityStyles.gap}`}
        style={{ 
          userSelect: 'text', 
          WebkitUserSelect: 'text', 
          pageBreakAfter: 'avoid', 
          breakAfter: 'avoid', 
          pageBreakInside: 'avoid',
          breakInside: 'avoid'
        }}
      >
        {/* Executive Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-3 border-b-2 border-slate-900">
          <div className="flex items-center gap-4">
            {hasPhoto && (
              <img 
                src={photoUrl} 
                alt={displayName} 
                className={`${photoSizeClasses.dittox} rounded-xl object-cover shadow-xs border border-slate-300 shrink-0`} 
              />
            )}
            <div>
              <h1 className="text-2xl sm:text-3xl font-light tracking-tight text-slate-950 uppercase">
                {displayName}
              </h1>
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-widest mt-0.5">
                {displayLocation}
              </div>
            </div>
          </div>
          <div className="flex flex-wrap sm:flex-col items-start sm:items-end gap-1 text-[11.5px] text-slate-600">
            {displayEmail && <span>{displayEmail}</span>}
            {displayPhone && <span>{displayPhone}</span>}
            {displayWebsite && <span>{displayWebsite}</span>}
          </div>
        </div>

        {/* Summary */}
        {cv.summary && (
          <div>
            <p className={`${densityStyles.bodyText} text-slate-800 leading-relaxed text-justify`}>
              {cv.summary}
            </p>
          </div>
        )}

        {/* Experience */}
        {cv.experiences && cv.experiences.length > 0 && (
          <div>
            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 pb-1 mb-2 border-b border-slate-200">
              {t?.experienceTitle || 'Expérience Professionnelle'}
            </h3>
            <div className={densityStyles.itemGap}>
              {cv.experiences.map((exp, idx) => (
                <div key={idx}>
                  <div className="flex justify-between items-baseline flex-wrap gap-1 mb-0.5">
                    <div className="font-bold text-[13px] text-slate-900">
                      {exp.role} <span className="font-normal text-slate-500">— {exp.company}</span>
                    </div>
                    <span className="text-[11.5px] font-mono text-slate-500">{exp.period}</span>
                  </div>
                  <ul className="space-y-0.5 text-[12px] text-slate-700 pl-3">
                    {exp.achievements?.map((ach, i) => (
                      <li key={i} className="leading-snug list-disc">
                        {ach}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Education */}
        {cv.education && cv.education.length > 0 && (
          <div>
            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 pb-1 mb-2 border-b border-slate-200">
              {t?.educationTitle || 'Formation'}
            </h3>
            <div className="space-y-2">
              {cv.education.map((edu, idx) => (
                <div key={idx} className="flex justify-between items-baseline flex-wrap gap-1">
                  <div>
                    <span className="font-bold text-[12.5px] text-slate-900">{edu.school}</span>
                    <span className="text-[12px] text-slate-600"> — {edu.degree}</span>
                  </div>
                  <span className="text-[11.5px] font-mono text-slate-500">{edu.year}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Skills */}
        {structuredSkills.length > 0 && (
          <div>
            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 pb-1 mb-2 border-b border-slate-200">
              {t?.skillsTitle || 'Compétences'}
            </h3>
            <div className="space-y-1.5 text-[12px]">
              {structuredSkills.map((group, idx) => (
                <div key={idx} className="flex flex-row items-baseline gap-2">
                  <span className="font-bold text-[11.5px] uppercase tracking-wider text-slate-700 w-36 shrink-0">
                    {group.category}
                  </span>
                  <span className="text-slate-800 leading-snug">
                    {group.items?.join('  •  ')}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <A4PreviewWrapper scaleMode={scaleMode}>
      {renderTemplateContent()}
    </A4PreviewWrapper>
  );
}
