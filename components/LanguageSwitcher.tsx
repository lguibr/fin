import React, { useContext, useState, useRef, useEffect } from 'react';
import { LanguageContext } from '../context/LanguageContext';
import { Globe, Check, ChevronDown } from 'lucide-react';
import { cn } from '../lib/utils';

const languages = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'pt', name: 'Português', flag: '🇧🇷' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
] as const;

const LanguageSwitcher: React.FC = () => {
  const { language, setLanguage } = useContext(LanguageContext);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const currentLang = languages.find(l => l.code === language) || languages[0];

  const handleSelect = (code: string) => {
    setLanguage(code as 'en' | 'pt' | 'es');
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex items-center gap-1 px-2 py-1.5 rounded-md text-xs font-medium transition-all",
          "border border-border bg-background hover:bg-accent/10",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        )}
        aria-label="Select language"
        aria-expanded={isOpen}
      >
        <Globe className="w-3.5 h-3.5 text-muted-foreground" />
        <span className="hidden sm:inline text-sm">{currentLang.flag}</span>
        <ChevronDown className={cn(
          "w-3.5 h-3.5 transition-transform text-muted-foreground",
          isOpen && "rotate-180"
        )} />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-48 rounded-md border border-border bg-popover shadow-lg z-50 animate-fade-in">
          <div className="p-1">
            {languages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => handleSelect(lang.code)}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors",
                  language === lang.code
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-accent/50 text-foreground"
                )}
              >
                <span className="text-xl">{lang.flag}</span>
                <span className="flex-1 text-left">{lang.name}</span>
                {language === lang.code && (
                  <Check className="w-4 h-4" />
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default LanguageSwitcher;