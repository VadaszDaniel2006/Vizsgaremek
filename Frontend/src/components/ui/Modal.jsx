// src/components/Modal.jsx
import React, { useEffect } from 'react';
import './Modal.css';

export default function Modal({ videoId, onClose }) {
  
  useEffect(() => {
    if (videoId) {
      // Mind a body-t, mind a html-t lezárjuk a biztos siker érdekében
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
      document.documentElement.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
      document.documentElement.style.overflow = 'unset';
    };
  }, [videoId]);

  if (!videoId) return null;

  return (
    <div className="modal" onClick={onClose}>
      {/* Itt a stopPropagation megakadályozza, hogy a belső részre kattintva is bezáródjon */}
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Előzetes</h3>
          <button className="close-modal" onClick={onClose}>
            <i className="fas fa-times"></i>
          </button>
        </div>
        <div className="video-container">
          <iframe
            src={`https://www.youtube.com/embed/${videoId}?autoplay=1`}
            title="YouTube video player"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          ></iframe>
        </div>
      </div>
    </div>
  );
}