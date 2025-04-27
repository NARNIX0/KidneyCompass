import express from 'express';
import { authenticate } from '../middleware/auth';
import prisma from '../db';

const router = express.Router();

// POST /api/results - Save a new result
router.post('/', authenticate, async (req, res) => {
  try {
    const { egfr, stage } = req.body;
    
    // Validate input
    if (!egfr || !stage) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    // Create new result entry
    const result = await prisma.result.create({
      data: {
        userId: req.userId!,
        egfr: parseFloat(egfr),
        stage,
        // These fields are required in my schema but not provided in this endpoint
        // We'll use default values
        age: 0,
        sex: 'unspecified',
        ethnicity: 'unspecified',
        creatinine: 0
      }
    });
    
    return res.status(201).json(result);
  } catch (error) {
    console.error('Error saving result:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/results - Fetch all results for the user
router.get('/', authenticate, async (req, res) => {
  try {
    const results = await prisma.result.findMany({
      where: {
        userId: req.userId
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    return res.json(results);
  } catch (error) {
    console.error('Error fetching results:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/results/:id/note - Add or update a note for a result
router.post('/:id/note', authenticate, async (req, res) => {
  try {
    const resultId = parseInt(req.params.id);
    const { note } = req.body;
    
    // Validate input
    if (note === undefined) {
      return res.status(400).json({ error: 'Note content is required' });
    }
    
    // Find the result and ensure it belongs to the current user
    const result = await prisma.result.findFirst({
      where: {
        id: resultId,
        userId: req.userId
      }
    });
    
    if (!result) {
      return res.status(404).json({ error: 'Result not found' });
    }
    
    // Update the note
    const updatedResult = await prisma.result.update({
      where: {
        id: resultId
      },
      data: {
        notes: note
      }
    });
    
    return res.json(updatedResult);
  } catch (error) {
    console.error('Error updating note:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

export default router; 