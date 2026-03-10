import { createContext, useContext, useState, useCallback } from 'react';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((message, type = 'info') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3500);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="tf-toast-container">
        {toasts.map(t => (
          <div key={t.id} className={`tf-toast ${t.type}`}>
            <i className={`bi me-2 ${
              t.type === 'success' ? 'bi-check-circle' :
              t.type === 'error'   ? 'bi-x-circle' :
              t.type === 'warning' ? 'bi-exclamation-triangle' :
              'bi-info-circle'
            }`} />
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export const useToast = () => useContext(ToastContext);
