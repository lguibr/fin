import React from 'react';
import ReactDatePicker from 'react-datepicker';
import { cn } from '../../lib/utils';
import { Calendar } from 'lucide-react';

interface DatePickerProps {
  label?: string;
  value: Date | null;
  onChange: (date: Date | null) => void;
  placeholder?: string;
  minDate?: Date;
  maxDate?: Date;
  disabled?: boolean;
  className?: string;
}

const DatePicker: React.FC<DatePickerProps> = ({
  label,
  value,
  onChange,
  placeholder = 'Select date',
  minDate,
  maxDate,
  disabled = false,
  className = '',
}) => {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-muted-foreground mb-2">
          {label}
        </label>
      )}
      <div className="relative">
        <ReactDatePicker
          selected={value}
          onChange={onChange}
          dateFormat="dd/MM/yyyy"
          placeholderText={placeholder}
          minDate={minDate}
          maxDate={maxDate}
          disabled={disabled}
          className={cn(
            'flex h-10 w-full rounded-md border border-input bg-background/50 px-3 py-2 text-sm ring-offset-background',
            'placeholder:text-muted-foreground',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-0',
            'disabled:cursor-not-allowed disabled:opacity-50',
            'transition-all',
            'pr-10',
            className
          )}
          calendarClassName="bg-popover border border-border rounded-lg shadow-lg"
          wrapperClassName="w-full"
        />
        <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
      </div>
    </div>
  );
};

export default DatePicker;

