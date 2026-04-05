import React, { useState } from 'react';
import Toast from '../ui/Toast';
import './AuthModal.css';

const CATEGORIES = [
    { id: 'action', name: 'Akció', icon: '🔥' },
    { id: 'comedy', name: 'Vígjáték', icon: '😂' },
    { id: 'drama', name: 'Dráma', icon: '🎭' },
    { id: 'scifi', name: 'Sci-Fi', icon: '🚀' },
    { id: 'horror', name: 'Horror', icon: '👻' },
    { id: 'romance', name: 'Romantikus', icon: '❤️' },
    { id: 'animation', name: 'Animáció', icon: '🎨' },
    { id: 'thriller', name: 'Thriller', icon: '🔍' },
    { id: 'fantasy', name: 'Fantasy', icon: '🐉' },
    { id: 'docu', name: 'Dokumentum', icon: '📹' }
];

export default function AuthModal({ onClose, onLogin }) {
  const [isRegister, setIsRegister] = useState(false);
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [favoriteCategories, setFavoriteCategories] = useState([]); 
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  const toggleCategory = (catId) => {
    let newCategories = [...favoriteCategories];
    if (newCategories.includes(catId)) {
        newCategories = newCategories.filter(id => id !== catId);
    } else {
        if (newCategories.length < 5) newCategories.push(catId);
    }
    setFavoriteCategories(newCategories);
  };

  const handleDirectForgotPassword = async () => {
      if (!email || !email.includes('@')) {
          setError('Kérlek, előbb írd be a regisztrált email címedet a fenti mezőbe!');
          return;
      }

      setError('');
      setLoading(true);

      try {
          const response = await fetch('http://localhost:5000/api/auth/forgot-password', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ email })
          });

          const data = await response.json();

          if (response.ok) {
              setToast({ message: data.message, type: 'success' });
          } else {
              setError(data.message || 'Hiba történt a jelszóigénylés során.');
          }
      } catch (err) {
          console.error("API Hiba:", err);
          setError("Nem sikerült kapcsolódni a szerverhez.");
      } finally {
          setLoading(false);
      }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (isRegister) {
        if (password !== confirmPassword) {
            setError("A jelszavak nem egyeznek!");
            setLoading(false);
            return;
        }
        if (password.length < 6) {
            setError("A jelszónak legalább 6 karakternek kell lennie!");
            setLoading(false);
            return;
        }
        if (favoriteCategories.length === 0) {
             setError("Válassz legalább 1 kedvenc kategóriát!");
             setLoading(false);
             return;
        }
    }

    try {
        const API_URL = 'http://localhost:5000/api/auth';

        if (isRegister) {
            const response = await fetch(`${API_URL}/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, password, username, favoriteCategories })
            });

            const data = await response.json();

            if (response.ok) {
                setToast({ message: data.message || "Sikeres regisztráció! Most már bejelentkezhetsz.", type: 'success' });
                setIsRegister(false); 
                setError('');
                setPassword('');
                setConfirmPassword('');
                setShowPassword(false);
                setShowConfirmPassword(false);
            } else {
                setError(data.message || "Hiba történt a regisztrációkor.");
            }
        } 
        else {
            const response = await fetch(`${API_URL}/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();

            if (response.ok) {
                onLogin(data);
                onClose();
            } else {
                setError(data.message || "Hibás email vagy jelszó.");
            }
        }

    } catch (err) {
        console.error("API Hiba:", err);
        setError("Nem sikerült kapcsolódni a szerverhez.");
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="modal active auth-overlay" onClick={onClose}>
      <div className="modal-content auth-card" onClick={(e) => e.stopPropagation()}>
        
        {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

        <button className="close-auth" onClick={onClose}>
            <i className="fas fa-times"></i>
        </button>

        <div className="auth-header">
          <h2>{isRegister ? 'Fiók létrehozása' : 'Üdvözlünk újra!'}</h2>
          <p>{isRegister ? 'Regisztrálj a korlátlan filmezéshez.' : 'Jelentkezz be a folytatáshoz.'}</p>
        </div>

        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          
          {isRegister && (
            <>
                <div className="input-group">
                    <input type="text" placeholder=" " value={name} onChange={(e) => setName(e.target.value)} required />
                    <label>Teljes név</label>
                </div>

                <div className="input-group">
                    <input type="text" placeholder=" " value={username} onChange={(e) => setUsername(e.target.value)} required />
                    <label>Felhasználónév</label>
                </div>
            </>
          )}

          <div className="input-group">
            <input type="email" placeholder=" " value={email} onChange={(e) => setEmail(e.target.value)} required />
            <label>Email cím</label>
          </div>

          <div className="input-group" style={{ position: 'relative' }}>
            <input 
              type={showPassword ? "text" : "password"} 
              placeholder=" " 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required={!isRegister ? true : false} 
              style={{ paddingRight: '45px' }}
            />
            <label>Jelszó</label>
            <button 
                type="button" 
                onClick={() => setShowPassword(!showPassword)} 
                style={{ position: 'absolute', right: '15px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: '1.2rem', padding: 0, zIndex: 10 }}
                tabIndex="-1"
            >
                <i className={showPassword ? "fas fa-eye-slash" : "fas fa-eye"}></i>
            </button>
          </div>

          {!isRegister && (
              <div style={{ textAlign: 'right', marginTop: '-10px', marginBottom: '15px' }}>
                  <span 
                      style={{ fontSize: '0.85rem', color: '#94a3b8', cursor: 'pointer', transition: 'color 0.2s' }} 
                      onClick={handleDirectForgotPassword}
                      onMouseEnter={(e) => e.target.style.color = 'white'}
                      onMouseLeave={(e) => e.target.style.color = '#94a3b8'}
                  >
                      {loading ? 'Küldés...' : 'Elfelejtetted a jelszavad?'}
                  </span>
              </div>
          )}

          {isRegister && (
            <div className="input-group" style={{ position: 'relative' }}>
              <input 
                type={showConfirmPassword ? "text" : "password"} 
                placeholder=" " 
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required={isRegister}
                style={{ paddingRight: '45px' }}
              />
              <label>Jelszó megerősítése</label>
              <button 
                  type="button" 
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)} 
                  style={{ position: 'absolute', right: '15px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: '1.2rem', padding: 0, zIndex: 10 }}
                  tabIndex="-1"
              >
                  <i className={showConfirmPassword ? "fas fa-eye-slash" : "fas fa-eye"}></i>
              </button>
            </div>
          )}

          {isRegister && (
             <div className="form-section" style={{textAlign: 'left', marginTop: '20px', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '15px'}}>
                <h4 style={{fontSize: '1rem', marginBottom: '10px', color: '#ddd'}}>Kedvenc kategóriák (min. 1)</h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                    {CATEGORIES.map(cat => (
                        <div 
                            key={cat.id}
                            onClick={() => toggleCategory(cat.id)}
                            style={{
                                padding: '8px', 
                                border: `1px solid ${favoriteCategories.includes(cat.id) ? '#3e50ff' : '#444'}`,
                                borderRadius: '6px',
                                background: favoriteCategories.includes(cat.id) ? 'rgba(62, 80, 255, 0.2)' : 'rgba(255,255,255,0.05)',
                                cursor: 'pointer',
                                textAlign: 'center',
                                fontSize: '0.8rem',
                                color: 'white',
                                transition: '0.2s'
                            }}
                        >
                            {cat.icon} {cat.name}
                        </div>
                    ))}
                </div>
            </div>
          )}

          <button type="submit" className="btn-submit-auth" style={{marginTop: '20px'}} disabled={loading}>
            {loading ? 'Folyamatban...' : (isRegister ? 'Regisztráció' : 'Bejelentkezés')}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            {isRegister ? "Már van fiókod?" : "Még nincs fiókod?"}
            <span onClick={() => { setIsRegister(!isRegister); setError(''); }}>
              {isRegister ? " Lépj be itt" : " Regisztrálj most"}
            </span>
          </p>
        </div>

      </div>
    </div>
  );
}