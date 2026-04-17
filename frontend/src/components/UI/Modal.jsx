import { useEffect } from 'react';
import Button from './Button.jsx';

const Modal = ({ isOpen, onClose, title, children, footer }) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="modal-title">
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
          <h2 id="modal-title" style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700 }}>{title}</h2>
          <button
            onClick={onClose}
            style={{
              background: 'none', border: 'none', color: '#94a3b8',
              cursor: 'pointer', fontSize: '1.25rem', padding: '0.25rem',
              borderRadius: '0.375rem', transition: 'color 0.2s',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
            aria-label="Close modal"
          >
            ✕
          </button>
        </div>
        <div>{children}</div>
        {footer && (
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

export default Modal;
