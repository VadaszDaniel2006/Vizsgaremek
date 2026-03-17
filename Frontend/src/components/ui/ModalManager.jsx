import React, { useState, useEffect } from 'react';
import './Modal.css'; // <--- EZ A SOR KERÜLT BELE JAVÍTÁSKÉNT!

export default function ModalManager({ 
  trailerModal, closeTrailer, 
  infoModal, closeInfo, openStreaming,
  streamingModal, closeStreaming 
}) {

  const [liveMozik, setLiveMozik] = useState([]);
  const [liveStreaming, setLiveStreaming] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const isAnyModalOpen = trailerModal.isOpen || infoModal.isOpen || streamingModal.isOpen;
    if (isAnyModalOpen) {
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    };
  }, [trailerModal.isOpen, infoModal.isOpen, streamingModal.isOpen]);

  useEffect(() => {
    const fetchLiveAdatok = async () => {
      if (streamingModal.isOpen && streamingModal.movie) {
        setIsLoading(true);
        try {
          const mediaId = streamingModal.movie.id;
          const [mozikRes, streamingRes] = await Promise.all([
            fetch(`http://localhost:5000/api/mozik/${mediaId}/mozik`),
            fetch(`http://localhost:5000/api/mozik/${mediaId}/platformok`)
          ]);

          if (mozikRes.ok) setLiveMozik(await mozikRes.json());
          if (streamingRes.ok) setLiveStreaming(await streamingRes.json());
        } catch (error) {
          console.error("Hiba az élő adatok lekérésekor:", error);
        } finally {
          setIsLoading(false);
        }
      } else {
        setLiveMozik([]);
        setLiveStreaming([]);
      }
    };
    fetchLiveAdatok();
  }, [streamingModal.isOpen, streamingModal.movie]);

  return (
    <>
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

      {streamingModal.isOpen && streamingModal.movie && (
        <div className="modal active" onClick={closeStreaming}>
          <div className="modal-content modal-sm" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Hol nézheted meg?</h3>
              <button className="close-modal" onClick={closeStreaming}><i className="fas fa-times"></i></button>
            </div>
            
            <div className="streaming-services-container" style={{ padding: '10px' }}>
              
              {/* Nem blokkoljuk a felületet! Azonnal mutatjuk a streaminget, a mozi pedig csendben tölt be. */}
              <>
                  {isLoading && <p style={{textAlign: 'center', fontSize: '0.85rem', color:'#3e50ff', margin: '5px 0'}}><i className="fas fa-spinner fa-spin"></i> Élő moziműsor frissítése...</p>}
                  {(() => {
                    // Szigorú szűrő: Csak a valós, névvel rendelkező platformokat engedjük át!
                    const activePlatforms = (liveStreaming.length > 0 ? liveStreaming : (streamingModal.movie?.platform_lista || [])).filter(p => p && p.nev && p.nev.trim() !== '');
                    
                    if (activePlatforms.length > 0) {
                      return (
                        <div className="platforms-section" style={{ marginBottom: liveMozik.length > 0 ? '20px' : '0' }}>
                          <h4 style={{ fontSize: '14px', color: '#aaa', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '1px' }}>Streaming</h4>
                          <div className="streaming-services">
                            {activePlatforms.map((platform, index) => {
                              const logoSrc = platform.logo || platform.logo_url;
                              let webUrl = platform.url || platform.weboldal_url || platform.link || '#';
                              
                              if (webUrl !== '#' && !webUrl.startsWith('http://') && !webUrl.startsWith('https://')) {
                                  webUrl = 'https://' + webUrl;
                              }

                              return (
                                <div key={`plat-${index}`} className="streaming-service" onClick={(e) => { e.stopPropagation(); if (webUrl !== '#') window.open(webUrl, '_blank'); }}>
                                    <div className="service-logo">{logoSrc ? <img src={logoSrc} alt={platform.nev} /> : <i className="fas fa-tv"></i>}</div>
                                    <span>{platform.nev}</span>
                                    <i className="fas fa-external-link-alt" style={{marginLeft:'auto', color:'#888'}}></i>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    }
                    return null;
                  })()}

                  {(() => {
                    const ma = new Date();
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

                    if (liveMozik.length > 0) {
                      return (
                        <div className="cinemas-section">
                          <h4 style={{ fontSize: '14px', color: '#aaa', marginBottom: '10px', textTransform: 'uppercase' }}>Mozikban</h4>
                          <div className="streaming-services modern-scrollbar" style={{ maxHeight: '350px', overflowY: 'auto', paddingRight: '5px' }}>
                            {liveMozik.map((mozi, index) => {
                                // JAVÍTÁS: A '|' jel mentén kettévágjuk a kapott stringet
                                let nap = "Mai műsor";
                                let idopontokTomb = [];
                                
                                if (mozi.idopontok && mozi.idopontok.includes('|')) {
                                    const parts = mozi.idopontok.split('|');
                                    nap = parts[0];
                                    idopontokTomb = parts[1].split(',');
                                } else if (mozi.idopontok) {
                                    idopontokTomb = mozi.idopontok.split(',');
                                }

                                return (
                                  <div key={`mozi-${index}`} className="streaming-service" onClick={() => mozi.url && window.open(mozi.url, '_blank')} style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '10px' }}>
                                    
                                    <div style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                                        <div className="service-logo" style={{ color: '#ffb400', width: '25px', height: '25px' }}><i className="fas fa-ticket-alt"></i></div>
                                        <div style={{ display: 'flex', flexDirection: 'column', marginLeft: '10px' }}>
                                            <span style={{ fontWeight: 'bold' }}>{mozi.nev}</span>
                                            <span style={{ fontSize: '12px', color: '#888' }}>{mozi.varos}</span>
                                        </div>
                                        <i className="fas fa-external-link-alt" style={{ marginLeft: 'auto', color: '#888' }}></i>
                                    </div>
                                    
                                    {idopontokTomb.length > 0 && (
                                        <div style={{ paddingLeft: '35px', width: '100%' }}>
                                            <span style={{ fontSize: '11px', color: '#ffb400', textTransform: 'uppercase', letterSpacing: '1px', display: 'block', marginBottom: '6px' }}>{nap}</span>
                                            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                                                {idopontokTomb.map((time, idx) => (
                                                    <span key={idx} style={{ background: 'rgba(62, 80, 255, 0.2)', color: '#8c9eff', padding: '4px 10px', borderRadius: '4px', fontSize: '13px', fontWeight: 'bold', border: '1px solid rgba(62, 80, 255, 0.3)' }}>
                                                        {time.trim()}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                  </div>
                                );
                            })}
                          </div>
                        </div>
                      );
                    }
                    return null;
                  })()}

                  {(() => {
                    const activePlatforms = (liveStreaming.length > 0 ? liveStreaming : (streamingModal.movie?.platform_lista || [])).filter(p => p && p.nev && p.nev.trim() !== '');
                    const hasStreaming = activePlatforms.length > 0;
                    const hasCinema = liveMozik.length > 0;
                    const ma = new Date();
                    const premier = streamingModal.movie.premier_datum ? new Date(streamingModal.movie.premier_datum) : null;
                    const isJovobeli = premier && premier > ma;

                    if (!hasStreaming && !hasCinema && !isJovobeli) {
                      return (
                        <div style={{ textAlign: 'center', padding: '30px 20px', color: '#ccc', backgroundColor: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px dashed rgba(255,255,255,0.1)', marginTop: '10px' }}>
                            <i className="fas fa-video-slash" style={{ fontSize: '2.5rem', color: '#555', marginBottom: '15px' }}></i>
                            <h4 style={{ color: '#eee', marginBottom: '10px', fontSize: '1.2rem' }}>Ma már nem elérhető</h4>
                            <p style={{ fontSize: '0.95rem', lineHeight: '1.5', margin: 0 }}>Sajnos a mai napra már minden mozielőadás lement, és jelenleg egyetlen streaming platformon sem található meg.</p>
                        </div>
                      );
                    }
                    return null;
                  })()}
                </>
            </div>
          </div>
        </div>
      )}
    </>
  );
}