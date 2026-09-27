# 🛠️ Technical Requirements Document (TRD)
## Placement Preparation Portal (P3)

---

### Document Control
- **Document Version**: 2.0.0
- **Status**: Production Reference
- **System Name**: Placement Preparation Portal Backend & Frontend System
- **Author**: Platform Architecture Team
- **Target Audience**: Full-Stack Engineers, DevOps Engineers, System Architects

---

## 1. High-Level Architectural Overview

### 1.1 Architecture Pattern
The system is built on a **Decoupled Client-Server Service-Oriented Architecture (SOA)**:
- **Presentation Layer**: Single Page Application (SPA) powered by React 18, Vite, Tailwind CSS, Recharts, and Microsoft Monaco Editor.
- **API & Application Layer**: Modular Django REST Framework (DRF) backend exposing stateless RESTful endpoints secured via JSON Web Tokens (JWT).
- **Domain Service Engines**:
  - `PlacementReadinessCalculator`: Weighted scoring engine and chronological timeline aggregator.
  - `ResumeNLPEngine`: spaCy and regex-based entity extractor and 8-category ATS scoring engine.
  - `JobMatcherEngine`: Scikit-learn TF-IDF vectorizer and cosine similarity matcher.
  - `CodeExecutionService`: Sandboxed multi-language code runner with Judge0 API client and local secure subprocess fallback.
  - `InterviewEvaluator`: 4-axis NLP evaluation engine with rubric heuristic scoring.
- **Persistence Layer**: Relational database (PostgreSQL in staging/production, SQLite 3 for zero-configuration local development) with Django ORM migrations.

### 1.2 System Container Diagram

```mermaid
graph TD
    Client[Browser / React 18 Client] -->|HTTPS / JSON / JWT| Gateway[Nginx Reverse Proxy / Vite Dev]
    Gateway -->|Forward /api/*| Backend[Django REST Framework Gunicorn/WSGI]
    Gateway -->|Static SPA Assets| FrontendBundle[Vite Production Bundle]
    
    subgraph Django Core Backend
        Backend --> AuthModule[apps.accounts: Auth & RBAC]
        Backend --> AptModule[apps.aptitude: Quiz & Dynamic Drills]
        Backend --> CodeModule[apps.coding: DSA Arena & Submissions]
        Backend --> ResModule[apps.resume: Ingestion & ATS Engine]
        Backend --> IntModule[apps.interview: Mock Question & QA]
        Backend --> DashModule[apps.dashboard: Readiness & Reports]
    end

    subgraph Service Engines
        CodeModule -->|REST API| Judge0[Judge0 Sandbox Server / Docker Runner]
        ResModule -->|spaCy / pdfplumber| NLPEngine[NLP Extraction Pipeline]
        ResModule -->|scikit-learn| Vectorizer[TF-IDF Cosine Matcher]
        IntModule -->|Text Analysis| EvalEngine[4-Axis Evaluation Service]
        DashModule -->|Aggregation| ReadinessCalc[Readiness Service]
    end

    Django Core Backend --> DB[(PostgreSQL / SQLite Database)]
    Django Core Backend --> Storage[(Local Media Storage / S3 Bucket)]
```

---

## 2. Technology Stack & Framework Specifications

### 2.1 Frontend Specifications
| Component | Technology | Version | Purpose |
| :--- | :--- | :--- | :--- |
| **Runtime / Build** | Node.js / Vite | Node 18+, Vite 5.x | Ultra-fast HMR and optimized production bundle |
| **UI Framework** | React | 18.2.0 | Component-driven declarative UI architecture |
| **Routing** | React Router DOM | 6.22.x | Client-side routing with role-based Route Guards |
| **Styling** | Tailwind CSS | 3.4.x | Utility-first responsive CSS styling with custom theme |
| **Code Editor** | Monaco Editor (`@monaco-editor/react`) | 4.6.x | In-browser VS Code editing experience |
| **Data Visualization** | Recharts | 2.12.x | Responsive SVG charts (Line, Bar, Radar, Area) |
| **Icons** | Lucide React | 0.344.x | Modern lightweight SVG icon library |
| **HTTP Client** | Axios | 1.6.x | Interceptor-enabled client for JWT injection & refresh |

