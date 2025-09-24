import Dexie from 'dexie';

export class TalentFlowDB extends Dexie {
  constructor() {
    super('TalentFlowDB');
    this.version(1).stores({
      jobs: 'id, title, status, order, createdAt',
      candidates: 'id, name, email, stage, jobId, createdAt',
      assessments: 'id, jobId, createdAt',
      assessmentResponses: 'id, assessmentId, candidateId, submittedAt',
      timelineEvents: 'id, candidateId, createdAt'
    });
  }
}

export const db = new TalentFlowDB();