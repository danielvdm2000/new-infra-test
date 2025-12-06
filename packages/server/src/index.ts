import express from 'express';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// In-memory counter state
let count = 0;

// GET /api/count - Returns current count
app.get('/api/count', (req, res) => {
  res.json({ count });
});

// POST /api/count/increment - Increments and returns new count
app.post('/api/count/increment', (req, res) => {
  count += 1;
  res.json({ count });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

