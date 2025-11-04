import React from 'react';
import { cn } from '../../lib/utils';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  hideLabel?: boolean;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, name, className = '', hideLabel = false, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label 
            htmlFor={name} 
            className={cn(
              "block text-sm font-medium text-muted-foreground mb-2",
              hideLabel && "sr-only"
            )}
          >
            {label}
          </label>
        )}
        <input
          id={name}
          name={name}
          ref={ref}
          className={cn(
            "flex h-10 w-full rounded-md border border-input bg-background/50 px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-50 transition-all",
            className
          )}
          {...props}
        />
      </div>
    );
  }
);
Input.displayName = "Input";

export default Input;
