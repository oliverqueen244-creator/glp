import { useState, useEffect, useCallback } from 'react';

let toastListener = null;

export function showToast(message, type = 'success', duration = 2500) {
  if (toastListener) {
    toastListener({ message, type, duration, id: Date.now() });
  }
}

export default function ToastContainer() {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    toastListener = (toast) => {
      setToasts(prev => [...prev, toast]);
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== toast.id));
      }, toast.duration);
    };
    return () => { toastListener = null; };
  }, []);

  if (toasts.length === 0) return null;

  const colors = {
    success: { bg: '#7C8B6F', text: '#FFFFFF' },
    info: { bg: '#8B9DC3', text: '#FFFFFF' },
    warning: { bg: '#C4956A', text: '#FFFFFF' },
    error: { bg: '#C47070', text: '#FFFFFF' },
  };

  return (
    <div className="fixed top-0 left-0 right-0 z-50 flex flex-col items-center pointer-events-none" style={{ paddingTop: 'env(safe-area-inset-top, 12px)' }}>
      {toasts.map(toast => {
        const c = colors[toast.type] || colors.success;
        return (
          <div
            key={toast.id}
            className="mt-3 px-4 py-2.5 rounded-xl text-sm font-medium shadow-lg toast-slide-in max-w-sm mx-4"
            style={{ backgroundColor: c.bg, color: c.text }}
          >
            {toast.message}
          </div>
        );
      })}
    </div>
  );
}
