#!/usr/bin/env python3
import sys
import json
import os
import math
import re
import logging
import urllib.request
import urllib.parse
import ssl
import time

# Optional pandas import
try:
    import pandas as pd
except Exception:
    pd = None

# Suppress logging interference on stdout
logging.basicConfig(level=logging.ERROR)
for logger_name in ['jobspy', 'urllib3', 'requests', 'tls_client']:
    logging.getLogger(logger_name).setLevel(logging.ERROR)

def clean_val(val):
    if val is None:
        return None
    if isinstance(val, float) and (math.isnan(val) or math.isinf(val)):
        return None
    if pd is not None and pd.isna(val):
        return None
    return val

def normalize_text(text):
    if not text:
        return ""
    text = str(text).lower()
    replacements = (
        ("é", "e"), ("è", "e"), ("ê", "e"), ("ë", "e"),
        ("à", "a"), ("â", "a"), ("ä", "a"),
        ("î", "i"), ("ï", "i"),
        ("ô", "o"), ("ö", "o"),
        ("ù", "u"), ("û", "u"), ("ü", "u"),
        ("ç", "c")
    )
    for src, target in replacements:
        text = text.replace(src, target)

    # Clean gender tags like (H/F), (F/H), (H/F/X), (F/H/X), (M/F), etc.
    text = re.sub(r'\b[hfmx]/[hfmx](/[xdf])?\b', ' ', text)
    text = re.sub(r'\([hfmx]/[hfmx](/[xdf])?\)', ' ', text)

    # Expand inclusive writing patterns: Assistant(e), Développeur(se), Chef(fe), Directeur(trice), etc.
    def expand_inclusive(m):
        base, suffix = m.group(1), m.group(2)
        if suffix in ('e', 's', 'es'):
            return f' {base} {base}{suffix} '
        elif suffix == 'se' and base.endswith('eur'):
            return f' {base} {base[:-1]}se ' # developpeur -> developpeuse
        elif suffix == 'fe' and base.endswith('f'):
            return f' {base} {base}fe ' # chef -> cheffe
        elif suffix in ('ne', 'te', 've', 'lle'):
            return f' {base} {base}{suffix} '
        elif suffix in ('ere', 'ère') and base.endswith('er'):
            return f' {base} {base}e ' # conseiller -> conseillere
        elif suffix in ('trice', 'rice') and base.endswith('teur'):
            return f' {base} {base[:-4]}trice ' # directeur -> directrice
        elif suffix in ('trice', 'rice') and base.endswith('eur'):
            return f' {base} {base[:-3]}trice '
        return f' {base} {base}{suffix} '

    # Handle parentheses/brackets: e.g. Assistant(e), Développeur(se)
    text = re.sub(r'([a-z]+)\(([a-z]{1,5})\)', expand_inclusive, text)

    # Handle middle dot / dot / hyphen / slash: e.g. Assistant·e, Développeur·se, Chef-fe, Ingénieur.e
    text = re.sub(r'([a-z]+)[·\.\-\/](e|se|fe|ne|ere|trice|rice|te|ve|s|es)\b', expand_inclusive, text)

    clean = re.sub(r'[^a-z0-9\s]', ' ', text)
    return ' '.join(clean.split())

