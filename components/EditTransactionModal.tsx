import React, { useContext } from 'react';
import { Transaction } from '../types';
import Modal from './ui/Modal';
import TransactionForm from './TransactionForm';
import { LanguageContext } from '../context/LanguageContext';
import { Edit } from 'lucide-react';

interface EditTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  transaction: Transaction | null;
  onSave: (transaction: Transaction) => void;
}

const EditTransactionModal: React.FC<EditTransactionModalProps> = ({
  isOpen,
  onClose,
  transaction,
  onSave,
}) => {
  const { t } = useContext(LanguageContext);
  
  if (!transaction) return null;

  const handleSave = (updatedTransaction: Transaction) => {
    onSave(updatedTransaction);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-2xl">
      <div className="space-y-3 sm:space-y-4 md:space-y-6">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="p-1.5 sm:p-2 rounded-lg bg-primary/10">
            <Edit className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
          </div>
          <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-foreground">
            {t('edit_transaction_title')}
          </h2>
        </div>
        
        <div className="h-px bg-border" />
        
        <TransactionForm
          existingTransaction={transaction}
          onSave={handleSave}
          onClose={onClose}
        />
      </div>
    </Modal>
  );
};

export default EditTransactionModal;