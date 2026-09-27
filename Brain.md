# 🧠 BRAIN.MD: Master System Knowledge Base & Architectural Memory
## Placement Preparation Portal (P3)

---

### Document Control
- **Document Version**: 2.0.0
- **Status**: Authoritative Architectural Source of Truth
- **System**: Placement Preparation Portal (P3)
- **Maintainers**: Platform Core Architecture & Engineering Team

---

## 1. System DNA & Executive Blueprint

The **Placement Preparation Portal (P3)** is an institutional-grade recruitment readiness platform designed to prepare engineering undergraduates for technical placement drives. It provides continuous, objective assessment across four pillars:
1. **Quantitative & Logical Aptitude**
2. **Data Structures & Algorithms (DSA)**
3. **ATS-Compliant Resume Engineering**
4. **Structured Technical & Behavioral Articulation**

The system bridges the gap between student preparation and institutional oversight through a database-backed, real-time **Placement Readiness Engine**.

---

## 2. Codebase Topology & Component Inventory

```
/Placement preparation portal/
├── backend/
│   ├── apps/
│   │   ├── accounts/          # User auth, RBAC, StudentProfile, AdminProfile
│   │   ├── aptitude/          # Categories, Questions, Tests, Attempts, Dynamic Drills
│   │   ├── coding/            # 49+ DSA Problems, Submissions, Monaco Runner, Judge0
│   │   ├── dashboard/         # Readiness Calculator, Progress Timeline, Admin Analytics
│   │   ├── interview/         # Categorized Prompts, 4-Axis AI Evaluation, Model Answers
│   │   ├── recommendations/   # Diagnostic weakness analyzer & study recommendations
│   │   └── resume/            # pdfplumber/docx text extraction, spaCy ATS, TF-IDF JD Matcher
│   ├── config/                # Django project settings, urls, wsgi, asgi
│   ├── media/                 # Uploaded resumes and student profile pictures
│   ├── manage.py              # Django management script
│   └── requirements.txt       # Backend dependencies (Django, DRF, spaCy, scikit-learn, etc.)
├── frontend/
│   ├── src/
│   │   ├── api/               # Axios instance with JWT interceptors & endpoint helpers
│   │   ├── components/        # Reusable UI widgets: Layout, Sidebar, Navbar, RouteGuards
│   │   ├── context/           # AuthContext (JWT management, user state, login/logout)
│   │   ├── pages/
│   │   │   ├── auth/          # Login.jsx, Register.jsx
│   │   │   ├── student/       # Dashboard, Aptitude, Coding, DSASheet, Resume, Interview, etc.
│   │   │   └── admin/         # AdminDashboard, AdminStudents, AdminReports, AdminCRUD
│   │   ├── App.jsx            # Master routing table & role protection
│   │   ├── index.css          # Tailwind CSS directives & global resets
│   │   └── main.jsx           # React DOM root entry point
│   ├── package.json           # Frontend dependencies (React 18, Vite, Tailwind, Monaco)
│   └── vite.config.js         # Vite dev server and proxy configuration
├── docs/                      # PRD.md, TRD.md, UI_UX_DESIGN_BRIEF.md, APP_FLOW.md
├── Brain.md                   # This master knowledge file
└── start.sh                   # Environment startup script
```

---

## 3. Mathematical Models & Algorithmic Rubrics

### 3.1 Composite Placement Readiness Index
The overall readiness score is computed using a deterministic weighted formula:
$$\text{Readiness Index} = (0.25 \times \text{Aptitude}) + (0.30 \times \text{Coding}) + (0.20 \times \text{Resume}) + (0.25 \times \text{Interview})$$

```python
# Implementation Location: backend/apps/dashboard/services/readiness.py
w_apt = 0.25
w_code = 0.30
w_res = 0.20
w_int = 0.25

readiness_score = round(
    (aptitude_score * w_apt) +
    (coding_score * w_code) +
    (resume_score * w_res) +
    (interview_score * w_int),
    1
)
```

