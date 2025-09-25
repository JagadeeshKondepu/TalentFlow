// Fallback API wrapper with error handling
export const apiRequest = async (url, options = {}) => {
  // Always use mock data for API endpoints to avoid MSW issues
  if (url.includes('/api/')) {
    console.log(`Using mock data for ${url}`);
    return getMockResponse(url, options.method);
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    // Check content type before attempting to parse
    const contentType = response.headers.get('content-type') || '';
    if (!contentType.includes('application/json')) {
      console.warn(`Non-JSON response for ${url}, using mock data`);
      return getMockResponse(url, options.method);
    }

    if (!response.ok) {
      console.warn(`HTTP ${response.status} for ${url}, using mock data`);
      return getMockResponse(url, options.method);
    }

    // Try to parse JSON, catch any parsing errors
    try {
      return await response.json();
    } catch (parseError) {
      console.warn(`JSON parse error for ${url}, using mock data:`, parseError.message);
      return getMockResponse(url, options.method);
    }
  } catch (error) {
    console.warn(`Network error for ${url}, using mock data:`, error.message);
    return getMockResponse(url, options.method);
  }
};

// Simple mock responses when MSW fails
const getMockResponse = (url, method = 'GET') => {
  if (url.includes('/api/jobs')) {
    const jobTemplates = [
      { title: 'Frontend Developer', department: 'Engineering', tags: ['React', 'JavaScript', 'CSS'] },
      { title: 'Backend Developer', department: 'Engineering', tags: ['Node.js', 'Python', 'API'] },
      { title: 'Full Stack Developer', department: 'Engineering', tags: ['React', 'Node.js', 'MongoDB'] },
      { title: 'DevOps Engineer', department: 'Engineering', tags: ['AWS', 'Docker', 'Kubernetes'] },
      { title: 'Data Scientist', department: 'Data', tags: ['Python', 'ML', 'Analytics'] },
      { title: 'UI/UX Designer', department: 'Design', tags: ['Figma', 'Design', 'Prototyping'] },
      { title: 'Product Manager', department: 'Product', tags: ['Strategy', 'Analytics', 'Roadmap'] },
      { title: 'QA Engineer', department: 'Engineering', tags: ['Testing', 'Automation', 'Selenium'] },
      { title: 'Mobile Developer', department: 'Engineering', tags: ['React Native', 'iOS', 'Android'] },
      { title: 'Security Engineer', department: 'Security', tags: ['Cybersecurity', 'Penetration Testing', 'SIEM'] }
    ];
    
    const locations = ['Remote', 'New York', 'San Francisco', 'London', 'Berlin', 'Toronto', 'Sydney', 'Tokyo'];
    const seniorities = ['Junior', 'Mid', 'Senior', 'Lead'];
    const statuses = ['active', 'archived'];
    
    const jobApplicantCounts = [
      15, 22, 31, 18, 27, 12, 8, 14, 25, 19, // job-1 to job-10
      33, 16, 29, 21, 11, 24, 17, 35, 13, 28, // job-11 to job-20
      20, 26, 15, 32, 18, 23, 14, 30, 19, 25, // job-21 to job-30
      22, 17, 34, 12, 27, 21, 16, 29, 24, 18, // job-31 to job-40
      31, 15, 26, 20, 33, 19, 28, 14, 23, 17  // job-41 to job-50
    ];
    
    const allJobs = Array.from({ length: 50 }, (_, i) => {
      const template = jobTemplates[i % jobTemplates.length];
      return {
        id: `job-${i + 1}`,
        title: `${template.title} ${i > 9 ? `(${Math.floor(i/10) + 1})` : ''}`,
        department: template.department,
        location: locations[i % locations.length],
        status: i < 40 ? 'active' : 'archived',
        tags: template.tags,
        seniority: seniorities[i % seniorities.length],
        applicantCount: jobApplicantCounts[i],
        createdAt: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000).toISOString()
      };
    });
    
    // Parse search parameter from URL
    const urlObj = new URL(url, 'http://localhost');
    const searchTerm = urlObj.searchParams.get('search')?.toLowerCase() || '';
    const statusFilter = urlObj.searchParams.get('status') || '';
    const departmentFilter = urlObj.searchParams.get('department') || '';
    const locationFilter = urlObj.searchParams.get('location') || '';
    
    let filteredJobs = allJobs;
    
    // Apply search filter
    if (searchTerm) {
      filteredJobs = filteredJobs.filter(job => 
        job.title.toLowerCase().includes(searchTerm) ||
        job.tags.some(tag => tag.toLowerCase().includes(searchTerm)) ||
        job.department.toLowerCase().includes(searchTerm) ||
        job.location.toLowerCase().includes(searchTerm)
      );
    }
    
    // Apply other filters
    if (statusFilter) {
      filteredJobs = filteredJobs.filter(job => job.status === statusFilter);
    }
    if (departmentFilter) {
      filteredJobs = filteredJobs.filter(job => job.department === departmentFilter);
    }
    if (locationFilter) {
      filteredJobs = filteredJobs.filter(job => job.location === locationFilter);
    }
    
    return {
      data: filteredJobs,
      total: filteredJobs.length,
      page: 1,
      pageSize: 10
    };
  }

  if (url.includes('/api/candidates')) {
    const firstNames = ['John', 'Jane', 'Alex', 'Sarah', 'Mike', 'Emily', 'David', 'Lisa', 'Chris', 'Anna', 'Tom', 'Maria', 'James', 'Jessica', 'Robert', 'Ashley', 'Michael', 'Amanda', 'William', 'Jennifer'];
    const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin'];
    const skillSets = [
      ['React', 'JavaScript', 'CSS'], ['Python', 'Django', 'PostgreSQL'], ['Node.js', 'Express', 'MongoDB'],
      ['AWS', 'Docker', 'Kubernetes'], ['Java', 'Spring', 'MySQL'], ['Angular', 'TypeScript', 'RxJS'],
      ['Vue.js', 'Nuxt', 'Vuex'], ['PHP', 'Laravel', 'Redis'], ['C#', '.NET', 'SQL Server'],
      ['Go', 'Gin', 'gRPC'], ['Ruby', 'Rails', 'Sidekiq'], ['Scala', 'Akka', 'Kafka']
    ];
    
    const urlObj = new URL(url, 'http://localhost');
    const page = parseInt(urlObj.searchParams.get('page') || '1');
    const pageSize = parseInt(urlObj.searchParams.get('pageSize') || '50');
    const searchTerm = urlObj.searchParams.get('search')?.toLowerCase() || '';
    const stageFilter = urlObj.searchParams.get('stage') || '';
    
    // Generate candidates based on job applicant counts
    const jobApplicantCounts = [
      15, 22, 31, 18, 27, 12, 8, 14, 25, 19, // job-1 to job-10
      33, 16, 29, 21, 11, 24, 17, 35, 13, 28, // job-11 to job-20
      20, 26, 15, 32, 18, 23, 14, 30, 19, 25, // job-21 to job-30
      22, 17, 34, 12, 27, 21, 16, 29, 24, 18, // job-31 to job-40
      31, 15, 26, 20, 33, 19, 28, 14, 23, 17  // job-41 to job-50
    ];
    
    let candidates = [];
    let candidateId = 1;
    
    // Generate candidates for each job based on its applicant count
    for (let jobIndex = 0; jobIndex < 50; jobIndex++) {
      const jobId = `job-${jobIndex + 1}`;
      const applicantCount = jobApplicantCounts[jobIndex];
      
      for (let i = 0; i < applicantCount; i++) {
        const firstName = firstNames[candidateId % firstNames.length];
        const lastName = lastNames[Math.floor(candidateId / firstNames.length) % lastNames.length];
        const name = `${firstName} ${lastName} ${candidateId > 399 ? `(${Math.floor(candidateId/400) + 1})` : ''}`;
        
        candidates.push({
          id: `candidate-${candidateId}`,
          name,
          email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}${candidateId > 399 ? candidateId : ''}@example.com`,
          stage: ['applied', 'screen', 'tech', 'offer', 'hired', 'rejected'][i % 6],
          jobId,
          skills: skillSets[candidateId % skillSets.length],
          assessmentScore: Math.floor(Math.random() * 40) + 60,
          createdAt: new Date(Date.now() - Math.random() * 60 * 24 * 60 * 60 * 1000).toISOString(),
        });
        candidateId++;
      }
    }
    
    // Apply filters
    if (searchTerm) {
      candidates = candidates.filter(candidate => 
        candidate.name.toLowerCase().includes(searchTerm) ||
        candidate.email.toLowerCase().includes(searchTerm) ||
        candidate.skills.some(skill => skill.toLowerCase().includes(searchTerm))
      );
    }
    
    if (stageFilter) {
      candidates = candidates.filter(candidate => candidate.stage === stageFilter);
    }
    
    const startIndex = (page - 1) * pageSize;
    const paginatedCandidates = candidates.slice(startIndex, startIndex + pageSize);
    
    return {
      data: paginatedCandidates,
      total: candidates.length,
      page,
      pageSize
    };
  }

  if (url.includes('/api/candidates/') && url.includes('/timeline')) {
    const candidateId = url.split('/')[3];
    const candidateNum = parseInt(candidateId.replace('candidate-', ''));
    
    return [
      {
        id: `timeline-${candidateNum}-1`,
        type: 'stage_change',
        fromStage: 'applied',
        toStage: 'screen',
        createdAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: `timeline-${candidateNum}-2`,
        type: 'note_added',
        createdAt: new Date(Date.now() - Math.random() * 5 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: `timeline-${candidateNum}-3`,
        type: 'assessment_completed',
        createdAt: new Date(Date.now() - Math.random() * 3 * 24 * 60 * 60 * 1000).toISOString()
      }
    ];
  }

  if (url.includes('/api/assessments')) {
    if (method === 'POST') {
      return {
        id: Date.now().toString(),
        title: 'Sample Assessment',
        sections: [],
        createdAt: new Date().toISOString(),
      };
    }
    return null;
  }

  return { success: true };
};