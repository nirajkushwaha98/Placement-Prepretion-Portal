import re
from typing import Dict, List, Any

# Curated Technical Knowledge Taxonomy
PROGRAMMING_LANGUAGES = [
    'Python', 'Java', 'C++', 'C', 'C#', 'JavaScript', 'TypeScript',
    'Go', 'Golang', 'Rust', 'Ruby', 'PHP', 'Swift', 'Kotlin', 'R',
    'Scala', 'Dart', 'SQL', 'HTML', 'CSS', 'Bash', 'Shell'
]

FRAMEWORKS_LIBRARIES = [
    'React', 'React.js', 'Next.js', 'Vue', 'Vue.js', 'Angular',
    'Django', 'Django REST Framework', 'Flask', 'FastAPI',
    'Node.js', 'Express', 'Express.js', 'Spring', 'Spring Boot',
    'ASP.NET', 'Laravel', 'Tailwind CSS', 'Bootstrap', 'Redux',
    'PyTorch', 'TensorFlow', 'Keras', 'Scikit-Learn', 'Pandas', 'NumPy',
    'OpenCV', 'NLTK', 'spaCy', 'GraphQL'
]

TOOLS_PLATFORMS = [
    'Git', 'GitHub', 'GitLab', 'Docker', 'Kubernetes', 'AWS', 'Amazon Web Services',
    'GCP', 'Google Cloud', 'Azure', 'Linux', 'Postman', 'Jira', 'Jenkins',
    'CI/CD', 'Firebase', 'Supabase', 'Vercel', 'Netlify', 'Nginx', 'Kafka',
    'RabbitMQ', 'Redis', 'PostgreSQL', 'MySQL', 'MongoDB', 'SQLite', 'Oracle'
]

ACTION_VERBS = [
    'developed', 'implemented', 'designed', 'optimized', 'architected', 'automated',
    'built', 'deployed', 'engineered', 'led', 'created', 'reduced', 'improved',
    'integrated', 'scaled', 'managed', 'configured', 'resolved', 'streamlined', 'analyzed'
]

MEASURABLE_METRIC_PATTERNS = [
    r'\b\d+%',                      # 25%
    r'\b\d+x\b',                    # 2x, 10x
    r'\$\d+',                       # $5000
    r'\b\d+\s*(ms|sec|seconds|min|minutes|hours|days|k|m|kilo|million)\b', # 100ms, 5 days
    r'\b(increased|decreased|reduced|boosted|accelerated|improved)\s+by\s+\d+%',
    r'\b\d+\+\s*(users|clients|requests|queries|downloads|stars)\b',
]