### 2.2 Backend Specifications
| Component | Technology | Version | Purpose |
| :--- | :--- | :--- | :--- |
| **Language Runtime**| Python | 3.10+ | High-performance backend execution environment |
| **Web Framework** | Django | 4.2+ (LTS) | Robust, secure web framework and ORM |
| **API Framework** | Django REST Framework (DRF)| 3.14.x | Serializers, ViewSets, APIViews, permissions |
| **Authentication** | `djangorestframework-simplejwt` | 5.3.x | Stateless HMAC-SHA256 JWT access and refresh tokens |
| **CORS Management** | `django-cors-headers` | 4.3.x | Cross-Origin Resource Sharing control |
| **Database Driver** | `psycopg2-binary` / `sqlite3` | 2.9.x | Database connection layer |
| **NLP Pipeline** | spaCy (`en_core_web_sm`) | 3.7.x | Named Entity Recognition (NER) & token analysis |
| **Machine Learning**| scikit-learn | 1.4.x | TF-IDF Vectorizer and Cosine Similarity computation |
| **Document Parsing**| `pdfplumber`, `python-docx` | Latest | High-fidelity text extraction from PDF and DOCX |

---

## 3. Database Schema & Entity-Relationship Specifications

```mermaid
erDiagram
    User ||--o| StudentProfile : "has"
    User ||--o| AdminProfile : "has"
    User ||--o{ TestAttempt : "attempts"
    User ||--o{ CodingSubmission : "submits"
    User ||--o{ Resume : "uploads"
    User ||--o{ InterviewAttempt : "attempts"

    AptitudeCategory ||--o{ AptitudeQuestion : "contains"
    AptitudeCategory ||--o{ AptitudeTest : "categorizes"
    AptitudeTest }|--|{ AptitudeQuestion : "includes"
    TestAttempt }|--|| AptitudeTest : "references"
    TestAttempt ||--o{ TestAnswer : "records"
    TestAnswer }|--|| AptitudeQuestion : "answers"

    CodingProblem ||--o{ CodingSubmission : "evaluated against"
    Resume ||--o| ResumeAnalysis : "analyzed into"
    Resume ||--o{ JobDescriptionMatch : "matched in"

    InterviewCategory ||--o{ InterviewQuestion : "groups"
    InterviewAttempt }|--|| InterviewQuestion : "evaluates"
```

### 3.1 App: `accounts`

#### `User` (Extends `AbstractUser`)
- `id` (BigAutoField, PK)
- `email` (EmailField, Unique, Indexed)
- `username` (CharField, Unique)
- `role` (CharField, Choices: `['STUDENT', 'ADMIN']`, Default: `'STUDENT'`)
- `phone` (CharField, null=True, blank=True)
- `created_at` (DateTimeField, auto_now_add=True)
- `updated_at` (DateTimeField, auto_now=True)

#### `StudentProfile`
- `id` (BigAutoField, PK)
- `user` (OneToOneField -> `User`, related_name='student_profile', CASCADE)
- `college` (CharField, max_length=255)
- `degree` (CharField, max_length=100)
- `branch` (CharField, max_length=100, Indexed)
- `graduation_year` (PositiveIntegerField, Indexed)
- `profile_photo` (ImageField, upload_to='profiles/', null=True)
- `skills` (JSONField, default=list)
- `github_url` (URLField)
- `linkedin_url` (URLField)
- `bio` (TextField)

#### `AdminProfile`
- `id` (BigAutoField, PK)
- `user` (OneToOneField -> `User`, related_name='admin_profile', CASCADE)
- `department` (CharField, max_length=100, default='Placement Cell')
- `designation` (CharField, max_length=100, default='Placement Officer')

---

### 3.2 App: `aptitude`

#### `AptitudeCategory`
- `id` (BigAutoField, PK)
- `name` (CharField, max_length=100, Unique)
- `slug` (SlugField, max_length=100, Unique)
- `description` (TextField)
- `icon` (CharField, max_length=50, default='Brain')
- `order` (PositiveIntegerField, default=0)

#### `AptitudeQuestion`
- `id` (BigAutoField, PK)
- `category` (ForeignKey -> `AptitudeCategory`, CASCADE, related_name='questions')
- `topic` (CharField, max_length=100, Indexed)
- `question_text` (TextField)
- `options` (JSONField, list of 4 options `["A", "B", "C", "D"]`)
- `correct_option_index` (PositiveSmallIntegerField, 0-3)
- `explanation` (TextField)
- `difficulty` (CharField, Choices: `['EASY', 'MEDIUM', 'HARD']`)
- `marks` (PositiveIntegerField, default=1)
- `negative_marks` (FloatField, default=0.0)

