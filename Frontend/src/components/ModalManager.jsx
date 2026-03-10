import React from 'react';

export default function ModalManager({ 
  trailerModal, closeTrailer, 
  infoModal, closeInfo, openStreaming,
  streamingModal, closeStreaming 
}) {

  // Segédfüggvény: Streaming adatok egységesítése és szűrése (JAVÍTVA)
  const getPlatformList = (movie) => {
    if (!movie) return [];
    const platforms = movie.platform_lista || movie.platformok || [];
    // Csak a valós névvel rendelkező platformokat engedjük át, az "üreseket" nem!
    return platforms.filter(p => p.nev && p.nev !== 'null' && p.nev.trim() !== '');
  };

  // Segédfüggvény: Mozi adatok lekérése a backendről érkező objektumból
  const getMoziList = (movie) => {
    if (!movie) return [];
    return movie.mozi_lista || [];
  };

  return (
    <>
      {/* 1. TRAILER MODAL */}
      {trailerModal.isOpen && (
        <div className="modal active" onClick={closeTrailer}>
          <div className="modal-content modal-lg" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{trailerModal.title} - Előzetes</h3>
              <button className="close-modal" onClick={closeTrailer}><i className="fas fa-times"></i></button>
            </div>
            <div className="video-container">
              <iframe 
                width="100%" height="500" 
                src={`https://www.youtube.com/embed/${trailerModal.videoId}?autoplay=1`} 
                title="Trailer" frameBorder="0" allowFullScreen
              ></iframe>
            </div>
          </div>
        </div>
      )}

      {/* 2. INFO MODAL */}
      {infoModal.isOpen && infoModal.movie && (
        <div className="modal active" onClick={closeInfo}>
          <div className="modal-content modal-md" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{infoModal.movie.cim || infoModal.movie.title} - Részletek</h3>
              <button className="close-modal" onClick={closeInfo}><i className="fas fa-times"></i></button>
            </div>
            <div className="info-layout">
              <div className="info-poster">
                <img src={infoModal.movie.poszter_url || infoModal.movie.poster} alt={infoModal.movie.cim || infoModal.movie.title} />
              </div>
              <div className="info-text">
                <h2>{infoModal.movie.cim || infoModal.movie.title}</h2>
                <div className="info-meta">
                    <span>{infoModal.movie.megjelenes_ev || infoModal.movie.year}</span>
                    <span>{infoModal.movie.rating} <i className="fas fa-star" style={{color:'#f5c518'}}></i></span>
                    <span>{infoModal.movie.kategoria || infoModal.movie.genre}</span>
                </div>
                <p className="info-desc">{infoModal.movie.leiras || infoModal.movie.description}</p>
                <div className="info-credits">
                    <p><strong>Rendező:</strong> {infoModal.movie.rendezo || infoModal.movie.director}</p>
                </div>
                <div className="info-actions">
                    <button className="btn-modal-action" onClick={() => openStreaming(infoModal.movie)}>
                        <i className="fas fa-play"></i> Megnézem most
                    </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. STREAMING & MOZI MODAL */}
      {streamingModal.isOpen && streamingModal.movie && (
        <div className="modal active" onClick={closeStreaming}>
          <div className="modal-content modal-sm" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Hol nézheted meg?</h3>
              <button className="close-modal" onClick={closeStreaming}><i className="fas fa-times"></i></button>
            </div>
            
            <div className="streaming-services-container" style={{ padding: '10px' }}>
              
              {/* --- STREAMING SZEKCIÓ --- */}
              {getPlatformList(streamingModal.movie).length > 0 && (
                <div className="platforms-section" style={{ marginBottom: getMoziList(streamingModal.movie).length > 0 ? '20px' : '0' }}>
                  <h4 style={{ fontSize: '14px', color: '#aaa', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '1px' }}>Streaming</h4>
                  <div className="streaming-services">
                    {getPlatformList(streamingModal.movie).map((platform, index) => {
                      const logoSrc = platform.logo || platform.logo_url;
                      const webUrl = platform.url || platform.weboldal_url;

                      return (
                        <div 
                            key={`plat-${index}`}
                            className="streaming-service" 
                            onClick={() => window.open(webUrl, '_blank')}
                        >
                            <div className="service-logo">
                                {logoSrc ? (
                                    <img src={logoSrc} alt={platform.nev} />
                                ) : (
                                    <i className="fas fa-tv"></i>
                                )}
                            </div>
                            <span>{platform.nev}</span>
                            <i className="fas fa-external-link-alt" style={{marginLeft:'auto', color:'#888'}}></i>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* --- MOZIK / HAMAROSAN SZEKCIÓ --- */}
{(() => {
  const ma = new Date('2026-03-10'); // Fix dátum a teszteléshez (a vizsga napja)
  const premier = streamingModal.movie.premier_datum ? new Date(streamingModal.movie.premier_datum) : null;
  const isJovobeli = premier && premier > ma;

  if (isJovobeli) {
    return (
      <div className="coming-soon-section" style={{ textAlign: 'center', padding: '20px', background: 'rgba(255,180,0,0.1)', borderRadius: '12px', border: '1px dashed #ffb400' }}>
        <h4 style={{ color: '#ffb400', marginBottom: '5px' }}><i className="fas fa-calendar-alt"></i> Hamarosan a mozikban!</h4>
        <p style={{ color: '#ccc', fontSize: '14px' }}>Várható premier: {new Date(streamingModal.movie.premier_datum).toLocaleDateString('hu-HU', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
      </div>
    );
  }

  // Ha már megjelent, akkor mutatjuk a mozikat (az eredeti kódod)
  if (getMoziList(streamingModal.movie).length > 0) {
    return (
      <div className="cinemas-section">
        <h4 style={{ fontSize: '14px', color: '#aaa', marginBottom: '10px', textTransform: 'uppercase' }}>Mozikban</h4>
        <div className="streaming-services">
          {getMoziList(streamingModal.movie).map((mozi, index) => (
            <div key={`mozi-${index}`} className="streaming-service" onClick={() => mozi.url && window.open(mozi.url, '_blank')}>
              <div className="service-logo" style={{ color: '#ffb400' }}><i className="fas fa-ticket-alt"></i></div>
              <div style={{ display: 'flex', flexDirection: 'column', marginLeft: '10px' }}>
                <span style={{ fontWeight: 'bold' }}>{mozi.nev}</span>
                <span style={{ fontSize: '12px', color: '#888' }}>{mozi.varos}</span>
              </div>
              <i className="fas fa-external-link-alt" style={{ marginLeft: 'auto', color: '#888' }}></i>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return null;
})()}
              {/* --- HA EGYIK SINCS --- */}
              {getPlatformList(streamingModal.movie).length === 0 && getMoziList(streamingModal.movie).length === 0 && (
                <p style={{textAlign: 'center', padding:'20px', color:'#ccc'}}>Nincs elérhető megtekintési adat ehhez a filmhez.</p>
              )}

            </div>
          </div>
        </div>
      )}
    </>
  );
}