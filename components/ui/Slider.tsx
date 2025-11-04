import React from 'react';
import { cn } from '../../lib/utils';

interface SliderProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  showValue?: boolean;
  valueFormatter?: (value: number) => string;
}

const Slider = React.forwardRef<HTMLInputElement, SliderProps>(
  ({ label, showValue = true, valueFormatter, className, ...props }, ref) => {
    const value = Number(props.value) || 0;
    const displayValue = valueFormatter ? valueFormatter(value) : value;

    return (
      <div className="w-full space-y-2">
        {label && (
          <div className="flex justify-between items-center">
            <label className="text-sm font-medium text-muted-foreground">
              {label}
            </label>
            {showValue && (
              <span className="text-sm font-semibold text-primary">
                {displayValue}
              </span>
            )}
          </div>
        )}
        <input
          type="range"
          ref={ref}
          className={cn(
            "w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary transition-all",
            "[&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:shadow-lg [&::-webkit-slider-thumb]:shadow-primary/30 [&::-webkit-slider-thumb]:transition-all [&::-webkit-slider-thumb]:hover:scale-110",
            "[&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-primary [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:shadow-lg [&::-moz-range-thumb]:shadow-primary/30 [&::-moz-range-thumb]:transition-all [&::-moz-range-thumb]:hover:scale-110",
            className
          )}
          {...props}
        />
      </div>
    );
  }
);
Slider.displayName = "Slider";

export default Slider;

