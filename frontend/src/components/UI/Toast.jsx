import { useState, useCallback, useEffect } from 'react';

let toastListeners = [];
let toastId = 0;

export const showToast = (message, type = 'info', duration = 3500) => {
  const id = ++toastId;
  toastListeners.forEach((cb) => cb({ id, message, type, duration }));
  return id;
};

const CONFIG = {
  success: {
    icon: 'check_circle',
    accent: '#22c55e',
    bg: 'rgba(34,197,94,0.08)',
    iconColor: '#16a34a',
  },
  error: {
    icon: 'error',
    accent: 'var(--error)',
    bg: 'var(--error-container)',
    iconColor: 'var(--error)',
  },
  warning: {
    icon: 'warning',
    accent: '#f59e0b',
    bg: 'rgba(245,158,11,0.1)',
    iconColor: '#d97706',
  },
  info: {
    icon: 'info',
    accent: 'var(--primary)',
    bg: 'var(--primary-fixed)',
    iconColor: 'var(--primary)',
  },
};

const Toast = () => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((toast) => {
    setToasts((prev) => [...prev, toast]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== toast.id));
    }, toast.duration || 3500);
  }, []);

  // Register listener
  useEffect(() => {
    toastListeners.push(addToast);
    return () => {
      toastListeners = toastListeners.filter((l) => l !== addToast);
    };
  }, [addToast]);

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
        gap: '0.625rem',
        maxWidth: '360px',
        width: 'calc(100vw - 3rem)',
      }}
      aria-live="polite"
    >
      {toasts.map((toast) => {
        const cfg = CONFIG[toast.type] || CONFIG.info;
        return (
          <div
            key={toast.id}
            className="toast-enter"
            style={{
              background: 'var(--surface-container-lowest)',
              border: `1px solid var(--outline-variant)`,
              borderLeft: `4px solid ${cfg.accent}`,
              borderRadius: '0.75rem',
              padding: '0.875rem 1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
            }}
          >
            {/* Icon bubble */}
            <div style={{
              width: '2.25rem', height: '2.25rem',
              borderRadius: '50%',
              background: cfg.bg,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
            }}>
              <span className="material-symbols-outlined" style={{ fontSize: '1.125rem', color: cfg.iconColor, fontVariationSettings: "'FILL' 1" }}>
                {cfg.icon}
              </span>
            </div>

            {/* Message */}
            <span style={{
              flex: 1,
              fontSize: '0.875rem',
              fontWeight: 500,
              color: 'var(--on-surface)',
              lineHeight: 1.5,
            }}>
              {toast.message}
            </span>

            {/* Dismiss */}
            <button
              onClick={() => dismiss(toast.id)}
              aria-label="Dismiss"
              style={{
                background: 'none', border: 'none',
                cursor: 'pointer', padding: '0.25rem',
                color: 'var(--outline)',
                borderRadius: '0.375rem',
                display: 'flex', alignItems: 'center',
                transition: 'background 0.15s',
                flexShrink: 0,
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'var(--surface-container)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '1rem' }}>close</span>
            </button>
          </div>
        );
      })}
    </div>
  );
};

export default Toast;
