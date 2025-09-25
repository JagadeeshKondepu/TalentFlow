import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import KanbanBoard from '../components/KanbanBoard';
import { apiRequest } from '../utils/api';
import { Search, Users, LayoutGrid } from 'lucide-react';

const CandidatesPage = () => {
  const [search, setSearch] = useState('');
  const [stage, setStage] = useState('');
  const [skillsFilter, setSkillsFilter] = useState('');
  const [scoreFilter, setScoreFilter] = useState('');
  const [minScore, setMinScore] = useState('');
  const [maxScore, setMaxScore] = useState('');
  const [selectedCandidates, setSelectedCandidates] = useState([]);
  const [view, setView] = useState('list'); // 'list' or 'kanban'

  const { data, isLoading, error } = useQuery({
    queryKey: ['candidates', { pageSize: 1000 }],
    queryFn: () => {
      const params = new URLSearchParams({
        pageSize: '1000'
      });
      return apiRequest(`/api/candidates?${params}`);
    },
    retry: false,
    refetchOnWindowFocus: false
  });

  const candidates = data?.data || [];
  
  const getAssessmentStatus = (candidateId) => {
    try {
      let submissions = JSON.parse(localStorage.getItem('assessmentSubmissions') || '[]');
      
      // Fallback to window object if localStorage is empty
      if (submissions.length === 0 && window.assessmentSubmissions) {
        submissions = window.assessmentSubmissions;
      }
      
      const submission = submissions.find(s => s.candidateId === candidateId);
      return submission?.status || null;
    } catch (error) {
      console.warn('Failed to parse assessment submissions:', error.message);
      return null;
    }
  };
  
  const filteredCandidates = candidates.filter(candidate => {
    const matchesSearch = !search || 
      candidate.name.toLowerCase().includes(search.toLowerCase()) ||
      candidate.email.toLowerCase().includes(search.toLowerCase()) ||
      candidate.skills?.some(skill => skill.toLowerCase().includes(search.toLowerCase()));
    const matchesStage = !stage || candidate.stage === stage;
    const matchesSkills = !skillsFilter || 
      candidate.skills?.some(skill => skill.toLowerCase().includes(skillsFilter.toLowerCase()));
    const matchesScore = (!scoreFilter || 
      (scoreFilter === 'high' && candidate.assessmentScore >= 80) ||
      (scoreFilter === 'medium' && candidate.assessmentScore >= 60 && candidate.assessmentScore < 80) ||
      (scoreFilter === 'low' && candidate.assessmentScore < 60) ||
      (scoreFilter === 'above80' && candidate.assessmentScore >= 80)) &&
      (!minScore || candidate.assessmentScore >= parseInt(minScore)) &&
      (!maxScore || candidate.assessmentScore <= parseInt(maxScore));
    return matchesSearch && matchesStage && matchesSkills && matchesScore;
  });



  if (isLoading) {
    return <div className="loading">Loading candidates...</div>;
  }

  if (error) {
    return <div className="text-center py-8 text-red-600">Error: {error.message}</div>;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="font-semibold text-2xl">Candidates</h1>
        <div className="flex gap-2">
          <button
            className={`btn ${view === 'list' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setView('list')}
          >
            <Users size={16} />
          </button>
          <button
            className={`btn ${view === 'kanban' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setView('kanban')}
          >
            <LayoutGrid size={16} />
          </button>
        </div>
      </div>

      <div className="filters">
        <div className="search-input flex items-center gap-2">
          <Search size={16} />
          <input
            type="text"
            placeholder="Search by name, email, skills..."
            className="input"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select
          className="select"
          value={stage}
          onChange={(e) => setStage(e.target.value)}
        >
          <option value="">All Stages</option>
          <option value="applied">Applied</option>
          <option value="screen">Screen</option>
          <option value="tech">Tech</option>
          <option value="offer">Offer</option>
          <option value="hired">Hired</option>
          <option value="rejected">Rejected</option>
        </select>
        <select
          className="select"
          value={skillsFilter}
          onChange={(e) => setSkillsFilter(e.target.value)}
        >
          <option value="">All Skills</option>
          <option value="JavaScript">JavaScript</option>
          <option value="Python">Python</option>
          <option value="React">React</option>
          <option value="Node.js">Node.js</option>
          <option value="SQL">SQL</option>
          <option value="AWS">AWS</option>
          <option value="Java">Java</option>
          <option value="TypeScript">TypeScript</option>
          <option value="Docker">Docker</option>
          <option value="MongoDB">MongoDB</option>
        </select>
        <select
          className="select"
          value={scoreFilter}
          onChange={(e) => setScoreFilter(e.target.value)}
        >
          <option value="">All Scores</option>
          <option value="above80">Above 80%</option>
          <option value="high">High (80-100%)</option>
          <option value="medium">Medium (60-79%)</option>
          <option value="low">Low (&lt;60%)</option>
        </select>
        <input
          type="number"
          placeholder="Min Score"
          className="input"
          value={minScore}
          onChange={(e) => setMinScore(e.target.value)}
          min="0"
          max="100"
        />
        <input
          type="number"
          placeholder="Max Score"
          className="input"
          value={maxScore}
          onChange={(e) => setMaxScore(e.target.value)}
          min="0"
          max="100"
        />
      </div>

      {view === 'list' ? (
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <div className="text-sm text-gray-600">
              Showing {filteredCandidates.length} of {candidates.length} candidates
              {selectedCandidates.length > 0 && ` • ${selectedCandidates.length} selected`}
            </div>
            {selectedCandidates.length > 0 && (
              <div className="flex gap-2">
                <select 
                  className="select text-sm"
                  onChange={(e) => {
                    if (e.target.value) {
                      console.log(`Moving ${selectedCandidates.length} candidates to ${e.target.value}`);
                      setSelectedCandidates([]);
                    }
                  }}
                >
                  <option value="">Bulk Actions</option>
                  <option value="screen">Move to Screen</option>
                  <option value="tech">Move to Tech</option>
                  <option value="offer">Move to Offer</option>
                  <option value="rejected">Reject</option>
                </select>
              </div>
            )}
          </div>
          <div className="grid grid-2 gap-4">
            {filteredCandidates.map(candidate => (
              <div key={candidate.id} className="card flex items-center p-4 border hover:bg-gray-50">
                <input
                  type="checkbox"
                  checked={selectedCandidates.includes(candidate.id)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedCandidates([...selectedCandidates, candidate.id]);
                    } else {
                      setSelectedCandidates(selectedCandidates.filter(id => id !== candidate.id));
                    }
                  }}
                  className="mr-3"
                />
                <div className="flex-1">
                  <div className="font-semibold">{candidate.name}</div>
                  <div className="text-sm text-gray-600">{candidate.email}</div>
                  <div className="text-xs text-gray-500 mt-2">
                    <div className="mb-2">
                      <span className="text-gray-700">Skills: </span>
                      {candidate.skills?.length ? (
                        candidate.skills.slice(0, 3).map((skill, idx) => (
                          <span key={idx} className="tag mr-1">{skill}</span>
                        ))
                      ) : (
                        <span className="text-gray-400">None listed</span>
                      )}
                      {candidate.skills?.length > 3 && (
                        <span className="text-gray-400">+{candidate.skills.length - 3} more</span>
                      )}
                    </div>
                    <div>
                      <span className="text-gray-700">Score: </span>
                      <span className={`font-medium ${
                        candidate.assessmentScore >= 80 ? 'text-green-600' :
                        candidate.assessmentScore >= 60 ? 'text-yellow-600' :
                        'text-red-600'
                      }`}>
                        {candidate.assessmentScore || 'N/A'}%
                      </span>
                    </div>
                  </div>
                  {getAssessmentStatus(candidate.id) && (
                    <div className="mt-2">
                      <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs">
                        Assessment: {getAssessmentStatus(candidate.id)}
                      </span>
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-4">
                  <span className={`status-badge status-${candidate.stage}`}>
                    {candidate.stage}
                  </span>
                  <div className="flex gap-2">
                    <a 
                      href={`/candidates/${candidate.id}`}
                      className="text-blue-600 hover:text-blue-800 text-sm"
                    >
                      View Profile
                    </a>
                    {getAssessmentStatus(candidate.id) && (
                      <a 
                        href={`/assessment-result/${candidate.id}`}
                        className="text-purple-600 hover:text-purple-800 text-sm"
                      >
                        View Result
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <KanbanBoard candidates={filteredCandidates} />
      )}
    </div>
  );
};

export default CandidatesPage;