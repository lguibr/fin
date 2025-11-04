import React from 'react';
import Modal from './Modal';
import Button from './Button';
import { AlertTriangle } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning';
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'danger'
}) => {
  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="">
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center ${
            variant === 'danger' ? 'bg-destructive/10' : 'bg-yellow-500/10'
          }`}>
            <AlertTriangle className={`w-6 h-6 ${
              variant === 'danger' ? 'text-destructive' : 'text-yellow-500'
            }`} />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-foreground">{title}</h3>
            <p className="text-sm text-muted-foreground mt-1">{message}</p>
          </div>
        </div>

        <div className="flex gap-3 justify-end">
          <Button
            onClick={onClose}
            variant="outline"
            size="lg"
          >
            {cancelText}
          </Button>
          <Button
            onClick={handleConfirm}
            variant="destructive"
            size="lg"
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default ConfirmModal;

