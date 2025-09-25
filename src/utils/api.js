// Fallback API wrapper with error handling
export const apiRequest = async (url, options = {}) => {
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
        applicantCount: Math.floor(Math.random() * 50) + 5,
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
    
    const totalCandidates = 1250;
    const startIndex = (page - 1) * pageSize;
    
    let candidates = Array.from({ length: totalCandidates }, (_, i) => {
      const firstName = firstNames[i % firstNames.length];
      const lastName = lastNames[Math.floor(i / firstNames.length) % lastNames.length];
      const name = `${firstName} ${lastName} ${i > 399 ? `(${Math.floor(i/400) + 1})` : ''}`;
      
      return {
        id: `candidate-${i + 1}`,
        name,
        email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}${i > 399 ? i : ''}@example.com`,
        stage: ['applied', 'screen', 'tech', 'offer', 'hired', 'rejected'][i % 6],
        jobId: `job-${(i % 50) + 1}`,
        skills: skillSets[i % skillSets.length],
        assessmentScore: Math.floor(Math.random() * 40) + 60,
        createdAt: new Date(Date.now() - Math.random() * 60 * 24 * 60 * 60 * 1000).toISOString(),
      };
    });
    
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
    
    const paginatedCandidates = candidates.slice(startIndex, startIndex + pageSize);
    
    return {
      data: paginatedCandidates,
      total: candidates.length,
      page,
      pageSize
    };
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