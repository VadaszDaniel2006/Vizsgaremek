import React, { useState, useEffect } from 'react';
import './ProfileEditor.css';

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

export default function ProfileEditor({ user, onClose, onSave }) {
    const [formData, setFormData] = useState({
        name: user.name || '',
        username: user.username || '',
        avatar: user.avatar || 'https://via.placeholder.com/150',
        favoriteCategories: user.favoriteCategories || []
    });

    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    // --- ÚJ: JELSZÓ LÁTHATÓSÁG ÁLLAPOTOK ---
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const [previewImage, setPreviewImage] = useState(user.avatar || 'https://via.placeholder.com/150');
    const [isLoading, setIsLoading] = useState(false);
    const [statusMessage, setStatusMessage] = useState({ type: '', text: '' });

    useEffect(() => {
        if (statusMessage.text && statusMessage.type === 'error') {
            const timer = setTimeout(() => setStatusMessage({ type: '', text: '' }), 4000);
            return () => clearTimeout(timer);
        }
    }, [statusMessage]);

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) { 
                setStatusMessage({ type: 'error', text: '⚠️ A kép túl nagy! (Max 5MB)' });
                return;
            }
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewImage(reader.result);
                setFormData(prev => ({ ...prev, avatar: reader.result }));
                setStatusMessage({ type: '', text: '' }); 
            };
            reader.readAsDataURL(file);
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const toggleCategory = (catId) => {
        let newCategories = [...formData.favoriteCategories];
        if (newCategories.includes(catId)) {
            newCategories = newCategories.filter(id => id !== catId);
        } else {
            if (newCategories.length < 5) {
                newCategories.push(catId);
                setStatusMessage({ type: '', text: '' }); 
            } else {
                setStatusMessage({ type: 'error', text: '⚠️ Legfeljebb 5 kategóriát választhatsz!' });
            }
        }
        setFormData({ ...formData, favoriteCategories: newCategories });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (formData.favoriteCategories.length === 0) {
            setStatusMessage({ type: 'error', text: '⚠️ Legalább egy kategóriát kötelező kiválasztani!' });
            return; 
        }

        if (newPassword || currentPassword) {
            if (!currentPassword) {
                setStatusMessage({ type: 'error', text: '⚠️ Az új jelszó beállításához meg kell adnod a jelenlegit!' });
                return;
            }
            if (newPassword.length < 6) {
                setStatusMessage({ type: 'error', text: '⚠️ Az új jelszónak legalább 6 karakternek kell lennie!' });
                return;
            }
            if (newPassword !== confirmPassword) {
                setStatusMessage({ type: 'error', text: '⚠️ A két új jelszó nem egyezik meg!' });
                return;
            }
        }

        setIsLoading(true);
        setStatusMessage({ type: '', text: '' });

        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:5000/api/auth/update-profile', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    name: formData.name,
                    username: formData.username,
                    avatar: formData.avatar,
                    favoriteCategories: formData.favoriteCategories,
                    currentPassword: currentPassword || undefined,
                    newPassword: newPassword || undefined
                })
            });

            const data = await response.json();

            if (response.ok) {
                setStatusMessage({ type: 'success', text: '✅ Profil sikeresen mentve!' });
                onSave(data.user); 
                
                setTimeout(() => {
                    onClose();
                }, 1500);
            } else {
                setStatusMessage({ type: 'error', text: `❌ ${data.message || 'Hiba történt a mentéskor.'}` });
            }
        } catch (error) {
            console.error("Hiba:", error);
            setStatusMessage({ type: 'error', text: '❌ Nem sikerült kapcsolódni a szerverhez.' });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="profile-modal-overlay" onClick={onClose}>
            <div className="profile-modal-content" onClick={e => e.stopPropagation()}>
                
                <div className="profile-modal-header">
                    <h3><i className="fas fa-user-edit"></i> Profil szerkesztése</h3>
                    <button className="profile-close-modal" onClick={onClose}>&times;</button>
                </div>

                <div className="profile-modal-body">
                    
                    {statusMessage.text && (
                        <div style={{
                            padding: '15px', borderRadius: '8px', marginBottom: '20px', textAlign: 'center',
                            fontWeight: 'bold', fontSize: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
                            backgroundColor: statusMessage.type === 'error' ? 'rgba(231, 76, 60, 0.2)' : 'rgba(46, 204, 113, 0.2)',
                            color: statusMessage.type === 'error' ? '#ff6b6b' : '#2ecc71',
                            border: `1px solid ${statusMessage.type === 'error' ? '#ff6b6b' : '#2ecc71'}`,
                            boxShadow: '0 4px 15px rgba(0,0,0,0.3)', animation: 'slideIn 0.3s ease-out'
                        }}>
                            {statusMessage.text}
                        </div>
                    )}

                    <div style={{ display: 'flex', gap: '30px', flexWrap: 'wrap' }}>
                        
                        {/* BAL OLDAL: AVATAR */}
                        <div style={{ flex: '1', minWidth: '250px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                            <div style={{ position: 'relative', width: '180px', height: '180px', marginBottom: '15px' }}>
                                <img 
                                    src={previewImage} 
                                    alt="Profilkép" 
                                    style={{ 
                                        width: '100%', height: '100%', borderRadius: '50%', 
                                        objectFit: 'cover', border: '4px solid #3e50ff', 
                                        boxShadow: '0 0 20px rgba(62, 80, 255, 0.3)'
                                    }}
                                />
                                <label htmlFor="avatar-upload" style={{ 
                                    position: 'absolute', bottom: '10px', right: '10px', 
                                    background: '#3e50ff', color: 'white', width: '40px', height: '40px', borderRadius: '50%', 
                                    display: 'flex', justifyContent: 'center', alignItems: 'center', cursor: 'pointer', boxShadow: '0 5px 15px rgba(0,0,0,0.5)',
                                    transition: 'transform 0.2s'
                                }} title="Kép módosítása">
                                    <i className="fas fa-camera"></i>
                                </label>
                                <input id="avatar-upload" type="file" accept="image/*" style={{ display: 'none' }} onChange={handleImageChange} />
                            </div>
                            <p style={{ color: '#aaa', fontSize: '0.9rem' }}>Kattints a kamera ikonra a cseréhez</p>
                        </div>

                        {/* JOBB OLDAL: INPUTOK */}
                        <div style={{ flex: '2', minWidth: '300px' }}>
                            <h4 style={{ marginBottom: '15px', color: 'white', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '10px' }}>
                                <i className="fas fa-info-circle"></i> Személyes adatok
                            </h4>
                            
                            <div className="profile-input-group">
                                <label>Teljes név</label>
                                <input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="Pl. Kiss János" />
                            </div>

                            <div className="profile-input-group">
                                <label>Felhasználónév</label>
                                <input type="text" name="username" value={formData.username} onChange={handleChange} placeholder="Pl. kissjanos99" />
                            </div>

                            {/* --- JELSZÓ MÓDOSÍTÁSA SZEKCIÓ --- */}
                            <h4 style={{ marginTop: '25px', marginBottom: '15px', color: 'white', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '10px' }}>
                                <i className="fas fa-lock"></i> Jelszó módosítása <span style={{fontSize: '0.8rem', color: '#888'}}>(Opcionális)</span>
                            </h4>
                            
                            {/* JELENLEGI JELSZÓ */}
                            <div className="profile-input-group">
                                <label>Jelenlegi jelszó</label>
                                <div style={{ position: 'relative' }}>
                                    <input 
                                        type={showCurrentPassword ? "text" : "password"} 
                                        value={currentPassword} 
                                        onChange={(e) => setCurrentPassword(e.target.value)} 
                                        placeholder="Ide írd a régit, ha módosítani akarod..." 
                                        style={{ width: '100%', paddingRight: '45px', boxSizing: 'border-box' }}
                                    />
                                    <button 
                                        type="button" 
                                        onClick={() => setShowCurrentPassword(!showCurrentPassword)} 
                                        style={{ position: 'absolute', right: '15px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: '1.2rem', padding: 0 }}
                                        tabIndex="-1"
                                    >
                                        <i className={showCurrentPassword ? "fas fa-eye-slash" : "fas fa-eye"}></i>
                                    </button>
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                                {/* ÚJ JELSZÓ */}
                                <div className="profile-input-group">
                                    <label>Új jelszó</label>
                                    <div style={{ position: 'relative' }}>
                                        <input 
                                            type={showNewPassword ? "text" : "password"} 
                                            value={newPassword} 
                                            onChange={(e) => setNewPassword(e.target.value)} 
                                            disabled={!currentPassword}
                                            style={{ width: '100%', paddingRight: '45px', boxSizing: 'border-box' }}
                                        />
                                        <button 
                                            type="button" 
                                            onClick={() => setShowNewPassword(!showNewPassword)} 
                                            disabled={!currentPassword}
                                            style={{ position: 'absolute', right: '15px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: currentPassword ? '#94a3b8' : '#555', cursor: currentPassword ? 'pointer' : 'default', fontSize: '1.2rem', padding: 0 }}
                                            tabIndex="-1"
                                        >
                                            <i className={showNewPassword ? "fas fa-eye-slash" : "fas fa-eye"}></i>
                                        </button>
                                    </div>
                                </div>
                                
                                {/* ÚJ JELSZÓ ÚJRA */}
                                <div className="profile-input-group">
                                    <label>Új jelszó újra</label>
                                    <div style={{ position: 'relative' }}>
                                        <input 
                                            type={showConfirmPassword ? "text" : "password"} 
                                            value={confirmPassword} 
                                            onChange={(e) => setConfirmPassword(e.target.value)} 
                                            disabled={!currentPassword} 
                                            style={{ width: '100%', paddingRight: '45px', boxSizing: 'border-box' }}
                                        />
                                        <button 
                                            type="button" 
                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)} 
                                            disabled={!currentPassword}
                                            style={{ position: 'absolute', right: '15px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: currentPassword ? '#94a3b8' : '#555', cursor: currentPassword ? 'pointer' : 'default', fontSize: '1.2rem', padding: 0 }}
                                            tabIndex="-1"
                                        >
                                            <i className={showConfirmPassword ? "fas fa-eye-slash" : "fas fa-eye"}></i>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* KATEGÓRIÁK */}
                    <div style={{ marginTop: '30px' }}>
                        <h4 style={{ marginBottom: '15px', color: 'white', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '10px' }}>
                            <i className="fas fa-heart" style={{color: '#ff4b4b'}}></i> Kedvenc kategóriák 
                        </h4>
                        
                        <div className="categories-grid">
                            {CATEGORIES.map(cat => (
                                <div 
                                    key={cat.id} 
                                    className={`category-item ${formData.favoriteCategories.includes(cat.id) ? 'selected' : ''}`}
                                    onClick={() => toggleCategory(cat.id)}
                                >
                                    <span style={{ fontSize: '1.2rem', marginRight: '8px' }}>{cat.icon}</span>
                                    <span>{cat.name}</span>
                                    {formData.favoriteCategories.includes(cat.id) && (
                                        <i className="fas fa-check" style={{ marginLeft: 'auto', color: '#3e50ff' }}></i>
                                    )}
                                </div>
                            ))}
                        </div>

                        <div style={{ 
                            marginTop: '15px', textAlign: 'right', color: '#ccc', fontSize: '1rem', display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '8px'
                        }}>
                             <i className="fas fa-check-circle" style={{ 
                                 color: formData.favoriteCategories.length >= 1 && formData.favoriteCategories.length <= 5 ? '#2ecc71' : '#ff6b6b' 
                             }}></i>
                            Kiválasztva: 
                            <span style={{ 
                                color: 'white', fontWeight: 'bold', fontSize: '1.2rem', background: formData.favoriteCategories.length === 0 ? 'rgba(255, 107, 107, 0.2)' : 'rgba(62, 80, 255, 0.2)',
                                padding: '2px 10px', borderRadius: '4px', border: `1px solid ${formData.favoriteCategories.length === 0 ? '#ff6b6b' : 'rgba(62, 80, 255, 0.5)'}`
                            }}>
                                {formData.favoriteCategories.length}
                            </span> 
                            <span style={{ color: '#888' }}>/ 5</span>
                        </div>
                    </div>

                    {/* GOMBOK */}
                    <div className="modal-actions">
                        <button type="button" style={{ 
                            background: 'transparent', border: '1px solid #444', color: '#ccc', 
                            padding: '12px 25px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' 
                        }} onClick={onClose}>
                            Mégse
                        </button>
                        <button type="button" className="btn-save" onClick={handleSubmit} disabled={isLoading}>
                            {isLoading ? (
                                <>
                                    <i className="fas fa-spinner fa-spin"></i> Mentés...
                                </>
                            ) : (
                                <>
                                    <i className="fas fa-save"></i> Változtatások mentése
                                </>
                            )}
                        </button>
                    </div>

                </div>
            </div>
            
            <style>{`
                @keyframes slideIn {
                    from { opacity: 0; transform: translateY(-10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </div>
    );
}