#### `AptitudeTest`
- `id` (BigAutoField, PK)
- `title` (CharField, max_length=200)
- `description` (TextField)
- `category` (ForeignKey -> `AptitudeCategory`, SET_NULL, null=True)
- `difficulty` (CharField, Choices: `['EASY', 'MEDIUM', 'HARD', 'MIXED']`)
- `duration_minutes` (PositiveIntegerField, default=20)
- `total_questions` (PositiveIntegerField, default=15)
- `passing_percentage` (FloatField, default=60.0)
- `questions` (ManyToManyField -> `AptitudeQuestion`, blank=True)
- `is_active` (BooleanField, default=True)

#### `TestAttempt`
- `id` (BigAutoField, PK)
- `student` (ForeignKey -> `User`, CASCADE, related_name='aptitude_attempts')
- `test` (ForeignKey -> `AptitudeTest`, SET_NULL, null=True)
- `category` (ForeignKey -> `AptitudeCategory`, SET_NULL, null=True)
- `score` (FloatField)
- `total_marks` (FloatField)
- `percentage` (FloatField, Indexed)
- `correct_count` (PositiveIntegerField)
- `incorrect_count` (PositiveIntegerField)
- `unattempted_count` (PositiveIntegerField)
- `time_taken_seconds` (PositiveIntegerField)
- `topic_breakdown` (JSONField, default=dict)
- `created_at` (DateTimeField, auto_now_add=True, Indexed)

#### `TestAnswer`
- `id` (BigAutoField, PK)
- `attempt` (ForeignKey -> `TestAttempt`, CASCADE, related_name='answers')
- `question` (ForeignKey -> `AptitudeQuestion`, CASCADE)
- `selected_option_index` (IntegerField, null=True)
- `is_correct` (BooleanField, default=False)
- `time_spent_seconds` (PositiveIntegerField, default=0)

---

### 3.3 App: `coding`

#### `CodingProblem`
- `id` (BigAutoField, PK)
- `title` (CharField, max_length=200, Unique)
- `slug` (SlugField, max_length=200, Unique)
- `difficulty` (CharField, Choices: `['EASY', 'MEDIUM', 'HARD']`, Indexed)
- `tags` (JSONField, list of string tags e.g. `['Arrays', 'Two Pointers']`)
- `description` (TextField)
- `input_format` (TextField)
- `output_format` (TextField)
- `constraints` (TextField)
- `sample_input` (TextField)
- `sample_output` (TextField)
- `sample_explanation` (TextField)
- `starter_code` (JSONField, dict with keys `python`, `javascript`, `java`, `cpp`)
- `test_cases` (JSONField, list of `{'input': str, 'output': str, 'is_hidden': bool}`)
- `points` (PositiveIntegerField, default=50)

#### `CodingSubmission`
- `id` (BigAutoField, PK)
- `student` (ForeignKey -> `User`, CASCADE, related_name='coding_submissions')
- `problem` (ForeignKey -> `CodingProblem`, CASCADE, related_name='submissions')
- `language` (CharField, Choices: `['python', 'javascript', 'java', 'cpp']`)
- `code` (TextField)
- `status` (CharField, Choices: `['ACCEPTED', 'WRONG_ANSWER', 'TIME_LIMIT_EXCEEDED', 'COMPILATION_ERROR', 'RUNTIME_ERROR', 'PENDING', 'ERROR']`, Indexed)
- `passed_test_cases` (PositiveIntegerField, default=0)
- `total_test_cases` (PositiveIntegerField, default=0)
- `execution_time_ms` (FloatField, default=0.0)
- `memory_kb` (FloatField, default=0.0)
- `error_message` (TextField, blank=True)
- `test_case_results` (JSONField, default=list)
- `score` (FloatField, default=0.0)
- `created_at` (DateTimeField, auto_now_add=True, Indexed)

---

### 3.4 App: `resume`

#### `Resume`
- `id` (BigAutoField, PK)
- `student` (ForeignKey -> `User`, CASCADE, related_name='resumes')
- `file` (FileField, upload_to='resumes/')
- `file_name` (CharField, max_length=255)
- `file_size_kb` (FloatField)
- `file_type` (CharField, max_length=50)
- `extracted_text` (TextField)
- `uploaded_at` (DateTimeField, auto_now_add=True, Indexed)

