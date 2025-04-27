import React, { ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  label: string;
  loading?: boolean;
  loadingText?: string;
  variant?: 'primary' | 'secondary' | 'danger';
  fullWidth?: boolean;
}

const Button: React.FC<ButtonProps> = ({
  label,
  loading = false,
  loadingText = 'Loading...',
  variant = 'primary',
  fullWidth = false,
  className = '',
  disabled,
  ...rest
}) => {
  // Determine the button style based on variant
  let variantClasses = '';
  switch (variant) {
    case 'primary':
      variantClasses = 'bg-compassGreen hover:bg-opacity-90 text-white focus:ring-compassGreen';
      break;
    case 'secondary':
      variantClasses = 'bg-nhsBlue hover:bg-opacity-90 text-white focus:ring-nhsBlue';
      break;
    case 'danger':
      variantClasses = 'bg-red-600 hover:bg-opacity-90 text-white focus:ring-red-600';
      break;
  }

  // Disabled state
  const disabledClasses = (disabled || loading) 
    ? 'bg-gray-400 cursor-not-allowed' 
    : variantClasses;

  // Width classes
  const widthClasses = fullWidth ? 'w-full' : '';

  // Combine all classes
  const buttonClasses = `
    py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-offset-2
    ${disabledClasses} ${widthClasses} ${className}
  `.trim();

  return (
    <button
      className={buttonClasses}
      disabled={disabled || loading}
      aria-disabled={disabled || loading}
      {...rest}
    >
      {loading ? loadingText : label}
    </button>
  );
};

export default Button; 