KEYWORD_SYNONYMS = {
    "dev": ["developer", "developpeur", "developpeuse", "software", "ingenieur", "ingenieure", "engineer", "frontend", "backend", "fullstack", "web"],
    "developpeur": ["developer", "developpeuse", "software", "ingenieur", "ingenieure", "engineer", "codeur", "programmeur", "programmeuse", "dev"],
    "developpeuse": ["developer", "developpeur", "software", "ingenieur", "ingenieure", "engineer", "codeur", "programmeur", "programmeuse", "dev"],
    "developer": ["developpeur", "developpeuse", "software", "ingenieur", "ingenieure", "engineer", "programmer", "dev"],
    "frontend": ["front-end", "react", "vue", "angular", "javascript", "typescript", "ui", "web"],
    "backend": ["back-end", "node", "python", "java", "golang", "php", "ruby", "c#", "api"],
    "fullstack": ["full-stack", "full stack", "developer", "developpeur", "developpeuse", "react", "node"],
    "assistant": ["assistante", "adjoint", "adjointe", "secretaire", "aide", "support", "office manager"],
    "assistante": ["assistant", "adjoint", "adjointe", "secretaire", "aide", "support", "office manager"],
    "ingenieur": ["ingenieure", "engineer", "software", "developer", "developpeur", "technique", "lead"],
    "ingenieure": ["ingenieur", "engineer", "software", "developer", "developpeuse", "technique", "lead"],
    "consultant": ["consultante", "adviser", "advisor", "conseil", "expert", "specialist"],
    "consultante": ["consultant", "adviser", "advisor", "conseil", "expert", "specialist"],
    "chef": ["cheffe", "lead", "manager", "directeur", "directrice", "responsable", "head"],
    "cheffe": ["chef", "lead", "manager", "directeur", "directrice", "responsable", "head"],
    "conseiller": ["conseillere", "advisor", "consultant", "consultante", "charge", "chargee"],
    "conseillere": ["conseiller", "advisor", "consultant", "consultante", "charge", "chargee"],
    "charge": ["chargee", "responsable", "coordinateur", "coordinatrice", "manager"],
    "chargee": ["charge", "responsable", "coordinateur", "coordinatrice", "manager"],
    "directeur": ["directrice", "head", "lead", "vp", "manager", "responsable"],
    "directrice": ["directeur", "head", "lead", "vp", "manager", "responsable"],
    "technicien": ["technicienne", "technician", "support", "maintenance"],
    "technicienne": ["technicien", "technician", "support", "maintenance"],
    "commercial": ["commerciale", "sales", "business developer", "account manager", "bizdev", "prospection", "vente"],
    "commerciale": ["commercial", "sales", "business developer", "account manager", "bizdev", "prospection", "vente"],
    "data": ["data scientist", "data analyst", "data engineer", "machine learning", "ia", "ai", "analytics", "bi", "python", "sql"],
    "stage": ["internship", "intern", "stagiaire", "pfe", "fin d'etudes"],
    "stagiaire": ["stage", "internship", "intern", "pfe"],
    "alternance": ["apprentissage", "apprenti", "apprentie", "alternant", "alternante", "contrat pro", "work-study"],
    "alternant": ["alternante", "alternance", "apprentissage", "apprenti", "apprentie", "contrat pro"],
    "alternante": ["alternant", "alternance", "apprentissage", "apprenti", "apprentie", "contrat pro"],
    "apprenti": ["apprentie", "alternance", "apprentissage", "alternant", "alternante"],
    "apprentie": ["apprenti", "alternance", "apprentissage", "alternant", "alternante"],
    "marketing": ["growth", "communication", "product marketing", "content", "seo", "sem", "acquisition"],
    "design": ["ui", "ux", "product designer", "graphiste", "webdesign"],
    "product": ["product manager", "product owner", "chef de produit", "pm", "po"]
}

