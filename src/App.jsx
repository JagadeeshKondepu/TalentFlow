import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from './contexts/ThemeContext';
import Navigation from './components/Navigation';
import JobsPage from './pages/JobsPage';
import CandidatesPage from './pages/CandidatesPage';
import AssessmentsPage from './pages/AssessmentsPage';
import JobDetail from './pages/JobDetail';
import CandidateDetail from './pages/CandidateDetail';
import TakeAssessment from './pages/TakeAssessment';
import AssessmentResult from './pages/AssessmentResult';
import ErrorToast from './components/ErrorToast';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      retry: 1,
    },
  },
});

function App() {
  return (
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <Router>
          <div className="App">
            <Navigation />
            <div className="container">
              <Routes>
                <Route path="/" element={<Navigate to="/jobs" replace />} />
                <Route path="/jobs" element={<JobsPage />} />
                <Route path="/jobs/:jobId" element={<JobDetail />} />
                <Route path="/candidates" element={<CandidatesPage />} />
                <Route path="/candidates/:id" element={<CandidateDetail />} />
                <Route path="/assessments" element={<AssessmentsPage />} />
                <Route path="/take-assessment/:jobId/:candidateId" element={<TakeAssessment />} />
                <Route path="/assessment-result/:candidateId" element={<AssessmentResult />} />
              </Routes>
            </div>
            <ErrorToast />
          </div>
        </Router>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;