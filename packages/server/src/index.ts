import express from 'express';
import cors from 'cors';
import { MongoClient, Db, Collection } from 'mongodb';

const app = express();
const PORT = process.env.PORT || 3001;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/counter';

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
    client = new MongoClient(MONGODB_URI);
    await client.connect();
    db = client.db();
    countersCollection = db.collection<CounterDocument>('counters');
    
    // Initialize counter document if it doesn't exist
    await countersCollection.findOneAndUpdate(
      { _id: 'main' },
      { $setOnInsert: { _id: 'main', count: 0 } },
      { upsert: true }
    );
    
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('Failed to connect to MongoDB:', error);
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
    res.json({ count });
  } catch (error) {
    console.error('Error getting count:', error);
    res.status(500).json({ error: 'Failed to get count' });
  }
});

// POST /api/count/increment - Increments and returns new count
app.post('/api/count/increment', async (req, res) => {
  try {
    const count = await incrementCount();
    res.json({ count });
  } catch (error) {
    console.error('Error incrementing count:', error);
    res.status(500).json({ error: 'Failed to increment count' });
  }
});

// Health check endpoint
app.get('/health', async (req, res) => {
  const mongoStatus = db ? 'connected' : 'disconnected';
  res.json({ 
    status: 'ok',
    mongodb: mongoStatus
  });
});

// Start server
async function startServer() {
  try {
    await connectToMongoDB();
    
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, closing MongoDB connection...');
  if (client) {
    await client.close();
  }
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT received, closing MongoDB connection...');
  if (client) {
    await client.close();
  }
  process.exit(0);
});

startServer();

