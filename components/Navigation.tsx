import React, { useContext } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { LanguageContext } from '../context/LanguageContext';
import LanguageSwitcher from './LanguageSwitcher';
import { useProjection } from '../hooks/useProjections';
import Input from './ui/Input';
import { Pencil } from 'lucide-react';
import { useProjectionActions } from '../hooks/useProjections';

const Navigation: React.FC = () => {
  const { t } = useContext(LanguageContext);
  const location = useLocation();
  
  // Extract ID from pathname since useParams doesn't work outside Route
  const isProjectionPage = location.pathname.startsWith('/projection/');
  const projectionId = isProjectionPage ? location.pathname.split('/projection/')[1] : undefined;
  
  const { projection, loading } = useProjection(projectionId);
  const { updateProjectionName } = useProjectionActions();

  const handleNameChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (projection) {
      await updateProjectionName(projection.id, e.target.value);
    }
  };
  
  return (
    <nav className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-2 sm:px-4 md:px-6 lg:px-8">
        <div className="relative flex items-center justify-center h-14">
          {/* Left: Logo */}
          <div className="absolute left-0">
            <Link 
              to="/" 
              className="flex items-center group transition-all hover:scale-105"
            >
              <img 
                src="/logo.png" 
                alt="Logo" 
                className="h-10 w-10 sm:h-12 sm:w-12"
              />
            </Link>
          </div>

          {/* Center: Projection Name (only on projection pages) */}
          {isProjectionPage && (
            <div className="relative group px-12">
              {projection ? (
                <>
                  <input
                    type="text"
                    name="projectionName" 
                    value={projection.name} 
                    onChange={handleNameChange} 
                    className="text-sm sm:text-base md:text-lg font-bold border-none bg-transparent px-8 text-center focus-visible:ring-0 focus-visible:outline-none h-8 text-foreground placeholder:text-muted-foreground min-w-[200px]"
                    placeholder={t('projection_name_label')}
                  />
                  <Pencil className="absolute right-0 top-1/2 -translate-y-1/2 w-3.5 h-3.5 sm:w-4 sm:h-4 text-muted-foreground opacity-50 group-hover:opacity-100 transition-opacity pointer-events-none" />
                </>
              ) : (
                <div className="text-sm sm:text-base md:text-lg font-bold text-center h-8 flex items-center text-muted-foreground min-w-[200px] justify-center">
                  {loading ? 'Loading...' : ''}
                </div>
              )}
            </div>
          )}

          {/* Right: Language Switcher */}
          <div className="absolute right-0">
            <LanguageSwitcher />
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;

