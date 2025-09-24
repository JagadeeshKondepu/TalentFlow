import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, CheckCircle, XCircle, Award } from 'lucide-react';

const AssessmentResult = () => {
  const { candidateId } = useParams();

  const { data: candidate, error: candidateError } = useQuery({
    queryKey: ['candidate', candidateId],
    queryFn: async () => {
      const response = await fetch(`/api/candidates?pageSize=1000`);
      if (!response.ok) throw new Error('Failed to fetch candidate');
      const result = await response.json();
      return result.data.find(c => c.id === candidateId);
    }
  });

  const { data: job, error: jobError } = useQuery({
    queryKey: ['job', candidate?.jobId],
    queryFn: async () => {
      if (!candidate?.jobId) return null;
      const response = await fetch(`/api/jobs?pageSize=100`);
      if (!response.ok) throw new Error('Failed to fetch job');
      const result = await response.json();
      return result.data.find(j => j.id === candidate.jobId);
    },
    enabled: !!candidate?.jobId
  });

  const getSubmission = () => {
    try {
      let submissions = JSON.parse(localStorage.getItem('assessmentSubmissions') || '[]');
      
      // Fallback to window object if localStorage is empty
      if (submissions.length === 0 && window.assessmentSubmissions) {
        submissions = window.assessmentSubmissions;
      }
      
      return submissions.find(s => s.candidateId === candidateId);
    } catch (error) {
      console.error('Failed to parse assessment submissions:', error);
      return null;
    }
  };

  const submission = getSubmission();

  if (candidateError || jobError) {
    return (
      <div className="container py-8">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-4 text-red-600">Error Loading Data</h2>
          <p className="mb-4">{candidateError?.message || jobError?.message}</p>
          <Link to="/candidates" className="text-blue-600 hover:text-blue-800">
            Back to Candidates
          </Link>
        </div>
      </div>
    );
  }

  if (!candidate || !submission) {
    return (
      <div className="container py-8">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-4">Assessment Result Not Found</h2>
          <Link to="/candidates" className="text-blue-600 hover:text-blue-800">
            Back to Candidates
          </Link>
        </div>
      </div>
    );
  }

  const sections = [
    { name: 'Aptitude', score: submission.scores.aptitude, maxScore: 100 },
    { name: 'Subjective Questions', score: submission.scores.subjective, maxScore: 100 },
    { name: `Core Fundamentals (${job?.department})`, score: submission.scores.communication, maxScore: 100 },
    { name: 'Code Implementation', score: submission.scores.coding, maxScore: 100 }
  ];

  const overallScore = submission.scores.overall;
  const isQualified = overallScore >= 70;
  const passingThreshold = 70;

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBg = (score) => {
    if (score >= 80) return 'bg-green-100';
    if (score >= 60) return 'bg-yellow-100';
    return 'bg-red-100';
  };

  return (
    <div className="container py-8">
      <div className="flex items-center gap-4 mb-6">
        <Link to="/candidates" className="text-blue-600 hover:text-blue-800">
          <ArrowLeft size={20} />
        </Link>
        <h1 className="font-semibold text-2xl">Assessment Result</h1>
      </div>

      {/* Candidate Info Card */}
      <div className="card mb-6">
        <div className="grid grid-2 gap-6">
          <div>
            <h2 className="font-semibold text-lg mb-4">Candidate Information</h2>
            <div className="space-y-2">
              <div><span className="font-medium">Name:</span> {candidate.name}</div>
              <div><span className="font-medium">Email:</span> {candidate.email}</div>
              <div><span className="font-medium">Applied for:</span> <span className="text-blue-600 font-semibold">{job?.title}</span></div>
              <div><span className="font-medium">Department:</span> {job?.department}</div>
            </div>
          </div>
          <div>
            <h2 className="font-semibold text-lg mb-4">Assessment Summary</h2>
            <div className="space-y-2">
              <div><span className="font-medium">Submitted:</span> {new Date(submission.submittedAt).toLocaleDateString()}</div>
              <div><span className="font-medium">Time Spent:</span> {submission.timeSpent} minutes</div>
              <div><span className="font-medium">Status:</span> 
                <span className={`ml-2 px-2 py-1 rounded text-sm ${
                  submission.status === 'completed' ? 'bg-green-100 text-green-700' :
                  submission.status === 'under_review' ? 'bg-yellow-100 text-yellow-700' :
                  'bg-blue-100 text-blue-700'
                }`}>
                  {submission.status.replace('_', ' ').toUpperCase()}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Section-wise Results */}
      <div className="card mb-6">
        <h2 className="font-semibold text-lg mb-6">Section-wise Performance</h2>
        <div className="grid grid-2 gap-4">
          {sections.map((section, index) => (
            <div key={index} className={`p-4 rounded-lg ${getScoreBg(section.score)}`}>
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-medium">{section.name}</h3>
                <span className={`font-bold text-lg ${getScoreColor(section.score)}`}>
                  {section.score}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full ${
                    section.score >= 80 ? 'bg-green-500' :
                    section.score >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${section.score}%` }}
                ></div>
              </div>
              <div className="text-xs text-gray-600 mt-1">
                {section.score >= 80 ? 'Excellent' :
                 section.score >= 60 ? 'Good' : 'Needs Improvement'}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Final Score & Qualification */}
      <div className="card">
        <div className="text-center">
          <div className="flex items-center justify-center gap-4 mb-4">
            {isQualified ? (
              <CheckCircle className="text-green-600" size={32} />
            ) : (
              <XCircle className="text-red-600" size={32} />
            )}
            <div>
              <h2 className="font-semibold text-2xl">Final Score</h2>
              <div className={`text-4xl font-bold ${getScoreColor(overallScore)}`}>
                {overallScore}%
              </div>
            </div>
          </div>

          <div className={`inline-flex items-center gap-2 px-6 py-3 rounded-lg text-lg font-semibold ${
            isQualified ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
          }`}>
            {isQualified ? <Award size={24} /> : <XCircle size={24} />}
            {isQualified ? 'QUALIFIED FOR NEXT ROUND' : 'NOT QUALIFIED'}
          </div>

          <div className="mt-4 text-sm text-gray-600">
            Passing threshold: {passingThreshold}% | Your score: {overallScore}%
          </div>


        </div>
      </div>
    </div>
  );
};

export default AssessmentResult;