import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { BarChart3, Users, TrendingUp, CheckCircle } from 'lucide-react';

const JobAnalytics = ({ jobId }) => {
  const { data: candidates } = useQuery({
    queryKey: ['candidates', { jobId }],
    queryFn: async () => {
      const response = await fetch(`/api/candidates?pageSize=1000&jobId=${jobId}`);
      if (!response.ok) throw new Error('Failed to fetch candidates');
      const result = await response.json();
      return result.data;
    }
  });

  const { data: assessmentResponses } = useQuery({
    queryKey: ['assessment-responses', jobId],
    queryFn: async () => {
      // Mock assessment responses
      return Array.from({ length: Math.floor(Math.random() * 20) + 5 }, (_, i) => ({
        id: `response-${i}`,
        candidateId: `candidate-${i}`,
        score: Math.floor(Math.random() * 40) + 60,
        completed: Math.random() > 0.2
      }));
    }
  });

  if (!candidates) return <div>Loading analytics...</div>;

  const stageStats = candidates.reduce((acc, candidate) => {
    acc[candidate.stage] = (acc[candidate.stage] || 0) + 1;
    return acc;
  }, {});

  const conversionRate = candidates.length > 0 
    ? Math.round(((stageStats.hired || 0) / candidates.length) * 100)
    : 0;

  const assessmentCompletion = assessmentResponses 
    ? Math.round((assessmentResponses.filter(r => r.completed).length / assessmentResponses.length) * 100)
    : 0;

  const avgScore = assessmentResponses?.length > 0
    ? Math.round(assessmentResponses.reduce((sum, r) => sum + r.score, 0) / assessmentResponses.length)
    : 0;

  return (
    <div className="grid grid-2 gap-4">
      <div className="card">
        <div className="flex items-center gap-2 mb-3">
          <Users className="text-blue-600" size={20} />
          <h3 className="font-semibold">Applicant Funnel</h3>
        </div>
        <div className="space-y-2">
          {Object.entries(stageStats).map(([stage, count]) => (
            <div key={stage} className="flex justify-between">
              <span className="capitalize">{stage}:</span>
              <span className="font-medium">{count}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="card">
        <div className="flex items-center gap-2 mb-3">
          <TrendingUp className="text-green-600" size={20} />
          <h3 className="font-semibold">Conversion Metrics</h3>
        </div>
        <div className="space-y-3">
          <div className="flex justify-between">
            <span>Hire Rate:</span>
            <span className="font-medium text-green-600">{conversionRate}%</span>
          </div>
          <div className="flex justify-between">
            <span>Assessment Completion:</span>
            <span className="font-medium text-blue-600">{assessmentCompletion}%</span>
          </div>
          <div className="flex justify-between">
            <span>Avg Assessment Score:</span>
            <span className="font-medium text-purple-600">{avgScore}%</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobAnalytics;