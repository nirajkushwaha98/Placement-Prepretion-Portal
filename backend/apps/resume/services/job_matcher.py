from typing import Dict, List, Any
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from .nlp_engine import (
    PROGRAMMING_LANGUAGES, FRAMEWORKS_LIBRARIES, TOOLS_PLATFORMS, ResumeAnalyzerNLP
)

class JobDescriptionMatcher:
    ALL_TAXONOMY_SKILLS = PROGRAMMING_LANGUAGES + FRAMEWORKS_LIBRARIES + TOOLS_PLATFORMS

    @classmethod
    def match(cls, resume_text: str, jd_text: str, resume_skills: List[str] = None) -> Dict[str, Any]:
        """
        Matches resume text against job description using TF-IDF cosine similarity
        and skill overlap analysis.
        """
        if not jd_text or len(jd_text.strip()) < 10:
            return {
                'match_score': 0.0,
                'matching_skills': [],
                'missing_skills': [],
                'recommendations': ['Please paste a detailed job description with technical requirements.']
            }

        # 1. Extract required skills from Job Description
        jd_skills = ResumeAnalyzerNLP._find_matches(jd_text, cls.ALL_TAXONOMY_SKILLS)

        # 2. Get resume skills
        if resume_skills is None or len(resume_skills) == 0:
            resume_skills = ResumeAnalyzerNLP._find_matches(resume_text, cls.ALL_TAXONOMY_SKILLS)

        # Normalize casing
        resume_skills_lower = {s.lower(): s for s in resume_skills}
        matching_skills = []
        missing_skills = []

        for skill in jd_skills:
            if skill.lower() in resume_skills_lower:
                matching_skills.append(skill)
            else:
                missing_skills.append(skill)

        # 3. TF-IDF Cosine Similarity Calculation
        try:
            vectorizer = TfidfVectorizer(stop_words='english', max_features=1000)
            tfidf_matrix = vectorizer.fit_transform([resume_text, jd_text])
            sim_score = float(cosine_similarity(tfidf_matrix[0:1], tfidf_matrix[1:2])[0][0])
        except Exception:
            sim_score = 0.5

        # 4. Skill Overlap Ratio
        if jd_skills:
            skill_ratio = len(matching_skills) / len(jd_skills)
        else:
            skill_ratio = 0.6

        # Composite Match Score: 60% Skill Overlap + 40% Semantic TF-IDF Similarity
        raw_score = (skill_ratio * 60.0) + (sim_score * 40.0)
        match_score = round(min(100.0, max(20.0, raw_score * 1.25)), 1)

        # 5. Targeted Recommendations
        recommendations = []
        if missing_skills:
            top_missing = missing_skills[:4]
            for s in top_missing:
                recommendations.append(f"Add project experience or practice problems demonstrating proficiency in {s}.")
        if len(matching_skills) < 3:
            recommendations.append("Tailor your summary and experience bullet points to echo keywords found in the job description.")
        if len(recommendations) == 0:
            recommendations.append("Your profile is strongly aligned with this job description. Ensure your project metrics reflect relevant industry impact.")

        return {
            'match_score': match_score,
            'matching_skills': matching_skills,
            'missing_skills': missing_skills,
            'recommendations': recommendations
        }
