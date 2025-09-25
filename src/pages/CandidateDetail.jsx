import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '../utils/api';
import { ArrowLeft, Plus, Clock } from 'lucide-react';
import AssessmentResults from '../components/AssessmentResults';

const CandidateDetail = () => {
  const { id } = useParams();
  const [newNote, setNewNote] = useState('');
  const queryClient = useQueryClient();

  const { data: candidate, isLoading, error } = useQuery({
    queryKey: ['candidate', id],
    queryFn: async () => {
      const result = await apiRequest(`/api/candidates?pageSize=1000`);
      return result.data.find(c => c.id === id);
    },
    retry: false
  });

  const { data: job } = useQuery({
    queryKey: ['job', candidate?.jobId],
    queryFn: async () => {
      if (!candidate?.jobId) return null;
      const result = await apiRequest(`/api/jobs?pageSize=100`);
      return result.data.find(j => j.id === candidate.jobId);
    },
    enabled: !!candidate?.jobId,
    retry: false
  });

  const { data: timeline } = useQuery({
    queryKey: ['timeline', id],
    queryFn: async () => {
      return await apiRequest(`/api/candidates/${id}/timeline`);
    },
    retry: false
  });

  const addNoteMutation = useMutation({
    mutationFn: async (note) => {
      return await apiRequest(`/api/candidates/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ 
          notes: [...(candidate.notes || []), {
            id: Date.now().toString(),
            content: note,
            mentions: extractMentions(note),
            createdAt: new Date().toISOString(),
            author: 'Current User'
          }]
        })
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['candidate', id]);
      setNewNote('');
    },
    onError: (error) => {
      console.warn('Failed to add note:', error.message);
    }
  });

  const extractMentions = (text) => {
    const mentions = text.match(/@\w+/g) || [];
    return mentions.map(mention => mention.substring(1));
  };

  const renderMentions = (text) => {
    const parts = text.split(/(@\w+)/g);
    return parts.map((part, index) => {
      if (part.startsWith('@')) {
        return <span key={index} className="mention">{part}</span>;
      }
      return part;
    });
  };

  const handleAddNote = (e) => {
    e.preventDefault();
    if (newNote.trim()) {
      addNoteMutation.mutate(newNote);
    }
  };

  if (isLoading) {
    return <div className="loading">Loading candidate details...</div>;
  }

  if (error) {
    return <div className="text-center py-8 text-red-600">Error: {error.message}</div>;
  }

  if (!candidate) {
    return <div className="text-center py-8">Candidate not found</div>;
  }

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <Link to="/candidates" className="text-blue-600 hover:text-blue-800">
          <ArrowLeft size={20} />
        </Link>
        <h1 className="font-semibold text-2xl">{candidate.name}</h1>
        <span className={`status-badge status-${candidate.stage}`}>
          {candidate.stage}
        </span>
      </div>

      <div className="grid grid-2 gap-6">
        <div className="card">
          <h2 className="font-semibold text-lg mb-4">Candidate Information</h2>
          <div className="space-y-3">
            <div>
              <span className="font-medium">Email:</span> {candidate.email}
            </div>
            <div>
              <span className="font-medium">Applied for:</span> 
              <span className="ml-2 font-semibold text-blue-600">
                {job?.title || 'Loading...'}
              </span>
            </div>
            <div>
              <span className="font-medium">Department:</span> {job?.department}
            </div>
            <div>
              <span className="font-medium">Location:</span> {job?.location}
            </div>
            <div>
              <span className="font-medium">Current Stage:</span> 
              <span className="capitalize ml-2">{candidate.stage}</span>
            </div>
            <div>
              <span className="font-medium">Applied:</span> {new Date(candidate.createdAt).toLocaleDateString()}
            </div>
          </div>
        </div>

        <div className="card">
          <h2 className="font-semibold text-lg mb-4 flex items-center gap-2">
            <Clock size={20} />
            Timeline
          </h2>
          <div className="timeline">
            {Array.isArray(timeline) ? timeline.map(event => (
              <div key={event.id} className="timeline-item">
                <div className="text-sm font-medium">
                  {event.type === 'stage_change' && 
                    `Moved from ${event.fromStage} to ${event.toStage}`}
                  {event.type === 'note_added' && 'Note added'}
                  {event.type === 'assessment_completed' && 'Assessment completed'}
                </div>
                <div className="text-xs text-gray-600">
                  {new Date(event.createdAt).toLocaleString()}
                </div>
              </div>
            )) : <div className="text-gray-500">No timeline events</div>}
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-lg">Assessment Results</h2>
            <Link 
              to={`/assessment-result/${id}`}
              className="btn btn-primary text-sm"
            >
              View Full Result
            </Link>
          </div>
          <AssessmentResults candidateId={id} />
        </div>

        <div className="card col-span-2">
          <h2 className="font-semibold text-lg mb-4">Notes</h2>
          
          <form onSubmit={handleAddNote} className="mb-4">
            <textarea
              className="textarea w-full mb-2"
              placeholder="Add a note... Use @username to mention someone"
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              rows={3}
            />
            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={addNoteMutation.isPending}
            >
              <Plus size={16} />
              Add Note
            </button>
          </form>

          <div className="space-y-4">
            {candidate.notes?.map(note => (
              <div key={note.id} className="border-l-4 border-blue-200 pl-4">
                <div className="text-sm mb-1">
                  {renderMentions(note.content)}
                </div>
                <div className="text-xs text-gray-600">
                  By {note.author} on {new Date(note.createdAt).toLocaleString()}
                </div>
              </div>
            )) || (
              <div className="text-gray-500 text-center py-4">
                No notes yet. Add the first note above.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CandidateDetail;