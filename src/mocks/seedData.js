import { db } from '../db';

const jobTitles = [
  'Frontend Developer', 'Backend Developer', 'Full Stack Developer', 'DevOps Engineer',
  'Data Scientist', 'Product Manager', 'UX Designer', 'QA Engineer', 'Mobile Developer',
  'Security Engineer', 'Cloud Architect', 'Machine Learning Engineer', 'Technical Writer',
  'Scrum Master', 'Business Analyst', 'Database Administrator', 'Site Reliability Engineer',
  'AI Engineer', 'Blockchain Developer', 'Game Developer', 'Embedded Systems Engineer',
  'Network Engineer', 'Systems Administrator', 'Technical Lead', 'Engineering Manager'
];

const departments = ['Engineering', 'Product', 'Design', 'Marketing', 'Sales', 'HR', 'Finance'];
const locations = ['New York', 'San Francisco', 'London', 'Berlin', 'Remote', 'Toronto'];
const seniorities = ['Junior', 'Mid', 'Senior', 'Lead', 'Principal'];
const archiveReasons = ['Position Filled', 'Budget Cut', 'Role Canceled', 'Requirements Changed'];

const tags = [
  'React', 'Node.js', 'Python', 'Java', 'AWS', 'Docker', 'Kubernetes', 'MongoDB',
  'PostgreSQL', 'TypeScript', 'GraphQL', 'Redis', 'Elasticsearch', 'Microservices',
  'Machine Learning', 'AI', 'Blockchain', 'Mobile', 'iOS', 'Android', 'Flutter',
  'Vue.js', 'Angular', 'Spring Boot', 'Django', 'Flask', 'Express.js', 'Next.js'
];

const firstNames = [
  'John', 'Jane', 'Michael', 'Sarah', 'David', 'Emily', 'Robert', 'Jessica',
  'William', 'Ashley', 'James', 'Amanda', 'Christopher', 'Stephanie', 'Daniel',
  'Melissa', 'Matthew', 'Nicole', 'Anthony', 'Elizabeth', 'Mark', 'Helen',
  'Donald', 'Deborah', 'Steven', 'Rachel', 'Paul', 'Carolyn', 'Andrew', 'Janet'
];

const lastNames = [
  'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis',
  'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson',
  'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin', 'Lee', 'Perez', 'Thompson',
  'White', 'Harris', 'Sanchez', 'Clark', 'Ramirez', 'Lewis', 'Robinson'
];

const stages = ['applied', 'screen', 'tech', 'offer', 'hired', 'rejected'];

function getRandomElement(array) {
  return array[Math.floor(Math.random() * array.length)];
}

