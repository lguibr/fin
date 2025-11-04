import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Transaction, ProjectionSettings, TimePeriod, DisplayMode, MainView } from '../types';
import { useProjection, useProjectionActions } from '../hooks/useProjections';
import { useFinancialProjection } from '../hooks/useFinancialProjection';
import Controls from '../components/Controls';
import TransactionList from '../components/TransactionList';
import EditTransactionModal from '../components/EditTransactionModal';
import CalendarView from '../components/CalendarView';
import UnifiedProjectionChart from '../components/UnifiedProjectionChart';
import FloatingActionButton from '../components/ui/FloatingActionButton';
import AddTransactionModal from '../components/AddTransactionModal';
import { Calendar, BarChart3, List } from 'lucide-react';
import { PREDEFINED_COLORS } from '../utils/colors';
import { LanguageContext } from '../context/LanguageContext';
import { cn } from '../lib/utils';

const ProjectionPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [timePeriod, setTimePeriod] = useState<TimePeriod>('monthly');
  const [displayMode, setDisplayMode] = useState<DisplayMode>('relative');
  const [mainView, setMainView] = useState<MainView>('projection');
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { t } = useContext(LanguageContext);

  // Use new state management hooks
  const { projection, loading } = useProjection(id);
  const {
    addTransaction,
    updateTransaction,
    deleteTransaction,
    toggleTransaction,
    updateSettings,
    updateProjectionName,
    setActiveProjection,
  } = useProjectionActions();

  // Set active projection when component mounts
  useEffect(() => {
    if (id) {
      setActiveProjection(id);
    }
    return () => {
      setActiveProjection(null);
    };
  }, [id, setActiveProjection]);

  // Redirect if projection not found
  useEffect(() => {
    if (!loading && !projection && id) {
      navigate('/');
    }
  }, [loading, projection, id, navigate]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading projection...</p>
        </div>
      </div>
    );
  }

  if (!projection) {
    return null;
  }

  const { unifiedData, monthlyData } = useFinancialProjection(
    projection.transactions,
    projection.settings,
    timePeriod,
    displayMode
  );

  const handleSettingsChange = async (newSettings: ProjectionSettings) => {
    await updateSettings(projection.id, newSettings);
  };

  const handleAddTransaction = async (transaction: Transaction) => {
    const transactionWithDefaults = {
      ...transaction,
      color: transaction.color || PREDEFINED_COLORS[projection.transactions.length % PREDEFINED_COLORS.length],
      enabled: true,
    };
    await addTransaction(projection.id, transactionWithDefaults);
  };
  
  const handleUpdateTransaction = async (transaction: Transaction) => {
    await updateTransaction(projection.id, transaction);
    setEditingTransaction(null);
  };
  
  const handleDeleteTransaction = async (transactionId: string) => {
    await deleteTransaction(projection.id, transactionId);
  };

  const handleToggleTransactionEnabled = async (transactionId: string) => {
    await toggleTransaction(projection.id, transactionId);
  };

  const tabs = [
    { id: 'projection' as MainView, icon: BarChart3, label: t('projection_view') },
    { id: 'transactions' as MainView, icon: List, label: t('transactions_title') },
    { id: 'calendar' as MainView, icon: Calendar, label: t('calendar_view') },
  ];

  return (
    <div className="flex flex-col min-h-[calc(100vh-3.5rem)]">
      {/* Main Content Area - Scrollable */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-7xl mx-auto px-2 sm:px-4 md:px-6 lg:px-8 py-3 sm:py-4 space-y-3 sm:space-y-4">
          {/* Tab Navigation */}
          <div className="flex gap-1 sm:gap-2 overflow-x-auto scrollbar-hide border-b border-border pb-2">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setMainView(tab.id)}
                  className={cn(
                    "flex items-center justify-center gap-1.5 sm:gap-2 px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 rounded-md transition-all flex-shrink-0",
                    mainView === tab.id
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-accent/10 text-muted-foreground hover:text-foreground"
                  )}
                >
                  <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  <span className="hidden md:inline text-xs sm:text-sm font-medium">{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Content Views */}
          <div className="pb-4">
            {mainView === 'projection' && (
              <div className="animate-fade-in space-y-4">
                <UnifiedProjectionChart 
                  data={unifiedData} 
                  transactions={projection.transactions}
                  timePeriod={timePeriod}
                  displayMode={displayMode}
                  onTimePeriodChange={setTimePeriod}
                  onDisplayModeChange={setDisplayMode}
                />
                
                {/* Settings Section - Only in Projection View */}
                <div className="border-t border-border pt-4">
                  <div className="flex items-center gap-2 mb-3">
                    <h2 className="text-xs sm:text-sm font-bold text-muted-foreground uppercase tracking-wide">{t('settings_title')}</h2>
                  </div>
                  <Controls
                    settings={projection.settings}
                    setSettings={handleSettingsChange}
                  />
                </div>
              </div>
            )}

            {mainView === 'transactions' && (
              <div className="animate-fade-in">
                <div className="space-y-4">
                  <h2 className="text-xl font-bold">{t('transactions_title')}</h2>
                  <TransactionList 
                    transactions={projection.transactions} 
                    onDelete={handleDeleteTransaction} 
                    onEdit={setEditingTransaction} 
                    onToggleEnabled={handleToggleTransactionEnabled} 
                  />
                </div>
              </div>
            )}

            {mainView === 'calendar' && (
              <div className="animate-fade-in">
                <CalendarView transactions={projection.transactions} monthlyData={monthlyData} />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Floating Action Button */}
      <FloatingActionButton 
        onClick={() => setIsModalOpen(!isModalOpen)} 
        isOpen={isModalOpen}
      />

      {/* Add Transaction Modal */}
      <AddTransactionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAddTransaction={handleAddTransaction}
      />

      {/* Edit Transaction Modal */}
      <EditTransactionModal 
        isOpen={!!editingTransaction}
        onClose={() => setEditingTransaction(null)}
        transaction={editingTransaction}
        onSave={handleUpdateTransaction}
      />
    </div>
  );
};

export default ProjectionPage;
