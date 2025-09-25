import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { DndContext, closestCenter } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import JobCard from '../components/JobCard';
import JobModal from '../components/JobModal';
import Pagination from '../components/Pagination';
import { useDebounce } from '../hooks/useDebounce';
import { apiRequest } from '../utils/api';
import { Plus, Search } from 'lucide-react';

const JobsPage = () => {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [department, setDepartment] = useState('');
  const [location, setLocation] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingJob, setEditingJob] = useState(null);
  
  const debouncedSearch = useDebounce(search, 300);
  
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ['jobs', { page, search: debouncedSearch, status, department, location }],
    queryFn: () => {
      const params = new URLSearchParams({
        page: page.toString(),
        pageSize: '10',
        ...(debouncedSearch && { search: debouncedSearch }),
        ...(status && { status }),
        ...(department && { department }),
        ...(location && { location })
      });
      return apiRequest(`/api/jobs?${params}`);
    },
    retry: false,
    refetchOnWindowFocus: false
  });

  const handleSearch = () => {
    setPage(1); // Reset to first page when searching
  };

  const reorderMutation = useMutation({
    mutationFn: async ({ jobId, fromOrder, toOrder }) => {
      return await apiRequest(`/api/jobs/${jobId}/reorder`, {
        method: 'PATCH',
        body: JSON.stringify({ fromOrder, toOrder })
      });
    },
    onError: (error) => {
      queryClient.invalidateQueries(['jobs']);
      console.warn('Failed to reorder jobs:', error.message);
    }
  });

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const jobs = data?.data || [];
    const oldIndex = jobs.findIndex(job => job.id === active.id);
    const newIndex = jobs.findIndex(job => job.id === over.id);
    
    if (oldIndex !== -1 && newIndex !== -1) {
      const fromOrder = jobs[oldIndex].order;
      const toOrder = jobs[newIndex].order;
      
      // Optimistic update
      const newJobs = [...jobs];
      const [movedJob] = newJobs.splice(oldIndex, 1);
      newJobs.splice(newIndex, 0, movedJob);
      
      queryClient.setQueryData(['jobs', { page, search: debouncedSearch, status, department, location }], {
        ...data,
        data: newJobs
      });

      reorderMutation.mutate({ jobId: active.id, fromOrder, toOrder });
    }
  };

  const handleEdit = (job) => {
    setEditingJob(job);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingJob(null);
  };

  if (isLoading) {
    return <div className="loading">Loading jobs...</div>;
  }

  if (error) {
    return <div className="text-center py-8 text-red-600">Error: {error.message}</div>;
  }

  const jobs = data?.data || [];

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="font-semibold text-2xl">Jobs</h1>
        <button 
          className="btn btn-primary flex items-center gap-2"
          onClick={() => setShowModal(true)}
        >
          <Plus size={16} />
          Create Job
        </button>
      </div>

      <div className="filters">
        <div className="search-input flex items-center gap-2">
          <Search size={16} />
          <input
            type="text"
            placeholder="Search jobs by title, tags, department, location..."
            className="input"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="text-gray-400 hover:text-gray-600"
              title="Clear search"
            >
              ×
            </button>
          )}
        </div>
        <select
          className="select"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="archived">Archived</option>
        </select>
        <select
          className="select"
          value={department}
          onChange={(e) => setDepartment(e.target.value)}
        >
          <option value="">All Departments</option>
          <option value="Engineering">Engineering</option>
          <option value="Product">Product</option>
          <option value="Design">Design</option>
          <option value="Marketing">Marketing</option>
          <option value="Sales">Sales</option>
          <option value="HR">HR</option>
        </select>
        <select
          className="select"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
        >
          <option value="">All Locations</option>
          <option value="New York">New York</option>
          <option value="San Francisco">San Francisco</option>
          <option value="London">London</option>
          <option value="Remote">Remote</option>
        </select>
      </div>

      <div className="card">
        {/* <h2 className="font-semibold text-lg mb-4">Grid Container</h2> */}
        <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={jobs.map(job => job.id)} strategy={verticalListSortingStrategy}>
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(2, 1fr)', 
              gap: '1rem',
              width: '100%',
              maxWidth: '100%',
              overflow: 'hidden'
            }}>
              {jobs.map(job => (
                <div key={job.id} style={{ width: '100%', maxWidth: '100%', overflow: 'hidden' }}>
                  <JobCard 
                    job={job} 
                    onEdit={handleEdit}
                  />
                </div>
              ))}
            </div>
          </SortableContext>
        </DndContext>
      </div>

      {data && (
        <Pagination
          currentPage={page}
          totalPages={Math.ceil(data.total / data.pageSize)}
          onPageChange={setPage}
        />
      )}

      {showModal && (
        <JobModal
          job={editingJob}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
};

export default JobsPage;