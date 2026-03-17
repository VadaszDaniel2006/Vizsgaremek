import React, { useState, useEffect } from 'react';
import './Hero.css';

const HeroSlide = ({ movie, isActive, user, openStreaming, handleAddToFav, handleRemoveFromFav, handleAddToMyList, handleRemoveFromList, openTrailer, interactionUpdate, openReviews }) => {
    const [status, setStatus] = useState({ favorite: false, listed: false, reviewed: false });

    useEffect(() => {
        const fetchStatus = async () => {
            if (!user || !movie) return;
            try {
                const isSeries = movie.evadok_szama !== undefined || movie.sorozat_id !== undefined;
                const id = movie.id || movie._id;
                const res = await fetch('http://localhost:5000/api/interactions/status', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ userId: user.id, filmId: !isSeries ? id : null, sorozatId: isSeries ? id : null })
                });
                if (res.ok) { const data = await res.json(); setStatus(data); }
            } catch (error) { console.error(error); }
        };
        fetchStatus();
    }, [user, movie, interactionUpdate]); 

    const toggleFav = (e) => {
        if(!user) return handleAddToFav(movie); 
        if (status.favorite) { setStatus(prev => ({ ...prev, favorite: false })); handleRemoveFromFav(movie); } 
        else { setStatus(prev => ({ ...prev, favorite: true })); handleAddToFav(movie); }
    };

    const toggleList = (e) => {
        if(!user) return handleAddToMyList(movie);
        if (status.listed) { setStatus(prev => ({ ...prev, listed: false })); handleRemoveFromList(movie); } 
        else { setStatus(prev => ({ ...prev, listed: true })); handleAddToMyList(movie); }
    };

    const activeStyle = { color: '#00e676', borderColor: '#00e676' };

    return (
        <div className={`movie-slide-split ${isActive ? 'active' : ''}`} style={{ backgroundImage: `url(${movie.poszter_url})` }}>
            <div className="slide-backdrop-blur"></div>
            <div className="split-content-wrapper">
                <div className="slide-left-info">
                    <h1>{movie.cim}</h1>
                    <div className="movie-meta-tags">
                        <span className="rating-tag"><i className="fas fa-star"></i> {movie.rating || movie.alap_rating}</span>
                        <span className="year-tag">{movie.megjelenes_ev}</span>
                        <span className="genre-tag">{movie.kategoria}</span>
                    </div>
                    <div className="description-block">
                        <p className="plot">{movie.leiras}</p>
                        <div className="credits"><p><strong>Rendező:</strong> {movie.rendezo || 'Ismeretlen'}</p></div>
                    </div>
                    <div className="info-buttons">
                        <button className="btn-watch" onClick={() => openStreaming(movie)}><i className="fas fa-play"></i> Megnézem</button>
                        <button className="btn-watch" style={{ background: 'rgba(255,255,255,0.2)', marginLeft:'10px', ...(status.favorite ? activeStyle : {}) }} onClick={toggleFav}><i className="fas fa-heart"></i></button>
                        <button className="btn-watch" style={{ background: 'rgba(255,255,255,0.2)', marginLeft:'10px', ...(status.listed ? activeStyle : {}) }} onClick={toggleList}><i className="fas fa-plus"></i></button>
                        <button className="btn-watch" style={{ background: 'rgba(255,255,255,0.2)', marginLeft:'10px', ...(status.reviewed ? activeStyle : {}) }} onClick={() => openReviews(movie)}><i className="fas fa-comment-alt"></i></button>
                    </div>
                </div>
                <div className="slide-right-image-frame">
                    <img src={movie.poszter_url} alt={movie.cim} loading={isActive ? "eager" : "lazy"} decoding="async" fetchpriority={isActive ? "high" : "low"} />
                    <button className="play-btn-on-image" onClick={() => openTrailer(movie.elozetes_url, movie.cim)}><i className="fas fa-play"></i></button>
                </div>
            </div>
        </div>
    );
};

export default HeroSlide;