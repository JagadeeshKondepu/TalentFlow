import { apiRequest } from '../utils/api';

export const jobService = {
  // Get all jobs with pagination and filtering
  async getJobs(filters = {}) {
    try {
      const params = new URLSearchParams(filters);
      return await apiRequest(`/api/jobs?${params}`);
    } catch (error) {
      throw new Error(`Failed to fetch jobs: ${error.message}`);
    }
  },

  // Create new job
  async createJob(jobData) {
    try {
      return await apiRequest('/api/jobs', {
        method: 'POST',
        body: JSON.stringify(jobData)
      });
    } catch (error) {
      throw new Error(`Failed to create job: ${error.message}`);
    }
  },

  // Update job
  async updateJob(jobId, updates) {
    try {
      return await apiRequest(`/api/jobs/${jobId}`, {
        method: 'PUT',
        body: JSON.stringify(updates)
      });
    } catch (error) {
      throw new Error(`Failed to update job: ${error.message}`);
    }
  }
};