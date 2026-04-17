import { useState, useCallback } from 'react';

let toastListeners = [];
let toastId = 0;

export const showToast = (message, type = 'info', duration = 3000) => {
  const id = ++toastId;
  toastListeners.forEach((cb) => cb({ id, message, type, duration }));
  return id;
};

const ICONS = { success: '✅', error: '❌', warning: '⚠️', info: 'ℹ️' };
const COLORS = {
  success: '#22c55e',
  error: '#ef4444',
  warning: '#f59e0b',
  info: '#6366f1',
};

const Toast = () => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((toast) => {
    setToasts((prev) => [...prev, toast]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== toast.id));
    }, toast.duration || 3000);
  }, []);

  // Register listener
  useState(() => {
    toastListeners.push(addToast);
    return () => {
      toastListeners = toastListeners.filter((l) => l !== addToast);
    };
  });

  const dismiss = (id) => setToasts((prev) => prev.filter((t) => t.id !== id));

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '1.5rem',
        right: '1.5rem',
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        gap: '0.75rem',
        maxWidth: '360px',
        width: '100%',
      }}
      aria-live="polite"
    >
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="toast-enter"
          style={{
            background: '#1e293b',
            border: `1px solid ${COLORS[toast.type] || COLORS.info}`,
            borderLeft: `4px solid ${COLORS[toast.type] || COLORS.info}`,
            borderRadius: '0.625rem',
            padding: '0.875rem 1rem',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '0.625rem',
            boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
          }}
        >
          <span style={{ fontSize: '1rem', flexShrink: 0 }}>{ICONS[toast.type] || ICONS.info}</span>
          <span style={{ flex: 1, fontSize: '0.9rem', color: '#f1f5f9', lineHeight: 1.5 }}>{toast.message}</span>
          <button
            onClick={() => dismiss(toast.id)}
            style={{
              background: 'none', border: 'none', color: '#94a3b8',
              cursor: 'pointer', fontSize: '0.875rem', padding: '0',
              flexShrink: 0, lineHeight: 1,
            }}
            aria-label="Dismiss toast"
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  );
};

export default Toast;
