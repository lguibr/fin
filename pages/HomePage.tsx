import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { Projection, ProjectionSettings } from '../types';
import { useProjections, useProjectionActions } from '../hooks/useProjections';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { Plus, Trash2, Copy, FileText, TrendingUp } from 'lucide-react';
import { LanguageContext } from '../context/LanguageContext';
import { cn } from '../lib/utils';

const DEFAULT_SETTINGS: ProjectionSettings = {
  initialBalance: 10000,
  projectionYears: 10,
  monthlyReturnRate: 0.5,
  investmentAllocation: 75,
};

const HomePage: React.FC = () => {
  const [newProjectionName, setNewProjectionName] = useState('');
  const navigate = useNavigate();
  const { t, language } = useContext(LanguageContext);
  
  // Use new state management hooks
  const { projections, loading: isLoading } = useProjections();
  const { createProjection, deleteProjection, duplicateProjection } = useProjectionActions();

  const handleCreateProjection = async () => {
    const name = newProjectionName.trim() || t('home_projection_name_placeholder');
    const newProjection: Projection = {
      id: crypto.randomUUID(),
      name,
      createdAt: new Date().toISOString(),
      settings: DEFAULT_SETTINGS,
      transactions: [],
    };
    await createProjection(newProjection);
    setNewProjectionName('');
    navigate(`/projection/${newProjection.id}`);
  };

  const handleDeleteProjection = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this projection?')) {
      await deleteProjection(id);
    }
  };

  const handleDuplicateProjection = async (id: string) => {
    await duplicateProjection(id);
  };

  return (
    <div className="max-w-7xl mx-auto px-2 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-8 space-y-8 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            {t('home_title')}
          </h2>
          <p className="text-muted-foreground mt-2">Manage your financial projections</p>
        </div>
      </div>
      
      <Card hover={false} className="border-primary/20">
        <div className="flex flex-col sm:flex-row gap-4">
          <Input 
            label={t('home_projection_name_placeholder')}
            hideLabel
            name="newProjectionName"
            value={newProjectionName}
            onChange={(e) => setNewProjectionName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleCreateProjection()}
            placeholder={t('home_projection_name_placeholder')}
            className="flex-grow"
          />
          <Button onClick={handleCreateProjection} size="lg" className="w-full sm:w-auto">
            <Plus className="w-5 h-5 mr-2" />
            {t('home_create_new')}
          </Button>
        </div>
      </Card>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <div className="space-y-4">
                <div className="h-6 bg-muted rounded w-3/4"></div>
                <div className="h-4 bg-muted rounded w-1/2"></div>
                <div className="h-10 bg-muted rounded"></div>
              </div>
            </Card>
          ))}
        </div>
      ) : projections.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projections.map((proj, index) => (
            <Card 
              key={proj.id} 
              className={cn(
                "group cursor-pointer",
                "animate-fade-in"
              )}
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className="flex flex-col h-full space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-xl font-bold text-foreground truncate group-hover:text-primary transition-colors">
                      {proj.name}
                    </h3>
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(proj.createdAt).toLocaleDateString(language, { year: 'numeric', month: 'long', day: 'numeric' })}
                    </p>
                  </div>
                  <TrendingUp className="w-5 h-5 text-primary opacity-50 group-hover:opacity-100 transition-opacity" />
                </div>

                <div className="flex-1 flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{proj.transactions.length} transactions</span>
                  <span className="text-muted-foreground">{proj.settings.projectionYears} years</span>
                </div>
                
                <div className="flex gap-2 pt-4 border-t border-border">
                  <Button 
                    onClick={() => navigate(`/projection/${proj.id}`)} 
                    className="flex-1"
                    size="sm"
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    {t('home_view_projection')}
                  </Button>
                  <Button 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDuplicateProjection(proj.id);
                    }} 
                    variant="outline"
                    size="icon"
                    title={t('home_duplicate_projection')}
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                  <Button 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteProjection(proj.id);
                    }} 
                    variant="destructive"
                    size="icon"
                    title={t('home_delete_projection')}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <div className="py-16 animate-slide-in-from-bottom">
          <Card hover={false} className="max-w-lg mx-auto text-center">
            <div className="flex flex-col items-center gap-6 py-8">
              <div className="rounded-full bg-primary/10 p-6">
                <TrendingUp className="w-16 h-16 text-primary" />
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-bold text-foreground">{t('home_no_projections_title')}</h3>
                <p className="text-muted-foreground max-w-sm mx-auto">{t('home_no_projections_desc')}</p>
              </div>
              <Button onClick={handleCreateProjection} size="lg" className="mt-4">
                <Plus className="w-5 h-5 mr-2" />
                {t('home_create_first_projection')}
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default HomePage;