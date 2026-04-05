import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import ConfirmModal from './ConfirmModal';
import Toast from './Toast';
import './AdminDashboard.css';

export default function AdminDashboard({ refreshApp }) {
    const [activeTab, setActiveTab] = useState('users'); 
    const [contentSubTab, setContentSubTab] = useState('movies'); 
    
    const [users, setUsers] = useState([]);
    const [reportedReviews, setReportedReviews] = useState([]);
    const [mediaList, setMediaList] = useState([]);
    const [mozikList, setMozikList] = useState([]); 
    const [categories, setCategories] = useState([]); 
    const [messages, setMessages] = useState([]); 
    const [error, setError] = useState('');
    const [toast, setToast] = useState(null);

    const [editingUser, setEditingUser] = useState(null);
    const [formData, setFormData] = useState({ email: '', role: 'user', password: '' });
    const [showUserPassword, setShowUserPassword] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [userToDelete, setUserToDelete] = useState(null);

    const [showReviewDeleteModal, setShowReviewDeleteModal] = useState(false);
    const [reviewToDelete, setReviewToDelete] = useState(null);

    const [showMediaDeleteModal, setShowMediaDeleteModal] = useState(false);
    const [mediaToDelete, setMediaToDelete] = useState(null);
    const [editingMedia, setEditingMedia] = useState(null);

    const [showMessageDeleteModal, setShowMessageDeleteModal] = useState(false); 
    const [messageToDelete, setMessageToDelete] = useState(null); 

    const initialMediaForm = { 
        tipus: 'film', cim: '', leiras: '', poszter_url: '', elozetes_url: '', 
        megjelenes_ev_start: '', megjelenes_ev_end: '', evadok_szama: '', hossz_perc: '', 
        alap_rating: 8.0, kategoria_id: '', rendezo_nev: '', nemzetiseg_nev: '', platform_id: '',
        mozi_ids: [] 
    };
    const [uploadData, setUploadData] = useState(initialMediaForm);

    const fetchUsers = async () => {
        const token = localStorage.getItem('token');
        try { 
            const res = await fetch('http://localhost:5000/api/admin/users', { headers: { 'Authorization': `Bearer ${token}` }, cache: 'no-store' }); 
            const data = await res.json(); 
            if (res.ok && Array.isArray(data)) { setUsers(data); setError(''); } 
        } catch (err) { setError('Nem sikerült elérni a szervert.'); }
    };

    const fetchReportedReviews = async () => {
        const token = localStorage.getItem('token');
        try { 
            const res = await fetch('http://localhost:5000/api/admin/reported-reviews', { headers: { 'Authorization': `Bearer ${token}` }, cache: 'no-store' }); 
            const data = await res.json(); 
            if (res.ok && Array.isArray(data)) setReportedReviews(data); 
        } catch (err) { console.error("Hiba a jelentések lekérésekor", err); }
    };

    const fetchMediaList = async () => {
        const token = localStorage.getItem('token');
        try { 
            const res = await fetch('http://localhost:5000/api/admin/media', { headers: { 'Authorization': `Bearer ${token}` }, cache: 'no-store' }); 
            const data = await res.json(); 
            if (res.ok && Array.isArray(data)) setMediaList(data); 
        } catch (err) { console.error("Hiba a tartalmak lekérésekor", err); }
    };

    const fetchMozikList = async () => {
        const token = localStorage.getItem('token');
        try { 
            const res = await fetch('http://localhost:5000/api/admin/mozik', { headers: { 'Authorization': `Bearer ${token}` }, cache: 'no-store' }); 
            const data = await res.json(); 
            if (res.ok && Array.isArray(data)) {
                const uniqueMozik = Array.from(new Map(data.map(m => [m.id, m])).values());
                const cinemaCityMozik = uniqueMozik.filter(mozi => 
                    mozi.nev && mozi.nev.toLowerCase().includes('cinema city')
                );
                setMozikList(cinemaCityMozik); 
            }
        } catch (err) { console.error("Hiba a mozik lekérésekor", err); }
    };

    const fetchCategories = async () => {
        const token = localStorage.getItem('token');
        try { 
            const res = await fetch('http://localhost:5000/api/admin/categories', { headers: { 'Authorization': `Bearer ${token}` }, cache: 'no-store' }); 
            const data = await res.json(); 
            if (res.ok && Array.isArray(data)) setCategories(data); 
        } catch (err) { console.error("Hiba a kategóriák lekérésekor", err); }
    };

    const fetchMessages = async () => {
        const token = localStorage.getItem('token');
        try { 
            const res = await fetch('http://localhost:5000/api/contact/messages', { headers: { 'Authorization': `Bearer ${token}` }, cache: 'no-store' }); 
            const data = await res.json(); 
            if (res.ok && Array.isArray(data)) setMessages(data); 
        } catch (err) { console.error("Hiba az üzenetek lekérésekor", err); }
    };

    const refreshAllData = () => {
        fetchUsers(); fetchReportedReviews(); fetchMediaList(); fetchMozikList(); fetchCategories(); fetchMessages();
        if (refreshApp) refreshApp();
    };

    useEffect(() => { 
        refreshAllData(); 
        
        const interval = setInterval(() => {
            fetchReportedReviews();
            fetchMessages();
        }, 10000);

        const handleFocus = () => {
            fetchReportedReviews();
            fetchMessages();
        };
        window.addEventListener('focus', handleFocus);

        return () => {
            clearInterval(interval);
            window.removeEventListener('focus', handleFocus);
        };
    }, []);

    useEffect(() => {
        if (activeTab === 'users') fetchUsers();
        else if (activeTab === 'reports') fetchReportedReviews();
        else if (activeTab === 'messages') fetchMessages();
        else if (activeTab === 'manageMedia') fetchMediaList();
        else if (activeTab === 'upload') fetchMozikList();
    }, [activeTab]);

    const isAnyModalOpen = editingMedia || editingUser || showDeleteModal || showMediaDeleteModal || showReviewDeleteModal || showMessageDeleteModal;
    useEffect(() => {
        const bgContainer = document.querySelector('.neo-admin-bg');
        if (isAnyModalOpen) {
            if (bgContainer) bgContainer.classList.add('admin-dashboard-modal-open');
            document.body.style.overflow = 'hidden';
            document.documentElement.style.overflow = 'hidden'; 
        } else {
            if (bgContainer) bgContainer.classList.remove('admin-dashboard-modal-open');
            document.body.style.overflow = '';
            document.documentElement.style.overflow = '';
        }
        return () => { 
            if (bgContainer) bgContainer.classList.remove('admin-dashboard-modal-open');
            document.body.style.overflow = ''; 
            document.documentElement.style.overflow = ''; 
        };
    }, [isAnyModalOpen]);

    const showNotification = (message, type = 'success') => { setToast({ message, type }); };

    const handleMarkMessageRead = async (id) => {
        const token = localStorage.getItem('token');
        try { 
            const res = await fetch(`http://localhost:5000/api/contact/messages/${id}/read`, { method: 'PUT', headers: { 'Authorization': `Bearer ${token}` } }); 
            if (res.ok) { fetchMessages(); showNotification("Üzenet olvasottnak jelölve."); } 
        } catch (err) { showNotification("Szerver hiba.", "error"); }
    };

    const handleDeleteMessageConfirmed = async () => {
        if (!messageToDelete) return; 
        const token = localStorage.getItem('token');
        try { 
            const res = await fetch(`http://localhost:5000/api/contact/messages/${messageToDelete}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } }); 
            if (res.ok) { fetchMessages(); showNotification("Üzenet törölve."); } 
        } catch (err) { showNotification("Szerver hiba.", "error"); }
        setShowMessageDeleteModal(false); setMessageToDelete(null);
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
                setUploadData(initialMediaForm); setEditingMedia(null); refreshAllData(); 
                if(!editingMedia) setActiveTab('manageMedia');
            } else { showNotification(data.message || "Hiba a feltöltésnél.", "error"); }
        } catch (err) { showNotification("Szerver hiba a feltöltés során.", "error"); }
    };

    const openEditMediaModal = async (media) => {
        setEditingMedia(media);
        let parsedMoziIds = [];
        if (Array.isArray(media.mozi_ids)) {
            parsedMoziIds = media.mozi_ids;
        } else if (typeof media.mozi_ids === 'string' && media.mozi_ids.trim() !== '') {
            parsedMoziIds = media.mozi_ids.split(',').map(id => parseInt(id.trim(), 10));
        }

        setUploadData({ 
            tipus: media.tipus || 'film', cim: media.cim || '', leiras: media.leiras || '', 
            poszter_url: media.poszter_url || '', elozetes_url: media.elozetes_url || '', 
            megjelenes_ev_start: media.megjelenes_ev_start || '', megjelenes_ev_end: media.megjelenes_ev_end || '', 
            evadok_szama: media.evadok_szama || '', hossz_perc: media.hossz_perc || '', 
            alap_rating: media.alap_rating || 8.0, kategoria_id: media.kategoria_id || '',
            rendezo_nev: media.rendezo_nev || '', nemzetiseg_nev: media.nemzetiseg_nev || '', platform_id: media.platform_id || '',
            mozi_ids: [...new Set(parsedMoziIds)].filter(id => !isNaN(id))
        });

        try {
            const res = await fetch(`http://localhost:5000/api/mozik/${media.id}/mozik`);
            if (res.ok) {
                const liveMozik = await res.json();
                if (Array.isArray(liveMozik) && liveMozik.length > 0) {
                    const liveIds = liveMozik.map(m => parseInt(m.mozi_id || m.id, 10));
                    setUploadData(prev => ({
                        ...prev,
                        mozi_ids: [...new Set([...prev.mozi_ids, ...liveIds])].filter(id => !isNaN(id))
                    }));
                }
            }
        } catch (err) {
            console.error("Hiba az élő mozik lekérésekor:", err);
        }
    };

    const handleDeleteMediaConfirmed = async () => {
        if (!mediaToDelete) return; 
        const token = localStorage.getItem('token');
        try { 
            const res = await fetch(`http://localhost:5000/api/admin/media/${mediaToDelete}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } }); 
            if (res.ok) { refreshAllData(); showNotification("Tartalom sikeresen törölve."); } 
        } catch (err) { showNotification("Szerver hiba.", "error"); }
        setShowMediaDeleteModal(false); setMediaToDelete(null);
    };

    const handleDeleteReviewConfirmed = async () => {
        if (!reviewToDelete) return; 
        const token = localStorage.getItem('token');
        try { 
            const res = await fetch(`http://localhost:5000/api/admin/reported-reviews/${reviewToDelete}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } }); 
            if (res.ok) { refreshAllData(); showNotification("Komment véglegesen törölve.", "success"); } 
            else { showNotification("Hiba a komment törlésekor.", "error"); }
        } catch (err) { showNotification("Szerver hiba.", "error"); }
        setShowReviewDeleteModal(false); setReviewToDelete(null);
    };

    const handleDismissReport = async (id) => {
        const token = localStorage.getItem('token');
        try { 
            const res = await fetch(`http://localhost:5000/api/admin/reported-reviews/${id}/dismiss`, { method: 'PUT', headers: { 'Authorization': `Bearer ${token}` } }); 
            if (res.ok) { refreshAllData(); showNotification("Jelentés elutasítva."); } 
        } catch (err) { showNotification("Szerver hiba.", "error"); }
    };

    const handleUpdateUser = async (e) => {
        e.preventDefault(); 
        const token = localStorage.getItem('token');
        try { 
            const res = await fetch(`http://localhost:5000/api/admin/users/${editingUser.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }, body: JSON.stringify(formData) }); 
            if (res.ok) { 
                setEditingUser(null); refreshAllData();
                showNotification("Sikeres mentés!"); setShowUserPassword(false);
            } else { showNotification("Hiba történt!", "error"); } 
        } catch (error) { showNotification("Szerver hiba.", "error"); }
    };

    const handleDeleteUserConfirmed = async () => {
        if (!userToDelete) return; 
        const token = localStorage.getItem('token');
        try { 
            const res = await fetch(`http://localhost:5000/api/admin/users/${userToDelete}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } }); 
            if (res.ok) { refreshAllData(); showNotification("Felhasználó törölve."); } 
        } catch (err) { showNotification("Szerver hiba.", "error"); }
        setShowDeleteModal(false); setUserToDelete(null);
    };

    const renderUploadForm = (isModal = false) => (
        <form className="neo-form-grid" onSubmit={handleUploadSubmit}>
            <div className="neo-input-group">
                <label><i className="fas fa-film"></i> Típus</label>
                <select value={uploadData.tipus} onChange={(e) => setUploadData({...uploadData, tipus: e.target.value})} className="neo-input">
                    <option value="film">Film</option>
                    <option value="sorozat">Sorozat</option>
                </select>
            </div>
            
            <div className="neo-input-group">
                <label><i className="fas fa-tv"></i> Streaming Platform</label>
                <select value={uploadData.platform_id} onChange={(e) => setUploadData({...uploadData, platform_id: e.target.value})} className="neo-input">
                    <option value="">Nincs megadva (Csak Mozi)</option>
                    <option value="1">Netflix</option>
                    <option value="2">HBO Max (Max)</option>
                    <option value="3">Disney+</option>
                    <option value="4">Prime Video</option>
                    <option value="5">Apple TV+</option>
                    <option value="6">SkyShowtime</option>
                    <option value="7">Filmio</option>
                    <option value="8">RTL+</option>
                </select>
            </div>

            {uploadData.tipus === 'film' && (
                <div className="neo-input-group neo-full-width">
                    <label><i className="fas fa-ticket-alt"></i> Vetítő Mozik (Többet is kiválaszthatsz)</label>
                    <div className="neo-input modern-scrollbar" style={{ maxHeight: '350px', overflowY: 'auto', padding: '15px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', background: 'rgba(0,0,0,0.2)' }}>
                        {mozikList.map(mozi => (
                            <label key={mozi.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontWeight: 'normal', color: '#ccc' }}>
                                <input 
                                    type="checkbox" 
                                    checked={uploadData.mozi_ids?.includes(mozi.id) || uploadData.mozi_ids?.includes(String(mozi.id)) || false}
                                    onChange={(e) => {
                                        const isChecked = e.target.checked;
                                        setUploadData(prev => {
                                            const currentIds = prev.mozi_ids || [];
                                            return {
                                                ...prev,
                                                mozi_ids: isChecked 
                                                    ? [...new Set([...currentIds, mozi.id])] 
                                                    : currentIds.filter(id => id !== mozi.id && id !== String(mozi.id))
                                            };
                                        });
                                    }}
                                    style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                                />
                                {mozi.nev} ({mozi.varos})
                            </label>
                        ))}
                    </div>
                </div>
            )}

            <div className="neo-input-group neo-full-width">
                <label><i className="fas fa-tags"></i> Kategória</label>
                <select 
                    value={uploadData.kategoria_id} 
                    onChange={(e) => setUploadData({...uploadData, kategoria_id: e.target.value})} 
                    className="neo-input"
                    required
                >
                    <option value="">Válassz kategóriát...</option>
                    {categories.map(cat => (
                        <option key={cat.id} value={cat.id}>
                            {cat.nev}
                        </option>
                    ))}
                </select>
            </div>
            
            <div className="neo-input-group neo-full-width">
                <label><i className="fas fa-heading"></i> Cím <span style={{color:'#ef4444'}}>*</span></label>
                <input type="text" value={uploadData.cim} onChange={(e) => setUploadData({...uploadData, cim: e.target.value})} className="neo-input" required />
            </div>

            <div className="neo-input-group neo-full-width">
                <label><i className="fas fa-image"></i> Poszter URL <span style={{color:'#ef4444'}}>*</span></label>
                <input type="text" value={uploadData.poszter_url} onChange={(e) => setUploadData({...uploadData, poszter_url: e.target.value})} className="neo-input" required />
            </div>
            <div className="neo-input-group neo-full-width">
                <label><i className="fab fa-youtube"></i> Előzetes URL (Kód)</label>
                <input type="text" value={uploadData.elozetes_url} onChange={(e) => setUploadData({...uploadData, elozetes_url: e.target.value})} className="neo-input" />
            </div>
            
            <div className="neo-input-group neo-full-width">
                <label><i className="fas fa-align-left"></i> Leírás <span style={{color:'#ef4444'}}>*</span></label>
                <textarea value={uploadData.leiras} onChange={(e) => setUploadData({...uploadData, leiras: e.target.value})} className="neo-input textarea" required />
            </div>

            <div className="neo-input-group">
                <label><i className="far fa-calendar-alt"></i> Kezdés éve <span style={{color:'#ef4444'}}>*</span></label>
                <input type="number" value={uploadData.megjelenes_ev_start} onChange={(e) => setUploadData({...uploadData, megjelenes_ev_start: e.target.value})} className="neo-input neo-input-short" required />
            </div>
            <div className="neo-input-group">
                <label><i className="fas fa-star"></i> Alap Rating (1-10)</label>
                <input type="number" step="0.1" value={uploadData.alap_rating} onChange={(e) => setUploadData({...uploadData, alap_rating: e.target.value})} className="neo-input neo-input-short" />
            </div>

            <div className="neo-input-group neo-full-width">
                <label><i className="fas fa-video"></i> Rendező neve (opcionális)</label>
                <input type="text" placeholder="Pl: Christopher Nolan" value={uploadData.rendezo_nev} onChange={(e) => setUploadData({...uploadData, rendezo_nev: e.target.value})} className="neo-input" />
            </div>
            <div className="neo-input-group neo-full-width">
                <label><i className="fas fa-globe"></i> Nemzetiség (opcionális)</label>
                <input type="text" placeholder="Pl: Amerikai, Brit" value={uploadData.nemzetiseg_nev} onChange={(e) => setUploadData({...uploadData, nemzetiseg_nev: e.target.value})} className="neo-input" />
            </div>

            {uploadData.tipus === 'film' && (
                <div className="neo-input-group">
                    <label><i className="far fa-clock"></i> Hossz (perc)</label>
                    <input type="number" value={uploadData.hossz_perc} onChange={(e) => setUploadData({...uploadData, hossz_perc: e.target.value})} className="neo-input neo-input-short" />
                </div>
            )}
            {uploadData.tipus === 'sorozat' && (
                <>
                    <div className="neo-input-group">
                        <label><i className="far fa-calendar-check"></i> Befejezés éve</label>
                        <input type="text" placeholder="Üres, ha még fut" value={uploadData.megjelenes_ev_end} onChange={(e) => setUploadData({...uploadData, megjelenes_ev_end: e.target.value})} className="neo-input neo-input-short" />
                    </div>
                    <div className="neo-input-group">
                        <label><i className="fas fa-layer-group"></i> Évadok száma</label>
                        <input type="number" value={uploadData.evadok_szama} onChange={(e) => setUploadData({...uploadData, evadok_szama: e.target.value})} className="neo-input neo-input-short" />
                    </div>
                </>
            )}
            <div className="form-actions-row neo-full-width">
                {isModal && <button type="button" onClick={() => { setEditingMedia(null); setUploadData(initialMediaForm); }} className="neo-btn-secondary">Mégse</button>}
                <button type="submit" className="neo-btn-primary">{isModal ? <><i className="fas fa-save"></i> Frissítés</> : <><i className="fas fa-rocket"></i> Közzététel</>}</button>
            </div>
        </form>
    );

    const unreadMessagesCount = Array.isArray(messages) ? messages.filter(m => !m.olvasva).length : 0;
    const reportsCount = Array.isArray(reportedReviews) ? reportedReviews.length : 0;

    return (
        <div className="neo-admin-bg">
            <div className="neo-admin-wrapper">
                
                <div className="neo-header">
                    <h1>Rendszervezérlő</h1>
                    <p>Prémium hozzáférés az adatok kezeléséhez</p>
                </div>

                <div className="neo-nav">
                    <div className={`neo-tab ${activeTab === 'users' ? 'active' : ''}`} onClick={() => setActiveTab('users')}><i className="fas fa-users"></i> Felhasználók</div>
                    
                    <div className={`neo-tab ${activeTab === 'reports' ? 'active' : ''}`} onClick={() => setActiveTab('reports')}>
                        <i className="fas fa-shield-alt"></i> Jelentések
                        {reportsCount > 0 && <span style={{backgroundColor: '#ef4444', color: 'white', borderRadius: '50%', padding: '2px 8px', fontSize: '0.8rem', marginLeft: '8px', fontWeight: 'bold'}}>{reportsCount}</span>}
                    </div>
                    
                    <div className={`neo-tab ${activeTab === 'messages' ? 'active' : ''}`} onClick={() => setActiveTab('messages')}>
                        <i className="fas fa-envelope"></i> Üzenetek 
                        {unreadMessagesCount > 0 && <span style={{backgroundColor: '#ef4444', color: 'white', borderRadius: '50%', padding: '2px 8px', fontSize: '0.8rem', marginLeft: '8px', fontWeight: 'bold'}}>{unreadMessagesCount}</span>}
                    </div>

                    <div className={`neo-tab ${activeTab === 'manageMedia' ? 'active' : ''}`} onClick={() => setActiveTab('manageMedia')}><i className="fas fa-database"></i> Tartalom Kezelése</div>
                    
                    <div className={`neo-tab ${activeTab === 'upload' ? 'active' : ''}`} onClick={() => { setActiveTab('upload'); setEditingMedia(null); setUploadData(initialMediaForm); }}><i className="fas fa-cloud-upload-alt"></i> Új Feltöltés</div>
                </div>

                {error && <div style={{background: 'rgba(239, 68, 68, 0.2)', border: '1px solid #ef4444', color: '#fca5a5', padding: '15px', borderRadius: '12px', textAlign: 'center', marginBottom: '30px', maxWidth: '600px', margin: '0 auto 30px'}}>{error}</div>}

                {!error && activeTab === 'users' && (
                    <div className="neo-card">
                        <table className="neo-table">
                            <thead><tr><th>Azonosító</th><th>Felhasználó</th><th>Email Cím</th><th>Szerepkör</th><th style={{textAlign: 'right'}}>Műveletek</th></tr></thead>
                            <tbody>{users.map(user => (
                                <tr key={user.id}>
                                    <td style={{color: '#8c9eff', fontWeight: 'bold'}}>#{user.id}</td>
                                    <td>
                                        <div className="neo-item-title">{user.nev || user.username}</div>
                                        <div className="neo-item-sub">@{user.username}</div>
                                    </td>
                                    <td>{user.email}</td>
                                    <td><span className={`neo-badge ${user.role === 'admin' ? 'admin' : 'user'}`}>{user.role}</span></td>
                                    <td>
                                        <div className="neo-actions">
                                            <button onClick={() => { setEditingUser(user); setFormData({ email: user.email, role: user.role, password: '' }); }} className="neo-action-btn edit" title="Szerkesztés"><i className="fas fa-pen"></i></button>
                                            <button onClick={() => { setUserToDelete(user.id); setShowDeleteModal(true); }} className="neo-action-btn delete" title="Törlés"><i className="fas fa-trash-alt"></i></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}</tbody>
                        </table>
                    </div>
                )}

                {!error && activeTab === 'reports' && (
                    <div className="neo-card">
                        {reportsCount === 0 ? (
                            <div style={{ padding: '60px', textAlign: 'center', color: '#888' }}>
                                <i className="fas fa-check-circle" style={{fontSize: '5rem', marginBottom: '20px', color: '#2ecc71', filter: 'drop-shadow(0 0 20px rgba(46, 204, 113, 0.4))'}}></i>
                                <h2 style={{color: 'white', marginBottom: '10px', fontSize: '1.8rem'}}>Minden rendben!</h2>
                                <p>Nincsenek új moderálásra váró vélemények a rendszerben.</p>
                            </div>
                        ) : (
                            <table className="neo-table">
                                <thead><tr><th>Jelentett Tartalom</th><th>Érintett (Szerző)</th><th>Jelentette</th><th>Vélemény</th><th style={{textAlign: 'right'}}>Döntés</th></tr></thead>
                                <tbody>{reportedReviews.map(review => (
                                    <tr key={review.id}>
                                        <td>
                                            <div className="neo-item-title" style={{color: '#8c9eff'}}>{review.media_title}</div>
                                            <div className="neo-item-sub" style={{color: '#e74c3c', marginTop: '5px', fontWeight: 'bold'}}><i className="fas fa-exclamation-triangle"></i> Ok: {review.report_reason || 'Nincs megadva'}</div>
                                        </td>
                                        <td><span className="neo-badge tag">@{review.username}</span></td>
                                        <td><span className="neo-badge admin">@{review.reporter_username || 'Ismeretlen'}</span></td>
                                        <td style={{ maxWidth: '350px' }}>
                                            <div style={{ color: '#f5c518', marginBottom: '8px', fontSize: '0.95rem', fontWeight: 'bold' }}><i className="fas fa-star"></i> {review.rating}/10</div>
                                            <div style={{ color: '#ccc', fontStyle: 'italic', lineHeight: 1.6 }}>"{review.comment}"</div>
                                        </td>
                                        <td>
                                            <div className="neo-actions">
                                                <button onClick={() => handleDismissReport(review.id)} className="neo-action-btn approve" title="Rendben van (Jelentés törlése)"><i className="fas fa-check"></i></button>
                                                <button onClick={() => { setReviewToDelete(review.id); setShowReviewDeleteModal(true); }} className="neo-action-btn delete" title="Komment Törlése"><i className="fas fa-trash-alt"></i></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}</tbody>
                            </table>
                        )}
                    </div>
                )}

                {!error && activeTab === 'messages' && (
                    <div className="neo-card">
                        {!messages || messages.length === 0 ? (
                            <div style={{ padding: '60px', textAlign: 'center', color: '#888' }}>
                                <i className="fas fa-inbox" style={{fontSize: '5rem', marginBottom: '20px', color: '#4b5563'}}></i>
                                <h2 style={{color: 'white', marginBottom: '10px', fontSize: '1.8rem'}}>Üres az Inboxod</h2>
                                <p>Jelenleg nincsenek beérkezett üzenetek az oldalon keresztül.</p>
                            </div>
                        ) : (
                            <table className="neo-table">
                                <thead><tr><th>Küldő & Dátum</th><th>Téma</th><th>Üzenet</th><th style={{textAlign: 'right'}}>Műveletek</th></tr></thead>
                                <tbody>{messages.map(msg => (
                                    <tr key={msg.id} style={{ opacity: msg.olvasva ? 0.6 : 1, transition: '0.3s' }}>
                                        <td style={{ minWidth: '200px' }}>
                                            <div className="neo-item-title" style={{color: '#8c9eff'}}>
                                                {msg.nev} 
                                                {msg.felhasznalo_id && <span style={{marginLeft: '8px', fontSize: '0.75rem', backgroundColor: '#3b82f6', color: '#fff', padding: '2px 6px', borderRadius: '4px'}}>Regisztrált tag</span>}
                                            </div>
                                            <a href={`mailto:${msg.email}`} className="neo-item-sub" style={{color: '#9ca3af', textDecoration: 'none', display: 'block', margin: '5px 0'}}><i className="fas fa-reply"></i> {msg.email}</a>
                                            <div style={{ fontSize: '0.8rem', color: '#6b7280' }}>{new Date(msg.datum).toLocaleString('hu-HU')}</div>
                                        </td>
                                        <td>
                                            <span className="neo-badge tag" style={{ backgroundColor: msg.olvasva ? 'rgba(255,255,255,0.1)' : 'rgba(59, 130, 246, 0.2)', color: msg.olvasva ? '#ccc' : '#60a5fa' }}>{msg.tema}</span>
                                        </td>
                                        <td style={{ maxWidth: '400px' }}>
                                            <div style={{ color: '#ccc', fontStyle: 'italic', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>{msg.uzenet}</div>
                                        </td>
                                        <td>
                                            <div className="neo-actions">
                                                {!msg.olvasva && (
                                                    <button onClick={() => handleMarkMessageRead(msg.id)} className="neo-action-btn approve" title="Olvasottnak jelöl"><i className="fas fa-check-double"></i></button>
                                                )}
                                                <button onClick={() => { setMessageToDelete(msg.id); setShowMessageDeleteModal(true); }} className="neo-action-btn delete" title="Törlés"><i className="fas fa-trash-alt"></i></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}</tbody>
                            </table>
                        )}
                    </div>
                )}

                {!error && activeTab === 'manageMedia' && (
                    <div className="neo-card">
                        <div className="neo-sub-tabs">
                            <button onClick={() => setContentSubTab('movies')} className={`neo-sub-tab ${contentSubTab === 'movies' ? 'active' : ''}`}><i className="fas fa-film"></i> Csak Filmek</button>
                            <button onClick={() => setContentSubTab('series')} className={`neo-sub-tab ${contentSubTab === 'series' ? 'active' : ''}`}><i className="fas fa-tv"></i> Csak Sorozatok</button>
                        </div>
                        <table className="neo-table">
                            <thead><tr><th>Poszter</th><th>Cím és Kategória</th><th>Évszám</th><th style={{textAlign: 'right'}}>Kezelés</th></tr></thead>
                            <tbody>
                                {mediaList.filter(m => m.tipus === (contentSubTab === 'movies' ? 'film' : 'sorozat')).map(m => (
                                    <tr key={m.id}>
                                        <td><img src={m.poszter_url} alt="poszter" className="neo-poster" /></td>
                                        <td>
                                            <div className="neo-item-title">{m.cim}</div>
                                            <span className="neo-badge tag">{m.kategoria_id}</span>
                                        </td>
                                        <td style={{fontWeight: 'bold', color: '#ccc'}}>{m.megjelenes_ev_start} {m.megjelenes_ev_end && `- ${m.megjelenes_ev_end}`}</td>
                                        <td>
                                            <div className="neo-actions">
                                                <button onClick={() => openEditMediaModal(m)} className="neo-action-btn edit" title="Szerkesztés"><i className="fas fa-pen"></i></button>
                                                <button onClick={() => { setMediaToDelete(m.id); setShowMediaDeleteModal(true); }} className="neo-action-btn delete" title="Törlés"><i className="fas fa-trash-alt"></i></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {!error && activeTab === 'upload' && (
                    <div className="neo-card" style={{padding: '50px'}}>
                        <h2 style={{color: 'white', margin: '0 0 30px 0', fontSize: '2rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '20px'}}><i className="fas fa-magic" style={{color: 'var(--primary)', marginRight: '15px'}}></i>Új tartalom publikálása</h2>
                        {renderUploadForm(false)}
                    </div>
                )}

                {editingMedia && (
                    <div className="neo-modal-overlay" onClick={() => { setEditingMedia(null); setUploadData(initialMediaForm); }}>
                        <div className="neo-modal-content" onClick={e => e.stopPropagation()}>
                            <h2 style={{color: 'white', margin: '0 0 25px 0', fontSize: '1.8rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '15px'}}><i className="fas fa-pen-nib" style={{color: '#f39c12', marginRight: '15px'}}></i>{editingMedia.cim} Módosítása</h2>
                            {renderUploadForm(true)}
                        </div>
                    </div>
                )}

                {editingUser && (
                    <div className="neo-modal-overlay" onClick={() => { setEditingUser(null); setShowUserPassword(false); }}>
                        <div className="neo-modal-content small" onClick={e => e.stopPropagation()}>
                            <h2 style={{color: 'white', margin: '0 0 25px 0', fontSize: '1.5rem', textAlign: 'center'}}><i className="fas fa-user-shield" style={{color: 'var(--primary)', marginRight: '10px'}}></i>Fiók Módosítása</h2>
                            <form onSubmit={handleUpdateUser} style={{display: 'flex', flexDirection: 'column', gap: '20px'}}>
                                <div className="neo-input-group">
                                    <label>Email cím</label>
                                    <input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="neo-input" required />
                                </div>
                                <div className="neo-input-group">
                                    <label>Jogosultság</label>
                                    <select value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})} className="neo-input">
                                        <option value="user">Felhasználó</option>
                                        <option value="admin">Admin</option>
                                    </select>
                                </div>
                                <div className="neo-input-group">
                                    <label>Új jelszó beállítása (Opcionális)</label>
                                    <div className="pw-input-wrapper">
                                        <input 
                                            type={showUserPassword ? "text" : "password"} 
                                            placeholder="Hagyd üresen, ha nem változik..." 
                                            value={formData.password} 
                                            onChange={e => setFormData({...formData, password: e.target.value})} 
                                            className="neo-input"
                                        />
                                        <button type="button" onClick={() => setShowUserPassword(!showUserPassword)} className="pw-toggle-btn"><i className={showUserPassword ? "fas fa-eye-slash" : "fas fa-eye"}></i></button>
                                    </div>
                                </div>
                                <div className="form-actions-row">
                                    <button type="button" onClick={() => { setEditingUser(null); setShowUserPassword(false); }} className="neo-btn-secondary">Mégse</button>
                                    <button type="submit" className="neo-btn-primary">Mentés</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                <div style={{ marginTop: '60px', display: 'flex', justifyContent: 'center' }}>
                    <Link to="/" style={{ textDecoration: 'none' }}>
                        <button className="neo-btn-exit">
                            <i className="fas fa-home"></i> Kilépés a Főoldalra
                        </button>
                    </Link>
                </div>

                <ConfirmModal isOpen={showDeleteModal} onClose={() => setShowDeleteModal(false)} onConfirm={handleDeleteUserConfirmed} title="Felhasználó törlése" message="Biztosan véglegesen törölni szeretnéd ezt a felhasználót?" />
                <ConfirmModal isOpen={showMediaDeleteModal} onClose={() => setShowMediaDeleteModal(false)} onConfirm={handleDeleteMediaConfirmed} title="Tartalom törlése" message="Biztosan véglegesen törlöd ezt a filmet/sorozatot?" />
                <ConfirmModal isOpen={showReviewDeleteModal} onClose={() => setShowReviewDeleteModal(false)} onConfirm={handleDeleteReviewConfirmed} title="Komment törlése" message="Biztosan véglegesen törlöd a jelentett kommentet?" />
                <ConfirmModal isOpen={showMessageDeleteModal} onClose={() => setShowMessageDeleteModal(false)} onConfirm={handleDeleteMessageConfirmed} title="Üzenet törlése" message="Biztosan véglegesen törlöd ezt az ügyfélszolgálati üzenetet?" />
                {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
            </div>
        </div>
    );
}