#### `ResumeAnalysis`
- `id` (BigAutoField, PK)
- `resume` (OneToOneField -> `Resume`, CASCADE, related_name='analysis')
- `student` (ForeignKey -> `User`, CASCADE, related_name='resume_analyses')
- `overall_score` (FloatField, 0-100)
- `category_scores` (JSONField, scores for `skills`, `education`, `experience`, `projects`, `certifications`, `keywords`, `structure`, `ats_compatibility`)
- `extracted_info` (JSONField, structured contact info, technical skills list, tools, education history)
- `strengths` (JSONField, list of strings)
- `weaknesses` (JSONField, list of strings)
- `suggestions` (JSONField, list of strings)
- `created_at` (DateTimeField, auto_now_add=True)

#### `JobDescriptionMatch`
- `id` (BigAutoField, PK)
- `student` (ForeignKey -> `User`, CASCADE, related_name='job_matches')
- `resume` (ForeignKey -> `Resume`, SET_NULL, null=True, related_name='job_matches')
- `job_title` (CharField, max_length=200)
- `company_name` (CharField, max_length=200)
- `jd_text` (TextField)
- `match_score` (FloatField, 0-100)
- `matching_skills` (JSONField, list of matched skills)
- `missing_skills` (JSONField, list of missing requirements)
- `recommendations` (JSONField, list of actionable suggestions)
- `created_at` (DateTimeField, auto_now_add=True)

---

### 3.5 App: `interview`

#### `InterviewCategory`
- `id` (BigAutoField, PK)
- `name` (CharField, max_length=100, Unique)
- `slug` (SlugField, max_length=100, Unique)
- `description` (TextField)
- `icon` (CharField, max_length=50, default='MessageSquare')
- `order` (PositiveIntegerField, default=0)

#### `InterviewQuestion`
- `id` (BigAutoField, PK)
- `category` (ForeignKey -> `InterviewCategory`, CASCADE, related_name='questions')
- `question` (TextField)
- `model_answer` (TextField)
- `tips` (TextField)
- `key_talking_points` (JSONField, list of strings)
- `difficulty` (CharField, Choices: `['EASY', 'MEDIUM', 'HARD']`)
- `company_tag` (CharField, max_length=100, default='General')

#### `InterviewAttempt`
- `id` (BigAutoField, PK)
- `student` (ForeignKey -> `User`, CASCADE, related_name='interview_attempts')
- `question` (ForeignKey -> `InterviewQuestion`, CASCADE, related_name='attempts')
- `student_answer` (TextField)
- `relevance_score` (FloatField, 0-10)
- `clarity_score` (FloatField, 0-10)
- `technical_score` (FloatField, 0-10)
- `confidence_score` (FloatField, 0-10)
- `overall_score` (FloatField, 0-100)
- `feedback` (JSONField, breakdown of criteria & strengths/improvements)
- `created_at` (DateTimeField, auto_now_add=True, Indexed)

---

## 4. REST API Contract & Endpoint Specifications

### 4.1 Authentication Endpoints (`/api/auth/`)
| Method | Endpoint | Access | Request Body | Response Status & Body |
| :--- | :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register/` | Public | `{email, username, password, role, college, branch, graduation_year}` | `201 Created`: `{user: {...}, access, refresh}` |
| `POST` | `/api/auth/login/` | Public | `{email, password}` | `200 OK`: `{access, refresh, user: {id, email, role, full_name}}` |
| `POST` | `/api/auth/token/refresh/` | Public | `{refresh}` | `200 OK`: `{access}` |
| `GET` | `/api/auth/profile/` | Authenticated | None | `200 OK`: Detailed User and Student/Admin Profile |
| `PUT` | `/api/auth/profile/update/` | Authenticated | `{college, branch, graduation_year, skills, github_url, linkedin_url, bio}` | `200 OK`: Updated Profile |
| `POST` | `/api/auth/change-password/` | Authenticated | `{old_password, new_password}` | `200 OK`: `{detail: "Password updated successfully"}` |

### 4.2 Aptitude Endpoints (`/api/aptitude/`)
| Method | Endpoint | Access | Purpose |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/aptitude/categories/` | Authenticated | List all aptitude categories with question counts |
| `GET` | `/api/aptitude/tests/` | Authenticated | List company mock tests with filters |
| `GET` | `/api/aptitude/tests/<id>/` | Authenticated | Get test details with question list (excluding solutions during test) |
| `POST` | `/api/aptitude/practice/generate/` | Authenticated | Generate dynamic drill: `{category_id, count, difficulty}` |
| `POST` | `/api/aptitude/attempts/` | Authenticated | Submit attempt: `{test_id, time_taken_seconds, answers: [{question_id, selected_option_index, time_spent}]}` |
| `GET` | `/api/aptitude/history/` | Authenticated | Retrieve student's past attempts with percentage scores |
| `GET` | `/api/aptitude/attempts/<id>/review/` | Authenticated | Complete diagnostic review with explanations and question-by-question verdicts |

