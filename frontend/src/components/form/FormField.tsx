import React, { ReactNode } from 'react';

interface FormFieldProps {
  id: string;
  label: string;
  error?: string;
  children: ReactNode;
  className?: string;
  description?: string;
}

const FormField: React.FC<FormFieldProps> = ({
  id,
  label,
  error,
  children,
  className = '',
  description
}) => {
  const descriptionId = description ? `${id}-description` : undefined;
  
  return (
    <div className={`mb-4 ${className}`}>
      <label htmlFor={id} className="block text-gray-700 font-medium mb-2">
        {label}
      </label>
      
      {React.cloneElement(
        React.Children.only(children as React.ReactElement), 
        { 
          id, 
          'aria-describedby': error ? `${id}-error` : descriptionId,
          'aria-invalid': !!error
        }
      )}
      
      {description && (
        <p 
          id={descriptionId} 
          className="mt-1 text-sm text-gray-600"
        >
          {description}
        </p>
      )}
      
      {error && (
        <p 
          id={`${id}-error`} 
          className="mt-1 text-sm text-red-600" 
          role="alert"
        >
          {error}
        </p>
      )}
    </div>
  );
};

export default FormField; 