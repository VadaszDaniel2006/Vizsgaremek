import React, { useState, useEffect } from 'react';

// Garantálja a heti fix filmeket F5 után is
const getCurrentFixedWeek = () => {
    const daysSinceEpoch = Math.floor(Date.now() / (1000 * 60 * 60 * 24));
    return Math.floor(daysSinceEpoch / 7);
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

    const activeStyle = { color: '#00e676', borderColor: '#00e676', backgroundColor: 'rgba(15, 21, 43, 0.95)' };

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
                    {/* ITT FRISSÜL MAJD A PONTSZÁM AZONNAL: */}
                    <span><i className="fas fa-star" style={{color: '#fbbf24'}}></i> {item.rating}</span>
                </div>
            </div>
            <div className="card-buttons top50-action-row">
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

export default function WeeklyPick({ user, openStreaming, openTrailer, openReviews, openInfo, handleAddToFav, handleRemoveFromFav, handleAddToMyList, handleRemoveFromList, interactionUpdate }) {
    const [recommendations, setRecommendations] = useState({ featured: null, list: [] });
    const [loading, setLoading] = useState(true);
    const [status, setStatus] = useState({ favorite: false, listed: false, reviewed: false });

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    // 1. ELSŐ BETÖLTÉS: Fix lista kiosztása (nem mozdul F5-re)
    useEffect(() => {
        const fetchRecommendations = async () => {
            try {
                // A cache: 'no-store' nagyon fontos, különben a régi adatot kapjuk!
                const [moviesRes, seriesRes] = await Promise.all([
                    fetch('http://localhost:5000/api/filmek', { cache: 'no-store' }),
                    fetch('http://localhost:5000/api/sorozatok', { cache: 'no-store' })
                ]);
                const moviesData = await moviesRes.json();
                const seriesData = await seriesRes.json();
                
                let combined = [];
                if (moviesData.data) combined = [...combined, ...moviesData.data.filter(m => parseFloat(m.rating) > 7.0)];
                if (seriesData.data) combined = [...combined, ...seriesData.data.filter(s => parseFloat(s.rating) > 7.0)];
                
                combined.sort((a, b) => {
                    const cimA = a.cim || a.title || '';
                    const cimB = b.cim || b.title || '';
                    return cimA.localeCompare(cimB);
                });
                
                if (combined.length > 0) {
                    const currentWeek = getCurrentFixedWeek(); 
                    const startIndex = currentWeek % combined.length; 
                    
                    let weeklySelection = [];
                    for (let i = 0; i < 6; i++) { 
                        weeklySelection.push(combined[(startIndex + i) % combined.length]);
                    }
                    
                    setRecommendations({ featured: weeklySelection[0], list: weeklySelection.slice(1) });
                }
            } catch (error) { console.error(error); } finally { setLoading(false); }
        };
        fetchRecommendations();
    }, []); // Üres tömb -> csak egyszer fut le!

    // --- 2. CSENDES FRISSÍTŐ (A KULCS A MEGOLDÁSHOZ!) ---
    // Ha írsz egy véleményt, lefut, és CSAK a kártyákon lévő "rating" értéket írja át a legújabbra!
    useEffect(() => {
        if (interactionUpdate === 0 || !recommendations.featured) return;

        const updateRatingsSilently = async () => {
            try {
                const [moviesRes, seriesRes] = await Promise.all([
                    fetch('http://localhost:5000/api/filmek', { cache: 'no-store' }),
                    fetch('http://localhost:5000/api/sorozatok', { cache: 'no-store' })
                ]);
                const moviesData = await moviesRes.json();
                const seriesData = await seriesRes.json();
                const allData = [...(moviesData.data || []), ...(seriesData.data || [])];

                setRecommendations(prev => {
                    if (!prev.featured) return prev;

                    const frissFeatured = allData.find(m => m.id === prev.featured.id) || prev.featured;
                    const frissList = prev.list.map(item => {
                        const frissItem = allData.find(m => m.id === item.id);
                        return frissItem ? { ...item, rating: frissItem.rating } : item;
                    });

                    return {
                        featured: { ...prev.featured, rating: frissFeatured.rating },
                        list: frissList
                    };
                });
            } catch (error) { console.error("Hiba a csendes frissítéskor:", error); }
        };

        updateRatingsSilently();
    }, [interactionUpdate]); 

    // Gombok státusza a fenti nagy kártyához
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

    const toggleFeaturedFav = () => {
        if (!user) { handleAddToFav(recommendations.featured); return; }
        if (status.favorite) { setStatus(p => ({ ...p, favorite: false })); handleRemoveFromFav(recommendations.featured); }
        else { setStatus(p => ({ ...p, favorite: true })); handleAddToFav(recommendations.featured); }
    };

    const toggleFeaturedList = () => {
        if (!user) { handleAddToMyList(recommendations.featured); return; }
        if (status.listed) { setStatus(p => ({ ...p, listed: false })); handleRemoveFromList(recommendations.featured); }
        else { setStatus(p => ({ ...p, listed: true })); handleAddToMyList(recommendations.featured); }
    };

    if (loading) return <div className="loading-screen" style={{ height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', color: 'white' }}><h2>Ajánlások betöltése...</h2></div>;
    if (!recommendations.featured) return <div className="loading-screen" style={{ height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', color: 'white' }}><h2>Nincs ajánlat.</h2></div>;

    const { featured, list } = recommendations;
    const activeStyle = { color: '#00e676', borderColor: '#00e676', backgroundColor: 'rgba(15, 21, 43, 0.95)' };

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
                                    <button className={`btn-circle-action ${status.favorite ? 'active' : ''}`} onClick={toggleFeaturedFav}><i className="fas fa-heart"></i></button>
                                    <button className={`btn-circle-action ${status.listed ? 'active' : ''}`} onClick={toggleFeaturedList}><i className="fas fa-plus"></i></button>
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
                    <WeeklyListCard key={`${item.id || item._id}-${index}`} item={item} user={user} openStreaming={openStreaming} openTrailer={openTrailer} openReviews={openReviews} openInfo={openInfo} handleAddToFav={handleAddToFav} handleRemoveFromFav={handleRemoveFromFav} handleAddToMyList={handleAddToMyList} handleRemoveFromList={handleRemoveFromList} interactionUpdate={interactionUpdate} />
                ))}
            </div>
        </div>
    );
}