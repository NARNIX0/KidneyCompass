import React from 'react';

interface ErrorMessageProps {
  message: string | null;
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({ message }) => {
  if (!message) return null;
  
  return (
    <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md" role="alert">
      {message}
    </div>
  );
};

export default ErrorMessage; 