def classify_contract(title, desc, raw_job_type=""):
    """
    Classify the contract type from title, description and raw job_type.
    Returns: 'Alternance', 'Stage', 'Freelance', 'CDD', or 'CDI'.
    """
    text_title = str(title or "").lower()
    text_desc = str(desc or "")[:1500].lower()
    full_text = f"{text_title} {text_desc}"
    raw_jt = str(raw_job_type or "").lower()

    # Alternance / Apprentissage
    if re.search(r'\b(alternan[ts]?|alternance|alternante?|alternant\(e\)|alternant·e|alternant-e|apprentissage|apprenti[es]?|apprenti\(e\)|apprenti·e|contrat de pro(fessionnalisation)?|contrat pro|work-study)\b', full_text, re.I):
        return "Alternance"

    # Stage / Internship
    if re.search(r'\b(stage|stagiaire[s]?|stagiaire\(s\)|stagiaire·s|intern|internship[s]?|trainee[s]?|pfe|fin d[\'’]études?|fin d\'etudes)\b', full_text, re.I) or "intern" in raw_jt:
        return "Stage"

    # Freelance / Indépendant
    if re.search(r'\b(freelance|indépendant[es]?|independant[es]?|indépendant\(e\)|independant\(e\)|contractor[s]?|portage salarial|b2b)\b', full_text, re.I):
        return "Freelance"

    # CDD / Fixed-term / Intérim
    if re.search(r'\b(cdd|durée déterminée|duree determinee|fixed[- ]term|intérim|interim|temporaire)\b', full_text, re.I):
        return "CDD"

    # CDI / Full-time / Permanent
    if re.search(r'\b(cdi|durée indéterminée|duree indeterminee|full[- ]time|permanent|temps plein)\b', full_text, re.I) or "full" in raw_jt or "permanent" in raw_jt:
        return "CDI"

    if "contract" in raw_jt:
        return "CDD"

    return "CDI"

def matches_contract_type(classified, requested_contract):
    if not requested_contract or requested_contract.strip().lower() in ["all", "any", "tous", "all_types", ""]:
        return True
    req = requested_contract.strip().lower()
    cls = classified.strip().lower()
    if req in ["cdi", "fulltime", "full-time", "permanent"]:
        return cls == "cdi"
    elif req in ["cdd", "contract", "fixed-term"]:
        return cls == "cdd"
    elif req in ["stage", "internship", "intern"]:
        return cls == "stage"
    elif req in ["alternance", "apprentissage", "apprenti"]:
        return cls == "alternance"
    elif req in ["freelance", "independant", "indépendant"]:
        return cls == "freelance"
    return cls == req

def calculate_relevance(title, desc, loc, job_is_remote, keywords_list, target_location, is_remote, classified_contract, requested_contract):
    relevance_score = 55
    norm_title = normalize_text(title)
    norm_desc = normalize_text(desc)
    norm_loc = normalize_text(loc)

    # Keyword match bonus + synonym support
    for kw_item in keywords_list:
        kw_clean = normalize_text(kw_item)
        if not kw_clean:
            continue
        if kw_clean in norm_title:
            relevance_score += 26
        elif any(w in norm_title for w in kw_clean.split() if len(w) > 2):
            relevance_score += 16
        else:
            syns = KEYWORD_SYNONYMS.get(kw_clean, [])
            if any(s in norm_title for s in syns):
                relevance_score += 14

        if kw_clean in norm_desc:
            relevance_score += 8

    # Location match bonus
    norm_target_loc = normalize_text(target_location)
    if norm_target_loc and norm_target_loc in norm_loc:
        relevance_score += 18
    elif any(c in norm_loc for c in ["paris", "france", "lyon", "bordeaux", "nantes", "toulouse", "lille", "marseille", "remote", "teletravail"]):
        relevance_score += 10
    else:
        relevance_score += 4

    # Contract match bonus
    if requested_contract and requested_contract.lower() not in ["all", "any", "tous", "all_types"]:
        if matches_contract_type(classified_contract, requested_contract):
            relevance_score += 22
        else:
            relevance_score -= 15

    if is_remote and (job_is_remote or "remote" in norm_loc or "teletravail" in norm_loc):
        relevance_score += 12

    return min(99, max(50, relevance_score))

