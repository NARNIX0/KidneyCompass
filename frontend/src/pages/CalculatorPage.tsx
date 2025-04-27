import React, { useState, FormEvent, useEffect, ChangeEvent } from 'react';
import { useAuth } from '../context/AuthContext';
import { fetchApi } from '../utils/api';
import { uploadCsv } from '../lib/api';
import { parseCsv } from '../utils/csvParser';
import ResultsCard from '../components/ResultsCard';

const CalculatorPage = () => {
  // State hooks for form inputs
  const [age, setAge] = useState<number | ''>('');
  const [sex, setSex] = useState<string>('');
  const [ethnicity, setEthnicity] = useState<string>('');
  const [creatinine, setCreatinine] = useState<number | ''>('');
  
  // State hooks for results
  const [egfr, setEgfr] = useState<number | null>(null);
  const [stage, setStage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [formIsValid, setFormIsValid] = useState<boolean>(false);
  
  // CSV upload states
  const [csvResults, setCsvResults] = useState<{ 
    successes: string[], 
    failures: { row: number, reason: string }[] 
  } | null>(null);
  
  // CSV parsing errors
  const [csvParseErrors, setCsvParseErrors] = useState<{
    row: number;
    msg: string;
  }[]>([]);
  
  // Add state to track if result is saved
  const [resultSaved, setResultSaved] = useState(false);
  
  const { isAuthenticated } = useAuth();

  // Validate form whenever inputs change
  useEffect(() => {
    const isValid = 
      age !== '' && 
      Number(age) >= 18 && 
      Number(age) <= 110 && 
      sex !== '' && 
      ethnicity !== '' && 
      creatinine !== '' && 
      Number(creatinine) >= 1;
    
    setFormIsValid(isValid);
  }, [age, sex, ethnicity, creatinine]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    // Validate inputs
    if (!formIsValid) {
      setError('All fields are required and must be within valid ranges');
      return;
    }
    
    setLoading(true);
    setError(null);
    setResultSaved(false);
    
    try {
      // Use fetchApi instead of direct fetch
      const data = await fetchApi('/egfr', {
        method: 'POST',
        body: JSON.stringify({ age, sex, ethnicity, creatinine })
      });
      
      console.log('API Success - Response:', data);
      setEgfr(data.egfr);
      setStage(data.stage);
      
      // Save result to server if authenticated
      if (isAuthenticated) {
        await saveResult(data.egfr, data.stage);
      }
    } catch (err) {
      console.error('API Error:', err);
      if (err instanceof Error) {
        if (err.message.includes('Failed to fetch') || err.name === 'TypeError') {
          setError('Connection error: Backend server may be down. Check console for details.');
        } else {
          setError(err.message);
        }
      } else {
        setError('An unknown error occurred');
      }
      setEgfr(null);
      setStage(null);
    } finally {
      setLoading(false);
    }
  };
  
  // Function to save the result
  const saveResult = async (egfrValue: number, stageValue: string) => {
    try {
      await fetchApi('/results', {
        method: 'POST',
        body: JSON.stringify({
          egfr: egfrValue,
          stage: stageValue
        })
      });
      
      setResultSaved(true);
    } catch (error) {
      console.error('Error saving result:', error);
      // Doesnt show this error to the user, just logs it
      // Main calculation was successful
    }
  };

  // Handle CSV file upload
  const handleCsvUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    // Reset states
    setError(null);
    setCsvResults(null);
    setCsvParseErrors([]);
    
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Check if user is authenticated
    if (!isAuthenticated) {
      setError("You must be logged in to upload CSV files");
      return;
    }
    
    setLoading(true);
    
    try {
      // Read file as text
      const text = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target?.result as string);
        reader.onerror = (e) => reject(new Error('Failed to read file'));
        reader.readAsText(file);
      });
      
      // Parse CSV content
      const parseResult = parseCsv(text);
      
      // Store parsing errors
      if (parseResult.errors.length > 0) {
        setCsvParseErrors(parseResult.errors);
        // Instead of returning early, just report the errors
        setError(`CSV has ${parseResult.errors.length} formatting error(s)`);
        
        // Continue only if there are valid rows despite the errors
        if (parseResult.validRows.length === 0) {
          setLoading(false);
          return;
        }
      }
      
      // No valid rows to process
      if (parseResult.validRows.length === 0) {
        setError('No valid data rows found in the CSV');
        setLoading(false);
        return;
      }
      
      console.log('Valid rows to process:', parseResult.validRows.length);
      console.log('Sample row:', parseResult.validRows[0]);
      
      // Upload valid rows to server
      const result = await uploadCsv(parseResult.validRows);
      setCsvResults(result);
      
      // Show success/failure message
      if (result.failures.length === 0) {
        if (parseResult.errors.length > 0) {
          setError(`Processed ${result.successes.length} valid rows. ${parseResult.errors.length} row(s) were skipped due to formatting errors.`);
        } else {
          setError(null);
        }
      } else {
        setError(`Processed ${result.successes.length} rows. ${result.failures.length} failed processing. ${parseResult.errors.length} row(s) were skipped due to formatting errors.`);
      }
    } catch (err) {
      console.error('CSV Upload Error:', err);
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unknown error occurred during CSV processing');
      }
    } finally {
      setLoading(false);
      // Reset the file input
      e.target.value = '';
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-md mx-auto">
        <h1 className="text-2xl font-bold text-nhsBlue mb-6">eGFR Calculator</h1>
        
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md mb-6">
          <div className="mb-4">
            <label htmlFor="age" className="block text-gray-700 font-medium mb-2">
              Age (18-110)
            </label>
            <input
              type="number"
              id="age"
              min="18"
              max="110"
              required
              aria-label="Age in years"
              aria-required="true"
              aria-invalid={age !== '' && (Number(age) < 18 || Number(age) > 110)}
              value={age}
              onChange={(e) => setAge(e.target.value ? Number(e.target.value) : '')}
              className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-nhsBlue"
            />
          </div>
          
          <div className="mb-4">
            <label htmlFor="sex" className="block text-gray-700 font-medium mb-2">
              Sex
            </label>
            <select
              id="sex"
              required
              aria-label="Biological sex"
              aria-required="true"
              aria-invalid={sex === ''}
              value={sex}
              onChange={(e) => setSex(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-nhsBlue"
            >
              <option value="">Select...</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
          </div>
          
          <div className="mb-4">
            <label htmlFor="ethnicity" className="block text-gray-700 font-medium mb-2">
              Ethnicity
            </label>
            <select
              id="ethnicity"
              required
              aria-label="Ethnicity"
              aria-required="true"
              aria-invalid={ethnicity === ''}
              value={ethnicity}
              onChange={(e) => setEthnicity(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-nhsBlue"
            >
              <option value="">Select...</option>
              <option value="white">White</option>
              <option value="black">Black</option>
            </select>
          </div>
          
          <div className="mb-6">
            <label htmlFor="creatinine" className="block text-gray-700 font-medium mb-2">
              Serum Creatinine (μmol/L)
            </label>
            <input
              type="number"
              id="creatinine"
              min="1"
              step="0.1"
              required
              aria-label="Serum Creatinine value in micromoles per liter"
              aria-required="true"
              aria-invalid={creatinine !== '' && Number(creatinine) < 1}
              value={creatinine}
              onChange={(e) => setCreatinine(e.target.value ? Number(e.target.value) : '')}
              className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-nhsBlue"
            />
          </div>
          
          {/* CSV Upload Section */}
          <div className="mb-6 pt-4 border-t border-gray-200">
            <label htmlFor="csv-upload" className="block text-gray-700 font-medium mb-2">
              Upload CSV of Patient Data
            </label>
            <input
              id="csv-upload"
              type="file"
              accept=".csv"
              onChange={handleCsvUpload}
              disabled={loading}
              aria-label="Upload CSV file with patient data"
              aria-describedby="csv-help"
              className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-nhsBlue"
            />
            <p id="csv-help" className="mt-1 text-sm text-gray-600">
              CSV must include headers: PatientID, Gender (0=female, 1=male), Ethnicity (B=black, O=other), Age, Creatinine
            </p>
          </div>
          
          {/* CSV Results Summary */}
          {csvResults && (
            <div className="mb-6" role="alert" aria-live="polite">
              <div className="p-3 bg-blue-50 border border-blue-200 rounded mb-2">
                <h3 className="font-medium text-blue-800 mb-1">CSV Import Results</h3>
                <p className="text-blue-700">
                  Successfully processed {csvResults.successes.length} record{csvResults.successes.length !== 1 ? 's' : ''}
                </p>
                {csvParseErrors.length > 0 && (
                  <p className="text-blue-700 mt-1">
                    {csvParseErrors.length} row{csvParseErrors.length !== 1 ? 's' : ''} skipped due to formatting errors
                  </p>
                )}
              </div>
              
              {/* Show Processing Failures */}
              {csvResults.failures.length > 0 && (
                <div className="p-3 bg-red-50 border border-red-200 rounded">
                  <h3 className="font-medium text-red-800 mb-1">Processing Errors</h3>
                  <ul className="list-disc pl-5 text-red-700 text-sm">
                    {csvResults.failures.map((failure, index) => (
                      <li key={index}>
                        Row {failure.row}: {failure.reason}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
          
          {/* CSV Parse Errors */}
          {csvParseErrors.length > 0 && (
            <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded" role="alert">
              <h3 className="font-medium text-red-800 mb-1">CSV Format Errors (Skipped Rows)</h3>
              <ul className="list-disc pl-5 text-red-700 text-sm">
                {csvParseErrors.map((error, index) => (
                  <li key={index}>
                    Row {error.row}: {error.msg}
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          {error && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md" role="alert">
              {error}
            </div>
          )}
          
          <button
            type="submit"
            disabled={loading || !formIsValid}
            aria-disabled={loading || !formIsValid}
            className={`w-full py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-offset-2 ${
              loading || !formIsValid
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-compassGreen hover:bg-opacity-90 text-white focus:ring-compassGreen'
            }`}
          >
            {loading ? 'Processing...' : 'Calculate eGFR'}
          </button>
        </form>
        
        {(egfr !== null && stage !== null) && (
          <ResultsCard
            egfr={egfr}
            stage={stage}
            showSaveStatus={true}
            isSaved={resultSaved}
            isAuthenticated={isAuthenticated}
          />
        )}
      </div>
    </div>
  );
};

export default CalculatorPage; 