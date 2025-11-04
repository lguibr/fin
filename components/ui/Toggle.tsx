import React from 'react';
import { cn } from '../../lib/utils';

interface ToggleProps {
  enabled: boolean;
  setEnabled: (enabled: boolean) => void;
  label?: string;
  disabled?: boolean;
}

const Toggle: React.FC<ToggleProps> = ({ enabled, setEnabled, label, disabled = false }) => {
  return (
    <button
      type="button"
      onClick={() => !disabled && setEnabled(!enabled)}
      disabled={disabled}
      className={cn(
        "relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
        enabled ? "bg-primary" : "bg-input"
      )}
      role="switch"
      aria-checked={enabled}
      aria-label={label}
    >
      <span
        className={cn(
          "inline-block h-4 w-4 transform rounded-full bg-background shadow-lg transition-transform",
          enabled ? "translate-x-6" : "translate-x-1"
        )}
      />
    </button>
  );
};

export default Toggle;
