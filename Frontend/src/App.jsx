import { useState, useEffect, useCallback } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import Navbar from './components/Navbar';
import MovieRow from './components/MovieRow';
import ModalManager from './components/ModalManager';
import AuthModal from './components/AuthModal';
import Toast from './components/Toast';
import ConfirmModal from './components/ConfirmModal';
import Footer from './components/Footer';
import ProfilSzerkeszto from './components/ProfilSzerkeszto'; 
import Sidebar from './components/Sidebar';
import AdminDashboard from './components/AdminDashboard';
import ReviewsSidebar from './components/ReviewsSidebar'; 
import Kereses from './pages/Kereses';
import Adatlap from './pages/Adatlap'; 
import Top50Oldal from './pages/Top50Oldal';

import './App.css'; 

// --- HERO SLIDE ---
const HeroSlide = ({ movie, isActive, user, openStreaming, handleAddToFav, handleRemoveFromFav, handleAddToMyList, handleRemoveFromList, openTrailer, interactionUpdate }) => {
    const [status, setStatus] = useState({ favorite: false, listed: false });

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
                        <span className="rating-tag"><i className="fas fa-star"></i> {movie.rating}</span>
                        <span className="year-tag">{movie.megjelenes_ev}</span>
                        <span className="genre-tag">{movie.kategoria}</span>
                    </div>
                    <div className="description-block">
                        <p className="plot">{movie.leiras}</p>
                        <div className="credits"><p><strong>Rendező:</strong> {movie.rendezo}</p></div>
                    </div>
                    <div className="info-buttons">
                        <button className="btn-watch" onClick={() => openStreaming(movie)}><i className="fas fa-play"></i> Megnézem</button>
                        <button className="btn-watch" style={{ background: 'rgba(255,255,255,0.2)', marginLeft:'10px', ...(status.favorite ? activeStyle : {}) }} onClick={toggleFav}><i className="fas fa-heart"></i></button>
                        <button className="btn-watch" style={{ background: 'rgba(255,255,255,0.2)', marginLeft:'10px', ...(status.listed ? activeStyle : {}) }} onClick={toggleList}><i className="fas fa-plus"></i></button>
                    </div>
                </div>
                <div className="slide-right-image-frame">
                    <img src={movie.poszter_url} alt={movie.cim} />
                    <button className="play-btn-on-image" onClick={() => openTrailer(movie.elozetes_url, movie.cim)}><i className="fas fa-play"></i></button>
                </div>
            </div>
        </div>
    );
};

