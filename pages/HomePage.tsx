import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Projection, ProjectionSettings } from '../types';
import { useProjections, useProjectionActions } from '../hooks/useProjections';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { Plus, Trash2, Copy, TrendingUp, Dices } from 'lucide-react';
import ConfirmModal from '../components/ui/ConfirmModal';
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
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const navigate = useNavigate();
  const { t, language } = useContext(LanguageContext);
  
  // Generate random placeholder projection name
  const [randomPlaceholder, setRandomPlaceholder] = useState('');
  
  useEffect(() => {
    const randomIndex = Math.floor(Math.random() * 10) + 1;
    setRandomPlaceholder(t(`projection_name_${randomIndex}`));
  }, [t, language]);
  
  // Use new state management hooks
  const { projections, loading: isLoading } = useProjections();
  const { createProjection, deleteProjection, duplicateProjection } = useProjectionActions();

  const handleCreateProjection = async () => {
    let name = newProjectionName.trim();
    
    // If no name provided, use the random placeholder name
    if (!name) {
      name = randomPlaceholder;
    }
    
    const newProjection: Projection = {
      id: crypto.randomUUID(),
      name,
      createdAt: new Date().toISOString(),
      settings: DEFAULT_SETTINGS,
      transactions: [],
    };
    await createProjection(newProjection);
    setNewProjectionName('');
    
    // Generate new random placeholder for next creation
    const randomIndex = Math.floor(Math.random() * 10) + 1;
    setRandomPlaceholder(t(`projection_name_${randomIndex}`));
    
    navigate(`/projection/${newProjection.id}`);
  };

  const handleDeleteProjection = async () => {
    if (confirmDeleteId) {
      await deleteProjection(confirmDeleteId);
      setConfirmDeleteId(null);
    }
  };

  const handleDuplicateProjection = async (id: string) => {
    await duplicateProjection(id);
  };

  const handleRandomizeName = () => {
    const randomIndex = Math.floor(Math.random() * 10) + 1;
    setRandomPlaceholder(t(`projection_name_${randomIndex}`));
  };

  // Calculate financial summary for a projection
  const calculateProjectionSummary = (proj: Projection) => {
    const activeTransactions = proj.transactions.filter(t => t.enabled);
    const monthlyIncome = activeTransactions
      .filter(t => t.type === 'income' && t.frequency === 'monthly')
      .reduce((sum, t) => sum + t.amount, 0);
    const monthlyExpense = activeTransactions
      .filter(t => t.type === 'expense' && t.frequency === 'monthly')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const numMonths = proj.settings.projectionYears * 12;
    const totalIncome = monthlyIncome * numMonths;
    const totalExpense = monthlyExpense * numMonths;
    
    // Simple compound interest calculation for returns
    const monthlyRate = proj.settings.monthlyReturnRate / 100;
    const initialInvested = proj.settings.initialBalance * (proj.settings.investmentAllocation / 100);
    const monthlySurplus = (monthlyIncome - monthlyExpense) * (proj.settings.investmentAllocation / 100);
    
    let invested = initialInvested;
    let totalReturns = 0;
    
    for (let i = 0; i < numMonths; i++) {
      const monthlyReturn = invested * monthlyRate;
      totalReturns += monthlyReturn;
      invested += monthlyReturn + monthlySurplus;
    }
    
    const finalTotal = proj.settings.initialBalance + (monthlyIncome - monthlyExpense) * numMonths + totalReturns;
    
    return {
      totalIncome,
      totalExpense,
      totalReturns,
      finalTotal
    };
  };

  return (
    <div className="max-w-7xl mx-auto px-2 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-8 space-y-8 animate-fade-in">
      <Card hover={false} className="border-primary/20">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex gap-2 flex-1">
            <Button 
              onClick={handleRandomizeName} 
              variant="ghost" 
              size="lg"
              className="flex-shrink-0 hover:bg-primary/10"
              title={t('randomize_name')}
            >
              <Dices className="w-5 h-5" />
            </Button>
            <Input 
              label={randomPlaceholder}
              hideLabel
              name="newProjectionName"
              value={newProjectionName}
              onChange={(e) => setNewProjectionName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleCreateProjection()}
              placeholder={randomPlaceholder}
              className="flex-grow"
            />
          </div>
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
          {projections.map((proj, index) => {
            const summary = calculateProjectionSummary(proj);
            const formatCurrency = (amount: number) => 
              new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(amount);
            
            return (
              <Card 
                key={proj.id} 
                className={cn(
                  "group cursor-pointer",
                  "animate-fade-in"
                )}
                style={{ animationDelay: `${index * 50}ms` }}
                onClick={() => navigate(`/projection/${proj.id}`)}
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

                  <div className="flex-1 space-y-2">
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="space-y-1">
                        <p className="text-muted-foreground">{t('card_total_income')}</p>
                        <p className="font-semibold text-green-500">{formatCurrency(summary.totalIncome)}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-muted-foreground">{t('card_total_expense')}</p>
                        <p className="font-semibold text-red-500">{formatCurrency(summary.totalExpense)}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-muted-foreground">{t('card_returns')}</p>
                        <p className="font-semibold text-accent">{formatCurrency(summary.totalReturns)}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-muted-foreground">{t('card_final_total')}</p>
                        <p className="font-semibold text-primary">{formatCurrency(summary.finalTotal)}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-xs pt-2 border-t border-border">
                      <span className="text-muted-foreground">
                        {t(proj.transactions.length === 1 ? 'card_transactions_count' : 'card_transactions_count_plural', { count: proj.transactions.length })}
                      </span>
                      <span className="text-muted-foreground">
                        {t(proj.settings.projectionYears === 1 ? 'card_projection_years' : 'card_projection_years_plural', { years: proj.settings.projectionYears })}
                      </span>
                    </div>
                  </div>
                
                <div className="flex gap-2 pt-4 border-t border-border justify-end">
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
                      setConfirmDeleteId(proj.id);
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
            );
          })}
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

      {/* Confirm Delete Modal */}
      <ConfirmModal
        isOpen={!!confirmDeleteId}
        onClose={() => setConfirmDeleteId(null)}
        onConfirm={handleDeleteProjection}
        title={t('confirm_delete_projection_title')}
        message={t('confirm_delete_projection_message')}
        confirmText={t('confirm_button')}
        cancelText={t('cancel_button')}
      />
    </div>
  );
};

export default HomePage;