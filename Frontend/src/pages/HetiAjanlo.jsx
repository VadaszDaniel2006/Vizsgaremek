import React, { useState, useEffect } from 'react';

const getWeekNumber = (d) => {
    d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
    d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
};

const WeeklyListCard = ({ item, user, openStreaming, openTrailer, openReviews, openInfo, handleAddToFav, handleRemoveFromFav, handleAddToMyList, handleRemoveFromList, interactionUpdate }) => {
    const [status, setStatus] = useState({ favorite: false, listed: false, reviewed: false });
    const isSeries = item.evadok_szama !== undefined || item.sorozat_id !== undefined || !item.megjelenes_ev;

    useEffect(() => {
        const fetchStatus = async () => {
            if (!user || !item) return;
            try {
                const id = item.id || item._id;
                const res = await fetch('http://localhost:5000/api/interactions/status', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ userId: user.id, filmId: !isSeries ? id : null, sorozatId: isSeries ? id : null })
                });
                if (res.ok) {
                    const data = await res.json();
                    setStatus(data);
                }
            } catch (error) { console.error(error); }
        };
        fetchStatus();
    }, [user, item, interactionUpdate, isSeries]);

    const toggleFav = (e) => {
        e.preventDefault(); e.stopPropagation();
        if (!user) return handleAddToFav(item);
        if (status.favorite) { setStatus(prev => ({ ...prev, favorite: false })); handleRemoveFromFav(item); }
        else { setStatus(prev => ({ ...prev, favorite: true })); handleAddToFav(item); }
    };

    const toggleList = (e) => {
        e.preventDefault(); e.stopPropagation();
        if (!user) return handleAddToMyList(item);
        if (status.listed) { setStatus(prev => ({ ...prev, listed: false })); handleRemoveFromList(item); }
        else { setStatus(prev => ({ ...prev, listed: true })); handleAddToMyList(item); }
    };

    const activeStyle = { 
    color: '#00e676', 
    borderColor: '#00e676', 
     // Ez egy sötét, de jól látható háttér
};

    return (
        <div className="movie-card-container" onClick={() => openInfo(item)}>
            <div className="movie-card">
                <div className="card-image">
                    <img src={item.poszter_url} alt={item.cim} loading="lazy" />
                    <div className="card-overlay" onClick={(e) => { e.stopPropagation(); openTrailer(item.elozetes_url, item.cim); }}>
                        <i className="fas fa-play-circle"></i>
                    </div>
                    <div className="user-interactions">
                        <button className="btn-icon" onClick={(e) => { e.stopPropagation(); openReviews(item); }} style={status.reviewed ? activeStyle : {}}>
                            <i className="fas fa-comment-alt"></i>
                        </button>
                        {user && (
                            <>
                                <button className="btn-fav" onClick={toggleFav} style={status.favorite ? activeStyle : {}}>
                                    <i className="fas fa-heart"></i>
                                </button>
                                <button className="btn-add-list" onClick={toggleList} style={status.listed ? activeStyle : {}}>
                                    <i className="fas fa-plus"></i>
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </div>
            <div className="card-details">
                <h4>{item.cim}</h4>
                <div className="card-meta">
                    <span>{item.megjelenes_ev || item.megjelenes_ev_start}</span>
                    <span><i className="fas fa-star" style={{color: '#fbbf24'}}></i> {item.rating}</span>
                </div>
            </div>
            <div className="card-buttons">
                <button className="btn-card-play" onClick={(e) => { e.stopPropagation(); openStreaming(item); }}>
                    <i className="fas fa-play"></i> Megnézem
                </button>
                <button className="btn-card-info" onClick={(e) => { e.stopPropagation(); openInfo(item); }}>
                    <i className="fas fa-info-circle"></i> Részletek
                </button>
            </div>
        </div>
    );
};

export default function HetiAjanlo({ user, openStreaming, openTrailer, openReviews, openInfo, handleAddToFav, handleRemoveFromFav, handleAddToMyList, handleRemoveFromList, interactionUpdate }) {
    const [recommendations, setRecommendations] = useState({ featured: null, list: [] });
    const [loading, setLoading] = useState(true);
    const [status, setStatus] = useState({ favorite: false, listed: false, reviewed: false });

    useEffect(() => {
        const fetchRecommendations = async () => {
            try {
                const [moviesRes, seriesRes] = await Promise.all([
                    fetch('http://localhost:5000/api/filmek'),
                    fetch('http://localhost:5000/api/sorozatok')
                ]);
                const moviesData = await moviesRes.json();
                const seriesData = await seriesRes.json();
                let combined = [];
                if (moviesData.data) combined = [...combined, ...moviesData.data.filter(m => parseFloat(m.rating) > 7.5)];
                if (seriesData.data) combined = [...combined, ...seriesData.data.filter(s => parseFloat(s.rating) > 7.5)];
                combined.sort((a, b) => a.id - b.id);
                if (combined.length > 0) {
                    const currentWeek = getWeekNumber(new Date());
                    const startIndex = (currentWeek * 7) % combined.length;
                    let weeklySelection = [];
                    for (let i = 0; i < 6; i++) { // 1 kiemelt + 5 lenti kép
                        weeklySelection.push(combined[(startIndex + i) % combined.length]);
                    }
                    setRecommendations({ featured: weeklySelection[0], list: weeklySelection.slice(1) });
                }
            } catch (error) { console.error(error); } finally { setLoading(false); }
        };
        fetchRecommendations();
    }, [interactionUpdate]);

    useEffect(() => {
        const fetchStatus = async () => {
            if (!user || !recommendations.featured) return;
            try {
                const item = recommendations.featured;
                const isSeries = item.evadok_szama !== undefined || item.sorozat_id !== undefined;
                const id = item.id || item._id;
                const res = await fetch('http://localhost:5000/api/interactions/status', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ userId: user.id, filmId: !isSeries ? id : null, sorozatId: isSeries ? id : null })
                });
                if (res.ok) { setStatus(await res.json()); }
            } catch (error) { console.error(error); }
        };
        fetchStatus();
    }, [user, recommendations.featured, interactionUpdate]);

    if (loading) return <div className="loading-screen"><h2>Ajánlások betöltése...</h2></div>;
    if (!recommendations.featured) return <div className="loading-screen"><h2>Nincs ajánlat.</h2></div>;

    const { featured, list } = recommendations;
    const activeStyle = { 
    color: '#00e676', 
    borderColor: '#00e676', 
     // Ez egy sötét, de jól látható háttér
};

    return (
        <div className="weekly-container">
            <h1 className="weekly-main-title">Ezen a héten ajánljuk</h1>
            <div className="weekly-featured-card">
                <div className="weekly-featured-bg" style={{ backgroundImage: `url(${featured.poszter_url})` }}></div>
                <div className="weekly-featured-content">
                    <div className="featured-left">
                        <span className="featured-badge"><i className="fas fa-fire"></i> A hét választása</span>
                        <h2>{featured.cim}</h2>
                        <div className="featured-meta">
                            <span className="rating"><i className="fas fa-star"></i> {featured.rating}</span>
                            <span>{featured.megjelenes_ev || featured.megjelenes_ev_start}</span>
                            <span>{featured.kategoria}</span>
                        </div>
                        <div className="featured-desc">
                            <p>{featured.leiras}</p>
                            <p style={{ marginTop: '10px' }}><strong>Rendező:</strong> {featured.rendezo || 'Ismeretlen'}</p>
                        </div>
                        <div className="featured-actions">
                            <button className="btn-main-action" onClick={() => openStreaming(featured)}><i className="fas fa-play"></i> Megnézem</button>
                            <button className="btn-secondary-action" onClick={() => openReviews(featured)} style={status.reviewed ? activeStyle : {}}><i className="fas fa-comment-alt"></i> Vélemények</button>
                            {user && (
                                <>
                                    <div className="icon-separator"></div>
                                    <button className={`btn-circle-action ${status.favorite ? 'active' : ''}`} onClick={() => handleAddToFav(featured)}><i className="fas fa-heart"></i></button>
                                    <button className={`btn-circle-action ${status.listed ? 'active' : ''}`} onClick={() => handleAddToMyList(featured)}><i className="fas fa-plus"></i></button>
                                </>
                            )}
                        </div>
                    </div>
                    <div className="featured-right">
                        <img src={featured.poszter_url} alt={featured.cim} />
                        <button className="play-btn-on-image hover-only" onClick={() => openTrailer(featured.elozetes_url, featured.cim)}><i className="fas fa-play"></i></button>
                    </div>
                </div>
            </div>
            <h3 className="weekly-subtitle">További izgalmas címek a hétre</h3>
            <div className="movies-grid">
                {list.map((item, index) => (
                    <WeeklyListCard key={`${item.id}-${index}`} item={item} user={user} openStreaming={openStreaming} openTrailer={openTrailer} openReviews={openReviews} openInfo={openInfo} handleAddToFav={handleAddToFav} handleRemoveFromFav={handleRemoveFromFav} handleAddToMyList={handleAddToMyList} handleRemoveFromList={handleRemoveFromList} interactionUpdate={interactionUpdate} />
                ))}
            </div>
        </div>
    );
}