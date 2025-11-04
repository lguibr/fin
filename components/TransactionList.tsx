import React, { useContext, useState, useMemo } from 'react';
import { Transaction } from '../types';
import Button from './ui/Button';
import Input from './ui/Input';
import Badge from './ui/Badge';
import { Trash2, Edit, Eye, EyeOff, Search, ArrowUpDown, Filter } from 'lucide-react';
import { LanguageContext } from '../context/LanguageContext';
import { cn } from '../lib/utils';
import ConfirmModal from './ui/ConfirmModal';

interface TransactionListProps {
  transactions: Transaction[];
  onDelete: (id: string) => void;
  onEdit: (transaction: Transaction) => void;
  onToggleEnabled: (id: string) => void;
  onAddNew?: () => void;
}

type SortOption = 'date' | 'amount' | 'name';
type FilterOption = 'all' | 'income' | 'expense' | 'enabled' | 'disabled';

const TransactionList: React.FC<TransactionListProps> = ({ transactions, onDelete, onEdit, onToggleEnabled, onAddNew }) => {
  const { t, language } = useContext(LanguageContext);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('date');
  const [filterBy, setFilterBy] = useState<FilterOption>('all');
  const [sortDescending, setSortDescending] = useState(true);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  
  const formatCurrency = (amount: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  
  const formatDate = (dateString: string) => new Date(dateString.replace(/-/g, '/')).toLocaleDateString(language);
  
  const getTranslatedFrequency = (freq: Transaction['frequency']) => {
    const key = `form_frequency_${freq}`;
    const translated = t(key);
    return translated.charAt(0).toUpperCase() + translated.slice(1);
  };

  const filteredAndSortedTransactions = useMemo(() => {
    let result = [...transactions];

    // Filter
    if (searchQuery) {
      result = result.filter(t => 
        t.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (filterBy !== 'all') {
      switch (filterBy) {
        case 'income':
          result = result.filter(t => t.type === 'income');
          break;
        case 'expense':
          result = result.filter(t => t.type === 'expense');
          break;
        case 'enabled':
          result = result.filter(t => t.enabled);
          break;
        case 'disabled':
          result = result.filter(t => !t.enabled);
          break;
      }
    }

    // Sort
    result.sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case 'date':
          comparison = new Date(a.startDate).getTime() - new Date(b.startDate).getTime();
          break;
        case 'amount':
          comparison = a.amount - b.amount;
          break;
        case 'name':
          comparison = a.description.localeCompare(b.description);
          break;
      }
      return sortDescending ? -comparison : comparison;
    });

    return result;
  }, [transactions, searchQuery, sortBy, filterBy, sortDescending]);

  // Show empty state if no transactions at all
  if (transactions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 sm:py-24 px-4">
        <div className="text-center space-y-6 max-w-md">
          <div className="w-24 h-24 sm:w-28 sm:h-28 mx-auto rounded-full bg-primary/10 flex items-center justify-center backdrop-blur-sm border border-primary/20">
            <Search className="w-12 h-12 sm:w-14 sm:h-14 text-primary" />
          </div>
          <div className="space-y-2">
            <h3 className="text-2xl sm:text-3xl font-bold text-foreground">
              {t('no_transactions_title')}
            </h3>
            <p className="text-base sm:text-lg text-muted-foreground">
              {t('no_transactions_description')}
            </p>
          </div>
          {onAddNew && (
            <Button
              onClick={onAddNew}
              size="lg"
              className="mt-4 text-base px-8 py-6"
            >
              {t('form_add_button')}
            </Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search and Filters */}
      <div className="space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder={t('search_transactions_placeholder')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-muted-foreground" />
            <div className="flex gap-1">
              {(['all', 'income', 'expense', 'enabled', 'disabled'] as FilterOption[]).map((filter) => (
                <Button
                  key={filter}
                  size="sm"
                  variant={filterBy === filter ? 'default' : 'outline'}
                  onClick={() => setFilterBy(filter)}
                  className="text-xs h-7 px-2"
                >
                  {filter.charAt(0).toUpperCase() + filter.slice(1)}
                </Button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <ArrowUpDown className="w-4 h-4 text-muted-foreground" />
          <div className="flex gap-1">
            {(['date', 'amount', 'name'] as SortOption[]).map((sort) => (
              <Button
                key={sort}
                size="sm"
                variant={sortBy === sort ? 'default' : 'outline'}
                onClick={() => {
                  if (sortBy === sort) {
                    setSortDescending(!sortDescending);
                  } else {
                    setSortBy(sort);
                    setSortDescending(true);
                  }
                }}
                className="text-xs h-7 px-2"
              >
                {sort.charAt(0).toUpperCase() + sort.slice(1)}
                {sortBy === sort && (
                  <span className="ml-1">{sortDescending ? '↓' : '↑'}</span>
                )}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Transaction List */}
      <div className="space-y-3 overflow-y-auto pr-1">
        {filteredAndSortedTransactions.length > 0 ? (
          filteredAndSortedTransactions.map(transaction => (
            <div 
              key={transaction.id} 
              className={cn(
                "group flex items-center justify-between p-2 sm:p-2.5 rounded-lg border border-border bg-card/30 backdrop-blur-sm hover:bg-card/40 transition-all",
                !transaction.enabled && "opacity-50"
              )}
            >
              <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                <span 
                  className="w-1.5 sm:w-2 h-12 sm:h-14 rounded-full flex-shrink-0" 
                  style={{ backgroundColor: transaction.color }}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                    <p className="text-sm sm:text-base font-semibold text-foreground">{transaction.description}</p>
                    <Badge variant={transaction.type === 'income' ? 'default' : 'secondary'} className="text-[10px] sm:text-xs md:text-sm">
                      {transaction.type}
                    </Badge>
                  </div>
                  <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 sm:mt-1">
                    {getTranslatedFrequency(transaction.frequency)} • {formatDate(transaction.startDate)}
                    {transaction.endDate && (
                      <span className="text-muted-foreground/70"> → {formatDate(transaction.endDate)}</span>
                    )}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-1 sm:gap-1.5">
                <span className={cn(
                  "font-bold text-sm sm:text-base whitespace-nowrap",
                  transaction.type === 'income' ? 'text-green-500' : 'text-red-500'
                )}>
                  {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                </span>
                <div className="flex gap-0.5 sm:gap-1">
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => onToggleEnabled(transaction.id)}
                    className="h-7 w-7 sm:h-8 sm:w-8"
                    title={transaction.enabled ? t('disable_transaction') : t('enable_transaction')}
                  >
                    {transaction.enabled ? <Eye className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> : <EyeOff className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => onEdit(transaction)}
                    className="h-7 w-7 sm:h-8 sm:w-8"
                  >
                    <Edit className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => setConfirmDeleteId(transaction.id)}
                    className="h-7 w-7 sm:h-8 sm:w-8 hover:text-destructive"
                  >
                    <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              {searchQuery || filterBy !== 'all' ? 'No transactions match your filters' : t('no_transactions')}
            </p>
          </div>
        )}
      </div>

      {transactions.length > 0 && (
        <div className="text-xs text-muted-foreground pt-2 border-t border-border">
          Showing {filteredAndSortedTransactions.length} of {transactions.length} transactions
        </div>
      )}

      {/* Confirm Delete Modal */}
      <ConfirmModal
        isOpen={!!confirmDeleteId}
        onClose={() => setConfirmDeleteId(null)}
        onConfirm={() => {
          if (confirmDeleteId) {
            onDelete(confirmDeleteId);
            setConfirmDeleteId(null);
          }
        }}
        title={t('confirm_delete_transaction_title')}
        message={t('confirm_delete_transaction_message')}
        confirmText={t('confirm_button')}
        cancelText={t('cancel_button')}
      />
    </div>
  );
};

export default TransactionList;