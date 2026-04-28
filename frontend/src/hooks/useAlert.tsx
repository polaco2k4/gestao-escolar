import { useState, useCallback } from 'react';
import AlertDialog from '../components/AlertDialog';

interface AlertOptions {
  title: string;
  message: string;
  type?: 'info' | 'success' | 'warning' | 'error';
  confirmText?: string;
  cancelText?: string;
}

interface ConfirmOptions extends AlertOptions {
  onConfirm: () => void;
}

export function useAlert() {
  const [alertState, setAlertState] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    type: 'info' | 'success' | 'warning' | 'error';
    confirmText: string;
    cancelText: string;
    showCancel: boolean;
    onConfirm?: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    type: 'info',
    confirmText: 'OK',
    cancelText: 'Cancelar',
    showCancel: false,
  });

  const closeAlert = useCallback(() => {
    setAlertState((prev) => ({ ...prev, isOpen: false }));
  }, []);

  // Alert simples (apenas OK)
  const showAlert = useCallback((options: AlertOptions) => {
    setAlertState({
      isOpen: true,
      title: options.title,
      message: options.message,
      type: options.type || 'info',
      confirmText: options.confirmText || 'OK',
      cancelText: options.cancelText || 'Cancelar',
      showCancel: false,
      onConfirm: undefined,
    });
  }, []);

  // Confirm (OK e Cancelar)
  const showConfirm = useCallback((options: ConfirmOptions) => {
    setAlertState({
      isOpen: true,
      title: options.title,
      message: options.message,
      type: options.type || 'warning',
      confirmText: options.confirmText || 'OK',
      cancelText: options.cancelText || 'Cancelar',
      showCancel: true,
      onConfirm: options.onConfirm,
    });
  }, []);

  // Atalhos para tipos específicos
  const showSuccess = useCallback((title: string, message: string) => {
    showAlert({ title, message, type: 'success' });
  }, [showAlert]);

  const showError = useCallback((title: string, message: string) => {
    showAlert({ title, message, type: 'error' });
  }, [showAlert]);

  const showWarning = useCallback((title: string, message: string) => {
    showAlert({ title, message, type: 'warning' });
  }, [showAlert]);

  const showInfo = useCallback((title: string, message: string) => {
    showAlert({ title, message, type: 'info' });
  }, [showAlert]);

  const AlertComponent = (
    <AlertDialog
      isOpen={alertState.isOpen}
      onClose={closeAlert}
      onConfirm={alertState.onConfirm}
      title={alertState.title}
      message={alertState.message}
      type={alertState.type}
      confirmText={alertState.confirmText}
      cancelText={alertState.cancelText}
      showCancel={alertState.showCancel}
    />
  );

  return {
    showAlert,
    showConfirm,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    AlertComponent,
  };
}
