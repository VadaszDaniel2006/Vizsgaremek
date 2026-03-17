// src/components/ConfirmModal.jsx
import React from 'react';
import './ConfirmModal.css';

export default function ConfirmModal({ isOpen, onClose, onConfirm, title, message }) {
  if (!isOpen) return null;

  return (
    <div className="modal active confirm-overlay" onClick={onClose}>
      <div className="modal-content confirm-card" onClick={(e) => e.stopPropagation()}>
        <div className="confirm-icon">
            <i className="fas fa-exclamation-triangle"></i>
        </div>
        <h3>{title}</h3>
        <p>{message}</p>
        
        <div className="confirm-actions">
          <button className="btn-cancel" onClick={onClose}>Mégse</button>
          <button className="btn-confirm" onClick={onConfirm}>Igen</button>
        </div>
      </div>
    </div>
  );
}