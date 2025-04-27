import express from 'express';
import { createUser, authenticateUser, getUserById } from '../services/userService';
import jwt from 'jsonwebtoken';
import { authenticate } from '../middleware/auth';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'some-made-up-secret-key'; 

// Registration endpoint
router.post('/register', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    // Validate password length
    if (!password || password.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters long' });
    }

    // Create the user
    const user = await createUser({ email, password });

    // Return success
    return res.status(201).json({
      message: 'User registered successfully',
      user: {
        id: user.id,
        email: user.email
      }
    });
  } catch (error) {
    // Handle duplicate email error
    if (error instanceof Error && error.message === 'User with this email already exists') {
      return res.status(400).json({ error: 'Email is already taken' });
    }
    
    // Handle other errors
    console.error('Registration error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Login endpoint
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Authenticate user
    const user = await authenticateUser(email, password);

    // If authentication failed
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Generate JWT token
    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '24h' });

    // Return token
    return res.json({ token });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Protected test route
router.get('/me', authenticate, async (req, res) => {
  try {
    const user = await getUserById(req.userId!);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    return res.json({ user });
  } catch (error) {
    console.error('Error fetching user:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

export default router; 