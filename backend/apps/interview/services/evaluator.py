import re
from typing import Dict, Any, List
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

class InterviewAnswerEvaluator:
    @classmethod
    def evaluate(cls, student_answer: str, question_obj) -> Dict[str, Any]:
        """
        Evaluates student's interview response against model answer and key points.
        Returns relevance, clarity, technical depth, confidence scores and actionable feedback.
        """
        answer = student_answer.strip()
        if not answer or len(answer.split()) < 5:
            return {
                'relevance_score': 2.0,
                'clarity_score': 3.0,
                'technical_score': 2.0,
                'confidence_score': 2.0,
                'overall_score': 22.0,
                'feedback': {
                    'strengths': ['Attempt initiated.'],
                    'improvements': ['Your answer was too short. Aim for at least 3-4 structured sentences or 50+ words.'],
                    'communication_quality': 'Incomplete response.',
                    'model_tips': question_obj.tips
                }
            }

        words = answer.split()
        word_count = len(words)
        model_answer = question_obj.model_answer or ""
        key_points = question_obj.key_talking_points or []

        # 1. Relevance Score (Based on Semantic similarity + Key point overlap)
        relevance_raw = 5.0
        try:
            vectorizer = TfidfVectorizer(stop_words='english')
            tfidf = vectorizer.fit_transform([answer, model_answer])
            sim = float(cosine_similarity(tfidf[0:1], tfidf[1:2])[0][0])
            relevance_raw = min(10.0, max(3.0, sim * 10.0 + 3.0))
        except Exception:
            relevance_raw = 6.0

        # Check key points coverage
        matched_points = []
        missing_points = []
        for pt in key_points:
            pt_clean = pt.lower()
            if any(term in answer.lower() for term in pt_clean.split() if len(term) > 3):
                matched_points.append(pt)
            else:
                missing_points.append(pt)

        if key_points:
            point_ratio = len(matched_points) / len(key_points)
            relevance_score = round(min(10.0, (relevance_raw * 0.5) + (point_ratio * 5.0) + 1.5), 1)
        else:
            relevance_score = round(min(10.0, relevance_raw), 1)

        # 2. Clarity Score (Sentence structure, transition words, length adequacy)
        clarity = 6.0
        transitions = ['because', 'therefore', 'furthermore', 'for example', 'specifically', 'initially', 'subsequently', 'as a result', 'in addition']
        found_transitions = sum(1 for t in transitions if t in answer.lower())
        if found_transitions >= 2:
            clarity += 2.0
        if 40 <= word_count <= 250:
            clarity += 1.5
        elif word_count < 25:
            clarity -= 2.0
        clarity_score = round(min(10.0, max(2.0, clarity)), 1)

        # 3. Technical Score (Specific terminology, logic, precision)
        tech_score = 5.5
        if question_obj.category.name in ('Technical Interview', 'Programming Interview'):
            # Look for technical terms
            tech_patterns = [r'\b(time complexity|space complexity|algorithm|database|api|framework|architecture|scaling|index|cache|thread|state|component|function|query)\b']
            tech_matches = sum(len(re.findall(pat, answer, re.IGNORECASE)) for pat in tech_patterns)
            tech_score = min(10.0, max(3.0, 5.0 + (tech_matches * 1.2) + (relevance_score * 0.3)))
        else:
            # Behavioral / HR look for STAR structure
            star_cues = ['situation', 'task', 'action', 'result', 'when', 'project', 'team', 'challenge', 'learned', 'outcome']
            star_found = sum(1 for c in star_cues if c in answer.lower())
            tech_score = min(10.0, max(4.0, 4.5 + (star_found * 0.8)))
        technical_score = round(tech_score, 1)

        # 4. Confidence / Communication Quality
        confidence = 6.5
        filler_words = ['maybe', 'i guess', 'sort of', 'kind of', 'um', 'uh', 'probably not sure', 'i think maybe']
        found_fillers = sum(1 for f in filler_words if f in answer.lower())
        confidence -= (found_fillers * 1.0)

        positive_cues = ['i successfully', 'my approach', 'i ensured', 'we achieved', 'i designed', 'i led', 'i solved', 'i delivered']
        found_positive = sum(1 for p in positive_cues if p in answer.lower())
        confidence += (found_positive * 0.8)

        if word_count >= 50:
            confidence += 1.0
        confidence_score = round(min(10.0, max(2.0, confidence)), 1)

        # Overall Composite Score (out of 100)
        overall_score = round((relevance_score * 3.0) + (technical_score * 3.0) + (clarity_score * 2.0) + (confidence_score * 2.0), 1)

        # Strengths & Improvements
        strengths = []
        improvements = []

        if relevance_score >= 7.5:
            strengths.append("Directly addressed the core intent of the question.")
        if matched_points:
            strengths.append(f"Successfully covered key concepts: {', '.join(matched_points[:3])}.")
        if clarity_score >= 7.5:
            strengths.append("Structured explanations clearly with good transitional flow.")
        if confidence_score >= 7.5:
            strengths.append("Maintained an assertive, professional tone without hesitation markers.")

        if missing_points:
            improvements.append(f"Consider touching upon: {', '.join(missing_points[:3])}.")
        if word_count < 40:
            improvements.append("Elaborate further with specific real-world examples or technical details.")
        if found_fillers > 0:
            improvements.append("Minimize hedging phrases like 'maybe' or 'I guess' to project greater authority.")
        if not strengths:
            strengths.append("Clear attempt that sets a foundation to build upon.")
        if not improvements:
            improvements.append("Excellent answer! Practice delivering this fluently within 60-90 seconds.")

        comm_quality = "Clear, articulate, and well-structured." if clarity_score >= 7.0 else "Understandable, but could benefit from more structured delivery."

        return {
            'relevance_score': relevance_score,
            'clarity_score': clarity_score,
            'technical_score': technical_score,
            'confidence_score': confidence_score,
            'overall_score': overall_score,
            'feedback': {
                'strengths': strengths,
                'improvements': improvements,
                'communication_quality': comm_quality,
                'matched_points': matched_points,
                'missing_points': missing_points,
                'model_tips': question_obj.tips
            }
        }
