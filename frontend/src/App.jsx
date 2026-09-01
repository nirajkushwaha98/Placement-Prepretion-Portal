import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute, AdminRoute, StudentRoute } from './components/ProtectedRoute';
import Layout from './components/Layout';
import ErrorBoundary from './components/ErrorBoundary';

// Auth Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';

// Student Pages
import Dashboard from './pages/student/Dashboard';
import Aptitude from './pages/student/Aptitude';
import AptitudeRunner from './pages/student/AptitudeRunner';
import Coding from './pages/student/Coding';
import CodingWorkspace from './pages/student/CodingWorkspace';
import ResumeAnalyzer from './pages/student/ResumeAnalyzer';
import JobMatcher from './pages/student/JobMatcher';
import InterviewPrep from './pages/student/InterviewPrep';
import MockInterview from './pages/student/MockInterview';
import Progress from './pages/student/Progress';
import Profile from './pages/student/Profile';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminStudents from './pages/admin/AdminStudents';
import AdminQuestions from './pages/admin/AdminQuestions';
import AdminCoding from './pages/admin/AdminCoding';
import AdminInterview from './pages/admin/AdminInterview';
import AdminReports from './pages/admin/AdminReports';
import AdminProfile from './pages/admin/AdminProfile';

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <Router>
          <Routes>
            {/* Public Auth Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Root Redirect */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />

            {/* Student Protected Routes */}
            <Route element={<ProtectedRoute />}>
              <Route element={<Layout />}>
                {/* Student Only */}
                <Route element={<StudentRoute />}>
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/aptitude" element={<Aptitude />} />
                  <Route path="/aptitude/test/:testId" element={<AptitudeRunner />} />
                  <Route path="/aptitude/review/:attemptId" element={<AptitudeRunner isReviewMode={true} />} />
                  <Route path="/coding" element={<Coding />} />
                  <Route path="/coding/:problemId" element={<CodingWorkspace />} />
                  <Route path="/resume" element={<ResumeAnalyzer />} />
                  <Route path="/job-match" element={<JobMatcher />} />
                  <Route path="/interview" element={<InterviewPrep />} />
                  <Route path="/interview/practice/:questionId" element={<MockInterview />} />
                  <Route path="/progress" element={<Progress />} />
                  <Route path="/profile" element={<Profile />} />
                </Route>

                {/* Admin Only */}
                <Route element={<AdminRoute />}>
                  <Route path="/admin/dashboard" element={<AdminDashboard />} />
                  <Route path="/admin/students" element={<AdminStudents />} />
                  <Route path="/admin/questions" element={<AdminQuestions />} />
                  <Route path="/admin/coding" element={<AdminCoding />} />
                  <Route path="/admin/interview" element={<AdminInterview />} />
                  <Route path="/admin/reports" element={<AdminReports />} />
                  <Route path="/admin/profile" element={<AdminProfile />} />
                </Route>
              </Route>
            </Route>

            {/* Catch-all */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </Router>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
