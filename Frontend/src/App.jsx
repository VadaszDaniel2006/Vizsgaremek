import { useState, useEffect, useCallback } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import Sidebar from './components/layout/Sidebar';
import HeroSlide from './components/layout/HeroSlide';

import MovieRow from './components/movies/MovieRow';
import ReviewsSidebar from './components/movies/ReviewsSidebar'; 

import AuthModal from './components/auth/AuthModal';
import ProfileEditor from './components/auth/ProfileEditor'; 

import ModalManager from './components/ui/ModalManager';
import Toast from './components/ui/Toast';
import ConfirmModal from './components/ui/ConfirmModal';
import AdminDashboard from './components/ui/AdminDashboard'; 

import Search from './pages/Search';
import MediaDetails from './pages/MediaDetails'; 
import Top50Page from './pages/Top50Page';
import WeeklyPick from './pages/WeeklyPick';
import CinemaMap from './pages/CinemaMap';

import Terms from './pages/Terms';
import Privacy from './pages/Privacy';
import Contact from './pages/Contact';
import HelpCenter from './pages/HelpCenter';

import './App.css'; 

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

  const fetchAllData = useCallback(async (currentUserId = '') => {
      const uid = typeof currentUserId === 'object' ? '' : currentUserId;
      try {
        const movieResponse = await fetch(`http://localhost:5000/api/filmek?userId=${uid}&random=true`, { cache: 'no-store' });
        const movieJson = await movieResponse.json();
        
        const seriesResponse = await fetch(`http://localhost:5000/api/sorozatok?userId=${uid}&random=true`, { cache: 'no-store' });
        const seriesJson = await seriesResponse.json();
        
        if(movieJson.data) { 
            setFeaturedMovies(movieJson.data.slice(0, 5)); 
            setMoviesData(movieJson.data.slice(5, 17)); 
        }
        if(seriesJson.data) { 
            setSeriesData(seriesJson.data.slice(0, 12)); 
        }
        setLoading(false); 
      } catch (error) { 
          console.error(error); 
          setLoading(false); 
      }
  }, []);

  useEffect(() => {
      const checkLoggedInUser = async () => {
          const token = localStorage.getItem('token');
          if (token) {
              try {
                  const res = await fetch('http://localhost:5000/api/auth/me', {
                      method: 'GET',
                      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }
                  });

                  if (res.ok) {
                      const data = await res.json();
                      setUser(data.user); 
                      fetchAllData(data.user.id);
                      return;
                  } else {
                      localStorage.removeItem('token');
                  }
              } catch (error) { console.error("Nem sikerült az auto-login:", error); }
          }
          fetchAllData('');
      };

      checkLoggedInUser();
  }, [fetchAllData]);

  useEffect(() => { if (featuredMovies.length === 0) return; const interval = setInterval(() => { setCurrentSlide((prev) => (prev + 1) % featuredMovies.length); }, 8000); return () => clearInterval(interval); }, [featuredMovies]);
  useEffect(() => { window.onscroll = () => setScrolled(window.pageYOffset > 50); return () => (window.onscroll = null); }, []);

  useEffect(() => {
      if (isSidebarOpen || reviewsSidebarOpen || authModalOpen || profileModalOpen || showLogoutConfirm) {
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
  }, [isSidebarOpen, reviewsSidebarOpen, authModalOpen, profileModalOpen, showLogoutConfirm]);

  const showNotification = (message, type = 'success') => { setToast({ message, type }); };
  
  const handleReviewChange = async () => { 
      setInteractionUpdate(prev => prev + 1); 
      
      const uid = user ? user.id : '';
      try {
          const [movieRes, seriesRes] = await Promise.all([
              fetch(`http://localhost:5000/api/filmek?userId=${uid}`, { cache: 'no-store' }),
              fetch(`http://localhost:5000/api/sorozatok?userId=${uid}`, { cache: 'no-store' })
          ]);
          
          const movieJson = await movieRes.json();
          const seriesJson = await seriesRes.json();

          if (movieJson.data) {
              setMoviesData(prev => prev.map(m => {
                  const friss = movieJson.data.find(fm => fm.id === m.id);
                  return friss ? { ...m, rating: friss.rating } : m;
              }));
              
              setFeaturedMovies(prev => prev.map(m => {
                  const friss = movieJson.data.find(fm => fm.id === m.id);
                  return friss ? { ...m, rating: friss.rating } : m;
              }));
          }
          
          if (seriesJson.data) {
              setSeriesData(prev => prev.map(s => {
                  const friss = seriesJson.data.find(fs => fs.id === s.id);
                  return friss ? { ...s, rating: friss.rating } : s;
              }));
          }
      } catch (error) {
          console.error("Nem sikerült frissíteni az értékeléseket:", error);
      }
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

  const openTrailer = (url, title) => {
      let videoId = url;

      if (url && url.includes('v=')) {
          videoId = url.split('v=')[1].substring(0, 11);
      } else if (url && url.includes('youtu.be/')) {
          videoId = url.split('youtu.be/')[1].substring(0, 11);
      } else if (url && url.includes('embed/')) {
          videoId = url.split('embed/')[1].substring(0, 11);
      }
      setTrailerModal({ isOpen: true, videoId, title });
  };
  
  const closeTrailer = () => setTrailerModal({ ...trailerModal, isOpen: false });
  const openStreaming = (movie) => { setInfoModal({ ...infoModal, isOpen: false }); setStreamingModal({ isOpen: true, movie }); };
  const closeStreaming = () => setStreamingModal({ ...streamingModal, isOpen: false });
  const openInfo = (movie) => setInfoModal({ isOpen: true, movie });
  const closeInfo = () => setInfoModal({ ...infoModal, isOpen: false });

  const handleSidebarItemClick = (partialItem) => {
      const realMediaId = partialItem.media_id || partialItem.film_id || partialItem.sorozat_id || partialItem.id || partialItem._id;
      const fullMovie = moviesData.find(m => m.id == realMediaId) || seriesData.find(s => s.id == realMediaId);
      
      if (fullMovie) {
          const mergedMovie = { ...fullMovie, ...partialItem, id: realMediaId };
          openInfo(mergedMovie);
      } else { 
          openInfo({ ...partialItem, id: realMediaId }); 
      }
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

  const handleLogin = (userData) => { 
      setUser(userData.user); 
      localStorage.setItem('token', userData.token); 
      showNotification(`Sikeres belépés! Üdv, ${userData.user.name}!`, 'success'); 
      setAuthModalOpen(false);
      fetchAllData(userData.user.id);
  };

  const handleUpdateProfile = (updatedData) => { 
      setUser(prev => ({ ...prev, ...updatedData })); 
      setProfileModalOpen(false); 
      showNotification('Profil sikeresen frissítve!', 'success'); 
  };

  const initiateLogout = () => { setShowLogoutConfirm(true); };

  const confirmLogout = () => { 
      setUser(null); 
      localStorage.removeItem('token'); 
      setShowLogoutConfirm(false); 
      showNotification('Sikeresen kijelentkeztél.', 'info'); 
      window.location.href = '/'; 
  };

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
                                        openReviews={openReviews}
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
            
            <Route path="/film/:id" element={<MediaDetails type="film" openStreaming={openStreaming} openTrailer={openTrailer} user={user} onAddToFav={handleAddToFav} onRemoveFromFav={handleRemoveFromFav} onAddToList={handleAddToMyList} onRemoveFromList={handleRemoveFromList} onOpenReviews={openReviews} interactionUpdate={interactionUpdate} />} />
            <Route path="/sorozat/:id" element={<MediaDetails type="sorozat" openStreaming={openStreaming} openTrailer={openTrailer} user={user} onAddToFav={handleAddToFav} onRemoveFromFav={handleRemoveFromFav} onAddToList={handleAddToMyList} onRemoveFromList={handleRemoveFromList} onOpenReviews={openReviews} interactionUpdate={interactionUpdate} />} />
            
            <Route path="/top-50-filmek" element={<Top50Page type="film" user={user} openStreaming={openStreaming} openTrailer={openTrailer} openReviews={openReviews} openInfo={openInfo} handleAddToFav={handleAddToFav} handleRemoveFromFav={handleRemoveFromFav} handleAddToMyList={handleAddToMyList} handleRemoveFromList={handleRemoveFromList} interactionUpdate={interactionUpdate} />} />
            <Route path="/top-50-sorozatok" element={<Top50Page type="sorozat" user={user} openStreaming={openStreaming} openTrailer={openTrailer} openReviews={openReviews} openInfo={openInfo} handleAddToFav={handleAddToFav} handleRemoveFromFav={handleRemoveFromFav} handleAddToMyList={handleAddToMyList} handleRemoveFromList={handleRemoveFromList} interactionUpdate={interactionUpdate} />} />

            <Route path="/heti-ajanlo" element={<WeeklyPick user={user} openStreaming={openStreaming} openTrailer={openTrailer} openReviews={openReviews} openInfo={openInfo} handleAddToFav={handleAddToFav} handleRemoveFromFav={handleRemoveFromFav} handleAddToMyList={handleAddToMyList} handleRemoveFromList={handleRemoveFromList} interactionUpdate={interactionUpdate} />} />
            <Route path="/mozik-terkep" element={<CinemaMap />} />
            <Route path="/kereses" element={<Search />} />
            <Route path="/admin" element={<AdminDashboard refreshApp={() => fetchAllData(user ? user.id : '')} />} />

            <Route path="/aszf" element={<Terms />} />
            <Route path="/adatvedelem" element={<Privacy />} />
            <Route path="/sugokozpont" element={<HelpCenter />} />
            <Route path="/kapcsolat" element={<Contact />} />
            
        </Routes>

        <Footer />

        <ModalManager trailerModal={trailerModal} closeTrailer={closeTrailer} infoModal={infoModal} closeInfo={closeInfo} streamingModal={streamingModal} closeStreaming={closeStreaming} openStreaming={openStreaming} />
        {authModalOpen && <AuthModal onClose={() => setAuthModalOpen(false)} onLogin={handleLogin} />}
        {profileModalOpen && user && <ProfileEditor user={user} onClose={() => setProfileModalOpen(false)} onSave={handleUpdateProfile} />}
        <ConfirmModal isOpen={showLogoutConfirm} onClose={() => setShowLogoutConfirm(false)} onConfirm={confirmLogout} title="Kijelentkezés" message="Biztosan ki szeretnél lépni a fiókodból?" />
        {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
        </div>
    </Router>
  );
}

export default App;