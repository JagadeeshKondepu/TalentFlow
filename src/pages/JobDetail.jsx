import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Users, FileText, Plus } from 'lucide-react';
import JobAnalytics from '../components/JobAnalytics';
import AssessmentBuilder from '../components/AssessmentBuilder';

const JobDetail = () => {
  const { jobId } = useParams();
  const [showAssessmentBuilder, setShowAssessmentBuilder] = useState(false);

  const { data: job, isLoading, error: jobError } = useQuery({
    queryKey: ['job', jobId],
    queryFn: async () => {
      const response = await fetch(`/api/jobs?search=${jobId}`);
      if (!response.ok) throw new Error('Failed to fetch job');
      const result = await response.json();
      return result.data.find(j => j.id === jobId);
    }
  });

  const { data: candidates, error: candidatesError } = useQuery({
    queryKey: ['candidates', { jobId }],
    queryFn: async () => {
      const response = await fetch(`/api/candidates?pageSize=1000&jobId=${jobId}`);
      if (!response.ok) throw new Error('Failed to fetch candidates');
      const result = await response.json();
      return result.data;
    }
  });

  const { data: assessment, error: assessmentError } = useQuery({
    queryKey: ['assessment', jobId],
    queryFn: async () => {
      const response = await fetch(`/api/assessments/${jobId}`);
      if (!response.ok) throw new Error('Failed to fetch assessment');
      return response.json();
    }
  });

  if (isLoading) {
    return <div className="loading">Loading job details...</div>;
  }

  if (jobError || candidatesError || assessmentError) {
    return (
      <div className="text-center py-8 text-red-600">
        Error: {jobError?.message || candidatesError?.message || assessmentError?.message}
      </div>
    );
  }

  if (!job) {
    return <div className="text-center py-8">Job not found</div>;
  }

  const candidatesByStage = candidates?.reduce((acc, candidate) => {
    acc[candidate.stage] = (acc[candidate.stage] || 0) + 1;
    return acc;
  }, {}) || {};

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <Link to="/jobs" className="text-blue-600 hover:text-blue-800">
          <ArrowLeft size={20} />
        </Link>
        <h1 className="font-semibold text-2xl">{job.title}</h1>
        <span className={`status-badge ${job.status === 'active' ? 'status-active' : 'status-archived'}`}>
          {job.status}
        </span>
      </div>

      <div className="space-y-6">
        <JobAnalytics jobId={jobId} />
        
        <div className="grid grid-2 gap-6">
          <div className="card">
            <h2 className="font-semibold text-lg mb-4">Job Information</h2>
            <div className="space-y-3">
              <div>
                <span className="font-medium">Department:</span> {job.department}
              </div>
              <div>
                <span className="font-medium">Location:</span> {job.location}
              </div>
              <div>
                <span className="font-medium">Seniority:</span> {job.seniority}
              </div>
              <div>
                <span className="font-medium">Created:</span> {new Date(job.createdAt).toLocaleDateString()}
              </div>
              {job.archiveReason && (
                <div>
                  <span className="font-medium">Archive Reason:</span> {job.archiveReason}
                </div>
              )}
              <div>
                <span className="font-medium">Tags:</span>
                <div className="flex gap-1 flex-wrap mt-1">
                  {job.tags.map(tag => (
                    <span key={tag} className="tag">{tag}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>

        <div className="card">
          <h2 className="font-semibold text-lg mb-4 flex items-center gap-2">
            <Users size={20} />
            Candidates ({candidates?.length || 0})
          </h2>
          <div className="space-y-2">
            {Object.entries(candidatesByStage).map(([stage, count]) => (
              <div key={stage} className="flex justify-between">
                <span className="capitalize">{stage}:</span>
                <span className="font-medium">{count}</span>
              </div>
            ))}
          </div>
          <Link 
            to="/candidates" 
            className="btn btn-primary mt-4 inline-block text-center"
          >
            View All Candidates
          </Link>
        </div>

        <div className="card">
          <h2 className="font-semibold text-lg mb-4 flex items-center gap-2">
            <FileText size={20} />
            Assessment
          </h2>
          {assessment ? (
            <div>
              <div className="font-medium mb-2">{assessment.title}</div>
              <div className="text-sm text-gray-600 mb-4">
                {assessment.sections?.length || 0} sections, {' '}
                {assessment.sections?.reduce((total, section) => 
                  total + (section.questions?.length || 0), 0) || 0} questions
              </div>
              <Link 
                to="/assessments" 
                className="btn btn-secondary"
              >
                Edit Assessment
              </Link>
            </div>
          ) : (
            <div>
              <div className="text-gray-600 mb-4">No assessment created yet</div>
              <button 
                onClick={() => setShowAssessmentBuilder(true)}
                className="btn btn-primary flex items-center gap-2"
              >
                <Plus size={16} />
                Create Assessment
              </button>
            </div>
          )}
          </div>
        </div>
      </div>
      
      {showAssessmentBuilder && (
        <AssessmentBuilder
          jobId={jobId}
          domain={job.department}
          onClose={() => setShowAssessmentBuilder(false)}
        />
      )}
    </div>
  );
};

export default JobDetail;