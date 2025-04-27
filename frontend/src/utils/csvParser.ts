/**
 * CSV Parser Utility
 * 
 * Handles parsing and validation of CSV data for patient records
 */

export interface PatientRow {
  id: string;
  gender: string;
  ethnicity: string;
  age: number;
  creatinine: number;
  [key: string]: any;
}

export interface CsvParseResult {
  validRows: PatientRow[];
  errors: {
    row: number;
    msg: string;
  }[];
}

/**
 * Parse CSV text into structured data
 * Validates required fields and data types
 * 
 * @param text The CSV text content
 * @returns Object containing valid rows and any parsing errors
 */
export const parseCsv = (text: string): CsvParseResult => {
  const result: CsvParseResult = {
    validRows: [],
    errors: []
  };

  // Split by lines and filter out empty lines
  const lines = text.split('\n').filter(line => line.trim().length > 0);
  
  if (lines.length < 2) {
    result.errors.push({ row: 0, msg: 'CSV must contain a header row and at least one data row' });
    return result;
  }

  // Parse headers (first row)
  const headers = lines[0].split(',').map(header => header.trim().toLowerCase());
  
  // Check for expected headers (matching university format)
  const expectedHeaders = {
    patientid: 'id',
    gender: 'gender',
    ethnicity: 'ethnicity',
    age: 'age',
    creatinine: 'creatinine'
  };
  
  // Map the actual headers to our expected field names
  const headerMap = new Map<number, string>();
  for (let i = 0; i < headers.length; i++) {
    const header = headers[i];
    const mappedName = expectedHeaders[header as keyof typeof expectedHeaders];
    if (mappedName) {
      headerMap.set(i, mappedName);
    }
  }
  
  // Validate required headers are present
  const requiredFields = Object.values(expectedHeaders);
  const foundFields = Array.from(headerMap.values());
  const missingFields = requiredFields.filter(field => !foundFields.includes(field));
  
  if (missingFields.length > 0) {
    result.errors.push({ 
      row: 1, 
      msg: `Missing required headers: ${missingFields.join(', ')}` 
    });
    return result;
  }

  // Process data rows
  for (let i = 1; i < lines.length; i++) {
    const rowNum = i + 1; // 1-indexed for user-friendly error messages
    const line = lines[i].trim();
    
    if (!line) continue;
    
    const values = line.split(',').map(val => val.trim());
    
    // Skip if row doesn't have the right number of columns
    if (values.length !== headers.length) {
      result.errors.push({ 
        row: rowNum, 
        msg: `Row has ${values.length} columns, expected ${headers.length}` 
      });
      continue;
    }

    // Build row object from headers and values
    const rowObj: Record<string, any> = {};
    let rowIsValid = true;
    
    // Process each column using the header map
    for (let j = 0; j < values.length; j++) {
      const mappedField = headerMap.get(j);
      if (!mappedField) continue; // Skip unmapped columns
      
      const value = values[j];
      
      // Basic validation and transformation for each field
      if (!value) {
        result.errors.push({ 
          row: rowNum, 
          msg: `Missing value for ${mappedField}` 
        });
        rowIsValid = false;
        break;
      }
      
      // Process based on field type
      switch (mappedField) {
        case 'id':
          rowObj.id = value;
          break;
          
        case 'gender':
          // Convert 0/1 to female/male
          if (value === '0') {
            rowObj.gender = 'female';
          } else if (value === '1') {
            rowObj.gender = 'male';
          } else {
            result.errors.push({ 
              row: rowNum, 
              msg: `Invalid gender value: ${value} (expected 0 or 1)` 
            });
            rowIsValid = false;
          }
          break;
          
        case 'ethnicity':
          // Convert B/O to black/white (assuming O is 'other' and mapped to 'white' for simplicity)
          if (value === 'B') {
            rowObj.ethnicity = 'black';
          } else if (value === 'O') {
            rowObj.ethnicity = 'white'; // Map "Other" to "white" as the system expects only black/white
          } else {
            result.errors.push({ 
              row: rowNum, 
              msg: `Invalid ethnicity value: ${value} (expected B or O)` 
            });
            rowIsValid = false;
          }
          break;
          
        case 'age':
          // Validate age is a number and in valid range
          const age = Number(value);
          if (isNaN(age) || age < 18 || age > 110) {
            result.errors.push({ 
              row: rowNum, 
              msg: `Invalid age value: ${value} (must be number between 18-110)` 
            });
            rowIsValid = false;
          } else {
            rowObj.age = age;
          }
          break;
          
        case 'creatinine':
          // Validate creatinine is a positive number
          const creatValue = Number(value);
          if (isNaN(creatValue) || creatValue < 1) {
            result.errors.push({ 
              row: rowNum, 
              msg: `Invalid creatinine value: ${value} (must be number ≥ 1)` 
            });
            rowIsValid = false;
          } else {
            rowObj.creatinine = creatValue;
          }
          break;
      }
      
      if (!rowIsValid) break;
    }

    if (rowIsValid) {
      result.validRows.push(rowObj as PatientRow);
    }
  }

  return result;
}; 