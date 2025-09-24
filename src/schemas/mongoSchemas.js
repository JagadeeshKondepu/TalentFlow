// MongoDB Schema Definitions for TalentFlow

// Jobs Collection Schema
const jobSchema = {
  _id: "ObjectId",
  title: "String", // required
  slug: "String", // unique, auto-generated
  status: "String", // enum: ['active', 'archived']
  department: "String", // Engineering, Product, Design, etc.
  location: "String", // New York, Remote, etc.
  seniority: "String", // Junior, Mid, Senior, Lead, Principal
  tags: ["String"], // Array of skill tags
  order: "Number", // For drag-and-drop ordering
  archiveReason: "String", // Optional, when archived
  applicantCount: "Number", // Count of applicants
  description: "String", // Job description
  requirements: ["String"], // Array of requirements
  createdAt: "Date",
  updatedAt: "Date"
};

// Candidates Collection Schema
const candidateSchema = {
  _id: "ObjectId",
  name: "String", // required
  email: "String", // required, unique
  stage: "String", // enum: ['applied', 'screen', 'tech', 'offer', 'hired', 'rejected']
  jobId: "ObjectId", // Reference to jobs collection
  skills: ["String"], // Array of skills
  assessmentScore: "Number", // Overall assessment score
  rejectionReason: "String", // Optional, when rejected
  resume: "String", // File path or URL
  phone: "String",
  experience: "Number", // Years of experience
  createdAt: "Date",
  updatedAt: "Date"
};

// Assessments Collection Schema
const assessmentSchema = {
  _id: "ObjectId",
  jobId: "ObjectId", // Reference to jobs collection
  title: "String", // Assessment title
  sections: [{
    id: "String",
    title: "String",
    questions: [{
      id: "String",
      type: "String", // enum: ['single-choice', 'multi-choice', 'short-text', 'long-text', 'code']
      title: "String", // Question text
      required: "Boolean",
      options: ["String"], // For choice questions
      validation: {
        min: "Number",
        max: "Number",
        minLength: "Number",
        maxLength: "Number"
      }
    }]
  }],
  createdAt: "Date",
  updatedAt: "Date"
};

// Assessment Submissions Collection Schema
const assessmentSubmissionSchema = {
  _id: "ObjectId",
  candidateId: "ObjectId", // Reference to candidates collection
  jobId: "ObjectId", // Reference to jobs collection
  assessmentId: "ObjectId", // Reference to assessments collection
  responses: "Object", // Key-value pairs of questionId: answer
  scores: {
    aptitude: "Number",
    communication: "Number", 
    subjective: "Number",
    coding: "Number",
    overall: "Number"
  },
  timeSpent: "Number", // Minutes spent on assessment
  submittedAt: "Date",
  status: "String", // enum: ['completed', 'in-progress', 'not-started']
  evaluatedBy: "ObjectId", // Optional, reference to HR user
  evaluatedAt: "Date" // Optional, when evaluation completed
};

// Timeline Events Collection Schema
const timelineEventSchema = {
  _id: "ObjectId",
  candidateId: "ObjectId", // Reference to candidates collection
  type: "String", // enum: ['stage_change', 'note_added', 'assessment_completed', 'interview_scheduled']
  fromStage: "String", // Previous stage
  toStage: "String", // New stage
  note: "String", // Optional note
  createdBy: "ObjectId", // Reference to HR user
  createdAt: "Date"
};

export {
  jobSchema,
  candidateSchema,
  assessmentSchema,
  assessmentSubmissionSchema,
  timelineEventSchema
};