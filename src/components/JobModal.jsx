import React, { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { X } from 'lucide-react';

const JobModal = ({ job, onClose }) => {
  const [formData, setFormData] = useState({
    title: '',
    tags: '',
    status: 'active'
  });
  const [errors, setErrors] = useState({});
  
  const queryClient = useQueryClient();

  useEffect(() => {
    if (job) {
      setFormData({
        title: job.title,
        tags: job.tags.join(', '),
        status: job.status
      });
    }
  }, [job]);

  const mutation = useMutation({
    mutationFn: async (data) => {
      const url = job ? `/api/jobs/${job.id}` : '/api/jobs';
      const method = job ? 'PATCH' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 
          'Content-Type': 'application/json',
          'X-Requested-With': 'XMLHttpRequest'
        },
        body: JSON.stringify({
          ...data,
          slug: data.title.toLowerCase().replace(/\s+/g, '-'),
          tags: data.tags.split(',').map(tag => tag.trim()).filter(Boolean),
          order: job?.order || Date.now()
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP ${response.status}: Failed to save job`);
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['jobs']);
      onClose();
    },
    onError: (error) => {
      console.error('Failed to save job:', error);
      setErrors({ submit: error.message });
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const newErrors = {};
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    setErrors({});
    mutation.mutate(formData);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-xl">
            {job ? 'Edit Job' : 'Create Job'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Title *</label>
            <input
              type="text"
              className="input w-full"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />
            {errors.title && <div className="error">{errors.title}</div>}
          </div>

          <div className="form-group">
            <label className="form-label">Tags (comma separated)</label>
            <input
              type="text"
              className="input w-full"
              placeholder="React, Node.js, TypeScript"
              value={formData.tags}
              onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Status</label>
            <select
              className="select w-full"
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
            >
              <option value="active">Active</option>
              <option value="archived">Archived</option>
            </select>
          </div>

          <div className="flex gap-2 justify-end">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={mutation.isPending}
            >
              {mutation.isPending ? 'Saving...' : 'Save'}
            </button>
          </div>
          
          {errors.submit && (
            <div className="error mt-2 text-center">{errors.submit}</div>
          )}
        </form>
      </div>
    </div>
  );
};

export default JobModal;