### 3.2 Dynamic Readiness Tiers
| Score Threshold | Tier Name | Color Hex | Strategic Recommendation |
| :--- | :--- | :--- | :--- |
| **$\ge 91.0\%$** | **Excellent** | `#10B981` (Emerald) | Day-1 Dream Company Track ($12+$ LPA). Advanced system design & low-level concurrency. |
| **$76.0\% - 90.9\%$** | **Placement Ready** | `#3B82F6` (Blue) | Target Tier-1 Tech (Product/Services). Mock interview consistency and behavioral drills. |
| **$61.0\% - 75.9\%$** | **Good** | `#6366F1` (Indigo) | Target Tier-2/3. Identify weak areas in DSA or quantitative aptitude. |
| **$41.0\% - 60.9\%$** | **Developing** | `#F59E0B` (Amber) | Focus on core problem-solving consistency and resume restructuring. |
| **$\le 40.9\%$** | **Beginner** | `#EF4444` (Rose) | Needs diagnostic counseling; focus on fundamental programming and core aptitude. |

---

### 3.3 Resume ATS Scoring Rubric (100 Points Total)
The resume parser (`apps.resume.services.nlp_engine.py`) scores resumes across 8 categories:

| Category | Max Points | Evaluation Heuristic |
| :--- | :--- | :--- |
| **1. Technical Skills** | **20** | Entity match against 300+ engineering skills across languages, frameworks, DBs, and tools. |
| **2. Work Experience** | **15** | Detection of internships, roles, tenure durations, and quantifiable metrics ($X\%$, $\$Y$). |
| **3. Project Portfolio** | **15** | Identification of 2+ complex technical projects, GitHub references, and technology stacks. |
| **4. Education Details** | **10** | Detection of degree, branch, university, graduation year, and GPA/percentage formats. |
| **5. Certifications** | **10** | Recognized technical credentials (AWS, GCP, Azure, Oracle, Coursera, HackerRank). |
| **6. ATS Layout** | **10** | Standard section headers (`EXPERIENCE`, `EDUCATION`, `SKILLS`) and parseable typography. |
| **7. Keyword Density** | **10** | Frequency of high-impact action verbs (*Architected*, *Engineered*, *Optimized*, *Implemented*). |
| **8. Compliance & Contact**| **10** | Validated email address, phone number, LinkedIn URL, and GitHub repository links. |

---

### 3.4 Job Description Matcher (TF-IDF & Cosine Similarity)
$$\text{Vector Match} = \cos(\theta) = \frac{\mathbf{v}_{\text{resume}} \cdot \mathbf{v}_{\text{jd}}}{\|\mathbf{v}_{\text{resume}}\| \|\mathbf{v}_{\text{jd}}\|}$$

1. Vectorizes extracted resume text and target job description using scikit-learn's `TfidfVectorizer(stop_words='english', ngram_range=(1, 2))`.
2. Computes the cosine angle representing semantic and lexical alignment.
3. Computes the set difference:
   $$\text{Missing Skills} = S_{\text{JD}} \setminus S_{\text{Resume}}$$

---

### 3.5 4-Axis AI Mock Interview Rubric
Student responses are evaluated against a structured matrix:
$$\text{Overall Score} = \frac{\text{Relevance} + \text{Clarity} + \text{Technical} + \text{Confidence}}{40} \times 100$$
- **Relevance ($0-10$)**: Direct alignment with the prompt; coverage of expected core topics.
- **Communication Clarity ($0-10$)**: Grammatical flow, sentence structure, and vocabulary.
- **Technical Correctness ($0-10$)**: Accuracy of technical terms, architectures, and complexity notation.
- **Delivery Confidence ($0-10$)**: Structured response framework (e.g., STAR method) and decisive phrasing.

---

## 4. Multi-Language Sandboxed Execution Architecture

