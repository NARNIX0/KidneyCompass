import React from 'react';

interface ResultsCardProps {
  egfr: number;
  stage: string;
  showSaveStatus?: boolean;
  isSaved?: boolean;
  isAuthenticated?: boolean;
}

const ResultsCard: React.FC<ResultsCardProps> = ({ 
  egfr, 
  stage, 
  showSaveStatus = false,
  isSaved = false,
  isAuthenticated = false
}) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold text-nhsBlue mb-4">Results</h2>
      <div className="grid grid-cols-2 gap-4 text-center">
        <div className="p-3 bg-gray-50 rounded-md">
          <p className="text-gray-600 text-sm mb-1">eGFR Value</p>
          <p className="text-3xl font-bold text-nhsBlue">{egfr}</p>
          <p className="text-gray-600 text-sm">mL/min/1.73m²</p>
        </div>
        <div className="p-3 bg-gray-50 rounded-md">
          <p className="text-gray-600 text-sm mb-1">CKD Stage</p>
          <p className="text-3xl font-bold text-compassGreen">{stage}</p>
        </div>
      </div>
      
      {showSaveStatus && isAuthenticated && (
        <div className="mt-4 text-center">
          {isSaved ? (
            <div className="text-sm text-green-600">
              This result has been saved to your history.{' '}
              <a href="/history" className="underline">View all results</a>
            </div>
          ) : (
            <div className="text-sm text-gray-500">
              This result will be saved to your history.
            </div>
          )}
        </div>
      )}
      
      {showSaveStatus && !isAuthenticated && (
        <div className="mt-4 text-center text-sm text-gray-500">
          <a href="/login" className="text-nhsBlue underline">Log in</a> to save your results and view your history.
        </div>
      )}
    </div>
  );
};

export default ResultsCard; 