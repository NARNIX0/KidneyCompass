import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';


declare global {
  namespace Express {
    interface Request {
      userId?: number;
    }
  }
}

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export const authenticate = (req: Request, res: Response, next: NextFunction) => {
  // Get the authorization header
  const authHeader = req.headers.authorization;
  
  // Check if the header exists and has the right format
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: Missing or invalid token format' });
  }
  
  // Extract the token (remove 'Bearer ' prefix)
  const token = authHeader.split(' ')[1];
  
  try {
    // Verify the token
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: number };
    
    // Attach userId to the request
    req.userId = decoded.userId;
    
    // Continue to the next middleware/route handler
    next();
  } catch (error) {
    // Token is invalid
    return res.status(401).json({ error: 'Unauthorized: Invalid token' });
  }
}; 