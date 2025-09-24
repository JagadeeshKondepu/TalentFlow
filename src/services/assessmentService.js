import { apiRequest } from '../utils/api';

export const assessmentService = {
  // Create assessment for a domain/job
  async createAssessment(assessmentData) {
    try {
      return await apiRequest('/api/assessments', {
        method: 'POST',
        body: JSON.stringify(assessmentData)
      });
    } catch (error) {
      throw new Error(`Failed to create assessment: ${error.message}`);
    }
  },

  // Get assessment by job/domain
  async getAssessmentByJob(jobId) {
    try {
      return await apiRequest(`/api/assessments/${jobId}`);
    } catch (error) {
      throw new Error(`Failed to fetch assessment: ${error.message}`);
    }
  },

  // Update assessment
  async updateAssessment(assessmentId, updates) {
    try {
      return await apiRequest(`/api/assessments/${assessmentId}`, {
        method: 'PUT',
        body: JSON.stringify(updates)
      });
    } catch (error) {
      throw new Error(`Failed to update assessment: ${error.message}`);
    }
  }
};