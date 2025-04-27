import express from 'express';
import { authenticate } from '../middleware/auth';
import prisma from '../db';

const router = express.Router();

/**
 * Calculate eGFR using the MDRD formula
 * This is the same calculation used in the main eGFR endpoint
 */
const calculateEgfr = (age: number, sex: string, ethnicity: string, creatinine: number) => {
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
  
  return { egfr: roundedEgfr, stage };
};

/**
 * Save a result to the database
 */
const saveResult = async (userId: number, age: number, sex: string, ethnicity: string, 
                          creatinine: number, egfr: number, stage: string) => {
  return prisma.result.create({
    data: {
      userId,
      age,
      sex,
      ethnicity,
      creatinine,
      egfr,
      stage
    }
  });
};

// POST /api/csv - Process CSV data
router.post('/', authenticate, async (req, res) => {
  try {
    const { rows } = req.body;
    
    // Log incoming request for debugging
    console.log('Received CSV upload request with', rows?.length || 0, 'rows');
    
    // Validate input
    if (!rows || !Array.isArray(rows) || rows.length === 0) {
      console.log('CSV validation failed: Empty or invalid data');
      return res.status(400).json({ error: 'Invalid or empty CSV data' });
    }
    
    const successes: string[] = [];
    const failures: { row: number, reason: string }[] = [];
    
    // Process each row
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      
      try {
        // Extract fields from the row
        const { id, gender, age, ethnicity, creatinine } = row;
        
        console.log(`Processing row ${i+1}:`, { id, gender, age, ethnicity, creatinine });
        
        if (!id || !gender || age === undefined || !ethnicity || !creatinine) {
          console.log(`Row ${i+1} missing required fields`);
          failures.push({ row: i + 1, reason: 'Missing required fields' });
          continue;
        }
        
        // Validate age
        if (isNaN(age) || age < 18 || age > 110) {
          console.log(`Row ${i+1} has invalid age: ${age}`);
          failures.push({ row: i + 1, reason: 'Invalid age (must be between 18-110)' });
          continue;
        }
        
        // Validate sex format
        if (gender !== 'male' && gender !== 'female') {
          console.log(`Row ${i+1} has invalid gender: ${gender}`);
          failures.push({ row: i + 1, reason: 'Gender must be "male" or "female"' });
          continue;
        }
        
        // Validate ethnicity format
        if (ethnicity !== 'white' && ethnicity !== 'black') {
          console.log(`Row ${i+1} has invalid ethnicity: ${ethnicity}`);
          failures.push({ row: i + 1, reason: 'Ethnicity must be "white" or "black"' });
          continue;
        }
        
        // Validate creatinine
        const creatValue = Number(creatinine);
        if (isNaN(creatValue) || creatValue <= 0) {
          console.log(`Row ${i+1} has invalid creatinine: ${creatinine}`);
          failures.push({ row: i + 1, reason: 'Invalid creatinine value (must be a positive number)' });
          continue;
        }
        
        // Calculate eGFR
        const { egfr, stage } = calculateEgfr(age, gender, ethnicity, creatValue);
        console.log(`Row ${i+1} calculated: eGFR=${egfr}, stage=${stage}`);
        
        // Save the result
        await saveResult(req.userId!, age, gender, ethnicity, creatValue, egfr, stage);
        
        // Add to successes
        successes.push(id);
        console.log(`Row ${i+1} processed successfully`);
      } catch (error) {
        console.error(`Error processing row ${i + 1}:`, error);
        failures.push({ row: i + 1, reason: 'Processing error' });
      }
    }
    
    // Log summary
    console.log(`CSV processing complete. Successes: ${successes.length}, Failures: ${failures.length}`);
    
    // Return results
    return res.status(200).json({
      successes,
      failures
    });
  } catch (error) {
    console.error('Error processing CSV:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

export default router; 