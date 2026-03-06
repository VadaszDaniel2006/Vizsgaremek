import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import ConfirmModal from './ConfirmModal';
import Toast from './Toast';

export default function AdminDashboard() {
    const [activeTab, setActiveTab] = useState('users'); 
    
    // Állapotok (State-ek)
    const [users, setUsers] = useState([]);
    const [reportedReviews, setReportedReviews] = useState([]);
    const [mediaList, setMediaList] = useState([]);
    const [error, setError] = useState('');
    const [toast, setToast] = useState(null);
    const [currentUserInfo, setCurrentUserInfo] = useState(null); 

    const [editingUser, setEditingUser] = useState(null);
    const [formData, setFormData] = useState({ email: '', role: 'user', password: '' });
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [userToDelete, setUserToDelete] = useState(null);

    const [showReviewDeleteModal, setShowReviewDeleteModal] = useState(false);
    const [reviewToDelete, setReviewToDelete] = useState(null);

    const [showMediaDeleteModal, setShowMediaDeleteModal] = useState(false);
    const [mediaToDelete, setMediaToDelete] = useState(null);
    const [editingMedia, setEditingMedia] = useState(null);

    const initialMediaForm = { tipus: 'film', cim: '', leiras: '', poszter_url: '', elozetes_url: '', megjelenes_ev_start: '', megjelenes_ev_end: '', evadok_szama: '', hossz_perc: '', alap_rating: 8.0, kategoria_id: 'akcio' };
    const [uploadData, setUploadData] = useState(initialMediaForm);

    // BÁRMI MÓDOSUL, MINDEN FÜLET FRISSÍTÜNK A HÁTTÉRBEN
    const refreshAllData = () => {
        fetchUsers();
        fetchReportedReviews();
        fetchMediaList();
    };

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) setCurrentUserInfo(JSON.parse(storedUser));
        
        // Oldal betöltésekor egyből lekérjük az összes adatot minden fülhöz
        refreshAllData();
    }, []);

    const showNotification = (message, type = 'success') => { setToast({ message, type }); };

    // ==========================================
    // 1. FELHASZNÁLÓK KEZELÉSE
    // ==========================================
    const fetchUsers = async () => {
        const token = localStorage.getItem('token');
        try { 
            const res = await fetch('http://localhost:5000/api/admin/users', { 
                headers: { 'Authorization': `Bearer ${token}` },
                cache: 'no-store' // Megtiltjuk a böngészőnek a régi adatok betöltését!
            }); 
            const data = await res.json(); 
            if (res.ok) { setUsers(data); setError(''); } 
        } catch (err) { setError('Nem sikerült elérni a szervert.'); }
    };

    const handleDeleteUserConfirmed = async () => {
        if (!userToDelete) return; 
        const token = localStorage.getItem('token');
        try { 
            const res = await fetch(`http://localhost:5000/api/admin/users/${userToDelete}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } }); 
            if (res.ok) { 
                setUsers(prev => prev.filter(u => u.id !== userToDelete)); // Azonnali vizuális frissítés
                refreshAllData(); // Háttér szinkronizáció
                showNotification("Felhasználó törölve."); 
            } 
        } catch (err) { showNotification("Szerver hiba.", "error"); }
        setShowDeleteModal(false); setUserToDelete(null);
    };

    const handleUpdateUser = async (e) => {
        e.preventDefault(); 
        const token = localStorage.getItem('token');
        try { 
            const res = await fetch(`http://localhost:5000/api/admin/users/${editingUser.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }, body: JSON.stringify(formData) }); 
            if (res.ok) { 
                setUsers(prev => prev.map(u => u.id === editingUser.id ? { ...u, email: formData.email, role: formData.role } : u)); // Azonnali vizuális frissítés
                setEditingUser(null); 
                refreshAllData();
                showNotification("Sikeres mentés!"); 
            } else { showNotification("Hiba történt!", "error"); } 
        } catch (error) { showNotification("Szerver hiba.", "error"); }
    };

    // ==========================================
    // 2. KOMMENTEK KEZELÉSE
    // ==========================================
    const fetchReportedReviews = async () => {
        const token = localStorage.getItem('token');
        try { 
            const res = await fetch('http://localhost:5000/api/admin/reported-reviews', { 
                headers: { 'Authorization': `Bearer ${token}` },
                cache: 'no-store'
            }); 
            const data = await res.json(); 
            if (res.ok) setReportedReviews(data); 
        } catch (err) { showNotification("Hiba a jelentések lekérésekor.", "error"); }
    };

    const handleDismissReport = async (id) => {
        const token = localStorage.getItem('token');
        try { 
            const res = await fetch(`http://localhost:5000/api/admin/reported-reviews/${id}/dismiss`, { method: 'PUT', headers: { 'Authorization': `Bearer ${token}` } }); 
            if (res.ok) { 
                setReportedReviews(prev => prev.filter(r => r.id !== id)); // Azonnali
                refreshAllData(); 
                showNotification("Jelentés elutasítva."); 
            } 
        } catch (err) { showNotification("Szerver hiba.", "error"); }
    };
    
    const handleDeleteReviewConfirmed = async () => {
        if (!reviewToDelete) return; 
        const token = localStorage.getItem('token');
        try { 
            const res = await fetch(`http://localhost:5000/api/admin/reported-reviews/${reviewToDelete}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } }); 
            if (res.ok) { 
                setReportedReviews(prev => prev.filter(r => r.id !== reviewToDelete)); // Azonnali törlés a listából
                refreshAllData();
                showNotification("Komment véglegesen törölve.", "success"); 
            } else { showNotification("Hiba a komment törlésekor.", "error"); }
        } catch (err) { showNotification("Szerver hiba.", "error"); }
        setShowReviewDeleteModal(false); setReviewToDelete(null);
    };

    // ==========================================
    // 3. TARTALOM (FILM/SOROZAT) KEZELÉSE
    // ==========================================
    const fetchMediaList = async () => {
        const token = localStorage.getItem('token');
        try { 
            const res = await fetch('http://localhost:5000/api/admin/media', { 
                headers: { 'Authorization': `Bearer ${token}` },
                cache: 'no-store'
            }); 
            const data = await res.json(); 
            if (res.ok) setMediaList(data); 
        } catch (err) { showNotification("Hiba a tartalmak lekérésekor.", "error"); }
    };

    const handleUploadSubmit = async (e) => {
        e.preventDefault(); 
        const token = localStorage.getItem('token');
        const url = editingMedia ? `http://localhost:5000/api/admin/media/${editingMedia.id}` : 'http://localhost:5000/api/admin/media';
        const method = editingMedia ? 'PUT' : 'POST';
        try {
            const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }, body: JSON.stringify(uploadData) }); 
            const data = await res.json();
            
            if (res.ok) { 
                if (editingMedia) {
                    // Azonnali vizuális frissítés szerkesztéskor
                    setMediaList(prev => prev.map(m => m.id === editingMedia.id ? { ...m, ...uploadData } : m));
                }
                showNotification(data.message, "success"); 
                setUploadData(initialMediaForm); 
                setEditingMedia(null); 
                refreshAllData(); // Háttérfrissítés mindenhova
            } else { 
                showNotification(data.message || "Hiba a feltöltésnél.", "error"); 
            }
        } catch (err) { showNotification("Szerver hiba a feltöltés során.", "error"); }
    };

    const openEditMediaModal = (media) => {
        setEditingMedia(media);
        setUploadData({ 
            tipus: media.tipus || 'film', cim: media.cim || '', leiras: media.leiras || '', poszter_url: media.poszter_url || '', 
            elozetes_url: media.elozetes_url || '', megjelenes_ev_start: media.megjelenes_ev_start || '', 
            megjelenes_ev_end: media.megjelenes_ev_end || '', evadok_szama: media.evadok_szama || '', 
            hossz_perc: media.hossz_perc || '', alap_rating: media.alap_rating || 8.0, kategoria_id: media.kategoria_id || 'akcio' 
        });
    };

    const handleDeleteMediaConfirmed = async () => {
        if (!mediaToDelete) return; 
        const token = localStorage.getItem('token');
        try { 
            const res = await fetch(`http://localhost:5000/api/admin/media/${mediaToDelete}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } }); 
            if (res.ok) { 
                setMediaList(prev => prev.filter(m => m.id !== mediaToDelete)); // Azonnali törlés a táblázatból
                refreshAllData(); 
                showNotification("Tartalom sikeresen törölve."); 
            } 
        } catch (err) { showNotification("Szerver hiba.", "error"); }
        setShowMediaDeleteModal(false); setMediaToDelete(null);
    };

    // ==========================================
    // RENDERELÉSI FUNKCIÓK (UI)
    // ==========================================
    const renderUsersTab = () => (
        <div style={{ overflowX: 'auto', background: '#161b22', borderRadius: '12px', border: '1px solid #333' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead><tr style={{ background: '#0f152b', borderBottom: '1px solid #333' }}><th style={{ padding: '15px' }}>ID</th><th style={{ padding: '15px' }}>Név / User</th><th style={{ padding: '15px' }}>Email</th><th style={{ padding: '15px' }}>Jogosultság</th><th style={{ padding: '15px', textAlign: 'right' }}>Művelet</th></tr></thead>
                <tbody>{users.map(user => (
                    <tr key={user.id} style={{ borderBottom: '1px solid #222' }}>
                        <td style={{ padding: '15px', color: '#888' }}>{user.id}</td>
                        <td style={{ padding: '15px' }}><div style={{fontWeight:'bold'}}>{user.nev || user.username}</div><div style={{fontSize:'0.8rem', color:'#aaa'}}>@{user.username}</div></td>
                        <td style={{ padding: '15px', color: '#ccc' }}>{user.email}</td>
                        <td style={{ padding: '15px' }}><span style={{ padding: '4px 8px', borderRadius: '4px', fontSize: '0.8rem', background: user.role === 'admin' ? '#e74c3c' : '#3e50ff', color: 'white' }}>{user.role}</span></td>
                        <td style={{ padding: '15px', textAlign: 'right' }}>
                            <div style={{display:'flex', justifyContent:'flex-end', gap:'10px'}}>
                                <button onClick={() => { setEditingUser(user); setFormData({ email: user.email, role: user.role, password: '' }); }} style={{ background: '#f39c12', border: 'none', color: 'white', padding: '8px', borderRadius: '4px', cursor: 'pointer' }}><i className="fas fa-edit"></i></button>
                                <button onClick={() => { setUserToDelete(user.id); setShowDeleteModal(true); }} style={{ background: '#ff4b4b', border: 'none', color: 'white', padding: '8px', borderRadius: '4px', cursor: 'pointer' }}><i className="fas fa-trash"></i></button>
                            </div>
                        </td>
                    </tr>
                ))}</tbody>
            </table>
        </div>
    );

    const renderReportsTab = () => (
        <div style={{ overflowX: 'auto', background: '#161b22', borderRadius: '12px', border: '1px solid #333' }}>
            {reportedReviews.length === 0 ? (
                <div style={{ padding: '40px', textAlign: 'center', color: '#888' }}><i className="fas fa-check-circle" style={{fontSize: '3rem', marginBottom: '15px', color: '#2ecc71'}}></i><h3>Nincsenek jelentett kommentek</h3></div>
            ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead><tr style={{ background: '#0f152b', borderBottom: '1px solid #333' }}><th style={{ padding: '15px' }}>Tartalom / Jelentés oka</th><th style={{ padding: '15px' }}>Kommentelő</th><th style={{ padding: '15px' }}>Vélemény</th><th style={{ padding: '15px', textAlign: 'right' }}>Művelet</th></tr></thead>
                    <tbody>{reportedReviews.map(review => (
                        <tr key={review.id} style={{ borderBottom: '1px solid #222' }}>
                            <td style={{ padding: '15px' }}><div style={{ color: '#3e50ff', fontWeight: 'bold' }}>{review.media_title}</div><div style={{ fontSize: '0.8rem', color: '#e74c3c', marginTop: '5px' }}><i className="fas fa-exclamation-triangle"></i> {review.report_reason || 'Nincs megadva'}</div></td>
                            <td style={{ padding: '15px' }}>@{review.username}</td>
                            <td style={{ padding: '15px', maxWidth: '300px' }}><div style={{ color: '#f1c40f', marginBottom: '5px' }}><i className="fas fa-star"></i> {review.rating}/10</div><div style={{ color: '#ccc', fontStyle: 'italic' }}>"{review.comment}"</div></td>
                            <td style={{ padding: '15px', textAlign: 'right' }}>
                                <div style={{display:'flex', justifyContent:'flex-end', gap:'10px'}}>
                                    <button onClick={() => handleDismissReport(review.id)} style={{ background: '#27ae60', border: 'none', color: 'white', padding: '8px 12px', borderRadius: '4px', cursor: 'pointer' }}><i className="fas fa-check"></i> Elutasít</button>
                                    <button onClick={() => { setReviewToDelete(review.id); setShowReviewDeleteModal(true); }} style={{ background: '#ff4b4b', border: 'none', color: 'white', padding: '8px 12px', borderRadius: '4px', cursor: 'pointer' }}><i className="fas fa-trash"></i> Töröl</button>
                                </div>
                            </td>
                        </tr>
                    ))}</tbody>
                </table>
            )}
        </div>
    );

    const renderManageMediaTab = () => (
        <div style={{ overflowX: 'auto', background: '#161b22', borderRadius: '12px', border: '1px solid #333' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead><tr style={{ background: '#0f152b', borderBottom: '1px solid #333' }}><th style={{ padding: '15px' }}>Poszter</th><th style={{ padding: '15px' }}>Cím</th><th style={{ padding: '15px' }}>Típus / Év</th><th style={{ padding: '15px', textAlign: 'right' }}>Művelet</th></tr></thead>
                <tbody>{mediaList.map(media => (
                    <tr key={media.id} style={{ borderBottom: '1px solid #222' }}>
                        <td style={{ padding: '15px' }}><img src={media.poszter_url} alt="poszter" style={{ width: '40px', height: '60px', objectFit: 'cover', borderRadius: '4px' }} /></td>
                        <td style={{ padding: '15px', fontWeight: 'bold', fontSize: '1.1rem' }}>{media.cim}</td>
                        <td style={{ padding: '15px', color: '#aaa' }}><span style={{ textTransform: 'uppercase', fontSize: '0.8rem', background: '#333', padding: '2px 6px', borderRadius: '4px', marginRight: '8px' }}>{media.tipus}</span>{media.megjelenes_ev_start} {media.megjelenes_ev_end ? `- ${media.megjelenes_ev_end}` : ''}</td>
                        <td style={{ padding: '15px', textAlign: 'right' }}>
                            <div style={{display:'flex', justifyContent:'flex-end', gap:'10px'}}>
                                <button onClick={() => openEditMediaModal(media)} style={{ background: '#f39c12', border: 'none', color: 'white', padding: '8px 12px', borderRadius: '4px', cursor: 'pointer' }}><i className="fas fa-edit"></i></button>
                                <button onClick={() => { setMediaToDelete(media.id); setShowMediaDeleteModal(true); }} style={{ background: '#ff4b4b', border: 'none', color: 'white', padding: '8px 12px', borderRadius: '4px', cursor: 'pointer' }}><i className="fas fa-trash"></i></button>
                            </div>
                        </td>
                    </tr>
                ))}</tbody>
            </table>
        </div>
    );

    const inputStyle = { width:'100%', padding:'10px 15px', background:'#0b0f2b', border:'1px solid #334155', color:'white', borderRadius:'6px', outline: 'none', transition: 'border 0.3s' };
    const labelStyle = { display:'block', marginBottom:'6px', color:'#94a3b8', fontSize: '0.9rem' };
    const reqStar = <span style={{color:'#ef4444'}}>*</span>;

    const renderUploadForm = (isModal = false) => (
        <div style={{ background: '#1f2a48', padding: isModal ? '0' : '30px', borderRadius: '12px', border: isModal ? 'none' : '1px solid #334155' }}>
            {!isModal && <h3 style={{ marginTop: 0, marginBottom: '25px', color: '#fff', fontSize: '1.5rem' }}><i className="fas fa-cloud-upload-alt"></i> Új tartalom hozzáadása</h3>}
            
            <form style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }} onSubmit={handleUploadSubmit}>
                <div><label style={labelStyle}>Típus</label><select value={uploadData.tipus} onChange={(e) => setUploadData({...uploadData, tipus: e.target.value})} style={inputStyle}><option value="film">Film</option><option value="sorozat">Sorozat</option></select></div>
                <div><label style={labelStyle}>Kategória</label><select value={uploadData.kategoria_id} onChange={(e) => setUploadData({...uploadData, kategoria_id: e.target.value})} style={inputStyle}><option value="akcio">Akció</option><option value="vigjatek">Vígjáték</option><option value="drama">Dráma</option><option value="scifi">Sci-Fi</option><option value="horror">Horror</option><option value="krimi">Krimi</option></select></div>
                <div><label style={labelStyle}>Cím {reqStar}</label><input type="text" value={uploadData.cim} onChange={(e) => setUploadData({...uploadData, cim: e.target.value})} style={inputStyle} required /></div>
                <div><label style={labelStyle}>Poszter URL {reqStar}</label><input type="text" value={uploadData.poszter_url} onChange={(e) => setUploadData({...uploadData, poszter_url: e.target.value})} style={inputStyle} required /></div>
                <div style={{ gridColumn: '1 / -1' }}><label style={labelStyle}>Leírás {reqStar}</label><textarea value={uploadData.leiras} onChange={(e) => setUploadData({...uploadData, leiras: e.target.value})} style={{...inputStyle, minHeight: '100px', resize: 'vertical'}} required /></div>

                {uploadData.tipus === 'film' && (
                    <>
                        <div><label style={labelStyle}>Kezdés éve {reqStar}</label><input type="number" value={uploadData.megjelenes_ev_start} onChange={(e) => setUploadData({...uploadData, megjelenes_ev_start: e.target.value})} style={inputStyle} required /></div>
                        <div><label style={labelStyle}>Hossz (perc)</label><input type="number" value={uploadData.hossz_perc} onChange={(e) => setUploadData({...uploadData, hossz_perc: e.target.value})} style={inputStyle} /></div>
                    </>
                )}
                {uploadData.tipus === 'sorozat' && (
                    <>
                        <div><label style={labelStyle}>Kezdés éve {reqStar}</label><input type="number" value={uploadData.megjelenes_ev_start} onChange={(e) => setUploadData({...uploadData, megjelenes_ev_start: e.target.value})} style={inputStyle} required /></div>
                        <div><label style={labelStyle}>Befejezés éve</label><input type="text" placeholder="Üres, ha fut" value={uploadData.megjelenes_ev_end} onChange={(e) => setUploadData({...uploadData, megjelenes_ev_end: e.target.value})} style={inputStyle} /></div>
                        <div><label style={labelStyle}>Évadok száma</label><input type="number" value={uploadData.evadok_szama} onChange={(e) => setUploadData({...uploadData, evadok_szama: e.target.value})} style={inputStyle} /></div>
                    </>
                )}
                <div><label style={labelStyle}>Alap Értékelés</label><input type="number" step="0.1" max="10" min="1" placeholder="8.0" value={uploadData.alap_rating} onChange={(e) => setUploadData({...uploadData, alap_rating: e.target.value})} style={inputStyle} /></div>
                <div><label style={labelStyle}>Előzetes YouTube URL</label><input type="text" value={uploadData.elozetes_url} onChange={(e) => setUploadData({...uploadData, elozetes_url: e.target.value})} style={inputStyle} /></div>

                <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'flex-end', marginTop: '10px', gap: '15px' }}>
                    {isModal && <button type="button" onClick={() => { setEditingMedia(null); setUploadData(initialMediaForm); }} style={{ background: 'transparent', border: '1px solid #475569', color: '#cbd5e1', padding: '12px 24px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>Mégse</button>}
                    <button type="submit" style={{ background: '#3b82f6', border: 'none', color: 'white', padding: '12px 24px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>{isModal ? <><i className="fas fa-save"></i> Frissítés</> : <><i className="fas fa-upload"></i> Feltöltés</>}</button>
                </div>
            </form>
        </div>
    );

    return (
        <div style={{ padding: '40px', maxWidth: '1200px', margin: '80px auto', color: 'white', display: 'flex', flexDirection: 'column', minHeight: '60vh' }}>
            <h1 style={{ textAlign: 'center', marginBottom: '40px' }}>🛡️ Admin Vezérlőpult</h1>

            <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '10px', marginBottom: '30px', borderBottom: '1px solid #334155', paddingBottom: '15px' }}>
                <button onClick={() => setActiveTab('users')} style={{ background: activeTab === 'users' ? '#3e50ff' : '#1e293b', color: 'white', border: 'none', padding: '12px 20px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', transition: '0.2s' }}><i className="fas fa-users"></i> Felhasználók</button>
                <button onClick={() => setActiveTab('reports')} style={{ background: activeTab === 'reports' ? '#f39c12' : '#1e293b', color: 'white', border: 'none', padding: '12px 20px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', transition: '0.2s' }}><i className="fas fa-flag"></i> Jelentett Kommentek</button>
                <button onClick={() => setActiveTab('manageMedia')} style={{ background: activeTab === 'manageMedia' ? '#9b59b6' : '#1e293b', color: 'white', border: 'none', padding: '12px 20px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', transition: '0.2s' }}><i className="fas fa-list"></i> Tartalom Kezelése</button>
                <button onClick={() => { setActiveTab('upload'); setEditingMedia(null); setUploadData(initialMediaForm); }} style={{ background: activeTab === 'upload' ? '#2ecc71' : '#1e293b', color: 'white', border: 'none', padding: '12px 20px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', transition: '0.2s' }}><i className="fas fa-upload"></i> Új Tartalom</button>
            </div>

            {error && <div style={{ background: '#ef4444', padding: '15px', borderRadius: '8px', textAlign: 'center', marginBottom: '20px' }}>{error}</div>}

            {!error && activeTab === 'users' && renderUsersTab()}
            {!error && activeTab === 'reports' && renderReportsTab()}
            {!error && activeTab === 'manageMedia' && renderManageMediaTab()}
            {!error && activeTab === 'upload' && renderUploadForm()}

            <div style={{ marginTop: '50px', display: 'flex', justifyContent: 'center' }}>
                <Link to="/" style={{ textDecoration: 'none' }}>
                    <button style={{ background: '#3e50ff', color: 'white', border: 'none', padding: '14px 28px', borderRadius: '8px', fontSize: '1.1rem', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px', boxShadow: '0 4px 15px rgba(62, 80, 255, 0.4)', transition: 'transform 0.2s' }}
                        onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                        onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
                        <i className="fas fa-home"></i> Vissza a kezdőoldalra
                    </button>
                </Link>
            </div>

            {/* FELHASZNÁLÓ SZERKESZTŐ MODAL */}
            {editingUser && (
                <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.85)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 10000 }}>
                    <div style={{ background: '#1f2a48', padding: '30px', borderRadius: '12px', width: '400px', border: '1px solid #334155', boxShadow: '0 20px 50px rgba(0,0,0,0.5)' }}>
                        <h2 style={{marginTop:0, marginBottom:'20px', color: 'white'}}><i className="fas fa-user-edit"></i> Szerkesztés</h2>
                        <form onSubmit={handleUpdateUser}>
                            <div style={{ marginBottom: '15px' }}><label style={labelStyle}>Email</label><input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} style={inputStyle} required /></div>
                            <div style={{ marginBottom: '15px' }}><label style={labelStyle}>Jogosultság</label><select value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})} style={inputStyle}><option value="user">Felhasználó</option><option value="admin">Admin</option></select></div>
                            <div style={{ marginBottom: '25px' }}><label style={labelStyle}>Új jelszó</label><input type="password" placeholder="Hagyd üresen, ha nem változik..." value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} style={inputStyle} /></div>
                            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                                <button type="button" onClick={() => setEditingUser(null)} style={{ background: 'transparent', border: '1px solid #475569', color: '#cbd5e1', padding: '10px 20px', borderRadius: '6px', cursor: 'pointer' }}>Mégse</button>
                                <button type="submit" style={{ background: '#3b82f6', border: 'none', color: 'white', padding: '10px 20px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>Mentés</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* TARTALOM SZERKESZTŐ MODAL */}
            {editingMedia && (
                <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.85)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 10000 }}>
                    <div style={{ background: '#1f2a48', padding: '30px', borderRadius: '12px', width: '650px', maxWidth: '95%', border: '1px solid #334155', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 20px 50px rgba(0,0,0,0.5)' }}>
                        <h2 style={{marginTop:0, marginBottom:'25px', color: 'white', fontSize: '1.5rem'}}><i className="fas fa-edit"></i> {editingMedia.cim} szerkesztése</h2>
                        {renderUploadForm(true)}
                    </div>
                </div>
            )}

            <ConfirmModal isOpen={showDeleteModal} onClose={() => setShowDeleteModal(false)} onConfirm={handleDeleteUserConfirmed} title="Felhasználó törlése" message="Biztosan véglegesen törölni szeretnéd ezt a felhasználót?" />
            <ConfirmModal isOpen={showReviewDeleteModal} onClose={() => setShowReviewDeleteModal(false)} onConfirm={handleDeleteReviewConfirmed} title="Komment törlése" message="Biztosan véglegesen törölni szeretnéd ezt a jelentett kommentet?" />
            <ConfirmModal isOpen={showMediaDeleteModal} onClose={() => setShowMediaDeleteModal(false)} onConfirm={handleDeleteMediaConfirmed} title="Tartalom törlése" message="Biztosan törölni szeretnéd ezt a filmet/sorozatot? (Minden hozzá tartozó értékelés is törlődik!)" />
            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
        </div>
    );
}