import React, { useState, useEffect } from 'react';

const Top50ListItem = ({ item, index, type, user, openStreaming, openTrailer, openReviews, handleAddToFav, handleRemoveFromFav, handleAddToMyList, handleRemoveFromList, interactionUpdate }) => {
    const [status, setStatus] = useState({ favorite: false, listed: false, reviewed: false });

    useEffect(() => {
        const fetchStatus = async () => {
            if (!user || !item) return;
            try {
                const isSeries = type === 'sorozat';
                const res = await fetch('http://localhost:5000/api/interactions/status', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ userId: user.id, filmId: !isSeries ? item.id : null, sorozatId: isSeries ? item.id : null })
                });
                if (res.ok) { const data = await res.json(); setStatus(data); }
            } catch (error) { console.error(error); }
        };
        fetchStatus();
    }, [user, item, interactionUpdate, type]);

    const toggleFav = () => {
        if(!user) return handleAddToFav(item); 
        if (status.favorite) { setStatus(prev => ({ ...prev, favorite: false })); handleRemoveFromFav(item); } 
        else { setStatus(prev => ({ ...prev, favorite: true })); handleAddToFav(item); }
    };

    const toggleList = () => {
        if(!user) return handleAddToMyList(item);
        if (status.listed) { setStatus(prev => ({ ...prev, listed: false })); handleRemoveFromList(item); } 
        else { setStatus(prev => ({ ...prev, listed: true })); handleAddToMyList(item); }
    };

    return (
        <div className="top50-list-item">
            <div className="top50-rank-column">#{index + 1}</div>
            
            <img src={item.poszter_url} alt={item.cim} className="top50-poster-wide" style={{ cursor: 'default' }} />
            
            <div className="top50-details-column">
                <h2 style={{ cursor: 'default' }}>{item.cim}</h2>
                <div className="top50-meta-row">
                    <span className="rating"><i className="fas fa-star"></i> {item.rating}</span>
                    <span>{type === 'film' ? item.megjelenes_ev : item.megjelenes_ev_start}</span>
                    <span className="genre">{item.kategoria}</span>
                </div>
                
                <p style={{ fontSize: '0.95rem', color: '#aaa', marginBottom: '8px' }}>
                    <strong style={{ color: 'white' }}>Rendező:</strong> {item.rendezo}
                </p>
                
                <p className="top50-desc-text">{item.leiras}</p>
                
                <div className="top50-action-row">
                    <button className="btn-main-action small" onClick={() => openStreaming(item)}>
                        <i className="fas fa-play"></i> Megnézem
                    </button>
                    
                    {item.elozetes_url && (
                        <button className="btn-secondary-action small" onClick={() => openTrailer(item.elozetes_url, item.cim)}>
                            <i className="fas fa-film"></i> Előzetes
                        </button>
                    )}

                    <button 
                        className="btn-secondary-action small" 
                        onClick={() => openReviews(item)}
                        style={status.reviewed ? { color: '#00e676', borderColor: '#00e676', backgroundColor: 'rgba(0, 230, 118, 0.1)' } : {}}
                    >
                        <i className="fas fa-comment-alt"></i> Vélemények
                    </button>
                    
                    {user && (
                        <div className="top50-icons-group">
                            <button className={`btn-circle-action small ${status.favorite ? 'active' : ''}`} onClick={toggleFav}>
                                <i className="fas fa-heart"></i>
                            </button>
                            <button className={`btn-circle-action small ${status.listed ? 'active' : ''}`} onClick={toggleList}>
                                <i className="fas fa-plus"></i>
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default function Top50Oldal({ type, user, openStreaming, openTrailer, openReviews, handleAddToFav, handleRemoveFromFav, handleAddToMyList, handleRemoveFromList, interactionUpdate }) {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);

    // === GÖRGETÉS JAVÍTÁSA ===
    useEffect(() => {
        window.scrollTo(0, 0);
    }, [type]); // A [type] miatt akkor is felgörget, ha a "Top 50 Film"-ről átváltasz a "Top 50 Sorozat"-ra

    useEffect(() => {
        const fetchTop50 = async () => {
            try {
                const endpoint = type === 'film' ? 'filmek' : 'sorozatok'; 
                const res = await fetch(`http://localhost:5000/api/${endpoint}/top50`);
                const json = await res.json();
                if (json.data) {
                    setItems(json.data);
                }
            } catch (error) { console.error("Hiba a betöltésekor", error); } 
            finally { setLoading(false); }
        };
        fetchTop50();
    }, [type, interactionUpdate]);

    if (loading) return <div style={{ height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', color: 'white' }}><h2>Betöltés...</h2></div>;

    return (
        <div className="top50-container-wide">
            <h1 className="top50-title-modern">
                Top 50 {type === 'film' ? 'Film' : 'Sorozat'}
            </h1>
            
            <div className="top50-list-wrapper">
                {items.map((item, index) => (
                    <Top50ListItem 
                        key={item.id} item={item} index={index} type={type} user={user}
                        openStreaming={openStreaming} openTrailer={openTrailer} openReviews={openReviews}
                        handleAddToFav={handleAddToFav} handleRemoveFromFav={handleRemoveFromFav}
                        handleAddToMyList={handleAddToMyList} handleRemoveFromList={handleRemoveFromList}
                        interactionUpdate={interactionUpdate}
                    />
                ))}
            </div>
        </div>
    );
}