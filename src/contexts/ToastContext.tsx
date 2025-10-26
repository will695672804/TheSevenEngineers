import React, { createContext, useContext, useState, useCallback } from 'react';

type ToastAction = {
  label: string;
  onClick: () => void;
};

type Toast = {
  id: string;
  message: string;
  action?: ToastAction;
};

interface ToastContextType {
  toasts: Toast[];
  showToast: (message: string, action?: ToastAction, duration?: number) => string;
  dismissToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const dismissToast = useCallback((id: string) => {
    setToasts(t => t.filter(x => x.id !== id));
  }, []);

  const showToast = useCallback((message: string, action?: ToastAction, duration: number = 5000) => {
    const id = Date.now().toString() + Math.random().toString(36).slice(2, 8);
    const t: Toast = { id, message, action };
    setToasts(prev => [t, ...prev]);

    if (duration > 0) {
      setTimeout(() => dismissToast(id), duration);
    }

    return id;
  }, [dismissToast]);

  return (
    <ToastContext.Provider value={{ toasts, showToast, dismissToast }}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end space-y-3">
        {toasts.map(t => (
          <div key={t.id} className="bg-white border border-gray-200 shadow-lg rounded-lg p-3 max-w-xs w-full">
            <div className="flex items-center justify-between space-x-3">
              <div className="text-sm text-gray-800">{t.message}</div>
              <div className="flex items-center space-x-2">
                {t.action && (
                  <button
                    onClick={() => {
                      try { t.action?.onClick(); } catch (e) { /* ignore */ }
                      dismissToast(t.id);
                    }}
                    className="text-blue-600 text-sm font-medium px-2 py-1 rounded hover:bg-blue-50"
                  >
                    {t.action.label}
                  </button>
                )}
                <button onClick={() => dismissToast(t.id)} className="text-gray-400 hover:text-gray-600">
                  ✕
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};
