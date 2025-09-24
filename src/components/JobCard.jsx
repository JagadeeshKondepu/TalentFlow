import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Edit, Archive, ArchiveRestore, GripVertical } from 'lucide-react';
import { Link } from 'react-router-dom';

const JobCard = ({ job, onEdit }) => {
  const queryClient = useQueryClient();
  
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: job.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const archiveMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/jobs/${job.id}`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          'X-Requested-With': 'XMLHttpRequest'
        },
        body: JSON.stringify({ 
          status: job.status === 'active' ? 'archived' : 'active' 
        })
      });
      if (!response.ok) throw new Error('Failed to update job status');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['jobs']);
    },
    onError: (error) => {
      console.error('Failed to update job status:', error);
    }
  });

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="card flex items-center justify-between"
    >
      <div className="flex items-center gap-4">
        <div
          {...attributes}
          {...listeners}
          className="cursor-grab text-gray-400 hover:text-gray-600"
          title="Drag to reorder"
        >
          <GripVertical size={20} />
        </div>
        
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <Link 
              to={`/jobs/${job.id}`}
              className="font-semibold text-lg hover:text-blue-600"
            >
              {job.title}
            </Link>
            <span className={`status-badge ${job.status === 'active' ? 'status-active' : 'status-archived'}`}>
              {job.status}
            </span>
            {job.status === 'archived' && job.archiveReason && (
              <span className="text-xs bg-gray-200 px-2 py-1 rounded">
                {job.archiveReason}
              </span>
            )}
          </div>
          
          <div className="text-sm text-gray-600 mb-2">
            {job.department} • {job.location} • {job.seniority} Level • {job.applicantCount} applicants
          </div>
          
          <div className="flex gap-1 flex-wrap">
            {job.tags.map(tag => (
              <span key={tag} className="tag">
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          className="btn btn-secondary"
          onClick={() => onEdit(job)}
          title="Edit Job"
        >
          <Edit size={16} />
        </button>
        
        <button
          className="btn btn-secondary"
          onClick={() => archiveMutation.mutate()}
          disabled={archiveMutation.isPending}
          title={job.status === 'active' ? 'Archive Job' : 'Restore Job'}
        >
          {job.status === 'active' ? <Archive size={16} /> : <ArchiveRestore size={16} />}
        </button>
      </div>
    </div>
  );
};

export default JobCard;