import React, { useState, useEffect } from 'react';
import { X, AlertCircle } from 'lucide-react';

let showToastFunction = null;

export const showErrorToast = (message) => {
  if (showToastFunction) {
    showToastFunction(message);
  }
};

const ErrorToast = () => {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    showToastFunction = (message) => {
      const id = Date.now();
      setToasts(prev => [...prev, { id, message }]);
      setTimeout(() => {
        setToasts(prev => prev.filter(toast => toast.id !== id));
      }, 5000);
    };
  }, []);

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {toasts.map(toast => (
        <div
          key={toast.id}
          className="bg-red-500 text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-3 min-w-80"
        >
          <AlertCircle size={20} />
          <span className="flex-1">{toast.message}</span>
          <button
            onClick={() => setToasts(prev => prev.filter(t => t.id !== toast.id))}
            className="text-white hover:text-gray-200"
          >
            <X size={16} />
          </button>
        </div>
      ))}
    </div>
  );
};

export default ErrorToast;