class ResumeAnalyzerNLP:
    @classmethod
    def analyze(cls, text: str) -> Dict[str, Any]:
        """
        Performs comprehensive NLP-based information extraction, section analysis,
        and ATS metric scoring.
        """
        if not text or len(text.strip()) < 20:
            return cls._empty_fallback_analysis()

        lower_text = text.lower()

        # 1. Contact & Identity Extraction
        email = cls._extract_email(text)
        phone = cls._extract_phone(text)
        name = cls._extract_name(text)
        links = cls._extract_links(text)

        # 2. Section Extraction & Classification
        sections = cls._split_into_sections(text)

        # 3. Technical Skill Entity Extraction
        found_languages = cls._find_matches(text, PROGRAMMING_LANGUAGES)
        found_frameworks = cls._find_matches(text, FRAMEWORKS_LIBRARIES)
        found_tools = cls._find_matches(text, TOOLS_PLATFORMS)
        all_skills = list(dict.fromkeys(found_languages + found_frameworks + found_tools))

        # 4. Education & Degrees
        education_info = cls._extract_education(text)

        # 5. Projects & Experience
        projects_info = cls._extract_projects(sections.get('projects', ''))
        experience_info = cls._extract_experience(sections.get('experience', ''))
        certifications_info = cls._extract_certifications(sections.get('certifications', ''))
        achievements_info = cls._extract_achievements(sections.get('achievements', ''))

        # 6. Action Verbs & Metrics Count
        action_verb_count = sum(1 for verb in ACTION_VERBS if re.search(r'\b' + verb + r'\b', lower_text))
        measurable_metrics_count = sum(len(re.findall(pat, text, re.IGNORECASE)) for pat in MEASURABLE_METRIC_PATTERNS)

        # 7. Category Scoring (out of 100 total)
        cat_scores = {}

        # Skills (Max: 15)
        skill_score = min(15.0, (len(all_skills) / 8.0) * 15.0)
        cat_scores['skills'] = round(skill_score, 1)

        # Education (Max: 15)
        edu_score = 15.0 if education_info else (10.0 if any(deg in lower_text for deg in ['bachelor', 'b.tech', 'degree', 'university', 'college']) else 5.0)
        cat_scores['education'] = round(edu_score, 1)

        # Projects (Max: 20)
        proj_text = sections.get('projects', '')
        if proj_text:
            proj_score = 14.0 + (3.0 if measurable_metrics_count > 0 else 0.0) + (3.0 if 'github' in lower_text else 0.0)
        elif len(all_skills) >= 4:
            proj_score = 12.0
        else:
            proj_score = 6.0
        cat_scores['projects'] = round(min(20.0, proj_score), 1)

        # Experience (Max: 15)
        exp_text = sections.get('experience', '')
        if exp_text and len(exp_text) > 100:
            exp_score = 15.0
        elif any(k in lower_text for k in ['intern', 'internship', 'experience', 'worked as', 'developer']):
            exp_score = 11.0
        else:
            exp_score = 6.0
        cat_scores['experience'] = round(exp_score, 1)

        # Certifications (Max: 10)
        cert_text = sections.get('certifications', '')
        if cert_text or len(certifications_info) > 0:
            cert_score = 10.0
        elif any(c in lower_text for c in ['certified', 'certification', 'certificate', 'coursera', 'udemy', 'hackerrank', 'leetcode']):
            cert_score = 8.0
        else:
            cert_score = 4.0
        cat_scores['certifications'] = round(cert_score, 1)

        # Keywords (Max: 10)
        keyword_ratio = min(1.0, (len(all_skills) + action_verb_count) / 15.0)
        cat_scores['keywords'] = round(keyword_ratio * 10.0, 1)

        # Structure (Max: 10)
        has_contact = bool(email and (phone or links.get('github') or links.get('linkedin')))
        sections_found = len([s for s, t in sections.items() if t])
        structure_score = (5.0 if has_contact else 2.0) + (5.0 if sections_found >= 3 else 2.5)
        cat_scores['structure'] = round(structure_score, 1)

        # ATS Compatibility (Max: 5)
        ats_score = 5.0 if (email and phone and has_contact and len(text) > 300) else 3.5
        cat_scores['ats_compatibility'] = round(ats_score, 1)

        # Total Overall Score
        overall_score = round(sum(cat_scores.values()), 1)

        # 8. Strengths, Weaknesses & Recommendations Generation
        strengths = []
        weaknesses = []
        suggestions = []

        if len(all_skills) >= 6:
            strengths.append(f"Strong technical stack with {len(all_skills)}+ identified skills across languages and frameworks.")
        if found_languages:
            strengths.append(f"Good programming foundations: {', '.join(found_languages[:4])}.")
        if education_info:
            strengths.append("Clear education and academic degree background listed.")
        if links.get('github') or 'github.com' in lower_text:
            strengths.append("Contains GitHub repository links demonstrating practical code implementation.")
        if certifications_info or cat_scores['certifications'] >= 8:
            strengths.append("Includes relevant professional or course certifications.")

        if not links.get('github') and 'github' not in lower_text:
            weaknesses.append("Missing GitHub or portfolio URL to showcase actual code repositories.")
            suggestions.append("Add clickable links to your GitHub profile and prominent project repositories.")

        if measurable_metrics_count < 2:
            weaknesses.append("Project descriptions lack quantifiable impact (e.g. % performance increase, latency reduction, user counts).")
            suggestions.append("Add measurable outcomes in project bullets using the formula: Accomplished [X] as measured by [Y] by doing [Z].")

        if action_verb_count < 4:
            weaknesses.append("Descriptions rely on passive phrasing rather than strong technical action verbs.")
            suggestions.append("Begin project and experience bullet points with impactful action verbs (e.g., 'Architected', 'Optimized', 'Automated').")

        if not found_tools or len(found_tools) < 2:
            weaknesses.append("Low coverage of industry-standard tools (e.g., Git, Docker, CI/CD, Postman).")
            suggestions.append("Highlight proficiency with development tools like Git, Docker, Postman, and Cloud platforms.")

        if cat_scores['experience'] < 10:
            weaknesses.append("Work experience / internship section could be strengthened.")
            suggestions.append("Include any internship, open-source contribution, freelance work, or hackathon participation as practical experience.")

        if len(strengths) == 0:
            strengths.append("Clean resume text formatting suitable for standard ATS parsing.")
        if len(weaknesses) == 0:
            weaknesses.append("Minor tweaks in keyword optimization can further elevate ATS ranking.")
        if len(suggestions) == 0:
            suggestions.append("Keep updating with newly acquired technologies and latest project metrics.")

        extracted_data = {
            'name': name,
            'email': email,
            'phone': phone,
            'links': links,
            'skills': all_skills,
            'programming_languages': found_languages,
            'frameworks': found_frameworks,
            'tools': found_tools,
            'education': education_info,
            'projects': projects_info,
            'experience': experience_info,
            'certifications': certifications_info,
            'achievements': achievements_info,
            'metrics_detected_count': measurable_metrics_count,
            'action_verbs_count': action_verb_count
        }

        return {
            'overall_score': overall_score,
            'category_scores': cat_scores,
            'extracted_info': extracted_data,
            'strengths': strengths,
            'weaknesses': weaknesses,
            'suggestions': suggestions
        }

    @staticmethod
    def _extract_email(text: str) -> str:
        match = re.search(r'[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+', text)
        return match.group(0) if match else ""

    @staticmethod
    def _extract_phone(text: str) -> str:
        match = re.search(r'(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}', text)
        return match.group(0) if match else ""

    @staticmethod
    def _extract_name(text: str) -> str:
        lines = [l.strip() for l in text.split('\n') if l.strip()]
        for line in lines[:5]:
            # First clean line that isn't an email, phone, or title
            if not re.search(r'[@\+0-9]|resume|curriculum|cv', line, re.IGNORECASE) and len(line.split()) in (2, 3, 4):
                return line
        return ""

    @staticmethod
    def _extract_links(text: str) -> Dict[str, str]:
        github = re.search(r'(https?://)?(www\.)?github\.com/[a-zA-Z0-9_-]+', text, re.IGNORECASE)
        linkedin = re.search(r'(https?://)?(www\.)?linkedin\.com/in/[a-zA-Z0-9_-]+', text, re.IGNORECASE)
        portfolio = re.search(r'https?://[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}(/[a-zA-Z0-9_.-]*)*', text, re.IGNORECASE)

        return {
            'github': github.group(0) if github else '',
            'linkedin': linkedin.group(0) if linkedin else '',
            'portfolio': portfolio.group(0) if portfolio else ''
        }

    @staticmethod
    def _find_matches(text: str, items: List[str]) -> List[str]:
        found = []
        for item in items:
            escaped = re.escape(item)
            # Match word boundary
            pattern = r'(?i)(?<![a-zA-Z0-9#+])' + escaped + r'(?![a-zA-Z0-9#+])'
            if re.search(pattern, text):
                found.append(item)
        return found

    @staticmethod
    def _split_into_sections(text: str) -> Dict[str, str]:
        section_headers = {
            'education': r'(?i)\b(education|academic background|academics|qualifications)\b',
            'skills': r'(?i)\b(skills|technical skills|technologies|core competencies|technical expertise)\b',
            'projects': r'(?i)\b(projects|academic projects|personal projects|key projects)\b',
            'experience': r'(?i)\b(experience|work experience|employment|internships|professional experience)\b',
            'certifications': r'(?i)\b(certifications|certificates|courses|licenses)\b',
            'achievements': r'(?i)\b(achievements|awards|honors|extracurricular|publications)\b',
        }

        sections = {k: '' for k in section_headers}
        lines = text.split('\n')
        current_section = None

        for line in lines:
            line_str = line.strip()
            if not line_str:
                continue

            matched = False
            for sec_name, sec_regex in section_headers.items():
                if re.match(sec_regex, line_str) and len(line_str) < 40:
                    current_section = sec_name
                    matched = True
                    break

            if not matched and current_section:
                sections[current_section] += line_str + '\n'

        return sections

    @staticmethod
    def _extract_education(text: str) -> List[Dict[str, str]]:
        degrees = []
        degree_patterns = [
            r'\b(B\.?Tech|B\.?E\.?|B\.?Sc|BCA|M\.?Tech|M\.?Sc|MCA|Bachelor of [A-Za-z\s]+|Master of [A-Za-z\s]+)\b',
            r'\b(Computer Science|Information Technology|Electrical|Mechanical|Civil|Electronics|Data Science)\b',
        ]
        for pat in degree_patterns:
            matches = re.findall(pat, text, re.IGNORECASE)
            for m in matches:
                if m not in degrees:
                    degrees.append(m)
        return [{'degree_or_major': d} for d in degrees[:4]]

    @staticmethod
    def _extract_projects(proj_text: str) -> List[Dict[str, str]]:
        if not proj_text:
            return []
        items = []
        lines = [l.strip() for l in proj_text.split('\n') if l.strip()]
        for l in lines[:5]:
            if len(l) > 10:
                items.append({'title_or_desc': l})
        return items

    @staticmethod
    def _extract_experience(exp_text: str) -> List[Dict[str, str]]:
        if not exp_text:
            return []
        items = []
        lines = [l.strip() for l in exp_text.split('\n') if l.strip()]
        for l in lines[:5]:
            if len(l) > 10:
                items.append({'role_or_company': l})
        return items

    @staticmethod
    def _extract_certifications(cert_text: str) -> List[str]:
        if not cert_text:
            return []
        return [l.strip() for l in cert_text.split('\n') if l.strip()][:4]

    @staticmethod
    def _extract_achievements(ach_text: str) -> List[str]:
        if not ach_text:
            return []
        return [l.strip() for l in ach_text.split('\n') if l.strip()][:4]

    @staticmethod
    def _empty_fallback_analysis() -> Dict[str, Any]:
        return {
            'overall_score': 30.0,
            'category_scores': {
                'skills': 5.0, 'education': 5.0, 'projects': 5.0, 'experience': 5.0,
                'certifications': 3.0, 'keywords': 3.0, 'structure': 2.0, 'ats_compatibility': 2.0
            },
            'extracted_info': {
                'name': '', 'email': '', 'phone': '', 'links': {},
                'skills': [], 'programming_languages': [], 'frameworks': [], 'tools': [],
                'education': [], 'projects': [], 'experience': [], 'certifications': [], 'achievements': []
            },
            'strengths': ['File uploaded successfully.'],
            'weaknesses': ['Could not extract sufficient text. Ensure the document is not an image-only scan.'],
            'suggestions': ['Upload a searchable PDF or DOCX file with clear text hierarchy.']
        }
