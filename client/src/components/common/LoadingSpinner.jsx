import React from 'react';

const LoadingSpinner = ({ size = 'md', text = '' }) => {
  const sizes = {
    sm: 'w-5 h-5',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  return (
    <div className="flex flex-col items-center justify-center gap-3 py-8">
      <div className={`${sizes[size]} border-3 border-primary-200 dark:border-primary-800 border-t-primary-600 rounded-full animate-spin`} />
      {text && <p className="text-sm text-dark-500 dark:text-dark-400">{text}</p>}
    </div>
  );
};

export default LoadingSpinner;
