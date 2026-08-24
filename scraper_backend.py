#!/usr/bin/env python3
import sys
import json
import os
import math
import re
import logging
import pandas as pd

# Suppress logging interference on stdout
logging.basicConfig(level=logging.ERROR)
for logger_name in ['jobspy', 'urllib3', 'requests', 'tls_client']:
    logging.getLogger(logger_name).setLevel(logging.ERROR)

def clean_val(val):
    if val is None:
        return None
    if isinstance(val, float) and (math.isnan(val) or math.isinf(val)):
        return None
    if pd.isna(val):
        return None
    return val

def classify_contract(title, desc, raw_job_type):
    """
    Strictly classify the job contract type from title, description and raw job_type.
    """
    text_title = str(title or "").lower()
    text_desc = str(desc or "")[:1500].lower()
    full_text = f"{text_title} {text_desc}"
    raw_jt = str(raw_job_type or "").lower()

    # Alternance / Apprentissage
    if re.search(r'\b(alternan[ts]?|alternance|apprentissage|apprenti[es]?|contrat de pro(fessionnalisation)?|contrat pro)\b', full_text, re.I):
        return "Alternance"

    # Stage / Internship
    if re.search(r'\b(stage|stagiaire[s]?|intern|internship[s]?|trainee[s]?|pfe|fin d[\'’]études?)\b', full_text, re.I) or "intern" in raw_jt:
        return "Stage"

    # Freelance / Indépendant
    if re.search(r'\b(freelance|indépendant[s]?|independant[s]?|contractor[s]?|portage salarial|b2b)\b', full_text, re.I):
        return "Freelance"

    # CDD / Fixed-term / Intérim
    if re.search(r'\b(cdd|durée déterminée|fixed[- ]term|intérim|interim|temporaire)\b', full_text, re.I):
        return "CDD"

    # CDI / Full-time / Permanent
    if re.search(r'\b(cdi|durée indéterminée|full[- ]time|permanent|temps plein)\b', full_text, re.I) or "full" in raw_jt or "permanent" in raw_jt:
        return "CDI"

    # If raw_job_type specifies contract
    if "contract" in raw_jt:
        return "CDD"

    return "CDI"

