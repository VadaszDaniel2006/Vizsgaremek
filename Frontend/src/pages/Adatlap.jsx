import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

export default function Adatlap({ type, openStreaming, openTrailer, user, onAddToFav, onRemoveFromFav, onAddToList, onRemoveFromList, onOpenReviews, interactionUpdate }) {
    const { id } = useParams();
    const navigate = useNavigate();
    const [item, setItem] = useState(null);
    const [loading, setLoading] = useState(true);
    
    const [status, setStatus] = useState({ favorite: false, listed: false, reviewed: false });

    useEffect(() => {
        const fetchItemData = async () => {
            // Kivettük a setLoading(true)-t a sima frissítéshez
            try {
                const endpoint = type === 'film' ? 'filmek' : 'sorozatok';
                const res = await fetch(`http://localhost:5000/api/${endpoint}`);
                const json = await res.json();
                if (json.data) setItem(json.data.find(d => d.id === parseInt(id)));
            } catch (error) { console.error(error); } 
            finally { setLoading(false); }
        };
        fetchItemData();
    }, [id, type, interactionUpdate]); // <-- LÉNYEGES VÁLTOZÁS ITT!

    useEffect(() => {
        const fetchStatus = async () => {
            if (!user || !item) return;
            try {
                const res = await fetch('http://localhost:5000/api/interactions/status', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        userId: user.id,
                        filmId: type === 'film' ? item.id : null,
                        sorozatId: type === 'sorozat' ? item.id : null
                    })
                });
                if (res.ok) {
                    const data = await res.json();
                    setStatus(data);
                }
            } catch (error) { console.error(error); }
        };
        fetchStatus();
    }, [user, item, interactionUpdate, type]);

    const toggleFav = () => {
        if (!user) return onAddToFav(item); 
        if (status.favorite) { setStatus(prev => ({ ...prev, favorite: false })); onRemoveFromFav(item); } 
        else { setStatus(prev => ({ ...prev, favorite: true })); onAddToFav(item); }
    };

    const toggleList = () => {
        if (!user) return onAddToList(item);
        if (status.listed) { setStatus(prev => ({ ...prev, listed: false })); onRemoveFromList(item); } 
        else { setStatus(prev => ({ ...prev, listed: true })); onAddToList(item); }
    };

    if (loading) return <div style={{ height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', backgroundColor: '#0b0f2b', color: 'white' }}><h2>Betöltés...</h2></div>;
    if (!item) return <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', backgroundColor: '#0b0f2b', color: 'white' }}><h2>Nem található.</h2><button className="btn-back-solid" onClick={() => navigate('/')}>Kezdőlap</button></div>;
    
    return (
        <div className="adatlap-container">
            <div className="adatlap-bg" style={{ backgroundImage: `url(${item.poszter_url})` }}></div>

            <div className="adatlap-wrapper">
                <div className="poster-container">
                    <img src={item.poszter_url} alt={item.cim} className="adatlap-poster" />
                </div>
                
                <div className="info-container">
                    <h1 className="adatlap-title">{item.cim}</h1>
                    <div className="adatlap-meta">
                        <span className="rating"><i className="fas fa-star"></i> {item.rating}</span>
                        <span>{type === 'film' ? item.megjelenes_ev : item.megjelenes_ev_start}</span>
                        <span>{item.kategoria}</span>
                        {item.hossz_perc && <span>{item.hossz_perc} perc</span>}
                    </div>
                    
                    <p className="adatlap-plot">{item.leiras}</p>
                    <p className="adatlap-director"><strong>Rendező:</strong> {item.rendezo}</p>
                    
                    <div className="adatlap-actions">
                        
                        <div className="actions-left">
                            <button className="btn-main-action" onClick={() => openStreaming(item)}>
                                <i className="fas fa-play"></i> Megnézem
                            </button>
                            
                            {item.elozetes_url && (
                                <button className="btn-secondary-action" onClick={() => openTrailer(item.elozetes_url, item.cim)}>
                                    <i className="fas fa-film"></i> Előzetes
                                </button>
                            )}
                            
                            <button 
                                className="btn-secondary-action" 
                                onClick={() => onOpenReviews(item)}
                                style={status.reviewed ? { color: '#00e676', borderColor: '#00e676', backgroundColor: 'rgba(0, 230, 118, 0.1)' } : {}}
                            >
                                <i className="fas fa-comment-alt"></i> Vélemények
                            </button>

                            {user && (
                                <>
                                    <div className="icon-separator"></div>
                                    <button 
                                        className={`btn-circle-action ${status.favorite ? 'active' : ''}`} 
                                        onClick={toggleFav}
                                        title="Kedvencek"
                                    >
                                        <i className="fas fa-heart"></i>
                                    </button>
                                    <button 
                                        className={`btn-circle-action ${status.listed ? 'active' : ''}`} 
                                        onClick={toggleList}
                                        title="Saját lista"
                                    >
                                        <i className="fas fa-plus"></i>
                                    </button>
                                </>
                            )}
                        </div>

                        <div className="actions-right">
                            <button className="btn-back-solid" onClick={() => navigate(-1)}>
                                <i className="fas fa-arrow-left"></i> Vissza
                            </button>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
}