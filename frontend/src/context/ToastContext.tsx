import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';

export type ToastType = 'SUCCESS' | 'WARNING' | 'ALERT' | 'INFO';

export interface Toast {
  id: string;
  title: string;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  toasts: Toast[];
  showToast: (title: string, message: string, type?: ToastType) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback((title: string, message: string, type: ToastType = 'INFO') => {
    const id = Math.random().toString(36).substring(2, 9);
    const newToast: Toast = { id, title, message, type };

    setToasts((prev) => [...prev, newToast]);

    setTimeout(() => {
      removeToast(id);
    }, 5000);
  }, [removeToast]);

  return (
    <ToastContext.Provider value={{ toasts, showToast, removeToast }}>
      {children}
      {/* Fixed Toast Container */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col space-y-3 max-w-md w-full pointer-events-none">
        {toasts.map((toast) => {
          const isSuccess = toast.type === 'SUCCESS';
          const isWarning = toast.type === 'WARNING';
          const isAlert = toast.type === 'ALERT';

          return (
            <div
              key={toast.id}
              className={`pointer-events-auto flex items-start p-4 rounded-xl border shadow-xl backdrop-blur-xl transition-all duration-300 animate-slide-up ${
                isSuccess
                  ? 'bg-emerald-950/80 border-emerald-500/40 text-emerald-100 shadow-emerald-500/10'
                  : isWarning
                  ? 'bg-amber-950/80 border-amber-500/40 text-amber-100 shadow-amber-500/10'
                  : isAlert
                  ? 'bg-rose-950/80 border-rose-500/40 text-rose-100 shadow-rose-500/10'
                  : 'bg-cyan-950/80 border-cyan-500/40 text-cyan-100 shadow-cyan-500/10'
              }`}
            >
              <div className="mr-3 mt-0.5 flex-shrink-0">
                {isSuccess && <CheckCircle2 className="w-5 h-5 text-emerald-400" />}
                {isWarning && <AlertTriangle className="w-5 h-5 text-amber-400" />}
                {isAlert && <AlertCircle className="w-5 h-5 text-rose-400" />}
                {!isSuccess && !isWarning && !isAlert && <Info className="w-5 h-5 text-cyan-400" />}
              </div>

              <div className="flex-1 mr-2">
                <h4 className="text-sm font-semibold tracking-wide">{toast.title}</h4>
                <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">{toast.message}</p>
              </div>

              <button
                onClick={() => removeToast(toast.id)}
                className="text-slate-400 hover:text-white transition-colors flex-shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used within a ToastProvider');
  return context;
};
