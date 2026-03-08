import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import ConfirmModal from './ConfirmModal';
import Toast from './Toast';

export default function AdminDashboard({ refreshApp }) {
    const [activeTab, setActiveTab] = useState('users'); 
    const [contentSubTab, setContentSubTab] = useState('movies'); 
    
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

    // Bővített űrlap state a platform_id mezővel
    const initialMediaForm = { 
        tipus: 'film', cim: '', leiras: '', poszter_url: '', elozetes_url: '', 
        megjelenes_ev_start: '', megjelenes_ev_end: '', evadok_szama: '', hossz_perc: '', 
        alap_rating: 8.0, kategoria_id: 'akcio', rendezo_nev: '', nemzetiseg_nev: '', platform_id: ''
    };
    const [uploadData, setUploadData] = useState(initialMediaForm);

    const refreshAllData = () => {
        fetchUsers();
        fetchReportedReviews();
        fetchMediaList();
        if (refreshApp) refreshApp();
    };

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) setCurrentUserInfo(JSON.parse(storedUser));
        refreshAllData();
    }, []);

    const showNotification = (message, type = 'success') => { setToast({ message, type }); };

    const fetchUsers = async () => {
        const token = localStorage.getItem('token');
        try { 
            const res = await fetch('http://localhost:5000/api/admin/users', { headers: { 'Authorization': `Bearer ${token}` }, cache: 'no-store' }); 
            const data = await res.json(); 
            if (res.ok) { setUsers(data); setError(''); } 
        } catch (err) { setError('Nem sikerült elérni a szervert.'); }
    };

    const fetchReportedReviews = async () => {
        const token = localStorage.getItem('token');
        try { 
            const res = await fetch('http://localhost:5000/api/admin/reported-reviews', { headers: { 'Authorization': `Bearer ${token}` }, cache: 'no-store' }); 
            const data = await res.json(); 
            if (res.ok) setReportedReviews(data); 
        } catch (err) { showNotification("Hiba a jelentések lekérésekor.", "error"); }
    };

    const fetchMediaList = async () => {
        const token = localStorage.getItem('token');
        try { 
            const res = await fetch('http://localhost:5000/api/admin/media', { headers: { 'Authorization': `Bearer ${token}` }, cache: 'no-store' }); 
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
                showNotification(data.message || "Mentve!", "success"); 
                setUploadData(initialMediaForm); 
                setEditingMedia(null); 
                refreshAllData(); 
                if(!editingMedia) setActiveTab('manageMedia');
            } else { 
                showNotification(data.message || "Hiba a feltöltésnél.", "error"); 
            }
        } catch (err) { showNotification("Szerver hiba a feltöltés során.", "error"); }
    };

    const openEditMediaModal = (media) => {
        setEditingMedia(media);
        setUploadData({ 
            tipus: media.tipus || 'film', 
            cim: media.cim || '', 
            leiras: media.leiras || '', 
            poszter_url: media.poszter_url || '', 
            elozetes_url: media.elozetes_url || '', 
            megjelenes_ev_start: media.megjelenes_ev_start || '', 
            megjelenes_ev_end: media.megjelenes_ev_end || '', 
            evadok_szama: media.evadok_szama || '', 
            hossz_perc: media.hossz_perc || '', 
            alap_rating: media.alap_rating || 8.0, 
            kategoria_id: media.kategoria_id || 'akcio',
            rendezo_nev: media.rendezo_nev || '',
            nemzetiseg_nev: media.nemzetiseg_nev || '',
            platform_id: media.platform_id || '' // Meglévő platform beöltése
        });
    };

    const handleDeleteMediaConfirmed = async () => {
        if (!mediaToDelete) return; 
        const token = localStorage.getItem('token');
        try { 
            const res = await fetch(`http://localhost:5000/api/admin/media/${mediaToDelete}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } }); 
            if (res.ok) { 
                refreshAllData(); 
                showNotification("Tartalom sikeresen törölve."); 
            } 
        } catch (err) { showNotification("Szerver hiba.", "error"); }
        setShowMediaDeleteModal(false); setMediaToDelete(null);
    };

    const handleDeleteReviewConfirmed = async () => {
        if (!reviewToDelete) return; 
        const token = localStorage.getItem('token');
        try { 
            const res = await fetch(`http://localhost:5000/api/admin/reported-reviews/${reviewToDelete}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } }); 
            if (res.ok) { 
                refreshAllData();
                showNotification("Komment véglegesen törölve.", "success"); 
            } else { showNotification("Hiba a komment törlésekor.", "error"); }
        } catch (err) { showNotification("Szerver hiba.", "error"); }
        setShowReviewDeleteModal(false); setReviewToDelete(null);
    };

    const handleDismissReport = async (id) => {
        const token = localStorage.getItem('token');
        try { 
            const res = await fetch(`http://localhost:5000/api/admin/reported-reviews/${id}/dismiss`, { method: 'PUT', headers: { 'Authorization': `Bearer ${token}` } }); 
            if (res.ok) { 
                refreshAllData(); 
                showNotification("Jelentés elutasítva."); 
            } 
        } catch (err) { showNotification("Szerver hiba.", "error"); }
    };

    const handleUpdateUser = async (e) => {
        e.preventDefault(); 
        const token = localStorage.getItem('token');
        try { 
            const res = await fetch(`http://localhost:5000/api/admin/users/${editingUser.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }, body: JSON.stringify(formData) }); 
            if (res.ok) { 
                setEditingUser(null); 
                refreshAllData();
                showNotification("Sikeres mentés!"); 
            } else { showNotification("Hiba történt!", "error"); } 
        } catch (error) { showNotification("Szerver hiba.", "error"); }
    };

    const handleDeleteUserConfirmed = async () => {
        if (!userToDelete) return; 
        const token = localStorage.getItem('token');
        try { 
            const res = await fetch(`http://localhost:5000/api/admin/users/${userToDelete}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } }); 
            if (res.ok) { 
                refreshAllData(); 
                showNotification("Felhasználó törölve."); 
            } 
        } catch (err) { showNotification("Szerver hiba.", "error"); }
        setShowDeleteModal(false); setUserToDelete(null);
    };

    const inputStyle = { width:'100%', padding:'10px 15px', background:'#0b0f2b', border:'1px solid #334155', color:'white', borderRadius:'6px', outline: 'none' };
    const labelStyle = { display:'block', marginBottom:'6px', color:'#94a3b8', fontSize: '0.9rem' };
    const reqStar = <span style={{color:'#ef4444'}}>*</span>;

    const renderUploadForm = (isModal = false) => (
        <form style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }} onSubmit={handleUploadSubmit}>
            <div><label style={labelStyle}>Típus</label><select value={uploadData.tipus} onChange={(e) => setUploadData({...uploadData, tipus: e.target.value})} style={inputStyle}><option value="film">Film</option><option value="sorozat">Sorozat</option></select></div>
            
            {/* PLATFORM VÁLASZTÓ HOZZÁADVA */}
            <div>
                <label style={labelStyle}>Streaming Platform (opcionális)</label>
                <select value={uploadData.platform_id} onChange={(e) => setUploadData({...uploadData, platform_id: e.target.value})} style={inputStyle}>
                    <option value="">Nincs megadva</option>
                    <option value="1">Netflix</option>
                    <option value="2">HBO Max</option>
                    <option value="3">Disney+</option>
                    <option value="4">Prime Video</option>
                    <option value="5">Apple TV+</option>
                </select>
            </div>

            <div><label style={labelStyle}>Kategória</label><select value={uploadData.kategoria_id} onChange={(e) => setUploadData({...uploadData, kategoria_id: e.target.value})} style={inputStyle}><option value="akcio">Akció</option><option value="vigjatek">Vígjáték</option><option value="drama">Dráma</option><option value="scifi">Sci-Fi</option><option value="horror">Horror</option><option value="thriller">Thriller</option><option value="krimi">Krimi</option></select></div>
            
            <div><label style={labelStyle}>Cím {reqStar}</label><input type="text" value={uploadData.cim} onChange={(e) => setUploadData({...uploadData, cim: e.target.value})} style={inputStyle} required /></div>
            
            <div><label style={labelStyle}>Poszter URL {reqStar}</label><input type="text" value={uploadData.poszter_url} onChange={(e) => setUploadData({...uploadData, poszter_url: e.target.value})} style={inputStyle} required /></div>
            <div><label style={labelStyle}>Előzetes URL (YouTube)</label><input type="text" value={uploadData.elozetes_url} onChange={(e) => setUploadData({...uploadData, elozetes_url: e.target.value})} style={inputStyle} /></div>
            
            <div style={{ gridColumn: '1 / -1' }}><label style={labelStyle}>Leírás {reqStar}</label><textarea value={uploadData.leiras} onChange={(e) => setUploadData({...uploadData, leiras: e.target.value})} style={{...inputStyle, minHeight: '100px'}} required /></div>
            
            <div><label style={labelStyle}>Kezdés éve {reqStar}</label><input type="number" value={uploadData.megjelenes_ev_start} onChange={(e) => setUploadData({...uploadData, megjelenes_ev_start: e.target.value})} style={inputStyle} required /></div>
            <div><label style={labelStyle}>Alap Rating (1-10)</label><input type="number" step="0.1" value={uploadData.alap_rating} onChange={(e) => setUploadData({...uploadData, alap_rating: e.target.value})} style={inputStyle} /></div>

            {/* Rendező és Nemzetiség */}
            <div>
                <label style={labelStyle}>Rendező neve (opcionális)</label>
                <input type="text" placeholder="Pl: Christopher Nolan" value={uploadData.rendezo_nev} onChange={(e) => setUploadData({...uploadData, rendezo_nev: e.target.value})} style={inputStyle} />
            </div>
            <div>
                <label style={labelStyle}>Nemzetiség (opcionális)</label>
                <input type="text" placeholder="Pl: Amerikai, Brit" value={uploadData.nemzetiseg_nev} onChange={(e) => setUploadData({...uploadData, nemzetiseg_nev: e.target.value})} style={inputStyle} />
            </div>

            {uploadData.tipus === 'film' && (
                <div style={{ gridColumn: '1 / -1' }}><label style={labelStyle}>Hossz (perc)</label><input type="number" value={uploadData.hossz_perc} onChange={(e) => setUploadData({...uploadData, hossz_perc: e.target.value})} style={{...inputStyle, width: 'calc(50% - 10px)'}} /></div>
            )}

            {uploadData.tipus === 'sorozat' && (
                <>
                    <div><label style={labelStyle}>Befejezés éve</label><input type="text" placeholder="Üres, ha még fut" value={uploadData.megjelenes_ev_end} onChange={(e) => setUploadData({...uploadData, megjelenes_ev_end: e.target.value})} style={inputStyle} /></div>
                    <div><label style={labelStyle}>Évadok száma</label><input type="number" value={uploadData.evadok_szama} onChange={(e) => setUploadData({...uploadData, evadok_szama: e.target.value})} style={inputStyle} /></div>
                </>
            )}

            <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'flex-end', marginTop: '10px', gap: '15px' }}>
                {isModal && <button type="button" onClick={() => { setEditingMedia(null); setUploadData(initialMediaForm); }} style={{ background: 'transparent', border: '1px solid #475569', color: '#cbd5e1', padding: '12px 24px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>Mégse</button>}
                <button type="submit" style={{ background: '#3b82f6', border: 'none', color: 'white', padding: '12px 24px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>{isModal ? <><i className="fas fa-save"></i> Frissítés</> : <><i className="fas fa-upload"></i> Feltöltés</>}</button>
            </div>
        </form>
    );

    return (
        <div style={{ padding: '40px', maxWidth: '1200px', margin: '80px auto', color: 'white', display: 'flex', flexDirection: 'column', minHeight: '60vh' }}>
            <h1 style={{ textAlign: 'center', marginBottom: '40px' }}>🛡️ Admin Vezérlőpult</h1>

            <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '10px', marginBottom: '30px', borderBottom: '1px solid #334155', paddingBottom: '15px' }}>
                <button onClick={() => setActiveTab('users')} style={{ background: activeTab === 'users' ? '#3e50ff' : '#1e293b', color: 'white', border: 'none', padding: '12px 20px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}><i className="fas fa-users"></i> Felhasználók</button>
                <button onClick={() => setActiveTab('reports')} style={{ background: activeTab === 'reports' ? '#f39c12' : '#1e293b', color: 'white', border: 'none', padding: '12px 20px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}><i className="fas fa-flag"></i> Jelentett Kommentek</button>
                <button onClick={() => setActiveTab('manageMedia')} style={{ background: activeTab === 'manageMedia' ? '#9b59b6' : '#1e293b', color: 'white', border: 'none', padding: '12px 20px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}><i className="fas fa-list"></i> Tartalom Kezelése</button>
                <button onClick={() => { setActiveTab('upload'); setEditingMedia(null); setUploadData(initialMediaForm); }} style={{ background: activeTab === 'upload' ? '#2ecc71' : '#1e293b', color: 'white', border: 'none', padding: '12px 20px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}><i className="fas fa-upload"></i> Új Tartalom</button>
            </div>

            {error && <div style={{ background: '#ef4444', padding: '15px', borderRadius: '8px', textAlign: 'center', marginBottom: '20px' }}>{error}</div>}

            {/* FELHASZNÁLÓK FÜL */}
            {!error && activeTab === 'users' && (
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
            )}

            {/* JELENTÉSEK FÜL */}
            {!error && activeTab === 'reports' && (
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
            )}

            {/* TARTALOM KEZELÉSE FÜL */}
            {!error && activeTab === 'manageMedia' && (
                <>
                    <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
                        <button onClick={() => setContentSubTab('movies')} style={{ background: contentSubTab === 'movies' ? '#9b59b6' : '#1e293b', border: 'none', color: 'white', padding: '8px 20px', borderRadius: '20px', cursor: 'pointer' }}>Csak Filmek</button>
                        <button onClick={() => setContentSubTab('series')} style={{ background: contentSubTab === 'series' ? '#9b59b6' : '#1e293b', border: 'none', color: 'white', padding: '8px 20px', borderRadius: '20px', cursor: 'pointer' }}>Csak Sorozatok</button>
                    </div>
                    <div style={{ background: '#161b22', borderRadius: '12px', border: '1px solid #333', overflow: 'hidden' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                            <thead style={{ background: '#0f152b' }}>
                                <tr><th style={{padding:'15px'}}>Poszter</th><th style={{padding:'15px'}}>Cím</th><th style={{padding:'15px'}}>Év</th><th style={{padding:'15px', textAlign:'right'}}>Művelet</th></tr>
                            </thead>
                            <tbody>
                                {mediaList.filter(m => m.tipus === (contentSubTab === 'movies' ? 'film' : 'sorozat')).map(m => (
                                    <tr key={m.id} style={{ borderBottom: '1px solid #222' }}>
                                        <td style={{padding:'15px'}}><img src={m.poszter_url} alt="poszter" style={{width:'40px', height:'60px', objectFit:'cover', borderRadius:'4px'}} /></td>
                                        <td style={{padding:'15px', fontWeight:'bold'}}>{m.cim}</td>
                                        <td style={{padding:'15px', color:'#aaa'}}>{m.megjelenes_ev_start} {m.megjelenes_ev_end && `- ${m.megjelenes_ev_end}`}</td>
                                        <td style={{padding:'15px', textAlign:'right'}}>
                                            <button onClick={() => openEditMediaModal(m)} style={{background:'#f39c12', color:'white', border:'none', padding:'8px 12px', borderRadius:'5px', cursor:'pointer', marginRight:'10px'}}><i className="fas fa-edit"></i></button>
                                            <button onClick={() => { setMediaToDelete(m.id); setShowMediaDeleteModal(true); }} style={{background:'#ff4b4b', color:'white', border:'none', padding:'8px 12px', borderRadius:'5px', cursor:'pointer'}}><i className="fas fa-trash"></i></button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </>
            )}

            {/* ÚJ TARTALOM FELTÖLTÉSE FÜL */}
            {!error && activeTab === 'upload' && (
                <div style={{ background: '#1f2a48', padding: '30px', borderRadius: '12px', border: '1px solid #334155' }}>
                    <h2 style={{ marginBottom: '25px' }}><i className="fas fa-plus-circle"></i> Új tartalom hozzáadása</h2>
                    {renderUploadForm(false)}
                </div>
            )}

            {/* SZERKESZTŐ MODAL */}
            {editingMedia && (
                <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.85)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 10000 }}>
                    <div style={{ background: '#1f2a48', padding: '35px', borderRadius: '15px', width: '700px', border: '1px solid #334155', maxHeight: '90vh', overflowY: 'auto' }}>
                        <h2 style={{marginTop:0, marginBottom:'25px'}}><i className="fas fa-edit"></i> {editingMedia.cim} szerkesztése</h2>
                        {renderUploadForm(true)}
                    </div>
                </div>
            )}

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

            <div style={{ marginTop: '50px', display: 'flex', justifyContent: 'center' }}>
                <Link to="/" style={{ textDecoration: 'none' }}>
                    <button style={{ background: '#3e50ff', color: 'white', border: 'none', padding: '15px 35px', borderRadius: '10px', fontSize: '1.1rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '10px', boxShadow: '0 4px 15px rgba(62, 80, 255, 0.4)', cursor: 'pointer' }}>
                        <i className="fas fa-home"></i> Vissza a kezdőoldalra
                    </button>
                </Link>
            </div>

            <ConfirmModal isOpen={showDeleteModal} onClose={() => setShowDeleteModal(false)} onConfirm={handleDeleteUserConfirmed} title="Felhasználó törlése" message="Biztosan véglegesen törölni szeretnéd ezt a felhasználót?" />
            <ConfirmModal isOpen={showMediaDeleteModal} onClose={() => setShowMediaDeleteModal(false)} onConfirm={handleDeleteMediaConfirmed} title="Törlés" message="Véglegesen törlöd?" />
            <ConfirmModal isOpen={showReviewDeleteModal} onClose={() => setShowReviewDeleteModal(false)} onConfirm={handleDeleteReviewConfirmed} title="Komment törlése" message="Véglegesen törlöd a kommentet?" />
            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
        </div>
    );
}