import React, { ChangeEvent } from 'react';

interface InputFieldProps {
  id: string;
  label: string;
  type?: 'text' | 'email' | 'password' | 'number';
  value: string | number;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  required?: boolean;
  min?: number;
  max?: number;
  step?: number | 'any';
  className?: string;
  placeholder?: string;
  error?: string;
  ariaLabel?: string;
  ariaInvalid?: boolean;
}

const InputField: React.FC<InputFieldProps> = ({
  id,
  label,
  type = 'text',
  value,
  onChange,
  required = false,
  min,
  max,
  step,
  className = '',
  placeholder = '',
  error,
  ariaLabel,
  ariaInvalid,
}) => {
  const baseClassName = "w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-nhsBlue";
  const errorClassName = error ? "border-red-500" : "";
  const inputClassName = `${baseClassName} ${errorClassName} ${className}`;
  
  return (
    <div className="mb-4">
      <label htmlFor={id} className="block text-gray-700 font-medium mb-2">
        {label}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        onChange={onChange}
        required={required}
        min={min}
        max={max}
        step={step}
        className={inputClassName}
        placeholder={placeholder}
        aria-label={ariaLabel || label}
        aria-required={required}
        aria-invalid={ariaInvalid}
      />
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
};

export default InputField; 