### 4.3 Coding Endpoints (`/api/coding/`)
| Method | Endpoint | Access | Purpose |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/coding/problems/` | Authenticated | List DSA problems with difficulty, tags, and solved status |
| `GET` | `/api/coding/problems/<id>/` | Authenticated | Retrieve problem specification, samples, constraints, and starter templates |
| `POST` | `/api/coding/run/` | Authenticated | Execute code against sample test cases: `{code, language, input}` |
| `POST` | `/api/coding/problems/<id>/submit/` | Authenticated | Submit code for full hidden test case evaluation: `{code, language}` |
| `GET` | `/api/coding/submissions/` | Authenticated | Retrieve historical submission records for the user |

### 4.4 Resume & ATS Endpoints (`/api/resume/`)
| Method | Endpoint | Access | Purpose |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/resume/upload/` | Authenticated | Multipart file upload (`resume` file) or `{raw_text}` for instant ATS analysis |
| `GET` | `/api/resume/history/` | Authenticated | List previous resumes and their 8-category diagnostic scores |
| `POST` | `/api/resume/match-jd/` | Authenticated | Compare resume against job description: `{resume_id, job_title, company_name, jd_text}` |

### 4.5 Mock Interview Endpoints (`/api/interview/`)
| Method | Endpoint | Access | Purpose |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/interview/categories/` | Authenticated | List interview categories (HR, Technical, STAR, Behavioral) |
| `GET` | `/api/interview/questions/` | Authenticated | List interview questions with company filter |
| `POST` | `/api/interview/submit-answer/` | Authenticated | Submit response for 4-axis AI evaluation: `{question_id, student_answer}` |
| `GET` | `/api/interview/history/` | Authenticated | List past interview attempts and scores |

### 4.6 Dashboard & Analytics Endpoints (`/api/dashboard/`)
| Method | Endpoint | Access | Purpose |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/dashboard/summary/` | Authenticated (Student) | Composite readiness score, tier, module scores, streak, recent activity |
| `GET` | `/api/dashboard/progress/` | Authenticated (Student) | 7-day chronological progress, category bar chart, and competency radar data |
| `GET` | `/api/dashboard/admin/analytics/`| Admin Only | Cohort statistics, batch readiness averages, tier distribution |
| `GET` | `/api/dashboard/admin/reports/` | Admin Only | Filtered student roster with diagnostic scores |
| `GET` | `/api/dashboard/admin/export-csv/`| Admin Only | Generate and stream downloadable CSV batch placement dossier |

---

## 5. Domain Engines & Execution Algorithms

### 5.1 Code Execution Engine (Judge0 & Subprocess Fallback)
```mermaid
sequenceDiagram
    autonumber
    actor Student as Student (Browser)
    participant API as Coding API (/submit/)
    participant Runner as Judge0 / Sandbox Service
    participant DB as Database

    Student->>API: POST {problem_id, language, code}
    API->>DB: Fetch problem test_cases (including hidden)
    API->>Runner: Dispatch code & inputs (Time limit: 2000ms, Mem: 128MB)
    alt Judge0 API Available
        Runner->>Runner: Execute in isolated Docker container
    else Fallback Runner
        Runner->>Runner: Execute via restricted Python subprocess
    end
    Runner-->>API: Return stdout, stderr, execution_time, memory, status
    API->>API: Compare outputs against expected test cases
    API->>DB: Persist CodingSubmission record
    API-->>Student: Return verdict (ACCEPTED / WRONG_ANSWER / TLE, details)
```