function getRandomElements(array, count) {
  const shuffled = [...array].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

export async function seedData() {
  try {
    // Check if data already exists
    const existingJobs = await db.jobs.count();
    if (existingJobs > 0) {
      // Still create assessment submissions
      createAssessmentSubmissions();
      return;
    }

  // Seed Jobs
  const jobs = [];
  for (let i = 0; i < 25; i++) {
    const title = getRandomElement(jobTitles);
    const status = Math.random() > 0.3 ? 'active' : 'archived';
    const job = {
      id: `job-${i + 1}`,
      title,
      slug: title.toLowerCase().replace(/\s+/g, '-'),
      status,
      department: getRandomElement(departments),
      location: getRandomElement(locations),
      seniority: getRandomElement(seniorities),
      tags: getRandomElements(tags, Math.floor(Math.random() * 5) + 2),
      order: i + 1,
      archiveReason: status === 'archived' ? getRandomElement(archiveReasons) : null,
      applicantCount: Math.floor(Math.random() * 50) + 5,
      createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date().toISOString()
    };
    jobs.push(job);
  }
    await db.jobs.bulkAdd(jobs);

    // Seed Candidates
  const candidates = [];
  const activeJobs = jobs.filter(job => job.status === 'active');
  
  for (let i = 0; i < 1000; i++) {
    const firstName = getRandomElement(firstNames);
    const lastName = getRandomElement(lastNames);
    const candidate = {
      id: `candidate-${i + 1}`,
      name: `${firstName} ${lastName}`,
      email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@email.com`,
      stage: getRandomElement(stages),
      jobId: getRandomElement(activeJobs).id,
      skills: getRandomElements(['JavaScript', 'Python', 'React', 'Node.js', 'SQL', 'AWS'], Math.floor(Math.random() * 4) + 2),
      assessmentScore: Math.floor(Math.random() * 40) + 60,
      rejectionReason: null,
      createdAt: new Date(Date.now() - Math.random() * 60 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date().toISOString()
    };
    candidates.push(candidate);
  }
    await db.candidates.bulkAdd(candidates);

    // Seed Assessments
  const assessments = [];
  const sampleAssessments = [
    {
      title: 'Technical Skills Assessment',
      sections: [
        {
          id: 'section-1',
          title: 'Programming Knowledge',
          questions: [
            {
              id: 'q1',
              type: 'single-choice',
              title: 'Which programming language do you prefer?',
              required: true,
              options: ['JavaScript', 'Python', 'Java', 'C++', 'Other']
            },
            {
              id: 'q2',
              type: 'multi-choice',
              title: 'Which frameworks have you worked with?',
              required: false,
              options: ['React', 'Vue.js', 'Angular', 'Express.js', 'Django', 'Spring Boot']
            },
            {
              id: 'q3',
              type: 'short-text',
              title: 'Years of experience',
              required: true,
              validation: { min: 0, max: 50 }
            }
          ]
        }
      ]
    },
    {
      title: 'Behavioral Assessment',
      sections: [
        {
          id: 'section-1',
          title: 'Work Style',
          questions: [
            {
              id: 'q1',
              type: 'single-choice',
              title: 'Do you prefer working in teams?',
              required: true,
              options: ['Yes', 'No', 'Sometimes']
            },
            {
              id: 'q2',
              type: 'long-text',
              title: 'Describe a challenging project you worked on',
              required: true,
              validation: { minLength: 50, maxLength: 500 }
            }
          ]
        }
      ]
    }
  ];

  for (let i = 0; i < 3; i++) {
    const job = activeJobs[i];
    if (job) {
      const assessment = {
        id: `assessment-${i + 1}`,
        jobId: job.id,
        ...sampleAssessments[i % sampleAssessments.length],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      assessments.push(assessment);
    }
  }
    await db.assessments.bulkAdd(assessments);

    // Seed Timeline Events
  const timelineEvents = [];
  for (let i = 0; i < 100; i++) {
    const candidate = getRandomElement(candidates);
    const event = {
      id: `event-${i + 1}`,
      candidateId: candidate.id,
      type: 'stage_change',
      fromStage: 'applied',
      toStage: candidate.stage,
      createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString()
    };
    timelineEvents.push(event);
  }
    await db.timelineEvents.bulkAdd(timelineEvents);

    // Keep existing submissions and merge with new ones
  const existing = JSON.parse(localStorage.getItem('assessmentSubmissions') || '[]');
  
  // Seed Assessment Submissions for ALL candidates
  const assessmentSubmissions = [];
  candidates.forEach((candidate, i) => {
    const job = jobs.find(j => j.id === candidate.jobId);
    if (job) {
      // Domain-specific scoring based on job department
      let baseScores = { aptitude: 70, communication: 75, subjective: 70, coding: 65 };
      
      if (job.department === 'Engineering') {
        baseScores = { aptitude: 80, communication: 70, subjective: 75, coding: 85 };
      } else if (job.department === 'Design') {
        baseScores = { aptitude: 75, communication: 85, subjective: 80, coding: 60 };
      } else if (job.department === 'Product') {
        baseScores = { aptitude: 85, communication: 80, subjective: 85, coding: 70 };
      } else if (job.department === 'Marketing') {
        baseScores = { aptitude: 70, communication: 90, subjective: 85, coding: 50 };
      }
      
      const submission = {
        id: `submission-${i + 1}`,
        candidateId: candidate.id,
        jobId: job.id,
        responses: {
          apt1: getRandomElement(['36', '32', '40', '38']),
          apt2: getRandomElement(['50 km/h', '60 km/h', '70 km/h', '80 km/h']),
          comm1: `I prefer a collaborative ${job.department ? job.department.toLowerCase() : 'professional'} environment with clear communication and growth opportunities.`,
          subj1: `In my previous ${job.department ? job.department.toLowerCase() : 'professional'} role, I faced challenging projects and delivered successful solutions using domain expertise.`,
          code1: job.department === 'Engineering' ? 'function reverseString(str) { return str.split("").reverse().join(""); }' : 'Basic problem-solving approach implemented.',
          feed1: `The ${job.department || 'role'} assessment was comprehensive and relevant to the role requirements.`
        },
        scores: {
          aptitude: Math.max(30, Math.min(100, baseScores.aptitude + Math.floor(Math.random() * 30) - 15)),
          communication: Math.max(30, Math.min(100, baseScores.communication + Math.floor(Math.random() * 30) - 15)),
          subjective: Math.max(30, Math.min(100, baseScores.subjective + Math.floor(Math.random() * 30) - 15)),
          coding: Math.max(30, Math.min(100, baseScores.coding + Math.floor(Math.random() * 30) - 15)),
          overall: 0
        },
        timeSpent: Math.floor(Math.random() * 20) + 40,
        submittedAt: new Date(Date.now() - Math.random() * 15 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'completed'
      };
      
      // Calculate overall score
      submission.scores.overall = Math.round(
        (submission.scores.aptitude + submission.scores.communication + 
         submission.scores.subjective + submission.scores.coding) / 4
      );
      
      assessmentSubmissions.push(submission);
    }
  });
  
  // Merge with existing submissions
  const allSubmissions = [...existing, ...assessmentSubmissions.filter(sub => 
    !existing.some(ex => ex.candidateId === sub.candidateId)
  )];
  localStorage.setItem('assessmentSubmissions', JSON.stringify(allSubmissions));
  
  // Force immediate save
  window.assessmentSubmissions = allSubmissions;
  
    console.log(`✅ Total assessment submissions: ${allSubmissions.length} (${assessmentSubmissions.length} new, ${existing.length} existing)`);
    console.log('Sample submissions:', allSubmissions.slice(0, 3).map(s => ({ candidateId: s.candidateId, status: s.status })));
  } catch (error) {
    console.error('Failed to seed data:', error);
  }
}

function createAssessmentSubmissions() {
  // Get existing data from IndexedDB
  db.candidates.toArray().then(candidates => {
    db.jobs.toArray().then(jobs => {
      const assessmentSubmissions = [];
      candidates.forEach((candidate, i) => {
        const job = jobs.find(j => j.id === candidate.jobId);
        if (job) {
          let baseScores = { aptitude: 70, communication: 75, subjective: 70, coding: 65 };
          
          if (job.department === 'Engineering') {
            baseScores = { aptitude: 80, communication: 70, subjective: 75, coding: 85 };
          } else if (job.department === 'Design') {
            baseScores = { aptitude: 75, communication: 85, subjective: 80, coding: 60 };
          } else if (job.department === 'Product') {
            baseScores = { aptitude: 85, communication: 80, subjective: 85, coding: 70 };
          } else if (job.department === 'Marketing') {
            baseScores = { aptitude: 70, communication: 90, subjective: 85, coding: 50 };
          }
          
          const submission = {
            id: `submission-${i + 1}`,
            candidateId: candidate.id,
            jobId: job.id,
            responses: {
              comm1: `I prefer a collaborative ${job.department ? job.department.toLowerCase() : 'professional'} environment with clear communication and growth opportunities.`,
              feed1: `The ${job.department || 'role'} assessment was comprehensive and relevant to the role requirements.`
            },
            scores: {
              aptitude: Math.max(30, Math.min(100, baseScores.aptitude + Math.floor(Math.random() * 30) - 15)),
              communication: Math.max(30, Math.min(100, baseScores.communication + Math.floor(Math.random() * 30) - 15)),
              subjective: Math.max(30, Math.min(100, baseScores.subjective + Math.floor(Math.random() * 30) - 15)),
              coding: Math.max(30, Math.min(100, baseScores.coding + Math.floor(Math.random() * 30) - 15)),
              overall: 0
            },
            timeSpent: Math.floor(Math.random() * 20) + 40,
            submittedAt: new Date(Date.now() - Math.random() * 15 * 24 * 60 * 60 * 1000).toISOString(),
            status: 'completed'
          };
          
          submission.scores.overall = Math.round(
            (submission.scores.aptitude + submission.scores.communication + 
             submission.scores.subjective + submission.scores.coding) / 4
          );
          
          assessmentSubmissions.push(submission);
        }
      });
      
      try {
        localStorage.setItem('assessmentSubmissions', JSON.stringify(assessmentSubmissions));
        window.assessmentSubmissions = assessmentSubmissions;
        console.log(`Created ${assessmentSubmissions.length} assessment submissions`);
      } catch (error) {
        console.error('Failed to save assessment submissions:', error);
      }
    }).catch(error => {
      console.error('Failed to fetch jobs for assessment submissions:', error);
    });
  }).catch(error => {
    console.error('Failed to fetch candidates for assessment submissions:', error);
  });
}