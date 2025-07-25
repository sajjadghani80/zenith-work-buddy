import React from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
  className?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'md', 
  text,
  className = '' 
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  };

  return (
    <div className={`flex items-center justify-center space-x-2 ${className}`}>
      <Loader2 
        className={`${sizeClasses[size]} animate-spin`} 
        style={{ color: 'hsl(var(--app-primary))' }}
      />
      {text && (
        <span 
          className="text-sm font-medium"
          style={{ color: 'hsl(var(--app-text-secondary))' }}
        >
          {text}
        </span>
      )}
    </div>
  );
};

export default LoadingSpinner;