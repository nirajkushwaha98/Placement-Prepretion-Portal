# 🧭 Application Flow & Information Architecture (APP FLOW)
## Placement Preparation Portal (P3)

---

### Document Control
- **Document Version**: 2.0.0
- **Status**: Production Reference
- **System**: End-to-End Navigation, User Journeys, Sitemaps & State Machines
- **Target Audience**: Product Managers, Frontend Engineers, QA Engineers, UX Designers

---

## 1. Information Architecture & Sitemap

```mermaid
graph TD
    Root["/ (Landing / Root Redirect)"] --> AuthCheck{Is Authenticated?}
    
    AuthCheck -->|No| Login["/login"]
    AuthCheck -->|No| Register["/register"]
    
    AuthCheck -->|Yes: Role=STUDENT| StudentPortal[Student Portal]
    AuthCheck -->|Yes: Role=ADMIN| AdminPortal[Admin Operations Center]

    subgraph Student Portal Routes
        StudentPortal --> S_Dash["/dashboard (Readiness Dashboard)"]
        StudentPortal --> S_Apt["/aptitude (Aptitude Lineup & Drills)"]
        S_Apt --> S_AptRun["/aptitude/test/:testId (Live Test Runner)"]
        S_Apt --> S_AptRev["/aptitude/review/:attemptId (Diagnostic Review)"]
        
        StudentPortal --> S_Code["/coding (Coding Problem Catalog)"]
        StudentPortal --> S_DSASheet["/dsa-sheet (49+ Curated DSA Sheet)"]
        S_Code --> S_CodeWork["/coding/:problemId (Monaco Coding Workspace)"]
        S_DSASheet --> S_CodeWork
        
        StudentPortal --> S_Resume["/resume (Resume ATS Analyzer)"]
        StudentPortal --> S_JobMatch["/job-match (Job Description Matcher)"]
        
        StudentPortal --> S_Int["/interview (Interview Preparation Catalog)"]
        S_Int --> S_IntPrac["/interview/practice/:questionId (Mock Interview Arena)"]
        
        StudentPortal --> S_Prog["/progress (Chronological Analytics & Radar)"]
        StudentPortal --> S_Prof["/profile (Student Profile & Portfolio)"]
    end

    subgraph Admin Operations Routes
        AdminPortal --> A_Dash["/admin/dashboard (Batch Analytics & Cohort KPIs)"]
        AdminPortal --> A_Stud["/admin/students (Student Roster & Dossiers)"]
        AdminPortal --> A_Quest["/admin/questions (Aptitude MCQ Management)"]
        AdminPortal --> A_Code["/admin/coding (DSA Problem Management)"]
        AdminPortal --> A_Int["/admin/interview (Interview Question Management)"]
        AdminPortal --> A_Rep["/admin/reports (Batch CSV Export & Insights)"]
        AdminPortal --> A_Prof["/admin/profile (Admin Settings & Profile)"]
    end
```

---

## 2. Authentication, Role Resolution & Session Lifecycle Flow

```mermaid
sequenceDiagram
    autonumber
    actor User as User (Browser)
    participant UI as Login / Register UI
    participant AuthCtx as AuthContext (React)
    participant API as /api/auth/login/
    participant Router as ProtectedRoute / RouteGuards

    User->>UI: Enter Email & Password (or Quick-Demo Student/Admin)
    UI->>API: POST /api/auth/login/ {email, password}
    alt Invalid Credentials
        API-->>UI: 401 Unauthorized {detail: "No active account found..."}
        UI-->>User: Display Toast Error
    else Valid Credentials
        API-->>UI: 200 OK {access, refresh, user: {id, email, role, full_name}}
        UI->>AuthCtx: login(tokens, user)
        AuthCtx->>AuthCtx: Persist tokens in localStorage & memory
        AuthCtx-->>Router: Update authentication state
        alt User Role == 'STUDENT'
            Router-->>User: Redirect to /dashboard
        else User Role == 'ADMIN'
            Router-->>User: Redirect to /admin/dashboard
        end
    end
```

---

## 3. Student Assessment & Practice Workflows

### 3.1 Aptitude Test & Dynamic Drill Flow
```mermaid
flowchart TD
    Start([Navigate to /aptitude]) --> Choice{Select Test Mode}
    
    Choice -->|Company Mock| Comp[Choose TCS, Infosys, Amazon, etc.]
    Choice -->|Dynamic Drill| Drill[Select Category, Question Count 5-50 & Difficulty]
    
    Comp --> FetchTest[GET /api/aptitude/tests/:id/]
    Drill --> GenDrill[POST /api/aptitude/practice/generate/]
    
    FetchTest --> InitRunner["Mount /aptitude/test/:id (Test Runner)"]
    GenDrill --> InitRunner
    
    InitRunner --> TimerStart[Initialize Synchronized Countdown Timer]
    TimerStart --> RenderQ[Render Active Question & 4 Options]
    
    RenderQ --> UserAction{Student Action}
    
    UserAction -->|Select Option| SaveAns[Update TestAnswer state in-memory]
    UserAction -->|Flag Question| ToggleFlag[Mark Question in Palette as Flagged]
    UserAction -->|Jump Palette| NavQ[Set Active Question by Index]
    UserAction -->|Click Next / Prev| StepQ[Increment/Decrement Active Question]
    
    SaveAns --> CheckDone{Time Expired OR User Clicks Submit?}
    ToggleFlag --> CheckDone
    NavQ --> CheckDone
    StepQ --> CheckDone
    
    CheckDone -->|No| RenderQ
    CheckDone -->|Yes| SubmitModal[Prompt Confirmation Dialog]
    
    SubmitModal --> ConfirmSub[POST /api/aptitude/attempts/ with Answers Payload]
    ConfirmSub --> ServerScore[DRF Evaluates Score, Negative Marks & Topic Breakdown]
    ServerScore --> NavReview["Navigate to /aptitude/review/:attemptId"]
    NavReview --> ShowDiagnostic[Display Percentage, Correct/Incorrect, Explanations]
```

