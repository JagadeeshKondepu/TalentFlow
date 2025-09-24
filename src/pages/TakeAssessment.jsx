import React from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import MultiStepAssessment from '../components/MultiStepAssessment';

const TakeAssessment = () => {
  const { jobId, candidateId } = useParams();

  const { data: assessment, isLoading, error } = useQuery({
    queryKey: ['assessment', jobId],
    queryFn: async () => {
      const response = await fetch(`/api/assessments/${jobId}`);
      if (!response.ok) throw new Error('Failed to load assessment');
      return response.json();
    }
  });

  if (isLoading) {
    return <div className="loading">Loading assessment...</div>;
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <h2 className="text-xl font-semibold mb-4 text-red-600">Error Loading Assessment</h2>
        <p>{error.message}</p>
      </div>
    );
  }

  if (!assessment) {
    return (
      <div className="text-center py-8">
        <h2 className="text-xl font-semibold mb-4">Assessment Not Found</h2>
        <p>No assessment is available for this position.</p>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <MultiStepAssessment 
        assessment={assessment} 
        candidateId={candidateId}
      />
    </div>
  );
};

export default TakeAssessment;