def matches_contract_filter(classified, requested_contract):
    """
    Strict check: returns True only if the classified contract strictly matches the requested contract.
    """
    if not requested_contract or requested_contract in ["all", "any", "tous", "all_types"]:
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
    results_wanted = int(params.get("results_wanted") or 15)
    results_wanted = max(1, min(results_wanted, 50))
    
    # Supported JobSpy sites: linkedin, indeed, glassdoor, zip_recruiter, google
    requested_sites = params.get("sites") or ["linkedin", "indeed", "glassdoor"]
    valid_sites = ["linkedin", "indeed", "glassdoor", "zip_recruiter", "google"]
    
    site_names = []
    for s in requested_sites:
        s_norm = s.lower().strip().replace(" ", "_")
        if s_norm == "ziprecruiter":
            s_norm = "zip_recruiter"
        if s_norm in valid_sites and s_norm not in site_names:
            site_names.append(s_norm)

    if not site_names:
        site_names = ["linkedin", "indeed"]

    # Contract & job type strict configuration
    contract_type = params.get("contract_type") or params.get("contract")
    job_type = params.get("job_type") # fulltime, parttime, internship, contract
    
    if contract_type and contract_type not in ["all", "any", "tous", "all_types"]:
        if contract_type == "CDI":
            job_type = "fulltime"
        elif contract_type in ["Stage", "Alternance"]:
            job_type = "internship"
        elif contract_type in ["CDD", "Freelance"]:
            job_type = "contract"

    if job_type in ["all", "any", "", "tous", "all_types"]:
        job_type = None

    is_remote = bool(params.get("is_remote", False))
    
    country_indeed = params.get("country_indeed") or "france"
    loc_lower = location.lower()
    if any(k in loc_lower for k in ["france", "paris", "lyon", "marseille", "toulouse", "bordeaux", "nantes", "lille", "strasbourg", "montpellier", "rennes"]):
        country_indeed = "france"
    elif any(k in loc_lower for k in ["uk", "london", "manchester", "united kingdom"]):
        country_indeed = "uk"
    elif any(k in loc_lower for k in ["germany", "berlin", "munich", "deutschland"]):
        country_indeed = "germany"
    elif any(k in loc_lower for k in ["canada", "montreal", "toronto"]):
        country_indeed = "canada"
    elif any(k in loc_lower for k in ["usa", "united states", "us", "new york", "san francisco"]):
        country_indeed = "usa"

    hours_old = params.get("hours_old")
    if hours_old:
        try:
            hours_old = int(hours_old)
        except:
            hours_old = None

    try:
        from jobspy import scrape_jobs
        
        # When multiple keywords are given, calculate per-keyword quota
        per_keyword_wanted = max(5, int(math.ceil(results_wanted / len(keywords_list)))) if len(keywords_list) > 1 else results_wanted
        if contract_type and contract_type not in ["all", "any", "tous"]:
            fetch_results_count = min(30, per_keyword_wanted * 2)
        else:
            fetch_results_count = min(30, per_keyword_wanted)

        records = []
        seen_keys = set()

        for kw in keywords_list:
            # Adapt query slightly for specialized contracts if not present
            final_kw = kw
            kw_lower = kw.lower()
            if contract_type == "Stage" and not any(k in kw_lower for k in ["stage", "intern", "stagiaire"]):
                final_kw = f"{kw} Stage"
            elif contract_type == "Alternance" and not any(k in kw_lower for k in ["alternance", "apprentissage", "apprenti"]):
                final_kw = f"{kw} Alternance"
            elif contract_type == "CDD" and not any(k in kw_lower for k in ["cdd", "fixed"]):
                final_kw = f"{kw} CDD"
            elif contract_type == "Freelance" and not any(k in kw_lower for k in ["freelance", "indépendant", "contractor"]):
                final_kw = f"{kw} Freelance"

            try:
                jobs_df = scrape_jobs(
                    site_name=site_names,
                    search_term=final_kw,
                    location=location,
                    results_wanted=fetch_results_count,
                    is_remote=is_remote,
                    job_type=job_type,
                    country_indeed=country_indeed,
                    hours_old=hours_old,
                    description_format="markdown",
                    linkedin_fetch_description=True,
                    verbose=0
                )
            except Exception as scrape_err:
                # Continue with next keyword if one fails
                continue

            if jobs_df is None or jobs_df.empty:
                continue

            for idx, row in jobs_df.iterrows():
                title = clean_val(row.get("title")) or "Poste"
                company = clean_val(row.get("company")) or "Entreprise"
                loc = clean_val(row.get("location")) or location
                job_url = clean_val(row.get("job_url")) or clean_val(row.get("job_url_direct")) or ""
                site = clean_val(row.get("site")) or "Web"
                desc = clean_val(row.get("description")) or ""
                raw_job_type_val = clean_val(row.get("job_type")) or ""

                # Deduplication key based on URL or title+company
                dedup_key = job_url.strip().lower() if job_url else f"{str(title).strip().lower()}___{str(company).strip().lower()}"
                if dedup_key in seen_keys:
                    continue
                seen_keys.add(dedup_key)

                # Strict contract classification
                classified_contract = classify_contract(title, desc, raw_job_type_val)

                # Strict contract filtering: if a specific contract was requested, reject non-matching contracts
                if contract_type and not matches_contract_filter(classified_contract, contract_type):
                    continue

                # Strict remote filtering: if is_remote is True, verify remote match
                job_is_remote = bool(clean_val(row.get("is_remote")) or False)
                if is_remote and not job_is_remote:
                    if not re.search(r'\b(remote|télétravail|telework|100% remote|full remote)\b', f"{title} {loc} {desc[:500]}", re.I):
                        continue
                
                # Salary handling
                min_amt = clean_val(row.get("min_amount"))
                max_amt = clean_val(row.get("max_amount"))
                currency = clean_val(row.get("currency")) or "EUR"
                interval = clean_val(row.get("interval")) or "an"
                
                salary_str = None
                if min_amt and max_amt:
                    salary_str = f"{int(min_amt):,} - {int(max_amt):,} {currency}/{interval}".replace(",", " ")
                elif min_amt:
                    salary_str = f"À partir de {int(min_amt):,} {currency}".replace(",", " ")
                elif max_amt:
                    salary_str = f"Jusqu'à {int(max_amt):,} {currency}".replace(",", " ")

                date_posted = str(clean_val(row.get("date_posted")) or "")
                if date_posted and len(date_posted) > 10:
                    date_posted = date_posted[:10]

                records.append({
                    "id": f"jobspy-{str(site).lower()}-{idx}-{abs(hash(str(job_url) + str(title)))}",
                    "title": str(title),
                    "company": str(company),
                    "location": str(loc),
                    "job_url": str(job_url),
                    "site": str(site).capitalize(),
                    "description": str(desc),
                    "salary": salary_str,
                    "date_posted": date_posted,
                    "is_remote": job_is_remote or is_remote,
                    "job_type": classified_contract,
                    "contract": classified_contract,
                    "matched_keyword": kw,
                    "company_url": clean_val(row.get("company_url")),
                    "logo_photo_url": clean_val(row.get("logo_photo_url")),
                    "emails": clean_val(row.get("emails"))
                })

        print(json.dumps({
            "success": True,
            "jobs": records,
            "count": len(records),
            "sources_used": site_names,
            "searched_keywords": keywords_list
        }, ensure_ascii=False))

    except Exception as e:
        print(json.dumps({
            "success": False,
            "error": str(e),
            "jobs": []
        }))

if __name__ == "__main__":
    run_scraper()