```
Student Code (Monaco Editor)
             │
             ▼
    POST /api/coding/run/ OR /submit/
             │
     ┌───────┴───────┐
     ▼               ▼
[Judge0 REST API]   [Secure Subprocess Runner]
(Docker Sandbox)    (Resource-Capped Local Exec)
     │               │
     └───────┬───────┘
             ▼
  Evaluation Pipeline:
  - Time Limit: 2000ms
  - Memory Limit: 128MB
  - Status Matrix: ACCEPTED, WRONG_ANSWER, TLE, COMPILATION_ERROR, RUNTIME_ERROR
```

Supported Language Matrices:
- **Python 3.8+** (Interpreter: `python3`)
- **JavaScript** (Runtime: Node.js 18+)
- **C++** (Compiler: `g++ -O2 -std=c++17`)
- **Java** (Compiler: `javac` / Runtime: `java`)

---

## 5. Security & Authentication Architecture

1. **Stateless JWT Tokens**:
   - Access token lifetime: 24 hours (1440 minutes).
   - Refresh token lifetime: 7 days.
   - Automatically sent via `Authorization: Bearer <access_token>` in Axios headers.
2. **Role-Based Access Control (RBAC)**:
   - `User.role == 'STUDENT'` $\rightarrow$ Student Portal (`/dashboard`, `/coding`, `/aptitude`, `/resume`, `/interview`).
   - `User.role == 'ADMIN'` $\rightarrow$ Admin Operations (`/admin/*`).
   - Route enforcement implemented in both frontend React guards (`ProtectedRoute.jsx`) and backend DRF permissions (`IsAuthenticated`, `IsAdminUser`, `IsStudentUser`).
3. **Execution Sandboxing**:
   - Timeouts prevent infinite loops (`timeout = 3.0s`).
   - Standard input/output isolation via pipes.

---

## 6. Development, Seeding & Operations Playbook

### 6.1 Backend Setup & Verification
```bash
cd backend
source ../.venv/bin/activate
pip install -r requirements.txt
python -m spacy download en_core_web_sm
python manage.py migrate
python manage.py seed_data      # Seeds 49+ DSA problems, 60+ MCQs, 10 company tests
python manage.py test           # Runs all 16 automated backend test cases
python manage.py runserver 127.0.0.1:8000
```

### 6.2 Frontend Setup & Verification
```bash
cd frontend
npm install --legacy-peer-deps
npm run build                   # Verifies production bundle build cleanly
npm run dev                     # Launches Vite server on http://localhost:3000
```

### 6.3 Seeded Demo Accounts
- **Student Account**: `student@placement.com` / `Student@123456`
- **Admin Account**: `admin@placement.com` / `Admin@123456`

---

## 7. Common Gotchas & Troubleshooting Protocols

1. **spaCy Model Missing**:
   - *Symptom*: `OSError: [E050] Can't find model 'en_core_web_sm'`.
   - *Fix*: Run `python -m spacy download en_core_web_sm` inside the active `.venv`.
2. **CORS Rejection**:
   - *Symptom*: Browser console shows `Cross-Origin Request Blocked`.
   - *Fix*: Ensure `CORS_ALLOWED_ORIGINS` in `config/settings.py` includes `http://localhost:3000`.
3. **Monaco Editor Loading Latency**:
   - *Symptom*: Monaco flashes blank on slow networks.
   - *Fix*: Monaco loader is pre-bundled; ensure CSP allows inline Web Workers.
4. **SQLite Database Locking**:
   - *Symptom*: `sqlite3.OperationalError: database is locked`.
   - *Fix*: Use short transaction contexts; in production, switch to PostgreSQL via `DATABASE_URL`.

---

## 8. Strategic Roadmap & Future Expansion

- **Phase 3.1**: WebRTC-based AI Video/Speech Mock Interviews with real-time speech-to-text, filler-word tracking, and facial confidence analysis.
- **Phase 3.2**: Live Institutional Coding Contests with synchronized countdown clocks, leaderboards, and anti-cheat tab-switching detection.
- **Phase 3.3**: Direct Placement Cell Webhook integration with campus ERPs (SAP/TCS iON) for automated student eligibility roster exports.
