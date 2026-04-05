import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './ProfilDropdown.css';

const CATEGORY_NAMES = {
  action: 'Akció', comedy: 'Vígjáték', drama: 'Dráma', scifi: 'Sci-Fi',
  horror: 'Horror', romance: 'Romantikus', animation: 'Animáció',
  thriller: 'Thriller', fantasy: 'Fantasy', docu: 'Dokumentum'
};

export default function ProfilDropdown({ user, onLogout, onOpenProfile, onOpenFavorites, onOpenMyList }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="profil-container" ref={dropdownRef}>

      <div className="profil-btn" onClick={() => setIsOpen(!isOpen)}>
        <div className="profil-avatar-small">
          <img 
            src={user?.avatar || 'https://via.placeholder.com/150'} 
            alt={user?.username || 'User'} 
          />
        </div>
        <span className="profil-name">
            {user?.name || user?.username || 'Felhasználó'}
        </span>
        <i className={`fas fa-chevron-${isOpen ? 'up' : 'down'}`}></i>
      </div>

      {isOpen && (
        <div className="profil-menu">

          <div className="profil-header">
            <div className="profil-avatar-large">
               <img 
                 src={user?.avatar || 'https://via.placeholder.com/150'} 
                 alt={user?.username} 
               />
            </div>
            <div className="profil-info">
                <h4>{user?.name}</h4>
                <p>@{user?.username}</p>

                {user?.role === 'admin' && (
                    <span style={{background: '#e74c3c', color: 'white', fontSize: '0.7rem', padding: '2px 6px', borderRadius: '4px', marginLeft: '5px'}}>
                        ADMIN
                    </span>
                )}
                
                <div className="profil-tags">
                    {user?.favoriteCategories && user.favoriteCategories.slice(0, 2).map((cat, i) => (
                        <span key={i} className="profil-tag">
                            {CATEGORY_NAMES[cat] || cat}
                        </span>
                    ))}
                </div>
            </div>
          </div>


          <div className="profil-menu-items">

            {user?.role === 'admin' && (
                <button 
                    className="menu-item" 
                    onClick={() => {
                        setIsOpen(false);
                        navigate('/admin');
                    }}
                    style={{ borderLeft: '3px solid #e74c3c', background: 'rgba(231, 76, 60, 0.1)' }}
                >
                    <i className="fas fa-shield-alt" style={{color: '#e74c3c'}}></i> Admin Vezérlőpult
                </button>
            )}


            <button className="menu-item" onClick={() => { setIsOpen(false); if (onOpenProfile) onOpenProfile(); }}>
                <i className="fas fa-edit"></i> Profil szerkesztése
            </button>
            
            <button className="menu-item" onClick={() => { setIsOpen(false); if (onOpenFavorites) onOpenFavorites(); }}>
                <i className="fas fa-heart"></i> Kedvenceim
            </button>

            <button className="menu-item" onClick={() => { setIsOpen(false); if (onOpenMyList) onOpenMyList(); }}>
                <i className="fas fa-list"></i> Saját listáim
            </button>

            <div className="menu-divider"></div>

            <button className="menu-item logout" onClick={onLogout}>
                <i className="fas fa-sign-out-alt"></i> Kijelentkezés
            </button>
          </div>
        </div>
      )}
    </div>
  );
}