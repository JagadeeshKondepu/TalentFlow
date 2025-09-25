import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '../utils/api';
import AssessmentBuilder from '../components/AssessmentBuilder';
import AssessmentLibrary from '../components/AssessmentLibrary';
import { Plus } from 'lucide-react';

const AssessmentsPage = () => {
  const [selectedJobId, setSelectedJobId] = useState('');
  const [showBuilder, setShowBuilder] = useState(false);

  const { data: jobs, error: jobsError } = useQuery({
    queryKey: ['jobs', { status: 'active' }],
    queryFn: async () => {
      return await apiRequest('/api/jobs?status=active&pageSize=100');
    },
    retry: false
  });

  const { data: assessment, error: assessmentError } = useQuery({
    queryKey: ['assessment', selectedJobId],
    queryFn: async () => {
      if (!selectedJobId) return null;
      return await apiRequest(`/api/assessments/${selectedJobId}`);
    },
    enabled: !!selectedJobId,
    retry: false
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="font-semibold text-2xl">Assessments</h1>
      </div>

      <div className="mb-6">
        <label className="form-label">Select Job</label>
        {jobsError ? (
          <div className="text-red-600 text-sm">Error loading jobs: {jobsError.message}</div>
        ) : (
          <select
            className="select"
            value={selectedJobId}
            onChange={(e) => setSelectedJobId(e.target.value)}
          >
            <option value="">Choose a job...</option>
            {jobs?.data?.map(job => (
              <option key={job.id} value={job.id}>
                {job.title}
              </option>
            ))}
          </select>
        )}
      </div>

      <div className="grid grid-2 gap-6">
        <div>
          <AssessmentLibrary 
            onSelectTemplate={(template) => {
              console.log('Selected template:', template.title);
            }}
          />
        </div>
        
        {selectedJobId && (
          <div>
            {assessmentError ? (
              <div className="text-red-600 text-sm">Error loading assessment: {assessmentError.message}</div>
            ) : (
              <div>
                {assessment ? (
                  <div className="card">
                    <h3 className="font-semibold mb-2">Existing Assessment</h3>
                    <p className="text-sm text-gray-600 mb-4">{assessment.title}</p>
                    <button 
                      onClick={() => setShowBuilder(true)}
                      className="btn btn-secondary"
                    >
                      Edit Assessment
                    </button>
                  </div>
                ) : (
                  <div className="card">
                    <h3 className="font-semibold mb-2">No Assessment Found</h3>
                    <p className="text-sm text-gray-600 mb-4">Create a new assessment for this job.</p>
                    <button 
                      onClick={() => setShowBuilder(true)}
                      className="btn btn-primary flex items-center gap-2"
                    >
                      <Plus size={16} />
                      Create Assessment
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
      
      {showBuilder && selectedJobId && (
        <AssessmentBuilder 
          jobId={selectedJobId} 
          domain={jobs?.data?.find(job => job.id === selectedJobId)?.department || 'General'}
          assessment={assessment}
          onClose={() => setShowBuilder(false)}
        />
      )}
    </div>
  );
};

export default AssessmentsPage;