---

### 3.2 Coding Problem & DSA Arena Workflow
```mermaid
flowchart TD
    StartCode([Navigate to /coding or /dsa-sheet]) --> Browse[Browse 49+ Problems with Tag/Difficulty Filter]
    Browse --> SelectProblem[Click Problem Card -> Open /coding/:problemId]
    
    SelectProblem --> FetchSpec[GET /api/coding/problems/:id/]
    FetchSpec --> RenderWorkspace[Mount Split-Screen Monaco Workspace]
    RenderWorkspace --> LoadStarter[Load Language Starter Code & Sample Test Cases]
    
    LoadStarter --> CodeEdit[Student Writes Solution in Monaco Editor]
    CodeEdit --> ActionType{Action Selected}
    
    ActionType -->|Run Code (Sample Cases)| RunAPI[POST /api/coding/run/ {code, language, input}]
    RunAPI --> ExecSample[Judge0 / Subprocess executes against sample I/O]
    ExecSample --> ShowConsole[Render Sample Output vs Expected in Console Tab]
    ShowConsole --> CodeEdit
    
    ActionType -->|Submit Solution| SubAPI[POST /api/coding/problems/:id/submit/]
    SubAPI --> ExecHidden[Judge0 evaluates all hidden test cases]
    ExecHidden --> EvaluateVerdict{Check Results}
    
    EvaluateVerdict -->|All Passed| StatusAccepted[Status: ACCEPTED (Points Awarded)]
    EvaluateVerdict -->|Mismatch| StatusWA[Status: WRONG_ANSWER (Failed Case Diff)]
    EvaluateVerdict -->|Exceeded 2s| StatusTLE[Status: TIME_LIMIT_EXCEEDED]
    EvaluateVerdict -->|Syntax Error| StatusCE[Status: COMPILATION_ERROR (Traceback)]
    
    StatusAccepted --> UpdateStats[Update Coding Score & Readiness Index]
    StatusWA --> ShowConsole
    StatusTLE --> ShowConsole
    StatusCE --> ShowConsole
    UpdateStats --> ShowCelebration[Display Success Modal & Updated Score]
```

---

### 3.3 Resume Upload, ATS Analysis & JD Matching Flow
```mermaid
sequenceDiagram
    autonumber
    actor Student as Student
    participant UI as ResumeAnalyzer / JobMatcher UI
    participant API as /api/resume/
    participant Parser as pdfplumber / docx Extractor
    participant NLP as spaCy 8-Category ATS Engine
    participant TFIDF as Scikit-Learn TF-IDF Matcher
    participant DB as Database

    alt Scenario A: Resume Ingestion & ATS Scoring
        Student->>UI: Upload PDF/DOCX or Paste Text
        UI->>API: POST /api/resume/upload/ (multipart/form-data)
        API->>Parser: Extract clean plain-text runs
        API->>NLP: Analyze skills, contact, education, verbs, layout
        NLP->>NLP: Calculate 8-category breakdown & overall score (0-100)
        NLP->>DB: Save Resume & ResumeAnalysis records
        NLP-->>API: Analysis JSON (Scores, Strengths, Weaknesses, Suggestions)
        API-->>UI: 200 OK (Render Diagnostic Radar & ATS Breakdown)
    else Scenario B: Job Description (JD) Gap Matcher
        Student->>UI: Paste Target Job Description (JD) Text & Select Resume
        UI->>API: POST /api/resume/match-jd/ {resume_id, jd_text}
        API->>TFIDF: Fit Transform Resume & JD texts into TF-IDF Vectors
        TFIDF->>TFIDF: Compute Cosine Similarity Match Percentage
        TFIDF->>NLP: Extract JD required skills vs Resume skills (Set Difference)
        TFIDF->>DB: Persist JobDescriptionMatch record
        TFIDF-->>API: Match Report (Match Score %, Matched Skills, Missing Skills)
        API-->>UI: 200 OK (Render Match Gauge & Skill Gap Badges)
    end
```

---