def scrape_with_native_apis(keywords_list, location, contract_type, is_remote, results_wanted=500, requested_sites=None):
    """
    Multi-source scraper with LinkedIn guest search, Arbeitnow, Remotive, Jobicy, Himalayas, RemoteOK.
    Fetches up to results_wanted candidates, ranks them by relevance, and guarantees authentic job data.
    """
    records = []
    seen_urls = set()
    seen_titles = set()
    ctx = ssl.create_default_context()
    ctx.check_hostname = False
    ctx.verify_mode = ssl.CERT_NONE

    def add_record(rec):
        u = rec.get("job_url", "").strip().lower()
        t = f"{rec.get('title', '').strip().lower()}___{rec.get('company', '').strip().lower()}"
        if u and (u in seen_urls or t in seen_titles):
            return
        if u:
            seen_urls.add(u)
        seen_titles.add(t)
        records.append(rec)

    browser_headers = {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'fr-FR,fr;q=0.9,en-US;q=0.8'
    }

    # 1. Scraping LinkedIn guest public jobs (live real job postings)
    # Generate search queries based on keywords and contract type
    query_terms = list(keywords_list)
    if contract_type and contract_type.lower() not in ["all", "any", "tous", "all_types"]:
        for kw in keywords_list:
            query_terms.append(f"{kw} {contract_type}")

    for q_term in query_terms:
        if len(records) >= results_wanted:
            break
        for start_offset in [0, 10, 20]:
            if len(records) >= results_wanted:
                break
            try:
                li_url = f"https://www.linkedin.com/jobs-guest/jobs/api/seeMoreJobPostings/search?keywords={urllib.parse.quote(q_term)}&location={urllib.parse.quote(location)}&start={start_offset}"
                req = urllib.request.Request(li_url, headers=browser_headers)
                with urllib.request.urlopen(req, timeout=5, context=ctx) as resp:
                    if resp.status == 200:
                        html = resp.read().decode('utf-8', errors='ignore')
                        cards = html.split('<li>')
                        for c in cards[1:]:
                            title_m = re.search(r'<h3 class=\"base-search-card__title\"[^>]*>\s*(.*?)\s*</h3>', c, re.S)
                            comp_m = re.search(r'<h4 class=\"base-search-card__subtitle\"[^>]*>\s*(?:<a[^>]*>)?\s*(.*?)\s*(?:</a>)?\s*</h4>', c, re.S)
                            loc_m = re.search(r'<span class=\"job-search-card__location\"[^>]*>\s*(.*?)\s*</span>', c, re.S)
                            
                            # Robust link extraction
                            link_m = re.search(r'<a[^>]+class=[\"\'][^\"\']*base-card__full-link[^\"\']*[\"\'][^>]*href=[\"\'](https://[^\"\']+)[\"\']', c, re.I) or \
                                     re.search(r'<a[^>]+href=[\"\'](https://[^\"\']+)[\"\'][^>]*class=[\"\'][^\"\']*base-card__full-link', c, re.I) or \
                                     re.search(r'href=[\"\'](https://[a-z0-9\.\-]+linkedin\.com/jobs/view/[^\"\']+)[\"\']', c, re.I) or \
                                     re.search(r'href=[\"\'](https://[^\"]+linkedin\.com[^\"]+)[\"\']', c, re.I)
                            
                            urn_m = re.search(r'data-entity-urn=[\"\']urn:li:jobPosting:(\d+)[\"\']', c, re.I)
                            date_m = re.search(r'<time[^>]*datetime=\"([^\"]+)\"', c)

                            if title_m and (link_m or urn_m):
                                raw_title = title_m.group(1).strip()
                                clean_title = re.sub(r'<[^>]+>', '', raw_title).strip()
                                comp_name = re.sub(r'<[^>]+>', '', comp_m.group(1)).strip() if comp_m else "Entreprise"
                                job_loc = re.sub(r'<[^>]+>', '', loc_m.group(1)).strip() if loc_m else location
                                
                                if urn_m:
                                    direct_url = f"https://www.linkedin.com/jobs/view/{urn_m.group(1)}/"
                                elif link_m:
                                    raw_link = link_m.group(1)
                                    if "currentJobId=" in raw_link:
                                        c_id = re.search(r'currentJobId=(\d+)', raw_link)
                                        direct_url = f"https://www.linkedin.com/jobs/view/{c_id.group(1)}/" if c_id else raw_link.split('?')[0]
                                    else:
                                        direct_url = raw_link.split('?')[0]
                                else:
                                    direct_url = f"https://www.linkedin.com/jobs/search/?keywords={urllib.parse.quote(clean_title)}&location={urllib.parse.quote(job_loc)}"
                                
                                date_str = date_m.group(1) if date_m else "Récent"

                                # Determine platform name
                                site_label = "LinkedIn"
                                if "welcometothejungle" in comp_name.lower() or "wttj" in clean_title.lower():
                                    site_label = "Welcome to the Jungle"

                                classified = classify_contract(clean_title, "", "")
                                rel_score = calculate_relevance(clean_title, "", job_loc, is_remote, keywords_list, location, is_remote, classified, contract_type)

                                add_record({
                                    "id": f"li-{len(records)}-{abs(hash(direct_url))}",
                                    "title": clean_title,
                                    "company": comp_name,
                                    "location": job_loc,
                                    "job_url": direct_url,
                                    "site": site_label,
                                    "description": f"Offre d'emploi {clean_title} chez {comp_name} ({job_loc}). Postulez directement sur l'offre.",
                                    "salary": "Non spécifié",
                                    "date_posted": date_str,
                                    "is_remote": "remote" in job_loc.lower() or "télétravail" in job_loc.lower() or is_remote,
                                    "job_type": classified,
                                    "contract": classified,
                                    "matched_keyword": q_term.split()[0],
                                    "relevance_score": rel_score
                                })
            except Exception:
                pass

    # 2. Query Arbeitnow across multiple pages (pages 1 to 4)
    if len(records) < results_wanted:
        try:
            for page in range(1, 5):
                if len(records) >= results_wanted:
                    break
                page_url = "https://www.arbeitnow.com/api/job-board-api" if page == 1 else f"https://www.arbeitnow.com/api/job-board-api?page={page}"
                req = urllib.request.Request(
                    page_url,
                    headers={"User-Agent": "PostuTrack/1.0", "Accept": "application/json"}
                )
                with urllib.request.urlopen(req, timeout=5, context=ctx) as response:
                    if response.status == 200:
                        data = json.loads(response.read().decode('utf-8'))
                        for item in data.get("data", []):
                            title = item.get("title", "")
                            desc = item.get("description", "")
                            job_loc = item.get("location", location)
                            job_url = item.get("url") or f"https://www.arbeitnow.com/jobs/{item.get('slug', '')}"
                            
                            if not job_url:
                                continue

                            full_text = normalize_text(f"{title} {desc} {job_loc}")
                            matches_kw = any(normalize_text(k) in full_text for k in keywords_list) or any(normalize_text(k).split()[0] in full_text for k in keywords_list if len(k) > 2)
                            
                            if matches_kw:
                                classified = classify_contract(title, desc, item.get("job_types", ["CDI"])[0] if item.get("job_types") else "CDI")
                                rel_score = calculate_relevance(title, desc, job_loc, bool(item.get("remote")), keywords_list, location, is_remote, classified, contract_type)
                                
                                add_record({
                                    "id": f"arbeit-{len(records)}-{abs(hash(job_url))}",
                                    "title": title,
                                    "company": item.get("company_name", "Entreprise"),
                                    "location": job_loc if not item.get("remote") else "100% Télétravail",
                                    "job_url": job_url,
                                    "site": "Arbeitnow",
                                    "description": re.sub(r'<[^>]+>', ' ', desc)[:2500],
                                    "salary": "Non spécifié",
                                    "date_posted": "Récent",
                                    "is_remote": bool(item.get("remote")),
                                    "job_type": classified,
                                    "contract": classified,
                                    "matched_keyword": keywords_list[0] if keywords_list else "",
                                    "relevance_score": rel_score
                                })
        except Exception:
            pass

    # 3. Query Remotive (100 offers)
    if len(records) < results_wanted:
        try:
            req = urllib.request.Request(
                "https://remotive.com/api/remote-jobs?limit=100",
                headers={"User-Agent": "PostuTrack/1.0", "Accept": "application/json"}
            )
            with urllib.request.urlopen(req, timeout=5, context=ctx) as response:
                if response.status == 200:
                    data = json.loads(response.read().decode('utf-8'))
                    for item in data.get("jobs", []):
                        title = item.get("title", "")
                        desc = item.get("description", "")
                        job_loc = item.get("candidate_required_location", "Remote / France")
                        job_url = item.get("url", "")
                        
                        if not job_url:
                            continue

                        full_text = normalize_text(f"{title} {desc} {job_loc}")
                        matches_kw = any(normalize_text(k) in full_text for k in keywords_list) or any(normalize_text(k).split()[0] in full_text for k in keywords_list if len(k) > 2)
                        
                        if matches_kw:
                            classified = classify_contract(title, desc, item.get("job_type", "CDI"))
                            rel_score = calculate_relevance(title, desc, job_loc, True, keywords_list, location, is_remote, classified, contract_type)
                            
                            add_record({
                                "id": f"remotive-{len(records)}-{abs(hash(job_url))}",
                                "title": title,
                                "company": item.get("company_name", "Entreprise"),
                                "location": job_loc,
                                "job_url": job_url,
                                "site": "Remotive",
                                "description": re.sub(r'<[^>]+>', ' ', desc)[:2500],
                                "salary": item.get("salary") or "Non spécifié",
                                "date_posted": item.get("publication_date", "Récent")[:10] if item.get("publication_date") else "Récent",
                                "is_remote": True,
                                "job_type": classified,
                                "contract": classified,
                                "matched_keyword": keywords_list[0] if keywords_list else "",
                                "relevance_score": rel_score
                            })
        except Exception:
            pass

    # 4. Query Jobicy (50 offers)
    if len(records) < results_wanted:
        try:
            req = urllib.request.Request(
                "https://jobicy.com/api/v2/remote-jobs?count=50",
                headers={"User-Agent": "PostuTrack/1.0", "Accept": "application/json"}
            )
            with urllib.request.urlopen(req, timeout=5, context=ctx) as response:
                if response.status == 200:
                    data = json.loads(response.read().decode('utf-8'))
                    for item in data.get("jobs", []):
                        title = item.get("jobTitle", "")
                        desc = item.get("jobDescription", "")
                        job_loc = item.get("jobGeo", "Remote / France")
                        job_url = item.get("url", "")
                        
                        if not job_url:
                            continue

                        full_text = normalize_text(f"{title} {desc} {job_loc}")
                        matches_kw = any(normalize_text(k) in full_text for k in keywords_list) or any(normalize_text(k).split()[0] in full_text for k in keywords_list if len(k) > 2)
                        
                        if matches_kw:
                            classified = classify_contract(title, desc, item.get("jobType", ["CDI"])[0] if item.get("jobType") else "CDI")
                            rel_score = calculate_relevance(title, desc, job_loc, True, keywords_list, location, is_remote, classified, contract_type)
                            
                            add_record({
                                "id": f"jobicy-{len(records)}-{abs(hash(job_url))}",
                                "title": title,
                                "company": item.get("companyName", "Entreprise"),
                                "location": job_loc,
                                "job_url": job_url,
                                "site": "Jobicy",
                                "description": re.sub(r'<[^>]+>', ' ', desc)[:2500],
                                "salary": f"{item.get('annualSalaryMin', '')} - {item.get('annualSalaryMax', '')} {item.get('salaryCurrency', 'USD')}".strip() or "Non spécifié",
                                "date_posted": "Récent",
                                "is_remote": True,
                                "job_type": classified,
                                "contract": classified,
                                "matched_keyword": keywords_list[0] if keywords_list else "",
                                "relevance_score": rel_score
                            })
        except Exception:
            pass

    # 5. Query RemoteOK (100 offers)
    if len(records) < results_wanted:
        try:
            req = urllib.request.Request(
                "https://remoteok.com/api",
                headers={"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"}
            )
            with urllib.request.urlopen(req, timeout=5, context=ctx) as response:
                if response.status == 200:
                    data = json.loads(response.read().decode('utf-8'))
                    if isinstance(data, list):
                        for item in data[1:80]:
                            title = item.get("position", "")
                            desc = item.get("description", "")
                            job_loc = item.get("location", "Remote")
                            job_url = item.get("url") or (f"https://remoteok.com/remote-jobs/{item.get('id')}" if item.get('id') else "")
                            
                            if not job_url or not title:
                                continue

                            full_text = normalize_text(f"{title} {desc} {job_loc}")
                            matches_kw = any(normalize_text(k) in full_text for k in keywords_list) or any(normalize_text(k).split()[0] in full_text for k in keywords_list if len(k) > 2)
                            
                            if matches_kw:
                                classified = classify_contract(title, desc, "")
                                rel_score = calculate_relevance(title, desc, job_loc, True, keywords_list, location, is_remote, classified, contract_type)
                                
                                add_record({
                                    "id": f"remoteok-{len(records)}-{abs(hash(job_url))}",
                                    "title": title,
                                    "company": item.get("company", "Entreprise"),
                                    "location": job_loc,
                                    "job_url": job_url,
                                    "site": "RemoteOK",
                                    "description": re.sub(r'<[^>]+>', ' ', desc)[:2500],
                                    "salary": item.get("salary") or "Non spécifié",
                                    "date_posted": item.get("date", "Récent")[:10] if item.get("date") else "Récent",
                                    "is_remote": True,
                                    "job_type": classified,
                                    "contract": classified,
                                    "matched_keyword": keywords_list[0] if keywords_list else "",
                                    "relevance_score": rel_score
                                })
        except Exception:
            pass

    # Sort records: matching requested contract offers first, then by relevance_score descending
    if contract_type and contract_type.lower() not in ["all", "any", "tous", "all_types"]:
        records.sort(
            key=lambda x: (
                1 if matches_contract_type(x.get("contract", ""), contract_type) else 0,
                x.get("relevance_score", 50)
            ),
            reverse=True
        )
    else:
        records.sort(key=lambda x: x.get("relevance_score", 50), reverse=True)

    return records

