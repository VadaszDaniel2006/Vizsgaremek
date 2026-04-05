import React, { useState, useEffect } from 'react';
import './MovieCard.css';

const MovieCard = ({ 
  movie, 
  user, 
  onOpenInfo, 
  openInfo,
  onOpenTrailer, 
  openTrailer,
  onOpenStreaming, 
  openStreaming,
  onAddToFav, 
  onRemoveFromFav, 
  onAddToList, 
  onRemoveFromList,
  onOpenReviews,
  openReviews,
  interactionUpdate 
}) => {
  
  const [status, setStatus] = useState({
    reviewed: false,
    favorite: false,
    listed: false
  });

  const safeMovie = movie ? { ...movie, tipus: movie.tipus || ((movie.evadok_szama !== undefined || movie.sorozat_id !== undefined) ? 'sorozat' : 'film') } : null;

  useEffect(() => {
    if (user && movie) {
        fetchStatus();
    }
  }, [user, movie, interactionUpdate]);

  const fetchStatus = async () => {
    try {
        const type = (movie.evadok_szama !== undefined || movie.sorozat_id !== undefined) ? 'sorozat' : 'film';
        const id = movie.id || movie._id;

        const res = await fetch('http://localhost:5000/api/interactions/status', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                userId: user.id,
                filmId: type === 'film' ? id : null,
                sorozatId: type === 'sorozat' ? id : null
            })
        });
        
        if (res.ok) {
            const data = await res.json();
            setStatus(data); 
        }
    } catch (error) { console.error(error); }
  };

  const handleFavClick = (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (!user) return onAddToFav(safeMovie); 

      if (status.favorite) {
          setStatus(prev => ({ ...prev, favorite: false }));
          onRemoveFromFav(safeMovie);
      } else {
          setStatus(prev => ({ ...prev, favorite: true }));
          onAddToFav(safeMovie);
      }
  };

  const handleListClick = (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (!user) return onAddToList(safeMovie);

      if (status.listed) {
          setStatus(prev => ({ ...prev, listed: false }));
          onRemoveFromList(safeMovie);
      } else {
          setStatus(prev => ({ ...prev, listed: true }));
          onAddToList(safeMovie);
      }
  };

  const handleReviewClick = (e) => {
      e.preventDefault();
      e.stopPropagation();
      const finalOpenReviews = onOpenReviews || openReviews;
      if (finalOpenReviews) finalOpenReviews(safeMovie);
  };

  const activeStyle = { 
      color: '#00e676', 
      borderColor: '#00e676', 
      backgroundColor: 'rgba(15, 21, 43, 0.95)' 
  }; 

  if (!movie) return null;

  return (

    <div className="movie-card-container" style={{ height: '100%' }}>
      <div 
        className="movie-card" 
        onClick={(e) => {
            e.preventDefault();
            const finalOpenTrailer = onOpenTrailer || openTrailer;
            if (finalOpenTrailer) finalOpenTrailer(safeMovie.elozetes_url, safeMovie.cim);
        }}
        style={{ flexShrink: 0 }} 
      >
        <div className="card-image">
          <img src={movie.poszter_url || movie.poster} alt={movie.cim} loading="lazy" decoding="async" />
          <div className="card-overlay">
            <i className="fas fa-play-circle"></i>
          </div>
        </div>

        <div className="user-interactions" onClick={(e) => e.stopPropagation()}>
            <button 
                className="btn-icon reviews" 
                onClick={handleReviewClick} 
                title="Vélemények"
                style={{ marginRight: '5px', ...(status.reviewed ? activeStyle : {}) }}
            >
                <i className="fas fa-comment-alt"></i>
            </button>

            {user && (
                <>
                    <button 
                        className="btn-fav" 
                        onClick={handleFavClick} 
                        title="Kedvencek"
                        style={status.favorite ? activeStyle : {}}
                    >
                        <i className="fas fa-heart"></i>
                    </button>
                    <button 
                        className="btn-add-list" 
                        onClick={handleListClick} 
                        title="Saját lista"
                        style={status.listed ? activeStyle : {}}
                    >
                        <i className="fas fa-plus"></i>
                    </button>
                </>
            )}
        </div>
      </div>

      <div className="card-details" style={{ padding: '15px', flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <h4 style={{ fontSize: '16px', lineHeight: '1.2', margin: '0 0 8px 0', color: 'white', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontWeight: 'bold' }}>
            {movie.cim || movie.title}
        </h4>
        <div className="card-meta" style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', color: '#aaa', lineHeight: '1' }}>
          <span>{movie.megjelenes_ev || movie.year}</span>
          <span><i className="fas fa-star" style={{ color: '#fbbf24', marginRight: '4px' }}></i> {movie.rating}</span>
        </div>
      </div>

      <div className="card-buttons top50-action-row" style={{ display: 'flex', gap: '10px', marginTop: 'auto', padding: '12px' }}>
        <button 
            className="btn-card-play" 
            style={{ flex: 1, whiteSpace: 'nowrap', height: '40px', padding: '0 10px' }}
            onClick={(e) => { 
                e.preventDefault();
                e.stopPropagation(); 
                const finalOpenStreaming = onOpenStreaming || openStreaming;
                if (finalOpenStreaming) finalOpenStreaming(safeMovie); 
            }}
        >
          <i className="fas fa-play" style={{ marginRight: '6px' }}></i> Megnézem
        </button>
        
        <button 
            className="btn-card-info" 
            style={{ flex: 1, whiteSpace: 'nowrap', height: '40px', padding: '0 10px' }}
            onClick={(e) => { 
                e.preventDefault();
                e.stopPropagation(); 
                const finalOpenInfo = onOpenInfo || openInfo;
                if (finalOpenInfo) finalOpenInfo(safeMovie); 
            }}
        >
          <i className="fas fa-info-circle" style={{ marginRight: '6px' }}></i> Részletek
        </button>
      </div>
    </div>
  );
};

export default MovieCard;