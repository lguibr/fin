import React, { useContext } from 'react';
import { X } from 'lucide-react';
import { cn } from '../lib/utils';
import { LanguageContext } from '../context/LanguageContext';
import TransactionForm from './TransactionForm';
import { Transaction } from '../types';

interface AddTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddTransaction: (transaction: Transaction) => void;
}

const AddTransactionModal: React.FC<AddTransactionModalProps> = ({
  isOpen,
  onClose,
  onAddTransaction,
}) => {
  const { t } = useContext(LanguageContext);

  const handleAddTransaction = (transaction: Transaction) => {
    onAddTransaction(transaction);
    onClose();
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className={cn(
          "fixed inset-0 bg-black/50 backdrop-blur-sm z-40 transition-opacity duration-300",
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={onClose}
      />

      {/* Modal */}
      <div
        className={cn(
          "fixed z-50",
          "transition-all duration-300",
          "shadow-2xl",
          // Very small screens: full width, no margin
          "left-0 right-0 top-0 bottom-0",
          "w-full max-h-[100vh] overflow-y-auto",
          "bg-background",
          // Small screens and up: centered modal
          "sm:left-1/2 sm:top-1/2 sm:right-auto sm:bottom-auto",
          "sm:-translate-x-1/2 sm:-translate-y-1/2",
          "sm:max-w-2xl sm:max-h-[90vh]",
          "sm:mx-4 sm:border sm:border-border sm:rounded-lg",
          isOpen ? "scale-100 opacity-100" : "scale-95 opacity-0 pointer-events-none"
        )}
      >
        {/* Header */}
        <div className="sticky top-0 flex items-center justify-between p-3 sm:p-4 md:p-6 border-b border-border bg-background/95 backdrop-blur-sm sm:rounded-t-lg z-10">
          <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-foreground">
            {t('add_transaction_title')}
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 sm:p-2 hover:bg-accent/10 rounded-md transition-colors flex-shrink-0"
            aria-label="Close"
          >
            <X className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-3 sm:p-4 md:p-6 overflow-y-auto">
          <TransactionForm onSave={handleAddTransaction} />
        </div>
      </div>
    </>
  );
};

export default AddTransactionModal;

