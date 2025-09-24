import React from 'react';
import { DndContext, closestCenter } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';

const stages = [
  { id: 'applied', title: 'Applied', color: '#e5e7eb' },
  { id: 'screen', title: 'Screen', color: '#dbeafe' },
  { id: 'tech', title: 'Tech Interview', color: '#fef3c7' },
  { id: 'offer', title: 'Offer', color: '#d1fae5' },
  { id: 'hired', title: 'Hired', color: '#dcfce7' },
  { id: 'rejected', title: 'Rejected', color: '#fee2e2' }
];

const CandidateCard = ({ candidate }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: candidate.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="kanban-card"
    >
      <div className="font-semibold text-sm mb-1">{candidate.name}</div>
      <div className="text-xs text-gray-600 mb-2">{candidate.email}</div>
      <Link 
        to={`/candidates/${candidate.id}`}
        className="text-xs text-blue-600 hover:text-blue-800"
      >
        View Profile
      </Link>
    </div>
  );
};

const KanbanColumn = ({ stage, candidates }) => {
  return (
    <div className="kanban-column" style={{ backgroundColor: stage.color }}>
      <div className="kanban-header">
        {stage.title} ({candidates.length})
      </div>
      <SortableContext items={candidates.map(c => c.id)} strategy={verticalListSortingStrategy}>
        {candidates.map(candidate => (
          <CandidateCard key={candidate.id} candidate={candidate} />
        ))}
      </SortableContext>
    </div>
  );
};

const KanbanBoard = ({ candidates }) => {
  const queryClient = useQueryClient();

  const moveMutation = useMutation({
    mutationFn: async ({ candidateId, newStage }) => {
      const response = await fetch(`/api/candidates/${candidateId}`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          'X-Requested-With': 'XMLHttpRequest'
        },
        body: JSON.stringify({ stage: newStage })
      });
      if (!response.ok) throw new Error('Failed to move candidate');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['candidates']);
    },
    onError: (error) => {
      console.error('Failed to move candidate:', error);
      queryClient.invalidateQueries(['candidates']);
    }
  });

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (!over) return;

    const candidateId = active.id;
    const newStage = over.id;
    
    const candidate = candidates.find(c => c.id === candidateId);
    if (candidate && candidate.stage !== newStage) {
      moveMutation.mutate({ candidateId, newStage });
    }
  };

  const candidatesByStage = stages.reduce((acc, stage) => {
    acc[stage.id] = candidates.filter(c => c.stage === stage.id);
    return acc;
  }, {});

  return (
    <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <div className="kanban-board">
        {stages.map(stage => (
          <div key={stage.id} id={stage.id}>
            <KanbanColumn 
              stage={stage} 
              candidates={candidatesByStage[stage.id] || []} 
            />
          </div>
        ))}
      </div>
    </DndContext>
  );
};

export default KanbanBoard;