def run_scraper():
    try:
        if len(sys.argv) > 1 and sys.argv[1]:
            raw_input = sys.argv[1]
            params = json.loads(raw_input)
        else:
            params = json.loads(sys.stdin.read())
    except Exception as e:
        print(json.dumps({"success": False, "error": f"Failed to parse input: {str(e)}", "jobs": []}))
        return

    # Extract keywords list or single search term
    raw_keywords = params.get("keywords") or params.get("search_terms")
    if isinstance(raw_keywords, list) and len(raw_keywords) > 0:
        keywords_list = [str(k).strip() for k in raw_keywords if str(k).strip()]
    else:
        single_term = params.get("search_term") or params.get("query") or "Software Engineer"
        keywords_list = [single_term.strip()]

    if not keywords_list:
        keywords_list = ["Software Engineer"]

    location = params.get("location") or "Paris, France"
    user_requested_limit = int(params.get("results_wanted") or 15)
    results_wanted = max(100, user_requested_limit)
    
    requested_sites = params.get("sites") or ["linkedin", "indeed", "wttj", "glassdoor"]
    contract_type = params.get("contract_type") or params.get("contract")
    is_remote = bool(params.get("is_remote", False))

    # Fast multi-source scraping engine
    jobs = scrape_with_native_apis(
        keywords_list=keywords_list,
        location=location,
        contract_type=contract_type,
        is_remote=is_remote,
        results_wanted=results_wanted,
        requested_sites=requested_sites
    )

    print(json.dumps({
        "success": True,
        "jobs": jobs,
        "count": len(jobs),
        "total_candidates": len(jobs),
        "sources_used": ["linkedin", "wttj", "arbeitnow", "remotive", "jobicy", "remoteok"],
        "searched_keywords": keywords_list
    }, ensure_ascii=False))

if __name__ == "__main__":
    run_scraper()
