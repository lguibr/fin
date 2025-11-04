import React from 'react';
import { Plus, X } from 'lucide-react';
import { cn } from '../../lib/utils';

interface FloatingActionButtonProps {
  onClick: () => void;
  isOpen?: boolean;
}

const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({ onClick, isOpen = false }) => {
  return (
    <button
      onClick={onClick}
      className={cn(
        "fixed bottom-6 right-6 z-50",
        "w-14 h-14 md:w-16 md:h-16",
        "rounded-full shadow-2xl",
        "backdrop-blur-md bg-black/80 text-white",
        "border border-white/10",
        "hover:bg-black/90 hover:border-white/20",
        "transition-all duration-300",
        "flex items-center justify-center",
        "active:scale-95",
        "shadow-black/50 hover:shadow-black/70",
        "group"
      )}
      aria-label={isOpen ? "Close settings" : "Open settings"}
    >
      <div className="relative w-6 h-6 md:w-7 md:h-7">
        <Plus 
          className={cn(
            "absolute inset-0 transition-all duration-300",
            isOpen ? "rotate-45 scale-0 opacity-0" : "rotate-0 scale-100 opacity-100"
          )}
        />
        <X 
          className={cn(
            "absolute inset-0 transition-all duration-300",
            isOpen ? "rotate-0 scale-100 opacity-100" : "rotate-45 scale-0 opacity-0"
          )}
        />
      </div>
    </button>
  );
};

export default FloatingActionButton;