### 3.4 AI Mock Interview Evaluation Flow
```mermaid
flowchart TD
    StartInt([Navigate to /interview]) --> SelectCat[Choose Category: HR, Technical, STAR Behavioral, Company]
    SelectCat --> ChooseQ[Select Interview Question Card]
    ChooseQ --> OpenPractice["Open /interview/practice/:questionId"]
    
    OpenPractice --> ReadPrompt[Read Question, Difficulty & Key Talking Points Hints]
    ReadPrompt --> Articulate[Student Types Structured Answer]
    
    Articulate --> SubmitAnswer[Click 'Submit for AI Evaluation']
    SubmitAnswer --> EvalAPI[POST /api/interview/submit-answer/]
    
    EvalAPI --> FourAxisNLP[Evaluate 4 Diagnostic Dimensions]
    FourAxisNLP --> Axis1[Relevance Score: 0-10]
    FourAxisNLP --> Axis2[Communication Clarity: 0-10]
    FourAxisNLP --> Axis3[Technical Depth: 0-10]
    FourAxisNLP --> Axis4[Delivery Structure: 0-10]
    
    Axis1 --> CalcOverall[Compute Composite Score out of 100 & Actionable Feedback]
    Axis2 --> CalcOverall
    Axis3 --> CalcOverall
    Axis4 --> CalcOverall
    
    CalcOverall --> SaveAttempt[Persist InterviewAttempt record in DB]
    SaveAttempt --> RenderComparison[Render Split Comparison: Student Answer vs Model Answer with Talking Points]
```

---

## 4. Administrator Operations Flow

```mermaid
flowchart TD
    AdminLogin([Admin Logs in at /login]) --> AdminDash["Mount /admin/dashboard"]
    
    AdminDash --> BatchMetrics[View Aggregated KPIs: Batch Readiness Avg, Submissions, Tier Donut]
    
    AdminDash --> AdminAction{Admin Tasks}
    
    AdminAction -->|Student Roster| NavRoster["Navigate to /admin/students"]
    NavRoster --> FilterRoster[Filter by Branch, Year, or Readiness Tier]
    FilterRoster --> ViewDossier[Open Individual Student Diagnostic Dossier]
    
    AdminAction -->|Question Management| NavQuestions["Navigate to /admin/questions"]
    NavQuestions --> CRUDMCQ[Create, Edit or Archive Aptitude MCQs]
    
    AdminAction -->|Coding Challenges| NavCoding["Navigate to /admin/coding"]
    NavCoding --> CRUDCode[Create DSA Problem, Starter Code & Test Cases]
    
    AdminAction -->|Interview Bank| NavInterview["Navigate to /admin/interview"]
    NavInterview --> CRUDInterview[Manage Behavioral & Technical Prompts]
    
    AdminAction -->|Placement Reports| NavReports["Navigate to /admin/reports"]
    NavReports --> ExportCSV["Trigger GET /api/dashboard/admin/export-csv/"]
    ExportCSV --> DownloadFile[Download Formatted Batch Readiness CSV for TPO]
```

---

## 5. State Transition Models

### 5.1 Aptitude Test State Machine
```mermaid
stateDiagram-v2
    [*] --> NOT_STARTED: Test Selected
    NOT_STARTED --> IN_PROGRESS: Test Runner Initialized & Timer Starts
    
    IN_PROGRESS --> IN_PROGRESS: Option Selected / Deselected
    IN_PROGRESS --> IN_PROGRESS: Marked / Unmarked for Review
    
    IN_PROGRESS --> SUBMITTED: User Confirms Submission
    IN_PROGRESS --> SUBMITTED: Countdown Timer Reaches 00:00 (Auto-submit)
    
    SUBMITTED --> EVALUATED: Server Computes Marks & Negative Penalties
    EVALUATED --> REVIEW_MODE: Student Navigates to /aptitude/review/:id
    REVIEW_MODE --> [*]
```

### 5.2 Coding Submission State Machine
```mermaid
stateDiagram-v2
    [*] --> DRAFT: Student Editing in Monaco
    DRAFT --> RUNNING: User clicks 'Run Code' (Sample Cases)
    RUNNING --> DRAFT: Sample Output Displayed in Console
    
    DRAFT --> SUBMITTING: User clicks 'Submit Solution'
    SUBMITTING --> EVALUATING: Code Dispatched to Judge0 / Sandbox
    
    EVALUATING --> ACCEPTED: All Hidden Test Cases Match Output
    EVALUATING --> WRONG_ANSWER: Output Mismatch on Test Case N
    EVALUATING --> TIME_LIMIT_EXCEEDED: Execution Exceeded 2000ms
    EVALUATING --> COMPILATION_ERROR: Syntax / Build Failure
    EVALUATING --> RUNTIME_ERROR: Exception Thrown During Execution
    
    ACCEPTED --> [*]: Score & Readiness Updated
    WRONG_ANSWER --> DRAFT: Review Diff & Revise
    TIME_LIMIT_EXCEEDED --> DRAFT: Optimize Time Complexity
    COMPILATION_ERROR --> DRAFT: Fix Syntax Error
    RUNTIME_ERROR --> DRAFT: Fix Exception
```
