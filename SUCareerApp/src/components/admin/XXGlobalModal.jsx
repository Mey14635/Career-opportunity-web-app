import { X } from 'lucide-react';
import { NAVY } from '../../pages/admin/constants';

/**
 * Global confirmation modal.
 * @param {boolean} isOpen - controls visibility
 * @param {object} config - { title, message, type } (type = 'primary' or 'danger')
 * @param {function} onClose - closes the modal (cancel or backdrop click)
 * @param {function} onConfirm - called when user clicks "Confirm Action"
 */
export default function Modal({ isOpen, config, onClose, onConfirm }) {
  if (!isOpen) return null;

  // Close modal when clicking on the dark background
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <div
      onClick={handleBackdropClick}
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.6)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
      }}
    >
      <div
        style={{
          backgroundColor: '#ffffff',
          width: '100%',
          maxWidth: '440px',
          borderRadius: '12px',
          overflow: 'hidden',
          boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
          borderTop: `4px solid ${config.type === 'danger' ? '#ef4444' : NAVY}`,
        }}
      >
        {/* Header & Body */}
        <div style={{ padding: '24px 32px' }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              marginBottom: '16px',
            }}
          >
            <h3
              style={{
                margin: 0,
                fontSize: '18px',
                fontWeight: '700',
                color: config.type === 'danger' ? '#dc2626' : '#0f172a',
              }}
            >
              {config.title}
            </h3>
            <button
              onClick={onClose}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '4px',
                margin: '-4px -4px 0 0',
              }}
            >
              <X size={20} color="#94a3b8" />
            </button>
          </div>
          <p
            style={{
              margin: 0,
              color: '#475569',
              lineHeight: '1.6',
              fontSize: '14px',
            }}
          >
            {config.message}
          </p>
        </div>

        {/* Footer Actions */}
        <div
          style={{
            padding: '16px 32px',
            backgroundColor: '#f8fafc',
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '12px',
            borderTop: '1px solid #e2e8f0',
          }}
        >
          <button
            onClick={onClose}
            style={{
              padding: '8px 16px',
              borderRadius: '8px',
              border: '1px solid #cbd5e1',
              backgroundColor: '#ffffff',
              color: '#475569',
              fontSize: '13px',
              fontWeight: '600',
              cursor: 'pointer',
            }}
          >
            Cancel
          </button>
          <button
            onClick={() => onConfirm && onConfirm()}
            style={{
              padding: '8px 16px',
              borderRadius: '8px',
              border: 'none',
              backgroundColor: config.type === 'danger' ? '#dc2626' : NAVY,
              color: '#ffffff',
              fontSize: '13px',
              fontWeight: '600',
              cursor: 'pointer',
            }}
          >
            Confirm Action
          </button>
        </div>
      </div>
    </div>
  );
}