### 5.2 NLP Resume & ATS Analysis Algorithm
1. **Extraction**: `pdfplumber` iterates through text pages with bounding-box extraction. DOCX files are extracted via paragraph runs in `python-docx`.
2. **Text Normalization**: Regex-driven case-folding, whitespace cleansing, and punctuation normalization.
3. **Information Extraction**:
   - Contact Info: Email regex pattern `[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+` and international phone patterns.
   - Skill Dictionary Tokenization: Fuzzy match across 300+ engineering skills categorized into Programming Languages, Web Frameworks, Databases, Cloud & DevOps, Machine Learning, and Developer Tools.
4. **Scoring Breakdown**: Total 100 points computed across the 8 distinct categories.

### 5.3 TF-IDF Cosine Similarity Job Matcher
- **Vector Space Model**: Target Job Description ($D_{\text{JD}}$) and Extracted Resume Text ($D_{\text{Resume}}$) are vectorized using `TfidfVectorizer(stop_words='english', ngram_range=(1, 2))`.
- **Similarity Metric**:
  $$\text{Cosine Similarity} = \frac{\mathbf{v}_{\text{resume}} \cdot \mathbf{v}_{\text{jd}}}{\|\mathbf{v}_{\text{resume}}\| \|\mathbf{v}_{\text{jd}}\|}$$
- **Skill Gap Extraction**: Set difference between extracted JD entities and resume entities reveals precise `missing_skills`.

### 5.4 4-Axis AI Interview Evaluation Algorithm
- Evaluates student response text against question metadata and model answer:
  1. **Relevance ($0-10$)**: Semantic overlap and keyword intersection with expected talking points.
  2. **Communication Clarity ($0-10$)**: Sentence length distribution, readability score, and transition markers.
  3. **Technical Correctness ($0-10$)**: Presence of domain concepts, technical keywords, and algorithm/system names.
  4. **Delivery Confidence ($0-10$)**: Structure adherence (STAR markers: "Situation", "Task", "Action", "Result") and assertive vocabulary.
- **Overall Score**: Weighted linear combination scaled to $0-100\%$.

---

## 6. Security Architecture & Threat Modeling

1. **Authentication Security**:
   - Access tokens signed with HMAC-SHA256 (`HS256`).
   - Stored in browser `localStorage` or memory, dispatched via `Authorization: Bearer <token>` header.
   - Interceptors automatically catch `401 Unauthorized` and trigger refresh token rotation before retrying.
2. **Authorization & RBAC**:
   - Custom DRF permission classes (`IsPortalAdmin`, `IsStudentUser`) enforce strict resource boundary checks.
   - Admin routes explicitly verify `request.user.role == 'ADMIN' or request.user.is_staff`.
3. **Untrusted Code Execution Sandboxing**:
   - Strict resource limits enforced (`RLIMIT_CPU`, `RLIMIT_AS` memory limit to 128MB).
   - Execution wrapped in non-root user sandbox.
   - Timeout killed after 5 seconds to prevent fork bombs and infinite while-loops.
4. **Data Sanitization & Injection Prevention**:
   - Django ORM parameterized queries prevent SQL injection.
   - Serializer input validation prevents mass assignment vulnerabilities.
   - Uploaded files are checked for extension, MIME header, and size ($\le 10\text{MB}$) before saving.

---

## 7. Build, Deployment & Environment Architecture

### 7.1 Environment Configuration (`.env`)
```bash
# Backend Configuration
SECRET_KEY="production-secure-random-key"
DEBUG=False
ALLOWED_HOSTS="localhost,127.0.0.1,placement.college.edu"
DATABASE_URL="postgres://p3_user:secure_pass@localhost:5432/placement_db"

# JWT Config
JWT_ACCESS_LIFETIME_MINUTES=1440
JWT_REFRESH_LIFETIME_DAYS=7

# Judge0 Code Runner
JUDGE0_API_URL="https://judge0-ce.p.rapidapi.com"
JUDGE0_API_KEY="optional-api-key"

# CORS Config
CORS_ALLOWED_ORIGINS="http://localhost:3000,https://placement.college.edu"
```

### 7.2 Production Verification Checklist
- [x] Django automated unit test suite: `python manage.py test` passes 16/16 tests.
- [x] Vite production bundle build: `npm run build` generates optimized assets in `frontend/dist/`.
- [x] Static files collected via `python manage.py collectstatic`.
- [x] Database migrations verified clean with `python manage.py migrate`.
