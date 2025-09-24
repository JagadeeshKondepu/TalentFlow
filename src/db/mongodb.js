import { MongoClient } from 'mongodb';

const uri = process.env.REACT_APP_MONGODB_URI;
const dbName = process.env.REACT_APP_DB_NAME;

let client;
let db;

export const connectToMongoDB = async () => {
  if (!client) {
    client = new MongoClient(uri);
    await client.connect();
    db = client.db(dbName);
  }
  return db;
};

// Collection references
export const getCollections = async () => {
  const database = await connectToMongoDB();
  
  return {
    jobs: database.collection('jobs'),
    candidates: database.collection('candidates'),
    assessments: database.collection('assessments'),
    assessmentSubmissions: database.collection('assessmentSubmissions'),
    timelineEvents: database.collection('timelineEvents')
  };
};

// Initialize collections with indexes
export const initializeCollections = async () => {
  const { jobs, candidates, assessments, assessmentSubmissions, timelineEvents } = await getCollections();
  
  // Create indexes for better performance
  await jobs.createIndex({ title: "text", tags: "text" });
  await jobs.createIndex({ status: 1, department: 1 });
  await jobs.createIndex({ order: 1 });
  
  await candidates.createIndex({ name: "text", email: "text" });
  await candidates.createIndex({ jobId: 1, stage: 1 });
  await candidates.createIndex({ email: 1 }, { unique: true });
  
  await assessments.createIndex({ jobId: 1 });
  
  await assessmentSubmissions.createIndex({ candidateId: 1, jobId: 1 });
  await assessmentSubmissions.createIndex({ status: 1 });
  
  await timelineEvents.createIndex({ candidateId: 1, createdAt: -1 });
  
  console.log('MongoDB collections initialized with indexes');
};

export { client, db };