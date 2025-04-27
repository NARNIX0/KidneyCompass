import React, { ChangeEvent } from 'react';

interface Option {
  value: string;
  label: string;
}

interface SelectFieldProps {
  id: string;
  label: string;
  value: string;
  onChange: (e: ChangeEvent<HTMLSelectElement>) => void;
  options: Option[];
  required?: boolean;
  className?: string;
  placeholder?: string;
  error?: string;
  ariaLabel?: string;
  ariaInvalid?: boolean;
}

const SelectField: React.FC<SelectFieldProps> = ({
  id,
  label,
  value,
  onChange,
  options,
  required = false,
  className = '',
  placeholder,
  error,
  ariaLabel,
  ariaInvalid,
}) => {
  const baseClassName = "w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-nhsBlue";
  const errorClassName = error ? "border-red-500" : "";
  const selectClassName = `${baseClassName} ${errorClassName} ${className}`;
  
  return (
    <div className="mb-4">
      <label htmlFor={id} className="block text-gray-700 font-medium mb-2">
        {label}
      </label>
      <select
        id={id}
        value={value}
        onChange={onChange}
        required={required}
        className={selectClassName}
        aria-label={ariaLabel || label}
        aria-required={required}
        aria-invalid={ariaInvalid}
      >
        {placeholder && (
          <option value="">{placeholder}</option>
        )}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
};

export default SelectField; 