import { useEffect } from 'react';

const Modal = ({ isOpen, onClose, title, children, footer }) => {
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="modal-overlay"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          marginBottom: '1.5rem',
        }}>
          <h2
            id="modal-title"
            style={{
              margin: 0,
              fontFamily: 'var(--font-headline)',
              fontSize: '1.125rem',
              fontWeight: 800,
              color: 'var(--on-surface)',
              letterSpacing: '-0.01em',
            }}
          >
            {title}
          </h2>
          <button
            onClick={onClose}
            aria-label="Close modal"
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '0.375rem',
              borderRadius: '0.5rem',
              color: 'var(--outline)',
              display: 'flex',
              alignItems: 'center',
              transition: 'background 0.15s, color 0.15s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'var(--surface-container)';
              e.currentTarget.style.color = 'var(--on-surface)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'none';
              e.currentTarget.style.color = 'var(--outline)';
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '1.25rem' }}>close</span>
          </button>
        </div>

        {/* Body */}
        <div style={{ color: 'var(--on-surface-variant)', lineHeight: 1.65 }}>
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div style={{
            display: 'flex', gap: '0.75rem',
            justifyContent: 'flex-end',
            marginTop: '1.75rem',
            paddingTop: '1.25rem',
            borderTop: '1px solid var(--outline-variant)',
          }}>
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

export default Modal;
