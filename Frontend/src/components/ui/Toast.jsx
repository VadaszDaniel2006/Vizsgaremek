// src/components/Toast.jsx
import React, { useEffect } from 'react';
import './Toast.css';

export default function Toast({ message, type, onClose }) {
  useEffect(() => {
    // 3 másodperc után automatikusan eltűnik
    const timer = setTimeout(() => {
      onClose();
    }, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={`toast-notification ${type}`}>
      <div className="toast-icon">
        {type === 'success' ? <i className="fas fa-check-circle"></i> : <i className="fas fa-info-circle"></i>}
      </div>
      <div className="toast-message">{message}</div>
      <button className="toast-close" onClick={onClose}>
        <i className="fas fa-times"></i>
      </button>
    </div>
  );
}