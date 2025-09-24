import { http, HttpResponse, delay } from 'msw';
import { db } from '../db';
import { seedData } from './seedData';

// Initialize seed data
seedData();

const addDelay = () => delay(Math.random() * 1000 + 200);
const shouldError = () => Math.random() < 0.08;

export const handlers = [
  // Jobs endpoints
  http.get('/api/jobs', async ({ request }) => {
    await addDelay();
    
    const url = new URL(request.url);
    const search = url.searchParams.get('search') || '';
    const status = url.searchParams.get('status') || '';
    const page = parseInt(url.searchParams.get('page') || '1');
    const pageSize = parseInt(url.searchParams.get('pageSize') || '10');
    const sort = url.searchParams.get('sort') || 'order';

    let jobs = await db.jobs.orderBy(sort).toArray();
    
    if (search) {
      jobs = jobs.filter(job => 
        job.title.toLowerCase().includes(search.toLowerCase()) ||
        job.tags.some(tag => tag.toLowerCase().includes(search.toLowerCase()))
      );
    }
    
    if (status) {
      jobs = jobs.filter(job => job.status === status);
    }

    const total = jobs.length;
    const startIndex = (page - 1) * pageSize;
    const paginatedJobs = jobs.slice(startIndex, startIndex + pageSize);

    return HttpResponse.json({
      data: paginatedJobs,
      total,
      page,
      pageSize
    });
  }),

  http.post('/api/jobs', async ({ request }) => {
    await addDelay();
    if (shouldError()) {
      return HttpResponse.json({ error: 'Internal server error' }, { status: 500 });
    }

    const jobData = await request.json();
    const job = {
      id: Date.now().toString(),
      ...jobData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    await db.jobs.add(job);
    return HttpResponse.json(job);
  }),

  http.patch('/api/jobs/:id', async ({ params, request }) => {
    await addDelay();
    if (shouldError()) {
      return HttpResponse.json({ error: 'Internal server error' }, { status: 500 });
    }

    const updates = await request.json();
    await db.jobs.update(params.id, {
      ...updates,
      updatedAt: new Date().toISOString()
    });

    const job = await db.jobs.get(params.id);
    return HttpResponse.json(job);
  }),

  http.patch('/api/jobs/:id/reorder', async ({ params, request }) => {
    await addDelay();
    if (Math.random() < 0.1) {
      // Simulate error for toast notification
      return new HttpResponse(JSON.stringify({ error: 'Failed to reorder jobs. Please try again.' }), { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const { fromOrder, toOrder } = await request.json();
    const jobs = await db.jobs.toArray();
    
    // Reorder logic
    const job = jobs.find(j => j.id === params.id);
    if (job) {
      if (fromOrder < toOrder) {
        await db.jobs.where('order').between(fromOrder + 1, toOrder).modify(j => j.order--);
      } else {
        await db.jobs.where('order').between(toOrder, fromOrder - 1).modify(j => j.order++);
      }
      await db.jobs.update(params.id, { order: toOrder });
    }

    return HttpResponse.json({ success: true });
  }),

  // Candidates endpoints
  http.get('/api/candidates', async ({ request }) => {
    await addDelay();
    
    const url = new URL(request.url);
    const search = url.searchParams.get('search') || '';
    const stage = url.searchParams.get('stage') || '';
    const page = parseInt(url.searchParams.get('page') || '1');
    const pageSize = parseInt(url.searchParams.get('pageSize') || '50');

    let candidates = await db.candidates.orderBy('createdAt').reverse().toArray();
    
    if (search) {
      candidates = candidates.filter(candidate => 
        candidate.name.toLowerCase().includes(search.toLowerCase()) ||
        candidate.email.toLowerCase().includes(search.toLowerCase())
      );
    }
    
    if (stage) {
      candidates = candidates.filter(candidate => candidate.stage === stage);
    }

    const total = candidates.length;
    const startIndex = (page - 1) * pageSize;
    const paginatedCandidates = candidates.slice(startIndex, startIndex + pageSize);

    return HttpResponse.json({
      data: paginatedCandidates,
      total,
      page,
      pageSize
    });
  }),

  http.patch('/api/candidates/:id', async ({ params, request }) => {
    await addDelay();
    if (shouldError()) {
      return HttpResponse.json({ error: 'Internal server error' }, { status: 500 });
    }

    const updates = await request.json();
    const candidate = await db.candidates.get(params.id);
    
    if (!candidate) {
      return HttpResponse.json({ error: 'Candidate not found' }, { status: 404 });
    }
    
    if (updates.stage && updates.stage !== candidate.stage) {
      // Add timeline event
      await db.timelineEvents.add({
        id: Date.now().toString(),
        candidateId: params.id,
        type: 'stage_change',
        fromStage: candidate.stage,
        toStage: updates.stage,
        createdAt: new Date().toISOString()
      });
    }

    await db.candidates.update(params.id, {
      ...updates,
      updatedAt: new Date().toISOString()
    });

    const updatedCandidate = await db.candidates.get(params.id);
    return HttpResponse.json(updatedCandidate);
  }),

  http.get('/api/candidates/:id/timeline', async ({ params }) => {
    await addDelay();
    
    const events = await db.timelineEvents
      .where('candidateId')
      .equals(params.id)
      .orderBy('createdAt')
      .toArray();

    return HttpResponse.json(events);
  }),

  // Assessments endpoints
  http.get('/api/assessments/:jobId', async ({ params }) => {
    await addDelay();
    
    const assessment = await db.assessments.where('jobId').equals(params.jobId).first();
    return HttpResponse.json(assessment || null);
  }),

  http.post('/api/assessments', async ({ request }) => {
    await addDelay();
    if (shouldError()) {
      return HttpResponse.json({ error: 'Internal server error' }, { status: 500 });
    }

    const assessmentData = await request.json();
    const assessment = {
      id: Date.now().toString(),
      ...assessmentData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    await db.assessments.add(assessment);
    return HttpResponse.json(assessment);
  }),

  http.put('/api/assessments/:jobId', async ({ params, request }) => {
    await addDelay();
    if (shouldError()) {
      return HttpResponse.json({ error: 'Internal server error' }, { status: 500 });
    }

    const assessmentData = await request.json();
    const assessment = {
      id: assessmentData.id || Date.now().toString(),
      jobId: params.jobId,
      ...assessmentData,
      updatedAt: new Date().toISOString()
    };

    await db.assessments.put(assessment);
    return HttpResponse.json(assessment);
  }),

  http.post('/api/assessments/:jobId/submit', async ({ params, request }) => {
    await addDelay();
    if (shouldError()) {
      return HttpResponse.json({ error: 'Internal server error' }, { status: 500 });
    }

    const responseData = await request.json();
    const response = {
      id: Date.now().toString(),
      assessmentId: params.jobId,
      ...responseData,
      submittedAt: new Date().toISOString()
    };

    await db.assessmentResponses.add(response);
    return HttpResponse.json(response);
  })
];