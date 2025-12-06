import express from 'express';
import cors from 'cors';
import { MongoClient, Db, Collection } from 'mongodb';

const app = express();
const PORT = process.env.PORT || 3001;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/counter';

// Request logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path} - ${res.statusCode} - ${duration}ms`);
  });
  next();
});

// Counter document interface
interface CounterDocument {
  _id: string;
  count: number;
}

// MongoDB connection
let client: MongoClient | null = null;
let db: Db | null = null;
let countersCollection: Collection<CounterDocument> | null = null;

// Initialize MongoDB connection
async function connectToMongoDB() {
  try {
    console.log(`[${new Date().toISOString()}] Attempting to connect to MongoDB...`);
    console.log(`[${new Date().toISOString()}] MongoDB URI: ${MONGODB_URI.replace(/\/\/[^:]+:[^@]+@/, '//***:***@')}`); // Hide credentials in logs
    
    client = new MongoClient(MONGODB_URI);
    await client.connect();
    db = client.db();
    const dbName = db.databaseName;
    console.log(`[${new Date().toISOString()}] Connected to MongoDB database: ${dbName}`);
    
    countersCollection = db.collection<CounterDocument>('counters');
    
    // Initialize counter document if it doesn't exist
    await countersCollection.findOneAndUpdate(
      { _id: 'main' },
      { $setOnInsert: { _id: 'main', count: 0 } },
      { upsert: true }
    );
    
    console.log(`[${new Date().toISOString()}] Counter collection initialized`);
    console.log(`[${new Date().toISOString()}] Connected to MongoDB`);
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Failed to connect to MongoDB:`, error);
    if (error instanceof Error) {
      console.error(`[${new Date().toISOString()}] Error message: ${error.message}`);
      console.error(`[${new Date().toISOString()}] Error stack: ${error.stack}`);
    }
    throw error;
  }
}

// Get current count from MongoDB
async function getCount(): Promise<number> {
  if (!countersCollection) {
    throw new Error('MongoDB not connected');
  }
  
  const doc = await countersCollection.findOne({ _id: 'main' });
  return doc?.count ?? 0;
}

// Increment count atomically in MongoDB
async function incrementCount(): Promise<number> {
  if (!countersCollection) {
    throw new Error('MongoDB not connected');
  }
  
  const result = await countersCollection.findOneAndUpdate(
    { _id: 'main' },
    { $inc: { count: 1 } },
    { upsert: true, returnDocument: 'after' }
  );
  
  return result?.count ?? 0;
}

// Middleware
app.use(cors());
app.use(express.json());

// GET /api/count - Returns current count
app.get('/api/count', async (req, res) => {
  try {
    const count = await getCount();
    console.log(`[${new Date().toISOString()}] GET /api/count - returning count: ${count}`);
    res.json({ count });
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Error getting count:`, error);
    if (error instanceof Error) {
      console.error(`[${new Date().toISOString()}] Error details: ${error.message}`);
    }
    res.status(500).json({ error: 'Failed to get count' });
  }
});

// POST /api/count/increment - Increments and returns new count
app.post('/api/count/increment', async (req, res) => {
  try {
    const count = await incrementCount();
    console.log(`[${new Date().toISOString()}] POST /api/count/increment - new count: ${count}`);
    res.json({ count });
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Error incrementing count:`, error);
    if (error instanceof Error) {
      console.error(`[${new Date().toISOString()}] Error details: ${error.message}`);
    }
    res.status(500).json({ error: 'Failed to increment count' });
  }
});

// Health check endpoint
app.get('/health', async (req, res) => {
  try {
    const mongoStatus = db ? 'connected' : 'disconnected';
    let mongoHealthy = false;
    
    // Test MongoDB connection
    if (db) {
      try {
        await db.admin().ping();
        mongoHealthy = true;
      } catch (error) {
        console.error(`[${new Date().toISOString()}] Health check: MongoDB ping failed:`, error);
        mongoHealthy = false;
      }
    }
    
    const healthStatus = mongoHealthy ? 'ok' : 'unhealthy';
    const statusCode = mongoHealthy ? 200 : 503;
    
    console.log(`[${new Date().toISOString()}] Health check: status=${healthStatus}, mongodb=${mongoStatus}, healthy=${mongoHealthy}`);
    
    res.status(statusCode).json({ 
      status: healthStatus,
      mongodb: mongoStatus,
      mongodbHealthy: mongoHealthy,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Health check error:`, error);
    res.status(503).json({ 
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    });
  }
});

// Start server
async function startServer() {
  try {
    console.log(`[${new Date().toISOString()}] Starting server...`);
    console.log(`[${new Date().toISOString()}] Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`[${new Date().toISOString()}] Port: ${PORT}`);
    
    await connectToMongoDB();
    
    app.listen(PORT, () => {
      console.log(`[${new Date().toISOString()}] Server running on port ${PORT}`);
      console.log(`[${new Date().toISOString()}] Health check available at http://localhost:${PORT}/health`);
      console.log(`[${new Date().toISOString()}] API endpoints:`);
      console.log(`[${new Date().toISOString()}]   GET  /api/count`);
      console.log(`[${new Date().toISOString()}]   POST /api/count/increment`);
    });
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Failed to start server:`, error);
    if (error instanceof Error) {
      console.error(`[${new Date().toISOString()}] Error message: ${error.message}`);
      console.error(`[${new Date().toISOString()}] Error stack: ${error.stack}`);
    }
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log(`[${new Date().toISOString()}] SIGTERM received, closing MongoDB connection...`);
  if (client) {
    await client.close();
    console.log(`[${new Date().toISOString()}] MongoDB connection closed`);
  }
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log(`[${new Date().toISOString()}] SIGINT received, closing MongoDB connection...`);
  if (client) {
    await client.close();
    console.log(`[${new Date().toISOString()}] MongoDB connection closed`);
  }
  process.exit(0);
});

startServer();

