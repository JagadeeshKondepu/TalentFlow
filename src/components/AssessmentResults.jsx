import React from 'react';
import { BarChart3, Clock, CheckCircle } from 'lucide-react';

const AssessmentResults = ({ candidateId }) => {
  const getSubmission = () => {
    try {
      const submissions = JSON.parse(localStorage.getItem('assessmentSubmissions') || '[]');
      return submissions.find(s => s.candidateId === candidateId);
    } catch (error) {
      console.error('Failed to parse assessment submissions:', error);
      return null;
    }
  };

  const submission = getSubmission();

  if (!submission) {
    return (
      <div>
        <p className="text-gray-600">No assessment completed yet.</p>
      </div>
    );
  }

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <BarChart3 className="text-blue-600" size={20} />
        <span className={`px-2 py-1 rounded text-xs ${
          submission.status === 'completed' ? 'bg-green-100 text-green-700' :
          submission.status === 'under_review' ? 'bg-yellow-100 text-yellow-700' :
          'bg-blue-100 text-blue-700'
        }`}>
          {submission.status.replace('_', ' ').toUpperCase()}
        </span>
      </div>

      <div className="grid grid-2 gap-4 mb-4">
        <div className="flex items-center gap-2">
          <Clock size={16} className="text-gray-500" />
          <span className="text-sm">Time Spent: {submission.timeSpent} minutes</span>
        </div>
        <div className="flex items-center gap-2">
          <CheckCircle size={16} className="text-gray-500" />
          <span className="text-sm">Submitted: {new Date(submission.submittedAt).toLocaleDateString()}</span>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <span>Aptitude:</span>
          <span className={`font-semibold ${getScoreColor(submission.scores.aptitude)}`}>
            {submission.scores.aptitude}%
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span>Communication:</span>
          <span className={`font-semibold ${getScoreColor(submission.scores.communication)}`}>
            {submission.scores.communication}%
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span>Subjective:</span>
          <span className={`font-semibold ${getScoreColor(submission.scores.subjective)}`}>
            {submission.scores.subjective}%
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span>Coding:</span>
          <span className={`font-semibold ${getScoreColor(submission.scores.coding)}`}>
            {submission.scores.coding}%
          </span>
        </div>
        <hr />
        <div className="flex justify-between items-center font-semibold">
          <span>Overall Score:</span>
          <span className={`text-lg ${getScoreColor(submission.scores.overall)}`}>
            {submission.scores.overall}%
          </span>
        </div>
      </div>

      {submission.responses && (
        <div className="mt-4 pt-4 border-t">
          <h4 className="font-medium mb-2">Sample Responses:</h4>
          <div className="text-sm text-gray-600 space-y-2">
            {submission.responses.comm1 && (
              <div>
                <strong>Communication:</strong> {submission.responses.comm1}
              </div>
            )}
            {submission.responses.feed1 && (
              <div>
                <strong>Feedback:</strong> {submission.responses.feed1}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AssessmentResults;