function App() {
  const [moviesData, setMoviesData] = useState([]);
  const [seriesData, setSeriesData] = useState([]);
  const [featuredMovies, setFeaturedMovies] = useState([]); 
  const [loading, setLoading] = useState(true); 
  const [currentSlide, setCurrentSlide] = useState(0);
  const [scrolled, setScrolled] = useState(false);
  const [user, setUser] = useState(null); 
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [toast, setToast] = useState(null); 
  const [trailerModal, setTrailerModal] = useState({ isOpen: false, videoId: '', title: '' });
  const [streamingModal, setStreamingModal] = useState({ isOpen: false, movie: null });
  const [infoModal, setInfoModal] = useState({ isOpen: false, movie: null });
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [sidebarType, setSidebarType] = useState('favorites'); 
  const [sidebarItems, setSidebarItems] = useState([]); 
  const [reviewsSidebarOpen, setReviewsSidebarOpen] = useState(false);
  const [reviewMovie, setReviewMovie] = useState(null); 
  const [interactionUpdate, setInteractionUpdate] = useState(0);

  const fetchAllData = useCallback(async () => {
      try {
        const movieResponse = await fetch('http://localhost:5000/api/filmek');
        const movieJson = await movieResponse.json();
        const seriesResponse = await fetch('http://localhost:5000/api/sorozatok');
        const seriesJson = await seriesResponse.json();
        if(movieJson.data) { setMoviesData(movieJson.data); setFeaturedMovies(movieJson.data.slice(0, 5)); }
        if(seriesJson.data) { setSeriesData(seriesJson.data); }
        setLoading(false); 
      } catch (error) { console.error(error); setLoading(false); showNotification("Nem sikerült kapcsolódni a szerverhez!", "info"); }
  }, []);

  useEffect(() => {
      const checkLoggedInUser = async () => {
          const token = localStorage.getItem('token');
          if (token) {
              try {
                  const res = await fetch('http://localhost:5000/api/auth/me', {
                      method: 'GET',
                      headers: {
                          'Content-Type': 'application/json',
                          'Authorization': `Bearer ${token}`
                      }
                  });

                  if (res.ok) {
                      const data = await res.json();
                      setUser(data.user); 
                  } else {
                      localStorage.removeItem('token');
                      setUser(null);
                  }
              } catch (error) {
                  console.error("Nem sikerült az auto-login:", error);
              }
          }
      };

      checkLoggedInUser();
  }, []);

  useEffect(() => { fetchAllData(); }, [fetchAllData]);
  useEffect(() => { if (featuredMovies.length === 0) return; const interval = setInterval(() => { setCurrentSlide((prev) => (prev + 1) % featuredMovies.length); }, 8000); return () => clearInterval(interval); }, [featuredMovies]);
  useEffect(() => { window.onscroll = () => setScrolled(window.pageYOffset > 50); return () => (window.onscroll = null); }, []);

  const showNotification = (message, type = 'success') => { setToast({ message, type }); };
  
  // --- JAVÍTVA: AZ ÉRTÉKELÉS LEADÁSAKOR FRISSÍT MINDENT ÉS NEM VILLOG ---
  const handleReviewChange = () => { 
      fetchAllData(); 
      setInteractionUpdate(prev => prev + 1); 
  };

  const fetchSidebarData = async (type) => {
      if (!user) return;
      const endpoint = type === 'favorites' ? 'favorites' : 'mylist';
      try {
          const res = await fetch(`http://localhost:5000/api/interactions/users/${user.id}/${endpoint}`);
          if (!res.ok) throw new Error("Szerver hiba");
          const data = await res.json();
          setSidebarItems(Array.isArray(data) ? data : []);
      } catch (err) { setSidebarItems([]); }
  };

  const openSidebar = (type) => { setSidebarType(type); setIsSidebarOpen(true); fetchSidebarData(type); };

  const handleDeleteItem = async (itemId) => {
      if (!user) return;
      const endpoint = sidebarType === 'favorites' ? 'favorite' : 'mylist';
      try {
          const response = await fetch(`http://localhost:5000/api/interactions/${endpoint}`, {
              method: 'DELETE', headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ userId: user.id, itemId })
          });
          if(response.ok) { 
              fetchSidebarData(sidebarType); 
              showNotification("Sikeres törlés.", "success");
              setInteractionUpdate(prev => prev + 1);
          } else { showNotification("Hiba a törléskor.", "error"); }
      } catch (err) { showNotification("Szerver hiba.", "error"); }
  };

  const openReviews = (movie) => { setReviewMovie(movie); setReviewsSidebarOpen(true); };
  const openTrailer = (videoId, title) => setTrailerModal({ isOpen: true, videoId, title });
  const closeTrailer = () => setTrailerModal({ ...trailerModal, isOpen: false });
  const openStreaming = (movie) => { setInfoModal({ ...infoModal, isOpen: false }); setStreamingModal({ isOpen: true, movie }); };
  const closeStreaming = () => setStreamingModal({ ...streamingModal, isOpen: false });
  const openInfo = (movie) => setInfoModal({ isOpen: true, movie });
  const closeInfo = () => setInfoModal({ ...infoModal, isOpen: false });

  const handleSidebarItemClick = (partialItem) => {
      const fullMovie = moviesData.find(m => m.id == partialItem.id) || seriesData.find(s => s.id == partialItem.id);
      if (fullMovie) {
          const mergedMovie = { ...fullMovie, platformok: (partialItem.platformok && partialItem.platformok.length > 0) ? partialItem.platformok : fullMovie.platformok };
          openInfo(mergedMovie);
      } else { openInfo(partialItem); }
  };

  const handleAddToFav = async (movie) => {
    if (!user) { showNotification("Jelentkezz be a kedvencekhez!", "info"); setAuthModalOpen(true); return; }
    const isSeries = movie.evadok_szama !== undefined || movie.sorozat_id !== undefined;
    const contentId = movie.id || movie._id;
    try {
      const response = await fetch('http://localhost:5000/api/interactions/favorite', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, filmId: !isSeries ? contentId : null, sorozatId: isSeries ? contentId : null })
      });
      if (response.ok) {
          showNotification("Hozzáadva a kedvencekhez!", "success");
          setInteractionUpdate(prev => prev + 1); 
      }
    } catch (error) { showNotification("Hiba mentéskor.", "info"); }
  };

  const handleAddToMyList = async (movie) => {
    if (!user) { showNotification("Jelentkezz be a lista kezeléséhez!", "info"); setAuthModalOpen(true); return; }
    const isSeries = movie.evadok_szama !== undefined || movie.sorozat_id !== undefined;
    const contentId = movie.id || movie._id;
    try {
        const response = await fetch('http://localhost:5000/api/interactions/mylist', {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: user.id, filmId: !isSeries ? contentId : null, sorozatId: isSeries ? contentId : null })
        });
        if (response.ok) {
            showNotification("Hozzáadva a listához!", "success");
            setInteractionUpdate(prev => prev + 1); 
        }
    } catch (error) { showNotification("Hiba mentéskor.", "error"); }
  };

  const handleRemoveFromFav = async (movie) => {
      if (!user) return;
      const isSeries = movie.evadok_szama !== undefined || movie.sorozat_id !== undefined;
      const contentId = movie.id || movie._id;
      try {
          const response = await fetch('http://localhost:5000/api/interactions/favorite', {
              method: 'DELETE', headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ userId: user.id, filmId: !isSeries ? contentId : null, sorozatId: isSeries ? contentId : null })
          });
          if(response.ok) {
              showNotification("Sikeres törlés.", "success");
              setInteractionUpdate(prev => prev + 1); 
          } else showNotification("Hiba törléskor.", "error");
      } catch (error) { showNotification("Szerver hiba.", "error"); }
  };

  const handleRemoveFromList = async (movie) => {
      if (!user) return;
      const isSeries = movie.evadok_szama !== undefined || movie.sorozat_id !== undefined;
      const contentId = movie.id || movie._id;
      try {
          const response = await fetch('http://localhost:5000/api/interactions/mylist', {
              method: 'DELETE', headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ userId: user.id, filmId: !isSeries ? contentId : null, sorozatId: isSeries ? contentId : null })
          });
          if(response.ok) {
              showNotification("Sikeres törlés.", "success");
              setInteractionUpdate(prev => prev + 1); 
          } else showNotification("Hiba törléskor.", "error");
      } catch (error) { showNotification("Szerver hiba.", "error"); }
  };

  const handleLogin = (userData) => { setUser(userData.user); localStorage.setItem('token', userData.token); showNotification(`Sikeres belépés! Üdv, ${userData.user.name}!`, 'success'); };
  const handleUpdateProfile = (updatedData) => { setUser(prev => ({ ...prev, ...updatedData })); setProfileModalOpen(false); showNotification('Profil sikeresen frissítve!', 'success'); };
  const initiateLogout = () => { setShowLogoutConfirm(true); };
  const confirmLogout = () => { setUser(null); localStorage.removeItem('token'); setShowLogoutConfirm(false); showNotification('Sikeresen kijelentkeztél.', 'info'); window.location.href = '/'; };
  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % featuredMovies.length);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + featuredMovies.length) % featuredMovies.length);

  if (loading) return <div style={{ height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', background: '#0b0f2b', color: 'white' }}><h2>Betöltés...</h2></div>;

  return (
    <Router>
        <div className="page">
        <Navbar scrolled={scrolled} user={user} onOpenAuth={() => setAuthModalOpen(true)} onLogout={initiateLogout} onUpdateProfile={() => setProfileModalOpen(true)} onOpenFavorites={() => openSidebar('favorites')} onOpenMyList={() => openSidebar('mylist')} />
        
        <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} title={sidebarType === 'favorites' ? "Kedvenceim" : "Saját listám"} items={sidebarItems} onDeleteItem={handleDeleteItem} onItemClick={handleSidebarItemClick} />

        <ReviewsSidebar isOpen={reviewsSidebarOpen} onClose={() => setReviewsSidebarOpen(false)} movie={reviewMovie} user={user} onShowNotification={showNotification} onRefreshData={handleReviewChange} />

        <Routes>
            <Route path="/" element={
                <main>
                    {featuredMovies.length > 0 && (
                        <section className="featured-section">
                             <button className="slider-arrow left" onClick={prevSlide}><i className="fas fa-chevron-left"></i></button>
                            <div className="slider-container">
                                {featuredMovies.map((movie, index) => (
                                    <HeroSlide 
                                        key={movie.id} 
                                        movie={movie} 
                                        isActive={index === currentSlide}
                                        user={user}
                                        openStreaming={openStreaming}
                                        handleAddToFav={handleAddToFav}
                                        handleRemoveFromFav={handleRemoveFromFav}
                                        handleAddToMyList={handleAddToMyList}
                                        handleRemoveFromList={handleRemoveFromList}
                                        openTrailer={openTrailer}
                                        interactionUpdate={interactionUpdate} 
                                    />
                                ))}
                            </div>
                            <button className="slider-arrow right" onClick={nextSlide}><i className="fas fa-chevron-right"></i></button>
                        </section>
                    )}
                    <div className="content-container">
                        {moviesData.length > 0 && ( 
                            <MovieRow 
                                title="Népszerű filmek" 
                                items={moviesData} 
                                user={user} 
                                onOpenTrailer={openTrailer} 
                                onOpenStreaming={openStreaming} 
                                onOpenInfo={openInfo} 
                                onAddToFav={handleAddToFav} 
                                onRemoveFromFav={handleRemoveFromFav}
                                onAddToList={handleAddToMyList} 
                                onRemoveFromList={handleRemoveFromList}
                                onOpenReviews={openReviews}
                                interactionUpdate={interactionUpdate} 
                            /> 
                        )}
                         {seriesData.length > 0 && ( 
                            <MovieRow 
                                title="Népszerű sorozatok" 
                                items={seriesData} 
                                user={user} 
                                isSeries={true} 
                                onOpenTrailer={openTrailer} 
                                onOpenStreaming={openStreaming} 
                                onOpenInfo={openInfo} 
                                onAddToFav={handleAddToFav} 
                                onRemoveFromFav={handleRemoveFromFav}
                                onAddToList={handleAddToMyList} 
                                onRemoveFromList={handleRemoveFromList}
                                onOpenReviews={openReviews}
                                interactionUpdate={interactionUpdate} 
                            /> 
                        )}
                    </div>
                </main>
            } />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/kereses" element={<Kereses />} />
            
            {/* --- ADATLAP ÚTVONALAK --- */}
            <Route path="/film/:id" element={
                <Adatlap 
                    type="film" 
                    openStreaming={openStreaming} 
                    openTrailer={openTrailer}
                    user={user}
                    onAddToFav={handleAddToFav}
                    onRemoveFromFav={handleRemoveFromFav}
                    onAddToList={handleAddToMyList}
                    onRemoveFromList={handleRemoveFromList}
                    onOpenReviews={openReviews}
                    interactionUpdate={interactionUpdate}
                />
            } />
            <Route path="/sorozat/:id" element={
                <Adatlap 
                    type="sorozat" 
                    openStreaming={openStreaming} 
                    openTrailer={openTrailer}
                    user={user}
                    onAddToFav={handleAddToFav}
                    onRemoveFromFav={handleRemoveFromFav}
                    onAddToList={handleAddToMyList}
                    onRemoveFromList={handleRemoveFromList}
                    onOpenReviews={openReviews}
                    interactionUpdate={interactionUpdate}
                />
            } />
            
            {/* --- TOP 50 ÚTVONALAK --- */}
            <Route path="/top-50-filmek" element={
                <Top50Oldal 
                    type="film" 
                    user={user} 
                    openStreaming={openStreaming} 
                    openTrailer={openTrailer}
                    openReviews={openReviews}
                    handleAddToFav={handleAddToFav} 
                    handleRemoveFromFav={handleRemoveFromFav} 
                    handleAddToMyList={handleAddToMyList} 
                    handleRemoveFromList={handleRemoveFromList} 
                    interactionUpdate={interactionUpdate} 
                />
            } />
            <Route path="/top-50-sorozatok" element={
                <Top50Oldal 
                    type="sorozat" 
                    user={user} 
                    openStreaming={openStreaming} 
                    openTrailer={openTrailer}
                    openReviews={openReviews}
                    handleAddToFav={handleAddToFav} 
                    handleRemoveFromFav={handleRemoveFromFav} 
                    handleAddToMyList={handleAddToMyList} 
                    handleRemoveFromList={handleRemoveFromList} 
                    interactionUpdate={interactionUpdate} 
                />
            } />
            
        </Routes>

        <Footer />
        <ModalManager trailerModal={trailerModal} closeTrailer={closeTrailer} infoModal={infoModal} closeInfo={closeInfo} streamingModal={streamingModal} closeStreaming={closeStreaming} openStreaming={openStreaming} />
        {authModalOpen && <AuthModal onClose={() => setAuthModalOpen(false)} onLogin={handleLogin} />}
        {profileModalOpen && user && <ProfilSzerkeszto user={user} onClose={() => setProfileModalOpen(false)} onSave={handleUpdateProfile} />}
        <ConfirmModal isOpen={showLogoutConfirm} onClose={() => setShowLogoutConfirm(false)} onConfirm={confirmLogout} title="Kijelentkezés" message="Biztosan ki szeretnél lépni a fiókodból?" />
        {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
        </div>
    </Router>
  );
}

export default App;