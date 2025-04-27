import express from 'express';
import { Request, Response } from 'express';
import cors from 'cors';
import authRoutes from './routes/auth';
import resultsRoutes from './routes/results';
import csvRoutes from './routes/csv';
import { authenticate } from './middleware/auth';
import prisma from './db';
import jwt from 'jsonwebtoken';

// Create Express application
const app = express();
const PORT = process.env.BACKEND_PORT || 8081;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json());

// Routes
app.get('/api/ping', (req: Request, res: Response) => {
  res.json({
    ok: true,
    timestamp: new Date().toISOString()
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/results', resultsRoutes);
app.use('/api/csv', csvRoutes);

// eGFR Calculation Route - now with optional authentication to save results
app.post('/api/egfr', async (req: Request, res: Response) => {
  const { age, sex, ethnicity, creatinine } = req.body;
  // Validate input parameters
  if (!age || !sex || !ethnicity || !creatinine) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  // Validate ranges and values
  if (age < 18 || age > 110) {
    return res.status(400).json({ error: 'Age must be between 18 and 110' });
  }
  if (creatinine <= 0) {
    return res.status(400).json({ error: 'Creatinine must be greater than 0' });
  }
  if (sex !== 'male' && sex !== 'female') {
    return res.status(400).json({ error: 'Sex must be either "male" or "female"' });
  }
  if (ethnicity !== 'white' && ethnicity !== 'black') {
    return res.status(400).json({ error: 'Ethnicity must be either "white" or "black"' });
  }
  // Apply MDRD formula
  let egfr = 186 * Math.pow(creatinine / 88.4, -1.154) * Math.pow(age, -0.203);
  // Apply sex factor
  if (sex === 'female') {
    egfr *= 0.742;
  }
  // Apply ethnicity factor
  if (ethnicity === 'black') {
    egfr *= 1.210;
  }
  // Round to one decimal place
  const roundedEgfr = Math.round(egfr * 10) / 10;
  
  // Map eGFR to CKD stage
  let stage = '';
  if (roundedEgfr >= 90) {
    stage = '1';
  } else if (roundedEgfr >= 60) {
    stage = '2';
  } else if (roundedEgfr >= 45) {
    stage = '3A';
  } else if (roundedEgfr >= 30) {
    stage = '3B';
  } else if (roundedEgfr >= 15) {
    stage = '4';
  } else {
    stage = '5';
  }
  
  // Prepare the response
  const result = {
    egfr: roundedEgfr,
    stage
  };
  
  // Save the result if user is authenticated (optional)
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    try {
      const token = authHeader.split(' ')[1];
      const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
      const decoded = jwt.verify(token, JWT_SECRET) as { userId: number };
      
      // Save the result to the database
      await prisma.result.create({
        data: {
          userId: decoded.userId,
          age,
          sex,
          ethnicity,
          creatinine,
          egfr: roundedEgfr,
          stage
        }
      });
      
      // Add saved: true to the response
      Object.assign(result, { saved: true });
    } catch (error) {
      // If token verification fails, just return the result without saving
      console.error('Error saving result:', error);
    }
  }
  
  // Return response
  res.json(result);
});

// Protected route to get user's eGFR history
app.get('/api/egfr/history', authenticate, async (req: Request, res: Response) => {
  try {
    const results = await prisma.result.findMany({
      where: {
        userId: req.userId
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    res.json({ results });
  } catch (error) {
    console.error('Error fetching history:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
}); 