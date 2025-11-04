import React from 'react';
import { cn } from '../../lib/utils';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  hideLabel?: boolean;
}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, name, className = '', hideLabel = false, children, ...props }, ref) => {
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
        <select
          id={name}
          name={name}
          ref={ref}
          className={cn(
            "flex h-10 w-full rounded-md border border-input bg-background/50 px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-50 transition-all",
            className
          )}
          {...props}
        >
          {children}
        </select>
      </div>
    );
  }
);
Select.displayName = "Select";

export default Select;
