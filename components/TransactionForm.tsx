import React, { useState, useEffect, useContext } from 'react';
import { Transaction } from '../types';
import { PREDEFINED_COLORS } from '../utils/colors';
import Button from './ui/Button';
import Input from './ui/Input';
import Select from './ui/Select';
import Toggle from './ui/Toggle';
import ColorPicker from './ui/ColorPicker';
import DatePicker from './ui/DatePicker';
import { Plus, Save, AlertCircle } from 'lucide-react';
import { LanguageContext } from '../context/LanguageContext';
import { cn } from '../lib/utils';

interface TransactionFormProps {
  onSave: (transaction: Transaction) => void;
  existingTransaction?: Transaction | null;
  onClose?: () => void;
}

const TransactionForm: React.FC<TransactionFormProps> = ({ onSave, existingTransaction }) => {
  const { t } = useContext(LanguageContext);
  
  const getInitialState = () => ({
    id: existingTransaction?.id || crypto.randomUUID(),
    description: existingTransaction?.description || '',
    amount: existingTransaction?.amount || 0,
    type: existingTransaction?.type || 'expense',
    frequency: existingTransaction?.frequency || 'monthly',
    startDate: existingTransaction?.startDate || new Date().toISOString().split('T')[0],
    endDate: existingTransaction?.endDate || '',
    color: existingTransaction?.color || PREDEFINED_COLORS[0],
    enabled: existingTransaction?.enabled ?? true,
  });

  const [transaction, setTransaction] = useState(getInitialState);
  const [showEndDate, setShowEndDate] = useState(!!existingTransaction?.endDate);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    setTransaction(getInitialState());
    setShowEndDate(!!existingTransaction?.endDate);
  }, [existingTransaction]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setTransaction(prev => ({
      ...prev,
      [name]: name === 'amount' ? parseFloat(value) || 0 : value,
    }));
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!transaction.description.trim()) {
      newErrors.description = t('error_description_required');
    }
    
    if (transaction.amount <= 0) {
      newErrors.amount = t('error_amount_positive');
    }
    
    if (showEndDate && transaction.endDate && transaction.endDate < transaction.startDate) {
      newErrors.endDate = t('error_end_date_invalid');
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validate()) {
      return;
    }
    
    onSave({
      ...transaction,
      endDate: showEndDate ? transaction.endDate : undefined,
    });
    
    if (!existingTransaction) {
      setTransaction(getInitialState());
      setShowEndDate(false);
      setErrors({});
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
      <div>
        <Input 
          label={t('form_description')} 
          name="description" 
          value={transaction.description} 
          onChange={handleChange}
          placeholder={t('form_description_placeholder')}
          className={cn(errors.description && "border-destructive")}
        />
        {errors.description && (
          <div className="flex items-center gap-1 mt-1 text-xs text-destructive">
            <AlertCircle className="w-3 h-3" />
            <span>{errors.description}</span>
          </div>
        )}
      </div>

      <div>
        <Input 
          label={t('form_amount')} 
          type="number" 
          name="amount" 
          value={transaction.amount} 
          onChange={handleChange}
          min="0.01" 
          step="0.01"
          placeholder="0.00"
          className={cn(errors.amount && "border-destructive")}
        />
        {errors.amount && (
          <div className="flex items-center gap-1 mt-1 text-xs text-destructive">
            <AlertCircle className="w-3 h-3" />
            <span>{errors.amount}</span>
          </div>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-foreground mb-2">
          {t('form_type')}
        </label>
        <div className="flex items-center gap-2 p-1 rounded-lg border border-border bg-muted/30">
          <button
            type="button"
            onClick={() => setTransaction(prev => ({ ...prev, type: 'expense' }))}
            className={cn(
              "flex-1 py-2.5 px-4 rounded-md font-semibold text-sm transition-all",
              transaction.type === 'expense'
                ? "bg-red-500 text-white shadow-md"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {t('form_type_expense')}
          </button>
          <button
            type="button"
            onClick={() => setTransaction(prev => ({ ...prev, type: 'income' }))}
            className={cn(
              "flex-1 py-2.5 px-4 rounded-md font-semibold text-sm transition-all",
              transaction.type === 'income'
                ? "bg-green-500 text-white shadow-md"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {t('form_type_income')}
          </button>
        </div>
      </div>

      <Select label={t('form_frequency')} name="frequency" value={transaction.frequency} onChange={handleChange}>
        <option value="once">{t('form_frequency_once')}</option>
        <option value="monthly">{t('form_frequency_monthly')}</option>
        <option value="yearly">{t('form_frequency_yearly')}</option>
      </Select>

      <div>
        <DatePicker
          label={t('form_start_date')}
          value={transaction.startDate ? new Date(transaction.startDate) : null}
          onChange={(date) => {
            setTransaction(prev => ({
              ...prev,
              startDate: date ? date.toISOString().split('T')[0] : ''
            }));
            if (errors.startDate) {
              setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors.startDate;
                return newErrors;
              });
            }
          }}
          placeholder={t('form_start_date')}
        />
      </div>
      
      {transaction.frequency !== 'once' && (
        <div className="flex items-center space-x-2 sm:space-x-3 p-2 sm:p-3 rounded-md bg-muted/30 border border-border">
          <Toggle enabled={showEndDate} setEnabled={setShowEndDate} />
          <span className="text-xs sm:text-sm text-muted-foreground">{t('form_set_end_date')}</span>
        </div>
      )}

      {transaction.frequency !== 'once' && showEndDate && (
        <div>
          <DatePicker
            label={t('form_end_date')}
            value={transaction.endDate ? new Date(transaction.endDate) : null}
            onChange={(date) => {
              setTransaction(prev => ({
                ...prev,
                endDate: date ? date.toISOString().split('T')[0] : ''
              }));
              if (errors.endDate) {
                setErrors(prev => {
                  const newErrors = { ...prev };
                  delete newErrors.endDate;
                  return newErrors;
                });
              }
            }}
            minDate={transaction.startDate ? new Date(transaction.startDate) : undefined}
            placeholder={t('form_end_date')}
            className={cn(errors.endDate && "border-destructive")}
          />
          {errors.endDate && (
            <div className="flex items-center gap-1 mt-1 text-xs text-destructive">
              <AlertCircle className="w-3 h-3" />
              <span>{errors.endDate}</span>
            </div>
          )}
        </div>
      )}
      
      <div className="pt-1 sm:pt-2">
        <ColorPicker selectedColor={transaction.color} onSelectColor={(color) => setTransaction(p => ({...p, color}))} />
      </div>

      <Button type="submit" size="lg" className="w-full mt-2 sm:mt-0">
        {existingTransaction ? (
          <>
            <Save className="w-5 h-5 mr-2" />
            {t('form_save_button')}
          </>
        ) : (
          <>
            <Plus className="w-5 h-5 mr-2" />
            {t('form_add_button')}
          </>
        )}
      </Button>
    </form>
  );
};

export default TransactionForm;