import React, { useEffect, useState } from 'react';
import { fetchApi } from '../utils/api';
import { Link } from 'react-router-dom';
import ResultCardWithNotes from '../components/ResultCardWithNotes';

interface Result {
  id: number;
  egfr: number;
  stage: string;
  notes?: string;
  createdAt: string;
}

const HistoryPage = () => {
  const [results, setResults] = useState<Result[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Fetch history when component mounts
    const fetchHistory = async () => {
      try {
        setLoading(true);
        const data = await fetchApi('/results');
        setResults(data);
      } catch (err) {
        console.error('Error fetching history:', err);
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError('Failed to fetch your eGFR history');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

  // Format date as "Jan 1, 2025 at 12:00 PM"
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  // Simple sparkline to visualize trend
  const renderSparkline = () => {
    if (results.length < 2) return null;

    // Get last 10 eGFR values (or fewer if we don't have 10)
    const egfrValues = results
      .slice(0, 10)
      .map(result => result.egfr)
      .reverse(); // Show oldest to newest

    // Find min and max for scaling
    const min = Math.min(...egfrValues);
    const max = Math.max(...egfrValues);
    const range = max - min || 1; // Avoid division by zero

    // Scale to height (50px)
    const height = 50;
    const width = egfrValues.length * 20; // 20px per data point
    
    // Calculate points for the sparkline
    const points = egfrValues
      .map((value, index) => {
        const x = index * 20;
        const y = height - ((value - min) / range * height);
        return `${x},${y}`;
      })
      .join(' ');

    return (
      <div className="mt-6 mb-6">
        <h3 className="text-lg font-medium text-gray-700 mb-2">eGFR Trend</h3>
        <svg width={width} height={height} className="bg-white border border-gray-200 rounded">
          <polyline
            points={points}
            fill="none"
            stroke="#1e88e5"
            strokeWidth="2"
          />
          {egfrValues.map((value, index) => (
            <circle
              key={index}
              cx={index * 20}
              cy={height - ((value - min) / range * height)}
              r="3"
              fill="#1e88e5"
            />
          ))}
        </svg>
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>Oldest</span>
          <span>Newest</span>
        </div>
      </div>
    );
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-nhsBlue mb-6">Your eGFR History</h1>
      
      {loading ? (
        <div className="text-center py-8">
          <p>Loading your history...</p>
        </div>
      ) : error ? (
        <div className="bg-red-100 text-red-700 p-4 rounded-md">
          <p>{error}</p>
        </div>
      ) : results.length === 0 ? (
        <div className="bg-gray-100 p-6 rounded-md text-center">
          <p className="text-gray-600">You haven't made any eGFR calculations yet.</p>
          <p className="mt-2">
            <Link to="/calculator" className="text-nhsBlue hover:underline">
              Try the calculator
            </Link>
          </p>
        </div>
      ) : (
        <div>
          {/* Sparkline to show trend */}
          {renderSparkline()}

          {/* Results list */}
          <div className="space-y-6">
            {results.map((result) => (
              <div key={result.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                <ResultCardWithNotes 
                  id={result.id}
                  egfr={result.egfr} 
                  stage={result.stage}
                  notes={result.notes}
                  createdAt={result.createdAt}
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default HistoryPage; 